# Session Schema

每轮教学只需本文件：日志与 segment 的结构。档案、记忆、状态、错题与里程碑模板在 `references/profile-schema.md`，只在建档、初始化缺失文件和 finalize 时读取。

## Session Log

- Path: `outputs/students/<student_id>/<subject>/session_log.json`
- 未结束会话的事实来源。内存里的 segments 只是缓存。`segments` 的每一项是一则 Session Segment。

```json
{
  "session_id": "sess_20261004_1200",
  "entry_point": "learn",
  "started_at": "2026-10-04T12:00:00Z",
  "updated_at": "2026-10-04T12:18:00Z",
  "context": {
    "focus": "当前焦点",
    "mode": "learn",
    "activity": "teaching",
    "target_context": { "type": "topic", "topic": "当前焦点", "source": "manual_topic", "files": [], "intent": null },
    "materials": {},
    "turn_state": {}
  },
  "segments": []
}
```

- `context` 对旧日志可选。新会话和恢复后的会话在目标确定、模式或 activity 变化、以及每一轮之后都写入。这里的 `mode` 是交互模式（`learn` / `feynman`），与 segment 的 `mode` 同义；学科内部分支不写进 `mode`。
- `context.difficulty_request`（可选）保存学生最近一次明确的难度要求：`{ "direction": "easier" | "harder" | "standard", "note": "...", "requested_at": "..." }`。finalize 写入 `profile_memory.material_difficulty`；没有请求时省略。
- `activity`：`teaching` / `transfer`。普通教学的 `turn_state` 保存 `current_task`（当前题原文）、`response_format`（作答要求）、`student_response`（已收到的回答，未答为 null）、`pending_question`（最新待答问题，已无则 null）。新题替换当前题及回答；解释追问仍保留原题与答案。恢复时先核对本条消息，再接最新待答问题。迁移把来源领域、已提取手法、当前阶段、轮次和待答问题也放在 `turn_state`，恢复时不重启阶段。
- `target_context` 的形状、文件处理标记和引用见 `references/target-parsing.md`。`materials` 只在没有持久文件时存放必要的粘贴文本、草稿或作答；已有文件用工作区引用。不把危机或私人经历写在这里。
- 没有 `context` 的旧日志：恢复最后一段，缺材料或意图就问，不推断。已有 `error_history` 里的 extracted 引用可以读，不重新处理 raw。
- `finalize_plan` 只由 `references/finalize-session.md` 定义。计划未完成时，先做完保存，再教学、改档案或写错题。
- `/learn` 与 `/learn-feynman` 都经 `references/session-lifecycle.md` 追加唯一的学科 segment 并更新 context。只有实际学生表现才追加；其他轮次 segment 为 null，只写 context。Finalize 提交四个科目文件后，再清 segments、context 和 plan。

## 教学实现与支持状态

新 context 增加 `scope_id`（选定目标的稳定身份）与 `teaching`，结果及旧日志缺省规则只按 `references/teaching-resolver.md`。新 segment 也带同一 scope_id/teaching；旧段无此字段视为 specialist，不迁移改写。`activity` 另允许 `support`：纯支持时 focus、target_context 可为 null，turn_state 不造当前题；有真实任务时支持叠加其上，保留原 activity、材料、模式与待答题。

可选 `context.learning_support`：

```json
{
  "primary_need": "confidence",
  "status": "hypothesis",
  "evidence": [{ "source": "student_statement", "observation": "担心当前任务学不会", "date": "2026-11-09T08:00:00Z" }],
  "method": null,
  "observation_goal": "观察学生在最小提示后是否愿意尝试当前步骤",
  "outcome": { "statement": null, "participation": null, "task_performance": null },
  "resume_question": null
}
```

primary_need 为 value / confidence / autonomy / strategies / persistence；status 为 hypothesis / clarified / active / observing / declined。evidence.source 为 student_statement / observed_action，推断不能冒充事实，不能记录危机细节或无关私生活。outcome 三项分别是学生自述、参与及任务表现的中性观察，未知用 null；不是动机分或掌握度。普通聊天不生成 segment、掌握或里程碑，不把家庭、情绪和闲聊汇总为学习表现。

### 临时交流选择与恢复

复用 status 与 resume_question，不新增字段、朋友画像或关系分数：

- `resume_question` 为可选的最小中性续接文本或 null，不要求是实际问句。纯支持或有任务但先聊时可记“继续普通交流，等待学生主动重开学习”；只说明流程选择，不抄聊天原文、不记私人话题或拒绝原因。已有任务的待答题与恢复位置仍完整留在 turn_state，不能被此字段替换。
- `status: declined` 表示已拒绝当前邀请/讨论，不是低动机或能力标签。resume_question 可保留“先不讨论安排，继续交流”；仅拒绝某种支持但要继续做题时，清该续接文本，保留 declined 对同一讨论的限制。直到学生主动重开，或新目标出现明确新需求，才重开相应支持；闲聊、兴趣线索与时间流逝不重置拒绝。
- 恢复时沿用 identity、teaching、scope_id、focus、材料、mode/activity、turn_state 与最小交流选择；不自动回题、补推荐或再次邀请。activity 为 support 时仍允许无目标交流；叠加支持则由 resume_question 的流程含义识别先聊选择，不因原 activity 为 teaching/transfer 就忽略它。不因恢复、短答或空消息推断意愿变化。
- 缺失 learning_support 的旧日志不补造拒绝或交流选择；缺失 status 按未知处理，缺失 resume_question 视为 null。旧 activity: support 仍先核对本条意图，不强制生成学习目标；已有 declined 即使无续接文本也保留同一讨论的拒绝。只有与当前目标有关的必要事实才写临时状态，一般话题无需写日志。

日志顶层可选 `support_events`，只在学生明确要求长期保存具体中性计划时加入：

```json
{
  "id": "plan_20261109_a3f2",
  "date": "2026-11-09T08:00:00Z",
  "scope_id": "scope_a3f2",
  "kind": "plan",
  "summary": "下次先独立回忆一个例子，再核对材料",
  "student_requested_save": true,
  "source": "student_statement"
}
```

该例是一项事件，support_events 为其数组；id 在写日志前生成，重试沿用。没有明确保存意愿不创建事件。事件不进入 segment、diagnosis 或 confirmed_skills；finalize 只将白名单字段写入 memory.learning_support_memory.plans。纯支持仍持久化最小 context 以便恢复，长期计划保存与恢复状态写入分别报告。

`ability_evidence` 是新 segment 可选数组，每项 `{kind, observation, conditions}`；kind 为 independent / supported / ai_collaboration / exposure。独立能力、支持下表现、AI 协作能力按任务目标评价，不排成单一等级；观看 AI 结果仅 exposure。不能用参与意愿或作品整齐代替掌握证据。general_v1 的表现只进入隔离通用历史，不更新专门等级；旧段缺字段不推断补填。

## 临时学习推荐

日志顶层可选 `recommendation`，独立于教学 context，尚无目标时也可存在：

```json
{
  "subject": "subject_id",
  "mode": "learn",
  "preferred_id": "r1",
  "candidates": [
    {
      "id": "r1",
      "focus": "一个具体小目标",
      "target_context": { "type": "topic", "topic": "一个具体小目标", "source": "manual_topic", "files": [], "intent": null },
      "reason": "适合现在学习的中文理由",
      "basis": "已有记录支持的事实或探索性说明"
    }
  ]
}
```

新 recommendation 可选带 teaching；候选可带 subject、scope_id、teaching，跨领域候选必须有目标 subject 或中性任务身份与明确目标描述。subject 顶层始终是发起推荐的原身份，防止跨科误消费。已有合法选择先保存在原日志，新目标 context 成功写入后才消费；实际切换按生命周期处理。跨科推荐的 transition 和 session.pending_transition 形状及恢复/清理顺序只按 `references/teaching-transition.md`。旧对象缺扩展字段时仍按当前科目处理。

`mode` 保留发起推荐时的模式，供无教学 context 时恢复；已有 context 时以 context.mode 为准。选定后可选 `selected_id` 必须对应一个候选，由生命周期在 finalize 前先持久化；它表示学生已经授权的目标，不能由首选标记或跳过推导。候选 id 在同一份推荐中唯一，preferred_id 必须对应其中一个；target_context 遵循目标分类契约，不复用不相关旧材料。该对象仅供中断恢复选择，不是已选 focus，也不是 segment 的 recommended_targets。由 `learn-recommend` 形成，生命周期写回；推荐期间保留旧 context 与 segments，选择/拒绝不生成表现。选定目标写入 context 成功后、取消或结束时清除。最终保存不把推荐对象汇总进档案；清理日志时移除未选推荐，保留已有 selected_id 的推荐直至新目标 context 写入成功，用于保存失败后的恢复。仅保存不自动开始新教学。没有此对象的旧日志照常恢复，不迁移旧档案。

## Session Segment

教学 skill 产出，由 `/learn` 或 `/learn-feynman` 追加：

```json
{
  "focus": "当前焦点",
  "subject": "subject_id",
  "mode": "learn",
  "submode": "practice",
  "source": "profile",
  "overall_performance_code": "basic_independent",
  "overall_performance_text": "基本独立完成，个别步骤需要提示",
  "strategy_summary": "学生说明了自己的做法，有一处关系还需要提示",
  "strengths": ["能说出一个具体理由"],
  "difficulties": ["有一处关系还不稳定"],
  "next_step_candidate": "用一个近邻任务再试一次",
  "recommended_targets": ["同一个关系的近邻任务"],
  "confirmed_skills": ["示例技能"],
  "skill_errors_observed": ["示例技能"],
  "feynman_handoff_recommended": true,
  "diagnosis": {
    "domain": "subject_domain",
    "label": "subject:example_label",
    "evidence": "学生只复述了步骤，没有说明这一步为什么成立。"
  },
  "current_levels": {}
}
```

必填：`focus`、`subject`、`mode`、`submode`、`source`、`strategy_summary`、`strengths`、`difficulties`、`next_step_candidate`、`recommended_targets`。

枚举：

- `subject`：入口写入的 id。本文件不列举科目。
- `mode`：`learn` / `feynman`，沿用调用方的交互模式，学科包不扩展。学科内部分支另用学科字段记录，写在学科文档里。
- `submode`：`learn` / `practice` / `review` / `feynman`。学科包可以增加取值。已存的旧值保留，不在这里新造。
- `source`：`profile` / `manual_topic` / `error_analysis` / `diagnosis` / `practice` / `save` / `focus`。学科包可以增加。
- `error_history.source` 另算：`file_analysis` / `diagnosis`。

可选，且例子表达不了的约束：

- `overall_performance_code`：`needs_support` / `basic_independent` / `stable` / `flexible`。`overall_performance_text` 是自由文本。
- `confirmed_skills`：技能名字符串。证据与撤销见白名单；finalize 转成 `references/profile-schema.md` 的 Subject Memory 对象。
- `skill_errors_observed`：学生真实错误的技能名，不是 AI 故意犯的错。
- `feynman_handoff_recommended`：交给 `/learn-feynman`。
- `diagnosis`：一个主标签加证据。标签表属于学科包。
- `current_levels`：`profile.current_levels` 的部分更新，finalize 嵌回 `profile`。键属于学科包。
- 学科包可以加别的字段。Finalize 保留不认识的字段，不在这里解释。
