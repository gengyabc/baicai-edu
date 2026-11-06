---
name: math-diagnose
description: 数学策略诊断与错题分流。数学目标起点不明、连续两轮引导卡住、学生提交错题、练习需识别错误模式，或自述与表现不符时使用。
user-invocable: false
---

# 数学诊断

## 开始与输入

未加载时加载 `math-core`、`learn-core`、`learn-data`，通过数学开始门槛。读 `math-core` 的 `references/math-teaching-core.md`、`references/strategy-diagnosis-rules.md`；后者统一观察、错因、保守估计与置信度。路径相对于对应 skill 的 base directory。

错题文件/raw 扫描交 `learn-errors`；生成诊断练习另读 `math-core` 的 `references/targeted-practice-rules.md`。无响应与费曼角色按共享条件表。诊断题按 CGI 写成生活故事，兴趣不进入题干；学生做不出当前题时读 `math-core` 的 `references/math-personalization.md`。

复用调用方的 `student_id`、`subject: math`、`focus` / `mode`、本轮消息与快照中的 `profile.current_levels`、`error_history`、`learning_state.priority_targets`、memory 已确认技能；可选文件列表或 raw 扫描范围。有文件走错题分流，否则走策略诊断。

## A. 策略诊断

1. 按诊断参考定位当前数量角色与一处待澄清策略；分数/小数用其对应观察项。复用已知解释，未涉及项留未知，不逐项出题填表。
2. 等学生展示推理，区分关系理解、计算与表达，依新回应调整支持；能力不以采用教师办法判断。
3. 按「保守结论」给当前任务范围内的估计与一个 `next_target`。证据不足可结束诊断，保留低置信度和原阶段，从可独立行动或同结构低负荷任务补证。

完成条件：结论可追溯，未知/低置信度明确，有一个可执行小目标。

## B. 错题分流

1. 一次一道，先听当前题的理解或计算；已有自述直接继续，无实际错误依据不先问“错在哪”。
2. 文件处理交 `learn-errors`，取得分析与记录引用。
3. 核对自述和步骤，结合历史区分偶发与稳定模式。
4. 按诊断参考形成有证据的结论；需巩固交 `math-practice`，继续教学交 `math-session`，接收方推进教学。

完成条件：当前题分析可追溯，自述已核对，关键步骤支持错因与下一分支；证据不足不仓促转换。

## 回传

仅回传结论，供调用方合并本轮唯一 segment，不另产 segment 或写档案。

| 字段 | 契约 |
|---|---|
| `current_levels` | 算术/分数策略阶段部分更新，仅本次有证据字段 |
| `strategy_summary` | 学生实际推理 |
| `strengths` / `difficulties` | 有证据的优势/困难，含引导理解情况 |
| `next_target` | 具体小目标 |
| `diagnosis` | 有错误证据时填 `domain`、具体数学 `label`、`evidence` |
| `confidence` | 按诊断参考 |

合并前读 `math-core` 的 `references/math-segment-fields.md`：`next_target` → `next_step_candidate`；`confidence` 仅诊断元信息。schema 与 finalize 映射归 `learn-data`。

学生可见收束为一句核心问题与一句下一步；阶段、标签、JSON 留在内部。
