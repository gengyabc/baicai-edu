---
name: learn-save
description: Save the current learning session. Use when the student explicitly asks to save progress, record this learning turn, or save a concrete learning plan.
---

# Save

Use only when the student explicitly asks to save. Do not call it automatically every turn, start teaching or diagnosis, load a subject skill, or touch raw files. Log preparation and write-back are performed by the shared lifecycle's save branch; this skill does not create a second writer.

## Prepare the Request

1. Load `learn-core` and `learn-data` (only the ones not yet loaded this session; reuse already loaded ones per `learn-core`'s "Load Once, Reuse After"). Confirm the current student and obtain the log per Read Snapshot; with no student, direct to `/learn-start` and stop. If a pending_transition exists, first recover the handoff per the data protocol; saving alone never starts a lesson automatically.
2. **Recover any unfinished commit first, then handle this turn's new save intent.** If the log already has a finalize_plan, replay/clean up the old plan; only after that succeeds, accept any extra explicit new plan or correction given in this turn. If there is no new content and this is merely a retry, report the old result and never append twice. A completed old marker does not mean this turn's new plan has been saved.
3. If the request refers to the current concrete learning_plan, use its snapshot authorization/validation and Finalize route in learn-data's `references/learning-plan.md`: no duplicate support_events, no fabricated student_requested_save. An unchanged already-durable revision is not a new save; a changed valid revision is saved even without performance. Keep the latest uncommitted task chain, and distinguish a displayed plan from successful durable saving. This branch does not activate a parked/terminal plan or start teaching. Otherwise, when there is an explicit neutral plan/correction, or this turn's `/learn-save` clearly refers to a concrete plan already formed: if a pure-support context exists and is uncommitted, keep the original session_id and write the confirmed content as support_events; an existing teaching log can also receive the events, without fabricating performance. If the log is already committed, finish cleanup first and then create a support log with a new session_id; with no log, also create a new one. Persist the event id first and reuse it on retry. If the student only says "save it" with an ambiguous referent and no formed plan, ask one question about what to save; do not infer sensitive content or invent a plan. Shape/correction rules follow `references/session-schema.md` and `references/finalize-session.md` in `learn-data`.
4. With no new support content: an uncommitted log keeps its identity and original entry_point; if already committed with no new content, report only the original result. With no log but real teaching performance that happened in the conversation, assemble one minimal segment (per Session Segments): source is save, fill mode/submode as actually used, leave unknown observations empty, and add no diagnosis. The lifecycle writes the new log first, with entry_point `learn-save` and a session_id generated per its Open Or Resume. If there is nothing to save, say so and stop.

## Final Save

Read and execute `references/finalize-session.md` from `learn-data`. After a successful save, end the original active loop; continuing to learn afterward opens a new log. Write the log events or performance successfully first, then enter the idempotency gate; if preparation fails, do not report it as saved.

On success, reply with one sentence matching the actual content: subject learning record, general-task progress, or learning plan saved. For an empty no-op, say there is no long-term record to summarize, and do not write temporary emotions as a lasting plan; on commit failure keep the log so it can be retried, and if only cleanup fails, report it separately per finalize.
