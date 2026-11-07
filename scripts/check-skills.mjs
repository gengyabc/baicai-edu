#!/usr/bin/env node
/**
 * Static checks for the four education skill bundles.
 *
 * Usage: node scripts/check-skills.mjs
 * Exit code 1 when an error is found.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, basename, extname } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const BUNDLES = ['learn', 'math-primary-low', 'chinese-reading', 'english']
const ENTRIES = new Set(['learn-start', 'learn', 'learn-feynman', 'learn-profile', 'learn-save', 'learn-clean'])
const USER_ONLY = new Set(['learn-start', 'learn', 'learn-clean'])
const MODES = new Set(['learn', 'feynman', 'diagnose', 'start', 'revise', 'assess'])
const SUBMODES = new Set([
  'learn', 'practice', 'review', 'feynman', 'student_problem',
  'read_write_transfer', 'generate_tasks', 'experience_bridging',
])
const SOURCES = new Set([
  'profile', 'manual_topic', 'error_analysis', 'diagnosis', 'practice',
  'reading', 'writing', 'save', 'focus', 'file_analysis',
])
const BANNED = [
  [/\bhobbies\b/, 'old field `hobbies`; use `personal.interests`'],
  [/\beasy_areas\b|\bhard_areas\b/, 'old field `easy_areas`/`hard_areas`; use `easy_topics`/`hard_topics`'],
  [/\bteach_readiness\b/, 'old field `teach_readiness`; use `feynman_readiness`'],
  [/pending_(teach|feynman|transfer)_/, 'stale `pending_*` on current_state; restore from session log context'],
  [/\bPython\b/, 'do not assume Python or any one language; verify with a calculation command the current environment has'],
  [/\bbash\b/, 'do not require bash; it is unavailable on Windows'],
  [/\bplugin\b/i, 'Pi wording `plugin`; use `skill` or plain language'],
  [/@\.pi/, 'Pi path notation'],
  [/\/teach\b/, 'stale `/teach`; the entry is `/learn-feynman`'],
  // Slash-command names only; allow path suffixes like /profile.json or /feynman-mode.md
  [/\/start(?![-\w.])/, 'stale `/start`; the entry is `/learn-start`'],
  [/\/save(?![-\w.])/, 'stale `/save`; the entry is `/learn-save`'],
  [/\/profile(?![-\w.])/, 'stale `/profile`; the entry is `/learn-profile`'],
  [/\/feynman(?![-\w.])/, 'stale `/feynman`; the entry is `/learn-feynman`'],
  [/"mode":\s*"feynman_handoff"/, 'dead `feynman_handoff` mode'],
  [/via `@`/, 'dead Pi `@` reference convention'],
]

const errors = []
const warnings = []
const skills = new Map()
const allRefFiles = new Set()

function walk(dir, out = []) {
  if (!statSync(dir, { throwIfNoEntry: false })) return out
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path, out)
    else out.push(path)
  }
  return out
}

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return null
  const data = {}
  for (const line of match[1].split('\n')) {
    const m = line.match(/^([a-z-]+):\s*(.*)$/)
    if (m) data[m[1]] = m[2]
  }
  return data
}

for (const bundle of BUNDLES) {
  const skillsDir = join(ROOT, bundle, 'skills')
  for (const entry of readdirSync(skillsDir)) {
    const dir = join(skillsDir, entry)
    if (!statSync(dir).isDirectory()) continue
    const file = join(dir, 'SKILL.md')
    let text
    try {
      text = readFileSync(file, 'utf8')
    } catch {
      errors.push(`${bundle}/skills/${entry}: missing SKILL.md`)
      continue
    }
    for (const ref of walk(join(dir, 'references'))) {
      allRefFiles.add(basename(ref))
      if (/\bbash\b/.test(readFileSync(ref, 'utf8'))) {
        errors.push(`${ref}: do not require bash; it is unavailable on Windows`)
      }
    }
    const fm = parseFrontmatter(text)
    if (!fm) {
      errors.push(`${file}: missing frontmatter`)
      continue
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fm.name ?? '')) {
      errors.push(`${file}: invalid name "${fm.name}"`)
    }
    if (fm.name !== entry) errors.push(`${file}: name "${fm.name}" != directory "${entry}"`)
    if (!fm.description) errors.push(`${file}: empty description`)
    if (fm.description && fm.description.length > 500) {
      errors.push(`${file}: description longer than 500 chars`)
    }
    if (skillShas(fm)) errors.push(`${file}: both invocation switches disabled`)
    if ('disableModelInvocation' in fm || 'userInvocable' in fm) {
      errors.push(`${file}: legacy camelCase invocation key`)
    }
    if (skills.has(fm.name)) errors.push(`duplicate skill name "${fm.name}"`)
    skills.set(fm.name, { bundle, file, fm, text })

    if (USER_ONLY.has(fm.name) && fm['disable-model-invocation'] !== 'true') {
      errors.push(`${file}: user-only entry must set disable-model-invocation: true`)
    }
    if (!USER_ONLY.has(fm.name) && fm['disable-model-invocation'] === 'true') {
      errors.push(`${file}: model-loadable skill must not disable model invocation`)
    }
    const internal = !ENTRIES.has(fm.name)
    if (internal && fm['user-invocable'] !== 'false') {
      errors.push(`${file}: internal skill must set user-invocable: false`)
    }
    if (ENTRIES.has(fm.name) && fm['user-invocable'] === 'false') {
      errors.push(`${file}: entry must not be user-invocable: false`)
    }
    for (const [re, why] of BANNED) {
      if (re.test(text)) errors.push(`${file}: ${why}`)
    }
    for (const m of text.matchAll(/"source":\s*"([a-z_]+)"/g)) {
      if (!SOURCES.has(m[1])) warnings.push(`${file}: unknown source "${m[1]}"`)
    }
    for (const m of text.matchAll(/"mode":\s*"([a-z_]+)"/g)) {
      if (!MODES.has(m[1])) warnings.push(`${file}: unknown mode "${m[1]}"`)
    }
    for (const m of text.matchAll(/"submode":\s*"([a-z_]+)"/g)) {
      if (!SUBMODES.has(m[1])) warnings.push(`${file}: unknown submode "${m[1]}"`)
    }
    for (const m of text.matchAll(/references\/([A-Za-z0-9_.-]+\.md)/g)) {
      const name = m[1]
      const local = join(dir, 'references', name)
      if (!statSync(local, { throwIfNoEntry: false }) && !allRefFiles.has(name)) {
        errors.push(`${file}: dangling reference references/${name}`)
      }
    }
  }
}

function skillShas(fm) {
  return fm['disable-model-invocation'] === 'true' && fm['user-invocable'] === 'false'
}

// Remove dangling-reference errors that were raised before the global set was complete.
const refErrors = errors.filter((e) => e.includes('dangling reference'))
if (refErrors.length > 0) {
  for (const e of refErrors) {
    const name = e.split('references/')[1]
    if (allRefFiles.has(name)) errors.splice(errors.indexOf(e), 1)
  }
}

for (const warning of warnings) console.warn(`warn  ${warning}`)
for (const error of errors) console.error(`error ${error}`)
console.log(`\n${skills.size} skills checked, ${errors.length} errors, ${warnings.length} warnings`)
process.exit(errors.length === 0 ? 0 : 1)
