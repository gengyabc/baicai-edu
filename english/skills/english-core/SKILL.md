---
name: english-core
description: 英语共享规则。英语教学、故事与对话活动、词汇句型复习、新闻阅读或生成英语学习记录前加载。
user-invocable: false
---

# 英语规则

本 skill 只提供规则，不产出学生可见回复、`session_segment` 或学生数据写入。具体回合由 `english-session` 调度方法 skill 并回传唯一记录。

## 开始与输入

- 英语教学只经 `/learn` 或 `/learn-feynman` 的共享生命周期、由 `english-session` 进入。会话、学生与快照已由入口检查并传入，这里不重复检查或重读；没有入口交接（无快照）时请学生输入 `/learn`。
- `learn-core`、`learn-data` 已由入口加载。语气、确认、无响应、费曼角色与白名单、个性化边界、结束与安全，都按 `learn-core` 的条件表执行；`mode: feynman` 时先读其 `references/feynman-mode.md`。
- `grade_band` 来自快照；年级只调整任务形式、句子长度和支持方式，不决定英语水平。
- 个性化输入：`personal.interests`、`personal.most_exciting_event`、`profile.preferences`、`self_report.easy_topics/hard_topics`，以及 memory 的支架、动机、近期错误、稳定优势与困难、推荐下一步。
- 生成或调整材料前读 `memory.profile_memory.material_difficulty`；有 `easier` / `harder` 时按 `learn-core` 的 `references/difficulty-adjustment.md` 调一个负荷因素，英语的负荷规则见 `references/english-input-adaptation.md`。
- 文件只由入口调用一次 `learn-errors`。收到 `files_processed: true` 时读 `material_refs` 指向的 extracted 内容；教学中途出现未处理的图片、Markdown 或 raw 扫描请求时交回入口。本包不直接调用 `learn-errors`。
- 默认只做文本交互。没有真正可用的语音或图片能力时，不假装能听发音、看动作或评图片；不据学生的迟疑推测口语水平。

## 按条件读取

共同规则先读，其余在进入对应分支前读取，各自为该规则的唯一来源。

| 条件 | 读取 |
|---|---|
| 所有英语教学、方法选择与反馈纠正 | `references/english-teaching-core.md` |
| 同一材料或活动的多轮推进 | `references/english-turn-arc.md` |
| 生成、改写或调整材料难度 | `references/english-input-adaptation.md` |
| 学生明确求助、具体错误或任务卡住，需要提示与退让 | `references/english-scaffolding.md` |
| 使用兴趣、经历、科目偏好或易/难主题 | `references/english-personalization.md` |
| 选下一目标、判断领域、水平或年级默认任务 | `references/english-grade-defaults.md` |
| 判断目标类型、文件交接后的英语目标 | `references/english-target.md` |
| 选择英语错误标签、记录诊断 | `references/english-error-labels.md` |
| 产出英语 `session_segment` | `references/english-segment-fields.md` |

## 学科契约

`supported_stages: lower_primary, upper_primary`。这是默认表达与流程的适配声明，不是内容门槛；其他阶段由统一解析选择通用教学。

`subject: english`，教学入口 `english-session`，包 `dsh-edu-english`。角色含义见 `learn-data` 的 `references/subject-contract.md`；入口与本包分支同样从这里读取。

| 角色 | 读取 |
|---|---|
| 目标分类：`type` / `intent` 取值、文件交接后的英语目标 | `references/english-target.md` |
| 学习推荐：生成、比较或重排英语小目标 | `references/learning-recommendations.md` |
| 年级默认：初始化、重选年级、默认领域与水平起点 | `references/english-grade-defaults.md` |
| 档案字段：偏好键与 `/learn-start` 选项、水平键、写科目档案 | `references/english-profile-fields.md` |
| 诊断规则：错误标签与 `domain` | `references/english-error-labels.md` |

## 方法 skill

仅 `english-session` 调度方法 skill，方法只提供做法、材料和证据建议，不加载同级方法、不另产 segment 或写学生数据。选择依据见 `references/english-teaching-core.md`。同一材料的多个角度由 `english-session` 按 `references/english-turn-arc.md` 串起来；方法只负责当前角度内的做法。所有方法继承本 skill 的输入与交付规则，按上表读取公共规则；方法里只留理论与专属步骤。

## 回合交付规则

- 教学步骤跨学生消息推进：提出一个可回答的英语问题后等待，再按共享确认规则判断是否进入下一步。一次只保留一个主要待答问题。
- 英语教学的材料、指令、反馈、解释和提问都用英语；学生用中文回应时，用简短英语确认意思再继续，不切回中文讲解。明确例外：`learn-recommend` 引用学习记录的推荐理由统一用学生能懂的中文，推荐卡片的目标说明、流程标签与选择提问也可用中文；选定后恢复英语教学，本例外不延伸到教学讲解。
- 学生可见回复只放学生要做的事：要读的材料、暂定水平标注、来源和问题。不叙述准备过程（如“我把原文改写成了短句”“我找了几篇文章”），不解释自己的做法，不复述流程。
- 阅读或新闻回合从材料本身开始：第一条可见内容就是标题和正文；来源、图片和说明放在正文之后。资源清单放在材料之后，即使学生问的是资源，也先给一篇可读的样篇。
- 不列生词表，也不给词义注释；生词由学生自己猜或自己查，只在学生明确求助时给一处提示。
- 等待状态和已呈现材料交 session 汇总，由入口同步日志 context；日志、下一步选择卡与保存归入口。
- 不编造学生说过的句子、词表、分数、等级或跨会话记忆；没有存储时只说本轮观察。
