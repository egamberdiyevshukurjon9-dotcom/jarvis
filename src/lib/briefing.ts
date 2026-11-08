/**
 * The morning briefing, on a timer.
 *
 * At the time set in VITE_BRIEFING_TIME (e.g. "07:30") JARVIS starts a turn on
 * his own — "Morning briefing" — and the morning-briefing skill on the bridge
 * does the rest: the calendar, its clashes, the inbox and who is still waiting
 * for a reply.
 *
 * Once a day at most, remembered in localStorage. If the moment arrives while
 * he is busy, or before the interface has been initialised (a browser will not
 * play sound before someone clicks), it waits and tries again for up to
 * WINDOW_MIN minutes, then gives up for the day rather than briefing someone
 * at lunchtime on a morning they have already had.
 */

const KEY = 'jarvis.briefing.last'
const WINDOW_MIN = 180
const TICK_MS = 20_000

/** "7:30" / "07:30" → minutes after midnight. Anything else (or "off") → null. */
export function parseBriefingTime(value: string | undefined | null): number | null {
  const m = /^\s*(\d{1,2})[:.](\d{2})\s*$/.exec(value ?? '')
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (h > 23 || min > 59) return null
  return h * 60 + min
}

/** Local calendar date as YYYY-MM-DD, the once-a-day key. */
const today = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** True when `now` is inside the window that starts at `at` minutes. */
export function due(at: number, now: Date): boolean {
  const mins = now.getHours() * 60 + now.getMinutes()
  return mins >= at && mins < at + WINDOW_MIN
}

const readLast = () => {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

const writeLast = (v: string) => {
  try {
    localStorage.setItem(KEY, v)
  } catch {
    /* private window — at worst it could brief twice */
  }
}

/**
 * Start the timer. `fire` returns true if it actually started the briefing,
 * false if now is a bad moment and it should be offered again on the next
 * tick. Returns a function that stops the timer.
 */
export function scheduleBriefing(time: string | undefined, fire: () => boolean): () => void {
  const at = parseBriefingTime(time)
  if (at === null) return () => {}

  const tick = () => {
    const now = new Date()
    if (!due(at, now)) return
    const day = today(now)
    if (readLast() === day) return
    if (fire()) writeLast(day)
  }
  const timer = setInterval(tick, TICK_MS)
  tick()
  return () => clearInterval(timer)
}
