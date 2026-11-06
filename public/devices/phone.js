// 09 · Let's work · Mobile phone.
// An early-2000s candybar phone in its desk charging stand, turned a little towards you so the screen reads.
// It buzzes when it is drawn: 1 new message. Any key opens the menu, two groups on one screen:
//   WORK WITH ME  1 Email (copies her address; the call key writes to her)  2 Consultation form
//   CONTACT       3 Instagram  4 TikTok  5 X  6 LinkedIn
// A digit (or a tap on a row) shows that item; the call key, or a tap on the screen, opens it. Keys play real DTMF
// tones. 0 or # is Snake, and dialling any other number gets you a very suspicious callee.
const D2R = Math.PI / 180;

/** The six menu items, in dial order. */
function menuItems(content) {
  const { SITE, SOCIALS } = content;
  return [
    { n: 1, group: 0, key: 'email', label: 'Email', title: 'Email', href: SITE.workEmailHref, value: SITE.workEmail },
    { n: 2, group: 0, key: 'form', label: 'Consultation form', title: 'Consultation', href: SITE.consultationForm },
    ...SOCIALS.map((s, i) => ({ n: 3 + i, group: 1, key: s.id, label: s.label, title: s.label, href: s.href, handle: s.handle, followers: s.followers })),
  ];
}
const GROUPS = ['Work with me', 'Contact'];

/* ====================================================================================================== */
/* the hardware (shared by the section and the hero)                                                       */
/* ====================================================================================================== */
function drawPhone(K, iso, root, o) {
  const { g, el, face, txt, plane, shift, rrect, circle, ellipse, MAT, P, at, add, sub, mul } = iso;
  const MOB = !!o.mobile, HERO = !!o.hero;
  const part = () => { const p = g({ class: 'part' }); root.appendChild(p); return p; };
  const blur = (sd) => { const id = K.id('sblur'); K.def(el('filter', { id, filterUnits: 'userSpaceOnUse', x: -2000, y: -2000, width: 4000, height: 4000 }, [el('feGaussianBlur', { stdDeviation: sd })])); return id; };
  // the stand and phone are turned by PHI about the vertical, towards the viewer
  const PHI = 26 * D2R;
  const ex = [Math.cos(PHI), -Math.sin(PHI), 0], ey = [Math.sin(PHI), Math.cos(PHI), 0];
  const Wp = (a, b, c = 0) => [ex[0] * a + ey[0] * b, ex[1] * a + ey[1] * b, c];

  /* ---------------- dimensions ---------------- */
  const PW = 58, PH = 130, PT = 19, TILT = 24 * D2R;
  const sT = Math.sin(TILT), cT = Math.cos(TILT);
  const nF = Wp(0, cT, sT), up = Wp(0, -sT, cT), dn = Wp(0, sT, -cT);
  const SW = PW + (MOB ? 12 : 22), SD = MOB ? 52 : 62, SBH = 7, SR = 10;
  const bL = [(SW - PW) / 2, MOB ? 34 : 39, SBH - 1.5];   // stand-local a, b, z of the phone's bottom-front-left corner
  const bfl = Wp(bL[0], bL[1], bL[2]);
  const tfl = add(bfl, mul(up, PH));
  const front = plane(tfl, ex, dn);                     // a = across (0..PW), b = down the face (0..PH)
  const topP = plane(sub(tfl, mul(nF, PT)), ex, nF);
  const backPl = shift(front, 0, 0, -PT);
  const sTop = plane(Wp(0, 0, SBH), ex, ey);
  const sFront = plane(Wp(0, SD, SBH), ex, [0, 0, -1]);
  const yLipBack = bL[1] + 0.6, LIPH = 4.6;

  /* ---------------- shadows ---------------- */
  const shG = part();
  const standShadow = (pad, r, op, sd) => el('path', { d: iso.dpoly(rrect(-pad, -pad, SW + pad * 2, SD + pad * 2, r, 8).map(([a, b]) => P(Wp(a, b, 0)))), style: 'fill:var(--shadow)', class: 'shadow', opacity: op, filter: `url(#${blur(sd)})` });
  shG.appendChild(standShadow(6, SR + 4, 0.7, 8));
  shG.appendChild(standShadow(1, SR, 0.5, 2.5));

  /* ---------------- stand: base + backrest (no loose charger: the dock alone, its LED says it is charging) ---------------- */
  const standG = part();
  standG.appendChild(K.prism(rrect(0, 0, SW, SD, SR, 8), sTop, SBH, MAT.body2));
  standG.appendChild(face(sTop, [el('path', { d: iso.dpoly(rrect(3.5, 3.5, SW - 7, SD - 7, SR - 3, 8)), class: 's3' })], 0.02));
  standG.appendChild(K.recess(rrect(bL[0] - 2, bL[1] - PT / cT - 2.2, PW + 4, PT / cT + 2.8, 3), sTop, 1.6, MAT.deep, { floorFill: 'var(--m-glass)' }));
  standG.appendChild(K.prism(rrect(5, PH * 0.42, PW - 10, PH * 0.58 - 2, 7, 6), backPl, 7, MAT.body2));
  const cled = el('circle', { cx: SW - 10, cy: SBH / 2, r: 0.85, style: 'fill:var(--m-deep)', class: 'sf' });
  const cledGlow = el('circle', { cx: SW - 10, cy: SBH / 2, r: 2.4, style: 'fill:var(--m-accent)', opacity: 0, filter: `url(#${K.glowId})` });
  standG.appendChild(face(sFront, [cledGlow, cled, el('path', { d: `M${SR} ${SBH - 1.6} L${SW - SR} ${SBH - 1.6}`, class: 's3' })], 0.02));

  /* ---------------- phone ---------------- */
  const shakeG = part();
  const phoneG = g();
  shakeG.appendChild(phoneG);
  {
    // the stand's front lip hides the bottom of the phone
    const pts = [];
    for (const [a, b] of [[bL[0] - 4, yLipBack], [bL[0] + PW + 4, yLipBack], [bL[0] + PW + 4, yLipBack + 7], [bL[0] - 4, yLipBack + 7]]) { pts.push(P(Wp(a, b, SBH))); pts.push(P(Wp(a, b, SBH + LIPH))); pts.push(P(Wp(a, b, 0))); }
    const cid = K.id('lip');
    K.def(el('clipPath', { id: cid }, [el('path', { d: `M-4000 -4000H4000V4000H-4000Z${iso.dpoly(iso.hull(pts))}`, 'clip-rule': 'evenodd' })]));
    phoneG.setAttribute('clip-path', `url(#${cid})`);
  }
  phoneG.appendChild(K.prism(rrect(0, 0, PW, PH, 9, 7), front, PT, MAT.shell));
  phoneG.appendChild(face(front, [el('path', { d: iso.dpoly(rrect(1.6, 1.6, PW - 3.2, PH - 3.2, 7.6, 7)), class: 's3' })], 0.02));
  const sideP = plane(add(tfl, mul(ex, PW)), mul(nF, -1), dn); // right side: a = front → back, b = down
  phoneG.appendChild(face(sideP, [el('path', { d: `M${PT * 0.42} 9 L${PT * 0.42} ${PH - 9}`, class: 's3' })], 0.02));
  phoneG.appendChild(K.prism(rrect(PT * 0.2, 32, PT * 0.42, 15, 2), shift(sideP, 0, 0, 0.9), 1.2, MAT.key));
  phoneG.appendChild(face(topP, [el('path', { d: iso.dpoly(rrect(9.5, 2.4, PW - 19, PT - 4.8, 2.4)), class: 's3' })], 0.02));
  const pwrKey = K.prism(rrect(13, PT / 2 - 2.2, 11, 4.4, 2), shift(topP, 0, 0, 1.4), 1.6, MAT.key);
  phoneG.appendChild(pwrKey);
  {
    // antenna stub
    const aB = at(topP, PW - 14, PT / 2, 0);
    const aPl = { o: add(aB, mul(up, 9)), u: ex, v: nF, n: up };
    phoneG.appendChild(K.prism(circle(0, 0, 4.2, 24), aPl, 9, MAT.shell, { base: circle(0, 0, 4.8, 24) }));
    phoneG.appendChild(face(aPl, [el('circle', { cx: 0, cy: 0, r: 2.2, fill: 'none', class: 's3' })], 0.02));
    if (!HERO) for (let i = 1; i < 4; i++) phoneG.appendChild(face(shift(aPl, 0, 0, -i * 2.2), [el('path', { d: iso.dpoly(circle(0, 0, 4.25 + i * 0.15, 24)), class: 's3' })], 0));
  }
  phoneG.appendChild(K.recess(rrect(PW / 2 - 7.5, 5.6, 15, 1.9, 0.95), front, 0.8, MAT.deep, { floorFill: 'var(--m-glass)' }));
  if (!HERO) phoneG.appendChild(face(front, [txt('vladasana', PW / 2, 11.4, { size: 2.3, anchor: 'middle', fill: 'var(--t2)', ls: 0.45 })], 0.02));
  // the screen
  const LX = 7.5, LY = 15, LW = PW - 15, LH = 49;
  phoneG.appendChild(K.recess(rrect(LX - 3, LY - 3, LW + 6, LH + 6, 4), front, 0.6, MAT.deep, { floorFill: 'var(--m-glass)' }));
  const scr = g();
  let scrPl = null;
  phoneG.appendChild(K.recess(rrect(LX, LY, LW, LH, 0.8), front, 0.9, MAT.glass, { floorFill: 'var(--m-glass)', content: (pl) => { scrPl = pl; scr.setAttribute('transform', iso.matrix(pl)); return scr; } }));
  const keysG = g();
  phoneG.appendChild(keysG);
  phoneG.appendChild(face(front, [el('circle', { cx: PW / 2, cy: PH - 4.4, r: 0.7, style: 'fill:var(--m-glass)', class: 'sf' })], 0.02));

  /* ---------------- keys ---------------- */
  const KEYH = 1.7;
  const LEG = 'var(--ink)';
  function key(outline, mat, legend, opts = {}) {
    const outer = g(), inner = g();
    outer.appendChild(inner);
    keysG.appendChild(face(front, [el('path', { d: iso.dpoly(outline), style: 'fill:var(--m-deep)', class: 'f' })], 0.02));
    const cx = outline.reduce((s, p) => s + p[0], 0) / outline.length, cy = outline.reduce((s, p) => s + p[1], 0) / outline.length;
    const shrink = outline.map(([a, b]) => [cx + (a - cx) * 0.9, cy + (b - cy) * 0.86]);
    inner.appendChild(K.prism(shrink, shift(front, 0, 0, opts.h || KEYH), opts.h || KEYH, mat, { base: outline }));
    if (legend) inner.appendChild(face(shift(front, 0, 0, opts.h || KEYH), legend, 0.02));
    keysG.appendChild(outer);
    return { outer, inner };
  }
  const handset = (x, y, dir, col) => {
    const d = dir > 0
      ? `M${x - 2.6} ${y + 0.4} q0 -1.6 2.6 -1.6 q2.6 0 2.6 1.6 l-0.2 0.7 l-1.3 -0.3 l0 -0.8 q-1.1 -0.4 -2.2 0 l0 0.8 l-1.3 0.3 Z`
      : `M${x - 2.6} ${y - 0.2} q0 1.6 2.6 1.6 q2.6 0 2.6 -1.6 l-0.2 -0.7 l-1.3 0.3 l0 0.8 q-1.1 0.4 -2.2 0 l0 -0.8 l-1.3 -0.3 Z`;
    return el('path', { d, style: `fill:${col}`, class: 'f' });
  };
  const NB = LY + LH + 5.5;
  const callK = key(rrect(4, NB + 1, 13, 8, 4, 5), MAT.accent, [handset(10.5, NB + 5, 1, 'var(--m-paper)')]);
  const endK = key(rrect(PW - 17, NB + 1, 13, 8, 4, 5), MAT.key, [handset(PW - 10.5, NB + 5, -1, LEG)]);
  const NCX = PW / 2, NCY = NB + 5, NRX = 8.8, NRY = 6.6;
  const navK = key(ellipse(NCX, NCY, NRX, NRY, 40), MAT.key, [
    el('path', { d: `M${NCX - 1.5} ${NCY - NRY + 2.6} L${NCX} ${NCY - NRY + 1.2} L${NCX + 1.5} ${NCY - NRY + 2.6}`, fill: 'none', style: `stroke:${LEG}`, 'stroke-width': 0.45, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'f' }),
    el('path', { d: `M${NCX - 1.5} ${NCY + NRY - 2.6} L${NCX} ${NCY + NRY - 1.2} L${NCX + 1.5} ${NCY + NRY - 2.6}`, fill: 'none', style: `stroke:${LEG}`, 'stroke-width': 0.45, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'f' }),
    el('circle', { cx: NCX, cy: NCY, r: 2.6, fill: 'none', style: `stroke:${LEG}`, 'stroke-width': 0.35, opacity: 0.6, class: 'f' }),
  ], { h: 2.1 });
  const PAD = [['1', '.,?'], ['2', 'abc'], ['3', 'def'], ['4', 'ghi'], ['5', 'jkl'], ['6', 'mno'], ['7', 'pqrs'], ['8', 'tuv'], ['9', 'wxyz'], ['*', '+'], ['0', '␣'], ['#', '⇧']];
  const KC = [11, PW / 2, PW - 11], KR0 = NB + 13.4, KRP = 10.4, KWd = 14.4, KHt = 8.3;
  const padKeys = new Map();
  PAD.forEach(([d, l], i) => {
    const c = i % 3, r = Math.floor(i / 3);
    const x = KC[c], y = KR0 + r * KRP;
    const lg = HERO ? [txt(d, x, y + 5.7, { size: 4.3, anchor: 'middle', fill: LEG, font: 'Pixelify Sans', weight: 500 })]
      : [txt(d, x - 2.8, y + 5.7, { size: d === '*' || d === '#' ? 4.6 : 4.3, anchor: 'middle', fill: LEG, font: 'Pixelify Sans', weight: 500 }),
        txt(l, x + 1.2, y + 5.3, { size: l.length > 3 ? 1.75 : 1.95, fill: 'var(--ink2)', ls: 0.12 })];
    padKeys.set(d, key(rrect(x - KWd / 2, y, KWd, KHt, 3.4, 5), MAT.key, lg));
  });

  /* ---------------- strap + charm (hangs from an eyelet on the right side, and swings) ---------------- */
  const swingG = g();
  let swingPivot = [0, 0];
  {
    const propsG = g();
    shakeG.appendChild(propsG);
    const eyeS = PH * 0.16;
    const eye = at(sideP, PT * 0.55, eyeS, 0.6);
    const hang = 30, cs = 6.2;
    const low = add(eye, [3.2, 1.2, -hang]);
    propsG.appendChild(face(sideP, [el('path', { d: iso.dpoly(rrect(PT * 0.55 - 1.1, eyeS - 1.6, 2.2, 3.2, 1.1)), style: 'fill:var(--m-glass)', class: 'sf' })], 0.02));
    propsG.appendChild(swingG);
    swingPivot = P(eye);
    swingG.appendChild(K.tube([eye, add(eye, [1.6, 0.8, -4]), add(eye, [3.0, 1.1, -14]), low], 0.9, 'var(--m-rubber)'));
    swingG.appendChild(K.tube([add(eye, [0.2, -0.6, 0]), add(eye, [2.2, -0.4, -5]), add(eye, [3.4, 0.6, -16]), low], 0.9, 'var(--m-rubber)'));
    swingG.appendChild(K.cyl(low[0], low[1], low[2] - 2.2, 1.3, 2.2, MAT.metal));
    const c0 = [low[0] - cs / 2, low[1] - cs / 2, low[2] - 2.2 - cs];
    const charm = K.box(c0[0], c0[1], c0[2], cs, cs, cs, MAT.pale, { r: 0.7, seg: 2 });
    swingG.appendChild(charm);
    swingG.appendChild(face(charm.top, [el('circle', { cx: cs / 2, cy: cs / 2, r: 0.75, style: 'fill:var(--m-accent)' })], 0.02));
    swingG.appendChild(face(charm.fy, [el('path', { d: `M${cs / 2} 1.2 L${cs - 1.2} ${cs / 2} L${cs / 2} ${cs - 1.2} L1.2 ${cs / 2} Z`, class: 's3' })], 0.02));
  }

  /* ---------------- the stand's front lip, over the phone's bottom ---------------- */
  const lipG = part();
  lipG.appendChild(K.prism(rrect(bL[0] - 4, yLipBack, PW + 8, 6.4, 2.2, 5), shift(sTop, 0, 0, LIPH), LIPH, MAT.body2));

  return { front, nF, scr, scrPl, shakeG, swingG, swingPivot, cled, cledGlow, padKeys, callK, endK, navK, pwrKey, PW, LX, LY, LW, LH, NCX, NCY, NRY };
}

/* ====================================================================================================== */
/* the screen                                                                                              */
/* ====================================================================================================== */
function makeScreen(K, iso, dev, o) {
  const { g, el, txt } = iso;
  const { LX, LY, LW, LH, scr } = dev;
  const MOB = !!o.mobile;
  const INK = 'var(--lcd-ink)', BG = 'var(--lcd)';
  const pix = (s, x, y, op = {}) => txt(s, x, y, { font: 'Pixelify Sans', fill: INK, ...op });
  const off = el('rect', { x: LX, y: LY, width: LW, height: LH, style: 'fill:var(--m-glass)' });
  const lit = g({ opacity: 0 });
  scr.appendChild(off); scr.appendChild(lit);
  lit.appendChild(el('rect', { x: LX, y: LY, width: LW, height: LH, style: `fill:${BG}` }));
  const view = g();
  lit.appendChild(view);
  // dot-matrix grid + glass
  const gridId = K.id('dm');
  K.def(el('pattern', { id: gridId, width: 0.62, height: 0.62, patternUnits: 'userSpaceOnUse' }, [el('rect', { width: 0.62, height: 0.13, style: `fill:${INK}`, opacity: 0.06 }), el('rect', { width: 0.13, height: 0.62, style: `fill:${INK}`, opacity: 0.06 })]));
  lit.appendChild(el('rect', { x: LX, y: LY, width: LW, height: LH, fill: `url(#${gridId})`, 'pointer-events': 'none' }));
  lit.appendChild(el('rect', { x: LX, y: LY, width: LW, height: LH, fill: K.rgrad([[0.6, 'var(--lcd-ink)', 0], [1, 'var(--lcd-ink)', 0.12]], 0.5, 0.45, 0.85), 'pointer-events': 'none' }));
  scr.appendChild(el('path', { d: `M${LX} ${LY} L${LX + LW * 0.6} ${LY} L${LX + LW * 0.25} ${LY + LH} L${LX} ${LY + LH} Z`, style: 'fill:var(--m-paper)', opacity: 0.05, 'pointer-events': 'none' }));

  /* layout constants */
  const TB = 6.2;                            // top bar: signal, title, battery
  const SK = 5.6;                            // softkey bar
  const X0 = LX + 2.2, X1 = LX + LW - 2.2;
  const TAB_Y = LY + TB + 1.3, TAB_H = 6.2;  // the two tabs: Work with me | Contact
  const tabW = (X1 - X0 - 1.2) / 2;
  const tabs = [0, 1].map((gI) => ({ g: gI, x: X0 + gI * (tabW + 1.2), y: TAB_Y, w: tabW, h: TAB_H }));
  const LIST_Y = TAB_Y + TAB_H + 1.4, RH = 7.1;
  const IFS = MOB ? 4.35 : 4.15, SFS = MOB ? 3.45 : 3.2;
  /** where each row sits on its tab, so taps can find them */
  const rows = o.items.map((it) => { const k = o.items.filter((m) => m.group === it.group).indexOf(it); return { it, g: it.group, y: LIST_Y + k * RH, h: RH }; });
  const add = (...n) => n.forEach((x) => view.appendChild(x));
  const signal = () => g({}, [
    el('path', { d: `M${LX + 1.4} ${LY + 1.5} h2.6 l-1.3 1.6 Z M${LX + 2.7} ${LY + 3.1} v1.7`, style: `fill:${INK};stroke:${INK}`, 'stroke-width': 0.3 }),
    ...[0, 1, 2, 3].map((i) => el('rect', { x: LX + 4.5 + i * 1.15, y: LY + 4.6 - (i + 1) * 0.75, width: 0.75, height: (i + 1) * 0.75, style: `fill:${INK}` })),
  ]);
  const battery = () => g({}, [
    el('rect', { x: LX + LW - 6.2, y: LY + 1.9, width: 4.3, height: 2.5, fill: 'none', style: `stroke:${INK}`, 'stroke-width': 0.35 }),
    el('rect', { x: LX + LW - 1.9, y: LY + 2.6, width: 0.55, height: 1.1, style: `fill:${INK}` }),
    el('rect', { x: LX + LW - 5.7, y: LY + 2.4, width: 3.3, height: 1.5, style: `fill:${INK}` }),
  ]);
  function topBar(title) {
    add(signal(), battery());
    if (title) add(fit(pix(title, LX + LW / 2, LY + TB - 1.75, { size: 3.5, anchor: 'middle', weight: 600 }), LW - 20));
    add(el('path', { d: `M${LX + 1.2} ${LY + TB} H${LX + LW - 1.2}`, style: `stroke:${INK}`, 'stroke-width': 0.3 }));
  }
  function softkeys(left, right) {
    const y = LY + LH - SK;
    add(el('path', { d: `M${LX + 1.2} ${y} H${LX + LW - 1.2}`, style: `stroke:${INK}`, 'stroke-width': 0.25, 'stroke-dasharray': '0.6 0.6' }));
    if (left) add(pix(left, X0, LY + LH - 1.7, { size: SFS, weight: 600 }));
    if (right) add(pix(right, X1, LY + LH - 1.7, { size: SFS, anchor: 'end', weight: 600 }));
  }
  // text must be in the document to be measured: fit() puts it in the view first (add() then keeps the order)
  const fit = (t, maxW) => { if (!t.isConnected) view.appendChild(t); try { let fs = +t.getAttribute('font-size'); while (fs > 2.2 && t.getComputedTextLength() > maxW) { fs -= 0.1; t.setAttribute('font-size', fs.toFixed(2)); } } catch (e) {} return t; };
  const center = (s, y, size, op = {}) => fit(pix(s, LX + LW / 2, y, { size, anchor: 'middle', ...op }), LW - 4);
  const envelope = (x, y, s) => g({}, [el('rect', { x, y, width: 9 * s, height: 6 * s, fill: 'none', style: `stroke:${INK}`, 'stroke-width': 0.55 * s }), el('path', { d: `M${x} ${y} L${x + 4.5 * s} ${y + 3.4 * s} L${x + 9 * s} ${y}`, fill: 'none', style: `stroke:${INK}`, 'stroke-width': 0.55 * s })]);
  const glyphs = {
    // small 9x9 marks drawn in LCD ink for the detail screens
    email: (x, y, s) => envelope(x, y + 1.5 * s, s),
    form: (x, y, s) => g({}, [el('rect', { x, y, width: 7 * s, height: 9 * s, rx: 0.6 * s, fill: 'none', style: `stroke:${INK}`, 'stroke-width': 0.55 * s }), ...[2.4, 4.4, 6.4].map((yy) => el('path', { d: `M${x + 1.6 * s} ${y + yy * s}H${x + 5.4 * s}`, style: `stroke:${INK}`, 'stroke-width': 0.5 * s })), el('path', { d: `M${x + 6.4 * s} ${y + 6.4 * s}l2.2 -2.2`, style: `stroke:${INK}`, 'stroke-width': 0.7 * s })]),
    social: (key, x, y, s) => { const ic = o.content.ICONS[key]; return ic ? el('path', { d: ic.path, style: `fill:${INK}`, transform: `translate(${x} ${y}) scale(${(9 * s / 24).toFixed(4)})` }) : g(); },
  };

  /** Draw one state. st = { mode, sel, copied, dialed, blink, snake } */
  function render(st) {
    view.replaceChildren();
    const items = o.items;
    if (st.mode === 'notify') {
      add(signal(), battery());
      const env = envelope(LX + LW / 2 - 6.3, LY + 10, 1.4);
      if (st.blink) env.setAttribute('opacity', 0.25);
      add(env);
      add(center('1 new', LY + 27.5, 4.6, { weight: 600 }), center('message', LY + 32.8, 4.2));
      softkeys('Read', '');
    } else if (st.mode === 'menu') {
      topBar("Let's work");
      const cur = items[st.sel].group;
      const tl = tabs.map((t) => {
        const on = t.g === cur;
        add(el('rect', { x: t.x, y: t.y, width: t.w, height: t.h, rx: 1, style: on ? `fill:${INK}` : `fill:none;stroke:${INK}`, 'stroke-width': 0.35 }));
        const lab = fit(pix(GROUPS[t.g], t.x + t.w / 2, t.y + t.h - 1.85, { size: 3.05, anchor: 'middle', weight: 600, fill: on ? BG : INK }), t.w - 1.4);
        add(lab);
        return lab;
      });
      // both tabs at the same size
      const fsT = Math.min(...tl.map((t) => +t.getAttribute('font-size')));
      tl.forEach((t) => t.setAttribute('font-size', fsT));
      for (const r of rows) {
        if (r.g !== cur) continue;
        const on = items[st.sel] === r.it;
        if (on) add(el('rect', { x: X0 - 0.6, y: r.y + 0.35, width: X1 - X0 + 1.2, height: r.h - 0.7, rx: 0.6, style: `fill:${INK}` }));
        const col = on ? BG : INK;
        add(pix(String(r.it.n), X0 + 0.8, r.y + r.h - 1.9, { size: IFS, fill: col, weight: 600 }));
        add(fit(pix(r.it.label, X0 + 4.6, r.y + r.h - 1.9, { size: IFS, fill: col }), X1 - X0 - 5.2));
      }
      if (cur === 0) {
        // the address, right there under the menu
        const t = pix(o.items[0].value, LX + LW / 2, LIST_Y + 2 * RH + 5.4, { size: 2.75, anchor: 'middle' });
        add(fit(t, LW - 4.4));
      }
      softkeys('Select', cur === 0 ? 'Contact' : 'Work');
    } else if (st.mode === 'item') {
      const it = items[st.sel];
      topBar(`${it.n} ${it.title}`);
      const gx = LX + LW / 2 - 6.3, gy = LY + TB + 3.4, s = 1.4;
      if (it.key === 'email') add(glyphs.email(gx, gy, s));
      else if (it.key === 'form') add(glyphs.form(LX + LW / 2 - 4.9, gy, s));
      else add(glyphs.social(it.key, LX + LW / 2 - 6.3, gy, s));
      const y0 = LY + TB + 22;
      if (it.key === 'email') {
        const [u, d] = it.value.split('@');
        add(center(u, y0, 3.6), center('@' + d, y0 + 4.6, 3.6));
        if (st.copied) { add(el('rect', { x: LX + LW / 2 - 8, y: y0 + 7.4, width: 16, height: 5, rx: 0.8, style: `fill:${INK}` })); add(center('copied', y0 + 11.1, 3.3, { fill: BG })); }
        softkeys('Send', 'Back');
      } else if (it.key === 'form') {
        add(center('Consultation', y0, 3.7, { weight: 600 }), center('form', y0 + 4.6, 3.7, { weight: 600 }));
        add(center('opens a new tab', y0 + 10, 2.8));
        softkeys('Open', 'Back');
      } else {
        add(center(it.handle, y0, 3.7, { weight: 600 }));
        if (it.followers) add(center(`${it.followers} followers`, y0 + 5, 3.1));
        add(center('opens a new tab', y0 + (it.followers ? 10 : 5.6), 2.8));
        softkeys('Open', 'Back');
      }
    } else if (st.mode === 'open') {
      const it = items[st.sel];
      topBar(it.title);
      add(center('opening', LY + 24, 3.8), center(it.handle || (it.key === 'form' ? 'the form' : ''), LY + 29.4, 3.4));
      add(center('.'.repeat(1 + (st.dots || 0)), LY + 34, 4));
      softkeys('', 'Back');
    } else if (st.mode === 'dial') {
      add(signal(), battery());
      const s = st.dialed.length > 9 ? '…' + st.dialed.slice(-9) : st.dialed;
      add(fit(pix(s, X1, LY + 25, { size: st.dialed.length > 6 ? 5 : 6.6, anchor: 'end', weight: 600 }), LW - 4));
      softkeys('Call', 'Clear');
    } else if (st.mode === 'calling') {
      topBar('Calling');
      add(center(st.dialed.length > 10 ? '…' + st.dialed.slice(-10) : st.dialed, LY + 21, 3.8));
      add(center('.'.repeat(1 + (st.dots || 0)), LY + 27, 4.4));
      softkeys('', 'End');
    } else if (st.mode === 'callee') {
      topBar('Call');
      ['where did you', 'even get my', 'number?'].forEach((l, i) => add(center(l, LY + 17 + i * 5.2, 3.6)));
      softkeys('', 'End');
    } else if (st.mode === 'snake') {
      drawSnake(st.snake);
    } else if (st.mode === 'hero') {
      // the hero tile is small: one big line
      add(signal(), battery());
      add(center("Let's", LY + 21, 8.4, { weight: 600 }), center('work', LY + 30.5, 8.4, { weight: 600 }));
      softkeys('Work', 'Contact');
    }
  }

  /* snake grid */
  const GX = LX + 2.2, GY = LY + 6.4, GC = 1.6;
  const GWc = Math.floor((LW - 4.4) / GC), GHc = Math.floor((LY + LH - 1.6 - GY) / GC);
  function drawSnake(s) {
    add(pix(String(s.score).padStart(4, '0'), GX, LY + 4.6, { size: 3.4 }));
    add(pix('snake', LX + LW - 2.2, LY + 4.6, { size: 3, anchor: 'end' }));
    add(el('rect', { x: GX - 0.4, y: GY - 0.4, width: GWc * GC + 0.8, height: GHc * GC + 0.8, fill: 'none', style: `stroke:${INK}`, 'stroke-width': 0.3 }));
    let d = '';
    for (const [x, y] of s.body) d += `M${(GX + x * GC + 0.1).toFixed(2)} ${(GY + y * GC + 0.1).toFixed(2)}h${GC - 0.2}v${GC - 0.2}h${-(GC - 0.2)}Z`;
    add(el('path', { d, style: `fill:${INK}` }));
    if (s.food) { const [fx, fy] = s.food; const h = GC / 2 - 0.15; add(el('path', { d: `M${GX + fx * GC + GC / 2} ${GY + fy * GC + 0.15}l${h} ${h}l${-h} ${h}l${-h} ${-h}Z`, style: `fill:${INK}` })); }
    if (s.over) {
      add(el('rect', { x: LX + LW / 2 - 12, y: LY + 17, width: 24, height: 11, style: `fill:${BG};stroke:${INK}`, 'stroke-width': 0.35 }));
      add(center('game over', LY + 21.8, 3.4, { weight: 600 }), center(`score ${s.score}`, LY + 26, 3.1));
    }
  }
  return { off, lit, render, rows, tabs, GWc, GHc, LX, LY, LW, LH };
}

/* ====================================================================================================== */
/* the section device                                                                                      */
/* ====================================================================================================== */
export default async function build(ctx) {
  const { K, iso, root, sound, content } = ctx;
  const { P, mul } = iso;
  const { SITE, SOCIALS } = content;
  const MOB = ctx.mobile, RED = ctx.reduced;
  try { await document.fonts?.ready; } catch (e) {}
  const ITEMS = menuItems(content);
  const dev = drawPhone(K, iso, root, { mobile: MOB });
  const ui = makeScreen(K, iso, dev, { mobile: MOB, items: ITEMS, content });

  /* ---------------- state ---------------- */
  let power = false, mode = 'off', sel = 0, dialed = '', copied = false, statusKey = '', pendingGo = null;
  let snake = null, timer = null, blinkT = 0, dots = 0;
  let swingA = 0, swingV = 0;
  const st = () => ({ mode, sel, copied, dialed, blink: Math.floor(blinkT * 2) % 2 === 1 && !RED, dots, snake });
  function render() { ui.render(st()); updateStatus(); }
  function updateStatus() {
    let html;
    const it = ITEMS[sel];
    if (mode === 'off') html = 'off';
    else if (mode === 'notify') html = 'message · <b>1</b> new';
    else if (mode === 'menu') html = `menu · <b>${it.n}</b> ${it.label.toLowerCase()}`;
    else if (mode === 'item') html = it.key === 'email' ? (copied ? `email · <b>copied</b>${MOB ? '' : ' · call to send'}` : `email · <b>${SITE.workEmail}</b>`) : `${it.key === 'form' ? 'form' : it.label.toLowerCase()} · ${MOB ? '<b>call</b> to open' : `press <b>call</b> to open`}`;
    else if (mode === 'open') html = `opening · <b>${it.title}</b>`;
    else if (mode === 'dial' || mode === 'calling') html = `${mode === 'dial' ? 'dial' : 'calling'} · <b>${dialed.slice(-10)}</b>`;
    else if (mode === 'callee') html = 'call · <b>ended</b>';
    else if (mode === 'snake') html = `snake · <b>${snake ? snake.score : 0}</b>${snake && snake.over ? ' · game over' : ''}`;
    if (html === statusKey) return;
    statusKey = html; ctx.status(html); ctx.dot(power);
  }

  /* ---------------- snake ---------------- */
  function startSnake() {
    const mid = Math.floor(ui.GHc / 2);
    snake = { body: [[6, mid], [5, mid], [4, mid]], dir: [1, 0], next: [1, 0], food: null, score: 0, over: false, acc: 0 };
    placeFood();
    mode = 'snake';
    render();
  }
  function placeFood() {
    for (let t = 0; t < 200; t++) { const f = [Math.floor(Math.random() * ui.GWc), Math.floor(Math.random() * ui.GHc)]; if (!snake.body.some(([x, y]) => x === f[0] && y === f[1])) { snake.food = f; return; } }
  }
  function steer(dx, dy) { if (!snake || snake.over) return; if (dx === -snake.dir[0] && dy === -snake.dir[1]) return; snake.next = [dx, dy]; }
  function tickSnake() {
    const s = snake; if (!s || s.over) return;
    s.dir = s.next;
    const h = [s.body[0][0] + s.dir[0], s.body[0][1] + s.dir[1]];
    if (h[0] < 0 || h[1] < 0 || h[0] >= ui.GWc || h[1] >= ui.GHc || s.body.some(([x, y]) => x === h[0] && y === h[1])) { s.over = true; sound.beep(220, 0.25, 'square', 0.04); render(); return; }
    s.body.unshift(h);
    if (h[0] === s.food[0] && h[1] === s.food[1]) { s.score++; sound.blip(1320, 0.05); placeFood(); } else s.body.pop();
    render();
  }

  /* ---------------- power + the buzz ---------------- */
  function powerOn() {
    if (power) return;
    power = true;
    ui.off.setAttribute('opacity', 0);
    ui.lit.style.transition = 'opacity .3s'; ui.lit.setAttribute('opacity', 1);
    dev.cled.style.fill = 'var(--m-accent)'; dev.cledGlow.setAttribute('opacity', 0.75);
    mode = 'notify';
    render();
    if (pendingGo) { const p = pendingGo; pendingGo = null; showItem(p); }
  }
  const kick = (v) => { if (!RED) swingV += v; };
  function buzz() {
    if (RED) return;
    kick(55); setTimeout(() => kick(-45), 600);
    const t0 = performance.now();
    const stepF = (now) => {
      const t = (now - t0) / 1000;
      const on = (t < 0.42) || (t > 0.6 && t < 1.02);
      const k = on ? 1 : 0;
      const dx = k * Math.sin(t * 190) * 0.55, dy = k * Math.cos(t * 230) * 0.35;
      dev.shakeG.setAttribute('transform', `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
      if (t < 1.1) requestAnimationFrame(stepF); else dev.shakeG.removeAttribute('transform');
    };
    requestAnimationFrame(stepF);
    sound.motor(0.4);
    setTimeout(() => sound.motor(0.4), 600);
    // the message tone: S M S in Morse
    [[0, 0.06], [0.11, 0.06], [0.22, 0.06], [0.42, 0.18], [0.66, 0.18], [0.94, 0.06], [1.05, 0.06], [1.16, 0.06]].forEach(([at, d]) => setTimeout(() => sound.beep(1760, d, 'square', 0.035), 1150 + at * 1000));
  }

  /* ---------------- links and copies: they need a real user activation ---------------- */
  // on touch, that is the click that follows the pointerdown, so the action waits for it
  let inputKind = 'key', pending = null, pendingAt = 0;
  const noteInput = (e) => { inputKind = !e || e.type === 'keydown' ? 'key' : e.pointerType || 'mouse'; };
  const activated = (fn) => { if (inputKind === 'key' || inputKind === 'mouse') fn(); else { pending = fn; pendingAt = performance.now(); } };
  document.addEventListener('click', () => { if (pending && performance.now() - pendingAt < 1500) pending(); pending = null; }, true);
  const openUrl = (href) => { const w = window.open(href, '_blank', 'noopener'); return !!w; };
  const copyEmail = () => navigator.clipboard?.writeText(SITE.workEmail).then(() => { copied = true; if (mode === 'item' && ITEMS[sel].key === 'email') render(); }).catch(() => {});

  /** Show one item's screen. Copies the email when it comes from a real press; never opens anything by itself. */
  function showItem(i, fromUser = false) {
    sel = i; mode = 'item';
    if (ITEMS[i].key === 'email') { copied = false; if (fromUser) activated(copyEmail); }
    render();
  }
  /** Open the item on screen (call key, centre key or a tap). */
  function openItem() {
    const it = ITEMS[sel];
    if (it.key === 'email') { activated(() => { window.location.href = SITE.workEmailHref; }); sound.approve(); return; }
    mode = 'open'; dots = 0;
    activated(() => openUrl(it.href));
    sound.approve();
    render();
    clearTimeout(timer);
    timer = setTimeout(() => { if (mode === 'open') { mode = 'item'; render(); } }, 2600);
  }
  function back() {
    clearTimeout(timer);
    if (mode === 'menu') return;
    if (mode === 'snake') snake = null;
    mode = 'menu';
    render();
  }

  /* ---------------- keys ---------------- */
  const pushIn = (node, d) => {
    const v = P(mul(dev.nF, -d));
    node.classList.add('press', 'down');
    node.style.transform = `translate(${v[0].toFixed(3)}px, ${v[1].toFixed(3)}px)`;
    clearTimeout(node._pt);
    node._pt = setTimeout(() => { node.classList.remove('down'); node.style.transform = ''; }, 120);
  };
  function pressKey(d) {
    kick((Math.random() - 0.5) * 14);
    const k = dev.padKeys.get(d);
    if (k) pushIn(k.inner, 1.1);
    sound.dtmf(d);
    if (!power) { powerOn(); return; }
    if (mode === 'notify') { mode = 'menu'; render(); return; }
    if (mode === 'snake') {
      if (snake.over) { if (d === '0' || d === '#' || d === '5') startSnake(); else back(); return; }
      if (d === '2') steer(0, -1); else if (d === '8') steer(0, 1); else if (d === '4') steer(-1, 0); else if (d === '6') steer(1, 0);
      return;
    }
    if (mode === 'menu' && (d === '0' || d === '#')) { startSnake(); return; }
    if ((mode === 'menu' || mode === 'item' || mode === 'open') && +d >= 1 && +d <= ITEMS.length) {
      dialed = '';
      // the same digit again on its own screen opens it
      if (mode === 'item' && sel === +d - 1) { openItem(); return; }
      showItem(+d - 1, true);
      return;
    }
    if (mode === 'callee' || mode === 'calling') return;
    if (mode !== 'dial') dialed = '';
    mode = 'dial';
    dialed += d;
    render();
  }
  function call() {
    pushIn(dev.callK.inner, 1.1);
    sound.click();
    if (!power) { powerOn(); return; }
    if (mode === 'notify') { mode = 'menu'; render(); return; }
    if (mode === 'menu') { showItem(sel, true); return; }
    if (mode === 'item' || mode === 'open') { openItem(); return; }
    if (mode === 'dial' && dialed) {
      mode = 'calling'; dots = 0; render();
      clearTimeout(timer);
      timer = setTimeout(() => { if (mode !== 'calling') return; sound.beep(440, 0.3, 'sine', 0.05); mode = 'callee'; render(); }, 1800);
    }
  }
  function end() {
    pushIn(dev.endK.inner, 1.1);
    sound.click();
    if (!power) { powerOn(); return; }
    clearTimeout(timer);
    if (mode === 'dial' && dialed.length > 1) { dialed = dialed.slice(0, -1); render(); return; }
    dialed = '';
    if (mode === 'notify') { mode = 'menu'; render(); return; }
    if (mode === 'menu') { switchTab(); return; }
    back();
  }
  /** The other tab: Work with me <-> Contact. */
  function switchTab(to) {
    const g = to ?? (ITEMS[sel].group ? 0 : 1);
    sel = ITEMS.findIndex((m) => m.group === g);
    sound.tick();
    render();
  }
  function nav(dir) {
    // dir: -1 up, 1 down, 0 select
    pushIn(dev.navK.inner, 0.9);
    sound.tick();
    if (!power) { powerOn(); return; }
    if (mode === 'notify') { mode = 'menu'; render(); return; }
    if (mode === 'snake') { if (dir) steer(0, dir); else if (snake.over) startSnake(); return; }
    if (mode === 'menu') { if (dir) { sel = (sel + dir + ITEMS.length) % ITEMS.length; render(); } else showItem(sel, true); return; }
    if (mode === 'item') { if (dir) { sel = (sel + dir + ITEMS.length) % ITEMS.length; showItem(sel, true); } else openItem(); return; }
    if (dir === 0 && mode === 'dial') { call(); return; }
    if (dir === 0 && (mode === 'open' || mode === 'callee')) back();
  }
  /** A tap on the screen: a row in the menu, or the item itself. */
  function screenTap(e) {
    if (!power) { powerOn(); return; }
    if (mode === 'notify') { sound.tick(); mode = 'menu'; render(); return; }
    if (mode === 'menu') {
      let a = null, b = null;
      if (e && e.clientX != null) [a, b] = toLocal(dev.scrPl, e.clientX, e.clientY);
      if (a == null) { showItem(sel, true); return; }
      const tab = ui.tabs.find((t) => a >= t.x - 0.6 && a <= t.x + t.w + 0.6 && b >= t.y - 1 && b <= t.y + t.h + 0.6);
      if (tab) { switchTab(tab.g); return; }
      if (b > ui.LY + ui.LH - 6.5) { if (a > ui.LX + ui.LW / 2) switchTab(); else showItem(sel, true); return; }
      const g = ITEMS[sel].group;
      const r = ui.rows.find((rr) => rr.g === g && b >= rr.y && b < rr.y + rr.h);
      sound.tick();
      if (r) showItem(ITEMS.indexOf(r.it), true);
      return;
    }
    if (mode === 'item') {
      // the bottom strip is the softkeys: left opens, right goes back
      let a = null, b = null;
      if (e && e.clientX != null) [a, b] = toLocal(dev.scrPl, e.clientX, e.clientY);
      if (b != null && b > ui.LY + ui.LH - 7 && a > ui.LX + ui.LW / 2) { sound.click(); back(); return; }
      openItem();
      return;
    }
    if (mode === 'snake') { if (snake.over) startSnake(); return; }
    if (mode === 'callee' || mode === 'open') { back(); return; }
    if (mode === 'dial') { call(); return; }
  }

  /* ---------------- onGo: select and show, never open ---------------- */
  ctx.onGo((p) => {
    const a = String(p?.action || p?.key || '').toLowerCase();
    const i = ITEMS.findIndex((m) => m.key === a || (a === 'twitter' && m.key === 'x') || (a === 'consultation' && m.key === 'form'));
    if (i < 0) return;
    if (!power) { pendingGo = i; return; }
    clearTimeout(timer);
    snake = null; dialed = '';
    showItem(i, false);
  });

  /* ---------------- interaction ---------------- */
  for (const s2 of [ctx.svg, ctx.foreSvg]) { s2.style.userSelect = 'none'; s2.style.webkitUserSelect = 'none'; }
  const svg = ctx.svg;
  function toLocal(pl, cx, cy) {
    const m = svg.getScreenCTM(); if (!m) return [0, 0];
    const pt = new DOMPoint(cx, cy).matrixTransform(m.inverse());
    const [ua, ub] = P(pl.u), [va, vb] = P(pl.v), [ox, oy] = P(pl.o);
    const det = ua * vb - va * ub, dx = pt.x - ox, dy = pt.y - oy;
    return [(dx * vb - va * dy) / det, (ua * dy - dx * ub) / det];
  }
  dev.padKeys.forEach((k, d) => {
    k.outer.classList.add('hit');
    k.outer.style.cursor = 'pointer';
    k.outer.addEventListener('pointerdown', (e) => { if (e.button > 0) return; e.preventDefault(); ctx.arm(); noteInput(e); pressKey(d); });
  });
  ctx.hit(dev.callK.outer, 'Call key: open', (e) => { noteInput(e); call(); });
  ctx.hit(dev.endK.outer, 'End key: back, or the other tab', (e) => { noteInput(e); end(); });
  ctx.hit(dev.navK.outer, 'Navigation key: up, select, down', (e) => {
    noteInput(e);
    if (e.type !== 'pointerdown') { nav(0); return; }
    const [, b] = toLocal(dev.front, e.clientX, e.clientY);
    nav(b < dev.NCY - dev.NRY * 0.38 ? -1 : b > dev.NCY + dev.NRY * 0.38 ? 1 : 0);
  });
  ctx.hit(dev.pwrKey, 'Power key', () => { pushIn(dev.pwrKey, 0.8); sound.click(); if (!power) powerOn(); else { mode = 'notify'; render(); buzz(); } });
  const scrHit = iso.face(dev.scrPl, [iso.el('rect', { x: dev.LX, y: dev.LY, width: dev.LW, height: dev.LH, style: 'fill:var(--lcd)', 'fill-opacity': 0 })], 0.05);
  root.appendChild(scrHit);
  ctx.hit(scrHit, 'Screen: pick a tab or a row, then tap again to open', (e) => { noteInput(e); screenTap(e); });
  [dev.callK.outer, dev.endK.outer, dev.navK.outer, scrHit].forEach((n) => (n.style.touchAction = 'manipulation'));

  ctx.onKey = (e) => {
    if (e.defaultPrevented) return false;
    const k = e.key;
    inputKind = 'key';
    if (/^[0-9*#]$/.test(k)) { pressKey(k); return true; }
    if (k === 'ArrowUp') { if (mode === 'snake') { steer(0, -1); return true; } nav(-1); return true; }
    if (k === 'ArrowDown') { if (mode === 'snake') { steer(0, 1); return true; } nav(1); return true; }
    if (mode === 'snake' && (k === 'ArrowLeft' || k === 'ArrowRight')) { steer(k === 'ArrowLeft' ? -1 : 1, 0); return true; }
    if (mode === 'menu' && (k === 'ArrowLeft' || k === 'ArrowRight')) { switchTab(k === 'ArrowLeft' ? 0 : 1); return true; }
    if (k === 'Enter') { if (mode === 'dial' || mode === 'item') call(); else nav(0); return true; }
    if (k === 'Backspace') { end(); return true; }
    return false;
  };

  ctx.raf((dt) => {
    if (swingA || swingV) {
      // a damped pendulum (degrees)
      swingV += (-38 * swingA - 2.4 * swingV) * dt;
      swingA += swingV * dt;
      if (Math.abs(swingA) < 0.02 && Math.abs(swingV) < 0.05) { swingA = 0; swingV = 0; }
      dev.swingG.setAttribute('transform', `rotate(${swingA.toFixed(2)} ${dev.swingPivot[0].toFixed(2)} ${dev.swingPivot[1].toFixed(2)})`);
    }
    if (!power) return;
    const b0 = Math.floor(blinkT * 2), d0 = Math.floor(blinkT * 3) % 3;
    blinkT += dt;
    if (mode === 'notify' && !RED && Math.floor(blinkT * 2) !== b0) render();
    if ((mode === 'calling' || mode === 'open') && Math.floor(blinkT * 3) % 3 !== d0) { dots = Math.floor(blinkT * 3) % 3; render(); }
    if (mode === 'snake' && snake && !snake.over) {
      snake.acc += dt;
      const sp = Math.max(0.09, 0.17 - snake.score * 0.005);
      while (snake.acc > sp) { snake.acc -= sp; tickSnake(); }
    }
  });

  ctx.a11y(`<p>Work with me: email <a href="${SITE.workEmailHref}">${SITE.workEmail}</a>, or fill in the <a href="${SITE.consultationForm}" target="_blank" rel="noopener">consultation form</a>.</p><p>Contact:</p><ul>${SOCIALS.map((s) => `<li><a href="${s.href}" target="_blank" rel="noopener">${s.label} ${s.handle}</a></li>`).join('')}</ul>`);
  {
    // frame the phone and its dock; the soft shadow may spill past the frame
    const soft = [...root.querySelectorAll('.shadow')];
    soft.forEach((n) => (n.style.display = 'none'));
    const b = root.getBBox();
    soft.forEach((n) => (n.style.display = ''));
    const pad = MOB ? 8 : 12;
    ctx.view(b.x - pad, b.y - pad, b.width + pad * 2, b.height + pad * 2);
  }
  updateStatus();

  return {
    plotted() { powerOn(); buzz(); },
    start() {},
    stop() { clearTimeout(timer); },
  };
}

/* ====================================================================================================== */
/* the hero tile: the phone, lit, on "Let's work"                                                          */
/* ====================================================================================================== */
export async function hero(hx) {
  const { K, iso, root, content } = hx;
  try { await document.fonts?.ready; } catch (e) {}
  const ITEMS = menuItems(content);
  const dev = drawPhone(K, iso, root, { mobile: hx.mobile, hero: true });
  const ui = makeScreen(K, iso, dev, { mobile: false, items: ITEMS, content });
  ui.off.setAttribute('opacity', 0);
  ui.lit.setAttribute('opacity', 1);
  dev.cled.style.fill = 'var(--m-accent)'; dev.cledGlow.setAttribute('opacity', 0.75);
  ui.render({ mode: 'hero', sel: 0, copied: false, dialed: '', blink: false, dots: 0, snake: null });
}
