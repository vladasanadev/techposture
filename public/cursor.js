// cursor.js · The pointer is a 1-bit mouse cursor from the same old computer.
// An arrow, a pointing hand over anything you can press, an I-beam over the screen you type on, and a ticking
// wristwatch while the desk boots. Clicks press it down with a little spark and the mouse's microswitch sound.
// Drawn in pixels (X = ink, o = paper) in the theme's colours. Only for a real mouse; touch screens keep their own.

const ART = {
  arrow: { hot: [0.5, 0.5], rows: [
    'o.........',
    'oo........',
    'oXo.......',
    'oXXo......',
    'oXXXo.....',
    'oXXXXo....',
    'oXXXXXo...',
    'oXXXXXXo..',
    'oXXXXXXXo.',
    'oXXXXXXXXo',
    'oXXXXXoooo',
    'oXXoXXo...',
    'oXo.oXXo..',
    'oo..oXXo..',
    'o....oXXo.',
    '.....oXXo.',
    '......oo..',
  ] },
  hand: { hot: [6, 0.5], rows: [
    '.....XX.........',
    '....XooX........',
    '....XooX........',
    '....XooX........',
    '....XooXXX......',
    '....XooXooXXX...',
    '....XooXooXooXX.',
    '.XX.XooXooXooXoX',
    'XooXXooXooXooXoX',
    'XoooXooooooooooX',
    '.XoooooooooooooX',
    '..XooooooooooooX',
    '..XoooooooooooX.',
    '...XooooooooooX.',
    '...XoooooooooX..',
    '....XooooooooX..',
    '....XXXXXXXXXX..',
  ] },
  beam: { hot: [4, 8.5], outline: true, rows: [
    '.........',
    '.XXX.XXX.',
    '....X....',
    '....X....',
    '....X....',
    '....X....',
    '....X....',
    '....X....',
    '....X....',
    '....X....',
    '....X....',
    '....X....',
    '....X....',
    '....X....',
    '....X....',
    '.XXX.XXX.',
    '.........',
  ] },
  watch: { hot: [6.5, 7.5], rows: [
    '....XXXXX....',
    '....XXXXX....',
    '...XXXXXXX...',
    '..XXoooooXX..',
    '.XXoooooooXX.',
    '.XoooooooooX.',
    'XoooooooooooX',
    'XoooooooooooXX',
    'XoooooooooooX',
    '.XoooooooooX.',
    '.XXoooooooXX.',
    '..XXoooooXX..',
    '...XXXXXXX...',
    '....XXXXX....',
    '....XXXXX....',
  ] },
};
const PRESSABLE = 'a[href], button, label, select, summary, [role="button"], [role="radio"], [role="tab"], [role="link"], .hit, svg .dev, .dlab, [style*="cursor: pointer"], [style*="cursor:pointer"]';
const TEXT = '.ask, input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]';

/** Pixel rows to one SVG: a path per colour, one rectangle per run. */
function draw(name, S) {
  const a = ART[name];
  let rows = a.rows.map((r) => r.split(''));
  const W = Math.max(...rows.map((r) => r.length)), H = rows.length;
  rows = rows.map((r) => r.concat(Array(W - r.length).fill('.')));
  if (a.outline) {
    // paper outline round every ink pixel, so the glyph reads on light and dark alike
    const at = (x, y) => rows[y]?.[x];
    rows = rows.map((r, y) => r.map((c, x) => {
      if (c !== '.') return c;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (at(x + dx, y + dy) === 'X') return 'o';
      return '.';
    }));
  }
  const d = { X: '', o: '' };
  rows.forEach((r, y) => {
    let x = 0;
    while (x < W) {
      const c = r[x];
      let n = 1;
      while (x + n < W && r[x + n] === c) n++;
      if (d[c] != null) d[c] += `M${x} ${y}h${n}v1h${-n}z`;
      x += n;
    }
  });
  const hand = name === 'watch' ? `<g class="wh"><rect x="6" y="3.5" width="1" height="4" class="i"/><rect x="6" y="7" width="2.5" height="1" class="i"/></g>` : '';
  return `<svg class="st st-${name}" viewBox="0 0 ${W} ${H}" width="${W * S}" height="${H * S}" style="left:${-a.hot[0] * S}px;top:${-a.hot[1] * S}px" shape-rendering="crispEdges"><path class="p" d="${d.o}"/><path class="i" d="${d.X}"/>${hand}</svg>`;
}

export function initCursor({ sound } = {}) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const S = (devicePixelRatio || 1) >= 2 ? 1.5 : 2;
  const root = document.documentElement;
  const el = document.createElement('div');
  el.className = 'rcur';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = Object.keys(ART).map((k) => draw(k, S)).join('') +
    `<svg class="spark" viewBox="-8 -8 16 16" width="${16 * S}" height="${16 * S}" style="left:${-8 * S}px;top:${-8 * S}px" shape-rendering="crispEdges"><path d="M-0.5 -7h1v3h-1zM-0.5 4h1v3h-1zM-7 -0.5h3v1h-3zM4 -0.5h3v1h-3zM-5.5 -5.5h1v1h-1zM4.5 -5.5h1v1h-1zM-5.5 4.5h1v1h-1zM4.5 4.5h1v1h-1z"/></svg>`;
  document.body.appendChild(el);
  root.classList.add('rc');

  let state = '', busy = false, shown = false, lastT = null, hoverState = 'arrow';
  const set = (s) => { if (s !== state) { state = s; el.dataset.state = s; } };
  const pick = (t) => {
    if (!t || !t.closest) return 'arrow';
    if (t.closest(TEXT)) return 'beam';
    if (t.closest(PRESSABLE)) return 'hand';
    return 'arrow';
  };
  const refresh = () => set(busy ? 'watch' : hoverState);
  const show = (v) => { if (v !== shown) { shown = v; el.classList.toggle('vis', v); } };
  // the cursor is hidden for modal dialogs (they sit above everything) and full-screen video; the system one takes over
  const native = () => !!(document.fullscreenElement || document.querySelector('dialog[open]'));
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') { show(false); return; }
    if (native()) { root.classList.remove('rc'); show(false); return; }
    root.classList.add('rc');
    el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    if (e.target !== lastT) { lastT = e.target; hoverState = pick(e.target); refresh(); }
    show(true);
  }, { passive: true });
  document.addEventListener('pointerout', (e) => { if (!e.relatedTarget || e.relatedTarget.tagName === 'IFRAME') show(false); });
  addEventListener('blur', () => show(false));
  addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button > 0) return;
    el.classList.add('down');
    el.classList.remove('click'); void el.offsetWidth; el.classList.add('click');
    sound?.mouse?.(true);
  }, true);
  addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') return; el.classList.remove('down'); sound?.mouse?.(false); }, true);
  addEventListener('hw:busy', (e) => { busy = !!e.detail; refresh(); });
  // things appear and vanish under a still mouse (labels light up, windows close): look again now and then
  setInterval(() => { if (shown && lastT && !lastT.isConnected) { lastT = null; hoverState = 'arrow'; refresh(); } }, 500);
  set('arrow');
}
