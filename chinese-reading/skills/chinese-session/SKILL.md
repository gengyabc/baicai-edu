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

如果入口没有给出 `target_context`，按 `learn-data` 的 `references/target-parsing.md` 补齐；仍然无法判断时只问一个短问题，不要靠猜开始教学。

## Load First

如果本会话尚未加载，按顺序调用 `skill` 工具加载：

1. `learn-core`
2. `learn-data`
3. `chinese-core`

路由器只需要读规则来判断方向，不必读 `chinese-core` 的全部 reference；具体规则由被路由到的子 skill 读取。

## Preconditions

1. 优先复用入口已读的 `session.json` 与学生快照，确认 `student_id` 存在且 `subject = chinese`；已提供的部分不重复读取。
2. 仅当必要会话信息或快照字段缺失时，按 `learn-data` 的 Read Snapshot 补读缺失部分；会话不存在或 `student_id` 为空则引导 `/start`，停止路由。科目不匹配则交回入口确认，不在这里切换或写回。
3. 科目文件缺失时交回入口按 `learn-data` 初始化，再使用入口返回快照；本路由器不创建、初始化或修改任何学生数据。
4. 本轮只路由一次；不要在一次回复里加载多个子 skill 的教学内容。

## Routing Table

| 条件 | 路由到 | 传入 mode |
|---|---|---|
| `mode = feynman`，目标是阅读类 | `chinese-reading-session` | `feynman` |
| `mode = feynman`，目标是写作类 | `chinese-writing-session` | `feynman` |
| `mode = feynman`，目标是 `profile` 或中文默认 | 先选定一个领域，再路由到对应子 skill | `feynman` |
| `intent = transfer_read_write`，或学生明确要求沿用本文技巧写作（非费曼） | `chinese-read-write-transfer` | `learn` |
| `type = task_generation` | `chinese-generate-tasks` | `learn` |
| `type = writing_prompt` | `chinese-writing-session` | `start` |
| `type = writing_draft` | `chinese-writing-session` | `revise` |
| `type = assessment` 且 `intent = assess_writing` | `chinese-writing-session` | `assess` |
| `type = assessment` 且 `intent = assess_reading` | `chinese-reading-session` | `diagnose` |
| `type = reading_material` | `chinese-reading-session` | `learn` |
| `type = error_files` | 仅未处理文件交入口解析；已处理时复用提取内容并归类 | 见下 |
| `type = profile`，选定阅读 | `chinese-reading-session` | `learn` |
| `type = profile`，选定写作 | `chinese-writing-session` | `start` |

## Routing Rules

1. 费曼模式只在开头路由一次；随后不再因为学生的新句子反复切换领域。
2. 文件目标遵循 `learn-data` 的 `references/target-parsing.md` 的 After File Processing：
   - 入口已归类并传 `files_processed: true` 时，直接使用其阅读/写作类别、intent、提取内容和 material_refs；不再加载 `learn-errors` 或追问自我诊断。
   - 兼容仍为 `error_files` 但已处理的目标：读取 material_refs 指向的 extracted 内容，归为阅读/写作类别；不再分析旧 raw 路径。
   - 尚未处理时交回共享生命周期调用一次 `learn-errors`，取得结果后再路由；本路由器不进行文件持久化。
   - 阅读答案用 `assessment + assess_reading`；作文批改用 `assessment + assess_writing`，其余按材料归类。仍不清楚只问“这是阅读题还是作文？”。
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
- 入口已读会话与快照，以及按 Preconditions 补读的缺失部分（子 skill 复用，不重复读文件）
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
- 会话结束、中途换主题、模式切换或恢复：把子 skill 的唯一段交回入口，按 `learn-data` 的 `references/session-lifecycle.md` 记录与处理；本路由器不生成额外段、不写数据。
