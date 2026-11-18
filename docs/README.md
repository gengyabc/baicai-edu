# 文档索引

维护者文档入口。这里的文件**不随任何包发布，也不被安装的技能加载**；技能必须自包含，不能依赖本目录（见[技能自包含](agents/skill-self-contained.md)）。面向使用者的说明在仓库根 [README](../README.md)，面向单个包的细节在 `<包>/docs/`（部分包另有 `tests/` 下的验收场景）。

## 语言约定

- 根 `docs/` 默认中文单语；`agents/` 内的通用工程指南（[doc-layout](agents/doc-layout.md)、[domain](agents/domain.md)、[issue-tracker](agents/issue-tracker.md)、[triage-labels](agents/triage-labels.md)、[skill-self-contained](agents/skill-self-contained.md)）保留英文原文，[cgi-early-algebra](research/cgi-early-algebra.md) 同为英文。
- **只有包内文档才是双语对**：`name.md` + `name.zh.md`，各自首行带语言切换链接（[learn/docs/](../learn/docs/) 是标准样例）。[doc-layout](agents/doc-layout.md) 里"除 README 外每篇都配 EN/ZH"针对的是包内文档，不要套到根 `docs/`：维护者存档翻倍只会让两边一起过期。
- 一条规则只有一份正本，其余位置一律写成指针；新增文档前先确认它属于哪一类，归属不清时先改一张已有表。

## 使用与安装

| 文档 | 内容 |
|---|---|
| [安装说明](installation.md) | 接收方 `dsh plugin --profile web add <学科包>`、本地 checkout 安装、依赖闭包、重复安装与失败处理、隔离验证 |
| [发布与技能渲染](publishing.md) | `publish.mjs` 发布流程、`resources/` 渲染、单份 provider 的注册方式、发布后隔离验收 |

## 架构与决策

| 文档 | 内容 |
|---|---|
| [技能调用关系与使用场景](skill-map/call-graph.md) | 包依赖、调用面分层、Mermaid 调用总图与逐场景时序、数据写入时机 |
| [术语表](../GLOSSARY.md) | 领域术语正本，写 ADR、issue 与测试名时照此用词 |
| [ADR-0001 共享数学契约](adr/0001-math-shared-contracts.md) | 共同契约的唯一来源、载入链路与保留差异 |
| [ADR-0002 手写图片读取](adr/0002-handwritten-image-reading.md) | 为什么读取层是 `learn` 内部技能 |
| [ADR-0003 先修计划](adr/0003-prerequisite-learning-plans.md) | 递归先修的持久化计划 |
| [ADR-0004 单份技能 provider](adr/0004-single-skill-provider.md) | 为什么只有一份 provider、随包渲染 `resources/` |
| [ADR-0005 首次快速导览](adr/0005-first-run-quick-tour.md) | 首屏导览与完整教程的边界 |

ADR 里的「规格」链接指向 `.scratch/<主题>/` 下已提交的 spec，是当时的设计记录，不是现行规则；现行规则以技能正文为准。

## 教育依据与研究

这些页面**运行时不加载**，研究引用与已安装的可执行规则分开存放。

| 文档 | 内容 |
|---|---|
| [教育依据总索引](education-foundations.md) | 理论合理性 / 教学有效性 / 智能体执行可靠性三层区分、文档地图、共同证据边界 |
| [支持方法来源核验](learn-support-evidence.md) | 学习支持方法的来源、限制与核验边界（维护者存档） |
| [审核矩阵](research/math-skill-audit-matrix.md) | 对照 R1–R14 文献审视 20 条数学教学规则 |
| [表征支架研究](research/math-representation-scaffolding-research.md) | 给图还是学生画、何时撤除，以及 math-board 的设计边界 |
| [CGI 早期代数](research/cgi-early-algebra.md) | 五个方向的教学归纳与高低学段分工 |
| [自主支持与关系边界](research/learning-support-autonomy-and-rapport.md) | 被动来学者的措辞设计与"先交朋友"的证据判断 |

## 维护者协作约定

| 文档 | 内容 |
|---|---|
| [技能维护](agents/skill-maintenance.md) | 改技能、入口调用档位、数据协议的入口与分流 |
| [技能自包含](agents/skill-self-contained.md) | 技能树不放引用型外链，来源留在 `docs/` |
| [领域文档约定](agents/domain.md) | 如何读取 `GLOSSARY.md` 与 ADR |
| [Issue tracker](agents/issue-tracker.md) | `.scratch/` 下的 issue 与 spec 约定 |
| [Triage 标签](agents/triage-labels.md) | 五个 triage 角色到实际标签的映射 |
| [文档布局](agents/doc-layout.md) | 通用指南：README 作首页、细节进 docs、双语与链接检查 |

## 仅本机（不提交）

- `docs/refs/`：公开全文 PDF、书籍摘录与 `SOURCES.txt` 来源清单，编号对应审核矩阵 R1–R14。
- `docs/superpowers/`：规格与计划草稿。

两者都被 `.gitignore` 忽略，只在维护者机器上存在。正文提到它们时写成代码路径（`docs/refs/`），**不要做成链接**：远端读者点开只会是 404。
