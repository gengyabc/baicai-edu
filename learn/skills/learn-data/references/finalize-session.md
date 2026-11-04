# Finalize Session

## Purpose

把一次会话的 `session_segments` 压缩成四个可写回的文件补丁：科目档案、记忆、当前状态、里程碑；同时写一条诊断历史、清空会话日志、记录幂等标记。

## Inputs

```json
{
  "student_id": "stu_xxx",
  "subject": "math",
  "session_id": "sess_20261004_1200",
  "session_segments": [],
  "status": "completed",
  "interrupted_at": null,
  "last_topic": null,
  "entry_point": "learn"
}
```

规则：

- `student_id`、`subject`、`session_id`、`session_segments` 必填。
- `status` 只能是 `completed` 或 `interrupted`，默认 `completed`。
- `status = "interrupted"` 时，`interrupted_at` 与 `last_topic` 必填。
- `entry_point` 取 `learn`、`feynman`、`save` 之一。
- `session_segments` 优先从 `session_log.json` 读取；模型上下文中的副本只是缓存。

## Idempotency Gate

1. 读 `current_state.json` 的 `last_finalized_session_id`。
2. 如果它与本次 `session_id` 相同：返回 `already_finalized: true`，不写任何文件，告诉学生“这次已经保存过了”。
3. 否则继续，并在 `current_state_patch` 写入新的 `last_finalized_session_id`。

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
11. 清空 `session_log.json` 的 `segments`，保留 `session_id` 和 `updated_at`。
12. 告诉学生一句简短总结；不展示 JSON。

## final_summary

```json
{
  "session_id": "sess_20261004_1200",
  "date": "2026-10-04T12:00:00Z",
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
  "interrupted_at": "2026-10-04T12:10:00Z",
  "last_topic": "异分母分数加法"
}
```

## subject_profile_patch

`current_levels` is nested under `profile`. Do not write it at the top level.

```json
{
  "updated_at": "2026-10-04T12:00:00Z",
  "profile": {
    "current_levels": {
      "overall": "L1",
      "arithmetic_strategy_stage": "direct_modeling",
      "fraction_strategy_stage": "equal_sharing_no_coordination"
    }
  },
  "learning_state": {
    "active_domain": "fractions",
    "mastered_topics": [],
    "developing_topics": ["异分母加法"],
    "priority_targets": ["异分母加法"]
  },
  "session_history": [
    {
      "session_id": "sess_20261004_1200",
      "date": "2026-10-04T12:00:00Z",
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

- `profile.current_levels` 只在有证据时更新；不确定时保留原值。证据来自 segment 的 `current_levels` 或 `diagnosis`。
- `session_history` 前插最新 summary，保留 5 条。
- `learning_state` 只覆盖 patch 中出现的字段。
- `mastered_topics` 不要因为一次成功就添加；按 `feynman-skill-whitelist` 的两条独立证据规则。只有当同一 topic 下的技能连续两个会话保持在 `confirmed_skills` 且没有 `skill_errors` 时，才把该 topic 加入 `mastered_topics`。
- 不改共享 `profile.json` 的姓名、年级、兴趣、经历字段。

## error_history_patch

Every segment with a `diagnosis` object produces one diagnosis entry. File-based errors are written by `learn-errors`, not here.

```json
{
  "error_history": [
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
  ]
}
```

规则：

- `error_id` 用 `diag_<YYYYMMDD>_<3位序号>`；同一天按已有 `diag_` 记录递增。
- `label` 必须是学科标签表里的值（语文 `reading:` / `writing:`），数学用具体错误类型。
- 前插最新条目，保留 20 条。
- 多个 segment 同一标签时只写一条，保留最新证据和 `next_step`。
- `priority_targets` 从最新 `diagnosis` 与 `next_step` 中选 1-5 个去重写入。

## memory_patch

```json
{
  "learning_memory": {
    "recent_focus": "异分母分数加法",
    "recent_modes": ["learn", "practice"],
    "recent_error_patterns": ["通分时分母乘错"],
    "recommended_next_moves": ["先用估算检查公分母"],
    "feynman_readiness": "ready",
    "confirmed_skills": [
      { "skill": "通分", "domain": "fractions", "confirmed_at": "2026-10-04T12:00:00Z" }
    ],
    "skill_errors": [
      { "skill": "异分母加法", "error_count": 1, "last_error_at": "2026-10-04T12:00:00Z" }
    ],
    "updated_at": "2026-10-04T12:00:00Z"
  }
}
```

合并规则：

- `confirmed_skills`：segment 里是技能名字符串；先判断它是否达到“两条独立证据或一次讲清理由”的门槛，达到才转成 `{ "skill", "domain", "confirmed_at" }` 对象。按 `skill` 去重；已有不重复添加。
- 对每个 `skill_errors_observed`：读已有 `skill_errors`，找到同 `skill` 的条目就把 `error_count` 加 1 并更新 `last_error_at`；没有就新建 `{ "skill": ..., "error_count": 1, "last_error_at": now }`。
- 若某技能 `error_count >= 2` 且它在 `confirmed_skills` 里：从 `confirmed_skills` 移除，并删除对应 `skill_errors` 条目。
- `feynman_readiness` 取 `unknown` / `ready` / `not_ready`。
- `profile_memory` 的稳定观察可单独合并；没有新观察时不要改。`preferred_scaffolds`、`motivation_signals`、`expression_traits` 在观察到稳定模式时更新，且下一轮要读取使用。

## current_state_patch

```json
{
  "active_focus": "异分母分数加法",
  "source": "profile",
  "entry_point": "learn",
  "submode": "practice",
  "pending_feynman_handoff": false,
  "pending_feynman_focus": "",
  "pending_transfer_phase": false,
  "pending_transfer_focus": "",
  "last_finalized_session_id": "sess_20261004_1200",
  "updated_at": "2026-10-04T12:00:00Z"
}
```

- 结束时清空四个 pending 字段。
- 写入 `last_finalized_session_id` 作为幂等标记。
- 不使用旧的 slash-command / apply 词汇。

## milestones_patch

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

规则：

- 先合并重复 focus，保留最近一次。
- `importance` 取 `high` / `medium` / `low`；按 importance 再按时间排序。
- 最多 20 条；超出的旧条目删除。
- 只记录长期有意义的变化：策略阶段变化、主题掌握、反复成功、明显跃迁。

## Session Log After Finalize

把 `session_log.json` 更新为：

```json
{
  "session_id": "sess_20261004_1200",
  "entry_point": "learn",
  "started_at": "2026-10-04T12:00:00Z",
  "updated_at": "2026-10-04T12:20:00Z",
  "segments": []
}
```

这样下一次 `/learn` 会开新会话；`/save` 也不会重复写已经 finalize 的段。

## No-op

```json
{
  "success": true,
  "nothing_to_finalize": true,
  "already_finalized": false,
  "writes": [],
  "final_summary": null,
  "subject_profile_patch": {},
  "error_history_patch": {},
  "memory_patch": {},
  "current_state_patch": {},
  "milestones_patch": {}
}
```

## Persistence Rules

- 每次完整学习会话写一条 summary。
- `learn -> feynman` 算一次完整会话。
- 不写共享 `profile.json` 的姓名、年级、兴趣、经历字段。
- 不生成 `shared_profile_patch`。
- 不在 finalize 里修改 `raw/`。
- 写入失败时告诉学生“这次没有保存成功”，保留 `session_log.json` 中的 segments，下一次 `/save` 再试。
