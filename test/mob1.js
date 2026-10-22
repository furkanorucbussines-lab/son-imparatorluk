const { launch } = require('./cdp.js'); const path = require('path');
(async () => {
  const b = await launch({ w: 844, h: 390 }); await b.phone(844, 390, 3, true);
  const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
  await b.go(url); await b.sleep(2500); await b.shot('test/m_menu_land.png');
  await b.phone(390, 844, 3, true); await b.sleep(1200); await b.shot('test/m_menu_port.png');
  await b.phone(844, 390, 3, true); await b.sleep(500);
  console.log('matchMedia coarse:', await b.ev("matchMedia('(pointer:coarse)').matches"), 'iw', await b.ev('innerWidth'), 'ih', await b.ev('innerHeight'), 'dpr', await b.ev('devicePixelRatio'));
  await b.ev("document.getElementById('start').click()"); await b.sleep(2500); await b.shot('test/m_game.png');
  // frame süresi
  const fps = await b.ev("new Promise(r=>{let n=0,t0=performance.now();function f(){n++;if(performance.now()-t0>2000)r(n/2);else requestAnimationFrame(f)}requestAnimationFrame(f)})");
  console.log('fps', fps, b.logs.slice(0, 5)); await b.close();
})().catch(e => { console.log('HATA', e.message); process.exit(1); });
