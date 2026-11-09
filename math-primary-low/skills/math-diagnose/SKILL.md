---
name: math-diagnose
description: 数学策略诊断与错题分流。数学目标起点不明、连续两轮引导卡住、学生提交错题、练习需识别错误模式，或自述与表现不符时使用。
user-invocable: false
---

# 数学诊断

## 开始与输入

加载 `math-core`，按其“开始与输入”执行。另读 `math-core` 的 `references/math-teaching-core.md`、`references/strategy-diagnosis-rules.md`（统一观察、错因、保守估计与置信度）；生成诊断练习时再读 `references/targeted-practice-rules.md`。诊断题写成生活故事，兴趣不进入题干，搭桥条件按个性化参考。

重点看快照中的 `profile.current_levels`、`error_history`、`learning_state.priority_targets` 与 memory 已确认技能。带已处理文件 `material_refs` 时走错题分流，否则走策略诊断。

## A. 策略诊断

1. 按诊断参考定位当前数量角色与一处待澄清策略；分数/小数用其对应观察项。复用已知解释，未涉及项留未知，不逐项出题填表。
2. 等学生展示推理，区分关系理解、计算与表达，依新回应调整支持；能力不以采用教学助手办法判断。
3. 按「保守结论」给当前任务范围内的估计与一个 `next_target`。证据不足可结束诊断，保留低置信度和原阶段，从可独立行动或同结构低负荷任务补证。

完成条件：结论可追溯，未知/低置信度明确，有一个可执行小目标。

## B. 错题分流

1. 一次一道，先听当前题的理解或计算；已有自述直接继续，无实际错误依据不先问“错在哪”。
2. 读取入口已处理的 extracted 分析与记录引用。
3. 核对自述和步骤，结合历史区分偶发与稳定模式。
4. 按诊断参考形成有证据的结论；需巩固回传 `continue_practice`，继续教学回传 `return_teaching`，由 session 决定下一动作。

完成条件：当前题分析可追溯，自述已核对，关键步骤支持错因与下一分支；证据不足不仓促转换。

## 回传

仅由 `math-session` 调度，按其“集中调度契约”回传证据与一个信号，不另产 segment 或写档案。仍需学生推理时回传 `await_student`，保留当前题、步骤和待答问题；已形成结论时回传 `continue_practice` 或 `return_teaching`，明确结束为 `request_end`。仅 session 决定下一动作，本 leaf 不执行跨 skill 路由。

| 字段 | 契约 |
|---|---|
| `current_levels` | 算术/多位数/分数策略阶段部分更新，仅本次有证据字段；键与取值按诊断参考 |
| `strategy_summary` | 学生实际推理 |
| `strengths` / `difficulties` | 有证据的优势/困难，含引导理解情况 |
| `next_target` | 具体小目标 |
| `diagnosis` | 有错误证据时填 `domain`、具体数学 `label`、`evidence` |
| `confidence` | 按诊断参考 |

合并前读 `math-core` 的 `references/math-segment-fields.md`：`next_target` → `next_step_candidate`；`confidence` 仅诊断元信息。

学生可见收束为一句核心问题与一句下一步。
