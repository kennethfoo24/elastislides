/* ds.js: helpers for the data-streams deck. Load after style/eweb.js.
 *   DS.box(el)                 element box in slide (1280x720) coordinates: {l,t,r,b,w,h,cx,cy}
 *   DS.arrow(svg, pts, opts)   rounded orthogonal arrow that draws itself: {c,w,r,delay,dur,head,dash,both}
 *   DS.flow(path, opts)        small data squares travelling a path in a loop (after the scene settles)
 *   DS.icons()                 fills every <i data-icon="server|cloud|trash|file|search|agent"> with its SVG
 *   DS.skip                    true under navigator.webdriver: everything jumps to the final frame
 * Everything settles by 1.8s (PDF capture at 2s); loops start after that.
 */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const DS = window.DS = {};
  DS.skip = !!navigator.webdriver;
  if (DS.skip) document.documentElement.classList.add('ds-static');
  const T0 = performance.now();
  DS.now = () => (performance.now() - T0) / 1000;
  const mk = DS.mk = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  DS.$ = s => typeof s === 'string' ? document.querySelector(s) : s;
  DS.COL = {blue: '#0B64DD', ink: '#1D1E24', teal: '#02BCB7', pink: '#F04E98', orange: '#FF7E62', yellow: '#FEC514', grey: '#98A2B3', red: '#E0352B'};
  DS.RAW = ['#FF7E62', '#FEC514', '#F04E98', '#B5BFCE'];

  DS.box = s => {
    const el = DS.$(s); let l = 0, t = 0, e = el;
    while (e && e !== document.body) { l += e.offsetLeft; t += e.offsetTop; e = e.offsetParent; if (e && e !== document.body) { l += e.clientLeft; t += e.clientTop; } }
    const w = el.offsetWidth, h = el.offsetHeight;
    return {l, t, r: l + w, b: t + h, w, h, cx: l + w / 2, cy: t + h / 2};
  };

  // path through points with rounded corners
  DS.d = (pts, r) => {
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i];
      if (i < pts.length - 1 && r) {
        const a = pts[i - 1], n = pts[i + 1];
        const l1 = Math.hypot(p[0] - a[0], p[1] - a[1]), l2 = Math.hypot(n[0] - p[0], n[1] - p[1]);
        const rr = Math.min(r, l1 / 2, l2 / 2);
        const p1 = [p[0] + (a[0] - p[0]) * rr / l1, p[1] + (a[1] - p[1]) * rr / l1];
        const p2 = [p[0] + (n[0] - p[0]) * rr / l2, p[1] + (n[1] - p[1]) * rr / l2];
        d += `L${p1[0]},${p1[1]}Q${p[0]},${p[1]} ${p2[0]},${p2[1]}`;
      } else d += `L${p[0]},${p[1]}`;
    }
    return d;
  };

  const anim = (el, kf, o) => { if (DS.skip) return; el.animate(kf, Object.assign({fill: 'both'}, o)); };

  DS.arrow = (svg, pts, o) => {
    o = Object.assign({c: DS.COL.ink, w: 1.5, r: 10, delay: 0, dur: .6, head: 7, dash: null, both: false, cls: ''}, o || {});
    pts = pts.map(p => p.slice());
    const g = mk('g', {class: 'ds-arrow ' + o.cls}, svg);
    const trim = (a, b, k) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; b[0] -= (b[0] - a[0]) / L * k; b[1] -= (b[1] - a[1]) / L * k; };
    const tipEnd = pts[pts.length - 1].slice(), tipStart = pts[0].slice();
    if (o.head) trim(pts[pts.length - 2], pts[pts.length - 1], o.head * .8);
    if (o.head && o.both) trim(pts[1], pts[0], o.head * .8);
    const p = mk('path', {d: DS.d(pts, o.r), fill: 'none', stroke: o.c, 'stroke-width': o.w, 'stroke-linecap': o.dash ? 'butt' : 'round', 'stroke-linejoin': 'round'}, g);
    const head = (from, tip) => {
      const a = Math.atan2(tip[1] - from[1], tip[0] - from[0]), h = o.head, cs = Math.cos(a), sn = Math.sin(a);
      const q = [[tip[0], tip[1]], [tip[0] - h * cs + h * .55 * sn, tip[1] - h * sn - h * .55 * cs], [tip[0] - h * cs - h * .55 * sn, tip[1] - h * sn + h * .55 * cs]];
      return mk('polygon', {points: q.map(v => v.map(n => n.toFixed(1)).join(',')).join(' '), fill: o.c}, g);
    };
    const heads = [];
    if (o.head) heads.push(head(pts[pts.length - 2], tipEnd));
    if (o.head && o.both) heads.push(head(pts[1], tipStart));
    const L = p.getTotalLength(), wait = Math.max(0, o.delay - DS.now()) * 1000;
    if (o.dash) { p.setAttribute('stroke-dasharray', o.dash); anim(p, [{opacity: 0}, {opacity: 1}], {duration: o.dur * 1000, delay: wait}); }
    else if (!DS.skip) { p.style.strokeDasharray = L + ' ' + L; anim(p, [{strokeDashoffset: L}, {strokeDashoffset: 0}], {duration: o.dur * 1000, delay: wait, easing: 'cubic-bezier(.6,0,.2,1)'}); }
    heads.forEach(h => anim(h, [{opacity: 0}, {opacity: 1}], {duration: 160, delay: wait + o.dur * 850}));
    return {g, p, L, pts};
  };

  // little data squares riding a path. colors: array (per square) or fn(k) -> colour at progress k
  DS.flow = (p, o) => {
    o = Object.assign({n: 2, period: 2.4, size: 7, delay: 1.9, colors: [DS.COL.blue], layer: null, phase: 0, stroke: DS.COL.ink}, o || {});
    if (DS.skip) return;
    const L = p.getTotalLength(), layer = o.layer || p.parentNode;
    const sq = Array.from({length: o.n}, (_, i) => mk('rect', {width: o.size, height: o.size, stroke: o.stroke, 'stroke-width': .8, opacity: 0, fill: Array.isArray(o.colors) ? o.colors[i % o.colors.length] : DS.COL.blue}, layer));
    const f = () => {
      const t = DS.now() - o.delay;
      if (t > 0) sq.forEach((s, i) => {
        const k = ((t / o.period) + i / o.n + o.phase) % 1, pt = p.getPointAtLength(k * L);
        s.setAttribute('x', (pt.x - o.size / 2).toFixed(1)); s.setAttribute('y', (pt.y - o.size / 2).toFixed(1));
        s.setAttribute('opacity', Math.min(1, k * 10, (1 - k) * 10).toFixed(2));
        if (typeof o.colors === 'function') s.setAttribute('fill', o.colors(k, i));
      });
      requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  };

  DS.ICONS = {
    server: '<svg viewBox="0 0 64 72" fill="none" stroke="#1D1E24" stroke-width="1.5" stroke-linejoin="round"><rect x="4" y="4" width="56" height="18" fill="#fff"/><rect x="4" y="27" width="56" height="18" fill="#fff"/><rect x="4" y="50" width="56" height="18" fill="#fff"/><g stroke="#98A2B3"><path d="M12 13h22M12 36h22M12 59h22"/></g><circle cx="50" cy="13" r="3" fill="#02BCB7" stroke="none" class="led"/><circle cx="50" cy="36" r="3" fill="#0B64DD" stroke="none"/><circle cx="50" cy="59" r="3" fill="#DDE3EC" stroke="none"/></svg>',
    cloud: '<svg viewBox="0 0 64 48" fill="none" stroke="#1D1E24" stroke-width="1.5" stroke-linejoin="round"><path d="M17 42h32a11 11 0 0 0 1.5-21.9A15 15 0 0 0 21.6 15.4 13 13 0 0 0 17 42z" fill="#fff"/><path d="M32 36V22M26 27l6-6 6 6" stroke="#0B64DD" stroke-width="2" stroke-linecap="round"/></svg>',
    trash: '<svg viewBox="0 0 40 40" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 13h18M17 13v-3h6v3M13.5 13l1.2 17h10.6l1.2-17M18 17.5v9M22 17.5v9"/></svg>',
    file: '<svg viewBox="0 0 24 30" fill="none" stroke="#1D1E24" stroke-width="1.3" stroke-linejoin="round"><path d="M2 2h13l7 7v19H2z" fill="#fff"/><path d="M15 2v7h7"/><path d="M6 15h11M6 19h11M6 23h7" stroke="#98A2B3"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="#1D1E24" stroke-width="1.6" stroke-linecap="round"><circle cx="10" cy="10" r="6.5" fill="#fff"/><path d="M15 15l6 6"/></svg>',
    agent: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"><path d="M6 12h12M12 6v12"/></svg>',
    nginx: '<svg viewBox="0 0 24 24" fill="#009639"><path d="M12 0L1.605 6v12L12 24l10.395-6V6L12 0zm6 16.59c0 .705-.646 1.29-1.529 1.29-.631 0-1.351-.255-1.801-.81l-6-7.141v6.66c0 .721-.57 1.29-1.274 1.29H7.32c-.721 0-1.29-.6-1.29-1.29V7.41c0-.705.63-1.29 1.5-1.29.646 0 1.38.255 1.83.81l5.97 7.141V7.41c0-.721.6-1.29 1.29-1.29h.075c.72 0 1.29.6 1.29 1.29v9.18H18z"/></svg>'
  };
  DS.icons = root => (root || document).querySelectorAll('[data-icon]').forEach(e => { e.innerHTML = DS.ICONS[e.dataset.icon] || ''; });

  // horizontal cylinder (a data stream). Returns the group; segments get class .seg and .seg.on
  DS.cyl = (svg, o) => {
    o = Object.assign({x: 0, y: 0, w: 180, h: 64, segs: ['-000001', '-000002'], active: 1, font: 11}, o);
    const g = mk('g', {class: 'ds-cyl'}, svg), rx = o.h * .18, ry = o.h / 2, cy = o.y + ry;
    const x0 = o.x + rx, x1 = o.x + o.w - rx, sw = (x1 - x0) / o.segs.length;
    o.segs.forEach((s, i) => {
      const a = x0 + i * sw, b = a + sw, on = i === o.active;
      const sg = mk('g', {class: 'seg' + (on ? ' on' : '')}, g);
      mk('path', {d: `M${a},${o.y} L${b},${o.y} A${rx},${ry} 0 0 1 ${b},${o.y + o.h} L${a},${o.y + o.h} A${rx},${ry} 0 0 0 ${a},${o.y} Z`, fill: on ? '#D9E8FF' : '#F5F7FA', stroke: '#1D1E24', 'stroke-width': 1.2}, sg);
      const tx = mk('text', {x: (a + b) / 2 + rx * .5, y: cy + 4, 'text-anchor': 'middle', 'font-size': o.font, 'font-weight': 600, fill: on ? '#0B64DD' : '#69707D'}, sg); tx.textContent = s;
    });
    mk('ellipse', {cx: x0, cy, rx, ry, fill: '#fff', stroke: '#1D1E24', 'stroke-width': 1.2}, g);
    return {g, x0, x1, sw, rx, cy, seg: i => ({a: x0 + i * sw, b: x0 + (i + 1) * sw, c: x0 + (i + .5) * sw + rx * .5})};
  };

  // run fn once fonts are in (positions of text-sized boxes are then final)
  DS.ready = fn => { let done = false; const go = () => { if (!done) { done = true; fn(); } }; (document.fonts ? document.fonts.ready : Promise.resolve()).then(go); setTimeout(go, 600); };
})();
