import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

test('safety supports minors and adults without retaining crisis details', () => {
  const safety = text('learn/skills/learn-core/references/llm-safety-boundaries.md')
  assert.match(safety, /未成年人/)
  assert.match(safety, /成人.*可信任的人/)
  assert.match(safety, /当地.*专业/)
  assert.match(safety, /不把细节写进/)
  assert.match(safety, /safety_flag: true/)
})

// Public skill-entry/contract static guards only: no model teaching is executed.
const root = new URL('../', import.meta.url)
const text = (path) => readFileSync(fileURLToPath(new URL(path, root)), 'utf8')
const ref = (name) => text(`learn/skills/learn-data/references/${name}.md`)
const entry = (name) => text(`learn/skills/${name}/SKILL.md`)

test('profile displays neutral sourced support facts and modifies explicit shared settings through the writer protocol', () => {
  const profile = entry('learn-profile')
  assert.match(profile, /references\/teaching-resolver\.md/)
  assert.match(profile, /learning_support_memory\.plans/)
  assert.match(profile, /learning_support_memory\.observations/)
  assert.match(profile, /只读/)
  assert.match(profile, /日期.*来源|来源.*日期/)
  assert.match(profile, /learning_preferences\.goals/)
  assert.match(profile, /learning_preferences\.support_preferences/)
  assert.match(profile, /education_stage/)
  assert.match(profile, /learning_context/)
  assert.ok(profile.indexOf('finalize_plan') < profile.indexOf('Write Protocol'))
  assert.match(profile, /只能.*finalize/)
  assert.doesNotMatch(profile, /心理轨迹.*回顾|每次只说“学了什么 \+ 一个进步或困难”/)
})

test('start preserves real learning identity and accepts optional stage without primary-grade gate', () => {
  const start = entry('learn-start')
  assert.match(start, /references\/teaching-resolver\.md/)
  assert.match(start, /education_stage/)
  assert.match(start, /learning_context/)
  assert.match(start, /未知|不确定/)
  assert.match(start, /grade.*可缺省/)
  assert.match(start, /scope_id/)
  assert.doesNotMatch(start, /年级（1–6）|需要表中的学科包|最近最难过的事/)
})

test('creation keeps unknown stage neutral and scopes explicit shared learning preferences', () => {
  const defaults = ref('grade-band-defaults')
  for (const stage of ['lower_primary', 'upper_primary', 'junior_secondary', 'senior_secondary', 'higher_education', 'adult']) {
    assert.ok(defaults.includes(stage), stage)
  }
  assert.match(defaults, /1-3/)
  assert.match(defaults, /4-6/)
  assert.match(defaults, /unknown|未知/)
  assert.match(defaults, /learner-stage\.md/)
  const create = ref('create-student')
  assert.match(create, /teaching-resolver\.md/)
  assert.match(create, /learning_preferences/)
  assert.match(create, /goals: \[\], support_preferences: \[\]/)
  assert.match(create, /明确.*跨科/)
  assert.match(create, /学习困难.*敏感/)
  assert.match(create, /grade.*可缺省/)
})
