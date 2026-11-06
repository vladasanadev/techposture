// 05 · Audience · Radar.
// The sonar console from 17, knobs and switches back, every one of them wired to her audience numbers:
//   VIEW rotary (readout unit) ... picks the stat: top countries, gender, age or roles
//   scope ......................... draws that stat: the map with her five countries, or a phosphor chart
//   bearing dial (scope bezel) .... drag it to turn the beam by hand; on a chart the beam reads the slice it points at
//   RANGE knob .................... steps the lock through the stat's items (a country, an age range, a role), then back to all
//   GAIN knob ..................... the scope's brightness
//   role toggles .................. switch each role in or out; the 7-segment adds up the roles left on
// The LCD lists the stat with its shares; the 7-segment shows the audience total, or the share of whatever is locked.
// Shares are placeholders until Vlada sends her insights (data/audience.json); the total and the country order are real.
const WORLD_URL = '../shared/data/world.geo.json';
const D2R = Math.PI / 180;
let worldP = null;
const world = () => worldP || (worldP = fetch(WORLD_URL).then((r) => (r.ok ? r.json() : null)).catch(() => null));

/* ====================================================================================================== */
/* data                                                                                                    */
/* ====================================================================================================== */
const SHORT = { 'Tech professionals': 'Tech pros' };   // where a full label will not fit (scope, switch legends)
const LEGEND = { 'Tech professionals': 'TECH PROS' };

/** The audience total and the four views, from data/audience.json (content.js until it exists). */
function audienceOf(content, data) {
  const A = data?.audience || null;
  const raw = A?.total || data?.engagement?.followers || content.SOCIALS?.find((s) => s.id === 'instagram')?.followers || `${content.STATS[0].value}${content.STATS[0].suffix}`;
  const m = String(raw).match(/^([\d.]+)\s*([A-Za-z]*)\+?$/);
  const total = m ? { num: m[1], unit: m[2], text: String(raw) } : { num: String(raw), unit: '', text: String(raw) };
  const geo = new Map(content.AUDIENCE.countries.map((c) => [c.code, c]));
  const pct = (v) => (v != null && Number.isFinite(+v) ? Math.round(+v) : null);
  const countries = (A?.countries?.length ? A.countries : content.AUDIENCE.countries).map((c) => {
    const g0 = geo.get(c.code) || {};
    return { label: c.name, short: SHORT[c.name] || c.name, cap: c.name, code: c.code, lat: c.lat ?? g0.lat, lon: c.lon ?? g0.lon, share: pct(c.share) };
  }).filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lon));
  const list = (arr, cap) => (arr || []).filter((x) => x && x.label).map((x) => ({ label: x.label, short: SHORT[x.label] || x.label, cap: cap ? cap(x.label) : x.label, share: pct(x.share) }));
  const roles = A?.roles?.length ? list(A.roles) : content.AUDIENCE.who.map((w) => ({ label: w, short: SHORT[w] || w, cap: w, share: null }));
  const views = [
    { id: 'countries', key: 'COUNTRIES', title: 'Top countries', kind: 'map', items: countries },
    { id: 'gender', key: 'GENDER', title: 'Gender', kind: 'donut', items: list(A?.gender) },
    { id: 'age', key: 'AGE', title: 'Age', kind: 'rose', items: list(A?.age, (l) => `Aged ${l}`) },
    { id: 'roles', key: 'ROLES', title: 'Roles', kind: 'donut', items: roles },
  ].filter((v) => v.items.length);
  return { total, views, roles };
}

/* azimuthal equidistant projection, centred on Ukraine; +x east, +y south (screen down) */
const LAT0 = 49 * D2R, LON0 = 31, MAP_RANGE = 108 * D2R;
const sp0 = Math.sin(LAT0), cp0 = Math.cos(LAT0);
function project(lon, lat, RM) {
  const p = lat * D2R, l = (lon - LON0) * D2R;
  const cc = sp0 * Math.sin(p) + cp0 * Math.cos(p) * Math.cos(l);
  const c = Math.acos(Math.max(-1, Math.min(1, cc)));
  let x = Math.cos(p) * Math.sin(l), y = cp0 * Math.sin(p) - sp0 * Math.cos(p) * Math.cos(l);
  const r = Math.hypot(x, y);
  if (r > 1e-9) { x = (x / r) * c; y = (y / r) * c; } else { x = 0; y = 0; }
  const s = RM / MAP_RANGE;
  return [x * s, -y * s, c];
}
const bearingOf = (x, y) => ((Math.atan2(x, -y) / D2R) + 360) % 360;
const norm360 = (d) => ((d % 360) + 360) % 360;

/* Pixelify Sans draws a 5 like an S ("2S-34"), so every number on the screens is set in Silkscreen, words in Pixelify. */
const NUM_FONT = "'Silkscreen'", NUM_K = 0.94;
/** Fill a text node with runs: numbers in Silkscreen (a touch smaller, it runs large), everything else as the node is set. */
function setRich(t, str) {
  t.textContent = '';
  for (const run of String(str).match(/[0-9][0-9.,%+\-K]*|[^0-9]+/g) || ['']) {
    const ts = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    if (/^[0-9]/.test(run)) ts.setAttribute('style', `font-family:${NUM_FONT};font-size:${NUM_K * 100}%;font-weight:400`);
    ts.textContent = run;
    t.appendChild(ts);
  }
  t._rich = String(str);
  return t;
}

/** Chart geometry for a view, in scope units around the centre. Bearings in degrees, clockwise from the top. */
function chartGeom(v, RM) {
  const it = v.items, n = it.length;
  const sum = it.reduce((s, x) => s + (x.share || 0), 0) || 1;
  const max = Math.max(1, ...it.map((x) => x.share || 0));
  if (v.kind === 'donut') {
    // a share of a whole: slices sized by share, the first starting at the top
    const r0 = RM * 0.3, r1 = RM * 0.86;
    let a = 0;
    return it.map((x, i) => {
      const sw = ((x.share || 0) / sum) * 360;
      const s = { i, a0: a, a1: a + sw, r0, r1, rl: (r0 + r1) / 2 };
      a += sw;
      return s;
    });
  }
  // rose (age): one equal sector per bracket, the first centred at the top; radius by the square root of the share, so area tells
  const sw = 360 / n, rMin = RM * 0.12, rMax = RM * 0.9;
  return it.map((x, i) => {
    const r1 = rMin + (rMax - rMin) * Math.sqrt((x.share || 0) / max);
    const inside = r1 > RM * 0.62;
    return { i, a0: i * sw - sw / 2, a1: i * sw + sw / 2, r0: 0, r1, rl: inside ? r1 * 0.62 : r1 + 8.5, inside };
  });
}

/* ====================================================================================================== */
/* the readout block: LCD, 7-segment window, VIEW rotary (same layout on the desktop unit and the mobile base) */
/* ====================================================================================================== */
const RO = { W: 128, H: 57, LX: 1.6, LY: 1.6, LW: 61, LH: 53.8, SX: 68.4, SY: 1.6, SW: 58, SH: 18.4, RX: 75.6, RY: 44.6, RR: 6.2, TX: 88.6, TY0: 37.4, TDY: 5.4 };

function drawReadout(K, iso, grp, rp, ox, oy, o) {
  const { g, el, face, txt, shift, rrect, circle, MAT } = iso;
  const X = (x) => ox + x, Y = (y) => oy + y;
  // LCD: bezel frame + glass
  grp.appendChild(K.recess(rrect(X(RO.LX - 1.6), Y(RO.LY - 1.6), RO.LW + 3.2, RO.LH + 3.2, 2.4), rp, 0.8, MAT.deep, { floorFill: 'var(--m-glass)' }));
  let lcdPl = null;
  const lcd = g();
  grp.appendChild(K.recess(rrect(X(RO.LX), Y(RO.LY), RO.LW, RO.LH, 1), rp, 1.3, MAT.glass, { floorFill: 'var(--lcd)', content: (pl) => { lcdPl = pl; lcd.setAttribute('transform', iso.matrix(pl)); return lcd; } }));
  // the 7-segment window
  const segWin = K.recess(rrect(X(RO.SX), Y(RO.SY), RO.SW, RO.SH, 1.8), rp, 1.3, MAT.deep, { floorFill: 'var(--m-glass)' });
  grp.appendChild(segWin);
  // VIEW rotary: ring, detent marks pointing at the four legends, the legends, the knob
  const rot = g();
  const labels = o.views.map((v, k) => txt(v.key, X(RO.TX), Y(RO.TY0 + k * RO.TDY), { size: o.mobile ? 3.55 : 3.4, fill: 'var(--t2)', ls: 0.3 }));
  const angs = o.views.map((v, k) => { const dx = RO.TX - 1.2 - RO.RX, dy = RO.TY0 + k * RO.TDY - 1.25 - RO.RY; return Math.atan2(dx, -dy) / D2R; });
  rot.appendChild(face(rp, [
    el('circle', { cx: X(RO.RX), cy: Y(RO.RY), r: RO.RR + 1.6, fill: 'none', class: 's3' }),
    el('path', { d: angs.map((deg) => { const q = deg * D2R; return `M${(X(RO.RX) + Math.sin(q) * (RO.RR + 2.3)).toFixed(2)} ${(Y(RO.RY) - Math.cos(q) * (RO.RR + 2.3)).toFixed(2)}L${(X(RO.RX) + Math.sin(q) * (RO.RR + 4.1)).toFixed(2)} ${(Y(RO.RY) - Math.cos(q) * (RO.RR + 4.1)).toFixed(2)}`; }).join(''), class: 's2' }),
    ...labels,
  ], 0.02));
  rot.appendChild(face(rp, [el('circle', { cx: X(RO.RX), cy: Y(RO.RY), r: RO.RR + 5, style: 'fill:var(--m-deep)', 'fill-opacity': 0 })], 0.05));
  const knobG = g();
  knobG.appendChild(K.prism(circle(X(RO.RX), Y(RO.RY), RO.RR, 40), shift(rp, 0, 0, 3.4), 3.4, MAT.metal, { base: circle(X(RO.RX), Y(RO.RY), RO.RR * 1.08, 40) }));
  const capPl = shift(rp, 0, 0, 3.4);
  // a flattened chicken-head pointer
  const ptr = g({}, [
    el('path', { d: iso.dpoly(rrect(X(RO.RX) - 1.25, Y(RO.RY) - RO.RR + 0.3, 2.5, RO.RR * 1.62, 1.2)), style: 'fill:color-mix(in oklab, var(--m-metal) 70%, var(--shade))', class: 'sf' }),
    el('path', { d: `M${X(RO.RX)} ${Y(RO.RY) - RO.RR + 1.1} L${X(RO.RX)} ${Y(RO.RY) - 1.4}`, style: 'stroke:var(--m-paper)', 'stroke-width': 0.65, 'stroke-linecap': 'round', class: 'f' }),
  ]);
  knobG.appendChild(face(capPl, [ptr], 0.03));
  rot.appendChild(knobG);
  grp.appendChild(rot);
  return {
    lcd, get lcdPl() { return lcdPl; }, segWin, rot, knobG, ptr, labels, angs,
    LX: X(RO.LX), LY: Y(RO.LY), LW: RO.LW, LH: RO.LH, SX: X(RO.SX), SY: Y(RO.SY), SW: RO.SW, SH: RO.SH,
    RX: X(RO.RX), RY: Y(RO.RY), RR: RO.RR, TX: X(RO.TX), TY0: Y(RO.TY0), TDY: RO.TDY,
    setView(k) { ptr.setAttribute('transform', `rotate(${angs[k].toFixed(1)} ${X(RO.RX)} ${Y(RO.RY)})`); labels.forEach((t, j) => { t.style.fill = j === k ? 'var(--t1)' : 'var(--t2)'; t.style.fontWeight = j === k ? 600 : 400; }); },
  };
}

/* ====================================================================================================== */
/* the hardware (shared by the section and the hero)                                                       */
/* ====================================================================================================== */
function drawConsole(K, iso, root, o) {
  const { g, el, face, txt, plane, shift, rrect, circle, MAT, P, add, mul } = iso;
  const HERO = !!o.hero, SPLIT = !!o.split;
  const part = () => { const p = g({ class: 'part' }); root.appendChild(p); return p; };
  const blur = (sd) => { const id = K.id('sblur'); K.def(el('filter', { id, filterUnits: 'userSpaceOnUse', x: -2000, y: -2000, width: 4000, height: 4000 }, [el('feGaussianBlur', { stdDeviation: sd })])); return id; };
  // the console is turned by PHI about the vertical, so its panels read almost square-on
  const PHI = 34 * D2R;
  const ex = [Math.cos(PHI), -Math.sin(PHI), 0], ey = [Math.sin(PHI), Math.cos(PHI), 0];
  const Wp = (a, b, c = 0) => [ex[0] * a + ey[0] * b, ex[1] * a + ey[1] * b, c];
  const TB = (a, b, z) => plane(Wp(a, b, z), ex, ey);              // a horizontal plane in the console frame
  const FY = (b, a, z) => plane(Wp(a, b, z), ex, [0, 0, -1]);      // a front-facing plane (+b)
  const FX = (a, b, z) => plane(Wp(a, b, z), mul(ey, -1), [0, 0, -1]); // a right-facing plane (+a); its a runs front → back

  /* ---------------- dimensions ---------------- */
  // desktop: the readout is its own unit beside the console; mobile (and the hero tile on a phone): it is set into the base
  const W = 132, D = 98, L = 11;
  const TH = 58 * D2R, SL = 128;
  const SH = SL * Math.sin(TH), SD = SL * Math.cos(TH);
  const yS = D - L - SD;
  const TSH = 29;                                            // the toggle strip
  const HB = SPLIT ? 5 + 3.5 + TSH + 3.5 : 5 + 3.5 + RO.H + 4.5 + TSH + 3.5;
  const ZT = HB + SH;
  const pnl = plane(Wp(0, yS, ZT), ex, add(mul(ey, Math.cos(TH)), [0, 0, -Math.sin(TH)])); // a = across, b = down the slope
  const SCX = W / 2, SCY = 62, RB = 56, RG = 45, GD = 2.4, RC = RG - 2.2;
  const UW = RO.W + 10, UD = 46, UH = RO.H + 9 + 4, UA = -(UW + 22), UB = D - UD - 2; // the readout unit (desktop)

  /* ---------------- shadows ---------------- */
  const shG = part();
  const foot = (x, y, w, d, pad, r, op, sd) => el('path', { d: iso.dpoly(rrect(x - pad, y - pad, w + pad * 2, d + pad * 2, r, 6).map(([a, b]) => P(Wp(a, b, 0)))), style: 'fill:var(--shadow)', class: 'shadow', opacity: op, filter: `url(#${blur(sd)})` });
  shG.appendChild(foot(0, 0, W, D, 8, 12, 0.75, 11));
  shG.appendChild(foot(0, 0, W, D, 2, 4, 0.5, 3));
  if (SPLIT) { shG.appendChild(foot(UA, UB, UW, UD, 7, 10, 0.7, 9)); shG.appendChild(foot(UA, UB, UW, UD, 1.5, 4, 0.5, 2.5)); }

  /* ---------------- the readout unit (desktop): left of the console, so it is drawn first ---------------- */
  let ro;
  if (SPLIT) {
    const unitG = part();
    unitG.appendChild(K.prism(rrect(UA + 3, UB + 3, UW - 6, UD - 6, 3), TB(0, 0, 4), 4, MAT.deep));
    unitG.appendChild(K.prism(rrect(UA, UB, UW, UD, 3, 4), TB(0, 0, UH), UH - 4, MAT.shell));
    const uTop = TB(UA, UB, UH), uFx = FX(UA + UW, UB + UD, UH);
    unitG.appendChild(face(uTop, [el('path', { d: iso.dpoly(rrect(3, 3, UW - 6, UD - 6, 2.5)), class: 's3' })], 0.02));
    if (!HERO) {
      unitG.appendChild(K.slots(uTop, 10, 9, 40, UD - 18, 14));
      unitG.appendChild(K.slots(uTop, UW - 50, 9, 40, UD - 18, 14));
      unitG.appendChild(K.slots(uFx, 10, 12, 22, 30, 8));
      unitG.appendChild(K.recess(rrect(UD - 13, UH - 22, 8, 8, 4), uFx, 1.2, MAT.deep));
      unitG.appendChild(face(uFx, [el('circle', { cx: UD - 9, cy: UH - 18, r: 2.1, style: 'fill:var(--m-rubber)', class: 'sf' })], 0.02));
      for (const [a, b] of [[4, 4], [UD - 4, 4], [4, UH - 10], [UD - 4, UH - 10]]) unitG.appendChild(K.screw(uFx, a, b, 1.2));
      // its cable runs across the desk and under the console
      unitG.appendChild(K.tube([Wp(UA + UW + 0.4, UB + 9, 18), Wp(UA + UW + 5, UB + 8, 6), Wp(UA + UW + 9, UB + 10, 1.3), Wp(-12, UB + 16, 1.3), Wp(8, UB + 18, 1.3)], 2, 'var(--m-rubber)'));
    }
    const rp = FY(UB + UD, UA, UH);
    unitG.appendChild(face(rp, [el('path', { d: `M3 ${UH - 6.8} L${UW - 3} ${UH - 6.8}`, class: 's3' })], 0.02));
    for (const [a, b] of [[3.2, 3], [UW - 3.2, 3]]) unitG.appendChild(K.screw(rp, a, b, 1.1));
    const roG = part();
    ro = drawReadout(K, iso, roG, rp, 5, 4.4, o);
    ro.rp = rp;
  }

  /* ---------------- base ---------------- */
  const baseG = part();
  baseG.appendChild(K.prism(rrect(4, 4, W - 8, D - 8, 3), TB(0, 0, 5), 5, MAT.deep));
  baseG.appendChild(K.prism(rrect(0, 0, W, D, 2.5, 4), TB(0, 0, HB), HB - 5, MAT.shell));
  const fyB = FY(D, 0, HB);   // the base front: a across (0..W), b down from the top (0..HB-5)
  const fxB = FX(W, D, HB);   // right side: a from the front (0..D), b down
  baseG.appendChild(face(fyB, [el('path', { d: `M3 ${HB - 6.8} L${W - 3} ${HB - 6.8}`, class: 's3' })], 0.02));
  if (!HERO) {
    baseG.appendChild(K.slots(fxB, 14, 6, 40, Math.min(HB - 14, 26), 14));
    for (const [a, b] of [[4, 4], [D - 4, 4], [4, HB - 11], [D - 4, HB - 11]]) baseG.appendChild(K.screw(fxB, a, b, 1.3));
  }
  if (!SPLIT) {
    const roG = part();
    ro = drawReadout(K, iso, roG, fyB, 2, 3.5, o);
    ro.rp = fyB;
  }

  /* ---------------- role toggles: a recessed strip along the base front ---------------- */
  const tsY = SPLIT ? 3.5 : 3.5 + RO.H + 4.5;
  const togG = part();
  togG.appendChild(K.recess(rrect(5, tsY, W - 10, TSH, 3), fyB, 1.2, MAT.deep));
  const TY = tsY + 10.2;
  const hexagon = (cx, cy, r) => [0, 1, 2, 3, 4, 5].map((i) => [cx + r * Math.cos(i * Math.PI / 3), cy + r * Math.sin(i * Math.PI / 3)]);
  const toggles = o.roles.map((r, i) => {
    const a = 20 + i * ((W - 40) / 3);
    const grp = g();
    grp.appendChild(face(fyB, [el('rect', { x: a - 14.5, y: tsY + 0.8, width: 29, height: TSH - 1.6, style: 'fill:var(--m-deep)', 'fill-opacity': 0 })], 0.05));
    grp.appendChild(face(fyB, [
      el('path', { d: iso.dpoly(rrect(a - 5.6, TY - 5.4, 11.2, 13.6, 2)), class: 's3' }),
      txt('ON', a + 3.9, TY - 3.1, { size: 1.9, fill: 'var(--t2)', ls: 0.15 }),
    ], 0.03));
    grp.appendChild(K.prism(hexagon(a, TY, 2.8), shift(fyB, 0, 0, 1.3), 1.3, MAT.metal));
    grp.appendChild(K.prism(circle(a, TY, 1.6, 18), shift(fyB, 0, 0, 3.4), 2.1, { v: 'metal', amb: 0.34 }));
    const lever = K.tube([[0, 0, 0], [1, 1, 1]], 1.3, 'color-mix(in oklab, var(--m-metal) 80%, var(--shade))');
    const ball = el('circle', { r: 1.25, style: 'fill:var(--m-metal)', class: 'sf' });
    grp.appendChild(lever); grp.appendChild(ball);
    const led = el('circle', { cx: a, cy: tsY + 3.3, r: 1.05, style: 'fill:var(--m-deep)', class: 'sf' });
    const ledGlow = el('circle', { cx: a, cy: tsY + 3.3, r: 2.9, style: 'fill:var(--m-accent)', opacity: 0, filter: `url(#${K.glowId})` });
    const legend = txt(LEGEND[r.label] || r.label.toUpperCase(), a, tsY + TSH - 2.6, { size: o.mobile ? 3.55 : 3.3, anchor: 'middle', fill: 'var(--t2)', ls: 0.22 });
    grp.appendChild(face(fyB, [ledGlow, led, legend], 0.04));
    togG.appendChild(grp);
    const t = { i, a, grp, lever, ball, led, ledGlow, legend, k: 1 };
    return t;
  });
  // lever: a bat handle out of the bushing, thrown well up or down so it reads at this angle
  function setLever(t, k) {
    t.k = k;
    const base3 = iso.at(fyB, t.a, TY, 3.4);
    const ang = (66 * k) * D2R;
    const dir = add(mul(ey, Math.cos(ang)), [0, 0, Math.sin(ang)]);
    const tip = add(base3, mul(dir, 7));
    const d = iso.dpoly([P(base3), P(tip)], false);
    t.lever.querySelectorAll('path').forEach((p) => p.setAttribute('d', d));
    const [bx, by] = P(tip);
    t.ball.setAttribute('cx', bx.toFixed(2)); t.ball.setAttribute('cy', by.toFixed(2));
  }
  toggles.forEach((t) => setLever(t, 1));
  if (!SPLIT && !HERO) baseG.appendChild(face(fyB, [el('path', { d: `M4 ${tsY - 2.2} L${W - 4} ${tsY - 2.2}`, class: 's3' })], 0.02));

  /* ---------------- wedge + scope panel ---------------- */
  const wedgeG = part();
  const wedge = K.prism([[L, SH], [L + SD, 0], [D, 0], [D, SH]], FX(W, D, ZT), W, MAT.shell);
  wedgeG.appendChild(wedge);
  const wfx = wedge.pl; // right side cap: a = D - b (front → back), b = ZT - z
  wedgeG.appendChild(face(pnl, [el('path', { d: iso.dpoly(rrect(3, 3, W - 6, SL - 6, 4)), class: 's3' })], 0.02));
  wedgeG.appendChild(face(wfx, [el('path', { d: `M${L + SD + 4} 6 L${D - 4} 6 L${D - 4} ${SH - 4} L${L + 6} ${SH - 4}`, class: 's3' })], 0.02));
  if (!HERO) {
    wedgeG.appendChild(K.recess(rrect(L + SD - 4, 26, 22, 44, 2.5), wfx, 1.2, MAT.deep));
    wedgeG.appendChild(K.slots(wfx, L + SD - 1, 29.5, 16, 37, 11, { vertical: false }));
    for (const [a, b] of [[L + SD + 6, 4.5], [D - 4.5, 4.5], [D - 4.5, SH - 6], [L + 8, SH - 6]]) wedgeG.appendChild(K.screw(wfx, a, b, 1.3));
    wedgeG.appendChild(face(wfx, [
      el('path', { d: `M${D - 20} ${SH - 22} l4 2.3 l0 4.6 l-4 2.3 l-4 -2.3 l0 -4.6 Z`, class: 's' }),
      el('path', { d: `M${D - 20} ${SH - 17.4} l4 -2.3 M${D - 20} ${SH - 17.4} l-4 -2.3 M${D - 20} ${SH - 17.4} l0 4.6`, class: 's2' }),
    ], 0.02));
    const topPl = TB(0, 0, ZT);
    wedgeG.appendChild(K.slots(topPl, 8, 3, 30, yS - 6, 10));
    wedgeG.appendChild(K.slots(topPl, W - 38, 3, 30, yS - 6, 10));
  }
  for (const [a, b] of [[7, 7], [W - 7, 7]]) wedgeG.appendChild(K.screw(pnl, a, b, 1.4));
  // power LED, top right of the panel
  const pled = el('circle', { cx: W - 15, cy: 7, r: 1.1, style: 'fill:var(--m-deep)', class: 'sf' });
  const pledGlow = el('circle', { cx: W - 15, cy: 7, r: 3, style: 'fill:var(--m-accent)', opacity: 0, filter: `url(#${K.glowId})` });
  wedgeG.appendChild(face(pnl, [pledGlow, pled], 0.03));

  /* ---------------- scope: the bearing dial (knurled bezel) + glass ---------------- */
  const scopeG = part();
  const HZ = 3.4;
  scopeG.appendChild(K.prism(circle(SCX, SCY, RB, 96), shift(pnl, 0, 0, HZ), HZ, MAT.body2));
  const bzTop = shift(pnl, 0, 0, HZ);
  const pt = (deg, r) => { const a = deg * D2R; return `${(SCX + Math.sin(a) * r).toFixed(2)} ${(SCY - Math.cos(a) * r).toFixed(2)}`; };
  const knurl = [], minor = [], mid = [], major = [];
  if (!HERO) for (let i = 0; i < 144; i++) knurl.push(`M${pt(i * 2.5, RB - 2.5)}L${pt(i * 2.5, RB - 0.5)}`);
  else for (let i = 0; i < 72; i++) knurl.push(`M${pt(i * 5, RB - 2.5)}L${pt(i * 5, RB - 0.5)}`);
  for (let d = 0; d < 360; d += 5) {
    const r1 = d % 30 === 0 ? RG + 4.4 : d % 10 === 0 ? RG + 3.2 : RG + 2.2;
    if (HERO && d % 10) continue;
    (d % 30 === 0 ? major : d % 10 === 0 ? mid : minor).push(`M${pt(d, RG + 1.1)}L${pt(d, r1)}`);
  }
  const nums = [];
  for (let d = 0; d < 360; d += 30) { const a = d * D2R, r = RG + 6.85; nums.push(txt(String(d).padStart(3, '0'), SCX + Math.sin(a) * r, SCY - Math.cos(a) * r + 1, { size: 2.7, anchor: 'middle', fill: 'var(--t2)', ls: 0.15 })); }
  scopeG.appendChild(face(bzTop, [
    el('path', { d: knurl.join(''), class: 's3' }),
    el('path', { d: iso.dpoly(circle(SCX, SCY, RB - 2.9, 96)), class: 's3' }),
    el('path', { d: minor.join('') || 'M0 0', class: 's3' }),
    el('path', { d: mid.join(''), class: 's2' }),
    el('path', { d: major.join(''), class: 's' }),
    ...nums,
  ], 0.02));
  // the bearing index: a pointer that rides the dial with the sweep
  const idxRot = g();
  idxRot.appendChild(el('path', { d: `M${SCX} ${SCY - RG - 0.6} L${SCX - 1.6} ${SCY - RG - 3.5} L${SCX + 1.6} ${SCY - RG - 3.5} Z`, style: 'fill:var(--m-accent)', class: 'f' }));
  scopeG.appendChild(face(bzTop, [idxRot], 0.04));
  let scrPl = null;
  const scopeIn = g();
  scopeG.appendChild(K.recess(circle(SCX, SCY, RG, 96), bzTop, GD, MAT.deep, {
    floorFill: 'var(--phos-ink)',
    content: (pl) => { scrPl = pl; scopeIn.setAttribute('transform', iso.matrix(pl)); return scopeIn; },
  }));

  /* ---------------- panel knobs: GAIN, RANGE ---------------- */
  const knobsG = part();
  function knob(a, b, r, h, label) {
    const grp = g();
    const dots = g();
    grp.appendChild(face(pnl, [el('circle', { cx: a, cy: b, r: r + 1.6, fill: 'none', class: 's3' }), dots], 0.02));
    const kn = g();
    kn.appendChild(K.prism(circle(a, b, r, 40), shift(pnl, 0, 0, h), h, MAT.metal, { base: circle(a, b, r * 1.08, 40) }));
    const capPl = shift(pnl, 0, 0, h);
    kn.appendChild(face(capPl, [el('circle', { cx: a, cy: b, r: r * 0.72, fill: 'none', class: 's3' })], 0.02));
    const ptr = g({}, [el('path', { d: `M${a} ${b - r * 0.22} L${a} ${b - r * 0.9}`, style: 'stroke:var(--m-paper)', 'stroke-width': 0.75, 'stroke-linecap': 'round', class: 'f' })]);
    kn.appendChild(face(capPl, [ptr], 0.03));
    grp.appendChild(kn);
    grp.appendChild(face(pnl, [txt(label, a, b + r + 7.4, { size: o.mobile ? 3.5 : 3.25, anchor: 'middle', fill: 'var(--t2)', ls: 0.3 })], 0.02));
    const k = {
      grp, kn, a, b, r, dots, deg: 0,
      set(deg) { k.deg = deg; ptr.setAttribute('transform', `rotate(${deg.toFixed(1)} ${a} ${b})`); },
      marks(degs, on, names) {
        const kids = degs.map((deg, i) => { const q = deg * D2R; return el('circle', { cx: (a + Math.sin(q) * (r + 3.1)).toFixed(2), cy: (b - Math.cos(q) * (r + 3.1)).toFixed(2), r: i === on ? 0.62 : 0.42, style: `fill:${i === on ? 'var(--t1)' : 'var(--t2)'}` }); });
        if (names) degs.forEach((deg, i) => { const q = deg * D2R, rr = r + (names[i].length > 1 ? 6.6 : 5.6); kids.push(txt(names[i], a + Math.sin(q) * rr, b - Math.cos(q) * rr + 0.85, { size: 2.3, anchor: 'middle', fill: i === on ? 'var(--t1)' : 'var(--t2)', ls: 0.1 })); });
        dots.replaceChildren(...kids);
      },
    };
    return k;
  }
  const gainK = knob(13, 112, 5.4, 3.6, 'GAIN');
  const rangeK = knob(W - 13, 112, 5.4, 3.6, 'RANGE');
  knobsG.appendChild(gainK.grp); knobsG.appendChild(rangeK.grp);

  /* ---------------- armrest ---------------- */
  const armG = part();
  armG.appendChild(K.prism(rrect(0.6, 0, L - 2.2, 5, 2.4, 6), FX(W, D, HB + 5), W, MAT.rubber));

  /* ---------------- antenna (turns with the sweep) ---------------- */
  const antG = part();
  const AX = W / 2, AY = yS / 2 + 0.4;
  const aC = Wp(AX, AY, 0);
  antG.appendChild(K.cyl(aC[0], aC[1], ZT, 5.8, 3, MAT.body2));
  antG.appendChild(K.cyl(aC[0], aC[1], ZT + 3, 3.4, 3.9, MAT.metal));
  antG.appendChild(K.cyl(aC[0], aC[1], ZT + 6.9, 1.9, 2.9, MAT.key));
  const barG = g();
  antG.appendChild(barG);
  const BAR_Z = ZT + 11.8;
  function drawBar(deg) {
    const q = deg * D2R, cs = Math.cos(q), sn = Math.sin(q);
    const out = rrect(-23, -2.7, 46, 5.4, 2.7, 4).map(([x, y]) => [x * cs - y * sn, x * sn + y * cs]);
    const pr = K.prism(out, iso.top(BAR_Z, aC[0], aC[1]), 3.5, MAT.body2);
    const sl = [];
    if (!HERO) for (let i = -8; i <= 8; i++) { if (!i) continue; const x = i * 2.4; const p0 = [x * cs + 0.9 * sn, x * sn - 0.9 * cs], p1 = [x * cs - 0.9 * sn, x * sn + 0.9 * cs]; sl.push(`M${p0[0].toFixed(2)} ${p0[1].toFixed(2)}L${p1[0].toFixed(2)} ${p1[1].toFixed(2)}`); }
    barG.replaceChildren(pr, sl.length ? face(iso.top(BAR_Z, aC[0], aC[1]), [el('path', { d: sl.join(''), class: 's3' })], 0.02) : g());
  }
  drawBar(90 + 32);

  return { shG, pnl, bzTop, get scrPl() { return scrPl; }, scopeG, scopeIn, idxRot, drawBar, ro, toggles, setLever, gainK, rangeK, pled, pledGlow, SCX, SCY, RB, RG, RC, fyB, W };
}

/* ---------------- 7-segment display (theme colours) ---------------- */
const SEGS = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg', '-': 'g', ' ': '' };
function sevenSeg(K, iso, pl, x, y, n, cw, ch, pitch, t) {
  const { g, el, face } = iso;
  const seg7 = () => {
    const ht = t / 2, gp = t * 0.22;
    const H = (x0, x1, yc) => [[x0, yc], [x0 + ht, yc - ht], [x1 - ht, yc - ht], [x1, yc], [x1 - ht, yc + ht], [x0 + ht, yc + ht]];
    const V = (xc, y0, y1) => [[xc, y0], [xc + ht, y0 + ht], [xc + ht, y1 - ht], [xc, y1], [xc - ht, y1 - ht], [xc - ht, y0 + ht]];
    const xl = ht, xr = cw - ht, yt = ht, ym = ch / 2, yb = ch - ht;
    return { a: H(xl + gp, xr - gp, yt), g: H(xl + gp, xr - gp, ym), d: H(xl + gp, xr - gp, yb), f: V(xl, yt + gp, ym - gp), b: V(xr, yt + gp, ym - gp), e: V(xl, ym + gp, yb - gp), c: V(xr, ym + gp, yb - gp) };
  };
  const OFF = 'color-mix(in oklab, var(--m-glass) 84%, var(--phos))', ON = 'var(--phos)';
  const glowF = K.blurFilter(0.9);
  const lit = g(), glow = g({ filter: `url(#${glowF})`, opacity: 0.7 });
  const digits = [];
  for (let i = 0; i < n; i++) {
    const s = seg7();
    const tf = `translate(${x + i * pitch} ${y}) skewX(-7)`;
    const dl = g({ transform: tf }), dg = g({ transform: tf });
    const segs = {};
    for (const k of 'abcdefg') { const d = iso.dpoly(s[k]); const p = el('path', { d, style: `fill:${OFF}`, class: 'f' }); const q = el('path', { d, style: `fill:${ON}`, opacity: 0 }); dl.appendChild(p); dg.appendChild(q); segs[k] = [p, q]; }
    const dp = [el('circle', { cx: cw + t * 0.75, cy: ch - t * 0.5, r: t * 0.55, style: `fill:${OFF}`, class: 'f' }), el('circle', { cx: cw + t * 0.75, cy: ch - t * 0.5, r: t * 0.55, style: `fill:${ON}`, opacity: 0 })];
    dl.appendChild(dp[0]); dg.appendChild(dp[1]);
    segs.dp = dp;
    lit.appendChild(dl); glow.appendChild(dg);
    digits.push(segs);
  }
  const light = ([p, q], v) => { p.style.fill = v ? ON : OFF; q.setAttribute('opacity', v ? 0.75 : 0); };
  let last = null;
  return {
    node: face(pl, [lit, glow], 0.02),
    set(str) {
      if (str === last) return; last = str;
      const cells = [];
      for (const c of String(str)) { if (c === '.' && cells.length) cells[cells.length - 1].dp = true; else cells.push({ ch: c, dp: false }); }
      while (cells.length < n) cells.unshift({ ch: ' ', dp: false });
      cells.slice(-n).forEach((c, i) => { const on = SEGS[c.ch] ?? ''; for (const k of 'abcdefg') light(digits[i][k], on.includes(k)); light(digits[i].dp, c.dp); });
    },
  };
}

/** The headline: three digits, a unit (K or %) and a caption under the window. */
function makeHeadline(K, iso, ro, o) {
  const { g, face, txt } = iso;
  const CW = 8.6, CH = 12.6, PITCH = 11, T = 1.5;
  const blockW = 2 * PITCH + CW, unitW = 5.2;
  const x0 = ro.SX + (ro.SW - (blockW + 2.6 + unitW)) / 2, y0 = ro.SY + (ro.SH - CH) / 2;
  const seg = sevenSeg(K, iso, ro.segWin.floor, x0, y0, 3, CW, CH, PITCH, T);
  const unit = txt('', x0 + blockW + 2.6, y0 + CH - 0.15, { size: 6.2, fill: 'var(--phos)', font: 'Silkscreen' });
  const cap = txt('', ro.SX + ro.SW / 2, ro.SY + ro.SH + 6.3, { size: o.mobile ? 4.9 : 4.6, anchor: 'middle', fill: 'var(--t1)', font: 'Pixelify Sans', weight: 500 });
  const node = g({}, [seg.node, face(ro.segWin.floor, [unit], 0.03), face(ro.rp, [cap], 0.03)]);
  return {
    node,
    set(h) {
      if (!h) { seg.set('   '); unit.textContent = ''; cap.textContent = ''; return; }
      seg.set(h.num); unit.textContent = h.unit; setRich(cap, h.cap);
      try { let fs = o.mobile ? 4.9 : 4.6; cap.setAttribute('font-size', fs); while (fs > 3.2 && cap.getComputedTextLength() > ro.SW + 2) { fs -= 0.15; cap.setAttribute('font-size', fs.toFixed(2)); } } catch (e) {}
    },
  };
}

/* ---------------- the readout LCD: the view's items, shares and a meter each ---------------- */
function makeLCD(K, iso, ro, o) {
  const { g, el, txt } = iso;
  const { LX: X, LY: Y, LW: Wd, LH: Ht } = ro;
  const INK = 'var(--lcd-ink)', BG = 'var(--lcd)';
  const MOB = !!o.mobile;
  const pix = (s, x, y, op = {}) => txt(s, x, y, { font: 'Pixelify Sans', fill: INK, ...op });
  const num = (s, x, y, op = {}) => txt(s, x, y, { font: 'Silkscreen', fill: INK, ...op, size: (op.size || 4) * NUM_K, weight: 400 });
  const off = el('rect', { x: X, y: Y, width: Wd, height: Ht, style: 'fill:var(--m-glass)' });
  const lit = g({ opacity: 0 });
  ro.lcd.appendChild(off); ro.lcd.appendChild(lit);
  const HDR = 7;
  lit.appendChild(el('rect', { x: X, y: Y, width: Wd, height: HDR, style: `fill:${INK}` }));
  const head = txt('', X + 2.4, Y + HDR - 1.85, { size: MOB ? 4.9 : 4.5, fill: BG, font: 'Pixelify Sans', weight: 600 });
  const headR = txt('', X + Wd - 2.4, Y + HDR - 1.85, { size: MOB ? 4.1 : 3.8, fill: BG, font: 'Pixelify Sans', anchor: 'end' });
  lit.appendChild(head); lit.appendChild(headR);
  const rowsG = g();
  lit.appendChild(rowsG);
  lit.appendChild(el('rect', { x: X, y: Y, width: Wd, height: Ht, fill: o.vignette, 'pointer-events': 'none' }));
  const FS = MOB ? 5.2 : 4.75;
  let rows = [];
  const fit = (t, maxW, base, min) => {
    let fs = base; t.setAttribute('font-size', fs);
    try { while (fs > min && t.getComputedTextLength() > maxW) { fs = Math.max(min, fs - 0.12); t.setAttribute('font-size', fs.toFixed(2)); } } catch (e) {}
    let s = t._rich ?? t.textContent;
    try { while (s.length > 3 && t.getComputedTextLength() > maxW) { s = s.slice(0, -2) + '…'; setRich(t, s); } } catch (e) {}
  };
  return {
    off, lit, HDR,
    get rows() { return rows; },
    setView(v, total) {
      head.textContent = v.title;
      setRich(headR, `of ${total.text}`);
      const n = v.items.length;
      const RH = Math.min(n <= 2 ? 17 : 12.5, (Ht - HDR - 1.4) / n);
      const fs = n <= 2 ? FS * 1.3 : n <= 3 ? FS * 1.14 : FS;
      const max = Math.max(1, ...v.items.map((x) => x.share || 0));
      rowsG.replaceChildren();
      rows = v.items.map((it, i) => {
        const y = Y + HDR + 0.7 + i * RH;
        const base = y + (RH - 2.5) / 2 + fs * 0.37;
        const bar = el('rect', { x: X + 0.8, y: y + 0.25, width: Wd - 1.6, height: RH - 0.5, rx: 0.6, style: `fill:${INK}`, opacity: 0 });
        const nx = v.id === 'countries' ? X + 7.2 : X + 2.6;
        const rank = v.id === 'countries' ? num(String(i + 1), X + 2.6, base, { size: fs }) : null;
        const share = num(it.share != null ? `${it.share}%` : '--', X + Wd - 2.5, base, { size: fs, anchor: 'end' });
        const name = setRich(pix('', nx, base, { size: fs }), it.label);
        const mW = (X + Wd - 2.5) - nx;
        // a full-width track under each row ties the share on the right to its name, the meter shows the share
        const mh = n <= 2 ? 1.5 : 1.1, my = base + fs * 0.28;
        const track = el('rect', { x: nx, y: (my + mh / 2 - 0.16).toFixed(2), width: mW.toFixed(2), height: 0.32, style: `fill:${INK}`, opacity: 0.3 });
        const meter = el('rect', { x: nx, y: my.toFixed(2), width: Math.max(0.8, (mW * (it.share || 0)) / max).toFixed(2), height: mh, style: `fill:${INK}`, opacity: 0.9 });
        const grp = g({}, [bar, rank, name, share, track, meter].filter(Boolean));
        rowsG.appendChild(grp);
        return { it, i, y, h: RH, bar, rank, name, share, track, meter, grp, nx, fs };
      });
      // fit the names beside their shares
      rows.forEach((r) => { let sw = 9; try { sw = r.share.getComputedTextLength(); } catch (e) {} fit(r.name, X + Wd - 2.5 - sw - 2.2 - r.nx, r.fs, r.fs * 0.8); });
    },
    update(sel, mix) {
      rows.forEach((r) => {
        const on = r.i === sel;
        r.bar.setAttribute('opacity', on ? 1 : 0);
        const c = on ? BG : INK;
        [r.rank, r.name, r.share].forEach((t) => t && (t.style.fill = c));
        r.meter.style.fill = c; r.track.style.fill = c;
        const dim = mix && !mix[r.i];
        r.grp.setAttribute('opacity', dim && !on ? 0.32 : 1);
      });
    },
  };
}

/** Place each contact's label where it fits inside the scope and clear of the others. */
function placeLabels(items, RM, cx, cy) {
  const placed = [];
  const blips = items.map((it) => ({ x: cx + it.x, y: cy + it.y }));
  const inside = (b) => [[b.x0, b.y0], [b.x1, b.y0], [b.x0, b.y1], [b.x1, b.y1]].every(([x, y]) => Math.hypot(x - cx, y - cy) < RM - 0.8);
  const hits = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
  for (const it of items) {
    const bx = cx + it.x, by = cy + it.y, w = it.w, h = it.h, gp = 2.4;
    const C = [
      { x: bx + gp, y: by + h * 0.36, a: 'start' }, { x: bx - gp, y: by + h * 0.36, a: 'end' },
      { x: bx + 1.2, y: by - gp, a: 'start' }, { x: bx + 1.2, y: by + gp + h * 0.75, a: 'start' },
      { x: bx - 1.2, y: by - gp, a: 'end' }, { x: bx - 1.2, y: by + gp + h * 0.75, a: 'end' },
      { x: bx, y: by - gp - 0.6, a: 'middle' }, { x: bx, y: by + gp + h * 0.8, a: 'middle' },
    ];
    let best = null, bs = 1e9;
    C.forEach((c, k) => {
      const x0 = c.a === 'start' ? c.x : c.a === 'end' ? c.x - w : c.x - w / 2;
      const box = { x0: x0 - 0.4, x1: x0 + w + 0.4, y0: c.y - h * 0.78, y1: c.y + h * 0.18 };
      let s = k * 0.6;
      if (!inside(box)) s += 100;
      for (const p of placed) if (hits(box, p)) s += 60;
      for (const b of blips) if (b.x > box.x0 - 1.6 && b.x < box.x1 + 1.6 && b.y > box.y0 - 1.6 && b.y < box.y1 + 1.6) s += 40;
      if (s < bs) { bs = s; best = { ...c, box }; }
    });
    placed.push(best.box);
    it.label = best;
  }
}

/** Two-line chart labels (name over share), pulled in until they sit inside the scope. */
function chartLabelPos(geo, RM, w, h) {
  return geo.map((s) => {
    const m = ((s.a0 + s.a1) / 2) * D2R;
    let rl = s.rl, x = 0, y = 0;
    for (let k = 0; k < 30; k++) {
      x = Math.sin(m) * rl; y = -Math.cos(m) * rl;
      const ok = [[x - w[s.i] / 2, y - h / 2], [x + w[s.i] / 2, y - h / 2], [x - w[s.i] / 2, y + h / 2], [x + w[s.i] / 2, y + h / 2]].every(([px, py]) => Math.hypot(px, py) < RM - 1.2);
      if (ok) break;
      rl -= 0.8;
    }
    return { x, y };
  });
}

/** Frame the device on its body: the soft ground shadows may bleed into the padding. */
function fitBody(ctx, pad, skip) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of ctx.root.children) {
    if (!p.classList.contains('part') || skip.includes(p)) continue;
    let b; try { b = p.getBBox(); } catch (e) { continue; }
    if (!b.width && !b.height) continue;
    x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height);
  }
  if (!Number.isFinite(x0)) { ctx.fit(pad); return; }
  ctx.view(x0 - pad, y0 - pad, x1 - x0 + pad * 2, y1 - y0 + pad * 2);
}

/* ====================================================================================================== */
/* the section device                                                                                      */
/* ====================================================================================================== */
export default async function build(ctx) {
  const { K, iso, root, fore, sound, content } = ctx;
  const { g, el, txt, face, P, mul } = iso;
  const MOB = ctx.mobile, RED = ctx.reduced;
  try { await document.fonts?.ready; } catch (e) {}
  const wP = world();
  const AUD = audienceOf(content, ctx.data);
  const VIEWS = AUD.views;
  const ROLES_I = VIEWS.findIndex((v) => v.id === 'roles');
  const ROLES = ROLES_I >= 0 ? VIEWS[ROLES_I].items : [];
  const dev = drawConsole(K, iso, root, { mobile: MOB, split: !MOB, views: VIEWS, roles: ROLES });
  const ro = dev.ro;
  const vign = K.rgrad([[0.6, 'var(--lcd-ink)', 0], [1, 'var(--lcd-ink)', 0.12]], 0.5, 0.45, 0.85);
  const lcd = makeLCD(K, iso, ro, { mobile: MOB, vignette: vign });
  const headline = makeHeadline(K, iso, ro, { mobile: MOB });
  root.appendChild(g({ class: 'part' }, [headline.node]));
  headline.set(null);
  const { SCX, SCY, RC } = dev;
  const RM = RC - 1.4;

  /* ---------------- the scope picture: a canvas on the CRT floor ---------------- */
  const RES = MOB ? 8 : 9;
  const N = Math.round(2 * RC * RES), C0 = N / 2;
  const mk = () => { const c = document.createElement('canvas'); c.width = c.height = N; return c; };
  const cv = mk();
  Object.assign(cv.style, { width: 2 * RC + 'px', height: 2 * RC + 'px', borderRadius: '50%', opacity: '0', transition: 'opacity .7s ease', pointerEvents: 'none', background: 'transparent' });
  const c2 = cv.getContext('2d');
  const bgC = mk(), mapC = mk(), chartC = mk(), tmpC = mk(), vigC = mk();
  ctx.overlay(cv, dev.scrPl, SCX - RC, SCY - RC);

  // theme colours for the canvas
  const rgbOf = (s) => {
    s = (s || '').trim();
    if (s.startsWith('#')) { let h = s.slice(1); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); }
    const m = s.match(/rgba?\(([^)]+)\)/); if (m) return m[1].split(',').slice(0, 3).map((v) => parseFloat(v));
    return [214, 216, 206];
  };
  let COL = {};
  const readColours = () => { COL = { phos: rgbOf(ctx.themeColor('--phos')), bg: rgbOf(ctx.themeColor('--phos-ink')), acc: rgbOf(ctx.themeColor('--m-accent')) }; };
  const rgba = (c, a) => `rgba(${c.map((v) => Math.round(v)).join(',')},${a})`;
  readColours();

  // countries, as contacts on the map
  const vC = VIEWS.find((v) => v.kind === 'map');
  const CONT = (vC?.items || []).map((c, i) => { const [x, y] = project(c.lon, c.lat, RM); return { ...c, i, x, y, brg: bearingOf(x, y), hit: -1e9 }; });
  let geo = null;
  function renderMap() {
    const m = mapC.getContext('2d');
    m.clearRect(0, 0, N, N);
    if (!geo) return;
    m.save(); m.translate(C0, C0); m.scale(RES, RES);
    m.beginPath(); m.arc(0, 0, RM + 0.2, 0, Math.PI * 2); m.clip();
    const paths = [];
    for (const f of geo.features) {
      const gm = f.geometry; if (!gm) continue;
      const polys = gm.type === 'Polygon' ? [gm.coordinates] : gm.coordinates;
      for (const poly of polys) for (const ring of poly) {
        let near = false; const p = new Path2D();
        ring.forEach(([lo, la], i) => { const [x, y, c] = project(lo, la, RM); if (c < MAP_RANGE * 1.08) near = true; if (i) p.lineTo(x, y); else p.moveTo(x, y); });
        if (near) { p.closePath(); paths.push(p); }
      }
    }
    // stroke every country at double width, then fill them all, so the shared borders vanish into coastlines
    m.lineJoin = 'round';
    m.lineWidth = 0.6; m.strokeStyle = rgba(COL.phos, 0.95);
    paths.forEach((p) => m.stroke(p));
    m.fillStyle = `rgb(${COL.bg.map((v, k) => Math.round(v * 0.72 + COL.phos[k] * 0.28)).join(',')})`;
    paths.forEach((p) => m.fill(p));
    m.restore();
  }

  /* ---------------- state ---------------- */
  let power = false, viewI = 0, sel = -1, gainI = 1, theta = 32, dir = 1, auto = true, pendingGo = null;
  let dragging = false, manualUntil = 0, osdUntil = 0;
  const mix = ROLES.map(() => true);
  const GAINS = [0.45, 0.8, 1.2];
  const GAIN_DEG = [-50, 0, 50];
  const view = () => VIEWS[viewI];
  let GEO = [];      // chart slices of the current view
  let SLICE = [];    // their Path2D outlines, in canvas pixels

  function slicePath(s) {
    const p = new Path2D();
    const a0 = (s.a0 - 90) * D2R, a1 = (s.a1 - 90) * D2R;
    if (s.r0 > 0) { p.arc(C0, C0, s.r1 * RES, a0, a1); p.arc(C0, C0, s.r0 * RES, a1, a0, true); }
    else { p.moveTo(C0, C0); p.arc(C0, C0, s.r1 * RES, a0, a1); }
    p.closePath();
    return p;
  }
  const FILL = [0.5, 0.3, 0.42, 0.24, 0.36];
  function renderChart() {
    const m = chartC.getContext('2d');
    m.clearRect(0, 0, N, N);
    const v = view();
    if (v.kind === 'map') { GEO = []; SLICE = []; return; }
    GEO = chartGeom(v, RM);
    SLICE = GEO.map(slicePath);
    const gap = v.kind === 'donut' ? 0.9 : 0.6;
    GEO.forEach((s, i) => {
      const off = v.id === 'roles' && !mix[i];
      if (!off) { m.fillStyle = rgba(COL.phos, FILL[i % FILL.length]); m.fill(SLICE[i]); }
      // fine range arcs inside each slice, like radar returns
      m.save(); m.clip(SLICE[i]);
      m.strokeStyle = rgba(COL.phos, off ? 0.12 : 0.22); m.lineWidth = 0.18 * RES;
      for (let r = 2.2; r < s.r1; r += 2.2) { m.beginPath(); m.arc(C0, C0, r * RES, (s.a0 - 90) * D2R, (s.a1 - 90) * D2R); m.stroke(); }
      m.restore();
      m.lineJoin = 'round';
      m.setLineDash(off ? [0.9 * RES, 0.9 * RES] : []);
      m.strokeStyle = rgba(COL.phos, off ? 0.45 : 0.95); m.lineWidth = 0.3 * RES;
      m.stroke(SLICE[i]);
      m.setLineDash([]);
    });
    // separators: dark gaps between slices
    m.strokeStyle = rgba(COL.bg, 1); m.lineWidth = gap * RES;
    GEO.forEach((s) => { const q = s.a0 * D2R; m.beginPath(); m.moveTo(C0 + Math.sin(q) * s.r0 * RES, C0 - Math.cos(q) * s.r0 * RES); m.lineTo(C0 + Math.sin(q) * Math.max(s.r1, GEO[(s.i + GEO.length - 1) % GEO.length].r1) * RES, C0 - Math.cos(q) * Math.max(s.r1, GEO[(s.i + GEO.length - 1) % GEO.length].r1) * RES); m.stroke(); });
  }
  function renderBg() {
    const m = bgC.getContext('2d');
    m.clearRect(0, 0, N, N);
    m.save(); m.translate(C0, C0); m.scale(RES, RES);
    const gr = m.createRadialGradient(0, 0, 0, 0, 0, RC);
    gr.addColorStop(0, rgba(COL.bg.map((v, k) => v * 0.9 + COL.phos[k] * 0.1), 1)); gr.addColorStop(0.8, rgba(COL.bg, 1)); gr.addColorStop(1, rgba(COL.bg.map((v) => v * 0.7), 1));
    m.fillStyle = gr; m.fillRect(-RC, -RC, RC * 2, RC * 2);
    const gain = GAINS[gainI];
    const src = view().kind === 'map' ? mapC : chartC;
    m.globalAlpha = (RED ? 0.85 : view().kind === 'map' ? 0.34 : 0.62) * gain;
    m.drawImage(src, -RC, -RC, RC * 2, RC * 2);
    m.globalAlpha = 1;
    m.strokeStyle = rgba(COL.phos, 0.2 * gain); m.lineWidth = 0.22;
    for (let i = 1; i <= 3; i++) { m.beginPath(); m.arc(0, 0, (RM * i) / 3, 0, Math.PI * 2); m.stroke(); }
    m.setLineDash([0.5, 1.1]); m.strokeStyle = rgba(COL.phos, 0.13 * gain);
    for (let i = 0; i < 12; i++) { const a = i * 30 * D2R; m.beginPath(); m.moveTo(Math.sin(a) * 1.6, -Math.cos(a) * 1.6); m.lineTo(Math.sin(a) * RM, -Math.cos(a) * RM); m.stroke(); }
    m.setLineDash([]);
    m.strokeStyle = rgba(COL.phos, 0.22 * gain);
    for (let d = 0; d < 360; d += 10) { const a = d * D2R; m.beginPath(); m.moveTo(Math.sin(a) * (RM - 0.9), -Math.cos(a) * (RM - 0.9)); m.lineTo(Math.sin(a) * RM, -Math.cos(a) * RM); m.stroke(); }
    if (view().kind === 'map') { m.strokeStyle = rgba(COL.phos, 0.75); m.lineWidth = 0.26; m.beginPath(); m.moveTo(-1.3, 0); m.lineTo(1.3, 0); m.moveTo(0, -1.3); m.lineTo(0, 1.3); m.stroke(); }
    m.restore();
    const vv = vigC.getContext('2d');
    vv.clearRect(0, 0, N, N);
    const vg = vv.createRadialGradient(C0, C0, 0, C0, C0, C0);
    vg.addColorStop(0.64, rgba(COL.bg, 0)); vg.addColorStop(0.94, rgba(COL.bg.map((x) => x * 0.5), 0.45)); vg.addColorStop(1, rgba(COL.bg.map((x) => x * 0.4), 0.9));
    vv.fillStyle = vg; vv.fillRect(0, 0, N, N);
  }
  const rebuild = () => { readColours(); renderMap(); renderChart(); renderBg(); };

  /* ---------------- labels, lock brackets and messages (crisp SVG over the canvas) ---------------- */
  const osdG = g({ class: 'part', opacity: 0 });
  fore.appendChild(osdG);
  const LFS = MOB ? 5.4 : 4.9;
  const osd = face(dev.scrPl, [], 0);
  osdG.appendChild(osd);
  const labelsG = g();
  const lockBox = el('path', { d: '', fill: 'none', style: 'stroke:var(--m-accent)', 'stroke-width': 0.5, opacity: 0 });
  const OUT = 'paint-order:stroke;stroke:var(--phos-ink);stroke-width:1.1px;stroke-linejoin:round';
  // the on-screen message: a short pill in the lower third, like a TV's OSD
  const MSG_Y = SCY + RM * 0.64, MSG_FS = MOB ? 4.3 : 3.8;
  const msgG = g({ opacity: 0, style: 'transition:opacity .25s' });
  const msgBox = el('rect', { x: 0, y: 0, width: 0, height: 0, rx: 1.4, style: 'fill:var(--phos-ink);stroke:var(--phos)', 'fill-opacity': 0.9, 'stroke-width': 0.35 });
  const msg = txt('', SCX, MSG_Y, { size: MSG_FS, anchor: 'middle', fill: 'var(--phos)', font: 'Silkscreen', ls: 0.2 });
  msgG.appendChild(msgBox); msgG.appendChild(msg);
  const msgSub = txt('', SCX, SCY + 3.6, { size: MOB ? 4.6 : 4.2, anchor: 'middle', fill: 'var(--phos)', font: 'Pixelify Sans', style: OUT });
  osd.appendChild(labelsG); osd.appendChild(lockBox); osd.appendChild(msgSub); osd.appendChild(msgG);
  let labels = [];
  function buildLabels() {
    labelsG.replaceChildren();
    const v = view();
    if (v.kind === 'map') {
      labels = CONT.map((c) => {
        const t = setRich(txt('', 0, 0, { size: LFS, fill: 'var(--phos)', font: 'Pixelify Sans', weight: 500, style: OUT }), `${c.i + 1} ${c.short}`);
        labelsG.appendChild(t);
        return { t, nodes: [t] };
      });
      CONT.forEach((c, i) => { let w = 30; try { w = labels[i].t.getComputedTextLength(); } catch (e) {} c.w = w; c.h = LFS; });
      placeLabels(CONT, RM, SCX, SCY);
      CONT.forEach((c, i) => { const t = labels[i].t; t.setAttribute('x', c.label.x.toFixed(2)); t.setAttribute('y', c.label.y.toFixed(2)); t.setAttribute('text-anchor', c.label.a); });
      return;
    }
    const NFS = LFS * 0.92, SFS = LFS * 1.12;
    labels = v.items.map((it) => {
      const name = setRich(txt('', 0, 0, { size: NFS, anchor: 'middle', fill: 'var(--phos)', font: 'Pixelify Sans', weight: 500, style: OUT }), it.short);
      const share = txt(it.share != null ? `${it.share}%` : '--', 0, 0, { size: SFS * NUM_K, anchor: 'middle', fill: 'var(--phos)', font: 'Silkscreen', style: OUT });
      labelsG.appendChild(name); labelsG.appendChild(share);
      return { name, share, nodes: [name, share] };
    });
    const ws = labels.map((l) => { let a = 20, b = 8; try { a = l.name.getComputedTextLength(); b = l.share.getComputedTextLength(); } catch (e) {} return Math.max(a, b) + 1; });
    const H = NFS * 0.8 + SFS * 0.8 + 1.4;
    const pos = chartLabelPos(GEO, RM, ws, H);
    labels.forEach((l, i) => {
      const { x, y } = pos[i];
      const top = SCY + y - H / 2;
      l.name.setAttribute('x', (SCX + x).toFixed(2)); l.name.setAttribute('y', (top + NFS * 0.8).toFixed(2));
      l.share.setAttribute('x', (SCX + x).toFixed(2)); l.share.setAttribute('y', (top + H).toFixed(2));
    });
  }
  function paintLabels() {
    const v = view();
    labels.forEach((l, i) => {
      const on = i === sel, off = v.id === 'roles' && !mix[i];
      // a locked country's label takes the accent; a locked slice is already filled with it, so its label stays light
      l.nodes.forEach((t) => { t.style.fill = on && v.kind === 'map' ? 'var(--m-accent)' : 'var(--phos)'; t.setAttribute('opacity', off && !on ? 0.4 : 1); });
      if (v.kind === 'map') l.t.style.fontWeight = on ? 700 : 500;
      else l.name.style.fontWeight = on ? 700 : 500;
    });
  }
  function say(s, sub = '', ms = 1400) {
    msg.textContent = s; msgSub.textContent = sub;
    const maxW = 2 * Math.sqrt(Math.max(0, RM * RM - (MSG_Y - SCY + 2) ** 2)) - 8;
    let fs = MSG_FS; msg.setAttribute('font-size', fs);
    try { while (fs > 2.6 && msg.getComputedTextLength() > maxW) { fs -= 0.1; msg.setAttribute('font-size', fs.toFixed(2)); } } catch (e) {}
    let w = 30; try { w = msg.getComputedTextLength(); } catch (e) {}
    const h = fs * 0.8 + 3.4;
    msgBox.setAttribute('x', (SCX - w / 2 - 2.6).toFixed(2)); msgBox.setAttribute('width', (w + 5.2).toFixed(2));
    msgBox.setAttribute('y', (MSG_Y - fs * 0.8 - 1.7).toFixed(2)); msgBox.setAttribute('height', h.toFixed(2));
    msgG.setAttribute('opacity', 1); msgSub.setAttribute('opacity', sub ? 1 : 0);
    osdUntil = performance.now() + ms;
    if (RED) { clearTimeout(say._t); say._t = setTimeout(() => drawFrame(performance.now()), ms + 30); }
  }

  /* ---------------- the headline, the LCD, the knob marks ---------------- */
  const allOn = () => mix.every(Boolean);
  function headlineNow() {
    if (!power) return null;
    const v = view();
    if (sel >= 0) { const it = v.items[sel]; return { num: it.share != null ? String(it.share) : '--', unit: '%', cap: it.cap }; }
    if (v.id === 'roles' && !allOn()) {
      const s = ROLES.reduce((acc, r, i) => acc + (mix[i] ? r.share || 0 : 0), 0);
      return { num: String(Math.round(s)), unit: '%', cap: mix.some(Boolean) ? 'Selected roles' : 'No roles on' };
    }
    return { num: AUD.total.num, unit: AUD.total.unit, cap: 'Audience' };
  }
  const rangeDegs = () => { const n = view().items.length; return Array.from({ length: n + 1 }, (_, k) => -62 + (124 * k) / n); };
  function syncKnobs() {
    const rd = rangeDegs();
    dev.rangeK.marks(rd, sel + 1, rd.map((_, k) => (k ? String(k) : 'ALL')));
    dev.rangeK.set(rd[sel + 1]);
    dev.gainK.marks(GAIN_DEG, gainI);
    dev.gainK.set(GAIN_DEG[gainI]);
  }
  function refresh() {
    headline.set(headlineNow());
    lcd.update(sel, view().id === 'roles' ? mix : null);
    paintLabels();
    syncKnobs();
    ctx.a11y(a11yText());
    if (RED || !power) drawFrame(performance.now());
  }

  /* ---------------- per-frame drawing ---------------- */
  const decay = (age, tau) => Math.exp(-age / tau);
  const conic = (c, startDeg, stops) => { const gr = c.createConicGradient((startDeg - 90) * D2R, C0, C0); stops.forEach(([o, a]) => gr.addColorStop(o, a)); return gr; };
  const TRAIL = [0, 0.2, 0.4, 0.6, 0.75, 0.86, 0.93, 0.97, 0.995, 1];
  function drawFrame(now) {
    const th = norm360(theta);
    const v = view(), map = v.kind === 'map';
    const gain = GAINS[gainI];
    c2.globalCompositeOperation = 'source-over';
    c2.clearRect(0, 0, N, N);
    c2.drawImage(bgC, 0, 0);
    if (!RED && power) {
      // the picture, painted by the beam and fading behind it
      const floor = map ? 0.12 : 0.3;
      const t2 = tmpC.getContext('2d');
      t2.globalCompositeOperation = 'copy'; t2.drawImage(map ? mapC : chartC, 0, 0);
      t2.globalCompositeOperation = 'destination-in';
      t2.fillStyle = conic(t2, th, TRAIL.map((o) => { const age = dir > 0 ? (1 - o) * 360 : o * 360; return [o, `rgba(0,0,0,${Math.min(1, floor + (1 - floor) * decay(age, 95)).toFixed(3)})`]; }));
      t2.fillRect(0, 0, N, N);
      c2.globalAlpha = Math.min(1, gain);
      c2.drawImage(tmpC, 0, 0);
      if (gain > 1) { c2.globalCompositeOperation = 'lighter'; c2.globalAlpha = (gain - 1) * 1.6; c2.drawImage(tmpC, 0, 0); c2.globalCompositeOperation = 'source-over'; }
      c2.globalAlpha = 1;
      c2.fillStyle = conic(c2, th, TRAIL.map((o) => { const age = dir > 0 ? (1 - o) * 360 : o * 360; return [o, rgba(COL.phos, (0.17 * gain * decay(age, 22)).toFixed(3))]; }));
      c2.beginPath(); c2.arc(C0, C0, RM * RES, 0, Math.PI * 2); c2.fill();
    }
    // the locked slice, in the accent
    if (!map && sel >= 0 && SLICE[sel]) {
      c2.save();
      c2.globalAlpha = RED ? 0.62 : 0.5 + 0.12 * Math.sin(now / 240);
      c2.fillStyle = rgba(COL.acc, 1); c2.fill(SLICE[sel]);
      c2.globalAlpha = 1; c2.strokeStyle = rgba(COL.acc, 1); c2.lineWidth = 0.42 * RES; c2.lineJoin = 'round'; c2.stroke(SLICE[sel]);
      c2.restore();
    }
    if (!RED && power) {
      const q = th * D2R, bx = C0 + Math.sin(q) * RM * RES, by = C0 - Math.cos(q) * RM * RES;
      c2.lineCap = 'round';
      c2.strokeStyle = rgba(COL.phos, 0.2 * gain); c2.lineWidth = 1.6 * RES; c2.beginPath(); c2.moveTo(C0, C0); c2.lineTo(bx, by); c2.stroke();
      c2.strokeStyle = rgba(COL.phos, Math.min(1, 0.95 * gain + 0.1)); c2.lineWidth = 0.32 * RES; c2.beginPath(); c2.moveTo(C0, C0); c2.lineTo(bx, by); c2.stroke();
    }
    // contacts
    if (map && power) CONT.forEach((c, i) => {
      const b = RED ? 0.8 : decay((now - c.hit) / 1000, 1.3);
      const px = C0 + c.x * RES, py = C0 + c.y * RES;
      c2.save();
      c2.globalAlpha = Math.min(1, 0.55 + 0.45 * b);
      c2.shadowColor = rgba(COL.acc, 1); c2.shadowBlur = (4 + 12 * b) * (RES / 9);
      c2.fillStyle = rgba(COL.acc, 1);
      c2.beginPath(); c2.arc(px, py, (1.25 + 0.4 * b + (i === sel ? 0.35 : 0)) * RES, 0, Math.PI * 2); c2.fill();
      c2.restore();
      if (b > 0.02 && !RED) {
        c2.strokeStyle = rgba(COL.acc, (0.55 * b).toFixed(3)); c2.lineWidth = 0.28 * RES;
        c2.beginPath(); c2.arc(px, py, (1.8 + (1 - b) * 5.5) * RES, 0, Math.PI * 2); c2.stroke();
      }
    });
    if (!map) { c2.fillStyle = rgba(COL.phos, 0.85); c2.beginPath(); c2.arc(C0, C0, 0.7 * RES, 0, Math.PI * 2); c2.fill(); }
    c2.drawImage(vigC, 0, 0);
    // lock brackets on a country
    if (map && sel >= 0 && CONT[sel]) {
      const c = CONT[sel], x = SCX + c.x, y = SCY + c.y, s = 3.6, k = 1.4;
      lockBox.setAttribute('d', `M${x - s} ${y - s + k}V${y - s}H${x - s + k}M${x + s - k} ${y - s}H${x + s}V${y - s + k}M${x + s} ${y + s - k}V${y + s}H${x + s - k}M${x - s + k} ${y + s}H${x - s}V${y + s - k}`);
      lockBox.setAttribute('opacity', RED ? 1 : (0.6 + 0.4 * Math.abs(Math.sin(now / 260))).toFixed(3));
    } else lockBox.setAttribute('opacity', 0);
    if (osdUntil && now > osdUntil) { msgG.setAttribute('opacity', 0); msgSub.setAttribute('opacity', 0); osdUntil = 0; }
  }

  /** The slice (chart) or contact (map) at a bearing, or -1. */
  function itemAtBearing(brg) {
    const v = view();
    if (v.kind === 'map') {
      let best = -1, bd = 6;
      CONT.forEach((c, i) => { let d = Math.abs(norm360(brg - c.brg)); d = Math.min(d, 360 - d); if (d < bd) { bd = d; best = i; } });
      return best;
    }
    return GEO.findIndex((s) => norm360(brg - s.a0) < s.a1 - s.a0);
  }
  function setTheta(v) {
    const prev = theta;
    theta = v;
    if (v !== prev) dir = v > prev ? 1 : -1;
    const lo = Math.min(prev, v), hi = Math.max(prev, v);
    if (view().kind === 'map' && hi - lo > 0 && hi - lo < 359) CONT.forEach((c) => {
      const k = Math.ceil((lo - c.brg) / 360);
      if (c.brg + 360 * k <= hi) { c.hit = performance.now(); if (c.i === sel && power) sound.ping(); }
    });
    dev.idxRot.setAttribute('transform', `rotate(${norm360(v).toFixed(2)} ${SCX} ${SCY})`);
    dev.drawBar(v + 90);
  }

  /* ---------------- actions ---------------- */
  function setView(k, quiet) {
    if (k === viewI && !quiet) return;
    viewI = k; sel = -1;
    ro.setView(k);
    lcd.setView(view(), AUD.total);
    rowHits();
    renderChart(); renderBg();
    buildLabels();
    if (!quiet) { sound.click(); say(view().key === 'COUNTRIES' ? 'TOP COUNTRIES' : view().key); }
    refresh();
  }
  function setSel(i, why) {
    const v = view();
    sel = i >= 0 && i < v.items.length ? i : -1;
    // the lit slice or contact, the LCD row and the 7-segment show the lock, so no message here
    if (why !== 'quiet') {
      if (sel >= 0 && why === 'beam') sound.blip(988 + sel * 90, 0.04);
      else if (sel >= 0) { if (v.kind === 'map') sound.ping(); else sound.blip(988 + sel * 90, 0.05); }
      else sound.tick();
    }
    refresh();
  }
  function stepRange(d = 1) {
    powerOn();
    const n = view().items.length;
    const next = (((sel + 1 + d) % (n + 1)) + (n + 1)) % (n + 1) - 1;
    pushIn(dev.rangeK.kn, dev.pnl, 0.7);
    sound.tick();
    setSel(next, 'range');
  }
  function stepGain() {
    powerOn();
    gainI = (gainI + 1) % GAINS.length;
    pushIn(dev.gainK.kn, dev.pnl, 0.7);
    sound.tick();
    renderBg();
    say(`GAIN ${['LOW', 'MID', 'HIGH'][gainI]}`);
    refresh();
  }
  function stepView(d = 1) {
    powerOn();
    pushIn(ro.knobG, ro.rp, 0.8);
    setView((viewI + d + VIEWS.length) % VIEWS.length);
  }
  function flip(t) {
    powerOn();
    const i = t.i;
    mix[i] = !mix[i];
    sound.click();
    const from = t.k, to = mix[i] ? 1 : -1, t0 = performance.now();
    const step = (now) => { const k = Math.min(1, (now - t0) / 90); dev.setLever(t, from + (to - from) * k * k); if (k < 1) requestAnimationFrame(step); };
    if (RED) dev.setLever(t, to); else requestAnimationFrame(step);
    ledOn(t, mix[i]);
    t.grp.setAttribute('aria-checked', String(mix[i]));
    if (viewI !== ROLES_I) { setView(ROLES_I, true); }
    sel = -1;
    renderChart(); renderBg();
    const n = mix.filter(Boolean).length;
    if (!n) say('NO CONTACTS', 'hi mom', 2600);
    else say(`${ROLES[i].short.toUpperCase()} ${mix[i] ? 'ON' : 'OFF'}`);
    refresh();
  }
  const ledOn = (t, on) => { t.led.style.fill = on ? 'var(--m-accent)' : 'var(--m-deep)'; t.ledGlow.setAttribute('opacity', on ? 0.7 : 0); };
  // push a control into its panel for a moment
  function pushIn(node, pl, d) {
    if (!node) return;
    const v = P(mul(pl.n, -d));
    node.classList.add('press', 'down');
    node.style.transform = `translate(${v[0].toFixed(3)}px, ${v[1].toFixed(3)}px)`;
    clearTimeout(node._pt);
    node._pt = setTimeout(() => { node.classList.remove('down'); node.style.transform = ''; }, 120);
  }

  /* ---------------- power ---------------- */
  function powerOn() {
    if (power) return;
    power = true;
    sound.click();
    dev.pled.style.fill = 'var(--m-accent)'; dev.pledGlow.setAttribute('opacity', 0.9);
    dev.toggles.forEach((t, i) => setTimeout(() => { ledOn(t, mix[i]); if (!RED) sound.tick(); }, RED ? 0 : 160 + i * 120));
    lcd.off.setAttribute('opacity', 0);
    lcd.lit.style.transition = 'opacity .4s'; lcd.lit.setAttribute('opacity', 1);
    cv.style.opacity = '1';
    osdG.style.transition = 'opacity .8s'; osdG.setAttribute('opacity', 1);
    if (RED) CONT.forEach((c) => (c.hit = performance.now()));
    if (pendingGo) { const p = pendingGo; pendingGo = null; go(p); }
    refresh();
    drawFrame(performance.now());
  }

  /* ---------------- interaction ---------------- */
  const svg = ctx.svg;
  for (const s2 of [svg, ctx.foreSvg]) { s2.style.userSelect = 'none'; s2.style.webkitUserSelect = 'none'; }
  function toLocal(pl, clientX, clientY) {
    const m = svg.getScreenCTM();
    if (!m) return [0, 0];
    const pt = new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
    const [ua, ub] = P(pl.u), [va, vb] = P(pl.v), [ox, oy] = P(pl.o);
    const det = ua * vb - va * ub, dx = pt.x - ox, dy = pt.y - oy;
    return [(dx * vb - va * dy) / det, (ua * dy - dx * ub) / det];
  }
  const ptr = (e) => { const [a, b] = toLocal(dev.bzTop, e.clientX, e.clientY); return { brg: bearingOf(a - SCX, b - SCY), a, b, r: Math.hypot(a - SCX, b - SCY) }; };
  let drag = null;
  function onDialDown(e) {
    if (e.type !== 'pointerdown') { stepRange(1); return; }
    powerOn();
    e.preventDefault();
    const p = ptr(e);
    drag = { last: p.brg, theta0: theta, acc: 0, moved: 0, x: e.clientX, y: e.clientY, a: p.a, b: p.b, r: p.r, brg: p.brg };
    window.addEventListener('pointermove', onDialMove);
    window.addEventListener('pointerup', onDialUp, { once: true });
    window.addEventListener('pointercancel', onDialUp, { once: true });
  }
  function onDialMove(e) {
    if (!drag) return;
    drag.moved = Math.max(drag.moved, Math.hypot(e.clientX - drag.x, e.clientY - drag.y));
    if (drag.moved < 6) return;
    if (!dragging) { dragging = true; auto = false; sound.tick(); }
    const p = ptr(e);
    let d = p.brg - drag.last; if (d > 180) d -= 360; if (d < -180) d += 360;
    drag.last = p.brg; drag.acc += d;
    const before = Math.floor(theta / 10);
    setTheta(drag.theta0 + drag.acc);
    if (Math.floor(theta / 10) !== before) sound.tick();
    // the beam reads what it points at: a slice, or a country within a few degrees
    const i = itemAtBearing(norm360(theta));
    if (i !== sel && i >= 0) setSel(i, 'beam');
    if (RED) drawFrame(performance.now());
  }
  function onDialUp() {
    window.removeEventListener('pointermove', onDialMove);
    if (!drag) return;
    const wasDrag = dragging;
    dragging = false; auto = true;
    if (!wasDrag) {
      const v = view();
      if (v.kind === 'map') {
        // a click: lock the nearest contact (or its label), or let go
        let best = -1, bd = MOB ? 9 : 7.5;
        CONT.forEach((c, i) => {
          const d1 = Math.hypot(drag.a - (SCX + c.x), drag.b - (SCY + c.y));
          const bx = c.label?.box, inL = bx && drag.a > bx.x0 - 1 && drag.a < bx.x1 + 1 && drag.b > bx.y0 - 1.2 && drag.b < bx.y1 + 1.2;
          const d = inL ? Math.min(d1, 2) : d1;
          if (d < bd) { bd = d; best = i; }
        });
        if (best >= 0) setSel(best === sel ? -1 : best, 'click');
        else if (sel >= 0) setSel(-1, 'click');
      } else {
        const i = drag.r > 2 && drag.r < RM + 1 ? itemAtBearing(drag.brg) : -1;
        setSel(i === sel ? -1 : i, 'click');
      }
    }
    drag = null;
  }
  ctx.hit(dev.scopeG, 'Scope and bearing dial: click a country or a slice to lock it, drag the dial to turn the beam', onDialDown);
  dev.scopeG.style.touchAction = 'none';
  dev.scopeG.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });

  // the rotary: click the knob for the next view, or a legend to jump to it
  ctx.hit(ro.rot, 'View selector: next view', () => stepView(1));
  const legendHits = VIEWS.map((v, k) => {
    const hitN = face(ro.rp, [el('rect', { x: ro.TX - 1.5, y: ro.TY0 + k * ro.TDY - 4.2, width: 34, height: ro.TDY, style: 'fill:var(--m-deep)', 'fill-opacity': 0 })], 0.05);
    root.appendChild(hitN);
    ctx.hit(hitN, `Show ${v.title.toLowerCase()}`, () => { powerOn(); if (k !== viewI) { pushIn(ro.knobG, ro.rp, 0.8); setView(k); } }, { tabindex: -1 });
    return hitN;
  });
  // the knobs
  ctx.hit(dev.gainK.grp, 'Gain: scope brightness', stepGain);
  ctx.hit(dev.rangeK.grp, 'Range: lock the next item', () => stepRange(1));
  // the role toggles
  dev.toggles.forEach((t) => { ctx.hit(t.grp, `${ROLES[t.i].label}: include in the audience mix`, () => flip(t), { role: 'switch' }); t.grp.setAttribute('aria-checked', 'true'); });
  // the LCD rows
  const rowHitG = g();
  root.appendChild(rowHitG);
  const ROWS_MAX = Math.max(...VIEWS.map((v) => v.items.length));
  const rowHit = Array.from({ length: ROWS_MAX }, (_, i) => {
    const r = el('rect', { x: ro.LX, y: 0, width: ro.LW, height: 1, style: 'fill:var(--lcd)', 'fill-opacity': 0 });
    const grp = g({}, [r]);
    rowHitG.appendChild(grp);
    ctx.hit(grp, `Row ${i + 1}`, () => { powerOn(); setSel(i === sel ? -1 : i, 'row'); }, { tabindex: -1 });
    return { grp, r };
  });
  function rowHits() {
    const pl = ro.lcdPl;
    if (!pl) return;
    rowHitG.setAttribute('transform', iso.matrix(pl, 0.05));
    rowHit.forEach((h, i) => {
      const row = lcd.rows[i];
      h.grp.style.display = row ? '' : 'none';
      if (!row) return;
      h.r.setAttribute('y', row.y.toFixed(2)); h.r.setAttribute('height', row.h.toFixed(2));
      h.grp.setAttribute('aria-label', `${row.it.label}, ${row.it.share ?? '--'}%: lock`);
    });
  }

  function go(p) {
    const q = String(p?.country || p?.code || '').toLowerCase();
    const vq = String(p?.view || p?.stat || '').toLowerCase();
    if (q) {
      const ci = VIEWS.findIndex((v) => v.kind === 'map');
      const items = VIEWS[ci]?.items || [];
      const i = items.findIndex((c) => c.label.toLowerCase() === q || c.code.toLowerCase() === q || (q === 'usa' && c.code === 'US') || c.label.toLowerCase().startsWith(q));
      if (i < 0) return;
      if (viewI !== ci) setView(ci, true);
      setSel(i, 'go');
      return;
    }
    if (vq) { const k = VIEWS.findIndex((v) => v.id === vq || v.id.startsWith(vq)); if (k >= 0 && k !== viewI) setView(k); }
  }
  ctx.onGo((p) => { if (!p) return; if (!power) { pendingGo = p; return; } go(p); });

  ctx.onKey = (e) => {
    if (e.defaultPrevented) return false;
    const k = e.key;
    const n = view().items.length;
    if (/^[1-9]$/.test(k) && +k <= n) { powerOn(); setSel(+k - 1 === sel ? -1 : +k - 1, 'key'); return true; }
    if (k === '0' || k === 'Escape') { if (sel < 0) return false; setSel(-1, 'key'); return true; }
    if (k === 'ArrowDown' || k === 'ArrowUp') { stepRange(k === 'ArrowDown' ? 1 : -1); return true; }
    if (k === 'v' || k === 'V') { stepView(1); return true; }
    if (k === 'g' || k === 'G') { stepGain(); return true; }
    if (k === 'ArrowLeft' || k === 'ArrowRight') {
      powerOn(); auto = false; manualUntil = performance.now() + 2200;
      setTheta(theta + (k === 'ArrowRight' ? 5 : -5)); sound.tick();
      const i = itemAtBearing(norm360(theta));
      if (i !== sel && i >= 0) setSel(i, 'beam');
      if (RED) drawFrame(performance.now());
      return true;
    }
    return false;
  };
  ctx.on('theme', () => { rebuild(); drawFrame(performance.now()); });

  /* ---------------- a11y ---------------- */
  function a11yText() {
    const list = (v) => v.items.map((it) => `<li>${it.label}${it.share != null ? `: ${it.share}%` : ''}</li>`).join('');
    const h = headlineNow();
    return `<p>Audience radar. Audience: ${AUD.total.text} on Instagram.</p>`
      + VIEWS.map((v) => `<p>${v.title}${v.id === 'countries' ? ', in order' : ''}:</p><ul>${list(v)}</ul>`).join('')
      + `<p>Showing ${view().title.toLowerCase()}${h ? `. Readout: ${h.num}${h.unit} ${h.cap.toLowerCase()}` : ''}.</p>`
      + `<p>Controls: the view selector picks countries, gender, age or roles. Range steps through the items, gain sets the brightness, and the role switches add roles to or take them out of the mix. Keys: 1 to ${Math.max(...VIEWS.map((v) => v.items.length))} lock an item, arrows up and down step, V changes the view.</p>`;
  }

  /* ---------------- framing + start ---------------- */
  ro.setView(0);
  lcd.setView(view(), AUD.total);
  syncKnobs();
  ctx.a11y(a11yText());
  rowHits();
  fitBody(ctx, MOB ? 7 : 9, [dev.shG]);
  geo = await wP;
  rebuild();
  buildLabels();
  paintLabels();
  setTheta(theta);
  drawFrame(performance.now());

  ctx.raf((dt) => {
    if (!power || RED) return;
    const now = performance.now();
    if (!auto && !dragging && manualUntil && now > manualUntil) { auto = true; manualUntil = 0; }
    if (auto && !dragging) setTheta(theta + 72 * dt);
    drawFrame(now);
  });

  return {
    plotted() { powerOn(); rowHits(); },
    start() {},
    stop() {},
  };
}

/* ====================================================================================================== */
/* the hero tile: the same console, lit, all SVG                                                           */
/* ====================================================================================================== */
export async function hero(hx) {
  const { K, iso, root, content } = hx;
  const { g, el, face, txt } = iso;
  try { await document.fonts?.ready; } catch (e) {}
  const AUD = audienceOf(content, hx.data);
  const VIEWS = AUD.views;
  const ROLES = VIEWS.find((v) => v.id === 'roles')?.items || [];
  const dev = drawConsole(K, iso, root, { mobile: false, hero: true, split: !hx.mobile, views: VIEWS, roles: ROLES });
  const ro = dev.ro;
  ro.setView(0);
  const vign = K.rgrad([[0.6, 'var(--lcd-ink)', 0], [1, 'var(--lcd-ink)', 0.12]], 0.5, 0.45, 0.85);
  const lcd = makeLCD(K, iso, ro, { mobile: false, vignette: vign });
  lcd.off.setAttribute('opacity', 0); lcd.lit.setAttribute('opacity', 1);
  lcd.setView(VIEWS[0], AUD.total);
  lcd.update(-1, null);
  const headline = makeHeadline(K, iso, ro, { mobile: false });
  root.appendChild(headline.node);
  headline.set({ num: AUD.total.num, unit: AUD.total.unit, cap: 'Audience' });
  dev.pled.style.fill = 'var(--m-accent)'; dev.pledGlow.setAttribute('opacity', 0.9);
  dev.toggles.forEach((t) => { t.led.style.fill = 'var(--m-accent)'; t.ledGlow.setAttribute('opacity', 0.7); });
  dev.gainK.set(0); dev.gainK.marks([-50, 0, 50], 1);
  const n = VIEWS[0].items.length;
  const rd = Array.from({ length: n + 1 }, (_, k) => -62 + (124 * k) / n);
  dev.rangeK.set(rd[0]); dev.rangeK.marks(rd, 0, rd.map((_, k) => (k ? String(k) : 'ALL')));
  // the scope, still: the map as a themed mask image, range rings, a beam with its wake and the five contacts
  const { SCX, SCY, RC } = dev;
  const RM = RC - 1.4;
  const kids = [];
  const geo = await world();
  if (geo) {
    const R = 6, Np = Math.round(2 * RC * R), C0 = Np / 2;
    const cv = document.createElement('canvas'); cv.width = cv.height = Np;
    const m = cv.getContext('2d');
    m.translate(C0, C0); m.scale(R, R);
    m.beginPath(); m.arc(0, 0, RM, 0, Math.PI * 2); m.clip();
    const paths = [];
    for (const f of geo.features) {
      const gm = f.geometry; if (!gm) continue;
      const polys = gm.type === 'Polygon' ? [gm.coordinates] : gm.coordinates;
      for (const poly of polys) for (const ring of poly) { let near = false; const p = new Path2D(); ring.forEach(([lo, la], i) => { const [x, y, c] = project(lo, la, RM); if (c < MAP_RANGE * 1.08) near = true; if (i) p.lineTo(x, y); else p.moveTo(x, y); }); if (near) { p.closePath(); paths.push(p); } }
    }
    // coastlines only: stroke every country, erase inside them (the shared borders go), then fill the land faintly
    m.lineJoin = 'round'; m.lineWidth = 0.9; m.strokeStyle = 'rgba(255,255,255,0.95)';
    paths.forEach((p) => m.stroke(p));
    m.globalCompositeOperation = 'destination-out'; m.fillStyle = '#fff';
    paths.forEach((p) => m.fill(p));
    m.globalCompositeOperation = 'source-over'; m.fillStyle = 'rgba(255,255,255,0.24)';
    paths.forEach((p) => m.fill(p));
    const mid = K.id('map');
    K.def(el('mask', { id: mid, maskUnits: 'userSpaceOnUse', x: SCX - RC, y: SCY - RC, width: 2 * RC, height: 2 * RC }, [el('image', { href: cv.toDataURL('image/png'), x: SCX - RC, y: SCY - RC, width: 2 * RC, height: 2 * RC })]));
    kids.push(el('rect', { x: SCX - RC, y: SCY - RC, width: 2 * RC, height: 2 * RC, style: 'fill:var(--phos)', opacity: 0.55, mask: `url(#${mid})` }));
  }
  kids.push(...[1, 2, 3].map((i) => el('circle', { cx: SCX, cy: SCY, r: (RM * i) / 3, fill: 'none', style: 'stroke:var(--phos)', 'stroke-width': 0.3, opacity: 0.3 })));
  const th = 32 * D2R, wake = 70 * D2R;
  const gid = K.grad([[0, 'var(--phos)', 0], [1, 'var(--phos)', 0.32]], 0, 0, 1, 0);
  const pts = []; for (let k = 0; k <= 16; k++) { const a = th - wake + (wake * k) / 16; pts.push([SCX + Math.sin(a) * RM, SCY - Math.cos(a) * RM]); }
  kids.push(el('path', { d: `M${SCX} ${SCY}` + pts.map((p) => `L${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join('') + 'Z', style: `fill:${gid}`, opacity: 0.6 }));
  kids.push(el('path', { d: `M${SCX} ${SCY}L${(SCX + Math.sin(th) * RM).toFixed(2)} ${(SCY - Math.cos(th) * RM).toFixed(2)}`, style: 'stroke:var(--phos)', 'stroke-width': 0.5, 'stroke-linecap': 'round' }));
  VIEWS[0].items.forEach((c) => {
    const [x, y] = project(c.lon, c.lat, RM);
    kids.push(el('circle', { cx: SCX + x, cy: SCY + y, r: 3.4, style: 'fill:var(--m-accent)', opacity: 0.3, filter: `url(#${K.glowId})` }));
    kids.push(el('circle', { cx: SCX + x, cy: SCY + y, r: 1.7, style: 'fill:var(--m-accent)' }));
  });
  dev.scopeIn.appendChild(g({}, kids));
  dev.idxRot.setAttribute('transform', `rotate(32 ${SCX} ${SCY})`);
  dev.drawBar(90 + 32);
}
