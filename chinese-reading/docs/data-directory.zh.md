# 学生数据目录与语文字段

[English](data-directory.md) | [中文](data-directory.zh.md)

系统状态在 `outputs/students/`；用户投放的原件在 `data/students/<id>/chinese/raw/`。两处都在当前工作区，不随包发布，也不进 Git。

```
data/students/<student_id>/chinese/raw/   # 用户原件，只读

outputs/students/
  session.json                            # 当前学生与科目
  <student_id>/
    profile.json                          # 跨科目共享档案
    chinese/
      profile.json
      memory.json
      current_state.json
      milestones.json
      session_log.json                    # 每轮追加，finalize 清空
      extracted/
      backups/raw/
```

目录布局、字段路径与写入例外归 [learn-data](<../../learn/skills/learn-data/SKILL.md>)；本页只记语文增量。`data/.../raw/` 只读：改名须先备份到 `outputs/.../backups/raw/`。保留与清理（含高风险删除）归 `learn-clean`。

## 语文增量

- 科目固定为 `chinese`。`/learn-start` 初始化 `profile.preferences` 的 `likes_model_text`、`likes_oral_explanation` 与 `likes_revision`，三项都为 `false`，只有学生选中的那项变 `true`。
- `profile.current_levels` 含 `reading_extraction`、`reading_analysis`、`writing_specificity`、`writing_depth`，初始都是 `L1`；没有新证据不改写。`self_report` 用 `easy_topics` / `hard_topics`，不要写成 `easy_areas` / `hard_areas`。
- `learning_state.active_domain` 的起点：`lower_primary` 为 `writing`，`upper_primary` 为 `reading`。归属：[chinese-grade-defaults](../skills/chinese-core/references/chinese-grade-defaults.md)。
- `diagnosis.domain` 只能是 `reading` 或 `writing`，`diagnosis.label` 带对应的 `reading:` / `writing:` 前缀。字段形状与记录链路见[语文档案字段](../skills/chinese-core/references/chinese-profile-fields.md)与[语文错误标签表](../skills/chinese-core/references/chinese-error-labels.md)。
- 迁移轮可加 `techniques_extracted` 与 `technique_application_quality`；质量为 `null`（尚未交稿）与「未使用」是两回事。不写 `submode: experience_bridging`——桥接并入阅读段。

## 日志与证据

入口把每轮唯一的 `session_segment` 追加到 `session_log.json`；会话结束时 finalize 写回 `profile.json`、`memory.json`、`current_state.json` 与 `milestones.json`，再清空日志。`session_segment.diagnosis` 会写成一条 `error_history` 诊断条目，含 `source: "diagnosis"`、`domain`、`label`、`evidence`、`next_step` 和 `diag_...` 形式的 id；历史保留最新 20 条，重复标签写在 `notes`。诊断标签不进 `skill_errors`。
