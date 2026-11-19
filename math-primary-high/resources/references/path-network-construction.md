# Path Counting and Network Construction

Read for routes or traversals constrained by connections, direction, obstacles or repetition, not for a diagram alone. `math-high-session` retains the current act. Reuse ordered enumeration/monitoring in `references/mathematical-strategies.md`, recurrence in `references/early-algebra.md`, and justification in `references/proof-teaching.md` with `references/derivation-teaching.md`.

## Define the task

Check vertices, allowed edges/direction, endpoints, obstacles, required edges/vertices, repetitions and route identity (e.g. ordered edges). Distinguish finding one route, uniqueness and counting all; clarify only a missing decisive rule. A crossing need not be a junction. Words, tables and paper suffice. Task coordinates are not board layout; attached boards follow `references/structured-drawing.md`, not extra board permissions here.

Use `operation-meaning`, `data-graphs`, `patterns-generalize` from `references/topic-map.md` as needed; notation and graph theorems are optional.

| Student evidence | Next move |
|---|---|
| No route | Shrink a right/up lattice to 1×1 or inspect one arrival point; leave classification/count open |
| Lists legal routes | Keep them; check an uncovered first/last branch or where one route belongs. An exhaustive list can replace recurrence |
| Count without reason | Ask why any route belongs to exactly one class |
| One construction offered as complete | Preserve the witness; ask which other claim remains |
| Local degrees checked | Check global connectivity or one entry/exit pairing |

Probe unknown tools only when it changes the next move. For a confirmed gap, follow `references/prerequisite-learning.md`; keep route rules, student work, pending question and support. Returning from a child is not evidence of route selection; use a valid alternative if it avoids the gap.

## Last-step counting

On a finite right/up unit lattice, start with 1 empty route at an allowed start (not a predecessor sum), 0 at blocked or unreachable vertices; a blocked start gives no routes. A boundary vertex has just one possible predecessor: its count is 1 only along an unobstructed boundary segment from the start. Respect blocked transitions; subtracting a count of obstacles does not count excluded routes.

Each arrival has exactly one last edge, from the left or below. Removing/appending it pairs arrivals with predecessor routes; classes are disjoint and exhaustive. Each move increases x+y, so process predecessors first. A filled table alone does not justify the recurrence.

If directions or repetition change, check the region, stopping/length rule and cycles. A cycle reachable from the start that can be repeated arbitrarily before continuing to the destination gives infinitely many finite walks. Extra directions alone do not imply infinity. With a fixed length or other finite bound, redefine the state and justify the new organization.

## Network witnesses and necessity

For finite undirected edge-once traversal (vertices may repeat, free endpoints), required edges must lie in one connected component of traversable edges; if only required edges may be used, check their subgraph. Isolated vertices matter if a visit is required. When exactly the required edges are traversed, pair entry/exit at internal visits: there are zero or two odd-degree vertices, zero for a closed route. Neither test alone proves sufficiency. Recheck directed or prescribed-endpoint cases; a sufficiency theorem needs applicable conditions and justification.

Check a witness edge by edge for multiplicity, required coverage, direction and endpoints. It proves feasibility, not uniqueness or all routes. For counting, also justify correspondence, coverage and initial/boundary values. Verify privately; complete routes follow `learn-core`'s informed full-solution choice. A supplied route is help; unverified generalization or transfer stays unknown.

Recording: `references/math-segment-fields.md` — at most one merged performance segment; teacher-only explanation, a choice or a plan: `session_segment: null`. This supplement adds no method scores, obstacle labels or plan fields.
