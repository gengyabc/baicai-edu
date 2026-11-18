# Task 12 report — first-run entry and release validation

**Status:** DONE_WITH_CONCERNS

**Branch:** `feat/tutorial-12` in `/Users/yugeng/programming/dsh-edu/.scratch/worktrees/tutorial-12`

**Commits:**

- `46d34944c7cf2f80a71a02a1111347eabbbac069` — `feat(math-board): open each board's basics chapter on first run`

Not merged. Not pushed.

## What landed

First-run lives on the page that already owns `startQuantityTour` / `startGeometryTour`. No chapter was reimplemented. `createPracticeProgress`, chapter step lists, both models, teaching skills, `board-contract.md`, and the submission protocol were not changed.

- Quantity (`math-board/src/quantity/view-component.js`): when that board’s tab is active and `baicai-edu-math-board:practice:v2:quantity` is absent, open `quantity-basics`. Opening does not complete the chapter. A present record does not auto-open and is not reset. Closing practice and opening the board again is not a new first run. The replay menu still resumes the saved chapter.
- Geometry (`math-board/src/geometry/geometry-view.js`): the same route for `geometry-basics` and `practice:v2:geometry`. One board’s entry does not write the other board’s practice key.
- The legacy flag `baicai-edu-math-board:tutorial:v1:${mode}` stays as stored. `isTutorialSeen` is still true only for `'1'`. A `'1'` with no practice record still opens the new basics chapter as not completed. The flag is not copied into practice progress and is not deleted.
- A `localStorage.getItem` throw is treated as “a record exists”, so a read failure does not invent a first run.
- No teacher figure, and a figure whose board has no elements, does not start `teacher-demo-basics`. `geometry-demo-seen:` may still switch the shell to the demo tab. It is not practice progress.
- Catalogue claim, driven on the quantity page: after basics is completed, organize is skipped, adjust is not started, and the file chapter is not started. Those four states are visible, the file chapter is marked optional, basics stays completed, and the page does not say the whole tutorial is complete. `practiceComplete` was left as the chapter sentence “基础操作练习已完成”.
- `math-board/tests/tutorial-release.test.js` drives the claims with the existing harness (`createHooks`, `installBrowser`, `text`, `walk`) or the real progress owner. It reads `practiceSteps` from the quantity page and `.steps` from each registered factory. A step count is not the coverage check.
- `math-board/src/host/tool-schema.test.js` builds `get` (`{ action: 'get' }`) and `show` (rectangle figure, `expectedRevision` taken from the get result) and runs them through registered `geometry_board_draw` and `eduBoardGeometryDemo`. The rectangle assertion remains. No fenced JSON recipe was added to the skill.
- `.scratch/math-board-interactive-tutorial/validation/tutorial-12-validation.md` has one row per spec section 11 scenario, with the command or “not executed” and why.
- README, under 安全教程扩展接口: first open starts that board’s basics chapter, the v1 seen flag is not completion, and a later open resumes.
- Issues 03 and 06 are `resolved` with a short Answer only. Their checkboxes and behavior text are unchanged. Issue 03 points at `.scratch/math-board-interactive-tutorial/validation/tutorial-03-validation.md` and the geometry basics page. Issue 06 points at `math-board/src/quantity/practice-adjust.js` and merge `7216a69`. Issue 12 is `resolved`. Boxes checked only where this ticket’s tests execute the row. The real-device row stays unchecked, as do the full per-item failure replay, the full section 11 replay, and the late-callback row.

Existing quantity, geometry, and teacher-demo mounts seed a valid empty practice envelope only when that key is absent. Explicit `tutorialReplay` / `startTour` still calls `enter()`. An invalid seed already stored by a test is not overwritten. `client.js` was rebuilt by `node math-board/build.mjs` and was not hand-edited.

## Where the page overruled a guess

- The geometry page shows the teacher-guide copy while the step is `demo-return` or `demo-complete`. First-run does not cover that frame. The effect depends only on tab activation, the same guard that keeps an exited practice from reopening immediately. The same visit does not auto-open `geometry-basics` after the guide frame ends. Leaving the geometry tab and coming back still opens it when no geometry practice record exists.
- F03 has no third step id. Both file chapters ship `files-save` then `files-open`. F03 is the cancel and download honesty on those steps. The release test calls the quantity file goal with `{ type: 'save' }` and it stays on `files-save`.
- The 首次教程 paragraphs were also updated. They no longer say first-run is left to this ticket, and the quantity paragraph no longer says file open/save is still blocked. Those file chapters are already described later in the README. The requested paragraph is the one under 安全教程扩展接口.

## Tests

```sh
node math-board/build.mjs
node --check math-board/client.js
git diff --check
node --test math-board/tests/tutorial-release.test.js math-board/src/host/tool-schema.test.js
npm --prefix math-board test
```

Focused command: **23/23 passed** (6 tool-schema, 17 release).

`npm --prefix math-board test`: **519 tests, 519 passed, 0 failed**. This is the suite run after the last test edit, immediately before the commit.

Handler replay is not a browser pass. No new server was started. The existing GUI was not updated.

What the release file actually drives:

1. First open of quantity starts `quantity-basics` and writes no geometry or teacher-demo practice key. First open of geometry starts `geometry-basics` and leaves the quantity record byte-for-byte. Both v1 flags stay `'1'`. Reopen does not auto-open; 查看教程 resumes `point`. No figure and an empty board do not start the guide.
2. Shipped ids for Q01–Q20, G01–G21, F01–F02 on both boards, and D01–D04. Quantity basics ids are read from the page’s `practiceSteps`. Factory ids are the factories’ `.steps`.
3. Organize starts from the objects left by completed quantity basics. Catalogue entry does not change the real draft, including the pre-seeded note.
4. Cancelled quantity and geometry file saves stay on `files-save`. One segment click, and an empty segment observe, stay on `point`.
5. Notes chapter: board note and object note stay distinct. Edit chapter: element note and board note stay distinct.
6. A new `createPracticeProgress` owner on the same storage resumes the step and frame. Skip then supplement returns. Retry of notes does not clear basics.
7. A pre-seeded quantity star, its trace envelope, and one geometry point survive a practice point and exit. Attachments, sends, and persist stay 0.
8. Practice delete and a confirmed clear leave the real quantity draft and the geometry practice record unchanged. Undo after the clear leaves the practice board empty.
9. A host settings change and a host clear during practice are still on the real draft after exit. The practice goal and frame are not overwritten. Sends stay 0.
10. `AbortError` does not advance and does not fall through. The download path records `via: 'download'`. The real IndexedDB handle is not written.
11. Guide copy does not change the geometry key and sets `copied`. Hiding the figure removes “放到我的几何画板” and leaves `copied` false.
12. Quantity’s first add and geometry’s first point accept `mouse` and `touch` with `shiftKey: false`.
13. Exit stays enabled with a note overlay open and with an unfinished segment. Real small-screen, scroll, and window-resize layout were not executed.
14. `setItem` failure on practice keys still allows exit, shows `practiceStorageWarning`, does not show a successful save, and leaves the real draft. Sends stay 0.
15. After exit, quantity insert can attach the trace and the board note. Geometry insert is one snapshot and the board note, with no trace. Neither sends or deletes the draft.

## Not executed

- Real browser, real mouse, real touch device, small-screen layout, scroll layout, window-resize, and orientation.
- English replay inside `tutorial-release.test.js`.
- Per-item success and failure replay of every chapter (add failure, repeated color, cancelled edit, empty note, failed merge, quantity group and selection notes, geometry point note and short caption, multi-select, polygon close, label edit).
- A successful File System Access write. Cancel and the download fallback were executed.
- A callback that arrives after the page is destroyed.
- A practice-file import over the real draft.
- A separate pre-seeded note, history, settings, and viewport checklist beyond the star, the trace envelope, and the geometry point.
- A real workbench close or browser refresh. Resume is a new progress owner on the same storage.
- A `getItem` throw as its own test. The implementation treats that throw as “already recorded”.

## Concerns

- After the teacher return frame ends, geometry basics does not auto-open until the student leaves the geometry tab and comes back. The page is showing that guide’s copy, so first-run must not cover it; the same-visit follow-up is the gap.
- Issue 12 leaves four boxes unchecked: full per-item failure coverage, a complete section 11 replay, the real-device and layout row, and the row that also requires a post-destroy callback. The validation note records each of those as not executed or only partly executed.
- The README 首次教程 paragraphs changed as well as the requested 安全教程扩展接口 paragraph, so they would not keep saying this ticket was still pending or that quantity file save was still blocked.

## Follow-up

`6d46c62464118d1b6891f969435f5fd945a899e5` — `fix(math-board): keep geometry first-run from covering the teacher guide`.

An open teacher guide, on any step, no longer starts geometry basics. `opening geometry during the teacher guide does not cover the return frame` opens Geometry during `demo-read`, finishes copy and return, and comes back: the return frame is showing, `practice:v2:geometry` was not written, and the teacher-demo record still holds the copy. No extra practice exit.

Focused run: **100/100 passed** (`tutorial-release.test.js`, `tool-schema.test.js`, `geometry-view.test.js`, `geometry-demo-view.test.js`). `npm --prefix math-board test`: **520/520 passed**. Geometry does not auto-start while the guide is open. A later visit after the guide is closed may still open basics.
