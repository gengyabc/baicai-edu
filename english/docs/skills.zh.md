# 技能、方法调度与规则所有权

[English](skills.md) | [中文](skills.zh.md)

本包提供十一个内部技能，分两条线：`english-session` 跑教学主线，`english-core` 存共享规则，九个方法技能各自带一套理论与做法。本页说明技能清单与每条规则归谁，避免同一规则写两遍。

## 技能清单

| 技能 | 理论来源 | 职责 |
|---|---|---|
| `english-session` | — | 教学主线：定焦点、选一个方法、推进一个动作、回传唯一 segment；支持 learn 与 feynman |
| `english-core` | — | 共享规则、方法选择表、输入适配、支架退让、学科契约、证据映射 |
| `child-english-coach` | 自适应语言教学 | 自由活动的跨轮计划与方法建议；不调度、不产记录 |
| `comprehensible-input` | Krashen 输入假说 | 用熟悉语境承载少量新语言 |
| `interaction-hypothesis` | Long 互动假说 | 意义协商：澄清、确认、修补 |
| `output-hypothesis` | Swain 输出假说 | 输出尝试；接受半词半句 |
| `scaffolding-zpd` | Vygotsky 最近发展区 | 逐级提示，一次一级，随后退让 |
| `task-based-language-learning` | 任务型语言教学 | 为一个具体结果使用英语 |
| `usage-based-language-learning` | Tomasello / Ellis 用法基础 | 同一功能换内容、换场景 |
| `spaced-retrieval` | 提取练习与间隔效应 | 先回忆再给答案；区分独立与提示 |
| `child-news-reader` | 可理解输入、互动与广泛阅读 | 来源核对、年龄筛选、分级改写与互动阅读 |

## 方法调度

只有 `english-session` 调度方法技能：每轮一个主方法，确实需要时再加一个辅助方法。唯一的方法选择表在 [english-teaching-core](../skills/english-core/references/english-teaching-core.md)，按 `target_context.type` 加当前观察选；新闻目标固定走 `child-news-reader`。

方法技能只提供自己的理论、做法与材料、证据建议；不加载兄弟方法，不产出自己的 `session_segment`，不写学生数据；难度、提示与证据标准从 `english-core` 读取，不另写一套。同一份材料有多个角度时，由 session 按 [english-turn-arc](../skills/english-core/references/english-turn-arc.md) 串起来，本轮只执行第一个角度。教练的跨轮计划与辅助建议也由 session 权衡；不会自动展开整套方法。

## 调用档位

本包所有技能都设 `user-invocable: false`，不占用 `/` 入口，也不出现在命令菜单里。这是模型遵循的调度约定，不是运行时隔离。

英语从共享入口进入：`/learn-start` 的科目表里有英语，`/learn` 或 `/learn-feynman` 按 `subject: english` 路由到 `english-session`。入口在本包任何技能加载前已核对会话、学生与快照，所以本包技能都不重复核对。

## 规则所有权

每条规则只有一个文件。改之前先在这里查归属，只改那个文件。

- `english-core`：共享规则与 `## Subject contract` 小节；入口也从中读取契约角色。
- [english-teaching-core](../skills/english-core/references/english-teaching-core.md)：唯一方法选择表，以及反馈与纠错规则。
- [english-input-adaptation](../skills/english-core/references/english-input-adaptation.md)：语言难度、材料长度，以及理解之后的调整。
- [english-scaffolding](../skills/english-core/references/english-scaffolding.md)：唯一提示阶梯；每个卡点只加一级支持。
- [english-turn-arc](../skills/english-core/references/english-turn-arc.md)：同一材料的 2–4 个角度如何分布到各轮。
- [english-segment-fields](../skills/english-core/references/english-segment-fields.md)：唯一学习证据映射；每轮一条记录。
- [english-target](../skills/english-core/references/english-target.md)：目标类型与意图分类，含文件投放之后的英语目标。
- [english-grade-defaults](../skills/english-core/references/english-grade-defaults.md)：初始 `active_domain`、初始水平、默认任务与推进顺序。
- [english-profile-fields](../skills/english-core/references/english-profile-fields.md)：偏好键、水平键与学科档案增量。
- [english-error-labels](../skills/english-core/references/english-error-labels.md)：`english:` 前缀的错误标签与 `domain` 取值。
- [english-personalization](../skills/english-core/references/english-personalization.md)：兴趣、经历与易/难主题如何使用。
- [learning-recommendations](../skills/english-core/references/learning-recommendations.md)：「学习推荐」契约角色；推荐什么、按什么顺序。
- `english-core/references/locales/<locale>.json`：本学科的 UI 目录，供 `/learn-start` 选项与阶段选项使用。
- [child-news-reader](../skills/child-news-reader/SKILL.md)：新闻的来源层级、核验、适龄筛选、改写与配图规则。
- 共享归属：会话循环、确认与语气来自 `learn-core`；JSON 协议、快照、日志与 finalize 来自 `learn-data`；文件解析只由入口调用 `learn-errors`。

改技能正文前先读仓库的[技能维护](<../../docs/agents/skill-maintenance.md>)说明。
