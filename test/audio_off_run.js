// Çevrimdışı ses ölçümü: gizli Chrome sayfasını açar, sonucu yerel sunucuya POST ettirir.
const http = require('http'), { spawn } = require('child_process'), path = require('path');
const srv = http.createServer((q, r) => { r.setHeader('Access-Control-Allow-Origin', '*'); r.setHeader('Access-Control-Allow-Headers', '*'); if (q.method === 'OPTIONS') { r.end(); return; } let b = ''; q.on('data', d => b += d); q.on('end', () => { r.end('ok'); console.log(b); if (b === 'DONE' || b.startsWith('HATA')) { clearTimeout(to); ch.kill(); srv.close(); process.exit(0); } }); }).listen(8765);
const page = 'file:///' + path.join(__dirname, 'audio_off.html').split(String.fromCharCode(92)).join('/');
const ch = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required', '--window-size=600,400', page], { stdio: 'ignore' });
const to = setTimeout(() => { console.log('ZAMAN AŞIMI'); ch.kill(); process.exit(1); }, 170000);
