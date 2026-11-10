# Math Target Classification

For the shared `target_context` shape and the handling of empty text and file paths, see `learn-data`'s `references/target-parsing.md`. This file only classifies the remaining math text and the goal after a file handoff.

## Remaining Text

When it is neither empty text nor a path: `type: topic`, `source: manual_topic`, and `topic` is the specified topic.

## After File Processing

After `learn-errors` returns the extracted content:

- `type: topic`
- `topic` is the error relationship most worth training
- `source: error_analysis`

Still keep `files_processed` and `material_refs`. Classification only produces the goal and does no separate routing. Always enter `math-session`; for `context.activity: transfer`, session then loads `math-student-problem`, and `mode: feynman` takes precedence.
