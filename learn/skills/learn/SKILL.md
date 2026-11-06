---
name: learn
description: 按主题、材料、错题或档案目标开始自适应学习，支持数学与语文。
disable-model-invocation: true
---

# 学习

加载尚未加载的 `learn-core`、`learn-data`，读取并执行 `learn-data` 的 `references/session-lifecycle.md`。新会话使用 `entry_point: learn`、初始 `mode: learn`；已有会话按生命周期恢复。

## 选择目标

新会话或明确换主题时，读取 `learn-data` 的 `references/target-parsing.md`，再读当前学科的目标分类，将用户文本解析为 `target_context`。

- 数学读 `math-core` 的 `references/math-target.md`。语文读 `chinese-core` 的 `references/chinese-target.md`。
- 显式目标优先，其次接续 pending；没有目标时交学科按档案选一个小焦点。
- 空参数后第一条回复提供了主题、材料或路径时采用该目标；只有“好”“开始吧”等回应才从档案选。
- 路径交给 `learn-errors` 处理一次。处理前加载上面的学科目标分类；诊断规则数学用 `math-core` 的 `references/strategy-diagnosis-rules.md`，语文用 `chinese-core` 的 `references/chinese-error-labels.md`。语文保留提取后的材料、作答和意图；数学选择最值得练的错误类型。

## 学科路由

生命周期第 3 步按这张表加载技能，不在生命周期里另选：

- 数学普通教学 → `math-session`；`context.activity: transfer`（包括 pending 恢复）→ `math-student-problem`。
- 语文 → `chinese-session`。activity 为 transfer 且来源为阅读时传 `intent: transfer_read_write`；来源为写作时传 `type: writing_draft`、`intent: revise_writing`。写作迁移不超过 2 轮。
- 学科未安装：说明需要 `dsh-edu-math-low` 或 `dsh-edu-chinese-reading`，停止教学路由，保留已有日志。

## 继续

普通学习的下一步读取 `learn-data` 的 `references/next-step.md`。学生选择当小老师时加载 `feynman`，沿用日志和目标，只切换模式；选择迁移时按生命周期路由。

学生可见回复保留教学内容与简短保存结果。教学由学科技能执行，日志与保存由共享生命周期处理。
