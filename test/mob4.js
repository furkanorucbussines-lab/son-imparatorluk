const { launch } = require('./cdp.js'); const path = require('path');
const URL = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
(async () => {
  const b = await launch({ w: 844, h: 390 }); await b.phone(844, 390, 3, true);
  await b.go(URL); await b.sleep(1500); await b.shot('test/n_menu_land.png');
  console.log('classes', await b.ev('document.documentElement.className'), 'mm display', await b.ev("getComputedStyle(document.getElementById('mm')).display"));
  await b.phone(390, 844, 3, true); await b.sleep(600); await b.shot('test/n_menu_port.png');
  await b.phone(844, 390, 3, true); await b.sleep(600);
  // Osmanlı/Normal seç ve başlat: gerçek dokunma
  const pos = async sel => await b.ev(`(()=>{const q=document.querySelector('${sel}').getBoundingClientRect();return [q.x+q.width/2,q.y+q.height/2]})()`);
  let p = await pos('#mmGo'); await b.tap(p[0], p[1]); await b.sleep(2000);
  console.log('running', await b.ev("!!window.__game.g && !document.getElementById('hud').classList.contains('hide')"), b.logs.slice(0, 3));
  await b.shot('test/n_game1.png');
  // köylüye dokun
  const vp = await b.ev("(()=>{const g=__game.g;const v=g.ents.find(e=>e.owner===0&&e.type==='villager');__game.centerOn(v.x,v.y);return [v.id, innerWidth/2, innerHeight*0.4]})()"); await b.sleep(300);
  await b.tap(vp[1] + 14, vp[2] + 10); console.log('sel', await b.ev('__game.sel.join()'), 'villager', vp[0]);
  await b.tap(vp[1] + 160, vp[2] + 20); await b.sleep(200);
  console.log('order', await b.ev("(()=>{const u=__game.g.byId.get(__game.sel[0]);return u&&[u.type,u.order]})()"));
  await b.shot('test/n_game2.png'); await b.close();
})().catch(e => { console.log('HATA', e.message); process.exit(1); });
