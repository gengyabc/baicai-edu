---
name: learn
description: 自适应学习主入口：读取当前学生快照，解析主题/错题/档案目标，按数学或语文路由到学科 skill，进行多轮教学，判断结束信号并在结束时统一保存。
disable-model-invocation: true
---

# Learn

## Purpose

这是学生最常用的学习入口。它只负责会话循环、快照、路由、会话日志和保存；具体教学动作由学科 skill 完成。

## Load First

如果本会话尚未加载，先调用 `skill` 工具加载：

1. `learn-core`
2. `learn-data`

学科 skill 会在需要时加载；不要预加载所有学科内容。

## Session Loop

这个 skill 在整个会话中保持有效。每收到一条学生消息，按下面循环执行；直到结束信号出现。

### 1. 初始化或恢复

先读 `outputs/students/session.json`，确认 `student_id` 与 `subject`；没有则引导 `/start`，停止。再读 `outputs/students/<id>/<subject>/session_log.json`（可能不存在）和 `current_state.json` 的 `last_finalized_session_id`：

- 有 `segments` 且非空，并且 `current_state.last_finalized_session_id` 不等于日志里的 `session_id` → 恢复 `session_segments`、`session_id`、`entry_point`，告诉学生“我们接着上次的<focus>继续”，然后进入第 2 步。
- 没有、`segments` 为空，或该 `session_id` 已经 finalize 过 → 新建：

```
session_segments = []
session_id = "sess_<YYYYMMDD>_<HHmm>"
entry_point = "learn"
```

并把同样的骨架写入 `session_log.json`。

`session_segments` 以 `session_log.json` 为准；上下文中的副本只是缓存。每轮追加 segment 后立即写回日志。

### 2. 读取当前会话

读 `outputs/students/session.json`：

- 没有文件、`student_id` 为空 → 告诉学生先运行 `/start`，停止。
- `subject` 不是 `math` / `chinese` → 回到 `/start` 重选科目。

会话开始时读一次；中途只有切换学生/科目时才重读，不要每轮重复读。

### 3. 读取快照

会话开始时按 `learn-data` 的“Read Snapshot”读取共享档案、科目档案、memory、current_state、milestones、session_log。

- 科目文件缺失 → 按模板初始化后再继续。
- 只读本轮需要的字段；不要把整个 JSON 复述给学生。
- 后续轮次复用内存中的快照；只有写回过文件或切换学生/科目时才重读。
- 用 `learning_memory.recent_focus` / `recent_modes` 接上一句“上次我们在…”，再进入本轮目标。
- 把 `personal.interests`、`profile.preferences`、`self_report.easy_topics/hard_topics` 和 memory 的 `preferred_scaffolds` / `motivation_signals` / `recent_error_patterns` / `recommended_next_moves` / `stable_strengths` / `stable_difficulties` 交给学科 skill，用来选例子、支架和下一步。
- 如果 `current_state` 的 `pending_feynman_handoff` 或 `pending_transfer_phase` 为 true：本轮优先接上 `pending_feynman_focus` / `pending_transfer_focus`；接上后把该 pending 两个字段清空并写回 `current_state.json`，避免重复触发。

### 4. 解析目标

只在**第一轮**解析 `/learn` 后面的文本；后续轮次沿用当前 `focus` 和 `target_context`。

按 `references/target-parsing.md` 分类：

- 空 → `profile`
- 路径 → `error_files`
- 数学剩余文本 → `topic`
- 语文按 assessment / task_generation / writing_draft / writing_prompt / reading_material / profile 顺序

如果 `/learn` 没有参数，但学生在第一轮回复里直接给出主题、文章或错题路径，也把它当作 `target_context`；如果学生只是回答“好”“开始吧”，才从档案选目标。不要把学生明确给出的主题误当成对上一轮问题的回答。

如果目标是错题文件：

1. 加载 `learn-errors`。
2. 先问学生“你觉得这道题错在哪？”再分析第一道新题。
3. 分析完成后，把目标切到最值得练的错误类型。

### 5. 路由

- `subject = math` → 调用 `skill` 加载 `math-session`。
- `subject = chinese` → 调用 `skill` 加载 `chinese-session`（它再路由阅读/写作/出题）。
- 如果学科 skill 未安装，告诉学生需要先安装 `dsh-edu-math-low` 或 `dsh-edu-chinese-reading`，不要自己编造教学内容。

把下面内容传给学科 skill：

- `student_id`、`subject`
- 学生本轮最新消息
- `target_context`（由第 4 步得到）
- 快照
- 个性化输入：`personal.interests`、`profile.preferences`、`self_report.easy_topics/hard_topics`、memory 的相关字段
- 当前 `focus`
- 当前 `mode`（默认 `learn`）

### 6. 执行一回合

学科 skill 负责：

- 用中文给学生一句/几句教学回复。
- 追问思路、给支架、做三步确认。
- 在内部产出一个 `session_segment`。

把 `session_segment` 追加到 `session_segments`，并立即写回 `session_log.json`。不要在本轮写 `profile.json` / `memory.json`。

### 7. 判断结束

按 `learn-core` 的 `references/session-end-signals.md` 的 Action Mapping 判断：

- 显式、无歧义的结束 → 进入第 9 步。
- 目标达成 / AI 判断可收束 → 先给学生一句阶段总结，再进入第 9 步。
- 中途换主题 → 按“Topic Switch”处理。
- 连续敷衍 → 先问“要不要今天先到这？”，不要直接结束。
- 未结束 → 进入第 8 步。

不要在本节重复维护结束信号清单；以 `session-end-signals.md` 为准。

### 8. 给下一步

按 `references/next-step.md`：

1. 选一个足够小的 `next_step`。
2. 用学生能懂的话给选择（继续 / 当小老师 / 结束；数学可加“你出题考我”）。
3. 如果学生选择练习迁移：
   - 数学 → 加载 `math-student-problem`。
   - 语文阅读 → 加载 `chinese-session`，传 `intent: transfer_read_write`，由它路由到 `chinese-read-write-transfer`。
   - 语文写作 → 加载 `chinese-session`，传 `mode: revise`，让写作 skill 换角度再写一小段。
   - 写 `current_state.json` 的 `pending_transfer_phase` / `pending_transfer_focus`。
4. 如果学生选择当小老师：
   - 加载 `feynman` skill，并告诉它：这是从当前 `/learn` 会话中途切换，不要重新 `/start`，不要清空 `session_segments`，沿用当前 `focus` 与 `target_context`。
   - 写 `current_state.json` 的 `pending_feynman_handoff` / `pending_feynman_focus`。
   - 后续由 `feynman` skill 接管讲解回合；finalize 仍按第 9 步执行。
5. 等学生下一条消息，回到第 2 步（快照只需在写回后重读）。

### 9. 结束并保存

1. 确认 `session_segments` 非空；为空则告诉学生这次没有可保存的内容。
2. 按 `learn-data` 的“Finalize”执行：
   - 先做 `last_finalized_session_id` 幂等检查。
   - 生成 final summary 与五个 patch。
   - 读完整文件 → 合并 → 写回四个科目文件。
   - 清空 `session_log.json` 的 `segments`。
   - 保留策略以 `learn-data` 的 Retention 为准。
3. 如果保存失败：告诉学生“这次没有保存成功”，保留 `session_log.json` 中的 segments，提示可以用 `/save` 再试。
4. 保存成功后：
   - 给学生一句简短总结（学到了什么、下一步）。
   - 清空 `session_segments`。
   - 结束当前学习循环；学生要再学就重新 `/learn`。

## Target Context

`target_context` 是一个轻量对象，至少包含：

```json
{
  "type": "topic",
  "topic": "异分母分数加法",
  "source": "manual_topic",
  "files": [],
  "intent": null
}
```

学科 skill 用它决定从哪个目标开始；不要在学生可见回复里复述这个对象。

## Error Files

如果目标是路径：

- 交给 `learn-errors` 处理路径、raw 只读、备份、改名、extracted 写入、error_history 更新。
- 分析后把 `target_context` 改为 `error_analysis`，`topic` 取最值得练的错误类型。
- 如果学生同时给了多个文件，先处理最近/最频繁的一个，不要一次分析完所有。

## Practice Transfer

练习迁移不是重新讲一遍。具体规则：

- 数学：`math-core` 的 `references/math-student-problem-design.md` 与 `math-student-problem`。
- 语文阅读：经 `chinese-session` 传 `intent: transfer_read_write`，再路由到 `chinese-read-write-transfer`。
- 语文写作：在 `chinese-writing-session` 里换角度、换题目或局部重写，不超过 2 轮。

迁移结束后清理 `pending_transfer_*`，把本轮 segment 追加到 `session_log.json`，再判断是否结束。

## Feynman Handoff

从 `/learn` 切到费曼时：

- 不要重新 `/start`，不要清空 `session_segments`。
- 角色完全切换为学生视角；AI 像同龄孩子一样提问。
- 白名单按 `learn-core/references/feynman-skill-whitelist.md`：已确认技能不犯错；未确认技能可故意犯错。
- 只有达到“两条独立证据或一次讲清理由”才把技能加入 `confirmed_skills`；连续 2 次在已确认技能上出错，移除。
- 费曼结束后回到第 7 步判断是否 finalize；`learn -> feynman` 算一次完整会话。

## Topic Switch

学生说“我想学 XXX”：

1. 先把当前 `session_segments` 以 `status: "interrupted"`、`interrupted_at`、`last_topic` finalize。
2. 生成新的 `session_id`，清空 `session_segments`，并把新的 `session_log.json` 骨架写回。
3. 用新主题重新解析目标，继续循环。
4. 不要把旧主题的困难错误地写成新主题的困难。

## Constraints

- 一轮只教一个小目标；不要一次讲一个单元。
- 不把内部 `session_segment`、错误标签、JSON 展示给学生。
- 每轮只写 `session_log.json` 和 pending 状态；`profile.json` / `memory.json` / `milestones.json` 只在 finalize、缺失初始化、`/profile` 显式修改或 `learn-errors` 处理错题时写。
- 不重复 finalize 已保存的会话；`last_finalized_session_id` 是最终判断。
- 不自行替学生决定结束；显式结束或达成目标才结束。
- 没有当前学生时，先引导 `/start`，不要猜。
- 学科 skill 缺失时明确告知安装包名，不要用通用聊天替代教学流程。

## Related

- `references/target-parsing.md`
- `references/next-step.md`
- `learn-data`：快照、会话日志、写回、finalize。
- `learn-errors`：错题处理。
- `math-session` / `chinese-session`：学科教学。
