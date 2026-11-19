---
name: math-high-session
description: Upper-primary math teaching mainline (grades 4-6). Use when the learning entry routes to math, resumes an unfinished math focus, or returns to teaching after diagnosis/practice/student-made problems/modeling; supports learn and feynman modes.
user-invocable: false
resource-loading: on-demand
---

# Upper Primary Math Teaching

Teach from the student's reasoning with the task-selected methods in `math-high-core`; no single method or expressive tool is mandatory.

## Start and Input

Load or reuse `math-high-core`; follow its "Start and Input" and read the matching branch references before teaching. Read `references/...` paths from the core's returned base directory unless another owner is named; then use that owner's returned base directory. Reuse rules already read this session.

## Learning-Recommendation Gate

Check this gate before teaching, before resuming a leaf, and before a new-problem board boundary:

| Trigger | Action |
|---|---|
| The student does not know what to learn, asks "what should I learn", wants different content without a concrete goal, or picks `ui.stage.switch_content` | Load `learn-recommend` with the entry snapshot, the current focus, and this turn's latest real performance; it reads the "Learning recommendation" role of `math-high-core` |
| Cold math entry: valid identity, but no unfinished activity, pending choice, or explicit/authorized goal | The lifecycle routes into this same gate before any profile fallback |
| A recommendation is already pending | Show it again unchanged; silence or skipping never selects the first choice |
| The student states a new goal | Hand it to the shared lifecycle; no recommendation choice is needed |

Feynman, support-only chat, save recovery, and unfinished prerequisite tasks keep lifecycle priority. The gate ends when the student is offered the choice: it produces no `session_segment`, does not modify `context.focus` or the long-term profile, and runs no leaf, teaching, board task boundary, or board clear.

On selection, persist `selected_id`, finalize an old different target when required, and teach only after the new context write succeeds. On failure keep the choice for retry, with no new candidates or teaching. Selection and task entry do not clear the board. The role file ranks candidates, not the ordinary resume order.

## Central Dispatch Contract

Math always enters through the lifecycle, then this skill. This skill is the sole dispatcher of `math-high-diagnose`, `math-high-practice`, `math-high-student-problem`, and `math-high-application-modeling`. Leaves run their own playbooks and return evidence and suggestions; they never load each other or this skill. Loading a skill only loads instructions: the signals below are internal conventions, not runtime function returns or permission isolation, and are never shown to the student.

### Recursive Prerequisite Tasks

For a confirmed missing tool, a nested gap, or a restored or overburdened learning plan, read `math-high-core`'s `references/prerequisite-learning.md` before the next action. A leaf only suggests a child task by returning the tool evidence, current task, and pending position; only this session enters or leaves a child task. The child task reuses existing leaf triggers or the mainline, and keeps the two-dispatch limit and the immediate stop on `await_student`. Keep the resolved owner and root scope; the lifecycle records the optional `context.learning_plan` and the active frame. Frame identifiers create no new teaching implementation or segment. After the lifecycle handles explicit end, target or mode changes, and save recovery, resume only the active frame; a child-first plan is not an ordinary topic change.

### Entry Events

New problems, activities, topics, and leaf dispatches do not trigger board tools: no `math_board_clear` and no reading of an unsent student draft. This does not block `geometry_board_draw`; for geometry teaching, problems or teacher-figure requests, read `math-common`'s `references/representation-contract.md` and `references/board-contract.md` before calling it for the Teacher demo tab. It does not clear or write the student draft. On a topic change, the lifecycle finalizes the old topic before the new one starts. Read `math-high-core`'s `references/board-task-boundary.md` only for an explicit student clear request or when reusing a submitted representation, and `references/batch-board-boundary.md` for multi-part answer attribution. A board attachment does not authorize clearing.

### Micro-Lesson in This Session

On goal entry or an explicit method change on the same goal, tell a topic apart from an intent using the latest request, existing evidence, and the pending task. Explicit new learning with a usable small goal can start directly; a bare topic uses history, or one short clarification only if the answer would change the opening. Requests for practice, self-derivation, reference lookup, an original full solution, or local help keep their own paths. Ordinary answers, brief replies, and empty continuations do not reclassify a restored activity.

Only on this branch, when selecting or restoring `active_act: micro_lesson`, load `math-common` and read `references/micro-lesson-contract.md` from its returned base directory, then use `math-high-core`'s support and task-design rules. If it cannot be loaded, keep the guided mainline and do not claim a lesson happened. This session runs the lesson itself, not a leaf: one observable goal, a task-selected explanation or example, a meaningful guided action, and a fresh unhinted check when appropriate. The shared contract owns the sequence and evidence boundaries; its phases are not turn quotas. Only while executing `micro_lesson`, keep `mode: learn`, `context.activity: teaching`, and ordinary lesson `submode: learn`.

### Opening Hint

When a selected recommendation carries `target_context.math_opening_hint`, first read and apply **Selected opening expectation** in `learn-data`'s `references/target-parsing.md`: the goal-and-activity offer the student accepted, still subject to the safety, intent, and pending-task gates. The hint advises only the first opening; real intent and evidence choose the action:

| Hint | Consider |
|---|---|
| `micro_lesson` | A micro-lesson under the branch above |
| `practice` | Fresh practice |
| `probe` | One discriminating probe |
| `challenge` | An unhinted structural or transfer challenge |
| Continue current | Return to the pending point; a late hint never reopens it |

A new explicit "let me think" or "practice only" wins over the hint. A local explanation stays on the original obstacle. If an original problem is pending and the student explicitly asks for a separate example, give at most a single-turn analogy that keeps the original and its decisive inference private, then return to the original pending point without creating a second task.

Return the actual opening and continuation state to the lifecycle. Consume the hint only in the **first successful opening context write**, together with the advanced task, pending point, and chosen act, even when the real action differs from the hint. Until then keep it for recovery: do not start an unrecorded new target, do not consume it on a failed write, and do not consume it on a card or selection alone. Later restores follow the recorded activity, not the hint. An opening hint never resets mode or activity: preserve the caller's mode and the actual activity, and derive `submode` from the existing merge rules.

### Branch Triggers

Enter a leaf only through this table; a stage choice does not widen the other rows.

| Trigger | Action |
|---|---|
| `mode: feynman` | Takes precedence over transfer resume and every row below. Per the shared Feynman rules the student presents; do not start problem-making automatically |
| Resumed `context.activity: transfer` | Load `math-high-student-problem` at the recorded step |
| Stage option `ui.stage.transfer`, or the student starts making problems to test the AI | The entry records the transfer state, then load `math-high-student-problem` |
| Agreed new learning or a restored `active_act: micro_lesson`, with no higher-priority lifecycle, Feynman, pending-original, or explicit non-lesson request | Run the micro-lesson here; do not dispatch a leaf |
| Stage option `ui.stage.practice`; requested practice or review; a taught skill needs Consolidate / Revisit; an accepted saved `next_step_candidate` calls for a later check; a multi-part exercise is brought; or this turn's focus is a wrong quantity expression | Load `math-high-practice`. A partly wrong first answer on a batch goes to practice with the recorded error pattern |
| The starting point truly needs more evidence, guidance stalls two rounds in a row, the student submits error items, self-report conflicts with performance, or the error cause is unclear | Load `math-high-diagnose`; do not pretest every topic. For derivation or proof goals use targeted prerequisite evidence (`references/derivation-teaching.md`) and proof checks (`references/proof-teaching.md`). A request to justify the teacher's method choice calls for repairing that choice's rationale, not diagnosing a calculation gap |
| An agreed real-world decision needs a model with assumptions or data choices (stage option `ui.stage.modeling` or an explicit request) | Load `math-high-application-modeling`. A fully specified textbook journey or work-rate problem stays in its current act |
| The student reports fatigue, asks to switch activity, or explicitly asks for an explanation | Load no leaf. Adjust support, offer a stop or simplify choice, or support the current obstacle per `references/scaffold-calibration.md`. Explanations follow the shared Guide-before-revealing rules, including **Informed full-solution choice**; formula goals also use the Formula-goal gate |
| A promotion or fallback is considered after the current answer | Read `references/adaptive-thresholds.md` first; one answer never moves a level or a knowledge point |
| A leaf returns | Follow the signal table below |

### Leaf Return Signals

| Signal | Sent when | Action |
|---|---|---|
| `await_student` | A leaf asked a question or showed a menu | Keep the leaf and its step and stop; the next reply resumes that leaf |
| `continue_diagnose` | Practice or student-problem needs the error cause clarified | Assess existing evidence, then load `math-high-diagnose` |
| `continue_practice` | Diagnosis needs consolidation, a contrast is needed, or a modeling plan failed | Assess existing evidence, then load `math-high-practice` |
| `continue_student_problem` | The student chose to keep making problems | Continue that leaf with the next problem |
| `continue_modeling` | The modeling act needs a new situation, or the student asks for one | Load `math-high-application-modeling` with the new situation |
| `return_teaching` | A leaf finished, or the student chose to return to learning | Resume mainline teaching on the original focus |
| `request_end` | The student explicitly chose to end | Hand back to lifecycle's end judgment and finalize; do not save on its own |

A leaf returns one signal, its evidence, and one concrete suggestion. When waiting, it also returns the current problem, step, and pending question. While a question is pending, only `await_student` is valid; a wrap-up signal cannot override it. If the student explicitly asks for help or says they are stuck, the old follow-up may close and diagnosis may be suggested without a correct answer first. Explicit end, topic change, or mode switch is handled by the lifecycle first.

### Same-Turn Dispatch Limit

At most two leaf dispatches per turn; entering or resuming a leaf counts even without another load call. Reuse already loaded content. After each leaf returns, check in order:

1. `await_student`: stop this turn.
2. Two dispatches already used: keep any suggested branch as the next step; do not jump back or start a third dispatch in the same turn.
3. `continue_*`: make the one follow-up dispatch (for example diagnose to practice, modeling to practice, or problem-making to diagnose) only if existing evidence suffices to move forward and no question is pending.
4. Otherwise follow the signal table.

Anything that needs a new student reply waits for the next turn; never rehearse the student's answer.

### Waiting and Resume

- **Wait**: have the lifecycle write `context.turn_state`, reusing the shared problem, answer, and pending-question fields and adding `active_leaf`, `leaf_step`, `active_act`, and any explanation or support already shown. Transfer also keeps its source and stage; a batch keeps the sub-question index and which sub-items were already judged.
- **Resume**: first handle explicit end, topic change, or mode switch; then continue the recorded micro-lesson or `active_leaf` at `leaf_step`. An old log without these markers resumes its existing problem and step, without reopening the problem or inferring consent to a lesson.
- **Micro-lesson state**: when restore needs it, use optional `turn_state.active_act: micro_lesson` and `turn_state.micro_lesson: {goal, phase, exposed_support}` with `phase: example | guided | independent`. Store only the small goal, the phase, and critical help already shown; keep the problem, answer, and pending question in their existing fields. On completion, moving to practice or another act, or ending, clear `micro_lesson` and replace or clear `active_act` through the lifecycle. A pause keeps the waiting lesson state. An unanswered original stays protected; mode and topic changes, pause or end, and prerequisite plans keep their existing save and restore rules.
- **Clear**: when a leaf finishes, clear `active_leaf`, `leaf_step`, and `active_act`; when transfer completes, the lifecycle restores the teaching activity. Clear a batch's sub-question index only when the batch ends, is saved, or is explicitly abandoned.
- A leaf may change the mathematical task only inside its own act; when the next step needs another act, it returns a signal and this skill decides. Do not let the student think an act change is a new lesson.

Control signals never enter the student reply or segment fields; this skill merges all leaf evidence.

## Stage Options

At the stage exit of ordinary learning, return `stage_options`; after the student chooses, follow the branch-trigger table:

- `label: ui.stage.transfer`, `action: transfer`: the student makes problems and checks the AI's answers, handled by `math-high-student-problem`; "make problems to test me" means the same.
- `label: ui.stage.practice`, `action: practice`: neighboring practice, or non-Tier Consolidate / Revisit on the current relationship, handled by `math-high-practice`.
- `label: ui.stage.modeling`, `action: modeling`: turn a real situation into a model and a decision, handled by `math-high-application-modeling`.

Resolve labels through the active UI locale (`learn-data`'s `references/ui-locale.md`); never hard-code a language-specific literal. When the student brought a multi-part exercise, show the practice option as working through its sub-questions.

## 1. Set Focus and Branch

1. Restore the recorded activity before choosing any new opening. Otherwise prefer `target_context.topic`, then the focus and action the lifecycle restored. With still no goal, go back to the lifecycle's recommendation gate instead of opening a profile candidate; the default domain and grade defaults come from `references/math-grade-defaults.md`. For a newly authorized goal, consider the micro-lesson branch before defaulting to an entry problem.
2. A saved later-check suggestion, once actually accepted, uses a fresh unhinted item without repeating the method first. Record delay only from the later observed attempt; a saved suggestion is neither a schedule nor retention evidence.
3. For a file target, pick the focus from the `material_refs` analysis: most recent first, then the current domain, then the difficulty the student named. For a handwritten submission use only what extraction actually found, keep unclear symbols unknown, and never silently correct the student's writing.
4. Before choosing an opening or revealing a formula, apply the Formula-goal gate (named in `references/math-teaching-core.md`, defined in step 1 of `references/derivation-teaching.md`) whenever the topic involves a formula or an efficient general method. For other broad goals, pick one small target and choose guided work or an agreed new-learning example by **Guide before revealing** in `learn-core`'s `references/pedagogy-core.md`; a qualifying example needs no prior diagnostic failure. If a term could name different targets, resolve it from context or ask one short clarification, and preserve the intended expression before choosing an opening.
5. When the obstacle matches a method below, read its references before the next action. These change teaching inside the current act or leaf; they never create a leaf, submode, or lesson:

   | Obstacle | Read | Keep |
   |---|---|---|
   | A multi-condition or multi-stage word problem: linking relationships, choosing an intermediate quantity, or justifying an equation | `references/derivation-teaching.md`, `references/word-problem-derivation.md` | Resume from the established relationships; the Formula-goal gate, proof, and modeling are not automatic |
   | Constructing, understanding, checking, repairing, or writing up a proof | `references/derivation-teaching.md`, `references/proof-teaching.md` | The agreed proof goal and claim scope; on resume use the pending task, not a fresh claim analysis |
   | Fixed-total contribution comparisons, finite choices needing organization, repeating states and positions, or finite terminating deterministic perfect-information two-player alternating games | `references/mathematical-strategies.md` | Build on the student's route with one purposeful bridge; check their monitoring and justification; no compulsory strategy label |
   | Any conception task | Step 4 **先搭桥，再推导** of `references/derivation-teaching.md` | Pick the first action from the student's known tools and the decision still theirs; reuse a viable route already shown; routine practice needs no plan elicitation |

6. Set the initial `submode`: new topic `learn`, consolidation or neighboring variation `practice`, error correction `review`, modeling `modeling`, Feynman `feynman`. Section 3 decides the final value after a leaf intervenes.
7. Select the act per `references/learn-act-allocation.md` and record it in `context.turn_state.active_act`. Only the branch-trigger table decides whether to enter a leaf; after a leaf finishes, return to the original focus.

Completion condition: one focus with a clear mode, act, and next action; if a leaf already has an action, keep it.

## 2. Advance One Action

Follow `references/math-teaching-core.md`. Before judging whether there is an answer, read the full message per the shared confirmation protocol, including any board or edit-history attachment and every part of a multi-part answer. The number of problems follows evidence. Run the internal correctness check before presenting a new or easier problem, and attribute a submitted representation to its actual task rather than reusing old quantities.

Completion condition: one pending question, or handling of the current answer plus the next action; confirm understanding or mastery only on evidence.

## 3. Wrap Up and Return

When there is evidence about the relationship, summarize it in one sentence the student can retell and give one small next step; while waiting for an answer, keep the current question. An answer alone does not turn an unsure point into mastery.

Read `references/math-segment-fields.md`. With no actual student mathematical performance this turn (teacher-only examples, recommendation or act choices, unanswered tasks), return `session_segment: null` and record continuation context. Otherwise return the single `session_segment`: `subject: math`, `mode` from the caller, `submode` by that reference's merge rules, `source` matching `target_context.source` (file sources normalized per the shared target protocol), and all leaf evidence merged into it. Modeling records its assumptions and validation in `strategy_summary`; it adds no required fields.

Completion condition: all required fields present, with evidence for strategy, confirmation, difficulty, and the optional stage and diagnosis.
