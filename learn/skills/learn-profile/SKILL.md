---
name: learn-profile
description: 查看学习进展、已保存计划或修改档案。学生询问当前重点、最近进步、里程碑，或要求更改称呼、教育阶段、兴趣、长期目标和学习偏好时使用。
---

# 学生档案

加载尚未加载的 `learn-core`、`learn-data`。先读取 `outputs/students/session.json` 与共享档案，确定学生及真实当前科目；缺少当前学生或共享档案时，引导 `/learn-start` 并停止。读 `learn-data` 的 `references/teaching-resolver.md`，采用其教学实现与范围结果：`<subject>-core` 是专门包命名约定，不代表当前阶段必然适配。随后只执行学生请求的查看或修改分支。

## 查看

1. 读取当前科目的 `profile.json`、`milestones.json`、`current_state.json`；请求计划/支持历史时再读取同一科目的 `memory.json`。
2. 用适合学习者的话简短回顾，仅展示有依据的内容：
   - 称呼、兴趣和真实科目/目标；年级、`education_stage`、`learning_context` 已提供才显示，不给成人套小学年级，不把未知显示成能力不足。
   - 当前重点：`current_state.active_focus`，其次 `session_history[0].focus`。
   - 最近最多 5 次会话的中性任务事实、日期及来源；有能力证据才说具体进步，独立完成、支持下表现与 AI 协作验证分别描述。参与或信心自述不等于掌握。
   - 最重要的已有里程碑，最多 3 条；通用来源记录不自动改称专门包掌握证据。
   - 明确设定的共享 `learning_preferences.goals` / `learning_preferences.support_preferences`，以及学生请求的下一步建议。
3. 支持记忆只读展示：`memory.json` 的 `learning_support_memory.plans` / `learning_support_memory.observations`。只说计划内容或具体情境下的中性观察、日期和来源；说明这是历史事实，不推断现在仍适用。旧无来源条目不作当前心理判断，不拼接心理轨迹；无记录就说明没有已保存记录，不把临时讨论说成已保存计划。

只显示当前科目；查看其他科目先问范围，不因共享目标偏好而混读其他科目困难。用普通语言摘要，不列原始 JSON、技能数组或内部标签。情绪、家庭、职业敏感细节不在进展展示中回放；家长/教师身份不自动授权查看私人讨论。

## 修改

1. 确认要改的字段和作用范围，尤其是称呼、年级/阶段，以及目标/偏好是当前科目还是明确跨科复用。流程选择用 `ask_user_question`；删除兴趣或旧经历一次确认即可，批量或完整删除走既有安全清理流程。
2. 检查当前科目日志；若有 `finalize_plan`，先按 `learn-data` 的 finalize 协议恢复保存，成功后再编辑。恢复失败不绕过待完成计划写档案。
3. 按 `learn-data` 的 Write Protocol 写入：
   - 称呼、可选 `grade` / `education_stage` / `learning_context`、`personal.interests` → 共享 `profile.json`。
   - 学生明确设定的跨科长期目标 → 共享 `learning_preferences.goals`；明确设定的跨科支持偏好 → 共享 `learning_preferences.support_preferences`。合并并保留未要求修改的项；更正或撤回后下次使用更新事实。系统推断、学习困难与敏感细节不共享。
   - 科目学习偏好、当前水平、易/难主题、优先目标 → 科目 `profile.json`。支持方法本身不直接写共享档案。
   - 修改年级/阶段时按 `references/grade-band-defaults.md` 同步已知小学 `grade_band`，不替非小学或未知强填。读 `references/teaching-resolver.md` 确定适配后的契约，再取 `active_domain` 与 `current_levels` 默认值（`references/subject-contract.md`）；是否重置水平不明确时先问，默认保留已有证据。未完成任务不因修改阶段热替换实现。
   - 新增兴趣保留其他兴趣；学生明确不再喜欢时才移除。学习情境影响表达/支持时按需读 `learn-support` 的 `references/learner-stage.md`。
4. `learning_support_memory` 的计划/观察只能由 finalize 写；本技能不直接修改 `memory.json`，不补写观察或把旧情绪改成标签。学生要求更正历史事实时停止引用失效事实，将更正/明确计划交回生命周期的唯一保存入口；删除请求按安全清理协议处理。
5. 所有请求字段写入成功且有效快照同步更新后，告诉学生“已经更新”。部分失败时说明尚未保存的字段；区分共享设置已更新、恢复状态已写入和长期计划已保存，不把未完成保存说成成功。
