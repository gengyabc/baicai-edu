# Recursive Prerequisite Learning

Read when a route-critical tool gap is confirmed, a tool-learning child task reveals another gap, a recursive plan resumes, or dependencies become too burdensome. `math-high-session` remains the teaching owner and sole leaf dispatcher. Read `learn-data`'s `references/learning-plan.md` from its loaded base directory before creating, changing, saving, or restoring `context.learning_plan`; that shared contract owns the shape, authorization, persistence, and recovery. These are learning dependencies, not runtime function calls.

## 1. Identify the next dependency

Reuse demonstrated / self-reported / unknown tool evidence with support conditions. Unknown is not missing: ask a minimal discriminating task only if it changes the next action. A self-report may be tried provisionally without confirming mastery. A student's question about why a method helps usually concerns selection, not inability to execute it. Do not diagnose a tool gap from one wrong answer, unfamiliar terminology, grade, silence, or no ideas alone.

When a necessary tool is genuinely missing, enter a tool-learning child task instead of explaining that tool inside the parent and calling the gap repaired. Choose only the nearest useful dependency; do not prescribe a chapter or test the whole prerequisite graph. An explicitly requested supplied solution is still delivered at the requested depth under the goal gate, with no compulsory recursive lesson or invented performance.

Completion: an evidenced dependency or a reachable selection bridge is identified; unanswered probes wait.

## 2. Preserve the parent; enter one child

The session returns `learning_plan_update` to lifecycle using the shared protocol, including its owner authorization and the plan actually provided to the student; lifecycle persists `context.learning_plan`. The shared `references/learning-plan.md` is authoritative for the update envelope and write order. Keep `root_scope_id` and the resolved teaching implementation. A local frame `id`/`parent_id` identifies the child; it is not a new subject, provider, scope, act, leaf, or diagnosis label.

Before entry, synchronize the parent's original problem/material references, received answer, pending question, mode/activity, active act/leaf step, established relations and supplied support into its frame `task`. Create one child with its goal, missing-tool evidence and observable `return_condition`; set `active_frame_id` and project only that child's task into `context.turn_state`. Only the active frame consumes the next reply. Parent questions remain stored, not simultaneously posed.

Provide a short readable plan: original goal, current child, confirmed gaps versus unverified dependencies, provisional order, what independent tool use will permit a return, and next step. Ask lifecycle to record it before advancing; report the actual save result, distinguishing session recording from final long-term save. Never write profiles from a leaf.

Use the suitable existing skill through session dispatch: diagnosis only when evidence needs clarification, practice when its trigger applies, otherwise the mainline's task-selected teaching. Reuse loaded instructions; do not create one skill per tool or switch bands for lower-grade tools. A leaf that finds a gap returns the evidence/suggestion and wait position; it does not call another leaf. The same-turn two-dispatch limit still applies; `await_student` stops the turn immediately.

If the child reveals another confirmed prerequisite, repeat this process only after preserving its position. If its tools are available, stop decomposing and teach the child normally: inquiry, representations, labeled examples, explanation and fading are all available. Recursion is not a ban on teaching.

Completion: one active child and one pending question, a preserved parent, and a student-visible plan match the recorded state.

## 3. Check readiness; return one parent

A new appropriate task must show independent tool use under stated conditions before returning. “I understand”, reciting an example, or filling arithmetic after the teacher chose the method is not that evidence. Supplied examples and critical constructions remain teacher help. Local readiness does not automatically confirm long-term mastery or promote a strategy stage.

Record the child's actual evidence, complete that child, and restore exactly one parent, including its original problem, answer, pending position and support. Do not use the child's answer as the parent's answer. Reconnect the learned tool to the parent's obstacle, leaving the student to judge its purpose where selection is still unknown. Re-evaluate readiness at that parent rather than popping the whole chain.

A verified student alternative may remove a dependency: revise the plan and skip unnecessary study rather than completing a compulsory list. Mark an obsolete child as no longer required with its reason; do not fabricate independent success as its completion evidence.

Completion: a justified single-layer return or a concrete child learning step; parent strategy selection remains unknown until shown.

## 4. Park, renegotiate, or continue

Dependencies are too large/deep when evidence shows several unavailable tools or a substantial child learning process and the parent no longer offers intelligible progress. Judge the actual burden, not a fixed global depth or grade. A repeated tool/goal on the ancestor path without new evidence is a cycle warning: stop descending, review the dependency judgment, representation, and route. More calls are not progress.

Record the current target and whole return chain, park the blocked goal, and provide/update the plan. Recommend learning the child as the nearer goal, explaining the specific dependencies. Use the shared process-choice tool for decisions, while mathematical thinking questions remain plain text. Distinguish:

- **Learn child first, return later:** preserve the parent's goal and return chain; no ordinary topic-switch cleanup.
- **Abandon parent, choose a new goal:** explicitly terminate automatic return, then use lifecycle's authorized target-change/save flow.
- **Keep the original goal:** explain the likely extra prerequisite time and uncertainty, retain it, and continue minimal tool learning with normal teaching and stall checks. Refusal does not authorize skipping dependencies or unbounded recursion.
- **Decline necessary child work too:** renegotiate a feasible path or pause/end. Do not claim readiness or block exit.

After repeated non-progress, review before another descent. Honor stop, mode changes and explicit new targets before resuming the plan; Feynman mode keeps the student as presenter. A park is not abandonment or mastery, and a recommendation is not an accepted target change.

Completion: an authorized concrete next step or a recorded pause/choice; the parent has not silently disappeared.

## Evidence

The session produces at most one merged segment for real performance; plan-only, choices, and teacher-only explanation use `session_segment: null`. In existing `strategy_summary`/`ability_evidence`, identify the actual child goal/local frame, independent versus supported tool execution, teacher proposals, and parent selection still untested. Do not add a long-term obstacle type, strategy score or aggregated ability level. Log/current-state plan snapshots are task recovery information, not mastery evidence. Submitted board material stays attributed to its actual task, with no implicit clear or settings authorization.
