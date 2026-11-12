import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

// Installed-instruction contract guards, not deterministic model-behavior tests.
const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
const ref = (name) => read(`math-primary-high/skills/math-high-core/references/${name}.md`)

test('a confirmed missing tool enters a recoverable child task through the same teaching owner', () => {
  const core = read('math-primary-high/skills/math-high-core/SKILL.md')
  const session = read('math-primary-high/skills/math-high-session/SKILL.md')
  for (const source of [core, session, ref('math-teaching-core'), ref('derivation-teaching'), ref('proof-teaching'), ref('word-problem-derivation')]) {
    assert.match(source, /references\/prerequisite-learning\.md/, 'tool gaps must reach the recursive teaching contract')
  }
  const contract = ref('prerequisite-learning')
  for (const rule of ['context.learning_plan', 'root_scope_id', 'active_frame_id', 'parent_id',
    'independent tool use', 'one parent', 'self-reported', 'unknown', 'await_student',
    'not runtime function calls', 'references/learning-plan.md']) assert.ok(contract.includes(rule), rule)
  assert.doesNotMatch(ref('word-problem-derivation'), /Teach a genuinely missing tool locally/)
  assert.doesNotMatch(ref('proof-teaching'), /Teach a genuinely missing logical tool explicitly/)
})

test('the three-method pilot is reachable with structure clues, monitoring and boundary checks', () => {
  for (const source of [read('math-primary-high/skills/math-high-core/SKILL.md'),
    read('math-primary-high/skills/math-high-session/SKILL.md'), ref('math-teaching-core'), ref('problem-design'), ref('topic-map')]) {
    assert.match(source, /references\/mathematical-strategies\.md/)
  }
  const methods = ref('mathematical-strategies')
  for (const rule of ['Assume and adjust', 'Ordered enumeration', 'Remainders and cycles',
    'whole-number-division', 'operation-meaning', 'multiplicative-thinking',
    'student monitoring', 'mutually exclusive', 'exhaustive', 'remainder zero',
    'finite prefix', 'near transfer', 'boundary', 'references/prerequisite-learning.md']) assert.ok(methods.includes(rule), rule)
  assert.doesNotMatch(methods, /https?:\/\//)
  assert.match(ref('problem-design'), /boundary discrimination/)
  assert.match(ref('strategy-diagnosis-rules'), /local obstacle/)
})

test('deep or stalled dependencies preserve choice and do not fabricate parent success', () => {
  const contract = ref('prerequisite-learning')
  for (const rule of ['cycle warning', 'park the blocked goal', 'Learn child first, return later',
    'Abandon parent, choose a new goal', 'Keep the original goal', 'Decline necessary child work too',
    'not a fixed global depth', 'session_segment: null', 'teacher help', 'exactly one parent']) assert.ok(contract.includes(rule), rule)
  assert.match(ref('scaffold-calibration'), /references\/prerequisite-learning\.md/)
  assert.match(ref('math-segment-fields'), /active_frame_id/)
  assert.match(ref('adaptive-thresholds'), /not a global recursion depth/)
  const scenarios = read('math-primary-high/tests/teaching-scenarios.md')
  for (const id of ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'R1', 'R12', 'P1', 'P9']) {
    assert.ok(scenarios.includes(`| ${id} |`), id)
  }
})

test('a child restores the entire task context rather than nesting that context inside turn_state', () => {
  const contract = ref('prerequisite-learning')
  assert.match(contract, /project the child's task fields into context/)
  assert.match(contract, /task\.turn_state into context\.turn_state/)
  assert.doesNotMatch(contract, /project only that child's task into `context\.turn_state`/)
})
