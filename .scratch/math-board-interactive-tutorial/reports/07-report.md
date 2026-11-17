# Task 07 report — geometry construct chapter

**Status:** DONE_WITH_CONCERNS

**Branch:** `feat/tutorial-07` in `/Users/yugeng/programming/dsh-edu/.scratch/worktrees/tutorial-07`

**Commits:**

- `5789ac06092ece055755439bbebbf4825c56b4a8` — `feat(math-board): add geometry construct practice for committed tools`
- `3a0c3f3733348f59fde5971f8eae5d51349ed80d` — `docs(math-board): record the geometry construct commit on its issue`

Not pushed. Not merged. The parent checkout was not edited except for this report.

## Delivered

Chapter `geometry-construct` (`titleKey` `geometryPracticeConstruct`) in `math-board/src/geometry/geometry-construct.js`. Factory `createGeometryConstructChapter({ G, emptyFrame })` is self-contained and inlined by `build.mjs`. Basics stays registered. Its step list was not changed.

Steps, in order:

`construct-parallelogram`, `construct-rectangle`, `construct-select-side`, `construct-midpoint`, `construct-drag`, `construct-auxiliary`, `construct-auxiliary-off`.

A parallelogram or rectangle passes only when that tool commits a new element of that type. A plain polygon, an unfinished preview, choosing the tool, and the other quadrilateral do not pass. Selecting one segment, or one edge of a polygon, rectangle, or parallelogram, passes when both ends are free points and do not already have a midpoint. A point, a circle, an empty selection, a side that already has a midpoint, and an edge with a derived end do not. Midpoint passes only for `addMidpoint` on that side. A free point and a click that does not commit do not. Drag passes only when the marked free point's position changes through `movePoint`. A press that does not move, another free point, and the midpoint do not. The goal copy says a derived point cannot be dragged directly and is not this step's target. Auxiliary create passes only when a new element has `role: 'auxiliary'`. Turning the switch on, with no new auxiliary element, does not pass. Auxiliary off passes when the switch then goes from on to off. Success is not inferred from where the figure sits. Lengths, angles, parallel, perpendicular, equal, and collinear are not judged. The geometry model was not changed.

`start(previousFrame)` returns the frame. Three non-collinear free points and one segment whose ends are free and have no midpoint are reused when the previous practice frame already has them. Otherwise those points and that one segment are created, and those creates are not observed. `fresh()` returns `{ frame, saved }`. `skip` prepares the next step's prerequisites and does not call `observe`. It does not create the parallelogram, rectangle, midpoint, or auxiliary element the current step asks for. Before the auxiliary create step, auxiliary mode is off. The off step starts with auxiliary mode on. `createGoal` throws `Invalid construct goal` on an inconsistent saved goal.

Page events, only while practice is open:

- draw from `finish()` includes `role`
- selection includes `after` (the board) so the side can be checked
- midpoint: `{ type: 'midpoint', before, after, a, b, id }` after a successful commit
- move: `{ type: 'move', before, after, id }` after a commit that changes that point
- auxiliary: `{ type: 'auxiliary', before, after }` where `before` and `after` are the switch values, because the board does not change

A disabled midpoint click returns before `action()` and is not reported. A press that does not move is not reported. Host and system changes are not reported. The practice board is not written into the real geometry draft.

## Difference from the brief

No geometry-model disagreement. The brief did not guess coordinates. Seed points are non-collinear, and a parallelogram's fourth corner stays inside the board margin, because the model refuses a flat parallelogram and a point outside the margin. Collinear points inherited from an earlier frame gain one off-line point for the same reason.

The auxiliary event's `before` and `after` are the switch booleans. A draw or move event's `before` and `after` remain boards.

## Tests

Focused command, **61/61 passed** (then a one-line unused assertion was removed; the same files passed again inside the full suite):

```sh
node --test math-board/src/geometry/geometry-construct.test.js math-board/src/geometry/geometry-view.test.js math-board/tests/practice-construct-bundle.test.js
```

`npm --prefix math-board test`: **412 tests, 411 passed, 1 failed**. The only failure is the pre-existing `math-board/src/host/tool-schema.test.js` assertion at line 220 (`assert.ok(get)` on the shared-skill fenced JSON recipe). Teaching contracts were not changed. This work adds 17 tests (8 chapter, 5 handler replays, 4 bundle).

Also run before the commit: `node math-board/build.mjs`, `node --check math-board/client.js`, `git diff --check`. All passed. `client.js` was rebuilt, not hand-edited.

The handler replay finishes the chapter in Chinese and English with the stand-in pointer reported as both `mouse` and `touch`. Exit, reset, skip, supplement, and chapter retry work. Chapter retry leaves the basics step state in place. Exit leaves a pre-seeded real geometry draft unchanged, and the quantity draft, uploads, attachments, and sends stay unchanged.

## Docs

- `math-board/README.md`: one paragraph under 安全教程扩展接口.
- `math-board/docs/tutorial-07-validation.md`: commands, counts, and what was not executed.
- Worktree issue `07-geometry-construct.md`: `Status: resolved`, `## Answer`, and checked boxes only where the tests exercise the behavior. The last box is unchecked.

Both locale files have the same 384 UI keys.

## Not done

No edit, notes, adjust, file, or teacher-demo chapter. No change to construction rules, the basics step list, teaching skills, the submission protocol, or `createPracticeProgress`. No merge and no push.

No real browser, real mouse, touch device, layout, focus, scroll, or viewport check. The mounted replay is a handler replay, not a browser pass.

## Concerns

1. There is no real-browser or real-device pass. Handler replay used `mouse` and `touch` pointer types only. The last acceptance checkbox stays unchecked for that reason.

## Review fix

Reset of `construct-drag` restored the start saved when the midpoint commit selected the derived point. The view had highlighted `goal.pointId` only when that id changed, so the derived point stayed marked and a move of it could not pass.

`geometry-view.js` now selects the free point whenever the step is `construct-drag` and the selection is not exactly `[goal.pointId]`, including after `applyPracticeFrame` on reset. The drag judge still accepts only that free point. `createPracticeProgress` and the geometry model were not changed.

A mounted replay completes the midpoint, resets, and checks that the selection and the pressed point are `goal.pointId`, not the derived midpoint. A committed move of that free point then advances.

```sh
node --test math-board/src/geometry/geometry-construct.test.js math-board/src/geometry/geometry-view.test.js math-board/tests/practice-construct-bundle.test.js
```

**62/62 passed.** `node math-board/build.mjs` rebuilt `client.js`. `node --check math-board/client.js` passed.
