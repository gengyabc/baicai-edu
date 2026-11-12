# 说明的复制与引用完整性

Type: grilling
Status: resolved

## Question

去掉多选说明之后，几何对象的说明怎么随编辑走？

## Answer

补充 `03-primitives.md` 的说明规则：

- 整板说明 `note` 一份，几何 tab 与数量 tab 各自一份，切换不复制。
- 每个图元（点、线段、多边形、圆、矩形）可带一条 `note`，与该图元一起增删；拖动、重算不改变它。
- 不设 `notes` 多选说明、不设组。计划 §4.2 的 `annotations` 数组取消。
- 复制对象时复制其说明；删除对象时其说明一并删除。
