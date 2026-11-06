# 数学目标分类

共享 `target_context` 形状、空文本和文件路径的处理见 `learn-data` 的 `references/target-parsing.md`。本文只分类数学剩余文本和文件交接后的目标。

## 其余文本

不是空文本、也不是路径时：`type: topic`、`source: manual_topic`，`topic` 为指定主题。

## 文件处理之后

`learn-errors` 返回提取内容后：

- `type: topic`
- `topic` 为最值得训练的错误关系
- `source: error_analysis`

仍保存 `files_processed` 与 `material_refs`。分类只产出目标，不另做路由。普通教学进入 `math-session`；`context.activity: transfer` 进入 `math-student-problem`。
