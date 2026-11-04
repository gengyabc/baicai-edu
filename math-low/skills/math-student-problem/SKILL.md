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

## Session Gate

本 skill 只由 `/learn`、`/feynman` 或数学 skill 路由进入。没有 `session.json` 或 `student_id` 为空时，先引导学生运行 `/start`，不要开始。

## Load First

如果本会话尚未加载，先调用 `skill` 工具加载：

1. `learn-core`：读 `references/confirm-before-accept.md` 与 `references/feynman-skill-whitelist.md`；后者是所有模式确认门槛与白名单更新的唯一来源。需要时读 `references/personas.md` 的 Guided Coach。
2. `math-core`；用它给出的 base directory 读 `references/math-student-problem-design.md`（不要写跨 skill 的相对路径）。
3. `learn-data`：复用已有快照，产出 segment 前读 Session Segments 与 `references/profile-schema.md` 的 Session Segment，完整 schema 与写入协议以此为准。

`outputs/students/<student_id>/math/memory.json` 的 `learning_memory.confirmed_skills` 决定 AI 可以犯哪些错：已确认的技能上 AI 不犯错。

## Inputs

- 刚学的数学主题（来自当前 `focus`；若 `current_state.pending_transfer_focus` 存在则优先）
- 学生年级段（`profile.json` 的 `grade` / `grade_band`）
- `error_history` 与 `skill_errors`：用来选择 AI 的错误类型
- `confirmed_skills`：这些技能上 AI 不犯错

## Step 1：请学生出题

按年级给轻量引导，不要替学生出题：

- 低年级（1-3）：“你能出一个和刚才类似的题吗？比如换一下数字试试”
- 高年级（4-6）：“出一个刚才那类题的变化版，可以改数字、改情境、或加一个条件”

等学生把题说完。检查：题目完整能解、和刚学内容同类、数字不超纲。有问题就温和指出让学生改：

- “这个题目好像少了一个条件，你能补上吗？”
- “数字有点大哦，换小一点好不好？”

## Step 2：AI 回答

先自己把这道题**正确**解出来，把正确答案写在内部草稿里；再用 `bash` 验算一次（`python3` / `node -e`，不可用时分步手算并复核）。然后按 `math-core/references/math-student-problem-design.md` 的策略给出答案：

- 约 70% 答错、30% 答对；连续答对不超过 2 次。
- 答错时优先用学生 `error_history` 里的错误类型；没有记录时从设计文件的类型里轮换，不连续用同一种。
- 错误要像认真做出来的：给出答案，偶尔附一个看起来合理但有漏洞的“思路”。
- 错误要落在学生当前水平的合理范围内，不能犯 1+1=3 这种不可能的错误。
- 错误答案必须与正确答案可区分，且你能说清错在哪一步。

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

同一道题上学生连续两轮判断不出（低年级 1-3 三轮），降低难度：换更小的数字，或把错误改得更明显。

## Step 4：收尾（必须揭示真相）

无论学生判断对错，都要在收尾时明确说出：

- 正确答案是什么。
- AI 这次是答对还是答错；如果答错，错在哪一步。
- 学生判断得对不对，具体对/错在哪。

然后：

- 学生正确指出 AI 错了：表扬判断，让学生说出 AI 错在哪一步。
- 学生正确确认 AI 对了：让学生用自己的话解释为什么对。
- 学生判断错、或没发现 AI 的错误：不要含糊过去；直接给出正确答案和错误点，再问“现在你能看出哪一步不一样吗？”
- 最后提炼一个方法，只给一个，例如：“检查答案时，可以先估一下大概结果，再算一遍。”
- 问学生还想再出一题，还是回到刚才的学习；不要硬性结束整个会话。

## Output

学生可见：出题引导、AI 答案、判断追问、Step 4 的正确答案与实际对错揭示、一个检查方法。

按已加载的 `learn-data` schema 回传**一个** `session_segment`，只补本分支字段：

- `subject: math`、`submode: student_problem`、`source: practice`，`mode` 沿用调用方。
- `strategy_summary` 记录学生出题、判断与纠正的过程，区分首次判断与支架后的发现；`strengths` / `difficulties` 只写学生证据。
- `next_step_candidate` 写一个检查或迁移小目标；`recommended_targets` 与 `feynman_handoff_recommended` 按实际表现填写。
- `confirmed_skills` 严格使用白名单 reference 的确认门槛；`skill_errors_observed` 只记录学生真实判断错误或未发现错误的技能，不记录 AI 故意答错。无证据为空数组。

可选的数学表现、阶段与诊断字段沿用 `math-session` 的数学字段约定；调用方追加日志，finalize 归 `learn-data`。

## Boundary

- 只做“学生出题 → AI 答 → 学生判断 → 收尾”这一轮。
- 数学教学本身归 `math-session`；本 skill 不重讲知识点。
- finalize 归 `/learn` 与 `learn-data`；本 skill 不写 `profile.json`。
- 不跳过判断阶段直接说“我答错了”。
- 不在收尾前结束回合；回合最后必须揭示正确答案和 AI 的实际对错。
- 不连续答对超过 2 次，不让 AI 每次都错同一种类型。

## Related

- `math-core`：`references/math-student-problem-design.md`
- `learn-core`：`references/confirm-before-accept.md`
- `math-session`、`math-practice`
