# 教学边界与交付

[English](teaching-boundaries.md) | [中文](teaching-boundaries.zh.md)

英语教学中 AI 可以说什么、做什么，以及每条规则写在哪。本页是摘要加指针：权威正文在各条后面标出的技能文件里，本页不是第二份副本。

## 交付

- 英语是交流工具，不是语法体系。不先讲语法，不连续默写或测验；可理解输入、短回合、选择性重述和支架退让优先。归属：[english-teaching-core](../skills/english-core/references/english-teaching-core.md)。
- 英语教学中的材料、指令、反馈、讲解与追问都用英语。学生用母语回应时，用简短英语确认意思再继续，不切换成母语讲解。
- 只有一个例外：`learn-recommend` 中引用学习记录的理由，以及推荐界的文案（目标描述、流程标签、选择提示，走 `ui.recommend.*`），可用学生 UI 语言，按 `profile.language` 解析。学生选定后英语教学即恢复，该例外不延伸到教学讲解。归属：`english-core` 的 Turn Delivery Rules。
- 不列单词表、不给词义注释。新词由学生猜或查，只有明确求助时给一处提示。
- 学生可见的回复只承载学生要做的事：材料、暂定水平标签、来源和问题。不叙述准备工作，不解释自己的方法。

## 参与与证据

- 接受中文、单个单词、半句和手势作为参与。不要求完整句子，不逐句纠错。
- 一次答对不升级水平。在当前语境下最多记为 `stable`；水平一次只升一档，且需要多于一个语境下的独立表现。归属：[english-segment-fields](../skills/english-core/references/english-segment-fields.md) 与 [english-grade-defaults](../skills/english-core/references/english-grade-defaults.md)。
- 不给没有证据支撑的分数、百分比或等级结论。材料上的暂定 CEFR 标签不是学生水平。
- 阅读与新闻轮次从材料本身开始；资源列表放在材料之后，即使学生问的是资源，也先给一段可读样例。
- 写作保留学生自己的意思：只改最影响可读性的一处，不代学生重写整段。

## 诚实限制

- 默认只做文本交互。没有真实音频或图片能力时，不假装能听发音、看动作或看图，也不从迟疑推断口语水平。
- 不编造学生说过的话、词表、分数、等级或跨会话记忆。没有存储时，只谈本轮的观察。
- 新闻只走 [child-news-reader](../skills/child-news-reader/SKILL.md) 的来源层级与年龄筛选。没有可靠来源就直说无法核实；绝不编造标题、日期、引语或链接。
- 新的 `session_id` 不继承上一次会话的故事、词表或未答问题。档案里的下一步只用于挑一个新的英语目标。

## 安全

学生出现危机信号时停止教学，按 `learn-core` 的 `references/llm-safety-boundaries.md` 处理；不把失败记成掌握，也不丢掉危机细节。
