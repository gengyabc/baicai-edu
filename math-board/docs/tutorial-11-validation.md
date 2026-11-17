# Task 11: teacher-demo short guide validation

Validated on branch `feat/tutorial-11`. Only `teacher-demo-basics` was added. It is not registered in `geometryPracticeChapters` or `quantityPracticeChapters`. Completing it does not mark `geometry-edit` or any geometry chapter complete. `createPracticeProgress`, earlier step lists, both models, teaching skills, and the submission protocol were not changed. No teacher drawing tool is called, and an uncommitted student draft is not read to invent a figure. The teacher page does not gain “我想说”, “放入回答”, or drawing tools.

## Delivered

- [teacher-demo-practice.js](<../src/teacher-demo/teacher-demo-practice.js>): `createTeacherDemoChapter({ G, emptyFrame, placeFigure })`. Chapter id `teacher-demo-basics`, title `teacherDemoPractice`. Steps: `demo-read`, `demo-view`, `demo-copy`, `demo-return`. The completion snapshot step is `demo-complete`. Progress uses `createPracticeProgress({ mode: 'teacher-demo' })`, which stores only `baicai-edu-math-board:practice:v2:teacher-demo`. It does not write `practice:v2:geometry` or `practice:v2:quantity`, and it does not read or write `baicai-edu-math-board:geometry-demo-seen:` as completed, skipped, or in-progress.
- [geometry-demo-view.js](<../src/teacher-demo/geometry-demo-view.js>): the guide starts only when the demo page has a validated figure whose board has at least one element. Continue, a changed zoom number followed by a real scroll, the existing “放到我的几何画板” press, and “查看可编辑副本” are the only passes. While the guide is open, that copy press calls `placeFigure` on the guide frame and does not call `onCopy`.
- [geometry-view.js](<../src/geometry/geometry-view.js>) and [board-shell.js](<../src/shell/board-shell.js>): the geometry page shows that guide frame when the geometry tab is active and the step is `demo-return` or `demo-complete`, unless a geometry practice chapter is already open. Edits publish to the teacher-demo progress. They do not call the real draft `publish` or the geometry-chapter progress. `copyToGeometry` and `appendFigure` stay the real-draft path and are not called by this guide.
- Bilingual copy. The introduction does not say the student was detected to have understood and does not say a copy already happened. A hidden or replaced figure uses `teacherDemoFigureUnavailable`. The built client inlines `createTeacherDemoChapter` on `Browser` and leaves both practice-chapter lists unchanged.

## Page differences

- The brief’s `textBoxOf` returns an absolute `{ x0, y0, x1, y1 }` box. `geometryFrameInputs` adds the text anchor itself, so the demo page measures with `G.textBox` and then passes `{ x, y, width, height }` relative to that anchor. `shared.geometryTextBox` is not read and was not added.
- A hidden figure removes “放到我的几何画板”, because the demo page draws that control only when `figure` is set. The guide stays open, the unavailable status remains, and exit and later resume remain. The copy is not recorded.
- The shell may still write `geometry-demo-seen:` when the dialog opens on a newly shown figure. That write is the existing tab switch. This chapter does not use the key as its progress.
- `placeFigure` is an optional factory argument so skip can place the current figure without a free global. The brief’s signature was `{ G, emptyFrame }`.
- The return control is `teacherDemoViewCopy` on the geometry page. The guide does not switch tabs. The shell marks a tab active only while the dialog is open (`opened && tab === name`), so the replay opens the board before selecting the geometry tab.
- After `view-copy` the snapshot step is `demo-complete`. The guide frame stays up for that step so exit is still on screen, then exit returns the real geometry board. The brief said the frame is shown only for `demo-return`.
- The existing “close geometry practice when the tab becomes inactive” effect is suppressed only while this guide is open. An open geometry practice record is not rewritten, and the return step does not pass until that practice is closed and the geometry page can show the guide frame.

## Executed

- `node math-board/build.mjs`: client rebuilt. `node --check math-board/client.js`: passed. `git diff --check`: passed.
- Focused command, **86/86 passed**:

  ```sh
  node --test math-board/src/teacher-demo/teacher-demo-practice.test.js math-board/src/teacher-demo/geometry-demo-view.test.js math-board/src/geometry/geometry-view.test.js math-board/tests/practice-teacher-demo-bundle.test.js
  ```

- `npm --prefix math-board test`: **501 tests, 500 passed, 1 failed**. The only failure is the pre-existing [tool-schema.test.js](<../src/host/tool-schema.test.js>) assertion at line 220 (`assert.ok(get)` on the shared-skill fenced JSON recipe). Teaching contracts were not changed. This work adds 20 tests: 6 chapter tests, 10 mounted handler replays, and 4 bundle tests. The full suite was not re-run after the keyboard fix; the 501/500/1 result above is from before that replay. Both locale files have the same 427 UI keys. This task adds the 10 `teacherDemo*` keys.

## Operation-goal replay (not a browser pass)

[teacher-demo-practice.test.js](<../src/teacher-demo/teacher-demo-practice.test.js>) drives the goals directly. Rendering and a `recorded` tool result do not pass continue. An unchanged zoom, a scroll that does not move, and a scroll while zoom is 1 and fit is true do not pass the view step. A copy event without a successful append, a `full` or `empty` result, and a replaced figure do not record the copy. `view-copy` is the only return pass. `start()` returns the empty frame. `fresh()` opens the catalogue entry. `createGoal` throws `Invalid demo goal` and does not repair the saved object. `skip` does not call `observe`. Skipping into return may place the current figure and does not set `copied`. The seen flag is not a completed goal, and entering this chapter does not write the geometry or quantity practice keys.

[geometry-demo-view.test.js](<../src/teacher-demo/geometry-demo-view.test.js>) is a new file. It replays the mounted demo page and then the geometry page in Chinese and English. The stand-in pointer is `mouse` and `touch`. Both reach continue, zoom, copy, and return by `onClick({ pointerType })`. No figure and an empty board do not start the guide. A text figure frames without `shared.geometryTextBox`. Copy leaves a pre-seeded real geometry draft, the real quantity draft, attachments, and sends unchanged, and does not call `onCopy`. The system file dialog is wrapped and stays at zero calls. Hiding or replacing the figure blocks the copy; retry starts against the current figure. An open geometry practice record stays unchanged until the student exits it, and only then can the return control pass. While the guide frame is showing, Delete and Escape on the hidden real board do not change `baicai-edu-math-board:geometry:v1:…` and do not write `practice:v2:geometry`. The guide copy still accepts both keys.

## Unexecuted / limits

No real browser, real mouse, or touch device. A handler replay is not a browser pass. The known tool-schema failure was not investigated beyond confirming it is the pre-existing fenced-JSON assertion.

## Later addition: the page's own tutorial door

- [geometry-demo-view.js](<../src/teacher-demo/geometry-demo-view.js>) renders a second bottom dock, `eb-demo-dock eb-demo-dock-right`, holding one bordered `eb-dock-tutorial` button labelled `teacherDemoTutorial`. It sits at the other end of the same bottom edge from `backButton`, so 返回对话 stays bottom-left and the guide's door bottom-right. The door is hidden while the rail is up.
- The press reads the live record (`progressRef.current.snapshot().chapters[0].status`), not the rendered `progress` state, because the geometry page can advance the guide while this page keeps an older snapshot. `completed` replays from step 1 through `enter(id, { retry: true })`; `in-progress` and `skipped` resume the saved step and frame. With no figure no guide starts and the press sets `teacherDemoTutorialNoFigure` in the status toast only — no `practice:v2:teacher-demo` write.
- The existing 「继续这段引导」 button now calls the same `openGuide(false)` path instead of duplicating it.
- Copy added to both locale files: `teacherDemoTutorial`, `teacherDemoTutorialArea`, `teacherDemoTutorialNoFigure`. Keys stay in parity (build.mjs rejects a mismatch).
- CSS: `.eb-demo-dock.eb-demo-dock-right{left:auto;right:10px}` and `.eb-demo-dock .eb-dock-tutorial` on [board.css](<../src/shell/board.css>). Nothing else in the dock, the rail or the two practice-chapter lists changed.
- Tests added in [geometry-demo-view.test.js](<../src/teacher-demo/geometry-demo-view.test.js>): the door in Chinese and English (hidden while the rail is up, resumes at `demo-read`, runs to `demo-complete`, replays from `demo-read`, leaves the geometry practice key, the teacher figure, the real draft, attachments and sends untouched), and the no-figure press (toast only, no rail, no record).
- `node build.mjs` rebuilt `client.js`; `node --check client.js` passed. `npm --prefix math-board test`: **528 tests, 528 passed**.
- Still unexecuted: no real browser, mouse or touch device. The door's screen position at the bottom-right was verified in the rendered tree (`eb-demo-dock-right` node), not in a browser layout, and no narrow-width screenshot was taken.
