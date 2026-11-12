# M0 回归基线与隔离

Type: task
Status: ready-for-agent

## 目标

建立数量模式的回归基线，并为几何模式开出一块互不干扰的地盘，不新增任何图元。

## 背景

首版目标见 `../spec.md`；决策依据见 `../issues/02-sent-only-read-two-modes.md`、`09-abstraction-import.md`。

## 验收

- [ ] `node --test math-board/*.test.js` 全通过（当前基线 126 项全通过）；`node build.mjs` 与 `node --check client.js` 通过。
- [ ] 一个入口、顶部数量／几何两个 tab；两 tab 各自的画布、撤销历史、选择与视口，切换不互见。
- [ ] 几何草稿使用独立存储键（建议 `dsh-edu-math-board:geometry:v1:${sessionId}`），数量模式原 key、v1–v4 迁移、clear envelope、config watermark 原样保留。
- [ ] 刷新与切换 tab 后各 draft 恢复；数量模式的导入、导出、放入回答、清空行为无差异。
- [ ] 几何空状态严格校验；导入失败不改变当前草稿。
- [ ] 几何 tab 中不显示 `math_board_clear` 请求的任何入口或提示（`issues/07-hide-quantity-clear.md`）。
- [ ] `math_board_settings` 的投影仍只作用于数量模式；几何 tab 切换不触发 `applyHostConfig` 对几何状态的重放。

## 不在本单

- 几何图元、渲染、提交；见 `21-geometry-model.md`、`22-geometry-view.md`、`23-submission-prompt.md`。
