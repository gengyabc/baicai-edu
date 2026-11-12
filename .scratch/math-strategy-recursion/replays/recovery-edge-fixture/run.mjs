// Single-agent, explicit fixture operations for the recovery edge branch.
// This is NOT a host runtime, scheduler, or automatic engine. It performs the
// protocol steps once so the produced files can be checked by verify.mjs.
import fs from 'node:fs'
import assert from 'node:assert/strict'

const here = new URL('.', import.meta.url)
const base = new URL('../persistence-fixture/', here)
const readB = (p) => JSON.parse(fs.readFileSync(new URL(p, base)))
const write = (p, obj) => {
  fs.writeFileSync(new URL(p, here), JSON.stringify(obj, null, 2) + '\n')
  trace.push(`write ${p} OK`)
}
const trace = []

const prepared = readB('05-prepared.json')
const plan = prepared.finalize_plan
assert.equal(plan.record_kind, 'mixed')
const mirrors = plan.target_files

// A. Commit the prepared four mirrors in protocol order, marker last.
write('00-prepared-profile.json', mirrors.profile)
write('01-prepared-memory.json', mirrors.memory)
write('02-prepared-milestones.json', mirrors.milestones)
write('profile.json', mirrors.profile)
write('memory.json', mirrors.memory)
write('milestones.json', mirrors.milestones)
write('current_state.json', mirrors.current_state)
trace.push(`A: four mirrors committed in order; current_state written last with marker ${mirrors.current_state.last_finalized_session_id}`)

// B. Cleanup after success: keep identity, drop context/finalize_plan, empty segments.
const clean = {
  session_id: prepared.session_id,
  entry_point: prepared.entry_point,
  started_at: prepared.started_at,
  updated_at: '2026-11-12T00:52:00Z',
  segments: []
}
write('03-clean-after-commit.json', clean)
trace.push('B: cleanup removed context, finalize_plan and segments')

// C. New session resumes the same nonterminal chain from the durable snapshot,
//    projecting the active frame's whole task into context.
const durable = mirrors.current_state.learning_plan
assert.equal(durable.status, 'active')
const active = durable.frames.find((f) => f.id === durable.active_frame_id)
assert.equal(active.id, 'remainder')
const edge = {
  session_id: 'sess_edge_02',
  entry_point: 'learn',
  started_at: '2026-11-12T00:52:10Z',
  updated_at: '2026-11-12T00:52:10Z',
  context: {
    focus: active.task.focus,
    mode: active.task.mode,
    activity: active.task.activity,
    target_context: active.task.target_context,
    materials: active.task.materials,
    turn_state: active.task.turn_state,
    scope_id: durable.root_scope_id,
    teaching: durable.teaching,
    learning_plan: durable
  },
  segments: []
}
write('04-restored-active-frame.json', edge)
trace.push('C: new empty-segment session restored root scope/teaching and active frame task')

// C2. The student answers the pending question directly (no /learn, no /learn-save).
const answer = '11个每3个一组，3组还剩2个，因为9+2=11。'
const reply = '你把11个分成了3个完整组，还剩2个。这里的2表示已经分完3组之后不够再装一组的数量。用你自己的这个分法回答原题：11个每3个装一盒，能装满几盒？'
const seg = {
  focus: '余数',
  subject: 'math',
  mode: 'learn',
  submode: 'practice',
  source: 'profile',
  strategy_summary: '学生对11个每3个一组的直接作答为3组余2，并给出9+2=11的理由；完整组定义此前由教师说明，分组与剩余解释由学生完成。',
  strengths: ['能把剩余2与已分完的3组分别说明'],
  difficulties: ['尚未把该分组结论用于同一原题的装盒表述'],
  next_step_candidate: '用同一分组回答能装满几盒',
  recommended_targets: ['余数在装盒情境中的意义'],
  ability_evidence: [{ kind: 'supported', observation: '自行分成3组余2并解释9+2=11', conditions: '完整组定义此前由教师说明；未展示新数量上的独立分组或迁移', frame_id: 'remainder' }]
}
const consumed = JSON.parse(JSON.stringify(edge))
consumed.updated_at = '2026-11-12T00:52:20Z'
consumed.context.turn_state = {
  ...active.task.turn_state,
  student_response: answer,
  pending_question: '11个每3个装一盒，能装满几盒？'
}
consumed.context.learning_plan.revision = durable.revision + 1
consumed.segments = [seg]
write('05-direct-answer-consumed.json', consumed)
write('05-reply.md', reply)
trace.push('C2: original message consumed once by the restored active frame; one segment appended')

// D. Bare /learn with a terminal plan: no reopening of the old scope.
const tombstone = readB('current_state.json').learning_plan
assert.equal(tombstone.status, 'abandoned')
write('06-abandoned-durable.json', tombstone)
write('07-bare-learn.md', '你上次那条计划已经结束，不会自动接回原题。今天想学什么？可以从你现在愿意试的一个小问题开始。')
trace.push('D: bare /learn with terminal plan asks for a target instead of reopening history')

fs.writeFileSync(new URL('trace.json', here), JSON.stringify(trace, null, 2) + '\n')
console.log('run complete; see verify.mjs')
