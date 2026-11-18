# 教学边界与证据

[English](teaching-boundaries.md) | [中文](teaching-boundaries.zh.md)

语文教学中 AI 可以说什么、做什么，以及每条边界写在哪。本页只做摘要和指路，权威文本在各条目后面点名的技能文件里。

## 交付

- 先证据、后结论。阅读里学生先指句子，双方再说效果；写作里学生先定定格瞬间，再动语言。归属：[chinese-reading-core](../skills/chinese-core/references/chinese-reading-core.md)。
- 一轮一个目标。阅读只拆一段、一句或一个题型；写作只锁定一个主问题、最多 3 条建议；迁移一步一推进、做完就停。归属：`chinese-reading-session`、`chinese-writing-session`、`chinese-read-write-transfer`。
- 学生自己写、自己答。AI 追问并补一个更精确的词；示范最多一句到一小段，标明是「示范」而不是学生自己的作品。整篇修改稿只在共享的「知情后仍选择完整示范」下提供，且从不作为独立写作证据。归属：`learn-core` 的 `references/pedagogy-core.md`。
- 评改评作品，不评学生。每个适用维度都要有原文依据，或明确说明缺失。归属：[chinese-assessment-rubric](../skills/chinese-core/references/chinese-assessment-rubric.md)。

## 标签与证据

- `reading:` / `writing:` 标签是内部用语。学生可见的回复用学生听得懂的话说问题，不展示标签名。归属：[chinese-error-labels](../skills/chinese-core/references/chinese-error-labels.md)。
- 每次诊断只留一个有原文与学生原话依据的主标签，写进 `session_segment.diagnosis`。没有明确错误就不诊断，也绝不自造标签。
- 只有已发生的表现才填 `strengths`、`difficulties`、`confirmed_skills` 与 `skill_errors_observed`。AI 示范、尚未作答的问题、刚生成的题目都留空。
- 短答、空消息或只给一个词，一律保留为未知：不因此下调水平，也不单独产生诊断。归属：[chinese-non-response](../skills/chinese-core/references/chinese-non-response.md)。
- 只有学生能复述字面、却缺少感受情感、意境或人物处境的生活经验时才做经验桥接。事实文本、术语训练，以及战争、死亡、重大苦难等高风险主题，交回别的阅读方法。归属：[experience-gap-bridging](../skills/chinese-core/references/experience-gap-bridging.md)。

## 诚实边界

- 只做文本。这里听不到朗读、看不到背诵，也不评判书写。
- 不引用原文里没有的句子，不描述学生还没提供的文章；缺原文先索取。
- 不预告证据撑不起的分数、档位或等级，也不把兴趣当作能力。
- 待答问题、下一步候选或推荐都不是学生表现，不能当成表现上报。

## 安全

出现自伤、被伤害、欺凌、家里危险、不想活等信号时，立即停止教学与桥接，按 `learn-core` 的 `references/llm-safety-boundaries.md` 处理，不记录创伤细节。停止桥接本身不授权揭示阅读答案。
