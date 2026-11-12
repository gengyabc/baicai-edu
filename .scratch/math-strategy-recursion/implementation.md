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
| 子任务完整投影 | math-strategy-recursion.test 第4项失败：本地写“project ... into context.turn_state” | 改为 task 各字段→context、仅 turn_state→context.turn_state 后 4/4 |
| 无效/过期计划不得当空保存 | prerequisite-plan.test 第4项失败：Finalize 无 STOP 优先 | Finalize/lifecycle 补“先停、留 context”后 4/4 |
| 保存恢复后直接回答不得被吞 | 同文件第5项失败：缺直接回答优先行 | Open/Resume 加首行，原消息仅消费一次后 5/5 |
| 终止计划不得经历史回退重开 | 同文件第6项失败：缺 unscoped history 限制 | Resolve Target 补“先问目标”后 6/6 |

均为安装指令契约守卫，不能当作确定性模型行为测试。[数学守卫](<../../scripts/math-strategy-recursion.test.mjs>)与[计划守卫](<../../scripts/prerequisite-plan.test.mjs>)只约束公开入口、规则和保存协议。

中间检查：`node --check` 两份新增测试通过；本仓库没有根 package 脚本或 TypeScript 配置，本次未修改 TypeScript，不虚报 typecheck。`node scripts/check-skills.mjs` 检查 43 skills，0 errors，0 warnings。`git diff --check` 通过。

首次全量：`node --test scripts/*.test.mjs math-board/*.test.js` 共 272 项，271 通过、1 跳过、0 失败；跳过的是需显式启用的真实 DSH 安装集成测试，不将跳过当作通过。审阅修复后复跑：276 项，275 通过、1 跳过、0 失败；`node scripts/check-skills.mjs` 43 skills / 0 errors / 0 warnings；`git diff --check` 通过。

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

### 双轴审阅与修复

按用户确认的基线 `e5d3a29` 并行做 Standards 与 Spec 两轴只读审阅（提交 `2dd1c6b`）。两条确定问题与两条风险，均已用新守卫复现红灯后修复：

| 发现 | 类型 | 修正 | 守卫 |
|---|---|---|---|
| 本地规则把 child.task 整个投到 `context.turn_state`，与共享完整投影冲突 | Spec/Standards 硬违例 | 明确 task 字段→context、仅 task.turn_state→context.turn_state | math-strategy-recursion 第4项 |
| 无效/过期 learning_plan 可能落到 generic no-op 而清 context | Spec 风险 | Finalize 与 lifecycle 明确 STOP 优先、保留任务链 | prerequisite-plan 第4项 |
| 自动 checkpoint 后学生直接回答待答题会被恢复分支显示结果后吞掉 | Spec 确定问题 | Open/Resume 首行：先恢复、再同 root 新空日志、原消息仅消费一次 | prerequisite-plan 第5项 |
| abandoned tombstone 只拦计划链，历史候选仍可能重开旧目标 | Spec 待确认风险 | 终止计划且无未完成 context/明确目标时，candidate chain 前先问目标 | prerequisite-plan 第6项 |

遗留的判断性建议：lifecycle 的 park/abandon 段落与 learning-plan 有部分重述，可能随机漂移。本版保留入口优先级与关键词以减少 generic 表漏分支，细节仍以共享权威为准；未把重复措辞当缺陷删除。审阅代理在修订复核阶段中途失败，未取得最终确认；上表以本地复现的守卫结果为准，不虚构审阅结论。

### 恢复边界与递归决策合成回放

[恢复边界 fixture](<replays/recovery-edge-fixture/>)：从既有 `05-prepared` 准备镜像继续，实际写入四镜像（current_state 最后）、清理、按快照恢复同 root/teaching 与活动余数层，再把学生直接回答消费一次并追加一条带 frame_id 的 segment；另一分支用终止快照确认 bare `/learn` 只问目标。只读 [verify.mjs](<replays/recovery-edge-fixture/verify.mjs>) 断言通过：父/根回答不变、旧摘要不重复、无伪造 support plan、单 segment 归活动层。单 agent 显式操作，非宿主自动调度；无故障注入分支仍按原限制。

[递归决策六例](<replays/recursive-decisions.json>)覆盖过深建议改目标、拒绝改目标但接受最小补缺、连子题也拒绝、祖先循环、有效替代路线、只自报会算。全部为单轮合成决策且由实现作者本人扮演教师，存在自洽偏差；只证明规则可给出预期形态的决策，不证明独立模型或真实学生行为。

真实DSH安装/宿主自动调度、真实学生学习效果未验证，未触碰真实学生档案。详见[验收场景](<acceptance.md>)。
