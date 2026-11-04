---
name: math-student-problem
description: 学生出题考 AI 的完整回合：学生编一道同类题，AI 按约七成答错、三成答对来回答，学生判断并解释，最后提炼一个检查方法。学完一个数学知识点、需要迁移检验时加载。
user-invocable: false
---

# Math Student Problem

## Purpose

学完一个数学知识点后，让学生出一道同类题，AI 回答（约 70% 答错、30% 答对），学生判断 AI 答得对不对。判断过程比出题本身更重要：它逼学生把刚学的关系用一遍，并练习检查。

## When To Use

- `/learn` 的数学回合结束后，学生选择“你出题考我”。
- 学生刚学会一个知识点，需要做迁移检验而不是再做一道同类题。
- `math-session` 判断某个技能需要从“会做”走到“会判断”。

## Load First

如果本会话尚未加载，先调用 `skill` 工具加载：

1. `learn-core`（读 `references/confirm-before-accept.md`；需要时读 `references/personas.md` 的 Guided Coach）
2. `math-core`，并读 `../math-core/references/math-student-problem-design.md`

`outputs/students/<student_id>/math/memory.json` 的 `learning_memory.confirmed_skills` 决定 AI 可以犯哪些错：已确认的技能上 AI 不犯错。

## Inputs

- 刚学的数学主题（来自当前 `focus`）
- 学生年级段（`profile.json` 的 `grade` / `grade_band`）
- `error_history` 与 `skill_errors`：用来选择 AI 的错误类型
- `confirmed_skills`：这些技能上 AI 不犯错

## Step 1：请学生出题

按年级给轻量引导，不要替学生出题：

- 低年级（1-2）：“你能出一个和刚才类似的题吗？比如换一下数字试试”
- 中年级（3-4）：“试试改一下刚才题目里的条件，出一道新题”
- 高年级（5-6）：“出一个刚才那类题的变化版，可以改数字、改情境、或加一个条件”

等学生把题说完。检查：题目完整能解、和刚学内容同类、数字不超纲。有问题就温和指出让学生改：

- “这个题目好像少了一个条件，你能补上吗？”
- “数字有点大哦，换小一点好不好？”

## Step 2：AI 回答

AI 亲自解这道题，然后按下面的比例给出答案：

- 约 70% 答错、30% 答对；连续答对不超过 2 次。
- 答错时优先用学生 `error_history` 里的错误类型；没有记录时从下面轮换，不连续用同一种：
  - 计算错误：进位遗漏、借位遗漏、符号搞反、乘法口诀记错
  - 概念混淆：把加法当减法、把乘法当加法、分数分子分母分别相加
  - 过程跳步：中间步骤遗漏、省略进位
  - 审题错误：漏读条件、理解反条件、多算少算一步
  - 单位遗漏：答案缺少单位、单位换算错误
  - 估算失误：结果数量级明显不合理但未察觉
- 错误要像认真做出来的：给出答案，偶尔附一个看起来合理但有漏洞的“思路”。
- 错误要落在学生当前水平的合理范围内，不能犯 1+1=3 这种不可能的错误。

示例：正确答案 3/4 + 1/4 = 1；AI 答 4/8，并说“分子加分子、分母加分母”。

## Step 3：学生判断

问学生：“我的答案对吗？你帮我检查一下”

按 `learn-core` 的 `references/confirm-before-accept.md` 走三步确认：

1. 学生说对/错 → 追问“你怎么看出来的？”
2. 学生解释后 → 换角度验证：“还有别的办法验证吗？”
3. 两步都过 → 确认结论，点明关键一步。

学生没发现 AI 的错误时，温和引导，不直接揭晓：

- “你确定吗？再算一遍试试？”
- “我好像在哪一步出了问题，你能帮我找出来吗？”

同一道题上学生连续两轮判断不出（低年级三轮），降低难度：换更小的数字，或把错误改得更明显。

## Step 4：收尾

- 学生正确指出 AI 错了：表扬判断，让学生说出 AI 错在哪一步。
- 学生正确确认 AI 对了：让学生用自己的话解释为什么对。
- 最后提炼一个方法，只给一个，例如：“检查答案时，可以先估一下大概结果，再算一遍。”
- 问学生还想再出一题，还是回到刚才的学习；不要硬性结束整个会话。

## Output

学生可见的只有出题引导、AI 的答案、判断追问和收尾那一句方法。

内部产出**一个** `session_segment`，`submode` 固定为 `student_problem`：

```json
{
  "focus": "异分母分数加法",
  "subject": "math",
  "mode": "learn",
  "submode": "student_problem",
  "source": "practice",
  "strategy_summary": "学生出题时改对了数字，但判断 AI 的 4/8 时先说对，后来自己发现分母没通",
  "strengths": ["能自己发现分母相加的错误"],
  "difficulties": ["第一眼容易只看分子"],
  "next_step_candidate": "再做一次判断，先估结果大概多大",
  "recommended_targets": ["异分母减法"],
  "teach_handoff_recommended": false,
  "confirmed_skills": [],
  "skill_errors_observed": ["异分母加法"]
}
```

`confirmed_skills` 只记学生讲清楚、判断正确的技能；`skill_errors_observed` 记学生这次没判断出来的技能。没有证据就给空数组。

## Boundary

- 只做“学生出题 → AI 答 → 学生判断 → 收尾”这一轮。
- 数学教学本身归 `math-session`；本 skill 不重讲知识点。
- finalize 归 `/learn` 与 `learn-data`；本 skill 不写 `profile.json`。
- 不跳过判断阶段直接说“我答错了”。
- 不连续答对超过 2 次，不让 AI 每次都错同一种类型。

## Related

- `math-core`：`references/math-student-problem-design.md`
- `learn-core`：`references/confirm-before-accept.md`
- `math-session`、`math-practice`
