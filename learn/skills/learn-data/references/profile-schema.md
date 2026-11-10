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

教育阶段与学习配置为可选兼容扩展：`education_stage` 取 lower_primary / upper_primary / junior_secondary / senior_secondary / higher_education / adult，缺失按 `references/grade-band-defaults.md` 推导或未知。`grade` / `grade_band` 可缺省，非小学不强填；已有值保留，阶段冲突按学生更正处理，不猜能力。可选 `learning_context` 复用为学生明确提供的简短中性学习情境，如职业起步、提升、转型、资深发展、退休或兴趣学习，可组合描述；与 education_stage 分开，不由年龄、阶段或职业推断，不新增职业枚举字段，不含单位身份、家庭冲突等私人困境。可跳过，只由建档/start/profile 设置或更正；当轮时间、资源等临时限制仅用于当前支持，不自动写入此字段。

`learning_preferences` 形状为 `{ "goals": [], "support_preferences": [] }`，缺失按空。只保存学生明确设置的跨科长期目标与支持偏好；不由一次答题、低信心或拖延推断。只由建档/start/profile 指定写入者写，finalize 不写共享档案。

## Subject Profile

- Path: `outputs/students/<student_id>/<subject>/profile.json`
- 下面的 JSON 是外壳，键都要保留。偏好键、`current_levels` 的键、`active_domain` 的取值由学科包定义：新建时年级段读 `references/grade-band-defaults.md`，初始领域、水平与偏好键读学科契约（`references/subject-contract.md`）。
- `profile.preferences` 初始全为 `false`；`/learn-start` 把学生选中的那一项设为 `true`。
- 各科都用 `easy_topics` / `hard_topics`，不用 `easy_areas` / `hard_areas`。

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

`confirmed_skills` 的一条：

```json
{ "skill": "示例技能", "domain": "subject_domain", "confirmed_at": "2026-10-02T10:00:00Z" }
```

`skill_errors` 的一条：

```json
{ "skill": "示例技能", "error_count": 1, "last_error_at": "2026-10-02T11:00:00Z" }
```

新建 memory 时，把已有 `learning_state.mastered_topics` 种进 `confirmed_skills`（对象，按 `skill` 去重）。`session_segment.confirmed_skills` 只写技能名；finalize 补上 `domain` 和 `confirmed_at`，`domain` 由学科包选择。确认、错误计数和撤销只遵循 `learn-core` 的 `references/feynman-skill-whitelist.md`。`mastered_topics` 只在该 topic 的技能连续两个会话留在 `confirmed_skills` 且没有 `skill_errors` 时加入。

`profile_memory.material_difficulty` 由 finalize 从日志 `context.difficulty_request` 写入：`direction` 为 `standard` / `easier` / `harder`，`note` 是学生原话概括与对象，`updated_at` 取请求时间。它只影响新材料、题目或文本的呈现，不是水平，不改 `current_levels`，也不作为掌握证据。

### 隔离通用进度与学习支持

memory 可选新增 `general_progress: []` 与 `learning_support_memory: { "plans": [], "observations": [] }`，旧文件缺失按空，不迁移旧心理描述。具体白名单与更正只按 `references/finalize-session.md`。

- general_progress 保存带 scope_id、teaching 和实际能力归属的通用任务进度；恢复/推荐只消费当前目标，不转入专门 confirmed_skills、current_levels 或 mastered_topics。
- plans 保存学生明确要求的中性计划，不是教学表现；observations 是注明来源/时间/适用情境的历史事实，不是心理等级。superseded 条目不再用于建议。
- `/learn-profile` 可只读展示计划、事实及日期来源；教学先核对旧观察是否适用于当前目标，学生更正优先。不默认跨科传播这些记录或敏感内容。
- 仅 finalize 写 memory；support_events 是计划/更正的唯一交接，不由支持方法或档案展示直接改写。保留上限与排序以 `references/session-retention.md` 为准。

### How Memory Is Consumed

这些字段在快照时读取并使用：

| Field | Read by | Use |
|---|---|---|
| `profile_memory.preferred_scaffolds` | 当前学科会话 | 先用已记录的支架，再考虑新的。 |
| `profile_memory.motivation_signals` | `learn`、`feynman`、`next-step` | 历史参考，仅决定具体反馈与措辞；无来源旧条目不当作当前心理事实，学生更正优先，不跨科传播。 |
| `profile_memory.expression_traits` | 当前学科会话 | 学科使用该字段时，对齐长短和口语/书面偏好。 |
| `profile_memory.stable_strengths` / `stable_difficulties` | 入口与学科的目标选择 | `session_history` 为空时做决胜。 |
| `profile_memory.preferred_persona` | `learn-core` 的 `references/pedagogy-core.md` Voice And Feedback | `guided_coach` 或 `socratic_tutor`。 |
| `profile_memory.material_difficulty` | 当前学科生成新材料、题目或文本前 | 按学生最近一次要求定负荷；`direction` 为 `easier` / `harder` / `standard`，不改 `current_levels`。 |
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

写入步骤以本技能的 Write Protocol 为准。

- 一个学生、一个会话、一个进程。没有跨进程锁或事务。
- `student_id` 符合 Data Root 的 `stu_<slug>_<4hex>`，且不含 `/`、`\`、`..`。

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
