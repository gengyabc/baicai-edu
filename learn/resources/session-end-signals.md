# Rule: Session End Signals

`/learn`, `/learn-feynman`, and subject skills use this rule to judge end, ambiguity, crisis, skip, and topic change. Classify every student message first, then decide whether to start new teaching. An end is written back by `learn-data`'s finalize; a topic change is written back by its `references/session-lifecycle.md`.

## 1. What is this message asking for

Look at intent. If it can be determined, execute that row; if the same message has two readings and fits no row below, confirm.

| Intent | Action |
|---|---|
| States or hints at self-harm, suicide, being hurt, being neglected, being bullied, being in danger, or not wanting to live | Stop teaching and respond per `references/llm-safety-boundaries.md`. Do not finalize; do not write details into the profile or log. |
| Wants to end today's practice | Finalize directly. This message stops here: no further teaching and no fabricated segment. Even if the student casually mentions what to learn later, still treat it as an end. |
| Wants to change learning content without specifying a target, asks what to learn, or doesn't know what to learn | Hand to the lifecycle recommendation gate, which loads `learn-recommend`; keep the current task until a choice is made, and do not finalize. |
| Has specified another learning topic and today's practice continues | First end the current topic as `interrupted` per the lifecycle; after a successful save, parse the new topic. |
| Doesn't want the current question: skip or change question, with no new topic and no wish to end | Swap in another question within the current small goal. A skip is not evidence of ability; the session continues. |
| Unclear whether "this question is done" or "end for today" | Ask one line with `ask_user_question`, with options `ui.end.finish_today` and `ui.end.continue_a_bit`. Finalize only if the end is chosen; if continue is chosen or the card is skipped, return to the current teaching. |
| Two consecutive replies that neither answer the current question nor follow the current topic | Ask with `ask_user_question` whether to stop for today, with options `ui.end.finish_today` and `ui.end.continue_a_bit`. If the student then chooses to end, treat it as ending today; otherwise return to the current teaching. Answer length alone does not decide the classification. |
| Working on the current question, or just one failure to follow the guidance | Go to step 2. For a single failure to follow, scaffolding follows `references/guidance-non-response-handling.md`; do not end here. |

## 2. While still working on this question, whether to wrap up

Look only at whether there is evidence for the current small goal.

- Already closed, or further practice would only repeat existing evidence: give a one-line stage summary and offer the stage choice via the lifecycle's current-mode menu (ordinary learning uses `learn-data`'s `references/next-step.md`). Completing a knowledge point is judged separately from ending today's learning; finalize only if the student chooses to end. For learn, closure means the student can explain the current goal and use it to solve similar problems; for feynman, it means the student can finish the explanation and answer follow-ups on key reasons, or the student explicitly says this explanation is done.
- Not yet closed: naturally give a next step per the lifecycle and wait for the student's response. Stage wrap-up is based on goal-completion evidence, and ending is based on the student's wishes; answer format and a fixed number of questions are not grounds for ending.
