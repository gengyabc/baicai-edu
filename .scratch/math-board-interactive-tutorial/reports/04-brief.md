# Task 04 — Quantity organize chapter (Q04–Q09)

Read this first. It is the requirements. Exact ids and step names below are binding.

## Where this fits

Integration branch `feat/math-board-interactive-tutorial` already has:

- quantity basics (`quantity-basics`)
- shared chapter lifecycle (`math-board/src/shell/practice-progress.js`)
- geometry basics (`math-board/src/geometry/geometry-basics.js`)
- quantity adjust (`quantity-adjust` in `math-board/src/quantity/practice-adjust.js`)

You finish only the organize chapter. Do not implement notes (Q10–Q13), file chapters, or geometry chapters. Do not change merge/group rules in `model.js`, teaching skills, submission protocol, or the shared lifecycle.

## Workspace

All edits and git commands run in:

`/Users/yugeng/programming/dsh-edu/.scratch/worktrees/tutorial-04`

Branch: `feat/tutorial-04`.

Before editing, bring this branch up to date with integration **without losing the uncommitted draft**:

```sh
cd /Users/yugeng/programming/dsh-edu/.scratch/worktrees/tutorial-04
git status --short
git stash push -u -m "organize-draft" -- math-board/src/quantity/practice-organize.js math-board/src/quantity/practice-organize.test.js
git merge feat/math-board-interactive-tutorial
git stash pop
```

If the stash pop conflicts, keep the organize draft and resolve in favor of also retaining the already-merged adjust and geometry files. Do not reset the integration branch. Do not push. Commit only on `feat/tutorial-04`. Do not merge into `feat/math-board-interactive-tutorial` (a later merger does that).

Do not edit `/Users/yugeng/programming/dsh-edu` outside this worktree. The parent checkout has unrelated uncommitted claim notes.

## What already exists (do not throw it away)

Uncommitted:

- `math-board/src/quantity/practice-organize.js` — `createQuantityOrganizeChapter({ M, T, emptyFrame })`, id `quantity-organize`, titleKey `practiceOrganize`.
- `math-board/src/quantity/practice-organize.test.js`

Current test result in the worktree (before the merge): **8 pass, 2 fail**.

1. `crossout changes the marked object...` fails at `completed === true`. Delete is reported as `batch` with a `delete` action. After a successful delete the object is gone, and `judge` treats a missing object as failure (`!now` → not passed). Cross-out (object still present, `removed: true`) must pass; delete of that same object must pass and reach `completed`; deleting a different object or clearing the board must not.
2. `reset restores the step start...` throws `Invalid fields` because `M.reduce(..., { type: 'add', shape: 'star', count: 4 })` is not a valid add. Fix the test to use the real add action. Reset must still restore that step's own start.

Follow the adjust chapter as the wiring template (already on integration after the merge):

- `math-board/src/quantity/practice-adjust.js`
- `math-board/src/quantity/practice-adjust.test.js`
- `math-board/src/quantity/view-practice.test.js` (adjust replay near the bottom)
- `math-board/tests/practice-adjust-bundle.test.js`
- `math-board/build.mjs` (`quantityPracticeChapters`)
- `math-board/locale/zh.json` and `en.json`
- `math-board/src/quantity/view-component.js` (`practiceEvent`)

## Required operations (do not collapse these into one prompt)

Chapter id: `quantity-organize`.

Keep these step ids if the draft already uses them; they must stay a real sequence the student performs, not one combined hint:

| Spec | Step ids already in the draft | Done when |
| --- | --- | --- |
| Q04 name | `organize-name` | A valid new alias is saved on the marked object. Empty, unchanged, or naming a different object does not pass. |
| Q04 read back | `organize-reselect` | The student selects exactly that object again and its saved alias is still the one just written. Selecting something else does not pass. |
| merge precondition | `organize-peer` | The second marked object is given the same alias so the existing merge rules can allow the pair. This is not a substitute for Q04. |
| Q05 group | `organize-group` | A new group contains both marked members. Adding extra objects is not grouping. A one-member group does not pass. |
| Q05 group name | `organize-group-name` | The group's alias changes to a new non-empty name. Keeping the default name does not pass. |
| Q05 ungroup | `organize-ungroup` | That group is dissolved and both members are independent again. A refused click does not pass. |
| Q06 merge | `organize-merge` | `M.mergeCandidate` allows the pair and merge succeeds under unchanged rules. A disabled/failed merge does not pass. Do not judge the gray result as an error. |
| Q06 split | `organize-split` | Split restores the recorded sources (shape, value, color, alias, note). Splitting something else does not pass. |
| Q07 copy | `organize-copy` | One matching copy of the marked object appears and the original remains. Copying a different object does not pass. |
| Q08 cross out | `organize-crossout` | The marked object becomes `removed: true` and stays on the board. Delete is not cross-out. Say that undo can restore it; do not add a second undo chapter (Q16 is already `quantity-adjust`). |
| Q09 delete | `organize-delete` | That object is removed. Deleting a different object, or emptying the board, does not pass. Other objects remain. |

`skip(saved, frame)` must hand the next step a board that already has the prerequisites (name, group, merged object) without those programmatic changes counting as the student's action. `start(previousFrame)` reuses suitable objects from the previous practice frame when they exist, and otherwise creates a mergeable pair. `fresh()` supports catalogue entry with no previous frame. `createGoal` refuses an inconsistent saved goal instead of repairing it.

Programmatic `ready()` changes must never be fed to `observe`.

## Page wiring

The quantity page already performs group, rename, ungroup, merge, split, duplicate, cross-out, and delete on the practice board (`view-component.js` `groupSelection`, `ungroup`, `duplicate`, `mergeSelection`, `splitSelection`, `removeSelected`, `crossOut`, alias overlay). It does **not** yet report those commits to `practiceEvent`.

Add practice reports only when `props.practice` is set (the existing `practiceEvent` helper already no-ops otherwise). Each report must include `type` plus `before` and `after` boards for the committed change, matching what `judge` reads. Do not report a click that `action()` rejected. Do not report host/system changes. Do not write practice into the real draft key `baicai-edu-math-board:v4:session` or any other real draft/trace/attachment key.

Selection reports already exist (`type: 'select'`). Reselect must use that path.

Bilingual goal strings: `practiceGoal_<stepId>` in both `locale/zh.json` and `locale/en.json`, plus `practiceOrganize` as the chapter title. Keys must exist in both languages. Failure reasons returned as `why` must be dictionary keys that exist in both files (the draft already names keys such as `organizeNameExplain`). Add those keys. Do not leave raw keys on screen.

Register the factory the same way as adjust:

- import in `math-board/build.mjs`
- inline with `.toString()`
- append to `Browser.quantityPracticeChapters` after `createQuantityAdjustChapter` (order: adjust already registered; organize is another independent chapter — append, do not replace adjust or basics)
- the factory must stay self-contained for inlining (no free variables)

The page builds chapters with `shared.quantityPracticeChapters`. Do not change `createPracticeProgress`.

## Tests

1. Fix and keep `practice-organize.test.js`. Cover each success and at least one miss for name, reselect, group, group name, ungroup, merge, split, copy, cross-out, and delete. Include: add-more-objects is not grouping; failed merge does not advance; copy keeps the original; cross-out is not delete; delete is not clear-all.
2. Add a mounted-editor replay in `view-practice.test.js` (same stand-in style as the adjust replay) that drives the real handlers: Chinese and English both finish the chapter; a refused/empty name does not advance; skip, reset, supplement, and chapter retry work; exit leaves the pre-seeded real draft unchanged.
3. Add `math-board/tests/practice-organize-bundle.test.js` mirroring `practice-adjust-bundle.test.js`: the built client inlines `createQuantityOrganizeChapter` and lists it in `quantityPracticeChapters`.

Run, and record the commands and results:

```sh
node math-board/build.mjs
node --check math-board/client.js
node --test math-board/src/quantity/practice-organize.test.js math-board/src/quantity/view-practice.test.js math-board/tests/practice-organize-bundle.test.js
npm --prefix math-board test
```

The known failure `math-board/src/host/tool-schema.test.js` around the missing fenced JSON recipe is pre-existing. Do not "fix" teaching contracts to satisfy it. Any other new failure is yours.

`git diff --check` must pass. Do not hand-edit `math-board/client.js`; rebuild it.

## Docs in this branch

- Short note in `math-board/README.md` under the existing 安全教程扩展接口 section: chapter id, step ids, and that judgments use committed operations only.
- `math-board/docs/tutorial-04-validation.md`: what was executed, commands, counts, and what was **not** executed (real browser, real mouse/touch devices, layout). Do not call handler replay a browser pass.
- Issue file `.scratch/math-board-interactive-tutorial/issues/04-quantity-organize.md`: set `Status: resolved`, check a box only for behavior this branch's tests actually exercise, and add an `## Answer` with commit ids, test commands, and the unexecuted limits. Leave boxes unchecked when the only evidence would be a real device.

## Commit

One or more commits on `feat/tutorial-04` only. Message style from this repo: `feat(math-board): ...` focusing on why. Do not amend commits you did not create. Do not push. Do not update git config. Do not use `--no-verify`.

## Report

Write the full report to:

`/Users/yugeng/programming/dsh-edu/.scratch/math-board-interactive-tutorial/reports/04-report.md`

That path is on the parent checkout, not inside your commit. Do not `git add` it.

Return to the controller only: status (`DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`), commit shas, one-line test summary, and concerns.

## Self-review before reporting

Confirm delete-vs-cross-out, failed merge, and real-draft isolation with a test you actually ran. Confirm both locale files have the same new keys. Confirm `quantity-adjust` is still registered after your build change.
