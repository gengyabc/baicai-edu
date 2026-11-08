---
name: math-session
description: 数学教学主线。学习入口路由到数学、恢复未完成的数学焦点，或诊断/练习/学生出题后返回教学时使用；支持 learn 与 feynman 模式。
user-invocable: false
---

# 数学教学

## 开始与输入

加载 `math-core`，按其“开始与输入”执行，并按其条件表读 reference。费曼模式保持学生听众角色；其余使用 Guided Coach 或档案人格。

## 集中调度契约

数学统一由 lifecycle → `math-session` 进入；本 skill 是 `math-diagnose`、`math-practice`、`math-student-problem` 的唯一调度者。三个 leaf 只执行各自 playbook、回传证据与建议，不加载彼此或重新加载本 skill。skill 加载只是指令载入；下述信号是内部逻辑约定，不是运行时函数返回或权限隔离，不向学生展示。

### 入口事件

进入新题、新活动或新主题前，先执行 `math-core` 的 `references/board-task-boundary.md`（唯一边界规则），无画板附件也适用。入口跳题、教师主动下一题、leaf 内下一题均覆盖；换主题由 lifecycle 先 finalize 旧主题，成功后本入口在开展新主题前处理边界。leaf 调度、恢复与费曼切换本身不代表新任务。

- 阶段选项「练一练」由本 skill 加载 `math-practice`。
- 阶段选项「迁移」、`context.activity: transfer` 或学生主动出题，由本 skill 加载 `math-student-problem`。
- `mode: feynman` 优先于迁移恢复与上述阶段动作；按共享费曼规则接回学生主讲，不自动进入出题流程。

### Leaf 回传信号

| 信号 | 来源 | 本 skill 的动作 |
|---|---|---|
| `await_student` | 任一 leaf 已提出问题或流程菜单 | 保留当前 leaf 和待答步骤，本轮停止；下条回应续接该 leaf |
| `continue_diagnose` | practice / student-problem 需澄清错因 | 评估现有证据后加载 `math-diagnose` |
| `continue_practice` | diagnose 需巩固，或 student-problem 需正误对照 | 评估现有证据后加载 `math-practice` |
| `continue_student_problem` | student-problem 菜单选择继续出题 | 继续该 leaf 的下一题 |
| `return_teaching` | 任一 leaf 收束或选择回原学习 | 接回原焦点的主线教学 |
| `request_end` | 任一 leaf 收到明确结束选择 | 接回 lifecycle 的结束判断与 finalize，不自行保存 |

回传含一个信号、已观察证据及具体建议；等待时同时含当前题、步骤和待答问题。尚待新回应的问题只接受 `await_student`，不以收束信号覆盖等待；已收到学生明确求助或卡住的回应时可据此关闭旧追问、建议诊断，不要求先答对。显式结束、换主题或切模式按 lifecycle 优先处理。

每轮最多发起两次 leaf 调度。只有现有证据足以推进、且没有待答问题时，才执行一次后续调度（如诊断→练习或出题→诊断）；第二次提问立即停止，同轮不反向跳回或开始第三次调度。上限计逻辑调度，已加载的 skill 内容直接复用，不重复调用加载工具。需要新回应的判断留到下一轮，不能预演学生答案。第二次仍建议其他分支时，将建议保留为下一步，本轮不继续调度。

等待状态由本 skill 交 lifecycle 写入 `context.turn_state`：沿用共享当前题/回答/待答问题字段，补充 `active_leaf`、`leaf_step` 与必要的已呈现解释、支持情况；迁移保留来源与阶段。恢复时先处理 lifecycle 的显式请求，再续接 active_leaf；旧日志缺少它时按已有题目和步骤恢复，不重开题。收束后清除 leaf 标记，迁移完成时由 lifecycle 将 activity 恢复为 teaching。

完成条件：一个已执行动作或一个待答问题，所有 leaf 证据交本 skill 合并；控制信号不进入学生回复或 segment 字段。

## 附加选项与迁移恢复

普通学习的阶段出口回传 `stage_options`：

- `label: 迁移`、`action: transfer`：路由 `math-student-problem`，邀请学生出题并检查 AI 的回答；“出题考我”是同义请求。
- `label: 练一练`、`action: practice`：路由 `math-practice`，围绕当前关系做近邻练习。

选择迁移时交入口记录迁移状态；恢复为 `context.activity: transfer` 时仍路由 `math-student-problem`，从已记录步骤接续。`mode: feynman` 优先，保持本主线的费曼教学。阶段菜单不改变练习与诊断的触发条件。

## 1. 定焦点与分支

1. 优先 `target_context.topic`，否则用生命周期恢复的 focus 与动作；仍无目标时按生命周期 Resolve Target 的档案候选顺序，默认领域取 `math-core` 的 `references/math-grade-defaults.md`。
2. 文件目标：从 `material_refs` 指向的 extracted 分析，按最近发生 → 当前领域 → 学生自述难点选焦点。
3. 宽泛目标先选一题；起点确需补证、连续两轮引导卡住或自述与表现不符时交 `math-diagnose`，不默认先测所有新主题。
4. 定 `submode`：新主题 `learn`，巩固/近邻变式 `practice`，纠错 `review`，费曼 `feynman`。
5. 分层巩固调用 `math-practice`；学生要出题考 AI 或已选出题迁移时调用 `math-student-problem`。子流程按集中调度契约等待或回传，收束后接原焦点并合并其证据。

完成条件：一个焦点、明确模式与下一动作；子流程已有动作则沿用。

## 2. 推进一个动作

按 `math-core` 的 `references/math-teaching-core.md` 执行：

- 先按共享确认协议核对完整消息，再判断有无回答。
- 当前这条未保存日志里，无回答时把原题再给一次，停在问句并等待；有回答则承接本场已有表示，只补证据缺口。
- 新的 `session_id` 不沿用上一场的题面、未答问题或画板修改。档案里的下一步和近期错误只用来选定数量关系，再按 `math-core` 的 `references/problem-design.md` 出新题。
- 选题先辨数量角色与未知量；准备介入时读支架校准。
- 当前关系已能在一个生活故事里解释时，下一题换场景、保持近邻数字；本场未完成的题不换场景。题量按证据，不固定加题。

完成条件：提出一个待答问题，或处理当前回答后给下一动作；依赖新回应的步骤等待，只凭证据确认理解或掌握。

## 3. 收束与回传

已有关系证据时用一句学生能复述的话总结，给一个小下一步；待答时保留当前问题。结束或换主题交生命周期。

读 `math-core` 的 `references/math-segment-fields.md`，回传唯一 `session_segment`：`subject: math`，`mode` 沿用调用方，`submode` 按该 reference 的多分支合并规则确定，`source` 对齐 `target_context.source`（文件来源按共享 target 协议归一化），子流程证据合并进同一记录。

完成条件：必填字段齐全，策略、确认、困难及可选阶段/诊断有证据。
