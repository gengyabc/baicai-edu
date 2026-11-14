# 数学技能唯一名迁移

## 决策

原 provider 限定载入方案已由用户暂停并撤回，改为从技能命名解决冲突；已安装 DSH 的三份文件已与本轮补丁逐字比对后从原始备份恢复，不需要宿主补丁。

- 低年级包：`math-low-core`、`math-low-session`、`math-low-diagnose`、`math-low-practice`、`math-low-student-problem`。
- 高年级包：对应 `math-high-*`，另有 `math-high-application-modeling`。
- 新任务明确年级 1–3 优先 low，4–6 优先 high；无明确年级默认 low。年级与默认带不是内容门槛，low 不拒绝高年级或更高内容。
- 日志记录实际唯一 core/session 名，不新增 provider 载入参数；已有任务保持原带。旧裸名记录仅在来源可确认时迁移活动上下文；无法确认先问，不按现年级猜测原实现，不改历史证据。
- 学科 id 仍为 `math`，共享规则仍为 `math-common`，不添加裸名兼容别名。

## 验收

- 两包所有注册技能名唯一，目录、frontmatter、调用引用一致；现行文档链接同步。
- 静态检查对任意重复技能名报错，包含重复数学技能的负例测试。
- 路由与恢复规则契约、原有教学规则回归通过。

## 保留资料

`backup/` 保存撤回宿主补丁所用原件，`patched/` 与旧验证脚本仅为已放弃方案的本地留档，不参与安装或运行。
