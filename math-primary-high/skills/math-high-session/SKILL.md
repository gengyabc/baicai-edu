---
name: math-high-session
description: Upper-primary math teaching mainline (grades 4-6). Use when the learning entry routes to math, resumes an unfinished math focus, or returns to teaching after diagnosis/practice/student-made problems/modeling; supports learn and feynman modes.
user-invocable: false
---

# Upper Primary Math Teaching

Teach from the student's reasoning with the task-selected methods in `math-high-core`; no single method or expressive tool is mandatory.

## Start and Input

Load `math-high-core` (reuse it when this session already has it) and follow its "Start and Input"; read only the references that have not been read yet in this session per the condition table. The delivery language, grade-band notes, and personalization boundaries come from `math-high-core`.

## Learning-Recommendation Gate

Before entering teaching, resuming a leaf, or handling a new-problem board boundary, first detect whether the student does not know what to learn, asks "what should I learn", wants to change content without giving a concrete goal, or picks `ui.stage.switch_content` at a stage menu. If so, load `learn-recommend` and hand it the snapshot the entry already has, the current focus, and the latest real performance this turn; it reads the "Learning recommendation" role of the `math-high-core` contract. This branch stops at the recommendation choice: it produces no `session_segment`, does not call diagnosis/practice/problem-making/modeling or teaching, does not modify `context.focus` or the long-term profile, and does not run the board task boundary or a board clear. If a new goal is already explicit, hand it to the shared lifecycle; do not require a recommendation choice.

After the student chooses, hand the goal off per the shared flow and enter this mainline; a recommendation card is not a new task, and starting the chosen task does not trigger automatic board clearing. Candidates and ordering are decided by the role file; do not reuse the fixed candidate order of ordinary resume.

## Central Dispatch Contract

Math always enters through lifecycle → `math-high-session`; this skill is the sole dispatcher of `math-high-diagnose`, `math-high-practice`, `math-high-student-problem`, and `math-high-application-modeling`. The leaves only run their own playbooks and return evidence and suggestions; they do not load each other or reload this skill. Skill loading is only instruction loading; the signals below are internal logic conventions, not runtime function returns or permission isolation, and are never shown to the student.

### Recursive Prerequisite Tasks

For a confirmed missing tool, a nested gap, or a restored/overburdened learning plan, read `math-high-core`'s `references/prerequisite-learning.md` before the next action. A leaf returns the tool evidence, current task and pending position as a suggestion; only this session enters or returns from a child task. It reuses existing leaf triggers or teaches in the mainline, preserving the two-dispatch limit and immediate `await_student` stop. Keep the resolved owner and root scope; lifecycle records the optional `context.learning_plan` and active frame projection. Local frame identifiers do not create a new teaching implementation or segment. Resume only the active frame after lifecycle handles explicit end, target/mode change, and save recovery; a child-first plan is not an ordinary topic change.

### Entry Events

New problems, activities, topics, and leaf dispatches do not trigger board tools. On a topic change, lifecycle first finalizes the old topic before starting the new one. Read `math-high-core`'s `references/board-task-boundary.md` only for an explicit student clear request or when reusing a submitted representation; read `references/batch-board-boundary.md` for multi-part answer attribution. A board attachment does not authorize clearing.

### Branch Triggers

Enter a leaf using only the table below; the stage menu does not change the trigger conditions of the other rows.

| Trigger | This skill's action |
|---|---|
| `mode: feynman` | Takes precedence over transfer resume and the rows below; per the shared Feynman rules, hand the lead back to the student as presenter, and do not automatically enter the problem-making flow |
| Resumed as `context.activity: transfer` | Load `math-high-student-problem` and continue from the recorded step |
| Stage option `ui.stage.transfer`, or the student proactively makes problems to test the AI | Have the entry record the transfer state, then load `math-high-student-problem` |
| Stage option `ui.stage.practice`, requested practice or review, a taught skill needs Consolidate / Revisit for unstable retrieval/execution, an accepted saved `next_step_candidate` calls for a later check, an exercise sheet with sub-questions is brought, or the focus this turn is a wrong quantity expression | Load `math-high-practice`; a partly wrong first answer on a batch routes to practice with the recorded error pattern |
| The starting point truly needs more evidence, guidance is stuck for two consecutive rounds, the student submits error items, the self-report does not match performance, or the error cause is unclear | Load `math-high-diagnose`; do not test every new topic first by default. For derivation or proof goals, use targeted prerequisite evidence per `math-high-core`'s `references/derivation-teaching.md` and proof-specific checks in `references/proof-teaching.md`; a request to justify the teacher's method choice first calls for repairing that choice's rationale, not diagnosing a calculation gap |
| An agreed real-world decision needs a mathematical model with assumptions or data choices | Load `math-high-application-modeling` (stage option `ui.stage.modeling` or explicit student request); a fully specified textbook journey/work-rate problem stays in its current act and uses relationship derivation when needed |
| The student reports fatigue, asks to switch activity, or explicitly asks for an explanation | Do not load a new leaf; adjust support, offer a stop/simplify choice per the shared rules, or support the current obstacle per `math-high-core`'s `references/scaffold-calibration.md`; explanations and demonstrations follow shared Guide before revealing, including **Informed full-solution choice** for explicit complete-solution requests; formula goals also use the Formula-goal gate |
| A promotion or a fallback is being considered after the current answer | Read `math-high-core`'s `references/adaptive-thresholds.md` first; one answer never moves a level or a knowledge point |
| Leaf return signal | Follow the table below |

### Leaf Return Signals

| Signal | Source | This skill's action |
|---|---|---|
| `await_student` | Any leaf has asked a question or shown a flow menu | Keep the current leaf and the pending step, stop this turn; the next reply resumes that leaf |
| `continue_diagnose` | practice / student-problem needs to clarify an error cause | Assess existing evidence, then load `math-high-diagnose` |
| `continue_practice` | diagnose needs consolidation, a contrast is needed, or a modeling plan failed | Assess existing evidence, then load `math-high-practice` |
| `continue_student_problem` | The student-problem menu choice is to continue making problems | Continue that leaf's next problem |
| `continue_modeling` | The application act needs a new situation or the student asks for another one | Load `math-high-application-modeling` with the new situation |
| `return_teaching` | Any leaf wraps up or the student chooses to return to the original learning | Return to the mainline teaching on the original focus |
| `request_end` | Any leaf receives an explicit end choice | Hand back to lifecycle's end judgment and finalize; do not save on its own |

A return carries one signal, the observed evidence, and a concrete suggestion; when waiting it also carries the current problem, step, and pending question. A question still awaiting a new reply accepts only `await_student`; a wrap-up signal does not override the wait. When the student's reply explicitly asks for help or says they are stuck, that can close the old follow-up and suggest diagnosis without requiring a correct answer first. Explicit ending, topic change, or mode switch is handled first per lifecycle.

### Same-Turn Dispatch Limit

At most two leaf dispatches per turn. Entering or resuming any leaf counts as one, regardless of whether the load tool is called again; reuse already loaded skill content. After each leaf return, check in order:

1. Signal is `await_student`: stop this turn, no more dispatch.
2. Two dispatches already made this turn: dispatch no more; if the return still suggests another branch, keep the suggestion as the next step and do not jump back or start a third dispatch in the same turn.
3. Signal is `continue_*`: perform this one follow-up dispatch (such as diagnose → practice, modeling → practice, or problem-making → diagnose) only if existing evidence suffices to move forward and no question is pending.
4. Other signals follow the return-signal table.

Judgments that need a new student reply wait until the next turn; do not rehearse the student's answer.

### Waiting and Resume

- Write: when waiting, this skill has lifecycle write `context.turn_state`, reusing the shared current-problem / answer / pending-question fields and adding `active_leaf`, `leaf_step`, `active_act`, and any presented explanation and support that matter; transfer additionally keeps source and stage; a batch keeps the sub-question index and which sub-items were already judged.
- Resume: first handle lifecycle's explicit requests (end, topic change, mode switch), then continue `active_leaf` at `leaf_step`; when an old log lacks `active_leaf`, resume from the existing problem and step without reopening the problem.
- Clear: after a leaf wraps up, clear `active_leaf`, `leaf_step`, and `active_act`; when transfer completes, lifecycle restores activity to teaching. A batch's sub-question index is cleared only when the batch ends, is saved, or is explicitly abandoned.
- A leaf may only change the mathematical task inside its own act; when the next step needs another act, return the signal and let this skill decide. Do not let the student believe an act change was a new lesson.

Control signals never enter the student reply or segment fields; all leaf evidence is merged by this skill.

## Stage Options

At the stage exit of ordinary learning, return `stage_options`; after the student chooses, follow the branch-trigger table:

- `label: ui.stage.transfer`, `action: transfer`: invite the student to make problems and check the AI's answers, handled by `math-high-student-problem`; "make problems to test me" is a synonymous request.
- `label: ui.stage.practice`, `action: practice`: do neighboring practice or non-Tier Consolidate / Revisit around the current relationship, handled by `math-high-practice`.
- `label: ui.stage.modeling`, `action: modeling`: turn a real situation into a model and a decision, handled by `math-high-application-modeling`.

Labels resolve through the active UI locale (see `learn-data` `references/ui-locale.md`); do not hard-code a language-specific literal. When the student has brought a multi-part exercise, the practice option is shown as working through the exercise's sub-questions rather than a generic phrase.

## 1. Set Focus and Branch

1. A saved later-check suggestion uses a fresh unhinted item without first repeating the method, once that next step is actually accepted/entered. Record delay only from the later observed attempt; a saved suggestion is not a schedule or retention evidence. Prefer `target_context.topic`; otherwise use the focus and action restored by the lifecycle; if there is still no goal, follow the lifecycle Resolve Target profile candidate order, with the default domain and grade defaults taken from `math-high-core`'s `references/math-grade-defaults.md`.
2. File target: from the extracted analysis that `material_refs` points to, choose the focus by most recent → current domain → student-stated difficulty. For a handwritten submission, use only what the extraction actually found and keep unclear symbols unknown; do not silently correct the student's writing.
3. Before choosing an opening or revealing a formula, apply the Formula-goal gate in `math-high-core`'s `references/math-teaching-core.md` when the topic involves a formula or efficient general method. For other broad goals, select one small target and choose guided work or an agreed new-learning example using that core's shared-gate rule before posing an item; do not require a diagnostic failure before a qualifying example. If a term could name different mathematical targets, resolve it from the existing context or ask one short clarification; preserve the intended expression before choosing an opening.
   For a multi-condition or multi-stage word problem whose obstacle is linking relationships, choosing an intermediate quantity, or justifying an equation, read `math-high-core`'s `references/derivation-teaching.md` and `references/word-problem-derivation.md` before the next action. Keep the current act/leaf and resume from the established relationships and pending task; neither the Formula-goal gate nor a proof/modeling lesson is automatic for a concrete word problem.
   For constructing, understanding, checking, repairing, or writing up a proof, read `math-high-core`'s `references/derivation-teaching.md` and `references/proof-teaching.md` before the next action. Keep the agreed proof goal and claim scope; on resume use the pending task and new response rather than restarting claim analysis. Proof remains a method within the current act, with no new leaf or submode.
   For fixed-total contribution comparisons, finite choices requiring organization, repeating states and positions, or finite terminating deterministic perfect-information two-player alternating games, read `math-high-core`'s `references/mathematical-strategies.md`. Build on the actual student route, select one purposeful bridge, and check student monitoring and justification; these methods do not create a new leaf or compulsory strategy label.
4. Set the initial `submode`: new topic `learn`, consolidation/neighboring variation `practice`, error correction `review`, modeling `modeling`, Feynman `feynman`; the final value after a leaf intervenes follows the merge rules in Section 3.
5. Select the act per `math-high-core`'s `references/learn-act-allocation.md`; record it in `context.turn_state.active_act`. Whether to enter a leaf is decided only by the branch-trigger table; after a sub-flow wraps up, return to the original focus.

Completion condition: one focus, a clear mode, act, and next action; if a sub-flow already has an action, keep it.

## 2. Advance One Action

Follow `math-high-core`'s `references/math-teaching-core.md`. Before judging whether there is an answer, check the full message per the shared confirmation protocol, including any math-board or edit-history attachment and any multi-part answer; problem count follows evidence, with no fixed number of extra problems. Before presenting a new or easier problem, apply the internal check for correctness; attribute any submitted representation to its actual task rather than reusing old quantities.

Completion condition: pose one pending question, or handle the current answer and give the next action; confirm understanding or mastery only on evidence.

## 3. Wrap Up and Return

When relationship evidence exists, summarize in one sentence the student can retell, and give one small next step; when waiting for an answer, keep the current question. Do not turn an unsure point into a mastery claim because the student gave an answer.

Read `math-high-core`'s `references/math-segment-fields.md` and return the single `session_segment`: `subject: math`, `mode` inherited from the caller, `submode` decided by that reference's multi-branch merge rules, `source` aligned to `target_context.source` (file sources are normalized per the shared target protocol), and sub-flow evidence merged into the same record. Modeling acts record their assumptions and validation in `strategy_summary`; they do not add new required fields.

Completion condition: all required fields present, with evidence for strategy, confirmation, difficulty, and the optional stage/diagnosis.
