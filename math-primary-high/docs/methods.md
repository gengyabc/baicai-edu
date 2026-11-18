# Grades 4–6 methods, derivation and proof

[English](methods.md) | [中文](methods.zh.md)

Maintainer background only — **teaching material, not installed skills**. Runtime method choice and steps live in the installed package: [`math-teaching-core.md`](../skills/math-high-core/references/math-teaching-core.md), plus leaf skills and the other `math-high-core` references listed below. `math-primary-high/package.json` → `files` ships `cordis.patch.yml`, `build.json`, `resources`, `skills`, `README.md` and `LICENSE`; this `docs/` directory is repo-only.

Former module-style method skills were retired from the package tree so a single skill does not carry two conflicting control-flow rules for the same act. This page keeps the mapping from those method names to their installed homes.

## Method → installed home

| Former method name | Installed home | Grade 4–6 use |
|---|---|---|
| `concrete-pictorial-abstract` | `math-teaching-core.md` (CPA) | Object or imagined action → diagram → notation; fractions, decimals, ratio, geometry, early algebra |
| `polya-problem-solving` | `math-teaching-core.md` (Pólya) | Understand, plan, carry out, look back for multi-step and unfamiliar problems |
| `variation-theory-math` | `math-teaching-core.md` (variation); practice rules | Contrast examples that differ in one critical feature and expose invariants |
| `inquiry-and-proof` | `math-teaching-core.md` (inquiry) | Constrained pattern → conjecture → test and counterexample → reason |
| `cgi-algebraic-thinking` (proposed, not created as a skill) | `math-teaching-core.md` (relational thinking and generalization); `references/early-algebra.md` | Equality, relational strategies, generalized arithmetic, variables, functional thinking; sources in [`cgi-early-algebra.md`](../../docs/research/cgi-early-algebra.md) |
| `explicit-instruction-math` | `math-teaching-core.md` (explicit); `scaffold-calibration.md` | Worked example → faded step → independent check when the current task's tools are available; a confirmed missing tool first enters a recorded prerequisite child |
| `formative-metacognition-math` | `math-teaching-core.md` (formative); scaffold notes | Elicit thinking → one actionable feedback point → child self-assessment |
| `mathematical-modeling` | leaf `math-high-application-modeling` | Situation → assumptions → representation → solve → interpret and validate |
| `upper-primary-math-knowledge-map` | `references/topic-map.md` | Concept ids, prerequisite edges, misconception probes |
| `adaptive-math-task-generator` | `references/problem-design.md` | Verified task bundles with a child view and an adult key |
| `math-learning-progress-tracker` | `references/math-segment-fields.md` | Evidence per activity with independence and support; no aggregated score |
| `handwritten-math-reader` | shared entry `learn-errors` | Faithful reading of handwritten photos, scans, or ink |
| `upper-primary-math-coach` | `math-high-session` + `math-high-core` rules | Knowledge point, difficulty, hints, and method — one change at a time |

`references/learn-act-allocation.md` chooses the activity owner; `math-teaching-core.md` chooses the teaching method independently. This package registers unique `math-high-*` skill names; the lower-primary package uses `math-low-*`. The shared teaching resolver selects actual core/session names for a new task and preserves the resolved band for an unfinished task.

## Derivation and proof modules

[Teaching core](../skills/math-high-core/references/math-teaching-core.md) and [scaffold calibration](../skills/math-high-core/references/scaffold-calibration.md) are shared by all of these; each module is read by task:

- [Derivation teaching](../skills/math-high-core/references/derivation-teaching.md): observation and conjecture, finding a relation, deriving a formula; keeps the goal gate before a formula is revealed and the seven-step bridging cycle.
- [Relational derivation in complex word problems](../skills/math-high-core/references/word-problem-derivation.md): reuses the seven-step cycle for intermediate quantities, time origins, piecewise relations and checking against original conditions in travel, work and similar problems; keeps a valid arithmetic, algebraic or diagram route the student chose. An ordinary textbook problem does not become modeling because it has a situation or many steps, and it is not forced into formal proof or formula discovery.
- [Proof teaching](../skills/math-high-core/references/proof-teaching.md): proposition and quantifier analysis, strategy choice, logical validity, the student's own organization and checking. It separates building a proof independently, understanding a given one, repairing an argument and tidying expression; a valid student alternative route outranks the planned one.

Proof is a method inside the current act: it adds no skill, dispatch branch, long-term field or ability stage. In-conversation obstacles and support stay in the existing temporary state, and a learning record describes conjecture, supported work and independent proof separately. A finite list of examples cannot prove a general proposition; a valid witness can prove existence. Teaching entry follows the shared core's gate and informed full-solution choice: [teaching boundaries](teaching-boundaries.md).

## Strategy pilot and recursive prerequisites

Source rules now live in the [three-method index](../skills/math-high-core/references/mathematical-strategies.md) and [recursive prerequisite teaching](../skills/math-high-core/references/prerequisite-learning.md); the [shared plan protocol](../../learn/skills/learn-data/references/learning-plan.md) owns task snapshots and persistence. This changes confirmed missing-tool handling from an inline example to a recorded child task; normal instruction remains available inside the child. See the [design specification](../../.scratch/math-strategy-recursion/spec.md), [decision and trade-offs](../../docs/adr/0003-prerequisite-learning-plans.md) and [separate acceptance results](../../.scratch/math-strategy-recursion/acceptance.md). Source changes do not mean a running profile has been upgraded; installation and real-student effectiveness are separate from static or synthetic checks.

## Strategy extension methods (wired conditionally)

Geometry, structural recurrence, number theory, logical constraints, pigeonhole existence, extremal optimization, invariants/coloring, elementary games, path/network counting, boundary variation, counterexamples and student-authored problems are now wired in the package source as task-selected references behind the existing core condition table and method index. They reuse the current prerequisite-plan, proof, segment-evidence and informed-full-solution contracts. Source wiring, mathematics checks and static/contract regressions are not a running-profile upgrade or a model-behavior result; see the [integration acceptance record](../../.scratch/math-strategy-extension/integration-acceptance.md), where real model replays, installation and real-student effects stay separate and largely untested.

## Adaptive design constraints

Packaging-era notes (old name `upper-primary-math-coach` → today's `math-high-session` and `math-high-core`). Implementation follows [`adaptive-thresholds.md`](../skills/math-high-core/references/adaptive-thresholds.md) and [`learn-act-allocation.md`](../skills/math-high-core/references/learn-act-allocation.md). Thresholds are configurable defaults, not claims of empirical calibration.

| Mechanism | Rule |
|---|---|
| Knowledge-point adaptivity | Use the topic map for prerequisites; backtrack at most one node when needed |
| Difficulty adaptivity | L1–L3 from independent completion and explanation |
| Hint adaptivity | H0–H4, increase or fade help gradually |
| Method adaptivity | Pick CPA, Pólya, variation, etc. from the difficulty type |

Additional constraints still in force:

- All adaptive thresholds are configurable.
- A single error does not trigger knowledge-point backtrack.
- Correct without explanation does not automatically raise difficulty.
- Prefer adjusting hints and representation before changing teaching method.
- Interest, fatigue, and student choice can adjust the activity.
- After a session, record the evidence needed for the next activity.

```mermaid
flowchart TD
    A["math-high-session + math-high-core<br/>four lightweight adaptive rule groups"]
    A --> B["topic map"]
    A --> C["methods in math-teaching-core"]
    A --> D["problem design"]
    D --> E["student work and explanation"]
    E --> F["segment evidence"]
    F --> A
```

## Task bundle illustration

Operational multi-part and verification rules are in [`problem-design.md`](../skills/math-high-core/references/problem-design.md). Example shape for maintainers:

```yaml
task_bundle:
  topic_id: equivalent-fractions
  learning_target: explain why scaling numerator and denominator preserves value
  assumed_prerequisites: [fractions-as-number, multiplicative-thinking]
  grade: 5
  method: concrete-pictorial-abstract
  goal: reasoning
  difficulty: core
  child_view:
    - id: diagnose
      prompt: "Which is larger, 3/4 or 6/8? Explain using the same-sized whole."
    - id: build
      prompt: "Draw two equal bars, split one into 4 pieces and the other into 8. Shade equivalent amounts."
    - id: transfer
      prompt: "Is 4/6 the same as 6/9? How do you know without decimal conversion?"
  adult_key:
    - id: diagnose
      reasoning: "They are equal; 6/8 is obtained by partitioning each quarter into two equal pieces."
      error_probe: "Comparing the size of numerator/denominator independently"
    - id: transfer
      reasoning: "Both simplify to 2/3; multiplying both parts of 4/6 by 1.5 is valid numerically, but 2/3 equivalence is clearer."
  graduated_hints:
    - "What is the whole?"
    - "Can the two bars be the same length?"
    - "What happens if each fourth is cut into two?"
  verification: {arithmetic_checked: true, unique_answer: true, units_checked: true}
```
