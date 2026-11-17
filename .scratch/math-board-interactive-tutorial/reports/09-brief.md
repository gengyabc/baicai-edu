# Task 09 — Geometry adjust and recover chapter (G17–G20)

Read this first. It is the requirements. Exact ids below are binding.

## Where this fits

Geometry basics, construct, and edit are already on the integration branch. This chapter does not require those chapters to be finished first. Do not change grid, snap, undo, zoom, or clear behavior in the geometry model. Do not change `createPracticeProgress`, the earlier geometry step lists, teaching skills, or the submission protocol. Do not add a geometry modification-record attachment. Do not call the host quantity clear. Do not measure lengths, angles, or positions, and do not treat grid or snap as evidence that a figure is mathematically correct.

## Workspace

All edits and git commands run in:

`/Users/yugeng/programming/dsh-edu/.scratch/worktrees/tutorial-09`

Branch: `feat/tutorial-09`. Do not merge into `feat/math-board-interactive-tutorial`. Do not push. Do not edit the parent checkout except to write the report file named below.

## Chapter

Factory: `createGeometryAdjustChapter({ G, emptyFrame })` in `math-board/src/geometry/geometry-adjust.js`.

- id: `geometry-adjust`
- titleKey: `geometryPracticeAdjust`
- Self-contained for `build.mjs` inlining.
- `start(previousFrame)` returns the frame. Reuse practice content when the previous frame has at least one point. Otherwise create one point. That create is not observed. History for a fresh start is empty. Grid starts off, snap starts on, zoom is 1, fit is true, scroll is `{ left: 0, top: 0 }`.
- `fresh()` supports catalogue entry.
- `skip(saved, frame)` prepares the next step without calling `observe`. Skipping into undo leaves one reversible history entry the student can undo. Skipping into clear leaves the board non-empty. Skip does not itself toggle the control the current step asks for, and it does not clear the board.
- `createGoal` throws `Invalid adjust goal` on an inconsistent saved goal.

Step ids, in this order:

| Spec | Step id | Done when |
| --- | --- | --- |
| G17 grid | `adjust-grid` | Grid changes from off to on, and the student then commits a new point while grid is on. Turning grid on without a new point does not pass. The point’s coordinates are not checked. |
| G17 snap | `adjust-snap` | Snap changes from on to off, and the student then commits a new point while snap is off. Turning snap off without a new point does not pass. Do not infer a geometric relation from where the point landed. |
| G18 undo | `adjust-undo` | The student undoes that latest point. The board matches the state before it, and the undone board is available to redo. A click while undo is disabled does not pass. A point created by `skip` or `start` is not this step’s action. |
| G18 redo | `adjust-redo` | Redo restores that same point. A click while redo is disabled does not pass. |
| G19 zoom | `adjust-zoom` | The zoom number changes. Clicking the current level, or a control that leaves zoom unchanged, does not pass. |
| G19 scroll | `adjust-scroll` | While zoom is not 1 or fit is false, the canvas scroll position changes. A scroll event that leaves `left` and `top` unchanged does not pass. |
| G19 fit | `adjust-fit` | Fit returns to true after the zoom step left it false. Clicking fit when the view is already fit does not pass. |
| G20 clear | `adjust-clear` | The board is non-empty, the student confirms clear, the practice geometry board is empty, and both undo and redo history are empty. Undo after that clear does not restore the old board and does not pass another step. Opening the confirm dialog without confirming does not pass. |

The cleared board with empty history is the new stage. Do not put the cleared history back.

## Page wiring

`geometry-view.js` already toggles grid and snap, undoes and redoes, changes zoom and fit, and `clearMode` publishes `G.empty()` and sets history to `{ past: [], future: [] }`. Those paths do not report practice events.

Report through the existing `practiceEvent` helper, only while practice is open, and only when the value or the board actually changes:

- grid and snap: `{ type: 'grid', before, after }` and `{ type: 'snap', before, after }` with the booleans
- a committed point: the existing draw event, plus the current `grid` and `snap` booleans
- undo and redo: `{ type: 'undo', before, after }` and `{ type: 'redo', before, after }` with the boards, only after history moves
- zoom and fit: `{ type: 'zoom', before, after }` and `{ type: 'fit', before, after }` only when the number or the boolean changes
- scroll: `{ type: 'scroll', before, after }` with `{ left, top }` when the canvas actually scrolls
- clear: `{ type: 'clear', before, after }` only after the confirmed clear of a non-empty board, with `after` empty and history empty

A disabled undo, redo, or an unchanged zoom click is not reported as success. Do not report host or system changes. The real geometry draft and the quantity draft stay unchanged.

Register the factory in `build.mjs`: import, inline with `.toString()`, append to `Browser.geometryPracticeChapters` after `createGeometryEditChapter`. Do not remove basics, construct, or edit.

## Tests

1. `math-board/src/geometry/geometry-adjust.test.js` — each success and at least one miss: grid on without a point, snap off without a point, disabled undo, disabled redo, unchanged zoom, unchanged scroll, fit clicked while already fit, confirm dialog opened but not confirmed, undo after clear does not restore.
2. A mounted replay in `geometry-view.test.js`. Chinese and English both finish the chapter. Exit leaves a pre-seeded real geometry draft and the quantity draft unchanged. Skip, reset, and chapter retry work.
3. `math-board/tests/practice-geometry-adjust-bundle.test.js` — the built client inlines `createGeometryAdjustChapter` and lists it after the edit factory.

Run:

```sh
node math-board/build.mjs
node --check math-board/client.js
git diff --check
node --test math-board/src/geometry/geometry-adjust.test.js math-board/src/geometry/geometry-view.test.js math-board/tests/practice-geometry-adjust-bundle.test.js
npm --prefix math-board test
```

The known failure `math-board/src/host/tool-schema.test.js` around the missing fenced JSON recipe is pre-existing. Do not change teaching contracts to satisfy it. Do not hand-edit `client.js`.

## Docs

- One short paragraph in `math-board/README.md` under 安全教程扩展接口: chapter id, step ids, and that grid and snap are not a geometry verdict.
- `math-board/docs/tutorial-09-validation.md`: commands, counts, and what was not executed. Handler replay is not a browser pass.
- `.scratch/math-board-interactive-tutorial/issues/09-geometry-adjust-recover.md`: `Status: resolved`, an `## Answer`, and checked boxes only for behavior the tests exercise. Leave the real-device box unchecked.

## Commit and report

Commits on `feat/tutorial-09` only. Message style: `feat(math-board): ...`. Do not amend. Do not use `--no-verify`.

Write the full report to `/Users/yugeng/programming/dsh-edu/.scratch/math-board-interactive-tutorial/reports/09-report.md`. Do not git-add it.

Return only status (`DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`), commit shas, a one-line test summary, and concerns.
