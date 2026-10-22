// Ülke bayrakları: kodla çizilmiş SVG (dış dosya yok). Osmanlı: kırmızı zemin, hilal ve yıldız.
// Bizans: Palaiologos hanedanı sancağı — altın zemin, siyah çift başlı kartal.
(function (root) {
  const star = (cx, cy, R, r) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(2) + ' ' + (cy + Math.sin(a) * rr).toFixed(2); } return d + 'Z'; };
  const SVG = {
    osmanli: '<svg xmlns="http://www.w3.org/2000/svg" width="90" height="60" viewBox="0 0 90 60"><rect width="90" height="60" fill="#d8141f"/>'
      + '<circle cx="35" cy="30" r="15" fill="#fff"/><circle cx="39.5" cy="30" r="12" fill="#d8141f"/>'
      + '<path d="' + star(53, 30, 7.5, 3) + '" fill="#fff"/></svg>',
    bizans: '<svg xmlns="http://www.w3.org/2000/svg" width="90" height="60" viewBox="0 0 90 60"><rect width="90" height="60" fill="#f4c20d"/>'
      + '<g fill="#111" stroke="#111" stroke-width="0.6" stroke-linejoin="round">'
      // kanatlar: yukarı kalkık, alt kenarı tüylü
      + '<path d="M39 29 C31 25 24 16 13 12 C14 16 12 18 9 19 C12 20 12 23 9 25 C12 26 12 29 10 31 C13 32 14 35 12 37 C15 37 18 39 18 42 C21 40 25 40 27 43 C29 40 33 39 36 41 L40 36 Z"/>'
      + '<path d="M51 29 C59 25 66 16 77 12 C76 16 78 18 81 19 C78 20 78 23 81 25 C78 26 78 29 80 31 C77 32 76 35 78 37 C75 37 72 39 72 42 C69 40 65 40 63 43 C61 40 57 39 54 41 L50 36 Z"/>'
      // gövde ve kuyruk yelpazesi
      + '<path d="M38 30 Q45 25 52 30 L52 40 Q45 46 38 40 Z"/>'
      + '<path d="M39 42 L34 54 L42 50 L45 57 L48 50 L56 54 L51 42 Z"/>'
      // iki boyun ve baş (gaga dışa bakar)
      + '<path d="M41 30 C37 25 35 20 34 15 L38 14 C39 19 42 24 45 29 Z"/><path d="M49 30 C53 25 55 20 56 15 L52 14 C51 19 48 24 45 29 Z"/>'
      + '<path d="M34 15 L27 17 L33 12 C35 10 38 11 38 14 Z"/><path d="M56 15 L63 17 L57 12 C55 10 52 11 52 14 Z"/>'
      + '</g>'
      // göğüs kalkanı: kırmızı zemin, altın haç
      + '<rect x="40" y="29" width="10" height="11" rx="2" fill="#c1121f" stroke="#111" stroke-width="0.8"/><path d="M44 30.5h2v9h-2zM41.5 33.5h7v2h-7z" fill="#f4c20d"/>'
      // taçlar
      + '<g fill="#c1121f"><path d="M33 8l2 3 2-3 1 4h-6z"/><path d="M53 8l2 3 2-3 1 4h-6z"/></g></svg>'
  };
  const uri = {}, img = {};
  for (const k in SVG) { uri[k] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(SVG[k]); if (typeof Image !== 'undefined') { img[k] = new Image(); img[k].src = uri[k]; } }
  root.Flags = { svg: SVG, uri, img };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.Flags;
})(typeof window !== 'undefined' ? window : globalThis);
