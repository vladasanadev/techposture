// 05 · Library · Vending machine (direction 23 prototype, ?proto=vending).
// A tabletop vending machine stocked with everything she has written, packaged and built. Behind the glass, shelves of
// spiral coils: guides are little zines, skills are cartridges, products are app boxes. Each slot has a code and a price
// tag on its shelf strip, and each shelf strip says what it holds. On the right: a 1-bit LCD and a keypad.
// Pick a package (or type its code): the coil turns, the package drops into the tray with a thunk, and the LCD shows
// what it is. Then tap the package in the tray, or press OPEN, to open it in a new tab.
// Desktop: 8 slots a shelf (guides take two shelves). Phones: 5 a shelf, so the packages stay big enough to read.

const f2 = (n) => Math.round(n * 100) / 100;
const D2R = Math.PI / 180;
const LCD = ['var(--lcd)', 'color-mix(in oklab, var(--lcd-ink) 22%, var(--lcd))', 'color-mix(in oklab, var(--lcd-ink) 58%, var(--lcd))', 'var(--lcd-ink)'];
const LCD_OFF = 'color-mix(in oklab, var(--m-glass) 84%, var(--lcd))';
const PIXF = 'Pixelify Sans', MONO = 'Azeret Mono';
const ACC = 'var(--m-accent)';
const priceOf = (it) => (it.price ? `$${it.price}` : 'FREE');
const domainOf = (u) => String(u || '').replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

/* the words printed on each guide's cover: a small kicker and the big title, taken from its name */
const COVER = {
  automations: ['AUTOMATIONS', ['BUSY', 'BRAIN']],
  bundle: ['PLAYBOOK', ['JOB', 'SEARCH']],
  'harness-101': ['HARNESS', ['101']],
  'top-5-claude-skills': ['CLAUDE SKILLS', ['TOP 5']],
  'gpt-6-astra': ['GPT-6', ['ASTRA']],
  'ai-agents': ['THAT RUN MY CONTENT', ['3 AI', 'AGENTS']],
  lazymaxxing: ['VIDEO EDIT', ['LAZY', 'MAXXING']],
  git: ['EVERYTHING ABOUT', ['GIT']],
  api: ['EVERYTHING ABOUT', ['APIs']],
  database: ['EVERYTHING ABOUT', ['DATA', 'BASE']],
  docker: ['EVERYTHING ABOUT', ['DOCKER']],
  behavioral: ['BEHAVIORAL', ['INTER', 'VIEWS']],
  'ai-code-review': ['REVIEWING', ['AI', 'CODE']],
  'react-2026': ['ROADMAP', ['REACT', '2026']],
  'land-a-job': ['IN 2026', ['LAND', 'A JOB']],
};
const coverOf = (it) => {
  if (COVER[it.id]) return COVER[it.id];
  const w = String(it.name).toUpperCase().split(' ');
  return w.length > 1 ? [w.slice(0, -1).join(' '), [w[w.length - 1]]] : ['', [w[0]]];
};
/* a little pictogram for each skill and product (drawn, so it follows the theme) */
const GLYPH = { womansplain: 'bubble', 'ledger-dmk': 'stick', 'net-motion': 'net', 'travel-agent': 'plane', water: 'drop', 'live-edit': 'play', 'reel-styles': 'film', 'claude-md': 'doc' };
/* guide covers: paper colours from the theme, each with an ink and a motif colour */
const ZINE = [
  { bg: 'paper', ink: 'var(--paper-ink)', mot: 'var(--m-accent)' },
  { bg: 'note', ink: 'var(--note-ink)', mot: 'var(--m-cta)' },
  { bg: 'pcb', ink: 'var(--m-paper)', mot: 'var(--m-duck)' },
  { bg: 'note2', ink: 'var(--note-ink)', mot: 'var(--m-accent2)' },
  { bg: 'duck', ink: 'var(--paper-ink)', mot: 'var(--paper-ink)' },
  { bg: 'mug', ink: 'var(--paper-ink)', mot: 'var(--m-paper)' },
];
const MOTIFS = ['sun', 'stripes', 'dots', 'wave', 'stack', 'arch'];
const CART = ['duck', 'accent2', 'cta'];
const TILE = ['accent', 'accent2', 'leaf', 'duck', 'cta'];

function wrapWords(s, n) {
  const out = [];
  let line = '';
  for (let w of String(s).split(' ')) {
    while (w.length > n) { if (line) { out.push(line); line = ''; } out.push(w.slice(0, n)); w = w.slice(n); }
    if (!line) line = w; else if ((line + ' ' + w).length <= n) line += ' ' + w; else { out.push(line); line = w; }
  }
  if (line) out.push(line);
  return out;
}

/** The shelves: each kind in library order, cut into rows of `per`; every slot gets a code (A1, A2, ...). */
function stock(lib, per) {
  const kinds = lib?.kinds?.length ? lib.kinds : [{ id: 'guide', label: 'Guides' }, { id: 'skill', label: 'Skills' }, { id: 'product', label: 'Products' }];
  const items = lib?.items || [];
  const rows = [], slots = [];
  for (const k of kinds) {
    const its = items.filter((i) => i.kind === k.id);
    for (let s = 0; s < its.length; s += per) {
      const r = rows.length, letter = String.fromCharCode(65 + r);
      const row = { r, kind: k.id, label: k.label, letter, first: s === 0, slots: [] };
      its.slice(s, s + per).forEach((it, c) => { const sl = { it, kind: k.id, r, c, code: letter + (c + 1), i: slots.length, row }; row.slots.push(sl); slots.push(sl); });
      rows.push(row);
    }
  }
  return { kinds, rows, slots, maxCols: Math.max(1, ...rows.map((r) => r.slots.length)) };
}

/** The machine's layout, in front-face units (a across, b down from the top). */
function layout(wide, S) {
  const nr = S.rows.length;
  if (wide) {
    const gx = 14, gw = 288, gy = 38, rh = 41, gh = nr * rh + 5;
    const px = gx + gw + 14, pw = 118;
    const ty = gy + gh + 11, th = 31;
    const H = ty + th + 9, W = px + pw + 14;
    const cols = 4;
    const nKeys = nr + S.maxCols;
    const kRows = Math.ceil(nKeys / cols);
    const ky = gy + 86, kh = gy + gh - ky;
    return {
      wide, TURN: 40, W, H, D: 46, Dw: 34, Z0: 7, gx, gy, gw, gh, rh, railH: 9,
      head: [gx, 10, W - gx * 2, 21],
      lcd: [px, gy, pw, 78],
      keys: { x: px, y: ky, w: pw, h: kh, cols, rows: kRows, gap: 5 },
      tray: [gx, ty, gw, th],
      open: [px + 36, ty + 1, pw - 36, th - 2], clr: [px, ty + 3.5, 30, th - 7],
    };
  }
  const gx = 10, gw = 180, gy = 36, rh = 41, gh = nr * rh + 5;
  const py = gy + gh + 10;
  const ky = py + 68 + 8, kh = 34;
  const ty = ky + kh + 11, th = 32;
  const H = ty + th + 10, W = 200;
  const cols = Math.max(nr, S.maxCols);
  const kRows = Math.ceil((nr + S.maxCols) / cols);
  return {
    wide, TURN: 41, W, H, D: 42, Dw: 31, Z0: 6, gx, gy, gw, gh, rh, railH: 8.4,
    head: [10, 8, W - 20, 22],
    lcd: [gx, py, gw, 68],
    keys: { x: gx, y: ky, w: 114, h: kh, cols, rows: kRows, gap: 3 },
    tray: [gx, ty, gw, th],
    open: [gx + 122, ky, gw - 122, 17], clr: [gx + 122, ky + 21, 24, 13],
  };
}

/* ====================================================================================================== */
/* the machine (shared by the section and the hero)                                                        */
/* ====================================================================================================== */
function machine(K, iso, root, S, L, o = {}) {
  const { g, el, face, txt, plane, shift, rrect, circle, MAT, P, at, dpoly, add, mul } = iso;
  const HERO = !!o.hero;
  const { W, H, D, Dw, Z0, gx, gy, gw, gh, rh, railH } = L;
  const phi = L.TURN * D2R;
  const ex = [Math.cos(phi), -Math.sin(phi), 0], ey = [Math.sin(phi), Math.cos(phi), 0], ez = [0, 0, 1], dn = [0, 0, -1];
  const Wp = (a, d, z) => [ex[0] * a + ey[0] * d, ex[1] * a + ey[1] * d, z];
  const ZT = Z0 + H;
  const zOf = (b) => ZT - b;
  const F = plane(Wp(0, D, ZT), ex, dn);                  // the front: a across, b down
  const T = plane(Wp(0, 0, ZT), ex, ey);                  // the top: a across, d back to front
  const RS = plane(Wp(W, D, ZT), mul(ey, -1), dn);        // the right side: a = front to back
  const hor = (z) => plane(Wp(0, 0, z), ex, ey);
  const vert = (d, z, a0 = 0) => plane(Wp(a0, d, z), ex, dn);
  const part = (cls) => { const p = g(cls ? { class: cls } : {}); root.appendChild(p); return p; };
  const pth = (d, cls = 's2', extra = {}) => el('path', { d, class: cls, ...extra });
  const R = (x, y, w, h, fill, extra = {}) => el('rect', { x: f2(x), y: f2(y), width: f2(w), height: f2(h), style: `fill:${fill}`, ...extra });
  const T2 = (s, x, y, size, fill, ex2 = {}) => txt(s, f2(x), f2(y), { size: f2(size), fill, font: ex2.font || MONO, weight: ex2.weight || 500, anchor: ex2.anchor, ls: ex2.ls });
  const blur = (sd) => { const id = K.id('vblur'); K.def(el('filter', { id, filterUnits: 'userSpaceOnUse', x: -3000, y: -3000, width: 6000, height: 6000 }, [el('feGaussianBlur', { stdDeviation: sd })])); return id; };
  const out = { F, T, RS, Wp, zOf, ex, ey, ez, L, slots: S.slots };
  function cornerRect(x, y, w, h, [tl, tr, br, bl], seg = 6) {
    const pts = [];
    const arc = (cx, cy, r, a0) => { for (let i = 0; i <= seg; i++) { const a = (a0 + (90 * i) / seg) * D2R; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
    arc(x + w - tr, y + tr, tr, -90); arc(x + w - br, y + h - br, br, 0); arc(x + bl, y + h - bl, bl, 90); arc(x + tl, y + tl, tl, 180);
    return pts;
  }

  /* ---------------- shadow, plinth, body ---------------- */
  const shG = part();
  const gpath = (pts, z = 0) => dpoly(pts.map(([a, d]) => P(Wp(a, d, z))));
  shG.appendChild(el('path', { d: gpath(rrect(-14, -10, W + 30, D + 30, 22, 6)), style: 'fill:var(--shadow)', opacity: 0.55, filter: `url(#${blur(HERO ? 10 : 14)})`, class: 'shadow' }));
  shG.appendChild(el('path', { d: gpath(rrect(-2, -2, W + 5, D + 6, 8, 6)), style: 'fill:var(--shadow)', opacity: 0.55, filter: `url(#${blur(HERO ? 2.5 : 3.5)})`, class: 'shadow' }));

  const bodyG = part();
  // plinth: a dark band the machine stands on, set back a little
  bodyG.appendChild(K.prism(rrect(6, 3, W - 12, D - 5, 4, 4), hor(Z0), Z0, MAT.deep));
  const RT = L.wide ? 20 : 16;
  bodyG.appendChild(K.prism(cornerRect(0, 0, W, H, [RT, RT, 3, 3], 8), F, D, MAT.shell));
  // a raised bezel line round the front, inside the curve
  bodyG.appendChild(face(F, [pth(dpoly(cornerRect(3.2, 3.2, W - 6.4, H - 6.4, [RT - 3, RT - 3, 1.5, 1.5], 8)), 's3')], 0.02));
  // a seam round the body near the foot, and the side's cooling vents
  bodyG.appendChild(face(F, [pth(`M8 ${f2(H - 4)} L${f2(W - 8)} ${f2(H - 4)}`, 's3')], 0.02));
  if (!HERO) {
    const vents = [];
    for (let i = 0; i < 7; i++) { const yy = H - 46 + i * 4.2; vents.push(pth(dpoly(rrect(10, yy, D - 22, 1.6, 0.8, 2)), 's3')); }
    bodyG.appendChild(face(RS, vents, 0.02));
  }

  /* ---------------- the lit sign ---------------- */
  const signG = part();
  {
    const [hx, hy, hw, hh] = L.head;
    const sign = K.recess(rrect(hx, hy, hw, hh, 3), F, 1.2, MAT.deep, { floorFill: 'var(--m-glass)' });
    signG.appendChild(sign);
    const fl = sign.floor;
    const lit = 'var(--lcd)';
    const sz = L.wide ? 12.5 : 10.5;
    const tx = hx + (L.wide ? 15 : 12), ty = hy + hh / 2 + sz * 0.36;
    // the cube mark, then the name in lit pixels with an accent glow behind it
    const cx = hx + (L.wide ? 8 : 6.6), cy = hy + hh / 2, r = L.wide ? 4.2 : 3.4;
    const hex = (k) => [[0, -1], [0.87, -0.5], [0.87, 0.5], [0, 1], [-0.87, 0.5], [-0.87, -0.5]].map(([x, y]) => [cx + x * r * k, cy + y * r * k]);
    const glow = g({ filter: `url(#${blur(L.wide ? 2.2 : 1.8)})`, opacity: 0.85, class: 'vm-glow' }, [
      txt('vladasana', f2(tx), f2(ty), { size: sz, fill: ACC, font: PIXF, weight: 600, ls: 0.4 }),
      el('path', { d: dpoly(hex(1)), style: `fill:none;stroke:${ACC};stroke-width:1.4` }),
    ]);
    signG.appendChild(face(fl, [
      glow,
      el('path', { d: `${dpoly(hex(1))}M${f2(cx)} ${f2(cy)}L${f2(cx + 0.87 * r)} ${f2(cy - 0.5 * r)}M${f2(cx)} ${f2(cy)}L${f2(cx - 0.87 * r)} ${f2(cy - 0.5 * r)}M${f2(cx)} ${f2(cy)}L${f2(cx)} ${f2(cy + r)}`, style: `fill:none;stroke:${lit};stroke-width:0.7;stroke-linejoin:round` }),
      txt('vladasana', f2(tx), f2(ty), { size: sz, fill: lit, font: PIXF, weight: 600, ls: 0.4 }),
      L.wide
        ? txt(S.kinds.map((k) => k.label.toUpperCase()).join('  ·  '), f2(hx + hw - 9), f2(hy + hh / 2 + 1.4), { size: 3.9, fill: 'color-mix(in oklab, var(--lcd) 72%, var(--m-glass))', font: PIXF, weight: 500, anchor: 'end', ls: 0.5 })
        : txt('LIBRARY', f2(hx + hw - 7), f2(hy + hh / 2 + 1.3), { size: 3.8, fill: 'color-mix(in oklab, var(--lcd) 72%, var(--m-glass))', font: PIXF, weight: 500, anchor: 'end', ls: 0.5 }),
      el('rect', { x: hx, y: hy, width: hw, height: 1.4, style: `fill:${lit}`, opacity: 0.12 }),
    ], 0.01));
    out.signGlow = glow;
  }

  /* ---------------- the window: shelves, coils and packages behind glass ---------------- */
  const winG = part();
  const BACK = 'color-mix(in oklab, var(--m-glass) 86%, var(--lcd))';
  const bezel = K.recess(rrect(gx - 4, gy - 4, gw + 8, gh + 8, 5), F, 0.9, MAT.deep, { floorFill: 'color-mix(in oklab, var(--m-deep) 80%, var(--shade))' });
  winG.appendChild(bezel);
  const win = K.recess(rrect(gx, gy, gw, gh, 3), bezel.floor, Dw, { v: 'glass', amb: 0.62 }, { floorFill: BACK });
  winG.appendChild(win);
  const inner = win.inner;
  // light from a tube along the top of the cabinet, falling down the back wall
  inner.appendChild(face(win.floor, [
    R(gx, gy, gw, gh, K.grad([[0, 'var(--lcd)', 0.34], [0.45, 'var(--lcd)', 0.08], [1, 'var(--lcd)', 0]], 0, 0, 0, 1)),
  ], 0.01));
  const dFront = D - 15;                        // packages' front faces
  const dFall = D - 5;                          // where a package falls (just behind the glass)
  const dRail = D - 8.5;
  const SPEC = L.wide ? {
    guide: { w: 23, h: 26.5, t: 3, pitch: 7.5, rc: 13, spares: HERO ? 0 : 2 },
    skill: { w: 48, h: 27, t: 7, pitch: 10, rc: 9.6, offs: [-12.5, 12.5], spares: HERO ? 0 : 1 },
    product: { w: 25, h: 29, t: 12, pitch: 15, rc: 14, spares: 0 },
  } : {
    guide: { w: 22, h: 26, t: 3, pitch: 7.5, rc: 12.6, spares: 2 },
    skill: { w: 42, h: 26, t: 7, pitch: 10, rc: 8.8, offs: [-11, 11], spares: 1 },
    product: { w: 23, h: 27.5, t: 11, pitch: 15, rc: 13, spares: 0 },
  };
  const LZ = L.wide ? 32 : 28;                  // each shelf strip starts with its label
  const rowsG = g();
  inner.appendChild(rowsG);
  const rowGs = [];
  // bottom shelf first: the shelves above hang over the packages below
  for (let r = S.rows.length - 1; r >= 0; r--) {
    const row = S.rows[r];
    const rg = g();
    rowGs[r] = rg;
    const bS = gy + 5 + (r + 1) * rh - railH;   // the shelf's top, in front units (5 of headroom under the window's top)
    const zs = zOf(bS);
    const pitch = (gw - LZ) / row.slots.length;
    // shelf plate
    rg.appendChild(K.prism(rrect(gx - 2, D - Dw - 2, gw + 4, Dw - 6.5, 0), hor(zs), 1.4, { v: 'glass', amb: 0.78 }, { lines: true }));
    const slotLayer = g();
    rg.appendChild(slotLayer);
    for (const sl of row.slots) {
      const sp = SPEC[sl.kind] || SPEC.guide;
      const ac = gx + LZ + pitch * (sl.c + 0.5);
      Object.assign(sl, { sp, ac, zs, pitch, dFront, dFall, bTop: gy + 5 + r * rh, bS });
      const sg = HERO ? slotLayer : g();
      if (!HERO) slotLayer.appendChild(sg);
      // spares: the same package again, further back on the coil
      const spareG = g();
      for (let k = sp.spares; k >= 1; k--) spareG.appendChild(pkg(sl, dFront - k * sp.pitch, false));
      if (!HERO) sg.appendChild(spareG);
      const coilBack = K.tube([Wp(ac, 0, zs), Wp(ac, 1, zs)], 1.25, 'var(--m-metal)');
      const coilFront = HERO ? g({}, [el('path', { class: 's2', d: 'M0 0' })]) : K.tube([Wp(ac, 0, zs), Wp(ac, 1, zs)], 1.25, 'var(--m-metal)');
      const fin = HERO ? pkg(sl, dFront, true) : g({ class: 'vm-pk' }, [pkg(sl, dFront, true)]);
      const fwrap = HERO ? fin : g({}, [fin]);
      if (!HERO) sg.appendChild(coilBack);
      sg.appendChild(fwrap); sg.appendChild(coilFront);
      Object.assign(sl, { sg, spareG, fwrap, fin, coilBack, coilFront });
      drawCoil(sl, 0, 0);
    }
    // the shelf strip: what the shelf holds, then a tag for each slot
    const rail = vert(dRail, zs + 0.2, gx);
    rg.appendChild(K.prism(rrect(0, 0, gw, railH, 0.5, 2), rail, 1.2, MAT.paper));
    const tagG = g();
    const kids = [];
    const cap = row.label.toUpperCase();
    const ls = 0.3, cs = Math.min(L.wide ? 4.4 : 3.9, (LZ - 5) / (8 * (0.62 + ls / 4)));
    const lblBox = R(0.9, 0.9, LZ - 2.6, railH - 1.8, 'var(--paper-ink)', { rx: 1 });
    kids.push(lblBox, T2(cap, (LZ - 1.7) / 2, railH / 2 + cs * 0.36, cs, 'var(--m-paper)', { weight: 500, ls, anchor: 'middle' }));
    row.lbl = lblBox;
    const ts = L.wide ? 3.2 : 3;
    for (const sl of row.slots) {
      const cx = sl.ac - gx;                              // the tag sits under its package
      const pr = priceOf(sl.it);
      const pw = pr.length * ts * 0.6, cw = ts * 2.6;
      const x0 = cx - (cw + 1.2 + pw) / 2;
      const chip = R(x0, railH / 2 - ts * 0.72, cw, ts * 1.44, 'var(--paper-ink)', { rx: 0.8 });
      const code = T2(sl.code, x0 + cw / 2, railH / 2 + ts * 0.36, ts, 'var(--m-paper)', { anchor: 'middle', weight: 500 });
      const price = T2(pr, x0 + cw + 1.2, railH / 2 + ts * 0.36, ts * 0.94, 'var(--paper-ink)', { weight: 500, ls: 0.1 });
      if (HERO) kids.push(chip); else kids.push(chip, code, price);
      sl.tag = { chip, code, price };
    }
    kids.push(pth(`M0.6 0.6 L${f2(gw - 0.6)} 0.6`, 's3'));
    tagG.appendChild(face(rail, kids, 0.02));
    rg.appendChild(tagG);
    row.rail = rail;
    rowsG.appendChild(rg);
  }
  // a falling package is drawn over the shelves (it falls in front of them)
  const fallG = g();
  inner.appendChild(fallG);
  // the lights: off, the cabinet is dim
  const dim = R(gx, gy, gw, gh, 'var(--shade)', { opacity: HERO ? 0 : 0.5, class: 'vm-dim' });
  inner.appendChild(face(F, [dim], 0.01));
  // glass: a faint tint and two soft streaks of reflection
  inner.appendChild(face(F, [
    R(gx, gy, gw, gh, 'var(--m-glass)', { opacity: 0.06 }),
    el('path', { d: `M${f2(gx + gw * 0.08)} ${gy}L${f2(gx + gw * 0.2)} ${gy}L${f2(gx + gw * 0.02)} ${f2(gy + gh)}L${f2(gx - gw * 0.1)} ${f2(gy + gh)}Z`, style: 'fill:var(--m-paper)', opacity: 0.09 }),
    el('path', { d: `M${f2(gx + gw * 0.25)} ${gy}L${f2(gx + gw * 0.29)} ${gy}L${f2(gx + gw * 0.11)} ${f2(gy + gh)}L${f2(gx + gw * 0.07)} ${f2(gy + gh)}Z`, style: 'fill:var(--m-paper)', opacity: 0.07 }),
    el('path', { d: `M${f2(gx + gw * 0.72)} ${gy}L${f2(gx + gw * 0.78)} ${gy}L${f2(gx + gw * 0.62)} ${f2(gy + gh)}L${f2(gx + gw * 0.56)} ${f2(gy + gh)}Z`, style: 'fill:var(--m-paper)', opacity: 0.045 }),
  ], 0.6));
  // the window's trim
  winG.appendChild(face(F, [pth(dpoly(rrect(gx - 6.5, gy - 6.5, gw + 13, gh + 13, 7)), 's3')], 0.02));
  // the row letters, as decals on the glass in the corner above each shelf strip
  {
    const ls = L.wide ? 15 : 13;
    inner.appendChild(face(F, S.rows.map((row) => {
      const y = gy + 5 + row.r * rh + (rh - railH) / 2 + ls * 0.38;
      return txt(row.letter, f2(gx + LZ / 2 - 0.8), f2(y), { size: ls, fill: 'var(--m-paper)', font: MONO, weight: 500, anchor: 'middle', opacity: 0.9 });
    }), 0.65));
  }
  // the selection: four corner marks on the glass round the chosen slot
  const selG = g({ class: 'vm-sel', opacity: 0 });
  inner.appendChild(face(F, [selG], 0.7));
  out.selG = selG;
  out.inner = inner; out.fallG = fallG; out.dim = dim; out.rowGs = rowGs; out.win = win;

  /* ---------------- the control panel: LCD, keypad, CLR and OPEN ---------------- */
  const panG = part();
  const LAB = 'var(--t2)';
  {
    const [lx, ly, lw, lh] = L.lcd;
    const bez = K.recess(rrect(lx, ly, lw, lh, 3.5), F, 0.8, MAT.deep, { floorFill: 'var(--m-glass)' });
    panG.appendChild(bez);
    const m = L.wide ? 5 : 4;
    const SW = lw - m * 2, SH = lh - m * 2;
    const scr = g();
    const scrRoot = g({ transform: `translate(${f2(lx + m)} ${f2(ly + m)})` }, [scr]);
    panG.appendChild(K.recess(rrect(lx + m, ly + m, SW, SH, 0.8), bez.floor, 1, MAT.glass, { content: (fl) => g({ transform: iso.matrix(fl) }, [scrRoot]), floorFill: LCD_OFF }));
    Object.assign(out, { scr, SW, SH });
  }
  const keys = {};
  {
    const k = L.keys;
    const kw = (k.w - (k.cols - 1) * k.gap) / k.cols, kh = (k.h - (k.rows - 1) * k.gap) / k.rows;
    const DISH = 'color-mix(in oklab, var(--m-deep) 78%, var(--shade))';
    panG.appendChild(K.recess(rrect(k.x - 2, k.y - 2, k.w + 4, k.h + 4, 3), F, 0.8, MAT.deep, { floorFill: DISH }));
    const labels = [...S.rows.map((r) => r.letter), ...Array.from({ length: S.maxCols }, (_, i) => String(i + 1))];
    labels.forEach((lbl, i) => {
      const cx = i % k.cols, cy = Math.floor(i / k.cols);
      const x = k.x + cx * (kw + k.gap), y = k.y + cy * (kh + k.gap);
      keys[lbl] = key(x, y, kw, kh, lbl, MAT.key, 'var(--ink)', L.wide ? 6 : 4.4);
    });
    const [cx0, cy0, cw0, ch0] = L.clr;
    panG.appendChild(K.recess(rrect(cx0 - 1.4, cy0 - 1.4, cw0 + 2.8, ch0 + 2.8, 3), F, 0.6, MAT.deep, { floorFill: DISH }));
    keys.CLR = key(cx0, cy0, cw0, ch0, 'CLR', MAT.rubber, 'var(--m-paper)', L.wide ? 4.2 : 3);
    const [ox, oy, ow, oh] = L.open;
    panG.appendChild(K.recess(rrect(ox - 1.8, oy - 1.8, ow + 3.6, oh + 3.6, (oh + 3.6) / 2, 8), F, 0.8, MAT.deep, { floorFill: DISH }));
    keys.OPEN = key(ox, oy, ow, oh, 'OPEN', MAT.accent, 'var(--paper-ink)', L.wide ? 6.4 : 4.6, oh / 2);
    // the OPEN key's lamp: lit while something waits in the tray
    const lr = L.wide ? 1.5 : 1.1;
    const lampX = ox + ow - oh / 2, lampY = oy + oh / 2;
    const top = keys.OPEN.top;
    const lampGlow = el('circle', { cx: f2(lampX), cy: f2(lampY), r: f2(lr * 2.8), style: `fill:var(--m-paper)`, opacity: 0, filter: `url(#${K.glowId})` });
    const lamp = el('circle', { cx: f2(lampX), cy: f2(lampY), r: f2(lr), style: 'fill:color-mix(in oklab, var(--m-accent) 60%, var(--shade))', class: 'sf' });
    keys.OPEN.el.appendChild(face(top, [lampGlow, lamp], 0.03));
    out.lamp = lamp; out.lampGlow = lampGlow;
    if (L.wide) {
      panG.appendChild(face(F, [
        T2('MAKE YOUR SELECTION', k.x + k.w / 2, k.y - 3.4, 2.6, LAB, { anchor: 'middle', ls: 0.6 }),
      ], 0.02));
    }
  }
  out.keys = keys;
  function key(x, y, w, h, lbl, mat, ink, size, rr = 2.2) {
    const kg = g({ class: 'press' });
    const top = shift(F, 0, 0, 2.2);
    kg.appendChild(K.prism(rrect(x, y, w, h, HERO ? Math.min(rr, 1.2) : rr, HERO ? 1 : 4), top, 2.8, mat));
    kg.appendChild(face(top, [
      HERO ? null : el('rect', { x: f2(x + 1.2), y: f2(y + 0.9), width: f2(w - 2.4), height: f2(h * 0.42), rx: f2(Math.min(rr, h * 0.2)), style: 'fill:var(--m-paper)', opacity: 0.07 }),
      T2(lbl, x + (lbl === 'OPEN' ? w / 2 - h * 0.25 : w / 2), y + h / 2 + size * 0.36, size, ink, { anchor: 'middle', weight: 500, ls: lbl.length > 1 ? 0.5 : 0 }),
      lbl === 'OPEN' ? el('path', { d: `M${f2(x + w / 2 + size * 1.5)} ${f2(y + h / 2 + size * 0.32)} l${f2(size * 0.5)} ${f2(-size * 0.5)} m${f2(-size * 0.34)} 0 h${f2(size * 0.34)} v${f2(size * 0.34)}`, style: `fill:none;stroke:${ink};stroke-width:${f2(size * 0.1)};stroke-linecap:round;stroke-linejoin:round` }) : null,
    ], 0.02));
    const wrap = g({}, [kg]);
    panG.appendChild(wrap);
    return { el: kg, wrap, top, x, y, w, h };
  }

  /* ---------------- the tray ---------------- */
  const trayG = part();
  {
    const [tx, ty, tw, th] = L.tray;
    const tray = K.recess(rrect(tx, ty, tw, th, 3), F, 24, { v: 'glass', amb: 0.7 }, { floorFill: 'color-mix(in oklab, var(--m-glass) 80%, var(--shade))' });
    trayG.appendChild(tray);
    // a hood over the opening and a lip below it, so it reads as a tray you reach into
    const hz = zOf(ty) + 2.6;
    trayG.appendChild(K.prism(rrect(tx - 2, D - 1, tw + 4, 6, 1.2, 3), hor(hz), 2.6, MAT.body2));
    // a lamp along the top of the tray opening, lit while it holds something
    const trayLamp = R(tx + 6, ty + 0.4, tw - 12, 1.2, 'var(--m-paper)', { opacity: 0 });
    const trayItem = g();
    tray.inner.appendChild(trayItem);
    tray.inner.appendChild(face(F, [trayLamp, R(tx + 6, ty, tw - 12, 6, K.grad([[0, 'var(--m-paper)', 1], [1, 'var(--m-paper)', 0]], 0, 0, 0, 1), { opacity: 0, class: 'vm-trayglow' })], 0.01));
    // the flap: smoked plastic hinged at the top; it swings up to offer what landed
    const flap = el('path', { style: 'fill:var(--m-glass)', opacity: 0.78, class: 'f' });
    const flapHi = el('path', { style: 'fill:var(--m-paper)', opacity: 0.1 });
    const flapLine = el('path', { class: 's2' });
    const push = T2('PUSH', tx + tw / 2, 0, L.wide ? 3.4 : 3, 'color-mix(in oklab, var(--lcd) 62%, var(--m-glass))', { anchor: 'middle', ls: 1.4 });
    const flapG = face(shift(F, 0, 0, -1.4), [flap, flapHi, flapLine, push]);
    tray.inner.appendChild(flapG);
    const FH = th - 4;
    out.setFlap = (k) => {
      const h = Math.max(1.2, FH * (1 - 0.9 * k));
      const x0 = tx + 0.6, x1 = tx + tw - 0.6, y0 = ty + 0.6, y1 = ty + 0.6 + h;
      flap.setAttribute('d', `M${f2(x0)} ${f2(y0)}H${f2(x1)}V${f2(y1)}H${f2(x0)}Z`);
      flapHi.setAttribute('d', `M${f2(x0 + 8)} ${f2(y0)}H${f2(x0 + 30)}L${f2(x0 + 20)} ${f2(y1)}H${f2(x0 - 2)}Z`);
      flapLine.setAttribute('d', `M${f2(x0)} ${f2(y1)}H${f2(x1)}`);
      push.setAttribute('y', f2(y0 + h * 0.62 + 1.2));
      push.setAttribute('opacity', k > 0.4 ? 0 : 1);
    };
    out.setFlap(0);
    // the flap's hinge, and the word printed above the opening
    trayG.appendChild(face(F, [
      pth(`M${f2(tx + 4)} ${f2(ty + th + 3)} L${f2(tx + tw - 4)} ${f2(ty + th + 3)}`, 's3'),
    ], 0.02));
    if (L.wide) trayG.appendChild(face(F, [T2('VM-23', W - 22, H - 7, 2.6, LAB, { anchor: 'middle', ls: 0.9 })], 0.02));
    out.tray = tray; out.trayItem = trayItem; out.trayLamp = trayLamp; out.trayGlow = tray.inner.querySelector('.vm-trayglow');
    out.trayFloorZ = zOf(ty + th);
  }

  /* ---------------- coils and packages ---------------- */
  /** The coil of slot sl, turned by `ph` (0..1 = one turn), its front and back halves split at the front package. */
  function drawCoil(sl, ph, adv) {
    const { ac, zs, sp } = sl;
    const zc = zs + sp.rc + 0.4;
    const d0 = D - Dw + 2, d1 = dFront + sp.pitch * 0.5 + 0.2;
    const split = dFront + adv;
    const ph0 = 0.5 - (dFront - d0) / sp.pitch;
    const n = Math.max(24, Math.round(((d1 - d0) / sp.pitch) * (HERO ? 10 : 18)));
    const dd = (pts) => (pts.length > 1 ? iso.dsmooth(pts.map(P)) : '');
    let db = '', df = '';
    // wide slots run two coils side by side
    for (const off of sp.offs || [0]) {
      const back = [], front = [];
      for (let i = 0; i <= n; i++) {
        const d = d0 + ((d1 - d0) * i) / n;
        const th = ((d - d0) / sp.pitch + ph0 + ph) * Math.PI * 2;
        const p = Wp(ac + off + Math.cos(th) * sp.rc, d, zc + Math.sin(th) * sp.rc);
        if (d <= split) back.push(p);
        if (d >= split - 0.01) front.push(p);
      }
      db += dd(back); df += dd(front);
    }
    const setD = (tg, d) => tg.querySelectorAll('path').forEach((pp) => pp.setAttribute('d', d || 'M0 0'));
    setD(sl.coilBack, db);
    setD(sl.coilFront, df);
  }
  out.drawCoil = drawCoil;

  /** One package, standing on its shelf with its front face at depth d. */
  function pkg(sl, d, detail, at0) {
    const sp = sl.sp, it = sl.it;
    const ac = at0?.a ?? sl.ac, z = at0?.z ?? sl.zs;
    const { w, h, t } = sp;
    const Pf = plane(Wp(ac - w / 2, d, z + h), ex, dn);
    const pg = g();
    const idx = sl.i;
    if (sl.kind === 'guide') {
      const v = ZINE[sl.gi % ZINE.length];
      const cover = { v: v.bg, amb: 0.8 };
      pg.appendChild(K.prism(rrect(0, 0, w, h, 0.5, HERO ? 1 : 2), Pf, t, { v: 'paper', amb: 0.7 }, { capFill: iso.shade(cover, Pf.n) }));
      if (!detail) return pg;
      if (HERO) { pg.appendChild(face(Pf, [R(3.4, 6, w - 7, 4.2, v.ink, { opacity: 0.85 }), R(3.4, h - 9, w * 0.5, 5, v.mot)], 0.02)); return pg; }
      const [kick, big] = coverOf(it);
      const kids = [];
      kids.push(pth(`M1.7 0.6 L1.7 ${f2(h - 0.6)}`, 's3'));
      kids.push(R(0.5, h * 0.24, 0.9, 2.2, 'var(--m-metal)'), R(0.5, h * 0.7, 0.9, 2.2, 'var(--m-metal)'));
      const x0 = 3.4, cw = w - x0 - 1.8;
      if (kick) kids.push(T2(kick, x0, 4.4, Math.min(2.2, cw / (kick.length * 0.7)), v.ink, { ls: 0.05 }));
      const bl = big.length;
      const longest = Math.max(...big.map((s) => s.length));
      const bs = Math.min(bl > 1 ? 5.2 : 6.6, cw / (longest * 0.63));
      big.forEach((s, j) => kids.push(T2(s, x0 - 0.2, 6.6 + bs * 0.86 + j * bs * 1.02, bs, v.ink, { weight: 500 })));
      const my = 6.6 + bl * bs * 1.02 + 1.6;
      kids.push(...motif(MOTIFS[(sl.gi + 3) % MOTIFS.length], x0, my, cw, h - my - 2.2, v.mot, v.ink));
      kids.push(R(x0, h - 2.6, 5, 0.5, v.ink, { opacity: 0.5 }));
      pg.appendChild(face(Pf, kids, 0.02));
      return pg;
    }
    if (sl.kind === 'skill') {
      const body = { v: CART[sl.ki % CART.length], amb: 0.5 };
      const outline = [[0, 1.6], [1.6, 0], [w - 6, 0], [w, 5], [w, h], [0, h]];
      pg.appendChild(K.prism(outline, Pf, t, body));
      if (!detail) return pg;
      if (HERO) { pg.appendChild(face(Pf, [R(2.6, 5, w - 5.2, 11.6, 'var(--m-label)', { rx: 0.8 }), R(2.6, 5, w - 5.2, 3, 'var(--paper-ink)')], 0.02)); return pg; }
      const kids = [];
      for (let j = 0; j < 3; j++) kids.push(pth(`M4 ${f2(1.4 + j * 1.05)} L${f2(w - 8.6 + j * 0.6)} ${f2(1.4 + j * 1.05)}`, 's3'));
      // the label sits high; the coils cradle the plain lower half
      const lx = 2.6, ly = 5, lw = w - 5.2, lh = 11.6;
      kids.push(R(lx, ly, lw, lh, 'var(--m-label)', { rx: 0.8 }), R(lx, ly, lw, 3, 'var(--paper-ink)', { rx: 0.8 }), R(lx, ly + 1.6, lw, 1.4, 'var(--paper-ink)'));
      kids.push(T2('SKILL', lx + 1.4, ly + 2.3, 1.8, 'var(--m-label)', { ls: 0.5 }));
      const gs = 6.6;
      kids.push(...glyph(GLYPH[it.id], lx + 1.4, ly + 3.9, gs, 'var(--paper-ink)', 'var(--m-label)'));
      const nm = it.name.toUpperCase();
      const room = lw - gs - 4;
      const ns = Math.min(4.3, room / (nm.length * 0.63));
      kids.push(T2(nm, lx + gs + 2.8, ly + 7.6, ns, 'var(--paper-ink)'));
      kids.push(T2(it.meta, lx + gs + 2.8, ly + 10.6, Math.min(2.3, room / (it.meta.length * 0.62)), 'color-mix(in oklab, var(--paper-ink) 60%, var(--m-label))'));
      kids.push(el('rect', { x: lx, y: ly, width: lw, height: lh, rx: 0.8, style: 'fill:none', class: 's3' }));
      // the connector end: an arrow that says which way it goes in
      const ay = h - 4.6;
      kids.push(el('path', { d: `M${f2(w / 2 - 2)} ${f2(ay)} L${f2(w / 2 + 2)} ${f2(ay)} L${f2(w / 2)} ${f2(ay + 2.2)} Z`, style: 'fill:var(--m-paper)', opacity: 0.55 }));
      kids.push(pth(`M${f2(w * 0.18)} ${f2(h - 1.2)} L${f2(w * 0.82)} ${f2(h - 1.2)}`, 's3'));
      pg.appendChild(face(Pf, kids, 0.02));
      return pg;
    }
    // product: a little boxed app
    const tile = `var(--m-${TILE[sl.ki % TILE.length]})`;
    pg.appendChild(K.prism(rrect(0, 0, w, h, 0.6, HERO ? 1 : 2), Pf, t, { v: 'paper', amb: 0.66 }));
    if (!detail) return pg;
    if (HERO) { pg.appendChild(face(Pf, [R(0, 0, w, 4.2, tile), R((w - 11) / 2, 6.4, 11, 11, tile, { rx: 2.6 })], 0.02)); return pg; }
    const Pt = plane(Wp(ac - w / 2, d - t, z + h), ex, ey);
    pg.appendChild(face(Pt, [pth(`M0.6 ${f2(t * 0.5)} L${f2(w - 0.6)} ${f2(t * 0.5)}`, 's3'), R(w * 0.5 - 3, t * 0.5 - 0.7, 6, 1.4, tile, { opacity: 0.8 })], 0.02));
    const kids = [];
    kids.push(R(0, 0, w, 4.2, tile));
    const band = String(it.meta || '').toUpperCase();
    kids.push(T2(band, 1.8, 2.9, Math.min(2, (w - 3.6) / (band.length * 0.66 + band.length * 0.1 / 1.6)), 'var(--m-paper)', { ls: 0.1 }));
    const ts = Math.min(11.6, w - 10), tx0 = (w - ts) / 2, ty0 = 6;
    kids.push(el('rect', { x: f2(tx0), y: ty0, width: ts, height: ts, rx: f2(ts * 0.24), style: `fill:${tile}` }));
    kids.push(el('rect', { x: f2(tx0), y: ty0, width: ts, height: ts, rx: f2(ts * 0.24), style: 'fill:none', class: 's3' }));
    kids.push(...glyph(GLYPH[it.id], tx0 + ts * 0.15, ty0 + ts * 0.15, ts * 0.7, 'var(--m-paper)', tile));
    // the app's name, on one line or two
    let ns = Math.min(3.2, (w - 2.4) / (it.name.length * 0.62)), nl = [it.name];
    if (ns < 2.4) { nl = wrapWords(it.name, Math.ceil(it.name.length / 2) + 2).slice(0, 2); ns = Math.min(3, (w - 2.4) / (Math.max(...nl.map((x) => x.length)) * 0.62)); }
    nl.forEach((x, j) => kids.push(T2(x, w / 2, ty0 + ts + 2.6 + ns * 0.5 + j * ns * 1.15, ns, 'var(--paper-ink)', { anchor: 'middle' })));
    kids.push(R(w / 2 - 4, h - 2.4, 8, 0.5, 'var(--paper-ink)', { opacity: 0.4 }));
    pg.appendChild(face(Pf, kids, 0.02));
    return pg;
  }
  out.pkg = pkg;

  /** Cover motifs for the zines, inside the box x, y, w, h. */
  function motif(kind, x, y, w, h, c, ink) {
    const o = [];
    if (h < 3) return o;
    const st = (sw) => `fill:none;stroke:${c};stroke-width:${sw};stroke-linecap:round;stroke-linejoin:round`;
    if (kind === 'sun') {
      const r = Math.min(w * 0.3, h * 0.62);
      o.push(el('path', { d: `M${f2(x + w * 0.5 - r)} ${f2(y + h)} A${f2(r)} ${f2(r)} 0 0 1 ${f2(x + w * 0.5 + r)} ${f2(y + h)} Z`, style: `fill:${c}` }));
      o.push(el('path', { d: `M${f2(x)} ${f2(y + h)} L${f2(x + w)} ${f2(y + h)}`, style: `fill:none;stroke:${ink};stroke-width:0.4` }));
    } else if (kind === 'stripes') {
      for (let j = 0; j < 3; j++) o.push(R(x, y + j * (h / 3), w * (0.9 - j * 0.22), h / 3 - 1, c));
    } else if (kind === 'dots') {
      const n = 4, m = 2;
      for (let a = 0; a < n; a++) for (let b = 0; b < m; b++) o.push(el('circle', { cx: f2(x + 1.2 + a * ((w - 2.4) / (n - 1))), cy: f2(y + 1.4 + b * Math.max(0, h - 2.8)), r: 1.05, style: `fill:${c}` }));
    } else if (kind === 'wave') {
      const pts = [];
      for (let j = 0; j <= 16; j++) pts.push([x + (w * j) / 16, y + h * 0.5 + Math.sin((j / 16) * Math.PI * 3) * h * 0.32]);
      o.push(el('path', { d: iso.dsmooth(pts), style: st(1.1) }));
    } else if (kind === 'stack') {
      for (let j = 0; j < 3; j++) o.push(el('rect', { x: f2(x + j * 1.4), y: f2(y + h - (j + 1) * (h / 3.2)), width: f2(w * 0.55), height: f2(h / 3.2 - 0.8), rx: 0.4, style: `fill:${c}` }));
    } else if (kind === 'arch') {
      const r = Math.min(w * 0.42, h * 0.95);
      o.push(el('path', { d: `M${f2(x + w * 0.5 - r)} ${f2(y + h)} A${f2(r)} ${f2(r)} 0 0 1 ${f2(x + w * 0.5 + r)} ${f2(y + h)}`, style: st(1.3) }));
      o.push(el('path', { d: `M${f2(x + w * 0.5 - r * 0.55)} ${f2(y + h)} A${f2(r * 0.55)} ${f2(r * 0.55)} 0 0 1 ${f2(x + w * 0.5 + r * 0.55)} ${f2(y + h)}`, style: st(1.3) }));
    }
    return o;
  }
  /** Pictograms in an s x s box at x, y, in colour c (bg: the colour behind them, for cut-outs). */
  function glyph(kind, x, y, s, c, bg) {
    const k = s / 10;
    const X = (v) => f2(x + v * k), Y = (v) => f2(y + v * k);
    const fill = `fill:${c}`, line = (sw = 1) => `fill:none;stroke:${c};stroke-width:${f2(sw * k)};stroke-linecap:round;stroke-linejoin:round`;
    switch (kind) {
      case 'bubble': return [el('path', { d: `M${X(1)} ${Y(1.6)} H${X(9)} V${Y(6.8)} H${X(4.4)} L${X(2.4)} ${Y(8.8)} V${Y(6.8)} H${X(1)} Z`, style: fill }), el('path', { d: `M${X(2.8)} ${Y(3.6)} H${X(7.2)} M${X(2.8)} ${Y(5)} H${X(6)}`, style: `fill:none;stroke:${bg};stroke-width:${f2(0.8 * k)};stroke-linecap:round` })];
      case 'stick': return [el('rect', { x: X(1.2), y: Y(3), width: f2(6.2 * k), height: f2(4 * k), rx: f2(0.8 * k), style: fill }), el('rect', { x: X(7.4), y: Y(3.9), width: f2(1.8 * k), height: f2(2.2 * k), style: fill }), el('circle', { cx: X(3.4), cy: Y(5), r: f2(0.9 * k), style: `fill:${bg}` })];
      case 'net': return [el('path', { d: `M${X(1)} ${Y(1.5)} Q${X(5)} ${Y(4.2)} ${X(9)} ${Y(1.5)} M${X(1)} ${Y(4.6)} Q${X(5)} ${Y(7.3)} ${X(9)} ${Y(4.6)} M${X(1)} ${Y(7.7)} Q${X(5)} ${Y(10)} ${X(9)} ${Y(7.7)} M${X(2.4)} ${Y(1.2)} L${X(2.8)} ${Y(9)} M${X(5)} ${Y(2.8)} L${X(5)} ${Y(9.2)} M${X(7.6)} ${Y(1.2)} L${X(7.2)} ${Y(9)}`, style: line(0.75) })];
      case 'plane': return [el('path', { d: `M${X(0.8)} ${Y(5)} L${X(9.4)} ${Y(1.4)} L${X(6.6)} ${Y(9)} L${X(4.8)} ${Y(6.2)} Z`, style: fill }), el('path', { d: `M${X(4.8)} ${Y(6.2)} L${X(9.4)} ${Y(1.4)}`, style: `fill:none;stroke:${bg};stroke-width:${f2(0.6 * k)}` })];
      case 'drop': return [el('path', { d: `M${X(5)} ${Y(0.8)} C${X(7.6)} ${Y(4)} ${X(8.4)} ${Y(5.4)} ${X(8.4)} ${Y(6.4)} A${f2(3.4 * k)} ${f2(3.4 * k)} 0 0 1 ${X(1.6)} ${Y(6.4)} C${X(1.6)} ${Y(5.4)} ${X(2.4)} ${Y(4)} ${X(5)} ${Y(0.8)} Z`, style: fill }), el('path', { d: `M${X(3.4)} ${Y(6.2)} A${f2(1.7 * k)} ${f2(1.7 * k)} 0 0 0 ${X(5)} ${Y(8)}`, style: `fill:none;stroke:${bg};stroke-width:${f2(0.7 * k)};stroke-linecap:round` })];
      case 'play': return [el('rect', { x: X(0.6), y: Y(1.4), width: f2(8.8 * k), height: f2(7.2 * k), rx: f2(1.2 * k), style: fill }), el('path', { d: `M${X(4)} ${Y(3.2)} L${X(7)} ${Y(5)} L${X(4)} ${Y(6.8)} Z`, style: `fill:${bg}` })];
      case 'film': {
        const o2 = [el('rect', { x: X(0.6), y: Y(1.4), width: f2(8.8 * k), height: f2(7.2 * k), rx: f2(0.6 * k), style: fill })];
        for (let j = 0; j < 4; j++) o2.push(el('rect', { x: X(1.4 + j * 2.1), y: Y(2), width: f2(1 * k), height: f2(0.9 * k), style: `fill:${bg}` }), el('rect', { x: X(1.4 + j * 2.1), y: Y(7.1), width: f2(1 * k), height: f2(0.9 * k), style: `fill:${bg}` }));
        o2.push(el('rect', { x: X(1.6), y: Y(3.5), width: f2(6.8 * k), height: f2(3 * k), style: `fill:${bg}`, opacity: 0.55 }));
        return o2;
      }
      case 'doc': return [el('path', { d: `M${X(1.6)} ${Y(0.8)} H${X(6.4)} L${X(8.4)} ${Y(2.8)} V${Y(9.2)} H${X(1.6)} Z`, style: fill }), el('path', { d: `M${X(3)} ${Y(4.2)} H${X(7)} M${X(3)} ${Y(5.8)} H${X(7)} M${X(3)} ${Y(7.4)} H${X(5.4)}`, style: `fill:none;stroke:${bg};stroke-width:${f2(0.7 * k)};stroke-linecap:round` })];
      default: return [el('rect', { x: X(1), y: Y(1), width: f2(8 * k), height: f2(8 * k), rx: f2(2 * k), style: fill })];
    }
  }

  out.parts = [shG, bodyG, signG, winG, panG, trayG];
  return out;
}

/** Index guides and the other kinds separately, so cover colours run along each kind. */
function indexSlots(S) {
  const per = {};
  for (const sl of S.slots) { per[sl.kind] = (per[sl.kind] || 0) + 1; sl.ki = per[sl.kind] - 1; sl.gi = sl.ki; }
}

/* ====================================================================================================== */
/* the LCD's screens                                                                                       */
/* ====================================================================================================== */
function screens(iso, S, M) {
  const { g, el, txt } = iso;
  const { SW, SH } = M;
  const wide = M.L.wide;
  const CW = 0.58; // Pixelify Sans, near enough
  const PIX = (s, x, y, o = {}) => txt(s, f2(x), f2(y), { font: PIXF, size: f2(o.size || 4), fill: o.fill || LCD[3], anchor: o.anchor, weight: o.weight || 500, ls: o.ls });
  const BAR = wide ? 9.4 : 10;
  const bar = (left, right) => [
    el('rect', { x: 0, y: 0, width: SW, height: BAR, style: `fill:${LCD[3]}` }),
    PIX(left, 2.6, BAR * 0.72, { size: wide ? 4.8 : 5.2, fill: LCD[0], ls: 0.3 }),
    right ? PIX(right, SW - 2.6, BAR * 0.72, { size: wide ? 4.8 : 5.2, fill: LCD[0], anchor: 'end', ls: 0.3 }) : null,
  ].filter(Boolean);
  const rangeOf = (kind) => {
    const sl = S.slots.filter((s) => s.kind === kind);
    if (!sl.length) return '';
    return sl.length === 1 ? sl[0].code : `${sl[0].code}-${sl[sl.length - 1].code}`;
  };
  /** the directory: what is on which shelves */
  function dir(blinkers) {
    const k = [...bar('LIBRARY', `${S.slots.length} ITEMS`)];
    const fs = wide ? 5.6 : 6.2, lh = wide ? 10.4 : 11;
    let y = BAR + (wide ? 11 : 10.6);
    for (const kd of S.kinds) {
      const n = S.slots.filter((s) => s.kind === kd.id).length;
      if (!n) continue;
      k.push(PIX(rangeOf(kd.id), 2.6, y, { size: fs * 0.8, fill: LCD[2] }));
      k.push(PIX(kd.label.toUpperCase(), wide ? 27 : 32, y, { size: fs, weight: 600 }));
      k.push(PIX(String(n), (wide ? 27 : 32) + kd.label.length * fs * CW + fs * 1.1, y, { size: fs, fill: LCD[2] }));
      y += lh;
    }
    const es = wide ? 4.2 : 4.8;
    const ft = g({}, [PIX('ENTER A CODE', 2.6, SH - 2.6, { size: es, ls: 0.3 }), el('rect', { x: f2(2.6 + 12 * es * CW + 1.6), y: f2(SH - 2.6 - es * 0.8), width: f2(es * 0.62), height: f2(es * 0.86), style: `fill:${LCD[3]}` })]);
    blinkers.push(ft.lastChild);
    k.push(ft);
    return k;
  }
  /** one item: code, price, name, line, meta, and what to do next */
  function item(sl, mode, blinkers, t = 0) {
    const it = sl.it;
    const kindWord = (S.kinds.find((k) => k.id === sl.kind)?.label || '').toUpperCase().replace(/S$/, '');
    const k = [...bar(`${sl.code}  ${kindWord}`, priceOf(it))];
    const foot = wide ? 4.2 : 4.6;
    const top = BAR + 2.4, bottom = SH - foot - 3.4;
    let ns = wide ? 7 : 8, bs = wide ? 4.5 : 5.2, nl, bl;
    for (let q = 0; q < 8; q++) {
      nl = wrapWords(it.name, Math.floor((SW - 5) / (ns * CW)));
      bl = wrapWords(it.line, Math.floor((SW - 5) / (bs * CW)));
      const h = nl.length * ns * 1.08 + 2 + bl.length * bs * 1.3;
      if (h <= bottom - top && nl.length <= 2) break;
      if (ns > 5.2) ns -= 0.5; else bs -= 0.25;
    }
    let y = top + ns * 0.86;
    nl.forEach((s) => { k.push(PIX(s, 2.6, y, { size: ns, weight: 600 })); y += ns * 1.08; });
    y += 1.6 + bs * 0.2;
    bl.forEach((s) => { k.push(PIX(s, 2.6, y, { size: bs, fill: LCD[2] })); y += bs * 1.3; });
    k.push(el('rect', { x: 0, y: f2(SH - foot - 2.6), width: SW, height: 0.45, style: `fill:${LCD[1]}` }));
    k.push(PIX(it.meta.toUpperCase(), 2.6, SH - 1.4, { size: foot * 0.92, fill: LCD[2], ls: 0.2 }));
    if (mode === 'ready') {
      const r = g({}, [el('path', { d: `M${f2(SW - 2.6 - foot * 4.6)} ${f2(SH - 1.4 - foot * 0.78)} l${f2(foot * 0.62)} ${f2(foot * 0.4)} l${f2(-foot * 0.62)} ${f2(foot * 0.4)} z`, style: `fill:${LCD[3]}` }), PIX('OPEN', SW - 2.6, SH - 1.4, { size: foot, anchor: 'end', weight: 600, ls: 0.3 })]);
      blinkers.push(r);
      k.push(r);
    } else if (mode === 'vend') {
      const n = 6, w = wide ? 2.4 : 2.1;
      const done = Math.floor(t * (n + 1));
      for (let j = 0; j < n; j++) k.push(el('rect', { x: f2(SW - 2.6 - (n - j) * (w + 0.9) + 0.9), y: f2(SH - 1.4 - foot * 0.72), width: w, height: f2(foot * 0.72), style: `fill:${j < done ? LCD[3] : LCD[1]}` }));
    } else if (mode === 'preview') {
      k.push(PIX('PICK', SW - 2.6, SH - 1.4, { size: foot, anchor: 'end', fill: LCD[2], ls: 0.3 }));
    } else if (mode === 'open') {
      k.push(PIX('OPENING', SW - 2.6, SH - 1.4, { size: foot, anchor: 'end', weight: 600, ls: 0.3 }));
    }
    return k;
  }
  /** a kind: its shelves, and its items when they fit */
  function kind(kd, blinkers) {
    const sl = S.slots.filter((s) => s.kind === kd.id);
    const k = [...bar(kd.label.toUpperCase(), rangeOf(kd.id))];
    const fs = wide ? 4.4 : 5, lh = fs * 1.45;
    const room = Math.floor((SH - BAR - 4 - fs * 1.6) / lh);
    let y = BAR + 3 + fs;
    const showN = sl.length <= room ? sl.length : room - 1;
    sl.slice(0, showN).forEach((s) => {
      k.push(PIX(s.code, 2.6, y, { size: fs * 0.9, fill: LCD[2] }));
      const nm = s.it.name, max = Math.floor((SW - 16) / (fs * CW));
      k.push(PIX(nm.length > max ? nm.slice(0, max - 1) + '…' : nm, wide ? 13 : 12, y, { size: fs }));
      y += lh;
    });
    if (showN < sl.length) k.push(PIX(`AND ${sl.length - showN} MORE`, wide ? 13 : 12, y, { size: fs, fill: LCD[2] }));
    const ft = PIX('ENTER A CODE', SW - 2.6, SH - 1.6, { size: fs * 0.9, anchor: 'end', ls: 0.3 });
    blinkers.push(ft);
    k.push(ft);
    return k;
  }
  /** typing a code */
  function entry(code, hint) {
    const k = [...bar('CODE', '')];
    const big = wide ? 22 : 24;
    const shown = code.padEnd(2, '_');
    k.push(PIX(shown, SW / 2, BAR + (SH - BAR) / 2 + big * 0.32, { size: big, anchor: 'middle', weight: 600, ls: 2 }));
    k.push(PIX(hint, SW / 2, SH - 2.2, { size: wide ? 3.8 : 4.4, anchor: 'middle', fill: LCD[2], ls: 0.2 }));
    return k;
  }
  function boot(k0) {
    return [PIX('vladasana', SW / 2, SH / 2 + 2 - (1 - k0) * 10, { size: wide ? 9 : 7.6, anchor: 'middle', weight: 600 })];
  }
  function opening(sl) {
    const k = [...bar(sl.code, priceOf(sl.it))];
    k.push(PIX('OPENING', SW / 2, BAR + 12, { size: wide ? 4.4 : 4, anchor: 'middle', fill: LCD[2], ls: 0.5 }));
    const nl = wrapWords(sl.it.name, Math.floor((SW - 6) / (6 * CW))).slice(0, 2);
    nl.forEach((s, j) => k.push(PIX(s, SW / 2, BAR + 21 + j * 6.8, { size: wide ? 6.2 : 5.6, anchor: 'middle', weight: 600 })));
    const dm = domainOf(sl.it.url);
    const max = Math.floor((SW - 6) / (3.6 * CW));
    k.push(PIX(dm.length > max ? dm.slice(0, max - 1) + '…' : dm, SW / 2, SH - 3, { size: wide ? 3.6 : 3.3, anchor: 'middle', fill: LCD[2] }));
    return k;
  }
  return { dir, item, kind, entry, boot, opening, PIX, BAR };
}

/* ====================================================================================================== */
/* the section                                                                                             */
/* ====================================================================================================== */
export default async function build(ctx) {
  const { K, iso, root, sound } = ctx;
  const { g, el, P, mul } = iso;
  const MOB = ctx.mobile, RM = ctx.reduced;
  const lib = ctx.data?.library;
  // phones and portrait stages get the tall machine (5 a shelf); everything else the wide one (8 a shelf)
  const ar = ctx.stage.clientWidth / Math.max(1, ctx.stage.clientHeight);
  const wide = !(MOB && innerWidth <= 760) && ar >= 0.95;
  const S = stock(lib, wide ? 8 : 5);
  indexSlots(S);
  const L = layout(wide, S);
  const M = machine(K, iso, root, S, L);
  M.parts.forEach((p) => root.appendChild(p));
  const SC = screens(iso, S, M);
  const slots = S.slots;

  if (!document.getElementById('vm23-style')) {
    const st = document.createElement('style');
    st.id = 'vm23-style';
    st.textContent = [
      '#docs .vm-pk{transform-box:fill-box;transform-origin:50% 100%}',
      '#docs .vm-pk.wig{animation:vmwig .55s cubic-bezier(.3,1.6,.5,1)}',
      '@keyframes vmwig{0%{transform:none}30%{transform:translateY(-1.6px) rotate(-2.2deg)}60%{transform:translateY(-.6px) rotate(1.4deg)}100%{transform:none}}',
      '#docs .vm-dim{transition:opacity .12s}',
      '#docs path.vm-pad.hit:focus-visible{stroke:var(--m-accent);stroke-width:calc(var(--hair, 1) * 2px);stroke-dasharray:3 2}',
      '#docs .hit:focus-visible .s{stroke:var(--fg)}',
      '#docs .vm-lampon{animation:vmlamp 1.1s ease-in-out infinite alternate}',
      '@keyframes vmlamp{from{opacity:.35}to{opacity:1}}',
      '@media (prefers-reduced-motion: reduce){#docs .vm-pk.wig,#docs .vm-lampon{animation:none}}',
    ].join('\n');
    document.head.appendChild(st);
  }

  /* ---------------- the LCD ---------------- */
  const lcdBack = el('rect', { x: 0, y: 0, width: M.SW, height: M.SH, style: `fill:${LCD_OFF}`, class: 'f' });
  const lcdLayer = g();
  const vign = el('rect', { x: 0, y: 0, width: M.SW, height: M.SH, style: `fill:${K.rgrad([[0.6, 'var(--lcd-ink)', 0], [1, 'var(--lcd-ink)', 0.13]], 0.5, 0.5, 0.75)}` });
  const glare = el('path', { d: `M0 0 L${f2(M.SW * 0.5)} 0 L${f2(M.SW * 0.22)} ${f2(M.SH)} L0 ${f2(M.SH)} Z`, style: 'fill:var(--lcd)', opacity: 0.06 });
  M.scr.append(lcdBack, lcdLayer, vign, glare);
  let lcdState = { s: 'off' }, blinkers = [], blinkT = 0;
  function lcd(s) {
    lcdState = s;
    blinkers = [];
    lcdBack.style.fill = s.s === 'off' ? LCD_OFF : LCD[0];
    let kids = [];
    if (s.s === 'boot') kids = SC.boot(s.k ?? 1);
    else if (s.s === 'dir') kids = SC.dir(blinkers);
    else if (s.s === 'item') kids = SC.item(slots[s.i], s.mode, blinkers, s.t || 0);
    else if (s.s === 'kind') kids = SC.kind(s.kd, blinkers);
    else if (s.s === 'entry') kids = SC.entry(s.code, s.hint);
    else if (s.s === 'opening') kids = SC.opening(slots[s.i]);
    lcdLayer.replaceChildren(...kids);
  }
  /** what the LCD shows when nothing else is going on */
  function rest() {
    if (vending) return;
    if (trayAt != null) lcd({ s: 'item', i: trayAt, mode: 'ready' });
    else lcd({ s: 'dir' });
  }

  /* ---------------- state ---------------- */
  let power = false, vending = null, trayAt = null, cursor = null, hover = null, entryCode = '', restT = 0;
  const anims = new Set();
  const pressDir = P(mul(M.F.n, -1));
  function pressKey(k, dz = 1.4, ms = 130) {
    const n = M.keys[k]?.el;
    if (!n) return;
    n.style.transform = `translate(${f2(pressDir[0] * dz)}px, ${f2(pressDir[1] * dz)}px)`;
    clearTimeout(n._pt);
    n._pt = setTimeout(() => (n.style.transform = ''), ms);
  }
  const beep = (f = 1568) => sound.beep(f, 0.05, 'square', 0.035);

  /* the selection marker: the slot's tag chip turns to the accent */
  function mark() {
    const c = cursor != null ? slots[cursor] : null;
    if (c) {
      const x0 = c.ac - c.pitch / 2 + 1.4, x1 = c.ac + c.pitch / 2 - 1.4, y0 = c.bTop + 1.6, y1 = c.bS + L.railH - 1.2, k = Math.min(5, c.pitch * 0.18);
      const d = `M${f2(x0)} ${f2(y0 + k)}V${f2(y0)}H${f2(x0 + k)}M${f2(x1 - k)} ${f2(y0)}H${f2(x1)}V${f2(y0 + k)}M${f2(x1)} ${f2(y1 - k)}V${f2(y1)}H${f2(x1 - k)}M${f2(x0 + k)} ${f2(y1)}H${f2(x0)}V${f2(y1 - k)}`;
      M.selG.replaceChildren(
        el('path', { d, style: `fill:none;stroke:${ACC};stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round`, opacity: 0.35, filter: `url(#${K.glowId})` }),
        el('path', { d, style: `fill:none;stroke:${ACC};stroke-width:1.1;stroke-linecap:round;stroke-linejoin:round` }),
      );
      M.selG.setAttribute('opacity', 1);
    } else M.selG.setAttribute('opacity', 0);
    for (const sl of slots) {
      const on = sl.i === cursor || sl.i === hover;
      sl.tag.chip.style.fill = on ? ACC : 'var(--paper-ink)';
      sl.tag.code.style.fill = on ? 'var(--paper-ink)' : 'var(--m-paper)';
    }
  }
  function wiggle(sl) {
    if (RM) return;
    sl.fin.classList.remove('wig');
    void sl.fin.getBBox();
    sl.fin.classList.add('wig');
    clearTimeout(sl._wt);
    sl._wt = setTimeout(() => sl.fin.classList.remove('wig'), 600);
  }

  /* ---------------- vending ---------------- */
  const screenOff = (v) => P(v); // world offset to screen offset (P is linear)
  let flapK = 0, flapA = null;
  function flapTo(to, dur = 0.26) {
    if (flapA) anims.delete(flapA);
    const from = flapK;
    if (RM) dur = 0.01;
    let t = 0;
    flapA = { step: (dt) => {
      t += dt;
      const k = Math.min(1, t / dur);
      flapK = from + (to - from) * (to > from ? 1 - Math.pow(1 - k, 3) : k * k);
      M.setFlap(flapK);
      if (k >= 1) { anims.delete(flapA); flapA = null; }
    } };
    anims.add(flapA);
  }
  function setTray(i) {
    trayAt = i;
    const on = i != null;
    M.trayLamp.setAttribute('opacity', on ? 0.9 : 0);
    M.trayGlow?.setAttribute('opacity', on ? 0.16 : 0);
    M.lamp.style.fill = on ? 'var(--m-paper)' : 'color-mix(in oklab, var(--m-accent) 60%, var(--shade))';
    M.lampGlow.setAttribute('opacity', on ? 0.9 : 0);
    M.lampGlow.classList.toggle('vm-lampon', on);
    if (!on) M.trayItem.replaceChildren();
  }
  function vend(i) {
    const sl = slots[i];
    if (!sl) return;
    if (!power) powerOn(true);
    cursor = i; entryCode = ''; mark();
    if (vending) { vending.next = i; return; }
    if (trayAt === i) { lcd({ s: 'item', i, mode: 'ready' }); wiggleTray(); sound.tick(); return; }
    // whatever was in the tray is taken away, and the flap drops shut
    if (trayAt != null) { M.trayItem.replaceChildren(); setTray(null); }
    if (flapK > 0) flapTo(0, 0.16);
    const sp = sl.sp;
    const v = { i, t: 0, phase: 'turn', next: null };
    vending = v;
    lcd({ s: 'item', i, mode: 'vend', t: 0 });
    sound.motor(RM ? 0.3 : 0.85);
    // a copy that falls in the cabinet, and one that lands in the tray (each clipped to its opening)
    const home = { a: sl.ac, z: M.trayFloorZ + 0.6 };
    const fallPk = g({}, [M.pkg(sl, dFallOf(sl), true, home)]);
    const trayPk = g({}, [M.pkg(sl, D_TRAY, true, home)]);
    fallPk.style.display = 'none';
    M.fallG.appendChild(fallPk);
    const T1 = RM ? 0.25 : 0.85;
    const adv = sl.dFall - sl.dFront;
    const lift = sl.zs - home.z;
    let z = lift, vz = 0, rot = 0, bounces = 0, landed = false;
    const spin = (Math.random() < 0.5 ? -1 : 1) * (5 + Math.random() * 6);
    const place = (node, dd, zz, rr) => {
      const o = screenOff(iso.add(mul(M.ey, dd), [0, 0, zz]));
      node.style.transform = `translate(${f2(o[0])}px, ${f2(o[1])}px)${rr ? ` rotate(${f2(rr)}deg)` : ''}`;
    };
    fallPk.style.transformBox = trayPk.style.transformBox = 'fill-box';
    fallPk.style.transformOrigin = trayPk.style.transformOrigin = '50% 60%';
    const step = (dt) => {
      v.t += dt;
      if (v.phase === 'turn') {
        const k = Math.min(1, v.t / T1);
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        M.drawCoil(sl, e, e * adv);
        place(sl.fwrap, e * adv, 0);
        place(sl.spareG, e * sp.pitch, 0);
        if (Math.floor(v.t * 10) !== Math.floor((v.t - dt) * 10)) lcd({ s: 'item', i, mode: 'vend', t: k * 0.7 });
        if (k >= 1) {
          v.phase = 'fall'; v.t = 0;
          sl.fwrap.style.display = 'none';
          fallPk.style.display = '';
          place(fallPk, 0, z);
          M.trayItem.replaceChildren(trayPk);
          place(trayPk, 0, z);
          sound.whoosh(0.35, 0.04);
        }
        return;
      }
      if (v.phase === 'fall') {
        vz -= (RM ? 2600 : 1150) * dt;
        z += vz * dt;
        rot = landed ? rot * 0.8 : Math.min(1, (lift - z) / Math.max(1, lift)) * spin;
        if (z <= 0) {
          z = 0;
          if (!landed) { landed = true; sound.thunk(); }
          if (++bounces >= 3 || Math.abs(vz) < 40) { vz = 0; v.phase = 'settle'; v.t = 0; }
          else vz = -vz * 0.26;
        }
        place(fallPk, 0, z, rot);
        place(trayPk, 0, z, rot);
        return;
      }
      if (v.phase === 'settle') {
        rot *= 0.82;
        place(trayPk, 0, 0, rot - 2.5 * Math.min(1, v.t * 6));
        if (v.t > 0.18) finish();
      }
    };
    v.step = step;
    anims.add(v);
    function finish() {
      anims.delete(v);
      fallPk.remove();
      // restock: the spares are back where they were, the slot has its package again
      sl.fwrap.style.transform = ''; sl.spareG.style.transform = '';
      sl.fwrap.style.display = '';
      M.drawCoil(sl, 0, 0);
      vending = null;
      setTray(i);
      flapTo(1, 0.3);
      sound.tick();
      lcd({ s: 'item', i, mode: 'ready' });
      sound.blip(1318, 0.05); setTimeout(() => sound.blip(1760, 0.09), 70);
      if (v.next != null && v.next !== i) { const n = v.next; setTimeout(() => vend(n), 120); }
    }
  }
  const dFallOf = (sl) => sl.dFall;
  const D_TRAY = L.D - 2.4;
  function wiggleTray() {
    const n = M.trayItem.firstChild;
    if (!n || RM) return;
    const base = n.style.transform;
    n.animate?.([{ transform: base }, { transform: base + ' translateY(-2px)' }, { transform: base }], { duration: 260, easing: 'ease-out' });
  }

  /* ---------------- opening ---------------- */
  function open() {
    if (trayAt == null || vending) return false;
    const sl = slots[trayAt];
    window.open(sl.it.url, '_blank', 'noopener');
    sound.approve();
    lcd({ s: 'opening', i: trayAt });
    clearTimeout(restT);
    restT = setTimeout(rest, 1700);
    return true;
  }

  /* ---------------- the keypad ---------------- */
  const letters = S.rows.map((r) => r.letter);
  function press(k) {
    pressKey(k, k === 'OPEN' ? 1.8 : 1.4);
    if (!power) powerOn(true);
    if (k === 'OPEN') {
      if (!open()) { sound.beep(330, 0.08, 'square', 0.03); if (!vending) { lcd({ s: 'entry', code: entryCode, hint: 'PICK SOMETHING FIRST' }); clearTimeout(restT); restT = setTimeout(rest, 1500); } }
      return;
    }
    if (k === 'CLR') { beep(1046); entryCode = ''; cursor = null; mark(); rest(); return; }
    if (vending) return;
    beep(1568);
    clearTimeout(restT);
    if (letters.includes(k)) { entryCode = k; lcd({ s: 'entry', code: k, hint: `NOW 1-${S.rows[letters.indexOf(k)].slots.length}` }); return; }
    if (/^\d$/.test(k)) {
      if (!entryCode) { lcd({ s: 'entry', code: '', hint: `A LETTER FIRST, ${letters[0]}-${letters[letters.length - 1]}` }); restT = setTimeout(rest, 1800); return; }
      const code = entryCode + k;
      entryCode = '';
      const sl = slots.find((s) => s.code === code);
      if (!sl) { sound.beep(330, 0.12, 'square', 0.03); lcd({ s: 'entry', code, hint: `${code} IS EMPTY` }); restT = setTimeout(rest, 1600); return; }
      lcd({ s: 'entry', code, hint: sl.it.name.toUpperCase().slice(0, 22) });
      restT = setTimeout(() => vend(sl.i), 260);
    }
  }

  /* ---------------- wiring ---------------- */
  // links open on a real click (or Enter), never on the pointerdown that picks, so pop-up blockers allow them
  function bind(node, label, onAct, o = {}) {
    node.classList.add('hit');
    node.setAttribute('role', o.role || 'button');
    node.setAttribute('tabindex', o.tabindex ?? 0);
    node.setAttribute('aria-label', label);
    node.style.touchAction = 'manipulation';
    node.addEventListener('pointerdown', (e) => { if (e.button > 0) return; ctx.arm(); o.down?.(e); });
    node.addEventListener('click', (e) => { ctx.arm(); onAct(e); });
    node.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ctx.arm(); o.down?.(e); onAct(e); } });
    (node.ownerSVGElement || ctx.svg).removeAttribute('aria-hidden');
    return node;
  }
  const hitPath = (pl, x, y, w, h) => el('path', { d: iso.dpoly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(([a, b]) => P(iso.at(pl, a, b)))), style: 'fill:transparent', class: 'vm-pad' });
  const hitsG = g();
  root.appendChild(hitsG);
  // the slots: the cell in front of each package, on the glass
  for (const sl of slots) {
    const pad = hitPath(M.F, sl.ac - sl.pitch / 2, sl.bTop, sl.pitch, L.rh);
    hitsG.appendChild(pad);
    bind(pad, `${sl.code}: ${sl.it.name}, ${priceOf(sl.it).toLowerCase()}. Vend it`, () => { if (!vending) wiggle(sl); vend(sl.i); }, { tabindex: -1 });
    pad.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      hover = sl.i; mark(); wiggle(sl); sound.tick();
      if (power && !vending) { clearTimeout(restT); lcd({ s: 'item', i: sl.i, mode: trayAt === sl.i ? 'ready' : 'preview' }); }
    });
    pad.addEventListener('pointerleave', () => {
      if (hover !== sl.i) return;
      hover = null; mark();
      if (power && !vending) { clearTimeout(restT); restT = setTimeout(rest, 380); }
    });
  }
  // the keys
  for (const [k, kk] of Object.entries(M.keys)) {
    const pad = hitPath(shift0(M.F), kk.x - 1, kk.y - 1, kk.w + 2, kk.h + 2);
    kk.wrap.appendChild(pad);
    bind(kk.wrap, k === 'OPEN' ? 'Open: open what is in the tray in a new tab' : k === 'CLR' ? 'Clear' : `Key ${k}`, () => press(k), { tabindex: k === 'OPEN' ? 0 : -1, down: () => pressKey(k, k === 'OPEN' ? 1.8 : 1.4) });
  }
  function shift0(pl) { return iso.shift(pl, 0, 0, 2.2); }
  // the tray: tap what is in it to open it
  {
    const [tx, ty, tw, th] = L.tray;
    const pad = hitPath(M.F, tx, ty, tw, th);
    hitsG.appendChild(pad);
    bind(pad, 'Tray: open what is in it in a new tab', () => { if (!open()) { sound.tick(); if (!vending && power) { lcd({ s: 'dir' }); } } });
  }
  // the cabinet as one focus stop: arrow keys choose, Enter vends
  {
    const pad = hitPath(M.F, L.gx, L.gy, L.gw, L.gh);
    pad.style.pointerEvents = 'none';
    hitsG.insertBefore(pad, hitsG.firstChild);
    pad.classList.add('hit');
    pad.setAttribute('role', 'group'); pad.setAttribute('tabindex', 0);
    pad.setAttribute('aria-label', 'Vending machine shelves: arrow keys choose a package, Enter vends it, Enter again opens it');
    pad.addEventListener('focus', () => { ctx.arm(); if (cursor == null) { cursor = 0; mark(); preview(); } });
  }

  /* ---------------- keyboard ---------------- */
  function preview() {
    if (vending || cursor == null || !power) return;
    clearTimeout(restT);
    lcd({ s: 'item', i: cursor, mode: trayAt === cursor ? 'ready' : 'preview' });
  }
  function moveCursor(dr, dc) {
    if (cursor == null) { cursor = 0; mark(); preview(); return; }
    const sl = slots[cursor];
    if (dc) {
      const n = cursor + dc;
      if (n >= 0 && n < slots.length) cursor = n;
    } else {
      const r = sl.r + dr;
      const row = S.rows[r];
      if (row) {
        // the slot nearest across, on the next shelf
        let best = row.slots[0], bd = 1e9;
        for (const s of row.slots) { const d = Math.abs(s.ac - sl.ac); if (d < bd) { bd = d; best = s; } }
        cursor = best.i;
      }
    }
    sound.tick(); mark(); wiggle(slots[cursor]); preview();
  }
  ctx.onKey = (e) => {
    const k = e.key;
    if (k === 'ArrowLeft') { moveCursor(0, -1); return true; }
    if (k === 'ArrowRight') { moveCursor(0, 1); return true; }
    if (k === 'ArrowUp') { moveCursor(-1, 0); return true; }
    if (k === 'ArrowDown') { moveCursor(1, 0); return true; }
    if (k === 'Enter') {
      if (cursor != null && trayAt === cursor && !vending) { pressKey('OPEN', 1.8); open(); return true; }
      if (cursor == null && trayAt != null) { pressKey('OPEN', 1.8); open(); return true; }
      if (cursor != null) { vend(cursor); return true; }
      cursor = 0; mark(); preview(); return true;
    }
    if (k === 'Backspace' || k === 'Escape' || k === 'Delete') { press('CLR'); return true; }
    const up = k.length === 1 ? k.toUpperCase() : '';
    if (up && M.keys[up]) { press(up); return true; }
    return false;
  };

  /* ---------------- params from the computer: { item } or { kind } ---------------- */
  let started = false, pendingGo = null;
  const findItem = (want) => {
    const w = String(want).toLowerCase(), wn = w.replace(/[^a-z0-9]/g, '');
    let s = slots.find((x) => x.it.id === w);
    if (!s) s = slots.find((x) => x.it.name.toLowerCase().replace(/[^a-z0-9]/g, '') === wn);
    if (!s && wn.length > 2) s = slots.find((x) => x.it.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(wn) || x.it.id.replace(/[^a-z0-9]/g, '').includes(wn));
    if (!s && /bundle|playbook|jobsearch/.test(wn)) s = slots.find((x) => x.it.id === 'bundle');
    return s;
  };
  function applyGo(p) {
    if (!p) return;
    const want = p.item || p.doc || p.product || p.id;
    if (want) { const s = findItem(want); if (s) vend(s.i); return; }
    if (p.kind) {
      const kd = S.kinds.find((k) => k.id === String(p.kind).toLowerCase().replace(/s$/, ''));
      if (!kd) return;
      if (!power) powerOn(true);
      const first = slots.find((s) => s.kind === kd.id);
      if (!first) return;
      cursor = first.i; mark();
      if (!vending) { clearTimeout(restT); lcd({ s: 'kind', kd }); restT = setTimeout(rest, 6000); }
      slots.filter((s) => s.kind === kd.id).forEach((s, j) => setTimeout(() => wiggle(s), 60 * j));
      sound.tick();
    }
  }
  ctx.onGo((p) => { if (!started) { pendingGo = p; return; } applyGo(p); });

  /* ---------------- power ---------------- */
  function powerOn(quick) {
    if (power) return;
    power = true;
    if (RM || quick) { M.dim.setAttribute('opacity', 0); lcd({ s: 'dir' }); return; }
    // the tube flickers, catches, and the LCD comes up
    const seq = [[0, 0.32], [70, 0.5], [150, 0.12], [230, 0.42], [330, 0]];
    seq.forEach(([t, o]) => setTimeout(() => M.dim.setAttribute('opacity', o), t));
    setTimeout(() => sound.click(), 0);
    setTimeout(() => sound.blip(392, 0.05), 330);
    const t0 = performance.now();
    const bootA = { step: () => {
      const k = Math.min(1, (performance.now() - t0) / 700);
      if (lcdState.s === 'boot' || lcdState.s === 'off') lcd({ s: 'boot', k: 1 - Math.pow(1 - k, 3) });
      if (k >= 1) { anims.delete(bootA); setTimeout(() => { if (lcdState.s === 'boot') { sound.blip(1046, 0.06); setTimeout(() => sound.blip(1568, 0.12), 80); rest(); } }, 650); }
    } };
    setTimeout(() => anims.add(bootA), 200);
  }

  /* ---------------- frame loop: blinking, the vend, an idle wiggle now and then ---------------- */
  let idleT = 4 + Math.random() * 3;
  ctx.raf((dt) => {
    blinkT += dt;
    const on = Math.floor(blinkT * 1.7) % 2 === 0 || RM;
    for (const n of blinkers) n.setAttribute('opacity', on ? 1 : 0);
    for (const a of [...anims]) a.step(dt);
    if (!RM && power && !vending) {
      idleT -= dt;
      if (idleT <= 0) { idleT = 5 + Math.random() * 5; wiggle(slots[Math.floor(Math.random() * slots.length)]); }
    }
  });

  /* ---------------- a11y, framing ---------------- */
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  ctx.a11y(`<p>A vending machine with Vlada's guides, skills and products. Pick a package or type its code on the keypad, then open it from the tray. Arrow keys choose, Enter vends, Enter again opens.</p>${S.kinds.map((kd) => {
    const its = slots.filter((s) => s.kind === kd.id);
    if (!its.length) return '';
    return `<h3>${esc(kd.label)}</h3><ul>${its.map((s) => `<li><a href="${esc(s.it.url)}" target="_blank" rel="noopener">${esc(s.it.name)}</a>: ${esc(s.it.line)} ${esc(s.it.meta)}, ${s.it.price ? '$' + s.it.price : 'free'}. Slot ${s.code}.</li>`).join('')}</ul>`;
  }).join('')}`);
  lcd({ s: 'off' });
  mark();
  {
    const loose = [...root.querySelectorAll('.shadow, .vm-pad')];
    loose.forEach((n) => (n.style.display = 'none'));
    const b = root.getBBox();
    loose.forEach((n) => (n.style.display = ''));
    const pad = MOB ? 8 : 16;
    ctx.view(b.x - pad, b.y - pad, b.width + pad * 2, b.height + pad * 2);
  }

  return {
    plotted() {
      if (started) return;
      started = true;
      powerOn(false);
      if (pendingGo) { const p = pendingGo; pendingGo = null; setTimeout(() => applyGo(p), RM ? 0 : 900); }
    },
    start() {},
    stop() {},
  };
}

/* ====================================================================================================== */
/* the hero tile: the same machine, lit, the directory on its LCD                                          */
/* ====================================================================================================== */
export async function hero(hx) {
  const { K, iso, root } = hx;
  const { el, g } = iso;
  const S = stock(hx.data?.library, 8);
  indexSlots(S);
  const L = layout(true, S);
  const M = machine(K, iso, root, S, L, { hero: true });
  M.parts.forEach((p) => root.appendChild(p));
  const SC = screens(iso, S, M);
  M.scr.append(el('rect', { x: 0, y: 0, width: M.SW, height: M.SH, style: `fill:${LCD[0]}` }), g({}, SC.dir([])));
}
