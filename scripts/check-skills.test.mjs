import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

// Isolated checker fixtures: never rename real skills or touch a DSH profile.
const checker = readFileSync(new URL('./check-skills.mjs', import.meta.url), 'utf8')
function checkFixture(duplicate) {
  const root = mkdtempSync(join(tmpdir(), 'dsh-edu-skill-check-'))
  try {
    mkdirSync(join(root, 'scripts'))
    writeFileSync(join(root, 'scripts/check-skills.mjs'), checker)
    for (const bundle of ['learn', 'math-common', 'math-primary-low', 'math-primary-high', 'chinese-reading', 'english']) {
      mkdirSync(join(root, bundle, 'skills'), { recursive: true })
    }
    const registrations = [
      ['math-common', 'math-common'],
      ['math-primary-low', 'math-low-core'],
      ['math-primary-high', duplicate ? 'math-low-core' : 'math-high-core'],
    ]
    for (const [bundle, name] of registrations) {
      const directory = join(root, bundle, 'skills', name)
      mkdirSync(directory)
      writeFileSync(join(directory, 'SKILL.md'), `---\nname: ${name}\ndescription: Internal fixture rules.\nuser-invocable: false\n---\n`)
    }
    for (const bundle of ['math-primary-low', 'math-primary-high']) {
      writeFileSync(join(root, bundle, 'package.json'), JSON.stringify({
        dependencies: { 'dsh-edu-math': '^0.1.0' },
      }))
    }
    return spawnSync(process.execPath, [join(root, 'scripts/check-skills.mjs')], { encoding: 'utf8' })
  } finally {
    // Exact owned directory returned by mkdtempSync, not a user-supplied path.
    rmSync(root, { recursive: true, force: true })
  }
}

test('skill checker accepts distinct math band names and the unchanged shared contract', () => {
  const result = checkFixture(false)
  assert.ifError(result.error)
  assert.equal(result.status, 0, result.stdout + result.stderr)
  assert.match(result.stdout, /3 skills checked, 0 errors, 0 warnings/)
})

test('skill checker rejects duplicate math registrations before map insertion loses the first owner', () => {
  const result = checkFixture(true)
  assert.ifError(result.error)
  assert.equal(result.status, 1, result.stdout + result.stderr)
  assert.match(result.stderr, /duplicate skill name "math-low-core"/)
  assert.match(result.stderr, /math-primary-low/)
  assert.match(result.stderr, /math-primary-high/)
})

// A skill ships alone: `skills/` and `resources/` are all an install has. A link
// that resolves only in the checkout is dead for every installed student.
function linkFixture(body) {
  const root = mkdtempSync(join(tmpdir(), 'dsh-edu-link-check-'))
  try {
    mkdirSync(join(root, 'scripts'))
    writeFileSync(join(root, 'scripts/check-skills.mjs'), checker)
    for (const bundle of ['learn', 'math-common', 'math-primary-low', 'math-primary-high', 'chinese-reading', 'english']) {
      mkdirSync(join(root, bundle, 'skills'), { recursive: true })
    }
    const directory = join(root, 'math-primary-low', 'skills', 'math-low-core')
    mkdirSync(join(directory, 'references'), { recursive: true })
    writeFileSync(join(directory, 'references', 'own.md'), 'Own reference.\n')
    writeFileSync(join(directory, 'SKILL.md'),
      `---\nname: math-low-core\ndescription: Internal fixture rules.\nuser-invocable: false\n---\n\n${body}\n`)
    for (const name of ['math-common', 'math-common']) {
      const shared = join(root, 'math-common', 'skills', name)
      mkdirSync(shared, { recursive: true })
      writeFileSync(join(shared, 'SKILL.md'), '---\nname: math-common\ndescription: Shared.\nuser-invocable: false\n---\n')
    }
    // a sibling band skill the fixture may legitimately cite
    const sibling = join(root, 'math-primary-high', 'skills', 'math-high-core', 'references')
    mkdirSync(sibling, { recursive: true })
    writeFileSync(join(sibling, 'peer.md'), 'Peer rules.\n')
    writeFileSync(join(root, 'math-primary-high', 'skills', 'math-high-core', 'SKILL.md'),
      '---\nname: math-high-core\ndescription: Peer.\nuser-invocable: false\n---\n')
    for (const bundle of ['math-primary-low', 'math-primary-high']) {
      writeFileSync(join(root, bundle, 'package.json'), JSON.stringify({
        dependencies: { 'dsh-edu-math': '^0.1.0' },
      }))
    }
    return spawnSync(process.execPath, [join(root, 'scripts/check-skills.mjs')], { encoding: 'utf8' })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

test('skill checker rejects a link into a repository-only directory', () => {
  const result = linkFixture('See [the spec](../../../.scratch/math-strategy-recursion/spec.md) for detail.')
  assert.ifError(result.error)
  assert.equal(result.status, 1, result.stdout + result.stderr)
  assert.match(result.stderr, /points into \.scratch\/, which is not shipped/)
})

test('skill checker rejects a ../ link that leaves every shipped skills tree', () => {
  // Outside the known repository-only directories, so the escape rule decides.
  const result = linkFixture('See [release notes](../../../../RELEASE-PROCESS.md).')
  assert.ifError(result.error)
  assert.equal(result.status, 1, result.stdout + result.stderr)
  assert.match(result.stderr, /leaves every shipped skills\/ tree/)
})

test('skill checker accepts own references and links to a sibling skill', () => {
  // A bare `evidence.md` is this skill's own reference, next to SKILL.md; the
  // external-URL rule is a separate check and stays out of this fixture.
  const result = linkFixture([
    'Read [own rules](references/own.md).',
    'Follow [peer rules](../../../math-primary-high/skills/math-high-core/references/peer.md).',
  ].join('\n'))
  assert.ifError(result.error)
  assert.equal(result.status, 0, result.stdout + result.stderr)
  assert.match(result.stdout, /3 skills checked, 0 errors/)
})
