# Student data directories and Chinese fields

[English](data-directory.md) | [中文](data-directory.zh.md)

System state lives in `outputs/students/`; user-dropped originals live in `data/students/<id>/chinese/raw/`. Both sit in the current workspace, are never shipped with the package and stay out of Git.

```
data/students/<student_id>/chinese/raw/   # user originals, read-only

outputs/students/
  session.json                            # current student and subject
  <student_id>/
    profile.json                          # shared across subjects
    chinese/
      profile.json
      memory.json
      current_state.json
      milestones.json
      session_log.json                    # appended every turn, cleared at finalize
      extracted/
      backups/raw/
```

The layout, field paths and write exceptions belong to [learn-data](<../../learn/skills/learn-data/SKILL.md>); this page records only what Chinese adds. `data/.../raw/` is read-only: rename only after backing up into `outputs/.../backups/raw/`. Retention and cleanup, including high-risk deletion, belong to `learn-clean`.

## Chinese increments

- The subject is fixed at `chinese`. `/learn-start` initializes `profile.preferences` with `likes_model_text`, `likes_oral_explanation` and `likes_revision`, all `false`; only the option the student picks becomes `true`.
- `profile.current_levels` holds `reading_extraction`, `reading_analysis`, `writing_specificity` and `writing_depth`, all starting at `L1`. Without new evidence they are not rewritten. `self_report` keeps `easy_topics` / `hard_topics`, never `easy_areas` / `hard_areas`.
- `learning_state.active_domain` starts as `writing` for `lower_primary` and `reading` for `upper_primary`. Owner: [chinese-grade-defaults](../skills/chinese-core/references/chinese-grade-defaults.md).
- `diagnosis.domain` is only `reading` or `writing`, and `diagnosis.label` carries the matching `reading:` / `writing:` prefix. Field shapes and the record chain: [chinese-profile-fields](../skills/chinese-core/references/chinese-profile-fields.md) and [chinese-error-labels](../skills/chinese-core/references/chinese-error-labels.md).
- A transfer turn may add `techniques_extracted` and `technique_application_quality`; a quality of `null` (not submitted yet) differs from "not used". There is no `submode: experience_bridging` — a bridge merges into the reading segment.

## Log and evidence

The entry appends the single `session_segment` of each turn to `session_log.json`; at the end of a session finalize writes back `profile.json`, `memory.json`, `current_state.json` and `milestones.json`, then clears the log. A `session_segment.diagnosis` becomes an `error_history` entry with `source: "diagnosis"`, `domain`, `label`, `evidence`, `next_step` and a `diag_...` id; the history keeps the latest 20 and marks a repeated label in `notes`. Diagnostic labels never go into `skill_errors`.
