---
name: chinese-generate-tasks
description: Chinese task generation. Use when the student asks for reading questions from a passage, writing prompts (including continuation/rewrite), or focused item practice, with role-appropriate scoring criteria and answer-key delivery.
resources: chinese-task-generation.md chinese-reading-core.md chinese-writing-core.md chinese-assessment-rubric.md chinese-error-labels.md
---

# 语文出题

由 `chinese-session`、`/learn` 或 `/learn-feynman` 路由进入，只负责出题。学文章交阅读教学，批改已有答案/作文交阅读诊断或写作评改，阅读写法的输出练习交读写迁移。

## 开始与输入

加载 `chinese-core`，按其“开始门槛与输入”与共用读取规则执行。本 skill 另需：阅读原文（阅读出题必需）或写作主题，以及 `intent`（`generate_reading_tasks` / `generate_writing_task`）。

## 读取规则

在 `chinese-core` 共用读取之外，按需读取：

| 条件 | references 文件 |
|---|---|
| 每次出题前：题型、学段、答案、判分与自检标准 | `references/chinese-task-generation.md` |
| 阅读能力边界不明 | `references/chinese-reading-core.md` |
| 写作技巧与训练方向 | `references/chinese-writing-core.md` |
| 评价重点要衔接后续评改 | `references/chinese-assessment-rubric.md` |
| 对照最近错误标签选目标 | `references/chinese-error-labels.md` |

## 流程

1. 采用明确的 `intent`；没有时从需求判断，仍不清楚用 `ask_user_question` 问“要阅读题还是作文题？”，选项为「阅读题」「作文题」，得到回答后进入相应分支。
2. 按 `references/chinese-task-generation.md` 的“训练目标对齐”确定一个目标。阅读标出原文可用考点；写作优先从兴趣中找可写的具体情境，合适才用。
3. 阅读分支先齐备原文，再按该文件“阅读题出题”及学段规则生成；每题均能指回原文。写作分支按“写作题出题”提供单题，或用 `ask_user_question` 列 2-3 个题目供选；学生选择前，题目仍是候选。
4. 逐题完成该文件“检查清单”；未通过的当场改好后再输出。
5. 按出题规则区分学生练习与教师/出题者交付，交付相应题目、答案或评价要求；不在本 skill 接着讲解、批改或代写，学生作答后交回入口重新路由。

## 预期输出形态

- 阅读：材料概览 → 目标与年级难度 → 题目列表 → 按出题规则交付的答案/评价要求。内部参考答案、命题意图、分点判分及填空/开放题的合理边界仍须齐备。
- 写作：题目 → 适用年级 → 训练目标 → 审题提示 → 可写方向 → 评价重点。

## 会话段

按 `chinese-core` 的回合交付规则返回唯一内存 `session_segment`。

- `subject` 固定 `chinese`，`mode` 固定 `learn`，`submode` 固定 `generate_tasks`。
- `source` 按题目领域取 `reading` / `writing`。
- 出题不构成学生表现：`strengths`、`difficulties`、`confirmed_skills`、`skill_errors_observed` 留空，`feynman_handoff_recommended: false`，不生成 `diagnosis`；采用默认训练目标时在 `strategy_summary` 说明。

## 结束状态规则

一句话说明这组题练什么、怎么算过关，交回入口用 `ask_user_question` 提供「现在做」「换一组」「讨论怎么开始」；选择帮助仍按共享引导规则推进，不直接揭示答案。

This skill's base directory holds every file it names: a `references/<name>.md` path below is the installed `<name>.md` beside that base directory, because an installed skill keeps no `references/` folder for prose. Locale catalogs do keep theirs, at `references/locales/<locale>.json`.
