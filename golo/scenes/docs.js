/* Golo Lab — project documents viewer (ЗВОС / ЗЭП / тузатишлар).
   Adds a «📄 Ҳужжатлар» button to the scene toolbar from hand.js and opens a panel with the full text,
   tables and figures of the project's documents. Every control is a real button, so it can be pressed
   with the mouse, a finger or an air-pinch; an open hand moved up/down scrolls the text while it is open. */
(() => {
  const SETS = {
    'ags': ['ags-sum', 'ags-fix', 'ags-zvos', 'ags-zep'],
    'orol-gel': ['gel-sum', 'gel-zvos', 'gel-zep'],
    'yashil-belbog': ['gel-sum', 'gel-zvos', 'gel-zep'],
    'orol-nbs': ['ags-sum', 'gel-sum', 'ags-fix', 'ags-zvos', 'ags-zep', 'gel-zvos', 'gel-zep']
  };
  const page = (location.pathname.split('/').pop() || '').replace(/\.html?$/, '');
  const LIST = window.GOLO_DOCS || SETS[page];
  if (!LIST) return;

  /* Short summaries written from the documents (key numbers only) */
  const SUM = {
    'ags-sum': { title: 'Асосий рақамлар · Сув тозалаш (AGS)', blocks: [
      { t: 'h', l: 1, x: '«AGS + Mg-биокўмир» туман оқова сув тозалаш модули' },
      { t: 'p', x: '10 000 аҳоли эквиваленти, 1 500 м³/сут. Қуйидаги рақамлар ЗВОС, ЗЭП ва тузатишлар маълумотномасида бир хилланган ягона қийматлар.' },
      { t: 'kv', r: [['Технологик схема', 'механик тозалаш → авария сиғими (250 м³) → буфер → AGS → диск фильтр → озон (4 мг/л) → Mg-биокўмир → УБ; ҳид манбалари ёпиқ'],
        ['Электр сарфи', '0,53 кВт·с/м³ (~290 МВт·с/йил)'], ['Қуёш станцияси', '190 кВт (~304 МВт·с/йил), том ва соябонда'],
        ['CAPEX', '~2,8 млн $'], ['Захира энергия', 'ДГ 60 кВА + LFP 40 кВт·с; ДГ атмосфера манбаи 0003'],
        ['Буфер сиғими', '7 × 7 м, сув 5,1 м, умумий баландлик 5,6 м (250 м³)'],
        ['Пиролиз', 'модулда фақат ғўзапоядан Mg-биокўмир (137 т/йил хомашё); лой пиролизи ресурс марказида'],
        ['Энергия назорат чегараси', '> 0,61 кВт·с/м³ (лойиҳа +15%) — диффузорлар текширилади'],
        ['Ходимлар', '6 киши: 4 оператор (2 смена × 12 соат), муҳандис-раҳбар, лаборант; 365 кун, 24 соат'],
        ['Атмосфера', '5 манба, 14 модда, 0,786 т/йил'], ['Чиқиндилар', '17 тур, синфлари билан (ЗЭП 6)'],
        ['Шовқин', '50 м да ~38 дБА, 100 м да ~32 дБА (тунги норма 45 дБА)'],
        ['Иссиқхона газлари', 'N₂O 188, CH₄ 67 т CO₂-экв/йил; соф ~+166 т/йил — анъанавийдан (~395) ~58% кам'],
        ['СЗЗ', '150–200 м (СанПиН 0350-17 дан текширилади)'], ['Тоифа', 'III тоифа (ВМ 234-сон, 160-банд), экспертиза 15 иш куни']] },
      { t: 'h', l: 2, x: 'Тўлдирилиши керак бўлган маълумотлар' },
      { t: 'li', x: 'Туман, аниқ жой, кадастр рақами, майдон, бурчак нуқталари координаталари (WGS-84).' },
      { t: 'li', x: 'Энг яқин уй, сув объекти, йўл ва экин ерларигача масофа.' },
      { t: 'li', x: 'Қишда тоза сув ташланадиган сув объекти ёки ресурс марказига узатиш.' },
      { t: 'li', x: 'Буюртмачи, реестрдаги ишлаб чиқувчи ташкилот, раҳбар ФИШ.' },
      { t: 'li', x: 'Ўзгидромет фон ва иқлим маълумотномаси; ер ажратиш қарори; экология бўлими маълумотномаси; сизот суви чуқурлиги.' },
      { t: 'li', x: 'Ҳудуддаги дарахтлар; оқова сувнинг ҳақиқий таҳлили (ККС, БКС, N, P, бромид, оғир металлар).' }] },
    'gel-sum': { title: 'Асосий рақамлар · Orol-Gel цехи', blocks: [
      { t: 'h', l: 1, x: '«Orol-Gel» тузга чидамли гидрогель цехи' },
      { t: 'p', x: 'Мўйноқ тумани, 0,5 га. Маҳсулот «Яшил белбоғ – Орол келажаги» лойиҳасида саксовул, черкез ва қандим кўчатлари учун ишлатилади.' },
      { t: 'kv', r: [['Қувват', '500 т/йил (1 гектарга 15 кг → ~33 000 га/йил)'], ['Маҳсулот', 'КМЦ-g-поли(AA-co-AMPS)/бентонит композит гидрогели, сувли эритмада радикал полимерлаш, эритувчисиз'],
        ['Иш режими', '250 кун × 2 смена × 8 соат = 4 000 соат/йил'], ['Ходимлар', '25 киши (20 ишчи, 5 ИТХ); қурилишда 30 киши, 6 ой'],
        ['Хомашё (йилига)', 'AA 301,8 т; AMPS 87,2 т; NaOH 142,5 т; КМЦ 33,5 т; бентонит 33,5 т; калий гумат 8,4 т; MBA 0,8 т; KPS 3,9 т'],
        ['Энергия', 'табиий газ 122,5 минг м³; электр 300 МВт·с; қуёш панели 50 кВт (~75 МВт·с)'],
        ['Атмосфера (ПДВ)', '3 манба (0001 қуритгич 15 м, 0002 аспирация 10 м, 6001 AA нафас клапани), 5 модда, 0,1176 г/с, 1,704 т/йил; См/ПДК ≤ 0,054'],
        ['Сув', 'олиш 3 455 м³/йил, қайтмас 2 840, оқова 615 м³/йил (2,46 м³/сут)'],
        ['Чиқиндилар (ПДО)', '9 тур, 9,72 т/йил; шундан 8,05 т технологияга қайтади ёки иккиламчи хомашё'],
        ['Шовқин', '100 м да 32 дБА, 300 м да 22,5 дБА (тунги норма 45 дБА)'],
        ['Углерод изи', '~380 т CO₂/йил (0,76 т/т маҳсулот); қуёш панели 37 т тежайди'],
        ['СЗЗ', 'III синф, 300 м (ТАХМИН, СанПиН 0350-17 дан аниқланади)'], ['Сифат', 'қолдиқ мономер ≤ 500 мг/кг, ҳар партия']] },
      { t: 'h', l: 2, x: 'Тўлдирилиши керак бўлган маълумотлар' },
      { t: 'li', x: 'Аниқ манзил, кадастр рақами, бурчак нуқталари координаталари.' },
      { t: 'li', x: 'Энг яқин турар-жой, сув объекти, йўл, мактаб/шифохонагача масофа.' },
      { t: 'li', x: 'Буюртмачи ва лойиҳачи реквизитлари, ижрочилар ФИШ.' },
      { t: 'li', x: 'Ўзгидромет фон концентрациялари ва иқлим маълумотномаси.' },
      { t: 'li', x: 'Жамоатчилик эшитуви баённомаси, СЭС ва сув хўжалиги хатлари.' },
      { t: 'li', x: 'Канализация ТУ ёки септик/ассенизация шартномаси; чиқинди шартномалари.' }] }
  };
  window.GOLO_DOC_DATA = window.GOLO_DOC_DATA || {};
  Object.assign(GOLO_DOC_DATA, SUM);
  const NAMES = { 'ags-sum': 'Асосий · AGS', 'gel-sum': 'Асосий · Orol-Gel', 'ags-fix': 'Тузатишлар', 'ags-zvos': 'ЗВОС · AGS', 'ags-zep': 'ЗЭП · AGS', 'gel-zvos': 'ЗВОС · Orol-Gel', 'gel-zep': 'ЗЭП · Orol-Gel' };

  const css = document.createElement('style');
  css.textContent = `
  #gd{position:fixed;z-index:58;top:calc(58px + env(safe-area-inset-top,0px));right:0;bottom:0;border-top-left-radius:12px;width:min(760px,100vw);display:flex;flex-direction:column;background:#fafbf9;color:#1d2b27;
    box-shadow:-10px 0 40px rgba(0,0,0,.18);font:14px/1.5 "Onest",system-ui,-apple-system,"Segoe UI",sans-serif;transform:translateX(102%);transition:transform .28s ease}
  #gd.open{transform:none}
  #gd .gdh{display:flex;align-items:center;gap:6px;padding:10px 12px 8px;border-bottom:1px solid #d5dcd6}
  #gd .gdh b{flex:1;font-size:15px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  #gd button{font:inherit;font-size:13px;border:1px solid #c9d2cb;background:#fff;color:#1d2b27;border-radius:8px;padding:7px 10px;cursor:pointer;min-height:36px}
  #gd button:hover{border-color:#3b8562}
  #gd button[aria-pressed="true"]{background:#3b8562;color:#fff;border-color:#3b8562}
  #gd .tabs{display:flex;gap:6px;padding:8px 12px;overflow-x:auto;border-bottom:1px solid #e1e6e2;flex:none}
  #gd .tabs button{white-space:nowrap}
  #gd .bar{display:flex;gap:6px;padding:8px 12px;border-bottom:1px solid #e1e6e2;align-items:center;flex:none}
  #gd .bar input{flex:1;min-width:0;font:inherit;padding:7px 10px;border:1px solid #c9d2cb;border-radius:8px}
  #gd .bar small{color:#667;white-space:nowrap}
  #gd .main{flex:1;display:flex;min-height:0}
  #gd .toc{width:210px;flex:none;overflow:auto;border-right:1px solid #e1e6e2;padding:8px}
  #gd .toc button{display:block;width:100%;text-align:left;margin:0 0 4px;border:0;background:transparent;padding:6px 8px;font-size:12.5px;min-height:0}
  #gd .toc button.l2{padding-left:18px;color:#55645f}
  #gd .toc button:hover{background:#e6efe9}
  #gd .body{flex:1;overflow:auto;padding:14px 18px 60px;scroll-behavior:smooth}
  #gd h1{font-size:19px;margin:22px 0 8px;color:#22423a}#gd h2{font-size:16px;margin:18px 0 6px;color:#2c574a}#gd h3{font-size:14.5px;margin:14px 0 6px}
  #gd p{margin:6px 0}#gd ul{margin:6px 0;padding-left:20px}#gd li{margin:3px 0}
  #gd .cap{font-weight:600;font-size:13px;margin:14px 0 4px;color:#3b5a52}
  #gd .tw{overflow-x:auto;margin:6px 0 12px;border:1px solid #d5dcd6;border-radius:8px}
  #gd table{border-collapse:collapse;width:100%;font-size:12.5px}
  #gd td{border:1px solid #e1e6e2;padding:5px 7px;vertical-align:top}
  #gd tr:first-child td{background:#eef3ef;font-weight:600}
  #gd img{max-width:100%;border:1px solid #e1e6e2;border-radius:8px;background:#fff;margin:8px 0}
  #gd mark{background:#fff1bf;border-radius:3px;padding:0 2px}
  #gd mark.hit{background:#ffd36b;outline:2px solid #e2a400}
  #gd .kv{display:grid;grid-template-columns:minmax(120px,34%) 1fr;border:1px solid #d5dcd6;border-radius:10px;overflow:hidden;margin:10px 0}
  #gd .kv div{padding:7px 10px;border-bottom:1px solid #e8ece9}
  #gd .kv div:nth-child(odd){background:#eef3ef;font-weight:600;color:#2c574a}
  #gd .note{font-size:12.5px;color:#55645f;background:#f2f5f1;border-radius:8px;padding:8px 10px;margin:4px 0 10px}
  #gd .scr{display:flex;flex-direction:column;gap:6px;position:absolute;right:14px;bottom:calc(14px + env(safe-area-inset-bottom,0px))}
  #gd .scr button{width:48px;height:48px;border-radius:50%;font-size:18px;box-shadow:0 2px 10px rgba(0,0,0,.15)}
  @media (max-width:720px){#gd{top:0;bottom:calc(58px + env(safe-area-inset-bottom,0px));border-radius:0}#gd .gdh{padding-top:calc(10px + env(safe-area-inset-top,0px))}#gd .scr{bottom:12px}#gd .toc{display:none}#gd.toc-on .toc{display:block;position:absolute;inset:auto 0 0 0;top:150px;width:auto;background:#fafbf9;z-index:2}#gd .body{padding:12px 12px 80px}}
  `;
  document.head.appendChild(css);

  const gd = document.createElement('section');
  gd.id = 'gd'; gd.setAttribute('role', 'dialog'); gd.setAttribute('aria-label', 'Лойиҳа ҳужжатлари'); gd.setAttribute('aria-hidden', 'true');
  gd.innerHTML = `<div class="gdh"><b id="gdT">Ҳужжатлар</b><button type="button" id="gdTocB" title="Мундарижа">☰ Бўлимлар</button><button type="button" id="gdX">✕ Ёпиш</button></div>
    <div class="tabs" id="gdTabs" role="tablist"></div>
    <div class="bar"><input id="gdQ" type="search" placeholder="Қидириш: масалан, ПДВ, септик, шовқин…" aria-label="Ҳужжатдан қидириш"><button type="button" id="gdNext">Кейингиси</button><small id="gdN"></small></div>
    <div class="main"><nav class="toc" id="gdToc" aria-label="Бўлимлар"></nav><div class="body" id="gdB" tabindex="0"></div></div>
    <div class="scr"><button type="button" id="gdUp" title="Юқорига">▲</button><button type="button" id="gdDn" title="Пастга">▼</button></div>`;
  document.body.appendChild(gd);
  const $ = id => document.getElementById(id), B = $('gdB');
  let cur = null, hits = [], hi = -1;

  function addBtn() {
    const bar = document.getElementById('gh');
    if (!bar) return setTimeout(addBtn, 200);
    if (document.getElementById('ghDocs')) return;
    const b = document.createElement('button'); b.type = 'button'; b.id = 'ghDocs'; b.title = 'Лойиҳа ҳужжатлари (ЗВОС, ЗЭП)';
    b.innerHTML = '📄<span class="lbl"> Ҳужжатлар</span>';
    const help = document.getElementById('ghHelp'); help ? bar.insertBefore(b, help) : bar.appendChild(b);
    b.addEventListener('click', () => isOpen() ? close() : open());
  }
  addBtn();

  LIST.forEach(id => {
    const t = document.createElement('button'); t.type = 'button'; t.dataset.id = id; t.textContent = NAMES[id] || id; t.setAttribute('role', 'tab');
    t.addEventListener('click', () => show(id)); $('gdTabs').appendChild(t);
  });

  function load(id) {
    return new Promise(res => {
      if (GOLO_DOC_DATA[id]) return res(GOLO_DOC_DATA[id]);
      const s = document.createElement('script'); s.src = 'docs/' + id + '.js';
      s.onload = () => res(GOLO_DOC_DATA[id]); s.onerror = () => res(null); document.head.appendChild(s);
    });
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // placeholders that still have to be filled from official sources stay visible, never hidden
  const mk = s => esc(s).replace(/\[[^\]]{0,80}\]|ТАХМИН/g, m => `<mark>${m}</mark>`);
  function render(d) {
    let h = '', n = 0, ul = false;
    const txt = b => b.x || (b.r ? b.r.map(r => r.map(c => Array.isArray(c) ? c[0] : c).join(' ')).join(' ') : '');
    const gaps = d.blocks.reduce((a, b) => a + (txt(b).match(/\[[^\]]{0,80}\]/g) || []).length, 0);
    if (gaps) h += `<div class="note">Сариқ белгили <mark>[ ]</mark> жойлар (${gaps} та) корхона ва расмий ташкилотлар маълумоти билан тўлдирилади; <mark>ТАХМИН</mark> — ўлчов билан алмаштириладиган ҳисобий қиймат.</div>`;
    for (const b of d.blocks) {
      if (b.t !== 'li' && ul) { h += '</ul>'; ul = false; }
      if (b.t === 'h') h += `<h${b.l} id="gdh${n++}">${mk(b.x)}</h${b.l}>`;
      else if (b.t === 'p') h += `<p>${mk(b.x)}</p>`;
      else if (b.t === 'cap') h += `<div class="cap">${mk(b.x)}</div>`;
      else if (b.t === 'li') { if (!ul) { h += '<ul>'; ul = true; } h += `<li>${mk(b.x)}</li>`; }
      else if (b.t === 'img') h += `<img src="${esc(b.src)}" alt="Ҳужжатдаги расм" loading="lazy">`;
      else if (b.t === 'kv') h += '<div class="kv">' + b.r.map(([k, v]) => `<div>${mk(k)}</div><div>${mk(v)}</div>`).join('') + '</div>';
      else if (b.t === 'tbl') h += '<div class="tw"><table>' + b.r.map(r => '<tr>' + r.map(([x, s]) => `<td${s > 1 ? ` colspan="${s}"` : ''}>${mk(x)}</td>`).join('') + '</tr>').join('') + '</table></div>';
    }
    if (ul) h += '</ul>';
    return h;
  }
  async function show(id) {
    cur = id;
    [...$('gdTabs').children].forEach(t => t.setAttribute('aria-pressed', t.dataset.id === id ? 'true' : 'false'));
    B.innerHTML = '<p>Юкланмоқда…</p>';
    const d = await load(id); if (cur !== id) return;
    if (!d) { B.innerHTML = '<p>Ҳужжат юкланмади. Интернетни текшириб, қайта уриниб кўринг.</p>'; return; }
    $('gdT').textContent = d.title; B.innerHTML = render(d); B.scrollTop = 0;
    const toc = $('gdToc'); toc.innerHTML = '';
    B.querySelectorAll('h1,h2').forEach(hd => {
      const b = document.createElement('button'); b.type = 'button'; b.className = hd.tagName === 'H2' ? 'l2' : ''; b.textContent = hd.textContent;
      b.addEventListener('click', () => { hd.scrollIntoView({ block: 'start' }); gd.classList.remove('toc-on'); }); toc.appendChild(b);
    });
    if ($('gdQ').value) find($('gdQ').value);
  }
  function find(q) {
    B.querySelectorAll('mark.q').forEach(m => m.replaceWith(document.createTextNode(m.textContent)));
    B.normalize(); hits = []; hi = -1; $('gdN').textContent = '';
    q = q.trim(); if (q.length < 2) return;
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const w = document.createTreeWalker(B, NodeFilter.SHOW_TEXT), nodes = [];
    while (w.nextNode()) nodes.push(w.currentNode);
    for (const n of nodes) {
      const t = n.nodeValue; if (!rx.test(t)) continue; rx.lastIndex = 0;
      const f = document.createDocumentFragment(); let i = 0, m;
      while ((m = rx.exec(t))) { f.append(t.slice(i, m.index)); const k = document.createElement('mark'); k.className = 'q'; k.textContent = m[0]; f.append(k); hits.push(k); i = m.index + m[0].length; }
      f.append(t.slice(i)); n.replaceWith(f);
    }
    $('gdN').textContent = hits.length ? `${hits.length} та` : 'топилмади';
    next();
  }
  function next() {
    if (!hits.length) return;
    hits[hi]?.classList.remove('hit'); hi = (hi + 1) % hits.length; hits[hi].classList.add('hit');
    hits[hi].scrollIntoView({ block: 'center' }); $('gdN').textContent = `${hi + 1} / ${hits.length}`;
  }
  let qT; $('gdQ').addEventListener('input', e => { clearTimeout(qT); qT = setTimeout(() => find(e.target.value), 250); });
  $('gdQ').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); next(); } });
  $('gdNext').addEventListener('click', next);
  $('gdUp').addEventListener('click', () => { B.scrollTop -= B.clientHeight * .8; });
  $('gdDn').addEventListener('click', () => { B.scrollTop += B.clientHeight * .8; });
  $('gdTocB').addEventListener('click', () => gd.classList.toggle('toc-on'));
  $('gdX').addEventListener('click', close);
  addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) close(); });
  ['wheel', 'pointerdown', 'touchstart', 'keydown'].forEach(ev => gd.addEventListener(ev, e => e.stopPropagation()));

  function isOpen() { return gd.classList.contains('open'); }
  function open(id) {
    gd.classList.add('open'); gd.setAttribute('aria-hidden', 'false');
    document.getElementById('ghDocs')?.setAttribute('aria-pressed', 'true');
    if (window.__golo) try { __golo.poke(); } catch (_) { }
    if (id || !cur) show(id || LIST[0]);
  }
  function close() { gd.classList.remove('open', 'toc-on'); gd.setAttribute('aria-hidden', 'true'); document.getElementById('ghDocs')?.setAttribute('aria-pressed', 'false'); }
  try { const q = new URLSearchParams(location.search).get('doc'); if (q && LIST.includes(q)) setTimeout(() => open(q), 400); } catch (_) { }
  window.goloDocs = { open, close, isOpen, show, scroll: dy => { B.scrollTop += dy; }, list: LIST };
})();
