---
name: math-diagnose
description: 数学策略诊断与错题分流：估计学生的算术/分数策略阶段，判断错误类型，给出保守的下一步目标；原始文件处理交给 learn-errors。教学前不确定学生卡在哪、或学生拿错题来时加载。
user-invocable: false
---

# Math Diagnose

## Purpose

回答两个问题：学生现在处在哪个策略阶段，这次错误说明什么。对应 Pi 的 `diagnose-strategy.md` 与 `analyze-error.md` 的数学部分。它产出内部诊断结论，不负责教学回合，也不直接持久化错题文件。

## When To Use

- 教学前不确定该从哪个目标开始，或连续两轮引导都卡住。
- 学生拿来错题图片、Markdown，或说“看看我的错题”。
- `math-practice` 生成练习前需要确认错误模式。
- 学生自述的错误原因和实际表现对不上。

## Load First

如果本会话尚未加载，先调用 `skill` 工具加载：

1. `learn-core`（需要时读它的 `references/pedagogy-core.md`、`references/guidance-non-response-handling.md`）
2. `math-core`，并读它的 `references/strategy-diagnosis-rules.md`
3. 有错题文件时加载 `learn-errors`
4. 诊断完成后要生成练习时，读 `math-core` 的 `references/targeted-practice-rules.md`

需要数据时加载 `learn-data`；路径、`raw/` 只读、`extracted/` 写入、`error_history` 更新都按 `learn-errors` 的规则执行。

## Inputs

- `student_id`、`subject: math`
- 快照：`outputs/students/<student_id>/math/{profile,memory,current_state,milestones}.json`，以及 `current_levels`、`error_history`、`priority_targets`
- 可选文件列表：学生消息里的路径，或 `raw/` 扫描范围
- 学生自述：先问“你觉得这道题错在哪？”

## Mode A：策略诊断

不读错题文件，只根据本轮对话和已有证据判断。观察：

- 学生是否直接摆出数量、画图、用手指；
- 是否从一个数接着数、倒着数；
- 是否用已知事实或拆数（凑十、凑整、分解）；
- 是否用关系重新表述问题（“这是几倍”“差多少”）；
- 分数推理停在等分、重复分割，还是已经到商的意义；
- 学生是否听懂了引导。

引导反复无响应本身就是诊断信号：目标概念可能高于当前阶段，记为困难，并把阶段估计下调。

## Mode B：错题分流

1. 先问学生自己的判断，再处理第一道新题；一次只分析一道。
2. 把文件读取、改名、`extracted/` 分析写入、`error_history` / `priority_targets` 更新整体交给 `learn-errors`；本 skill 不读 `raw/` 原图、不改名、不写 `error_history`。
3. 拿回 `learn-errors` 的结论后，判断这次错误属于哪一类：
   - 计算类：进位/借位遗漏、口诀错误、符号错误、单位错误；
   - 概念类：概念混淆、规则误用、分数意义错误；
   - 过程类：跳步、漏条件、审题偏差、表达不完整；
   - 估算类：结果数量级明显不合理但没察觉。
4. 学生自述与证据不一致时，以证据为准，用一句话说明差异，不要否定学生本人。
5. 判断这是偶发失误还是稳定模式：看 `error_history` 里同类错误是否重复、`confirmed_skills` 是否已包含该技能。

## Output

内部诊断结论，至少包含：

```json
{
  "strategy_estimate": {
    "arithmetic_strategy_stage": "counting_strategy",
    "fraction_strategy_stage": "equal_sharing_no_coordination"
  },
  "strategy_summary": "学生靠逐个摆小棒算加法，还没有用凑十",
  "strengths": ["能主动画图表示数量"],
  "difficulties": ["进位时容易漏加 1", "听不懂“先凑十”的提示"],
  "next_target": "20 以内进位加法，先用凑十的实物操作",
  "confidence": "low"
}
```

- `next_target` 取保守的一步：宁可小一点、具体一点，也不要直接跳到下一个单元。
- `confidence` 用 `low` / `medium` / `high`；证据不足时写 `low`，并按更低阶段处理。
- 这些标签只留在内部，学生可见的只有一句核心问题和一句下一步。

## Constraints

- 依据推理，不只看速度和对错。
- 不确定时选更保守的阶段。
- 画图、手势、学生自己的说法都算证据。
- 不重复分析 `error_history` 里已记录的文件；重复上传合并为一条。
- 不把整道题原文写进档案，原文留在 `raw/` 与 `extracted/`。
- `raw/` 只读；任何情况下不改原始错题内容。
- 不展示内部阶段名、错误标签或 JSON 给学生。

## Related

- `learn-errors`：文件解析、改名、`extracted/` 写入、`error_history` 更新。
- `math-core`：`references/strategy-diagnosis-rules.md`、`references/targeted-practice-rules.md`。
- `math-practice`：按本诊断生成练习。
- `math-session`：回到教学主线。
