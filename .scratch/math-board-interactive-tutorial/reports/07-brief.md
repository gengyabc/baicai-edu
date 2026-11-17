# Task 07 — Geometry construct chapter (G06–G09)

Read this first. It is the requirements. Exact ids below are binding.

## Where this fits

Integration already has geometry basics (`geometry-basics`) and the quantity chapters. You add only the construct chapter. Do not change the basics step list, `createPracticeProgress`, the geometry model’s construction rules, teaching skills, or the submission protocol. Do not implement edit, notes, adjust, file, or teacher-demo chapters. Do not measure lengths, angles, parallel, perpendicular, equal, or collinear, and do not judge a drawing as mathematically right or wrong.

## Workspace

All edits and git commands run in:

`/Users/yugeng/programming/dsh-edu/.scratch/worktrees/tutorial-07`

Branch: `feat/tutorial-07`. Do not merge into `feat/math-board-interactive-tutorial`. Do not push. Do not edit the parent checkout except to write the report file named below.

## Chapter

Factory: `createGeometryConstructChapter({ G, emptyFrame })` in `math-board/src/geometry/geometry-construct.js`.

- id: `geometry-construct`
- titleKey: `geometryPracticeConstruct`
- Self-contained for `build.mjs` inlining.
- `start(previousFrame)` returns the frame itself. Reuse free points and a segment from the previous practice frame when they are enough. Otherwise create the points and one segment the steps need. Those creates are not observed.
- `fresh()` supports catalogue entry.
- `skip(saved, frame)` prepares the next step’s prerequisites (three clicks’ worth of free points, a segment whose ends are free and have no midpoint yet, a free point that can move, auxiliary off before the auxiliary create) without calling `observe` and without creating the figure the current step asks for.
- `createGoal` throws `Invalid construct goal` on an inconsistent saved goal instead of repairing it.

Step ids, in this order:

| Spec | Step id | Done when |
| --- | --- | --- |
| G06 parallelogram | `construct-parallelogram` | A committed `addElement` with `elementType: 'parallelogram'` exists that was not on the before board. Choosing the tool, an unfinished preview, or a plain polygon does not pass. |
| G06 rectangle | `construct-rectangle` | Same, for `elementType: 'rectangle'`. A parallelogram does not pass this step. |
| G07 select a side | `construct-select-side` | The student selects exactly one segment, or one edge of a polygon, rectangle, or parallelogram, whose two ends are free points and do not already have a midpoint. Selecting a point, a circle, or nothing does not pass. |
| G07 midpoint | `construct-midpoint` | `addMidpoint` commits a new point whose `construction.op` is `midpoint` for that side’s ends. A free `addPoint` does not pass. A click while the midpoint control is disabled does not pass. |
| G08 drag | `construct-drag` | The marked free point’s position changes through a committed `movePoint` after the pointer has moved. A press that does not move does not pass. Dragging the midpoint, or any derived point, does not pass. Goal copy says a derived point cannot be dragged directly and is not this step’s target. |
| G09 auxiliary figure | `construct-auxiliary` | Auxiliary mode is on and the student commits a new element whose `role` is `auxiliary`. Turning the switch on, with no new auxiliary element, does not pass. |
| G09 auxiliary off | `construct-auxiliary-off` | Auxiliary mode is then turned off. Turning it off before the auxiliary element exists does not pass the create step. |

Do not infer success from where the figure sits on the canvas.

## Page wiring

`math-board/src/geometry/geometry-view.js` already emits `{ type: 'draw', tool, before, after }` from `finish()` for parallelogram and rectangle, because `tool` is the drawing name. Include `role` on that event so the auxiliary step can see it. The element’s `role` is also on the after board.

`markMidpoint` commits `{ type: 'addMidpoint', a, b }` and does not report a practice event. After a successful commit, report `{ type: 'midpoint', before, after, a, b, id }` through the existing `practiceEvent` helper. A disabled click that returns before `action()` is not a success.

`pointerEnd` commits `{ type: 'movePoint', id, x, y }` for a dragged point and does not report it. After a commit that changes that point’s position, report `{ type: 'move', before, after, id }`. Do not report a press that did not move. Do not report host or system changes.

The auxiliary switch only calls `setAuxiliary`. Report `{ type: 'auxiliary', before, after }` when the student toggles it. Toggling is not itself the create step.

`practiceEvent` already no-ops when practice is closed. Do not write the practice board into the real geometry draft.

Register the factory in `math-board/build.mjs`: import, inline with `.toString()`, append to `Browser.geometryPracticeChapters`. Leave `createGeometryBasicsChapter` and its step list alone. The geometry page already maps `shared.geometryPracticeChapters`.

## Tests

1. `math-board/src/geometry/geometry-construct.test.js` — each success and at least one miss: plain polygon is not a parallelogram, unfinished preview is not a rectangle, a free point is not a midpoint, a disabled midpoint click does not advance, dragging the midpoint does not pass, auxiliary toggle without a new auxiliary element does not pass.
2. A mounted replay in the geometry view tests, same stand-in style as `geometry-view.test.js`. Chinese and English both finish the chapter. Exit leaves a pre-seeded real geometry draft unchanged. Skip, reset, and chapter retry work.
3. `math-board/tests/practice-construct-bundle.test.js` — the built client inlines `createGeometryConstructChapter` and lists it in `geometryPracticeChapters`.

Run:

```sh
node math-board/build.mjs
node --check math-board/client.js
git diff --check
node --test math-board/src/geometry/geometry-construct.test.js math-board/src/geometry/geometry-view.test.js math-board/tests/practice-construct-bundle.test.js
npm --prefix math-board test
```

The known failure `math-board/src/host/tool-schema.test.js` around the missing fenced JSON recipe is pre-existing. Do not change teaching contracts to satisfy it.

Do not hand-edit `math-board/client.js`.

## Docs

- One short paragraph in `math-board/README.md` under 安全教程扩展接口: chapter id, step ids, and that success is the named tool’s committed element, not a measured relation.
- `math-board/docs/tutorial-07-validation.md`: commands, counts, and what was not executed. Handler replay is not a browser pass.
- `.scratch/math-board-interactive-tutorial/issues/07-geometry-construct.md`: `Status: resolved`, an `## Answer`, and checked boxes only for behavior the tests exercise. Leave the real-device box unchecked.

## Commit and report

Commits on `feat/tutorial-07` only. Message style: `feat(math-board): ...`. Do not amend. Do not use `--no-verify`.

Write the full report to `/Users/yugeng/programming/dsh-edu/.scratch/math-board-interactive-tutorial/reports/07-report.md`. Do not git-add it.

Return only status (`DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`), commit shas, a one-line test summary, and concerns.
