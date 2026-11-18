# Student data directories and English fields

[English](data-directory.md) | [中文](data-directory.zh.md)

System state lives in `outputs/students/`; user-dropped originals live in `data/students/<id>/english/raw/`. Both sit in the current workspace, are never shipped with the package, and stay out of Git.

```
data/students/<student_id>/english/raw/   # user originals, read-only

outputs/students/
  session.json
  <student_id>/
    profile.json                          # shared across subjects
    english/
      profile.json
      memory.json
      current_state.json
      milestones.json
      session_log.json                     # appended every turn, cleared at finalize
      extracted/
      backups/raw/
```

The directory layout, field paths and write exceptions belong to [learn-data](<../../learn/skills/learn-data/SKILL.md>); this page records only what is specific to English. `data/.../raw/` is read-only: rename only after backing up. Retention and cleanup, including high-risk deletion, belong to `learn-clean`, not to this package.

## English increments

- The subject is fixed at `english`; `/learn-start` initializes `profile.current_levels` with `listening`, `speaking`, `reading` and `writing`, all `pre_a1`. The four `profile.preferences` keys start `false`, and only the option the student picks becomes `true`. Owners: [english-profile-fields](../skills/english-core/references/english-profile-fields.md) and [english-grade-defaults](../skills/english-core/references/english-grade-defaults.md).
- `learning_state.active_domain` is one of `listening_speaking`, `reading`, `writing`, `language_use`, `news_reading`; `diagnosis.domain` draws from the same set and `diagnosis.label` carries the `english:` prefix. Owner: [english-error-labels](../skills/english-core/references/english-error-labels.md).
- Missing values stay conservative rather than guessed. Grade adjusts task format, sentence length and support style only; it never determines English level, so no field is filled from a grade table.

## Log and evidence

The entry appends the single `session_segment` of each turn to `session_log.json`, and the end of a session writes back per the shared finalize flow; `finalize` clears the log. One turn produces one segment, into which every method's evidence is merged. Which field carries which kind of evidence, and when an optional field is omitted, is in [english-segment-fields](../skills/english-core/references/english-segment-fields.md).
