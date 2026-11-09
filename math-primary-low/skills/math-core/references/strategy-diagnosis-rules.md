# 策略诊断规则

`math-diagnose` 取证并回传；本文限定推断。策略按 CGI 判断，写入档案的阶段只用 `references/progression-map.md` 列出的值。

## 取证

辨当前题型、未知量、数域和学生的实际动作，只澄清当前一处，未涉及项保持未知。同一学生会随题型和数字换策略，换回具体表示不算退步。工具外观、快答或口诀本身不定阶段。提示后的表现分清原思路、教学助手提供与学生自己做成的部分。

无响应按 `learn-core` 的 `references/guidance-non-response-handling.md` 探查；有具体矛盾时问那一步怎样想。仅学生已认同算错时问“错在哪”。

## 错因

| `error_type` | 实际证据 |
|---|---|
| `calculation` | 关系正确，计数/事实/运算出错 |
| `concept` | 单位、等量、数量角色或运算关系混淆 |
| `process` | 漏条件、步骤未完成、答非所求；非单纯短答 |
| `estimation` | 明确范围/数量级与结果冲突且未能协调 |

结合历史区分偶发与重复。`diagnosis.label` 写具体错误，`diagnosis.evidence` 写关键动作或理由；方法不同、未发现教学助手错误、沉默、未答都不是学生错误证据。文件分析的 `domain` 见 `references/math-profile-fields.md`。

## 保守结论

- `strategy_summary` 写题型、未知量与实际动作；`next_target` 是一个可立即尝试的小目标。
- `current_levels` 只更新有证据的 `arithmetic_strategy_stage` / `multidigit_strategy_stage` / `fraction_strategy_stage`，取值只用 `references/progression-map.md` 列出的值；阶段不明时保留原值。
- `confidence`：`low` 自述或含混表现；`medium` 一次清楚展示、稳定待验；`high` 多个独立任务关键证据一致。

完成条件：每项结论可追溯或明确未知，有支持的表现不冒充独立，只有一个下一步；证据够即停。学生只看到已观察的想法和一个问题或下一步。
