/* scenes.js: reusable parts for hero slides. Load after eweb.js:
 *   <script src="style/eweb.js"></script><script src="style/scenes.js"></script>
 * Everything hangs off EW.S. Scene coordinates are the same x, y, z that sc.box uses.
 *
 *   EW.S.cube(sc, layer)        one three-faced cube you redraw each frame: .draw(x,y,z,w,d,h,faces)
 *   EW.S.stream(sc, opts)       data cubes flowing along a line, raw colours turning uniform blue
 *   EW.S.cyl(sc, opts)          isometric cylinder (bucket, database)
 *   EW.S.lake(sc, opts)         tray of blue "water" that ripples as cubes drop in
 *   EW.S.stack(sc, opts)        slabs where most peel away, leaving a few (before / after)
 *   EW.S.curve(canvas, opts)    dot-matrix growth curve that draws itself
 *   EW.S.count(el, from, to)    number that counts down or up
 *   EW.S.type(el, lines, opts)  typed code with syntax colours
 *   EW.S.COL / EW.S.RAW         face sets [top, left, right] for cubes
 *
 * All motion keeps running after it settles (gentle loops). For PDF export or screenshots,
 * EW.S.skip is 30 (seconds) when navigator.webdriver is set, so scenes can jump to the end.
 */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const S = EW.S = {};
  const mk = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  S.mk = mk;
  S.skip = navigator.webdriver ? 30 : 0;

  S.COL = {
    blue: ['#FFFFFF', '#0B64DD', '#0A4FB0'], pink: ['#FFFFFF', '#F04E98', '#343741'], teal: ['#FFFFFF', '#48EFCF', '#02BCB7'],
    orange: ['#FFFFFF', '#FF7E62', '#343741'], yellow: ['#FFFFFF', '#FEC514', '#343741'], slate: ['#FFFFFF', '#DDE3EC', '#B5BFCE'],
    red: ['#FFD9D4', '#E0352B', '#8F1D16']
  };
  S.RAW = [S.COL.slate, S.COL.orange, S.COL.yellow, S.COL.pink];

  const scaleOf = sc => (sc.P(1, 0, 0)[0] - sc.P(0, 0, 0)[0]) / 0.8660254;
  const poly = (sc, a) => a.map(q => sc.P(q[0], q[1], q[2]).map(v => v.toFixed(1)).join(',')).join(' ');
  const layerOf = (sc, l) => typeof l === 'string' ? sc[l] : (l || sc.floor);

  /* ── cube: three polygons you redraw each frame ───────────────────────────── */
  S.cube = (sc, layer) => {
    const g = mk('g', {}, layerOf(sc, layer || 'body'));
    const f = [0, 1, 2].map(() => mk('polygon', { stroke: '#1D1E24', 'stroke-width': .7 }, g));
    return {
      g,
      draw(x, y, z, w, d, h, F) {
        f[0].setAttribute('points', poly(sc, [[x, y + d, z + h], [x + w, y + d, z + h], [x + w, y + d, z], [x, y + d, z]])); f[0].setAttribute('fill', F[1]);
        f[1].setAttribute('points', poly(sc, [[x + w, y, z + h], [x + w, y + d, z + h], [x + w, y + d, z], [x + w, y, z]])); f[1].setAttribute('fill', F[2]);
        f[2].setAttribute('points', poly(sc, [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]])); f[2].setAttribute('fill', F[0]);
      }
    };
  };

  /* ── stream: cubes flow from `from` to `to`; after `convertAt` (0 to 1) they turn `out` ── */
  S.stream = (sc, o) => {
    o = Object.assign({ from: [0, 0, 0], to: [200, 0, 0], rate: 3, size: 12, sizeOut: 0, speed: 110, raw: S.RAW, out: S.COL.blue, convertAt: .5, seed: 17, delay: .9, layer: 'floor' }, o);
    const R = EW.rand(o.seed), ps = [], layer = mk('g', {}, layerOf(sc, o.layer));
    const [fx, fy, fz] = o.from, [tx, ty, tz] = o.to, len = Math.hypot(tx - fx, ty - fy, tz - fz) || 1;
    let last = 0, acc = 0;
    EW.loop(t => {
      const dt = Math.min(.05, t - last); last = t;
      if (t > o.delay) { acc += dt * o.rate; while (acc >= 1) { acc--; ps.push({ c: S.cube(sc, layer), p: 0, raw: o.raw[Math.floor(R() * o.raw.length)], S: o.size * (.75 + R() * .5) }); } }
      for (let i = ps.length - 1; i >= 0; i--) {
        const q = ps[i]; q.p += dt * o.speed / len;
        if (q.p >= 1) { q.c.g.remove(); ps.splice(i, 1); continue; }
        const done = q.p > o.convertAt, Z = done ? (o.sizeOut || o.size) : q.S, F = done ? o.out : q.raw;
        q.c.draw(fx + (tx - fx) * q.p - Z / 2, fy + (ty - fy) * q.p - Z / 2, fz + (tz - fz) * q.p, Z, Z, Z, F);
        q.c.g.setAttribute('opacity', Math.min(1, q.p * 8, (1 - q.p) * 6).toFixed(2));
      }
    });
    return { layer };
  };

  /* ── cylinder ─────────────────────────────────────────────────────────────── */
  S.cyl = (sc, o) => {
    o = Object.assign({ x: 0, y: 0, z: 0, h: 42, r: 24, side: '#FF7E62', shade: '#343741', top: '#FFFFFF', delay: .2, drop: 60 }, o);
    const s = scaleOf(sc), [cx, cb] = sc.P(o.x, o.y, o.z), ct = sc.P(o.x, o.y, o.z + o.h)[1], r = o.r * s, rx = r * 1.2247, ry = r * .7071;
    const g = mk('g', { opacity: 0 }, sc.body), st = { stroke: '#1D1E24', 'stroke-width': 1 };
    mk('path', Object.assign({ d: `M${cx - rx},${ct} L${cx - rx},${cb} A${rx},${ry} 0 0 0 ${cx + rx},${cb} L${cx + rx},${ct} Z`, fill: o.side }, st), g);
    mk('path', Object.assign({ d: `M${cx},${ct + ry} L${cx},${cb + ry} A${rx},${ry} 0 0 0 ${cx + rx},${cb} L${cx + rx},${ct} A${rx},${ry} 0 0 1 ${cx},${ct + ry} Z`, fill: o.shade }, st), g);
    mk('ellipse', Object.assign({ cx, cy: ct, rx, ry, fill: o.top }, st), g);
    EW.loop(t => { const k = EW.back((t - o.delay) / .7); g.setAttribute('opacity', Math.min(1, Math.max(0, (t - o.delay) * 3))); g.setAttribute('transform', `translate(0,${(-o.drop * s * (1 - k)).toFixed(1)})`); });
    return { g };
  };

  /* ── lake: a tray of blue tiles; opts.feed = {from:[x,y,z]} drops a cube in every 1/rate s ── */
  S.lake = (sc, o) => {
    o = Object.assign({ x: 0, y: 0, size: 180, wall: 36, rim: 8, n: 8, front: '#FF7E62', side: '#343741', feed: null, rate: 3.2, delay: .9, seed: 23, level: 19, label: null }, o);
    const N = o.n, SZ = o.size, WZ = o.wall, RIM = o.rim, TS = (SZ - 2 * RIM) / N, X0 = o.x, Y0 = o.y;
    const P = (x, y, z) => sc.P(X0 + x, Y0 + y, z), pts = a => a.map(q => P(q[0], q[1], q[2]).map(v => v.toFixed(1)).join(',')).join(' ');
    const lake = mk('g', {}, sc.body), back = mk('g', {}, lake), water = mk('g', {}, lake), front = mk('g', {}, lake), fly = mk('g', {}, sc.top);
    mk('polygon', { points: pts([[0, 0, WZ], [SZ, 0, WZ], [SZ, 0, 0], [0, 0, 0]]), fill: '#E9EDF3' }, back);
    mk('polygon', { points: pts([[0, 0, WZ], [0, SZ, WZ], [0, SZ, 0], [0, 0, 0]]), fill: '#D3DAE6' }, back);
    const tiles = [];
    for (let s2 = 0; s2 <= 2 * (N - 1); s2++) for (let i = 0; i < N; i++) {
      const j = s2 - i; if (j < 0 || j >= N) continue;
      const g = mk('g', {}, water), f = [0, 1, 2].map(() => mk('polygon', { stroke: 'rgba(255,255,255,.55)', 'stroke-width': .6 }, g));
      tiles.push({ x: RIM + i * TS, y: RIM + j * TS, f });
    }
    const st = { stroke: '#1D1E24', 'stroke-width': 1, 'stroke-linejoin': 'round' };
    mk('polygon', Object.assign({ points: pts([[0, SZ, WZ], [SZ, SZ, WZ], [SZ, SZ, 0], [0, SZ, 0]]), fill: o.front }, st), front);
    mk('polygon', Object.assign({ points: pts([[SZ, 0, WZ], [SZ, SZ, WZ], [SZ, SZ, 0], [SZ, 0, 0]]), fill: o.side }, st), front);
    const pp = (x, y, z) => P(x, y, z).join(',');
    mk('path', Object.assign({ d: `M${pp(0, 0, WZ)}L${pp(SZ, 0, WZ)}L${pp(SZ, SZ, WZ)}L${pp(0, SZ, WZ)}Z M${pp(RIM, RIM, WZ)}L${pp(RIM, SZ - RIM, WZ)}L${pp(SZ - RIM, SZ - RIM, WZ)}L${pp(SZ - RIM, RIM, WZ)}Z`, fill: '#FFFFFF', 'fill-rule': 'evenodd' }, st), front);
    const flt = sc.svg.querySelector('filter');
    const shadow = flt ? mk('polygon', { points: pts([[14, 14, 0], [SZ + 20, 14, 0], [SZ + 20, SZ + 20, 0], [14, SZ + 20, 0]]), fill: 'rgba(40,55,90,.16)', filter: `url(#${flt.id})` }, sc.floor) : null;
    if (o.label) sc.label(Object.assign({ at: [X0, Y0 + SZ, WZ / 2], side: 'l', len: 40, delay: 1.3 }, o.label));

    const R = EW.rand(o.seed), drops = [], waves = []; let level = o.level, last = 0, acc = 0;
    const levelAt = (x, y, t) => { let h = level;
      for (const w of waves) { const age = t - w.t, d = Math.hypot(x - w.x, y - w.y), fr = 18 + 70 * age; if (d > fr) continue; h += 6.5 * Math.exp(-age * 1.1) * Math.cos(d * .11 - age * 7) * Math.min(1, (fr - d) / 20); }
      return h; };
    EW.loop(t0 => {
      const t = t0 + S.skip, dt = Math.min(.05, t - last); last = t;
      if (o.feed && t > o.delay) { acc += dt * o.rate; while (acc >= 1) { acc--; const ti = tiles[Math.floor(R() * tiles.length)];
        drops.push({ c: S.cube(sc, fly), sx: o.feed.from[0], sy: o.feed.from[1], sz: o.feed.from[2], tx: X0 + ti.x + TS / 2 - 6, ty: Y0 + ti.y + TS / 2 - 6, u: 0, dur: .85 + R() * .25 }); } }
      for (let i = drops.length - 1; i >= 0; i--) { const d = drops[i]; d.u += dt / d.dur;
        const u = Math.min(1, d.u), surf = levelAt(d.tx - X0 + 6, d.ty - Y0 + 6, t);
        if (d.u >= 1) { waves.push({ x: d.tx - X0 + 6, y: d.ty - Y0 + 6, t }); if (waves.length > 10) waves.shift(); level = Math.min(o.level + 8, level + .03); d.c.g.remove(); drops.splice(i, 1); continue; }
        d.c.draw(d.sx + (d.tx - d.sx) * u, d.sy + (d.ty - d.sy) * u, d.sz + (surf - d.sz) * u + 144 * u * (1 - u), 12, 12, 12, S.COL.blue); }
      for (const w of tiles) { const h = Math.max(2, levelAt(w.x + TS / 2, w.y + TS / 2, t)), x = w.x, y = w.y, Z = TS;
        const k = Math.max(0, Math.min(1, (h - 6) / 22)), top = `rgb(${Math.round(214 - 120 * k)},${Math.round(230 - 80 * k)},${Math.round(255 - 20 * k)})`;
        w.f[0].setAttribute('points', pts([[x, y + Z, h], [x + Z, y + Z, h], [x + Z, y + Z, 0], [x, y + Z, 0]])); w.f[0].setAttribute('fill', '#0B64DD');
        w.f[1].setAttribute('points', pts([[x + Z, y, h], [x + Z, y + Z, h], [x + Z, y + Z, 0], [x + Z, y, 0]])); w.f[1].setAttribute('fill', '#0A4FB0');
        w.f[2].setAttribute('points', pts([[x, y, h], [x + Z, y, h], [x + Z, y + Z, h], [x, y + Z, h]])); w.f[2].setAttribute('fill', top); }
      const la = Math.min(1, Math.max(0, (t - .3) * 2.5)); lake.setAttribute('opacity', la); if (shadow) shadow.setAttribute('opacity', la);
      lake.setAttribute('transform', `translate(0,${(40 * (1 - EW.back((t - .3) / .7))).toFixed(1)})`);
    });
    return { g: lake };
  };

  /* ── stack: n slabs, the first `keep` stay blue, the rest peel away at time `at` ── */
  S.stack = (sc, o) => {
    o = Object.assign({ x: 0, y: 0, w: 150, d: 150, n: 25, keep: 4, h: 11, gap: 3, at: .75, ghost: true }, o);
    const H = o.h, G = o.gap;
    if (o.ghost) sc.box({ x: o.x, y: o.y, w: o.w, d: o.d, h: o.n * (H + G), c: 'white', wire: true, dash: '3 4', stroke: '#98A2B3', delay: 1.4, drop: 0, snap: false, dur: .4, shadow: false, order: 100 });
    sc.rect({ x: o.x - 24, y: o.y - 24, w: o.w + 48, d: o.d + 48, delay: .05 });
    for (let i = 0; i < o.n; i++) {
      const keep = i < o.keep, h = i === o.keep - 1 ? H * .75 : H;
      const b = sc.box({ x: o.x, y: o.y, w: o.w, d: o.d, h, z: i * (H + G), c: keep ? 'blue' : 'slate', stroke: keep ? '#1D1E24' : '#98A2B3', sw: keep ? 1 : .6, delay: .05 + i * .014, drop: 60, dur: .4, shadow: i === 0, order: i * 1000 });
      b.i = i;
      if (!keep) b.onFrame = (t, it) => { const k = EW.ease((t + S.skip - o.at - (o.n - 1 - it.i) * .016) / .55); if (k <= 0) return;
        it.g.setAttribute('transform', `translate(${k * 40},${-k * (80 + it.i * 3)})`); it.g.setAttribute('opacity', Math.max(0, 1 - k * 1.3)); };
    }
    return { total: o.n * (H + G), kept: o.keep * (H + G) };
  };

  /* ── count: 25 -> 3.75 style number animation ─────────────────────────────── */
  S.count = (el, from, to, o) => {
    o = Object.assign({ delay: .6, dur: .9, dec: 2, fmt: null, done: null }, o || {});
    const fmt = o.fmt || (v => v.toFixed(o.dec)), t0 = performance.now() - S.skip * 1000;
    const step = now => { const p = Math.min(1, Math.max(0, ((now - t0) / 1000 - o.delay) / o.dur)), e = 1 - Math.pow(1 - p, 3);
      el.textContent = p >= 1 ? fmt(to) : fmt(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step); else if (o.done) o.done(); };
    requestAnimationFrame(step);
  };

  /* ── type: lines = [[['kw','FROM'],['',' logs']], ...]; classes kw / str / fn / pp ── */
  S.type = (el, lines, o) => {
    o = Object.assign({ delay: 1, dur: 1.4, done: null }, o || {});
    const total = lines.reduce((n, l) => n + l.reduce((m, p) => m + p[1].length, 0), 0), t0 = performance.now() - S.skip * 1000;
    const render = n => { let left = n, html = '';
      lines.forEach((line, li) => { let row = '';
        for (const [c, s] of line) { if (left <= 0) break; const part = s.slice(0, left); left -= part.length; row += c ? `<span class="${c}">${part.replace(/</g, '&lt;')}</span>` : part; }
        const cur = left <= 0 && n < total && !html.includes('cur');
        html += `<div class="ln"><span class="n">${li + 1}</span><span>${row}${cur ? '<span class="cur"></span>' : ''}</span></div>`; });
      el.innerHTML = html; };
    let fired = false;
    const step = now => { const p = Math.min(1, Math.max(0, ((now - t0) / 1000 - o.delay) / o.dur)); render(Math.round(total * p));
      if (p < 1) requestAnimationFrame(step); else if (!fired) { fired = true; if (o.done) o.done(); } };
    requestAnimationFrame(step);
    return { render, total };
  };

  /* ── curve: dot-matrix growth curve on a <canvas>. onFrame(t, api) places annotations. ── */
  S.curve = (cv, o) => {
    o = Object.assign({ W: 1136, H: 400, x0: 20, x1: 1100, base: 360, top: 34, gap: 10, ua: .46,
      fn: null, hotAt: .86, onFrame: null, pre: [181, 191, 206], mid: [11, 100, 221], hot: [255, 126, 98] }, o);
    const { W, H, x0: X0, x1: X1, base, top, gap, ua: UA } = o, dpr = 2;
    cv.width = W * dpr; cv.height = H * dpr; const c = cv.getContext('2d'); c.scale(dpr, dpr);
    // illustrative volume: steady growth, then an order-of-magnitude jump at UA
    const v = o.fn || (u => u <= UA ? 1 + 9 * Math.pow(u / UA, 2.2) : 10 + 43 * (u - UA) + 92 * Math.pow((u - UA) / (1 - UA), 2.6));
    const io = t => t <= 0 ? 0 : t >= 1 ? 1 : t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    EW.loop(t0 => {
      const t = t0 + S.skip, r1 = UA * EW.ease((t - .2) / 1.3), k2 = io((t - 2.7) / 2.1);
      const rev = t < 2.7 ? r1 : UA + (1 - UA) * k2, D = Math.max(UA, rev), ymax = Math.max(11, v(rev) * 1.06);
      const X = u => X0 + (X1 - X0) * (u / D), Y = val => base - (val / ymax) * (base - top);
      c.clearRect(0, 0, W, H); c.fillStyle = '#1D1E24'; c.fillRect(0, base, W, 1);
      const wx = ((t * .25) % 1.4 - .2) * W;
      for (let x = X0 + 4; x < X(rev); x += gap) {
        const u = (x - X0) / (X1 - X0) * D, cy = Y(v(u)), q = (x * 7919 % 97) / 97;
        const cc = u < UA ? o.pre : u < o.hotAt ? o.mid : o.hot, kk = Math.max(0, 1 - Math.abs(x - wx) / 80) * q;
        for (let y = base - 4; y > cy + 3; y -= gap) {
          const a = u < UA ? .9 : .55 + .45 * (1 - (y - cy) / (base - cy + 1));
          c.fillStyle = `rgba(${cc},${Math.min(1, a + kk * .4)})`; c.beginPath(); c.arc(x, y, 1.5 + kk * .8, 0, 6.283); c.fill();
        }
      }
      const py = Y(10); c.setLineDash([3, 4]); c.strokeStyle = 'rgba(29,30,36,.55)'; c.lineWidth = 1;
      if (rev >= UA * .98) { c.beginPath(); c.moveTo(X0, py); c.lineTo(X1, py); c.stroke(); }
      if (t > 2.6) { const ax = X(UA); c.strokeStyle = '#1D1E24'; c.beginPath(); c.moveTo(ax, py); c.lineTo(ax, base); c.stroke(); }
      c.setLineDash([]); c.beginPath();
      for (let i = 0; i <= 400; i++) { const u = rev * i / 400, x = X(u), y = Y(v(u)); i ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.strokeStyle = '#1D1E24'; c.lineWidth = 2; c.stroke();
      if (rev < 1) { c.fillStyle = rev < UA ? '#69707D' : '#0B64DD'; c.beginPath(); c.arc(X(rev), Y(v(rev)), 4, 0, 6.283); c.fill(); }
      if (o.onFrame) o.onFrame(t, { c, rev, k2, D, X, Y, v, py, UA, X0, X1, base, top });
    });
  };
})();
