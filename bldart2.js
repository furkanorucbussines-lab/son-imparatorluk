/* Son İmparatorluk - çağa göre bina çizimleri 2: Ahır, Dökümhane, Akademi, Kule, Tabya, Hava Üssü, Uçaksavar, Radar, Çiftlik */
(function (root) {
  'use strict';
  const K = root.RenderKit; if (!K || !K.helpers) return;
  const { grad, rrect, circ, ell, flag, smokeAt, rnd } = K;
  const { courses, crenel, archWin, rectWin, glow, cylinder, cone, pole, wx, wy } = K.helpers;
  const P = (c, pts, fill, stroke) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1; c.stroke(); } };
  const smokeW = (V, b, s, fx, fy, n, sz, life) => { if (b.done && rnd() < n) smokeAt(b.tx + fx * (s / V.ts), b.ty + fy * (s / V.ts), 1, sz || 0.16, life || 0.6); };
  const shingles = (c, X, Y, x0, x1, y0, y1, rows, col) => { c.strokeStyle = col || 'rgba(0,0,0,.3)'; c.lineWidth = 1; for (let i = 1; i < rows; i++) { const k = i / rows; c.beginPath(); c.moveTo(X(x0 + (0.5 - x0) * (1 - k) * 0 + (0.5 - x0) * (0)), Y(y0 + (y1 - y0) * k)); c.lineTo(X(x1), Y(y0 + (y1 - y0) * k)); c.stroke(); } };
  const horseHead = (c, x, y, sc, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(x, y); c.lineTo(x + sc * 0.5, y - sc * 0.9); c.lineTo(x + sc * 0.8, y - sc * 0.85); c.lineTo(x + sc * 1.25, y - sc * 0.35); c.lineTo(x + sc * 1.15, y - sc * 0.1); c.lineTo(x + sc * 0.6, y - sc * 0.05); c.lineTo(x + sc * 0.45, y + sc * 0.6); c.lineTo(x - sc * 0.1, y + sc * 0.6); c.closePath(); c.fill(); };
  const gabled = (c, X, Y, x0, x1, ytop, ybase, col, cd, rows) => { c.fillStyle = grad(c, 0, Y(ytop), 0, Y(ybase), col, cd); P(c, [[X(x0), Y(ybase)], [X(x0 + (x1 - x0) * 0.2), Y(ytop)], [X(x1 - (x1 - x0) * 0.2), Y(ytop)], [X(x1), Y(ybase)]], c.fillStyle, 'rgba(0,0,0,.35)'); c.strokeStyle = 'rgba(0,0,0,.28)'; c.lineWidth = 1; for (let i = 1; i < rows; i++) { const k = i / rows, y = Y(ytop + (ybase - ytop) * k), dx = (x1 - x0) * 0.2 * (1 - k); c.beginPath(); c.moveTo(X(x0 + (x1 - x0) * 0.2 * (1 - k) * 1) - 0, y); c.lineTo(X(x1 - (x1 - x0) * 0.2 * (1 - k)), y); c.stroke(); } };

  /* ============ AHIR ============ */
  function stable(c, V, b, px, py, s, col, cd, cl, t, age) {
    const X = wx(px, s), Y = wy(py, s);
    if (age === 0) { // ahşap ahır
      c.fillStyle = grad(c, 0, Y(0.34), 0, Y(0.96), '#a88458', '#6a5030'); c.fillRect(X(0.06), Y(0.34), s * 0.88, s * 0.62); c.strokeStyle = 'rgba(40,26,12,.5)'; c.lineWidth = 1; for (let i = 1; i < 16; i++) { c.beginPath(); c.moveTo(X(0.06 + i * 0.055), Y(0.34)); c.lineTo(X(0.06 + i * 0.055), Y(0.96)); c.stroke(); }
      gabled(c, X, Y, -0.02, 1.02, 0.07, 0.4, col, cd, 6); c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(X(0.18), Y(0.065), s * 0.64, s * 0.02);
      // samanlık penceresi + saman
      c.fillStyle = '#1e1408'; c.fillRect(X(0.43), Y(0.4), s * 0.14, s * 0.13); c.fillStyle = '#d8b84a'; c.beginPath(); c.moveTo(X(0.43), Y(0.53)); c.lineTo(X(0.46), Y(0.47)); c.lineTo(X(0.5), Y(0.5)); c.lineTo(X(0.55), Y(0.45)); c.lineTo(X(0.57), Y(0.53)); c.fill();
      // çift kapı + çapraz kuşak
      c.fillStyle = '#3e2a16'; c.fillRect(X(0.3), Y(0.56), s * 0.4, s * 0.4); c.strokeStyle = '#d8c89a'; c.lineWidth = 1.6; c.strokeRect(X(0.3), Y(0.56), s * 0.4, s * 0.4); c.beginPath(); c.moveTo(X(0.5), Y(0.56)); c.lineTo(X(0.5), Y(0.96)); c.moveTo(X(0.3), Y(0.56)); c.lineTo(X(0.5), Y(0.96)); c.moveTo(X(0.5), Y(0.56)); c.lineTo(X(0.3), Y(0.96)); c.moveTo(X(0.5), Y(0.56)); c.lineTo(X(0.7), Y(0.96)); c.moveTo(X(0.7), Y(0.56)); c.lineTo(X(0.5), Y(0.96)); c.stroke();
      // saman balyaları, at başlı rüzgârgülü, çit
      for (const [bx, by] of [[0.08, 0.84], [0.17, 0.88], [0.1, 0.92]]) { c.fillStyle = '#d4b448'; rrect(c, X(bx), Y(by), s * 0.1, s * 0.07, 2); c.fill(); c.strokeStyle = '#8a6a20'; c.lineWidth = 1; c.stroke(); }
      c.fillStyle = '#2a2018'; c.fillRect(X(0.5) - 1, Y(0.0), 2, s * 0.09); horseHead(c, X(0.5) - s * 0.03, Y(0.0), s * 0.06, '#1a1208');
      c.strokeStyle = '#6a4a2a'; c.lineWidth = 1.6; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(X(0.78 + i * 0.06), Y(0.97)); c.lineTo(X(0.78 + i * 0.06), Y(0.82)); c.stroke(); } c.beginPath(); c.moveTo(X(0.78), Y(0.86)); c.lineTo(X(0.96), Y(0.86)); c.moveTo(X(0.78), Y(0.92)); c.lineTo(X(0.96), Y(0.92)); c.stroke();
    } else if (age === 1) { // taş ahır, kemerli bölmeler
      c.fillStyle = grad(c, 0, Y(0.3), 0, Y(0.96), '#c8bc98', '#928460'); c.fillRect(X(0.04), Y(0.3), s * 0.92, s * 0.66); courses(c, X(0.04), Y(0.3), s * 0.92, s * 0.66, s * 0.11, s * 0.065, 'rgba(60,46,24,.35)', 'rgba(255,255,255,.05)');
      c.fillStyle = grad(c, 0, Y(0.08), 0, Y(0.34), '#b85a38', '#7a3a24'); P(c, [[X(0.0), Y(0.34)], [X(0.14), Y(0.1)], [X(0.86), Y(0.1)], [X(1.0), Y(0.34)]], c.fillStyle, 'rgba(0,0,0,.35)'); c.strokeStyle = 'rgba(40,16,8,.4)'; for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(X(0.01 + i * 0.03), Y(0.1 + 0.05 * i)); c.lineTo(X(0.99 - i * 0.03), Y(0.1 + 0.05 * i)); c.stroke(); } c.fillStyle = col; c.fillRect(X(0.14), Y(0.095), s * 0.72, s * 0.025);
      for (let i = 0; i < 3; i++) { const ax = 0.12 + i * 0.27; archWin(c, X(ax), Y(0.52), s * 0.2, s * 0.44, false, '#6a5a3a'); if (i !== 1) { c.fillStyle = '#2a1c10'; horseHead(c, X(ax + 0.05), Y(0.76), s * 0.1, '#3a2616'); } }
      pole(c, X(0.9), Y(0.3), s * 0.14, 1.4); flag(c, X(0.9), Y(0.3) - s * 0.14, s * 0.26, cl, t, b.id, 1);
      c.fillStyle = '#5a3d22'; rrect(c, X(0.36), Y(0.9), s * 0.28, s * 0.06, 2); c.fill(); c.fillStyle = 'rgba(90,160,210,.7)'; c.fillRect(X(0.38), Y(0.91), s * 0.24, s * 0.025);
    } else if (age === 2) { // tuğla ahır, geniş kemerli kapılar, baca
      c.fillStyle = grad(c, 0, Y(0.3), 0, Y(0.95), '#aa5638', '#793826'); c.fillRect(X(0.04), Y(0.3), s * 0.92, s * 0.64); courses(c, X(0.04), Y(0.3), s * 0.92, s * 0.64, s * 0.08, s * 0.045, 'rgba(40,16,10,.4)', 'rgba(255,210,180,.07)');
      c.fillStyle = grad(c, 0, Y(0.08), 0, Y(0.32), '#4a5060', '#2c3240'); P(c, [[X(0.0), Y(0.34)], [X(0.12), Y(0.1)], [X(0.88), Y(0.1)], [X(1.0), Y(0.34)]], c.fillStyle, 'rgba(0,0,0,.4)'); c.fillStyle = col; c.fillRect(X(0.12), Y(0.095), s * 0.76, s * 0.02);
      archWin(c, X(0.12), Y(0.5), s * 0.3, s * 0.44, false, '#d8d0c0'); archWin(c, X(0.58), Y(0.5), s * 0.3, s * 0.44, false, '#d8d0c0'); c.strokeStyle = '#3a3028'; c.lineWidth = 1.3; for (const bx of [0.12, 0.58]) for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(X(bx + i * 0.075), Y(0.52)); c.lineTo(X(bx + i * 0.075), Y(0.94)); c.stroke(); }
      circ(c, X(0.5), Y(0.2), s * 0.065, '#f4eedc'); c.strokeStyle = '#2a2218'; c.lineWidth = 1; c.beginPath(); c.arc(X(0.5), Y(0.2), s * 0.065, 0, 6.283); c.stroke(); c.beginPath(); c.moveTo(X(0.5), Y(0.2)); c.lineTo(X(0.5), Y(0.15)); c.moveTo(X(0.5), Y(0.2)); c.lineTo(X(0.54), Y(0.22)); c.stroke();
      c.fillStyle = '#6e3a28'; c.fillRect(X(0.8), Y(0.0), s * 0.08, s * 0.16); c.fillStyle = '#2a2018'; c.fillRect(X(0.79), Y(-0.01), s * 0.1, s * 0.02); smokeW(V, b, s, 0.84, -0.01, 0.1, 0.15);
      for (const lx of [0.08, 0.92]) { c.fillStyle = '#2a2a30'; c.fillRect(X(lx) - 1, Y(0.56), 2, s * 0.1); glow(c, X(lx), Y(0.55), s * 0.06, 'rgba(255,210,120,.8)'); }
    } else { // modern süvari/zırhlı üssü: roller kapılar
      c.fillStyle = grad(c, 0, Y(0.36), 0, Y(0.96), '#c4c9cf', '#8e949c'); c.fillRect(X(0.03), Y(0.36), s * 0.94, s * 0.6); c.fillStyle = '#6a707a'; c.fillRect(X(0.0), Y(0.32), s * 1.0, s * 0.06); c.fillStyle = col; c.fillRect(X(0.0), Y(0.37), s * 1.0, s * 0.02);
      for (const bx of [0.1, 0.55]) { c.fillStyle = '#4a5260'; c.fillRect(X(bx), Y(0.52), s * 0.35, s * 0.44); c.strokeStyle = '#8a929c'; c.lineWidth = 1; for (let i = 1; i < 8; i++) { c.beginPath(); c.moveTo(X(bx), Y(0.52 + i * 0.055)); c.lineTo(X(bx + 0.35), Y(0.52 + i * 0.055)); c.stroke(); } c.fillStyle = '#e6c63a'; c.fillRect(X(bx), Y(0.9), s * 0.35, s * 0.03); }
      circ(c, X(0.5), Y(0.2), s * 0.11, '#1a2230'); c.strokeStyle = '#e8c24a'; c.lineWidth = 1.6; c.beginPath(); c.arc(X(0.5), Y(0.2), s * 0.11, 0, 6.283); c.stroke(); horseHead(c, X(0.46), Y(0.22), s * 0.09, '#e8c24a');
      c.fillStyle = '#9aa0a8'; c.fillRect(X(0.9), Y(0.1), 1.6, s * 0.24); circ(c, X(0.9) + 0.8, Y(0.1), s * 0.02, Math.sin(t * 4 + b.id) > 0 ? '#ff4030' : '#601812'); glow(c, X(0.06), Y(0.4), s * 0.08, 'rgba(255,245,200,.6)');
      c.fillStyle = '#7a828c'; c.fillRect(X(0.2), Y(0.28), s * 0.12, s * 0.05); c.fillRect(X(0.66), Y(0.28), s * 0.12, s * 0.05);
    }
  }

  /* ============ DÖKÜMHANE ============ */
  function foundry(c, V, b, px, py, s, col, cd, cl, t, age) {
    age = Math.max(1, age); const X = wx(px, s), Y = wy(py, s), fl = 0.75 + 0.25 * Math.sin(t * 9 + b.id);
    if (age === 1) { // taş demirhane, ocak, top namluları
      c.fillStyle = grad(c, 0, Y(0.3), 0, Y(0.96), '#9a9080', '#6a604e'); c.fillRect(X(0.04), Y(0.3), s * 0.92, s * 0.66); courses(c, X(0.04), Y(0.3), s * 0.92, s * 0.66, s * 0.1, s * 0.06, 'rgba(30,24,16,.4)');
      c.fillStyle = grad(c, 0, Y(0.1), 0, Y(0.32), '#4a4e5c', '#2a2e3a'); P(c, [[X(0.0), Y(0.34)], [X(0.14), Y(0.12)], [X(0.86), Y(0.12)], [X(1.0), Y(0.34)]], c.fillStyle, 'rgba(0,0,0,.4)'); c.fillStyle = col; c.fillRect(X(0.14), Y(0.115), s * 0.72, s * 0.02);
      c.fillStyle = grad(c, X(0.7), 0, X(0.84), 0, '#7a6e5a', '#4a4234'); c.fillRect(X(0.7), Y(-0.04), s * 0.14, s * 0.42); c.fillStyle = '#26221a'; c.fillRect(X(0.69), Y(-0.05), s * 0.16, s * 0.04); smokeW(V, b, s, 0.77, -0.05, 0.2, 0.2, 0.8);
      c.fillStyle = '#14100c'; c.beginPath(); c.moveTo(X(0.18), Y(0.96)); c.lineTo(X(0.18), Y(0.6)); c.arc(X(0.3), Y(0.6), s * 0.12, Math.PI, 0); c.lineTo(X(0.42), Y(0.96)); c.closePath(); c.fill(); c.fillStyle = `rgba(255,${120 + 60 * fl | 0},40,${0.9 * fl})`; c.beginPath(); c.moveTo(X(0.2), Y(0.96)); c.lineTo(X(0.2), Y(0.66)); c.arc(X(0.3), Y(0.66), s * 0.1, Math.PI, 0); c.lineTo(X(0.4), Y(0.96)); c.closePath(); c.fill(); glow(c, X(0.3), Y(0.78), s * 0.22, `rgba(255,140,40,${0.55 * fl})`);
      for (let i = 0; i < 3; i++) { c.fillStyle = grad(c, X(0.5), Y(0.7 + i * 0.07), X(0.9), Y(0.7 + i * 0.07), '#3a3d44', '#1a1c20'); rrect(c, X(0.5 + i * 0.03), Y(0.72 + i * 0.065), s * 0.34, s * 0.055, 3); c.fill(); c.fillStyle = '#c8a040'; c.fillRect(X(0.74 + i * 0.03), Y(0.72 + i * 0.065), s * 0.015, s * 0.055); }
      c.fillStyle = '#2a2d32'; for (const [bx, by] of [[0.5, 0.93], [0.55, 0.9], [0.6, 0.93]]) circ(c, X(bx), Y(by), s * 0.025, '#2a2d32');
    } else if (age === 2) { // tuğla fabrika, testere dişi çatı, iki baca
      c.fillStyle = grad(c, 0, Y(0.3), 0, Y(0.96), '#a05038', '#702e20'); c.fillRect(X(0.04), Y(0.3), s * 0.92, s * 0.66); courses(c, X(0.04), Y(0.3), s * 0.92, s * 0.66, s * 0.08, s * 0.045, 'rgba(40,16,10,.4)', 'rgba(255,200,170,.07)');
      for (let i = 0; i < 4; i++) { const x0 = X(0.05 + i * 0.225); c.fillStyle = '#4a4f58'; P(c, [[x0, Y(0.3)], [x0 + s * 0.08, Y(0.16)], [x0 + s * 0.22, Y(0.3)]], '#4a4f58', 'rgba(0,0,0,.4)'); c.fillStyle = 'rgba(170,215,255,.55)'; P(c, [[x0 + s * 0.08, Y(0.16)], [x0 + s * 0.13, Y(0.16)], [x0 + s * 0.13, Y(0.3)], [x0 + s * 0.08, Y(0.3)]]); c.fill(); }
      for (const bx of [0.1, 0.8]) { c.fillStyle = grad(c, X(bx), 0, X(bx + 0.09), 0, '#8a4a34', '#5a2c1e'); c.fillRect(X(bx), Y(-0.1), s * 0.09, s * 0.42); c.fillStyle = '#2a2018'; c.fillRect(X(bx) - 1, Y(-0.1), s * 0.09 + 2, s * 0.035); smokeW(V, b, s, bx + 0.045, -0.1, 0.22, 0.24, 0.9); }
      c.fillStyle = '#16100c'; c.beginPath(); c.moveTo(X(0.36), Y(0.96)); c.lineTo(X(0.36), Y(0.56)); c.arc(X(0.5), Y(0.56), s * 0.14, Math.PI, 0); c.lineTo(X(0.64), Y(0.96)); c.closePath(); c.fill(); c.fillStyle = `rgba(255,${130 + 60 * fl | 0},50,${0.92 * fl})`; c.beginPath(); c.moveTo(X(0.39), Y(0.96)); c.lineTo(X(0.39), Y(0.6)); c.arc(X(0.5), Y(0.6), s * 0.11, Math.PI, 0); c.lineTo(X(0.61), Y(0.96)); c.closePath(); c.fill(); glow(c, X(0.5), Y(0.8), s * 0.28, `rgba(255,140,40,${0.5 * fl})`);
      for (const gx of [0.2, 0.8]) { c.save(); c.translate(X(gx), Y(0.55)); c.rotate(t * 0.6 * (gx < 0.5 ? 1 : -1)); c.strokeStyle = '#4a4e56'; c.lineWidth = s * 0.03; c.beginPath(); c.arc(0, 0, s * 0.07, 0, 6.283); c.stroke(); for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(k * 1.047) * s * 0.1, Math.sin(k * 1.047) * s * 0.1); c.stroke(); } c.restore(); }
      c.fillStyle = '#5a3d22'; for (let i = 0; i < 3; i++) c.fillRect(X(0.06 + i * 0.07), Y(0.88), s * 0.06, s * 0.08); c.strokeStyle = '#3a3a40'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(X(0.7), Y(0.97)); c.lineTo(X(0.96), Y(0.97)); c.stroke();
    } else { // modern üretim tesisi
      c.fillStyle = grad(c, 0, Y(0.3), 0, Y(0.96), '#b6bcc4', '#7a828c'); c.fillRect(X(0.04), Y(0.34), s * 0.92, s * 0.62); c.strokeStyle = 'rgba(40,50,60,.35)'; c.lineWidth = 1; for (let i = 1; i < 12; i++) { c.beginPath(); c.moveTo(X(0.04 + i * 0.077), Y(0.34)); c.lineTo(X(0.04 + i * 0.077), Y(0.96)); c.stroke(); }
      c.fillStyle = '#5a6068'; P(c, [[X(0.0), Y(0.36)], [X(0.1), Y(0.24)], [X(0.9), Y(0.24)], [X(1.0), Y(0.36)]], '#5a6068', 'rgba(0,0,0,.4)'); c.fillStyle = col; c.fillRect(X(0.04), Y(0.4), s * 0.92, s * 0.03);
      for (const sx0 of [0.06, 0.2]) { c.fillStyle = grad(c, X(sx0), 0, X(sx0 + 0.1), 0, '#e6e9ee', '#a4acb6'); c.fillRect(X(sx0), Y(0.02), s * 0.1, s * 0.34); c.beginPath(); c.arc(X(sx0 + 0.05), Y(0.02), s * 0.05, Math.PI, 0); c.fill(); }
      c.strokeStyle = '#d8dce2'; c.lineWidth = Math.max(1.5, s * 0.02); c.beginPath(); c.moveTo(X(0.9), Y(0.34)); c.lineTo(X(0.9), Y(0.06)); c.lineTo(X(0.55), Y(0.06)); c.stroke(); c.strokeStyle = '#8a8f96'; c.beginPath(); c.moveTo(X(0.6), Y(0.06)); c.lineTo(X(0.6), Y(0.16)); c.stroke(); c.fillStyle = '#e8c24a'; c.fillRect(X(0.57), Y(0.16), s * 0.06, s * 0.04);
      c.fillStyle = '#242a32'; c.fillRect(X(0.42), Y(0.56), s * 0.4, s * 0.4); c.fillStyle = `rgba(255,${120 + 70 * fl | 0},40,${0.85 * fl})`; c.fillRect(X(0.44), Y(0.7), s * 0.36, s * 0.26); glow(c, X(0.62), Y(0.84), s * 0.26, `rgba(255,140,40,${0.45 * fl})`); if (rnd() < 0.3) { const bx = b.tx + (0.55 + rnd() * 0.15) * (s / V.ts), by = b.ty + 0.85 * (s / V.ts); K.sparkAt && K.sparkAt(bx, by, 2, 2, 0.4); }
      c.fillStyle = '#2f353c'; rrect(c, X(0.1), Y(0.7), s * 0.26, s * 0.2, 4); c.fill(); c.fillStyle = '#3a4048'; c.fillRect(X(0.26), Y(0.77), s * 0.18, s * 0.04); c.fillStyle = '#e6c63a'; c.fillRect(X(0.1), Y(0.88), s * 0.26, s * 0.02);
      smokeW(V, b, s, 0.11, 0.0, 0.12, 0.2, 0.9);
    }
  }

  /* ============ AKADEMİ ============ */
  function academy(c, V, b, px, py, s, col, cd, cl, t, age) {
    const X = wx(px, s), Y = wy(py, s);
    if (age === 0) { // sütunlu köşk, mavi kubbe
      c.fillStyle = '#c8c0a8'; c.fillRect(X(0.04), Y(0.9), s * 0.92, s * 0.06); c.fillRect(X(0.08), Y(0.86), s * 0.84, s * 0.05);
      c.fillStyle = grad(c, 0, Y(0.4), 0, Y(0.9), '#ece2c6', '#c0b48e'); c.fillRect(X(0.12), Y(0.4), s * 0.76, s * 0.46);
      for (let i = 0; i < 6; i++) { c.fillStyle = grad(c, X(0.14 + i * 0.13), 0, X(0.14 + i * 0.13 + 0.05), 0, '#fbf6e8', '#b4a880'); c.fillRect(X(0.14 + i * 0.13), Y(0.42), s * 0.05, s * 0.44); c.fillStyle = '#d4c9a0'; c.fillRect(X(0.13 + i * 0.13), Y(0.4), s * 0.07, s * 0.03); }
      c.fillStyle = '#d4c9a0'; c.fillRect(X(0.08), Y(0.36), s * 0.84, s * 0.05); P(c, [[X(0.1), Y(0.36)], [X(0.5), Y(0.22)], [X(0.9), Y(0.36)]], '#e8dec0', 'rgba(0,0,0,.3)');
      c.fillStyle = grad(c, X(0.3), 0, X(0.7), 0, '#4a78c8', '#1e3a78'); c.beginPath(); c.arc(X(0.5), Y(0.22), s * 0.18, Math.PI, 0); c.fill(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.stroke(); c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.arc(X(0.44), Y(0.17), s * 0.07, 0, 6.283); c.fill();
      c.fillStyle = '#e8c24a'; c.fillRect(X(0.5) - 1, Y(-0.04), 2, s * 0.08); circ(c, X(0.5), Y(-0.05), s * 0.025, '#e8c24a');
      c.fillStyle = '#3a2a18'; c.fillRect(X(0.45), Y(0.62), s * 0.1, s * 0.24); c.fillStyle = col; for (const bx of [0.2, 0.74]) { c.fillRect(X(bx), Y(0.5), s * 0.06, s * 0.2); P(c, [[X(bx), Y(0.7)], [X(bx + 0.03), Y(0.66)], [X(bx + 0.06), Y(0.7)]], col); }
    } else if (age === 1) { // medrese/kütüphane: sivri kemerler
      c.fillStyle = grad(c, 0, Y(0.3), 0, Y(0.95), '#d6c9a2', '#a39870'); c.fillRect(X(0.04), Y(0.3), s * 0.92, s * 0.65); courses(c, X(0.04), Y(0.3), s * 0.92, s * 0.65, s * 0.1, s * 0.06, 'rgba(60,46,24,.3)');
      crenel(c, X(0.04), Y(0.3), s * 0.92, 8, s * 0.04, '#b8aa80');
      for (let i = 0; i < 4; i++) archWin(c, X(0.12 + i * 0.2), Y(0.5), s * 0.14, s * 0.35, i === 1 || i === 2, '#5a4a2a');
      c.fillStyle = grad(c, X(0.38), 0, X(0.62), 0, '#3e72c0', '#1c3470'); c.beginPath(); c.arc(X(0.5), Y(0.26), s * 0.15, Math.PI, 0); c.fill(); c.fillStyle = '#d6c9a2'; c.fillRect(X(0.36), Y(0.26), s * 0.28, s * 0.06);
      for (const bx of [0.1, 0.84]) { c.fillStyle = grad(c, X(bx), 0, X(bx + 0.06), 0, '#d6c9a2', '#a39870'); c.fillRect(X(bx), Y(0.12), s * 0.06, s * 0.22); c.fillStyle = '#3e72c0'; c.beginPath(); c.arc(X(bx + 0.03), Y(0.12), s * 0.04, Math.PI, 0); c.fill(); }
      c.fillStyle = '#e8c24a'; c.fillRect(X(0.5) - 1, Y(0.04), 2, s * 0.08); c.fillStyle = col; c.fillRect(X(0.38), Y(0.36), s * 0.24, s * 0.03);
      c.fillStyle = '#e8dcb4'; rrect(c, X(0.44), Y(0.82), s * 0.12, s * 0.05, 2); c.fill();
    } else if (age === 2) { // tuğla üniversite, saat kulesi
      c.fillStyle = grad(c, 0, Y(0.34), 0, Y(0.95), '#a85a3c', '#783a28'); c.fillRect(X(0.04), Y(0.34), s * 0.92, s * 0.6); courses(c, X(0.04), Y(0.34), s * 0.92, s * 0.6, s * 0.08, s * 0.045, 'rgba(40,16,10,.4)', 'rgba(255,210,180,.06)');
      c.fillStyle = '#d8d0c0'; c.fillRect(X(0.02), Y(0.31), s * 0.96, s * 0.04); c.fillRect(X(0.02), Y(0.9), s * 0.96, s * 0.04);
      for (let i = 0; i < 5; i++) for (const yy of [0.42, 0.65]) rectWin(c, X(0.09 + i * 0.17), Y(yy), s * 0.1, s * 0.16, (i + (yy > 0.5 ? 1 : 0) + Math.floor(t * 0.2)) % 3 !== 0, '#d8d0c0');
      c.fillStyle = grad(c, X(0.36), 0, X(0.64), 0, '#c06a48', '#8a4430'); c.fillRect(X(0.36), Y(0.1), s * 0.28, s * 0.26); c.fillStyle = '#d8d0c0'; c.fillRect(X(0.34), Y(0.08), s * 0.32, s * 0.03); cone(c, X(0.5), Y(0.08), s * 0.34, s * 0.14, col, cd);
      circ(c, X(0.5), Y(0.2), s * 0.065, '#f4eedc'); c.strokeStyle = '#2a2218'; c.lineWidth = 1; c.beginPath(); c.arc(X(0.5), Y(0.2), s * 0.065, 0, 6.283); c.moveTo(X(0.5), Y(0.2)); c.lineTo(X(0.5), Y(0.15)); c.moveTo(X(0.5), Y(0.2)); c.lineTo(X(0.54), Y(0.22)); c.stroke();
      c.fillStyle = '#2a1a10'; c.beginPath(); c.moveTo(X(0.44), Y(0.94)); c.lineTo(X(0.44), Y(0.76)); c.arc(X(0.5), Y(0.76), s * 0.06, Math.PI, 0); c.lineTo(X(0.56), Y(0.94)); c.closePath(); c.fill();
      flag(c, X(0.5), Y(0.01), s * 0.2, cl, t, b.id, 1);
    } else { // modern araştırma merkezi: cam küp + gözlemevi kubbesi
      c.fillStyle = grad(c, 0, Y(0.3), 0, Y(0.95), '#e2e6ec', '#aab1bb'); c.fillRect(X(0.04), Y(0.4), s * 0.92, s * 0.55);
      c.fillStyle = grad(c, X(0.1), Y(0.46), X(0.9), Y(0.92), '#8cc0ec', '#24486e'); c.fillRect(X(0.08), Y(0.46), s * 0.84, s * 0.4); c.strokeStyle = 'rgba(225,240,255,.35)'; c.lineWidth = 1; for (let i = 1; i < 8; i++) { c.beginPath(); c.moveTo(X(0.08 + i * 0.105), Y(0.46)); c.lineTo(X(0.08 + i * 0.105), Y(0.86)); c.stroke(); } for (let j = 1; j < 4; j++) { c.beginPath(); c.moveTo(X(0.08), Y(0.46 + j * 0.1)); c.lineTo(X(0.92), Y(0.46 + j * 0.1)); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,.2)'; P(c, [[X(0.08), Y(0.46)], [X(0.4), Y(0.46)], [X(0.08), Y(0.78)]]); c.fill();
      c.fillStyle = col; c.fillRect(X(0.04), Y(0.4), s * 0.92, s * 0.03);
      c.fillStyle = grad(c, X(0.3), 0, X(0.7), 0, '#f4f6fa', '#aeb6c2'); c.beginPath(); c.arc(X(0.5), Y(0.4), s * 0.2, Math.PI, 0); c.fill(); c.strokeStyle = '#6a7280'; c.lineWidth = 1.2; c.stroke(); c.fillStyle = '#2a3442'; c.save(); c.translate(X(0.5), Y(0.4)); c.rotate(-0.5); c.fillRect(-s * 0.03, -s * 0.2, s * 0.06, s * 0.2); c.restore();
      c.save(); c.translate(X(0.82), Y(0.32)); c.rotate(-0.6 + Math.sin(t * 0.5 + b.id) * 0.2); c.fillStyle = grad(c, -s * 0.07, 0, s * 0.07, 0, '#f4f6fa', '#a4acb8'); c.beginPath(); c.ellipse(0, 0, s * 0.08, s * 0.04, 0, 0, 6.283); c.fill(); c.restore();
      c.fillStyle = '#10161e'; c.fillRect(X(0.44), Y(0.7), s * 0.12, s * 0.16); glow(c, X(0.5), Y(0.62), s * 0.1, 'rgba(110,190,255,.45)');
      flag(c, X(0.14), Y(0.4) - s * 0.0, s * 0.2, cl, t, b.id, 1);
    }
  }

  /* ============ KULE ============ */
  function tower(c, V, b, px, py, s, col, cd, cl, t, age) {
    const X = wx(px, s), Y = wy(py, s);
    c.fillStyle = 'rgba(0,0,0,.14)'; ell(c, X(0.5), Y(0.96), s * 0.42, s * 0.07, 0, 'rgba(0,0,0,.18)');
    if (age === 0) { // taş kule, ahşap korkuluk, konik çatı
      cylinder(c, X(0.22), Y(0.3), s * 0.56, s * 0.66, '#b9a97c', '#e2d4aa', '#7c6c46'); courses(c, X(0.22), Y(0.3), s * 0.56, s * 0.66, s * 0.14, s * 0.1, 'rgba(60,46,24,.35)');
      c.fillStyle = '#6a4a28'; c.fillRect(X(0.17), Y(0.26), s * 0.66, s * 0.07); for (let i = 0; i < 5; i++) c.fillRect(X(0.19 + i * 0.14), Y(0.33), s * 0.03, s * 0.07);
      cone(c, X(0.5), Y(0.26), s * 0.66, s * 0.3, col, cd); c.fillStyle = '#1a1510'; c.fillRect(X(0.47), Y(0.5), s * 0.06, s * 0.14); c.fillRect(X(0.47), Y(0.72), s * 0.06, s * 0.1);
      pole(c, X(0.5), Y(0.0), s * 0.16, 1.4); flag(c, X(0.5), Y(-0.16), s * 0.4, cl, t, b.id, 1);
    } else if (age === 1) { // mazgallı bastion kule + top
      cylinder(c, X(0.2), Y(0.24), s * 0.6, s * 0.72, '#b4a888', '#dccfae', '#7a7058'); courses(c, X(0.2), Y(0.24), s * 0.6, s * 0.72, s * 0.14, s * 0.1, 'rgba(50,40,24,.4)');
      crenel(c, X(0.18), Y(0.24), s * 0.64, 4, s * 0.07, '#a89c7e'); c.fillStyle = col; c.fillRect(X(0.2), Y(0.3), s * 0.6, s * 0.04);
      c.fillStyle = '#14100c'; c.fillRect(X(0.4), Y(0.5), s * 0.2, s * 0.12); c.fillStyle = '#2a2d32'; c.fillRect(X(0.5), Y(0.53), s * 0.4, s * 0.06); c.fillStyle = '#c8a040'; c.fillRect(X(0.74), Y(0.52), s * 0.02, s * 0.08);
      pole(c, X(0.5), Y(0.17), s * 0.12, 1.3); flag(c, X(0.5), Y(0.05), s * 0.34, cl, t, b.id, 1);
    } else if (age === 2) { // beton gözetleme kulesi + projektör + mitralyöz
      c.fillStyle = grad(c, X(0.3), 0, X(0.7), 0, '#aeb2b8', '#7e848c'); c.fillRect(X(0.3), Y(0.36), s * 0.4, s * 0.6); c.strokeStyle = 'rgba(30,36,44,.4)'; c.lineWidth = 1; for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(X(0.3), Y(0.36 + i * 0.12)); c.lineTo(X(0.7), Y(0.36 + i * 0.12)); c.stroke(); }
      c.fillStyle = '#5a6068'; P(c, [[X(0.18), Y(0.34)], [X(0.24), Y(0.18)], [X(0.76), Y(0.18)], [X(0.82), Y(0.34)]], '#5a6068', 'rgba(0,0,0,.4)'); c.fillStyle = 'rgba(160,210,255,.6)'; c.fillRect(X(0.27), Y(0.22), s * 0.46, s * 0.08); c.fillStyle = col; c.fillRect(X(0.18), Y(0.34), s * 0.64, s * 0.03);
      c.fillStyle = '#2a2d32'; c.fillRect(X(0.74), Y(0.26), s * 0.22, s * 0.04); c.fillRect(X(0.7), Y(0.22), s * 0.06, s * 0.12);
      const bx = 0.5 + Math.sin(t * 0.7 + b.id) * 0.2; c.save(); c.globalCompositeOperation = 'lighter'; const gg = c.createLinearGradient(X(0.5), Y(0.14), X(bx + (bx - 0.5) * 2), Y(-0.3)); gg.addColorStop(0, 'rgba(255,250,210,.4)'); gg.addColorStop(1, 'rgba(255,250,210,0)'); c.fillStyle = gg; P(c, [[X(0.5), Y(0.14)], [X(bx - 0.1 + (bx - 0.5)), Y(-0.35)], [X(bx + 0.1 + (bx - 0.5)), Y(-0.35)]]); c.fill(); c.restore(); circ(c, X(0.5), Y(0.14), s * 0.04, '#fff6c8');
      for (let i = 0; i < 4; i++) { c.fillStyle = (i % 2) ? '#b8a878' : '#a89868'; rrect(c, X(0.22 + i * 0.14), Y(0.9), s * 0.15, s * 0.07, 2); c.fill(); }
    } else { // çelik kule: radar + lazer
      c.strokeStyle = '#8a929c'; c.lineWidth = Math.max(2, s * 0.04); c.beginPath(); c.moveTo(X(0.3), Y(0.96)); c.lineTo(X(0.42), Y(0.3)); c.moveTo(X(0.7), Y(0.96)); c.lineTo(X(0.58), Y(0.3)); c.stroke(); c.lineWidth = 1.2; for (let i = 1; i < 6; i++) { const yy = 0.3 + i * 0.11, k = i / 6, xl = 0.42 - 0.12 * k, xr = 0.58 + 0.12 * k; c.beginPath(); c.moveTo(X(xl), Y(yy)); c.lineTo(X(xr), Y(yy)); c.moveTo(X(xl), Y(yy)); c.lineTo(X(xr + 0.0), Y(yy - 0.11)); c.stroke(); }
      c.fillStyle = grad(c, X(0.28), 0, X(0.72), 0, '#d8dde4', '#8e96a2'); rrect(c, X(0.28), Y(0.18), s * 0.44, s * 0.16, 4); c.fill(); c.strokeStyle = '#4a525c'; c.lineWidth = 1; c.stroke(); c.fillStyle = col; c.fillRect(X(0.28), Y(0.26), s * 0.44, s * 0.025);
      const pu = 0.7 + 0.3 * Math.sin(t * 4 + b.id); circ(c, X(0.5), Y(0.12), s * 0.07, '#1a2434'); circ(c, X(0.5), Y(0.12), s * 0.045, `rgba(120,220,255,${0.6 + 0.4 * pu})`); glow(c, X(0.5), Y(0.12), s * 0.22, `rgba(80,200,255,${0.5 * pu})`);
      c.save(); c.translate(X(0.5), Y(-0.04)); c.rotate(t * 1.6 + b.id); c.fillStyle = '#e4e8ee'; c.beginPath(); c.ellipse(0, 0, s * 0.14, s * 0.04, 0, 0, 6.283); c.fill(); c.restore(); c.fillStyle = '#6a7078'; c.fillRect(X(0.5) - 1, Y(-0.04), 2, s * 0.12);
      c.fillStyle = '#1c3a66'; P(c, [[X(0.74), Y(0.3)], [X(0.92), Y(0.3)], [X(0.9), Y(0.22)], [X(0.76), Y(0.22)]], '#1c3a66', 'rgba(160,200,255,.5)');
    }
  }

  /* ============ TABYA ============ */
  function fortress(c, V, b, px, py, s, col, cd, cl, t, age) {
    age = Math.max(1, age); const X = wx(px, s), Y = wy(py, s);
    if (age === 1) { // yuvarlak köşe kuleli taş kale, toplar
      c.fillStyle = grad(c, 0, Y(0.4), 0, Y(0.95), '#a09478', '#6e644c'); c.fillRect(X(0.06), Y(0.4), s * 0.88, s * 0.55); courses(c, X(0.06), Y(0.4), s * 0.88, s * 0.55, s * 0.1, s * 0.06, 'rgba(30,24,16,.4)'); crenel(c, X(0.06), Y(0.4), s * 0.88, 9, s * 0.05, '#8a7e64');
      for (const cx of [0.12, 0.88]) { cylinder(c, X(cx) - s * 0.11, Y(0.22), s * 0.22, s * 0.73, '#8c8068', '#b8ac8c', '#5e543e'); courses(c, X(cx) - s * 0.11, Y(0.22), s * 0.22, s * 0.73, s * 0.07, s * 0.06, 'rgba(30,24,16,.4)'); crenel(c, X(cx) - s * 0.12, Y(0.22), s * 0.24, 4, s * 0.05, '#7a6e56'); c.fillStyle = '#14100c'; c.fillRect(X(cx) - s * 0.015, Y(0.4), s * 0.03, s * 0.09); c.fillStyle = '#2a2d32'; c.save(); c.translate(X(cx), Y(0.3)); c.rotate(cx < 0.5 ? -0.3 : 0.3); c.fillRect(cx < 0.5 ? -s * 0.2 : 0, -s * 0.025, s * 0.2, s * 0.05); c.restore(); if (rnd() < 0.01) smokeAt(b.tx + (cx < 0.5 ? -0.1 : 1.1) * (s / V.ts), b.ty + 0.27 * (s / V.ts), 2, 0.2, 0.3); }
      c.fillStyle = '#16100a'; c.beginPath(); c.moveTo(X(0.4), Y(0.95)); c.lineTo(X(0.4), Y(0.7)); c.arc(X(0.5), Y(0.7), s * 0.1, Math.PI, 0); c.lineTo(X(0.6), Y(0.95)); c.closePath(); c.fill(); c.strokeStyle = '#6a5a3a'; c.lineWidth = 1.2; for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(X(0.4 + i * 0.04), Y(0.62)); c.lineTo(X(0.4 + i * 0.04), Y(0.95)); c.stroke(); } for (let j = 0; j < 4; j++) { c.beginPath(); c.moveTo(X(0.4), Y(0.72 + j * 0.06)); c.lineTo(X(0.6), Y(0.72 + j * 0.06)); c.stroke(); }
      c.fillStyle = col; c.fillRect(X(0.06), Y(0.44), s * 0.88, s * 0.03); pole(c, X(0.5), Y(0.4), s * 0.12, 1.4); flag(c, X(0.5), Y(0.4) - s * 0.12, s * 0.32, cl, t, b.id, 1);
    } else if (age === 2) { // beton kale: mitralyöz kuleleri, kum torbaları, projektör
      c.fillStyle = grad(c, 0, Y(0.36), 0, Y(0.95), '#9aa0a6', '#6a7078'); P(c, [[X(0.04), Y(0.95)], [X(0.04), Y(0.5)], [X(0.14), Y(0.36)], [X(0.86), Y(0.36)], [X(0.96), Y(0.5)], [X(0.96), Y(0.95)]], c.fillStyle, 'rgba(0,0,0,.45)');
      c.strokeStyle = 'rgba(20,26,32,.4)'; c.lineWidth = 1; for (let i = 1; i < 8; i++) { c.beginPath(); c.moveTo(X(0.04 + i * 0.115), Y(0.4)); c.lineTo(X(0.04 + i * 0.115), Y(0.95)); c.stroke(); }
      for (const tx of [0.14, 0.86]) { c.fillStyle = grad(c, X(tx) - s * 0.1, 0, X(tx) + s * 0.1, 0, '#8a9098', '#aab0b8'); rrect(c, X(tx) - s * 0.1, Y(0.18), s * 0.2, s * 0.3, 4); c.fill(); c.strokeStyle = 'rgba(0,0,0,.4)'; c.stroke(); c.fillStyle = '#14181e'; c.fillRect(X(tx) - s * 0.07, Y(0.26), s * 0.14, s * 0.05); c.fillStyle = '#2a2d32'; c.fillRect(tx < 0.5 ? X(tx) - s * 0.18 : X(tx) + s * 0.04, Y(0.275), s * 0.14, s * 0.02); }
      c.fillStyle = '#242a32'; c.fillRect(X(0.38), Y(0.62), s * 0.24, s * 0.33); c.strokeStyle = '#c8ccd2'; c.lineWidth = 1.4; c.strokeRect(X(0.38), Y(0.62), s * 0.24, s * 0.33); c.fillStyle = '#e6c63a'; for (let i = 0; i < 4; i++) c.fillRect(X(0.38 + i * 0.06), Y(0.93), s * 0.03, s * 0.02);
      c.fillStyle = col; c.fillRect(X(0.04), Y(0.44), s * 0.92, s * 0.03);
      for (let r = 0; r < 2; r++) for (let q = 0; q < 10; q++) { c.fillStyle = (q + r) % 2 ? '#b8a878' : '#a89868'; rrect(c, X(0.04 + q * 0.093 + (r % 2) * 0.04), Y(0.9 + r * 0.04), s * 0.095, s * 0.045, 2); c.fill(); }
      const bx = 0.5 + Math.sin(t * 0.8 + b.id) * 0.18; circ(c, X(0.5), Y(0.34), s * 0.03, '#fff6c8'); glow(c, X(0.5), Y(0.34), s * 0.1, 'rgba(255,250,200,.6)'); c.fillStyle = '#8a929c'; c.fillRect(X(0.5) - 1, Y(0.2), 2, s * 0.16);
      pole(c, X(0.7), Y(0.36), s * 0.12, 1.4); flag(c, X(0.7), Y(0.36) - s * 0.12, s * 0.28, cl, t, b.id, 1);
    } else { // modern zırhlı kale: eğimli zırh, füze kapsülleri, radar, lazer
      c.fillStyle = grad(c, 0, Y(0.38), 0, Y(0.95), '#7a8490', '#3e4650'); P(c, [[X(0.02), Y(0.95)], [X(0.1), Y(0.5)], [X(0.22), Y(0.38)], [X(0.78), Y(0.38)], [X(0.9), Y(0.5)], [X(0.98), Y(0.95)]], c.fillStyle, 'rgba(0,0,0,.5)');
      c.strokeStyle = 'rgba(190,210,230,.3)'; c.lineWidth = 1; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(X(0.04 + i * 0.16), Y(0.4)); c.lineTo(X(0.02 + i * 0.16), Y(0.95)); c.stroke(); } c.fillStyle = col; P(c, [[X(0.1), Y(0.5)], [X(0.22), Y(0.38)], [X(0.78), Y(0.38)], [X(0.9), Y(0.5)]], col);
      for (let i = 0; i < 4; i++) { c.save(); c.translate(X(0.18 + i * 0.1), Y(0.36)); c.rotate(-0.4); c.fillStyle = '#e8ecf2'; c.fillRect(-s * 0.02, -s * 0.2, s * 0.04, s * 0.2); c.fillStyle = '#d4302c'; c.fillRect(-s * 0.02, -s * 0.22, s * 0.04, s * 0.03); c.restore(); }
      const pu = 0.7 + 0.3 * Math.sin(t * 4 + b.id); c.fillStyle = '#1a2434'; rrect(c, X(0.6), Y(0.2), s * 0.26, s * 0.18, 5); c.fill(); circ(c, X(0.73), Y(0.29), s * 0.055, `rgba(120,220,255,${0.6 + 0.4 * pu})`); glow(c, X(0.73), Y(0.29), s * 0.2, `rgba(80,200,255,${0.5 * pu})`);
      c.save(); c.translate(X(0.45), Y(0.14)); c.rotate(t * 1.4 + b.id); c.fillStyle = '#e4e8ee'; c.beginPath(); c.ellipse(0, 0, s * 0.12, s * 0.035, 0, 0, 6.283); c.fill(); c.restore(); c.fillStyle = '#6a7078'; c.fillRect(X(0.45) - 1, Y(0.14), 2, s * 0.26);
      c.fillStyle = '#10161e'; c.fillRect(X(0.4), Y(0.66), s * 0.2, s * 0.29); c.strokeStyle = '#8a929c'; c.lineWidth = 1.2; c.strokeRect(X(0.4), Y(0.66), s * 0.2, s * 0.29); c.fillStyle = '#e6c63a'; c.fillRect(X(0.4), Y(0.9), s * 0.2, s * 0.03);
    }
  }

  /* ============ HAVA ÜSSÜ ============ */
  function airfield(c, V, b, px, py, s, col, cd, cl, t) {
    const X = wx(px, s), Y = wy(py, s);
    c.fillStyle = grad(c, 0, Y(0.7), 0, Y(0.99), '#4a4f58', '#2e323a'); c.fillRect(X(0.0), Y(0.7), s * 1.0, s * 0.29); c.strokeStyle = '#f2f2f2'; c.lineWidth = Math.max(1.5, s * 0.02); c.setLineDash([s * 0.08, s * 0.06]); c.beginPath(); c.moveTo(X(0.02), Y(0.845)); c.lineTo(X(0.98), Y(0.845)); c.stroke(); c.setLineDash([]); c.fillStyle = '#e6c63a'; for (let i = 0; i < 8; i++) c.fillRect(X(0.03 + i * 0.12), Y(0.71), s * 0.05, s * 0.015);
    // hangar
    c.fillStyle = grad(c, 0, Y(0.3), 0, Y(0.7), '#aab0b8', '#6e7680'); c.beginPath(); c.moveTo(X(0.04), Y(0.7)); c.lineTo(X(0.04), Y(0.5)); c.quadraticCurveTo(X(0.04), Y(0.28), X(0.3), Y(0.28)); c.quadraticCurveTo(X(0.56), Y(0.28), X(0.56), Y(0.5)); c.lineTo(X(0.56), Y(0.7)); c.closePath(); c.fill(); c.strokeStyle = 'rgba(30,36,44,.45)'; c.lineWidth = 1; c.stroke(); for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(X(0.04 + i * 0.087), Y(0.7)); c.quadraticCurveTo(X(0.04 + i * 0.087), Y(0.3), X(0.04 + i * 0.087), Y(0.3)); c.stroke(); }
    c.fillStyle = '#12161c'; c.beginPath(); c.moveTo(X(0.12), Y(0.7)); c.lineTo(X(0.12), Y(0.52)); c.quadraticCurveTo(X(0.12), Y(0.42), X(0.3), Y(0.42)); c.quadraticCurveTo(X(0.48), Y(0.42), X(0.48), Y(0.52)); c.lineTo(X(0.48), Y(0.7)); c.closePath(); c.fill(); P(c, [[X(0.25), Y(0.7)], [X(0.3), Y(0.56)], [X(0.35), Y(0.7)]], '#8a929c'); c.fillStyle = col; c.fillRect(X(0.04), Y(0.62), s * 0.52, s * 0.025);
    // kontrol kulesi
    c.fillStyle = grad(c, X(0.7), 0, X(0.82), 0, '#d4d8de', '#9aa0aa'); c.fillRect(X(0.7), Y(0.26), s * 0.12, s * 0.44); c.fillStyle = 'rgba(150,215,255,.8)'; c.fillRect(X(0.66), Y(0.16), s * 0.2, s * 0.1); c.strokeStyle = '#4a525c'; c.lineWidth = 1.2; c.strokeRect(X(0.66), Y(0.16), s * 0.2, s * 0.1); c.fillStyle = '#6a7078'; c.fillRect(X(0.64), Y(0.14), s * 0.24, s * 0.03);
    c.save(); c.translate(X(0.76), Y(0.1)); c.rotate(t * 2 + b.id); c.fillStyle = '#e4e8ee'; c.fillRect(-s * 0.07, -1, s * 0.14, 2); c.restore(); circ(c, X(0.76), Y(0.1), s * 0.02, Math.sin(t * 4) > 0 ? '#ff3a30' : '#601812');
    // park halindeki jet, yakıt tankları, rüzgâr çorabı
    c.save(); c.translate(X(0.75), Y(0.83)); c.fillStyle = '#a8aeb8'; P(c, [[s * 0.15, 0], [-s * 0.04, -s * 0.03], [-s * 0.14, -s * 0.12], [-s * 0.14, -s * 0.09], [-s * 0.08, -s * 0.02], [-s * 0.16, -s * 0.02], [-s * 0.16, s * 0.02], [-s * 0.08, s * 0.02], [-s * 0.14, s * 0.09], [-s * 0.14, s * 0.12], [-s * 0.04, s * 0.03]], '#a8aeb8', 'rgba(0,0,0,.4)'); c.fillStyle = 'rgba(120,190,255,.9)'; c.fillRect(s * 0.02, -s * 0.015, s * 0.06, s * 0.03); c.restore();
    for (let i = 0; i < 2; i++) { c.fillStyle = grad(c, X(0.88 + i * 0.07), 0, X(0.94 + i * 0.07), 0, '#e6e9ee', '#9aa2ae'); c.fillRect(X(0.88 + i * 0.07), Y(0.58), s * 0.06, s * 0.12); c.beginPath(); c.ellipse(X(0.91 + i * 0.07), Y(0.58), s * 0.03, s * 0.015, 0, 0, 6.283); c.fill(); }
    c.fillStyle = '#4a4a50'; c.fillRect(X(0.02), Y(0.05), 1.6, s * 0.23); P(c, [[X(0.02), Y(0.06)], [X(0.18), Y(0.09)], [X(0.02), Y(0.13)]], '#ff7a1c'); P(c, [[X(0.1), Y(0.075)], [X(0.14), Y(0.085)], [X(0.1), Y(0.11)]], '#fff');
  }

  /* ============ UÇAKSAVAR (SAM) ============ */
  function sam(c, V, b, px, py, s, col, cd, cl, t) {
    const X = wx(px, s), Y = wy(py, s);
    c.fillStyle = grad(c, 0, Y(0.6), 0, Y(0.98), '#6a6a58', '#4a4a3c'); rrect(c, X(0.04), Y(0.62), s * 0.92, s * 0.34, 6); c.fill();
    for (let r = 0; r < 2; r++) for (let q = 0; q < 9; q++) { c.fillStyle = (q + r) % 2 ? '#b8a878' : '#a89868'; rrect(c, X(0.03 + q * 0.1 + (r % 2) * 0.04), Y(0.86 + r * 0.06), s * 0.11, s * 0.06, 2); c.fill(); }
    c.fillStyle = grad(c, 0, Y(0.5), 0, Y(0.8), '#5a6a42', '#3e4a2c'); rrect(c, X(0.12), Y(0.55), s * 0.56, s * 0.27, 4); c.fill(); c.strokeStyle = 'rgba(0,0,0,.4)'; c.stroke(); circ(c, X(0.22), Y(0.84), s * 0.06, '#1c1c20'); circ(c, X(0.58), Y(0.84), s * 0.06, '#1c1c20');
    for (let i = 0; i < 4; i++) { c.save(); c.translate(X(0.2 + i * 0.12), Y(0.56)); c.rotate(-0.55); c.fillStyle = '#eceff4'; c.fillRect(-s * 0.025, -s * 0.34, s * 0.05, s * 0.34); c.fillStyle = '#d4302c'; c.beginPath(); c.moveTo(-s * 0.025, -s * 0.34); c.lineTo(0, -s * 0.4); c.lineTo(s * 0.025, -s * 0.34); c.fill(); c.fillStyle = '#6a707a'; c.fillRect(-s * 0.03, -s * 0.1, s * 0.06, s * 0.02); c.restore(); }
    c.fillStyle = '#3e4a2c'; c.fillRect(X(0.74), Y(0.55), s * 0.2, s * 0.22); c.fillStyle = 'rgba(150,200,240,.6)'; c.fillRect(X(0.77), Y(0.58), s * 0.1, s * 0.07);
    c.save(); c.translate(X(0.84), Y(0.5)); c.rotate(t * 2.2 + b.id); c.fillStyle = '#dde1e7'; c.beginPath(); c.ellipse(0, 0, s * 0.11, s * 0.035, 0, 0, 6.283); c.fill(); c.restore(); c.fillStyle = '#6a7078'; c.fillRect(X(0.84) - 1, Y(0.5), 2, s * 0.08); c.fillStyle = col; c.fillRect(X(0.12), Y(0.6), s * 0.56, s * 0.02);
  }

  /* ============ RADAR ============ */
  function radar(c, V, b, px, py, s, col, cd, cl, t) {
    const X = wx(px, s), Y = wy(py, s);
    c.fillStyle = grad(c, 0, Y(0.62), 0, Y(0.96), '#c4c9cf', '#8a9098'); rrect(c, X(0.12), Y(0.64), s * 0.76, s * 0.32, 4); c.fill(); c.strokeStyle = 'rgba(0,0,0,.4)'; c.stroke(); c.fillStyle = col; c.fillRect(X(0.12), Y(0.72), s * 0.76, s * 0.03); c.fillStyle = '#1a2230'; c.fillRect(X(0.42), Y(0.78), s * 0.16, s * 0.18);
    c.fillStyle = '#7a828c'; c.fillRect(X(0.46), Y(0.3), s * 0.08, s * 0.36); c.strokeStyle = '#5a6068'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(X(0.46), Y(0.66)); c.lineTo(X(0.36), Y(0.96)); c.moveTo(X(0.54), Y(0.66)); c.lineTo(X(0.64), Y(0.96)); c.stroke();
    c.save(); c.translate(X(0.5), Y(0.28)); const a2 = Math.cos(t * 1.6 + b.id); c.scale(a2, 1); c.fillStyle = grad(c, -s * 0.4, 0, s * 0.4, 0, '#f0f3f7', '#9aa0aa'); c.beginPath(); c.ellipse(0, 0, s * 0.4, s * 0.17, 0, 0, 6.283); c.fill(); c.strokeStyle = '#5a5f68'; c.lineWidth = 1.5; c.stroke(); c.restore();
    circ(c, X(0.5), Y(0.07), s * 0.04, Math.sin(t * 4 + b.id) > 0 ? '#ff4030' : '#702018'); c.fillStyle = '#6a7078'; c.fillRect(X(0.5) - 1, Y(0.08), 2, s * 0.2);
    c.globalCompositeOperation = 'lighter'; const rr = (t * 0.7 + b.id) % 1; c.strokeStyle = `rgba(110,200,255,${(1 - rr) * 0.35})`; c.lineWidth = 1.5; c.beginPath(); c.arc(X(0.5), Y(0.28), s * (0.3 + rr * 0.5), 0, 6.283); c.stroke(); c.globalCompositeOperation = 'source-over';
  }

  /* ============ ÇİFTLİK (1x1) ============ */
  function farm(c, V, b, px, py, s, col, cd, cl, t) {
    const X = wx(px, s), Y = wy(py, s);
    c.fillStyle = grad(c, 0, Y(0), 0, Y(1), '#7a5a30', '#5a4020'); rrect(c, X(0.02), Y(0.04), s * 0.96, s * 0.92, s * 0.06); c.fill();
    for (let i = 0; i < 5; i++) { const yy = Y(0.12 + i * 0.17); c.fillStyle = '#4a3418'; c.fillRect(X(0.07), yy + s * 0.08, s * 0.86, s * 0.03); for (let j = 0; j < 7; j++) { const xx = X(0.1 + j * 0.13), sw = Math.sin(t * 2 + j + i) * s * 0.012; c.strokeStyle = (i + j) % 2 ? '#d4c040' : '#b4c43a'; c.lineWidth = Math.max(1.4, s * 0.035); c.beginPath(); c.moveTo(xx, yy + s * 0.09); c.lineTo(xx + sw, yy - s * 0.02); c.stroke(); circ(c, xx + sw, yy - s * 0.03, s * 0.028, '#ecd24a'); } }
    c.strokeStyle = '#5a3d22'; c.lineWidth = Math.max(1.5, s * 0.04); c.strokeRect(X(0.02), Y(0.04), s * 0.96, s * 0.92); c.fillStyle = '#5a3d22'; for (const [fx, fy] of [[0.02, 0.04], [0.98, 0.04], [0.02, 0.96], [0.98, 0.96]]) c.fillRect(X(fx) - s * 0.03, Y(fy) - s * 0.03, s * 0.06, s * 0.06);
  }


  /* ============ KIŞLA (yeniden) ============ */
  const swords = (c, x, y, z, w) => { c.strokeStyle = '#e8eaf2'; c.lineWidth = w || Math.max(1.6, z * 0.35); c.lineCap = 'round'; c.beginPath(); c.moveTo(x - z, y - z); c.lineTo(x + z, y + z); c.moveTo(x + z, y - z); c.lineTo(x - z, y + z); c.stroke(); c.strokeStyle = '#c8a040'; c.lineWidth = (w || Math.max(1.6, z * 0.35)) * 1.1; c.beginPath(); c.moveTo(x - z * 0.55, y - z * 0.25); c.lineTo(x - z * 0.25, y - z * 0.55); c.moveTo(x + z * 0.55, y - z * 0.25); c.lineTo(x + z * 0.25, y - z * 0.55); c.stroke(); };
  const torch = (c, V, X, Y, s, fx, fy, t, seed) => { c.fillStyle = '#3a2a18'; c.fillRect(X(fx) - 1, Y(fy), 2, s * 0.08); glow(c, X(fx), Y(fy - 0.02), s * (0.1 + 0.015 * Math.sin(t * 11 + seed)), 'rgba(255,200,100,.95)'); };
  function barracks2(c, V, b, px, py, s, col, cd, cl, t, age) {
    const X = wx(px, s), Y = wy(py, s);
    if (age === 0) { // Ocak: taş tabanlı, kerpiç üst katlı salon + kapı kulesi
      c.fillStyle = grad(c, 0, Y(0.52), 0, Y(0.96), '#bcae86', '#8a7a58'); c.fillRect(X(0.04), Y(0.52), s * 0.92, s * 0.44); courses(c, X(0.04), Y(0.52), s * 0.92, s * 0.44, s * 0.11, s * 0.065, 'rgba(60,46,24,.38)', 'rgba(255,255,255,.05)');
      c.fillStyle = grad(c, 0, Y(0.3), 0, Y(0.54), '#efe3c4', '#cfc09a'); c.fillRect(X(0.1), Y(0.3), s * 0.8, s * 0.24); c.strokeStyle = '#5a3d22'; c.lineWidth = Math.max(1.4, s * 0.03); for (let i = 0; i <= 8; i++) { c.beginPath(); c.moveTo(X(0.1 + i * 0.1), Y(0.3)); c.lineTo(X(0.1 + i * 0.1), Y(0.54)); c.stroke(); } c.beginPath(); c.moveTo(X(0.1), Y(0.3)); c.lineTo(X(0.9), Y(0.3)); c.moveTo(X(0.1), Y(0.42)); c.lineTo(X(0.9), Y(0.42)); c.stroke();
      gabled(c, X, Y, -0.03, 1.03, 0.07, 0.34, col, cd, 5); c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(X(0.16), Y(0.065), s * 0.68, s * 0.022);
      for (const dx of [0.2, 0.74]) { P(c, [[X(dx), Y(0.22)], [X(dx + 0.06), Y(0.12)], [X(dx + 0.12), Y(0.22)]], '#6a4a2a', 'rgba(0,0,0,.4)'); c.fillStyle = '#ffd88a'; c.fillRect(X(dx + 0.035), Y(0.17), s * 0.05, s * 0.05); }
      c.fillStyle = grad(c, X(0.36), 0, X(0.64), 0, '#c8ba90', '#8e7e5a'); c.fillRect(X(0.36), Y(0.3), s * 0.28, s * 0.66); courses(c, X(0.36), Y(0.3), s * 0.28, s * 0.66, s * 0.09, s * 0.06, 'rgba(60,46,24,.38)');
      gabled(c, X, Y, 0.32, 0.68, 0.06, 0.32, cd, '#3a2a40', 4); crenel(c, X(0.36), Y(0.3), s * 0.28, 4, s * 0.035, '#a89a78');
      c.fillStyle = '#1a0f08'; c.beginPath(); c.moveTo(X(0.42), Y(0.96)); c.lineTo(X(0.42), Y(0.68)); c.arc(X(0.5), Y(0.68), s * 0.08, Math.PI, 0); c.lineTo(X(0.58), Y(0.96)); c.closePath(); c.fill(); c.strokeStyle = '#8a6a3a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(X(0.5), Y(0.6)); c.lineTo(X(0.5), Y(0.96)); c.stroke(); for (let i = 0; i < 3; i++) { circ(c, X(0.45), Y(0.74 + i * 0.07), 1.3, '#c8a040'); circ(c, X(0.55), Y(0.74 + i * 0.07), 1.3, '#c8a040'); }
      circ(c, X(0.5), Y(0.46), s * 0.085, col); c.strokeStyle = '#e8c24a'; c.lineWidth = 1.6; c.beginPath(); c.arc(X(0.5), Y(0.46), s * 0.085, 0, 6.283); c.stroke(); swords(c, X(0.5), Y(0.46), s * 0.045);
      archWin(c, X(0.41), Y(0.34), s * 0.045, s * 0.07, true, '#5a4a2a'); archWin(c, X(0.545), Y(0.34), s * 0.045, s * 0.07, true, '#5a4a2a');
      for (const wxx of [0.12, 0.22, 0.72, 0.82]) archWin(c, X(wxx), Y(0.6), s * 0.07, s * 0.14, (wxx * 10 | 0) % 2 === 0, '#5a4a2a');
      torch(c, V, X, Y, s, 0.33, 0.66, t, b.id); torch(c, V, X, Y, s, 0.67, 0.66, t, b.id + 3);
      pole(c, X(0.5), Y(0.0), s * 0.12, 1.4); flag(c, X(0.5), Y(0.0) - s * 0.12, s * 0.34, cl, t, b.id, 1);
      c.strokeStyle = '#5a4020'; c.lineWidth = 2; c.beginPath(); c.moveTo(X(0.12), Y(0.97)); c.lineTo(X(0.12), Y(0.82)); c.moveTo(X(0.07), Y(0.87)); c.lineTo(X(0.17), Y(0.87)); c.stroke(); circ(c, X(0.12), Y(0.8), s * 0.03, '#d8c89a'); circ(c, X(0.12), Y(0.9), s * 0.04, col);
      c.fillStyle = '#5a4020'; c.fillRect(X(0.87), Y(0.88), 2, s * 0.09); c.fillRect(X(0.94), Y(0.88), 2, s * 0.09); circ(c, X(0.905), Y(0.84), s * 0.07, '#f2ead2'); circ(c, X(0.905), Y(0.84), s * 0.05, '#c8302b'); circ(c, X(0.905), Y(0.84), s * 0.025, '#f2ead2'); circ(c, X(0.905), Y(0.84), s * 0.01, '#c8302b');
    } else if (age === 1) { // taş kışla: iki yuvarlak kule, mazgallı perde duvar
      c.fillStyle = grad(c, 0, Y(0.42), 0, Y(0.96), '#c4b78f', '#8c7e5a'); c.fillRect(X(0.1), Y(0.42), s * 0.8, s * 0.54); courses(c, X(0.1), Y(0.42), s * 0.8, s * 0.54, s * 0.11, s * 0.065, 'rgba(60,46,24,.38)', 'rgba(255,255,255,.05)'); crenel(c, X(0.1), Y(0.42), s * 0.8, 8, s * 0.05, '#b0a278');
      c.fillStyle = col; c.fillRect(X(0.1), Y(0.5), s * 0.8, s * 0.03);
      for (const cx of [0.12, 0.88]) { const w = s * 0.2; cylinder(c, X(cx) - w / 2, Y(0.2), w, s * 0.76, '#b6a982', '#e4d6ae', '#7e704c'); courses(c, X(cx) - w / 2, Y(0.2), w, s * 0.76, s * 0.07, s * 0.06, 'rgba(60,46,24,.38)'); crenel(c, X(cx) - w / 2 - 1, Y(0.2), w + 2, 4, s * 0.04, '#a89a74'); cone(c, X(cx), Y(0.2) - s * 0.04, w * 1.3, s * 0.2, col, cd); archWin(c, X(cx) - s * 0.025, Y(0.4), s * 0.05, s * 0.11, true, '#5a4a2a'); }
      c.fillStyle = grad(c, X(0.3), 0, X(0.7), 0, '#d8ccaa', '#9a8e6c'); c.fillRect(X(0.3), Y(0.26), s * 0.4, s * 0.7); courses(c, X(0.3), Y(0.26), s * 0.4, s * 0.7, s * 0.1, s * 0.065, 'rgba(60,46,24,.35)'); crenel(c, X(0.3), Y(0.26), s * 0.4, 5, s * 0.045, '#b4a67c');
      c.fillStyle = col; c.beginPath(); c.moveTo(X(0.34), Y(0.16)); c.lineTo(X(0.66), Y(0.16)); c.lineTo(X(0.66), Y(0.26)); c.lineTo(X(0.5), Y(0.32)); c.lineTo(X(0.34), Y(0.26)); c.closePath(); c.fill(); c.strokeStyle = 'rgba(0,0,0,.4)'; c.stroke(); swords(c, X(0.5), Y(0.225), s * 0.04);
      c.fillStyle = '#14100a'; c.beginPath(); c.moveTo(X(0.41), Y(0.96)); c.lineTo(X(0.41), Y(0.68)); c.arc(X(0.5), Y(0.68), s * 0.09, Math.PI, 0); c.lineTo(X(0.59), Y(0.96)); c.closePath(); c.fill(); c.strokeStyle = '#7a6a48'; c.lineWidth = 1.2; for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(X(0.41 + i * 0.036), Y(0.6)); c.lineTo(X(0.41 + i * 0.036), Y(0.96)); c.stroke(); } for (let j = 0; j < 4; j++) { c.beginPath(); c.moveTo(X(0.41), Y(0.7 + j * 0.065)); c.lineTo(X(0.59), Y(0.7 + j * 0.065)); c.stroke(); }
      for (const wxx of [0.34, 0.6]) archWin(c, X(wxx), Y(0.42), s * 0.06, s * 0.12, true, '#5a4a2a');
      torch(c, V, X, Y, s, 0.37, 0.66, t, b.id); torch(c, V, X, Y, s, 0.63, 0.66, t, b.id + 2);
      pole(c, X(0.5), Y(0.16), s * 0.12, 1.4); flag(c, X(0.5), Y(0.16) - s * 0.12, s * 0.32, cl, t, b.id, 1);
      c.fillStyle = '#2a2d32'; c.save(); c.translate(X(0.84), Y(0.93)); c.rotate(-0.15); c.fillRect(0, -s * 0.028, s * 0.15, s * 0.056); c.restore(); circ(c, X(0.82), Y(0.94), s * 0.045, '#4a3420'); circ(c, X(0.82), Y(0.94), s * 0.018, '#7a6a48');
      for (let i = 0; i < 2; i++) { c.fillStyle = '#6a4a28'; rrect(c, X(0.04 + i * 0.05), Y(0.86), s * 0.05, s * 0.08, 2); c.fill(); }
    } else if (age === 2) { // tuğla kışla: alınlıklı giriş, sütunlar, bacalı
      c.fillStyle = grad(c, 0, Y(0.34), 0, Y(0.95), '#ac583a', '#7a3a28'); c.fillRect(X(0.03), Y(0.34), s * 0.94, s * 0.6); courses(c, X(0.03), Y(0.34), s * 0.94, s * 0.6, s * 0.08, s * 0.045, 'rgba(40,16,10,.4)', 'rgba(255,210,180,.07)');
      c.fillStyle = '#d8d0c0'; c.fillRect(X(0.01), Y(0.31), s * 0.98, s * 0.04); c.fillRect(X(0.01), Y(0.89), s * 0.98, s * 0.06); c.fillRect(X(0.01), Y(0.6), s * 0.98, s * 0.02);
      P(c, [[X(0.0), Y(0.34)], [X(0.1), Y(0.14)], [X(0.9), Y(0.14)], [X(1.0), Y(0.34)]], '#3a4050', 'rgba(0,0,0,.4)'); c.fillStyle = col; c.fillRect(X(0.1), Y(0.135), s * 0.8, s * 0.02);
      for (let i = 0; i < 3; i++) for (const yy of [0.4, 0.68]) { rectWin(c, X(0.07 + i * 0.1), Y(yy), s * 0.07, s * 0.15, (i + (yy > 0.5 ? 1 : 0) + Math.floor(t * 0.2)) % 3 !== 0, '#d8d0c0'); rectWin(c, X(0.63 + i * 0.1), Y(yy), s * 0.07, s * 0.15, (i + (yy > 0.5 ? 0 : 1) + Math.floor(t * 0.2)) % 3 !== 1, '#d8d0c0'); }
      c.fillStyle = grad(c, 0, Y(0.2), 0, Y(0.94), '#ece6d6', '#c4bca8'); c.fillRect(X(0.34), Y(0.34), s * 0.32, s * 0.6); P(c, [[X(0.31), Y(0.34)], [X(0.5), Y(0.17)], [X(0.69), Y(0.34)]], '#f2ecdc', 'rgba(0,0,0,.35)'); circ(c, X(0.5), Y(0.28), s * 0.055, col); swords(c, X(0.5), Y(0.28), s * 0.03);
      for (let i = 0; i < 4; i++) { c.fillStyle = grad(c, X(0.36 + i * 0.075), 0, X(0.36 + i * 0.075 + 0.04), 0, '#fbf6e8', '#b4a880'); c.fillRect(X(0.36 + i * 0.075), Y(0.4), s * 0.04, s * 0.5); }
      c.fillStyle = '#2a1a10'; c.beginPath(); c.moveTo(X(0.44), Y(0.94)); c.lineTo(X(0.44), Y(0.74)); c.arc(X(0.5), Y(0.74), s * 0.06, Math.PI, 0); c.lineTo(X(0.56), Y(0.94)); c.closePath(); c.fill(); glow(c, X(0.5), Y(0.8), s * 0.12, 'rgba(255,200,110,.4)');
      c.fillStyle = '#7a3a28'; c.fillRect(X(0.8), Y(0.02), s * 0.08, s * 0.18); c.fillStyle = '#2a2018'; c.fillRect(X(0.79), Y(0.01), s * 0.1, s * 0.02); smokeW(V, b, s, 0.84, 0.01, 0.12, 0.16);
      pole(c, X(0.5), Y(0.17), s * 0.12, 1.4); flag(c, X(0.5), Y(0.17) - s * 0.12, s * 0.3, cl, t, b.id, 1);
      for (let r = 0; r < 2; r++) for (let q = 0; q < 3; q++) { c.fillStyle = (q + r) % 2 ? '#b8a878' : '#a89868'; rrect(c, X(0.04 + q * 0.075 + (r % 2) * 0.03), Y(0.9 + r * 0.045), s * 0.08, s * 0.045, 2); c.fill(); } c.fillStyle = '#2a2d32'; c.fillRect(X(0.1), Y(0.9), s * 0.12, s * 0.025);
    } else { // modern kışla: cam lobi, kamuflaj ağı, radar
      c.fillStyle = grad(c, 0, Y(0.4), 0, Y(0.95), '#d6dade', '#9aa0a8'); c.fillRect(X(0.03), Y(0.44), s * 0.94, s * 0.51); c.fillStyle = '#6a707a'; c.fillRect(X(0.01), Y(0.4), s * 0.98, s * 0.06); c.fillStyle = col; c.fillRect(X(0.01), Y(0.455), s * 0.98, s * 0.02);
      for (const wy0 of [0.52, 0.7]) for (const [x0, x1] of [[0.06, 0.34], [0.66, 0.94]]) { c.fillStyle = grad(c, 0, Y(wy0), 0, Y(wy0 + 0.12), '#8cc0ec', '#2a4c72'); c.fillRect(X(x0), Y(wy0), s * (x1 - x0), s * 0.12); c.strokeStyle = 'rgba(225,240,255,.35)'; c.lineWidth = 1; for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(X(x0 + i * (x1 - x0) / 5), Y(wy0)); c.lineTo(X(x0 + i * (x1 - x0) / 5), Y(wy0 + 0.12)); c.stroke(); } if (Math.floor(wy0 * 10 + t * 0.2) % 3 === 0) { c.fillStyle = 'rgba(255,225,140,.4)'; c.fillRect(X(x0), Y(wy0), s * (x1 - x0), s * 0.12); } }
      c.fillStyle = grad(c, X(0.34), 0, X(0.66), 0, '#a4cdee', '#35557a'); c.fillRect(X(0.34), Y(0.3), s * 0.32, s * 0.65); c.strokeStyle = 'rgba(225,240,255,.4)'; c.lineWidth = 1; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(X(0.34 + i * 0.0533), Y(0.3)); c.lineTo(X(0.34 + i * 0.0533), Y(0.95)); c.stroke(); } for (let j = 1; j < 6; j++) { c.beginPath(); c.moveTo(X(0.34), Y(0.3 + j * 0.108)); c.lineTo(X(0.66), Y(0.3 + j * 0.108)); c.stroke(); } c.strokeStyle = '#2a3a4e'; c.lineWidth = 1.6; c.strokeRect(X(0.34), Y(0.3), s * 0.32, s * 0.65); c.fillStyle = 'rgba(255,255,255,.18)'; P(c, [[X(0.34), Y(0.3)], [X(0.5), Y(0.3)], [X(0.34), Y(0.6)]]); c.fill();
      c.fillStyle = '#c8ced6'; c.fillRect(X(0.38), Y(0.74), s * 0.24, s * 0.03); c.fillStyle = '#0c1018'; c.fillRect(X(0.45), Y(0.77), s * 0.1, s * 0.18);
      circ(c, X(0.5), Y(0.2), s * 0.09, '#12182a'); c.strokeStyle = '#e8c24a'; c.lineWidth = 1.6; c.beginPath(); c.arc(X(0.5), Y(0.2), s * 0.09, 0, 6.283); c.stroke(); swords(c, X(0.5), Y(0.2), s * 0.04);
      c.fillStyle = '#9aa0a8'; c.fillRect(X(0.14), Y(0.12), 1.6, s * 0.3); circ(c, X(0.14) + 0.8, Y(0.12), s * 0.02, Math.sin(t * 4 + b.id) > 0 ? '#ff4030' : '#601812'); c.save(); c.translate(X(0.82), Y(0.34)); c.rotate(t * 1.2 + b.id); c.fillStyle = '#d4d8de'; c.beginPath(); c.ellipse(0, 0, s * 0.1, s * 0.03, 0, 0, 6.283); c.fill(); c.restore(); c.fillStyle = '#6a7078'; c.fillRect(X(0.82) - 1, Y(0.34), 2, s * 0.08);
      c.fillStyle = 'rgba(70,90,54,.85)'; P(c, [[X(0.02), Y(0.56)], [X(0.2), Y(0.5)], [X(0.3), Y(0.6)], [X(0.14), Y(0.72)], [X(0.02), Y(0.7)]]); c.fill(); circ(c, X(0.12), Y(0.6), s * 0.025, 'rgba(40,56,30,.6)'); circ(c, X(0.2), Y(0.64), s * 0.02, 'rgba(40,56,30,.6)');
      for (let i = 0; i < 4; i++) P(c, [[X(0.06 + i * 0.1), Y(0.97)], [X(0.075 + i * 0.1), Y(0.9)], [X(0.115 + i * 0.1), Y(0.9)], [X(0.13 + i * 0.1), Y(0.97)]], '#a4a8ae', 'rgba(0,0,0,.3)');
      glow(c, X(0.94), Y(0.43), s * 0.08, 'rgba(255,245,200,.6)'); pole(c, X(0.7), Y(0.4), s * 0.16, 1.4); flag(c, X(0.7), Y(0.4) - s * 0.16, s * 0.28, cl, t, b.id, 1);
    }
  }

  K.registerBld('barracks', barracks2);
  K.registerBld('stable', stable); K.registerBld('foundry', foundry); K.registerBld('academy', academy); K.registerBld('tower', tower);
  K.registerBld('fortress', fortress); K.registerBld('airfield', airfield); K.registerBld('sam', sam); K.registerBld('radar', radar); K.registerBld('farm', farm);
})(typeof window !== 'undefined' ? window : globalThis);
