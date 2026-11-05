# Raw Directory Protection Rules

`data/students/<student_id>/<subject>/raw/` 下的用户投放原件保持原样。

## Rules

- 不允许 `write` / `edit` 修改 raw 内容。
- 不允许 `rm`、`touch`、`echo >` 或任何写入重定向。
- 只允许 `mv` 重命名，不允许改内容。
- 允许 `cp` **从** `data/.../raw/` 到 `outputs/.../backups/raw/` 做备份；不允许 `cp` 覆盖 raw 里的文件。
- 读取只在文件处理流程中发生，用 `read` / `read_image` / `modlens_read_image`。

## Backup Before Rename

每次 `mv` 前必须：

1. `mkdir -p outputs/students/<id>/<subject>/backups/raw`
2. `cp "<raw 原文件>" "outputs/students/<id>/<subject>/backups/raw/<原文件名>"`
3. 确认备份存在后，再 `mv`（仍在 `data/.../raw/` 内改名）。

备份失败时停止，不要改名，先告诉学生“原始文件没能备份，我先不改名”。

## Note

流程本身无法强制文件系统只读；调用方必须遵守上面的顺序。宿主若支持路径级只读策略，应把 `data/.../raw/` 设为只读。
