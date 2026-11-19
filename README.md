# baicai-edu

[English](#english) | [中文](#中文)

## English

A general learning-support skill package with a primary-school focus, built on the DeepSeek Harness native skill system. It supports task learning at any age and on-demand learning support, and falls back to general-task teaching when no subject package applies.

### Scope

The scope is deliberately narrow. Stating it up front saves everyone time.

- Not
  - homework supervision
  - catching up in step with the textbook
  - a score sprint
  - answer techniques or essay templates
- Is
  - a child working something out on their own
  - reading a passage, explaining a problem clearly, writing a paragraph
  - just talking for a while when they don't feel like learning

**Chinese** — only Chinese for native-speaking children

- Not
  - character-dictation check-ins
  - reciting classical texts
  - studying exam patterns
- But
  - reading a piece, thinking it through, writing it out

**English** — used as a real language, not a test subject

- Not
  - grammar drilling or grammar lectures
  - cloze technique, reading-test technique
  - word-list memorization or dictation quizzes
  - speaking or pronunciation scores
  - correcting every sentence
- But
  - reading: getting in, guessing, wanting to keep going
  - real tasks instead of mechanical drills: role-play, games, mini-projects
  - children's news from verifiable sources, filtered for age and rewritten to a readable level

**Math** — starting from the known, exploring the unknown

- Not
  - drawing learning boundaries from a curriculum, textbook pacing or grade
  - learning content ahead of time
  - drilling, exam prediction
  - handing over a standard method in place of thinking
- But
  - starting from what is already known and already used with ease
  - first "why do I think this way", then "how should I think", and only then "how to do it"
  - facing the unknown by bridging first, then deriving
  - leaving the choice of method, representation and relations to the child
  - testing understanding by explanation, another method, transfer to a new situation, and problems the child writes
  - letting grade adjust only language, notation and pace, never what may be explored

### Packages

| Directory                                             | Package                        | What it does                                                                                                                                                                                                                                                                        |
| ----------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`learn/`](./learn/README.md)                         | `baicai-edu-learn`             | Shared entries (`/learn-start` `/learn` `/learn-feynman` `/learn-profile` `/learn-save` `/learn-clean`), the teaching base, the student-data protocol, error-item handling, image and handwriting reading                                                                           |
| [`math-common/`](./math-common/README.md)             | `baicai-edu-math`              | The math contracts both bands share (student-made problems, practice evidence, board protocol, handwriting reading); rules only, it never takes part in teaching selection                                                                                                          |
| [`math-primary-low/`](./math-primary-low/README.md)   | `baicai-edu-math-primary-low`  | CGI math, mainly lower primary (grades 1–3, without capping what a student may explore): one-turn teaching, strategy diagnosis, leveled practice, student-made problems to quiz the AI                                                                                              |
| [`math-primary-high/`](./math-primary-high/README.md) | `baicai-edu-math-primary-high` | Multi-method math, mainly upper primary (grades 4–6): one-turn teaching, strategy diagnosis, leveled practice, student-made problems to quiz the AI, real-world modeling; method steps install with the skills, background material in [methods](math-primary-high/docs/methods.md) |
| [`chinese-reading/`](./chinese-reading/README.md)     | `baicai-edu-chinese-reading`   | Complete Chinese: reading, writing, read-write transfer, task generation, feedback and revision, experience bridging                                                                                                                                                                |
| [`english/`](./english/README.md)                     | `baicai-edu-english`           | English: comprehensible input, interaction negotiation, output, scaffolding, tasks, usage accumulation, spaced retrieval, children's news                                                                                                                                           |
| [Math board](./math-board/README.md)                  | `baicai-edu-math-board`        | A Web tool required by lower-primary math and optional for upper primary, usable on its own: switch shapes, group, merge same shapes, express an answer as JSON                                                                                                                     |

`math-primary-low`, `math-primary-high`, `chinese-reading` and `english` declare a dependency on `learn` in their package configuration; both math bands also depend on the shared math contract package `baicai-edu-math` (directory `math-common/`), lower-primary math requires `math-board`, and upper-primary math can install the board explicitly. The shared packages and the board still install on their own, and nothing depends on a subject package in reverse.

Math is split into two packages by band: lower primary mainly grades 1–3, upper primary mainly grades 4–6. The lower band keeps a CGI mainline; the upper band picks a method by task — CPA, explicit instruction, Pólya, variation, inquiry and argument, or modeling. Grade only adjusts language, notation, item types and pace; it is not a content gate, so a student may still explore higher content. Both packages use `math` as the subject id and name their skills `math-low-*` and `math-high-*`, so they install together without a name clash. A new task with a known grade takes the matching band (grades 1–3 low, 4–6 high) and one with no stated grade defaults to low; that does not stop upper-primary students from using the lower package or exploring higher content. A running task keeps the skill name actually recorded at its start.

### Install

As a DSH plugin, explicitly select each subject and its required bundles:

```bash
dsh plugin --profile web add baicai-edu-learn baicai-edu-math baicai-edu-math-board baicai-edu-math-primary-low
dsh plugin --profile web add baicai-edu-learn baicai-edu-math baicai-edu-math-primary-high
dsh plugin --profile web add baicai-edu-learn baicai-edu-chinese-reading
dsh plugin --profile web add baicai-edu-learn baicai-edu-english
```

List required bundles explicitly: pnpm can download a dependency without DSH enabling its bundle. For Electron desktop, install and enable the corresponding packages in plugin management. The checkout installer below selects dependencies for you. All seven packages are on npm: skill packages `0.1.4`, `chinese-reading` `0.1.2`, `math-board` `0.6.2`.

Local checkout in this repository uses the unified entry (it packs the dependency closure into tarballs and installs it the same one-pass way):

```bash
# run in the repository; dependencies are filled in and installed
node scripts/install.mjs math-primary-low --profile web   # learn + math-common + math-board + math-primary-low
node scripts/install.mjs math-primary-high --profile web  # learn + math-common + math-primary-high
# the board is optional for the upper band
node scripts/install.mjs math-primary-high math-board --profile web
node scripts/install.mjs chinese-reading --profile web
node scripts/install.mjs english --profile web
# or all at once
node scripts/install.mjs all --profile web
# preview only
node scripts/install.mjs all --dry-run
```

Either route needs Node.js 22 or newer plus a working DSH/pnpm. Both install the whole dependency closure as top-level profile bundles in one pass; do not hand-link a single subject package instead, because `link:` does not bring its dependencies. Re-installing keeps bundles you disabled by hand. After installing, restart if DSH says so and refresh the Web session, then type `/learn-start` to start. Dependencies, migration and failure handling in full: [installation guide](docs/installation.md).

### Using it

1. `/learn-start`: pick math, Chinese or English, or describe another goal; then identify an existing student or build a profile turn by turn — stage, grade and preferences are optional. With no applicable subject package it falls into general-task teaching. It records `personal.interests`. Chinese uses it to choose reading angles and writing prompts. Math still reads it: the lower band leans on CGI life stories, the upper band chooses a situation, expression, chart or argument by purpose; reusing the same relation in a new situation tests context transfer; and only when a student cannot do the current item does one interest detail bridge it. English uses it for stories, tasks and example sentences, without letting interest override the current language goal.
2. `/learn 分数减法`: enter adaptive learning; or use `/learn` alone to pick a goal from the profile. English can take `/learn 颜色` or plain `/learn`.
3. `/learn-feynman`: Feynman mode — the student explains, the AI asks questions as a student.
4. `/learn-profile`: view or edit the profile.
5. `/learn-save`: save the current session by hand.
6. `/learn-clean`: user command only. Ordinary cleanup keeps identity, originals and backups. It also offers **high-risk** "permanently delete a named student" and "erase all student data", which permanently delete identity, records, originals and backups and are **not automatically recoverable**; you must first confirm the previewed scope, then type a confirmation phrase manually on its own. See [high-risk deletion rules](learn/skills/learn-clean/references/high-risk-deletion.md).

Entry skills come in two kinds: `learn-start` / `learn` / `learn-clean` set `disable-model-invocation: true` and start only when the user types `/name`; `learn-feynman` / `learn-profile` / `learn-save` keep the model entry and load automatically from in-conversation lines such as "let me explain it to you", "show me my profile" or "save this". Skills inside a subject stay model-loadable and are only hidden from the `/` menu with `user-invocable: false`.

`/teach` is already taken by the global `teach` skill on this machine, which is why the Feynman entry is `/learn-feynman`.

When a flow needs the student to make a choice (subject, confirming the student, grade, learning preference, continue or finish, Feynman or transfer), the skill uses `ask_user_question` to raise clickable option cards in DSH Web; the cards also let the student type their own answer or skip. Teaching questions and thinking prompts remain plain text — "how did you work that out?" does not become a button.

### Data

Student state written by the system lives in `outputs/students/` in the **current workspace**; durable originals the user drops in live in `data/students/<id>/<subject>/raw/`. Both `outputs/` and `data/` are gitignored, so teaching output and user originals never mix into the code tree.

```
data/students/
  <student_id>/<subject>/raw/    # originals the user dropped in (read-only; rename with mv)

outputs/students/
  session.json
  <student_id>/
    profile.json                 # name, grade, personal.interests, background
    math/{profile,memory,current_state,milestones,session_log}.json
    chinese/{profile,memory,current_state,milestones,session_log}.json
    english/{profile,memory,current_state,milestones,session_log}.json
    <subject>/extracted/         # analysis markdown
    <subject>/backups/raw/       # originals backed up before a rename
```

`data/.../raw/` is read-only, `extracted/` holds analysis Markdown, and `backups/raw/` holds originals saved before a rename. During a session `session_log.json` is written every turn; `profile.json` / `memory.json` are written only at finalize. The full protocol is in [`learn/skills/learn-data/SKILL.md`](./learn/skills/learn-data/SKILL.md).

### Design documents

- [Documentation index](docs/README.md): every maintainer page, grouped by task, with the language rule for this directory
- [Installation](docs/installation.md) and [publishing](docs/publishing.md) (receiver install, local checkout, dependency closure; publish flow, `resources/` rendering, post-publish verification)
- [Skill call relations and use cases](docs/skill-map/call-graph.md) (package dependencies, call surface, Mermaid call graph and scenario sequences)
- [ADR-0001: shared math contracts and independent band implementations](docs/adr/0001-math-shared-contracts.md) (single source for the shared contract, load path, retained differences); ADR-0002 to 0005 are in `docs/adr/` too
- [Education-foundations index](docs/education-foundations.md) (the three levels distinguished, document map and shared evidence boundary)
- [Support-method source verification](docs/learn-support-evidence.md) (maintainer archive, not loaded at runtime), [synthetic acceptance scenarios](learn/tests/learning-support-scenarios.md) and [supportive-conversation replay](learn/tests/supportive-conversation-scenarios.md): all ages, general-task teaching, the five support kinds, refusal/exit and evidence isolation.
- [Children's math education skill-system audit matrix](docs/research/math-skill-audit-matrix.md): reviews the teaching rules against the R1–R14 literature, separating pedagogical plausibility, teaching effectiveness and agent execution reliability.
- [Maintainer research notes](docs/research/): math representation scaffolding (`math-representation-scaffolding-research.md`), CGI early-algebra sources and the band split (`cgi-early-algebra.md`), autonomy support for the passively arrived learner and the child-AI boundary (`learning-support-autonomy-and-rapport.md`). Not loaded at runtime; research citation stays separate from installed rules.
- Local literature copies live in `docs/refs/`: public full-text PDFs and the `SOURCES.txt` source list, numbered against the audit matrix R1–R14. `.gitignore` ignores that directory, so it is kept on this machine only and therefore is not linked.

### Validation

```bash
# install planning and regression; "all" must list the seven packages, once each
node scripts/install.mjs all --dry-run
node --test scripts/install.test.mjs

# after a real install, check the enabled state of the selected bundles in DSH plugin management
# each of the four subjects' skills directory is its own provider (the two math bands count separately),
# and the shared math contract and the board each register once

# static checks: frontmatter, names, internal entries, dead references, stale fields / Pi leftovers
node scripts/check-skills.mjs
node --test scripts/*.test.mjs
```

Interaction check: open a new session and type `/learn-start`; the first step should raise 数学 / 语文 / 英语 option cards above the composer; pick one and press 提交 (submit) before the model receives an answer. The cards also accept typing or skipping.

Entries stay at three user-only entries (`learn-start`, `learn`, `learn-clean`) and three dual-entry ones (`learn-feynman`, `learn-profile`, `learn-save`); internally `learn-general-core`, `learn-general-session` and `learn-support` were added, and the actual skill count is whatever the static check prints. Experience bridging is located on demand by `chinese-core` as reference documents and is no longer registered separately; math diagnosis and practice keep separate invocation; English loads method skills through `english-session` by condition.

### License

This project is [GPL-3.0-or-later](./LICENSE). Each package directory carries the same `LICENSE` copy, and a published tarball includes it. If you distribute a modified version, the derivative work must also be GPL-3.0 licensed with source provided; to use it inside a proprietary product that is incompatible with the GPL, verify license compatibility first.

### Development environment

Node.js 22 or newer is required (see [.nvmrc](./.nvmrc)), and there are no third-party dependencies. CI runs static checks, contract tests, the board build reproducibility check and the board unit tests on every push and PR; configuration in [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).

## 中文

以小学教学为重点的通用学习支持技能包，采用 DeepSeek Harness 原生 skill 体系；支持全年龄任务学习与按需学习支持，缺少适用学科包时也可使用通用教学。

### 范围

范围刻意收窄，先说清楚，省得彼此耽误。

- 不
  - 陪写作业
  - 对标课本进度同步补课
  - 提分冲刺
  - 教答题技巧和作文模板
- 而是
  - 让孩子自己把一件事想明白
  - 读懂一篇、讲清一道题、写出一段
  - 不想学时可以只聊一会儿

**语文**｜只做中文母语孩子的语文

- 不
  - 默写打卡
  - 文言背诵
  - 研究套路
- 而是
  - 读懂一篇、想清楚、写出来

**英语**｜当真实语言用，不当考试科目

- 不
  - 语法刷题、语法讲解
  - 完形技巧、阅读题技巧
  - 背诵单词、默写测验
  - 口语或发音打分
  - 逐句纠错
- 而是
  - 能读进去、猜得出、还想接着读
  - 用真实任务代替机械操练：角色扮演、游戏、小项目
  - 来自可核实来源的儿童新闻，按年龄筛选并改写到可读水平

**数学**｜从已知出发，探究未知

- 不
  - 按课程大纲、同步课时和年级划定学习边界
  - 提前学知识
  - 刷题、押题
  - 提供标准解法代替思考
- 而是
  - 从已经知道、已经会用的东西出发
  - 先解决“我为什么这样想”，再探索“我应该怎么想”，最后才是“怎么做”
  - 面对未知先搭桥，再推导
  - 把选方法、作表示、找关系的机会留给孩子
  - 用解释、另一种方法、新情境迁移和学生自己出题检验理解
  - 让年级只调整语言、记号与节奏，而不限制探索什么

### 包

| 目录                                                    | 包名                             | 作用                                                                                                                    |
| ----------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| [`learn/`](./learn/README.md)                         | `baicai-edu-learn`             | 共享入口（`/learn-start` `/learn` `/learn-feynman` `/learn-profile` `/learn-save` `/learn-clean`）、教学底座、学生数据协议、错题处理、图片/手写读取 |
| [`math-common/`](./math-common/README.md)             | `baicai-edu-math`              | 两个数学 band 共享的数学契约（学生编题、练习证据、画板协议、手写读取）；只给规则，不参与教学选型                                                                   |
| [`math-primary-low/`](./math-primary-low/README.md)   | `baicai-edu-math-primary-low`  | 小学低年级为主的 CGI 数学（1–3 年级为主，不限制探究高年级内容）：一回合教学、策略诊断、分层练习、学生出题考 AI                                                         |
| [`math-primary-high/`](./math-primary-high/README.md) | `baicai-edu-math-primary-high` | 小学高年级多方法数学（4–6 年级为主）：一回合教学、策略诊断、分层练习、学生出题考 AI、真实情境建模；方法步骤随技能安装，背景材料见 [methods](math-primary-high/docs/methods.md)     |
| [`chinese-reading/`](./chinese-reading/README.md)     | `baicai-edu-chinese-reading`   | 完整语文：阅读、写作、读写迁移、出题、评改、经验桥接                                                                                            |
| [`english/`](./english/README.md)                     | `baicai-edu-english`           | 英语：可理解输入、对话协商、输出、支架、任务、用法积累、间隔提取、儿童新闻                                                                                 |
| [数学画板](./math-board/README.md)                        | `baicai-edu-math-board`        | 低年级数学必需、高年级可选，也可独立使用的 Web 教具：切换图案、分组、同形合并，以 JSON 表达回答                                                                 |

`math-primary-low`、`math-primary-high`、`chinese-reading` 与 `english` 在包配置中声明依赖 `learn`；两个数学 band 还依赖共享数学契约包 `baicai-edu-math`（目录 `math-common/`），低年级数学必需依赖 `math-board`，高年级数学可显式选装画板。共享包和画板仍可独立安装，不反向依赖学科。

数学按年级段分两个包：低年级以 1–3 年级为主，高年级以 4–6 年级为主，低年级保留 CGI 主线，高年级按任务选择 CPA、显式教学、Pólya、变式、探究论证与建模等方法；年级只调整语言、记号、题型与节奏，不是内容门槛，学生仍可探究更高内容。两个包的科目 id 同为 `math`，技能分别命名为 `math-low-*` 与 `math-high-*`，可以同时安装而不重名。新任务有明确年级时优先对应带（1–3 年级 low、4–6 年级 high），无明确年级时默认 low；这不限制高年级使用低年级包或探索更高内容。进行中的任务保留已记录的实际技能名。

### 安装

作为 DSH 插件安装，每条命令显式选中学科及其必需 bundle：

```bash
dsh plugin --profile web add baicai-edu-learn baicai-edu-math baicai-edu-math-board baicai-edu-math-primary-low
dsh plugin --profile web add baicai-edu-learn baicai-edu-math baicai-edu-math-primary-high
dsh plugin --profile web add baicai-edu-learn baicai-edu-chinese-reading
dsh plugin --profile web add baicai-edu-learn baicai-edu-english
```

请显式列出必需 bundle：pnpm 下载依赖不等于 DSH 启用它。Electron 桌面端请在插件管理中安装并启用对应各包。下方的 checkout 安装器会自动列出依赖。七个包均已发布到 npm：技能包 `0.1.4`、`chinese-reading` `0.1.2`、`math-board` `0.6.2`。

本仓库本地 checkout 用统一入口（它把依赖闭包 pack 成 tarball，按同样的一次性方式安装）：

```bash
# 在仓库中运行；自动补齐并安装依赖
node scripts/install.mjs math-primary-low --profile web   # learn + math-common + math-board + math-primary-low
node scripts/install.mjs math-primary-high --profile web  # learn + math-common + math-primary-high
# 高年级可选装画板
node scripts/install.mjs math-primary-high math-board --profile web
node scripts/install.mjs chinese-reading --profile web
node scripts/install.mjs english --profile web
# 或一次装齐
node scripts/install.mjs all --profile web
# 仅预览
node scripts/install.mjs all --dry-run
```

两种方式都需要 Node.js 22 或更高版本与可用的 DSH/pnpm。两种方式都把整个依赖闭包作为 profile 顶层 bundle 一次安装；不要只手工 link 一个学科包，`link:` 不会带上它的依赖。重复安装保留此前手动禁用的 bundle。安装后按 DSH 输出决定是否重启并刷新 Web 会话，输入 `/learn-start` 开始。完整依赖、迁移与失败处理见[安装说明](docs/installation.md)。

### 使用

1. `/learn-start`：选数学、语文、英语或描述其他目标，识别已有学生或逐轮建档；阶段、年级和偏好可选。缺少适用学科包时进入通用任务教学；会记录 `personal.interests`。语文用它选择阅读角度和写作题目。数学仍读取该字段；低年级以 CGI 生活故事为主，高年级按目的选择情境、算式、图表或论证；同一关系换场景可检验情境迁移；只在学生做不出当前题时用一个兴趣细节搭桥。英语用它选择故事、任务和例句内容，不让兴趣覆盖当前语言目标。
2. `/learn 分数减法`：进入自适应学习；也可以直接 `/learn` 从档案选目标。英语可以写 `/learn 颜色` 或直接 `/learn`。
3. `/learn-feynman`：费曼模式，学生讲、AI 当学生提问。
4. `/learn-profile`：查看或修改档案。
5. `/learn-save`：手动保存当前会话。
6. `/learn-clean`：仅用户命令发起，普通清理保留身份、原件和备份；另提供**高风险**「彻底删除指定学生」「清空所有学生数据」，会永久删除身份、记录、原件及备份，**不可自动恢复**，须先确认预览范围，再独立手动输入确认短语。详见 [高风险删除规则](learn/skills/learn-clean/references/high-risk-deletion.md)。

入口 skill 分两档：`learn-start` / `learn` / `learn-clean` 设置 `disable-model-invocation: true`，只能由用户主动输入 `/name` 发起；`learn-feynman` / `learn-profile` / `learn-save` 保留模型入口，支持“我来给你讲”“看看我的档案”“保存一下”这类对话内自动加载。学科内部 skill 保持模型可加载，只通过 `user-invocable: false` 从 `/` 菜单隐藏。

`/teach` 已被本机全局 `teach` 技能占用，因此费曼入口使用 `/learn-feynman`。

需要学生做一个流程选择时（选科目、确认学生、年级、学习偏好、继续/结束、费曼或迁移），技能用 `ask_user_question` 在 DSH Web 中弹出可点击的选项卡片；卡片也允许学生自己填写或跳过。教学中的追问和思考题仍是普通文字，不把“你是怎么想的？”做成按钮。

### 数据

系统写出的学生状态在**当前工作区**的 `outputs/students/`；用户投放的持久原件在 `data/students/<id>/<subject>/raw/`。`outputs/` 与 `data/` 均 gitignored，不把教学产物或用户原件混进代码目录。

```
data/students/
  <student_id>/<subject>/raw/    # 用户投放原件（只读；可 mv 改名）

outputs/students/
  session.json
  <student_id>/
    profile.json                 # 姓名、年级、personal.interests、经历
    math/{profile,memory,current_state,milestones,session_log}.json
    chinese/{profile,memory,current_state,milestones,session_log}.json
    english/{profile,memory,current_state,milestones,session_log}.json
    <subject>/extracted/         # 分析 md
    <subject>/backups/raw/       # 改名前的原件备份
```

`data/.../raw/` 只读，`extracted/` 放分析 Markdown，`backups/raw/` 放改名前的原件备份。会话进行中每轮写 `session_log.json`；`profile.json` / `memory.json` 只在 finalize 写。详细协议见 [`learn/skills/learn-data/SKILL.md`](./learn/skills/learn-data/SKILL.md)。

### 设计文档

- [文档索引](docs/README.md)：按任务分组的全部维护者文档，以及本目录的语言约定
- [安装说明](docs/installation.md)与[发布与技能渲染](docs/publishing.md)（接收方安装、本地 checkout、依赖闭包；发布流程、`resources/` 渲染、发布后验收）
- [技能调用关系与使用场景](docs/skill-map/call-graph.md)（包依赖、调用面、Mermaid 调用图与场景时序）
- [ADR-0001：共享数学契约与独立 band 实现](docs/adr/0001-math-shared-contracts.md)（共同契约唯一来源、载入链路与保留差异）；ADR-0002 至 0005 同在 `docs/adr/`
- [教育依据总索引](docs/education-foundations.md)（三个层次的区分、文档地图与共同证据边界）
- [支持方法来源核验](docs/learn-support-evidence.md)（维护者存档，运行时不加载）、[合成场景验收](learn/tests/learning-support-scenarios.md)与[支持性交流回放](learn/tests/supportive-conversation-scenarios.md)：全年龄、通用任务教学、五类支持、拒绝/退出与证据隔离。
- [儿童数学教育 Skill 体系审核矩阵](docs/research/math-skill-audit-matrix.md)：对照 R1–R14 文献审视教学规则的教育学与认知科学依据，区分理论合理性、教学有效性与智能体执行可靠性。
- [维护者研究笔记](docs/research/)：数学表征支架（`math-representation-scaffolding-research.md`）、CGI 早期代数来源与学段分工（`cgi-early-algebra.md`）、被动来学者的自主支持与儿童 AI 边界（`learning-support-autonomy-and-rapport.md`）。运行时不加载，研究引用与已安装规则分离。
- 本地文献副本在 `docs/refs/`：公开全文 PDF 与来源清单 `SOURCES.txt`，编号对应审核矩阵 R1–R14。`.gitignore` 忽略了该目录，仅在本机保留，因此不提供链接。

### 验证

```bash
# 安装规划及回归测试；all 应列出七个包，各一次
node scripts/install.mjs all --dry-run
node --test scripts/install.test.mjs

# 实际安装后，在 DSH 插件管理中检查所选 bundle 的启用状态
# 四个学科的 skills 目录各为独立 provider（数学两个年级段包各一个），共享数学契约与画板各注册一次

# 静态检查：frontmatter、名称、内部入口、失效引用、旧字段/Pi 残留
node scripts/check-skills.mjs
node --test scripts/*.test.mjs
```

交互检查：新开会话输入 `/learn-start`，第一步应在输入区出现「数学」「语文」「英语」选项卡片；点选一个再按「提交」，模型才能收到回答。卡片也允许直接输入或跳过。

入口保持 3 个纯用户入口（`learn-start`、`learn`、`learn-clean`）和 3 个双开入口（`learn-feynman`、`learn-profile`、`learn-save`）；内部增加 `learn-general-core`、`learn-general-session` 与 `learn-support`，实际技能数以静态检查输出为准。经验桥接由 `chinese-core` 按需定位参考文档，不再独立注册；数学诊断与练习保留独立调用；英语由 `english-session` 按条件加载方法 skill。

### 许可证

本项目采用 [GPL-3.0-or-later](./LICENSE)。每个包目录下各有同一份 `LICENSE` 副本，发布的 tarball 会带上它。修改后分发时，衍生作品同样需以 GPL-3.0 授权并提供源码；若要在不兼容 GPL 的专有产品中使用，请先确认许可兼容性。

### 开发环境

需要 Node.js 22 或更高版本（见 [.nvmrc](./.nvmrc)），无第三方依赖。CI 在每次推送和 PR 上运行静态检查、契约测试、画板构建可复现性检查和画板单元测试，配置见 [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)。
