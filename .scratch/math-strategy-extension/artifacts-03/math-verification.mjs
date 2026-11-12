// Mathematical examples only: not a teaching/model replay or a new runtime test seam.
import assert from 'node:assert/strict'

const divisors = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0)
assert.deepEqual(divisors(36), [1, 2, 3, 4, 6, 9, 12, 18, 36])
assert.deepEqual(divisors(24), [1, 2, 3, 4, 6, 8, 12, 24])
const cubes = new Set(Array.from({ length: 10 }, (_, i) => (i + 1) ** 3))
assert.deepEqual(Array.from({ length: 6 }, (_, i) => i + 1).filter((m) => cubes.has(36 * m)), [6])
assert.deepEqual(Array.from({ length: 9 }, (_, i) => i + 1).filter((m) => cubes.has(24 * m)), [9])
assert.equal(36 * 1, 6 ** 2)
assert.equal(36 * 6, 6 ** 3)
assert.equal(24 * 9, 6 ** 3)
assert.deepEqual(divisors(2), [1, 2])
assert.equal(2 % 2, 0)
assert.deepEqual(divisors(1), [1])
console.log('PASS: 36/24 divisors; exhaustive smaller-factor cube exclusion; square factor 1; prime boundaries 1/2.')
console.log('LIMIT: finite arithmetic checks only; general pairing, correspondence and prime-factor necessity require the recorded argument review, not sampling.')
