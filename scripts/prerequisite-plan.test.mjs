import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import test from 'node:test'

// Installed-skill protocol guards, not a runtime implementation or model replay.
const url = (name) => new URL(`../learn/skills/learn-data/references/${name}.md`, import.meta.url)
const read = (name) => existsSync(url(name)) ? readFileSync(url(name), 'utf8') : ''

test('learning-plan protocol preserves one owner, parent snapshots and a single active response', () => {
  const plan = read('learning-plan')
  for (const field of ['version', 'root_scope_id', 'active_frame_id', 'parent_id', 'tool_evidence',
    'return_condition', 'confirmed_gaps', 'unverified_dependencies', 'await_student']) assert.ok(plan.includes(field), field)
  assert.match(plan, /Before pushing.*synchronize the parent/s)
  assert.match(plan, /return only to its immediate parent/)
  assert.match(plan, /no new scope or provider/)
  assert.match(plan, /Only the active frame accepts/)
  assert.match(read('session-schema'), /references\/learning-plan\.md/)
})

test('owner-provided plan changes authorize snapshot-only four-mirror saves without fabricated consent', () => {
  const plan = read('learning-plan')
  for (const rule of ['provided_to_student', 'owner_session_skill', 'current_state.learning_plan',
    'same id and revision', 'tombstone', 'four full mirrors', 'original finalize_plan']) assert.ok(plan.includes(rule), rule)
  assert.match(plan, /student_requested_save.*remains exclusive/)
  const finalize = read('finalize-session')
  assert.match(finalize, /changed authorized learning_plan/)
  assert.match(finalize, /record_kind: learning_plan/)
  assert.match(finalize, /neither.*changed authorized learning_plan/)
  assert.match(read('profile-schema'), /current_state.learning_plan/)
})

test('finalized plan continuation restores root identity without overriding a new goal or performance cursor', () => {
  const lifecycle = read('session-lifecycle')
  for (const rule of ['learning_plan_update', 'learning_plan_authorization', 'current_state.learning_plan',
    'explicit new goal takes priority', 'new session_id', 'await_student', 'terminal tombstone']) assert.ok(lifecycle.includes(rule), rule)
  assert.match(lifecycle, /snapshot commit.*before.*clear/s)
  const plan = read('learning-plan')
  assert.match(plan, /continue the same task or explicitly continue the plan/)
  assert.match(plan, /restore.*root_scope_id.*teaching/s)
  assert.match(plan, /completed\/abandoned.*never auto-resume/)
  const save = readFileSync(new URL('../learn/skills/learn-save/SKILL.md', import.meta.url), 'utf8')
  assert.match(save, /current concrete learning_plan/)
  assert.match(save, /no duplicate support_events/)
})

test('invalid or stale plan updates stop before no-op cleanup can discard the task chain', () => {
  const finalize = read('finalize-session')
  assert.match(finalize, /invalid or stale learning_plan[\s\S]*STOP before No-op/)
  const lifecycle = read('session-lifecycle')
  assert.match(lifecycle, /invalid or stale learning_plan[\s\S]*must not clear context/)
})

test('a direct new answer survives recovery of a pending automatic checkpoint and is consumed once', () => {
  const lifecycle = read('session-lifecycle')
  assert.match(lifecycle, /direct answer to the saved active frame/)
  assert.match(lifecycle, /original message exactly once/)
  assert.match(lifecycle, /before the generic restore-save row/)
})

test('an abandoned goal cannot reopen through an unscoped history fallback', () => {
  const lifecycle = read('session-lifecycle')
  assert.match(lifecycle, /terminal learning_plan.*no unfinished context/)
  assert.match(lifecycle, /before the ordinary candidate chain/)
  assert.match(lifecycle, /unscoped history.*not authorization/)
})
