---
name: english-session
description: 英语教学主线。学习入口路由到英语、恢复未完成的英语焦点，或故事、对话、任务、词汇复习与新闻阅读回合使用；支持 learn 与 feynman 模式。
user-invocable: false
---

# 英语教学

## 开始与输入

加载 `english-core`，按其“开始与输入”执行，并按其条件表读 reference。入口已检查会话、学生与快照；本 skill 不重复检查或重读。

- `mode: feynman` 时先按 `learn-core` 的费曼规则由 AI 扮演同龄听众，本轮让学生主讲，不新开新闻检索或新的写作任务。
- `target_context` 已由入口按 `english-target` 归类；本 skill 不重新解析材料类别，只选本轮动作。

## 学习推荐闸门

学生不知道学什么、问“学什么”、想换内容但未给具体目标，或阶段选择「换个内容」时，在教学、费曼或方法恢复前加载 `learn-recommend`。交入口已有快照、当前焦点与最新真实表现，由它读取 `english-core` 契约的「学习推荐」角色；停在推荐选择，不调用 coach 或其他方法开展教学/诊断、不产 `session_segment`、不修改 `context.focus` 或长期档案、不清画板。已明确新目标则交共享生命周期处理，不再要求推荐选择。

推荐理由统一中文，推荐卡片与流程标签可中文；选定后恢复英语教学。候选内容与排序由角色文件决定，可重排普通恢复候选；选定后的方法调度仍只按本 session 与 `english-teaching-core.md` 唯一方法表执行。

## 附加选项

普通学习目标闭环时，回传 `stage_options`，由入口按 `learn-data` 的 `references/next-step.md` 展示：

- `label: 读一个故事`、`action: reading_material`、`description: 用一段短故事再理解一次`
- `label: 说一说`、`action: speaking_practice`、`description: 用刚学的表达回答一个真问题`
- `label: 玩一个任务`、`action: task_activity`、`description: 为一个具体结果使用英语`
- `label: 复习旧表达`、`action: review`、`description: 在新的小情境里回想旧词或旧句型`

学生选择或直接说出同义请求时执行对应动作，不再问是否继续。阶段选项不改变难度门槛，也不把四种方法同时展开。

## 1. 定焦点与分支

1. 优先 `target_context.topic`，否则用生命周期恢复的 `focus` 与动作；仍无目标时按生命周期 Resolve Target 的档案候选顺序，默认领域取 `english-core` 的 `references/english-grade-defaults.md`。
2. 文件目标：从 `material_refs` 指向的 extracted 内容选本轮焦点；已有学生答案时先核对答案，再决定理解、表达或修改。
3. 宽泛目标先选一个具体焦点：一个故事、一个场景、一个句型、一组词或一个任务，不一次覆盖整单元。
4. 定 `submode`：新主题 `learn`，近邻练习 `practice`，旧表达回想 `review`，费曼 `feynman`。
5. `mode: feynman` 优先；本轮只让学生讲，追问点按其实际表达选一个。
6. 按 `english-core` 的 `references/english-teaching-core.md` 唯一方法表，根据 `target_context.type` 与当前观察选择并加载主方法（新闻即 `child-news-reader`）。本 skill 是唯一调度者；coach 的跨轮计划与辅助建议也由本 skill 取舍，不自动展开整套方法。选定后按 `english-core` 的 `references/english-turn-arc.md` 排 2–4 个角度，本轮只执行第一个。
7. 待答步骤优先；每轮只保留一个主要待答问题，不因活动切换再追加一组问题。

完成条件：一个焦点、明确模式、一个主方法和一个下一动作；待答问题仍在时接着它。

## 2. 推进一个动作

按 `english-core` 的 `references/english-teaching-core.md` 执行：

- 先按共享确认协议核对完整消息，再判断有无回答。学生用中文、单词、半句或手势回应都按参与处理。
- 给一段可理解的材料，问回合串的第一个问题，停在问题并等待；问题后不附“你可以说……”“先跟我读……”或完整答案。学生回答后留在同一材料，按 `english-core` 的 `references/english-turn-arc.md` 换下一个角度。
- 有回答时按教学核心的反馈规则承接意思；记录证据按 segment 字段约定，不在本 skill 另设标准。
- 无响应按共享协议保留待答问题或降低表达负担；不把空消息当失败，不在同轮追加提示。
- 生成或调整材料前读 `english-core` 的 `references/english-input-adaptation.md`；学生明确求助或卡住时读其 `references/english-scaffolding.md`，不必额外加载方法才能给提示。
- 阅读题、作业或写的句子：只核对当前一处，指出一个最值得改的点；不给分数或等级。
- 新闻：按 `child-news-reader` 执行；没有可靠来源时明确说无法核实，不编造。
- 写作：以短句和仿写为主，保留学生自己的意思；只改一处最影响可读性的地方，不替学生重写整段。
- 新的 `session_id` 不沿用上一场的故事、单词表或未答问题；档案里的下一步只用来选新的英语目标。

等待时交入口同步 `context.turn_state`：共享的当前题、已收到回答、待答问题，加上 `active_method`（当前主方法）、`method_step`、回合串已覆盖的角度、已用提示和必要活动计划；新闻另存已呈现文章、来源引用和阅读步骤。辅助方法提供局部支持，不覆盖原活动计划和主步骤；提示次数按同一卡点累计，不因换方法重置。完整文章已呈现后只接当前问题，不重复检索或重新分级；多问题计划逐轮推进，未答内容不算表现。无持久 extracted 引用的文本存 `context.materials`，已有引用则复用，不复制原始学生数据。

同一日志恢复时先处理 lifecycle 的显式结束、模式或主题请求，再接 active_method 与步骤；旧日志缺标记时按已有材料和待答问题恢复，缺关键信息只问一处。方法收束后清除活动标记，新 session 不继承旧待答状态。

完成条件：提出一个可回答的英语问题，或处理当前回答后给一个动作；依赖新回应的步骤等待，只凭证据确认理解或水平。

## 3. 收束与回传

已有理解或表达证据时，用一句学生能复述的话总结，给一个小的下一步；待答时保留当前问题。单个角度答对时继续下一个角度，只有回合串的角度走完，或学生明确要走时才收束并给下一步选项。结束、保存或换主题交共享生命周期。

读 `english-core` 的 `references/english-segment-fields.md`，回传唯一 `session_segment`：`subject: english`，`mode` 沿用调用方，`submode` 如上，`source` 对齐 `target_context.source`。方法 skill 的证据并入同一记录，不另记一轮。`diagnosis` 只用一个主标签；`current_levels` 只在有足够证据时给部分更新。

完成条件：必填字段齐全，理解、表达、校正或困难有证据；没有证据的可选字段省略。
