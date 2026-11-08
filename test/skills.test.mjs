import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadSkills, parseSkill, skillsPrompt, MAX_SKILL_BYTES } from '../bridge/skills.mjs'
import { loadBridgeEnv, parseEnv } from '../bridge/env.mjs'

const builtinDir = join(import.meta.dirname, '..', 'skills')

test('every shipped skill parses with a name, a description and a body', () => {
  const skills = loadSkills({ builtinDir, userDir: null, only: '' })
  const names = skills.map((s) => s.name).sort()
  for (const want of [
    'calendar',
    'inbox',
    'morning-briefing',
    'revenue',
    'video-editor',
    'video-style',
    'website-builder',
  ]) {
    assert.ok(names.includes(want), `missing skill ${want}`)
  }
  for (const s of skills) {
    assert.ok(s.description.length > 10, `${s.name} needs a description`)
    assert.ok(!s.description.startsWith('"'), `${s.name} description kept its quotes`)
    assert.ok(s.body.length > 50, `${s.name} needs a body`)
  }
})

test('front matter is optional and the file name stands in for the name', () => {
  const s = parseSkill('Just do the thing.', 'My Thing')
  assert.equal(s.name, 'my-thing')
  assert.deepEqual(s.requires, [])
  assert.equal(s.body, 'Just do the thing.')
})

test('a user skill overrides a built-in one of the same name, and oversize ones are skipped', () => {
  const userDir = mkdtempSync(join(tmpdir(), 'jarvis-skills-'))
  writeFileSync(join(userDir, 'inbox.md'), '---\nname: inbox\ndescription: mine\n---\nMy inbox rules.')
  writeFileSync(join(userDir, 'reels-style.skill.md'), 'Cut every 1.5 s.')
  writeFileSync(join(userDir, 'huge.md'), 'x'.repeat(MAX_SKILL_BYTES + 1))
  const skills = loadSkills({ builtinDir, userDir, only: '' })
  const inbox = skills.find((s) => s.name === 'inbox')
  assert.equal(inbox.source, 'user')
  assert.equal(inbox.body, 'My inbox rules.')
  assert.ok(skills.some((s) => s.name === 'reels-style'))
  assert.ok(!skills.some((s) => s.name === 'huge'))
})

test('JARVIS_SKILLS narrows the list, and "none" turns skills off', () => {
  assert.deepEqual(
    loadSkills({ builtinDir, userDir: null, only: 'inbox, calendar' }).map((s) => s.name).sort(),
    ['calendar', 'inbox'],
  )
  assert.deepEqual(loadSkills({ builtinDir, userDir: null, only: 'none' }), [])
  assert.equal(skillsPrompt([]), '')
})

test('the prompt fills placeholders and flags what is switched off', () => {
  const skills = loadSkills({ builtinDir, userDir: null, only: 'video-editor,inbox' })
  const off = skillsPrompt(skills, { vars: { VIDEO_DIR: '/v' } })
  assert.match(off, /folder is \/v with/)
  assert.doesNotMatch(off, /\{\{VIDEO_DIR\}\}/)
  assert.match(off, /Write access is off/)
  assert.match(off, /connectors are not switched on/)
  const on = skillsPrompt(skills, { allowWrites: true, accountConnectors: true, vars: {} })
  assert.doesNotMatch(on, /Write access is off/)
  assert.doesNotMatch(on, /connectors are not switched on/)
})

test('.env.local feeds the bridge without overriding the shell or taking VITE_ lines', () => {
  assert.deepEqual(
    parseEnv('# c\nA=1\nexport B = "two words"\nC=x # note\nD=\'q\'\nbad line\n'),
    { A: '1', B: 'two words', C: 'x', D: 'q' },
  )
  const dir = mkdtempSync(join(tmpdir(), 'jarvis-env-'))
  const file = join(dir, '.env.local')
  writeFileSync(file, 'JARVIS_X=file\nJARVIS_Y=file\nVITE_Z=browser\r\n')
  const env = { JARVIS_Y: 'shell' }
  const loaded = loadBridgeEnv(file, env)
  assert.deepEqual(loaded, ['JARVIS_X'])
  assert.deepEqual(env, { JARVIS_X: 'file', JARVIS_Y: 'shell' })
  assert.deepEqual(loadBridgeEnv(join(dir, 'missing'), {}), [])
})

test('the setup wizard updates its own lines and leaves the rest of .env.local alone', async () => {
  const { mergeEnv, VOICES } = await import('../scripts/configure.mjs')
  const before = '# my notes\nJARVIS_DEBUG=1\n# JARVIS_VOICE_ID=old\nVITE_BRIEFING_TIME=06:00\n'
  const after = mergeEnv(before, { JARVIS_VOICE_ID: 'v', VITE_BRIEFING_TIME: '07:30', JARVIS_ALLOW_WRITES: '1' })
  assert.deepEqual(parseEnv(after), {
    JARVIS_DEBUG: '1',
    JARVIS_VOICE_ID: 'v',
    VITE_BRIEFING_TIME: '07:30',
    JARVIS_ALLOW_WRITES: '1',
  })
  assert.match(after, /^# my notes$/m)
  assert.equal(mergeEnv(after, { JARVIS_VOICE_ID: 'v' }), after)
  assert.ok(VOICES.every((v) => /^[A-Za-z0-9]{20}$/.test(v.id)))
})

test('every Claude skill in .claude/skills has a valid SKILL.md', async () => {
  const { readdirSync, readFileSync } = await import('node:fs')
  const dir = join(import.meta.dirname, '..', '.claude', 'skills')
  const names = readdirSync(dir)
  assert.ok(names.length >= 5)
  for (const name of names) {
    const s = parseSkill(readFileSync(join(dir, name, 'SKILL.md'), 'utf8'))
    assert.equal(s.name, name, `${name}: front-matter name must match the folder`)
    assert.ok(s.description.length > 40 && s.description.length < 1024, `${name}: description`)
  }
})
