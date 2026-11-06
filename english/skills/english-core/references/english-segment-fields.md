# 英语 Segment 字段约定

产出英语学习记录或合并方法 skill 结果前，先读 `learn-data` 的 Session Segments 与其 `references/session-schema.md` 的 Session Segment。完整结构、必填字段、枚举和写回映射归共享 schema；本文只定义英语增量语义。

## 一轮一条记录

`english-session` 每轮回传一个 `session_segment`；方法 skill 的证据并入该段，不另记一轮，也不单独写日志。日志由入口追加，档案与 finalize 由共享流程写入。

`focus` 记录本轮实际焦点；等待学生下一次回答时只记已观察到的证据，后续演示、判断和水平变化留待后续回合。提出问题本身不构成学生表现证据。

## 字段语义

| 字段 | 英语约定 |
|---|---|
| `subject` / `mode` / `submode` / `source` | `subject: english`，`mode` 沿用调用方；`submode` 用 `learn` / `practice` / `review` / `feynman`，分支按 `english-session` 选；`source` 对齐 `target_context.source` |
| `strategy_summary` | 当前焦点、学生实际理解或表达的内容，以及独立完成、提示后完成或只认出的区别；不只写答案或“用了故事” |
| `strengths` / `difficulties` | 理解、表达、词汇、句型、拼写与支架响应的实际证据；答得短、慢、用中文补充或未作答不单独记为英语困难 |
| `next_step_candidate` / `recommended_targets` | 一个保守、具体的小步骤与近邻目标 |
| `feynman_handoff_recommended` | 是否适合转费曼讲解，依据实际表现填写 |
| `confirmed_skills` / `skill_errors_observed` | 记录前读 `learn-core` 的 `references/feynman-skill-whitelist.md`，所有模式均按其门槛填写技能名；无证据为空数组。AI 故意犯错不算学生错误 |
| `overall_performance_code` / `overall_performance_text`（可选） | `needs_support` 需支架，`basic_independent` 基本独立但个别步骤需提示，`stable` 同一语境稳定运用，`flexible` 换语境后仍能理解或表达；单题答对最多记到 `stable` |
| `current_levels`（可选） | 有足够证据时给 `listening` / `speaking` / `reading` / `writing` 的部分更新；档位含义归 `references/english-grade-defaults.md` |
| `diagnosis`（可选） | 英语领域 `domain`、一个具体错误 `label` 与关键表现 `evidence`；标签归 `references/english-error-labels.md` |

没有观察到的可选字段省略，保留已有档案值。一次正确回答、一次流畅朗读或一次跟读都不单独升级水平；不新增全局等级或评分字段。

## 技能 Domain 对照

segment 只写技能名；finalize 写入 `confirmed_skills` 对象时用下表填 `domain`。找不到接近域时留与证据一致的最窄域，不发明表外大类。

| Domain | 示例技能 |
|---|---|
| `listening_speaking` | 听懂简短指令, 用短句表达需要, 对话中澄清意思 |
| `reading` | 读故事抓人物, 找关键信息, 读标题预测 |
| `writing` | 仿写短句, 拼写常用词, 句子开头大写 |
| `language_use` | 颜色词, 动物词, `I want ...`, `Can you ...?` |
| `news_reading` | 读新闻找事实, 区分事实与观点 |
