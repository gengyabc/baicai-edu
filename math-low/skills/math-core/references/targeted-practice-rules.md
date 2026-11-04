# Targeted Practice Rules

## Purpose

数学分层练习的 canonical reference：选层、题量、适配与调整规则统一在此维护；`math-practice` 负责输入、执行和回传。

## Choose One Layer

按当前证据只选一层；完成后再判断是否换层，不把四层当成必做顺序。

| 学生状态 | 层次与目的 | 设计与题量 |
|---|---|---|
| 不确定错误模式，可能只是偶然错 | Layer 1 诊断：确认模式 | 同类型、不同数字，观察是否重复同一错误；1-2 题 |
| 知道错了，但说不清为什么错 | Layer 2 对比：凸显错因 | 展示正确与错误做法，让学生判断并解释；1 题 |
| 能判断对错，自己做还会错 | Layer 3 变式：稳定策略 | 换情境或数字，保持知识点不变；2-3 题 |
| 已经稳定，需要连接旧知识 | Layer 4 连接：建立联系 | 把薄弱点与已掌握知识连接，情境↔抽象转换；1-2 题 |

## Match The Student

错误类型 + 学生水平 + 学生偏好 → 当前层次、题型和支架：

- 错误类型：计算错误、概念混淆、过程遗漏分别匹配题型和支架，一组题只针对当前错误模式。
- 水平：`direct_modeling` 多用情境和可画图的题；`flexible_relational` 可加关系比较和更大的数字。
- 偏好：`story_context` 用生活情境，`visual` 用图或线段，`direct_calculation` 用纯算式。读取 `profile.preferences` 的对应偏好，情境优先取 `personal.interests` 的一个具体细节；偏好只改呈现，不降低目标。个性化边界按 `learn-core` 的 `references/prestart-settings-interpretation.md`。
- 年级：1-3 年级句子短、数字小、一次一题；4-6 年级可以多步并要求说明理由。通用适配按 `learn-core` 的 `references/grade-band-defaults.md`。

## Delivery And Adaptation

1. 先用一句话说明练什么、为什么练，再给编号清楚、能直接回答的题目；内部层名和错误类型不展示给学生。
2. 学生作答后追问思路，按 `learn-core` 的 `references/confirm-before-accept.md` 确认，不直接报答案。
3. 学生连续出错时退回更小数字或更低一层，不增加题量；根据本轮表现调整，不照搬预设题单。
4. 每层 1-3 题，遵守上表的具体题量；任何时刻只给当前需要的一层。
5. 结束时提炼一个可复述的方法句，如“先估结果大概多大，再动笔算”。练习不是考试：不排名、不计时、不贴标签。
