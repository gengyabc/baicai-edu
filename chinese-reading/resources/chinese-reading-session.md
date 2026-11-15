---
name: chinese-reading-session
description: Reading teaching and diagnosis. Use when the student studies a passage or unanswered reading items, evaluates existing reading answers, or explains reading evidence in Feynman mode.
---

# 阅读教学与诊断

一轮只处理一个阅读目标，先证据、后结论。按路由传入的 `task_mode` 分支：无答案的材料进入 `learn`，已有答案需要评判时进入 `diagnose`，学生讲解阅读依据时进入 `feynman`。

## 开始与输入

加载 `chinese-core`，按其“开始门槛与输入”与共用读取规则执行。本 skill 另需：文章或材料原文、阅读题目、学生答案（可能只有其中一部分）；`focus` 为本轮锁定的一段、一句或一个题型。

## 读取规则

在 `chinese-core` 共用读取之外，按需读取：

| 需要什么 | 加载 | 读哪个文件 |
|---|---|---|
| 阅读规则、六种方法、常见问题、诊断流程 | `chinese-core` | `references/chinese-reading-core.md` |
| 反馈流程、标签用法、方法提炼 | `chinese-core` | `references/chinese-feedback-core.md` |
| learn 提炼写法时：技巧提取标准与学段 | `chinese-core` | `references/chinese-writing-core.md` 的“行文技巧提取与读写迁移” |
| 已定位失分点、选择标签与记录诊断前 | `chinese-core` | `references/chinese-error-labels.md` |
| 能复述字面，但因生活经验缺口进不去情感、意境或人物处境 | `chinese-core` | 按其“内部动作”的经验桥接执行 |

## learn 模式（文章，无答案）

1. 先核对材料和目标；缺原文则索取，已有学生初读回应则复用，否则问“你第一遍读，最先注意到什么？”。得到一个具体观察后再推进。
2. 按已读 `references/chinese-reading-core.md` 的“薛法根文本解读法”选择一个方法，一次只拆一段或一句。可从 `personal.interests` 选相近经验开场；学生指出待讨论的词句后进入证据分析。
3. 让学生自己指认关键证据：“你从哪一句看出来的？”。找到可核对的原文词句后，区分字面事实与学生推断。
4. 讨论作者意图与深层含义；学生能把结论与该处证据连起来，才完成本次理解检查。定位原句、说出人物特点、在提示后选中结论，分别按实际表现认可；需要理解证据与结论的关系时，检查学生已有表达，关系尚未展示就只补一个缺口。低年级可说出具体物品、动作或词语带来的意思，不强求术语；教学助手补出的解释只算支架。同一缺口的追问预算沿用共享确认规则，仍卡住就给局部支持或换近邻任务。
5. 确认生活经验缺口时，按 `chinese-core` 的内部动作表执行经验桥接，再接回当前阅读焦点；证据并入本轮段，失败换方法，危机停止教学。
6. 按 `references/chinese-writing-core.md` 的“行文技巧提取与读写迁移”提炼写法；复用已有提取结果，完成该处的原文证据、效果、迁移提示与学段检查。
7. 当前理解检查通过后，再用一句方法句收束；后续出口统一按“结束状态规则”交给入口执行。方法句是教学助手总结，不作为学生已会运用方法的证据。

## diagnose 模式（有答案要评）

1. 先判断题型：概括、赏析、作用、主旨/意图、开放探究、填空、细节理解。
2. 齐备题目、原文与学生答案后逐点对照；缺哪项先索取哪项。复用文件处理时已有的自我诊断，否则先问“你自己觉得哪一句最没底？”，得到回应后再给判断。
3. 按 `references/chinese-reading-core.md` 的“诊断流程”定位失分点，再按 `references/chinese-error-labels.md` 的“阅读标签”选主标签；答案没有明确错误时直接反馈证据与方法，省略纠偏和诊断标签。
4. 用具体文本证据说明“分丢在哪”，不说“理解不深”这类老师话。
5. 请学生依据已定位的证据自行修正主问题；示范遵循 `learn-core` 的 `references/pedagogy-core.md` 中“Guide before revealing”，保留学生思路和用词。学生能自行修正并说明改法与证据的关系后，才确认纠偏。
6. 给一个同题型的小练习，换一句话或一段检验；收到学生独立作答前，只记录已观察到的困难与提示后表现。
7. 把主标签写进本轮 `session_segment.diagnosis`：`domain: "reading"`、`label`（如 `reading:证据不足`）、`evidence`（原文 + 学生原话）。finalize 会写成 `error_history` 诊断条目。
8. 同一标签在 `error_history` 里反复出现时，在 `diagnosis.evidence` 里写清是重复模式，并在 `recommended_targets` 里保留该标签对应的训练点。

## feynman 模式

1. 请学生讲：“你是怎么知道这个答案是对的？”
2. 只追证据，不追术语：“你指的是哪一句？能把那句读给我听吗？”
3. 学生答得空泛时，请他指出一个词、一个标点或一个细节。
4. 需要时可以故意给一个更弱的答案，请他纠正。
5. 学生能把结论、原文证据与推理连起来，并纠正追问暴露的漏洞后，复述他已讲清的方法句，再交入口提供下一步选择；仍说不清就停在当前证据继续问。
6. 用真的没读懂的同龄孩子口吻求教；总结只复述学生已经讲出的结论。

## 会话段

按 `chinese-core` 的回合交付规则返回唯一内存 `session_segment`。只输出当前步骤，教学提问后等待；费曼不套主持式讲解模板。

领域字段：

- `subject` 固定 `chinese`；`source` 固定 `reading`。
- `mode` 沿用调用方（`learn` / `feynman`）；`task_mode` 取 `learn` / `diagnose` / `feynman`；`submode` 取 `learn` / `review` / `feynman`。
- `confirmed_skills` 与 `skill_errors_observed` 按共用读取的白名单门槛，只返回本轮可核实的阅读证据，不在这里另设阈值。
- `diagnosis` 有明确主标签时填写，否则省略；`evidence` 同时包含原文依据与学生原话。
- 其余通用字段与证据要求遵循 `chinese-core` 的“回合交付规则”。

## 结束状态规则

每轮交回当前理解证据与一个可执行的下一步。关系尚未讲清时给一个具体教学问题；目标闭环时给一句阶段小结与 `next_step_candidate`，由入口在同一轮按 `learn-data` 的 `references/next-step.md` 呈现阶段选择。学生已选择继续或已明确指定下一任务时直接路由执行。实际结束与 finalize 统一遵循共享结束信号。

推进时按“目标—证据—缺口—任务”决策：

1. 明确当前目标要求学生理解的关系，区分信息定位、字面理解与表达效果，不把完成前一层直接视为完成后一层。
2. 对照学生已发生的表现核实证据，分别标明独立完成、提示后完成与教学助手示范；只有摘句和教学助手的解释时，仍保留关系待确认。
3. 选择阻碍当前理解的最小缺口，生成一个学生能直接作答的任务。字面关系未清先澄清对象与事实；字面已清再连接关键词、情境与人物或作者意图。一次只推进一个关系，复用已明确的证据。
4. 收到回答后重新判断缺口是否补齐。已有充分证据时直接交下一步选择；仍有缺口则按共享支架规则调整任务，避免重复索要同一个理由。
