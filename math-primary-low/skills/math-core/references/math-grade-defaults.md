# 数学年级默认

年级到年级段、段内具体程度以 `learn-data` 的 `references/grade-band-defaults.md` 为准。本文是数学 `active_domain`、初始水平和领域范围的唯一来源。不要从共享 schema 的示例抄初始值。

## 初始化

| 年级段 | `learning_state.active_domain` |
|---|---|
| `lower_primary` | `addition_subtraction_word_problems` |
| `upper_primary` | `fractions` |

`profile.preferences` 三个键初始全部为 `false`；`/learn-start` 只把选中的一项设为 `true`。键见 `references/math-profile-fields.md`。

初始 `profile.current_levels`：

```json
{
  "overall": "L1",
  "arithmetic_strategy_stage": "unknown",
  "multidigit_strategy_stage": "unknown",
  "fraction_strategy_stage": "unknown"
}
```

策略阶段在看到学生解题之前保持 `unknown`。

## 领域范围

领域是并行的，按学生的显式目标和解题表现选择，策略阶段不作为进入某个领域的条件。学生用直接建模就能解乘除和分物故事。

低年级（1–3，`lower_primary`）：

- `addition_subtraction_word_problems`：加减法应用情境，默认起点
- `multiplication_division`：分组与分享情境，直接建模即可开始
- `fractions`：公平分物故事，从等分开始
- `place_value_and_multidigit`：从按十分组的故事和较大的数开始
- `number_and_operations`：数感和基础运算

高年级（4–6，`upper_primary`）：

- `fractions`：等分、商意义、比较、等值、运算
- `multiplication_division`：乘除法结构与关系推理
- `place_value_and_multidigit`：多位数运算与位值
- `patterns_and_data`：规律、数据与早期代数结构

阶段取值见 `references/progression-map.md`。
