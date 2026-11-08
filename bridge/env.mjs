/**
 * Read the bridge's settings from the same `.env.local` the face uses.
 *
 * The bridge reads JARVIS_* and ELEVENLABS_API_KEY from its environment, which
 * on Windows means `set` lines in every new terminal, or a system dialog most
 * people never find. The installer writes one file instead — `.env.local` in
 * the project folder — and this loads it before anything else reads
 * process.env. Vite already reads the VITE_* lines from that file for the
 * browser; those are skipped here, so nothing meant for the bridge leaks into
 * the page and nothing meant for the page changes the bridge.
 *
 * A variable already set in the shell wins over the file, so a one-off
 * `JARVIS_DEBUG=1 npm run bridge` still works.
 *
 * Imported for its side effect, first, from server.mjs.
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Parse dotenv text: KEY=value, # comments, optional quotes, no expansion. */
export function parseEnv(text) {
  const out = {}
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const m = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line)
    if (!m) continue
    let value = m[2].trim()
    const quote = value[0]
    if ((quote === '"' || quote === "'") && value.endsWith(quote) && value.length >= 2) {
      value = value.slice(1, -1)
    } else {
      // An unquoted value ends at a ` #` comment.
      value = value.replace(/\s+#.*$/, '')
    }
    out[m[1]] = value
  }
  return out
}

/** Copy the bridge's variables from `file` into `env`, never overwriting. */
export function loadBridgeEnv(file = join(ROOT, '.env.local'), env = process.env) {
  let text
  try {
    text = readFileSync(file, 'utf8')
  } catch {
    return [] // no file is the normal case on a fresh clone
  }
  const loaded = []
  for (const [key, value] of Object.entries(parseEnv(text))) {
    if (key.startsWith('VITE_')) continue
    if (env[key] !== undefined) continue
    env[key] = value
    loaded.push(key)
  }
  return loaded
}

const loaded = loadBridgeEnv()
if (loaded.length) {
  console.log(`[jarvis] settings from .env.local: ${loaded.join(', ')}`)
}
