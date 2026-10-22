/* Son İmparatorluk - çağa göre bina çizimleri (Şehir Merkezi, Ev, Kışla): her çağda ayrı mimari */
(function (root) {
  'use strict';
  const K = root.RenderKit; if (!K) return;
  const { grad, rrect, circ, ell, flag, smokeAt, rnd } = K;

  /* ---------- ortak çizim yardımcıları ---------- */
  // taş / tuğla dokusu: satırlar halinde, her satır kaydırılmış
  function courses(c, x, y, w, h, bw, bh, line, alt) {
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    c.strokeStyle = line; c.lineWidth = Math.max(0.6, bh * 0.07);
    for (let j = 0, yy = y; yy < y + h; j++, yy += bh) {
      c.beginPath(); c.moveTo(x, yy); c.lineTo(x + w, yy); c.stroke();
      c.beginPath(); for (let xx = x + (j % 2 ? bw / 2 : 0); xx < x + w; xx += bw) { c.moveTo(xx, yy); c.lineTo(xx, yy + bh); } c.stroke();
    }
    if (alt) { c.fillStyle = alt; for (let j = 0, yy = y; yy < y + h; j++, yy += bh) for (let xx = x + (j % 2 ? bw / 2 : 0); xx < x + w; xx += bw) if (((xx * 7 + yy * 13) | 0) % 5 === 0) c.fillRect(xx + 0.5, yy + 0.5, bw - 1, bh - 1); }
    c.restore();
  }
  function crenel(c, x, y, w, n, h, fill) { const bw = w / (n * 2 - 1); c.fillStyle = fill; for (let i = 0; i < n; i++) c.fillRect(x + i * 2 * bw, y - h, bw, h + 1); }
  function archWin(c, x, y, w, h, lit, frame) {
    c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, y + h); c.closePath();
    c.fillStyle = lit ? grad(c, x, y, x, y + h, '#ffe08a', '#e0903a') : grad(c, x, y, x, y + h, '#2a3140', '#12161e'); c.fill();
    if (frame) { c.strokeStyle = frame; c.lineWidth = Math.max(1, w * 0.14); c.stroke(); }
    if (lit) { c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, w * 1.6); g.addColorStop(0, 'rgba(255,190,90,.35)'); g.addColorStop(1, 'rgba(255,150,40,0)'); c.fillStyle = g; c.fillRect(x - w, y - w, w * 3, h + w * 2); c.globalCompositeOperation = 'source-over'; }
  }
  function rectWin(c, x, y, w, h, lit, frame) {
    c.fillStyle = lit ? grad(c, x, y, x, y + h, '#ffe08a', '#e0903a') : grad(c, x, y, x, y + h, '#35506e', '#16202e'); c.fillRect(x, y, w, h);
    c.strokeStyle = frame || '#2a2218'; c.lineWidth = Math.max(0.8, w * 0.12); c.strokeRect(x, y, w, h);
    c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.moveTo(x, y + h / 2); c.lineTo(x + w, y + h / 2); c.stroke();
    if (lit) { c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, w * 1.5); g.addColorStop(0, 'rgba(255,190,90,.3)'); g.addColorStop(1, 'rgba(255,150,40,0)'); c.fillStyle = g; c.fillRect(x - w, y - w, w * 3, h + w * 2); c.globalCompositeOperation = 'source-over'; }
  }
  function glow(c, x, y, r, col) { c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,120,30,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); c.globalCompositeOperation = 'source-over'; }
  function cylinder(c, x, y, w, h, a, b, d) { const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, a); g.addColorStop(0.45, b); g.addColorStop(1, d); c.fillStyle = g; c.fillRect(x, y, w, h); }
  function cone(c, cx, base, w, h, col, dark) { const g = c.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0); g.addColorStop(0, col); g.addColorStop(1, dark); c.fillStyle = g; c.beginPath(); c.moveTo(cx - w / 2, base); c.lineTo(cx, base - h); c.lineTo(cx + w / 2, base); c.closePath(); c.fill(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; c.stroke(); }
  function pole(c, x, y, h, w) { c.fillStyle = '#4a3a26'; c.fillRect(x - w / 2, y - h, w, h); circ(c, x, y - h, w * 1.3, '#e8c24a'); }
  const wx = (px, s) => x => px + s * x, wy = (py, s) => y => py + s * y;
  K.helpers = { courses, crenel, archWin, rectWin, glow, cylinder, cone, pole, wx, wy };

  /* ================= ŞEHİR MERKEZİ ================= */
  function tc0(c, V, b, px, py, s, col, cd, cl, t) { // Kale: taş kale, yuvarlak kuleler, sancaklı kapı
    const X = wx(px, s), Y = wy(py, s), stone = grad(c, X(0), Y(0.3), X(1), Y(0.9), '#d6c59b', '#a38f64'), line = 'rgba(70,55,30,.35)';
    // avlu duvarı
    c.fillStyle = stone; c.fillRect(X(0.05), Y(0.44), s * 0.9, s * 0.5); courses(c, X(0.05), Y(0.44), s * 0.9, s * 0.5, s * 0.12, s * 0.07, line, 'rgba(255,255,255,.05)');
    crenel(c, X(0.05), Y(0.44), s * 0.9, 9, s * 0.05, '#b9a679');
    c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(X(0.05), Y(0.82), s * 0.9, s * 0.12);
    // yuvarlak köşe kuleleri
    for (const [cx, hh] of [[0.13, 0.78], [0.87, 0.78]]) {
      const w = s * 0.2, x0 = X(cx) - w / 2; cylinder(c, x0, Y(0.94 - hh), w, s * hh, '#c0ae82', '#e4d4aa', '#8c7a52');
      courses(c, x0, Y(0.94 - hh), w, s * hh, s * 0.07, s * 0.06, line);
      crenel(c, x0 - s * 0.01, Y(0.94 - hh), w + s * 0.02, 4, s * 0.045, '#bba97c');
      cone(c, X(cx), Y(0.94 - hh) - s * 0.045, w * 1.3, s * 0.2, col, cd);
      c.fillStyle = '#1a1510'; c.fillRect(X(cx) - 1.4, Y(0.94 - hh + 0.12), 2.8, s * 0.07);
      pole(c, X(cx), Y(0.94 - hh) - s * 0.245, s * 0.1, 1.4);
    }
    // ana donjon
    const kx = X(0.3), kw = s * 0.4; c.fillStyle = grad(c, kx, 0, kx + kw, 0, '#ddcda3', '#a89468'); c.fillRect(kx, Y(0.16), kw, s * 0.78);
    courses(c, kx, Y(0.16), kw, s * 0.78, s * 0.1, s * 0.065, line, 'rgba(255,255,255,.06)');
    crenel(c, kx - s * 0.015, Y(0.16), kw + s * 0.03, 6, s * 0.05, '#bba97c');
    c.fillStyle = 'rgba(0,0,0,.16)'; c.fillRect(kx + kw * 0.78, Y(0.16), kw * 0.22, s * 0.78);
    archWin(c, X(0.36), Y(0.27), s * 0.075, s * 0.13, true, '#6b5a38'); archWin(c, X(0.565), Y(0.27), s * 0.075, s * 0.13, true, '#6b5a38');
    // ana kapı + kafes
    c.fillStyle = '#1a120a'; c.beginPath(); c.moveTo(X(0.43), Y(0.94)); c.lineTo(X(0.43), Y(0.7)); c.arc(X(0.5), Y(0.7), s * 0.07, Math.PI, 0); c.lineTo(X(0.57), Y(0.94)); c.closePath(); c.fill();
    c.strokeStyle = '#6a5a3a'; c.lineWidth = 1.2; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(X(0.43 + i * 0.035), Y(0.64)); c.lineTo(X(0.43 + i * 0.035), Y(0.94)); c.stroke(); } for (let j = 0; j < 4; j++) { c.beginPath(); c.moveTo(X(0.43), Y(0.72 + j * 0.055)); c.lineTo(X(0.57), Y(0.72 + j * 0.055)); c.stroke(); }
    c.strokeStyle = '#c8b27a'; c.lineWidth = 2.2; c.beginPath(); c.arc(X(0.5), Y(0.7), s * 0.075, Math.PI, 0); c.stroke();
    // meşaleler
    for (const tx of [0.385, 0.615]) { c.fillStyle = '#3a2a18'; c.fillRect(X(tx) - 1, Y(0.62), 2, s * 0.08); glow(c, X(tx), Y(0.6), s * (0.08 + 0.012 * Math.sin(t * 11 + tx * 9)), 'rgba(255,200,100,.95)'); }
    // takım sancakları (donjon duvarında asılı)
    c.fillStyle = col; c.beginPath(); c.moveTo(X(0.46), Y(0.34)); c.lineTo(X(0.54), Y(0.34)); c.lineTo(X(0.54), Y(0.5)); c.lineTo(X(0.5), Y(0.46)); c.lineTo(X(0.46), Y(0.5)); c.closePath(); c.fill(); c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 1; c.stroke();
    pole(c, X(0.5), Y(0.16) - s * 0.05, s * 0.2, 1.6); flag(c, X(0.5), Y(0.16) - s * 0.25, s * 0.42, cl, t, b.id, 1);
  }

  function tc1(c, V, b, px, py, s, col, cd, cl, t) { // Barut: top siperli bastion kale
    const X = wx(px, s), Y = wy(py, s), line = 'rgba(40,34,26,.4)';
    // toprak sur / eğim
    c.fillStyle = grad(c, 0, Y(0.62), 0, Y(0.98), '#6e7a3e', '#4a5a2a'); c.beginPath(); c.moveTo(X(0.0), Y(0.9)); c.lineTo(X(0.08), Y(0.62)); c.lineTo(X(0.92), Y(0.62)); c.lineTo(X(1.0), Y(0.9)); c.lineTo(X(0.96), Y(0.99)); c.lineTo(X(0.04), Y(0.99)); c.closePath(); c.fill();
    // taş duvar şeridi
    c.fillStyle = grad(c, X(0), 0, X(1), 0, '#a89c82', '#7e7458'); c.fillRect(X(0.06), Y(0.62), s * 0.88, s * 0.3); courses(c, X(0.06), Y(0.62), s * 0.88, s * 0.3, s * 0.1, s * 0.065, line);
    c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(X(0.06), Y(0.86), s * 0.88, s * 0.06);
    // top mazgalları
    for (let i = 0; i < 6; i++) { const x0 = X(0.14 + i * 0.136); c.fillStyle = '#14100c'; c.fillRect(x0, Y(0.7), s * 0.05, s * 0.075); }
    // köşe bastionları: pahlı taş kuleler, siper ve yana doğru namlu
    for (const sg of [-1, 1]) {
      const a0 = sg < 0 ? 0.0 : 0.74, w0 = 0.26; const x0 = X(a0), ww = s * w0;
      c.fillStyle = grad(c, x0, 0, x0 + ww, 0, sg < 0 ? '#b9ad8f' : '#d0c4a4', sg < 0 ? '#d0c4a4' : '#8a8066');
      c.beginPath(); c.moveTo(x0, Y(0.93)); c.lineTo(x0, Y(0.56)); c.lineTo(x0 + ww * 0.2, Y(0.48)); c.lineTo(x0 + ww * 0.8, Y(0.48)); c.lineTo(x0 + ww, Y(0.56)); c.lineTo(x0 + ww, Y(0.93)); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(30,24,16,.55)'; c.lineWidth = 1.2; c.stroke(); courses(c, x0, Y(0.5), ww, s * 0.43, s * 0.09, s * 0.06, line);
      crenel(c, x0 + ww * 0.2, Y(0.48), ww * 0.6, 3, s * 0.04, '#a89c7e');
      c.fillStyle = '#14100c'; c.fillRect(x0 + ww * 0.42, Y(0.58), ww * 0.16, s * 0.07);
      const cy = Y(0.74), cx = sg < 0 ? x0 : x0 + ww; c.fillStyle = '#14100c'; c.fillRect(cx - s * 0.03, cy - s * 0.035, s * 0.06, s * 0.07);
      c.fillStyle = '#2a2d32'; c.fillRect(sg < 0 ? cx - s * 0.12 : cx, cy - s * 0.022, s * 0.12, s * 0.044); c.fillStyle = '#c8a040'; c.fillRect(sg < 0 ? cx - s * 0.075 : cx + s * 0.05, cy - s * 0.026, s * 0.012, s * 0.052);
      if (rnd() < 0.015) smokeAt(b.tx + (sg < 0 ? -0.12 : 1.12) * (s / V.ts), b.ty + 0.74 * (s / V.ts), 2, 0.2, 0.3);
    }
    // iç kale (donjon) + arduvaz çatı
    const kx = X(0.27), kw = s * 0.46; c.fillStyle = grad(c, kx, 0, kx + kw, 0, '#d8ccae', '#9a8e72'); c.fillRect(kx, Y(0.3), kw, s * 0.4); courses(c, kx, Y(0.3), kw, s * 0.4, s * 0.1, s * 0.065, line);
    c.fillStyle = grad(c, kx, Y(0.1), kx, Y(0.32), '#4a5266', '#2c3242'); c.beginPath(); c.moveTo(kx - s * 0.03, Y(0.32)); c.lineTo(kx + s * 0.06, Y(0.12)); c.lineTo(kx + kw - s * 0.06, Y(0.12)); c.lineTo(kx + kw + s * 0.03, Y(0.32)); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 1; for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(kx - s * 0.03 + i * 0.01 * s, Y(0.32 - i * 0.04)); c.lineTo(kx + kw + s * 0.03 - i * 0.01 * s, Y(0.32 - i * 0.04)); c.stroke(); }
    c.fillStyle = col; c.fillRect(kx + s * 0.06, Y(0.11), kw - s * 0.12, s * 0.025);
    c.fillStyle = '#5a4e3a'; c.fillRect(X(0.64), Y(0.05), s * 0.055, s * 0.15);
    rectWin(c, X(0.36), Y(0.4), s * 0.07, s * 0.1, true, '#5a4a2a'); rectWin(c, X(0.57), Y(0.4), s * 0.07, s * 0.1, true, '#5a4a2a');
    // kapı kemeri
    c.fillStyle = '#16100a'; c.beginPath(); c.moveTo(X(0.44), Y(0.9)); c.lineTo(X(0.44), Y(0.76)); c.arc(X(0.5), Y(0.76), s * 0.06, Math.PI, 0); c.lineTo(X(0.56), Y(0.9)); c.closePath(); c.fill();
    c.fillStyle = col; c.beginPath(); c.moveTo(X(0.47), Y(0.5)); c.lineTo(X(0.53), Y(0.5)); c.lineTo(X(0.53), Y(0.62)); c.lineTo(X(0.5), Y(0.59)); c.lineTo(X(0.47), Y(0.62)); c.closePath(); c.fill();
    pole(c, X(0.5), Y(0.12) - s * 0.03, s * 0.17, 1.6); flag(c, X(0.5), Y(0.09) - s * 0.2, s * 0.4, cl, t, b.id, 1);
    if (b.done && rnd() < 0.05) smokeAt(b.tx + 0.665 * (s / V.ts), b.ty + 0.05 * (s / V.ts), 1, 0.16, 0.5);
  }

  function tc2(c, V, b, px, py, s, col, cd, cl, t) { // Sanayi: tuğla belediye/fabrika binası, saat kulesi, bacalar
    const X = wx(px, s), Y = wy(py, s);
    const brick = grad(c, 0, Y(0.3), 0, Y(0.95), '#b0563a', '#7e3a26'), lineB = 'rgba(40,16,10,.4)';
    // yan kanatlar
    c.fillStyle = brick; c.fillRect(X(0.05), Y(0.42), s * 0.9, s * 0.52); courses(c, X(0.05), Y(0.42), s * 0.9, s * 0.52, s * 0.07, s * 0.04, lineB, 'rgba(255,200,170,.07)');
    // taş silme / korniş
    c.fillStyle = '#d8d0c0'; c.fillRect(X(0.03), Y(0.4), s * 0.94, s * 0.04); c.fillRect(X(0.03), Y(0.9), s * 0.94, s * 0.04); c.fillStyle = '#b8b0a0'; c.fillRect(X(0.03), Y(0.44), s * 0.94, s * 0.012);
    // testere dişi çatı (fabrika)
    for (let i = 0; i < 4; i++) { const x0 = X(0.07 + i * 0.12); c.fillStyle = '#4a4f58'; c.beginPath(); c.moveTo(x0, Y(0.4)); c.lineTo(x0 + s * 0.04, Y(0.28)); c.lineTo(x0 + s * 0.12, Y(0.4)); c.closePath(); c.fill(); c.fillStyle = 'rgba(170,215,255,.55)'; c.beginPath(); c.moveTo(x0 + s * 0.04, Y(0.28)); c.lineTo(x0 + s * 0.065, Y(0.28)); c.lineTo(x0 + s * 0.065, Y(0.4)); c.lineTo(x0 + s * 0.04, Y(0.4)); c.closePath(); c.fill(); }
    for (let i = 0; i < 2; i++) { const x0 = X(0.57 + i * 0.12); c.fillStyle = '#4a4f58'; c.beginPath(); c.moveTo(x0, Y(0.4)); c.lineTo(x0 + s * 0.04, Y(0.28)); c.lineTo(x0 + s * 0.12, Y(0.4)); c.closePath(); c.fill(); }
    // pencereler
    for (let i = 0; i < 3; i++) { archWin(c, X(0.09 + i * 0.105), Y(0.55), s * 0.06, s * 0.2, (i + Math.floor(t * 0.3)) % 4 !== 0, '#d8d0c0'); archWin(c, X(0.67 + i * 0.105), Y(0.55), s * 0.06, s * 0.2, (i + 1 + Math.floor(t * 0.25)) % 4 !== 0, '#d8d0c0'); }
    // saat kulesi
    const kx = X(0.38), kw = s * 0.24; c.fillStyle = grad(c, kx, 0, kx + kw, 0, '#c26a4a', '#8a4430'); c.fillRect(kx, Y(0.14), kw, s * 0.8); courses(c, kx, Y(0.14), kw, s * 0.8, s * 0.06, s * 0.04, lineB);
    c.fillStyle = '#d8d0c0'; c.fillRect(kx - s * 0.015, Y(0.12), kw + s * 0.03, s * 0.03); c.fillRect(kx - s * 0.015, Y(0.34), kw + s * 0.03, s * 0.02);
    cone(c, X(0.5), Y(0.12), kw * 1.25, s * 0.16, col, cd);
    // saat
    const cxk = X(0.5), cyk = Y(0.23), rr = s * 0.075; circ(c, cxk, cyk, rr + 2, '#d8d0c0'); circ(c, cxk, cyk, rr, '#f6f0e0'); c.strokeStyle = '#2a2218'; c.lineWidth = 1.2; c.beginPath(); c.arc(cxk, cyk, rr, 0, 6.283); c.stroke();
    const mn = (V.time * 0.4) % 60 / 60 * 6.283, hr = (V.time * 0.4 / 12) % 60 / 60 * 6.283; c.lineWidth = 1.4; c.beginPath(); c.moveTo(cxk, cyk); c.lineTo(cxk + Math.sin(mn) * rr * 0.8, cyk - Math.cos(mn) * rr * 0.8); c.stroke(); c.beginPath(); c.moveTo(cxk, cyk); c.lineTo(cxk + Math.sin(hr) * rr * 0.5, cyk - Math.cos(hr) * rr * 0.5); c.stroke();
    // kapı
    c.fillStyle = '#2a1a10'; c.beginPath(); c.moveTo(X(0.44), Y(0.94)); c.lineTo(X(0.44), Y(0.74)); c.arc(X(0.5), Y(0.74), s * 0.06, Math.PI, 0); c.lineTo(X(0.56), Y(0.94)); c.closePath(); c.fill(); c.fillStyle = '#c8a040'; c.fillRect(X(0.495), Y(0.74), 1.5, s * 0.2);
    glow(c, X(0.5), Y(0.76), s * 0.1, 'rgba(255,200,110,.55)');
    // bacalar
    for (const bx of [0.12, 0.84]) { c.fillStyle = grad(c, X(bx), 0, X(bx + 0.07), 0, '#8a4a34', '#5a2c1e'); c.fillRect(X(bx), Y(0.02), s * 0.07, s * 0.4); c.fillStyle = '#2a2018'; c.fillRect(X(bx) - 1, Y(0.02), s * 0.07 + 2, s * 0.03); if (b.done && rnd() < 0.18) smokeAt(b.tx + (bx + 0.035) * (s / V.ts), b.ty + 0.02 * (s / V.ts), 1, 0.24, 0.7); }
    // demir korkuluk + gaz lambası
    c.strokeStyle = '#2a2a30'; c.lineWidth = 1; for (let i = 0; i < 18; i++) { c.beginPath(); c.moveTo(X(0.05 + i * 0.05), Y(0.97)); c.lineTo(X(0.05 + i * 0.05), Y(0.91)); c.stroke(); }
    for (const lx of [0.2, 0.8]) { c.fillStyle = '#2a2a30'; c.fillRect(X(lx) - 1, Y(0.78), 2, s * 0.14); glow(c, X(lx), Y(0.77), s * 0.07, 'rgba(255,210,120,.8)'); }
    flag(c, X(0.5), Y(0.12) - s * 0.16, s * 0.34, cl, t, b.id, 1);
  }

  function tc3(c, V, b, px, py, s, col, cd, cl, t) { // Modern: cam kule karargâh, heliport, uydu çanağı
    const X = wx(px, s), Y = wy(py, s);
    c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(X(0.04), Y(0.82), s * 0.92, s * 0.14);
    // yan kanatlar (beton)
    for (const [x0, w] of [[0.05, 0.22], [0.73, 0.22]]) { c.fillStyle = grad(c, X(x0), Y(0.4), X(x0 + w), Y(0.9), '#d4d8de', '#9aa0aa'); c.fillRect(X(x0), Y(0.44), s * w, s * 0.46); c.fillStyle = grad(c, 0, Y(0.5), 0, Y(0.8), '#5a86b0', '#243a56'); c.fillRect(X(x0) + 3, Y(0.52), s * w - 6, s * 0.26); c.strokeStyle = 'rgba(210,235,255,.4)'; c.lineWidth = 1; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(X(x0) + 3 + i * (s * w - 6) / 4, Y(0.52)); c.lineTo(X(x0) + 3 + i * (s * w - 6) / 4, Y(0.78)); c.stroke(); } }
    // heliport (sağ kanat çatısı)
    c.fillStyle = '#4a4f58'; c.beginPath(); c.ellipse(X(0.84), Y(0.43), s * 0.1, s * 0.045, 0, 0, 6.283); c.fill(); c.strokeStyle = '#f2d24a'; c.lineWidth = 1.4; c.stroke(); c.fillStyle = '#f2d24a'; c.font = Math.round(s * 0.08) + 'px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('H', X(0.84), Y(0.435));
    // ana kule: kademeli cam
    for (const [x0, w, y0] of [[0.27, 0.46, 0.2], [0.33, 0.34, 0.05]]) {
      c.fillStyle = grad(c, X(x0), Y(y0), X(x0 + w), Y(0.9), '#7fb2e0', '#1d3552'); c.fillRect(X(x0), Y(y0), s * w, s * (0.9 - y0));
      c.fillStyle = 'rgba(255,255,255,.16)'; c.beginPath(); c.moveTo(X(x0), Y(y0)); c.lineTo(X(x0 + w * 0.45), Y(y0)); c.lineTo(X(x0), Y(0.9 - (0.9 - y0) * 0.3)); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(220,240,255,.28)'; c.lineWidth = 1; const nx = Math.round(w / 0.07), ny = Math.round((0.9 - y0) / 0.07);
      for (let i = 1; i < nx; i++) { c.beginPath(); c.moveTo(X(x0 + i * w / nx), Y(y0)); c.lineTo(X(x0 + i * w / nx), Y(0.9)); c.stroke(); } for (let j = 1; j < ny; j++) { c.beginPath(); c.moveTo(X(x0), Y(y0 + j * (0.9 - y0) / ny)); c.lineTo(X(x0 + w), Y(y0 + j * (0.9 - y0) / ny)); c.stroke(); }
      c.strokeStyle = '#2a3a4e'; c.lineWidth = 1.6; c.strokeRect(X(x0), Y(y0), s * w, s * (0.9 - y0));
    }
    // yanan ofis pencereleri
    c.fillStyle = 'rgba(255,225,140,.7)'; for (let i = 0; i < 14; i++) { const wi = (i * 37 + Math.floor(t * 0.2)) % 7; if (wi < 3) c.fillRect(X(0.34 + (i % 4) * 0.08), Y(0.1 + Math.floor(i / 4) * 0.14), s * 0.05, s * 0.07); }
    // takım rengi şeridi
    c.fillStyle = col; c.fillRect(X(0.27), Y(0.2), s * 0.46, s * 0.035); c.fillRect(X(0.5) - s * 0.012, Y(0.05), s * 0.024, s * 0.15);
    // giriş saçağı
    c.fillStyle = '#c8ced6'; c.fillRect(X(0.38), Y(0.76), s * 0.24, s * 0.03); c.fillStyle = '#0c1018'; c.fillRect(X(0.43), Y(0.79), s * 0.14, s * 0.11); c.fillStyle = 'rgba(160,210,255,.5)'; c.fillRect(X(0.44), Y(0.8), s * 0.055, s * 0.1); c.fillRect(X(0.505), Y(0.8), s * 0.055, s * 0.1);
    // anten + uydu çanağı + uyarı ışığı
    c.fillStyle = '#9aa0a8'; c.fillRect(X(0.5) - 1, Y(-0.12), 2, s * 0.17); circ(c, X(0.5), Y(-0.12), s * 0.025, Math.sin(t * 4 + b.id) > 0 ? '#ff3a30' : '#601812');
    c.save(); c.translate(X(0.62), Y(0.05)); c.rotate(-0.5); c.fillStyle = grad(c, -s * 0.07, 0, s * 0.07, 0, '#f4f6fa', '#a4acb8'); c.beginPath(); c.ellipse(0, 0, s * 0.075, s * 0.038, 0, 0, 6.283); c.fill(); c.strokeStyle = '#5a6068'; c.lineWidth = 1; c.stroke(); c.restore();
    flag(c, X(0.5) + s * 0.012, Y(0.05) + s * 0.0, s * 0.22, cl, t, b.id, 1);
  }

  /* ================= EV ================= */
  function house(c, V, b, px, py, s, col, cd, cl, t, age) {
    const X = wx(px, s), Y = wy(py, s);
    if (age === 0) { // ahşap iskeletli kulübe, hasır/kiremit çatı
      c.fillStyle = grad(c, 0, Y(0.4), 0, Y(0.94), '#e2d4ac', '#bfae80'); c.fillRect(X(0.1), Y(0.42), s * 0.8, s * 0.52);
      c.strokeStyle = '#5a3d22'; c.lineWidth = Math.max(1.4, s * 0.035); c.strokeRect(X(0.1), Y(0.42), s * 0.8, s * 0.52); c.beginPath(); c.moveTo(X(0.1), Y(0.42)); c.lineTo(X(0.34), Y(0.94)); c.moveTo(X(0.34), Y(0.42)); c.lineTo(X(0.1), Y(0.94)); c.moveTo(X(0.66), Y(0.42)); c.lineTo(X(0.9), Y(0.94)); c.moveTo(X(0.9), Y(0.42)); c.lineTo(X(0.66), Y(0.94)); c.stroke();
      c.fillStyle = grad(c, 0, Y(0.04), 0, Y(0.46), col, cd); c.beginPath(); c.moveTo(X(0.0), Y(0.48)); c.lineTo(X(0.5), Y(0.05)); c.lineTo(X(1.0), Y(0.48)); c.closePath(); c.fill(); c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 1; for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(X(0.5 - 0.5 * i / 5), Y(0.05 + 0.43 * i / 5)); c.lineTo(X(0.5 + 0.5 * i / 5), Y(0.05 + 0.43 * i / 5)); c.stroke(); }
      c.fillStyle = '#5a3d22'; rrect(c, X(0.42), Y(0.62), s * 0.16, s * 0.32, 2); c.fill(); rectWin(c, X(0.15), Y(0.55), s * 0.14, s * 0.13, true, '#5a3d22'); rectWin(c, X(0.71), Y(0.55), s * 0.14, s * 0.13, true, '#5a3d22');
      c.fillStyle = '#7a6a55'; c.fillRect(X(0.72), Y(0.1), s * 0.1, s * 0.24); if (b.done && rnd() < 0.03) smokeAt(b.tx + 0.77 * (s / V.ts), b.ty + 0.08 * (s / V.ts), 1, 0.12, 0.5);
    } else if (age === 1) { // taş ev, kiremit çatı
      c.fillStyle = grad(c, 0, Y(0.4), 0, Y(0.94), '#cbbd98', '#9a8a64'); c.fillRect(X(0.08), Y(0.4), s * 0.84, s * 0.54); courses(c, X(0.08), Y(0.4), s * 0.84, s * 0.54, s * 0.12, s * 0.07, 'rgba(60,46,24,.35)');
      c.fillStyle = grad(c, 0, Y(0.04), 0, Y(0.44), '#b85a38', '#7a3a24'); c.beginPath(); c.moveTo(X(-0.02), Y(0.46)); c.lineTo(X(0.5), Y(0.04)); c.lineTo(X(1.02), Y(0.46)); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(40,16,8,.4)'; c.lineWidth = 1; for (let i = 1; i < 7; i++) { c.beginPath(); c.moveTo(X(0.5 - 0.52 * i / 7), Y(0.04 + 0.42 * i / 7)); c.lineTo(X(0.5 + 0.52 * i / 7), Y(0.04 + 0.42 * i / 7)); c.stroke(); } c.fillStyle = col; c.fillRect(X(0.46), Y(0.04), s * 0.08, s * 0.05);
      archWin(c, X(0.42), Y(0.6), s * 0.16, s * 0.34, false, '#5a4a30'); c.fillStyle = '#3a2814'; c.fillRect(X(0.46), Y(0.7), s * 0.08, s * 0.24); archWin(c, X(0.16), Y(0.52), s * 0.14, s * 0.2, true, '#5a4a30'); archWin(c, X(0.7), Y(0.52), s * 0.14, s * 0.2, true, '#5a4a30');
      c.fillStyle = '#6a604c'; c.fillRect(X(0.74), Y(0.08), s * 0.1, s * 0.24); c.fillStyle = '#3a342a'; c.fillRect(X(0.73), Y(0.07), s * 0.12, s * 0.03); if (b.done && rnd() < 0.04) smokeAt(b.tx + 0.79 * (s / V.ts), b.ty + 0.07 * (s / V.ts), 1, 0.13, 0.5);
    } else if (age === 2) { // tuğla, iki katlı, arduvaz çatı
      c.fillStyle = grad(c, 0, Y(0.3), 0, Y(0.95), '#b05a3c', '#7c3a26'); c.fillRect(X(0.1), Y(0.3), s * 0.8, s * 0.64); courses(c, X(0.1), Y(0.3), s * 0.8, s * 0.64, s * 0.1, s * 0.05, 'rgba(40,16,10,.4)', 'rgba(255,210,180,.07)');
      c.fillStyle = grad(c, 0, Y(0.1), 0, Y(0.32), '#4a5060', '#2c3240'); c.beginPath(); c.moveTo(X(0.04), Y(0.32)); c.lineTo(X(0.16), Y(0.12)); c.lineTo(X(0.84), Y(0.12)); c.lineTo(X(0.96), Y(0.32)); c.closePath(); c.fill(); c.fillStyle = col; c.fillRect(X(0.16), Y(0.115), s * 0.68, s * 0.02);
      c.fillStyle = '#d8d0c0'; c.fillRect(X(0.08), Y(0.62), s * 0.84, s * 0.025);
      for (let i = 0; i < 3; i++) { rectWin(c, X(0.17 + i * 0.25), Y(0.38), s * 0.13, s * 0.17, (i + Math.floor(t * 0.2)) % 3 !== 0, '#d8d0c0'); if (i !== 1) rectWin(c, X(0.17 + i * 0.25), Y(0.68), s * 0.13, s * 0.17, true, '#d8d0c0'); }
      c.fillStyle = '#2a1a10'; c.fillRect(X(0.42), Y(0.68), s * 0.16, s * 0.26); c.fillStyle = '#d8d0c0'; c.fillRect(X(0.4), Y(0.94), s * 0.2, s * 0.025);
      c.fillStyle = '#7a3a28'; c.fillRect(X(0.68), Y(0.0), s * 0.1, s * 0.16); c.fillStyle = '#2a2018'; c.fillRect(X(0.67), Y(-0.01), s * 0.12, s * 0.025); if (b.done && rnd() < 0.1) smokeAt(b.tx + 0.73 * (s / V.ts), b.ty - 0.01 * (s / V.ts), 1, 0.15, 0.6);
    } else { // modern apartman: düz çatı, güneş paneli, balkon
      c.fillStyle = grad(c, 0, Y(0.2), 0, Y(0.95), '#e6e9ee', '#aeb4be'); c.fillRect(X(0.1), Y(0.22), s * 0.8, s * 0.72);
      c.fillStyle = '#7b828e'; c.fillRect(X(0.08), Y(0.2), s * 0.84, s * 0.04);
      for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) { const wx0 = X(0.17 + q * 0.24), wy0 = Y(0.3 + r * 0.2); c.fillStyle = grad(c, wx0, wy0, wx0, wy0 + s * 0.13, '#8cc0ec', '#2f5a86'); c.fillRect(wx0, wy0, s * 0.15, s * 0.13); if ((q + r * 2 + Math.floor(t * 0.15)) % 4 === 0) { c.fillStyle = 'rgba(255,225,140,.65)'; c.fillRect(wx0, wy0, s * 0.15, s * 0.13); } c.fillStyle = '#6a717c'; c.fillRect(wx0 - 1, wy0 + s * 0.13, s * 0.17, s * 0.016); }
      c.fillStyle = '#1b2230'; c.fillRect(X(0.44), Y(0.74), s * 0.12, s * 0.2); c.fillStyle = col; c.fillRect(X(0.1), Y(0.17), s * 0.8, s * 0.025);
      // çatı: güneş paneli + anten
      c.save(); c.translate(X(0.3), Y(0.17)); c.fillStyle = '#1c3a66'; c.beginPath(); c.moveTo(-s * 0.12, 0); c.lineTo(s * 0.12, 0); c.lineTo(s * 0.09, -s * 0.07); c.lineTo(-s * 0.09, -s * 0.07); c.closePath(); c.fill(); c.strokeStyle = 'rgba(160,200,255,.5)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -s * 0.07); c.moveTo(-s * 0.1, -s * 0.035); c.lineTo(s * 0.1, -s * 0.035); c.stroke(); c.restore();
      c.fillStyle = '#9aa0a8'; c.fillRect(X(0.72), Y(0.05), 1.6, s * 0.14); circ(c, X(0.72) + 0.8, Y(0.05), s * 0.02, Math.sin(t * 3 + b.id) > 0 ? '#ff4030' : '#601812');
    }
  }

  /* ================= KIŞLA ================= */
  function barracks(c, V, b, px, py, s, col, cd, cl, t, age) {
    const X = wx(px, s), Y = wy(py, s);
    const sword = (x, y, sz) => { c.strokeStyle = '#e4e6ee'; c.lineWidth = Math.max(2, s * 0.03); c.beginPath(); c.moveTo(x - sz, y - sz); c.lineTo(x + sz, y + sz); c.moveTo(x + sz, y - sz); c.lineTo(x - sz, y + sz); c.stroke(); };
    if (age === 0) { // ahşap salon
      c.fillStyle = grad(c, 0, Y(0.3), 0, Y(0.96), '#a58a62', '#6e5a3c'); c.fillRect(X(0.05), Y(0.3), s * 0.9, s * 0.66); c.strokeStyle = 'rgba(40,26,12,.45)'; c.lineWidth = 1; for (let i = 1; i < 14; i++) { c.beginPath(); c.moveTo(X(0.05 + i * 0.064), Y(0.3)); c.lineTo(X(0.05 + i * 0.064), Y(0.96)); c.stroke(); }
      c.fillStyle = grad(c, 0, Y(0.06), 0, Y(0.36), col, cd); c.beginPath(); c.moveTo(X(-0.01), Y(0.36)); c.lineTo(X(0.12), Y(0.08)); c.lineTo(X(0.88), Y(0.08)); c.lineTo(X(1.01), Y(0.36)); c.closePath(); c.fill(); c.strokeStyle = 'rgba(0,0,0,.28)'; for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(X(0.0 + i * 0.01), Y(0.08 + 0.056 * i)); c.lineTo(X(1.0 - i * 0.01), Y(0.08 + 0.056 * i)); c.stroke(); }
      c.fillStyle = '#2a1a0c'; c.fillRect(X(0.4), Y(0.6), s * 0.2, s * 0.36); sword(X(0.2), Y(0.58), s * 0.09); sword(X(0.8), Y(0.58), s * 0.09);
      // mızrak ve kalkan rafı
      for (let i = 0; i < 3; i++) { c.strokeStyle = '#5a4020'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(X(0.08 + i * 0.05), Y(0.97)); c.lineTo(X(0.08 + i * 0.05), Y(0.72)); c.stroke(); c.fillStyle = '#d0d4dc'; c.beginPath(); c.moveTo(X(0.08 + i * 0.05) - 2, Y(0.72)); c.lineTo(X(0.08 + i * 0.05), Y(0.66)); c.lineTo(X(0.08 + i * 0.05) + 2, Y(0.72)); c.fill(); }
      circ(c, X(0.88), Y(0.84), s * 0.07, col); circ(c, X(0.88), Y(0.84), s * 0.03, '#e8e8ee'); c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 1; c.beginPath(); c.arc(X(0.88), Y(0.84), s * 0.07, 0, 6.283); c.stroke();
    } else if (age === 1) { // taş kışla, mazgallı, top
      c.fillStyle = grad(c, X(0), 0, X(1), 0, '#c4b690', '#8e7e58'); c.fillRect(X(0.04), Y(0.26), s * 0.92, s * 0.7); courses(c, X(0.04), Y(0.26), s * 0.92, s * 0.7, s * 0.11, s * 0.065, 'rgba(60,46,24,.35)', 'rgba(255,255,255,.05)');
      crenel(c, X(0.04), Y(0.26), s * 0.92, 9, s * 0.055, '#b0a07a'); c.fillStyle = col; c.fillRect(X(0.04), Y(0.3), s * 0.92, s * 0.035);
      for (let i = 0; i < 3; i++) archWin(c, X(0.12 + i * 0.1), Y(0.42), s * 0.06, s * 0.15, i !== 1, '#5a4a2a');
      c.fillStyle = '#16100a'; c.beginPath(); c.moveTo(X(0.42), Y(0.96)); c.lineTo(X(0.42), Y(0.7)); c.arc(X(0.5), Y(0.7), s * 0.08, Math.PI, 0); c.lineTo(X(0.58), Y(0.96)); c.closePath(); c.fill(); c.strokeStyle = '#6a5a3a'; c.lineWidth = 1.2; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(X(0.42 + i * 0.04), Y(0.62)); c.lineTo(X(0.42 + i * 0.04), Y(0.96)); c.stroke(); }
      sword(X(0.78), Y(0.5), s * 0.07); pole(c, X(0.14), Y(0.26), s * 0.14, 1.4); flag(c, X(0.14), Y(0.26) - s * 0.14, s * 0.3, cl, t, b.id, 1);
      c.fillStyle = '#2a2d32'; c.save(); c.translate(X(0.8), Y(0.9)); c.rotate(-0.2); c.fillRect(0, -s * 0.03, s * 0.16, s * 0.06); c.restore(); circ(c, X(0.78), Y(0.92), s * 0.05, '#3a2a18'); circ(c, X(0.78), Y(0.92), s * 0.02, '#6a5a3a');
      for (let i = 0; i < 2; i++) { c.fillStyle = '#5a3d22'; rrect(c, X(0.88 + i * 0.05), Y(0.85), s * 0.05, s * 0.07, 2); c.fill(); }
    } else if (age === 2) { // tuğla kışla, baca, kum torbaları, makineli tüfek yuvası
      c.fillStyle = grad(c, 0, Y(0.3), 0, Y(0.95), '#aa5638', '#793826'); c.fillRect(X(0.04), Y(0.3), s * 0.92, s * 0.62); courses(c, X(0.04), Y(0.3), s * 0.92, s * 0.62, s * 0.08, s * 0.045, 'rgba(40,16,10,.4)', 'rgba(255,210,180,.07)');
      c.fillStyle = '#3e434c'; c.fillRect(X(0.02), Y(0.26), s * 0.96, s * 0.06); c.fillStyle = col; c.fillRect(X(0.02), Y(0.26), s * 0.96, s * 0.018);
      for (let i = 0; i < 6; i++) rectWin(c, X(0.1 + i * 0.14), Y(0.4), s * 0.09, s * 0.14, (i + Math.floor(t * 0.2)) % 3 !== 0, '#d8d0c0');
      c.fillStyle = '#26303a'; c.fillRect(X(0.4), Y(0.62), s * 0.2, s * 0.3); c.strokeStyle = '#8a929c'; c.lineWidth = 1.2; c.strokeRect(X(0.4), Y(0.62), s * 0.2, s * 0.3); c.beginPath(); c.moveTo(X(0.5), Y(0.62)); c.lineTo(X(0.5), Y(0.92)); c.stroke();
      c.fillStyle = '#6e3a28'; c.fillRect(X(0.8), Y(0.0), s * 0.09, s * 0.3); c.fillStyle = '#2a2018'; c.fillRect(X(0.79), Y(-0.01), s * 0.11, s * 0.025); if (b.done && rnd() < 0.12) smokeAt(b.tx + 0.845 * (s / V.ts), b.ty - 0.01 * (s / V.ts), 1, 0.17, 0.6);
      // kum torbası duvarı + MG
      for (let r = 0; r < 2; r++) for (let q = 0; q < 8; q++) { c.fillStyle = (q + r) % 2 ? '#b8a878' : '#a89868'; rrect(c, X(0.04 + q * 0.07 + (r % 2) * 0.03), Y(0.88 + r * 0.045), s * 0.075, s * 0.05, 2); c.fill(); }
      c.fillStyle = '#2a2d32'; c.fillRect(X(0.13), Y(0.835), s * 0.13, s * 0.03); c.fillRect(X(0.1), Y(0.82), s * 0.04, s * 0.06);
      sword(X(0.2), Y(0.62), s * 0.06); pole(c, X(0.94), Y(0.26), s * 0.12, 1.4); flag(c, X(0.94), Y(0.26) - s * 0.12, s * 0.28, cl, t, b.id, 1);
    } else { // beton sığınak kışla: kamuflaj, radar, projektör
      c.fillStyle = grad(c, 0, Y(0.4), 0, Y(0.96), '#7e8a6a', '#4e5a42'); c.fillRect(X(0.03), Y(0.4), s * 0.94, s * 0.56);
      c.save(); c.beginPath(); c.rect(X(0.03), Y(0.4), s * 0.94, s * 0.56); c.clip(); c.fillStyle = 'rgba(60,70,44,.55)'; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(X(-0.1 + i * 0.26), Y(0.96)); c.lineTo(X(0.06 + i * 0.26), Y(0.4)); c.lineTo(X(0.18 + i * 0.26), Y(0.4)); c.lineTo(X(0.02 + i * 0.26), Y(0.96)); c.closePath(); c.fill(); } c.fillStyle = 'rgba(120,110,80,.4)'; for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(X(0.2 + i * 0.22), Y(0.62 + (i % 2) * 0.12), s * 0.08, s * 0.04, 0.4, 0, 6.283); c.fill(); } c.restore();
      c.fillStyle = '#9aa092'; c.fillRect(X(0.0), Y(0.34), s * 1.0, s * 0.08); c.fillStyle = col; c.fillRect(X(0.0), Y(0.4), s * 1.0, s * 0.02);
      for (let i = 0; i < 5; i++) { c.fillStyle = (i + Math.floor(t * 0.3)) % 3 === 0 ? 'rgba(255,225,140,.85)' : '#1a2230'; c.fillRect(X(0.1 + i * 0.16), Y(0.52), s * 0.1, s * 0.05); }
      c.fillStyle = '#2f353c'; c.fillRect(X(0.38), Y(0.64), s * 0.24, s * 0.32); c.strokeStyle = '#c8ccd2'; c.lineWidth = 1.4; c.strokeRect(X(0.38), Y(0.64), s * 0.24, s * 0.32); c.fillStyle = '#e6c63a'; for (let i = 0; i < 4; i++) c.fillRect(X(0.38 + i * 0.06), Y(0.94), s * 0.03, s * 0.02);
      // betonarme bariyerler
      for (let i = 0; i < 3; i++) { c.fillStyle = '#a4a8ae'; c.beginPath(); c.moveTo(X(0.06 + i * 0.1), Y(0.97)); c.lineTo(X(0.08 + i * 0.1), Y(0.9)); c.lineTo(X(0.12 + i * 0.1), Y(0.9)); c.lineTo(X(0.14 + i * 0.1), Y(0.97)); c.closePath(); c.fill(); }
      // radar çanağı + anten + projektör
      c.save(); c.translate(X(0.78), Y(0.3)); c.rotate(t * 1.2 + b.id); c.fillStyle = '#d4d8de'; c.beginPath(); c.ellipse(0, 0, s * 0.1, s * 0.03, 0, 0, 6.283); c.fill(); c.restore(); c.fillStyle = '#6a7078'; c.fillRect(X(0.78) - 1, Y(0.3), 2, s * 0.06);
      c.fillStyle = '#9aa0a8'; c.fillRect(X(0.18), Y(0.14), 1.6, s * 0.22); circ(c, X(0.18) + 0.8, Y(0.14), s * 0.02, Math.sin(t * 4 + b.id) > 0 ? '#ff4030' : '#601812');
      glow(c, X(0.92), Y(0.37), s * 0.08, 'rgba(255,245,200,.7)'); pole(c, X(0.5), Y(0.34), s * 0.16, 1.4); flag(c, X(0.5), Y(0.34) - s * 0.16, s * 0.3, cl, t, b.id, 1);
    }
  }

  K.registerBld('tc', (c, V, b, px, py, s, col, cd, cl, t, age) => [tc0, tc1, tc2, tc3][Math.min(3, age)](c, V, b, px, py, s, col, cd, cl, t));
  K.registerBld('house', house);
  K.registerBld('barracks', barracks);
})(typeof window !== 'undefined' ? window : globalThis);
