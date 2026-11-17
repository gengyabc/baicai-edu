# Task 09 report — geometry adjust and recover

**Status:** DONE_WITH_CONCERNS

**Branch:** `feat/tutorial-09` in `/Users/yugeng/programming/dsh-edu/.scratch/worktrees/tutorial-09`

**Commits:**

- `7d5bbfcf67e63af350fa785fe828de76705162df` — `feat(math-board): add geometry adjust and recover practice`
- `6ca88050919a1d7b64aa10281fa1d831bbe03415` — `docs(math-board): record the geometry adjust commit on its issue`

Not merged. Not pushed.

## What landed

`createGeometryAdjustChapter({ G, emptyFrame })` in `math-board/src/geometry/geometry-adjust.js`.

- id: `geometry-adjust`
- titleKey: `geometryPracticeAdjust`
- steps, in order: `adjust-grid`, `adjust-snap`, `adjust-undo`, `adjust-redo`, `adjust-zoom`, `adjust-scroll`, `adjust-fit`, `adjust-clear`

`start(previousFrame)` reuses the previous practice board when it already has at least one point. Otherwise it creates one point. That create is not observed. A fresh start has empty history, grid off, snap on, zoom 1, fit true, and scroll `{ left: 0, top: 0 }`. `fresh()` returns `{ frame, saved }` for catalogue entry. `createGoal` throws `Invalid adjust goal` on an inconsistent save and does not repair it.

A grid or snap step passes only after that setting changes and a new point is then committed while the setting holds. Coordinates are not checked, including a point that lands on an existing point. Undo restores the board from before that point, and redo puts the same point back. A disabled undo or redo, or an event that does not move between those two boards, does not pass. A point created by `start` or `skip` is not the undo action. Zoom passes only when the number changes. Scroll passes only when `left` or `top` changes, and only while zoom is not 1 or fit is false. Fit passes only from false to true. Clear passes only after a confirmed clear of a non-empty practice board. The stored undo and redo boards are dropped. A later undo event does not put them back. The empty board with empty history is the new stage.

`skip` does not call `observe`. It does not turn the grid on, turn snap off, press undo or redo, change the zoom as a completed action, scroll, return to fit, or clear the board. Skipping into undo leaves one reversible history entry. Skipping into clear leaves the board non-empty.

`geometry-view.js` reports practice events only while practice is open, and only when the value or the board changes:

- `{ type: 'grid', before, after }` and `{ type: 'snap', before, after }`
- the existing point draw event, plus the current `grid` and `snap` booleans
- `{ type: 'undo', before, after }` and `{ type: 'redo', before, after }` after history moves
- `{ type: 'zoom', before, after }` and `{ type: 'fit', before, after }` when the number or boolean changes
- `{ type: 'scroll', before, after }` with `{ left, top }` when the canvas scroll position changes
- `{ type: 'clear', before, after }` after a confirmed clear of a non-empty board

Clear still uses this page's `clearMode`: `G.empty()` and history `{ past: [], future: [] }`. It does not call the host quantity clear and does not add a geometry trace attachment. Basics, construct, and edit stay registered. Their step lists, `createPracticeProgress`, the geometry model, teaching skills, and the submission protocol were not changed.

`build.mjs` inlines the factory and appends it to `Browser.geometryPracticeChapters` after `createGeometryEditChapter`. `client.js` was rebuilt, not hand-edited.

## Where the view overruled a guess

The geometry zoom pair's minimum is 1, so Zoom out is disabled at the start of the chapter and is not reported. The zoom that changes the number is Zoom in, from 1 to 1.25, and that press also leaves fit.

At zoom 1 with fit on, the harness canvas is the 1280×640 frame, so a scroll event cannot move. Skip into `adjust-scroll` therefore sets zoom to 1.25 and fit to false. That assignment is not passed to `observe`, so the skipped zoom step stays skipped.

The fit control toggles. A click while the view is already fitted turns fit off (`true` to `false`). The goal accepts only `false` to `true`.

Undo and redo compare points, elements, and the board note. A later paper resize is a layout publish and is not a history step, so it is not part of that comparison. The replay's points stay inside the original paper.

## Tests

Focused command, **74/74 passed**:

```sh
node math-board/build.mjs
node --check math-board/client.js
git diff --check
node --test math-board/src/geometry/geometry-adjust.test.js math-board/src/geometry/geometry-view.test.js math-board/tests/practice-geometry-adjust-bundle.test.js
```

`npm --prefix math-board test`: **452 tests, 451 passed, 1 failed**. The only failure is the pre-existing `math-board/src/host/tool-schema.test.js` assertion at line 220, `assert.ok(get)`, on the missing fenced JSON recipe. Teaching contracts were not changed.

This work adds 17 tests: 8 chapter tests, 5 mounted handler replays, and 4 bundle tests. The construct and edit bundle assertions now expect adjust after edit. Both locale files have the same 405 UI keys.

The mounted replay runs in Chinese and English, with the stand-in pointer reported as `mouse` and `touch`. It finishes the chapter. Exit leaves a pre-seeded real geometry draft and a pre-seeded quantity draft unchanged, with no attachment, inserted text, or send. Skip, reset, chapter retry, and refresh resume stay on the practice record. Scroll is applied by setting `scrollLeft` and `scrollTop` on the stand-in node and calling `onScroll`.

## Concerns

- No real browser, real mouse, touch device, layout, focus, or scrollbar check. The last acceptance box stays unchecked. The mounted replay is a handler replay, not a browser pass.
- The full suite still has the pre-existing tool-schema failure above. It was not fixed.
- Skip into scroll changes zoom and fit so the canvas can move. That setup is not observed and does not complete the zoom step.

Validation write-up: `math-board/docs/tutorial-09-validation.md`. Acceptance issue: `.scratch/math-board-interactive-tutorial/issues/09-geometry-adjust-recover.md`.

## Follow-up

`ed7976d09dc3640feb7f6d20300d508773ca5c02` — `fix(math-board): replay disabled undo and undo after clear`.

The mounted replay now calls `onClick` on the disabled undo control at the start, on the disabled redo control before the real undo, and on undo after confirm-clear. Each call leaves the step id and the board unchanged. After clear, history stays empty and the stored undo board stays null. The page handler already returned before `practiceEvent` when there was no history entry, so it did not need a change. Focused command re-run: **74/74 passed**. `client.js` was not rebuilt. The full suite was not re-run. The real-device box stays unchecked.
