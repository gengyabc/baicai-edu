---
name: math-application-modeling
description: Upper-primary real-world math modeling. Use when a grade 4-6 student wants to solve a real situation (budget, journey, recipe, survey, packaging) by deciding assumptions, choosing a representation, calculating, and validating the result.
user-invocable: false
---

# Upper Primary Application Modeling

## Start and Input

Load `math-core` and follow its "Start and Input". Also read `math-core`'s `references/math-teaching-core.md`, `references/problem-design.md`, `references/fraction-relations.md` (for ratio, percent, and decimal load). The six-part cycle below contains the installed modeling steps.

Use a real situation only: one the student supplies, one the extracted material actually contains, or one the student agrees to use after being asked. Do not invent data and present it as real; when a quantity must be assumed, label it as an assumption and say what would change the answer. Personalization may choose the setting of the situation only when the student explicitly asks for a real-life task; interests do not supply the numbers.

## The Six Parts (one per turn at most)

The modelling cycle is the act's required output skeleton; it does not require six teaching turns. The reply shape is a child answer with six parts, and each turn advances only the part the student is working on:

1. **Situation**: the real decision and who it is for; what is known and what is missing.
2. **Plan**: the quantities that matter, the assumptions made, and the route (unit rate, equation, table, or diagram).
3. **Representation**: the student's model in text, a table, an expression, or a paper diagram/graph; the optional board may be used only where its valued shapes express the relationship.
4. **Quantities**: the values and units in the model, checked for the unit and the magnitude; a calculation result is not accepted until its unit is stated.
5. **Validation**: does the result fit the situation? Could a different assumption change the conclusion? How sensitive is it?
6. **Conclusion**: one sentence stating the decision, its limits, and what could be revised.

## Execute

1. Pick the part from `context.turn_state.leaf_step`; on a fresh entry start at 1 unless the focus already names a part. Completion condition: one part blocked out and one pending question.
2. When the student's plan is missing or contradictory, return to part 2 with one question about one quantity, not the whole plan. Completion condition: the plan has the quantities and assumptions needed for the next part.
3. When the model is wrong or the units are inconsistent, use `math-core`'s `references/scaffold-calibration.md`; when the failure is a quantity relationship rather than a modelling step (for example multiplying two values that do not combine), return `continue_practice` with the evidence rather than repairing the model for the student.
4. When the data cannot support a conclusion (too few cases, an unstated assumption that decides the result), say so and ask what the student would add; do not manufacture a confident answer.
5. Verify each calculation per `math-core`'s internal check before it is presented as the model's value; a verification failure is the AI's own error and is corrected openly.

Completion condition: the six parts are supported by the student's own statements and work, and one conclusion is stated with its limits. When the parts cannot be completed, wrap up honestly with the part that is blocked and one next step.

## Return

Dispatched only by `math-session`; per its "Central Dispatch Contract", return only evidence and one signal, without producing a separate segment or writing the profile. When a part awaits the student's work or answer, return `await_student` with the current part, step, and pending question; `continue_practice` when the failure is a quantity relationship; `continue_diagnose` when the cause is unclear; `continue_modeling` when a new situation is needed; `return_teaching` when the act wraps up; `request_end` on an explicit end. This leaf does no cross-skill routing.

Read `math-core`'s `references/math-segment-fields.md` and return evidence for session to merge:

- Branch submode is `modeling`.
- `strategy_summary` records the assumptions stated, the representation used, the validated result, and whether the student or the teaching assistant supplied each part.
- `next_step_candidate` is the remaining part or a neighboring situation; `recommended_targets` may include a knowledge point the situation exposed.

The student sees the situation, the current part, the question, and the relationships and results already established.
