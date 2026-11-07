# 英语档案字段

共享科目档案的外壳见 `learn-data` 的 `references/profile-schema.md`。本文只定义英语增量。示例不是另一套初始值；初始领域与水平以 `references/english-grade-defaults.md` 为准。

## preferences

| 键 | `/learn-start` 选项 |
|---|---|
| `likes_stories` | 听故事 |
| `likes_games` | 玩英语游戏 |
| `likes_speaking` | 说一说 |
| `likes_reading` | 读一读 |

未选中的键保持 `false`。呈现方式见 `references/english-personalization.md`。

## current_levels

- `listening`
- `speaking`
- `reading`
- `writing`

取值与升级规则见 `references/english-grade-defaults.md`。没有新证据时不要改写。

## 科目档案示例

`upper_primary` 的形状。`active_domain` 与水平按年级默认填写，不要照抄下面的占位。

```json
{
  "tone": "concise_guiding",
  "updated_at": "2026-10-04T12:00:00Z",
  "profile": {
    "preferences": {
      "likes_stories": true,
      "likes_games": false,
      "likes_speaking": false,
      "likes_reading": false
    },
    "self_report": {
      "easy_topics": ["动物单词"],
      "hard_topics": ["完整句子"]
    },
    "current_levels": {
      "listening": "pre_a1",
      "speaking": "pre_a1",
      "reading": "pre_a1",
      "writing": "pre_a1"
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

## 诊断与文件字段

`diagnosis.domain` 只能是 `listening_speaking`、`reading`、`writing`、`language_use` 或 `news_reading`；`diagnosis.label` 使用 `references/english-error-labels.md` 的 `english:` 前缀。文件分析的 `domain` 从同一组取值中选择最接近的一项，不为一条材料硬造新领域。

没有可读文本的语音或图片材料，不写入听音或发音诊断；只记录 `learn-errors` 实际提取到的文字内容。
