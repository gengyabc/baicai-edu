---
cited: math-high-core/references/strategy-diagnosis-rules.md
---

# Strategy Diagnosis Rules

`math-high-diagnose` gathers evidence and returns; this file limits inference. Judge the mathematical relationship, representation, procedure, and explanation actually shown. CGI-derived stage fields use only the values in `references/progression-map.md`; they describe particular strategies, not the whole grade-4-6 curriculum or a ranking of teaching methods.

## Gathering Evidence

Identify the current problem type, unknown, number domain, and the student's actual actions; clarify only the current one point and keep untouched items unknown. The same student changes strategy with problem type and numbers, and returning to a concrete representation is not regression. Tool appearance, a fast answer, or a rote rule does not by itself set the stage. For performance after a hint, separate the original idea, what the teaching assistant supplied, and what the student completed themselves.

For non-response, probe per `learn-core`'s `references/guidance-non-response-handling.md`; when there is a specific contradiction, ask how they thought about that step. Ask "where did it go wrong" only when the student already agrees it was miscalculated.

## Knowledge Point and Prerequisite Evidence

Before moving a focus or stepping back a knowledge point, use `references/topic-map.md` for the target and its direct prerequisites. A hypothesized gap is not an observed gap. Only after a confirming probe shows the gap may you step back one edge; with uncertain evidence, ask a discriminating question instead. Do not run an exhaustive prerequisite test, and do not use grade placement as evidence of readiness.

Use the smallest discriminating contrast that separates a plausible misconception from an alternative such as a reading or copying slip. Reuse existing discriminating work; another independent observation earns its place only when it can change the conclusion or next move. Post-hint evidence stays supported and unresolved causes stay unknown.

## Local Thinking Obstacles

Use a local obstacle description to select an action, not a new `error_type`, six-dimensional score, or persistent student type. Understanding, representation, strategy selection, execution, justification and transfer can overlap; retain only the best-supported current description in `strategy_summary`. A missing enumeration branch may be an incomplete classification or a copying slip: ask a discriminating question before concluding. A student who can calculate but cannot organize cases needs an organization bridge, not automatic arithmetic remediation. Use `references/mathematical-strategies.md` for the three-method pilot and student monitoring. Confirmed tool gaps return to session for `references/prerequisite-learning.md`; only the shared lifecycle writes the plan, and the diagnostic leaf does not route another skill.

## Error Causes

| `error_type` | Actual evidence |
|---|---|
| `calculation` | Relationship correct; counting/fact/operation wrong |
| `concept` | Confused units, equality, quantity roles, critical features, or operation relationships |
| `process` | Missed condition, unfinished steps, answering a different question, or wrong model setup; not merely a short answer |
| `estimation` | An explicit range/order of magnitude conflicts with the result and was not reconciled |

Use history to tell one-off from repeated. `diagnosis.label` states the specific error, and `diagnosis.evidence` states the key action or reasoning; a different method, not noticing a teaching-assistant error, silence, or no answer is not evidence of a student error. When a misconception is confirmed, record the hypothesis source (which probe confirmed it) so the next turn does not re-test the same thing. For the file-analysis `domain` see `references/math-profile-fields.md`.

## Conservative Conclusion

- `strategy_summary` states the problem type, unknown, and actual actions; `next_target` is one small goal that can be tried immediately (the session merges it as `next_step_candidate` per `references/math-segment-fields.md`).
- `current_levels` updates only `arithmetic_strategy_stage` / `multidigit_strategy_stage` / `fraction_strategy_stage` / `symbolic_strategy_stage` with current evidence, with values only from those listed in `references/progression-map.md`; when the stage is unclear, keep the original value.
- `confidence`: `low` for self-report or ambiguous performance; `medium` for one clear showing, stable but to be verified; `high` when key evidence across multiple independent tasks agrees, or an independent transfer to a changed scene also holds.
- A single correct answer never justifies a stage change. After a correct answer, ask at most one additional discriminating check only if it can change the next decision; stop when evidence suffices. Stage changes require the strategy evidence in `references/progression-map.md`; `confidence` follows the evidence conditions above. Item count alone authorizes neither update. Do not silently overwrite a conclusion to a higher level because of one success.

Completion condition: every conclusion is traceable or explicitly unknown, supported performance is not passed off as independent, and there is only one next step; stop when evidence suffices. The student sees only the ideas already observed and one question or next step.

## Expected Error Types for Grades 4–6

These are hypotheses to probe, not labels to apply:

- Place value compared by digit count rather than quantity.
- Remaining units larger than the divisor, or the remainder ignored in a packing or measurement context.
- Fraction denominator compared alone, or numerator and denominator changed separately in equivalence.
- Fraction operations done as separate procedures (components added or "flip and multiply" without checking unit meaning).
- Formulas used without identifying the base (percent without a base quantity, area and perimeter confused).
- Every increasing relation assumed to be proportional (table or graph patterns generalized too early).
- A worked example treated as the method (guessing from shape of the answer, "solve by looking at the numbers").
- An estimation result never reconciled with the exact result.

Record and confirm one at a time; a confirmed misconception changes what the next task probes, not how the student is described.
