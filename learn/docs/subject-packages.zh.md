# 依赖、学科包与接入

[English](subject-packages.md) | [中文](subject-packages.zh.md)

本包是学科包的共享底座：单独安装即可使用通用任务教学与五类支持；装上适用的学科包后才进入专门教学。

## 依赖关系

- `math-primary-low`、`math-primary-high`、`chinese-reading` 与 `english` 的 skill 会按名称加载 `learn-core`、`learn-data`、`learn-errors`。
- 安装适用学科包后可使用专门教学，不自动重解释旧通用证据或热替换未完成任务。
- 教育阶段、年级和情境可选；旧小学档案无需迁移，成人不强填小学年级。纯支持讨论可恢复；学生明确要求保存的中性计划与学科表现分开保存，仍走同一 finalize。
- `personal.interests` 是跨学科个性化字段，各学科 skill 都会读取；具体用法在学科包里。
- 共享包不反向安装所有学科。安装顺序与失败处理见[安装说明](<../../docs/installation.md>)。

## 现有学科包

`math-primary-low`、`math-primary-high`、`chinese-reading`、`english`。

同一学科可以按年级段拆成多个包（数学即 `math-primary-low` 与 `math-primary-high`），由[教学解析](../skills/learn-data/references/teaching-resolver.md)按明确年级选带（1–3 → low，4–6 → high，无明确年级回落 low），并用唯一技能名（`math-low-*` / `math-high-*`）载入和恢复，科目 id 不变。

## 接入新学科

1. 学科包提供 `<subject>-session` 与带「学科契约」节的 `<subject>-core`。
2. 在 `learn-start` 的科目表登记该学科。
3. 其他入口无需修改；多带学科按上节的唯一技能名规则命名。

新包声明的 `<subject>-session` / `<subject>-core` 由[教学契约](../skills/learn-data/references/subject-contract.md)定义接口，缺包时回落到同接口的通用路径。
