# Changelog

All notable changes to `baicai-edu-math-board` are recorded here. This package has
not been published to a registry yet; everything below landed before the first
release, so 0.6.0 is the current state rather than an upgrade path.

## [Unreleased]

### Tutorial UI

- Every one of the 88 practice-step goals now reads as two short lines instead of one
  long paragraph: 操作 says what to do now, 验收 says what makes the step pass, with one
  most-likely misreading named. English carries the same shape as Do / Check. The
  repeated boilerplate — that practice is separate from the real answer, that you can
  exit, that storage may not persist — is gone from the goals because the rail already
  states it once above them. Closing lines for a finished chapter stay one unlabeled
  line. The rail keeps one translated string per step and preserves its line break
  (`white-space: pre-line`); a contract test in `src/shell/practice-progress.test.js`
  holds every goal to at most two lines, the label on each, and a length ceiling.
- Every goal and quick-tour line that names a control now says where that control is,
  in the same words the page uses: the pattern rail and tool rail on the left, the
  creation colours and grid/snap on the left of the bottom bar, the zoom pair in the
  middle, 我想说/清空/更多操作 on its right, 放入回答 at the far right, undo/redo at its
  left end, the selection actions (名字、圈为一组、合并、复制、划去、追加选择、删除所选)
  on the action bar at the bottom of the canvas, card actions at the bottom of the
  window, and the practice controls in the step rail on the right.
- The copy follows spoken Chinese instead of translated English: a mouse action is
  点击, never a bare 点 (点 survives only as the 点 tool's own label or as a noun such as
  中点/自由点), and every step that acts on a selection opens with 先选中<what>, then the
  button. 图案轨 became 图案栏, 选「点」 became 点击左侧工具栏的「点」工具, and buttons in
  the left rail are named as 工具 or 开关. Two contract checks in
  `src/shell/practice-progress.test.js` hold this: a selection-dependent goal must say
  先选中 first, and no goal may write 点 where it means 点击.
- The note chapters (quantity 写下说明, geometry 编辑与说明) carry one standing reminder
  in the rail head — a note is your own words, not a checked conclusion, and where it
  lands follows the current selection — so the nine steps below it no longer repeat
  that sentence. A chapter now declares it with an optional `noteKey`.
- First contact with a board is the lightweight spotlight tour again: it
  autoplays once per board, advances only on a real operation, and its last step
  points at 更多操作 → 查看教程. The chaptered tutorial is opt-in and resumes saved
  progress; a board that already has a `practice:v2` record no longer autoplays the
  tour, and opening the chaptered tutorial ends a running tour. 更多操作 now carries
  two separate doors: 查看操作导览 replays the quick tour (no practice writes, chapter
  progress untouched) and 查看教程 opens the chaptered practice.
- Every quick-tour step is reachable: saving the note on the quantity board's 5/6 now
  advances the tour (the save signal was never wired), and the spotlighted note card
  cannot be cancelled out from under that step. When the tour ends — finished or
  skipped — one dismissible line above the dock offers 查看教程.
- The chaptered tutorial moves from a bar above the canvas to a narrow step rail
  beside it: chapter title and position, the current chapter's steps, this step's
  goal, and bordered buttons for reset, skip, skipped-step practice, chapter
  retry, 全部章节… and exit. The always-visible chapter catalogue is gone from the
  canvas; every other chapter lives one level down in the 全部章节… dialog.
- Every tutorial control is a real bordered button at 32px instead of an
  unbordered 44px text row, and the rail states that practice is separate from the
  real answer.
- A practice run or teacher-demo guide hides the teacher-message strip; the strip
  returns unchanged with real work.
- The teacher demo page carries its own tutorial door at the bottom right: 查看教程
  sits at the other end of the bottom edge from 返回对话. It reopens the short guide
  after the rail is dismissed, replays a finished guide from step 1, resumes a skipped
  one where it stopped, and with no figure only says there is nothing to practise yet
  (no guide starts, no progress is written). The door hides while the rail is up.

### Quantity canvas

- The paper keeps a 24-unit label gutter above the first row, so the labels drawn above
  a shape are no longer cut by the canvas top edge: the tutorial's step number over
  shape 1 (and 2) used to lose its top half against `viewBox 0 0 800 …`. Only the viewBox
  origin moves — every figure keeps its own coordinates, saved boards included, and
  tapping and dragging still resolve through the same screen transform.
- A new shape is brought into view with the labels above and below it, in both
  directions: the canvas used to scroll down for a row that started below the visible
  part, but a shape that landed above the current scroll stayed off-screen. The old
  effect also scaled `y` from the viewBox's top edge, which the gutter origin would have
  put 24 units out.

## [0.6.0]

Initial state of the board as a DSH bundle.

### Quantity board

- Canvas-first layout with a left pattern rail; square, triangle, circle, cat
  and dog are shown by default and the palette still holds twenty patterns.
- Preset colour levels (1, 10, 100, 1000, 10000) set what a new shape
  represents without changing shapes already on the canvas.
- Named groups, same-shape merging with recorded merge sources, splitting,
  duplication, striking through, and whole-group selection.
- Undo and redo, zoom and fit-to-width, a scrollable canvas that grows with its
  contents, and draft saves that survive cancelled file pickers.
- A read-only teacher-message reference strip above the canvas.

### Geometry board

- Points, segments, polygons, circles, parallelograms and rectangles drawn on a
  paper that grows into the viewport at one scale.
- Free points, derived points and exact constructions; the model keeps dragged
  figures valid and stops circle drags at a filled overlap.
- Drag a whole figure or a single side, delete only the current selection, and
  cancel the current gesture with Escape instead of closing the tab.
- Geometry import and export through the shared file picker.

### Submission and host integration

- Submitting puts a read-only snapshot in the reply instead of generating prose;
  the student's own notes stay authored by the student.
- Snapshots round-trip v4 JSON only; the optional trace attachment is separate
  and never restored from an imported file.
- `math_board_settings`, `math_board_reference`, `math_board_clear` and
  `geometry_board_draw` are registered against whichever host services arrive,
  so a missing registry never blocks the canvas.

### Client

- First-run spotlight tutorials for both tabs, stored in `localStorage` and
  replayable from the more-actions menu.
- `client.js` is generated by `node build.mjs` and committed; the build has no
  external dependencies.
