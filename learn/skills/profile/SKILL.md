---
name: profile
description: 查看或修改学生档案：用学生能听懂的话总结姓名、年级、兴趣、当前科目、学习重点、最近 5 次会话和关键里程碑；需要时更新基础信息或科目偏好。
---

# Profile

## Purpose

让学生看到“你现在学到哪了”，而不是看一堆 JSON。

## Load First

如果本会话尚未加载，先调用 `skill` 工具加载：

1. `learn-core`
2. `learn-data`

## Dispatch

### 1. 找当前学生

读 `outputs/students/session.json`：

- 没有当前学生 → 告诉学生先 `/start`，停止。
- 有学生 → 读出 `student_id`、`subject`。

### 2. 读档案

读：

- `outputs/students/<id>/profile.json`（共享：姓名、年级、`personal.interests`、经历）
- `outputs/students/<id>/<subject>/profile.json`（科目：偏好、易/难、水平、`session_history`）
- `outputs/students/<id>/<subject>/milestones.json`
- `outputs/students/<id>/<subject>/current_state.json`

最近会话从**科目** `profile.json` 的 `session_history` 读（最新 5 条），不要从共享档案找。

### 3. 用学生的话总结

按下面顺序，简短说：

1. 姓名、年级；用一句“你喜欢<兴趣>”自然带过，不要像报表。
2. 当前科目。
3. 当前重点（`current_state.active_focus` 或 `session_history[0].focus`）。
4. 最近 5 次会话：每一条只说“学了什么 + 一个进步/困难”，不要逐字复述。
5. 关键里程碑：最多 3 条，挑最重要的。
6. 一句下一步建议。

语气自然，像老师/教练在跟学生回顾，不像系统报表。

### 4. 修改

学生要改基础信息时，先检查当前科目日志是否有 `finalize_plan`；有则按 `learn-data` 的 finalize 恢复保存，完成后才编辑，避免与半提交文件交错。

修改字段：

- 姓名、年级、`personal.interests`、最开心/最难过的事 → 改共享 `profile.json`。
- 学习偏好、当前水平、易/难、优先目标 → 改科目 `profile.json`。
- 改年级时同步 `grade_band`，并按 `learn-core/references/grade-band-defaults.md` 重新选择 `tone` 与 `learning_state.active_domain`；不确定是否要重置水平时，先问一句。
- 改兴趣时保留其他兴趣，不要整组覆盖；学生说“不喜欢了”再移除。
- 改完告诉学生“已经更新”，不要展示 JSON。

### 5. 不展示

- 不展示 `student_id`、JSON、内部错误标签、`confirmed_skills` 原始数组。
- 不把“最难过的事”主动复述；除非学生自己提起。
- 不评价学生“差”“不行”；用具体进步和下一步。

## Constraints

- 没有当前学生时，先 `/start`。
- 只显示当前科目；学生要另一个科目时，先切换会话或问清楚。
- 档案不存在时，不要凭空编造；引导 `/start`。
- 修改前先确认，尤其是年级、姓名这类基础信息。
- 学生删除兴趣或经历时一次确认即可，不要反复追问。

## Related

- `start`：建档或切换学生。
- `save`：保存当前会话。
- `learn-data`：数据协议。
- `prestart-settings-interpretation.md`：兴趣和偏好的使用边界。
