/* Жарвис Голо Лаб · қўл бошқаруви
   Adds hand-gesture control (MediaPipe Hands), an X-ray view and "go inside" to a 3D scene page.
   The scene exposes window.__golo = { THREE, scene, camera, controls, canvas, FOCI, ORDER, setFocus, poke, focus }.
   Gestures: move an open hand (or a pinch) = rotate, fist = move, two hands apart/together = zoom in (inside)/out,
   quick pinch over a button = press it. */
(() => {
  'use strict';
  const HANDS_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/';
  const HC = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const d2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const IN_VIEWER = !!(window.claude && typeof window.claude.use === 'function');
  const MOBILE = matchMedia('(pointer: coarse)').matches;

  /* ---------- UI ---------- */
  const css = `
  #gh{position:fixed;z-index:60;left:50%;transform:translateX(-50%);top:calc(10px + env(safe-area-inset-top,0px));display:flex;gap:6px;flex-wrap:wrap;justify-content:center;
    max-width:calc(100vw - 24px);padding:6px;border-radius:14px;background:rgba(4,16,27,.82);border:1px solid rgba(111,228,255,.35);
    backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);font:600 12px/1 system-ui,-apple-system,"Segoe UI",sans-serif;color:#dff7ff;box-shadow:0 6px 24px rgba(0,0,0,.25)}
  #gh button,#gh a{appearance:none;border:1px solid rgba(111,228,255,.4);background:transparent;color:inherit;font:inherit;padding:8px 11px;border-radius:9px;cursor:pointer;text-decoration:none;white-space:nowrap}
  #gh button:hover,#gh a:hover{background:rgba(111,228,255,.12)}
  #gh button[aria-pressed="true"]{background:#6fe4ff;color:#02101b;border-color:#6fe4ff}
  #gh .cam[aria-pressed="true"]{background:#ffb547;border-color:#ffb547}
  #gh .min{display:none}
  #ghTip{position:fixed;z-index:60;left:50%;transform:translateX(-50%);top:calc(64px + env(safe-area-inset-top,0px));max-width:min(560px,calc(100vw - 24px));
    padding:8px 12px;border-radius:10px;background:rgba(4,16,27,.88);color:#dff7ff;font:13px/1.45 system-ui,sans-serif;text-align:center;opacity:0;transition:opacity .3s;pointer-events:none}
  #ghTip.show{opacity:1}
  #ghFx{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:59}
  #ghVid{position:fixed;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none;z-index:-1}
  @media (max-width:720px){#gh{top:auto;bottom:calc(8px + env(safe-area-inset-bottom,0px));flex-wrap:nowrap;gap:3px;padding:4px}#gh button,#gh a{padding:8px 9px;font-size:13px}#gh .lbl{display:none}#gh .min{display:inline}#ghTip{top:auto;bottom:calc(64px + env(safe-area-inset-bottom,0px))}}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const bar = document.createElement('div'); bar.id = 'gh'; bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', 'Жарвис қўл бошқаруви');
  bar.innerHTML = `
    <a id="ghBack" href="../">← <span class="lbl">Голо Лаб</span></a>
    <button type="button" class="cam" id="ghCam" aria-pressed="false">✋ <span class="lbl">Қўл бошқаруви</span></button>
    <button type="button" id="ghIn" title="Ичига кириш">⤓ <span class="lbl">Ичига</span></button>
    <button type="button" id="ghOut" title="Ташқарига чиқиш">⤒ <span class="lbl">Ташқарига</span></button>
    <button type="button" id="ghX" aria-pressed="false" title="Рентген: деворлар шаффоф">◎ <span class="lbl">Рентген</span></button>
    <button type="button" id="ghPrev" title="Олдинги кўриниш">‹</button>
    <button type="button" id="ghNext" title="Кейинги кўриниш">›</button>
    <button type="button" id="ghHelp" title="Ишоралар">?</button>`;
  document.body.appendChild(bar);
  const tip = document.createElement('div'); tip.id = 'ghTip'; tip.setAttribute('role', 'status'); document.body.appendChild(tip);
  const fx = document.createElement('canvas'); fx.id = 'ghFx'; document.body.appendChild(fx);
  const g = fx.getContext('2d');
  const $ = id => document.getElementById(id);
  let tipT = 0;
  function say(t, ms = 3800) { tip.textContent = t; tip.classList.add('show'); clearTimeout(tipT); tipT = setTimeout(() => tip.classList.remove('show'), ms); }
  $('ghBack').addEventListener('click', e => {
    try { if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) { e.preventDefault(); history.back(); } } catch (_) { }
  });

  /* ---------- scene access ---------- */
  let S = window.__golo || null;
  const base = { min: null };
  function ready() { return !!(S && S.camera && S.controls); }
  addEventListener('golo-ready', () => { S = window.__golo; base.min = S.controls.minDistance; });
  if (S) base.min = S.controls.minDistance;
  const sph = () => { const off = S.camera.position.clone().sub(S.controls.target); return new S.THREE.Spherical().setFromVector3(off); };
  function setSph(s) {
    const off = new S.THREE.Vector3().setFromSpherical(s);
    S.camera.position.copy(S.controls.target).add(off); S.camera.lookAt(S.controls.target);
  }
  function orbit(dx, dy) {
    if (!ready()) return; S.poke(); const s = sph();
    s.theta -= dx * .008; s.phi = clamp(s.phi - dy * .006, .05, S.controls.maxPolarAngle || Math.PI - .05); setSph(s);
  }
  function dollyTo(r) {
    if (!ready()) return; S.poke(); const s = sph();
    s.radius = clamp(r, S.controls.minDistance, S.controls.maxDistance); setSph(s);
  }
  function pan(dx, dy) {
    if (!ready()) return; S.poke();
    const s = sph(), k = s.radius * .0016, V = S.THREE.Vector3;
    const right = new V().setFromMatrixColumn(S.camera.matrix, 0), up = new V().setFromMatrixColumn(S.camera.matrix, 1);
    const mv = right.multiplyScalar(-dx * k).add(up.multiplyScalar(dy * k));
    S.controls.target.add(mv); S.camera.position.add(mv);
  }
  /* smooth "go inside" / "come out" */
  let anim = null;
  function glide(factor) {
    if (!ready()) return;
    if (factor < 1) S.controls.minDistance = Math.max(.02, (base.min ?? S.controls.minDistance) * .12);
    const r0 = sph().radius, r1 = clamp(r0 * factor, S.controls.minDistance, S.controls.maxDistance), t0 = performance.now();
    anim = () => { const u = clamp((performance.now() - t0) / 900, 0, 1), e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; dollyTo(r0 + (r1 - r0) * e); if (u >= 1) anim = null; };
  }
  $('ghIn').addEventListener('click', () => { glide(.4); say('Ичкарига кирдим. Яна босинг — янада чуқурроқ. Рентген деворларни шаффоф қилади.'); });
  $('ghOut').addEventListener('click', () => { glide(2.4); if (base.min != null) setTimeout(() => { if (S && sph().radius > base.min) S.controls.minDistance = base.min; }, 950); });
  function stepFocus(k) {
    if (!ready() || !S.ORDER) return; S.poke();
    const i = S.ORDER.indexOf(S.focus), n = S.ORDER.length, key = S.ORDER[((i < 0 ? 0 : i) + k + n) % n];
    S.setFocus(key); say(S.FOCI[key]?.label || key, 1800);
  }
  $('ghPrev').addEventListener('click', () => stepFocus(-1));
  $('ghNext').addEventListener('click', () => stepFocus(1));

  /* X-ray: every surface becomes see-through so the inside is visible */
  const saved = new Map(); let xray = false;
  function setXray(on) {
    if (!ready()) return; xray = on; $('ghX').setAttribute('aria-pressed', String(on));
    S.scene.traverse(o => {
      if (!o.isMesh || !o.material) return;
      (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
        if (on) { if (!saved.has(m)) saved.set(m, { t: m.transparent, o: m.opacity, d: m.depthWrite }); m.transparent = true; m.opacity = Math.min(m.opacity, .22); m.depthWrite = false; }
        else { const s = saved.get(m); if (s) { m.transparent = s.t; m.opacity = s.o; m.depthWrite = s.d; } }
        m.needsUpdate = true;
      });
    });
    if (!on) saved.clear();
    say(on ? 'Рентген ёқилди: ички қисмлар кўринади.' : 'Рентген ўчирилди.', 2200);
  }
  $('ghX').addEventListener('click', () => setXray(!xray));
  $('ghHelp').addEventListener('click', () => say('Камерани ёқинг ва кафтингизни кўрсатинг. Кафтни камерага яқинлаштирсангиз — лойиҳа катталашади ва ичига киради, узоқлаштирсангиз — кичраяди. Кафтни ён томонга юргизсангиз — айланади. Мушт қилиб юргизсангиз — силжийди (муштни очгач қайтадан яқинлаштириш мумкин). Икки қўлни узоқлаштириш ҳам катталаштиради. Тугма устида тез чимдиш — уни босиш. Рентген ва ‹ › тугмалари ҳам бор.', 9000));

  /* ---------- camera + hands ---------- */
  let hands = null, handsReady = false, busy = false, stream = null, video = null, tracked = [], lastAt = 0, hid = 0, camOn = false;
  function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.crossOrigin = 'anonymous'; s.onload = res; s.onerror = () => rej(new Error('script')); document.head.appendChild(s); }); }
  async function camStart() {
    const b = $('ghCam');
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('nomedia');
      stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: MOBILE ? 640 : 960 }, height: { ideal: MOBILE ? 480 : 540 }, facingMode: 'user' }, audio: false });
    } catch (e) {
      say(IN_VIEWER ? 'Claude ичида камера ёпиқ. Қўл бошқаруви учун саҳифани браузерда (GitHub Pages) очинг. Тугмалар бу ерда ҳам ишлайди.' : 'Камерага рухсат берилмади. Манзил сатридаги камера белгисидан рухсат беринг.', 8000);
      return;
    }
    video = document.createElement('video'); video.id = 'ghVid'; video.playsInline = true; video.muted = true; video.srcObject = stream; document.body.appendChild(video);
    try { await video.play(); } catch (_) { }
    camOn = true; b.setAttribute('aria-pressed', 'true'); say('Қўл таниш модели юкланмоқда…', 6000);
    try {
      if (!window.Hands) await loadScript(HANDS_BASE + 'hands.js');
      if (!hands) {
        hands = new window.Hands({ locateFile: f => HANDS_BASE + f });
        hands.setOptions({ maxNumHands: 2, modelComplexity: MOBILE ? 0 : 1, minDetectionConfidence: .6, minTrackingConfidence: .5, selfieMode: false });
        hands.onResults(onHands); await hands.initialize();
      }
      handsReady = true; say('Тайёр! Қўлингизни кўрсатинг. Чимдиб суриб айлантиринг.', 5000);
    } catch (e) { say('Қўл таниш модели юкланмади. Интернетни текширинг.', 6000); }
  }
  function camStop() {
    $('ghCam').querySelector('.lbl').textContent = 'Қўл бошқаруви';
    camOn = false; stream?.getTracks().forEach(t => t.stop()); stream = null; video?.remove(); video = null; tracked = [];
    $('ghCam').setAttribute('aria-pressed', 'false');
  }
  $('ghCam').addEventListener('click', () => camOn ? camStop() : camStart());
  try { if (new URLSearchParams(location.search).get('hand') === '1' && !IN_VIEWER) setTimeout(camStart, 600); } catch (_) { }

  const toScreen = p => ({ x: (1 - p.x) * innerWidth, y: p.y * innerHeight });
  function onHands(res) {
    lastAt = performance.now();
    const fresh = (res.multiHandLandmarks || []).map(lm => lm.map(toScreen)), next = [];
    fresh.forEach(pts => {
      let best = null, bd = 1e9;
      tracked.forEach(t => { if (next.includes(t)) return; const d = d2(t.pts[0], pts[0]); if (d < bd) { bd = d; best = t; } });
      const h = (best && bd < Math.max(140, innerWidth * .15)) ? best : { id: ++hid, pts: pts.map(p => ({ ...p })), pinch: false, hist: [] };
      const pv = h.palm ? { ...h.palm } : null, wasFist = h.fist;
      h.pts.forEach((p, i) => { p.x += (pts[i].x - p.x) * .6; p.y += (pts[i].y - p.y) * .6; });
      feat(h, lastAt); next.push(h);
      // motion is accumulated per detection, so it is not lost when the scene renders slowly
      if (pv && wasFist === h.fist) { h.ax = (h.ax || 0) + h.palm.x - pv.x; h.ay = (h.ay || 0) + h.palm.y - pv.y; } else { h.ax = 0; h.ay = 0; }
    });
    tracked = next;
  }
  function feat(h, now) {
    const P = h.pts, size = d2(P[0], P[9]) || 1; h.size = size;
    const ext = i => d2(P[i], P[0]) > d2(P[i - 2], P[0]) * 1.1;
    const n = [8, 12, 16, 20].filter(ext).length, pd = d2(P[4], P[8]) / size, reach = d2(P[8], P[0]) / size;
    h.pp = { x: (P[4].x + P[8].x) / 2, y: (P[4].y + P[8].y) / 2 };
    if (!h.pinch && pd < .3 && reach > 1.15) { h.pinch = true; h.edge = true; h.last = { ...h.pp }; }
    else if (h.pinch && (pd > .45 || reach < 1.0)) { h.pinch = false; h.ui = false; }
    h.fist = !h.pinch && n === 0 && reach < 1.3;
    h.open = !h.pinch && n >= 4;
    const sz = (d2(P[0], P[5]) + d2(P[0], P[17]) + d2(P[5], P[17]) + d2(P[0], P[9])) / 4;
    h.sz = h.sz ? h.sz + (sz - h.sz) * .3 : sz;
    const pc = [0, 5, 9, 13, 17]; h.palm = { x: pc.reduce((a, i) => a + P[i].x, 0) / 5, y: pc.reduce((a, i) => a + P[i].y, 0) / 5 };
    h.hist.push({ t: now, x: h.palm.x, open: h.open }); while (h.hist.length && now - h.hist[0].t > 320) h.hist.shift();
  }
  const G = { z0: null, palms: [], big: 0, swipe: 0 }, flashes = [];
  function process(now) {
    if (!camOn) return;
    if (performance.now() - lastAt > 1000) tracked = [];
    const HS = tracked;
    for (const h of HS) if (h.edge) {
      h.edge = false;
      const el = document.elementFromPoint(h.pp.x, h.pp.y), b = el && el.closest('button, a, [role="button"], summary, label');
      if (b && !(S && b === S.canvas)) { b.click(); h.ui = true; flashes.push({ x: h.pp.x, y: h.pp.y, t: now }); } else h.ui = false;
    }
    if (!ready()) return;
    /* Any visible hand steers: move an open hand (or pinch) to rotate, fist to move, two hands apart/together to zoom. */
    const act = HS.filter(h => !h.ui);
    if (act.length >= 2) {
      const d = d2(act[0].palm, act[1].palm);
      if (!G.z0) G.z0 = { d, r: sph().radius };
      const r = G.z0.r * G.z0.d / Math.max(20, d);
      if (r < sph().radius && base.min != null) S.controls.minDistance = Math.max(.02, base.min * .12); // allow going inside
      dollyTo(r);
      act.forEach(h => { h.ax = 0; h.ay = 0; h.z0 = null; });
    } else {
      G.z0 = null;
      const h = act[0];
      /* One hand: bring it closer to the camera to zoom in (and go inside), move it away to zoom out.
         A fist is the "clutch": it pans and re-centres the size, so you can pull back and push in again. */
      if (h && !h.fist) {
        const r0 = sph().radius;
        if (!h.z0) h.z0 = { s: h.sz, r: r0 };
        let q = h.sz / h.z0.s; q = q > 1.08 ? q / 1.08 : q < .93 ? q / .93 : 1;
        if (q === 1) h.z0.r = r0;
        else {
          const r = h.z0.r / Math.pow(q, 2.6);
          if (r < r0 && base.min != null) S.controls.minDistance = Math.max(.02, base.min * .12);
          if (Math.abs(r - r0) / r0 > .003) dollyTo(r);
        }
      } else if (h) h.z0 = null;
      if (h && Math.abs(h.ax || 0) + Math.abs(h.ay || 0) > 2) {
        const dx = h.ax, dy = h.ay; h.ax = 0; h.ay = 0;
        if (h.fist) pan(dx, dy); else orbit(dx * 1.1, dy * 1.1);
      }
    }
  }
  function draw(now) {
    const W = innerWidth, H = innerHeight, R = Math.min(devicePixelRatio, 2);
    if (fx.width !== W * R || fx.height !== H * R) { fx.width = W * R; fx.height = H * R; }
    g.setTransform(R, 0, 0, R, 0, 0); g.clearRect(0, 0, W, H);
    for (const h of tracked) { // no hand skeleton on screen: only a small pointer for aiming at buttons
      const tp = h.pinch ? h.pp : h.pts[8];
      g.fillStyle = h.pinch ? 'rgba(255,181,71,.9)' : 'rgba(111,228,255,.75)'; g.beginPath(); g.arc(tp.x, tp.y, h.pinch ? 7 : 5, 0, 7); g.fill();
    }
    for (let i = flashes.length - 1; i >= 0; i--) { const f = flashes[i], a = (now - f.t) / 400; if (a > 1) { flashes.splice(i, 1); continue; } g.strokeStyle = `rgba(255,181,71,${1 - a})`; g.lineWidth = 2; g.beginPath(); g.arc(f.x, f.y, 10 + a * 26, 0, 7); g.stroke(); }
  }
  function loop(now) {
    requestAnimationFrame(loop);
    if (camOn && handsReady && !busy && video && video.readyState >= 2) { busy = true; hands.send({ image: video }).catch(() => { }).finally(() => { busy = false; }); }
    process(now); if (anim) anim(); draw(now);
    if (camOn) { const n = tracked.length, lbl = $('ghCam').querySelector('.lbl'); const t = handsReady ? (n ? `Қўл: ${n} та кўринди` : 'Қўлни кўрсатинг') : 'Юкланмоқда…'; if (lbl.textContent !== t) lbl.textContent = t; }
  }
  requestAnimationFrame(loop);
  window.goloHand = { simulate: () => { camOn = true; }, orbit, pan, dollyTo, glide, setXray, stepFocus, feed: r => onHands(r), state: () => ({ camOn, xray, hands: tracked.length, radius: ready() ? sph().radius : null }) };
})();
