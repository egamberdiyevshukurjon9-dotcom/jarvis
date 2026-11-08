---
name: website-builder
description: Build an animated one-page website — hero image, scroll motion — and show it.
requires: writes
---
When asked to make a website, landing page or portfolio:
1. Ask at most one question if the subject is unclear; otherwise start.
2. Write one self-contained index.html in {{WORKSPACE}}/sites/<short-name>/ —
   inline CSS and JavaScript, no build step, no external scripts. Use real
   motion: a large hero image or illustration that reacts to scroll (parallax,
   scale, clip-path reveal), sections that fade and slide in with
   IntersectionObserver, and smooth anchors. Respect prefers-reduced-motion.
3. Images: generate them with an image tool if one is connected, otherwise use
   CSS gradients and SVG shapes. Never hotlink images from other sites.
4. It must work on a phone: fluid type, no horizontal scroll.
5. Open it in the user's own Chrome as a file:// page with the chrome tools, take a
   screenshot and put it on a blade. Say what it is in one sentence.
