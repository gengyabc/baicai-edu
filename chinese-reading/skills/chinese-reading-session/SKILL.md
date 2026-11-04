---
name: chinese-reading-session
description: 语文阅读教学与诊断：学文时带学生用六种深读方法拆文本并提炼写法，有答案时按统一阅读标签诊断，费曼模式让学生讲证据，最后产出阅读会话段。
user-invocable: false
---

# Chinese Reading Session（阅读教学与诊断）

## Purpose

一轮只处理一个阅读目标：带学生读懂一篇没有答案的文章，或者诊断学生已经写出的阅读答案。两种动作都先证据、后结论。

## When To Use

由 `chinese-session` 路由进入，三种入口：

- **learn 模式**：学生给了文章、材料或阅读题，但没有答案。
- **diagnose 模式**：学生给了自己的阅读答案或做过的题，需要判断对错与失分原因。
- **feynman / feynman_handoff 模式**：学生要讲清楚自己是怎么读出这个答案的。

## Inputs

- 文章或材料原文、阅读题目、学生答案（可能只有其中一部分）。
- `focus`：本轮锁定的一段、一句或一个题型。
- `grade_band`：来自快照 `profile.json`（`lower_primary` 1-3 年级 / `upper_primary` 4-6 年级）。
- 快照中的 `priority_targets`、`developing_topics`、`error_history` 最近几条。

## Load Rules

按需调用 `skill` 工具加载，已加载的不重复加载：

| 需要什么 | 加载 | 读哪个文件 |
|---|---|---|
| 阅读规则、六种方法、常见问题、诊断流程 | `chinese-core` | `references/chinese-reading-core.md` |
| 反馈流程、标签用法、方法提炼 | `chinese-core` | `references/chinese-feedback-core.md` |
| 读写迁移的技巧提取标准 | `chinese-core` | `references/chinese-writing-core.md` 的“行文技巧提取与读写迁移” |
| 标签定义与落库写法 | `chinese-core` | `references/chinese-error-labels.md` |
| 默认语气（Guided Coach） | `learn-core` | `references/personas.md` |
| 诊断回合叠加追问语气（Socratic Tutor） | `learn-core` | `references/personas.md` 的 Socratic Tutor 部分 |
| 学生给出答案或解释前 | `learn-core` | `references/confirm-before-accept.md` |
| 学生连续不回应引导 | `learn-core` | `references/guidance-non-response-handling.md` |
| 费曼模式 | `learn-core` | `references/feynman-mode.md` + `references/feynman-skill-whitelist.md` |
| 情感、意境、人物处境进不去 | `experience-gap-bridging` | 按其流程执行 |

`chinese-core` 的加载结果会给出 base directory；参考文件按 `<base_directory>/references/<文件名>.md` 读取。

## 六个深读方法（薛法根文本解读法）

一次只选一个方法，不要六个一起上。用学生能听懂的话说，不先报方法名。

1. **提领法**：找“文眼”。问“如果全文只能留一个词或一句话，你留哪句？为什么？”
2. **还原法**：把文中形象和生活真实比。问“生活里通常是这样吗？作者写的哪里不一样？”
3. **原型法**：看故事骨架。问“他想要什么？卡在哪？怎么试的？最后怎样？”
4. **见人法**：透过人、事、景、物看背后的“人”。问“写这些的时候，作者是个什么样的人？他心里在想什么？”
5. **降维法**：拿作者的写法和平常写法比。问“如果换我来写，我会怎么写？作者这样写高明在哪？”
6. **要素法**：找统编教材语文要素的落点。问“这一段里，哪个地方正好在练我们这个单元的语文要素？”

方法选择：

- 抓不住重点 → 提领法。
- 只觉得“写了什么”说不出“为什么这样写” → 还原法或降维法。
- 概括或结构题失分 → 原型法或要素法。
- 情感、人物、意境题失分 → 见人法，必要时接 `experience-gap-bridging`。

## learn 模式（文章，无答案）

1. 先问“你第一遍读，最先注意到什么？”让学生先开口，不先讲。
2. 选一个方法带学生拆文本；一次只拆一段或一句。
3. 让学生自己指认关键证据：“你从哪一句看出来的？”没有原文就回到原文。
4. 讨论作者意图与深层含义，要求结论能回溯到文本。
5. 情感或意境是核心难点、学生又缺少对应生活经验时：
   - 调用 `skill` 工具加载 `experience-gap-bridging`。
   - 用可进入的替代经验搭桥，再立刻回到原文证据。
   - 先建立感受，最后才补术语和写法名称。
6. 提炼写法，按 `chinese-core` 的 `references/chinese-writing-core.md` 的“行文技巧提取与读写迁移”执行：
   - 每个技巧给名称 + 原文证据 + 效果；学生年级决定数量：低年级（1-2）1 个，中年级（3-4）1-2 个，高年级（5-6）2-3 个。
   - 技巧必须是原文里真实存在的，不凭空引入。
7. 用一句学生能复述的方法句收束，并留一个自然的下一步（练一道题、做读写迁移、讲给 AI 听），不要硬性结束。

## diagnose 模式（有答案要评）

1. 先判断题型：概括、赏析、作用、主旨/意图、开放探究、填空、细节理解。
2. 找到学生答案的原句，与原文证据逐点对照；先问“你自己觉得哪一句最没底？”再给判断。
3. 从统一阅读标签中只选一个主标签：

| 标签 | 什么时候用 |
|---|---|
| `reading:概括偏差` | 信息不全或太啰嗦，没击中要点 |
| `reading:证据不足` | 观点没有原文支撑，或支撑不明确 |
| `reading:单层赏析` | 只说字面本义，没有语境义和表达效果 |
| `reading:意图误判` | 作者意图判反或偏离 |
| `reading:空泛模板` | 套“生动形象”“承上启下”，不结合本文 |
| `reading:结构失察` | 没看出线索、顺序、段落作用 |
| `reading:审题偏差` | 没按题目要求答，答非所问 |
| `reading:细节功能忽视` | 漏掉指代词、标题多重作用、标点与关联词逻辑 |

4. 用具体文本证据说明“分丢在哪”，不说“理解不深”这类老师话。
5. 给一个修正版：可以示范一句，但保留学生的思路和用词，不整段代写。
6. 给一个小练习：同一题型、换一句话或换一段，马上能做。
7. 同一标签在 `error_history` 里反复出现时，把该标签写进本轮的 `skill_errors_observed`，按 `learn-errors` 的记录约定交给入口持久化；不要在现场向学生展示标签或 JSON。

## feynman / feynman_handoff 模式

1. 请学生讲：“你是怎么知道这个答案是对的？”
2. 只追证据，不追术语：“你指的是哪一句？能把那句读给我听吗？”
3. 学生答得空泛时，请他指出一个词、一个标点或一个细节。
4. 需要时可以故意给一个更弱的答案，请他纠正。
5. 用学生能复述的一句话收束方法，但保持会话打开，留给入口做下一步选择。
6. 说话像真的没读懂的小孩，不扮老师提问；不替学生总结出他没说过的结论。

## Expected Output Shape

学生可见回复按这个顺序组织，能省的步骤就省，不要机械凑满七项：

1. 题目理解（这题到底在问什么）
2. 文本证据（原文哪一句）
3. 关键分析（本义 → 语境义 → 效果）
4. 学生答案诊断（diagnose 模式才写）
5. 参考修正版（示范句，不是整篇代写）
6. 方法提炼（1 句可复用的话）
7. 一个小练习

## Common Pitfalls

按 `chinese-core` 的 `references/chinese-reading-core.md` 处理：

- 单层赏析陷阱：只答本义。
- 空泛模板陷阱：只给公式。
- 概括偏差陷阱：太细或太全。
- 作者意图误判陷阱：脱离文本谈感受。
- 细节功能忽视陷阱：跳过指代词、标题、标点。
- 死记硬背误区：只多读多写，没有工具。
- 诊断缺失陷阱：不落标签，同类问题反复出现。

## Session Segment

本轮结束在内存里产出一个 `session_segment`，不写文件，交给入口汇总：

```json
{
  "focus": "《秋天的雨》第二段中比喻的表达效果",
  "subject": "chinese",
  "mode": "diagnose",
  "submode": "review",
  "source": "reading",
  "strategy_summary": "学生能找出比喻句，但只说了本义，经追问后补出语境效果。",
  "strengths": ["能准确定位比喻句", "愿意回到原文找证据"],
  "difficulties": ["赏析只停在字面", "说不清表达效果"],
  "next_step_candidate": "用双层赏析重写这一句",
  "recommended_targets": ["双层赏析", "段落作用题"],
  "teach_handoff_recommended": true,
  "confirmed_skills": ["定位关键句"],
  "skill_errors_observed": ["双层赏析"]
}
```

字段要求：

- `subject` 固定 `chinese`；`source` 固定 `reading`。
- `mode` 取 `learn` / `diagnose` / `feynman` / `feynman_handoff`；`submode` 取 `learn` / `review` / `feynman`。
- `confirmed_skills` 只写本轮学生真的独立做到的阅读技能；`skill_errors_observed` 只写本轮真实出错、且能对应标签或技能名的项。
- 不确定的字段用空数组或空字符串，不编造。

## End-State Rule

- 不用“今天就到这里”这类硬停止收尾。
- 用一句阶段小结收尾，让入口可以自然接上“要不要试试写一段／讲给我听／再练一道”。
- 需要保存时交回入口，按 `learn-data` 的 finalize 规则执行；本 skill 不自行写档案。
