# Task 12: first-run entry and release validation

Validated on branch `feat/tutorial-12`. This ticket adds the first-run route, the catalogue claim, `tests/tutorial-release.test.js`, and the tool-schema alignment. No chapter was reimplemented. `createPracticeProgress`, chapter step lists, both models, teaching skills, and the submission protocol were not changed. `math-common/skills/math-common/references/board-contract.md` was not edited and gained no fenced JSON recipe.

Handler replay is not a browser pass. No new server was started, and the existing GUI was not updated.

## Delivered

- Quantity page (`src/quantity/view-component.js`): when the board tab is active and `baicai-edu-math-board:practice:v2:quantity` is absent, open `quantity-basics`. Opening does not complete the chapter. A later open with that key present does not auto-open and does not reset it. The v1 seen flag is neither copied nor deleted.
- Geometry page (`src/geometry/geometry-view.js`): the same route for `geometry-basics` and `practice:v2:geometry`. One board’s entry does not write the other board’s practice key.
- `src/host/tool-schema.test.js` builds `get` and `show` itself and runs them through registered `geometry_board_draw` and `eduBoardGeometryDemo`. The rectangle assertion stays.
- [tutorial-release.test.js](<../../../math-board/tests/tutorial-release.test.js>) drives the claims below with the existing page harness (`createHooks`, `installBrowser`, `text`, `walk`) or the real progress owner.

## Page differences

- While the teacher-guide step is `demo-return` or `demo-complete`, the geometry page is showing that guide’s copy. First-run does not cover it, and a guide that is open on any step — including its last one — owns the visit: leaving the geometry tab and coming back still does not start geometry basics. The route is tab-activation only, so closing the guide does not open basics in that same visit either. Once the guide is closed and no geometry practice record exists, a later visit to the geometry tab opens `geometry-basics`. All three states are executed in `opening geometry during the teacher guide does not cover the return frame`.
- A `localStorage.getItem` throw is treated as “a record exists”, so a read failure does not invent a first run. The storage scenario below fails `setItem`, not `getItem`.
- File chapters ship `files-save` and `files-open`. F03 is the cancel and download honesty on those steps. There is no third step id.
- `practiceComplete` remains the chapter sentence “基础操作练习已完成”. The catalogue claim asserts the page does not say the whole tutorial is complete. Locale files were not changed.
- The 首次教程 paragraphs in the README no longer say first-run is left to this ticket, and no longer say quantity file open/save is still blocked. File chapters are already documented under 安全教程扩展接口. The requested paragraph is the first one in that section.

## Commands

- `node math-board/build.mjs`: client rebuilt. `client.js` was not hand-edited.
- `node --check math-board/client.js`: passed.
- `git diff --check`: passed.
- Focused command, **25/25 passed** for the release file and the tool-schema test. `opening geometry during the teacher guide does not cover the return frame` opens Geometry during `demo-read`, finishes the guide through copy and return, comes back with the guide still on `demo-return`, confirms the copy into `demo-complete`, and re-enters Geometry once more: the guide holds the visit every time and none of those visits writes `practice:v2:geometry`. It then exits the guide, checks the same visit does not open basics, and re-enters Geometry: `geometry-basics` opens and that key is written. The focused run of this fix, including the geometry and teacher-demo page tests, is **101/101 passed**:

  ```sh
  node --test math-board/tests/tutorial-release.test.js math-board/src/host/tool-schema.test.js math-board/src/geometry/geometry-view.test.js math-board/src/teacher-demo/geometry-demo-view.test.js
  ```

- `npm --prefix math-board test`: **521 tests, 521 passed, 0 failed**.

## Scenarios

| # | Scenario | What ran |
| --- | --- | --- |
| 1 | 首开分流 | Executed. `first open starts that board basics chapter and ignores the legacy seen flag` and `no teacher figure does not start the teacher guide`. Quantity opens `quantity-basics` in progress, writes no geometry or teacher-demo practice key, and leaves both v1 flags as `'1'`. Geometry then opens `geometry-basics` and leaves the quantity record unchanged. Closing and opening again does not auto-open; 查看教程 resumes `point`. No figure and an empty-board figure do not write `practice:v2:teacher-demo`. |
| 2 | 完整覆盖 | Ids executed, not a step count. The test reads `practiceSteps` from the quantity page and `.steps` from each registered factory, and requires the shipped ids for Q01–Q20, G01–G21, F01–F02 on both boards, and D01–D04. F03 has no separate id; `{ type: 'save' }` on the quantity file goal stays `files-save`, and an empty segment draw stays `point`. Per-item success and failure replay of every chapter was not re-executed in this file. |
| 3 | 连续性 | Executed. After quantity basics reaches `complete`, entering organize keeps those practice object ids. The real draft keys are unchanged, including the pre-seeded note `REAL-QUANTITY-NOTE`. |
| 4 | 防误通过 | Partly executed. A cancelled quantity save and a cancelled geometry save stay on `files-save`. One segment click, and a goal observe of an empty draw, stay on `point`. Not executed here: add failure, a repeated color, a cancelled edit, an empty note, and a failed merge. |
| 5 | 说明作用域 | Partly executed. The notes chapter keeps a board note and an object note distinct. The edit chapter keeps an element note and the board note distinct. Not executed here: quantity group and selection notes, and a geometry point note or short caption as their own passes. |
| 6 | 恢复与补练 | Partly executed. A new `createPracticeProgress` owner on the same storage resumes the step and frame. Skip, then supplement, returns to the saved continuation. Retry of the notes chapter does not clear basics. Not executed: closing the real workbench or refreshing a browser. |
| 7 | 隔离对照 | Partly executed. A pre-seeded quantity star, its trace envelope, and one geometry point survive opening practice, drawing a practice point, and exit. Attachments, sends, and persist stay 0. Not executed: a separate checklist of a pre-seeded note, history, settings, and viewport. |
| 8 | 破坏性操作 | Partly executed. Practice delete and a confirmed clear leave the real quantity draft and the geometry practice record unchanged. Undo after that clear leaves the practice board empty. The teacher-guide copy does not change the geometry draft. Not executed here: importing a practice file over the real draft. |
| 9 | 外部变化 | Partly executed. A host settings change and a host clear during practice are still on the real draft after exit. The practice goal and practice frame are not overwritten, and sends stay 0. Not executed: a callback that arrives after the page is destroyed. |
| 10 | 文件章 | Partly executed. `AbortError` from `showSaveFilePicker` does not advance and does not fall through to download. The download anchor records `via: 'download'`. The real IndexedDB handle is not written, on either board. Not executed: a successful File System Access write. |
| 11 | 演示章 | Executed for the release claims. The guide copy leaves the geometry key unchanged and sets `copied`. Hiding the figure removes “放到我的几何画板” and leaves `copied` false. Exit stays enabled. No figure does not start the guide (scenario 1). |
| 12 | 输入回放 | Partly executed. Quantity’s first add and geometry’s first point accept `mouse` and `touch` with `shiftKey: false`. No Shift, hover, or keyboard shortcut is required for those controls. Not executed here: multi-select, polygon close, and label edit as their own pointer-type passes. |
| 13 | 界面回归 | Not executed for layout. The unfinished-construction test records that a real small-screen, scroll, and window-resize pass was not run. The same test does show the exit control present and not disabled while a note overlay is open and while a segment is unfinished. English was not replayed in this file. This is a handler replay, not a browser pass. |
| 14 | 存储异常 | Executed for write failure. `setItem` throws on practice keys; the page shows `practiceStorageWarning`; file-saved, inserted, and downloaded success strings are absent; exit works; the real draft stays; sends stay 0. A `getItem` throw does not auto-open and was not given its own test. |
| 15 | 协议回归 | Executed. After exit, quantity insert attaches `我的画板.json` plus `我的修改记录.json` and puts the board note in the composer. Geometry insert attaches only `我的几何画板.json` and the board note, with no trace. Neither insert sends or deletes the draft. `non-board notes travel inside the snapshot while only the board note reaches the composer` writes an object note, a selection note, a point note and an element note, then reads the attached files: those four travel inside `我的画板.json` and `我的几何画板.json`, and the composer body holds only the board note. |

## Unexecuted / limits

No real browser, real mouse, real touch device, small-screen layout, scroll layout, or window-resize layout. Rows above that say “not executed” or “partly executed” are not a pass for the missing part. The full suite being green does not add those passes.

## 修订后的首开与目录（2026-11-17）

第 1 行（首开分流）与第 13 行（界面）按 [ADR-0005](../../../docs/adr/0005-first-run-quick-tour.md) 重跑，替换原先的自动进入章节目径：

| 场景 | 结果 |
| --- | --- |
| 首开播放快速导览 | Executed. `first open autoplays the quick tour; the chaptered tutorial stays closed until asked`：打开数量页只出现导览（`tutorialSkip` 可见），不写 `practice:v2:quantity`，不出现 `data-practice-step`，`tutorial:v1:quantity` 被写成 `'1'`；跳过导览后依旧没有练习记录。导览末步与英文文案都含「查看教程／View tutorial」的指引。 |
| 教程只在显式进入时开始 | Executed（同上）。「更多操作 → 查看教程」后才出现步骤轨并写入 `practice:v2:quantity`；几何侧同理，且不改数量记录。 |
| 做过教程的画板不再播放导览 | Executed（同上）。退出练习再打开数量页不出现导览；几何页仍有自己的首次导览。 |
| 续学而非重开 | Executed. `a returning student resumes the chaptered tutorial instead of restarting it`。 |
| 步骤轨取代提示栏与消息条 | Executed for structure. `the practice rail replaces the answer strip and keeps every control a visible button`：练习里 `eb-practice-rail` 存在、`eb-question` 与整板目标文案都不在，退出后消息条恢复；其他章节的清单文案只在「全部章节…」打开后出现。 |
| 目录一层的断言 | Executed. `catalogue shows completed, not-started, skipped and optional…` 打开「全部章节…」后读四条状态，关闭后画布上不再出现其他章节状态，步骤轨仍显示「已跳过不算完成」。 |

界面观感仍未做真实浏览器通过：本行只覆盖结构与处理回放，不覆盖小屏、滚动、窗口尺寸变化与真机触屏。上面第 13 行的限制继续有效。
