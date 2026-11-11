# dsh-edu-math-primary-high

以小学高年级（4–6 年级）为主的多方法数学教学包，以学生思路为起点，按任务、先修知识与实际表现选择方法。年级只调整语言、记号、题型和节奏，不限制学生探究更高内容；仅依赖 `dsh-edu-learn` 与共享数学契约包 `dsh-edu-math`，无需画板也能完整教学。低年级（1–3 年级）对应包为 [`math-primary-low/`](../math-primary-low/README.md)。

## 与低年级包的关系

- 两个包使用唯一技能名：本包为 `math-high-*`，低年级包为 `math-low-*`。选型由 `learn-data` 的 `references/teaching-resolver.md` 统一负责：已知 1–3 年级优先 low、4–6 年级优先 high，缺年级默认 low。优先级不是内容门槛，low 也支持高阶内容。同一场进行中的任务不会因为另一个包安装而热替换；`supported_stages` 只声明本包适配的默认表达与流程。
- 本包的 `math-high-core`、`math-high-diagnose`、`math-high-practice` 等写法以高年级的认知与表达为默认，不等于低年级包的复制；两者的差异只在各自 `references/` 中维护。
- 学生编题、练习证据策略、画板协议与手写读取的共同规则由 [`math-common`](../math-common/README.md) 维护唯一一份，本包在对应分支出现时按名加载。手写读取契约由本包 `math-high-core` 条件行直接加载（年级无关、无本地增补），先读契约再加载 `learn-read-image`。本包保留并在本地 reference 中显式维护高年级差异：任务选方法、直接计算与显式教学开场、批次与局部归因、不自动清板、建模 leaf。共享包不参与教学选型，也不替代本包的 `math-high-core` / `math-high-session`。
- 高年级使用画板、需要图示或补基础，都不意味着应切换低年级包。学科判断先修缺口、支架及适配理由；learn 统一承接流程选择、确认、保存与新任务解析。低年级包按已确认的学生阶段适配，不按一次答错或工具需求推荐。
- CGI 保留关注学生真实策略的作用，不再统领所有教学。概念用 CPA，程序可直接用显式教学，陌生题用 Pólya，辨析迁移用变式，规律用探究论证，真实决策用建模；形成性评价贯穿过程。选择与步骤见[教学核心](skills/math-high-core/references/math-teaching-core.md)。

## 技能

| 技能 | 职责 |
|---|---|
| `math-high-session` | 高年级教学主线、恢复焦点、四个 act 的唯一调度者、唯一 segment 合并者 |
| `math-high-core` | 共享规则（教学、诊断、支架、学分活动分配、画板、学科契约），references 按条件读取 |
| `math-high-diagnose` | 策略诊断、知识点的先修检查、错题分流、有证据的阶段估计 |
| `math-high-practice` | 诊断、对比、变式、连接；多题练习按子题逐个推进；一次一题，目的不是等级 |
| `math-high-student-problem` | 学生编题、AI 验算回答、学生批改；普通模式限已确认技能可交故意错答，并在收束前澄清 |
| `math-high-application-modeling` | 真实情境建模：情境、方案、表示、数量与单位、验证、结论六部分 |

六个均为 `user-invocable: false`，不进 `/` 菜单。`/learn`、`/learn-feynman` 经 lifecycle 统一进入 `math-high-session`；仅 session 调度四个 leaf，leaf 只回传证据与下一动作信号，不互调。等待学生时保留原步骤；证据足够且无待答问题时，同轮最多两次 leaf 调度。

高年级方法（CPA、Pólya、变式、探究证明、显式教学、形成性反思、数学建模、知识图谱、任务生成、进展追踪、手写数学阅读、coach 规则）的运行步骤在已安装技能中；方法名与落点的维护者映射见 [`docs/math-primary-high-methods.md`](../docs/math-primary-high-methods.md)，不是独立可安装技能。

## 推导与证明

共用[教学核心](<skills/math-high-core/references/math-teaching-core.md>)和[支架校准](<skills/math-high-core/references/scaffold-calibration.md>)，按任务读取专门模块：

- [推导教学](<skills/math-high-core/references/derivation-teaching.md>)：观察与猜想、关系发现、公式推导；保留公式揭示前的目标门与七步搭桥循环。
- [复杂应用题的关系推导](<skills/math-high-core/references/word-problem-derivation.md>)：复用七步搭桥循环，覆盖行程、工程等题中的中间量选择、时间起点、分段关系和原条件检验；保留学生有效的算术、方程或图表路线。普通教材题不因情境或步骤多而转建模，也不强制进入形式证明或公式发现流程。
- [证明教学](<skills/math-high-core/references/proof-teaching.md>)：命题及量词分析、策略选择、逻辑有效性、学生自主组织与检验。区分独立构建、理解给定证明、修复论证和整理表达；有效的学生替代路线优先于预设路线。

证明是当前 act 内的方法，不新增技能、调度分支、长期字段或能力阶段。对话内障碍和支持只放在现有临时状态；学习记录分开描述猜想、支持下完成及独立证明。有限举例不能证明一般命题，有效见证可以证明存在性。完整证明的明确请求可直接响应，不强加探索或练习。

## 安装

```bash
# 在仓库根目录运行，安装 learn、math-common、math-primary-high
node scripts/install.mjs math-primary-high --profile web
# 如需可选画板，显式加装
node scripts/install.mjs math-primary-high math-board --profile web
```

按 DSH 输出决定是否重启，再刷新 Web 会话，在 `/learn` 或 `/learn-feynman` 选择数学。共享依赖：`learn-core` 管教学、角色与确认；`learn-data` 管快照、记录和 finalize；`learn-errors` 管投放文件。安装器补齐依赖，但不会重新启用此前手动禁用的 bundle；不要以单独 link 数学包替代完整安装。详见[统一安装说明](<../docs/installation.md>)。

## 数学画板

独立画板插件在输入框工具栏、模型选择按钮旁提供「数学画板」。学生摆图、圈组、合并/拆开、划去或写说明，自定图案数值与颜色；「放入回答」附上 JSON，不插入图形清单，学生自己写的话会放进输入框，仍需手动发送；画板和修改记录都留着，方便改错。点「清空」会同时清掉画布和这次的修改记录。画板不运算、不自动提交。

模型读取已发送附件教学，不读未提交画布；学生明确设置意图时可用 `math_board_settings` 同步会话设置，不代交答案。画板协议的字段、附件读取顺序、修改记录解读、信任边界与设置读写以共享的 [`board-contract`](../math-common/skills/math-common/references/board-contract.md) 为准；本包的入口与本地差异见[结构化数学画板](skills/math-high-core/references/structured-drawing.md)。

本包不因新题、新活动、新主题或下一子题自动清空画板。仅学生在消息正文中明确要求清空时，按[画板边界规则](skills/math-high-core/references/board-task-boundary.md)调用工具；请求记录成功不代表客户端已执行。[批量题规则](skills/math-high-core/references/batch-board-boundary.md)只处理子题证据归属与保留，不授权清空。画板未安装或不可用时，使用文字、算式、表格或纸笔图片继续教学。

## 数据与维护

系统状态在 `outputs/students/`，用户原件在 `data/students/<student_id>/math/raw/`；均不随包发布。原件只读，改名先备份至 `outputs/students/<student_id>/math/backups/raw/`，处理交共享技能。

学生编题、练习证据与画板协议只维护在 `dsh-edu-math`，本包 reference 只保留高年级增补；共享契约变更时两个 band 的共同场景与差异场景都要回放。数学技能复用有效快照，并读取共享 `personal.interests` 与科目偏好。题型按教学目的选择，故事、计算、图表、等式和论证各有用途；同一关系换场景可检验情境迁移，兴趣只在学生做不出当前题时搭桥。用法见 `skills/math-high-core/references/math-personalization.md`。每轮唯一 segment 由调用方追加到 `session_log.json`；档案与 finalize 由共享协议执行，完整结构见 `learn-data`。

```bash
node scripts/check-skills.mjs
node --test scripts/skill-contracts.test.mjs
git diff --check
```

[教学行为对照场景](tests/teaching-scenarios.md)用于人工审阅/模型回放；静态检查不等于行为实测。
