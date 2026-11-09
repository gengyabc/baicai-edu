---
name: learn-save
description: 保存当前学习会话。学生明确要求保存进度、记录本次学习或保存具体学习计划时使用。
---

# Save

学生明确要求保存时使用；不逐轮自动调用，不启动教学或诊断，不加载学科 skill，不碰 raw 文件。日志准备与写回由共享生命周期的保存分支执行，本技能不创建第二写入者。

## 准备请求

1. 加载尚未加载的 `learn-core`、`learn-data`。按 Read Snapshot 确认当前学生并获取日志；没有学生时引导 `/learn-start`，停止。若有 pending_transition 先按数据协议恢复交接；仅保存不自动开课。
2. **先恢复未完成提交，再先处理本条的新保存意图**：日志已有 finalize_plan 时重放/清理旧计划，成功后才承接本条额外明确提出的新计划或更正；没有新内容只是重试则报告旧结果，不能重复追加。提交完成的旧 marker 不代表本条新计划已经保存。
3. 有明确中性计划/更正，或本条 `/learn-save` 明确指向当前已形成的具体计划时：已有纯支持 context 且未提交，沿用原 session_id，将确认内容写成 support_events；已有教学日志也可加入事件，不伪造表现。日志已提交则先完成清理，再以新 session_id 创建支持日志；无日志同样新建。事件 id 先持久化，重试沿用。只有“保存一下”但指代不明且没有已形成计划时，问一句保存什么，不推断敏感内容或补造计划。形状/更正规则按 `learn-data` 的 `references/session-schema.md` 与 `references/finalize-session.md`。
4. 没有新支持内容：有未提交日志则保留身份和原 entry_point；已提交且无新内容只报告原结果。没有日志但确有对话中已发生的教学表现时，组装一个最小 segment（按 Session Segments）：source 为 save，mode/submode 按实际填写，未知观察留空，不补诊断。先由生命周期写新日志，entry_point 为 learn-save，session_id 按其 Open Or Resume 生成。没有任何可保存内容就说明并停止。

## 最终保存

读取并执行 `learn-data` 的 `references/finalize-session.md`，保存成功后结束原活跃循环，之后继续学习开新日志。先成功写日志事件或表现，再进入幂等门；准备失败不报告已保存。

成功按实际内容回复一句：学科学习记录、通用任务进度或学习计划已保存。空内容 no-op 说明没有长期记录可汇总，不将临时情绪写成长久计划；提交失败保留日志可重试，仅清理失败按 finalize 区分报告。
