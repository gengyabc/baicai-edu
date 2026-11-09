# 数学档案字段

共享科目档案外壳见 `learn-data` 的 `references/profile-schema.md`。本文只定义数学增量；`self_report`、`learning_state` 数组与 `error_history` / `session_history` 不在此重复。初始领域与水平以 `references/math-grade-defaults.md` 为准。

## preferences

| 键 | `/learn-start` 选项 |
|---|---|
| `likes_visual` | 画一画 |
| `likes_story_context` | 讲一讲 |
| `likes_direct_calculation` | 直接算 |

未选中的键保持 `false`。呈现方式见 `references/math-personalization.md`。

## current_levels

- `overall`
- `arithmetic_strategy_stage`
- `multidigit_strategy_stage`
- `fraction_strategy_stage`

阶段取值与旧值的读法见 `references/progression-map.md`。没有新证据时不要改写；旧档案缺 `multidigit_strategy_stage` 时按 `unknown` 读。

## 文件分析的 domain

`fractions`、`place_value_and_multidigit`、`multiplication_division`、`addition_subtraction`、`measurement_and_geometry`、`patterns_and_data`。

`error_type` 与 `diagnosis.label` 的分类见 `references/strategy-diagnosis-rules.md`。
