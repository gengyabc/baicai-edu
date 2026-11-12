# 摘要字段与跨模式导入

Type: grilling
Status: resolved

## Question

几何快照要不要 `summary`？跨模式导入怎样拒绝？

## Answer

- 几何快照不生成 `summary`。`summary` 是数量画板的确定性数量汇总；几何没有数量语义，`kind` 本身就足以区分。`checkEnvelope` 对几何只允许 `kind: "geometry-board"`。
- 跨模式导入拒绝：两个模式都只接受自己的 `kind`；带 `kind` 且不为自身 kind 的文件直接拒绝并提示“这是另一个画板的文件”，不提供切换确认、不提供转换。
- `model.js` 需补显式 `kind` 判定与对应负例测试（现有字段白名单已经挡住几何 v1，但没有把“拒绝另一个 kind”写成规则）。
