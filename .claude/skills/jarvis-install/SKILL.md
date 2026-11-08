---
name: jarvis-install
description: Install or update the J.A.R.V.I.S. voice assistant on this computer from github.com/egamberdiyevshukurjon9-dotcom/jarvis — tools, packages, ElevenLabs voice, settings, desktop shortcut. Use for "Jarvisni o'rnat", "install jarvis", "shu ovozni ulab ber" with a voice id.
---

# Install J.A.R.V.I.S.

Repository: https://github.com/egamberdiyevshukurjon9-dotcom/jarvis

## Steps
1. **Where.** Use `~/jarvis` unless the user names a folder. If it already holds a
   clone, `git pull --ff-only`; otherwise `git clone` the repository there.
2. **Check tools** and install what is missing:
   - Node.js 20+ (`node -v`) — Windows `winget install OpenJS.NodeJS.LTS`, macOS
     `brew install node`;
   - Git; FFmpeg (for the video skills) — `winget install Gyan.FFmpeg` /
     `brew install ffmpeg`.
3. **Packages:** in the project folder run `npm install` with the environment
   variable `npm_config_onnxruntime_node_install_cuda=skip`.
4. **Settings** go in `.env.local` in the project folder (create it; keep existing
   lines). Ask only for what the user has not given:
   - `ELEVENLABS_API_KEY=` — from https://elevenlabs.io/app/settings/api-keys
     (optional; without it the browser voice is used);
   - voice: `JARVIS_VOICE_ID=` and `VITE_ELEVENLABS_VOICE_ID=` with the same id.
     Presets: George `JBFqnCBsd6RMkjVDRZzb` (default), Daniel `onwK4e9ZLuTAKqWW03F9`,
     Alice `Xb7hH8MSUJpSbSDYk0k2`, Lily `pFZP5JQG7iQjIQuC4Bku`. If the user pastes a
     voice id ("shu ovozni ulab ber"), use it;
   - `JARVIS_ACCOUNT_CONNECTORS=1` so mail, calendar and Stripe connectors from
     claude.ai reach Jarvis;
   - `VITE_BRIEFING_TIME=07:30` (or the time they want, or `off`);
   - `JARVIS_ALLOW_WRITES=1` if they want Jarvis to act (video editing, sites, mail);
   - `JARVIS_VIDEO_DIR=` → `~/Videos/AI Video Editor`, and create `footage`,
     `references`, `export` inside it.
   Never print the API key back.
5. **Shortcut (Windows):** the repo has `start-jarvis.cmd`; create a desktop shortcut
   to it. On macOS/Linux, `npm start` starts it.
6. **Check:** `node scripts/setup.mjs` and report its findings.
7. **Tell the user:** start it (shortcut or `npm start`), open http://localhost:5173
   in Chrome, click INITIALISE, allow the microphone, say "Hey Jarvis". Connect
   Gmail, Google Calendar and Stripe at https://claude.ai/settings/connectors.
