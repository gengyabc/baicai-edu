# Create Student

仅在 `/learn-start` 收齐并确认必要信息后执行。字段外壳读 `references/profile-schema.md`，阶段兼容读 `references/grade-band-defaults.md`。先读 `references/teaching-resolver.md`，采用其真实 `subject`、稳定 `scope_id` 与 `teaching` 结果，不把通用教学当成科目身份。偏好键、`current_levels` 与 `active_domain` 取返回的 `core_skill` 学科契约（`references/subject-contract.md`），不直接假定专门包存在；示例值不是初始化默认值。

1. 姓名转小写拼音或英文 slug，加 4 位随机 hex，生成 `stu_<slug>_<4hex>`。按 Data Root 发现已有学生，核对 id 唯一后再写入。
2. 按 Base Profile 模板写 `outputs/students/<id>/profile.json`：
   - 姓名、语言、创建与更新时间来自本次确认的信息。`grade` 可缺省；`education_stage`、`learning_context` 可选。已有小学年级可推导阶段；未知不强填小学年级或年级段。
   - 兴趣写共享 `personal.interests`；可跳过项未提供时留空，不套用模板经历，不主动采集困境。
   - 共享 `learning_preferences = { goals: [], support_preferences: [] }` 默认空数组；只有学生明确设定跨科复用的长期目标与支持偏好才写入。科目偏好仍归科目档案；学习困难、敏感家庭/职业/情绪细节不写共享字段，不由单次表现推断共享心理画像。
3. 按模板写当前科目的 `profile.json`、`memory.json`、`current_state.json`、`milestones.json`、`session_log.json`：
   - 使用解析所得教学契约的默认值；通用路径保留未知水平，不伪造小学等级、专门诊断或掌握标签。
   - `profile.preferences` 全部先设为 `false`，再把学生实际选中的项设为 `true`；跳过则保留默认。
   - 各科目都使用 `profile.self_report.easy_topics` / `hard_topics`，不要改名；不复制为共享学习困难。
   - 支持计划/观察留在科目 `memory.json` 的 `learning_support_memory.plans` / `observations`，初始化为空；记录只能由 finalize 写，不在此将建档聊天变为支持观察，不另建记忆文件。
4. 按 `learn-data` 的 session.json 结构写当前学生、真实科目及协议要求的教学实现与范围字段，激活档案。
5. 创建目录（已存在则保留）：`data/students/<id>/<subject>/raw/`、`outputs/students/<id>/<subject>/extracted/`、`outputs/students/<id>/<subject>/backups/raw/`。
6. 所有必需文件与目录写入成功、session 指向新学生及科目后，告诉学生建档完成，下一步用 `/learn`。任一步失败时报告未完成操作，保留已成功部分供重试，不提前宣布建档成功。
