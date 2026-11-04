# Student Profile Schema

## Directory Structure

```
outputs/students/
  <student_id>/
    profile.json
    math/
      profile.json
      memory.json
      current_state.json
      milestones.json
      raw/
      extracted/
    chinese/
      profile.json
      memory.json
      current_state.json
      milestones.json
      raw/
      extracted/
```

## Base Profile

- Path: `outputs/students/<student_id>/profile.json`
- Shared across all subjects

```json
{
  "student_id": "stu_li_ming_a7k2",
  "name": "李明",
  "grade": 4,
  "grade_band": "upper_primary",
  "language": "zh-CN",
  "personal": {
    "hobbies": "阅读、绘画、踢足球",
    "most_exciting_event": "参加学校运动会并获得第一名",
    "most_sad_event": "宠物小狗生病去世了"
  },
  "created_at": "2026-04-10T00:00:00Z",
  "updated_at": "2026-04-10T00:00:00Z"
}
```

## Subject Profile

- Path: `outputs/students/<student_id>/<subject>/profile.json`
- Use the exact template shape below when initializing a missing subject profile.

### Math

```json
{
  "tone": "concise_guiding",
  "profile": {
    "preferences": {
      "likes_visual": true,
      "likes_story_context": true,
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

### Chinese

```json
{
  "tone": "student_centered",
  "profile": {
    "preferences": {
      "likes_model_text": true,
      "likes_oral_explanation": true,
      "likes_revision": true
    },
    "self_report": {
      "easy_areas": [],
      "hard_areas": []
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
- `profile.preferences`
- `profile.self_report`
- `profile.current_levels`
- `learning_state`
- `error_history`
- `session_history`

## Subject Memory

- Path: `outputs/students/<student_id>/<subject>/memory.json`
- Stores dual-layer memory separate from `profile.json`

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
    "teach_readiness": "unknown",
    "confirmed_skills": [],
    "skill_errors": [],
    "updated_at": "2026-04-10T00:00:00Z"
  }
}
```

## Confirmed Skills (Whitelist)

- Path: `outputs/students/<student_id>/<subject>/memory.json` → `learning_memory.confirmed_skills`
- Records skills the student has confirmed mastery of during Feynman/teaching sessions
- AI in learner role should NOT make mistakes on these skills

```json
{
  "confirmed_skills": [
    { "skill": "减法借位", "domain": "addition_subtraction", "confirmed_at": "2026-05-02T10:00:00Z" },
    { "skill": "凑十策略", "domain": "addition_subtraction", "confirmed_at": "2026-05-01T09:00:00Z" }
  ]
}
```

**Initialization**: Automatically populated from `profile.json` → `learning_state.mastered_topics` when memory is first created or when `mastered_topics` is updated.

## Skill Errors

- Path: `outputs/students/<student_id>/<subject>/memory.json` → `learning_memory.skill_errors`
- Tracks errors the student made on whitelisted skills during teaching sessions

```json
{
  "skill_errors": [
    { "skill": "减法借位", "error_count": 1, "last_error_at": "2026-05-02T11:00:00Z" }
  ]
}
```

**Removal Rule**: When `error_count` reaches 2 for a skill, remove it from `confirmed_skills` and reset its `skill_errors` entry.

## Current Learning State

- Path: `outputs/students/<student_id>/<subject>/current_state.json`
- Stores one lightweight snapshot of the current teaching state

```json
{
  "active_focus": "",
  "source": "profile",
  "entry_point": "learn",
  "submode": "learn",
  "pending_teach_handoff": false,
  "pending_teach_focus": "",
  "pending_transfer_phase": false,
  "pending_transfer_focus": "",
  "updated_at": "2026-04-10T00:00:00Z"
}
```

## Storage Boundaries

- `profile.json`: stable structured subject profile plus `session_history`
- `memory.json`: dual-layer memory for stable observations and recent learning signals
- `current_state.json`: latest active focus and handoff-related state only
- Session segments: kept in memory during the session, persisted as a compact summary after finalize

## Write Assumptions

DSH 技能使用 `read` → 内存合并 → `write` 的整文件写入方式。假设：

- 单学生、单会话、单进程；不提供跨进程锁或事务。
- 每次写入前必须 read 完整文件，写入完整合法 JSON。
- 不做隐式并发保护；同一文件不要并行写。
- `student_id` 必须匹配 `stu_<name>_<shortid>`，并拒绝 `/`、`\`、`..` 等路径穿越字符。

需要多进程并发时，后续应迁移到数据库或加文件锁；当前技能包不承诺该能力。

## Session Segment

Each segment is passed in memory during the session and follows this structure:

```json
{
  "focus": "fraction addition",
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
  "teach_handoff_recommended": true
}
```

Optional fields:

- `overall_performance_code`: One of `needs_support`, `basic_independent`, `stable`, `flexible`. Omitted if performance cannot be assessed yet.
- `overall_performance_text`: Free-text description of performance level. Omitted if code is omitted.
- `teach_handoff_recommended`: Boolean indicating whether the segment suggests a handoff to `/teach`. Defaults to false if omitted.
- `confirmed_skills`: List of skills the student demonstrated mastery of during this segment. Used to update whitelist.
  Example: `["减法借位", "凑十策略"]`
- `skill_errors_observed`: List of skills where the student made errors during this segment. Used to update error tracking.
  Example: `["进位加法"]`

Required fields:

- `focus`, `subject`, `mode`, `submode`, `source`, `strategy_summary`, `strengths`, `difficulties`, `next_step_candidate`, `recommended_targets` must all be present.

## Error History

语文错误标签见 `chinese-reading` 包的 `chinese-core` skill 中的 `references/chinese-error-labels.md`。

年级段映射、默认 active_domain 与语气默认值见 `learn-core` skill 的 `references/grade-band-defaults.md`。

## Error History Entry

Each record includes: `error_id`, `date`, `domain`, `topic`, `error_type`, `raw_file`, `original_raw_file`, `extracted_file`, `renamed`, `analyzed`, `self_diagnosis`.

## Priority Targets

`priority_targets` may be strings or objects. Prefer the object form when the target comes from error analysis.

## Session History Retention

- Keep `session_history` in `profile.json` with the newest summary at index 0, and keep only the first 5 items.
- When older sessions are dropped, merge repeated focus areas into long-term milestone records.
- Store long-term progress in `outputs/students/<student_id>/<subject>/milestones.json`.

## Milestones

Keep milestones compact and sorted by importance, then recency.

`milestones.json` shape:

```json
{
  "milestones": [
    {
      "focus": "异分母分数加法",
      "date": "2026-11-04T12:00:00Z",
      "type": "developing",
      "summary": "能用画图理解通分，开始独立找公分母。"
    }
  ],
  "updated_at": "2026-11-04T12:00:00Z"
}
```

- `milestones` 最多 20 条。
- `type` 可用 `developing` / `mastered` / `stage_change` / `breakthrough`。
- 旧会话被挤出 `session_history` 时，把其中长期有意义的信息压缩成里程碑。

## Session Summary Entry

Each `session_history` item includes: `session_id`, `date`, `entry_point`, `focus`, `overall_performance_code`, `overall_performance_text`, `strategy_summary`, `strengths`, `difficulties`, `next_step`, `recommended_targets`.

**Status field** (optional):
- `status`: One of `completed` (default) or `interrupted`.
- If `status = interrupted`, add:
  - `interrupted_at`: timestamp when the session was interrupted.
  - `last_topic`: the topic being studied before interruption.

Interrupted sessions retain partial progress in `strategy_summary`, `strengths`, `difficulties` for continuity when the student returns.

## Profile Target Priority

When selecting the next learning target from profile state, prefer:

1. `session_history[0].next_step`
2. `priority_targets`
3. `developing_topics`
4. recent milestones
5. grade-band defaults

## Allowed Performance Codes

`needs_support`, `basic_independent`, `stable`, `flexible`

## Persistence Rule

- Every complete student-facing learning session must append one new summary record, update `updated_at`, and apply the retention policy above.
- `learn -> teach` counts as one complete session for persistence.
