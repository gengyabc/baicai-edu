# Pi 教学配置迁移到 DSH 技能包

> 状态：已实施（2026-11-04）  
> 来源：`/Users/yugeng/programming/pi-service-workspace/xiaoxue/.pi`  
> 目标：`dsh-edu` 仓库中的三个可安装 DSH 技能包

## 1. 迁移决策

| 决策点 | 结论 |
|---|---|
| 迁移形态 | 纯 DSH 技能包（`SKILL.md` + `references/`），不移植 Pi 的 14 个 TS 工具 |
| 学生数据 | 工作区 `outputs/students/` 下的 JSON 文件，由技能指导模型用 `read`/`write`/`glob` 读写 |
| 数学 | 全部放入 `math-low/` |
| 语文 | 完整语文（阅读、写作、读写迁移、出题、评估）放入 `chinese-reading/` |
| 共享入口与共享能力 | 放入新建的 `learn/` |
| 入口命令 | `/start`、`/learn`、`/feynman`、`/profile`、`/save`；`/teach` 已存在，改用 `/feynman` |
| 安装方式 | `dsh plugin --profile web add link:<绝对路径>` |
| 示例包 | 安装完成后删除 `pkgs/pkg-a` |

## 2. 为什么是纯技能包

Pi 的 `prompts/`、`workflows/`、`rules/`、`skills/` 本质上都是“给模型的指令”。DSH 的原生对应物是 skill：

- 用户入口：`user-invocable` skill，用户在输入框键入 `/name` 即可注入。
- 模型能力：`modelInvocable` skill，模型通过 `skill` 工具按需加载。
- 共享规则：写成被其他 skill 引用的 reference 文件，或独立的核心 skill。
- 跨包引用：只能按 skill 名称调用，不能依赖 checkout 绝对路径；因此每个包都必须通过 `README.md` 声明依赖。

Pi 的 `extensions/` 是真正的 TypeScript 运行时工具，不属于“prompt/rules/skills/workflows”迁移范围。数据层改为显式文件协议，见第 5 节。

## 3. 包结构

三个包都是标准的 DSH bundle package：

```
learn/
  package.json
  cordis.patch.yml
  README.md
  skills/
    start/SKILL.md
    learn/SKILL.md
    feynman/SKILL.md
    profile/SKILL.md
    save/SKILL.md
    learn-core/SKILL.md + references/
    learn-data/SKILL.md + references/
    learn-errors/SKILL.md + references/

math-low/
  package.json
  cordis.patch.yml
  README.md
  skills/
    math-session/SKILL.md + references/
    math-core/SKILL.md + references/
    math-diagnose/SKILL.md
    math-student-problem/SKILL.md
    math-practice/SKILL.md

chinese-reading/
  package.json
  cordis.patch.yml
  README.md
  skills/
    chinese-session/SKILL.md
    chinese-core/SKILL.md + references/
    chinese-reading-session/SKILL.md
    chinese-writing-session/SKILL.md
    chinese-read-write-transfer/SKILL.md
    chinese-generate-tasks/SKILL.md
    experience-gap-bridging/SKILL.md
```

### 3.1 包清单

`cordis.patch.yml` 为每个包装载一个独立的 `dsh-skill-filesystem` provider，root 指向已安装包内的 `skills/`：

```yaml
- insert:
    - id: edu-learn-skills
      name: '@deepseek-ai/dsh-skill-filesystem'
      config:
        providerName: edu-learn
        includeDefaultRoots: false
        bundledSkillDir: !!js process.getBuiltinModule('node:path').join(process.getBuiltinModule('node:path').dirname(process.getBuiltinModule('node:module').createRequire(baseUrl).resolve('dsh-edu-learn/package.json')), 'skills')
```

关键点：

- `baseUrl` 是 DSH 注入的 profile 目录，`createRequire(baseUrl).resolve(...)` 解析的是**安装后**的包位置，因此 `link:`、`file:`、git、registry 都能工作。
- 每个包使用唯一 `providerName` 和唯一 `id`。
- 不要在 patch 里写 checkout 绝对路径。

### 3.2 依赖关系

```
learn/            (基础：入口 + 共享规则 + 数据协议 + 错题处理)
  ↑
math-low/         (依赖 learn 的 learn-core / learn-data / learn-errors)
  ↑
chinese-reading/  (依赖 learn 的 learn-core / learn-data / learn-errors)
```

`math-low` 与 `chinese-reading` 可以单独安装，但缺少 `learn` 时共享规则和数据协议不可用；README 中必须写明。

## 4. Skill 约定

### 4.1 Frontmatter 与调用策略

DSH 的两个调用控制字段互相独立：

```yaml
# A. 纯人类入口：只能由 /name 调用，不进入模型目录
---
name: learn
description: ...
disable-model-invocation: true
---

# B. 对话中可自动调用，也可由用户 /name 调用
---
name: save
description: ...
---

# C. 由其他 skill 加载的内部能力：模型可加载，不出现在 / 菜单
---
name: learn-core
description: ...
user-invocable: false
---
```

| 字段 | 作用 | 本仓库用在哪 |
|---|---|---|
| `disable-model-invocation: true` | 从模型目录和 `skill` 工具中移除；只保留用户 `/name` 调用 | `start`、`learn` |
| 不设（默认允许模型调用），同时不设 `user-invocable` | 模型可按上下文自动加载，用户也可 `/name` | `feynman`、`profile`、`save` |
| `user-invocable: false` | 从 `/` 菜单和用户命令面隐藏；仍可被模型通过 `skill` 工具加载 | `learn-core`、`learn-data`、`learn-errors`、`math-*`、`chinese-*`、`experience-gap-bridging` |

为什么这样分：

- `start` / `learn` 是**会话边界**，应当由用户明确发起，避免模型在闲聊中自行建档或开启学习循环。
- `feynman` 是**对话中的模式切换**：学生说“我来给你讲”时应能自动进入；用户也可以 `/feynman` 直接进入。
- `profile` 是**对话中的查询/修改**：学生问“我现在学到哪了”时应能自动加载。
- `save` 是**对话中的显式保存请求**：学生说“保存一下”时应能自动加载。
- 内部 skill 不能被 `disable-model-invocation` 禁用。DSH 没有独立的“skill 调用 skill”通道；父 skill 写的“加载 `math-core`”仍然是模型执行 `skill` 工具。若把 `math-core` 设为 `disable-model-invocation: true`，父 skill 将无法加载它。
- 内部 skill 用 `user-invocable: false` 隐藏 `/` 菜单即可；模型目录里仍会出现，这是 DSH 当前的能力边界。
- 如果某个内容必须对模型目录完全不可见，又不能通过 `skill` 工具加载，就把它写成父 skill 的 `references/*.md`，由父 skill 用 `read` 读取，而不是做成独立 skill。
- 不要同时设置 `disable-model-invocation: true` 和 `user-invocable: false`，否则该 skill 两个入口都不可达。
- 不使用 DSH 不支持的 `argument-hint`；用户参数就是 `/name` 后面的普通消息文本。

### 4.2 正文写法

- 用中文写，面向模型，不写给人看的客套话。
- 开头写 `Purpose` / `When to use` / `Inputs`。
- 明确写出要加载的 skill 名称和 reference 文件。
- 跨包引用写成：`调用 skill 工具加载 \`learn-core\``，不要写 `@.pi/...`。
- 同包 reference 写成相对路径：`references/math-teaching-core.md`。
- 需要读取数据时，明确写出路径和 JSON 字段，不要写“调用 get-student-profile 工具”。
- 保留 Pi 的教学语气、年级适配、错误标签和教学动作；删除 Pi 的 platform/API 契约（`ui_actions`、`contract_version`、`events`、`finalizePlatformTurnSuccessPayload` 等）。

### 4.3 加载纪律

- 入口 skill 先加载 `learn-core` 与 `learn-data`（若尚未加载）。
- 科目 skill 需要共享规则时加载 `learn-core`，需要数据时加载 `learn-data`。
- 一个会话内不要重复加载同一个 skill；已有的 `<skill_content>` 可以继续引用。
- reference 文件按需读取：教学前读教学规则，接受答案前读确认规则，结束时读结束信号与 finalize 规则。

## 5. 学生数据协议（替代 Pi extensions）

### 5.1 根目录

所有数据位于**当前工作区根目录**的 `outputs/students/`；`outputs/` 是通用输出根目录，后续可以新增 `outputs/reports/`、`outputs/lessons/` 等。

```
outputs/students/
  session.json                         # 当前学生与科目
  <student_id>/
    profile.json                       # 跨科目共享档案
    math/
      profile.json
      memory.json
      current_state.json
      milestones.json
      raw/                             # 只读原始错题
      extracted/                       # 提取出的 md
    chinese/
      ... 同上
```

- 不使用 `outputs/students/index.json`；用 `glob outputs/students/*/profile.json` 发现学生。
- `raw/` 只读：不得 `write`/`edit`，只能 `mv` 改名。
- 所有写入先读完整文件，合并后写完整文件；不要写片段 JSON。
- 日期使用 ISO 8601；`student_id` 形如 `stu_<拼音或英文>_<4位hex>`。

### 5.2 当前会话

`outputs/students/session.json`：

```json
{
  "student_id": "stu_li_ming_a7k2",
  "subject": "math",
  "last_active": "2026-11-04T12:00:00Z",
  "session_started_at": "2026-11-04T11:30:00Z"
}
```

### 5.3 快照读取

每一轮开始读取：

1. `outputs/students/session.json`
2. `outputs/students/<id>/profile.json`
3. `outputs/students/<id>/<subject>/profile.json`
4. `outputs/students/<id>/<subject>/memory.json`
5. `outputs/students/<id>/<subject>/current_state.json`
6. `outputs/students/<id>/<subject>/milestones.json`

缺失的科目文件按 `learn-data/references/profile-schema.md` 的模板初始化；初始化写入也算一次持久化，必须整文件写入。

### 5.4 会话结束

Pi 的 `finalize-session-core` 在 DSH 中变成 `learn-data` 的“结束会话”流程：

1. 汇总内存中的 `session_segments`。
2. 生成 `final_summary`。
3. 合并 `subject_profile_patch`、`memory_patch`、`current_state_patch`、`milestones_patch`。
4. 写回四个科目文件，保留 `session_history` 最新 5 条、`error_history` 最新 20 条、`milestones` 最多 20 条。
5. 不写共享 `profile.json` 的 Prestart 八字段（只读）。
6. 中途换主题时以 `status: "interrupted"` 保存当前段，再开始新主题。

## 6. Pi → DSH 映射

| Pi 来源 | DSH 目标 |
|---|---|
| `prompts/start.md` | `learn/skills/start/SKILL.md` |
| `prompts/learn.md` | `learn/skills/learn/SKILL.md` |
| `prompts/teach.md` | `learn/skills/feynman/SKILL.md` |
| `prompts/profile.md` | `learn/skills/profile/SKILL.md` |
| `prompts/save.md` | `learn/skills/save/SKILL.md` |
| `prompts/write_plan.md` | 不迁移（开发用，不属于教学） |
| `rules/shared/pedagogy-core.md` | `learn-core/references/pedagogy-core.md` |
| `rules/shared/grade-band-defaults.md` | `learn-core/references/grade-band-defaults.md` |
| `rules/shared/confirm-before-accept.md` | `learn-core/references/confirm-before-accept.md` |
| `rules/shared/guidance-non-response-handling.md` | `learn-core/references/guidance-non-response-handling.md` |
| `rules/shared/session-end-signals.md` | `learn-core/references/session-end-signals.md` |
| `rules/shared/error-processing.md` | `learn-errors/references/error-processing.md` |
| `rules/shared/raw-directory-protection.md` | `learn-errors/references/raw-directory-protection.md` |
| `rules/shared/feynman-skill-whitelist.md` | `learn-core/references/feynman-skill-whitelist.md` |
| `rules/personas/*` | `learn-core/references/personas.md`、`feynman-mode.md` |
| `rules/shared/profile-schema.md` | `learn-data/references/profile-schema.md` |
| `rules/shared/session-retention.md` | `learn-data/references/session-retention.md` |
| `workflows/standalone/*` | `learn/skills/learn/SKILL.md`、`start/SKILL.md`、`learn-errors` |
| `workflows/core/finalize-session-core.md` | `learn-data/references/finalize-session.md` |
| `rules/math/*` | `math-low/skills/math-core/references/*` |
| `workflows/run-math-session.md` | `math-low/skills/math-session/SKILL.md` |
| `workflows/math-student-problem-session.md` | `math-low/skills/math-student-problem/SKILL.md` |
| `rules/chinese/*` | `chinese-reading/skills/chinese-core/references/*` |
| `workflows/chinese-*.md` | `chinese-reading/skills/chinese-*/SKILL.md` |
| `skills/experience-gap-bridging/SKILL.md` | `chinese-reading/skills/experience-gap-bridging/SKILL.md` |

不迁移：`api/`、`extensions/`、`runtime.config.json`、`prompts/write_plan.md`、`rules/dev/*`。

## 7. 实施与验证

### 7.1 实际安装

已执行：

```bash
dsh plugin --profile web add link:/Users/yugeng/programming/dsh-edu/learn
dsh plugin --profile web add link:/Users/yugeng/programming/dsh-edu/math-low link:/Users/yugeng/programming/dsh-edu/chinese-reading
```

`~/.dsh/profiles/web/package.json` 的 `dsh.profile.bundles` 已包含：

- `dsh-edu-learn`
- `dsh-edu-chinese-reading`
- `dsh-edu-math-low`

三个包在 `node_modules` 下都是指向本仓库的 symlink。

### 7.2 技能目录

当前 Web 会话已刷新，共 20 个 skill 定义，按调用面分成三组：

- **仅用户入口（2 个，`disable-model-invocation: true`）**：`start`、`learn`
- **用户 + 模型都可调用（3 个，默认双开）**：`feynman`、`profile`、`save`
- **仅模型内部（15 个，`user-invocable: false`）**：
  - `learn` 包：`learn-core`、`learn-data`、`learn-errors`
  - `math-low` 包：`math-core`、`math-session`、`math-diagnose`、`math-practice`、`math-student-problem`
  - `chinese-reading` 包：`chinese-core`、`chinese-session`、`chinese-reading-session`、`chinese-writing-session`、`chinese-read-write-transfer`、`chinese-generate-tasks`、`experience-gap-bridging`

`start` / `learn` 不进入模型目录，避免模型在闲聊中自行建档或开启学习循环；`feynman` / `profile` / `save` 保留模型入口，支持“我来给你讲”“看看我的档案”“保存一下”这类对话内自动加载；内部 skill 保持模型可加载，供入口和学科 skill 通过 `skill` 工具按名称加载。

### 7.3 验证项

1. 三包均通过 `dsh plugin --profile web add link:` 安装，未使用 checkout 绝对路径写 provider root。
2. 每个 `SKILL.md` 的 YAML frontmatter 合法，`name` 与目录名一致，`description` 非空。
3. `math-low` 与 `chinese-reading` 的 skill 中不再出现 `@.pi`、Pi 工具名、`ui_actions`、`contract_version`、`platform` 等平台契约。
4. `/teach` 已被全局 `teach` 占用，本迁移使用 `/feynman`，避免同名冲突。
5. `pkgs/pkg-a` 示例包已删除。
6. 学生数据根目录为 `outputs/students/`；整个 `outputs/` 已加入 `.gitignore`，后续可扩展 `outputs/reports/` 等其他输出。

### 7.4 待人工验收

以下需要真实学生对话验证，无法只靠静态检查完成：

1. 输入 `/start`，确认选科、识别/建档、写 `outputs/students/session.json` 的完整流程。
2. 输入 `/learn 分数减法`，确认数学路由、一回合教学、结束 finalize 写回四个文件。
3. 输入 `/learn` + 一篇语文文章，确认 `chinese-session` 路由到阅读。
4. 输入 `/feynman`，确认学生视角、白名单和 `entry_point: "feynman"`。
5. 输入 `/save`，确认手动保存不会重复 finalize。
6. 用一张错题图片，确认 `learn-errors` 的 raw 只读、改名、extracted 写入与 error_history 更新。


## 8. 评审后修订（2026-10-04）

以下修订在首次迁移之后完成，覆盖本文前面的旧描述：

- **个性化**：共享档案用 `personal.interests`（数组）保存兴趣；语文的阅读角度、写作题目、迁移主题、经验桥接和数学情境都必须读取它。`prestart-settings-interpretation.md` 重写为“共享/科目字段在哪里”的单一来源。
- **数据协议**：新增 `session_log.json`（每轮写 segment，finalize 清空）；subject `profile.json` 增加 `updated_at`；`current_levels` 统一嵌套在 `profile` 下；`confirmed_skills` 在 segment 里是技能名字符串，finalize 转对象。
- **诊断历史**：语文 `reading:` / `writing:` 标签写入 `session_segment.diagnosis`，finalize 生成 `error_history` 的 `source: "diagnosis"` 条目；不再把标签塞进 `skill_errors`。`writing:意图误判` 归一化为 `writing:偏题`。
- **幂等与恢复**：`current_state.last_finalized_session_id` 防止重复 finalize；`pending_feynman_*` / `pending_transfer_*` 在下一轮被消费并清空；Topic Switch 开新 `session_id`。
- **初始化**：科目模板按年级段选择 `tone` 和 `active_domain`；偏好初始全 `false`，`/start` 只把选中项设 `true`。
- **路由**：`chinese-session` 的 `type=profile` + 写作改为 `mode: start`；`/learn` 的语文迁移统一经 `chinese-session`；所有内部 skill 加 Session Gate。
- **安全**：新增 AI 身份说明、危机/伤害处理、raw 改名前后备份、`math-student-problem` 先算对并在结束前揭示答案。
- **清理**：移除 Pi 的 Python/plugin/`@`/`/teach` 残留；年级段统一为 1-3 / 4-6；分数阶段统一为四个 schema 值；批改量规的“技巧运用”只用于读写迁移写作。

本文第 5、7 节中的旧字段名（`hobbies`、`teach_readiness`、`pending_teach_*`、无 `session_log` 的目录树）以修订后代码为准。
