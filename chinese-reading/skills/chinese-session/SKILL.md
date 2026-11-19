---
name: chinese-session
description: Chinese routing. Load when the learning entry sets subject = chinese, resumes a Chinese turn, or switches reading/writing domains; dispatch one child skill by goal and mode.
user-invocable: false
resource-loading: on-demand
---

# 语文路由

教学轮只选一个子 skill，把上下文原样交给它；教学、诊断、出题与会话段均由子 skill 负责。学习推荐先走下述闸门，不进入教学路由。

## 输入与加载

入口已按共享生命周期检查会话、解析 `target_context` 并传入快照；本路由器不重复检查、补读或重新解析。完整交接字段见“移交控制”。

- `target_context.type` / `intent`：取值与判定只由 `chinese-core` 的 `references/chinese-target.md` 定义；另有共享的 `error_files` / `profile`。
- `mode`：`learn` | `feynman`。
- `focus`：本轮主题字符串；为空时由子 skill 从档案或材料中确定。

尚未加载时加载 `chinese-core`（`learn-core`、`learn-data` 已由入口加载）；本会话已读内容直接复用。路由用下表；只有文件归类或默认领域需要查 `chinese-core` 的相应参考，教学资料由接手的子 skill 读取。

科目不匹配或科目文件缺失时交回入口处理；本路由器不切换科目、不创建或修改学生数据。

## 学习推荐闸门

学生不知道学什么、问“学什么”、想换内容但未给具体目标，或阶段选择「换个内容」时，在教学路由、费曼与迁移恢复前加载 `learn-recommend`。交入口已有快照、当前焦点与最新真实表现，由它读取 `chinese-core` 契约的「学习推荐」角色；本路由此轮停在推荐选择，不分派教学/诊断子 skill、不产 `session_segment`、不修改 `context.focus` 或长期档案、不清画板。已明确新目标则交共享生命周期处理，不再要求推荐选择。

选定后才按共享交接归类目标、恢复本路由；推荐候选的读写领域和排序由角色文件决定，不受普通 `profile` 恢复顺序限制。

## 阶段选项与迁移恢复

普通阅读或写作的阶段出口回传 `stage_options`：`label: 写一写`、`action: transfer`。学生选择它或直接提出同义请求（如沿用本文技巧写一段）时，都交入口按共享生命周期记录迁移状态，保留原材料、来源领域和已提炼技巧。此后接续与恢复按 `context.activity: transfer` 先归一化目标，再查路由表：

- 来源为阅读：设置 `intent: transfer_read_write`。
- 来源为写作：设置 `type: writing_draft`、`intent: revise_writing`；轮数上限与回传由 `chinese-writing-session` 的迁移修改规则执行。

迁移来源不足时先补问，不按旧 intent 猜测。费曼优先按路由表。

## 路由表

明确 `intent` 优先于旧 `type`；两者表达了互相冲突的明确请求时，用 `ask_user_question` 确认一个动作后再路由。`mode = feynman` 优先决定教学方式，出题/迁移目标仅保留其阅读或写作领域。

`mode` 原样传递，不被改写；`task_mode` 是子 skill 内的分支，只在下表指定，不写回 context。

| 条件 | 路由到 | 传入 `task_mode` |
|---|---|---|
| `mode = feynman`，目标是阅读类 | `chinese-reading-session` | `feynman` |
| `mode = feynman`，目标是写作类 | `chinese-writing-session` | `feynman` |
| `mode = feynman`，目标是 `profile` 或中文默认 | 先选定一个领域，再路由到对应子 skill | `feynman` |
| `intent = transfer_read_write`（非费曼） | `chinese-read-write-transfer` | 不传 |
| `type = task_generation` | `chinese-generate-tasks` | 不传 |
| `type = writing_prompt` | `chinese-writing-session` | `start` |
| `type = writing_draft` | `chinese-writing-session` | `revise` |
| `type = assessment` 且 `intent = assess_writing` | `chinese-writing-session` | `assess` |
| `type = assessment` 且 `intent = assess_reading` | `chinese-reading-session` | `diagnose` |
| `type = reading_material` | `chinese-reading-session` | `learn` |
| `type = profile`，选定阅读 | `chinese-reading-session` | `learn` |
| `type = profile`，选定写作 | `chinese-writing-session` | `start` |

`submode` 与 segment 字段由被路由的子 skill 按其“会话段”填写，路由器不另行映射。

## 路由规则

1. 费曼模式只在开头路由一次；随后不再因为学生的新句子反复切换领域。
2. 文件目标：`files_processed: true` 时（含仍标为 `error_files` 的旧目标），读取 `material_refs` 指向的 extracted 内容，按 `chinese-core` 的 `references/chinese-target.md` 归为阅读/写作类别后查路由表；不再加载 `learn-errors`、分析旧 raw 路径或追问自我诊断。尚未处理的文件交回入口按共享生命周期处理，取得结果后再路由。仍分不清时用 `ask_user_question` 问“这是阅读题还是作文？”，选项为「阅读题」「作文」。
3. `type = profile` 选定领域的顺序：
   1. `session_history[0].next_step` 明确指向阅读或写作时，用它。
   2. 否则用科目档案 `learning_state.active_domain`。
   3. 仍然没有，用 `chinese-core` 的 `references/chinese-grade-defaults.md`。
   4. 只选一个领域，不并列两个。
4. 已明确 `intent` 时，不要用模糊描述重新推断阅读还是写作。

## 移交控制

调用目标子 skill 时，传齐：

- `student_id`、`subject: chinese`、`mode`，以及路由表指定的 `task_mode`
- `target_context`（已归类的目标，保留原意图与材料引用；入口持有原始输入）
- 恢复时的 `context.activity`、`context.turn_state`（迁移来源、技巧、阶段、轮数、待答问题）
- `focus`
- 入口已读会话与快照
- `chinese-core` “开始门槛与输入”列出的个性化输入
- 阅读材料或草稿原文，以及学生本轮最新一句原话

路由完成条件：目标子 skill 已收到以上上下文并接管本轮；仅需补问或等待入口处理文件时停在当前步骤。教学、反馈及唯一 `session_segment` 均由该子 skill 产出，路由器只交接，不追加教学或记录。

每次子 skill 返回后，把唯一段及最新阶段交回入口，按 `learn-data` 的 `references/session-lifecycle.md` 记录、恢复或切换。
