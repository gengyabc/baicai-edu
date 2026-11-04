---
name: save
description: 手动保存当前会话：读取当前学生与会话日志，组装最小 session segment，按 finalize 协议写回档案、记忆、当前状态与里程碑，并告诉学生已保存。
---

# Save

## Purpose

学生明确说“保存一下”时使用。它不是每轮自动保存；正常 `/learn` 会在结束时自动 finalize。

## Load First

如果本会话尚未加载，先调用 `skill` 工具加载：

1. `learn-core`
2. `learn-data`

## Dispatch

### 1. 读取当前会话

读 `outputs/students/session.json`：

- 没有当前学生 → 告诉学生先 `/start`，停止。
- 有学生 → 读出 `student_id`、`subject`、`session_started_at`。

### 2. 读取快照与会话日志

读共享档案、科目档案、memory、current_state、milestones、`session_log.json`。

- `session_log.json` 有 `session_id`（即使 `segments` 为空）→ `session_id` 取日志里的值，不要重新造；如果 `last_finalized_session_id` 与它相同，说明这段已经保存过，直接告诉学生，不再组装。
- 没有日志 → 生成新的 `session_id`，基于当前对话组装一个最小 segment，并先写入 `session_log.json`。

### 3. 组装 session segment（仅在没有日志时）

```json
{
  "focus": "<本轮主题>",
  "subject": "<math|chinese>",
  "mode": "learn",
  "submode": "review",
  "source": "save",
  "strategy_summary": "<学生这轮怎么想/怎么做>",
  "strengths": ["<具体做得好的地方>"],
  "difficulties": ["<具体卡住的地方>"],
  "next_step_candidate": "<下一步>",
  "recommended_targets": ["<1-2 个>"],
  "feynman_handoff_recommended": false
}
```

只写你从对话中确实知道的；不确定的字段用空数组或空字符串，不要编造。`save` 不做新的诊断，也不加载学科教学 skill。

### 4. Finalize

按 `learn-data` 的“Finalize”：

- 先做 `last_finalized_session_id` 幂等检查；已保存则告诉学生“这次已经保存过了”，不再写。
- `entry_point: "save"`；`session_id` 用 `session_log.json` 里的值，不要新生成。
- 生成 final summary 与五个 patch（含 `error_history_patch`，若 segment 有 `diagnosis`）。
- 读完整文件 → 合并 → 写回。
- 清空 `pending_feynman_*` / `pending_transfer_*`。
- 清空 `session_log.json` 的 `segments`。
- 保留策略以 `learn-data` 的 Retention 为准。

### 5. 告诉学生

一句话即可：

> 这次已经保存好了。下次可以接着练<focus>。

不要展示 JSON 或内部字段。

## Constraints

- 只在学生明确要求保存时使用；不要每轮自动调用。
- 没有可保存内容时，告诉学生“这次还没有学习记录”，不要写空 summary。
- 不重复 finalize 已经保存过的同一段对话；`last_finalized_session_id` 是最终判断。
- 保存失败时明确说“没有保存成功”，保留 `session_log.json`，不要假装成功。
- 不修改 `raw/`；不运行新的诊断。
- 不跨包加载 `math-diagnose` 或其他学科教学 skill。

## Related

- `learn`：正常学习结束后自动 finalize。
- `learn-data`：finalize 协议与会话日志。
