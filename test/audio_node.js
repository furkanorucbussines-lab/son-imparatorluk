// ses motoru sahte AudioContext ile çalışır mı? (hata/istisna avı; ses dinlenemez)
let nodes = 0, t0 = Date.now();
const P = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, cancelScheduledValues() {}, setTargetAtTime() {} });
const N = (extra) => { nodes++; return Object.assign({ connect() {}, disconnect() {}, start() {}, stop() {}, gain: P(), frequency: P(), detune: P(), Q: P(), pan: P(), delayTime: P(), threshold: P(), knee: P(), ratio: P(), attack: P(), release: P(), type: '', buffer: null, loop: false }, extra || {}); };
global.window = global; global.__audioDebug = true;
global.AudioContext = class { constructor() { this.destination = N(); this.sampleRate = 44100; this.state = 'running'; } get currentTime() { return (Date.now() - t0) / 1000; } resume() {} createGain() { return N(); } createOscillator() { return N(); } createBufferSource() { return N(); } createBiquadFilter() { return N(); } createDelay() { return N(); } createConvolver() { return N(); } createDynamicsCompressor() { return N(); } createStereoPanner() { return N(); } createBuffer(c, n) { return { getChannelData: () => new Float32Array(n) }; } };
require('../audio.js'); const A = window.GameAudio; let errs = 0; const oe = console.error; console.error = (...a) => { errs++; oe(...a); };
for (const k of Object.keys(A.sfx)) A.sfx[k](1, 0.3); for (const k of Object.keys(A.snd)) A.snd[k]();
A.startMusic(0); A.setIntensity(0.9);
const names = ['kale', 'barut', 'sanayi', 'modern'];
let i = 0; const iv = setInterval(() => { i++; if (i < 4) A.startMusic(i); }, 1800);
setTimeout(() => { clearInterval(iv); A.duck(true); A.setMuted(true); A.stopMusic(); setTimeout(() => { console.log('düğüm sayısı', nodes, 'hata', errs); process.exit(errs ? 1 : 0); }, 900); }, 8000);
