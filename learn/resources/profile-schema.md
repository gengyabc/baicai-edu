# Student Profile Schema

Path layout and raw/backup permissions follow `learn-data`'s Data Root. This file is the templates plus the constraints the templates don't show. Counts, ordering, and the `priority_targets` cap are in `references/session-retention.md`. Example values are not initialization defaults; existing files are kept.

## Base Profile

- Path: `outputs/students/<student_id>/profile.json`
- The only cross-subject source of personalization. Subject mastery is not written here.
- `personal.interests` is the only list of interests. Subject skills read it; when to use it for examples or bridging is defined by the subject package.

```json
{
  "student_id": "stu_li_ming_a7b2",
  "name": "李明",
  "grade": 4,
  "grade_band": "upper_primary",
  "language": "zh-CN",
  "personal": {
    "interests": ["画画", "踢足球", "下棋"],
    "most_exciting_event": "Took part in the school sports day and won first place",
    "most_sad_event": "The pet puppy got sick and died"
  },
  "created_at": "2026-10-04T12:00:00Z",
  "updated_at": "2026-10-04T12:00:00Z"
}
```

`name` and `interests` are student data values; they stay in whatever language the student provided. `language` selects the UI locale per `references/ui-locale.md`.

Education stage and learning configuration are optional compatibility extensions: `education_stage` takes lower_primary / upper_primary / junior_secondary / senior_secondary / higher_education / adult, and when missing is derived per `references/grade-band-defaults.md` or treated as unknown. `grade` / `grade_band` may be omitted, and are not forced for non-primary learners; existing values are kept, a stage conflict is handled as a student correction, and ability is not guessed. The optional `learning_context` is reused as a short neutral learning situation the student explicitly provided, such as career start, advancement, transition, senior development, retirement, or learning for interest, and may be described in combination; it is separate from education_stage, is not inferred from age, stage, or occupation, adds no occupation enum field, and contains no employer identity, family conflict, or other private hardship. It can be skipped, and is set or corrected only by profile creation/start/profile; temporary limits such as time and resources in the current turn are used only for current support and are not automatically written into this field.

`learning_preferences` has the shape `{ "goals": [], "support_preferences": [] }`, and when missing is treated as empty. Save only cross-subject long-term goals and support preferences the student explicitly set; do not infer them from one answer, low confidence, or procrastination. Written only by the designated writers (profile creation/start/profile); finalize does not write the shared profile.

## Subject Profile

- Path: `outputs/students/<student_id>/<subject>/profile.json`
- The JSON below is the shell, and all keys must be kept. Preference keys, the keys of `current_levels`, and the values of `active_domain` are defined by the subject package: on creation, read `references/grade-band-defaults.md` for the grade band, and read the subject contract (`references/subject-contract.md`) for the initial domain, levels, and preference keys.
- `profile.preferences` all start as `false`; `/learn-start` sets the student's chosen item to `true`.
- All subjects use `easy_topics` / `hard_topics`, not `easy_areas` / `hard_areas`.

```json
{
  "updated_at": "2026-10-04T12:00:00Z",
  "profile": {
    "preferences": {},
    "self_report": {
      "easy_topics": [],
      "hard_topics": []
    },
    "current_levels": {}
  },
  "learning_state": {
    "active_domain": "",
    "mastered_topics": [],
    "developing_topics": [],
    "priority_targets": []
  },
  "error_history": [],
  "session_history": []
}
```

## Subject Memory

- Path: `outputs/students/<student_id>/<subject>/memory.json`

```json
{
  "profile_memory": {
    "preferred_scaffolds": [],
    "motivation_signals": [],
    "expression_traits": [],
    "stable_strengths": [],
    "stable_difficulties": [],
    "preferred_persona": "guided_coach",
    "material_difficulty": {
      "direction": "standard",
      "note": "",
      "updated_at": null
    }
  },
  "learning_memory": {
    "recent_focus": "",
    "recent_modes": [],
    "recent_error_patterns": [],
    "recommended_next_moves": [],
    "feynman_readiness": "unknown",
    "confirmed_skills": [],
    "skill_errors": [],
    "updated_at": "2026-10-04T12:00:00Z"
  }
}
```

One entry of `confirmed_skills`:

```json
{ "skill": "example skill", "domain": "subject_domain", "confirmed_at": "2026-10-02T10:00:00Z" }
```

One entry of `skill_errors`:

```json
{ "skill": "example skill", "error_count": 1, "last_error_at": "2026-10-02T11:00:00Z" }
```

When creating memory, seed the existing `learning_state.mastered_topics` into `confirmed_skills` (as objects, deduped by `skill`). `session_segment.confirmed_skills` carries only skill names; finalize adds `domain` and `confirmed_at`, with `domain` chosen by the subject package. Confirmation, error counting, and retraction follow only `learn-core`'s `references/feynman-skill-whitelist.md`. A topic is added to `mastered_topics` only when its skill stays in `confirmed_skills` for two consecutive sessions with no `skill_errors`. These remain workflow labels, not proof of delayed retention or transfer; absence of recorded errors is not a new success. Report delayed retention only from an observed later attempt, preserving known support conditions.

`profile_memory.material_difficulty` is written by finalize from the log's `context.difficulty_request`: `direction` is `standard` / `easier` / `harder`, `note` is a summary of the student's own words and the target, and `updated_at` takes the request time. It only affects the presentation of new material, questions, or text; it is not a level, does not change `current_levels`, and is not mastery evidence.

### Isolated general progress and learning support

memory optionally adds `general_progress: []` and `learning_support_memory: { "plans": [], "observations": [] }`; missing in an old file counts as empty, and old psychological descriptions are not migrated. The concrete whitelist and corrections follow only `references/finalize-session.md`.

- general_progress stores general task progress carrying scope_id, teaching, and the actual ability attribution; restore/recommendation consumes only the current target, and it is not moved into specialist confirmed_skills, current_levels, or mastered_topics.
- plans store neutral plans the student explicitly asked for and are not teaching performance; observations are historical facts annotated with source/time/applicable context and are not psychological grades. Superseded entries are no longer used for suggestions.
- `/learn-profile` may only show plans, facts, and their date sources read-only; teaching first checks whether an old observation applies to the current target, and student corrections take priority. These records and sensitive content are not propagated across subjects by default.
- Only finalize writes memory; support_events is the sole handoff for plans/corrections and is not rewritten directly by support methods or profile display. Retention caps and ordering follow `references/session-retention.md`.

### How Memory Is Consumed

These fields are read and used at snapshot time:

| Field | Read by | Use |
|---|---|---|
| `profile_memory.preferred_scaffolds` | Current subject session | Use recorded scaffolds first, then consider new ones. |
| `profile_memory.motivation_signals` | `learn`, `feynman`, `next-step` | Historical reference; only decides concrete feedback and wording; old entries without a source are not treated as current psychological facts, student corrections take priority, and they are not propagated across subjects. |
| `profile_memory.expression_traits` | Current subject session | When the subject uses this field, align length and spoken/written preference. |
| `profile_memory.stable_strengths` / `stable_difficulties` | Target choice by the entry and subject | Tie-breakers when `session_history` is empty. |
| `profile_memory.preferred_persona` | Voice And Feedback in `learn-core`'s `references/pedagogy-core.md` | `guided_coach` or `socratic_tutor`. |
| `profile_memory.material_difficulty` | Before the current subject generates new material, questions, or text | Set the load by the student's most recent request; `direction` is `easier` / `harder` / `standard`, and `current_levels` is unchanged. |
| `learning_memory.recent_focus` / `recent_modes` | Entry's first turn | Connect with "Last time we were on...". |
| `learning_memory.recent_error_patterns` | Current subject's practice or diagnosis | Prioritize patterns that recur. |
| `learning_memory.recommended_next_moves` | `next-step` | Offer the recorded next step first. |
| `learning_memory.feynman_readiness` | `next-step` | Decide the recommendation marker and scaffolding difficulty per `references/next-step.md`. |
| `learning_memory.confirmed_skills` / `skill_errors` | `feynman` | Whitelist and error rules. |

## Current Learning State

- Path: `outputs/students/<student_id>/<subject>/current_state.json`

```json
{
  "active_focus": "",
  "source": "profile",
  "entry_point": "learn",
  "submode": "learn",
  "last_finalized_session_id": null,
  "updated_at": "2026-10-04T12:00:00Z"
}
```

- Ordinary mode/action restore uses log context; no ordinary pending question is stored in current_state. Exception: optional `current_state.learning_plan` is the durable versioned task-chain snapshot or terminal tombstone defined in `references/learning-plan.md`. Read it only for authorized continuation of the same task/plan after finalize, not as performance evidence. Old files may omit it.
- `last_finalized_session_id` is the idempotency marker. The same id is not finalized a second time.

## Session Log and Session Segment

See `references/session-schema.md`.

## Write Assumptions

Write steps follow this skill's Write Protocol.

- One student, one session, one process. There is no cross-process lock or transaction.
- `student_id` conforms to Data Root's `stu_<slug>_<4hex>` and contains no `/`, `\`, or `..`.

## Error History

`error_history` is in the subject `profile.json`, and records both file analysis and in-session diagnoses.

### File analysis entry

```json
{
  "error_id": "err_20261004_001",
  "source": "file_analysis",
  "date": "2026-10-04T12:00:00Z",
  "domain": "subject_domain",
  "topic": "current question",
  "error_type": "concept",
  "label": "subject:example_label",
  "raw_file": "data/students/<id>/<subject>/raw/topic-001-20261004.jpg",
  "original_raw_file": "data/students/<id>/<subject>/raw/original-001.jpg",
  "backup_file": "outputs/students/<id>/<subject>/backups/raw/original-001.jpg",
  "extracted_file": "outputs/students/<id>/<subject>/extracted/topic-001-20261004.md",
  "renamed": true,
  "analyzed": true,
  "self_diagnosis": "The student said they missed a step; the evidence points to a different relationship."
}
```

### Diagnosis entry

```json
{
  "error_id": "diag_20261004_001",
  "source": "diagnosis",
  "date": "2026-10-04T12:00:00Z",
  "domain": "subject_domain",
  "label": "subject:example_label",
  "topic": "current question",
  "evidence": "The student gave only a conclusion and did not point out the one place that supports it.",
  "next_step": "Return to the existing material, point out one place, and explain what it supports.",
  "analyzed": true
}
```

`error_id`: file analysis uses `err_`, diagnosis uses `diag_`. Counts and the `priority_targets` cap are in `references/session-retention.md`.

## Milestones

```json
{
  "milestones": [
    {
      "focus": "current focus",
      "date": "2026-10-04T12:00:00Z",
      "type": "developing",
      "importance": "medium",
      "summary": "Can explain the current approach and has begun handling the same relationship independently."
    }
  ],
  "updated_at": "2026-10-04T12:00:00Z"
}
```

- `type`: `developing` / `mastered` / `stage_change` / `breakthrough`.
- `importance`: `high` / `medium` / `low`.
- When one `session_history` entry is pushed out, compress its long-term meaning into one milestone. For ordering and counts see `references/session-retention.md`.

## Session Summary Entry

One entry written to `session_history`:

```json
{
  "session_id": "sess_20261004_1200",
  "date": "2026-10-04T12:00:00Z",
  "entry_point": "learn",
  "focus": "current focus",
  "overall_performance_code": "basic_independent",
  "overall_performance_text": "Completed mostly independently, with hints needed at a few steps",
  "strategy_summary": "The student explained their own approach",
  "strengths": ["Can state one concrete reason"],
  "difficulties": ["One relationship is still unstable"],
  "next_step": "Try again with a neighboring task",
  "recommended_targets": ["A neighboring task on the same relationship"],
  "status": "completed"
}
```

- `status`: `completed` (default) or `interrupted`. When interrupted, also write `interrupted_at` and `last_topic`.
- Append one entry per complete student learning session. `learn -> feynman` counts as one. Turn-by-turn records are in `session_log.json`. For counts see `references/session-retention.md`.
