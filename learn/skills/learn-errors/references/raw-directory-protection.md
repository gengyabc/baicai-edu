# Raw Directory Protection Rules

## Purpose

保护学生的原始错题文件，防止写入和修改。

`raw/` 存放学生的原始上传文件（手写错题照片、扫描试卷），是学习原始证据，必须保持原样。

## Scope

`outputs/students/<student_id>/<subject>/raw/` 下的所有原始上传文件。

## Rules

- 不允许 `write` / `edit` 修改 raw 内容。
- 不允许 `rm`、`touch`、`echo >` 或任何写入重定向。
- 只允许 `mv` 重命名，不允许改内容。
- 允许 `cp` **从** raw 到 `backups/raw/` 做备份；不允许 `cp` 覆盖 raw 里的文件。
- 读取只在错题处理流程中发生，用 `read` / `read_image` / `modlens_read_image`。

## Backup Before Rename

每次 `mv` 前必须：

1. `mkdir -p outputs/students/<id>/<subject>/backups/raw`
2. `cp "<raw 原文件>" "outputs/students/<id>/<subject>/backups/raw/<原文件名>"`
3. 确认备份存在后，再 `mv`。

备份失败时停止，不要改名，先告诉学生“原始文件没能备份，我先不改名”。

## Note

流程本身无法强制文件系统只读；调用方必须遵守上面的顺序。宿主若支持路径级只读策略，应把 `raw/` 设为只读。
