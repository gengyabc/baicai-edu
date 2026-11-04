# Session Lifecycle

`/learn` 与 `/feynman` 共用的会话循环。入口只指定初始 `mode`、目标解析方式与新会话的 `entry_point`；本流程负责恢复、路由、逐轮记录和结束。它是读取的流程文档，不是新 skill，也不需要加载只能由用户调用的 `learn` skill。

## 1. Open Or Resume

按 `learn-data` 的 Read Snapshot 获取当前学生与科目；缺少当前学生时引导 `/start` 并停止。复用有效快照，学科 skill 不重复读取。

- 已有活跃循环：保留 `session_id`、`entry_point`、全部 segments 与快照；没有新目标时保留 focus 和目标材料。显式模式请求按第 4 步切换，不新建会话或 finalize。无参数 `/learn` 的恢复不是显式退出费曼，沿用日志模式。
- 无活跃循环，但日志有非空 segments、有效 context 或待完成的 finalize_plan 且尚未 finalize：先恢复日志中的身份与 context（结构见 `references/profile-schema.md` 的 Session Log），其中保存 focus、mode、target_context、材料与迁移进度；旧日志无 context 时用最后一段的 focus/mode，按 `references/target-parsing.md` 重建目标，缺少语文材料/意图只问一句，不能猜原文或重跑已处理文件。存在 finalize_plan 时先完成保存重试：失败则停止；成功即结束旧身份并丢弃旧 context 缓存，本条有 `/learn`、`/feynman` 或显式新教学请求则回到新建日志分支，否则只报告保存结果，不接续旧循环。没有计划需要恢复时，`/learn` 默认接续；直接 `/feynman` 先问是否接着上次。拒绝接续时先按第 5 步以 `interrupted` 保存旧主题，成功后才开新会话。
- 无待恢复记录：新建空日志。`session_id` 用 `sess_<YYYYMMDD>_<HHmmss>_<随机hex>`，并核对不等于 `last_finalized_session_id`；记录入口指定的 `entry_point`、`started_at`、`updated_at`、`segments: []`。

恢复后的显式模式请求优先于最后一段的 mode；显式新主题走第 5 步，不把旧证据归到新主题。日志是 segments 的事实来源，上下文副本只是缓存。

## 2. Resolve Target

只在新会话、首次补充目标或明确换主题时运行入口的目标解析规则。后续消息默认是对当前问题的回应，不逐轮重新分类。

- 目标类别与文件交接必须读取 `references/target-parsing.md`。显式目标优先；没有时恢复日志 context，其次为 true 的 pending，再用入口的档案候选顺序选一个小目标。
- pending 恢复的是动作，不只是焦点：`pending_feynman_handoff` → 加载 `feynman`，设置 `mode: feynman` 并使用对应 focus；`pending_transfer_phase` → 设置 `context.activity: transfer`，使用对应 focus，按第 3 步执行学科迁移。两者同时为 true 且日志没有可判定的最新选择时问一句，不猜优先级。用户本条显式模式/动作请求优先于 context 和 pending；pending 不能覆盖显式选择，清理已被替代的 pending。
- 消费 pending 时先把对应动作、目标和材料写进日志 context，真正接上后才清空该对 pending 字段；后续恢复以 context.activity/mode 保持动作，不回到普通教学。迁移完成后 activity 回到 teaching。
- 文件目标由 `learn-errors` 处理一次。它负责自我诊断问答、文件安全与写回；入口不重复提问或分析。处理后按共享分类器归为具体学科目标，设置 `files_processed: true`，保留当前 extracted 引用与原意图；不把未处理的旧路径再次传给路由器。
- 把快照中的个性化输入交给学科：共享 `personal`，科目 `profile.preferences` / `profile.self_report`，以及 memory 的相关支架、动机、困难和下一步。使用边界遵循 `learn-core`。
- 解析目标、选择迁移或切模式后立即持久化日志 context；每轮同步最新 focus、mode、activity、target_context、材料引用与必要待答问题/迁移阶段。粘贴材料无文件来源时可保存在 context.materials，已有 extracted 时仅留引用。恢复读取引用，不重新识别已处理 raw。

## 3. Route And Record

- 数学普通教学 → `math-session`；`context.activity: transfer`（包括 pending 恢复）→ `math-student-problem`。
- 语文 → `chinese-session`；activity 为 transfer 且来源为阅读时传 `intent: transfer_read_write`；来源为写作时传 `type: writing_draft`、`intent: revise_writing`，由路由器确定学科 mode。迁移来源、已提取技巧与当前阶段从 context 恢复；不足时先补问，不重新启动一遍迁移。
- 学科未安装：说明需要 `dsh-edu-math-low` 或 `dsh-edu-chinese-reading`，停止教学路由，保留已有日志。

交付 `student_id`、`subject`、最新学生消息、`target_context`、`focus`、`mode`、有效快照和个性化输入。学科只生成学生可见回复与一个 segment；内部诊断、桥接等结果并入该 segment，不额外记一轮。

本流程把 segment 按 `learn-data` 的 Session Segments 契约追加到日志，更新 `updated_at` 并立即写回。记录学生已经发生的表现，尚未回答的问题不算掌握证据。写入失败时说明未保存并保留待写内容，不继续覆盖日志。教学中仅写日志和 pending 状态；其他写入按数据协议中的显式例外处理。

## 4. Continue Or Change Mode

结束、歧义、危机与换主题的判断唯一遵循 `learn-core` 的 `references/session-end-signals.md`。每条学生消息先检查这些信号，再决定是否开展新教学；结束消息不需要额外教学或虚构 segment。

- 继续：选择一个小的 next step，等待学生回应，再回第 3 步；有效快照继续复用。
- 显式当小老师（含 `/feynman`）：加载角色规则，设置 `mode: feynman`、`context.activity: teaching`；沿用当前 focus 与材料，但清除仅用于迁移的 intent、turn_state 和 pending_transfer_*，不再路由学生出题/读写迁移。保留原 entry_point，不另建循环。
- 显式回到普通学习：设置 `mode: learn`、`context.activity: teaching`，同样退出当前迁移动作并清理专属进度/pending。无参数 `/learn` 恢复已有日志时沿用日志模式/动作，不视为显式退出。
- 显式选择迁移：设置 `mode: learn`、activity 为 transfer，并记下来源领域与阶段；清理已替代的 pending_feynman_*，写对应迁移 pending 供中断恢复，按第 3 步路由，完成后清空。

普通学习的下一步菜单按本 skill 的 `references/next-step.md`；费曼保持学生视角，只问继续讲、换一个点或结束，不在后台另造菜单或 segment。费曼角色与白名单规则由 `learn-core` 对应 references 定义。

## 5. Finalize Or Switch Topic

进入 finalize 时读取并执行 `learn-data` 的 `references/finalize-session.md`；这里不重复字段、patch、保留策略或幂等算法。

- 正常结束：用 `status: completed` 保存；成功后结束活跃循环。
- 明确换主题：用 `status: interrupted`、`interrupted_at`、`last_topic` 保存旧主题；成功后新建日志，按入口目标规则解析新目标，保留当前 mode。旧主题为空时不写空 summary，直接开新主题。
- 提交失败：保留日志与当前会话身份，说明“这次没有保存成功”，可用 `/save` 重试；旧主题未保存成功前不覆盖日志开新主题。仅日志清理失败时遵循 finalize 的已提交分支，重试清理，不重新累计记录。
- 危机：按安全流程停止教学，不 finalize 或记录危机细节。

同一日志始终只有本流程这一处追加和结束路径。`/save` 是显式保存入口，直接使用同一 finalize 协议，不另开教学循环。
