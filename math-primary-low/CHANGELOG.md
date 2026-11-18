# Changelog

All notable changes to `baicai-edu-math-primary-low` are recorded here. This
package has not been published before 0.1.0, so that release is the current
state rather than an upgrade path.

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
  `baicai-edu-math-board: ^0.6.0`.
- The closure registers 20 skills; `cordis.patch.yml` lists every package of the
  closure so the single provider resolves each one by absolute path.
- `engines.dsh: ">=0.2.2-rc.1 <0.3.0"` and a `publishConfig` that pins the
  public registry with `access: public`.
