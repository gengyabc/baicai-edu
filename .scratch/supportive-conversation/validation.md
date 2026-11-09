# 03 回归验证与文档收尾记录

日期：2026-11-09。范围：执行[更新方案](spec.md)的验证与文档收尾。

## 完成内容

- 在 `scripts/skill-contracts.test.mjs` 新增 5 条契约测试，并扩展现有隐私测试，覆盖：
  - `supportive-conversation.md` 从 `learn-support`、`learn-core`、`autonomy`、`learner-stage`、`assistant-positioning` 可达，且节标题与锚点存在；
  - 交流规则、定位说明、选择卡、生命周期/保存各有单一所有者，新参考不复制 `finalize` / `support_events` / `ask_user_question`；
  - 自然对话保持文字提问，只有实际流程决定才用选择卡，不把情绪表达转成菜单；
  - 纯支持、拒绝、重新主动重开与结束的出口，不按轮数/时间重新邀请；
  - 定位说明按需出现，不承诺零负担，不以“能力提升”持续施压，并保留必要验证、合理巩固与长期保持检查；
  - 隐私回答不承诺未核实的信息边界。
- `assistant-positioning.md` 补充：定位说明不改任务量；即时成功不等于长期掌握；合理巩固要说明理由并协商。
- `supportive-conversation.md` 补充：不承诺“我不会主动告诉家长”这类未核实的转述边界。
- 更新 `docs/skill-map/call-graph.md`、`learn/README.md`、`README.md`、`docs/learn-support-design.md` 的指针与验收状态，不新增架构组件。
- `docs/be-friend.md` 标为设计讨论稿并核对 26 项元分析 / 约 264 万学生的来源；`docs/learn-support-evidence.md` 增加关系支持背景与限制，说明相关不等于因果、真人师生研究不直接证明 AI 效果、运行时规则不引用该数字。
- 新增 `learn/tests/supportive-conversation-scenarios.md`：P01–P16 合成场景回放，记录提示输入、实际输出、判定与限制。

## 静态验证

`node scripts/check-skills.mjs`、`node --test scripts/skill-contracts.test.mjs`、`node --test scripts/*.test.mjs` 均成功退出（0）；逐条结果与跳过项见[回放记录 §8](../../learn/tests/supportive-conversation-scenarios.md#8-静态验证)。

## 合成回放结论

- P01–P16：16 PASS；P07 初版因承诺未核实的信息边界判 FAIL，补规则后重放为 PASS。
- 拒绝后连续闲聊未再次劝学；普通话题未自动转为题目；疲劳、已会、只聊天和结束场景保留了少量验证与可拒绝的出口。
- 全量记录见 [`learn/tests/supportive-conversation-scenarios.md`](../../learn/tests/supportive-conversation-scenarios.md)。

## 未决风险与未执行项

- 未运行独立 DSH Web 模型会话、卡片渲染/点击和安装后入口。
- 短答已回放；完全沉默或空消息无法在文本回放中自然产生，未单独执行。
- 未使用真实学生/家长/成人参与者；不宣称真实对话中的尊重、自主性或关系支持效果。
- 未观察长期保持、迁移、依赖风险和学习成效。
- 未对本变更单独做故障注入；既有支持的保存故障重放不覆盖本次交流规则。
- P07 初版暴露隐私措辞风险，已补规则并重放；其他措辞仍可能重犯。
- 一个既有未跟踪备份 `.scratch/learn-support-acceptance/session.json.pre-acceptance.bak` 保持原样，未纳入本次改动。

## 边界

未修改学生数据，未读取未提交画板，未安装或发布任何包。
