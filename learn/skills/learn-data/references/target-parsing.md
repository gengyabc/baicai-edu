# Parse Learning Target

`/learn`、`/learn-feynman` 与恢复流程共用的 `target_context` 形状。输入为显式用户文本、当前 subject 和已有材料；mode 由入口指定，不参与材料类别判定。学科对剩余文本和文件交接后的归类由入口指定的学科目标分类完成，本文件不列举科目。

## Shape

```json
{
  "type": "topic",
  "topic": "当前主题",
  "source": "manual_topic",
  "files": [],
  "intent": null,
  "files_processed": false,
  "material_refs": [],
  "warnings": []
}
```

`files_processed` 只表示当前 files 已成功处理，不代表学生掌握。`material_refs` 保存当前学生/科目内的 extracted 或用户材料路径；重命名后使用新路径，不再依赖旧 raw 文件名。路径解析、支持格式与安全校验仅由 `learn-errors` 定义。

## Classify

1. 空文本 → `type: profile`、`source: profile`。如果已有活跃目标且未明确换主题，则保留原 target_context。
2. 有路径 → `type: error_files`；先由 `learn-errors` 处理，随后按学科目标分类交接。
3. 其余文本交给当前学科的目标分类。无法判断时只问一个短问题，不猜材料。

## After File Processing

入口只调用一次 `learn-errors`，拿到提取材料、学生作答、诊断与当前 extracted 路径后：

- 设 `files_processed: true`，记录 `material_refs` 和用户原有意图；失败或未拿到内容时保留 false，问清或报告问题，不伪装已处理。
- `type`、`intent`、`source` 与 topic 按当前学科的目标分类填写。
- 路由前把已解析 target_context 与材料引用保存到日志 context。后续加载 extracted 内容，不重跑文件分析或重问自我诊断。材料类别仍不明确时只问一句。

## Source Values

segment 的 source 枚举归 `references/session-schema.md` 的 Session Segment，本文件不另定义。分类器只产出目标，不执行第二次路由；路由由入口声明。
