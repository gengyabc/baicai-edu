# 数学年级默认

年级到年级段、段内具体程度、以及 `tone` 以 `learn-data` 的 `references/grade-band-defaults.md` 为准。本文是数学 `active_domain`、初始水平和领域序列的唯一来源。不要从共享 schema 的示例抄初始值。

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
  "arithmetic_strategy_stage": "direct_modeling",
  "fraction_strategy_stage": "equal_sharing_no_coordination"
}
```

## 低年级（1–3，`lower_primary`）

- `number_and_operations`：数感和基础运算
- `addition_subtraction_word_problems`：加减法应用情境
- `multiplication_division`：乘除法初步（分组与分享）
- `place_value_and_multidigit`：位值基础

顺序：

1. `direct_modeling` → 焦点 `addition_subtraction_word_problems`
2. `counting_strategy` → 过渡到 `derived_facts`
3. `derived_facts` 之后 → 用分组与分享引入 `multiplication_division`
4. 早期乘法稳定 → 巩固 `place_value_and_multidigit` 基础

## 高年级（4–6，`upper_primary`）

- `fractions`：分数理解（等分、商意义、比较、运算）
- `multiplication_division`：乘除法结构与关系推理
- `place_value_and_multidigit`：多位数运算与位值
- `patterns_and_data`：规律与数据

顺序：

1. 早期 `fraction_strategy_stage` → 从 `equal_sharing` 情境开始
2. 分数稳定 → 比较、等值、运算
3. 并行加强乘除结构与关系推理
4. 两者都熟练 → 延伸到规律、数据与早期代数结构

阶段取值见 `references/progression-map.md`。
