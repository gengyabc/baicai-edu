# Math Segment Field Conventions

Read Session Segments in `learn-data` and the Session Segment section of its `references/session-schema.md` for schema and write-back. This file adds grades 4–6 evidence semantics only.

## Merge and record

Only `math-high-session` emits one `session_segment`. Leaves return evidence, control signals and pending state; lifecycle logs and writes profiles. A teacher-only explanation/example, recommendation selection, or activity choice stays context-only (`session_segment: null`). An unanswered prompt supplies no performance.

| Field | Math convention |
|---|---|
| `subject` / `mode` / `submode` | `math`; inherit `mode`. Feynman → `feynman`; otherwise use `practice`, `student_problem`, `modeling`, `review` (diagnosis/correction) or `learn`. Use the last task with performance evidence, not the next unanswered prompt. With no answers, any eligible record uses the current task without presuming performance. |
| `source` / `focus` | Source follows `target_context.source` with shared file normalization, not leaf dispatch; focus is the work actually done this turn. |
| `strategy_summary` | State the relationship/unknown, correctness, actual actions, support and changed-context/delayed conditions. Deduplicate and keep evidence in order. For modeling, name the assumption, representation and who validated it. |
| `strengths` / `difficulties` | Record evidence on quantities, units, equality/proportion, representation, calculation, verification and support response. Brevity, untidy drawings, silence and slowness alone establish no difficulty. |
| `next_step_candidate` / `recommended_targets` | Session chooses one concrete step; neighboring targets come from `references/topic-map.md`, not a fixed sequence. |
| `feynman_handoff_recommended` | Suitability based on actual performance. |
| `confirmed_skills` / `skill_errors_observed` | Follow `learn-core`'s `references/feynman-skill-whitelist.md` in every mode. Use empty arrays without evidence. Teacher errors are not student errors. |
| `overall_performance_code` / `overall_performance_text` (optional) | `needs_support` needs scaffolding; `basic_independent` mostly independent with a hinted step; `stable` uses the strategy stably; `flexible` explains the relation after a change or compares relations. Describe the evidence; speed or one correct value (especially after help) is insufficient. |
| `current_levels` (optional) | Sufficient strategy evidence permits partial updates: `arithmetic_strategy_stage`, `multidigit_strategy_stage`, `fraction_strategy_stage`, `symbolic_strategy_stage`. See `references/progression-map.md` and `references/strategy-diagnosis-rules.md`. |
| `diagnosis` (optional) | Use the one best-supported `domain`, `label` and key-step `evidence` per diagnosis rules. The original problem stays with its source/analysis. |

Apply stage, diagnosis and skill confirmation thresholds separately. Keep conflicting evidence scoped to the task and support; omit unproven updates and preserve old profile values. Separate executing a supplied method, explaining an example, and independent method selection. No new keys, aggregate score or general stage; absence of error is not success, shared labels are not transfer/retention, and delayed retention requires a later observed attempt.

## Micro-Lesson Evidence and Continuation

Teacher-selected method + actual student action = supported evidence. A fresh uncued check can show independent use only for the tested relationship, not durability. No check leaves independence unknown, not failed.

Resume in `mode: learn`, `context.activity: teaching`, `submode: learn`. Optional `turn_state.active_act: micro_lesson` and `turn_state.micro_lesson` (`goal`, `phase: example | guided | independent`, `exposed_support`) are recovery state. Reuse task/answer/pending fields. Session passes state and hint consumption in one successful lifecycle opening write; `math_opening_hint` stays out of long-term summaries, evidence and profiles. Clear lesson markers on completion/authorized exit; merge real performance once.

## Route Ownership and Monitoring Evidence

Use existing `strategy_summary` and, where applicable, `ability_evidence`. Record only relevant observations, not a four-part interview:

- **Route source:** student, teacher cue/construction, joint, or unknown; later execution does not change the source.
- **Connection:** student's link from a tool/representation to the unknown, with support. Sketches, trials and equations can show a link; agreement alone cannot.
- **Key derivation:** student vs supplied load-bearing inference, separate from accuracy.
- **Monitoring:** actual check of usefulness/conditions or grounded continue/revise/switch decision; otherwise unknown.

Keep a route-selection strength and a separate execution difficulty where evidenced. Describe changed-condition or fresh checks with their prompting conditions; a proposed check is not transfer.

## Word-Problem Derivation Evidence

Separate intermediate/equation selection, justification, execution and checks against the conditions. Include the time origin or interval if it changes meaning. A correct value after a supplied route is supported execution, not independent route selection. Keep the current act; resume per `references/word-problem-derivation.md`.

## Proof Evidence

Record claim/scope, strategy, load-bearing justification and teacher-supplied hints/tools/constructions. Distinguish conjecture, understanding a supplied proof, supported completion/reconstruction after exposure, and independent construction. Correct expansion alone shows execution. Resume via `context.turn_state` per `references/proof-teaching.md`. Do not add a proof submode, stage, or profile field, or promote a stage solely on proof completion.

## Recursive Tool Learning

`active_frame_id` names the local task, not a new root scope or owner. Distinguish child execution, parent selection, supplied tools, monitoring and unknown transfer; count child/parent evidence once each. Plan-only turns are context-only. Local readiness permits one-layer return, not parent success, durable confirmation or promotion. The optional plan is lifecycle state, not evidence.

## Showing Progress to a Parent

Report observed responses and support by activity (including parent prompts), distinguishing concept, calculation, reasoning, representation and transfer where observed. Lifecycle owns persistence; use no total score.
