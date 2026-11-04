# Analyze Error Workflow

## Goal

Analyze student error files, collect self-diagnosis, and update the profile.

## Inputs

- 文件列表（可选）：来自 `resolve-error-files.md` 的解析结果

## Boundary

- This workflow analyzes error files and updates profile state.
- Path resolution is owned by `references/resolve-error-files.md`.
- Finalize semantics are owned by `learn-data` 的 `references/finalize-session.md`；本流程只更新 error history 与 priority targets。

## Rules to Load

- `references/raw-directory-protection.md` - protect raw files, read-only
- `references/error-processing.md` - error analysis patterns
- `math-core` skill - strategy diagnosis
- `math-core` skill - practice generation layers (after analysis)

## Process

### Mode 1: With File List

1. Load the current session and subject profile.
2. Ask for self-diagnosis before the first new file.
3. Skip files already in `error_history`.
4. Analyze new files using `references/error-processing.md`.
5. If the student's hypothesis does not match the detected `error_type`, re-evaluate with the `math-core` skill.
6. Update `error_history`, `priority_targets`, and `updated_at`, then tell the student the renamed file, the core issue, and the next focus.

### Mode 2: Scan All

1. Load the current session.
2. Scan `outputs/students/<student_id>/<subject>/raw/` and `outputs/students/<student_id>/<subject>/extracted/`.
3. Analyze each unrecorded item.
4. Update `error_history`, `priority_targets`, and `updated_at`.
5. Tell the student what was newly analyzed and what to focus on next.

## Constraints

- Do not duplicate already recorded files.
- Do not store full raw problem text in the profile.
- Keep `error_history` to the most recent 20 items.
