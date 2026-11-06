// 06 · Engagement · Card terminal (direction 18, Desk).
// Her Instagram numbers, printed as receipts. When it switches on, the terminal prints the overall receipt: followers,
// reels, plays, comments and her top videos. Every key on the pad is a brand, the 12 whose reels drew the most plays.
// Press one: the screen plays that collab while the printer runs its receipt, tears it off and drops it on the pile.
// TOTAL reprints the overall. ▶ (or the screen) opens the reel with sound. FEED prints a receipt in her voice.

/* ================= formatting ================= */
const f2 = (n) => Math.round(n * 100) / 100;
const rad = (d) => (d * Math.PI) / 180;
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
function fmtDate(s) {
  if (!s) return '';
  const [y, m, d] = String(s).split('-');
  const mm = MON[(+m || 1) - 1];
  return d ? `${d} ${mm} ${y}` : `${mm} ${y}`;
}
const fmtN = (n) => Math.round(Number(n) || 0).toLocaleString('en-US');
function fmtK(n) {
  n = Number(n) || 0;
  if (n >= 1e6) return (n / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(Math.round(n));
}
function wrap(s, n) {
  const out = [];
  let line = '';
  for (let w of String(s).split(/\s+/)) {
    while (w.length > n) { if (line) { out.push(line); line = ''; } out.push(w.slice(0, n)); w = w.slice(n); }
    if (!line) line = w; else if ((line + ' ' + w).length <= n) line += ' ' + w; else { out.push(line); line = w; }
  }
  if (line) out.push(line);
  return out;
}

/* ================= data ================= */
// The keypad: the 12 brands with a collab reel whose mentions drew the most plays (collabs.json `plays`).
function model(data, content) {
  const E = data?.engagement || null;
  const src = data?.collabs?.brands;
  const all = src && src.length ? src : content.CLIENTS.map((c) => ({ rank: c.rank, name: c.name, logo: { tile: c.tile, bg: c.bg, icon: c.icon }, reel: null, count: 0, plays: 0 }));
  const keys = all.filter((b) => b.reel).sort((a, b) => (b.plays || 0) - (a.plays || 0) || a.rank - b.rank).slice(0, 12);
  for (const b of all) { if (keys.length >= 12) break; if (!keys.includes(b)) keys.push(b); }
  return { E, all, keys, asOf: E?.asOf || data?.collabs?.asOf || '' };
}

/* ================= logos (monochrome, so they follow the theme) ================= */
const logoMap = new Map();
const maskCache = new Map();
// A 192 px tile becomes a white-on-transparent mask of just the mark (background removed, cropped to its bounds).
function tileMask(url) {
  if (maskCache.has(url)) return maskCache.get(url);
  const p = new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      try {
        const S = 192;
        const cv = document.createElement('canvas'); cv.width = S; cv.height = S;
        const cx = cv.getContext('2d', { willReadFrequently: true });
        cx.drawImage(img, 0, 0, S, S);
        const d = cx.getImageData(0, 0, S, S).data;
        let clear = 0;
        for (let i = 3; i < d.length; i += 4) if (d[i] < 200) clear++;
        const useAlpha = clear > S * S * 0.04;
        const cs = [[3, 3], [S - 4, 3], [3, S - 4], [S - 4, S - 4]].map(([x, y]) => { const i = (y * S + x) * 4; return [d[i], d[i + 1], d[i + 2]]; });
        const bg = [0, 1, 2].map((k) => cs.map((c) => c[k]).sort((a, b) => a - b)[1]);
        const m = new Float32Array(S * S);
        let x0 = S, y0 = S, x1 = -1, y1 = -1;
        for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
          const i = y * S + x, j = i * 4;
          const v = useAlpha ? d[j + 3] / 255 : Math.max(0, Math.min(1, (Math.hypot(d[j] - bg[0], d[j + 1] - bg[1], d[j + 2] - bg[2]) - 38) / 70));
          m[i] = v;
          if (v > 0.3) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        }
        if (x1 < 0) { res(null); return; }
        x0 = Math.max(0, x0 - 2); y0 = Math.max(0, y0 - 2); x1 = Math.min(S - 1, x1 + 2); y1 = Math.min(S - 1, y1 + 2);
        const w = x1 - x0 + 1, h = y1 - y0 + 1;
        const oc = document.createElement('canvas'); oc.width = w; oc.height = h;
        const ox = oc.getContext('2d');
        const od = ox.createImageData(w, h);
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const k = (y * w + x) * 4;
          od.data[k] = od.data[k + 1] = od.data[k + 2] = 255;
          od.data[k + 3] = Math.round(m[(y + y0) * S + (x + x0)] * 255);
        }
        ox.putImageData(od, 0, 0);
        res({ url: oc.toDataURL('image/png'), w, h });
      } catch (e) { res(null); }
    };
    img.onerror = () => res(null);
    img.src = url;
  });
  maskCache.set(url, p);
  return p;
}
// Vector icon first (crisp at keycap size), then the tile as a mask, then a wordmark.
async function prepLogo(b, content) {
  if (logoMap.has(b.name)) return logoMap.get(b.name);
  const L = b.logo || {};
  let r = { kind: 'word' };
  if (L.icon && content.ICONS?.[L.icon]) r = { kind: 'icon', path: content.ICONS[L.icon].path };
  else if (L.tile) { const m = await tileMask(content.tileUrl(L.tile)); if (m) r = { kind: 'mask', m }; }
  logoMap.set(b.name, r);
  return r;
}
const logoKind = (b) => logoMap.get(b.name) || { kind: 'word' };
// the real bounds of an icon path (many marks only fill part of their 24 x 24 box)
const boxCache = new Map();
function pathBox(d) {
  if (boxCache.has(d)) return boxCache.get(d);
  let b = { x: 0, y: 0, width: 24, height: 24 };
  try {
    const NS = 'http://www.w3.org/2000/svg';
    const sv = document.createElementNS(NS, 'svg');
    sv.setAttribute('style', 'position:absolute;left:-9999px;top:0;width:24px;height:24px;visibility:hidden');
    const pa = document.createElementNS(NS, 'path');
    pa.setAttribute('d', d);
    sv.appendChild(pa);
    document.body.appendChild(sv);
    const r = pa.getBBox();
    sv.remove();
    if (r.width > 0 && r.height > 0) b = { x: r.x, y: r.y, width: r.width, height: r.height };
  } catch (e) { /* keep the full box */ }
  boxCache.set(d, b);
  return b;
}
const isWordy = (lg) => lg.kind === 'word' || (lg.kind === 'mask' && lg.m.w / lg.m.h >= 1.7);
/** The brand's mark fitted into a w x h box centred on (cx, cy), in the current local coordinates. */
function logoNode(K, iso, b, cx, cy, w, h, fill) {
  const { g, el, txt } = iso;
  const lg = logoKind(b);
  if (lg.kind === 'icon') {
    const bb = pathBox(lg.path);
    const s = Math.min(w / bb.width, h / bb.height);
    const tx = cx - (bb.x + bb.width / 2) * s, ty = cy - (bb.y + bb.height / 2) * s;
    return el('path', { d: lg.path, transform: `translate(${f2(tx)} ${f2(ty)}) scale(${Math.round(s * 1000) / 1000})`, style: `fill:${fill}` });
  }
  if (lg.kind === 'mask') {
    const a = lg.m.w / lg.m.h;
    let ww = w, hh = w / a;
    if (hh > h) { hh = h; ww = h * a; }
    const x = cx - ww / 2, y = cy - hh / 2;
    const id = K.id('lm');
    K.def(el('mask', { id, maskUnits: 'userSpaceOnUse', x: f2(x), y: f2(y), width: f2(ww), height: f2(hh) }, [el('image', { href: lg.m.url, x: f2(x), y: f2(y), width: f2(ww), height: f2(hh), preserveAspectRatio: 'none' })]));
    return el('rect', { x: f2(x), y: f2(y), width: f2(ww), height: f2(hh), style: `fill:${fill}`, mask: `url(#${id})`, class: 'logo' });
  }
  const s = b.name;
  const size = Math.min(h * 0.92, w / (s.length * 0.65));
  return g({}, [txt(s, cx, cy + size * 0.36, { size: f2(size), anchor: 'middle', fill, weight: 500, font: 'Azeret Mono' })]);
}

/* ================= the terminal (shared by the section and the hero) ================= */
const G = (() => {
  const TILT = rad(20);
  const o = { TILT, SN: Math.sin(TILT), CS: Math.cos(TILT), TW: 106, TL: 220, TT: 17, BT: 41, BL: 50, YF: 74, ZB: 18, R: 7 };
  o.RW = 84; o.RA = (o.TW - o.RW) / 2;                 // paper width, paper left edge
  o.SX = 13; o.SY = 21; o.SW = 80; o.SH = 100;          // screen on the face
  // keypad: three brand columns and a narrow function column
  o.COLS = [[6.5, 24], [32.7, 24], [58.9, 24], [85.1, 14.4]];
  o.KY0 = 133.5; o.KR = 16; o.KHt = 13.6; o.KD = 2.6;
  return o;
})();
const DIG = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
const cubePaths = (iso, cx, cy, r, stroke, w = 0.45) => {
  const { el } = iso;
  const k = 0.866;
  return [
    el('path', { d: `M${cx} ${f2(cy - r)}L${f2(cx + r * k)} ${f2(cy - r / 2)}L${f2(cx + r * k)} ${f2(cy + r / 2)}L${cx} ${f2(cy + r)}L${f2(cx - r * k)} ${f2(cy + r / 2)}L${f2(cx - r * k)} ${f2(cy - r / 2)}Z`, style: `fill:none;stroke:${stroke};stroke-width:${w}` }),
    el('path', { d: `M${cx} ${cy}L${f2(cx + r * k)} ${f2(cy - r / 2)}M${cx} ${cy}L${f2(cx - r * k)} ${f2(cy - r / 2)}M${cx} ${cy}L${cx} ${f2(cy + r)}`, style: `fill:none;stroke:${stroke};stroke-width:${w * 0.8}` }),
  ];
};
const waves = (iso, cx, cy, s, style) => {
  let d = '';
  for (let i = 0; i < 4; i++) { const r = s * (0.35 + i * 0.28), a = 0.78; d += `M${f2(cx + r * Math.cos(-a))} ${f2(cy + r * Math.sin(-a))}A${f2(r)} ${f2(r)} 0 0 1 ${f2(cx + r * Math.cos(a))} ${f2(cy + r * Math.sin(a))}`; }
  return iso.el('path', { d, style: `fill:none;stroke-linecap:round;${style}` });
};

function drawTerminal(K, iso, o = {}) {
  const { g, el, face, txt, plane, shift, rrect, MAT, at, mul, dpoly, taperRect } = iso;
  const { TW, TL, TT, BT, BL, YF, ZB, SN, CS, R, RW, RA, SX, SY, SW, SH } = G;
  const mini = !!o.mini;
  const V = [0, SN, -CS];
  const fpl = plane([0, YF - TL * SN, ZB + TL * CS], [1, 0, 0], V); // face: a 0..TW, b 0..TL (top to bottom)
  const N = fpl.n;
  const side = plane(at(fpl, TW, 0, 0), mul(N, -1), V);              // right side: a 0..TT (front to back)
  const topS = plane(at(fpl, 0, 0, -TT), [1, 0, 0], N);              // slab top: b 0..TT (back to front)
  const lab = (s, x, y, size = 3, anchor = 'middle', fill = 'var(--t2)') => txt(s, x, y, { size, anchor, fill, font: 'Silkscreen', ls: 0.35 });
  const out = { fpl, N, side, topS };

  /* cradle */
  const baseG = g();
  baseG.appendChild(K.shadow(rrect(-22, -18, TW + 44, 110, 26), 0, 0, 0, 0.7, K.blurFilter(14)));
  baseG.appendChild(K.shadow(rrect(-4, -4, TW + 4, 64, 10), 0, 0, 30, 0.55, K.blurFilter(3)));
  const base = K.box(-10, 8, 0, TW + 20, 86, 12, MAT.body2, { r: 12, seg: 6 });
  baseG.appendChild(base);
  baseG.appendChild(face(base.top, [el('path', { d: dpoly(rrect(4, 4, TW + 12, 78, 9, 5)), class: 's3' })], 0.02));
  if (!mini) baseG.appendChild(face(base.fy, [el('circle', { cx: (TW + 20) / 2 - 2, cy: 6.4, r: 0.9, style: 'fill:var(--m-accent)' }), lab('CHARGE', (TW + 20) / 2 + 2, 7.6, 2.6, 'start')], 0.02));
  baseG.appendChild(face(base.fx, [el('path', { d: 'M8 6 L78 6', class: 's3' })], 0.02));
  out.baseG = baseG;

  /* body: printer housing, slab, slot, tear bar, side hardware, glass */
  const termG = g();
  termG.appendChild(K.prism(rrect(3, 0, TW - 6, BL, 10, 6), shift(fpl, 0, 0, -TT + 0.6), BT - TT + 0.6, MAT.body2));
  termG.appendChild(K.prism(rrect(0, 0, TW, TL, R, 6), fpl, TT, MAT.shell));
  const SLOT_C = -TT + 1.6;      // the paper leaves the slot here (face c)
  const tb = TT + SLOT_C;        // ... which is this b on the slab top
  termG.appendChild(K.recess(rrect(RA - 2.2, tb - 1.1, RW + 4.4, 2.2, 1, 3), topS, 2, MAT.deep));
  {
    let zz = `M${RA - 2} ${f2(tb + 1.9)}`;
    for (let x = RA - 2; x < RA + RW + 2; x += 1.6) zz += `L${f2(x + 0.8)} ${f2(tb + 1.15)}L${f2(Math.min(RA + RW + 2, x + 1.6))} ${f2(tb + 1.9)}`;
    termG.appendChild(face(topS, [el('path', { d: zz, class: 's2' }), el('path', { d: `M${RA + 1} ${f2(tb + 5.4)} L${RA + RW - 1} ${f2(tb + 5.4)}`, class: 's3' })], 0.02));
  }
  const topB = plane(at(fpl, 0, 0, -BT), [1, 0, 0], N);
  termG.appendChild(face(topB, [el('path', { d: `M18 6 L${TW - 18} 6`, class: 's3' }), el('path', { d: `M${TW / 2 - 7} 14.5 L${TW / 2 + 7} 14.5`, class: 's2' })], 0.02));
  termG.appendChild(K.recess(rrect(6.8, 62, 3.4, 118, 1.6, 3), side, 2.2, MAT.deep));
  if (!mini) termG.appendChild(face(side, [lab('SWIPE', 8.5, 56.5, 2.4)], 0.02));
  termG.appendChild(K.prism(rrect(6.2, 28, 4.6, 14, 2, 3), shift(side, 0, 0, 1.2), 1.8, MAT.key));
  const sideB = plane(at(fpl, TW - 3, 0, -TT + 0.6), mul(N, -1), V);
  termG.appendChild(K.recess(rrect(6, 18, 12, 4, 1.6, 3), sideB, 1.2, MAT.deep));
  // glass panel and the (dark) screen
  const GL = rrect(7, 15, TW - 14, SH + 13, 6, 6);
  termG.appendChild(face(fpl, [
    el('path', { d: dpoly(GL), style: `fill:${K.grad([[0, 'color-mix(in oklab, var(--m-glass) 86%, var(--m-shell))'], [1, 'var(--m-glass)']], 0, 0, 0.4, 1)}`, class: 'f' }),
    el('path', { d: dpoly(GL), class: 's2' }),
    el('rect', { x: SX, y: SY, width: SW, height: SH, rx: 1.2, style: 'fill:color-mix(in oklab, var(--m-glass) 78%, var(--shade))', class: 'f' }),
  ], 0.04));
  // above the glass: cube badge, four status LEDs, contactless mark
  const leds = [], glows = [];
  const top = [...cubePaths(iso, 12.5, 8, 2.6, 'var(--ink)', 0.4)];
  [TW / 2 - 9, TW / 2 - 3, TW / 2 + 3, TW / 2 + 9].forEach((a) => {
    const gl = el('circle', { cx: a, cy: 8, r: 3, style: 'fill:var(--lcd)', opacity: 0, filter: `url(#${K.glowId})` });
    const l = el('circle', { cx: a, cy: 8, r: 1.15, style: 'fill:var(--m-deep)', class: 'sf' });
    glows.push(gl); leds.push(l); top.push(gl, l);
  });
  top.push(waves(iso, TW - 17, 8, 5.2, 'stroke:var(--ink2);stroke-width:0.5'));
  termG.appendChild(face(fpl, top, 0.05));
  // under the keypad: the chip-card slot
  termG.appendChild(K.recess(rrect(20, 204, TW - 40, 7.6, 3, 4), fpl, 1, MAT.body2));
  termG.appendChild(K.recess(rrect(24, 206.6, TW - 48, 2.4, 1.1, 3), fpl, 3.2, MAT.deep));
  if (!mini) termG.appendChild(face(fpl, [lab('INSERT CARD', TW / 2, 202.2, 2.3)], 0.03));
  out.termG = termG; out.leds = leds; out.glows = glows;

  /* keypad: 12 brand keys, ▶, FEED and a tall TOTAL */
  const { COLS, KY0, KR, KHt, KD } = G;
  const keysG = g();
  const kx0 = COLS[0][0], kx1 = COLS[3][0] + COLS[3][1];
  keysG.appendChild(K.recess(rrect(kx0 - 2, KY0 - 2, kx1 - kx0 + 4, 3 * KR + KHt + 4, 3, 4), fpl, 0.8, MAT.deep));
  const capPl = shift(fpl, 0, 0, KD);
  const keys = [];
  const LEG = 'var(--ink)', LEG2 = 'var(--ink2)';
  const onAcc = 'color-mix(in oklab, var(--m-accent) 20%, var(--shade))';
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    let id, kind;
    if (c < 3) { id = r * 3 + c; kind = 'brand'; }
    else if (r === 0) { id = 'PLAY'; kind = 'fn'; }
    else if (r === 1) { id = 'FEED'; kind = 'fn'; }
    else if (r === 2) { id = 'TOTAL'; kind = 'total'; }
    else continue;
    const x = COLS[c][0], y = KY0 + r * KR, w = COLS[c][1], h = kind === 'total' ? KR + KHt : KHt;
    const { cap, base: bse } = taperRect(x, y, w, h, 2.4, 0.8, 4);
    const kg = g();
    kg.appendChild(K.prism(cap, capPl, KD, kind === 'total' ? MAT.accent : MAT.key, { base: bse }));
    const cx = x + w / 2, cy = y + h / 2;
    const legend = [];
    if (kind === 'brand') {
      const b = o.keys?.[id];
      if (b) {
        const lg = logoKind(b);
        if (!mini) legend.push(txt(DIG[id], x + 2.6, y + 4, { size: 2.4, fill: LEG2, weight: 500 }));
        if (isWordy(lg)) legend.push(logoNode(K, iso, b, cx + 0.6, cy + 0.3, w - 6.4, mini ? 6.4 : 5.8, LEG));
        else {
          legend.push(logoNode(K, iso, b, cx, cy - (mini ? 0 : 1.7), 16, mini ? 8 : 6.6, LEG));
          if (!mini) { const nm = b.name; legend.push(txt(nm, cx, y + h - 2, { size: f2(Math.min(2.7, (w - 4) / (nm.length * 0.65))), anchor: 'middle', fill: LEG, weight: 500 })); }
        }
      }
    } else if (id === 'PLAY') {
      legend.push(el('path', { d: `M${cx - 2} ${cy - 2.6} L${cx + 2.8} ${cy} L${cx - 2} ${cy + 2.6} Z`, style: `fill:${LEG}` }));
    } else if (id === 'FEED') {
      legend.push(el('path', { d: `M${cx} ${cy + 1.2} L${cx} ${cy - 3} M${cx - 1.7} ${cy - 1.3} L${cx} ${cy - 3} L${cx + 1.7} ${cy - 1.3} M${cx - 3} ${cy + 3} L${cx + 3} ${cy + 3}`, style: `fill:none;stroke:${LEG};stroke-width:0.75;stroke-linecap:round;stroke-linejoin:round` }));
    } else {
      legend.push(txt('TOTAL', cx, cy + 1.1, { size: 3.05, anchor: 'middle', fill: onAcc, weight: 500 }));
      legend.push(el('path', { d: `M${cx - 4} ${cy + 3.6} L${cx + 4} ${cy + 3.6}`, style: `fill:none;stroke:${onAcc};stroke-width:0.4` }));
    }
    kg.appendChild(face(capPl, legend, 0.02));
    const wrapG = g({}, [kg]);
    keysG.appendChild(wrapG);
    keys.push({ id, kind, el: kg, wrap: wrapG, x, y, w, h, b: kind === 'brand' ? o.keys?.[id] : null });
  }
  out.keysG = keysG; out.keys = keys; out.capPl = capPl;

  /* cradle lip in front of the foot */
  const lipG = g();
  lipG.appendChild(K.box(TW + 1, 50, 12, 8, 35, 11, MAT.body2, { r: 2.6 }));
  const lip = K.box(-6, YF + 1, 12, TW + 15, 10, 9.5, MAT.body2, { r: 3.2 });
  lipG.appendChild(lip);
  lipG.appendChild(face(lip.top, [el('path', { d: `M4 5 L${TW + 11} 5`, class: 's3' })], 0.02));
  out.lipG = lipG;

  /* paper path */
  const UP = [0, -SN, CS];
  const pDir = iso.norm(iso.sub(UP, mul(N, 0.1)));
  out.pDir = pDir;
  out.slot0 = at(fpl, RA, 0, SLOT_C);
  out.scrPl = shift(fpl, SX, SY, 0.08);
  return out;
}

/* ================= the receipt ================= */
const RC = { F: 6.4, KY: 1.35, PX: 4.2, ADV: 0.65 };
const INK = 'var(--paper-ink)';
const DIM = 'color-mix(in oklab, var(--paper-ink) 55%, var(--m-paper))';
/** Lay out one receipt in its own coordinates (x 0..RW across, y down from the top edge). */
function receiptNode(K, iso, M, sel, thumb) {
  const { g, el, txt } = iso;
  const RW = G.RW, PX = RC.PX, F = RC.F, KY = RC.KY, ADV = RC.ADV;
  const N = Math.floor((RW - 2 * PX) / (ADV * F));
  const kids = [];
  let y = 4.2;
  const T = (s, x, base, o = {}) => {
    const size = o.size || F, ky = o.ky ?? KY;
    const t = txt(s, 0, 0, { size: f2(size), fill: o.fill || INK, anchor: o.anchor, weight: o.weight || 500, ls: o.ls, font: 'Azeret Mono' });
    t.setAttribute('transform', `translate(${f2(x)} ${f2(base)}) scale(1 ${ky})`);
    kids.push(t);
    return t;
  };
  const W = (s, size = F, ls = 0) => s.length * (ADV * size + ls);
  const row = (size, fn, lead = 1.24) => { const base = y + size * KY * 0.86; fn(base); y += size * KY * lead; };
  const center = (s, o = {}) => row(o.size || F, (b) => T(s, RW / 2, b, { ...o, anchor: 'middle' }), o.lead);
  const rule = (dash = true) => { y += 1.6; kids.push(el('path', { d: `M${PX} ${f2(y)} L${RW - PX} ${f2(y)}`, style: `fill:none;stroke:${DIM};stroke-width:0.42${dash ? ';stroke-dasharray:1.3 0.9' : ''}` })); y += 2.6; };
  const dbl = () => { y += 1.4; kids.push(el('path', { d: `M${PX} ${f2(y)} L${RW - PX} ${f2(y)} M${PX} ${f2(y + 1)} L${RW - PX} ${f2(y + 1)}`, style: `fill:none;stroke:${INK};stroke-width:0.36` })); y += 3.2; };
  const leader = (label, value, o = {}) => row(o.size || F, (b) => {
    const size = o.size || F;
    T(label, PX, b, { size, fill: o.lfill || INK, weight: o.weight });
    T(value, RW - PX, b, { size: o.vsize || size, anchor: 'end', weight: o.weight });
    const x1 = PX + W(label, size) + 1.3, x2 = RW - PX - W(value, o.vsize || size) - 1.3;
    if (x2 - x1 > 1.6) kids.push(el('path', { d: `M${f2(x1)} ${f2(b - 0.5)} L${f2(x2)} ${f2(b - 0.5)}`, style: `fill:none;stroke:${DIM};stroke-width:0.62;stroke-dasharray:0.01 1.55;stroke-linecap:round` }));
  }, o.lead);
  const header = (sub) => {
    row(F * 1.06, (b) => {
      const s = 'vladasana', size = F * 1.06, w = W(s, size, 0.4) + 6;
      const x0 = RW / 2 - w / 2;
      kids.push(...cubePaths(iso, f2(x0 + 2.4), f2(b - size * 0.36 * KY), 2.5, INK, 0.42));
      T(s, x0 + 6, b, { size, ls: 0.4 });
    }, 1.3);
    if (sub) center(sub, { size: F * 0.74, fill: DIM, ls: 0.3 });
  };
  const barcode = (seed) => {
    let h = 2166136261;
    for (const ch of String(seed)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 997) / 997; };
    const u = 0.58, x0 = PX + 6, x1 = RW - PX - 6, top = y + 1.2, hh = 9.5;
    let d = '', x = x0;
    const bar = (bw) => { d += `M${f2(x)} ${f2(top)}h${f2(bw)}v${hh}h${f2(-bw)}z`; };
    bar(u); x += u * 2; bar(u); x += u * 2;
    while (x < x1 - u * 9) { const bw = u * (1 + Math.floor(rnd() * 3)); bar(bw); x += bw + u * (1 + Math.floor(rnd() * 3)); }
    x = Math.max(x, x1 - u * 5); bar(u); x += u * 2; bar(u);
    kids.push(el('path', { d, style: `fill:${INK}` }));
    y = top + hh + 1.4;
  };

  const E = M.E || {};
  if (sel.kind === 'total') {
    header('@vlada.asana');
    rule();
    center('ENGAGEMENT', { size: F * 1.1, ls: 0.5 });
    center(`instagram · ${fmtDate(M.asOf)}`, { size: F * 0.72, fill: DIM });
    rule();
    if (E.followers) leader('followers', String(E.followers));
    if (E.reels) leader('reels', fmtN(E.reels));
    if (E.avgPlays) leader('avg plays', fmtK(E.avgPlays));
    if (E.medianPlays) leader('median plays', fmtK(E.medianPlays));
    if (E.comments) leader('comments', fmtN(E.comments));
    if (E.over100k) leader('reels 100K+', String(E.over100k));
    if (E.since) leader('since', fmtDate(E.since));
    rule();
    row(F * 0.8, (b) => { T('TOP VIDEOS', PX, b, { size: F * 0.8, ls: 0.5 }); T('PLAYS', RW - PX, b, { size: F * 0.8, anchor: 'end', fill: DIM, ls: 0.5 }); }, 1.5);
    const S2 = F * 0.8, CW = ADV * S2;
    const NS = Math.floor((RW - 2 * PX) / CW);
    (E.topReels || []).forEach((r, i) => {
      // title over the full width; the plays sit right-aligned on its last line, or on a line of their own
      const ls = wrap(r.title, NS - 2);
      const amt = fmtK(r.plays);
      const own = 2 + ls[ls.length - 1].length + 1 + amt.length > NS;
      const rows = own ? [...ls, ''] : ls;
      rows.forEach((s, j) => row(S2, (b) => {
        if (j === 0) T(String(i + 1), PX, b, { size: S2, fill: DIM });
        if (s) T(s, PX + 2 * CW, b, { size: S2 });
        if (j === rows.length - 1) T(amt, RW - PX, b, { size: S2, anchor: 'end' });
      }, j === rows.length - 1 ? 1.4 : 1.14));
    });
    dbl();
    leader('TOTAL', fmtN(E.totalPlays), { vsize: F * 1.2, lead: 1.32 });
    row(F * 0.74, (b) => T('plays', RW - PX, b, { size: F * 0.74, anchor: 'end', fill: DIM }));
    dbl();
    barcode('vlada.asana' + M.asOf);
    center('@vlada.asana', { size: F * 0.7, fill: DIM, ls: 0.4 });
    y += 1.5;
    center('thank you for', { size: F * 0.86 });
    center('your attention', { size: F * 0.86 });
  } else if (sel.kind === 'brand') {
    const b = sel.b, r = b.reel;
    header('collab receipt');
    rule();
    const bs = Math.min(F * 1.5, (RW - 2 * PX) / (b.name.length * ADV));
    center(b.name, { size: bs, lead: 1.2 });
    if (r) {
      center(fmtDate(r.date), { size: F * 0.78, fill: DIM });
      y += 1.6;
      const tw = 19.5, th = tw * 16 / 9;
      const ty = y;
      kids.push(el('rect', { x: PX, y: f2(ty), width: tw, height: f2(th), style: `fill:none;stroke:${DIM};stroke-width:0.35` }));
      if (thumb) { const bm = K.bitmap(thumb, PX, ty, tw, th, INK, null); kids.push(bm); }
      const S3 = F * 0.86, xT = PX + tw + 3;
      const n3 = Math.floor((RW - PX - xT) / (ADV * S3));
      let yy = ty + S3 * KY * 0.9;
      const tl = wrap(r.title, n3).slice(0, 5);
      for (const s of tl) { T(s, xT, yy, { size: S3 }); yy += S3 * KY * 1.18; }
      if (yy + F * 0.72 * KY < ty + th) T('instagram reel', xT, ty + th - 0.6, { size: F * 0.72, fill: DIM });
      y = ty + th + 1.4;
      rule();
      leader('plays', fmtK(r.plays));
      leader('comments', fmtN(r.comments));
      leader('posted', fmtDate(r.date));
      rule();
      for (const s of wrap(`her reels on ${b.name}`, Math.floor((RW - 2 * PX) / (ADV * F * 0.8)))) center(s.toUpperCase(), { size: F * 0.8, fill: DIM, ls: 0.2 });
      leader('reels', fmtN(b.count));
      leader('plays', fmtK(b.plays));
      dbl();
      leader('TOTAL', fmtN(r.plays), { vsize: F * 1.2, lead: 1.32 });
      row(F * 0.74, (bb) => T('plays', RW - PX, bb, { size: F * 0.74, anchor: 'end', fill: DIM }));
      dbl();
      barcode(r.code);
      center(r.code, { size: F * 0.7, fill: DIM, ls: 0.6 });
    } else {
      center('brand partner', { size: F * 0.8, fill: DIM });
      rule();
      center('the collab lives', { size: F * 0.86 });
      center('on @vlada.asana', { size: F * 0.86 });
      dbl();
      barcode(b.name);
    }
    y += 1.5;
    center('thank you for', { size: F * 0.86 });
    center('your attention', { size: F * 0.86 });
  } else {
    header('customer copy');
    rule();
    center('DEV RECEIPT', { size: F * 1.12, ls: 0.6 });
    rule();
    leader('bugs fixed', '1');
    leader('bugs created', '2');
    leader('coffee', 'yes');
    leader('tabs open', 'yes');
    dbl();
    center('STATUS', { size: F * 0.8, fill: DIM, ls: 0.6 });
    center('works on', { size: F * 1.1 });
    center('my machine', { size: F * 1.1 });
    dbl();
    barcode('free spirited dev');
    center('free spirited dev', { size: F * 0.86 });
  }
  y += 4.4;
  const len = f2(y);
  // paper: torn (zigzag) at both ends
  let d = 'M0 2.2';
  for (let x = 0; x < RW; x += 2.4) d += `L${f2(x + 1.2)} 0L${f2(Math.min(RW, x + 2.4))} 2.2`;
  d += `L${RW} ${f2(len - 2.2)}`;
  for (let x = RW; x > 0; x -= 2.4) d += `L${f2(x - 1.2)} ${len}L${f2(Math.max(0, x - 2.4))} ${f2(len - 2.2)}`;
  d += 'Z';
  const paper = el('path', { d, style: 'fill:var(--m-paper)', class: 'f' });
  // explicit styles: the printing stub shows this node through <use>, where class rules from the page do not reach
  const edge = el('path', { d, class: 's2', style: 'fill:none;stroke:var(--ink2);stroke-width:calc(var(--hair, 1) * 1px);stroke-linejoin:round' });
  return { node: g({ class: 'rcpt' }, [paper, ...kids, edge]), len, N };
}

/* ================= the screen's overall summary (also used by the hero) ================= */
const SC = { bg: 'var(--m-glass)', fg: 'var(--lcd)', dim: 'color-mix(in oklab, var(--lcd) 56%, var(--m-glass))', faint: 'color-mix(in oklab, var(--lcd) 18%, var(--m-glass))' };
function totalScreen(iso, M, o = {}) {
  const { el, txt } = iso;
  const { SW, SH } = G;
  const E = M.E || {};
  const T = (s, x, y, op = {}) => txt(s, x, y, { size: 3.4, fill: SC.fg, font: 'Azeret Mono', weight: 500, ...op });
  const kids = [el('rect', { x: 0, y: 0, width: SW, height: SH, style: `fill:${SC.bg}` })];
  kids.push(...statusBar(iso));
  kids.push(T('ENGAGEMENT', 5, 15.8, { size: 3.1, fill: SC.dim, ls: 0.55 }));
  kids.push(T(fmtK(E.totalPlays), 4.4, 31.6, { size: 14.4 }));
  kids.push(T(`plays since ${fmtDate(E.since).toLowerCase()}`, 5, 38, { size: 3.3, fill: SC.dim }));
  kids.push(el('path', { d: `M5 42 L${SW - 5} 42`, style: `stroke:${SC.faint};stroke-width:0.4` }));
  [['followers', String(E.followers || '')], ['reels', fmtN(E.reels)]].forEach(([l, v], i) => {
    kids.push(T(l, 5, 48.6 + i * 6.4, { size: 3.5, fill: SC.dim }), T(v, SW - 5, 48.6 + i * 6.4, { size: 3.9, anchor: 'end' }));
  });
  kids.push(el('path', { d: `M5 59 L${SW - 5} 59`, style: `stroke:${SC.faint};stroke-width:0.4` }));
  kids.push(T('TOP VIDEOS', 5, 65, { size: 2.9, fill: SC.dim, ls: 0.55 }), T('PLAYS', SW - 5, 65, { size: 2.9, fill: SC.dim, ls: 0.55, anchor: 'end' }));
  const top = (E.topReels || []).slice(0, 6);
  const max = Math.max(1, ...top.map((r) => r.plays));
  const bw = SW - 9 - 5 - 15;
  const RH = o.mini ? 4.6 : 3.95;   // the section's screen keeps room for its prompt
  top.forEach((r, i) => {
    const yy = 67.8 + i * RH;
    kids.push(T(String(i + 1), 5, yy + 2.3, { size: 2.7, fill: SC.dim }));
    kids.push(el('rect', { x: 9, y: f2(yy), width: f2(Math.max(1, bw * (r.plays / max))), height: o.mini ? 2.5 : 2.3, rx: 0.4, style: `fill:${i === 0 ? SC.fg : SC.dim}` }));
    kids.push(T(fmtK(r.plays), SW - 5, yy + 2.5, { size: 3, anchor: 'end', fill: i === 0 ? SC.fg : SC.dim }));
  });
  if (!o.mini) {
    // the prompt, the way a card terminal asks for a card: an inverted bar at the foot of the screen, pointing at the keys
    const fs = o.mob ? 4.9 : 4.3, y0 = 91.6, h = SH - y0 - 1.6, cy = y0 + h / 2;
    const label = 'PRESS A BRAND', tw = label.length * fs * 0.7;   // Azeret Mono: 0.65 em a glyph, plus the spacing
    const x0 = SW / 2 - (tw + fs * 1.5) / 2;
    const pr = iso.g({ class: 'pos-prompt' }, [
      el('rect', { x: 3, y: f2(y0), width: SW - 6, height: f2(h), rx: 1.2, style: `fill:${SC.fg}` }),
      el('path', { d: `M${f2(x0)} ${f2(cy - fs * 0.32)} h${f2(fs * 0.86)} l${f2(-fs * 0.43)} ${f2(fs * 0.62)} z`, style: `fill:${SC.bg}` }),
      T(label, f2(x0 + fs * 1.5), f2(cy + fs * 0.36), { size: fs, fill: SC.bg, ls: f2(fs * 0.05) }),
    ]);
    kids.push(pr);
  }
  return kids;
}
function statusBar(iso) {
  const { el, txt } = iso;
  const { SW } = G;
  return [
    ...cubePaths(iso, 4.4, 4.6, 1.8, SC.dim, 0.4),
    txt('vladasana', 7.8, 5.8, { size: 2.9, fill: SC.dim, font: 'Azeret Mono', weight: 500 }),
    el('rect', { x: SW - 9.4, y: 2.8, width: 6, height: 3.2, rx: 0.6, style: `fill:none;stroke:${SC.dim};stroke-width:0.4` }),
    el('rect', { x: SW - 8.8, y: 3.4, width: 3.8, height: 2, style: `fill:${SC.dim}` }),
    el('rect', { x: SW - 3.2, y: 3.8, width: 0.6, height: 1.2, style: `fill:${SC.dim}` }),
    ...[0, 1, 2].map((i) => el('rect', { x: SW - 17 + i * 1.6, y: f2(5.8 - (i + 1) * 0.9), width: 1, height: f2((i + 1) * 0.9), style: `fill:${SC.dim}` })),
  ];
}

/* ================= the section ================= */
export default async function build(ctx) {
  const { K, KF, iso, root, fore, sound, content } = ctx;
  const { g, el, face, txt, plane, shift, rrect, MAT, P, at, add, mul, dpoly, lerp3 } = iso;
  const mob = ctx.mobile, RM = ctx.reduced;
  const M = model(ctx.data, content);
  const E = M.E || {};
  await Promise.all(M.keys.map((b) => prepLogo(b, content)));
  const T = drawTerminal(K, iso, { keys: M.keys, content });
  const { fpl, N, scrPl, pDir, slot0 } = T;
  const { RW, SW, SH } = G;
  const ease = (t) => t * t * (3 - 2 * t);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const clamp01 = (t) => Math.max(0, Math.min(1, t));

  /* ---------- the printing stub: straight out of the slot, then it curls back over the housing ---------- */
  const stubG = g();
  const stubMove = g();
  stubG.appendChild(stubMove);
  const useId = K.id('rcbody');
  const RMAX = 30;
  const segDefs = [{ lean: null, len: RMAX }, { lean: 64, len: 10 }, { lean: 110, len: 23 }];
  const segs = [];
  {
    let p0 = slot0, from = 0;
    for (const sd of segDefs) {
      const dir = sd.lean == null ? pDir : [0, -Math.sin(rad(sd.lean)), Math.cos(rad(sd.lean))];
      const topP = add(p0, mul(dir, sd.len));
      const pl = plane(topP, [1, 0, 0], mul(dir, -1));
      const cid = K.id('stubclip');
      const clipR = el('rect', { x: -1, y: 0, width: RW + 2, height: 0 });
      K.def(el('clipPath', { id: cid }, [clipR]));
      const use = el('use', { href: `#${useId}` });
      const shadeR = el('rect', { x: -1, y: -1, width: RW + 2, height: sd.len + 2, style: 'fill:var(--shade)', opacity: f2(1 - iso.lightOf(MAT.paper, pl.n)) });
      const crease = el('path', { d: `M0 0 L${RW} 0`, class: 's3', opacity: 0 });
      const fg = face(pl, [g({ 'clip-path': `url(#${cid})` }, [use, shadeR]), crease]);
      segs.push({ pl, from, len: sd.len, clipR, use, crease, g: fg });
      p0 = topP; from += sd.len;
    }
    for (let i = segs.length - 1; i >= 0; i--) stubMove.appendChild(segs[i].g);
  }
  let stubLen = 0;
  function setStub(L) {
    stubLen = L;
    stubG.style.display = L > 0.2 ? '' : 'none';
    for (const s of segs) {
      const vis = Math.min(s.len, L - s.from);
      if (vis <= 0) { s.clipR.setAttribute('height', 0); s.crease.setAttribute('opacity', 0); continue; }
      const b0 = s.len - vis;
      s.clipR.setAttribute('y', f2(b0 - 0.4)); s.clipR.setAttribute('height', f2(vis + 0.8));
      s.use.setAttribute('transform', `translate(0 ${f2(s.from + s.len - L)})`);
      s.crease.setAttribute('opacity', L - s.from > s.len + 0.5 ? 1 : 0);
    }
  }
  setStub(0);

  /* ---------- the pile on the desk ---------- */
  const pileG = g();
  const blurS = K.blurFilter(2.2);
  // pose: the receipt's top-centre on the desk (screen-space target converted to world), z and rotation
  const fromScreen = (sx, sy, z = 0) => { const xmy = sx / 0.866, xpy = (sy + z) * 2; return [(xpy + xmy) / 2, (xpy - xmy) / 2]; };
  const POSES = (mob
    ? [[-112, -6, -45], [-108, -42, -42], [-116, -64, -48]]
    : [[-150, -122, -41], [-268, -150, -44], [-300, -170, -53]])
    .map(([sx, sy, th], i) => { const [x, y] = fromScreen(sx, sy); return { x, y, z: 0.6 - i * 0.2, th }; });
  const desk = [];  // newest first: { grp, sh, paperG, len, sel, pose }
  function makeDesk(body, len, sel) {
    const sh = el('path', { style: 'fill:var(--shadow)', opacity: 0.3, filter: `url(#${blurS})`, class: 'shadow' });
    const paperG = g({}, [body]);
    const grp = g({ class: 'pile' }, [sh, paperG]);
    const r = { grp, sh, paperG, len, sel, pose: null, body };
    if (sel.kind === 'brand' && sel.b.reel) {
      ctx.hit(grp, `${sel.b.name} receipt: watch the reel`, () => openFor(sel), { tabindex: -1 });
    } else if (sel.kind === 'total' && E.topReels?.[0]) {
      ctx.hit(grp, 'Overall receipt: watch her top video', () => openTop(0), { tabindex: -1 });
    }
    return r;
  }
  function placeDesk(r, p) {
    const t = rad(p.th);
    const u = [Math.cos(t), Math.sin(t), 0], v = [-Math.sin(t), Math.cos(t), 0];
    const o = [p.x - u[0] * RW / 2, p.y - u[1] * RW / 2, p.z];
    const pl = plane(o, u, v);
    r.paperG.setAttribute('transform', iso.matrix(pl));
    const lift = Math.max(0, p.z);
    const pts = [[0, 0], [RW, 0], [RW, r.len], [0, r.len]].map(([a, b]) => { const q = at(pl, a, b); return P([q[0] + lift * 0.35 + 1.1, q[1] + lift * 0.35 + 1.1, 0]); });
    r.sh.setAttribute('d', dpoly(pts));
    r.sh.setAttribute('opacity', f2(0.3 * Math.max(0.25, 1 - lift / 70)));
    r.pose = p;
  }
  const lerpPose = (a, b, k) => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k, th: a.th + (b.th - a.th) * k });
  function reorderPile() { for (let i = desk.length - 1; i >= 0; i--) pileG.appendChild(desk[i].grp); }

  /* ---------- draw order ---------- */
  root.appendChild(T.baseG);
  root.appendChild(T.termG);
  root.appendChild(stubG);
  root.appendChild(T.keysG);
  root.appendChild(T.lipG);
  const scrOutline = rrect(0, 0, SW, SH, 1.2, 3).map(([a, b]) => P(at(scrPl, a, b)));
  const scrHit = g({}, [el('path', { d: dpoly(scrOutline), style: 'fill:transparent' })]);
  root.appendChild(scrHit);
  root.appendChild(pileG);

  /* ---------- video on the screen ---------- */
  const box = document.createElement('div');
  box.style.cssText = `width:${SW}px;height:${SH}px;clip-path:inset(0 round 1.2px);overflow:hidden;background:var(--m-glass);opacity:0;pointer-events:none;transition:opacity .35s ease;`;
  const vid = document.createElement('video');
  vid.muted = true; vid.defaultMuted = true; vid.setAttribute('muted', ''); vid.playsInline = true; vid.setAttribute('playsinline', ''); vid.loop = true; vid.preload = 'none';
  vid.disablePictureInPicture = true; vid.setAttribute('aria-hidden', 'true'); vid.tabIndex = -1;
  vid.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:var(--m-glass);';
  const still = document.createElement('img');
  still.alt = ''; still.decoding = 'async';
  still.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:none;background:var(--m-glass);';
  box.append(vid, still);
  ctx.overlay(box, scrPl, 0, 0);

  /* ---------- screen UI (fore, above the video) ---------- */
  const uiClip = KF.id('posui');
  KF.def(el('clipPath', { id: uiClip }, [el('path', { d: dpoly(scrOutline) })]));
  const ui = face(scrPl, []);
  fore.appendChild(g({ 'clip-path': `url(#${uiClip})` }, [ui]));
  const ST = (s, x, y, o = {}) => txt(s, x, y, { size: 3.4, fill: SC.fg, font: 'Azeret Mono', weight: 500, ...o });
  const screen = (kids) => g({ style: 'display:none' }, kids);
  const bootS = screen([el('rect', { x: 0, y: 0, width: SW, height: SH, style: `fill:${SC.bg}` }), ...cubePaths(iso, SW / 2, SH / 2 - 7, 6, SC.fg, 0.6), ST('vladasana', SW / 2, SH / 2 + 9, { size: 5.2, anchor: 'middle', ls: 0.5 })]);
  const totalS = screen(totalScreen(iso, M, { mob }));
  const prompt = totalS.querySelector('.pos-prompt');
  // brand: the reel plays under an OSD
  const topScrim = el('rect', { x: 0, y: 0, width: SW, height: 26, style: `fill:${KF.grad([[0, 'var(--m-glass)', 0.92], [1, 'var(--m-glass)', 0]], 0, 0, 0, 1)}` });
  const botScrim = el('rect', { x: 0, y: SH - 38, width: SW, height: 38, style: `fill:${KF.grad([[0, 'var(--m-glass)', 0], [0.45, 'var(--m-glass)', 0.78], [1, 'var(--m-glass)', 0.94]], 0, 0, 0, 1)}` });
  const bName = ST('', 5, 10.4, { size: 5.2 });
  const bSub = ST('', 5, 16, { size: 2.8, fill: SC.dim, ls: 0.3 });
  const bLogo = g();
  const bPlays = ST('', 5, SH - 12.6, { size: 11 });
  const bUnit = ST('plays', 5, SH - 12.6, { size: 3.4, fill: SC.dim });
  // a chip with the PLAY key's own mark: the screen, or that key, opens the reel
  const wfs = mob ? 4.3 : 3.6, wy = SH - 9.4;
  const bWatch = g({}, [
    el('rect', { x: 5, y: wy, width: f2(9 + 5 * wfs * 0.7), height: 6.2, rx: 1.1, style: `fill:${SC.fg}` }),
    el('path', { d: `M7.4 ${f2(wy + 1.6)} l2.6 1.5 l-2.6 1.5 z`, style: `fill:${SC.bg}` }),
    ST('WATCH', 11.6, f2(wy + 3.1 + wfs * 0.36), { size: wfs, fill: SC.bg, ls: f2(wfs * 0.05) }),
  ]);
  const brandS = screen([topScrim, botScrim, bName, bSub, bLogo, bPlays, bUnit, bWatch]);
  // feed: a tiny joke screen
  const feedS = screen([el('rect', { x: 0, y: 0, width: SW, height: SH, style: `fill:${SC.bg}` }), ...statusBar(iso), ST('printing', SW / 2, 50, { size: 4.4, anchor: 'middle' }), ST('a dev receipt', SW / 2, 57, { size: 3.2, anchor: 'middle', fill: SC.dim })]);
  ui.append(bootS, totalS, brandS, feedS);
  const glare = face(fpl, [
    el('path', { d: 'M8 16 L52 16 L24 127 L8 127 Z', style: 'fill:var(--lcd)', opacity: 0.035 }),
    el('path', { d: 'M62 16 L68 16 L40 127 L34 127 Z', style: 'fill:var(--lcd)', opacity: 0.022 }),
  ], 0.12);
  fore.appendChild(glare);

  /* ---------- framing: the terminal, a little headroom for the stub, the pile ---------- */
  {
    const ghost = g();
    for (let i = 0; i < 2; i++) {
      const p = POSES[i], t = rad(p.th);
      const u = [Math.cos(t), Math.sin(t), 0], v = [-Math.sin(t), Math.cos(t), 0];
      const L = mob && i ? 90 : 318;
      const o = [p.x - u[0] * RW / 2, p.y - u[1] * RW / 2, 0];
      const pl = plane(o, u, v);
      ghost.appendChild(el('path', { d: dpoly([[0, 0], [RW, 0], [RW, L], [0, L]].map(([a, b]) => P(at(pl, a, b)))), class: 's3' }));
    }
    root.appendChild(ghost);
    // the frame is the hardware and its paper; soft shadows may spill past it
    const soft = [...root.querySelectorAll('.shadow')];
    soft.forEach((n) => (n.style.display = 'none'));
    const b = root.getBBox();
    soft.forEach((n) => (n.style.display = ''));
    ghost.remove();
    const pad = mob ? 8 : 12;
    ctx.view(b.x - pad, b.y - pad, b.width + pad * 2, b.height + pad * 2);
  }

  /* ---------- behaviour ---------- */
  let state = 'off', active = false, booted = false, cur = { kind: 'total' }, pendingGo = null;
  let printing = null;     // { sel, label, plays }
  const timers = [];
  const later = (ms, fn) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  const show = (s) => { for (const x of [bootS, totalS, brandS, feedS]) x.style.display = x === s ? '' : 'none'; };
  const labelOf = (sel) => sel.kind === 'total' ? 'overall' : sel.kind === 'feed' ? 'dev receipt' : sel.b.name;
  const playsOf = (sel) => sel.kind === 'total' ? fmtK(E.totalPlays) : sel.kind === 'brand' && sel.b.reel ? fmtK(sel.b.reel.plays) : '';
  function statusLine() {
    ctx.dot(state !== 'off');
    if (state === 'off') { ctx.status('off'); return; }
    if (state === 'boot') { ctx.status('starting'); return; }
    if (printing) { ctx.status(`printing · <b>${labelOf(printing.sel)}</b>`); return; }
    const pl = playsOf(cur);
    if (mob) { const lb = labelOf(cur), full = `${lb} · ${pl} plays`; ctx.status(`<b>${lb}</b>${pl ? ` · ${pl}${full.length <= 23 ? ' plays' : ''}` : ''}`); }
    else ctx.status(`printed · <b>${labelOf(cur)}</b>${pl ? ` · ${pl} plays` : ''}`);
  }
  function pressIn(node, dz = 1.4, ms = 130) {
    const [dx, dy] = P(mul(N, -dz));
    node.classList.add('press', 'down');
    node.style.transform = `translate(${f2(dx)}px, ${f2(dy)}px)`;
    clearTimeout(node._pt);
    node._pt = setTimeout(() => { node.classList.remove('down'); node.style.transform = ''; }, ms);
  }
  function hideVideo() { box.style.opacity = 0; vid.pause(); }
  let vidCode = null;
  function showReel(r) {
    if (!r) { hideVideo(); return; }
    if (RM || !r.loop) { vid.style.display = 'none'; still.style.display = ''; still.src = r.poster || r.still; box.style.opacity = 1; return; }
    vid.style.display = ''; still.style.display = 'none';
    if (vidCode !== r.code) { vidCode = r.code; vid.poster = r.poster || ''; vid.src = r.loop; vid.load(); }
    box.style.opacity = 1;
    if (active) vid.play().catch(() => {});
  }
  function screenFor(sel) {
    if (sel.kind === 'total') { hideVideo(); show(totalS); return; }
    if (sel.kind === 'feed') { hideVideo(); show(feedS); return; }
    const b = sel.b, r = b.reel;
    bName.textContent = b.name;
    const nw = b.name.length * 0.65 * 5.2;
    if (nw > SW - 10) bName.setAttribute('font-size', f2((SW - 10) / (b.name.length * 0.65))); else bName.setAttribute('font-size', 5.2);
    bSub.textContent = r ? `COLLAB · ${fmtDate(r.date)}` : 'BRAND PARTNER';
    bPlays.textContent = r ? fmtK(r.plays) : '';
    bUnit.setAttribute('x', f2(5 + (r ? fmtK(r.plays).length : 0) * 0.65 * 11 + 1.6));
    bUnit.style.display = r ? '' : 'none';
    bWatch.style.display = r ? '' : 'none';
    show(brandS);
    showReel(r);
  }
  function openFor(sel) {
    const r = sel?.b?.reel;
    if (r) ctx.openReel({ embed: r.embed, link: r.link, brand: sel.b.name, title: r.title });
  }
  function openTop(i) {
    const r = E.topReels?.[i];
    if (r) ctx.openReel({ embed: r.embed, link: r.link, brand: '@vlada.asana', title: r.title });
  }

  // dithered reel stills for the receipts (thermal printers print 1-bit pictures)
  const thumbs = new Map();
  // auto-level: bright stills would otherwise print as an empty box
  const levelOf = (src) => new Promise((res) => {
    const im = new Image();
    im.onload = () => {
      try {
        const cv = document.createElement('canvas'); cv.width = 24; cv.height = 42;
        const cx = cv.getContext('2d', { willReadFrequently: true });
        cx.drawImage(im, 0, 0, 24, 42);
        const d = cx.getImageData(0, 0, 24, 42).data;
        let sum = 0;
        for (let i = 0; i < d.length; i += 4) sum += (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
        res(sum / (d.length / 4));
      } catch (e) { res(0.5); }
    };
    im.onerror = () => res(0.5);
    im.src = src;
  });
  const thumbFor = (r) => {
    if (!r?.still) return Promise.resolve(null);
    if (!thumbs.has(r.code)) thumbs.set(r.code, levelOf(r.still).then((mean) => iso.dither(r.still, { mask: true, w: 39, h: 70, contrast: 1.35, bright: Math.max(-0.28, Math.min(0.2, 0.47 - mean)) })).catch(() => null));
    return thumbs.get(r.code);
  };

  /* print: feed the receipt out, tear it, drop it on the pile */
  let anim = 0, job = 0;
  function settle(r) {
    // the newest goes on top; the others move down the pile; anything past the third leaves
    desk.unshift(r);
    while (desk.length > POSES.length) { const old = desk.pop(); old.grp.remove(); }
    reorderPile();
  }
  function finishNow() {
    if (!printing) return;
    cancelAnimationFrame(anim);
    const p = printing;
    printing = null;
    setStub(0);
    stubMove.removeAttribute('transform'); stubMove.removeAttribute('opacity');
    const r = makeDesk(p.body, p.len, p.sel);
    p.body.removeAttribute('id');
    settle(r);
    desk.forEach((d, i) => placeDesk(d, POSES[i]));
    statusLine();
  }
  async function print(sel, { instant = false } = {}) {
    finishNow();
    const my = ++job;
    cur = sel;
    printing = { sel };
    statusLine();
    const thumb = sel.kind === 'brand' ? await Promise.race([thumbFor(sel.b.reel), new Promise((r) => setTimeout(() => r(null), 450))]) : null;
    if (my !== job) return;
    const rc = receiptNode(K, iso, M, sel, thumb);
    rc.node.id = useId;
    K.defs.querySelector('#' + useId)?.removeAttribute('id');
    K.def(rc.node);
    printing = { sel, body: rc.node, len: rc.len };
    if (instant || RM) { finishNow(); return; }
    // feed
    const L = rc.len;
    const dur = 700 + L * 5.2;
    sound.motor(dur / 1000);
    T.glows.forEach((gl, i) => { gl.setAttribute('opacity', 0.85); T.leds[i].style.fill = 'var(--lcd)'; });
    const t0 = performance.now();
    let lastTick = 0;
    const feed = (t) => {
      if (my !== job || !printing) return;
      const k = clamp01((t - t0) / dur);
      setStub(L * k);
      if (t - lastTick > 140) { lastTick = t; T.glows.forEach((gl, i) => gl.setAttribute('opacity', (Math.floor(t / 140) + i) % 4 === 0 ? 0.25 : 0.85)); }
      if (k < 1) { anim = requestAnimationFrame(feed); return; }
      T.glows.forEach((gl, i) => { gl.setAttribute('opacity', 0); T.leds[i].style.fill = ''; });
      later(260, () => tear(my));
    };
    anim = requestAnimationFrame(feed);
  }
  function tear(my) {
    if (my !== job || !printing) return;
    const p = printing;
    sound.tick(); sound.hiss(0.08, 0.05);
    const r = makeDesk(p.body, p.len, p.sel);
    // the stub lifts away as the receipt drops onto the pile
    const t0 = performance.now();
    const from = desk.map((d) => d.pose);
    const start = { ...POSES[0], x: POSES[0].x + 26, y: POSES[0].y - 30, z: 46, th: POSES[0].th + 16 };
    pileG.appendChild(r.grp);
    placeDesk(r, start);
    r.grp.setAttribute('opacity', 0);
    const step = (t) => {
      if (my !== job) return;
      const k1 = clamp01((t - t0) / 300), k2 = clamp01((t - t0 - 90) / 560), k3 = clamp01((t - t0 - 60) / 460);
      const [dx, dy] = P(mul(pDir, 22 * easeOut(k1)));
      stubMove.setAttribute('transform', `translate(${f2(dx + k1 * 5)} ${f2(dy)})`);
      stubMove.setAttribute('opacity', f2(1 - k1));
      placeDesk(r, lerpPose(start, POSES[0], easeOut(k2)));
      r.grp.setAttribute('opacity', f2(clamp01(k2 * 6)));
      desk.forEach((d, i) => { if (POSES[i + 1]) placeDesk(d, lerpPose(from[i], POSES[i + 1], ease(k3))); else d.grp.setAttribute('opacity', f2(1 - k3)); });
      if (k2 < 1 || k3 < 1) { anim = requestAnimationFrame(step); return; }
      sound.hiss(0.05, 0.03);
      setStub(0);
      stubMove.removeAttribute('transform'); stubMove.removeAttribute('opacity');
      r.grp.removeAttribute('opacity');
      p.body.removeAttribute('id');
      printing = null;
      settle(r);
      desk.forEach((d, i) => placeDesk(d, POSES[i]));
      statusLine();
    };
    anim = requestAnimationFrame(step);
  }

  /* keys */
  function keyPress(id) {
    const k = T.keys.find((x) => x.id === id);
    if (k) pressIn(k.el, 1.5, 130);
    if (state === 'off') { boot(); return; }
    if (state === 'boot') return;
    if (typeof id === 'number') {
      sound.dtmf(DIG[id]);
      const b = M.keys[id];
      if (!b) return;
      const sel = { kind: 'brand', b };
      screenFor(sel);
      print(sel);
      return;
    }
    sound.beep(id === 'TOTAL' ? 1568 : 1175, 0.06, 'square', 0.035);
    if (id === 'TOTAL') { const sel = { kind: 'total' }; screenFor(sel); print(sel); return; }
    if (id === 'FEED') {
      const back = cur;
      const sel = { kind: 'feed' };
      screenFor(sel);
      print(sel);
      later(2600, () => { if (cur === sel) { screenFor(back); } });
      return;
    }
    if (id === 'PLAY') {
      if (cur.kind === 'brand') openFor(cur);
      else openTop(0);
    }
  }
  T.keys.forEach((k) => {
    const label = k.kind === 'brand' ? (k.b ? `${k.b.name}: print the receipt` : 'Brand key') : k.id === 'TOTAL' ? 'Total: print the overall receipt' : k.id === 'FEED' ? 'Feed: print a dev receipt' : 'Play: watch the reel with sound';
    ctx.hit(k.wrap, label, () => keyPress(k.id));
    k.wrap.style.touchAction = 'manipulation';
  });
  ctx.hit(scrHit, 'Terminal screen: watch the reel', () => {
    if (state === 'off') { boot(); return; }
    if (cur.kind === 'brand') openFor(cur); else openTop(0);
  });
  ctx.onKey = (e) => {
    if (e.defaultPrevented) return false;
    const k = e.key;
    const i = DIG.indexOf(k);
    if (i >= 0) { keyPress(i); return true; }
    if (k === 'Enter') { keyPress('TOTAL'); return true; }
    if (k === 'f' || k === 'F') { keyPress('FEED'); return true; }
    if (k === 'p' || k === 'P') { keyPress('PLAY'); return true; }
    return false;
  };

  /* boot, then the overall receipt */
  async function prefill() {
    if (mob || desk.length) return;
    const b = M.keys.filter((x) => x.reel).sort((a, c) => c.reel.plays - a.reel.plays)[0];
    if (!b) return;
    const th = await Promise.race([thumbFor(b.reel), new Promise((r) => setTimeout(() => r(null), 900))]);
    if (desk.length) return;
    const rc = receiptNode(K, iso, M, { kind: 'brand', b }, th);
    const r = makeDesk(rc.node, rc.len, { kind: 'brand', b });
    desk.push(r);
    reorderPile();
    placeDesk(r, POSES[1]);
  }
  function boot() {
    if (state !== 'off') return;
    state = 'boot'; show(bootS); statusLine();
    sound.chime();
    later(RM ? 150 : 850, () => {
      state = 'on'; booted = true;
      screenFor({ kind: 'total' });
      if (pendingGo) {
        const want = pendingGo; pendingGo = null;
        print({ kind: 'total' }, { instant: true });
        later(120, () => goBrand(want));
      } else print({ kind: 'total' });
      statusLine();
      // warm the thermal pictures
      later(1800, () => M.keys.forEach((b) => thumbFor(b.reel)));
    });
  }
  const normName = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
  function goBrand(want) {
    const w = normName(want);
    if (!w) return;
    if (['total', 'overall', 'engagement', 'all'].includes(w)) { keyPress('TOTAL'); return; }
    const b = M.all.find((x) => normName(x.name) === w) || M.all.find((x) => normName(x.name).startsWith(w) || w.startsWith(normName(x.name)));
    if (!b) return;
    const i = M.keys.indexOf(b);
    if (i >= 0) { keyPress(i); return; }
    const sel = { kind: 'brand', b };
    sound.beep(1175, 0.06, 'square', 0.035);
    screenFor(sel);
    print(sel);
  }
  ctx.onGo((p) => {
    const want = p && (p.brand || p.receipt || p.name);
    if (!want) return;
    if (!booted) { pendingGo = want; if (state === 'off' && ctx.visible) boot(); return; }
    goBrand(want);
  });

  /* idle life: the prompt breathes */
  let tt = 0;
  ctx.raf((dt) => {
    tt += dt;
    if (prompt && !RM && totalS.style.display !== 'none') prompt.setAttribute('opacity', f2(0.78 + 0.22 * Math.cos(tt * 2.6)));
  });

  /* a11y */
  const top = (E.topReels || []).map((r, i) => `<li>${i + 1}. ${r.title}: ${fmtN(r.plays)} plays, ${fmtN(r.comments)} comments</li>`).join('');
  const ks = M.keys.map((b, i) => `<li>Key ${DIG[i]}: <a href="${b.reel?.link || 'https://www.instagram.com/vlada.asana/'}">${b.name}</a>${b.reel ? `, ${b.reel.title}, ${fmtN(b.reel.plays)} plays, ${fmtN(b.reel.comments)} comments, posted ${fmtDate(b.reel.date)}` : ''}. Her reels mentioning ${b.name}: ${fmtN(b.count)}, ${fmtN(b.plays)} plays.</li>`).join('');
  await prefill();
  ctx.a11y(`<p>Card terminal that prints Vlada's Instagram engagement as receipts, as of ${fmtDate(M.asOf)}: ${E.followers || ''} followers, ${fmtN(E.reels)} reels, ${fmtN(E.totalPlays)} total plays, ${fmtN(E.avgPlays)} average plays, ${fmtN(E.medianPlays)} median plays, ${fmtN(E.comments)} comments, ${E.over100k || ''} reels over 100K plays, posting since ${fmtDate(E.since)}.</p><p>Top videos:</p><ol>${top}</ol><p>Brand keys (press a key, or type its number, to print that collab's receipt; Enter prints the total):</p><ul>${ks}</ul>`);
  statusLine();

  return {
    plotted() { boot(); },
    start() { active = true; if (cur.kind === 'brand' && box.style.opacity === '1' && !RM && vid.src) vid.play().catch(() => {}); },
    stop() { active = false; vid.pause(); finishNow(); },
  };
}

/* ================= the hero tile: lit, a collab receipt printing, the overall on the desk ================= */
export async function hero(hx) {
  const { K, iso, root, content } = hx;
  const { g, el, face, plane, add, mul, at, P, dpoly } = iso;
  const M = model(hx.data, content);
  await Promise.all(M.keys.map((b) => prepLogo(b, content)));
  const T = drawTerminal(K, iso, { keys: M.keys, content, mini: true });
  const { RW } = G;
  // the slot: the top collab's receipt, its first lines out
  const top = M.keys.filter((x) => x.reel).sort((a, c) => c.reel.plays - a.reel.plays)[0];
  const rc = receiptNode(K, iso, M, top ? { kind: 'brand', b: top } : { kind: 'total' }, null);
  const show = 40;
  const pl = plane(add(T.slot0, mul(T.pDir, show)), [1, 0, 0], mul(T.pDir, -1));
  const cid = K.id('hrc');
  K.def(el('clipPath', { id: cid }, [el('rect', { x: -1, y: -1, width: RW + 2, height: show + 1 })]));
  const stub = face(pl, [g({ 'clip-path': `url(#${cid})` }, [rc.node, el('rect', { x: -1, y: -1, width: RW + 2, height: show + 2, style: 'fill:var(--shade)', opacity: f2(1 - iso.lightOf(iso.MAT.paper, pl.n)) })])]);
  // the desk: the overall receipt, flat, beside the terminal
  const ov = receiptNode(K, iso, M, { kind: 'total' }, null);
  const th = rad(-42), u = [Math.cos(th), Math.sin(th), 0], v = [-Math.sin(th), Math.cos(th), 0];
  const xmy = -150 / 0.866, xpy = -112 * 2;
  const cx = (xpy + xmy) / 2, cy = (xpy - xmy) / 2;
  const dpl = plane([cx - u[0] * RW / 2, cy - u[1] * RW / 2, 0.4], u, v);
  const corners = [[0, 0], [RW, 0], [RW, ov.len], [0, ov.len]].map(([a, b]) => { const q = at(dpl, a, b); return P([q[0] + 1.2, q[1] + 1.2, 0]); });
  const deskG = g({}, [
    el('path', { d: dpoly(corners), style: 'fill:var(--shadow)', opacity: 0.3, filter: `url(#${K.blurFilter(2.2)})`, class: 'shadow' }),
    face(dpl, [ov.node]),
  ]);
  root.append(T.baseG, T.termG, stub, T.keysG, T.lipG);
  root.appendChild(face(T.scrPl, totalScreen(iso, M, { mini: true }), 0.02));
  root.appendChild(deskG);
}
