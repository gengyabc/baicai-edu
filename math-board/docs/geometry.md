# Geometry mode and the teacher demo

[English](geometry.md) | [中文](geometry.zh.md)

## The three tabs

The top of the board has three tabs: Arithmetic, Geometry and Teacher demo. Arithmetic and Geometry each have their own canvas, toolbar, draft storage key, undo history, selection and viewport, independent of each other; switching tabs converts nothing and passes no data, and both drafts are kept. The Teacher demo tab shows only the given conditions the teacher placed with geometry elements, and the student cannot change the figure on this page; this page scrolls vertically as a whole, and after zooming the figure's frame also scrolls horizontally and vertically, so a long title or description does not squeeze the figure out of view. Only clicking "Put into my geometry board"（放到我的几何画板） appends the current figure to the geometry draft and records it as one undo step on the Geometry tab. Text elements in the teacher's figure are copied as they are into text elements in the student's draft; a short label beside a shape (the shape `note`) is copied together with the shape and can likewise be clicked open and edited after copying; both are the student's own text once copied and can be selected, dragged, rewritten or deleted; the same figure can be put down several times in a row, and the later copy gets a fresh set of ids and neither overwrites nor damages the earlier one. They share the problem reference. Arithmetic and Geometry also share "I want to say"（我想说） and "Put into answer"（放入回答）; the Teacher demo tab has neither. All three pages have "Return to conversation"（返回对话） at the bottom; the demo tab carries no tutorial or guide of its own. While the teacher has not yet placed a figure, the demo tab shows only the problem reference and "Return to conversation", with no title and no placeholder saying that the teacher has not put a figure here. Like the two student pages, it receives its close callback from the outer layer in one place, so clicking it on any tab closes the board.

## Tools

Select, point, segment, triangle, polygon, circle, parallelogram, rectangle, text, take midpoint, auxiliary line. Place points first, then connect them; the line and surface tools drop a point automatically when you click blank space. Clicking three points with the triangle tool closes it, and it is stored as a three-vertex polygon. Take midpoint is not a drawing tool: the button becomes clickable only after you select a segment whose two ends are both free points and which has no midpoint yet, and one click marks the midpoint on that segment. Auxiliary line is a switch, and once it is on, newly drawn shapes use dashed lines. Points show A/B/C labels and can be renamed, and renaming breaks no reference. Derived points are visible, selectable and can carry a note, but cannot serve as a drag handle or as an endpoint of a new shape.

## Text

Clicking blank space on the canvas with the text tool opens a writing card; write the content and click "Save" (Esc or "Cancel" discards, and empty content is not written). Written text is one element on the board: the select tool can select it, drag it (it stops against the board edge), delete it with Delete or "Delete selected", and also marquee-select it (enclosing it or touching it counts as selecting it); once selected, "Edit text" in the floating bar rewrites it in place and adds no second text. Text keeps the student's own line breaks, at most 200 characters, is stored as `type: "text"` with its own anchor `x`/`y` (left baseline), references no point, and takes no part in endpoint snapping, taking midpoints or shape selection. It is the student's own written content, not the kind of `note` that is a short description beside a shape.

## A short label beside a shape is editable text too

A shape `note` of at most 20 characters is drawn beside the shape. This line of text is now clickable itself: clicking it under the select tool opens the card that writes this description directly, and once you edit and save, the text on the canvas changes at once; it turns blue on hover. When a shape with a short label is selected, "I want to say" also points at this label, so that looking at the text on the canvas cannot end up editing the whole-board note instead.

## Dragging

Free points are dragged directly; one undo step is recorded only on release, and during the drag only a preview is shown. Derived points are computed from their construction and cannot be dragged. Dragging a circle's centre translates the whole circle with the radius unchanged; dragging the point on the circle changes the radius, which is no smaller than a threshold. A rectangle's third point decides only which side and how tall: the point lands on the one perpendicular to `P1P2`, and a click that is not at a right-angle position does not stay on the board as a superfluous corner. Parallelograms and rectangles are both constructed from three points (`P4 = P1 + P3 − P2`), and the two diagonal pairs are `P1P3` and `P2P4`: drag any free corner and that corner follows the pointer, its opposite corner stays put, and the other two corners are recomputed about the midpoint of this diagonal. A rectangle is recomputed with equal and perpendicular diagonals, so however it is dragged it still has four right angles. The drag follows the pointer, and an illegal position is absorbed at the degenerate threshold (sliding along the allowed direction to the last legal position): polygons and quadrilaterals do not cross themselves, a drag position may not make shapes that were originally separate newly overlap, and sharing only a single vertex or a circle's external contact does not count as overlap. The circle check covers the interior region and containment, and checks the final shape after the centre carries the radius point; an existing combined figure whose circles already overlap is still editable, but once they are separated they can no longer be dragged into overlap. The creation and import rules are unchanged; dragging checks the candidate landing position and does no continuous-path collision detection.

## View

The grid and snapping are local UI state and do not enter the snapshot. "Fit to width"（适应宽度） considers both width and height of the currently visible area, and fits the whole board together with point labels, short descriptions beside shapes and the student's text into the frame, so a short window does not cut off the lower half of the board. Zooming genuinely enlarges the figure (line width, labels and points grow together): the canvas grows with the zoom, scrollbars appear in the frame so that all content can be seen, and the view is no longer cropped to a patch in the middle; clicking + or − leaves the fitted view, and clicking "Fit to width" returns to the whole figure.

## Notes

There is one note for the whole board, and one note each for every point and every shape. After an object is selected, what "I want to say" writes is that object's note; when one or more sides of the same shape are selected, it writes the note of the shape they belong to. With nothing selected or with a mixed selection of several objects, it writes the whole-board note. Arithmetic and Geometry each have their own whole-board note, and neither overwrites the other. A short description on the teacher demo figure is drawn beside the shape.

## Notes and short labels

The whole-board note and a point's note may be written long; a short label drawn beside a shape is at most 20 characters, and a longer shape note stays only in the note card, the canvas no longer marks "has a note", and no invisible text appears. Clicking this line of short label rewrites this note directly, and the clickable area is exactly the line of text as drawn.

## Clearing this mode

After confirmation it clears the geometry canvas and this mode's undo history, deletes no attachment already put in or already sent, and does not affect the arithmetic board.

## Put into answer

Only `我的几何画板.json` and the whole-board note are attached; there is no geometry edit-history attachment. The attachment is a read-only snapshot, and the student sends it themselves after checking.

## The scope of the clear tool

`math_board_clear` acts only on the arithmetic mode; the Geometry tab shows no entry point or hint for it. The tool's own task boundary is in [task-switch clearing](clearing.md).

## Snapshot format

`kind: "geometry-board", schemaVersion: 1`:

```
points:   [{ id, label, kind: "free"|"derived", x, y, construction?, note }]
elements: [{ id, type: "segment"|"polygon"|"circle"|"parallelogram"|"rectangle", points|centerPointId+radiusPointId, role, note }]
          text: { id, type: "text", role, note, x, y, text }
note:     whole-board note
canvas?:  { width, height } // optional sheet extent; 800×600 when omitted
```

The Geometry tab extends the sheet, the grid and the drawable coordinates with the visible area, always uses one and the same scale factor horizontally and vertically, does not centre a fixed board with blank margins, and does not stretch shapes. A change of window size does not move points that already exist; re-fitting keeps all existing content, and spare sheet does not accumulate without limit through repeated switching between horizontal and vertical. The extended sheet is saved with the snapshot through the optional `canvas`, with a width that is an integer from 800 to 10000 and a height that is an integer from 600 to 10000; older v1 files that carry no size still open as 800×600. Clearing this mode keeps the sheet size, and a teacher demo copy uses the target sheet extent.

A derived point stores only its construction (`midpoint`, or three points fixing a fourth, `P4 = P1 + P3 - P2`), and its position is recomputed from the construction and is not used as authoritative coordinates; snapshot validation ignores forged derived coordinates and rejects dangling references, degenerate shapes, duplicate labels and cross-mode files. A text element stores in the snapshot the original text the student wrote and its anchor; files with empty text, control characters, more than 200 characters, text written outside the board, a point reference hung on text, or a text field hung on a shape are all rejected, with no guessed repair. The teacher demo figure also supports text elements, which the student can rewrite after copying. The plugin system prompt declares the read-only submission boundary; the reading and trust rules shared by the two math bands are maintained in one place by the [shared board contract](<../../math-common/skills/math-common/references/board-contract.md>).

## Teacher diagrams and student drawing

Geometry given conditions are drawn on the "Teacher demo" tab. Neither the Arithmetic tab nor the Geometry tab shows a separate "teacher diagram". Only after the student clicks "Put into my geometry board" is the current figure copied into their own geometry draft. The teacher manages the geometry demo through `geometry_board_draw`: first `get`, then call `show` or `hide` with `expectedRevision`. A returned `recorded` means the request was recorded; it is not a visual execution receipt, and it does not mean the student has copied anything.

- **Choose by goal**: when the given conditions need to be understood and the act of drawing would divide attention, a concise annotated figure may be provided; when choosing a representation, constructing, or organising the quantities is itself the learning goal, leave the drawing or the describing to the student. Partial starting points and gradual withdrawal of support adjust to actual performance, and do not fixedly adopt "the teacher draws first" or "the student draws first". A figure also carries reading and manipulation load, and does not guarantee a lower cognitive load.
- **Do not reason for the student**: for the comparison of length 9 and width 1 with length 6 and width 4, for example, only the outline, the names and the known side lengths may be given; the area, the comparison conclusion and the key auxiliary line still stay with the student. The student may also go straight to an expression, to speech or to paper, and need not copy the teacher's figure.
- **Isolated**: the demo reads and changes no student draft, does not enter undo/redo, the edit history, exported files, the input box or the answer attachment, and does not open the board automatically; a teacher demonstration does not count as student performance. Only the copy the student puts down becomes their work. The two existing snapshot formats and the geometry read-only judgement boundary are unchanged.
- **Independent lifetime**: each DSH session keeps only the latest demo figure, and switching the problem-text dropdown does not switch the diagram; the title should clearly correspond to the task. When the problem changes, when the session ends, or when an old figure would leak a method for an independent check, the teaching side hides or replaces it and does not clear the student's canvas. When the tool is unavailable, continue with text or optional paper. Non-geometric conditions stay in conversation text; there is no separate teacher-figure surface for them.

The teaching basis, the scope of application and the product implications are in the [research note](<../../docs/research/math-representation-scaffolding-research.md>); the shared decision rules are in the [representation contract](<../../math-common/skills/math-common/references/representation-contract.md>). The read-only demo isolation is an evidence and privacy boundary design, and its learning effect has not yet been verified by a student experiment.
