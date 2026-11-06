// 02 · Brands · Music player.
// A click-wheel player standing in its dock, her headphones beside it. The player is turned a little towards you so
// its screen reads almost square-on. The screen is a "Now Playing" view of ONE brand at a time: its logo, big (drawn in
// LCD ink, so it follows every theme), and its name. Nothing else: no tiers, no stars, no counters. The brands come
// biggest first, and a plain progress bar shows how far down the list you are.
// Spin the wheel, skip or press the centre to slide through them, a tick per brand. Tap the screen to open the brand's
// collab post (her Instagram reel or X post) in a new tab; the title bar says "Tap to watch" when there is one. Play/pause
// shuffles (a slot-machine spin), MENU goes back to the first brand (and from there to the empty slot at the end, for
// your brand). Left alone it plays through them by itself.
const D2R = Math.PI / 180;
const MASKS = new Map(); // tile slug -> Promise<{ url, w, h }>, shared by the hero and the section
const NO_TILE = new Set(['gamedev']); // a screenshot rather than a logo: a wordmark reads better

/** The 40 brands, biggest first (data/collabs.json, or content.js until that exists). */
function brandList(content, data) {
  const rows = data?.collabs?.brands?.length
    ? data.collabs.brands.map((b) => ({ rank: b.rank, name: b.name, logo: b.logo || {}, post: b.post || b.reel?.link || null }))
    : content.CLIENTS.map((c) => ({ rank: c.rank, name: c.name, logo: { tile: c.tile, bg: c.bg, icon: c.icon } }));
  return rows.sort((a, b) => a.rank - b.rank);
}

/**
 * A logo tile as a one-colour alpha mask: every pixel is inked by how far it is from the tile's background
 * (flat, or a gradient rebuilt from the borders), then the result is cropped to the logo. Drawn as
 * <rect fill=var(--lcd-ink) mask=...>, so the logo is LCD ink on the LCD in every theme.
 */
function tileMask(src, bg) {
  const key = src + '|' + (bg || '');
  if (MASKS.has(key)) return MASKS.get(key);
  const job = (async () => {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
    const S = 192;
    const cv = document.createElement('canvas'); cv.width = cv.height = S;
    const c = cv.getContext('2d', { willReadFrequently: true });
    c.fillStyle = bg || 'black'; c.fillRect(0, 0, S, S); // compositing only, never shown
    c.drawImage(img, 0, 0, S, S);
    const px = c.getImageData(0, 0, S, S).data;
    const rgb = (x, y) => { const i = (y * S + x) * 4; return [px[i], px[i + 1], px[i + 2]]; };
    const HW = 34;
    const medEdge = (get) => {
      const raw = []; for (let i = 0; i < S; i++) raw.push(get(i));
      return raw.map((_, i) => { const lo = Math.max(0, i - HW), hi = Math.min(S, i + HW + 1); const out = [0, 0, 0]; for (let k = 0; k < 3; k++) { const v = []; for (let j = lo; j < hi; j++) v.push(raw[j][k]); v.sort((a, b) => a - b); out[k] = v[v.length >> 1]; } return out; });
    };
    const T = medEdge((i) => rgb(i, 0)), B = medEdge((i) => rgb(i, S - 1)), L = medEdge((i) => rgb(0, i)), R = medEdge((i) => rgb(S - 1, i));
    const TL = T[0], TR = T[S - 1], BL = B[0], BR = B[S - 1];
    const ring = []; for (let i = 0; i < S; i++) ring.push(rgb(i, 0), rgb(i, S - 1), rgb(0, i), rgb(S - 1, i));
    const med = [0, 1, 2].map((k) => { const v = ring.map((p) => p[k]).sort((a, b) => a - b); return v[v.length >> 1]; });
    const flat = ring.filter((p) => Math.hypot(p[0] - med[0], p[1] - med[1], p[2] - med[2]) < 40).length / ring.length > 0.7;
    const d = new Float32Array(S * S);
    for (let y = 0; y < S; y++) {
      const v = y / (S - 1);
      for (let x = 0; x < S; x++) {
        const u = x / (S - 1), i = (y * S + x) * 4;
        let s = 0;
        for (let k = 0; k < 3; k++) {
          const b = flat ? med[k] : (1 - u) * L[y][k] + u * R[y][k] + (1 - v) * T[x][k] + v * B[x][k] - ((1 - u) * (1 - v) * TL[k] + u * (1 - v) * TR[k] + (1 - u) * v * BL[k] + u * v * BR[k]);
          const q = px[i + k] - b; s += q * q;
        }
        d[y * S + x] = Math.sqrt(s);
      }
    }
    const dmax = Float32Array.from(d).sort()[Math.floor(S * S * 0.995)];
    const lo = 66, hi = Math.max(lo + 40, dmax * 0.52);
    const ink = new Float32Array(S * S);
    let x0 = S, y0 = S, x1 = -1, y1 = -1;
    for (let i = 0; i < S * S; i++) {
      const t = Math.max(0, Math.min(1, (d[i] - lo) / (hi - lo)));
      const a = Math.max(0, (t * t * (3 - 2 * t) - 0.16) / 0.84); // smooth, and faint halos cut
      ink[i] = a;
      if (a > 0.3) { const x = i % S, y = (i / S) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    if (x1 < x0) throw new Error('empty logo');
    const m = 1;
    x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(S - 1, x1 + m); y1 = Math.min(S - 1, y1 + m);
    const w = x1 - x0 + 1, h = y1 - y0 + 1;
    const out = document.createElement('canvas'); out.width = w; out.height = h;
    const o = out.getContext('2d'); const im = o.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const j = (y * w + x) * 4; im.data[j] = im.data[j + 1] = im.data[j + 2] = 255; im.data[j + 3] = Math.round(ink[(y + y0) * S + x + x0] * 255); }
    o.putImageData(im, 0, 0);
    return { url: out.toDataURL('image/png'), w, h };
  })();
  job.catch(() => {});
  MASKS.set(key, job);
  return job;
}

/* ====================================================================================================== */
/* the hardware: dock, player, headphones (shared by the section and the hero)                             */
/* ====================================================================================================== */
function drawPlayer(K, iso, root, o) {
  const { g, el, face, txt, plane, shift, rrect, circle, ellipse, MAT, P, at, add, sub, mul, dot, VIEW } = iso;
  const MOB = !!o.mobile, HERO = !!o.hero;
  const part = () => { const p = g({ class: 'part' }); root.appendChild(p); return p; };
  const blur = (sd) => { const id = K.id('sblur'); K.def(el('filter', { id, filterUnits: 'userSpaceOnUse', x: -2000, y: -2000, width: 4000, height: 4000 }, [el('feGaussianBlur', { stdDeviation: sd })])); return id; };

  // the dock and player are turned by PHI about the vertical, towards the viewer
  const PHI = 28 * D2R;
  const ex = [Math.cos(PHI), -Math.sin(PHI), 0], ey = [Math.sin(PHI), Math.cos(PHI), 0];
  const Wp = (a, b, c = 0) => [ex[0] * a + ey[0] * b, ex[1] * a + ey[1] * b, c];

  /* ---------------- dimensions ---------------- */
  const DW = MOB ? 76 : 86, DD = MOB ? 44 : 50, DH = 14, DR = 13; // dock
  const PW = 64, PH = 110, PT = 11, TILT = 13 * D2R;  // player
  const sT = Math.sin(TILT), cT = Math.cos(TILT);
  const nF = Wp(0, cT, sT), up = Wp(0, -sT, cT), dn = Wp(0, sT, -cT);
  const SINK = 7;
  const bL = [(DW - PW) / 2, DD / 2 + 3.2];          // dock-local a, b of the player's bottom-front-left corner
  const bfl = Wp(bL[0], bL[1], DH - SINK);
  const tfl = add(bfl, mul(up, PH));
  const front = plane(tfl, ex, dn);                  // a = across (0..PW), b = down the face (0..PH)
  const topP = plane(sub(tfl, mul(nF, PT)), ex, nF); // a = across, b = back to front (0..PT)
  const yFrontAtDock = bL[1] - SINK * Math.tan(TILT);
  const yLip = yFrontAtDock + 1.4;
  const dTop = plane(Wp(0, 0, DH), ex, ey);
  const dFront = plane(Wp(0, DD, DH), ex, [0, 0, -1]);

  /* ---------------- headphones frame ---------------- */
  // her headphones stand on their cups behind and right of the dock (desktop); on a phone they are left out
  const PHONES = o.phones ?? !MOB;
  const HS = 0.76, PSI = -36 * D2R;
  const e1 = [Math.cos(PSI), Math.sin(PSI), 0];   // left cup -> right cup
  const EN = [-Math.sin(PSI), Math.cos(PSI), 0], EZ = [0, 0, 1]; // the band's front, and up
  const RB = 58, CS = 15, CK = 12, CH = 30, CRX = 24, CRY = 29;
  const HC = [124, -72, 0];
  const hp = (s, n, t) => add(HC, add(mul(e1, s * HS), add(mul(EN, n * HS), mul(EZ, t * HS))));
  // smooth Lambert shading that still follows the theme (the kit quantises, which bands on curved parts)
  const smooth = (mat, n) => {
    const amb = mat.amb ?? 0.46, f = amb + (1 - amb) * Math.max(0, dot(n, iso.LIGHT));
    const pct = Math.min(100, Math.round(f * 1000) / 10);
    return { col: pct >= 100 ? `var(--m-${mat.v})` : `color-mix(in oklab, var(--m-${mat.v}) ${pct}%, var(--shade))`, f };
  };
  function sprism(outline, pl, depth, mat, op = {}) {
    const base = op.base || outline, n = outline.length;
    const A3 = outline.map(([a, b]) => at(pl, a, b, 0)), B3 = base.map(([a, b]) => at(pl, a, b, -depth));
    const A = A3.map(P), B = B3.map(P);
    const grp = g();
    const sil = iso.hull(A.concat(B));
    let ar = 0; for (let i = 0; i < n; i++) { const p = outline[i], q = outline[(i + 1) % n]; ar += p[0] * q[1] - q[0] * p[1]; }
    const sgn = Math.sign(ar) || 1;
    let dark = null, dl = 1e9;
    const faces = [];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      let nn = iso.norm(iso.cross(sub(A3[j], A3[i]), sub(B3[i], A3[i])));
      const da = outline[j][0] - outline[i][0], db = outline[j][1] - outline[i][1];
      const out = add(mul(pl.u, db * sgn), mul(pl.v, -da * sgn));
      if (dot(nn, out) < 0) nn = mul(nn, -1);
      if (dot(nn, VIEW) <= 1e-4) continue;
      const s = smooth(mat, nn);
      if (s.f < dl) { dl = s.f; dark = s.col; }
      faces.push(el('path', { d: iso.dpoly([A[i], A[j], B[j], B[i]]), style: `fill:${s.col};stroke:${s.col}`, 'stroke-width': 0.45, class: 'f' }));
    }
    if (dark) grp.appendChild(el('path', { d: iso.dpoly(sil), style: `fill:${dark}`, class: 'f' }));
    faces.forEach((f) => grp.appendChild(f));
    if (dot(pl.n, VIEW) > 1e-4) { grp.appendChild(el('path', { d: iso.dpoly(A), style: `fill:${smooth(mat, pl.n).col}`, class: 'f' })); grp.appendChild(el('path', { d: iso.dpoly(A), class: 's' })); }
    grp.appendChild(el('path', { d: iso.dpoly(sil), class: 's' }));
    return grp;
  }

  /* ---------------- shadows ---------------- */
  const shG = part();
  const dockShadow = (pad, r) => el('path', { d: iso.dpoly(rrect(-pad, -pad, DW + pad * 2, DD + pad * 2, r, 8).map(([a, b]) => P(Wp(a, b, 0)))), style: 'fill:var(--shadow)', class: 'shadow' });
  { const s1 = dockShadow(6, DR + 4); s1.setAttribute('opacity', 0.7); s1.setAttribute('filter', `url(#${blur(8)})`); shG.appendChild(s1); }
  { const s2 = dockShadow(1, DR); s2.setAttribute('opacity', 0.5); s2.setAttribute('filter', `url(#${blur(2.5)})`); shG.appendChild(s2); }
  if (PHONES) for (const s of [-1, 1]) {
    const c = hp(s * (RB + (s > 0 ? CS / 2 : -CS / 2 + CK / 2)), 0, 0);
    shG.appendChild(K.shadow(ellipse(0, 0, 22 * HS, 12 * HS), 0, c[0], c[1], 0.6, blur(6)));
  }

  const hpG = PHONES ? part() : null; // they stand behind the dock, so they are drawn first

  const jack = at(topP, PW - 12, PT / 2, 0);
  const plugTop = add(jack, mul(up, 7.5));
  const sr = add(plugTop, mul(up, 3.6));

  /* ---------------- dock ---------------- */
  const dockG = part();
  dockG.appendChild(K.prism(rrect(0, 0, DW, DD, DR, 8), dTop, DH, MAT.body2));
  dockG.appendChild(face(dTop, [el('path', { d: iso.dpoly(rrect(4, 4, DW - 8, DD - 8, DR - 4, 8)), class: 's3' })], 0.02));
  const slotBack = yFrontAtDock - PT / cT - 1.6;
  dockG.appendChild(K.recess(rrect(bL[0] - 1.8, slotBack, PW + 3.6, yLip - slotBack, 2.5), dTop, 3, MAT.deep, { floorFill: 'var(--m-glass)' }));
  const dled = el('circle', { cx: DW - 13, cy: DH / 2, r: 0.95, style: 'fill:var(--m-deep)', class: 'sf' });
  const dledGlow = el('circle', { cx: DW - 13, cy: DH / 2, r: 2.6, style: 'fill:var(--m-accent)', opacity: 0, filter: `url(#${K.glowId})` });
  dockG.appendChild(face(dFront, [dledGlow, dled,
    el('path', { d: `M${DR} ${DH - 3} L${DW - DR} ${DH - 3}`, class: 's3' }),
    HERO ? null : txt('vladasana', DR + 2, DH / 2 + 1.2, { size: 2.6, fill: 'var(--t2)', ls: 0.4 })], 0.02));

  /* ---------------- player ---------------- */
  const playerG = part();
  {
    // the dock's front lip hides the bottom of the player
    const pts = [];
    const lip = [[0, yLip], [DW, yLip], ...rrect(0, 0, DW, DD, DR, 8).filter(([, y]) => y > yLip)];
    for (const [a, b] of lip) { pts.push(P(Wp(a, b, 0))); pts.push(P(Wp(a, b, DH))); }
    const cid = K.id('lip');
    K.def(el('clipPath', { id: cid }, [el('path', { d: `M-4000 -4000H4000V4000H-4000Z${iso.dpoly(iso.hull(pts))}`, 'clip-rule': 'evenodd' })]));
    playerG.setAttribute('clip-path', `url(#${cid})`);
  }
  playerG.appendChild(K.prism(rrect(0, 0, PW, PH, 8, 6), front, PT, MAT.shell));
  playerG.appendChild(face(front, [el('path', { d: iso.dpoly(rrect(1.4, 1.4, PW - 2.8, PH - 2.8, 6.8, 6)), class: 's3' })], 0.02));
  // top edge: hold switch + headphone jack
  playerG.appendChild(face(topP, [el('path', { d: iso.dpoly(rrect(8.5, 1.8, PW - 17, PT - 3.6, 2)), class: 's3' })], 0.02));
  playerG.appendChild(K.recess(rrect(10.5, PT / 2 - 1.5, 10, 3, 1.2), topP, 0.8, MAT.deep));
  const holdKnob = g();
  playerG.appendChild(holdKnob);
  playerG.appendChild(K.recess(circle(PW - 12, PT / 2, 2.1, 20), topP, 1.2, MAT.deep, { floorFill: 'var(--m-glass)' }));
  // screen
  const SX = 5.5, SY = 6.2, SW = PW - 11, SH = 48;
  playerG.appendChild(K.recess(rrect(SX - 1.7, SY - 1.7, SW + 3.4, SH + 3.4, 1.8), front, 0.5, MAT.deep, { floorFill: 'var(--m-glass)' }));
  const scr = g();
  let scrPl = null;
  playerG.appendChild(K.recess(rrect(SX, SY, SW, SH, 0.8), front, 0.9, MAT.glass, { floorFill: 'var(--m-glass)', content: (pl) => { scrPl = pl; scr.setAttribute('transform', iso.matrix(pl)); return scr; } }));
  // click wheel
  const WX = PW / 2, WR = 18.8, WY = SY + SH + 6.2 + WR, BR = 7.2;
  const wheelG = g(), wheelIn = g();
  wheelG.appendChild(wheelIn);
  const ring = K.recess(circle(WX, WY, WR, 72), front, 0.35, MAT.deep);
  wheelIn.appendChild(ring);
  const glyph = (x, y, kind) => {
    const k = 1;
    const st = 'fill:var(--t2)';
    if (kind === 'next') return el('path', { d: `M${x - 2.6 * k} ${y - 1.5 * k}L${x - 0.5 * k} ${y}L${x - 2.6 * k} ${y + 1.5 * k}ZM${x - 0.5 * k} ${y - 1.5 * k}L${x + 1.6 * k} ${y}L${x - 0.5 * k} ${y + 1.5 * k}ZM${x + 1.7 * k} ${y - 1.5 * k}H${x + 2.4 * k}V${y + 1.5 * k}H${x + 1.7 * k}Z`, style: st, class: 'f' });
    if (kind === 'prev') return el('path', { d: `M${x + 2.6 * k} ${y - 1.5 * k}L${x + 0.5 * k} ${y}L${x + 2.6 * k} ${y + 1.5 * k}ZM${x + 0.5 * k} ${y - 1.5 * k}L${x - 1.6 * k} ${y}L${x + 0.5 * k} ${y + 1.5 * k}ZM${x - 1.7 * k} ${y - 1.5 * k}H${x - 2.4 * k}V${y + 1.5 * k}H${x - 1.7 * k}Z`, style: st, class: 'f' });
    return el('path', { d: `M${x - 2.6 * k} ${y - 1.4 * k}L${x - 0.4 * k} ${y}L${x - 2.6 * k} ${y + 1.4 * k}ZM${x + 0.4 * k} ${y - 1.4 * k}H${x + 1.1 * k}V${y + 1.4 * k}H${x + 0.4 * k}ZM${x + 1.8 * k} ${y - 1.4 * k}H${x + 2.5 * k}V${y + 1.4 * k}H${x + 1.8 * k}Z`, style: st, class: 'f' });
  };
  const LR = (WR + BR) / 2 + 0.6;
  wheelIn.appendChild(face(ring.floor, [
    el('circle', { cx: WX, cy: WY, r: WR, style: 'fill:var(--m-deep)', 'fill-opacity': 0 }),
    txt('MENU', WX, WY - LR + 1.1, { size: 2.5, anchor: 'middle', fill: 'var(--t2)', ls: 0.35, weight: 500 }),
    glyph(WX + LR, WY, 'next'), glyph(WX - LR, WY, 'prev'), glyph(WX, WY + LR, 'play'),
  ], 0.02));
  playerG.appendChild(wheelG);
  const btnG = g(), btnIn = g();
  btnG.appendChild(btnIn);
  btnIn.appendChild(K.recess(circle(WX, WY, BR + 0.7, 48), front, 0.25, MAT.deep));
  btnIn.appendChild(K.prism(circle(WX, WY, BR, 48), shift(front, 0, 0, 0.5), 0.75, MAT.key));
  playerG.appendChild(btnG);

  /* ---------------- the plug, and the cable down the player's right side, over the dock, to the left cup ---------------- */
  if (PHONES) {
    const plugG = part();
    plugG.appendChild(K.prism(circle(0, 0, 2.3, 20), { o: plugTop, u: ex, v: nF, n: up }, 7.5, MAT.metal));
    plugG.appendChild(K.prism(circle(0, 0, 1.45, 16), { o: sr, u: ex, v: nF, n: up }, 3.6, MAT.rubber));
    const aR = bL[0] + PW + 3.2, bMid = yFrontAtDock - PT / cT * 0.5;
    const cupIn = hp(-RB - CS * 0.4, 9, 2.5);
    const pts = [sr, add(add(sr, mul(up, 2.4)), mul(ex, 1.2)), add(add(sr, mul(up, 3)), mul(ex, 5.5)), Wp(aR, bMid - 9, sr[2] - 16), Wp(aR + 0.6, bMid - 3, 52), Wp(aR + 1, bMid, DH + 9), Wp(aR + 2, bMid + 2, DH + 1.4), Wp(DW - 1, bMid + 5, DH + 0.9), Wp(DW + 4, bMid + 7, 4), Wp(DW + 7, bMid + 6, 1.4), [cupIn[0] - 7, cupIn[1] + 9, 1.4], cupIn];
    plugG.appendChild(K.tube(pts, 1.7, 'var(--m-rubber)'));
  }

  /* ---------------- the dock's front lip line ---------------- */
  const lipG = part();
  lipG.appendChild(face(dTop, [el('path', { d: `M${bL[0] - 1.8 + 2.5} ${yLip} L${bL[0] + PW + 1.8 - 2.5} ${yLip}`, class: 's' })], 0.03));

  /* ---------------- headphones ---------------- */
  if (PHONES) {
    const BT = 7.5, BWd = 21, ARC_T = CH + CRY + 22, TS0 = CH + CRY + 4.2, ARC_K = 0.8;
    const cl = [];
    const NSg = HERO ? 3 : 6, NA = HERO ? 44 : 90;
    for (let i = 0; i <= NSg; i++) cl.push({ s: RB, t: TS0 + (ARC_T - TS0) * (i / NSg), ns: 1, nt: 0, pad: false });
    for (let i = 1; i < NA; i++) { const q = (i / NA) * Math.PI; cl.push({ s: RB * Math.cos(q), t: ARC_T + RB * ARC_K * Math.sin(q), ns: Math.cos(q), nt: Math.sin(q) / ARC_K, pad: q > 0.3 && q < Math.PI - 0.3 }); }
    for (let i = 0; i <= NSg; i++) cl.push({ s: -RB, t: ARC_T - (ARC_T - TS0) * (i / NSg), ns: -1, nt: 0, pad: false });
    cl.forEach((c) => { const l = Math.hypot(c.ns, c.nt); c.ns /= l; c.nt /= l; });
    const bandPt = (c, rad, nn) => hp(c.s + c.ns * rad, nn, c.t + c.nt * rad);
    const PALE = MAT.pale, PAD = { v: 'rubber', amb: 0.5 };
    const drawBand = (into) => {
      const segs = [];
      for (let i = 0; i < cl.length - 1; i++) {
        const a = cl[i], b = cl[i + 1];
        const nOut = iso.norm(add(mul(e1, (a.ns + b.ns) / 2), mul(EZ, (a.nt + b.nt) / 2)));
        const ctr = hp((a.s + b.s) / 2, 0, (a.t + b.t) / 2);
        segs.push({ a, b, nOut, pad: a.pad && b.pad, depth: ctr[0] + ctr[1] + ctr[2] });
      }
      segs.sort((p, q) => p.depth - q.depth);
      const ob = BT / 2, w = BWd / 2;
      for (const sg of segs) {
        const { a, b, nOut } = sg;
        const quads = [];
        if (dot(nOut, VIEW) > 0) quads.push([smooth(PALE, nOut).col, [bandPt(a, ob, w), bandPt(b, ob, w), bandPt(b, ob, -w), bandPt(a, ob, -w)]]);
        const nIn = mul(nOut, -1);
        if (dot(nIn, VIEW) > 0) quads.push([smooth(sg.pad ? PAD : PALE, nIn).col, [bandPt(a, -ob, w), bandPt(b, -ob, w), bandPt(b, -ob, -w), bandPt(a, -ob, -w)]]);
        quads.push([smooth(PALE, EN).col, [bandPt(a, -ob, w), bandPt(b, -ob, w), bandPt(b, ob, w), bandPt(a, ob, w)]]);
        for (const [col, q] of quads) into.appendChild(el('path', { d: iso.dpoly(q.map(P)), style: `fill:${col};stroke:${col}`, 'stroke-width': 0.4, class: 'f' }));
      }
      const line = (rad, nn, test) => {
        let d = '', pen = false;
        for (const c of cl) {
          const nOut = add(mul(e1, c.ns), mul(EZ, c.nt));
          const ok = test ? test(nOut) : true;
          const p = P(bandPt(c, rad, nn));
          if (ok) { d += (pen ? 'L' : 'M') + p[0].toFixed(2) + ' ' + p[1].toFixed(2); pen = true; } else pen = false;
        }
        return el('path', { d, class: 's' });
      };
      into.appendChild(line(BT / 2, BWd / 2));
      into.appendChild(line(-BT / 2, BWd / 2));
      into.appendChild(line(BT / 2, -BWd / 2, (n) => dot(n, VIEW) > 0.02));
      into.appendChild(line(-BT / 2, -BWd / 2, (n) => dot(mul(n, -1), VIEW) > 0.02));
      if (!HERO) {
        const st = [];
        cl.forEach((c) => { if (!c.pad) return; const p = P(bandPt(c, -BT / 2 + 0.9, BWd / 2)); st.push((st.length ? 'L' : 'M') + p[0].toFixed(2) + ' ' + p[1].toFixed(2)); });
        into.appendChild(el('path', { d: st.join(''), class: 's3', 'stroke-dasharray': '0.9 0.9' }));
      }
      const marks = [];
      for (const side of [1, -1]) {
        const c0 = cl[side > 0 ? NSg : cl.length - 1 - NSg];
        const pa = P(bandPt(c0, BT / 2, BWd / 2)), pb = P(bandPt(c0, -BT / 2, BWd / 2));
        marks.push(`M${pa[0].toFixed(2)} ${pa[1].toFixed(2)}L${pb[0].toFixed(2)} ${pb[1].toFixed(2)}`);
        if (!HERO) for (let k = 1; k <= 3; k++) { const c = { s: side * RB, t: TS0 + k * 3, ns: side, nt: 0 }; const p1 = P(bandPt(c, -1.6, BWd / 2)), p2 = P(bandPt(c, 1.6, BWd / 2)); marks.push(`M${p1[0].toFixed(2)} ${p1[1].toFixed(2)}L${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`); }
      }
      into.appendChild(el('path', { d: marks.join(''), class: 's2' }));
    };
    const cupPlane = (s, outward) => { const nrm = outward > 0 ? e1 : mul(e1, -1); const u = outward > 0 ? mul(EN, -1) : EN; return { o: hp(s, 0, CH), u: mul(u, HS), v: mul(EZ, -HS), n: nrm }; };
    const YT = CH + CRY + 3.2, YN = CRX + 2.8;
    const YOKE = 'color-mix(in oklab, var(--m-pale) 62%, var(--m-metal))';
    const yokeArm = (into, s, side) => {
      const nn = side * YN;
      const pts = [hp(s, 0, YT + 0.8), hp(s, nn * 0.55, YT + 0.6), hp(s, nn * 0.92, YT - 1.4), hp(s, nn, YT - 6), hp(s, nn, CH + 3), hp(s, nn, CH)];
      into.appendChild(K.tube(pts, 2.8 * HS, YOKE));
      const pv = P(hp(s, nn, CH));
      into.appendChild(el('circle', { cx: pv[0].toFixed(2), cy: pv[1].toFixed(2), r: 1.9 * HS, style: `fill:${YOKE}`, class: 'sf' }));
    };
    const ESEG = HERO ? 44 : 90;
    const leftCupG = g();
    leftCupG.appendChild(sprism(ellipse(0, 0, CRX, CRY, ESEG), cupPlane(-RB - CS, -1), CS * HS, PALE, { base: ellipse(0, 0, CRX + 1.2, CRY + 1.2, ESEG) }));
    {
      const cp = cupPlane(-RB + CK, 1);
      leftCupG.appendChild(sprism(ellipse(0, 0, CRX + 0.6, CRY + 0.6, ESEG), cp, CK * HS, MAT.rubber, { base: ellipse(0, 0, CRX - 0.6, CRY - 0.6, ESEG) }));
      const spk = K.recess(ellipse(0, 0, CRX - 9, CRY - 9, 48), cp, 2.6 * HS, MAT.deep, { floorFill: 'var(--m-rubber)' });
      leftCupG.appendChild(spk);
      const grille = [];
      for (let i = -4; i <= 4; i++) grille.push(`M${(i * 2.6).toFixed(2)} ${-(CRY - 11)}L${(i * 2.6).toFixed(2)} ${CRY - 11}`);
      leftCupG.appendChild(face(spk.floor, [el('path', { d: grille.join(''), class: 's3' })], 0.02));
      leftCupG.appendChild(face(cp, [el('path', { d: iso.dpoly(ellipse(0, 0, CRX - 4.5, CRY - 4.5, 48)), class: 's3' })], 0.02));
    }
    const rightCupG = g();
    rightCupG.appendChild(sprism(ellipse(0, 0, CRX + 0.6, CRY + 0.6, ESEG), cupPlane(RB - CK, -1), CK * HS, MAT.rubber, { base: ellipse(0, 0, CRX - 0.6, CRY - 0.6, ESEG) }));
    {
      const cp = cupPlane(RB + CS, 1);
      rightCupG.appendChild(sprism(ellipse(0, 0, CRX - 2.2, CRY - 2.2, ESEG), cp, CS * HS, PALE, { base: ellipse(0, 0, CRX + 1.2, CRY + 1.2, ESEG) }));
      rightCupG.appendChild(face(cp, [
        el('path', { d: iso.dpoly(ellipse(0, 0, CRX - 6.5, CRY - 6.5, 48)), class: 's3' }),
        el('circle', { cx: 0, cy: 0, r: 4.2, fill: 'none', style: 'stroke:var(--m-accent)', 'stroke-width': 0.7 }),
        el('path', { d: 'M0 -2 L1.75 -1 L1.75 1 L0 2 L-1.75 1 L-1.75 -1 Z', fill: 'none', class: 's2' }),
      ], 0.03));
    }
    const depthOf = (s) => { const c = hp(s, 0, CH); return c[0] + c[1]; };
    const bandG = g();
    drawBand(bandG);
    const farSide = dot(EN, VIEW) > 0 ? -1 : 1;
    const leftG = g(), rightG = g();
    yokeArm(leftG, -RB, farSide); leftG.appendChild(leftCupG); yokeArm(leftG, -RB, -farSide);
    yokeArm(rightG, RB, farSide); rightG.appendChild(rightCupG); yokeArm(rightG, RB, -farSide);
    if (depthOf(-RB) < depthOf(RB)) { hpG.appendChild(leftG); hpG.appendChild(bandG); hpG.appendChild(rightG); }
    else { hpG.appendChild(rightG); hpG.appendChild(bandG); hpG.appendChild(leftG); }
  }

  const drawHold = (hold) => holdKnob.replaceChildren(
    K.prism(rrect(hold ? 12.1 : 15.9, PT / 2 - 1, 3.6, 2, 0.8), shift(topP, 0, 0, 0.7), 1.2, MAT.metal),
    face(topP, hold ? [el('rect', { x: 18.7, y: PT / 2 - 1, width: 1.6, height: 2, style: 'fill:var(--m-accent)' })] : [], 0.02));
  drawHold(false);

  return { shG, front, topP, nF, up, scr, scrPl, wheelG, wheelIn, btnG, btnIn, hpG, dled, dledGlow, drawHold, PW, PT, SX, SY, SW, SH, WX, WY, WR, BR };
}

/* ====================================================================================================== */
/* the screen: Now Playing, one brand at a time                                                           */
/* ====================================================================================================== */
function makeScreen(K, iso, dev, o) {
  const { g, el, txt } = iso;
  const { SX, SY, SW, SH, scr } = dev;
  const MOB = !!o.mobile;
  const INK = 'var(--lcd-ink)';
  const pix = (s, x, y, op = {}) => txt(s, x, y, { font: 'Pixelify Sans', fill: INK, ...op });
  const off = el('rect', { x: SX, y: SY, width: SW, height: SH, style: 'fill:var(--m-glass)' });
  const lit = g({ opacity: 0 });
  scr.appendChild(off); scr.appendChild(lit);
  lit.appendChild(el('rect', { x: SX, y: SY, width: SW, height: SH, style: 'fill:var(--lcd)' }));
  // sizes (desktop / mobile): the logo fills the screen down to the name, the progress bar sits at the foot
  const TB = MOB ? 5.6 : 5;
  const PADX = 3.2;
  const SBY = SY + SH - (MOB ? 3.1 : 3.3), SBH = 1.1;
  const NS = MOB ? 5.3 : 4.9;
  const NY = SBY - (MOB ? 3.9 : 4.1);
  const LBX = SX + PADX + 0.6, LBW = SW - 2 * PADX - 1.2;
  const LBY = SY + TB + (MOB ? 2.5 : 2.7), LBH = NY - NS * 0.76 - (MOB ? 2.9 : 3.1) - LBY;
  // title bar
  lit.appendChild(el('rect', { x: SX, y: SY, width: SW, height: TB, style: 'fill:color-mix(in oklab, var(--lcd) 84%, var(--lcd-ink))' }));
  lit.appendChild(el('path', { d: `M${SX} ${SY + TB} H${SX + SW}`, style: `stroke:${INK}`, 'stroke-width': 0.3 }));
  const titleT = pix('Now Playing', SX + SW / 2, SY + TB - (MOB ? 1.55 : 1.45), { size: MOB ? 3.3 : 2.9, anchor: 'middle', weight: 600 });
  const playIco = el('path', { d: '', style: `fill:${INK}` });
  const holdIco = g({ opacity: 0 }, [el('rect', { x: SX + 2.2, y: SY + TB * 0.44, width: 2.6, height: 2, style: `fill:${INK}` }), el('path', { d: `M${SX + 2.7} ${SY + TB * 0.44}V${SY + TB * 0.32}a0.8 0.8 0 0 1 1.6 0V${SY + TB * 0.44}`, fill: 'none', style: `stroke:${INK}`, 'stroke-width': 0.4 })]);
  const bx = SX + SW - 7.6, by = SY + TB / 2;
  const batt = g({}, [el('rect', { x: bx, y: by - 1.2, width: 4.8, height: 2.4, fill: 'none', style: `stroke:${INK}`, 'stroke-width': 0.35 }), el('rect', { x: bx + 4.8, y: by - 0.55, width: 0.6, height: 1.1, style: `fill:${INK}` }), el('rect', { x: bx + 0.5, y: by - 0.75, width: 2.9, height: 1.5, style: `fill:${INK}` })]);
  [titleT, playIco, holdIco, batt].forEach((n) => lit.appendChild(n));
  // the card track (cards slide sideways under the title bar)
  const track = g();
  lit.appendChild(track);
  // a plain progress bar: how far down the list (biggest first) this brand is
  const sbX = SX + PADX, sbW = SW - 2 * PADX;
  const sbBack = el('rect', { x: sbX, y: SBY, width: sbW, height: SBH, fill: 'none', style: `stroke:${INK}`, 'stroke-width': 0.28 });
  const sbFill = el('rect', { x: sbX, y: SBY, width: 0, height: SBH, style: `fill:${INK}` });
  const sbHead = el('path', { d: '', style: `fill:${INK}` });
  lit.appendChild(sbBack); lit.appendChild(sbFill); lit.appendChild(sbHead);
  // boot logo (her cube)
  const cx = SX + SW / 2, cy = SY + SH / 2;
  const bootG = g({ opacity: 0 }, [
    el('path', { d: `M${cx} ${cy - 7} l6 3.5 l0 7 l-6 3.5 l-6 -3.5 l0 -7 Z`, fill: 'none', style: `stroke:${INK}`, 'stroke-width': 0.6 }),
    el('path', { d: `M${cx} ${cy} l6 -3.5 M${cx} ${cy} l-6 -3.5 M${cx} ${cy} l0 7`, fill: 'none', style: `stroke:${INK}`, 'stroke-width': 0.6 }),
  ]);
  // LCD glass: a faint pixel grid, a vignette and a reflection
  const gridId = K.id('px');
  K.def(el('pattern', { id: gridId, width: 0.55, height: 0.55, patternUnits: 'userSpaceOnUse' }, [el('rect', { width: 0.55, height: 0.12, style: `fill:${INK}`, opacity: 0.05 }), el('rect', { width: 0.12, height: 0.55, style: `fill:${INK}`, opacity: 0.05 })]));
  lit.appendChild(el('rect', { x: SX, y: SY, width: SW, height: SH, fill: `url(#${gridId})` }));
  lit.appendChild(el('rect', { x: SX, y: SY, width: SW, height: SH, fill: K.rgrad([[0.6, 'var(--lcd-ink)', 0], [1, 'var(--lcd-ink)', 0.13]], 0.5, 0.45, 0.8) }));
  scr.appendChild(bootG);
  scr.appendChild(el('path', { d: `M${SX} ${SY} L${SX + SW * 0.62} ${SY} L${SX + SW * 0.3} ${SY + SH} L${SX} ${SY + SH} Z`, style: 'fill:var(--m-paper)', opacity: 0.05 }));

  const fitText = (t, maxW, base, min) => {
    let fs = base; t.setAttribute('font-size', fs);
    try { while (fs > min && t.getComputedTextLength() > maxW) { fs = Math.max(min, fs - 0.12); t.setAttribute('font-size', fs.toFixed(2)); } } catch (e) {}
    let s = t.textContent;
    try { while (s.length > 3 && t.getComputedTextLength() > maxW) { s = s.slice(0, -2) + '…'; t.textContent = s; } } catch (e) {}
  };

  /** The logo, as big as the box allows. Returns a group; tiles fill in when their mask is ready. */
  // a wordmark brand (no logo image or icon) shows its name once: the wordmark alone, centred in the whole screen
  // between the title bar and the progress bar
  const FULL = { x: LBX, y: LBY, w: LBW, h: SBY - (MOB ? 2.4 : 2.6) - LBY };
  const isWordmark = (b) => !b.secret && !((b.logo?.tile && !NO_TILE.has(b.logo.tile)) || (b.logo?.icon && o.content.ICONS[b.logo.icon]));
  function logo(b, onWordmark) {
    const grp = g();
    const L = b.logo || {};
    const content = o.content;
    const box = { x: LBX, y: LBY, w: LBW, h: LBH };
    const place = (w, h, maxW = box.w, maxH = box.h) => { const s = Math.min(maxW / w, maxH / h); const W = w * s, H = h * s; return { x: box.x + (box.w - W) / 2, y: box.y + (box.h - H) / 2, w: W, h: H }; };
    if (b.secret) {
      // the 41st: a slot waiting for a logo
      grp.appendChild(el('rect', { x: box.x + box.w * 0.18, y: box.y + 0.6, width: box.w * 0.64, height: box.h - 1.2, rx: 1.4, fill: 'none', style: `stroke:${INK}`, 'stroke-width': 0.45, 'stroke-dasharray': '1.4 1' }));
      grp.appendChild(pix('your logo', box.x + box.w / 2, box.y + box.h / 2 - 0.4, { size: MOB ? 3.6 : 3.3, anchor: 'middle' }));
      grp.appendChild(pix('here', box.x + box.w / 2, box.y + box.h / 2 + (MOB ? 3.9 : 3.5), { size: MOB ? 3.6 : 3.3, anchor: 'middle' }));
      return grp;
    }
    if (L.tile && !NO_TILE.has(L.tile)) {
      tileMask(content.tileUrl(L.tile), L.bg).then((m) => {
        // very wide marks get a little less width, so they do not out-shout the square ones
        const r = place(m.w, m.h, box.w * (m.w / m.h > 3 ? 0.9 : 1), box.h);
        const mid = K.id('logo');
        K.def(el('mask', { id: mid, maskUnits: 'userSpaceOnUse', x: r.x, y: r.y, width: r.w, height: r.h }, [el('image', { href: m.url, x: r.x, y: r.y, width: r.w, height: r.h, preserveAspectRatio: 'none' })]));
        grp.appendChild(el('rect', { x: r.x, y: r.y, width: r.w, height: r.h, style: `fill:${INK}`, mask: `url(#${mid})` }));
      }).catch(() => { const w = wordmark(b, FULL); grp.appendChild(w); w._fit(); onWordmark?.(); }); // the tile would not load
      return grp;
    }
    if (L.icon && content.ICONS[L.icon]) {
      const p = el('path', { d: content.ICONS[L.icon].path, style: `fill:${INK}` });
      grp.appendChild(p);
      grp._fit = () => {
        let bb; try { bb = p.getBBox(); } catch (e) { bb = null; }
        if (!bb || !bb.width) bb = { x: 0, y: 0, width: 24, height: 24 };
        const r = place(bb.width, bb.height, box.w, box.h * 0.92);
        const s = r.w / bb.width;
        p.setAttribute('transform', `translate(${(r.x - bb.x * s).toFixed(3)} ${(r.y - bb.y * s).toFixed(3)}) scale(${s.toFixed(4)})`);
      };
      return grp;
    }
    grp.appendChild(wordmark(b, FULL));
    return grp;
  }
  function wordmark(b, box) {
    // a typographic logo in one consistent style
    const t = txt(b.name, box.x + box.w / 2, box.y + box.h / 2, { size: 10, anchor: 'middle', fill: INK, font: "'Azeret Mono', ui-monospace, monospace", weight: 500, ls: -0.25 });
    t.setAttribute('dominant-baseline', 'central');
    const grp = g({}, [t]);
    grp._fit = () => {
      let fs = Math.min(box.h * 0.58, 12);
      t.setAttribute('font-size', fs);
      try { const w = t.getComputedTextLength(); if (w > box.w * 0.94) { fs *= (box.w * 0.94) / w; t.setAttribute('font-size', fs.toFixed(2)); } } catch (e) {}
    };
    return grp;
  }

  /** A whole Now Playing card for one brand: the logo and the name (once, for a wordmark brand), nothing else. */
  function card(b) {
    const grp = g();
    const name = pix(b.secret ? 'Your brand?' : b.name, SX + SW / 2, NY, { size: NS, weight: 600, anchor: 'middle' });
    const lg = logo(b, () => name.setAttribute('display', 'none'));
    grp.appendChild(lg);
    if (isWordmark(b)) name.setAttribute('display', 'none');
    grp.appendChild(name);
    grp._fit = () => {
      lg._fit?.();
      lg.firstChild?._fit?.();
      fitText(name, SW - 2 * PADX, NS, NS * 0.7);
    };
    return grp;
  }
  function setScrub(f) {
    const w = Math.max(0, Math.min(1, f)) * sbW;
    sbFill.setAttribute('width', w.toFixed(2));
    const x = sbX + w, y = SBY + SBH / 2, r = MOB ? 1.5 : 1.3;
    sbHead.setAttribute('d', `M${x.toFixed(2)} ${(y - r).toFixed(2)}L${(x + r).toFixed(2)} ${y.toFixed(2)}L${x.toFixed(2)} ${(y + r).toFixed(2)}L${(x - r).toFixed(2)} ${y.toFixed(2)}Z`);
  }
  function setTitle({ playing, hold }) {
    const y = SY + TB / 2;
    playIco.setAttribute('d', hold ? '' : playing ? `M${SX + 2.4} ${y - 1.2} L${SX + 4.4} ${y} L${SX + 2.4} ${y + 1.2} Z` : `M${SX + 2.4} ${y - 1.15}h0.75v2.3h-0.75Z M${SX + 3.75} ${y - 1.15}h0.75v2.3h-0.75Z`);
    holdIco.setAttribute('opacity', hold ? 1 : 0);
  }
  return { lit, off, bootG, track, card, setScrub, setTitle, titleT, SPAN: SW + 6 };
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
  const { K, iso, root, sound, content } = ctx;
  try { await document.fonts?.ready; } catch (e) {}
  const { g, el, P, mul } = iso;
  const MOB = ctx.mobile, RED = ctx.reduced;
  const LIST = brandList(content, ctx.data);
  const N = LIST.length;
  const ALL = LIST.concat([{ rank: N + 1, name: 'Your brand?', secret: true, logo: {} }]); // one past the last
  const NA = ALL.length;
  const dev = drawPlayer(K, iso, root, { mobile: MOB });
  const ui = makeScreen(K, iso, dev, { mobile: MOB, content });

  /* ---------------- state ---------------- */
  let power = false, target = 0, pos = 0, vel = 0, tween = null, hold = false, playing = true, paused = false;
  let lastInput = -1e9, lastAuto = 0, pendingGo = null, lastTickAt = 0, lastTickCell = 0;
  const AUTO_EVERY = 3.4, IDLE = 12;
  const mod = (a, n) => ((a % n) + n) % n;
  const cards = new Map();
  const cardOf = (i) => {
    let c = cards.get(i);
    if (!c) { c = ui.card(ALL[i]); c._fitted = false; cards.set(i, c); }
    return c;
  };
  // tiles: decode the logo masks one at a time while the browser is idle, in list order, so sliding never waits
  (async () => {
    for (const b of LIST) {
      if (!b.logo?.tile || NO_TILE.has(b.logo.tile)) continue;
      await new Promise((r) => (window.requestIdleCallback ? requestIdleCallback(r, { timeout: 500 }) : setTimeout(r, 40)));
      await tileMask(content.tileUrl(b.logo.tile), b.logo.bg).catch(() => {});
    }
  })();

  function layout() {
    const lo = Math.floor(pos) - 1, hi = Math.ceil(pos) + 1;
    const want = new Map();
    for (let k = lo; k <= hi; k++) { const i = mod(k, NA); const x = (k - pos) * ui.SPAN; if (Math.abs(x) < ui.SPAN * 1.02) want.set(i, x); }
    for (const [i, c] of cards) if (!want.has(i) && c.isConnected) c.remove();
    for (const [i, x] of want) {
      const c = cardOf(i);
      if (!c.isConnected) ui.track.appendChild(c);
      if (!c._fitted) { c._fit(); c._fitted = true; }
      c.setAttribute('transform', `translate(${x.toFixed(3)} 0)`);
    }
    const cur = mod(Math.round(pos), NA);
    const tt = ALL[cur].post ? 'Tap to watch' : 'Now Playing';
    if (ui.titleT.textContent !== tt) ui.titleT.textContent = tt;
    ui.setScrub(cur >= N ? 1 : mod(pos, NA) > N - 0.5 ? 1 : mod(pos, NA) / (N - 1));
  }
  const curIdx = () => mod(target, NA);
  function title() { ui.setTitle({ playing, hold }); }

  /* ---------------- power ---------------- */
  function powerOn() {
    if (power) return;
    power = true;
    dev.dled.style.fill = 'var(--m-accent)'; dev.dledGlow.setAttribute('opacity', 0.85);
    ui.off.setAttribute('opacity', 0);
    ui.lit.style.transition = 'opacity .35s'; ui.lit.setAttribute('opacity', 1);
    title();
    if (!RED) { ui.bootG.setAttribute('opacity', 1); ui.track.setAttribute('opacity', 0); setTimeout(() => { ui.bootG.setAttribute('opacity', 0); ui.track.setAttribute('opacity', 1); sound.tick(); }, 650); }
    layout();
    sound.click();
    lastAuto = performance.now() / 1000;
    if (pendingGo) { const p = pendingGo; pendingGo = null; goBrand(p); }
  }

  /* ---------------- motion ---------------- */
  function settleNow() { pos = target; vel = 0; tween = null; layout(); }
  function touch() { lastInput = performance.now() / 1000; if (playing) { playing = false; title(); } }
  function holdBlocked() { if (!hold) return false; sound.beep(320, 0.06, 'square', 0.03); return true; }
  function step(d, why) {
    powerOn();
    if (why !== 'auto') { touch(); if (holdBlocked()) return; }
    if (tween) { pos = tween.to; tween = null; }
    target += d;
    // keep the carousel within a few cards of the target when spinning fast
    if (target - pos > 3) pos = target - 3; if (pos - target > 3) pos = target + 3;
    if (why !== 'auto') sound.tick();
    if (RED) settleNow();
  }
  function goTo(i, opts = {}) {
    // the nearest way round to brand i
    powerOn();
    let k = target + (mod(i - target + NA / 2, NA) - NA / 2);
    if (opts.lap) k = target + mod(i - target, NA) + NA * opts.lap;
    if (k === target && !opts.lap) return;
    if (RED) { target = k; settleNow(); return; }
    const dist = Math.abs(k - pos);
    if (dist <= 3) { target = k; sound.tick(); return; }
    tween = { from: pos, to: k, t0: performance.now() / 1000, dur: Math.min(1.5, 0.45 + dist * 0.022) };
    target = k;
  }
  function shuffle() {
    powerOn(); touch(); if (holdBlocked()) return;
    pushIn(dev.wheelIn, 0.4);
    let r = curIdx(); while (r === curIdx()) r = Math.floor(Math.random() * N);
    goTo(r, { lap: 1 });
    sound.click();
  }
  function menu() {
    // MENU goes back to the top: the biggest brand. Pressed there, it jumps to the empty slot at the end, for your brand.
    powerOn(); touch(); if (holdBlocked()) return;
    sound.click();
    goTo(curIdx() === 0 ? N : 0);
  }
  function centre() {
    powerOn(); touch(); if (holdBlocked()) return;
    pushIn(dev.btnIn, 0.45);
    sound.click();
    step(1, 'centre');
  }
  function screenTap(e) {
    powerOn(); touch(); if (holdBlocked()) return;
    const b = ALL[curIdx()];
    tapped = b.post ? b : null;
    if (b.secret) { sound.approve(); ctx.HW?.go('contact', { action: 'email' }); return; }
    // the brand's collab post opens on the click that follows (a tap only counts for pop-ups on release); keys open it
    // straight away. A brand without one just moves on to the next.
    if (b.post) { if (e?.type === 'keydown') openPost(b); return; }
    step(1, 'screen');
  }
  let tapped = null; // the brand a press on the screen started on: only its post opens on the click
  function openPost(b) {
    tapped = null;
    if (!b?.post || hold) return;
    sound.approve();
    window.open(b.post, '_blank', 'noopener');
  }
  function toggleHold() { hold = !hold; sound.click(); dev.drawHold(hold); title(); }
  function togglePlay() { powerOn(); playing = !playing; paused = !playing; lastAuto = performance.now() / 1000; lastInput = performance.now() / 1000; sound.click(); title(); }
  function goBrand(name) {
    const q = String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!q) return;
    let i = LIST.findIndex((b) => b.name.toLowerCase().replace(/[^a-z0-9]/g, '') === q);
    if (i < 0) i = LIST.findIndex((b) => { const n = b.name.toLowerCase().replace(/[^a-z0-9]/g, ''); return n.startsWith(q) || q.startsWith(n); });
    if (i < 0) return;
    touch();
    goTo(i);
  }
  ctx.onGo((p) => { if (!p) return; const name = p.brand || p.name; if (!name) return; if (!power) pendingGo = name; else goBrand(name); });

  const pushIn = (node, d) => {
    const v = P(mul(dev.nF, -d));
    node.classList.add('press', 'down');
    node.style.transform = `translate(${v[0].toFixed(3)}px, ${v[1].toFixed(3)}px)`;
    clearTimeout(node._pt);
    node._pt = setTimeout(() => { node.classList.remove('down'); node.style.transform = ''; }, 120);
  };

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
  const angAt = (e) => { const [a, b] = toLocal(dev.front, e.clientX, e.clientY); return { ang: Math.atan2(a - dev.WX, -(b - dev.WY)) / D2R, r: Math.hypot(a - dev.WX, b - dev.WY) }; };
  let drag = null;
  const STEP_DEG = 22;
  function wheelDown(e) {
    if (e.type !== 'pointerdown') { centre(); return; }
    e.preventDefault();
    const p = angAt(e);
    if (p.r < dev.BR + 0.6) { centre(); return; }
    drag = { last: p.ang, acc: 0, moved: 0, x: e.clientX, y: e.clientY, start: p.ang };
    window.addEventListener('pointermove', wheelMove);
    window.addEventListener('pointerup', wheelUp, { once: true });
    window.addEventListener('pointercancel', wheelUp, { once: true });
  }
  function wheelMove(e) {
    if (!drag) return;
    drag.moved = Math.max(drag.moved, Math.hypot(e.clientX - drag.x, e.clientY - drag.y));
    const p = angAt(e);
    let d = p.ang - drag.last; if (d > 180) d -= 360; if (d < -180) d += 360;
    drag.last = p.ang; drag.acc += d;
    while (drag.acc >= STEP_DEG) { drag.acc -= STEP_DEG; drag.spun = true; step(1); }
    while (drag.acc <= -STEP_DEG) { drag.acc += STEP_DEG; drag.spun = true; step(-1); }
  }
  function wheelUp() {
    window.removeEventListener('pointermove', wheelMove);
    if (!drag) return;
    if (!drag.spun && drag.moved < 8) {
      // a press on one of the four buttons under the wheel
      const a = ((drag.start % 360) + 360) % 360;
      if (a > 315 || a <= 45) { pushIn(dev.wheelIn, 0.4); menu(); }
      else if (a <= 135) { pushIn(dev.wheelIn, 0.4); step(1); }
      else if (a <= 225) shuffle();
      else { pushIn(dev.wheelIn, 0.4); step(-1); }
    }
    drag = null;
  }
  ctx.hit(dev.wheelG, 'Click wheel: spin to change brand. Top (menu): back to the first brand, sides: previous and next, bottom: shuffle', wheelDown);
  ctx.hit(dev.btnG, 'Centre button: next brand', centre);
  for (const n of [dev.wheelG, dev.btnG]) { n.style.touchAction = 'none'; n.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false }); }
  let wheelAcc = 0;
  const onWheel = (e) => {
    e.preventDefault(); e.stopPropagation();
    ctx.arm();
    wheelAcc += Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    while (wheelAcc > 60) { wheelAcc -= 60; step(1); }
    while (wheelAcc < -60) { wheelAcc += 60; step(-1); }
  };
  for (const n of [dev.wheelG, dev.btnG]) { n.setAttribute('data-lenis-prevent', ''); n.addEventListener('wheel', onWheel, { passive: false }); }
  // the screen: tap for the next brand
  const scrHit = iso.face(dev.scrPl, [el('rect', { x: dev.SX, y: dev.SY, width: dev.SW, height: dev.SH, style: 'fill:var(--lcd)', 'fill-opacity': 0 })], 0.05);
  root.appendChild(scrHit);
  ctx.hit(scrHit, 'Screen: open this brand\'s collab post', screenTap, { role: 'link' });
  scrHit.addEventListener('click', () => { if (tapped) openPost(tapped); });
  // hold switch on the top edge
  const holdHit = iso.face(dev.topP, [el('rect', { x: 8, y: 0, width: 16, height: dev.PT, style: 'fill:var(--lcd)', 'fill-opacity': 0 })], 0.1);
  root.appendChild(holdHit);
  ctx.hit(holdHit, 'Hold switch', () => { powerOn(); toggleHold(); });
  if (dev.hpG) ctx.hit(dev.hpG, 'Headphones: play or pause', togglePlay);

  ctx.onKey = (e) => {
    if (e.defaultPrevented) return false;
    const k = e.key;
    if (k === 'ArrowDown' || k === 'ArrowRight') { step(1); return true; }
    if (k === 'ArrowUp' || k === 'ArrowLeft') { step(-1); return true; }
    if (k === 'Enter') { centre(); return true; }
    if (k === ' ') { shuffle(); return true; }
    if (k === 'm' || k === 'M') { menu(); return true; }
    if (k === 'h' || k === 'H') { powerOn(); toggleHold(); return true; }
    return false;
  };

  /* ---------------- the frame loop: slide, shuffle, auto-play ---------------- */
  const easeOut = (t) => 1 - Math.pow(1 - t, 4);
  ctx.raf((dt) => {
    if (!power) return;
    const now = performance.now() / 1000;
    // left alone for a while, it plays through the brands again (unless it was paused on purpose)
    if (!playing && !paused && !hold && now - lastInput > IDLE && !RED) { playing = true; lastAuto = now; title(); }
    if (playing && !hold && !RED && !tween && now - lastAuto > AUTO_EVERY) { lastAuto = now; step(1, 'auto'); }
    if (RED) return;
    let moved = false;
    if (tween) {
      const t = Math.min(1, (now - tween.t0) / tween.dur);
      pos = tween.from + (tween.to - tween.from) * easeOut(t);
      const cell = Math.floor(pos + 0.5);
      if (cell !== lastTickCell && now - lastTickAt > 0.035) { lastTickCell = cell; lastTickAt = now; sound.tick(); }
      if (t >= 1) { pos = tween.to; tween = null; vel = 0; sound.blip(1320, 0.05); }
      moved = true;
    } else if (pos !== target || vel) {
      // an underdamped spring: a short, soft settle
      const kS = 210, cS = 2 * 0.74 * Math.sqrt(kS);
      let rem = Math.min(dt, 0.05);
      while (rem > 0) { const h = Math.min(rem, 1 / 120); const a = kS * (target - pos) - cS * vel; vel += a * h; pos += vel * h; rem -= h; }
      if (Math.abs(target - pos) < 0.0015 && Math.abs(vel) < 0.01) { pos = target; vel = 0; }
      moved = true;
    }
    if (moved) layout();
  });

  ctx.a11y(`<p>Brands: the ${N} brands Vlada has worked with, biggest first. Spin the wheel or use the arrow keys to go through them one by one; the player shows each brand's logo and name. Menu goes back to the first brand. Tap the screen to open the brand's collab post.</p><ul>${LIST.map((b) => `<li>${b.post ? `<a href="${b.post}" target="_blank" rel="noopener">${b.name}</a>` : b.name}</li>`).join('')}</ul>`);
  fitBody(ctx, MOB ? 7 : 9, [dev.shG]);
  layout();
  title();

  return {
    plotted() { powerOn(); },
    start() { lastAuto = performance.now() / 1000; },
    stop() { if (tween) { pos = tween.to; tween = null; } },
  };
}

/* ====================================================================================================== */
/* the hero tile: the same player, lit, showing the first (biggest) brand                                  */
/* ====================================================================================================== */
export async function hero(hx) {
  const { K, iso, root, content } = hx;
  try { await document.fonts?.ready; } catch (e) {}
  const LIST = brandList(content, hx.data);
  const dev = drawPlayer(K, iso, root, { mobile: hx.mobile, hero: true, phones: !hx.mobile });
  const ui = makeScreen(K, iso, dev, { mobile: false, content });
  ui.off.setAttribute('opacity', 0);
  ui.lit.setAttribute('opacity', 1);
  dev.dled.style.fill = 'var(--m-accent)'; dev.dledGlow.setAttribute('opacity', 0.85);
  ui.setTitle({ playing: true, hold: false });
  ui.setScrub(0);
  const c = ui.card(LIST[0]);
  ui.track.appendChild(c);
  c._fit();
}
