# Teaching Implementation Resolution

Starting learning, initialization, target classification, recommendation, restore, and actual teaching share this resolution; callers reuse one resolution result and do not each probe whether a package is available. First handle safety and any pending `finalize_plan`, then resolve. Resolution does not perform teaching and does not write mastery evidence.

## Identity and result

`subject` denotes the real subject/task identity, not the teaching implementation. Reuse an existing stable id; for a clearly new domain use a short neutral `[a-z][a-z0-9_]*` id, with path separators and `..` forbidden. For an unknown or cross-domain target create `task_<random hex>`, using the target description for the student to recognize and not exposing the id. The same unfinished task reuses its identity and is not recreated each turn.

Each selected target's `scope_id` is `scope_<random hex>`; restore reuses it, and a different target gets a new one; the same focus name does not mean the same target. A new identity first confirms the student's wishes; a cross-subject switch first saves the old subject, then activates the new identity. When there is no target and only support discussion, keep the current identity; when there is no identity yet, create a neutral task identity and do not force-guess a subject.

The resulting `teaching` is saved in the log context, and when a recommendation has no context yet, it is stored in the recommendation:

```json
{
  "provider": "general",
  "core_skill": "learn-general-core",
  "session_skill": "learn-general-session",
  "evidence_namespace": "general_v1"
}
```

A specialist package's result is `provider: specialist`, its actual unique `core_skill` / `session_skill` names, and `evidence_namespace: specialist`. Most subjects use `<subject>-core` / `<subject>-session`; mathematics uses the band-specific names below. Both keep the real subject and do not create a general subject shared by all records. An old segment with no teaching is treated as original specialist evidence and is not reclassified.

## Selection and restore

1. If the log has an uncommitted plan, restore first; do not bypass saving by falling back for a missing package.
2. An unfinished context that already has teaching: no hot replacement, and do not re-resolve the current task because a new package was installed. An old log without teaching is restored with the original specialist package; if the original implementation is truly unavailable, keep the original evidence and ask whether to continue with general teaching or end, and do not rewrite old segments as general. After the student chooses general, first save/interrupt the old task, and create a new one only after success.
3. A new task resolves the actual core and session skill names first (mathematics uses the band selection below; other subjects use `<subject>-core` and `<subject>-session`), then loads those exact names; only when both and the five contract roles are complete and usable does it constitute a specialist implementation. Read the core's optional `supported_stages` declaration; an old package with no declaration only supports the two existing primary stages by default. When the stage is unknown, use the specialist implementation only if the package explicitly provides an unknown-stage starting point or a declared missing-grade fallback band; otherwise use the general implementation and do not fabricate grade/level; when the stage is known but does not fit, use the general implementation. Stage denotes fit of teaching expression/flow and does not limit the student from exploring higher-grade content.
4. With a missing package, a missing key role, or a clear misfit, use `learn-general-core` / `learn-general-session` shipped with the base package and their five-role references; do not stop helping or require installing an extra general package. When a specialist package lacks only a recommendation role, ongoing old teaching may continue; when a new task is needed, use a complete implementation.
5. When two packages of the same subject both fit, prefer the package whose declared band matches the student's explicit grade; overlapping `supported_stages` is compatibility, not a tie decided by install order. Record the actual unique `core_skill` and `session_skill` names in teaching so a resumed task keeps its implementation. Loading needs only the exact skill name, without a host patch or provider-qualified lookup.
6. The caller finds the contract roles by the base directory of the result's `core_skill`, and uses `session_skill` as the only teaching handoff. Do not register general files as a fake `<subject>-core`.

## Mathematics band selection

For a new mathematics task, an explicit grade takes precedence over overlapping `supported_stages`: grades 1–3 prefer `math-low-core` / `math-low-session`; grades 4–6 prefer `math-high-core` / `math-high-session`. Without an explicit grade, prefer `math-low-core` / `math-low-session` as the missing-grade fallback, without inventing a grade or a mastery level. If a clearly non-primary education stage is known, apply the stage-fit rules above rather than treating it as a missing-grade primary learner.

These are teaching defaults, not content gates: the low band can teach higher-grade content, and a harder topic alone does not change the band. If the preferred band is unavailable, use another complete, compatible specialist band when available; otherwise use general teaching. Do not install a package or claim it was loaded merely because it is preferred.

Use the selected band's unique names throughout the task: `math-low-diagnose`, `math-low-practice`, `math-low-student-problem`, or `math-high-diagnose`, `math-high-practice`, `math-high-student-problem`, `math-high-application-modeling`. The real subject remains `math`, with the same student-data directories and evidence namespace. No duplicate-name aliases are registered.

### Legacy mathematics restore

An unfinished task with unique skill names keeps those names even if a different band is now preferred by grade. For old `math-core` / `math-session` records, first recover the actual band from explicit package/provider metadata or reliable original loading provenance. Map that band's core, session, and any `turn_state.active_leaf` to their unique names in active context; synchronize the session pointer when it describes the same task. A prior `skill_provider` may be read as legacy provenance but is not required for new tasks. Keep the session id, scope, materials, pending question, and all historical evidence; do not rewrite old segments, replay finalized records, or switch bands merely by matching the student's current grade. When the old band cannot be established, ask which band to continue with before teaching; choosing a different implementation uses the existing save/interrupt flow. The obsolete bare names are migration inputs only, not loadable skills.

## Implementation-fit suggestions

The current subject contract supplies pedagogical evidence and the reason for any alternative implementation; shared learn owns process choices and lifecycle handoff. A representation/tool need or an isolated prerequisite gap is a support adjustment, not stage evidence or permission to change providers. Keep teaching with the current implementation while discussing an alternative. A confirmed stage correction goes through the shared profile flow; an implementation change follows the selection and restore rules above, saving/interrupting the old task before resolving a new one. Present necessary process choices with `ask_user_question`; do not install packages automatically. Learning-goal recommendations still require `learn-recommend`'s normal entry trigger, not merely a tool or package suggestion.

## Evidence isolation

The four files of the same subject continue to exist, with no second save entry added:

- Specialist segments keep using the existing subject profile, skills, and levels; task performance of general_v1 segments goes only into memory's `general_progress`, with each item containing subject, scope_id, teaching, date, actual performance, and follow-up suggestions.
- The general path does not update a specialist package's current_levels, mastered_topics, confirmed_skills, skill_errors, diagnosis labels, or milestones. Do not apply a primary-school initial level to a general task.
- Before resolution, read the existing files; do not clear or overwrite old specialist evidence by initializing. A new general profile has empty preferences/current_levels and an empty active_domain; existing subject files are kept.
- The snapshot given to a specialist filters out ability judgments derived from general segments; general history serves only as reference with its source noted. general_v1 restore/recommendation filters by the current scope_id and does not mix unrelated tasks.
- If a specialist package is installed later, it is adopted only for a new task after the task ends or after an explicit save/interrupt; old general records are not automatically mapped to specialist levels. When mastery needs confirming, the specialist package re-verifies under its own rules.
