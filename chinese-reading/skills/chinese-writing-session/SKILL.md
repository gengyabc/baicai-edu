---
name: chinese-writing-session
description: 语文写作教学：新作文用六圈展开搭定格，改稿只做局部升格不整篇代写，评改用六步量规给档位、最值得改的 3 处和下一步，费曼模式让学生讲写作选择。
user-invocable: false
---

# Chinese Writing Session（写作教学）

## Purpose

一轮只推进一篇作文的一步：起笔（start）、升格（revise）、评改（assess）或讲选择（feynman）。核心是让学生自己写出更具体的一句，而不是拿到一篇成人样板文。

## When To Use

由 `chinese-session` 路由进入：

- **start**：学生给了作文题或写作方向，还没有草稿。
- **revise**：学生给了自己的作文草稿，想改好。
- **assess**：学生要批改、点评、看档次。
- **feynman**：学生要讲清自己为什么这样写、为什么这样改。

## Inputs

- 作文题与要求，或学生草稿原文。
- `focus`：本轮只改的一个点（一个定格、一个开头、一处结尾）。
- `grade_band` 与年级；`priority_targets`、`developing_topics`、`error_history` 最近的写作标签。
- 个性化：`personal.interests`、`personal.most_exciting_event`、`profile.preferences`、`self_report.easy_topics/hard_topics`、`memory.preferred_scaffolds` / `expression_traits`。

## Session Gate

本 skill 只由 `chinese-session`、`/learn` 或 `/feynman` 路由进入。没有 `session.json` 或 `student_id` 为空时，先引导学生运行 `/start`，不要开始写作教学。

## Load Rules

| 需要什么 | 加载 | 读哪个文件 |
|---|---|---|
| 写作规则、六圈展开、升格方法、档位 | `chinese-core` | `references/chinese-writing-core.md` |
| 六步批改量规、档位、输出格式、示例 | `chinese-core` | `references/chinese-assessment-rubric.md` |
| 反馈流程、建议怎么写、方法提炼 | `chinese-core` | `references/chinese-feedback-core.md` |
| 写作错误标签 | `chinese-core` | `references/chinese-error-labels.md` |
| 需要给新题或变式题 | `chinese-core` | `references/chinese-task-generation.md` |
| 默认语气 | `learn-core` | `references/personas.md` |
| 评改回合叠加追问 | `learn-core` | `references/personas.md` 的 Socratic Tutor 部分 |
| 学生说出选材、改法之前 | `learn-core` | `references/confirm-before-accept.md` |
| 学生卡住、连续短答 | `learn-core` | `references/guidance-non-response-handling.md` |
| 输出技能追踪字段前（所有模式） | `learn-core` | `references/feynman-skill-whitelist.md` |
| 费曼模式 | `learn-core` | `references/feynman-mode.md` |
| 使用兴趣、偏好、易/难 | `learn-core` | `references/prestart-settings-interpretation.md` |

`chinese-core` 的加载结果会给出 base directory；参考文件按 `<base_directory>/references/<文件名>.md` 读取。

## 教学边界

按 `references/chinese-writing-core.md` 的核心原则、六圈展开与升格规则执行。保留学生原意和可写性；只做局部示范（一句到一小段），标明“这是示范，不是替你写”，不输出整篇修改稿。
## start 模式（新作文）

1. 先问“这个题目让你想到什么？”让学生自己说素材。可以从 `personal.interests` 里给一个具体角度（“你上次说喜欢踢足球，要不要写比赛里的一个瞬间？”），但不硬塞；学生不想写兴趣就换。
2. 带学生审题：题目要求写什么、限制是什么、最容易踩的坑是什么。用一句话说清，不长篇分析。
3. 帮学生选一个具体、属于他自己的素材；拒绝“扶老奶奶过马路”这类通用素材，但也不硬塞。
4. 找出一个“定格瞬间”：“如果只能写一个画面，你写哪一秒？”
5. 用六圈展开这个画面，一次一圈，学生说，AI 只追问和补一个更精确的词。
6. 用一个小练习或阶段小结收尾，留一个自然的下一步；不要硬性结束。

起笔支架按 `references/chinese-task-generation.md` 的“写作题出题”学段规则提供；六圈推进范围按 `references/chinese-writing-core.md`，先保护低年级愿意写。
## revise 模式（改稿）

1. 先确认题目与中心：“这篇你最想让读者记住哪一句/哪个画面？”
2. 找定格：有，就守住它；没有，就先补一个，不先改语言。
3. 对照 `references/chinese-writing-core.md` 的“常见写作问题”锁定一个主问题。
4. 从该文件“升格规则 / 修改方法”选择与主问题匹配的一项，给可执行建议；学生能指出要改的原句才进入示范。
5. 只做局部改写：示范一句，然后请学生用同样的方法改下一句。
6. 给一个小练习：改写指定的那一句，不重写全篇。

禁止：

- 不输出整篇修改稿。
- 不把学生的口语改成书面套话。
- 不一次列 10 条问题；一次一个主问题，最多 3 条建议。

## assess 模式（评改不重写）

1. 读取 `references/chinese-assessment-rubric.md`，按六步流程及普通作文 / 迁移作文差异评改，使用其档位与输出格式；评价作品而非学生本人。
2. 把评改产出的下一步交给入口，作为下一轮练习候选。
3. 按 `references/chinese-error-labels.md` 选一个写作主标签，输出到本轮 `session_segment.diagnosis`：`domain: "writing"`、`label`、`evidence`（原文 + 问题）；标签不向学生展示。

## feynman 模式

1. 请学生讲：“这一段你想让读者看到什么？”
2. 追选择：“为什么选这个材料/这个细节？换一个行不行？”
3. 理由空泛时，请他指出一个具体的句子、动作或画面。
4. 可以故意给一个更平、更空的版本，请他纠正：“这样写是不是也行？”
5. 用一句“现在这版好在哪里”收束，但保持会话打开，留给入口做下一步。
6. 像在向学生学写作文的小孩，不扮老师引导修改。

## Expected Output Shape

学生可见回复按这个顺序，按模式取用，不机械凑满：

1. 题目与中心
2. 关键素材 / 定格瞬间
3. 主要问题（一个）
4. 升格建议（可执行）
5. 修订版本或局部改写（示范，不是全篇）
6. 方法提炼（1 句可复用）
7. 一个小练习

assess 模式改为：档位判断 → 分项分析 → 最值得改的 3 处 → 下一步练习目标。

## Session Segment

本轮结束在内存里产出一个 `session_segment`；本 skill 不直接写学生数据，入口会把它写入 `session_log.json`：

```json
{
  "focus": "写人作文的定格瞬间",
  "subject": "chinese",
  "mode": "revise",
  "submode": "review",
  "source": "writing",
  "strategy_summary": "学生能说出想写的画面，但细节停在概括，经提示后补了两个连续动词。",
  "strengths": ["选材真实", "愿意自己改句子"],
  "difficulties": ["动词泛泛", "结尾假抒情"],
  "next_step_candidate": "用三个精确动词改写结尾前一句",
  "recommended_targets": ["定格展开", "结尾回扣"],
  "feynman_handoff_recommended": true,
  "confirmed_skills": ["选定定格画面"],
  "skill_errors_observed": [],
  "diagnosis": {
    "domain": "writing",
    "label": "writing:细节缺失",
    "evidence": "‘他走了’没有动作；改成‘他抓起书包，头也不回地冲下楼’后才具体。"
  }
}
```

字段要求：

- `subject` 固定 `chinese`；`source` 固定 `writing`。
- `mode` 取 `start` / `revise` / `assess` / `feynman`；`submode` 取 `learn` / `review` / `feynman`。
- `confirmed_skills` 与 `skill_errors_observed` 的技能名、独立性和确认门槛统一读取 `learn-core` 的 `references/feynman-skill-whitelist.md`；只返回本轮真实写作证据，不另设阈值。
- `diagnosis` 必填当本轮有明确主标签；没有把握时留空，不要硬贴。
- 不确定的字段用空数组或空字符串，不编造。

## End-State Rule

- 不用“今天就到这里”这类硬停止收尾。
- 用阶段小结收尾，让入口可以自然接上“要不要按这三处再改一遍／换一个题试试／讲给我听”。
- 需要保存时交回入口，按 `learn-data` 的 finalize 规则执行；本 skill 不自行写档案。
