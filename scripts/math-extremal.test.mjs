import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

// Installed-instruction architecture guard, not a model teaching replay.
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
const base = 'math-primary-high/skills/math-high-core/'

test('extremal tasks reach a conditional reference through the existing method index', () => {
  const core = read(`${base}SKILL.md`)
  const index = read(`${base}references/mathematical-strategies.md`)
  assert.match(core, /maximum\/minimum[\s\S]*?references\/mathematical-strategies\.md/)
  assert.match(index, /references\/extremal-optimization\.md/)
  const extremal = read(`${base}references/extremal-optimization.md`)
  for (const dependency of ['references/mathematical-strategies.md', 'references/proof-teaching.md',
    'references/derivation-teaching.md', 'references/prerequisite-learning.md', 'area-perimeter',
    'math-high-session']) assert.ok(extremal.includes(dependency), dependency)
  assert.doesNotMatch(extremal, /^name:|^supported_stages:|active_frame_id|learning_plan_update|https?:\/\//m)
})

test('extremal supplement delegates recursion, full solutions and evidence to their existing owners', () => {
  const extremal = read(`${base}references/extremal-optimization.md`)
  for (const rule of ['exactly one parent', 'informed full-solution choice', 'same-task confirmation',
    'session_segment: null', 'one merged performance segment', 'Teacher-only checked cases']) {
    assert.ok(extremal.includes(rule), rule)
  }
  assert.doesNotMatch(extremal, /ui\.solution\.|"(?:frames|schema_version)"\s*:/)
})

// Mathematical example checks only: no student/model performance is simulated.
// Enumerate ALL ordered integer side pairs independently of the runtime short-side explanation.
const rectangles = (perimeter, allowSquares = true) => {
  const candidates = []
  for (let a = 1; a < perimeter; a++) {
    for (let b = 1; b < perimeter; b++) {
      if (2 * a + 2 * b === perimeter && (allowSquares || a !== b)) candidates.push([a, b, a * b])
    }
  }
  return candidates
}

test('E0–E2 and EB3 integer domain: complete areas, maximum witness and minimum witness', () => {
  const candidates = rectangles(20)
  assert.equal(candidates.length, 9)
  assert.deepEqual([...new Set(candidates.map(([, , area]) => area))], [9, 16, 21, 24, 25])
  assert.ok(candidates.every(([, , area]) => area <= 25 && area >= 9))
  assert.ok(candidates.some(([a, b, area]) => a === 5 && b === 5 && area === 25))
  assert.ok(candidates.some(([a, b, area]) => a === 1 && b === 9 && area === 9))
})

test('EB1 and EB2 recheck all allowed integer rectangles rather than reuse the old equality case', () => {
  const changedPerimeter = rectangles(24)
  assert.deepEqual([...new Set(changedPerimeter.map(([, , area]) => area))], [11, 20, 27, 32, 35, 36])
  assert.ok(changedPerimeter.some(([a, b, area]) => a === 6 && b === 6 && area === 36))
  const noSquares = rectangles(20, false)
  assert.equal(noSquares.length, 8)
  assert.ok(noSquares.every(([, , area]) => area <= 24))
  assert.ok(noSquares.some(([a, b, area]) => a === 4 && b === 6 && area === 24))
})

test('balancing strictly improves every nonbalanced integer candidate in the checked examples', () => {
  for (const perimeter of [20, 24]) {
    for (const [a, b, area] of rectangles(perimeter)) {
      if (b - a < 2) continue
      assert.equal(2 * (a + 1) + 2 * (b - 1), perimeter)
      assert.ok((a + 1) * (b - 1) > area)
    }
  }
})

test('EB3 rational samples remain positive and admit smaller feasible areas (not a real-domain proof)', () => {
  // a=x/d <= b=10-a; exact integer comparisons use common area denominator 4d².
  for (const d of [1n, 2n, 10n, 100n]) {
    for (let x = 1n; x <= 5n * d; x++) {
      const oldArea = 4n * x * (10n * d - x)
      const smallerArea = x * (20n * d - x)
      assert.ok(smallerArea > 0n && smallerArea < oldArea)
    }
  }
})
