---
name: start
description: 开启学习过程：先选数学或语文，再识别已有学生或为新生逐轮建档，最后激活学生会话。建档完成后用 /learn 进入学习。
disable-model-invocation: true
---

# Start

## Purpose

这是学生进入系统的入口。先确定科目，再找到已有学生或创建新学生；不进入教学内容。

## When To Use

- 学生第一次使用，或说“开始学习”“我想学数学/语文”。
- `/learn` 或 `/feynman` 发现没有当前学生。
- 需要切换学生或切换科目。

## Load First

如果本会话尚未加载，先调用 `skill` 工具加载：

1. `learn-core`
2. `learn-data`

## Dispatch

### 1. 选科目与说明身份

先说明一次，不打断教学：

> 我是陪你学习的 AI，不是真人。费曼模式里我会假装成同学来问你，那是在玩游戏。

然后问：

> 今天想学哪一个？
> 1. 数学
> 2. 语文

如果 `/start` 后面的消息已经明确说了“数学”或“语文”，直接采用，不再重复问。等学生回答后再继续。映射：

- 数学 → `subject: "math"`
- 语文 → `subject: "chinese"`

不要同时问科目和其他信息。

### 2. 清空旧学生会话

读 `outputs/students/session.json`（可能不存在）。写新的会话骨架：

```json
{
  "student_id": null,
  "subject": "<math|chinese>",
  "last_active": "<now>",
  "session_started_at": "<now>"
}
```

这样可以避免把上一个学生带进新科目。

### 3. 识别学生

用 `glob outputs/students/*/profile.json` 找已有学生，再逐个 `read` 共享档案，得到 `student_id`、`name`、`grade`、`personal.interests`。

- **没有学生**：直接进入第 4 步“新学生建档”。
- **只有一个学生**：问一句确认：“我找到的是<name>，<grade>年级，对吗？”确认后进入第 5 步。
- **多个学生**：列出编号和姓名/年级，让学生选；不要自己猜。
- **学生报了名字但匹配到多个**：问一个澄清问题（“是<name A>还是<name B>？”），不要合并。
- **学生报的名字不存在**：确认“这是新同学吗？”再进入建档。

### 4. 新学生建档

一次只问一个问题，等回答后再问下一个。语气自然，不像填表。

必问：

1. 姓名（或希望怎么称呼）。
2. 年级（1-6）。
3. 学习偏好：数学用“你更喜欢画一画、讲一讲，还是直接算？”；语文用“你更喜欢读文章、讲想法，还是写一写？”。

选问（学生愿意说才问，可跳过）：

4. 平时喜欢做什么、玩什么（写成 `personal.interests` 数组，例如 `["阅读", "踢足球"]`）。
5. 最近最开心的一件事。
6. 最近最难过的一件事（明确说“不想说可以跳过”）。

收齐后：

1. 先用一句话复述：“我记一下：你是<name>，<grade>年级，喜欢<偏好>。这样对吗？”确认后再写文件。
2. 按 `learn-data` 的“Create Student”生成 `student_id`、共享档案、科目档案、memory、current_state、milestones、session_log。
3. 年级段：1-3 → `lower_primary`；4-6 → `upper_primary`。
4. `tone`、`learning_state.active_domain`、`current_levels` 的初始值按 `learn-core` 的 `references/grade-band-defaults.md` 选，不要照抄示例的 upper_primary 值。
5. 先把科目 `profile.preferences` 的所有布尔值写成 `false`，再把学生选中的那一项设为 `true`：
   - 数学：画一画 → `likes_visual`；讲一讲 → `likes_story_context`；直接算 → `likes_direct_calculation`。
   - 语文：读文章 → `likes_model_text`；讲想法 → `likes_oral_explanation`；写一写 → `likes_revision`。
6. 写 `outputs/students/session.json` 激活该学生与科目。
7. 告诉学生：“档案建好了。接下来输入 `/learn`，我们就可以开始。”

不要在学生确认前创建学生档案；不要在一条消息里连问六个问题；不要把“最难过的事”设为必答。

### 5. 激活已有学生

1. 检查该学生当前科目的 `profile.json` 是否存在；缺失则按 `learn-data` 的 `references/profile-schema.md` 按年级段初始化。
2. 检查 `memory.json`、`current_state.json`、`milestones.json`、`session_log.json`；缺失则按默认值创建。
3. 用 `bash` 确保目录存在：`mkdir -p outputs/students/<id>/<subject>/raw outputs/students/<id>/<subject>/extracted outputs/students/<id>/<subject>/backups/raw`。
4. 写 `outputs/students/session.json`：

```json
{
  "student_id": "<id>",
  "subject": "<math|chinese>",
  "last_active": "<now>",
  "session_started_at": "<now>"
}
```

5. 用一句话确认：“好，今天我们用<name>的<科目>档案。输入 `/learn` 开始，或者直接告诉我今天想学什么。”

## Constraints

- 科目选择永远放在最前面。
- 科目名统一：数学 → `math`，语文 → `chinese`。
- 先识别，再建档；不要为不存在的学生凭空建号。
- 学生创建必须显式、可确认；不要静默创建。
- 不展示 JSON、`student_id` 或内部字段。
- 没有 `outputs/students/` 目录时，写入第一个文件会自动创建；不要为此报错。
- 如果学生中途换科目，回到第 1 步重新确认，不要沿用旧科目。
- 学生不愿意说兴趣或经历时立即跳过；不要追问。

## Related

- `learn`：进入学习循环。
- `feynman`：进入费曼模式。
- `profile`：查看或修改档案。
