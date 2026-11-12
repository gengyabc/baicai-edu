# ADR-0003：统一调度的递归先修与耐久任务计划

- 状态：已接受
- 日期：2026-11-12
- 相关：[规格](<../../.scratch/math-strategy-recursion/spec.md>)、[共享保存协议](<../../learn/skills/learn-data/references/learning-plan.md>)、[数学教学规则](<../../math-primary-high/skills/math-high-core/references/prerequisite-learning.md>)。

确认缺少前置工具时，高年级数学先保留父题，进入工具学习子任务；子任务的先修仍缺失则递归，独立使用工具后只返回一层。递归是学习依赖，不是让 leaf 任意互调；同一 session 保持唯一教学负责人及原教学实现，子任务只用局部 frame 标识。此选择保留现有调度与证据归属约束，代价是必须显式维护父题快照、活动层和返回条件，不能再靠替换一个当前问题恢复嵌套任务。

任务链在未提交时以日志的 context.learning_plan 为准，通过原有四文件、marker-last 的 Finalize 保存到 current_state.learning_plan；它是唯一耐久恢复快照，不引入第五份学科文件或第二份 memory 计划集合。计划-only 保存保留原表现游标，不写能力、诊断或里程碑；与学生明确要求保存的支持计划分开授权。自动保存只接受已解析教学 owner 提供、根目标匹配且实际向学生展示的中性先修计划，不伪造 student_requested_save。完成或放弃保留终止标记，避免旧快照复活。

备选方案：仅用 turn_state 自由文字无法保证多层恢复；仅存 next_step 会丢原题与待答位置；额外计划文件会引入新的跨文件提交恢复路径；复用支持计划事件会混淆学生明确保存请求与教学任务恢复的授权。所选方案复用已有幂等重放，但自动 checkpoint 会结束旧日志；继续原任务需新日志承接耐久链，不能重复提交旧表现或把保存当成下一次教学动作。

数学依赖选择与教学支架保留在高年级 band；共享 learn 只提供可选、学科无关的保存恢复协议，没有计划的其他学科与低年级任务维持原流程。这延续 [ADR-0001](<0001-math-shared-contracts.md>) 的职责边界，不增加第三个数学教学实现或宿主运行时。静态守卫和合成回放的结论分别记录于[实施验收](<../../.scratch/math-strategy-recursion/acceptance.md>)，不能证明真实学生学习效果。
