# Math Target Classification

For the shared `target_context` shape and the handling of empty text and file paths, see `learn-data`'s `references/target-parsing.md`. This file only classifies the remaining math text and the goal after a file handoff.

## Remaining Text

For nonempty, non-path text: `type: topic`, `source: manual_topic`; `topic` keeps the student's mathematical theme/meaningful wording, not a graph ID. Keep requested action separate: preserve explicit learning, practice, or discovery requests in `target_context.intent`, not the topic name.

Classify only when lifecycle already resolves a target. On a restored task or a same-goal action change, session reads the latest message and pending step directly; do not reparse the goal or create a new `scope_id`. `intent` is an input clue, not a micro-lesson switch: session decides from the goal, request, evidence, and pending task. Preserve any original intent already carried by errors or attachments; system recommendation reasons do not replace it. A candidate's optional `math_opening_hint` stays temporary and advisory under the recommendation contract.

## After File Processing

After `learn-errors` returns the extracted content:

- `type: topic`
- `topic` is the error relationship most worth training
- `source: error_analysis`

Still keep `files_processed` and `material_refs`. Classification only produces the goal and does no separate routing. Always enter `math-low-session`; for `context.activity: transfer`, session then loads `math-low-student-problem`, and `mode: feynman` takes precedence.
