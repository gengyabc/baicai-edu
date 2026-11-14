# Upper Primary Math Learning Recommendations

Read by `learn-recommend` through the subject contract. This file decides the content, difficulty, reasons, and ordering of math candidates for grades 4–6; lifecycle owns selection, saving, and handoff. Recommendations supply no performance evidence.

## Evidence and Scope

Use only the existing snapshot (at most its recent 5 session summaries and 20 recent errors) and current real performance. Summaries are not full turn logs: independent, supported, delayed, and comparable conditions remain unknown unless explicitly recorded. Do not scan old sessions or raw materials to reconstruct missing history.

## Candidates: Relationship × Strategy × Structure

Choose one observable relationship × strategy × structure, not “learn fractions” or “improve reasoning”. First inspect the specific methods, problem types, unknown positions, numbers, and support in `strategy_summary`, then `priority_targets`, `developing_topics`, recent errors, and `session_history[0].next_step`. A saved next step is a candidate, not an automatic task or schedule.

- Stages and domains follow `references/progression-map.md`; arithmetic, multi-digit, fraction, and symbolic tracks stay distinct. Unknown stage supports low-load exploration, not an entrance battery or a grade-based diagnosis.
- Choose relationships/numbers per `references/problem-design.md`. Change mainly one load factor; grade is not a content gate. Interests and preferences supply context only under `references/math-personalization.md`; `material_difficulty` adjusts load, not mastery.
- For a supported near-neighbor step, read at most one relevant edge in the existing `references/topic-map.md`, not the whole graph. Ratio, percent, proportion, and unknowns as relations are ready when their earlier relationships are usable, not on a fixed unit schedule.

## Candidate and Opening

Keep the existing `id / focus / target_context / reason / basis` shape. Topic names describe mathematics, not “teach me”. Reasons never overwrite student-authored `target_context.intent`. For new candidates, describe the goal and first activity in `reason`, and pair a proposed fresh opening with `target_context.math_opening_hint: micro_lesson | practice | probe | challenge` per **Selected opening expectation** in `learn-data`'s `references/target-parsing.md`. A continuation instead retains the current scope and pending point without a fresh hint. Choose from evidence, not a rule that every learning session starts with a problem:

| Evidence | Small candidate | Suggested opening |
|---|---|---|
| Several comparable performances or an existing diagnosis confirm one blocking relation | Repair that minimal relevant gap, such as equivalence with the same whole | `micro_lesson` when the gap is clear and teaching fits; `probe` if the cause is still ambiguous |
| Recent completion depended on hints/examples, with no independent evidence | Consolidate the same relation | `practice`: fresh unhinted check before further scaffolding, not a harder topic |
| Recent comparable independent explanation or method selection | One near-neighbor new relation or a structural/meaningful-context variation | `micro_lesson` for new learning; `challenge` for transfer without revealing the method |
| Explicit later-check suggestion, or earlier success without recent comparable performance | Offer one fresh look back | `practice`, unhinted; claim neither forgetting nor a due date without the required records |
| One error only | Local clarification, keeping the cause tentative | `probe` only when discriminating evidence is needed, not a stable-weakness label |
| Grade/interests only or no history | A low-load exploratory relationship | `probe` or a clearly agreed learning opening; reason says “we could start from …”, not an invented past observation |
| Self-report only | Try the student's stated goal provisionally | Match the request without treating self-report as demonstrated mastery |

For example, a confirmed digit-count decimal comparison difficulty can support comparing `0.9` and `0.87` on a number line. An independently justified `3/4 = 6/8` can support new learning about common fraction units; if the explanation was teacher-supported, prefer a fresh independent equivalence check first. For geometry/data/ratio use the domain's actual relationship, not an arithmetic ladder.

Hints are optional, temporary, and advisory: only candidates and the selected session context carry them. Session chooses the real action; lifecycle consumes the hint in the first successful opening context write with the advanced pending state. Failed writes retain it for retry. Never put hints into long-term summaries, profiles, ability evidence, or a global mode. Old candidates without hints follow normal rules. A continued same-goal pending task resumes unchanged, and explicit practice, self-derivation, Feynman, or original-solution requests override stale hints.

## Ranking and Reasons

Apply these rules in order:

1. **Scope first.** An explicit reliable goal goes straight to teaching, not recommendation. For “different content”, prefer a different feasible relationship/domain rather than the old sticking point with new objects.
2. **Resolve conflicts.** Latest comparable independent evidence may replace an old suggestion. Different task scope or prompting conditions stay separate; simpler success does not erase a harder unresolved gap. Missing support conditions stay unknown.
3. **Choose the next useful step.** A confirmed relevant blocker comes first. Otherwise compare consolidation, near-neighbor new learning, transfer, and agreed review against recent evidence and goals. Recently independent isomorphic work with no review need does not occupy first place. Usually give 2–3 distinct candidates, exactly one preferred first choice; one justified candidate is sufficient.
4. **Make reasons checkable.** Use one actual recorded action plus why this next step helps. Use the active UI locale per `learn-data`'s `references/ui-locale.md`, not topic-map ids or profile keys. Example: “Last time you independently showed how splitting each quarter into two keeps the amount; now we can see how to write two fractions using the same unit.” Avoid broad ability labels.

Seeing, skipping, or not answering the card authorizes no selection; delegated choice follows the shared flow. A pending recommendation resumes with its original ordering. At session end use one evidence-based `next_step_candidate`, not a new recommendation database.

## Tools, Prerequisites, and Package Fit

A need for objects, diagrams, board use, or one weak prerequisite does not by itself justify `math-primary-low`; support the student inside this package with grade-appropriate language. Only an evidenced necessary dependency enters `references/prerequisite-learning.md`; a proposed lesson alone creates no plan.

Known grades 1–3 fit the lower band, with general teaching as resolver fallback when unavailable. If recorded stage appears wrong, the shared profile flow confirms it. Package changes follow `learn-data`'s `references/teaching-resolver.md`: the subject supplies evidence/rationale, learn owns process choices, confirmation, saving, and re-resolution for a new task. No direct leaf/package hot-swap or automatic installation. `learn-recommend` owns goal choices only under its recommendation gate; a tool suggestion alone is not that trigger.

Completion: every candidate has an immediately actionable small goal, an evidence/default basis, and a matching provisional opening; exactly one is preferred, and recommendation/selection creates no student-performance record.
