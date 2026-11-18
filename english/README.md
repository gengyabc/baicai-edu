# baicai-edu-english 白菜英语

[English](#english) | [中文](#中文)

## English

English teaching skills for baicai-edu: story and comprehensible input, negotiated interaction, output attempts, scaffolding and fading, task-based activity, usage-based patterns, spaced retrieval, and child-friendly news reading. Every skill here is internal — none occupies a `/` entry — and the entry, session loop and data protocol come from `baicai-edu-learn`.

### Entries

The package adds no commands of its own; English is reached through the shared entries.

| Command | Purpose |
|---|---|
| `/learn-start` | Pick English in the subject table, identify or create the student |
| `/learn` | English teaching loop, with or without a topic ("colors", "animals", "read a short story") |
| `/learn-feynman` | The student explains in English; the AI listens as a same-age classmate |

The entry routes on `subject: english` to `english-session`, so English sub-skills never appear in the `/` menu.

### Install

From the registry, the English package name is enough — `baicai-edu-learn` comes in as a dependency:

```bash
dsh plugin --profile web add baicai-edu-english
```

From this checkout, use the unified entry (it packs the closure into a tarball, matching the registry layout):

```bash
node scripts/install.mjs english --profile web
```

Restart if DSH says so, then refresh the Web session. When it worked, `/learn-start` offers English on its subject card and the model catalog lists `english-session`, `english-core` and the nine method skills. Do not install this checkout with `link:`: pnpm does not bring its dependencies, and a single-provider setup then cannot find the shared package. Unified entry, re-install and manual-disable behavior: [installation guide](<https://github.com/gengyabc/baicai-edu/blob/main/docs/installation.md>).

### What is irreversible

- `data/.../raw/` originals are read-only; rename only after backing up.
- Deleting student data belongs to `learn-clean`, not this package, and its high-risk forms are permanent.
- Teaching is text-only unless real audio or image capability exists: nothing here hears pronunciation, sees a gesture, or reviews a picture.

### Where the data lives

System state is in `outputs/students/`, user originals in `data/students/<id>/english/raw/`. Both sit in the current workspace and never ship. Field paths, English level keys, log append and write exceptions: [student data directories](docs/data-directory.md).

### Further reading

| To learn about | Go to |
|---|---|
| Which skill owns which rule, method dispatch, invocation tiers | [Skills and rule ownership](docs/skills.md) |
| What the AI may say and do, and where each boundary is written | [Teaching boundaries](docs/teaching-boundaries.md) |
| Student data layout, English fields, per-turn records | [Student data directories](docs/data-directory.md) |
| Dependencies, the subject contract, adding a method | [Dependencies and extending](docs/extending.md) |
| Building `resources/`, validation commands, teaching scenarios | [Development and validation](docs/development.md) |

## 中文

baicai-edu 的英语教学技能包：故事与可理解输入、对话协商、输出尝试、支架退让、任务驱动、用法积累、间隔提取，以及适合孩子的新闻阅读。本包技能全部是模型内部 skill，不占用 `/` 入口；入口、会话循环与数据协议由 `baicai-edu-learn` 提供。

### 入口

本包不新增命令，英语通过共享入口进入。

| 命令 | 作用 |
|---|---|
| `/learn-start` | 在科目表里选「英语」，识别或创建学生 |
| `/learn` | 英语教学主循环，可带主题（如「颜色」「动物」「读一个短故事」） |
| `/learn-feynman` | 学生用英语讲，AI 当同龄同学听 |

入口按 `subject: english` 路由到 `english-session`，所以英语子技能不会出现在 `/` 菜单里。

### 安装

从 registry 装时只写英语包名即可，`baicai-edu-learn` 作为依赖一并带入：

```bash
dsh plugin --profile web add baicai-edu-english
```

本仓库本地 checkout 用统一入口（它把闭包 pack 成 tarball 安装，与 registry 布局一致）：

```bash
node scripts/install.mjs english --profile web
```

按 DSH 输出决定是否重启，再刷新 Web 会话。装好后 `/learn-start` 的科目卡片里有英语，模型目录里能看到 `english-session`、`english-core` 和九个方法技能。不要用 `link:` 装本仓库的 checkout：pnpm 不会带上它的依赖，单份 provider 也就找不到共享包。统一入口、重复安装与手动禁用见[统一安装说明](<https://github.com/gengyabc/baicai-edu/blob/main/docs/installation.md>)。

### 不可逆的部分

- `data/.../raw/` 原件只读，改名须先备份。
- 删除学生数据归 `learn-clean`，不属于本包，其中高风险形式永久不可恢复。
- 除非真有音频或图片能力，教学只做文本：这里听不到发音、看不到动作、也看不了图。

### 数据放在哪

系统状态在 `outputs/students/`，用户原件在 `data/students/<id>/english/raw/`。两处都在当前工作区，不随包发布。字段路径、英语水平键、日志追加与写入例外见[学生数据目录](docs/data-directory.zh.md)。

### 深入阅读

| 想了解 | 位置 |
|---|---|
| 哪条规则归谁、方法如何调度、入口调用档位 | [技能与规则所有权](docs/skills.zh.md) |
| AI 可以说什么做什么、每条边界写在哪 | [教学边界](docs/teaching-boundaries.zh.md) |
| 学生数据布局、英语字段、逐轮记录 | [学生数据目录](docs/data-directory.zh.md) |
| 依赖关系、学科契约、新增方法 | [依赖与扩展](docs/extending.zh.md) |
| 构建 `resources/`、验证命令、教学场景 | [开发与验证](docs/development.zh.md) |
