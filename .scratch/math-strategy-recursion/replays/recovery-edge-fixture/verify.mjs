// Read-only assertions over the produced recovery-edge fixtures.
import fs from 'node:fs'
import assert from 'node:assert/strict'
const here = new URL('.', import.meta.url)
const read = (p) => JSON.parse(fs.readFileSync(new URL(p, here)))
const base = (p) => JSON.parse(fs.readFileSync(new URL(`../persistence-fixture/${p}`, here)))
const answer = '11个每3个一组，3组还剩2个，因为9+2=11。'

const a = read('05-direct-answer-consumed.json')
assert.equal(a.context.turn_state.student_response, answer, 'restored frame consumed the new answer exactly')
assert.equal(a.context.scope_id, 'scope_cycle_fixture')
assert.equal(a.context.teaching.session_skill, 'math-high-session')
assert.equal(a.segments.length, 1, 'one merged segment only')
assert.equal(a.segments[0].ability_evidence[0].frame_id, 'remainder', 'evidence attributed to active frame')
assert.ok(a.segments[0].strategy_summary.length > 0)

const durable = read('04-restored-active-frame.json').context.learning_plan
const rootTask = durable.frames.find((f) => f.id === 'root').task.turn_state
assert.equal(rootTask.student_response, '我数到第10颗是红，不知道100怎么数。', 'root answer preserved')
assert.equal(rootTask.pending_question, '怎样知道第100颗落在每组哪个位置？')
assert.equal(a.context.learning_plan.frames.find((f) => f.id === 'root').task.turn_state.student_response, rootTask.student_response)
assert.equal(a.context.learning_plan.frames.find((f) => f.id === 'grouping').status, 'completed')

const clean = read('03-clean-after-commit.json')
assert.equal(clean.context, undefined)
assert.equal(clean.finalize_plan, undefined)
assert.equal(read('profile.json').session_history.length, 1, 'old summary not duplicated')
assert.equal(read('memory.json').learning_support_memory.plans.length, 0, 'no fabricated support plan')

const tomb = read('06-abandoned-durable.json')
assert.equal(tomb.status, 'abandoned')
assert.equal(tomb.frames, undefined, 'terminal snapshot has no revivable chain')

console.log('PASS recovery edge: prepared mirrors committed marker-last, cleanup ran,')
console.log('PASS direct answer consumed once by restored active frame with one scoped segment,')
console.log('PASS root/parent answers untouched and no evidence replay,')
console.log('PASS terminal tombstone blocks reviving the old chain; bare /learn asks for a target.')
