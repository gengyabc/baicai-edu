---
name: math-core
description: 数学共享规则。数学教学、策略诊断、分层练习或学生出题考 AI 前加载；生成数学学习记录时读取字段约定。
user-invocable: false
---

# Math Core

提供数学规则与字段约定；教学流程由 `math-session`、`math-diagnose`、`math-practice`、`math-student-problem` 执行，路由与持久化使用共享协议。

## 开始门槛与共享协议

数学技能由 `/learn`、`/feynman` 或数学内部技能按名称加载。开始教学前加载 `learn-core` 与 `learn-data`，复用入口传入的有效快照，并按 `learn-data` 的 Read Snapshot 检查会话和缺失文件。没有 `outputs/students/session.json` 或 `student_id` 为空时，引导 `/start`，停在此门槛，建档交给入口。

- `learn-core`：教学语气、确认答案、年级适配、无响应支架、人格/费曼角色、个性化、结束信号与学生可见边界，按其条件加载表执行。
- `learn-data`：快照、segment、逐轮日志、恢复与 finalize 使用其协议。数学技能只回传证据，由调用方合并成本轮唯一 segment 并追加日志；档案写入与 finalize 交给共享流程。
- 有错题图片、Markdown 或 raw 扫描请求时加载 `learn-errors`：文件解析、备份改名、`extracted/` 与 `error_history` / `priority_targets` 写回均交给它。已处理文件复用已有分析，同一文件合并为一条记录；原文保留在原件与分析文件，档案只留关键证据。

## 按分支读取

本会话已加载的 skill 复用已有 `<skill_content>`，已读 reference 复用有效内容；以下路径相对于本 skill 返回的 base directory。

| 条件 | 读取 |
|---|---|
| 所有数学教学分支，包括诊断、练习与学生出题 | `references/math-teaching-core.md` |
| 判断算术/分数策略阶段或分析错因 | `references/strategy-diagnosis-rules.md` |
| 学生出题考 AI，设计 AI 的回答 | `references/math-student-problem-design.md` |
| 生成诊断/对比/变式/连接练习 | `references/targeted-practice-rules.md` |
| 产出数学 segment 或合并内部子流程证据 | `references/math-segment-fields.md` |

共同教学规则先读，其余在对应分支进入前读取。各 reference 是对应数学规则的唯一来源。
