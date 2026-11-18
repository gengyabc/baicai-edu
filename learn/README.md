# baicai-edu-learn 白菜学习

[English](#english) | [中文](#中文)

## English

An all-ages shared learning entry and teaching base, with primary-school teaching as the focus. It prefers an applicable subject package; when no package is installed or none fits the stage, the general-task teaching shipped in this package continues, so no extra package is required.

### Entries

| Command | Purpose |
|---|---|
| `/learn-start` | Choose a subject, identify or create the student |
| `/learn` | Adaptive learning loop |
| `/learn-feynman` | Feynman mode: the student explains, the AI is the listener |
| `/learn-profile` | View or edit the student profile |
| `/learn-save` | Save the current session by hand |
| `/learn-clean` | User-only cleanup; normal cleanup keeps identity, originals and backups; high-risk deletion needs two independent confirmations |

`/learn-start`, `/learn` and `/learn-clean` can only be started by typing the `/command`; `/learn-feynman`, `/learn-profile` and `/learn-save` also load automatically inside a conversation ("let me explain it to you", "look at my profile", "save this").

### Getting started

Start with `/learn-start` the first time, then use `/learn`.

1. `/learn-start`: a subject card appears — pick math, Chinese or English, or just describe another goal; you can also simply chat. Then confirm which student this is: choose an existing profile from a card, or create one on the spot; stage, grade and preferences can all be skipped. This step only fixes identity and subject; it does not start teaching.
2. `/learn`: enter with a goal, for example `/learn 分数减法`, `/learn 我想自己推平行四边形面积公式`, `/learn 给我三道分数加法题`. A bare `/learn` continues from the profile's current goal, the last unfinished position, or a recommendation.

Wherever you must decide (subject, student, continue / switch content / end) you get a clickable card and may type your own answer or skip it; teaching questions and thinking prompts stay plain text, so just reply.

### Caution: high-risk deletion

The `/learn-clean` options "completely delete a given student (high risk)" and "wipe all student data (high risk)" **permanently remove identity, learning records, user originals and original backups. They cannot be recovered automatically and no recovery copy is kept.**

Preview and confirm the scope first, then separately type the confirmation phrase by hand (the per-student one contains the real id). Clicking the scope confirmation alone, saying "confirm", skipping or replying empty does nothing. Normal cleanup still keeps identity, originals and backups; editing skills is never deletion permission. Full rules: [high-risk deletion](<skills/learn-clean/references/high-risk-deletion.md>).

### Install

From the registry, install a subject package by name — this shared package comes in as a dependency. Installing it alone gives general-task teaching and the five support areas:

```bash
dsh plugin --profile web add baicai-edu-math-primary-low    # low-band math; the board comes with it
dsh plugin --profile web add baicai-edu-learn               # shared capability only
```

From this checkout, use the unified entry (it packs the dependency closure into tarballs, matching the registry layout):

```bash
# Shared capability only (run from the repository root)
node scripts/install.mjs learn --profile web
# For teaching: pulls this package in automatically; low-band math also gets the board
node scripts/install.mjs math-primary-low --profile web
node scripts/install.mjs math-primary-high --profile web
```

Restart if DSH says so, then refresh the Web session: the `/` menu shows the 6 entries, the model catalog lists `learn-feynman`, `learn-profile` and `learn-save`, and installed subject packages add their own internal skills. The shared package never installs every subject in reverse. Do not install this checkout with `link:`: pnpm does not bring its dependencies, and a single-provider setup then cannot find them. Unified entry, re-install and manual-disable behavior: [installation guide](<../docs/installation.md>).

### Where the data lives

System state lives in `outputs/students/`; user-dropped originals live in `data/students/<id>/<subject>/raw/`. Both sit in the current workspace and are never shipped with the package; originals are read-only, so rename only after backing up. Fields, write exceptions and per-turn records: [student data directories](docs/data-directory.md).

### Further reading

| To learn about | Go to |
|---|---|
| Internal skill roles, invocation tiers, who owns each rule | [Skills and rule ownership](docs/skills.md) |
| Student data directories, log compatibility and write exceptions | [Student data directories](docs/data-directory.md) |
| Dependencies, existing subject packages, adding a subject | [Dependencies and subjects](docs/subject-packages.md) |
| How "I don't know what to learn" is answered | [Learning recommendations](docs/recommendation.md) |
| Behavior list that needs a real conversation | [Conversation acceptance scenarios](docs/acceptance-scenarios.md) |
| Editing skills, building `resources/`, validation commands | [Development and validation](docs/development.md) |

## 中文

全年龄共享学习入口与教学底座，以小学教学为重点。优先采用适用的专门学科包；缺包或阶段不适配时，用随本包提供的通用任务教学继续帮助，不要求另装通用包。

### 提供的入口

| 命令 | 作用 |
|---|---|
| `/learn-start` | 选科目，识别或创建学生 |
| `/learn` | 自适应学习主循环 |
| `/learn-feynman` | 费曼模式：学生讲，AI 当学生 |
| `/learn-profile` | 查看/修改学生档案 |
| `/learn-save` | 手动保存当前会话 |
| `/learn-clean` | 用户专用清理；普通清理保留身份、原件和备份；高风险彻底删除需两次独立确认 |

`/learn-start`、`/learn`、`/learn-clean` 只能由用户键入 `/命令` 发起；`/learn-feynman`、`/learn-profile`、`/learn-save` 也能在对话里自动加载（“我来给你讲”“看看我的档案”“保存一下”）。

### 使用简介

第一次从 `/learn-start` 开始，之后都用 `/learn`。

1. `/learn-start`：先弹出科目卡片，选数学、语文、英语，或直接描述其他目标；也可以只聊几句。再确认是哪个学生——已有档案的从卡片里选，没有的当场建档，阶段、年级和偏好都能跳过。这一步只确定身份和科目，不开始教学。
2. `/learn`：带着目标进入，例如 `/learn 分数减法`、`/learn 我想自己推平行四边形面积公式`、`/learn 给我三道分数加法题`。只输入 `/learn` 时，从档案的当前目标、上次未完成的位置或推荐里继续。

过程中需要你拿主意的地方（选科目、确认学生、继续/换个内容/结束）都是可点击的卡片，也能自己填写或跳过；教学里的追问和思考题仍是普通文字，直接回复即可。

### 小心高风险删除

`/learn-clean` 可选的「彻底删除指定学生（高风险）」与「清空所有学生数据（高风险）」会**永久删除身份、学习记录、用户原件和原件备份，不可自动恢复，也不会另建恢复副本**。

先预览并确认范围，再单独手动输入确认短语（指定学生包含真实 id）。只点击范围确认、说“确认”、跳过或空回应都不会执行。普通清理仍保留身份、原件和备份；修改技能不构成删除授权。详细规则见[高风险删除](<skills/learn-clean/references/high-risk-deletion.md>)。

### 安装

从 registry 装时只写学科包名即可，本共享包作为依赖一并带入；只装它时提供通用任务教学与五类支持：

```bash
dsh plugin --profile web add baicai-edu-math-primary-low    # 低年级数学，画板随之带入
dsh plugin --profile web add baicai-edu-learn               # 只装共享能力
```

本仓库本地 checkout 用统一入口（它把依赖闭包 pack 成 tarball 安装，与 registry 布局一致）：

```bash
# 只装共享能力（在仓库根目录运行）
node scripts/install.mjs learn --profile web
# 学科使用：自动补齐本包；低年级数学还会配齐画板
node scripts/install.mjs math-primary-low --profile web
node scripts/install.mjs math-primary-high --profile web
```

按 DSH 输出决定是否重启，再刷新 Web 会话：`/` 菜单出现 6 个入口命令，模型目录出现 `learn-feynman`、`learn-profile`、`learn-save`，已装学科包还会提供各自的内部 skill。共享包不反向安装所有学科。不要用 `link:` 装本仓库的 checkout：pnpm 不会带上它的依赖，单份 provider 也就找不到它们。统一入口、重复安装与手动禁用见[安装说明](<../docs/installation.md>)。

### 数据放在哪

系统状态在 `outputs/students/`；用户投放原件在 `data/students/<id>/<subject>/raw/`。两处都在当前工作区，不随包发布；原件只读，改名须先备份。字段、写入例外与逐轮记录见[学生数据目录](docs/data-directory.zh.md)。

### 深入阅读

| 想了解 | 位置 |
|---|---|
| 内部技能职责、入口调用档位、每条规则归谁 | [技能与规则所有权](docs/skills.zh.md) |
| 学生数据目录、日志兼容与写入例外 | [学生数据目录](docs/data-directory.zh.md) |
| 依赖关系、现有学科包、接入新学科 | [依赖与接入](docs/subject-packages.zh.md) |
| 「不知道学什么」时怎么推荐 | [学习推荐](docs/recommendation.zh.md) |
| 需要真实对话运行的行为清单 | [对话验收场景](docs/acceptance-scenarios.zh.md) |
| 改技能、构建 `resources/` 与验证命令 | [开发与验证](docs/development.zh.md) |
