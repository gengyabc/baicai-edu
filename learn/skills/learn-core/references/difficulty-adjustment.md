# 难度调整

学生提出降低或提高难度时，本轮按一个负荷因素调整呈现方式，把方向和对象记进日志；finalize 后写入科目记忆，供后续材料沿用。难度是呈现偏好，不是水平，不改 `current_levels`。

## 什么时候记录

- 学生明确说材料、题目或文本“太难 / 简单一点 / 降低难度”或“太简单 / 难一点 / 提高难度”：记录。
- 学生在某一步卡住、没听懂或答不出：先按 `references/guidance-non-response-handling.md` 和学科支架处理；只有同时表达“以后也这样”才记为难度要求。
- 分不清是针对这一篇还是以后：按这一篇调整并记录方向，`note` 写清对象；不追问，不把一次请求当成水平结论。

## 本轮怎么调

只改一个负荷因素，保留任务目标和材料完整意思。因素可以是句子长度与生词量、数字或步骤的复杂度、表示的具体程度、提示量、文本长度或问题层数；每轮只动一个，其余保持。

- 材料已呈现时不重写全文；从下一个问题或下一篇开始按新方向。
- 不宣布“你现在的水平是……”，不给等级，不把调整记成掌握或退步。

## 记录在哪

`session_log.json` 的 `context.difficulty_request`：

```json
{
  "direction": "easier",
  "note": "图片新闻句子长、生词多",
  "requested_at": "2026-11-07T20:19:00+08:00"
}
```

- `direction`：`easier` / `harder` / `standard`。学生说“正常难度 / 不用调了”记 `standard`。
- 同一会话后一次请求覆盖前一次；`note` 只写学生原话概括和对象，不写诊断标签。
- 没有请求时不写这个字段；由入口统一写日志。

## 后续怎么用

- 学科生成新材料、题目或文本前读 `memory.profile_memory.material_difficulty`，按 `direction` 调整一个负荷因素。
- `note` 写明对象时，优先在同类材料上沿用；对象不明确时按一般材料处理。
- 方向沿用，直到学生再次明确要求；学生没有再说时，不因为一次表现好就自动改回 `standard`。
- 只在生成新材料时生效；已在进行的文本保持完整，不在中途改写。

## 保存

- 教学轮只写日志；finalize 的 memory patch 把 `context.difficulty_request` 并入 `profile_memory.material_difficulty`，`updated_at` 用 `requested_at`。
- 不经过 finalize 的会话不写科目记忆，不声称已保存。
