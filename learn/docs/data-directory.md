# Student data directories and writes

[English](data-directory.md) | [中文](data-directory.zh.md)

System state lives in `outputs/students/`; user-dropped originals live in `data/students/<id>/<subject>/raw/`. Both sit in the current workspace, are never shipped with the package, and stay out of Git.

Directories, fields and write exceptions are in [learn-data](../skills/learn-data/SKILL.md). Teaching writes `session_log.json` every turn, and long-term learning evidence is committed at finalize; profile creation, explicit profile edits and file analysis write through that protocol's dedicated entries.

`data/.../raw/` is read-only: rename only after backing up. Retention and cleanup scopes are in [skills and ownership](skills.md); high-risk deletion is in [high-risk-deletion](../skills/learn-clean/references/high-risk-deletion.md).

## Log compatibility

Logs gained an optional `context` (goal, material references, mode and current action) and a temporary `finalize_plan` (replay after a partial save failure); older logs still restore and no student profile needs migrating. Commit order and cleanup follow the finalize reference: when a student/subject has an unfinished save, restore it first, then edit the profile or process new error items.
