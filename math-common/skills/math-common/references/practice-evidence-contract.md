# Practice Evidence Contract

`math-practice` executes and returns; this contract unifies purpose, problem count, and adjustment across the primary math bands. The current band's supplement names its problem design, methods, scaffolds, and any batch or grade-band additions.

## Choose Only the Current Purpose

The four kinds keep the tier names and are not levels or a required order. One problem at a time; the problem count is a cap, and no quota is filled.

| Purpose | Use when | Design | Cap | Done when |
|---|---|---|---|---|
| Tier 1 Diagnose | A starting point or error pattern needs checking | Same problem type and unknown position, nearby numbers; for quantity roles, change only the unknown position | 1–2 | The reasoning is distinguished |
| Tier 2 Contrast | One difference needs to be seen clearly | The student's method beside a clearly labeled example, asking about one relationship | 1 | The difference is explained |
| Tier 3 Vary | The independent relationship is not yet stable, or more practice is requested | Change number structure, unknown position, or problem type per the goal; change the scene only when testing context transfer | 2–3 | Understanding shows under the target structure, position, or type |
| Tier 4 Connect | Existing knowledge can support current learning or error correction | A related problem or open number sentence linked to facts the student truly knows; calculation need not be stable first | 1–2 | The link is shown |

Problem design, fraction representation, and presentation preferences follow the current provider's rules. For context transfer: if the goal is context transfer, evidence after changing the scene is needed, and success in the original scene does not substitute for transfer evidence.

## Per Problem

1. Pose the problem and stop at the question; a new `session_id` starts a fresh task in the current provider's new-task format.
2. After an answer, reuse strategy details, fill gaps per the shared confirmation protocol, and do not force a change of method.
3. After consecutive errors, support the current problem at its specific sticking point per the current provider's scaffold rule. Do not change the scene or mechanically drop a tier; the next problem may use nearby numbers or re-pick the purpose. Finding it troublesome or giving a short answer is not an error.
4. Stop when evidence suffices; if the cap is reached and it is still unknown, record the unknown or local sticking point and return to the mainline, without adding problems or declaring mastery. Ending honestly with gaps is allowed.

Wrap up with one sentence on the relationship shown and one neighboring next goal.
