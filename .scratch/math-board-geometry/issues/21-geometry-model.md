# 几何模型：geometry/model.js

Type: task
Status: resolved
Blocked by: 20

## 目标

实现 `kind: "geometry-board", schemaVersion: 1` 的纯模型：校验、约简、序列化；不涉及视图。

## 背景

规格 `../spec.md` §3、§4、§5；决策 `../issues/03-primitives.md`、`05-rectangle.md`、`14-labels.md`、`15-rectangle-parallelogram.md`、`16-delete-integrity.md`、`17-drag-constraints.md`、`09-abstraction-import.md`、`08-notes-copy.md`。

## 验收

- [x] `geometry/model.js` 导出 `createGeometryModel()`：`empty/validate/reduce/serialize/shapeLibrary`，与 `model.js` 同样的工厂 + 内联构型，无第三方依赖。
- [x] 图元：点（自由）、线段、多边形、圆（圆心 + 圆上点）、平行四边形、矩形；`points` + `elements` 结构，无 `relations`、无 `annotations`、无 `summary`、无 `notes` 多选说明。
- [x] 点显示 `label` 且可改名；`label` 快照内唯一；引用只认 `id`；删点后空号不回收。
- [x] 允许孤立点。
- [x] 构造运算：`midpoint`（两点→一点）；平行四边形与矩形三点定第四点，各自闭式运算，矩形附加直角约束；派生点位置由构造求值，不持久化为权威坐标。三种构造都写 `P4 = P1 + P3 − P2`（P2、P4 为对角），因此快照里只存三个输入 ID，拖动语义不被形状类别决定。
- [x] 拖动：`movePoint` 对角不动、其余角联动；拖动被吸收在退化阈值处；圆上点不得与圆心重合。
- [x] 删除传播到全部下游，一次撤销；拒绝悬空引用。
- [x] 快照校验：白名单字段、唯一 ID/标签、无 NaN/Infinity、坐标界、零长度线段/共线多边形/零半径圆拒绝、非法构造 DAG（环、缺失依赖）拒绝、说明长度上限。
- [x] 序列化确定性；`validate(serialize(x))` 往返一致，且不含 `summary`。
- [x] 跨模式：带 `kind` 且不为 `geometry-board` 的文件直接拒绝；不提供切换或转换。
- [x] 数量 `model.js` 补显式 `kind` 判定（现字段白名单已间接挡住几何 v1），并补负例测试：数量模型拒绝几何 JSON、几何模型拒绝数量 JSON。
- [x] 测试覆盖格式：负例、稳定引用、几何计算、构造图、往返、隔离（见计划 §10.1，按首版缩）。
- [x] 属性测试：`D=midpoint(B,C)` 有 `2D=B+C`；拖动后仍成立；平移前后中点结果一致。

## 不在本单

- 渲染与交互（见 `22-geometry-view.md`）；提交与提示（见 `23-submission-prompt.md`）。
