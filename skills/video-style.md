---
name: video-style
description: Learn a visual style from the references folder and save it as a reusable style skill.
requires: writes
---
When asked to learn, copy or save a style ("make a style skill from my references"):
1. Look through {{VIDEO_DIR}}/references. For videos, pull a frame every few
   seconds with ffmpeg and `Read` them; for stills, read them directly.
2. Measure, do not guess: frame size and rate, average shot length (use the
   `scene` filter to count cuts), the main colours as hex (`palettegen`), whether
   subtitles appear and their font style, size, position and colour, transitions,
   and whether music is present.
3. Write a style skill file to {{USER_SKILLS}}/<short-name>-style.md with front
   matter (name: <short-name>-style, description, requires: writes) and a body of
   concrete numbers the editor can apply: resolution, fps, cut pace, colour grade,
   subtitle font and colours, transition, music level.
4. Show the summary on a blade (frames counted, colours as swatches, fonts) and
   ask the user to check it. It is used from the next session onwards.
