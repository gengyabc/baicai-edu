# dsh-edu-learn

共享学习入口与教学底座，配合 `dsh-edu-math-primary-low`、`dsh-edu-chinese-reading`、`dsh-edu-english` 使用。

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
- `learn-errors`：用户投放文件解析、`data/.../raw/` 只读、备份、extracted 写入、error_history 更新。

入口 skill 分两档：`learn-start` / `learn` / `learn-clean` 设置 `disable-model-invocation: true`，只能由用户键入命令发起，不进入模型目录；`learn-feynman` / `learn-profile` / `learn-save` 保留模型入口，支持对话内自动加载（“我来给你讲”“看看我的档案”“保存一下”）。上面 3 个内部 skill 保持模型可加载，只通过 `user-invocable: false` 从 `/` 菜单隐藏。

## 规则所有权

- `learn-core`：跨学科教学行为；年级默认、难度调整、费曼角色与白名单分别由其 references 定义。
- `learn-data/references/session-lifecycle.md`：`/learn` 与 `/learn-feynman` 的唯一会话循环。模式切换沿用日志与 entry_point，不重开会话。
- `learn-data/references/subject-contract.md`：入口与学科包的约定。入口按 `<subject>-session` / `<subject>-core` 命名找到学科包，从 core 的「学科契约」读取目标分类、年级默认、档案字段与诊断规则；可选科目只在 `/learn-start` 的科目表维护。
- `learn-data/references/session-schema.md`：每轮读取的日志与 segment 外壳。
- `learn-data/references/profile-schema.md`：档案、记忆、状态、错题与里程碑模板，建档与 finalize 时读取；偏好键、水平、领域、标签和目标分类由学科包定义。
- `learn-core/references/prestart-settings-interpretation.md`：个性化不得覆盖什么、隐私与用量。字段路径归 `profile-schema`；学科怎么用归学科包。
- `learn-core/references/difficulty-adjustment.md`：学生要求降低或提高难度时的判定、当轮调整、日志记录与后续沿用；存储字段归 `profile-schema`。
- `learn-data/references/finalize-session.md`：统一保存流程；保留策略归 `session-retention.md`。
- 学科 references：方法、量规、标签与题型的唯一正文；学科 SKILL 保留分流、执行步骤和独有输出。

验证：`node scripts/check-skills.mjs`；协议回归检查：`node --test scripts/skill-contracts.test.mjs`。这些是静态检查，不替代真实对话验证。

日志新增可选 `context`（目标、材料引用、模式与当前动作）及临时 `finalize_plan`（部分保存失败重放），旧日志仍可恢复，无需迁移学生档案。提交顺序和清理以 finalize reference 为准；同一学生/科目有待完成保存时先恢复，再编辑档案或处理新错题。

### 对话验收场景（需实际运行）

| 场景 | 验收结果 |
|---|---|
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
```

按 DSH 输出决定是否重启，再刷新 Web 会话：`/` 菜单出现 6 个入口命令；模型目录出现 `learn-feynman`、`learn-profile`、`learn-save`，已安装学科包还会提供内部 skill。共享包不反向安装所有学科。统一入口及重复安装、手动禁用行为见[安装说明](<../docs/installation.md>)。

## 数据目录

系统状态在 `outputs/students/`；用户投放原件在 `data/students/<id>/<subject>/raw/`。

目录、字段和写入例外见 `skills/learn-data/SKILL.md`。教学逐轮写 `session_log.json`，长期学习证据在 finalize 提交；建档、显式档案编辑和文件分析按该协议的专属入口写入。

## 依赖

- `math-primary-low`、`chinese-reading` 与 `english` 的 skill 会按名称加载 `learn-core`、`learn-data`、`learn-errors`。
- 单独安装本包只能使用入口、档案、保存和通用错题处理；学科教学需要安装 `math-primary-low`、`chinese-reading` 或 `english`。
- 接入新学科：学科包提供 `<subject>-session` 与带「学科契约」节的 `<subject>-core`，再在 `learn-start` 的科目表加一行；其他入口无需修改。现有学科包有 `math-primary-low`、`chinese-reading`、`english`。
- `personal.interests` 是跨学科个性化字段，各学科 skill 都会读取；具体用法在学科包里。
