// Build one skill package's `resources/` directory from its skill package.
//
// Each skill package ships a `resources/` tree that holds, per skill, the union
// of every file that skill needs: its body, its own references, and the
// references it cites by another skill's name. Two files per skill:
//
//   resources/<name>.md          body + `resources:` header naming cited own files
//   resources/<name>~resources.md  the shared resource directory (care of), if any
//
// The install-time rebuild (scripts/install.mjs) writes those files from the
// sources named in `build.json`, which is the only place a package knows where
// its skill package lives. A registry install, where the skill package may be
// absent, keeps the committed copy, so the committed tree must stay current:
// `node scripts/build-resources.mjs` regenerates it and the contract test
// compares the two.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Packages that teach skills, in the order their shared resource directories are searched. */
export const SKILL_PACKAGES = ['learn', 'math-common', 'math-primary-low', 'math-primary-high', 'chinese-reading', 'english']

// `ENGLISH_SKILL` → `english-skill`: a cited `name: file` pair becomes one file name.
const encode = (skill, file) => `${skill}~${file}`

/**
 * `skill, file` pairs a body cites through another skill's name, in citation order,
 * without duplicates. Two forms count, because both read as a citation to an author:
 *
 *   `learn-data` `references/session-schema.md`   backticked name, then the path
 *   [session structure](../learn-data/references/session-schema.md)   ordinary link
 *
 * The second form was silently dropped, so its target never got inlined and the
 * rendered resource kept a `../` path that does not exist after rendering.
 */
export function citedFiles(body) {
  const pairs = []
  for (const match of body.matchAll(
    /`([a-z0-9]+(?:-[a-z0-9]+)*)`\s*`?references\/([A-Za-z0-9_.-]+\.md)`?|\((?:\.\.\/)?([a-z0-9]+(?:-[a-z0-9]+)*)\/references\/([A-Za-z0-9_.-]+\.md)\)/g,
  )) {
    const owner = match[1] ?? match[3]
    const file = match[2] ?? match[4]
    const key = encode(owner, file)
    if (!pairs.some(([pair]) => pair === key)) pairs.push([key, owner, file])
  }
  return pairs
}

/** A skill's own reference files its body cites by bare name, in citation order. */
export function citedOwn(body) {
  const files = []
  for (const match of body.matchAll(/`?references\/([A-Za-z0-9_.-]+\.md)`?/g)) {
    if (!files.includes(match[1])) files.push(match[1])
  }
  return files
}

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
 * @param referenceDirectories - directories searched, in order, for cited files the skill does not own.
 * @returns `{ body, shared }` file texts, or undefined when a cited file cannot be found.
 */
export function flattenSkill(skillDirectory, referenceDirectories) {
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
  for (const [pair, owner, file] of citedFiles(body)) {
    const directory = referenceDirectories.find((candidate) => existsSync(join(candidate, owner, 'references', file)))
    if (directory === undefined) continue
    const name = resources.includes(file) ? `${owner}/${file}` : file
    if (!resources.includes(name)) resources.push(name)
    sharedFiles.push([name, `${header({ cited: `${owner}/references/${file}` })}\n${readFileSync(join(directory, owner, 'references', file), 'utf8').trim()}\n`])
  }
  const ownFiles = [...new Set(ownExisting)]
  const headerFields = { name: fields.name, description: fields.description }
  if (resources.length > 0) headerFields.resources = resources
  // One file per listed resource. A skill's own file wins a name collision, so
  // shared files never overwrite it; only `resources` decides what is inlined.
  const files = new Map(sharedFiles.map(([name, text]) => [name, text]))
  for (const name of ownFiles) files.set(name, readFileSync(join(skillDirectory, 'references', name), 'utf8').trim() + '\n')
  return { body: `${header(headerFields)}${body}`, shared: [...files] }
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
    files.set(`resources/${entry.name}.md`, flattened.body)
    for (const [name, text] of flattened.shared) files.set(`resources/${name}`, text)
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
    const { files } = buildResources(packageName)
    console.log(`${packageName}: ${files.size} files`)
  }
}
