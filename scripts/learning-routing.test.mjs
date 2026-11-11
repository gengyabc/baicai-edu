import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

// Static contract checks, not execution of a model or student session.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const ref = (name) => read(`learn/skills/learn-data/references/${name}.md`)
// Skill prose is English; phrase checks are case-insensitive.
const hasAll = (content, phrases) => {
  const lower = content.toLowerCase()
  for (const phrase of phrases) assert.ok(lower.includes(phrase.toLowerCase()), phrase)
}

test('one resolver keeps real identity and selects a complete applicable teaching implementation', () => {
  const resolver = ref('teaching-resolver')
  for (const rule of ['core_skill', 'session_skill', 'evidence_namespace', 'general_v1',
    'learn-general-core', 'learn-general-session', 'scope_id', 'task_', 'supported_stages',
    'no hot replacement', 'finalize_plan', 'target classification', 'initialization', 'recommendation']) {
    assert.ok(resolver.toLowerCase().includes(rule.toLowerCase()), rule)
  }
  assert.match(ref('subject-contract'), /teaching-resolver\.md/)
})

test('new mathematics tasks prefer explicit grade over band fit and default to low without grade', () => {
  const resolver = ref('teaching-resolver')
  const mathematics = resolver.split('## Mathematics band selection')[1]?.split(/\n## /)[0] ?? ''
  hasAll(mathematics.replaceAll('`', ''), ['For a new mathematics task',
    'an explicit grade takes precedence over overlapping supported_stages',
    'grades 1–3 prefer math-low-core / math-low-session',
    'grades 4–6 prefer math-high-core / math-high-session',
    'Without an explicit grade, prefer math-low-core / math-low-session'])
  // Grade routing is new-task selection, never permission to replace an active owner.
  assert.match(resolver, /no hot replacement/i)
})

test('mathematics restore preserves the original band and asks when legacy provenance is missing', () => {
  const resolver = ref('teaching-resolver')
  const legacy = resolver.split('### Legacy mathematics restore')[1]?.split(/\n## /)[0] ?? ''
  hasAll(legacy, ['unique skill names keeps those names',
    'explicit package/provider metadata or reliable original loading provenance',
    'turn_state.active_leaf', 'synchronize the session pointer',
    'Keep the session id, scope, materials, pending question, and all historical evidence',
    'do not rewrite old segments', "student's current grade",
    'When the old band cannot be established, ask which band to continue with before teaching',
    'migration inputs only, not loadable skills'])
})

test('bundled general teaching satisfies the same contract without claiming specialist mastery', () => {
  const core = read('learn/skills/learn-general-core/SKILL.md')
  for (const role of ['Target classification', 'Grade defaults', 'Profile fields', 'Diagnosis rules', 'Learning recommendation']) assert.ok(core.includes(role), role)
  const session = read('learn/skills/learn-general-session/SKILL.md')
  hasAll(session, ['sole teaching owner', 'general_v1', 'scope_id', 'performance under support', 'AI-collaboration capability', 'feynman',
    'do not write logs or the long-term profile yourself', 'Do not fabricate mastery levels or specialist diagnoses', 'learn-support', 'already sent'])
  assert.match(ref('session-lifecycle'), /teaching\.session_skill/)
})

test('public entries, initialization and recommendations share resolver and preserve authorization', () => {
  for (const skill of ['learn', 'learn-feynman', 'learn-recommend', 'learn-errors']) {
    assert.match(read(`learn/skills/${skill}/SKILL.md`), /teaching-resolver\.md/, skill)
  }
  assert.match(read('learn/skills/learn-data/SKILL.md'), /teaching-resolver\.md/)
  assert.match(read('learn/skills/learn-core/SKILL.md'), /learn-support/)
  assert.match(ref('session-lifecycle'), /scope_id/)
  assert.match(read('learn/skills/learn-recommend/SKILL.md'), /cross-domain goal exploration/i)
})

test('cross-subject activation carries a durable origin pointer until target context is committed', () => {
  const transition = ref('teaching-transition')
  for (const rule of ['pending_transition', 'from_subject', 'from_session_id', 'to_session_id',
    'selected_id', 'are not moved', 'successfully written into the new context', 'already has a different', 'does not regenerate it']) assert.ok(transition.includes(rule), rule)
  assert.match(read('learn/skills/learn-data/SKILL.md'), /pending_transition, run `references\/teaching-transition\.md` before initializing target files/)
  assert.match(ref('session-lifecycle'), /teaching-transition\.md/)
})

test('general continuation resolves saved progress before unrelated specialist history', () => {
  const lifecycle = ref('session-lifecycle')
  assert.match(lifecycle, /General continuation[\s\S]*general_progress/)
  assert.match(lifecycle, /current_state\.scope_id/)
  assert.match(lifecycle, /do not fall back to unrelated specialist history/)
  assert.match(ref('finalize-session'), /target_context[^\n]*material references/)
  assert.match(ref('finalize-session'), /active_focus[^\n]*teaching, and scope_id must be written/)
})
