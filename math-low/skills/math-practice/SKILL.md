---
name: math-practice
description: 按错题类型、学生水平和偏好生成分层针对性练习（诊断、对比、变式、连接），每层 1-3 题，只给当前最需要的那一层。数学复习或纠错后需要巩固时加载。
user-invocable: false
---

# Math Practice

## Purpose

把错题分析和学生水平变成一组“刚好够用”的练习，而不是一次给一堆题。四层练习各有不同目的，任何时刻只给当下最需要的那一层。

## When To Use

- 学生刚复盘完错题，需要确认错误模式是否还在。
- `math-session` 判断某个技能“会判断但自己做还会错”，需要变式巩固。
- 学生说“再练几道”“我想多练一点这个”。
- 已掌握的主题需要和旧知识连起来。

## Session Gate

本 skill 只由 `/learn`、`/feynman` 或数学 skill 路由进入。没有 `session.json` 或 `student_id` 为空时，先引导学生运行 `/start`，不要开始练习。

## Load First

如果本会话尚未加载，先调用 `skill` 工具加载：

1. `learn-data`（读 `outputs/students/<student_id>/math/profile.json` 的 `profile.current_levels`、`profile.preferences`、`error_history`）
2. `math-core`，并读它的 `references/targeted-practice-rules.md`
3. 需要追问思路、做三步确认时，加载 `learn-core` 并读它的 `references/confirm-before-accept.md`
4. 练习来自某道错题时，加载 `learn-errors` 读取 `outputs/students/<student_id>/math/extracted/<error_file>.md` 的分析

`math-diagnose` 已经给出诊断结论时直接用，不要重复诊断。

## Inputs

- `profile.current_levels`：`arithmetic_strategy_stage`、`fraction_strategy_stage`、`overall`
- `profile.preferences`：`likes_visual`、`likes_story_context`、`likes_direct_calculation`
- `error_history` 最近记录与对应 `extracted/` 分析
- `learning_state.active_domain`、`priority_targets`
- `personal.interests`：用来选情境（披萨、足球、画画等）
- `self_report.easy_topics` / `hard_topics`：用来决定起点和支架
- 学生本轮的表现与自述

## Choose One Layer

按学生现在的状态选层，只选一层：

| 学生状态 | 给的层 |
|---|---|
| 不确定错误模式，可能只是偶然错 | Layer 1 诊断性练习 |
| 知道错了，但说不清为什么错 | Layer 2 对比性练习 |
| 能判断对错，自己做还会错 | Layer 3 变式练习 |
| 已经稳定，需要和已掌握的知识连起来 | Layer 4 连接练习 |

- Layer 1：同类型题、不同数字，1-2 题；看学生是否重复同一个错误。
- Layer 2：同时给出正确做法和错误做法，1 题；让学生判断哪个对并解释原因。
- Layer 3：换情境或换数字、知识点不变，2-3 题；稳定正确策略。
- Layer 4：把薄弱点和已掌握知识连起来，情境↔抽象互相转换，1-2 题。

同时满足“每层 1-3 题”的上限；学生做完一层再决定是否进入下一层。

## Match The Student

- 错误类型：计算错误、概念混淆、过程遗漏各用不同题型和支架，不要把三种错误塞进同一组题。
- 水平：`direct_modeling` 多给情境和可画图的题；`flexible_relational` 可以用更大的数字和关系比较。
- 偏好：`story_context` 用生活情境，`visual` 用图或线段，`direct_calculation` 用纯算式；情境优先从 `personal.interests` 里选一个具体细节。偏好只影响呈现方式，不降低目标。
- 年级：低年级（1-3）句子短、数字小、一次一题；高年级（4-6）可以多步、可以要求说明理由。

## Deliver

- 先一句话说明这次练什么、为什么练它，再给题。
- 一次只给当前层；题目编号清楚，学生能直接回答。
- 学生做完先追问思路，再按 `learn-core` 的 `references/confirm-before-accept.md` 确认，不直接报答案。
- 学生连续出错时退回更小数字或更低一层，不要加题量。
- 练习结束时给一个方法句，例如“先估结果大概多大，再动笔算”。

## Output

学生可见的只有练习说明和题目。

内部产出**一个** `session_segment`：

```json
{
  "focus": "异分母分数加法",
  "subject": "math",
  "mode": "learn",
  "submode": "practice",
  "source": "error_analysis",
  "strategy_summary": "诊断层两道题都重复了分母相加，对比层能自己说出错因",
  "strengths": ["能通过对比发现分母不能直接相加"],
  "difficulties": ["独立计算时仍会先加分母"],
  "next_step_candidate": "下一轮做变式层，换情境但保持异分母加法",
  "recommended_targets": ["异分母减法"],
  "feynman_handoff_recommended": false,
  "confirmed_skills": [],
  "skill_errors_observed": ["异分母加法"]
}
```

## Constraints

- 不一次性给所有层次。
- 每层不超过 3 题，宁少不多。
- 根据学生本轮表现调整，不照搬预设题单。
- 不把练习变成考试；不排名、不计时、不贴标签。
- 不在本 skill 里写 `profile.json`；只产出 segment，finalize 归 `/learn` 与 `learn-data`。
- 内部层次名、错误类型不展示给学生。

## Related

- `math-core`：`references/targeted-practice-rules.md`
- `math-diagnose`：先诊断再选层
- `math-session`：练习后回到教学主线
- `learn-errors`：读取 `extracted/` 错题分析
