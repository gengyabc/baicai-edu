# Path Counting and Network Construction

Read when routes, connections or traversals must meet local connections and global restrictions. Use the current act and the student's verified route; ordinary arithmetic or a diagram alone does not call for graph theory. `math-high-session` remains the teaching owner. `references/mathematical-strategies.md` owns ordered enumeration and strategy monitoring; `references/early-algebra.md` owns general structural recurrence. For justification use `references/proof-teaching.md` with `references/derivation-teaching.md`, not a parallel lesson loop.

## Define the object and goal

Privately check what the task already specifies: vertices (places), edges (allowed connections), direction, start/end, obstacles, required edges/vertices, whether edges or vertices may repeat, and what makes two routes different (for example their ordered edge sequence). Distinguish finding one valid route, counting all routes, and proving uniqueness. If a missing condition changes the answer, ask about that one condition and wait; do not turn a complete statement into a questionnaire.

Words, lists, tables and paper diagrams are sufficient. A crossing is not automatically a connected vertex; use the stated connections. Problem-given lattice coordinates describe the mathematical task, never the board's layout positions. A submitted board follows `references/structured-drawing.md`; this topic supplies no board reading, clearing or settings authorization.

Link to `operation-meaning` for adding disjoint counts, `data-graphs` for recording cases, and `patterns-generalize` for a justified recurrence in `references/topic-map.md` only as needed. Coordinate notation, formula names and general graph theorems are not entry requirements.

## Choose one bridge from actual work

| Evidence | Smallest useful action |
|---|---|
| No starting idea | Make one small route observable: on the right/up lattice shrink to 1×1, or inspect where one intersection can be reached from. Leave its route count or classification to the student; no ideas alone is not a missing-addition diagnosis. |
| Some legal routes listed | Keep them. Locate an uncovered first/last-choice branch, or ask which class contains a proposed route; an exhaustive list is a valid alternative to recurrence. |
| Correct count but unclear reason | Examine why an arbitrary route belongs to exactly one class, not more addition practice. |
| One legal construction called the whole answer | Check whether the goal was existence, uniqueness or complete counting; preserve the valid witness and isolate what is still unproved. |
| Local degrees checked but a traversal is uncertain | Inspect the required edges as a whole and one entry/exit pairing, rather than supply a general criterion. |

Unknown classification or recurrence tools need only a discriminating probe that changes the next teaching action. A confirmed route-critical gap follows `references/prerequisite-learning.md`: preserve the parent task's route rules, original student answer, pending question and supplied support in the existing task snapshot, and enter the nearest tool-learning child through the session. Restore one layer after independent tool use; a child success does not prove parent strategy selection. A verified alternative can remove an unnecessary dependency.

## Last-step counting: scope and completeness

For a finite right/up unit lattice, count routes reaching each allowed vertex from the given start. Use 1 for the empty route at the allowed start, 0 for blocked or unreachable vertices; a forbidden start admits no routes. A permitted boundary vertex has only its permitted predecessor, so it is 1 only when that entire boundary segment is unobstructed. The start value is an initial condition, not a sum of nonexistent predecessors.

At an interior vertex every arriving route has exactly one last edge: from the left or from below. Removing that last edge gives a route to its predecessor; appending the edge gives exactly one arriving route back. These two classes are mutually exclusive and exhaustive, so their counts add. The right/up direction lets predecessors be settled first (each step increases x+y); a filled table alone is not this reason.

When direction or repetition rules change, first check the allowed region, length/stopping restriction, and whether cycles can be inserted. Allowing left steps and repeated vertices can destroy that acyclic order and allow infinitely many finite walks to the destination. It does not always force infinity: check that a reachable cycle can still lead to the destination. With a fixed length or other finite bound, redefine the counted object/state and justify a new finite organization; do not reuse the old table as-is or call the new problem unsolvable.

## Network witnesses and necessary conditions

For the examples below the graph is finite and undirected, every required edge must be traversed exactly once, vertices may be revisited, and start/end are free. Check a proposed ordered route against the actual edges, edge multiplicities, required coverage and any specified endpoints/directions. A legal witness proves feasibility, not uniqueness or a count of all witnesses.

All vertices incident to required edges must be in one connected component: a continuous route cannot jump between components. Isolated vertices matter only if the task also requires visiting them. At an internal visit, arrival and departure use a pair of edges; only the two endpoints of an open route may have an unpaired edge. Thus a route has zero or two odd-degree vertices; a closed one has zero. These are necessary conditions, not individually sufficient tests. Recheck conditions for directed graphs or prescribed endpoints. A general joint sufficiency theorem requires its own applicable conditions and usable justification; concrete construction is enough for an existence task.

## Private verification

Keep answers/routes private in independent work. Explicit full-solution requests use `learn-core`'s informed full-solution choice (`references/informed-full-solution-choice.md`), with its warning, wait and same-task confirmation; add no prerequisite study or compulsory exercise.

| Route condition | Check |
|---|---|
| Acyclic last-step count | Correct start/boundary values and a unique-last-edge correspondence covering all routes |
| Blocked vertex | Count routes avoiding it through the allowed transitions; subtracting a count of forbidden points is not counting forbidden routes |
| Added directions/repetition | Check a finite stopping bound or a reachable repeatable cycle that can still lead to the destination; only the latter establishes infinitely many walks |
| Edge-once network traversal | Check connectivity of required edges and entry/exit parity separately; either condition alone may be insufficient |
| Concrete route offered | Verify every edge, multiplicity, endpoint and coverage requirement; a valid witness establishes feasibility, not uniqueness or complete counting |

## Completion and evidence

For construction, check every requirement of the witness. For counting, also check the object correspondence, disjointness, coverage and initial/boundary conditions; retain any unverified generalization as unknown. Teacher-supplied routes remain help; repeating them is supported work.

Recording: `references/math-segment-fields.md` — at most one merged performance segment per turn for actual student work; teacher-only explanation, a choice or a plan uses `session_segment: null`. Tool children and recovery: `references/prerequisite-learning.md`. This supplement adds no method scores, obstacle labels or plan fields. Optional near transfer and changed-condition checks give different evidence; respect refusal, pause and end.
