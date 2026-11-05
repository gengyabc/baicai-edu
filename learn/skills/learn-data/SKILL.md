---
name: learn-data
description: 学生数据读写协议。读取或初始化档案、恢复会话、生成学习记录、修改数据或结束保存前加载。
user-invocable: false
---

# Learn Data

用 `read` / `write` / `glob` / `bash` 操作工作区内的学生 JSON。路径、字段与合并规则按本文执行。

## Data Root

所有路径相对于**当前工作区根目录**。学生系统状态在 `outputs/students/`；用户投放的持久原件在 `data/students/`。

```
data/students/
  <student_id>/
    <subject>/raw/                 # 用户投放原件（错题、材料、草稿等）

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
      extracted/
      backups/raw/
    chinese/
      ... 同上
```

- `student_id` 形如 `stu_<slug>_<4hex>`；`slug` 只含 `[a-z0-9_]`，`4hex` 是 4 位 `[0-9a-f]`。
- 不使用索引文件；用 `glob outputs/students/*/profile.json` 发现学生，再读每个 `profile.json`。
- `data/.../raw/` 是用户投放区：只读，只能 `mv` 改名；不得 `write` / `edit` / 删除内容。
- `outputs/.../backups/raw/` 是原件的写前备份，只增不改；`extracted/` 是系统写出的分析 Markdown。

## Read Snapshot

会话开始、上下文恢复后快照缺失、或切换学生/科目时，由入口按顺序读取一次；学科复用入口传入的有效快照：

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

- 在内存中保留快照。已成功写回的对象同步更新缓存；不确定缓存是否有效时仅重读受影响文件。普通对话轮次和模式切换不重新读取整份快照。
- 把共享档案的 `personal.interests`、`personal.most_exciting_event` 和科目档案的 `profile.preferences`、`profile.self_report.easy_topics/hard_topics` 作为个性化输入交给教学 skill。
- 读 `memory.json` 的字段并按 `references/profile-schema.md` 的“How Memory Is Consumed”使用：`preferred_scaffolds`、`motivation_signals`、`recent_error_patterns`、`recommended_next_moves`、`feynman_readiness`。不要只写不读。

## session.json

`student_id` 在“已选科目、还没选学生”的过渡状态允许为 `null`；读取时视为空，引导 `/start`。

```json
{
  "student_id": "stu_li_ming_a7b2",
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
  "student_id": "stu_li_ming_a7b2",
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
5. 用 `bash` 创建目录：`mkdir -p data/students/<id>/<subject>/raw outputs/students/<id>/<subject>/extracted outputs/students/<id>/<subject>/backups/raw`。
6. 告诉学生建档完成，下一步用 `/learn`。

年级段、默认领域、语气、策略阶段统一读取 `learn-core` 的 `references/grade-band-defaults.md`。

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
- **科目** `profile.json`：保留未提及字段；`session_history` / `error_history` 前插新记录，按 `references/session-retention.md` 截断。
- `profile.current_levels`：嵌套在 `profile` 下，不要写成顶层 `current_levels`。
- `memory.json`：`profile_memory` 与 `learning_memory` 分别合并；`confirmed_skills` / `skill_errors` 按 `skill` 去重；`updated_at` 更新。
- `current_state.json`：按 patch 字段覆盖；不保留旧版斜杠命令字段。
- `milestones.json`：`milestones` 数组合并重复 focus，排序与上限按 `references/session-retention.md`。

同一文件串行写入。日志有待完成的 `finalize_plan` 时，先按 `references/finalize-session.md` 恢复保存，再编辑档案或写回错题。

## Finalize

结束或手动保存时，先读取并完整执行 `references/finalize-session.md`；保留与压缩策略读取 `references/session-retention.md`。

学习入口在开始/恢复、模式切换与换主题时读取 `references/session-lifecycle.md`；普通学习给下一步时读取 `references/next-step.md`。

## Session Segments

学科每个教学回合产出一个 segment，由共享生命周期追加到日志。内部子流程回传结果供外层合并，不另记一轮。

产出或消费 segment 前读取 `references/profile-schema.md` 的 Session Segment，按其结构、必填字段与枚举填写。学科只补充专属字段或取值。未知观察留空；确认与错误证据按 `learn-core` 的 `references/feynman-skill-whitelist.md` 判断。

## Privacy

- 不把 `profile.json` / `memory.json` 的原始 JSON 展示给学生。
- `personal.interests` 用于例子、阅读角度、写作题目和搭桥；不要把它变成对学生的刻板判断。
- 不把学生的难过经历、家庭信息主动复述；只在搭桥时轻量使用。学生不想说时立即停止。
- 不把学生数据写入工作区之外的位置。
- 不删除学生档案、`data/.../raw/` 原件或里程碑，除非学生明确要求并再次确认；删除时同时移除 `data/students/<id>/` 与 `outputs/students/<id>/`。

`references/...` 相对于本技能目录。目标分类与已处理文件交接读取 `references/target-parsing.md`。
