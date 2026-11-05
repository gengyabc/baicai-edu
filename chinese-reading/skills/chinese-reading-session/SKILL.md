---
name: chinese-reading-session
description: 阅读教学与诊断。学生学习文章或未作答阅读题、评判已有阅读答案，或在费曼模式讲解阅读证据时使用。
user-invocable: false
---

# 阅读教学与诊断

一轮只处理一个阅读目标，先证据、后结论。无答案的材料进入 `learn`，已有答案需要评判时进入 `diagnose`，学生讲解阅读依据时进入 `feynman`。

## 会话门槛

本 skill 只由 `chinese-session`、`/learn` 或 `/feynman` 路由进入。没有 `session.json` 或 `student_id` 为空时，先引导学生运行 `/start`，不要开始阅读教学。

## 输入

- 文章或材料原文、阅读题目、学生答案（可能只有其中一部分）。
- `focus`：本轮锁定的一段、一句或一个题型。
- `grade_band`：来自快照 `profile.json`；年级段规则见 `learn-core/references/grade-band-defaults.md`。
- 快照中的 `priority_targets`、`developing_topics`、`error_history` 最近几条。
- 个性化：`personal.interests`、`personal.most_exciting_event`、`profile.preferences`、`self_report.easy_topics/hard_topics`、`memory.preferred_scaffolds` / `recent_error_patterns` / `expression_traits` / `stable_strengths` / `stable_difficulties`。

## 读取规则

按需调用 `skill` 工具加载，已加载的不重复加载：

| 需要什么 | 加载 | 读哪个文件 |
|---|---|---|
| 阅读规则、六种方法、常见问题、诊断流程 | `chinese-core` | `references/chinese-reading-core.md` |
| 反馈流程、标签用法、方法提炼 | `chinese-core` | `references/chinese-feedback-core.md` |
| learn 提炼写法时：技巧提取标准与学段 | `chinese-core` | `references/chinese-writing-core.md` 的“行文技巧提取与读写迁移” |
| 已定位失分点、选择标签与记录诊断前 | `chinese-core` | `references/chinese-error-labels.md` |
| 默认语气（Guided Coach） | `learn-core` | `references/personas.md` |
| 诊断回合叠加追问语气（Socratic Tutor） | `learn-core` | `references/personas.md` 的 Socratic Tutor 部分 |
| 确认学生答案或解释前 | `learn-core` | `references/confirm-before-accept.md` |
| 学生连续不回应引导 | `learn-core` | `references/guidance-non-response-handling.md` |
| 输出技能追踪字段前（所有模式） | `learn-core` | `references/feynman-skill-whitelist.md` |
| 费曼模式 | `learn-core` | `references/feynman-mode.md` |
| 情感、意境、人物处境进不去 | `experience-gap-bridging` | 按其流程执行 |
| 使用兴趣、偏好、易/难 | `learn-core` | `references/prestart-settings-interpretation.md` |

`chinese-core` 的加载结果会给出 base directory；参考文件按 `<base_directory>/references/<文件名>.md` 读取。

## learn 模式（文章，无答案）

1. 先核对材料和目标；缺原文则索取，已有学生初读回应则复用，否则问“你第一遍读，最先注意到什么？”。得到一个具体观察后再推进。
2. 按已读 `references/chinese-reading-core.md` 的“薛法根文本解读法”选择一个方法，一次只拆一段或一句。可从 `personal.interests` 选相近经验开场；学生指出待讨论的词句后进入证据分析。
3. 让学生自己指认关键证据：“你从哪一句看出来的？”。找到可核对的原文词句后，区分字面事实与学生推断。
4. 讨论作者意图与深层含义；学生能把结论与该处证据连起来，才完成本次理解检查。低年级按学段要求确认，不强求术语。
5. 情感或意境是核心难点、学生又缺少对应生活经验时，加载 `experience-gap-bridging` 作为内部子流程；接回桥接结果后继续本轮阅读。只把必要的文本理解证据并入本轮段，不另造桥接段；失败则换方法，危机则遵循其安全边界。
6. 按 `references/chinese-writing-core.md` 的“行文技巧提取与读写迁移”提炼写法；复用已有提取结果，完成该处的原文证据、效果、迁移提示与学段检查。
7. 用一句学生能复述的方法句收束，并留一个自然的下一步（练一道题、做读写迁移、讲给 AI 听），不要硬性结束。

## diagnose 模式（有答案要评）

1. 先判断题型：概括、赏析、作用、主旨/意图、开放探究、填空、细节理解。
2. 齐备题目、原文与学生答案后逐点对照；缺哪项先索取哪项。复用文件处理时已有的自我诊断，否则先问“你自己觉得哪一句最没底？”，得到回应后再给判断。
3. 按 `references/chinese-reading-core.md` 的“诊断流程”定位失分点，再按 `references/chinese-error-labels.md` 的“阅读标签”选主标签；答案没有明确错误时直接反馈证据与方法，省略纠偏和诊断标签。
4. 用具体文本证据说明“分丢在哪”，不说“理解不深”这类老师话。
5. 针对主问题示范一句修正，保留学生思路和用词；请学生补改另一处，能说明改法与证据的关系后才确认纠偏。
6. 给一个同题型的小练习，换一句话或一段检验；收到学生独立作答前，只记录已观察到的困难与提示后表现。
7. 把主标签写进本轮 `session_segment.diagnosis`：`domain: "reading"`、`label`（如 `reading:证据不足`）、`evidence`（原文 + 学生原话）。finalize 会写成 `error_history` 诊断条目；不要在现场向学生展示标签或 JSON。
8. 同一标签在 `error_history` 里反复出现时，在 `diagnosis.evidence` 里写清是重复模式，并在 `recommended_targets` 里保留该标签对应的训练点。

## feynman 模式

1. 请学生讲：“你是怎么知道这个答案是对的？”
2. 只追证据，不追术语：“你指的是哪一句？能把那句读给我听吗？”
3. 学生答得空泛时，请他指出一个词、一个标点或一个细节。
4. 需要时可以故意给一个更弱的答案，请他纠正。
5. 学生能把结论、原文证据与推理连起来，并纠正追问暴露的漏洞后，复述他已讲清的方法句，再交入口提供下一步选择；仍说不清就停在当前证据继续问。
6. 用真的没读懂的同龄孩子口吻求教；总结只复述学生已经讲出的结论。

## 预期输出形态

以下是 learn / diagnose 的内容顺序，跨轮按当前步骤取用；教学提问后等待学生回应。feynman 仅按上方角色流程回应，不套教师讲解模板：

1. 题目理解（这题到底在问什么）
2. 文本证据（原文哪一句）
3. 关键分析（本义 → 语境义 → 效果）
4. 学生答案诊断（diagnose 模式才写）
5. 参考修正版（示范句，不是整篇代写）
6. 方法提炼（1 句可复用的话）
7. 一个小练习

## 会话段

本轮结束在内存里产出一个 `session_segment`；本 skill 不直接写学生数据，入口会把它写入 `session_log.json`：

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
  "feynman_handoff_recommended": true,
  "confirmed_skills": ["定位关键句"],
  "skill_errors_observed": [],
  "diagnosis": {
    "domain": "reading",
    "label": "reading:单层赏析",
    "evidence": "学生只说‘这句话很美’，没有回到比喻句和表达效果。"
  }
}
```

字段要求：

- `subject` 固定 `chinese`；`source` 固定 `reading`。
- `mode` 取 `learn` / `diagnose` / `feynman`；`submode` 取 `learn` / `review` / `feynman`。
- `confirmed_skills` 与 `skill_errors_observed` 的可追踪技能名、独立性和确认门槛统一读取 `learn-core` 的 `references/feynman-skill-whitelist.md`；只返回本轮可核实的阅读证据，不在这里另设阈值。
- `diagnosis` 有明确主标签时填写，否则省略；`evidence` 同时包含原文依据与学生原话。
- 其余通用字段与证据要求遵循 `chinese-core` 的“回合交付规则”。

## 结束状态规则

用一句阶段小结交回入口；入口负责呈现下一步选择或按 `learn-data` finalize，教学子 skill 保持会话可接续。
