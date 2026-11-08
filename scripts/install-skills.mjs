#!/usr/bin/env node
/**
 * Copy the Claude skills in .claude/skills/ into ~/.claude/skills/, so Claude
 * Code (the terminal, the desktop app and the IDE extensions) can use them in
 * every folder, not only inside this project.  `npm run skills`
 *
 * Only the skill folders shipped here are written; any other skill you have
 * is left alone. Re-running updates them to this version.
 */

import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const from = join(dirname(fileURLToPath(import.meta.url)), '..', '.claude', 'skills')
const to = join(process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude'), 'skills')

mkdirSync(to, { recursive: true })
const names = readdirSync(from, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(from, d.name, 'SKILL.md')))
  .map((d) => d.name)

for (const name of names) {
  cpSync(join(from, name), join(to, name), { recursive: true, force: true })
  console.log(`  [ok] ${name}`)
}
console.log(`\n${names.length} ta skill o'rnatildi: ${to}`)
console.log("Claude Code'ni qayta oching va /skills deb yozing — ro'yxatda ko'rinadi.\n")
