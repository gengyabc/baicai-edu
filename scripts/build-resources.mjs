// Build one skill package's `resources/` directory from its skill package.
//
// Each skill package ships a `resources/` tree that holds, per skill, the union
// of every file that skill needs: its body, its own references, and the
// references it cites by another skill's name:
//
//   resources/<name>.md              body + `resources:` header naming cited files
//   resources/references/<file>.md    one file per cited reference
//   resources/references/locales/     locale catalogs, as their prose cites them
//
// Reference files keep the `references/` segment their prose cites, so a body
// path resolves literally against the base directory the provider publishes.
//
// The install-time rebuild (scripts/install.mjs) writes those files from the
// sources named in `build.json`, which is the only place a package knows where
// its skill package lives. A registry install, where the skill package may be
// absent, keeps the committed copy, so the committed tree must stay current:
// `node scripts/build-resources.mjs` regenerates it and the contract test
// compares the two.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Packages that teach skills, in the order their shared resource directories are searched. */
export const SKILL_PACKAGES = ['learn', 'math-common', 'math-primary-low', 'math-primary-high', 'chinese-reading', 'english']

/** Skill directories under one reference root that ship `references/<file>`. */
function ownersOf(file, index) {
  return [...index].filter(([, directory]) => existsSync(join(directory, file))).map(([owner]) => owner)
}

/**
 * `owner → references directory` for every root `build.json` names.
 *
 * `skillResources` entries are not all the same shape: `learn/skills` is a directory
 * of skill directories, while `math-common/skills/math-common/references` is one
 * skill's references directory itself. Treating the second as the first silently
 * lost every `math-common` contract the math bands cite.
 * @returns `Map<string, string>` in search order; the first root wins a name.
 */
export function referenceIndex(referenceDirectories) {
  const index = new Map()
  for (const directory of referenceDirectories) {
    if (!existsSync(directory)) continue
    if (basename(directory) === 'references') {
      const owner = basename(dirname(directory))
      if (!index.has(owner)) index.set(owner, directory)
      continue
    }
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const references = join(directory, entry.name, 'references')
      if (existsSync(references) && !index.has(entry.name)) index.set(entry.name, references)
    }
  }
  return index
}

/**
 * `[owner, file]` for every `references/<file>.md` a body cites from another skill,
 * in citation order, without duplicates.
 *
 * A body names the owning skill in whatever prose shape reads best, so the owner is
 * not reliably adjacent to the path. All of these are in use:
 *
 *   `learn-data` `references/session-schema.md`     backticked name, then the path
 *   `learn-data`'s `references/session-schema.md`   possessive
 *   `learn-core` 的 `references/pedagogy-core.md`    Chinese possessive
 *   `learn-core` | `references/pedagogy-core.md`    a table cell's two columns
 *   read its `references/micro-lesson-contract.md`  a pronoun, owner named earlier
 *   [structure](../learn-data/references/x.md)      ordinary link
 *
 * Every narrower form that was tried here missed some of them, and a miss is silent:
 * the file is neither inlined nor copied, so the installed skill cites a path that
 * does not exist. Resolution is therefore by owner *and* by search — the nearest
 * earlier skill name that actually owns the file wins, and a file with exactly one
 * owner in the search path needs no name at all. An unresolvable citation is
 * reported instead of dropped.
 * @returns `{ pairs, problems }`; `problems` names citations no owner could supply.
 */
export function sharedCitations(body, ownFiles, index) {
  const pairs = []
  const problems = []
  for (const match of body.matchAll(/`?references\/([A-Za-z0-9_.-]+\.md)`?/g)) {
    const file = match[1]
    if (ownFiles.includes(file) || pairs.some(([, cited]) => cited === file)) continue
    const candidates = ownersOf(file, index)
    const named = [...body.slice(Math.max(0, match.index - 200), match.index)
      .matchAll(/`([a-z0-9]+(?:-[a-z0-9]+)*)`/g)].map((token) => token[1]).reverse()
    const owner = named.find((name) => candidates.includes(name)) ?? (candidates.length === 1 ? candidates[0] : undefined)
    if (owner === undefined) {
      problems.push(`references/${file}: no owner (candidates: ${candidates.join(', ') || 'none'})`)
      continue
    }
    pairs.push([owner, file])
  }
  return { pairs, problems }
}

/** A skill's own reference files its body cites by bare name, in citation order. */
export function citedOwn(body) {
  const files = []
  for (const match of body.matchAll(/`?references\/([A-Za-z0-9_.-]+\.md)`?/g)) {
    if (!files.includes(match[1])) files.push(match[1])
  }
  return files
}

/**
 * Optional frontmatter keys the rendered header must carry through.
 *
 * `skills/` frontmatter is not what an installed package reads: the provider
 * registers each skill from `resources/<name>.md` and reads these keys back
 * from that header. A dropped key fails silently — invocation keys widened the
 * surface (every internal skill became user-invocable and every user-only entry
 * model-loadable), and `when-to-use` would simply never reach the catalog.
 */
export const CARRIED_KEYS = ['user-invocable', 'disable-model-invocation', 'when-to-use']

const header = (fields) => ['---', ...Object.entries(fields).flatMap(([key, value]) => (
  Array.isArray(value) ? (value.length === 0 ? [] : [`${key}: ${value.join(' ')}`]) : [`${key}: ${value}`]
)), '---', ''].join('\n')

/**
 * Locale catalogs a skill ships, as `references/locales/<locale>.json`.
 *
 * Prose inlines fine, but a catalog is JSON data a skill must *look up*, not
 * read as instructions: inlining it would spend context on every key and still
 * leave the model parsing a document. It therefore ships as a file beside the
 * rendered skill, at the same relative path the prose cites, and the provider
 * publishes `resources/` as the skill's base directory.
 * @param skillDirectory - the skill's directory under a skill package's `skills/`.
 * @returns `[path under resources/, text]` pairs, sorted by file name.
 */
export function localeCatalogs(skillDirectory) {
  const directory = join(skillDirectory, 'references', 'locales')
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name)
    .sort()
    .map((name) => [`references/locales/${name}`, readFileSync(join(directory, name), 'utf8')])
}

/**
 * Flatten one skill directory into its two resource files.
 * @param skillDirectory - the skill's directory under a skill package's `skills/`.
 * @param referenceDirectories - roots searched, in order, for cited files the skill does not own.
 * @returns `{ body, shared, problems }`; `problems` lists citations no owner could supply.
 */
export function flattenSkill(skillDirectory, referenceDirectories) {
  const index = referenceIndex(referenceDirectories)
  const text = readFileSync(join(skillDirectory, 'SKILL.md'), 'utf8')
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(text)
  if (match === null) throw new Error(`${skillDirectory}/SKILL.md: missing frontmatter`)
  const fields = {}
  for (const line of match[1].split('\n')) {
    const entry = /^([\w-]+):\s*(.*)$/.exec(line)
    if (entry !== null) fields[entry[1]] = entry[2].trim().replace(/^["']|["']$/g, '')
  }
  const body = text.slice(match[0].length)
  const own = citedOwn(body).filter((name) => /^[A-Za-z0-9_.-]+\.md$/.test(name))
  // A shared file is listed under its own `<file>.md` name, or under
  // `skill/file.md` when the skill ships a file of the same name.
  const ownExisting = own.filter((name) => existsSync(join(skillDirectory, 'references', name)))
  const resources = [...new Set(ownExisting)]
  const sharedFiles = []
  const { pairs, problems } = sharedCitations(body, ownExisting, index)
  for (const [owner, file] of pairs) {
    const name = resources.includes(file) ? `${owner}/${file}` : file
    if (!resources.includes(name)) resources.push(name)
    sharedFiles.push([name, `${header({ cited: `${owner}/references/${file}` })}\n${readFileSync(join(index.get(owner), file), 'utf8').trim()}\n`])
  }
  const ownFiles = [...new Set(ownExisting)]
  const headerFields = { name: fields.name, description: fields.description }
  for (const key of CARRIED_KEYS) {
    if (fields[key] !== undefined) headerFields[key] = fields[key]
  }
  if (resources.length > 0) {
    headerFields.resources = resources
    if (fields['resource-loading'] === 'on-demand') headerFields['resource-loading'] = 'on-demand'
  }
  // One file per listed resource. A skill's own file wins a name collision, so
  // shared files never overwrite it; only `resources` decides what is inlined.
  const files = new Map(sharedFiles.map(([name, text]) => [name, text]))
  for (const name of ownFiles) files.set(name, readFileSync(join(skillDirectory, 'references', name), 'utf8').trim() + '\n')
  return { body: `${header(headerFields)}${body.trimEnd()}\n`, shared: [...files], problems }
}

/**
 * Build a package's `resources/` tree.
 * @param packageName - the package's published name, as in its `build.json`.
 * @param options.root - repository root (defaults to this checkout).
 * @param options.write - `false` renders in memory and writes nothing.
 * @returns `{ files: Map<relativePath, text>, problems: string[] }`.
 */
export function buildResources(packageName, { root = ROOT, write = true } = {}) {
  const directory = SKILL_PACKAGES.find((name) => {
    const manifest = join(root, name, 'package.json')
    return existsSync(manifest) && JSON.parse(readFileSync(manifest, 'utf8')).name === packageName
  })
  if (directory === undefined) throw new Error(`${packageName}: not a skill package of this checkout`)
  const config = JSON.parse(readFileSync(join(root, directory, 'build.json'), 'utf8'))
  const source = resolve(root, config.skills)
  // A skill may also cite a sibling skill in the same package (`learn-data` from
  // `learn-support`), so that package's own skills tree is always searched last.
  const shared = [...config.skillResources.map((path) => resolve(root, path)), source]
  const files = new Map()
  const problems = []
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const flattened = flattenSkill(join(source, entry.name), shared)
    problems.push(...flattened.problems.map((problem) => `${entry.name}: ${problem}`))
    files.set(`resources/${entry.name}.md`, flattened.body)
    for (const [name, text] of flattened.shared) files.set(`resources/references/${name}`, text)
    // Catalogs keep the path their prose cites, so one base directory resolves
    // them. Two skills of one package owning the same catalog file would make
    // that path ambiguous: fail loudly instead of shipping one of them.
    for (const [name, text] of localeCatalogs(join(source, entry.name))) {
      const path = `resources/${name}`
      const existing = files.get(path)
      if (existing !== undefined && existing !== text) throw new Error(`${path}: shipped by more than one skill of ${packageName}`)
      files.set(path, text)
    }
  }
  if (write) {
    const target = join(root, directory, 'resources')
    rmSync(target, { recursive: true, force: true })
    mkdirSync(target, { recursive: true })
    for (const [relative, text] of files) {
      mkdirSync(join(root, directory, relative, '..'), { recursive: true })
      writeFileSync(join(root, directory, relative), text)
    }
  }
  return { files, problems }
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const requested = process.argv.slice(2)
  const names = requested.length === 0
    ? SKILL_PACKAGES.map((directory) => JSON.parse(readFileSync(join(ROOT, directory, 'package.json'), 'utf8')).name)
    : requested
  for (const packageName of names) {
    const { files, problems } = buildResources(packageName)
    for (const problem of problems) console.warn(`warn  ${packageName}: ${problem}`)
    console.log(`${packageName}: ${files.size} files`)
  }
}
