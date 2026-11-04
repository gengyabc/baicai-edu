# Next Step

## Purpose

每轮学习结束后，选一个足够小的下一步，并给学生三个选择：继续、迁移练习、当小老师或结束。

## Inputs

- `latest_segment`
- `subject`
- `focus`
- 本轮观察
- `memory.recommended_next_moves`（若存在，优先采用）
- `memory.motivation_signals`（决定表扬什么）
- `memory.feynman_readiness`（决定是否提议“当小老师”）
- `offer_menu`（默认 true；`/save` 时为 false）

## Process

1. 找出本轮的主要成功点和还没解决的点。
2. 决定下一步类型：稳定（同类型）、变化（换情境/数字）、连接（和已会的内容连起来）、轻微抽象。
3. 生成一个清晰的 `next_step` 和 1-3 个 `recommended_targets`。
4. `offer_menu = false` 时，只返回 `focus`、`next_step`、`recommended_targets`。
5. `offer_menu = true` 时，用学生能懂的话给出三个选择。

## Menu

根据科目和学生年级给选择（最多三个）：

1. **继续 / 换个题**：再练一个同类型或小变式。
2. **我来当小老师（费曼）**：学生讲给 AI 听，AI 当学生提问。只有 `memory.feynman_readiness` 不是 `not_ready` 时才提供这个选项。
3. **结束**：保存这次会话。

数学的“迁移练习”是 `math-student-problem`（学生出题考 AI）。
语文阅读的“迁移练习”是 `chinese-read-write-transfer`（读写迁移），由 `chinese-session` 传 `intent: transfer_read_write` 路由；写作的迁移是换一个角度或题目再写一小段。

## Current State Patch

选择练习迁移时：

```json
{
  "pending_transfer_phase": true,
  "pending_transfer_focus": "<focus>"
}
```

选择费曼时：

```json
{
  "pending_feynman_handoff": true,
  "pending_feynman_focus": "<focus>"
}
```

选择结束时：不写 `current_state_patch`；finalize 会写 `active_focus` 和 `last_finalized_session_id`。

练习迁移结束后，把两个 pending transfer 字段清空并写回 `current_state.json`。

## Output Example

```json
{
  "choice": "practice_transfer",
  "focus": "异分母加法",
  "next_step": "你来出一道同类题，看看我能不能做对",
  "recommended_targets": ["异分母加法"],
  "current_state_patch": {
    "pending_transfer_phase": true,
    "pending_transfer_focus": "异分母加法"
  }
}
```

## Rules

- 一次只推荐一个主要下一步；不要列一长串。
- 低年级（1-3）给两个选择就够（继续 / 结束），不要一次给三个复杂选项；高年级（4-6）可加“当小老师”和“你出题考我”。
- 学生说“随便”“都行”时，替他选一个最合适的，不要反复追问。
- 不要用“你今天已经学了很多”作为结束理由；用具体达成的小目标。
