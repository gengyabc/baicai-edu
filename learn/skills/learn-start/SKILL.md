---
name: learn-start
description: 选择科目（数学、语文、英语等），切换学生或为新生建档，准备开始学习。
disable-model-invocation: true
---

# 开始学习

加载尚未加载的 `learn-core`、`learn-data`。依次选科目、识别学生、激活档案；教学留给 `/learn`。

## 1. 选科目

首次说明：

> 我是你的智能学习助手，可以使用费曼模式假装成你的同学来问你问题。

可选科目只在这张表维护；新增学科加一行，其余入口按 `learn-data` 的 `references/subject-contract.md` 由 subject id 找到学科包。

| 选项 | subject id | 学科包 |
|---|---|---|
| 数学 | `math` | `dsh-edu-math-low` |
| 语文 | `chinese` | `dsh-edu-chinese-reading` |
| 英语 | `english` | `dsh-edu-english` |

用 `ask_user_question` 问“今天想学什么？”，选项为表中各科目。用户已明确科目时直接采用对应 id；自定义输入按语义判断，不要求重选。一次只问科目；中途换科目回到此步确认。

科目确定后加载 `<subject>-core`；加载失败按学科契约的“未安装”处理，告知需要表中的学科包。

## 2. 清空旧学生选择

科目确定后，读取 `outputs/students/session.json`（可能不存在），按 `learn-data` 的 session.json 结构整文件写入过渡状态：`student_id: null`、已选 `subject`，两个时间均为当前 ISO 时间。写入成功后再识别学生；失败则说明未切换成功并停止。

## 3. 识别学生

按 `outputs/students/*/profile.json` 匹配共享档案，逐个读取 `student_id`、`name`、`grade`、`personal.interests`。

- 无学生：进入建档。
- 只有一人：用 `ask_user_question` 问“我找到的是<name>，<grade>年级，对吗？”，选项为「对，是我」「不是」；确认后激活。
- 多人：用 `ask_user_question` 列出学生，每个学生一个选项，标签为「<name>（<grade>年级）」，点选后激活。
- 姓名重合：用文字问一个澄清问题，分别保留档案。
- 姓名不存在：用 `ask_user_question` 问“这是新同学吗？”，选项为「是新同学」「不是」；确认后建档。

## 4. 新生建档

一次问一个问题，学生提交后再继续。必问：

1. 姓名或希望的称呼：用文字问，让学生直接回答。
2. 年级（1–6）：用 `ask_user_question`，选项为「一年级」到「六年级」。
3. 学习偏好：用 `ask_user_question`，选项取学科契约档案字段中的 `/learn-start` 选项。

可跳过的选问：兴趣、最近最开心的事、最近最难过的事。用 `ask_user_question` 只问问题、不给 `options`，卡片自带「跳过」；问难过经历时明确“不想说可以跳过”，学生跳过或不愿意说就停止追问。

收齐后用一句话复述姓名、年级和偏好，用 `ask_user_question` 请学生确认，选项为「都对」「要改一下」；学生选「要改一下」时再用文字问要改哪一项。确认后读取并执行 `learn-data` 的 `references/create-student.md`：

- 年级段与 `tone` 读取 `learn-data` 的 `references/grade-band-defaults.md`。
- `active_domain`、`current_levels` 与偏好键读取 `<subject>-core` 学科契约中的年级默认与档案字段。
- 偏好先全部设为 `false`，再按档案字段的选项与键对应，将选中项设为 `true`。
- 兴趣写入共享 `personal.interests` 数组。

建档并激活后告诉学生：“档案建好了。接下来输入 `/learn`，我们就可以开始。”

## 5. 激活已有学生

1. 检查当前科目的 `profile.json`、`memory.json`、`current_state.json`、`milestones.json`、`session_log.json`，缺失文件按 `learn-data` Read Snapshot 的“缺文件时”初始化。
2. 确保目录存在（已存在则保留）：`data/students/<id>/<subject>/raw`、`outputs/students/<id>/<subject>/extracted`、`outputs/students/<id>/<subject>/backups/raw`。
3. 按 `learn-data` 的 session.json 结构写入，将 `student_id` 设为选定学生的 id、`subject` 设为已选科目，更新时间。
4. 必需文件、目录和 session 均写入成功后回复：“好，今天我们用<name>的<科目>档案。输入 `/learn` 开始，或者直接告诉我今天想学什么。”失败时报告尚未完成的操作，保留档案供重试。

`outputs/students/` 不存在时由首次写入创建。
