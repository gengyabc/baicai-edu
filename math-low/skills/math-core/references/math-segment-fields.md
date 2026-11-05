# 数学 Segment 字段约定

产出数学学习记录或合并内部子流程证据前，先读 `learn-data` 的 Session Segments 与其 `references/profile-schema.md` 的 Session Segment。完整结构、必填字段、枚举和写回映射归共享 schema；本文只定义数学增量语义。路径相对于各 skill 的 base directory。

## 一轮一条记录

直接由入口调用的数学教学分支回传一个 `session_segment`；作为 `math-session` 的子流程时回传本轮证据，由外层合并为一个 segment。`math-diagnose` 始终只回传诊断结论。日志由调用方追加，档案与 finalize 由共享流程写入。

`focus` 记录本轮实际焦点；等待学生下一次回答时只记已观察到的证据，后续演示、判断和掌握状态留待后续回合。出题本身不构成学生表现证据。

## 字段语义

| 字段 | 数学约定 |
|---|---|
| `subject` / `mode` / `submode` / `source` | `subject: math`，`mode` 沿用调用方；教学分支按 `math-session` 选 `submode` / `source`，练习与学生出题分支按各自约定 |
| `strategy_summary` | 当前题的数量关系/未知量、学生实际动作或所用已知关系；说明工具在推理中的作用，区分独立方法、解释教师示例与提示后完成，不只写答案或“用了画板” |
| `strengths` / `difficulties` | 数量、单位、表示、计算、验证与支架响应的实际证据；表达短、画得不整齐、未作答或方法不够快不单独记为数学困难 |
| `next_step_candidate` / `recommended_targets` | 一个保守、具体的小步骤与近邻目标 |
| `feynman_handoff_recommended` | 是否适合转费曼讲解，依据实际表现填写 |
| `confirmed_skills` / `skill_errors_observed` | 记录前读 `learn-core` 的 `references/feynman-skill-whitelist.md`，所有模式均按其门槛填写技能名；无证据为空数组。AI 故意犯错不算学生错误，按该协议记录学生真实错误 |
| `overall_performance_code` / `overall_performance_text`（可选） | `needs_support` 需支架，`basic_independent` 基本独立但个别步骤需提示，`stable` 稳定运用策略，`flexible` 灵活迁移/比较关系；文字写清本轮证据，速度或单题答对不足以定档 |
| `current_levels`（可选） | 有足够策略证据时给 `arithmetic_strategy_stage` / `fraction_strategy_stage` 部分更新；阶段解释归 `learn-core` 的 `references/progression-map.md`，诊断证据归本 skill 的 `references/strategy-diagnosis-rules.md` |
| `diagnosis`（可选） | 数学领域 `domain`、一个具体错误 `label` 与关键步骤 `evidence`；分类归同一诊断 reference，整题原文留在原件或分析文件 |

阶段、诊断与技能确认分别按各自证据门槛决定；未观察的可选字段省略，保留已有档案值。同一表现只按其任务范围解释，能用加法求一类差不推定所有减法已掌握，等分阶段也不概括全部分数或小数理解。已有 schema 足够时用自然语言保留差异，不新增阶段或全局等级。
