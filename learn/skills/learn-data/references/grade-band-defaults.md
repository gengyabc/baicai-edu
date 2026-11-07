# Grade Band Defaults

Shared grade-band mapping and concreteness. Subject domains, task types, preference keys, and initial levels live in the current subject package. Do not restate those here.

## Grade Band Mapping

- grades 1-3 -> `lower_primary`
- grades 4-6 -> `upper_primary`

Within a band, use the same concreteness; only the subject package changes the task:

- Grades 1-2: shorter sentences, one step at a time, more drawing or acting.
- Grade 3: same band, but can handle one small transfer or comparison.
- Grades 4-5: explanation, comparison, and justification; still concrete first.
- Grade 6: freer choice, longer reasoning; still no lecture.

When creating or retargeting a subject profile, take `grade_band` from this mapping. Take `learning_state.active_domain`, `profile.current_levels`, and `profile.preferences` keys from the subject package's grade-default and profile-field references (see `references/subject-contract.md`). Do not copy example values from `profile-schema.md`.
