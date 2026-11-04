---
name: learn-data
description: 学生数据的唯一读写协议：outputs/students/ 目录、当前会话、共享/科目档案、memory、current_state、milestones、会话日志的读取、初始化、合并写回与结束会话 finalize。入口 skill 和学科 skill 在读写学生数据前加载它。
user-invocable: false
---

# Learn Data

## Purpose

DSH 的学生数据层。所有学生数据都是工作区 `outputs/students/` 下的 JSON，用 `read` / `write` / `glob` / `bash` 直接操作。本 skill 是路径、字段、合并规则和 finalize 的唯一来源。

## When To Use

- `/start`、`/learn`、`/feynman`、`/profile`、`/save` 开始前。
- 任何需要读取或写回学生档案、记忆、当前状态、里程碑、错题历史、会话日志的学科 skill。
- 会话结束时执行 finalize。

## Data Root

所有路径相对于**当前工作区根目录**。`outputs/` 是通用输出根目录；学生数据固定在 `outputs/students/`。

```
outputs/students/
  session.json
  <student_id>/
    profile.json
    math/
      profile.json
      memory.json
      current_state.json
      milestones.json
      session_log.json
      raw/
      extracted/
      backups/raw/
    chinese/
      ... 同上
```

- `student_id` 形如 `stu_<slug>_<4hex>`；`slug` 只含 `[a-z0-9_]`，`4hex` 是 4 位 `[0-9a-f]`。
- 不使用索引文件；用 `glob outputs/students/*/profile.json` 发现学生，再读每个 `profile.json`。
- `raw/` 是原始错题区：只读，只能 `mv` 改名；不得 `write` / `edit` / 删除内容。
- `backups/raw/` 是原件的写前备份，只增不改。

## Read Snapshot

每轮开始按顺序读取：

1. `outputs/students/session.json`
2. `outputs/students/<student_id>/profile.json`（共享档案）
3. `outputs/students/<student_id>/<subject>/profile.json`（科目档案）
4. `outputs/students/<student_id>/<subject>/memory.json`
5. `outputs/students/<student_id>/<subject>/current_state.json`
6. `outputs/students/<student_id>/<subject>/milestones.json`
7. `outputs/students/<student_id>/<subject>/session_log.json`（可能不存在）

缺文件时：

- `session.json` 缺失或 `student_id` 为空：告诉学生先运行 `/start`。
- 共享档案缺失：学生选择的名字在目录里不存在，转 `/start` 建档，不要凭空生成。
- 科目 `profile.json` 缺失：按 `references/profile-schema.md` 初始化；初始化前先确认共享档案存在。
- `memory.json` / `current_state.json` / `milestones.json` 缺失：按 `references/profile-schema.md` 的默认值创建。
- `session_log.json` 缺失：视为没有未完成会话。

读取后：

- 在内存中保留快照；只有本轮写回过文件或切换学生/科目时才重读。
- 把共享档案的 `personal.interests`、`personal.most_exciting_event` 和科目档案的 `profile.preferences`、`profile.self_report.easy_topics/hard_topics` 作为个性化输入交给教学 skill。
- 读 `memory.json` 的字段并按 `references/profile-schema.md` 的“How Memory Is Consumed”使用：`preferred_scaffolds`、`motivation_signals`、`recent_error_patterns`、`recommended_next_moves`、`feynman_readiness`。不要只写不读。

## session.json

`student_id` 在“已选科目、还没选学生”的过渡状态允许为 `null`；读取时视为空，引导 `/start`。

```json
{
  "student_id": "stu_li_ming_a7k2",
  "subject": "math",
  "last_active": "2026-10-04T12:00:00Z",
  "session_started_at": "2026-10-04T11:30:00Z"
}
```

- `subject` 只能是 `math` 或 `chinese`。
- 切换学生或科目时，整文件覆盖写。
- 切换当前学生：读旧 session，写新的 `student_id`、`subject`、`last_active`；若 `student_id` 为 `null`，只保留科目并清空学生。

## Create Student

在 `/start` 的入学问答收齐信息后执行：

1. 生成唯一 `student_id`：姓名转小写拼音或英文 slug，加 4 位随机 hex；用 `glob outputs/students/*/profile.json` 取出已有 id 检查不重复（`glob` 只返回文件，不要用 `outputs/students/*` 列目录）。
2. 写共享档案 `outputs/students/<id>/profile.json`：

```json
{
  "student_id": "stu_li_ming_a7k2",
  "name": "李明",
  "grade": 4,
  "grade_band": "upper_primary",
  "language": "zh-CN",
  "personal": {
    "interests": ["阅读", "绘画", "踢足球"],
    "most_exciting_event": "参加学校运动会并获得第一名",
    "most_sad_event": "宠物小狗生病去世了"
  },
  "created_at": "2026-10-04T12:00:00Z",
  "updated_at": "2026-10-04T12:00:00Z"
}
```

3. 写当前科目的 `profile.json`、`memory.json`、`current_state.json`、`milestones.json`、`session_log.json`：
   - 模板见 `references/profile-schema.md`。
   - `tone` 与 `learning_state.active_domain` 按 `learn-core` 的 `references/grade-band-defaults.md` 按年级段选择，不要照抄示例里的 upper_primary 值。
   - `profile.preferences` 全部先写 `false`，由 `/start` 把学生选中的那一项设为 `true`。
   - `profile.self_report.easy_topics` / `hard_topics` 两个科目统一用这组字段名。
4. 写 `outputs/students/session.json` 激活该学生与科目。
5. 用 `bash` 创建目录：`mkdir -p outputs/students/<id>/<subject>/raw outputs/students/<id>/<subject>/extracted outputs/students/<id>/<subject>/backups/raw`。
6. 告诉学生建档完成，下一步用 `/learn`。

年级段：

- 1-3 年级 → `lower_primary`
- 4-6 年级 → `upper_primary`

默认领域、语气、策略阶段以 `learn-core/references/grade-band-defaults.md` 为准。

## Write Protocol

DSH 的 `write` 要求先读目标文件。每次写入遵循：

1. `read` 完整文件（不存在则用模板）。
2. 在内存中按字段合并；对象递归合并，数组按流程要求替换或前插，不做隐式去重。
3. 更新 `updated_at` 为当前 ISO 时间。
4. `write` 完整 JSON；不要写片段、不要留下注释、不要写非法 JSON。
5. 写完在回复中只告诉学生“已保存”或摘要，不展示原始 JSON。

文件区分（不要混）：

- **共享** `outputs/students/<id>/profile.json`：姓名、年级、`personal`。只由 Create Student、`/start` 和 `/profile` 写。
- **科目** `outputs/students/<id>/<subject>/profile.json`：`tone`、`profile.*`、`learning_state`、`error_history`、`session_history`。由 finalize、`/profile`、`learn-errors` 写。

合并规则：

- **共享** `profile.json`：保留未提及字段；不改 `student_id`、`created_at`。
- **科目** `profile.json`：保留未提及字段；`session_history` 前插最新一条，截断到 5 条；`error_history` 前插最新记录，截断到 20 条。
- `profile.current_levels`：嵌套在 `profile` 下，不要写成顶层 `current_levels`。
- `memory.json`：`profile_memory` 与 `learning_memory` 分别合并；`confirmed_skills` / `skill_errors` 按 `skill` 去重；`updated_at` 更新。
- `current_state.json`：按 patch 字段覆盖；不保留旧版斜杠命令字段。
- `milestones.json`：`milestones` 数组合并重复 focus 后按 `importance`、再按时间排序，最多 20 条。

写入并发假设：单学生、单会话、本地文件；不做跨进程锁。不要并发写同一个文件。

## Finalize

会话结束（显式结束、目标达成、AI 判断、中途换主题）时执行。详细字段与示例见 `references/finalize-session.md`。

1. **幂等检查**：读 `current_state.json` 的 `last_finalized_session_id`；与本次 `session_id` 相同则返回 `already_finalized: true`，不写文件，告诉学生“这次已经保存过了”。
2. 汇总 `session_segments`（优先读 `session_log.json`）；为空则告诉学生没有可保存的内容，停止。
3. 生成 `final_summary`：`session_id`、`date`、`entry_point`、`focus`、`overall_performance_code/text`、`strategy_summary`、`strengths`、`difficulties`、`next_step`、`recommended_targets`、`status`；中断时加 `interrupted_at`、`last_topic`。
4. 生成五个 patch：
   - `subject_profile_patch`：`updated_at`、`profile.current_levels`（如有）、`learning_state.active_domain`、`developing_topics`、`priority_targets`、`session_history` 前插。
   - `error_history_patch`：把每个 segment 的 `diagnosis` 转成 `error_history` 诊断条目（`source: "diagnosis"`）。
   - `memory_patch`：`recent_focus`、`recent_modes`、`recent_error_patterns`、`recommended_next_moves`、`feynman_readiness`、`confirmed_skills`、`skill_errors`。
   - `current_state_patch`：`active_focus`、`source`、`submode`、`entry_point`、`last_finalized_session_id`，清空四个 pending 字段。
   - `milestones_patch`：把被挤出的旧 session 信息压缩进里程碑，带 `importance`。
5. 读完整文件 → 合并 → 写回四个科目文件。
6. 不写共享 `profile.json` 的姓名、年级、兴趣、经历字段；不生成 `shared_profile_patch`。
7. 保留 `session_history` 最新 5 条、`error_history` 最新 20 条、`milestones` 最多 20 条。
8. 清空 `session_log.json` 的 `segments`，写入新的 `updated_at`。
9. 给学生一句简短总结，并说明已保存。

中途换主题：

- 先以 `status: "interrupted"`、`interrupted_at`、`last_topic` finalize 当前段。
- 生成新的 `session_id` 和新的 `session_log.json`，再开始新主题。
- 不要丢掉旧段的 `strengths` / `difficulties`。

## Session Segments

会话进行中，每轮把 segment 追加到内存和 `session_log.json`；profile/memory 只在 finalize 写。每个 segment 至少包含：

```json
{
  "focus": "异分母分数加法",
  "subject": "math",
  "mode": "learn",
  "submode": "practice",
  "source": "profile",
  "strategy_summary": "学生用画图分蛋糕理解通分",
  "strengths": ["能主动画图表示"],
  "difficulties": ["通分时偶尔分母乘错"],
  "next_step_candidate": "继续练异分母加法",
  "recommended_targets": ["异分母减法"],
  "feynman_handoff_recommended": true,
  "confirmed_skills": ["通分"],
  "skill_errors_observed": ["异分母加法"],
  "diagnosis": {
    "domain": "fractions",
    "label": "fractions:denominator_confusion",
    "evidence": "把分子分母分别相加。"
  },
  "current_levels": {
    "fraction_strategy_stage": "equal_sharing_additive"
  }
}
```

- `mode` 取 `learn` / `feynman` / `diagnose` / `start` / `revise` / `assess`。
- `submode` 取 `learn` / `practice` / `review` / `feynman` / `student_problem` / `read_write_transfer` / `generate_tasks` / `experience_bridging`。
- `source` 取 `profile` / `manual_topic` / `error_analysis` / `diagnosis` / `practice` / `reading` / `writing` / `save` / `focus`。
- `error_history.source` 另取 `file_analysis` / `diagnosis`。
- `confirmed_skills` / `skill_errors_observed` 写技能名字符串；finalize 转成 memory 对象。
- `diagnosis` 是可选字段；有它时 finalize 写一条 `error_history` 诊断条目。
- `current_levels` 是可选的部分更新；finalize 嵌套到 `profile.current_levels`。

## Retention

- `session_history`：最新 5 条，最新在前。
- `error_history`：最新 20 条。
- `milestones`：最多 20 条，按 `importance` 再按时间。
- 旧会话不要原样保留；合并重复 focus，把稳定进步、阶段变化、主题掌握提升写入 milestones。

详细规则见 `references/session-retention.md`。

## Privacy

- 不把 `profile.json` / `memory.json` 的原始 JSON 展示给学生。
- `personal.interests` 用于例子、阅读角度、写作题目和搭桥；不要把它变成对学生的刻板判断。
- 不把学生的难过经历、家庭信息主动复述；只在搭桥时轻量使用。学生不想说时立即停止。
- 不把学生数据写入工作区之外的位置。
- 不删除学生档案、错题或里程碑，除非学生明确要求并再次确认。

## References

本 skill 的所有 `references/...` 路径都相对于加载结果给出的 base directory。

- `references/profile-schema.md`：完整 schema、默认值、模板、memory 消费方式。
- `references/finalize-session.md`：finalize 字段、示例、幂等、保留策略。
- `references/session-retention.md`：会话与里程碑压缩规则。
