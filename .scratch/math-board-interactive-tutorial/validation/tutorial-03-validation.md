# Ticket03: geometry safe basics validation

Validated 2026-11-16 on branch `feat/tutorial-03`, based on integration `f0c504d` (ticket02) merged with the integration tip. Only the geometry tutorial path changed. Teaching skills/protocols, first-run routing/legacy migration, geometry chapters G06–G21 beyond basics, optional file chapters and the teacher-demo chapter are not delivered here.

## Delivered

- [geometry-basics.js](<../../../math-board/src/geometry/geometry-basics.js>): `createGeometryPractice` (goals for G01–G05, G10, G21 plus selection clearing), `createGeometryPracticeFrames(G)` (frame factory and all-or-nothing validator) and `createGeometryBasicsChapter` (basics chapter with dependency-only `skip`). Independent module; the shared lifecycle is unchanged.
- [geometry-view.js](<../../../math-board/src/geometry/geometry-view.js>): the geometry page keeps its real draft mounted and renders a separate `PracticeBoard` owner with the shared coach, catalogue, reset, skip, supplementary retry and chapter retry. All editing entry points are gated while practice is open, and the practice session has no file, host-projection or composer access.
- Bilingual goal copy, README tutorial section and extension contract, and the `.eb-geometry-owner` coach layout.

## Executed

- Test-first slices at two seams: the goal/chapter model and the mounted geometry editor through the shared React/browser stand-ins.
- `node math-board/build.mjs`: generated client rebuilt; `node --check math-board/client.js`: passed.
- Focused command: **50/50 passed**:

  ```sh
  node --test math-board/src/geometry/geometry-basics.test.js math-board/src/geometry/geometry-view.test.js
  ```

- `npm --prefix math-board test`: **343 tests, 342 passed, 1 pre-existing failure**. The sole failure is [tool-schema.test.js:214](<../../../math-board/src/host/tool-schema.test.js#L214-L220>), stale shared-skill fenced-JSON recipe extraction (`assert.ok(get)`). Left unchanged for ticket12, as agreed. The package extraction/build/reproducibility test passes after the rebuild.

## Operation-goal replay (not browser E2E)

[geometry-basics.test.js](<../../../math-board/src/geometry/geometry-basics.test.js>) drives the goal model with realistic committed deltas:

- G01: every tool selection, whatever its name, is not a placed point; a later step's operation does not advance the current one.
- G02: a first endpoint alone neither advances nor rewrites the referenced target; a line that does not reach the student's own first point is refused.
- G03/G04: a triangle must be a three-point polygon; an open run of clicks is not a closed outline, and a polygon delivered without the closure signal does not pass.
- G05: half a circle is a free point; a circle needs both its centre and its rim point.
- Earlier targets stay named through the run; deleting one blocks the next step instead of silently repairing the run.
- A skip-all run supplies one dependency per step, never duplicates a target, and the saved goal reloads through the same validator the resume path uses.

[geometry-view.test.js](<../../../math-board/src/geometry/geometry-view.test.js>) exercises the mounted editor and the independent practice owner:

- No premature pass: choosing a tool, the first segment click, an unclosed polygon preview and a single circle centre all leave the step unchanged.
- Continuous reuse: the segment, triangle and polygon steps reuse the earlier points; the run keeps its own undo history.
- Resume: after a page remount the unfinished step, practice picture, chosen tool and grid setting all return, and practice does not reopen by itself; the real draft is unchanged.
- Navigation: skip records `skipped` (never `completed`) and supplies whatever the next step needs; supplementary retry starts the skipped operation from its own picture and returns to the pending step; reset restores the step start; chapter retry and catalogue entry work; the always-available exit works.
- Honest feedback: the coach names the action for the current step in the active language, and a run finished by skipping reports skipped steps instead of claiming completion; only the operation actually performed is `completed`.
- Simulated insert: the insert control is live at every step and never creates a draft, attachment, text insertion or send; a tripwire records any host projection, file service or composer access. The run reaches `complete` with zero composer/host/file/send access.
- Isolation: a legal host draft change during practice is not reverted, exit restores no pre-practice backup, a remount reads the host draft, and closing the board mid-practice destroys only the practice while its progress record survives for later resume.
- Input: Chinese and English both complete the whole run with each language's own goal copy (no raw keys on screen); a touch-only run closes a polygon by tapping the start vertex and clears a selection on release, with no keyboard shortcut or hover.

## Unexecuted / limits

No real browser tools were exposed. No authenticated GUI replay, DOM/layout/focus verification, actual mouse or touch-device input, narrow/short/rotated viewport replay, native picker validation, GUI deployment or HMR verification was performed. Fake pointer and scroll handlers do not establish real layout, scroll clamping, touch behaviour or overlay/highlight geometry. The coach occupies a normal flex row above the workspace rather than an absolutely positioned highlight mask, so "the highlight never covers the canvas" is asserted by layout structure, not by measured pixels. Browser replay remains an explicit release validation requirement.

## Extension note

G06–G21, the optional file chapter and the teacher-demo chapter follow the same seam: a factory `({G, emptyFrame}) => chapter` in an independent module, inlined by [build.mjs](<../../../math-board/build.mjs>) and appended to `Browser.geometryPracticeChapters` (default empty), with `geometry-*` ids and bilingual goal keys. Do not change the basics step sequence, the shared lifecycle or the real-draft owner. A new chapter must supply sufficient independent practice starts and must route any destructive or file operation through the practice owner so it can never reach the real draft, the composer or a real file handle.
