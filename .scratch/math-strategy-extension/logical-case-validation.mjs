import assert from 'node:assert/strict'

// Finite teacher-key verification only: this is not a teaching/model replay.
const colors = ['red', 'blue', 'green']
const allAssignments = colors.flatMap((a) => colors.flatMap((b) => colors.map((c) => [a, b, c])))
const onceEach = ([a, b, c]) => new Set([a, b, c]).size === 3
const remainingClues = ([a, b]) => a !== 'red' && b !== 'blue'
const originalClues = (assignment) => remainingClues(assignment) && assignment[2] === 'red'
const candidates = allAssignments.filter(onceEach)
assert.equal(allAssignments.length, 27)
assert.equal(candidates.length, 6)
assert.deepEqual(candidates.filter(originalClues), [['blue', 'green', 'red']])
assert.deepEqual(candidates.filter(remainingClues), [
  ['blue', 'red', 'green'], ['blue', 'green', 'red'], ['green', 'red', 'blue'],
])
assert.deepEqual(candidates.filter((assignment) => originalClues(assignment) && assignment[0] === 'red'), [])
// An unknown/removed repetition rule is not silently replaced with once-each.
assert.equal(allAssignments.filter(originalClues).length, 4)
// A locally allowed value can fail to extend: A=green has no completion in the base problem.
assert.deepEqual(candidates.filter((assignment) => originalClues(assignment) && assignment[0] === 'green'), [])
console.log('PASS: base unique witness, LB1 exact three, LB2 contradiction, repetition-rule and local/global boundaries (27 finite assignments)')
