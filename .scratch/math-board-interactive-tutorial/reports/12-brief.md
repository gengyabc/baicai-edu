# Task 12 — First-run entry and release validation

Read this first. It is the requirements. Do not reimplement a chapter that is already on this branch. This ticket adds the first-run route, the catalogue claim, the cross-cutting release checks, and the stale tool-schema alignment.

## Where this fits

Chapters through the teacher-demo guide are on the integration branch. `quantity-basics` and `geometry-basics` already exist and are entered from the replay menu (`tutorialReplay` / `startQuantityTour` / `startGeometryTour`). The comment in `view-component.js` says first-run routing belongs to this ticket, not the legacy v1 seen flag. Do not change `createPracticeProgress`, any chapter step list, either model, teaching skills, or the submission protocol. Do not add geometry grading, cross-device sync, or a student-ability record.

## Workspace

All edits and git commands run in:

`/Users/yugeng/programming/dsh-edu/.scratch/worktrees/tutorial-12`

Branch: `feat/tutorial-12`. Do not merge into `feat/math-board-interactive-tutorial`. Do not push. Do not edit the parent checkout except to write the report file named below.

## First run

Keys already in the code:

- Legacy seen flag: `baicai-edu-math-board:tutorial:v1:${mode}` from `tutorialStorageKey`. `isTutorialSeen` is true only when the value is `'1'`.
- Practice record: `baicai-edu-math-board:practice:v2:${mode}`.
- Demo tab memory: `baicai-edu-math-board:geometry-demo-seen:${sessionId}`. It may still switch to the demo tab. It is not practice progress.

When a board tab becomes active and that mode has no `practice:v2` record, open that mode’s practice on its basics chapter. Quantity opens `quantity-basics`. Geometry opens `geometry-basics`. The chapter is not completed by opening. One board’s entry does not write the other board’s practice key.

If `practice:v2` for that mode already exists, do not auto-open and do not reset it. Closing practice and opening the board again is not a new first run. The existing replay menu still resumes the saved chapter.

A legacy seen flag of `'1'` with no practice record still opens the new basics chapter as not completed. Do not copy that flag into practice progress. Do not delete the flag. A student who only has the old flag can still open the new tutorial.

No teacher figure does not start `teacher-demo-basics`. The demo seen key does not mark that guide or any geometry chapter complete.

## Catalogue

The existing practice navigation already shows a chapter status and `practiceOptional`. After basics is completed, one later chapter is not started, one is skipped, and the file chapter is not started:

- those four states are visible
- the file chapter is marked optional
- basics stays completed
- nothing on the page says the whole tutorial is complete

A skipped or unfinished non-optional chapter must not be presented as full completion. The file chapter does not block basics.

## Release checks

Add `math-board/tests/tutorial-release.test.js`. It must execute each claim below with the real page handlers or the real progress owner. A comment that names another test file is not a pass. Do not duplicate every chapter’s success path. Drive the cross-cutting behavior once.

1. First open of quantity starts `quantity-basics` and writes no geometry practice record. First open of geometry starts `geometry-basics` and leaves the quantity record unchanged. No figure does not start the teacher guide.
2. The registered factories contain the step ids already shipped for Q01–Q20, G01–G21, F01–F03 on both boards, and D01–D04. Assert those ids. Do not add steps. A count of steps is not this check; the ids are.
3. A later quantity chapter can start from the board left by the previous practice chapter, and a catalogue entry of one chapter does not read the real draft.
4. One already-tested miss still does not advance when replayed from this file: a cancelled file save, and an empty geometry construction. Call the existing goal or page handler. Do not add a new rule.
5. A quantity board note and an object note stay distinct through the existing notes chapter. A geometry element note and the board note stay distinct through the existing edit chapter. Call those chapters. Do not rewrite them.
6. Exit, then a new progress owner with the same storage, resumes the step and the frame. Skip, then supplement, returns to the saved continuation. Retry of one chapter does not clear another.
7. Exit leaves a pre-seeded real quantity draft, its trace, the real geometry draft, attachments, and sends unchanged.
8. A practice delete or clear does not change the other mode or the real draft. Undo after a practice clear does not restore the cleared practice board.
9. A host clear or settings change that arrives during practice is still on the real draft after exit. The practice entry snapshot does not overwrite it. It is not stored as a student practice action.
10. Quantity and geometry file chapters still refuse the real file handle. A download goal keeps `via: 'download'`. Run the existing file-chapter success and cancel once each, or call the page handlers the existing tests call.
11. The teacher guide still does not call `onCopy`. Hiding the figure does not mark the copy complete.
12. The release replay reaches the basics continue or equivalent first control with pointer type `mouse` and again with `touch`. It must not require Shift, hover, or a keyboard shortcut.
13. With a note overlay open, and with an unfinished geometry construction, the exit control is present and not disabled. Record real small-screen, scroll, and window-resize layout as not executed. Do not claim those passed.
14. When storage throws, the current practice can still be exited, the status says resume is not guaranteed, the real draft is unchanged, and the page does not show a successful save.
15. After exiting practice, the normal quantity insert can still attach the optional trace, the geometry insert has no trace, the board note can enter the composer, and neither insert sends the message or deletes the draft.

`.scratch/math-board-interactive-tutorial/validation/tutorial-12-validation.md` has one row per scenario: the command that executed it, or “not executed” and why. Handler replay is not a browser pass. Do not claim a new server or the existing GUI was updated.

## Tool schema

`math-board/src/host/tool-schema.test.js` around lines 214–220 reads fenced JSON recipes from `math-common/skills/math-common/references/board-contract.md`. That file is prose and has no such recipes, so `assert.ok(get)` fails. Do not edit the skill or the contract. Change the test so it builds the `get` and `show` arguments itself and still runs them through the registered `geometry_board_draw` tool and `eduBoardGeometryDemo` projection. Keep the rectangle assertion. Do not add a recipe to make the old parser pass.

## Docs already on the branch

`issues/03-geometry-safe-basics.md` and `issues/06-quantity-adjust-recover.md` still say `ready-for-agent`. Set both to `resolved` and add an `## Answer` that points at the code and validation already on this branch. Geometry basics: `.scratch/math-board-interactive-tutorial/validation/tutorial-03-validation.md`. Quantity adjust: the existing adjust chapter and merge `7216a69`. Do not change their behavior. Leave any real-device box as it is.

## Docs for this ticket

- One short paragraph in `math-board/README.md` under 安全教程扩展接口: first open starts that board’s basics chapter, the v1 seen flag is not completion, and a later open resumes.
- The validation note above.
- `.scratch/math-board-interactive-tutorial/issues/12-first-run-release-validation.md`: `Status: resolved`, an `## Answer`, and checked boxes only for behavior this ticket’s tests execute. Leave the real-device box unchecked. Do not check the row that asks for a real mouse, a real touch device, and a real layout pass.

## Verify and commit

```sh
node math-board/build.mjs
node --check math-board/client.js
git diff --check
node --test math-board/tests/tutorial-release.test.js math-board/src/host/tool-schema.test.js
npm --prefix math-board test
```

The full suite should be green after the tool-schema test matches the prose contract. If something else fails, fix it only when it is caused by this ticket. Do not hand-edit `client.js`.

Commits on `feat/tutorial-12` only. Message style: `feat(math-board): ...`. Do not amend. Do not use `--no-verify`.

Write the full report to `/Users/yugeng/programming/dsh-edu/.scratch/math-board-interactive-tutorial/reports/12-report.md`. Do not git-add it.

Return only status (`DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`), commit shas, a one-line test summary, and concerns.
