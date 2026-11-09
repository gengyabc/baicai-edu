---
name: learn-errors
description: 解析用户投放的图片或 Markdown（错题、材料、草稿等），提取内容并记录；学生提供文件路径、要求分析图片或扫描 raw 目录时使用。
user-invocable: false
---

# 用户投放文件

加载 `learn-data`。没有 `outputs/students/session.json` 或 `student_id` 为空时，引导 `/learn-start` 并停止。当前科目日志有 `finalize_plan` 时先恢复保存，成功后再处理新文件。

文件列表与 `scan all` 都走本流程；文件的分析、备份、写回与通知只在这里做。会话内的学科诊断由学科技能产出 `diagnosis`。

## 1. 解析路径

从当前会话取 `student_id` 与 `subject`。普通请求从 Arguments 按空白切出路径。`scan all` 扫描当前学生、当前科目的 `data/.../raw/` 与 `outputs/.../extracted/`；已记在 `error_history.raw_file` 或 `original_raw_file` 的文件跳过，只分析未记录项。没有新文件时告知“没有新的文件”。同题重复上传合并为一条，更新 `date`、`self_diagnosis`，不重复计数。只扫描解析到的范围，不扫描整个工作区。

根目录：

- raw：`data/students/<student_id>/<subject>/`
- outputs：`outputs/students/<student_id>/<subject>/`

解析每个路径：

- 含 `..`：警告并拒绝。
- 裸文件名或 `raw/...`：落在 raw 根下的 `raw/`。
- `extracted/...` 或 `backups/...`：落在 outputs 根下。
- 以 `data/students/` 开头：必须留在当前学生、当前科目的子树内。
- 以 `outputs/students/` 开头：必须留在当前学生、当前科目的子树内。
- 其他学生或科目：拒绝。
- 看不出是 `raw/`、`extracted/` 还是 `backups/` 的相对路径：默认 raw 根（用户投放区）。

目录递归展开，只保留支持的文件。支持 `.jpg` `.jpeg` `.png` `.gif` `.bmp` `.webp` `.md`。不支持或文件不存在：警告并跳过。目录读不出：警告并继续。去重后得到 `files`（规范化条目）、`warnings`（缺失、非法或不支持的路径）、`total`（有效文件数）、`images`（图片数）、`analyses`（Markdown 数）。没有有效文件时只留 warnings；有效和无效混在一起时保留有效文件并列出 warnings。

## 2. 读取与诊断

第一道新题先问“你觉得这道题错在哪？”，等到学生自述（包括“不知道”）后再分析。自述只作为它所对应题目的证据。

读取使用当前环境的文本或图片工具。图片用 `read_image` 或 `modlens_read_image`，提取可辨认的题目、书写和已有过程；两者都不可用时请学生文字描述，不编造。Markdown 用 `read`，识别题目、答案和过程的边界；结构不清楚时把整段当作题目，并标记需人工确认。

按 `learn-data` 的 `references/teaching-resolver.md` 复用当前 teaching，`error_type`、`label` 与 `domain` 用该实现的诊断规则。入口指出参考，不另试加载其他 core。本流程不列举科目或标签。通用路径只记录可辨认内容与中性观察，专属字段留空，不自造标签；档案提取记录带 teaching/scope_id，不参与专门诊断计数或能力推荐。不是错题而是教材/项目材料时直接读取，不强问错因，不凭材料推断学生表现。

对照学生自述判断一个核心错误。两者不符时按学科规则复核，以证据为准，用一句话解释差异。错误类型要具体，便于后续针对性学习。给一个可执行的下一步，指向具体学习方向。保持客观，不评价学生能力。

## 3. 备份与改名

`data/.../raw/` 内容只读：禁止覆盖、编辑、删除，也禁止用复制、重定向或创建空文件替换原件。唯一允许的变更是备份成功后，在同一 raw 目录内用 `mv` 改名。

每次改名按顺序执行：

1. 解析并核对原件、备份和新文件的绝对路径。原件与新文件必须在当前学生、当前科目的 raw 目录，备份必须在对应 `outputs/.../backups/raw/`。确认变量已赋值，并给含空格的路径加引号。
2. 确保备份目录存在。备份目标或改名目标已存在时停止并说明冲突，保留现有文件。
3. 把原件复制到 `outputs/.../backups/raw/<原文件名>`，确认复制成功且备份存在。失败则保留原名，告诉学生“原始文件没能备份，我先不改名”，不改名。
4. 用 `mv` 在原 raw 目录内改名。命令成功后才记录 `renamed: true`。失败则保留备份与原件，报告未完成，按实际结果记录路径与状态。

命名为 `<topic>-<number>-<YYYYMMDD>.<ext>`：

- `<topic>`：按题目取简短英文或拼音 slug。
- `<number>`：`data/.../raw/<topic>-*` 与 `outputs/.../extracted/<topic>-*` 里的最大编号加 1，三位补零。
- `<YYYYMMDD>`：当前日期。

改名不改文件内容。告知学生原名和新名。

## 4. 提取与科目档案

在 `outputs/.../extracted/` 写同名 Markdown：原题、学生过程、错误类型/标签、证据、下一步。

按 `learn-data` 的 Write Protocol 读取、合并并写回科目 `profile.json`。只改科目档案，不改共享档案。完整原文留在 `data/.../raw/` 与 `outputs/.../extracted/`，档案只存诊断与引用。

- `error_id` 为 `err_<YYYYMMDD>_<3位序号>`，取已有同日 id 的最大序号加 1，不按历史条数计。
- `error_history` 前插一条，保留最新 20 条。字段：`error_id`、`source`（`file_analysis`）、`date`（当前 ISO 时间）、`topic`、`domain`、`error_type`、`label`、`raw_file`、`original_raw_file`、`backup_file`、`extracted_file`、`renamed`、`analyzed`、`self_diagnosis`。
- `priority_targets` 优先用对象，加入最值得练的目标，去重后最多 5 个。
- 更新 `updated_at`。

回复先肯定学生愿意回看材料，再给一个核心发现、证据和下一步，并说明原名与新名。
