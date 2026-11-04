# dsh-edu-learn

共享学习入口与教学底座，配合 `dsh-edu-math-low`、`dsh-edu-chinese-reading` 使用。

## 提供的入口

| 命令 | 作用 |
|---|---|
| `/start` | 选数学/语文，识别或创建学生 |
| `/learn` | 自适应学习主循环 |
| `/feynman` | 费曼模式：学生讲，AI 当学生 |
| `/profile` | 查看/修改学生档案 |
| `/save` | 手动保存当前会话 |

## 共享内部技能

- `learn-core`：中文语气、以学生为中心、年级适配、三步确认、引导无响应、结束信号、人格、费曼规则。
- `learn-data`：`outputs/students/` JSON 数据协议、快照、建档、写回、finalize。
- `learn-errors`：错题图片/Markdown 解析、raw 只读、备份、extracted 写入、error_history 更新。

入口 skill 分两档：`start` / `learn` 设置 `disable-model-invocation: true`，只能由用户键入命令发起，不进入模型目录；`feynman` / `profile` / `save` 保留模型入口，支持对话内自动加载（“我来给你讲”“看看我的档案”“保存一下”）。上面 3 个内部 skill 保持模型可加载，只通过 `user-invocable: false` 从 `/` 菜单隐藏。

## 规则所有权

- `learn-core`：跨学科教学行为；年级默认、费曼角色与白名单分别由其 references 定义。
- `learn-data/references/session-lifecycle.md`：`/learn` 与 `/feynman` 的唯一会话循环。模式切换沿用日志与 entry_point，不重开会话。
- `learn-data/references/profile-schema.md`：数据与 segment 结构；学科只定义字段增量。
- `learn-data/references/finalize-session.md`：统一保存流程；保留策略归 `session-retention.md`。
- 学科 references：方法、量规、标签与题型的唯一正文；学科 SKILL 保留分流、执行步骤和独有输出。

验证：`node scripts/check-skills.mjs`；协议回归检查：`node --test scripts/skill-contracts.test.mjs`。这些是静态检查，不替代真实对话验证。

日志新增可选 `context`（目标、材料引用、模式与当前动作）及临时 `finalize_plan`（部分保存失败重放），旧日志仍可恢复，无需迁移学生档案。提交顺序和清理以 finalize reference 为准；同一学生/科目有待完成保存时先恢复，再编辑档案或处理新错题。

### 对话验收场景（需实际运行）

| 场景 | 验收结果 |
|---|---|
| `/learn` 中选择当小老师，再结束 | 同一 session_id 与 entry_point，仅模式改变；只写一条会话 summary |
| 直接 `/feynman`，给出作文或阅读答案 | 保留写作/阅读意图，AI 用学生角色追写作选择/原文证据 |
| 已解析语文错题后重启会话 | 从 extracted 引用恢复材料，不重复改名、分析或问自我诊断 |
| pending 费曼/迁移后中断 | 恢复对应动作和进度，不仅恢复 focus；迁移不重置轮数 |
| 学生拒绝经验桥接或出现危机信号 | 失败不记掌握；危机停止教学、不落危机细节 |
| 保存中途失败后重复 `/save` | 重放同一计划，错误计数/历史不重复；已提交仅清理日志 |
| 连续保存两次、随后学习新主题 | 第二次不重复累计，新主题使用新 session_id |


## 安装

```bash
dsh plugin --profile web add link:/Users/yugeng/programming/dsh-edu/learn
```

安装后刷新 Web 会话：`/` 菜单出现 5 个入口命令；模型目录出现 `feynman`、`profile`、`save` 和 15 个内部 skill。输入 `/start` 即可开始。

## 数据目录

所有学生数据在当前工作区的 `outputs/students/`。`outputs/` 是通用输出根目录，后续可扩展其他产物目录。

```
outputs/students/
  session.json
  <student_id>/
    profile.json                 # 姓名、年级、personal.interests、经历
    math/{profile,memory,current_state,milestones,session_log}.json
    chinese/{profile,memory,current_state,milestones,session_log}.json
    <subject>/raw/               # 只读
    <subject>/extracted/         # 分析 md
    <subject>/backups/raw/       # 原件备份
```

协议见 `skills/learn-data/SKILL.md`。会话进行中每轮写 `session_log.json`；`profile.json` / `memory.json` 只在 finalize 写。

## 依赖

- `math-low` 与 `chinese-reading` 的 skill 会按名称加载 `learn-core`、`learn-data`、`learn-errors`。
- 单独安装本包只能使用入口、档案、保存和通用错题处理；学科教学需要安装 `math-low` 或 `chinese-reading`。
- `personal.interests` 是跨学科个性化字段，语文和数学 skill 都会读取。
