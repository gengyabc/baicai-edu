# 数学技能审计实施记录

依据 [审计矩阵](<math-skill-audit-matrix.md>) 的 01–20 项，结合当前仓库的双学段、共享数学契约和会话生命周期实施。此次修改教学规则与回归材料，不更改宿主、插件、持久化字段、四个 Tier、命令入口或安装状态；已有无关工作区改动保留。

## 落地对应

| 审计项 | 实施结果与规则入口 |
|---|---|
| 01–02 新授与支架 | [共享教学核心](<../learn/skills/learn-core/references/pedagogy-core.md>) 新增已约定新授入口：起点有依据即可另题短示范，无须先失败；原题关键推理、独立测查、自主推导、同题知情全解边界保留。两个学段的 core 加载条件、教学核心、支架和 session 开场同步接通。 |
| 03–04 认知目标与 CGI 范围 | 一轮一个主要认知目标、至多一个待答问题；同一关系的图、式、短解释可同轮出现。低段 CGI 用于数量关系与儿童策略，不垄断所有选法；题目格式按目标选择。见 [低段教学核心](<../math-primary-low/skills/math-low-core/references/math-teaching-core.md>)。 |
| 05–07 表征、公式与先修 | [高段教学核心](<../math-primary-high/skills/math-high-core/references/math-teaching-core.md>) 强调表征映射与撤除；[推导](<../math-primary-high/skills/math-high-core/references/derivation-teaching.md>) 保留目标分流；[先修](<../math-primary-high/skills/math-high-core/references/prerequisite-learning.md>) 区分执行工具和选择工具，子任务成功只允许返回一层，不授予父题选法能力。 |
| 08–10 证据与软阈值 | [高段阈值](<../math-primary-high/skills/math-high-core/references/adaptive-thresholds.md>) 的两次成功只触发考虑邻近挑战，不等于掌握或迁移。支持非口述理解证据与程序执行证据。两段记录约定沿用 strategy_summary 区分正确性、关系、帮助与情境条件，不建四维评分。共享白名单与档案规则明确无记录错误不等于延迟成功。 |
| 11–12 诊断与手写 | 两段诊断及等号/代数入口使用最小有区分力证据，去除强制两题探查；[手写契约](<../math-common/skills/math-common/references/handwritten-work-contract.md>) 对影响判断的歧义先确认，再判断该处；其他清楚步骤可继续核对。 |
| 13 巩固与回访 | [共享练习契约](<../math-common/skills/math-common/references/practice-evidence-contract.md>) 增加非 Tier 的 Consolidate / Revisit，低压、少量、逐题反馈。两个 practice 与 session 均可进入；使用现有 next_step_candidate 提议以后新题无提示检查，实际发生才记延迟表现，不宣称定时安排。各类基本可用且目标为选法时才混合。 |
| 14–15 迁移与条件辨别 | 诊断对比控制非目标差异；教学换场景、换人名不算独立情境迁移。[边界变式](<../math-primary-high/skills/math-high-core/references/boundary-variation.md>) 单独记录条件、方法有效性及理由，碰巧同答案不算方法成立。 |
| 16–17 出题与错例 | [共享学生出题契约](<../math-common/skills/math-common/references/student-problem-contract.md>) 普通模式始终诚实核验作答，找错为另行同意并明确标记的对比活动；费曼错误想法标明是假设性困惑且同轮纠正；曝光后解释不计独立找错。旧日志确有未澄清错答时先纠正，新流程不制造该状态。两段叶技能、设计补充、README 与共享白名单同步。 |
| 18–20 证明、一般化、建模 | [证明](<../math-primary-high/skills/math-high-core/references/proof-teaching.md>) 接受覆盖命题范围的适龄论证并区分教师构造；两段等号/代数规则区分特例与一般化；[建模](<../math-primary-high/skills/math-high-application-modeling/SKILL.md>) 把六部分当检查点，复用已展示工作，核查决定性假设并归因。 |

## 一致性复查

- 修复高段 [活动分配](<../math-primary-high/skills/math-high-core/references/learn-act-allocation.md>) 中仅从错误进入练习、开场必须呈题及普通故错的残留限制。
- 移除高段概念图、诊断入口及两段关系思维中固定两次探查的联动限制。
- 保持 session 唯一调度、lifecycle 唯一落盘；教师示范、流程选择与建议本身不生成表现段。
- 数量画板和几何快照仍分读；几何快照仅用学生自述，不作几何判定，也不套用数量编辑记录。
- 未实施另份主动教学计划中的微课状态、数学冷开场自动推荐或新增按钮；本次只完成审计要求的新授示范入口，不扩张产品范围。

## 验证与边界

自动检查：

- `node scripts/check-skills.mjs`：43 个技能，0 错误、0 警告。
- `node --test scripts/skill-contracts.test.mjs`：124 项通过。新增新授保护、证据维度、练习可达性、显式错例和手写歧义守卫；同步移除与新规则冲突的旧文本断言。
- 针对此次修改路径的 `git diff --check`：通过。

人工/模型回放材料：两段分别增加 15 个审计场景，共享数学与共享教学场景补齐延迟回访、迁移、旧记录及退出边界。入口为 [共享教学场景](<../learn/tests/guided-teaching-scenarios.md>)、[共享数学场景](<../math-common/tests/teaching-scenarios.md>)、[低段场景](<../math-primary-low/tests/teaching-scenarios.md>) 和 [高段场景](<../math-primary-high/tests/teaching-scenarios.md>)。

上述场景尚未执行真实模型回放或学生实验。静态守卫仅验证规则文本与可达路径，不证明教学行为稳定、数学案例全部正确或学习有效；后续应观察无提示新题、延迟保持及目标迁移，不以对话完成率代替。
