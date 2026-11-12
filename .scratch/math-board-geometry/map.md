# 实施顺序与集成分支

> 状态：**已实施**（#20–#23 均已提交；#20 的 tab 与隔离随 #22 落地）。

## 背景

`docs/math-board-geometry-extension-plan.md` 是设计草稿；首版规格已经收敛为 `../spec.md`，逐条决策在 `../issues/01–17`，实现工单为 `20–23`。本图描述工单之间的任务依赖与实施顺序。

## 任务图

```mermaid
flowchart LR
    20[M0 回归基线与隔离] --> 21[几何模型]
    20 --> 22[几何视图与工具栏]
    21 --> 23[提交与系统提示]
```

- **20**：两个 tab、独立存储键、几何 tab 隐藏数量清空、数量回归基线。先做，否则后面没有落点。
- **21**：`geometry/model.js` 纯模型。20 完成后可独立开工。
- **22**：几何视图。与 21 并行可，但依赖 20 的 tab 与外壳。
- **23**：提交与提示。依赖 21 的模型；需要先有可序列化的快照。

## 实施方式

1. 开工前确认工作区没有与几何模式无关但未提交的改动混进这次提交（如 `docs/math-primary-high-methods.md` 当时的 4 行改动）。
2. 在集成分支上按 20 → 21 → 22 → 23 推进；每张工单单独提交，便于回滚。
3. 每完成一张：`node --test math-board/*.test.js`、`node build.mjs`、`node --check client.js`。
4. 最后跑一次全部 Node 测试与 `node scripts/check-skills.mjs`，再做 `code-review`。

## 落地情况

- 提交 `1da1226`（#21 模型）、`7981363`（#22 视图与 tab，含 #20 的隔离与回归）、`63b8ce5`（#23 提交与系统提示）。
- #20 的两 tab、独立存储键、几何 tab 隐藏数量清空、数量回归基线随 #22 的 `board-shell.js` 落地；数量单页在无几何时仍是原来的组件树。
- 实现取舍：矩形以直角角为定点锚，两个自由角沿各自边滑动（三点闭式 `P4 = P1 + P3 - P2` 决定了第四点）；这保证“怎么拖都还是矩形”，代价是直角角本身不能被拖走。圆拖圆心按“整体平移”处理，半径保持不变。
- 校验：`node --test math-board/*.test.js math-board/geometry/model.test.js`（package.json 的 npm test 也已覆盖几何模型）通过、`node build.mjs`、`node --check math-board/client.js`、`node scripts/check-skills.mjs` 通过。
