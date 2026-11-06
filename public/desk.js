// desk.js · The hero: Vlada's desk, set out like a product line-up.
// The computer stands in the middle, turned towards the viewer so its screen reads (type to ask it anything; the sticky
// notes ask for you). The six section devices stand around it in a wide U, each one a link to its section. No props:
// just the devices. Everything is one isometric drawing in the computer's units.
// Power On: the page opens on a dark room with only the computer's standby glow. The first click or key press (or a few
// seconds of waiting) boots the desk: the computer first, then each device in a ripple outwards, each with its own sound,
// then the lights come up. Clicking a device afterwards flies it down into its section.
import * as iso from './iso.js';
import buildComputer from './devices/computer.js';

const C = Math.cos(Math.PI / 6);
const D2R = Math.PI / 180;
/** Screen point on the desk (z = 0) back to world x, y. */
const W = (sx, sy) => [(sx / C + 2 * sy) / 2, (2 * sy - sx / C) / 2];

/*
 * Layouts. Devices are placed in screen units of the computer's drawing: (x, y) is where the bottom-centre of the
 * device's drawing lands, w its width, d its depth order (bigger = nearer, drawn later). The computer spans about
 * x -158..88, y -130..146 and is drawn at depth 100. Labels sit at (lx, ly) from the device's bottom-centre.
 */
const TURN = 28; // degrees the computer is turned towards the viewer (45 would be square on)
const LAYOUT_D = {
  // a wide U around the computer, like a product line-up: the bigger devices stand behind, the small ones in front
  frame: [-338, -144, 666, 384],
  dev: {
    docs: { x: -206, y: 70, w: 138, d: 20, lx: -4, ly: 9 },
    brands: { x: -228, y: 204, w: 100, d: 204, lx: 0, ly: 8 },
    engagement: { x: -108, y: 212, w: 58, d: 212, lx: 0, ly: 8 },
    audience: { x: 145, y: 40, w: 126, d: 20, lx: 4, ly: 9 },
    collabs: { x: 255, y: 122, w: 112, d: 120, lx: 0, ly: 9 },
    contact: { x: 168, y: 210, w: 32, d: 210, lx: 0, ly: 8 },
  },
};
const LAYOUT_M = {
  // phones: the computer fills the width (so its screen reads); the six devices stand in front of it in two rows, in
  // page order
  frame: [-116, -138, 200, 426],
  dev: {
    brands: { x: -76, y: 210, w: 50, d: 210, lx: 0, ly: 6 },
    collabs: { x: -8, y: 206, w: 58, d: 211, lx: 0, ly: 8 },
    audience: { x: 58, y: 204, w: 46, d: 209, lx: 0, ly: 10 },
    engagement: { x: -74, y: 268, w: 30, d: 268, lx: 4, ly: 6 },
    docs: { x: -6, y: 272, w: 58, d: 272, lx: 0, ly: 6 },
    contact: { x: 60, y: 270, w: 20, d: 270, lx: 0, ly: 6 },
  },
};

// the sound each device makes as it switches on
const BOOT_SND = {
  audience: (s) => s.ping(),
  engagement: (s) => s.approve(),
  brands: (s) => { s.click(); s.blip(1320, 0.05); },
  docs: (s) => s.bell(),
  collabs: (s) => s.motor(0.35),
  contact: (s) => { s.beep(880, 0.06, 'sine', 0.05); setTimeout(() => s.beep(1175, 0.08, 'sine', 0.05), 90); },
};
const clamp01 = (k) => Math.max(0, Math.min(1, k));
const easeOut = (k) => 1 - Math.pow(1 - k, 3);
const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

export default async function buildDesk(ctx, { FIGS, go }) {
  const { K, root, svg, content, sound, mobile, reduced } = ctx;
  const deskEl = ctx.stage.parentNode;
  /* ---------------- the room: dark until the desk is switched on ---------------- */
  // a canvas over the whole card; each powered device cuts a soft hole of light into it
  let state = reduced ? 'on' : 'standby';
  const holes = [];
  let roomA = 0.9, room = null;
  if (!reduced) {
    deskEl.classList.add('dark');
    const cv = document.createElement('canvas');
    cv.className = 'room'; cv.setAttribute('aria-hidden', 'true');
    deskEl.appendChild(cv);
    const c2 = cv.getContext('2d');
    let color = '#0b1030', W0 = 0, H0 = 0, raf = 0;
    const readColor = () => { color = getComputedStyle(document.documentElement).getPropertyValue('--room').trim() || '#0b1030'; };
    readColor();
    window.addEventListener('themechange', readColor);
    const size = () => { const r = deskEl.getBoundingClientRect(), dpr = Math.min(1.5, devicePixelRatio || 1); W0 = r.width; H0 = r.height; cv.width = Math.round(W0 * dpr); cv.height = Math.round(H0 * dpr); c2.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();
    const ro = new ResizeObserver(size); ro.observe(deskEl);
    const draw = (now) => {
      const hr = deskEl.getBoundingClientRect(), sr = ctx.stage.getBoundingClientRect(), sc = ctx.scale || 1;
      c2.globalCompositeOperation = 'source-over';
      c2.clearRect(0, 0, W0, H0);
      c2.globalAlpha = roomA; c2.fillStyle = color; c2.fillRect(0, 0, W0, H0); c2.globalAlpha = 1;
      c2.globalCompositeOperation = 'destination-out';
      for (const h of holes) {
        const k = h.t0 == null ? 0 : easeOut(clamp01((now - h.t0) / h.dur));
        let r = (h.from + (h.to - h.from) * k) * sc;
        if (h.breathe && state === 'standby') r *= 1 + 0.07 * Math.sin(now / 420);
        if (r < 1) continue;
        const [px, py] = ctx.toStage(h.x, h.y), X = px + sr.left - hr.left, Y = py + sr.top - hr.top;
        const gr = c2.createRadialGradient(X, Y, 0, X, Y, r);
        gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.55, 'rgba(0,0,0,.94)'); gr.addColorStop(0.8, 'rgba(0,0,0,.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        c2.fillStyle = gr; c2.beginPath(); c2.arc(X, Y, r, 0, Math.PI * 2); c2.fill();
      }
    };
    const loop = (t) => { draw(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    room = { cv, remove() { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('themechange', readColor); cv.remove(); deskEl.classList.remove('dark'); room = null; } };
  }
  const { g, el, face, txt, top, plane, shift, rrect, circle, ellipse, P, at, dpoly, add, mul, hull, MAT } = iso;
  // phones and portrait tablets get the tall desk, everything else the wide one
  const ar = ctx.stage.clientWidth / Math.max(1, ctx.stage.clientHeight);
  const tall = innerWidth <= 760 || ar < 1.05;
  const L = tall ? LAYOUT_M : LAYOUT_D;
  const labelsHost = ctx.desk?.labels;
  const items = []; // { d, node }
  const put = (d, node) => { items.push({ d, node }); return node; };
  const M = (v, amb = 0.5) => ({ v, amb });

  /* ---------------- the computer (the centrepiece, interactive) ---------------- */
  const compG = g({ class: 'comp' });
  root.appendChild(compG);
  const cctx = Object.assign(Object.create(ctx), { root: compG, view() {}, fit() {}, turn: TURN, wake: () => boot() });
  const comp = (await buildComputer(cctx)) || {};
  put(100, compG);

  /* ---------------- the eight devices ---------------- */
  const devs = [];
  for (const f of FIGS) {
    const spec = L.dev[f.id];
    if (!spec) continue;
    const outer = g({ class: 'dev', 'data-id': f.id });
    const lift = g({ class: 'lift' });
    const r = g({ class: 'droot' });
    lift.appendChild(r); outer.appendChild(lift);
    root.appendChild(outer);
    const hK = iso.kit(svg, 'h' + f.id);
    const hx = { K: hK, iso, root: r, svg, content, data: ctx.data, get ig() { return ctx.ig; }, mobile, reduced, theme: ctx.theme, themeColor: ctx.themeColor };
    try {
      const mod = await import(`./devices/${f.mod}.js`);
      if (mod.hero) await mod.hero(hx); else throw new Error('no hero()');
    } catch (err) {
      console.warn('hero mini not ready:', f.mod, err?.message);
      r.replaceChildren(txt(f.sec, 0, 0, { size: 12, anchor: 'middle', fill: 'var(--lab)' }));
    }
    const b = r.getBBox();
    const s = spec.w / (b.width || 1);
    const tx = spec.x - (b.x + b.width / 2) * s, ty = spec.y - (b.y + b.height) * s;
    outer.setAttribute('transform', `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)})`);
    outer.dataset.hs = s.toFixed(4);
    outer.style.setProperty('--lift', `${(-5 / s).toFixed(2)}px`);
    put(spec.d, outer);
    devs.push({ f, spec, outer, s });
  }

  /* ---------------- painter's order ---------------- */
  items.sort((a, b) => a.d - b.d).forEach((it) => root.appendChild(it.node));
  // screen readers get the labels (links) and the computer; the rest of the desk is decoration
  items.forEach((it) => { if (it.node !== compG) it.node.setAttribute('aria-hidden', 'true'); });

  /* ---------------- links: each device goes to its section ---------------- */
  const labels = [];
  devs.forEach(({ f, spec, outer }) => {
    const a = document.createElement('a');
    a.className = 'dlab'; a.href = '#' + f.id;
    a.innerHTML = `<span>${f.sec}</span>`;
    labelsHost?.appendChild(a);
    const on = (v) => { outer.classList.toggle('on', v); a.classList.toggle('on', v); };
    outer.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && state === 'on') { on(true); sound.tick?.(); } });
    outer.addEventListener('pointerleave', () => on(false));
    a.addEventListener('pointerenter', () => on(true));
    a.addEventListener('pointerleave', () => on(false));
    a.addEventListener('focus', () => on(true));
    a.addEventListener('blur', () => on(false));
    // the click that wakes the desk only wakes it; after that a click sends the device flying into its section
    const open = (e) => { e.preventDefault(); if (state !== 'on' || performance.now() < swallow) { boot(); return; } sound.click?.(); go(f.id); };
    outer.addEventListener('click', open);
    a.addEventListener('click', open);
    labels.push({ a, x: spec.x + (spec.lx || 0), y: spec.y + (spec.ly ?? 10), id: f.id });
  });
  const placeLabels = () => labels.forEach((lb) => { const [px, py] = ctx.toStage(lb.x, lb.y); lb.a.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`; });
  ctx.onLayout(placeLabels);

  /* ---------------- frame ---------------- */
  if (tall) ctx.stage.closest('.card')?.style.setProperty('--desk-ar', (L.frame[2] / L.frame[3]).toFixed(4));
  ctx.view(...L.frame);
  placeLabels();

  /* ---------------- power on ---------------- */
  const sc0 = comp.screenAt?.() || [-17, -40];
  const compHole = { x: sc0[0], y: sc0[1], from: 84, to: 84, t0: null, dur: 700, breathe: true };
  holes.push(compHole);
  // devices switch on in a ripple outwards from the computer
  const order = devs.map((d) => {
    const b = d.outer.getBBox(), h = b.height * d.s;
    const cx = d.spec.x, cy = d.spec.y - h / 2;
    return { ...d, cx, cy, r: Math.max(d.spec.w, h) * 1.05, dist: Math.hypot(cx - sc0[0], cy - sc0[1]) };
  }).sort((a, b) => a.dist - b.dist);
  const labelOf = (id) => labels.find((l) => l.id === id)?.a;
  let swallow = 0, idleT = 0;
  const busy = (v) => window.dispatchEvent(new CustomEvent('hw:busy', { detail: v }));
  function allOn() { state = 'on'; labels.forEach((l) => l.a.classList.add('lit')); room?.remove(); unlisten(); busy(false); }
  function instantOn() { if (state === 'on') return; comp.power?.({ instant: true }); allOn(); }
  function boot() {
    if (state !== 'standby') return;
    state = 'booting';
    unlisten();
    busy(true);
    comp.power?.();
    const t0 = performance.now();
    Object.assign(compHole, { from: 84, to: tall ? 170 : 230, t0 });
    order.forEach((d, i) => setTimeout(() => {
      if (!room) return;
      holes.push({ x: d.cx, y: d.cy, from: 0, to: d.r, t0: performance.now(), dur: 620 });
      d.outer.classList.add('boot');
      setTimeout(() => d.outer.classList.remove('boot'), 700);
      labelOf(d.f.id)?.classList.add('lit');
      BOOT_SND[d.f.id]?.(sound);
    }, 520 + i * 190));
    // then the lights come up
    const up = 520 + order.length * 190 + 520;
    setTimeout(() => {
      const u0 = performance.now(), a0 = roomA;
      const fade = (t) => { const k = clamp01((t - u0) / 900); roomA = a0 * (1 - easeInOut(k)); if (k < 1) requestAnimationFrame(fade); else allOn(); };
      requestAnimationFrame(fade);
    }, up);
  }
  // the first click or key press anywhere wakes the desk (and lets the browser play sound)
  const onDown = (e) => { if (deskEl.contains(e.target)) swallow = performance.now() + 900; boot(); };
  const onKey = (e) => { if (e.metaKey || e.ctrlKey || e.altKey || ['Shift', 'Meta', 'Control', 'Alt', 'CapsLock', 'Escape'].includes(e.key)) return; boot(); };
  function unlisten() { window.removeEventListener('pointerdown', onDown, true); window.removeEventListener('keydown', onKey, true); clearTimeout(idleT); heroIO?.disconnect(); }
  let heroIO = null;

  /* ---------------- fly: a clicked device flies down into its section ---------------- */
  // where to land: the section's own drawing once it is built, else the middle of its stage
  function aim(stage) {
    const S = stage.getBoundingClientRect();
    const r = stage.querySelector('svg.art > .root')?.getBoundingClientRect();
    if (!r || r.width < 20 || r.height < 20) return { left: S.left + S.width * 0.2, top: S.top + S.height * 0.2, width: S.width * 0.6, height: S.height * 0.6 };
    const l = Math.max(r.left, S.left), t = Math.max(r.top, S.top), rr = Math.min(r.right, S.right), b = Math.min(r.bottom, S.bottom);
    return { left: l, top: t, width: Math.max(20, rr - l), height: Math.max(20, b - t) };
  }
  function fly(id, target) {
    if (reduced || state !== 'on' || !target) return false;
    const d = devs.find((x) => x.f.id === id);
    if (!d) return false;
    const r0 = d.outer.getBoundingClientRect();
    const m = root.getScreenCTM();
    if (!m || !r0.width || r0.bottom < 0 || r0.top > innerHeight) return false;
    const NS = 'http://www.w3.org/2000/svg';
    const fs = document.createElementNS(NS, 'svg');
    fs.setAttribute('class', 'flyer'); fs.setAttribute('aria-hidden', 'true');
    const VW = document.documentElement.clientWidth, VH = document.documentElement.clientHeight;
    fs.setAttribute('viewBox', `0 0 ${VW} ${VH}`); fs.setAttribute('width', VW); fs.setAttribute('height', VH);
    const clone = d.outer.cloneNode(true);
    clone.classList.remove('on', 'boot');
    const base = g({ transform: `matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.e} ${m.f})` }, [clone]);
    const mover = g({}, [base]);
    fs.appendChild(mover);
    document.body.appendChild(fs);
    const hair0 = parseFloat(d.outer.style.getPropertyValue('--hair')) || 1;
    d.outer.style.transition = 'none'; d.outer.style.opacity = '0';
    const c0 = [r0.left + r0.width / 2, r0.top + r0.height / 2];
    const t0 = performance.now(), DUR = 1250;
    sound.whoosh?.();
    const step = (now) => {
      const k = clamp01((now - t0) / DUR), e = easeInOut(k);
      const T = aim(target);
      const kEnd = Math.min(T.width / r0.width, T.height / r0.height) * 0.9;
      const s = 1 + (kEnd - 1) * e;
      const cx = c0[0] + (T.left + T.width / 2 - c0[0]) * e;
      const cy = c0[1] + (T.top + T.height / 2 - c0[1]) * e - Math.sin(Math.PI * k) * Math.min(150, innerHeight * 0.17);
      mover.setAttribute('transform', `translate(${cx.toFixed(1)} ${cy.toFixed(1)}) scale(${s.toFixed(4)}) translate(${(-c0[0]).toFixed(1)} ${(-c0[1]).toFixed(1)})`);
      clone.style.setProperty('--hair', (hair0 / s).toFixed(4));
      fs.style.opacity = k < 0.7 ? '1' : String(Math.max(0, 1 - (k - 0.7) / 0.3));
      if (k < 1) { requestAnimationFrame(step); return; }
      fs.remove();
      const card = target.closest('.card');
      if (card) { card.classList.remove('landed'); void card.offsetWidth; card.classList.add('landed'); setTimeout(() => card.classList.remove('landed'), 800); }
      sound.thunk?.();
      setTimeout(() => { d.outer.style.transition = 'opacity .6s'; d.outer.style.opacity = ''; }, 250);
    };
    requestAnimationFrame(step);
    return true;
  }

  return {
    plotted() {
      if (state !== 'standby') { comp.power?.({ instant: true }); allOn(); return; }
      window.addEventListener('pointerdown', onDown, true);
      window.addEventListener('keydown', onKey, true);
      // nobody touched anything: boot anyway after a few seconds (silently, as browsers only allow sound after a click)
      const arm = () => { clearTimeout(idleT); idleT = setTimeout(() => (document.hidden ? arm() : boot()), 6500); };
      arm();
      // scrolled away before switching on: switch on without the show
      heroIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.intersectionRatio < 0.25 && state === 'standby') instantOn(); }), { threshold: [0, 0.25] });
      heroIO.observe(deskEl);
    },
    fly,
    get state() { return state; },
    start() { comp.start?.(); },
    stop() { comp.stop?.(); },
  };
}
