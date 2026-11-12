# Issue 12 — 反例构造与命题方向交付与分层验收

日期：2026-11-12。分支 `implement/math-counterexample`；固定旧侧 `9250e20`（`fix(math-board): address the review findings on the geometry board`）。实现范围为现有高年级 [证明教学](<../../math-primary-high/skills/math-high-core/references/proof-teaching.md>) 的命题分析 / [题目设计](<../../math-primary-high/skills/math-high-core/references/problem-design.md>) 的选题，新增按需 [反例与命题方向](<../../math-primary-high/skills/math-high-core/references/counterexamples-and-proposition-direction.md>)；无新 Skill、act、submode、长期字段、班级或第二套逻辑框架。未安装或更改任何运行中 profile，未读写 `data/` 或 `outputs/`，未修改 `GLOSSARY.md` 与 `docs/math-primary-high-methods.md`。

本票是批次 D 第二张，独立实现，未引用也不依赖 10/11 的任何文件；验收记录与 artifacts 只使用本 worktree 内路径。

## 已执行：静态与有限数学核验

接缝由父代理确认：既有 `scripts/skill-contracts.test.mjs` 静态/契约守卫 + 有限枚举脚本。静态守卫只验证条件可达、单一来源与披露边界，不证明模型教学效果；数学脚本只核验教师案例，不充当学生独立探索的材料。

| 命令 | 实际结果与范围 |
|---|---|
| `node --check scripts/skill-contracts.test.mjs`（先） | 退出0；首次红跑发现自己写的断言列表有语法错误，修正后才进入预期红。此步不记为TDD证据。 |
| `node --test --test-name-pattern='counterexample' scripts/skill-contracts.test.mjs`（实现前） | **RED**：2 项失败，退出1。失败点分别为 proof-teaching 无 `references/counterexamples-and-proposition-direction.md` 指针（`did not match the regular expression`）与 reference 文件不存在（`ENOENT … counterexamples-and-proposition-direction.md`）。属于预期失败，不是环境故障。见[红跑输出](<artifacts-12/contracts-red.txt>)。 |
| 同上（逐项实现后） | **GREEN**：2 passed，退出0。见[绿跑输出](<artifacts-12/contracts-green.txt>)。中途的 4 次再红（problem-design 指针、coverage 短语、scenarios 段落、单一来源断言）都是内容未写全的预期红，逐条补齐后转绿，未改动被断言无关的其他规则。 |
| `node --test scripts/skill-contracts.test.mjs` | 110 tests：110 passed，0 failed，0 skipped，退出0。见[完整输出](<artifacts-12/contracts-full.txt>)。 |
| `node scripts/check-skills.mjs` | 43 skills，0 errors，0 warnings，退出0。见[输出](<artifacts-12/skill-check.txt>)。 |
| `node --check .scratch/math-strategy-extension/counterexample-case-validation.mjs` | 退出0。 |
| `node .scratch/math-strategy-extension/counterexample-case-validation.mjs` | PASS，退出0。见[数学核验输出](<artifacts-12/math-check.txt>)。 |
| `node --test scripts/*.test.mjs` | 162 tests：161 passed，0 failed，1 skipped，退出0。跳过项为 `real DSH installs, composes, deduplicates and preserves explicit disablement`（真实安装集成），按未执行计。见[完整输出](<artifacts-12/full-suite.txt>)。 |
| `git diff --check` | 通过（退出0）；提交前对新增未跟踪文档另做行尾空白检查。 |

本变更为 Markdown 与 MJS；仓库与高年级包均无 typecheck 脚本，未虚构 typecheck 结果，以两份 MJS 的 `node --check` 记录实际检查。

### 数学核验细节（教师案例层）

[可重复核验脚本](<counterexample-case-validation.mjs>) 用 `assert/strict` 精确断言，不把待验证数字当预期值硬编码。

- **A 4×4 棋盘**：16 格，删 (1,2)、(2,1)、(3,3)、(4,4)（两个白、两个黑），余 12 格，黑 6、白 6，前提成立；(1,1) 仍在且其两个邻格均被删，邻接边数用两种独立方式计得为 12，全部为异色邻接，无一涉及 (1,1)，故任何骨牌都不能盖住 (1,1)，结论不成立。每块骨牌恰一黑一白 → 颜色平衡是必要条件；本反例只否定"平衡即足够"的所写命题，不触及必要性。脚本另断言所有剩余相邻对异色（必要性方向的对象关系）。
- **B 两断开三角形**：6 条边、6 点，每点度 2、奇度点 0；每个三角形单独 A→B→C→A 恰覆盖该三角形的三条边各一次；并集连通分量数 2（3,3）。所以"所有点偶度"满足而"一笔走完"不成立，是所写命题的反例；附有连通前提的加强命题不被它反驳（每个分量各自连通且偶度）。一笔判据（连通且至多 2 奇度点）只用于这两个有限实例；一般定理的证明不在本脚本内。
- 脚本原先硬编码过邻接边数，被断言当场抓住（24≠16）；改为按角格/内格分别计边（2/3/4/2，去边合计 12）后通过。这条自我纠正保留在 git 历史之外，但说明硬编码预期确实会被机械检查捕捉。

有限枚举只是教师案例核验，不代替一般论证，也不是教学回放；案例答案只放在 reference 的 `## Teacher-only checked cases` 与 `.scratch` 产物中，不进入运行规则正文。

## 条件可达与单一来源（已静态核验）

- 条件可达：`proof-teaching.md` §1 → 反例 reference；`problem-design.md` 变式段 → 反例 reference（"待检验命题"的呈现方式与教师案例保密）；反例文件自身指向 `proof-teaching.md`、`derivation-teaching.md`、`prerequisite-learning.md`、`math-high-session`、`math-segment-fields.md`。
- 单一来源：方向、必要性、反驳与 `P→Q`/`P↔Q` 仍只在 `proof-teaching.md`；规划搭桥循环、先修子任务、知情全解、退出、`session_segment` 仍只在各自既有文件；反例文件只有五节规则与两节披露内容。
- band 本地：`math-high-core` 与 `math-primary-low`/`math-common` 未获得该文件名；未按票号路由（核心表未新增第 12 号条件行，静态守卫检查不存在 `（12）`/`issue 12` 字样）。
- 未新增测试框架或新接口；新增守卫沿用既有 `test(...)`/`hasAll` 风格。

## 勾选判据与实际证据

| 验收项 | 判定 | 依据 |
|---|---|---|
| 1. 经既有证明/题目设计接入，不重建逻辑框架或独立 Skill；学生可自愿构造，也可理解已给反例 | **满足（实现/源码层）** | 仅新增一个条件 reference，两处指针，无新 Skill/act/字段；规则含"student-constructed / teacher-supplied / under hint"三种归因。行为回放未测。 |
| 2. 先明确全称范围与前提/结论方向；保留必要的正确理由，只追反向；找不到反例不是证明 | **满足（实现/源码层）** | `## Scope and direction before hunting`、`## Necessary conditions are evidence, not a verdict`；静态守卫检查对应短语。 |
| 3. 核验 4×4 反例：余两色各 6、(1,1) 孤立；只否定充分性 | **满足（数学核验）** | 脚本 A 段全部断言通过；教师案例在 Teacher-only 与 `.scratch`。 |
| 4. 两断开三角形反驳偶度命题，不否定加连通的加强命题 | **满足（数学核验）** | 脚本 B 段全部断言通过。 |
| 5. 学生只报不可铺时检查前提与结论两端；教师完整反例记支持/理解，不把全部平衡区域判不可铺 | **满足（实现/源码层）** | `## Validate a proposed counterexample` 与 `## Who constructed it`；静态守卫检查 `every premise holds`/`the conclusion fails`/`a tileable instance does not rescue`。 |
| 6. C0–C2、CB1–CB2、至少一次决策观察 | **未测试** | 无教学模型回放环境/runner；见下。 |
| 7. 既有工具子任务、保存恢复、同题知情全解、退出边界；不强制补完逻辑课或继续出反例，不新增长期类型或多余表现段 | **部分满足（仅源码接线）** | 反例文件引用 `prerequisite-learning.md`、知情全解、`session_segment: null`、每轮一个合并段、可停止；实际保存/恢复与全解交互未测。 |
| 8. 数学核验、条件可达、静态/契约回归留记录；实际轨迹注明环境与提示来源；有限示例/合成回放/真实效果分别报告 | **部分满足** | 数学与静态记录完整；无实际轨迹，故未写"实际轨迹"；未做合成回放；未观察真实学习效果。 |

## 未执行：实际模型行为与真实学习效果

| 验收层/场景 | 状态 | 缺口 |
|---|---|---|
| C0 旧/新多轮（"黑白一样多应该都行"） | 未测试 | 没有旧/新两侧的实际多轮历史；未观察模型是否先说明方向再邀请寻找局部障碍。 |
| C1 旧/新多轮（必要性回答） | 未测试 | 未观察是否保留正确必要性、只追反向。 |
| C2 旧/新多轮（"说不清怎样算反例"） | 未测试 | 未观察两端检查与后续回应。 |
| CB1 模型边界（两断开三角形） | 未测试 | 数学已核验；模型是否拒绝把反例扩大到加强命题未观察。 |
| CB2 模型边界（教师反例后学生复述） | 未测试 | 未观察归因是否会写成学生独立构造。 |
| 至少一次命题方向或反例有效性决策及其后续回应 | 未测试 | 无任何真实决策轨迹。 |
| 先修工具子任务、保存/恢复、知情全解、退出（X2/X4/X5 近似项） | 未测试 | 仅复用既有协议文本；无实际交互、快照或状态写入。 |
| 单元/合并表现段与归因 | 未测试 | 无 segment 实际产物。 |
| 真实学生学习效果 | 未测试 | 无真实学生观察，未读写任何真实档案。 |

具体限制：**没有实际轨迹**。本子会话工具没有教学模型多轮 replay API，runtime 明确禁止在此深度再启子代理（delegation remaining = 0），因此无法声称任何"模型环境 + 提示来源"的实际回放值；模型/提供方/参数、完整历史、状态保存结果均无。未编写伪造轨迹，未把静态断言或有限枚举当作行为通过。

## Code review

已加载并按文件执行 `tdd`、`code-review`、`writing-for-agents` 的流程。`code-review` 要求并行双子代理；本层 delegation 为 0 且不能自启，故两轴由本人依 `git diff 9250e20...HEAD` 与 `git log 9250e20..HEAD --oneline` 完成，**未**声称有独立审查者。

### Standards（本地）

依据 AGENTS、`docs/agents/skill-self-contained.md`、`docs/agents/issue-tracker.md`、ADR-0001/0003、`writing-for-agents`。无外部 URL；无新 Skill/长期字段；规则单一来源；指针措辞前置动词与触发分支。发现并已修：反例文件初稿有 1 句残缺（"Quietly a finite list of successes from proof"）、1 句自相矛盾（"For a bare 'can't be completed' claim … each missing premise gets one relevant clarification"）、一处把"2×2 边界记 0→0、1→1"作为运行时规则（属于教师案例，已移入 Case A）。另按 smell 基线复核：无重复调度、无深层条件链、无 speculative abstraction；`hasAll` 断言列表属契约守卫，非生产逻辑。

### Spec（本地）

对照票 12 八项与阶段3规格 §8：源码覆盖方向/范围先行、必要性保留、两端核验、构造归因、不扩大反例、不强制继续出反例；数学两案例精确核验。行为项 6 与部分 7、8 未测试，属已披露的缺口，不是代码缺陷。范围无蔓延：未重建逻辑课程，未新增条目行，未改 10/11 依赖。

**修复（Spec，提交后复审发现）：** 反例文件第 3 行声明它会在"教师示例或构造引出待检验命题"时触发，但 `proof-teaching.md` 的指针只列出学生主动检验的分支；只理解教师反例的学生可能因此不加载规则。已把指针补齐为四个分支（提议的反例、被当作充分条件的必要条件、反驳全称命题、应说明命题为何失败的教师示例或构造），并在守卫中加入"指针必须点名每个分支"的检查。该守卫先以删除分支的实际红跑（`proof-names the supplied branch` 失败、1 failed）演示其会捕捉缺失，再恢复后转绿；同时，我原先写的 `assert.match(pointer, /[a-z]/)` 只是恒真占位，已删除。

## 用户基线保护

未修改、未暂存 `GLOSSARY.md` 与 `docs/math-primary-high-methods.md`；`git status` 只包含本票文件。父目录 `.scratch/math-strategy-extension/issues/12-…md` 的 Comments 由父代理合并时追加（worktree 内无该文件，未在本分支新建重复票）。
