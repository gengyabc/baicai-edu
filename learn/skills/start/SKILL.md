---
name: start
description: 选择数学或语文，切换学生或为新生建档，准备开始学习。
disable-model-invocation: true
---

# 开始学习

加载尚未加载的 `learn-core`、`learn-data`。依次选科目、识别学生、激活档案；教学留给 `/learn`。

## 1. 选科目

首次说明：

> 我是陪你学习的 AI，不是真人。费曼模式里我会假装成同学来问你，那是在玩游戏。

问“今天想学数学还是语文？”，等待回答。用户已明确科目时直接采用：数学 → `math`，语文 → `chinese`。一次只问科目；中途换科目时回到此步确认。

## 2. 清空旧学生选择

读取 `outputs/students/session.json`（可能不存在），写入新骨架：

```json
{
  "student_id": null,
  "subject": "<math|chinese>",
  "last_active": "<now>",
  "session_started_at": "<now>"
}
```

## 3. 识别学生

用 `glob outputs/students/*/profile.json` 找共享档案，逐个读取 `student_id`、`name`、`grade`、`personal.interests`。

- 无学生：进入建档。
- 只有一人：问“我找到的是<name>，<grade>年级，对吗？”，确认后激活。
- 多人：列编号、姓名和年级，让学生选。
- 姓名重合：问一个澄清问题，分别保留档案。
- 姓名不存在：确认“这是新同学吗？”后建档。

## 4. 新生建档

一次问一个问题，等待回答再继续。必问：

1. 姓名或希望的称呼。
2. 年级（1–6）。
3. 学习偏好：数学问“画一画、讲一讲，还是直接算？”；语文问“读文章、讲想法，还是写一写？”。

可跳过的选问：兴趣、最近最开心的事、最近最难过的事。问难过经历时明确“不想说可以跳过”；学生不愿意说就停止追问。

收齐后用一句话复述姓名、年级和偏好，学生确认后按 `learn-data` 的 Create Student 建档：

- 年级段、`tone`、`learning_state.active_domain`、`current_levels` 读取 `learn-core` 的 `references/grade-band-defaults.md`。
- 偏好先全部设为 `false`，再将选中项设为 `true`：数学画一画 → `likes_visual`、讲一讲 → `likes_story_context`、直接算 → `likes_direct_calculation`；语文读文章 → `likes_model_text`、讲想法 → `likes_oral_explanation`、写一写 → `likes_revision`。
- 兴趣写入共享 `personal.interests` 数组。

建档并激活后告诉学生：“档案建好了。接下来输入 `/learn`，我们就可以开始。”

## 5. 激活已有学生

1. 检查当前科目的 `profile.json`、`memory.json`、`current_state.json`、`milestones.json`、`session_log.json`，缺失文件按 `learn-data` 的 `references/profile-schema.md` 初始化；年级默认值读取 `learn-core` 的 `references/grade-band-defaults.md`。
2. 用 `bash` 确保目录存在：`mkdir -p data/students/<id>/<subject>/raw outputs/students/<id>/<subject>/extracted outputs/students/<id>/<subject>/backups/raw`。
3. 按第 2 步的结构写 `session.json`，将 `student_id` 设为选定学生的 id。
4. 回复：“好，今天我们用<name>的<科目>档案。输入 `/learn` 开始，或者直接告诉我今天想学什么。”

`outputs/students/` 不存在时由首次写入创建。学生可见回复只说确认和结果，隐藏 JSON、内部字段和学生 id。
