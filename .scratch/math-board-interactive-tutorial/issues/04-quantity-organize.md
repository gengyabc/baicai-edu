# 04: 数量整理互动章

**What to build:** 学生对同一批练习物品完成命名、分组、合并及日常整理，亲手体验这些操作的区别与结果；本章既可接续基础成果，也能从目录独立重练。

**Blocked by:** 02 — 章节导航、续学与补练。

**Status:** resolved

## 验收条件

- [x] 覆盖 Q04–Q09：对象命名、圈组/组命名/解散、合并/拆开、复制、划去、删除；每个独立动作均有实际练习和成功条件。
- [x] 保存有效对象名称后重新选择可读到；取消/无效输入不通过。成功形成包含目标成员的组、修改组名并解散，多次添加对象不能算分组。
- [x] 用满足同形、同值、同组或均未分组、同别名规则的练习对象合并，再按合并来源拆开；失败/禁用点击不推进。不改变现有分组或合并规则。
- [x] 复制产生目标副本且原对象保留；划去实际改变目标状态而非删除；删除移除指定对象而非清空整个画板。
- [x] 随操作说明分组不等于合并、灰色结果不表示错误、拆开与来源有关，不替学生判断运算或数学答案。
- [x] 目录能开始/续学/重练本章，适当复用上一步作品，独立进入时有足够练习起点；失败可提示、重置、跳过并补练。
- [ ] 所有动作、名称、组及来源只在教程练习生效；退出/刷新/异步保存不污染真实草稿、修改记录、撤销历史或附件。
- [ ] 中英提示、鼠标和触屏流程齐全；自动测试覆盖每项成功及至少一个失败/误判路径，记录完整章节回放并执行相关构建和回归检查。

## 边界

按规格第 5 节 Q04–Q09 及第 9–11 节验收。本票向后续说明章提供可创建、命名、解散练习组的完整操作，不只添加分组事件名称。

## Answer

- 实现提交 `a51fa7fd10ae6ed2bb92bf581fc1285b83e40334`（`feat/tutorial-04`）。未合并进 `feat/math-board-interactive-tutorial`，未推送。
- 数量整理章 `quantity-organize` 的步骤为 `organize-name / organize-reselect / organize-peer / organize-group / organize-group-name / organize-ungroup / organize-merge / organize-split / organize-copy / organize-crossout / organize-delete`。每一步只认学生已经提交的操作：有效新名称、重新选中并读到该名称、第二个对象改为同一名称、新建包含两个标记成员的组、改掉组的现名、解散该组、按现有 `mergeCandidate` 规则合并、按来源拆开、复制且原对象仍在、划去后对象仍在、删除该对象且其余对象仍在。空名称、给别的对象起名、多添加对象、单人组、失败或禁用的合并、拆开别的对象、复制别的对象、把划去当成删除、删除别的对象、清空整板、以及只选中待删除对象，都不推进。分组不是合并，灰色合并结果不是错误，拆开与来源有关，本章不判断运算或数学答案。`model.js` 的分组与合并规则、共享生命周期 `createPracticeProgress` 均未改。
- `start(previousFrame)` 按共享生命周期返回练习画面，而不是 `{frame, saved}`。`fresh()` 仍同时返回画面和目标种子。`skip` 准备的名称、组和合并对象不送进 `observe`。拆开之后的跳过会把合并对象拆回两个活的成员，否则复制、划去和删除没有可操作的标记对象。
- 已勾选的六项由本章单元测试和数量编辑器处理器回放覆盖。隔离复选框未勾：退出和重新挂载后预置的真实草稿不变，单元测试也确认练习存储不写入 `baicai-edu-math-board:v4:session`；没有为本票单独重跑异步锁队列。最后一项未勾：中英和 `mouse`／`touch` 指针类型都有处理器回放，但没有真实浏览器、真实鼠标、触屏设备或布局验收。处理器回放不是浏览器通过。
- 构建与检查：`node math-board/build.mjs`、`node --check math-board/client.js`、`git diff --check` 通过。聚焦命令 **41/41 通过**：`node --test math-board/src/quantity/practice-organize.test.js math-board/src/quantity/view-practice.test.js math-board/tests/practice-organize-bundle.test.js`。全量 `npm --prefix math-board test` 为 **373 项、372 通过、1 失败**；唯一失败仍是既有 [tool-schema.test.js:214–220](<../../../math-board/src/host/tool-schema.test.js#L214-L220>) 的 fenced JSON recipe，`assert.ok(get)`。未改教学契约。生成客户端仍注册 `createQuantityAdjustChapter`，并把 `createQuantityOrganizeChapter` 接在其后。中英词典键数相同（354）。
- 详细命令、计数和未执行边界见 [验证记录](<../../../math-board/docs/tutorial-04-validation.md>)。接入说明见 [安全教程扩展接口](<../../../math-board/README.md#安全教程扩展接口>)。
