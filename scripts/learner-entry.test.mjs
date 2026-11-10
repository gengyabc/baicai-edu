import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

test('safety supports minors and adults without retaining crisis details', () => {
  const safety = text('learn/skills/learn-core/references/llm-safety-boundaries.md')
  assert.match(safety, /Minors:/)
  assert.match(safety, /Adults:[^\n]*trusted person/)
  assert.match(safety, /local professional/)
  assert.match(safety, /Do not write details into/)
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
  assert.match(profile, /shown read-only/)
  assert.match(profile, /dates and sources/)
  assert.match(profile, /learning_preferences\.goals/)
  assert.match(profile, /learning_preferences\.support_preferences/)
  assert.match(profile, /education_stage/)
  assert.match(profile, /learning_context/)
  assert.ok(profile.indexOf('finalize_plan') < profile.indexOf('Write Protocol'))
  assert.match(profile, /may be written only by finalize/)
  assert.doesNotMatch(profile, /present[^\n]*psychological trajectory|say only "[^"]*one (?:progress|improvement)/i)
})

test('start preserves real learning identity and accepts optional stage without primary-grade gate', () => {
  const start = entry('learn-start')
  assert.match(start, /references\/teaching-resolver\.md/)
  assert.match(start, /education_stage/)
  assert.match(start, /learning_context/)
  assert.match(start, /unknown|uncertain/i)
  assert.match(start, /`grade` may be omitted/)
  assert.match(start, /scope_id/)
  assert.doesNotMatch(start, /grades? 1[–-]6|requires? (?:a )?subject package from the table|most sad(?:est)? event/i)
})

test('creation keeps unknown stage neutral and scopes explicit shared learning preferences', () => {
  const defaults = ref('grade-band-defaults')
  for (const stage of ['lower_primary', 'upper_primary', 'junior_secondary', 'senior_secondary', 'higher_education', 'adult']) {
    assert.ok(defaults.includes(stage), stage)
  }
  assert.match(defaults, /1-3/)
  assert.match(defaults, /4-6/)
  assert.match(defaults, /unknown/)
  assert.match(defaults, /learner-stage\.md/)
  const create = ref('create-student')
  assert.match(create, /teaching-resolver\.md/)
  assert.match(create, /learning_preferences/)
  assert.match(create, /goals: \[\], support_preferences: \[\]/)
  assert.match(create, /explicitly set for cross-subject reuse/)
  assert.match(create, /learning difficulties and sensitive family\/occupation\/emotion details are not written to shared fields/)
  assert.match(create, /`grade` may be omitted/)
})
