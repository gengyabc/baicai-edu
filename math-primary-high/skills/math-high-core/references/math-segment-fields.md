# Math Segment Field Conventions

Before producing a math learning record or merging internal sub-flow evidence, first read Session Segments in `learn-data` and the Session Segment section of its `references/session-schema.md`. The full structure, required fields, enums, and write-back mapping belong to the shared schema; this file defines only the math-specific semantics for grades 4–6.

## One Record per Turn

Only `math-high-session` produces this turn's single `session_segment`; the leaves only return evidence, control signals, and awaiting state for session to merge. Signals are not segment fields. Lifecycle appends the log, and the shared flow writes the profile and finalize.

Merge rules:

- `mode` is inherited from the caller; in Feynman, `submode: feynman`; in ordinary learning, choose the submode by the main task the student actually answered this turn: `practice` for practice, `student_problem` for the student making/grading problems, `modeling` for the application act, `review` for diagnosis and error correction, and `learn` for everything else. With multiple branches, prefer the last task that has student-performance evidence; a newly posed unanswered question does not override the earlier task; with no answer evidence, record by the current task but do not presume performance.
- `source` aligns to `target_context.source`, with file sources normalized per the shared target protocol; entering practice, diagnosis, student-made problems, or modeling does not automatically rewrite the source. A leaf's branch metadata is used to understand evidence and does not override this field.
- `strategy_summary` distinguishes evidence from diagnosis, practice, problem-making, and modeling in the order it actually happened, deduplicating the same performance; explanation after an example, performance after a hint, and independent completion are kept separate. For modeling, it says which assumption was stated, which representation was used, and whether validation was the student's own.
- When conclusions conflict, keep the task scope, support conditions, and unknowns; do not stitch them into a stronger mastery conclusion; `diagnosis` still picks only the one best-evidenced main label, and `current_levels` gives partial updates only for parts with sufficient evidence and no unresolved conflict.
- `next_step_candidate` is one concrete next step chosen by session; suggestions awaiting execution, unanswered problems, and AI demonstrations do not count as student performance. `recommended_targets` are neighboring knowledge points from `references/topic-map.md`, not a fixed unit sequence.

`focus` records the focus actually used this turn; while waiting for the student's next answer, record only the evidence already observed, and leave later demonstrations, judgments, and mastery state to later turns. Posing a problem is not itself student-performance evidence.

## Micro-Lesson Evidence and Continuation

A teacher-only explanation or example, recommendation selection, or activity choice has `session_segment: null`. A student's actual guided action is supported evidence, even when its arithmetic execution is theirs; distinguish teacher-selected method from student execution. A fresh appropriate item without a method cue can show independent selection/use only for the relation actually tested; one item does not establish durable mastery. A lesson ending without a check leaves independence unknown and does not count as failure.

Continuation remains ordinary `mode: learn`, `context.activity: teaching`, `submode: learn`. Optional `turn_state.active_act: micro_lesson` and `turn_state.micro_lesson` (`goal`, `phase: example | guided | independent`, `exposed_support`) are local recovery state, not segment/profile evidence. Reuse existing task/answer/pending fields. Session supplies state and hint consumption to lifecycle in one successful opening context write; `math_opening_hint` never enters long-term summaries, ability evidence, or profiles. Clear lesson markers on completion/authorized exit, and merge any real performance once by the existing rules.

## Field Semantics

| Field | Math convention |
|---|---|
| `subject` / `mode` / `submode` / `source` | `subject: math`, `mode` inherited from the caller; `submode` / `source` are set uniformly by session per the merge rules above |
| `strategy_summary` | The quantity relationship/unknown of the current problem, the student's actual actions or known relationships used; for a modeling turn, the assumptions and representation; explain the role of the tool in reasoning, distinguish independent method, explaining a teaching-assistant example, performance after a hint, and the student's own validation |
| `strengths` / `difficulties` | Actual evidence on quantities, units, equality and proportion, representation, calculation, verification, and response to scaffolds; brief expression, untidy drawings, no answer, or a method that is not fast enough is not alone recorded as a math difficulty |
| `next_step_candidate` / `recommended_targets` | One conservative, concrete small step and neighboring targets |
| `feynman_handoff_recommended` | Whether switching to Feynman explanation fits, filled from actual performance |
| `confirmed_skills` / `skill_errors_observed` | Before recording, read `learn-core`'s `references/feynman-skill-whitelist.md`; every mode fills skill names per its threshold; with no evidence, an empty array. A deliberate AI error does not count as a student error; record the student's real errors per that protocol |
| `overall_performance_code` / `overall_performance_text` (optional) | `needs_support` needs scaffolding, `basic_independent` mostly independent with individual steps needing hints, `stable` uses the strategy stably, `flexible` can still explain the same relationship after changing the situation or representation, or can compare relationships. The text states this turn's evidence; speed, one correct problem, or a correct value after a hint is not enough to set the level |
| `current_levels` (optional) | With enough strategy evidence, give partial updates of `arithmetic_strategy_stage` / `multidigit_strategy_stage` / `fraction_strategy_stage` / `symbolic_strategy_stage`; stage interpretation belongs to `references/progression-map.md`, and diagnostic evidence to `references/strategy-diagnosis-rules.md` |
| `diagnosis` (optional) | Math domain `domain`, one specific error `label`, and key-step `evidence`; classification belongs to the same diagnosis reference, and the full original problem text stays in the source file or analysis file |

In `strategy_summary`, include only what informs the next decision: correctness, the relation or strategy shown, support received, and any changed-context or actual delayed condition. Distinguish independently executing a supplied method from independently selecting it; unobserved aspects stay unknown. Add no required field or composite score. `confirmed_skills` and `mastered_topics` are shared workflow labels, not retention or transfer evidence by themselves; no recorded error is not a new success, and delayed retention needs an observed later attempt. Local challenge changes do not replace shared confirmation rules.

Stage, diagnosis, and skill confirmation are each decided by their own evidence thresholds; omit optional fields not observed and keep existing profile values. The same performance is interpreted only within its task scope: a correct percent task does not establish proportional reasoning everywhere, and a correct computed value after an example does not establish independent understanding. When the existing schema suffices, keep differences in natural language and add no stage or global level.

## Word-Problem Derivation Evidence

For multi-step word problems, `strategy_summary` separates the student's selection of an intermediate quantity or equation, the justification linking quantities, execution, and checking against original conditions. Include the time origin or interval when it changes the meaning of a result. Distinguish teacher-supplied relationships from student-owned choices; computing a correct answer after a supplied route is supported execution, not independent route selection. This remains the current act's evidence, not an automatic `modeling` submode or new ability stage. Continuation uses the existing state per `references/word-problem-derivation.md`.

## Proof Evidence

For proof tasks, `strategy_summary` records the claim/scope, the student's actual strategic choice and load-bearing justification, and which hints, logical tools, or constructions were teacher-supplied. Distinguish conjecture from proof, supplied-proof understanding, supported completion or reconstruction after answer exposure, and independent construction. A correct expansion alone is execution evidence, not evidence of strategy selection or independent proof organization.

Use the existing `context.turn_state` for the current proof obstacle and pending task per `references/proof-teaching.md`; these are continuation descriptions, not new required keys. Do not add a proof submode, stage, or profile field. Completion alone does not promote arithmetic or symbolic stages or establish transfer. Apply shared segment eligibility first: a supplied explanation with no student performance is context-only (`session_segment: null`), not a fabricated performance record. The session remains the sole segment owner.

## Recursive Tool Learning and Strategy Monitoring

A recursive plan's `active_frame_id` identifies the actual local task; it does not change the root scope or teaching owner. In the existing `strategy_summary` and optional `ability_evidence`, distinguish child tool execution, parent strategy selection, teacher-provided tools/constructions, student monitoring decisions and still-unknown transfer. One merged segment may contain evidence from a child and its immediate parent without counting either response twice. Pure plan/choice/teacher-example turns are context-only (`session_segment: null`). Local readiness permits one-layer return, not automatic long-term confirmation, parent success or stage promotion. The optional learning-plan snapshot belongs to shared lifecycle/current-state storage, not a new ability field or diagnosis enum.

## Showing Progress to a Parent

Describe per activity the observed response and the support given (none, a hint, an example, a parent prompt), separating calculation, concept, reasoning, representation, and transfer where evidence exists. Do not aggregate them into a total score, and do not claim the package stores tracking state across sessions; storage is the shared lifecycle's job.
