# baicai-edu-math-primary-low 白菜小学数学（低年级）

[English](#english) | [中文](#中文)

## English

CGI-style primary math teaching for grades 1–3, the default band for the `math` subject: adaptive turns, strategy diagnosis, targeted practice and student-authored problems. Grade tunes language, notation and representation only — never what a student may explore, and high-grade content stays open to a younger student. Shared math contracts come from `baicai-edu-math`; the board is the separate plugin `baicai-edu-math-board`, a required dependency here. This package ships rules, not a runtime or a tool. The grades 4–6 package is [`math-primary-high/`](../math-primary-high/README.md), and both share the `math` subject id.

### Entries

The package adds no command; math is reached through the shared entries, and the lesson runs in `math-low-session`.

| Command | Purpose |
|---|---|
| `/learn-start` | Pick math in the subject table, identify or create the student |
| `/learn` | Math teaching mainline: set focus, advance one action, record one segment |
| `/learn-feynman` | The student explains their own thinking; the AI listens as a classmate |

The resolver picks the band from a known grade (1–3 → low, 4–6 → high, no grade → low), owned by `learn-data`'s `references/teaching-resolver.md`. That priority is not a content gate, and a running task keeps the band it was started with, unaffected by the other package being installed.

### Install

```bash
# from the repository root: installs learn, math-common, math-board and this band
node scripts/install.mjs math-primary-low --profile web
```

Restart if DSH says so, then refresh the Web session. When it worked, the model catalog lists the `math-low-*` skills, `/` shows no math command of its own, and choosing math in `/learn` enters the low band. Shared dependencies: `learn-core` owns teaching, roles and confirmation; `learn-data` owns snapshots, records and finalize; `learn-errors` owns dropped files. The installer fills dependencies in but does not re-enable a bundle you disabled by hand; do not replace a full install with a lone `link:` of a math package. Unified entry, re-install and manual-disable behavior: [installation guide](<../docs/installation.md>).

### What is irreversible

- `data/.../raw/` originals are read-only; rename only after backing up.
- Deleting student data belongs to `learn-clean`, not this package, and its high-risk forms are permanent.
- A board clear wipes the canvas and this round's local edit history together. The tool records the request; whether the client applied it needs separate confirmation, and values, colors, attachments and the student profile are untouched.

### Where the data lives

System state is in `outputs/students/`, user originals in `data/students/<student_id>/math/raw/`. Both sit in the current workspace and never ship. Field paths, per-turn records and write exceptions: [student data directories](docs/data-directory.md).

### Further reading

| To learn about | Go to |
|---|---|
| Which skill owns which rule, leaf dispatch, shared contracts and local deltas | [Skills and rule ownership](docs/skills.md) |
| What the board is, how teaching uses it, and who may clear it | [The math board](docs/board.md) |
| Guided work, informed full solution, and what counts as independent | [Teaching boundaries](docs/teaching-boundaries.md) |
| Student data layout, math fields, per-turn records | [Student data directories](docs/data-directory.md) |
| Building `resources/`, checks, teaching scenarios | [Development and validation](docs/development.md) |

## 中文

以小学低年级（1–3 年级）为主的 CGI 数学指令包，也是 `math` 科目的默认带：一回合教学、策略诊断、分层练习、学生出题考 AI。年级只调整语气、语言、记号和呈现，从不限制学生探究什么，低年级学生仍可探索高年级内容。共享数学契约来自 `baicai-edu-math`；画板是独立插件 `baicai-edu-math-board`，在本包是必需依赖。本包给的是规则，不是运行时或工具。4–6 年级对应包为 [`math-primary-high/`](../math-primary-high/README.md)，两者科目 id 同为 `math`。

### 入口

本包不新增命令，数学通过共享入口进入，课程在 `math-low-session` 里跑。

| 命令 | 作用 |
|---|---|
| `/learn-start` | 在科目表里选数学，识别或创建学生 |
| `/learn` | 数学教学主线：定焦点、推进一个动作、记录唯一回合段 |
| `/learn-feynman` | 学生讲自己的思路，AI 当同龄同学听 |

选型按已知年级决定带（1–3 年级 → 低年级包，4–6 年级 → 高年级包，无年级 → 低年级包），归 `learn-data` 的 `references/teaching-resolver.md` 统一负责。这个优先级不是内容门槛；进行中的任务保留开始时的带，不受另一个包安装影响。

### 安装

```bash
# 在仓库根目录运行：安装 learn、math-common、math-board 与本年级段包
node scripts/install.mjs math-primary-low --profile web
```

按 DSH 输出决定是否重启，再刷新 Web 会话。装好后模型目录里有 `math-low-*` 技能，`/` 不新增数学命令，在 `/learn` 里选数学进入低年级带。共享依赖：`learn-core` 管教学、角色与确认；`learn-data` 管快照、记录与收尾保存；`learn-errors` 管投放文件。安装器补齐依赖，但不会重新启用此前手动禁用的技能包；不要用 `link:` 单独装数学包来替代完整安装。统一入口、重复安装与手动禁用见[统一安装说明](<../docs/installation.md>)。

### 不可逆的部分

- `data/.../raw/` 原件只读，改名须先备份。
- 删除学生数据归 `learn-clean`，不属于本包，其中高风险形式永久不可恢复。
- 清空画板会同时清掉画布与本轮的本地修改记录。工具只记录请求，客户端是否执行须另有确认；数值、颜色、已有附件与学生档案不受影响。

### 数据放在哪

系统状态在 `outputs/students/`，用户原件在 `data/students/<student_id>/math/raw/`。两处都在当前工作区，不随包发布。字段路径、逐轮记录与写入例外见[学生数据目录](docs/data-directory.zh.md)。

### 深入阅读

| 想了解 | 位置 |
|---|---|
| 哪条规则归谁、子技能调度、共享契约与本地差异 | [技能与规则所有权](docs/skills.zh.md) |
| 画板是什么、教学怎么用、谁能清空 | [数学画板](docs/board.zh.md) |
| 引导、知情全解、什么算独立完成 | [教学边界](docs/teaching-boundaries.zh.md) |
| 学生数据布局、数学字段、逐轮记录 | [学生数据目录](docs/data-directory.zh.md) |
| 构建 `resources/`、检查、教学场景 | [开发与验证](docs/development.zh.md) |
