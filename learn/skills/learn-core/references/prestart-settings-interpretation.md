# Prestart Settings Interpretation

个性化只调整语气、例子和支架，不改学习目标，不覆盖学生当前消息。兴趣如何变成情境、题目或桥，由当前学科包规定。

字段路径与模板见 `learn-data` 的 `references/profile-schema.md`。共享档案是跨学科个性化的唯一来源；科目档案只放该学科的学习证据和偏好。不要到共享档案里找 `easy_topics`，也不要把兴趣写进 `learning_state`。会话开始随快照读取即可，不为个性化反复追问或补问。

## Allowed Influence

按当前学科包，用快照中的兴趣、经历、科目偏好与易/难调整呈现与支架；围绕 `hard_topics` 多给支持。偏好只改变呈现方式，不降低目标。兴趣或经历一旦使用，每轮最多一个具体细节。

## Disallowed Influence

这些信息不得覆盖：

- 本轮学习目标。
- 学生当前消息。
- 显式教学指令或教师指定的目标。
- 学科证据：掌握度、困难、错误历史以科目档案为准。

也不要把兴趣变成刻板判断；不要反复追问隐私；不要把 `most_sad_event` 当作教学素材反复使用。学生不愿聊就换普通例子；字段缺失就跳过，不编造。兴趣变化写入 `personal.interests` 或科目 `preferences`（写入协议见 `learn-data` / `/profile`），不静默改学习目标。

## Related

- `learn-data`：字段路径、写入协议与 Privacy。
- `learn-data` 的 `references/grade-band-defaults.md`：年级段与语气。学科领域、题型与初始水平由该学科包定义。
- `session-end-signals.md`：结束判断。
