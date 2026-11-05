---
name: math-practice
description: 数学分层练习。需用同类题确认错误模式、用对比解释错因、稳定独立计算、按学生要求多练，或连接已掌握知识时使用。
user-invocable: false
---

# 数学练习

## 开始前

未加载时调用 `skill` 加载 `math-core`、`learn-core`、`learn-data`，通过 `math-core` 的开始门槛后练习。读取它的 `references/math-teaching-core.md` 与 `references/targeted-practice-rules.md`；练习目的、题量、适配与逐题调整的唯一来源是后者。reference 路径相对于对应 skill 的 base directory。

来自错题文件时加载 `learn-errors`，复用 `outputs/students/<student_id>/math/extracted/<error_file>.md` 的已有分析。接受答案、个性化与费曼角色按 `learn-core` 的条件表执行。

## 输入

复用调用方传入的 `student_id`、`mode`、`focus`、本轮表现、自述及快照：

- 数学档案的 `profile.current_levels`（算术/分数策略阶段与 `overall`）。
- `profile.preferences`（`likes_visual`、`likes_story_context`、`likes_direct_calculation`），`profile.self_report.easy_topics/hard_topics`。
- `error_history` 与对应分析，`learning_state.active_domain` / `priority_targets`，memory 的 `learning_memory.recent_error_patterns`。
- 共享档案的 `personal.interests`，用于情境或呈现细节。
- 已有 `math-diagnose` 结论（如有）。

## 执行

1. **定起点**：复用已有诊断。需要识别是否重复同一错误时可选第 1 层；需要估计策略阶段或解释不明错因时交给 `math-diagnose`。完成条件：已明确当前练习要检验或巩固的一个模式，而非重新分析已确定的结论。
2. **选目的**：按练习参考选择诊断、对比、变式或连接，设计当前一题。完成条件：目的有学生证据、目标单一、题量符合上限；四类不是能力等级，连接不以计算稳定为先决条件。
3. **逐题推进**：按同一参考的「逐题调整」出题、等待、确认与调整。完成条件：当前题已等待学生回应，或已取得所需证据并决定下一题、重选目的或返回主线；后续题与确认留待学生回应后继续。
4. **收束当前练习**：观察目的已满足、达到题量上限或需要重新定位卡点时，用一句学生已展示的关系或待解决问题收束，交回 `math-session`。完成条件：证据与未知分开，有一个具体下一步；题量上限不代表掌握，也不继续追加题单。

## 回传

读取 `math-core` 的 `references/math-segment-fields.md`，按其引用的共享 schema 回传本轮 segment；作为 `math-session` 子流程时回传证据供外层合并。补本分支语义：

- `subject: math`、`submode: practice`；`mode` 沿用调用方，`source` 对齐实际来源（错题练习为 `error_analysis`）。
- `strategy_summary` 区分对比判断与独立计算，记录当前层已观察证据。
- `next_step_candidate` 是继续当前目的、重选目的或局部支持的具体建议；`recommended_targets` 保持近邻目标，`feynman_handoff_recommended` 按实际需要填写。

学生可见：练习说明、当前题目、确认追问与已展示的关系；内部层次、错误类型与 JSON 留在内部。调用方负责日志，档案写入与 finalize 按共享协议。
