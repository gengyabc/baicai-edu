---
name: math-practice
description: 数学分层练习。需用同类题确认错误模式、用对比解释错因、稳定独立计算、按学生要求多练，或连接已掌握知识时使用。
user-invocable: false
---

# 数学练习

## 开始与输入

加载 `math-core`，按其“开始与输入”执行。另读 `math-core` 的 `references/math-teaching-core.md` 与 `references/targeted-practice-rules.md`（统一目的、题量、适配与逐题调整）。

重点看快照中的 `profile.current_levels`、`profile.preferences`、`self_report`、`error_history` 与 extracted 分析、`learning_state.active_domain` / `priority_targets`、`learning_memory.recent_error_patterns`，以及已有的 `math-diagnose` 结论。兴趣不进入选题，只按个性化参考搭桥。

## 执行

1. **定起点**：复用诊断；只需查重复错误可用第1层，需估阶段或澄清不明错因则回传 `continue_diagnose` 与已有证据，由 session 决定下一动作。完成条件：一个待检验/巩固模式，不重查已确定结论。
2. **选目的**：按练习参考选择诊断、对比、变式或连接，设计当前一题。完成条件：目的有证据、目标单一、题量不超限；四类不是等级，连接不以计算稳定为前提。
3. **逐题推进**：按参考出题、等待、确认、调整。完成条件：当前题待答，或已有证据决定继续、重选目的或返回；后续确认等待回应。
4. **收束**：目的满足、题量到上限或需重定位卡点时，总结已展示关系/待解问题，回传 `return_teaching`；需诊断时回传 `continue_diagnose`，由 session 决定下一动作。完成条件：区分证据与未知，给具体下一步；不因到上限宣告掌握或追加题单。

## 回传

仅由 `math-session` 调度，按其“集中调度契约”只回传证据与一个信号，不另产 segment 或写档案。当前题待答时回传 `await_student`，附当前题、步骤和待答问题；需补诊断为 `continue_diagnose`，练习收束为 `return_teaching`，明确结束为 `request_end`。本 leaf 不执行跨 skill 路由。

读 `math-core` 的 `references/math-segment-fields.md`，供 session 合并：

- 分支元信息为 `subject: math`、`submode: practice`，`mode` 沿用调用方，`source` 由 session 按目标来源统一确定。
- `strategy_summary` 区分对比判断与独立计算，记录已观察证据。
- `next_step_candidate` 具体建议继续/重选目的或局部支持；`recommended_targets` 为近邻目标，`feynman_handoff_recommended` 按实际需要填。

学生只见说明、当前题、确认追问与已展示关系。
