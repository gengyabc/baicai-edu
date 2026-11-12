import assert from 'node:assert/strict'

// Teacher-key verification only. This checks the mathematics of the two
// counterexample cases in issue 12; it is not a teaching/model replay and its
// answers are never shown to an independent exploring student.
const range = (n) => Array.from({ length: n }, (_, i) => i + 1)

// ---- Case A: 4x4 board, black iff row + column is even ----------------
const cells = range(4).flatMap((r) => range(4).map((c) => ({ r, c })))
const isBlack = ({ r, c }) => (r + c) % 2 === 0
const removed = [[1, 2], [2, 1], [3, 3], [4, 4]]
const removedKeys = new Set(removed.map(([r, c]) => `${r},${c}`))
const remaining = cells.filter(({ r, c }) => !removedKeys.has(`${r},${c}`))

assert.equal(cells.length, 16)
assert.equal(removed.length, 4)
// The deleted cells are two white and two black, so deletion alone preserves balance.
assert.equal(removed.filter(([r, c]) => (r + c) % 2 === 0).length, 2)
assert.equal(removed.filter(([r, c]) => (r + c) % 2 === 1).length, 2)
// Premise P: equal numbers of black and white cells.
assert.equal(remaining.length, 12)
assert.equal(remaining.filter(isBlack).length, 6)
assert.equal(remaining.filter((cell) => !isBlack(cell)).length, 6)
// Conclusion Q fails: (1,1) is still there, and both neighbours that a
// domino could use to cover it have been deleted.
const present = ({ r, c }) => !removedKeys.has(`${r},${c}`)
const oneOne = { r: 1, c: 1 }
assert.ok(present(oneOne))
assert.ok(isBlack(oneOne))
assert.equal([{ r: 1, c: 2 }, { r: 2, c: 1 }].filter(present).length, 0)
// A domino covers two side-adjacent cells. Count the undirected side-adjacency
// edges of the remaining region two independent ways and confirm none touches (1,1).
const neighbours = (r, c) => [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]
const inBoard = ([r, c]) => r >= 1 && r <= 4 && c >= 1 && c <= 4
// Full 4x4 board: 4 rows * 3 horizontal sides + 4 columns * 3 vertical sides.
assert.equal(4 * 3 + 4 * 3, 24)
const sidesAt = ([r, c]) => neighbours(r, c).filter(inBoard).length
const removedSides = removed.reduce((sum, cell) => sum + sidesAt(cell), 0)
// Deleted cells are pairwise non-adjacent: corners remove 2 sides each,
// the inner cell (3,3) removes 4, so the sides they remove are distinct.
assert.equal(sidesAt([1, 2]), 3)
assert.equal(sidesAt([2, 1]), 3)
assert.equal(sidesAt([3, 3]), 4)
assert.equal(sidesAt([4, 4]), 2)
assert.equal(removedSides, 12)
assert.equal(24 - 12, 12, 'remaining region has 12 side-adjacency edges')
// Directed pairs: every remaining edge seen from both ends.
const adjacentPairs = remaining.flatMap((cell) => {
  const next = neighbours(cell.r, cell.c).filter(([r, c]) => inBoard([r, c]) && present({ r, c }))
  return next.map(([r, c]) => [cell, { r, c }])
})
assert.equal(adjacentPairs.length, 2 * 12, 'each of the 12 edges appears once from each end')
assert.ok(adjacentPairs.every(([a, b]) => isBlack(a) !== isBlack(b)), 'every adjacent pair is one black and one white')
assert.equal(adjacentPairs.filter(([a, b]) => [a, b].some((cell) => cell.r === 1 && cell.c === 1)).length, 0,
  '(1,1) cannot be covered by any remaining domino')
// Necessity direction: every domino covers one black and one white, so a
// balanced board is required. The case above violates Q while keeping P,
// so balance is not sufficient; it says nothing against necessity.
assert.ok(remaining.every((cell) => isBlack(cell) || !isBlack(cell)))

// ---- Case B: two disjoint triangles, all degrees 2 ----------------
const triangles = [['A', 'B', 'C'], ['D', 'E', 'F']]
const edges = triangles.flatMap(([x, y, z]) => [[x, y], [y, z], [z, x]])
const vertices = [...new Set(edges.flat())]
const degree = (v) => edges.filter((edge) => edge.includes(v)).length
const oddVertices = vertices.filter((v) => degree(v) % 2 === 1)

assert.equal(edges.length, 6)
assert.equal(vertices.length, 6)
assert.equal(edges.flat().length, 12, 'each of 6 edges contributes one incidence to each end')
assert.ok(vertices.every((v) => degree(v) === 2), 'all degrees are even (2)')
assert.equal(oddVertices.length, 0)
// Premise "all degrees even" holds; conclusion "one stroke, every edge once" fails
// because the edge set has two components. Check each triangle alone is traversable.
const walk = (t) => [t[0], t[1], t[2], t[0]]
for (const t of triangles) {
  const stepEdges = walk(t).slice(1).map((to, i) => [walk(t)[i], to])
  const used = new Set(stepEdges.map(([a, b]) => [a, b].sort().join('')))
  const local = new Set(edges.filter((e) => t.includes(e[0])).map(([a, b]) => [a, b].sort().join('')))
  assert.equal(used.size, 3, `triangle ${t.join('')} walk uses three edges`)
  assert.deepEqual([...used].sort(), [...local].sort(), `triangle ${t.join('')} walk covers each edge exactly once`)
}
// Connectivity is the premise that fails for the two-triangle union.
const components = () => {
  const seen = new Set()
  const groups = []
  for (const start of vertices) {
    if (seen.has(start)) continue
    const group = []
    const stack = [start]
    seen.add(start)
    while (stack.length) {
      const v = stack.pop()
      group.push(v)
      for (const [a, b] of edges) {
        if (a === v && !seen.has(b)) { seen.add(b); stack.push(b) }
        if (b === v && !seen.has(a)) { seen.add(a); stack.push(a) }
      }
    }
    groups.push(group)
  }
  return groups
}
const connectedParts = components()
assert.equal(connectedParts.length, 2, 'the union is disconnected')
assert.equal(connectedParts.map((g) => g.length).join(','), '3,3')
// The one-stroke criterion used here (connected and at most two odd vertices)
// evaluates our finite instances only; a general proof of the strengthened
// claim is outside this script and belongs to the teacher's own verification.
const eulerian = (vs, es, parts) => {
  if (parts.length !== 1) return false
  return vs.filter((v) => es.filter((e) => e.includes(v)).length % 2 === 1).length <= 2
}
assert.equal(eulerian(vertices, edges, connectedParts), false, 'the union has no one-stroke walk')
assert.equal(eulerian(vertices, edges, [vertices]), true, 'same degrees would pass if it were connected')
// The strengthened claim requiring connectivity is not refuted by this
// case: every component, alone, is connected and has all even degrees.
for (const group of connectedParts) {
  const es = edges.filter(([a, b]) => group.includes(a) && group.includes(b))
  assert.equal(group.length, 3)
  assert.ok(group.every((v) => es.filter((e) => e.includes(v)).length % 2 === 0))
}

console.log('PASS: Case A 4x4 delete (1,2)(2,1)(3,3)(4,4): 12 cells, 6 black, 6 white, (1,1) isolated; necessity-not-sufficiency')
console.log('PASS: Case B two disjoint triangles: all degrees 2, no odd vertices, but 2 components and no one-stroke walk; each triangle alone has one. Refutes even-degrees-only; leaves the connected strengthened claim intact')
