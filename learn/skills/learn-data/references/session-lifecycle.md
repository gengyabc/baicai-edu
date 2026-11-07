# Session Lifecycle

`/learn` 与 `/learn-feynman` 共用的会话循环。入口只指定初始 `mode` 与新会话的 `entry_point`；恢复、目标解析、路由、逐轮记录和结束都在本流程。本文供读取，不是新 skill。

## 1. Open Or Resume

按 `learn-data` 的 Read Snapshot 获取当前学生、科目与快照；缺少当前学生时引导 `/learn-start` 并停止。这是所有包里唯一的会话门槛。

- **已有活跃循环**：保留 `session_id`、`entry_point`、全部 segments 与快照；没有新目标时保留 focus 和材料。显式模式请求按第 4 步切换，不新建会话。无参数 `/learn` 的恢复不是显式退出费曼，沿用日志模式。
- **无活跃循环，但日志有未 finalize 的 segments、context 或 finalize_plan**：执行下方“恢复未完成日志”。
- **无待恢复记录**：新建空日志。`session_id` 用 `sess_<YYYYMMDD>_<HHmmss>_<随机hex>`，且不等于 `last_finalized_session_id`；记录 `entry_point`、`started_at`、`updated_at`、`segments: []`。

恢复后，显式模式请求优先于最后一段的 mode；显式新主题走第 5 步，旧证据不归到新主题。日志是 segments 的事实来源，上下文里的副本只是缓存。

### 恢复未完成日志

1. 从日志恢复身份与 context（结构见 `references/session-schema.md` 的 Session Log）。
2. 有 `finalize_plan`：先恢复保存，失败即停止。成功后旧身份结束，此分支不接续旧循环；本条消息含 `/learn`、`/learn-feynman` 或新教学请求时新建日志，否则只报告保存结果。
3. 没有 plan、旧日志也无 context：采用最后一段的 focus/mode，按第 2 步重建目标；缺材料或意图时只问一个问题。
4. 没有 plan：`/learn` 默认接续。直接 `/learn-feynman` 时用 `ask_user_question` 给「接着上次」「开新的」；选开新则先按第 5 步以 `interrupted` 保存旧主题，成功后再新建。

身份明确、没有待提交 plan 之后才进入第 2 步。等待补充材料或回答选择时，停在当前步骤。

## 2. Resolve Target

只在新会话、首次补充目标或明确换主题时解析；之后的消息默认是对当前问题的回应，不逐轮重新分类。

**解析**：读 `references/target-parsing.md`，再读学科契约中的目标分类。来源优先级：

1. 用户本条的显式目标或模式/动作请求。
2. 未完成会话的 focus 与日志 context。
3. 档案候选顺序（入口与学科共用，学科不另写一份）：取第一个非空项——`session_history[0].next_step`、`learning_state.priority_targets`、`learning_state.developing_topics`、`learning_memory.recommended_next_moves`、`profile_memory.stable_difficulties`、最近 milestones、学科契约的年级默认。学科只补充领域选择等额外约束，不重排。

**文件**：入口调用一次 `learn-errors`（自我诊断问答、文件安全、写回），之后按学科目标分类归类，设 `files_processed: true`，保留 extracted 引用与原意图。学科不再处理 raw 路径。

**context 是模式与动作的唯一恢复来源**：

- 解析目标、选择迁移或切模式后立即写回日志 context。每轮同步 focus、mode、activity、target_context、材料引用、待答问题与迁移阶段。
- 粘贴材料没有文件来源时存进 `context.materials`；已有 extracted 时只留引用。
- 选择费曼或迁移时只写 context。恢复后按 context.activity/mode 保持该动作；迁移完成后 activity 回到 teaching。

## 3. Route And Record

**路由**：按学科契约加载 `<subject>-session`，由它决定子技能、附加动作与迁移参数。加载完成后才生成教学回复。迁移来源、已提取内容与阶段从 context 恢复，不足时先补问，不重启迁移。学科包未安装时按学科契约处理，保留已有日志。

**交接**（学科 skill 一律以此为输入，不再各自列出）：`student_id`、`subject`、最新学生消息、`target_context`、`focus`、`mode`、恢复时的 `context.activity` / `turn_state`、快照，以及个性化输入（共享 `personal`；科目 `profile.preferences` / `profile.self_report`；memory 的支架、动机、近期错误、稳定优势与困难、推荐下一步）。使用边界遵循 `learn-core`。

学科返回学生可见回复、一个 segment 及可选 `stage_options`；内部诊断、桥接等结果并入该 segment，不另记一轮。

**记录**：

- 按 Session Segments 契约追加 segment，更新 `updated_at` 并立即写回。
- 只记录学生已经发生的表现；尚未回答的问题不算证据。教师猜测与学生确认分开记录。
- 同步 `context.turn_state` 的当前题、作答要求、已收到的回答和最新待答问题（字段见 schema）。
- 发现此前漏读或误判：先更正受影响的日志与状态并留更正说明，再继续。技术排查或消息占位符不算教学表现。
- 写入失败：说明未保存并保留待写内容，不继续覆盖日志。
- 教学中只写日志；其他写入按数据协议中的显式例外处理。

## 4. Continue Or Change Mode

每条学生消息先按 `learn-core` 的 `references/session-end-signals.md` 判断结束、歧义、危机与换主题，再决定是否教学。结束消息不需要额外教学或虚构 segment。

- **继续**：选一个小的 next step，等待回应，回第 3 步。
- **显式当小老师（含 `/learn-feynman`）**：加载 `learn-feynman` 的角色规则，设 `mode: feynman`、`context.activity: teaching` 并立即写回日志。沿用 focus、材料与 entry_point，清除仅用于迁移的 intent 与 turn_state，不再路由学生出题/读写迁移。这是唯一的切换步骤，`/learn-feynman` 入口直接执行本条。
- **显式回到普通学习**：设 `mode: learn`、`context.activity: teaching`，清理迁移进度。无参数 `/learn` 恢复时沿用日志模式/动作，不算显式退出。
- **显式选择迁移**：设 `mode: learn`、`context.activity: transfer`，在 turn_state 记下来源领域与阶段并立即写回；按第 3 步路由，完成后 activity 回到 teaching。

普通学习的下一步菜单按 `references/next-step.md`。费曼模式用 `ask_user_question` 只给「继续讲」「换一个点」「结束」。

## 5. Finalize Or Switch Topic

保存一律执行 `references/finalize-session.md`。

- **正常结束**：`status: completed`；成功后结束活跃循环。
- **明确换主题**：以 `status: interrupted`、`interrupted_at`、`last_topic` 保存旧主题，成功后新建日志、按第 2 步解析新目标，保留当前 mode。旧主题为空时直接开新主题。
- **提交失败**：保留日志与会话身份，说明“这次没有保存成功”，可用 `/learn-save` 重试；旧主题保存成功前不开新主题。只有日志清理失败时，按 finalize 的已提交分支重试清理。
- **危机**：按安全流程停止教学，不 finalize，不记录危机细节。

日志的追加与结束只走本流程；`/learn-save` 直接使用同一 finalize 协议。
