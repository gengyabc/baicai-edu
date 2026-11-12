import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
const base = 'math-primary-high/skills/math-high-core/'

// Architecture only: these guards cannot establish model teaching behavior.
test('route counting and network construction are conditionally reachable through the existing owner', () => {
  const target = 'references/path-network-construction.md'
  for (const file of ['SKILL.md', 'references/mathematical-strategies.md', 'references/math-teaching-core.md']) {
    const row = read(base + file).split('\n').find((line) => line.includes(target))
    assert.ok(row, `${file}: reachable reference`)
    assert.match(row, /route|path|network/i, `${file}: structural trigger`)
  }
  const contract = read(base + target)
  for (const dependency of ['references/mathematical-strategies.md', 'references/proof-teaching.md',
    'references/prerequisite-learning.md', 'references/topic-map.md']) {
    assert.ok(contract.includes(dependency), dependency)
  }
  assert.match(contract, /math-high-session/)
  assert.doesNotMatch(contract, /^name:|^supported_stages:|context\.learning_plan\s*=|https?:\/\//m)
})

// Independent finite case verification, NOT a runtime route solver or model replay.
// Enumerate move strings rather than reuse the documented last-step recurrence.
function latticeRoutes(endX, endY, blocked = []) {
  const routes = []
  function visit(x, y, route) {
    if (blocked.some(([bx, by]) => bx === x && by === y)) return
    if (x === endX && y === endY) {
      routes.push(route)
      return
    }
    if (x < endX) visit(x + 1, y, route + 'R')
    if (y < endY) visit(x, y + 1, route + 'U')
  }
  visit(0, 0, '')
  return routes
}

test('finite W/WB1 examples enumerate six routes, preserve the three listed routes, and avoid the forbidden point', () => {
  assert.deepEqual(latticeRoutes(2, 2), ['RRUU', 'RURU', 'RUUR', 'URRU', 'URUR', 'UURR'])
  assert.deepEqual(latticeRoutes(2, 2, [[1, 1]]), ['RRUU', 'UURR'])
  const counts = (blocked) => [0, 1, 2].map((y) => [0, 1, 2].map((x) => latticeRoutes(x, y, blocked).length))
  assert.deepEqual(counts([]), [[1, 1, 1], [1, 2, 3], [1, 3, 6]])
  assert.deepEqual(counts([[1, 1]]), [[1, 1, 1], [1, 0, 1], [1, 1, 2]])
  assert.deepEqual(latticeRoutes(1, 1), ['RU', 'UR'])
  assert.deepEqual(latticeRoutes(0, 0), [''])
  assert.deepEqual(latticeRoutes(2, 2, [[0, 0]]), [])
  assert.deepEqual(latticeRoutes(2, 0, [[1, 0]]), [])
})

test('WB2 supplies distinct legal cycle-insertion witnesses, not a finite count of all walks', () => {
  const witnesses = Array.from({ length: 5 }, (_, n) => 'RL'.repeat(n) + 'RRUU')
  assert.equal(new Set(witnesses).size, 5)
  for (const route of witnesses) {
    let x = 0
    let y = 0
    for (const move of route) {
      if (move === 'R') x++
      if (move === 'L') x--
      if (move === 'U') y++
      assert.ok(x >= 0 && x <= 2 && y >= 0 && y <= 2)
    }
    assert.deepEqual([x, y], [2, 2])
  }
  // Infinity needs the arbitrary-n argument in the reference, not these five samples.
})

function allEdgeTrails(edges) {
  const vertices = [...new Set(edges.flat())]
  const trails = []
  function visit(at, used, route) {
    if (used.size === edges.length) {
      trails.push(route)
      return
    }
    edges.forEach(([a, b], i) => {
      if (used.has(i) || (at !== a && at !== b)) return
      const next = at === a ? b : a
      visit(next, new Set([...used, i]), [...route, next])
    })
  }
  for (const start of vertices) visit(start, new Set(), [start])
  return trails
}

test('finite WB3–WB5 edge-trail enumeration distinguishes necessary conditions from feasible witnesses', () => {
  const triangle = [['A', 'B'], ['B', 'C'], ['C', 'A']]
  const disconnected = [...triangle, ['D', 'E'], ['E', 'F'], ['F', 'D']]
  const star = [['O', 'A'], ['O', 'B'], ['O', 'C']]
  const degrees = (edges) => Object.values(edges.flat().reduce((counts, v) => {
    counts[v] = (counts[v] ?? 0) + 1
    return counts
  }, {})).sort((a, b) => a - b)
  assert.deepEqual(degrees(disconnected), [2, 2, 2, 2, 2, 2])
  assert.deepEqual(allEdgeTrails(disconnected), [])
  assert.deepEqual(degrees(star), [1, 1, 1, 3])
  assert.deepEqual(allEdgeTrails(star), [])
  const feasible = allEdgeTrails(triangle)
  assert.ok(feasible.some((route) => route.join('') === 'ABCA'))
  // For this verifier only: distinct ordered vertex sequences with free start/end.
  // A single witness alone does not establish this complete list or uniqueness.
  assert.equal(feasible.length, 6)
})
