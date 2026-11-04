---
name: chinese-read-write-transfer
description: 读写迁移：从读过的文章提取 1-3 个有原文证据和效果的写法，换一个主题生成写作任务，陪着学生写，再用六步量规评改，技巧运用必查，最多两轮。
user-invocable: false
---

# Chinese Read-Write Transfer（读写迁移）

## Purpose

把“读懂”变成“会写”。同一份阅读材料里提出可迁移的写法，换一个题目让学生用出来，再评他有没有真的用上。

## When To Use

由 `chinese-session` 路由进入，通常出现在阅读教学之后：

- 学生说“我想照着这篇写一篇”“试试用刚才那个写法”。
- 阅读结束时提炼了行文技巧，学生愿意马上用。
- 阅读答得不错，需要一次输出型任务巩固。

不适合：学生还没读懂文章、只要求出题、只要求批改已有作文。这三种分别交给阅读、出题、写作评改。

## Session Gate

本 skill 只由 `chinese-session`、`/learn` 或 `/feynman` 路由进入。没有 `session.json` 或 `student_id` 为空时，先引导学生运行 `/start`，不要开始迁移。

## Inputs

- 已读过的阅读材料原文；本轮阅读 session 提炼出的技巧（若有）。
- 学生年级段与 `grade_band`。
- 快照里的 `priority_targets`、`developing_topics`，用来选迁移方向。
- `current_state.pending_transfer_focus`（若存在）优先作为迁移方向。
- 个性化：`personal.interests`、`personal.most_exciting_event`、`profile.preferences`、`self_report.easy_topics/hard_topics`、`memory.preferred_scaffolds` / `expression_traits`。迁移主题优先从兴趣里选一个具体情境。

## Load Rules

| 需要什么 | 加载 | 读哪个文件 |
|---|---|---|
| 技巧提取标准、六圈展开、升格 | `chinese-core` | `references/chinese-writing-core.md` |
| 出题规则（尤其“基于行文技巧的写作题出题”） | `chinese-core` | `references/chinese-task-generation.md` |
| 六步批改量规、档位、输出格式 | `chinese-core` | `references/chinese-assessment-rubric.md` |
| 反馈流程与方法提炼 | `chinese-core` | `references/chinese-feedback-core.md` |
| 写作标签 | `chinese-core` | `references/chinese-error-labels.md` |
| 学生给出想法、选材、改法前 | `learn-core` | `references/confirm-before-accept.md` |
| 默认语气 | `learn-core` | `references/personas.md` |
| 写作中卡住 | `learn-core` | `references/guidance-non-response-handling.md` |
| 输出技能追踪字段前 | `learn-core` | `references/feynman-skill-whitelist.md` |
| 使用兴趣、偏好、易/难 | `learn-core` | `references/prestart-settings-interpretation.md` |

`chinese-core` 的加载结果会给出 base directory；参考文件按 `<base_directory>/references/<文件名>.md` 读取。

## Process

### 第 1 步：提炼技巧（1-3 个）

按 `chinese-core` 的 `references/chinese-writing-core.md` 的“行文技巧提取与读写迁移”执行：

复用阅读已提取的技巧，并按该处标准校验后补缺，不再重新提取一遍。请学生用自己的话说出技巧如何起作用，确认后进入第 2 步；说不清则回原句指词朗读，不追加术语。

### 第 2 步：生成写作任务

按 `chinese-core` 的 `references/chinese-task-generation.md` 的“基于行文技巧的写作题出题”执行：

优先从 `personal.interests` 选择具体情境，没有合适兴趣则用年级默认主题。按该处不同主题、技巧空间与学段支架标准生成任务，通过其检查后进入陪写。

### 第 3 步：陪写

- 学生写的时候不打断，不逐句批注。
- 在自然的位置提醒一次技巧：“这里可以试试刚才那个用动作写心情。”
- 学生说出选材、角度、改法时，先走 `learn-core` 的三步确认，再决定是否认可。
- 学生卡住只给一个小提示：一个问句、一个可写的画面、一个动词，不给段落。
- 绝不替学生写正文；示范最多一句，并说明是示范。
- 学生写偏题时，先用一句问句把他拉回题目，不直接改他的句子。

### 第 4 步：评改

按 `references/chinese-assessment-rubric.md` 的六步与档位评改，采用其迁移分支，**技巧运用必查**。输出遵循该量规格式，并形成一句 `technique_application_quality`；低年级使用该量规的简化分支，不铺开长评。

### 第 5 步：最多两轮

- 评改后问：“想按这三处再改一遍，还是换一个题再试？”
- 最多 2 轮（改稿或换题各算一轮）。
- 第 2 轮结束后，无论学生还想不想继续，都收束并把控制权交回入口做 finalize。
- 收束时给一句阶段总结 + 一个可带走的下一步，不用硬停止语。

## Expected Output Shape

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
- 额外必填：`techniques_extracted`（本轮真正提取的技巧名）、`technique_application_quality`（一句话，自然/半自然/生硬/未使用）。
- 第 2 轮仍未用上技巧时，在 `diagnosis` 里保留对应标签，`next_step_candidate` 指向同一个技巧，不要换目标掩盖问题。
- `confirmed_skills` 与 `skill_errors_observed` 的技能名、独立性与确认门槛读取 `learn-core` 的 `references/feynman-skill-whitelist.md`；只记录本轮可验证的技巧应用，不另设阈值。

## End-State Rule

- 不用硬停止收尾。
- 评改后先问改稿还是换题；最多 2 轮。
- 第 2 轮结束交回入口，按 `learn-data` 的 finalize 规则保存；本 skill 不自行写档案。
