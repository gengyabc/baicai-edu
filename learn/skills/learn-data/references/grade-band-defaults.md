# Grade Band Defaults

Education stage and grade are optional settings, not ability labels. When stage/context affects expression or support, load `learn-support`'s `references/learner-stage.md`; evidence from the current task takes priority. Subject domains, task types, preference keys, and initial levels are provided by the teaching contract.

## Stage and compatibility

`education_stage` optional values:

| Value | Stage |
|---|---|
| `lower_primary` | Lower primary school |
| `upper_primary` | Upper primary school |
| `junior_secondary` | Junior secondary school |
| `senior_secondary` | Senior secondary school |
| `higher_education` | University and vocational college |
| `adult` | Adult |

An old profile with no `education_stage` but with an explicit primary-school `grade` may derive it in the snapshot: grades 1-3 -> `lower_primary`, grades 4-6 -> `upper_primary`. Keep the old `grade` and `grade_band`; no bulk migration is needed. When there is no stage and no usable primary grade, treat it as unknown, and do not force it to be filled in; unknown is the default semantics, and no new enum value is added. When an explicit stage conflicts with the old grade, clarify only what is necessary, and do not misclassify a non-primary learner as primary by number.

On create/modify, `grade` may be omitted; for non-primary learners do not fill in a primary grade, and do not guess a stage from age, occupation, or course difficulty. For a known primary grade, `grade_band` keeps the mapping above; non-primary/unknown has no primary grade band, so do not apply the lowest-grade template.

## Source of defaults

Before creating a profile, filling in a profile, or changing stage, read `references/teaching-resolver.md`, then take the default `learning_state.active_domain`, `profile.current_levels`, and `profile.preferences` from the contract of its `core_skill`. The primary-school package currently fits `lower_primary` / `upper_primary`; for other stages with no declared fit, use general task teaching. An unknown stage is not forced to a choice, and do not claim fit merely because a package is installed; fall back per the resolution protocol. Primary students may explore above-grade content; the specific task and evidence decide scaffolding, and stage is not a cap.

Changing stage does not automatically reset levels, convert evidence, or hot-swap an unfinished task; per the lifecycle, first handle the old task, then let the resolution protocol determine the subsequent implementation. Example profile values are not initialization defaults.
