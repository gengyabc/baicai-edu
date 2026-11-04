# Prestart Settings Interpretation

## Purpose

定义如何把学生共享档案里的基本信息用作个性化提示，而不是第二套持久化 schema。

## Current Truth

在当前 `/learn` / `/feynman` 会话中，`outputs/students/<student_id>/profile.json` 是以下八个 Prestart 字段的当前真相：

`name`、`grade`、`preference`、`easy_topics`、`hard_topics`、`hobbies`、`most_exciting_event`、`most_sad_event`。

科目档案里可能还留有旧的 preference / self-report 提示；对上述八个字段，共享档案优先。

科目学习证据仍然是掌握度、困难历史、里程碑和当前学习状态的权威来源。

## Allowed Influence

这些字段只能影响：

- 语气
- 例子
- 从 `easy_topics` / `hobbies` / 生活经历搭桥
- 围绕 `hard_topics` 提供更多支架

## Disallowed Influence

这些提示不得覆盖：

- 本轮学习目标
- 学生当前消息
- 显式教学指令或教师指定的目标

## Usage Rule

- 每轮开始读共享档案，把八个字段当作语气与例子提示。
- 不要把八个字段写进科目掌握度、优先目标或路由状态。
- 科目学习证据与共享档案冲突时，掌握度/难度/里程碑以科目证据为准。
- 读完即用，不为了个性化而反复追问学生隐私。
