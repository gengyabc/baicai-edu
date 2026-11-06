# 英语目标分类

共享 `target_context` 形状、空文本和文件路径的处理见 `learn-data` 的 `references/target-parsing.md`。本文分类英语剩余文本和文件交接后的目标。明确 intent 优先于模糊关键词；无法判断时只问一个短问题。

## 其余文本

| 用户需求/材料 | type | intent |
|---|---|---|
| 明确的学习主题，如颜色、动物、家庭、字母、数字、日常对话 | `topic` | `learn_english` |
| 英语故事、短文、绘本、分级读物（尚未给答案） | `reading_material` | `learn_reading` |
| 练口语、对话、角色扮演、描述一个人或物 | `speaking_practice` | `practice_speaking` |
| 学或复习单词、句型、固定表达 | `language_focus` | `practice_language` |
| 玩英语游戏、做任务、手工、项目 | `activity` | `task_activity` |
| 适合孩子的新闻、时事、新闻英语 | `news` | `news_reading` |
| 检查已写的英语答案、阅读题或句子 | `assessment` | `assess_english` |
| 想写或仿写短句、小段，已有草稿 | `writing_task` | `revise_writing` |
| 想出题考 AI，或检验刚学的表达 | `student_problem` | `student_problem` |
| 无法从档案之外确定目标 | `profile` | null |

“续写/改写”按是否有现成草稿、是否明确要出题判断，不只凭一个词命中。独立文章来源不明时确认这是阅读材料还是学生自己的草稿，不把粘贴的原文误当学生作文。

## 文件处理之后

`learn-errors` 返回提取材料、学生作答与诊断后，依据内容归类：

- 只有阅读短文或故事：`reading_material` + `learn_reading`
- 有阅读题或学生答案：`assessment` + `assess_english`
- 有学生写的英语句子或小段：`writing_task` + `revise_writing`
- 新闻原文或新闻链接文本：`news` + `news_reading`
- 仍分不清是阅读材料还是作业时只问一句。

`source` 使用 `manual_topic`、`error_analysis`、`profile` 或 `focus`；路由前保存 `target_context` 与 `material_refs`。后续加载 extracted 内容，不重跑文件分析，也不重问自我诊断。

分类只产出目标，不执行第二次路由；教学由 `english-session` 接管。
