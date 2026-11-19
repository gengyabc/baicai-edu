import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

import { readPackage, renderSkill } from '../learn/lib/skill-resources.mjs'
import { referenceIndex, sharedCitations } from './build-resources.mjs'
import { apply, MAX_CONTENT_BYTES } from '../learn/skill-provider.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const bundles = ['learn', 'math-common', 'math-primary-low', 'math-primary-high', 'chinese-reading', 'english']

// The installed tree has no `references/` directory for prose files, so a body
// path of `references/<name>.md` only resolves if the rendered skill says what
// it points at. These tests guard that statement and the truncation message
// that depends on it; they do not check any teaching content.
const layoutNote = /`references\/<name>\.md` path below is the installed `<name>\.md`/
const listedResources = (text) => /^resources: (.+)$/m.exec(text)?.[1].split(/\s+/).filter(Boolean) ?? []

test('every skill that names resources tells the model where they are installed', () => {
  for (const bundle of bundles) {
    for (const entry of readPackage(join(root, bundle))) {
      const listed = listedResources(readFileSync(join(root, bundle, 'resources', `${entry.name}.md`), 'utf8'))
      if (listed.length === 0) continue
      assert.match(entry.content, layoutNote, `${bundle}/${entry.name} lacks the installed-layout note`)
      // The note has to precede the inlined sections it describes.
      const sectionsAt = entry.content.indexOf('## Skill resources')
      if (sectionsAt !== -1) assert.ok(
        entry.content.indexOf('This skill\'s base directory holds every file') < sectionsAt,
        `${bundle}/${entry.name}: the layout note must come before the resource sections`,
      )
    }
  }
})

test('the layout note names each inlined resource and its installed path', () => {
  const skill = renderSkill(join(root, 'learn', 'resources', 'learn-general-core.md'))
  assert.match(skill.content, layoutNote)
  for (const name of ['teaching-resolver', 'general-contract']) {
    assert.match(skill.content, new RegExp(`### ${name}\\n`), `learn-data should inline ${name}`)
    assert.ok(
      readFileSync(join(root, 'learn', 'resources', `${name}.md`), 'utf8').length > 0,
      `${name}.md must be installed beside the base directory`,
    )
  }
})

test('a skill with no resources carries no layout note', () => {
  const dir = mkdtempSync(join(tmpdir(), 'skill-resources-'))
  try {
    mkdirSync(join(dir, 'resources'))
    writeFileSync(join(dir, 'resources', 'bare.md'), [
      '---', 'name: bare', 'description: no resources', '---', '', '# Bare', '', 'Body only.', '',
    ].join('\n'))
    const [skill] = readPackage(dir)
    assert.equal(skill.name, 'bare')
    assert.doesNotMatch(skill.content, layoutNote)
    assert.doesNotMatch(skill.content, /## Skill resources/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

// Keep the installed-path promise even when a skill opts out of inlining.
test('every cited reference is installed beside the base directory and inlined by default', () => {
  const unaccounted = []
  for (const bundle of bundles) {
    for (const entry of readPackage(join(root, bundle))) {
      const [body, sections = ''] = entry.content.split('## Skill resources')
      const file = join(root, bundle, 'resources', `${entry.name}.md`)
      const onDemand = /^resource-loading: on-demand$/m.test(readFileSync(file, 'utf8'))
      for (const name of new Set([...body.matchAll(/references\/([A-Za-z0-9_.-]+\.md)/g)].map((m) => m[1]))) {
        const installed = existsSync(join(root, bundle, 'resources', name))
        const inlined = sections.includes(`### ${name.replace(/\.md$/, '')}\n`)
        if (!installed || inlined === onDemand) unaccounted.push(`${bundle}/${entry.name} -> ${name} (installed: ${installed}, inlined: ${inlined}, on demand: ${onDemand})`)
      }
    }
  }
  assert.deepEqual(unaccounted, [])
})

test('upper-primary core loads only its routing rules and ships its branch references', () => {
  const dir = join(root, 'math-primary-high', 'resources')
  const file = join(dir, 'math-high-core.md')
  const skill = renderSkill(file)
  assert.match(skill.content, /For a subject-contract lookup, read only the requested role/)
  assert.doesNotMatch(skill.content, /## Skill resources|left out of this prompt/)
  assert.ok(Buffer.byteLength(skill.content, 'utf8') < 16 * 1024)
  const listed = listedResources(readFileSync(file, 'utf8'))
  for (const name of ['math-teaching-core.md', 'proof-teaching.md', 'learning-recommendations.md', 'math-language-contract.md']) {
    assert.ok(listed.includes(name), `${name} must be shipped by the core`)
  }
  const source = join(root, 'math-primary-high', 'skills', 'math-high-core', 'references')
  for (const name of readdirSync(source).filter((name) => name.endsWith('.md'))) {
    const installed = readFileSync(join(dir, name), 'utf8')
    const citation = `---\ncited: math-high-core/references/${name}\n---\n`
    const body = installed.startsWith(citation) ? installed.slice(citation.length) : installed
    assert.equal(body.trim(), readFileSync(join(source, name), 'utf8').trim(), name)
  }
  const registered = []
  apply({
    logger: { info() {}, warn() {} },
    skills: { register(entry) { registered.push(entry) } },
    effect(register) { for (const _ of register()) { /* drain registrations */ } },
  }, { packages: [join(dir, '..', 'package.json')] })
  const core = registered.find((entry) => entry.name === 'math-high-core')
  assert.equal(core.content, skill.content)
  assert.deepEqual(core.resourceBase, { kind: 'directory', path: dir })
})

test('high-load routers keep a small initial prompt and retain their branch files', () => {
  const hotspots = {
    learn: {
      learn: ['session-lifecycle.md'],
      'learn-core': ['llm-safety-boundaries.md', 'pedagogy-core.md'],
      'learn-data': ['session-lifecycle.md', 'session-schema.md', 'teaching-resolver.md'],
      'learn-support': ['supportive-conversation.md'],
      'learn-feynman': ['session-lifecycle.md', 'feynman-mode.md'],
      'learn-save': ['finalize-session.md'],
      'learn-start': ['create-student.md', 'teaching-resolver.md'],
    },
    'math-common': { 'math-common': ['board-contract.md', 'math-language-contract.md'] },
    'math-primary-low': {
      'math-low-core': ['math-teaching-core.md', 'problem-design.md'],
      'math-low-session': ['board-task-boundary.md', 'math-segment-fields.md'],
    },
    'math-primary-high': {
      'math-high-session': ['learn-act-allocation.md', 'derivation-teaching.md'],
      'math-high-application-modeling': ['word-problem-derivation.md'],
      'math-high-diagnose': ['strategy-diagnosis-rules.md'],
    },
    'chinese-reading': {
      'chinese-core': ['chinese-reading-core.md', 'chinese-writing-core.md'],
      'chinese-session': ['chinese-target.md', 'session-lifecycle.md'],
    },
    english: {
      'english-core': ['english-teaching-core.md', 'english-scaffolding.md'],
      'english-session': ['english-turn-arc.md', 'english-segment-fields.md'],
      'child-english-coach': ['english-turn-arc.md', 'english-input-adaptation.md'],
      'child-news-reader': ['english-input-adaptation.md', 'english-segment-fields.md'],
    },
  }
  for (const [bundle, skills] of Object.entries(hotspots)) {
    const dir = join(root, bundle, 'resources')
    for (const [name, references] of Object.entries(skills)) {
      const file = join(dir, `${name}.md`)
      const rendered = readFileSync(file, 'utf8')
      const skill = renderSkill(file)
      assert.match(rendered, /^resource-loading: on-demand$/m, name)
      assert.ok(Buffer.byteLength(skill.content, 'utf8') < 24 * 1024, `${name} exceeded its initial prompt budget`)
      assert.doesNotMatch(skill.content, /## Skill resources|left out of this prompt/, name)
      for (const reference of references) {
        assert.ok(listedResources(rendered).includes(reference), `${name} should list ${reference}`)
        assert.ok(existsSync(join(dir, reference)), `${name} should ship ${reference}`)
      }
    }
  }
})

test('citation discovery survives every prose shape the skills actually use', () => {
  const skill = mkdtempSync(join(tmpdir(), 'citation-shapes-'))
  try {
    // Two owners, each with one reference, so no file resolves by uniqueness alone —
    // only the name in the prose can decide, and each shape writes it differently.
    for (const owner of ['learn-core', 'learn-data']) {
      mkdirSync(join(skill, 'skills', owner, 'references'), { recursive: true })
      writeFileSync(join(skill, 'skills', owner, 'references', `${owner}-file.md`), `# ${owner}\n`)
    }
    const cases = [
      ['adjacent', '`learn-core` `references/learn-core-file.md`'],
      ['possessive', "`learn-data`'s `references/learn-data-file.md`"],
      ['chinese possessive', '`learn-core` 的 `references/learn-core-file.md`'],
      ['table columns', '| `learn-data` | `references/learn-data-file.md` |'],
      ['link', '[structure](../learn-core/references/learn-core-file.md)'],
    ]
    for (const [label, prose] of cases) {
      const directory = join(skill, 'skills', 'probe')
      mkdirSync(join(directory, 'references'), { recursive: true })
      writeFileSync(join(directory, 'SKILL.md'), ['---', 'name: probe', 'description: probe', '---', '', prose, ''].join('\n'))
      const { pairs, problems } = sharedCitations(prose, [], referenceIndex([join(skill, 'skills'), directory]))
      assert.deepEqual(problems, [], `${label}: unresolved`)
      assert.equal(pairs.length, 1, `${label}: expected one citation`)
    }
  } finally {
    rmSync(skill, { recursive: true, force: true })
  }
})

test('an unresolvable citation is reported, not dropped', () => {
  const { pairs, problems } = sharedCitations('read `references/nowhere.md`', [], new Map())
  assert.deepEqual(pairs, [])
  assert.equal(problems.length, 1)
  assert.match(problems[0], /nowhere\.md/)
})

test('an oversized skill drops whole resources at their boundary and names them', () => {
  const dir = mkdtempSync(join(tmpdir(), 'skill-cap-'))
  try {
    mkdirSync(join(dir, 'resources'))
    // Two resources of ~4.5 KB each under an 8 KB cap: the first fits whole, the
    // second must be dropped whole rather than sliced to fill the remaining room.
    const resource = (marker) => `# ${marker}\n\n${'body '.repeat(900)}\n`
    writeFileSync(join(dir, 'resources', 'first.md'), resource('first'))
    writeFileSync(join(dir, 'resources', 'second.md'), resource('second'))
    writeFileSync(join(dir, 'resources', 'huge.md'), [
      '---', 'name: huge', 'description: oversized', 'resources: first.md second.md', '---', '', '# Huge', '', 'Body.', '',
    ].join('\n'))

    const cap = 8192
    const [skill] = readPackage(dir, { maxBytes: cap })
    assert.ok(Buffer.byteLength(skill.content, 'utf8') <= cap, 'stays within the cap')
    // The surviving section is whole, and the dropped one is named rather than truncated.
    assert.match(skill.content, /### first\n\n# first\n/)
    assert.doesNotMatch(skill.content, /### second/)
    assert.deepEqual(skill.omitted, ['second'])
    assert.match(skill.content, /left out of this prompt to stay within its size limit/)
    assert.match(skill.content, /`<name>\.md`/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('the shipped cap registers every skill whole', () => {
  // The cap is a safety net, not a target: today no skill reaches it, so nothing is
  // dropped from a prompt. A skill that grows past it is reported for review instead.
  const truncated = []
  for (const bundle of bundles) {
    for (const entry of readPackage(join(root, bundle), { maxBytes: MAX_CONTENT_BYTES })) {
      if ((entry.omitted ?? []).length > 0) truncated.push(`${bundle}/${entry.name}: ${entry.omitted.join(', ')}`)
    }
  }
  assert.deepEqual(truncated, [], 'a shipped skill now exceeds the cap; either split it or raise the cap deliberately')
})
