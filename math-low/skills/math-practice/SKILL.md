---
name: math-practice
description: 数学针对性练习。错题复盘后需确认错误模式、会判断但独立计算仍出错、学生要求多练，或已掌握主题需连接旧知识时使用。
user-invocable: false
---

# Math Practice

## Session Gate

本 skill 只由 `/learn`、`/feynman` 或数学 skill 路由进入。没有 `session.json` 或 `student_id` 为空时，先引导学生运行 `/start`，不要开始练习。

## Load First

如果本会话尚未加载，先调用 `skill` 工具加载：

1. `learn-data`（读 `outputs/students/<student_id>/math/profile.json` 的 `profile.current_levels`、`profile.preferences`、`error_history`）
2. `math-core`，并读它的 `references/targeted-practice-rules.md`
3. `learn-core`：接受答案前读 `references/confirm-before-accept.md`；记录技能确认或错误前读 `references/feynman-skill-whitelist.md`，以它为确认门槛的唯一来源（所有模式适用）
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

## Steps

1. 复用已有诊断；错误模式仍不清楚且需要策略估计时交给 `math-diagnose`，拿回结论后继续。
2. 按 `math-core` 的 `references/targeted-practice-rules.md` 选层表与适配规则生成当前练习。选层、题量、年级/偏好适配的唯一来源是该 reference。
3. 按同一 reference 的 Delivery And Adaptation 执行出题、等待、确认和调整；完成当前层后根据新证据决定继续、换层或回到 `math-session`。
4. 用一个方法句收束本次练习，按下面契约回传本轮证据。

## Output

学生可见：练习说明、当前题目、确认追问与方法句，不展示内部层次。

内部回传**一个** `session_segment`；产出前读取 `learn-data` 的 Session Segments 和 `references/profile-schema.md` 的 Session Segment，完整 schema 与写入协议以此为准，只补本分支字段：

- `subject: math`、`submode: practice`；`mode` 沿用调用方，`source` 对齐实际来源（错题练习为 `error_analysis`）。
- `strategy_summary` 区分对比判断与独立计算表现，记录本层证据；`strengths` / `difficulties` 反映学生实际策略。
- `next_step_candidate` 写下一层或更小支架的具体建议，`recommended_targets` 保持近邻目标；`feynman_handoff_recommended` 按实际需要填写。
- `confirmed_skills` / `skill_errors_observed` 按已加载的白名单协议填技能名；无证据为空数组。

由调用方追加日志，数学表现、策略阶段与诊断的可选字段语义沿用 `math-session` 的数学字段约定。

## Constraints

- 不在本 skill 里写 `profile.json`；只产出 segment，finalize 归 `/learn` 与 `learn-data`。
- 内部层次名、错误类型不展示给学生。
