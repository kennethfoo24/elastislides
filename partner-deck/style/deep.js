/* Full-screen architecture scenes for the "in action" slide: window.DEEP.run(svg, 'search' | 'obs' | 'sec') */
(function(){
  const INK = '#1D1E24', CHAR = '#343741', GREY = '#69707D', LINE = '#D3DAE6', BLUE = '#0B64DD', RED = '#E0352B', TEAL = '#02BCB7', PINK = '#F04E98', ORANGE = '#FF7E62', YELLOW = '#FEC514', BG = '#F5F7FA';
  const ease = EW.ease, clamp = k => Math.max(0, Math.min(1, k));

  function kit(svg){
    const steps = [], at = (t, f, dur) => steps.push({t, f, dur: dur || .5});
    let root = svg; const el = (t, a, p) => EW.el(t, a, p || root);
    const text = (s, x, y, o, p) => { const e = el('text', Object.assign({x, y, 'font-size': 11, 'letter-spacing': '.05em', fill: INK, 'font-weight': 600, 'font-family': 'IBM Plex Mono, monospace'}, o), p); e.textContent = s; return e; };
    const sans = (s, x, y, o, p) => text(s, x, y, Object.assign({'font-family': 'Inter, sans-serif', 'font-size': 13, 'font-weight': 400, fill: GREY, 'letter-spacing': 0}, o), p);
    const box = (x, y, w, h, o) => { o = o || {}; const g = el('g', {opacity: 0});
      el('rect', {x, y, width: w, height: h, rx: o.rx || 0, fill: o.fill || '#fff', stroke: o.stroke || INK, 'stroke-width': o.sw || 1, 'stroke-dasharray': o.dash || ''}, g);
      if (o.c) el('rect', {x, y, width: 4, height: h, fill: o.c}, g);
      return g; };
    const card = (x, y, w, h, t, s, o) => { o = o || {}; const g = box(x, y, w, h, o), cx = x + (o.c ? 16 : 14);
      if (t) text(t, cx, s ? y + 23 : y + h / 2 + 4, {fill: o.tc || INK, 'font-size': o.fs || 11.5}, g);
      if (s) sans(s, cx, y + 42, {fill: o.sc || GREY, 'font-size': 12}, g);
      return g; };
    const line = (d, o) => el('path', Object.assign({d, fill: 'none', stroke: INK, 'stroke-width': 1.2, 'stroke-dasharray': '3 4', opacity: 0}, o));
    const img = (href, x, y, w, h, p) => el('image', {href, x, y, width: w, height: h, preserveAspectRatio: 'xMidYMid meet'}, p);
    const show = (node, t) => at(t, k => { node.setAttribute('opacity', ease(k)); node.setAttribute('transform', `translate(0,${(8 * (1 - ease(k))).toFixed(1)})`); }, .5);
    const flow = (path, colors, t, speed, n) => { const L = path.getTotalLength(), dots = Array.from({length: n || 2}, (_, j) => el('rect', {width: 6, height: 6, fill: colors[j % colors.length], opacity: 0}));
      at(t, (k, tt) => dots.forEach((d, j) => { const q = ((tt - t) * (speed || .6) + j / dots.length) % 1, p = path.getPointAtLength(q * L);
        d.setAttribute('x', (p.x - 3).toFixed(1)); d.setAttribute('y', (p.y - 3).toFixed(1)); d.setAttribute('opacity', Math.min(1, Math.sin(q * Math.PI) * 1.8).toFixed(2)); }), 1e9); };
    const type = (node, str, t, dur) => at(t, k => { node.textContent = str.slice(0, Math.round(str.length * k)); }, dur);
    // several lines typed one after the other
    const typeLines = (lines, x, y, lh, o, t, dur, p) => { const n = lines.join('').length, nodes = lines.map((_, i) => sans('', x, y + i * lh, o, p));
      let done = 0; lines.forEach((l, i) => { const d = dur * l.length / n; type(nodes[i], l, t + done, d); done += d; }); return nodes; };
    const tag = (s, x, y, o, p) => { const g = el('g', {opacity: 0}, p); const t = text(s, x + 8, y + 12.5, Object.assign({'font-size': 10.5}, o), g); el('rect', {x, y, width: s.length * 6.9 + 16, height: 18, fill: (o && o.bg) || '#FEF3C7', stroke: (o && o.line) || YELLOW, 'stroke-width': .8}, g); g.appendChild(t); return g; };
    return {steps, at, setRoot: g => { root = g || svg; }, el, text, sans, box, card, line, img, show, flow, type, typeLines, tag};
  }

  // ─────────────── Search & AI: RETRIEVE → AUGMENT → GENERATE, each phase lit up in the architecture
  function search(k){
    const {el, text, sans, box, card, line, img, show, flow, at, type, typeLines, tag, setRoot} = k;
    // phase stepper across the top
    const Z = [[0, 450], [480, 350], [870, 266]], PH = [['1  RETRIEVE', 'Hybrid search finds the right passages'], ['2  AUGMENT', 'The passages go into the prompt'], ['3  GENERATE', 'The LLM answers, with citations']];
    const tabs = PH.map(([t, s], i) => { const [x, w] = Z[i], g = el('g', {opacity: 0}), n = i < 2 ? 14 : 0;
      const pg = el('polygon', {points: `${x},0 ${x + w - n},0 ${x + w},23 ${x + w - n},46 ${x},46`, fill: '#fff', stroke: LINE, 'stroke-width': 1.2}, g);
      text(t, x + 16, 20, {'font-size': 12, fill: BLUE}, g); sans(s, x + 16, 37, {'font-size': 11.5, fill: CHAR}, g); show(g, .2 + i * .1); return pg; });
    const zones = Z.map(() => { const g = el('g', {}); g.style.transition = 'opacity .45s'; return g; });
    const phase = (t, i) => at(t, () => { const on = j => i < 0 || j === i; zones.forEach((z, j) => { z.style.opacity = on(j) ? 1 : .3; }); tabs.forEach((p, j) => { p.setAttribute('fill', on(j) ? '#FEF3C7' : '#fff'); p.setAttribute('stroke', on(j) ? YELLOW : LINE); p.setAttribute('stroke-width', on(j) ? 2 : 1.2); }); }, .1);

    // ── zone 1: retrieve
    setRoot(zones[0]);
    show(text('CUSTOMER QUESTION', 0, 70, {fill: GREY, 'font-weight': 500, 'font-size': 10, opacity: 0}), .4);
    const qb = box(0, 78, 450, 38, {rx: 19, fill: BG, stroke: LINE}); show(qb, .5);
    el('circle', {cx: 22, cy: 97, r: 6.5, fill: 'none', stroke: INK, 'stroke-width': 1.8}, qb); el('path', {d: 'M27,102 l6,6', stroke: INK, 'stroke-width': 1.8, 'stroke-linecap': 'round'}, qb);
    const qx = sans('', 46, 103, {fill: INK, 'font-size': 15, 'font-weight': 500}, qb); sans('Ask anything', 46, 103, {fill: GREY, 'font-size': 15}, qb).id = 'qph';
    type(qx, 'How do I reset my VPN token?', 3.2, 1.3); at(3.25, () => { const p = document.getElementById('qph'); if (p) p.setAttribute('opacity', 0); }, .1);
    const q1 = line('M225,116 L225,142', {stroke: BLUE}); show(q1, 1.0); flow(q1, [BLUE], 4.6, .8, 2);
    const es = box(0, 142, 450, 234, {c: BLUE, sw: 1.4}); show(es, 1.0); const m = el('g', {}, es); m.innerHTML = EW.MARK.replace('<svg ', '<svg x="14" y="150" width="22" height="22" ');
    text('ELASTICSEARCH · VECTOR DATABASE', 44, 166, {'font-size': 11}, es);
    const inq = card(14, 214, 72, 44, '', '', {fill: BG, stroke: LINE}); text('INPUT', 50, 233, {'text-anchor': 'middle', 'font-size': 9.5}, inq); text('QUERY', 50, 247, {'text-anchor': 'middle', 'font-size': 9.5}, inq); show(inq, 1.3);
    const sem = card(112, 186, 132, 52, 'SEMANTIC', 'kNN on embeddings', {c: YELLOW, fill: '#fff'}), lex = card(112, 252, 132, 52, 'LEXICAL', 'BM25 keywords', {c: YELLOW, fill: '#fff'}); show(sem, 1.5); show(lex, 1.6);
    const cmb = card(272, 214, 92, 56, 'COMBINE', 'RRF + rerank', {c: YELLOW}); show(cmb, 1.8);
    const topk = box(388, 220, 50, 44, {fill: '#fff'}); text('TOP', 413, 238, {'text-anchor': 'middle', 'font-size': 10, fill: BLUE}, topk); text('K', 413, 254, {'text-anchor': 'middle', 'font-size': 12, fill: BLUE}, topk); show(topk, 2.0);
    [['M86,230 C100,230 100,212 112,212', 1.6], ['M86,242 C100,242 100,278 112,278', 1.7], ['M244,212 C258,212 258,236 272,236', 1.9], ['M244,278 C258,278 258,248 272,248', 1.9], ['M364,242 L388,242', 2.1]].forEach(([d, t], i) => { const p = line(d, {stroke: INK}); show(p, t); flow(p, [BLUE, YELLOW], 4.9 + i * .12, .9, 1); });
    show(tag('DOCUMENT-LEVEL SECURITY', 14, 332, {bg: '#EEF4FF', line: BLUE, fill: BLUE}), 2.2);
    // private data, fresh and secure
    show(text('PRIVATE DATA  ·  FRESH AND SECURE', 0, 406, {fill: GREY, 'font-weight': 500, 'font-size': 10, opacity: 0}), .5);
    const tiles = ['src-confluence', 'src-sharepoint', 'src-gdrive', 'src-slack', 'src-github', 'src-salesforce'].map((s, i) => { const x = i * 76, g = box(x, 414, 66, 56, {stroke: LINE}); img('logos/' + s + '.png', x + 14, 424, 38, 36, g); show(g, .6 + i * .07); return g; });
    const p0 = line('M225,414 L225,376', {stroke: TEAL}); show(p0, 1.0); flow(p0, [TEAL, YELLOW, PINK], 1.2, .6, 3);
    show(sans('Connectors sync, chunk and embed your content', 0, 496, {'font-size': 12.5, fill: CHAR, opacity: 0}), 1.0); show(sans('ELSER, Jina, or bring your own embedding model', 0, 514, {'font-size': 11.5, opacity: 0}), 1.1);
    [0, 3, 1].forEach((i, n) => at(5.2 + n * .25, kk => { const r = tiles[i].firstChild; r.setAttribute('stroke', YELLOW); r.setAttribute('stroke-width', 1 + 2.5 * ease(kk)); }, .4));
    at(5.6, kk => topk.firstChild.setAttribute('fill', kk > .5 ? '#FEF3C7' : '#fff'), .4);

    // ── zone 2: augment: a prompt big enough to read like an LLM prompt
    setRoot(zones[1]);
    const pc = el('g', {opacity: 0}); el('rect', {x: 484, y: 70, width: 350, height: 462, rx: 16, fill: 'rgba(11,100,221,.10)'}, pc);
    el('rect', {x: 480, y: 66, width: 350, height: 462, rx: 16, fill: '#fff', stroke: BLUE, 'stroke-width': 1.6}, pc); show(pc, 1.8);
    el('rect', {x: 498, y: 82, width: 76, height: 22, rx: 11, fill: BLUE}, pc); text('PROMPT', 536, 97, {fill: '#fff', 'text-anchor': 'middle', 'font-size': 10.5}, pc);
    text('≈ 1,240 TOKENS', 814, 97, {fill: GREY, 'text-anchor': 'end', 'font-size': 9.5, 'font-weight': 500}, pc);
    text('SYSTEM', 498, 128, {fill: GREY, 'font-size': 9.5, 'font-weight': 500}, pc);
    typeLines(['You are an IT help assistant. Answer only', 'from the context. Cite your sources.'], 498, 148, 19, {fill: CHAR, 'font-size': 13.5}, 6.3, 1.0, pc);
    text('CONTEXT · RETRIEVED FROM YOUR DOCUMENTS', 498, 196, {fill: GREY, 'font-size': 9.5, 'font-weight': 500}, pc);
    [['src-confluence', 'Confluence · VPN token reset guide', ['Open the IT portal, go to Security, then', 'VPN token and select Reset.']], ['src-sharepoint', 'SharePoint · IT policy: MFA', ['A push notification is sent to your', 'registered device within a minute.']], ['src-slack', 'Slack · #it-help thread', ['Reset takes effect immediately. Open a', 'ticket if the push does not arrive.']]].forEach(([lg, ti, ln], i) => { const y = 206 + i * 82;
      el('rect', {x: 498, y, width: 316, height: 74, rx: 10, fill: BG, stroke: LINE, 'stroke-dasharray': '3 3'}, pc);
      const c = el('g', {opacity: 0}); el('rect', {x: 498, y, width: 316, height: 74, rx: 10, fill: '#FEF3C7', stroke: YELLOW}, c); img('logos/' + lg + '.png', 508, y + 8, 18, 18, c);
      sans(ti, 534, y + 22, {fill: INK, 'font-size': 13, 'font-weight': 600}, c); ln.forEach((l, j) => sans(l, 510, y + 44 + j * 17, {fill: CHAR, 'font-size': 12}, c)); show(c, 6.6 + i * .4);
      const yy = [200, 250, 300][i], p = line(`M450,${yy} C466,${yy} 470,${y + 37} 498,${y + 37}`, {stroke: YELLOW, 'stroke-width': 1.8}); show(p, 6.4 + i * .4); flow(p, [YELLOW, PINK], 6.5 + i * .4, .9, 1); });
    text('QUESTION', 498, 462, {fill: GREY, 'font-size': 9.5, 'font-weight': 500}, pc);
    el('rect', {x: 498, y: 470, width: 316, height: 44, rx: 12, fill: BG, stroke: LINE}, pc);
    const pq = sans('', 514, 498, {fill: INK, 'font-size': 15.5, 'font-weight': 500}, pc); type(pq, 'How do I reset my VPN token?', 7.9, .9);
    const send = el('g', {}, pc); el('circle', {cx: 790, cy: 492, r: 13, fill: BLUE}, send); el('path', {d: 'M790,498 V486 M785,491 l5,-5 l5,5', fill: 'none', stroke: '#fff', 'stroke-width': 1.8, 'stroke-linecap': 'round'}, send);

    // ── zone 3: generate
    setRoot(zones[2]);
    const lm = card(874, 66, 262, 140, 'LLM', 'Elastic Inference Service,', {c: PINK}); show(lm, 2.2); sans('or bring your own model', 890, 62 + 58, {'font-size': 12}, lm);
    ['m-anthropic', 'm-openai', 'm-gemini', 'm-mistral', 'm-ollama', 'm-qwen'].forEach((s, i) => img('logos/' + s + '.png', 890 + i * 38, 160, 26, 26, lm));
    const la = line('M830,136 L874,136', {stroke: PINK}); show(la, 2.2); flow(la, [PINK, BLUE], 8.9, .9, 1);
    const lb = line('M1005,206 L1005,248', {stroke: PINK}); show(lb, 2.3); flow(lb, [PINK], 9.2, .9, 1);
    const an = box(874, 248, 262, 240, {c: YELLOW}); show(an, 2.3);
    text('GROUNDED ANSWER', 892, 272, {fill: BLUE, 'font-size': 11}, an);
    typeLines(['Open the IT portal, choose', 'Security, then VPN token,', 'and select Reset. You will get', 'a push notification on your', 'registered device within a', 'minute.'], 892, 302, 23, {fill: INK, 'font-size': 14}, 9.4, 3.0, an);
    show(tag('Confluence · VPN guide', 892, 436), 12.6); show(tag('Slack · #it-help', 892, 460), 12.8);

    setRoot(null);
    phase(3.0, 0); phase(6.2, 1); phase(8.8, 2); phase(13.0, -1);
    return 13.4;
  }

  // ─────────────── Observability: the whole user journey, three signals correlated, AI remediation
  function obs(k){
    const {el, text, sans, box, card, line, img, show, flow, at, type, typeLines, tag} = k;
    const hl = (word, rest, y, t) => { const g = el('g', {opacity: 0}), w = text(word, 4, y, {fill: PINK, 'font-size': 13, 'font-weight': 800}, g), bb = w.getBBox();
      el('rect', {x: 0, y: bb.y - 1, width: bb.width + 8, height: bb.height + 2, fill: PINK, opacity: .16}, g); g.appendChild(w); text(rest.toUpperCase(), bb.width + 16, y, {fill: GREY, 'font-weight': 500, 'font-size': 10.5}, g); show(g, t); };
    show(text('USER JOURNEY · RUM + SYNTHETICS', 0, 12, {fill: GREY, 'font-weight': 500, 'font-size': 10.5, opacity: 0}), .2);
    const steps = ['Browse', 'Search', 'Add to cart', 'Checkout', 'Pay'], chips = steps.map((s, i) => { const g = box(i * 152, 22, 134, 34, {stroke: INK}); text(s.toUpperCase(), i * 152 + 12, 43, {'font-size': 11.5}, g); show(g, .3 + i * .1); return g; });
    const jl = line('M67,66 L719,66', {stroke: PINK}); show(jl, .8);
    const dot = el('circle', {cx: 67, cy: 66, r: 6, fill: PINK, opacity: 0});
    at(1.0, kk => { dot.setAttribute('opacity', 1); dot.setAttribute('cx', (67 + 4 * 152 * Math.min(1, kk / .8)).toFixed(1)); }, 1.5);
    show(text('SERVICES · OPENTELEMETRY', 0, 98, {fill: GREY, 'font-weight': 500, 'font-size': 10.5, opacity: 0}), .9);
    const svc = ['Frontend', 'Cart', 'Checkout', 'Payment', 'Database'], sn = svc.map((s, i) => { const g = box(i * 152, 108, 134, 34, {stroke: LINE, fill: BG}); text(s.toUpperCase(), i * 152 + 12, 129, {'font-size': 11, fill: CHAR}, g); show(g, 1.0 + i * .08); return g; });
    [0, 1, 2, 3].forEach(i => show(line(`M${i * 152 + 134},125 L${i * 152 + 152},125`), 1.2));
    const ot = box(0, 152, 760, 24, {dash: '3 3'}); text('OPENTELEMETRY   →   ELASTIC     ·     one trace.id across every signal', 380, 168, {'text-anchor': 'middle', 'font-size': 10.5}, ot); show(ot, 1.4);
    const op = el('path', {d: 'M8,164 L752,164', fill: 'none', stroke: 'none'}); flow(op, [BLUE, PINK, TEAL], 1.6, .4, 4);
    // traces
    hl('TRACES', 'APM · distributed trace', 204, 1.6);
    [[0, 760, 'frontend'], [50, 690, 'checkout'], [120, 520, 'payment'], [170, 470, 'gateway call'], [250, 150, 'db query']].forEach(([x, w, n], i) => { const y = 214 + i * 19, bad = i === 2 || i === 3;
      const r = el('rect', {x, y, width: 0, height: 13, fill: bad ? RED : BLUE, opacity: bad ? .9 : .9 - i * .12}); const tl = text(n, x + 6, y + 10, {fill: '#fff', 'font-size': 9.5, opacity: 0});
      at(1.8 + i * .12, kk => { r.setAttribute('width', (w * ease(kk)).toFixed(1)); tl.setAttribute('opacity', ease(kk)); }, .6); });
    // logs
    hl('LOGS', 'log analytics', 330, 2.2);
    const logs = [['INFO ', 'checkout', 'order created', 'trace.id=7f3a'], ['WARN ', 'payment ', 'retry 1/3', 'trace.id=7f3a'], ['ERROR', 'payment ', 'gateway timeout after 4000ms', 'trace.id=7f3a'], ['INFO ', 'frontend', '503 returned to user', 'trace.id=7f3a']];
    logs.forEach(([lv, s, m, tr], i) => { const y = 350 + i * 19, bad = lv === 'ERROR';
      const g = el('g', {opacity: 0}); if (bad) el('rect', {x: -4, y: y - 12, width: 768, height: 17, fill: RED, opacity: .1}, g);
      text(`12:01:0${7 + (i > 1)} ${lv} ${s} ${m}`, 0, y, {'font-weight': 400, 'font-size': 12, fill: bad ? RED : CHAR, 'xml:space': 'preserve'}, g); text(tr, 760, y, {'font-weight': 500, 'font-size': 10.5, fill: PINK, 'text-anchor': 'end'}, g); show(g, 2.4 + i * .12); });
    // metrics
    hl('METRICS', 'infrastructure · Kubernetes', 448, 2.8);
    ['CPU · payment pod', 'p95 latency', 'error rate', 'DB connections'].forEach((n, i) => { const x = i * 202, g = box(x, 460, 172, 86, {stroke: LINE});
      text(n.toUpperCase(), x + 10, 478, {'font-size': 9.5, fill: GREY, 'font-weight': 500}, g);
      const pts = Array.from({length: 22}, (_, j) => `${x + 10 + j * 7.3},${532 - (i < 3 && j > 14 ? 10 + (j - 14) * 5.2 : 6 + ((j * 7 + i * 3) % 7))}`).join(' ');
      el('polyline', {points: pts, fill: 'none', stroke: i < 3 ? RED : BLUE, 'stroke-width': 1.6}, g); show(g, 3.0 + i * .1); });
    // correlation: one moment, seen in all three signals
    const cb = el('g', {opacity: 0}); el('rect', {x: 524, y: 192, width: 40, height: 354, fill: PINK, opacity: .1}, cb); el('rect', {x: 524, y: 192, width: 40, height: 354, fill: 'none', stroke: PINK, 'stroke-width': 1.4, 'stroke-dasharray': '4 3'}, cb);
    const ct = tag('CORRELATED · trace.id 7f3a', 440, 570 - 22 - 340, {bg: '#fff', line: PINK, fill: PINK}); show(cb, 4.0); show(ct, 4.2);
    const fail = el('rect', {x: 3 * 152, y: 108, width: 134, height: 34, fill: 'none', stroke: RED, 'stroke-width': 2.2, opacity: 0}), pf = chips[4].firstChild;
    at(3.9, (kk, tt) => { fail.setAttribute('opacity', (.5 + .5 * Math.sin((tt - 3.9) * 6)).toFixed(2)); pf.setAttribute('stroke', RED); pf.setAttribute('stroke-width', 2.2); }, 1e9);
    // the AI assistant
    const ai = box(800, 0, 336, 560, {c: PINK, sw: 1.4}); show(ai, 4.4);
    const mk = el('g', {}, ai); mk.innerHTML = EW.MARK.replace('<svg ', '<svg x="820" y="14" width="22" height="22" ');
    text('AI ASSISTANT', 850, 31, {fill: INK, 'font-size': 12}, ai); text('illustrative scenario', 1116, 31, {'text-anchor': 'end', fill: GREY, 'font-weight': 500, 'font-size': 9}, ai);
    const inv = sans('', 820, 66, {fill: GREY, 'font-size': 12}, ai); type(inv, 'Investigating 14 services, 6,203 log lines…', 4.6, 1.0);
    el('rect', {x: 820, y: 76, width: 296, height: 3, fill: LINE}, ai); const pb = el('rect', {x: 820, y: 76, width: 0, height: 3, fill: PINK}, ai); at(4.8, kk => pb.setAttribute('width', (296 * kk).toFixed(1)), 1.2);
    show(text('ROOT CAUSE', 820, 108, {fill: PINK, 'font-size': 11, 'font-weight': 800, opacity: 0}), 6.0);
    typeLines(['Payment calls to the gateway time', 'out since release v2.4.1. The', 'connection pool is saturated, which', 'drives the checkout errors.'], 820, 130, 19, {fill: INK, 'font-size': 13}, 6.2, 2.4, ai);
    show(text('REMEDIATION', 820, 232, {fill: PINK, 'font-size': 11, 'font-weight': 800, opacity: 0}), 8.4);
    ['Roll back payment to v2.4.0', 'Raise the gateway pool size, 20 to 50', 'Alert on payment p95 latency'].forEach((s, i) => { const y = 244 + i * 46, g = el('g', {opacity: 0}); el('rect', {x: 820, y, width: 296, height: 38, fill: BG, stroke: LINE}, g);
      el('circle', {cx: 840, cy: y + 19, r: 9, fill: '#fff', stroke: TEAL, 'stroke-width': 1.5}, g); el('path', {d: `M835.5,${y + 19} l3.5,3.5 l6,-7`, fill: 'none', stroke: TEAL, 'stroke-width': 2}, g);
      sans(s, 858, y + 24, {fill: INK, 'font-size': 13, 'font-weight': 500}, g); show(g, 8.7 + i * .5); });
    // the assistant builds a dashboard as part of its answer
    show(text('DASHBOARD CREATED', 820, 408, {fill: PINK, 'font-size': 11, 'font-weight': 800, opacity: 0}), 10.4);
    const db = box(820, 418, 296, 100, {stroke: PINK, sw: 1.3}); show(db, 10.6);
    text('CHECKOUT HEALTH', 832, 438, {'font-size': 10.5}, db); sans('built by AI Assistant', 1104, 438, {'font-size': 10.5, 'text-anchor': 'end'}, db);
    [['ERROR RATE', 0], ['P95 LATENCY', 1], ['PAYMENT CPU', 2]].forEach(([n, i]) => { const x = 832 + i * 94;
      el('rect', {x, y: 448, width: 88, height: 60, fill: BG, stroke: LINE}, db); text(n, x + 6, 460, {'font-size': 7.5, fill: GREY, 'font-weight': 500}, db);
      if (i === 1) [0, 1, 2, 3, 4, 5].forEach(j => { const h = [10, 12, 11, 22, 30, 34][j], bar = el('rect', {x: x + 8 + j * 13, y: 500 - 0, width: 9, height: 0, fill: j > 2 ? RED : BLUE}, db); at(11.0 + j * .08, kk => { bar.setAttribute('height', (h * ease(kk)).toFixed(1)); bar.setAttribute('y', (500 - h * ease(kk)).toFixed(1)); }, .4); });
      else { const pts = Array.from({length: 11}, (_, j) => `${x + 8 + j * 7.2},${498 - (j > 6 ? 6 + (j - 6) * 6 : 4 + ((j * 5 + i) % 5))}`).join(' '), pl = el('polyline', {points: pts, fill: 'none', stroke: i === 0 ? RED : RED, 'stroke-width': 1.6, 'stroke-dasharray': 120, 'stroke-dashoffset': 120}, db); at(11.0 + i * .1, kk => pl.setAttribute('stroke-dashoffset', (120 * (1 - ease(kk))).toFixed(1)), .8); } });
    show(tag('Open dashboard', 820, 530, {bg: PINK, line: PINK, fill: '#fff'}), 12.0); show(tag('Open case', 940, 530, {bg: '#fff', line: PINK, fill: PINK}), 12.15);
    return 12.6;
  }

  // ─────────────── Security: every layer → detection → SIEM → Attack Discovery → SOAR → agentic workflows and response
  function sec(k){
    const {el, text, sans, box, card, line, img, show, flow, at, tag} = k;
    const hdr = (s, y, t) => show(text(s, 0, y, {fill: GREY, 'font-weight': 500, 'font-size': 10.5, opacity: 0}), t);
    hdr('EVERY LAYER', 10, .2);
    const L = [['Entity', ['sec-okta.svg', 'AD', 'Entra ID']], ['SaaS', ['M365', 'src-zoom.png', 'src-salesforce.png']], ['CDN / WAF', ['sec-akamai.svg', 'Imperva', 'sec-cloudflare.svg']],
      ['Web', ['IIS', 'sec-apache.svg', 'sec-nginx.svg']], ['Platform', ['src-kubernetes.png', 'sec-containerd.svg', 'src-linux.png', 'src-microsoft.png']], ['Cloud', ['src-azure.png', 'src-aws.png', 'src-gcp.png']],
      ['Devices', ['src-cisco.png', 'sec-dell.svg', 'src-paloalto.png', 'sec-fortinet.svg']], ['Endpoints', ['sec-apple.svg', 'src-microsoft.png', 'src-linux.png']]];
    const CW = 130, CX = i => i * 143;
    L.forEach(([n, logos], i) => { const x = CX(i), y = 18, g = box(x, y, CW, 100, {stroke: LINE}); el('rect', {x, y, width: CW, height: 4, fill: TEAL}, g); text(n.toUpperCase(), x + 10, y + 22, {'font-size': 10.5}, g);
      logos.forEach((l, j) => { const lx = x + 10 + (j % 3) * 38, ly = y + 34 + Math.floor(j / 3) * 32;
        if (/\.(png|svg)$/.test(l)) img('logos/' + l, lx, ly, 34, 28, g); else { el('rect', {x: lx, y: ly + 3, width: 34, height: 22, fill: BG, stroke: LINE}, g); text(l.toUpperCase(), lx + 17, ly + 17, {'text-anchor': 'middle', 'font-size': 7.5, fill: CHAR}, g); } });
      show(g, .3 + i * .08); });
    // detection, under the layers it watches
    const det = (c0, c1, lines, t) => { const x = CX(c0), w = CX(c1) + CW - x, g = box(x, 150, w, 40, {fill: BLUE, stroke: BLUE, rx: 6});
      text(lines, x + w / 2, 175, {fill: '#fff', 'text-anchor': 'middle', 'font-size': 12}, g); show(g, t); return [x + w / 2, 150]; };
    const d = [det(0, 1, 'UEBA', 1.0), det(2, 3, 'RULES · ML', 1.1), det(4, 5, 'CWP · CVM · KSPM · CSPM', 1.2), det(6, 7, 'XDR · EDR', 1.3)];
    L.forEach((_, i) => { const x = CX(i) + CW / 2, dx = d[Math.floor(i / 2)][0], p = line(`M${x},118 L${x},134 L${dx},134 L${dx},150`, {stroke: TEAL, 'stroke-dasharray': '2 4'}); show(p, .9 + i * .05); flow(p, [TEAL, YELLOW, PINK], 1.6 + i * .1, .6, 1); });
    // the pipeline, one band per stage
    const band = (y, h, c, title, sub, t) => { const g = box(0, y, 1136, h, {c, sw: 1.2}); text(title, 20, y + 24, {'font-size': 12.5, 'font-weight': 700}, g); if (sub) sans(sub, 20, y + 42, {'font-size': 12}, g); show(g, t); return g; };
    const arrow = (y, t) => { [284, 568, 852].forEach((x, i) => { const p = line(`M${x},${y} L${x},${y + 18}`, {stroke: INK}); show(p, t); flow(p, [BLUE], t + .4 + i * .15, .9, 1); }); };
    d.forEach(([x], i) => { const p = line(`M${x},190 V210`, {stroke: BLUE}); show(p, 1.4); flow(p, [BLUE], 1.8 + i * .15, .9, 1); });
    band(210, 48, BLUE, 'SIEM', 'Detection rules on all your data', 1.4);
    const cnt = text('0', 1060, 246, {'text-anchor': 'end', fill: RED, 'font-size': 26, 'font-weight': 600, opacity: 0}); show(cnt, 2.0); text('ALERTS', 1124, 246, {'text-anchor': 'end', fill: GREY, 'font-size': 9.5, 'font-weight': 500});
    at(2.1, kk => { cnt.textContent = Math.round(12 * ease(kk)); }, 1.2);
    arrow(258, 2.0);
    // Attack Discovery: the attack, laid out as a MITRE ATT&CK chain
    band(276, 118, ORANGE, 'AGENTIC SOC · ATTACK DISCOVERY', 'Alerts become one explained attack', 2.4);
    show(tag('MITRE ATT&CK®', 20, 356, {bg: '#fff', line: ORANGE, fill: ORANGE}), 4.6);
    const sq = Array.from({length: 12}, (_, i) => el('rect', {x: 300 + i * 18, y: 326, width: 14, height: 14, fill: RED, opacity: 0}));
    const one = el('g', {opacity: 0}); el('rect', {x: 292, y: 304, width: 112, height: 62, fill: RED}, one); text('1 ATTACK', 348, 332, {'text-anchor': 'middle', fill: '#fff', 'font-size': 13, 'font-weight': 800}, one); text('EXPLAINED', 348, 352, {'text-anchor': 'middle', fill: '#fff', 'font-size': 9, 'font-weight': 500}, one);
    at(3.2, kk => sq.forEach((s, i) => s.setAttribute('opacity', ease(clamp(kk * 3 - i * .15)))), .8);
    at(4.2, kk => { const e = ease(kk); sq.forEach((s, i) => { const x0 = 300 + i * 18; s.setAttribute('x', (x0 + (348 - 7 - x0) * e).toFixed(1)); s.setAttribute('opacity', (1 - e).toFixed(2)); }); one.setAttribute('opacity', e); }, .7);
    [['INITIAL ACCESS', 'TA0001', 'T1566', 'Phishing'], ['CREDENTIAL ACCESS', 'TA0006', 'T1003', 'OS Credential Dumping'], ['LATERAL MOVEMENT', 'TA0008', 'T1021', 'Remote Services'], ['EXFILTRATION', 'TA0010', 'T1041', 'Exfiltration Over C2']].forEach(([ta, id, tq, nm], i) => { const x = 440 + i * 174, g = el('g', {opacity: 0});
      el('rect', {x, y: 292, width: 160, height: 86, fill: '#fff', stroke: INK}, g); el('rect', {x, y: 292, width: 160, height: 24, fill: INK}, g); text(ta, x + 8, 308, {fill: '#fff', 'font-size': 9.5}, g); text(id, x + 152, 308, {fill: '#FFB19F', 'text-anchor': 'end', 'font-size': 8.5, 'font-weight': 500}, g);
      text(tq, x + 10, 338, {fill: ORANGE, 'font-size': 14, 'font-weight': 800}, g); sans(nm, x + 10, 358, {fill: INK, 'font-size': 12, 'font-weight': 500}, g); sans('technique', x + 10, 371, {'font-size': 9.5}, g);
      if (i) text('›', x - 12, 340, {fill: ORANGE, 'font-size': 22, 'text-anchor': 'middle'}, g); show(g, 4.9 + i * .5); });
    arrow(394, 2.6);
    band(412, 56, TEAL, 'SOAR · WORKFLOWS', '', 2.8);
    ['Enrich the indicators', 'Isolate the host', 'Disable the user', 'Notify the owner'].forEach((s, i) => { const x = 300 + i * 208, g = el('g', {opacity: 0}); el('rect', {x: x, y: 422, width: 196, height: 36, fill: BG, stroke: LINE}, g); el('rect', {x: x + 10, y: 434, width: 12, height: 12, fill: 'none', stroke: TEAL, 'stroke-width': 1.4}, g);
      el('path', {d: `M${x + 12.5},440 l3,3 l5,-6`, fill: 'none', stroke: TEAL, 'stroke-width': 1.8}, g); sans(s, x + 30, 445, {fill: INK, 'font-size': 12.5, 'font-weight': 500}, g); show(g, 6.6 + i * .35); });
    arrow(468, 3.0);
    band(486, 80, INK, 'AGENTIC WORKFLOWS & RESPONSE', 'Autonomous, or an analyst approves', 3.2);
    ['Isolate host-42', 'Disable j.doe', 'Open case SEC-1187'].forEach((s, i) => { const x = 300 + i * 208, g = el('g', {opacity: 0}); el('rect', {x, y: 498, width: 196, height: 54, fill: '#fff', stroke: INK}, g);
      sans(s, x + 12, 520, {fill: INK, 'font-size': 13, 'font-weight': 600}, g); el('rect', {x: x + 12, y: 530, width: 38, height: 15, fill: TEAL}, g); text('DONE', x + 31, 541, {'text-anchor': 'middle', fill: '#fff', 'font-size': 8.5}, g); show(g, 7.8 + i * .45); });
    const sw = el('g', {opacity: 0}); el('rect', {x: 1010, y: 512, width: 100, height: 26, rx: 13, fill: TEAL}, sw); el('circle', {cx: 1095, cy: 525, r: 10, fill: '#fff'}, sw); text('AUTO', 1034, 529, {fill: '#fff', 'font-size': 10.5}, sw); show(sw, 9.2);
    // the response goes back to the endpoint layer
    const back = line('M1136,525 H1142 V68 H1124', {stroke: TEAL, 'stroke-width': 1.8, 'stroke-dasharray': '4 4'}); show(back, 9.6); flow(back, [TEAL], 9.8, .35, 2);
    show(tag('RESPONSE BACK TO THE ENDPOINT', 860, -8, {bg: '#fff', line: TEAL, fill: TEAL}), 9.8);
    return 10.6;
  }

  const SCENES = {search, obs, sec};
  window.DEEP = {run(svg, name, opts){
    opts = opts || {};
    if (svg._stop) svg._stop(); svg.innerHTML = '';
    const k = kit(svg), END = SCENES[name](k), still = navigator.webdriver || opts.jump; let t0 = performance.now() - (still ? (END + 1) * 1000 : 0), raf, dead = false, ended = false;
    const f = () => { if (dead) return; const t = (performance.now() - t0) / 1000;
      k.steps.forEach(s => { if (t >= s.t) s.f(s.dur >= 1e9 ? 0 : clamp((t - s.t) / s.dur), t); });
      if (!ended && t > END){ ended = true; if (opts.onEnd) opts.onEnd(); }
      raf = requestAnimationFrame(f); };
    svg._stop = () => { dead = true; cancelAnimationFrame(raf); }; raf = requestAnimationFrame(f);
  }, stop(svg){ if (svg._stop) svg._stop(); }};
})();
