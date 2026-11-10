import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

// Approved seam: skill entry/contract static guards. These are not model-behavior tests.
// Lifecycle guards are separate; real synthetic dialogue/file replay remains manual acceptance.
const text = (name) => readFileSync(new URL(`../learn/skills/learn-support/${name}`, import.meta.url), 'utf8')
const methodGuard = (name, checks) => {
  const method = text(`references/${name}.md`)
  for (const heading of ['## Trigger', '## Suggested Actions', '## Observation', '## Exit', '## Basis']) assert.ok(method.includes(heading), `${name}: ${heading}`)
  assert.match(method, /evidence\.md#/)
  for (const check of checks) assert.ok(method.toLowerCase().includes(check.toLowerCase()), `${name}: ${check}`)
}

test('support entry is internal, advisory and preserves the current lifecycle owner', () => {
  const entry = text('SKILL.md')
  assert.match(entry, /name: learn-support/)
  assert.match(entry, /user-invocable: false/)
  assert.doesNotMatch(entry, /disable-model-invocation: true/)
  for (const field of ['current_task', 'need_evidence', 'willingness', 'constraints', 'action', 'observe', 'exit', 'support_update']) {
    assert.ok(entry.includes(field), field)
  }
  for (const guard of ['one main method', 'at most one auxiliary method', 'exactly one teaching owner', 'does not route by itself, write profiles', 'declined',
    'an explicit end takes priority over support', 'Feynman', 'Specialist method scheduling']) {
    assert.ok(entry.toLowerCase().includes(guard.toLowerCase()), guard)
  }
})

test('optional support failure returns to teaching without losing task or claiming success', () => {
  const lifecycle = readFileSync(new URL('../learn/skills/learn-data/references/session-lifecycle.md', import.meta.url), 'utf8')
  assert.match(lifecycle, /Support skill or method reference fails to load/)
  assert.match(lifecycle, /keep the original target[\s\S]*continues? teaching/)
  assert.match(lifecycle, /Do not claim support took effect/)
})

test('value support offers learner-generated relevance and a real task, not persuasion', () => {
  methodGuard('value', ['generate a link themselves', 'real small task', 'without forcing interest', 'refuses', 'SEVT'])
})

test('confidence support separates supported performance from independent ability', () => {
  methodGuard('confidence', ['specific progress', 'personally', 'Performance under support', 'independent ability', 'foundational diagnosis'])
})

test('autonomy support accepts external goals and delegation without unauthorized switching', () => {
  methodGuard('autonomy', ['external requirement', 'bounded choices', 'explicitly delegat', 'ask_user_question', 'confirm'])
})

test('strategy support tests a method in the current task and separates AI verification', () => {
  methodGuard('strategies', ['Retrieval', 'Spacing', 'Self-explanation', 'Metacognition', 'Cognitive load', 'AI-collaboration', 'personally explains', 'Feynman', 'specialist session'])
})

test('persistence support respects real costs and interruption without coercion', () => {
  methodGuard('persistence', ['real cost', 'if the agreed', 'resume', 'rest', 'do not automatically create reminders', 'commitment'])
})

const theorySections = [
  '## SDT', '## Person-centered', '## Motivational-interviewing', '## Autonomy-supportive-teaching',
  '## SEVT', '## Self-efficacy', '## SRL', '## Strategies', '## Implementation-intentions', '## Training-transfer',
]
const sourceIds = [
  'selfdeterminationtheory.org/theory/', 'PMC4610746', '2017.00422', '1529100612453266',
  'PracticeGuide/1', '2020.00046', 'motivationalinterviewing.org/understanding-motivational-interviewing',
  '00461520.2020.1862657', '0149206309352880',
]

test('theory reference is self-contained methodology without outbound links', () => {
  const evidence = text('references/evidence.md')
  // Runtime methodology only: no URLs and no docs/ paths. Provenance lives in the maintainer archive.
  for (const term of [...theorySections, "does not prove that this system's interventions work", 'contains no external links',
    'name one connection to their own life or goals', 'it is not self-esteem', 'strength of evidence', 'produced no learning benefit', 'do not promise',
    'no full clinical interview is conducted', 'does not claim to have real human emotions', 'hidden persuasion that presupposes', 'job competence']) {
    assert.ok(evidence.includes(term), term)
  }
  assert.doesNotMatch(evidence, /https?:\/\/|docs\//)
})

test('maintainer evidence archive discloses verified source scope', () => {
  const archive = readFileSync(new URL('../docs/learn-support-evidence.md', import.meta.url), 'utf8')
  for (const term of [...theorySections, ...sourceIds, '研究对象', '机制', '限制', '核验', '未核验', '不是模型行为']) {
    assert.ok(archive.includes(term), term)
  }
})

test('stage reference treats education and context as optional defaults, not ability labels', () => {
  const stage = text('references/learner-stage.md')
  for (const term of ['Lower primary', 'Upper primary', 'Junior and senior high', 'University and vocational college', 'Adult', 'Retiree', 'Stage unknown', 'current task evidence takes priority', 'grade', 'privacy']) {
    assert.ok(stage.toLowerCase().includes(term.toLowerCase()), term)
  }
})
