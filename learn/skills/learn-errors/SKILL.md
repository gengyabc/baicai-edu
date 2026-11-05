---
name: learn-errors
description: 解析用户投放的图片或 Markdown（错题、材料、草稿等），提取内容并记录；学生提供文件路径、要求分析图片或扫描 raw 目录时使用。
user-invocable: false
---

# 用户投放文件

加载 `learn-data`，复用有效快照。没有 `outputs/students/session.json` 或 `student_id` 为空时，引导 `/start` 并停止。当前科目日志有 `finalize_plan` 时先恢复保存，成功后再处理新文件。

本流程只处理文件；会话内阅读、写作诊断由学科技能产出 `diagnosis`。

## 1. 解析路径

读取 `references/resolve-error-files.md`，将用户路径或 `scan all` 请求解析为去重的文件列表、warnings 和计数。`raw/` 相对 `data/students/<id>/<subject>/`；`extracted/` 相对 `outputs/students/<id>/<subject>/`；拒绝 `..`、其他学生或科目路径。只扫描指定范围，不扫描整个工作区。

`scan all` 扫描当前学生、当前科目的 `data/.../raw/` 与 `outputs/.../extracted/`。已记录在 `error_history.raw_file` / `original_raw_file` 的文件跳过，只分析未记录项。没有新文件时告知“没有新的文件”。同题重复上传合并为一条，更新 `date`、`self_diagnosis`，不重复计数。

## 2. 读取与诊断

读取 `references/error-processing.md` 的文件读取、分类、领域和命名规则。第一道新题先问“你觉得这道题错在哪？”，等待学生自述（包括“不知道”）后再分析；自述仅作为它所对应题目的证据。

1. 图片用 `read_image` 或 `modlens_read_image`；都不可用时请学生文字描述。Markdown 用 `read`。只提取可辨认的题目、答案与过程，不猜内容。
2. 数学加载 `math-core` 并读其 `references/strategy-diagnosis-rules.md`；语文加载 `chinese-core` 并读其 `references/chinese-error-labels.md`。学科未安装时使用通用分类（数学：计算/概念/过程/估算；语文：概括/证据/赏析/结构/审题/细节），说明专属标签不可用，不自造标签。
3. 对照学生自述判断一个核心错误。两者不符时按学科规则复核，以证据为准，用一句话解释差异。
4. 给一个具体、可执行的下一步。

## 3. 备份与提取

任何改名前读取并执行 `references/raw-directory-protection.md`。`data/.../raw/` 只读，只能备份到 `outputs/.../backups/raw/` 后用 `mv` 改名；备份只增不改。备份失败时停止改名并告知学生。

按 `references/error-processing.md` 命名，序号取 raw 与 extracted 同主题的最大编号 + 1。在 `outputs/.../extracted/` 写 Markdown 分析：原题、学生过程、错误类型/标签、证据、下一步。告知学生原名、新名和核心发现。

## 4. 更新科目档案

按 `learn-data` 的 Write Protocol 读取、合并并写回科目 `profile.json`：

- `error_id` 为 `err_<YYYYMMDD>_<3位序号>`；取已有同日 id 最大序号 + 1，不按历史条数计。
- `error_history` 前插记录，保留最新 20 条。字段按 `references/error-processing.md` 的 Output Fields，并写 `date`：当前 ISO 时间。`source` 为 `file_analysis`；保留原始、新名、备份和提取文件路径，以及 `renamed`、`analyzed`、`self_diagnosis`。
- `priority_targets` 优先使用对象形式，加入最值得练的目标，去重后最多 5 个。
- 更新 `updated_at`。完整原文留在 `data/.../raw/` 与 `outputs/.../extracted/`，档案只存诊断与引用；只改科目档案，不改共享档案。

回复先肯定学生愿意回看材料，再给一个核心发现、证据和下一步，隐藏内部 JSON。
