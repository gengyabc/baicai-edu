---
name: learn
description: 按主题、材料、错题或档案目标开始自适应学习，支持数学与语文。
disable-model-invocation: true
---

# 学习

加载尚未加载的 `learn-core`、`learn-data`，读取并执行 `learn-data` 的 `references/session-lifecycle.md`。新会话使用 `entry_point: learn`、初始 `mode: learn`；已有会话按生命周期恢复。

## 选择目标

新会话或明确换主题时，读取 `learn-data` 的 `references/target-parsing.md`，将用户文本解析为 `target_context`。

- 显式目标优先，其次接续 pending；没有目标时交学科按档案选一个小焦点。
- 空参数后第一条回复提供了主题、材料或路径时采用该目标；只有“好”“开始吧”等回应才从档案选。
- 路径交给 `learn-errors` 处理一次。语文保留提取后的材料、作答和意图；数学选择最值得练的错误类型。

## 继续

普通学习的下一步读取 `learn-data` 的 `references/next-step.md`。学生选择当小老师时加载 `feynman`，沿用日志和目标，只切换模式；选择迁移时按生命周期路由。

学生可见回复保留教学内容与简短保存结果。教学由学科技能执行，日志与保存由共享生命周期处理。
