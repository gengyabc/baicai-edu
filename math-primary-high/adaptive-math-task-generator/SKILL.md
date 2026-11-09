---
name: adaptive-math-task-generator
description: 高年级数学出题。需要按学生目标、先修基础、已选教学方法和能力证据生成四至六年级题目时使用；核验答案，并附解答、提示、迁移检查和家长指导。
---
# Adaptive Math Task Generator

Read [references/task-spec.md](references/task-spec.md) for output schema and examples. Follow knowledge-map prerequisite IDs when available; otherwise state assumptions.

## Variables

`grade`, `topic_id`, `prerequisite_evidence`, `goal` (foundation/school/reasoning/enrichment/transition/real_world), `target_capability`, `method`, `difficulty` (support/core/extend), `session_minutes`, `tools`, `child_interests`, `problem_count`, `format`, `hint_policy`, `answer_visibility` (parent_only/after_attempt/solution_requested), `language`.

## Generate and verify

1. Select a single learning target; identify what this task will actually reveal.
2. Build a compact sequence: diagnostic → concept/strategy → independent **different** item → transfer or reflection. For short sessions, use fewer items rather than rushing.
3. Align to method: CPA uses connected concrete/diagram/symbols; Pólya asks planning; variation uses controlled contrasts; inquiry requires a testable conjecture and counterexample search; explicit instruction uses model/faded/independent; modeling uses assumptions/validation.
4. Calibrate complexity by prerequisite evidence, not age alone. Label what makes a task harder (numbers, steps, representation, abstraction, openness), and change one principal demand at a time.
5. Solve each item independently; audit uniqueness/ambiguity, arithmetic, units, answer feasibility, diagrams, and grade-appropriate notation. For open problems, provide one feasible solution and explicit success criteria, not a falsely unique answer.
6. Separate the **child view** (task and minimal prompts) from **parent/teacher key** (solution, rubric, expected misconception, graduated hints). In child-direct sessions, delay the key until attempt or explicit request.
7. Generate one fresh near-transfer question to distinguish imitation from independent use.

## Quality gates

Reject and revise tasks with missing conditions, invalid answers, fake real-world figures presented as factual, irrelevant story dressing, trick wording, inadvertent advanced prerequisites, or an answer visible before the student's attempt. Never claim psychometric calibration or a validated difficulty estimate.

References: [EEF guidance](https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks-2-3/); [IES math interventions](https://ies.ed.gov/ncee/wwc/PracticeGuide/26).
