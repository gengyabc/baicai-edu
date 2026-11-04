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

写入并发假设：单学生、单会话、本地文件；不做跨进程锁。不要并发写同一个文件。若日志有待完成的 `finalize_plan`，所有新的档案编辑或错题写回必须先恢复该保存，避免覆盖半提交文件；处理协议见 `references/finalize-session.md`。

## Finalize

触发结束或手动保存时，**先读取并完整执行** `references/finalize-session.md`。它是幂等、summary、五个 patch、写回顺序及失败处理的唯一流程来源；保留与压缩策略读取 `references/session-retention.md`。

学习入口在开始/恢复、模式切换与换主题时读取 `references/session-lifecycle.md`；普通学习给下一步时读取 `references/next-step.md`。生命周期负责调度，finalize 负责持久化，不各自维护一份保存算法。

## Session Segments

学科每个教学回合产出一个 segment，由共享生命周期追加到日志。内部子流程回传结果供外层合并，不另记一轮。

**产出或消费 segment 前读取** `references/profile-schema.md` 的 Session Segment：它是完整结构、必填/可选字段与枚举的唯一来源。学科只定义专属字段或取值。未知观察为空而不编造；确认与错误记录另按 `learn-core` 的 `references/feynman-skill-whitelist.md` 判断。

## Retention

写入历史或里程碑前读取 `references/session-retention.md`；该文件统一定义保留上限、排序和压缩规则。

## Privacy

- 不把 `profile.json` / `memory.json` 的原始 JSON 展示给学生。
- `personal.interests` 用于例子、阅读角度、写作题目和搭桥；不要把它变成对学生的刻板判断。
- 不把学生的难过经历、家庭信息主动复述；只在搭桥时轻量使用。学生不想说时立即停止。
- 不把学生数据写入工作区之外的位置。
- 不删除学生档案、错题或里程碑，除非学生明确要求并再次确认。

## References

本 skill 的所有 `references/...` 路径都相对于加载结果给出的 base directory。

- `references/session-lifecycle.md`：学习入口共用的恢复、路由、模式切换、记录与结束流程。
- `references/next-step.md`：普通学习的下一步与菜单选择。
- `references/target-parsing.md`：普通学习、费曼和恢复共用的目标分类与已处理文件交接。
- `references/profile-schema.md`：完整 schema、模板、memory 消费方式；年级默认值归 `learn-core`。
- `references/finalize-session.md`：finalize 字段、示例、幂等、保留策略。
- `references/session-retention.md`：会话与里程碑压缩规则。
