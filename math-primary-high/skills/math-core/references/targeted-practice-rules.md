# Choosing Practice by Evidence

`math-practice` executes and returns; this file unifies purpose, problem count, and adjustment.

## Choose Only the Current Purpose

The four kinds keep the tier names and are not levels or a required order. One problem at a time; the problem count is a cap, and no quota is filled.

| Purpose and evidence | Design | Cap |
|---|---|---|
| Tier 1 Diagnose: starting point/error pattern to check | Keep problem type and unknown position, change to nearby numbers; when checking quantity roles, change only the unknown position | 1–2 problems |
| Tier 2 Contrast: one difference needs to be seen clearly | Contrast the student's method with a clearly labeled example, asking about just one relationship | 1 problem |
| Tier 3 Vary: independent relationship not yet stable or more practice requested | Change number structure, unknown position, or problem type per the goal; change the scene only when testing context transfer | 2–3 problems |
| Tier 4 Connect: existing knowledge can support current learning/error correction | Link to facts or relationships the student truly knows, using a related problem or an open number sentence | 1–2 problems |

Connecting does not require calculation to be stable first. Problem design follows `references/problem-design.md`, with fractions also reading `references/fraction-relations.md`; preferences only change presentation, see `references/math-personalization.md`.

## Per-Problem Adjustment

1. Pose the problem and stop at the question; a new `session_id` gives a fresh task in the format suited to its purpose.
2. After an answer, reuse strategy details, fill gaps per the shared confirmation protocol, and do not force a change of method.
3. After consecutive errors, find the specific relationship or calculation sticking point and support the current problem per `references/scaffold-calibration.md`; do not change the scene or mechanically drop a tier; the next problem may use nearby numbers or re-pick the purpose. Finding it troublesome or giving a short answer is not an error.
4. Stop when evidence suffices; if the cap is reached and it is still unknown, record the unknown or local sticking point, return to the mainline, and do not add more problems or declare mastery.

Completion condition: diagnosis distinguishes the reasoning, contrast explains the difference, variation shows understanding under the target number structure, unknown position, or problem type, and connection shows the link; if the goal is context transfer, evidence after changing the scene is needed, and success in the original scene does not substitute for transfer evidence. It may also end honestly with gaps. Wrap up with one sentence on the relationship shown and one neighboring next goal.

## Grade 4–6 Notes

- The four purposes keep their names and are not a level ladder. Tier 2 Contrast is where one critical feature (a unit, an equality, a proportion) is made visible by a small example sequence; it does not become a lecture on the topic.
- After an error, practice starts from the same sub-question that failed and returns to the original problem once the pattern is stable; it does not switch to a fresh topic.
- When the student brought a multi-part exercise, each further sub-question is one practice item; the batch track and the recorded sub-item belong in `context.turn_state`, and `references/batch-board-boundary.md` preserves sub-item attribution; moving to another sub-item does not trigger board clearing.
- In the Connect tier (Tier 4), use the inquiry moves in `references/math-teaching-core.md` for a generalization question. If a real modeling activity is needed, return the suggestion to session rather than starting another leaf; practice only executes its current item and returns evidence.
