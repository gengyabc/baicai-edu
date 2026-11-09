import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

// Approved seam: skill entry/contract static guards. These are not model-behavior tests.
// Synthetic lifecycle execution is owned by the lifecycle suite, not a duplicate simulator here.
const text = (name) => readFileSync(new URL(`../learn/skills/learn-support/${name}`, import.meta.url), 'utf8')
const methodGuard = (name, checks) => {
  const method = text(`references/${name}.md`)
  for (const heading of ['## 触发', '## 建议动作', '## 观察', '## 退出', '## 依据']) assert.ok(method.includes(heading), `${name}: ${heading}`)
  assert.match(method, /evidence\.md#/)
  for (const check of checks) assert.ok(method.includes(check), `${name}: ${check}`)
}

test('support entry is internal, advisory and preserves the current lifecycle owner', () => {
  const entry = text('SKILL.md')
  assert.match(entry, /name: learn-support/)
  assert.match(entry, /user-invocable: false/)
  assert.doesNotMatch(entry, /disable-model-invocation: true/)
  for (const field of ['current_task', 'need_evidence', 'willingness', 'constraints', 'action', 'observe', 'exit', 'support_update']) {
    assert.ok(entry.includes(field), field)
  }
  for (const guard of ['一个主要方法', '一个辅助方法', '唯一教学主导者', '不写档案', 'declined', '明确结束优先', '费曼', '专门方法调度']) {
    assert.ok(entry.includes(guard), guard)
  }
})

test('value support offers learner-generated relevance and a real task, not persuasion', () => {
  methodGuard('value', ['自己生成', '真实小任务', '不强求兴趣', '拒绝', 'SEVT'])
})

test('confidence support separates supported performance from independent ability', () => {
  methodGuard('confidence', ['具体进步', '学生亲自', '支持下表现', '独立能力', '基础诊断'])
})

test('autonomy support accepts external goals and delegation without unauthorized switching', () => {
  methodGuard('autonomy', ['外部要求', '有边界选择', '明确委托', 'ask_user_question', '确认'])
})

test('strategy support tests a method in the current task and separates AI verification', () => {
  methodGuard('strategies', ['检索', '间隔', '自我解释', '元认知', '认知负荷', 'AI 协作能力', '亲自理解', '费曼', '专门会话'])
})

test('persistence support respects real costs and interruption without coercion', () => {
  methodGuard('persistence', ['现实成本', '如果', '恢复', '休息', '不自动', '承诺'])
})

test('theory reference discloses verified source scope and does not promise treatment effects', () => {
  const evidence = text('references/evidence.md')
  for (const section of ['## SDT', '## SEVT', '## Self-efficacy', '## SRL', '## Strategies', '## Implementation-intentions']) {
    assert.ok(evidence.includes(section), section)
  }
  for (const term of ['研究对象', '机制', '限制', '核验', '未核验', '不是模型行为', 'selfdeterminationtheory.org/theory/', 'PMC4610746', '2017.00422', '1529100612453266', 'PracticeGuide/1', '2020.00046']) {
    assert.ok(evidence.includes(term), term)
  }
})

test('stage reference treats education and context as optional defaults, not ability labels', () => {
  const stage = text('references/learner-stage.md')
  for (const term of ['小学低段', '小学高段', '初中', '高中', '大学', '高职', '成人', '退休', '未知', '当前任务证据优先', 'grade', '隐私']) {
    assert.ok(stage.includes(term), term)
  }
})
