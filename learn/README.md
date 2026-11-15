# baicai-edu-learn

全年龄共享学习入口与教学底座，以小学教学为重点。优先采用适用的专门学科包；缺包或阶段不适配时，用随本包提供的通用任务教学继续帮助，不要求另装通用包。

## 提供的入口

| 命令 | 作用 |
|---|---|
| `/learn-start` | 选科目，识别或创建学生 |
| `/learn` | 自适应学习主循环 |
| `/learn-feynman` | 费曼模式：学生讲，AI 当学生 |
| `/learn-profile` | 查看/修改学生档案 |
| `/learn-save` | 手动保存当前会话 |
| `/learn-clean` | 用户专用清理；普通清理保留身份、原件和备份；高风险彻底删除需两次独立确认 |

### 高风险删除

`/learn-clean` 可选「彻底删除指定学生（高风险）」或「清空所有学生数据（高风险）」。**这些操作会永久删除身份、学习记录、用户原件和原件备份，不可自动恢复，也不会另建恢复副本。**

先预览并确认范围，再单独手动输入确认短语（指定学生包含真实 id）。只点击范围确认、说“确认”、跳过或空回应都不会执行。普通清理仍保留身份、原件和备份；修改技能不构成删除授权。详细规则见 [高风险删除](<skills/learn-clean/references/high-risk-deletion.md>)。

## 共享内部技能

- `learn-core`：中文语气、以学生为中心、年级适配、难度调整、按需确认、引导无响应、结束信号、人格、费曼规则。
- `learn-data`：`outputs/students/` JSON 数据协议、快照、建档、写回、finalize。
- `learn-errors`：用户投放文件解析、`data/.../raw/` 只读、备份、extracted 写入、error_history 更新；图片读取交 `learn-read-image`。
- `learn-read-image`：用户提供的图片（手写、扫描、截图、数字墨水）的忠实转录、原图归档、`extracted` 读取记录与交回；只在有图时加载，不诊断、不写档案。
- `learn-recommend`：根据当前学科记录推荐具体小目标，标明首选与当前界面语言的理由；内容、难度与排序由教学契约决定，通用路径可按学生请求探索跨领域目标。
- `learn-general-core` / `learn-general-session`：通用任务契约与实际教学；真实科目身份不变，记录不自动升级为专门等级。
- `learn-support`：价值、信心、自主性、学习策略、持续学习的按需方法；自然回应、倾听、纠正、普通话题、公开邀请、拒绝与退出只由 `references/supportive-conversation.md` 维护，定位说明的时机归 `learn-core`。理论依据与阶段/情境参考按需读取，不增加固定动机问卷或第二教学调度者。

入口 skill 分两档：`learn-start` / `learn` / `learn-clean` 设置 `disable-model-invocation: true`，只能由用户键入命令发起，不进入模型目录；`learn-feynman` / `learn-profile` / `learn-save` 保留模型入口，支持对话内自动加载（“我来给你讲”“看看我的档案”“保存一下”）。上述内部 skill 保持模型可加载，只通过 `user-invocable: false` 从 `/` 菜单隐藏。

## 规则所有权

- `learn-core`：跨学科教学行为；年级默认、难度调整、费曼角色与白名单分别由其 references 定义。
- `learn-data/references/session-lifecycle.md`：`/learn` 与 `/learn-feynman` 的唯一会话循环。模式切换沿用日志与 entry_point，不重开会话。
- [教学解析](<skills/learn-data/references/teaching-resolver.md>)与[教学契约](<skills/learn-data/references/subject-contract.md>)：统一开始、初始化、目标分类、推荐和恢复；专门包按解析出的实际 core/session 技能名定位，缺包采用同接口的通用路径。可选科目只在 `/learn-start` 科目表维护，其他目标可直接描述。
- `learn-data/references/session-schema.md`：每轮读取的日志与 segment 外壳。
- `learn-data/references/profile-schema.md`：档案、记忆、状态、错题与里程碑模板，建档与 finalize 时读取；偏好键、水平、领域、标签和目标分类由学科包定义。
- `learn-core/references/prestart-settings-interpretation.md`：个性化不得覆盖什么、隐私、用量与自评优先级。字段路径归 `profile-schema`；学科怎么用归学科包。
- `learn-core/references/difficulty-adjustment.md`：学生要求降低或提高难度时的判定、当轮调整、日志记录与后续沿用；存储字段归 `profile-schema`。
- `learn-data/references/finalize-session.md`：统一保存流程；保留策略归 `session-retention.md`。
- `learn-read-image/references/reading.md`、`record.md`、`handoff.md`：图片读取、原图与转录记录、交回字段的唯一正文；触发条件由 `learn-core` 的条件行与 `learn-errors` 的图片分支维护，读取层本身不诊断。
- 学科 references：方法、量规、标签与题型的唯一正文；学科 SKILL 保留分流、执行步骤和独有输出。

技能正文在 `skills/`；安装时读的是仓库根目录 `scripts/build-resources.mjs` 由它渲染出的 `resources/`（本包发布内容含 `resources/`，`skills/` 供阅读与维护）。改完技能先跑 `node scripts/build-resources.mjs` 再提交，否则 `publish.mjs check` 与契约测试会报 `resources/` 与源码不一致。

验证：`node scripts/check-skills.mjs`；协议回归检查：`node --test scripts/*.test.mjs`。这些是静态检查，不替代真实对话验证。

日志新增可选 `context`（目标、材料引用、模式与当前动作）及临时 `finalize_plan`（部分保存失败重放），旧日志仍可恢复，无需迁移学生档案。提交顺序和清理以 finalize reference 为准；同一学生/科目有待完成保存时先恢复，再编辑档案或处理新错题。

### 学习推荐

学生说「不知道学什么」「接下来学什么」或想换内容时，推荐当前学科的 2–3 个小目标，给出首选及当前界面语言的理由；选定后的教学语言不变。一段学习完成后的阶段选择增加「换个内容」，选中才展开推荐。明确给出目标则直接教学，普通进入不强行推荐。

记录不足时说明是探索性建议，不强制先测、不虚构薄弱项；合适候选不足时不凑数。推荐和选择只保存临时候选，不算学习表现、不直接更新长期档案；用户选定或明确说「你选吧」后才切任务。跳过推荐卡或空消息不代表同意切换，推荐本身不触发画板清空。

### 对话验收场景（需实际运行）

| 场景 | 验收结果 |
|---|---|
| 有待答题时问「不知道接下来学什么」，随后取消 | 只推荐当前学科，理由有依据；不产 segment、不 finalize，取消后保留原题与画板 |
| 阶段闭环并有四个学科附加项 | 第一层含「换个内容」且不超过 6 项，更多活动仍可进入；选换内容才展开候选 |
| 记录不足、明确委托首选、拒绝全部、跳过或空回应 | 探索性说明、不凑数；仅明确委托才开始，拒绝不重复推，跳过/空回应不切任务 |
| 推荐中断后恢复，或推荐后切主题保存失败 | 恢复同一候选；选择不计表现，旧主题保存成功前不开始新任务 |
| 英语学习推荐 | 推荐理由中文，选定后恢复英语教学，不在推荐时调方法技能发题 |
| `/learn` 中选择当小老师，再结束 | 同一 session_id 与 entry_point，仅模式改变；只写一条会话 summary |
| 直接 `/learn-feynman`，给出该科材料或答案 | 保留学科意图，AI 用学生角色按该学科的追问点提问 |
| 已解析错题后重启会话 | 从 extracted 引用恢复材料，不重复改名、分析或问自我诊断 |
| pending 费曼/迁移后中断 | 恢复对应动作和进度，不仅恢复 focus；迁移不重置轮数 |
| 学生拒绝经验桥接或出现危机信号 | 失败不记掌握；危机停止教学、不落危机细节 |
| 保存中途失败后重复 `/learn-save` | 重放同一计划，错误计数/历史不重复；已提交仅清理日志 |
| 连续保存两次、随后学习新主题 | 第二次不重复累计，新主题使用新 session_id |
| `/learn-clean` 取消、跳过、空回应或无目标 | 文件零变更 |
| `/learn-clean` 清空单科，含未保存日志或 `finalize_plan` | 其他学科、其他学生、共享身份、原件与备份不变；不 finalize，之后不恢复旧计划 |
| `/learn-clean` 遇符号链接越界、确认后文件变化或删除中途失败 | 停止并如实报告已完成与剩余项 |
| 高风险删除只过范围确认、只说“确认”、短语 id 错误或用指定学生短语做全量 | 零删除 |
| 彻底删除指定学生 / 清空所有学生数据 | 前者只移除该学生全部数据，他人及其当前选择保留；后者覆盖两棵目录的孤立学生目录，保留两数据根目录与源码 |


## 安装

```bash
# 单独安装共享能力（在仓库根目录运行）
node scripts/install.mjs learn --profile web
# 教学使用时选学科即可，自动补齐本包；数学还会配齐画板
node scripts/install.mjs math-primary-low --profile web
node scripts/install.mjs math-primary-high --profile web
```

按 DSH 输出决定是否重启，再刷新 Web 会话：`/` 菜单出现 6 个入口命令；模型目录出现 `learn-feynman`、`learn-profile`、`learn-save`，已安装学科包还会提供内部 skill。共享包不反向安装所有学科。统一入口及重复安装、手动禁用行为见[安装说明](<../docs/installation.md>)。

## 数据目录

系统状态在 `outputs/students/`；用户投放原件在 `data/students/<id>/<subject>/raw/`。

目录、字段和写入例外见 `skills/learn-data/SKILL.md`。教学逐轮写 `session_log.json`，长期学习证据在 finalize 提交；建档、显式档案编辑和文件分析按该协议的专属入口写入。

## 依赖

- `math-primary-low`、`math-primary-high`、`chinese-reading` 与 `english` 的 skill 会按名称加载 `learn-core`、`learn-data`、`learn-errors`。
- 单独安装本包也能使用通用任务教学及五类支持；安装适用学科包后可使用专门教学，不自动重解释旧通用证据或热替换未完成任务。
- 教育阶段、年级和情境可选；旧小学档案无需迁移，成人不强填小学年级。纯支持讨论可恢复；学生明确要求保存的中性计划与学科表现分开保存，仍走同一 finalize。
- 完整验收见[学习支持验收](<tests/learning-support-scenarios.md>)与[支持性交流回放](<tests/supportive-conversation-scenarios.md>)；静态检查与合成回放不代表真实模型教学、故障注入或纵向成效已验证。
- 接入新学科：学科包提供 `<subject>-session` 与带「学科契约」节的 `<subject>-core`，再在 `learn-start` 的科目表登记；其他入口无需修改。同一学科可提供多个按年级段适配的包（数学即 `math-primary-low` 与 `math-primary-high`），由教学解析按明确年级选带（1–3 → low，4–6 → high，无明确年级回落 low），并用唯一技能名（`math-low-*` / `math-high-*`）载入和恢复，科目 id 不变。现有学科包有 `math-primary-low`、`math-primary-high`、`chinese-reading`、`english`。
- `personal.interests` 是跨学科个性化字段，各学科 skill 都会读取；具体用法在学科包里。
