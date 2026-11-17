# Task 11 report — teacher-demo short guide

**Status:** DONE_WITH_CONCERNS

**Branch:** `feat/tutorial-11` in `/Users/yugeng/programming/dsh-edu/.scratch/worktrees/tutorial-11`

**Commits:**

- `684aae3e5d040e12b32db9d9ceb72f7b2c187d6d` — `feat(math-board): add the teacher-demo short guide`
- `907a931a80feed6056731db8a14d986cf3fb2857` — `docs(math-board): record the teacher-demo commit on its issue`

Not merged. Not pushed.

## What landed

`createTeacherDemoChapter({ G, emptyFrame, placeFigure })` in `math-board/src/teacher-demo/teacher-demo-practice.js`.

- id: `teacher-demo-basics`
- titleKey: `teacherDemoPractice`
- steps, in order: `demo-read`, `demo-view`, `demo-copy`, `demo-return`
- completion snapshot step: `demo-complete` (not a fifth step)

`start(previousFrame)` returns a frame with an empty geometry board, zoom 1, fit true, scroll `{ left: 0, top: 0 }`, and the current figure identity. Creating that empty board is not observed. `fresh()` returns `{ frame, saved }` for catalogue entry. `createGoal` throws `Invalid demo goal` on an inconsistent save and does not repair the saved object.

A continue passes only for `{ type: 'continue' }` on the current figure. Rendering and a `recorded` tool result do not pass. The view step passes only after the zoom number changes and a later scroll actually moves, while zoom is not 1 or fit is false. Copy passes only for `{ type: 'copy', before, after }` when `placeFigure` appended the current figure onto the guide frame. `full` and `empty` do not pass and do not set `copied`. Return passes only for `{ type: 'view-copy' }` on the current figure. `skip` does not call `observe` and does not switch tabs. Skipping into return may place the current figure so there is something to view; that placement does not set `copied`.

The guide starts only when the demo page has a validated figure whose board has at least one element. No figure, a hidden figure, or an empty board does not start it and does not mark it skipped or complete. Progress is `createPracticeProgress({ mode: 'teacher-demo' })`, which stores only `baicai-edu-math-board:practice:v2:teacher-demo`. It does not write `practice:v2:geometry` or `practice:v2:quantity`. `baicai-edu-math-board:geometry-demo-seen:` is not this chapter’s completed, skipped, or in-progress state.

`build.mjs` inlines the factory onto `Browser` as `createTeacherDemoChapter`. It is not listed in `quantityPracticeChapters` or `geometryPracticeChapters`. Those lists stay `[createQuantityAdjustChapter, createQuantityOrganizeChapter, createQuantityNotesChapter, createQuantityFilesChapter]` and `[createGeometryConstructChapter, createGeometryEditChapter, createGeometryAdjustChapter, createGeometryFilesChapter]`. `client.js` was rebuilt, not hand-edited. `createPracticeProgress`, earlier step lists, both models, teaching skills, and the submission protocol were not changed.

While the guide is open, the existing “放到我的几何画板” press calls `placeFigure` on the guide frame and returns. It does not call `props.onCopy`, `copyToGeometry`, or `appendFigure`. The geometry page shows that frame when the dialog is open on the geometry tab and the step is `demo-return` or `demo-complete`, unless a geometry practice chapter is already open. Edits publish back to the teacher-demo progress. They do not call the real draft `publish` and do not call the geometry-chapter progress. Exit returns the real geometry board. No file is attached, uploaded, or stored as a real assisted use.

## Where the page or the shell overruled a guess

- The brief’s `textBoxOf` returns an absolute `{ x0, y0, x1, y1 }` box, matching `geometry-view.js`. `geometryFrameInputs` adds the text anchor itself, so passing that absolute box would shift the frame by the anchor. The demo page measures with `G.textBox` the same way, then passes `{ x, y, width, height }` relative to the anchor. `shared.geometryTextBox` is not read and was not added to `shared`.
- A hidden figure removes “放到我的几何画板”. The demo page draws that control only when `figure` is set. The guide stays open, the status is `teacherDemoFigureUnavailable` in both languages, and exit and later resume stay available. The copy is not recorded. The page test does not press a button the page no longer renders.
- The shell still writes `geometry-demo-seen:` when the dialog opens on a newly shown figure, and that write can switch the tab. This chapter does not read or write that key as progress. The replay seeds the seen value above the figure revision, so opening the dialog does not switch tabs or rewrite the key.
- `placeFigure` is an optional factory argument. The brief’s signature was `{ G, emptyFrame }`. Skip needs it inside the inlined factory so the placement is not a free global.
- The return control is the geometry-page button `teacherDemoViewCopy`. The guide does not switch tabs, because switching is what `copyToGeometry` does. The shell sets `tabActive` to `opened && tab === name`, so the replay opens the board dialog before selecting the geometry tab. Selecting the tab inside a closed dialog does not mark the page active.
- After `view-copy` the snapshot step is `demo-complete`. The guide frame stays visible for that step so the exit control is still on screen. The brief said the geometry page shows the frame only for `demo-return`. Exit then shows the real geometry board again.
- The existing effect that closes geometry practice when the tab becomes inactive is suppressed only while this guide is open. An open geometry practice record is not rewritten. The return step does not pass until that practice is closed and the geometry page can show the guide frame.

## Tests

```sh
node math-board/build.mjs
node --check math-board/client.js
git diff --check
node --test math-board/src/teacher-demo/teacher-demo-practice.test.js math-board/src/teacher-demo/geometry-demo-view.test.js math-board/src/geometry/geometry-view.test.js math-board/tests/practice-teacher-demo-bundle.test.js
```

Focused command: **85/85 passed**. The mounted replay is the new file `math-board/src/teacher-demo/geometry-demo-view.test.js`, not an existing test file.

`npm --prefix math-board test`: **501 tests, 500 passed, 1 failed**. The only failure is the pre-existing `math-board/src/host/tool-schema.test.js` assertion at line 220, `assert.ok(get)`, on the missing fenced JSON recipe. Teaching contracts were not changed.

This work adds 19 tests: 6 chapter tests, 9 mounted handler replays, and 4 bundle tests. Both locale files have the same 427 UI keys. This task adds the 10 `teacherDemo*` keys.

Chapter tests cover continue against render and `recorded`, an unchanged zoom, a scroll that does not move, a scroll while zoom is 1 and fit is true, copy without a successful append, `placeFigure` failure, a replaced figure that does not complete the old copy, skip that does not observe, and the seen flag not being a completed goal. `start()` returns the frame.

The mounted replay runs in Chinese and English. The stand-in pointer is `mouse` and `touch`. Both reach continue, zoom, copy, and return by `onClick({ pointerType })`. No figure and an empty board do not start the guide. A text figure frames without `shared.geometryTextBox`. Copy leaves a pre-seeded real geometry draft, the real quantity draft, attachments, and sends unchanged, and does not call `onCopy`. The wrapped `showOpenFilePicker` stays at zero calls. Hiding or replacing the figure blocks the copy, and retry starts against the current figure. An open geometry practice record stays unchanged until the student exits it.

A handler replay is not a browser pass.

## Concerns

- No real browser, real mouse, or touch device. The last acceptance box stays unchecked because it also requires that real-device path. The automated regression, build, `node --check`, and `git diff --check` were run and are recorded in the validation note.
- The full suite still has the pre-existing tool-schema failure above. It was not fixed.
- The guide frame remains visible on `demo-complete` so exit is still reachable. That is wider than the brief’s “only for `demo-return`”.
- The copy control disappears when the figure is hidden, because the existing demo page only renders it for a figure. Unavailable status, exit, and resume remain.

Validation write-up: `math-board/docs/tutorial-11-validation.md`. Acceptance issue: `.scratch/math-board-interactive-tutorial/issues/11-teacher-demo-first-figure.md`.

## Follow-up

`606566cd2074ac3bfdf51186be4c321f31723575` — `fix(math-board): keep the real geometry board quiet while the guide copy is showing`

While the guide frame is showing, the real board no longer keeps its document key listener, and `editable()` is false for that instance. Delete and Escape do not change `baicai-edu-math-board:geometry:v1:…` and do not write `practice:v2:geometry`. The guide copy still accepts both keys. Focused command after this fix: **86/86 passed**. The full suite was not re-run.
