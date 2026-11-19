# baicai-edu-chinese-reading 白菜语文

[English](#english) | [中文](#中文)

## English

Chinese teaching skills for baicai-edu: reading and diagnosis, writing and revision, read-write transfer, item generation, and bridging a life-experience gap. Every skill here is internal — none occupies a `/` entry — and the entry, session loop and data protocol come from `baicai-edu-learn`.

### Entries

The package adds no commands of its own; Chinese is reached through the shared entries.

| Command | Purpose |
|---|---|
| `/learn-start` | Pick Chinese in the subject table, identify or create the student |
| `/learn` | Chinese teaching loop, with or without material (a passage, a composition prompt, a draft) |
| `/learn-feynman` | The student explains the evidence or the writing choice; the AI listens as a same-age classmate |

The entry routes on `subject: chinese` to `chinese-session`, so Chinese sub-skills never appear in the `/` menu. Interests from the shared profile (`personal.interests`) pick the opening experience, the writing material, the generated items and the transfer topic, and supply low-risk substitute experiences for a bridge; the subject rules for that live in [skills and ownership](docs/skills.md).

### Install

From the registry, name both bundles: pnpm installs the shared dependency, but DSH enables only what the call selects.

```bash
dsh plugin --profile web add baicai-edu-learn baicai-edu-chinese-reading
```

From this checkout, use the unified entry (it packs the closure into a tarball, matching the registry layout):

```bash
node scripts/install.mjs chinese-reading --profile web
```

Restart if DSH says so, then refresh the Web session. When it worked, `/learn-start` offers Chinese on its subject card and the model catalog lists `chinese-session`, `chinese-core`, `chinese-reading-session`, `chinese-writing-session`, `chinese-read-write-transfer` and `chinese-generate-tasks`. Do not install this checkout with `link:`: pnpm does not bring its dependencies, and a single-provider setup then cannot find the shared package. Unified entry, re-install and manual-disable behavior: [installation guide](<https://github.com/gengyabc/baicai-edu/blob/main/docs/installation.md>).

### What is irreversible

- `data/.../raw/` originals are read-only; rename only after backing up into `outputs/.../backups/raw/`.
- Deleting student data belongs to `learn-clean`, not this package, and its high-risk forms are permanent.
- Teaching is text-only: nothing here hears a reading, sees a recitation or judges handwriting.

### Where the data lives

System state is in `outputs/students/`, user originals in `data/students/<id>/chinese/raw/`. Both sit in the current workspace and never ship. Directory tree, Chinese profile fields, transfer fields and the diagnostic record chain: [student data directories](docs/data-directory.md).

### Further reading

| To learn about | Go to |
|---|---|
| The six skills, routing, and which file owns each rule | [Skills and rule ownership](docs/skills.md) |
| What the AI may say and do, and how evidence is recorded | [Teaching boundaries](docs/teaching-boundaries.md) |
| Student data layout, Chinese fields, per-turn records | [Student data directories](docs/data-directory.md) |
| Dependencies, the subject contract, adding a rule | [Dependencies and extending](docs/extending.md) |
| Building `resources/`, validation commands, changing these docs | [Development and validation](docs/development.md) |

## 中文

baicai-edu 的语文教学技能包：阅读与诊断、写作与升格、读写迁移、出题，以及生活经验缺口桥接。本包技能全部是模型内部 skill，不占用 `/` 入口；入口、会话循环与数据协议由 `baicai-edu-learn` 提供。

### 入口

本包不新增命令，语文通过共享入口进入。

| 命令 | 作用 |
|---|---|
| `/learn-start` | 在科目表里选「语文」，识别或创建学生 |
| `/learn` | 语文教学主循环，可带材料（一篇文章、一道作文题、一份草稿） |
| `/learn-feynman` | 学生讲证据或写作选择，AI 当同龄同学听 |

入口按 `subject: chinese` 路由到 `chinese-session`，所以语文子技能不会出现在 `/` 菜单里。共享档案里的兴趣（`personal.interests`）用来选开场经验、写作素材、出题材料与迁移主题，并为经验桥接提供低风险的替代经验；学科内的用法见[技能与规则归属](docs/skills.zh.md)。

### 安装

从 registry 装时请把两个 bundle 都写出来：pnpm 会装共享依赖，但 DSH 只启用本次选中的 bundle。

```bash
dsh plugin --profile web add baicai-edu-learn baicai-edu-chinese-reading
```

本仓库本地 checkout 用统一入口（它把闭包 pack 成 tarball 安装，与 registry 布局一致）：

```bash
node scripts/install.mjs chinese-reading --profile web
```

按 DSH 输出决定是否重启，再刷新 Web 会话。装好后 `/learn-start` 的科目卡片里有语文，模型目录里能看到 `chinese-session`、`chinese-core`、`chinese-reading-session`、`chinese-writing-session`、`chinese-read-write-transfer` 与 `chinese-generate-tasks`。不要用 `link:` 装本仓库的 checkout：pnpm 不会带上它的依赖，单份 provider 也就找不到共享包。统一入口、重复安装与手动禁用见[统一安装说明](<https://github.com/gengyabc/baicai-edu/blob/main/docs/installation.md>)。

### 不可逆的部分

- `data/.../raw/` 原件只读，改名须先备份到 `outputs/.../backups/raw/`。
- 删除学生数据归 `learn-clean`，不属于本包，其中高风险形式永久不可恢复。
- 教学只做文本：这里听不到朗读、看不到背诵，也不评判书写。

### 数据放在哪

系统状态在 `outputs/students/`，用户原件在 `data/students/<id>/chinese/raw/`。两处都在当前工作区，不随包发布。目录树、语文档案字段、迁移字段与诊断记录链路见[学生数据目录](docs/data-directory.zh.md)。

### 深入阅读

| 想了解 | 位置 |
|---|---|
| 六个技能、路由，以及每条规则归哪个文件 | [技能与规则归属](docs/skills.zh.md) |
| AI 可以说什么做什么、证据怎么记录 | [教学边界](docs/teaching-boundaries.zh.md) |
| 学生数据布局、语文字段、逐轮记录 | [学生数据目录](docs/data-directory.zh.md) |
| 依赖关系、学科契约、新增规则 | [依赖与扩展](docs/extending.zh.md) |
| 构建 `resources/`、验证命令、修改这些文档 | [开发与验证](docs/development.zh.md) |
