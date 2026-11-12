import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const ref = (name) => readFileSync(new URL(`../math-primary-high/skills/math-high-core/${name}`, import.meta.url), 'utf8')

// Public document contracts only; these checks do not simulate a teaching turn.
test('legal-operation and coverage structures reach invariants through the existing index', () => {
  const core = ref('SKILL.md')
  const index = ref('references/mathematical-strategies.md')
  assert.match(core, /legal operations[\s\S]*?references\/mathematical-strategies\.md/)
  assert.match(index, /legal operations[\s\S]*?references\/invariants-coloring\.md/)
  const invariants = ref('references/invariants-coloring.md')
  for (const contract of ['references/proof-teaching.md', 'references/prerequisite-learning.md',
    'references/topic-map.md', 'math-high-session']) assert.ok(invariants.includes(contract), contract)
  assert.doesNotMatch(invariants, /^name:|^supported_stages:|learning_plan_update|active_frame_id/m)
})

test('invariants inherit proof, tool recovery, solution choice and attribution boundaries', () => {
  const content = ref('references/invariants-coloring.md')
  for (const phrase of ['I0:', 'I1:', 'I2:', 'IB1,', 'IB2,', 'IB3,', 'IB4,',
    'every legal operation type', 'necessary condition is not sufficient',
    'who supplied the coloring/state quantity', 'Return one layer',
    'informed full-solution choice', 'same-task warning/confirmation',
    'no prerequisite or compulsory exercise', 'session_segment: null',
    'respect refusal, pause, end']) assert.ok(content.includes(phrase), phrase)
  assert.match(content, /## Teacher-only checked cases[\s\S]*30 black and 32 white/)
})

// Independent finite mathematical checks, not model/student teaching replays.
const board = (size) => Array.from({ length: size * size }, (_, index) =>
  [Math.floor(index / size) + 1, index % size + 1])
const black = ([row, column]) => (row + column) % 2 === 0
const adjacent = ([r, c], [s, d]) => Math.abs(r - s) + Math.abs(c - d) === 1
const legalPairs = (cells) => cells.flatMap((cell, i) =>
  cells.slice(i + 1).filter((other) => adjacent(cell, other)).map((other) => [cell, other]))

test('8x8 and 6x6 cases count colors and check every legal horizontal and vertical placement', () => {
  for (const [size, expectedBlack, expectedWhite, expectedPlacements] of [[8, 30, 32, 112], [6, 16, 18, 60]]) {
    const cells = board(size)
    const pairs = legalPairs(cells)
    assert.equal(pairs.length, expectedPlacements)
    assert.ok(pairs.some(([a, b]) => a[0] === b[0]))
    assert.ok(pairs.some(([a, b]) => a[1] === b[1]))
    for (const [a, b] of pairs) assert.notEqual(black(a), black(b))
    const remaining = cells.filter(([r, c]) => !(r === 1 && c === 1 || r === size && c === size))
    assert.equal(remaining.filter(black).length, expectedBlack)
    assert.equal(remaining.filter((cell) => !black(cell)).length, expectedWhite)
    // Check preservation on every legal first move, not just a selected witness.
    for (const [a, b] of legalPairs(remaining)) {
      const after = remaining.filter((cell) => cell !== a && cell !== b)
      assert.equal(after.filter(black).length - after.filter((cell) => !black(cell)).length, -2)
    }
  }
})

test('IB2 has an exact one-piece construction; IB3 balance has no legal placement', () => {
  const bottomRow = board(2).filter(([row]) => row === 2)
  assert.deepEqual(legalPairs(bottomRow), [[[2, 1], [2, 2]]])
  const disconnected = [[1, 1], [1, 4]]
  assert.equal(disconnected.filter(black).length, 1)
  assert.equal(disconnected.filter((cell) => !black(cell)).length, 1)
  assert.deepEqual(legalPairs(disconnected), [])
})

test('IB4 every adjacent diagonal pair is same-colored and breaks the old difference', () => {
  let checked = 0
  const cells = board(8)
  for (const [i, a] of cells.entries()) {
    for (const b of cells.slice(i + 1)) {
      if (Math.abs(a[0] - b[0]) !== 1 || Math.abs(a[1] - b[1]) !== 1) continue
      checked++
      assert.equal(black(a), black(b))
      const after = cells.filter((cell) => cell !== a && cell !== b)
      assert.equal(after.filter(black).length - after.filter((cell) => !black(cell)).length, black(a) ? -2 : 2)
    }
  }
  assert.equal(checked, 98)
})
