---
name: learn-general-core
description: 通用任务规则。教学解析选择通用路径，需初始化、分类目标、推荐或解释任务证据时加载；无适用专门包也继续实际教学。
user-invocable: false
---

# 通用任务规则

先加载 `learn-core`、`learn-data`，复用入口快照和 `references/teaching-resolver.md` 的解析结果；真实 subject 不变。具体教学只由 `learn-general-session` 产出；本技能不产回复、segment 或档案写入。

## 学科契约

本实现无固定学科目录，五角色由同一份参考按节提供；入口只读对应节。

| 角色 | 参考 |
|---|---|
| 目标分类 | `references/general-contract.md` 的目标分类 |
| 年级默认 | `references/general-contract.md` 的年级默认 |
| 档案字段 | `references/general-contract.md` 的档案字段 |
| 诊断规则 | `references/general-contract.md` 的诊断规则 |
| 学习推荐 | `references/general-contract.md` 的学习推荐 |

支持所有阶段及未知阶段；阶段只影响表达和支持，不自动生成掌握等级。所有证据带 `teaching.evidence_namespace: general_v1` 与 scope_id，隔离规则按解析参考执行。
