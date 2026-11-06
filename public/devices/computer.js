// Fig 1 · The desk computer: the centrepiece of the desk.
// It waits in standby until the visitor clicks or presses a key, then boots: a welcome box, a 1-bit film of Vlada waving
// hello full screen, which zooms down into her portrait window and keeps moving there. Then it answers questions in her
// voice and takes you where you need to go.
// Type anywhere (or tap the screen on a phone) and the words appear on the CRT while the drawn keys press. The sticky
// notes stuck on the case are the preset questions: pull one and the computer types it for you.
import { makeAssistant } from '../assistant.js';

/** The computer can be turned towards the viewer (ctx.turn degrees about its own centre); see iso.frame. */
export default async function build(ctx) {
  ctx.iso.frame(ctx.turn || 0, 50, 52);
  try { return buildTurned(ctx); } finally { ctx.iso.frame(0); }
}

async function buildTurned(ctx) {
  const { K, iso, root, sound, content, HW } = ctx;
  const { g, el, face, txt, top, frontY, frontX, plane, shift, rrect, taperRect, MAT, P, norm, dither } = iso;
  const { SITE } = content;
  const desk = ctx.desk || {};
  const A = makeAssistant({ content, data: ctx.data || {} });
  const PH = 'var(--phos)', INK = 'var(--phos-ink)';

  /* ---------------- soft ground shadows (no plate: the computer is the centrepiece) ---------------- */
  const plateG = g({ class: 'part' });
  plateG.appendChild(K.shadow(rrect(-6, -6, 112, 116, 16), 0, 0, 0, 0.55, K.blurFilter(10)));
  plateG.appendChild(K.shadow(rrect(-4, -3, 130, 56, 8), 0, -6, 124, 0.45, K.blurFilter(6)));
  root.appendChild(plateG);

  /* ---------------- the case ---------------- */
  const shellG = g({ class: 'part' });
  const body = K.box(0, 0, 0, 100, 104, 132, MAT.shell, { r: 7, seg: 6 });
  shellG.appendChild(body);
  const fy = body.fy, fx = body.fx, tp = body.top;
  const bez = K.recess(rrect(5, 6, 90, 74, 7, 6), fy, 3.2, MAT.deep);
  shellG.appendChild(bez);
  const screen = g();
  let screenPl = null;
  const glass = K.recess(rrect(9, 10, 82, 61.5, 3.5, 5), bez.floor, 1.4, MAT.glass, { content: (pl) => { screenPl = pl; screen.setAttribute('transform', iso.matrix(pl)); return screen; } });
  shellG.appendChild(glass);
  shellG.appendChild(K.recess(rrect(56, 92, 30, 3.4, 1.4), fy, 3, MAT.deep));
  shellG.appendChild(face(fy, [el('path', { d: 'M80 97.5 L84 97.5', class: 's2' })], 0.02));
  shellG.appendChild(face(bez.floor, [
    el('path', { d: 'M13 74.2 L15.2 75.5 L15.2 78.1 L13 79.4 L10.8 78.1 L10.8 75.5 Z', class: 's' }),
    el('path', { d: 'M13 76.8 L15.2 75.5 M13 76.8 L10.8 75.5 M13 76.8 L13 79.4', class: 's2' }),
    txt('vladasana', 17.6, 78.4, { size: 3, fill: 'var(--t2)', ls: 0.35 }),
  ], 0.02));
  const led = el('circle', { cx: 91, cy: 93.7, r: 1.25, style: 'fill:var(--m-deep)', class: 'sf' });
  const ledGlow = el('circle', { cx: 91, cy: 93.7, r: 3.2, style: 'fill:var(--m-accent)', opacity: 0, filter: `url(#${K.glowId})` });
  shellG.appendChild(face(fy, [ledGlow, led], 0.03));
  shellG.appendChild(face(fx, [el('path', { d: 'M9 3 L9 129', class: 's2' })], 0.02));
  shellG.appendChild(face(fy, [el('path', { d: 'M3 122 L97 122', class: 's3' })], 0.02));
  shellG.appendChild(K.slots(fx, 64, 14, 30, 34, 12));
  shellG.appendChild(K.recess(rrect(74, 108, 8, 5, 1), fx, 1.6, MAT.deep));
  shellG.appendChild(K.recess(rrect(85, 108, 9, 5, 1), fx, 1.6, MAT.deep));
  shellG.appendChild(K.recess(rrect(30, 124.5, 7, 3.6, 0.8), fx, 1.2, MAT.deep));
  shellG.appendChild(K.recess(rrect(86, 90, 6, 10, 1.2), fx, 1.2, MAT.deep));
  shellG.appendChild(face(fx, [el('path', { d: 'M87.5 95 L90.5 95', class: 's' })], 0.02));
  shellG.appendChild(K.recess(rrect(14, 7, 72, 14, 6, 6), tp, 4.5, MAT.deep));
  shellG.appendChild(face(tp, [el('path', { d: [0, 1, 2, 3, 4, 5].map((i) => `M${24} ${27 + i * 2.2} L${76} ${27 + i * 2.2}`).join(''), class: 's3' })], 0.02));
  root.appendChild(shellG);

  /* ---------------- keyboard ---------------- */
  const KX = -6, KY = 124, KW = 122, KD = 48, HB = 8, HF = 5;
  const kbdG = g({ class: 'part' });
  kbdG.appendChild(K.prism([[0, HB - HF], [KD, 0], [KD, HB], [0, HB]], frontX(KX + KW, KY + KD, HB), KW, MAT.shell));
  const PITCH = 7.6, MX = 6, MY = 5;
  const kp = plane([KX + MX, KY + MY, HB - ((HB - HF) * MY) / KD], [1, 0, 0], norm([0, KD, -(HB - HF)]));
  const ROWS = [
    { u: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5], k: ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'] },
    { u: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], k: ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'] },
    { u: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75], k: ['CapsLock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'] },
    { u: [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25], k: ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'] },
    { u: [1.5, 1.5, 8, 1.5, 2], k: ['Alt', 'Meta', ' ', 'Enter', 'Alt'] },
  ];
  const well = K.recess(rrect(-1.6, -1.6, 14.5 * PITCH + 3.2, 5 * PITCH + 3.2, 2.4, 4), kp, 1.4, MAT.deep);
  kbdG.appendChild(well);
  root.appendChild(kbdG);
  const floor = well.floor;
  const capsG = g({ class: 'part' });
  const keys = new Map();
  ROWS.forEach((row, ri) => {
    let x = 0;
    row.u.forEach((u, ci) => {
      const w = u * PITCH, y = ri * PITCH;
      const { cap, base } = taperRect(x + 0.45, y + 0.45, w - 0.9, PITCH - 0.9, 1.4, 0.95, 3);
      const kg = g({ class: 'press' });
      kg.appendChild(K.prism(cap, shift(floor, 0, 0, 4.6), 4.6, MAT.key, { base }));
      capsG.appendChild(kg);
      const ch = row.k[ci];
      if (!keys.has(ch)) keys.set(ch, []);
      keys.get(ch).push(kg);
      kg.addEventListener('pointerdown', (e) => { e.preventDefault(); typeChar(ch); });
      x += w;
    });
  });
  root.appendChild(capsG);
  const cableG = g({ class: 'part' });
  cableG.appendChild(K.tube([[100.4, 70.5, 4.4], [104, 70.5, 4.2], [107, 71, 3]], 1.6));
  cableG.appendChild(K.coil([107, 71, 2.8], [KX + KW + 6, KY + 12, 2.8], 1.9, 15, 1.1));
  cableG.appendChild(K.tube([[KX + KW + 6, KY + 12, 2.8], [KX + KW + 3, KY + 14, 3.6], [KX + KW + 0.5, KY + 14, 4]], 1.6));
  root.appendChild(cableG);

  /* ---------------- the screen: portrait + conversation ---------------- */
  const SX = 9, SY = 10, SW = 82, SH = 61.5;
  const MOBW = !!ctx.mobile;
  const off = el('rect', { x: SX, y: SY, width: SW, height: SH, style: 'fill:var(--m-glass)', class: 'f' });
  const on = g({ opacity: 0 });
  const onInner = g();
  on.appendChild(onInner);
  const CY = SY + SH / 2;
  const squash = (k) => onInner.setAttribute('transform', `translate(0 ${CY * (1 - k)}) scale(1 ${k})`);
  let tw = null;
  const tween = (from, to, ms, ease, done) => { cancelAnimationFrame(tw); const t0 = performance.now(); const f = (t) => { const k = Math.min(1, (t - t0) / ms); squash(from + (to - from) * ease(k)); if (k < 1) tw = requestAnimationFrame(f); else done?.(); }; tw = requestAnimationFrame(f); };
  const R = (x, y, w, h, fill, extra = {}) => el('rect', { x, y, width: w, height: h, style: `fill:${fill}`, ...extra });
  onInner.appendChild(R(SX, SY, SW, SH, PH));
  // menu bar
  onInner.appendChild(el('path', { d: `M${SX} ${SY + 3.8} L${SX + SW} ${SY + 3.8}`, style: `stroke:${INK}`, 'stroke-width': 0.35 }));
  onInner.appendChild(el('path', { d: `M${SX + 3} ${SY + 0.9} L${SX + 4.6} ${SY + 1.8} L${SX + 4.6} ${SY + 3.1} L${SX + 3} ${SY + 3.5} L${SX + 1.4} ${SY + 3.1} L${SX + 1.4} ${SY + 1.8} Z`, style: `fill:${INK}` }));
  const mb = (s, x, anchor) => txt(s, SX + x, SY + 2.85, { size: 2.4, fill: INK, font: 'Pixelify Sans', weight: 500, anchor });
  onInner.appendChild(mb('File', 7)); onInner.appendChild(mb('Edit', 13.2)); onInner.appendChild(mb('View', 19.6)); onInner.appendChild(mb('Special', 26.4));
  onInner.appendChild(mb('12+ yrs', SW - 4.5, 'end'));
  // the desktop: her portrait window, the conversation and the prompt (hidden while the computer boots)
  const appG = g();
  onInner.appendChild(appG);
  // portrait window
  const WX = SX + 2.2, WY = SY + 6.2, WW = MOBW ? 24 : 27, WH = MOBW ? 34 : 38.5;
  appG.appendChild(R(WX + 0.8, WY + 0.8, WW, WH, INK));
  appG.appendChild(R(WX, WY, WW, WH, PH, { class: 'sf' }));
  appG.appendChild(el('rect', { x: WX, y: WY, width: WW, height: WH, style: `fill:none;stroke:${INK}`, 'stroke-width': 0.4 }));
  for (let i = 0; i < 6; i++) appG.appendChild(el('path', { d: `M${WX + 1} ${WY + 0.7 + i * 0.42} L${WX + WW - 1} ${WY + 0.7 + i * 0.42}`, style: `stroke:${INK}`, 'stroke-width': 0.16 }));
  appG.appendChild(R(WX + WW / 2 - 7, WY + 0.3, 14, 2.6, PH));
  appG.appendChild(txt('vlada.mov', WX + WW / 2, WY + 2.3, { size: 2.1, anchor: 'middle', fill: INK, font: 'Pixelify Sans' }));
  appG.appendChild(el('path', { d: `M${WX} ${WY + 3.2} L${WX + WW} ${WY + 3.2}`, style: `stroke:${INK}`, 'stroke-width': 0.35 }));
  const PX = WX + 0.6, PY = WY + 3.6, PW = WW - 1.2, PHh = WH - 4.2;
  const picG = g();
  const picMaskId = K.id('pm');
  const picMaskRect = el('rect', { x: PX, y: PY, width: PW, height: PHh, fill: '#fff' });
  K.def(el('mask', { id: picMaskId, maskUnits: 'userSpaceOnUse' }, [picMaskRect]));
  const picHolder = g({ mask: `url(#${picMaskId})` }, [picG]);
  appG.appendChild(picHolder);
  // conversation
  const MOB = !!ctx.mobile;
  const FS = MOB ? 5.6 : 5.1, LH = FS * 1.22, CX = WX + WW + 2.6, CW = SX + SW - CX - 1.6;
  const MAXL = Math.floor((SH - 8.2 - 7.8) / LH);
  const convo = g();
  appG.appendChild(convo);
  appG.appendChild(el('path', { d: `M${SX} ${SY + SH - 8.2} L${SX + SW} ${SY + SH - 8.2}`, style: `stroke:${INK}`, 'stroke-width': 0.3, opacity: 0.5 }));
  const PFS = MOB ? 5.4 : 4.8;
  const prompt = txt('', SX + 2.6, SY + SH - 2.4, { size: PFS, fill: INK, font: 'Pixelify Sans', weight: 500 });
  const ph = txt('type a question', SX + 2.6, SY + SH - 2.4, { size: PFS, fill: INK, font: 'Pixelify Sans', weight: 400, opacity: 0.45 });
  const caret = R(SX + 2.6, SY + SH - 2.4 - PFS * 0.92, PFS * 0.5, PFS * 1.02, INK);
  appG.appendChild(prompt); appG.appendChild(ph); appG.appendChild(caret);
  // a 1-bit film: a strip of dithered frames used as a mask, so the dots take the theme's phosphor colours
  const film = (href, n, x, y, w, h) => {
    const mid = K.id('film');
    const img = el('image', { href, x, y, width: w * n, height: h, preserveAspectRatio: 'none', style: 'image-rendering:pixelated' });
    K.def(el('mask', { id: mid, maskUnits: 'userSpaceOnUse', x, y, width: w, height: h }, [img]));
    const node = g({ class: 'film' }, [R(x, y, w, h, PH), el('rect', { x, y, width: w, height: h, style: `fill:${INK}`, mask: `url(#${mid})` })]);
    let cur = 0;
    return { node, n, set(i) { i = ((i % n) + n) % n; if (i !== cur) { cur = i; img.setAttribute('x', x - i * w); } } };
  };
  const idle = film('media/wave-idle.png', 16, PX, PY, PW, PHh);
  picG.appendChild(idle.node);
  // boot: the welcome box
  const welcomeG = g({ style: 'display:none' });
  {
    const BW = 50, BH = 23, BX = SX + (SW - BW) / 2, BY = SY + 3.8 + (SH - 3.8 - BH) / 2, hx0 = SX + SW / 2, hy0 = BY + 7.2;
    welcomeG.appendChild(R(BX + 0.8, BY + 0.8, BW, BH, INK));
    welcomeG.appendChild(R(BX, BY, BW, BH, PH));
    welcomeG.appendChild(el('rect', { x: BX, y: BY, width: BW, height: BH, style: `fill:none;stroke:${INK}`, 'stroke-width': 0.45 }));
    welcomeG.appendChild(el('rect', { x: BX + 1.1, y: BY + 1.1, width: BW - 2.2, height: BH - 2.2, style: `fill:none;stroke:${INK}`, 'stroke-width': 0.25 }));
    const hx = (dx, dy) => `${(hx0 + dx * 1.7).toFixed(2)} ${(hy0 + dy * 1.7).toFixed(2)}`;
    welcomeG.appendChild(el('path', { d: `M${hx(0, -2.6)} L${hx(2.2, -1.3)} L${hx(2.2, 1.3)} L${hx(0, 2.6)} L${hx(-2.2, 1.3)} L${hx(-2.2, -1.3)} Z M${hx(0, 0)} L${hx(2.2, -1.3)} M${hx(0, 0)} L${hx(-2.2, -1.3)} M${hx(0, 0)} L${hx(0, 2.6)}`, style: `fill:none;stroke:${INK}`, 'stroke-width': 0.5, 'stroke-linejoin': 'round' }));
    welcomeG.appendChild(txt('welcome to', hx0, BY + 15, { size: 3.1, anchor: 'middle', fill: INK, font: 'Pixelify Sans' }));
    welcomeG.appendChild(txt('vladasana', hx0, BY + 19.6, { size: 4.8, anchor: 'middle', fill: INK, font: 'Pixelify Sans', weight: 600 }));
  }
  onInner.appendChild(welcomeG);
  // boot: the big film window, where she waves hello
  const MWW = 66, MWH = 53, MWX = SX + (SW - MWW) / 2, MWY = SY + 5.2;
  const movG = g({ style: 'display:none' });
  movG.appendChild(R(MWX + 0.8, MWY + 0.8, MWW, MWH, INK));
  movG.appendChild(R(MWX, MWY, MWW, MWH, PH));
  movG.appendChild(el('rect', { x: MWX, y: MWY, width: MWW, height: MWH, style: `fill:none;stroke:${INK}`, 'stroke-width': 0.4 }));
  for (let i = 0; i < 6; i++) movG.appendChild(el('path', { d: `M${MWX + 1} ${MWY + 0.7 + i * 0.42} L${MWX + MWW - 1} ${MWY + 0.7 + i * 0.42}`, style: `stroke:${INK}`, 'stroke-width': 0.16 }));
  movG.appendChild(R(MWX + MWW / 2 - 8, MWY + 0.3, 16, 2.6, PH));
  movG.appendChild(txt('vlada.mov', MWX + MWW / 2, MWY + 2.3, { size: 2.1, anchor: 'middle', fill: INK, font: 'Pixelify Sans' }));
  movG.appendChild(el('path', { d: `M${MWX} ${MWY + 3.2} L${MWX + MWW} ${MWY + 3.2}`, style: `stroke:${INK}`, 'stroke-width': 0.35 }));
  const wide = film('media/wave-wide.png', 19, MWX + 1, MWY + 3.8, MWW - 2, (MWW - 2) * 0.75);
  movG.appendChild(wide.node);
  onInner.appendChild(movG);
  // the zoom rectangles the film window leaves as it shrinks into the portrait window
  const zoomG = g();
  onInner.appendChild(zoomG);
  // CRT feel
  const scanId = K.id('scan');
  K.def(el('pattern', { id: scanId, width: 1, height: 0.62, patternUnits: 'userSpaceOnUse' }, [el('rect', { width: 1, height: 0.2, style: `fill:${INK}`, opacity: 0.1 })]));
  onInner.appendChild(el('rect', { x: SX, y: SY, width: SW, height: SH, fill: `url(#${scanId})` }));
  onInner.appendChild(el('rect', { x: SX, y: SY, width: SW, height: SH, fill: K.rgrad([[0.6, 'var(--phos-ink)', 0], [1, 'var(--phos-ink)', 0.28]], 0.5, 0.5, 0.75) }));
  const flash = el('rect', { x: SX, y: SY + SH / 2 - 0.4, width: SW, height: 0.8, style: 'fill:#fff', opacity: 0 });
  // standby: a power symbol and a pulsing hint on the dark glass
  const standbyG = g({ class: 'standby-cue' });
  {
    const scx = SX + SW / 2, scy = SY + SH / 2 - 5, r = 4.4, gap = (40 * Math.PI) / 180;
    const p1 = [scx - r * Math.sin(gap), scy - r * Math.cos(gap)], p2 = [scx + r * Math.sin(gap), scy - r * Math.cos(gap)];
    standbyG.appendChild(el('path', { d: `M${p1[0].toFixed(2)} ${p1[1].toFixed(2)} A${r} ${r} 0 1 0 ${p2[0].toFixed(2)} ${p2[1].toFixed(2)} M${scx} ${scy - r - 1} L${scx} ${scy - 0.6}`, style: 'fill:none;stroke:var(--phos)', 'stroke-width': 0.9, 'stroke-linecap': 'round' }));
    const touch = matchMedia('(hover: none)').matches;
    standbyG.appendChild(txt(touch ? 'tap to switch on' : 'click to switch on', scx, scy + 10.5, { size: 4.6, anchor: 'middle', fill: 'var(--phos)', font: 'Pixelify Sans', weight: 500 }));
    if (!touch) standbyG.appendChild(txt('or press any key', scx, scy + 16, { size: 3.3, anchor: 'middle', fill: 'var(--phos)', font: 'Pixelify Sans', opacity: 0.62 }));
  }
  screen.appendChild(off); screen.appendChild(standbyG); screen.appendChild(on); screen.appendChild(flash);
  screen.appendChild(el('path', { d: `M${SX} ${SY} L${SX + SW * 0.5} ${SY} L${SX + SW * 0.18} ${SY + SH} L${SX} ${SY + SH} Z`, style: 'fill:#fff', opacity: 0.04 }));

  /* ---------------- framing ---------------- */
  const b0 = shellG.getBBox(), b1 = kbdG.getBBox();
  const bx = Math.min(b0.x, b1.x), by = b0.y, bw = Math.max(b0.x + b0.width, b1.x + b1.width) - bx, bh = Math.max(b0.y + b0.height, b1.y + b1.height + 6) - by;
  ctx.view(bx - 8, by - 8, bw + 16, bh + 14);

  /* ---------------- text measuring + wrapping ---------------- */
  const mc = document.createElement('canvas').getContext('2d');
  const measure = (s, size = FS, weight = 500) => { mc.font = `${weight} 100px "Pixelify Sans", monospace`; return (mc.measureText(s).width / 100) * size; };
  function wrap(s, width, size) {
    const words = s.split(' '); const lines = []; let cur = '';
    for (const w of words) { const nxt = cur ? cur + ' ' + w : w; if (measure(nxt, size, 500) > width && cur) { lines.push(cur); cur = w; } else cur = nxt; }
    if (cur) lines.push(cur);
    return lines;
  }
  // conversation state: an array of { who: 'me' | 'you', text }
  const log = [];
  function renderConvo(partial) {
    convo.replaceChildren();
    const lines = [];
    for (let i = 0; i < log.length; i++) {
      const m = log[i];
      const text = i === log.length - 1 && partial != null ? partial : m.text;
      const ls = wrap((m.who === 'you' ? '> ' : '') + text, CW - 1.5, FS);
      ls.forEach((l) => lines.push({ l, who: m.who }));
      if (i < log.length - 1) lines.push({ l: '', who: 'gap' });
    }
    const shown = lines.slice(-MAXL);
    shown.forEach((ln, i) => {
      if (!ln.l) return;
      convo.appendChild(txt(ln.l, CX, SY + 6 + FS * 0.95 + i * LH, { size: FS, fill: INK, font: 'Pixelify Sans', weight: ln.who === 'you' ? 400 : 500, opacity: ln.who === 'you' ? 0.62 : 1 }));
    });
  }
  let typed = '';
  function renderPrompt() {
    let s = '> ' + typed;
    let w = measure(s, PFS, 500);
    while (w > SW - 8 && s.length > 3) { s = '> …' + s.slice(4); w = measure(s, PFS, 500); }
    prompt.textContent = s;
    caret.setAttribute('x', SX + 2.6 + w + 0.6);
    ph.setAttribute('x', SX + 2.6 + w + PFS * 0.5 + 1.6);
    ph.style.display = typed ? 'none' : '';
  }

  /* ---------------- behaviour ---------------- */
  let power = false, busy = false, printTimer = null, blink = 0, focused = false, booting = false, pendingQ = null, clip = null;
  // waking the computer wakes the whole desk (desk.js runs the boot); on its own it just powers on
  const wake = () => (ctx.wake ? ctx.wake() : setPower(true));
  const pressKey = (ch) => { const ks = keys.get(ch) || keys.get(ch.toLowerCase()); if (ks) ctx.press(ks[0], 1.5, 110); };
  function typeChar(ch) {
    pressKey(ch);
    sound.key(ch === ' ' || ch === 'Enter' ? 1.2 : 0.9);
    const inp = desk.input;
    if (!inp) return;
    if (ch === 'Backspace') inp.value = inp.value.slice(0, -1);
    else if (ch === 'Enter') { desk.form?.requestSubmit(); return; }
    else if (ch.length === 1) inp.value += ch;
    syncTyped();
  }
  function syncTyped() { typed = desk.input ? desk.input.value : ''; renderPrompt(); }
  function say(text, done) {
    clearTimeout(printTimer);
    log.push({ who: 'me', text });
    while (log.length > 6) log.shift();
    if (ctx.reduced) { renderConvo(); done?.(); return; }
    let i = 0;
    const step = () => {
      i = Math.min(text.length, i + 2);
      renderConvo(text.slice(0, i));
      if (i % 6 === 0) sound.tick();
      if (i < text.length) printTimer = setTimeout(step, 22);
      else { renderConvo(); done?.(); }
    };
    step();
  }
  function ask(q) {
    if (!q.trim() || !power) return;
    if (booting) { pendingQ = q.trim(); if (desk.input) desk.input.value = ''; syncTyped(); return; }
    log.push({ who: 'you', text: q.trim() });
    const { reply, action } = A.answer(q);
    if (desk.out) desk.out.textContent = reply;
    if (desk.input) desk.input.value = '';
    syncTyped();
    // things that need the visitor's click or key press happen right away
    let after = null;
    if (action?.type === 'open') HW.open(action.url);
    else if (action?.type === 'copy') { navigator.clipboard?.writeText(action.text).catch(() => {}); after = action.then; }
    else if (action?.type === 'go') after = action;
    busy = true;
    say(reply, () => { busy = false; if (after) setTimeout(() => HW.go(after.id, after.params), 420); });
  }
  function greet(instant) {
    const hi = SITE.hello + '.', sub = 'developer advocate and tech creator. type a question, or pull a sticky note.';
    if (desk.out && !desk.out.textContent) desk.out.textContent = SITE.hello + '. Developer advocate and tech creator. Type a question, or pull a sticky note.';
    const then = () => { if (pendingQ) { const q = pendingQ; pendingQ = null; ask(q); } };
    if (instant) { log.push({ who: 'me', text: hi }, { who: 'me', text: sub }); renderConvo(); then(); return; }
    say(hi, () => setTimeout(() => say(sub, then), 300));
  }
  function showDesktop() { welcomeG.style.display = 'none'; movG.style.display = 'none'; zoomG.replaceChildren(); appG.style.display = ''; clip = null; booting = false; busy = false; }
  // the film window shrinks into the portrait window, leaving a trail of dotted rectangles like an old Mac
  function zoomDown() {
    const a = [MWX, MWY, MWW, MWH], b = [WX, WY, WW, WH], N = 7;
    let i = 0;
    movG.style.display = 'none';
    sound.tick?.();
    const step = () => {
      zoomG.replaceChildren();
      for (const j of [i - 1, i]) {
        if (j < 0 || j > N) continue;
        const r = a.map((v, n) => v + (b[n] - v) * (j / N));
        zoomG.appendChild(el('rect', { x: r[0], y: r[1], width: r[2], height: r[3], style: `fill:none;stroke:${INK}`, 'stroke-width': 0.45, 'stroke-dasharray': '0.9 0.6' }));
      }
      i++;
      if (i <= N + 1) setTimeout(step, 34); else { showDesktop(); greet(); }
    };
    step();
  }
  function setPower(v, opts = {}) {
    if (v === power) return;
    power = v;
    if (power) {
      standbyG.style.display = 'none';
      ledGlow.classList.remove('sb-led'); ledGlow.setAttribute('opacity', 0.9); led.style.fill = 'var(--m-accent)';
      on.setAttribute('opacity', 1);
      log.length = 0; renderConvo(); syncTyped();
      if (opts.instant || ctx.reduced) { squash(1); showDesktop(); greet(true); return; }
      booting = true; busy = true;
      appG.style.display = 'none'; movG.style.display = 'none'; welcomeG.style.display = '';
      sound.power ? sound.power() : sound.click();
      squash(0.012);
      flash.style.transition = 'none'; flash.setAttribute('opacity', 0.9);
      setTimeout(() => { tween(0.012, 1, 420, (k) => 1 - Math.pow(1 - k, 3)); flash.style.transition = 'opacity .5s'; flash.setAttribute('opacity', 0); }, 90);
      setTimeout(() => sound.chime(), 480);
      // then her film: she waves hello full screen (10 frames a second), and it zooms down into the portrait window
      setTimeout(() => { welcomeG.style.display = 'none'; wide.set(0); movG.style.display = ''; sound.seek?.(); clip = { t0: performance.now() + 140 }; }, 1450);
    } else {
      sound.click();
      ledGlow.setAttribute('opacity', 0); led.style.fill = 'var(--m-deep)';
      tween(1, 0.01, 220, (k) => k * k);
      setTimeout(() => { if (!power) { on.setAttribute('opacity', 0); standbyG.style.display = ''; } }, 230);
    }
  }

  // the input: invisible, laid exactly over the glass, so tapping the screen opens the phone keyboard and desktop
  // typing goes straight in. What you type is drawn on the CRT.
  if (desk.form && desk.input) {
    desk.form.addEventListener('submit', (e) => { e.preventDefault(); if (!power) wake(); ask(desk.input.value); });
    desk.input.addEventListener('keydown', (e) => { if (e.key.length === 1 || e.key === 'Backspace') { pressKey(e.key); sound.key(e.key === ' ' ? 1.2 : 0.85); } if (e.key === 'Enter') pressKey('Enter'); });
    desk.input.addEventListener('input', syncTyped);
    desk.input.addEventListener('focus', () => { focused = true; if (!power) wake(); });
    desk.input.addEventListener('blur', () => { focused = false; });
    desk.form.style.width = SW + 'px'; desk.form.style.height = SH + 'px';
    if (screenPl) ctx.overlay(desk.form, screenPl, SX, SY);
  }

  /* ---------------- sticky notes: the preset questions ---------------- */
  // Stuck on the case like on any real desk, slightly crooked. Pull one and the computer types the question for you.
  const NOTE_SPOTS = [
    { face: 'fy', a: 2, b: 83, w: 29, h: 24, rot: -5, col: 'note' },
    { face: 'fy', a: 29.5, b: 86.5, w: 25, h: 22, rot: 6, col: 'note2' },
    { face: 'fy', a: 5, b: 104.5, w: 27, h: 23, rot: 3, col: 'note2' },
    { face: 'fy', a: 32, b: 106, w: 29, h: 23, rot: -3, col: 'note' },
    { face: 'fy', a: 65, b: 101, w: 25, h: 23, rot: 7, col: 'hot' },
  ];
  const NOTE_TEXT = { "Who's Vlada?": ["who's", 'vlada?'], Brands: ['brands'], 'Watch collabs': ['watch', 'collabs'], Rates: ['rates?'], Guides: ['guides'], 'Hire her': ['hire', 'her'] };
  const NOTE_ORDER = ["Who's Vlada?", 'Rates', 'Guides', 'Watch collabs', 'Hire her'];
  const notesG = g({ class: 'part notes' });
  NOTE_ORDER.forEach((label, i) => {
    const sug = A.suggestions.find((x) => x.label === label);
    const sp = NOTE_SPOTS[i];
    if (!sug || !sp) return;
    const pl = sp.face === 'fy' ? fy : fx;
    const cx = sp.a + sp.w / 2, cy = sp.b + sp.h / 2, rr = (sp.rot * Math.PI) / 180;
    const rot = ([x, y]) => [cx + (x - cx) * Math.cos(rr) - (y - cy) * Math.sin(rr), cy + (x - cx) * Math.sin(rr) + (y - cy) * Math.cos(rr)];
    const outline = rrect(sp.a, sp.b, sp.w, sp.h, 0.5, 2).map(rot);
    const ng = g({ class: 'note' });
    ng.appendChild(K.prism(outline, shift(pl, 0, 0, 0.7), 0.7, { v: sp.col, amb: 0.66 }));
    const lines = NOTE_TEXT[label] || [label];
    const nfs = lines.length > 1 ? 6.4 : 7;
    ng.appendChild(face(pl, [g({ transform: `rotate(${sp.rot} ${cx} ${cy})` }, [
      // the glue strip along the top edge
      el('rect', { x: sp.a, y: sp.b, width: sp.w, height: 3.4, style: 'fill:var(--shade)', opacity: 0.07 }),
      ...lines.map((ln, k) => txt(ln, sp.a + 3, sp.b + 4.6 + nfs + k * nfs * 1.1 + (lines.length > 1 ? 0 : 3), { size: nfs, fill: 'var(--note-ink)', font: 'Pixelify Sans', weight: 600 })),
    ])], 0.75));
    ng.addEventListener('pointerenter', () => sound.tick?.());
    ctx.hit(ng, `Ask: ${sug.label}`, () => { if (!power) { wake(); return; } if (busy) return; ctx.press(ng, -2.2, 260); sound.hiss?.(0.25); autoAsk(sug.q); });
    notesG.appendChild(ng);
  });
  root.insertBefore(notesG, kbdG);

  // a chip types its question on the keyboard, then asks it
  function autoAsk(q) {
    busy = true;
    desk.input.value = '';
    let i = 0;
    const step = () => {
      if (i < q.length) { const ch = q[i++]; pressKey(ch); sound.key(0.7); desk.input.value += ch; syncTyped(); setTimeout(step, 34 + Math.random() * 30); }
      else { pressKey('Enter'); busy = false; ask(desk.input.value); }
    };
    step();
  }
  // start typing anywhere while the desk is on screen and it goes to the computer
  document.addEventListener('keydown', (e) => {
    if (!ctx.visible || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable || t.closest?.('dialog'))) return;
    if (e.key.length === 1 && e.key !== ' ' && desk.input) { desk.input.focus({ preventScroll: true }); }
  });
  ctx.hit(shellG, 'Ask the computer', () => { if (!power) wake(); desk.input?.focus({ preventScroll: true }); });

  ctx.raf((dt, t) => {
    blink += dt;
    caret.setAttribute('opacity', power && Math.floor(blink * (focused ? 2.2 : 1.6)) % 2 === 0 ? 1 : 0);
    if (clip) {
      const k = Math.floor((performance.now() - clip.t0) / 100);
      wide.set(Math.max(0, Math.min(wide.n - 1, k)));
      if (k >= wide.n + 4 && !clip.done) { clip.done = true; zoomDown(); }
    } else if (power && !ctx.reduced) idle.set(Math.floor(t * 8));
  });
  ctx.on('theme', () => {});
  renderPrompt();
  document.fonts?.ready.then(() => { renderConvo(); renderPrompt(); });

  ledGlow.classList.add('sb-led');
  return {
    plotted() {},
    /** Switch on. { instant: true } skips the boot show (reduced motion, or the visitor already scrolled away). */
    power(opts) { setPower(true, opts); },
    get on() { return power; },
    /** Centre of the glass, in the scene's units (the desk lights the room from here). */
    screenAt: () => iso.P(iso.at(screenPl, SX + SW / 2, SY + SH / 2)),
    start() {},
    stop() { clearTimeout(printTimer); },
  };
}
