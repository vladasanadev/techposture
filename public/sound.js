// sound.js · tiny synthesised foley for the devices (WebAudio, no files).
// On by default. Browsers only allow audio after the visitor's first click or key press, so nothing plays before that.
let ac = null, master = null, on = true, unlocked = false;
const listeners = new Set();
const unlock = () => {
  unlocked = true;
  if (on) ensure();
  window.removeEventListener('pointerdown', unlock, true);
  window.removeEventListener('keydown', unlock, true);
};
window.addEventListener('pointerdown', unlock, true);
window.addEventListener('keydown', unlock, true);

function ensure() {
  if (!unlocked) return false;
  if (ac) { if (ac.state === 'suspended') ac.resume(); return true; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  ac = new AC();
  master = ac.createGain();
  master.gain.value = 0.55;
  const comp = ac.createDynamicsCompressor();
  master.connect(comp).connect(ac.destination);
  return true;
}
let noiseBuf = null;
function noise() {
  if (noiseBuf) return noiseBuf;
  noiseBuf = ac.createBuffer(1, ac.sampleRate * 1.5, ac.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuf;
}
const ok = () => on && ensure();
function env(g, t, a, peak, dcy) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dcy); }
function tone(freq, dur = 0.12, { type = 'sine', vol = 0.12, at = 0, attack = 0.004, slide = 0 } = {}) {
  if (!ok()) return;
  const t = ac.currentTime + at;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
  env(g, t, attack, vol, dur);
  o.connect(g).connect(master); o.start(t); o.stop(t + attack + dur + 0.05);
}
function burst(dur = 0.03, { freq = 3200, q = 1.2, vol = 0.25, at = 0, type = 'bandpass' } = {}) {
  if (!ok()) return;
  const t = ac.currentTime + at;
  const s = ac.createBufferSource(); s.buffer = noise();
  const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = ac.createGain(); env(g, t, 0.002, vol, dur);
  s.connect(f).connect(g).connect(master); s.start(t, Math.random()); s.stop(t + dur + 0.05);
}

export const sound = {
  get on() { return on; },
  set(v) { on = !!v; if (on) ensure(); listeners.forEach((f) => f(on)); },
  toggle() { this.set(!on); return on; },
  onChange(f) { listeners.add(f); },
  /** mechanical key: click + thock */
  key(v = 1) { burst(0.025, { freq: 2600 + Math.random() * 900, q: 0.9, vol: 0.22 * v }); tone(150 + Math.random() * 30, 0.05, { vol: 0.09 * v, type: 'triangle' }); },
  /** chunky switch */
  click() { burst(0.04, { freq: 1800, q: 0.7, vol: 0.3 }); tone(90, 0.07, { vol: 0.12, type: 'triangle' }); },
  /** soft UI tick */
  tick() { burst(0.012, { freq: 5200, q: 2, vol: 0.12 }); },
  /** boot chime: a warm major chord */
  chime() { [261.6, 329.6, 392, 523.3].forEach((f, i) => tone(f, 1.6, { type: 'triangle', vol: 0.07, at: i * 0.012, attack: 0.02 })); },
  beep(f = 2400, d = 0.1, type = 'square', vol = 0.05) { tone(f, d, { type, vol }); },
  /** two short beeps, like a card terminal approving */
  approve() { tone(1760, 0.07, { type: 'square', vol: 0.045 }); tone(2349, 0.11, { type: 'square', vol: 0.045, at: 0.1 }); },
  /** TV static */
  hiss(d = 0.35, vol = 0.12) { burst(d, { freq: 4000, q: 0.3, vol, type: 'highpass' }); },
  /** sonar ping */
  ping() { tone(1180, 1.1, { vol: 0.06, attack: 0.003 }); tone(1180 * 1.5, 0.6, { vol: 0.02, at: 0.01 }); },
  /** typewriter bell */
  bell() { tone(2793, 1.2, { vol: 0.07 }); tone(2793 * 2.76, 0.5, { vol: 0.02 }); },
  /** heavy thunk (carriage return, cartridge in, jack in) */
  thunk() { burst(0.06, { freq: 700, q: 0.6, vol: 0.32 }); tone(70, 0.12, { vol: 0.16, type: 'sine', slide: -20 }); },
  /** chiptune blip */
  blip(f = 880, d = 0.06) { tone(f, d, { type: 'square', vol: 0.04 }); },
  /** telephone keypad (real DTMF pairs) */
  dtmf(k) {
    const rows = { 1: 697, 2: 697, 3: 697, 4: 770, 5: 770, 6: 770, 7: 852, 8: 852, 9: 852, '*': 941, 0: 941, '#': 941 };
    const cols = { 1: 1209, 4: 1209, 7: 1209, '*': 1209, 2: 1336, 5: 1336, 8: 1336, 0: 1336, 3: 1477, 6: 1477, 9: 1477, '#': 1477 };
    if (rows[k] == null) return this.tick();
    tone(rows[k], 0.14, { vol: 0.05 }); tone(cols[k], 0.14, { vol: 0.05 });
  },
  /** the big power switch: a heavy click, then the CRT's degauss thoom and a faint high whine as the tube warms up */
  power() {
    if (!ok()) return;
    this.click();
    const t = ac.currentTime + 0.03;
    const o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(52, t); o.frequency.linearRampToValueAtTime(61, t + 0.5);
    f.type = 'lowpass'; f.frequency.value = 260;
    const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 13; lg.gain.value = 0.05; lfo.connect(lg).connect(g.gain);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    o.connect(f).connect(g).connect(master); o.start(t); o.stop(t + 1); lfo.start(t); lfo.stop(t + 1);
    burst(0.5, { freq: 140, q: 0.8, vol: 0.12, at: 0.02, type: 'lowpass' });
    tone(9800, 1.3, { vol: 0.006, at: 0.1, attack: 0.4 });
  },
  /** floppy drive seeking: a short run of head clicks */
  seek(n = 7) { for (let i = 0; i < n; i++) burst(0.012, { freq: 1500 + Math.random() * 600, q: 1.4, vol: 0.13, at: i * 0.055 + Math.random() * 0.02 }); tone(180, 0.35, { type: 'square', vol: 0.012, at: 0.02 }); },
  /** air past a moving object: a filtered noise sweep */
  whoosh(d = 0.6, vol = 0.09) {
    if (!ok()) return;
    const t = ac.currentTime;
    const s = ac.createBufferSource(); s.buffer = noise();
    const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.1;
    f.frequency.setValueAtTime(380, t); f.frequency.exponentialRampToValueAtTime(2400, t + d * 0.55); f.frequency.exponentialRampToValueAtTime(700, t + d);
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + d * 0.45); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(f).connect(g).connect(master); s.start(t, Math.random()); s.stop(t + d + 0.05);
  },
  /** the mouse's microswitch, down and up */
  mouse(down = true) { burst(0.007, { freq: down ? 4300 : 5200, q: 1.6, vol: down ? 0.07 : 0.04 }); },
  /** printer / tape motor buzz */
  motor(d = 0.5) { if (!ok()) return; const t = ac.currentTime; const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(95, t); env(g, t, 0.02, 0.025, d); const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900; o.connect(f).connect(g).connect(master); o.start(t); o.stop(t + d + 0.1); burst(d, { freq: 2200, q: 3, vol: 0.03 }); },
};
