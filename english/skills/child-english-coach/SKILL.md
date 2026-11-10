---
name: child-english-coach
description: English activity orchestration. Load when the student wants free English play, has no specified goal, or wants one activity that combines story, talk, tasks, and review; supplies cross-turn plans for the English mainline without creating its own learning record.
user-invocable: false
---

# English Activity Orchestration

Provides a cross-turn plan and method suggestions for one low-pressure English activity; the current reply, method loading, and the single `session_segment` belong to `english-session`.

## Input and Shared Rules

Reuse the snapshot, `target_context`, materials, student message, and `context.turn_state` passed in by the entry; keep the current focus and pending question, and do not re-ask for age, grade, or interests already recorded. When information that truly affects the next action is missing, suggest only one short question and wait; do not redo a questionnaire or profile setup.

Read through `english-core`:

- Before designing an activity and suggesting methods, read the single method selection table (target type + current observation) in `references/english-teaching-core.md`; this skill does not maintain another table. Hand the main or auxiliary method suggestion to the session to decide; do not load method skills yourself.
- When adjusting material difficulty, read `references/english-input-adaptation.md`, based on actual comprehension; do not infer English level from grade.
- When the student is stuck or support should be reduced, read the single hint ladder and fading rules in `references/english-scaffolding.md`.
- When providing observation evidence, hand it to the session for mapping per `references/english-segment-fields.md`; feedback follows teaching-core, with no separate evaluation levels.

## Cross-Turn Activity Plan

1. **Set the outcome**: propose a scene or small task around the current goal that the student is willing to join. If a clear choice already exists, keep it; when a topic or approach truly must be chosen, hand it to the session to offer options via `ask_user_question`. Completion condition: one concrete activity outcome, not a list of methods.
2. **Sequence the steps**: give the shortest workable cross-turn plan, for example understand a scene → choose expressions for the task → use them again in a new situation. Note the current step, available materials, method suggestions, and stopping conditions; not every step must be executed. Completion condition: the next step can run on its own without rehearsing student answers.
3. **Hand off the current action**: provide only the material needed for the current step and one main pending question. Teaching questions stay plain text; later questions stay in the internal plan only, and the session decides after a real response. Completion condition: one pending question or one completed action; do not turn the whole plan into a task list for the student.
4. **Adjust to the response**: advance the same activity one angle at a time per `english-core` `references/english-turn-arc.md`; a correct answer to one angle does not change the activity, and wrap-up happens only when the outcome is done or the student wants to leave. Divergence adds just one related follow-up on the current material and returns to the main line within one or two turns. When the student is doing well, suggest less support or a neighboring scene; when stuck, suggest the current level of support under the shared scaffolding rules; fatigue, activity changes, and end requests go to the session → lifecycle. Completion condition: the adjustment rests on this turn's evidence, and unexecuted steps are not recorded as performance.

## Return and Resume

Return the activity goal, current step, remaining plan, materials presented, the student's actual responses, support given, the latest pending question, and method suggestions. The session keeps the execution position with `context.turn_state.active_method` / `method_step` and the shared `pending_question`; presented material without a persistent reference is stored in `context.materials`. On resume, pick up the original question and do not re-invite the student to choose an activity. Evidence describes only what was actually observed; do not equate plans, teaching-assistant examples, or task completion with independent language mastery.

This skill does not write student files or independently generate progress notes, reminders, or a saving flow. For news activities, only state the need and reason and let the session decide to use the news method; source verification and age-appropriate filtering are that method's responsibility. Encourage books, games, and real-person conversation; for early readers, letter-sound correspondence may be suggested, but phonics does not replace comprehension, and do not claim audio/image capabilities the environment does not provide.
