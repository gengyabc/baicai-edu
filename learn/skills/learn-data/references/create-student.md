# Create Student

仅在 `/learn-start` 收齐并确认入学信息后执行。字段外壳读取本技能的 `references/profile-schema.md`。年级段读取本技能的 `references/grade-band-defaults.md`。偏好键、`current_levels` 与 `active_domain` 读取学科契约的档案字段与年级默认（`references/subject-contract.md`）。示例值不是初始化默认值。

1. 姓名转小写拼音或英文 slug，加 4 位随机 hex，生成 `stu_<slug>_<4hex>`。按 Data Root 发现已有学生，核对 id 唯一后再写入。
2. 按 Base Profile 模板写 `outputs/students/<id>/profile.json`：姓名、年级、年级段、语言、共享 `personal`、创建与更新时间来自本次确认的信息；可跳过项未提供时留空，不套用模板经历。
3. 按模板写当前科目的 `profile.json`、`memory.json`、`current_state.json`、`milestones.json`、`session_log.json`：
   - 年级默认值以年级参考为准。
   - `profile.preferences` 全部先设为 `false`，再由 `/learn-start` 将学生选中的一项设为 `true`。
   - 各科目都使用 `profile.self_report.easy_topics` / `hard_topics`，不要改名。
4. 按 `learn-data` 的 session.json 结构写当前学生与科目，激活该档案。
5. 创建目录（已存在则保留）：`data/students/<id>/<subject>/raw/`、`outputs/students/<id>/<subject>/extracted/`、`outputs/students/<id>/<subject>/backups/raw/`。
6. 所有必需文件与目录写入成功、session 指向新学生及科目后，告诉学生建档完成，下一步用 `/learn`。任一步失败时报告尚未完成的操作，保留已成功部分供重试，不提前宣布建档成功。