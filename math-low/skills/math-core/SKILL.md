---
name: math-core
description: 数学共享规则。数学教学、策略诊断、分层练习或学生出题考 AI 前加载；生成数学学习记录时读取字段约定。
user-invocable: false
---

# 数学规则

流程由 `math-session`、`math-diagnose`、`math-practice`、`math-student-problem` 按名调用；本 skill 维护共享数学规则。

## 开始门槛与共享协议

教学前加载 `learn-core`、`learn-data`，复用入口有效快照，按 Read Snapshot 检查会话与缺失文件。没有 `outputs/students/session.json` 或 `student_id` 为空时，引导 `/start` 并停止，建档交入口。

- `learn-core`：按条件表加载教学语气、确认、年级、无响应、角色、个性化、结束与可见边界。数学题目按 CGI，题面以生活故事为主；共享规则中的兴趣情境，以 `references/math-personalization.md` 的搭桥条件为准。
- `learn-data`：快照、segment、逐轮日志、恢复与 finalize。子流程回传证据，由调用方合并为本轮唯一 segment 并追加日志；档案写入与 finalize 交共享流程。
- 有错题图片、Markdown 或 raw 扫描请求时加载 `learn-errors`，由它解析、备份改名、写 `extracted/` 和 `error_history` / `priority_targets`。复用已处理文件，同一文件合并一条记录；原文留在原件与分析文件，档案只留关键证据。

## 按分支读取

复用已加载 skill 与有效 reference；路径相对于本 skill 的 base directory。共同规则先读，其余在进入对应分支前读取，各自为该规则的唯一来源。

| 条件 | 读取 |
|---|---|
| 所有数学教学，包括诊断、练习、学生出题 | `references/math-teaching-core.md` |
| 快照含兴趣、偏好、易/难主题或经历，或学生做不出当前题 | `references/math-personalization.md` |
| 分类学习目标或文件交接后的数学目标 | `references/math-target.md` |
| 初始化、重选年级或选择默认领域 | `references/math-grade-defaults.md` |
| 写数学偏好、水平或科目档案 | `references/math-profile-fields.md` |
| 选择下一目标、判断策略阶段 | `references/progression-map.md` |
| 选题、改题、变式；加减乘除、位值、多位数 | `references/problem-design.md` |
| 分数意义、等分、等值、比较、运算或小数 | `references/fraction-relations.md` |
| 准备提示、学生嫌麻烦、求新办法或提示无效 | `references/scaffold-calibration.md` |
| 消息带画板附件或修改记录附件（`我的画板.json` / `我的修改记录.json`），或学生问画板怎么用 | `references/structured-drawing.md` |
| 判断算术/分数策略阶段或分析错因 | `references/strategy-diagnosis-rules.md` |
| 学生出题考 AI，设计 AI 回答 | `references/math-student-problem-design.md` |
| 生成诊断/对比/变式/连接练习 | `references/targeted-practice-rules.md` |
| 产出数学 segment 或合并子流程证据 | `references/math-segment-fields.md` |
