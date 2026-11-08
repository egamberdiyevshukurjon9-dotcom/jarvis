/**
 * Skills: short, named procedures JARVIS follows when a request matches one.
 *
 * A skill is a Markdown file with a small front-matter block:
 *
 *   ---
 *   name: morning-briefing
 *   description: Tomorrow's calendar, the inbox, and what is still unanswered.
 *   requires: connectors          # optional: connectors | writes
 *   ---
 *   The procedure, in plain sentences.
 *
 * They come from two folders:
 *   - skills/ in this project — the ones that ship with JARVIS;
 *   - skills/ inside JARVIS's workspace (~/.jarvis/workspace/skills) — the
 *     user's own, including the style skills the video editor writes. A file
 *     there with the same name as a built-in one replaces it.
 *
 * Every skill becomes part of the system prompt, so it costs input tokens on
 * every turn. That is why each one is capped in size and in number, and why
 * JARVIS_SKILLS can narrow the list ("none" turns them all off).
 *
 * They are read when a browser connects, not once at boot, so a skill JARVIS
 * has just written is in use from the next session without a restart.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

export const MAX_SKILL_BYTES = 6 * 1024
export const MAX_SKILLS = 24

/** Split `---` front matter from the body. Unknown keys are kept, unused. */
export function parseSkill(text, fallbackName = 'skill') {
  const meta = {}
  let body = text.replace(/^﻿/, '')
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(body)
  if (m) {
    for (const line of m[1].split(/\r?\n/)) {
      const kv = /^([A-Za-z_-]+)\s*:\s*(.*)$/.exec(line.trim())
      if (!kv) continue
      let value = kv[2].replace(/\s+#.*$/, '').trim()
      if (/^(["']).*\1$/.test(value)) value = value.slice(1, -1)
      meta[kv[1].toLowerCase()] = value
    }
    body = body.slice(m[0].length)
  }
  const name = (meta.name || fallbackName).toLowerCase().replace(/[^a-z0-9-]+/g, '-')
  const requires = (meta.requires || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  return {
    name,
    description: meta.description || '',
    requires,
    body: body.trim(),
  }
}

/** Every *.md skill in one folder, oversize files skipped. Missing folder = []. */
export function readSkillDir(dir, source) {
  let names
  try {
    names = readdirSync(dir)
  } catch {
    return []
  }
  const out = []
  for (const file of names.sort()) {
    if (!file.toLowerCase().endsWith('.md') || file.toLowerCase() === 'readme.md') continue
    const path = join(dir, file)
    try {
      const st = statSync(path)
      if (!st.isFile()) continue
      if (st.size > MAX_SKILL_BYTES) {
        console.warn(`[jarvis] skill ${file} is over ${MAX_SKILL_BYTES} bytes; skipped`)
        continue
      }
      const skill = parseSkill(readFileSync(path, 'utf8'), file.replace(/(\.skill)?\.md$/i, ''))
      if (skill.body) out.push({ ...skill, source })
    } catch {
      /* unreadable — leave it out */
    }
  }
  return out
}

/**
 * The skills in force: built-ins, overridden by the user's own of the same
 * name, filtered by JARVIS_SKILLS.
 */
export function loadSkills({ builtinDir, userDir, only = process.env.JARVIS_SKILLS } = {}) {
  const byName = new Map()
  for (const s of readSkillDir(builtinDir, 'builtin')) byName.set(s.name, s)
  for (const s of readSkillDir(userDir, 'user')) byName.set(s.name, s)

  let skills = [...byName.values()]
  const wanted = (only ?? '').trim().toLowerCase()
  if (wanted === 'none') return []
  if (wanted) {
    const set = new Set(wanted.split(',').map((s) => s.trim()).filter(Boolean))
    skills = skills.filter((s) => set.has(s.name))
  }
  return skills.slice(0, MAX_SKILLS)
}

/**
 * The prompt section. A skill that needs write access says so up front when
 * writes are off, so JARVIS states the constraint once instead of failing
 * halfway through a procedure.
 */
export function skillsPrompt(
  skills,
  { allowWrites = false, accountConnectors = false, vars = {} } = {},
) {
  if (!skills.length) return ''
  // {{NAME}} placeholders, so a skill can name a folder that differs per machine.
  const fill = (text) =>
    text.replace(/\{\{([A-Z_]+)\}\}/g, (all, key) => (key in vars ? String(vars[key]) : all))
  const parts = skills.map((s) => {
    const notes = []
    if (s.requires.includes('writes') && !allowWrites) {
      notes.push(
        'Write access is off on this machine, so the steps that create, send or change ' +
          'anything are unavailable; do the reading steps and say once that the rest needs write access.',
      )
    }
    if (s.requires.includes('connectors') && !accountConnectors) {
      notes.push(
        'Mail, calendar and payment connectors are not switched on for JARVIS; if no tool ' +
          'for them is present, say so in one sentence.',
      )
    }
    const desc = s.description ? ` — ${s.description}` : ''
    return `### ${s.name}${desc}\n${notes.length ? notes.join(' ') + '\n' : ''}${fill(s.body)}`
  })
  return (
    `Skills — procedures you follow when a request matches one. They describe what to ` +
    `do, not what to say: everything above about length and register still applies, ` +
    `and detail goes on a blade, not into speech.\n\n${parts.join('\n\n')}\n\n`
  )
}
