# Strategy Diagnosis Rules

## Purpose

数学策略阶段与错误解释的 canonical reference；`math-diagnose` 负责获取证据、错题分流和回传结论。

## What To Observe

| 观察信号 | 证据示例 |
|---|---|
| 直接表示数量 | 摆实物、画图、用手指 |
| 接着数或倒着数 | 从一个数继续计数，而非全部重数 |
| 已知事实或拆数 | 凑十、凑整、分解数量 |
| 用关系重述问题 | “这是几倍”“差多少” |
| 分数推理 | 等分、重复分割，或商的意义 |
| 是否听懂引导 | 能否沿提示行动，而非只说“知道了” |

推理比速度和单次对错重要；稳定理解比偶然答对重要。学生自己的语言、画图、手势和选择的表示方式都算证据。

## Guidance Understanding Check

引导反复无响应是诊断信号：先按 `learn-core` 的 `references/guidance-non-response-handling.md` 检查并提供支架；仍无响应时记为困难，考虑目标概念是否高于当前阶段，并保守下调阶段估计。

## Error Interpretation

| 类型 | 典型信号 |
|---|---|
| `calculation` | 进位/借位遗漏、口诀错误、符号错误、单位错误 |
| `concept` | 概念混淆、规则误用、分数意义错误 |
| `process` | 跳步、漏条件、审题偏差、表达不完整 |
| `estimation` | 结果数量级明显不合理却未察觉 |

- 先听学生自述；与实际表现不一致时以证据为准，用一句话说明差异，不否定学生本人。
- 区分偶发失误与稳定模式：结合 `error_history` 同类错误的重复情况及 `confirmed_skills`，不凭一次结果定性。
- `diagnosis.label` 细化到具体数学错误，如 `calculation:carry_omission`；`diagnosis.evidence` 写观察到的关键一步，不把整题原文放进档案。

## Conservative Conclusion

- 输出保守的阶段估计、简短 `strategy_summary`、`strengths` / `difficulties` 和一步可执行的 `next_target`；目标宁小勿跳单元。
- `current_levels` 仅提供有证据的 `arithmetic_strategy_stage` / `fraction_strategy_stage` 部分更新；字段与取值沿用 `learn-data` 的 `references/profile-schema.md`，阶段解释按 `learn-core` 的 `references/progression-map.md`。
- `confidence` 用 `low` / `medium` / `high`；证据不足取 `low` 并按更低阶段安排下一步。
- 内部阶段名、错误标签与 JSON 留在内部，学生只看到核心问题与下一步。
