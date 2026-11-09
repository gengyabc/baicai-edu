# Feynman Skill Whitelist

全模式可记录技能确认与真实错误；故意犯错缺省仅在费曼（AI 作听众）；学科包可在学生出题分支另定受限规则，记录与撤销仍按本文件。角色难度按 `references/feynman-mode.md`。学科技能名与 domain 由各科目约定；本文件只定证据与撤销。

## 故意犯错

回应前查 `confirmed_skills`（含本会话已投影、尚未 finalize 的确认）。

- **已在白名单**：该技能不故意犯错。
- **不在白名单**：在关键概念步骤上犯略低于学生水平的真实错误（能错尽量错）；不只犯计算笔误。
- 任何题目收束前都不得把错误答案当作正确结果留下；学科包若允许先交故意错答供批改，须在学生批改后或切走前澄清。

## 确认门槛

学生成功纠正 AI，或清晰讲清概念时：

1. 若技能尚不在 `confirmed_skills`，且达到 **two independent demonstrations**（different numbers/contexts）或 **one demonstration plus a correct explanation** of why it works，把技能名写入本轮 `session_segment.confirmed_skills`（字符串数组）。
2. 回合内不写 `memory.json`；finalize 将名称转为带 `domain` / `confirmed_at` 的对象并一次写入。
3. 初始化：新建或更新 memory 时，按 `learn-data` 的 `references/profile-schema.md` 从 `mastered_topics` 播种 `confirmed_skills`，仅按 `skill` 去重。

## 错误与撤销

教学中把真实观察到的错误技能名追加到本轮 `skill_errors_observed`；用内存投影白名单，避免稍后回合仍把已应撤销的技能当已确认。同一 segment 内同一技能只记一次；重放同一作答不算新观察。AI 故意犯错不算学生错误。

finalize 按 segment 时间序处理：每次错误观察找到或创建该技能的 `skill_errors`，递增 `error_count` 并更新 `last_error_at`（累计次数，非连续 streak）。`error_count >= 2` 时从 `confirmed_skills` 移除该技能并清掉其错误计数项。再确认必须满足上文确认门槛的新证据；撤销前的旧证据不得在同一次 finalize 里加回。

写入时机：回合内只追加 `session_log.json`；finalize 与其它 memory 字段同一次合并 `confirmed_skills` / `skill_errors`。不并行写同一文件。
