import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

// Wiring guards only: scenario replay is required to validate model behavior.
const root = new URL('../', import.meta.url)
const text = (path) => readFileSync(new URL(path, root), 'utf8')
const data = (name) => text(`learn/skills/learn-data/references/${name}.md`)
const common = text('math-common/skills/math-common/references/micro-lesson-contract.md')
const contains = (body, parts) => {
  for (const part of parts) assert.ok(body.includes(part), `missing ${part}`)
}

test('one shared micro-lesson contract is branch-loaded by both existing owners', () => {
  contains(text('math-common/skills/math-common/SKILL.md'), ['references/micro-lesson-contract.md',
    'Read only the references required by the current branch',
    'Teacher geometry needs both representation ownership and the board tool-call recipe',
    'never selected by the teaching resolver'])
  for (const band of ['low', 'high']) {
    const session = text(`math-primary-${band}/skills/math-${band}-session/SKILL.md`)
    contains(session, ['math-common', 'references/micro-lesson-contract.md', 'micro_lesson',
      'exposed_support', 'math_opening_hint', 'session_segment: null'])
    assert.match(session, /only.*branch|Only.*branch/)
    assert.match(session, /guided mainline/)
    assert.match(session, /same successful context write|first successful opening context write/)
    const core = text(`math-primary-${band}/skills/math-${band}-core/SKILL.md`)
    contains(core, ['micro-lesson-contract.md'])
  }
})

test('shared micro-lesson protects learner work and separates exposure from evidence', () => {
  contains(common, ['Agreed new learning', 'no failed attempt', 'single-turn demonstration',
    'decisive inference', 'session_segment: null', 'supported', 'independent',
    'student execution', 'Independent assessment', 'Feynman', 'full-solution choice',
    'learning_plan', 'mode: learn', 'context.activity: teaching', 'submode: learn'])
  assert.doesNotMatch(common, /math-primary-low|math-primary-high|^name:/m)
  contains(text('learn/skills/learn-core/references/pedagogy-core.md'), [
    'Other subjects keep their default guidance', 'same-task full-solution requests retain their existing paths'])
})

test('math cold opening stays within the existing gate and ahead of profile fallback', () => {
  const lifecycle = data('session-lifecycle')
  const gate = lifecycle.slice(lifecycle.indexOf('**Recommendation gate**'), lifecycle.indexOf('## 5. Resolve Target'))
  contains(gate, ['**Math cold opening**', 'bare `/learn`', 'math specialist', 'mode: learn',
    'no unfinished task/context', 'pending save', 'pending recommendation',
    'already authorized selected target', 'other subjects', 'Feynman', 'ordinary empty messages',
    'do not reorder existing candidates'])
  assert.ok(lifecycle.indexOf('**Math cold opening**') < lifecycle.indexOf('Profile candidate order'))
  contains(lifecycle, ['first write `selected_id`', 'A selected recommendation is kept across finalize',
    'actual advanced turn_state/pending point in the same successful context write',
    'do not consume it merely when creating the target context'])
  contains(text('learn/skills/learn-recommend/SKILL.md'), ['Math cold opening',
    'are not selection authorization', 'saving alone does not auto-start teaching'])
})

test('opening advice is temporary, optional and consumed with actual progress', () => {
  contains(data('target-parsing'), ['math_opening_hint', 'micro_lesson', 'practice', 'probe', 'challenge',
    'unknown value is ignored', 'Old candidates without it', 'same-target replies',
    'successful context write',
    'long-term recommendation summaries', 'general-subject records'])
  contains(data('session-schema'), ['Optional math micro-lesson state', 'exposed_support',
    'Original task, received response, and pending question remain in the existing fields',
    'no migration', 'Teacher demonstration or recommendation selection returns a null segment'])
})

for (const band of ['low', 'high']) {
  test(`${band} recommendations retain evidence limits and the one-shot opening handoff`, () => {
    const refs = `math-primary-${band}/skills/math-${band}-core/references/`
    const recommendations = text(`${refs}learning-recommendations.md`)
    contains(recommendations, ['5 session summaries', '20 recent error', 'math_opening_hint',
      'micro_lesson', 'practice', 'probe', 'challenge', 'target_context.intent',
      'next_step_candidate', 'comparable', 'unknown'])
    assert.match(recommendations, /one relevant edge|local progression cues/)
    const target = text(`${refs}math-target.md`)
    contains(target, ['scope_id', 'intent'])
    const fields = text(`${refs}math-segment-fields.md`)
    contains(fields, ['micro_lesson', 'supported', 'independent'])
  })
}

test('recommendation cards expose the opening and deduplicate same-task routes', () => {
  const recommend = text('learn/skills/learn-recommend/SKILL.md')
  contains(recommend, ['learning goal · how we begin', 'Store that opening description in `reason`',
    'Mark an unfinished-task candidate as a continuation',
    'Deduplicate by the action and pending point',
    'omit the separate `ui.recommend.keep_current` option',
    'Always offer `ui.recommend.end_learning`', 'ui.recommend.choose_own'])
})

test('selected opening expectation reuses existing temporary hints and reveal gates', () => {
  const parsing = data('target-parsing')
  const expectation = parsing.slice(parsing.indexOf('### Selected opening expectation'),
    parsing.indexOf('## After File Processing'))
  contains(expectation, ['candidate\'s `reason`', 'not in student-authored `intent`',
    '`micro_lesson`', '`practice`', '`challenge`', '`probe`',
    'separate-example protection', 'resumes the pending point without a fresh opening hint',
    'briefly explain the change', 'not a compulsory exit test',
    'Old candidates without hints', 'no new mode or performance evidence'])
  for (const band of ['low', 'high']) {
    const base = `math-primary-${band}/skills/math-${band}`
    contains(text(`${base}-core/references/learning-recommendations.md`), [
      'For new candidates', 'first activity in `reason`', 'Selected opening expectation',
      'A continuation instead retains the current scope and pending point'])
    contains(text(`${base}-session/SKILL.md`), ['read and apply **Selected opening expectation**',
      'references/target-parsing.md', 'goal-and-activity offer the student accepted'])
  }
})

test('opening-expectation replay cases include continuation, new learning and overrides', () => {
  contains(text('learn/tests/guided-teaching-scenarios.md'), [
    '推荐目标与活动承诺（待回放）', '打酒题已找到剩3升',
    '先看图，再接手一步', '先不换', '卡片恢复', '不强制退出测验'])
})

test('manual replay checklists cover failed writes, restore and original-task branches', () => {
  contains(text('learn/tests/guided-teaching-scenarios.md'), ['selected_id 写失败',
    'math_opening_hint', 'Feynman', '静态字符串检查不验证写失败'])
  contains(text('math-common/tests/teaching-scenarios.md'), ['主动新授契约（待回放）',
    'null segment', '原题完整解', '加载失败'])
})
