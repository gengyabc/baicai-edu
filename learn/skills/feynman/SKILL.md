---
name: feynman
description: 费曼学习模式：学生当小老师讲解数学或语文，AI 完全扮演同龄学生提问、追问和故意犯错，帮助学生暴露理解漏洞。
---

# Feynman

## Load First

先加载尚未加载的 `learn-core`、`learn-data`。费曼开始前读取 `learn-core` 的 `references/feynman-mode.md` 与 `references/feynman-skill-whitelist.md`，分别作为角色和技能确认/故意犯错的唯一规则来源。

读取 `learn-data` 的 `references/session-lifecycle.md` 并执行共享循环：

- 已有活跃会话：按共享生命周期的显式模式切换设置 `mode: feynman`、activity 为 teaching，退出迁移专属动作与 pending；沿用日志、快照、focus、材料与 entry_point。没有第二个费曼循环，也不转移保存职责。
- 直接进入且没有活跃会话：新会话参数为 `entry_point: feynman`、`mode: feynman`；未完成日志的接续与保存按共享流程处理。

## Resolve Target

只在需要新目标时按顺序选择：

1. 用户显式讲解目标或 `/feynman` 后的文本。
2. `pending_feynman_handoff` 为 true 时的 `pending_feynman_focus`，再看 `active_focus`。
3. 科目 `session_history[0].next_step`、`priority_targets`、`developing_topics`。
4. `learn-core` 的 `references/grade-band-defaults.md` 中的默认领域。

显式新目标按 `learn-data` 的 `references/target-parsing.md` 构造目标类别与意图，再以 `mode: feynman` 路由；费曼是互动模式，不把所有语文目标改成默认阅读。当前会话中没有显式新目标时保留 focus 和 target_context。明确换主题先按共享生命周期保存旧主题；文件解析与材料恢复遵循共享分类协议。缺少阅读材料或草稿时只问一个具体问题，不猜原文。

## Role

AI 以同龄听众的第一人称困惑和好奇追问，一次一个小问题。学生卡住时把问题缩小，仍由学生讲；数学追关系与理由，语文追原文证据、写作选择或修改理由。

学科 skill 负责教学回复和一个 segment，`mode` / `submode` 为 `feynman`；本入口不再生成第二份记录。技能证据与错误只进入本轮记录，写回由共享 finalize 执行。

危机信号优先按 `learn-core` 的安全流程停止教学。AI 扮演同学是学习游戏，不声称自己是真人。
