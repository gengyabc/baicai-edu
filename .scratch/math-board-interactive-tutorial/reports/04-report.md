# Task 04 report — quantity organize practice

**Status:** DONE
**Branch:** `feat/tutorial-04` in `/Users/yugeng/programming/dsh-edu/.scratch/worktrees/tutorial-04`
**Commits:**
- `a51fa7fd10ae6ed2bb92bf581fc1285b83e40334` — `feat(math-board): add quantity organize practice for naming through delete`
- `328502a8588b4d85d231ec1a761c517adcf6640d` — `docs: resolve tutorial ticket04 quantity organize`

Not merged into `feat/math-board-interactive-tutorial`. Not pushed. This report is not in either commit.

Integration base after the required fast-forward: `7216a69` (`merge: integrate ticket06 quantity adjust and recover practice`). Stash of the two uncommitted organize files, merge, and stash pop had no conflict.

## What landed

Chapter `quantity-organize`, title key `practiceOrganize`, eleven steps in this order:

`organize-name`, `organize-reselect`, `organize-peer`, `organize-group`, `organize-group-name`, `organize-ungroup`, `organize-merge`, `organize-split`, `organize-copy`, `organize-crossout`, `organize-delete`.

A step advances only when the student commits that step's own change. Empty or unchanged names, naming a different object, adding extra objects, a one-member group, keeping the default group name, a refused ungroup, a disabled or failed merge, splitting or copying a different object, treating delete as cross-out, deleting a different object, emptying the board, and merely selecting the object on the delete step do not advance. The gray merge result (color 9) is not judged as an error and is not a math answer. Goal copy says grouping is not merging, the gray result is not a mistake, split follows the recorded sources, undo can restore a cross-out, and delete is not clear-all. No second undo chapter was added.

`skip` prepares the next step (name from reselect onward, a group only for group-name and ungroup, a merged object only on the split step) and those programmatic changes are not passed to `observe`. Later skipped steps split that merge back so copy, cross-out, and delete still have live marked objects. `start(previousFrame)` reuses suitable objects from the previous practice frame, otherwise creates a mergeable pair. `fresh()` supports a catalogue start with no previous frame. `createGoal` throws `Invalid organize goal` on an inconsistent saved goal instead of repairing it.

The quantity page reports group, rename, ungroup, merge, split, duplicate, cross-out, and delete only when `practice` is set and only after the board actually changes. A rejected `action()` is not reported. Selection still uses the existing `select` event. Practice does not write `baicai-edu-math-board:v4:session` or any other real draft key.

The factory is inlined in `build.mjs` and appended after `createQuantityAdjustChapter`. Adjust and basics stay registered. The factory has no module-scope helpers.

## Tests actually run

```sh
node math-board/build.mjs
node --check math-board/client.js
git diff --check
node --test math-board/src/quantity/practice-organize.test.js math-board/src/quantity/view-practice.test.js math-board/tests/practice-organize-bundle.test.js
npm --prefix math-board test
```

- Build, `node --check`, and `git diff --check`: passed.
- Focused command, re-run after the last judge fix and client rebuild: **41/41 passed** (10 organize unit, view-practice including four organize replays, 4 organize bundle).
- Full suite, re-run after that same fix, immediately before the feature commit: **373 tests, 372 passed, 1 failed**. The only failure is the pre-existing `math-board/src/host/tool-schema.test.js:214` (`assert.ok(get)` on the missing fenced JSON recipe). Not changed.

Self-review against tests that passed in that last run:

- Delete versus cross-out: unit test `crossout changes the marked object...` and the mounted replay. Cross-out leaves the marked object with `removed: true`. Delete of another object, emptying the board, and selecting the marked object stay on `organize-delete`. Deleting that object completes the chapter.
- Failed merge: unit test `an unmergeable pair is refused...` and the replay, which selects both objects, sees the merge button disabled, clicks it, and stays on `organize-merge` until the aliases match and merge succeeds. Color 9 is asserted and does not fail the step.
- Real-draft isolation: the unit test keeps two house objects on `baicai-edu-math-board:v4:session` and finds no house-shaped object on any practice board. The replay deep-compares the pre-seeded real draft after exit and after a remount. Uploads stay at 0.
- Locale keys: both files have the same 354 keys. Build would throw on a mismatch. New goal keys are `practiceOrganize` and `practiceGoal_<stepId>`. Why keys exist in both files.
- Adjust remains registered: `practice-adjust-bundle.test.js` still passes, and the organize bundle test asserts the array `[createQuantityAdjustChapter, createQuantityOrganizeChapter]`.

## Where the brief and the API disagreed

Followed the model and the shared lifecycle, and recorded the differences here.

1. The reset failure was not an invalid add. `start()` originally returned `{ frame, saved }`. `createPracticeProgress` stores that return value as the frame, so `state.frame.board` was undefined and `validate(undefined)` threw `Invalid fields` from `keys()`. `start()` now returns the frame. `createGoal()` binds targets lazily on the first `snapshot()` or `observe()`, after `start()` or `fresh()` has set `prepared`. The reset mutation was also changed to `{ type: 'add', shape: 'circle' }`, as the brief asked. `{ type: 'add', shape: 'star', count: 4 }` is a valid add on a real board: `star` is in `settings.defaults` and `count` 1–100 is accepted. `fresh()` still returns `{ frame, saved }` for a caller that wants both. The page uses `start(null)` plus `createGoal()`.

2. Searching practice JSON for the substring `"house"` is a false positive. Every board's `settings.defaults` includes that shape. The reset test walks practice objects and asserts `object.shape !== 'house'`. The real key still has two house objects.

3. The draft skip assertion expected a merged object on every step at or after split. That buried the marked ids, so copy, cross-out, and delete could not be practiced after a skip. A merged object is present only on `organize-split`. Later steps restore the live members. That restoration is not observed.

4. `observe` returns a `why` dictionary key, and those keys exist in both locale files, so a later reader of `t(why)` would not show a raw key. `createPracticeProgress` ignores that return value and was not changed. The coach shows `practiceGoal_<step>`, which stays on screen when the action misses. There is no separate failure banner.

5. The draft judge treated `select` of exactly the marked object as success on `organize-delete`. Selecting is not deleting. Only `organize-reselect` passes on `select`. The unit test and the replay both assert the step stays on delete until the delete commit.

## Issue checkboxes

Checked the six behavior boxes the tests exercise (Q04–Q09 coverage, name and group misses, merge and split, copy / cross-out / delete, the teaching sentences, catalogue / retry / skip / supplement).

Left unchecked:

- Isolation. Exit and remount leave the pre-seeded real draft unchanged, and the unit test checks the real session key. An organize-specific async lock-queue case was not added. The shared owner already covers that path in `view-practice.test.js`. The conjunction is not fully re-exercised here.
- Chinese and English, mouse and touch, automated replay. Handler replay finishes the chapter in `en` and `zh` with pointer type `mouse` and `touch`. That is not a browser pass. No real browser, real mouse, touch device, layout, focus, or scroll check was run.

## Not done, on purpose

Notes (Q10–Q13), file chapters, later geometry chapters, merge and group rule changes, teaching skills, submission protocol, and `createPracticeProgress` were not touched. The pre-existing tool-schema failure was not "fixed".

## Review fixes

The review's Critical and Important findings are fixed on `feat/tutorial-04`. `model.js`, `createPracticeProgress`, teaching skills, and the submission protocol were not changed. The two Minor gaps were left as they were: the cross-out "deleting is not crossing out" assertion still calls `refuse()` (an unchanged batch), and the "split something else" assertion still skips the call when no other object exists.

- Peer preparation names only object 1 at `organize-reselect` and `organize-peer`. If object 2 already holds that name when peer is prepared, its alias is cleared. That clear is not observed. From `organize-group` onward both objects still receive the shared name so later merge rules work. A shared `createPracticeProgress` skip into peer asserts object 2 does not have the saved name, a reset restores that start, and setting object 2's alias to the saved name then advances to `organize-group`.
- A merge that `M.mergeCandidate` allows and that the model commits passes, including when a selection note names the two marked objects. The model already moves that note onto the merged object. The extra `mergeKeepsNotes` rejection is gone.
- `organize-reselect` passes only when the one selected object is object 1 and its alias on the reported board is still the alias saved at the end of `organize-name`. Changing that alias and then selecting does not pass. Practice select events now include `after: boardRef.current` through the existing `practiceEvent` path, which still no-ops when practice is closed.

Commands, after `node math-board/build.mjs`:

```sh
node --check math-board/client.js
node --test math-board/src/quantity/practice-organize.test.js math-board/src/quantity/view-practice.test.js math-board/tests/practice-organize-bundle.test.js
```

`node --check` passed. Focused result: **43 tests, 43 passed, 0 failed**. `git diff --check` passed. The full `npm --prefix math-board test` suite was not re-run for this fix.
