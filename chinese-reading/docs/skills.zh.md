# 技能、路由与规则归属

[English](skills.md) | [中文](skills.zh.md)

本包共六个内部技能：`chinese-session` 路由一轮，四个教学技能分别做阅读、写作、读写迁移与出题，`chinese-core` 存放它们共用的规则。本文列出技能清单、谁分派谁，以及每条规则归哪个文件，保证同一条规则只写一处。

## 技能清单

| 技能 | 作用 |
|---|---|
| `chinese-core` | 规则底座：开始门槛与输入、按条件读取表、学科契约、内部动作表、回合交付规则。它不产生学生可见回复，也不自己写记录。 |
| `chinese-session` | 路由器：读 `target_context`、`mode`、`focus`，只选一个子技能并把上下文交出去，不做教学，不产出段。 |
| `chinese-reading-session` | 阅读教学与诊断。`task_mode` 为 `learn`（有文章无答案）、`diagnose`（已有答案要评）、`feynman`（学生讲证据）。 |
| `chinese-writing-session` | 写作。`task_mode` 为 `start`（有题无稿）、`revise`（局部升格）、`assess`（量规档位与最值得改的 3 处）、`feynman`。 |
| `chinese-read-write-transfer` | 读写迁移：提炼 1–3 个有原文证据的写法，换主题出题，陪写，再按量规评改，最多两轮。 |
| `chinese-generate-tasks` | 按年级段出阅读题与写作题，附参考答案、命题意图与判分标准。出完不接着讲解、批改或代写。 |

## 路由

只有 `chinese-session` 分派，依据它自己 `SKILL.md` 里的路由表；`mode` 原样传下去，`task_mode` 是子技能内的分支，不写回 context。教学开始前有两道闸门：

- 学生不知道学什么、问「学什么」，或阶段选「换个内容」，先走 `learn-recommend`。该轮停在推荐选择，不产段、不改焦点；候选内容与排序见[语文学习推荐](../skills/chinese-core/references/learning-recommendations.md)。
- 普通阅读或写作的阶段出口可回传 `stage_options`（`label: 写一写`、`action: transfer`）。学生选择后记录迁移状态，下一轮归一化目标后进入 `chinese-read-write-transfer`。

目标分类只由[语文目标](../skills/chinese-core/references/chinese-target.md)定义。入口已处理的文件按提取出的材料归类，不重读 raw 路径，也不再追问自我诊断。

## 规则归属

每条规则只有一个文件。改之前先在这里查归属，然后只改那一个文件。

- `chinese-core/SKILL.md`：开始门槛与输入、按条件读取表、学科契约、内部动作表，以及各子技能共同遵守的交付规则。
- [chinese-reading-core](../skills/chinese-core/references/chinese-reading-core.md)：深读方法、诊断流程与常见阅读问题。
- [chinese-writing-core](../skills/chinese-core/references/chinese-writing-core.md)：写作原则、六圈展开、升格规则，以及读写迁移的技巧提取。
- [chinese-feedback-core](../skills/chinese-core/references/chinese-feedback-core.md)：反馈流程与长期学习管理。
- [chinese-task-generation](../skills/chinese-core/references/chinese-task-generation.md)：阅读题与写作题出题、检查清单与学段支架。
- [chinese-assessment-rubric](../skills/chinese-core/references/chinese-assessment-rubric.md)：六步量规、档位、输出形态与迁移分支。
- [chinese-error-labels](../skills/chinese-core/references/chinese-error-labels.md)：`reading:` / `writing:` 标签、如何选一个主标签、诊断如何存档。
- [chinese-target](../skills/chinese-core/references/chinese-target.md)：目标类型与 intent，含文件处理后的目标归类。
- [chinese-grade-defaults](../skills/chinese-core/references/chinese-grade-defaults.md)：初始 `active_domain`、初始水平与各年级段默认题型。
- [chinese-profile-fields](../skills/chinese-core/references/chinese-profile-fields.md)：偏好键、水平键与科目档案增量。
- [chinese-personalization](../skills/chinese-core/references/chinese-personalization.md)：兴趣、偏好与易/难主题在各领域怎么用。
- [chinese-non-response](../skills/chinese-core/references/chinese-non-response.md)：卡住、只答一个词或沉默时的语文对照说法。
- [experience-gap-bridging](../skills/chinese-core/references/experience-gap-bridging.md)：桥接动作的输入、返回字段与不该用的时候。
- [learning-recommendations](../skills/chinese-core/references/learning-recommendations.md)：学科契约的「学习推荐」角色。
- 共享归属：会话循环、确认、语气与结束信号来自 `learn-core`；JSON 协议、快照、日志与 finalize 来自 `learn-data`；文件解析只经入口的 `learn-errors`。

改技能文本前，先读仓库的[技能维护](<../../docs/agents/skill-maintenance.md>)说明。
