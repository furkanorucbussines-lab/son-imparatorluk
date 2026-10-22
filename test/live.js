const { launch } = require('./cdp.js');
(async () => {
  const b = await launch({ w: 844, h: 390 }); await b.phone(844, 390, 2, true);
  await b.go('https://furkanorucbussines-lab.github.io/son-imparatorluk/'); await b.sleep(2500);
  await b.tap(400, 200); await b.sleep(2500);
  console.log('menü', JSON.stringify(await b.ev('GameAudio._state()')), 'classes', await b.ev('document.documentElement.className'));
  const p = await b.ev("(()=>{const q=document.querySelector('#mmGo').getBoundingClientRect();return [q.x+q.width/2,q.y+q.height/2]})()"); await b.tap(p[0], p[1]); await b.sleep(2500);
  console.log('oyun', JSON.stringify(await b.ev('GameAudio._state()')), 'running', await b.ev("!!__game.g"));
  console.log('sw', await b.ev("navigator.serviceWorker.getRegistration().then(r=>!!r)"));
  await b.shot('test/live.png'); console.log(b.logs.slice(0, 5)); await b.close();
})().catch(e => { console.log('HATA', e.message); process.exit(1); });
