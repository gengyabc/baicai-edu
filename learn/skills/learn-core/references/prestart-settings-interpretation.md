# Prestart Settings Interpretation

个性化信息只调整语气、例子、阅读角度、写作题目和支架，不改学习目标，不覆盖学生当前消息。

## Where Each Field Lives

个性化信息分两处，不要混：

| 字段 | 位置 | 作用 |
|---|---|---|
| `name` | 共享 `profile.json` | 称呼 |
| `grade` / `grade_band` | 共享 `profile.json` | 年级适配 |
| `personal.interests` | 共享 `profile.json` | 兴趣、爱好、常做的事；例子、阅读角度、写作题目、搭桥的首选来源 |
| `personal.most_exciting_event` | 共享 `profile.json` | 正向经历；鼓励、例子、写作素材 |
| `personal.most_sad_event` | 共享 `profile.json` | 只用于轻度搭桥；不主动复述；学生不愿说就跳过 |
| `profile.preferences` | 科目 `profile.json` | 学习方式偏好：数学 `likes_visual` / `likes_story_context` / `likes_direct_calculation`；语文 `likes_model_text` / `likes_oral_explanation` / `likes_revision` |
| `profile.self_report.easy_topics` / `hard_topics` | 科目 `profile.json` | 学生自评的易/难主题；用于选起点和支架 |

共享档案是跨学科个性化的唯一来源；科目档案只放该学科的学习证据和偏好。不要到共享档案里找 `easy_topics`，也不要把兴趣写进 `learning_state`。

## Allowed Influence

这些信息只能影响：

- 语气和称呼。
- 例子、情境、阅读角度、写作题目、迁移主题。
- 从兴趣或正向经历搭桥。
- 围绕 `hard_topics` 提供更多支架。
- 选择呈现方式：视觉、故事、直接计算、朗读、口头解释、改写。

### Chinese

- **阅读**：用兴趣选一个可进入的例子或问题来打开文本；不能改原文、不能把阅读变成兴趣聊天。学生说“我喜欢足球”时，可以用足球比赛里的“关键时刻”帮助理解叙事节奏，但结论必须回到原文证据。
- **写作**：优先从兴趣里找具体素材和题目角度；学生不想写兴趣时，换一个他愿意说的素材。不要替学生编经历。
- **出题**：写作题和阅读材料尽量贴近兴趣；没有合适材料时用年级段默认题型，不要硬套。
- **读写迁移**：迁移主题优先选兴趣相关的情境，但技巧必须来自原文。
- **经验桥接**：优先用兴趣、日常物件、熟悉的角落做低风险替代经验；不用高风险或隐私经历。

### Math

- 用兴趣做情境（分披萨、踢足球计分、画画比例），但数字和知识点按当前目标调整。
- `likes_visual` → 多给图、线段、实物；`likes_story_context` → 多给生活情境；`likes_direct_calculation` → 先给纯算式，再补情境。
- 偏好只改变呈现方式，不降低目标。

## Disallowed Influence

这些信息不得覆盖：

- 本轮学习目标。
- 学生当前消息。
- 显式教学指令或教师指定的目标。
- 学科证据：掌握度、困难、错误历史以科目档案为准。

也不要把兴趣变成刻板判断（“你喜欢足球，所以你一定擅长…”）；不要反复追问隐私；不要把 `most_sad_event` 当作教学素材反复使用。

## Usage Rule

1. 会话开始时随快照读取，不为了个性化反复追问。
2. 每轮最多用一个具体的兴趣/经历细节；不要堆砌。
3. 学生说“不想聊这个”时立即停止，换普通例子。
4. 字段缺失时跳过，不要因此阻塞会话或编造。
5. 学生自己提到兴趣变化时，记到 `personal.interests` 或科目 `preferences`，不要静默改学习目标。

## Related

- `learn-data`：字段路径与写入协议。
- `grade-band-defaults.md`：年级段默认值。
- `session-end-signals.md`：结束判断。
