---
name: chinese-generate-tasks
description: 语文出题。学生要求根据文章生成阅读题、生成作文题（含续写/改写题）或专项题型练习时使用，附答案或评价标准。
user-invocable: false
---

# Chinese Generate Tasks（语文出题）

由 `chinese-session`、`/learn` 或 `/feynman` 路由进入，只负责出题。学文章交阅读教学，批改已有答案/作文交阅读诊断或写作评改，阅读写法的输出练习交读写迁移。

## Session Gate 与 Inputs

复用入口传入的会话与快照。没有 `session.json` 或 `student_id` 为空，先引导 `/start`。

接收阅读原文（阅读出题必需）或写作主题、年级与 `grade_band`、`intent`（`generate_reading_tasks` / `generate_writing_task`）、`learning_state.priority_targets`、`developing_topics`、最近 `error_history`。

个性化接收 `personal.interests`、`personal.most_exciting_event`、`profile.preferences`、`self_report.easy_topics/hard_topics`。

## Load Rules

已加载、已读的规则不重复加载读取。加载 `chinese-core` 后按其 base directory 读取：

| 条件 | references 文件 |
|---|---|
| 每次出题前：题型、学段、答案、判分与自检标准 | `references/chinese-task-generation.md` |
| 阅读能力边界不明 | `references/chinese-reading-core.md` |
| 写作技巧与训练方向 | `references/chinese-writing-core.md` |
| 评价重点要衔接后续评改 | `references/chinese-assessment-rubric.md` |
| 对照最近错误标签选目标 | `references/chinese-error-labels.md` |

使用兴趣、偏好、易/难时加载 `learn-core` 并读 `references/prestart-settings-interpretation.md`。

## Process

1. 采用明确的 `intent`；没有时从需求判断，仍不清楚用 `ask_user_question` 问“要阅读题还是作文题？”，选项为「阅读题」「作文题」，得到回答后进入相应分支。
2. 按 `references/chinese-task-generation.md` 的“训练目标对齐”确定一个目标。阅读标出原文可用考点；写作优先从兴趣中找可写的具体情境，合适才用。
3. 阅读分支先齐备原文，再按该文件“阅读题出题”及学段规则生成；每题均能指回原文。写作分支按“写作题出题”提供单题，或用 `ask_user_question` 列 2-3 个题目供选；学生选择前，题目仍是候选。
4. 逐题完成该文件“检查清单”；未通过的当场改好后再输出。
5. 交付题目及配套答案/评价标准，不在本 skill 接着讲解、批改或代写；学生作答后交回入口重新路由。

## Expected Output Shape

- 阅读：材料概览 → 目标与年级难度 → 题目列表 → 参考答案 → 命题意图 → 分点判分标准。填空及开放答案的合理边界按 reference 必填。
- 写作：题目 → 适用年级 → 训练目标 → 审题提示 → 可写方向 → 评价重点。

## Session Segment

在内存里产出一个 `session_segment`，交入口写入 `session_log.json`；本 skill 不直接写学生数据。

```json
{
  "focus": "《XX》双层赏析与段落作用练习",
  "subject": "chinese",
  "mode": "learn",
  "submode": "generate_tasks",
  "source": "reading",
  "strategy_summary": "按高年级难度出了 3 道题，覆盖概括、赏析、作用，并给出分点判分标准。",
  "strengths": [],
  "difficulties": [],
  "next_step_candidate": "让学生先做赏析题，再按判分标准自评",
  "recommended_targets": ["双层赏析"],
  "feynman_handoff_recommended": false,
  "confirmed_skills": [],
  "skill_errors_observed": []
}
```

- `subject` 固定 `chinese`，`mode` 固定 `learn`，`submode` 固定 `generate_tasks`。
- `source` 按题目领域取 `reading` / `writing`。
- 出题不构成学生表现，表现与技巧追踪字段通常为空，不编造；采用默认训练目标时在 `strategy_summary` 说明。

## End-State Rule

一句话说明这组题练什么、怎么算过关，交回入口用 `ask_user_question` 提供「现在做」「换一组」「先看一道示例」。通用记录遵循 `chinese-core` 的“回合交付规则”；需保存时由入口按 `learn-data` finalize。
