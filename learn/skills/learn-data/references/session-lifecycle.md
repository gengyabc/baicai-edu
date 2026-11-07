# Session Lifecycle

表格自上而下取首个命中行。`STOP` 只结束本轮，不结束会话。Finalize 是被调用的子流程，不按顺序执行。

## Invariants

- 日志是 segments 的事实来源，内存副本只是缓存；`context` 是模式与动作的唯一恢复来源，旧日志缺 context 时才用最后一段重建。
- 恢复保留 `session_id`、`entry_point` 与旧证据，旧证据不归到新主题。显式模式请求优先于恢复模式；无参数 `/learn` 不是显式退出费曼，沿用日志模式与动作。
- `mode`（learn / feynman）与 `context.activity`（teaching / transfer）相互独立。目标、模式或动作变化立即写回 context 并更新 `updated_at`，不单独生成 segment。
- 教学中只写日志；其他写入按数据协议中的显式例外处理。保存只走 Finalize，`/learn-save` 同用。
- 只记录学生已发生的表现：未答问题、恢复选项的回答、跳过、技术排查与消息占位符都不算证据；结束消息不补造 segment。
- 写回成功才推进：日志写入失败时说明未保存、保留待写内容并 STOP，不覆盖日志。待提交 plan 完成前不开展新教学；旧主题保存成功前不开新主题。
- “新建”“恢复”“等待”是从日志与执行位置派生的标签，不新增持久化字段。

## 1. Snapshot

按 `learn-data` 的 Read Snapshot 取得或复用学生、科目与快照，不逐轮重读。缺当前学生时引导 `/learn-start`，STOP；这是所有包里唯一的会话门槛。

## 2. Classify

按 `learn-core` 的 `references/session-end-signals.md` 归类危机、结束、换主题、歧义、跳过或当前题回应，结果交第 4 节。危机走其安全流程，不 finalize、不记录细节，已有 plan 留待后续恢复，STOP。

## 3. Open Or Resume

| 情况 | 动作 |
|---|---|
| 日志有 `finalize_plan`，或 marker 已匹配但仍有待清理内容（即使内存声称循环活跃） | Finalize 恢复保存或仅清理；成功后旧身份结束，不接续旧循环。本条含 `/learn`、`/learn-feynman` 或新教学请求则新建；否则报告结果，STOP |
| 正在回答恢复选择 | 恢复身份，选择交第 4 节执行 |
| 已有活跃循环 | 保留身份、segments、context 与快照；无新目标时保留 focus 和材料 |
| 有未完成 segments/context，本条明确结束或换主题 | 恢复，不为旧主题补问 |
| 有未完成 segments/context，直接 `/learn-feynman` | 恢复身份，`ask_user_question` 给「接着上次」「开新的」，STOP |
| 有未完成 segments/context，其他请求（含 `/learn`） | 恢复 |
| 无待恢复记录 | 新建 |

- **恢复**：取日志身份与 context（activity、材料、待答问题、迁移阶段），结构见 `references/session-schema.md`。旧日志无 context 时采用最后一段的 focus/mode，交第 5 节重建。
- **新建**：`session_id` 用 `sess_<YYYYMMDD>_<HHmmss>_<随机hex>`，且不等于 `last_finalized_session_id`；mode 取入口初始值，换主题时沿用当前 mode。写入 `session_id`、`entry_point`、`started_at`、`updated_at`、`segments: []`。
- 恢复选择的回答承接上一次入口请求：`/learn-feynman` 后选「接着上次」，仍在第 4 节应用费曼模式。保存恢复后的新会话也保留本条的目标与模式请求。

## 4. Dispatch

| 事件 | 动作 | 下一步 |
|---|---|---|
| 明确结束今天的练习（即使顺口提到以后学什么） | Finalize，`status: completed`；成功即结束活跃循环 | STOP |
| 明确换主题且今天继续，或恢复选择「开新的」 | 旧主题非空：Finalize 以 `interrupted` 保存，成功后新建；为空则直接新建。保留当前 mode，再应用本条显式模式请求 | 5 |
| 结束意图歧义，或达到偏题确认条件 | 按 session-end-signals 用 `ask_user_question` 确认 | STOP |
| 显式当小老师（含 `/learn-feynman`） | 切到费曼 | 5；无新目标且 context 完整时直接 6 |
| 显式回到普通学习，或显式选择迁移 | 切回普通学习 / 启动迁移 | 5 |
| 跳过当前题，无新主题或结束意图 | 在当前小目标里换题 | 6 |
| 当前题回应或其他继续请求 | 保留 focus、材料、模式与动作 | 5 |

模式与动作切换：

- **切到费曼**：加载 `learn-feynman` 的角色规则，设 `mode: feynman`、`context.activity: teaching`；沿用 focus、材料与 entry_point，清除仅用于迁移的 intent 与 turn_state。这是唯一的切换点，`/learn-feynman` 入口直接执行本条；之后不再路由学生出题 / 读写迁移。
- **切回普通学习**：设 `mode: learn`、`context.activity: teaching`，清理迁移进度。
- **启动迁移**：设 `mode: learn`、`context.activity: transfer`，在 turn_state 记下来源领域与阶段；迁移完成后 activity 回到 teaching。

## 5. Resolve Target

仅新会话、首次补目标、明确换主题或旧日志缺 context 时执行；其余消息是对当前问题的回应，跳到第 6 节，不逐轮重新分类。

读 `references/target-parsing.md`，再读学科契约中的目标分类。来源按优先级取：

1. 用户本条的显式目标或模式/动作请求。
2. 未完成会话的 focus 与日志 context。
3. 档案候选顺序（入口与学科共用，学科不另写一份）：取第一个非空项——`session_history[0].next_step`、`learning_state.priority_targets`、`learning_state.developing_topics`、`learning_memory.recommended_next_moves`、`profile_memory.stable_difficulties`、最近 milestones、学科契约的年级默认。学科只补充领域选择等约束，不重排。

**文件**：入口调用一次 `learn-errors`（自我诊断问答、文件安全、写回），再按学科目标分类归类，设 `files_processed: true`，保留 extracted 引用与原意图。学科不再处理 raw 路径；已有 extracted 引用直接复用。

**写回** context 的 `focus`、`mode`、`activity`、`target_context`、`materials`、`turn_state`。粘贴材料无文件来源时存进 `context.materials`；已有 extracted 时只留引用。缺材料或意图时只问一个问题，STOP。

## 6. Route And Record

按学科契约加载 `<subject>-session`，由它决定子技能、附加动作与迁移参数；加载完成后才生成教学回复。学科包未安装时按学科契约处理。迁移的来源、已提取内容与阶段从 context 恢复，不足时先补问，不重启迁移。

**交接**（学科 skill 一律以此为输入，不再各自列出）：`student_id`、`subject`、最新学生消息、`target_context`、`focus`、`mode`、恢复时的 `context.activity` / `turn_state`、快照，以及个性化输入（共享 `personal`；科目 `profile.preferences` / `profile.self_report`；memory 的支架、动机、近期错误、稳定优势与困难、推荐下一步）。使用边界遵循 `learn-core`。

**返回**：学生可见回复、一个 segment 及可选 `stage_options`；内部诊断、桥接等结果并入该 segment，不另记一轮。

**写回**：按 Session Segments 契约追加 segment，教师猜测与学生确认分开记录；同步 context 与 `context.turn_state` 的当前题、作答要求、已收到的回答和最新待答问题（字段见 schema）。发现此前漏读或误判时，先更正受影响的日志与状态并留更正说明，再继续。

## 7. Continue

选一个小的 next step，待答问题写入 context，等待回应，STOP。普通学习的菜单按 `references/next-step.md`；费曼模式用 `ask_user_question` 只给「继续讲」「换一个点」「结束」。

## Finalize Or Switch Topic

执行 `references/finalize-session.md`（幂等门、空 segments 的 no-op、plan 重放与日志清理），本文件不另定义提交步骤。正常结束用 `status: completed`；中断旧主题用 `status: interrupted`、`interrupted_at`、`last_topic`。成功后结束、仅报告还是新建，由调用处的表格行决定。

- **提交失败**：保留日志、会话身份与 plan，说明“这次没有保存成功”，可用 `/learn-save` 重试；STOP。
- **仅日志清理失败**：说明“学习记录已保存，日志清理未完成”；下次只重试清理，不重复提交科目数据。
