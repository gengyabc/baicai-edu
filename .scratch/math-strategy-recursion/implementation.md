# 实施与验收记录

状态：源规则与保存协议已实施，合成回放已完成并保留限制，待代码审阅；未安装或发布。

## 范围与测试边界

用户通过 `/implement` 授权实施，并确认三个 seam：已安装技能入口与规则契约；计划/任务链保存恢复契约；隔离虚构学生的旧/新多轮回放。代码审阅基线另经用户确认为 `e5d3a2933e13e90840684276ff74dbb17d03e420`。仓库交付的是指令型教学技能，不是 DSH 宿主内的可执行任务引擎。

- 高年级：新增[方法索引](<../../math-primary-high/skills/math-high-core/references/mathematical-strategies.md>)和[递归教学](<../../math-primary-high/skills/math-high-core/references/prerequisite-learning.md>)，接入核心、主线、推导、证明、应用题、支架、诊断和题目设计。
- 共享数据：新增[计划协议](<../../learn/skills/learn-data/references/learning-plan.md>)，在 schema/lifecycle/finalize/save 接线；耐久快照仅存 current_state.learning_plan，局部 frame 不改根 scope/provider。
- [ADR-0003](<../../docs/adr/0003-prerequisite-learning-plans.md>)记录调度、授权与存储取舍；没有逐知识点新 Skill、新诊断枚举或长期能力标签。

## TDD：按切片执行

| 切片 | Red | Green |
|---|---|---|
| 确认缺工具可达递归任务契约 | math-strategy-recursion.test 第1项失败：缺 prerequisite-learning 入口 | 补契约及六处入口后 1/1 |
| 三类方法可达与边界 | 同文件第2项失败：缺 mathematical-strategies 入口 | 补方法索引/入口及诊断、变式后 2/2 |
| 深度/停滞/局部归属及场景 | 同文件第3项失败：支架缺递归入口 | 补支架、单边阈值说明、证据与场景后 3/3 |
| 任务链形状/单活动层 | prerequisite-plan.test 第1项失败：缺 version | 补共享计划协议/schema 后 1/1 |
| 计划-only授权与耐久重放 | 同文件第2项失败：缺 provided_to_student | 补授权/finalize/profile后，联合已有 persistence 5/5 |
| 计划恢复/终止与保存入口 | 同文件第3项失败：缺 learning_plan_update | 补 lifecycle/save后，联合已有 persistence 6/6 |

均为安装指令契约守卫，不能当作确定性模型行为测试。[数学守卫](<../../scripts/math-strategy-recursion.test.mjs>)与[计划守卫](<../../scripts/prerequisite-plan.test.mjs>)只约束公开入口、规则和保存协议。

中间检查：`node --check` 两份新增测试通过；本仓库没有根 package 脚本或 TypeScript 配置，本次未修改 TypeScript，不虚报 typecheck。`node scripts/check-skills.mjs` 检查 43 skills，0 errors，0 warnings。`git diff --check` 通过。

首次全量：`node --test scripts/*.test.mjs math-board/*.test.js` 共 272 项，271 通过、1 跳过、0 失败；跳过的是需显式启用的真实 DSH 安装集成测试，不将跳过当作通过。

## 回放环境与限制

- 提供方/模型：openai-codex / gpt-6.1-sol；reasoning_effort: medium；其余生成参数由工具默认，未控制，不虚构 temperature/seed。
- 日期：2026-11-12（Asia/Shanghai）。
- 旧规则：基线提交的 learn/math-primary-high 归档至 gitignored 临时目录 .build/math-strategy-baseline；可由上述 SHA 重建，不提交整份重复源规则。
- 三类方法回放的旧规则九文件联合 SHA-256：`85a4718671ad24e0e9dfe609b558810cd2cd06ec091be46968a308813810bc7e`。
- 新规则十一文件联合 SHA-256：`9555fe165e55e946f0b37c3daa35000ebd24bb0b8c37d16297a871d34e5a803d`。按 session/core、教学核心、推导、应用题、证明、支架、诊断、题设、方法索引、递归教学的顺序拼接路径、NUL 和文件字节；旧版没有最后两文件。
- 旧/新分别为两个同模型教师代理，每侧批次内有九份独立案例历史；它们共享同一代理上下文，因此不声称完全隔离的九次独立统计试验。首轮学生输入固定，续轮由父代理根据教师实际提问人工合成，两侧学生能力与文本相同。
- 原始回复保留在本规格目录下的回放文件中，结果表逐一链接；当前案例的 turn_state/segment 为测试投影，不是可直接写入档案的完整 segment。首轮部分 ability_evidence 为说明对象，续轮按数组投影；未将它们写入真实档案或作为 schema 通过证据。
- 多轮回复、合成分阶段文件操作、真实 DSH 安装集成、真实学生观察分别报告，互不替代。全部回放不读取真实学生档案。

## 回放与审阅结果

[九组旧/新两轮对照与四组附加边界/监控](<replays/comparison.md>)已逐项审阅，原始输出均保留。旧规则已经能给出很接近的引导，本样本未证明新版策略教学普遍改善；旧首轮A1/C1无实际表现却给非null segment投影，新版为null，是局部可观察差异而非稳定效果结论。代理自评与文件冲突时以原始文件为准。

[递归与隔离文件回放](<replays/persistence-replay.md>)已做实际fixture写入和9组只读文件断言：三级父快照、懂了不返回、独立使用后单层返回、原镜像准备/重试、marker最后、Finalize后恢复、纯计划parked与abandoned终止、旧日志原样恢复。父代理重跑只读verify命令9/9通过。人工故障信号不等于实际文件工具异常；诊断起点注入、单agent分阶段执行及中间时间戳更新不完整均保留。未测试的拒绝/循环实际决策、真实OS错误、清理失败、stale/no-op/completed异常等不提升为通过。

真实DSH安装/宿主自动调度、真实学生学习效果未验证，未触碰真实学生档案。详见[验收场景](<acceptance.md>)。代码审阅结果待追加。
