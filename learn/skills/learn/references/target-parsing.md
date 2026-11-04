# Parse Learning Target

## Purpose

把一个 `/learn` 命令后面的文本分成一种目标类型，决定从档案选、按主题学、还是先处理错题。

## Inputs

- `/learn` 后面的用户文本（可能为空）。
- 当前 `student_id` 与 `subject`。

## Output

```json
{
  "type": "topic",
  "topic": "异分母分数加法",
  "files": [],
  "intent": null,
  "source": "manual_topic",
  "warnings": []
}
```

## Target Types

### Math

| Type | 含义 |
|---|---|
| `topic` | 学生指定了一个数学主题 |
| `error_files` | 学生提供了错题文件路径 |
| `profile` | 无参数，从档案选择 |

### Chinese

| Type | 含义 |
|---|---|
| `reading_material` | 文章、材料、阅读题或阅读答案 |
| `writing_prompt` | 作文题或写作方向 |
| `writing_draft` | 学生自己的作文草稿 |
| `task_generation` | 需要出题 |
| `assessment` | 需要批改或评改 |
| `error_files` | 错题文件路径 |
| `profile` | 无参数，从档案选择 |

## Order

1. 文本为空 → `profile`。
2. 存在可解析的路径 token → `error_files`（路径解析交给 `learn-errors`）。
3. 数学：剩余文本 → `topic`。
4. 语文：按下面顺序，命中即停。

### Chinese Detection Order

1. `assessment`
2. `task_generation`
3. `writing_draft`
4. `writing_prompt`
5. `reading_material`
6. `profile`

#### assessment

命中词：`批改`、`评判`、`点评作文`、`看看我这篇作文写得怎么样`、`帮我看看这篇阅读答案对不对`。

- 作文/写作 → `intent: assess_writing`
- 阅读答案 → `intent: assess_reading`

#### task_generation

命中词：`出题`、`生成题目`、`根据材料出题`、`帮我出几道题`、`作文题`、`写作练习`、`续写`、`改写`。

- 阅读 → `intent: generate_reading_tasks`
- 写作 → `intent: generate_writing_task`

#### writing_draft

文本是段落/文章长度，或学生明确说“这是我写的作文” → `intent: revise_writing`。

#### writing_prompt

文本像作文题、写作要求或“题目 + 要求” → `intent: start_writing`。

#### reading_material

文本像文章、阅读题或阅读答案 → `intent: learn_reading`。

#### Fallback

都不匹配 → `profile`，由学科 skill 从 `active_domain` 选择。

## Path Rules

相对路径以 `outputs/students/<student_id>/<subject>/` 为基准：

- `raw/分数-001.jpg` → `outputs/students/<id>/<subject>/raw/分数-001.jpg`
- `extracted/分析.md` → `outputs/students/<id>/<subject>/extracted/分析.md`
- `../raw/x.jpg` 非法。
- 以 `outputs/students/` 开头的路径必须仍在当前学生/科目子树内。

支持：`.jpg` `.jpeg` `.png` `.gif` `.bmp` `.webp` `.md`。

目录递归展开；不存在、类型不支持、越界路径只记 warning，不中断。

## Source Values

`profile`、`manual_topic`、`error_analysis`、`reading`、`writing`。

## Routing Summary

| Parsed Type | Route |
|---|---|
| `topic` | `math-session` |
| `error_files` | `learn-errors` → 再按科目 `math-session` / `chinese-session` |
| `profile` | `math-session` / `chinese-session` |
| `reading_material` | `chinese-session` → `chinese-reading-session` |
| `writing_prompt` | `chinese-session` → `chinese-writing-session`（start） |
| `writing_draft` | `chinese-session` → `chinese-writing-session`（revise） |
| `task_generation` | `chinese-session` → `chinese-generate-tasks` |
| `assessment` + `assess_reading` | `chinese-session` → `chinese-reading-session`（diagnose） |
| `assessment` + `assess_writing` | `chinese-session` → `chinese-writing-session`（assess） |

## Examples

| 输入 | 输出 |
|---|---|
| 空 | `profile` |
| `分数减法` | `topic` + `manual_topic` |
| `raw/分数-001.jpg` | `error_files` |
| `帮我出几道阅读题` | `task_generation` + `generate_reading_tasks` |
| `给我一个写人作文题` | `task_generation` + `generate_writing_task` |
| `这是我写的作文……` | `writing_draft` + `revise_writing` |
| `帮我看看这篇阅读答案对不对` | `assessment` + `assess_reading` |
