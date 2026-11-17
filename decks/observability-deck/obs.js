/* observability-deck animation helpers. Elements carry data-b="x0,y0,x1,y1" in PDF points (720x405). */
(function(){
  const SK = !!(window.EW && EW.S && EW.S.skip) || navigator.webdriver;
  const O = window.OBS = {};
  const bb = e => e.dataset.b.split(',').map(Number);
  O.region = (x0, y0, x1, y1, root) => [...(root || document).querySelectorAll('.pg [data-b]')].filter(e => { const b = bb(e), cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2; return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1; });
  const FX = {
    fade: [{opacity: 0}, {opacity: 1}],
    up: [{opacity: 0, transform: 'translateY(18px)'}, {opacity: 1, transform: 'none'}],
    down: [{opacity: 0, transform: 'translateY(-18px)'}, {opacity: 1, transform: 'none'}],
    left: [{opacity: 0, transform: 'translateX(-30px)'}, {opacity: 1, transform: 'none'}],
    right: [{opacity: 0, transform: 'translateX(30px)'}, {opacity: 1, transform: 'none'}],
    pop: [{opacity: 0, transform: 'scale(.6)'}, {opacity: 1, transform: 'scale(1)'}],
    grow: [{opacity: 0, transform: 'scaleX(0)'}, {opacity: 1, transform: 'none'}]
  };
  // hide now, reveal later
  O.hide = els => els.forEach(e => { e.style.opacity = 0; });
  O.show = (els, o) => { o = Object.assign({at: 0, dur: .6, fx: 'fade', stagger: 0, order: null}, o || {});
    els = [].concat(els); if (o.order) els = els.slice().sort(o.order);
    els.forEach((e, i) => { e.style.opacity = 0; e.style.transformBox = 'fill-box'; e.style.transformOrigin = o.fx === 'grow' ? 'left center' : 'center';
      if (SK) { e.style.opacity = 1; return; }
      const f = FX[o.fx] || FX.fade;
      e.animate(f, {duration: o.dur * 1000, delay: (o.at + i * o.stagger) * 1000, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'both'}).onfinish = () => { e.style.opacity = 1; }; }); };
  // draw a stroked path
  O.draw = (els, o) => { o = Object.assign({at: 0, dur: .9, stagger: 0}, o || {});
    [].concat(els).forEach((e, i) => { if (!e.getTotalLength) { O.show(e, {at: o.at + i * o.stagger}); return; }
      const L = e.getTotalLength(); e.style.strokeDasharray = L + ' ' + L; e.style.strokeDashoffset = L; e.style.opacity = 1;
      if (SK) { e.style.strokeDashoffset = 0; return; }
      e.animate([{strokeDashoffset: L}, {strokeDashoffset: 0}], {duration: o.dur * 1000, delay: (o.at + i * o.stagger) * 1000, easing: 'ease-in-out', fill: 'both'}); }); };
  O.later = (fn, ms) => setTimeout(fn, SK ? 0 : ms);
  // a dot that travels along an svg path element (or a polyline of points) forever, with a delay
  O.travel = (svg, d, o) => { o = Object.assign({r: 3.2, fill: '#0B64DD', dur: 2.4, delay: 0, loop: true, count: 1}, o || {});
    const NS = 'http://www.w3.org/2000/svg', p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); const L = p.getTotalLength();
    for (let k = 0; k < o.count; k++) { const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', o.r); c.setAttribute('fill', o.fill); c.setAttribute('opacity', 0); svg.appendChild(c);
      const t0 = performance.now() + o.delay * 1000 + k * (o.dur * 1000 / o.count);
      const step = now => { let u = (now - t0) / (o.dur * 1000); if (u < 0) { requestAnimationFrame(step); return; }
        if (!o.loop && u > 1) { c.setAttribute('opacity', 0); return; } u = u % 1; const q = p.getPointAtLength(L * u);
        c.setAttribute('cx', q.x); c.setAttribute('cy', q.y); c.setAttribute('opacity', Math.min(1, u * 8, (1 - u) * 8)); requestAnimationFrame(step); };
      requestAnimationFrame(step); } };
  const K = 1280 / 720;
  // typed selectors (regions in PDF points)
  O.T = (a, b, c, d) => O.region(a, b, c, d).filter(e => e.classList.contains('t'));
  O.I = (a, b, c, d) => O.region(a, b, c, d).filter(e => e.tagName === 'IMG');
  O.Pa = (a, b, c, d) => O.region(a, b, c, d).filter(e => e.tagName.toLowerCase() === 'path');
  O.img = n => document.querySelector('img[src$="x' + n + '.png"]');
  O.svg = () => document.querySelector('.pgv');
  O.fills = els => els.filter(e => e.getAttribute('fill') !== 'none');
  O.strokes = els => els.filter(e => e.getAttribute('fill') === 'none');
  // 'pt' polyline -> svg path string
  O.poly = pts => 'M' + pts.map(p => p[0] + ' ' + p[1]).join('L');
  O.byY = els => els.slice().sort((a, b) => bb(a)[1] - bb(b)[1] || bb(a)[0] - bb(b)[0]);
  // fit every text span to its original PDF width (Inter metrics differ slightly)
  O.fit = () => document.querySelectorAll('.pg .t').forEach(e => { const b = bb(e), target = (b[2] - b[0]) * K; e.style.display = 'inline-block'; const w = e.getBoundingClientRect().width / (window.__scale || 1) ; const cur = e.offsetWidth;
    if (cur > target * 1.012 && e.textContent.length > 2) e.style.letterSpacing = ((target - cur) / e.textContent.length) + 'px'; });
  // count a number inside a text span up from 0 (keeps prefix/suffix)
  O.count = (e, o) => { o = Object.assign({at: 0, dur: 1.2}, o || {}); const m = /^(\D*)([\d.,]+)(.*)$/.exec(e.textContent.trim()); if (!m || SK) return;
    const to = parseFloat(m[2].replace(/,/g, '')), dec = (m[2].split('.')[1] || '').length, t0 = performance.now() + o.at * 1000; e.textContent = m[1] + (0).toFixed(dec) + m[3];
    const f = now => { const k = Math.min(1, Math.max(0, (now - t0) / (o.dur * 1000))), v = to * (1 - Math.pow(1 - k, 3)); e.textContent = m[1] + (m[2].includes(',') ? Math.round(v).toLocaleString() : v.toFixed(dec)) + m[3]; if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); };
  // bullet groups on the left: each starts at a bullet glyph and runs to the next one
  O.bullets = () => { const ts = O.T(0, 60, 275, 400).filter(e => !/^Elastic Observability$/.test(e.textContent)).sort((p, q) => bb(p)[1] - bb(q)[1] || bb(p)[0] - bb(q)[0]);
    const groups = [], head = []; let cur = null; ts.forEach(e => { if (e.textContent.trim() === '\u25CF') { cur = [e]; groups.push(cur); } else if (cur) cur.push(e); else head.push(e); });
    return {head, groups}; };
  // a tour of a screenshot: steps = [{b: bulletIndex|null, r: [x0,y0,x1,y1] (pt), tag, hold}]
  O.tour = (box, steps, o) => { o = Object.assign({start: 1.9, hold: 2.7}, o || {});
    const {head, groups} = O.bullets(); O.show(head, {fx: 'left', at: .15, stagger: .12});
    const shot = O.region(box[0], box[1], box[2], box[3]).filter(e => !e.classList.contains('t'));
    O.show(shot, {fx: 'right', dur: .9, at: .35});
    groups.forEach(g => g.forEach(e => { e.style.opacity = 0; }));
    if (SK) { groups.forEach(g => g.forEach(e => { e.style.opacity = 1; })); return; }
    const pg = document.getElementById('pg'), clip = document.createElement('div'); clip.style.cssText = `position:absolute;left:${box[0]*K}px;top:${box[1]*K}px;width:${(box[2]-box[0])*K}px;height:${(box[3]-box[1])*K}px;overflow:hidden;z-index:12;pointer-events:none;border-radius:6px`; pg.appendChild(clip);
    const sp = document.createElement('div'); sp.style.cssText = 'position:absolute;border:3px solid #F04E98;border-radius:8px;box-shadow:0 0 0 4000px rgba(16,28,63,.46);opacity:0;transition:left .8s cubic-bezier(.5,0,.2,1),top .8s cubic-bezier(.5,0,.2,1),width .8s cubic-bezier(.5,0,.2,1),height .8s cubic-bezier(.5,0,.2,1),opacity .5s'; clip.appendChild(sp);
    const tag = document.createElement('div'); tag.style.cssText = "position:absolute;font:700 12px 'IBM Plex Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:#fff;background:#F04E98;padding:6px 11px;opacity:0;transition:left .8s cubic-bezier(.5,0,.2,1),top .8s cubic-bezier(.5,0,.2,1),opacity .4s;white-space:nowrap"; clip.appendChild(tag);
    const orig = groups.map(g => g.map(e => e.style.color)); let t = o.start, active = -1;
    const tint = (i, on) => groups[i] && groups[i].forEach((e, k) => { if (k) e.style.color = on ? '#0B64DD' : orig[i][k]; });
    steps.forEach(st => { const h = (st.hold || o.hold) * 1000;
      setTimeout(() => { if (st.b != null && st.b !== active) { if (active >= 0) tint(active, false); active = st.b; O.show(groups[st.b], {fx: 'left', dur: .55, stagger: .05}); tint(st.b, true); }
        const r = st.r, L = (r[0] - box[0]) * K - 6, T = (r[1] - box[1]) * K - 6, W = (r[2] - r[0]) * K + 12, H = (r[3] - r[1]) * K + 12;
        sp.style.left = L + 'px'; sp.style.top = T + 'px'; sp.style.width = W + 'px'; sp.style.height = H + 'px'; sp.style.opacity = 1;
        tag.textContent = st.tag || ''; tag.style.opacity = st.tag ? 1 : 0; tag.style.left = Math.max(6, L) + 'px'; tag.style.top = (T > 40 ? T - 34 : T + H + 8) + 'px'; }, t * 1000);
      t += h / 1000; });
    setTimeout(() => { sp.style.opacity = 0; sp.style.boxShadow = 'none'; tag.style.opacity = 0; tint(active, false); groups.forEach(g => O.show(g.filter(e => e.style.opacity === '0'), {fx: 'fade'})); }, t * 1000); };
  window.addEventListener('load', () => { O.fit(); document.fonts && document.fonts.ready.then(O.fit); document.body.dataset.ready = 1; });
})();
