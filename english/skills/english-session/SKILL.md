---
name: english-session
description: 英语教学主线。学习入口路由到英语、恢复未完成的英语焦点，或故事、对话、任务、词汇复习与新闻阅读回合使用；支持 learn 与 feynman 模式。
user-invocable: false
---

# 英语教学

## 开始与输入

加载 `english-core`，按其“开始与输入”执行，并按其条件表读 reference。入口已检查会话、学生与快照；本 skill 不重复检查或重读。

- `mode: feynman` 时先按 `learn-core` 的费曼规则保持学生听众角色，本轮让学生讲，不新开新闻检索或新的写作任务。
- `target_context` 已由入口按 `english-target` 归类；本 skill 不重新解析材料类别，只选本轮动作。
- 文件：`files_processed: true` 时读 `material_refs`；未处理文件交回入口，本 skill 不直接调用 `learn-errors`。

## 附加选项

普通学习目标闭环时，回传 `stage_options`，由入口按 `learn-data` 的 `references/next-step.md` 展示：

- `label: 读一个故事`、`action: reading_material`、`description: 用一段短故事再理解一次`
- `label: 说一说`、`action: speaking_practice`、`description: 用刚学的表达回答一个真问题`
- `label: 玩一个任务`、`action: task_activity`、`description: 为一个具体结果使用英语`
- `label: 复习旧表达`、`action: review`、`description: 在新的小情境里回想旧词或旧句型`

学生选择或直接说出同义请求时执行对应动作，不再问是否继续。阶段选项不改变难度门槛，也不把四种方法同时展开。

## 1. 定焦点与分支

1. 优先 `target_context.topic`，否则用生命周期恢复的 `focus` 与动作；仍无目标时按生命周期第 2 步的档案候选顺序，默认领域取 `english-core` 的 `references/english-grade-defaults.md`。
2. 文件目标：从 `material_refs` 指向的 extracted 内容选本轮焦点；已有学生答案时先核对答案，再决定理解、表达或修改。
3. 宽泛目标先选一个具体焦点：一个故事、一个场景、一个句型、一组词或一个任务，不一次覆盖整单元。
4. 定 `submode`：新主题 `learn`，近邻练习 `practice`，旧表达回想 `review`，费曼 `feynman`。
5. `mode: feynman` 优先；本轮只让学生讲，追问点按其实际表达选一个。
6. 按 `target_context.type` 与当前观察选一个主方法：
   - `news` → `child-news-reader`
   - `reading_material` → `comprehensible-input`
   - `speaking_practice` → `interaction-hypothesis` 或 `output-hypothesis`
   - `language_focus` → `usage-based-language-learning` 或 `spaced-retrieval`
   - `activity` → `task-based-language-learning`
   - `writing_task` → `output-hypothesis`，需要句型支持时补 `usage-based-language-learning`
   - `student_problem` → `output-hypothesis` 或 `usage-based-language-learning`，学生出题考 AI，AI 作答后由学生核对
   - `assessment` → 按答案类型选一个理解或表达方法，只核对并给一个可改点
   - `topic` / `profile` → 按年级默认领域选一个方法
   - 学生只想自由玩或一次要组合多种方法 → `child-english-coach`
7. 只在需要时再加载一个辅助方法；本轮仍只保留一个主要待答问题。

完成条件：一个焦点、明确模式、一个主方法和一个下一动作；待答问题仍在时接着它。

## 2. 推进一个动作

按 `english-core` 的 `references/english-teaching-core.md` 执行：

- 先按共享确认协议核对完整消息，再判断有无回答。学生用中文、单词、半句或手势回应都按参与处理。
- 给一段可理解的材料，只问一个真问题，停在问题并等待；问题后不附“你可以说……”“先跟我读……”或完整答案。
- 有回答时先回应意思，再选择性重述一个形式；不要求重复、不逐句纠错、不把答对一个词升级成掌握。
- 当前这条未保存日志里，未回答时把材料或问题缩短、换具体一点再给一次；仍无回应就停在问题，不连续盘问。
- 学生明确求助或卡住时，按 `scaffolding-zpd` 一次给一级提示；提示后退让，依新回应调整。
- 阅读题、作业或写的句子：只核对当前一处，指出一个最值得改的点；不给分数或等级。
- 新闻：按 `child-news-reader` 的来源核对、年龄筛选和改写规则执行；没有可靠来源时不编造内容，明确说无法核实。
- 写作：以短句和仿写为主，保留学生自己的意思；只改一处最影响可读性的地方，不替学生重写整段。
- 新的 `session_id` 不沿用上一场的故事、单词表或未答问题；档案里的下一步只用来选新的英语目标。

完成条件：提出一个可回答的英语问题，或处理当前回答后给一个动作；依赖新回应的步骤等待，只凭证据确认理解或水平。

## 3. 收束与回传

已有理解或表达证据时，用一句学生能复述的话总结，给一个小的下一步；待答时保留当前问题。结束、保存或换主题交共享生命周期。

读 `english-core` 的 `references/english-segment-fields.md`，回传唯一 `session_segment`：`subject: english`，`mode` 沿用调用方，`submode` 如上，`source` 对齐 `target_context.source`。方法 skill 的证据并入同一记录，不另记一轮。`diagnosis` 只用一个主标签；`current_levels` 只在有足够证据时给部分更新。

完成条件：必填字段齐全，理解、表达、校正或困难有证据；没有证据的可选字段省略。
