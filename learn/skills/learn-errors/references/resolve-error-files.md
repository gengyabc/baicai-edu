# Resolve Error Files Workflow

## Goal

Resolve user-provided paths into a clean list of error files.

## Inputs

- 从用户消息读取路径 token，或接收预先检测的路径列表

## Boundary

- This workflow only resolves paths into normalized file entries.
- Actual error analysis is owned by the main `learn-errors` skill body.

## Process

1. Get `student_id` and `subject` from the current session.
2. 从 Arguments 部分提取路径，按空白分割。
3. Resolve each token relative to `outputs/students/<student_id>/<subject>/` unless it is already under `outputs/students/`.
4. Reject any token containing `..`.
5. Expand directories recursively.
6. Keep supported files, deduplicate, and count them.

### Path Rules

Follow `references/raw-directory-protection.md`:
- Only read from `raw/`, never write or modify
- Rename via `mv` only when needed

- `raw/`, `extracted/`, and `./` are relative to `outputs/students/<student_id>/<subject>/`.
- Paths starting with `outputs/students/` must still stay under the current `outputs/students/<student_id>/<subject>/` subtree; reject any other student or subject path.
- `..` is invalid and should warn.

### Directory Handling

If a path is a directory, scan recursively for supported image or md files.

### File Handling

If a path is a file:
- keep it if the extension is supported
- warn and skip if unsupported
- warn and skip if missing

### Output Format

- `files`: normalized file entries
- `warnings`: missing, invalid, or unsupported paths
- `total`: number of valid files
- `images`: number of image files
- `analyses`: number of markdown analysis files

## Edge Cases

- No valid files: return warnings only.
- Mixed valid and invalid: keep valid files and list warnings.
- Unreadable directory: warn and continue.
