# Math Target Classification

For the shared `target_context` shape and the handling of empty text and file paths, see `learn-data`'s `references/target-parsing.md`. This file only classifies the remaining math text and the goal after a file handoff.

## Remaining Text

When lifecycle is already resolving a goal and the remaining input is neither empty text nor a path: `type: topic`, `source: manual_topic`, and `topic` is the mathematical topic, separated from the requested action. Retain an explicit new-learning, practice or self-derivation request verbatim in `target_context.intent`; identical topics may require different actions. A bare topic establishes neither a teaching request nor mastery.

Keep the student's key topic wording; do not normalize it into a topic-map id in `target_context`. Preserve any original intent already saved by error/material processing; a generated recommendation reason never replaces student intent. Classification supplies clues, not permission to reveal or an activity decision. On a restored same-goal task, session uses the latest message and pending step without reparsing the target or creating a new `scope_id`. Map ids are used inside `math-high-core` and by `references/strategy-diagnosis-rules.md` when checking prerequisites, not as something shown to the student.

## After File Processing

After `learn-errors` returns the extracted content:

- `type: topic`
- `topic` is the error relationship most worth training
- `source: error_analysis`

Still keep `files_processed` and `material_refs`. Classification only produces the goal and does no separate routing. Always enter `math-high-session`; for `context.activity: transfer`, session then loads `math-high-student-problem`, and `mode: feynman` takes precedence.

For a handwritten photo, scan, or ink that the entry has already had extracted, the classification keeps the transcribed problem text in the extracted file and sets `topic` to the quantity relationship it exercises; the reader source keeps the transcription and uncertainty notes, and no corrected equation is written back into the target.
