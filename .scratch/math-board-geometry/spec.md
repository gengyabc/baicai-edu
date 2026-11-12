# math-board 几何模式：首版规格

> 状态：grilling 已收敛，**待用户最终确认**。  
> 本规格替代 `docs/math-board-geometry-extension-plan.md` 中与之冲突的部分；该计划保留为设计草稿，不删除。  
> 决策逐条记录在 `.scratch/math-board-geometry/issues/`（01–17）。

## 1. 定位

几何模式是**只画、只读**的表达工具，与数量画板并列：

- 学生画自己的几何图形；AI 读取学生**已发送**的快照和学生自己写的说明，按学生自述回应。
- 首版不追问辅助线、不给教学建议、不推导、不评论图画得像不像，不据此判定对错。
- 判定由程序做：中点、矩形/平行四边形的第四顶点等构造运算本身就是判定；模型不做任何几何推断（`06-programs-decide.md`、`13-program-decides-scope.md`，属首版限制，不写 ADR）。

## 2. 界面

- 同一入口，顶部两个 tab：数量、几何。两 tab 各自的画布、工具栏、草稿存储键、撤销历史、选择与视口，切换不互见、不转换、不传递数据（`02-sent-only-read-two-modes.md`）。
- 共用题目参考条、「我想说」、「放入回答」；「放入回答」只按当前 tab 附加对应文件。
- 几何 tab 提供缩放与适应宽度；网格与吸附开关是本地 UI 状态，不进快照。
- 高年级显式调用的 `math_board_clear` 只作用于数量模式；几何 tab 中不显示任何清空请求入口或提示，几何作品保留。首版不新建几何清空工具（`04-geometry-clear.md`、`07-hide-quantity-clear.md`）。
- 几何 tab 手动「清空本模式」：确认后清画布与该模式撤销历史，不删附件。

## 3. 图元（`03-primitives.md`）

| 图元 | 定义 | 拖动语义 |
|---|---|---|
| 点 | 自由点，学生放置；暂不支持派生点为独立图元 | 自由移动 |
| 线段 | 引用两个已有点；端点可来自空白处自动落点 | 端点各自自由移动 |
| 多边形（含三角形） | 三个及以上已有点的闭合对象 | 顶点各自自由移动 |
| 圆 | 圆心点 + 圆上点 | 拖圆心上点整体平移；拖圆上点伸缩半径，不得与圆心重合 |
| 平行四边形 | 三点定第四点（闭式运算），保持对边平行 | 拖任一角，其对角不动，另两角重算 |
| 矩形 | 与平行四边形同族，附加直角约束 | 拖任一角，其对角不动，另两角按直角重算 |

- 砍掉射线、直线、一般四边形模板、交点构造；首版唯一精确构造族为“两点/三点 → 一点”的闭式运算：`P4 = P1 + P3 − P2` 时 P2、P4 是对角，拖动任一角即拖 P1/P3（对角不动），拖 P2/P4 时改由对角 P1/P3 重算。
- 点显示 A/B/C 标签且可改名；引用只认稳定 ID；标签在快照中唯一（`14-labels.md`）。
- 允许孤立点（`10-labels-tools.md`）。
- 退化被吸收在拖动阈值处，预览不进入快照与撤销（`17-drag-constraints.md`）。

## 4. 说明与引用完整性

- 整板说明 `note` 一份/模式，两 tab 各一份；每个图元可带一条 `note`，随图元删除。
- 不设多选说明、不设组、不设 `relations`、不设 `annotations` 数组（`08-notes-copy.md`、`11-declaration-status.md`）。
- 删除传播到全部下游，一次撤销；不留悬空引用；快照拒绝引用不存在或类型不正确的 ID（`16-delete-integrity.md`）。

## 5. 数据

`kind: "geometry-board", schemaVersion: 1`：

```
points:   [{ id, label, kind: "free"|"derived", x, y, construction?, note }]
elements: [{ id, type: "segment"|"polygon"|"circle"|"parallelogram"|"rectangle", points|centerPointId+radiusPointId, role, note }]
note:     整张画板说明
display:  不进快照
```

- 没有 `summary`；`checkEnvelope` 只允许 `kind: "geometry-board"`（`09-abstraction-import.md`）。
- 跨模式导入明确拒绝，不提供切换确认、不转换；`model.js` 补显式 `kind` 判定与负例测试。
- 坐标系独立：`cartesian-2d`，`units: "board-unit"`，y 向下。
- 派生点位置由构造运算求得，不持久化为权威坐标（计划 §4.1 保留）。

## 6. 提交（`01-what-is-sent.md`、`12-prompt-location.md`）

- 「放入回答」只附带 `我的几何画板.json`；整板说明原样进正文；学生手动发送。
- 首版无 `geometry-board-trace`，附件名与数量 `我的画板.json` 区分。
- 只读规则写进插件系统提示（`math-board/index.js`），`math-common` 共享契约不动。

## 7. 相对设计草稿的变化

| 计划条目 | 首版处理 |
|---|---|
| §2.1 模式切换开关 | 改为两个 tab |
| §2.2 标记/关系 | 推迟 |
| §3 分层架构、mode-adapters | 推迟；首版按 tab 隔离 + 共用外壳 |
| §4.2 relations / annotations | 取消 |
| §5.1 数值测量/判定 | 推迟；由程序构造完成判定 |
| §5.2 M2 垂线/平行线/交点 | 推迟 |
| §6 场景优先级表 | 推迟；首版不按场景设计教学 |
| §7 教学协议、§7.3 trace | 只保留只读提示；无 trace |
| §8.2 geometry_board_clear | 取消；复用 math_board_clear 语义 |
| §9 M2/M3 | 推迟 |
| §10.4 AI 离线对照 | 推迟 |
| §11 约束引擎风险 | 仅 DAG 构造，无求解器 |
