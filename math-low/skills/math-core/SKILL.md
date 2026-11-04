---
name: math-core
description: 小学数学教学规则底座：教学动作、题目设计、分数教学、策略诊断与学生出题规则。数学学科 skill 在教学、诊断或练习前加载。
user-invocable: false
---

# Math Core

## Purpose

数学规则底座。它只定义数学教学动作与规则，不负责会话循环、目标路由或数据持久化。

本 skill 只被读取，不产生教学回合；需要开始教学时由 `/learn` 或 `/feynman` 路由到 `math-session`。没有 `session.json` 时先引导学生运行 `/start`。

## When To Use

- 开始一回合数学教学前（`math-session`）。
- 需要判断学生的算术/分数策略阶段，或处理数学错题前（`math-diagnose`）。
- 生成针对性练习前（`math-practice`）。
- 学生出题、AI 回答、学生判断前（`math-student-problem`）。

如果本会话已经加载过本 skill，直接复用已有的 `<skill_content>`，不要重复加载。

## Reference Loading

本 skill 的所有 `references/...` 路径都相对于加载结果给出的 base directory。

| 时机 | 读取 |
|---|---|
| 每次数学教学、出题、给变式 | `references/math-teaching-core.md` |
| 需要判断策略阶段、分析错题原因 | `references/strategy-diagnosis-rules.md` |
| 学生出题考 AI、AI 故意答错 | `references/math-student-problem-design.md` |
| 生成诊断/对比/变式/连接练习 | `references/targeted-practice-rules.md` |

按需读取，不要一次性把四个 reference 都读进来。每回合至少读 `references/math-teaching-core.md`。

## Non-Negotiable

1. 一次只抓一个小目标；先出题，等学生思考，再追问策略。
2. 分数从等分和数量关系开始，不从涂色命名或符号规则开始。
3. 诊断看推理、画图、学生语言和是否听懂引导，不只看答案和速度；不确定时取更保守的阶段。
4. 练习只给当下需要的那一层，不同时给四层。
5. 学生出题时，AI 按 `references/math-student-problem-design.md` 的比例回答：约 70% 答错、30% 答对，连续答对不超过 2 次，错误类型必须轮换；先算出正确答案再决定怎么错，回合结束前必须揭示正确答案。
6. 内部阶段标签、错误类型、`session_segment` 一律不展示给学生。

## Shared Rules

数学 skill 不重复定义共享规则，按需加载：

- 语气、三步确认、年级适配、引导无响应、结束信号、兴趣/偏好的使用边界：调用 `skill` 工具加载 `learn-core`。
- 学生数据读写、快照、finalize：加载 `learn-data`。
- 错题图片/Markdown 解析、`raw/` 只读、`extracted/` 写入、`error_history` 更新：加载 `learn-errors`。

## References

- `references/math-teaching-core.md`
- `references/math-student-problem-design.md`
- `references/strategy-diagnosis-rules.md`
- `references/targeted-practice-rules.md`

## Related Skills

- `math-session`：一回合教学与费曼模式。
- `math-diagnose`：策略诊断与错题分流。
- `math-practice`：分层针对性练习。
- `math-student-problem`：学生出题、AI 答、学生判断。
