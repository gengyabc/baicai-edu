---
name: math-low-session
description: Math teaching mainline. Use when the learning entry routes to math, resumes an unfinished math focus, or returns to teaching after diagnosis/practice/student-made problems; supports learn and feynman modes.
user-invocable: false
---

# Math Teaching

Load `math-low-core` (or reuse it if already loaded this session), follow its "Start and Input", and read each reference its condition table requires once per session. Teach with CGI.

## Learning-Recommendation Gate

Check this gate before teaching, before resuming a leaf, and before a new-problem board boundary:

| Trigger | Action |
|---|---|
| The student does not know what to learn, asks for recommendations, wants different content without a concrete goal, or chooses `ui.stage.switch_content` | Load `learn-recommend` with the entry snapshot, the current focus, and the latest real performance; it reads core's learning-recommendation role |
| Cold math entry: usable identity, but no unfinished task, pending recommendation, or explicit/authorized goal | Follow the lifecycle's math recommendation gate. The profile `next_step` is only a candidate, not permission to start |
| Recommendation candidates are already pending | Show them again unchanged |
| The student states a new goal | Hand it to the shared lifecycle; no recommendation choice is needed |

Ordinary chat and Feynman mode never trigger the cold opening. The gate ends when the student is offered the choice: it produces no `session_segment`, does not modify `context.focus` or the profile, and runs no leaf, teaching, board boundary, or board clear. After the student chooses, the shared flow must write the new context successfully before teaching starts; if that write fails, keep `selected_id` for retry. Only actually starting the chosen task runs the board boundary. The role file decides candidates and their order; do not reuse the ordinary resume order. An optional `target_context.math_opening_hint` is handled in Section 1.

## Central Dispatch Contract

Math always enters through the lifecycle, then this skill. Mainline teaching and micro-lessons run here; dispatch a leaf only when its branch trigger applies. This skill is the sole dispatcher of `math-low-diagnose`, `math-low-practice`, and `math-low-student-problem`. Leaves return evidence and suggestions; they never load each other or this skill. The signals below are internal conventions, not runtime function returns or permission isolation. Never show them to the student or put them in segment fields.

### Entry Events

Before any actual new problem, activity, or topic, run core's `references/board-task-boundary.md` (the only boundary rule), even without a board attachment. This includes skipped problems, the teacher's next item, and next problems inside a leaf. On a topic change the lifecycle finalizes the old topic first; only after that succeeds, handle the boundary before starting the new topic. Dispatching, resuming, or switching to Feynman is not by itself a new task.

### Branch Triggers

Enter a leaf only through this table; a stage choice does not widen the other rows. Before resuming a leaf, check whether the student explicitly asked for a separate example of the same method (Section 1): give it in one turn, then return to the leaf's exact pending step without replacing its task. Ordinary answers simply continue the leaf.

| Trigger | Action |
|---|---|
| `mode: feynman` | Takes precedence over transfer resume and every other row. The student presents and the AI listens; do not start problem-making automatically |
| Resumed `context.activity: transfer` | Load `math-low-student-problem` at the recorded step |
| `ui.stage.transfer`, or the student starts quizzing the AI | The entry records `context.activity: transfer`, then load `math-low-student-problem` |
| `ui.stage.practice`, a request for more practice, confirming an error pattern, stabilizing independent computation, Consolidate / Revisit, or connecting to mastered knowledge | Load `math-low-practice` |
| The starting point is unclear, two guided rounds in a row stall, the student brings error items, or self-report conflicts with performance | Load `math-low-diagnose`. Do not pretest every topic by default |
| A leaf returns | Apply the signal table below |

### Leaf Return Signals

| Signal | Sent when | Action |
|---|---|---|
| `await_student` | The leaf asked a question or showed a menu | Keep the leaf and its step and stop; the next reply resumes that leaf |
| `continue_diagnose` | Practice or student-problem needs the error cause clarified | Assess existing evidence, then load diagnosis |
| `continue_practice` | Diagnosis needs consolidation, or student-problem needs a contrast | Assess existing evidence, then load practice |
| `continue_student_problem` | The student chose to keep making problems | Continue that leaf with the next problem |
| `return_teaching` | The leaf finished, or the student chose to return to learning | Resume the original focus |
| `request_end` | The student explicitly chose to end | Hand back to lifecycle's end judgment and finalize; do not save on its own |

A leaf returns one signal, its evidence, and one concrete suggestion. When it is waiting, it also returns the problem, step, and pending question. While a question is pending, only `await_student` is valid; a wrap-up signal cannot override it. If the student explicitly asks for help or says they are stuck, the old follow-up may close and diagnosis may be suggested without a correct answer first. Explicit end, topic, or mode requests are handled by the lifecycle first.

### Same-Turn Dispatch Limit

At most two leaf dispatches per turn; entering or resuming a leaf counts even without another tool call. Reuse already loaded content. After each leaf returns, check in order:

1. `await_student`: stop.
2. Two dispatches already used: keep any suggested branch as the next step; do not jump back or start a third dispatch in the same turn.
3. `continue_*`: make one follow-up dispatch only if existing evidence suffices to move forward and no question is pending.
4. Otherwise apply the signal table.

Anything that needs new evidence waits for the student's reply; never rehearse the student's answer.

### Waiting and Resume

| Event | What the lifecycle writes |
|---|---|
| Wait | `context.turn_state` with the existing task, answer, and pending-question fields, plus `active_leaf`, `leaf_step`, and any explanation or support already shown. Transfer also keeps its source and stage |
| Resume | First handle explicit end, topic, or mode requests; then resume the recorded micro-lesson or `active_leaf` at `leaf_step`, without parsing a fresh goal or reopening. An old log without activity markers resumes its existing task and step, and is not read as consent to new learning |
| Leaf complete | Clear `active_leaf` and `leaf_step`; when transfer completes, restore the teaching activity |
| Leaving a micro-lesson for practice, another activity, or Feynman | Clear `active_act: micro_lesson` and the `micro_lesson` block; keep the original task and pending question if still relevant |

This skill merges all leaf evidence.

## Stage Options

At the stage exit of ordinary learning, return `stage_options`. Resolve labels through `learn-data`'s `references/ui-locale.md`; never hard-code text:

| Label | Action | Owner |
|---|---|---|
| `label: ui.stage.transfer` | `action: transfer` | `math-low-student-problem`: the student makes problems and checks the AI's answers |
| `label: ui.stage.practice` | `action: practice` | `math-low-practice`: practice on neighboring relationships |

## 1. Set Focus and Branch

1. Keep a restored focus and its pending action. For a new target prefer `target_context.topic`. With no goal, go to the recommendation gate rather than opening the profile `next_step`; grade defaults only supply candidates.
2. For a file target, pick the focus from the `material_refs` analysis: most recent first, then the current domain, then the difficulty the student named. Keep the handoff's intent and provenance.
3. Choose an opening from the table below. Reconsider it only for a new goal, an explicit change of action on the same goal, or an accepted offer of a demonstration. Ordinary, short, or empty replies continue the pending action.
4. Set the initial `submode`: new learning or micro-lesson `learn`, consolidation or variation `practice`, correction `review`, Feynman `feynman`. Section 3 decides the final merged value.
5. Dispatch leaves only through the trigger table, and return to the original focus afterward.

| Opening situation | Action |
|---|---|
| Feynman; lifecycle end, pause, or topic change; a pending `/learn-save`; an ordinary reply to a waiting leaf | Keep the existing priority and roles; a micro-lesson cannot preempt them. Separate-example requests follow their own row |
| A recorded `turn_state.active_act: micro_lesson`, with no request to change activity | Resume the lesson at its recorded phase, pending question, and scope |
| An explicit new-learning goal, and the student says or evidence shows the relation or method is new | Start a `micro_lesson` without waiting for a failed attempt or offering a diagnostic menu |
| A broad new-learning request | State one observable small goal from available evidence; ask one short question only if the alternatives would change the teaching |
| Only a topic, and the opening stays ambiguous after checking history and current work | Ask whether the student wants an example or wants to try first; a topic alone does not authorize a demonstration |
| An explicit request to practice or discover | Use the practice-purpose rules, or protect the student's key discovery step. A formula name or the word "learn" alone does not force a demonstration |
| An original problem is pending, and the student needs help on one step | Continue local scaffolding on the original question |
| An original problem is pending, and the student explicitly asks to learn the method on another item | Give a single-turn separate example under the shared contract, keeping the original's answer and decisive inference private; then return to the recorded leaf and step without creating a second pending task |
| An original problem is pending, and the student asks for its full solution | Use the shared informed full-solution choice, not a micro-lesson workaround |
| Otherwise | Pose one goal-appropriate problem, then continue the mainline |

### Execute or Resume `micro_lesson`

Only on this branch, load `math-common` (or reuse it) and read its `references/micro-lesson-contract.md`. If loading fails, keep the guided mainline, record the limitation, and do not claim a micro-lesson happened. This session stays the teaching owner; the shared skill supplies only rules.

Follow the goal, example, guided, and independent progression and its exits; it is not a leaf and has no fixed turn quota. Read the matching local relation rules and choose child-readable representations: objects or grouped dots for composition and units, a number line for quantity, balanced expressions or contrasts for equality. One verified short example may combine a representation, an equation, and an explanation of one relation; leave at most one student decision pending. Ordinary new learning needs no `learning_plan`.

The lifecycle writes the existing task, answer, and pending fields. Only this activity uses the optional `context.turn_state.active_act: micro_lesson`; when restore needs it, add `turn_state.micro_lesson` with `goal`, `phase: example | guided | independent`, and `exposed_support`. Keep the original task in its existing fields; do not copy it. A one-turn separate example needs no second question and no persistent micro-lesson block.

### Opening Hint and Lifecycle Write (All Openings)

When a selected recommendation carries `target_context.math_opening_hint`, first read and apply **Selected opening expectation** in `learn-data`'s `references/target-parsing.md`: the goal-and-activity offer the student accepted, still subject to the safety, current-intent, evidence, and pending-task gates. Then check:

| Hint | Check before choosing |
|---|---|
| `micro_lesson` | The shared new-learning gate |
| `practice` | The practice-purpose rules |
| `probe` | One discriminating item, not automatic diagnosis |
| `challenge` | A fresh, unhinted structural variation or transfer |
| Missing, or continue current | Ordinary rules, or the existing pending step |

The student's latest explicit request for independent work, practice only, or the original's full solution takes precedence over the hint. Return the actual opening and the advanced pending state to the lifecycle, optionally with `target_context` minus `math_opening_hint`. The hint is consumed only in that same successful context write: not when it is read or selected, not on a failed write, and not in a separate preliminary write. Required writes come before teaching. A successful restore follows the recorded activity, not the hint again. Hints are temporary and never enter the profile, recommendation summaries, or performance fields.

Acceptance: one focus, one actual activity, at most one pending question; a restore keeps the task and support; after a successful opening write no reusable hint remains.

## 2. Advance One Action

Apply core's `references/math-teaching-core.md` and the shared full-message confirmation protocol. The number of problems follows evidence, not a fixed quota.

Acceptance: one pending question, or handling of the current answer plus the next action; claims of understanding or mastery need evidence.

## 3. Wrap Up and Return

When there is evidence about the relationship, give one sentence the student can retell and one small next step; while waiting for an answer, keep the current question.

Read core's `references/math-segment-fields.md`. Return one `session_segment` only when the student actually performed mathematics: `subject: math`, the caller's `mode`, the merged `submode`, `source` normalized to match `target_context.source`, and the merged leaf evidence. A pure demonstration, recommendation, or activity choice returns `session_segment: null`; the lifecycle still writes resumable context.

Acceptance: either a null segment with context only, or all required fields supported by student work, keeping supplied methods, exposed support, and independent selection distinct.
