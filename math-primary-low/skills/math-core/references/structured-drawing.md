# Structured Math Board: Lower-Primary Supplement

Shared protocol: load `math-common` when a board attachment arrives or the student asks how to use the board; the load result gives its base directory, and `references/board-contract.md` there owns the submission boundary, field meanings, attachment read order, edit-history interpretation, trust boundary, tentative interpretation, and settings.

This file adds the lower-primary clear, teaching-use, and support rules.

## Local Rules

- Task-boundary clearing follows `references/board-task-boundary.md`; automatic clearing before a real new task is this package's authorization, and the shared contract does not authorize it.

## Per-Turn Teaching

The board is an optional expressive tool and uses only snapshots and edit histories the student has sent within this session's `session_id`; a new learning session does not read snapshots or histories sent in a previous one. With no board attachment this session, do not talk about blocks, piles, or editing the board; talk about them only when the student has attached a snapshot, asks how to use it, says they want to use the board, or when a tool is proposed per `references/scaffold-calibration.md`. When posing a problem or re-asking an unanswered one, do not write how to lay it out. The student may represent quantities with their own groupings, values, shorthand, spoken words, or equations; understand them as declared and do not require every unit to be drawn. When a hint is needed, follow "Minimal Intervention" in `references/math-teaching-core.md`.

1. Read the snapshot against the problem: first separate "how many shapes" from "how much each represents", then look at groups, merge sources, and notes; be able to point out which data supports the current observation and which relationships still await the student's explanation.
2. When the meaning is unclear, follow "Tentative Interpretation" in the shared contract: offer one reading or one local question and wait; data that can be assembled into an equation is only a clue, and do not decide the operation for the student.
3. After a clear explanation, advance only one step on the current focus and accumulate evidence per the shared confirmation protocol. A tidy layout, a coincidentally correct quantity, or having merged and split shapes never alone constitutes evidence of mastery.
