# Structured Math Board: Upper-Primary Supplement

Shared protocol: load `math-common` when a board attachment arrives or the student asks how to use the board; the load result gives its base directory, and `references/board-contract.md` there owns the submission boundary, field meanings, attachment read order, edit-history interpretation, trust boundary, tentative interpretation, and settings.

This file adds the grade 4–6 clear, teaching-use, representation, and batch rules.

## Geometry Snapshot Boundary

For a `geometry-board` attachment, follow the shared board contract before replying: read the submitted read-only snapshot separately from quantity data and use only student-authored statements. It has no geometry edit-history attachment. Do not infer or judge lengths, angles, parallelism, perpendicularity, equality, collinearity, appearance, or correctness from it. If its meaning is unclear, ask one question about the student's explanation. The quantity-board steps below do not apply to geometry and no clear request is displayed on the geometry tab.

## Local Rules

- In grades 4–6 the board may carry equal groups, arrays, or a declared part-whole relationship. It stores valued shapes, groups, and notes, not a general drawing surface: arbitrary bars, number lines, continuous areas, coordinates, and fractional values are not native primitives. Use words, a table, or a paper diagram when those better express the relationship; do not treat position or shape size as measurement. The same reading rules apply: values are declared by the student, a grouping is a stated structure, and the operation or relationship is still the student's to explain. When a board step could be either a stated structure or an accidental layout, ask one question instead of deciding.
- Tables are an equally valid representation.
- Starting a new problem, activity, topic, or sub-question never authorizes a clear; `references/board-task-boundary.md` keeps the explicit-request rule.
- When the student submitted a board for a multi-part exercise, `references/batch-board-boundary.md` decides whether the canvas is a fresh board for a new sub-question or a continuing draft.

## Per-Turn Teaching

The board is an optional expressive tool and uses only snapshots and edit histories the student has sent within this session's `session_id`; a new learning session does not read snapshots or histories sent in a previous one. With no board attachment this session, do not talk about blocks, piles, or editing the board; talk about them only when the student has attached a snapshot, asks how to use it, says they want to use the board, or when a tool is proposed per `references/scaffold-calibration.md`. When posing a problem or re-asking an unanswered one, do not write how to lay it out. The student may represent quantities with their own groupings, values, tables, shorthand, spoken words, or equations; understand them as declared and do not require every unit to be drawn. When a hint is needed, follow `references/scaffold-calibration.md`.

1. Read the snapshot against the problem: first separate "how many shapes" from "how much each represents", then look at groups, merge sources, and notes; be able to point out which data supports the current observation and which relationships still await the student's explanation.
2. When the meaning is unclear, follow "Tentative Interpretation" in the shared contract: offer one reading or one local question and wait; data that can be assembled into an equation is only a clue, and do not decide the operation for the student.
3. After a clear explanation, advance only one step on the current focus and accumulate evidence per the shared confirmation protocol. A tidy layout, a coincidentally correct quantity, or having merged and split shapes never alone constitutes evidence of mastery.
4. When the student submitted a board for a multi-part exercise, the batch boundary in `references/batch-board-boundary.md` decides whether the canvas is a fresh board for a new sub-question or a continuing draft.
