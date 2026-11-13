# Practice Evidence Contract

The current band's practice skill executes and returns; this contract unifies purpose, problem count, and adjustment across the primary math bands. The current band's supplement names its problem design, methods, scaffolds, and any batch or grade-band additions.

## Choose Only the Current Purpose

The four kinds keep the tier names and are not levels or a required order. One problem at a time; the problem count is a cap, and no quota is filled.

| Purpose | Use when | Design | Cap | Done when |
|---|---|---|---|---|
| Tier 1 Diagnose | A starting point or error pattern needs checking | Same problem type and unknown position, nearby numbers; for quantity roles, change only the unknown position | 1–2 | The reasoning is distinguished |
| Tier 2 Contrast | One difference needs to be seen clearly | The student's method beside a clearly labeled example, asking about one relationship | 1 | The difference is explained |
| Tier 3 Vary | The independent relationship is not yet stable, or more practice is requested | Change number structure, unknown position, or problem type per the goal; use a meaningful new scene for a context-transfer check; a scene change for clarification is instruction | 2–3 | Understanding shows under the target structure, position, or type |
| Tier 4 Connect | Existing knowledge can support current learning or error correction | A related problem or open number sentence linked to facts the student truly knows; calculation need not be stable first | 1–2 | The link is shown |

Problem design, fraction representation, and presentation preferences follow the current provider's rules. For context transfer: if the goal is context transfer, evidence after changing the scene is needed, and success in the original scene does not substitute for transfer evidence.

## Consolidate / Revisit (not a Tier)

When the relation is understood but retrieval or execution is not stable, offer brief, low-pressure practice, one item at a time, with specific feedback. Accurate unprompted execution is useful fluency evidence; do not require a full explanation each time or infer speed from chat latency. Stop when the current purpose is met, the student wishes to stop, or fatigue makes continuation unhelpful. This is not a fifth difficulty level or a drill quota.

Use the existing `next_step_candidate` and next-step flow to suggest a fresh later check without repeating the method first. Report delayed performance only when it actually occurs. A saved suggestion is not a scheduled review; if cross-session state is unavailable, offer a copyable suggestion without claiming a review is scheduled. Mix taught types when choosing the method is the goal and each type is already basically usable; do not introduce multiple unfamiliar methods as interleaved practice.

## Evidence Conditions

For a diagnostic comparison, vary the target feature while keeping other demands comparable. A context change that clarifies meaning or reduces language load is instruction, not independent transfer. Record independent context transfer only on a fresh, meaningfully different context with the target relation preserved and without a revealing cue; renaming people alone does not qualify. Keep context transfer, changed-condition discrimination, and calculation evidence separate. A coinciding answer does not establish that the original method remains valid.

Record only evidence needed for the next decision in existing `strategy_summary`: correctness, the relation or strategy shown, support received, and any changed-context or delayed condition. Independently executing a supplied method is not independently selecting it. Unobserved aspects stay unknown; no new required fields or composite score. Teacher examples, process choices, and review suggestions alone create no performance segment.

## Per Problem

1. Pose the problem and stop at the question; a new `session_id` starts a fresh task in the current provider's new-task format.
2. After an answer, reuse strategy details, fill gaps per the shared confirmation protocol, and do not force a change of method.
3. After consecutive errors, support the current problem at its specific sticking point per the current provider's scaffold rule. Do not change the scene or mechanically drop a tier; the next problem may use nearby numbers or re-pick the purpose. Finding it troublesome or giving a short answer is not an error.
4. Stop when evidence suffices; if the cap is reached and it is still unknown, record the unknown or local sticking point and return to the mainline, without adding problems or declaring mastery. Ending honestly with gaps is allowed.

Wrap up with one sentence on the relationship shown and one neighboring next goal.
