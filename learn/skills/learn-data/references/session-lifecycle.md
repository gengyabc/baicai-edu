# Session Lifecycle

表格自上而下取首个命中行。`STOP` 只结束本轮，不结束会话。Finalize 是被调用的子流程，不按顺序执行。

## Invariants

- 日志是 segments 的事实来源，内存副本只是缓存；教学模式与动作从 `context` 恢复，旧教学日志缺 context 时才用最后一段重建。尚无教学 context 的推荐状态只从 `recommendation.mode` 恢复模式，不补造教学动作。
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
| 日志有 `finalize_plan`，或 marker 已匹配但仍有待清理教学内容（segments/context/plan；已选 recommendation 不属于它） | Finalize 恢复保存或仅清理；成功后旧身份结束，不接续旧循环。明确结束则清除已选推荐并 STOP；仅保存则保留已选目标、报告结果并 STOP。本条含 `/learn`、`/learn-feynman`、新教学请求或推荐请求则新建，优先承接持久化的已选目标（本条另有明确目标则覆盖）；否则报告结果，保留已选目标待继续，STOP |
| 旧主题已提交且无待清理教学内容，日志保留已选 recommendation | 本条明确结束则清除推荐并结束；明确取消选定任务则清除推荐、问一个想学的方向并 STOP；危机按第 2 节；仅保存则报告结果并保留已选目标。本条另有明确目标则覆盖已选目标；否则以推荐中的已选目标与 mode 新建，保留推荐至新 context 成功，进入第 4 节，不恢复旧教学 |
| 正在回答恢复选择 | 恢复身份，选择交第 4 节执行 |
| 已有活跃循环 | 保留身份、segments、context 与快照；无新目标时保留 focus 和材料 |
| 有未完成 segments/context，本条明确结束或换主题 | 恢复，不为旧主题补问 |
| 有未完成 segments/context，直接 `/learn-feynman` | 恢复身份，`ask_user_question` 给「接着上次」「开新的」，STOP |
| 有未完成 segments/context，其他请求（含 `/learn`），或有待选 recommendation | 恢复；只有推荐时保留身份与候选，不补造 context |
| 无待恢复记录 | 新建 |

- **恢复**：取日志身份与 context（activity、材料、待答问题、迁移阶段），结构见 `references/session-schema.md`。旧日志无 context 时采用最后一段的 focus/mode，交第 5 节重建；只有 recommendation 而无教学段时直接进第 4 节推荐闸门，不补造旧焦点。
- **新建**：`session_id` 用 `sess_<YYYYMMDD>_<HHmmss>_<随机hex>`，且不等于 `last_finalized_session_id`；mode 取入口初始值，换主题时沿用当前 mode。写入 `session_id`、`entry_point`、`started_at`、`updated_at`、`segments: []`。
- 恢复选择的回答承接上一次入口请求：`/learn-feynman` 后选「接着上次」，仍在第 4 节应用费曼模式。保存恢复后的新会话也保留本条的目标与模式请求。

## 4. Dispatch

**推荐闸门**：危机、明确结束及待完成保存仍优先。其后，用户不知道学什么、询问学什么、想换但尚无具体目标、阶段选择「换个内容」，或日志有待选 `recommendation` 时，加载 `learn-recommend`，先处理推荐而不是把消息归为旧题回答或立即换主题。该分支在 Resolve Target、Route And Record 与任何新任务边界之前执行：

- 尚未选择：仅将技能返回的 `recommendation` 写入日志顶层并更新 `updated_at`，保留原 context、focus、segments 与身份，STOP；无原目标时允许只有 recommendation 而无 context。
- 选择候选或明确委托首选：先把 `selected_id` 与当前 mode 写入日志 recommendation，成功后才将选中项的 focus 与 target_context 作为显式目标；写失败按 Invariants 停止，不 finalize。确实更换目标时才执行下表换主题流程，旧主题保存成功后新建并应用目标。仍是原目标则保留身份接续。模式沿用原 mode（无 context 时用 recommendation.mode），实际新主题使用 `activity: teaching`，不携带旧题材料与迁移进度。已选 recommendation 跨 finalize、失败重试与新建保留，写入新 context 成功后清除。本轮已解析为选定目标后不再命中推荐闸门；交学科的最新请求使用选定目标，不用原推荐请求再次触发推荐。
- 已有 `selected_id` 的恢复：不再问候选，复用已授权目标；危机、明确结束、取消或本条另有明确目标仍优先。旧主题未完成保存则先恢复保存，成功后才开始选定任务。仅保存请求不自动开课。
- 保留原任务、改为自己定内容或拒绝全部：按技能出口清除或更新 recommendation，不新增 segment、不改长期档案。结束或用户直接指定其他目标时交下表；结束保存同时清除推荐。
- 中断恢复先核对 recommendation 的 subject 与当前身份，匹配才承接候选；缺失或不匹配则重新推荐，不猜测旧选项。待完成保存优先处理，成功后若本条仍是推荐请求则承接，而不是丢掉请求。

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
3. 档案候选顺序（入口与学科共用，学科不另写一份）：取第一个非空项——`session_history[0].next_step`、`learning_state.priority_targets`、`learning_state.developing_topics`、`learning_memory.recommended_next_moves`、`profile_memory.stable_difficulties`、最近 milestones、学科契约的年级默认。学科只补充领域选择等约束，不重排。这是普通恢复规则；显式学习推荐由 `learn-recommend` 与学科「学习推荐」角色重排候选，选定后回到第 1 项。

**文件**：入口调用一次 `learn-errors`（自我诊断问答、文件安全、写回），再按学科目标分类归类，设 `files_processed: true`，保留 extracted 引用与原意图。学科不再处理 raw 路径；已有 extracted 引用直接复用。

**写回** context 的 `focus`、`mode`、`activity`、`target_context`、`materials`、`turn_state`。粘贴材料无文件来源时存进 `context.materials`；已有 extracted 时只留引用。缺材料或意图时只问一个问题，STOP。

## 6. Route And Record

按学科契约加载 `<subject>-session`，由它决定子技能、附加动作与迁移参数；加载完成后才生成教学回复。学科包未安装时按学科契约处理。迁移的来源、已提取内容与阶段从 context 恢复，不足时先补问，不重启迁移。

**交接**（学科 skill 一律以此为输入，不再各自列出）：`student_id`、`subject`、最新学生消息、`target_context`、`focus`、`mode`、恢复时的 `context.activity` / `turn_state`、快照，以及个性化输入（共享 `personal`；科目 `profile.preferences` / `profile.self_report`；memory 的支架、动机、近期错误、稳定优势与困难、推荐下一步）。使用边界遵循 `learn-core`。

**返回**：学生可见回复、一个 segment 及可选 `stage_options`；内部诊断、桥接等结果并入该 segment，不另记一轮。

**写回**：按 Session Segments 契约追加 segment，教学助手猜测与学生确认分开记录；同步 context 与 `context.turn_state` 的当前题、作答要求、已收到的回答和最新待答问题（字段见 schema），学生本轮提出难度要求时写 `context.difficulty_request`。发现此前漏读或误判时，先更正受影响的日志与状态并留更正说明，再继续。

## 7. Continue

选一个小的 next step，待答问题写入 context，等待回应，STOP。普通学习的菜单按 `references/next-step.md`；费曼模式用 `ask_user_question` 只给「继续讲」「换一个点」「结束」，「换一个点」说明为换个学习内容，未指定目标时也交推荐闸门，选定后沿用费曼模式。

## Finalize Or Switch Topic

执行 `references/finalize-session.md`（幂等门、空 segments 的 no-op、plan 重放与日志清理），本文件不另定义提交步骤。空 segments 返回 no-op 且正在结束或切换时，由生命周期移除旧 recommendation；这仅清理临时选择，不写长期档案。正常结束用 `status: completed`；中断旧主题用 `status: interrupted`、`interrupted_at`、`last_topic`。成功后结束、仅报告还是新建，由调用处的表格行决定。

- **提交失败**：保留日志、会话身份与 plan，说明“这次没有保存成功”，可用 `/learn-save` 重试；STOP。
- **仅日志清理失败**：说明“学习记录已保存，日志清理未完成”；下次只重试清理，不重复提交科目数据。
