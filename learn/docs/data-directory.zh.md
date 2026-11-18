# 学生数据目录与写入

[English](data-directory.md) | [中文](data-directory.zh.md)

系统状态在 `outputs/students/`；用户投放原件在 `data/students/<id>/<subject>/raw/`。两处都在当前工作区，均不随包发布，也不进 Git。

目录、字段和写入例外见 [learn-data](../skills/learn-data/SKILL.md)。教学逐轮写 `session_log.json`，长期学习证据在 finalize 提交；建档、显式档案编辑和文件分析按该协议的专属入口写入。

`data/.../raw/` 只读：改名须先备份。保留与清理的范围见[技能与规则所有权](skills.zh.md)，高风险删除见 [high-risk-deletion](../skills/learn-clean/references/high-risk-deletion.md)。

## 日志兼容

日志新增可选 `context`（目标、材料引用、模式与当前动作）及临时 `finalize_plan`（部分保存失败重放），旧日志仍可恢复，无需迁移学生档案。提交顺序和清理以 finalize reference 为准；同一学生/科目有待完成保存时先恢复，再编辑档案或处理新错题。
