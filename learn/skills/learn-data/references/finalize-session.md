# Finalize Session

执行前读取本 skill 的 `references/profile-schema.md`、`references/session-schema.md`、`references/session-retention.md` 和 `learn-core` 的 `references/feynman-skill-whitelist.md`。将 `session_segments` 汇总为科目档案、诊断历史、记忆、当前状态、里程碑五个 patch，合并写入四个科目文件后清空日志。

## Inputs

```json
{
  "student_id": "stu_xxx",
  "subject": "subject_id",
  "session_id": "sess_20261004_1200",
  "session_segments": [],
  "status": "completed",
  "interrupted_at": null,
  "last_topic": null,
  "entry_point": "learn"
}
```

规则：

- `student_id`、`subject`、`session_id`、`session_segments` 必填。
- `status` 只能是 `completed` 或 `interrupted`，默认 `completed`。
- `status = "interrupted"` 时，`interrupted_at` 与 `last_topic` 必填。
- `entry_point` 取 `learn`、`learn-feynman`、`learn-save` 之一。
- `session_segments` 优先从 `session_log.json` 读取；模型上下文中的副本只是缓存。

## Idempotency Gate

1. 读完整 `session_log.json` 与 `current_state.json`，验证 student/subject/session_id 与本次保存一致。
2. `last_finalized_session_id` 相同表示四个科目文件已提交：不重复写科目文件或累计错误。若同一日志仍有 segments/context/support_events/finalize_plan，只清理这些已提交的临时内容；已选 recommendation 不是旧教学残留，按 Cleanup 保留；清理失败说明“学习记录已保存，日志清理未完成”，下次重试清理，不误报学习数据未保存。
3. marker 不同且日志有匹配的 `finalize_plan`：直接执行下节的 Commit And Recovery，不重新生成 summary/patch、不在半写入文件上再次前插或计数。
4. marker 不同且无 plan：继续 Process。旧日志/文件形状均兼容，只有新 finalize 才产生 plan。

## Process

1. 读日志的 `support_events`（旧日志缺失视为空数组）；先校验 plan 事件的 student_requested_save 为 true，或 correction 事件有学生明确更正请求。若 segments 与 support_events 都为空：返回 `nothing_to_finalize: true`，不要写长期文件。只有临时支持且正在结束/换题时，由生命周期清 context，不假称保存了长期计划。返回形状见 No-op。非空则按下节分类准备，不为支持或通用记录造专门表现。
2. 先按“表现分流与非表现保存”分类；无 specialist 段时跳过本节 3–9 的专门汇总，直接以隔离通用/支持分支的结果进入第 10 步。有 specialist 段则选最终焦点：取最后一个该类 segment 的 `focus`；若中断，取 `last_topic`。
3. 汇总 `overall_performance_code` / `overall_performance_text`：取最保守/最低的档位，并写一句综合描述。
4. 汇总 `strategy_summary`：合并各段，不超过 2-3 句。
5. 合并 `strengths` / `difficulties`：去重，各保留 3-5 条。
6. 汇总 `recommended_targets`：去重，保留 1-3 个。
7. 生成 `next_step`：优先最后一段的 `next_step_candidate`。
8. 生成 `final_summary`。
9. 生成五个 patch（见下）；科目档案和诊断历史两个 patch 合并进同一个科目 profile 文件。
10. 读取四个完整科目文件，在内存中合并为四份最终 JSON；先执行下面的 Commit And Recovery，禁止边生成 patch 边写科目文件。
11. 提交成功后按 Cleanup 清理日志。
12. 告诉学生一句简短总结。

## 表现分流与非表现保存

准备 plan 前按 teaching.evidence_namespace 分流（旧段无字段按 specialist）：

普通聊天、家庭和情绪自述不是表现或计划事件，也不形成稳定支持观察；即使反复出现也不自动提炼为长期兴趣、偏好或心理标签。交流选择与 declined 仅用于临时恢复，不写入长期档案。没有有效段或事件则走 No-op，不写四个科目文件；结束时仅由生命周期清临时日志。若先前确有教学表现或明确请求保存的 support_events，则仍按原证据与白名单保存，不把后续聊天混进摘要，也不迁移或删除既有证据。共享目标/偏好变更只交 `/learn-start` 或 `/learn-profile`，不能借支持保存旁路修改。

- specialist 段才参与既有 final_summary、subject_profile_patch、error_history、confirmed_skills、current_levels 和里程碑流程；本文件其他合并步骤只以这些段为输入。
- general_v1 段仅前插 memory.general_progress，字段白名单为 session_id、date、subject、scope_id、teaching、focus、strategy_summary、ability_evidence、next_step、target_context 与材料引用 material_refs；target_context/material_refs 从匹配 context 取得并保留学生原意图，不复制 raw 或敏感内容。没有持久来源的粘贴原文不写长期 memory，接续时必要材料缺失须重新提供；源为实际段，不含专门诊断、等级或确认技能。按 session_id + scope_id 去重，使用保留策略；不参与专门掌握或学科 summary。有实际表现时必须写 current_state 的 active_focus、source、submode、teaching 与 scope_id 作为接续游标：按时间最后一个真实表现段决定当前范围，混合记录也使用该最后一段的实现和 scope；不能被稍后的纯支持事件覆盖。若最后一段为通用，以对应 general_progress 接续；最后一段为专门，则走专门候选链。
- support_events 中 kind: plan 且 student_requested_save: true 的事件写 memory.learning_support_memory.plans，只收 id/date/scope_id/summary/source；不更新表现、错误、等级或里程碑。kind: correction 按下面规则执行。
- 没有 specialist 段时 final_summary 为 null，plan 增加 `record_kind: support_only`（仅支持事件）或 `record_kind: general`（有通用段）。保留 profile、milestones 的原镜像，不插入空的学科会话摘要。只有计划时不覆盖 current_state 的 active_focus/source/submode；只更新 marker 与 updated_at。混合记录使用 `record_kind: mixed`，specialist 的摘要也只根据 specialist 段。
- 所有分支仍准备四份完整镜像，按原顺序提交，marker 最后。没有专门表现不是 no-op 的充分条件；没有任何有效段/事件才 no-op。回放同一 plan 用相同镜像，不重新汇总或计数。
- 清理时同时清 `support_events` 和临时 learning_support（随 context 清除）；日志清理失败保留全部未清内容供幂等重试，不重新追加计划。结果应区分“学习计划已保存”“通用任务进度已保存”和“学科学习记录已保存”，不可将支持计划描述成掌握提升。

### 稳定观察与更正

长期支持观察落 memory.learning_support_memory.observations，条目含 id、date、scope_id、source、observation、support_used、evidence_refs、status。仅在跨次可追溯事实支持且对后续教学有用时由 finalize 汇总，不单凭重复次数形成稳定判断；没有依据就不新增。source 为 student_statement / observed_action，status 为 historical / superseded。近期仍适用也先向当前任务核对，不当作永久心理特征；旧无来源 motivation_signals 保留但不扩大解释。

学生明确更正已保存计划或观察时，生命周期在 support_events 中加入 `{id,date,scope_id,kind:correction,target_id,target_collection,summary,source:student_statement}`（日志用合法 JSON），target_collection 仅 plans / observations；只允许当前学生/科目的目标。Prepare 前核对目标唯一存在：计划按 target_id 更新为学生确认的中性内容并保留原id、更新日期；观察标为 superseded，保存必要更正说明，不留敏感原话。重复 target 或找不到则问清，不静默替换。更正事件按自身 id 去重；与其他保存同镜像重放。尚无日志时由生命周期建立支持日志，不能由 profile 技能旁路写 memory。

## Commit And Recovery

文件仍采用单会话本地 read/write，不宣称跨文件事务。为使部分写入可安全重试，使用日志中的准备计划：

1. **Prepare**：在任何科目文件写入前，先将 `finalize_plan` 写入当前日志并确认成功。plan 包含匹配的 `session_id`、`student_id`、`subject`、`final_summary`，以及 `target_files` 下 `profile`、`memory`、`milestones`、`current_state` 四份完整最终 JSON。时间戳和错误计数在准备时确定；current_state 的最终镜像含本次 marker。目标路径由数据协议计算，不接收计划中的任意路径。
2. **Commit**：按 `profile → memory → milestones → current_state` 顺序逐一先读目标文件，再写计划中的最终镜像。marker 只能在最后一个科目文件中写入；四文件全部成功前不清日志。重试始终重放相同镜像，不能基于已部分写入的文件重新合并、重新前插历史或再次加错误计数。
3. **Failure**：准备计划失败时不写任何科目文件；提交途中失败时保留完整 plan 与 segments，明确未完成保存并停止新教学。下次 `/learn-save` 或恢复优先重放该 plan。持有 plan 期间同一学生/科目不得执行新的 `/learn-profile` 编辑或 `learn-errors` 写入；先完成/恢复保存，不覆盖中途外部修改。若发现人工修改冲突，停止并请用户选择恢复方式。
4. **Cleanup**：marker 写成功后，清空 segments 与 support_events、移除 context、finalize_plan 与未选 recommendation；日志保留 `session_id`、`entry_point`、`started_at`、`updated_at` 与 `segments: []`。若 recommendation 已有合法 selected_id，则原样保留该对象（含 mode）直到生命周期成功写入新目标 context；它不参与 summary/patch。明确结束或取消由生命周期清除它。此时重试只做清理，不重复写科目数据。下一次 `/learn` 新建会话并承接已选目标；仅 `/learn-save` 不自动开始新教学。

该计划只存在当前未完成日志中，用于顺序写入失败后的重放，不提供多进程锁或任意文件损坏恢复。

## final_summary

形状是 `references/profile-schema.md` 的 Session Summary Entry。中断时 `status` 为 `interrupted`，并写 `interrupted_at`、`last_topic`；完成时 `status` 为 `completed`。

## subject_profile_patch

`current_levels` 嵌在 `profile` 下，不要写成顶层。只合并有变化的字段。

- `profile.current_levels` 只在有证据时更新；不确定时保留原值。证据来自 segment 的 `current_levels` 或 `diagnosis`。键名由学科包定义。空对象只说明字段位置，不要用它覆盖已有水平。
- 空 `session_history` 仅占位；前插上节生成的最新 `final_summary`，保留中断字段，按 `references/session-retention.md` 保留旧记录。
- `learning_state` 只覆盖 patch 中出现的字段。`mastered_topics` 的加入门槛见 `references/profile-schema.md` 的 Subject Memory。

## error_history_patch

Every segment with a `diagnosis` object produces one diagnosis entry. File-based errors are written by `learn-errors`, not here.

`error_history` 条目采用 `references/profile-schema.md` 的 Diagnosis entry：`source: diagnosis`、当前 `date`、`analyzed: true`，其余字段从 segment 的诊断和下一步生成。

规则：

- `error_id` 用 `diag_<YYYYMMDD>_<3位序号>`；同一天按已有 `diag_` 记录递增。
- `label` 必须是当前学科标签表里的值。本文件不列举标签。
- 前插最新条目，上限按 `references/session-retention.md`。
- 多个 segment 同一标签时只写一条，保留最新证据和 `next_step`。
- `priority_targets` 从最新 `diagnosis` 与 `next_step` 中去重选取，条数按 `references/session-retention.md`。

## memory_patch

按 `references/profile-schema.md` 的 Subject Memory 合并。没有新观察时不改 `profile_memory`。

合并规则：

- 按 segment 时间顺序处理 `confirmed_skills` 与 `skill_errors_observed`。确认门槛、错误计数和撤销/再确认完全遵循 `learn-core` 的 `references/feynman-skill-whitelist.md`；不要在 finalize 另设一套阈值。
- 达到确认条件的技能名转成 `{ "skill", "domain", "confirmed_at" }`，按 `skill` 去重；错误计数持久化为 `{ "skill", "error_count", "last_error_at" }`。撤销后的旧确认不得被无序合并重新加入。
- `feynman_readiness` 取 `unknown` / `ready` / `not_ready`。
- `preferred_scaffolds`、`expression_traits` 仅在可追溯稳定模式时更新。旧 motivation_signals 保留为历史参考；新的支持观察写 learning_support_memory.observations，不能新增无来源心理标签。下一轮使用前核对任务情境和学生更正。
- `material_difficulty`：取 `session_log.json` 的 `context.difficulty_request`，原样写入 `profile_memory.material_difficulty`；没有请求时保留原值。它记录呈现偏好，不改 `current_levels`，也不作为掌握证据。

## current_state_patch

按 Current Learning State 模板覆盖本次要改的字段。

- 写入 `last_finalized_session_id` 作为幂等标记。

## milestones_patch

形状与 `type` 枚举见 `references/profile-schema.md` 的 Milestones。

规则：

- 先合并重复 focus，保留最近一次。
- 排序、上限和超限压缩按 `references/session-retention.md`。
- 只记录长期有意义的变化：策略阶段变化、主题掌握、反复成功、明显跃迁。

## No-op

```json
{
  "success": true,
  "nothing_to_finalize": true,
  "already_finalized": false,
  "writes": [],
  "final_summary": null,
  "subject_profile_patch": {},
  "error_history_patch": {},
  "memory_patch": {},
  "current_state_patch": {},
  "milestones_patch": {}
}
```

## Persistence Rules

- 每次完整学习会话写一条 summary；`learn -> feynman` 算一次完整会话。
- 只写四个科目文件：共享 `profile.json`（姓名、年级、兴趣、经历）与 `data/.../raw/` 都不在 finalize 写入范围内，不生成 `shared_profile_patch`。
- 提交失败与清理失败分别按 Commit And Recovery 处理。
