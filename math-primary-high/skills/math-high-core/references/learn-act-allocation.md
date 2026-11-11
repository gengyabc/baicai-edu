# Learning Act Allocation

Every math turn in this package belongs to one of the act sets below. An act set determines the task, the required output format, and the stop condition; which method file is read is decided separately by difficulty type per `math-teaching-core.md`.

| Act | Owner | Task type | Output | Stop condition |
|---|---|---|---|---|
| Learner-explain act | `math-high-session` under `mode: feynman` | The student explains or demonstrates the target relationship | The student's explanation, illustration, or check of a subtask | The student paused, asked for a hint, or explicitly ended |
| Opening act | `math-high-session` | Select and verify a problem on the target relationship | Child view (one entry question) plus a hidden adult key | One verified problem was presented, or the student engaged and evidence was recorded |
| Practice act | `math-high-practice` | Error-pattern practice, error correction, or analyzing a mistaken approach | One checkable item per turn, with the previous subtask restated when the correction depends on it | The error pattern is stable independent of hints, or the purpose was re-chosen or handed to diagnosis |
| Student problem act | `math-high-student-problem` | The student authors a problem and judges the AI's answer | The AI answers; the student grades | The student graded or explicitly returned; any deliberate error is clarified before wrap-up |
| Application act | `math-high-application-modeling` | Real-world modeling with assumptions, a representation, and validation | A six-part child answer (situation, plan, representation, quantities, validation, conclusion) | Data supported, plan valid, and result verified, or the failure was handed back to practice or diagnosis |

## Selection Order

1. An explicit student request or the lifecycle's restored `context.activity` wins over any hypothesis.
2. `mode: feynman` opens the learner-explain act and takes precedence over every other act except an explicit end: the student explains, the AI asks as a same-age junior per `learn-core` `references/feynman-mode.md`. It composes the reply in the student's voice and does not activate another act in the same turn.
3. Choose the act:
   - **Opening act**: the goal is new or unclear, no error pattern is confirmed, and the direction is concrete. The error type is observed from performance, not assumed in advance.
   - **Practice act**: this turn recorded a wrong or partially wrong expression of a quantity relationship as the focus, or the student brought an exercise sheet with several sub-questions. The recorded wrong pattern chooses the practice group.
   - **Student problem act**: the student explicitly wants to author a problem or test the AI, or a relationship has just been explained and standing evidence says the student can start; do not open it while the student is still stuck or has not been offered a choice.
   - **Application act**: a real decision requires assumptions, data choices, or a model and the student agrees to work on it. A fully specified textbook word problem stays in its opening or practice act; a story setting or result validation alone is not a modeling trigger. Multi-step relationship building uses `references/derivation-teaching.md` with `references/word-problem-derivation.md` inside the current act.
4. An act switch happens only under the change plan below; keep the current act while a question of it is still pending.

## Routing Signals

`math-high-session` decides the next step from the signal:

- A wrong quantity expression in an opening act, or a checked performance mismatch, routes to `continue_diagnose` when the cause is unclear, and to `continue_practice` when the pattern is clear and only stabilization is needed.
- An explained relationship routes to the student problem act when the student asks to test transfer, and to practice when the student asks for more same-type items.
- A verified modeling result returns to the mainline on the same focus. A modeling failure (assumptions unstated, units wrong, result implausible) returns to practice or diagnosis on the same focus, not directly to a new topic.
- A student problem act ends when the student grades an answer or explicitly returns, and the mainline resumes on the same focus. Continuing to author more problems requires the student's request each time.

## Change Plan

Applying a plan of the current act is not the same as starting a new act. Log in the turn state which act this turn belongs to (`context.turn_state.active_act`), the method it uses, and the pending question, so a resumed turn does not reallocate the act it was already in.

A single change at a time: use `math-teaching-core.md` for task-based method selection and `adaptive-thresholds.md` for evidence-based support changes. A method may be selected at the opening without failed hints. Preserve a productive approach; avoid changing act, method, and difficulty together when one change resolves the difficulty.
