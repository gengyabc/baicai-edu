---
cited: learn-data/references/next-step.md
---

# Next Step

Ordinary learning continues naturally from the response; one answer is not one end decision. Inputs: the latest segment, subject, focus, the student's performance this turn, and memory's `recommended_next_moves`, `motivation_signals`, `feynman_readiness` (field locations in profile-schema).

## Choose

1. From this turn's successes and unresolved points, choose one goal: stabilize, vary, connect, or lightly abstract.
2. Generate one `next_step` and 1-3 `recommended_targets`, preferring memory; the student's explicit goal takes priority.
3. When the current goal still awaits practice or confirmation: directly give one teaching next step and wait; if a pending question is still there, continue with it.
4. When the goal is closed, or the student actively asks what to do next: use `ask_user_question` to present the base menu and the current subject's `stage_options` merged together.
   - An extra option contains `label`, `action` (subject action), and optional `description`; `label` and `description` are locale keys resolved to display text at presentation time (see `references/ui-locale.md`), and the option is return metadata that does not log a separate teaching segment.
   - The base menu keeps `ui.stage.continue`, `ui.stage.feynman`, `ui.stage.end`, plus `ui.stage.switch_content`; only when `ui.stage.switch_content` is selected is `learn-recommend` loaded, and a content list is not expanded directly at every closure.
   - When the merged total exceeds 6 items, the first card keeps the four base options and folds the subject extras under `ui.stage.more_activities`; after it is selected, a second card shows all the extras plus `ui.stage.back`, without dropping any action.
   - Grade only adjusts wording and task difficulty and does not trim stage options.
   - When the end intent is ambiguous, switch to the confirmation menu specified by the end signals.
5. `feynman_readiness` only decides whether the Feynman option is marked recommended (`ui.recommend.badge`) and the scaffolding difficulty after entering; with `not_ready` it is shown as usual but not marked recommended, and the explanation difficulty is lowered after the student chooses it.
6. In an ordinary stage choice, if the student says "whatever" or "anything works" or skips the options, pick the most suitable step and execute it directly; this does not automatically change the target. Explicit delegation, skips, and empty messages on a learning recommendation card are handled per `learn-recommend`. When the student actively asks what to learn, doesn't know what to learn, or wants to change content, go straight to recommendation without first going through the stage card.

## Apply Choice

If the student has already chosen an action, execute it without asking again whether to continue. Base actions follow Dispatch and Finalize Or Switch Topic in `references/session-lifecycle.md`; extra options are handed back by `action` to the current subject's main skill, with sub-skills and parameters determined by the subject, and transfer state persisted uniformly by the entry. When the student directly types a synonymous request, the subject recognizes it too, and no re-click is required.

## Turn Exit

Before each ordinary learning reply is complete, the entry settles one exit the student can act on:

- When the goal is not closed, pose one concrete teaching question and wait;
- When the goal is closed, present the stage choice above with `ask_user_question` in the same turn;
- When the student has chosen or explicitly specified the next task, route and execute directly.

`next_step_candidate`, method summaries, and "next time you could..." are only internal candidates, and must be settled as a current question, a choice card, or a connected task to count as a completed handoff.

If the previous reply had only a summary and no pending question or stage choice, when the next empty message arrives, add the exit based on existing evidence; if there is a pending question, briefly re-present it. An empty message adds no learning performance and is not treated as an end.

Ordinary teaching advances only one main next step; explicit learning recommendation may present multiple candidates and mark a single preferred one, but after selection it still learns one small goal at a time. The end judgment relies on the specific goal and the student's wishes, and "already learned a lot" does not substitute for evidence.
