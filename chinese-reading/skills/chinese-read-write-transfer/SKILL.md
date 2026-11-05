---
name: chinese-read-write-transfer
description: 读写迁移。学生已读懂材料并愿意换主题运用其中写法，或恢复尚未完成的阅读写法迁移练习时使用。
user-invocable: false
---

# Chinese Read-Write Transfer（读写迁移）

先确认学生已读懂材料且愿意练习其中写法；尚未读懂、只要求出题、只要求批改已有作文时，分别交回阅读、出题、写作评改，不开始迁移。

## Session Gate

本 skill 只由 `chinese-session`、`/learn` 或 `/feynman` 路由进入。没有 `session.json` 或 `student_id` 为空时，先引导学生运行 `/start`，不要开始迁移。

## Inputs

- 已读过的阅读材料原文；本轮阅读 session 提炼出的技巧（若有）。
- 学生年级段与 `grade_band`。
- 快照里的 `priority_targets`、`developing_topics`，用来选迁移方向。
- 恢复时复用 `context.turn_state` 的迁移来源、技巧、阶段、轮数及待答问题；没有活跃迁移上下文且 `current_state.pending_transfer_phase: true` 时，才以 `current_state.pending_transfer_focus` 作为候选。学生本次明确选择优先。
- 个性化：`personal.interests`、`personal.most_exciting_event`、`profile.preferences`、`self_report.easy_topics/hard_topics`、`memory.preferred_scaffolds` / `expression_traits`。迁移主题优先从兴趣里选一个具体情境。

## Load Rules

| 需要什么 | 加载 | 读哪个文件 |
|---|---|---|
| 技巧提取标准、六圈展开、升格 | `chinese-core` | `references/chinese-writing-core.md` |
| 出题规则（尤其“基于行文技巧的写作题出题”） | `chinese-core` | `references/chinese-task-generation.md` |
| 收到学生作品后评改：六步量规、档位、输出格式 | `chinese-core` | `references/chinese-assessment-rubric.md` |
| 反馈流程与方法提炼 | `chinese-core` | `references/chinese-feedback-core.md` |
| 评改后有明确错误需落标签 | `chinese-core` | `references/chinese-error-labels.md` |
| 确认学生想法、选材或改法前 | `learn-core` | `references/confirm-before-accept.md` |
| 默认语气 | `learn-core` | `references/personas.md` |
| 写作中卡住 | `learn-core` | `references/guidance-non-response-handling.md` |
| 输出技能追踪字段前 | `learn-core` | `references/feynman-skill-whitelist.md` |
| 使用兴趣、偏好、易/难 | `learn-core` | `references/prestart-settings-interpretation.md` |

`chinese-core` 的加载结果会给出 base directory；参考文件按 `<base_directory>/references/<文件名>.md` 读取。

## Process

按当前阶段逐轮推进；恢复从已记录阶段与待答问题接续。每次交回入口时同步阶段、轮数、已提取技巧与材料引用，由入口更新日志 context；本 skill 只返回内存结果。

### 第 1 步：提炼技巧（数量按学段）

按 `chinese-core` 的 `references/chinese-writing-core.md` 的“行文技巧提取与读写迁移”执行：

复用阅读已提取的技巧，并按该处标准校验后补缺，不再重新提取一遍。请学生指认使用技巧的原文句子，用自己的话说出它如何起作用，确认后进入第 2 步；说不清则回原句指词朗读，不追加术语。

### 第 2 步：生成写作任务

按 `chinese-core` 的 `references/chinese-task-generation.md` 的“基于行文技巧的写作题出题”执行：

优先从 `personal.interests` 选择具体情境，没有合适兴趣则用年级默认主题。按该处不同主题、技巧空间与学段支架标准生成任务，通过其检查后进入陪写。

### 第 3 步：陪写

- 学生连续写作时等待其提交，在自然停顿处提醒一次技巧：“这里可以试试刚才那个用动作写心情。”
- 学生说出选材、角度、改法时，先走 `learn-core` 的三步确认，再决定是否认可。
- 卡住时只给一个小提示：一个问句、一个可写画面或一个动词；正文由学生写，必要示范最多一句并标明示范。
- 偏题时用一个问句请学生回看题目，由他修改。
- 收到学生明确提交的本轮作品后才进入评改；只有构想或尚未交稿时，停在陪写阶段。

### 第 4 步：评改

按 `references/chinese-assessment-rubric.md` 的六步与档位评改，采用其迁移分支，**技巧运用必查**。输出遵循该量规格式，并形成一句 `technique_application_quality`；低年级使用该量规的简化分支，不铺开长评。

### 第 5 步：最多两轮

- 一份学生作品提交并完成评改算一轮；首稿为第 1 轮，之后改稿或换题再写均计第 2 轮。本次迁移最多 2 轮。
- 第 1 轮评改后用 `ask_user_question` 问“想再试一次吗？”，选项为「再改一遍」「换个题再试」「先跳过」；低年级对应一处修改，其他学段按量规的修改重点。选择后再陪写或收束。
- 第 2 轮评改完成或学生跳过时，返回一句阶段总结、一个下一步候选及已完成状态；该次迁移交回入口，不再自行开启第 3 轮。
- 入口按共享生命周期决定继续教学、换主题或 finalize；迁移轮数用尽不是学生结束整个会话的信号。

## Expected Output Shape

跨轮只输出当前阶段所需内容，等待学生回应后再推进；恢复时复用已交付内容。

1. 提炼的技巧（名称 + 原文证据 + 效果 + 怎么用）
2. 写作任务（题目 + 提示 + 可写方向，按年级给）
3. 写后评改：按量规输出（技巧运用必填）；低年级简化分支优先
4. 一句阶段总结

## Session Segment

本轮在内存里产出一个 `session_segment`；本 skill 不直接写学生数据，入口会把它写入 `session_log.json`：

```json
{
  "focus": "用动作写心情的迁移写作",
  "subject": "chinese",
  "mode": "learn",
  "submode": "read_write_transfer",
  "source": "writing",
  "strategy_summary": "学生从《XX》提取“用动作写心情”，写跑步比赛时用了两个连续动词，但结尾又回到直接说感受。",
  "strengths": ["选材具体", "能在中段用动作代替心情词"],
  "difficulties": ["结尾回退到直接抒情"],
  "next_step_candidate": "只改结尾一句，用动作暗示心情",
  "recommended_targets": ["结尾回扣", "侧面描写"],
  "feynman_handoff_recommended": true,
  "confirmed_skills": ["用动作写心情"],
  "skill_errors_observed": [],
  "techniques_extracted": ["用动作写心情"],
  "technique_application_quality": "中段自然，结尾生硬，属于半用对",
  "diagnosis": {
    "domain": "writing",
    "label": "writing:空泛模板",
    "evidence": "结尾又写‘我很开心’，没有用动作承接前面建立的具体画面。"
  }
}
```

字段要求：

- `subject` 固定 `chinese`；`mode` 固定 `learn`；`submode` 固定 `read_write_transfer`；`source` 固定 `writing`。
- 额外返回：`techniques_extracted`（当前迁移确实选用、可含复用阅读结果的技巧名）；收到作品后 `technique_application_quality` 用一句话说明自然 / 半自然 / 生硬 / 未使用及作品依据，尚未交稿时为 `null`，与“未使用”区分。
- 第 2 轮仍未用上技巧时，`next_step_candidate` 继续指向同一技巧；只有作品证据符合标签定义时才填写 `diagnosis`，否则只记录困难与技巧运用情况。
- `confirmed_skills` 与 `skill_errors_observed` 的技能名、独立性与确认门槛读取 `learn-core` 的 `references/feynman-skill-whitelist.md`；只记录本轮可验证的技巧应用，不另设阈值。

通用字段按 `chinese-core` 的“回合交付规则”；有明确问题才按标签表写 `diagnosis`，不能仅因迁移技巧未用上而自造标签。保存由入口按 `learn-data` 执行。
