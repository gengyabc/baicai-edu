---
name: math-low-session
description: Math teaching mainline. Use when the learning entry routes to math, resumes an unfinished math focus, or returns to teaching after diagnosis/practice/student-made problems; supports learn and feynman modes.
user-invocable: false
---

# Math Teaching

Teach with CGI (Cognitively Guided Instruction); the rules come from `math-low-core`.

## Start and Input

Load `math-low-core` (reuse it when this session already has it), follow its "Start and Input", and read only the references that have not been read yet in this session per its condition table.

## Learning-Recommendation Gate

Before entering teaching, resuming a leaf, or handling a new-problem board boundary, first detect whether the student does not know what to learn, asks "what should I learn", wants to change content without giving a concrete goal, or picks `ui.stage.switch_content` at a stage menu. If so, load `learn-recommend` and hand it the snapshot the entry already has, the current focus, and the latest real performance this turn; it reads the "Learning recommendation" role of the `math-low-core` contract. This branch stops at the recommendation choice: it produces no `session_segment`, does not call diagnosis/practice/problem-making or teaching, does not modify `context.focus` or the long-term profile, and does not run the board task boundary or a board clear. If a new goal is already explicit, hand it to the shared lifecycle; do not require a recommendation choice.

After the student chooses, hand the goal off per the shared flow and enter this mainline; a recommendation card is not a new task, and the board boundary is handled only when the chosen task actually starts. Candidates and ordering are decided by the role file; do not reuse the fixed candidate order of ordinary resume.

## Central Dispatch Contract

Math always enters through lifecycle → `math-low-session`; this skill is the sole dispatcher of `math-low-diagnose`, `math-low-practice`, and `math-low-student-problem`. The three leaves only run their own playbooks and return evidence and suggestions; they do not load each other or reload this skill. Skill loading is only instruction loading; the signals below are internal logic conventions, not runtime function returns or permission isolation, and are never shown to the student.

### Entry Events

Before entering a new problem, activity, or topic, first run `math-low-core`'s `references/board-task-boundary.md` (the only boundary rule); it applies even without a board attachment. This covers entry-level problem skipping, the teaching assistant proactively moving to the next problem, and next problems inside a leaf; on a topic change, lifecycle finalizes the old topic first, and after success this entry handles the boundary before starting the new topic. Leaf dispatch, resume, and Feynman switching are not by themselves a new task.

### Branch Triggers

Enter a leaf using only the table below; the stage menu does not change the trigger conditions of the other rows.

| Trigger | This skill's action |
|---|---|
| `mode: feynman` | Takes precedence over transfer resume and the rows below; per the shared Feynman rules, hand the lead back to the student as presenter, and do not automatically enter the problem-making flow |
| Resumed as `context.activity: transfer` | Load `math-low-student-problem` and continue from the recorded step |
| Stage option `ui.stage.transfer`, or the student proactively makes problems to test the AI | Have the entry record the transfer state, then load `math-low-student-problem` |
| Stage option `ui.stage.practice`, the student asks for more practice, or same-type problems are needed to confirm an error pattern, stabilize independent computation, or connect to mastered knowledge | Load `math-low-practice` |
| The starting point truly needs more evidence, guidance is stuck for two consecutive rounds, the student submits error items, or self-report does not match performance | Load `math-low-diagnose`; do not test every new topic first by default |
| Leaf return signal | Follow the table below |

### Leaf Return Signals

| Signal | Source | This skill's action |
|---|---|---|
| `await_student` | Any leaf has asked a question or shown a flow menu | Keep the current leaf and the pending step, stop this turn; the next reply resumes that leaf |
| `continue_diagnose` | practice / student-problem needs to clarify an error cause | Assess existing evidence, then load `math-low-diagnose` |
| `continue_practice` | diagnose needs consolidation, or student-problem needs a right/wrong contrast | Assess existing evidence, then load `math-low-practice` |
| `continue_student_problem` | The student-problem menu choice is to continue making problems | Continue that leaf's next problem |
| `return_teaching` | Any leaf wraps up or the student chooses to return to the original learning | Return to the mainline teaching on the original focus |
| `request_end` | Any leaf receives an explicit end choice | Hand back to lifecycle's end judgment and finalize; do not save on its own |

A return carries one signal, the observed evidence, and a concrete suggestion; when waiting it also carries the current problem, step, and pending question. A question still awaiting a new reply accepts only `await_student`; a wrap-up signal does not override the wait. When the student's reply explicitly asks for help or says they are stuck, that can close the old follow-up and suggest diagnosis without requiring a correct answer first. Explicit ending, topic change, or mode switch is handled first per lifecycle.

### Same-Turn Dispatch Limit

At most two leaf dispatches per turn. Entering or resuming any leaf counts as one, regardless of whether the load tool is called again; reuse already loaded skill content. After each leaf return, check in order:

1. Signal is `await_student`: stop this turn, no more dispatch.
2. Two dispatches already made this turn: dispatch no more; if the return still suggests another branch, keep the suggestion as the next step and do not jump back or start a third dispatch in the same turn.
3. Signal is `continue_*`: perform this one follow-up dispatch (such as diagnose → practice or problem-making → diagnose) only if existing evidence suffices to move forward and no question is pending.
4. Other signals follow the return-signal table.

Judgments that need a new student reply wait until the next turn; do not rehearse the student's answer.

### Waiting and Resume

- Write: when waiting, this skill has lifecycle write `context.turn_state`, reusing the shared current-problem / answer / pending-question fields and adding `active_leaf`, `leaf_step`, and any presented explanation and support that matter; transfer additionally keeps source and stage.
- Resume: first handle lifecycle's explicit requests (end, topic change, mode switch), then continue `active_leaf` at `leaf_step`; when an old log lacks `active_leaf`, resume from the existing problem and step without reopening the problem.
- Clear: after a leaf wraps up, clear `active_leaf` and `leaf_step`; when transfer completes, lifecycle restores activity to teaching.

Control signals never enter the student reply or segment fields; all leaf evidence is merged by this skill.

## Stage Options

At the stage exit of ordinary learning, return `stage_options`; after the student chooses, follow the branch-trigger table:

- `label: ui.stage.transfer`, `action: transfer`: invite the student to make problems and check the AI's answers, handled by `math-low-student-problem`; "make problems to test me" is a synonymous request.
- `label: ui.stage.practice`, `action: practice`: do neighboring practice around the current relationship, handled by `math-low-practice`.

Labels resolve through the active UI locale (see `learn-data` `references/ui-locale.md`); do not hard-code a language-specific literal.

## 1. Set Focus and Branch

1. Prefer `target_context.topic`; otherwise use the focus and action restored by the lifecycle; if there is still no goal, follow the lifecycle Resolve Target profile candidate order, with the default domain taken from `math-low-core`'s `references/math-grade-defaults.md`.
2. File target: from the extracted analysis that `material_refs` points to, choose the focus by most recent → current domain → student-stated difficulty.
3. For a broad goal, pick one problem first.
4. Set the initial `submode`: new topic `learn`, consolidation/neighboring variation `practice`, error correction `review`, Feynman `feynman`; the final value after a leaf intervenes follows the merge rules in Section 3.
5. Whether to enter a leaf is decided only by the branch-trigger table; after a sub-flow wraps up, return to the original focus.

Completion condition: one focus, a clear mode and next action; if a sub-flow already has an action, keep it.

## 2. Advance One Action

Follow `math-low-core`'s `references/math-teaching-core.md`. Before judging whether there is an answer, check the full message per the shared confirmation protocol; problem count follows evidence, with no fixed number of extra problems.

Completion condition: pose one pending question, or handle the current answer and give the next action; confirm understanding or mastery only on evidence.

## 3. Wrap Up and Return

When relationship evidence exists, summarize in one sentence the student can retell, and give one small next step; when waiting for an answer, keep the current question.

Read `math-low-core`'s `references/math-segment-fields.md` and return the single `session_segment`: `subject: math`, `mode` inherited from the caller, `submode` decided by that reference's multi-branch merge rules, `source` aligned to `target_context.source` (file sources are normalized per the shared target protocol), and sub-flow evidence merged into the same record.

Completion condition: all required fields present, with evidence for strategy, confirmation, difficulty, and the optional stage/diagnosis.
