---
name: learn-save
description: Save the current learning session. Use when the student explicitly asks to save progress, record this learning turn, or save a concrete learning plan.
resources: llm-safety-boundaries.md session-lifecycle.md teaching-transition.md session-schema.md finalize-session.md learning-plan.md
resource-loading: on-demand
---

# Save

Use only when the student explicitly asks to save. Do not call it automatically every turn, start teaching or diagnosis, load a subject skill, or touch raw files. Log preparation and write-back are performed by the shared lifecycle's save branch; this skill does not create a second writer.

## Prepare the Request

1. Load or reuse `learn-core` and `learn-data` per "Load Once, Reuse After". Read references from their owner's returned base. On a crisis cue, apply `learn-core`'s `references/llm-safety-boundaries.md` instead of saving. Read `learn-data`'s `references/session-lifecycle.md` (Snapshot, Open or Resume, Finalize) and confirm the student/log per Read Snapshot; with no student, direct to `/learn-start` and stop. If a pending_transition exists, first recover it per `learn-data`'s `references/teaching-transition.md`. Saving alone never starts a lesson automatically.
2. **Recover any unfinished commit first, then handle this turn's new save intent.** If the log already has a finalize_plan, replay/clean up the old plan; only after that succeeds, accept any extra explicit new plan or correction given in this turn. If there is no new content and this is merely a retry, report the old result and never append twice. A completed old marker does not mean this turn's new plan has been saved.
3. For plan/correction preparation, read `learn-data`'s `references/session-schema.md` (support events) and `references/finalize-session.md` before writing. Choose the branch:
   - **Current concrete learning plan:** when the request clearly refers to the current concrete learning_plan, read `learn-data`'s `references/learning-plan.md`, apply snapshot authorization/validation and Finalize: no duplicate support_events or fabricated student_requested_save. Save a changed valid revision even without performance; an unchanged durable revision isn't a new save. Preserve the latest uncommitted chain; distinguish display from durable save. Never activate a parked/terminal plan.
   - **Explicit neutral plan or correction:** if a pure-support context exists and is uncommitted, keep its session_id; an uncommitted teaching log can also receive support_events without fabricating performance. If committed, finish cleanup first; if committed or absent, create a support log with a new session_id. Persist the event id and reuse it on retry.
   - **Ambiguous referent with no formed plan:** ask what to save once; do not infer sensitive content or invent a plan.
4. With no new support content: an uncommitted log keeps its identity and original entry_point; if already committed with no new content, report only the original result. With no log but real teaching performance that happened in the conversation, assemble one minimal segment (per Session Segments): source is save, fill mode/submode as actually used, leave unknown observations empty, and add no diagnosis. The lifecycle writes the new log first, with entry_point `learn-save` and a session_id generated per its Open Or Resume. If there is nothing to save, say so and stop.

## Final Save

Read and execute `references/finalize-session.md` from `learn-data`. After a successful save, end the original active loop; continuing to learn afterward opens a new log. Write the log events or performance successfully first, then enter the idempotency gate; if preparation fails, do not report it as saved.

On success, reply with one sentence matching the actual content: subject learning record, general-task progress, or learning plan saved. For an empty no-op, say there is no long-term record to summarize, and do not write temporary emotions as a lasting plan; on commit failure keep the log so it can be retried, and if only cleanup fails, report it separately per finalize.

This skill's base directory holds every file it names: a `references/<name>.md` path below is the installed `<name>.md` beside that base directory, because an installed skill keeps no `references/` folder for prose. Locale catalogs do keep theirs, at `references/locales/<locale>.json`.
