# 技能与规则所有权

[English](skills.md) | [中文](skills.zh.md)

本包的技能分两层：入口层只做分流与用户交互，内部技能持有跨学科教学、学生数据与材料协议。本页说明各自职责和每条规则的唯一归属，避免同一规则写在两处。

## 共享内部技能

- `learn-core`：中文语气、以学生为中心、年级适配、难度调整、按需确认、引导无响应、结束信号、人格、费曼规则。
- `learn-data`：`outputs/students/` JSON 数据协议、快照、建档、写回、finalize。
- `learn-errors`：用户投放文件解析、`data/.../raw/` 只读、备份、extracted 写入、error_history 更新；图片读取交 `learn-read-image`。
- `learn-read-image`：用户提供的图片（手写、扫描、截图、数字墨水）的忠实转录、原图归档、`extracted` 读取记录与交回；只在有图时加载，不诊断、不写档案。
- `learn-recommend`：根据当前学科记录推荐具体小目标，标明首选与当前界面语言的理由；内容、难度与排序由教学契约决定，通用路径可按学生请求探索跨领域目标。
- `learn-general-core` / `learn-general-session`：通用任务契约与实际教学；真实科目身份不变，记录不自动升级为专门等级。
- `learn-support`：价值、信心、自主性、学习策略、持续学习的按需方法；自然回应、倾听、纠正、普通话题、公开邀请、拒绝与退出只由 `references/supportive-conversation.md` 维护，定位说明的时机归 `learn-core`。理论依据与阶段/情境参考按需读取，不增加固定动机问卷或第二教学调度者。

## 入口调用档位

入口 skill 分两档：`learn-start` / `learn` / `learn-clean` 设置 `disable-model-invocation: true`，只能由用户键入命令发起，不进入模型目录；`learn-feynman` / `learn-profile` / `learn-save` 保留模型入口，支持对话内自动加载（“我来给你讲”“看看我的档案”“保存一下”）。上述内部 skill 保持模型可加载，只通过 `user-invocable: false` 从 `/` 菜单隐藏。

`/teach` 已被本机全局 `teach` 技能占用，因此费曼入口使用 `/learn-feynman`。

## 规则所有权

- `learn-core`：跨学科教学行为；年级默认、难度调整、费曼角色与白名单分别由其 references 定义。
- `learn-data/references/session-lifecycle.md`：`/learn` 与 `/learn-feynman` 的唯一会话循环。模式切换沿用日志与 entry_point，不重开会话。
- [教学解析](<../skills/learn-data/references/teaching-resolver.md>)与[教学契约](<../skills/learn-data/references/subject-contract.md>)：统一开始、初始化、目标分类、推荐和恢复；专门包按解析出的实际 core/session 技能名定位，缺包采用同接口的通用路径。可选科目只在 `/learn-start` 科目表维护，其他目标可直接描述。
- `learn-data/references/session-schema.md`：每轮读取的日志与 segment 外壳。
- `learn-data/references/profile-schema.md`：档案、记忆、状态、错题与里程碑模板，建档与 finalize 时读取；偏好键、水平、领域、标签和目标分类由学科包定义。
- `learn-core/references/prestart-settings-interpretation.md`：个性化不得覆盖什么、隐私、用量与自评优先级。字段路径归 `profile-schema`；学科怎么用归学科包。
- `learn-core/references/difficulty-adjustment.md`：学生要求降低或提高难度时的判定、当轮调整、日志记录与后续沿用；存储字段归 `profile-schema`。
- `learn-data/references/finalize-session.md`：统一保存流程；保留策略归 `session-retention.md`。
- `learn-read-image/references/reading.md`、`record.md`、`handoff.md`：图片读取、原图与转录记录、交回字段的唯一正文；触发条件由 `learn-core` 的条件行与 `learn-errors` 的图片分支维护，读取层本身不诊断。
- 学科 references：方法、量规、标签与题型的唯一正文；学科 SKILL 保留分流、执行步骤和独有输出。

改技能正文前先读仓库的[技能维护](<../../docs/agents/skill-maintenance.md>)。
