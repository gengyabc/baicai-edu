# 英语错误标签表

英语诊断统一使用这份标签表；只选一个最值得先改的主标签，次要问题可写进持久化条目的 `notes`。学生可见回复用学生能懂的话说问题，不展示标签名。

## 迁移规则

- 新写入的 `error_history` 必须使用 `english:` 前缀。
- `diagnosis.domain` 只能是 `listening_speaking`、`reading`、`writing`、`language_use` 或 `news_reading`。
- 每条诊断只保留一个有学生表现依据的主标签；没有足够证据时省略诊断，先补问。
- 语音、发音和口语流利度不在本表内：默认没有真实音频能力，不从文字回答反推这些表现。
- 字段表见 `references/english-profile-fields.md`。

## 存储方式

诊断标签与技能追踪分开：标签描述本次主问题，写入 `diagnosis`；`confirmed_skills` / `skill_errors_observed` 只接收共享白名单技能及其证据，finalize 的 `skill_errors` 不承载诊断标签。记录链路：

1. 学科 skill 在 `session_segment.diagnosis` 写 `{ "domain", "label", "evidence" }`。
2. `learn-data` finalize 把它写成一条 `error_history` 诊断条目：
   `{ "source": "diagnosis", "domain", "label", "evidence", "next_step", "error_id": "diag_..." }`。
3. `error_history` 保留最新 20 条；同一标签重复出现时保留最新证据，并在 `notes` 写“重复模式”。

## error_type

文件分析写 `error_type` 时用下表；它描述错误性质，`label` 描述具体主问题。会话内诊断可以只写 `label`，由 finalize 保留既有字段。

| `error_type` | 含义 | 常见对应标签 |
|---|---|---|
| `comprehension` | 理解偏离或漏信息 | `english:理解偏差`、`english:信息遗漏` |
| `expression` | 理解但表达受阻 | `english:表达受阻`、`english:答非所问` |
| `vocabulary` | 生词阻断 | `english:词义不明` |
| `pattern` | 句型不能独立使用 | `english:句型不熟` |
| `task` | 任务或问题理解错 | `english:任务误解` |
| `spelling` | 拼写影响可读性 | `english:拼写偏差` |
| `news_literacy` | 新闻事实与观点混淆 | `english:事实与观点混淆` |

## 标签

| 标签 | domain | 定义 |
|---|---|---|
| `english:任务误解` | `language_use` | 没听懂或读错问题、任务要求，答到别处 |
| `english:理解偏差` | `reading` | 对已给英语语句或短文的理解偏离原意 |
| `english:信息遗漏` | `reading` | 抓到一部分信息，漏掉影响理解的关键信息 |
| `english:词义不明` | `language_use` | 生词或短语阻断理解或表达 |
| `english:句型不熟` | `language_use` | 目标句型不能在语境中独立使用，只能依赖提示或背诵 |
| `english:表达受阻` | `speaking` | 理解意思，但说不出来，长期停在中文、单词或半句 |
| `english:答非所问` | `language_use` | 听懂了词但没接住对方的意思或问题重点 |
| `english:拼写偏差` | `writing` | 抄写或仿写中拼写错误影响可读性 |
| `english:事实与观点混淆` | `news_reading` | 读新闻时把观点、猜测或改编当成了已核实事实 |

## 怎么选（按顺序判断）

1. 先看是否理解任务：答到别处、做错方向 → `english:任务误解`；其他标签先不选。
2. 读材料时看理解：整体意思错了 → `english:理解偏差`；只漏关键信息 → `english:信息遗漏`。
3. 卡在词上 → `english:词义不明`；词都认识但句式用不出 → `english:句型不熟`。
4. 理解了却说不出来，先记为 `english:表达受阻`，不因此同时记词义和句型两个标签。
5. 写的句子拼写影响可读 → `english:拼写偏差`。
6. 新闻阅读里把观点当事实 → `english:事实与观点混淆`。

一个学生可能同时有几个问题；只选当前最值得先改的一个主标签，不同时堆标签。
