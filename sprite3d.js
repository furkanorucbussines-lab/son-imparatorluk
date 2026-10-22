/* Son İmparatorluk - birim çizimi: küçük bir "ilkel 3B" çizici (kapsül, elipsoid, kutu, disk) → ayakta duran, gölgeli, kontur çizgili karakterler.
   Harici görsel yok; her birim her karede yönüne göre kodla çizilir. Yerel eksenler: x = ileri, y = sağ, z = yukarı (birim = r). */
(function (root) {
'use strict';
const PY = 0.62, PZ = 0.92, TAU = 6.2832;
let c, OX, OY, SC, CF, SF, L, LOW = false;
const cache = new Map(), rgbc = new Map();
function rgb(s) { let v = rgbc.get(s); if (v) return v; let m; if (s[0] === '#') { if (s.length === 4) v = [parseInt(s[1] + s[1], 16), parseInt(s[2] + s[2], 16), parseInt(s[3] + s[3], 16)]; else v = [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)]; } else { m = s.match(/[\d.]+/g); v = [+m[0], +m[1], +m[2]]; } rgbc.set(s, v); return v; }
function sh(s, f) { const k = s + f.toFixed(2); let v = cache.get(k); if (v) return v; const q = rgb(s); v = 'rgb(' + Math.min(255, Math.round(q[0] * f)) + ',' + Math.min(255, Math.round(q[1] * f)) + ',' + Math.min(255, Math.round(q[2] * f)) + ')'; cache.set(k, v); return v; }
const OUT = 'rgba(8,6,4,.62)';

function P(x, y, z) { const mx = x * CF - y * SF, my = x * SF + y * CF; return [OX + mx * SC, OY + (my * PY - z * PZ) * SC, my]; }
function begin(ctx, x, y, scale, face) { c = ctx; OX = x; OY = y; SC = scale; CF = Math.cos(face); SF = Math.sin(face); L = []; }
function sph(x, y, z, rx, ry, rz, col, bias) { const p = P(x, y, z); L.push({ k: 0, d: p[2] + (bias || 0), x: p[0], y: p[1], ex: Math.hypot(rx * CF, ry * SF) * SC, ey: Math.hypot(PY * Math.hypot(rx * SF, ry * CF), PZ * rz) * SC, col }); }
function cap(x1, y1, z1, x2, y2, z2, r, col, bias) { const a = P(x1, y1, z1), b = P(x2, y2, z2); L.push({ k: 1, d: (a[2] + b[2]) / 2 + (bias || 0), ax: a[0], ay: a[1], bx: b[0], by: b[1], w: Math.max(1.2, 2 * r * SC * 0.95), col }); }
function disc(x, y, z, nx, ny, nz, r, col, bias) {
  let ux, uy, uz, vx, vy, vz;
  if (Math.abs(nz) > 0.9) { ux = 1; uy = 0; uz = 0; vx = 0; vy = 1; vz = 0; } else { const l = Math.hypot(nx, ny) || 1; ux = ny / l; uy = -nx / l; uz = 0; vx = ny * uz - nz * uy; vy = nz * ux - nx * uz; vz = nx * uy - ny * ux; }
  const pts = [], n = LOW ? 10 : 16; for (let i = 0; i < n; i++) { const t = i / n * TAU, ct = Math.cos(t) * r, st = Math.sin(t) * r; const q = P(x + ux * ct + vx * st, y + uy * ct + vy * st, z + uz * ct + vz * st); pts.push(q[0], q[1]); }
  const c0 = P(x, y, z), front = (nx * SF + ny * CF) > 0 || Math.abs(nz) > 0.5; L.push({ k: 2, d: c0[2] + (bias || 0), pts, col: front ? col : sh(col, 0.62), cx: c0[0], cy: c0[1], front });
}
function box(x, y, z, hx, hy, hz, col, bias) {
  const co = []; for (let i = 0; i < 8; i++) { const q = P(x + (i & 1 ? hx : -hx), y + (i & 2 ? hy : -hy), z + (i & 4 ? hz : -hz)); co.push(q[0], q[1]); }
  const c0 = P(x, y, z), faces = [];
  const F = [[1, 0, 0, [1, 3, 7, 5]], [-1, 0, 0, [0, 2, 6, 4]], [0, 1, 0, [2, 3, 7, 6]], [0, -1, 0, [0, 1, 5, 4]], [0, 0, 1, [4, 5, 7, 6]]];
  for (const [nx, ny, nz, idx] of F) {
    const nxm = nx * CF - ny * SF, nym = nx * SF + ny * CF;
    if (nz === 0 && nym <= 0.02) continue;
    const f = nz ? 1.14 : Math.max(0.5, Math.min(1.05, 0.82 - nxm * 0.26 - nym * 0.1));
    faces.push({ idx, f, top: !!nz });
  }
  faces.sort((a, b) => a.top - b.top);
  L.push({ k: 3, d: c0[2] + (bias || 0), co, faces, col });
}
function flash(x, y, z, r) { const p = P(x, y, z); L.push({ k: 4, d: 99, x: p[0], y: p[1], r: r * SC }); }
function flush() {
  L.sort((a, b) => a.d - b.d);
  for (const o of L) {
    if (o.k === 0) {
      c.fillStyle = sh(o.col, 0.88); c.beginPath(); c.ellipse(o.x, o.y, o.ex, o.ey, 0, 0, TAU); c.fill();
      if (!LOW) { c.fillStyle = sh(o.col, 1.28); c.globalAlpha = 0.55; c.beginPath(); c.ellipse(o.x - o.ex * 0.3, o.y - o.ey * 0.34, o.ex * 0.55, o.ey * 0.5, 0, 0, TAU); c.fill(); c.globalAlpha = 1; }
      c.strokeStyle = OUT; c.lineWidth = 1; c.beginPath(); c.ellipse(o.x, o.y, o.ex, o.ey, 0, 0, TAU); c.stroke();
    } else if (o.k === 1) {
      c.lineCap = 'round'; c.beginPath(); c.moveTo(o.ax, o.ay); c.lineTo(o.bx, o.by);
      c.strokeStyle = OUT; c.lineWidth = o.w + 1.8; c.stroke();
      c.strokeStyle = sh(o.col, 0.92); c.lineWidth = o.w; c.stroke();
      if (!LOW && o.w > 3.5) { c.beginPath(); c.moveTo(o.ax - o.w * 0.16, o.ay - o.w * 0.2); c.lineTo(o.bx - o.w * 0.16, o.by - o.w * 0.2); c.strokeStyle = sh(o.col, 1.3); c.globalAlpha = 0.6; c.lineWidth = o.w * 0.38; c.stroke(); c.globalAlpha = 1; }
    } else if (o.k === 2) {
      c.beginPath(); c.moveTo(o.pts[0], o.pts[1]); for (let i = 2; i < o.pts.length; i += 2) c.lineTo(o.pts[i], o.pts[i + 1]); c.closePath();
      c.fillStyle = sh(o.col, 0.95); c.fill(); c.strokeStyle = OUT; c.lineWidth = 1.1; c.stroke();
    } else if (o.k === 3) {
      for (const f of o.faces) {
        c.beginPath(); c.moveTo(o.co[f.idx[0] * 2], o.co[f.idx[0] * 2 + 1]); for (let i = 1; i < 4; i++) c.lineTo(o.co[f.idx[i] * 2], o.co[f.idx[i] * 2 + 1]); c.closePath();
        c.fillStyle = sh(o.col, f.f); c.fill(); c.strokeStyle = OUT; c.lineWidth = 1; c.stroke();
      }
    } else if (o.k === 4) {
      c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r); g.addColorStop(0, 'rgba(255,240,180,.95)'); g.addColorStop(1, 'rgba(255,120,20,0)'); c.fillStyle = g; c.beginPath(); c.arc(o.x, o.y, o.r, 0, TAU); c.fill(); c.globalCompositeOperation = 'source-over';
    }
  }
}

/* ---------- insan ---------- */
const SKIN = '#e8bf98';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// o: {tunic, pants, hat, hatCol, ...}  S: {st (adım), sw (saldırı 0..1), mv, seat}
function human(o, S) {
  const z0 = S.seat ? 0.92 : 0, st = S.mv ? Math.sin(S.ph) : 0, bob = S.mv && !S.seat ? Math.abs(Math.sin(S.ph)) * 0.07 : 0;
  const tunic = o.tunic, pants = o.pants || '#3a3228';
  // bacaklar
  for (const s of [-1, 1]) {
    const sw = st * s, fx = S.seat ? 0.15 : sw * 0.46, fz = S.seat ? 1.15 : Math.max(0, -Math.cos(S.ph) * s) * (S.mv ? 0.2 : 0);
    cap(0, s * 0.18, 0.98 + z0, fx, s * (S.seat ? 0.5 : 0.2), fz + (S.seat ? 0 : 0.1), 0.14, pants);
    sph(fx + 0.1, s * (S.seat ? 0.5 : 0.2), fz + 0.08, 0.2, 0.13, 0.1, o.boot || '#2a2018');
  }
  const tz = 1.0 + z0 + bob;
  // gövde
  cap(0, 0, tz, 0, 0, tz + 0.66, 0.31, tunic);
  if (o.armor) { cap(0.04, 0, tz + 0.3, 0.04, 0, tz + 0.74, 0.34, o.armor, 0.02); }
  if (o.sash) cap(0, -0.3, tz + 0.6, 0, 0.3, tz + 0.3, 0.07, o.sash, 0.05);
  disc(0, 0, tz + 0.04, 0, 0, 1, 0.33, o.belt || '#4a3420', 0.04);
  if (o.cape) { cap(-0.22, 0, tz + 0.78, -0.4, 0, tz + 0.05, 0.28, o.cape, -0.1); }
  // kollar: elindekini çağıran işlev belirler
  const arms = o.arms ? o.arms(S, tz) : null;
  for (const s of [-1, 1]) {
    const sh0 = [0, s * 0.36, tz + 0.6]; let hand = arms && arms[s] ? arms[s] : [-st * s * 0.3 * (S.mv ? 1 : 0), s * 0.46, tz + 0.05];
    cap(sh0[0], sh0[1], sh0[2], hand[0], hand[1], hand[2], 0.1, o.sleeve || tunic, 0.03);
    sph(hand[0], hand[1], hand[2], 0.1, 0.1, 0.1, SKIN, 0.04);
  }
  // baş
  const hz = tz + 0.98;
  sph(0.02, 0, hz, 0.25, 0.23, 0.26, SKIN);
  sph(0.2, -0.09, hz + 0.03, 0.04, 0.04, 0.04, '#1a1410', 0.3); sph(0.2, 0.09, hz + 0.03, 0.04, 0.04, 0.04, '#1a1410', 0.3);
  if (o.beard) sph(0.15, 0, hz - 0.17, 0.1, 0.15, 0.09, o.beard, 0.1);
  if (o.hat) o.hat(hz, S);
  if (o.extra) o.extra(S, tz);
}

/* ---------- el aletleri ---------- */
const STEEL = '#cfd4dc', WOOD = '#7a5a34', DARK = '#2a2a30';
function swordArm(sw, tz) { const a = -0.2 - sw * 1.5; return { 1: [0.5 + sw * 0.5, 0.46, tz + 0.55 - sw * 0.3], '-1': null }; }
function scimitar(hx, hy, hz, sw) { const dir = [0.5 + sw * 0.7, 0, 0.7 - sw * 0.7]; cap(hx, hy, hz, hx + dir[0], hy, hz + dir[2], 0.05, STEEL, 0.2); cap(hx + dir[0], hy, hz + dir[2], hx + dir[0] + 0.28, hy, hz + dir[2] - 0.12, 0.045, '#e6eaf0', 0.2); cap(hx - 0.05, hy, hz - 0.02, hx + 0.1, hy, hz + 0.05, 0.07, '#c8a23a', 0.21); }
function spear(hx, hy, hz, sw, len) { const th = sw * 0.7; cap(hx - len * 0.35, hy, hz - 0.35 + th, hx + len * 0.65 + th * 0.6, hy, hz + 0.45 - th, 0.04, '#8a6a3a', 0.2); cap(hx + len * 0.62 + th * 0.6, hy, hz + 0.43 - th, hx + len * 0.62 + 0.38 + th * 0.6, hy, hz + 0.58 - th, 0.065, STEEL, 0.21); }
function shield(x, y, z, r, col, rim) { disc(x, y, z, 1, 0, 0.1, r, rim || '#c8a23a', 0.22); disc(x + 0.02, y, z, 1, 0, 0.1, r * 0.82, col, 0.23); sph(x + 0.07, y, z, 0.1, 0.1, 0.1, rim || '#e8d79a', 0.24); }
function bow(S, tz, wood) {
  const pull = S.sw * 0.22, x = 0.62, y = 0.4, z = tz + 0.5;
  cap(x, y, z - 0.75, x + 0.2, y, z - 0.35, 0.04, wood || '#8a5a2a', 0.2); cap(x + 0.2, y, z - 0.35, x + 0.2, y, z + 0.35, 0.04, wood || '#8a5a2a', 0.2); cap(x + 0.2, y, z + 0.35, x, y, z + 0.75, 0.04, wood || '#8a5a2a', 0.2);
  cap(x, y, z - 0.75, x + 0.15 - pull, y, z, 0.015, '#eee', 0.19); cap(x + 0.15 - pull, y, z, x, y, z + 0.75, 0.015, '#eee', 0.19);
  if (S.sw > 0.1) cap(x + 0.15 - pull, y, z, x + 1.1, y, z, 0.02, '#d8c898', 0.2);
}
function gun(S, tz, len, col) { const rc = S.sw * 0.3; cap(0.1 - rc, 0.4, tz + 0.55, len - rc, 0.3, tz + 0.7, 0.07, col || '#4a3420', 0.2); cap(len * 0.5 - rc, 0.34, tz + 0.64, len + 0.1 - rc, 0.3, tz + 0.72, 0.045, '#25252b', 0.21); if (S.sw > 0.55) flash(len + 0.35 - rc, 0.3, tz + 0.72, 0.9); }

/* ---------- birim tanımları (insan) ---------- */
function humanSpec(u, civ, col, cd, cl, S) {
  const bz = civ === 'bizans', t = u.type;
  const T = {
    villager: { tunic: '#9a7a52', pants: '#5a4a32', sash: col, hat: hz => { sph(0.02, 0, hz + 0.2, 0.46, 0.46, 0.09, '#d9c27a', 0.05); sph(0.02, 0, hz + 0.3, 0.22, 0.22, 0.17, '#c8aa5a', 0.06); }, arms: (S2, tz) => { const k = S2.sw; return { 1: [0.45 + k * 0.4, 0.4, tz + 0.5 - k * 0.45], '-1': null }; }, extra: (S2, tz) => { const k = S2.sw, hx = 0.45 + k * 0.4, hz2 = tz + 0.5 - k * 0.45; cap(hx, 0.4, hz2, hx + 0.7, 0.4, hz2 + 0.6 - k * 0.9, 0.04, '#7a5a34', 0.2); cap(hx + 0.7, 0.4, hz2 + 0.6 - k * 0.9, hx + 0.9, 0.4, hz2 + 0.5 - k * 0.9, 0.07, '#8a8a92', 0.21); } },
    engineer: { tunic: '#5a6a80', pants: '#3a3a40', sash: col, hat: hz => { sph(0.02, 0, hz + 0.12, 0.3, 0.29, 0.2, '#f2c230', 0.05); cap(0.12, 0, hz + 0.02, 0.36, 0, hz + 0.02, 0.05, '#d8a810', 0.06); }, arms: (S2, tz) => ({ 1: [0.4 + S2.sw * 0.4, 0.42, tz + 0.5 - S2.sw * 0.4], '-1': null }), extra: (S2, tz) => { const k = S2.sw, hx = 0.4 + k * 0.4, hz2 = tz + 0.5 - k * 0.4; cap(hx, 0.42, hz2, hx + 0.4, 0.42, hz2 + 0.5 - k * 0.8, 0.04, '#6a4a28', 0.2); box(hx + 0.45, 0.42, hz2 + 0.52 - k * 0.8, 0.14, 0.09, 0.09, '#777', 0.21); } },
    inf: bz ? { tunic: '#b02a2a', pants: '#6a4a32', armor: '#aab0ba', cape: '#b02a2a', hat: hz => { sph(0.02, 0, hz + 0.04, 0.29, 0.28, 0.27, '#c8ccd4', 0.05); cap(0.0, 0, hz + 0.28, -0.35, 0, hz + 0.1, 0.07, '#c8302b', 0.1); cap(0.0, -0.1, hz + 0.3, 0.0, 0.1, hz + 0.3, 0.05, '#c8302b', 0.1); }, arms: (S2, tz) => ({ 1: [0.5 + S2.sw * 0.6, 0.42, tz + 0.5], '-1': [0.28, -0.42, tz + 0.5] }), extra: (S2, tz) => { shield(0.3, -0.5, tz + 0.5, 0.45, col, '#e8c24a'); spear(0.5 + S2.sw * 0.6, 0.42, tz + 0.5, S2.sw, 2.0); } }
      : { tunic: col, pants: '#f0ecde', armor: '#8f939c', hat: hz => { sph(0.0, 0, hz + 0.3, 0.2, 0.2, 0.36, '#f2efe6', 0.05); sph(0.0, 0, hz + 0.02, 0.28, 0.27, 0.1, '#c8302b', 0.06); cap(-0.15, 0, hz + 0.3, -0.38, 0, hz - 0.1, 0.08, '#f2efe6', -0.1); }, arms: (S2, tz) => ({ 1: [0.45 + S2.sw * 0.4, 0.42, tz + 0.55 - S2.sw * 0.25], '-1': [0.2, -0.45, tz + 0.5] }), extra: (S2, tz) => { shield(0.2, -0.5, tz + 0.5, 0.42, cd, '#c8a23a'); scimitar(0.45 + S2.sw * 0.4, 0.42, tz + 0.55 - S2.sw * 0.25, S2.sw); }, beard: '#2a1c12' },
    archer: bz ? { tunic: '#7a6a52', pants: '#4a3a28', armor: '#6a5a40', hat: hz => { sph(0.02, 0, hz + 0.08, 0.27, 0.26, 0.25, '#a8acb4', 0.05); sph(0.02, 0, hz + 0.3, 0.1, 0.1, 0.16, '#a8acb4', 0.06); }, arms: (S2, tz) => ({ 1: [0.4 - S2.sw * 0.25, 0.3, tz + 0.55], '-1': [0.65, -0.35, tz + 0.55] }), extra: (S2, tz) => { bow({ sw: S2.sw }, tz, '#7a4a20'); cap(-0.35, 0.3, tz + 0.8, -0.25, 0.1, tz + 0.2, 0.1, '#5a3d22', -0.1); } }
      : { tunic: '#5e6e4a', pants: '#4a3a52', sash: col, hat: hz => { sph(0.02, 0, hz + 0.08, 0.28, 0.27, 0.2, col, 0.05); sph(0.02, 0, hz + 0.22, 0.2, 0.2, 0.12, '#f2efe6', 0.06); }, arms: (S2, tz) => ({ 1: [0.4 - S2.sw * 0.25, 0.3, tz + 0.55], '-1': [0.65, -0.35, tz + 0.55] }), extra: (S2, tz) => { bow({ sw: S2.sw }, tz); cap(-0.35, 0.3, tz + 0.8, -0.25, 0.1, tz + 0.2, 0.1, '#5a3d22', -0.1); }, beard: '#2a1c12' },
    musketeer: bz ? { tunic: '#4a5a8a', pants: '#e8e8ee', armor: '#d8c060', hat: hz => { sph(0.02, 0, hz + 0.1, 0.34, 0.33, 0.1, '#2a2a30', 0.05); sph(0.02, 0, hz + 0.2, 0.22, 0.2, 0.15, '#2a2a30', 0.06); cap(0.0, 0.2, hz + 0.3, -0.2, 0.3, hz + 0.1, 0.05, '#e8e8ee', 0.1); }, arms: (S2, tz) => ({ 1: [0.35 - S2.sw * 0.3, 0.38, tz + 0.55], '-1': [0.9 - S2.sw * 0.3, 0.2, tz + 0.65] }), extra: (S2, tz) => gun(S2, tz, 2.0) }
      : { tunic: '#a83a3a', pants: '#f2efe6', sash: '#e8e8ee', hat: hz => { sph(0.0, 0, hz + 0.3, 0.2, 0.2, 0.36, '#f2efe6', 0.05); sph(0.0, 0, hz + 0.02, 0.28, 0.27, 0.1, col, 0.06); cap(-0.15, 0, hz + 0.3, -0.38, 0, hz - 0.1, 0.08, '#f2efe6', -0.1); }, arms: (S2, tz) => ({ 1: [0.35 - S2.sw * 0.3, 0.38, tz + 0.55], '-1': [0.9 - S2.sw * 0.3, 0.2, tz + 0.65] }), extra: (S2, tz) => gun(S2, tz, 2.0), beard: '#2a1c12' },
    mgun: { tunic: '#6a7258', pants: '#4a5240', armor: '#58604a', hat: hz => { sph(0.02, 0, hz + 0.08, 0.3, 0.29, 0.22, '#56604a', 0.05); }, arms: (S2, tz) => ({ 1: [0.7, 0.2, tz + 0.5], '-1': [0.7, -0.2, tz + 0.5] }), extra: (S2, tz) => { box(0.9, 0, tz + 0.55, 0.65, 0.07, 0.07, '#34343a', 0.2); box(1.6, 0, tz + 0.55, 0.12, 0.1, 0.1, '#1a1a1e', 0.21); cap(0.9, 0, tz + 0.5, 0.65, -0.35, tz - 0.05, 0.03, DARK, 0.15); cap(0.9, 0, tz + 0.5, 0.65, 0.35, tz - 0.05, 0.03, DARK, 0.15); if (S2.sw > 0.1) flash(1.95, 0, tz + 0.55, 1.0); } },
    sniper: { tunic: '#55683e', pants: '#43542f', armor: '#6f8450', hat: hz => { sph(0.02, 0, hz + 0.05, 0.31, 0.3, 0.24, '#55683e', 0.05); sph(0.1, 0.12, hz + 0.1, 0.07, 0.07, 0.07, '#7f9660', 0.06); sph(-0.1, -0.15, hz + 0.2, 0.07, 0.07, 0.07, '#7f9660', 0.06); }, arms: (S2, tz) => ({ 1: [0.4 - S2.sw * 0.2, 0.3, tz + 0.55], '-1': [1.0 - S2.sw * 0.2, 0.15, tz + 0.7] }), extra: (S2, tz) => { const rc = S2.sw * 0.3; cap(-0.2 - rc, 0.3, tz + 0.6, 2.2 - rc, 0.15, tz + 0.75, 0.05, '#2a2418', 0.2); box(1.0 - rc, 0.18, tz + 0.85, 0.2, 0.04, 0.04, '#16161a', 0.21); if (S2.sw > 0.5) flash(2.5 - rc, 0.15, tz + 0.75, 0.8); } },
    rpg: { tunic: '#6a6e4a', pants: '#4a4e34', armor: '#58603e', hat: hz => { sph(0.02, 0, hz + 0.06, 0.3, 0.29, 0.22, '#4a4e34', 0.05); }, arms: (S2, tz) => ({ 1: [0.5, 0.3, tz + 0.7], '-1': [0.9, -0.1, tz + 0.8] }), extra: (S2, tz) => { const rc = S2.sw * 0.3; cap(-0.7 - rc, 0.1, tz + 0.95, 1.4 - rc, 0.2, tz + 0.88, 0.14, '#2c2c32', 0.2); cap(1.4 - rc, 0.2, tz + 0.88, 1.8 - rc, 0.2, tz + 0.87, 0.1, '#c0392b', 0.21); if (S2.sw > 0.3) flash(-0.95 - rc, 0.1, tz + 0.95, 1.0); } },
    demo: { tunic: '#b5651d', pants: '#5a3a1a', hat: hz => { sph(0.02, 0, hz + 0.08, 0.3, 0.29, 0.22, '#cfcfd4', 0.05); }, extra: (S2, tz) => { box(-0.38, 0, tz + 0.4, 0.15, 0.3, 0.3, '#7a7a7e', 0.05); sph(-0.42, 0, tz + 0.5, 0.07, 0.07, 0.07, Math.sin(S2.t * 7) > 0 ? '#ff2a2a' : '#601010', 0.3); } },
    medic: { tunic: '#f2f2f4', pants: '#d8d8de', hat: hz => { sph(0.02, 0, hz + 0.1, 0.28, 0.27, 0.16, '#f2f2f4', 0.05); box(0.22, 0, hz + 0.1, 0.03, 0.12, 0.04, '#d8212a', 0.1); }, extra: (S2, tz) => { box(0.32, 0, tz + 0.4, 0.03, 0.18, 0.06, '#d8212a', 0.1); box(0.32, 0, tz + 0.4, 0.03, 0.06, 0.18, '#d8212a', 0.1); box(-0.4, 0, tz + 0.4, 0.14, 0.22, 0.25, '#cfd4d8', 0.05); } },
    spy: { tunic: '#22222a', pants: '#14141a', cape: '#16161c', hat: hz => { sph(0.0, 0, hz + 0.08, 0.34, 0.33, 0.3, '#16161c', 0.05); }, extra: (S2, tz) => { cap(0.4, 0.4, tz + 0.5, 0.6, 0.4, tz + 0.8, 0.03, '#aab', 0.2); } }
  };
  return T[t === 'spy' && u.disguised && u.owner !== S.me ? 'villager' : t];
}

/* ---------- köpek ---------- */
function dog(u, S, col) {
  const husky = (u.id & 1) === 1, ph = S.ph, mv = S.mv, bounce = mv ? Math.abs(Math.sin(ph)) * 0.1 : 0;
  const coat = husky ? '#8a919c' : '#b98a4e', coat2 = husky ? '#eef1f5' : '#2a2018', dark = husky ? '#5e646e' : '#7a5a30';
  for (let i = 0; i < 4; i++) {
    const front = i < 2, s = i % 2 ? 1 : -1, sw = mv ? Math.sin(ph * 1.2 + (front ? 0 : 3.14) + (i % 2) * 0.6) * 0.5 : 0, lift = mv ? Math.max(0, Math.cos(ph * 1.2 + (front ? 0 : 3.14) + (i % 2) * 0.6)) * 0.14 : 0;
    const hx = front ? 0.5 : -0.5;
    cap(hx, s * 0.2, 0.7 + bounce, hx + sw, s * 0.2, lift, 0.1, front && husky ? coat2 : dark);
    sph(hx + sw + 0.07, s * 0.2, lift + 0.05, 0.13, 0.1, 0.08, husky ? coat2 : '#3a2a18');
  }
  cap(-0.5, 0, 0.82 + bounce, 0.45, 0, 0.86 + bounce, 0.33, coat);
  if (husky) { cap(-0.1, 0, 0.7 + bounce, 0.5, 0, 0.72 + bounce, 0.3, coat2, 0.02); } else { cap(-0.35, 0, 1.08 + bounce, 0.35, 0, 1.08 + bounce, 0.26, coat2, 0.03); }
  sph(0.45, 0, 0.9 + bounce, 0.3, 0.3, 0.32, coat);
  cap(0.5, 0, 0.98 + bounce, 0.85, 0, 1.28 + bounce, 0.21, coat);
  cap(0.62, -0.2, 1.08 + bounce, 0.62, 0.2, 1.08 + bounce, 0.06, col, 0.15);
  const hz = 1.3 + bounce;
  sph(0.92, 0, hz, 0.27, 0.23, 0.24, husky ? coat2 : coat);
  if (husky) sph(0.9, 0, hz + 0.08, 0.26, 0.21, 0.13, coat, 0.02);
  cap(1.05, 0, hz - 0.05, 1.4 + (S.sw ? 0.05 : 0), 0, hz - 0.12, 0.12, husky ? coat2 : '#6a4a28');
  sph(1.5, 0, hz - 0.1, 0.08, 0.08, 0.07, '#111', 0.1);
  if (S.sw > 0.3) { box(1.34, 0, hz - 0.2, 0.08, 0.1, 0.03, '#fff', 0.12); }
  sph(0.97, -0.13, hz + 0.08, 0.05, 0.05, 0.05, husky ? '#4aa8ff' : '#2a1a0c', 0.2); sph(0.97, 0.13, hz + 0.08, 0.05, 0.05, 0.05, husky ? '#4aa8ff' : '#2a1a0c', 0.2);
  for (const s of [-1, 1]) { cap(0.8, s * 0.14, hz + 0.18, 0.78, s * 0.2, hz + 0.5, 0.09, husky ? coat : '#6a4a28', 0.1); }
  const wag = Math.sin(S.t * (mv ? 14 : 5) + u.id) * 0.18;
  if (husky) { cap(-0.55, 0, 0.95 + bounce, -0.8, wag * 0.5, 1.35 + bounce, 0.13, coat2); cap(-0.8, wag * 0.5, 1.35 + bounce, -0.6, wag * 0.3, 1.6 + bounce, 0.12, coat2); }
  else cap(-0.55, 0, 0.9 + bounce, -1.05, wag, 0.55 + bounce, 0.1, '#6a4a28');
}

/* ---------- at ve süvari ---------- */
function horse(u, S, coat, coat2, blanket, armor) {
  const ph = S.ph, mv = S.mv, g = mv ? Math.abs(Math.sin(ph)) * 0.1 : 0;
  for (let i = 0; i < 4; i++) {
    const front = i < 2, s = i % 2 ? 1 : -1, a = ph * 1.1 + (front ? 0 : 3.14) + (i % 2) * 0.5, sw = mv ? Math.sin(a) * 0.6 : 0, lift = mv ? Math.max(0, Math.cos(a)) * 0.25 : 0, hx = front ? 0.85 : -0.8;
    cap(hx, s * 0.24, 1.15 + g, hx + sw, s * 0.24, lift + 0.12, 0.12, front ? coat : coat2);
    sph(hx + sw + 0.05, s * 0.24, lift + 0.07, 0.15, 0.12, 0.1, '#1c1410');
  }
  cap(-0.8, 0, 1.45 + g, 0.75, 0, 1.5 + g, 0.5, coat);
  cap(0.72, 0, 1.75 + g, 1.3, 0, 2.28 + g, 0.3, coat);
  cap(1.3, 0, 2.28 + g, 1.85, 0, 2.0 + g, 0.2, coat); sph(1.88, 0, 1.95 + g, 0.09, 0.1, 0.1, '#1c1410', 0.1);
  for (const s of [-1, 1]) cap(1.25, s * 0.12, 2.42 + g, 1.22, s * 0.14, 2.62 + g, 0.07, coat, 0.1);
  cap(1.1, 0, 2.5 + g, 0.75, 0, 2.0 + g, 0.12, '#1c1410', 0.05);
  const wag = Math.sin(S.t * 7 + u.id) * 0.25;
  cap(-0.85, 0, 1.55 + g, -1.45, wag, 0.8 + g, 0.12, '#1c1410');
  if (blanket) { box(0.0, 0, 1.62 + g, 0.48, 0.5, 0.05, blanket, 0.05); box(0.0, 0, 1.62 + g, 0.48, 0.52, 0.015, '#e8c24a', 0.06); }
  if (armor) { cap(0.95, 0, 2.15 + g, 1.5, 0, 2.2 + g, 0.34, armor, 0.12); sph(1.6, 0, 2.2 + g, 0.12, 0.14, 0.2, armor, 0.14); }
  return g;
}

/* ---------- araçlar ---------- */
function tracks(S, Lh, Wd, Hh, col) {
  for (const s of [-1, 1]) {
    box(0, s * Wd / 2, Hh / 2, Lh / 2, 0.22, Hh / 2, '#1e1e22');
    for (let k = 0; k < 7; k++) { const x = ((k * Lh / 7 + S.ph * 0.35) % Lh) - Lh / 2; cap(x, s * (Wd / 2 + 0.2), Hh * 0.95, x + 0.02, s * (Wd / 2 + 0.2), Hh * 0.55, 0.05, '#3c3c44', 0.1); }
    for (const wx of [-Lh / 2 + 0.25, -Lh / 6, Lh / 6, Lh / 2 - 0.25]) disc(wx, s * (Wd / 2 + 0.23), Hh * 0.5, 0, s, 0, Hh * 0.42, '#46464e', 0.12);
  }
}
function vehicle(u, S, civ, col, cd) {
  const t = u.type, bz = civ === 'bizans', hull = bz ? '#68727e' : '#7b7a4a', hull2 = bz ? '#4a525c' : '#5c5a34', rc = S.sw * 0.35;
  const M = { ltank: [1.9, 1.3, 0.5, 1.5, 0.09], tank: [2.3, 1.5, 0.58, 1.9, 0.12], htank: [2.7, 1.8, 0.66, 2.3, 0.16] };
  if (M[t]) {
    const [Lh, Wd, Hh, bl, bw] = M[t];
    tracks(S, Lh, Wd, Hh * 0.95);
    box(0, 0, Hh * 0.95 + 0.14, Lh / 2 - 0.1, Wd / 2 - 0.12, 0.17, hull); box(Lh / 2 - 0.2, 0, Hh * 0.95 + 0.14, 0.26, Wd / 2 - 0.14, 0.15, hull2, 0.02);
    box(-Lh / 2 + 0.2, 0, Hh * 0.95 + 0.34, 0.2, Wd / 2 - 0.3, 0.05, '#2a2a30', 0.03);
    const tz = Hh * 0.95 + 0.52, tr = Wd * 0.34;
    sph(-0.1, 0, tz, tr * 1.05, tr, 0.24, hull2, 0.2);
    if (t === 'htank') { cap(0.1, -0.2, tz + 0.03, 0.1 + bl - rc, -0.2, tz + 0.03, bw * 0.6, '#2a2d32', 0.3); cap(0.1, 0.2, tz + 0.03, 0.1 + bl - rc, 0.2, tz + 0.03, bw * 0.6, '#2a2d32', 0.3); sph(0.2, 0, tz + 0.1, 0.4, 0.4, 0.2, hull, 0.28); }
    else cap(0.1, 0, tz + 0.03, 0.1 + bl - rc, 0, tz + 0.03, bw, '#2a2d32', 0.3);
    box(0.1 + bl - rc, 0, tz + 0.03, 0.14, bw + 0.06, bw + 0.06, '#1a1c20', 0.31);
    sph(-0.3, 0.2, tz + 0.2, 0.14, 0.14, 0.06, '#2a2d32', 0.35); box(-0.35, -0.22, tz + 0.18, 0.18, 0.04, 0.12, col, 0.34);
    if (S.sw > 0.3) flash(0.1 + bl - rc + 0.4, 0, tz + 0.03, 1.4);
    return;
  }
  if (t === 'howitzer') {
    tracks(S, 2.0, 1.4, 0.45); box(0, 0, 0.58, 0.9, 0.55, 0.15, hull); box(-0.5, 0, 0.9, 0.5, 0.45, 0.2, hull2, 0.02);
    cap(-0.1, 0, 0.95, 1.6 - rc, 0, 1.75 - rc * 0.5, 0.2, '#3a3d44', 0.3); cap(1.2 - rc, 0, 1.55 - rc * 0.4, 1.8 - rc, 0, 1.85 - rc * 0.5, 0.26, '#1a1c20', 0.31); box(-0.9, 0, 0.55, 0.15, 0.55, 0.15, '#2a2a30', 0.05); box(-0.2, 0.3, 1.15, 0.1, 0.05, 0.1, col, 0.35);
    if (S.sw > 0.3) flash(2.2 - rc, 0, 1.9, 1.6); return;
  }
  if (t === 'flak') {
    tracks(S, 2.0, 1.4, 0.45); box(0, 0, 0.58, 0.9, 0.55, 0.15, hull); sph(0, 0, 0.95, 0.55, 0.55, 0.3, hull2, 0.2);
    for (const s of [-1, 1]) { cap(0.1, s * 0.22, 1.1, 1.0 - rc * 0.3, s * 0.22, 1.85, 0.07, '#2a2d32', 0.3); cap(0.05, s * 0.32, 1.0, 0.05, s * 0.32, 1.25, 0.12, '#3a3d44', 0.25); }
    box(-0.3, 0, 1.25, 0.14, 0.2, 0.08, col, 0.34); if (S.sw > 0.2) flash(1.1, 0, 1.9, 0.9); return;
  }
  const wheel = (x, y, r2) => { disc(x, y, r2, 0, Math.sign(y), 0, r2, '#222226', 0.12); disc(x, y + Math.sign(y) * 0.02, r2, 0, Math.sign(y), 0, r2 * 0.5, '#5a5a62', 0.13); };
  if (t === 'scout') {
    box(0, 0, 0.45, 0.95, 0.5, 0.18, hull, 0.01); box(0.55, 0, 0.7, 0.35, 0.44, 0.12, hull2, 0.02); box(-0.2, 0, 0.78, 0.35, 0.45, 0.05, '#303038', 0.05);
    for (const x of [-0.6, 0.6]) for (const y of [-0.62, 0.62]) wheel(x, y, 0.3);
    cap(-0.1, 0, 0.85, -0.1, 0, 1.2, 0.04, DARK, 0.2); cap(-0.1, 0, 1.2, 0.9 - rc, 0, 1.25, 0.06, '#25252b', 0.25); box(-0.45, -0.3, 0.8, 0.06, 0.1, 0.06, col, 0.3); if (S.sw > 0.4) flash(1.15 - rc, 0, 1.25, 0.8); return;
  }
  if (t === 'raider') {
    box(0, 0, 0.5, 1.0, 0.55, 0.16, hull, 0.01); box(0.6, 0, 0.68, 0.4, 0.5, 0.1, hull2, 0.02); box(-0.5, 0, 0.78, 0.45, 0.45, 0.14, hull2, 0.03);
    for (const x of [-0.65, 0.65]) for (const y of [-0.68, 0.68]) wheel(x, y, 0.34);
    for (const k of [-1, 1]) { cap(-0.55, k * 0.18, 1.0, 0.4 - rc, k * 0.18, 1.1, 0.1, '#2c2c34', 0.3); sph(0.45 - rc, k * 0.18, 1.1, 0.1, 0.09, 0.09, '#c0392b', 0.32); }
    box(0.1, 0.35, 0.72, 0.05, 0.12, 0.05, col, 0.3); if (S.sw > 0.3) flash(0.9 - rc, 0, 1.1, 0.9); return;
  }
  if (t === 'armored') {
    box(0, 0, 0.55, 1.05, 0.62, 0.22, hull, 0.01); box(0.8, 0, 0.7, 0.3, 0.58, 0.14, hull2, 0.02); box(-0.1, 0, 0.9, 0.7, 0.5, 0.18, hull, 0.03);
    for (const x of [-0.7, 0, 0.7]) for (const y of [-0.7, 0.7]) wheel(x, y, 0.3);
    sph(0, 0, 1.22, 0.38, 0.38, 0.2, hull2, 0.2); cap(0.1, 0, 1.25, 1.1 - rc, 0, 1.28, 0.06, '#25282c', 0.3); box(-0.6, 0.38, 0.9, 0.06, 0.1, 0.1, col, 0.3); if (S.sw > 0.2) flash(1.4 - rc, 0, 1.28, 0.9); return;
  }
}

/* ---------- top (kuşatma) ---------- */
function siege(u, S, civ, col) {
  const bz = civ === 'bizans', rc = S.sw * 0.5;
  for (const s of [-1, 1]) { disc(-0.1, s * 0.78, 0.4, 0, s, 0, 0.42, '#4a3018', 0.1); disc(-0.1, s * 0.8, 0.4, 0, s, 0, 0.2, '#7a5a30', 0.11); for (let k = 0; k < 3; k++) { const a = S.ph * 0.5 + k * 1.05; cap(-0.1 + Math.cos(a) * 0.4, s * 0.82, 0.4 + Math.sin(a) * 0.4, -0.1 - Math.cos(a) * 0.4, s * 0.82, 0.4 - Math.sin(a) * 0.4, 0.03, '#6a4a28', 0.12); } }
  box(-0.1, 0, 0.55, 0.9, 0.55, 0.16, '#8a6238'); box(-0.9, 0, 0.5, 0.12, 0.5, 0.12, col, 0.05);
  if (!bz) { cap(-0.3 - rc, 0, 0.95, 1.6 - rc, 0, 1.05, 0.34, '#c8923a', 0.2); cap(1.3 - rc, 0, 1.03, 1.75 - rc, 0, 1.06, 0.4, '#6a4a14', 0.22); sph(1.78 - rc, 0, 1.06, 0.1, 0.3, 0.3, '#2a1a08', 0.25); cap(-0.3 - rc, -0.05, 1.2, 1.0 - rc, -0.05, 1.28, 0.04, '#e8c24a', 0.23); if (S.sw > 0.4) flash(2.2 - rc, 0, 1.1, 1.6); }
  else { const a = -0.5 + S.sw * 2; box(0.1, 0, 1.0, 0.1, 0.5, 0.45, '#6a4a28', 0.1); cap(0.1, 0, 1.3, 0.1 - Math.cos(a) * 1.5, 0, 1.3 + Math.sin(a) * 1.5, 0.08, '#7a5a30', 0.2); sph(0.1 + Math.cos(a) * 1.0, 0, 1.3 - Math.sin(a) * 1.0, 0.25, 0.25, 0.25, '#3a2a1a', 0.22); }
}

/* ---------- hava araçları ---------- */
function aircraft(u, S, civ, col) {
  const t = u.type, bz = civ === 'bizans', hull = bz ? '#8e9aae' : '#8f9a74', hull2 = bz ? '#5c667a' : '#626a4c', glass = '#7ab8e0', ang = S.t * 38 + u.id;
  if (t === 'heli') {
    cap(-0.5, 0, 0.95, 0.75, 0, 0.9, 0.5, hull); sph(0.8, 0, 0.96, 0.42, 0.36, 0.3, glass, 0.1); cap(-0.5, 0, 1.02, -1.75, 0, 1.18, 0.13, hull2, 0.02);
    cap(-1.75, 0, 1.15, -1.9, 0, 1.55, 0.07, hull2, 0.03); box(-0.1, 0.5, 0.95, 0.4, 0.02, 0.12, col, 0.15);
    for (const s of [-1, 1]) { cap(-0.5, s * 0.42, 0.38, 0.75, s * 0.42, 0.38, 0.05, '#2a2a30', 0.02); cap(0.1, s * 0.3, 0.7, 0.1, s * 0.42, 0.4, 0.04, '#2a2a30', 0.01); cap(-0.4, s * 0.3, 0.7, -0.4, s * 0.42, 0.4, 0.04, '#2a2a30', 0.01); }
    cap(0.05, 0, 1.4, 0.05, 0, 1.58, 0.07, '#2a2a30', 0.05);
    for (let k = 0; k < 4; k++) { const a = ang + k * 1.5708; cap(0.05, 0, 1.6, 0.05 + Math.cos(a) * 1.7, Math.sin(a) * 1.7, 1.6, 0.045, '#3a3a40', 0.2); }
    const ta = ang * 1.7; cap(-1.9, 0, 1.55, -1.9, Math.cos(ta) * 0.35, 1.55 + Math.sin(ta) * 0.35, 0.03, '#3a3a40', 0.2); cap(-1.9, 0, 1.55, -1.9, -Math.cos(ta) * 0.35, 1.55 - Math.sin(ta) * 0.35, 0.03, '#3a3a40', 0.2);
    cap(0.4, 0.3, 0.8, 0.95, 0.3, 0.78, 0.07, DARK, 0.05); cap(0.4, -0.3, 0.8, 0.95, -0.3, 0.78, 0.07, DARK, 0.05);
    if (S.sw > 0.5) flash(1.1, 0.3, 0.78, 0.7); return;
  }
  if (t === 'fighter') {
    cap(-1.2, 0, 0.8, 1.2, 0, 0.8, 0.22, hull); sph(1.45, 0, 0.8, 0.32, 0.16, 0.16, hull2, 0.05); sph(0.45, 0, 0.97, 0.45, 0.14, 0.12, glass, 0.1);
    for (const s of [-1, 1]) { cap(0.4, s * 0.15, 0.8, -0.8, s * 1.45, 0.8, 0.1, hull2, -0.02); cap(-1.1, s * 0.1, 0.8, -1.5, s * 0.7, 0.8, 0.06, hull2, -0.02); disc(-0.5, s * 0.8, 0.86, 0, 0, 1, 0.14, col, 0.2); cap(-0.2, s * 0.9, 0.7, 0.4, s * 0.9, 0.7, 0.04, '#d8d8e0', 0.05); }
    cap(-1.1, 0, 0.82, -1.55, 0, 1.45, 0.07, hull2, 0.02); sph(-1.35, 0, 0.8, 0.14, 0.1, 0.1, '#ff9a3a', 0.2); if (S.sw > 0.4) flash(1.9, 0, 0.8, 0.6); return;
  }
  if (t === 'bomber') {
    cap(-1.7, 0, 0.85, 1.4, 0, 0.85, 0.46, hull); sph(1.75, 0, 0.86, 0.5, 0.42, 0.4, hull2, 0.05); sph(1.4, 0, 1.15, 0.35, 0.22, 0.14, glass, 0.1);
    for (const s of [-1, 1]) { cap(0.2, s * 0.35, 0.85, -0.4, s * 2.3, 0.85, 0.15, hull2, -0.02); for (const k of [0.8, 1.6]) { sph(-0.1 - k * 0.1, s * k, 0.65, 0.35, 0.14, 0.14, '#3a3a42', 0.05); disc(0.15 - k * 0.1, s * k, 0.65, 1, 0, 0, 0.14, '#9aa0aa', 0.2); } cap(-1.6, s * 0.2, 0.85, -2.0, s * 1.0, 0.85, 0.1, hull2, -0.02); }
    cap(-1.6, 0, 0.9, -2.1, 0, 1.7, 0.1, hull2, 0.02); box(0, 0, 0.85, 0.5, 0.45, 0.05, col, 0.15); return;
  }
  // iha / siha
  const big = t === 'siha';
  cap(-0.7, 0, 0.85, 0.7, 0, 0.85, big ? 0.2 : 0.15, hull); sph(0.75, 0, 0.82, 0.2, 0.16, 0.16, '#2a2a30', 0.1); sph(0.45, 0, 0.66, 0.12, 0.12, 0.12, '#1a1a1e', 0.1);
  for (const s of [-1, 1]) { cap(0.1, s * 0.1, 0.85, 0.0, s * (big ? 1.9 : 1.6), 0.85, 0.05, hull2, -0.02); cap(-0.7, s * 0.05, 0.88, -0.9, s * 0.5, 1.05, 0.04, hull2, -0.02); if (big) { cap(0.3, s * 0.9, 0.7, 0.9, s * 0.9, 0.7, 0.06, '#c0392b', 0.05); } }
  box(-0.1, 0, 0.88, 0.25, 0.1, 0.03, col, 0.15);
  const a = ang * 1.3; cap(-0.8, 0, 0.85, -0.8, Math.cos(a) * 0.45, 0.85 + Math.sin(a) * 0.45, 0.03, '#2a2a30', 0.2); cap(-0.8, 0, 0.85, -0.8, -Math.cos(a) * 0.45, 0.85 - Math.sin(a) * 0.45, 0.03, '#2a2a30', 0.2);
  if (big && S.sw > 0.4) flash(1.2, 0, 0.7, 0.7);
}

/* ---------- genel giriş ---------- */
const HUMAN = new Set(['villager', 'engineer', 'inf', 'archer', 'musketeer', 'mgun', 'sniper', 'rpg', 'demo', 'medic', 'spy']);
const MOUNT = new Set(['cav', 'hcav', 'harcher', 'dragoon', 'hero']);
const VEH = new Set(['tank', 'ltank', 'htank', 'howitzer', 'flak', 'scout', 'raider', 'armored']);
const AIR = new Set(['heli', 'fighter', 'bomber', 'iha', 'siha']);
function handles(t) { return AIR.has(t) || HUMAN.has(t) || MOUNT.has(t) || VEH.has(t) || t === 'dog' || t === 'siege'; }
function unit(ctx, V, u, o) {
  LOW = !!o.low; const t = u.type, civ = o.civ, bz = civ === 'bizans', col = o.col;
  const S = { ph: o.a.ph, mv: o.a.mv, sw: o.swing, t: o.t, me: V.ME, seat: false };
  const scale = AIR.has(t) ? o.r * 0.85 : VEH.has(t) || t === 'siege' ? o.r * 0.95 : t === 'dog' ? o.r * 0.95 : MOUNT.has(t) ? o.r * 0.82 : o.r * 0.98;
  begin(ctx, o.x, o.y, scale, u.face);
  if (HUMAN.has(t)) { const sp = humanSpec(u, civ, col, o.cd, o.cl, S); human(sp, S); }
  else if (t === 'dog') dog(u, S, col);
  else if (AIR.has(t)) aircraft(u, S, civ, col);
  else if (VEH.has(t)) vehicle(u, S, civ, col, o.cd);
  else if (t === 'siege') siege(u, S, civ, col);
  else if (MOUNT.has(t)) {
    S.seat = true;
    const tz = 0;
    if (t === 'cav') {
      const g = horse(u, S, bz ? '#8a8a92' : '#7a5232', bz ? '#55555c' : '#4a2e18', col, null);
      human({ tunic: col, pants: '#3a3228', armor: bz ? '#aab0ba' : null, hat: hz => { sph(0.0, 0, hz + 0.1, 0.28, 0.27, 0.26, bz ? '#b8bcc4' : '#f2efe6', 0.05); if (!bz) sph(0.0, 0, hz + 0.02, 0.28, 0.27, 0.08, col, 0.06); }, arms: (S2, z) => ({ 1: [0.5 + S2.sw * 0.5, 0.45, z + 0.6 - S2.sw * 0.3], '-1': [0.4, -0.4, z + 0.4] }), extra: (S2, z) => { scimitar(0.5 + S2.sw * 0.5, 0.45, z + 0.6 - S2.sw * 0.3, S2.sw); } }, S);
    } else if (t === 'hcav') {
      horse(u, S, bz ? '#d8d8d4' : '#3a2e2a', bz ? '#a8a8a6' : '#1a1412', col, '#b8bcc6');
      human({ tunic: col, pants: '#4a4a52', armor: '#aeb4c0', hat: hz => { sph(0.0, 0, hz + 0.06, 0.3, 0.29, 0.3, '#c8ccd4', 0.05); cap(0.0, 0, hz + 0.34, -0.3, 0, hz + 0.2, 0.06, col, 0.06); }, arms: (S2, z) => ({ 1: [0.6 + S2.sw * 0.6, 0.45, z + 0.55], '-1': [0.3, -0.45, z + 0.5] }), extra: (S2, z) => { spear(0.6 + S2.sw * 0.6, 0.45, z + 0.55, S2.sw, 3.2); shield(0.3, -0.52, z + 0.5, 0.42, col, '#e8c24a'); } }, S);
    } else if (t === 'harcher') {
      horse(u, S, bz ? '#c8b48c' : '#a8845a', bz ? '#7a6a4a' : '#5a4228', '#5a4a30', null);
      human({ tunic: '#8a6a42', pants: '#4a3a28', sash: col, hat: hz => { sph(0.02, 0, hz + 0.1, 0.29, 0.28, 0.2, col, 0.05); }, arms: (S2, z) => ({ 1: [0.4 - S2.sw * 0.25, 0.3, z + 0.55], '-1': [0.65, -0.35, z + 0.55] }), extra: (S2, z) => bow({ sw: S2.sw }, z) }, S);
    } else if (t === 'dragoon') {
      horse(u, S, bz ? '#7a6a5a' : '#4a3a30', bz ? '#4a3e34' : '#241a14', bz ? '#4a5a8a' : '#a83a3a', null);
      human({ tunic: bz ? '#4a5a8a' : '#a83a3a', pants: '#e8e8ee', hat: hz => { sph(0.02, 0, hz + 0.1, 0.32, 0.31, 0.14, col, 0.05); sph(0.02, 0, hz + 0.2, 0.2, 0.2, 0.15, bz ? '#d8c060' : '#f2efe6', 0.06); }, arms: (S2, z) => ({ 1: [0.4 - S2.sw * 0.3, 0.38, z + 0.55], '-1': [0.9 - S2.sw * 0.3, 0.2, z + 0.65] }), extra: (S2, z) => gun(S2, z, 1.8) }, S);
    } else if (t === 'hero') {
      horse(u, S, bz ? '#f6f6f2' : '#2c2428', bz ? '#c6c6c4' : '#120e10', col, '#e8c24a');
      human({ tunic: '#e8c24a', pants: '#8a1f1f', armor: '#f0c070', cape: col, hat: hz => { if (bz) { sph(0.02, 0, hz + 0.08, 0.3, 0.29, 0.28, '#e8c24a', 0.05); cap(0.0, -0.18, hz + 0.3, 0.0, 0.18, hz + 0.3, 0.05, '#d8a820', 0.07); sph(0.0, 0, hz + 0.4, 0.07, 0.07, 0.07, '#d8212a', 0.08); } else { sph(0.0, 0, hz + 0.22, 0.3, 0.3, 0.36, '#f4f0e4', 0.05); sph(0.0, 0, hz + 0.02, 0.34, 0.33, 0.1, '#b01a22', 0.06); sph(0.12, 0, hz + 0.05, 0.1, 0.1, 0.1, '#ffd86a', 0.08); } }, arms: (S2, z) => ({ 1: [0.5 + S2.sw * 0.6, 0.45, z + 0.65 - S2.sw * 0.3], '-1': [0.3, -0.45, z + 0.5] }), extra: (S2, z) => { scimitar(0.5 + S2.sw * 0.6, 0.45, z + 0.65 - S2.sw * 0.3, S2.sw); } }, S);
    }
  }
  flush();
}
root.Spr = { unit, handles };
})(typeof window !== 'undefined' ? window : globalThis);
