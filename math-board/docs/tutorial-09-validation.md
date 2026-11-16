# Task 09: geometry adjust and recover validation

Validated on branch `feat/tutorial-09`. Only the geometry adjust and recover chapter was added. Geometry basics, construct, and edit step lists, `createPracticeProgress`, the geometry model, teaching skills, and the submission protocol were not changed. No geometry modification-record attachment was added, and the chapter does not call the host quantity clear.

## Delivered

- [geometry-adjust.js](<../src/geometry/geometry-adjust.js>): `createGeometryAdjustChapter({ G, emptyFrame })`. Chapter id `geometry-adjust`, title `geometryPracticeAdjust`. Steps: `adjust-grid`, `adjust-snap`, `adjust-undo`, `adjust-redo`, `adjust-zoom`, `adjust-scroll`, `adjust-fit`, `adjust-clear`. Grid and snap pass only after that setting changes and a new point is committed while it holds. The point's coordinates are not checked. Undo and redo restore that same point. Zoom, scroll, and fit must change the view. A confirmed clear empties the practice board and drops both history lists. Grid and snap are not a geometry verdict.
- [geometry-view.js](<../src/geometry/geometry-view.js>): while practice is open, the page reports grid, snap, undo, redo, zoom, fit, scroll, and clear only when the value or the board actually changes. A committed point keeps the existing draw event and adds the current grid and snap booleans. A disabled undo or redo returns before any report. Clear still publishes `G.empty()` and sets history to `{ past: [], future: [] }` on this geometry page only.
- Bilingual goal copy, one README paragraph, and the built client lists `createGeometryAdjustChapter` after `createGeometryEditChapter`. Basics, construct, and edit stay registered. Their step lists are unchanged. The construct and edit bundle assertions now expect that longer chapter list.

## View difference

The geometry zoom pair uses a minimum of 1, so Zoom out is disabled on a fresh chapter and is not reported. The first zoom that changes the number is Zoom in, from 1 to 1.25, and that press also leaves fit. At zoom 1 with fit on, the harness canvas is the 1280×640 frame, so a scroll cannot move. Skip into the scroll step therefore sets zoom to 1.25 and fit to false. That assignment is not passed to `observe`, so it does not complete the zoom step. The fit control toggles: a click while the view is already fitted turns fit off, and the goal accepts only a change from false to true. Undo and redo compare points, elements, and the board note. A later paper resize is layout and is not part of that comparison. The replay points stay inside the original paper.

## Executed

- `node math-board/build.mjs`: client rebuilt. `node --check math-board/client.js`: passed. `git diff --check`: passed.
- Focused command, **74/74 passed**:

  ```sh
  node --test math-board/src/geometry/geometry-adjust.test.js math-board/src/geometry/geometry-view.test.js math-board/tests/practice-geometry-adjust-bundle.test.js
  ```

- `npm --prefix math-board test`: **452 tests, 451 passed, 1 failed**. The only failure is the pre-existing [tool-schema.test.js](<../src/host/tool-schema.test.js>) assertion at line 220 (`assert.ok(get)` on the shared-skill fenced JSON recipe). Teaching contracts were not changed. This work adds 17 tests: 8 chapter tests, 5 handler replays, and 4 bundle tests. Both locale files have the same 405 UI keys.

## Operation-goal replay (not a browser pass)

[geometry-adjust.test.js](<../src/geometry/geometry-adjust.test.js>) drives the goal with committed boards and view events:

- Turning the grid on does not pass until a new point is committed while the grid is on. A point before that change, or a point while the grid is off, does not pass. The coordinates are not read as a verdict.
- Turning snap off does not pass until a new point is committed while snap is off, including a point that lands on an existing point.
- Undo restores the board from before that point, and redo puts the same point back. An undo or redo event that does not move between those two boards does not pass. A point prepared by skip is not the undo.
- An unchanged zoom number does not pass, including a fit click that leaves the number alone. An unchanged scroll does not pass, and a scroll while zoom is 1 and fit is true does not pass. Fit passes only from false to true.
- Opening clear without an empty after-board does not pass. A confirmed clear completes the chapter, drops the stored undo and redo boards, and a later undo event does not put them back.
- `start` reuses a previous board that already has a point and otherwise creates one point. That create is not observed. History for that start is empty. Grid starts off, snap starts on, zoom is 1, fit is true, and scroll is `{ left: 0, top: 0 }`. `fresh` supports catalogue entry. `createGoal` throws `Invalid adjust goal` instead of repairing a bad save. `skip` does not call `observe`, does not turn the grid on, does not turn snap off, and does not clear the board. Skipping into undo leaves one history entry. Skipping into clear leaves the board non-empty.

[geometry-view.test.js](<../src/geometry/geometry-view.test.js>) replays the mounted editor in Chinese and English, with the stand-in pointer reported as `mouse` and `touch`. Exit leaves a pre-seeded real geometry draft and a pre-seeded quantity draft unchanged. No attachment, text, or send is recorded. Skip, reset, chapter retry, and a refresh resume stay on the practice record. The scroll step sets `scrollLeft` and `scrollTop` on the stand-in node and calls `onScroll`.

## Unexecuted / limits

No real browser, real mouse, touch device, layout, focus, or scrollbar check. The mounted replay is a handler replay, not a browser pass. The known tool-schema failure was not investigated beyond confirming it is the pre-existing fenced-JSON assertion.
