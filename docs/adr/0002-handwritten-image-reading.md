# ADR-0002：手写图片读取作为 learn 内部技能

- 状态：已接受
- 日期：2026-11-11
- 相关：[规格](../../.scratch/handwritten-input/spec.md)、[读取层](../../learn/skills/learn-read-image/SKILL.md)、[手写契约](../../math-common/skills/math-common/references/handwritten-work-contract.md)

## 背景

学生的手写作业、草稿、教材页与题目照片需要先被忠实读取，才能成为教学证据。原实现是 `math-common` 下的第二个技能 `handwritten-math-reader`：它面向 4–6 年级，交接给本仓库不存在的 `upper-primary-math-coach` 等技能名，并自带 `tutor` / `parent_review` 模式与运行时 YAML。它与以下约束冲突：

1. `scripts/check-skills.mjs`、`scripts/skill-contracts.test.mjs`、`AGENTS.md` 与 `docs/adr/0001` 都固定 `math-common` 只注册内部技能 `math-common`。
2. 忠实读取不只服务数学；其他学科也需要读图。
3. `learn-errors` 的 `error_history` 面向错题；做对的作业、教材页与题目照片不该进错题档案。

## 决策

1. 新增跨学科内部技能 `learn-read-image`（`user-invocable: false`），只在有图时加载；负责忠实转录、歧义标记、原图归档、转录记录与交回；不诊断、不代答、不产 `session_segment`。
2. 数学特有的读图提示、核对事实与证据映射放进 `math-common` 的第四份契约 `handwritten-work-contract.md`；年级无关；两个 band 的 `math-core` 条件行先读契约再加载读取层，不建 band 本地指针。
   - 这是对 ADR-0001 决策 4（band 的对应 reference = 加载指针 + 本地增补）的有意例外：手写契约年级无关、没有本地增补，再放一个指针文件只会多一层空转。ADR-0001 对其余三份有本地差异的契约继续有效；共享文本仍不写 band 包名或跨包相对路径。
3. 附件由当前学科 session 触发；路径 / `scan all` 仍由入口交 `learn-errors`，图片统一交给同一读取层；错题的诊断与 `error_history` 留在 `learn-errors`。
4. 原图进 `raw`、转录进 `extracted`；内容哈希识别同一张图，同一张图只读第一次；原图是唯一忠实载体，不存 SVG。消息附件归档时在 `raw/` 建立一个**新的**原件并按最终名命名；已存在的 raw 原件不被覆盖、改写或删除，因为不替换任何文件，新副本不产生备份。
5. 读取层只给事实；`error_type` / `label` / 掌握判断仍来自 band 的 `strategy-diagnosis-rules.md`。

## 备选方案

- 在 `math-common` 注册第二个技能：破坏单技能不变量，且无法服务其他学科，拒绝。
- 作为 `learn-core` 的条件 reference：没有单一入口与自己的 references，记录协议要另放，拒绝。
- 扩 `learn-errors` 承担所有图片：把错题档案与一般作业混在一起，拒绝。
- 两个 band 各自实现读取：共同行为双份维护，必然漂移，拒绝。

## 后果

- 固定技能清单、`call-graph` 计数、`AGENTS.md` 与学习包 README 已同步更新。
- `learn-errors` 不再自己读图，保留文件搬运、错题诊断与 `error_history`；做对的作业只留读取记录。
- `math-common` 从三份契约变为四份，但仍只注册一个技能、不参与选型。
- 静态检查只能证明接线；读取歧义、错题与做对作业的区分仍需行为回放。

## 验证

静态检查通过：`check-skills`（38 skills，0 errors）、`skill-contracts.test.mjs`（新增接线守卫）、`install.test.mjs`、`git diff --check`。行为场景在 `math-common/tests/teaching-scenarios.md` 与 `learn/tests/image-reading-scenarios.md`，本轮未实际回放。
