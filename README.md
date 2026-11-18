# baicai-edu

以小学教学为重点的通用学习支持技能包，采用 DeepSeek Harness 原生 skill 体系；支持全年龄任务学习与按需学习支持，缺少适用学科包时也可使用通用教学。

## 包

| 目录 | 包名 | 作用 |
|---|---|---|
| [`learn/`](./learn/README.md) | `baicai-edu-learn` | 共享入口（`/learn-start` `/learn` `/learn-feynman` `/learn-profile` `/learn-save` `/learn-clean`）、教学底座、学生数据协议、错题处理、图片/手写读取 |
| [`math-common/`](./math-common/README.md) | `baicai-edu-math` | 两个数学 band 共享的数学契约（学生编题、练习证据、画板协议、手写读取）；只给规则，不参与教学选型 |
| [`math-primary-low/`](./math-primary-low/README.md) | `baicai-edu-math-primary-low` | 小学低年级为主的 CGI 数学（1–3 年级为主，不限制探究高年级内容）：一回合教学、策略诊断、分层练习、学生出题考 AI |
| [`math-primary-high/`](./math-primary-high/README.md) | `baicai-edu-math-primary-high` | 小学高年级多方法数学（4–6 年级为主）：一回合教学、策略诊断、分层练习、学生出题考 AI、真实情境建模；方法步骤随技能安装，背景材料见 [methods](<math-primary-high/docs/methods.md>) |
| [`chinese-reading/`](./chinese-reading/README.md) | `baicai-edu-chinese-reading` | 完整语文：阅读、写作、读写迁移、出题、评改、经验桥接 |
| [`english/`](./english/README.md) | `baicai-edu-english` | 英语：可理解输入、对话协商、输出、支架、任务、用法积累、间隔提取、儿童新闻 |
| [数学画板](<./math-board/README.md>) | `baicai-edu-math-board` | 低年级数学必需、高年级可选，也可独立使用的 Web 教具：切换图案、分组、同形合并，以 JSON 表达回答 |

`math-primary-low`、`math-primary-high`、`chinese-reading` 与 `english` 在包配置中声明依赖 `learn`；两个数学 band 还依赖共享数学契约包 `baicai-edu-math`（目录 `math-common/`），低年级数学必需依赖 `math-board`，高年级数学可显式选装画板。共享包和画板仍可独立安装，不反向依赖学科。

数学按年级段分两个包：低年级以 1–3 年级为主，高年级以 4–6 年级为主，低年级保留 CGI 主线，高年级按任务选择 CPA、显式教学、Pólya、变式、探究论证与建模等方法；年级只调整语言、记号、题型与节奏，不是内容门槛，学生仍可探究更高内容。两个包的科目 id 同为 `math`，技能分别命名为 `math-low-*` 与 `math-high-*`，可以同时安装而不重名。新任务有明确年级时优先对应带（1–3 年级 low、4–6 年级 high），无明确年级时默认 low；这不限制高年级使用低年级包或探索更高内容。进行中的任务保留已记录的实际技能名。

## 安装

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

需要 Node.js 与可用的 DSH/pnpm。统一入口将依赖闭包作为 profile 顶层 bundle 一次安装，避免“包已下载但未启用”；不要只手工 link 一个学科包。重复安装保留此前手动禁用的 bundle。安装后按 DSH 输出决定是否重启并刷新 Web 会话，输入 `/learn-start` 开始。完整依赖、迁移与失败处理见[安装说明](<docs/installation.md>)。

## 使用

1. `/learn-start`：选数学、语文、英语或描述其他目标，识别已有学生或逐轮建档；阶段、年级和偏好可选。缺少适用学科包时进入通用任务教学；会记录 `personal.interests`。语文用它选择阅读角度和写作题目。数学仍读取该字段；低年级以 CGI 生活故事为主，高年级按目的选择情境、算式、图表或论证；同一关系换场景可检验情境迁移；只在学生做不出当前题时用一个兴趣细节搭桥。英语用它选择故事、任务和例句内容，不让兴趣覆盖当前语言目标。
2. `/learn 分数减法`：进入自适应学习；也可以直接 `/learn` 从档案选目标。英语可以写 `/learn 颜色` 或直接 `/learn`。
3. `/learn-feynman`：费曼模式，学生讲、AI 当学生提问。
4. `/learn-profile`：查看或修改档案。
5. `/learn-save`：手动保存当前会话。
6. `/learn-clean`：仅用户命令发起，普通清理保留身份、原件和备份；另提供**高风险**「彻底删除指定学生」「清空所有学生数据」，会永久删除身份、记录、原件及备份，**不可自动恢复**，须先确认预览范围，再独立手动输入确认短语。详见 [高风险删除规则](<learn/skills/learn-clean/references/high-risk-deletion.md>)。

入口 skill 分两档：`learn-start` / `learn` / `learn-clean` 设置 `disable-model-invocation: true`，只能由用户主动输入 `/name` 发起；`learn-feynman` / `learn-profile` / `learn-save` 保留模型入口，支持“我来给你讲”“看看我的档案”“保存一下”这类对话内自动加载。学科内部 skill 保持模型可加载，只通过 `user-invocable: false` 从 `/` 菜单隐藏。

`/teach` 已被本机全局 `teach` 技能占用，因此费曼入口使用 `/learn-feynman`。

需要学生做一个流程选择时（选科目、确认学生、年级、学习偏好、继续/结束、费曼或迁移），技能用 `ask_user_question` 在 DSH Web 中弹出可点击的选项卡片；卡片也允许学生自己填写或跳过。教学中的追问和思考题仍是普通文字，不把“你是怎么想的？”做成按钮。

## 数据

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

## 设计文档

- [技能调用关系与使用场景](<docs/skill-map/call-graph.md>)（包依赖、调用面、Mermaid 调用图与场景时序）
- [ADR-0001：共享数学契约与独立 band 实现](<docs/adr/0001-math-shared-contracts.md>)（共同契约唯一来源、载入链路与保留差异）
- [教育依据总索引](<docs/education-foundations.md>)（三个层次的区分、文档地图与共同证据边界）
- [支持方法来源核验](<docs/learn-support-evidence.md>)（维护者存档，运行时不加载）、[合成场景验收](<learn/tests/learning-support-scenarios.md>)与[支持性交流回放](<learn/tests/supportive-conversation-scenarios.md>)：全年龄、通用任务教学、五类支持、拒绝/退出与证据隔离。
- [儿童数学教育 Skill 体系审核矩阵](<docs/research/math-skill-audit-matrix.md>)：对照 R1–R14 文献审视教学规则的教育学与认知科学依据，区分理论合理性、教学有效性与智能体执行可靠性。
- [维护者研究笔记](<docs/research/>)：数学表征支架（`math-representation-scaffolding-research.md`）、CGI 早期代数来源与学段分工（`cgi-early-algebra.md`）、被动来学者的自主支持与儿童 AI 边界（`learning-support-autonomy-and-rapport.md`）。运行时不加载，研究引用与已安装规则分离。
- [本地文献副本](<docs/refs/>)：公开全文 PDF 与来源清单 `SOURCES.txt`，编号对应审核矩阵 R1–R14；`.gitignore` 忽略了此目录，仅在本机保留。

## 验证

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

## 许可证

本项目采用 [GPL-3.0-or-later](./LICENSE)。每个包目录下各有同一份 `LICENSE` 副本，发布的 tarball 会带上它。修改后分发时，衍生作品同样需以 GPL-3.0 授权并提供源码；若要在不兼容 GPL 的专有产品中使用，请先确认许可兼容性。

## 开发环境

需要 Node.js 22 或更高版本（见 [.nvmrc](./.nvmrc)），无第三方依赖。CI 在每次推送和 PR 上运行静态检查、契约测试、画板构建可复现性检查和画板单元测试，配置见 [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)。
