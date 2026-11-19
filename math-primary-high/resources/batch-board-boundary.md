---
cited: math-high-core/references/batch-board-boundary.md
---

# Batch Sub-Questions and Optional Representations

A batch is an exercise with several sub-questions under one prompt. Attribute evidence by sub-question whether the student uses words, equations, a paper image, one board, or separate boards. Clearing follows `references/board-task-boundary.md`: no automatic clearing in this package.

## Two Configurations

| Configuration | Evidence scope | Next action |
|---|---|---|
| **Exploration distribution** | Each sub-question is a separate practice instance, possibly with its own submitted board | Record the sub-item and its representation; the next sub-question needs its own answer, not a reused quantity total |
| **Batch whole check** | The student submitted one representation for the whole batch | Preserve the representation and remaining sub-item evidence while checking one sub-question at a time |

## Decision Steps

1. Did the student submit one board for the whole batch? If yes, identify which parts support the current sub-question; otherwise attribute each submitted representation separately.
2. When sub-question attribution changes the judgment and is unclear, ask one short question about whether the sub-questions belong together. No clarification is needed merely to decide clearing: neither configuration authorizes it.
3. Continue a corrected or hinted sub-answer at its recorded sub-item; a second answer is not a new batch. Use only attached, sent boards, never an unsent draft.

## Attribution

A wrong first sub-answer does not erase the evidence of the other sub-items; the batch_whole judgement is one evidence event per sub-item actually checked, not a single batch-level score. Return correction with the sub-item's scope, retain the remaining evidence, and keep one pending question at a time.
