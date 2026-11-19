# Informed full-solution choice

Load when the student explicitly requests a complete answer, proof, worked solution, finished response, or generated exercise answer key. A request for help or a scope confirmation alone does not trigger this branch. Recommend guidance while preserving an informed choice.

## Warn and wait

Before revealing, use `ui.solution.warning` to explain the tradeoff: seeing a full solution removes this opportunity for independent discovery and does not establish independent mastery; it does not imply permanent harm or inability.

Resolve copy through `learn-data`'s UI locale protocol. Use `ask_user_question` with `ui.solution.question` and two options: `ui.solution.guided` first, suffixed with `ui.recommend.badge`, and `ui.solution.full`. Stop and wait; append neither a solution nor a new exercise. If the tool is unavailable, give the same warning and plain-text choice without claiming a card appeared.

## Honor the decision

- **Guidance:** resume the original task with one reachable step.
- **Full solution:** after an explicit choice following the warning (clicking or equivalent custom text), supply the verified full solution labeled as teacher-provided, without requiring an impasse, failed attempts, repeated warnings, or a compulsory follow-up exercise. If the same-task warning has already been shown and the student now insists, honor it without another card.
- **No clear choice:** an ambiguous “yes”, silence, skip, or delegation such as “you decide” does not authorize the full solution. Preserve guidance without nagging or reopening a skipped card.

## Preserve task and evidence boundaries

Keep only the task-bound warning/choice in the existing `context.turn_state` per `learn-data`'s session schema. Preserve the question and student work while waiting. Restore a pending choice only for the same task; clear it on task change, cancellation, or return to guidance. Confirmation is not blanket permission for later tasks. Safety, end, and save-recovery gates take priority.

A warning, choice, or teacher-only full solution has no performance segment and grants no confirmed skill. Work after exposure is reconstruction or supported work unless fresh evidence establishes independent application. Delivering the solution does not require a new task or stage menu.

Completion: preserve the guided task or honor the explicit same-task decision once; no solution is revealed on the first unconfirmed request.
