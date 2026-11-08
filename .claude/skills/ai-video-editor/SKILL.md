---
name: ai-video-editor
description: Edit videos with FFmpeg from an "AI Video Editor" folder (footage / references / export) — cut silences, add subtitles, colour grade and music, render a finished video. Use for "montaj qil", "edit my footage", "make a reel", "cut this video".
---

# AI video editor

Turns raw clips into a finished video with FFmpeg, following the user's style skill
if they have one.

## Folder
Default: `~/Videos/AI Video Editor` (Windows: `%USERPROFILE%\Videos\AI Video Editor`)
with three subfolders — create them if missing:
- `footage/` — raw clips (never modify or overwrite these)
- `references/` — videos, stills, designs, music, `.cube` LUTs to copy the style from
- `export/` — finished renders

If the user names another folder, use that. Check `ffmpeg -version` first; if FFmpeg
is missing, tell them: Windows `winget install Gyan.FFmpeg`, macOS
`brew install ffmpeg`, Linux `sudo apt install ffmpeg`.

## Steps
1. **Inspect.** List `footage/` and run `ffprobe -v error -show_format -show_streams`
   on each clip. If it is empty, say so and stop.
2. **Style.** If a skill named `*-style` exists (see the video-style skill) or the user
   names one, follow its numbers. Otherwise: 1080x1920 for vertical sources,
   1920x1080 otherwise, 30 fps, cuts every 2–4 s, white bold subtitles with a dark
   outline at the lower third.
3. **Cut.** Find silences with `silencedetect=noise=-35dB:d=0.4`, drop dead air, keep
   the best take of repeated lines, cut on sentence boundaries. Build an edit list and
   show it before rendering a long video.
4. **Subtitles.** Transcribe with any speech-to-text tool available (ElevenLabs,
   Whisper). If none, ask the user for the script or skip subtitles and say so. Write
   an `.srt` next to the render and burn it in with the style's font and colours.
5. **Colour.** Apply the style's grade: `eq`, `curves`, or `lut3d` with a `.cube` from
   `references/`.
6. **Music.** If there is a music file in `references/` or `footage/`, lay it under the
   speech at about -18 dB with ducking (`sidechaincompress`), fade in and out.
7. **Render** to `export/<name>-<YYYY-MM-DD>.mp4` — H.264 (`-crf 20 -preset medium`),
   AAC 192k, `-movflags +faststart`.
8. **Report** length, resolution, file path, and what was cut, in a few lines.
   Show progress per stage: cutting, subtitles, colour, music, render.
