# 语文年级默认

年级到年级段、段内具体程度、以及 `tone` 以 `learn-data` 的 `references/grade-band-defaults.md` 为准。本文是语文 `active_domain`、初始水平和默认题型的唯一来源。

## 初始化

| 年级段 | `learning_state.active_domain` |
|---|---|
| `lower_primary` | `writing` |
| `upper_primary` | `reading` |

`profile.preferences` 三个键初始全部为 `false`；`/start` 只把选中的一项设为 `true`。键见 `references/chinese-profile-fields.md`。

初始 `profile.current_levels` 四项都是 `L1`：

```json
{
  "reading_extraction": "L1",
  "reading_analysis": "L1",
  "writing_specificity": "L1",
  "writing_depth": "L1"
}
```

## 低年级题型（1–3，`lower_primary`）

阅读：

1. 内容概括（短文）
2. 词义理解（常用词）
3. 段落大意
4. 简单主旨

写作：记事（一件小事、一次经历）；写人（身边的人、印象深刻的人）；状物（喜欢的物品、有趣的发现）。

## 高年级题型（4–6，`upper_primary`）

阅读：

1. 内容概括（中长文）
2. 词句赏析（手法+效果）
3. 段落作用（结构+内容）
4. 主旨与作者意图
5. 开放探究
6. 句子填空

写作：记事加感悟；写人加特点；情景或想象作文；读后感或观后感。
