---
name: math-session
description: 小学数学一回合教学。/learn 或 /feynman 路由到数学、学生继续未结束的数学焦点，或诊断/练习/学生出题后回到教学主线时使用。
user-invocable: false
---

# Math Session

## Session Gate

本 skill 只由 `/learn`、`/feynman` 或数学内部 skill 路由进入。会话与缺失文件检查按 `learn-data`：没有 `outputs/students/session.json` 或 `student_id` 为空时，先引导 `/start`，不开始教学、不凭空建档。

## Load First

未加载时先调用 `skill` 加载 `learn-core`、`learn-data`、`math-core`；reference 路径均相对于对应 skill 返回的 base directory。

- 每次数学教学读 `math-core` 的 `references/math-teaching-core.md`；数学动作、题目设计、分数意义、验算按此执行。
- 共享教学流程、年级适配、语气与学生可见输出按 `learn-core` 及其条件加载表读取；接受答案前读 `references/confirm-before-accept.md`，无响应时读 `references/guidance-non-response-handling.md`，使用个性化时读 `references/prestart-settings-interpretation.md`。
- 记录技能确认或错误前，所有模式都读 `learn-core` 的 `references/feynman-skill-whitelist.md`：确认门槛与白名单更新只由该文件定义，不以口头解释替代展示证据。
- `mode: feynman` 时读 `learn-core` 的 `references/feynman-mode.md`，完全按学生视角互动；其余模式按共享人格规则使用 Guided Coach 或档案指定人格。
- 产出 segment 前读 `learn-data` 的 Session Segments 与 `references/profile-schema.md` 的 Session Segment；完整 schema、字段枚举与写回映射只在共享协议维护。

## Inputs

调用方（`/learn` 或 `/feynman`）交付：

- `student_id`、`subject: math`、学生本轮最新消息。
- `target_context`：`type`、`topic`、`source`、`files`、`intent`；当前 `focus`、`mode`（`learn` 或 `feynman`）。
- 共享与数学快照：`outputs/students/<student_id>/profile.json`、`outputs/students/<student_id>/math/{profile,memory,current_state,milestones}.json`。
- 个性化：`personal.interests`、`profile.preferences`、`profile.self_report.easy_topics/hard_topics`，以及 memory 的偏好支架、近期错误与推荐下一步。

复用已读快照；缺失、重读、初始化按 `learn-data` 的 Read Snapshot。兴趣必须用于合适的数学情境或呈现细节，使用边界按共享个性化协议，不覆盖当前消息或学习目标。

## Target Selection And Routing

1. 优先使用 `target_context.topic`。
2. 没有显式目标时先使用共享生命周期恢复的 focus 与动作；仅对应 pending 布尔值为 true 时接 `current_state.pending_transfer_focus` / `pending_feynman_focus`。没有恢复目标时依次看 `session_history[0].next_step`、`priority_targets`、`developing_topics`、`learning_memory.recommended_next_moves`、`profile_memory.stable_strengths` / `stable_difficulties`、最近 milestones、年级默认领域。字段见 `learn-data` 的 `references/profile-schema.md`，年级默认见 `learn-core` 的 `references/grade-band-defaults.md`。
3. 目标是错题文件时交给 `learn-errors` 解析与写回，再取值得练的错误类型；需判断阶段或错因时交给 `math-diagnose`。多个错误按最近发生 → 最贴合 `active_domain` → 学生自述难点排序。
4. 一次只选一个焦点。新主题起步用 `submode: learn`，巩固/近邻变式用 `practice`，纠错用 `review`，`mode: feynman` 时用 `feynman`；这些分流名只留在内部。
5. 需要分层巩固时交给 `math-practice`；学生要出题考 AI 时交给 `math-student-problem`，回传后接回当前焦点，合并本轮证据而非重复产出。

## One Turn

1. 按数学 teaching reference，用熟悉情境或具体问题开场，先出题、等学生思考，不先讲方法。
2. 学生回应后沿共享确认协议追问策略、验证并确认；需要时给一个近邻变式或对比，检验策略是否稳定。费曼模式始终保持共享协议规定的学生角色。
3. 卡住时按共享无响应协议提供支架；数学上优先简化数字、回到情境与数量意义。流畅时先加关系挑战，再考虑加数字。
4. 用一句阶段总结说清本轮抓住的数学关系，给一个足够小的下一步，不硬性结束整个会话。
5. 按以下数学字段约定回传本轮唯一 segment；学生可见回复沿用 `learn-core` 的教学边界、语气规则与安全边界，不展示内部标签或完整代解。

## Internal Session Segment — Math Fields

完整结构采用已加载的 `learn-data` schema；本 skill 只定义数学字段的增量语义：

| 字段 | 数学约定 |
|---|---|
| `subject` / `mode` / `submode` / `source` | `subject: math`，`mode` 沿用调用方；`submode` 按上述分流，`source` 对齐 `target_context.source` |
| `strategy_summary` | 学生实际使用的数学策略，如画图等分、接着数、凑十、通分；不只记录答案对错 |
| `strengths` / `difficulties` | 描述数量关系、表示、计算、验证与支架响应的证据 |
| `next_step_candidate` / `recommended_targets` | 保守、具体的下一步与近邻目标；`feynman_handoff_recommended` 表示是否适合转费曼讲解 |
| `confirmed_skills` / `skill_errors_observed` | 按白名单协议记录学生技能名，无证据为空数组；AI 故意犯错不算学生错误 |
| `overall_performance_code` / `overall_performance_text`（可选） | 数学表现：`needs_support` 需支架，`basic_independent` 基本独立但个别步骤需提示，`stable` 稳定运用策略，`flexible` 灵活迁移/比较关系；文字写清本轮证据，不由速度或单题答对定档 |
| `current_levels`（可选） | 有足够策略证据时给 `arithmetic_strategy_stage` / `fraction_strategy_stage` 部分更新；阶段解释归 `learn-core` 的 `references/progression-map.md`，诊断证据归 `math-core` 的 `references/strategy-diagnosis-rules.md` |
| `diagnosis`（可选） | 数学领域 `domain`、一个具体错误 `label` 与关键步骤 `evidence`；分类归同一诊断 reference，不复述整题 |

## Boundary

- 只做一回合，回传一个 `session_segment`，由调用方追加到 `session_segments` 与 `session_log.json`；不直接写学生档案。
- 结束信号、主题切换、finalize、幂等与持久化完全使用 `learn-core` / `learn-data`，不在数学层另建协议，不自行结束会话或重复 finalize。
