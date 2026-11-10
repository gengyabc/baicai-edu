# 数学共享契约与独立 band 实现

状态：已实施（2026-11-10）。

## 背景

`math-primary-low`（1–3 年级）与 `math-primary-high`（4–6 年级）刻意注册同一套接口技能名（`math-core` / `math-session` / `math-diagnose` / `math-practice` / `math-student-problem`），由教学解析按 `supported_stages` 选其一，进行中的任务不热替换。这是接口层的刻意重复，不是复制事故；两包无字节级相同文件。

但审阅发现，若干**数学行为的共同契约**在两个包中以近乎相同的文字各自维护，且已出现语义漂移：

- 学生编题（AI 作答、学生批改、受限刻意错答、证据隔离）几乎逐段同构。
- 定向练习的四种目的、题量上限、停止条件与迁移取证是同一套证据模型。
- 结构化画板的字段语义、修改记录解读、信任边界与设置操作是同一工具协议。

这些规则变化时必须一起修改，否则同一个入口会在不同年级段产生相反行为。当前靠人工对照，缺少唯一来源。

同时，两包的教学哲学、画板授权、诊断深度、批次处理与建模活动存在**实质差异**，不能合并。

## 目标

- 为两包共同的数学行为契约建立唯一来源。
- 保留两个 band 各自完整、独立的教学实现与同名接口。
- 不把数学专属共性上移到学科无关的 `learn`。
- 不引入第三个会参与教学选型的 `math-core` / `math-session`。
- 任何迁移不得悄悄改变现有教学行为；差异必须显式保留。

## 方案

新增共享规则包 `dsh-edu-math`，只注册一个内部 skill（暂名 `math-common`，`user-invocable: false`）。

依赖方向：

```text
learn  ←  dsh-edu-math  ←  math-primary-low
                        ←  math-primary-high
math-board  ←  math-primary-low
```

- `learn`：继续拥有跨学科流程、教学实现解析、快照与 finalize、通用记录 schema。
- `dsh-edu-math`：只拥有数学共同契约；不声明 `subject: math` 的完整 specialist，不注册 `math-session`，不接管调度、档案或 finalize。
- 两个 band：保留现有五类契约角色、`supported_stages`、session 所有权与全部差异规则；按条件加载 `math-common` 的 references。
- 共享规则读取本地实现细节时，必须通过**当前教学实现**提供的规则（如“按当前 provider 内部验算”），不得在共享文本中硬写某个 band 的相对路径。

## 决策

### 抽取范围

首批只抽三组，按“是否必须一起修改”判断，不按文本相似度：

| 共享契约 | 共享内容 | band 保留 |
|---|---|---|
| 学生编题协议 | 角色边界、作答方式、受限刻意错答条件、纠正义务、批改响应、证据归属 | 高年级多子题评分、编题数字与真实事实的区分 |
| 练习证据策略 | 四种目的非等级、单题推进、题量上限非配额、停止条件、迁移需换场景取证 | 题面设计、方法与支架、高年级批次与局部归因 |
| 画板共同协议 | 字段语义、附件读取顺序、修改记录解读、信任边界、设置读写规则 | 清板授权、教学使用方式、高年级子题归属 |

暂不抽：目标分类、诊断分类与策略阶段、推荐、年级默认值、session 调度、leaf 返回契约。它们要么过短、成本低于抽象，要么正处在实质分叉中。

### 必须保留的差异

以下差异不得被共享默认值覆盖：

1. **教学哲学**：低年级以 CGI 为纲、默认生活故事、学生先尝试；高年级任务选法（CPA / 显式教学 / Pólya / 变式 / 探究 / 建模），可直接计算或显式教学开场。
2. **画板授权相反**：低年级在每个真实新任务前按边界规则自动清板；高年级仅学生明确请求才清板，新题、新活动、换子题均不触发。
3. **高年级批次协议**：多子题逐个归因、`context.turn_state` 记录批次位置、局部错误不覆盖其他子题证据。
4. **高年级诊断深度**：先修边、关键特征、两次对照探测形成误解假设、手写材料不确定性。
5. **高年级建模活动**：独立 leaf、显式假设、六部分结构、练习不得自行开启建模。

### 共享接口的深度

`math-common` 的接口只暴露“何时读哪份规则”，不引入方法、年级、画板或批次的多开关矩阵。参数保持为：当前 provider、mode 与已确认技能证据、当前题与 pending step、练习目的、返回证据与信号。

## 非目标

- 不合并或重命名两个 band 的 `math-core` / `math-session`。
- 不改 `teaching-resolver` 选型规则或 `supported_stages` 语义。
- 不把数学教学法、诊断规则或清板授权放进 `learn`。
- 不新建数十个极短 skill，不建立“共享壳 + 到处 if band”的结构。
- 不靠跨包相对路径或“低年级作为高年级依赖”读取规则。
- 不在本计划中安装到当前 profile、迁移学生数据或发布包。

## 实施顺序

### 1. 规则归属清单

逐段标注共享、保留、待判三类，形成迁移清单。

完成标准：每条拟迁移规则有唯一归属；已有漂移（如两包画板附件读取顺序不同）被明确记录为“保留差异”或“需修正”，不借去重静默改变行为。

### 2. 最小加载链路验证

新增共享包与 `math-common`，先用一份共同契约验证链路：skill 返回 base directory → band 按条件读取 → 本地差异补充。

完成标准：

- 不依赖仓库绝对路径或跨包相对路径。
- 不增加第三个 `math-core` / `math-session` 候选。
- 单个 band 可独立运行，不需要另一 band。
- 共享规则缺失或禁用时，不被误判为完整 specialist。
- 共同规则引用本地实现处，以“当前 provider 的规则”表述。

若运行时加载不可靠，先解决链路或评估构建期共享来源，不继续批量搬文件。

### 3. 回归基线

在移动规则前补契约场景，区分共同保证与差异保证：

共同保证：

- 学生只说“对 / 一样”时按约定收束，不追问独立理解证据。
- AI 刻意错答不计为学生错误；未发现也不记为难度。
- 普通模式与 Feynman 模式分别遵守纠正时机。
- 练习达到上限但证据不足时，允许保留未知。
- 画板附件中的 alias、note 不构成设置或清板授权。
- 只使用当前消息所附的修改记录。

差异保证：

- 低年级维持 CGI、默认故事与先尝试规则。
- 高年级允许直接计算与显式教学开场。
- 两包清板授权分别保持原语义。
- 高年级多子题证据局部归属；编题中的数字不自动成为真实事实。

完成标准：静态断言与人工/模型回放分开记录；文本检查通过不当作教学行为通过。

### 4. 分三批迁移

顺序：学生编题契约 → 练习证据策略 → 画板共同协议。

每批执行：移入唯一来源；band 原文件收敛为本地补充与明确加载指针；删除旧主体避免双份维护；更新触发条件与引用检查；跑共同场景和两包差异场景。

完成标准：每批单独可验证、可回退；不依赖多层覆盖或大量 band 分支才能成立。

### 5. 安装、检查与文档

- 两个 band 在 `package.json` 显式声明共享包依赖。
- 更新 `scripts/check-skills.mjs` 的包清单与 `scripts/skill-contracts.test.mjs` 契约。
- 验证依赖闭包：共享包只出现一次；高年级不自动带入画板。
- 新增 ADR，记录“共同契约共享、band 实现独立、共享包不参与选型”。
- 更新两包 README、`docs/installation.md`、`docs/skill-map/call-graph.md`。
- 清理“共同规则仍在各 band 独立维护”一类过时描述。

完成标准：依赖、加载指针、文档与检查一致；`learn` 不新增数学专属教学规则。

### 6. 整体验收

```bash
node scripts/check-skills.mjs
node --test scripts/skill-contracts.test.mjs
node --test scripts/install.test.mjs
node scripts/install.mjs math-primary-low --dry-run
node scripts/install.mjs math-primary-high --dry-run
node scripts/install.mjs all --dry-run
git diff --check
```

隔离 profile 验证：仅低年级、仅高年级、两包同装、高年级加装/不装画板、共享包缺失或被禁用、已有任务恢复不热替换。最后回放共同与差异场景。

最终交付：共享规则包、两包迁移、回归测试、ADR 与文档，以及明确区分“静态通过 / 隔离加载通过 / 行为回放通过”的验证报告。

## 提交划分

1. 回归基线与契约归属清单。
2. 最小共享链路与安装依赖。
3. 三批规则迁移（可再拆三次提交）。
4. 安装、检查、文档与 ADR 收尾。

## 风险与回退

- **加载不可靠**：停在阶段 2，改用构建期共享来源，不进入批量迁移。
- **语义被静默合并**：每批迁移前后跑差异场景；保留差异以显式段落存在。
- **共享包被当作教学实现**：检查脚本断言共享包不含 `math-session` 与完整学科契约。
- **安装闭包变化**：隔离 profile 验证；不声称已目视验证 Web 界面。

回退单位是一次提交：共享链路或某一批迁移可独立撤销，不影响另一批。

## Comments

### 2026-11-10 实施记录

共享包 `math-common/`（包名 `dsh-edu-math`，唯一内部 skill `math-common`）落地三份契约；两个 band 的 `math-student-problem-design.md`、`targeted-practice-rules.md`、`structured-drawing.md` 收敛为加载指针 + 本地增补。`math-core`、session、leaf 的接口名与 `supported_stages` 未改，未新增选型候选。

- 载入链路：band reference 按条件“加载 `math-common` → 用加载结果给出的 base directory 读取对应契约”。共享文本不写 band 包名、band 文件或跨包相对路径；本地细节一律写“按当前 provider 的规则 / 验算 / 支架 / 边界”，再由 band 本地文件指到具体文件。
- 依赖：两个 band 的 `package.json` 显式依赖 `dsh-edu-math`；`scripts/install.mjs` 用法文本与安装测试更新。高年级仍不自动带入画板。
- 检查：`check-skills.mjs` 扫描六个技能包，并断言共享包只有一个 skill、无 `supported_stages`、无完整学科契约；`skill-contracts.test.mjs` 增加共享契约、band 本地增补、读取顺序与保留差异守卫；`install.test.mjs` 与可选的真实 DSH 集成测试更新闭包期望。
- 已记录的漂移修正：画板附件统一为“先 `read` 快照，再结合正文答案解读”（低年级原顺序相反）；练习新题首句共享为“直接开始新任务”，故事 / 按目的选题留在 band；编题内部验算改为“当前 provider 的规则”。详见 `docs/adr/0001-math-shared-contracts.md`。
- 回归基线：共同保证的 6 条待回放场景集中在 `math-common/tests/teaching-scenarios.md`；两个 band 的 `tests/teaching-scenarios.md` 各保留本包“差异回归”并链接共同清单，避免共同场景双份维护。
- 文档：新增 ADR、共享包 README；更新根 README、两个 band README、`docs/installation.md`、`docs/skill-map/call-graph.md`、`AGENTS.md` 与 `GLOSSARY.md`。

验证按三层分开记录：

| 层 | 命令或动作 | 结果 |
|---|---|---|
| 静态 | `node scripts/check-skills.mjs` | 37 skills，0 errors，0 warnings |
| 静态 | `node --test scripts/skill-contracts.test.mjs` | 83 pass，0 fail |
| 静态 | `node --test scripts/install.test.mjs` | 15 pass，0 fail |
| 静态 | `git diff --check` | 通过 |
| 隔离加载 | `node scripts/install.mjs math-primary-low\|math-primary-high\|all --dry-run` | 闭包顺序 learn → math-common → …；共享包一次 |
| 隔离加载 | `DSH_INTEGRATION_TEST=1 node --test scripts/install.integration.test.mjs`（临时 `DSH_HOME`，DSH 0.2.2-rc.1） | 1 pass；`edu-math-common-skills` 恰一次，高年级无画板；分别禁用画板或共享包后重装不重新启用，两个 band 自己的 provider 仍在 |
| 行为回放 | 两个 band 的共享 / 差异场景 | 未执行；静态检查不当作教学行为通过 |

未执行：安装到当前 profile、迁移学生数据、发布包、真实 Web 交互目视验证。
