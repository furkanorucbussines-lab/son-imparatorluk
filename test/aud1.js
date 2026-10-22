const { launch } = require('./cdp.js'); const path = require('path');
(async () => {
  const b = await launch({ w: 844, h: 390 }); await b.phone(844, 390, 2, true);
  await b.go('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/')); await b.sleep(1200);
  await b.tap(300, 200); await b.sleep(2500);
  console.log('menü', JSON.stringify(await b.ev('GameAudio._state()')));
  const p = await b.ev("(()=>{const q=document.querySelector('#mmGo').getBoundingClientRect();return [q.x+q.width/2,q.y+q.height/2]})()"); await b.tap(p[0], p[1]); await b.sleep(3000);
  console.log('oyun', JSON.stringify(await b.ev('GameAudio._state()')));
  await b.ev("GameAudio.snd.age(); GameAudio.sfx.cannon(1,0); GameAudio.sfx.clang(1,0); GameAudio.sfx.mg(1,0)"); await b.sleep(500);
  console.log(b.logs.slice(0, 5)); await b.close();
})().catch(e => { console.log('HATA', e.message); process.exit(1); });
