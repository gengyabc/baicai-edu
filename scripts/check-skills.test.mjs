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
