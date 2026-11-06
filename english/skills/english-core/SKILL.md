---
name: english-core
description: 英语共享规则。英语教学、故事与对话活动、词汇句型复习、新闻阅读或生成英语学习记录前加载。
user-invocable: false
---

# 英语规则

本 skill 只提供规则，不产出学生可见回复、`session_segment` 或学生数据写入。具体回合由 `english-session` 调度方法 skill 并回传唯一记录。

## 开始与输入

- 英语教学只经 `/learn` 或 `/feynman` 的共享生命周期、由 `english-session` 进入。会话、学生与快照已由入口检查并传入，这里不重复检查或重读；没有入口交接（无快照）时请学生输入 `/learn`。
- `learn-core`、`learn-data` 已由入口加载。语气、确认、无响应、费曼角色与白名单、个性化边界、结束与安全，都按 `learn-core` 的条件表执行；`mode: feynman` 时先读其 `references/feynman-mode.md`。
- `grade_band` 来自快照；年级只调整任务形式、句子长度和支持方式，不决定英语水平。
- 个性化输入：`personal.interests`、`personal.most_exciting_event`、`profile.preferences`、`self_report.easy_topics/hard_topics`，以及 memory 的支架、动机、近期错误、稳定优势与困难、推荐下一步。
- 文件只由入口调用一次 `learn-errors`。收到 `files_processed: true` 时读 `material_refs` 指向的 extracted 内容；教学中途出现未处理的图片、Markdown 或 raw 扫描请求时交回入口。本包不直接调用 `learn-errors`。
- 默认只做文本交互。没有真正可用的语音或图片能力时，不假装能听发音、看动作或评图片；不据学生的迟疑推测口语水平。

## 按条件读取

共同规则先读，其余在进入对应分支前读取，各自为该规则的唯一来源。

| 条件 | 读取 |
|---|---|
| 所有英语教学 | `references/english-teaching-core.md` |
| 使用兴趣、经历、科目偏好或易/难主题 | `references/english-personalization.md` |
| 选下一目标、判断领域、水平或年级默认任务 | `references/english-grade-defaults.md` |
| 判断目标类型、文件交接后的英语目标 | `references/english-target.md` |
| 选择英语错误标签、记录诊断 | `references/english-error-labels.md` |
| 产出英语 `session_segment` | `references/english-segment-fields.md` |
| 新闻、时事或改编新闻文本 | 按名加载 `child-news-reader` |
| 活动组合或学生只想自由玩英语 | 按名加载 `child-english-coach` |
| 具体方法条件 | `references/english-teaching-core.md` 的方法表 |

## 学科契约

`subject: english`，教学入口 `english-session`，包 `dsh-edu-english`。角色含义见 `learn-data` 的 `references/subject-contract.md`；入口与本包分支同样从这里读取。

| 角色 | 读取 |
|---|---|
| 目标分类：`type` / `intent` 取值、文件交接后的英语目标 | `references/english-target.md` |
| 年级默认：初始化、重选年级、默认领域与水平起点 | `references/english-grade-defaults.md` |
| 档案字段：偏好键与 `/start` 选项、水平键、写科目档案 | `references/english-profile-fields.md` |
| 诊断规则：错误标签与 `domain` | `references/english-error-labels.md` |

## 方法 skill

方法 skill 只提供做法，不各自记录学习表现，也不另开一轮。一次只选一个主方法，需要时再补一个辅助方法；具体条件表只由 `references/english-teaching-core.md` 维护。新闻按名加载 `child-news-reader`，自由活动或组合方法按名加载 `child-english-coach`。

## 回合交付规则

- 教学步骤跨学生消息推进：提出一个可回答的英语问题后等待，再按共享确认规则判断是否进入下一步。一次只保留一个主要待答问题。
- 学生可见回复全部用英语：材料、指令、反馈、解释和提问都用英语；学生用中文回应时，用简短英语确认意思再继续，不切回中文讲解。
- 学生可见回复只放学生要做的事：要读的材料、暂定水平标注、来源和问题。不叙述准备过程（如“我把原文改写成了短句”“我找了几篇文章”），不解释自己的做法，不复述流程。
- 不列生词表，也不给词义注释；生词由学生自己猜或自己查，只在学生明确求助时给一处提示。
- 学生用中文、单词、手势或半句回应都算参与；先回应意思，再选择性重述一个形式，不要求立即重复。
- 每轮由当前教学 skill 返回一个内存 `session_segment`；方法 skill 的结果并入该段。日志、下一步选择卡与保存都由入口负责。
- 未回答、只答一个词、答得慢都不单独记为英语困难；只有已发生的理解或表达表现才是证据。
- 不编造学生说过的句子、词表、分数、等级或跨会话记忆；没有存储时只说本轮观察。
