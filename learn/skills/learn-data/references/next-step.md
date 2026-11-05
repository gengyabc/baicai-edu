# Next Step

普通学习一轮结束、尚未触发结束信号时，选一个足够小的下一步。输入是最新 segment、subject、focus、学生本轮表现，以及 memory 中的 recommended_next_moves、motivation_signals、feynman_readiness（分别位于 learning_memory / profile_memory 的对应字段，以 profile-schema 为准）。

## Choose

1. 从本轮成功点和未解决点中选一个目标；类型可为稳定、变式、连接或轻微抽象。
2. 生成一个 `next_step` 和 1-3 个 `recommended_targets`，优先参考 memory，不覆盖学生显式目标。
3. 用 `ask_user_question` 给出下一步：低年级选项为「继续」「结束」；高年级最多三个，可用「当小老师」或「换个迁移任务」替换「继续」，避免一次抛出四个分支。标签与 Apply Choice 的分支一一对应；学生自己输入时按语义映射。
4. `feynman_readiness = not_ready` 时不主动推荐当小老师；学生主动要求仍可切换并降低难度。
5. 学生说“随便”“都行”或跳过选项时选最合适的一步，不反复追问。

## Apply Choice

- 继续：一个同类问题或小变式。
- 当小老师：切换到 `feynman`；写 `pending_feynman_handoff: true` 与 `pending_feynman_focus`，真正接上后清空这一对字段。
- 迁移：数学为 `math-student-problem`；语文阅读为 `chinese-session` 的 `intent: transfer_read_write`；写作为局部改写或换角度再写一段，不超过 2 轮。写 `pending_transfer_phase: true` 与 `pending_transfer_focus`，完成后清空这一对字段。
- 结束：按共享生命周期进入 finalize，不另写 pending patch。

教学动作由共享生命周期路由，不在此执行第二次调用或记录。只推荐一个主要下一步；结束判断依据具体目标与学生意愿，不用“已经学了很多”替代证据。
