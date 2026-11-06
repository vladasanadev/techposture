// Power On · Vlada's portfolio as one desk of working hardware, set out like a product line-up. The hero is the whole
// desk, dark until the visitor switches it on; each section below is one device. The pointer is a 1-bit mouse cursor.
import * as iso from './iso.js';
import { sound } from './sound.js';
import * as content from './content.js';
import { drawChrome } from './chrome.js';
import { initCursor } from './cursor.js';

/** Sections, in page order. `cap` is the one-liner under each device in the hero. */
export const FIGS = [
  { id: 'brands', sec: 'Brands', title: 'Brands she has partnered with', blurb: 'From SpaceX AI to the builders to watch, one logo at a time.', hint: 'Spin the wheel', name: 'Music player', mod: 'ipod', cap: '40 brands, ranked' },
  { id: 'collabs', sec: 'Collabs', title: 'A tape for every collab', blurb: 'The bigger the brand, the bigger the tape. Pick one to watch the reel.', hint: 'Pick a tape', name: 'Camcorder', mod: 'camcorder', cap: 'Watch every collab' },
  { id: 'audience', sec: 'Audience', title: 'Who watches', blurb: 'Developers, AI users, founders and tech professionals, mostly here.', hint: 'Pick a country', name: 'Radar', mod: 'radar', cap: 'Who watches' },
  { id: 'engagement', sec: 'Engagement', title: 'The numbers, on receipts', blurb: 'Her page at a glance, and every collab printed out.', hint: 'Press a brand', name: 'Card terminal', mod: 'pos', cap: 'Numbers, on receipts' },
  { id: 'docs', sec: 'Library', title: 'Guides, skills and products', blurb: 'Everything she has written, packaged and built.', hint: 'Pick one', name: 'Vending machine', mod: 'vending', cap: 'Guides, skills, products' },
  { id: 'contact', sec: "Let's work", title: 'Work with me', blurb: 'Collabs, launches, events, workshops. Pick up the phone.', hint: 'Dial', name: 'Mobile phone', mod: 'phone', cap: 'Work with me' },
];
export const THEMES = ['candy', 'sky', 'night', 'cherry', 'cobalt']; // the switcher offers candy (the default), sky, night

const qs = new URLSearchParams(location.search);
const ONLY = qs.get('only');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
const main = document.getElementById('figs');
const indexNav = document.querySelector('.index');
const figs = [];
const byId = new Map();
let armed = null;
let igManifest = null;
const igReady = fetch('../shared/ig/manifest.json').then((r) => r.json()).then((m) => (igManifest = m)).catch(() => null);
const DATA = {};
const dataReady = Promise.all(['collabs', 'engagement', 'docs', 'audience', 'library'].map((k) =>
  fetch(`data/${k}.json`).then((r) => (r.ok ? r.json() : null)).then((d) => { DATA[k] = d; }).catch(() => { DATA[k] = null; })));

/* ---------- theme ---------- */
const themeBtns = [...document.querySelectorAll('.themes button')];
function setTheme(t, persist = true) {
  if (!THEMES.includes(t)) t = 'candy';
  document.documentElement.dataset.theme = t;
  themeBtns.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.t === t)));
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#0a0a0a';
  if (persist) { try { localStorage.setItem('hw21-theme', t); } catch (e) {} }
  window.dispatchEvent(new CustomEvent('themechange', { detail: t }));
}
themeBtns.forEach((b) => b.addEventListener('click', () => { setTheme(b.dataset.t); sound.tick(); }));
setTheme(document.documentElement.dataset.theme || 'candy', false);
/** Read a theme colour (for canvas drawing). */
export const themeColor = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/* ---------- sound (on by default; plays after the first click or key) ---------- */
const sndBtn = document.querySelector('.snd');
sndBtn.addEventListener('click', () => sound.toggle());
const syncSnd = (on) => { sndBtn.setAttribute('aria-pressed', String(on)); sndBtn.setAttribute('aria-label', on ? 'Sound on' : 'Sound off'); };
sound.onChange((on) => { syncSnd(on); if (on) sound.tick(); });
syncSnd(sound.on);

/* ---------- reel modal ---------- */
const dlg = document.querySelector('dialog.reel');
const dlgFrame = dlg.querySelector('.reel-frame');
let dlgReturn = null;
export function openReel(r) {
  if (!r || !r.embed) return;
  dlgReturn = document.activeElement;
  dlgFrame.innerHTML = '';
  const f = document.createElement('iframe');
  f.src = r.embed; f.title = `${r.brand || ''} ${r.title || ''}`.trim() || 'Reel'; f.loading = 'lazy'; f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.setAttribute('allowfullscreen', '');
  dlgFrame.appendChild(f);
  const n = r.plays != null ? (r.plays >= 1e6 ? (r.plays / 1e6).toFixed(2) + 'M' : r.plays >= 1e3 ? (r.plays / 1e3).toFixed(1).replace(/\.0$/, '') + 'K' : r.plays) + ' plays' : r.views ? r.views + ' views' : null;
  dlg.querySelector('.reel-t').textContent = [r.brand, r.title, n].filter(Boolean).join(' · ');
  dlg.querySelector('.reel-l').href = r.link || r.embed.replace(/embed\/?$/, '');
  dlg.showModal();
  window.__lenis?.stop();
}
dlg.querySelector('.reel-x').addEventListener('click', () => dlg.close());
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
dlg.addEventListener('close', () => { dlgFrame.innerHTML = ''; window.__lenis?.start(); dlgReturn?.focus?.(); });

/* ---------- router: the computer (and anything else) can send people anywhere ---------- */
export const HW = {
  /** Scroll to a section and hand it optional params (e.g. { brand: 'Hostinger' }). */
  go(id, params) {
    if (id === 'top' || id === 'hero') { scrollToEl(document.getElementById('top')); return true; }
    const fx = byId.get(id);
    if (!fx) return false;
    // while the desk is on screen, the device itself flies down into its section
    byId.get('desk')?.api?.fly?.(id, fx.sec.querySelector('.stage'));
    scrollToEl(fx.sec);
    if (params) { if (fx.api) fx.goFns.forEach((fn) => fn(params)); else fx.pendingGo = params; }
    if (!fx.built) build(fx);
    return true;
  },
  /** Open an external page in a new tab. Call it straight from a click or key handler so the browser allows it. */
  open(url) { const w = window.open(url, '_blank', 'noopener'); return !!w; },
  sections: () => FIGS.map((f) => ({ id: f.id, sec: f.sec, title: f.title })),
};
window.HW = HW;
function scrollToEl(elx) {
  if (!elx) return;
  const y = elx.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bar')) || 64) - 2;
  if (window.__lenis) window.__lenis.scrollTo(Math.max(0, y), { duration: reduced ? 0 : 1.3 });
  else window.scrollTo({ top: Math.max(0, y), behavior: reduced ? 'auto' : 'smooth' });
}

/* ---------- drawing contexts ---------- */
function makeCtx(f, host, sec) {
  const svg = host.querySelector('svg.art');
  const stage = host.querySelector('.stage');
  const ovl = host.querySelector('.ovl');
  const foreSvg = host.querySelector('svg.fore');
  const K = iso.kit(svg, f.id);
  const KF = iso.kit(foreSvg, f.id + 'f');
  const root = iso.g({ class: 'root' });
  const fore = iso.g({ class: 'root' });
  svg.appendChild(root); foreSvg.appendChild(fore);
  const overlays = [];
  const shows = [], hides = [], rafs = [], goFns = [], themeFns = [], layoutFns = [];
  let vb = [0, 0, 100, 100];
  let scale = 1, ox = 0, oy = 0;
  const q = (s) => sec.querySelector(s);
  const ctx = {
    fig: f, sec, svg, root, stage, ovl, K, iso, sound, content, reduced, mobile, foreSvg, fore, KF,
    get ig() { return igManifest; },
    get data() { return DATA; },
    igReady, dataReady, HW, themeColor,
    theme: () => document.documentElement.dataset.theme,
    visible: false,
    status(html) { const e = q('.st'); if (e) e.innerHTML = html; },
    hint(text) { const e = q('.bl'); if (e) e.textContent = text; },
    name(text) { const e = q('.tr'); if (e) e.textContent = text; },
    dot(on) { q('.dot')?.classList.toggle('on', !!on); },
    a11y(html) { const e = q('.acc'); if (e) e.innerHTML = html; },
    view(x, y, w, h) { vb = [x, y, w, h]; const s = vb.map((v) => Math.round(v * 100) / 100).join(' '); svg.setAttribute('viewBox', s); foreSvg.setAttribute('viewBox', s); layout(); },
    fit(pad = 20, elx = root, extra = {}) {
      const b = elx.getBBox();
      const t = extra.top || 0, bt = extra.bottom || 0, l = extra.left || 0, r = extra.right || 0;
      this.view(b.x - pad - l, b.y - pad - t, b.width + pad * 2 + l + r, b.height + pad * 2 + t + bt);
    },
    getView: () => vb.slice(),
    /** Scene units to stage pixels (for HTML that sits on the drawing but must not scale, like labels). */
    toStage: (x, y) => [x * scale + ox, y * scale + oy],
    onLayout(fn) { layoutFns.push(fn); },
    overlay(elm, pl, a = 0, b = 0) { const o = { elm, pl, a, b }; overlays.push(o); ovl.appendChild(elm); placeOne(o); return { update: () => placeOne(o), remove() { elm.remove(); overlays.splice(overlays.indexOf(o), 1); } }; },
    openReel,
    onKey: null,
    arm() { arm(fx); },
    hit(node, label, fn, opts = {}) {
      node.classList.add('hit');
      node.setAttribute('role', opts.role || 'button');
      node.setAttribute('tabindex', opts.tabindex ?? 0);
      node.setAttribute('aria-label', label);
      node.addEventListener('pointerdown', (e) => { if (e.button > 0) return; arm(fx); fn(e); });
      node.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); arm(fx); fn(e); } });
      (node.ownerSVGElement || svg).removeAttribute('aria-hidden');
      return node;
    },
    press(node, dz = 1.6, ms = 110) { node.classList.add('press', 'down'); node.style.transform = `translateY(${dz}px)`; clearTimeout(node._pt); node._pt = setTimeout(() => { node.classList.remove('down'); node.style.transform = ''; }, ms); },
    on(ev, fn) { (ev === 'show' ? shows : ev === 'hide' ? hides : ev === 'theme' ? themeFns : []).push(fn); },
    /** Receive params from HW.go(sectionId, params), e.g. the computer asking the camcorder to play a brand. */
    onGo(fn) { goFns.push(fn); },
    raf(fn) { rafs.push(fn); },
    textInput() {
      if (ctx._ti) return ctx._ti;
      const ti = document.createElement('textarea');
      ti.className = 'sr'; ti.setAttribute('aria-label', `Type on the ${f.name.toLowerCase()}`); ti.autocapitalize = 'off'; ti.autocomplete = 'off'; ti.spellcheck = false;
      ti.addEventListener('beforeinput', (e) => {
        e.preventDefault();
        if (e.inputType === 'deleteContentBackward') ctx.onKey?.({ key: 'Backspace', preventDefault() {} });
        else if (e.inputType === 'insertLineBreak' || e.inputType === 'insertParagraph') ctx.onKey?.({ key: 'Enter', preventDefault() {} });
        else if (e.data) for (const ch of e.data) ctx.onKey?.({ key: ch, preventDefault() {} });
      });
      (sec.querySelector('.card') || sec).appendChild(ti);
      ctx._ti = ti;
      return ti;
    },
  };
  function layout() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    scale = Math.min(w / vb[2], h / vb[3]);
    ox = (w - vb[2] * scale) / 2 - vb[0] * scale;
    oy = (h - vb[3] * scale) / 2 - vb[1] * scale;
    const hair = (0.92 / scale).toFixed(4);
    svg.style.setProperty('--hair', hair);
    foreSvg.style.setProperty('--hair', hair);
    // groups drawn at their own scale (the devices on the hero desk) keep 1px lines too
    svg.querySelectorAll('[data-hs]').forEach((n) => n.style.setProperty('--hair', (0.92 / scale / parseFloat(n.dataset.hs)).toFixed(4)));
    ctx.scale = scale;
    overlays.forEach(placeOne);
    layoutFns.forEach((fn) => fn(scale));
  }
  function placeOne(o) {
    const [a, b, c, d, e, f2] = iso.matrixArr(iso.shift(o.pl, o.a, o.b));
    o.elm.style.transform = `matrix(${a * scale},${b * scale},${c * scale},${d * scale},${e * scale + ox},${f2 * scale + oy})`;
  }
  const fx = { f, sec, ctx, layout, shows, hides, rafs, goFns, themeFns, api: null, built: false, shown: false, pendingGo: null };
  new ResizeObserver(layout).observe(stage);
  return fx;
}

function arm(fx) { armed = fx; }
document.addEventListener('pointerdown', (e) => { if (!e.target.closest('.card')) armed = null; });
document.addEventListener('keydown', (e) => {
  if (e.defaultPrevented || dlg.open || !armed || !armed.ctx.onKey) return;
  const t = e.target;
  if (t && (t.tagName === 'INPUT' || (t.tagName === 'TEXTAREA' && t !== armed.ctx._ti) || t.isContentEditable)) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (t === armed.ctx._ti) return;
  if (armed.ctx.onKey(e) === true) e.preventDefault();
});
window.addEventListener('themechange', () => figs.forEach((fx) => fx.themeFns.forEach((fn) => fn(document.documentElement.dataset.theme))));

/* plotter: parts are drawn in order, lines first, then the fills */
function plot(svgs, parts, after, dur = mobile ? 0.5 : 0.95, delay = 0) {
  svgs.forEach((s) => s.classList.remove('pre'));
  if (reduced) { setTimeout(() => after?.(), 300); return; }
  const n = parts.length;
  parts.forEach((p, i) => p.style.setProperty('--d', (delay + (i / Math.max(1, n - 1)) * dur).toFixed(3) + 's'));
  svgs.forEach((s) => { s.querySelectorAll('path.s, path.s2, path.s3').forEach((p) => p.setAttribute('pathLength', '1')); s.classList.add('plot'); });
  setTimeout(() => {
    svgs.forEach((s) => { s.classList.remove('plot'); s.querySelectorAll('[pathLength]').forEach((p) => p.removeAttribute('pathLength')); });
    after?.();
  }, (delay + dur + 1.6) * 1000);
}

async function build(fx) {
  if (fx.built) return fx.buildP;
  fx.built = true;
  fx.buildP = (async () => {
    try {
      const mod = await import(`./devices/${fx.f.mod}.js`);
      await Promise.all([igReady, dataReady]);
      fx.api = (await mod.default(fx.ctx)) || {};
      fx.layout();
      if (fx.pendingGo) { const p = fx.pendingGo; fx.pendingGo = null; fx.goFns.forEach((fn) => fn(p)); }
    } catch (err) {
      console.warn('device not ready:', fx.f.mod, err?.message);
      fx.ctx.status('in assembly');
      fx.ctx.svg.classList.remove('pre'); fx.ctx.foreSvg.classList.remove('pre');
      return;
    }
    if (fx.visible) show(fx);
  })();
  return fx.buildP;
}
function show(fx) {
  if (!fx.api) return;
  if (!fx.shown) { fx.shown = true; plot([fx.ctx.svg, fx.ctx.foreSvg], [...fx.ctx.root.children, ...fx.ctx.fore.children], () => fx.api?.plotted?.()); }
  fx.ctx.visible = true;
  fx.api.start?.();
  fx.shows.forEach((f) => f());
}
function hide(fx) {
  fx.ctx.visible = false;
  if (armed === fx) armed = null;
  if (!fx.api) return;
  fx.api.stop?.();
  fx.hides.forEach((f) => f());
}

/* ---------- section cards ---------- */
function card(f, n) {
  const sec = document.createElement('section');
  sec.className = 'fig'; sec.id = f.id;
  sec.setAttribute('aria-labelledby', f.id + '-h');
  sec.innerHTML = `
    <div class="card">
      <div class="head"><h2 id="${f.id}-h">${f.title}</h2></div>
      <div class="stage"><svg class="art pre" aria-hidden="true" focusable="false"></svg><div class="ovl"></div><svg class="fore pre" aria-hidden="true" focusable="false"></svg></div>
      <div class="sr acc"></div>
    </div>`;
  return sec;
}

/* ---------- hero: the whole desk, every device on ---------- */
async function buildHero() {
  const desk = document.getElementById('desk');
  // the desk is one drawing: the computer in the middle, the eight devices around it, and the clutter of a real desk
  const deskFig = { id: 'desk', sec: 'Hello', name: 'Desk computer', hint: '', mod: 'computer' };
  const dfx = makeCtx(deskFig, desk, document.querySelector('.hero'));
  dfx.ctx.desk = { form: desk.querySelector('.ask'), input: desk.querySelector('#ask-in'), out: desk.querySelector('#ask-out'), labels: desk.querySelector('.labels') };
  dfx.visible = true;
  figs.unshift(dfx);
  byId.set('desk', dfx);
  await Promise.all([igReady, dataReady]);
  try {
    const scene = await import('./desk.js');
    dfx.built = true;
    dfx.api = (await scene.default(dfx.ctx, { FIGS, go: (id) => HW.go(id) })) || {};
    dfx.layout();
  } catch (err) { console.warn('desk not ready', err?.message); }
  // no plotter here: the desk starts dark and its power-on is the opening
  [dfx.ctx.svg, dfx.ctx.foreSvg].forEach((s) => s.classList.remove('pre'));
  dfx.api?.plotted?.();
  dfx.shown = true;
  dfx.ctx.visible = true;
  dfx.api?.start?.();
}

function init() {
  const list = ONLY ? FIGS.filter((f) => f.mod === ONLY || f.id === ONLY) : FIGS;
  if (!ONLY || ONLY === 'computer' || ONLY === 'hero') buildHero();
  else document.querySelector('.hero').remove();
  if (ONLY === 'hero' || ONLY === 'computer') { FIGS.forEach((f) => addIndex(f, null)); }
  list.forEach((f) => {
    const n = FIGS.indexOf(f) + 2;
    const sec = card(f, n);
    main.appendChild(sec);
    const fx = makeCtx(f, sec.querySelector('.card'), sec);
    figs.push(fx);
    byId.set(f.id, fx);
    sec.addEventListener('pointerdown', () => arm(fx));
    sec.addEventListener('focusin', () => arm(fx));
    addIndex(f, fx);
  });
  const near = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) build(e.target._fx); }), { rootMargin: '100% 0px 100% 0px' });
  const vis = new IntersectionObserver((es) => es.forEach((e) => {
    const fx = e.target._fx;
    fx.visible = e.isIntersecting;
    if (e.isIntersecting) show(fx); else hide(fx);
  }), { threshold: 0.18 });
  const cur = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) figs.forEach((x) => x.link?.classList.toggle('on', x.sec === e.target)); }), { rootMargin: '-45% 0px -45% 0px' });
  figs.forEach((fx) => { if (fx.f.id === 'desk') return; fx.sec._fx = fx; near.observe(fx.sec); vis.observe(fx.sec); cur.observe(fx.sec); });
  // the desk computer pauses when the hero leaves the screen
  const hero = document.querySelector('.hero');
  if (hero) new IntersectionObserver((es) => es.forEach((e) => document.body.classList.toggle('past-hero', !e.isIntersecting)), { threshold: 0.25 }).observe(hero);
  else document.body.classList.add('past-hero');
  if (hero) new IntersectionObserver((es) => es.forEach((e) => { const d = byId.get('desk'); if (!d?.api) return; d.ctx.visible = e.isIntersecting; if (e.isIntersecting) d.api.start?.(); else d.api.stop?.(); }), { threshold: 0.1 }).observe(hero);

  let last = performance.now();
  const loop = (t) => {
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    for (const fx of figs) if (fx.ctx.visible && fx.api) for (const r of fx.rafs) r(dt, t / 1000);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  document.addEventListener('visibilitychange', () => { if (document.hidden) figs.forEach((fx) => fx.ctx.visible && fx.api?.stop?.()); else figs.forEach((fx) => fx.ctx.visible && fx.api?.start?.()); });
}
function addIndex(f, fx) {
  const a = document.createElement('a');
  a.href = '#' + f.id; a.innerHTML = `<span>${f.sec}</span>`; a.setAttribute('aria-label', f.sec);
  a.addEventListener('click', (e) => { e.preventDefault(); HW.go(f.id); });
  indexNav.appendChild(a);
  if (fx) fx.link = a;
}

function smooth() {
  if (reduced || !window.Lenis) return;
  const lenis = new window.Lenis({ lerp: 0.11, smoothWheel: true });
  window.__lenis = lenis;
  if (window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    lenis.on('scroll', window.ScrollTrigger.update);
    window.gsap.ticker.add((t) => lenis.raf(t * 1000));
    window.gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
}
const go = () => { smooth(); drawChrome({ sound, HW }); initCursor({ sound }); init(); };
if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
