---
name: learn-errors
description: 错题文件处理：解析 raw/ 下的图片或 md，提取题目与学生过程，规范命名，写入 extracted/，更新 error_history 与 priority_targets。数学和语文共用，学科标签由对应学科 skill 提供。
user-invocable: false
---

# Learn Errors

## Purpose

替代 Pi 的 `analyze-error` / `resolve-error-files` 工作流，处理学生提供的错题图片或 Markdown，并把诊断写回科目档案。

## When To Use

- `/learn` 或 `/feynman` 的目标是一个路径、图片或“我的错题”。
- 学生说“看看我的错题”“分析这张图”“扫描一下 raw 目录”。
- 学科 skill 需要从错题选择下一学习目标。

## Inputs

- `student_id` 与 `subject`：来自 `outputs/students/session.json`。
- 路径列表：用户消息里的 token；或 `scan all` 模式。
- 学生自述：先问“你觉得这道题错在哪？”再分析第一道新题。

## Path Resolution

相对路径以 `outputs/students/<student_id>/<subject>/` 为基准：

- `raw/分数-001.jpg` → `outputs/students/<id>/<subject>/raw/分数-001.jpg`
- `extracted/分析.md` → `outputs/students/<id>/<subject>/extracted/分析.md`
- 以 `outputs/students/` 开头的路径必须仍落在当前 `outputs/students/<id>/<subject>/` 子树内；其他学生或其他科目路径拒绝。
- 含 `..` 的路径拒绝。
- 目录递归展开；支持 `.jpg` `.jpeg` `.png` `.gif` `.bmp` `.webp` `.md`。
- 不存在的文件、不支持的类型、越界路径：记录 warning 并跳过，不要中断整个流程。

## Read Raw

- 图片：用 `read_image` 或 `modlens_read_image`（当前可用的视觉/OCR 能力）读取，提取题目文本、学生书写过程、答案。
- Markdown：用 `read` 读取，尽量识别题目、答案、计算/作答过程边界。
- `raw/` 只读：不得 `write` / `edit`；只能 `mv` 改名。
- 读取前确认文件确实在 `raw/` 或用户明确提供的路径；不要扫描整个工作区。

## Analyze

对每个新文件：

1. 提取题目与学生的作答过程。
2. 对照学生自述，判断错误类型：
   - 计算类：进位/借位遗漏、口诀错误、符号错误、单位错误。
   - 概念类：概念混淆、规则误用、分数意义错误。
   - 过程类：跳步、漏条件、审题偏差、表达不完整。
   - 语文：加载 `chinese-core` skill，读它的 `references/chinese-error-labels.md`，选择 `reading:` / `writing:` 标签。
3. 若学生自述与检测不一致，以证据为准，并用一句话说明差异。
4. 给出一个具体、可执行的下一步。

## Rename And Extract

命名：`<topic>-<number>-<YYYYMMDD>`

- `topic` 用简短英文/拼音 slug，避免空格。
- `number` 取 `extracted/<topic>-*.md` 中最大编号 + 1，三位补零。
- 日期用当天。

步骤：

1. 若需要改名，用 `mv` 把 raw 文件改为规范名；**只改名，不改内容**。
2. 在 `extracted/` 写一个 Markdown 分析文件，包含：原题、学生过程、错误类型、证据、下一步。
3. 告诉学生原文件名与新文件名、核心错误、下一步建议。

## Update Profile

读取 `outputs/students/<id>/<subject>/profile.json`，合并后整文件写回：

- `error_id` 用 `err_<YYYYMMDD>_<3位序号>`，同一天按已有记录递增。
- `error_history` 前插一条：

```json
{
  "error_id": "err_20261104_001",
  "date": "2026-11-04T12:00:00Z",
  "domain": "fractions",
  "topic": "异分母加法",
  "error_type": "concept_confusion",
  "raw_file": "outputs/students/<id>/<subject>/raw/fractions-001-20261104.jpg",
  "original_raw_file": "outputs/students/<id>/<subject>/raw/分数-001.jpg",
  "extracted_file": "outputs/students/<id>/<subject>/extracted/fractions-001-20261104.md",
  "renamed": true,
  "analyzed": true,
  "self_diagnosis": "学生说自己‘忘记通分’，实际是分母乘错。"
}
```

- `priority_targets`：优先对象形式，加入本次最值得练的目标；最多 5 个，去重。
- `updated_at` 更新。
- `error_history` 保留最新 20 条。
- 不把完整题目原文写进 profile；原文留在 raw/extracted。

## Duplicate Handling

- 先检查 `error_history` 的 `raw_file` / `original_raw_file`；已记录的文件跳过。
- `scan all` 模式只分析未记录项；没有新文件就告诉学生“没有新的错题”。
- 同一题重复上传：合并为一条，更新 `date` 与 `self_diagnosis`，不要重复计数。

## Output To Student

- 先肯定学生愿意回看错题。
- 说清：这题错在哪、证据是什么、下一步练什么。
- 一次只给一个核心错误和一个下一步；不要列长清单。
- 不展示 `error_history` JSON。

## References

- `references/resolve-error-files.md`：路径解析细节。
- `references/analyze-error.md`：分析流程与字段。
- `references/error-processing.md`：文件类型、命名、错误类别。
- `references/raw-directory-protection.md`：raw 只读规则。
