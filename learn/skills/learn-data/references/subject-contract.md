# Subject Contract

入口与学科包之间的唯一约定。入口只认 `session.json` 的 `subject` id，按下面的命名找到学科包；学科名称、选项、领域、标签和初始水平都留在学科包里。可选科目列表只在 `/learn-start` 的科目表中维护。

## 命名

- `<subject>-session`：该学科每轮教学的唯一入口。生命周期的 Route And Record 加载它；它再决定子技能、附加动作与迁移参数。
- `<subject>-core`：学科规则，不产出学生回复或 segment。其 SKILL.md 有一节「学科契约」，为下表每个角色给出一份 reference。

`<subject>` 就是 `session.json` 的 `subject` 值。

## 契约角色

| 角色 | 谁读取 | 用途 |
|---|---|---|
| 目标分类 | `/learn`、`/learn-feynman`、生命周期恢复 | 在 `references/target-parsing.md` 之后归类剩余文本与文件交接后的目标 |
| 年级默认 | `/learn-start`、`/learn-profile`、Read Snapshot 初始化 | `learning_state.active_domain` 与 `profile.current_levels` 初值 |
| 档案字段 | `/learn-start` 建档、`/learn-profile` 修改 | `profile.preferences` 键、`/learn-start` 偏好选项与键的对应、`current_levels` 键 |
| 诊断规则 | `learn-errors`、文件目标交接 | `error_type`、`label` 与 `domain` 的取值 |

按名加载 `<subject>-core` 后，以其返回的 base directory 定位上表文件，不拼仓库路径。

## 未安装

按名加载 `<subject>-core` 或 `<subject>-session` 失败：告诉学生需要先安装该学科包，停止教学路由，保留已有日志与档案。

## 可选扩展

- 阶段附加选项：segment 之外回传 `stage_options`，按 `references/next-step.md` 合并展示。
- 迁移：由 `<subject>-session` 处理 `context.activity: transfer` 的接续与恢复，状态按 `references/session-lifecycle.md` 记录。
