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

The layout, field paths and write exceptions belong to [learn-data](<../../learn/skills/learn-data/SKILL.md>); this page records only what the math band adds. `data/.../raw/` is read-only: rename only after backing up into `outputs/.../backups/raw/`. Retention and cleanup belong to `learn-clean`, and a math turn never touches either.

## Math increments

- The subject is fixed at `math`, and the band is fixed by the skill names the turn actually ran with. `math-low-core` owns the field definitions; the shared shell comes from `learn-data`.
- `profile.preferences` holds `likes_visual`, `likes_story_context` and `likes_direct_calculation`, all `false` unless the student picked the option. Presentation rules: [math-personalization](../skills/math-low-core/references/math-personalization.md).
- `current_levels` holds `overall` plus `arithmetic_strategy_stage`, `multidigit_strategy_stage` and `fraction_strategy_stage` — the three CGI lines. Never rewrite without new evidence; read a missing field as `unknown`. Owners: [math-grade-defaults](../skills/math-low-core/references/math-grade-defaults.md) and [progression-map](../skills/math-low-core/references/progression-map.md).
- Math skills reuse a valid snapshot and read the shared `personal.interests` and the subject preferences; neither is written by a math turn. It may bridge only when the student cannot do the current item.

## Log and evidence

The entry appends the turn's single `session_segment` to `session_log.json`; finalize writes back `profile.json`, `memory.json`, `current_state.json` and `milestones.json`, then clears the log. A segment records the evidence it actually observed — item, strategy, independence and support — in the shape defined by [math-segment-fields](../skills/math-low-core/references/math-segment-fields.md). There is no aggregated score: one correct answer is not a level, and the number of times a board attachment appeared is not evidence at all.
