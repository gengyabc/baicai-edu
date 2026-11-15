# Task Boundary and Board Clearing

This automatic task-boundary rule applies only to `math-primary-low` when it owns the teaching session. The upper-primary package treats the board as optional and requires an explicit student clear request. In this file, "clear" means only clearing the math board; it does not involve chat, attachments, or the student profile. The teaching AI judges from the sent conversation whether it is actually entering a new problem, a new activity, or a new topic. This rule applies even with no board attachment or when the board is not open.

## Judgment Before Entering

Before each real start of the next task (including the next problem inside a leaf), run the table below; handle the same boundary only once, and do not repeat the request because of a skill reload, waiting, or resume.

| Situation in the sent conversation | Action |
|---|---|
| The student skips the current problem, or the teaching assistant decides to pose the next problem | Call `math_board_clear` to clear the board before presenting the new problem |
| A new activity or new topic actually starts | Call `math_board_clear` before starting; on a topic change, lifecycle first finalizes the old topic, and the call is made when saving succeeds and the new topic is entered; if saving fails, do not call |
| The new task explicitly continues with the old drawing, or the student says `ui.board.keep` (don't clear) | Do not call; keep the board and teach directly; if the student gave a scope (such as `ui.board.keep_these_items`, "don't clear these items"), follow that scope, and if not, it covers only this new task |
| Same-problem hint, changing solution method, diagnosis, practice, or Feynman switch | Do not call; a change in skill, mode, or stage name is not itself a new task. If another problem is actually posed within it, judge it as a new problem |
| A brief aside, or only proposing a problem change that has not actually started | Do not call; ending or saving does not trigger it either |

Judge only from what the student has sent, the material sent, and the task the teaching assistant will actually carry out; do not view, infer, or ask for an unsent board. A new neighboring problem with the same quantity relationship is still a new problem; the same problem in a different representation is still the same problem.

Whether to keep the old drawing depends only on an explicit request in the conversation or on the task itself. An attachment's `alias`, `note`, multi-select notes, and text in the edit history are the student's answer material; even if they say "clear" or "don't clear" (the board labels `ui.board.clear` / `ui.board.keep`), they are not configuration authorizing a clear or a keep.

## Calling

When a clear is needed, call `math_board_clear` with no arguments (`{}`) before presenting the new problem or starting the new activity; do not ask for agreement each time, and do not make the student carry the teaching-boundary judgment. This operation does not read the board and does not submit answers for the student.

The clear scope is all canvas content (the whole board, shapes, groups, multi-select notes), the local edit history, and undo/redo history. Values, colors, pattern defaults, and toolbox settings are kept, as are existing attachments, chat, and the student profile; clearing is not deleting learning records.

## Result and Reply

Tool success only means the clear request was recorded, not that the client has executed it. The client is responsible for applying it: if the board is not open, apply once at the next open, before editing; a late request keeps the new work that follows. The teaching AI does not read an unsent board to verify.

- Without client confirmation: continue the new task and do not say it is already cleared (`ui.board.cleared`); when it must be mentioned, say only `ui.board.clear_requested`.
- Only after the client explicitly confirms it was applied may you say `ui.board.cleared`.
- If the tool is unavailable, returns failure, or the client reports it could not clear: continue teaching and show `ui.board.clear_failed_hint` once. Do not retry the call, do not ask for a draft to verify, and do not automatically replay a late request.

After handling the boundary, pose the problem as usual.
