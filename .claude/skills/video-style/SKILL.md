---
name: video-style
description: Learn a visual editing style from reference videos/images and save it as a reusable "<name>-style" Claude skill that the AI video editor follows. Use for "stil skill yarat", "learn my style", "make a style skill from references".
---

# Video style → skill

Analyse the user's reference material and save the style as a new skill, so every
later edit looks the same.

## Steps
1. Read from `references/` in the AI Video Editor folder (default
   `~/Videos/AI Video Editor/references`) or the folder the user names.
2. For each video, pull a frame every 2–3 s with FFmpeg
   (`ffmpeg -i in.mp4 -vf fps=1/2,scale=640:-1 frames/%03d.jpg`) and look at them;
   read stills directly.
3. **Measure, don't guess:**
   - resolution, aspect ratio, fps (`ffprobe`)
   - average shot length — count cuts with `select='gt(scene,0.3)',showinfo`
   - main colours as hex — `palettegen` on sampled frames
   - subtitles: present?, font style (bold sans, serif…), size relative to height,
     position, colour, outline/box, words per line
   - transitions (hard cut, zoom, whip, fade), text animations, B-roll ratio
   - music: present?, energy, level under speech
4. Pick a short name with the user (e.g. `reels`). Write
   `~/.claude/skills/<name>-style/SKILL.md`:
   - front matter: `name: <name>-style`, `description: Editing style "<name>" — use
     with the AI video editor when the user asks for this style.`
   - body: concrete numbers only — resolution, fps, cut pace, colour grade (FFmpeg
     filter string), subtitle font/size/colours/position, transitions, music level.
5. Show the summary (frames analysed, cut pace, swatches, fonts) and ask the user to
   check it. Tell them it is used from the next Claude session.
