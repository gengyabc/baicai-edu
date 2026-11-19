---
cited: chinese-core/references/chinese-error-labels.md
---

# 语文错误标签表

语文阅读和写作统一使用这份标签表。

**重要**：阅读和写作会共享部分标签名，但定义不同。存档时必须写清领域。

## 迁移规则

- 新写入的 `error_history` 必须使用带前缀的标签：`reading:` 或 `writing:`。
- 旧标签 `writing:意图误判` 归一化为 `writing:偏题`；读取旧记录时做映射。
- 每条诊断只保留一个有原文与学生表现依据的主标签；次要问题可在持久化条目的 `notes` 说明，无明确标签时省略诊断。
- 文件分析的 `domain` 只能是 `reading` 或 `writing`。字段表见 `references/chinese-profile-fields.md`。

## 存储方式

诊断标签与技能追踪分开：标签描述本次主问题，写入 `diagnosis`；`confirmed_skills` / `skill_errors_observed` 只接收共享白名单技能及其证据，finalize 的 `skill_errors` 不承载诊断标签。记录链路：

1. 学科 skill 在 `session_segment.diagnosis` 写 `{ "domain", "label", "evidence" }`。
2. `learn-data` finalize 把它写成一条 `error_history` 诊断条目：
   `{ "source": "diagnosis", "domain", "label", "evidence", "next_step", "error_id": "diag_..." }`。
3. `error_history` 保留最新 20 条；同一标签重复出现时保留最新证据，并在 `notes` 写“重复模式”。

---

## 阅读标签

诊断阅读题时，先对照题目、学生答案与原文定位具体失分点，再选下表中最值得先改的一项。定义用于归类，“常见问题”的纠偏方式见 `references/chinese-reading-core.md`。

| 标签 | 定义 |
|---|---|
| `reading:概括偏差` | 信息不全或语言冗长，未能浓缩要点 |
| `reading:证据不足` | 缺乏文本依据或依据不明确 |
| `reading:单层赏析` | 只答字面本义，忽略语境义和表达效果 |
| `reading:意图误判` | 作者意图判断偏离文本，如把批判读成赞美 |
| `reading:空泛模板` | 套公式而不结合本文内容 |
| `reading:结构失察` | 忽视线索、顺序或段落作用 |
| `reading:审题偏差` | 未准确理解题目要求 |
| `reading:细节功能忽视` | 忽略指代、标题层次、标点或关联词逻辑 |

---

## 写作标签

诊断作文问题时使用以下标签：

| 标签 | 定义 |
|---|---|
| `writing:偏题` | 偏离题目要求或主题 |
| `writing:概括偏差` | 全篇只有概述，没有具体事件或画面 |
| `writing:空泛模板` | 有内容，但用套话、公式或口号收尾 |
| `writing:细节缺失` | 有事件，但动词、感官或动作不具体 |
| `writing:单层赏析` | 只写表面外貌/事件，没有性格或深层意蕴 |
| `writing:升格不足` | 结构完整，但缺少角度变化或回扣 |

### 写作标签怎么选（按顺序判断）

1. 先看是否切题：不切题 → `writing:偏题`，其他标签先不选。
2. 有没有一个具体事件/画面？没有 → `writing:概括偏差`。
3. 有事件，但全是套话/口号？→ `writing:空泛模板`。
4. 有事件，但动作、感官不具体？→ `writing:细节缺失`。
5. 写人只写外貌、没有性格？→ `writing:单层赏析`。
6. 内容具体，但结尾没有回扣/角度？→ `writing:升格不足`。

一个学生可能同时有多个问题；只选最值得先改的一个主标签。

---

只使用本文件中的标签，不自造标签。学生可见回复用学生能懂的话说问题，不展示标签名。
