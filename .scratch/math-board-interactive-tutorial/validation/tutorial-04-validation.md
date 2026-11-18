# Ticket 04: quantity organize validation

Validated 2026-11-16 on branch `feat/tutorial-04`, after fast-forwarding onto integration `7216a69` (tickets 01, 02, 03, and 06). Only the quantity organize chapter and its page reports, locale strings, build registration, and these notes changed. Notes chapters, file chapters, later geometry chapters, merge/group rules in `model.js`, teaching skills, and `createPracticeProgress` were not changed.

## Delivered

- [practice-organize.js](<../../../math-board/src/quantity/practice-organize.js>): chapter `quantity-organize`, steps `organize-name / organize-reselect / organize-peer / organize-group / organize-group-name / organize-ungroup / organize-merge / organize-split / organize-copy / organize-crossout / organize-delete`. Each step passes only on the student's own committed change. `start(previousFrame)` returns a practice frame (the shared lifecycle stores that return value). `fresh()` builds the same kind of catalogue start and also returns the goal seed. `skip` prepares the next step's name, group, or merged object and does not feed that preparation to `observe`.
- [view-component.js](<../../../math-board/src/quantity/view-component.js>): group, rename, ungroup, merge, split, duplicate, cross-out, and delete report `type` plus `before` and `after` only after a commit, and only while `practice` is set. A rejected action is not reported.
- Bilingual goal and failure-reason keys. The coach shows `practiceGoal_<step>`. `observe` still returns a `why` dictionary key; the shared lifecycle does not render that return value, so a miss keeps the current goal sentence on screen.

## Executed

- `node math-board/build.mjs`: client rebuilt. `node --check math-board/client.js`: passed. `git diff --check`: passed.
- Focused command: **41/41 passed**:

  ```sh
  node --test math-board/src/quantity/practice-organize.test.js math-board/src/quantity/view-practice.test.js math-board/tests/practice-organize-bundle.test.js
  ```

- `npm --prefix math-board test`: **373 tests, 372 passed, 1 pre-existing failure**. The only failure is [tool-schema.test.js:214](<../../../math-board/src/host/tool-schema.test.js#L214-L220>) (`assert.ok(get)` on the shared-skill fenced JSON recipe). Left unchanged. Locale files have the same 354 keys. The built chapter list is `[createQuantityAdjustChapter, createQuantityOrganizeChapter]`.

## What the handler replay covered

[practice-organize.test.js](<../../../math-board/src/quantity/practice-organize.test.js>) drives committed model actions: valid and empty names, naming the wrong object, reselect, one-member groups, extra objects, unchanged group names, refused ungroup, failed merge, gray merge result, split of another object, copy of another object, cross-out versus delete, delete of another object, emptying the board, and selecting without deleting. Reset, skip, and the real draft key are included. A previous frame's usable objects are reused; a crossed-out object is not chosen as a target.

[view-practice.test.js](<../../../math-board/src/quantity/view-practice.test.js>) mounts the quantity editor and drives the real handlers in Chinese and English, with the stand-in pointer reported as both `mouse` and `touch`. Empty name, disabled merge, cross-out versus delete, and clear-cancel versus delete are in that replay. Skip, reset, supplement, chapter retry, exit, and a remount all leave the pre-seeded real draft unchanged.

## Unexecuted / limits

No real browser was opened. No real mouse, touch device, layout, focus, scroll, or viewport check was run. The mounted replay is a handler replay, not a browser pass. An organize-specific async save/lock-queue case was not added; the replay checks that exit and remount do not change the pre-seeded real draft, and the chapter test checks that practice storage does not write `baicai-edu-math-board:v4:session`.
