# baicai-edu-math-primary-high 白菜小学数学（高年级）

[English](#english) | [中文](#中文)

## English

Task-driven upper-primary math for grades 4–6. The student's own thinking is the starting point and the method follows the task — CPA, explicit instruction, Pólya, variation, inquiry and proof, or real-world modeling — rather than one pedagogy owning every turn. Grade tunes language, notation, item types and pace only, never what a student may explore. It depends on `baicai-edu-learn` and the shared contract package `baicai-edu-math`; the math board is optional and a full lesson works without it. The grades 1–3 package is [`math-primary-low/`](https://github.com/gengyabc/baicai-edu/blob/main/math-primary-low/README.md), and both share the `math` subject id.

### Entries

The package adds no command; math is reached through the shared entries, and the lesson runs in `math-high-session`.

| Command | Purpose |
|---|---|
| `/learn-start` | Pick math in the subject table, identify or create the student |
| `/learn` | Math teaching mainline: choose the act, choose one method, advance one action, record one segment |
| `/learn-feynman` | The student explains or proves it; the AI listens as a classmate |

The resolver picks the band from a known grade (1–3 → low, 4–6 → high, no grade → low), so the same `math` subject can carry both packages at once. That priority is not a content gate, and a running task keeps the band it was started with.

### Install

```bash
# from the repository root: installs learn, math-common and this band
node scripts/install.mjs math-primary-high --profile web
# add the optional board explicitly
node scripts/install.mjs math-primary-high math-board --profile web
```

Restart if DSH says so, then refresh the Web session. When it worked, the model catalog lists the `math-high-*` skills, `/` shows no math command of its own, and choosing math in `/learn` enters the high band. Shared dependencies: `learn-core` owns teaching, roles and confirmation; `learn-data` owns snapshots, records and finalize; `learn-errors` owns dropped files. The installer fills dependencies in but does not re-enable a bundle you disabled by hand; do not replace a full install with a lone `link:` of a math package. Unified entry, re-install and manual-disable behavior: [installation guide](<https://github.com/gengyabc/baicai-edu/blob/main/docs/installation.md>).

### What is irreversible

- `data/.../raw/` originals are read-only; rename only after backing up.
- Deleting student data belongs to `learn-clean`, not this package, and its high-risk forms are permanent.
- This band never clears the board on its own. A clear happens only on an explicit student request in the message body, and the tool recording the request is not the client having applied it.

### Where the data lives

System state is in `outputs/students/`, user originals in `data/students/<student_id>/math/raw/`. Both sit in the current workspace and never ship. Field paths and per-turn records: [student data directories](docs/data-directory.md).

### Further reading

| To learn about | Go to |
|---|---|
| Which skill owns which rule, the four acts, band selection, shared contracts | [Skills and rule ownership](docs/skills.md) |
| Method names, their installed homes, and the derivation/proof modules | [Methods, derivation and proof](docs/methods.md) |
| Using the optional board and who may clear it | [The math board](docs/board.md) |
| Guided work, informed full proof, and what counts as independent | [Teaching boundaries](docs/teaching-boundaries.md) |
| Student data layout, math fields, per-turn records | [Student data directories](docs/data-directory.md) |
| Building `resources/`, checks, teaching scenarios | [Development and validation](docs/development.md) |

## 中文

以小学高年级（4–6 年级）为主的多方法数学教学包。学生的思路是起点，方法跟着任务走——CPA、显式教学、Pólya、变式、探究与证明、真实情境建模——而不是让某一种教学法统领每一轮。年级只调整语言、记号、题型和节奏，从不限制学生探究什么。它只依赖 `baicai-edu-learn` 和共享契约包 `baicai-edu-math`；画板是可选项，没有画板也能完整教学。1–3 年级对应包为 [`math-primary-low/`](https://github.com/gengyabc/baicai-edu/blob/main/math-primary-low/README.md)，两者科目 id 同为 `math`。

### 入口

本包不新增命令，数学通过共享入口进入，课程在 `math-high-session` 里跑。

| 命令 | 作用 |
|---|---|
| `/learn-start` | 在科目表里选数学，识别或创建学生 |
| `/learn` | 数学教学主线：选教学环节、选一个方法、推进一个动作、记录唯一回合段 |
| `/learn-feynman` | 学生讲或证，AI 当同龄同学听 |

选型按已知年级决定带（1–3 年级 → 低年级包，4–6 年级 → 高年级包，无年级 → 低年级包），所以同一个 `math` 科目下两个包可以同时安装。这个优先级不是内容门槛；进行中的任务保留开始时的带。

### 安装

```bash
# 在仓库根目录运行：安装 learn、math-common 与本年级段包
node scripts/install.mjs math-primary-high --profile web
# 需要可选画板时显式加装
node scripts/install.mjs math-primary-high math-board --profile web
```

按 DSH 输出决定是否重启，再刷新 Web 会话。装好后模型目录里有 `math-high-*` 技能，`/` 不新增数学命令，在 `/learn` 里选数学进入高年级带。共享依赖：`learn-core` 管教学、角色与确认；`learn-data` 管快照、记录与收尾保存；`learn-errors` 管投放文件。安装器补齐依赖，但不会重新启用此前手动禁用的技能包；不要用 `link:` 单独装数学包来替代完整安装。统一入口、重复安装与手动禁用见[统一安装说明](<https://github.com/gengyabc/baicai-edu/blob/main/docs/installation.md>)。

### 不可逆的部分

- `data/.../raw/` 原件只读，改名须先备份。
- 删除学生数据归 `learn-clean`，不属于本包，其中高风险形式永久不可恢复。
- 本带不会自行清空画板。只有学生在消息正文中明确要求时才清空，且工具记录请求不等于客户端已经执行。

### 数据放在哪

系统状态在 `outputs/students/`，用户原件在 `data/students/<student_id>/math/raw/`。两处都在当前工作区，不随包发布。字段路径与逐轮记录见[学生数据目录](docs/data-directory.zh.md)。

### 深入阅读

| 想了解 | 位置 |
|---|---|
| 哪条规则归谁、四个教学环节、带的选择、共享契约 | [技能与规则所有权](docs/skills.zh.md) |
| 方法名与已安装落点、推导与证明模块 | [方法、推导与证明](docs/methods.zh.md) |
| 可选画板的用法与谁能清空 | [数学画板](docs/board.zh.md) |
| 引导、知情后的完整证明、什么算独立完成 | [教学边界](docs/teaching-boundaries.zh.md) |
| 学生数据布局、数学字段、逐轮记录 | [学生数据目录](docs/data-directory.zh.md) |
| 构建 `resources/`、检查、教学场景 | [开发与验证](docs/development.zh.md) |
