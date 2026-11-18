# 学生数据目录与数学字段

[English](data-directory.md) | [中文](data-directory.zh.md)

系统状态在 `outputs/students/`，用户投放的原件在 `data/students/<student_id>/math/raw/`。两处都在当前工作区，不随包发布，也不进 Git。

```
data/students/<student_id>/math/raw/     # 用户原件，只读

outputs/students/
  session.json                          # 当前学生与科目
  <student_id>/
    profile.json                        # 跨科目共享
    math/
      profile.json
      memory.json
      current_state.json
      milestones.json
      session_log.json                  # 每轮追加，收尾时清空
      backups/raw/
```

布局、字段路径与写入例外归 [learn-data](<../../learn/skills/learn-data/SKILL.md>)；本页只记高年级带新增的部分。`data/.../raw/` 只读：改名须先备份到 `outputs/.../backups/raw/`。保留与清理归 `learn-clean`。

## 数学新增字段

- 科目固定为 `math`；带由本轮实际运行的技能名固定，所以从低年级带带过来的档案保留它自己的偏好键，本包不拥有的键不改写。
- `profile.preferences` 里有 `likes_step_by_step`、`likes_examples`、`likes_real_world`，除学生选中的那一项外都是 `false`。呈现规则见[数学个性化](../skills/math-high-core/references/math-personalization.md)。
- `current_levels` 有 `overall`（`L1`–`L3`），以及 `arithmetic_strategy_stage`、`multidigit_strategy_stage`、`fraction_strategy_stage`、`symbolic_strategy_stage`。没有当前证据不改写；缺失的阶段读作 `unknown`，其余字段不动。所有者：[自适应阈值](../skills/math-high-core/references/adaptive-thresholds.md)与[进展图](../skills/math-high-core/references/progression-map.md)。
- 已确认技能记录最贴合它的那个窄域，绝不发明更宽的类别。所有者：[数学档案字段](../skills/math-high-core/references/math-profile-fields.md)与[策略诊断规则](../skills/math-high-core/references/strategy-diagnosis-rules.md)。

## 日志与证据

入口把本轮唯一的 `session_segment` 追加到 `session_log.json`；收尾时写回 `profile.json`、`memory.json`、`current_state.json` 与 `milestones.json`，然后清空日志。一个回合段按 [回合字段](../skills/math-high-core/references/math-segment-fields.md)定义的形状记录它真正观察到的证据——题目、方法、独立性与支持。没有汇总分数；记为计划的先修子任务是任务，不是掌握的声明。
