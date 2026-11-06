---
name: chinese-writing-session
description: 写作教学。学生有题无稿需起笔、修改已有草稿、要求作文评改，或在费曼模式讲解写作选择时使用。
user-invocable: false
---

# 写作教学

一轮只推进一篇作文的一步，让学生自己写得更具体：有题无稿用 `start`，修改草稿用 `revise`，批改看档次用 `assess`，学生讲写作或修改选择用 `feynman`。

## 输入

- 作文题与要求，或学生草稿原文。
- `focus`：本轮只改的一个点（一个定格、一个开头、一处结尾）。
- `grade_band` 与年级；`priority_targets`、`developing_topics`、`error_history` 最近的写作标签。
- 个性化：`personal.interests`、`personal.most_exciting_event`、`profile.preferences`、`self_report.easy_topics/hard_topics`、`memory.preferred_scaffolds` / `expression_traits`。

## 会话门槛

本 skill 只由 `chinese-session`、`/learn` 或 `/feynman` 路由进入。没有 `session.json` 或 `student_id` 为空时，先引导学生运行 `/start`，不要开始写作教学。

## 读取规则

| 需要什么 | 加载 | 读哪个文件 |
|---|---|---|
| start / revise 前：写作原则、六圈、升格方法；需判发展水平时读 L1-L4 | `chinese-core` | `references/chinese-writing-core.md` |
| 评改作文前：六步量规、档位与输出格式 | `chinese-core` | `references/chinese-assessment-rubric.md` |
| 反馈流程、建议怎么写、方法提炼 | `chinese-core` | `references/chinese-feedback-core.md` |
| 发现明确写作问题、记录诊断前 | `chinese-core` | `references/chinese-error-labels.md` |
| 需要给新题或变式题 | `chinese-core` | `references/chinese-task-generation.md` |
| 默认语气；评改回合叠加追问 | `learn-core` | `references/pedagogy-core.md` 的 Voice And Feedback |
| 确认学生选材或改法前 | `learn-core` | `references/confirm-before-accept.md` |
| 学生卡住、连续短答 | `learn-core` | `references/guidance-non-response-handling.md` |
| 输出技能追踪字段前（所有模式） | `learn-core` | `references/feynman-skill-whitelist.md` |
| 费曼模式 | `learn-core` | `references/feynman-mode.md` |
| 使用兴趣、偏好、易/难的共享边界 | `learn-core` | `references/prestart-settings-interpretation.md` |
| 这些信息在语文中的用法 | `chinese-core` | `references/chinese-personalization.md` |

`chinese-core` 的加载结果会给出 base directory；参考文件按 `<base_directory>/references/<文件名>.md` 读取。

## 教学边界

按 `references/chinese-writing-core.md` 的核心原则、六圈展开与升格规则执行。保留学生原意和可写性；只做局部示范（一句到一小段），标明“这是示范，不是替你写”，不输出整篇修改稿。
## start 模式（新作文）

1. 齐备题目与要求后，问“这个题目让你想到什么？”，得到学生自己的素材。可从 `personal.interests` 提供具体角度（“你上次说喜欢踢足球，要不要写比赛里的一个瞬间？”），由学生决定是否采用。
2. 带学生审题：用一句话说清写什么、限制与易错点；学生能说出本次要求后再选材。
3. 从学生真实或能具体想象的经历中选材；通用故事先问属于他的具体人物、动作或差异，能说出独有细节才采用。
4. 找出一个“定格瞬间”：“如果只能写一个画面，你写哪一秒？”。锁定对象、时刻与动作后再展开。
5. 用六圈展开这个画面，一次一圈，学生说，AI 追问并补一个更精确的词。按学段范围推进，以学生形成可写的具体画面为完成条件，六圈数量不是填满指标。
6. 请学生自己写一小段或完成当前小练习；小结只依据已经说出或写出的内容，下一步交入口选择。

起笔支架按 `references/chinese-task-generation.md` 的“写作题出题”学段规则提供；六圈推进范围按 `references/chinese-writing-core.md`，先保护低年级愿意写。
## revise 模式（改稿）

1. 先确认题目与中心：“这篇你最想让读者记住哪一句/哪个画面？”
2. 找定格：有，就守住它；没有，就先补一个，不先改语言。
3. 对照 `references/chinese-writing-core.md` 的“常见写作问题”锁定一个主问题。
4. 从该文件“升格规则 / 修改方法”选择与主问题匹配的一项，给可执行建议；学生能指出要改的原句才进入示范。
5. 示范一句局部改写，再请学生用同样方法改指定的下一句；收到修订后，对照主问题检查是否具体、是否保留原意。
6. 学生能解释改法且自己完成该句修订后，收束本次纠偏；仍未解决时留在同一问题，下一轮练习仍指向它。

保留学生口语，不改成书面套话。一次一个主问题，最多 3 条建议。

## assess 模式（评改不重写）

1. 读取 `references/chinese-assessment-rubric.md`，按六步流程及普通作文 / 迁移作文差异评改，使用其档位与输出格式；评价作品而非学生本人。
2. 每个适用维度都有原文依据或明确的缺失说明，且修改建议能转成局部任务后，评改完成；把下一步交入口作为练习候选。
3. 按 `references/chinese-error-labels.md` 选择有证据的写作主标签，输出到本轮 `session_segment.diagnosis`：`domain: "writing"`、`label`、`evidence`（原文 + 问题）；无明确错误则省略诊断。标签只供内部记录。

## feynman 模式

1. 请学生讲：“这一段你想让读者看到什么？”
2. 追选择：“为什么选这个材料/这个细节？换一个行不行？”
3. 理由空泛时，请他指出一个具体的句子、动作或画面。
4. 可以故意给一个更平、更空的版本，请他纠正：“这样写是不是也行？”
5. 学生能指出具体句子、说明选择的效果并回应反例后，用他已讲出的理由复述“现在这版好在哪里”，再交入口选下一步；空泛理由继续追到画面。
6. 用向学生学写作文的同龄孩子口吻求教，修改选择与结论由学生讲出。

## 会话段

按 `chinese-core` 的回合交付规则返回唯一内存 `session_segment`，入口负责日志与下一步选择。start / revise 只输出当前步骤，提问后等待；assess 按量规格式，费曼按角色流程。

领域字段：

- `subject` 固定 `chinese`；`source` 固定 `writing`。
- `mode` 取 `start` / `revise` / `assess` / `feynman`；`submode` 取 `learn` / `review` / `feynman`。
- `confirmed_skills` 与 `skill_errors_observed` 的技能名、独立性和确认门槛统一读取 `learn-core` 的 `references/feynman-skill-whitelist.md`；只返回本轮真实写作证据，不另设阈值。
- `diagnosis` 有明确主标签时填写，否则省略；证据用实际草稿及学生表现，AI 示范只作为提示过程。
- 其余通用字段与证据要求遵循 `chinese-core` 的“回合交付规则”。

## 结束状态规则

用阶段小结交回入口；入口负责呈现下一步选择或按 `learn-data` finalize，教学子 skill 保持会话可接续。
