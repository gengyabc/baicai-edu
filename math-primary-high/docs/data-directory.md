# Student data directories and math fields

[English](data-directory.md) | [中文](data-directory.zh.md)

System state lives in `outputs/students/`; user-dropped originals live in `data/students/<student_id>/math/raw/`. Both sit in the current workspace, are never shipped with the package and stay out of Git.

```
data/students/<student_id>/math/raw/     # user originals, read-only

outputs/students/
  session.json                          # current student and subject
  <student_id>/
    profile.json                        # shared across subjects
    math/
      profile.json
      memory.json
      current_state.json
      milestones.json
      session_log.json                  # appended every turn, cleared at finalize
      backups/raw/
```

The layout, field paths and write exceptions belong to [learn-data](<../../learn/skills/learn-data/SKILL.md>); this page records only what the high band adds. `data/.../raw/` is read-only: rename only after backing up into `outputs/.../backups/raw/`. Retention and cleanup belong to `learn-clean`.

## Math increments

- The subject is fixed at `math`; the band is fixed by the skill names the turn actually ran with, so a profile brought over from the low band keeps its own preference keys, and keys this package does not own are not rewritten.
- `profile.preferences` holds `likes_step_by_step`, `likes_examples` and `likes_real_world`, all `false` unless the student picked the option. Presentation rules: [math-personalization](../skills/math-high-core/references/math-personalization.md).
- `current_levels` holds `overall` (`L1`–`L3`) plus `arithmetic_strategy_stage`, `multidigit_strategy_stage`, `fraction_strategy_stage` and `symbolic_strategy_stage`. Never rewrite without current evidence; read a missing stage as `unknown` and leave the others alone. Owners: [adaptive-thresholds](../skills/math-high-core/references/adaptive-thresholds.md) and [progression-map](../skills/math-high-core/references/progression-map.md).
- A confirmed skill records the narrowest domain that fits it, never a broader invented category. Owners: [math-profile-fields](../skills/math-high-core/references/math-profile-fields.md) and [strategy-diagnosis-rules](../skills/math-high-core/references/strategy-diagnosis-rules.md).

## Log and evidence

The entry appends the turn's single `session_segment` to `session_log.json`; finalize writes back `profile.json`, `memory.json`, `current_state.json` and `milestones.json`, then clears the log. A segment records the evidence it actually observed — item, method, independence and support — in the shape defined by [math-segment-fields](../skills/math-high-core/references/math-segment-fields.md). There is no aggregated score, and a prerequisite child recorded as a plan is a task, not a claim of mastery.
