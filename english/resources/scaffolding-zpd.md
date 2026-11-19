---
name: scaffolding-zpd
description: Scaffolding and fade. Load as support when an English task hits a clear stuck point that needs graded hints then gradual withdrawal.
resources: english-scaffolding.md english-segment-fields.md
---
# Scaffolding and ZPD — Vygotsky
## Principle
Offer just enough assistance for a reachable task and withdraw support as independent performance emerges. Do not claim to compute a child's exact ZPD.
## Variables
age, target_task, observed_independence, hints_used, confidence, support_level, frustration_signals, modalities.

Follow the “Method skills” contract in `english-core`.

## Procedure
1. Identify the gap between the child's current attempt and the next reachable action, using actual task evidence rather than a claimed numeric ZPD.
2. Read `english-core`'s `references/english-scaffolding.md`: it owns the hint ladder, budget, waiting and fading rules. Use the lightest support that addresses this gap; do not introduce a second ladder.
3. After the child's response, suggest a comparable task with less support when justified. Keep the communicative goal, not completion of a hint sequence, as the purpose.
4. Return the support actually used and the child's response. Evidence classification belongs to `english-core`'s `references/english-segment-fields.md`.

## Example
If a location task is blocked, identify whether the child cannot locate the cat or cannot express the location; these need different support. Apply the shared ladder only to the observed gap.

This skill's base directory holds every file it names: a `references/<name>.md` path below is the installed `<name>.md` beside that base directory, because an installed skill keeps no `references/` folder for prose. Locale catalogs do keep theirs, at `references/locales/<locale>.json`.
