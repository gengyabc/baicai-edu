---
name: profile
description: 查看或修改学生档案：用学生能听懂的话总结姓名、年级、当前科目、学习重点、最近 5 次会话和关键里程碑；需要时更新基础信息或科目偏好。
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

- `outputs/students/<id>/profile.json`
- `outputs/students/<id>/<subject>/profile.json`
- `outputs/students/<id>/<subject>/milestones.json`

需要最近会话时，读 `profile.json` 的 `session_history`（最新 5 条）。

### 3. 用学生的话总结

按下面顺序，简短说：

1. 姓名、年级。
2. 当前科目。
3. 当前重点（`current_state.active_focus` 或 `session_history[0].focus`）。
4. 最近 5 次会话：每一条只说“学了什么 + 一个进步/困难”，不要逐字复述。
5. 关键里程碑：最多 3 条，挑最重要的。
6. 一句下一步建议。

语气自然，像老师/教练在跟学生回顾，不像系统报表。

### 4. 修改

学生要改基础信息时：

- 姓名、年级、爱好、最开心/最难过的事 → 改共享 `profile.json`。
- 学习偏好、当前水平、优先目标 → 改科目 `profile.json`。
- 改年级时同步 `grade_band` 与默认领域；不确定是否要重置水平时，先问一句。
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

## Related

- `start`：建档或切换学生。
- `save`：保存当前会话。
- `learn-data`：数据协议。
