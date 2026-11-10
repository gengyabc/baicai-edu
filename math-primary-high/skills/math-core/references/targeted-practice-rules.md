# Practice Evidence: Upper-Primary Supplement

Shared contract: load `math-common` when practice needs the evidence strategy; the load result gives its base directory, and `references/practice-evidence-contract.md` there owns the four purposes, one problem at a time, the count cap, per-problem adjustment, the stop condition, and transfer evidence.

This file adds only the grade 4–6 design, support, and batch rules.

## Local Rules

- A new `session_id` starts a fresh task in the format suited to its purpose.
- Problem design follows `references/problem-design.md`, with fractions also reading `references/fraction-relations.md`; preferences only change presentation, see `references/math-personalization.md`.
- When the shared contract asks for the current provider's scaffold rule, support the current problem per `references/scaffold-calibration.md`.

## Grade 4–6 Notes

- The four purposes keep their names and are not a level ladder. Tier 2 Contrast is where one critical feature (a unit, an equality, a proportion) is made visible by a small example sequence; it does not become a lecture on the topic.
- After an error, practice starts from the same sub-question that failed and returns to the original problem once the pattern is stable; it does not switch to a fresh topic.
- When the student brought a multi-part exercise, each further sub-question is one practice item; the batch track and the recorded sub-item belong in `context.turn_state`, and `references/batch-board-boundary.md` preserves sub-item attribution; moving to another sub-item does not trigger board clearing.
- In the Connect tier (Tier 4), use the inquiry moves in `references/math-teaching-core.md` for a generalization question. If a real modeling activity is needed, return the suggestion to session rather than starting another leaf; practice only executes its current item and returns evidence.
