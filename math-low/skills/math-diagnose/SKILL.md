---
name: math-diagnose
description: 数学策略诊断与错题分流。目标起点不明、连续两轮引导卡住、学生提交错题、练习前需确认错误模式，或学生自述与表现不符时使用。
user-invocable: false
---

# Math Diagnose

## Session Gate

本 skill 只由 `/learn`、`/feynman` 或数学 skill 路由进入。没有 `session.json` 或 `student_id` 为空时，先引导学生运行 `/start`，不要开始诊断。

## Load First

如果本会话尚未加载，先调用 `skill` 工具加载：

1. `learn-core`（需要时读它的 `references/pedagogy-core.md`、`references/guidance-non-response-handling.md`）
2. `math-core`，并读它的 `references/strategy-diagnosis-rules.md`
3. 有错题文件时加载 `learn-errors`
4. 诊断完成后要生成练习时，读 `math-core` 的 `references/targeted-practice-rules.md`

需要数据时加载 `learn-data`；路径、`data/.../raw/` 只读、`outputs/.../extracted/` 写入、`error_history` 更新都按 `learn-errors` 的规则执行。

## Inputs

- `student_id`、`subject: math`
- 快照：`outputs/students/<student_id>/math/{profile,memory,current_state,milestones}.json`，以及 `current_levels`、`error_history`、`priority_targets`
- 可选文件列表：学生消息里的路径，或 `data/.../raw/` 扫描范围
- 学生自述：先问“你觉得这道题错在哪？”

## Mode A：策略诊断

不读错题文件，根据本轮对话和已有证据执行 `math-core` 的 `references/strategy-diagnosis-rules.md`：逐项检查 What To Observe，处理引导理解信号，再形成 Conservative Conclusion。观察信号与阶段估计原则只在该 reference 维护。

## Mode B：错题分流

1. 先问学生自己的判断，再处理第一道新题；一次只分析一道。
2. 把文件读取、改名、`extracted/` 分析写入、`error_history` / `priority_targets` 更新整体交给 `learn-errors`；本 skill 不读 `data/.../raw/` 原图、不改名、不写 `error_history`。
3. 拿回 `learn-errors` 的结论后，按 `references/strategy-diagnosis-rules.md` 的 Error Interpretation 分类，核对学生自述，区分偶发失误与稳定模式；该路径相对于 `math-core` 的 base directory。
4. 按同一 reference 的 Conservative Conclusion 形成下一步：需要巩固时交给 `math-practice`；需要继续教学时把诊断交回 `math-session`。

## Output

内部回传诊断结论（不是另一个完整教学 segment）：

| 字段 | 契约 |
|---|---|
| `current_levels` | 算术/分数策略阶段的部分更新，只包含本次有证据的字段 |
| `strategy_summary` | 简短描述学生实际推理方式 |
| `strengths` / `difficulties` | 证据支持的优势与困难列表，包括引导理解情况 |
| `next_target` | 下一步具体小目标 |
| `diagnosis` | 有错误证据时填 `domain`、具体数学 `label`、`evidence` |
| `confidence` | 按 canonical reference 给出置信度 |

字段判定规则使用已加载的 `references/strategy-diagnosis-rules.md`。调用方将结论并入本轮唯一 `session_segment`：`next_target` 映射为 `next_step_candidate`，`confidence` 是诊断结论元信息；完整 segment schema 与 finalize 映射归 `learn-data`。`current_levels` 最终嵌入 `profile.current_levels`，`diagnosis` 最终进入 `error_history`；本 skill 不自行写入。

学生可见的只有一句核心问题和一句下一步。

## Constraints

- 不重复分析 `error_history` 里已记录的文件；重复上传合并为一条。
- 不把整道题原文写进档案，原文留在 `data/.../raw/` 与 `outputs/.../extracted/`。
- `data/.../raw/` 只读；任何情况下不改原件内容。
- 不展示内部阶段名、错误标签或 JSON 给学生。
