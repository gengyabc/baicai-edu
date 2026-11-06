# 语文目标分类

共享 `target_context` 形状、空文本和文件路径的处理见 `learn-data` 的 `references/target-parsing.md`。本文分类语文剩余文本和文件交接后的目标。明确 intent 优先于模糊关键词；无法判断时只问一个短问题。

## 其余文本

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

“续写/改写”根据是否有现成草稿、是否明确要出题判断，不仅凭词命中。独立文章来源不明时确认是阅读原文还是学生草稿，避免把粘贴的原文误当作文。

## 文件处理之后

`learn-errors` 返回提取材料、学生作答与诊断后，依据内容归为 `reading_material` / `writing_prompt` / `writing_draft` / `assessment` 并填写 intent：

- 有阅读答案：`assessment` + `assess_reading`
- 有作文草稿且要求批改：`assessment` + `assess_writing`
- `source` 使用 `reading` 或 `writing`

路由前保存 `target_context` 与 `material_refs`。后续加载 extracted 内容，不重跑文件分析，也不重问自我诊断。仍分不清阅读还是作文时只问一句。

分类只产出目标。教学路由进入 `chinese-session`：迁移且来源为阅读时传 `intent: transfer_read_write`；来源为写作时传 `type: writing_draft`、`intent: revise_writing`。
