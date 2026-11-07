---
name: math-core
description: 数学共享规则。数学教学、策略诊断、分层练习或学生出题考 AI 前加载；生成数学学习记录时读取字段约定。
user-invocable: false
---

# 数学规则

共享数学规则，由 `math-session`、`math-diagnose`、`math-practice`、`math-student-problem` 按名加载；本 skill 不产出学生回复或 segment。

## 开始与输入

所有数学分支共用，子 skill 不再重复：

- 只经 `/learn` 或 `/learn-feynman` 的共享生命周期进入；会话、学生、快照与交接字段已由入口检查并传入（见 `learn-data` 的 `references/session-lifecycle.md` 第 3 步）。没有入口交接（无快照）时请学生输入 `/learn`。
- `learn-core`、`learn-data` 已由入口加载。语气、确认、无响应、费曼角色与白名单、个性化边界、结束与安全都按 `learn-core` 的条件表；`mode: feynman` 时先读其 `references/feynman-mode.md`，保持学生听众角色。
- 题目按 CGI，题面形式按 `references/problem-design.md`；兴趣只在 `references/math-personalization.md` 的搭桥条件成立时进入题目。
- 文件只由入口调用一次 `learn-errors`。收到 `files_processed: true` 时读 `material_refs` 指向的 extracted 分析；教学中途出现未处理的图片、Markdown 或 raw 扫描请求时交回入口。本包不直接调用 `learn-errors`。
- 子流程（诊断、练习、学生出题）回传证据，由 `math-session` 合并为本轮唯一 segment；日志、档案与 finalize 交共享流程。

## 按分支读取

共同规则先读，其余在进入对应分支前读取，各自为该规则的唯一来源。

| 条件 | 读取 |
|---|---|
| 所有数学教学，包括诊断、练习、学生出题 | `references/math-teaching-core.md` |
| 快照含兴趣、偏好、易/难主题或经历，或学生做不出当前题 | `references/math-personalization.md` |
| 选择下一目标、判断策略阶段 | `references/progression-map.md` |
| 选题、改题、变式；加减乘除、位值、多位数 | `references/problem-design.md` |
| 分数意义、等分、等值、比较、运算或小数 | `references/fraction-relations.md` |
| 准备提示、学生嫌麻烦、求新办法或提示无效 | `references/scaffold-calibration.md` |
| 消息带画板附件或修改记录附件（`我的画板.json` / `我的修改记录.json`），或学生问画板怎么用 | `references/structured-drawing.md` |
| 判断算术/分数策略阶段或分析错因 | `references/strategy-diagnosis-rules.md` |
| 学生出题考 AI，设计 AI 回答 | `references/math-student-problem-design.md` |
| 生成诊断/对比/变式/连接练习 | `references/targeted-practice-rules.md` |
| 产出数学 segment 或合并子流程证据 | `references/math-segment-fields.md` |

## 学科契约

`subject: math`，教学入口 `math-session`，包 `dsh-edu-math-low`。角色含义见 `learn-data` 的 `references/subject-contract.md`；入口与本包分支同样从这里读取。

| 角色 | 读取 |
|---|---|
| 目标分类：分类学习目标或文件交接后的数学目标 | `references/math-target.md` |
| 年级默认：初始化、重选年级或选择默认领域 | `references/math-grade-defaults.md` |
| 档案字段：偏好键与 `/learn-start` 选项、水平键、写科目档案 | `references/math-profile-fields.md` |
| 诊断规则：错因、`error_type` 与 `label` | `references/strategy-diagnosis-rules.md` |
