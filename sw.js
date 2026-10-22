/* Çevrimdışı önbellek: oyun dosyaları ilk açılışta saklanır, sonra internetsiz çalışır. */
const VER = 'si-v2', FILES = ['./', 'index.html', 'flags.js', 'sim.js', 'campaign.js', 'sprite3d.js', 'render.js', 'bldart.js', 'bldart2.js', 'audio.js', 'main.js', 'ui.js', 'camp-ui.js', 'mobile.js', 'facts.js', 'menu.js', 'menu.css', 'pause.css', 'camp.css', 'mobile.css', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VER).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.indexOf('/audio/music/') >= 0) return; // müzik akış olarak gelir (Range), önbelleğe alınmaz
  // önce ağ (güncel kalsın), olmazsa önbellek
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(VER).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
