---
name: learn
description: 按主题、材料、错题或档案目标开始自适应学习，支持已安装的学科包（数学、语文、英语等）。
disable-model-invocation: true
---

# 学习

加载尚未加载的 `learn-core`、`learn-data`，读取并执行 `learn-data` 的 `references/session-lifecycle.md`。新会话使用 `entry_point: learn`、初始 `mode: learn`；已有会话按生命周期恢复。

## 选择目标

按生命周期的 Resolve Target 解析（`learn-data` 的 `references/target-parsing.md` 加 `<subject>-core` 学科契约中的目标分类）。本入口另有一条：空参数 `/learn` 后，学生的第一条回复若给出主题、材料或路径，就采用它作为目标；只有“好”“开始吧”这类回应才从档案选。

学生不知道学什么、询问接下来学什么或想换但没有具体目标时，按生命周期推荐闸门加载 `learn-recommend`；复用当前学科记录给候选，选定后再教学，不直接套用档案首项。

## 学科路由

生命周期的 Route And Record 加载 `<subject>-session`。普通教学、附加动作与迁移恢复都先进入它；子技能、参数和轮数限制由学科维护。

## 继续

普通学习的基础菜单保留「继续」「费曼」「结束」，并加入「换个内容」：继续交当前学科推进，费曼加载 `learn-feynman`，结束交生命周期 finalize；换个内容加载 `learn-recommend`，此时只推荐，不切任务。学科回传的 `stage_options` 按 `learn-data` 的 `references/next-step.md` 合并展示，附加动作交回声明它的学科执行。
