---
name: chinese-core
description: 语文规则。阅读、写作、读写迁移、出题、评改、长期训练前加载；阅读因生活经验缺口难以感受情感、意境或人物处境时，按内部动作表桥接。
user-invocable: false
---

# 语文规则

1. 教学前加载 `learn-core`，共享语气、确认机制、年级适配、结束信号、费曼、技能追踪与安全边界均按它执行；使用兴趣、偏好、易/难主题或经历时，先读其 `references/prestart-settings-interpretation.md` 的共享边界，再读本 skill 的 `references/chinese-personalization.md`。
2. 没有 `session.json` 时引导 `/start`。具体回合由 `chinese-session` 路由到子 skill；本 skill 只提供规则，不产生学生可见回复、`session_segment` 或学生数据写入。
3. 语文专属规则以本 skill 的 references 为准，按下表读取，不一次全部读入。加载 skill 返回 base directory 后，用 `<base_directory>/references/<文件名>.md` 定位；跨 skill 引用先按名称加载，不拼跨 skill 相对路径。

| 条件 | 读取 |
|---|---|
| 阅读教学前；需要六种深读方法、文本证据或阅读纠偏 | `references/chinese-reading-core.md` |
| 写作教学前；需要六圈、升格或提炼迁移技巧 | `references/chinese-writing-core.md` |
| 给反馈、提炼方法或安排长期训练前 | `references/chinese-feedback-core.md` |
| 生成阅读题或写作题前 | `references/chinese-task-generation.md` |
| 批改作文、判断档位或选择最值得改的 3 处前 | `references/chinese-assessment-rubric.md` |
| 每次选择阅读/写作错误标签、记录诊断前 | `references/chinese-error-labels.md` |
| 短答、沉默、不愿解释后的探查对照 | `references/chinese-non-response.md` |
| 使用兴趣、偏好、易/难主题或经历 | `references/chinese-personalization.md` |
| 分类学习目标或文件交接后的语文目标 | `references/chinese-target.md` |
| 初始化、重选年级或选择默认领域与题型 | `references/chinese-grade-defaults.md` |
| 写语文偏好、水平或科目档案 | `references/chinese-profile-fields.md` |

## 内部动作

调用方按名称加载本 skill 后，在本表定位流程；无需调用独立辅助技能或拼跨包路径。下列动作不替代学科教学入口。

| 动作 / 触发 | 按需读取 | 输入 → 返回 / 接续 |
|---|---|---|
| 经验桥接：学生能复述字面，却因缺少生活经验难以感受情感、意境或人物处境 | `references/experience-gap-bridging.md` | 阅读片段、情感目标、理解状态、原文证据 → `status` 与桥接证据；回到阅读当前焦点，不另产段 |

阅读角度、写作题目、迁移主题与桥接按 `references/chinese-personalization.md` 从 `personal.interests` 选一个具体细节；不合适则用年级默认主题。学生保留表达与作答主体权：教学只给局部示范，完整作文或完整作答由学生完成；出题配套参考答案按出题规则提供。不要新写 `submode: experience_bridging`。

## 回合交付规则

- 教学步骤跨学生消息推进：提出思考问题后等待回答，再按确认规则判断是否进入下一步。输出当前步骤所需内容，后续任务只作候选；费曼按其角色规则说话，追问点见 `references/chinese-personalization.md`。
- 每次回复由当前教学子 skill 返回一个内存 `session_segment`，桥接结果并入阅读段；入口是唯一日志写入方。通用字段契约按 `learn-data` 的 `references/profile-schema.md` 的 Session Segment，子 skill 只补充领域约束。
- `strategy_summary` 区分独立完成与提示后表现；`strengths`、`difficulties`、`diagnosis` 和技能追踪均以已发生的学生表现为依据。尚未作答、只有 AI 示范或只有出题时，相关表现字段留空；无明确主标签时省略 `diagnosis`。
- `next_step_candidate` 是建议，`feynman_handoff_recommended` 是入口的候选提示，均不代表学生已选择或已完成。下一步流程选择由入口用 `ask_user_question` 呈现。
- 需确认或撤销技能时读取 `learn-core` 的 `references/feynman-skill-whitelist.md`；诊断标签及与技能错误的分工只由本 skill 的 `references/chinese-error-labels.md` 定义。

需要读写学生数据时，由调用方加载 `learn-data` 并按其协议执行；需要处理错题文件时，由调用方加载 `learn-errors`。本 skill 不承担教学、诊断或持久化。
