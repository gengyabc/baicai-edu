---
name: math-student-problem
description: 带学生出题考 AI。学生想出题、学完知识点需迁移检验，或需要从“会做”走向“会判断”时使用。
user-invocable: false
---

# Math Student Problem

## 开始前

本 skill 只由 `/learn`、`/feynman` 或数学 skill 路由进入。没有 `session.json` 或 `student_id` 为空时，先引导 `/start`，不开始。

未加载时调用 `skill` 加载以下技能；reference 路径相对于对应 skill 返回的 base directory：

- `learn-core`：判断学生答案前读 `references/confirm-before-accept.md`；记录技能确认或错误前读 `references/feynman-skill-whitelist.md`，所有模式的确认门槛与白名单更新以它为准。需要 Guided Coach 时读 `references/personas.md`。
- `math-core`：出题和 AI 回答前读 `references/math-student-problem-design.md`；学段引导、题目要求、验算、答题比例、错误轮换与已确认技能的避错规则只在该 reference 维护。
- `learn-data`：复用快照；产出 segment 前读 Session Segments 与 `references/profile-schema.md` 的 Session Segment，完整 schema 与写入协议以此为准。

使用以下输入：

- 刚学主题：当前 `focus`；若 `current_state.pending_transfer_focus` 存在则优先。
- 年级：`profile.json` 的 `grade` / `grade_band`。
- `error_history` / `skill_errors`：选择 AI 错误类型。
- 数学 `memory.json` 的 `learning_memory.confirmed_skills`：限制 AI 可犯的错误。

## 1. 学生出题

按设计 reference 的出题引导让学生编题，等学生说完并检查完整性、同类性与数字范围；有问题时由学生修改。题目有效后才回答。

## 2. AI 回答

按设计 reference 先正确解题并验算，再选择并呈现本次回答。保留正确答案和具体错误点供收尾使用；此时让学生判断，不提前揭示对错。

## 3. 学生判断

问“我的答案对吗？你帮我检查一下”，按共享确认协议追问思路、换角度验证并确认。判断比编题本身更重要。

学生没发现 AI 错误时，温和提示重新计算或定位可疑步骤，不直接揭晓。同一道题连续两轮判断不出（1-3 年级三轮），换更小数字或更明显的错误，再让学生判断。

## 4. 揭示与收尾

无论判断结果如何，回合结束前明确说出正确答案、AI 的实际对错（答错则指出具体步骤），以及学生判断的对错和依据。

- 正确指出 AI 错了：表扬判断，让学生指出错误步骤。
- 正确确认 AI 对了：让学生用自己的话解释理由。
- 判断错或未发现错误：明确正确答案和错误点，再问“现在你能看出哪一步不一样吗？”

最后只提炼一个检查方法，问学生继续出题还是回到刚才的学习，不硬性结束会话。

## 回传

学生可见内容为上述引导、AI 答案、判断追问、真相揭示与一个检查方法。

按已加载的 `learn-data` schema 回传**一个** `session_segment`，补本分支字段：

- `subject: math`、`submode: student_problem`、`source: practice`，`mode` 沿用调用方。
- `strategy_summary` 记录出题、判断与纠正过程，区分首次判断与支架后的发现；`strengths` / `difficulties` 只写学生证据。
- `next_step_candidate` 写一个检查或迁移小目标；`recommended_targets` 与 `feynman_handoff_recommended` 按实际表现填写。
- `confirmed_skills` 严格按白名单确认门槛；`skill_errors_observed` 只记学生真实判断错误或未发现错误的技能，不记 AI 故意答错。无证据为空数组。

可选的数学表现、阶段与诊断字段沿用 `math-session` 的数学字段约定；调用方追加日志，finalize 归 `learn-data`。

只做这一轮出题、回答、判断与收尾；知识点教学交回 `math-session`，不在此重讲，也不写 `profile.json`。
