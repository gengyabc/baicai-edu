---
name: chinese-core
description: Chinese shared rules. Load before reading, writing, read-write transfer, task generation, feedback, or long-term training; when reading stalls because of missing life experience for emotion, imagery, or character situation, bridge via the internal action table.
user-invocable: false
---

# 语文规则

本 skill 只提供规则，不产生学生可见回复、`session_segment` 或学生数据写入。具体回合由 `chinese-session` 路由到子 skill；子 skill 只写自己的流程与领域字段，下面的门槛、输入与共用读取不再重复。

## 开始门槛与输入

- 语文教学子 skill 只经 `/learn` 或 `/learn-feynman` 的共享生命周期、由 `chinese-session` 路由进入。会话、学生与快照已由入口检查并传入，这里不重复检查或重读；没有入口交接（无快照）时请学生输入 `/learn`。
- `grade_band` 来自快照，年级段规则见 `learn-data` 的 `references/grade-band-defaults.md`。
- 个性化输入：`personal.interests`、`personal.most_exciting_event`、`profile.preferences`、`self_report.easy_topics/hard_topics`、`memory.preferred_scaffolds` / `recent_error_patterns` / `expression_traits` / `stable_strengths` / `stable_difficulties` / `material_difficulty`。目标选择另看 `priority_targets`、`developing_topics` 与最近 `error_history`。
- 生成或调整文本前，若 `memory.profile_memory.material_difficulty` 不是 `standard`，按 `learn-core` 的 `references/difficulty-adjustment.md` 调文本长度或问题层数。

## 读取规则

按条件读取，不一次全部读入，已读的不重复读。

所有语文教学子 skill 共用：

| 条件 | 加载 | 读取 |
|---|---|---|
| 默认语气（Guided Coach）；诊断、评改回合叠加 Socratic 追问 | `learn-core` | `references/pedagogy-core.md` 的 Voice And Feedback |
| 确认学生答案、解释、选材或改法前 | `learn-core` | `references/confirm-before-accept.md` |
| 学生卡住、连续短答、沉默或不愿解释 | `learn-core` | `references/guidance-non-response-handling.md`，再读本 skill 的 `references/chinese-non-response.md` |
| 输出 `confirmed_skills` / `skill_errors_observed` 前（所有模式） | `learn-core` | `references/feynman-skill-whitelist.md` |
| 费曼模式 | `learn-core` | `references/feynman-mode.md` |
| 使用兴趣、偏好、易/难主题或经历 | `learn-core` | `references/prestart-settings-interpretation.md`，再读本 skill 的 `references/chinese-personalization.md` |

语文专属规则以本 skill 的 references 为准：

| 条件 | 读取 |
|---|---|
| 阅读教学前；需要六种深读方法、文本证据或阅读纠偏 | `references/chinese-reading-core.md` |
| 写作教学前；需要六圈、升格或提炼迁移技巧 | `references/chinese-writing-core.md` |
| 给反馈、提炼方法或安排长期训练前 | `references/chinese-feedback-core.md` |
| 生成阅读题或写作题前 | `references/chinese-task-generation.md` |
| 批改作文、判断档位或选择最值得改的 3 处前 | `references/chinese-assessment-rubric.md` |
| 每次选择阅读/写作错误标签、记录诊断前 | `references/chinese-error-labels.md` |

## Subject contract

`supported_stages: lower_primary, upper_primary`。这是默认表达与流程的适配声明，不是内容门槛；其他阶段由统一解析选择通用教学。

`subject: chinese`，教学入口 `chinese-session`，包 `dsh-edu-chinese-reading`。教学交付语言：共用档案 `language`（缺失或未知按 `zh-CN`）。角色含义见 `learn-data` 的 `references/subject-contract.md`；入口与本包分支同样从这里读取。

| Role | Read |
|---|---|
| Target classification：`type` / `intent` 取值、文件交接后的语文目标 | `references/chinese-target.md` |
| Learning recommendations：生成、比较或重排语文小目标 | `references/learning-recommendations.md` |
| Grade defaults：初始化、重选年级或选择默认领域与题型 | `references/chinese-grade-defaults.md` |
| Profile fields：偏好键与 `/learn-start` 选项、水平键、写科目档案 | `references/chinese-profile-fields.md` |
| Diagnosis rules：阅读/写作标签与 `domain` | `references/chinese-error-labels.md` |

## 内部动作

调用方按名称加载本 skill 后，在本表定位流程；无需调用独立辅助技能或拼跨包路径。下列动作不替代学科教学入口。

| 动作 / 触发 | 按需读取 | 输入 → 返回 / 接续 |
|---|---|---|
| 经验桥接：学生能复述字面，却因缺少生活经验难以感受情感、意境或人物处境 | `references/experience-gap-bridging.md` | 阅读片段、情感目标、理解状态、原文证据 → `status` 与桥接证据；回到阅读当前焦点，不另产段 |

阅读角度、写作题目、迁移主题与桥接按 `references/chinese-personalization.md` 从 `personal.interests` 选一个具体细节；不合适则用年级默认主题。学生保留表达与作答主体权：教学示范遵循 `learn-core` 的 `references/pedagogy-core.md` 中“Guide before revealing”，默认由学生完成完整作文或作答；明确索要完整示范时走该规则的“Informed full-solution choice”，提示风险并推荐引导，学生知情后仍坚持则可提供标明来源的完整示范；出题答案的内部准备与对外交付范围按出题规则区分，不以生成题目绕过学生自主作答。不要新写 `submode: experience_bridging`。

## 回合交付规则

- 教学步骤跨学生消息推进：提出思考问题后等待回答，再按确认规则判断是否进入下一步。输出当前步骤所需内容，后续任务只作候选；费曼按其角色规则说话，追问点见 `references/chinese-personalization.md`。
- 每次回复由当前教学子 skill 返回一个内存 `session_segment`，桥接结果并入阅读段。日志、下一步选择卡与保存都由入口负责，子 skill 只返回结果，不再各自声明。通用字段契约按 `learn-data` 的 `references/session-schema.md` 的 Session Segment，子 skill 只补充领域约束。
- `strategy_summary` 区分独立完成与提示后表现；`strengths`、`difficulties`、`diagnosis` 和技能追踪均以已发生的学生表现为依据。尚未作答、只有 AI 示范或只有出题时，相关表现字段留空；无明确主标签时省略 `diagnosis`。
- `next_step_candidate` 是建议，`feynman_handoff_recommended` 是入口的候选提示，均不代表学生已选择或已完成。下一步流程选择由入口用 `ask_user_question` 呈现。
- 需确认或撤销技能时读取 `learn-core` 的 `references/feynman-skill-whitelist.md`；诊断标签及与技能错误的分工只由本 skill 的 `references/chinese-error-labels.md` 定义。