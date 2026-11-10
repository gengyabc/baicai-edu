# High Risk: Completely Delete Student Data

Run only after the user has explicitly chosen a high-risk action in this `/learn-clean` invocation. All of the main skill's rules in sections 2 and 3 apply — path verification, cancellation, re-confirmation on change, stop on failure, partial-failure reporting, and cache discarding; this file states only the differences. All student-facing labels, warnings, and typed phrases are locale keys resolved through the active UI locale per `references/ui-locale.md` in `learn-data`.

## Scope

| High-risk action | Allowed scope |
|---|---|
| Completely delete a specified student (high risk) | All files under `outputs/students/<confirmed id>/` and `data/students/<confirmed id>/`; the current-selection file is listed only when it points to that student. |
| Clear all student data (high risk) | All student data under `outputs/students/` and `data/students/`, plus `outputs/students/session.json`. |

The "records but not identity" safe-high row in the main skill is **not** one of these two actions: it keeps the shared profile, originals, and backups and uses the ordinary scope confirmation only. Do not widen it into a high-risk deletion, and do not present a high-risk action as the only way to start over.

Students are the union of the actual subdirectories of the two trees, including orphan directories that have only originals, only outputs, or a corrupted profile; when identity is missing, show the directory id and do not guess a name. If a directory name does not match the student id format, or an unknown top-level file, special file, or symlink appears, stop and explain; do not treat unknown content as student data.

For originals, list only the path, count, and size, and do not open the original contents. The list includes all files and the empty directories to be removed.

## Two Independent Confirmations

1. **Scope confirmation**: the preview opens with the warning `ui.clean.high_risk_warning`, shown verbatim from the active locale. Then list each student's name (when readable), id, and subjects, and the number of files in each category: identity, records, originals, and backups; a full-scope operation gives the complete student list and total. State that unsaved learning is discarded directly and not finalized; source code, external storage, and chat history are outside the deletion scope and must not be claimed as deleted. Use `ask_user_question` to let the user choose `ui.clean.cancel_keep_all` or `ui.clean.continue_high_risk`.
2. **Manual phrase confirmation**: in a separate `ask_user_question` round, ask for text only with no confirm button, and have the user type the phrase `confirm.phrase.delete_student` (with `{id}` filled in with the actual id, shown in the question) or `confirm.phrase.delete_all_students`, taken from the active locale. Execute only on an exact match after trimming leading and trailing whitespace; any other response makes zero changes and ends the plan.

Both confirmations become invalid after the scope or file contents change, and must be redone from the start.

## Execution Differences

- Deactivate first (if the list contains the current-selection file), then delete file by file; afterward, remove the directories in the list from the bottom up with an operation that can delete only empty directories, keeping the `data/students/` and `outputs/students/` roots. Stop if a directory is not empty.
- On partial failure, deletions already made cannot be rolled back; a retry runs both confirmations again for the remaining items.
- Do not rebuild deleted profiles from the chat content; later use of that student requires creating a new profile.
