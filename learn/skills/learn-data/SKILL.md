---
name: learn-data
description: Student data read/write protocol. Load before reading or initializing profiles, restoring sessions, generating learning records, modifying data, or end-of-session save.
user-invocable: false
---

# Learn Data

Protocol for reading, initializing, and saving student data. All `references/...` paths in this skill are relative to this skill's directory; for cross-skill files, load that skill by name first and locate files from the base directory it returns. This lookup rule applies to every skill in every package.

## Data Root

All paths are relative to the **current workspace root**; use the path separator of the local OS. Use whatever file tools the current environment provides; when a terminal is needed, choose commands for the actual OS and shell.

```
data/students/
  <student_id>/
    <subject>/raw/                 # user-dropped originals (error-item sets, materials, drafts, etc.)

outputs/students/
  session.json
  <student_id>/
    profile.json
    <subject>/
      profile.json
      memory.json
      current_state.json
      milestones.json
      session_log.json
      extracted/
      backups/raw/
```

- `student_id` looks like `stu_<slug>_<4hex>`; `slug` contains only `[a-z0-9_]`, and `4hex` is 4 characters of `[0-9a-f]`.
- Discover students by matching `outputs/students/*/profile.json`; do not use an index file.
- Contents of `data/.../raw/` are read-only; the only permitted change is renaming after a successful backup, following the `learn-errors` rules.
- `outputs/.../backups/raw/` is append-only; `extracted/` holds analysis Markdown written by the system.

## Read Snapshot

Read session.json first. If it contains pending_transition, run `references/teaching-transition.md` before initializing target files or doing ordinary restore, so the source authorization and target context are restored in a directed way; do not just start the new subject with defaults. The snapshot is read once by the entry skill: at session start, after context recovery when the snapshot is missing, or when switching student/subject. Subject skills always use the snapshot passed in by the entry; this applies to all subject skills and is not repeated elsewhere.

- Re-read an individual file only when it is missing from context, the entry switched student or subject, a pending save or transition must be recovered, or the cached copy may be stale after an external write. Do not re-read the whole snapshot for an ordinary turn.
- `references/...` files follow the same rule per `learn-core`'s "Load Once, Reuse After": after one read in the session they stay in context, and the Reading by Scenario table below selects only what is still unread for this turn.

1. `outputs/students/session.json`
2. `outputs/students/<student_id>/profile.json` (shared profile)
3. `outputs/students/<student_id>/<subject>/profile.json` (subject profile)
4. `outputs/students/<student_id>/<subject>/memory.json`
5. `outputs/students/<student_id>/<subject>/current_state.json`
6. `outputs/students/<student_id>/<subject>/milestones.json`
7. `outputs/students/<student_id>/<subject>/session_log.json`

UI locale: resolve student-visible process labels per `references/ui-locale.md` (read `language` from the shared profile; skills name locale keys, not literal strings).

When a file is missing:

- `session.json` missing or `student_id` empty: tell the student to run `/learn-start` first.
- Shared profile missing: hand off to `/learn-start` to create it; never fabricate one.
- Subject `profile.json` missing: after confirming the shared profile exists, first read `references/teaching-resolver.md` to resolve teaching, then initialize per `references/profile-schema.md`; read `references/grade-band-defaults.md` for stage, and read the resolved implementation's subject contract (`references/subject-contract.md`) for default domains, initial levels, and preference keys. For generic or unknown starting points, current_levels/preferences are empty; do not initialize an adult with a primary-school level. Always keep existing subject files.
- `memory.json` / `current_state.json` / `milestones.json` missing: create them with the defaults in `references/profile-schema.md`.
- `session_log.json` missing (the read tool returns `not found`) is a normal state meaning there is no unfinished session; create it per `references/session-lifecycle.md` when needed. Report a read fault and stop operations that depend on the file only for permission, I/O, or content-corruption errors.

After reading:

- First filter the snapshot's evidence sources per `references/teaching-resolver.md`; generic progress does not count as specialist mastery, and the real identity and scope_id are preserved. Shared learning_preferences serve only as the student's explicit goal/preference input; before using historical support facts, check their context and corrections. Keep the snapshot in memory. After a successful write-back, update the cached object in sync; when unsure the cache is valid, re-read only the affected files. Ordinary turns and mode switches do not re-read the whole snapshot.
- Hand personalization inputs to the teaching skill: the shared profile's `personal.interests` and `personal.most_exciting_event`, and the subject profile's `profile.preferences` and `profile.self_report.easy_topics/hard_topics`.
- Use `memory.json` fields `preferred_scaffolds`, `motivation_signals`, `recent_error_patterns`, `recommended_next_moves`, and `feynman_readiness` as described in "How Memory Is Consumed" in `references/profile-schema.md`; any field you write must also be read and used.

## session.json

```json
{
  "student_id": "stu_li_ming_a7b2",
  "subject": "subject_id",
  "last_active": "2026-10-04T12:00:00Z",
  "session_started_at": "2026-10-04T11:30:00Z"
}
```

- `subject` is the real subject or neutral task id written by the entry skill; identity rules follow `references/teaching-resolver.md`. The session may optionally carry `scope_id`, `target_title` (a student-recognizable description of the target), and `teaching`; they are written after the first target is chosen, restore prefers the log context, and they may be absent if no target has been chosen. Missing fields in old files are not migrated; a new target gets a new scope_id, and the same unfinished target keeps its existing one. A cross-subject switch first saves the old subject successfully, then activates the new identity by rewriting the whole file; old logs and plans stay under the original subject and are not moved.
- When switching student or subject, overwrite the whole file. In the transitional state where a subject is chosen but no student yet, `student_id` is `null`; treat it as empty when reading and guide the student to `/learn-start`.

## Create Student

After `/learn-start` has collected and confirmed the new student's information, read and execute `references/create-student.md`. For an existing student, only fill in the missing files specified in Read Snapshot and keep existing learning evidence.

## Write Protocol

On every write:

1. Read the full file (use the template if it does not exist).
2. Merge in memory: merge objects recursively and keep unmentioned fields; replace or prepend arrays as the workflow requires, with no implicit deduplication.
3. Set `updated_at` to the current ISO time.
4. Write complete, valid JSON with no comments.
5. In the reply, only say "saved" or give a summary.

Writers (no mixed writes):

- **Shared** `outputs/students/<id>/profile.json`: name, grade, `personal`, optional education_stage / learning_context / learning_preferences. Written only by Create Student, `/learn-start`, and `/learn-profile`; never change `student_id` or `created_at`.
- **Subject** `profile.json`, `memory.json`, `current_state.json`, `milestones.json`: written by finalize, `/learn-profile`, and `learn-errors`. Merge details (prepend, dedupe, truncate, nesting location) follow `references/finalize-session.md` and `references/session-retention.md`.
- **Log** `session_log.json`: written only by `references/session-lifecycle.md` and finalize.

Writes to the same file are serialized. When the log has a pending `finalize_plan`, first recover and save per `references/finalize-session.md`, then edit the profile or write back error items.

## Reading by Scenario

| Scenario | Read |
|---|---|
| `/learn`, `/learn-feynman` start/resume, mode switch, topic change | `references/session-lifecycle.md` |
| Parse a target, file handoff | `references/target-parsing.md` |
| Locate the subject skill and subject fields by subject | `references/subject-contract.md` |
| Produce or consume a segment, write the log | `references/session-schema.md` (no need to read the full `references/profile-schema.md` every turn) |
| Give the next step in ordinary learning | `references/next-step.md` |
| Learning-content recommendation or restoring pending candidates | Load `learn-recommend`; temporary state is in `references/session-schema.md`, written to the log only by the lifecycle, and produces no teaching segment |
| Create/change/restore a prerequisite learning plan or save its task-chain snapshot | `references/learning-plan.md`; owner semantics stay in the current teaching implementation, and lifecycle/finalize remain the only log and persistence writers |
| End or manual save | `references/finalize-session.md`, `references/session-retention.md` |
| Student-visible process labels (stage menus, confirmations, recommendation chrome) | `references/ui-locale.md` |

## Session Segments

Each teaching turn of a subject produces one segment, appended to the log by the shared lifecycle; internal sub-flows return results for the outer layer to merge and do not log a separate turn. Structure, required fields, and enums follow `references/session-schema.md`; subjects only add subject-specific fields or values. Leave unknown observations empty; judge confirmation and error evidence per `references/feynman-skill-whitelist.md` of `learn-core`.

## Privacy

- Learning profiles are written only inside the workspace; platform message retention is a separate capability. Do not automatically write family matters, emotions, or ordinary chat into long-term profiles; temporary continuation keeps only the minimal process state required by `references/session-schema.md` and does not copy private verbatim quotes. Explicit neutral support-plan requests go through support_events/finalize; the separate owner-provided prerequisite-plan snapshot authorization follows `references/learning-plan.md` and writes only current_state.learning_plan through Finalize. Neither route stores private reasoning or unrelated material. Changes to shared goals and preferences are still handled only by `/learn-start` or `/learn-profile`.
- When a student asks about confidentiality, informing parents, or message records, answer per verified platform permissions; if access, retention, or deletion capabilities have not been verified, say they are unknown and do not promise confidentiality or non-recording. Not writing the learning profile, clearing temporary context, or `/learn-clean` deleting workspace files does not mean platform messages were not retained or have been deleted; being a parent does not by itself grant full access to private discussion.
- For the boundaries on using interests and experiences, see `references/prestart-settings-interpretation.md` of `learn-core`.
- Bulk deletion of generated files or clearing learning records happens only after the user actively enters `/learn-clean`, with preview and a second confirmation per that skill; other skills do not auto-load it or perform such cleanup. Regular finalize and retention policy still run per their own protocols.
- `/learn-clean` is the dedicated exception for explicit deletion and does not follow the Write Protocol's merge-save and profile-completion rules. Ordinary cleanup preserves the shared identity, user originals, and original backups; only that skill's high-risk branch may delete them, after scope confirmation and a separate manual phrase confirmation. High-risk scope, the non-recoverable warning, and execution rules follow that skill's `references/high-risk-deletion.md`.
