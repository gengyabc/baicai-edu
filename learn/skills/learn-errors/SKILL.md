---
name: learn-errors
description: Parse user-provided images or Markdown (error items, materials, drafts, etc.), extract content, and record it; use when the student provides a file path, asks to analyze an image, or to scan the raw directory.
user-invocable: false
---

# User-Provided Files

Load `learn-data`. If `outputs/students/session.json` does not exist or `student_id` is empty, direct to `/learn-start` and stop. If the current subject log has a `finalize_plan`, recover the save first and process the new files only after it succeeds.

File lists and `scan all` both go through this flow; file analysis, backup, write-back, and notification happen only here. In-session subject diagnosis is produced by the subject skill as `diagnosis`.

## 1. Resolve Paths

Take `student_id` and `subject` from the current session. For an ordinary request, split the paths out of Arguments on whitespace. `scan all` scans the current student's and current subject's `data/.../raw/` and `outputs/.../extracted/`; skip files already recorded in `error_history.raw_file` or `original_raw_file`, and analyze only unrecorded items. When there are no new files, tell the student there are no new files. A repeated upload of the same question is merged into one entry, updating `date` and `self_diagnosis` without double counting. Scan only the resolved scope, not the whole workspace.

Roots:

- raw: `data/students/<student_id>/<subject>/`
- outputs: `outputs/students/<student_id>/<subject>/`

Resolve each path:

- Contains `..`: warn and reject.
- Bare file name or `raw/...`: place under `raw/` in the raw root.
- `extracted/...` or `backups/...`: place under the outputs root.
- Starts with `data/students/`: must stay within the current student's, current subject's subtree.
- Starts with `outputs/students/`: must stay within the current student's, current subject's subtree.
- Another student or subject: reject.
- A relative path that cannot be identified as `raw/`, `extracted/`, or `backups/`: default to the raw root (the user drop zone).

Expand directories recursively and keep only supported files. Supported: `.jpg` `.jpeg` `.png` `.gif` `.bmp` `.webp` `.md`. Unsupported or nonexistent files: warn and skip. Unreadable directory: warn and continue. After deduplication, produce `files` (normalized entries), `warnings` (missing, illegal, or unsupported paths), `total` (number of valid files), `images` (number of images), and `analyses` (number of Markdown files). If there are no valid files, keep only warnings; when valid and invalid are mixed, keep the valid files and list the warnings.

## 2. Read and Diagnose

For the first new question, ask the student where they think the mistake is in this question (in the student's language), and analyze only after the student's own account arrives (including "I don't know"). The self-account is evidence only for the question it belongs to.

Read with the text or image tools of the current environment. For images use `read_image` or `modlens_read_image`, extracting the recognizable question, handwriting, and existing working; if neither is available, ask the student to describe it in text and never fabricate. For Markdown use `read`, identifying the boundaries of the question, answer, and working; when the structure is unclear, treat the whole passage as the question and mark it as needing human confirmation.

Reuse the current teaching per `references/teaching-resolver.md` in `learn-data`, and use that implementation's diagnosis rules for `error_type`, `label`, and `domain`. The entry points to the reference and does not try loading another core on its own. This flow does not enumerate subjects or labels. The general path records only recognizable content and neutral observations, leaves specialist fields empty, and does not invent labels; profile-extracted records carry teaching/scope_id and do not enter specialist diagnosis counts or capability recommendations. When the file is not an error item but textbook/project material, read it directly without forcing a question about the cause of the error, and do not infer student performance from the material.

Identify one core error by comparing against the student's self-account. When the two disagree, re-check per the subject's rules, go by the evidence, and explain the difference in one sentence. Make the error type specific so it supports targeted later learning. Give one actionable next step that points to a specific learning direction. Stay objective and do not judge the student's ability.

## 3. Backup and Rename

The contents of `data/.../raw/` are read-only: no overwriting, editing, or deleting, and no replacing an original by copy, redirection, or creating an empty file. The only permitted change is, after a successful backup, renaming with `mv` within the same raw directory.

For every rename, execute in order:

1. Resolve and verify the absolute paths of the original, the backup, and the new file. The original and new file must be in the current student's, current subject's raw directory, and the backup must be in the corresponding `outputs/.../backups/raw/`. Confirm the variables are assigned, and quote paths containing spaces.
2. Ensure the backup directory exists. If the backup target or the rename target already exists, stop and explain the conflict, keeping the existing files.
3. Copy the original to `outputs/.../backups/raw/<original file name>`, and confirm the copy succeeded and the backup exists. On failure, keep the original name, tell the student the original file could not be backed up so the rename is skipped for now (in the student's language), and do not rename.
4. Use `mv` to rename within the original raw directory. Record `renamed: true` only after the command succeeds. On failure, keep the backup and the original, report it as incomplete, and record paths and status as they actually are.

Name as `<topic>-<number>-<YYYYMMDD>.<ext>`:

- `<topic>`: a short English or pinyin slug based on the question.
- `<number>`: the largest number among `data/.../raw/<topic>-*` and `outputs/.../extracted/<topic>-*` plus 1, zero-padded to three digits.
- `<YYYYMMDD>`: the current date.

Renaming does not change file contents. Tell the student the original name and the new name.

## 4. Extraction and Subject Profile

Write a same-named Markdown file in `outputs/.../extracted/`: the original question, the student's working, error type/label, evidence, and next step.

Read, merge, and write back the subject `profile.json` per the Write Protocol in `learn-data`. Change only the subject profile, not the shared profile. The full original text stays in `data/.../raw/` and `outputs/.../extracted/`; the profile stores only the diagnosis and references.

- `error_id` is `err_<YYYYMMDD>_<3-digit sequence>`, taking the largest sequence among existing ids of the same day plus 1, not counted from the number of history entries.
- Prepend one entry to `error_history`, keeping the latest 20. Fields: `error_id`, `source` (`file_analysis`), `date` (current ISO time), `topic`, `domain`, `error_type`, `label`, `raw_file`, `original_raw_file`, `backup_file`, `extracted_file`, `renamed`, `analyzed`, `self_diagnosis`.
- `priority_targets` prefers objects; add the target most worth practicing, deduplicate, and keep at most 5.
- Update `updated_at`.

In the reply, first affirm the student's willingness to look back at the material, then give one core finding, the evidence, and the next step, and state the original and new names.
