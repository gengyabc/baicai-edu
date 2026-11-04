# Finalize Session

## Purpose

把一次会话的 `session_segments` 压缩成四个可写回的文件补丁：科目档案、记忆、当前状态、里程碑。

## Inputs

```json
{
  "student_id": "stu_xxx",
  "subject": "math",
  "session_segments": [],
  "status": "completed",
  "interrupted_at": null,
  "last_topic": null,
  "entry_point": "learn"
}
```

规则：

- `student_id`、`subject`、`session_segments` 必填。
- `status` 只能是 `completed` 或 `interrupted`，默认 `completed`。
- `status = "interrupted"` 时，`interrupted_at` 与 `last_topic` 必填。
- `entry_point` 取 `learn`、`feynman`、`save` 之一。

## Process

1. `session_segments` 为空：返回 `nothing_to_finalize: true`，不要写文件。
2. 选最终焦点：取最后一个 segment 的 `focus`；若中断，取 `last_topic`。
3. 汇总 `overall_performance_code` / `overall_performance_text`：取最保守/最低的档位，并写一句综合描述。
4. 汇总 `strategy_summary`：合并各段，不超过 2-3 句。
5. 合并 `strengths` / `difficulties`：去重，各保留 3-5 条。
6. 汇总 `recommended_targets`：去重，保留 1-3 个。
7. 生成 `next_step`：优先最后一段的 `next_step_candidate`。
8. 生成 `final_summary`。
9. 生成四个 patch（见下）。
10. 按 `learn-data` 的写协议读完整文件、合并、写回。
11. 告诉学生一句简短总结；不展示 JSON。

## final_summary

字段至少包含：

```json
{
  "session_id": "sess_20261104_1200",
  "date": "2026-11-04T12:00:00Z",
  "entry_point": "learn",
  "focus": "异分母分数加法",
  "overall_performance_code": "basic_independent",
  "overall_performance_text": "基本独立完成，通分时还需要提示",
  "strategy_summary": "学生用画图理解通分，能自己找到公分母，偶尔分母乘错。",
  "strengths": ["能主动画图", "能解释为什么通分"],
  "difficulties": ["分母选择偶尔出错"],
  "next_step": "继续练异分母加法，先估分母再计算",
  "recommended_targets": ["异分母减法"],
  "status": "completed"
}
```

中断时追加：

```json
{
  "status": "interrupted",
  "interrupted_at": "2026-11-04T12:10:00Z",
  "last_topic": "异分母分数加法"
}
```

## subject_profile_patch

```json
{
  "updated_at": "2026-11-04T12:00:00Z",
  "current_levels": {
    "overall": "L1",
    "arithmetic_strategy_stage": "direct_modeling",
    "fraction_strategy_stage": "equal_sharing_no_coordination"
  },
  "learning_state": {
    "active_domain": "fractions",
    "mastered_topics": [],
    "developing_topics": ["异分母加法"],
    "priority_targets": ["异分母加法"]
  },
  "session_history": [
    {
      "session_id": "sess_20261104_1200",
      "date": "2026-11-04T12:00:00Z",
      "entry_point": "learn",
      "focus": "异分母分数加法",
      "overall_performance_code": "basic_independent",
      "overall_performance_text": "基本独立完成，通分时还需要提示",
      "strategy_summary": "学生用画图理解通分，能自己找到公分母，偶尔分母乘错。",
      "strengths": ["能主动画图", "能解释为什么通分"],
      "difficulties": ["分母选择偶尔出错"],
      "next_step": "继续练异分母加法，先估分母再计算",
      "recommended_targets": ["异分母减法"]
    }
  ]
}
```

合并规则：

- `current_levels` 只在有证据时更新；不确定时保留原值。
- `session_history` 前插最新 summary，保留 5 条。
- `learning_state` 只覆盖 patch 中出现的字段。
- `mastered_topics` 不要因为一次成功就添加；按 `learn-core` 的 whitelist 规则。

## memory_patch

```json
{
  "learning_memory": {
    "recent_focus": "异分母分数加法",
    "recent_modes": ["learn", "practice"],
    "recent_error_patterns": ["通分时分母乘错"],
    "recommended_next_moves": ["先用估算检查公分母"],
    "teach_readiness": "ready",
    "confirmed_skills": [
      { "skill": "通分", "domain": "fractions", "confirmed_at": "2026-11-04T12:00:00Z" }
    ],
    "skill_errors": [
      { "skill": "异分母加法", "error_count": 1, "last_error_at": "2026-11-04T12:00:00Z" }
    ],
    "updated_at": "2026-11-04T12:00:00Z"
  }
}
```

合并规则：

- `confirmed_skills` 按 `skill` 去重；已有不重复添加。
- 对每个 `skill_errors_observed`：读已有 `skill_errors`，找到同 `skill` 的条目就把 `error_count` 加 1 并更新 `last_error_at`；没有就新建 `{ "skill": ..., "error_count": 1, "last_error_at": now }`。
- 若某技能 `error_count >= 2` 且它在 `confirmed_skills` 里：从 `confirmed_skills` 移除，并删除对应 `skill_errors` 条目。
- `teach_readiness` 取 `unknown` / `ready` / `not_ready`。
- `profile_memory` 的稳定观察可单独合并；没有新观察时不要改。

## current_state_patch

```json
{
  "active_focus": "异分母分数加法",
  "source": "profile",
  "entry_point": "learn",
  "submode": "practice",
  "pending_teach_handoff": false,
  "pending_teach_focus": "",
  "pending_transfer_phase": false,
  "pending_transfer_focus": "",
  "updated_at": "2026-11-04T12:00:00Z"
}
```

- 结束时清空四个 pending 字段。
- 不使用旧的 slash-command / apply 词汇。

## milestones_patch

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

规则：

- 先合并重复 focus，保留最近一次。
- 再按重要性、时间排序。
- 最多 20 条；超出的旧条目删除。
- 只记录长期有意义的变化：策略阶段变化、主题掌握、反复成功、明显跃迁。

## No-op

```json
{
  "success": true,
  "nothing_to_finalize": true,
  "writes": [],
  "final_summary": null,
  "subject_profile_patch": {},
  "memory_patch": {},
  "current_state_patch": {},
  "milestones_patch": {}
}
```

## Persistence Rules

- 每次完整学习会话写一条 summary。
- `learn -> feynman` 算一次完整会话。
- 不写共享 `profile.json` 的 Prestart 八字段。
- 不生成 `shared_profile_patch`。
- 不在 finalize 里修改 `raw/`。
- 写入失败时告诉学生“这次没有保存成功”，保留内存中的 segments，下一次 `/save` 再试。
