---
name: math-session
description: 数学教学主线。学习入口路由到数学、恢复未完成的数学焦点，或诊断/练习/学生出题后返回教学时使用；支持 learn 与 feynman 模式。
user-invocable: false
---

# Math Session

## 开始前

未加载时调用 `skill` 加载 `math-core`、`learn-core`、`learn-data`，通过 `math-core` 的开始门槛后教学；按其条件表读取共同教学规则与本轮分支 reference。reference 路径相对于对应 skill 返回的 base directory。

`mode: feynman` 时先读 `learn-core` 的 `references/feynman-mode.md`，完全按学生视角互动；其余模式按共享人格规则使用 Guided Coach 或档案指定人格。接受答案、无响应、个性化与技能确认各自按共享条件表读取。

## 输入

调用方（学习入口或数学子流程）交付：

- `student_id`、`subject: math`、学生本轮最新消息。
- `target_context`：`type`、`topic`、`source`、`files`、`intent`；当前 `focus`、`mode`（`learn` 或 `feynman`）。
- 共享与数学快照：`outputs/students/<student_id>/profile.json`、`outputs/students/<student_id>/math/{profile,memory,current_state,milestones}.json`。
- 个性化：共享档案的 `personal.interests`，数学档案的 `profile.preferences`、`profile.self_report.easy_topics/hard_topics`，以及 memory 的偏好支架、近期错误与推荐下一步。

复用有效快照，缺失与刷新按 `learn-data` 的 Read Snapshot。兴趣用于合适的数学情境或呈现细节，使用边界按共享个性化协议。

## 1. 确定本轮焦点与分支

1. 优先采用 `target_context.topic`；没有显式目标时采用共享生命周期恢复的 focus 与动作。只有 `pending_transfer_phase: true` / `pending_feynman_handoff: true` 时才消费对应 `pending_transfer_focus` / `pending_feynman_focus`。
2. 仍无目标时，依次看 `session_history[0].next_step`、`learning_state.priority_targets`、`learning_state.developing_topics`、memory 的 `learning_memory.recommended_next_moves`、`profile_memory.stable_strengths` / `stable_difficulties`、最近 milestones、年级默认领域。字段见 `learn-data` 的 `references/profile-schema.md`，年级默认见 `learn-core` 的 `references/grade-band-defaults.md`。
3. 错题文件先交给 `learn-errors`，复用已有分析或取得新分析后选值得练的错误类型。多个错误按最近发生 → 最贴合 `learning_state.active_domain` → 学生自述难点排序。起点/错因不明、连续两轮引导卡住或自述与表现不符时，交给 `math-diagnose` 获取证据。
4. 确定一个焦点后选 `submode`：新主题为 `learn`，巩固/近邻变式为 `practice`，纠错为 `review`；`mode: feynman` 时为 `feynman`。这些分流名留在内部。
5. 需要分层巩固时调用 `math-practice`；学生要出题考 AI 或已选定出题迁移时调用 `math-student-problem`。拿回证据并合入本轮记录；当前子流程仍在等学生回应时保持该步骤，返回主线后再接当前焦点。

完成条件：有且仅有一个本轮焦点、明确的模式和下一教学动作；子流程已给出本轮动作时沿用它。

## 2. 推进一个教学动作

按 `math-core` 的 `references/math-teaching-core.md` 执行教学动作与题目设计：

- 尚无学生作答时，提出一个具体问题并等待；已有题目与回答时，从该证据继续。
- 学生回应后按共享确认协议追问策略、换角度验证并确认；近邻变式或对比用于检验策略是否稳定。
- 卡住时按共享无响应协议给支架；数学上优先简化数字、回到情境与数量意义。流畅时先加关系挑战，再考虑加数字。

完成条件：已提出一个待答问题，或已处理当前回答并给出下一动作。需要学生新回应的步骤在此等待；只在有相应证据后确认理解或掌握。费曼分支全程维持共享学生角色。

## 3. 阶段收束与回传

当本轮数学关系已有证据时，用一句学生能复述的话总结，并给一个足够小的下一步；仍在等待作答时保持待答问题。结束或换主题信号交给共享生命周期。

读取 `math-core` 的 `references/math-segment-fields.md`，按其引用的共享 schema 回传本轮唯一 `session_segment`：`subject: math`、`mode` 沿用调用方，`submode` 用上述分流，`source` 对齐 `target_context.source`（文件来源按共享 target 协议归一化）。子流程证据合并到同一条记录，调用方负责日志与保存。

完成条件：segment 的必填字段齐全，策略、确认、困难和可选阶段/诊断都有实际证据支持；学生可见回复符合 `learn-core` 的教学、语气与安全边界。
