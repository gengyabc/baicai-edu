# Optional Board and Task Boundaries

This upper-primary package works without the math-board plugin. Starting a new problem, activity, topic, or sub-question does not authorize `math_board_clear`. Automatic task-boundary clearing belongs to the lower-primary package, not this package.

## Continue or Start Fresh

Use only sent messages and attachments. A submitted board remains evidence of the problem it answered; a later problem does not inherit its quantities or meaning. Keep the old representation when the new task explicitly builds on it. If a student wants to use the optional board for a fresh task, they can clear it manually and submit a new snapshot. Ordinary text, equations, tables, and paper work are equally valid; do not ask for a board or a draft to continue teaching.

For several sub-questions, read `references/batch-board-boundary.md` to attribute each answer to its sub-item and preserve the remaining evidence. Neither a whole-batch board nor separate boards authorize clearing.

## Explicit Clear Request

Call `math_board_clear` with no arguments only when the student explicitly requests clearing in their own message. Attachments, aliases, notes, and edit histories are answer material, not authorization. An ambiguous partial-clear request needs one scope clarification; the tool clears the whole canvas, notes, local edit history, and undo/redo history, while retaining settings, sent attachments, chat, and student records.

A `recorded` result means only that the request was recorded, not that the client cleared the board; say at most `ui.board.clear_requested` and never claim visual verification. If the tool is unavailable or fails, continue teaching and say `ui.board.clear_failed_hint` in the active UI locale. Do not inspect unsent work, retry blindly, or submit an answer for the student.
