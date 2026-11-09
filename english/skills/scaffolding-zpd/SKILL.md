---
name: scaffolding-zpd
description: 提示与退让。英语任务出现明确卡点，需要逐级提示再逐步撤除时辅助加载。
user-invocable: false
---
# Scaffolding and ZPD — Vygotsky
## Principle
Offer just enough assistance for a reachable task and withdraw support as independent performance emerges. Do not claim to compute a child's exact ZPD.
## Variables
age, target_task, observed_independence, hints_used, confidence, support_level, frustration_signals, modalities.

Follow the “方法 skill” contract in `english-core`.

## Procedure
1. Identify the gap between the child's current attempt and the next reachable action, using actual task evidence rather than a claimed numeric ZPD.
2. Read `english-core`'s `references/english-scaffolding.md`: it owns the hint ladder, budget, waiting and fading rules. Use the lightest support that addresses this gap; do not introduce a second ladder.
3. After the child's response, suggest a comparable task with less support when justified. Keep the communicative goal, not completion of a hint sequence, as the purpose.
4. Return the support actually used and the child's response. Evidence classification belongs to `english-core`'s `references/english-segment-fields.md`.

## Example
If a location task is blocked, identify whether the child cannot locate the cat or cannot express the location; these need different support. Apply the shared ladder only to the observed gap.
