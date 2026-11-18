# Task 11 — Teacher-demo short guide (D01–D04)

Read this first. It is the requirements. Exact ids below are binding.

## Where this fits

Geometry practice through the file chapter is already on the integration branch. This guide is not a geometry practice chapter and must not be registered in `geometryPracticeChapters`. Completing it must not mark `geometry-edit` or any other geometry chapter complete. Do not change `createPracticeProgress`, earlier step lists, either model, teaching skills, or the submission protocol. Do not call a teacher drawing tool. Do not read an uncommitted student draft to invent a figure. Do not add “我想说”, “放入回答”, or drawing tools to the teacher page.

## Workspace

All edits and git commands run in:

`/Users/yugeng/programming/dsh-edu/.scratch/worktrees/tutorial-11`

Branch: `feat/tutorial-11`. Do not merge into `feat/math-board-interactive-tutorial`. Do not push. Do not edit the parent checkout except to write the report file named below.

## Text box fix

`math-board/src/teacher-demo/geometry-demo-view.js` calls `shared.geometryTextBox`, which is not provided. The student page already measures writing with `G.textBox` in its local `textBoxOf` (`geometry-view.js`). Use that same box on the demo page:

```js
function textBoxOf(element) {
  const box = G.textBox(element.text.split('\n'));
  return { x0: element.x - 6, y0: element.y - textMetrics.size - 4, x1: element.x + box.width + 2, y1: element.y + box.height - textMetrics.size };
}
```

Do not add `geometryTextBox` to `shared`. A figure that contains a text element must frame without reading `shared.geometryTextBox`.

## Chapter

Factory: `createTeacherDemoChapter({ G, emptyFrame })` in `math-board/src/teacher-demo/teacher-demo-practice.js`.

- id: `teacher-demo-basics`
- titleKey: `teacherDemoPractice`
- Self-contained for `build.mjs` inlining. Inline it, but do not append it to `quantityPracticeChapters` or `geometryPracticeChapters`.
- Own progress owner: `createPracticeProgress({ mode: 'teacher-demo', ... })`. That stores only `baicai-edu-math-board:practice:v2:teacher-demo`. It must not write `practice:v2:geometry` or `practice:v2:quantity`.
- The existing `baicai-edu-math-board:geometry-demo-seen:` key may still switch the tab. Do not read it or write it as this chapter’s completed, skipped, or in-progress state.

`start(previousFrame)` returns the frame. The frame holds an empty geometry board (`G.empty()`), zoom 1, fit true, and scroll `{ left: 0, top: 0 }`, plus the current figure’s identity. Creating that empty board is not observed. `fresh()` supports catalogue entry. `skip(saved, frame)` does not call `observe`, does not copy, and does not switch tabs. Skipping into the return step may place the current figure into the practice frame so there is something to view; that placement is not observed and does not complete the copy step. `createGoal` throws `Invalid demo goal` on an inconsistent save and does not repair it.

The guide starts only when the demo page has a validated figure whose board has at least one element. No figure, a hidden figure, or an empty board does not start the chapter and does not mark it skipped or complete. A tool result of `recorded` is not a student action.

Step ids, in this order:

| Spec | Step id | Done when |
| --- | --- | --- |
| D01 | `demo-read` | The student presses the continue control on the read-only introduction. Rendering the page does not pass. The status does not say the student was detected to have understood, and it does not say a copy already happened. |
| D02 | `demo-view` | The zoom number changes, and the canvas scroll position then changes while zoom is not 1 or fit is false. Clicking the current zoom level does not pass. The teacher figure object is not mutated. |
| D03 | `demo-copy` | The student presses the existing “放到我的几何画板” control. `placeFigure` appends that current figure to the guide’s own geometry frame. The event is `{ type: 'copy', before, after }` with those two practice boards. `props.onCopy`, `copyToGeometry`, and `appendFigure` are not called. A `full` or `empty` result does not pass and does not record the copy. No file is attached. |
| D04 | `demo-return` | The geometry tab is showing that guide frame, the copied elements are on it, and the page can edit that frame. The event is `{ type: 'view-copy' }` only then. Exit still returns the real geometry draft. The copy is not uploaded, not written to a student archive, and not stored as a real assisted use. |

Store the figure identity with the goal. If the figure is hidden or replaced so that identity no longer matches, the current step does not pass. The status says the figure is unavailable, in both languages. Exit and later resume stay available. Do not invent the old figure and do not mark the copy complete. When a figure is available again, retry starts against that current figure.

While another geometry practice chapter is open, do not close it and do not write its storage. Keep the copied figure in the teacher-demo frame. The return step does not pass until the geometry page can show that frame. Do not replace `practice:v2:geometry`.

## Page wiring

The demo page stays read-only. Report practice events only while this guide is open, and only when the student action above actually happens:

- continue: `{ type: 'continue' }`
- zoom and fit: `{ type: 'zoom', before, after }` and `{ type: 'fit', before, after }` only when the value changes
- scroll: `{ type: 'scroll', before, after }` with `{ left, top }` when the canvas actually scrolls
- copy: the copy event above, after `placeFigure` succeeds on the guide frame
- return: `{ type: 'view-copy' }` only once the geometry tab is showing that frame

The geometry page shows the guide frame only for `demo-return`. Edits to that frame publish back to the teacher-demo progress. They do not call the real draft `publish`, and they do not call the geometry-chapter practice progress. When the guide is closed, the geometry page is unchanged.

## Tests

1. `math-board/src/teacher-demo/teacher-demo-practice.test.js` — each success and at least one miss: render is not continue, unchanged zoom, copy without a press, `placeFigure` failure, a replaced figure does not complete the old copy, skip does not observe, and the seen flag is not a completed goal. `start()` returns the frame.
2. A mounted replay that drives the demo page and then the geometry page. Chinese and English. No figure does not start the guide. A text figure frames without `shared.geometryTextBox`. Copy leaves a pre-seeded real geometry draft, the real quantity draft, attachments, and sends unchanged, and does not call `onCopy`. Hide or replace the figure and the copy step does not pass. An open geometry practice record is not rewritten. Pointer type `mouse` and `touch` both reach the continue, zoom, copy, and return controls. The system file dialog is not involved.
3. A bundle test that the built client inlines `createTeacherDemoChapter` and does not list it in `geometryPracticeChapters` or `quantityPracticeChapters`.

Run:

```sh
node math-board/build.mjs
node --check math-board/client.js
git diff --check
node --test math-board/src/teacher-demo/teacher-demo-practice.test.js math-board/src/teacher-demo/geometry-demo-view.test.js math-board/src/geometry/geometry-view.test.js math-board/tests/practice-teacher-demo-bundle.test.js
npm --prefix math-board test
```

If the mounted replay lives in an existing test file instead of a new `geometry-demo-view.test.js`, include that file in the focused command and say so in the report. The known failure `math-board/src/host/tool-schema.test.js` around the missing fenced JSON recipe is pre-existing. Do not change teaching contracts to satisfy it. Do not hand-edit `client.js`.

## Docs

- One short paragraph in `math-board/README.md` under 安全教程扩展接口: chapter id, step ids, the separate storage key, and that the seen flag is not this chapter’s progress.
- `.scratch/math-board-interactive-tutorial/validation/tutorial-11-validation.md`: commands, counts, and what was not executed. Handler replay is not a browser pass.
- `.scratch/math-board-interactive-tutorial/issues/11-teacher-demo-first-figure.md`: `Status: resolved`, an `## Answer`, and checked boxes only for behavior the tests exercise. Leave the real-device box unchecked.

## Commit and report

Commits on `feat/tutorial-11` only. Message style: `feat(math-board): ...`. Do not amend. Do not use `--no-verify`.

Write the full report to `/Users/yugeng/programming/dsh-edu/.scratch/math-board-interactive-tutorial/reports/11-report.md`. Do not git-add it.

Return only status (`DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`), commit shas, a one-line test summary, and concerns.
