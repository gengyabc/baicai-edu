# dsh-edu-math-low

小学数学指令包，依赖 `dsh-edu-learn`，不提供工具或运行时。

## 技能

| 技能 | 职责 |
|---|---|
| `math-session` | 教学主线、恢复焦点、调度子流程，支持 learn / feynman |
| `math-core` | 共享规则及按条件读取的 references |
| `math-diagnose` | 策略诊断、错题分流、有证据的阶段估计 |
| `math-practice` | 诊断、对比、变式、连接；一次一题，目的不是等级 |
| `math-student-problem` | 学生编题、AI 验算回答、学生检查；费曼故意错同轮纠正 |

五个均为 `user-invocable: false`，由 `/learn`、`/feynman` 或数学技能按名加载，不进 `/` 菜单。诊断与练习可相互调用；证据不足不仓促换分支。错题文件统一交 `learn-errors`。

## 安装

```bash
dsh plugin --profile web add link:/Users/yugeng/programming/dsh-edu/learn
dsh plugin --profile web add link:/Users/yugeng/programming/dsh-edu/math-low
```

刷新 Web 会话后，在 `/learn` 或 `/feynman` 选择数学。共享依赖：`learn-core` 管教学、角色与确认；`learn-data` 管快照、记录和 finalize；`learn-errors` 管投放文件。缺少 learn 包无法正常教学。

## 数学画板

独立画板插件在输入框工具栏、模型选择按钮旁提供「数学画板」。学生摆图、圈组、合并/拆开、划去或写说明，自定图案数值与颜色；「放入回答」附上 JSON，不插入图形清单，学生自己写的话会放进输入框，仍需手动发送；画板和修改记录都留着，方便改错。点「清空」才同时清掉画布和这次的修改记录。画板不运算、不自动提交。可附带独立的「我的修改记录」：它记录已发送的语义变化，供学生卡住或主动回看时按需读取；次数不作为诊断或掌握依据。

模型读取已发送附件教学，不读未提交画布；学生明确设置意图时可用 `math_board_settings` 同步会话设置，不代交答案。完整数据与边界见[结构化数学画板](skills/math-core/references/structured-drawing.md)。

## 数据与维护

系统状态在 `outputs/students/`，用户原件在 `data/students/<student_id>/math/raw/`；均不随包发布。原件只读，改名先备份至 `outputs/students/<student_id>/math/backups/raw/`，处理交共享技能。

数学技能复用有效快照，并读取共享 `personal.interests` 与科目偏好。题目按 CGI，题面以生活故事为主，同一关系换场景检验迁移；兴趣只在学生做不出当前题时搭桥。用法见 `skills/math-core/references/math-personalization.md`。每轮唯一 segment 由调用方追加到 `session_log.json`；档案与 finalize 由共享协议执行，完整结构见 `learn-data`。

规则按 `math-core` 条件指针加载，不把参考书摘要放进运行指令；阶段仅作策略摘要，不新增 schema 或设内容门槛。

```bash
node scripts/check-skills.mjs
git diff --check
```

[教学行为对照场景](tests/teaching-scenarios.md)用于人工审阅/模型回放；静态检查不等于行为实测。
