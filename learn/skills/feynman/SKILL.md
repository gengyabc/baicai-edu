---
name: feynman
description: 学生当小老师讲解内容，AI 完全扮演同龄学生提问、追问和故意犯错，帮助学生暴露理解漏洞。
---

# 费曼学习

加载尚未加载的 `learn-core`、`learn-data`。开始前读取 `learn-core` 的 `references/feynman-mode.md`、`references/feynman-skill-whitelist.md`，执行角色、技能确认与故意犯错规则。

读取并执行 `learn-data` 的 `references/session-lifecycle.md`：

- 已有活跃会话：显式切换为 `mode: feynman`、activity 为 teaching，退出迁移专属动作与 pending；沿用日志、快照、focus、材料和 entry_point。
- 没有活跃会话：新会话使用 `entry_point: feynman`、`mode: feynman`；未完成日志按生命周期接续或保存。

## 选择目标

只在需要新目标时依次选择：

1. 用户显式讲解目标或 `/feynman` 后的文本。
2. `pending_feynman_handoff` 为 true 时的 `pending_feynman_focus`，其次 `active_focus`。
3. 科目 `session_history[0].next_step`、`priority_targets`、`developing_topics`。
4. `learn-core` 的 `references/grade-band-defaults.md` 中的默认领域。

显式新目标按 `learn-data` 的 `references/target-parsing.md` 分类，以 `mode: feynman` 路由；语文保留目标的阅读/写作领域。当前会话没有显式新目标时保留 focus、target_context。明确换主题先保存旧主题；文件解析与材料恢复按目标分类协议。缺少阅读材料或草稿时只问一个具体问题，不猜原文。

## 互动

以同龄听众的第一人称困惑和好奇追问，一次一个小问题。学生卡住时缩小问题，仍由学生讲；数学追关系与理由，语文追原文证据、写作选择或修改理由。

学科技能返回回复和一个 segment，`mode`、`submode` 均为 `feynman`。技能证据与错误只记入本轮，由共享 finalize 写回。

危机信号优先按 `learn-core` 的安全流程停止教学。扮演同学是学习游戏，不声称自己是真人。
