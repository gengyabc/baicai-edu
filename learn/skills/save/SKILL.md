---
name: save
description: 保存当前学习会话。学生明确要求保存进度或记录本次学习时使用。
---

# Save

学生明确要求保存时使用，不自动逐轮调用，也不启动教学或诊断。

## Process

1. 加载尚未加载的 `learn-core`、`learn-data`。按 Read Snapshot 确认当前学生并获取日志；没有学生时引导 `/start`，停止。
2. 日志有 `session_id`（即使 segments 为空）时保留该身份与原 `entry_point`；先执行 finalize 的幂等检查，已保存则直接告知，不组装新记录。
3. 仅在没有日志时，从对话中确知的学习表现组装一个最小 segment，契约见 `learn-data` 的 Session Segments：`source: save`，mode/submode 按实际对话填写，未知观察用空数组/空字符串。没有可保存内容则告知并停止。先写新日志，`entry_point: save`，session_id 生成规则遵循 `learn-data` 的 `references/session-lifecycle.md` 的 Open Or Resume。
4. 读取并执行 `learn-data` 的 `references/finalize-session.md`，复用日志中的 session_id 与 entry_point，不复制 patch/合并/保留算法。保存成功即结束原活跃循环；之后继续学习要开新日志。
5. 成功只回复一句“这次已经保存好了，下次可以接着练<focus>”；失败明确说明未保存成功，保留日志可重试。

## Constraints

- 只记录确知表现，不为保存补做诊断或编造学习证据。
- 学科 skill 和 raw 文件无需加载或修改。
- 原始学生 JSON 与内部字段不展示给学生。
