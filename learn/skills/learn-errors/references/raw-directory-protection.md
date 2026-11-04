# Raw Directory Protection Rules

## Purpose

保护学生的原始错题文件，防止写入和修改。

raw 目录存储学生的原始上传文件（手写错题照片、扫描试卷），是学习原始证据，需保持原样。

## Scope

`outputs/students/<student_id>/<subject>/raw/` 下的所有原始上传文件。

## Rules

- 不允许 write/edit 修改 raw 内容。
- 不允许 `rm`、`cp`、`cat`、`echo` 重定向、`touch`。
- 只允许 `mv` 重命名，不允许改内容。
- 读取在技术上可行，但只应在错题处理流程中读取。

## Note

plugin 不能识别当前 workflow，所以读取约束依赖流程自律。
