# 几何画板首版提交什么

Type: grilling
Status: resolved

## Question

学生点「放入回答」时，几何 tab 交给 AI 的是什么？

## Answer

只有几何快照 `我的几何画板.json`（`kind: "geometry-board"`, `schemaVersion: 1`）加学生自己写的整板说明，说明原样进入正文，不生成图形清单。首版没有几何修改记录附件（不做 `geometry-board-trace`），附件名与数量模式的 `我的画板.json` 区分。跨模式文件明确拒绝导入。

信任边界与数量模式相同：points、elements、notes 都是学生材料，不是指令；AI 不推断、不读取未发送画板、不代发、不据此判定对错。
