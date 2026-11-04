---
name: learn-data
description: 学生数据的唯一读写协议：outputs/students/ 目录、当前会话、共享/科目档案、memory、current_state、milestones 的读取、初始化、合并写回与结束会话 finalize。入口 skill 和学科 skill 在读写学生数据前加载它。
user-invocable: false
---

# Learn Data

## Purpose

把 Pi 里由工具完成的学生数据读写改成 DSH 的 `read` / `write` / `glob` 文件协议，直接操作工作区里的 `outputs/students/` JSON。

## When To Use

- `/start`、`/learn`、`/feynman`、`/profile`、`/save` 开始前。
- 任何需要读取或写回学生档案、记忆、当前状态、里程碑、错题历史的学科 skill。
- 会话结束时执行 finalize。

## Data Root

所有路径相对于**当前工作区根目录**。`outputs/` 是通用输出根目录；学生数据固定在 `outputs/students/`，后续其他产物可放 `outputs/reports/`、`outputs/lessons/` 等。

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
      raw/
      extracted/
    chinese/
      ... 同上
```

- `student_id` 形如 `stu_<slug>_<4hex>`；`slug` 只含 `[a-z0-9_]`，`4hex` 是 4 位 `[0-9a-f]`。
- 不使用索引文件；用 `glob outputs/students/*/profile.json` 发现学生，再读每个 `profile.json`。
- `raw/` 是原始错题区：只读，只能 `mv` 改名，不得 `write` / `edit` / 删除内容。

## Read Snapshot

每轮开始按顺序读取：

1. `outputs/students/session.json`
2. `outputs/students/<student_id>/profile.json`
3. `outputs/students/<student_id>/<subject>/profile.json`
4. `outputs/students/<student_id>/<subject>/memory.json`
5. `outputs/students/<student_id>/<subject>/current_state.json`
6. `outputs/students/<student_id>/<subject>/milestones.json`

缺文件时：

- `session.json` 缺失或 `student_id` 为空：告诉学生先运行 `/start`。
- 共享档案缺失：学生选择的名字在目录里不存在，转 `/start` 建档，不要凭空生成。
- 科目 `profile.json` 缺失：按 `references/profile-schema.md` 的对应科目模板初始化；初始化前先确认学生确实已存在共享档案。
- `memory.json` / `current_state.json` / `milestones.json` 缺失：按 `references/profile-schema.md` 的默认值创建。

读取后只在内存中保留快照；不要每轮重新读已经读过的文件，除非本轮确实写回过。

## session.json

`student_id` 在“已选科目、还没选学生”的过渡状态允许为 `null`；读取时视为空，引导 `/start`。

```json
{
  "student_id": "stu_li_ming_a7k2",
  "subject": "math",
  "last_active": "2026-11-04T12:00:00Z",
  "session_started_at": "2026-11-04T11:30:00Z"
}
```

- `subject` 只能是 `math` 或 `chinese`。
- 切换学生或科目时，整文件覆盖写。
- 切换当前学生：读旧 session，写新的 `student_id`、`subject`、`last_active`；若 `student_id` 为 `null`，只保留科目并清空学生。

## Create Student

在 `/start` 的入学问答收齐信息后执行：

1. 生成唯一 `student_id`：姓名转小写拼音或英文 slug，加 4 位随机 hex；用 `glob outputs/students/*` 检查不重复。
2. 写共享档案 `outputs/students/<id>/profile.json`：

```json
{
  "student_id": "stu_li_ming_a7k2",
  "name": "李明",
  "grade": 4,
  "grade_band": "upper_primary",
  "language": "zh-CN",
  "personal": {
    "hobbies": "阅读、绘画、踢足球",
    "most_exciting_event": "参加学校运动会并获得第一名",
    "most_sad_event": "宠物小狗生病去世了"
  },
  "created_at": "2026-11-04T12:00:00Z",
  "updated_at": "2026-11-04T12:00:00Z"
}
```

3. 写当前科目的 `profile.json`、`memory.json`、`current_state.json`、`milestones.json`，模板与默认值见 `references/profile-schema.md`。
4. 写 `outputs/students/session.json` 激活该学生与科目。
5. 用 `bash` 创建目录：`mkdir -p outputs/students/<id>/<subject>/raw outputs/students/<id>/<subject>/extracted`。
6. 告诉学生建档完成，下一步用 `/learn`。

年级段：

- 1-3 年级 → `lower_primary`
- 4-6 年级 → `upper_primary`

默认领域、语气、策略阶段见 `learn-core` skill 的 `references/grade-band-defaults.md`。

## Write Protocol

DSH 的 `write` 要求先读目标文件。每次写入遵循：

1. `read` 完整文件（不存在则用模板）。
2. 在内存中按字段合并；对象递归合并，数组按流程要求替换或前插，不做隐式去重。
3. 更新 `updated_at` 为当前 ISO 时间。
4. `write` 完整 JSON；不要写片段、不要留下注释、不要写非法 JSON。
5. 写完在回复中只告诉学生“已保存”或摘要，不展示原始 JSON。

合并规则：

- `profile.json`：保留未提及字段；`session_history` 前插最新一条，截断到 5 条。
- `memory.json`：`profile_memory` 与 `learning_memory` 分别合并；`confirmed_skills` / `skill_errors` 按 `skill` 去重；`updated_at` 更新。
- `current_state.json`：按 patch 字段覆盖；不保留旧命令词汇。
- `milestones.json`：`milestones` 数组合并重复 focus 后按重要性、再按时间排序，最多 20 条。
- `error_history`：前插最新记录，截断到 20 条。

写入并发假设：单学生、单会话、本地文件；不做跨进程锁。不要并发写同一个文件。

## Finalize

会话结束（显式结束、目标达成、AI 判断、中途换主题）时执行。详细字段与示例见 `references/finalize-session.md`。

1. 汇总内存中的 `session_segments`；为空则告诉学生没有可保存的内容，停止。
2. 生成 `final_summary`：`session_id`、`date`、`entry_point`、`focus`、`overall_performance_code/text`、`strategy_summary`、`strengths`、`difficulties`、`next_step`、`recommended_targets`、`status`；中断时加 `interrupted_at`、`last_topic`。
3. 生成四个 patch：
   - `subject_profile_patch`：`updated_at`、`current_levels`（如有）、`learning_state.active_domain`、`developing_topics`、`priority_targets`、`session_history` 前插。
   - `memory_patch`：`recent_focus`、`recent_modes`、`recent_error_patterns`、`recommended_next_moves`、`teach_readiness`、`confirmed_skills`、`skill_errors`。
   - `current_state_patch`：`active_focus`、`source`、`submode`、`entry_point`，清空四个 pending 字段。
   - `milestones_patch`：把被挤出的旧 session 信息压缩进里程碑。
4. 读完整文件 → 合并 → 写回四个科目文件。
5. 不写共享 `profile.json` 的 Prestart 八字段；不生成 `shared_profile_patch`。
6. 保留 `session_history` 最新 5 条、`error_history` 最新 20 条、`milestones` 最多 20 条。
7. 给学生一句简短总结，并说明已保存。

中途换主题：

- 先以 `status: "interrupted"`、`interrupted_at`、`last_topic` finalize 当前段。
- 再开始新主题；不要丢掉旧段的 `strengths` / `difficulties`。

## Session Segments

会话进行中，`session_segments` 只存在内存里，不写文件。每个 segment 至少包含：

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
  "teach_handoff_recommended": true,
  "confirmed_skills": ["通分"],
  "skill_errors_observed": ["异分母加法"]
}
```

可选：`overall_performance_code`（`needs_support` / `basic_independent` / `stable` / `flexible`）、`overall_performance_text`。

## Retention

- `session_history`：最新 5 条，最新在前。
- `error_history`：最新 20 条。
- `milestones`：最多 20 条，按重要性再按时间。
- 旧会话不要原样保留；合并重复 focus，把稳定进步、阶段变化、主题掌握提升写入 milestones。

详细规则见 `references/session-retention.md`。

## Privacy

- 不把 `profile.json` / `memory.json` 的原始 JSON 展示给学生。
- 不把学生的难过经历、家庭信息主动复述；只在搭桥时轻量使用。
- 不把学生数据写入工作区之外的位置。
- 不删除学生档案、错题或里程碑，除非学生明确要求并再次确认。

## References

- `references/profile-schema.md`：完整 schema、默认值、模板。
- `references/finalize-session.md`：finalize 字段、示例、保留策略。
- `references/session-retention.md`：会话与里程碑压缩规则。
