# dsh-edu-math-primary-low

以小学低年级（1–3 年级）为主的 CGI 数学指令包，年级只调整语气、语言和呈现，不限制学生探究高年级内容；依赖 `dsh-edu-learn` 与 `dsh-edu-math-board`，自身不提供工具或运行时，画板由独立依赖包提供。4–6 年级对应目录为 [`math-primary-high/`](../math-primary-high/)（尚未打包为本仓库的 DSH bundle）。

## 技能

| 技能 | 职责 |
|---|---|
| `math-session` | 教学主线、恢复焦点、调度子流程，支持 learn / feynman |
| `math-core` | 共享规则及按条件读取的 references |
| `math-diagnose` | 策略诊断、错题分流、有证据的阶段估计 |
| `math-practice` | 诊断、对比、变式、连接；一次一题，目的不是等级 |
| `math-student-problem` | 学生编题、AI 验算回答、学生检查；普通模式限已确认技能可交故意错答供批改并在收束前澄清，费曼按白名单同轮纠正 |

五个均为 `user-invocable: false`，不进 `/` 菜单。`/learn`、`/learn-feynman` 经 lifecycle 统一进入 `math-session`；仅 session 调度三个 leaf，leaf 只回传证据与下一动作信号，不互调。等待学生时保留原步骤；证据足够且无待答问题时，同轮最多两次 leaf 调度。仅 session 合并唯一 segment，lifecycle 记录与 finalize。此为指令层集中调度约定，不是运行时调用隔离。错题文件仅由 lifecycle 调用一次 `learn-errors`，学科读取处理结果。

## 安装

```bash
# 在仓库根目录运行，一次安装 learn、math-board、math-primary-low
node scripts/install.mjs math-primary-low --profile web
```

按 DSH 输出决定是否重启，再刷新 Web 会话，在 `/learn` 或 `/learn-feynman` 选择数学。共享依赖：`learn-core` 管教学、角色与确认；`learn-data` 管快照、记录和 finalize；`learn-errors` 管投放文件。安装器补齐依赖，但不会重新启用此前手动禁用的 bundle；不要以单独 link 数学包替代完整安装。详见[统一安装说明](<../docs/installation.md>)。

## 数学画板

独立画板插件在输入框工具栏、模型选择按钮旁提供「数学画板」。学生摆图、圈组、合并/拆开、划去或写说明，自定图案数值与颜色；「放入回答」附上 JSON，不插入图形清单，学生自己写的话会放进输入框，仍需手动发送；画板和修改记录都留着，方便改错。点「清空」会同时清掉画布和这次的修改记录。画板不运算、不自动提交。可附带独立的「我的修改记录」：它记录已发送的语义变化，供学生卡住或主动回看时按需读取；次数不作为诊断或掌握依据。

模型读取已发送附件教学，不读未提交画布；学生明确设置意图时可用 `math_board_settings` 同步会话设置，不代交答案。完整数据与边界见[结构化数学画板](skills/math-core/references/structured-drawing.md)。

仅本教学包由 AI 在实际进入新题、新活动、新主题前按[任务边界规则](skills/math-core/references/board-task-boundary.md)调用无参数 `math_board_clear`；该参考是触发、保留例外与失败处理的唯一权威。工具只记录请求，客户端是否执行须另有确认；未打开时下次打开编辑前应用一次，迟到请求保留新作品。设置、已有附件与档案不受影响。

## 数据与维护

系统状态在 `outputs/students/`，用户原件在 `data/students/<student_id>/math/raw/`；均不随包发布。原件只读，改名先备份至 `outputs/students/<student_id>/math/backups/raw/`，处理交共享技能。

数学技能复用有效快照，并读取共享 `personal.interests` 与科目偏好。题目按 CGI，题面以生活故事为主，同一关系换场景检验迁移；兴趣只在学生做不出当前题时搭桥。用法见 `skills/math-core/references/math-personalization.md`。每轮唯一 segment 由调用方追加到 `session_log.json`；档案与 finalize 由共享协议执行，完整结构见 `learn-data`。

规则按 `math-core` 条件指针加载，不把参考书摘要放进运行指令；阶段按 CGI 分算术、多位数、分数三条线，仅作策略摘要，不改共享 schema、不设内容门槛。

```bash
node scripts/check-skills.mjs
git diff --check
```

[教学行为对照场景](tests/teaching-scenarios.md)用于人工审阅/模型回放；静态检查不等于行为实测。
