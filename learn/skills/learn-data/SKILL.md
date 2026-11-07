---
name: learn-data
description: 学生数据读写协议。读取或初始化档案、恢复会话、生成学习记录、修改数据或结束保存前加载。
user-invocable: false
---

# Learn Data

学生数据的读取、初始化与保存协议。本 skill 的 `references/...` 都相对于本技能目录；跨 skill 文件先按名称加载该 skill，再按其返回的 base directory 定位。这条定位规则适用于所有包的所有 skill，各处不再重复说明。

## Data Root

所有路径相对于**当前工作区根目录**，分隔符按本机系统处理。文件操作使用当前环境可用的工具；需终端时，按实际操作系统和 shell 选择命令。

```
data/students/
  <student_id>/
    <subject>/raw/                 # 用户投放原件（错题、材料、草稿等）

outputs/students/
  session.json
  <student_id>/
    profile.json
    <subject>/
      profile.json
      memory.json
      current_state.json
      milestones.json
      session_log.json
      extracted/
      backups/raw/
```

- `student_id` 形如 `stu_<slug>_<4hex>`；`slug` 只含 `[a-z0-9_]`，`4hex` 是 4 位 `[0-9a-f]`。
- 按 `outputs/students/*/profile.json` 匹配发现学生，不使用索引文件。
- `data/.../raw/` 内容只读；唯一允许的变更是按 `learn-errors` 的规则备份成功后改名。
- `outputs/.../backups/raw/` 只增不改；`extracted/` 存系统写出的分析 Markdown。

## Read Snapshot

快照只由入口读取一次：会话开始、上下文恢复后快照缺失、或切换学生/科目时。学科 skill 一律使用入口传入的快照；这条适用于所有学科 skill，各处不再重复说明。

1. `outputs/students/session.json`
2. `outputs/students/<student_id>/profile.json`（共享档案）
3. `outputs/students/<student_id>/<subject>/profile.json`（科目档案）
4. `outputs/students/<student_id>/<subject>/memory.json`
5. `outputs/students/<student_id>/<subject>/current_state.json`
6. `outputs/students/<student_id>/<subject>/milestones.json`
7. `outputs/students/<student_id>/<subject>/session_log.json`

缺文件时：

- `session.json` 缺失或 `student_id` 为空：告诉学生先运行 `/learn-start`。
- 共享档案缺失：转 `/learn-start` 建档，不凭空生成。
- 科目 `profile.json` 缺失：确认共享档案存在后，按 `references/profile-schema.md` 初始化；语气读 `references/grade-band-defaults.md`，默认领域、初始水平与偏好键读学科契约（`references/subject-contract.md`）。
- `memory.json` / `current_state.json` / `milestones.json` 缺失：按 `references/profile-schema.md` 的默认值创建。
- `session_log.json` 缺失（读取工具返回 `not found`）是正常状态，表示没有未完成会话，需要时按 `references/session-lifecycle.md` 新建。只有权限、I/O 或内容损坏错误才报告读取故障，并停止依赖该文件的操作。

读取后：

- 快照留在内存。写回成功的对象同步更新缓存；不确定缓存是否有效时只重读受影响的文件。普通轮次和模式切换不重读整份快照。
- 个性化输入交给教学 skill：共享档案的 `personal.interests`、`personal.most_exciting_event`，科目档案的 `profile.preferences`、`profile.self_report.easy_topics/hard_topics`。
- `memory.json` 的 `preferred_scaffolds`、`motivation_signals`、`recent_error_patterns`、`recommended_next_moves`、`feynman_readiness` 按 `references/profile-schema.md` 的“How Memory Is Consumed”使用，写入的字段要读出来用。

## session.json

```json
{
  "student_id": "stu_li_ming_a7b2",
  "subject": "subject_id",
  "last_active": "2026-10-04T12:00:00Z",
  "session_started_at": "2026-10-04T11:30:00Z"
}
```

- `subject` 是入口写入的科目 id。
- 切换学生或科目时整文件覆盖写。已选科目、尚未选学生的过渡状态里 `student_id` 为 `null`，读取时按空处理，引导 `/learn-start`。

## Create Student

`/learn-start` 收齐并确认新生信息后，读取并执行 `references/create-student.md`。已有学生只补齐 Read Snapshot 指定的缺失文件，保留已有学习证据。

## Write Protocol

每次写入：

1. 读取完整文件（不存在则用模板）。
2. 在内存中合并：对象递归合并、保留未提及字段；数组按流程要求替换或前插，不隐式去重。
3. 更新 `updated_at` 为当前 ISO 时间。
4. 写入完整、合法的 JSON，不含注释。
5. 回复里只说“已保存”或摘要。

写入方（不混写）：

- **共享** `outputs/students/<id>/profile.json`：姓名、年级、`personal`。只由 Create Student、`/learn-start` 和 `/learn-profile` 写；不改 `student_id`、`created_at`。
- **科目** `profile.json`、`memory.json`、`current_state.json`、`milestones.json`：由 finalize、`/learn-profile`、`learn-errors` 写。合并细则（前插、去重、截断、嵌套位置）以 `references/finalize-session.md` 与 `references/session-retention.md` 为准。
- **日志** `session_log.json`：只由 `references/session-lifecycle.md` 与 finalize 写。

同一文件串行写入。日志有待完成的 `finalize_plan` 时，先按 `references/finalize-session.md` 恢复保存，再编辑档案或写回错题。

## 按场景读取

| 场景 | 读取 |
|---|---|
| `/learn`、`/learn-feynman` 开始/恢复、模式切换、换主题 | `references/session-lifecycle.md` |
| 解析目标、文件交接 | `references/target-parsing.md` |
| 按 subject 定位学科 skill 与学科字段 | `references/subject-contract.md` |
| 产出或消费 segment、写日志 | `references/session-schema.md`（每轮不必读完整 `references/profile-schema.md`） |
| 普通学习给下一步 | `references/next-step.md` |
| 结束或手动保存 | `references/finalize-session.md`、`references/session-retention.md` |

## Session Segments

学科每个教学回合产出一个 segment，由共享生命周期追加到日志；内部子流程回传结果供外层合并，不另记一轮。结构、必填字段与枚举按 `references/session-schema.md`，学科只补充专属字段或取值。未知观察留空；确认与错误证据按 `learn-core` 的 `references/feynman-skill-whitelist.md` 判断。

## Privacy

- 学生数据只写在工作区内。
- 兴趣与经历的使用边界见 `learn-core` 的 `references/prestart-settings-interpretation.md`。
- 批量删除生成文件或清空学习记录，只在用户主动输入 `/learn-clean` 后按该技能预览并再次确认；其他技能不自动加载它或执行这类清理。常规 finalize 与保留策略仍按各自协议执行。
- `/learn-clean` 是显式删除的专属例外，不套用 Write Protocol 的合并保存与补档规则。普通清理保留共享身份、用户原件及原件备份；只有该技能的高风险分支在范围确认及独立手动短语确认后，才可删除这些数据。高风险范围、不可恢复警告与执行规则以该技能的 `references/high-risk-deletion.md` 为准。
