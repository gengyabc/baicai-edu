---
name: math-session
description: 数学教学主线。学习入口路由到数学、恢复未完成的数学焦点，或诊断/练习/学生出题后返回教学时使用；支持 learn 与 feynman 模式。
user-invocable: false
---

# 数学教学

按 CGI（Cognitively Guided Instruction）教学，规则来源是 `math-core`。

## 开始与输入

加载 `math-core`，按其“开始与输入”执行，并按其条件表读 reference。

## 学习推荐闸门

进入教学、恢复 leaf 或处理新题画板边界前，先识别学生不知道学什么、问“学什么”、想换内容但未给具体目标，或阶段选择「换个内容」：加载 `learn-recommend`，交入口已有快照、当前焦点与本轮最新真实表现；由它读取 `math-core` 契约的「学习推荐」角色。此分支停在推荐选择，不产 `session_segment`、不调用诊断/练习/出题或教学、不修改 `context.focus` 或长期档案，也不执行画板任务边界或清空。已明确新目标则交共享生命周期处理，不再要求推荐选择。

学生选定后再按共享流程交接目标并进入本主线；推荐卡片不算新任务，只有实际开始选定任务时才处理画板边界。候选与排序由角色文件决定，不沿用普通恢复的固定候选顺序。

## 集中调度契约

数学统一由 lifecycle → `math-session` 进入；本 skill 是 `math-diagnose`、`math-practice`、`math-student-problem` 的唯一调度者。三个 leaf 只执行各自 playbook、回传证据与建议，不加载彼此或重新加载本 skill。skill 加载只是指令载入；下述信号是内部逻辑约定，不是运行时函数返回或权限隔离，不向学生展示。

### 入口事件

进入新题、新活动或新主题前，先执行 `math-core` 的 `references/board-task-boundary.md`（唯一边界规则），无画板附件也适用。入口跳题、教学助手主动下一题、leaf 内下一题均覆盖；换主题由 lifecycle 先 finalize 旧主题，成功后本入口在开展新主题前处理边界。leaf 调度、恢复与费曼切换本身不代表新任务。

### 分支触发

进入 leaf 只看下表；阶段菜单不改变其余各行的触发条件。

| 触发 | 本 skill 的动作 |
|---|---|
| `mode: feynman` | 优先于迁移恢复与下列各行；按共享费曼规则接回学生主讲，不自动进入出题流程 |
| 恢复为 `context.activity: transfer` | 加载 `math-student-problem`，从已记录步骤接续 |
| 阶段选项「迁移」或学生主动出题考 AI | 交入口记录迁移状态，加载 `math-student-problem` |
| 阶段选项「练一练」、学生要求多练，或需用同类题确认错误模式、稳定独立计算、连接已掌握知识 | 加载 `math-practice` |
| 起点确需补证、连续两轮引导卡住、学生提交错题，或自述与表现不符 | 加载 `math-diagnose`；不默认先测所有新主题 |
| leaf 回传信号 | 按下表 |

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

### 同轮调度上限

每轮最多发起两次 leaf 调度。进入或续接任一 leaf 各计一次，与是否重新调用加载工具无关；已加载的 skill 内容直接复用。每次 leaf 回传后按顺序检查：

1. 信号为 `await_student`：本轮停止，不再调度。
2. 本轮已调度两次：不再调度；回传仍建议其他分支时，把建议保留为下一步，同轮不反向跳回或开始第三次调度。
3. 信号为 `continue_*`：只有现有证据足以推进、且没有待答问题时，才执行这一次后续调度（如诊断→练习或出题→诊断）。
4. 其余信号按回传信号表处理。

需要学生新回应的判断留到下一轮，不能预演学生答案。

### 等待与恢复

- 写入：等待时由本 skill 交 lifecycle 写入 `context.turn_state`，沿用共享当前题/回答/待答问题字段，补充 `active_leaf`、`leaf_step`，以及必要的已呈现解释和支持情况；迁移另保留来源与阶段。
- 恢复：先处理 lifecycle 的显式请求（结束、换主题、切模式），再续接 `active_leaf` 的 `leaf_step`；旧日志缺少 `active_leaf` 时按已有题目和步骤恢复，不重开题。
- 清除：leaf 收束后清除 `active_leaf` 与 `leaf_step`；迁移完成时由 lifecycle 将 activity 恢复为 teaching。

控制信号不进入学生回复或 segment 字段；所有 leaf 证据交本 skill 合并。

## 阶段选项

普通学习的阶段出口回传 `stage_options`，选择后按分支触发表执行：

- `label: 迁移`、`action: transfer`：邀请学生出题并检查 AI 的回答，交 `math-student-problem`；“出题考我”是同义请求。
- `label: 练一练`、`action: practice`：围绕当前关系做近邻练习，交 `math-practice`。

## 1. 定焦点与分支

1. 优先 `target_context.topic`，否则用生命周期恢复的 focus 与动作；仍无目标时按生命周期 Resolve Target 的档案候选顺序，默认领域取 `math-core` 的 `references/math-grade-defaults.md`。
2. 文件目标：从 `material_refs` 指向的 extracted 分析，按最近发生 → 当前领域 → 学生自述难点选焦点。
3. 宽泛目标先选一题。
4. 定 `submode` 初值：新主题 `learn`，巩固/近邻变式 `practice`，纠错 `review`，费曼 `feynman`；leaf 介入后的最终值按第 3 节的合并规则。
5. 是否进入 leaf 只看分支触发表；子流程收束后接回原焦点。

完成条件：一个焦点、明确模式与下一动作；子流程已有动作则沿用。

## 2. 推进一个动作

按 `math-core` 的 `references/math-teaching-core.md` 执行。判断有无回答前，先按共享确认协议核对完整消息；题量按证据，不固定加题。

完成条件：提出一个待答问题，或处理当前回答后给下一动作；只凭证据确认理解或掌握。

## 3. 收束与回传

已有关系证据时用一句学生能复述的话总结，给一个小下一步；待答时保留当前问题。

读 `math-core` 的 `references/math-segment-fields.md`，回传唯一 `session_segment`：`subject: math`，`mode` 沿用调用方，`submode` 按该 reference 的多分支合并规则确定，`source` 对齐 `target_context.source`（文件来源按共享 target 协议归一化），子流程证据合并进同一记录。

完成条件：必填字段齐全，策略、确认、困难及可选阶段/诊断有证据。
