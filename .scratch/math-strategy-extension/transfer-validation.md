# Issue 10 — 学生反向编题闭环：交付与分层验收

日期：2026-11-12。分支 `implement/math-transfer`；旧侧固定为 `9250e20`（`fix(math-board): address the review findings on the geometry board`）。实现范围为现有高年级编题的三个既有文件——[编题补充](<../../math-primary-high/skills/math-high-core/references/math-student-problem-design.md>)、[题目设计](<../../math-primary-high/skills/math-high-core/references/problem-design.md>)、[学生编题叶子](<../../math-primary-high/skills/math-high-student-problem/SKILL.md>)——外加高年级教学场景表；未新建 Skill、act、submode、长期诊断字段或第二套编题 owner。未安装或更改运行中 profile，未读写 `data/` 或 `outputs/`，未修改 `GLOSSARY.md` 与 `docs/math-primary-high-methods.md`。

本票是批次 D 第三张，独立实现：`math-common` 的[共享编题契约](<../../math-common/skills/math-common/references/student-problem-contract.md>)未改动，本分支也未引用 10/11 之外尚不存在的文件（票号路由与本票无关）。共享角色的唯一来源仍留在 `math-common`。

## 接缝与执行情况（如实记录）

接缝沿用父代理确认的既有静态/契约守卫 + 有限枚举脚本，没有新接缝。

**重要更正：本分支最初的 TDD 红→绿记录不完整且曾出现矛盾的中间读数。** 子会话在实现过程中报告的“红跑”实际输出为**通过**——因为写守卫时把断言放在 `hasAll` 之后，先阻断失败的其他断言；另有两处守卫的断言短语与文档实际措辞不符（`the student is the problem-maker` vs 文档的 `the student the problem-maker`；`confirms returning` 缺失），因此早先捕获的 `red.log`/`green-targeted.log` 均不能作为红→绿证据。父代理复跑并逐条修正后重跑，才得到下列干净结果。未重新编写“红”轨迹，不把任何一次中间失败包装成设计过的红跑。

| 命令（父代理复跑，实际结果） | 结果与范围 |
|---|---|
| `node --test --test-name-pattern='student-authored problems wire the shared answerer role into the upper-primary design path' scripts/skill-contracts.test.mjs` | **GREEN**：1 passed，退出0。见[绿跑输出](<artifacts-10/contracts-green.txt>)。在同一 seam 上，父代理先在**未实装**的基线上跑了该测试（结果通过），随后才按文档补齐观测，这一顺序在本次记录中如实保留，不声称严格的先红后绿。 |
| `node --test scripts/skill-contracts.test.mjs` | 109 tests：109 passed，0 failed，0 skipped，退出0。见[完整输出](<artifacts-10/contracts-full.txt>)。 |
| `node scripts/check-skills.mjs` | 43 skills，0 errors，0 warnings，退出0。见[输出](<artifacts-10/skill-check.txt>)。 |
| `node .scratch/math-strategy-extension/transfer-case-validation.mjs` | PASS，退出0。见[有限枚举输出](<artifacts-10/math-check.txt>)。 |
| `node --test scripts/*.test.mjs` | 161 tests：160 passed，0 failed，1 skipped（真实 DSH 安装集成），退出0。见[完整输出](<artifacts-10/full-tests.txt>)。跳过的项目未计为通过。 |
| `git diff --check` | 通过，退出0。 |

本仓库与高年级包均无 typecheck 脚本；未虚构 typecheck 结果，以两份 MJS 的 `node --check`（`scripts/skill-contracts.test.mjs`、`transfer-case-validation.mjs`）作为实际语法检查。

## 数学核验（教师案例层，不是教学行为）

[可重复核验脚本](<transfer-case-validation.mjs>) 以精确断言验证以下数字，全部为有限枚举/精确算术：

- **20 张票、2 元与 5 元、总价 64**：全按 2 元为 40 元，每张贵票比便宜票多 3 元，(64−40)/3 = 8 张贵票、12 张便宜票；代回 8+12=20、8×5+12×2=64 通过；价格差固定为 3，故贵票数唯一。
- **65 元（AB1）**：20 张票在 2/5 元下的可达总价恰为 40+3k（k=0..20），(65−40)/3 = 25/3 非整数，脚本又**穷举全部 21 种整张拆分**确认无一达到 65 元。学生若明示要“解不出来的题”，尊重其意图，不擅自把 65 改成 64。
- **学生可能自行选择的其它总价**：可达集为 40,43,46,…,100（公差 3）；58 → 6/14、61 → 7/13、70 → 10/10、82 → 14/6、85 → 15/5 均代回通过；41、42、65、98、99 经穷举确认不可达。**修正过的错误**：文档初稿把 61 列入“不可达”，脚本立即断言失败——61 = 40+3·7 可达（7 贵 13 便宜）；已改为可达示例，并把 41、42 作为不可达样本。该错误当时被有限枚举当场抓住，之后才提交。
- **教师案例不外泄**：断言全部检查答案位于唯一的 `## Teacher-only checked cases` 标题之后，学生可见正文（该标题之前）不含 8/12、25/3 等答案串。

有限枚举只核验教师案例，不证明学生能在无支持下看见这些对应关系，也不模拟教学。

## 条件接线与单一来源（已静态核验）

- 可达：`problem-design.md` 的 `## Compose or Author` → `references/math-student-problem-design.md`；补充文件内指向 `math-teaching-core.md`、`mathematical-strategies.md`、`problem-design.md`、`pedagogy-core.md`；叶子仍读 `math-high-core` 与补充文件。
- 单一来源：问题出题人角色、作答方式、受限刻意错答、评分回应与证据归属仍在 `math-common` 共享契约；学生编题叶子仍由 `math-high-session` 派发、返回单一信号；知情全解仍在 `learn-core` 的 `pedagogy-core.md`；单一表现段仍由 `math-segment-fields.md` 与 session 拥有。高年级补充只加本地规则（方法内核与迁移、只决定一处、以答题人身份作答、收束、教师专用核验案例），并断言未复制共享契约的标题或正文。
- 低年级保留自己的同名补充文件，父代理的守卫断言已改为“两者不是同一文件”，而不是错误地要求低年级 core 不出现该文件名。

## 勾选判据与实际证据

| 验收项 | 判定 | 依据 |
|---|---|---|
| 1. 在现有编题增补和题目设计中接入方法内核提示，复用共享编题契约与原 leaf；学生可拒绝，阶段 3 不以全部专题学完为准入 | **满足（源码层）** | `## Method Kernel and Transfer` 明示可拒绝、无“先学完”准入、方法内核由学生选；静态守卫检查 `decline`/`no lesson completed first`。 |
| 2. 未成题时只帮助决定当前一个关系/条件，不代编整题；完整题直接认真作答交学生评分，不无故增加全解警示 | **满足（源码层）** | `## Compose or Decide One Spot` 与 `## Answer as the Answerer`；守卫检查 `one thing`、`nod at it as theirs`、`no warning and no extra`、`teacher-led oral quiz`。 |
| 3. 核验 20 张票/2·5 元/64 元→贵 8 便宜 12；65 元不满足整数张数；缺条件只澄清该处，尊重有意多解/无解，不偷改 | **满足（数学核验 + 源码层）** | 脚本通过；文档尊重意图措辞与 `respect that intent` 守卫。 |
| 4. 学生评分“对了”可收束，不追问完整解释；有效题和自报答案不自动成为独立求解证据 | **满足（源码层）** | `## Close the Loop` 与补充中的四股证据分离表；守卫检查 `Only an affirming grade closes the loop`、`not the student's independent solving`。 |
| 5. 超出焦点或求助时按既有角色确认继续/返回；普通学习者全解仍走同题知情选择，编题答题角色不颠倒 | **部分满足（源码层）** | 规则文本已写，但实际角色交互未回放；见下表 X3/X4/X6/X7。 |
| 6. 完成阶段 3 编题 A0–A2 三起点各一组旧/新多轮对照及 AB1–AB3、角色交互边界 | **未测试** | 无教学模型多轮 replay 环境；见下。 |
| 7. 条件接线、既有静态/契约回归及代表性恢复/退出通过实际检查；每轮至多一个合并表现段，不新建迁移评分或数据字段，未执行项保持未测试 | **部分满足** | 接线、静态、契约、枚举、`git diff --check` 已执行；恢复/退出仅静态；未新增字段。 |

## 未执行：实际模型行为、恢复与真实学习效果

| 验收层/场景 | 状态 | 缺口 |
|---|---|---|
| A0 旧/新多轮（愿意编但没想好） | 未测试 | 没有旧/新两侧实际多轮历史；未观察是否只提示一个结构。 |
| A1 旧/新多轮（20 张、二档、未定总价） | 未测试 | 未观察是否只请学生定总价、不擅补 64。 |
| A2 旧/新多轮（自编 64 元、答 12 和 8） | 未测试 | 未观察以答题人身份作答交评分、不以“为什么”追问。 |
| AB1（总价 65，明示要无解题） | 部分（数学） | 数学结论已核验；模型是否尊重意图未观察。 |
| AB2（只评分“对了”） | 未测试 | 未观察直接收束、迁移保持未知。 |
| AB3（普通作业而非出题考 AI） | 未测试 | 未观察刻意错答是否被泛化到普通请求。 |
| X3/X4/X6/X7 角色与恢复交互 | 未测试 | 仅复用既有协议文本；无实际交互、快照或状态写入。 |
| 真实学生学习效果 | 未测试 | 无真实学生观察，未读写任何真实档案。 |

具体限制：**没有实际轨迹**。本子会话与父代理均没有教学模型多轮 replay API，也无法为 ticket 10 合成可信的模型轨迹；未编写伪造轨迹，未把静态断言或有限枚举当作行为通过。模型/提供方/参数、完整历史、状态保存结果均无。恢复/退出通过实际检查的条目仍保持未测试或部分，不冒充通过。

## Code review

已按 `code-review` 两轴执行（本层无 subagent 工具，未声称有独立并行审查者）。父代理在提交前做独立复核并修正了下列问题：

### Standards

依据 AGENTS、`docs/agents/skill-self-contained.md`、domain 规则、ADR-0001/0003 与 `writing-for-agents`。无外部 URL、无新 Skill/长期字段、单一来源保持。发现的实质问题及处置：

1. **守卫断言误判**：原句把 `the student is the problem-maker` 与文档实际措辞不符，导致中间读数反复失败；已改为与文档一致的 `makes the student the problem-maker`。
2. **低年级断言错误**：原断言要求低年级 core/`problem-design` 不出现 `math-student-problem-design`，但低年级本来就有自己的同名补充文件（基线即存在）；改为“两 band 的补充分属不同文件”，避免把正确的既有结构误报为违规。
3. **补充文件缺 `problem-design` 指针**：守卫要求的其中一个 reference 在补充里没有出现，已补一句入口关系说明。
4. **数学错误被脚本抓住**：`61` 被误列为不可达，已修正为可达示例并补 `58`、`61` 到可达表；65 元段落原先的 “26×2+3=55” 推理写法不清晰，已改为按 40+3k 解释并补充 55/58 论证。
5. **空泛句子**：`The common shape` 段落与 `first problem or the scaffolded step` 已按实际规则改写，避免与既有 owner 冲突。

### Spec

对照票 10 与阶段 3 §6：源码覆盖方法内核、只决定一处、答题人作答、不追问、证据分离、不泛化刻意错答、不颠倒角色；映射到验收 1–5 与 7 的源码/静态层。行为项 6 与 7 的实际恢复/退出未测试，属已披露的缺口，不是代码缺陷。范围无蔓延：未新增 skill、未改 `math-common`、未新增票号路由。

## 合并提示（给父会话）

批次 D 顺序为 11 → 12 → 10；本分支修改的共享面是 `math-primary-high/skills/math-high-core/references/math-student-problem-design.md`、`problem-design.md`、`math-high-student-problem/SKILL.md`、`math-primary-high/tests/teaching-scenarios.md`、`scripts/skill-contracts.test.mjs`。11（boundary）与 12（counterexample）分支也会修改 `math-primary-high/skills/math-high-core/SKILL.md`、`references/problem-design.md` 与 `scripts/skill-contracts.test.mjs`；合入时按 11→12→10 顺序逐个 rebase 并重跑本轮检查，冲突逐处解决，不在此处预留任何“合并时自动解决”的假设。
