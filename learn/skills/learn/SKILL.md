---
name: learn
description: 自适应学习主入口：读取当前学生快照，解析主题/错题/档案目标，按数学或语文路由到学科 skill，进行多轮教学，判断结束信号并在结束时统一保存。
disable-model-invocation: true
---

# Learn

## Load First

本入口只由用户 `/learn` 发起。先加载尚未加载的 `learn-core`、`learn-data`，再读取 `learn-data` 的 `references/session-lifecycle.md` 并执行其循环；学科内容按路由加载。

入口参数：新会话 `entry_point: learn`、初始 `mode: learn`。恢复、逐轮日志、模式切换、换主题与保存全部遵循共享生命周期，不在入口另设循环。

## Resolve Target

新会话或明确换主题时读 `learn-data` 的 `references/target-parsing.md`，解析用户提供的文本为 `target_context`。空参数但第一条回复给出了主题、材料或路径时采用该目标；仅“好”“开始吧”等回应才从档案选目标。

- 显式目标优先，随后接续 pending；无目标时交学科按档案选一个小焦点。
- 路径交给 `learn-errors`；语文保留提取后的材料、作答和意图，数学用最值得练的错误类型。
- 学科输入与持久化职责按共享生命周期；这里不执行重复的文件分析、教学或日志写入。

`target_context` 的轻量形状：

```json
{
  "type": "topic",
  "topic": "异分母分数加法",
  "source": "manual_topic",
  "files": [],
  "intent": null
}
```

## Continue

普通学习下一步读取 `learn-data` 的 `references/next-step.md`。学生选择当小老师时加载 `feynman`，只切换模式，保留当前日志与目标；迁移按共享生命周期路由。

本入口不重复定义教学规则、segment schema、结束信号或 finalize。学生可见回复只保留教学内容与简短保存结果；内部对象不展示。
