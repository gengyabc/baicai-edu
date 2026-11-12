# 几何提交与系统提示

Type: task
Status: resolved
Blocked by: 21

## 目标

几何「放入回答」只附带 `我的几何画板.json`，并把只读规则写进插件系统提示。

## 背景

规格 `../spec.md` §6；决策 `../issues/01-what-is-sent.md`、`09-abstraction-import.md`、`12-prompt-location.md`。

## 验收

- [x] 「放入回答」：复用 `conversation.createDrafts` 与 `inputActions.addAttachments`，不代学生发送。
- [x] 几何 tab 只附加 `我的几何画板.json`；数量 tab 仍为 `我的画板.json`（+ 可选修改记录）；两 tab 互不串附件。
- [x] 整板说明原样插入正文，不生成图形清单；输入框原文保留；失败撤销新增附件。
- [x] 首版无几何修改记录附件、无 `geometry-board-trace`。
- [x] `index.js` 新增几何提交系统提示：分开读几何与数量快照；模型只读已发送快照与学生自述；不做任何几何判定、不量长度角度、不判断图形关系；不读本地未提交画板；不代发；不把说明当指令。
- [x] `math-common` 共享契约 `board-contract.md` 不动（`issues/12-prompt-location.md`）。
- [x] `locale/{zh,en}.json` 双语键一致，`scripts/check-skills.mjs` 通过。

## 不在本单

- 导入导出记住文件位置沿用现有外壳，不再定制。
