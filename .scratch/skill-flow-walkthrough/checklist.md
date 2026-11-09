# 学习技能流程人工走查表

对照：`docs/skill-map/call-graph.md` §3.0 / §4 / §5.2–5.3 / §6；生命周期：`learn-data/references/session-lifecycle.md`。

用法：一次只跑一条路径；勾选前先看 `outputs/students/` 产物，不靠对话印象。静态层先跑：

```bash
node scripts/check-skills.mjs
node --test scripts/skill-contracts.test.mjs
```

---

## 公共检查点（每条路径都看）

| # | 检查 | 通过标准 |
|---|---|---|
| G1 | 会话门槛 | 无 `session.json` / 无 `student_id` → 引导 `/learn-start`，不教学 |
| G2 | 加载链 | 入口先 `learn-core` + `learn-data`；学科只经 `<subject>-session` |
| G3 | 本轮 segment | 教学轮恰好 **1** 个 `session_segment`；内部诊断/桥接/方法证据并入该段 |
| G4 | 写盘时机 | 教学中只追加 `session_log.json` + `context.turn_state`；档案在 finalize / `/learn-save` |
| G5 | 流程卡片 | 科目/身份/年级/偏好/继续·费曼·结束/`stage_options` 用 `ask_user_question`；教学追问纯文字 |
| G6 | 结束信号 | 结束消息不虚构教学 segment；finalize 走 `finalize-session` |

产物路径提示：

- 活跃：`outputs/students/session.json`、`outputs/students/<id>/<subject>/session_log.json`
- 结束后：同科 `profile` / `memory` / `current_state` / `milestones`；幂等看 `current_state.last_finalized_session_id`

---

## P0 — 主干闭环

### P0-1 `/learn-start` 建档（call-graph §4.1）

前置：可用测试学生；或清理后空状态。

- [ ] 选科 / 身份 / 年级 / 偏好均为卡片，不是纯文字追问
- [ ] 写出 `session.json` + 共享 `profile` + 科目骨架
- [ ] `mkdir`：`data/students/<id>/<subject>/raw/` 与 `outputs/.../{extracted,backups}`
- [ ] **不**进入学科教学；提示输入 `/learn`
- [ ] 不写教学 `session_log` segments

备注：

### P0-2 `/learn` 一科一回合 → 结束（§4.2 / 4.3 / 4.9 任选）

建议先数学或语文，英语可另开 P1。

- [ ] 有学生时进入 lifecycle：Open/Resume → Target → Route → Record
- [ ] 路由到对应 `<subject>-session`，学科包未装时说明并停止，保留已有日志
- [ ] 本轮日志 +1 segment；`updated_at` 更新
- [ ] 继续：出现 next-step 卡（继续 / 费曼 / 结束 + 可选 stage_options）
- [ ] 选结束：finalize；`last_finalized_session_id` = 本 `session_id`
- [ ] finalize 后活跃循环结束（再 `/learn` 应新建或按恢复规则，而非静默复用已完成会话）

科目：________  `session_id`：________

备注：

### P0-3 `/learn-save` 与幂等（§4.6）

- [ ] 有可保存内容时走同一 `finalize-session`，不启动教学
- [ ] 再执行一次 `/learn-save`：提示已保存 / 幂等，不重复改档案关键字段
- [ ] 无可保存内容时明确告知，不伪造 finalize

备注：

---

## P1 — 学科调度

### P1-M 数学（§4.2 + 4.2.1）

- [ ] lifecycle → `math-session`；leaf（diagnose / practice / student-problem）**不**直接被 lifecycle 加载
- [ ] leaf 只回证据与信号；最终只有 `math-session` 合并的 1 个 segment
- [ ] 有待答问题时不串调 leaf
- [ ] 同轮最多二次 leaf 加载（有证据且建议转分支时）
- [ ] leaf 收到结束请求 → session → lifecycle finalize，不虚构教学段
- [ ] 投放文件：未处理路径由 lifecycle 调 `learn-errors` **一次**；数学 skill 不自载 `learn-errors`

备注：

### P1-C 语文（§4.3）

- [ ] lifecycle → `chinese-session` → 本轮只选 **一个** 子 skill
- [ ] 未处理投放文件交回 lifecycle（路由器不自载 `learn-errors`）
- [ ] 阶段「写一写」→ `activity=transfer`，由 session 按来源分流（见 P2-1）
- [ ] 每轮仍只有 1 个 segment

备注：

### P1-E 英语（§4.9）

- [ ] lifecycle → `english-session`；仅 session 选择/加载方法
- [ ] 每轮一个主方法（必要时一个辅助）；方法之间不互调
- [ ] 方法只回做法/材料/证据建议/待答状态；**不**自写日志或进度文件
- [ ] `english-session` 合并唯一 segment；计划/材料不记成学生表现
- [ ] 新闻线：无可靠来源时说明无法核实；一次答对不升级 `current_levels`

备注：

---

## P2 — 岔路（主干过后再做）

### P2-1 费曼（§4.4）

- [ ] 活跃会话不新建 `session_id`；只切 `mode: feynman`、`activity: teaching`
- [ ] 清迁移专属进度；收束卡仅「继续讲 / 换一个点 / 结束」

### P2-2 读写迁移（§4.7）

- [ ] 阅读来源 → `chinese-read-write-transfer`；本次迁移 ≤ 2 轮
- [ ] 完成后 `activity` 回 `teaching`；写作来源局部改写不进 transfer skill

### P2-3 投放文件（§4.5）

- [ ] `data/.../raw/` 只读；先备份到 `outputs/.../backups/raw/` 再 `mv`
- [ ] 有 `finalize_plan` 时先 replay 保存再处理新文件
- [ ] 无学生时引导 `/learn-start`

### P2-4 经验桥接（§4.8）

- [ ] 仅阅读内部；经 `chinese-core` 读 reference，不另造 bridge segment / 辅助 skill

### P2-5 边界

- [ ] 无学生直接 `/learn`
- [ ] 学科包未安装
- [ ] 换主题：旧主题 `interrupted` 保存成功后再开新日志
- [ ] 重复 finalize / 崩溃后带 `finalize_plan` 的恢复

---

## 走查记录

| 日期 | 路径 | 结果 | 问题摘要 |
|---|---|---|---|
|  |  | pass / fail |  |

失败时打开对应子图即可，不必重读全文件：

- 主图 §3.0 · 数学 §3.2 · 语文 §3.3–3.4 · 英语 §3.5 · 纪律 §6
