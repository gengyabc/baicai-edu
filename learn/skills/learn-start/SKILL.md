---
name: learn-start
description: 选择科目或学习目标，切换学习者或为新生建档，准备开始学习。
disable-model-invocation: true
---

# 开始学习

加载尚未加载的 `learn-core`、`learn-data`。依次确认学习身份、识别学生、解析教学实现、激活档案；教学留给 `/learn`。已有日志包含 `finalize_plan` 时先按保存协议恢复，成功后才切换。

## 1. 选科目或目标

首次简述可直接学习，也可用费曼模式让 AI 当听众。可选科目只在这张表维护；学科字段约定见 `learn-data` 的 `references/subject-contract.md`。

| 选项 | subject id | 学科包 |
|---|---|---|
| 数学 | `math` | `dsh-edu-math-primary-low` |
| 语文 | `chinese` | `dsh-edu-chinese-reading` |
| 英语 | `english` | `dsh-edu-english` |

用 `ask_user_question` 问“今天想学什么，还是先聊聊？”，提供表中科目、「其他目标」及「先聊聊，暂不定目标」。用户已明确科目或只想交流时直接采用，不重复选项；其他输入保留原目标，不要求重选或强猜科目。纯交流沿用当前可用任务身份，不切换未完成任务；尚无身份时按解析协议创建中性 task 身份，不编造学习目标。后续只确认必要学习者身份，可跳过阶段与偏好；在本次身份确认期间保留已选择的纯交流意图。激活成功后立即把该意图交生命周期的新建/恢复与支持闸门，持久化最小交流选择：有原题仅叠加 resume_question 并保留完整任务，无原题用 activity: support，不等下一条消息才写入。写回成功才提示可直接交流或用 `/learn` 接续，确保随后无参数 `/learn` 仍保留交流选择；写回失败按生命周期停止并说明尚未保存选择，不宣称准备完成。不自动推荐或出题。

先读取 `learn-data` 的 `references/teaching-resolver.md`：它统一决定真实 `subject`、中性任务身份与稳定 `scope_id`，以及 `teaching = { provider, core_skill, session_skill, evidence_namespace }`。未知目标按该协议使用 `task_<随机hex>`，明确新目标也按其范围规则隔离历史；不能全部写到同一个通用科目。未识别阶段前不提前加载专门包。缺少适配包可用通用任务教学，不要求安装后才能继续。

中途换目标须由生命周期先保存/中断旧任务并取得确认；选择科目本身不热替换未完成任务。

## 2. 清空旧学生选择

确认可以切换后，读取 `outputs/students/session.json`（可能不存在），按 `learn-data` 的 session.json 结构整文件写入过渡状态：`student_id: null`、已选 `subject` 及协议要求的身份字段，两个时间均为当前 ISO 时间。写入成功后再识别学生；失败则说明未切换成功并停止。

## 3. 识别学生

按 `outputs/students/*/profile.json` 匹配共享档案，逐个读取 `student_id`、`name`、可选的 `grade`、`education_stage` 与 `personal.interests`。显示称呼；阶段/年级已知才附加说明，未知不显示“小学”或虚构年级。定位已有学生一律用选择卡，不用开放提问；问姓名只属于第 4 步建档。

- 无学生：进入建档。
- 只有一人：用 `ask_user_question` 确认“我找到的是<name>，对吗？”，选项为「对，是我」「不是」。
- 多人：按最近活跃（`current_state`、session 的 `updated_at`，缺失排后）取前 4 位，用 `ask_user_question` 列出称呼，末项为「都不是」；选「都不是」再按姓名分批翻页，每批 4 位加「都不是」，仍未找到才问是否新建。不一次列全，也不替学生猜身份。
- 姓名重合：用文字问一个澄清问题，分别保留档案。
- 姓名不存在：用 `ask_user_question` 问是否新建档案，确认后建档。

## 4. 新生建档

一次问一个问题，已提供的信息不重复问：

1. 姓名或希望的称呼：用文字问。
2. 可选教育阶段 `education_stage`：用 `ask_user_question` 先给小学、初中、高中、大学/高职、成人及「不确定/暂不提供」六项；选小学再问低段/高段或年级，单卡不超过六项。枚举与兼容规则读 `references/grade-band-defaults.md`；跳过就保持未知。小学阶段可补问年级；`grade` 可缺省，非小学不强填小学年级。
3. 按已知身份和阶段读取 `references/teaching-resolver.md`，采用返回的 `core_skill` 档案字段与默认值；学习偏好用 `ask_user_question` 提供该契约的选项，可跳过。通用实现使用 `learn-general-core` / `learn-general-session`，证据命名空间为 `general_v1`；专门实现为 `specialist`。

兴趣、`learning_context`、长期目标与支持偏好均为可跳过项；只收当前建档必要信息，不邀请倾诉困境或敏感经历。学生明确设定要跨科使用的目标/支持偏好才写共享 `learning_preferences`，字段见 `references/create-student.md`；未提供不推断。

用一句话复述称呼、已提供的阶段/年级和偏好，用 `ask_user_question` 请学生确认，选项为「都对」「要改一下」。确认后读取并执行 `references/create-student.md`。阶段或学习情境影响表达/支持时，加载 `learn-support` 的 `references/learner-stage.md`，不把阶段当能力上限。

建档并激活后，学习入口提示输入 `/learn` 开始；纯交流入口按第 1 步接续，不要求先定学习目标。

## 5. 激活已有学生

1. 按 `references/grade-band-defaults.md` 兼容旧档案，再读 `references/teaching-resolver.md`。已有未完成任务保留原教学实现；新任务才按适配声明选择，不改真实 `subject`。
2. 检查当前科目的 `profile.json`、`memory.json`、`current_state.json`、`milestones.json`、`session_log.json`，缺失文件按 `learn-data` Read Snapshot 初始化；默认值取解析出的教学契约，保留已有证据。
3. 确保目录存在（已存在则保留）：`data/students/<id>/<subject>/raw`、`outputs/students/<id>/<subject>/extracted`、`outputs/students/<id>/<subject>/backups/raw`。
4. 按 `learn-data` 的 session.json 结构写入当前学生、真实科目及所需身份/教学实现字段，更新时间。
5. 必需文件、目录和 session 均写入成功后回复称呼与已明确的学习目标，提示输入 `/learn` 或直接说明意愿；纯交流不虚构目标，按第 1 步接续。失败时报告未完成操作，保留档案供重试。

`outputs/students/` 不存在时由首次写入创建。
