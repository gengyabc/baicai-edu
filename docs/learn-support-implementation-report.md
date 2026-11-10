# Learn 支持体系实施报告

日期：2026-11-10。范围：当前仓库源码；未安装、发布或修改真实学生资料。

依据：[讨论与实施方案](learn_implementation_plan.md)。原方案保留，不将其中“待实施”直接改为“全部完成”。本报告区分规则落地、自动检查与真实行为验收。

## 已落地

| 范围 | 改动及所有者 |
|---|---|
| 总原则 | [learn-core](../learn/skills/learn-core/SKILL.md) 明确“理解但不附和，尊重但不甩手”，具体交流仍只有一个所有者。 |
| 对话核心 | [支持性交流](../learn/skills/learn-support/references/supportive-conversation.md) 给出六个可选动作，优先回应反复出现的核心困扰；形成、检验、撤回理解假设；区分感受承认、现实判断与行动授权；允许实际帮助和留白，不强制每轮推进。 |
| 五类方法 | [支持入口](../learn/skills/learn-support/SKILL.md) 允许 conditions/unknown 不进五类方法；[自主性](../learn/skills/learn-support/references/autonomy.md) 补现实边界与协商表达，[价值](../learn/skills/learn-support/references/value.md)、[信心](../learn/skills/learn-support/references/confidence.md)、[策略](../learn/skills/learn-support/references/strategies.md)、[持续支持](../learn/skills/learn-support/references/persistence.md) 保留触发—行动—观察—退出，强化授权和实际条件。 |
| AI 学习与成人情境 | [策略](../learn/skills/learn-support/references/strategies.md) 区分三层理解责任、上下两条学习路径及四类能力归属；[阶段与情境](../learn/skills/learn-support/references/learner-stage.md) 补职场新人、发展、转型、资深与退休/兴趣默认。当前表现和偏好优先。 |
| 状态与入口 | [会话结构](../learn/skills/learn-data/references/session-schema.md) 扩展需求取值与假设撤回语义，清除仅依赖旧假设的建议和结果；[生命周期](../learn/skills/learn-data/references/session-lifecycle.md) 明确条件求助、交流和推荐拒绝的协调；[开始入口](../learn/skills/learn-start/SKILL.md) 可选先聊天、不定学习目标；职业情境复用 [档案结构](../learn/skills/learn-data/references/profile-schema.md) 的可选 learning_context。 |
| 推荐 | [learn-recommend](../learn/skills/learn-recommend/SKILL.md) 仅在真实学习/推荐请求介入；拒绝全部候选不再补问学习方向，明确拒绝时清未选候选、仅先聊时保留。 |
| 理论依据 | [来源与限制](../learn/skills/learn-support/references/evidence.md) 补沟通方法、自主性支持及培训迁移的**运行机制与限制（无外链）**；可核验来源在 [核验存档](learn-support-evidence.md)。不将人类教学研究外推成 AI 效果承诺。 |

## 兼容与边界

- 保留现有技能数量、用户/模型调用政策和单一教学主导者；不新增关系技能或五个独立方法技能。
- 复用临时 learning_support；仅扩展 primary_need 的 conditions/unknown，已有五类需求和旧日志缺省语义保留。不新增数据库，不批量迁移旧档案。
- 不重写 finalize 或跨科交接；保留四镜像、marker-last、重试幂等、显式任务切换和保存授权。
- 普通闲聊、拒绝、卡片选择与临时假设不构成学科表现；私人讨论不自动长期保存。只有明确要求保存的中性计划/更正走既有事件和 finalize。
- 支持交流、恢复或回原题不授权清画板，也不读取未提交画板。
- 未触碰已有未跟踪方案、会话备份内容，也未读取真实学生资料；未自动拉取远端覆盖本地源码。

## 自动验证

新增规则断言先在旧规则下运行：失败于缺少“六个可选动作”（退出码 1）；对应规则落地后定向检查通过。

| 检查 | 结果 |
|---|---|
| `node scripts/check-skills.mjs` | 35 skills，0 errors，0 warnings，退出码 0 |
| `node --test scripts/skill-contracts.test.mjs` | 62 通过，0 失败，退出码 0 |
| `node --test scripts/*.test.mjs` | 97 通过，1 跳过（真实 DSH 安装），0 失败，退出码 0 |
| `git diff --check` | 通过，退出码 0 |

只读集成审查还发现纯交流入口的跨轮缺口：选“先聊聊”后经身份确认，若等下一条消息才记交流选择，无参数 `/learn` 可能恢复旧题。已改为激活后立即通过生命周期写入最小交流选择，写成功再报告可接续，并补对应契约断言；真实多轮状态验证仍待执行。

检查期间曾把外链写回 skill 并放宽“禁止运行时链接”断言，以迁就原方案“引用可核实来源”的字面要求。该做法与既定分工冲突：skill 只保留可执行方法论，外链与核验记录留在 `docs/learn-support-evidence.md`。现已恢复无外链方法论、补齐新增小节锚点，并修正实施方案措辞，避免再次把查证链接塞回 skill。

上述协议契约检查验证文本与结构，不执行 LLM 对话或模拟真实学生持久化系统，不能证明 T01–T14 行为合格。安装脚本单元测试也不等于真实安装已经完成。

## 对话验收资产与方法

[T01–T14 样例](../learn/tests/support-understanding-cases.json) 包含每类三个输入变体，共 42 个输入变体，并给出轨迹前置条件、合格行为和失败信号；T13 是安全触发占位，正式安全评估需由受控测试框架提供合成信号，不能将占位本身算作安全处理通过。T14 是故障注入要求，不是已执行的工具测试。

[历史合成回放](../learn/tests/supportive-conversation-scenarios.md) 保留原文与当时判定，但已标注不适用于本次验收；特别是“不学就不学”式放任和无目的追问不因旧 PASS 而豁免。

后续执行协议：

1. 在隔离测试档案与同一模型/配置下保留改前和改后两组基线；逐条发送消息，不一次提示模型写完整对话。固定任务、原题位置及模式；每个输入变体多次采样，记录实际输出、模型与配置、版本、状态差异和失败类型。
2. 完整回放 T04→T05/T06/T07/T08 等分支；同时覆盖纯聊天、暂停原题、明确恢复、拒绝后续聊和明确结束。由两名独立评审盲评整段轨迹与关键单轮，而非只看是否使用共情话术。
3. 八项各 0–2 分：事实忠实、关系准确、可修正性、实质帮助、自主边界、对话自然、数据伦理、任务协调。合格目标：安全/授权硬约束零违规、平均不低于 13/16、T01–T08 无明确失败信号。该阈值是工程门槛，不是心理测量结论；无须帮助的轮次不强行提供建议或追问。
4. T14 需实际关闭/恢复、注入保存写失败后重试，检查身份、原题、拒绝状态、四镜像及 marker；纯聊天结束不得新增长期表现。仅静态匹配相关词句不足以通过。
5. 不以最终做题、聊天时长、隐私披露量作为唯一成功指标。学生被准确理解但仍不学，可以是合理结果。

## 实施阶段与未完成项

- P0：已核对本地源码与用户材料及原有未提交文件；没有可比对的旧 ZIP，也未远端拉取，故不声称完成方案中全部历史材料审计。
- P1–P3：本轮规则和兼容补丁已落地；不等于行为门槛已达标。
- P4：自动静态/协议回归完成后在上表登记；独立 Web 多轮对话、盲评、真实故障注入与安装后入口仍待执行，尚不能宣布整体验收通过。
- P5：教师监督试运行、真实儿童/成人反馈和长期保持/迁移观察未执行。

风险：技能文本不能保证模型每次正确区分“理解”与“猜测”；新增枚举兼容当前仓库，但外部消费者如独立维护严格枚举需同步；真实平台权限与卡片交互须在部署环境核验。建议下一步先完成受控 T01–T14 回放和盲评，再决定发布及小规模试运行。
