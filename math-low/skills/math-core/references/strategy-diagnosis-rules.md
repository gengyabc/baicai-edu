# 策略诊断规则

`math-diagnose` 取证并回传；本文限定推断，不逐级测能力表。

## 先限定观察范围

辨当前数量角色、未知量、数域和实际动作；选题见 `references/problem-design.md`，分数与小数见 `references/fraction-relations.md`。策略按 CGI 判断，写入档案的阶段只用 `references/progression-map.md` 的取值。

同一学生可随题型、运算、数字范围换策略；具体表示不等于整体退步。只澄清当前一处，未涉及项未知。

- 工具外观不定阶段。快答或口诀本身不说明数量理解。
- 提示后的表现要分清原思路、教师提供与学生自己做成的部分。
- 分物阶段只描述当前等分协调，不作等值、比较或运算的先修门槛。图量、最简形式、命名或符号均不单独定阶段。2人/4人仍难区分时，可选非纯对半近邻题，不必每次测。
- 一种除法含义不推出另一种。部分组先查单位，不径归忘记倒数。

## 卡点与错因

无响应先按 `learn-core` 的 `references/guidance-non-response-handling.md` 探查；有具体矛盾则问该步骤怎样想。仅学生已认同算错时问“错在哪”。

| 类型 | 实际证据 |
|---|---|
| `calculation` | 关系正确，计数/事实/运算出错 |
| `concept` | 单位、等量、数量角色或运算关系混淆 |
| `process` | 漏条件、步骤未完成、答非所求；非单纯短答 |
| `estimation` | 明确范围/数量级与结果冲突且未能协调 |

保留解释再核步骤，结合历史区分偶发/重复。`diagnosis.label` 写具体错误，`diagnosis.evidence` 写关键动作/理由；方法不同、未发现教师错误、沉默、未答均非学生错误证据。

文件分析的 `domain` 与档案键见 `references/math-profile-fields.md`。`error_type` 用上表四类，不另造一套。

## 保守结论

- `strategy_summary` 写题型/未知量与实际动作，`next_target` 为一个可立即尝试目标。阶段不明保留未知/原值，以可独立行动或同结构低负荷题补证，不强制摆全量。
- `current_levels` 只更新有证据的 `arithmetic_strategy_stage` / `fraction_strategy_stage`，共享枚举不变；题型/数域差异留策略描述，不推全局逐级过关。
- `confidence`：`low` 自述或含混表现；`medium` 一次清楚展示、稳定待验；`high` 多个独立任务关键证据一致。记忆事实与灵活运用分开判断。

完成条件：每项结论可追溯或明确未知，支持表现未冒充独立，只有一个下一步；证据够即停。学生只见已观察想法和具体问题/下一步，阶段与标签留内部。
