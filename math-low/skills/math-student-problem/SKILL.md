---
name: math-student-problem
description: 学生出题考 AI。学生主动要出数学题考 AI，或已选定用出题与判断来检验刚学知识的迁移时使用。
user-invocable: false
---

# Math Student Problem

## 开始前

未加载时调用 `skill` 加载 `math-core`、`learn-core`、`learn-data`，通过 `math-core` 的开始门槛后执行。读取它的 `references/math-teaching-core.md` 与 `references/math-student-problem-design.md`；出题引导、有效性检查、验算、回答比例、错误轮换、已确认技能避错与学段适配只在设计 reference 维护。reference 路径相对于对应 skill 的 base directory。

学生判断按 `learn-core` 的确认协议执行；先读其 `references/llm-safety-boundaries.md`，故意错误的揭示受回合结束前纠正的硬边界约束。`mode: feynman` 时读取其 `references/feynman-mode.md`，保持学生角色。这个分支的 AI 回答设计在两种模式下均按数学设计 reference 执行。

使用以下输入：

- 刚学主题：当前 `focus`；只有 `current_state.pending_transfer_phase: true` 时才优先对应 `pending_transfer_focus`，交接动作按共享生命周期执行。
- 共享档案的 `grade` / `grade_band`、`personal.interests`；数学档案的 `profile.preferences`，用于情境、呈现与支架。
- 数学 `error_history`、memory 的 `learning_memory.skill_errors`：选择 AI 错误类型。
- 数学 memory 的 `learning_memory.confirmed_skills`：限制 AI 可犯的错误。

## 1. 学生出题

按设计 reference 的出题引导让学生编题，等学生说完并检查；有问题时给轻量提示让学生修改。

完成条件：学生给出的题目完整能解、内容同类、数字合理且不超纲。条件未齐时继续等待修改；有效后才进入 AI 回答。

## 2. AI 回答

按设计 reference 在内部先正确解题并验算，再选择并呈现本次回答。将正确答案、AI 实际对错和具体错误点保留给揭示步骤；学生可见内容先让其自行判断。

完成条件：正确解与复核结果一致，呈现的回答符合避错与轮换规则，且有可检查的答案/步骤。让学生判断后进入第 4 步；等待判断也受其回合结束安全门槛约束。

## 3. 学生判断

问“我的答案对吗？你帮我检查一下”，按共享确认协议追问思路、换角度验证并确认。判断比编题本身更重要。

学生没发现 AI 错误时，温和提示重新计算或定位可疑步骤，给学生发现的机会。同一道题连续两轮判断不出（1-3 年级三轮），换更小数字或更明显的错误，再让学生判断。

完成条件：学生已给出判断及可核验依据；若按上述轮数简化后仍无法判断，可如实记录“支架后仍未发现”并进入揭示。正确或错误判断都要经过收尾。

## 4. 揭示与收尾

无论判断结果如何，回合结束前明确说出正确答案、AI 的实际对错（答错则指出具体步骤），以及学生已有判断的对错和依据。学生尚未判断时如实保留待判断状态；故意错答的纠正仍须在当前回合完成，保证学生带着正确结论结束。

- 正确指出 AI 错了：表扬判断，让学生指出错误步骤。
- 正确确认 AI 对了：让学生用自己的话解释理由。
- 判断错或未发现错误：明确正确答案和错误点，再问“现在你能看出哪一步不一样吗？”

最后只提炼一个检查方法，用 `ask_user_question` 问学生「继续出题」还是「回到刚才的学习」；跳过时回到刚才的学习，不硬性结束会话。

完成条件：正确答案、AI 实际对错、学生判断及其依据均已揭示，已给一个检查方法并处理继续/返回选择。继续时重新进入学生出题；返回时把教学交回 `math-session`。

## 回传与续接

跨消息等待出题或判断时，续接服从第 4 步的回合结束安全门槛。调用方按 `learn-data` 的共享日志 context/turn_state 协议保留当前步骤、题目、已呈现回答与纠正结论、待答问题及支架次数，恢复后从待答步骤继续。

读取 `math-core` 的 `references/math-segment-fields.md`，按其引用的共享 schema 回传本轮 segment；作为 `math-session` 子流程时回传证据供外层合并。补本分支字段：

- `subject: math`、`submode: student_problem`、`source: practice`，`mode` 沿用调用方。
- `strategy_summary` 记录出题、判断与纠正过程，区分首次判断与支架后的发现；`strengths` / `difficulties` 只写学生证据。
- `next_step_candidate` 写一个检查或迁移小目标；`recommended_targets` 与 `feynman_handoff_recommended` 按实际表现填写。
- `skill_errors_observed` 只记学生真实判断错误或未发现错误所涉及的技能，AI 故意答错与学生尚未作答都不是学生错误证据。

学生可见内容为引导、AI 答案、判断追问、真相揭示与一个检查方法；完整代解与档案写入仍受共享边界约束。
