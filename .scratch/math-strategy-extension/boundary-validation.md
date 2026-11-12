# Issue 11 — 关键条件变式与方法边界：交付与分层验收

日期：2026-11-12。分支 `implement/math-boundary`；旧侧固定 `9250e20`（`fix(math-board): address the review findings on the geometry board`）。实现范围为现有高年级方法入口与方法索引，新增按需 [条件变式与方法边界](<../../math-primary-high/skills/math-high-core/references/boundary-variation.md>)；无新 Skill、act、submode、长期字段或第二套教学循环。未安装或更改运行中 profile，未读写 `data/` 或 `outputs/`，未修改 `GLOSSARY.md` 与 `docs/math-primary-high-methods.md`。

本票是批次 D 第一张，独立实现，未引用也不依赖 10/12 的任何文件。本记录由父代理在子会话耗尽上下文后接手整理并复核；凡由父代理修改或重跑的项目单独标明。

## 交接与修正记录（如实）

子会话在写入参考文件与三处指针（`SKILL.md`、`math-teaching-core.md`）后耗尽上下文，未提交、未修完守卫。父代理接手续作时发现并修正了以下问题：

1. **缺失指针**：守卫要求 `problem-design.md` 与 `mathematical-strategies.md` 都能到达新文件，但子会话尚未写入。父代理各补一句入口说明（只加指针，不改既有规则）。
2. **补充文件缺 `math-teaching-core` 指针**：正文原写「The teaching core selects…」而未引用文件，已改为明确引用 `references/math-teaching-core.md`，并在边界说明一节区分方法选择（teaching core）与 act 分配（learn-act-allocation）。
3. **守卫自身错误**：`informed full-solution choice` 原本在「规则正文」里断言，而该措辞只存在于教师案例节；改由 `checked` 段断言。探针 `fifty`、`k = 5`、`no-solution` 与文档实际内容不符（`k = 5` 根本不存在，`no-solution` 出现在规则正文），已改为确实只出现在案例节的探针（`deputy`、`triangular-dot`）；父代理中间还写过一版 `three ways` 的临时断言并立刻被测试抓住，最终版本已清理掉该临时结构。
4. **数学案例错误（脚本当场抓住）**：子会话的案例 D2/D4 用「贵票前 10 张 5 元、之后 4.4 元」说明“路线失效但题目有解”，但 20 张票时贵票数最多 20、且旧梯度法给出的票数总在 10 以内，该阶梯价实际**从未生效**，于是 `80` 在真实价格下**无解**而非“另有直接答案”；D2 又留下注释未完成的段落。父代理先自行重算时的「12 张贵票得 88」也算错（实为 78），被 `node:assert` 当场断言失败。最终改为**可核验的阶梯价**（贵票前 10 张 5 元、之后 6 元）：64 → 8 贵 12 便宜；78 由 12 张贵票达成，而旧 3 元梯度法给出 38/3（非整数）；86 由 14 张贵票达成，旧法给 46/3。文档正文的两条教师案例同步改为 78/86，不再出现 80 与 4.4 的错误说法。
5. **回放场景缺失（用户复核发现）**：子会话未在 `math-primary-high/tests/teaching-scenarios.md` 写入本票的 V0–V2/VB1 回放场景，父代理初次整理时漏查，仍按源码/数学层记了"实现完成"。12 与 10 两票都各自新增了场景段（+21/+11 行），本票按同一约定补 `## 边界变式（承重条件改变）`（V0、V1、V2、VB1 及拒绝/近迁移/复述三条边界行），并在静态守卫中加入场景可达断言；该断言在移除场景段时确实失败（2/3 pass），补回后 3/3 通过。这属于交付缺口而非行为测试，已修复。
6. **红跑证据**：子会话留下的 `red.txt` 是**真实的红**（3 项全失败：缺指针 + `ENOENT`），但它在守卫尚未修正前产生。父代理用「仅保留守卫、实现全部 stash 掉」的方式重新验证：三项在基线上确实全失败、退出码 1，见[重跑红跑](<artifacts-11/red.txt>)；恢复实现后同命令 3/3 通过，见[绿跑](<artifacts-11/contracts-targeted.txt>)。

## 已执行：静态、契约与有限数学核验

接缝沿用父代理确认的既有静态/契约守卫与有限枚举脚本，无新接缝。

| 命令（父代理复跑，实际结果） | 结果与范围 |
|---|---|
| `node --test --test-name-pattern='boundary variation' scripts/skill-contracts.test.mjs`（仅守卫、基线实现 stash） | **RED**：3 项失败，退出1。失败点为 `problem-design` 无指针与两个 `ENOENT`，属预期失败。见[红跑](<artifacts-11/red.txt>)。 |
| 同上（实现恢复后） | **GREEN**：3 passed，退出0。见[绿跑](<artifacts-11/contracts-targeted.txt>)。逐步 DEBUG：缺指针、错误探针、teaching-core 指针各修一次后转绿。 |
| `node --test --test-name-pattern='boundary variation'`（移除场景段后） | **RED**：1 项失败（场景可达断言），退出1；补回场景段后 3/3 通过。 |
| `node --test scripts/skill-contracts.test.mjs` | 111 tests：111 passed，0 failed，0 skipped，退出0。见[完整输出](<artifacts-11/contracts-full.txt>)。 |
| `node scripts/check-skills.mjs` | 43 skills，0 errors，0 warnings，退出0。见[输出](<artifacts-11/skill-check.txt>)。 |
| `node .scratch/math-strategy-extension/boundary-case-validation.mjs` | PASS，14 组案例，退出0。见[数学核验输出](<artifacts-11/math-check.txt>)。 |
| `node --test scripts/*.test.mjs` | 163 tests：162 passed，0 failed，1 skipped（真实 DSH 安装集成），退出0。见[完整输出](<artifacts-11/full-tests.txt>)。跳过项未计为通过。 |
| `node --check scripts/skill-contracts.test.mjs`、`node --check …/boundary-case-validation.mjs`、`git diff --check` | 均退出0。仓库与高年级包无 typecheck 脚本，未虚构 typecheck。 |

### 数学核验细节（教师案例层）

[可重复核验脚本](<boundary-case-validation.mjs>) 全部用 `assert` 精确断言：

- **A1–A4 队长/副队长**：4 人有序 12 种；无序成组 6 组；**每个**无序组恰对应 2 个有序选择（逐组列出 6 组的所有来源），一个例子只覆盖 1/6，不能代替全体对应。
- **B1–B3 五人**：无序选 2 为 10 组、有角色 20 种；20 种按 2 对 1 覆盖 10 组且恰好一次；“先定义计数对象再决定是否去重”，同一 4 人下 4 个单名组 / 12 个有角色选择 / 6 个无序组 / 16 个可重复组说明机械除 2 会出错。
- **C1–C2 同规则不同起点/增量**：T(1..10)=1,3,…,55，起点与终点移动不改变递推；每行 +6 时 1..6×6 行合计 126，反向两份 252=6×42，配对理由仍成立（属近迁移而非方法边界）。
- **D1–D4 单位变化**：均匀 3 元差距下 64 → 8/12；可达集 40+3k；65 不可达（25 非 3 的倍数）；阶梯价（贵票前 10 张 5 元、之后 6 元）下 78 由 12 贵票达成而旧梯度法给 38/3，86 由 14 贵票达成而旧法给 46/3——**旧路线停止工作不等于题目无解**，两者分开。65（无解）与 78（旧法失效但有解）构成对照。
- **E1 条件改变后的存在性**：13 > 12 迫使某月两人同月；13 ≤ 13 类别时不成立——承重步是对象数与类别数的比较，不是故事。
- 教师案例全部位于参考文件的 `## Teacher-only checked cases` 与 `.scratch` 产物；守卫断言 `deputy`、`triangular-dot` 等探针不出现在规则正文。

有限枚举只核验教师案例，不证明学生可在无支持下看见对应关系，也不模拟教学；它曾在本次实现中直接否定了一个错误案例，这条自我纠正已保留在记录中。

## 条件接线与单一来源（已静态核验）

- 可达：`SKILL.md` 新增一行条件入口 → `mathematical-strategies.md` → `boundary-variation.md`；`problem-design.md` 的 Variation and Transfer 段与 `math-teaching-core.md` 的 Variation and contrast 行也各自指向新文件。
- 单一来源：策略族与学生监控仍归 `mathematical-strategies.md`；方向/范围/反例仍归 `proof-teaching.md`；递推范围归 `early-algebra.md`；先修归 `prerequisite-learning.md`；单段表现归 `math-segment-fields.md`；知情全解归 learn-core。新文件只加「一次改一个承重条件、三种结果、说明哪一步仍成立」。
- band 本地：`math-common` 与 `math-primary-low` 均未获得该文件名；无票号路由；无外部 URL；未新增状态字段或 UI 选择协议（守卫断言 `ui.solution.`、`learning_plan_update` 等不出现）。

## 勾选判据与实际证据

| 验收项 | 判定 | 依据 |
|---|---|---|
| 1. 增补现有题目设计和方法入口，按结构边界检验需求进入；复用既有变式、证明与策略监控，不新增 Skill 或另一教学流程 | **满足（源码/静态层）** | 一行条件入口 + 三处指针 + 新 reference；守卫断言可达性与单一来源。 |
| 2. 每次主要改变一个承重条件，保留其他条件和有效关系；区分原方法不能直接搬用与题目不能解决，接受可核验替代路线 | **满足（源码/数学层）** | `## Pick the one condition`、`## Conflicts inside a result`；D4 数学对照。 |
| 3. 4 人队长/副队长 12，改无角色 6 组；每个无序组恰对应两个有序选择须说明，不用一个例子代替全体对应 | **满足（数学核验）** | A1–A4 逐组验证 6/6 对应。 |
| 4. 5 人无角色 10 组、有角色 20 种；先定义计数对象再决定是否去重，不机械除 2 | **满足（数学核验 + 显式规则）** | B1–B3。 |
| 5. 近迁移答对、复述教师总结或教师直接指出变化都不自动证明独立边界辨别；拒绝变式可返回原题或结束，不降低能力判断 | **满足（源码层）** | `## Evidence and completion` 四类归因 + 拒绝不改判。行为未观察。 |
| 6. 完成阶段 3 变式 V0–V2 三起点各一组旧/新多轮对照及 VB1 | **部分满足（合成回放已执行）** | V0–V2/VB1 场景行已写入教学场景表；合成回放旧/新两侧均无失败信号，V1 新侧更完整、V2 新侧有教师代述；真实运行时与学生效果未测，见下。 |
| 7. confirmed gap 走既有子任务，保存/恢复保留原比较条件与提示来源；知情全解、学生自主选择和每轮单一表现段不回退 | **部分满足（源码层）** | 规则文本已写并静态守卫；实际恢复/全解交互未测。 |
| 8. 核验例题、条件接线、既有静态/契约回归和真实回放留痕；学生监控与教师决策分清，未测试和失败如实记录 | **部分满足** | 例题、接线、静态、契约已执行；无真实回放，未写假轨迹。 |

## 合成回放（已执行）与仍未执行项

2026-11-12 追加：以独立子代理做**合成回放**，旧侧取基线 `9250e20`、新侧取合入后的 `main`，固定学生输入见 [回放协议](../replay/protocol.md) 与 [输入表](../replay/inputs.md)，原文与逐节点判定见 [replay-11](../replay/replay-11.md)。

| 验收层/场景 | 状态 | 结果与缺口 |
|---|---|---|
| V0 旧/新多轮 | **合成回放通过（两侧）** | 两侧都点明「只改有无角色」并用同一对甲乙对照，未先公布除以 2。 |
| V1 旧/新多轮 | **旧侧部分通过，新侧通过** | 旧侧只问「会被数到几次」；新侧要求把 12 种按同组两两配对，覆盖全体 6 组。 |
| V2 旧/新多轮 | **两侧均部分通过（含不利结果）** | 新侧直接说出「每组恰对应两种排法」这一泛化，再让学生验一组，属教师代述；旧侧只追单例。 |
| VB1（5 人无角色 10 → 有角色 20） | **合成回放通过（两侧）** + 数学核验通过 | 两侧都先定义对象，不直接报 20。 |
| 先修子任务、保存/恢复、知情全解、退出（验收第 7 条） | 未测试 | 本回放未触达；仅复用既有协议文本。 |
| 真实安装运行时回放 | 未测试 | 未把新规则装入运行 profile，未执行真实模型多轮。 |
| 真实学生学习效果 | 未测试 | 无真实学生观察，未读写真实档案。 |

限制：合成回放是同一模型按规则的角色扮演，只说明单轮措辞与推进点，**不证明新规则优于旧侧**（本组两侧均未命中失败信号），也不证明多轮稳定性或真实学生效果。学生是否真正看见边界一律记为未知。

## Code review（父代理本地两轴）

`code-review` 的并行双子审查在本层不可用（无 subagent 工具），两轴由父代理完成，未声称独立审查者。

### Standards

依据 AGENTS、`docs/agents/skill-self-contained.md`、domain 规则、ADR-0001/0003 与 writing-for-agents。无外部 URL、无新 Skill/字段、单一来源保持。发现并已修：缺指针（`problem-design`、`mathematical-strategies`）、`math-teaching-core` 未显式引用、守卫探针错误与错位断言、教师案例 D2/D4 的价格阶梯从未生效及算术错误、D2 残留注释。

### Spec

对照票 11 八项与阶段 3 §7：源码覆盖“一次一个承重条件”“区分方法失效与无解”“接受替代路线”“先定对象再去重”“拒绝不降判”“单一表现段”；数学案例逐项可核验。行为项 6 与 7/8 的实际交互未测试，属已披露缺口，不是代码缺陷。范围无蔓延：未新增教学流程，未引用 10/12。

## 合并提示（给父会话）

本分支修改 `math-primary-high/skills/math-high-core/SKILL.md`、`references/math-teaching-core.md`、`references/mathematical-strategies.md`、`references/problem-design.md`、新增 `references/boundary-variation.md`、`scripts/skill-contracts.test.mjs`、本票文件、高年级教学场景表的 `## 边界变式（承重条件改变）` 段与本记录及其 artifacts。12（counterexample）分支同样修改 `problem-design.md`、`proof-teaching.md` 与 `scripts/skill-contracts.test.mjs`，10 分支同样修改 `problem-design.md`、`math-high-student-problem/SKILL.md` 与测试场景文件；合入顺序 11→12→10，逐票 rebase 并重跑本记录中的全部命令。
