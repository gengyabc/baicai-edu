# Student Profile Schema

路径布局与 raw/备份权限以 `learn-data` 的 Data Root 为准。本文件是模板，以及模板里看不出的约束。条数、排序与 `priority_targets` 上限在 `references/session-retention.md`。示例值不是初始化默认值；已有文件保留。

## Base Profile

- Path: `outputs/students/<student_id>/profile.json`
- 跨科目唯一的个性化来源。科目掌握度不写在这里。
- `personal.interests` 是兴趣的唯一列表。学科 skill 读取它；何时用于例子或搭桥，由该学科包定义。

```json
{
  "student_id": "stu_li_ming_a7b2",
  "name": "李明",
  "grade": 4,
  "grade_band": "upper_primary",
  "language": "zh-CN",
  "personal": {
    "interests": ["画画", "踢足球", "下棋"],
    "most_exciting_event": "参加学校运动会并获得第一名",
    "most_sad_event": "宠物小狗生病去世了"
  },
  "created_at": "2026-10-04T12:00:00Z",
  "updated_at": "2026-10-04T12:00:00Z"
}
```

## Initialization Defaults By Grade Band

新建缺失的科目档案时，年级映射和 `tone` 读取本技能的 `references/grade-band-defaults.md`。`learning_state.active_domain`、`profile.preferences` 的键、初始 `profile.current_levels` 由入口点名的学科包给出。下面的科目 JSON 只是外壳。

`profile.preferences` 初始全为 `false`；`/learn-start` 把学生选中的那一项设为 `true`。

## Subject Profile

- Path: `outputs/students/<student_id>/<subject>/profile.json`
- 偏好键、`current_levels` 的键、`active_domain` 的取值由学科包定义。

```json
{
  "tone": "concise_guiding",
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

模板里的这些键都要在：`tone`、`updated_at`、`profile.preferences`、`profile.self_report.easy_topics`、`profile.self_report.hard_topics`、`profile.current_levels`、`learning_state`、`error_history`、`session_history`。

各科都用 `easy_topics` / `hard_topics`，不用 `easy_areas` / `hard_areas`。

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

```json
{ "skill": "示例技能", "domain": "subject_domain", "confirmed_at": "2026-10-02T10:00:00Z" }
```

```json
{ "skill": "示例技能", "error_count": 1, "last_error_at": "2026-10-02T11:00:00Z" }
```

新建 memory 时，把已有 `learning_state.mastered_topics` 种进 `confirmed_skills`（对象，按 `skill` 去重）。`session_segment.confirmed_skills` 只写技能名；finalize 补上 `domain` 和 `confirmed_at`，`domain` 由学科包选择。确认、错误计数和撤销只遵循 `learn-core` 的 `references/feynman-skill-whitelist.md`。`mastered_topics` 只在该 topic 的技能连续两个会话留在 `confirmed_skills` 且没有 `skill_errors` 时加入。

### How Memory Is Consumed

这些字段在快照时读取并使用：

| Field | Read by | Use |
|---|---|---|
| `profile_memory.preferred_scaffolds` | 当前学科会话 | 先用已记录的支架，再考虑新的。 |
| `profile_memory.motivation_signals` | `learn`、`feynman`、`next-step` | 决定夸什么、下一步怎么说。 |
| `profile_memory.expression_traits` | 当前学科会话 | 学科使用该字段时，对齐长短和口语/书面偏好。 |
| `profile_memory.stable_strengths` / `stable_difficulties` | 入口与学科的目标选择 | `session_history` 为空时做决胜。 |
| `profile_memory.preferred_persona` | `learn-core` 的 `references/pedagogy-core.md` Voice And Feedback | `guided_coach` 或 `socratic_tutor`。 |
| `learning_memory.recent_focus` / `recent_modes` | 入口第一轮 | 用“上次我们在…”接上。 |
| `learning_memory.recent_error_patterns` | 当前学科的练习或诊断 | 优先打重复出现的模式。 |
| `learning_memory.recommended_next_moves` | `next-step` | 先提供已记录的下一步。 |
| `learning_memory.feynman_readiness` | `next-step` | 按 `references/next-step.md` 决定推荐标记与支架难度。 |
| `learning_memory.confirmed_skills` / `skill_errors` | `feynman` | 白名单与犯错规则。 |

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

- 模式与动作的恢复只靠日志 context，不在 `current_state` 存 pending。
- `last_finalized_session_id` 是幂等标记。同一 id 不第二次 finalize。

## Session Log 与 Session Segment

见 `references/session-schema.md`。

## Write Assumptions

先读完整文件，在内存中合并，再写完整合法 JSON。

- 一个学生、一个会话、一个进程。同一文件不并行写。没有跨进程锁或事务。
- `student_id` 必须匹配 `stu_<name>_<4hex>`，且不含 `/`、`\`、`..`。

## Error History

`error_history` 在科目 `profile.json` 里，同时记录文件分析和会话内诊断。

### File analysis entry

```json
{
  "error_id": "err_20261004_001",
  "source": "file_analysis",
  "date": "2026-10-04T12:00:00Z",
  "domain": "subject_domain",
  "topic": "当前题目",
  "error_type": "concept",
  "label": "subject:example_label",
  "raw_file": "data/students/<id>/<subject>/raw/topic-001-20261004.jpg",
  "original_raw_file": "data/students/<id>/<subject>/raw/original-001.jpg",
  "backup_file": "outputs/students/<id>/<subject>/backups/raw/original-001.jpg",
  "extracted_file": "outputs/students/<id>/<subject>/extracted/topic-001-20261004.md",
  "renamed": true,
  "analyzed": true,
  "self_diagnosis": "学生说自己漏了一步，证据指向另一个关系。"
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
  "topic": "当前题目",
  "evidence": "学生只给了结论，没有指出支撑它的那一处。",
  "next_step": "回到已有材料，指出一处并说明它支持什么。",
  "analyzed": true
}
```

`error_id`：文件分析用 `err_`，诊断用 `diag_`。条数与 `priority_targets` 上限见 `references/session-retention.md`。

## Milestones

```json
{
  "milestones": [
    {
      "focus": "当前焦点",
      "date": "2026-10-04T12:00:00Z",
      "type": "developing",
      "importance": "medium",
      "summary": "能说明当前做法，开始独立处理同一个关系。"
    }
  ],
  "updated_at": "2026-10-04T12:00:00Z"
}
```

- `type`：`developing` / `mastered` / `stage_change` / `breakthrough`。
- `importance`：`high` / `medium` / `low`。
- 一条 `session_history` 被挤出时，把它的长期含义压成一条 milestone。排序和条数见 `references/session-retention.md`。

## Session Summary Entry

写入 `session_history` 的一条：

```json
{
  "session_id": "sess_20261004_1200",
  "date": "2026-10-04T12:00:00Z",
  "entry_point": "learn",
  "focus": "当前焦点",
  "overall_performance_code": "basic_independent",
  "overall_performance_text": "基本独立完成，个别步骤需要提示",
  "strategy_summary": "学生说明了自己的做法",
  "strengths": ["能说出一个具体理由"],
  "difficulties": ["有一处关系还不稳定"],
  "next_step": "用一个近邻任务再试一次",
  "recommended_targets": ["同一个关系的近邻任务"],
  "status": "completed"
}
```

- `status`：`completed`（默认）或 `interrupted`。中断时再写 `interrupted_at` 和 `last_topic`。
- 一次完整的学生学习会话追加一条。`learn -> feynman` 算一次。逐轮记录在 `session_log.json`。条数见 `references/session-retention.md`。
