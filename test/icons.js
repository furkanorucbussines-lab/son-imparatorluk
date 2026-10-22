// PWA simgeleri: kodla çizilen hilal+yıldız, Chrome ile PNG'ye çevrilir
const { launch } = require('./cdp.js'); const path = require('path'), fs = require('fs');
const svg = s => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 64 64"><defs><radialGradient id="g" cx="50%" cy="35%" r="80%"><stop offset="0" stop-color="#3a2a52"/><stop offset="1" stop-color="#0c0a16"/></radialGradient></defs><rect width="64" height="64" fill="url(#g)"/><path d="M34 12a21 21 0 1 0 0 40 16 16 0 1 1 0-40z" fill="#e8c24a"/><path d="M47 21l2.4 5.3 5.8.6-4.3 3.9 1.2 5.7L47 33.6l-5.1 2.9 1.2-5.7-4.3-3.9 5.8-.6z" fill="#d83a34"/><path d="M8 56h48v-4l-6-2-4-8-4 8-6-12-6 12-4-8-4 8-6 2z" fill="#07070f" opacity=".7"/></svg>`;
(async () => {
  for (const s of [192, 512]) {
    const b = await launch({ w: s, h: s }); await b.phone(s, s, 1, false);
    const html = 'data:text/html,' + encodeURIComponent(`<body style="margin:0">${svg(s)}</body>`);
    await b.go(html); await b.sleep(300); await b.shot(path.join(__dirname, '..', `icon-${s}.png`)); await b.close();
  }
  console.log('ok', fs.statSync(path.join(__dirname, '..', 'icon-192.png')).size);
})();
