# Practice Evidence Contract

The current band's practice skill executes and returns. This contract owns purpose, count caps, adjustment, and evidence; the band's supplement owns problem design (including fractions), methods, scaffolds, presentation preferences, and batch or grade-band additions.

## Choose the Current Purpose

Tiers are purposes, not levels or a required order. One problem at a time; the problem count is a cap, and no quota is filled.

| Purpose | Use when | Design | Cap | Done when |
|---|---|---|---|---|
| Tier 1 Diagnose | A starting point or error pattern needs checking | Same problem type and unknown position, nearby numbers; for quantity roles, change only the unknown position | 1–2 | The reasoning is distinguished |
| Tier 2 Contrast | One difference needs to be seen clearly | The student's method beside a clearly labeled example, asking about one relationship | 1 | The difference is explained |
| Tier 3 Vary | The independent relationship is not yet stable, or more practice is requested | Change number structure, unknown position, or problem type per the goal; for context transfer, use a meaningfully different scene under Evidence Conditions | 2–3 | Understanding shows under the target structure, position, type, or context |
| Tier 4 Connect | Existing knowledge can support current learning or error correction | A related problem or open number sentence linked to facts the student truly knows; calculation need not be stable first | 1–2 | The link is shown |

### Consolidate / Revisit (not a Tier)

When the relation is understood but retrieval or execution is unstable, offer brief, low-pressure practice, one item at a time, with specific feedback. Accurate unprompted execution is fluency evidence; a full explanation is not required each time, and chat latency is not speed evidence. Stop when the purpose is met, the student wishes to stop, or fatigue makes practice unhelpful; there is no drill quota.

Use `next_step_candidate` and the existing next-step flow to suggest a fresh later check without repeating the method first. Report delayed performance only when it actually occurs. A saved suggestion is not a scheduled review; without cross-session state, offer a copyable suggestion. Mix taught types only to check method selection when each type is already basically usable, not to introduce multiple unfamiliar methods.

## Per Problem

1. Pose the problem and stop at the question; a new `session_id` starts a fresh task in the current provider's new-task format.
2. After an answer, reuse strategy details and fill gaps per `learn-core`'s `references/confirm-before-accept.md`; preserve the student's method.
3. After consecutive errors, support the current sticking point per the current provider's scaffold rule rather than changing the scene or mechanically dropping a tier. For the next problem, nearby numbers or a different purpose may help. Finding it troublesome or giving a short answer is not an error.
4. Stop when evidence suffices; if the cap is reached and it is still unknown, record the unknown or local sticking point and return to the mainline, without adding problems or declaring mastery.

Wrap up with one sentence on the relationship shown and one neighboring next goal.

## Evidence Conditions

For diagnostic comparisons, vary the target feature while keeping other demands comparable. If the goal is context transfer, evidence after changing the scene is needed: use a fresh, meaningfully different context preserving the target relation, without a revealing cue; renaming people alone does not qualify. Success in the original scene does not substitute for transfer evidence. A context change to clarify meaning or reduce language load is instruction. Keep context transfer, changed-condition discrimination, and calculation evidence separate; a coinciding answer does not validate the original method.

Record only what the next decision needs in existing `strategy_summary`: correctness, relation or strategy shown, support received, and changed-context or delayed conditions. Executing a supplied method is not independently selecting it. Leave unobserved aspects unknown; no new required fields or composite score. Teacher examples, process choices, and review suggestions alone create no performance segment.
