# Documentation layout: a first-visit README, detail in docs

Applies to any repository whose README is its front page. Nothing below depends on this repository's paths; copy it as-is. It was extracted from one real change: a package README that was a 107-line rule book became a 49-line index, the detail moved into six English/Chinese doc pairs, and one contract test needed an exemption.

## 1. The README admission test

A first visitor must answer six questions within a minute:

1. What is this, and what does it replace? (one sentence)
2. Where do I start? (the primary command or entry)
3. How do I install it, and what do I see when it worked?
4. Where do output and data go? (writable state vs read-only originals)
5. What is irreversible, and what does a mistake cost?
6. Where do I read further?

Keep what answers these. The test is "first visit", not "complete" — a README is an index, not a manual. A detail you had to look up for the third time you edited the project does not belong here.

## 2. Where extracted detail goes

| Kind of content | Target doc | Suggested base name |
|---|---|---|
| Component roles, rule ownership, "which file owns this rule" | architecture / ownership | `skills.md`, `architecture.md` |
| Data layout, write exceptions, format compatibility | data | `data-directory.md` |
| Dependencies, extension points, adding a module | extension | `extending.md`, `subject-packages.md` |
| Interaction policy (recommendations, difficulty, when to confirm) | behavior | `recommendation.md` |
| Behavior list that needs a real run | acceptance | `acceptance-scenarios.md` |
| Build, publish manifest, validation commands | development | `development.md` |

Each block of content lands in exactly one place; everything else points at it. When a block fits no row, ask which task a reader would be doing when they need it, then name the file — never invent `misc.md`.

## 3. Order of operations

1. Move the detail into docs first, leaving the text essentially as it was.
2. Then rewrite the README around the six questions, replacing the rest with a "to learn about X, read Y" table.
3. Finally update every pointer: the README table, cross-links between docs, and routing files such as `AGENTS.md` or `CONTRIBUTING.md`.

Reversing the order leaves a commit range full of dead links. If you compress while moving instead of copying, you are not following step 1 — then step 5's loss check is mandatory, not optional.

## 4. Two languages: one file or two

- **The README: one file, both languages.** English first, Chinese second, with `[English](#english) | [中文](#中文)` directly under the title. The practical reason: npm and GitHub each render exactly one README, so a separate `README.zh.md` leaves the second language with no entry point.
- **Every other doc: two files**, `name.md` and `name.zh.md`, each with a switch link on the first line under the title. Keep the base name identical and add only a language suffix, so `diff` and `grep` pair up cleanly.
- **Do not create `docs/en/` and `docs/zh/`** unless one of these holds: more than ~15–20 docs per language, a third language, a per-language site build, or docs that have started paging into sub-pages. Language directories cost you one path segment per link and force a "which language when unspecified" decision.
- Anchor note: GitHub slugs come from headings and keep CJK characters as they are. Do not reuse a heading name across languages (`## English` and `## 中文` is the safe shape), and make every jump link point at a heading that exists.

## 5. Checks to run every time

```bash
git diff --check                 # whitespace and line endings
node scripts/check-*.mjs         # the repo's own static checks, if any
node --test scripts/*.test.mjs   # contract/regression tests, if any
node scripts/build-resources.mjs # generated artifacts: confirm no diff
```

Plus two scripts. **Links and anchors** — relative targets exist and every `#fragment` hits a heading. Strip fenced blocks and inline code first, or link syntax quoted inside the page reports itself as broken:

```python
import os, re, pathlib

FENCE = re.compile(r'```.*?```', re.S)
INLINE = re.compile(r'`[^`\n]*`')
def prose(path):
    return INLINE.sub('', FENCE.sub('', open(path).read()))

def slug(text):
    text = re.sub(r'[`*_\[\]()]', '', text).strip().lower()
    return re.sub(r'[^\w\u4e00-\u9fff-]+', '-', text).strip('-')

files = ['README.md'] + [str(p) for p in pathlib.Path('docs').glob('*.md')]
heads = {f: {slug(m.group(1)) for line in open(f)
             if (m := re.match(r'^#{1,6}\s+(.*)$', line.strip()))} for f in files}
for f in files:
    for m in re.finditer(r'\[[^\]]*\]\(<?([^)>]+)>?\)', prose(f)):
        target = m.group(1)
        if target.startswith(('http', 'mailto')):
            continue
        if target.startswith('#'):
            assert target[1:] in heads[f], (f, target)
            continue
        path, _, frag = target.partition('#')
        resolved = os.path.normpath(os.path.join(os.path.dirname(f), path))
        assert os.path.exists(resolved), (f, target)
        if frag and resolved in heads:
            assert frag in heads[resolved], (f, target)
```

**Content loss** — search each sentence of the old file inside the union of the new ones. This is what catches a paragraph that quietly disappeared during a rewrite:

```python
import glob, re

old = open('README.old.md').read()
new = re.sub(r'\s+', '', ''.join(
    open(p).read() for p in ['README.md'] + glob.glob('docs/*.md')))
for sentence in re.split(r'[。\n]', old):
    if len(sentence.strip()) > 25 and re.sub(r'\s+', '', sentence)[:18] not in new:
        print('check where this went:', sentence.strip()[:60])
```

False positives are normal once you have rephrased; the requirement is that you can say where each hit went.

## 6. Three pitfalls

**Content-constrained tests.** Some repositories scan every markdown file under a directory and enforce content rules — for example, a shared package that must never name a concrete sub-project. A new `docs/` is inside that scan, so the names you need in order to describe dependencies turn the test red. The fix is to exempt the new directory explicitly and record the reason in a comment (maintainer material, not installed runtime rules). Do not delete the names, and do not skip the whole package.

**Publish manifests.** `files` in `package.json`, `MANIFEST.in`, `.npmignore` decide what ships. If docs are not listed, README links into them are dead on the install page. Two valid answers: add the directory and update any assertion over the manifest in the same commit, or follow the repo's existing convention (this package already ships repo-relative links such as the installation guide, so its README was never install-page-clean). Pick one deliberately and say which.

**Rewriting while moving.** Compressing text during the move is often what makes docs readable, but it silently drops clauses. Treat step 3 as "move, then rewrite if needed" and never skip the loss check when you rewrite.

## 7. Commit shape

One commit covers the README, the new docs, and the test exemption — missing one gives a red build or a dead link. Write the message as symptom, structure, verification:

- the symptom as a reader's action: "you had to read the whole rule book before learning which command starts anything";
- the new split, without listing files (the diff has them);
- real numbers: static checks, pass/skip counts, and confirmation that generated artifacts are unchanged.

## 8. Keeping it stable

- **One authoritative copy.** A rule lives in exactly one file; everything else is a pointer. Put the ownership map in the architecture doc so edits start by looking up the owner.
- **Aligned lengths.** Paired translations should have close line counts (36/36, 27/27); a missing or stale translation then shows up immediately.
- **Switch link on top.** Every page's first line under the title is the language switch, so nobody has to return to the README to find the other version.
- Anti-patterns: a README that becomes a manual; copying a rule instead of pointing at it; updating only one language; absolute or machine-local links; anchors that depend on heading order; an acceptance list presented as "verified".

## 9. Checklist before committing

- [ ] README answers the six questions and holds no manual
- [ ] Every extracted block has exactly one home, with one authoritative copy
- [ ] All relative links and `#anchors` resolve (script passes)
- [ ] Language versions correspond one-to-one, each with a switch link
- [ ] Spot-checked that old content did not vanish
- [ ] Static checks, tests, and generated artifacts report no diff
- [ ] Publish manifest and its assertion test agree — or the choice is stated
- [ ] Commit message states the symptom and the verification numbers
