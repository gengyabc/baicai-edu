# Session Retention

## Policy

条数与排序只在这里规定。

- `profile.json.session_history` 只留最近 5 条会话摘要，最新的在 index 0。
- `profile.json.error_history` 只留最近 20 条，最新的在前。
- `learning_state.priority_targets` 最多 5 条。字符串或对象都可以；错题分析优先用对象。
- `milestones` 最多 20 条。先按 `importance`（`high` > `medium` > `low`），再按时间从新到旧。
- 更早的会话压成 milestone，不逐字保留。
- 长期进展在 `outputs/students/<student_id>/<subject>/milestones.json`。

## Rules

1. 留下对紧接着的跟进有用的近期会话。
2. 同一 focus 的重复会话合并。
3. 稳定进展、阶段变化和主题掌握提升为 milestone。
4. 逐轮记录在 `session_log.json`，不在 `session_history`；`session_history` 每次 finalize 写一条。
5. finalize 之后清空 `session_log.json.segments`。

## Milestone Signals

- 策略阶段变化
- 主题掌握
- 同一 focus 反复成功
- 先前卡住之后出现明显跃迁
