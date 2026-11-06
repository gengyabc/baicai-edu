---
name: math-session
description: 数学教学主线。学习入口路由到数学、恢复未完成的数学焦点，或诊断/练习/学生出题后返回教学时使用；支持 learn 与 feynman 模式。
user-invocable: false
---

# 数学教学

## 开始与输入

未加载时加载 `math-core`、`learn-core`、`learn-data`，通过数学开始门槛，按 `math-core` 条件表读 reference；路径相对于对应 skill 的 base directory。

调用方交付：
- `student_id`、`subject: math`、本轮消息。
- `target_context`（`type`、`topic`、`source`、`files`、`intent`）、`focus`、`mode`（`learn` / `feynman`）。
- 共享 `outputs/students/<student_id>/profile.json` 与数学 `math/{profile,memory,current_state,milestones}.json` 快照；缺失与刷新按 Read Snapshot。
- 个性化：共享 `personal.interests`，数学 `profile.preferences`、`profile.self_report.easy_topics/hard_topics`，memory 的偏好支架、近期错误和推荐下一步。用法读 `math-core` 的 `references/math-personalization.md`；共享边界仍按 `learn-core` 的 prestart 参考。选题与讲解按 CGI，题面是生活故事；兴趣只在学生做不出当前题时搭桥。

`mode: feynman` 先读 `learn-core` 的 `references/feynman-mode.md`，保持学生听众角色；其余使用 Guided Coach 或档案人格。确认、无响应与个性化按共享条件表。

## 1. 定焦点与分支

1. 优先 `target_context.topic`，否则用共享生命周期恢复的 focus 与动作。仅对应 `pending_transfer_phase` / `pending_feynman_handoff` 为 true 时消费 `pending_transfer_focus` / `pending_feynman_focus`。
2. 仍无目标时依次看 `session_history[0].next_step`、`learning_state.priority_targets`、`learning_state.developing_topics`、memory 的 `learning_memory.recommended_next_moves`、`profile_memory.stable_strengths` / `stable_difficulties`、最近 milestones、年级默认领域。字段见 `learn-data` 的 `references/profile-schema.md`；年级段与语气见 `learn-data` 的 `references/grade-band-defaults.md`；默认领域见 `math-core` 的 `references/math-grade-defaults.md`。
3. 错题文件先交 `learn-errors` 取得或复用分析，按最近发生 → 当前领域 → 学生自述难点选焦点。宽泛目标先选一题；起点确需补证、连续两轮引导卡住或自述与表现不符时交 `math-diagnose`，不默认先测所有新主题。
4. 定 `submode`：新主题 `learn`，巩固/近邻变式 `practice`，纠错 `review`；费曼为 `feynman`，名称仅内部使用。
5. 分层巩固调用 `math-practice`；学生要出题考 AI 或已选出题迁移时调用 `math-student-problem`。合并返回证据；子流程待答时停留，返回后接原焦点。

完成条件：一个焦点、明确模式与下一动作；子流程已有动作则沿用。

## 2. 推进一个动作

按 `math-core` 的 `references/math-teaching-core.md` 执行。当前这条未保存日志里，无回答时把原题再给一次，停在问句并等待；有回答则承接本场已有表示，只补证据缺口。新的 `session_id` 不沿用上一场的题面、未答问题或画板修改；档案里的下一步和近期错误只用来选定数量关系，然后出一道新的生活故事。选题先辨数量角色与未知量；准备介入时读支架校准。当前关系已能在一个生活故事里解释时，下一题换场景并保持近邻数字；本场未完成的题不换场景。不固定加题。

完成条件：提出一个待答问题，或处理当前回答后给下一动作；依赖新回应的步骤等待，只凭证据确认理解或掌握。

## 3. 收束与回传

已有关系证据时用一句学生能复述的话总结，给一个小下一步；待答时保留当前问题。结束或换主题交共享生命周期。

读 `math-core` 的 `references/math-segment-fields.md`，回传唯一 `session_segment`：`subject: math`，`mode` 沿用调用方，`submode` 如上，`source` 对齐 `target_context.source`（文件来源按共享 target 协议归一化）。子流程证据合并同一记录，调用方负责日志与保存。

完成条件：必填字段齐全，策略、确认、困难及可选阶段/诊断有证据；学生回复符合 `learn-core` 可见边界。
