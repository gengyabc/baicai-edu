---
name: math-diagnose
description: 数学策略诊断与错题分流。数学目标起点不明、连续两轮引导卡住、学生提交错题、练习需识别错误模式，或自述与表现不符时使用。
user-invocable: false
---

# Math Diagnose

## 开始前

未加载时调用 `skill` 加载 `math-core`、`learn-core`、`learn-data`，通过 `math-core` 的开始门槛后诊断。读取它的 `references/math-teaching-core.md` 与 `references/strategy-diagnosis-rules.md`；后者是观察、错因分类、保守估计与置信度的唯一来源。reference 路径相对于对应 skill 的 base directory。

有错题文件或 raw 扫描请求时加载 `learn-errors`；生成诊断练习时另读 `math-core` 的 `references/targeted-practice-rules.md`。无响应与费曼角色按 `learn-core` 的对应条件读取。

## 输入与分支

复用调用方传入的 `student_id`、`subject: math`、当前 `focus` / `mode`、本轮消息，以及数学快照中的 `profile.current_levels`、`error_history`、`learning_state.priority_targets` 和 memory 的已确认技能。可选输入是文件列表或 raw 扫描范围。

- 只有对话/策略证据：走策略诊断。
- 有错题文件：走错题分流；已处理文件复用分析，处理权限与去重按 `math-core` 的共享协议。

完成条件：已选定一个待诊断焦点，清楚可用证据及文件是否已处理。

## A. 策略诊断

1. 根据现有对话逐项检查诊断 reference 的 What To Observe；未涉及的观察项标为未知，只为当前目标补必要的题目或追问。分析错因时先问“你觉得这道题错在哪？”；已有自述就复用。
2. 等学生展示推理或沿引导行动，再按 Guidance Understanding Check 处理无响应信号。
3. 按 Conservative Conclusion 形成阶段估计和下一步。证据不足也可结束诊断，但必须明示低置信度，并选择更低阶段的小目标；未观察的阶段字段保持原值。

完成条件：每项结论能对应本轮或已有证据，未知项与低置信度已区分，且有一个可执行的小目标。

## B. 错题分流

1. 先取得学生自己的判断，再分析第一道新题；一次只分析一道。已经给出自述时直接继续。
2. 将文件处理整体交给 `learn-errors`，取得分析结论与已有记录引用后再继续。
3. 按诊断 reference 的 Error Interpretation 核对自述与实际步骤，结合历史区分偶发失误和稳定模式。
4. 按 Conservative Conclusion 给出下一目标：巩固交给 `math-practice`，继续教学交回 `math-session`。本分支负责交接结论，后续教学由接收方推进。

完成条件：当前题的分析可追溯、学生自述已核对、错因结论有关键步骤支持，并已确定下一教学分支。

## 回传

内部回传诊断结论，供调用方合入本轮唯一 segment：

| 字段 | 契约 |
|---|---|
| `current_levels` | 算术/分数策略阶段的部分更新，只包含本次有证据的字段 |
| `strategy_summary` | 简短描述学生实际推理方式 |
| `strengths` / `difficulties` | 证据支持的优势与困难，包括引导理解情况 |
| `next_target` | 下一步具体小目标 |
| `diagnosis` | 有错误证据时填 `domain`、具体数学 `label`、`evidence` |
| `confidence` | 诊断 reference 定义的置信度 |

合并前读 `math-core` 的 `references/math-segment-fields.md`：`next_target` 映射为 `next_step_candidate`；`confidence` 仅为诊断元信息。完整 schema 与 finalize 映射归 `learn-data`；本 skill 回传结论，不另产出 segment 或写档案。

学生可见的诊断收束为一句核心问题和一句下一步；取证过程仍按教学需要提问。阶段名、错误标签与 JSON 保留在内部。
