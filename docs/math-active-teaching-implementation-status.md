# 数学主动教学与历史推荐实施状态

依据：[实施计划](<math-active-teaching-implementation-plan.md>)。本轮完成首版规则接入（批次一、二）；批次三的额外按钮按计划后置。项目实现载体为 Skill 与引用契约，本轮不修改 DSH 宿主、不安装包、不写真实学生档案。

## 已实现

- `/learn` 仍是唯一教学入口；`/learn-start` 维持激活职责，不假设跨命令持久传递临时新授意图。
- 复用已有共享教学核心的 Agreed new learning 门槛，新增[数学微课契约](<../math-common/skills/math-common/references/micro-lesson-contract.md>)。高低段 session 在命中新授时按需加载并自行执行，不新增 leaf 或全局模式；加载失败退回引导。
- 同主题区分新授、自主推导、练习与原题局部帮助；有原题时另题单轮示范保护原待答点，完整原题解仍走知情选择。公式应用与自主推导分开，普通新授不建先修计划。
- 在[原 lifecycle 推荐 gate](<../learn/skills/learn-data/references/session-lifecycle.md>) 增加受限数学冷开场：有身份、数学专项、普通模式、无待续任务/计划/保存/选择/明确或已授权目标的空参数 `/learn` 才默认推荐。未完成活动和未选候选优先恢复，非数学及通用教学不变。
- 两段推荐规则使用已有摘要/近期错题和当前真实表现，明确证据窗口、范围、支持条件、冲突处理、探索建议与近邻选择。历史 next_step 是候选，不再自动授权冷开场教学。
- 候选可携带临时 `math_opening_hint`，选定先持久化 selected_id，沿原保存/切题恢复协议推进；真正开场的待答点与提示消费同次写回。缺字段旧日志兼容，无档案迁移或推荐数据库。
- 纯示范/推荐选择无表现段；跟做与新题独立表现分别归因，并区分执行与选法。恢复使用原 scope 和待答点，不重播成功开场。

## 自动检查

本轮执行结果：

| 命令 | 结果 |
|---|---|
| `node scripts/check-skills.mjs` | 43 skills，0 errors，0 warnings |
| `node --test scripts/skill-contracts.test.mjs` | 原协议守卫 124/124 通过，未修改该文件 |
| `node --test scripts/math-active-teaching.test.mjs` | 新增 7/7 静态接线守卫通过 |
| `node --test scripts/*.test.mjs` | 共 203 项，202 通过，0 失败，1 跳过 |
| `git diff --check -- AGENTS.md learn math-common math-primary-low math-primary-high` | 通过 |

跳过项为现有真实 DSH 安装/组合集成测试；未在本轮进行安装或 Web 运行时验证。全部自动守卫验证的是文档协议和接线，不模拟学生、模型或写失败的运行时行为。

## 待行为验收

已补充可回放输入、预期和失败信号，尚未标为实际通过：

- [跨学科引导与数学冷开场场景](<../learn/tests/guided-teaching-scenarios.md>)：selected_id/保存/context 写失败恢复、显式意图优先、旧候选、非数学与 Feynman 隔离。
- [共享数学场景](<../math-common/tests/teaching-scenarios.md>)：新授/自主推导/练习差异、原题保护、null/受助/独立归因、加载失败。
- [低段场景](<../math-primary-low/tests/teaching-scenarios.md>)：等号与数的组成、低段支架入口、叶子待答保护。
- [高段场景](<../math-primary-high/tests/teaching-scenarios.md>)：分数、公式推导、推荐证据排序、临时起手恢复。

后续需记录真实多轮回复、上下文写回前后差异与故障注入结果，再判断运行时发布门槛；学生学习效果仍需单独验证。
