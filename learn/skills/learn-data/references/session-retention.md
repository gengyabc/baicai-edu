# Session Retention

## Policy

Counts and ordering are specified only here.

- `profile.json.session_history` keeps only the 5 most recent session summaries, newest at index 0.
- `profile.json.error_history` keeps only the 20 most recent, newest first.
- `learning_state.priority_targets` holds at most 5 entries. Strings or objects are both allowed; for wrong-answer analysis, prefer objects.
- `milestones` holds at most 20 entries. Sort first by `importance` (`high` > `medium` > `low`), then by time, newest to oldest.
- Earlier sessions are compressed into milestones and not kept verbatim.
- Long-term progress is in `outputs/students/<student_id>/<subject>/milestones.json`.
- memory.general_progress keeps the 20 most recent items, in descending date order, deduped by session_id + scope_id; it is not compressed into specialist milestones.
- memory.learning_support_memory.plans keeps the 10 most recent items, in descending date order, deduped by id; observations keeps the 10 most recent, preferring to remove superseded entries that have been corrected. Over the limit, no psychological labels are synthesized; these are not a longitudinal research record.

## Rules

1. Keep recent sessions useful for the immediate follow-up.
2. Merge repeated sessions with the same focus.
3. Promote stable progress, stage changes, and topic mastery to milestones.
4. Turn-by-turn records live in `session_log.json`, not in `session_history`; `session_history` gets one entry per finalize.
5. After finalize, clear `session_log.json.segments`.

## Milestone Signals

- Strategy stage change
- Topic mastery
- Repeated success on the same focus
- A clear leap after earlier being stuck
