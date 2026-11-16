# 05: 数量说明互动章

**What to build:** 学生分别给整张数量画板、单个图形、组和多选对象写学生说明，重新选择后核对文字归属，理解“我想说”的目标取决于当前选择。

**Blocked by:** 04 — 数量整理互动章。

**Status:** resolved

## 验收条件

- [x] 覆盖 Q10–Q13，四种作用域分别实际写入有效说明，不能只打开说明卡或空保存通过。
- [x] 整板说明步骤明确取消选择后再保存，重新打开可读到整板说明；自动选中新图形不能把内容截成对象说明。
- [x] 单图形说明只关联指定图形；组说明关联目标组而非某成员；多选说明关联指定对象集合而非另一集合或整板。
- [x] 切换对象、组和多选集合后能核对各自文字未覆盖或串写；取消编辑、空输入、保存失败或写错目标不推进。
- [x] 连续学习可复用整理章成果；目录独立开始/重练会提供或引导建立必要组及对象，不要求真实草稿含组。
- [x] 说明卡中仍能退出、重置或跳过；恢复后保留本步画面及已保存文字，不以恢复/预置说明冒充当前操作。
- [x] 所有说明与进度仅属于教程练习，不进入真实正文、附件、修改记录、学生档案或教学证据。
- [ ] 中英目标/反馈与鼠标/触屏路径齐全；自动测试覆盖四种归属、切换、防空保存误通过及隔离，记录交互回放并执行相关检查。

## 边界

按规格 Q10–Q13、第 9–11 节验收。学生说明是自述，不是已验证结论；本章不解释或诊断学生数学想法。

## Answer

- 数量说明章 `quantity-notes` 的步骤为 `notes-deselect / notes-board / notes-board-read / notes-object / notes-object-check / notes-group / notes-group-read / notes-selection / notes-selection-check`。每一步只认学生已经提交、并且写在当前选择所对应目标上的说明：取消非空选择、空选择时保存非空整板说明、再打开读到同一段整板说明、给标记图形写说明、改选另一个图形核对文字没有串写、给已有的组写说明、再选中整组并读到组说明、给标记的两个对象写多选说明、再打开另一目标核对多选说明仍在。空文字、取消、超过模型长度而被拒绝的保存、写到别的图形、成员、另一组对象或整板上，都不推进。说明是学生自己的话，不是已核对的数学结论。`model.js` 的说明、分组与合并规则，以及共享生命周期 `createPracticeProgress`，均未改。
- 整板说明这一步如果说明卡的目标是图形、组或多选，`applyNote` 不调用 `action()`。整板说明、各图形说明、组说明和多选说明都保持原样，步骤留在 `notes-board`。没有选择时保存的整板说明仍然通过。其他步骤的对象、组和多选说明仍按原来的方式保存。`model.js` 的说明规则未改。
- `start(previousFrame)` 按共享生命周期返回练习画面。有可用的组和对象时复用，否则新建两个对象和一个组；新建内容不送进 `observe`。`fresh()` 返回 `{ frame, saved }`。`skip` 准备下一步的选择、组或已写上文，不调用 `observe`，也不替学生写当前这一步要求的说明。不一致的已存目标抛出 `Invalid notes goal`，不自行修补。
- 已勾选的隔离项由本章单元测试和数量编辑器处理器回放覆盖：退出和重新挂载后预置的真实草稿不变，上传次数为 0，练习存储不写入 `baicai-edu-math-board:v4:session`。同一视图测试文件里既有的排队保存用例仍然通过。没有为本票单独新增一条异步锁队列用例。
- 最后一项未勾：中英和 `mouse`／`touch` 指针类型都有处理器回放，聚焦检查与全量测试已执行，但没有真实浏览器、真实鼠标、触屏设备或布局验收。处理器回放不是浏览器通过。
- 整板说明拦截再次通过同一条聚焦命令（47/47），并重新生成了 `client.js`。此前的构建与检查：`node math-board/build.mjs`、`node --check math-board/client.js`、`git diff --check` 通过。聚焦命令 **47/47 通过**：`node --test math-board/src/quantity/practice-notes.test.js math-board/src/quantity/view-practice.test.js math-board/tests/practice-notes-bundle.test.js`。全量 `npm --prefix math-board test` 为 **395 项、394 通过、1 失败**。唯一失败是既有 [tool-schema.test.js:214–220](<../../../math-board/src/host/tool-schema.test.js#L214-L220>) 的 fenced JSON recipe，`assert.ok(get)`。未改教学契约。生成客户端仍注册调整章和整理章，并把 `createQuantityNotesChapter` 接在其后。中英词典键数相同（376）。
- 详细命令、计数和未执行边界见 [验证记录](<../../../math-board/docs/tutorial-05-validation.md>)。接入说明见 [安全教程扩展接口](<../../../math-board/README.md#安全教程扩展接口>)。
