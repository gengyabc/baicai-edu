---
name: start
description: 选择数学或语文，切换学生或为新生建档，准备开始学习。
disable-model-invocation: true
---

# 开始学习

加载尚未加载的 `learn-core`、`learn-data`。依次选科目、识别学生、激活档案；教学留给 `/learn`。

## 1. 选科目

首次说明：

> 我是你的智能学习助手，可以使用费曼模式假装成你的同学来问你问题。

用 `ask_user_question` 问“今天想学数学还是语文？”，选项为「数学」「语文」。用户已明确科目时直接采用：数学 → `math`，语文 → `chinese`；自定义输入按语义判断，不要求重选。一次只问科目；中途换科目回到此步确认。学生可见回复隐藏工具名、JSON 和内部字段。

## 2. 清空旧学生选择

科目确定后，读取 `outputs/students/session.json`（可能不存在），按 `learn-data` 的 session.json 结构整文件写入过渡状态：`student_id: null`、已选 `subject`，两个时间均为当前 ISO 时间。写入成功后再识别学生；失败则说明未切换成功并停止。

## 3. 识别学生

按 `outputs/students/*/profile.json` 匹配共享档案，逐个读取 `student_id`、`name`、`grade`、`personal.interests`。查找用当前环境可用的文件工具完成。

- 无学生：进入建档。
- 只有一人：用 `ask_user_question` 问“我找到的是<name>，<grade>年级，对吗？”，选项为「对，是我」「不是」；确认后激活。
- 多人：用 `ask_user_question` 列出学生，每个学生一个选项，标签为「<name>（<grade>年级）」，点选后激活。
- 姓名重合：用文字问一个澄清问题，分别保留档案。
- 姓名不存在：用 `ask_user_question` 问“这是新同学吗？”，选项为「是新同学」「不是」；确认后建档。

## 4. 新生建档

一次问一个问题，学生提交后再继续。必问：

1. 姓名或希望的称呼：用文字问，让学生直接回答。
2. 年级（1–6）：用 `ask_user_question`，选项为「一年级」到「六年级」。
3. 学习偏好：用 `ask_user_question`；数学选项为「画一画」「讲一讲」「直接算」，语文选项为「读文章」「讲想法」「写一写」。

可跳过的选问：兴趣、最近最开心的事、最近最难过的事。用 `ask_user_question` 只问问题、不给 `options`，卡片自带「跳过」；问难过经历时明确“不想说可以跳过”，学生跳过或不愿意说就停止追问。

收齐后用一句话复述姓名、年级和偏好，用 `ask_user_question` 请学生确认，选项为「都对」「要改一下」；学生选「要改一下」时再用文字问要改哪一项。确认后读取并执行 `learn-data` 的 `references/create-student.md`：

- 年级段与 `tone` 读取 `learn-data` 的 `references/grade-band-defaults.md`。
- 数学的 `active_domain`、`current_levels` 与偏好键读取 `math-core` 的 `references/math-grade-defaults.md`、`references/math-profile-fields.md`。语文读取 `chinese-core` 的 `references/chinese-grade-defaults.md`、`references/chinese-profile-fields.md`。
- 偏好先全部设为 `false`，再将选中项设为 `true`：数学画一画 → `likes_visual`、讲一讲 → `likes_story_context`、直接算 → `likes_direct_calculation`；语文读文章 → `likes_model_text`、讲想法 → `likes_oral_explanation`、写一写 → `likes_revision`。
- 兴趣写入共享 `personal.interests` 数组。

建档并激活后告诉学生：“档案建好了。接下来输入 `/learn`，我们就可以开始。”

## 5. 激活已有学生

1. 检查当前科目的 `profile.json`、`memory.json`、`current_state.json`、`milestones.json`、`session_log.json`，缺失文件按 `learn-data` 的 `references/profile-schema.md` 初始化。年级段与 `tone` 读取 `learn-data` 的 `references/grade-band-defaults.md`；`active_domain`、`current_levels` 与偏好键按上面的学科文件读取。
2. 确保目录存在（已存在则保留）：`data/students/<id>/<subject>/raw`、`outputs/students/<id>/<subject>/extracted`、`outputs/students/<id>/<subject>/backups/raw`。按 `learn-data` 的 Data Root，用当前环境可用的方式创建；需要终端时按本机操作系统和 shell 选择命令。
3. 按 `learn-data` 的 session.json 结构写入，将 `student_id` 设为选定学生的 id、`subject` 设为已选科目，更新时间。
4. 必需文件、目录和 session 均写入成功后回复：“好，今天我们用<name>的<科目>档案。输入 `/learn` 开始，或者直接告诉我今天想学什么。”失败时报告尚未完成的操作，保留档案供重试。

`outputs/students/` 不存在时由首次写入创建。学生可见回复只说确认和结果，隐藏 JSON、内部字段和学生 id。
