---
name: learn-feynman
description: 费曼学习。学生想当小老师、讲给 AI 听、检查自己是否讲懂，或从普通学习切换为学生主讲时使用；AI 扮演同龄听众。
---

# 费曼学习

加载尚未加载的 `learn-core`、`learn-data`。开始前读取 `learn-core` 的 `references/feynman-mode.md`、`references/feynman-skill-whitelist.md`，执行角色、技能确认与故意犯错规则。

读取并执行 `learn-data` 的 `references/session-lifecycle.md`：

- 已有活跃会话：执行其第 4 步“显式当小老师”。
- 没有活跃会话：新会话使用 `entry_point: learn-feynman`、`mode: feynman`；未完成日志按生命周期接续或保存。

## 选择目标

只在需要新目标时选择：`/learn-feynman` 后的文本或学生说出的讲解目标优先，其次 `current_state.active_focus`，再按生命周期 Resolve Target 的档案候选顺序。显式新目标按生命周期的 Resolve Target 解析（`learn-data` 的 `references/target-parsing.md` 加 `<subject>-core` 学科契约中的目标分类），按 `learn-data` 的 `references/teaching-resolver.md` 复用 teaching，以 `mode: feynman` 路由到 teaching.session_skill（专门路径为 `<subject>-session`，缺包或不适配则通用路径）；目标分类读同一实现的 core 契约。费曼优先于学科迁移。当前会话没有新目标时保留 focus 与 target_context。缺少学科所需材料时只问一个具体问题，不猜原文。

## 回合

学科技能返回回复和一个 segment，`mode`、`submode` 均为 `feynman`。技能证据与错误只记入本轮，由 finalize 写回。危机信号优先按 `learn-core` 的安全流程停止教学。
