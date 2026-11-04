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

## Inputs

- 已读过的阅读材料原文；本轮阅读 session 提炼出的技巧（若有）。
- 学生年级段与 `grade_band`。
- 快照里的 `priority_targets`、`developing_topics`，用来选迁移方向。

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

`chinese-core` 的加载结果会给出 base directory；参考文件按 `<base_directory>/references/<文件名>.md` 读取。

## Process

### 第 1 步：提炼技巧（1-3 个）

按 `chinese-core` 的 `references/chinese-writing-core.md` 的“行文技巧提取与读写迁移”执行：

- 每个技巧四件套：**名称**（学生能懂，如“用动作写心情”）+ **原文证据**（引用原句）+ **效果**（这样写好在哪里）+ **迁移提示**（学生写的时候怎么用）。
- 数量按年级：1-2 年级 1 个，3-4 年级 1-2 个，5-6 年级 2-3 个。
- 技巧必须真实存在于原文，不可凭空引入，不可只给修辞标签。
- 用学生的话讲，讲完请学生用自己的话说一遍，确认后再进入第 2 步。
- 学生说不清时，带他回到原句，指着那个词读一遍，不追加术语。

### 第 2 步：生成写作任务

按 `chinese-core` 的 `references/chinese-task-generation.md` 的“基于行文技巧的写作题出题”执行：

- 主题必须与阅读材料不同，不能换个标题照搬。
- 明确提示用哪个技巧，但不写成填空指令。
- 学段递进：
  - 1-2 年级：主题 + 开头句 + 技巧提示。
  - 3-4 年级：主题 + 技巧提示 + 两三个可写方向。
  - 5-6 年级：只给主题与要求，学生自由选材和运用。
- 题目要留出使用技巧的空间；学生一看就知道自己能写什么。

### 第 3 步：陪写

- 学生写的时候不打断，不逐句批注。
- 在自然的位置提醒一次技巧：“这里可以试试刚才那个用动作写心情。”
- 学生说出选材、角度、改法时，先走 `learn-core` 的三步确认，再决定是否认可。
- 学生卡住只给一个小提示：一个问句、一个可写的画面、一个动词，不给段落。
- 绝不替学生写正文；示范最多一句，并说明是示范。
- 学生写偏题时，先用一句问句把他拉回题目，不直接改他的句子。

### 第 4 步：评改

按 `chinese-core` 的 `references/chinese-assessment-rubric.md` 执行完整六步：

切题 → 技巧运用 → 内容 → 结构 → 语言 → 深度。

- **技巧运用必查**，这是迁移写作和普通作文最大的区别：
  - 有没有用？没用就是三档以下。
  - 用得自然还是生硬？生硬套用要指出“像贴上去的”。
  - 效果达到了吗？“用动作写心情”有没有真的让读者感到那个心情？
- 输出：档位判断（一/二/三/四档）+ 分项分析 + 最值得改的 3 处（原文 + 问题 + 改法）+ 下一步练习目标。
- 给一个 `technique_application_quality` 的短判断，一句话说清自然还是生硬。

### 第 5 步：最多两轮

- 评改后问：“想按这三处再改一遍，还是换一个题再试？”
- 最多 2 轮（改稿或换题各算一轮）。
- 第 2 轮结束后，无论学生还想不想继续，都收束并把控制权交回入口做 finalize。
- 收束时给一句阶段总结 + 一个可带走的下一步，不用硬停止语。

## 低年级简化流程（1-2 年级）

- 阅读材料 50-100 字即可。
- 只提 1 个非常直观的技巧（用动作写心情、写颜色形状、用声音词）。
- 写作任务给主题 + 开头句。
- 评改从轻：只看“有没有试着用” + 一处具体可改，不铺开六步长评。
- 不要求结构完整，先保护愿意写的劲头。

## Expected Output Shape

1. 提炼的技巧（名称 + 原文证据 + 效果 + 怎么用）
2. 写作任务（题目 + 提示 + 可写方向，按年级给）
3. 写后评改：档位 → 分项（技巧运用必填）→ 最值得改的 3 处 → 下一步
4. 一句阶段总结

## Session Segment

本轮在内存里产出一个 `session_segment`，不写文件：

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
  "teach_handoff_recommended": true,
  "confirmed_skills": ["用动作写心情"],
  "skill_errors_observed": ["空泛模板"],
  "techniques_extracted": ["用动作写心情"],
  "technique_application_quality": "中段自然，结尾生硬，属于半用对"
}
```

字段要求：

- `subject` 固定 `chinese`；`mode` 固定 `learn`；`submode` 固定 `read_write_transfer`；`source` 固定 `writing`。
- 额外必填：`techniques_extracted`（本轮真正提取的技巧名）、`technique_application_quality`（一句话，自然/半自然/生硬/未使用）。
- 第 2 轮仍未用上技巧时，`skill_errors_observed` 保留对应标签，`next_step_candidate` 指向同一个技巧，不要换目标掩盖问题。

## End-State Rule

- 不用硬停止收尾。
- 评改后先问改稿还是换题；最多 2 轮。
- 第 2 轮结束交回入口，按 `learn-data` 的 finalize 规则保存；本 skill 不自行写档案。
