# Structured Math Board: Lower-Primary Supplement

Shared protocol: load `math-common` when a board attachment arrives, the student asks how to use the board, or the teacher will supply a board reference; the load result gives its base directory, and `references/board-contract.md` there owns the submission boundary, field meanings, attachment read order, edit-history interpretation, trust boundary, tentative interpretation, and settings.

This file adds the lower-primary clear, teaching-use, and support rules. Teacher references follow **Teacher Reference** in the shared contract. Geometric figures follow **Teacher Geometry Demonstration** there: geometry-related teaching and geometry problems call `geometry_board_draw` so the related figure is on the Teacher demo tab, and they enter the student geometry draft only when the student copies them. The submitted-board limits below concern student work, not that separate read-only reference. The quantity and geometry tabs do not show it, and it is not a student-board task boundary or clear request.

## Local Rules

- Task-boundary clearing follows `references/board-task-boundary.md`; automatic clearing before a real new task is this package's authorization, and the shared contract does not authorize it.

## Per-Turn Teaching

The board is an optional expressive tool. Use only submitted snapshots, never an unsent board; interpret edit history only from the current message, without chaining earlier attachments into a total process. A new learning session does not read snapshots or histories sent in a previous one. With no board attachment this session, do not talk about blocks, piles, or editing the board; talk about them only when the student has attached a snapshot, asks how to use it, says they want to use the board, or when a tool is proposed per `references/scaffold-calibration.md`. When posing a problem or re-asking an unanswered one, do not write how to lay it out. A Teacher demo figure is separate: geometry-related teaching and geometry problems still call `geometry_board_draw` and say the figure is on the Teacher demo tab. The student may represent quantities with their own groupings, values, shorthand, spoken words, or equations; understand them as declared and do not require every unit to be drawn. When a hint is needed, follow "Minimal Intervention" in `references/math-teaching-core.md`.

For a geometry snapshot, first read its submitted attachment separately and follow the shared read-only geometry boundary: use only the student's statements, make no geometric judgments, and do not interpret it as a quantity board or infer edit history. The steps below concern quantity snapshots only.

1. Read the snapshot against the problem: first separate "how many shapes" from "how much each represents", then look at groups, merge sources, and notes; be able to point out which data supports the current observation and which relationships still await the student's explanation.
2. When the meaning is unclear, follow "Tentative Interpretation" in the shared contract: offer one reading or one local question and wait; data that can be assembled into an equation is only a clue, and do not decide the operation for the student.
3. After a clear explanation, advance only one step on the current focus and accumulate evidence per the shared confirmation protocol. A tidy layout, a coincidentally correct quantity, or having merged and split shapes never alone constitutes evidence of mastery.
