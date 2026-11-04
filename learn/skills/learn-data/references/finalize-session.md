# Finalize Session

执行前读取本 skill 的 `references/session-retention.md` 和 `learn-core` 的 `references/feynman-skill-whitelist.md`。将 `session_segments` 汇总为科目档案、诊断历史、记忆、当前状态、里程碑五个 patch，合并写入四个科目文件后清空日志。

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

1. 读完整 `session_log.json` 与 `current_state.json`，验证 student/subject/session_id 与本次保存一致。
2. `last_finalized_session_id` 相同表示四个科目文件已提交：不重复写科目文件或累计错误。若同一日志仍有 segments/context/finalize_plan，只清理这些已提交的临时内容；清理失败说明“学习记录已保存，日志清理未完成”，下次重试清理，不误报学习数据未保存。
3. marker 不同且日志有匹配的 `finalize_plan`：直接执行下节的 Commit And Recovery，不重新生成 summary/patch、不在半写入文件上再次前插或计数。
4. marker 不同且无 plan：继续 Process。旧日志/文件形状均兼容，只有新 finalize 才产生 plan。

## Process

1. `session_segments` 为空：返回 `nothing_to_finalize: true`，不要写文件。
2. 选最终焦点：取最后一个 segment 的 `focus`；若中断，取 `last_topic`。
3. 汇总 `overall_performance_code` / `overall_performance_text`：取最保守/最低的档位，并写一句综合描述。
4. 汇总 `strategy_summary`：合并各段，不超过 2-3 句。
5. 合并 `strengths` / `difficulties`：去重，各保留 3-5 条。
6. 汇总 `recommended_targets`：去重，保留 1-3 个。
7. 生成 `next_step`：优先最后一段的 `next_step_candidate`。
8. 生成 `final_summary`。
9. 生成五个 patch（见下）；科目档案和诊断历史两个 patch 合并进同一个科目 profile 文件。
10. 读取四个完整科目文件，在内存中合并为四份最终 JSON；先执行下面的 Commit And Recovery，禁止边生成 patch 边写科目文件。
11. 提交成功后清理日志临时内容，保留 session_id、entry_point、started_at 并更新 updated_at。
12. 告诉学生一句简短总结；不展示 JSON。

## Commit And Recovery

文件仍采用单会话本地 read/write，不宣称跨文件事务。为使部分写入可安全重试，使用日志中的准备计划：

1. **Prepare**：在任何科目文件写入前，先将 `finalize_plan` 写入当前日志并确认成功。plan 包含匹配的 `session_id`、`student_id`、`subject`、`final_summary`，以及 `target_files` 下 `profile`、`memory`、`milestones`、`current_state` 四份完整最终 JSON。时间戳和错误计数在准备时确定；current_state 的最终镜像含本次 marker。目标路径由数据协议计算，不接收计划中的任意路径。
2. **Commit**：按 `profile → memory → milestones → current_state` 顺序逐一先读目标文件，再写计划中的最终镜像。marker 只能在最后一个科目文件中写入；四文件全部成功前不清日志。重试始终重放相同镜像，不能基于已部分写入的文件重新合并、重新前插历史或再次加错误计数。
3. **Failure**：准备计划失败时不写任何科目文件；提交途中失败时保留完整 plan 与 segments，明确未完成保存并停止新教学。下次 `/save` 或恢复优先重放该 plan。持有 plan 期间同一学生/科目不得执行新的 `/profile` 编辑或 `learn-errors` 写入；先完成/恢复保存，不覆盖中途外部修改。若发现人工修改冲突，停止并请用户选择恢复方式。
4. **Cleanup**：marker 写成功后，清空 segments、移除 context 与 finalize_plan。此时重试即使只剩日志清理，也只做清理，不重复写科目数据。下次教学新建身份。

该计划只存在当前未完成日志中，清理后不保留旧快照，不写 raw 或共享档案。它解决本协议的顺序写入失败重放，不提供多进程锁或任意文件损坏恢复。

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
- `session_history` 前插最新 summary，按 `references/session-retention.md` 保留。
- `learning_state` 只覆盖 patch 中出现的字段。
- `mastered_topics` 不因一次成功添加。技能确认先遵循 `learn-core` 的白名单协议；只有当同一 topic 下的技能连续两个会话保持在 `confirmed_skills` 且没有 `skill_errors` 时，才把该 topic 加入 `mastered_topics`。
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
- 前插最新条目，上限按 `references/session-retention.md`。
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

- 按 segment 时间顺序处理 `confirmed_skills` 与 `skill_errors_observed`。确认门槛、错误计数和撤销/再确认完全遵循 `learn-core` 的 `references/feynman-skill-whitelist.md`；不要在 finalize 另设一套阈值。
- 达到确认条件的技能名转成 `{ "skill", "domain", "confirmed_at" }`，按 `skill` 去重；错误计数持久化为 `{ "skill", "error_count", "last_error_at" }`。撤销后的旧确认不得被无序合并重新加入。
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
- 上限与超限压缩按 `references/session-retention.md`。
- 只记录长期有意义的变化：策略阶段变化、主题掌握、反复成功、明显跃迁。

## Session Log After Finalize

移除 `context` 与 `finalize_plan`，把 `session_log.json` 更新为：

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
- 提交失败与清理失败分别按 Commit And Recovery 处理，不把已提交会话重复汇总；未提交时保留 plan 与 segments，可用 `/save` 重试。
