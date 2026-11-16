# Ticket02: chapters, resume and retry validation

Validated 2026-11-16 on branch `feat/tutorial-02`, based on integration `1b10983` (ancestor `95b0559`, ticket01). Only explicit quantity tutorial entry changed. Teaching skills/protocols, legacy first-run migration, geometry operation chapters and teacher-demo chapters are not delivered here.

## Executed

- Test-first slices at the approved controller and real quantity-editor seams: resume/restore goal; exact frame and step-start reset; skipped prerequisites and skipped-step repair; current chapter restoration; independent fixture chapter entry and chapter-only retry; continuous frame reuse; denied/corrupt/incompatible storage and immediate scroll-only save-failure feedback.
- `node math-board/build.mjs`: generated client rebuilt; `node --check math-board/client.js`: passed.
- `git diff --check`: passed.
- Focused command: **128/128 passed**:

  ```sh
  node --test math-board/src/shell/practice-progress.test.js math-board/src/quantity/practice.test.js math-board/src/quantity/view-practice.test.js math-board/src/shell/tutorial.test.js math-board/src/quantity/view-trace.test.js math-board/src/geometry/geometry-view.test.js math-board/tests/client-smoke.test.js
  ```

- `npm --prefix math-board test`: **327 tests, 326 passed, 1 pre-existing failure**. The sole failure is [tool-schema.test.js:214](<../src/host/tool-schema.test.js#L214-L220>), stale shared-skill fenced-JSON recipe extraction (`assert.ok(get)`). Left unchanged for ticket12. Package extraction/build/reproducibility test passed.

## Actual interaction-handler replay (not browser E2E)

[Quantity editor tests](<../src/quantity/view-practice.test.js>) exercise the real quantity editor and mounted independent practice owner through the shared React/browser stand-ins:

- English and Chinese, mouse/touch pointer-handler basics: add, committed drag, second add, exact single/multi/empty selection, simulated insertion, exit. Preview and wrong selection do not pass. No composer/upload/send access.
- Save an object explanation, change the pattern rail, disable trace attachment, zoom to 125%, scroll; exit and fresh mount; normal real draft appears until explicit reentry. Reentry restores the same target id and `move` goal, saved explanation, pattern rail, preference, zoom and scroll. Undo removes the saved explanation; step reset restores the earlier complete practice start. Retry starts only the current chapter.
- Independent optional fixture chapter supplies its own object, does not pass from preseed, completes only after a user add, restores its current chapter on fresh mount, and leaves basics progress/frame intact when retried. No future production operation chapter is used as a dependency.
- Skipping initial add supplies a practice target for move; repairing that skipped add restores its original empty start and requires a fresh add. Removed dependencies can be replenished on skip without awarding the next step.
- Denied writes, invalid JSON, incompatible version, invalid frame and later scroll-only write failure show an honest continuation warning. Practice and exit remain usable; real storage remains unchanged.
- Real synthetic rich notes/merge/group state, trace, settings, selection and view survive practice. Legal host settings/clear continue to update the hidden real owner, including queued callbacks. Exit never restores an old backup over the host changes. Workbench close works with an explanation editor open.

[Controller tests](<../src/shell/practice-progress.test.js>) additionally verify four progress states, optional pending chapters, per-mode storage isolation, step-start history reset and preservation of unrelated chapter completion.

## Merger correction: supplementary practice preserves later progress

The merger found that repairing a skipped early step reset a later completed step to in-progress. The regression was reproduced red before the correction. New controller cases cover successful observe and re-skip during supplement: a three-step `[skipped, completed, completed]` chapter returns directly to its prior terminal cursor, while mixed later completed/skipped/pending states retain their statuses, original step-reset checkpoints, and paired continuation goal/frame. Refresh during supplement preserves the return cursor. Supplementing another skipped step does not require replaying completed operations; only explicit chapter retry resets the chapter.

A real editor regression first reproduced the second failure: changing only the goal cursor left temporary supplemental objects visible instead of the continuing two-object frame. The editor now applies the paired returned frame when supplementary observation ends. The regression then exercises the continuing selection target successfully, plus re-skip during another supplement. This remains handler simulation, not real browser replay.

## Unexecuted / limits

No real browser tools were exposed. No authenticated GUI replay, DOM/layout/focus verification, actual mouse or touch-device input, narrow/short/rotated viewport replay, native picker validation, GUI deployment or HMR verification was performed. Fake scroll/pointer handlers do not establish real layout, scroll clamping or touch behavior. No replacement server, installer or profile change was run. Browser replay remains an explicit release validation requirement; the reconnaissance and commands are recorded in `/private/tmp/math-board-tutorial-validation-notes.md` on the implementation host.

Extension contracts, stable ids and the minimal build registration path for parallel chapters are in [README: safe tutorial extension](<../README.md#安全教程扩展接口>). Shared lifecycle/navigation is [practice-progress.js](<../src/shell/practice-progress.js>); future pages must retain independent practice ownership and apply restored frames without feeding those programmatic changes to operation goals.
