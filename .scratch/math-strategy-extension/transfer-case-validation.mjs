import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// Finite checks of the teacher-only authored-problem cases for issue 10.
// This checks arithmetic only. It does not simulate teaching, model behavior,
// or what a student can see without support.
const problems = [
  { title: '20 tickets, 2 and 5 yuan, total 64', tickets: 20, cheap: 2, dear: 5, total: 64 },
  { title: '20 tickets, 2 and 5 yuan, total 65', tickets: 20, cheap: 2, dear: 5, total: 65 },
  { title: '20 tickets, 2 and 5 yuan, total 70', tickets: 20, cheap: 2, dear: 5, total: 70 },
  { title: '20 tickets, 2 and 5 yuan, total 41', tickets: 20, cheap: 2, dear: 5, total: 41 },
  { title: '20 tickets, 2 and 5 yuan, total 58', tickets: 20, cheap: 2, dear: 5, total: 58 },
]

for (const p of problems) {
  const gap = p.dear - p.cheap
  const allCheap = p.tickets * p.cheap
  const dearCount = (p.total - allCheap) / gap
  const solution = Number.isInteger(dearCount) && dearCount >= 0 && dearCount <= p.tickets
  console.log(`CASE ${p.title}: gap ${gap}, all cheap ${allCheap}, (${p.total}−${allCheap})/${gap} = ${dearCount}, solvable ${solution}`)
  if (solution) {
    const cheapCount = p.tickets - dearCount
    assert.equal(dearCount + cheapCount, p.tickets)
    assert.equal(dearCount * p.dear + cheapCount * p.cheap, p.total)
    console.log(`  check: ${dearCount} dear + ${cheapCount} cheap = ${p.tickets} tickets; ${dearCount}×${p.dear} + ${cheapCount}×${p.cheap} = ${p.total} yuan`)
  } else {
    // No whole count of either kind can reach the total: enumerate to confirm.
    let found = null
    for (let k = 0; k <= p.tickets; k += 1) {
      if (k * p.dear + (p.tickets - k) * p.cheap === p.total) found = k
    }
    assert.equal(found, null, `no whole-ticket split reaches ${p.total}`)
    console.log(`  check: every whole split of ${p.tickets} tickets was tried; none reaches ${p.total}`)
  }
}

// The reachable totals are exactly the arithmetic progression 40 + 3k, k = 0..20.
const reachable = []
for (let k = 0; k <= 20; k += 1) reachable.push(40 + 3 * k)
assert.equal(reachable.length, 21)
assert.equal(reachable[0], 40)
assert.equal(reachable.at(-1), 100)
assert.deepEqual(reachable.filter((t) => [43, 46, 70, 82].includes(t)), [43, 46, 70, 82])
for (const t of [41, 42, 65, 98, 99]) assert.ok(!reachable.includes(t), `${t} is not reachable`)
for (const t of [58, 61, 82, 85]) assert.ok(reachable.includes(t), `${t} is reachable`)
console.log(`REACHABLE totals 40..100 by 3: ${reachable.join(', ')}`)
console.log('UNREACHABLE samples: 41, 42, 65, 98, 99 (no whole-ticket split)')

// 65 is unreachable and the nearest reachable neighbours are 64 and 67, so
// a slip of one yuan already changes the problem's answer, not just its numbers.
const neighbours = reachable.filter((t) => Math.abs(t - 65) === 1 || Math.abs(t - 65) === 2)
console.log(`NEIGHBOURS of 65: ${neighbours.join(', ')} (neither is 65)`)

// The agent file must not leak the answers into any student-visible region:
// every checked answer lives under the single teacher-only heading.
const supplement = readFileSync('math-primary-high/skills/math-high-core/references/math-student-problem-design.md', 'utf8')
const teacherOnly = supplement.split('## Teacher-only checked cases')[1]
assert.ok(teacherOnly, 'teacher-only section exists')
assert.ok(teacherOnly.includes('(64−40)/3 = 8'))
assert.ok(teacherOnly.includes('25/3'))
const beforeTeacherOnly = supplement.split('## Teacher-only checked cases')[0]
for (const leaked of ['8 dearer', '25/3', '= 8', '12 cheap']) {
  assert.ok(!beforeTeacherOnly.includes(leaked), `case answer leaked before teacher-only section: ${leaked}`)
}
console.log('PASS: checked answers stay behind the teacher-only heading')

console.log('\nPASS: finite enumeration of teacher cases only; no teaching, model, or student claim.')
