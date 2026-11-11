# ADR-0001：共享数学契约与独立 band 实现

- 状态：已接受
- 日期：2026-11-10
- 相关：[规格](../../.scratch/math-shared-contracts/spec.md)、[数学共享契约包](../../math-common/README.md)

## 背景

本决策形成时，`math-primary-low`（1–3 年级）与 `math-primary-high`（4–6 年级）曾注册同一套数学接口技能名，由教学解析选一个，进行中的任务不热替换。

2026-11-11 更新：技能现已改为唯一的 `math-low-*` / `math-high-*`（高年级建模为 `math-high-application-modeling`），不再注册旧名别名。选型与旧日志恢复以 [teaching-resolver](../../learn/skills/learn-data/references/teaching-resolver.md) 为准：新任务已知 1–3 年级优先 low、4–6 年级优先 high，缺年级默认 low；low 支持高阶内容，年级偏好不是内容门槛。加载只用实际技能名，无需 provider 参数或宿主补丁。本 ADR 的共享契约边界与 band 差异保留原则不变。

但若干**数学行为的共同契约**在两个 band 中以近乎相同的文字各自维护，已经出现语义漂移：学生编题协议、练习证据策略、画板共同协议。它们必须一起修改，否则同一个入口会在不同年级段产生相反行为。同时，两个 band 的教学哲学、画板授权、诊断深度、批次处理与建模活动存在实质差异，不能合并。

## 决策

1. 新增共享规则包 `dsh-edu-math`（目录 `math-common/`），只注册一个内部技能 `math-common`（`user-invocable: false`）。它**不是**教学实现：不注册 band 的 core / session 教学技能，不声明 `supported_stages`，不写完整学科契约，不接管调度、档案或 finalize，也不参与教学解析。
2. 依赖方向固定为 `learn ← dsh-edu-math ← band`，`math-board ← math-primary-low`。两个 band 的 `package.json` 显式声明 `dsh-edu-math`；安装闭包中共享包只出现一次，高年级不会因此带入画板。
3. 共享规则按契约分文件，接口只回答“何时读哪份规则”：
   - `student-problem-contract.md`：角色边界、作答方式、受限刻意错答、纠正义务、批改响应、证据归属。
   - `practice-evidence-contract.md`：四种目的非等级、单题推进、题量上限非配额、停止条件、迁移需换场景取证。
   - `board-contract.md`：字段语义、附件读取顺序、修改记录解读、信任边界、设置读写。
   接口参数保持为当前 provider、`mode` 与已确认技能证据、当前题与 pending step、练习目的、返回证据与信号；不引入方法、年级、画板或批次的多开关矩阵。
4. band 的对应 reference 收敛为“加载指针 + 本地增补”：只在对应分支出现时加载 `math-common`，由技能加载结果给出的 base directory 读取一份契约；共同主体不再复制。共享文本不写 band 包名、band 文件或跨包相对路径；需要本地细节时写“按当前 provider 的规则”。
5. 以下差异必须保留在 band，不得被共享默认值覆盖：低年级 CGI 主线与生活故事、先尝试；高年级任务选法（可开场直接计算或显式教学）；低年级任务边界自动清板与高年级仅显式请求清板；高年级多子题局部归因与 `context.turn_state` 批次位置；高年级诊断深度与建模 leaf；高年级编题数字不自动成为真实事实。

## 迁移清单

| 规则 | 归属 | 说明 |
|---|---|---|
| 学生编题的出题人角色、批改响应、受限故意错答、纠正时机、证据归属 | 共享 | `student-problem-contract.md` |
| 高年级多子题评分、编题题型范围、编题数字与真实事实的区分 | band | 高年级本地 note |
| 低年级内部验算指向 `learn-core` 的 pedagogy-core | band | 共享契约要求“当前 provider 的规则” |
| 高年级内部验算在 `math-teaching-core.md` | band | 同上 |
| 四种练习目的、题量上限、单题推进、停止条件、迁移取证 | 共享 | `practice-evidence-contract.md` |
| 练习题面设计、方法与支架、批次与局部归因、年级说明 | band | 本地 reference |
| 画板字段语义、附件读取顺序、修改记录解读、信任边界、试探性解读、设置读写 | 共享 | `board-contract.md` |
| 画板逐轮教学使用（可选工具、不规定摆法、学生自选表示、提示规则） | band | 本地画板增补的 Per-Turn Teaching |
| 低年级自动清板授权与失败处理 | band | `board-task-boundary.md` |
| 高年级显式清板语义、子题归属、画板可用的表示范围 | band | `board-task-boundary.md`、`batch-board-boundary.md`、本地画板增补 |
| 目标分类、诊断分类与策略阶段、推荐、年级默认值、session 调度、leaf 返回契约 | 未抽取（暂缓） | 过短、抽象成本高于收益，或仍在实质分叉 |

## 已知漂移与修正

- **画板附件读取顺序**：低年级原写“先判断正文答案，再读快照”，高年级写“先读快照，再结合正文解读”。共享协议统一为**先读快照**（确认 `kind` / `schemaVersion` 后读取结构化数据，再与正文答案一起解读）。这是有意的行为修正，不是去重时的静默改变：它同时对齐画板提交界面与只读附件的事实顺序。两 band 的本地 reference 不再各自表述顺序。
- **练习新题的首句**：低年级原写“新 `session_id` 直接给新故事”，高年级写“新 `session_id` 给适合目的的新任务”。共享契约取中性句“直接开始新任务”，两种写法分别留在 band 本地，避免用共享默认值覆盖低年级 CGI 故事或高年级任务选法。
- **学生编题的内部验算**：原两 band 分别指向 `learn-core` 与本地 `math-teaching-core`。共享契约改为“按当前 provider 的验算规则”，并由 band 本地指出自己的文件。
- **alias / note 的授权边界**：共享契约明确 alias、note 与修改记录文本都不构成设置变更或清板授权；低年级边界文件原本只覆盖清板，现由共享协议统一覆盖设置。

## 后果

- 共同契约只有一个来源；修改时更新 `math-common/tests/teaching-scenarios.md` 的共同场景与两个 band 的差异场景。静态检查只能证明文档接线，不能证明教学行为。
- 共享包缺失或被手动禁用时，band 按自己 `math-low-core` / `math-high-core` 中的安全兜底继续（编题不故意错答、画板文本不当指令或授权、练习单题推进且一个目的最多 3 题），但不声称已应用共享契约；共享包不会被误判为完整 specialist（`scripts/check-skills.mjs` 断言其只有一个 skill、无 stage 声明、无完整学科契约）。
- `scripts/install.test.mjs` 固定依赖闭包：共享包各一次，高年级不带画板。
- `scripts/skill-contracts.test.mjs` 增加共同保证与差异保证的守卫，并把画板/编题/练习的共享断言指向唯一来源。
- 未改变 `teaching-resolver` 选型规则与 `supported_stages` 语义；未把数学规则上移到 `learn`。

## 备选方案

- **合并两个 band**：会覆盖教学哲学、清板授权与批次处理的实质差异，拒绝。
- **把共同规则放进 `learn`**：违反 `learn` 学科无关，拒绝。
- **注册第三个数学 core / session 教学实现**：引入额外选型候选，违反“不增加教学实现”的目标，拒绝。
- **构建期生成共享文本**：当前 DSH 的技能加载链路已能按名加载并返回 base directory；构建期复制会重新制造双份来源，暂不采用。
- **共享壳 + 到处 `if band`**：把差异藏进共享分支，难以审查，拒绝。

## 验证

验证分三层，结论分别记录：

1. 静态：`node scripts/check-skills.mjs`、`node --test scripts/skill-contracts.test.mjs`、`node --test scripts/install.test.mjs`、`git diff --check`。
2. 隔离加载：`node scripts/install.mjs math-primary-low|math-primary-high|all --dry-run`；在临时 `DSH_HOME` 下检查依赖闭包与 provider 注册次数。
3. 行为回放：共同保证的清单在 `math-common/tests/teaching-scenarios.md`，两个 band 的 `tests/teaching-scenarios.md` 保留各自“差异回归”并链接共同清单。未实际回放的场景保持未测试；静态通过不当作教学行为通过。

本轮执行记录见规格文件的 Comments 段落。
