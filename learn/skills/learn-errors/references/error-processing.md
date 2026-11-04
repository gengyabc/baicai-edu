# Error Processing Rules

## Supported File Types

- 图片：.jpg, .jpeg, .png, .gif, .bmp, .webp
- 文档：.md（自由格式）

## Input

- 文件路径：`outputs/students/<student_id>/<subject>/raw/<filename>`
- 学生档案：`outputs/students/<student_id>/<subject>/profile.json`

## Output

- 备份文件：`outputs/students/<student_id>/<subject>/backups/raw/<original>`
- 重命名后的 raw 文件：`outputs/students/<student_id>/<subject>/raw/<topic>-<number>-<YYYYMMDD>.<ext>`
- 提取的 md 文件：`outputs/students/<student_id>/<subject>/extracted/<topic>-<number>-<YYYYMMDD>.md`
- 错误分析结果（用于更新 profile）
- 重命名告知信息

## Process

### 图片文件

- 用 `read_image` 或 `modlens_read_image` 识别内容；都不可用时请学生用文字描述，不要编造。
- 提取题目文本、解题过程、学生书写内容。

### MD 文件

- 直接读取文本内容。
- 尽量识别题目、答案和计算过程边界。
- 如果结构不清楚，把整段作为题目并标记需人工确认。

### 备份与命名

在重命名前把原件复制到 `backups/raw/`。规则：

- `<topic>`：根据题目自动识别，简短英文/拼音 slug。
- `<number>`：按 `raw/<topic>-*` 与 `extracted/<topic>-*` 里最大编号递增，三位补零。
- `<YYYYMMDD>`：当前日期。
- 只 `mv` 改名，不改内容；备份只增不改。

## Error Type Categories

### Math

- `calculation`：进位/借位遗漏、口诀错误、符号错误、单位错误。
- `concept`：概念混淆、规则误用、分数意义错误。
- `process`：跳步、漏条件、审题偏差、表达不完整。
- `estimation`：结果数量级明显不合理但没察觉。

### Chinese

Use the labels in `chinese-core/references/chinese-error-labels.md`:

- 阅读：`reading:` 前缀。
- 写作：`writing:` 前缀。
- 每条诊断只保留一个主标签；次要标签写入 `notes`。

## Domain Detection

- Math: `fractions`, `place_value_and_multidigit`, `multiplication_division`, `addition_subtraction`, `measurement_and_geometry`, `patterns_and_data`.
- Chinese: `reading` or `writing`.

## Output Fields

- `error_id` (`err_` prefix)
- `source` (`file_analysis`)
- `topic`
- `domain`
- `error_type`（数学）与具体 `label`（数学、语文均保留；语文按 `reading:` / `writing:` 标签）
- `raw_file`
- `original_raw_file`
- `backup_file`
- `extracted_file`
- `renamed`
- `analyzed`
- `self_diagnosis`

## User Notification

提取完成后，告诉学生：

- 原文件和新文件名
- 核心错误
- 下一步建议

## Constraints

- 保持客观，不评价学生能力。
- 错误类型/标签要具体，便于后续针对性学习。
- 建议要可操作，指向具体学习方向。
- 重命名必须告知用户，尊重用户的知情权。
- 不能修改 raw 文件内容，只能备份和重命名。
