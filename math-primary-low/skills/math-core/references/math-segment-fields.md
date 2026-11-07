# 数学 Segment 字段约定

产出数学学习记录或合并内部子流程证据前，先读 `learn-data` 的 Session Segments 与其 `references/session-schema.md` 的 Session Segment。完整结构、必填字段、枚举和写回映射归共享 schema；本文只定义数学增量语义。

## 一轮一条记录

仅 `math-session` 产出本轮唯一 `session_segment`；三个 leaf 只回传证据、控制信号与待答状态，供 session 合并。信号不作为 segment 字段。日志由 lifecycle 追加，档案与 finalize 由共享流程写入。

合并规则：

- `mode` 沿用调用方，费曼时 `submode: feynman`；普通学习按本轮学生实际作答的主任务选 submode：练习为 `practice`，学生出题/检查为 `student_problem`，诊断纠错为 `review`，其余为 `learn`。多分支时优先最后一个已有学生表现证据的任务；新提出的未答问题不覆盖前一任务，无作答证据时按当前任务记录但不推定表现。
- `source` 对齐 `target_context.source`，文件来源按共享 target 协议归一化；进入练习、诊断或学生出题不自动改写来源。leaf 的分支元信息用于理解证据，不覆盖该字段。
- `strategy_summary` 按实际发生顺序区分诊断、练习和出题中的证据，同一表现去重；示例后解释、提示后表现和独立完成分开。
- 结论冲突时保留任务范围、支持条件与未知，不能拼接成更强的掌握结论；`diagnosis` 仍只选一个证据最充分的主标签，`current_levels` 只给有充分证据且无未解冲突的部分更新。
- `next_step_candidate` 由 session 选一个具体下一步；待执行的建议、未回答的题或 AI 演示不计入学生表现。

`focus` 记录本轮实际焦点；等待学生下一次回答时只记已观察到的证据，后续演示、判断和掌握状态留待后续回合。出题本身不构成学生表现证据。

## 字段语义

| 字段 | 数学约定 |
|---|---|
| `subject` / `mode` / `submode` / `source` | `subject: math`，`mode` 沿用调用方；`submode` / `source` 由 session 按上方合并规则统一确定 |
| `strategy_summary` | 当前题的数量关系/未知量、学生实际动作或所用已知关系；说明工具在推理中的作用，区分独立方法、解释教师示例与提示后完成，不只写答案或“用了画板” |
| `strengths` / `difficulties` | 数量、单位、表示、计算、验证与支架响应的实际证据；表达短、画得不整齐、未作答或方法不够快不单独记为数学困难 |
| `next_step_candidate` / `recommended_targets` | 一个保守、具体的小步骤与近邻目标 |
| `feynman_handoff_recommended` | 是否适合转费曼讲解，依据实际表现填写 |
| `confirmed_skills` / `skill_errors_observed` | 记录前读 `learn-core` 的 `references/feynman-skill-whitelist.md`，所有模式均按其门槛填写技能名；无证据为空数组。AI 故意犯错不算学生错误，按该协议记录学生真实错误。finalize 转对象时的 `domain` 按下表 |
| `overall_performance_code` / `overall_performance_text`（可选） | `needs_support` 需支架，`basic_independent` 基本独立但个别步骤需提示，`stable` 稳定运用策略，`flexible` 同一关系换生活场景后仍能解释，或能比较关系；只在一个场景做对最多记到 `stable`。文字写清本轮证据，速度或单题答对不足以定档 |
| `current_levels`（可选） | 有足够策略证据时给 `arithmetic_strategy_stage` / `fraction_strategy_stage` 部分更新；阶段解释归本 skill 的 `references/progression-map.md`，诊断证据归本 skill 的 `references/strategy-diagnosis-rules.md` |
| `diagnosis`（可选） | 数学领域 `domain`、一个具体错误 `label` 与关键步骤 `evidence`；分类归同一诊断 reference，整题原文留在原件或分析文件 |

阶段、诊断与技能确认分别按各自证据门槛决定；未观察的可选字段省略，保留已有档案值。同一表现只按其任务范围解释，能用加法求一类差不推定所有减法已掌握，等分阶段也不概括全部分数或小数理解。已有 schema 足够时用自然语言保留差异，不新增阶段或全局等级。

## 技能 Domain 对照

segment 只写技能名；finalize 写入 `confirmed_skills` 对象时用下表填 `domain`。找不到接近域时留与证据一致的最窄域，不发明表外大类。

| Domain | 示例技能 |
|---|---|
| `addition_subtraction` | 凑十策略, 减法借位, 加减法逆运算 |
| `multiplication_division` | 乘法口诀, 除法意义, 余数概念 |
| `fractions` | 分数意义, 通分, 约分 |
| `place_value` | 数位理解, 进位退位 |
| `word_problems` | 理解题意, 找关键信息, 列式 |
