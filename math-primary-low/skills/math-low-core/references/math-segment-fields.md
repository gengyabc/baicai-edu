# Math Segment Field Conventions

Before producing a math learning record or merging internal sub-flow evidence, first read Session Segments in `learn-data` and the Session Segment section of its `references/session-schema.md`. The full structure, required fields, enums, and write-back mapping belong to the shared schema; this file defines only the math-specific semantics.

## One Record per Turn

Only `math-low-session` produces this turn's single `session_segment`; the three leaves only return evidence, control signals, and awaiting state for session to merge. Signals are not segment fields. Lifecycle appends the log, and the shared flow writes the profile and finalize.

A pure AI demonstration, recommendation display/selection, activity choice, or unanswered opening produces `session_segment: null`, while lifecycle still records the current task, pending question, and presented support. If student work already occurred earlier this turn, keep that evidence in the single segment; a later demonstration adds no performance of its own.

Merge rules:

- `mode` is inherited from the caller; in Feynman, `submode: feynman`; in ordinary learning, choose the submode by the main task the student actually answered this turn: `practice` for practice, `student_problem` for the student making/checking problems, `review` for diagnosis and error correction, and `learn` for everything else. With multiple branches, prefer the last task that has student-performance evidence; a newly posed unanswered question does not override the earlier task; with no answer evidence, record by the current task but do not presume performance.
- `source` aligns to `target_context.source`, with file sources normalized per the shared target protocol; entering practice, diagnosis, or student-made problems does not automatically rewrite the source. A leaf's branch metadata is used to understand evidence and does not override this field.
- `strategy_summary` distinguishes evidence from diagnosis, practice, and problem-making in the order it actually happened, deduplicating the same performance; explanation after an example, performance after a hint, and independent completion are kept separate.
- When conclusions conflict, keep the task scope, support conditions, and unknowns; do not stitch them into a stronger mastery conclusion; `diagnosis` still picks only the one best-evidenced main label, and `current_levels` gives partial updates only for parts with sufficient evidence and no unresolved conflict.
- `next_step_candidate` is one concrete next step chosen by session; suggestions awaiting execution, unanswered problems, and AI demonstrations do not count as student performance.

`focus` records the focus actually used this turn; while waiting for the student's next answer, record only the evidence already observed, and leave later demonstrations, judgments, and mastery state to later turns. Posing a problem is not itself student-performance evidence.

## Micro-Lesson Evidence

Micro-lessons retain `mode: learn`, `context.activity: teaching`, and `submode: learn`; `turn_state.active_act: micro_lesson` and optional `micro_lesson {goal, phase, exposed_support}` are resumable context only, never performance fields or profile additions. The temporary opening hint is consumed by lifecycle's successful opening-context write, not copied into evidence.

- `example`: AI exposition and a student's activity choice supply no mathematical performance. “懂了” alone does not show independent understanding.
- `guided`: record the student's actual decision, representation, relation, or calculation as supported, specifying what was already exposed. Correctly executing an AI-selected method does not show independent selection.
- `independent`: only the actual response to a fresh, unhinted item can support independent evidence for the observed relation or strategy. If support is later supplied, retain the supported condition; elapsed turns do not erase exposure. A single success is local evidence, not stable mastery, retention, or general transfer.

Use existing `strategy_summary` and other fields below; add no micro-lesson score, stage, or long-term recommendation database. Leaving after the explanation or declining a check creates no error or stage downgrade. When actual student work supports a segment but independent evidence is absent, its `next_step_candidate` may conservatively propose an unhinted check; pure exposition still returns no segment.

## Field Semantics

| Field | Math convention |
|---|---|
| `subject` / `mode` / `submode` / `source` | `subject: math`, `mode` inherited from the caller; `submode` / `source` are set uniformly by session per the merge rules above |
| `strategy_summary` | Record only decision-relevant correctness, relation/strategy shown, support received, and any observed changed-context or delayed condition. Accept valid drawing, action, writing, or oral evidence. Distinguish independently executing a supplied method from independently selecting it, and explanation after an example from independent solving. Unobserved aspects stay unknown; no new required field or composite score |
| `strengths` / `difficulties` | Actual evidence on quantities, units, representation, calculation, verification, and response to scaffolds; brief expression, untidy drawings, no answer, or a method that is not fast enough is not alone recorded as a math difficulty |
| `next_step_candidate` / `recommended_targets` | One conservative, concrete small step and neighboring targets |
| `feynman_handoff_recommended` | Whether switching to Feynman explanation fits, filled from actual performance |
| `confirmed_skills` / `skill_errors_observed` | Before recording, read `learn-core`'s `references/feynman-skill-whitelist.md`; every mode fills skill names per its threshold; with no evidence, an empty array. A deliberate AI error does not count as a student error; record the student's real errors per that protocol. The `domain` used when finalize converts to objects follows the table below |
| `overall_performance_code` / `overall_performance_text` (optional) | `needs_support` needs scaffolding, `basic_independent` mostly independent with individual steps needing hints, `stable` uses the strategy stably, `flexible` shows the same relationship through valid oral or nonoral evidence in a fresh changed context without a revealing cue, or can compare relationships; succeeding in only one scene is recorded at most as `stable`. The text states this turn's evidence; speed or one correct problem is not enough to set the level |
| `current_levels` (optional) | With enough strategy evidence, give partial updates of `arithmetic_strategy_stage` / `multidigit_strategy_stage` / `fraction_strategy_stage`; stage interpretation belongs to this skill's `references/progression-map.md`, and diagnostic evidence to this skill's `references/strategy-diagnosis-rules.md` |
| `diagnosis` (optional) | Math domain `domain`, one specific error `label`, and key-step `evidence`; classification belongs to the same diagnosis reference, and the full original problem text stays in the source file or analysis file |

`confirmed_skills` and `mastered_topics` are workflow labels, not retention or transfer evidence by themselves. An absence of recorded errors is not a fresh success; delayed retention requires an observed later attempt. A local challenge does not replace the shared confirmation threshold.

Stage, diagnosis, and skill confirmation are each decided by their own evidence thresholds; omit optional fields not observed and keep existing profile values. The same performance is interpreted only within its task scope: being able to use addition to find one kind of difference does not imply all subtraction is mastered, and an equal-sharing stage does not summarize all fraction or decimal understanding. When the existing schema suffices, keep differences in natural language and add no stage or global level.

## Skill Domain Mapping

The segment writes only the skill name; when finalize writes a `confirmed_skills` object, it fills `domain` from the table below. If no close domain is found, keep the narrowest domain consistent with the evidence and do not invent a broad category outside the table.

| Domain | Example skills |
|---|---|
| `addition_subtraction_word_problems` | make-ten strategy, subtraction regrouping, inverse of addition and subtraction, understanding the problem, finding key information, writing the equation |
| `multiplication_division` | multiplication facts, meaning of division, concept of remainder |
| `fractions` | fraction meaning, common denominators, simplifying |
| `place_value_and_multidigit` | place-value understanding, carrying and borrowing |
