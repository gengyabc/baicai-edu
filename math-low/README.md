# dsh-edu-math-low

小学数学教学技能包，配合 `dsh-edu-learn` 使用。全部是给模型的指令，不挂工具、不改运行时。

## 提供的技能

| 技能 | 作用 |
|---|---|
| `math-session` | 一回合小学数学教学：选一个小目标、出题、追问、三步确认，支持 `learn` 与 `feynman` 模式 |
| `math-core` | 数学规则底座：教学动作、题目设计、分数教学、策略诊断、学生出题规则（含 `references/`） |
| `math-diagnose` | 策略诊断与错题分流：估计策略阶段、判断错误类型、给出保守的下一步目标 |
| `math-student-problem` | 学生出题考 AI：先算对再按约七成答错、三成答对回答，学生判断并解释，结束前必须揭示正确答案 |
| `math-practice` | 分层针对性练习：诊断、对比、变式、连接，每层 1-3 题，只给当前需要的一层 |

五个技能都是模型内部技能（`user-invocable: false`），不会出现在 `/` 菜单；由 `/learn`、`/feynman` 或学科 skill 按名称加载：

- `math-session` 加载 `learn-core`、`learn-data`、`math-core`。
- `math-diagnose`、`math-practice`、`math-student-problem` 加载 `math-core` 的对应 reference。
- 错题文件处理统一交给 `learn-errors`。

## 安装

```bash
dsh plugin --profile web add link:/Users/yugeng/programming/dsh-edu/math-low
```

安装后刷新 Web 会话；数学 skill 进入模型目录，学生在 `/learn` 或 `/feynman` 里选择数学主题时生效。

## 依赖

本包依赖 `dsh-edu-learn` 提供的 `learn-core`、`learn-data`、`learn-errors`：

- `learn-core`：中文语气、以学生为中心、年级适配、三步确认、引导无响应、结束信号、人格与费曼规则。
- `learn-data`：`outputs/students/` JSON 读写协议、快照、建档、finalize。
- `learn-errors`：用户投放文件解析、`data/.../raw/` 只读、`extracted/` 写入、`error_history` 更新。

可以只安装本包，但缺少 `dsh-edu-learn` 时共享规则与数据协议不可用，数学教学无法正常进行。安装命令：

```bash
dsh plugin --profile web add link:/Users/yugeng/programming/dsh-edu/learn
```

## 数据目录

系统状态在 `outputs/students/`；用户投放原件在 `data/students/.../raw/`，不随包发布：

```
data/students/<student_id>/math/raw/   # 用户投放原件，只读，只能改名

outputs/students/
  session.json
  <student_id>/
    profile.json                 # 共享：姓名、年级、personal.interests、经历
    math/
      profile.json
      memory.json
      current_state.json
      milestones.json
      session_log.json           # 当前会话 segment，每轮写，finalize 清空
      extracted/                 # 提取出的分析 md
      backups/raw/               # 改名前的原件备份
```

- 读写协议见 `learn-data`。
- `math-session` 使用 `/learn` 已读好的快照；只在写回过文件时才重读。情境优先从 `personal.interests` 里选一个具体细节。
- 每轮由入口把 `session_segment` 追加到 `session_log.json`；会话结束时由 `/learn` 调用 `learn-data` 的 finalize 写回，数学 skill 不直接写档案。

## 迁移说明

来源：Pi 教学配置里的数学会话工作流、学生出题工作流、数学规则 `rules/math/*`，以及 `diagnose-strategy`、`analyze-error` 两个诊断工作流。

迁移时保留教学动作、年级适配、分数规则、错误类型与出题比例；删除 Pi 的工具调用、平台契约与 `.pi` 路径写法，改为 DSH 的 `read` / `write` / `glob` 文件协议与自然对话。
