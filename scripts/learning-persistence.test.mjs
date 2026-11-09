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
  assert.match(lifecycle, /支持闸门/)
  assert.match(lifecycle, /activity: support/)
  assert.match(lifecycle, /segment.*null/)
  assert.match(lifecycle, /declined/)
})

test('support-only plans use the same prepared four-file replay and marker-last cleanup', () => {
  const finalize = read('finalize-session')
  for (const rule of ['support_events', 'learning_support_memory', 'student_requested_save',
    'general_progress', 'general_v1', 'support_only', 'correction', '相同镜像']) assert.ok(finalize.includes(rule), rule)
  assert.match(finalize, /segments.*support_events.*为空/)
  assert.match(finalize, /profile → memory → milestones → current_state/)
  assert.match(finalize, /先.*finalize_plan.*写入/)
  assert.match(finalize, /support_events.*清/)
  const profile = read('profile-schema')
  for (const field of ['general_progress', 'learning_support_memory', 'support_preferences', 'education_stage']) assert.ok(profile.includes(field), field)
})
