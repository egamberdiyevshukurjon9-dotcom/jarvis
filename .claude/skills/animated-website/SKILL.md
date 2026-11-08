---
name: animated-website
description: Build a single-file animated website or landing page — big hero image, scroll-driven motion, fade-in sections — that opens straight in the browser. Use for "sayt yasab ber", "make a landing page", "build a website with animation".
---

# Animated website

## Steps
1. If the subject is unclear ask one question (what it is for, colours); otherwise
   start.
2. Write one self-contained `index.html` in `./sites/<short-name>/` (or the folder the
   user names): inline CSS and JS, no build step, no external scripts.
3. Motion that carries the page:
   - hero image or illustration that reacts to scroll (parallax, scale, clip-path
     reveal) driven by `requestAnimationFrame` and scroll position;
   - sections that fade/slide in with `IntersectionObserver`;
   - smooth anchors, a sticky minimal nav;
   - `@media (prefers-reduced-motion: reduce)` turns the motion off.
4. Images: use an image-generation tool if one is connected; otherwise CSS gradients
   and inline SVG. Never hotlink other sites' images.
5. Works on a phone: fluid type (`clamp()`), no horizontal scroll, tap targets ≥ 44 px.
6. Open it in the browser (or give the file path) and describe it in one sentence.
   Offer: change colours, add a section, or publish.
