---
name: save
description: 手动保存当前会话：读取当前学生与对话，组装最小 session segment，按 finalize 协议写回档案、记忆、当前状态与里程碑，并告诉学生已保存。
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
- 有学生 → 读出 `student_id`、`subject`。

### 2. 读取快照

读共享档案、科目档案、memory、current_state、milestones。

### 3. 组装 session segment

如果当前对话里已经有 `/learn` 或 `/feynman` 的 `session_segments`，直接使用它们；不要重复造。

如果没有，基于当前对话组装一个最小 segment：

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
  "teach_handoff_recommended": false
}
```

只写你从对话中确实知道的；不确定的字段用空数组或空字符串，不要编造。

### 4. 可选：数学策略诊断

如果 `subject = math` 且本轮有足够观察，加载 `math-diagnose` 做一次轻量策略诊断，把结果并入 `strategy_summary`；不要为了诊断而额外问很多问题。

### 5. Finalize

按 `learn-data` 的“Finalize”：

- `entry_point: "save"`。
- 生成 final summary 与四个 patch。
- 读完整文件 → 合并 → 写回。
- 保留 5 条 session history、20 条 error history、20 条 milestones。
- 清空 `pending_teach_*` / `pending_transfer_*`。

### 6. 告诉学生

一句话即可：

> 这次已经保存好了。下次可以接着练<focus>。

不要展示 JSON 或内部字段。

## Constraints

- 只在学生明确要求保存时使用；不要每轮自动调用。
- 没有可保存内容时，告诉学生“这次还没有学习记录”，不要写空 summary。
- 不重复 finalize 已经保存过的同一段对话。
- 保存失败时明确说“没有保存成功”，不要假装成功。
- 不修改 `raw/`。

## Related

- `learn`：正常学习结束后自动 finalize。
- `learn-data`：finalize 协议。
