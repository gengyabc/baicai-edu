# 数学档案字段

共享科目档案的外壳见 `learn-data` 的 `references/profile-schema.md`。本文只定义数学增量。示例不是另一套初始值；初始领域与水平以 `references/math-grade-defaults.md` 为准。

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
- `fraction_strategy_stage`

阶段取值见 `references/progression-map.md`。没有新证据时不要改写。

## 科目档案示例

`upper_primary` 的形状。`active_domain` 与水平按年级默认填写，不要照抄下面的占位。

```json
{
  "tone": "concise_guiding",
  "updated_at": "2026-10-04T12:00:00Z",
  "profile": {
    "preferences": {
      "likes_visual": false,
      "likes_story_context": false,
      "likes_direct_calculation": false
    },
    "self_report": {
      "easy_topics": [],
      "hard_topics": []
    },
    "current_levels": {
      "overall": "L1",
      "arithmetic_strategy_stage": "direct_modeling",
      "fraction_strategy_stage": "equal_sharing_no_coordination"
    }
  },
  "learning_state": {
    "active_domain": "fractions",
    "mastered_topics": [],
    "developing_topics": [],
    "priority_targets": []
  },
  "error_history": [],
  "session_history": []
}
```

`self_report` 使用 `easy_topics` / `hard_topics`。

## 文件分析的 domain

`fractions`、`place_value_and_multidigit`、`multiplication_division`、`addition_subtraction`、`measurement_and_geometry`、`patterns_and_data`。

`error_type` 与 `diagnosis.label` 的分类见 `references/strategy-diagnosis-rules.md`。
