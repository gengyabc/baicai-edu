# Parse Learning Target

`/learn`、`/feynman` 与恢复流程共用的 `target_context` 分类。输入为显式用户文本、当前 subject 和已有材料；mode 由入口指定，不参与材料类别判定。

## Shape

```json
{
  "type": "topic",
  "topic": "异分母分数加法",
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
2. 有路径 → `type: error_files`；先由 `learn-errors` 处理，随后按下节交接。
3. 数学其余文本 → `type: topic`、`source: manual_topic`，topic 为指定主题。
4. 语文按以下优先级判断；明确 intent 优先于模糊关键词，无法判断只问一个短问题。

| 用户需求/材料 | type | intent |
|---|---|---|
| 明确读写迁移，如“照着这篇写法写一段” | 沿用阅读材料类别 | `transfer_read_write` |
| 批改、评判、点评作文、看看作文写得怎么样 | `assessment` | `assess_writing` |
| 看阅读答案对不对、诊断已作答阅读题 | `assessment` | `assess_reading` |
| 出题、生成题目、根据材料出题、给一个作文题/写作练习 | `task_generation` | `generate_reading_tasks` / `generate_writing_task` |
| 明确“这是我写的作文”或提供自己的草稿；要求局部改写/修改现有草稿 | `writing_draft` | `revise_writing` |
| 作文题、写作方向、“题目 + 要求”，需要开始写 | `writing_prompt` | `start_writing` |
| 文章、阅读题、材料（尚未提供学生答案） | `reading_material` | `learn_reading` |
| 无法从档案之外确定目标 | `profile` | null |

“续写/改写”根据是否有现成草稿、是否明确要出题判断，不仅凭词命中；独立文章来源不明时确认是阅读原文还是学生草稿，避免把粘贴的原文误当作文。

## After File Processing

入口只调用一次 `learn-errors`，拿到提取材料、学生作答、诊断与当前 extracted 路径后：

- 设 `files_processed: true`，记录 `material_refs` 和用户原有意图；失败或未拿到内容时保留 false，问清/报告问题，不伪装已处理。
- 数学 → `type: topic`，topic 为最值得训练的错误关系，`source: error_analysis`。
- 语文 → 依据内容归为 `reading_material` / `writing_prompt` / `writing_draft` / `assessment` 并填写 intent；有阅读答案优先 `assessment + assess_reading`，有作文草稿且要求批改用 `assessment + assess_writing`。`source` 使用 `reading` / `writing`。
- 路由前把已解析 target_context 与材料引用保存到日志 context。后续加载 extracted 内容，不重跑文件分析或重问自我诊断；仍不明确阅读还是作文时只问一句澄清。

## Source Values

segment 的 source 枚举归 `references/profile-schema.md` 的 Session Segment，本文件不另定义。学科路由归 `references/session-lifecycle.md` 与 `chinese-session`，分类器只产出目标，不执行第二次路由。
