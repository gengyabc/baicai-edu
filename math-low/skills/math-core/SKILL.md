---
name: math-core
description: 小学数学共享规则。数学技能在教学、策略诊断、针对性练习或学生出题考 AI 前加载。
user-invocable: false
---

# Math Core

只提供数学规则，不产生教学回合，不负责目标路由、会话循环或持久化。教学由 `/learn` 或 `/feynman` 路由到 `math-session`；没有 `session.json` 时先引导 `/start`。

## 加载规则

本会话已加载的 skill 复用已有 `<skill_content>`。reference 路径相对于对应 skill 返回的 base directory。

| 条件 | 读取 |
|---|---|
| 每次数学回合；教学、出题或给变式前 | `references/math-teaching-core.md` |
| 判断算术/分数策略阶段或分析错因 | `references/strategy-diagnosis-rules.md` |
| 学生出题考 AI、设计 AI 的回答 | `references/math-student-problem-design.md` |
| 生成诊断/对比/变式/连接练习 | `references/targeted-practice-rules.md` |

每回合至少读教学规则，其余只在对应分支读取。各 reference 是对应数学规则的唯一来源。

## 共享协议

- 教学前加载 `learn-core`：语气、三步确认、年级适配、引导无响应、结束信号、个性化与内部标签/数据的展示边界均按它执行。
- 读写学生数据前加载 `learn-data`：快照、segment、日志与 finalize 按它执行。
- 有错题图片或 Markdown 时加载 `learn-errors`：原始文件读取与备份、改名、`extracted/` 写入、`error_history` 更新交给它。
