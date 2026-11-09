import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

// Static contract checks, not execution of a model or student session.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const ref = (name) => read(`learn/skills/learn-data/references/${name}.md`)

test('one resolver keeps real identity and selects a complete applicable teaching implementation', () => {
  const resolver = ref('teaching-resolver')
  for (const rule of ['core_skill', 'session_skill', 'evidence_namespace', 'general_v1',
    'learn-general-core', 'learn-general-session', 'scope_id', 'task_', 'supported_stages',
    '不热替换', 'finalize_plan', '目标分类', '初始化', '推荐']) {
    assert.ok(resolver.includes(rule), rule)
  }
  assert.match(ref('subject-contract'), /teaching-resolver\.md/)
})

test('bundled general teaching satisfies the same contract without claiming specialist mastery', () => {
  const core = read('learn/skills/learn-general-core/SKILL.md')
  for (const role of ['目标分类', '年级默认', '档案字段', '诊断规则', '学习推荐']) assert.ok(core.includes(role), role)
  const session = read('learn/skills/learn-general-session/SKILL.md')
  for (const rule of ['唯一教学', 'general_v1', 'scope_id', '支持下表现', 'AI 协作能力', 'feynman',
    '不自写', '不伪造', 'learn-support', '已发送']) assert.ok(session.includes(rule), rule)
  assert.match(ref('session-lifecycle'), /teaching\.session_skill/)
})

test('public entries, initialization and recommendations share resolver and preserve authorization', () => {
  for (const skill of ['learn', 'learn-feynman', 'learn-recommend', 'learn-errors']) {
    assert.match(read(`learn/skills/${skill}/SKILL.md`), /teaching-resolver\.md/, skill)
  }
  assert.match(read('learn/skills/learn-data/SKILL.md'), /teaching-resolver\.md/)
  assert.match(read('learn/skills/learn-core/SKILL.md'), /learn-support/)
  assert.match(ref('session-lifecycle'), /scope_id/)
  assert.match(read('learn/skills/learn-recommend/SKILL.md'), /跨领域目标探索/)
})
