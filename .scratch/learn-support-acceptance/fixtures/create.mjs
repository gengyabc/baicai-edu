#!/usr/bin/env node
/**
 * Synthetic student fixture builder for learn-support acceptance.
 * Usage: node .scratch/learn-support-acceptance/fixtures/create.mjs <kind> <student_id> [subject]
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

// 默认写仓库根；验收时可指向隔离目录，避免合成学生污染真实 outputs/students。
const ROOT = process.env.DSH_EDU_ACCEPTANCE_ROOT || join(import.meta.dirname, '../../..')
const out = (...p) => join(ROOT, 'outputs/students', ...p)
const data = (...p) => join(ROOT, 'data/students', ...p)
const now = '2026-11-09T12:00:00Z'

const specialistTeaching = (subject) => ({
  provider: 'specialist',
  core_skill: `${subject}-core`,
  session_skill: `${subject}-session`,
  evidence_namespace: 'specialist',
})

const generalTeaching = {
  provider: 'general',
  core_skill: 'learn-general-core',
  session_skill: 'learn-general-session',
  evidence_namespace: 'general_v1',
}

function writeJson(path, obj) {
  mkdirSync(join(path, '..'), { recursive: true })
  writeFileSync(path, JSON.stringify(obj, null, 2) + '\n')
}

function dirs(id, subject) {
  mkdirSync(data(id, subject, 'raw'), { recursive: true })
  mkdirSync(out(id, subject, 'extracted'), { recursive: true })
  mkdirSync(out(id, subject, 'backups', 'raw'), { recursive: true })
}

function emptySubjectFiles(id, subject, { levels = {}, domain = '', prefs = {} } = {}) {
  writeJson(out(id, subject, 'profile.json'), {
    updated_at: now,
    profile: {
      preferences: prefs,
      self_report: { easy_topics: [], hard_topics: [] },
      current_levels: levels,
    },
    learning_state: {
      active_domain: domain,
      mastered_topics: [],
      developing_topics: [],
      priority_targets: [],
    },
    error_history: [],
    session_history: [],
  })
  writeJson(out(id, subject, 'memory.json'), {
    profile_memory: {
      preferred_scaffolds: [],
      motivation_signals: [],
      expression_traits: [],
      stable_strengths: [],
      stable_difficulties: [],
      preferred_persona: 'guided_coach',
      material_difficulty: { direction: 'standard', note: '', updated_at: null },
    },
    learning_memory: {
      recent_focus: '',
      recent_modes: [],
      recent_error_patterns: [],
      recommended_next_moves: [],
      feynman_readiness: 'unknown',
      confirmed_skills: [],
      skill_errors: [],
      updated_at: now,
    },
    general_progress: [],
    learning_support_memory: { plans: [], observations: [] },
  })
  writeJson(out(id, subject, 'current_state.json'), {
    active_focus: '',
    source: 'profile',
    entry_point: 'learn',
    submode: 'learn',
    last_finalized_session_id: null,
    updated_at: now,
  })
  writeJson(out(id, subject, 'milestones.json'), { milestones: [] })
  writeJson(out(id, subject, 'session_log.json'), {
    session_id: `sess_synth_init_${id.slice(-4)}`,
    entry_point: 'learn',
    started_at: now,
    updated_at: now,
    segments: [],
  })
}

function activate(id, subject, extra = {}) {
  writeJson(out('session.json'), {
    student_id: id,
    subject,
    last_active: now,
    session_started_at: now,
    ...extra,
  })
}

function baseProfile(id, name, fields = {}) {
  writeJson(out(id, 'profile.json'), {
    student_id: id,
    name,
    language: 'zh-CN',
    personal: { interests: fields.interests || [], most_exciting_event: '', most_sad_event: '' },
    learning_preferences: { goals: [], support_preferences: [] },
    created_at: now,
    updated_at: now,
    ...fields,
  })
}

const kinds = {
  /** S01: old grade-4 archive without education_stage */
  old_grade4(id) {
    const subject = 'math'
    baseProfile(id, '合成四年级', { grade: 4, grade_band: 'upper_primary' })
    // intentionally no education_stage
    const p = JSON.parse(readFileSync(out(id, 'profile.json'), 'utf8'))
    delete p.education_stage
    writeJson(out(id, 'profile.json'), p)
    dirs(id, subject)
    emptySubjectFiles(id, subject, {
      domain: 'number',
      levels: { number: 'developing' },
      prefs: { practice: true },
    })
    const mem = JSON.parse(readFileSync(out(id, subject, 'memory.json'), 'utf8'))
    mem.learning_memory.recent_focus = '两位数乘法'
    mem.learning_memory.confirmed_skills = [
      { skill: '两位数乘法竖式', domain: 'number', confirmed_at: '2026-10-01T10:00:00Z' },
    ]
    writeJson(out(id, subject, 'memory.json'), mem)
    writeJson(out(id, subject, 'session_log.json'), {
      session_id: 'sess_s01_learn',
      entry_point: 'learn',
      started_at: now,
      updated_at: now,
      context: {
        focus: '两位数乘法',
        mode: 'learn',
        activity: 'teaching',
        scope_id: 'scope_s01a',
        teaching: specialistTeaching('math'),
        target_context: { type: 'topic', topic: '两位数乘法', source: 'manual_topic', files: [], intent: null },
        materials: {},
        turn_state: {
          current_task: '23 × 14 = ?',
          response_format: '写出竖式与结果',
          student_response: null,
          pending_question: '请先写出竖式的第一步',
        },
      },
      segments: [],
    })
    activate(id, subject, { scope_id: 'scope_s01a', teaching: specialistTeaching('math'), target_title: '两位数乘法' })
  },

  /** S02/S03 adult or unknown-stage new student skeleton (no subject yet until start) */
  adult_new(id) {
    baseProfile(id, '合成成人', { education_stage: 'adult', interests: ['数据分析'] })
    dirs(id, 'task_jobdata')
    emptySubjectFiles(id, 'task_jobdata')
    activate(id, 'task_jobdata', {
      scope_id: 'scope_s02a',
      teaching: generalTeaching,
      target_title: '分析岗位数据',
    })
  },

  unknown_stage_new(id) {
    baseProfile(id, '合成未知阶段', { interests: ['编程入门'] })
    // no grade, no education_stage
    dirs(id, 'task_codeintro')
    emptySubjectFiles(id, 'task_codeintro')
    activate(id, 'task_codeintro', {
      scope_id: 'scope_s03a',
      teaching: generalTeaching,
      target_title: '写一个问候程序',
    })
  },

  /** Math with pending unanswered question */
  math_pending(id, opts = {}) {
    const stage = opts.stage || 'upper_primary'
    const fields = { education_stage: stage, interests: opts.interests || ['积木'] }
    if (opts.grade) {
      fields.grade = opts.grade
      fields.grade_band = opts.grade <= 3 ? 'lower_primary' : 'upper_primary'
    }
    baseProfile(id, opts.name || '合成数学生', fields)
    dirs(id, 'math')
    emptySubjectFiles(id, 'math', {
      domain: 'number',
      levels: { number: 'developing' },
      prefs: { practice: true },
    })
    const mode = opts.mode || 'learn'
    writeJson(out(id, 'math', 'session_log.json'), {
      session_id: opts.session_id || `sess_${id.slice(-4)}_math`,
      entry_point: mode === 'feynman' ? 'learn-feynman' : 'learn',
      started_at: now,
      updated_at: now,
      context: {
        focus: opts.focus || '分数加减',
        mode,
        activity: 'teaching',
        scope_id: opts.scope_id || `scope_${id.slice(-4)}`,
        teaching: specialistTeaching('math'),
        target_context: {
          type: 'topic',
          topic: opts.focus || '分数加减',
          source: 'manual_topic',
          files: [],
          intent: null,
        },
        materials: {},
        turn_state: {
          current_task: opts.task || '1/2 + 1/4 = ?',
          response_format: '写出通分步骤与结果',
          student_response: null,
          pending_question: opts.pending || '先把分母变成一样，你打算怎么做？',
        },
      },
      segments: [],
    })
    activate(id, 'math', {
      scope_id: opts.scope_id || `scope_${id.slice(-4)}`,
      teaching: specialistTeaching('math'),
      target_title: opts.focus || '分数加减',
    })
  },

  /** Empty / support-ready student */
  support_only(id, opts = {}) {
    baseProfile(id, opts.name || '合成支持生', {
      education_stage: opts.stage || 'adult',
      interests: opts.interests || [],
    })
    const subject = opts.subject || 'task_support'
    dirs(id, subject)
    emptySubjectFiles(id, subject)
    writeJson(out(id, subject, 'session_log.json'), {
      session_id: opts.session_id || `sess_${id.slice(-4)}_sup`,
      entry_point: 'learn',
      started_at: now,
      updated_at: now,
      segments: [],
    })
    activate(id, subject, opts.activate || {})
  },

  /** General progress already saved */
  general_saved(id, opts = {}) {
    const subject = opts.subject || 'task_analyze'
    baseProfile(id, opts.name || '合成通用进度', {
      education_stage: opts.stage || 'adult',
      interests: ['职场技能'],
    })
    dirs(id, subject)
    emptySubjectFiles(id, subject)
    const scope = opts.scope_id || 'scope_gen_saved'
    const teaching = generalTeaching
    const mem = JSON.parse(readFileSync(out(id, subject, 'memory.json'), 'utf8'))
    mem.general_progress = [
      {
        session_id: 'sess_prev_gen',
        date: '2026-11-08T10:00:00Z',
        subject,
        scope_id: scope,
        teaching,
        focus: opts.focus || '整理一份岗位数据表',
        strategy_summary: '先列出字段再过滤',
        ability_evidence: [
          { kind: 'independent', observation: '独立列出了三列字段', conditions: '无提示' },
        ],
        next_step: '用真实样例过滤出匹配岗位',
        target_context: {
          type: 'topic',
          topic: opts.focus || '整理一份岗位数据表',
          source: 'manual_topic',
          files: [],
          intent: '分析岗位',
        },
        material_refs: [],
      },
    ]
    writeJson(out(id, subject, 'memory.json'), mem)
    writeJson(out(id, subject, 'current_state.json'), {
      active_focus: opts.focus || '整理一份岗位数据表',
      source: 'session',
      entry_point: 'learn',
      submode: 'learn',
      scope_id: scope,
      teaching,
      last_finalized_session_id: 'sess_prev_gen',
      updated_at: '2026-11-08T10:05:00Z',
    })
    writeJson(out(id, subject, 'session_log.json'), {
      session_id: 'sess_prev_gen',
      entry_point: 'learn',
      started_at: '2026-11-08T09:00:00Z',
      updated_at: '2026-11-08T10:05:00Z',
      segments: [],
    })
    activate(id, subject, { scope_id: scope, teaching, target_title: opts.focus || '整理一份岗位数据表' })
  },
}

const [kind, id, ...rest] = process.argv.slice(2)

function cleanSynth() {
  let removed = 0
  for (const base of ['outputs/students', 'data/students']) {
    const dir = join(ROOT, base)
    if (!existsSync(dir)) continue
    for (const name of readdirSync(dir)) {
      if (!/^stu_synth_[a-z0-9_]+$/.test(name)) continue
      rmSync(join(dir, name), { recursive: true, force: true })
      removed += 1
      console.log('removed', `${base}/${name}`)
    }
  }
  console.log('removed', removed, 'synthetic student dirs under', ROOT)
  const sessionFile = join(ROOT, 'outputs/students/session.json')
  if (existsSync(sessionFile)) {
    const cur = JSON.parse(readFileSync(sessionFile, 'utf8'))
    if (cur.student_id && cur.student_id.startsWith('stu_synth_')) {
      console.log('note: session.json still points at', cur.student_id, '— restore your backup or rerun /learn-start')
    }
  }
}

if (kind === 'clean') {
  cleanSynth()
  process.exit(0)
}

if (!kind || !id || !kinds[kind]) {
  console.error('Usage: node create.mjs <kind> <student_id> [...]\n       node create.mjs clean\nKinds:', Object.keys(kinds).join(', '))
  process.exit(1)
}
if (kind === 'math_pending') {
  const mode = rest[0] || 'learn'
  kinds.math_pending(id, { mode, name: rest[1], stage: rest[2], grade: rest[3] ? Number(rest[3]) : undefined })
} else if (kind === 'support_only') {
  kinds.support_only(id, { subject: rest[0], stage: rest[1], name: rest[2] })
} else if (kind === 'general_saved') {
  kinds.general_saved(id, { subject: rest[0], focus: rest[1] })
} else {
  kinds[kind](id)
}
console.log('created', kind, id, 'session=', existsSync(out('session.json')) ? JSON.parse(readFileSync(out('session.json'), 'utf8')).student_id : null)
