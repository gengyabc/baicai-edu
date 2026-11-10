# Subject Contract

The only agreement between the entry and a teaching implementation. First read `references/teaching-resolver.md` and resolve teaching with the real subject and current stage; all callers reuse that result. A specialist package is still found by the naming below; the general path uses the resolved core_skill/session_skill and must not change the subject to a general service name. Subject names, options, domains, labels, and initial levels all stay in the subject package. The selectable subject list is maintained only in the subject table of `/learn-start`.

## Naming

- `<subject>-session`: the single entry for each teaching turn of that subject. The lifecycle's Route And Record loads it; it then decides sub-skills, additional actions, and transfer parameters.
- `<subject>-core`: subject rules, which produce no student reply or segment. Its SKILL.md has a `## Subject contract` section giving one reference for each role in the table below.

`<subject>` is the `subject` value in `session.json`.

## Contract roles

| Role | Read by | Purpose |
|---|---|---|
| Target classification | `/learn`, `/learn-feynman`, lifecycle restore | After `references/target-parsing.md`, classify the remaining text and the target after file handoff |
| Grade defaults | `/learn-start`, `/learn-profile`, Read Snapshot initialization | Initial values of `learning_state.active_domain` and `profile.current_levels` |
| Profile fields | `/learn-start` profile creation, `/learn-profile` edits | `profile.preferences` keys, the mapping between `/learn-start` preference options and keys, and `current_levels` keys |
| Diagnosis rules | `learn-errors`, file target handoff | Values of `error_type`, `label`, and `domain` |
| Learning recommendations | `learn-recommend` | Based on the existing snapshot and latest performance, decide candidate content, difficulty, ordering, and recommendation reasons using this subject's teaching methods; does not perform teaching |

After loading `<subject>-core` by name, locate the files in the table above via the base directory it returns, without stitching repository paths.

The Learning recommendations role returns candidates for `learn-recommend` to organize the choice, and each item contains a specific focus, a target_context acceptable to target classification, a reason in the active UI locale (per `references/ui-locale.md`), and a basis that supports the judgment (a recorded fact or an exploratory note). Candidate count, presentation, selection, and write-back boundaries follow `learn-recommend`. Ordinary restore still follows the lifecycle's fixed candidate order; only explicit recommendation mode allows reordering. The recommendation flow does not call `<subject>-session` to start teaching, and only after the user selects does it enter it.

## Not installed

If loading `<subject>-core` or `<subject>-session` by name fails: per `references/teaching-resolver.md` use the general task teaching in the base package, keeping the real subject, target, and material; an existing task is not hot-swapped, and the restore/save handoff is completed first. Do not refuse to teach for a missing package, and do not auto-install packages.

## Optional extensions

- Stage extra options: return `stage_options` outside the segment, merged and shown per `references/next-step.md`.
- Transfer: `<subject>-session` handles continuing and restoring `context.activity: transfer`, with state recorded per `references/session-lifecycle.md`.
