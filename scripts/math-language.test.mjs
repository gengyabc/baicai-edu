import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

// Static contract checks only; dialogue replay remains a separate manual check.
const root = fileURLToPath(new URL('..', import.meta.url))
const text = (path) => readFileSync(join(root, path), 'utf8')
const contract = text('math-common/skills/math-common/references/math-language-contract.md')
const bands = [['math-primary-low', 'math-low-core'], ['math-primary-high', 'math-high-core']]

test('both math bands load one language contract for every teaching branch', () => {
  for (const [bundle, skill] of bands) {
    const core = text(`${bundle}/skills/${skill}/SKILL.md`)
    assert.match(core, /For every teaching branch, load `math-common` and read its `references\/math-language-contract\.md`/)
    assert.match(core, /If unavailable, continue in the profile language or the student's explicit task-local Chinese\/English choice/)
  }
  assert.match(text('math-common/skills/math-common/SKILL.md'), /Any math teaching branch[^\n]*references\/math-language-contract\.md/)
})

test('math delivery supports Chinese and English without changing process locale or profile', () => {
  for (const phrase of ['Chinese (`zh-CN`, alias `zh`) and English (`en`)',
    'missing or unknown values use `zh-CN`', 'Preserve the pending problem and step',
    'diagnosis, practice, student-authored problems, modeling, and Feynman',
    'a task-local switch alone writes no profile preference',
    'board text alone does not change delivery language',
    'teacher-authored diagram titles, descriptions, and explanatory text',
    'A teaching-language switch alone does not change the UI locale']) {
    assert.ok(contract.includes(phrase), phrase)
  }
})

test('language access stays separate from mathematical evidence and attachment authority', () => {
  for (const phrase of ['not grammar, accent, spelling, or fluency',
    'leaves mathematical understanding unknown',
    'If rephrasing reveals the relation or method, attribute that support',
    'not a fresh independent or transfer check',
    'confirm that one ambiguity before calculating or diagnosing',
    'not a Chinese or English filename', 'authorizes no student-data rename',
    'Preserve the submitted-board reading and geometry boundaries']) {
    assert.ok(contract.includes(phrase), phrase)
  }
  const low = text('math-primary-low/skills/math-low-core/SKILL.md')
  const board = text('math-common/skills/math-common/references/board-contract.md')
  assert.match(low, /recognized by `kind` \/ `schemaVersion`, regardless of filename/)
  assert.match(board, /regardless of its Chinese or English filename/)
  assert.doesNotMatch(low + board, /我的画板\.json|我的修改记录\.json/)
})

test('both math UI catalogs cover the same owned keys in Chinese and English', () => {
  for (const [bundle, skill] of bands) {
    const base = `${bundle}/skills/${skill}/references/locales`
    const zh = JSON.parse(text(`${base}/zh-CN.json`))
    const en = JSON.parse(text(`${base}/en.json`))
    assert.deepEqual(Object.keys(en).sort(), Object.keys(zh).sort(), bundle)
    for (const [key, value] of Object.entries(en)) {
      assert.ok(typeof value === 'string' && value.trim(), `${bundle}: ${key}`)
      assert.doesNotMatch(value, /\p{Script=Han}/u, `${bundle}: ${key}`)
      assert.ok(typeof zh[key] === 'string' && zh[key].trim(), `${bundle}: ${key}`)
    }
  }
})

test('math skill source filenames remain English and rendered language contract stays current', () => {
  for (const bundle of ['math-common', ...bands.map(([bundle]) => bundle)]) {
    for (const entry of readdirSync(join(root, bundle, 'skills'), { recursive: true })) {
      assert.match(entry, /^[A-Za-z0-9_./-]+$/, `${bundle}: ${entry}`)
    }
  }
  assert.equal(text('math-common/resources/references/math-language-contract.md'), contract)
  for (const [bundle, skill] of bands) {
    assert.match(text(`${bundle}/resources/${skill}.md`), /references\/math-language-contract\.md/)
  }
})
