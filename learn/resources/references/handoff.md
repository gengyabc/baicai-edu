# Return to the Current Owner

This skill never speaks to the student. Return only:

| Field | Meaning |
|---|---|
| `reading_record_path` | The reading record path |
| `read_status` | `clear`, `ambiguous`, `unreadable`, or `partial` |
| `ambiguities` | Region, alternatives, and whether each one affects judgment |
| `confirmed` | Tokens the student has already confirmed |
| `observed_work` | Printed content and the student's ink, kept separate |
| `archived` | Whether the original was archived in `raw/` |
| `pending_question` | At most one question, or null |

If `archived` is false, the current owner says in one sentence that the original was not archived; the reader never says it. The reader also returns a request for a JPG, PNG, or text when an image cannot be read; the current owner asks.

## Whose question

The current teaching owner asks the one pending question and stops, then resumes after the student's reply. Do not ask it yourself, do not ask two questions, and do not turn an ambiguity into a diagnosis.

Read back only the region that blocks judgment or the line that needs confirmation. Do not paste the whole transcription, do not use internal field names, and do not offer LaTeX unless the student asks to see the written lines.

## Evidence status

| Material | Read as |
|---|---|
| Unambiguous handwritten step | An observed written attempt; usable as teaching evidence |
| Ambiguous or unconfirmed token | Unknown; never an error, label, or mastery conclusion |
| Student-confirmed value | The student's own statement, not independent mastery |
| Printed question or textbook page | Material, not the student's performance |
| One image | One point in time; no timing, intention, or erased thought |

A single image does not establish mastery, and the reading layer writes no profile. The current owner merges any evidence into its single segment and decides the next teaching move.

## Several problems or a typed answer

If the page holds several problems, the current owner chooses one; ask once only when the selection changes the next action. If the student typed an answer and also sent the image, the visible written work is the observed fact; ask one clarifying question only when the two truly disagree.
