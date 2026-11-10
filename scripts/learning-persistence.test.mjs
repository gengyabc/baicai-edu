import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

// Protocol guards only. Model decisions and actual filesystem failure replay need separate acceptance.
const read = (name) => readFileSync(new URL(`../learn/skills/learn-data/references/${name}.md`, import.meta.url), 'utf8')

test('support can resume without a fabricated task or performance segment', () => {
  const schema = read('session-schema')
  for (const field of ['learning_support', 'support_events', 'student_requested_save', 'scope_id',
    'primary_need', 'resume_question', 'ability_evidence', 'exposure', 'general_v1']) assert.ok(schema.includes(field), field)
  const lifecycle = read('session-lifecycle')
  assert.match(lifecycle, /### Support gate/)
  assert.match(lifecycle, /activity: support/)
  assert.match(lifecycle, /segment.*null/)
  assert.match(lifecycle, /declined/)
})

test('support-only plans use the same prepared four-file replay and marker-last cleanup', () => {
  const finalize = read('finalize-session')
  for (const rule of ['support_events', 'learning_support_memory', 'student_requested_save',
    'general_progress', 'general_v1', 'support_only', 'correction', 'same mirrors']) assert.ok(finalize.includes(rule), rule)
  assert.match(finalize, /both segments and support_events are empty/)
  assert.match(finalize, /profile → memory → milestones → current_state/)
  assert.match(finalize, /first write `finalize_plan` into the current log/)
  assert.match(finalize, /clear[^\n]*support_events/i)
  const profile = read('profile-schema')
  for (const field of ['general_progress', 'learning_support_memory', 'support_preferences', 'education_stage']) assert.ok(profile.includes(field), field)
})

test('save prepares a newly requested support plan even when an empty or submitted log already exists', () => {
  const save = readFileSync(new URL('../learn/skills/learn-save/SKILL.md', import.meta.url), 'utf8')
  for (const rule of ["handle this turn's new save intent", 'pure-support context exists', 'old marker', 'new session_id', 'support_events', 'correction']) assert.ok(save.includes(rule), rule)
  assert.ok(save.indexOf("handle this turn's new save intent") < save.indexOf('## Final Save'), 'new request preparation precedes finalization')
})
