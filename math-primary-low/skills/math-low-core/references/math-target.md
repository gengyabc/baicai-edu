# Math Target Classification

For the shared `target_context` shape and the handling of empty text and file paths, see `learn-data`'s `references/target-parsing.md`. This file only classifies the remaining math text and the goal after a file handoff.

## Remaining Text

When it is neither empty text nor a path: `type: topic`, `source: manual_topic`, and `topic` is the student's mathematical theme, keeping their meaningful wording rather than a graph ID. Separate theme from action: “教我等号是什么意思，我没学过” has topic “等号是什么意思”; its explicit new-learning request may be kept verbatim in `target_context.intent`. “给我等号练习” and “我想自己探索等号” share a theme but different requested actions; do not encode those actions as topic names.

Classify only when lifecycle already resolves a target. On a restored task or a same-goal action change, session reads the latest message and pending step directly; do not reparse the goal or create a new `scope_id`. `intent` is an input clue, not a micro-lesson switch: session decides from the goal, request, evidence, and pending task. Preserve any original intent already carried by errors or attachments; system recommendation reasons do not replace it. A candidate's optional `math_opening_hint` stays temporary and advisory under the recommendation contract.

## After File Processing

After `learn-errors` returns the extracted content:

- `type: topic`
- `topic` is the error relationship most worth training
- `source: error_analysis`

Still keep `files_processed` and `material_refs`. Classification only produces the goal and does no separate routing. Always enter `math-low-session`; for `context.activity: transfer`, session then loads `math-low-student-problem`, and `mode: feynman` takes precedence.
