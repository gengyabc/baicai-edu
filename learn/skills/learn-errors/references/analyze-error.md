# Analyze Error Workflow

## Goal

Analyze student error files, collect self-diagnosis, and update the profile.

## Inputs

- File list (optional): from `resolve-error-files.md`.

## Boundary

- This workflow analyzes error files and updates `error_history` and `priority_targets`.
- Path resolution: `references/resolve-error-files.md`.
- Finalize semantics: `learn-data/references/finalize-session.md`. This workflow does not write session summaries.

## Rules to Load

- `references/raw-directory-protection.md` — read-only raw, backup before rename.
- `references/error-processing.md` — file types, naming, error categories.
- If `subject = math`: load `math-core` and read `references/strategy-diagnosis-rules.md`.
- If `subject = chinese`: load `chinese-core` and read `references/chinese-error-labels.md`.
- If the subject skill is not installed, use the generic categories and say the subject-specific label is unavailable.

## Process

### Mode 1: With File List

1. Load the current session and subject profile.
2. Ask for self-diagnosis before the first new file.
3. Skip files already in `error_history` (match `raw_file` / `original_raw_file`).
4. Back up each new file to `backups/raw/` before any rename.
5. Analyze new files using `references/error-processing.md`.
6. If the student's hypothesis does not match the detected `error_type` / `label`, re-evaluate with the subject rules; explain the difference in one sentence.
7. Update `error_history`, `priority_targets`, and `updated_at`, then tell the student the renamed file, the core issue, and the next focus.

### Mode 2: Scan All

1. Load the current session.
2. Scan `raw/` and `extracted/` for unrecorded files.
3. Back up each new file before rename.
4. Analyze each unrecorded item.
5. Update `error_history`, `priority_targets`, and `updated_at`.
6. Tell the student what was newly analyzed and what to focus on next.

## Constraints

- Do not duplicate already recorded files.
- Do not store full raw problem text in the profile.
- Do not write the shared `profile.json`.
- Keep `error_history` to the most recent 20 items.
- If the backup fails, do not rename; tell the student first.
