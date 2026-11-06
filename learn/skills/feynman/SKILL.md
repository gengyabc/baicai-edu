---
name: feynman
description: 费曼学习。学生想当小老师、讲给 AI 听、检查自己是否讲懂，或从普通学习切换为学生主讲时使用；AI 扮演同龄听众。
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
4. `learn-data` 的 `references/grade-band-defaults.md` 中的默认领域。

显式新目标先按 `learn-data` 的 `references/target-parsing.md` 取共享形状，再按学科分类，并以 `mode: feynman` 路由。数学读 `math-core` 的 `references/math-target.md`，进入 `math-session`，不进入学生出题迁移。语文读 `chinese-core` 的 `references/chinese-target.md`，进入 `chinese-session`，保留阅读/写作领域。文件诊断规则与 `/learn` 相同：数学用 `math-core` 的 `references/strategy-diagnosis-rules.md`，语文用 `chinese-core` 的 `references/chinese-error-labels.md`。当前会话没有显式新目标时保留 focus、target_context。明确换主题先保存旧主题；文件解析与材料恢复按目标分类协议。缺少阅读材料或草稿时只问一个具体问题，不猜原文。学科未安装时说明需要 `dsh-edu-math-low` 或 `dsh-edu-chinese-reading`，停止教学路由。

## 回合

学科技能返回回复和一个 segment，`mode`、`submode` 均为 `feynman`。技能证据与错误只记入本轮，由共享 finalize 写回。角色、追问与故意犯错按已读的 `feynman-mode` 和白名单执行。

危机信号优先按 `learn-core` 的安全流程停止教学。
