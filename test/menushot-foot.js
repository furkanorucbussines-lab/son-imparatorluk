// Kullanım: node test/menushot.js <bölüm id|hero> <sanal ms> <çıktı.png>
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const [sec = 'mHero', ms = '6000', out = 'menu.png'] = process.argv.slice(2);
const root = path.join(__dirname, '..');
let h = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const f of ['flags.js', 'sim.js', 'render.js', 'main.js', 'facts.js', 'menu.js']) h = h.replace(`src="${f}"`, `src="../${f}"`);
h = h.replace('href="menu.css"', 'href="../menu.css"').replace('href="pause.css"', 'href="../pause.css"');
h = h.replace('</body>', `<script>(()=>{const m=document.getElementById('menu'),el=document.querySelector('.mfoot');m.style.scrollBehavior='auto';m.querySelectorAll('*').forEach(x=>{x.style.transition='none'});m.scrollTop=1e7;m.classList.add('scrolled');})()</script></body>`);
const page = path.join(__dirname, 'auto-menu.html'); fs.writeFileSync(page, h);
const r = spawnSync('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--allow-file-access-from-files', '--window-size=1500,860', `--screenshot=${path.resolve(out)}`, 'file:///' + page.split(String.fromCharCode(92)).join('/') + '#t=' + ms], { timeout: 90000, encoding: 'utf8' });
console.log(r.error ? 'HATA ' + r.error.message : 'tamam ' + out);
