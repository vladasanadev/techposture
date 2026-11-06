// Collabs · Camcorder (direction 19 · Busy Desk).
// A 90s handheld camcorder whose flip-out LCD is swung out and turned portrait, so her 9:16 reels play uncropped.
// Around it lies a cassette for every one of the 40 brands she has worked with, biggest brand first: the bigger the
// brand, the bigger the tape (VHS, then Hi8, MiniDV and micro-cassettes). Only brand names are printed on them.
// Pick a tape: it slides out of its stack and drops into the tape door (the old one pops out and goes home), the door
// closes and the brand's full reel plays on the LCD with sound. The rocker under the LCD sets the volume, START/STOP
// (or the picture) pauses, and the end of a reel offers a replay. ←/→ cue a tape, Enter plays it, Space pauses.
// The zoom rocker and the lens (rack focus) still work; zooming past the optical range gives a very 90s digital zoom.
import { FAVICONS } from './camcorder-logos.js';

const D2R = Math.PI / 180;
const f2 = (n) => Math.round(n * 100) / 100;
const clamp01 = (t) => Math.max(0, Math.min(1, t));
const ease = (t) => t * t * (3 - 2 * t);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

/** 259701 -> "259.7K" */
export function fmtPlays(n) {
  n = Number(n) || 0;
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

/* ---------------- text metrics (after the web fonts load) ---------------- */
let cv2 = null;
const widths = new Map();
function textW(str, size, font = 'Pixelify Sans', weight = 500) {
  const key = `${weight}|${font}|${str}`;
  let w = widths.get(key);
  if (w == null) {
    cv2 = cv2 || document.createElement('canvas').getContext('2d');
    cv2.font = `${weight} 100px '${font}'`;
    w = cv2.measureText(str).width / 100;
    widths.set(key, w);
  }
  return w * size;
}
async function fontsReady(ms = 1800) {
  try {
    await Promise.race([
      // with digits in the sample: the site swaps Pixelify's digits for Silkscreen's through a unicode-range face
      Promise.all(['500 10px "Pixelify Sans"', '600 10px "Pixelify Sans"', '400 10px "Silkscreen"', '400 10px "Azeret Mono"'].map((f) => document.fonts.load(f, 'AZaz0123456789'))),
      new Promise((r) => setTimeout(r, ms)),
    ]);
  } catch (e) { /* metrics fall back to the system font; text is still clamped */ }
}

/* ---------------- brands, logos ---------------- */
const SPEC = {
  // L along the spine, D front to back, T thickness (world units, about mm, stylised)
  1: { L: 124, D: 70, T: 21, nm: 10.4, rk: 4.6, r: 3, kind: 'VHS' },
  2: { L: 92, D: 56, T: 16, nm: 8.2, rk: 3.9, r: 2.6, kind: 'Hi8' },
  3: { L: 72, D: 46, T: 12.5, nm: 6.6, rk: 3.3, r: 2.2, kind: 'MiniDV' },
  4: { L: 56, D: 36, T: 10, nm: 5.5, rk: 3, r: 1.8, kind: 'Micro' },
};
const MOD = 'camcorder';
const VOLS = [0, 0.1, 0.22, 0.4, 0.65, 1];    // rocker step -> video.volume (0 is mute)
const VOL0 = 4;                               // the default: clearly audible

function brandList(data, content, ig) {
  const C = data && data.collabs;
  if (C && Array.isArray(C.brands) && C.brands.length) return C.brands.slice().sort((a, b) => a.rank - b.rank);
  // fallback until the data file exists: content.js ranks, tiers and the portfolio reels that have loops
  const code = (u) => (String(u).match(/\/reel\/([^/?#]+)/) || [])[1];
  return content.CLIENTS.map((c) => {
    const r = content.REELS.find((x) => x.brand === c.name);
    const m = r && ((ig && ig.reels) || []).find((x) => x.id === code(r.link));
    return {
      rank: c.rank, name: c.name, tier: (content.tierOf(c.rank) || { id: 4 }).id, logo: { tile: c.tile, bg: c.bg, icon: c.icon },
      reel: m ? { code: m.id, title: r.title, brand: c.name, plays: 0, loop: m.loop, poster: m.poster, still: m.still, embed: r.embed, link: r.link } : null,
    };
  });
}
// tiles that are wide wordmarks in a square: shown as a 2:1 crop of their middle band so the word stays legible
const WIDE_TILES = new Set(['ledger', 'lovable', 'bluedot', 'verdent', 'tangem', 'astraux', 'deeppocket', 'shecodes', '4geeks']);
export function logoOf(content, logo) {
  logo = logo || {};
  if (logo.tile) return { kind: 'img', href: content.tileUrl(logo.tile), bg: logo.bg || null, wide: WIDE_TILES.has(logo.tile) };
  const ic = logo.icon && content.ICONS && content.ICONS[logo.icon];
  if (ic) return { kind: 'path', d: ic.path };
  if (logo.domain && FAVICONS[logo.domain]) return { kind: 'img', href: FAVICONS[logo.domain], bg: null };
  return null; // a typographic wordmark (the name itself)
}
/** Width a logo takes at height s. */
export const logoW = (lg, s) => (lg && lg.wide ? s * 2 : s);
export function logoNode(iso, lg, x, y, s, ink = 'var(--paper-ink)') {
  const { el, g } = iso;
  if (lg.kind === 'path') return g({ transform: `translate(${f2(x)} ${f2(y)}) scale(${f2(s / 24)})` }, [el('path', { d: lg.d, style: `fill:${ink}` })]);
  const w = logoW(lg, s);
  // logo.bg is part of the logo artwork (the brief: "with logo.bg behind it")
  return g({ class: 'logo' }, [
    lg.bg ? el('rect', { x: f2(x), y: f2(y), width: f2(w), height: f2(s), style: `fill:${lg.bg}` }) : null,
    el('image', { href: lg.href, x: f2(x), y: f2(y), width: f2(w), height: f2(s), preserveAspectRatio: lg.wide ? 'xMidYMid slice' : 'xMidYMid meet' }),
  ]);
}

/* ---------------- shared geometry helpers ---------------- */
function funnel(K, iso, outer, inner, pl, depth, mat, o = {}) {
  const { g, el, P, at, shift, sub, norm, cross, mul, add, dot, dpoly } = iso;
  const cid = K.id('fun');
  K.def(el('clipPath', { id: cid }, [el('path', { d: dpoly(outer.map(([a, b]) => P(at(pl, a, b)))) })]));
  const grp = g();
  const clip = g({ 'clip-path': `url(#${cid})` });
  const floor = shift(pl, 0, 0, -depth);
  const A3 = outer.map(([a, b]) => at(pl, a, b, 0)), B3 = inner.map(([a, b]) => at(pl, a, b, -depth));
  const A = A3.map(P), B = B3.map(P);
  const cx = inner.reduce((s, p) => s + p[0], 0) / inner.length, cy = inner.reduce((s, p) => s + p[1], 0) / inner.length;
  const C3 = at(pl, cx, cy, -depth * 0.5);
  clip.appendChild(el('path', { d: dpoly(B), style: `fill:${o.floorFill || iso.shade(mat, pl.n)}`, class: 'f' }));
  const byCol = new Map();
  for (let i = 0; i < outer.length; i++) {
    const j = (i + 1) % outer.length;
    const e = sub(A3[j], A3[i]);
    if (Math.hypot(e[0], e[1], e[2]) < 1e-6) continue;
    let nn = norm(cross(e, sub(B3[i], A3[i])));
    const M = mul(add(add(A3[i], A3[j]), add(B3[i], B3[j])), 0.25);
    if (dot(nn, sub(C3, M)) < 0) nn = mul(nn, -1);
    if (!iso.isVisible(nn)) continue;
    const col = iso.shade(mat, nn);
    byCol.set(col, (byCol.get(col) || '') + dpoly([A[i], A[j], B[j], B[i]]));
  }
  for (const [col, d] of byCol) clip.appendChild(el('path', { d, style: `fill:${col};stroke:${col}`, 'stroke-width': 0.35, class: 'f' }));
  if (o.content) clip.appendChild(o.content(floor));
  grp.appendChild(clip);
  grp.appendChild(el('path', { d: dpoly(B), class: 's2' }));
  grp.appendChild(el('path', { d: dpoly(A), class: 's' }));
  grp.floor = floor;
  return grp;
}
const cubeMark = (iso, cx, cy, r) => {
  const { el } = iso;
  return [
    el('path', { d: `M${cx} ${f2(cy - r)}L${f2(cx + r * 0.866)} ${f2(cy - r / 2)}L${f2(cx + r * 0.866)} ${f2(cy + r / 2)}L${cx} ${f2(cy + r)}L${f2(cx - r * 0.866)} ${f2(cy + r / 2)}L${f2(cx - r * 0.866)} ${f2(cy - r / 2)}Z`, class: 's' }),
    el('path', { d: `M${cx} ${cy}L${f2(cx + r * 0.866)} ${f2(cy - r / 2)}M${cx} ${cy}L${f2(cx - r * 0.866)} ${f2(cy - r / 2)}M${cx} ${cy}L${cx} ${f2(cy + r)}`, class: 's2' }),
  ];
};

/* ---------------- the tape (any size, any pose) ---------------- */
// pose: { o: [x, y, z] back-left-bottom corner, phi (radians, rotation about z), k (uniform scale) }
function tapeFrame(iso, sp, pose) {
  const { plane, at } = iso;
  const k = pose.k || 1;
  const c = Math.cos(pose.phi), s = Math.sin(pose.phi);
  const u = [c, -s, 0], v = [s, c, 0];
  const L = sp.L * k, D = sp.D * k, T = sp.T * k;
  const topPl = plane([pose.o[0], pose.o[1], pose.o[2] + T], u, v);
  const spinePl = plane(at(topPl, 0, D), u, [0, 0, -1]);
  return { u, v, L, D, T, k, topPl, spinePl };
}
function tapeNodes(K, iso, t, pose, o = {}) {
  const { el, g, face, txt, rrect, circle, MAT } = iso;
  const sp = t.spec;
  const F = tapeFrame(iso, sp, pose);
  const { L, D, T, k } = F;
  const kids = [];
  kids.push(K.prism(rrect(0, 0, L, D, sp.r * k, 3), F.topPl, T, MAT.rubber));
  const ink = 'var(--paper-ink)', inkDim = 'color-mix(in oklab, var(--paper-ink) 62%, var(--m-label))';
  // spine label (drawn in spec units, scaled by k)
  {
    const lx = 2.4, lw = sp.L - 4.8, ly = Math.max(1.2, sp.T * 0.13), lh = sp.T - 2 * ly;
    const lab = [el('rect', { x: lx, y: f2(ly), width: f2(lw), height: f2(lh), rx: 0.7, style: o.cue ? 'fill:var(--m-label);stroke:var(--m-accent);stroke-width:0.9' : 'fill:var(--m-label)', class: 'f' })];
    let x = lx + Math.min(1.8, lh * 0.2);
    const ls = lh - Math.min(2.2, lh * 0.3);
    if (t.logo) { lab.push(logoNode(iso, t.logo, x, ly + (lh - ls) / 2, ls, ink)); x += logoW(t.logo, ls) + Math.max(1.2, sp.nm * 0.22); }
    // the brand's name, nothing else
    const maxW = lx + lw - 2.2 - x;
    const base = ly + lh / 2 + sp.nm * 0.34;
    const nt = txt(t.name, f2(x), f2(base), { size: sp.nm, fill: ink, font: 'Pixelify Sans', weight: 500 });
    if (textW(t.name, sp.nm) > maxW) { nt.setAttribute('textLength', f2(maxW)); nt.setAttribute('lengthAdjust', 'spacingAndGlyphs'); }
    lab.push(nt);
    const grp = g(t.reel ? {} : { opacity: 0.6 }, lab);
    kids.push(face(F.spinePl, [k === 1 ? grp : g({ transform: `scale(${f2(k)})` }, [grp])], 0.03));
  }
  if (o.top) {
    const tk = [];
    const Ls = sp.L, Ds = sp.D;
    // window with the two reels (back half)
    const wx = Ls * 0.2, wy = Ds * 0.1, ww = Ls * 0.6, wh = Ds * 0.34;
    tk.push(el('rect', { x: f2(wx), y: f2(wy), width: f2(ww), height: f2(wh), rx: f2(wh * 0.22), style: 'fill:color-mix(in oklab, var(--m-glass) 88%, var(--m-paper))', class: 'sf' }));
    const rr = wh * 0.36;
    for (const cx of [Ls * 0.36, Ls * 0.64]) {
      tk.push(el('circle', { cx: f2(cx), cy: f2(wy + wh / 2), r: f2(rr), style: 'fill:color-mix(in oklab, var(--m-rubber) 70%, var(--m-paper))', class: 's2' }));
      tk.push(el('circle', { cx: f2(cx), cy: f2(wy + wh / 2), r: f2(rr * 0.42), style: 'fill:var(--m-glass)' }));
    }
    // top label (front half)
    const lx = Ls * 0.07, ly = Ds * 0.52, lw = Ls * 0.86, lh = Ds * 0.38;
    const lab = [el('rect', { x: f2(lx), y: f2(ly), width: f2(lw), height: f2(lh), rx: 1, style: 'fill:var(--m-label)', class: 'f' })];
    const ls = lh * 0.7;
    let x = lx + lh * 0.15;
    if (t.logo) { lab.push(logoNode(iso, t.logo, x, ly + (lh - ls) / 2, ls, ink)); x += logoW(t.logo, ls) + lh * 0.14; }
    const nm = Math.min(lh * 0.42, sp.nm * 1.35);
    const maxW = lx + lw - lh * 0.12 - x;
    // the brand's name; a tape with no collab reel on her feed yet is marked BLANK
    const nt = txt(t.name, f2(x), f2(ly + (t.reel ? lh * 0.5 + nm * 0.34 : lh * 0.47)), { size: f2(nm), fill: ink, font: 'Pixelify Sans', weight: 500 });
    if (textW(t.name, nm) > maxW) { nt.setAttribute('textLength', f2(maxW)); nt.setAttribute('lengthAdjust', 'spacingAndGlyphs'); }
    lab.push(nt);
    if (!t.reel) lab.push(txt('BLANK', f2(x), f2(ly + lh * 0.8), { size: f2(Math.min(sp.rk * 0.9, lh * 0.2)), fill: inkDim, font: 'Silkscreen', ls: 0.2 }));
    tk.push(g(t.reel ? {} : { opacity: 0.6 }, lab));
    kids.push(face(F.topPl, [k === 1 ? g({}, tk) : g({ transform: `scale(${f2(k)})` }, tk)], 0.02));
  }
  return kids;
}

/* ---------------- the camcorder (shared by the section and the hero tile) ---------------- */
function drawCam(K, iso, o = {}) {
  const { g, el, face, txt, top, frontY, frontX, plane, shift, rrect, circle, MAT, P, at, add, mul, dot, dpoly } = iso;
  const mini = !!o.mini;
  const L = 190, WD = 80, Z0 = 2, ZB = 84, ZT = 90;
  const LCY = 40, LCZ = 47;
  const DX0 = 50, DY0 = 10, DW = 66, DD = 50;   // tape door on the top
  const topPl = top(ZT);
  const side = frontY(WD, 0, ZB);   // left side: a 0..L, b 0..(ZB-Z0)
  const front = frontX(L, WD, ZB);  // front: a 0..WD, b 0..(ZB-Z0)
  const lab = (s, x, y, size = 3.2, anchor = 'middle', fill = 'var(--t2)') => txt(s, x, y, { size, anchor, fill, font: 'Silkscreen', ls: 0.35 });
  const R = { L, WD, Z0, ZB, ZT, DX0, DY0, DW, DD, topPl, side, front, LCY, LCZ };
  const parts = [];

  /* the vertical LCD geometry (needed early for its shadow) */
  const lc = o.lcd;
  const PHI = lc.phi * D2R, TILT = lc.tilt * D2R;
  const nH = [Math.sin(PHI), Math.cos(PHI), 0];
  const uS = [Math.cos(PHI), -Math.sin(PHI), 0];
  const vS = add(mul([0, 0, -1], Math.cos(TILT)), mul(nH, Math.sin(TILT)));
  const SW = lc.sw, SH = (SW * 16) / 9, PW = SW + 2 * lc.bz, PH = lc.topb + SH + lc.chin;
  const BR = lc.br;
  const TL = add(add(BR, mul(vS, -PH)), mul(uS, -PW));
  const lcdPl = plane(TL, uS, vS);
  Object.assign(R, { lcdPl, SW, SH, PW, PH, SX: lc.bz, SY: lc.topb });

  /* ground shadows */
  const shG = g({ class: 'part shadows' });
  shG.appendChild(K.shadow(rrect(-40, -24, L + 120, WD + 50, 40), 0, 0, 0, 0.55, K.blurFilter(15)));
  shG.appendChild(K.shadow(rrect(-4, -4, L + 8, WD + 8, 16), 0, 0, 0, 0.5, K.blurFilter(4)));
  shG.appendChild(K.shadow(circle(0, 0, 36, 30), 0, 232, LCY + 4, 0.4, K.blurFilter(8)));
  {
    // the panel's shadow on the desk, cast back and to the right
    const pts = [at(lcdPl, 0, PH), at(lcdPl, PW, PH), at(lcdPl, PW, 0), at(lcdPl, 0, 0)].map((p) => [p[0] - p[2] * 0.18, p[1] - p[2] * 0.32]);
    shG.appendChild(K.shadow(pts, 0, 0, 0, 0.42, K.blurFilter(9)));
  }
  parts.push(shG);

  /* hand strap (far side, peeks over the top) */
  if (!mini) {
    const strapG = g({ class: 'part' });
    const N_ = 18, top_ = [], bot_ = [], mid_ = [];
    for (let i = 0; i <= N_; i++) {
      const t = i / N_;
      const x = 176 - t * 150, y = -2 - Math.sin(Math.PI * Math.min(1, t * 1.15)) * 13;
      const zc = 80 + Math.sin(Math.PI * t) * 9 - t * 36, hw = 8;
      top_.push(P([x, y, zc + hw])); bot_.push(P([x, y, zc - hw])); mid_.push(P([x, y - 0.4, zc + hw - 2.2]));
    }
    strapG.appendChild(el('path', { d: dpoly(top_.concat(bot_.slice().reverse())), style: `fill:${iso.shade(MAT.rubber, [0, 0.5, 0.86])}`, class: 'f' }));
    strapG.appendChild(el('path', { d: iso.dsmooth(top_), class: 's' }));
    strapG.appendChild(el('path', { d: iso.dsmooth(mid_), class: 's3', 'stroke-dasharray': '1.4 1.2' }));
    strapG.appendChild(el('path', { d: iso.dsmooth(bot_), class: 's2' }));
    parts.push(strapG);
  }

  /* battery + eyecup (behind the body) */
  const backG = g({ class: 'part' });
  backG.appendChild(K.box(-22, 9, 9, 25, 62, 52, MAT.body2, { r: 6 }));
  backG.appendChild(face(frontY(71, -22, 61), [el('path', { d: 'M4 6 L4 46 M7 6 L7 46', class: 's3' })], 0.02));
  backG.appendChild(K.prism(circle(0, 0, 12.5, 32), frontX(-34, 64, 101), 15, MAT.rubber));
  parts.push(backG);

  /* body */
  const bodyG = g({ class: 'part' });
  [[16, 14], [16, WD - 14], [L - 16, 14], [L - 16, WD - 14]].forEach(([x, y]) => bodyG.appendChild(K.cyl(x, y, 0, 6, Z0 + 0.5, MAT.rubber)));
  bodyG.appendChild(K.box(0, 0, Z0, L, WD, ZB - Z0, MAT.shell, { r: 14, seg: 6 }));
  bodyG.appendChild(K.prism(rrect(5, 5, L - 10, WD - 10, 9, 6), topPl, ZT - ZB, MAT.shell, { base: rrect(0, 0, L, WD, 14, 6) }));
  // left side: the empty LCD bay (the panel is out), badge, the sticker, DV jack
  const bay = K.recess(rrect(96, 7, 84, 70, 7, 5), side, 2.4, MAT.body2);
  bodyG.appendChild(bay);
  if (!mini) bodyG.appendChild(face(bay.floor, [...[0, 1, 2, 3, 4].map((i) => el('path', { d: `M${104 + i * 3.2} 56 L${104 + i * 3.2} 68`, class: 's3' }))], 0.02));
  bodyG.appendChild(face(side, [
    ...cubeMark(iso, 9, 71.5, 3.2),
    txt('vladasana', 15, 73.4, { size: 3.9, fill: 'var(--t2)', ls: 0.45 }),
    el('path', { d: `M3 ${ZB - Z0 - 4} L${L - 3} ${ZB - Z0 - 4}`, class: 's3' }),
    mini ? null : lab('DV IN/OUT', 30, 13.5, 2.6),
  ], 0.02));
  if (!mini) bodyG.appendChild(K.recess(rrect(16, 16, 28, 9, 2, 3), side, 1, MAT.deep));
  // the sticker: her bio, with the little disc she puts next to it
  {
    const st = g({ transform: 'rotate(-5 28 44)' });
    st.append(
      el('rect', { x: 6.5, y: 33, width: 44, height: 21, rx: 2.4, style: 'fill:var(--m-label)', class: 'f' }),
      el('rect', { x: 6.5, y: 33, width: 44, height: 21, rx: 2.4, style: 'fill:none;stroke:var(--ink3)', 'stroke-width': 0.3 }),
      txt('free spirited', 28.5, 41.8, { size: 5.4, anchor: 'middle', fill: 'var(--paper-ink)', font: 'Pixelify Sans', weight: 600 }),
      txt('dev', 23.5, 49.8, { size: 5.4, anchor: 'middle', fill: 'var(--paper-ink)', font: 'Pixelify Sans', weight: 600 }),
      el('circle', { cx: 35.5, cy: 48, r: 3.3, style: 'fill:color-mix(in oklab, var(--m-accent2) 45%, var(--m-label));stroke:var(--paper-ink)', 'stroke-width': 0.35 }),
      el('circle', { cx: 35.5, cy: 48, r: 0.95, style: 'fill:var(--m-label);stroke:var(--paper-ink)', 'stroke-width': 0.3 }),
      el('path', { d: 'M33.2 46.3 A2.5 2.5 0 0 1 35.6 45.2', style: 'fill:none;stroke:var(--m-label)', 'stroke-width': 0.45, opacity: 0.8 }),
    );
    bodyG.appendChild(face(side, [st], 0.03));
  }
  // front face around the lens: tally lamp + seam
  const tally = el('circle', { cx: 9, cy: 11, r: 1.7, style: 'fill:var(--m-deep)', class: 'sf' });
  const tallyGlow = el('circle', { cx: 9, cy: 11, r: 4, style: 'fill:var(--m-accent)', opacity: 0, filter: `url(#${K.glowId})` });
  bodyG.appendChild(face(front, [tallyGlow, tally, el('path', { d: `M4 ${ZB - Z0 - 4} L${WD - 4} ${ZB - Z0 - 4}`, class: 's3' })], 0.03));
  parts.push(bodyG);
  Object.assign(R, { tally, tallyGlow });

  /* top: tape door, REC, zoom, mic */
  const topG = g({ class: 'part' });
  const bayTop = K.recess(rrect(DX0, DY0, DW, DD, 5, 4), topPl, 26, MAT.deep, { floorFill: 'color-mix(in oklab, var(--m-deep) 45%, var(--shade))' });
  topG.appendChild(bayTop);
  const inBay = g();
  bayTop.inner.appendChild(face(shift(topPl, 0, 0, -14), [inBay], 0));
  if (!mini) topG.appendChild(face(topPl, [lab('OPEN', DX0 + DW / 2, DY0 - 2.6, 2.4)], 0.02));
  const lidG = g();
  topG.appendChild(lidG);
  // REC button + lamp
  const RX = 140, RY = 24;
  topG.appendChild(K.recess(circle(RX, RY, 12.8, 44), topPl, 1.2, MAT.deep));
  const recBtn = g();
  recBtn.appendChild(K.prism(circle(RX, RY, 10.4, 44), top(ZT + 3.6), 4.8, MAT.key));
  recBtn.appendChild(face(top(ZT + 3.6), [el('circle', { cx: RX, cy: RY, r: 7.4, class: 's3', style: 'fill:none' }), el('circle', { cx: RX, cy: RY, r: 2.8, style: 'fill:var(--m-accent)', class: 'f' })], 0.02));
  const recG = g({}, [recBtn]);
  topG.appendChild(recG);
  const lamp = el('circle', { cx: RX - 17, cy: RY - 5, r: 1.9, style: 'fill:var(--m-deep)', class: 'sf' });
  const lampGlow = el('circle', { cx: RX - 17, cy: RY - 5, r: 4.6, style: 'fill:var(--m-accent)', opacity: 0, filter: `url(#${K.glowId})` });
  topG.appendChild(face(topPl, [lampGlow, lamp, lab('REC', RX - 18, RY + 3.4, 3.2), mini ? null : lab('START/STOP', RX, RY + 16.2, 2.1)], 0.02));
  // zoom rocker
  const ZX = 134, ZY = 60;
  topG.appendChild(K.recess(rrect(ZX - 14, ZY - 6.5, 28, 13, 6, 4), topPl, 1, MAT.deep));
  const rockG = g();
  topG.appendChild(rockG);
  if (!mini) topG.appendChild(face(topPl, [lab('W', ZX - 17.5, ZY + 1.2, 3.2), lab('T', ZX + 17.5, ZY + 1.2, 3.2), lab('ZOOM', ZX, ZY - 8.5, 2.4)], 0.02));
  // stereo mic
  const mic = K.box(158, 16, ZT - 1, 26, 48, 9, MAT.body2, { r: 7 });
  topG.appendChild(mic);
  if (!mini) topG.appendChild(face(mic.top, [...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => el('path', { d: `M${5 + i * 2.2} 6 L${5 + i * 2.2} 42`, class: 's3' }))], 0.02));
  parts.push(topG);
  function drawRocker(tilt) {
    const a = (tilt * Math.PI) / 180;
    const pl = plane([ZX - 11 * Math.cos(a), ZY - 4.2, ZT + 3 - 11 * Math.sin(a)], [Math.cos(a), 0, Math.sin(a)], [0, 1, 0]);
    rockG.replaceChildren(K.prism(rrect(0, 0, 22, 8.4, 4, 4), pl, 3.6, MAT.key));
    rockG.appendChild(face(pl, [el('path', { d: 'M5 4.2 L8 4.2 M14 4.2 L17 4.2 M15.5 2.7 L15.5 5.7', class: 's2' })], 0.02));
  }
  drawRocker(0);
  // the door lid, hinged on its far (-y) edge; `name` shows through its window
  const LT = 2.4;
  function drawLid(theta, name) {
    const th = (theta * Math.PI) / 180;
    const o3 = [DX0, DY0, ZT + 0.6];
    const v = [0, Math.cos(th), Math.sin(th)];
    let pl = plane(o3, [1, 0, 0], v);
    if (!iso.isVisible(pl.n)) pl = plane(at(pl, 0, DD, -LT), [1, 0, 0], mul(v, -1));
    const lid = K.prism(rrect(0, 0, DW, DD, 5, 4), pl, LT, MAT.shell);
    const deco = [el('path', { d: dpoly(rrect(5, 5, DW - 10, DD - 10, 3)), class: 's3' })];
    if (theta < 60) {
      deco.push(el('rect', { x: 9, y: 9, width: DW - 18, height: 20, rx: 3, style: 'fill:var(--m-glass)', class: 'sf' }));
      if (name) {
        deco.push(el('rect', { x: 13, y: 14.5, width: DW - 26, height: 10.5, rx: 1.2, style: 'fill:var(--m-label)', opacity: 0.62 }));
        const nt = txt(name, DW / 2, 22, { size: 6, anchor: 'middle', fill: 'var(--paper-ink)', font: 'Pixelify Sans', weight: 500, opacity: 0.9 });
        if (textW(name, 6) > DW - 30) { nt.setAttribute('textLength', DW - 30); nt.setAttribute('lengthAdjust', 'spacingAndGlyphs'); }
        deco.push(nt);
      }
      deco.push(el('path', { d: 'M12 10.5 L24 10.5 L16 27.5 L12 27.5 Z', style: 'fill:var(--m-paper)', opacity: 0.06 }));
    }
    lid.appendChild(face(pl, deco, 0.02));
    lidG.replaceChildren(lid);
  }
  Object.assign(R, { inBay, lidG, drawLid, recBtn, recG, lamp, lampGlow, rockG, drawRocker, ZX, ZY });

  /* eyepiece viewfinder */
  const evfG = g({ class: 'part' });
  const evf = K.box(-34, 48, ZT - 3, 82, 32, 25, MAT.body2, { r: 9 });
  evfG.appendChild(evf);
  evfG.appendChild(face(evf.fy, [el('path', { d: 'M58 4 L58 21', class: 's2' }), mini ? null : lab('VIEWFINDER', 28, 14.5, 2.4)], 0.02));
  evfG.appendChild(K.prism(rrect(64, 9, 9, 5, 2, 3), shift(evf.fy, 0, 0, 1.6), 1.6, MAT.key));
  parts.push(evfG);

  /* lens */
  const lensG = g({ class: 'part' });
  const LP = (x) => frontX(x, LCY, LCZ);
  lensG.appendChild(K.prism(circle(0, 0, 37, 56), LP(L + 5), 8, MAT.body2));
  lensG.appendChild(K.prism(circle(0, 0, 30, 56), LP(236), 44, MAT.shell));
  lensG.appendChild(K.prism(circle(0, 0, 31.6, 56), LP(222), 15, MAT.rubber));
  if (!mini) {
    let d = '';
    for (let i = 0; i < 64; i++) {
      const ph = (i / 64) * Math.PI * 2;
      const nrm = [0, -Math.cos(ph), -Math.sin(ph)];
      if (dot(nrm, iso.VIEW) < 0.05) continue;
      const p = P(at(LP(222), 31.6 * Math.cos(ph), 31.6 * Math.sin(ph), -1)), q = P(at(LP(222), 31.6 * Math.cos(ph), 31.6 * Math.sin(ph), -14));
      d += `M${f2(p[0])} ${f2(p[1])}L${f2(q[0])} ${f2(q[1])}`;
    }
    lensG.appendChild(el('path', { d, class: 's3' }));
  }
  const HF = 266;
  lensG.appendChild(K.prism(circle(0, 0, 39.5, 60), LP(HF), HF - 236, MAT.shell, { base: circle(0, 0, 31.4, 60) }));
  const glassFill = K.rgrad([
    [0, 'color-mix(in oklab, var(--m-glass) 70%, var(--m-paper))'],
    [0.35, 'var(--m-glass)'],
    [0.8, 'color-mix(in oklab, var(--m-glass) 55%, var(--shade))'],
    [1, 'color-mix(in oklab, var(--m-glass) 35%, var(--shade))'],
  ], 0.4, 0.36, 0.7);
  lensG.appendChild(funnel(K, iso, circle(0, 0, 37.4, 60), circle(0, 0, 25, 60), LP(HF), 24, MAT.deep, {
    floorFill: glassFill,
    content: (pl) => face(pl, [
      el('circle', { cx: 0, cy: 0, r: 20.5, class: 's3', style: 'fill:none' }),
      el('circle', { cx: 0, cy: 0, r: 14, class: 's3', style: 'fill:none' }),
      el('circle', { cx: 0, cy: 0, r: 7.5, class: 's3', style: 'fill:color-mix(in oklab, var(--m-glass) 40%, var(--shade))' }),
      el('path', { d: 'M-15 -9 C-11 -16 -3 -19 5 -18 L3 -15 C-4 -15.6 -9 -12.6 -12 -7.6 Z', style: 'fill:var(--m-paper)', opacity: 0.16 }),
      el('rect', { x: 6, y: 4, width: 4, height: 6, style: 'fill:var(--m-paper)', opacity: 0.1 }),
      el('rect', { x: 11, y: 4, width: 4, height: 6, style: 'fill:var(--m-paper)', opacity: 0.07 }),
    ], 0.02),
  }));
  parts.push(lensG);
  R.lensG = lensG;

  /* the flip-out LCD, swung out and turned portrait */
  const lcdG = g({ class: 'part' });
  // hinge: a barrel on the body's side and an arm out to the back of the panel
  const HX = 176, HY = WD + 3.5;
  lcdG.appendChild(K.cyl(HX, HY, 30, 4.6, 34, MAT.body2));
  const armA = [HX - 1, HY + 1, 47], armB = at(lcdPl, PW - 10, PH * 0.42, -lc.pt + 0.5);
  lcdG.appendChild(K.tube([armA, iso.lerp3(armA, armB, 0.5), armB], 7, iso.shade(MAT.body2, [0.3, 0.6, 0.75])));
  const panel = K.prism(rrect(0, 0, PW, PH, 7, 5), lcdPl, lc.pt, MAT.shell);
  lcdG.appendChild(panel);
  const SX = lc.bz, SY = lc.topb;
  const scrRec = K.recess(rrect(SX, SY, SW, SH, 2.4, 3), lcdPl, 1.1, MAT.deep, {
    floorFill: K.grad([[0, 'color-mix(in oklab, var(--m-glass) 88%, var(--m-paper))'], [1, 'var(--m-glass)']], 0, 0, 0.3, 1),
  });
  lcdG.appendChild(scrRec);
  const chinY = SY + SH + lc.chin / 2;
  lcdG.appendChild(face(lcdPl, [
    lab('VOL', SX + 1, chinY + 1.2, 2.5, 'start'),
    ...(mini ? [] : [0, 1, 2, 3, 4].map((i) => el('path', { d: `M${f2(PW - SX - 13 + i * 2.8)} ${f2(chinY - 2.2)} L${f2(PW - SX - 13 + i * 2.8)} ${f2(chinY + 2.2)}`, class: 's3' }))),
  ], 0.02));
  // the volume rocker on the panel's chin: press its left end for quieter, its right end for louder
  const vrX = SX + 10.5, vrW = Math.max(16, Math.min(26, PW - 2 * SX - 27)), vrH = Math.min(7.4, lc.chin - 4.6), vrY = chinY - vrH / 2;
  const vrPl = shift(lcdPl, 0, 0, 1.6);
  const volRock = g();
  lcdG.appendChild(K.recess(rrect(vrX - 1.1, vrY - 1.1, vrW + 2.2, vrH + 2.2, vrH / 2 + 1, 4), lcdPl, 0.8, MAT.deep));
  const rockCap = g();
  rockCap.appendChild(K.prism(rrect(vrX, vrY, vrW, vrH, vrH / 2, 4), vrPl, 2.4, MAT.key));
  const mx = (a) => f2(vrX + vrW * a);
  rockCap.appendChild(face(vrPl, [
    el('path', { d: `M${mx(0.22)} ${f2(chinY)} L${mx(0.36)} ${f2(chinY)}`, style: 'stroke:var(--ink)', 'stroke-width': 0.7, 'stroke-linecap': 'round' }),
    el('path', { d: `M${mx(0.64)} ${f2(chinY)} L${mx(0.78)} ${f2(chinY)} M${mx(0.71)} ${f2(chinY - vrW * 0.07)} L${mx(0.71)} ${f2(chinY + vrW * 0.07)}`, style: 'stroke:var(--ink)', 'stroke-width': 0.7, 'stroke-linecap': 'round' }),
    el('path', { d: `M${mx(0.5)} ${f2(vrY + 1.2)} L${mx(0.5)} ${f2(vrY + vrH - 1.2)}`, class: 's3' }),
  ], 0.02));
  volRock.appendChild(rockCap);
  lcdG.appendChild(volRock);
  parts.push(lcdG);
  Object.assign(R, { volRock, rockCap, vrPl, vrX, vrW });
  // the visible part of the recess floor (the rim overhangs it a touch)
  // a floor point (a, b) shows through the opening at (a + dA, b + dB); trim the hidden margins
  const lf = scrRec.floor;
  const VdU = dot(iso.VIEW, lcdPl.u), VdV = dot(iso.VIEW, lcdPl.v), VdN = dot(iso.VIEW, lcdPl.n);
  const dA = (1.1 * VdU) / VdN, dB = (1.1 * VdV) / VdN;
  const tl = Math.max(0, -dA) + 0.25, tr = Math.max(0, dA) + 0.25, tt = Math.max(0, -dB) + 0.25, tb = Math.max(0, dB) + 0.25;
  Object.assign(R, { lcdG, lcdFloor: lf, VX0: SX + tl, VY0: SY + tt, VW: SW - tl - tr, VH: SH - tt - tb });

  return { parts, R };
}

/* ---------------- layouts ---------------- */
// All tapes live in one frame, turned TPHI degrees so their spines face you. `at` is the screen point of the frame
// origin (the back-left bottom corner of the VHS stack); groups sit at local (a, b) on the desk or on the bench (z).
// Stacks list their ranks top to bottom: the top tape is the most visible. (`tier` here only picks the tape's size.)
const TPHI = 32;
// The front row holds the biggest brands (VHS, then Hi8) on the desk; the bench behind it holds the MiniDV and micro
// tapes, high enough that every spine clears the front row.
const GROUPS = [
  { tier: 1, ranks: [1, 2, 3, 4], a: 0, b: 0 },
  { tier: 2, ranks: [5, 6, 7, 8, 9, 10], a: 136, b: 14 },
  { tier: 3, ranks: [11, 12, 13, 14, 15, 16], a: -33, b: -56, z: 99 },
  { tier: 3, ranks: [17, 18, 19, 20, 21, 22], a: 45, b: -56, z: 99 },
  { tier: 4, ranks: [23, 24, 25, 26, 27, 28, 29, 30, 31], a: 124, b: -46, z: 99 },
  { tier: 4, ranks: [32, 33, 34, 35, 36, 37, 38, 39, 40], a: 186, b: -46, z: 99 },
];
const BENCH = { a: -39, b: -60, la: 287, lb: 52, h: 99 };
const LAYOUT = {
  desktop: { lcd: { phi: 44, tilt: 10, sw: 78, bz: 6.5, topb: 7, chin: 14, pt: 7, br: [200, 114, 3] }, at: [268, 112], groups: GROUPS, bench: BENCH },
  mobile: { lcd: { phi: 44, tilt: 10, sw: 98, bz: 7, topb: 7.5, chin: 14, pt: 7, br: [198, 114, 7] }, at: [-120, 388], groups: GROUPS, bench: BENCH },
};
const fromScreen = (sx, sy) => { const a = sx / 0.8660254, b = 2 * sy; return [(a + b) / 2, (b - a) / 2]; };

/* ======================================================================================== */
export default async function build(ctx) {
  const { K, KF, iso, root, fore, sound, content } = ctx;
  const { g, el, face, txt, top, shift, rrect, circle, P, at, add, mul, dpoly, lerp3 } = iso;
  const mob = ctx.mobile;
  await fontsReady();
  const C = ctx.data && ctx.data.collabs;
  const profile = (C && C.profile) || 'https://www.instagram.com/vlada.asana/';
  const brands = brandList(ctx.data, content, ctx.ig);
  // the camcorder beside its tapes on wide stages; the tapes under it on phones and on near-square stages
  const stageAspect = (ctx.stage.clientWidth || 1) / (ctx.stage.clientHeight || 1);
  const LY = mob || stageAspect < 1.3 ? LAYOUT.mobile : LAYOUT.desktop;
  const { parts, R } = drawCam(K, iso, { lcd: LY.lcd });
  const { ZT, DX0, DY0, DW, DD, topPl } = R;

  /* ---------------- tapes: data + homes ---------------- */
  const tapes = brands.map((b, i) => {
    const tier = Math.min(4, Math.max(1, b.tier || 4));
    return { i, rank: b.rank, name: b.name, tier, spec: SPEC[tier], reel: b.reel || null, logo: logoOf(content, b.logo), b, g: g({ class: 'tape' }), inner: g(), group: null, pose: null };
  });
  const byRank = new Map(tapes.map((t) => [t.rank, t]));
  const phi = TPHI * D2R;
  const [FX0, FY0] = fromScreen(LY.at[0], LY.at[1]);
  const cph = Math.cos(phi), sph = Math.sin(phi);
  const local = (a, b) => [FX0 + a * cph + b * sph, FY0 - a * sph + b * cph];   // frame (a, b) -> world (x, y)
  const groups = LY.groups.map((gd, gi) => {
    const members = gd.ranks.map((r) => byRank.get(r)).filter(Boolean);
    const grp = { gi, ...gd, z: gd.z || 0, phi, members, present: members.slice(), g: g({ class: 'part tapes' }) };
    members.forEach((t) => { t.group = grp; t.g.appendChild(t.inner); });
    return grp;
  });
  // any tape the layout forgot (more brands than slots) gets its own little stack at the far end
  tapes.filter((t) => !t.group).forEach((t, k) => {
    const grp = { gi: groups.length, tier: t.tier, a: 250 + k * 6, b: 30 - k * 4, z: 0, phi, members: [t], present: [t], g: g({ class: 'part tapes' }) };
    t.group = grp; t.g.appendChild(t.inner); groups.push(grp);
  });
  const jit = (t) => { const s = Math.sin(t.rank * 12.9898) * 43758.5453; const f = s - Math.floor(s); return [(f - 0.5) * 2.4, (((f * 7.13) % 1) - 0.5) * 2]; };
  function homePose(t) {
    const grp = t.group, sp = t.spec;
    const pres = grp.present;
    const level = pres.length - 1 - pres.indexOf(t);
    const [ja, jb] = jit(t);
    const [x, y] = local(grp.a + ja, grp.b + jb);
    return { o: [x, y, grp.z + level * sp.T], phi, k: 1 };
  }
  const flying = new Set();
  const isTop = (t) => t.group.present.find((x) => !flying.has(x)) === t;
  function drawTape(t, pose, top = isTop(t)) {
    t.pose = pose;
    t.inner.replaceChildren(...tapeNodes(K, iso, t, pose, { top, cue: !!t.cued }));
  }
  function drawGroup(grp) {
    // bottom to top; a tape in flight stays in the fore layer
    grp.g.replaceChildren(...grp.present.filter((t) => !flying.has(t)).reverse().map((t) => t.g));
  }

  /* ---------------- shadows, the bench ---------------- */
  const tapeShadows = g({ class: 'part shadows' });
  const tsBlur = K.blurFilter(6), tsBlur2 = K.blurFilter(1.8);
  const quad = (a, b, la, lb, dx = 0, dy = 0) => [[a, b], [a + la, b], [a + la, b + lb], [a, b + lb]].map(([p, q]) => { const [x, y] = local(p, q); return [x + dx, y + dy]; });
  groups.filter((grp) => !grp.z).forEach((grp) => {
    const sp = SPEC[grp.tier];
    tapeShadows.appendChild(K.shadow(quad(grp.a - 4, grp.b - 4, sp.L + 8, sp.D + 10, -8, -14), 0, 0, 0, 0.5, tsBlur));
    tapeShadows.appendChild(K.shadow(quad(grp.a, grp.b, sp.L, sp.D), 0, 0, 0, 0.55, tsBlur2));
  });
  const benchG = g({ class: 'part' });
  const bn = LY.bench;
  if (bn) {
    const { MAT } = iso;
    const rp = (a, b, z, la, lb, h, mat, r = 1.5) => { const [x, y] = local(a, b); return K.prism(rrect(0, 0, la, lb, r, 3), iso.plane([x, y, z + h], [cph, -sph, 0], [sph, cph, 0]), h, mat); };
    tapeShadows.appendChild(K.shadow(quad(bn.a - 6, bn.b - 6, bn.la + 12, bn.lb + 12, -14, -26), 0, 0, 0, 0.45, K.blurFilter(10)));
    const PT = 6, LW = 9;
    benchG.appendChild(rp(bn.a + 3, bn.b + 4, 0, LW, bn.lb - 8, bn.h - PT, MAT.body2));
    benchG.appendChild(rp(bn.a + bn.la - 3 - LW, bn.b + 4, 0, LW, bn.lb - 8, bn.h - PT, MAT.body2));
    // a stretcher between the legs, low at the back
    benchG.appendChild(rp(bn.a + 3 + LW, bn.b + 8, 14, bn.la - 6 - 2 * LW, 5, 7, MAT.deep, 1));
    const plank = rp(bn.a, bn.b, bn.h - PT, bn.la, bn.lb, PT, MAT.body2, 2.5);
    benchG.appendChild(plank);
    // the plank's front edge: a plain groove, no labels
    const edge = iso.plane(at(iso.plane([...local(bn.a, bn.b), bn.h], [cph, -sph, 0], [sph, cph, 0]), 0, bn.lb), [cph, -sph, 0], [0, 0, -1]);
    benchG.appendChild(face(edge, [el('path', { d: `M3 ${f2(PT / 2)} L${f2(bn.la - 3)} ${f2(PT / 2)}`, class: 's3' })], 0.03));
  }

  /* ---------------- paint order: shadows, the bench and its tapes (behind the lens), camcorder, front row ---------------- */
  root.appendChild(tapeShadows);
  root.appendChild(benchG);
  groups.filter((grp) => grp.z).sort((a, b) => a.a - b.a).forEach((grp) => root.appendChild(grp.g));
  parts.forEach((p) => root.appendChild(p));
  groups.filter((grp) => !grp.z).sort((a, b) => a.a - b.a).forEach((grp) => root.appendChild(grp.g));

  /* ---------------- initial state: rank 1 (or the first tape with a reel) is in the camera ---------------- */
  let loaded = tapes.find((t) => t.reel) || tapes[0];
  const leave = (t) => { const p = t.group.present; const k = p.indexOf(t); if (k >= 0) p.splice(k, 1); };
  const enter = (t) => { const p = t.group.present; if (!p.includes(t)) { p.push(t); p.sort((a, b) => a.rank - b.rank); } };
  leave(loaded);
  groups.forEach((grp) => { grp.present.forEach((t) => drawTape(t, homePose(t))); drawGroup(grp); });

  // what is inside the door bay (seen when the lid opens)
  function drawLoaded(t) {
    R.inBay.replaceChildren();
    if (!t) return;
    const ox = DX0 + (DW - 60) / 2, oy = DY0 + (DD - 42) / 2;
    R.inBay.append(
      el('rect', { x: ox, y: oy, width: 60, height: 42, rx: 2.4, style: 'fill:var(--m-rubber)', class: 'sf' }),
      el('rect', { x: ox + 12, y: oy + 5, width: 36, height: 14, rx: 3, style: 'fill:var(--m-glass)' }),
      el('rect', { x: ox + 6, y: oy + 23, width: 48, height: 13, rx: 1.4, style: 'fill:var(--m-label)' }),
      txt(t.name, ox + 30, oy + 32, { size: 6.4, anchor: 'middle', fill: 'var(--paper-ink)', font: 'Pixelify Sans', weight: 500 }),
    );
  }
  R.drawLid(0, loaded.name);
  drawLoaded(loaded);

  /* ---------------- framing: the visible drawing (soft shadows may spill past the edges) ---------------- */
  {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const ch of root.children) {
      if (ch.classList.contains('shadows')) continue;
      const b = ch.getBBox();
      if (!b.width && !b.height) continue;
      x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height);
    }
    const pad = mob ? 6 : 10;
    const w = x1 - x0 + 2 * pad, h = y1 - y0 + 2 * pad;
    // on wide screens the section index's active label reaches a little into the card's right edge: keep clear of it
    const SWp = ctx.stage.clientWidth || 1, SHp = ctx.stage.clientHeight || 1;
    const keep = innerWidth > 900 ? 52 : 0;
    const s = Math.min((SWp - keep) / w, SHp / h);
    // widen the view by keep/s on the right: the drawing is then centred in the stage minus that strip
    ctx.view(x0 - pad, y0 - pad, w + keep / s, h);
  }

  /* ---------------- the picture on the LCD (video, still, digital zoom) ---------------- */
  const { VX0, VY0, VW, VH, lcdFloor, lcdPl } = R;
  const box = document.createElement('div');
  box.style.cssText = `width:${f2(VW)}px;height:${f2(VH)}px;clip-path:inset(0 round 1.6px);overflow:hidden;background:var(--m-glass);opacity:0;pointer-events:none;transition:opacity .25s;`;
  const vid = document.createElement('video');
  vid.muted = true; vid.defaultMuted = true; vid.playsInline = true; vid.setAttribute('playsinline', ''); vid.preload = 'none';
  vid.disablePictureInPicture = true; vid.setAttribute('disableremoteplayback', ''); vid.setAttribute('aria-hidden', 'true'); vid.tabIndex = -1;
  const FX = 'transform .35s cubic-bezier(.2,.8,.3,1), filter .7s cubic-bezier(.3,.6,.2,1), opacity .2s';
  vid.style.cssText = `position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform-origin:50% 42%;transition:${FX};opacity:0;`;
  const still = document.createElement('img');
  still.alt = ''; still.decoding = 'async';
  still.style.cssText = `position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform-origin:50% 42%;transition:${FX};`;
  const DZ = [null, [27, 48], [18, 32], [12, 21]];
  const pix = document.createElement('canvas');
  pix.width = 27; pix.height = 48;
  pix.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;opacity:0;';
  const px = pix.getContext('2d');
  box.append(still, vid, pix);
  ctx.overlay(box, lcdFloor, VX0, VY0);

  /* ---------------- OSD, cues and the blank-tape card (fore, on the glass) ---------------- */
  const oPl = shift(lcdFloor, VX0, VY0);
  const ocid = KF.id('lcd');
  KF.def(el('clipPath', { id: ocid }, [el('path', { d: dpoly(rrect(0, 0, VW, VH, 1.6, 3).map(([a, b]) => P(at(oPl, a, b)))) })]));
  const osdWrap = g({ 'clip-path': `url(#${ocid})`, opacity: 0 });
  const osd = face(oPl, []);
  osdWrap.appendChild(osd);
  fore.appendChild(osdWrap);
  const OSDC = 'var(--lcd)', OSDK = 'var(--lcd-ink)';
  const outline = (t, w = 1.3) => { t.style.stroke = OSDK; t.setAttribute('stroke-width', w); t.setAttribute('paint-order', 'stroke'); t.setAttribute('stroke-linejoin', 'round'); return t; };
  const O = (s, x, y, size, o = {}) => outline(txt(s, f2(x), f2(y), { size: f2(size), fill: OSDC, font: 'Pixelify Sans', weight: 600, ls: 0.3, ...o }));
  const vign = el('rect', { x: 0, y: 0, width: VW, height: VH, style: `fill:${KF.rgrad([[0.6, 'var(--shade)', 0], [1, 'var(--shade)', 0.32]], 0.5, 0.5, 0.75)}` });
  // a paused or finished reel dims under its cue
  const scrim = el('rect', { x: 0, y: 0, width: VW, height: VH, style: `fill:${OSDK};transition:opacity .3s`, opacity: 0 });
  const stIcon = g();                                    // play, pause, stop or standby, next to the mode
  const modeT = O('STBY', VW - 4, 9.8, 6.2, { anchor: 'end' });
  const spT = O('SP', 19.5, 9.7, 5.2);
  const tcT = O('0:00:00', VW - 4, VH - 4.5, 5.8, { anchor: 'end' });
  const titleT = O('', 4.5, VH - 20, 6.8);
  const subT = O('', 4.5, VH - 13, 4.4, { weight: 500 });
  const dzT = O('D.ZOOM', VW / 2, 20, 5, { anchor: 'middle' });
  dzT.setAttribute('opacity', 0);
  const zoomG = g({ opacity: 0, style: 'transition:opacity .3s' });
  const zoomBars = [];
  zoomG.append(O('W', VW / 2 - 23.5, VH - 24, 4.6), O('T', VW / 2 + 20, VH - 24, 4.6));
  for (let i = 0; i < 11; i++) {
    const dig = i >= 8;
    const r = el('rect', { x: f2(VW / 2 - 18.2 + i * 3.3), y: VH - 28.4, width: 2.2, height: 4.6, style: dig ? `fill:${OSDK};stroke:${OSDC}` : `fill:${OSDC};stroke:${OSDK}`, 'stroke-width': 0.5 });
    zoomBars.push(r); zoomG.appendChild(r);
  }
  const focusT = O('FOCUS', 4.5, 19.5, 4.6);
  focusT.setAttribute('opacity', 0);
  const batt = g({}, [
    el('rect', { x: 4.5, y: 5, width: 11, height: 5.6, rx: 0.9, style: `fill:none;stroke:${OSDC}`, 'stroke-width': 0.8 }),
    el('rect', { x: 15.5, y: 6.6, width: 1.4, height: 2.4, style: `fill:${OSDC}` }),
    ...[0, 1, 2].map((i) => el('rect', { x: 5.8 + i * 3.1, y: 6.3, width: 2.4, height: 3, style: `fill:${OSDC}` })),
  ]);
  // volume: the word and five bars that grow (where the zoom bar shows; one at a time)
  const volG = g({ opacity: 0, style: 'transition:opacity .3s' });
  const volT = O('VOL 4', VW / 2 - 9, VH - 24, 4.6, { anchor: 'end' });
  volG.appendChild(volT);
  const volBars = [];
  for (let i = 0; i < 5; i++) {
    const bh = 2.2 + i * 1.3;
    const r = el('rect', { x: f2(VW / 2 - 6 + i * 4.6), y: f2(VH - 23.8 - bh), width: 3.2, height: f2(bh), style: `fill:${OSDC};stroke:${OSDK}`, 'stroke-width': 0.5 });
    volBars.push(r); volG.appendChild(r);
  }
  // the cue over the picture: tap for sound, paused, replay
  const cueG = g({ opacity: 0, style: 'transition:opacity .3s' });
  const cueSize = Math.min(5.8, VW * 0.07);
  const cueBg = el('rect', { rx: f2(cueSize * 1.05), style: `fill:${OSDK};stroke:${OSDC}`, 'stroke-width': 0.5, opacity: 0.9 });
  const cueIcon = g();
  const cueT = O('', 0, 0, cueSize, { anchor: 'middle', ls: 0.2 });
  cueG.append(cueBg, cueIcon, cueT);
  const bigG = g({ opacity: 0, style: 'transition:opacity .3s' });
  const liveG = g({}, [vign, scrim, batt, spT, stIcon, modeT, tcT, titleT, subT, dzT, focusT, zoomG, volG, bigG, cueG]);
  // the blank tape: no collab reel on her Instagram yet
  const blankG = g({ style: 'display:none' });
  const blankName = txt('', VW / 2, VH * 0.42, { size: 8.6, anchor: 'middle', fill: 'var(--lcd-ink)', font: 'Pixelify Sans', weight: 600 });
  const blankWarn = txt('NO TAPE YET', VW / 2, VH * 0.42 + 9.6, { size: 4.6, anchor: 'middle', fill: 'var(--lcd-ink)', font: 'Silkscreen', ls: 0.4 });
  const blankLink = g({ class: 'iglink' }, [
    el('rect', { x: 6, y: VH * 0.76 - 6.4, width: VW - 12, height: 10.5, rx: 2, style: 'fill:transparent;stroke:var(--lcd-ink)', 'stroke-width': 0.45 }),
    txt('on her Instagram ↗', VW / 2, VH * 0.76 + 0.8, { size: 4.5, anchor: 'middle', fill: 'var(--lcd-ink)', font: 'Azeret Mono', weight: 500 }),
  ]);
  blankG.append(
    el('rect', { x: 0, y: 0, width: VW, height: VH, style: 'fill:var(--lcd)' }),
    el('rect', { x: 0, y: 0, width: VW, height: VH, style: `fill:${KF.rgrad([[0.55, 'var(--lcd-ink)', 0], [1, 'var(--lcd-ink)', 0.14]], 0.5, 0.45, 0.8)}` }),
    g({ transform: `translate(0 ${f2(VH * 0.26)})` }, cubeMark(iso, f2(VW / 2), 0, 5.4).map((p) => { p.setAttribute('class', p.getAttribute('class') === 's' ? 'blk' : 'blk2'); p.style.cssText = `fill:none;stroke:var(--lcd-ink);stroke-width:0.55;opacity:${p.getAttribute('class') === 'blk' ? 1 : 0.6}`; return p; })),
    blankName, blankWarn,
    txt('No collab reel', VW / 2, VH * 0.59, { size: 4.3, anchor: 'middle', fill: 'var(--lcd-ink)', font: 'Azeret Mono' }),
    txt('on her feed yet.', VW / 2, VH * 0.59 + 5.6, { size: 4.3, anchor: 'middle', fill: 'var(--lcd-ink)', font: 'Azeret Mono' }),
    blankLink,
  );
  osd.append(liveG, blankG, el('path', { d: `M0 0 L${f2(VW * 0.46)} 0 L${f2(VW * 0.18)} ${f2(VH)} L0 ${f2(VH)} Z`, style: 'fill:var(--m-paper)', opacity: 0.04 }));
  // glass glare stays when off too
  fore.appendChild(face(lcdPl, [el('path', { d: `M${R.SX} ${R.SY} L${R.SX + 30} ${R.SY} L${R.SX + 12} ${f2(R.SY + R.SH)} L${R.SX} ${f2(R.SY + R.SH)} Z`, style: 'fill:var(--m-paper)', opacity: 0.035 })], 0.2));
  // the link is a real tab stop only while the blank card shows
  const linkHit = g({ class: 'part' }, [el('path', { d: dpoly(rrect(4, VH * 0.76 - 8, VW - 8, 14, 2).map(([a, b]) => P(at(oPl, a, b)))), style: 'fill:transparent' })]);
  fore.appendChild(linkHit);
  linkHit.style.display = 'none';

  /* ---------------- hit area over the LCD ---------------- */
  const lcdHit = g({ class: 'part' }, [el('path', { d: dpoly(rrect(R.SX, R.SY, R.SW, R.SH, 2, 3).map(([a, b]) => P(at(lcdPl, a, b)))), style: 'fill:transparent' })]);
  root.appendChild(lcdHit);

  /* ---------------- behaviour ---------------- */
  const tapWord = mob ? 'TAP' : 'CLICK';
  const abs = (u) => { try { return new URL(u, location.href).href; } catch (err) { return u; } };
  let power = false, zoom = 0, busy = false, active = false, titleTimer = 0, volTimer = 0;
  let blink = 0, lastTc = '', pf = 0, vol = VOL0, loadWord = 'LOAD';
  // the reel: 'off' | 'blank' (no reel) | 'load' (a tape is going in) | 'preview' (a silent loop) | 'play' | 'pause' | 'end'
  let mode = 'off', blocked = false, resume = false, loud = false, cur = null;
  let cue = loaded.i;          // keyboard cursor (index into tapes, biggest brand first)
  let queued = null;           // a tape asked for while another was flying
  let pendingGo = null;        // HW.go params that arrived before the device switched on
  const tc = (s) => { const t = Math.floor(s); const h = Math.floor(t / 3600), m = Math.floor(t / 60) % 60, ss = t % 60; return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`; };
  function showTitle() {
    const t = loaded;
    if (!t || !t.reel) return;
    titleT.textContent = t.name;
    subT.textContent = t.reel.title || '';
    const maxW = VW - 9;
    for (const [n, s, w] of [[titleT, 6.8, 600], [subT, 4.4, 500]]) {
      // the OSD's letter-spacing (0.3) counts too
      n.removeAttribute('textLength');
      if (textW(n.textContent, s, 'Pixelify Sans', w) + 0.3 * n.textContent.length > maxW) { n.setAttribute('textLength', f2(maxW)); n.setAttribute('lengthAdjust', 'spacingAndGlyphs'); }
    }
    titleT.setAttribute('opacity', 1); subT.setAttribute('opacity', 1);
    clearTimeout(titleTimer);
    titleTimer = setTimeout(() => { titleT.setAttribute('opacity', 0); subT.setAttribute('opacity', 0); }, 4200);
  }
  function setMedia() {
    const t = loaded;
    const blank = !t || !t.reel;
    blankG.style.display = blank ? '' : 'none';
    liveG.style.display = blank ? 'none' : '';
    linkHit.style.display = blank ? '' : 'none';
    linkHit.setAttribute('tabindex', blank ? 0 : -1);
    if (blank) {
      blankName.textContent = t ? t.name : '';
      blankName.removeAttribute('textLength');
      if (t && textW(t.name, 8.6, 'Pixelify Sans', 600) > VW - 8) { blankName.setAttribute('textLength', f2(VW - 8)); blankName.setAttribute('lengthAdjust', 'spacingAndGlyphs'); }
      vid.pause(); vid.style.opacity = 0; still.style.opacity = 0;
      return;
    }
    still.src = t.reel.poster || t.reel.still;
    still.style.opacity = 1;
  }
  /* the mode in the corner, its icon, and the lamps on the body */
  const MODE_TXT = { blank: 'STBY', preview: 'STBY', play: 'PLAY', pause: 'PAUSE', end: 'STOP', off: '' };
  function drawMode() {
    const s = mode === 'load' ? loadWord : MODE_TXT[mode] || '';
    modeT.textContent = s;
    const x = VW - 4 - textW(s, 6.2, 600) - s.length * 0.3 - 2.6, y = 7.6;
    stIcon.replaceChildren();
    if (mode === 'play') stIcon.appendChild(el('path', { d: `M${f2(x - 4.2)} ${f2(y - 2.8)} L${f2(x)} ${f2(y)} L${f2(x - 4.2)} ${f2(y + 2.8)} Z`, style: `fill:var(--m-accent);stroke:${OSDK}`, 'stroke-width': 0.7, 'stroke-linejoin': 'round' }));
    else if (mode === 'pause') for (const dx of [-4.2, -1.7]) stIcon.appendChild(el('rect', { x: f2(x + dx), y: f2(y - 2.7), width: 1.7, height: 5.4, style: `fill:${OSDC};stroke:${OSDK}`, 'stroke-width': 0.6 }));
    else if (mode === 'end') stIcon.appendChild(el('rect', { x: f2(x - 4.6), y: f2(y - 2.3), width: 4.6, height: 4.6, style: `fill:${OSDC};stroke:${OSDK}`, 'stroke-width': 0.6 }));
    else if (mode === 'preview') stIcon.appendChild(el('circle', { cx: f2(x - 2.3), cy: y, r: 2.1, style: `fill:none;stroke:${OSDC}`, 'stroke-width': 1 }));
    const on = power && mode === 'play';
    R.lamp.style.fill = on ? 'var(--m-accent)' : 'var(--m-deep)'; R.lampGlow.setAttribute('opacity', on ? 0.9 : 0);
    R.tally.style.fill = on ? 'var(--m-accent)' : 'var(--m-deep)'; R.tallyGlow.setAttribute('opacity', on ? 0.85 : 0);
  }
  /* the cue over the picture */
  function speaker(x, y, s, on) {
    const p = (a, b) => `${f2(x + a * s)} ${f2(y + b * s)}`;
    return [
      el('path', { d: `M${p(0, 3.4)}L${p(2.6, 3.4)}L${p(5.6, 0.8)}L${p(5.6, 9.2)}L${p(2.6, 6.6)}L${p(0, 6.6)}Z`, style: `fill:${OSDC}` }),
      el('path', { d: on ? `M${p(7.1, 3.3)}Q${p(8.5, 5)} ${p(7.1, 6.7)}M${p(8.4, 1.7)}Q${p(10.9, 5)} ${p(8.4, 8.3)}` : `M${p(7.2, 3.4)}L${p(10.2, 6.6)}M${p(10.2, 3.4)}L${p(7.2, 6.6)}`, style: `fill:none;stroke:${OSDC}`, 'stroke-width': f2(s * 1.3), 'stroke-linecap': 'round' }),
    ];
  }
  function lcdCue(kind) {
    bigG.replaceChildren();
    if (!kind || !power) { cueG.setAttribute('opacity', 0); bigG.setAttribute('opacity', 0); scrim.setAttribute('opacity', 0); return; }
    const cs = cueSize;
    if (kind === 'sound') {
      const s = `${tapWord} FOR SOUND`;
      const tw = textW(s, cs, 600) + 0.2 * s.length;
      const iw = cs * 1.2, gap = cs * 0.45, w = Math.min(VW - 6, iw + gap + tw + cs * 1.8), h = cs * 2.1;
      const x = (VW - w) / 2, y = VH * 0.64 - h / 2;
      cueBg.setAttribute('x', f2(x)); cueBg.setAttribute('y', f2(y)); cueBg.setAttribute('width', f2(w)); cueBg.setAttribute('height', f2(h));
      cueIcon.replaceChildren(...speaker(x + cs * 0.9, y + h / 2 - iw / 2, iw / 10, false));
      cueT.textContent = s; cueT.setAttribute('x', f2(x + cs * 0.9 + iw + gap + tw / 2)); cueT.setAttribute('y', f2(y + h / 2 + cs * 0.34));
      cueG.setAttribute('opacity', 1); bigG.setAttribute('opacity', 0); scrim.setAttribute('opacity', 0);
      return;
    }
    cueG.setAttribute('opacity', 0);
    const r = VW * 0.13, cx = VW / 2, cy = VH * 0.44;
    if (kind === 'replay') {
      const a0 = -0.2 * Math.PI, a1 = 1.45 * Math.PI, pt = (a) => `${f2(cx + r * Math.cos(a))} ${f2(cy + r * Math.sin(a))}`;
      const arc = `M${pt(a0)} A${f2(r)} ${f2(r)} 0 1 1 ${pt(a1)}`;
      const ax = cx + r * Math.cos(a0), ay = cy + r * Math.sin(a0), s = r * 0.42;
      bigG.append(
        el('path', { d: arc, style: `fill:none;stroke:${OSDK}`, 'stroke-width': f2(r * 0.42), 'stroke-linecap': 'round' }),
        el('path', { d: arc, style: `fill:none;stroke:${OSDC}`, 'stroke-width': f2(r * 0.2), 'stroke-linecap': 'round' }),
        el('path', { d: `M${f2(ax - s * 0.2)} ${f2(ay - s * 1.05)} L${f2(ax + s * 0.75)} ${f2(ay + s * 0.15)} L${f2(ax - s * 0.75)} ${f2(ay + s * 0.45)} Z`, style: `fill:${OSDC};stroke:${OSDK}`, 'stroke-width': 0.6, 'stroke-linejoin': 'round' }),
        O('REPLAY', cx, cy + r + 9, Math.min(6.6, VW * 0.085), { anchor: 'middle' }),
      );
      scrim.setAttribute('opacity', 0.5);
    } else {
      const bw = r * 0.42, bh = r * 1.5;
      for (const dx of [-bw * 1.1, bw * 1.1]) bigG.appendChild(el('rect', { x: f2(cx + dx - bw / 2), y: f2(cy - bh / 2), width: f2(bw), height: f2(bh), rx: 0.8, style: `fill:${OSDC};stroke:${OSDK}`, 'stroke-width': 0.7 }));
      bigG.appendChild(O('PAUSED', cx, cy + bh / 2 + 9, Math.min(6.2, VW * 0.08), { anchor: 'middle' }));
      scrim.setAttribute('opacity', 0.28);
    }
    bigG.setAttribute('opacity', 1);
  }
  function cueSync() {
    if (!power || !loaded || !loaded.reel) return lcdCue(null);
    if ((mode === 'preview' || (mode === 'play' && blocked)) && sound.on && vol > 0) return lcdCue('sound');
    if (mode === 'pause') return lcdCue('paused');
    if (mode === 'end') return lcdCue('replay');
    lcdCue(null);
  }

  /* sound: the volume rocker, the site switch and the autoplay rules decide whether the reel is heard */
  function syncAudio() {
    vid.volume = VOLS[vol];
    const on = mode === 'play' && !blocked && sound.on && vol > 0;
    if (vid.muted !== !on) vid.muted = !on;
    const nowLoud = on && !vid.paused;
    if (nowLoud && !loud) window.dispatchEvent(new CustomEvent('hw:play', { detail: MOD }));   // one voice at a time
    loud = nowLoud;
    drawMode();
    cueSync();
  }
  const srcFull = (t) => t.reel.full || t.reel.loop;
  const srcLoop = (t) => t.reel.loop || t.reel.full;
  function setSrc(u, loop) {
    vid.loop = !!loop;
    const want = abs(u);
    if (vid.currentSrc === want || vid.src === want) return false;
    vid.style.opacity = 0; vid.src = want; vid.load();
    return true;
  }
  function tryPlay(t) {
    const p = vid.play();
    if (!p || !p.then) return;
    p.then(() => { if (cur === t) syncAudio(); }).catch((err) => {
      if (cur !== t || mode !== 'play' || !err || err.name !== 'NotAllowedError') return;
      // the browser wants a tap first: play silently and ask for one on the LCD
      blocked = true; syncAudio();
      vid.play().catch(() => {});
    });
  }
  /** The loaded tape's full reel, with sound (from the top unless resuming). */
  function playFull(t, restart = true) {
    cur = t; mode = 'play'; blocked = false; resume = false;
    const fresh = setSrc(srcFull(t), false);
    if (!fresh && restart) { try { vid.currentTime = 0; } catch (err) { /* not seekable yet */ } }
    syncAudio();
    if (!active) { resume = true; return; }   // off screen: it starts when the section comes back
    tryPlay(t);
  }
  /** A silent preview loop (when the camcorder switches itself on). */
  function playPreview(t) {
    cur = t; mode = 'preview'; blocked = false; resume = false;
    setSrc(srcLoop(t), true);
    syncAudio();
    if (active && !ctx.reduced) vid.play().catch(() => {});
  }
  function pauseReel() { if (mode !== 'play') return; mode = 'pause'; resume = false; vid.pause(); syncAudio(); }
  function resumeReel() { if (!cur) return; mode = 'play'; blocked = false; syncAudio(); tryPlay(cur); }
  function unblock() { if (mode !== 'play' || !blocked) return; blocked = false; syncAudio(); tryPlay(cur); }
  /** Inside the click or key press that picked a tape: start loading its reel, and let this element play with sound. */
  function prime(t) {
    mode = 'load'; blocked = false; resume = false; cur = t && t.reel ? t : null;
    if (!cur) { vid.pause(); syncAudio(); return; }
    setSrc(srcFull(t), false);
    vid.muted = true;
    const p = vid.play();
    if (p && p.then) p.then(() => { if (mode === 'load') vid.pause(); }).catch(() => {});
    syncAudio();
  }
  vid.addEventListener('playing', () => { if (power && (mode === 'play' || mode === 'preview')) { vid.style.opacity = 1; still.style.opacity = 0; } syncAudio(); });
  vid.addEventListener('pause', () => { loud = false; });
  vid.addEventListener('ended', () => { if (mode === 'play') { mode = 'end'; loud = false; syncAudio(); } });
  vid.addEventListener('error', () => {
    // the full-length file is missing: fall back to the short loop
    if (!cur || !cur.reel || !cur.reel.loop) return;
    const lp = abs(cur.reel.loop);
    if (vid.src === lp) return;
    const wasPlay = mode === 'play';
    vid.src = lp; vid.loop = !wasPlay; vid.load();
    if (wasPlay && active) tryPlay(cur);
    else if (mode === 'preview' && active) vid.play().catch(() => {});
  });
  sound.onChange(() => syncAudio());
  window.addEventListener('hw:play', (e) => { if (e.detail !== MOD && mode === 'play') pauseReel(); });

  function powerOn(gesture = false) {
    if (power) return;
    power = true;
    sound.click();
    setMedia();
    box.style.opacity = 1; osdWrap.setAttribute('opacity', 1);
    if (loaded && loaded.reel) {
      if (gesture) playFull(loaded);
      else if (ctx.reduced) { cur = loaded; mode = 'preview'; syncAudio(); }
      else playPreview(loaded);
      showTitle();
    } else { mode = 'blank'; syncAudio(); }
  }
  /** START/STOP (and the picture): play with sound, pause, resume, replay. */
  function startStop() {
    if (busy) return;
    if (!power) { powerOn(true); return; }
    const t = loaded;
    if (!t || !t.reel) { blink = 0; sound.beep(440, 0.09, 'square', 0.035); return; }
    if (mode === 'play') {
      if (blocked) { unblock(); return; }
      sound.beep(988, 0.07, 'square', 0.04);
      pauseReel();
      return;
    }
    sound.beep(1318, 0.07, 'square', 0.04); sound.motor(0.3);
    if (mode === 'pause') resumeReel(); else { playFull(t); showTitle(); }   // a silent preview, or the end: from the top
  }
  function pressIn(node, pl, dz = 1.4, ms = 130) {
    const [dx, dy] = P(mul(pl.n, -dz));
    node.classList.add('press', 'down');
    node.style.transform = `translate(${f2(dx)}px, ${f2(dy)}px)`;
    clearTimeout(node._pt);
    node._pt = setTimeout(() => { node.classList.remove('down'); node.style.transform = ''; }, ms);
  }
  // zoom: optical 0..7, digital 8..10
  const opt = () => 1 + Math.min(zoom, 7) * 0.12;
  function paintPix(force) {
    const dz = zoom - 7;
    if (dz <= 0 || !loaded || !loaded.reel) { pix.style.opacity = 0; return; }
    const [cw, ch] = DZ[dz];
    if (pix.width !== cw) { pix.width = cw; pix.height = ch; }
    const src = !ctx.reduced && vid.readyState >= 2 && parseFloat(vid.style.opacity || 0) > 0 ? vid : still;
    const iw = src === vid ? vid.videoWidth : still.naturalWidth, ih = src === vid ? vid.videoHeight : still.naturalHeight;
    if (!iw || !ih) return;
    const s = opt() * (1 + dz * 0.75);
    const sw = iw / s, sh = ih / s;
    const sx = iw * 0.5 - sw * 0.5, sy = ih * 0.42 - sh * 0.42;
    px.imageSmoothingEnabled = true;
    try { px.drawImage(src, sx, sy, sw, sh, 0, 0, cw, ch); } catch (e) { return; }
    if (force || pix.style.opacity !== '1') pix.style.opacity = 1;
  }
  function setZoom(z, quiet) {
    zoom = Math.max(0, Math.min(10, z));
    vid.style.transform = still.style.transform = `scale(${opt()})`;
    zoomBars.forEach((r, i) => r.setAttribute('opacity', i <= zoom ? 1 : 0.25));
    zoomBars.forEach((r, i) => { if (i >= 8) r.style.fill = i <= zoom ? OSDC : OSDK; });
    dzT.setAttribute('opacity', zoom > 7 ? 1 : 0);
    if (!quiet) {
      volG.setAttribute('opacity', 0);
      zoomG.setAttribute('opacity', 1);
      clearTimeout(zoomG._t);
      zoomG._t = setTimeout(() => zoomG.setAttribute('opacity', 0), 1500);
      sound.motor(0.16);
    }
    paintPix(true);
  }
  function rock(dir) {
    if (!power) powerOn();
    R.drawRocker(dir * 9);
    clearTimeout(R.rockG._t);
    R.rockG._t = setTimeout(() => R.drawRocker(0), 160);
    setZoom(zoom + dir);
  }
  function rackFocus() {
    if (!power) { powerOn(); return; }
    sound.motor(0.5);
    focusT.setAttribute('opacity', 1);
    for (const m of [vid, still, pix]) { m.style.transition = 'none'; m.style.filter = 'blur(2.6px)'; }
    requestAnimationFrame(() => requestAnimationFrame(() => { for (const m of [vid, still, pix]) { m.style.transition = FX; m.style.filter = 'blur(0px)'; } }));
    clearTimeout(focusT._t);
    focusT._t = setTimeout(() => focusT.setAttribute('opacity', 0), 1100);
  }
  /* volume: 0 mutes, 1 to 5 step up; one tick per step */
  function showVol() {
    if (!power) return;
    volBars.forEach((r, i) => r.setAttribute('opacity', i < vol ? 1 : 0.22));
    volT.textContent = vol ? `VOL ${vol}` : 'MUTE';
    zoomG.setAttribute('opacity', 0);
    volG.setAttribute('opacity', 1);
    clearTimeout(volTimer);
    volTimer = setTimeout(() => volG.setAttribute('opacity', 0), 1600);
  }
  function setVol(v, user = true) {
    v = Math.max(0, Math.min(5, Math.round(v)));
    if (v === vol) { sound.tick(); showVol(); return; }
    const steps = Math.abs(v - vol);
    vol = v;
    if (user && vol > 0 && !sound.on) sound.set(true);   // turning it up when the site is muted asks for sound
    for (let s = 0; s < steps; s++) setTimeout(() => sound.tick(), ctx.reduced ? 0 : s * 45);
    syncAudio();
    showVol();
    R.volRock.setAttribute('aria-valuenow', vol);
    R.volRock.setAttribute('aria-valuetext', vol ? `${vol} of 5` : 'muted');
  }

  /* ---------------- tape motion ---------------- */
  const flyG = g();
  fore.appendChild(flyG);
  function tween(ms, fn, done) {
    if (ctx.reduced || ms <= 0) { fn(1); if (done) done(); return; }
    const t0 = performance.now();
    const step = (t) => { const k = clamp01((t - t0) / ms); fn(k); if (k < 1) requestAnimationFrame(step); else if (done) done(); };
    requestAnimationFrame(step);
  }
  const DOOR = (t) => ({ o: [DX0 + (DW - 60) / 2, DY0 + (DD - 42) / 2, ZT - 12], phi: 0, k: 60 / t.spec.L });
  const lerpPose = (a, b, k) => ({ o: lerp3(a.o, b.o, k), phi: a.phi + (b.phi - a.phi) * k, k: a.k + (b.k - a.k) * k });
  const arcPose = (a, b, h, k) => { const p = lerpPose(a, b, k); p.o = p.o.slice(); p.o[2] += Math.sin(Math.PI * k) * h; return p; };
  const fwd = (t, pose, d) => ({ ...pose, o: add(pose.o, mul([Math.sin(pose.phi), Math.cos(pose.phi), 0], d)) });
  function fly(t, pose, opacity = 1) {
    if (t.g.parentNode !== flyG) flyG.appendChild(t.g);
    t.g.setAttribute('opacity', f2(opacity));
    drawTape(t, pose, true);
  }
  // stacks settle to their new levels (tapes above a gap drop, tapes above a returning tape make room)
  function settle(grp, from, ms) {
    const to = new Map(grp.present.map((t) => [t, homePose(t).o[2]]));
    tween(ms, (k) => {
      const e = ease(k);
      grp.present.forEach((t) => {
        if (flying.has(t)) return;
        const z0 = from.has(t) ? from.get(t) : to.get(t);
        const hp = homePose(t);
        hp.o = [hp.o[0], hp.o[1], z0 + (to.get(t) - z0) * e];
        drawTape(t, hp, isTop(t));
      });
    });
  }
  const zNow = (grp) => new Map(grp.present.map((t) => [t, t.pose ? t.pose.o[2] : homePose(t).o[2]]));

  function loadTape(i, opts = {}) {
    const t = tapes[i];
    if (!t) return;
    if (!power) powerOn();
    if (busy) { queued = i; return; }
    setCue(i, false);
    t.cued = false;
    t.inner.style.transition = 'none'; t.inner.style.transform = '';
    if (t === loaded) {
      // already in the camera: play it (with sound) unless it already is
      if (!t.reel) { blink = 0; sound.beep(440, 0.09, 'square', 0.035); return; }
      if (mode === 'play') { unblock(); return; }
      if (mode === 'pause') resumeReel(); else { playFull(t); showTitle(); }
      return;
    }
    busy = true;
    if (spread) { if (spread === t.group) unspread(); else closeSpread(); }
    const old = loaded;
    // the old reel stops as its tape comes out; the new one starts loading (inside this click, so it may play with sound)
    prime(t);
    loadWord = old ? 'EJECT' : 'LOAD';
    clearTimeout(titleTimer); titleT.setAttribute('opacity', 0); subT.setAttribute('opacity', 0);
    blankG.style.display = 'none'; liveG.style.display = ''; linkHit.style.display = 'none';
    still.style.opacity = 0; vid.style.opacity = 0; pix.style.opacity = 0;
    drawMode(); cueSync();
    hoverOff(t);
    sound.click();
    const fromT = t.pose ? { ...t.pose, o: t.pose.o.slice() } : homePose(t);
    const instant = ctx.reduced || opts.instant;
    if (instant) {
      leave(t); if (old) enter(old);
      [t.group, old && old.group].filter(Boolean).forEach((grp) => { grp.present.forEach((x) => drawTape(x, homePose(x))); drawGroup(grp); });
      t.g.remove(); t.g.setAttribute('opacity', 1);
      finish(t);
      return;
    }
    // 1 · the door opens while the new tape slides out of its stack
    const outPose = fwd(t, fromT, t.spec.D * 0.55);
    tween(220, (k) => { R.drawLid(105 * easeOut(k), old && old.name); drawTape(t, lerpPose(fromT, outPose, easeOut(k)), true); }, () => {
      // 2 · the new tape flies to the door; the old one pops out and flies home; stacks settle
      const zFromNew = zNow(t.group);
      const zFromOld = old && old.group !== t.group ? zNow(old.group) : null;
      leave(t);
      flying.add(t);
      fly(t, outPose);
      if (old) { flying.add(old); enter(old); old.g.remove(); sound.thunk(); }
      // one settle per stack: the gap closes, and room opens where the old tape goes back
      settle(t.group, zFromNew, 420);
      if (zFromOld) settle(old.group, zFromOld, 380);
      drawGroup(t.group);
      R.inBay.replaceChildren(); // the bay is empty for a moment
      const doorUp = (x, h) => { const d = DOOR(x); return { ...d, o: add(d.o, [0, 0, h]) }; };
      tween(640, (k) => {
        if (old) {
          const home = homePose(old);
          const front = fwd(old, home, old.spec.D * 0.6);
          let p;
          if (k < 0.22) p = lerpPose(DOOR(old), doorUp(old, 40), ease(k / 0.22));
          else if (k < 0.82) p = arcPose(doorUp(old, 40), front, 34, ease((k - 0.22) / 0.6));
          else p = lerpPose(front, home, ease((k - 0.82) / 0.18));
          fly(old, p, Math.min(1, k * 6));
        }
        const p2 = arcPose(outPose, doorUp(t, 44), 60, ease(k));
        fly(t, p2, 1);
      }, () => {
        if (old) {
          flying.delete(old);
          old.g.setAttribute('opacity', 1);
          old.group.present.forEach((x) => drawTape(x, homePose(x)));
          drawGroup(old.group);
          sound.tick();
        }
        loadWord = 'LOAD'; drawMode();
        // 3 · the chosen tape drops in
        tween(200, (k) => fly(t, doorUp(t, 44 * (1 - k * k)), 1 - k * 0.92), () => {
          flying.delete(t);
          t.g.remove(); t.g.setAttribute('opacity', 1);
          sound.thunk();
          // 4 · the door closes, and the reel plays
          finish(t);
        });
      });
    });
  }
  function finish(t) {
    loaded = t;
    drawLoaded(t);
    const close = () => {
      busy = false;
      setMedia();
      zoom = 0; setZoom(0, true); zoomG.setAttribute('opacity', 0);
      lastTc = ''; tcT.textContent = tc(0);
      if (t.reel) { sound.beep(1318, 0.07, 'square', 0.04); sound.motor(0.3); playFull(t); showTitle(); }
      else { cur = null; mode = 'blank'; syncAudio(); }
      updateA11yCur();
      syncTabStop();
      if (queued != null) { const q = queued; queued = null; if (tapes[q] !== loaded) loadTape(q); }
    };
    if (ctx.reduced) { R.drawLid(0, t.name); close(); return; }
    tween(220, (k) => R.drawLid(105 * (1 - ease(k)), t.name), close);
  }

  /* ---------------- hover, cue (keyboard) ---------------- */
  function slide(t, d) {
    if (!t.pose || t.g.parentNode === flyG) return;
    const [dx, dy] = P(mul([Math.sin(t.pose.phi), Math.cos(t.pose.phi), 0], d));
    t.inner.style.transition = 'transform .18s cubic-bezier(.2,.8,.3,1)';
    t.inner.style.transform = d ? `translate(${f2(dx)}px, ${f2(dy)}px)` : '';
  }
  function hoverOn(t) { if (!busy && t !== loaded && !t.cued && spread !== t.group) slide(t, 4); }
  function hoverOff(t) { if (!t.cued) slide(t, 0); }
  // one tab stop for the whole desk of tapes: the cued tape, or the next one that is actually on the desk
  const onDesk = (t) => t !== loaded && !flying.has(t) && t.g.isConnected;
  function syncTabStop() {
    let k = cue;
    for (let n = 0; n < tapes.length && !onDesk(tapes[k]); n++) k = (k + 1) % tapes.length;
    tapes.forEach((t, j) => t.g.setAttribute('tabindex', j === k ? 0 : -1));
  }
  function setCue(i, show = true) {
    const prev = tapes[cue];
    if (prev && (prev !== tapes[i] || !show)) {
      if (prev.cued) { prev.cued = false; if (prev.pose && onDesk(prev)) drawTape(prev, prev.pose); }
      slide(prev, 0);
    }
    cue = i;
    const t = tapes[cue];
    if (show && onDesk(t) && t.pose && !t.cued) { t.cued = true; drawTape(t, t.pose); slide(t, 4.5); }
    syncTabStop();
  }
  function cueStep(dir) {
    if (!power) powerOn();
    const n = tapes.length;
    let j = (cue + dir + n) % n;
    if (tapes[j] === loaded) j = (j + dir + n) % n;   // the one in the camera is not on the desk
    const hadFocus = document.activeElement && document.activeElement.closest && document.activeElement.closest('.tape');
    setCue(j, true);
    sound.tick();
    if (hadFocus) tapes[j].g.focus({ preventScroll: true });
  }

  /* ---------------- touch: a small-tape stack spreads open first, so every spine is a fair tap ---------------- */
  let spread = null;
  const spreadG = g();
  fore.appendChild(spreadG); // above the LCD picture while it is open
  const pitch = (t) => Math.max(t.spec.T, 25 / (ctx.scale || 1));
  function openSpread(grp) {
    if (spread === grp) return;
    closeSpread();
    spread = grp;
    grp.home = grp.g.nextSibling;
    spreadG.appendChild(grp.g);
    const from = zNow(grp);
    const pres = grp.present;
    tween(220, (k) => {
      const e = easeOut(k);
      pres.forEach((t) => {
        if (flying.has(t)) return;
        const hp = homePose(t);
        const zT = grp.z + (pres.length - 1 - pres.indexOf(t)) * pitch(t);
        const z0 = from.has(t) ? from.get(t) : hp.o[2];
        hp.o = [hp.o[0], hp.o[1], z0 + (zT - z0) * e];
        drawTape(t, hp, isTop(t));
      });
    });
    sound.tick();
  }
  function unspread() {
    const grp = spread;
    if (!grp) return null;
    spread = null;
    root.insertBefore(grp.g, grp.home && grp.home.parentNode === root ? grp.home : null);
    return grp;
  }
  function closeSpread() { const grp = unspread(); if (grp) settle(grp, zNow(grp), 180); }
  ctx.stage.addEventListener('pointerdown', (e) => { if (spread && !spread.g.contains(e.target)) closeSpread(); });

  /* ---------------- wiring ---------------- */
  tapes.forEach((t) => {
    const lbl = `${t.name}${t.reel ? `: ${t.reel.title}. Plays with sound` : ', no collab reel yet'}`;
    ctx.hit(t.g, lbl, (e) => {
      if (ctx.mobile && e.type !== 'keydown' && t.tier >= 2 && spread !== t.group && t.group.present.length > 1 && !busy) { openSpread(t.group); return; }
      loadTape(t.i);
    }, { tabindex: t.i === cue ? 0 : -1 });
    t.g.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hoverOn(t); });
    t.g.addEventListener('focus', () => { if (!busy && cue !== t.i && t.g.matches(':focus-visible')) setCue(t.i, true); });
    t.g.addEventListener('pointerleave', () => { if (tapes[cue] !== t || t === loaded) hoverOff(t); });
    // a tap only counts as permission for sound once the finger lifts: let the click bless the player too
    t.g.addEventListener('click', () => {
      if (mode === 'load' && cur === t) { const p = vid.play(); if (p && p.then) p.then(() => { if (mode === 'load') vid.pause(); }).catch(() => {}); }
      else if (loaded === t) unblock();
    });
  });
  ctx.hit(R.recG, 'Start or stop the reel', () => { pressIn(R.recBtn, topPl, 1.8, 140); startStop(); });
  ctx.hit(R.rockG, 'Zoom rocker', (e) => {
    if (e.type === 'keydown') { rock(zoom >= 10 ? -10 : 1); return; }
    const m = ctx.svg.getScreenCTM();
    if (!m) { rock(1); return; }
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    const pl = top(ZT + 3);
    const [ux, uy] = P(pl.u), [vx, vy] = P(pl.v), [ox, oy] = P(pl.o);
    const det = ux * vy - vx * uy, dx = p.x - ox, dy = p.y - oy;
    const a = (dx * vy - vx * dy) / det;
    rock(a < R.ZX ? -1 : 1);
  });
  // the volume rocker under the LCD: its left end turns the sound down, its right end up
  ctx.hit(R.volRock, 'Volume', (e) => {
    if (!power) powerOn();
    if (e.type === 'keydown') { setVol(vol >= 5 ? 0 : vol + 1); return; }
    const m = ctx.svg.getScreenCTM();
    let dir = 1;
    if (m) {
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      const pl = R.vrPl;
      const [ux, uy] = P(pl.u), [vx, vy] = P(pl.v), [ox, oy] = P(pl.o);
      const det = ux * vy - vx * uy, dx = p.x - ox, dy = p.y - oy;
      dir = (dx * vy - vx * dy) / det < R.vrX + R.vrW / 2 ? -1 : 1;
    }
    pressIn(R.rockCap, R.vrPl, 1.1, 120);
    setVol(vol + dir);
  }, { role: 'slider' });
  R.volRock.setAttribute('aria-valuemin', 0); R.volRock.setAttribute('aria-valuemax', 5); R.volRock.setAttribute('aria-valuenow', vol); R.volRock.setAttribute('aria-valuetext', `${vol} of 5`);
  R.volRock.addEventListener('keydown', (e) => {
    const k = e.key;
    let v = null;
    if (k === 'ArrowUp' || k === 'ArrowRight') v = vol + 1;
    else if (k === 'ArrowDown' || k === 'ArrowLeft') v = vol - 1;
    else if (k === 'Home') v = 0;
    else if (k === 'End') v = 5;
    if (v == null) return;
    e.preventDefault(); e.stopPropagation();
    ctx.arm();
    setVol(v);
  });
  const openProfile = () => { sound.tick(); if (ctx.HW && ctx.HW.open) ctx.HW.open(profile); else window.open(profile, '_blank', 'noopener'); };
  ctx.hit(lcdHit, 'LCD: play or pause the reel with sound', () => {
    if (!power) { powerOn(true); return; }
    if (busy) return;
    const t = loaded;
    if (!t) return;
    if (!t.reel) { openProfile(); return; }
    startStop();
  });
  lcdHit.addEventListener('click', () => unblock());
  ctx.hit(linkHit, 'On her Instagram', openProfile, { role: 'link', tabindex: -1 });
  ctx.hit(R.lensG, 'Lens: rack focus', rackFocus);

  ctx.onKey = (e) => {
    if (e.defaultPrevented) return false;
    const k = e.key;
    if (k === 'ArrowRight') { cueStep(1); return true; }
    if (k === 'ArrowLeft') { cueStep(-1); return true; }
    if (k === 'Enter') { loadTape(cue); return true; }
    if (k === ' ') { startStop(); return true; }
    if (k === '+' || k === '=') { setVol(vol + 1); return true; }
    if (k === '-' || k === '_') { setVol(vol - 1); return true; }
    if (k === 'm' || k === 'M') { setVol(vol ? 0 : VOL0); return true; }
    if (k === 't') { rock(1); return true; }
    if (k === 'w') { rock(-1); return true; }
    if (k === 'f') { rackFocus(); return true; }
    return false;
  };
  const findBrand = (q) => {
    if (q == null) return null;
    if (typeof q === 'number') return byRank.get(q) || null;
    const s = String(q).toLowerCase().trim();
    return tapes.find((t) => t.name.toLowerCase() === s) || tapes.find((t) => t.name.toLowerCase().startsWith(s)) || tapes.find((t) => t.name.toLowerCase().includes(s) || s.includes(t.name.toLowerCase())) || null;
  };
  // the desk computer can send people here: the visitor typed and pressed Enter, so the reel may play with sound
  ctx.onGo((p) => {
    const t = findBrand(p && (p.brand ?? p.rank ?? p.name));
    if (!t) return;
    if (!power) { pendingGo = t.i; return; }
    loadTape(t.i);
  });

  // frame loop: the tape counter, blinking modes, digital zoom pixels
  ctx.raf((dt) => {
    if (!power) return;
    blink += dt;
    if (cur && (mode === 'play' || mode === 'pause' || mode === 'end' || mode === 'preview')) {
      const s = tc(vid.currentTime || 0);
      if (s !== lastTc) { lastTc = s; tcT.textContent = s; }
    }
    const dim = !ctx.reduced && Math.floor(blink * 1.6) % 2 === 1 && (mode === 'pause' || mode === 'preview' || mode === 'load');
    modeT.setAttribute('opacity', dim ? 0.35 : 1);
    stIcon.setAttribute('opacity', dim ? 0.35 : 1);
    if ((mode === 'play' || mode === 'preview') && zoom > 7 && (pf = (pf + 1) % 2) === 0) paintPix();
    if (loaded && !loaded.reel) blankWarn.setAttribute('opacity', ctx.reduced || Math.floor(blink * 1.6) % 2 === 0 ? 1 : 0.15);
  });

  // screen reader version: every tape, biggest brand first
  const a11yList = `<ul>${tapes.map((t) => `<li>${t.name}: ${t.reel ? `<a href="${t.reel.link}">${t.reel.title}</a>${t.reel.plays ? `, ${fmtPlays(t.reel.plays)} plays` : ''}` : `no collab reel on <a href="${profile}">her Instagram</a> yet`}</li>`).join('')}</ul>`;
  const a11yHead = `<p>A camcorder with its screen turned upright, and a cassette for each of the ${tapes.length} brands Vlada has worked with, biggest brand first: the bigger the brand, the bigger the tape. Choose a tape to play its collab reel with sound. Arrow keys cue a tape, Enter plays it, Space pauses or replays, plus and minus set the volume.</p>`;
  function updateA11yCur() {
    const t = loaded;
    ctx.a11y(`${a11yHead}<p>In the camera: ${t ? `${t.name}${t.reel ? `, ${t.reel.title}` : ', no collab reel yet'}` : 'nothing'}.</p>${a11yList}`);
  }
  updateA11yCur();
  syncTabStop();
  drawMode();

  return {
    plotted() {
      powerOn(false);
      if (pendingGo != null) { const q = pendingGo; pendingGo = null; loadTape(q); }
    },
    start() {
      active = true;
      if (mode === 'preview' && !ctx.reduced) vid.play().catch(() => {});
      else if (mode === 'play' && resume) { resume = false; tryPlay(cur); }
    },
    stop() {
      active = false;
      if (mode === 'play' && !vid.paused) resume = true;
      vid.pause();
    },
  };
}

/* ======================================================================================== */
/** The hero tile: the same camcorder, switched on, a still of her reel on the upright LCD, a few tapes beside it. */
export async function hero(hx) {
  const { K, iso, root, content, data } = hx;
  const { g, el, face, txt, shift, rrect, P, at, dpoly } = iso;
  await fontsReady(700);
  const brands = brandList(data, content, hx.ig);
  const star = brands.find((b) => b.reel) || null;
  const lcd = { phi: 44, tilt: 10, sw: 64, bz: 6.5, topb: 7, chin: 12, pt: 7, br: [192, 108, 8] };
  const { parts, R } = drawCam(K, iso, { mini: true, lcd });
  // three tapes beside it: a little stack, biggest at the bottom
  const pick = [brands.find((b) => b.tier === 1 && b !== star), brands.find((b) => b.tier === 2), brands.find((b) => b.tier === 3)].filter(Boolean);
  const stackG = g({ class: 'part' });
  const [ox, oy] = hx.mobile ? fromScreen(112, 198) : fromScreen(248, 116);
  const phi = TPHI * D2R;
  let z = 0;
  const shadowPts = [[-4, -4], [128, -4], [128, 76], [-4, 76]].map(([a, b]) => [ox + a * Math.cos(phi) + b * Math.sin(phi) - 6, oy - a * Math.sin(phi) + b * Math.cos(phi) - 10]);
  stackG.appendChild(K.shadow(shadowPts, 0, 0, 0, 0.5, K.blurFilter(5)));
  pick.forEach((b, j) => {
    const tier = Math.min(4, Math.max(1, b.tier || 4));
    const t = { rank: b.rank, name: b.name, tier, spec: SPEC[tier], reel: b.reel, logo: logoOf(content, b.logo) };
    const off = j * 6;
    const pose = { o: [ox + off * Math.cos(phi) + 2 * Math.sin(phi), oy - off * Math.sin(phi) + 2 * Math.cos(phi), z], phi, k: 1 };
    stackG.appendChild(g({}, tapeNodes(K, iso, t, pose, { top: j === pick.length - 1 })));
    z += t.spec.T;
  });
  // camcorder first, then the stack in front of its lens
  parts.forEach((p) => root.appendChild(p));
  root.appendChild(stackG);
  R.drawLid(0, star ? star.name : '');
  // the lit screen: a still of her reel, REC and a timecode
  const scr = shift(R.lcdFloor, R.VX0, R.VY0);
  const { VW, VH } = R;
  const cid = K.id('hlcd');
  K.def(el('clipPath', { id: cid }, [el('path', { d: dpoly(rrect(0, 0, VW, VH, 1.6, 3).map(([a, b]) => P(at(scr, a, b)))) })]));
  const O = (s, x, y, size, o = {}) => { const t = txt(s, x, y, { size, fill: 'var(--lcd)', font: 'Pixelify Sans', weight: 600, ls: 0.3, ...o }); t.style.stroke = 'var(--lcd-ink)'; t.setAttribute('stroke-width', 1.2); t.setAttribute('paint-order', 'stroke'); return t; };
  // playing: the accent triangle and PLAY, as on the section's LCD
  const px = VW - 4 - textW('PLAY', 6.2, 'Pixelify Sans', 600) - 1.2 - 2.6;
  const tri = el('path', { d: `M${f2(px - 4.2)} 4.8 L${f2(px)} 7.6 L${f2(px - 4.2)} 10.4 Z`, style: 'fill:var(--m-accent);stroke:var(--lcd-ink)', 'stroke-width': 0.7, 'stroke-linejoin': 'round' });
  const kids = [el('rect', { x: 0, y: 0, width: VW, height: VH, style: 'fill:var(--m-glass)' })];
  if (star && star.reel) kids.push(el('image', { href: star.reel.still || star.reel.poster, x: 0, y: 0, width: VW, height: VH, preserveAspectRatio: 'xMidYMid slice' }));
  kids.push(tri, O('PLAY', VW - 4, 9.8, 6.2, { anchor: 'end' }), O(star ? star.name : '', 4.5, VH - 6, 6.6));
  kids.push(el('path', { d: `M0 0 L${f2(VW * 0.46)} 0 L${f2(VW * 0.18)} ${f2(VH)} L0 ${f2(VH)} Z`, style: 'fill:var(--m-paper)', opacity: 0.05 }));
  root.appendChild(g({ class: 'part', 'clip-path': `url(#${cid})` }, [face(scr, kids)]));
  // REC lamps on
  R.lamp.style.fill = 'var(--m-accent)'; R.lampGlow.setAttribute('opacity', 0.9);
  R.tally.style.fill = 'var(--m-accent)'; R.tallyGlow.setAttribute('opacity', 0.85);
  // on phones the tile's number sits over the top-left corner: leave the eyecup some room
  if (hx.mobile) {
    const b = root.getBBox();
    if (b.width) root.appendChild(el('rect', { x: f2(b.x - 34), y: f2(b.y - 26), width: 1, height: 1, style: 'fill:transparent', 'aria-hidden': 'true' }));
  }
}
