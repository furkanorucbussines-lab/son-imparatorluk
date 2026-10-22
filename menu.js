/* Son İmparatorluk - sinematik ana menü: canlı çizilen İstanbul kuşatması manzarası + site davranışları (dış görsel yok) */
(function () {
  'use strict';
  const menu = document.getElementById('menu'), cv = document.getElementById('menuBg');
  if (!menu || !cv) return;
  const c = cv.getContext('2d');
  let W = 0, H = 0, DPR = 1, yH = 0, sunX = 0, sunY = 0, S = 1, cityCx = 0;
  let L = {}, stars = [], clouds = [], embers = [], parts = [], shots = [], burns = [], poles = [], cityFlags = [], torches = [], cannon = null;
  let perf = 0, mx = 0, my = 0, smx = 0, smy = 0, tPrev = 0, T = 0, raf = 0, nextShot = 3.2, shake = 0;
  const R = Math.random, TAU = Math.PI * 2;
  const mkRnd = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  function mk() { const k = document.createElement('canvas'); k.width = Math.ceil(W * DPR); k.height = Math.ceil(H * DPR); const x = k.getContext('2d'); x.setTransform(DPR, 0, 0, DPR, 0, 0); return [k, x]; }

  /* ---------- sabit katmanlar ---------- */
  function buildScene() {
    DPR = Math.min(window.devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight;
    cv.width = Math.ceil(W * DPR); cv.height = Math.ceil(H * DPR); c.setTransform(DPR, 0, 0, DPR, 0, 0);
    const portrait = W < H * 0.9;
    yH = H * (portrait ? 0.5 : 0.6); S = Math.max(0.42, Math.min(H / 880, W / 1150)); cityCx = W * (portrait ? 0.64 : 0.77); sunX = cityCx - 40 * S; sunY = yH - 120 * S;
    const r = mkRnd(77);
    stars = Array.from({ length: 170 }, () => ({ x: r() * W, y: r() * yH * 0.62, s: 0.4 + r() * 1.3, p: r() * TAU, v: 1 + r() * 2.5 }));
    clouds = Array.from({ length: 9 }, (_, i) => ({ x: r() * W * 1.2, y: yH * (0.12 + r() * 0.55), w: 220 + r() * 380, h: 24 + r() * 40, v: 5 + r() * 12, o: r() * TAU, d: 0.3 + r() * 0.5 }));
    embers = Array.from({ length: 80 }, () => newEmber(true));
    poles = []; cityFlags = []; torches = [];
    // gökyüzü + deniz
    let [k, x] = mk(); L.sky = k;
    let g = x.createLinearGradient(0, 0, 0, yH); g.addColorStop(0, '#060a1d'); g.addColorStop(0.3, '#1b1743'); g.addColorStop(0.55, '#5a2b5c'); g.addColorStop(0.8, '#d2654c'); g.addColorStop(1, '#ffb866');
    x.fillStyle = g; x.fillRect(0, 0, W, yH + 1);
    g = x.createLinearGradient(0, yH, 0, H); g.addColorStop(0, '#d9824f'); g.addColorStop(0.05, '#7a3a52'); g.addColorStop(0.3, '#251d45'); g.addColorStop(1, '#070a1c');
    x.fillStyle = g; x.fillRect(0, yH, W, H - yH);
    g = x.createRadialGradient(sunX, sunY, 0, sunX, sunY, H * 0.7); g.addColorStop(0, 'rgba(255,214,130,.9)'); g.addColorStop(0.25, 'rgba(255,150,80,.38)'); g.addColorStop(1, 'rgba(255,90,60,0)');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    // uzak dağlar
    [k, x] = mk(); L.mtn = k;
    for (const [col, amp, base, fr] of [['#3a2650', 0.07, 0.1, 0.004], ['#1e1535', 0.05, 0.05, 0.007]]) {
      x.fillStyle = col; x.beginPath(); x.moveTo(0, yH + 2);
      for (let px = 0; px <= W; px += 6) x.lineTo(px, yH - H * (base + amp * (0.55 + 0.45 * Math.sin(px * fr + base * 90) * Math.sin(px * fr * 2.3 + 1.7))));
      x.lineTo(W, yH + 2); x.closePath(); x.fill();
    }
    // şehir
    [k, x] = mk(); L.city = k; drawCity(x, cityCx, yH + 6 * S, S, mkRnd(2024));
    // ön plan: kuşatma ordugâhı
    [k, x] = mk(); L.ground = k; drawGround(x, mkRnd(99));
  }

  function minaret(x, px, base, h, s) {
    x.fillRect(px - 4.5 * s, base - h, 9 * s, h); x.fillRect(px - 8 * s, base - h * 0.72, 16 * s, 5 * s);
    x.beginPath(); x.moveTo(px - 6.5 * s, base - h); x.lineTo(px, base - h - 34 * s); x.lineTo(px + 6.5 * s, base - h); x.fill(); x.fillRect(px - s, base - h - 44 * s, 2 * s, 12 * s);
  }
  function cross(x, px, py, s) { x.fillRect(px - 1.6 * s, py - 18 * s, 3.2 * s, 18 * s); x.fillRect(px - 6 * s, py - 13 * s, 12 * s, 3 * s); }
  function dome(x, px, py, rad) { x.beginPath(); x.arc(px, py, rad, Math.PI, 0); x.closePath(); x.fill(); }

  function drawCity(x, cx, base, s, r) {
    x.save(); x.shadowColor = 'rgba(255,150,70,.75)'; x.shadowBlur = 26 * s; x.fillStyle = '#0b0814';
    const wl = cx - 560 * s, wr = cx + 560 * s, wh = 50 * s;
    // arka plan evleri
    for (let px = wl + 20 * s; px < wr - 20 * s;) { const w = (22 + r() * 34) * s, h = (22 + r() * 44) * s; x.fillRect(px, base - wh - h + 8 * s, w, h); if (r() < 0.2) dome(x, px + w / 2, base - wh - h + 8 * s, w * 0.4); px += w + r() * 6 * s; }
    for (const [px, h] of [[-420, 96], [-330, 70], [330, 82], [430, 104]]) { x.fillRect(cx + (px - 11) * s, base - wh - h * s, 22 * s, h * s); dome(x, cx + px * s, base - wh - h * s, 11 * s); cross(x, cx + px * s, base - wh - h * s - 11 * s, s * 0.8); }
    // Ayasofya
    const hb = base - wh;
    x.fillRect(cx - 120 * s, hb - 86 * s, 240 * s, 90 * s);
    dome(x, cx, hb - 86 * s, 82 * s); x.fillRect(cx - 9 * s, hb - 86 * s - 90 * s, 18 * s, 12 * s); cross(x, cx, hb - 86 * s - 90 * s, s * 1.5);
    dome(x, cx - 112 * s, hb - 60 * s, 48 * s); dome(x, cx + 112 * s, hb - 60 * s, 48 * s);
    dome(x, cx - 175 * s, hb - 44 * s, 30 * s); dome(x, cx + 175 * s, hb - 44 * s, 30 * s);
    for (const px of [-148, 148]) x.fillRect(cx + (px - 12) * s, hb - 66 * s, 24 * s, 70 * s);
    for (const px of [-196, 196]) { x.fillRect(cx + (px - 15) * s, hb - 120 * s, 30 * s, 124 * s); dome(x, cx + px * s, hb - 120 * s, 15 * s); cross(x, cx + px * s, hb - 135 * s, s); }
    // yan cami
    dome(x, cx - 360 * s, hb - 50 * s, 40 * s); x.fillRect(cx - 405 * s, hb - 50 * s, 90 * s, 54 * s); cross(x, cx - 360 * s, hb - 90 * s, s);
    dome(x, cx + 380 * s, hb - 44 * s, 34 * s); x.fillRect(cx + 340 * s, hb - 44 * s, 80 * s, 48 * s); cross(x, cx + 380 * s, hb - 78 * s, s);
    // servi ağaçları
    for (let i = 0; i < 16; i++) { const px = wl + 30 * s + r() * (wr - wl - 60 * s); x.beginPath(); x.ellipse(px, hb + 2 * s - 10 * s, 5 * s, (26 + r() * 22) * s, 0, 0, TAU); x.fill(); }
    // sur + kuleler
    x.fillRect(wl, base - wh, wr - wl, wh + 40 * s);
    for (let px = wl; px < wr; px += 15 * s) x.fillRect(px, base - wh - 9 * s, 8 * s, 10 * s);
    for (let i = -4; i <= 4; i++) {
      const tx = cx + i * 132 * s + (i % 2 ? 10 * s : 0), th = (88 + ((i * 37 + 40) % 6) * 7) * s;
      x.fillRect(tx - 19 * s, base - th, 38 * s, th + 10 * s);
      for (let k = -2; k <= 2; k++) x.fillRect(tx + k * 8 * s - 3 * s, base - th - 8 * s, 6 * s, 9 * s);
      x.beginPath(); x.moveTo(tx - 23 * s, base - th - 8 * s); x.lineTo(tx, base - th - 44 * s); x.lineTo(tx + 23 * s, base - th - 8 * s); x.closePath(); x.fill();
      x.fillRect(tx - 1.2 * s, base - th - 64 * s, 2.4 * s, 22 * s);
      if (i === -2 || i === 3) cityFlags.push({ x: tx, y: base - th - 64 * s, w: 46 * s, h: 28 * s });
    }
    x.restore();
    // yanan pencereler
    x.fillStyle = 'rgba(255,176,90,.85)';
    for (let i = 0; i < 90; i++) { const px = cx - 520 * s + r() * 1040 * s, py = base - wh - r() * 150 * s; if (Math.abs(px - cx) < 130 * s && py < base - wh - 160 * s) continue; x.fillRect(px, py, 2.2 * s, 3.4 * s); }
    for (let i = -4; i <= 4; i++) { const tx = cx + i * 132 * s + (i % 2 ? 10 * s : 0); x.fillRect(tx - 2 * s, base - 62 * s, 4 * s, 8 * s); x.fillRect(tx - 2 * s, base - 34 * s, 4 * s, 8 * s); }
    // sur kapısı ışığı
    const gg = x.createRadialGradient(cx, base - 12 * s, 0, cx, base - 12 * s, 40 * s); gg.addColorStop(0, 'rgba(255,170,80,.9)'); gg.addColorStop(1, 'rgba(255,120,40,0)'); x.fillStyle = gg; x.fillRect(cx - 40 * s, base - 52 * s, 80 * s, 80 * s);
  }

  function drawGround(x, r) {
    const s = S, gy = px => H * 0.87 + Math.sin(px * 0.004 + 1) * 9 * s - Math.sin(Math.min(1, Math.max(0, (px / W - 0.3) / 0.6)) * Math.PI) * H * 0.035;
    x.fillStyle = '#06050b'; x.beginPath(); x.moveTo(0, H); for (let px = 0; px <= W; px += 8) x.lineTo(px, gy(px)); x.lineTo(W, H); x.closePath(); x.fill();
    // çimen/ot dokusu
    x.strokeStyle = '#06050b'; x.lineWidth = 1.6; for (let px = 0; px < W; px += 5 + r() * 6) { const y0 = gy(px), h = (6 + r() * 16) * s; x.beginPath(); x.moveTo(px, y0 + 2); x.quadraticCurveTo(px + 3, y0 - h * 0.5, px + (r() - 0.5) * 8, y0 - h); x.stroke(); }
    x.fillStyle = '#08060d';
    // çadırlar
    for (const f of [0.05, 0.3, 0.57, 0.9]) { const px = W * f, y0 = gy(px), tw = (70 + r() * 30) * s, th = (58 + r() * 20) * s; x.beginPath(); x.moveTo(px - tw / 2, y0 + 4); x.lineTo(px, y0 - th); x.lineTo(px + tw / 2, y0 + 4); x.closePath(); x.fill(); x.fillRect(px - 1.2 * s, y0 - th - 22 * s, 2.4 * s, 24 * s); }
    // asker siluetleri
    const soldier = (px, sc) => { const y0 = gy(px), h = 44 * sc; x.beginPath(); x.ellipse(px, y0 - h * 0.45, h * 0.17, h * 0.34, 0, 0, TAU); x.fill(); x.beginPath(); x.arc(px, y0 - h * 0.9, h * 0.13, 0, TAU); x.fill(); x.beginPath(); x.moveTo(px - h * 0.15, y0 - h * 0.98); x.lineTo(px, y0 - h * 1.25); x.lineTo(px + h * 0.15, y0 - h * 0.98); x.fill(); x.fillRect(px + h * 0.2, y0 - h * 1.35, h * 0.04, h * 1.4); if (r() < 0.4) { x.beginPath(); x.arc(px - h * 0.2, y0 - h * 0.5, h * 0.18, 0, TAU); x.fill(); } };
    for (let i = 0; i < 26; i++) soldier(W * 0.28 + r() * W * 0.62, s * (0.8 + r() * 0.45));
    // top
    const cxp = W * 0.4, cyp = gy(cxp) - 6 * s, ang = -0.2;
    x.beginPath(); x.arc(cxp, cyp - 8 * s, 24 * s, 0, TAU); x.fill(); x.beginPath(); x.arc(cxp + 60 * s, cyp - 4 * s, 18 * s, 0, TAU); x.fill();
    x.save(); x.translate(cxp + 6 * s, cyp - 26 * s); x.rotate(ang); x.fillRect(-30 * s, -12 * s, 230 * s, 24 * s); x.fillRect(190 * s, -16 * s, 22 * s, 32 * s); x.restore();
    x.fillRect(cxp - 40 * s, cyp - 20 * s, 70 * s, 22 * s);
    cannon = { x: cxp + 6 * s + Math.cos(ang) * 212 * s, y: cyp - 26 * s + Math.sin(ang) * 212 * s };
    // sancak direkleri (canlı bayrak ile çizilir) ve meşaleler
    for (const f of [0.66]) { const px = W * f, y0 = gy(px); poles.push({ x: px, y: y0 - 150 * s, base: y0 + 4, w: 120 * s, h: 78 * s }); x.fillRect(px - 2.4 * s, y0 - 156 * s, 4.8 * s, 164 * s); }
    for (const f of [0.34, 0.6, 0.78]) { const px = W * f, y0 = gy(px); torches.push({ x: px, y: y0 - 56 * s }); x.fillRect(px - 1.6 * s, y0 - 56 * s, 3.2 * s, 60 * s); }
  }

  /* ---------- canlı öğeler ---------- */
  function newEmber(init) { return { x: R() * W, y: init ? R() * H : H + 10, vx: (R() - 0.3) * 18, vy: -(22 + R() * 55), s: 0.8 + R() * 2.2, p: R() * TAU, life: init ? R() : 0, sp: 0.07 + R() * 0.12 }; }
  function waveFlag(img, x, y, w, h, t, seed, amp) {
    if (!img || !img.complete || !img.naturalWidth) { c.fillStyle = '#b01a22'; c.fillRect(x, y, w, h); return; }
    const N = 16, sw = img.naturalWidth / N;
    for (let i = 0; i < N; i++) {
      const k = i / N, off = Math.sin(t * 3 + i * 0.55 + seed) * amp * k, shade = 0.5 + 0.5 * Math.sin(t * 3 + i * 0.55 + seed + 1.2);
      c.drawImage(img, i * sw, 0, sw + 0.6, img.naturalHeight, x + w * k, y + off, w / N + 0.8, h);
      c.fillStyle = `rgba(0,0,0,${0.05 + 0.22 * (1 - shade) * k})`; c.fillRect(x + w * k, y + off, w / N + 0.8, h);
    }
  }
  function add(p) { parts.push(p); }
  function smokeBurst(x, y, n, big) { for (let i = 0; i < n; i++) add({ t: 'smoke', x: x + (R() - 0.5) * 14, y, vx: (R() - 0.4) * 24, vy: -(14 + R() * 30), life: 0, max: 2 + R() * 2.2, s: (big ? 18 : 10) + R() * 14 }); }
  function fire() {
    if (!cannon) return;
    const po = off(1.4), co = off(0.6), tx = cityCx - 480 * S + R() * 400 * S + co.x, ty = yH + 6 * S - 40 * S - R() * 40 * S + co.y;
    const mx0 = cannon.x + po.x, my0 = cannon.y + po.y;
    shots.push({ x0: mx0, y0: my0, x1: tx, y1: ty, t: 0, dur: 1.4 + R() * 0.4, peak: 150 * S + R() * 120 * S, trail: [] });
    add({ t: 'flash', x: mx0, y: my0, life: 0, max: 0.35, s: 110 * S });
    for (let i = 0; i < 14; i++) add({ t: 'fire', x: mx0, y: my0, vx: 30 + R() * 160, vy: -R() * 60, life: 0, max: 0.3 + R() * 0.4, s: 4 + R() * 8 });
    smokeBurst(mx0, my0, 12, true); shake = Math.max(shake, 5);
  }
  function impact(x, y) {
    add({ t: 'flash', x, y, life: 0, max: 0.5, s: 220 * S });
    add({ t: 'ring', x, y, life: 0, max: 0.7, s: 140 * S });
    for (let i = 0; i < 26; i++) add({ t: 'fire', x, y, vx: (R() - 0.5) * 220, vy: -R() * 220, life: 0, max: 0.5 + R() * 0.7, s: 6 + R() * 14 });
    for (let i = 0; i < 30; i++) add({ t: 'debris', x, y, vx: (R() - 0.5) * 360, vy: -80 - R() * 300, life: 0, max: 1.2 + R() * 0.8, s: 2 + R() * 4, rot: R() * TAU });
    smokeBurst(x, y, 16, true); burns.push({ x, y, life: 0, max: 24 }); shake = Math.max(shake, 9);
  }
  function off(f) { const pan = Math.sin(T * 0.07) * 22; return { x: -smx * 26 * f + pan * f, y: -smy * 12 * f }; }

  function draw(dt) {
    smx += (mx - smx) * Math.min(1, dt * 2.2); smy += (my - smy) * Math.min(1, dt * 2.2);
    shake *= Math.pow(0.02, dt);
    nextShot -= dt; if (nextShot <= 0) { fire(); nextShot = 5.5 + R() * 3.5; }
    c.save();
    const z = 1 + 0.1 * Math.max(0, 1 - T / 6) ** 2, sh = shake > 0.3 ? shake : 0;
    c.translate(W * 0.6 + (R() - 0.5) * sh, H * 0.5 + (R() - 0.5) * sh); c.scale(z, z); c.translate(-W * 0.6, -H * 0.5);
    const pad = 46;
    const layer = (img, f) => { const o = off(f); c.drawImage(img, -pad + o.x, -pad + o.y, W + pad * 2, H + pad * 2); };
    c.fillStyle = '#05060d'; c.fillRect(-60, -60, W + 120, H + 120);
    layer(L.sky, 0.05);
    // yıldızlar
    for (const s of stars) { const a = (0.35 + 0.65 * Math.sin(T * s.v + s.p) ** 2) * (1 - s.y / (yH * 0.7)); c.fillStyle = `rgba(255,244,220,${Math.max(0, a)})`; c.fillRect(s.x, s.y, s.s, s.s); }
    // güneş
    const pulse = 1 + 0.05 * Math.sin(T * 0.8), so = off(0.1);
    c.globalCompositeOperation = 'lighter';
    let g = c.createRadialGradient(sunX + so.x, sunY + so.y, 0, sunX + so.x, sunY + so.y, 190 * S * pulse); g.addColorStop(0, 'rgba(255,248,210,1)'); g.addColorStop(0.18, 'rgba(255,214,120,.8)'); g.addColorStop(1, 'rgba(255,140,60,0)'); c.fillStyle = g; c.beginPath(); c.arc(sunX + so.x, sunY + so.y, 190 * S * pulse, 0, TAU); c.fill();
    // ışık huzmeleri
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.26 + Math.sin(T * 0.12 + i) * 0.05, len = H * 1.2; g = c.createRadialGradient(sunX + so.x, sunY + so.y, 0, sunX + so.x, sunY + so.y, len); g.addColorStop(0, 'rgba(255,200,120,.16)'); g.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(sunX + so.x, sunY + so.y); c.lineTo(sunX + so.x + Math.cos(a - 0.05) * len, sunY + so.y + Math.sin(a - 0.05) * len); c.lineTo(sunX + so.x + Math.cos(a + 0.05) * len, sunY + so.y + Math.sin(a + 0.05) * len); c.closePath(); c.fill(); }
    c.globalCompositeOperation = 'source-over';
    // bulutlar
    for (const b of clouds) {
      b.x += b.v * dt; if (b.x - b.w > W + 100) b.x = -b.w - 60;
      const o = off(0.15 + b.d * 0.1);
      for (let i = 0; i < 6; i++) { const px = b.x + (i / 5) * b.w + o.x, py = b.y + Math.sin(i * 1.7 + b.o) * b.h * 0.3 + o.y, rx = b.w * 0.2, ry = b.h * (0.55 + 0.25 * Math.sin(i + b.o)); c.fillStyle = `rgba(48,28,70,${0.34 * b.d + 0.1})`; c.beginPath(); c.ellipse(px, py, rx, ry, 0, 0, TAU); c.fill(); c.fillStyle = `rgba(255,164,96,${0.22 * b.d})`; c.beginPath(); c.ellipse(px, py + ry * 0.45, rx * 0.9, ry * 0.4, 0, 0, TAU); c.fill(); }
    }
    layer(L.mtn, 0.25);
    // deniz: güneş yansıması + dalgalar
    c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 46; i++) { const k = i / 46, y = yH + 6 + k * k * (H - yH) * 0.75, w = (40 + k * 280) * S * (0.6 + 0.4 * Math.sin(T * 1.7 + i * 2.3)), a = (1 - k) * 0.42 * (0.5 + 0.5 * Math.sin(T * 2.1 + i * 1.3)); c.fillStyle = `rgba(255,190,110,${a})`; c.fillRect(sunX + so.x - w / 2 + Math.sin(T * 0.9 + i) * 8, y, w, 1.6 + k * 2.5); }
    c.globalCompositeOperation = 'source-over';
    c.strokeStyle = 'rgba(255,190,140,.07)'; c.lineWidth = 1;
    for (let i = 0; i < 18; i++) { const y = yH + 14 + (i / 18) ** 2 * (H - yH) * 0.8; c.beginPath(); for (let px = 0; px <= W; px += 24) c.lineTo(px, y + Math.sin(px * 0.02 + T * 0.9 + i) * (1 + i * 0.35)); c.stroke(); }
    layer(L.city, 0.6);
    const co = off(0.6);
    // şehir bayrakları (Bizans)
    const bimg = window.Flags && Flags.img.bizans;
    for (const f of cityFlags) waveFlag(bimg, f.x + co.x, f.y + co.y, f.w, f.h, T, f.x, 4 * S);
    // yangın parıltıları ve duman
    c.globalCompositeOperation = 'lighter';
    for (let i = burns.length - 1; i >= 0; i--) { const b = burns[i]; b.life += dt; if (b.life > b.max) { burns.splice(i, 1); continue; } const a = (1 - b.life / b.max) * (0.5 + 0.3 * Math.sin(T * 9 + b.x)); g = c.createRadialGradient(b.x, b.y, 0, b.x, b.y, 60 * S); g.addColorStop(0, `rgba(255,170,70,${a})`); g.addColorStop(1, 'rgba(255,90,30,0)'); c.fillStyle = g; c.beginPath(); c.arc(b.x, b.y, 60 * S, 0, TAU); c.fill(); if (R() < dt * 5) add({ t: 'smoke', x: b.x + (R() - 0.5) * 20, y: b.y, vx: 10 + R() * 14, vy: -(20 + R() * 26), life: 0, max: 3 + R() * 2, s: 12 + R() * 12 }); if (R() < dt * 12) add({ t: 'fire', x: b.x + (R() - 0.5) * 24, y: b.y, vx: (R() - 0.5) * 14, vy: -(30 + R() * 40), life: 0, max: 0.5 + R() * 0.5, s: 3 + R() * 5 }); }
    c.globalCompositeOperation = 'source-over';
    // sis bantları
    for (let i = 0; i < 3; i++) { const y = yH - 20 * S + i * 26 * S, ox = (T * (6 + i * 3) + i * 300) % (W + 600) - 300; g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(255,170,110,0)'); g.addColorStop(0.5, `rgba(255,170,110,${0.07 + i * 0.02})`); g.addColorStop(1, 'rgba(255,170,110,0)'); c.fillStyle = g; c.fillRect(ox, y, W * 0.8, 30 * S); }
    // mermiler
    for (let i = shots.length - 1; i >= 0; i--) {
      const s = shots[i]; s.t += dt; const k = Math.min(1, s.t / s.dur), x = s.x0 + (s.x1 - s.x0) * k, y = s.y0 + (s.y1 - s.y0) * k - Math.sin(k * Math.PI) * s.peak;
      s.trail.push([x, y]); if (s.trail.length > 14) s.trail.shift();
      c.globalCompositeOperation = 'lighter'; for (let j = 0; j < s.trail.length; j++) { const a = j / s.trail.length; c.fillStyle = `rgba(255,${150 + a * 80 | 0},80,${a * 0.5})`; c.beginPath(); c.arc(s.trail[j][0], s.trail[j][1], 1 + a * 3 * S, 0, TAU); c.fill(); } c.globalCompositeOperation = 'source-over';
      c.fillStyle = '#0a0810'; c.beginPath(); c.arc(x, y, 4.5 * S, 0, TAU); c.fill();
      if (k >= 1) { impact(x, y); shots.splice(i, 1); }
    }
    // parçacıklar (duman altta, ateş üstte)
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.life += dt; if (p.life >= p.max) { parts.splice(i, 1); continue; }
      const k = p.life / p.max;
      if (p.t === 'smoke') { p.x += p.vx * dt; p.y += p.vy * dt; c.fillStyle = `rgba(30,24,36,${0.5 * (1 - k)})`; c.beginPath(); c.arc(p.x, p.y, p.s * (0.6 + k * 1.8), 0, TAU); c.fill(); }
      else if (p.t === 'debris') { p.vy += 520 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += dt * 8; c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = `rgba(14,10,20,${1 - k * k})`; c.fillRect(-p.s, -p.s * 0.6, p.s * 2, p.s * 1.2); c.restore(); }
    }
    c.globalCompositeOperation = 'lighter';
    for (const p of parts) {
      const k = p.life / p.max;
      if (p.t === 'fire') { p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 20 * dt; const rr = p.s * (1 - k * 0.5); g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr * 2); g.addColorStop(0, `rgba(255,${230 - k * 120 | 0},110,${0.95 - k * 0.7})`); g.addColorStop(1, 'rgba(255,70,10,0)'); c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, rr * 2, 0, TAU); c.fill(); }
      else if (p.t === 'flash') { g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.s * (0.4 + k)); g.addColorStop(0, `rgba(255,244,200,${1 - k})`); g.addColorStop(1, 'rgba(255,150,60,0)'); c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, p.s * (0.4 + k), 0, TAU); c.fill(); }
      else if (p.t === 'ring') { c.strokeStyle = `rgba(255,210,150,${0.6 * (1 - k)})`; c.lineWidth = 3 * (1 - k) + 1; c.beginPath(); c.arc(p.x, p.y, p.s * k, 0, TAU); c.stroke(); }
    }
    c.globalCompositeOperation = 'source-over';
    // ön plan
    layer(L.ground, 1.4);
    const go = off(1.4), oimg = window.Flags && Flags.img.osmanli;
    for (const p of poles) { waveFlag(oimg, p.x + go.x + 2, p.y + go.y, p.w, p.h, T, p.x * 0.01, 9 * S); c.fillStyle = '#c9a040'; c.beginPath(); c.arc(p.x + go.x, p.y + go.y - 4 * S, 4.5 * S, 0, TAU); c.fill(); }
    c.globalCompositeOperation = 'lighter';
    for (const tc of torches) { const fl = 0.7 + 0.3 * Math.sin(T * 13 + tc.x); g = c.createRadialGradient(tc.x + go.x, tc.y + go.y - 8 * S, 0, tc.x + go.x, tc.y + go.y - 8 * S, 54 * S * fl); g.addColorStop(0, 'rgba(255,200,100,.9)'); g.addColorStop(0.3, 'rgba(255,130,40,.4)'); g.addColorStop(1, 'rgba(255,80,20,0)'); c.fillStyle = g; c.beginPath(); c.arc(tc.x + go.x, tc.y + go.y - 8 * S, 54 * S * fl, 0, TAU); c.fill(); if (R() < dt * 14) add({ t: 'fire', x: tc.x + go.x + (R() - 0.5) * 6, y: tc.y + go.y - 8 * S, vx: (R() - 0.5) * 10, vy: -(20 + R() * 30), life: 0, max: 0.6, s: 3 + R() * 3 }); }
    // kıvılcımlar
    for (const e of embers) {
      e.life += dt * e.sp; e.x += (e.vx + Math.sin(T * 0.8 + e.p) * 14) * dt; e.y += e.vy * dt;
      if (e.y < -10 || e.life > 1) Object.assign(e, newEmber(false));
      const a = Math.sin(Math.min(1, e.life) * Math.PI) * (0.5 + 0.5 * Math.sin(T * 6 + e.p)); c.fillStyle = `rgba(255,${150 + (e.p * 20 | 0)},60,${a * 0.9})`; c.beginPath(); c.arc(e.x, e.y, e.s, 0, TAU); c.fill();
    }
    c.globalCompositeOperation = 'source-over';
    c.restore();
  }

  function loop(ts) {
    if (menu.classList.contains('hide')) { raf = 0; return; }
    const dt = Math.max(0.001, Math.min(0.05, (ts - tPrev) / 1000 || 0.016)); tPrev = ts; T += dt;
    const t1 = performance.now(); draw(dt); const d1 = performance.now() - t1; perf = perf * 0.9 + d1 * 0.1; raf = requestAnimationFrame(loop);
  }
  function start() { if (!raf) { tPrev = performance.now(); raf = requestAnimationFrame(loop); } }
  new MutationObserver(() => { if (!menu.classList.contains('hide')) start(); }).observe(menu, { attributes: true, attributeFilter: ['class'] });

  /* ---------- sayfa davranışı ---------- */
  menu.addEventListener('mousemove', e => { mx = (e.clientX / W - 0.5) * 2; my = (e.clientY / H - 0.5) * 2; });
  const nav = menu.querySelector('.mnav');
  menu.addEventListener('scroll', () => { nav.classList.toggle('solid', menu.scrollTop > 40); menu.classList.toggle('scrolled', menu.scrollTop > 40); }, { passive: true });
  const go = id => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  menu.querySelectorAll('[data-go]').forEach(a => a.addEventListener('click', () => go(a.dataset.go)));
  menu.querySelectorAll('.startBtn').forEach(b => b.addEventListener('click', () => document.getElementById('start').click()));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { root: menu, threshold: 0.12 });
  menu.querySelectorAll('.rv').forEach(el => io.observe(el));
  const pf = () => menu.querySelectorAll('img[data-flag]').forEach(i => { if (!i.src && window.Flags) i.src = Flags.uri[i.dataset.flag]; });
  pf();
  let rt = 0; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(buildScene, 150); });
  buildScene();
  // başlık harfleri
  { let d = 1.1; menu.querySelectorAll('.mtitle b').forEach(b => { const t = b.textContent; b.textContent = ''; for (const ch of t) { const sp = document.createElement('span'); sp.textContent = ch; sp.style.animationDelay = (d += 0.07).toFixed(2) + 's'; b.appendChild(sp); } }); }
  // sinematik giriş
  menu.classList.add('intro'); requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.remove('intro')));
  // test/ekran görüntüsü: #t=<sn> ile sahneyi o ana ilerlet, animasyonları bitmiş göster
  const mt = /#t=(\d+)/.exec(location.hash);
  if (mt) { menu.classList.remove('intro'); menu.classList.add('still'); for (let i = 0; i < +mt[1] * 20; i++) { T += 0.05; draw(0.05); } menu.querySelectorAll('.rv').forEach(el => el.classList.add('in')); }
  start();
  window.__menu = { fire, get T() { return T; }, get ms() { return perf; } };
})();
