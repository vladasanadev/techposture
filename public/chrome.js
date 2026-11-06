// chrome.js · The top bar, drawn as hardware from the same desk.
// Logo: a tiny version of the desk computer with a live cursor. Themes: three loose keycaps, one per theme; the chosen
// one is pressed in and its LED is lit. Sound: a little speaker whose cone moves while sound is on. Work with me: a
// red Enter key that really goes down when pressed.
import * as iso from './iso.js';

const { g, el, face, txt, top, frontY, frontX, rrect, circle, ellipse, taperRect, shift, MAT, P } = iso;

/** Draw into an <svg>: build(K, root) then frame the drawing and keep its lines at about 1px. */
function mini(svg, prefix, build, pad = 1.5) {
  svg.replaceChildren();
  const K = iso.kit(svg, prefix);
  const root = g({ class: 'root' });
  svg.appendChild(root);
  const api = build(K, root) || {};
  const b = root.getBBox();
  const vb = [b.x - pad, b.y - pad, b.width + pad * 2, b.height + pad * 2];
  svg.setAttribute('viewBox', vb.map((v) => Math.round(v * 100) / 100).join(' '));
  const fit = () => { const w = svg.clientWidth || svg.getBoundingClientRect().width; if (w) svg.style.setProperty('--hair', (0.95 * vb[2] / w).toFixed(4)); };
  fit();
  new ResizeObserver(fit).observe(svg);
  return api;
}

/* ---------------- logo: the desk computer, small ---------------- */
function drawMac(K, root) {
  root.appendChild(K.shadow(rrect(-2, -2, 24, 26, 4), 0, 0, 0, 0.45, K.blurFilter(1.6)));
  const body = K.box(0, 0, 0, 20, 21, 25, MAT.shell, { r: 2, seg: 4 });
  root.appendChild(body);
  const bez = K.recess(rrect(2, 2.2, 16, 13.4, 1.6, 3), body.fy, 0.8, MAT.deep);
  root.appendChild(bez);
  const scr = g({ class: 'scr' });
  const glass = K.recess(rrect(3.3, 3.4, 13.4, 10.6, 0.9, 3), bez.floor, 0.4, MAT.glass, { content: (pl) => { scr.setAttribute('transform', iso.matrix(pl)); return scr; } });
  root.appendChild(glass);
  scr.appendChild(el('rect', { x: 3.3, y: 3.4, width: 13.4, height: 10.6, style: 'fill:var(--phos)' }));
  scr.appendChild(el('path', { d: 'M5.2 6.3 L8 8.2 L5.2 10.1', style: 'stroke:var(--phos-ink);fill:none', 'stroke-width': 0.9, 'stroke-linecap': 'square' }));
  scr.appendChild(el('rect', { x: 9.4, y: 9.2, width: 3, height: 1.1, style: 'fill:var(--phos-ink)', class: 'blink' }));
  root.appendChild(face(body.fy, [el('rect', { x: 11, y: 18.4, width: 6.5, height: 1, rx: 0.4, style: 'fill:var(--m-deep)' })], 0.02));
  root.appendChild(face(body.fy, [el('circle', { cx: 4, cy: 20.6, r: 0.75, style: 'fill:var(--m-accent)' })], 0.03));
  root.appendChild(K.slots(body.fx, 7, 4, 10, 6, 5));
}

/* ---------------- theme keycaps ---------------- */
const SWATCH = {
  night: { cap: '#3a3a39', side: '#2a2a29', dot: '#e2693c' },
  sky: { cap: '#8cc9f2', side: '#5ea6dc', dot: '#e2262c' },
  candy: { cap: '#e8413a', side: '#c32a2a', dot: '#fff6ea' },
};
function drawKeycap(t) {
  return (K, root) => {
    const sw = SWATCH[t];
    // underglow (lit for the chosen theme), the switch housing, then the cap on top of it
    const ug = K.shadow(rrect(-3, -3, 22, 22, 6), 0, 0, 0, 1, K.blurFilter(2.4));
    ug.setAttribute('class', 'under'); ug.style.fill = 'var(--m-accent)';
    root.appendChild(ug);
    root.appendChild(K.shadow(rrect(-1, -1, 18, 18, 3), 0, 0, 0, 0.5, K.blurFilter(1.4)));
    root.appendChild(K.box(1.5, 1.5, 0, 13, 13, 3, MAT.deep, { r: 1.5 }));
    const capG = g({ class: 'cap' });
    const { cap, base } = taperRect(0, 0, 16, 16, 2.6, 1.9, 3);
    capG.appendChild(K.prism(cap, top(11, 0, 0), 7.5, { c: sw.cap, amb: 0.55 }, { base }));
    capG.appendChild(face(top(11, 0, 0), [el('circle', { cx: 8, cy: 8, r: 2.1, style: `fill:${sw.dot}` }), el('circle', { cx: 8, cy: 8, r: 2.1, class: 's2' })], 0.02));
    root.appendChild(capG);
    // LED on the housing: lit when this theme is on
    const led = el('circle', { cx: 3.4, cy: 1.6, r: 0.9, class: 'led' });
    root.appendChild(face(frontY(14.5, 1.5, 3), [led], 0.05));
  };
}

/* ---------------- sound: a little speaker ---------------- */
function drawSpeaker(K, root) {
  root.appendChild(K.shadow(rrect(-2, -2, 22, 18, 3), 0, 0, 0, 0.5, K.blurFilter(1.6)));
  const body = K.box(0, 0, 0, 18, 14, 26, MAT.shell, { r: 1.6, seg: 4 });
  root.appendChild(body);
  // woofer: a ring set into the front, the cone moves while sound is on
  const fy = body.fy;
  root.appendChild(K.recess(circle(9, 16.5, 6.6, 36), fy, 0.9, MAT.deep));
  const cone = g({ class: 'cone' });
  cone.appendChild(el('circle', { cx: 9, cy: 16.5, r: 5.3, style: 'fill:var(--m-rubber)', class: 'sf' }));
  cone.appendChild(el('circle', { cx: 9, cy: 16.5, r: 3.6, class: 's2' }));
  cone.appendChild(el('circle', { cx: 9, cy: 16.5, r: 1.8, style: 'fill:var(--m-metal)', class: 'sf' }));
  root.appendChild(face(fy, [cone], -0.4));
  // tweeter and the power LED
  root.appendChild(K.recess(circle(9, 5.6, 2.6, 24), fy, 0.6, MAT.deep));
  root.appendChild(face(fy, [el('circle', { cx: 9, cy: 5.6, r: 1.4, style: 'fill:var(--m-metal)', class: 'sf' })], -0.2));
  root.appendChild(face(fy, [el('circle', { cx: 15.2, cy: 23.6, r: 0.85, class: 'led' })], 0.05));
  root.appendChild(K.slots(body.fx, 3, 5, 8, 16, 4));
  // sound waves, out of the front face
  const waves = g({ class: 'waves' });
  [9, 13, 17].forEach((r, i) => waves.appendChild(el('path', { d: `M${9 - r * 0.35} ${16.5 - r * 0.94} A ${r} ${r} 0 0 0 ${9 - r * 0.35} ${16.5 + r * 0.94}`, class: 's2', style: `animation-delay:${i * -0.28}s`, transform: `translate(${-r * 0.3} 0)` })));
  root.appendChild(face(fy, [waves], 0.05));
  // muted: a small cross where the waves were
  root.appendChild(face(fy, [g({ class: 'mute' }, [el('path', { d: 'M-9 12 L-3 21 M-3 12 L-9 21', class: 's' })])], 0.05));
}

/* ---------------- work with me: the big red Enter key ---------------- */
function drawEnter(K, root) {
  root.appendChild(K.shadow(rrect(-1.5, -1.5, 27, 21, 3), 0, 0, 0, 0.5, K.blurFilter(1.6)));
  root.appendChild(K.box(1.5, 1.5, 0, 21, 15, 3, MAT.deep, { r: 1.5 }));
  const capG = g({ class: 'cap' });
  const { cap, base } = taperRect(0, 0, 24, 18, 2.8, 2, 3);
  capG.appendChild(K.prism(cap, top(11.5, 0, 0), 8, { v: 'cta', amb: 0.62 }, { base }));
  capG.appendChild(face(top(11.5, 0, 0), [el('path', { d: 'M16 6 L16 10.5 L8.2 10.5 M10.6 8.2 L8.2 10.5 L10.6 12.8', style: 'stroke:var(--key-ink);fill:none', 'stroke-width': 1.1, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })], 0.02));
  root.appendChild(capG);
}

export function drawChrome({ sound, HW }) {
  const brand = document.querySelector('.brand svg.ico');
  if (brand) mini(brand, 'cb', drawMac);
  document.querySelectorAll('.themes button').forEach((b) => { const s = b.querySelector('svg'); if (s) mini(s, 'ct' + b.dataset.t, drawKeycap(b.dataset.t)); });
  const snd = document.querySelector('.snd svg');
  if (snd) mini(snd, 'cs', drawSpeaker, 2);
  const wk = document.querySelector('.wkey svg');
  if (wk) mini(wk, 'cw', drawEnter);
  // the Enter key goes down when the link is pressed, and the page scrolls to the phone
  const wkey = document.querySelector('.wkey');
  wkey?.addEventListener('pointerdown', () => { wkey.classList.add('down'); sound.key?.(1.3); });
  const up = () => wkey?.classList.remove('down');
  wkey?.addEventListener('pointerup', up); wkey?.addEventListener('pointerleave', up); wkey?.addEventListener('pointercancel', up);
  wkey?.addEventListener('click', (e) => { e.preventDefault(); HW.go('contact'); });
  wkey?.addEventListener('keydown', (e) => { if (e.key === ' ') { e.preventDefault(); wkey.click(); } });
}
