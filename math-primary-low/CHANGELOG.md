# Changelog

All notable changes to `baicai-edu-math-primary-low` are recorded here. This
package has not been published before 0.1.0, so that release is the current
state rather than an upgrade path.

## [0.1.3] - 2026-11-19

### Skills

- `math-low-core` and `math-low-session` state each branch's mandatory and
  conditional reads where the branch begins, instead of leaving them to be
  inferred from a reference list. Their initial prompts drop from 146 KB to
  8.8 KB and from 50 KB to 14.2 KB, and the drawing supplement they carry is
  condensed; the safe fallback and the board rules are unchanged.

### Packaging

- Requires `baicai-edu-math-board: ^0.6.1`, not `^0.6.0`. Caret alone would accept
  0.6.0, but pnpm's `minimumReleaseAge` can resolve a just-published 0.6.1 back to
  0.6.0 — the build that still ships the teacher-demo guide and its 查看教程 door.
  Pinning the low end to the version that has the behaviour this release documents
  leaves the resolver no way to fall back.
- Both skills declare `resource-loading: on-demand`: the provider registers their
  routing body alone, and each branch reads the reference it names from the
  installed base directory.
- Locale catalogs now ship as `resources/references/locales/<locale>.json` at the
  path the skill prose cites, so an installed skill can read them instead of
  falling back to plain text for every process label.
- This bundle registers only its own skills when enabled. Missing other
  subjects no longer prevent it from loading, and a disabled bundle does not
  register its skills just because its package is present on disk.

## [0.1.0] - 2026-11-18

First release on npm. Installing this package by name is enough: the closure
`baicai-edu-learn`, `baicai-edu-math` and `baicai-edu-math-board` comes with it.

### Skills

- `math-low-session` is the teaching mainline for grades 1-3, in learn and
  Feynman modes: resumed foci, the turns themselves, and the path back from
  diagnosis, practice and student-made problems.
- `math-low-diagnose` reads a starting point that is unclear, triages error
  items, and re-checks an error pattern when self-report and performance
  disagree.
- `math-low-practice` confirms a pattern with similar items, contrasts causes,
  stabilizes independent calculation, and adds practice on request.
- `math-low-student-problem` turns the student into the problem setter and
  judges their invented problems.
- `math-low-core` carries the shared CGI rules and the field conventions for
  math learning records. Grade tunes the language and the representation, not
  what a student may explore.

### Packaging

- Depends on `baicai-edu-learn: ^0.1.0`, `baicai-edu-math: ^0.1.0` and
  `baicai-edu-math-board: ^0.6.0` (raised to `^0.6.1` in the next release, see below).
- The closure registers 20 skills; `cordis.patch.yml` lists every package of the
  closure so the single provider resolves each one by absolute path.
- `engines.dsh: ">=0.2.2-rc.1 <0.3.0"` and a `publishConfig` that pins the
  public registry with `access: public`.
