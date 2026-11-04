---
name: chinese-session
description: 语文路由器：读取 target_context、mode 与 focus，只判断本轮该进入阅读、写作、读写迁移还是出题，然后把控制权交给对应子 skill，不复述任何学科教学动作。
user-invocable: false
---

# Chinese Session（语文路由器）

## Purpose

语文侧唯一的调度点。它不教学、不诊断、不出题，只决定本轮交给哪个子 skill，并把上下文原样传下去。

## When To Use

- 学习入口判定 `subject = chinese` 之后。
- 学生从阅读切到写作、或从写作切到阅读时，需要重新分派。
- 费曼模式需要按领域只路由一次时。

## Inputs

学习入口会传入：

```json
{
  "student_id": "stu_li_ming_a7k2",
  "subject": "chinese",
  "target_context": { "type": "reading_material", "intent": "learn_reading" },
  "mode": "learn",
  "focus": "《秋天的雨》第二段赏析",
  "personal": { "interests": ["阅读", "踢足球"] },
  "preferences": { "likes_model_text": true }
}
```

- `target_context.type`：`reading_material` | `writing_prompt` | `writing_draft` | `task_generation` | `assessment` | `error_files` | `profile`。
- `target_context.intent`：`learn_reading` | `start_writing` | `revise_writing` | `assess_reading` | `assess_writing` | `generate_reading_tasks` | `generate_writing_task` | `transfer_read_write`。
- `mode`：`learn` | `feynman`。
- `focus`：本轮主题字符串；为空时由子 skill 从档案或材料中确定。

如果入口没有给出 `target_context`，先按 `learn` 入口的分类结果补齐；仍然无法判断时只问一个短问题，不要靠猜开始教学。

## Load First

如果本会话尚未加载，按顺序调用 `skill` 工具加载：

1. `learn-core`
2. `learn-data`
3. `chinese-core`

路由器只需要读规则来判断方向，不必读 `chinese-core` 的全部 reference；具体规则由被路由到的子 skill 读取。

## Preconditions

1. 读 `outputs/students/session.json`，确认 `student_id` 存在、`subject = chinese`。
2. 没有 `session.json` 或 `student_id` 为空时，先引导学生运行 `/start`，不要路由。
3. 按 `learn-data` 的 Read Snapshot 读取快照；缺失的科目文件按模板初始化。
4. 本轮只路由一次；不要在一次回复里加载多个子 skill 的教学内容。

## Routing Table

| 条件 | 路由到 | 传入 mode |
|---|---|---|
| `mode = feynman`，目标是阅读类 | `chinese-reading-session` | `feynman` |
| `mode = feynman`，目标是写作类 | `chinese-writing-session` | `feynman` |
| `mode = feynman`，目标是 `profile` 或中文默认 | 先选定一个领域，再路由到对应子 skill | `feynman` |
| `type = task_generation` | `chinese-generate-tasks` | `learn` |
| `type = writing_prompt` | `chinese-writing-session` | `start` |
| `type = writing_draft` | `chinese-writing-session` | `revise` |
| `type = assessment` 且 `intent = assess_writing` | `chinese-writing-session` | `assess` |
| `type = assessment` 且 `intent = assess_reading` | `chinese-reading-session` | `diagnose` |
| `type = reading_material` | `chinese-reading-session` | `learn` |
| `intent = transfer_read_write`，或学生明确说“照着这篇的写法写一篇”“练一下读写迁移” | `chinese-read-write-transfer` | `learn` |
| `type = error_files` | 先加载 `learn-errors` 解析并读内容，再按内容路由一次 | 见下 |
| `type = profile`，选定阅读 | `chinese-reading-session` | `learn` |
| `type = profile`，选定写作 | `chinese-writing-session` | `start` |

## Routing Rules

1. 费曼模式只在开头路由一次；随后不再因为学生的新句子反复切换领域。
2. `error_files` 必须先解析文件再路由：
   - 内容是阅读文章、阅读题或阅读答案 → `chinese-reading-session`。
   - 内容是作文题或作文草稿 → `chinese-writing-session`。
   - 是图片或 Markdown 错题文件 → 先按 `learn-errors` 提取题目与学生作答，再按上面两条判断。
   - 仍不清楚 → 问一个短问题（“这是阅读题还是作文？”），不要同时展开两条教学线。
3. `type = profile` 选定领域的顺序：
   1. `session_history[0].next_step` 明确指向阅读或写作时，用它。
   2. 否则用科目档案 `learning_state.active_domain`。
   3. 仍然没有，用 `learn-core` 的年级段默认领域（`references/grade-band-defaults.md`）。
   4. 只选一个领域，不并列两个。
4. 已明确 `intent` 时，不要用模糊描述重新推断阅读还是写作。
5. 阅读结束后学生提出“我想试试自己写”时，不要重新走写作 start；路由 `chinese-read-write-transfer`，保留当前阅读材料与已提取技巧。
6. 路由完成后，由子 skill 负责本轮全部教学动作、规则读取、输出形状和 `session_segment`；路由器不再补充学科建议。

## Submode Mapping

| 实际动作 | mode | submode |
|---|---|---|
| 阅读材料学习（文章、无答案） | `learn` | `learn` |
| 阅读答案诊断 | `diagnose` | `review` |
| 写作 start | `start` | `learn` |
| 写作 revise / assess | `revise` / `assess` | `review` |
| 读写迁移 | `learn` | `read_write_transfer` |
| 出题 | `learn` | `generate_tasks` |
| 费曼（阅读或写作） | `feynman` | `feynman` |

## Passing Control

调用目标子 skill 时，传齐：

- `student_id`、`subject: chinese`
- `mode`、`submode`
- `target_context`（原始值，不改写）
- `focus`
- 已读快照（不要重复读文件）
- 个性化输入：`personal.interests`、`personal.most_exciting_event`、`profile.preferences`、`self_report.easy_topics/hard_topics`、`memory.preferred_scaffolds` / `recent_error_patterns` / `expression_traits` / `stable_strengths` / `stable_difficulties`
- 阅读材料或草稿原文，以及学生本轮最新一句原话

只加载一个子 skill。子 skill 产出的 `session_segment` 就是本轮的记录；路由器不另造一段。

## Do Not

- 不在这里讲六种阅读方法、六圈展开、档位、标签或范文。
- 不在这里给阅读答案或作文批改。
- 不在这里写学生数据；`session_segment` 由子 skill 产出，finalize 由入口按 `learn-data` 执行。
- 不把多个子 skill 的输出拼在同一轮。
- 不用“先看看你想学什么”这类空转问题替代路由；方向清楚就直接进子 skill。

## Handoff

- 阅读 → 迁移：`chinese-read-write-transfer`。
- 阅读或写作 → 出题：`chinese-generate-tasks`。
- 任意领域 → 费曼：交给对应子 skill 的费曼模式，不新建 skill。
- 会话结束或中途换主题：交回入口，按 `learn-data` 的 finalize 规则以 `completed` 或 `interrupted` 保存。
