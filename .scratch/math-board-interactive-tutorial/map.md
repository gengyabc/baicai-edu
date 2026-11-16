# Math board interactive tutorial implementation

## Notes

- Spec: [spec](<spec.md>).
- Integration branch: `feat/math-board-interactive-tutorial`.
- User requested implementation on 2026-11-16; supersedes the spec's historical documentation-only scope for this implementation run. Teaching skills and submission protocols remain unchanged.
- Ticket graph: 01 → 02 → {03,04,06}; 04 → 05; 03 → {07,08,09,10,11}; {05,06,07,08,09,10,11} → 12.
- Each implementation uses a fresh agent, dedicated branch/worktree, TDD, then a separate merger agent. Local tickets close with `Status: resolved` plus an Answer and pointer here.
- Validation must distinguish automated tests from actual browser/mouse/touch playback; unexecuted scenarios are not passes.

## Decisions-so-far

- Initial working tree clean, base commit `9219009`.
- Baseline shared checks: `node scripts/check-skills.mjs` passed (43 skills); `node --test scripts/skill-contracts.test.mjs` passed (135/135); `git diff --check` passed.
- Read-only validation reconnaissance: [notes](</private/tmp/math-board-tutorial-validation-notes.md>).
- Ticket 01 claimed; worktree `.scratch/worktrees/tutorial-01`, branch `feat/tutorial-01`.
- Ticket 01 resolved: explicit quantity safe-basics practice uses a separate state owner; committed add/move/selection goals and simulated insertion never write practice into real drafts. Implementation `95b0559`, integration merge `9fbacd70fb3292f320c1684bcd091921e9013437`. Focused tests 119/119; rebuild, generated syntax, deterministic client diff and whitespace checks passed; full math-board suite 303/304 with the unchanged known JSON-recipe baseline failure. Mouse/touch × en/zh handler replay is automated evidence only, not real-browser acceptance; all issue acceptance checkboxes remain unchecked. Details and outstanding limits: [ticket 01 Answer](<issues/01-quantity-safe-basics.md#answer>). Worktree retained for coordinator cleanup.

- Ticket 02 resolved: chapter navigation persists paired operation goals and complete isolated frames, with step reset, skip/supplement and chapter-only retry. Merger caught and implementer fixed supplement erasing later completion; successful/re-skipped supplement now returns to saved continuation goal/frame across refresh without resetting later checkpoints. Implementation `03fa991` + correction `d8975589aa873234fb3ae7c3f97832eddded6dcd`, merge `f0c504d72621d517276f5a442f5569f34f4a6a8c`. Integration focused 128/128; rebuild/syntax/generated determinism/whitespace passed; full 326/327 with only the unchanged host recipe baseline failure. Shared lifecycle/navigation and independent chapter factory/build registration are ready for 03/04/06; actual browser acceptance and first-run migration remain outstanding. Details: [ticket 02 Answer](<issues/02-chapters-resume-retry.md#answer>), [extension API](<../../math-board/README.md#安全教程扩展接口>). Worktrees retained.

## Fog

- Browser replay capabilities: dependency-free fake hook/browser harness is available; no browser tool, installed automation module, or open CDP endpoint found. Existing GUI requires authentication (unauthenticated request returns 401). No replacement server authorized or started. Real mouse/touch browser replay remains unexecuted.
- Baseline `npm --prefix math-board test`: 290/291 pass. Pre-existing failure at `math-board/src/host/tool-schema.test.js:214` expects fenced JSON recipes absent from the current prose-only shared contract. Align the stale test in release validation without changing teaching rules.
