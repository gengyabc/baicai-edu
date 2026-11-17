# Task 12: first-run entry and release validation

Validated on branch `feat/tutorial-12`. This ticket adds the first-run route, the catalogue claim, `tests/tutorial-release.test.js`, and the tool-schema alignment. No chapter was reimplemented. `createPracticeProgress`, chapter step lists, both models, teaching skills, and the submission protocol were not changed. `math-common/skills/math-common/references/board-contract.md` was not edited and gained no fenced JSON recipe.

Handler replay is not a browser pass. No new server was started, and the existing GUI was not updated.

## Delivered

- Quantity page (`src/quantity/view-component.js`): when the board tab is active and `baicai-edu-math-board:practice:v2:quantity` is absent, open `quantity-basics`. Opening does not complete the chapter. A later open with that key present does not auto-open and does not reset it. The v1 seen flag is neither copied nor deleted.
- Geometry page (`src/geometry/geometry-view.js`): the same route for `geometry-basics` and `practice:v2:geometry`. One board’s entry does not write the other board’s practice key.
- `src/host/tool-schema.test.js` builds `get` and `show` itself and runs them through registered `geometry_board_draw` and `eduBoardGeometryDemo`. The rectangle assertion stays.
- [tutorial-release.test.js](<../tests/tutorial-release.test.js>) drives the claims below with the existing page harness (`createHooks`, `installBrowser`, `text`, `walk`) or the real progress owner.

## Page differences

- While the teacher-guide step is `demo-return` or `demo-complete`, the geometry page is showing that guide’s copy. First-run does not cover it. The effect watches tab activation only, so the same visit does not auto-open geometry basics after that frame ends. Leaving the tab and coming back still opens `geometry-basics` when no geometry practice record exists.
- A `localStorage.getItem` throw is treated as “a record exists”, so a read failure does not invent a first run. The storage scenario below fails `setItem`, not `getItem`.
- File chapters ship `files-save` and `files-open`. F03 is the cancel and download honesty on those steps. There is no third step id.
- `practiceComplete` remains the chapter sentence “基础操作练习已完成”. The catalogue claim asserts the page does not say the whole tutorial is complete. Locale files were not changed.
- The 首次教程 paragraphs in the README no longer say first-run is left to this ticket, and no longer say quantity file open/save is still blocked. File chapters are already documented under 安全教程扩展接口. The requested paragraph is the first one in that section.

## Commands

- `node math-board/build.mjs`: client rebuilt. `client.js` was not hand-edited.
- `node --check math-board/client.js`: passed.
- `git diff --check`: passed.
- Focused command, **24/24 passed** for the release file and the tool-schema test. `opening geometry during the teacher guide does not cover the return frame` opens Geometry during `demo-read`, finishes the guide through copy and return, and comes back: the return frame is showing, and that visit does not write `practice:v2:geometry`. The focused run of this fix, including the geometry and teacher-demo page tests, is **100/100 passed**:

  ```sh
  node --test math-board/tests/tutorial-release.test.js math-board/src/host/tool-schema.test.js math-board/src/geometry/geometry-view.test.js math-board/src/teacher-demo/geometry-demo-view.test.js
  ```

- `npm --prefix math-board test`: **519 tests, 519 passed, 0 failed**.

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
| 15 | 协议回归 | Executed. After exit, quantity insert can attach `我的修改记录.json` and puts the board note in the composer. Geometry insert attaches only `我的几何画板.json` and the board note, with no trace. Neither insert sends or deletes the draft. |

## Unexecuted / limits

No real browser, real mouse, real touch device, small-screen layout, scroll layout, or window-resize layout. Rows above that say “not executed” or “partly executed” are not a pass for the missing part. The full suite being green does not add those passes.
