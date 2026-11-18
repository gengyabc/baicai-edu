# 学生数据目录与英语字段

[English](data-directory.md) | [中文](data-directory.zh.md)

系统状态在 `outputs/students/`；用户投放原件在 `data/students/<id>/english/raw/`。两处都在当前工作区，不随包发布，也不进 Git。

```
data/students/<student_id>/english/raw/   # 用户原件，只读

outputs/students/
  session.json
  <student_id>/
    profile.json                          # 跨科目共享档案
    english/
      profile.json
      memory.json
      current_state.json
      milestones.json
      session_log.json                     # 每轮追加，finalize 清空
      extracted/
      backups/raw/
```

目录布局、字段路径与写入例外归 [learn-data](<../../learn/skills/learn-data/SKILL.md>)；本页只记英语特有的部分。`data/.../raw/` 只读：改名须先备份。保留与清理（含高风险彻底删除）归 `learn-clean`，不属于本包。

## 英语增量

- 学科固定为 `english`；`/learn-start` 初始化 `profile.current_levels` 的 `listening`、`speaking`、`reading`、`writing` 四项均为 `pre_a1`。`profile.preferences` 四个键初始 `false`，只有学生选中的那个变 `true`。归属：[english-profile-fields](../skills/english-core/references/english-profile-fields.md) 与 [english-grade-defaults](../skills/english-core/references/english-grade-defaults.md)。
- `learning_state.active_domain` 取 `listening_speaking`、`reading`、`writing`、`language_use`、`news_reading` 之一；`diagnosis.domain` 同此集合，`diagnosis.label` 带 `english:` 前缀。归属：[english-error-labels](../skills/english-core/references/english-error-labels.md)。
- 缺值保持保守，不做猜测性填写。年级只调整任务形式、句子长度与支持方式，不决定英语水平，所以没有任何字段按年级表填写。

## 日志与证据

每轮唯一的 `session_segment` 由入口追加到 `session_log.json`，会话结束按共享 finalize 规则写回，`finalize` 清空日志。一轮只产一个 segment，各方法的证据都并入其中。哪个字段承载哪类证据、可选字段何时省略，见 [english-segment-fields](../skills/english-core/references/english-segment-fields.md)。
