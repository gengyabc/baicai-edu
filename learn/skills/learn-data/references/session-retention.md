# Session Retention

## Policy

- `profile.json.session_history` keeps only the most recent 5 summary-level sessions.
- `profile.json.error_history` keeps the most recent 20 entries, newest first.
- Older sessions are condensed into milestones, not kept verbatim.
- Long-term progress lives in `outputs/students/<student_id>/<subject>/milestones.json`.

## Rules

1. Keep recent sessions that help immediate follow-up.
2. Merge repeated sessions by focus.
3. Promote stable gains, stage changes, and topic mastery into milestones.
4. Keep milestones compact, ordered by `importance` (`high` > `medium` > `low`) then recency.
5. Limit milestones to 20 items.
6. Keep the per-turn record in `session_log.json`, not in `session_history`; `session_history` is written once per finalized session.
7. Clear `session_log.json.segments` after finalize.

## Milestone Signals

- strategy stage changes
- topic mastery
- repeated success across the same focus
- a clear performance jump after prior struggle
