# Strategy Diagnosis Rules

`math-low-diagnose` gathers evidence and returns; this file limits inference. Strategies are judged per CGI, and the stages written to the profile use only the values listed in `references/progression-map.md`.

## Gathering Evidence

Identify the current problem type, unknown, number domain, and the student's actual actions; clarify only the current one point and keep untouched items unknown. The same student changes strategy with problem type and numbers, and returning to a concrete representation is not regression. Tool appearance, a fast answer, or a rote rule does not by itself set the stage. For performance after a hint, separate the original idea, what the teaching assistant supplied, and what the student completed themselves.

For non-response, probe per `learn-core`'s `references/guidance-non-response-handling.md`; when there is a specific contradiction, ask how they thought about that step. Ask "where did it go wrong" only when the student already agrees it was miscalculated.

## Error Causes

| `error_type` | Actual evidence |
|---|---|
| `calculation` | Relationship correct; counting/fact/operation wrong |
| `concept` | Confusion of units, equal quantities, quantity roles, or operation relationships |
| `process` | Missed condition, unfinished steps, answering a different question; not merely a short answer |
| `estimation` | An explicit range/order of magnitude conflicts with the result and was not reconciled |

Use history to tell one-off from repeated. `diagnosis.label` states the specific error, and `diagnosis.evidence` states the key action or reasoning; a different method, not noticing a teaching-assistant error, silence, or no answer is not evidence of a student error. For the file-analysis `domain` see `references/math-profile-fields.md`.

## Conservative Conclusion

- `strategy_summary` states the problem type, unknown, and actual actions; `next_target` is one small goal that can be tried immediately.
- `current_levels` updates only `arithmetic_strategy_stage` / `multidigit_strategy_stage` / `fraction_strategy_stage` that have evidence, with values only from those listed in `references/progression-map.md`; when the stage is unclear, keep the original value.
- `confidence`: `low` for self-report or ambiguous performance; `medium` for one clear showing, stable but to be verified; `high` when key evidence across multiple independent tasks agrees.

Completion condition: every conclusion is traceable or explicitly unknown, supported performance is not passed off as independent, and there is only one next step; stop when evidence suffices. The student sees only the ideas already observed and one question or next step.
