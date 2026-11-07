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

- `context` 对旧日志可选。新会话和恢复后的会话在目标确定、模式或 activity 变化、以及每一轮之后都写入。这里的 `mode` 是交互模式（`learn` / `feynman`），和学科 segment 自己的 mode 不是一回事。
- `activity`：`teaching` / `transfer`。普通教学的 `turn_state` 保存 `current_task`（当前题原文）、`response_format`（作答要求）、`student_response`（已收到的回答，未答为 null）、`pending_question`（最新待答问题，已无则 null）。新题替换当前题及回答；解释追问仍保留原题与答案。恢复时先核对本条消息，再接最新待答问题。迁移把来源领域、已提取手法、当前阶段、轮次和待答问题也放在 `turn_state`，恢复时不重启阶段。
- `target_context` 的形状、文件处理标记和引用见 `references/target-parsing.md`。`materials` 只在没有持久文件时存放必要的粘贴文本、草稿或作答；已有文件用工作区引用。不把危机或私人经历写在这里。
- 没有 `context` 的旧日志：恢复最后一段，缺材料或意图就问，不推断。已有 `error_history` 里的 extracted 引用可以读，不重新处理 raw。
- `finalize_plan` 只由 `references/finalize-session.md` 定义。计划未完成时，先做完保存，再教学、改档案或写错题。
- `/learn` 与 `/learn-feynman` 都经 `references/session-lifecycle.md` 追加唯一的学科 segment 并更新 context。Finalize 提交四个科目文件后，再清 segments、context 和 plan。

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
- `mode`：`learn` / `feynman`。学科包可以增加自己的 segment mode，并写在学科文档里。
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
