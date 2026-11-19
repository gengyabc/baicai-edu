---
cited: math-high-core/references/learn-act-allocation.md
---

# Learning Act Allocation

Every math turn in this package belongs to one of the act sets below. An act set determines the task, the required output format, and the stop condition; which method file is read is decided separately by difficulty type per `math-teaching-core.md`.

| Act | Owner | Task type | Output | Stop condition |
|---|---|---|---|---|
| Learner-explain act | `math-high-session` under `mode: feynman` | The student explains or demonstrates the target relationship | The student's explanation, illustration, or check of a subtask | The student paused, asked for a hint, or explicitly ended |
| Opening act | `math-high-session` | Select and verify an entry task when no other act applies | One entry question with hidden key | One verified task was presented; teacher output alone supplies no performance evidence |
| Micro-lesson act (`micro_lesson`) | `math-high-session` | Teach one agreed observable goal with a qualifying new-learning example under the shared contract loaded via `math-common` | A verified labeled example, a meaningful guided action, or a fresh unhinted check, with one pending question at most | The student moves to practice/another authorized activity, completes the agreed local goal, declines further work, or ends/changes target or mode via lifecycle; clear the local micro-lesson state. Pause retains its pending position |
| Practice act | `math-high-practice` | Purpose-selected practice, including Consolidate / Revisit | One checkable item per turn, with the previous subtask restated when the correction depends on it | Evidence meets the chosen purpose, or the purpose was re-chosen or handed to diagnosis |
| Student problem act | `math-high-student-problem` | The student authors a problem and judges the AI's answer | The AI answers sincerely; the student grades | The student graded or explicitly returned; legacy wrong answers or separate contrast claims are clarified under the shared contract |
| Application act | `math-high-application-modeling` | Real-world modeling with assumptions, a representation, and validation | A six-part child answer (situation, plan, representation, quantities, validation, conclusion) | Data supported, plan valid, and result verified, or the failure was handed back to practice or diagnosis |

## Selection Order

1. Lifecycle handles explicit end, pause, save recovery, target/mode changes first; the current student request and restored pending task win over a proposed opening hint.
2. `mode: feynman` opens the learner-explain act and takes precedence over every other act except an explicit end: the student explains, the AI asks as a same-age junior per `learn-core` `references/feynman-mode.md`. It composes the reply in the student's voice and does not activate another act in the same turn.
3. Choose the act:
   - **Micro-lesson act**: on entry to a goal or an explicit same-goal method change, the student agrees to learn a specific new relation/method and self-report or observed evidence supports teaching it. No failed attempt is required. Session loads the shared micro-lesson contract before entry. A supported suggestion requires willingness; one wrong answer does not authorize a lesson. An opening hint is advisory and yields to the latest explicit request, an agreed derivation/assessment, or a pending task.
   - **Opening act**: the goal is new or unclear, no other act applies, and the direction is concrete. A bare topic uses history or one consequential clarification, not an automatic lesson or diagnostic battery. The error type is observed from performance, not assumed in advance.
   - **Practice act**: the student requests practice, brings an exercise sheet, or evidence supports a specific practice purpose. Use the shared practice contract, including non-Tier Consolidate / Revisit for understood relations with unstable retrieval or execution; an error is not required for entry.
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
