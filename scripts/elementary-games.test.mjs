import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

// Independent finite mathematics checks of installed worked examples, not model/student replays.
const material = readFileSync(new URL('../math-primary-high/skills/math-high-core/references/elementary-games.md', import.meta.url), 'utf8')
const legalMoves = (pile) => [1, 2].filter((take) => take <= pile)

// Evaluate immediate terminal moves explicitly; misere never invents a turn at zero.
function outcomes(lastWins, limit) {
  const win = []
  for (let pile = 1; pile <= limit; pile++) {
    win[pile] = legalMoves(pile).some((take) =>
      take === pile ? lastWins : !win[pile - take])
  }
  return win.slice(1).map((value) => value ? 'W' : 'L')
}

// The prescribed player follows a policy; the opponent explores EVERY legal response.
// Every path must terminate with the prescribed player winning, including the last move.
function checkPolicy(pile, turn, lastWins, policy, history = []) {
  const actions = turn === 0 ? [policy(pile, history)] : legalMoves(pile)
  let leaves = 0
  for (const take of actions) {
    assert.ok(legalMoves(pile).includes(take), `illegal removal ${take} from ${pile}`)
    const path = [...history, { pile, turn, take }]
    if (take === pile) {
      const winner = lastWins ? turn : 1 - turn
      assert.equal(winner, 0, JSON.stringify(path))
      leaves++
    } else {
      leaves += checkPolicy(pile - take, 1 - turn, lastWins, policy, path)
    }
  }
  return leaves
}

test('last-wins and last-loses checked tables match exhaustive legal-move backward evaluation', () => {
  const documented = [...material.matchAll(/States 1–7 are ([WL,]+);|states 1–7 are ([WL,]+) for/g)]
    .map((match) => (match[1] ?? match[2]).split(','))
  assert.equal(documented.length, 2)
  assert.deepEqual(documented[0], ['W', 'W', 'L', 'W', 'W', 'L', 'W'])
  assert.deepEqual(documented[1], ['L', 'W', 'W', 'L', 'W', 'W', 'L'])
  assert.deepEqual(outcomes(true, 7), documented[0])
  assert.deepEqual(outcomes(false, 7), documented[1])
})

test('7 take 1 and 8 take 2 win against all four opponent continuations, not one cooperative play', () => {
  const seven = (pile, history) => history.length === 0 ? 1 : 3 - history.at(-1).take
  const eight = (pile, history) => history.length === 0 ? 2 : 3 - history.at(-1).take
  assert.equal(checkPolicy(7, 0, true, seven), 4)
  assert.equal(checkPolicy(8, 0, true, eight), 4)
  // Ensure the all-branch checker really rejects a cooperative-only policy.
  assert.throws(() => checkPolicy(7, 0, true, () => 1), /AssertionError/)
})

test('6 last-wins has no first-player guarantee and a second-player reply defeats both starts', () => {
  assert.equal(outcomes(true, 6).at(-1), 'L')
  const reply = (pile, history) => 3 - history.at(-1).take
  assert.equal(checkPolicy(6, 1, true, reply), 4)
})

test('7 last-loses is losing and the second player legally leaves 1 against every response', () => {
  assert.equal(outcomes(false, 7).at(-1), 'L')
  const reply = (pile, history) => 3 - history.at(-1).take
  assert.equal(checkPolicy(7, 1, false, reply), 4)
  assert.throws(() => checkPolicy(7, 0, false, (pile, history) =>
    history.length === 0 ? 1 : 3 - history.at(-1).take), /AssertionError/)
})

test('bounded extra states corroborate the patterns but do not prove the general claims', () => {
  const normal = outcomes(true, 30)
  const misere = outcomes(false, 30)
  assert.deepEqual(normal.flatMap((value, i) => value === 'L' ? [i + 1] : []),
    [3, 6, 9, 12, 15, 18, 21, 24, 27, 30])
  assert.deepEqual(misere.flatMap((value, i) => value === 'L' ? [i + 1] : []),
    [1, 4, 7, 10, 13, 16, 19, 22, 25, 28])
})
