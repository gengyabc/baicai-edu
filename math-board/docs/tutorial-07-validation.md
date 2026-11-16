# Task 07: geometry construct validation

Validated on branch `feat/tutorial-07`. Only the geometry construct chapter was added. Geometry basics steps, `createPracticeProgress`, the geometry construction rules, teaching skills, and the submission protocol were not changed. Edit, notes, adjust, file, and teacher-demo chapters were not implemented.

## Delivered

- [geometry-construct.js](<../src/geometry/geometry-construct.js>): `createGeometryConstructChapter({ G, emptyFrame })`. Chapter id `geometry-construct`, title `geometryPracticeConstruct`. Steps: `construct-parallelogram`, `construct-rectangle`, `construct-select-side`, `construct-midpoint`, `construct-drag`, `construct-auxiliary`, `construct-auxiliary-off`. A step passes only when the named tool or action commits a new element, a midpoint, a moved free point, or the auxiliary switch off. Success is not inferred from where a figure sits, and nothing measures length, angle, parallel, perpendicular, equal, or collinear.
- [geometry-view.js](<../src/geometry/geometry-view.js>): a finished parallelogram or rectangle draw reports `role`. A successful midpoint reports `{ type: 'midpoint', before, after, a, b, id }`. A drag that changes a point reports `{ type: 'move', before, after, id }`. The auxiliary switch reports `{ type: 'auxiliary', before, after }` with the switch values. A selection reports the board as `after` so the side can be checked. Practice events still no-op when practice is closed.
- Bilingual goal copy, one README paragraph, and the built client lists `createGeometryConstructChapter` in `geometryPracticeChapters`. The basics step list is unchanged.

## Executed

- `node math-board/build.mjs`: client rebuilt. `node --check math-board/client.js`: passed. `git diff --check`: passed.
- Focused command, **61/61 passed** before a one-line test cleanup, and the same files passed again inside the full suite:

  ```sh
  node --test math-board/src/geometry/geometry-construct.test.js math-board/src/geometry/geometry-view.test.js math-board/tests/practice-construct-bundle.test.js
  ```

- `npm --prefix math-board test`: **412 tests, 411 passed, 1 failed**. The only failure is the pre-existing [tool-schema.test.js](<../src/host/tool-schema.test.js>) assertion at line 220 (`assert.ok(get)` on the shared-skill fenced JSON recipe). Teaching contracts were not changed. This work adds 17 tests: 8 chapter tests, 5 handler replays, and 4 bundle tests. Both locale files have the same 384 UI keys.

## Operation-goal replay (not a browser pass)

[geometry-construct.test.js](<../src/geometry/geometry-construct.test.js>) drives the goal with committed boards:

- A new parallelogram passes. A plain polygon, choosing the tool, and a parallelogram already on the board do not.
- A new rectangle passes. An unfinished preview and a parallelogram do not.
- One free segment or one free edge passes. A point, a circle, an empty selection, a side that already has a midpoint, and an edge with a derived end do not.
- `addMidpoint` for that side passes. A free point and a midpoint event that does not commit do not.
- Moving the marked free point passes. A press that does not move, moving another free point, and moving the midpoint do not.
- A new element with `role: 'auxiliary'` passes. Turning the switch on or off, or drawing a main element, does not. Turning the switch from on to off then passes the last step.
- `start` reuses three usable free points and a segment, and otherwise creates only those. Collinear points gain one off the line because the model refuses a flat parallelogram. `fresh` supports catalogue entry. `createGoal` throws `Invalid construct goal` instead of repairing a bad save. `skip` does not call `observe` and does not create the parallelogram, rectangle, midpoint, or auxiliary element.

[geometry-view.test.js](<../src/geometry/geometry-view.test.js>) replays the mounted editor in Chinese and English, with the stand-in pointer reported as `mouse` and `touch`. Exit leaves a pre-seeded real geometry draft unchanged. Skip, reset, supplement, and chapter retry work, and retrying this chapter leaves the basics step state in place.

## Unexecuted / limits

No real browser, real mouse, touch device, layout, focus, scroll, or viewport check. The mounted replay is a handler replay, not a browser pass. No new geometry-specific async lock-queue case. The known tool-schema failure was not investigated beyond confirming it is the pre-existing fenced-JSON assertion.
