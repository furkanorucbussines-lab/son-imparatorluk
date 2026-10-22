/* Son İmparatorluk - görüntü motoru: zemin, birim/bina çizimi, parçacıklar, ışık efektleri */
(function (root) {
'use strict';
const Sim = root.Sim;
const { W, H, BLD, RESDEF } = Sim;
const TEAM = ['#2f7de1', '#d83a34'], TEAM_D = ['#1b4a94', '#8a1f1b'], TEAM_L = ['#8fc0ff', '#ff9a92'];
const ICON = { gradar: '🌐', airfield: '🛫', sam: '🎯', radar: '📡', academy: '🎓', fortress: '🏯', tc: '🏰', house: '🏠', farm: '🌾', barracks: '⚔️', stable: '🐎', foundry: '💣', tower: '🗼', bridge: '🌉', wall: '🧱', gate: '🚪', mine: '💥' };
const PPT = 20;
let low = false, groundCv = null, parts = [], decals = [], anim = new Map(), shake = 0, cloudT = 0, vig = null, vigKey = '';
const fogCv = document.createElement('canvas'); fogCv.width = W; fogCv.height = H;
const fogCtx = fogCv.getContext('2d'), fogImg = fogCtx.createImageData(W, H);
const FS = 4, fogHi = document.createElement('canvas'); fogHi.width = W * FS; fogHi.height = H * FS;
const fogHiCtx = fogHi.getContext('2d'), fogA = new Float32Array(W * H).fill(245);
let cloudPat = null;
const ghosts = new Map(); let ghostG = null;
function makeCloudPat() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d'); let seed = 7; const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 46; i++) { const px = R() * 256, py = R() * 256, rr = 16 + R() * 34; for (const ox of [-256, 0, 256]) for (const oy of [-256, 0, 256]) { const gg = x.createRadialGradient(px + ox, py + oy, 0, px + ox, py + oy, rr); gg.addColorStop(0, 'rgba(190,205,225,.5)'); gg.addColorStop(1, 'rgba(190,205,225,0)'); x.fillStyle = gg; x.fillRect(px + ox - rr, py + oy - rr, rr * 2, rr * 2); } }
  return fogHiCtx.createPattern(cv, 'repeat');
}
const rnd = Math.random;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

/* ---------- gürültü ---------- */
function hash(x, y, s) { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 982451653)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/* ---------- zemin ---------- */
function buildGround(g) {
  const N = W * PPT, seed = g.seed % 9973;
  groundCv = document.createElement('canvas'); groundCv.width = groundCv.height = N;
  const c = groundCv.getContext('2d'), img = c.createImageData(N, N), d = img.data;
  // suya uzaklık (kareler)
  const dist = new Float32Array(W * H).fill(99), q = [];
  for (let i = 0; i < W * H; i++) if (!g.ter[i]) { dist[i] = 0; q.push(i); }
  for (let h = 0; h < q.length; h++) {
    const i = q[h], x = i % W, y = (i / W) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const ni = ny * W + nx; if (dist[ni] > dist[i] + 1) { dist[ni] = dist[i] + 1; q.push(ni); } }
  }
  const wet = new Float32Array(W * H), ford = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) { wet[i] = g.ter[i]; ford[i] = g.ford[i]; }
  const bil = (arr, fx, fy) => {
    const x = fx - 0.5, y = fy - 0.5, x0 = Math.floor(x), y0 = Math.floor(y), tx = x - x0, ty = y - y0;
    const gx = a => a < 0 ? 0 : a >= W ? W - 1 : a, gy = a => a < 0 ? 0 : a >= H ? H - 1 : a;
    const a = arr[gy(y0) * W + gx(x0)], b = arr[gy(y0) * W + gx(x0 + 1)], cc = arr[gy(y0 + 1) * W + gx(x0)], dd = arr[gy(y0 + 1) * W + gx(x0 + 1)];
    return a + (b - a) * tx + (cc - a) * ty + (a - b - cc + dd) * tx * ty;
  };
  // yeşil rampa
  const ramp = []; for (let i = 0; i < 256; i++) { const t = i / 255; ramp.push([Math.round(lerp(52, 128, t)), Math.round(lerp(98, 168, t) - t * t * 14), Math.round(lerp(34, 62, t))]); }
  const inv = 1 / PPT;
  for (let py = 0; py < N; py++) {
    const fy = py * inv;
    for (let px = 0; px < N; px++) {
      const fx = px * inv, o = (py * N + px) * 4;
      let w = bil(wet, fx, fy); const fo = bil(ford, fx, fy);
      const n1 = vnoise(fx * 0.16, fy * 0.16, seed), n2 = vnoise(fx * 0.5, fy * 0.5, seed + 3), n3 = vnoise(fx * 2.4, fy * 2.4, seed + 7), n4 = vnoise(fx * 7, fy * 7, seed + 11);
      w += (n2 - 0.5) * 0.22 + (n3 - 0.5) * 0.08;
      let r, gg, b;
      if (w > 0.5) {
        const dep = clamp(bil(dist, fx, fy) / 3.2, 0, 1) * 0.8 + (n1 - 0.5) * 0.3;
        r = lerp(98, 22, dep); gg = lerp(186, 74, dep); b = lerp(206, 132, dep);
        const rip = Math.sin((fx + fy * 0.6) * 5 + n2 * 9) * 0.5 + 0.5; const k = rip * 0.1 + n4 * 0.05;
        r += 255 * k * 0.5; gg += 255 * k * 0.6; b += 255 * k * 0.6;
        const foam = smooth(0.62, 0.5, w);
        if (foam > 0) { r = lerp(r, 240, foam * 0.75); gg = lerp(gg, 248, foam * 0.75); b = lerp(b, 252, foam * 0.75); }
      } else {
        const t = clamp(0.5 * n1 + 0.32 * n2 + 0.12 * n3 + 0.06 * n4 + (n1 > 0.6 ? 0.08 : 0), 0, 1), col = ramp[(t * 255) | 0];
        r = col[0]; gg = col[1]; b = col[2];
        const dirt = smooth(0.7, 0.82, n1 * 0.75 + n2 * 0.25);
        if (dirt > 0) { r = lerp(r, 128, dirt * 0.65); gg = lerp(gg, 108, dirt * 0.65); b = lerp(b, 66, dirt * 0.65); }
        const sand = smooth(0.3, 0.5, w);
        if (sand > 0) { r = lerp(r, 205, sand); gg = lerp(gg, 188, sand); b = lerp(b, 132, sand); }
        if (fo > 0.35) { const k = smooth(0.35, 0.6, fo); r = lerp(r, 196, k * 0.85); gg = lerp(gg, 206, k * 0.8); b = lerp(b, 168, k * 0.75); }
      }
      d[o] = r; d[o + 1] = gg; d[o + 2] = b; d[o + 3] = 255;
    }
  }
  c.putImageData(img, 0, 0);
  // çimen tutamları ve çiçekler
  let s = seed * 7 + 1; const R = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  c.lineCap = 'round';
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (g.ter[y * W + x] || g.ford[y * W + x]) continue;
    const wv = bil(wet, x + 0.5, y + 0.5); if (wv > 0.25) continue;
    for (let k = 0; k < 5; k++) {
      const px = (x + R()) * PPT, py = (y + R()) * PPT, hh = 2.5 + R() * 3;
      c.strokeStyle = R() < 0.5 ? 'rgba(25,70,25,.45)' : 'rgba(150,200,80,.4)'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(px, py); c.lineTo(px + (R() - 0.5) * 3, py - hh); c.stroke();
    }
    if (R() < 0.07) { const px = (x + R()) * PPT, py = (y + R()) * PPT; c.fillStyle = ['#f6e05e', '#ffffff', '#f08cb0', '#b99cff'][Math.floor(R() * 4)]; c.beginPath(); c.arc(px, py, 1.5, 0, 6.283); c.fill(); }
  }
}
function init(g) { buildGround(g); parts.length = 0; decals.length = 0; anim.clear(); shake = 0; }

/* ---------- parçacıklar ---------- */
function P(o) { if (parts.length > (low ? 450 : 1600)) return; o.max = o.life; o.vx = o.vx || 0; o.vy = o.vy || 0; o.z = o.z || 0; o.vz = o.vz || 0; o.rot = o.rot || 0; o.vr = o.vr || 0; o.grav = o.grav || 0; o.drag = o.drag || 0; parts.push(o); }
function smokeAt(x, y, n, size, z) { for (let i = 0; i < n; i++) P({ type: 'smoke', x: x + (rnd() - 0.5) * 0.3, y: y + (rnd() - 0.5) * 0.2, z: z || 0.2, vx: (rnd() - 0.5) * 0.25 + 0.15, vy: 0, vz: 0.35 + rnd() * 0.3, life: 1.1 + rnd() * 0.9, size: size || 0.2 }); }
function fireAt(x, y, n, z) { for (let i = 0; i < n; i++) P({ type: 'fire', x: x + (rnd() - 0.5) * 0.4, y: y + (rnd() - 0.5) * 0.3, z: z || 0.1, vx: (rnd() - 0.5) * 0.3, vz: 0.5 + rnd() * 0.7, life: 0.4 + rnd() * 0.4, size: 0.12 + rnd() * 0.12 }); }
function sparkAt(x, y, n, speed, z) { for (let i = 0; i < n; i++) { const a = rnd() * 6.283, v = (0.4 + rnd()) * (speed || 2); P({ type: 'spark', x, y, z: z || 0.25, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.6, vz: 1 + rnd() * 1.5, grav: 6, life: 0.25 + rnd() * 0.3, size: 0.05 }); } }
function dustAt(x, y, n, spread, col) { for (let i = 0; i < n; i++) { const a = rnd() * 6.283, v = rnd() * (spread || 0.8); P({ type: 'dust', x: x + Math.cos(a) * 0.1, y: y + Math.sin(a) * 0.1, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.6, vz: 0.2 + rnd() * 0.3, drag: 2.5, life: 0.5 + rnd() * 0.5, size: 0.12 + rnd() * 0.12, col }); } }
function debrisAt(x, y, n, speed, cols) { for (let i = 0; i < n; i++) { const a = rnd() * 6.283, v = (0.3 + rnd()) * (speed || 3); P({ type: 'debris', x, y, z: 0.2, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.6, vz: 2 + rnd() * 3, grav: 9, life: 0.7 + rnd() * 0.6, size: 0.06 + rnd() * 0.07, rot: rnd() * 6, vr: (rnd() - 0.5) * 14, col: cols ? cols[Math.floor(rnd() * cols.length)] : '#5a4a3a' }); } }
function ringAt(x, y, r, life, col) { P({ type: 'ring', x, y, life, size: r, col: col || '255,240,200' }); }
function flashAt(x, y, r, life) { P({ type: 'flash', x, y, z: 0.3, life, size: r }); }

function addShake(a, x, y, V) {
  const sxp = (x - V.cam.x) * V.ts, syp = (y - V.cam.y) * V.ts;
  if (sxp < -100 || syp < -100 || sxp > V.vw + 100 || syp > V.vh + 100) return;
  shake = Math.min(1.2, shake + a);
}
function visAt(V, x, y) { const i = Math.floor(y) * W + Math.floor(x); return i >= 0 && i < W * H && V.g.owners[V.ME].vis[i] === 1; }

function spawnFx(f, V) {
  const seen = visAt(V, f.x !== undefined ? f.x : f.x0, f.y !== undefined ? f.y : f.y0);
  if (f.t === 'shot') {
    if (!visAt(V, f.x0, f.y0) && !visAt(V, f.x1, f.y1)) return;
    if (f.siege || f.ut === 'tank') { sparkAt(f.x0, f.y0, 6, 3); fireAt(f.x0, f.y0, 5, 0.3); smokeAt(f.x0, f.y0, 6, 0.3, 0.3); flashAt(f.x0, f.y0, f.ut === 'tank' ? 1.1 : 0.9, 0.12); addShake(f.ut === 'tank' ? 0.22 : 0.18, f.x0, f.y0, V); }
    else if (f.ut === 'sam' || f.ut === 'siha') { smokeAt(f.x0, f.y0, 5, 0.22, 0.4); flashAt(f.x0, f.y0, 0.7, 0.1); }
    else if (f.ut === 'musketeer') { smokeAt(f.x0, f.y0, 2, 0.16, 0.3); sparkAt(f.x0, f.y0, 3, 2); flashAt(f.x0, f.y0, 0.5, 0.08); }
    else if (['mgun', 'heli', 'fighter', 'armored'].includes(f.ut)) { sparkAt(f.x0, f.y0, 1, 1.5); }

    else if (f.ut === 'tower') { if (f.age >= 3) flashAt(f.x0, f.y0, 0.9, 0.12); else if (f.age === 1) { smokeAt(f.x0, f.y0, 4, 0.2, 0.5); flashAt(f.x0, f.y0, 0.7, 0.1); } else sparkAt(f.x0, f.y0, 3, 1.8, 0.6); }
    else if (f.ut === 'sniper' || f.ut === 'rpg' || f.ut === 'flak' || f.ut === 'ltank' || f.ut === 'htank' || f.ut === 'howitzer') { smokeAt(f.x0, f.y0, 3, 0.18, 0.3); flashAt(f.x0, f.y0, f.ut === 'howitzer' || f.ut === 'htank' ? 1.0 : 0.6, 0.1); if (f.ut === 'howitzer' || f.ut === 'htank') addShake(0.2, f.x0, f.y0, V); }
  } else if (f.t === 'heal') {
    if (!seen) return; P({ type: 'spark', x: f.x, y: f.y, z: 0.4, vx: 0, vy: 0, vz: 0.8, grav: -1, life: 0.6, size: 0.06 });
  } else if (f.t === 'hit') {
    if (!seen) return;
    sparkAt(f.x, f.y, f.big ? 4 : 5, 2.4, 0.3); if (f.big) debrisAt(f.x, f.y, 2, 2, ['#8c8c93', '#6a5a4a']);
    ringAt(f.x, f.y, 0.3, 0.18);
  } else if (f.t === 'boom') {
    if (!seen && !f.big) return;
    if (f.big) { debrisAt(f.x, f.y, 16, 4, ['#7a6a58', '#5a4a3a', '#8c8c93', '#a0522d']); smokeAt(f.x, f.y, 10, 0.45, 0.3); fireAt(f.x, f.y, 10, 0.2); flashAt(f.x, f.y, 1.6, 0.2); ringAt(f.x, f.y, 1.6, 0.5); addShake(0.5, f.x, f.y, V); }
    else { dustAt(f.x, f.y, 3, 0.8); sparkAt(f.x, f.y, 3, 1.5); }
  } else if (f.t === 'blast') {
    flashAt(f.x, f.y, f.r * 1.4, 0.25); ringAt(f.x, f.y, f.r, 0.6); ringAt(f.x, f.y, f.r * 0.6, 0.4, '255,180,80');
    debrisAt(f.x, f.y, Math.round(10 + f.r * 8), f.r * 2 + 2, ['#5a4a3a', '#3a3a3a', '#7a5a30']);
    fireAt(f.x, f.y, Math.round(f.r * 8), 0.2); smokeAt(f.x, f.y, Math.round(f.r * 5), 0.5, 0.3); dustAt(f.x, f.y, 10, f.r * 1.3); addShake(f.r > 2 ? 1 : 0.35, f.x, f.y, V);
  } else if (f.t === 'bomb') {
    /* düşüş görseli drawFxShape'te */
  } else if (f.t === 'age') {
    ringAt(f.x, f.y, 5, 1.2, '255,220,120'); ringAt(f.x, f.y, 3, 0.9, '255,255,255'); flashAt(f.x, f.y, 3.2, 0.5); sparkAt(f.x, f.y, 30, 4, 0.5); addShake(0.25, f.x, f.y, V);
    for (let i = 0; i < 24; i++) P({ type: 'twinkle', x: f.x + (rnd() - 0.5) * 3, y: f.y + (rnd() - 0.5) * 2, z: 0.5, vz: 1 + rnd() * 2, life: 0.8 + rnd() * 0.8, size: 0.05 });
  } else if (f.t === 'place') {
    dustAt(f.x, f.y, 6, 0.9, '200,180,140');
  } else if (f.t === 'death') {
    if (!seen) return;
    dustAt(f.x, f.y, 4, 0.6); sparkAt(f.x, f.y, 3, 1.2, 0.2);
    decals.push({ type: 'stain', x: f.x, y: f.y, r: 0.28 + rnd() * 0.12, life: 16, max: 16, col: f.owner === 0 ? '30,55,100' : '100,30,25' });
    if (decals.length > 220) decals.shift();
  } else if (f.t === 'collapse') {
    const pieces = []; for (let i = 0; i < 10 * f.s; i++) pieces.push([(rnd() - 0.5) * f.s * 0.9, (rnd() - 0.5) * f.s * 0.9, 0.08 + rnd() * 0.16, 0.05 + rnd() * 0.1, rnd() * 3, rnd()]);
    decals.push({ type: 'rubble', x: f.x, y: f.y, s: f.s, pieces, life: 90, max: 90 });
    dustAt(f.x, f.y, 12 * f.s, f.s * 0.9); smokeAt(f.x, f.y, 6 * f.s, 0.4, 0.2);
  }
}

/* ---------- çizim yardımcıları ---------- */
function hpBar(c, x, y, w, frac, col) {
  c.fillStyle = 'rgba(0,0,0,.7)'; c.fillRect(x - w / 2 - 1.5, y - 1.5, w + 3, 6);
  const cc = col || (frac > 0.5 ? '#5fe06a' : frac > 0.25 ? '#f0c23a' : '#e84a3a');
  c.fillStyle = cc; c.fillRect(x - w / 2, y, w * clamp(frac, 0, 1), 3);
  c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x - w / 2, y, w * clamp(frac, 0, 1), 1);
}
function ell(c, x, y, rx, ry, rot, fill) { c.fillStyle = fill; c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, 6.283); c.fill(); }
function circ(c, x, y, r, fill) { c.fillStyle = fill; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
function grad(c, x0, y0, x1, y1, a, b) { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; }

/* ---------- kaynaklar ---------- */
function drawRes(c, V, r) {
  const d = RESDEF[r.type], ts = V.ts, px = (r.tx - V.cam.x) * ts, py = (r.ty - V.cam.y) * ts, s = d.s * ts, t = V.time;
  if (r.type === 'tree') {
    const cx = px + s / 2, cy = py + s / 2, sw = Math.sin(t * 1.3 + r.id) * s * 0.025, v = r.id % 3;
    ell(c, cx + s * 0.12, cy + s * 0.34, s * 0.4, s * 0.15, 0, 'rgba(0,0,0,.28)');
    c.fillStyle = '#5a3d22'; c.fillRect(cx - s * 0.06, cy + s * 0.02, s * 0.12, s * 0.34);
    if (v === 0) { // çam
      for (let i = 0; i < 3; i++) { const yy = cy + s * 0.08 - i * s * 0.22, w = s * (0.42 - i * 0.1); c.fillStyle = grad(c, cx - w, yy, cx + w, yy, ['#1b5e2b', '#216f33', '#2a8040'][i], '#164a22'); c.beginPath(); c.moveTo(cx + sw * (i + 1), yy - s * 0.3); c.lineTo(cx - w, yy + s * 0.1); c.lineTo(cx + w, yy + s * 0.1); c.closePath(); c.fill(); }
    } else {
      const cols = v === 1 ? ['#1f6b2c', '#2f8a42', '#46a85a'] : ['#2a7a34', '#3d9a4c', '#63bd6e'];
      circ(c, cx - s * 0.16 + sw, cy - s * 0.04, s * 0.27, cols[0]); circ(c, cx + s * 0.16 + sw, cy - s * 0.06, s * 0.26, cols[0]);
      circ(c, cx + sw * 1.4, cy - s * 0.2, s * 0.32, cols[1]); circ(c, cx - s * 0.08 + sw * 1.6, cy - s * 0.3, s * 0.16, cols[2]);
    }
  } else if (r.type === 'berry') {
    const cx = px + s / 2, cy = py + s / 2;
    ell(c, cx + s * 0.08, cy + s * 0.28, s * 0.36, s * 0.13, 0, 'rgba(0,0,0,.25)');
    circ(c, cx - s * 0.12, cy, s * 0.23, '#2f7a35'); circ(c, cx + s * 0.14, cy + s * 0.02, s * 0.22, '#2a6e30'); circ(c, cx, cy - s * 0.1, s * 0.25, '#3a8f40');
    for (let i = 0; i < 7; i++) { const a = i * 2.1 + r.id; circ(c, cx + Math.cos(a) * s * 0.22, cy - s * 0.04 + Math.sin(a) * s * 0.16, s * 0.055, '#d6264a'); circ(c, cx + Math.cos(a) * s * 0.22 - s * 0.015, cy - s * 0.04 + Math.sin(a) * s * 0.16 - s * 0.015, s * 0.018, '#ff9aaa'); }
  } else if (r.type === 'iron') {
    ell(c, px + s * 0.55, py + s * 0.9, s * 0.5, s * 0.14, 0, 'rgba(0,0,0,.3)');
    c.fillStyle = grad(c, px, py, px + s, py + s, '#5a6270', '#2c323c'); c.beginPath(); c.moveTo(px + s * .06, py + s * .88); c.lineTo(px + s * .12, py + s * .36); c.lineTo(px + s * .34, py + s * .1); c.lineTo(px + s * .66, py + s * .14); c.lineTo(px + s * .95, py + s * .46); c.lineTo(px + s * .92, py + s * .88); c.closePath(); c.fill();
    c.fillStyle = 'rgba(160,190,230,.22)'; c.beginPath(); c.moveTo(px + s * .12, py + s * .36); c.lineTo(px + s * .34, py + s * .1); c.lineTo(px + s * .48, py + s * .42); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(190,100,50,.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(px + s * .3, py + s * .3); c.lineTo(px + s * .4, py + s * .8); c.moveTo(px + s * .7, py + s * .3); c.lineTo(px + s * .62, py + s * .84); c.stroke();
    [[.28, .55, .09], [.55, .35, .1], [.7, .62, .09], [.45, .72, .08]].forEach(([a, b2, rr]) => circ(c, px + s * a, py + s * b2, s * rr, grad(c, px + s * (a - rr), py + s * (b2 - rr), px + s * (a + rr), py + s * (b2 + rr), '#b9c8dc', '#6d7a8e')));
    const tw = Math.sin(t * 2.4 + r.id) * 0.5 + 0.5; c.strokeStyle = `rgba(200,225,255,${0.2 + tw * 0.7})`; c.lineWidth = 1.5; const qx = px + s * (0.35 + 0.35 * ((r.id * 5) % 4) / 4), qy = py + s * 0.45; c.beginPath(); c.moveTo(qx - 4 * tw, qy); c.lineTo(qx + 4 * tw, qy); c.moveTo(qx, qy - 4 * tw); c.lineTo(qx, qy + 4 * tw); c.stroke();
  } else {
    ell(c, px + s * 0.55, py + s * 0.9, s * 0.5, s * 0.14, 0, 'rgba(0,0,0,.3)');
    c.fillStyle = grad(c, px, py, px + s, py + s, '#9a9aa2', '#5c5c64'); c.beginPath(); c.moveTo(px + s * .08, py + s * .88); c.lineTo(px + s * .16, py + s * .34); c.lineTo(px + s * .42, py + s * .12); c.lineTo(px + s * .7, py + s * .16); c.lineTo(px + s * .94, py + s * .5); c.lineTo(px + s * .9, py + s * .88); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.moveTo(px + s * .16, py + s * .34); c.lineTo(px + s * .42, py + s * .12); c.lineTo(px + s * .5, py + s * .4); c.closePath(); c.fill();
    [[.3, .5, .1], [.58, .38, .12], [.72, .64, .1], [.42, .72, .09], [.22, .72, .07]].forEach(([a, b, rr], i) => { circ(c, px + s * a, py + s * b, s * rr, grad(c, px + s * (a - rr), py + s * (b - rr), px + s * (a + rr), py + s * (b + rr), '#ffe27a', '#c8961a')); });
    const tw = Math.sin(t * 3 + r.id) * 0.5 + 0.5;
    c.strokeStyle = `rgba(255,255,220,${0.3 + tw * 0.7})`; c.lineWidth = 1.5; const sxp = px + s * (0.3 + 0.4 * ((r.id * 7) % 5) / 5), syp = py + s * 0.4;
    c.beginPath(); c.moveTo(sxp - 5 * tw, syp); c.lineTo(sxp + 5 * tw, syp); c.moveTo(sxp, syp - 5 * tw); c.lineTo(sxp, syp + 5 * tw); c.stroke();
  }
}
function drawBadge(c, V, e, n) {
  const r = Sim.rectOf(e), x = (((r.x0 + r.x1) / 2) - V.cam.x) * V.ts, y = (r.y0 - V.cam.y) * V.ts - 4;
  c.font = 'bold 13px "Segoe UI",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  const w = c.measureText('👷 ' + n).width + 12;
  c.fillStyle = 'rgba(10,12,6,.8)'; rrect(c, x - w / 2, y - 10, w, 20, 6); c.fill();
  c.strokeStyle = '#e8c24a'; c.lineWidth = 1.2; rrect(c, x - w / 2, y - 10, w, 20, 6); c.stroke();
  c.fillStyle = '#fff'; c.fillText('👷 ' + n, x, y + 1);
}
function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

/* ---------- binalar ---------- */
let curCiv = null, ageOvr = null;
const BLDART = {}, ageSeen = new Map();
// bina sancağı: sahibinin ülke bayrağı (dalgalanır), kenarında takım rengi şeridi
function flag(c, x, y, h, col, t, seed, wv) {
  c.strokeStyle = '#3a2a18'; c.lineWidth = Math.max(1.5, h * 0.06); c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - h); c.stroke();
  const w = h * 0.7, fh = h * 0.38, im = typeof Flags !== 'undefined' && curCiv && Flags.img[curCiv];
  if (im && im.complete && im.naturalWidth) {
    const N = 8, sw = im.naturalWidth / N;
    for (let i = 0; i < N; i++) {
      const k = i / N, off = Math.sin(t * 5 + i * 0.9 + seed) * fh * 0.14 * k * (wv || 1);
      c.drawImage(im, i * sw, 0, sw + 0.5, im.naturalHeight, x + w * k, y - h + off, w / N + 0.6, fh);
    }
    c.fillStyle = col; c.fillRect(x, y - h, w, Math.max(1, fh * 0.1));
    c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 0.8; c.strokeRect(x, y - h, w, fh);
    return;
  }
  c.fillStyle = col; c.beginPath(); c.moveTo(x, y - h);
  for (let i = 0; i <= 6; i++) c.lineTo(x + w * i / 6, y - h + Math.sin(t * 5 + i * 0.9 + seed) * fh * 0.14 * i / 6 * (wv || 1));
  for (let i = 6; i >= 0; i--) c.lineTo(x + w * i / 6, y - h + fh + Math.sin(t * 5 + i * 0.9 + seed) * fh * 0.14 * i / 6 * (wv || 1));
  c.closePath(); c.fill();
}
function drawTcModern(c, V, b, px, py, s, col, cd, cl, t) {
  c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(px + s * 0.05, py + s * 0.78, s * 0.9, s * 0.2);
  c.fillStyle = grad(c, px, py, px + s, py, '#c4c9cf', '#8f969e'); rrect(c, px + s * 0.06, py + s * 0.18, s * 0.88, s * 0.78, s * 0.03); c.fill();
  c.fillStyle = grad(c, px, py, px, py + s, '#3a5a7a', '#1d2f45'); c.fillRect(px + s * 0.12, py + s * 0.3, s * 0.76, s * 0.5);
  c.strokeStyle = 'rgba(200,225,255,.35)'; c.lineWidth = 1; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(px + s * (0.12 + i * 0.1267), py + s * 0.3); c.lineTo(px + s * (0.12 + i * 0.1267), py + s * 0.8); c.stroke(); } for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(px + s * 0.12, py + s * (0.3 + i * 0.125)); c.lineTo(px + s * 0.88, py + s * (0.3 + i * 0.125)); c.stroke(); }
  c.fillStyle = col; c.fillRect(px + s * 0.06, py + s * 0.24, s * 0.88, s * 0.05);
  c.fillStyle = '#25282c'; c.fillRect(px + s * 0.44, py + s * 0.68, s * 0.12, s * 0.28); c.fillStyle = '#ffd86a'; c.fillRect(px + s * 0.46, py + s * 0.72, s * 0.08, s * 0.03);
  c.fillStyle = '#5a6068'; c.beginPath(); c.arc(px + s * 0.74, py + s * 0.12, s * 0.12, 0, 6.283); c.fill(); c.strokeStyle = '#e8e8ee'; c.lineWidth = Math.max(1.5, s * 0.015); c.stroke();
  c.fillStyle = '#e8e8ee'; c.font = Math.round(s * 0.13) + 'px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('H', px + s * 0.74, py + s * 0.12);
  c.fillStyle = '#9aa0a8'; c.fillRect(px + s * 0.2, py - s * 0.1, s * 0.02, s * 0.3); circ(c, px + s * 0.21, py - s * 0.1, s * 0.03, Math.sin(t * 4 + b.id) > 0 ? '#ff4030' : '#702018');
  flag(c, px + s * 0.5, py + s * 0.18, s * 0.44, cl, t, b.id, 1);
}
function drawBldBody(c, V, b, px, py, s, col, cd, cl, t) {
  const type = b.type;
  if (BLDART[type]) { BLDART[type](c, V, b, px, py, s, col, cd, cl, t, ageOvr !== null ? ageOvr : (b.owner >= 0 ? V.g.owners[b.owner].age : 0)); return; }
  if (type === 'tc' && b.owner >= 0 && V.g.owners[b.owner].age >= 3) { drawTcModern(c, V, b, px, py, s, col, cd, cl, t); return; }
  const stone = grad(c, px, py, px + s, py + s, '#cdbb90', '#a8946a');
  if (type === 'tc') {
    c.fillStyle = stone; rrect(c, px + s * 0.04, py + s * 0.12, s * 0.92, s * 0.84, s * 0.05); c.fill();
    c.fillStyle = 'rgba(0,0,0,.14)'; c.fillRect(px + s * 0.04, py + s * 0.7, s * 0.92, s * 0.26);
    // köşe kuleleri
    [[0.12, 0.2], [0.88, 0.2], [0.12, 0.84], [0.88, 0.84]].forEach(([a, bb]) => {
      circ(c, px + s * a, py + s * bb, s * 0.11, grad(c, px + s * (a - 0.1), py, px + s * (a + 0.1), py, '#d8c9a0', '#9a8760'));
      c.fillStyle = cd; c.beginPath(); c.moveTo(px + s * a, py + s * (bb - 0.2)); c.lineTo(px + s * (a - 0.12), py + s * (bb - 0.04)); c.lineTo(px + s * (a + 0.12), py + s * (bb - 0.04)); c.closePath(); c.fill();
    });
    // ana kale
    c.fillStyle = grad(c, px, py, px + s, py, '#e0d2a8', '#b09c72'); c.fillRect(px + s * 0.28, py + s * 0.3, s * 0.44, s * 0.5);
    c.fillStyle = '#6e5a3a'; for (let i = 0; i < 5; i++) c.fillRect(px + s * (0.28 + i * 0.1), py + s * 0.25, s * 0.06, s * 0.07);
    c.fillStyle = col; c.beginPath(); c.moveTo(px + s * 0.5, py + s * 0.02); c.lineTo(px + s * 0.22, py + s * 0.3); c.lineTo(px + s * 0.78, py + s * 0.3); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.2)'; c.beginPath(); c.moveTo(px + s * 0.5, py + s * 0.02); c.lineTo(px + s * 0.22, py + s * 0.3); c.lineTo(px + s * 0.5, py + s * 0.3); c.closePath(); c.fill();
    c.fillStyle = '#3a2814'; c.beginPath(); c.moveTo(px + s * 0.43, py + s * 0.8); c.lineTo(px + s * 0.43, py + s * 0.62); c.arc(px + s * 0.5, py + s * 0.62, s * 0.07, Math.PI, 0); c.lineTo(px + s * 0.57, py + s * 0.8); c.closePath(); c.fill();
    c.fillStyle = '#ffd86a'; c.fillRect(px + s * 0.34, py + s * 0.45, s * 0.06, s * 0.09); c.fillRect(px + s * 0.6, py + s * 0.45, s * 0.06, s * 0.09);
    { const ag = V.g.owners[b.owner].age;
      if (ag >= 1) { c.fillStyle = '#e8c24a'; c.fillRect(px + s * 0.22, py + s * 0.3, s * 0.56, s * 0.03); c.fillRect(px + s * 0.04, py + s * 0.12, s * 0.92, s * 0.02); circ(c, px + s * 0.5, py + s * 0.02, s * 0.025, '#e8c24a'); }
      if (ag >= 3) { c.fillStyle = '#9aa0a8'; c.fillRect(px + s * 0.5, py - s * 0.12, s * 0.02, s * 0.16); circ(c, px + s * 0.51, py - s * 0.12, s * 0.03, Math.sin(t * 4 + b.id) > 0 ? '#ff4030' : '#702018'); c.fillStyle = '#c8ccd2'; c.fillRect(px + s * 0.4, py + s * 0.06, s * 0.2, s * 0.03); }
      if (ag >= 2) { c.fillStyle = '#55555c'; c.fillRect(px + s * 0.18, py + s * 0.0, s * 0.07, s * 0.2); c.fillRect(px + s * 0.75, py + s * 0.0, s * 0.07, s * 0.2); if (b.done && rnd() < 0.18) { smokeAt(b.tx + 0.215 * 3, b.ty - 0.05, 1, 0.2, 0.8); smokeAt(b.tx + 0.785 * 3, b.ty - 0.05, 1, 0.2, 0.8); } }
    }
    flag(c, px + s * 0.5, py + s * 0.04, s * 0.44, cl, t, b.id, 1);
    if (b.done && rnd() < 0.05) smokeAt(b.tx + 0.35 * 3 + 0.9, b.ty + 0.9, 1, 0.18, 0.7);
  } else if (type === 'house') {
    c.fillStyle = '#d9c9a0'; c.fillRect(px + s * 0.08, py + s * 0.4, s * 0.84, s * 0.54);
    c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(px + s * 0.08, py + s * 0.74, s * 0.84, s * 0.2);
    c.fillStyle = grad(c, px, py, px, py + s * 0.5, col, cd); c.beginPath(); c.moveTo(px + s * 0.02, py + s * 0.46); c.lineTo(px + s * 0.5, py + s * 0.06); c.lineTo(px + s * 0.98, py + s * 0.46); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(px + s * (0.5 - 0.46 * i / 4), py + s * (0.06 + 0.4 * i / 4)); c.lineTo(px + s * (0.5 + 0.46 * i / 4), py + s * (0.06 + 0.4 * i / 4)); c.stroke(); }
    c.fillStyle = '#5a3d22'; c.fillRect(px + s * 0.42, py + s * 0.62, s * 0.16, s * 0.32); c.fillStyle = '#ffd86a'; c.fillRect(px + s * 0.16, py + s * 0.55, s * 0.14, s * 0.14); c.fillRect(px + s * 0.7, py + s * 0.55, s * 0.14, s * 0.14);
    c.fillStyle = '#7a6a55'; c.fillRect(px + s * 0.72, py + s * 0.1, s * 0.1, s * 0.22);
    if (b.done && rnd() < 0.03) smokeAt(b.tx + 1.55, b.ty + 0.2, 1, 0.12, 0.5);
  } else if (type === 'farm') {
    c.fillStyle = '#7a5a30'; c.fillRect(px + s * 0.03, py + s * 0.03, s * 0.94, s * 0.94);
    for (let i = 0; i < 5; i++) {
      const yy = py + s * (0.1 + i * 0.18); c.fillStyle = '#5a4020'; c.fillRect(px + s * 0.06, yy + s * 0.1, s * 0.88, s * 0.04);
      for (let j = 0; j < 7; j++) { const xx = px + s * (0.1 + j * 0.125), sw = Math.sin(t * 2 + j + i) * s * 0.012; c.strokeStyle = j % 2 ? '#c8c43a' : '#a8c03a'; c.lineWidth = Math.max(1.5, s * 0.03); c.beginPath(); c.moveTo(xx, yy + s * 0.12); c.lineTo(xx + sw, yy - s * 0.02); c.stroke(); circ(c, xx + sw, yy - s * 0.03, s * 0.025, '#e8d24a'); }
    }
    c.fillStyle = '#5a3d22'; c.fillRect(px + s * 0.88, py + s * 0.55, s * 0.03, s * 0.35); c.fillRect(px + s * 0.82, py + s * 0.62, s * 0.15, s * 0.025); circ(c, px + s * 0.895, py + s * 0.5, s * 0.05, '#d9c27a');
    c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 2; c.strokeRect(px + s * 0.03, py + s * 0.03, s * 0.94, s * 0.94);
  } else if (type === 'barracks') {
    c.fillStyle = grad(c, px, py, px, py + s, '#a89478', '#7a6a52'); c.fillRect(px + s * 0.05, py + s * 0.3, s * 0.9, s * 0.66);
    c.fillStyle = 'rgba(0,0,0,.16)'; c.fillRect(px + s * 0.05, py + s * 0.72, s * 0.9, s * 0.24);
    c.fillStyle = grad(c, px, py, px, py + s * 0.35, col, cd); c.beginPath(); c.moveTo(px, py + s * 0.34); c.lineTo(px + s * 0.12, py + s * 0.08); c.lineTo(px + s * 0.88, py + s * 0.08); c.lineTo(px + s, py + s * 0.34); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1; for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(px + s * (0.06 + i * 0.01), py + s * (0.08 + 0.065 * i)); c.lineTo(px + s * (0.94 - i * 0.01), py + s * (0.08 + 0.065 * i)); c.stroke(); }
    c.fillStyle = '#3a2814'; c.fillRect(px + s * 0.42, py + s * 0.58, s * 0.16, s * 0.38);
    c.strokeStyle = '#d8d8e0'; c.lineWidth = Math.max(2, s * 0.03); c.beginPath(); c.moveTo(px + s * 0.14, py + s * 0.5); c.lineTo(px + s * 0.34, py + s * 0.82); c.moveTo(px + s * 0.34, py + s * 0.5); c.lineTo(px + s * 0.14, py + s * 0.82); c.stroke();
    c.fillStyle = '#7a4a22'; c.fillRect(px + s * 0.68, py + s * 0.6, s * 0.2, s * 0.05); c.fillRect(px + s * 0.7, py + s * 0.52, s * 0.03, s * 0.3); c.fillRect(px + s * 0.78, py + s * 0.52, s * 0.03, s * 0.3);
    flag(c, px + s * 0.9, py + s * 0.1, s * 0.22, cl, t, b.id, 1);
    const fl = 0.6 + Math.sin(t * 9 + b.id) * 0.4; circ(c, px + s * 0.36, py + s * 0.62, s * 0.03, `rgba(255,${150 + fl * 80},60,.95)`); circ(c, px + s * 0.64, py + s * 0.62, s * 0.03, `rgba(255,${150 + fl * 80},60,.95)`);
  } else if (type === 'stable') {
    c.fillStyle = grad(c, px, py, px, py + s, '#a8744a', '#6e4a2c'); c.fillRect(px + s * 0.05, py + s * 0.3, s * 0.9, s * 0.66);
    c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(px + s * 0.05, py + s * 0.74, s * 0.9, s * 0.22);
    c.fillStyle = grad(c, px, py, px, py + s * 0.35, '#e2c060', '#b8903a'); c.beginPath(); c.moveTo(px, py + s * 0.34); c.lineTo(px + s * 0.1, py + s * 0.06); c.lineTo(px + s * 0.9, py + s * 0.06); c.lineTo(px + s, py + s * 0.34); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(120,80,20,.5)'; c.lineWidth = 1; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(px + s * (0.1 + 0.07 * i), py + s * 0.08); c.lineTo(px + s * (0.1 + 0.07 * i - 0.03), py + s * 0.34); c.stroke(); }
    c.fillStyle = '#2a1a0c'; c.fillRect(px + s * 0.3, py + s * 0.52, s * 0.4, s * 0.44);
    ell(c, px + s * 0.5, py + s * 0.78, s * 0.12, s * 0.15, 0, '#6a4630'); circ(c, px + s * 0.5, py + s * 0.62, s * 0.07, '#5a3a26');
    c.fillStyle = col; c.fillRect(px + s * 0.05, py + s * 0.3, s * 0.9, s * 0.05);
    c.strokeStyle = '#7a5a30'; c.lineWidth = 2; c.beginPath(); c.moveTo(px + s * 0.05, py + s * 0.97); c.lineTo(px + s * 0.95, py + s * 0.97); c.stroke();
  } else if (type === 'foundry') {
    c.fillStyle = grad(c, px, py, px, py + s, '#8a8a92', '#55555c'); c.fillRect(px + s * 0.05, py + s * 0.28, s * 0.9, s * 0.68);
    c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(px + s * 0.05, py + s * 0.74, s * 0.9, s * 0.22);
    c.fillStyle = '#44444a'; c.fillRect(px, py + s * 0.24, s, s * 0.1); c.fillStyle = col; c.fillRect(px, py + s * 0.24, s, s * 0.04);
    c.fillStyle = grad(c, px, py, px + s * 0.12, py, '#66666e', '#3a3a40'); c.fillRect(px + s * 0.74, py + s * 0.02, s * 0.14, s * 0.3);
    const fl = 0.6 + Math.sin(t * 11 + b.id) * 0.4;
    c.fillStyle = '#1a1210'; c.fillRect(px + s * 0.3, py + s * 0.5, s * 0.4, s * 0.46);
    c.fillStyle = `rgba(255,${120 + fl * 100},30,.95)`; c.fillRect(px + s * 0.35, py + s * 0.6, s * 0.3, s * 0.3);
    c.fillStyle = 'rgba(255,200,80,.5)'; c.beginPath(); c.arc(px + s * 0.5, py + s * 0.75, s * 0.28 * fl, 0, 6.283); c.fill();
    c.fillStyle = '#2d2d30'; c.fillRect(px + s * 0.1, py + s * 0.6, s * 0.14, s * 0.1); c.fillRect(px + s * 0.1, py + s * 0.66, s * 0.18, s * 0.08);
    if (b.done && rnd() < 0.12) smokeAt(b.tx + 3 * 0.81, b.ty + 0.1, 1, 0.22, 0.9);
  } else if (type === 'academy') {
    c.fillStyle = stone; rrect(c, px + s * 0.06, py + s * 0.34, s * 0.88, s * 0.6, s * 0.04); c.fill();
    c.fillStyle = 'rgba(0,0,0,.14)'; c.fillRect(px + s * 0.06, py + s * 0.74, s * 0.88, s * 0.2);
    for (let i = 0; i < 5; i++) { c.fillStyle = grad(c, px + s * (0.12 + i * 0.17), py, px + s * (0.18 + i * 0.17), py, '#f0e8d0', '#b8aa88'); c.fillRect(px + s * (0.12 + i * 0.17), py + s * 0.4, s * 0.07, s * 0.46); }
    c.fillStyle = '#8c7a56'; c.fillRect(px + s * 0.02, py + s * 0.32, s * 0.96, s * 0.06);
    c.fillStyle = grad(c, px, py, px, py + s * 0.4, col, cd); c.beginPath(); c.arc(px + s * 0.5, py + s * 0.34, s * 0.3, Math.PI, 0); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.22)'; c.beginPath(); c.arc(px + s * 0.5, py + s * 0.34, s * 0.3, Math.PI, Math.PI * 1.45); c.lineTo(px + s * 0.5, py + s * 0.34); c.fill();
    c.fillStyle = '#e8c24a'; c.fillRect(px + s * 0.485, py + s * 0.0, s * 0.03, s * 0.1); circ(c, px + s * 0.5, py + s * 0.0, s * 0.035, '#e8c24a');
    c.fillStyle = '#3a2814'; c.fillRect(px + s * 0.43, py + s * 0.64, s * 0.14, s * 0.3);
    c.fillStyle = '#ffd86a'; c.fillRect(px + s * 0.2, py + s * 0.5, s * 0.07, s * 0.1); c.fillRect(px + s * 0.73, py + s * 0.5, s * 0.07, s * 0.1);
  } else if (type === 'fortress') {
    c.fillStyle = grad(c, px, py, px + s, py + s, '#a8a8b0', '#6c6c74'); rrect(c, px + s * 0.08, py + s * 0.16, s * 0.84, s * 0.8, s * 0.03); c.fill();
    c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(px + s * 0.08, py + s * 0.72, s * 0.84, s * 0.24);
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(px + s * 0.08, py + s * (0.16 + i * 0.13)); c.lineTo(px + s * 0.92, py + s * (0.16 + i * 0.13)); c.stroke(); }
    [[0.12, 0.2], [0.88, 0.2], [0.12, 0.88], [0.88, 0.88]].forEach(([a, bb]) => { circ(c, px + s * a, py + s * bb, s * 0.13, grad(c, px + s * (a - 0.12), py, px + s * (a + 0.12), py, '#b8b8c0', '#7a7a82')); c.fillStyle = '#5c5c64'; for (let k = 0; k < 4; k++) c.fillRect(px + s * (a - 0.12 + k * 0.065), py + s * (bb - 0.17), s * 0.04, s * 0.06); });
    c.fillStyle = '#7a7a82'; c.fillRect(px + s * 0.3, py + s * 0.04, s * 0.4, s * 0.3); c.fillStyle = col; c.fillRect(px + s * 0.3, py + s * 0.16, s * 0.4, s * 0.05);
    c.fillStyle = '#1a1a1e'; for (let k = 0; k < 3; k++) c.fillRect(px + s * (0.36 + k * 0.12), py + s * 0.24, s * 0.06, s * 0.05);
    c.fillStyle = '#2a1a08'; c.beginPath(); c.moveTo(px + s * 0.4, py + s * 0.96); c.lineTo(px + s * 0.4, py + s * 0.7); c.arc(px + s * 0.5, py + s * 0.7, s * 0.1, Math.PI, 0); c.lineTo(px + s * 0.6, py + s * 0.96); c.closePath(); c.fill();
    c.fillStyle = '#222'; for (const k of [0.25, 0.75]) { c.fillRect(px + s * (k - 0.05), py + s * 0.5, s * 0.1, s * 0.05); }
    flag(c, px + s * 0.5, py + s * 0.06, s * 0.22, cl, t, b.id, 1);
  } else if (type === 'airfield') {
    c.fillStyle = '#4a4d54'; c.fillRect(px + s * 0.02, py + s * 0.02, s * 0.96, s * 0.96);
    c.fillStyle = 'rgba(0,0,0,.2)'; for (let i = 0; i < 6; i++) c.fillRect(px + s * 0.02, py + s * (0.02 + i * 0.16), s * 0.96, s * 0.01);
    c.fillStyle = '#e8e8e8'; for (let i = 0; i < 6; i++) c.fillRect(px + s * (0.1 + i * 0.15), py + s * 0.72, s * 0.08, s * 0.025);
    c.fillStyle = '#d8b838'; c.fillRect(px + s * 0.02, py + s * 0.64, s * 0.96, s * 0.015); c.fillRect(px + s * 0.02, py + s * 0.88, s * 0.96, s * 0.015);
    c.fillStyle = grad(c, px, py, px + s, py, '#a0a6ae', '#6a7078'); c.beginPath(); c.moveTo(px + s * 0.08, py + s * 0.6); c.lineTo(px + s * 0.08, py + s * 0.3); c.quadraticCurveTo(px + s * 0.4, py - s * 0.05, px + s * 0.72, py + s * 0.3); c.lineTo(px + s * 0.72, py + s * 0.6); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 1; for (let i = 1; i < 6; i++) { const xx = px + s * (0.08 + i * 0.107); c.beginPath(); c.moveTo(xx, py + s * 0.6); c.lineTo(xx, py + s * 0.2); c.stroke(); }
    c.fillStyle = '#1a1c20'; c.fillRect(px + s * 0.22, py + s * 0.38, s * 0.3, s * 0.22); c.fillStyle = col; c.fillRect(px + s * 0.08, py + s * 0.56, s * 0.64, s * 0.04);
    c.fillStyle = '#c8ccd2'; c.fillRect(px + s * 0.84, py + s * 0.1, s * 0.02, s * 0.22); c.fillStyle = Math.sin(t * 5 + b.id) > 0 ? '#ff4030' : '#702018'; circ(c, px + s * 0.85, py + s * 0.09, s * 0.03, c.fillStyle);
    flag(c, px + s * 0.92, py + s * 0.34, s * 0.16, cl, t, b.id, 1);
  } else if (type === 'sam') {
    c.fillStyle = '#5a5d64'; rrect(c, px + s * 0.08, py + s * 0.5, s * 0.84, s * 0.42, s * 0.06); c.fill(); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(px + s * 0.08, py + s * 0.76, s * 0.84, s * 0.16);
    c.fillStyle = col; c.fillRect(px + s * 0.08, py + s * 0.5, s * 0.84, s * 0.05);
    circ(c, px + s * 0.5, py + s * 0.62, s * 0.26, grad(c, px + s * 0.25, py + s * 0.4, px + s * 0.75, py + s * 0.85, '#8a9098', '#4a5058'));
    const sw = Math.sin(t * 0.8 + b.id) * 0.12; c.save(); c.translate(px + s * 0.5, py + s * 0.62); c.rotate(-0.9 + sw);
    for (const k of [-1, 1]) { c.fillStyle = '#3a3d44'; c.fillRect(-s * 0.04 + k * s * 0.12, -s * 0.5, s * 0.1, s * 0.55); c.fillStyle = '#e8e8ee'; c.fillRect(-s * 0.03 + k * s * 0.12, -s * 0.46, s * 0.08, s * 0.38); c.fillStyle = '#c04030'; c.beginPath(); c.moveTo(-s * 0.03 + k * s * 0.12, -s * 0.46); c.lineTo(s * 0.01 + k * s * 0.12, -s * 0.56); c.lineTo(s * 0.05 + k * s * 0.12, -s * 0.46); c.fill(); }
    c.restore();
  } else if (type === 'gradar') {
    c.fillStyle = grad(c, px, py, px + s, py, '#aab0b8', '#6a7078'); rrect(c, px + s * 0.12, py + s * 0.55, s * 0.76, s * 0.4, s * 0.04); c.fill();
    c.fillStyle = '#3a3f46'; c.fillRect(px + s * 0.22, py + s * 0.72, s * 0.56, s * 0.1); c.fillStyle = col; c.fillRect(px + s * 0.12, py + s * 0.55, s * 0.76, s * 0.05);
    c.fillStyle = '#4a4f56'; c.fillRect(px + s * 0.46, py + s * 0.32, s * 0.08, s * 0.26);
    c.save(); c.translate(px + s * 0.5, py + s * 0.3); c.rotate(Math.sin(t * 0.7 + b.id) * 0.5 - 0.5);
    c.fillStyle = grad(c, -s * 0.4, 0, s * 0.4, 0, '#f0f3f7', '#98a0aa'); c.beginPath(); c.ellipse(0, 0, s * 0.42, s * 0.2, 0, 0, 6.283); c.fill(); c.strokeStyle = '#5a5f68'; c.lineWidth = 1.5; c.stroke();
    c.strokeStyle = '#6a707a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, 0); c.lineTo(s * 0.3, -s * 0.28); c.stroke(); circ(c, s * 0.3, -s * 0.28, s * 0.035, '#ff4030'); c.restore();
    c.globalCompositeOperation = 'lighter'; const rr = (t * 0.6 + b.id) % 1; c.strokeStyle = `rgba(110,200,255,${(1 - rr) * 0.45})`; c.lineWidth = 2; c.beginPath(); c.arc(px + s * 0.5, py + s * 0.3, s * (0.3 + rr * 0.6), 0, 6.283); c.stroke(); c.globalCompositeOperation = 'source-over';
  } else if (type === 'radar') {
    c.fillStyle = grad(c, px, py, px + s, py, '#9aa0a8', '#60666e'); c.fillRect(px + s * 0.3, py + s * 0.42, s * 0.4, s * 0.5);
    c.fillStyle = '#4a4f56'; c.fillRect(px + s * 0.18, py + s * 0.82, s * 0.64, s * 0.14); c.fillStyle = col; c.fillRect(px + s * 0.3, py + s * 0.6, s * 0.4, s * 0.05);
    c.save(); c.translate(px + s * 0.5, py + s * 0.38); const a2 = Math.cos(t * 1.6 + b.id); c.scale(a2, 1);
    c.fillStyle = grad(c, -s * 0.4, 0, s * 0.4, 0, '#e0e4ea', '#9aa0a8'); c.beginPath(); c.ellipse(0, 0, s * 0.42, s * 0.2, 0, 0, 6.283); c.fill(); c.strokeStyle = '#5a5f68'; c.lineWidth = 1.5; c.stroke(); c.restore();
    c.fillStyle = '#5a5f68'; c.fillRect(px + s * 0.48, py + s * 0.1, s * 0.04, s * 0.3); circ(c, px + s * 0.5, py + s * 0.1, s * 0.05, Math.sin(t * 4 + b.id) > 0 ? '#ff4030' : '#702018');
  } else if (type === 'tower') {
    ell(c, px + s * 0.55, py + s * 0.92, s * 0.5, s * 0.12, 0, 'rgba(0,0,0,.25)');
    c.fillStyle = grad(c, px + s * 0.2, py, px + s * 0.8, py, '#c4b48c', '#8a7a58'); c.fillRect(px + s * 0.2, py + s * 0.2, s * 0.6, s * 0.72);
    ell(c, px + s * 0.5, py + s * 0.92, s * 0.3, s * 0.08, 0, '#8a7a58');
    c.fillStyle = '#9c8c64'; ell(c, px + s * 0.5, py + s * 0.2, s * 0.34, s * 0.1, 0, '#b8a878');
    c.fillStyle = '#6a5a3a'; for (let i = 0; i < 5; i++) c.fillRect(px + s * (0.16 + i * 0.14), py + s * 0.1, s * 0.09, s * 0.12);
    c.fillStyle = '#1a1208'; c.fillRect(px + s * 0.46, py + s * 0.4, s * 0.08, s * 0.2);
    c.fillStyle = col; c.fillRect(px + s * 0.2, py + s * 0.66, s * 0.6, s * 0.06);
    flag(c, px + s * 0.5, py + s * 0.1, s * 0.34, cl, t, b.id, 1);
  }
}
function scaffold(c, px, py, s, prog) {
  c.save(); c.globalAlpha = 0.9; c.strokeStyle = '#a07840'; c.lineWidth = Math.max(2, s * 0.025);
  c.strokeRect(px + 2, py + 2, s - 4, s - 4);
  c.beginPath(); for (let i = 1; i < 4; i++) { c.moveTo(px + 2, py + s * i / 4); c.lineTo(px + s * i / 4, py + 2); c.moveTo(px + s - 2, py + s * i / 4); c.lineTo(px + s - s * i / 4, py + s - 2); }
  c.stroke(); c.restore();
}
function drawSpecial(c, V, b, px, py, s, col) {
  const t = V.time;
  if (b.type === 'wall') {
    c.fillStyle = grad(c, px, py, px, py + s, '#a6a6ae', '#7a7a82'); c.fillRect(px, py, s, s);
    c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(px, py, s, s * 0.22);
    c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(px, py + s * 0.7, s, s * 0.3);
    c.strokeStyle = 'rgba(0,0,0,.28)'; c.lineWidth = 1; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(px, py + s * i / 4); c.lineTo(px + s, py + s * i / 4); c.stroke(); c.beginPath(); c.moveTo(px + s * (i % 2 ? 0.3 : 0.7), py + s * (i - 1) / 4); c.lineTo(px + s * (i % 2 ? 0.3 : 0.7), py + s * i / 4); c.stroke(); }
    c.fillStyle = '#6f6f76'; for (let i = 0; i < 3; i++) c.fillRect(px + s * (0.08 + i * 0.32), py - s * 0.1, s * 0.22, s * 0.16);
    c.fillStyle = col; c.fillRect(px, py + s * 0.3, s, s * 0.07);
  } else if (b.type === 'gate') {
    c.fillStyle = grad(c, px, py, px, py + s, '#a6a6ae', '#7a7a82'); c.fillRect(px, py, s, s);
    c.fillStyle = '#4a3018'; c.beginPath(); c.moveTo(px + s * 0.14, py + s); c.lineTo(px + s * 0.14, py + s * 0.42); c.arc(px + s / 2, py + s * 0.42, s * 0.36, Math.PI, 0); c.lineTo(px + s * 0.86, py + s); c.closePath(); c.fill();
    c.strokeStyle = '#2a1a08'; c.lineWidth = 1.5; for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(px + s * (0.14 + 0.72 * i / 5), py + s * 0.2); c.lineTo(px + s * (0.14 + 0.72 * i / 5), py + s); c.stroke(); }
    c.strokeStyle = '#c9a24a'; c.lineWidth = 2; c.beginPath(); c.moveTo(px + s * 0.14, py + s * 0.62); c.lineTo(px + s * 0.86, py + s * 0.62); c.stroke();
    c.fillStyle = col; c.fillRect(px, py, s, s * 0.13);
  } else if (b.type === 'bridge') {
    c.fillStyle = grad(c, px, py, px, py + s, '#a87c48', '#8a5e30'); c.fillRect(px, py, s, s);
    c.strokeStyle = '#5a3a1a'; c.lineWidth = 1.5; const n = 10;
    for (let i = 1; i < n; i++) { c.beginPath(); c.moveTo(px + s * i / n, py); c.lineTo(px + s * i / n, py + s); c.stroke(); }
    c.fillStyle = '#4a3218'; c.fillRect(px, py, s, s * 0.07); c.fillRect(px, py + s * 0.93, s, s * 0.07);
    c.fillStyle = '#6a4a28'; for (const k of [0.02, 0.5, 0.94]) { c.fillRect(px + s * k, py - s * 0.03, s * 0.06, s * 0.12); c.fillRect(px + s * k, py + s * 0.91, s * 0.06, s * 0.12); }
    c.fillStyle = col; c.fillRect(px + s * 0.46, py, s * 0.08, s * 0.07);
  } else if (b.type === 'mine') {
    const own = b.owner === V.ME;
    circ(c, px + s / 2, py + s / 2, s * 0.3, own ? 'rgba(30,30,34,.92)' : 'rgba(150,30,30,.9)');
    c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 1.2; c.beginPath(); c.arc(px + s / 2, py + s / 2, s * 0.22, 0, 6.283); c.stroke();
    circ(c, px + s / 2, py + s / 2, s * 0.09, Math.sin(t * 6) > 0 ? '#ff3b30' : '#661a16');
    if (!own) { c.strokeStyle = `rgba(255,60,50,${0.5 + 0.3 * Math.sin(t * 6)})`; c.lineWidth = 2; c.beginPath(); c.arc(px + s / 2, py + s / 2, s * (0.4 + 0.1 * Math.sin(t * 6)), 0, 6.283); c.stroke(); }
  }
}
// çağa göre bina görünümü: renk tonu, çağ simgesi, baca/anten
const AGE_TINT = [null, 'rgb(205,190,225)', 'rgb(170,165,155)', 'rgb(150,185,215)'], AGE_ICON = ['', '🔫', '⚙️', '🛰️'];
function drawAgeLook(c, age, b, px, py, s, t, ts) {
  if (age <= 0) return;
  c.save(); c.beginPath(); c.rect(px, py, s, s); c.clip(); c.globalCompositeOperation = 'multiply'; c.fillStyle = AGE_TINT[age]; c.fillRect(px, py, s, s); c.restore();
  c.save(); c.lineWidth = Math.max(1.5, ts * 0.05); c.strokeStyle = ['', '#8c6a9c', '#8d8d93', '#58b4ff'][age]; c.strokeRect(px + 1, py + 1, s - 2, s - 2); c.restore();
  if (age >= 2) { c.fillStyle = '#4a4a50'; c.fillRect(px + s * 0.78, py + s * 0.02, s * 0.1, s * 0.22); if (rnd() < 0.12) smokeAt(b.tx + BLD[b.type].s * 0.83, b.ty - 0.1, 1, 0.2, 0.5); }
  if (age >= 3) { c.strokeStyle = '#cfd6dc'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(px + s * 0.14, py + s * 0.2); c.lineTo(px + s * 0.14, py - s * 0.12); c.stroke(); circ(c, px + s * 0.14, py - s * 0.12, Math.max(2, s * 0.04), Math.sin(t * 4 + b.id) > 0 ? '#ff4040' : '#702020'); }
  c.font = Math.max(11, Math.round(ts * 0.34)) + 'px sans-serif'; c.textAlign = 'right'; c.textBaseline = 'bottom'; c.fillText(AGE_ICON[age], px + s - 2, py + s - 2);
}
// çağ atlayınca bina eski halinden yenisine iskeleyle dönüşür (2.6 sn)
function drawBldAged(c, V, b, px, py, s, col, cd, cl, t, d) {
  const ag = b.owner >= 0 ? V.g.owners[b.owner].age : 0;
  if (!BLDART[b.type] || b.ghost) { ageOvr = null; drawBldBody(c, V, b, px, py, s, col, cd, cl, t); return ag; }
  let st = ageSeen.get(b.id);
  if (!st) { st = { age: ag, from: ag, t: -99 }; ageSeen.set(b.id, st); }
  else if (st.age !== ag) { st.from = st.age; st.age = ag; st.t = V.time; }
  const k = (V.time - st.t) / 2.6;
  if (k < 1 && st.from < st.age) {
    ageOvr = st.from; drawBldBody(c, V, b, px, py, s, col, cd, cl, t);
    const e = 1 - (1 - k) * (1 - k);
    c.save(); c.beginPath(); c.rect(px - s * 0.3, py + s * (1 - e) - s * 0.35, s * 1.6, s * 2); c.clip(); ageOvr = st.age; drawBldBody(c, V, b, px, py, s, col, cd, cl, t); c.restore();
    ageOvr = null; scaffold(c, px, py, s, Math.min(1, e + 0.1));
    if (k < 0.12) { c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(px + s / 2, py + s / 2, 0, px + s / 2, py + s / 2, s); g.addColorStop(0, `rgba(255,240,180,${0.8 * (1 - k / 0.12)})`); g.addColorStop(1, 'rgba(255,200,80,0)'); c.fillStyle = g; c.fillRect(px - s / 2, py - s / 2, s * 2, s * 2); c.globalCompositeOperation = 'source-over'; }
    if (rnd() < 0.7) dustAt(b.tx + d.s * rnd(), b.ty + d.s * (0.2 + 0.8 * (1 - e) + 0.1 * rnd()), 2, 0.7);
    if (rnd() < 0.5) sparkAt(b.tx + d.s * rnd(), b.ty + d.s * (1 - e) + 0.05, 3, 2.2, 0.5);
    return st.from;
  }
  ageOvr = null; drawBldBody(c, V, b, px, py, s, col, cd, cl, t); return ag;
}
const BLD_LABEL = { tc: 'Şehir Merkezi', barracks: 'Kışla', stable: 'Ahır', foundry: 'Dökümhane', academy: 'Akademi', fortress: 'Tabya', tower: 'Kule', airfield: 'Hava Üssü', sam: 'Uçaksavar', radar: 'Radar', gradar: 'Küresel Radar' };
function drawLabel(c, V, b, px, py, s, col) {
  const txt = BLD_LABEL[b.type]; if (!txt || V.ts < 24) return;
  const fs = Math.round(Math.max(9, Math.min(15, V.ts * 0.27))); c.save(); c.font = `700 ${fs}px "Segoe UI",system-ui,sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
  const tw = c.measureText(txt).width, w = tw + fs * 1.1, h = fs * 1.45, x = px + s / 2 - w / 2, y = py + s - h - 2;
  c.fillStyle = 'rgba(8,10,18,.74)'; rrect(c, x, y, w, h, h / 2); c.fill(); c.strokeStyle = col; c.lineWidth = 1.4; c.stroke();
  c.fillStyle = '#f2ead2'; c.fillText(txt, px + s / 2, y + h / 2 + 0.5); c.restore();
}
function drawBld(c, V, b) {
  curCiv = b.owner >= 0 ? V.g.owners[b.owner].civ : null;
  const d = BLD[b.type], ts = V.ts, r = Sim.rectOf(b), px = (r.x0 - V.cam.x) * ts, py = (r.y0 - V.cam.y) * ts, s = d.s * ts, t = V.time;
  const col = b.owner >= 0 ? TEAM[b.owner] : '#999', cd = b.owner >= 0 ? TEAM_D[b.owner] : '#666', cl = b.owner >= 0 ? TEAM_L[b.owner] : '#ccc';
  if (b.type !== 'mine') { c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.moveTo(px + s * 0.1, py + s); c.lineTo(px + s * 1.12, py + s); c.lineTo(px + s * 1.02, py + s * 0.55); c.lineTo(px + s * 0.8, py + s * 0.4); c.closePath(); c.fill(); }
  const hpf = b.hp / b.maxhp;
  if (!b.done) {
    // temel + yükselen gövde + iskele
    c.fillStyle = 'rgba(90,70,40,.5)'; c.fillRect(px + 2, py + 2, s - 4, s - 4);
    c.save(); c.beginPath(); c.rect(px - 4, py + s * (1 - b.progress) - 4, s + 8, s * b.progress + 8); c.clip();
    c.globalAlpha = 0.9; ageOvr = null; if (d.eng) drawSpecial(c, V, b, px, py, s, col); else drawBldBody(c, V, b, px, py, s, col, cd, cl, t); c.restore();
    scaffold(c, px, py, s, b.progress);
    hpBar(c, px + s / 2, py - 8, Math.max(18, s * 0.8), b.progress, '#e8c24a');
  } else {
    let shownAge = b.owner >= 0 ? V.g.owners[b.owner].age : 0;
    if (d.eng) drawSpecial(c, V, b, px, py, s, col); else shownAge = drawBldAged(c, V, b, px, py, s, col, cd, cl, t, d);
    if (b.owner >= 0 && !d.eng && b.type !== 'mine' && !BLDART[b.type]) drawAgeLook(c, shownAge, b, px, py, s, t, ts);
    if (b.type === 'tc') { const ag = V.g.owners[b.owner].age; if (ag > 0) { c.font = `${Math.max(11, ts * 0.3)}px serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ffd86a'; c.strokeStyle = '#000'; c.lineWidth = 3; const st = '★'.repeat(ag); c.strokeText(st, px + s / 2, py - 20); c.fillText(st, px + s / 2, py - 20); } }
    if (b.owner >= 0 && b.type !== 'mine' && !d.eng && b.type !== 'farm') { const gc = c.createLinearGradient(0, py + s * 0.8, 0, py + s); gc.addColorStop(0, 'rgba(0,0,0,0)'); gc.addColorStop(1, 'rgba(0,0,0,.2)'); c.fillStyle = gc; c.fillRect(px, py + s * 0.8, s, s * 0.2); }
    if (V.labels !== false && b.owner >= 0) drawLabel(c, V, b, px, py, s, col);
    if (b.type !== 'mine' && (hpf < 1 || V.selSet.has(b.id))) hpBar(c, px + s / 2, py - 7, Math.max(18, s * 0.8), hpf);
    if (hpf < 0.5 && b.type !== 'mine') { const cx = b.tx + d.s * (0.25 + rnd() * 0.5), cy = b.ty + d.s * (0.2 + rnd() * 0.5); if (rnd() < (hpf < 0.25 ? 0.5 : 0.2)) { fireAt(cx, cy, 1, 0.3); } if (rnd() < 0.25) smokeAt(cx, cy, 1, 0.22, 0.4); }
    if (b.sabo > 0) { if (rnd() < 0.3) sparkAt(b.tx + d.s * rnd(), b.ty + d.s * rnd(), 2, 2, 0.5); c.font = Math.round(s * 0.32) + 'px sans-serif'; c.textAlign = 'center'; c.fillText('⚡', px + s / 2, py + s * 0.25); }
    if (b.queue && b.queue.length && b.owner === V.ME) { const st = Sim.unitStats(V.g, b.owner, b.queue[0].type); hpBar(c, px + s / 2, py + s + 5, s * 0.7, b.queue[0].t / st.time, '#58b4ff'); }
  }
}

/* ---------- birimler ---------- */
function bzCol(civ, k) { return civ === 'bizans' ? (k ? '#4a4a6a' : '#6a6a8a') : (k ? '#5a2a22' : '#8a3a30'); }
function animOf(u, V, dt) {
  let a = anim.get(u.id);
  if (!a) { a = { x: u.x, y: u.y, ph: rnd() * 6, mv: 0, sp: 0 }; anim.set(u.id, a); }
  const dx = u.x - a.x, dy = u.y - a.y, dd = Math.hypot(dx, dy);
  a.sp = dt > 0 ? lerp(a.sp, dd / dt, 0.25) : a.sp;
  a.mv = a.sp > 0.35 ? 1 : 0; a.ph += dd * 7; a.x = u.x; a.y = u.y; a.dd = dd;
  return a;
}
function drawModern(c, V, u, a, r, t, col, cd, cl, swing, civ) {
  const type = u.type, mv = a.mv, tint = civ === 'bizans' ? ['#6a7890', '#3a4458'] : ['#7a6a44', '#463c24'];
  if (type === 'tank' || type === 'ltank' || type === 'htank') {
    const kk = type === 'ltank' ? 0.84 : type === 'htank' ? 1.12 : 1; c.save(); c.scale(kk, kk);
    for (const sg of [-1, 1]) { c.fillStyle = '#1c1c20'; rrect(c, -r * 1.2, sg * r * 0.74 - r * 0.22, r * 2.4, r * 0.44, r * 0.15); c.fill(); c.fillStyle = '#34343a'; for (let k = 0; k < 8; k++) c.fillRect(-r * 1.1 + k * r * 0.3 + ((a.ph * 0.5) % 0.3) * r, sg * r * 0.74 - r * 0.18, r * 0.09, r * 0.36); }
    c.fillStyle = grad(c, 0, -r * 0.7, 0, r * 0.7, tint[0], tint[1]); rrect(c, -r * 1.1, -r * 0.7, r * 2.2, r * 1.4, r * 0.2); c.fill();
    c.fillStyle = col; c.fillRect(-r * 1.1, -r * 0.7, r * 0.3, r * 1.4); c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 1.2; rrect(c, -r * 1.1, -r * 0.7, r * 2.2, r * 1.4, r * 0.2); c.stroke();
    const rc = swing ? swing * r * 0.4 : 0;
    c.fillStyle = '#2a2d32'; c.fillRect(r * 0.2 - rc, -r * 0.11, r * 1.75, r * 0.22); c.fillRect(r * 1.8 - rc, -r * 0.17, r * 0.22, r * 0.34);
    circ(c, r * 0.05, 0, r * 0.58, grad(c, -r * 0.5, -r * 0.5, r * 0.5, r * 0.5, '#9aa0a8', '#4a4f56')); circ(c, -r * 0.1, -r * 0.2, r * 0.17, '#2a2d32'); c.fillStyle = '#1c1c20'; c.fillRect(-r * 0.5, r * 0.15, r * 0.3, r * 0.22);
    if (swing > 0.3) { c.globalCompositeOperation = 'lighter'; const gg = c.createRadialGradient(r * 2.15, 0, 0, r * 2.15, 0, r * 1.1); gg.addColorStop(0, 'rgba(255,245,190,1)'); gg.addColorStop(1, 'rgba(255,120,20,0)'); c.fillStyle = gg; c.beginPath(); c.arc(r * 2.15, 0, r * 1.1, 0, 6.283); c.fill(); c.globalCompositeOperation = 'source-over'; }
    if (type === 'htank') { c.fillStyle = '#2a2d32'; c.fillRect(r * 0.2 - rc, -r * 0.33, r * 1.75, r * 0.16); c.fillRect(r * 1.8 - rc, -r * 0.37, r * 0.2, r * 0.24); c.fillStyle = '#474c54'; c.fillRect(-r * 1.15, -r * 0.82, r * 2.3, r * 0.1); c.fillRect(-r * 1.15, r * 0.72, r * 2.3, r * 0.1); }
    if (type === 'ltank') { c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(-r * 0.9, -r * 0.6, r * 1.8, r * 0.14); }
    c.restore();
    if (mv && rnd() < 0.15) smokeAt(u.x - Math.cos(u.face) * 1.2, u.y - Math.sin(u.face) * 1.2, 1, 0.12, 0.2);
  } else if (type === 'scout' || type === 'raider') {
    const big = type === 'raider'; for (const [wx0, wy0] of [[0.75, 0.62], [0.75, -0.62], [-0.75, 0.62], [-0.75, -0.62]]) { c.fillStyle = '#16161a'; rrect(c, r * (wx0 - 0.26), r * (wy0 - 0.17), r * (big ? 0.58 : 0.52), r * 0.34, r * 0.1); c.fill(); c.fillStyle = '#34343a'; c.fillRect(r * (wx0 - 0.2) + ((a.ph * 0.5) % 0.2) * r, r * (wy0 - 0.12), r * 0.07, r * 0.24); }
    c.fillStyle = grad(c, 0, -r * 0.6, 0, r * 0.6, tint[0], tint[1]); rrect(c, -r * 1.05, -r * 0.5, r * 2.1, r * 1.0, r * 0.2); c.fill(); c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 1.2; c.stroke(); c.fillStyle = col; c.fillRect(-r * 1.05, -r * 0.5, r * 0.28, r * 1.0);
    c.fillStyle = 'rgba(160,210,255,.8)'; rrect(c, r * 0.2, -r * 0.34, r * 0.5, r * 0.68, r * 0.08); c.fill();
    if (!big) { c.strokeStyle = '#2a2d32'; c.lineWidth = r * 0.07; c.beginPath(); c.moveTo(-r * 0.2, -r * 0.4); c.lineTo(-r * 0.2, r * 0.4); c.stroke(); const rc = swing ? swing * r * 0.15 : 0; c.fillStyle = '#25282c'; c.fillRect(-r * 0.1 - rc, -r * 0.06, r * 1.5, r * 0.12); if (swing > 0.1) { c.globalCompositeOperation = 'lighter'; circ(c, r * 1.55, 0, r * 0.3, 'rgba(255,230,150,.9)'); c.globalCompositeOperation = 'source-over'; } }
    else { c.fillStyle = '#2a2d32'; c.save(); c.translate(-r * 0.5, 0); c.rotate(-0.0); c.fillRect(-r * 0.2, -r * 0.4, r * 0.9, r * 0.8); c.fillStyle = '#d8dce4'; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { circ(c, r * (0.05 + i * 0.4), r * (-0.2 + j * 0.4), r * 0.1, '#1a1c20'); } c.restore(); if (swing > 0.2) { c.globalCompositeOperation = 'lighter'; circ(c, r * 0.5, 0, r * 0.45, 'rgba(255,200,120,.8)'); c.globalCompositeOperation = 'source-over'; } c.fillStyle = '#e8c24a'; c.fillRect(r * 0.9, -r * 0.08, r * 0.5, r * 0.16); }
    if (mv && rnd() < 0.3) dustAt(u.x - Math.cos(u.face) * 1.0, u.y - Math.sin(u.face) * 1.0 + 0.15, 1, 0.35);
  } else if (type === 'howitzer') {
    for (const sg of [-1, 1]) { c.fillStyle = '#1c1c20'; rrect(c, -r * 1.05, sg * r * 0.66 - r * 0.2, r * 2.1, r * 0.4, r * 0.14); c.fill(); }
    c.fillStyle = grad(c, 0, -r * 0.6, 0, r * 0.6, tint[0], tint[1]); rrect(c, -r * 1.0, -r * 0.62, r * 2.0, r * 1.24, r * 0.16); c.fill(); c.fillStyle = col; c.fillRect(-r * 1.0, -r * 0.62, r * 0.26, r * 1.24);
    c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 1.2; rrect(c, -r * 1.0, -r * 0.62, r * 2.0, r * 1.24, r * 0.16); c.stroke();
    const rc = swing ? swing * r * 0.8 : 0; c.fillStyle = '#2a2d32'; c.fillRect(-r * 0.1 - rc, -r * 0.14, r * 2.7, r * 0.28); c.fillStyle = '#1c1c20'; c.fillRect(r * 2.4 - rc, -r * 0.22, r * 0.3, r * 0.44);
    circ(c, 0, 0, r * 0.55, grad(c, -r * 0.4, -r * 0.4, r * 0.4, r * 0.4, '#8f959d', '#464b52'));
    if (swing > 0.25) { c.globalCompositeOperation = 'lighter'; const gg = c.createRadialGradient(r * 2.8, 0, 0, r * 2.8, 0, r * 1.2); gg.addColorStop(0, 'rgba(255,245,190,1)'); gg.addColorStop(1, 'rgba(255,120,20,0)'); c.fillStyle = gg; c.beginPath(); c.arc(r * 2.8, 0, r * 1.2, 0, 6.283); c.fill(); c.globalCompositeOperation = 'source-over'; }
    if (mv && rnd() < 0.12) smokeAt(u.x - Math.cos(u.face) * 1.1, u.y - Math.sin(u.face) * 1.1, 1, 0.12, 0.2);
  } else if (type === 'flak') {
    for (const sg of [-1, 1]) { c.fillStyle = '#1c1c20'; rrect(c, -r * 1.0, sg * r * 0.7 - r * 0.2, r * 2.0, r * 0.4, r * 0.14); c.fill(); }
    c.fillStyle = grad(c, 0, -r * 0.6, 0, r * 0.6, tint[0], tint[1]); rrect(c, -r * 0.95, -r * 0.62, r * 1.9, r * 1.24, r * 0.16); c.fill(); c.fillStyle = col; c.fillRect(-r * 0.95, -r * 0.62, r * 0.26, r * 1.24);
    c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 1.2; rrect(c, -r * 0.95, -r * 0.62, r * 1.9, r * 1.24, r * 0.16); c.stroke();
    circ(c, -r * 0.1, 0, r * 0.5, grad(c, -r * 0.4, -r * 0.4, r * 0.4, r * 0.4, '#9aa0a8', '#4a4f56'));
    const rc = swing ? swing * r * 0.35 : 0; c.fillStyle = '#25282c'; c.fillRect(r * 0.1 - rc, -r * 0.34, r * 1.7, r * 0.14); c.fillRect(r * 0.1 - rc, r * 0.2, r * 1.7, r * 0.14);
    const ang = V.time * 4 + u.id; c.save(); c.translate(-r * 0.35, 0); c.rotate(ang); c.strokeStyle = '#d0d4d8'; c.lineWidth = r * 0.07; c.beginPath(); c.moveTo(-r * 0.3, 0); c.lineTo(r * 0.3, 0); c.stroke(); c.restore();
    if (swing > 0.1) { c.globalCompositeOperation = 'lighter'; circ(c, r * 1.9, -r * 0.27, r * 0.35, 'rgba(255,230,150,.9)'); circ(c, r * 1.9, r * 0.27, r * 0.35, 'rgba(255,230,150,.9)'); c.globalCompositeOperation = 'source-over'; }
  } else if (type === 'heli') {
    c.strokeStyle = '#2a2d32'; c.lineWidth = r * 0.12; c.beginPath(); c.moveTo(-r * 0.8, -r * 0.55); c.lineTo(r * 0.7, -r * 0.55); c.moveTo(-r * 0.8, r * 0.55); c.lineTo(r * 0.7, r * 0.55); c.stroke();
    c.fillStyle = '#3a3d44'; c.fillRect(-r * 2.1, -r * 0.08, r * 1.2, r * 0.16); c.fillRect(-r * 2.2, -r * 0.35, r * 0.1, r * 0.7);
    c.fillStyle = grad(c, 0, -r * 0.5, 0, r * 0.5, tint[0], tint[1]); ell(c, -r * 0.1, 0, r * 1.15, r * 0.5, 0, c.fillStyle); c.fillStyle = col; c.fillRect(-r * 0.9, -r * 0.1, r * 0.8, r * 0.2);
    ell(c, r * 0.7, 0, r * 0.45, r * 0.32, 0, 'rgba(150,200,240,.9)'); c.fillStyle = '#25282c'; c.fillRect(-r * 0.2, -r * 0.8, r * 0.6, r * 0.22); c.fillRect(-r * 0.2, r * 0.58, r * 0.6, r * 0.22);
    const ang = V.time * 38; c.fillStyle = 'rgba(220,230,255,.14)'; c.beginPath(); c.arc(-r * 0.1, 0, r * 2.0, 0, 6.283); c.fill();
    c.strokeStyle = 'rgba(30,34,40,.8)'; c.lineWidth = r * 0.1; for (let k = 0; k < 2; k++) { const aa = ang + k * Math.PI / 2; c.beginPath(); c.moveTo(-r * 0.1 - Math.cos(aa) * r * 2.0, -Math.sin(aa) * r * 2.0); c.lineTo(-r * 0.1 + Math.cos(aa) * r * 2.0, Math.sin(aa) * r * 2.0); c.stroke(); }
    circ(c, -r * 0.1, 0, r * 0.12, '#111');
    if (swing > 0.2) { c.globalCompositeOperation = 'lighter'; circ(c, r * 1.3, 0, r * 0.45, 'rgba(255,230,150,.9)'); c.globalCompositeOperation = 'source-over'; }
  } else if (type === 'fighter') {
    c.fillStyle = grad(c, 0, -r * 1.3, 0, r * 1.3, '#9aa0a8', '#5a5f68'); c.beginPath(); c.moveTo(r * 1.9, 0); c.lineTo(r * 0.1, -r * 0.35); c.lineTo(-r * 0.9, -r * 1.55); c.lineTo(-r * 1.15, -r * 1.4); c.lineTo(-r * 0.7, -r * 0.3); c.lineTo(-r * 1.4, -r * 0.5); c.lineTo(-r * 1.5, 0); c.lineTo(-r * 1.4, r * 0.5); c.lineTo(-r * 0.7, r * 0.3); c.lineTo(-r * 1.15, r * 1.4); c.lineTo(-r * 0.9, r * 1.55); c.lineTo(r * 0.1, r * 0.35); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 1.2; c.stroke(); ell(c, r * 0.55, 0, r * 0.45, r * 0.16, 0, 'rgba(120,190,255,.95)'); c.fillStyle = col; c.fillRect(-r * 1.35, -r * 0.5, r * 0.25, r * 0.12); c.fillRect(-r * 1.35, r * 0.38, r * 0.25, r * 0.12); c.fillRect(-r * 0.5, -r * 1.2, r * 0.18, r * 0.1); c.fillRect(-r * 0.5, r * 1.1, r * 0.18, r * 0.1);
    c.globalCompositeOperation = 'lighter'; const fl = 0.7 + Math.sin(V.time * 40 + u.id) * 0.3; const gg = c.createLinearGradient(-r * 1.5, 0, -r * 2.6, 0); gg.addColorStop(0, `rgba(255,200,100,${0.9 * fl})`); gg.addColorStop(1, 'rgba(255,80,0,0)'); c.fillStyle = gg; c.fillRect(-r * 2.6, -r * 0.16, r * 1.1, r * 0.32); c.globalCompositeOperation = 'source-over';
  } else if (type === 'bomber') {
    c.fillStyle = grad(c, 0, -r, 0, r, '#8a8f98', '#50555e'); ell(c, 0, 0, r * 1.9, r * 0.42, 0, c.fillStyle);
    c.beginPath(); c.moveTo(r * 0.5, -r * 0.2); c.lineTo(-r * 0.4, -r * 2.2); c.lineTo(-r * 0.9, -r * 2.2); c.lineTo(-r * 0.7, -r * 0.2); c.closePath(); c.fill(); c.beginPath(); c.moveTo(r * 0.5, r * 0.2); c.lineTo(-r * 0.4, r * 2.2); c.lineTo(-r * 0.9, r * 2.2); c.lineTo(-r * 0.7, r * 0.2); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(-r * 1.5, -r * 0.1); c.lineTo(-r * 1.9, -r * 0.8); c.lineTo(-r * 2.1, -r * 0.8); c.lineTo(-r * 1.9, -r * 0.1); c.closePath(); c.fill(); c.beginPath(); c.moveTo(-r * 1.5, r * 0.1); c.lineTo(-r * 1.9, r * 0.8); c.lineTo(-r * 2.1, r * 0.8); c.lineTo(-r * 1.9, r * 0.1); c.closePath(); c.fill();
    for (const sg of [-1, 1]) for (const px of [-0.2, -0.65]) { circ(c, r * px, sg * r * (px < -0.4 ? 1.3 : 0.8), r * 0.2, '#2a2d32'); circ(c, r * px, sg * r * (px < -0.4 ? 1.3 : 0.8), r * 0.1, `rgba(200,220,255,${0.4 + 0.3 * Math.sin(V.time * 50 + u.id)})`); }
    ell(c, r * 1.35, 0, r * 0.4, r * 0.2, 0, 'rgba(120,190,255,.9)'); c.fillStyle = col; c.fillRect(-r * 1.0, -r * 0.14, r * 0.5, r * 0.28);
    if (swing > 0.1) circ(c, 0, 0, r * 0.2, '#111');
  } else if (type === 'iha' || type === 'siha') {
    const big = type === 'siha';
    c.fillStyle = grad(c, 0, -r, 0, r, '#c8ccd2', '#7a8088'); ell(c, 0, 0, r * 1.4, r * 0.2, 0, c.fillStyle);
    c.beginPath(); c.moveTo(r * 0.2, -r * 0.1); c.lineTo(-r * 0.2, -r * (big ? 1.7 : 1.4)); c.lineTo(-r * 0.6, -r * (big ? 1.7 : 1.4)); c.lineTo(-r * 0.5, -r * 0.1); c.closePath(); c.fill(); c.beginPath(); c.moveTo(r * 0.2, r * 0.1); c.lineTo(-r * 0.2, r * (big ? 1.7 : 1.4)); c.lineTo(-r * 0.6, r * (big ? 1.7 : 1.4)); c.lineTo(-r * 0.5, r * 0.1); c.closePath(); c.fill();
    c.fillStyle = '#7a8088'; c.fillRect(-r * 1.4, -r * 0.6, r * 0.12, r * 1.2); c.fillStyle = col; c.fillRect(-r * 0.9, -r * 0.1, r * 0.35, r * 0.2);
    circ(c, r * 1.05, r * 0.05, r * 0.14, '#222');
    if (big) { c.fillStyle = '#3a3d44'; for (const sg of [-1, 1]) { c.fillRect(-r * 0.4, sg * r * 0.8 - r * 0.07, r * 0.8, r * 0.14); c.fillStyle = '#c04030'; c.fillRect(r * 0.4, sg * r * 0.8 - r * 0.05, r * 0.1, r * 0.1); c.fillStyle = '#3a3d44'; } }
    const pa = V.time * 60; c.strokeStyle = 'rgba(40,44,50,.7)'; c.lineWidth = r * 0.08; c.beginPath(); c.moveTo(-r * 1.45, Math.sin(pa) * r * 0.5); c.lineTo(-r * 1.45, -Math.sin(pa) * r * 0.5); c.stroke();
    if (swing > 0.3) { c.globalCompositeOperation = 'lighter'; circ(c, r * 0.5, 0, r * 0.4, 'rgba(255,200,120,.9)'); c.globalCompositeOperation = 'source-over'; }
  }
}
function drawUnit(c, V, u, dt) {
  const a = animOf(u, V, dt), ts = V.ts, x = (u.x - V.cam.x) * ts, y = (u.y - V.cam.y) * ts, r = u.st.r * ts * (u.st.air || u.st.vehicle || u.st.siege ? 1 : 1.22), t = V.time;
  const col = TEAM[u.owner], cd = TEAM_D[u.owner], cl = TEAM_L[u.owner], mv = a.mv, ph = a.ph, civ = V.g.owners[u.owner].civ;
  const lift = u.st.air ? (u.st.alt || 1) * ts * (0.92 + 0.08 * Math.sin(t * 2 + u.id)) : 0;
  const bob = u.st.air ? 0 : (mv ? Math.abs(Math.sin(ph)) * r * 0.13 : Math.sin(t * 2 + u.id) * r * 0.025);
  const swing = u.cd > u.st.rate - 0.22 ? clamp((u.cd - (u.st.rate - 0.22)) / 0.22, 0, 1) : 0;
  const leg = Math.sin(ph) * r * 0.42;
  if (u.st.air) ell(c, x + lift * 0.28, y + r * 0.5 + lift * 0.12, r * 1.3, r * 0.5, 0, 'rgba(0,0,0,.22)');
  else ell(c, x + r * 0.28, y + r * 0.6, r * (['cav', 'hcav', 'harcher', 'dragoon', 'hero'].includes(u.type) ? 1.5 : 1.0), r * (['cav', 'hcav', 'harcher', 'dragoon', 'hero'].includes(u.type) ? 0.5 : 0.4), 0, 'rgba(0,0,0,.32)');
  if (u.st.air && mv && dt > 0 && (u.type === 'fighter' || u.type === 'bomber' || u.type === 'siha') && rnd() < dt * 14) P({ type: 'smoke', x: u.x - Math.cos(u.face) * 0.7, y: u.y - Math.sin(u.face) * 0.7, z: u.st.alt, life: 0.7, size: 0.07, vz: 0 });

  if (u.type === 'hero') { const ar = (u.st.auraR || 6) * ts, pu = 0.18 + 0.08 * Math.sin(t * 3); c.save(); c.strokeStyle = `rgba(255,214,90,${pu})`; c.lineWidth = 2; c.setLineDash([8, 10]); c.lineDashOffset = -t * 18; c.beginPath(); c.arc(x, y, ar, 0, 6.283); c.stroke(); c.setLineDash([]); const gg = c.createRadialGradient(x, y, ar * 0.5, x, y, ar); gg.addColorStop(0, 'rgba(255,214,90,0)'); gg.addColorStop(1, `rgba(255,214,90,${pu * 0.35})`); c.fillStyle = gg; c.beginPath(); c.arc(x, y, ar, 0, 6.283); c.fill(); c.restore(); }
  if (mv && (u.type === 'cav' || u.type === 'dog' || u.type === 'hero' || u.type === 'hcav' || u.type === 'harcher' || u.type === 'dragoon') && rnd() < 0.2) dustAt(u.x - Math.cos(u.face) * 0.3, u.y - Math.sin(u.face) * 0.3 + 0.2, 1, 0.3);
  if (window.Spr && Spr.handles(u.type)) { Spr.unit(c, V, u, { x, y: y - lift, r, a, col, cd, cl, civ, swing, t, low }); } else {
  c.save(); c.translate(x, y - bob - lift); c.rotate(u.face);
  const stk = (w, col2) => { c.strokeStyle = col2; c.lineWidth = Math.max(1.2, w); c.lineCap = 'round'; };
  // atlı birimler için ortak at çizimi
  const horse = (c0, c1, plate) => {
    stk(r * 0.2, '#241810'); for (let i = 0; i < 4; i++) { const sg = i < 2 ? 1 : -1, off = (i % 2 ? 1 : -1) * leg * sg; c.beginPath(); c.moveTo(r * (i < 2 ? 0.9 : -0.8), (i % 2 ? 0.4 : -0.4) * r); c.lineTo(r * (i < 2 ? 0.9 : -0.8) + off, (i % 2 ? 0.55 : -0.55) * r + off * 0.2); c.stroke(); }
    ell(c, 0, 0, r * 1.38, r * 0.64, 0, grad(c, 0, -r * 0.6, 0, r * 0.6, c0, c1));
    c.strokeStyle = c1; c.lineWidth = r * 0.28; c.beginPath(); c.moveTo(-r * 1.28, 0); c.lineTo(-r * 1.8, Math.sin(t * 8 + u.id) * r * 0.28); c.stroke();
    ell(c, r * 1.28, 0, r * 0.5, r * 0.33, 0, c0); circ(c, r * 1.52, -r * 0.14, r * 0.06, '#111');
    if (plate) { c.fillStyle = col; c.fillRect(-r * 0.95, -r * 0.62, r * 1.5, r * 1.24); c.fillStyle = '#b8bcc6'; for (let i = 0; i < 4; i++) c.fillRect(-r * 0.9 + i * r * 0.38, -r * 0.62, r * 0.12, r * 1.24); c.fillStyle = '#d8dce4'; ell(c, r * 1.3, 0, r * 0.34, r * 0.22, 0, '#c8ccd6'); }
  };
  if (u.st.air || u.type === 'tank' || u.type === 'ltank' || u.type === 'htank' || u.type === 'howitzer' || u.type === 'flak' || u.type === 'scout' || u.type === 'raider') drawModern(c, V, u, a, r, t, col, cd, cl, swing, civ);
  else if (u.type === 'hcav') {
    const bz = civ === 'bizans'; horse(bz ? '#d8d8d4' : '#3a2e2a', bz ? '#a8a8a6' : '#1a1412', true);
    circ(c, 0, 0, r * 0.5, grad(c, -r * 0.4, -r * 0.4, r * 0.4, r * 0.4, '#e4e8f0', '#6a7280')); circ(c, r * 0.16, 0, r * 0.3, '#aeb4c0'); c.fillStyle = col; c.beginPath(); c.moveTo(-r * 0.05, 0); c.quadraticCurveTo(-r * 0.6, -r * 0.34, -r * 0.85, 0); c.quadraticCurveTo(-r * 0.6, r * 0.34, -r * 0.05, 0); c.fill(); c.fillStyle = '#1a1c22'; c.fillRect(r * 0.28, -r * 0.07, r * 0.1, r * 0.14);
    circ(c, r * 0.2, r * 0.62, r * 0.34, col); circ(c, r * 0.2, r * 0.62, r * 0.14, '#e8e8ee'); c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 1.2; c.beginPath(); c.arc(r * 0.2, r * 0.62, r * 0.34, 0, 6.283); c.stroke();
    c.save(); c.translate(r * 0.4, -r * 0.4); c.rotate(-0.15 + swing * 0.6); stk(r * 0.1, '#6a4a28'); c.beginPath(); c.moveTo(-r * 0.6, 0); c.lineTo(r * 2.7, 0); c.stroke(); c.fillStyle = '#e6e6ee'; c.beginPath(); c.moveTo(r * 2.7, -r * 0.08); c.lineTo(r * 3.1, 0); c.lineTo(r * 2.7, r * 0.08); c.closePath(); c.fill(); c.fillStyle = col; c.beginPath(); c.moveTo(r * 2.0, 0); c.lineTo(r * 1.5, -r * 0.3); c.lineTo(r * 1.5, 0); c.fill(); c.restore();
  }
  else if (u.type === 'harcher') {
    const bz = civ === 'bizans'; horse(bz ? '#c8b48c' : '#a8845a', bz ? '#7a6a4a' : '#5a4228', false);
    c.fillStyle = col; c.fillRect(-r * 0.7, -r * 0.5, r * 1.3, r * 1.0); circ(c, 0, 0, r * 0.45, '#8a6a42'); circ(c, r * 0.12, 0, r * 0.26, col); circ(c, r * 0.18, 0, r * 0.15, '#e8bf98');
    c.fillStyle = '#4a3220'; c.fillRect(-r * 0.7, r * 0.25, r * 0.5, r * 0.22);
    const pull = swing ? swing * r * 0.3 : 0; c.strokeStyle = '#8a5a2a'; c.lineWidth = Math.max(2, r * 0.12); c.beginPath(); c.arc(r * 0.85, 0, r * 0.95, -1.1, 1.1); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1; c.beginPath(); c.moveTo(r * 0.85 + Math.cos(-1.1) * r * 0.95, Math.sin(-1.1) * r * 0.95); c.lineTo(r * 0.85 + r * 0.38 - pull, 0); c.lineTo(r * 0.85 + Math.cos(1.1) * r * 0.95, Math.sin(1.1) * r * 0.95); c.stroke();
  }
  else if (u.type === 'dragoon') {
    const bz = civ === 'bizans'; horse(bz ? '#7a6a5a' : '#4a3a30', bz ? '#4a3e34' : '#241a14', false);
    c.fillStyle = bz ? '#4a5a8a' : '#a83a3a'; c.fillRect(-r * 0.7, -r * 0.5, r * 1.3, r * 1.0); c.fillStyle = '#e8e8ee'; c.fillRect(-r * 0.1, -r * 0.48, r * 0.1, r * 0.96);
    circ(c, 0, 0, r * 0.44, col); circ(c, r * 0.14, 0, r * 0.26, '#e8bf98'); c.fillStyle = bz ? '#d8c060' : '#f2efe6'; c.beginPath(); c.arc(r * 0.06, 0, r * 0.3, -1.6, 1.6); c.fill();
    const rc = swing ? swing * r * 0.35 : 0; stk(r * 0.1, '#5a3d22'); c.beginPath(); c.moveTo(r * 0.2 - rc, r * 0.4); c.lineTo(r * 1.9 - rc, r * 0.26); c.stroke(); stk(r * 0.05, '#2a2a30'); c.beginPath(); c.moveTo(r * 1.0 - rc, r * 0.33); c.lineTo(r * 2.0 - rc, r * 0.26); c.stroke();
    if (swing > 0.55) { c.globalCompositeOperation = 'lighter'; const gg = c.createRadialGradient(r * 2.2, r * 0.26, 0, r * 2.2, r * 0.26, r * 0.9); gg.addColorStop(0, 'rgba(255,240,180,.95)'); gg.addColorStop(1, 'rgba(255,120,20,0)'); c.fillStyle = gg; c.beginPath(); c.arc(r * 2.2, r * 0.26, r * 0.9, 0, 6.283); c.fill(); c.globalCompositeOperation = 'source-over'; }
  }
  else if (u.type === 'hero') {
    const bz = civ === 'bizans';
    stk(r * 0.2, '#241810'); for (let i = 0; i < 4; i++) { const sg = i < 2 ? 1 : -1, off = (i % 2 ? 1 : -1) * leg * sg; c.beginPath(); c.moveTo(r * (i < 2 ? 0.9 : -0.8), (i % 2 ? 0.4 : -0.4) * r); c.lineTo(r * (i < 2 ? 0.9 : -0.8) + off, (i % 2 ? 0.55 : -0.55) * r + off * 0.2); c.stroke(); }
    ell(c, 0, 0, r * 1.4, r * 0.66, 0, grad(c, 0, -r * 0.6, 0, r * 0.6, bz ? '#f6f6f2' : '#2c2428', bz ? '#c6c6c4' : '#120e10'));
    c.strokeStyle = bz ? '#e8e8e6' : '#14100e'; c.lineWidth = r * 0.3; c.beginPath(); c.moveTo(-r * 1.3, 0); c.lineTo(-r * 1.85, Math.sin(t * 8 + u.id) * r * 0.3); c.stroke();
    ell(c, r * 1.3, 0, r * 0.52, r * 0.34, 0, bz ? '#e4e4e0' : '#241c20'); circ(c, r * 1.56, -r * 0.14, r * 0.07, '#111');
    // örtü: takım rengi + altın şerit
    c.fillStyle = col; c.fillRect(-r * 0.95, -r * 0.64, r * 1.5, r * 1.28); c.fillStyle = '#e8c24a'; c.fillRect(-r * 0.95, -r * 0.64, r * 1.5, r * 0.1); c.fillRect(-r * 0.95, r * 0.54, r * 1.5, r * 0.1); c.fillRect(-r * 0.95, -r * 0.64, r * 0.1, r * 1.28);
    // binici: altın zırh
    circ(c, 0, 0, r * 0.52, grad(c, -r * 0.4, -r * 0.4, r * 0.4, r * 0.4, '#ffe58a', '#a8761a')); circ(c, r * 0.14, 0, r * 0.3, '#f0c070'); circ(c, r * 0.18, -r * 0.02, r * 0.14, '#e8bf98');
    if (bz) { c.fillStyle = '#d8a820'; c.beginPath(); c.moveTo(r * 0.0, -r * 0.3); c.lineTo(r * 0.3, 0); c.lineTo(r * 0.0, r * 0.3); c.closePath(); c.fill(); c.fillStyle = '#b02a2a'; c.beginPath(); c.moveTo(-r * 0.05, 0); c.quadraticCurveTo(-r * 0.6, -r * 0.4, -r * 0.9, 0); c.quadraticCurveTo(-r * 0.6, r * 0.4, -r * 0.05, 0); c.fill(); }
    else { circ(c, r * 0.08, 0, r * 0.36, '#f4f0e4'); c.strokeStyle = '#b01a22'; c.lineWidth = r * 0.07; c.beginPath(); c.arc(r * 0.08, 0, r * 0.26, 0, 6.283); c.stroke(); c.strokeStyle = '#ffd86a'; c.lineWidth = r * 0.06; c.beginPath(); c.moveTo(r * 0.3, 0); c.lineTo(r * 0.55, -r * 0.1); c.moveTo(r * 0.3, 0); c.lineTo(r * 0.58, 0); c.moveTo(r * 0.3, 0); c.lineTo(r * 0.55, r * 0.1); c.stroke(); circ(c, r * 0.3, 0, r * 0.05, '#d4172c'); }
    // kılıç
    c.save(); c.translate(r * 0.4, r * 0.42); c.rotate(-0.2 - swing * 1.1); stk(r * 0.1, '#6a4a28'); c.beginPath(); c.moveTo(-r * 0.2, 0); c.lineTo(r * 0.2, 0); c.stroke(); c.fillStyle = '#eef0f6'; c.beginPath(); c.moveTo(r * 0.2, -r * 0.07); c.lineTo(r * 1.7, 0); c.lineTo(r * 0.2, r * 0.07); c.closePath(); c.fill(); c.restore();
    if (swing > 0.3) { c.strokeStyle = `rgba(255,236,160,${swing * 0.8})`; c.lineWidth = 3; c.beginPath(); c.arc(r * 0.4, r * 0.1, r * 1.5, -0.9, 0.9); c.stroke(); }
  }
  else if (u.type === 'cav') {
    // atın bacakları
    stk(r * 0.2, '#3a2418'); for (let i = 0; i < 4; i++) { const sg = i < 2 ? 1 : -1, off = (i % 2 ? 1 : -1) * leg * sg; c.beginPath(); c.moveTo(r * (i < 2 ? 0.9 : -0.8), (i % 2 ? 0.4 : -0.4) * r); c.lineTo(r * (i < 2 ? 0.9 : -0.8) + off * 0.9, (i % 2 ? 0.4 : -0.4) * r); c.stroke(); }
    ell(c, 0, 0, r * 1.35, r * 0.62, 0, grad(c, 0, -r * 0.6, 0, r * 0.6, civ === 'bizans' ? '#8a8a92' : '#7a5232', civ === 'bizans' ? '#55555c' : '#4a2e18'));
    c.strokeStyle = '#2a1608'; c.lineWidth = r * 0.28; c.beginPath(); c.moveTo(-r * 1.25, 0); c.lineTo(-r * 1.75, Math.sin(t * 8 + u.id) * r * 0.25); c.stroke();
    ell(c, r * 1.25, 0, r * 0.5, r * 0.34, 0, civ === 'bizans' ? '#7a7a82' : '#6a4426'); circ(c, r * 1.5, -r * 0.14, r * 0.07, '#111');
    c.fillStyle = civ === 'bizans' ? '#8a8a92' : col; c.fillRect(-r * 0.4, -r * 0.55, r * 0.9, r * 1.1);
    circ(c, 0, 0, r * 0.52, col); circ(c, r * 0.12, 0, r * 0.32, civ === 'bizans' ? '#c0c0c8' : '#e0e0e6'); circ(c, r * 0.14, -r * 0.02, r * 0.14, '#e8bf98');
    c.save(); c.translate(r * 0.4, r * 0.4); c.rotate(-0.25 - swing * 0.9); stk(r * 0.09, '#6a4a28'); c.beginPath(); c.moveTo(-r * 0.2, 0); c.lineTo(r * 2.1, 0); c.stroke(); c.fillStyle = '#d8d8e0'; c.beginPath(); c.moveTo(r * 2.1, 0); c.lineTo(r * 1.8, -r * 0.1); c.lineTo(r * 1.8, r * 0.1); c.fill(); c.fillStyle = cl; c.fillRect(r * 1.55, -r * 0.18, r * 0.3, r * 0.14); c.restore();
  } else if (u.type === 'siege') {
    const bz = civ === 'bizans';
    c.save(); c.rotate(0);
    stk(r * 0.22, '#2a2018'); // tekerlekler
    for (const sgn of [-1, 1]) { circ(c, -r * 0.2, sgn * r * 0.78, r * 0.36, '#4a3018'); circ(c, -r * 0.2, sgn * r * 0.78, r * 0.2, '#2a1a0c'); c.strokeStyle = '#7a5a30'; c.lineWidth = 1.5; const rot = a.ph * 0.5; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-r * 0.2 + Math.cos(rot + k * 1.57) * r * 0.3, sgn * r * 0.78 + Math.sin(rot + k * 1.57) * r * 0.3); c.lineTo(-r * 0.2 - Math.cos(rot + k * 1.57) * r * 0.3, sgn * r * 0.78 - Math.sin(rot + k * 1.57) * r * 0.3); c.stroke(); } }
    c.fillStyle = grad(c, 0, -r * 0.6, 0, r * 0.6, '#8a6238', '#5a3c20'); c.fillRect(-r * 1.0, -r * 0.6, r * 1.5, r * 1.2);
    c.fillStyle = col; c.fillRect(-r * 1.0, -r * 0.6, r * 0.3, r * 1.2);
    if (!bz) { const rec = swing * r * 0.45; c.fillStyle = grad(c, 0, -r * 0.3, 0, r * 0.3, '#c8923a', '#6a4a14'); c.fillRect(-r * 0.3 - rec, -r * 0.3, r * 1.9, r * 0.6); c.fillStyle = '#2a1a08'; c.fillRect(r * 1.5 - rec, -r * 0.36, r * 0.18, r * 0.72); circ(c, r * 1.68 - rec, 0, r * 0.14, '#111'); }
    else { stk(r * 0.16, '#6a4a28'); c.save(); c.translate(0, 0); c.rotate(-0.4 + swing * 1.6); c.beginPath(); c.moveTo(-r * 0.4, 0); c.lineTo(r * 1.6, 0); c.stroke(); circ(c, r * 1.65, 0, r * 0.26, '#3a2a1a'); c.restore(); }
    c.restore();
  } else if (u.type === 'dog') {
    stk(r * 0.14, '#4a3420'); for (let i = 0; i < 4; i++) { const sg = i % 2 ? 1 : -1, off = (i < 2 ? 1 : -1) * leg * sg * 1.2; c.beginPath(); c.moveTo(r * (i < 2 ? 0.6 : -0.5), sg * r * 0.3); c.lineTo(r * (i < 2 ? 0.6 : -0.5) + off, sg * r * 0.3); c.stroke(); }
    ell(c, 0, 0, r * 1.05, r * 0.5, 0, grad(c, 0, -r * 0.5, 0, r * 0.5, '#a07c50', '#6e5230'));
    c.strokeStyle = '#6e5230'; c.lineWidth = r * 0.2; c.beginPath(); c.moveTo(-r * 0.95, 0); c.lineTo(-r * 1.5, Math.sin(t * 16 + u.id) * r * 0.4); c.stroke();
    ell(c, r * 1.0, 0, r * 0.42, r * 0.32, 0, '#8a6a42'); ell(c, r * 1.35, 0, r * 0.2, r * 0.14, 0, '#6e5230'); circ(c, r * 1.5, 0, r * 0.06, '#111');
    ell(c, r * 0.9, -r * 0.3, r * 0.14, r * 0.2, 0.4, '#4a3420'); ell(c, r * 0.9, r * 0.3, r * 0.14, r * 0.2, -0.4, '#4a3420');
    c.fillStyle = col; c.fillRect(r * 0.55, -r * 0.4, r * 0.18, r * 0.8);
    if (swing) { c.fillStyle = '#fff'; c.fillRect(r * 1.35, -r * 0.08, r * 0.25, r * 0.05); c.fillRect(r * 1.35, r * 0.03, r * 0.25, r * 0.05); }
  } else {
    // iki ayaklı birimler: bacaklar
    const sl = mv ? leg : 0;
    stk(r * 0.26, '#2a2218'); c.beginPath(); c.moveTo(sl * 0.9, -r * 0.3); c.lineTo(sl * 0.9 + r * 0.05, -r * 0.3); c.moveTo(-sl * 0.9, r * 0.3); c.lineTo(-sl * 0.9 + r * 0.05, r * 0.3); c.stroke();
    const body = (fill) => { ell(c, 0, 0, r * 0.62, r * 0.88, 0, fill); };
    if (u.type === 'villager' || (u.type === 'spy' && u.disguised && u.owner !== V.ME)) {
      body(grad(c, 0, -r * 0.8, 0, r * 0.8, '#9a7a52', '#6e5230'));
      c.fillStyle = col; c.beginPath(); c.ellipse(-r * 0.1, 0, r * 0.2, r * 0.8, 0, 0, 6.283); c.fill();
      circ(c, r * 0.12, 0, r * 0.34, '#e8bf98'); ell(c, r * 0.06, 0, r * 0.52, r * 0.52, 0, 'rgba(217,194,122,.95)'); circ(c, r * 0.14, 0, r * 0.28, '#e8bf98');
      c.save(); c.translate(r * 0.45, r * 0.5); c.rotate(swing ? -1 + swing : 0.2); stk(r * 0.1, '#6a4a28'); c.beginPath(); c.moveTo(0, 0); c.lineTo(r * 0.8, 0); c.stroke(); c.fillStyle = '#9a9aa2'; c.fillRect(r * 0.7, -r * 0.12, r * 0.2, r * 0.24); c.restore();
    } else if (u.type === 'engineer') {
      body(grad(c, 0, -r * 0.8, 0, r * 0.8, '#5a6a80', '#3a4658')); c.fillStyle = col; c.fillRect(-r * 0.2, -r * 0.8, r * 0.14, r * 1.6);
      circ(c, r * 0.1, 0, r * 0.32, '#e8bf98'); ell(c, r * 0.06, 0, r * 0.5, r * 0.5, 0, '#f2c230'); circ(c, r * 0.14, 0, r * 0.2, '#e8bf98'); c.fillStyle = '#d8a810'; c.fillRect(r * 0.4, -r * 0.5, r * 0.14, r);
      c.save(); c.translate(r * 0.45, r * 0.5); c.rotate(swing ? -1.2 + swing * 1.2 : 0.2); stk(r * 0.1, '#6a4a28'); c.beginPath(); c.moveTo(0, 0); c.lineTo(r * 0.7, 0); c.stroke(); c.fillStyle = '#777'; c.fillRect(r * 0.6, -r * 0.2, r * 0.3, r * 0.4); c.restore();
    } else if (u.type === 'inf') {
      const bz = civ === 'bizans';
      body(grad(c, 0, -r * 0.8, 0, r * 0.8, bz ? '#9a9aa2' : '#b8b8c0', '#5a5a62')); c.fillStyle = col; c.fillRect(-r * 0.3, -r * 0.7, r * 0.2, r * 1.4);
      circ(c, r * 0.08, 0, r * 0.4, bz ? '#b8b8c0' : '#d8d8e0'); circ(c, r * 0.14, 0, r * 0.2, '#e8bf98');
      c.fillStyle = bz ? '#e8c24a' : col; c.beginPath(); c.moveTo(-r * 0.3, 0); c.lineTo(-r * 0.9, -r * 0.12); c.lineTo(-r * 0.9, r * 0.12); c.closePath(); c.fill();
      c.save(); c.translate(r * 0.05, -r * 0.78); circ(c, 0, 0, r * 0.5, grad(c, -r * 0.4, -r * 0.4, r * 0.4, r * 0.4, cl, cd)); circ(c, 0, 0, r * 0.12, '#e8e8ee'); c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 1.2; c.beginPath(); c.arc(0, 0, r * 0.5, 0, 6.283); c.stroke(); c.restore();
      c.save(); c.translate(r * 0.4, r * 0.55); c.rotate(-0.15 + swing * 1.5 - (swing ? 0.9 : 0)); stk(r * 0.1, '#7a5a30'); c.beginPath(); c.moveTo(-r * 0.1, 0); c.lineTo(r * 0.3, 0); c.stroke(); c.fillStyle = '#e6e6ee'; c.beginPath(); c.moveTo(r * 0.3, -r * 0.07); c.lineTo(r * 1.35, 0); c.lineTo(r * 0.3, r * 0.07); c.closePath(); c.fill(); c.restore();
      if (swing > 0.3) { c.strokeStyle = `rgba(255,255,255,${swing * 0.8})`; c.lineWidth = 2.5; c.beginPath(); c.arc(r * 0.4, r * 0.1, r * 1.3, -0.9, 0.9); c.stroke(); }
    } else if (u.type === 'archer') {
      body(grad(c, 0, -r * 0.8, 0, r * 0.8, civ === 'bizans' ? '#7a6a52' : '#6e7a52', '#3e4630')); c.fillStyle = col; c.fillRect(-r * 0.2, -r * 0.8, r * 0.14, r * 1.6);
      c.fillStyle = '#5a3d22'; c.fillRect(-r * 0.9, -r * 0.15, r * 0.5, r * 0.3); circ(c, r * 0.04, 0, r * 0.4, cd); circ(c, r * 0.16, 0, r * 0.22, '#e8bf98');
      const pull = swing ? swing * r * 0.25 : 0;
      c.strokeStyle = '#8a5a2a'; c.lineWidth = Math.max(2, r * 0.12); c.beginPath(); c.arc(r * 0.75, 0, r * 0.95, -1.15, 1.15); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1; c.beginPath(); c.moveTo(r * 0.75 + Math.cos(-1.15) * r * 0.95, Math.sin(-1.15) * r * 0.95); c.lineTo(r * 0.75 + r * 0.95 * 0.4 - pull, 0); c.lineTo(r * 0.75 + Math.cos(1.15) * r * 0.95, Math.sin(1.15) * r * 0.95); c.stroke();
    } else if (u.type === 'musketeer') {
      const bz = civ === 'bizans';
      body(grad(c, 0, -r * 0.8, 0, r * 0.8, bz ? '#5a6a8a' : '#a83a3a', bz ? '#2e3a56' : '#6a1e1e')); c.fillStyle = '#e8e8ee'; c.fillRect(-r * 0.1, -r * 0.75, r * 0.12, r * 1.5);
      circ(c, r * 0.08, 0, r * 0.38, col); circ(c, r * 0.16, 0, r * 0.2, '#e8bf98'); c.fillStyle = bz ? '#d8c060' : '#e8e8ee'; c.fillRect(-r * 0.2, -r * 0.45, r * 0.3, r * 0.9);
      const rc = swing ? swing * r * 0.35 : 0;
      stk(r * 0.1, '#5a3d22'); c.beginPath(); c.moveTo(r * 0.2 - rc, r * 0.38); c.lineTo(r * 1.9 - rc, r * 0.22); c.stroke();
      stk(r * 0.05, '#2a2a30'); c.beginPath(); c.moveTo(r * 1.0 - rc, r * 0.3); c.lineTo(r * 1.95 - rc, r * 0.22); c.stroke();
      if (swing > 0.55) { c.globalCompositeOperation = 'lighter'; const gg = c.createRadialGradient(r * 2.1, r * 0.22, 0, r * 2.1, r * 0.22, r * 0.9); gg.addColorStop(0, 'rgba(255,240,180,.95)'); gg.addColorStop(1, 'rgba(255,120,20,0)'); c.fillStyle = gg; c.beginPath(); c.arc(r * 2.1, r * 0.22, r * 0.9, 0, 6.283); c.fill(); c.globalCompositeOperation = 'source-over'; }
    } else if (u.type === 'mgun') {
      body(grad(c, 0, -r * 0.8, 0, r * 0.8, '#6a7258', '#3a4030')); c.fillStyle = col; c.fillRect(-r * 0.2, -r * 0.8, r * 0.14, r * 1.6);
      circ(c, r * 0.05, 0, r * 0.4, '#556048'); circ(c, r * 0.14, 0, r * 0.2, '#e8bf98');
      stk(r * 0.1, '#2a2a30'); c.beginPath(); c.moveTo(r * 0.5, -r * 0.5); c.lineTo(r * 0.9, 0); c.lineTo(r * 0.5, r * 0.5); c.stroke();
      c.fillStyle = '#34343a'; c.fillRect(r * 0.5, -r * 0.14, r * 1.5, r * 0.28); c.fillStyle = '#1a1a1e'; c.fillRect(r * 1.9, -r * 0.2, r * 0.18, r * 0.4); c.fillStyle = '#6a5a2a'; c.fillRect(r * 0.55, r * 0.14, r * 0.35, r * 0.22);
      if (swing > 0.1) { c.globalCompositeOperation = 'lighter'; const gg = c.createRadialGradient(r * 2.25, 0, 0, r * 2.25, 0, r * 0.8); gg.addColorStop(0, 'rgba(255,240,170,.95)'); gg.addColorStop(1, 'rgba(255,120,20,0)'); c.fillStyle = gg; c.beginPath(); c.arc(r * 2.25, 0, r * 0.8, 0, 6.283); c.fill(); c.globalCompositeOperation = 'source-over'; }
    } else if (u.type === 'armored') {
      stk(r * 0.22, '#1a1a1e'); for (const sg of [-1, 1]) { c.fillStyle = '#222'; rrect(c, -r * 1.1, sg * r * 0.7 - r * 0.18, r * 2.2, r * 0.36, r * 0.15); c.fill(); c.fillStyle = '#3a3a40'; for (let k = 0; k < 6; k++) c.fillRect(-r * 1.0 + k * r * 0.36 + ((a.ph * 0.6) % 0.36) * r, sg * r * 0.7 - r * 0.15, r * 0.1, r * 0.3); }
      c.fillStyle = grad(c, 0, -r * 0.7, 0, r * 0.7, bzCol(civ, 0), bzCol(civ, 1)); rrect(c, -r * 1.0, -r * 0.62, r * 2.0, r * 1.24, r * 0.18); c.fill();
      c.fillStyle = col; c.fillRect(-r * 1.0, -r * 0.62, r * 0.28, r * 1.24); c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 1.2; rrect(c, -r * 1.0, -r * 0.62, r * 2.0, r * 1.24, r * 0.18); c.stroke();
      circ(c, r * 0.1, 0, r * 0.52, grad(c, -r * 0.4, -r * 0.4, r * 0.4, r * 0.4, '#8a8f96', '#4a4f56')); circ(c, r * 0.1, 0, r * 0.2, '#2a2d32');
      const rc = swing ? swing * r * 0.25 : 0; c.fillStyle = '#25282c'; c.fillRect(r * 0.5 - rc, -r * 0.09, r * 1.3, r * 0.18); c.fillRect(r * 1.75 - rc, -r * 0.14, r * 0.14, r * 0.28);
      if (swing > 0.2) { c.globalCompositeOperation = 'lighter'; const gg = c.createRadialGradient(r * 2.0, 0, 0, r * 2.0, 0, r * 0.9); gg.addColorStop(0, 'rgba(255,240,170,.95)'); gg.addColorStop(1, 'rgba(255,120,20,0)'); c.fillStyle = gg; c.beginPath(); c.arc(r * 2.0, 0, r * 0.9, 0, 6.283); c.fill(); c.globalCompositeOperation = 'source-over'; }
      if (mv && rnd() < 0.2) smokeAt(u.x - Math.cos(u.face) * 1, u.y - Math.sin(u.face) * 1, 1, 0.12, 0.2);
    } else if (u.type === 'spy') {
      c.globalAlpha = 0.88; body(grad(c, 0, -r * 0.8, 0, r * 0.8, '#2c2c36', '#14141a'));
      c.fillStyle = col; c.fillRect(r * 0.1, -r * 0.8, r * 0.14, r * 1.6);
      circ(c, r * 0.1, 0, r * 0.3, '#e8bf98'); ell(c, r * 0.06, 0, r * 0.62, r * 0.62, 0, '#15151b'); ell(c, r * 0.06, 0, r * 0.3, r * 0.3, 0, '#22222a'); c.fillStyle = '#e8bf98'; c.fillRect(r * 0.3, -r * 0.1, r * 0.1, r * 0.2); c.globalAlpha = 1;
    } else if (u.type === 'sniper') {
      body(grad(c, 0, -r * 0.8, 0, r * 0.8, '#55683e', '#2e3a22')); c.fillStyle = '#6f8450'; for (let k = 0; k < 5; k++) c.fillRect(-r * 0.5 + k * r * 0.2, -r * 0.6 + (k % 2) * r * 0.9, r * 0.12, r * 0.3);
      circ(c, r * 0.08, 0, r * 0.36, '#43542f'); circ(c, r * 0.16, 0, r * 0.19, '#e8bf98'); ell(c, r * 0.06, 0, r * 0.5, r * 0.5, 0, 'rgba(70,88,50,.9)'); circ(c, r * 0.14, 0, r * 0.2, '#e8bf98');
      const rc = swing ? swing * r * 0.3 : 0; stk(r * 0.07, '#2a2418'); c.beginPath(); c.moveTo(-r * 0.3 - rc, r * 0.32); c.lineTo(r * 2.7 - rc, r * 0.18); c.stroke();
      c.fillStyle = '#16161a'; c.fillRect(r * 0.9 - rc, r * 0.05, r * 0.55, r * 0.14); c.fillStyle = '#7aa8d0'; c.fillRect(r * 1.42 - rc, r * 0.07, r * 0.05, r * 0.1);
      if (swing > 0.5) { c.globalCompositeOperation = 'lighter'; const gg = c.createRadialGradient(r * 2.8, r * 0.18, 0, r * 2.8, r * 0.18, r * 0.7); gg.addColorStop(0, 'rgba(255,240,180,.95)'); gg.addColorStop(1, 'rgba(255,120,20,0)'); c.fillStyle = gg; c.beginPath(); c.arc(r * 2.8, r * 0.18, r * 0.7, 0, 6.283); c.fill(); c.globalCompositeOperation = 'source-over'; }
    } else if (u.type === 'rpg') {
      body(grad(c, 0, -r * 0.8, 0, r * 0.8, '#6a6e4a', '#3c3e28')); c.fillStyle = col; c.fillRect(-r * 0.2, -r * 0.8, r * 0.14, r * 1.6);
      circ(c, r * 0.06, 0, r * 0.38, '#4a4e34'); circ(c, r * 0.15, 0, r * 0.2, '#e8bf98');
      const rc = swing ? swing * r * 0.3 : 0; c.fillStyle = '#2c2c32'; c.fillRect(-r * 0.7 - rc, r * 0.12, r * 2.2, r * 0.3); c.fillStyle = '#3a3a42'; c.fillRect(r * 1.3 - rc, r * 0.06, r * 0.25, r * 0.42);
      c.fillStyle = '#c0392b'; c.beginPath(); c.moveTo(r * 1.5 - rc, r * 0.1); c.lineTo(r * 2.0 - rc, r * 0.27); c.lineTo(r * 1.5 - rc, r * 0.44); c.closePath(); c.fill();
      if (swing > 0.3) { c.globalCompositeOperation = 'lighter'; const gg = c.createRadialGradient(-r * 0.9, r * 0.27, 0, -r * 0.9, r * 0.27, r * 0.9); gg.addColorStop(0, 'rgba(255,230,160,.9)'); gg.addColorStop(1, 'rgba(255,100,20,0)'); c.fillStyle = gg; c.beginPath(); c.arc(-r * 0.9, r * 0.27, r * 0.9, 0, 6.283); c.fill(); c.globalCompositeOperation = 'source-over'; }
    } else if (u.type === 'demo') {
      body(grad(c, 0, -r * 0.8, 0, r * 0.8, '#b5651d', '#6e3b10')); c.fillStyle = col; c.fillRect(-r * 0.15, -r * 0.8, r * 0.12, r * 1.6);
      c.fillStyle = '#7a7a7e'; c.fillRect(-r * 0.75, -r * 0.45, r * 0.5, r * 0.9); c.strokeStyle = '#2a2a2e'; c.lineWidth = 1; c.strokeRect(-r * 0.75, -r * 0.45, r * 0.5, r * 0.9); c.beginPath(); c.moveTo(-r * 0.75, 0); c.lineTo(-r * 0.25, 0); c.stroke();
      circ(c, -r * 0.5, 0, r * 0.1, Math.sin(V.time * 7 + u.id) > 0 ? '#ff2a2a' : '#601010');
      circ(c, r * 0.06, 0, r * 0.38, '#cfcfd4'); circ(c, r * 0.15, 0, r * 0.2, '#e8bf98'); c.fillStyle = '#2a2a2e'; c.fillRect(r * 0.2, -r * 0.2, r * 0.1, r * 0.4);
    } else if (u.type === 'medic') {
      body(grad(c, 0, -r * 0.8, 0, r * 0.8, '#f2f2f4', '#c4c4ca')); c.fillStyle = '#d8212a'; c.fillRect(-r * 0.55, -r * 0.14, r * 0.5, r * 0.28); c.fillRect(-r * 0.44, -r * 0.4, r * 0.28, r * 0.8);
      circ(c, r * 0.06, 0, r * 0.38, '#f2f2f4'); circ(c, r * 0.15, 0, r * 0.2, '#e8bf98'); c.fillStyle = '#d8212a'; c.fillRect(r * 0.02, -r * 0.08, r * 0.2, r * 0.16);
      c.fillStyle = '#cfd4d8'; c.fillRect(r * 0.3, r * 0.3, r * 0.4, r * 0.3); c.fillStyle = '#d8212a'; c.fillRect(r * 0.42, r * 0.38, r * 0.16, r * 0.04); c.fillRect(r * 0.48, r * 0.32, r * 0.04, r * 0.16);
      if (u.healing) { c.strokeStyle = 'rgba(120,255,160,.55)'; c.lineWidth = 1.5; c.beginPath(); c.arc(0, 0, r * (1.4 + Math.sin(V.time * 6) * 0.15), 0, 6.283); c.stroke(); }
    } else { body('#888'); }
    if (u.type === 'inf' || u.type === 'archer' || u.type === 'musketeer') {
      const hx = r * (u.type === 'inf' ? 0.12 : 0.1), hr = r * 0.27;
      if (civ === 'bizans') { c.fillStyle = '#c9ccd4'; c.beginPath(); c.arc(hx, 0, hr, 0, 6.283); c.fill(); c.strokeStyle = '#6a6e78'; c.lineWidth = 1; c.stroke(); c.fillStyle = '#b02a2a'; c.beginPath(); c.moveTo(hx - hr * 0.4, 0); c.quadraticCurveTo(hx - hr * 2.2, -hr * 0.9, hx - hr * 2.6, 0); c.quadraticCurveTo(hx - hr * 2.2, hr * 0.9, hx - hr * 0.4, 0); c.fill(); }
      else { c.fillStyle = '#f2efe6'; c.beginPath(); c.arc(hx, 0, hr, 0, 6.283); c.fill(); c.strokeStyle = '#b02a2a'; c.lineWidth = Math.max(1, r * 0.09); c.beginPath(); c.arc(hx, 0, hr * 0.7, 0, 6.283); c.stroke(); if (u.type === 'inf' || u.type === 'musketeer') { c.fillStyle = '#f2efe6'; c.beginPath(); c.moveTo(hx - hr * 0.3, -hr * 0.5); c.lineTo(hx - hr * 1.9, -hr * 0.3); c.lineTo(hx - hr * 1.9, hr * 0.3); c.lineTo(hx - hr * 0.3, hr * 0.5); c.closePath(); c.fill(); } }
    }
  }
  c.restore();
  }
  if (u.type === 'hero') { const px0 = x, py0 = y - lift - r * 1.5; c.strokeStyle = '#5a4020'; c.lineWidth = 2; c.beginPath(); c.moveTo(px0, py0 + r * 1.35); c.lineTo(px0, py0 - r * 1.2); c.stroke(); circ(c, px0, py0 - r * 1.2, 3, '#e8c24a'); const fi = window.Flags && Flags.img[civ]; if (fi && fi.complete && fi.naturalWidth) { const fw = r * 2.1, fh = fw * 0.66, N = 8; for (let i = 0; i < N; i++) { const k = i / N, off = Math.sin(t * 5 + i * 0.8 + u.id) * fh * 0.08 * k; c.drawImage(fi, i * fi.naturalWidth / N, 0, fi.naturalWidth / N + 0.5, fi.naturalHeight, px0 + fw * k, py0 - r * 1.2 + off, fw / N + 0.6, fh); } c.fillStyle = col; c.fillRect(px0, py0 - r * 1.2, fw, 2); c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 0.8; c.strokeRect(px0, py0 - r * 1.2, fw, fh); } }
  if (u.guard && u.type === 'villager') { c.save(); c.strokeStyle = `rgba(255,220,90,${0.55 + Math.sin(t * 4) * 0.25})`; c.lineWidth = 2; c.beginPath(); c.arc(x, y - lift, r * 1.5 + Math.sin(t * 3) * 1.5, 0, 6.283); c.stroke(); c.globalCompositeOperation = 'lighter'; circ(c, x, y - lift, r * 1.1, 'rgba(255,210,80,.18)'); c.restore(); c.font = Math.round(r * 1.2) + 'px sans-serif'; c.textAlign = 'center'; c.fillText('🛡', x, y - lift - r * 1.9); }
  if (u.disguised && u.owner === V.ME) { c.font = Math.round(r * 1.3) + 'px sans-serif'; c.textAlign = 'center'; c.fillText('🎭', x, y - lift - r * 1.0); }
  if (!(V.squadMode && u.squad && u.owner === V.ME) && (V.selSet.has(u.id) || u.hp < u.maxhp)) hpBar(c, x, y - lift - r * 1.55 - 3, Math.max(15, r * 2.3), u.hp / u.maxhp);
}

/* ---------- efektler (çizim) ---------- */
// kule atışı çağa göre değişir: ateş oku → top → izli mermi → lazer
function drawTowerShot(c, V, f, k) {
  const ts = V.ts, big = f.tw === 'fortress' ? 1.5 : 1, ag = f.age || 0, sxp = x => (x - V.cam.x) * ts, syp = y => (y - V.cam.y) * ts;
  const x0 = sxp(f.x0), y0 = syp(f.y0) - ts * 0.9, x1 = sxp(f.x1), y1 = syp(f.y1) - ts * 0.25;
  c.lineCap = 'round';
  if (ag >= 3) {
    const a = 1 - k; c.globalCompositeOperation = 'lighter';
    c.strokeStyle = `rgba(60,150,255,${a * 0.5})`; c.lineWidth = ts * 0.24 * big; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    c.strokeStyle = `rgba(210,242,255,${a})`; c.lineWidth = ts * 0.075 * big; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    let gg = c.createRadialGradient(x1, y1, 0, x1, y1, ts * (0.3 + 0.35 * k) * big); gg.addColorStop(0, `rgba(190,230,255,${a})`); gg.addColorStop(1, 'rgba(60,140,255,0)'); c.fillStyle = gg; c.beginPath(); c.arc(x1, y1, ts * (0.3 + 0.35 * k) * big, 0, 6.283); c.fill();
    gg = c.createRadialGradient(x0, y0, 0, x0, y0, ts * 0.35 * big); gg.addColorStop(0, `rgba(200,235,255,${a})`); gg.addColorStop(1, 'rgba(60,140,255,0)'); c.fillStyle = gg; c.beginPath(); c.arc(x0, y0, ts * 0.35 * big, 0, 6.283); c.fill();
    c.globalCompositeOperation = 'source-over'; return;
  }
  const at = kk => ({ x: lerp(x0, x1, kk), y: lerp(y0, y1, kk) - Math.sin(kk * Math.PI) * ts * (ag === 1 ? 0.8 : 0.25) });
  const p = at(k);
  if (ag === 0) {
    const q = at(Math.max(0, k - 0.16)); c.globalCompositeOperation = 'lighter';
    c.strokeStyle = 'rgba(255,140,40,.7)'; c.lineWidth = ts * 0.1 * big; c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(p.x, p.y); c.stroke();
    c.strokeStyle = 'rgba(255,230,150,.95)'; c.lineWidth = ts * 0.04 * big; c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(p.x, p.y); c.stroke();
    circ(c, p.x, p.y, ts * 0.09 * big, 'rgba(255,190,80,.9)'); c.globalCompositeOperation = 'source-over';
    if (rnd() < 0.5) P({ type: 'fire', x: f.x0 + (f.x1 - f.x0) * k, y: f.y0 + (f.y1 - f.y0) * k, z: 0.6, vz: 0.2, life: 0.35, size: 0.06 });
  } else if (ag === 1) {
    circ(c, p.x, p.y, ts * 0.12 * big, grad(c, p.x - 3, p.y - 3, p.x + 3, p.y + 3, '#777', '#111'));
    if (rnd() < 0.7) P({ type: 'smoke', x: f.x0 + (f.x1 - f.x0) * k, y: f.y0 + (f.y1 - f.y0) * k, z: 0.6, vz: 0.1, life: 0.5, size: 0.09 });
  } else {
    c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,230,120,.95)'; c.lineWidth = Math.max(2, ts * 0.06 * big);
    for (let j = 0; j < 3; j++) { const k1 = Math.min(1, Math.max(0, k * 1.25 - j * 0.1)), k2 = Math.min(1, k1 + 0.14), a = at(k1), b = at(k2); c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); }
    c.globalCompositeOperation = 'source-over';
  }
}
function drawFxShape(c, V, f) {
  const ts = V.ts, k = 1 - f.life / f.max, sxp = x => (x - V.cam.x) * ts, syp = y => (y - V.cam.y) * ts;
  if (f.t === 'shot') {
    if (!visAt(V, f.x0, f.y0) && !visAt(V, f.x1, f.y1)) return;
    if (f.ut === 'tower') { drawTowerShot(c, V, f, k); return; }
    const x = lerp(f.x0, f.x1, k), y = lerp(f.y0, f.y1, k), dist = Math.hypot(f.x1 - f.x0, f.y1 - f.y0), arc = f.siege ? Math.min(2.2, dist * 0.3) : Math.min(1.2, dist * 0.12);
    const h = Math.sin(k * Math.PI) * arc;
    ell(c, sxp(x), syp(y), ts * 0.1, ts * 0.05, 0, 'rgba(0,0,0,.3)');
    const kind = f.siege || ['tank', 'ltank', 'htank', 'howitzer'].includes(f.ut) ? 'ball' : (f.ut === 'sam' || f.ut === 'siha' || f.ut === 'rpg' || f.ut === 'raider') ? 'missile' : ['mgun', 'heli', 'fighter', 'armored', 'musketeer', 'sniper', 'flak', 'scout', 'dragoon'].includes(f.ut) ? 'tracer' : 'arrow';
    if (kind === 'tracer') {
      const x2 = lerp(f.x0, f.x1, Math.min(1, k + 0.18)), y2 = lerp(f.y0, f.y1, Math.min(1, k + 0.18)); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,230,120,.95)'; c.lineWidth = Math.max(2, ts * 0.06); c.beginPath(); c.moveTo(sxp(x), syp(y) - ts * 0.3); c.lineTo(sxp(x2), syp(y2) - ts * 0.3); c.stroke(); c.globalCompositeOperation = 'source-over';
    } else if (kind === 'missile') {
      const x2 = lerp(f.x0, f.x1, Math.min(1, k + 0.03)), y2 = lerp(f.y0, f.y1, Math.min(1, k + 0.03)), mh = Math.sin(k * Math.PI) * 0.8 + 0.3, ax = sxp(x2) - sxp(x), ay = syp(y2) - syp(y), L = Math.hypot(ax, ay) || 1;
      c.strokeStyle = '#e8e8ee'; c.lineWidth = Math.max(3, ts * 0.09); c.lineCap = 'round'; c.beginPath(); c.moveTo(sxp(x) - ax / L * ts * 0.28, syp(y) - mh * ts - ay / L * ts * 0.28); c.lineTo(sxp(x), syp(y) - mh * ts); c.stroke();
      c.globalCompositeOperation = 'lighter'; circ(c, sxp(x) - ax / L * ts * 0.3, syp(y) - mh * ts - ay / L * ts * 0.3, ts * 0.1, 'rgba(255,170,60,.9)'); c.globalCompositeOperation = 'source-over';
      if (rnd() < 0.9) P({ type: 'smoke', x, y, z: mh, vz: 0.05, life: 0.6, size: 0.07 });
    } else if (kind === 'ball') { circ(c, sxp(x), syp(y) - h * ts, ts * 0.13,
 grad(c, sxp(x) - 4, syp(y) - h * ts - 4, sxp(x) + 4, syp(y) - h * ts + 4, '#666', '#111')); if (rnd() < 0.7) P({ type: 'smoke', x, y, z: h + 0.1, vz: 0.1, life: 0.5, size: 0.1 }); }
    else {
      const x2 = lerp(f.x0, f.x1, Math.min(1, k + 0.05)), y2 = lerp(f.y0, f.y1, Math.min(1, k + 0.05)), h2 = Math.sin(Math.min(1, k + 0.05) * Math.PI) * arc;
      const ax = sxp(x2) - sxp(x), ay = (syp(y2) - h2 * ts) - (syp(y) - h * ts), L = Math.hypot(ax, ay) || 1;
      c.strokeStyle = '#f2e2b0'; c.lineWidth = Math.max(1.5, ts * 0.04); c.beginPath(); c.moveTo(sxp(x) - ax / L * ts * 0.3, syp(y) - h * ts - ay / L * ts * 0.3); c.lineTo(sxp(x), syp(y) - h * ts); c.stroke();
      c.fillStyle = '#c8c8d0'; c.beginPath(); c.arc(sxp(x), syp(y) - h * ts, ts * 0.03, 0, 6.283); c.fill();
    }
  } else if (f.t === 'cry') {
    const x = sxp(f.x), y = syp(f.y), rr = f.r * ts * (0.25 + 0.75 * k), a = 1 - k; c.save(); c.globalCompositeOperation = 'lighter';
    c.strokeStyle = `rgba(255,214,90,${a * 0.8})`; c.lineWidth = 4 * a + 1; c.beginPath(); c.arc(x, y, rr, 0, 6.283); c.stroke();
    c.strokeStyle = `rgba(255,150,60,${a * 0.5})`; c.lineWidth = 2; c.beginPath(); c.arc(x, y, rr * 0.7, 0, 6.283); c.stroke();
    for (let i = 0; i < 14; i++) { const ang = i / 14 * 6.283 + k, r0 = rr * 0.55, r1 = rr * 1.0; c.strokeStyle = `rgba(255,230,140,${a * 0.6})`; c.lineWidth = 2; c.beginPath(); c.moveTo(x + Math.cos(ang) * r0, y + Math.sin(ang) * r0); c.lineTo(x + Math.cos(ang) * r1, y + Math.sin(ang) * r1); c.stroke(); }
    c.restore();
  } else if (f.t === 'age') {
    const a = Math.sin(k * Math.PI), x = sxp(f.x), y = syp(f.y), w = ts * (1.2 + k), gg = c.createLinearGradient(0, y - ts * 9, 0, y); gg.addColorStop(0, 'rgba(255,230,140,0)'); gg.addColorStop(1, `rgba(255,230,140,${a * 0.75})`);
    c.globalCompositeOperation = 'lighter'; c.fillStyle = gg; c.fillRect(x - w / 2, y - ts * 9, w, ts * 9); c.globalCompositeOperation = 'source-over';
  } else if (f.t === 'bomb') {
    const z = (1 - Math.min(1, k / 0.8)) * 2.4, x = sxp(f.x), y = syp(f.y);
    if (k < 0.82) { ell(c, x, y, ts * 0.12, ts * 0.06, 0, 'rgba(0,0,0,.35)'); c.save(); c.translate(x, y - z * ts); c.rotate(Math.PI / 2 + Math.sin(k * 9) * 0.1); ell(c, 0, 0, ts * 0.17, ts * 0.08, 0, '#2a2d32'); c.fillStyle = '#c04030'; c.fillRect(-ts * 0.19, -ts * 0.04, ts * 0.05, ts * 0.08); c.restore(); }
  } else if (f.t === 'warn') {
    c.strokeStyle = `rgba(255,80,50,${0.5 + 0.5 * Math.sin(k * 30)})`; c.lineWidth = 3; c.setLineDash([6, 6]);
    c.beginPath(); c.arc(sxp(f.x), syp(f.y), f.r * ts, 0, 6.283); c.stroke(); c.setLineDash([]);
    c.fillStyle = `rgba(255,60,30,${0.08 + 0.06 * Math.sin(k * 30)})`; c.fill();
  }
}
function drawParticles(c, V, dt) {
  const ts = V.ts;
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]; p.life -= dt;
    if (p.life <= 0) { parts.splice(i, 1); continue; }
    if (dt > 0) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vz -= p.grav * dt; p.rot += p.vr * dt;
      if (p.drag) { const f = Math.max(0, 1 - p.drag * dt); p.vx *= f; p.vy *= f; }
      if (p.z < 0) { p.z = 0; p.vz = -p.vz * 0.25; p.vx *= 0.6; p.vy *= 0.6; }
    }
    const k = 1 - p.life / p.max, x = (p.x - V.cam.x) * ts, y = (p.y - V.cam.y - p.z) * ts;
    if (x < -50 || y < -50 || x > V.vw + 50 || y > V.vh + 50) continue;
    if (p.type === 'smoke') { c.globalAlpha = (1 - k) * 0.38; circ(c, x, y, p.size * ts * (1 + k * 2.2), '#4a4a4e'); c.globalAlpha = 1; }
    else if (p.type === 'dust') { c.globalAlpha = (1 - k) * 0.4; circ(c, x, y, p.size * ts * (1 + k * 1.6), p.col ? `rgb(${p.col})` : '#b8a47c'); c.globalAlpha = 1; }
    else if (p.type === 'fire') { c.globalCompositeOperation = 'lighter'; const rr = p.size * ts * (1 - k * 0.6); const gg = c.createRadialGradient(x, y, 0, x, y, rr * 1.6); gg.addColorStop(0, `rgba(255,${230 - k * 120 | 0},90,${0.9 - k * 0.5})`); gg.addColorStop(1, 'rgba(255,60,0,0)'); c.fillStyle = gg; c.beginPath(); c.arc(x, y, rr * 1.6, 0, 6.283); c.fill(); c.globalCompositeOperation = 'source-over'; }
    else if (p.type === 'spark') { c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,${220 - k * 100 | 0},80,${1 - k})`; c.lineWidth = Math.max(1, ts * 0.04); c.beginPath(); c.moveTo(x, y); c.lineTo(x - p.vx * 0.04 * ts, y - (p.vy * 0.6 - p.vz) * 0.04 * ts); c.stroke(); c.globalCompositeOperation = 'source-over'; }
    else if (p.type === 'debris') { c.save(); c.translate(x, y); c.rotate(p.rot); c.globalAlpha = Math.min(1, p.life * 3); c.fillStyle = p.col; c.fillRect(-p.size * ts, -p.size * ts * 0.6, p.size * ts * 2, p.size * ts * 1.2); c.restore(); c.globalAlpha = 1; }
    else if (p.type === 'ring') { c.strokeStyle = `rgba(${p.col},${(1 - k) * 0.8})`; c.lineWidth = Math.max(1.5, ts * 0.06 * (1 - k)); c.beginPath(); c.ellipse(x, y, p.size * ts * (0.2 + k * 0.9), p.size * ts * (0.2 + k * 0.9) * 0.7, 0, 0, 6.283); c.stroke(); }
    else if (p.type === 'flash') { c.globalCompositeOperation = 'lighter'; const rr = p.size * ts * (0.6 + k * 0.6); const gg = c.createRadialGradient(x, y, 0, x, y, rr); gg.addColorStop(0, `rgba(255,250,220,${(1 - k) * 0.9})`); gg.addColorStop(0.4, `rgba(255,170,60,${(1 - k) * 0.5})`); gg.addColorStop(1, 'rgba(255,100,0,0)'); c.fillStyle = gg; c.beginPath(); c.arc(x, y, rr, 0, 6.283); c.fill(); c.globalCompositeOperation = 'source-over'; }
    else if (p.type === 'chip') { c.fillStyle = p.col || '#8b5a2b'; c.fillRect(x, y, ts * 0.05, ts * 0.04); }
    else if (p.type === 'twinkle') { const a = 1 - k; c.strokeStyle = `rgba(255,240,150,${a})`; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x - 4 * a, y); c.lineTo(x + 4 * a, y); c.moveTo(x, y - 4 * a); c.lineTo(x, y + 4 * a); c.stroke(); }
  }
}

/* ---------- ana çizim ---------- */
/* ---------- gece-gündüz ve hava ---------- */
let mistPat = null, lastFlashK = -1;
const mixc = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
function drawDayNight(c, V, sx, sy) {
  const g = V.g, e = g.env; if (!e || (g.opts && g.opts.dayNight === false)) return;
  const nightK = Math.pow(1 - e.light, 0.85), warm = sstepR(0.1, 0.5, e.light) * (1 - sstepR(0.55, 0.95, e.light));
  if (nightK < 0.02 && warm < 0.02) return;
  let col = mixc([255, 255, 255], [132, 148, 205], nightK); col = mixc(col, [255, 205, 160], warm * 0.5);
  c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`; c.fillRect(0, 0, V.vw, V.vh);
  if (nightK > 0.3) { c.globalCompositeOperation = 'source-over'; const gg = c.createRadialGradient(V.vw / 2, V.vh / 2, Math.min(V.vw, V.vh) * 0.3, V.vw / 2, V.vh / 2, Math.hypot(V.vw, V.vh) * 0.6); gg.addColorStop(0, 'rgba(8,12,40,0)'); gg.addColorStop(1, `rgba(8,12,40,${0.16 * nightK})`); c.fillStyle = gg; c.fillRect(0, 0, V.vw, V.vh); }
  // gece ışıkları: yapılar sıcak ışık saçar
  if (nightK > 0.25 && !low) {
    c.globalCompositeOperation = 'lighter'; const ts = V.ts; let n = 0;
    for (const b of g.ents) {
      if (b.dead || b.k !== 'b' || !b.done || b.type === 'mine' || b.type === 'wall' || b.type === 'bridge' || b.type === 'farm') continue;
      const d = BLD[b.type]; if (d.eng) continue; const cc = Sim.centerOf(b), px = sx(cc.x), py = sy(cc.y), rr = d.s * ts * (b.type === 'tower' || b.type === 'fortress' ? 1.1 : 0.9);
      if (px < -rr || py < -rr || px > V.vw + rr || py > V.vh + rr) continue; if (b.owner !== V.ME && !V.g.owners[V.ME].vis[Math.floor(cc.y) * W + Math.floor(cc.x)]) continue;
      const fl = 0.88 + 0.12 * Math.sin(V.time * 7 + b.id), R2 = rr * 1.45, gg = c.createRadialGradient(px, py + rr * 0.1, 0, px, py + rr * 0.1, R2); gg.addColorStop(0, `rgba(255,205,125,${0.62 * nightK * fl})`); gg.addColorStop(0.5, `rgba(255,170,80,${0.28 * nightK * fl})`); gg.addColorStop(1, 'rgba(255,130,40,0)'); c.fillStyle = gg; c.beginPath(); c.arc(px, py + rr * 0.1, R2, 0, 6.283); c.fill();
      // kandiller: giriş önünde iki fener
      const sw = d.s * ts; for (const lx of [-0.04, 1.04]) { const lx0 = px - sw / 2 + sw * lx, ly0 = py + sw * 0.46; const lg = c.createRadialGradient(lx0, ly0, 0, lx0, ly0, sw * 0.42); lg.addColorStop(0, `rgba(255,225,150,${0.85 * nightK * fl})`); lg.addColorStop(1, 'rgba(255,160,60,0)'); c.fillStyle = lg; c.beginPath(); c.arc(lx0, ly0, sw * 0.42, 0, 6.283); c.fill(); c.fillStyle = `rgba(255,240,190,${0.9 * nightK})`; c.beginPath(); c.arc(lx0, ly0, Math.max(1.6, sw * 0.025), 0, 6.283); c.fill(); }
      if (++n > 70) break;
    }
  }
  c.restore();
}
function sstepR(a, b, x) { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
function makeMist() { const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d'); let seed = 31; const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 40; i++) { const px = R() * 256, py = R() * 256, rr = 20 + R() * 46; for (const ox of [-256, 0, 256]) for (const oy of [-256, 0, 256]) { const gg = x.createRadialGradient(px + ox, py + oy, 0, px + ox, py + oy, rr); gg.addColorStop(0, 'rgba(225,232,240,.55)'); gg.addColorStop(1, 'rgba(225,232,240,0)'); x.fillStyle = gg; x.fillRect(px + ox - rr, py + oy - rr, rr * 2, rr * 2); } } return cv; }
function drawWeather(c, V, dt) {
  const g = V.g, e = g.env; if (!e || e.weather === 'clear' || e.ws < 0.02) return;
  const ws = e.ws, t = V.time, w = V.vw, h = V.vh; c.save();
  if (e.weather === 'rain' || e.weather === 'storm') {
    const storm = e.weather === 'storm', n = Math.floor((storm ? 240 : 130) * ws * (low ? 0.5 : 1) * Math.max(0.6, w * h / 1.1e6));
    c.fillStyle = `rgba(40,56,86,${0.16 * ws})`; c.fillRect(0, 0, w, h);
    c.strokeStyle = `rgba(200,218,240,${0.32 + (storm ? 0.1 : 0)})`; c.lineWidth = storm ? 1.4 : 1; const slant = storm ? 0.32 : 0.14;
    c.beginPath();
    for (let i = 0; i < n; i++) { const sp = 820 + (i % 5) * 90, len = 14 + (i % 4) * 5, x0 = ((i * 97.3 + t * (storm ? 260 : 110) * (0.6 + (i % 3) * 0.3)) % (w + 80)) - 40, y0 = (i * 53.7 + t * sp) % (h + 40) - 20; c.moveTo(x0, y0); c.lineTo(x0 - len * slant, y0 + len); }
    c.stroke();
    if (!low) { c.fillStyle = 'rgba(200,220,240,.22)'; for (let i = 0; i < 26 * ws; i++) { const k = ((t * 2.2 + i * 0.37) % 1), x0 = (i * 211.3 + Math.floor(t * 2.2 + i * 0.37) * 97) % w, y0 = (i * 131.1 + Math.floor(t * 2.2 + i * 0.37) * 41) % h; c.globalAlpha = (1 - k) * 0.7; c.beginPath(); c.ellipse(x0, y0, 2 + k * 7, 1 + k * 3, 0, 0, 6.283); c.fill(); } c.globalAlpha = 1; }
    if (storm) { // şimşek
      const kk = Math.floor(t / 6.5), hh = hash(kk, 7, 3), ph = t - kk * 6.5; let fl = 0;
      if (hh < 0.7) { const t0 = 0.6 + hh * 4; if (ph > t0 && ph < t0 + 0.12) fl = 0.55; else if (ph > t0 + 0.2 && ph < t0 + 0.3) fl = 0.35; if (ph > t0 && lastFlashK !== kk) { lastFlashK = kk; if (window.GameAudio && GameAudio.sfx.thunder) GameAudio.sfx.thunder(0.9, 0); } }
      if (fl) { c.fillStyle = `rgba(225,235,255,${fl * ws})`; c.fillRect(0, 0, w, h); }
    }
  } else if (e.weather === 'fog') {
    c.fillStyle = `rgba(168,180,192,${0.2 * ws})`; c.fillRect(0, 0, w, h);
    if (!low) { if (!mistPat) mistPat = c.createPattern(makeMist(), 'repeat'); c.globalAlpha = 0.5 * ws; c.fillStyle = mistPat; c.save(); c.translate((t * 14) % 256, (t * 5) % 256); c.fillRect(-256, -256, w + 512, h + 512); c.restore(); c.globalAlpha = 0.35 * ws; c.save(); c.translate(-(t * 9) % 256, (t * 7) % 256); c.fillRect(-256, -256, w + 512, h + 512); c.restore(); c.globalAlpha = 1; }
  }
  c.restore();
}

/* ---------- mobil alaylar: çok asker 6 temsilciyle çizilir, üstüne sancak ---------- */
function squadPrep(V) {
  V.squadReps = new Set(); V.squadsInfo = {}; if (!V.squadMode) return;
  const m = {}; for (const e of V.g.ents) { if (e.dead || e.k !== 'u' || e.owner !== V.ME || !e.squad) continue; (m[e.squad] = m[e.squad] || []).push(e); }
  for (const k in m) {
    const a = m[k].sort((p, q) => p.id - q.id); let cx = 0, cy = 0, hp = 0, mh = 0; for (const e of a) { cx += e.x; cy += e.y; hp += e.hp; mh += e.maxhp; }
    V.squadsInfo[k] = { n: a.length, x: cx / a.length, y: cy / a.length, hp: hp / mh };
    for (let i = 0; i < Math.min(6, a.length); i++) V.squadReps.add(a[i].id);
  }
}
function drawSquadBanners(c, V) {
  if (!V.squadMode) return;
  for (const k in V.squadsInfo) {
    const s = V.squadsInfo[k], x = (s.x - V.cam.x) * V.ts, y = (s.y - V.cam.y) * V.ts, sel = V.squadSel === +k, by = y - V.ts * 1.5, col = TEAM[V.ME];
    if (x < -60 || y < -60 || x > V.vw + 60 || y > V.vh + 120) continue;
    c.save();
    if (sel) { c.strokeStyle = 'rgba(255,214,90,.9)'; c.lineWidth = 2.5; c.setLineDash([9, 7]); c.lineDashOffset = -V.time * 24; c.beginPath(); c.ellipse(x, y + V.ts * 0.2, V.ts * 1.7, V.ts * 1.1, 0, 0, 6.283); c.stroke(); c.setLineDash([]); }
    c.strokeStyle = '#3a2a10'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, by + 22); c.lineTo(x, y - V.ts * 0.6); c.stroke();
    const w = 44, h = 28; c.fillStyle = col; c.strokeStyle = sel ? '#ffd86a' : '#10100a'; c.lineWidth = sel ? 3 : 2; c.beginPath(); c.moveTo(x - w / 2, by - h / 2); c.lineTo(x + w / 2, by - h / 2); c.lineTo(x + w / 2, by + h / 2 - 4); c.lineTo(x, by + h / 2 + 6); c.lineTo(x - w / 2, by + h / 2 - 4); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '800 15px system-ui'; c.fillText(String(s.n), x, by - 1);
    c.font = '700 10px system-ui'; c.fillStyle = '#ffe9a8'; c.fillText(String(k), x - w / 2 + 7, by - h / 2 + 7);
    const bw = 46; c.fillStyle = 'rgba(0,0,0,.65)'; c.fillRect(x - bw / 2, by + h / 2 + 8, bw, 5); c.fillStyle = s.hp > 0.5 ? '#58c878' : s.hp > 0.25 ? '#e0b030' : '#e05040'; c.fillRect(x - bw / 2 + 1, by + h / 2 + 9, (bw - 2) * Math.max(0, Math.min(1, s.hp)), 3);
    c.restore();
  }
}
function draw(c, V, dt) {
  const g = V.g, ts = V.ts, cam = V.cam, ME = V.ME, me = g.owners[ME];
  V.selSet = new Set(V.sel); squadPrep(V);
  cloudT += dt;
  shake = Math.max(0, shake - dt * 2.8);
  c.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
  c.fillStyle = '#0b0f08'; c.fillRect(0, 0, V.vw, V.vh);
  c.save();
  if (shake > 0.01) c.translate((rnd() - 0.5) * shake * 10, (rnd() - 0.5) * shake * 10);
  const sx = x => (x - cam.x) * ts, sy = y => (y - cam.y) * ts;
  c.imageSmoothingEnabled = true;
  { // yalnız ekranda görünen zemin parçasını çiz
    const k = groundCv.width / W, gx0 = clamp(cam.x, 0, W), gy0 = clamp(cam.y, 0, H), gx1 = clamp(cam.x + V.vw / ts, 0, W), gy1 = clamp(cam.y + V.vh / ts, 0, H);
    if (gx1 > gx0 && gy1 > gy0) c.drawImage(groundCv, gx0 * k, gy0 * k, (gx1 - gx0) * k, (gy1 - gy0) * k, sx(gx0), sy(gy0), (gx1 - gx0) * ts, (gy1 - gy0) * ts);
  }
  const view = { x0: cam.x - 3, y0: cam.y - 3, x1: cam.x + V.vw / ts + 3, y1: cam.y + V.vh / ts + 3 };
  const inView = (x, y) => x > view.x0 && x < view.x1 && y > view.y0 && y < view.y1;
  const expl = (x, y) => me.explored[Math.floor(y) * W + Math.floor(x)] === 1;
  const vis = (x, y) => me.vis[Math.floor(y) * W + Math.floor(x)] === 1;
  // su ışıltısı
  if (!low) {
    const t = V.time, x0 = Math.max(0, Math.floor(view.x0)), x1 = Math.min(W - 1, Math.ceil(view.x1)), y0 = Math.max(0, Math.floor(view.y0)), y1 = Math.min(H - 1, Math.ceil(view.y1));
    c.lineWidth = 1.5;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const i = y * W + x; if (!g.ter[i] || (x * 7 + y * 13) % 3 !== 0 || !me.explored[i]) continue;
      const a = 0.12 + 0.12 * Math.sin(t * 1.4 + x * 1.3 + y * 0.7); c.strokeStyle = `rgba(255,255,255,${a})`;
      const yy = sy(y) + ts * (0.5 + 0.18 * Math.sin(t * 1.2 + x * 1.7 + y)); c.beginPath(); c.moveTo(sx(x) + ts * 0.2, yy); c.quadraticCurveTo(sx(x) + ts * 0.5, yy - ts * 0.1, sx(x) + ts * 0.8, yy); c.stroke();
    }
  }
  // iz ve enkaz
  for (let i = decals.length - 1; i >= 0; i--) {
    const d = decals[i]; d.life -= dt; if (d.life <= 0) { decals.splice(i, 1); continue; }
    const a = Math.min(1, d.life / (d.max * 0.3)), x = sx(d.x), y = sy(d.y); if (!inView(d.x, d.y)) continue;
    if (d.type === 'stain') { const gg = c.createRadialGradient(x, y, 0, x, y, d.r * ts); gg.addColorStop(0, `rgba(${d.col},${0.4 * a})`); gg.addColorStop(1, `rgba(${d.col},0)`); c.fillStyle = gg; c.beginPath(); c.ellipse(x, y, d.r * ts * 1.3, d.r * ts * 0.9, 0, 0, 6.283); c.fill(); }
    else { c.globalAlpha = a; ell(c, x, y, d.s * ts * 0.5, d.s * ts * 0.4, 0, 'rgba(30,24,18,.5)'); for (const p of d.pieces) { c.fillStyle = p[5] < 0.5 ? '#6a5a48' : '#8a8a90'; c.save(); c.translate(x + p[0] * ts, y + p[1] * ts); c.rotate(p[4]); c.fillRect(-p[2] * ts / 2, -p[3] * ts / 2, p[2] * ts, p[3] * ts); c.restore(); } c.globalAlpha = 1; }
  }
  // ateş bölgeleri
  for (const z of g.zones) {
    const t = V.time, gr = c.createRadialGradient(sx(z.x), sy(z.y), 0, sx(z.x), sy(z.y), z.r * ts);
    gr.addColorStop(0, 'rgba(255,200,60,.5)'); gr.addColorStop(0.6, 'rgba(255,90,20,.35)'); gr.addColorStop(1, 'rgba(255,60,0,0)');
    c.fillStyle = gr; c.beginPath(); c.ellipse(sx(z.x), sy(z.y), z.r * ts, z.r * ts * 0.85, 0, 0, 6.283); c.fill();
    if (dt > 0) { const n = z.r * z.r * dt * 14; for (let i = 0; i < n; i++) { const a = rnd() * 6.283, rr = Math.sqrt(rnd()) * z.r; fireAt(z.x + Math.cos(a) * rr, z.y + Math.sin(a) * rr * 0.85, 1, 0.1); } if (rnd() < dt * 6) smokeAt(z.x + (rnd() - 0.5) * z.r, z.y + (rnd() - 0.5) * z.r, 1, 0.4, 0.4); }
  }
  // yeni efektler -> parçacık
  for (const f of g.fx) if (!f._s && (!f.delay || f.max - f.life >= f.delay)) { f._s = true; spawnFx(f, V); }
  // varlıklar
  if (ghostG !== g) { ghosts.clear(); ageSeen.clear(); ghostG = g; }
  const list = [], air = [], workers = {};
  for (const e of g.ents) {
    if (e.dead) continue;
    if (e.k === 'u') {
      if (e.hidden) { if (e.owner === ME) workers[e.target] = (workers[e.target] || 0) + 1; continue; }
      if (!inView(e.x, e.y)) continue; if (e.owner !== ME && !vis(e.x, e.y)) continue; if (e.st.stealth && e.owner !== ME && !(e.seen && e.seen[ME])) continue; if (e.st.air) air.push(e); else list.push([e.y, e]);
    } else {
      const cc = Sim.centerOf(e);
      if (e.k === 'b' && e.owner >= 0 && e.owner !== ME && e.type !== 'mine') { if (vis(cc.x, cc.y)) ghosts.set(e.id, Object.assign({}, e, { ghost: true })); else continue; }
      if (!inView(cc.x, cc.y)) continue; if (e.k !== 'b' && e.owner !== ME && !expl(cc.x, cc.y)) continue; if (e.type === 'mine' && !Sim.mineVisible(g, ME, e)) continue;
      list.push([e.k === 'b' ? e.ty + BLD[e.type].s : e.ty + RESDEF[e.type].s, e]);
    }
  }
  for (const [id, gh] of ghosts) {
    const real = g.byId.get(id), gc = Sim.centerOf(gh), seenNow = vis(gc.x, gc.y);
    if (real && !real.dead && seenNow) continue;
    if ((!real || real.dead) && seenNow) { ghosts.delete(id); continue; }
    if (inView(gc.x, gc.y)) list.push([gh.ty + BLD[gh.type].s, gh]);
  }
  list.sort((a, b) => a[0] - b[0]);
  const pulse = 1 + 0.06 * Math.sin(V.time * 6);
  for (const [, e] of list) if (V.selSet.has(e.id) && !(V.squadMode && e.squad && e.owner === ME)) {
    if (e.k === 'u') {
      const rr = e.st.r * ts;
      c.strokeStyle = e.owner === ME ? 'rgba(120,255,150,.95)' : 'rgba(255,207,92,.95)'; c.lineWidth = 2;
      c.beginPath(); c.ellipse(sx(e.x), sy(e.y) + rr * 0.55, rr * 1.35 * pulse, rr * 0.85 * pulse, 0, 0, 6.283); c.stroke();
      c.strokeStyle = 'rgba(120,255,150,.25)'; c.lineWidth = 5; c.stroke();
    } else {
      const r = Sim.rectOf(e), col = e.owner === ME ? '#7dff9a' : e.owner < 0 ? '#f0f0f0' : '#ffcf5c', x = sx(r.x0) - 3, y = sy(r.y0) - 3, w = (r.x1 - r.x0) * ts + 6, h = (r.y1 - r.y0) * ts + 6, L = Math.min(w, h) * 0.28;
      c.strokeStyle = col; c.lineWidth = 3; c.beginPath();
      c.moveTo(x, y + L); c.lineTo(x, y); c.lineTo(x + L, y); c.moveTo(x + w - L, y); c.lineTo(x + w, y); c.lineTo(x + w, y + L);
      c.moveTo(x + w, y + h - L); c.lineTo(x + w, y + h); c.lineTo(x + w - L, y + h); c.moveTo(x + L, y + h); c.lineTo(x, y + h); c.lineTo(x, y + h - L); c.stroke();
    }
  }
  for (const [, e] of list) {
    if (e.k === 'r') { drawRes(c, V, e); if (workers[e.id]) drawBadge(c, V, e, workers[e.id]); }
    else if (e.k === 'b') { drawBld(c, V, e); if (workers[e.id]) drawBadge(c, V, e, workers[e.id]); }
    else if (!(V.squadMode && e.squad && e.owner === ME && !V.squadReps.has(e.id))) drawUnit(c, V, e, dt);
  }
  air.sort((a, b) => a.y - b.y);
  for (const e of air) {
    if (V.selSet.has(e.id) && !(V.squadMode && e.squad && e.owner === ME)) { const rr = e.st.r * ts, lift = (e.st.alt || 1) * ts; c.strokeStyle = 'rgba(120,255,150,.9)'; c.lineWidth = 2; c.beginPath(); c.ellipse(sx(e.x), sy(e.y) + rr * 0.4, rr * 1.2 * pulse, rr * 0.7 * pulse, 0, 0, 6.283); c.stroke(); c.setLineDash([3, 4]); c.beginPath(); c.moveTo(sx(e.x), sy(e.y) + rr * 0.2); c.lineTo(sx(e.x), sy(e.y) - lift); c.stroke(); c.setLineDash([]); }
    if (!(V.squadMode && e.squad && e.owner === ME && !V.squadReps.has(e.id))) drawUnit(c, V, e, dt);
  }
  drawSquadBanners(c, V);

  // işçi parçacıkları ve inşaat kıvılcımı
  if (dt > 0) for (const u of g.ents) {
    if (u.dead || u.k !== 'u') continue;
    if (u.hidden && u.owner === ME && u.rpos && rnd() < dt * 1.3 && inView(u.rpos.x, u.rpos.y)) {
      const r = g.byId.get(u.target); if (!r) continue;
      if (r.type === 'tree') { P({ type: 'chip', x: u.rpos.x + (rnd() - 0.5) * 0.4, y: u.rpos.y + 0.2, z: 0.4, vx: (rnd() - 0.5) * 1.2, vz: 1.4, grav: 5, life: 0.5, size: 0.04, col: rnd() < 0.5 ? '#8b5a2b' : '#2f7a35' }); }
      else if (r.type === 'gold') { P({ type: 'twinkle', x: u.rpos.x + (rnd() - 0.5) * 1.2, y: u.rpos.y + (rnd() - 0.5) * 0.8, z: 0.4, life: 0.5, size: 0.05 }); }
      else if (r.type === 'berry') { P({ type: 'chip', x: u.rpos.x + (rnd() - 0.5) * 0.4, y: u.rpos.y + 0.2, z: 0.3, vx: (rnd() - 0.5), vz: 1.2, grav: 5, life: 0.45, size: 0.04, col: '#d6264a' }); }
    }
    if (u.order === 'build' && rnd() < dt * 2.2 && vis(u.x, u.y)) { const b = g.byId.get(u.target); const rc = b && !b.dead ? Sim.rectOf(b) : null; if (rc && Math.hypot(Math.max(0, rc.x0 - u.x, u.x - rc.x1), Math.max(0, rc.y0 - u.y, u.y - rc.y1)) < 0.9) { const cc = Sim.centerOf(b); sparkAt(u.x + Math.cos(u.face) * 0.4, u.y + Math.sin(u.face) * 0.4, 2, 1.3, 0.3); if (rnd() < 0.4) dustAt(cc.x + (rnd() - 0.5) * BLD[b.type].s, cc.y + (rnd() - 0.5) * BLD[b.type].s * 0.4, 1, 0.3); } }
  }
  for (const f of g.fx) drawFxShape(c, V, f);
  drawParticles(c, V, dt);
  // bulut gölgeleri
  if (!low) {
    c.fillStyle = 'rgba(0,12,24,.05)';
    for (let i = 0; i < 7; i++) {
      const bx = ((i * 211.7 + cloudT * (3 + i % 3)) % (W + 30)) - 15, by = (i * 137.3 % H), cx = sx(bx), cy = sy(by);
      c.beginPath(); c.ellipse(cx, cy, ts * (5 + i % 3 * 2), ts * (3 + i % 2 * 2), 0.3, 0, 6.283); c.fill();
    }
  }
  drawDayNight(c, V, sx, sy);
  // sis
  {
    const d = fogImg.data, f = Math.min(1, Math.max(dt, 0.016) * 5);
    for (let i = 0; i < W * H; i++) { const tg = me.vis[i] ? 0 : (me.explored[i] ? 212 : 247); fogA[i] += (tg - fogA[i]) * f; d[i * 4] = 8; d[i * 4 + 1] = 12; d[i * 4 + 2] = 20; d[i * 4 + 3] = fogA[i]; }
    fogCtx.putImageData(fogImg, 0, 0);
    const h = fogHiCtx; h.globalCompositeOperation = 'source-over'; h.globalAlpha = 1; h.fillStyle = 'rgba(8,12,20,.97)'; h.fillRect(0, 0, W * FS, H * FS); h.clearRect(0, 0, W * FS, H * FS);
    h.imageSmoothingEnabled = true; h.filter = 'blur(5px)'; h.drawImage(fogCv, 0, 0, W, H, -FS, -FS, W * FS + 2 * FS, H * FS + 2 * FS); h.filter = 'none';
    if (!low) { if (!cloudPat) cloudPat = makeCloudPat(); h.globalCompositeOperation = 'source-atop'; h.globalAlpha = 0.2; h.fillStyle = cloudPat; const off = (V.time * 5) % 256; h.save(); h.translate(off, off * 0.35); h.fillRect(-256, -256, W * FS + 512, H * FS + 512); h.restore(); h.globalAlpha = 1; h.globalCompositeOperation = 'source-over'; }
    c.drawImage(fogHi, 0, 0, W * FS, H * FS, sx(0), sy(0), W * ts, H * ts);
  }
  for (const f of g.fx) if (f.t === 'warn') drawFxShape(c, V, f);
  // yerleştirme hayaleti
  if (V.wallTiles) {
    for (const [x, y] of V.wallTiles) { const ok = Sim.canPlace(g, 'wall', x, y); c.fillStyle = ok ? 'rgba(80,255,120,.4)' : 'rgba(255,60,60,.45)'; c.fillRect(sx(x), sy(y), ts, ts); c.strokeStyle = ok ? '#7dff9a' : '#ff5c5c'; c.lineWidth = 1.5; c.strokeRect(sx(x), sy(y), ts, ts); }
  } else if (V.mode && V.mode.k === 'place' && V.mouse.in) {
    const s = BLD[V.mode.type].s, tx = Math.round(V.mouse.wx - s / 2), ty = Math.round(V.mouse.wy - s / 2);
    const ok = Sim.canPlace(g, V.mode.type, tx, ty) && me.explored[Math.min(H - 1, ty + 1) * W + Math.min(W - 1, tx + 1)];
    c.fillStyle = ok ? 'rgba(80,255,120,.32)' : 'rgba(255,60,60,.38)'; c.fillRect(sx(tx), sy(ty), s * ts, s * ts);
    c.strokeStyle = ok ? '#7dff9a' : '#ff5c5c'; c.lineWidth = 2; c.setLineDash([8, 5]); c.strokeRect(sx(tx), sy(ty), s * ts, s * ts); c.setLineDash([]);
    c.font = `${s * ts * 0.5}px serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff'; c.fillText(ICON[V.mode.type], sx(tx + s / 2), sy(ty + s / 2));
  }
  if (V.mode && V.mode.k === 'power' && V.mouse.in) {
    const p = V.power, pulse2 = 1 + 0.03 * Math.sin(V.time * 8);
    c.strokeStyle = '#ffb347'; c.lineWidth = 3; c.setLineDash([8, 6]); c.beginPath(); c.ellipse(sx(V.mouse.wx), sy(V.mouse.wy), p.radius * ts * pulse2, p.radius * ts * pulse2 * 0.85, 0, 0, 6.283); c.stroke(); c.setLineDash([]);
    c.fillStyle = 'rgba(255,150,40,.15)'; c.fill();
  }
  if (V.drag && V.drag.moved) {
    c.strokeStyle = '#7dff9a'; c.lineWidth = 1.5; c.fillStyle = 'rgba(125,255,154,.1)';
    const x = Math.min(V.drag.x0, V.mouse.x), y = Math.min(V.drag.y0, V.mouse.y), w = Math.abs(V.mouse.x - V.drag.x0), h = Math.abs(V.mouse.y - V.drag.y0);
    c.fillRect(x, y, w, h); c.strokeRect(x, y, w, h);
  }
  drawWeather(c, V, dt);
  const now = performance.now();
  for (const p of V.pings) { const k = (now - p.t) / 3000; c.strokeStyle = `rgba(255,70,60,${1 - k})`; c.lineWidth = 3; c.beginPath(); c.arc(sx(p.x), sy(p.y), 10 + k * 60, 0, 6.283); c.stroke(); c.beginPath(); c.arc(sx(p.x), sy(p.y), 4 + k * 30, 0, 6.283); c.stroke(); }
  if (g.camp && g.camp.marks) for (const m of g.camp.marks) {
    if (m.done) continue; const mx = sx(m.x), my = sy(m.y), pu = 0.5 + 0.5 * Math.sin(now / 350), R = m.r * ts;
    c.save(); c.strokeStyle = `rgba(255,214,90,${0.5 + pu * 0.4})`; c.lineWidth = 3; c.setLineDash([10, 8]); c.lineDashOffset = -now / 40; c.beginPath(); c.arc(mx, my, R, 0, 6.283); c.stroke(); c.setLineDash([]);
    c.fillStyle = `rgba(255,214,90,${0.08 + pu * 0.08})`; c.fill();
    c.strokeStyle = '#5a4020'; c.lineWidth = 3; c.beginPath(); c.moveTo(mx, my + 8); c.lineTo(mx, my - 34); c.stroke(); c.fillStyle = '#e8c24a'; c.beginPath(); c.moveTo(mx, my - 34); c.lineTo(mx + 22, my - 27 + pu * 2); c.lineTo(mx, my - 20); c.closePath(); c.fill();
    if (m.label) { c.font = '700 12px system-ui'; c.textAlign = 'center'; c.fillStyle = '#fff'; c.strokeStyle = '#000'; c.lineWidth = 3; c.strokeText(m.label, mx, my - 42); c.fillText(m.label, mx, my - 42); }
    c.restore();
  }
  c.restore();
  // vinyet
  const key = V.vw + 'x' + V.vh;
  if (key !== vigKey) { vigKey = key; vig = c.createRadialGradient(V.vw / 2, V.vh / 2, Math.min(V.vw, V.vh) * 0.45, V.vw / 2, V.vh / 2, Math.hypot(V.vw, V.vh) * 0.62); vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,.42)'); }
  if (!low) { c.fillStyle = vig; c.fillRect(0, 0, V.vw, V.vh); }
  if (anim.size > 600 && rnd() < 0.02) { const live = new Set(g.ents.map(e => e.id)); for (const k of anim.keys()) if (!live.has(k)) anim.delete(k); }
}

root.RenderKit = { grad, rrect, circ, ell, flag, smokeAt, fireAt, sparkAt, dustAt, rnd, registerBld: (t, f) => { BLDART[t] = f; } };
root.Render = { init, draw, ICON, TEAM, setLow: v => { low = !!v; }, isLow: () => low, stats: () => ({ parts: parts.length, decals: decals.length, shake }), addShake: (a) => { shake = Math.min(1.2, shake + a); } };
})(typeof window !== 'undefined' ? window : globalThis);
