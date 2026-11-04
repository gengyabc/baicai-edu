# Error Processing Rules

## Purpose

从错题文件（图片或 md）中提取题目、答案、错误类型，并规范化文件命名。

适用于数学和语文的错题/学习证据处理流程。

## Supported File Types

- 图片：.jpg, .jpeg, .png, .gif, .bmp, .webp
- 文档：.md（自由格式）

## Input

- 文件路径：`outputs/students/<student_id>/<subject>/raw/<filename>`
- 学生档案：`outputs/students/<student_id>/<subject>/profile.json`

## Output

- 重命名后的 raw 文件：`outputs/students/<student_id>/<subject>/raw/<topic>-<number>-<date>.<ext>`
- 提取的 md 文件：`outputs/students/<student_id>/<subject>/extracted/<topic>-<number>-<date>.md`
- 错误分析结果（用于更新 profile）
- 重命名告知信息

## Process

### 图片文件

- 调用视觉模型识别内容
- 提取题目文本、解题过程、学生书写内容

### MD 文件

- 直接读取文本内容
- 尽量识别题目、答案和计算过程边界
- 如果结构不清楚，把整段作为题目并标记需人工确认

### 命名规则

生成规范文件名：`<topic>-<number>-<YYYYMMDD>`
- `topic` 根据题目自动识别
- `number` 按 `extracted/<topic>-*.md` 里已存在的最大编号递增
- `date` 使用当前日期（YYYYMMDD）

## Error Type Categories

常见错误类型：计算类、概念类、过程类。

## Domain Detection

根据题目内容自动识别领域：fractions, place_value_and_multidigit, multiplication_division 等。

## Output Fields

- `error_id`
- `topic`
- `domain`
- `error_type`
- `raw_file`
- `original_raw_file`
- `extracted_file`
- `renamed`
- `renamed_at`
- `suggested_priority`

## User Notification

提取完成后，告诉学生：

- 原文件和新文件名
- 核心错误
- 下一步建议

## Constraints

- 保持客观，不评价学生能力
- 错误类型要具体，便于后续针对性学习
- 建议要可操作，指向具体学习方向
- 重命名必须告知用户，尊重用户的知情权
- 不能修改 raw 文件内容，只能重命名
