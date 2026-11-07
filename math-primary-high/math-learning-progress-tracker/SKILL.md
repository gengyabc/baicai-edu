---
name: math-learning-progress-tracker
description: Track evidence of grades 4–6 math understanding across sessions, distinguish independent from assisted success, recommend spaced review or next challenges, and export a privacy-conscious portable learning state without requiring a database.
---
# Math Learning Progress Tracker

Read [references/state-schema.md](references/state-schema.md) when producing, merging or interpreting a progress note. Tracking is **observational**, not an IRT/BKT score or clinical assessment.

## Inputs

`session_date`, `topic_id`, `goal`, `task_ids`, `student_responses_or_parent_summary`, `hint_levels`, `observed_strategy`, `independence`, `transfer_result`, `confidence_self_report`, `fatigue`, `previous_state_note`, `privacy_preference`.

Accept partial inputs; unknown stays `unknown` rather than false or zero. If the child/parent has not supplied previous notes, initialize an empty state; do not claim cross-session memory.

## Evidence protocol

1. Log each activity's learning target, **observed response** and support given. Preserve mistakes as diagnostic signals, not character traits.
2. Evaluate five distinct axes using qualitative evidence: `calculation`, `concept`, `reasoning`, `representation`, `transfer`. Use `not_observed`, `needs_support`, `emerging`, `independent` only where evidence exists.
3. Mark the distinction between correct after a hint and correct **on a new independent task**; only the latter supports an `independent` status. Avoid aggregation into a fake total-score.
4. Route next action: same misconception → revisit prerequisite/representation; assisted success → faded support; independent near-transfer → interleave review; independent varied transfer → extend.
5. Suggest review intervals as editable heuristics (e.g. next day, 3–4 days, 1–2 weeks) and bring review earlier if the child struggled. These are scheduling suggestions, not scientifically calibrated intervals for this child.
6. Give concise parent feedback: confirmed progress, open uncertainty, next 10–20-minute activity, and a copyable state update.

## Data handling

Minimize personal data. Prefer pseudonym or no identity. Never require name, school, birth date, address or sensitive records. Persist only when the parent explicitly chooses to save or paste the state note; avoid invented records or backfilled dates.

References: [EEF evidence-informed mathematics guidance](https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3/).
