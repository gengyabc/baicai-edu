# 06: 数量调整与恢复互动章

**What to build:** 学生在数量教程练习中调整新对象的创建颜色、工具箱和视图，撤销/重做、清空，再练习选择是否附带修改记录，理解各操作的真实范围。

**Blocked by:** 02 — 章节导航、续学与补练。

**Status:** resolved

## 验收条件

- [x] 覆盖 Q14–Q19，能从目录独立开始、续学、重练，失败可提示、重置、跳过和补练。
- [x] 切换不同档位后亲手新增对象，核对新对象数值及颜色正确、旧对象不变；反复点击同一档位不能替代有效练习，不新增界面数值编辑功能。
- [x] 向工具箱加入此前未显示的图案，实际使用后收起；已有对象不消失，至少保留一个工具箱图案。
- [x] 对明确变化先撤销再重做，分别验证恢复结果；实际改变缩放后回到适应视图，不把不可用按钮或当前档位点击算完成。
- [x] 有内容时确认清空，只清教程练习中的对象、学生说明、修改记录和撤销历史，且不能撤销回清空前；不影响另一真实画板及附件，不调用宿主清空工具。
- [x] 清空后明确进入新阶段或提供放入章练习起点，不要求放入空白作品，也不悄悄复活被清空的撤销历史。
- [x] 实际切换练习中的附带修改记录选项，说明快照与记录是独立附件，关闭记录也可模拟放入；不改真实提交偏好，不产生真实附件。
- [x] 图案清单、创建颜色、视口、偏好及记录均不写回真实状态；退出/刷新和迟到保存保持隔离。
- [x] 中英文、鼠标/触屏可完成；自动回归覆盖颜色作用域、图案收起、恢复、清空与选项隔离，记录章节回放并执行相关检查。

## Answer

数量调整章已在本分支，行为未改。章节是 [practice-adjust.js](<../../../math-board/src/quantity/practice-adjust.js>)，集成合并 `7216a69`（`merge: integrate ticket06 quantity adjust and recover practice`）。本票只把状态改为 resolved，不改已有勾选。

## 边界

按规格 Q14–Q19、第 9–11 节验收。不依赖尚未交付的整理或说明章；准备必要练习内容不得算作学生已完成对应任务。

## 实现与验证

- 章节：[src/quantity/practice-adjust.js](<../../../math-board/src/quantity/practice-adjust.js>)，13 步 `adjust-color … adjust-trace-option`；经 `build.mjs` 内联并追加到 `Browser.quantityPracticeChapters`，页面仅新增提交事件（颜色档位、图案轨增减、撤销/重做、真实缩放/适应、确认清空、附带记录选项），未改共享生命周期、真实草稿写入或宿主清空工具。
- 目标单测：[practice-adjust.test.js](<../../../math-board/src/quantity/practice-adjust.test.js>)；真实编辑器中英回放（成功与失败用例、清空边界、续学、跳过/重置/补练）：[view-practice.test.js](<../../../math-board/src/quantity/view-practice.test.js>)；生成客户端内联校验：[practice-adjust-bundle.test.js](<../../../math-board/tests/practice-adjust-bundle.test.js>)。
- 失败用例：重复当前创建颜色、只打开图案库、用其它图案、收起时删除对象或移除最后一个工具图案、未改变缩放的极限点击、已适应视图的点击、未确认清空、重复当前记录选项值，均不推进。
- 交互：所有控件为按钮/复选框，点按即可完成，不依赖 Shift 或 hover；中英文字典键一致（313 键，构建校验）。
- 验证：`node math-board/build.mjs`、`node --test math-board/src/*/*.test.js math-board/tests/*.test.js`（354/355 通过，仅基线 `src/host/tool-schema.test.js:214` 失败，与本票无关）、`node scripts/check-skills.mjs`（0 error、0 warning）、`node --test scripts/*.test.mjs`（247 通过、0 失败）。
- 限制：以上为 Node 替身环境回放，不声称浏览器目视验收；触屏与鼠标使用同一指针处理路径，未做真实设备实测。
