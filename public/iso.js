// iso.js · a tiny isometric SVG kit for "Hardware".
//
// WORLD: x runs right-down on screen, y runs left-down, z runs up. Units are arbitrary (about 1 unit = 1 mm of device).
// SCREEN: sx = (x - y)·cos30, sy = (x + y)·sin30 - z. The viewer sits at +x +y +z, so the visible faces of an
// axis-aligned box are: top (+z), the left-front face (+y) and the right-front face (+x).
//
// PLANES: a plane is { o, u, v, n }: origin o (3D), local axes u and v (3D unit vectors) and normal n = u × v.
// Local 2D coordinates (a, b) on a plane map to o + a·u + b·v. Anything drawn inside face(pl, ...) is drawn in local
// 2D coordinates, so text, images, circles and paths land on that face with the right skew.
//   top(z, x, y)     : horizontal plane at height z. a → +x, b → +y.
//   frontY(y, x, z)  : the left-front face (+y normal). Origin = its top-left corner as seen. a → +x, b → down.
//   frontX(x, y, z)  : the right-front face (+x normal). Origin = its top-left corner as seen (the max-y end).
//                      a → -y (towards screen right), b → down.
//   plane(o, u, v)   : any other plane (tilted panels, screens). Keep n = u × v pointing out of the solid.
//
// SOLIDS: prism(outline, pl, depth, mat) draws a convex solid whose visible cap lies on `pl` (outline in local 2D)
// and whose body extends `depth` units behind it (along -n). Sides are Lambert-shaded from `mat`, edges get
// hairlines. Boxes, keycaps (with a tapered `base`), cylinders and knobs are all prisms.
//
// DRAW ORDER is yours: painter's algorithm, back to front (smaller x + y and lower z first).

export const NS = 'http://www.w3.org/2000/svg';
const C = Math.cos(Math.PI / 6);
const S = 0.5;

/* ---------- vectors ---------- */
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export const lerp = (a, b, t) => a + (b - a) * t;
export const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/* ---------- projection ---------- */
export const P = (p) => [(p[0] - p[1]) * C, (p[0] + p[1]) * S - p[2]];
export const VIEW = norm([1, 1, 1]);
export const LIGHT = norm([0.22, 0.5, 1]); // top brightest, left-front (+y) mid, right-front (+x) darkest
export const isVisible = (n) => dot(n, VIEW) > 1e-4;
/** Screen-space offset for a world-space lift of dz (positive = up). Use for pressing keys or exploding parts. */
export const liftY = (dz) => -dz;

/* ---------- planes ---------- */
/*
 * FRAME: an optional turn about a vertical axis, so one object can face the viewer more than the grid does (the hero
 * computer). While a frame is set, every plane, tube, coil and path built is turned by `deg` around (cx, cy): +y turns
 * towards +x, so 45 would face the viewer square on. Shading and hidden faces follow, because they come from the
 * turned geometry. Set it, build synchronously, then clear it with frame(0).
 */
let FR = null;
export function frame(deg = 0, cx = 0, cy = 0) {
  if (!deg) { FR = null; return; }
  const a = (deg * Math.PI) / 180;
  FR = { c: Math.cos(a), s: Math.sin(a), cx, cy };
}
const turnP = (p) => (FR ? [FR.cx + (p[0] - FR.cx) * FR.c + (p[1] - FR.cy) * FR.s, FR.cy - (p[0] - FR.cx) * FR.s + (p[1] - FR.cy) * FR.c, p[2]] : p);
const turnV = (v) => (FR ? [v[0] * FR.c + v[1] * FR.s, -v[0] * FR.s + v[1] * FR.c, v[2]] : v);
export function plane(o, u, v) { if (FR) { o = turnP(o); u = turnV(u); v = turnV(v); } return { o, u, v, n: norm(cross(u, v)) }; }
export const top = (z = 0, x = 0, y = 0) => plane([x, y, z], [1, 0, 0], [0, 1, 0]);
export const frontY = (y = 0, x = 0, z = 0) => plane([x, y, z], [1, 0, 0], [0, 0, -1]);
export const frontX = (x = 0, y = 0, z = 0) => plane([x, y, z], [0, -1, 0], [0, 0, -1]);
/** A point on a plane: local (a, b), plus c units out along the normal. */
export const at = (pl, a, b, c = 0) => [
  pl.o[0] + pl.u[0] * a + pl.v[0] * b + pl.n[0] * c,
  pl.o[1] + pl.u[1] * a + pl.v[1] * b + pl.n[1] * c,
  pl.o[2] + pl.u[2] * a + pl.v[2] * b + pl.n[2] * c,
];
/** The same plane moved to local (a, b) and c out along the normal. */
export const shift = (pl, a = 0, b = 0, c = 0) => ({ ...pl, o: at(pl, a, b, c) });
/** SVG matrix string mapping local 2D of `pl` to screen. */
export function matrix(pl, c = 0) {
  const o = c ? at(pl, 0, 0, c) : pl.o;
  const [a, b] = P(pl.u), [cc, d] = P(pl.v), [e, f] = P(o);
  return `matrix(${r4(a)} ${r4(b)} ${r4(cc)} ${r4(d)} ${r2(e)} ${r2(f)})`;
}
/** Numeric version: [a, b, c, d, e, f] */
export function matrixArr(pl, c = 0) {
  const o = c ? at(pl, 0, 0, c) : pl.o;
  const [a, b] = P(pl.u), [cc, d] = P(pl.v), [e, f] = P(o);
  return [a, b, cc, d, e, f];
}

/* ---------- 2D outlines (local plane coordinates) ---------- */
export function rrect(x, y, w, h, r = 0, seg = 5) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  if (r <= 0.001) return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  const pts = [];
  const cs = [[x + w - r, y + r, -90], [x + w - r, y + h - r, 0], [x + r, y + h - r, 90], [x + r, y + r, 180]];
  for (const [cx, cy, a0] of cs) {
    for (let i = 0; i <= seg; i++) {
      const a = ((a0 + (90 * i) / seg) * Math.PI) / 180;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  }
  return pts;
}
export function circle(cx, cy, r, seg = 40) {
  const pts = [];
  for (let i = 0; i < seg; i++) { const a = (i / seg) * Math.PI * 2; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  return pts;
}
export function ellipse(cx, cy, rx, ry, seg = 40) {
  const pts = [];
  for (let i = 0; i < seg; i++) { const a = (i / seg) * Math.PI * 2; pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
  return pts;
}
/** Shrink (d > 0) or grow (d < 0) a convex outline around its centroid, uniformly by d units. */
export function inset(pts, d) {
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  // approximate: scale each point towards the centroid by d along its direction
  return pts.map(([x, y]) => { const dx = x - cx, dy = y - cy, l = Math.hypot(dx, dy) || 1; return [x - (dx / l) * d, y - (dy / l) * d]; });
}
/** Keycap-style taper for a rounded rect: returns { cap, base } outlines with equal point counts. */
export function taperRect(x, y, w, h, r, t, seg = 4) {
  return { cap: rrect(x + t, y + t, w - 2 * t, h - 2 * t, Math.max(0.5, r - t * 0.3), seg), base: rrect(x, y, w, h, r, seg) };
}
const area2 = (pts) => { let s = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; s += p[0] * q[1] - q[0] * p[1]; } return s / 2; };

/* ---------- geometry ---------- */
export function hull(points) {
  const p = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  up.pop(); lo.pop();
  return lo.concat(up);
}
const r2 = (n) => Math.round(n * 100) / 100;
const r4 = (n) => Math.round(n * 10000) / 10000;
export const dpoly = (pts, close = true) => 'M' + pts.map((p) => r2(p[0]) + ' ' + r2(p[1])).join('L') + (close ? 'Z' : '');
/** Smooth path through 2D points (Catmull-Rom → cubic Bézier). */
export function dsmooth(pts, tension = 0.5) {
  if (pts.length < 3) return dpoly(pts, false);
  let d = `M${r2(pts[0][0])} ${r2(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const t = tension / 3;
    const c1 = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2 = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += `C${r2(c1[0])} ${r2(c1[1])} ${r2(c2[0])} ${r2(c2[1])} ${r2(p2[0])} ${r2(p2[1])}`;
  }
  return d;
}

/* ---------- colour ---------- */
const hexRgb = (h) => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
const rgbHex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
/**
 * Materials. Theme-aware: { v: 'shell' } reads the CSS variable --m-shell, and faces are shaded with
 * color-mix(in oklab, var(--m-shell) P%, var(--shade)), so switching the theme recolours every drawing with no rebuild.
 * { c: '#hex' } is a fixed colour (avoid: it will not follow the theme).
 * Theme variables: --m-shell --m-body2 --m-deep --m-key --m-pale --m-glass --m-metal --m-rubber --m-accent --m-accent2 --m-paper --m-label
 */
export const MAT = {
  shell: { v: 'shell', amb: 0.46 },   // device body
  body2: { v: 'body2', amb: 0.46 },   // secondary body parts
  deep: { v: 'deep', amb: 0.5 },      // recesses, plates
  key: { v: 'key', amb: 0.44 },       // keycaps and buttons
  pale: { v: 'pale', amb: 0.52 },     // light keys, light trim
  glass: { v: 'glass', amb: 0.85 },   // screen glass (off)
  metal: { v: 'metal', amb: 0.45 },   // knobs, screws
  rubber: { v: 'rubber', amb: 0.5 },
  accent: { v: 'accent', amb: 0.62 }, // THE accent (copper at night, cherry red in bright themes). Use sparingly.
  copper: { v: 'accent', amb: 0.62 }, // alias
  accent2: { v: 'accent2', amb: 0.6 },// second accent (blue in bright themes). Sparingly.
  paper: { v: 'paper', amb: 0.72 },   // paper, receipts, labels
  label: { v: 'label', amb: 0.62 },   // cassette / cartridge labels
};
/** Light factor (0..1) for a face normal under a material's ambient. */
export function lightOf(mat, n) {
  const m = typeof mat === 'string' ? { c: mat } : mat;
  const amb = m.amb ?? 0.46;
  const l = Math.max(0, dot(n, LIGHT));
  return Math.round((amb + (1 - amb) * l) * 40) / 40;
}
/** CSS colour for a face of `mat` with normal n. */
export function shade(mat, n) {
  const m = typeof mat === 'string' ? { c: mat } : mat;
  const f = lightOf(m, n);
  if (m.v) {
    const pct = Math.round(f * 1000) / 10;
    const base = pct >= 100 ? `var(--m-${m.v})` : `color-mix(in oklab, var(--m-${m.v}) ${pct}%, var(--shade))`;
    return m.gloss ? `color-mix(in oklab, ${base} ${100 - Math.round(m.gloss * 30)}%, #fff)` : base;
  }
  const base = m._rgb || (m._rgb = hexRgb(m.c));
  let c = base.map((v) => v * f);
  if (m.gloss) { const h = Math.pow(Math.max(0, dot(n, norm([0.1, 0.9, 1.2]))), 18) * m.gloss * 255; c = c.map((v) => v + h); }
  return rgbHex(c);
}
/** A theme colour token for fills/strokes in style attributes, e.g. tok('accent') -> 'var(--m-accent)'. */
export const tok = (name) => `var(--m-${name})`;
export const mix = (a, b, t) => rgbHex(hexRgb(a).map((v, i) => lerp(v, hexRgb(b)[i], t)));

/* ---------- DOM ---------- */
export function el(tag, attrs = {}, kids) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) { const v = attrs[k]; if (v != null && v !== false) e.setAttribute(k, v); }
  if (kids) for (const c of [].concat(kids)) if (c) e.appendChild(c);
  return e;
}
export const g = (attrs = {}, kids) => el('g', attrs, kids);
/** Group whose children are drawn in the local 2D coordinates of plane pl (c = offset along the normal). */
export const face = (pl, kids, c = 0, attrs = {}) => g({ ...attrs, transform: matrix(pl, c) }, kids);
export function txt(str, x, y, o = {}) {
  // fill and font go in style so they beat the stylesheet's default .tx rule
  const st = [o.fill ? `fill:${o.fill}` : '', o.font ? `font-family:${o.font.includes(',') || o.font.startsWith('var(') ? o.font : `'${o.font}'`}` : '', o.style || ''].filter(Boolean).join(';');
  const t = el('text', {
    x, y, class: o.cls || 'tx', 'font-size': o.size, 'text-anchor': o.anchor, style: st || null,
    'font-weight': o.weight, 'letter-spacing': o.ls, 'dominant-baseline': o.base, opacity: o.opacity,
  });
  t.textContent = str;
  return t;
}
/** A path in screen space through 3D points. */
export const path3 = (pts3, attrs = {}, close = false) => el('path', { ...attrs, d: dpoly(pts3.map((p) => P(turnP(p))), close) });
export const line3 = (p, q, cls = 's') => el('path', { class: cls, d: dpoly([P(turnP(p)), P(turnP(q))], false) });

/**
 * Build a kit bound to one <svg> (needed for ids: clip paths, gradients, filters).
 * const K = kit(svg, 'f1');
 */
export function kit(svg, prefix = 'k') {
  let defs = svg.querySelector('defs');
  if (!defs) { defs = el('defs'); svg.prepend(defs); }
  let uid = 0;
  const id = (name = 'x') => `${prefix}-${name}-${++uid}`;
  const def = (node) => { defs.appendChild(node); return node; };

  // shared soft shadow filter
  const shadowId = id('shadow');
  def(el('filter', { id: shadowId, x: '-30%', y: '-30%', width: '160%', height: '160%' }, [el('feGaussianBlur', { stdDeviation: 7 })]));
  const glowId = id('glow');
  def(el('filter', { id: glowId, x: '-60%', y: '-60%', width: '220%', height: '220%' }, [el('feGaussianBlur', { stdDeviation: 2.4 })]));

  /**
   * Convex solid. outline: local 2D points on pl. depth: how far the body goes behind pl.
   * o.base: far-end outline (same point count) for tapered shapes. o.capFill: override cap colour.
   * o.lines: true (default) | false. o.cap: false to skip the cap. o.capLine: false to skip the cap outline.
   * Returns <g> with .pl (the cap plane) for adding details.
   */
  function prism(outline, pl, depth, mat, o = {}) {
    const base = o.base || outline;
    const n = outline.length;
    const A3 = outline.map(([a, b]) => at(pl, a, b, 0));
    const B3 = base.map(([a, b]) => at(pl, a, b, -depth));
    const A = A3.map(P), B = B3.map(P);
    const sgn = Math.sign(area2(outline)) || 1;
    const grp = g({ class: o.cls || null });
    const sil = hull(A.concat(B));
    const norms = [], vis = [];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const e = sub(A3[j], A3[i]);
      if (Math.hypot(e[0], e[1], e[2]) < 1e-6) { norms[i] = null; vis[i] = false; continue; }
      let nn = norm(cross(e, sub(B3[i], A3[i])));
      const da = outline[j][0] - outline[i][0], db = outline[j][1] - outline[i][1];
      const out = add(mul(pl.u, db * sgn), mul(pl.v, -da * sgn));
      if (dot(nn, out) < 0) nn = mul(nn, -1);
      norms[i] = nn; vis[i] = isVisible(nn);
    }
    // side fills, merged by colour; an underlay hides anti-alias seams
    const byCol = new Map();
    let darkest = null, dl = 1e9;
    for (let i = 0; i < n; i++) {
      if (!vis[i]) continue;
      const j = (i + 1) % n;
      const col = shade(mat, norms[i]);
      const lum = lightOf(mat, norms[i]);
      if (lum < dl) { dl = lum; darkest = col; }
      byCol.set(col, (byCol.get(col) || '') + dpoly([A[i], A[j], B[j], B[i]]));
    }
    if (darkest && o.underlay !== false) grp.appendChild(el('path', { d: dpoly(sil), style: `fill:${darkest}`, class: 'f' }));
    for (const [col, d] of byCol) grp.appendChild(el('path', { d, style: `fill:${col};stroke:${col}`, 'stroke-width': 0.35, class: 'f' }));
    // cap
    const capVisible = isVisible(pl.n);
    if (o.cap !== false && capVisible) {
      grp.appendChild(el('path', { d: dpoly(A), style: `fill:${o.capFill || shade(mat, pl.n)}`, class: 'f' }));
    }
    if (o.lines !== false) {
      // creases between visible sides that meet at a sharp angle
      let cd = '';
      for (let i = 0; i < n; i++) {
        const k = (i + 1) % n;
        if (vis[i] && vis[k] && norms[i] && norms[k] && dot(norms[i], norms[k]) < 0.93) cd += dpoly([A[k], B[k]], false);
      }
      if (cd) grp.appendChild(el('path', { d: cd, class: 's2' }));
      if (o.capLine !== false && capVisible && o.cap !== false) grp.appendChild(el('path', { d: dpoly(A), class: 's' }));
      grp.appendChild(el('path', { d: dpoly(sil), class: 's' }));
    }
    grp.pl = pl;
    grp.sil = sil;
    return grp;
  }

  /** Axis-aligned box from min corner (x, y, z), size (w along x, d along y, h along z), r = vertical-edge rounding. */
  function box(x, y, z, w, d, h, mat, o = {}) {
    const g0 = prism(rrect(0, 0, w, d, o.r || 0, o.seg || 5), top(z + h, x, y), h, mat, o);
    g0.top = top(z + h, x, y);
    g0.fy = frontY(y + d, x, z + h);   // left-front face plane (local a: 0..w, b: 0..h)
    g0.fx = frontX(x + w, y + d, z + h); // right-front face plane (local a: 0..d, b: 0..h)
    return g0;
  }
  /** Vertical cylinder centred at (cx, cy), from z to z + h. */
  function cyl(cx, cy, z, rad, h, mat, o = {}) {
    const g0 = prism(circle(0, 0, rad, o.seg || 44), top(z + h, cx, cy), h, mat, o);
    g0.top = top(z + h, cx, cy);
    return g0;
  }
  /**
   * A recess cut into a face: floor + the visible inner walls, clipped to the opening.
   * Returns <g>; .floor is the floor plane (draw screen content on it).
   */
  function recess(outline, pl, depth, mat, o = {}) {
    const cid = id('clip');
    def(el('clipPath', { id: cid }, [el('path', { d: dpoly(outline.map(([a, b]) => P(at(pl, a, b)))) })]));
    const grp = g({ class: o.cls || null });
    const inner = g({ 'clip-path': `url(#${cid})` });
    const floorPl = shift(pl, 0, 0, -depth);
    const F = outline.map(([a, b]) => P(at(pl, a, b, -depth)));
    const A = outline.map(([a, b]) => P(at(pl, a, b, 0)));
    inner.appendChild(el('path', { d: dpoly(F), style: `fill:${o.floorFill || shade(mat, pl.n)}`, class: 'f' }));
    const sgn = Math.sign(area2(outline)) || 1;
    const n = outline.length;
    const byCol = new Map();
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const da = outline[j][0] - outline[i][0], db = outline[j][1] - outline[i][1];
      if (Math.hypot(da, db) < 1e-6) continue;
      const wallN = norm(add(mul(pl.u, -db * sgn), mul(pl.v, da * sgn))); // inward-facing wall normal
      if (!isVisible(wallN)) continue;
      const col = shade(mat, wallN);
      byCol.set(col, (byCol.get(col) || '') + dpoly([A[i], A[j], F[j], F[i]]));
    }
    for (const [col, d] of byCol) inner.appendChild(el('path', { d, style: `fill:${col};stroke:${col}`, 'stroke-width': 0.35, class: 'f' }));
    grp.appendChild(inner);
    if (o.content) inner.appendChild(o.content(floorPl));
    if (o.lines !== false) grp.appendChild(el('path', { d: dpoly(A), class: o.rimCls || 's' }));
    if (o.floorLine) inner.appendChild(el('path', { d: dpoly(F), class: 's2' }));
    grp.floor = floorPl;
    grp.inner = inner;
    return grp;
  }
  /** Soft ground shadow: outline (local 2D on a horizontal plane at z), blurred. */
  function shadow(outline, z = 0, x = 0, y = 0, opacity = 0.55, blur = null) {
    const pl = top(z, x, y);
    const p = el('path', { d: dpoly(outline.map(([a, b]) => P(at(pl, a, b)))), style: 'fill:var(--shadow)', opacity, filter: `url(#${blur || shadowId})`, class: 'shadow' });
    return p;
  }
  /** A blur filter with a custom radius. */
  function blurFilter(sd) { const fid = id('blur'); def(el('filter', { id: fid, x: '-50%', y: '-50%', width: '200%', height: '200%' }, [el('feGaussianBlur', { stdDeviation: sd })])); return fid; }
  /** A tube (cable) through 3D points: dark core with hairline edges. */
  function tube(pts3, w = 3, fill = 'var(--m-rubber)') {
    const d = dsmooth(pts3.map((p) => P(turnP(p))));
    return g({ class: 'tube' }, [
      el('path', { d, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'tube-o', style: `stroke-width:calc(${w}px + 2px * var(--hair, 1))` }),
      el('path', { d, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', style: `stroke:${fill};stroke-width:${w}px` }),
    ]);
  }
  /** A coiled cord from p to q (3D): a helix of radius rad with `turns` turns. */
  function coil(p, q, rad = 2.2, turns = 14, w = 1.3, fill = 'var(--m-rubber)') {
    const dir = norm(sub(q, p));
    let e1 = norm(cross(dir, [0, 0, 1])); if (Math.hypot(...e1) < 0.1) e1 = [1, 0, 0];
    const e2 = norm(cross(dir, e1));
    const pts = [];
    const N = turns * 10;
    for (let i = 0; i <= N; i++) {
      const t = i / N, a = t * turns * Math.PI * 2;
      pts.push(add(lerp3(p, q, t), add(mul(e1, Math.cos(a) * rad), mul(e2, Math.sin(a) * rad))));
    }
    return tube(pts, w, fill);
  }
  /** Linear gradient in a given space; returns url(). */
  function grad(stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1, units = 'objectBoundingBox') {
    const gid = id('grad');
    def(el('linearGradient', { id: gid, x1, y1, x2, y2, gradientUnits: units }, stops.map(([off, col, op = 1]) => el('stop', { offset: off, style: `stop-color:${col};stop-opacity:${op}` }))));
    return `url(#${gid})`;
  }
  function rgrad(stops, cx = 0.5, cy = 0.5, rr = 0.5) {
    const gid = id('rgrad');
    def(el('radialGradient', { id: gid, cx, cy, r: rr }, stops.map(([off, col, op = 1]) => el('stop', { offset: off, style: `stop-color:${col};stop-opacity:${op}` }))));
    return `url(#${gid})`;
  }
  /** Parallel slots/lines on a face (vents, grilles), drawn in local coords of pl. */
  function slots(pl, x, y, w, h, n, o = {}) {
    const kids = [];
    const vertical = o.vertical !== false;
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1);
      if (vertical) { const xx = x + t * w; kids.push(el('path', { d: `M${r2(xx)} ${r2(y)}L${r2(xx)} ${r2(y + h)}`, class: o.cls || 's2' })); }
      else { const yy = y + t * h; kids.push(el('path', { d: `M${r2(x)} ${r2(yy)}L${r2(x + w)} ${r2(yy)}`, class: o.cls || 's2' })); }
    }
    return face(pl, kids, o.c || 0.01);
  }
  /** Screw head on a plane at local (a, b). */
  function screw(pl, a, b, rad = 1.6) {
    return face(pl, [
      el('circle', { cx: a, cy: b, r: rad, style: 'fill:var(--m-metal)', class: 'sf' }),
      el('path', { d: `M${a - rad * 0.6} ${b}L${a + rad * 0.6} ${b}M${a} ${b - rad * 0.6}L${a} ${b + rad * 0.6}`, class: 's2' }),
    ], 0.02);
  }

  /**
   * A 1-bit picture whose two colours follow the theme: dot colour `on` shows through a mask made from a dither()
   * result (call dither(src, { mask: true, ... }) first). x, y, w, h in the current local coordinates.
   */
  function bitmap(d, x, y, w, h, on = 'var(--phos-ink)', off = 'var(--phos)') {
    const mid = id('bits');
    def(el('mask', { id: mid, maskUnits: 'userSpaceOnUse', x, y, width: w, height: h }, [el('image', { href: d.url, x, y, width: w, height: h, preserveAspectRatio: 'none', style: 'image-rendering:pixelated' })]));
    return g({ class: 'bitmap' }, [
      off ? el('rect', { x, y, width: w, height: h, style: `fill:${off}` }) : null,
      el('rect', { x, y, width: w, height: h, style: `fill:${on}`, mask: `url(#${mid})` }),
    ]);
  }

  return { svg, defs, id, def, prism, box, cyl, recess, shadow, blurFilter, tube, coil, grad, rgrad, slots, screw, bitmap, shadowId, glowId };
}

/* ---------- 1-bit dithering (Atkinson), for portraits on retro screens ---------- */
/**
 * Load an image and return a data URL of a 1-bit Atkinson-dithered version.
 * crop: [sx, sy, sw, sh] in source pixels. w, h: output size in dots. on/off: colours (off may be 'transparent').
 */
export async function dither(src, { crop, w = 160, h = 120, on = '#e9e9e6', off = '#111111', gamma = 1, contrast = 1.15, bright = 0, bg = 0, mask = false, invert = false } = {}) {
  if (mask) { on = '#ffffff'; off = 'transparent'; }
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  cx.fillStyle = `rgb(${bg},${bg},${bg})`;
  cx.fillRect(0, 0, w, h);
  const [sx, sy, sw, sh] = crop || [0, 0, img.naturalWidth, img.naturalHeight];
  cx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  const im = cx.getImageData(0, 0, w, h);
  const d = im.data;
  const L = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const a = d[i * 4 + 3] / 255;
    let y = (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255;
    y = y * a + (bg / 255) * (1 - a);
    y = Math.pow(Math.max(0, Math.min(1, (y - 0.5) * contrast + 0.5 + bright)), gamma);
    L[i] = y;
  }
  const out = new Uint8Array(w * h);
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
    const i = yy * w + xx;
    const o0 = L[i] > 0.5 ? 1 : 0;
    const o = invert ? 1 - o0 : o0;
    out[i] = o;
    const err = (L[i] - o0) / 8;
    const push = (dx, dy) => { const x2 = xx + dx, y2 = yy + dy; if (x2 >= 0 && x2 < w && y2 < h) L[y2 * w + x2] += err; };
    push(1, 0); push(2, 0); push(-1, 1); push(0, 1); push(1, 1); push(0, 2);
  }
  const onC = hexRgb(on);
  const offT = off === 'transparent';
  const offC = offT ? [0, 0, 0] : hexRgb(off);
  for (let i = 0; i < w * h; i++) {
    const c = out[i] ? onC : offC;
    d[i * 4] = c[0]; d[i * 4 + 1] = c[1]; d[i * 4 + 2] = c[2]; d[i * 4 + 3] = out[i] ? 255 : (offT ? 0 : 255);
  }
  cx.putImageData(im, 0, 0);
  return { url: cv.toDataURL('image/png'), bits: out, w, h };
}
