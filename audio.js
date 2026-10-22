/* Son İmparatorluk - ses motoru: kodla üretilen efektler, çağa göre değişen Hicaz makamı müzik, savaş yoğunluğuna uyan katmanlar */
(function (root) {
  'use strict';
  let ac = null, master, comp, sfxBus, musBus, ambBus, conv, sfxSend, musSend, echoIn, noiseBuf;
  let muted = false, musicOn = true, ducked = false, curGain = 1;
  const vols = { sfx: 1, music: 1, amb: 1 };
  const R = Math.random;
  const dbg = e => { if (root.__audioDebug) console.error('AUDIO', e && e.stack || e); };

  /* ---------- altyapı ---------- */
  function G(v) { const x = ac.createGain(); x.gain.value = v; return x; }
  function impulse(sec, decay) {
    const n = Math.floor(ac.sampleRate * sec), b = ac.createBuffer(2, n, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); let lp = 0; for (let i = 0; i < n; i++) { const k = 1 - i / n; lp += ((Math.random() * 2 - 1) - lp) * (0.25 + 0.75 * k); d[i] = lp * Math.pow(k, decay); } }
    return b;
  }
  function build() {
    master = G(0.95); comp = ac.createDynamicsCompressor(); comp.threshold.value = -12; comp.knee.value = 20; comp.ratio.value = 5; comp.attack.value = 0.008; comp.release.value = 0.22;
    master.connect(comp); comp.connect(ac.destination);
    sfxBus = G(1.0); musBus = G(0.0001); ambBus = G(0.5); sfxBus.connect(master); musBus.connect(master); ambBus.connect(master);
    conv = ac.createConvolver(); conv.buffer = impulse(2.6, 2.4); const rg = G(0.8); conv.connect(rg); rg.connect(master);
    sfxSend = G(0.2); sfxSend.connect(conv); musSend = G(0.32); musSend.connect(conv);
    const d = ac.createDelay(1); d.delayTime.value = 0.34; const fb = G(0.36), lpf = ac.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 2600;
    echoIn = G(1); echoIn.connect(d); d.connect(lpf); lpf.connect(fb); fb.connect(d); lpf.connect(musBus); lpf.connect(musSend);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate); const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  }
  function A() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); build(); loadSamples(); } catch (e) { ac = null; return null; } }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function out(dest, pan, wet) {
    const g = G(dest === 'sfx' ? curGain * vols.sfx : 1); let last = g;
    if (ac.createStereoPanner && pan) { const p = ac.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); g.connect(p); last = p; }
    last.connect(dest === 'mus' ? musBus : dest === 'amb' ? ambBus : sfxBus);
    if (wet) { const w = G(wet); last.connect(w); w.connect(dest === 'mus' ? musSend : sfxSend); }
    return g;
  }
  // zarf: 0'dan peak'e a sn'de, sonra d sn'de sönüm
  function env(g, t, a, peak, d) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(Math.max(0.0002, peak), t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
  function osc(type, f, t, dur, dest, vol, o) {
    o = o || {}; const s = ac.createOscillator(), g = G(1); s.type = type; s.frequency.setValueAtTime(f, t);
    if (o.f1) s.frequency.exponentialRampToValueAtTime(Math.max(10, o.f1), t + (o.fd || dur));
    if (o.det) s.detune.value = o.det;
    env(g, t, o.a || 0.004, vol, dur - (o.a || 0.004)); s.connect(g); g.connect(dest); s.start(t); s.stop(t + dur + 0.05); return s;
  }
  function noise(t, dur, dest, vol, o) {
    o = o || {}; const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true; const f = ac.createBiquadFilter(), g = G(1);
    f.type = o.type || 'lowpass'; f.Q.value = o.q || 0.8; f.frequency.setValueAtTime(o.f0 || 1000, t); if (o.f1) f.frequency.exponentialRampToValueAtTime(Math.max(30, o.f1), t + dur);
    env(g, t, o.a || 0.003, vol, dur - (o.a || 0.003)); s.connect(f); f.connect(g); g.connect(dest); s.start(t, R() * 1.5); s.stop(t + dur + 0.05); return s;
  }

  /* ---------- efektler (v: ses düzeyi 0-1, p: -1 sol .. 1 sağ) ---------- */
  const guard = fn => (v, p) => { if (muted || !A()) return; try { fn(Math.max(0.05, v === undefined ? 1 : v), p || 0, ac.currentTime); } catch (e) { dbg(e); } };
  const sfx = {
    clang: guard((v, p, t) => { const o = out('sfx', p, 0.18), f = 720 + R() * 520; for (const [m, vol, d] of [[1, 0.1, 0.22], [2.76, 0.07, 0.14], [5.4, 0.05, 0.08], [8.9, 0.03, 0.05]]) osc('triangle', f * m, t, d, o, vol * v); noise(t, 0.05, o, 0.12 * v, { type: 'bandpass', f0: 4800, q: 2 }); }),
    twang: guard((v, p, t) => { const o = out('sfx', p, 0.1); noise(t, 0.16, o, 0.09 * v, { type: 'bandpass', f0: 1400, f1: 3600, q: 1.5 }); osc('sine', 210, t, 0.12, o, 0.07 * v, { f1: 150 }); osc('triangle', 420, t + 0.14, 0.07, o, 0.04 * v); }),
    cannon: guard((v, p, t) => { const o = out('sfx', p, 0.5); osc('sine', 95, t, 0.55, o, 0.55 * v, { f1: 38 }); noise(t, 0.7, o, 0.5 * v, { f0: 1500, f1: 60 }); noise(t, 0.08, o, 0.3 * v, { type: 'highpass', f0: 2500, f1: 1500 }); noise(t + 0.12, 0.5, o, 0.12 * v, { f0: 500, f1: 80 }); }),
    howitzer: guard((v, p, t) => { const o = out('sfx', p, 0.6); osc('sine', 70, t, 0.8, o, 0.6 * v, { f1: 30 }); noise(t, 1.0, o, 0.5 * v, { f0: 1100, f1: 50 }); noise(t, 0.06, o, 0.3 * v, { type: 'highpass', f0: 3000, f1: 1200 }); }),
    crash: guard((v, p, t) => { const o = out('sfx', p, 0.5); noise(t, 1.4, o, 0.4 * v, { f0: 900, f1: 45 }); osc('sawtooth', 65, t, 0.9, o, 0.12 * v, { f1: 35 }); for (let i = 0; i < 6; i++) noise(t + 0.15 + i * 0.13 + R() * 0.08, 0.07, o, 0.1 * v, { type: 'bandpass', f0: 1200 + R() * 2600, q: 3 }); }),
    boom: guard((v, p, t) => { const o = out('sfx', p, 0.65); osc('sine', 62, t, 1.4, o, 0.7 * v, { f1: 28 }); noise(t, 1.8, o, 0.55 * v, { f0: 1300, f1: 40 }); noise(t, 0.1, o, 0.35 * v, { type: 'highpass', f0: 3000, f1: 800 }); osc('sawtooth', 48, t + 0.05, 1.0, o, 0.12 * v, { f1: 24 }); }),
    thud: guard((v, p, t) => { const o = out('sfx', p, 0.06); osc('sine', 130, t, 0.14, o, 0.3 * v, { f1: 55 }); noise(t, 0.1, o, 0.12 * v, { f0: 800, f1: 150 }); }),
    missile: guard((v, p, t) => { const o = out('sfx', p, 0.3); noise(t, 0.9, o, 0.16 * v, { type: 'bandpass', f0: 500, f1: 4200, q: 1.6 }); osc('sawtooth', 160, t, 0.7, o, 0.05 * v, { f1: 600 }); noise(t + 0.55, 0.1, o, 0.1 * v, { type: 'highpass', f0: 3000 }); }),
    mg: guard((v, p, t) => { const o = out('sfx', p, 0.12); for (let i = 0; i < 3; i++) { noise(t + i * 0.045, 0.05, o, 0.12 * v, { type: 'bandpass', f0: 3200, f1: 1300, q: 1.5 }); osc('square', 180, t + i * 0.045, 0.03, o, 0.03 * v); } }),
    rifle: guard((v, p, t) => { const o = out('sfx', p, 0.35); noise(t, 0.05, o, 0.35 * v, { type: 'highpass', f0: 2200, f1: 1200 }); noise(t, 0.28, o, 0.22 * v, { f0: 2400, f1: 200 }); osc('sine', 210, t, 0.16, o, 0.18 * v, { f1: 70 }); }),
    sniper: guard((v, p, t) => { const o = out('sfx', p, 0.7); noise(t, 0.04, o, 0.4 * v, { type: 'highpass', f0: 3500 }); noise(t, 0.4, o, 0.25 * v, { f0: 2800, f1: 150 }); osc('sine', 150, t, 0.25, o, 0.3 * v, { f1: 50 }); }),
    rpg: guard((v, p, t) => { const o = out('sfx', p, 0.35); noise(t, 0.6, o, 0.2 * v, { type: 'bandpass', f0: 700, f1: 3200, q: 1.2 }); osc('sawtooth', 120, t, 0.5, o, 0.06 * v, { f1: 500 }); osc('sine', 90, t, 0.2, o, 0.2 * v, { f1: 50 }); }),
    laser: guard((v, p, t) => { const o = out('sfx', p, 0.3); osc('sawtooth', 2400, t, 0.28, o, 0.06 * v, { f1: 300 }); osc('sine', 1800, t, 0.3, o, 0.07 * v, { f1: 500 }); osc('square', 4800, t, 0.12, o, 0.015 * v, { f1: 1200 }); noise(t, 0.2, o, 0.05 * v, { type: 'highpass', f0: 5000 }); }),
    hammer: guard((v, p, t) => { const o = out('sfx', p, 0.08); noise(t, 0.05, o, 0.12 * v, { type: 'bandpass', f0: 1500, q: 2.5 }); osc('sine', 320, t, 0.07, o, 0.1 * v, { f1: 140 }); if (R() < 0.5) osc('triangle', 1900, t, 0.1, o, 0.025 * v); }),
    heal: guard((v, p, t) => { const o = out('sfx', p, 0.3); osc('sine', 880, t, 0.25, o, 0.04 * v); osc('sine', 1320, t + 0.07, 0.3, o, 0.035 * v); }),
    thunder: guard((v, p, t) => { const o = out('sfx', p, 0.9); noise(t, 3.0, o, 0.5 * v, { f0: 800, f1: 45 }); osc('sine', 52, t + 0.1, 2.4, o, 0.35 * v, { f1: 26 }); noise(t, 0.12, o, 0.22 * v, { type: 'highpass', f0: 3200, f1: 900 }); for (let i = 0; i < 3; i++) noise(t + 0.7 + i * 0.55, 1.3, o, 0.22 * v, { f0: 500, f1: 60 }); }),
    spark: guard((v, p, t) => { const o = out('sfx', p, 0.2); noise(t, 0.12, o, 0.08 * v, { type: 'highpass', f0: 4000 }); osc('square', 1500, t, 0.05, o, 0.02 * v, { f1: 800 }); })
  };

  function U(fn) { return () => { if (muted || !A()) return; try { fn(ac.currentTime); } catch (e) { dbg(e); } }; }
  const snd = {
    click: U(t => { const o = out('sfx', 0, 0.04); osc('triangle', 760, t, 0.05, o, 0.05, { f1: 620 }); }),
    cmd: U(t => { const o = out('sfx', 0, 0.05); osc('square', 330, t, 0.05, o, 0.03); osc('square', 495, t + 0.05, 0.07, o, 0.03); }),
    err: U(t => { const o = out('sfx', 0, 0.02); osc('square', 150, t, 0.13, o, 0.06, { f1: 110 }); }),
    trained: U(t => { const o = out('sfx', 0, 0.25); osc('sine', 880, t, 0.35, o, 0.06); osc('sine', 1320, t + 0.02, 0.3, o, 0.03); osc('triangle', 1760, t, 0.15, o, 0.015); }),
    built: U(t => { const o = out('sfx', 0, 0.3); [523, 659, 784].forEach((f, i) => { osc('triangle', f, t + i * 0.09, 0.5, o, 0.06); osc('sine', f * 2, t + i * 0.09, 0.3, o, 0.02); }); }),
    alert: U(t => { const o = out('sfx', 0, 0.45); for (const [f, dt] of [[110, 0], [165, 0.38]]) for (const dd of [-6, 6]) { const s = osc('sawtooth', f, t + dt, 0.8, o, 0.05, { a: 0.18, det: dd * 4 }); } noise(t, 0.2, o, 0.03, { f0: 400, f1: 200 }); }),
    power: U(t => { const o = out('sfx', 0, 0.6); osc('sawtooth', 70, t, 1.2, o, 0.1, { f1: 40, a: 0.3 }); noise(t, 1.0, o, 0.12, { type: 'bandpass', f0: 300, f1: 2600, q: 1 }); osc('sine', 45, t + 0.6, 0.8, o, 0.3, { f1: 28 }); }),
    age: U(t => { const o = out('sfx', 0, 0.7); osc('sine', 80, t, 1.2, o, 0.4, { f1: 40 }); noise(t, 0.4, o, 0.15, { type: 'bandpass', f0: 800, f1: 300 }); [[196, 0], [293.7, 0.3], [392, 0.6], [493.9, 0.9], [587.3, 1.2]].forEach(([f, dt]) => { for (const dd of [-5, 5]) osc('sawtooth', f, t + dt, 1.6, o, 0.035, { a: 0.1, det: dd }); osc('sine', f * 2, t + dt, 1.2, o, 0.02); }); osc('sine', 1568, t + 1.2, 1.6, o, 0.02); }),
    win: U(t => { const o = out('sfx', 0, 0.6); osc('sine', 70, t, 1.0, o, 0.4, { f1: 40 }); [[392, 0], [523.3, 0.22], [659.3, 0.44], [784, 0.66], [1046.5, 0.95]].forEach(([f, dt]) => { for (const dd of [-5, 5]) osc('sawtooth', f, t + dt, 1.4, o, 0.04, { a: 0.05, det: dd }); osc('triangle', f * 2, t + dt, 1.0, o, 0.02); }); }),
    lose: U(t => { const o = out('sfx', 0, 0.7); [[392, 0], [349.2, 0.35], [311.1, 0.7], [233.1, 1.1]].forEach(([f, dt]) => { for (const dd of [-6, 6]) osc('sawtooth', f, t + dt, 1.5, o, 0.035, { a: 0.12, det: dd }); }); osc('sine', 55, t + 1.0, 1.6, o, 0.3, { f1: 30 }); }),
    tech: U(t => { const o = out('sfx', 0, 0.4); [659, 880, 1175].forEach((f, i) => osc('triangle', f, t + i * 0.07, 0.4, o, 0.05)); }),
    cry: U(t => { const o = out('sfx', 0, 0.6); for (const [f, dt] of [[130.8, 0], [196, 0.02], [261.6, 0.04]]) for (const dd of [-6, 6]) osc('sawtooth', f, t + dt, 0.9, o, 0.04, { a: 0.12, det: dd * 3 }); noise(t, 0.5, o, 0.12, { type: 'bandpass', f0: 700, f1: 1400, q: 1.2, a: 0.08 }); osc('sine', 70, t, 0.6, o, 0.25, { f1: 45 }); }),
    spy: U(t => { const o = out('sfx', 0, 0.3); osc('sine', 1100, t, 0.1, o, 0.04, { f1: 700 }); osc('sine', 1320, t + 0.09, 0.15, o, 0.03, { f1: 800 }); })
  };

  // her efektin duyulur düzeye çekilmesi (çevrimdışı ölçümle ayarlandı)
  const GAINS = { thunder: 1.6, cry: 2.2, click: 7, cmd: 7, err: 6, trained: 4, built: 3, tech: 4, spy: 6, hammer: 6, mg: 5, twang: 5, clang: 4.5, heal: 5, spark: 0.8, thud: 3, laser: 3.5, rpg: 3, missile: 1.0, rifle: 2.4, sniper: 1.8, crash: 2.2, cannon: 1.4, howitzer: 1.3, boom: 1.2, alert: 2.8, power: 1.3, age: 1.3, win: 1.3, lose: 1.2 };
  for (const k in sfx) { const f = sfx[k], gk = GAINS[k] || 1; sfx[k] = (v, p) => { curGain = gk; f(v, p); }; }
  for (const k in snd) { const f = snd[k], gk = GAINS[k] || 1; snd[k] = () => { curGain = gk; f(); }; }


  /* ---------- gerçek ses örnekleri (CC0: Kenney, StarNinjas, Thimras; CC-BY: Vincent Sevedge) ---------- */
  const SINGLE = { cannon: 1, gun_cz: 1, gun_sks: 1, gun_mosin: 1, gun_shotty: 1 };
  const bufs = {}, norm = {}; let sampLoad = 0, sampReady = false;
  function groupFiles(g) { if (SINGLE[g]) return [g]; const n = g === 'clash' || g === 'swish' ? 10 : 5, o = []; for (let i = 0; i < n; i++) o.push(g + (n === 10 ? i + 1 : i)); return o; }
  function sfile(n) { return 'audio/sfx/' + n + (n.indexOf('gun_') === 0 ? '.wav' : '.ogg'); }
  function loadSamples() {
    if (sampLoad || !ac || typeof fetch !== 'function') return; sampLoad = 1;
    fetch('audio/manifest.json').then(r => { if (!r.ok) throw new Error('manifest'); return r.json(); }).then(man => {
      const names = []; for (const g of ['clash', 'swish', 'woodL', 'woodH', 'plank', 'metalL', 'metalM', 'metalH', 'bell', 'punchM', 'punchH', 'softH', 'softM', 'tin', 'plateM', 'mine', 'cannon', 'gun_cz', 'gun_sks', 'gun_mosin', 'gun_shotty']) names.push(...groupFiles(g));
      return Promise.all(names.map(n => { const f = sfile(n), m = man[f.replace('audio/sfx/', '')]; return fetch(f).then(r => r.arrayBuffer()).then(ab => new Promise((res, rej) => ac.decodeAudioData(ab, res, rej))).then(b => { bufs[n] = b; norm[n] = m && m.peak > 0.02 ? Math.min(3, 0.8 / m.peak) : 1; }).catch(() => { /* eksik dosya: işlevsel yedek kalır */ }); }));
    }).then(() => { sampReady = Object.keys(bufs).length > 20; }).catch(() => { sampReady = false; });
  }
  // [grup, ses, hızMin, hızMax, yankı, gecikme]
  const SM_SFX = {
    clang: [['clash', 0.9, 0.92, 1.12, 0.15, 0]], twang: [['swish', 0.35, 1.3, 1.6, 0.05, 0]],
    cannon: [['cannon', 1.0, 0.95, 1.05, 0.35, 0]], howitzer: [['cannon', 1.2, 0.7, 0.8, 0.5, 0]],
    crash: [['woodH', 1.0, 0.6, 0.8, 0.4, 0], ['plank', 0.8, 0.7, 0.9, 0.3, 0.08], ['woodH', 0.7, 0.5, 0.7, 0.4, 0.2]],
    boom: [['cannon', 1.3, 0.5, 0.6, 0.6, 0], ['woodH', 0.9, 0.5, 0.6, 0.5, 0.05]], thud: [['punchM', 0.7, 0.8, 1.0, 0.06, 0]],
    missile: [['gun_shotty', 0.6, 0.5, 0.6, 0.4, 0], ['swish', 0.5, 0.5, 0.7, 0.3, 0.05]],
    mg: [['gun_cz', 0.5, 1.5, 1.7, 0.08, 0], ['gun_cz', 0.5, 1.5, 1.7, 0.08, 0.06], ['gun_cz', 0.5, 1.5, 1.7, 0.08, 0.12]],
    rifle: [['gun_sks', 0.8, 0.95, 1.05, 0.3, 0]], sniper: [['gun_mosin', 1.0, 0.85, 0.95, 0.5, 0]],
    rpg: [['gun_shotty', 0.9, 0.55, 0.65, 0.4, 0], ['swish', 0.5, 0.5, 0.7, 0.3, 0.05]],
    hammer: [['woodL', 0.7, 0.9, 1.2, 0.05, 0], ['metalL', 0.4, 0.9, 1.2, 0.04, 0.03]], heal: [['bell', 0.25, 1.8, 2.1, 0.3, 0]]
  };
  const SM_SND = {
    click: [['tin', 0.35, 1.0, 1.2, 0.03, 0]], cmd: [['woodL', 0.5, 1.0, 1.15, 0.03, 0]], err: [['plank', 0.6, 0.6, 0.7, 0.02, 0]],
    trained: [['bell', 0.5, 1.7, 1.9, 0.25, 0]], built: [['woodH', 0.8, 0.9, 1.0, 0.2, 0], ['bell', 0.35, 1.5, 1.5, 0.3, 0.12]],
    alert: [['bell', 0.9, 0.7, 0.7, 0.5, 0], ['bell', 0.9, 0.7, 0.7, 0.5, 0.45], ['bell', 0.9, 0.7, 0.7, 0.5, 0.9]],
    power: [['cannon', 1.1, 0.55, 0.6, 0.6, 0], ['bell', 0.6, 0.5, 0.5, 0.6, 0.2]],
    age: [['bell', 0.9, 0.55, 0.55, 0.7, 0], ['bell', 0.8, 0.8, 0.8, 0.7, 0.3], ['bell', 0.8, 1.05, 1.05, 0.7, 0.6], ['bell', 0.9, 1.3, 1.3, 0.7, 0.9]],
    win: [['cannon', 1.0, 0.9, 0.9, 0.5, 0], ['bell', 0.9, 0.7, 0.7, 0.7, 0.2], ['bell', 0.9, 0.95, 0.95, 0.7, 0.5], ['bell', 0.9, 1.25, 1.25, 0.7, 0.8], ['bell', 1.0, 1.5, 1.5, 0.7, 1.1]],
    lose: [['metalH', 1.0, 0.5, 0.5, 0.5, 0], ['bell', 0.8, 0.45, 0.45, 0.7, 0.3], ['bell', 0.7, 0.38, 0.38, 0.7, 0.9]],
    tech: [['bell', 0.5, 1.6, 1.6, 0.3, 0], ['bell', 0.5, 2.0, 2.0, 0.3, 0.1]],
    cry: [['clash', 0.9, 0.8, 0.9, 0.3, 0], ['clash', 0.8, 0.9, 1.0, 0.3, 0.07], ['clash', 0.8, 0.8, 1.0, 0.3, 0.14], ['punchH', 0.8, 0.6, 0.7, 0.3, 0]],
    spy: [['softM', 0.5, 1.5, 1.7, 0.1, 0]]
  };
  function playLayers(layers, v, p) {
    if (!sampReady || muted || !A()) return false; curGain = 1; let ok = false;
    for (const [g, vol, r0, r1, wet, dl] of layers) {
      const files = groupFiles(g).filter(n => bufs[n]); if (!files.length) continue;
      const n = files[Math.floor(R() * files.length)], s = ac.createBufferSource(); s.buffer = bufs[n]; s.playbackRate.value = r0 + R() * (r1 - r0);
      const o = out('sfx', p || 0, wet); o.gain.value *= vol * (norm[n] || 1) * Math.max(0.15, v === undefined ? 1 : v); s.connect(o); s.start(ac.currentTime + dl); ok = true;
    }
    return ok;
  }
  for (const k in SM_SFX) { const proc = sfx[k]; sfx[k] = (v, p) => { if (!playLayers(SM_SFX[k], v, p)) proc(v, p); }; }
  for (const k in SM_SND) { const proc = snd[k]; snd[k] = () => { if (!playLayers(SM_SND[k], 1, 0)) proc(); }; }

  /* ---------- müzik: gerçek parçalar (CC0); yüklenemezse eski kodla üretilen müziğe düşer ---------- */
  const MUS = { menu: ['audio/music/battle.mp3'], game: ['audio/music/war2.ogg', 'audio/music/battle.mp3'] };
  let mEl = null, mKind = '', mIdx = 0, mFail = false, mPend = false, mTimer = 0, mStopAfter = false, fbKind = null;
  const mTarget = () => muted || !musicOn ? 0 : (ducked ? 0.07 : 0.45) * vols.music;
  function mFade() {
    clearInterval(mTimer); mTimer = setInterval(() => {
      if (!mEl) { clearInterval(mTimer); return; }
      const tg = mTarget(), d = tg - mEl.volume;
      if (Math.abs(d) < 0.03) { mEl.volume = Math.max(0, Math.min(1, tg)); clearInterval(mTimer); if (mStopAfter && tg === 0) { mEl.pause(); mEl = null; mKind = ''; mStopAfter = false; } return; }
      mEl.volume = Math.max(0, Math.min(1, mEl.volume + Math.sign(d) * 0.035));
    }, 50);
  }
  function mStart() {
    const list = MUS[mKind]; if (!list) return; const el = new Audio(list[mIdx % list.length]); el.preload = 'auto'; el.loop = list.length === 1; el.volume = 0;
    el.addEventListener('ended', () => { if (mEl !== el) return; mIdx++; mStart(); });
    el.addEventListener('error', () => { if (mEl === el) { mFail = true; mEl = null; mKind = ''; if (fbKind && musicOn) { A(); setTheme(fbKind); } } });
    mEl = el; mStopAfter = false; const p = el.play(); if (p && p.catch) p.catch(() => { mPend = true; }); mFade();
  }
  function mPlay(kind) {
    if (mFail || typeof Audio === 'undefined') return false;
    if (mEl && mKind === kind && !mStopAfter) { mFade(); return true; }
    if (mEl) { const old = mEl; mEl = null; const f = setInterval(() => { old.volume = Math.max(0, old.volume - 0.06); if (old.volume <= 0.01) { clearInterval(f); old.pause(); } }, 50); }
    mKind = kind; mIdx = kind === 'game' ? Math.floor(R() * MUS.game.length) : 0; mStart(); return true;
  }
  function mStop() { if (!mEl) return; mStopAfter = true; mFade(); }

  /* ---------- müzik: Hicaz (D) — yedek ---------- */
  const SC = [0, 1, 4, 5, 7, 8, 10];
  const deg2f = (d, rootF) => rootF * Math.pow(2, (SC[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7)) / 12);
  // [derece, 16'lık adım sayısı]
  const MOTIFS = [
    [[0, 6], [1, 2], [2, 6], [1, 2], [0, 8]], [[4, 4], [3, 4], [2, 4], [1, 4], [0, 8]], [[2, 4], [3, 4], [4, 6], [5, 2], [4, 4], [3, 4], [2, 4]],
    [[0, 4], [2, 4], [1, 4], [0, 4], [-1, 4], [0, 8]], [[4, 4], [5, 4], [6, 4], [5, 4], [4, 4], [2, 4], [1, 2], [0, 6]], [[7, 4], [6, 4], [5, 4], [4, 4], [3, 4], [2, 4], [1, 4], [0, 8]]
  ];
  const THEMES = {
    menu: { bpm: 66, drum: 'soft', lead: 'ney', pad: 'tambura', vol: 1.1 },
    kale: { bpm: 76, drum: 'davul', lead: 'ney', pad: 'tambura', pluck: true, vol: 1 },
    barut: { bpm: 94, drum: 'march', lead: 'zurna', pad: 'tambura', pluck: true, vol: 1 },
    sanayi: { bpm: 104, drum: 'industrial', lead: 'strings', pad: 'pad', vol: 1 },
    modern: { bpm: 112, drum: 'electro', lead: 'synth', pad: 'pad', arp: true, vol: 1 }
  };
  let theme = null, themeName = '', step = 0, nextT = 0, timer = 0, mel = [], intensityT = 0, intensity = 0, switching = false, lastBarChord = 0;
  const ROOT_LEAD = 293.66, ROOT_LOW = 73.42;

  // çalgılar
  function ney(f, t, dur, vel) {
    const o = out('mus', 0, 0.5), g = G(1); const s1 = ac.createOscillator(), s2 = ac.createOscillator(), lfo = ac.createOscillator(), lg = G(f * 0.006);
    s1.type = 'sine'; s2.type = 'triangle'; s1.frequency.value = f; s2.frequency.value = f; lfo.frequency.value = 4.8 + R(); lfo.connect(lg); lg.connect(s1.frequency); lg.connect(s2.frequency);
    const g2 = G(0.25); s1.connect(g); s2.connect(g2); g2.connect(g); env(g, t, 0.09, 0.15 * vel, dur); g.connect(o);
    noise(t, dur * 0.9, o, 0.02 * vel, { type: 'bandpass', f0: f * 2, q: 6, a: 0.06 }); s1.start(t); s2.start(t); lfo.start(t); s1.stop(t + dur + 0.2); s2.stop(t + dur + 0.2); lfo.stop(t + dur + 0.2);
  }
  function pluck(f, t, vel) { // telli çalgı (saz/ud benzeri): kısa atak + hızlı sönen üçlü osilatör, geri besleme yok
    while (f > 700) f /= 2;
    const o = out('mus', 0, 0.3), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(Math.min(6000, f * 12), t); lp.frequency.exponentialRampToValueAtTime(f * 2.4, t + 0.55); lp.connect(o);
    osc('triangle', f, t, 1.0, lp, 0.3 * vel, { a: 0.002 }); osc('sawtooth', f * 2.003, t, 0.45, lp, 0.07 * vel, { a: 0.002 }); osc('sine', f * 3.01, t, 0.22, lp, 0.05 * vel, { a: 0.002 });
  }
  function zurna(f, t, dur, vel) {
    const o = out('mus', 0, 0.3), g = G(1), b1 = ac.createBiquadFilter(), b2 = ac.createBiquadFilter(), sum = G(1);
    b1.type = 'bandpass'; b1.frequency.value = 850; b1.Q.value = 3; b2.type = 'bandpass'; b2.frequency.value = 1900; b2.Q.value = 4;
    for (const dt of [-9, 9]) { const s = ac.createOscillator(); s.type = 'sawtooth'; s.frequency.setValueAtTime(f * 0.985, t); s.frequency.linearRampToValueAtTime(f, t + 0.06); s.detune.value = dt; s.connect(b1); s.connect(b2); s.start(t); s.stop(t + dur + 0.2); }
    b1.connect(sum); b2.connect(sum); env(g, t, 0.03, 0.13 * vel, dur); sum.connect(g); g.connect(o);
  }
  function tambura(f, t, dur, vel) {
    const o = out('mus', 0, 0.4), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; lp.connect(o);
    for (const [m, ty, vol] of [[1, 'sawtooth', 0.02], [1.5, 'sawtooth', 0.01], [2, 'triangle', 0.012]]) osc(ty, f * m, t, dur, lp, vol * vel, { a: 0.5, det: R() * 6 - 3 });
  }
  function padSynth(f, t, dur, vel) {
    const o = out('mus', 0, 0.5), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(1500, t + dur * 0.5); lp.frequency.linearRampToValueAtTime(600, t + dur); lp.connect(o);
    for (const dt of [-12, 0, 12]) osc('sawtooth', f, t, dur, lp, 0.014 * vel, { a: 0.9, det: dt }); osc('sine', f / 2, t, dur, lp, 0.012 * vel, { a: 0.6 });
  }
  function strings(f, t, dur, vel) {
    const o = out('mus', 0, 0.45), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800; lp.connect(o);
    for (const dt of [-8, 0, 8]) osc('sawtooth', f, t, dur, lp, 0.05 * vel, { a: 0.18, det: dt });
  }
  function synthLead(f, t, dur, vel) {
    const o = out('mus', 0, 0.25), g = G(1), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(3200, t); lp.frequency.exponentialRampToValueAtTime(700, t + dur); lp.connect(g); g.connect(o); const e = G(0.45); g.connect(e); e.connect(echoIn);
    osc('square', f, t, dur, lp, 0.07 * vel); osc('sawtooth', f * 1.003, t, dur, lp, 0.06 * vel);
  }
  function bass(f, t, dur, vel) { const o = out('mus', 0, 0.05), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400; lp.connect(o); osc('sine', f, t, dur, lp, 0.07 * vel, { a: 0.01 }); osc('sawtooth', f, t, dur, lp, 0.02 * vel, { a: 0.01 }); }
  function davul(t, vel, tek) { const o = out('mus', 0, 0.28); if (tek) { noise(t, 0.09, o, 0.1 * vel, { type: 'bandpass', f0: 2300, q: 1.4 }); osc('sine', 400, t, 0.06, o, 0.05 * vel, { f1: 250 }); } else { osc('sine', 138, t, 0.22, o, 0.16 * vel, { f1: 52 }); noise(t, 0.05, o, 0.06 * vel, { f0: 900, f1: 200 }); } }
  function kos(t, vel) { const o = out('mus', 0, 0.5); osc('sine', 88, t, 0.5, o, 0.15 * vel, { f1: 40 }); noise(t, 0.12, o, 0.1 * vel, { f0: 700, f1: 120 }); }
  function tom(t, f, vel) { const o = out('mus', 0, 0.3); osc('sine', f, t, 0.2, o, 0.09 * vel, { f1: f * 0.55 }); noise(t, 0.04, o, 0.04 * vel, { f0: 1500, f1: 300 }); }
  function zil(t, vel) { const o = out('mus', 0, 0.4); noise(t, 0.5, o, 0.05 * vel, { type: 'highpass', f0: 6500, a: 0.002 }); noise(t, 0.2, o, 0.03 * vel, { type: 'bandpass', f0: 9500, q: 1 }); }
  function hat(t, vel) { const o = out('mus', 0, 0.05); noise(t, 0.04, o, 0.03 * vel, { type: 'highpass', f0: 8500 }); }
  function clank(t, vel) { const o = out('mus', 0, 0.3); for (const m of [1, 1.51, 2.2]) osc('square', 520 * m, t, 0.12, o, 0.014 * vel); noise(t, 0.05, o, 0.04 * vel, { type: 'bandpass', f0: 3000, q: 3 }); }
  function snare(t, vel) { const o = out('mus', 0, 0.35); noise(t, 0.18, o, 0.09 * vel, { type: 'bandpass', f0: 2000, q: 0.8 }); osc('triangle', 210, t, 0.1, o, 0.07 * vel, { f1: 130 }); }
  function horn(f, t, dur, vel) { const o = out('mus', 0, 0.5), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(300, t); lp.frequency.linearRampToValueAtTime(900, t + dur * 0.4); lp.connect(o); for (const dt of [-7, 7]) osc('sawtooth', f, t, dur, lp, 0.05 * vel, { a: 0.25, det: dt }); }

  function leadNote(f, t, dur, vel) {
    const L = theme.lead; const vv = vel * (1 - 0.45 * intensity);
    if (L === 'ney') ney(f, t, dur, vv); else if (L === 'zurna') zurna(f, t, dur, vv); else if (L === 'strings') strings(f, t, dur, vv * 1.4); else synthLead(f, t, dur, vv);
    if (theme.pluck && R() < 0.8) pluck(f * 0.5, t, vv * 0.8);
  }

  function makePhrase(barStartStep) {
    const picks = [MOTIFS[Math.floor(R() * MOTIFS.length)], MOTIFS[Math.floor(R() * MOTIFS.length)]], shift = [0, 0, 2, -1][Math.floor(R() * 4)];
    let at = barStartStep + (R() < 0.5 ? 0 : 2);
    picks.forEach((m, k) => { let s = barStartStep + k * 32 + (k === 0 ? at - barStartStep : 0); m.forEach(([d, len], i) => { const last = k === 1 && i === m.length - 1; mel.push({ s, d: (last ? 0 : d + (k === 1 ? shift : 0)), len: last ? Math.max(len, 12) : len, v: 0.8 + R() * 0.3 }); s += len; }); });
  }

  const CHORDS = [0, 0, 3, 4];
  function scheduleStep(n, t) {
    const th = theme, spb = 60 / th.bpm / 4, sb = n % 16, bar = Math.floor(n / 16), vol = th.vol;
    intensity += (intensityT - intensity) * 0.08;
    const I = intensity;
    if (sb === 0) {
      const cd = CHORDS[bar % 4], dur = spb * 16 * 1.02; lastBarChord = cd;
      if (th.pad === 'tambura') { tambura(deg2f(cd, ROOT_LOW), t, dur, vol); tambura(deg2f(cd + 4, ROOT_LOW) , t, dur, vol * 0.6); }
      else { padSynth(deg2f(cd, ROOT_LOW * 2), t, dur * 2, vol); if (bar % 2 === 0) bass(deg2f(cd, ROOT_LOW), t, dur * 2, vol); }
      if (bar % 4 === 0) makePhrase(n);
      if (I > 0.45 && (th.drum === 'davul' || th.drum === 'march') && bar % 2 === 0) horn(deg2f(cd, ROOT_LOW * 2), t, dur * 1.8, vol * I);
    }
    // melodi
    for (let i = mel.length - 1; i >= 0; i--) { const m = mel[i]; if (m.s === n) { const f = deg2f(m.d, ROOT_LEAD), dur = Math.max(spb * m.len * 0.95, 0.25); leadNote(f, t, dur, m.v * vol); if (theme.pluck && R() < 0.3 && m.len >= 4) pluck(deg2f(m.d + 1, ROOT_LEAD), t - spb * 0.5 > ac.currentTime ? t - spb * 0.5 : t, 0.4 * vol); mel.splice(i, 1); } else if (m.s < n) mel.splice(i, 1); }
    // ritim
    const dv = th.drum, ev = (arr) => arr.indexOf(sb) >= 0;
    if (dv === 'soft') { if (ev([0])) davul(t, 0.5 * vol); if (sb === 8 && bar % 2 === 1) davul(t, 0.3 * vol, true); }
    else if (dv === 'davul') { if (ev([0, 6, 10])) davul(t, 0.7 * vol); if (ev([4, 12])) davul(t, 0.8 * vol, true); if (I > 0.3) { if (ev([0, 8])) kos(t, I * vol); if (ev([2, 7, 14])) tom(t, 150, I * 0.8 * vol); } }
    else if (dv === 'march') { if (ev([0, 8])) davul(t, 0.9 * vol); if (ev([4, 12, 14])) davul(t, 0.8 * vol, true); if (sb === 0 && bar % 2 === 0) zil(t, vol); if (I > 0.3) { if (ev([0, 8])) kos(t, I * vol); if (ev([2, 6, 10, 15])) tom(t, 130 + (sb % 3) * 20, I * 0.8 * vol); } }
    else if (dv === 'industrial') { if (ev([0, 4, 8, 12])) davul(t, 0.9 * vol); if (ev([6, 14])) clank(t, vol); if (sb % 2 === 0) hat(t, vol * 0.8); if (ev([4, 12])) snare(t, 0.7 * vol); if (I > 0.3 && ev([0, 8])) kos(t, I * vol); }
    else if (dv === 'electro') { if (ev([0, 4, 8, 12])) davul(t, 0.8 * vol); if (sb % 2 === 0) hat(t, vol); if (ev([4, 12])) snare(t, 0.8 * vol); if (I > 0.3 && ev([0, 8])) kos(t, I * 0.9 * vol);
      if (th.arp && sb % 2 === 1) { const cd = lastBarChord, seq = [0, 2, 4, 6, 4, 2, 5, 3][(sb >> 1) % 8]; synthLead(deg2f(cd + seq, ROOT_LEAD * 2), t, spb * 1.6, 0.35 * vol * (1 - I * 0.3)); } }
    if (dv === 'industrial' && th.arp !== true && sb % 4 === 2 && I > 0.15) clank(t, vol * 0.6);
  }

  function pump() {
    if (!ac || !theme || switching) return;
    const spb = 60 / theme.bpm / 4, ahead = 0.3;
    if (nextT < ac.currentTime - 0.1) nextT = ac.currentTime + 0.05;
    while (nextT < ac.currentTime + ahead) { try { scheduleStep(step, nextT); } catch (e) { dbg(e); } nextT += spb; step++; }
  }
  function fadeTo(v, sec) { if (!ac) return; const t = ac.currentTime; musBus.gain.cancelScheduledValues(t); musBus.gain.setValueAtTime(Math.max(0.0001, musBus.gain.value), t); musBus.gain.linearRampToValueAtTime(Math.max(0.0001, v), t + sec); }
  function level() { return muted || !musicOn ? 0.0001 : (ducked ? 0.18 : 0.9) * vols.music; }
  function setTheme(name) {
    if (!A()) return; if (name === themeName && timer) { fadeTo(level(), 1); return; }
    const begin = () => { themeName = name; theme = THEMES[name]; step = 0; mel = []; nextT = ac.currentTime + 0.1; switching = false; if (!timer) timer = setInterval(pump, 60); fadeTo(level(), 1.6); };
    if (timer && themeName) { switching = true; fadeTo(0.0001, 0.9); setTimeout(begin, 950); } else begin();
  }
  function stopMusic() { if (!ac) return; if (timer) { fadeTo(0.0001, 0.6); const tm = timer; timer = 0; setTimeout(() => { clearInterval(tm); if (!timer) { themeName = ''; theme = null; } }, 700); } }

  /* ---------- ortam sesi: rüzgâr + kuş ---------- */
  let ambOn = false, ambNodes = null, birdTimer = 0;
  function startAmbience() {
    if (!A() || ambOn) return; ambOn = true;
    const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true; const bp = ac.createBiquadFilter(), g = G(0.0001), lfo = ac.createOscillator(), lg = G(260);
    bp.type = 'bandpass'; bp.frequency.value = 520; bp.Q.value = 0.7; lfo.frequency.value = 0.07; lfo.connect(lg); lg.connect(bp.frequency); s.connect(bp); bp.connect(g); g.connect(ambBus); g.gain.linearRampToValueAtTime(0.05, ac.currentTime + 3); s.start(); lfo.start(); ambNodes = { s, g, lfo };
    const bird = () => { if (!ambOn) return; if (!muted && !ducked && intensity < 0.4 && ac) { const t = ac.currentTime, o = out('amb', (R() - 0.5) * 1.4, 0.15), f = 2600 + R() * 1400, n = 2 + Math.floor(R() * 3); for (let i = 0; i < n; i++) osc('sine', f, t + i * 0.11, 0.09, o, 0.03, { f1: f * (1.15 + R() * 0.3) }); } birdTimer = setTimeout(bird, 4000 + R() * 9000); };
    /* kuş cıvıltısı (sentetik) kapatıldı */
  }
  // hava: yağmur/fırtına gürültü yatağı
  let wx = null;
  function setWeather(kind, s) {
    if (!A()) return;
    if (!wx) { const src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true; const hp = ac.createBiquadFilter(), lp = ac.createBiquadFilter(), g = G(0.0001); hp.type = 'highpass'; hp.frequency.value = 1200; lp.type = 'lowpass'; lp.frequency.value = 7500; src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(ambBus); src.start(); wx = { g, src }; }
    const tgt = kind === 'rain' ? 0.16 * s : kind === 'storm' ? 0.28 * s : kind === 'fog' ? 0.01 * s : 0;
    wx.g.gain.setTargetAtTime(Math.max(0.0001, tgt), ac.currentTime, 0.8);
  }
  function stopAmbience() { ambOn = false; clearTimeout(birdTimer); if (ambNodes && ac) { const n = ambNodes; ambNodes = null; n.g.gain.linearRampToValueAtTime(0.0001, ac.currentTime + 0.6); setTimeout(() => { try { n.s.stop(); n.lfo.stop(); } catch (e) { /* zaten durmuş */ } }, 700); } }

  /* ---------- test: çevrimdışı render (ölçüm için) ---------- */
  async function renderOffline(kind, name, sec, inten) {
    const sr = 44100; ac = new OfflineAudioContext(2, Math.ceil(sr * sec), sr); build(); muted = false; ducked = false; musicOn = true;
    if (kind === 'sfx') { sfx[name](1, 0); }
    else if (kind === 'snd') { snd[name](); }
    else { theme = THEMES[name]; step = 0; mel = []; intensityT = intensity = inten || 0; musBus.gain.value = 0.9; let t = 0; const spb = 60 / theme.bpm / 4; while (t < sec) { scheduleStep(step, t); t += spb; step++; } }
    return ac.startRendering();
  }
  /* ---------- dış API ---------- */
  const AGE_THEME = ['kale', 'barut', 'sanayi', 'modern'];
  root.GameAudio = {
    sfx, snd, _offline: renderOffline,
    unlock() { A(); if (mPend && mEl) { mPend = false; const p = mEl.play(); if (p && p.catch) p.catch(() => { mPend = true; }); } },
    startMusic(age) { fbKind = AGE_THEME[Math.min(3, age || 0)]; if (musicOn) { A(); if (!mPlay('game')) setTheme(fbKind); } startAmbience(); },
    menuMusic(on) { if (on) { fbKind = 'menu'; if (musicOn) { A(); if (!mPlay('menu')) setTheme('menu'); } } else { mStop(); stopMusic(); } stopAmbience(); },
    stopMusic() { mStop(); stopMusic(); stopAmbience(); },
    setAge(age) { fbKind = AGE_THEME[Math.min(3, age || 0)]; if (timer && themeName !== 'menu') setTheme(fbKind); },
    setIntensity(v) { intensityT = Math.max(0, Math.min(1, v)); },
    setMuted(m) { muted = !!m; mFade(); if (ac) { master.gain.cancelScheduledValues(ac.currentTime); master.gain.linearRampToValueAtTime(muted ? 0.0001 : 0.9, ac.currentTime + 0.15); } },
    setMusicOn(on, age) { musicOn = !!on; if (!on) { mFade(); stopMusic(); } else if (age !== undefined) { if (!mPlay(age === -1 ? 'menu' : 'game')) setTheme(age === -1 ? 'menu' : AGE_THEME[Math.min(3, age || 0)]); } },
    setWeather(kind, s) { setWeather(kind, s); },
    setVolumes(v) { if (v.sfx !== undefined) vols.sfx = v.sfx; if (v.music !== undefined) { vols.music = v.music; mFade(); if (ac && timer) fadeTo(level(), 0.2); } if (v.amb !== undefined) { vols.amb = v.amb; if (ac) ambBus.gain.value = 0.5 * v.amb; } },
    duck(d) { ducked = !!d; mFade(); if (ac && timer) fadeTo(level(), 0.4); },
    _state() { return { sampReady, n: Object.keys(bufs).length, mKind, mFail, mPaused: mEl ? mEl.paused : null, mVol: mEl ? +mEl.volume.toFixed(2) : null, mT: mEl ? +mEl.currentTime.toFixed(1) : null, mDur: mEl ? mEl.duration : null }; },
    get musicOn() { return musicOn; }, get muted() { return muted; }
  };
})(window);
