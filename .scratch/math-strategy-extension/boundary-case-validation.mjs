// Issue 11 — mathematical case check for structural boundary variation.
// Finite enumeration only: these checks verify the teacher-only cases, the
// correspondence behind the ordered/unordered change, and which tactic survives
// a changed rule. They are not a teaching or model replay, not a solver, and not
// a substitute for the stage-3 V/B multi-turn comparison.

import assert from 'node:assert/strict'

const people = ['甲', '乙', '丙', '丁']
const pairs = (names) => names.flatMap((a, i) => names.slice(i + 1).map((b) => [a, b]))
const key = (pair) => `${pair[0]}|${pair[1]}`
const sameSet = (a, b) => new Set([...a, ...b]).size === Math.max(a.length, b.length)

// Each case prints its verified numbers.
const cases = []
const check = (name, fn) => cases.push({ name, fn })

// ---------------------------------------------------------------------------
// A. 4 people, captain + deputy (two ordered roles) versus an unranked group.
// ---------------------------------------------------------------------------
check('A1: 4 people, captain and deputy give 12 ordered choices', () => {
  const ordered = people.flatMap((captain) => people
    .filter((deputy) => deputy !== captain)
    .map((deputy) => [captain, deputy]))
  assert.equal(ordered.length, 12)
  assert.equal(4 * 3, 12)
  assert.equal(new Set(ordered.map(key)).size, 12)
  // One person never holds both roles in the same choice.
  assert.ok(ordered.every(([captain, deputy]) => captain !== deputy))
  return `12 ordered choices = ${ordered.map(key).join(', ')}`
})

check('A2: the unranked group of 2 is 6 groups', () => {
  const groups = pairs(people)
  assert.equal(groups.length, 6)
  assert.equal(new Set(groups.map(key)).size, 6)
  assert.equal((4 * 3) / 2, 6)
  return `6 groups = ${groups.map(key).join(', ')}`
})

check('A3: every unordered group comes from exactly two ordered choices (all groups)', () => {
  const ordered = people.flatMap((captain) => people
    .filter((deputy) => deputy !== captain)
    .map((deputy) => [captain, deputy]))
  const groups = pairs(people)
  const sources = groups.map(([a, b]) => ordered.filter(([c, d]) => sameSet([c, d], [a, b])))
  // Each group has exactly two sources, and they are the same two people with roles swapped.
  assert.ok(sources.every((list) => list.length === 2), 'each group has exactly two sources')
  assert.ok(sources.every(([[c1, d1], [c2, d2]]) => c2 === d1 ? d2 === c1 : false),
    'the two sources are role swaps of the same two people')
  // The 6 groups × 2 ordered choices cover all 12 ordered choices exactly once:
  // nothing is lost (no omissions) and nothing is counted twice (no duplicates).
  assert.equal(new Set(sources.flat().map(key)).size, 12)
  assert.equal(sources.flat().length, 12)
  return 'x2 sources: ' + groups.map((g) => `${key(g)}<-[${sources[groups.indexOf(g)]
    .map(([c, d]) => `${c},${d}`).join('] [')}]`).join('; ')
})

check('A4: a single example cannot stand in for all six correspondences', () => {
  // Pairing only 甲乙 with 甲乙/乙甲 leaves five groups unpaired; the general claim needs all groups.
  const ordered = people.flatMap((captain) => people
    .filter((deputy) => deputy !== captain)
    .map((deputy) => [captain, deputy]))
  const groups = pairs(people)
  const oneExample = groups.filter(([a, b]) => sameSet([a, b], ['甲', '乙']))
  assert.equal(oneExample.length, 1)
  assert.equal(groups.length - oneExample.length, 5)
  assert.equal(ordered.filter(([c, d]) => sameSet([c, d], ['甲', '乙'])).length, 2)
  return 'one example covers 1 of 6 groups (2 of 12 ordered choices); 5 groups remain'
})

// ---------------------------------------------------------------------------
// B. 5 people: unranked choose 2, then with roles.
// ---------------------------------------------------------------------------
check('B1: 5 people unranked choose 2 is 10 groups; with roles it is 20', () => {
  const five = ['A', 'B', 'C', 'D', 'E']
  const grouped = pairs(five)
  const ranked = five.flatMap((first) => five
    .filter((second) => second !== first)
    .map((second) => [first, second]))
  assert.equal(grouped.length, 10)
  assert.equal(ranked.length, 20)
  assert.equal(5 * 4, 20)
  assert.equal((5 * 4) / 2, 10)
  return `${grouped.length} groups, ${ranked.length} ranked choices`
})

check('B2: the 10 groups each come from exactly two of the 20 ranked choices', () => {
  const five = ['A', 'B', 'C', 'D', 'E']
  const grouped = pairs(five)
  const ranked = five.flatMap((first) => five
    .filter((second) => second !== first)
    .map((second) => [first, second]))
  const sources = grouped.map(([a, b]) => ranked.filter(([c, d]) => sameSet([c, d], [a, b])))
  assert.ok(sources.every((list) => list.length === 2))
  assert.ok(sources.every(([[c1, d1], [c2, d2]]) => c2 === d1 && d2 === c1))
  assert.equal(new Set(sources.flat().map(key)).size, 20)
  return 'each of 10 groups <- 2 ranked choices; 20 covered exactly once'
})

check('B3: the object is defined first; halving is not automatic', () => {
  // Same numbers, three different counting objects.
  const teamNames = people.map((p) => [p]) // 4 people -> 4 one-member teams
  assert.equal(teamNames.length, 4)
  // Ordered pair of two distinct roles among 4 people: 12.
  const orderedRoles = 4 * 3
  assert.equal(orderedRoles, 12)
  // Unranked pair among 4 people: 6.
  const unordered = (4 * 3) / 2
  assert.equal(unordered, 6)
  // A "choose 1 of 4 then choose 1 of 3" shape without roles is not 12/2 when
  // the two drawn items are allowed to repeat: 4×4 = 16, and halving gives 8, which
  // counts no object either. The fair answer depends on whether the same person may
  // appear twice, decided by the problem, not by the arithmetic.
  const withRepetition = 4 * 4
  assert.equal(withRepetition, 16)
  // "Choose 2 of 5" then "with roles" doubles correctly only when the same two people
  // are required; halving 10 to 5 counts nothing here.
  assert.equal(10 / 2, 5)
  assert.notEqual(5, pairs(['A', 'B', 'C', 'D', 'E']).length)
  return '4 people: 4 single-name teams, 12 ordered-role choices, 6 unranked groups, 16 with repetition'
})

// ---------------------------------------------------------------------------
// C. The triangular-dot strategy: which step survives a changed condition?
// ---------------------------------------------------------------------------
const triangular = (n) => n * (n + 1) / 2
check('C1: row count changes only the initial state and final size', () => {
  assert.deepEqual(Array.from({ length: 10 }, (_, i) => triangular(i + 1)),
    [1, 3, 6, 10, 15, 21, 28, 36, 45, 55])
  assert.equal(triangular(10), 55)
  assert.equal(triangular(4), 10)
  assert.equal(triangular(9) + 10, triangular(10))
  return `T(1..10) = ${Array.from({ length: 10 }, (_, i) => triangular(i + 1)).join(', ')}`
})

check('C2: adding a constant k=6 per row changes the recurrence but not the pairing argument', () => {
  const sixRows = Array.from({ length: 6 }, (_, i) => 6 * (i + 1))
  const sum = sixRows.reduce((a, b) => a + b, 0)
  assert.equal(sum, 6 * 21)
  assert.equal(sum, 126)
  // Same pairing used for the triangular count: two reversed copies make 6 rows of 6×7.
  assert.equal(2 * sum, 6 * (6 * 7))
  assert.equal(2 * sum, 252)
  for (const k of [1, 2, 3]) assert.equal(6 * k + 6 * (7 - k), 6 * 7)
  // The increment is now 6 rather than 6/1: T(n) gains 6n per row, not n.
  assert.equal(6 * 6 - 6 * 5, 6)
  return '1..6 × 6 rows sum to 126; two reversed copies give 252 = 6 × 42, pairing formula still holds'
})

// ---------------------------------------------------------------------------
// D. The fixed-total adjustment tactic and its changed-condition boundary.
// ---------------------------------------------------------------------------
check('D1: 20 tickets of 2 and 5 reaching 64 with a uniform gap', () => {
  const gap = 5 - 2
  assert.equal(gap, 3)
  const dear = (64 - 20 * 2) / gap
  assert.equal(dear, 8)
  assert.equal(20 - dear, 12)
  assert.equal(8 * 5 + 12 * 2, 64)
  assert.equal(8 + 12, 20)
  return 'gap 3; 64 − 40 = 24; 24/3 = 8 dear, 12 cheap; 8×5 + 12×2 = 64'
})

check('D2: a changed price table has a direct answer the gradient rule never reaches', () => {
  // Same 20 tickets. Price table: the dear ticket costs 5 yuan for any one of the first 10
  // tickets issued, and 6 yuan for each dear ticket after that.
  const total = (dear) => (dear <= 10
    ? (20 - dear) * 2 + dear * 5
    : (20 - dear) * 2 + 10 * 5 + (dear - 10) * 6)
  const covered = new Set()
  for (let dear = 0; dear <= 20; dear += 1) {
    assert.equal((20 - dear) + dear, 20)
    covered.add(total(dear))
  }
  // 64 is below the boundary, so the old constant-gap rule still works there.
  assert.equal(total(8), 8 * 5 + 12 * 2)
  assert.equal(total(8), 64)
  // Above the boundary each extra dear ticket adds 4 yuan (6 - 2), not 3.
  assert.equal(total(12), (20 - 12) * 2 + 10 * 5 + 2 * 6)
  assert.equal(total(12), 78)
  assert.equal(total(14), (20 - 14) * 2 + 10 * 5 + 4 * 6)
  assert.equal(total(14), 86)
  // The old uniform-gradient tactic assumes a 3-yuan gap for every dear ticket. On 78 it
  // returns 38/3 dear, which is not a whole count at all; on 86 it returns 46/3, likewise.
  const oldTactic = (target) => (target - 20 * 2) / (5 - 2)
  assert.notEqual(oldTactic(78) % 1, 0)
  assert.notEqual(oldTactic(86) % 1, 0)
  // The task keeps an answer: a direct tier-by-tier total reaches both values with a real
  // whole count of dear tickets, even though the gradient rule cannot produce one.
  assert.ok(covered.has(78) && covered.has(86))
  return 'uniform below the boundary (64 -> 8 dear); above it the dear ticket costs 6, so 78 is reached by 12 dear and 86 by 14 dear, while the 3-yuan gradient rule gives 38/3 and 46/3 dear (no whole count)'
})

check('D3: changing the per-unit change is the load-bearing step; gap division is not universal', () => {
  // 20 tickets of 2 and 5 form totals 40 + 3k for k = 0..20.
  const totals = Array.from({ length: 21 }, (_, i) => 40 + 3 * i)
  assert.equal(totals.length, 21)
  assert.equal(totals[0], 40)
  assert.equal(totals.at(-1), 100)
  // Target 65: 65 − 40 = 25, not divisible by 3, so no integer assignment.
  assert.equal((65 - 40) % 3, 1)
  assert.equal(totals.includes(65), false)
  // The problem is unsolvable under these conditions, but that is a fact about the target,
  // not a failure of any route: 65 is reachable if the gap changes to 2.5.
  assert.equal(40 + 2.5 * 10, 65)
  return `totals ${totals[0]}..${totals.at(-1)} step 3; 65 unreachable with gap 3, reachable with gap 2.5`
})

check('D4: keep apart "the method no longer fits" and "the problem has no answer"', () => {
  // With a uniform 3-yuan gap the reachable totals are 40 + 3k, so 65 has no answer at all.
  assert.equal((65 - 40) % 3, 1)
  assert.notEqual((65 - 40) / 3 % 1, 0)
  // With the same uniform gap, 64 has an answer: 8 dear and 12 cheap.
  assert.equal((64 - 40) / 3, 8)
  assert.equal(64, 8 * 5 + 12 * 2)
  // With the tiered price (dear ticket 5 up to the 10th, then 6) the target 78 has a whole
  // answer of 12 dear, yet the old gradient rule returns 38/3 dear, which is not a count.
  const tiered = (dear) => (dear <= 10
    ? (20 - dear) * 2 + dear * 5
    : (20 - dear) * 2 + 10 * 5 + (dear - 10) * 6)
  assert.notEqual((78 - 40) / 3 % 1, 0)
  assert.equal(tiered(12), 78)
  // The two claims are independent: an unreachable target says nothing about any route that
  // might have worked, and a broken route says nothing about whether the task has an answer.
  assert.equal((65 - 40) / 3 % 1 !== 0, true)
  assert.equal((78 - 40) / 3 % 1 !== 0, true)
  assert.equal(tiered(12), 78)
  return '65 with gap 3: no answer; 64: 8/12 by the old route; 78 with the tiered price: the old route gives 38/3 dear, but 12 dear is the answer (a stopped route is not an answerless task)'
})

check('E1: existence after a condition changes', () => {
  // 13 people in 12 months: at least one month has two (guarantee).
  assert.ok(13 > 12)
  assert.equal(Math.ceil(13 / 12), 2)
  // Allow a 13th distinct category and the guarantee drops out: no longer forced.
  assert.ok(13 <= 13)
  // Fewer categories cannot be a counterexample: 13 > 5.
  assert.ok(13 > 5)
  return '13 > 12 forces a shared month; 13 <= 13 categories does not'
})

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
for (const { name, fn } of cases) {
  const note = fn()
  console.log(`PASS ${name}`)
  if (note) console.log(`     ${note}`)
}
console.log(`\nPASS: ${cases.length} case groups.`)
console.log('LIMIT: finite enumeration of the teacher-checked examples only; it does not test teaching,')
console.log('       model behavior, or that a student can see these correspondences without support.')
