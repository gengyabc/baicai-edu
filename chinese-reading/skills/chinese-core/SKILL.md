---
name: chinese-core
description: 语文教学共享规则底座：阅读核心与六种深读方法、写作核心与六圈展开、反馈流程、出题规则、批改量规、统一错误标签。语文各子 skill 在教学前加载它，并按需读取 references 下对应文件。
user-invocable: false
---

# Chinese Core（语文规则底座）

## Purpose

把语文的六份核心规则收进一个可被语文子 skill 按需加载的底座。本 skill 只提供语文专属规则；语气、确认机制、年级段、结束信号、费曼规则、数据协议仍归 `learn-core`、`learn-data`、`learn-errors`，这里不重复。

本 skill 只被读取，不产生教学回合；由 `chinese-session` 路由到具体子 skill。没有 `session.json` 时先引导学生运行 `/start`。

## When To Use

- 任何语文教学、诊断、出题、批改动作开始前。
- `chinese-session` 路由完成后，被路由到的子 skill 需要语文规则时。
- 需要选择错误标签、判断档位、提取行文技巧时。

语文子 skill 的语文规则只从本 skill 的 references 读；共享规则（语气、确认、年级、兴趣使用边界）从 `learn-core` 读。加载结果会给出 base directory，参考文件按 `<base_directory>/references/<文件名>.md` 读取；不要写跨 skill 的相对路径。

## Reference Loading

| 时机 | 读取 |
|---|---|
| 阅读教学、六种深读方法、常见阅读问题 | `references/chinese-reading-core.md` |
| 写作教学、六圈展开、升格、行文技巧提取与读写迁移 | `references/chinese-writing-core.md` |
| 给反馈、提炼方法、长期学习管理 | `references/chinese-feedback-core.md` |
| 生成阅读题或写作题 | `references/chinese-task-generation.md` |
| 批改作文、判断档位、给最值得改的 3 处 | `references/chinese-assessment-rubric.md` |
| 选择阅读/写作错误标签、写入错题记录 | `references/chinese-error-labels.md` |
| 使用兴趣、偏好、易/难主题 | `learn-core` 的 `references/prestart-settings-interpretation.md` |

按需读取，不要一次全部读入。至少规则：

- 阅读教学前读 `chinese-reading-core.md`。
- 写作教学前读 `chinese-writing-core.md`。
- 下判断（批改、诊断、出题）前读对应的 `chinese-assessment-rubric.md` 或 `chinese-task-generation.md`。
- 每次要落标签前读 `chinese-error-labels.md`。

## Shared Rules From learn-core

以下内容不在本 skill 重复，按 `learn-core` 执行：

- 中文语气、以学生为中心、不羞辱不贴标签。
- 三步确认（追问思路 → 换角度验证 → 最终确认）。
- 引导无响应时的支架与最多 3 次规则。
- 年级段默认值与学段适配。
- 结束信号与人格叠加（Guided Coach / Socratic Tutor）。
- 费曼模式与可追踪技能白名单。
- 兴趣、偏好、易/难和经历只影响语气、例子、阅读角度、写作题目、桥梁和支架；具体字段与边界见 `learn-core/references/prestart-settings-interpretation.md`。
- 改写、代写、学生数据展示的安全边界。

## 执行边界

- 阅读证据、方法与纠偏以 `references/chinese-reading-core.md` 为准；六圈、升格与迁移技巧标准以 `references/chinese-writing-core.md` 为准。
- 出题的原文依据、学段、答案和判分检查以 `references/chinese-task-generation.md` 为准；作文档位与分项以 `references/chinese-assessment-rubric.md` 为准。
- 反馈聚焦与建议数量以 `references/chinese-feedback-core.md` 为准；标签定义与诊断落库以 `references/chinese-error-labels.md` 为准。
- 阅读角度、写作题目、迁移主题与桥接优先从 `personal.interests` 取合适具体细节；不合适则用年级默认主题，不硬套。
- 保留学生自主表达：只给局部示范，不代写完整作文或完整作答；出题配套参考答案按出题标准提供，不与教学中的代答混淆。

## Ownership

- 本 skill 不产生学生可见回复，不写学生数据，不生成 `session_segment`。
- 具体教学回合、诊断、出题由调用方 skill 负责；本 skill 只被读取。
- 需要读写 `outputs/students/` 时，由调用方按 `learn-data` 协议执行；需要处理错题文件时，由调用方加载 `learn-errors`。

## Related Skills

- `learn-core`：共享教学规则与人格。
- `learn-data`：学生数据协议、快照、finalize。
- `learn-errors`：错题文件解析与 `error_history` 更新。
- 语文子 skill：`chinese-session`、`chinese-reading-session`、`chinese-writing-session`、`chinese-read-write-transfer`、`chinese-generate-tasks`、`experience-gap-bridging`。
