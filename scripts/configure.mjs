#!/usr/bin/env node
/**
 * JARVIS setup wizard — `npm run configure`.
 *
 * Asks a handful of questions and writes the answers to `.env.local`, which
 * both halves read: Vite takes the VITE_* lines for the browser, and
 * bridge/env.mjs takes the rest for the bridge. Run it again any time to
 * change an answer; lines it does not manage are left exactly as they were.
 *
 * Messages are in Uzbek (Latin script, which every Windows console shows
 * correctly) with the English in brackets where a term matters.
 *
 *   node scripts/configure.mjs          ask
 *   node scripts/configure.mjs --yes    accept every default, ask nothing
 */

import { createInterface } from 'node:readline/promises'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseEnv } from '../bridge/env.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const FILE = join(ROOT, '.env.local')
const auto = process.argv.includes('--yes') || !process.stdin.isTTY

/** ElevenLabs' premade voices, the ones shown in the setup video. */
export const VOICES = [
  { name: 'George', id: 'JBFqnCBsd6RMkjVDRZzb', about: 'britan, iliq hikoyachi (warm British narrator) — Jarvisga eng mos' },
  { name: 'Daniel', id: 'onwK4e9ZLuTAKqWW03F9', about: 'britan, chuqur boshlovchi ovoz (deep British newsreader)' },
  { name: 'Alice', id: 'Xb7hH8MSUJpSbSDYk0k2', about: 'britan, aniq ayol ovozi (clear British female)' },
  { name: 'Lily', id: 'pFZP5JQG7iQjIQuC4Bku', about: 'britan, mayin ayol ovozi (soft British female)' },
]

/** Replace or append KEY=value lines, keeping everything else in the file. */
export function mergeEnv(text, updates) {
  const lines = text ? text.split(/\r?\n/) : []
  const done = new Set()
  const out = lines.map((line) => {
    const m = /^\s*#?\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(line)
    if (!m || !(m[1] in updates) || done.has(m[1])) return line
    // Only take over a commented-out line if it is the template's own example.
    if (/^\s*#/.test(line) && !/^\s*#\s*[A-Z_]+=/.test(line)) return line
    done.add(m[1])
    return `${m[1]}=${updates[m[1]]}`
  })
  const added = Object.keys(updates).filter((k) => !done.has(k))
  if (added.length) {
    if (out.length && out[out.length - 1] !== '') out.push('')
    out.push('# --- written by npm run configure ---')
    for (const k of added) out.push(`${k}=${updates[k]}`)
  }
  return out.join('\n').replace(/\n*$/, '\n')
}

function defaultVideoDir() {
  return join(homedir(), 'Videos', 'AI Video Editor')
}

async function main() {
  const current = existsSync(FILE) ? readFileSync(FILE, 'utf8') : ''
  const have = parseEnv(current)
  const rl = auto ? null : createInterface({ input: process.stdin, output: process.stdout })

  const ask = async (question, fallback = '') => {
    if (!rl) return fallback
    const shown = fallback ? ` [${fallback}]` : ''
    const answer = (await rl.question(`${question}${shown}: `)).trim()
    return answer || fallback
  }
  const yes = async (question, fallback) => {
    const a = (await ask(`${question} (ha/yo'q)`, fallback ? 'ha' : "yo'q")).toLowerCase()
    return /^(h|ha|y|yes|да|ҳа|xa)/.test(a)
  }

  console.log('\nJ.A.R.V.I.S. — sozlash (setup)\n------------------------------')
  console.log('Har bir savolda Enter bossangiz, qavs ichidagi qiymat olinadi.\n')

  // 1. ElevenLabs
  console.log('1) Ovoz. ElevenLabs kaliti (API key) Jarvisga chiroyli ovoz beradi.')
  console.log('   Kalit olish: https://elevenlabs.io/app/settings/api-keys  ->  "Create API key".')
  console.log("   Kalitsiz ham ishlaydi (brauzer ovozi). O'tkazib yuborish uchun Enter.")
  const key = await ask('   ElevenLabs API key', have.ELEVENLABS_API_KEY ?? '')

  // 2. Voice
  console.log('\n2) Qaysi ovoz?')
  VOICES.forEach((v, i) => console.log(`   ${i + 1}. ${v.name} — ${v.about}`))
  console.log(`   ${VOICES.length + 1}. Boshqa — ElevenLabs Voice Library'dan o'z ovoz ID'ingiz`)
  const currentVoice = have.JARVIS_VOICE_ID ?? VOICES[0].id
  const currentIndex = VOICES.findIndex((v) => v.id === currentVoice)
  const pick = await ask('   Raqam', String(currentIndex >= 0 ? currentIndex + 1 : VOICES.length + 1))
  let voiceId = VOICES[Number(pick) - 1]?.id
  if (!voiceId) voiceId = (await ask('   Voice ID', currentVoice)).replace(/[^A-Za-z0-9]/g, '') || VOICES[0].id

  // 3. Mail / calendar / revenue
  console.log('\n3) Pochta, kalendar, savdo (Gmail, Google Calendar, Stripe...).')
  console.log('   Ular claude.ai hisobingizga ulanadi: https://claude.ai/settings/connectors')
  console.log("   Ulanmasa ham Jarvis ularni Chrome'dagi ochiq sahifalardan o'qiy oladi.")
  const connectors = await yes('   Hisobingizdagi ulagichlar (connectors) Jarvisga berilsinmi?', have.JARVIS_ACCOUNT_CONNECTORS !== '0')

  // 4. Morning briefing
  console.log('\n4) Ertalabki xulosa (morning briefing): kalendar, xatlar, javobsiz qolganlar.')
  const briefing = await ask("   Soat nechada? (masalan 07:30, o'chirish uchun off)", have.VITE_BRIEFING_TIME || '07:30')

  // 5. Writes
  console.log("\n5) Harakatlar (actions): video montaj, sayt yasash, fayl yozish, xat yuborish.")
  console.log("   O'chiq bo'lsa Jarvis faqat o'qiydi va ko'rsatadi, hech narsani o'zgartirmaydi.")
  const writes = await yes('   Harakatlarga ruxsat berilsinmi?', have.JARVIS_ALLOW_WRITES !== '0')

  // 6. Video editor folder
  console.log('\n6) AI Video Editor papkasi (footage, references, export).')
  const videoDir = await ask('   Papka', have.JARVIS_VIDEO_DIR || defaultVideoDir())
  rl?.close()

  for (const sub of ['footage', 'references', 'export']) {
    try {
      mkdirSync(join(videoDir, sub), { recursive: true })
    } catch (err) {
      console.warn(`   papkani yaratib bo'lmadi: ${join(videoDir, sub)} (${err.message})`)
    }
  }
  mkdirSync(join(homedir(), '.jarvis', 'workspace', 'skills'), { recursive: true })

  const briefingValue = /^\s*off\s*$/i.test(briefing) ? 'off' : briefing.trim()
  const updates = {
    JARVIS_VOICE_ID: voiceId,
    VITE_ELEVENLABS_VOICE_ID: voiceId,
    JARVIS_ACCOUNT_CONNECTORS: connectors ? '1' : '0',
    JARVIS_ALLOW_WRITES: writes ? '1' : '0',
    JARVIS_VIDEO_DIR: videoDir,
    VITE_BRIEFING_TIME: briefingValue,
  }
  if (key) updates.ELEVENLABS_API_KEY = key
  writeFileSync(FILE, mergeEnv(current, updates))

  console.log('\nSaqlandi: .env.local')
  console.log(`  ovoz          ${VOICES.find((v) => v.id === voiceId)?.name ?? voiceId}${key ? '' : " (kalit yo'q — brauzer ovozi)"}`)
  console.log(`  ulagichlar    ${connectors ? 'yoqilgan' : "o'chiq"}`)
  console.log(`  ertalabki     ${briefingValue}`)
  console.log(`  harakatlar    ${writes ? 'ruxsat berilgan' : "o'chiq (faqat o'qish)"}`)
  console.log(`  video papka   ${videoDir}`)
  console.log('\nIshga tushirish: npm start  (yoki ish stolidagi JARVIS yorlig\'i)\n')
}

const same = (a, b) =>
  process.platform === 'win32' ? resolve(a).toLowerCase() === resolve(b).toLowerCase() : resolve(a) === resolve(b)

if (process.argv[1] && same(fileURLToPath(import.meta.url), process.argv[1])) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
