# Student Profile Schema

## Directory Structure

路径布局与 raw/备份权限以 `learn-data` 的 Data Root 为准；本文件定义字段、模板和消费方式。初始化时同时执行 Initialization Defaults By Grade Band，保留已有文件。

## Base Profile

- Path: `outputs/students/<student_id>/profile.json`
- Shared across all subjects. This is the only place for cross-subject personalization.
- `personal.interests` is the canonical interest list. Chinese and math skills must read it when choosing examples, reading angles, writing prompts, and bridges.

```json
{
  "student_id": "stu_li_ming_a7b2",
  "name": "李明",
  "grade": 4,
  "grade_band": "upper_primary",
  "language": "zh-CN",
  "personal": {
    "interests": ["阅读", "绘画", "踢足球"],
    "most_exciting_event": "参加学校运动会并获得第一名",
    "most_sad_event": "宠物小狗生病去世了"
  },
  "created_at": "2026-10-04T12:00:00Z",
  "updated_at": "2026-10-04T12:00:00Z"
}
```

## Initialization Defaults By Grade Band

When creating a missing subject profile, load `learn-core` and read its `references/grade-band-defaults.md` for grade mapping, `tone`, `learning_state.active_domain`, and initial levels. That file owns the defaults. The JSON examples below illustrate the schema, not initialization values.

`profile.preferences` always starts with every flag `false`; `start` sets exactly the one preference the student chose to `true`.

`profile.current_levels` always starts at `L1` and the two math strategy stages from `learn-core/references/grade-band-defaults.md`.

## Subject Profile

- Path: `outputs/students/<student_id>/<subject>/profile.json`
- Use this shape for both subjects. Replace the values marked by the grade-band table.

### Math (example: upper_primary)

```json
{
  "tone": "concise_guiding",
  "updated_at": "2026-10-04T12:00:00Z",
  "profile": {
    "preferences": {
      "likes_visual": false,
      "likes_story_context": false,
      "likes_direct_calculation": false
    },
    "self_report": {
      "easy_topics": [],
      "hard_topics": []
    },
    "current_levels": {
      "overall": "L1",
      "arithmetic_strategy_stage": "direct_modeling",
      "fraction_strategy_stage": "equal_sharing_no_coordination"
    }
  },
  "learning_state": {
    "active_domain": "fractions",
    "mastered_topics": [],
    "developing_topics": [],
    "priority_targets": []
  },
  "error_history": [],
  "session_history": []
}
```

### Chinese (example: upper_primary)

```json
{
  "tone": "concise_guiding",
  "updated_at": "2026-10-04T12:00:00Z",
  "profile": {
    "preferences": {
      "likes_model_text": false,
      "likes_oral_explanation": false,
      "likes_revision": false
    },
    "self_report": {
      "easy_topics": [],
      "hard_topics": []
    },
    "current_levels": {
      "reading_extraction": "L1",
      "reading_analysis": "L1",
      "writing_specificity": "L1",
      "writing_depth": "L1"
    }
  },
  "learning_state": {
    "active_domain": "reading",
    "mastered_topics": [],
    "developing_topics": [],
    "priority_targets": []
  },
  "error_history": [],
  "session_history": []
}
```

## Required Fields

- `tone`
- `updated_at`
- `profile.preferences`
- `profile.self_report.easy_topics`
- `profile.self_report.hard_topics`
- `profile.current_levels`
- `learning_state`
- `error_history`
- `session_history`

Chinese uses the same `easy_topics` / `hard_topics` names as math. Do not use `easy_areas` / `hard_areas`.

## Subject Memory

- Path: `outputs/students/<student_id>/<subject>/memory.json`
- Stores dual-layer memory separate from `profile.json`.

```json
{
  "profile_memory": {
    "preferred_scaffolds": [],
    "motivation_signals": [],
    "expression_traits": [],
    "stable_strengths": [],
    "stable_difficulties": [],
    "preferred_persona": "guided_coach"
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

### How Memory Is Consumed

Memory is not write-only. These fields must be read at snapshot time and used:

| Field | Read by | Use |
|---|---|---|
| `profile_memory.preferred_scaffolds` | `math-session`, `chinese-reading-session`, `chinese-writing-session` | Prefer the listed scaffolds (drawing, examples, sentence starters) before inventing new ones. |
| `profile_memory.motivation_signals` | `learn`, `feynman`, `next-step` | Choose what to praise and how to frame the next step. |
| `profile_memory.expression_traits` | `chinese-reading-session`, `chinese-writing-session` | Match response length and spoken/written preference. |
| `profile_memory.stable_strengths` / `stable_difficulties` | target selection in `learn`, `math-session`, `chinese-session` | Use as a tiebreaker when `session_history` is empty. |
| `profile_memory.preferred_persona` | `learn-core` persona selection | `guided_coach` or `socratic_tutor`. |
| `learning_memory.recent_focus` / `recent_modes` | `learn` first turn | Open with continuity ("上次我们在…"). |
| `learning_memory.recent_error_patterns` | `math-practice`, `chinese-reading-session` | Prefer practice layers and diagnosis targets that hit the repeated pattern. |
| `learning_memory.recommended_next_moves` | `learn` next-step | Offer the teacher's/critic's suggested move before inventing one. |
| `learning_memory.feynman_readiness` | `next-step` | `ready` → offer "当小老师"; `not_ready` → do not. |
| `learning_memory.confirmed_skills` / `skill_errors` | `feynman` | Whitelist and mistake rules. |

`feynman_readiness` replaces the old `feynman_readiness` name. `feynman_handoff_recommended` in a segment means "hand off to `/feynman`".

## Confirmed Skills (Whitelist)

- Path: `outputs/students/<student_id>/<subject>/memory.json` → `learning_memory.confirmed_skills`
- Records skills the student has confirmed mastery of.
- AI in learner role must NOT make mistakes on these skills.

```json
{
  "confirmed_skills": [
    { "skill": "减法借位", "domain": "addition_subtraction", "confirmed_at": "2026-10-02T10:00:00Z" },
    { "skill": "凑十策略", "domain": "addition_subtraction", "confirmed_at": "2026-10-01T09:00:00Z" }
  ]
}
```

**Initialization**: On memory creation, copy `profile.learning_state.mastered_topics` into `confirmed_skills` as objects.

**Promotion bar**: add a skill only after **two independent demonstrations** (different numbers or contexts), or after one demonstration plus a correct explanation of why the method works. A single correct answer is not enough.

**Topic mastery**: add a topic to `learning_state.mastered_topics` only when its skills stay in `confirmed_skills` for two consecutive sessions without `skill_errors`. Do not add a topic after one correct answer.

**Segment format**: in `session_segment.confirmed_skills`, write only the skill names (`["通分"]`). Finalize converts them to the object shape above with `domain` and `confirmed_at`.

## Skill Errors

- Path: `outputs/students/<student_id>/<subject>/memory.json` → `learning_memory.skill_errors`
- Tracks errors the student made on whitelisted skills.

```json
{
  "skill_errors": [
    { "skill": "减法借位", "error_count": 1, "last_error_at": "2026-10-02T11:00:00Z" }
  ]
}
```

**Evidence And Revocation**: Load `learn-core` and read `references/feynman-skill-whitelist.md` before updating these fields; the schema does not define another threshold.

## Current Learning State

- Path: `outputs/students/<student_id>/<subject>/current_state.json`

```json
{
  "active_focus": "",
  "source": "profile",
  "entry_point": "learn",
  "submode": "learn",
  "pending_feynman_handoff": false,
  "pending_feynman_focus": "",
  "pending_transfer_phase": false,
  "pending_transfer_focus": "",
  "last_finalized_session_id": null,
  "updated_at": "2026-10-04T12:00:00Z"
}
```

- `pending_*` fields request a focus and an action. Resume the corresponding mode/transfer through `references/session-lifecycle.md`, persist that action in log context, and clear only the consumed pair after handoff.
- `last_finalized_session_id` is the idempotency marker. Finalize refuses to run twice for the same id.

## Session Log

- Path: `outputs/students/<student_id>/<subject>/session_log.json`
- Durable copy of the in-memory `session_segments`, so a long session survives context compaction or a restart.

```json
{
  "session_id": "sess_20261004_1200",
  "entry_point": "learn",
  "started_at": "2026-10-04T12:00:00Z",
  "updated_at": "2026-10-04T12:18:00Z",
  "context": {
    "focus": "异分母分数加法",
    "mode": "learn",
    "activity": "teaching",
    "target_context": { "type": "topic", "topic": "异分母分数加法", "source": "manual_topic", "files": [], "intent": null },
    "materials": {},
    "turn_state": {}
  },
  "segments": [
    {
      "focus": "异分母分数加法",
      "subject": "math",
      "mode": "learn",
      "submode": "practice",
      "source": "profile",
      "strategy_summary": "学生用画图分蛋糕理解通分",
      "strengths": ["能主动画图表示"],
      "difficulties": ["通分时偶尔分母乘错"],
      "next_step_candidate": "继续练异分母加法",
      "recommended_targets": ["异分母减法"],
      "confirmed_skills": [],
      "skill_errors_observed": []
    }
  ]
}
```

- `context` is optional for compatibility with existing logs. New/resumed sessions persist it after target resolution, mode/activity changes, and each turn. `mode` here is the interaction mode (`learn` / `feynman`), distinct from a subject segment's start/revise/assess mode.
- `activity`: `teaching` / `transfer`; transfer uses `turn_state` for source domain, extracted techniques, current phase, round count, and any pending question. Do not restart a persisted transfer phase on resume.
- `target_context` shape and file-processing flags/references are defined by `references/target-parsing.md`. `materials` stores only necessary pasted text/draft/answer when no durable file exists; prefer workspace references for existing files. Never store crisis or private experience details here.
- Legacy logs without context restore their last segment and ask for missing material/intent rather than infer it; existing error_history extracted references may be read, without reprocessing raw.
- `finalize_plan` is optional recovery metadata, defined only by `references/finalize-session.md`. A pending plan must finish before new teaching, profile edits, or error-file writes for that student/subject.
- Both entries execute `references/session-lifecycle.md` to append the single subject segment and update context; they do not implement separate log loops. Finalize commits the four files before clearing segments/context/plan.

## Storage Boundaries

- Shared `profile.json`: identity, grade, interests, lifecycle events. Never store subject mastery here.
- Subject `profile.json`: stable subject profile, `error_history`, `session_history`.
- `memory.json`: stable observations and recent signals; consumed as described above.
- `current_state.json`: latest focus, pending handoff, idempotency marker.
- `session_log.json`: current session segments; cleared after finalize.
- Session segments in model context are a cache, not the source of truth.

## Write Assumptions

Skills read the complete file, merge in memory, then write the whole file. Assumptions:

- One student, one session, one process; no cross-process lock or transaction.
- Read the complete file before writing; write complete valid JSON.
- Do not write the same file in parallel.
- `student_id` must match `stu_<name>_<4hex>` and must not contain `/`, `\`, or `..`.
- Multi-process concurrency is out of scope; a database or file lock would be required.

## Session Segment

A segment is produced by a teaching skill and appended by `/learn` or `/feynman`:

```json
{
  "focus": "异分母分数加法",
  "subject": "math",
  "mode": "learn",
  "submode": "practice",
  "source": "profile",
  "overall_performance_code": "basic_independent",
  "overall_performance_text": "基本独立完成，个别步骤需要提示",
  "strategy_summary": "学生用画图分蛋糕来理解通分",
  "strengths": ["能主动用图形表示"],
  "difficulties": ["通分时偶尔分母乘错了"],
  "next_step_candidate": "继续练异分母加法，注意分母选择",
  "recommended_targets": ["异分母减法"],
  "confirmed_skills": ["通分"],
  "skill_errors_observed": ["异分母加法"],
  "feynman_handoff_recommended": true,
  "diagnosis": {
    "domain": "fractions",
    "label": "fractions:denominator_confusion",
    "evidence": "把分子分母分别相加，说明只记住了步骤。"
  },
  "current_levels": {
    "fraction_strategy_stage": "equal_sharing_additive"
  },
  "techniques_extracted": [],
  "technique_application_quality": null
}
```

Required fields: `focus`, `subject`, `mode`, `submode`, `source`, `strategy_summary`, `strengths`, `difficulties`, `next_step_candidate`, `recommended_targets`.

Enums:

- `subject`: `math` / `chinese`.
- `mode`: `learn` / `feynman` / `diagnose` / `start` / `revise` / `assess`.
- `submode`: `learn` / `practice` / `review` / `feynman` / `student_problem` / `read_write_transfer` / `generate_tasks` / `experience_bridging` (legacy; bridging now merges into the reading segment).
- `source`: `profile` / `manual_topic` / `error_analysis` / `diagnosis` / `practice` / `reading` / `writing` / `save` / `focus`.
- `error_history.source` is separate: `file_analysis` / `diagnosis`.

Optional fields:

- `overall_performance_code`: `needs_support`, `basic_independent`, `stable`, `flexible`.
- `overall_performance_text`: free text.
- `confirmed_skills`: skill names (strings); finalize converts to objects. Before recording confirmations or errors, load `learn-core` and read `references/feynman-skill-whitelist.md`; that file owns evidence and revocation rules.
- `skill_errors_observed`: actual student error skill names (strings), not AI's intentional mistakes.
- `feynman_handoff_recommended`: boolean; means hand off to `/feynman`.
- `diagnosis`: one main label plus evidence. Chinese labels use the `reading:` / `writing:` prefix from `chinese-core/references/chinese-error-labels.md`. Math labels are free-form math error types.
- `current_levels`: a partial `profile.current_levels` update; finalize nests it under `profile`.
- `techniques_extracted` / `technique_application_quality`: transfer-writing only.

## Error History

`error_history` is the durable record for both file-based error analysis and in-session diagnosis. It is stored in the subject `profile.json`.

### File analysis entry

```json
{
  "error_id": "err_20261004_001",
  "source": "file_analysis",
  "date": "2026-10-04T12:00:00Z",
  "domain": "fractions",
  "topic": "异分母加法",
  "error_type": "concept",
  "label": "fractions:denominator_confusion",
  "raw_file": "data/students/<id>/math/raw/fractions-001-20261004.jpg",
  "original_raw_file": "data/students/<id>/math/raw/分数-001.jpg",
  "backup_file": "outputs/students/<id>/math/backups/raw/分数-001.jpg",
  "extracted_file": "outputs/students/<id>/math/extracted/fractions-001-20261004.md",
  "renamed": true,
  "analyzed": true,
  "self_diagnosis": "学生说自己‘忘记通分’，实际是分母乘错。"
}
```

### Diagnosis entry

```json
{
  "error_id": "diag_20261004_001",
  "source": "diagnosis",
  "date": "2026-10-04T12:00:00Z",
  "domain": "reading",
  "label": "reading:证据不足",
  "topic": "《秋天的雨》第二段赏析",
  "evidence": "学生只说了‘很美’，没有引用原文。",
  "next_step": "回到原文找出一句比喻，并说明它写的是什么。",
  "analyzed": true
}
```

- `error_id` uses `err_` for file analysis and `diag_` for diagnosis.
- `error_history` keeps the newest 20 entries.
- `priority_targets` may be strings or objects; prefer objects from error analysis. Keep at most 5.

## Milestones

`milestones.json` shape:

```json
{
  "milestones": [
    {
      "focus": "异分母分数加法",
      "date": "2026-10-04T12:00:00Z",
      "type": "developing",
      "importance": "medium",
      "summary": "能用画图理解通分，开始独立找公分母。"
    }
  ],
  "updated_at": "2026-10-04T12:00:00Z"
}
```

- `milestones` keeps at most 20 entries.
- `type`: `developing` / `mastered` / `stage_change` / `breakthrough`.
- `importance`: `high` / `medium` / `low`. Sort by `high` → `medium` → `low`, then newest first.
- When a session falls out of `session_history`, compress its long-term meaning into a milestone.

## Session Summary Entry

Each `session_history` entry includes: `session_id`, `date`, `entry_point`, `focus`, `overall_performance_code`, `overall_performance_text`, `strategy_summary`, `strengths`, `difficulties`, `next_step`, `recommended_targets`.

Optional status fields:

- `status`: `completed` (default) or `interrupted`.
- `interrupted_at`, `last_topic` when interrupted.

Keep the newest 5 entries, newest at index 0. Full rules: `references/session-retention.md`.

## Profile Target Priority

When selecting the next target from profile state, prefer:

1. Explicit user target; unfinished session focus is preserved when no new target is given.
2. `pending_feynman_focus` / `pending_transfer_focus` only when their corresponding boolean is true.
3. `session_history[0].next_step`
4. `priority_targets`
5. `developing_topics`
6. `learning_memory.recommended_next_moves`
7. recent milestones
8. grade-band defaults

## Allowed Performance Codes

`needs_support`, `basic_independent`, `stable`, `flexible`

## Persistence Rule

- A complete student-facing learning session appends one new summary record, updates `updated_at`, and applies the retention policy.
- `learn -> feynman` counts as one complete session.
- Do not write a summary per turn; the session log is the per-turn record.
