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

布局、字段路径与写入例外归 [learn-data](<../../learn/skills/learn-data/SKILL.md>)；本页只记数学带新增的部分。`data/.../raw/` 只读：改名须先备份到 `outputs/.../backups/raw/`。保留与清理归 `learn-clean`，数学回合不碰这两处。

## 数学新增字段

- 科目固定为 `math`，带由本轮实际运行的技能名固定。字段定义由 `math-low-core` 拥有，共享外壳来自 `learn-data`。
- `profile.preferences` 里有 `likes_visual`、`likes_story_context`、`likes_direct_calculation`，除学生选中的那一项外都是 `false`。呈现规则见[数学个性化](../skills/math-low-core/references/math-personalization.md)。
- `current_levels` 有 `overall`，以及 `arithmetic_strategy_stage`、`multidigit_strategy_stage`、`fraction_strategy_stage` 三条 CGI 线。没有新证据不改写；缺失字段读作 `unknown`。所有者：[数学年级默认](../skills/math-low-core/references/math-grade-defaults.md)与[进展图](../skills/math-low-core/references/progression-map.md)。
- 数学技能复用有效快照，并读取共享的 `personal.interests` 与科目偏好；这两者都不由数学回合写。只有学生做不出当前题时才可以搭桥。

## 日志与证据

入口把本轮唯一的 `session_segment` 追加到 `session_log.json`；收尾时写回 `profile.json`、`memory.json`、`current_state.json` 与 `milestones.json`，然后清空日志。一个回合段按 [回合字段](../skills/math-low-core/references/math-segment-fields.md)定义的形状记录它真正观察到的证据——题目、策略、独立性与支持。没有汇总分数：一次答对不是一个等级，画板附件出现过几次根本不是证据。
