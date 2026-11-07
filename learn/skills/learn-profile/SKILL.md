---
name: learn-profile
description: 查看学习进展或修改学生档案。学生询问当前重点、最近进步、里程碑，或要求更改姓名、年级、兴趣和学习偏好时使用。
---

# 学生档案

加载尚未加载的 `learn-core`、`learn-data`。先读取 `outputs/students/session.json` 与共享档案，确定学生及当前科目；缺少当前学生或共享档案时，引导 `/learn-start` 并停止。随后只执行学生请求的查看或修改分支。

## 查看

1. 读取当前科目的 `profile.json`、`milestones.json`、`current_state.json`。
2. 用学生能听懂的话简短回顾：
   - 姓名、年级、兴趣和当前科目。
   - 当前重点：`current_state.active_focus`，其次 `session_history[0].focus`。
   - 科目档案 `session_history` 的最新 5 次会话，每次只说“学了什么 + 一个进步或困难”。
   - 最重要的里程碑，最多 3 条。
   - 一个下一步建议。

只显示当前科目；要查看其他科目时先问清楚或切换会话。不列原始技能数组；难过经历只在学生主动提起时回应。用具体进步和下一步描述表现。

## 修改

1. 确认要改的内容，尤其是姓名、年级。删除兴趣或经历一次确认即可。
2. 检查当前科目日志；若有 `finalize_plan`，先按 `learn-data` 的 finalize 协议恢复保存，成功后再编辑。
3. 按 `learn-data` 的 Write Protocol 写入：
   - 姓名、年级、`personal.interests`、开心/难过经历 → 共享 `profile.json`。
   - 学习偏好、当前水平、易/难主题、优先目标 → 科目 `profile.json`。
   - 改年级时同步 `grade_band`。`tone` 按 `learn-data` 的 `references/grade-band-defaults.md` 重选。`active_domain` 与 `current_levels` 读 `<subject>-core` 学科契约中的年级默认（`learn-data` 的 `references/subject-contract.md`）。是否重置水平不明确时先问。
   - 新增兴趣时保留其他兴趣；学生明确不再喜欢时才移除。
4. 所有请求字段写入成功且有效快照同步更新后，告诉学生“已经更新”。部分写入失败时说明哪些修改尚未保存，保留成功部分供重试。
