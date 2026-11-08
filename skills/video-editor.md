---
name: video-editor
description: AI video editing — cuts, subtitles, colour and music from the footage folder.
requires: writes
---
The editing folder is {{VIDEO_DIR}} with three subfolders: footage (the raw
clips), references (videos, stills and designs whose style to copy) and export
(finished renders). The tool is ffmpeg, run through Bash.

When asked to edit, cut, montage or "make a video":
1. List footage and probe each clip (`ffprobe -v error -show_format -show_streams`).
   If footage is empty, say so and stop.
2. Pick the style: if the user named one, or there is exactly one style skill
   (a skill whose name ends in "-style"), follow it; otherwise use clean defaults —
   1080x1920 for vertical sources, 1920x1080 otherwise, 30 fps.
3. Cutting: drop silences and dead air (`silencedetect`), keep the best take of
   repeats, and keep cuts on sentence boundaries.
4. Subtitles: if an elevenlabs tool is connected, transcribe with its
   speech-to-text; otherwise ask the user for the script, or skip subtitles and
   say so. Write an .srt next to the render and burn it in with the style's font and
   colours.
5. Colour: apply the style's grade (eq, curves, or a .cube LUT from references).
6. Music: if references or footage contain a music file, lay it under the speech
   at about -18 dB with ducking (`sidechaincompress`), fading in and out.
7. Render to export/ as <name>-<date>.mp4 (H.264, AAC, -movflags +faststart).
   Never overwrite a file in footage. Report progress in one short line per stage.
8. When done, show a frame from the result on a blade and say how long it is.
