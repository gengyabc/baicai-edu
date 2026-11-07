# 语文档案字段

共享科目档案的外壳见 `learn-data` 的 `references/profile-schema.md`。本文只定义语文增量。示例不是另一套初始值；初始领域与水平以 `references/chinese-grade-defaults.md` 为准。

## preferences

| 键 | `/learn-start` 选项 |
|---|---|
| `likes_model_text` | 读文章 |
| `likes_oral_explanation` | 讲想法 |
| `likes_revision` | 写一写 |

未选中的键保持 `false`。呈现方式见 `references/chinese-personalization.md`。

## current_levels

- `reading_extraction`
- `reading_analysis`
- `writing_specificity`
- `writing_depth`

没有新证据时不要改写。

## 科目档案示例

`upper_primary` 的形状。`active_domain` 与水平按年级默认填写。

```json
{
  "updated_at": "2026-10-04T12:00:00Z",
  "profile": {
    "preferences": {
      "likes_model_text": false,
      "likes_oral_explanation": false,
      "likes_revision": false
    },
    "self_report": {
      "easy_topics": [],
      "hard_topics": []
    },
    "current_levels": {
      "reading_extraction": "L1",
      "reading_analysis": "L1",
      "writing_specificity": "L1",
      "writing_depth": "L1"
    }
  },
  "learning_state": {
    "active_domain": "reading",
    "mastered_topics": [],
    "developing_topics": [],
    "priority_targets": []
  },
  "error_history": [],
  "session_history": []
}
```

`self_report` 使用 `easy_topics` / `hard_topics`，不要改成 `easy_areas` / `hard_areas`。

## 诊断与迁移字段

`diagnosis.label` 使用 `references/chinese-error-labels.md` 的 `reading:` / `writing:` 前缀。文件分析的 `domain` 只能是 `reading` 或 `writing`。

读写迁移可在 segment 上写 `techniques_extracted` 与 `technique_application_quality`。不要新写 `submode: experience_bridging`；桥接并入阅读段。
