---
name: chinese-core
description: 语文教学共享规则。开始阅读、写作、读写迁移、出题或评改前加载；诊断落标签、提炼写法或安排长期训练时按分支读取规则。
user-invocable: false
---

# 语文规则

1. 教学前加载 `learn-core`，共享语气、确认机制、年级适配、结束信号、人格、费曼、技能追踪与安全边界均按它执行；使用兴趣、偏好、易/难主题或经历时，读其 `references/prestart-settings-interpretation.md`。
2. 没有 `session.json` 时引导 `/start`。具体回合由 `chinese-session` 路由到子 skill；本 skill 只提供规则，不产生学生可见回复、`session_segment` 或学生数据写入。
3. 语文专属规则以本 skill 的 references 为准，按下表读取，不一次全部读入。加载 skill 返回 base directory 后，用 `<base_directory>/references/<文件名>.md` 定位；跨 skill 引用先按名称加载，不拼跨 skill 相对路径。

| 条件 | 读取 |
|---|---|
| 阅读教学前；需要六种深读方法、文本证据或阅读纠偏 | `references/chinese-reading-core.md` |
| 写作教学前；需要六圈、升格或提炼迁移技巧 | `references/chinese-writing-core.md` |
| 给反馈、提炼方法或安排长期训练前 | `references/chinese-feedback-core.md` |
| 生成阅读题或写作题前 | `references/chinese-task-generation.md` |
| 批改作文、判断档位或选择最值得改的 3 处前 | `references/chinese-assessment-rubric.md` |
| 每次选择阅读/写作错误标签、记录诊断前 | `references/chinese-error-labels.md` |

阅读角度、写作题目、迁移主题与桥接优先从 `personal.interests` 选合适的具体细节；不合适则用年级默认主题，不硬套。保留学生自主表达，只给局部示范，不代写完整作文或完整作答；出题配套参考答案按出题规则提供。

需要读写学生数据时，由调用方加载 `learn-data` 并按其协议执行；需要处理错题文件时，由调用方加载 `learn-errors`。本 skill 不承担教学、诊断或持久化。
