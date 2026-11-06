---
name: math-practice
description: 数学分层练习。需用同类题确认错误模式、用对比解释错因、稳定独立计算、按学生要求多练，或连接已掌握知识时使用。
user-invocable: false
---

# 数学练习

## 开始与输入

未加载时加载 `math-core`、`learn-core`、`learn-data`，通过数学开始门槛。读 `math-core` 的 `references/math-teaching-core.md` 与 `references/targeted-practice-rules.md`；后者统一目的、题量、适配与逐题调整。路径相对于对应 skill 的 base directory。

错题文件交 `learn-errors`，复用 `outputs/students/<student_id>/math/extracted/<error_file>.md` 已有分析；确认与费曼角色按共享条件表。个性化读 `math-core` 的 `references/math-personalization.md`。

复用调用方的 `student_id`、`mode`、`focus`、本轮表现/自述及快照：
- 数学 `profile.current_levels`（算术/分数阶段、`overall`）。
- `profile.preferences`（`likes_visual`、`likes_story_context`、`likes_direct_calculation`）、`profile.self_report.easy_topics/hard_topics`。
- `error_history` 与分析、`learning_state.active_domain` / `priority_targets`、memory 的 `learning_memory.recent_error_patterns`。
- 共享 `personal.interests` 随快照读取，不进入选题；学生做不出当前题时按个性化参考搭桥。已有 `math-diagnose` 结论一并复用。

## 执行

1. **定起点**：复用诊断；只需查重复错误可用第1层，需估阶段或澄清不明错因则交 `math-diagnose`。完成条件：一个待检验/巩固模式，不重查已确定结论。
2. **选目的**：按练习参考选择诊断、对比、变式或连接，设计当前一题。完成条件：目的有证据、目标单一、题量不超限；四类不是等级，连接不以计算稳定为前提。
3. **逐题推进**：按参考出题、等待、确认、调整。完成条件：当前题待答，或已有证据决定继续、重选目的或返回；后续确认等待回应。
4. **收束**：目的满足、题量到上限或需重定位卡点时，总结已展示关系/待解问题，返回 `math-session`；需诊断时调用 `math-diagnose`。完成条件：区分证据与未知，给具体下一步；不因到上限宣告掌握或追加题单。

## 回传

读 `math-core` 的 `references/math-segment-fields.md`；直接调用时回传 segment，作为 `math-session` 子流程时只回传证据供合并。

- `subject: math`、`submode: practice`，`mode` 沿用调用方，`source` 对齐实际来源（错题练习为 `error_analysis`）。
- `strategy_summary` 区分对比判断与独立计算，记录已观察证据。
- `next_step_candidate` 具体建议继续/重选目的或局部支持；`recommended_targets` 为近邻目标，`feynman_handoff_recommended` 按实际需要填。

学生只见说明、当前题、确认追问与已展示关系；层次、错误类型、JSON 留在内部。日志、档案与 finalize 按共享协议。
