# 07: 几何构造互动章

**What to build:** 学生通过指定工具亲手创建平行四边形、矩形和中点，再拖动自由点、创建辅助图形，理解构造工具及点的操作差别，不把图形外观当作数学结论。

**Blocked by:** 03 — 几何基础教程与安全练习闭环。

**Status:** resolved

## 验收条件

- [x] 覆盖 G06–G09：平行四边形与矩形各自实际完成三点构造，普通多边形或未结束预览不能替代。
- [x] 学生先选中可用线段或边，实际执行取中点并生成对应派生点；自由落点、工具点击失败或不满足前置条件均不推进。
- [x] 指定自由点实际移动并松手提交；说明派生点不能直接拖动，不要求以不可拖动对象作为拖动任务目标。
- [x] 开启辅助线后亲手成功创建辅助角色图形，再关闭；仅切换开关不算完成整个练习。
- [x] 仅验证指定工具与操作成功，不测量长度角度、不判断平行/垂直/相等/共线，不对学生结论真假或图像相似度评分。
- [x] 连续复用基本绘制成果，同时支持目录独立开始、续学、重置、跳过、补练和重练；预置条件不冒充学生本步成果。
- [x] 练习构造、派生点、辅助线状态及撤销历史不写入真实草稿；退出/刷新保持两种真实画板与附件不变。
- [ ] 中英提示及鼠标/触屏均可完成；自动回归覆盖构造成功、非法前置、错误工具和隔离，记录交互回放并执行相关构建和检查。

## 边界

遵循规格 G06–G09、第 9–11 节。只解释工具保证和可操作差别，不新增几何判题能力，不改变原有构造模型。

## Answer

- 几何构造章 `geometry-construct` 的步骤为 `construct-parallelogram / construct-rectangle / construct-select-side / construct-midpoint / construct-drag / construct-auxiliary / construct-auxiliary-off`。平行四边形和矩形只认对应工具新提交的图形；普通多边形、未结束预览和另一种四边形都不通过。选边只认一条两端都是自由点、且还没有中点的线段或多边形/矩形/平行四边形的边。取中点只认这条边的 `addMidpoint` 派生点。拖动只认目标里标出的那个自由点在松手后位置变了。辅助线先要提交一个 `role` 为 `auxiliary` 的新图形，再把开关从开拨到关。不测量长度角度，不判断平行、垂直、相等或共线，也不按图形在画布上的位置给分。几何模型和基础章步骤列表都没有改。
- `start(previousFrame)` 返回练习画面。已有足够的自由点和一条可用线段时复用，否则只补这些前提；三点若共线会再补一个不共线的点，因为模型拒绝平掉的平行四边形。这些创建不送进 `observe`。`fresh()` 返回 `{ frame, saved }`。`skip` 准备下一步的点、线段、选中的边、可移动自由点，或在辅助图形那一步之前把辅助开关关掉；不调用 `observe`，也不替学生创建本步要求的平行四边形、矩形、中点或辅助图形。不一致的已存目标抛出 `Invalid construct goal`，不自行修补。
- 已勾选的隔离项由本章单元测试和几何页处理器回放覆盖：退出后预置的真实几何草稿不变，数量草稿不变，上传、附件和发送次数为 0。练习记录写在 `practice:v2:geometry`，不写几何草稿键。单章重练不清基础章已完成的步骤。
- 最后一项未勾：中英和 `mouse`／`touch` 指针类型都有处理器回放，聚焦检查与全量测试已执行，但没有真实浏览器、真实鼠标、触屏设备或布局验收。处理器回放不是浏览器通过。
- 实现提交 `5789ac06092ece055755439bbebbf4825c56b4a8`，分支 `feat/tutorial-07`。未合并，未推送。
- 聚焦命令在拖动重置修复后为 **62/62 通过**：`node --test math-board/src/geometry/geometry-construct.test.js math-board/src/geometry/geometry-view.test.js math-board/tests/practice-construct-bundle.test.js`。实现提交 `5789ac0`，拖动标记修复 `8b59e43`，集成合并 `d82943b`。全量 `npm --prefix math-board test` 在该修复之前为 **412 项、411 通过、1 失败**，修复之后没有重跑全量。唯一失败是既有 [tool-schema.test.js:214–220](<../../../math-board/src/host/tool-schema.test.js#L214-L220>) 的 fenced JSON recipe，`assert.ok(get)`。未改教学契约。生成客户端仍保留基础章，并把 `createGeometryConstructChapter` 放进 `geometryPracticeChapters`。中英词典 UI 键数相同（384）。重置拖动步骤后，视图会重新选中那个自由点。
- 详细命令、计数和未执行边界见 [验证记录](<../../../math-board/docs/tutorial-07-validation.md>)。接入说明见 [安全教程扩展接口](<../../../math-board/README.md#安全教程扩展接口>)。
