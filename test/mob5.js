const { launch } = require('./cdp.js'); const path = require('path');
const URL = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
(async () => {
  const b = await launch({ w: 844, h: 390 }); await b.phone(844, 390, 2, true);
  await b.go(URL); await b.sleep(1200);
  const pos = async sel => await b.ev(`(()=>{const q=document.querySelector('${sel}').getBoundingClientRect();return [q.x+q.width/2,q.y+q.height/2]})()`);
  let p = await pos('#mmGo'); await b.tap(p[0], p[1]); await b.sleep(1500);
  // köylü seç (dünya konumundan ekrana)
  const vp = await b.ev("(()=>{const g=__game.g;const v=g.ents.filter(e=>e.owner===0&&e.type==='villager')[2];__game.centerOn(v.x,v.y+1);const c=__game.cam,ts=__game.ts;return [(v.x-c.x)*ts,(v.y-c.y)*ts-10,v.id]})()"); await b.sleep(300);
  await b.tap(vp[0], vp[1]); console.log('sel', await b.ev('__game.sel.join()'), 'want', vp[2]); await b.sleep(300);
  await b.shot('test/o1_vil.png');
  // Ev butonuna dokun
  const bp = await b.ev("(()=>{const q=document.querySelector('#cmds .cb[data-t=house]');if(!q)return null;const r=q.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]})()");
  console.log('house btn', bp); await b.tap(bp[0], bp[1]); await b.sleep(200);
  console.log('mode', await b.ev('JSON.stringify(window.__game.g&&1)'));
  await b.tap(380, 150); await b.sleep(200); await b.shot('test/o2_place.png');
  const pbOn = await b.ev("document.getElementById('pbar').classList.contains('on')"); console.log('pbar on', pbOn);
  const okp = await pos('#pbar .ok'); await b.tap(okp[0], okp[1]); await b.sleep(400);
  console.log('house count', await b.ev("__game.g.ents.filter(e=>e.type==='house'&&e.owner===0).length"));
  // ordu seç
  const ar = await pos('#tbar [data-t=army]'); await b.tap(ar[0], ar[1]); await b.sleep(200); console.log('sel after army', await b.ev('__game.sel.length'));
  await b.shot('test/o3_army.png');
  // duraklat menüsü
  const mb = await pos('#menuBtn'); await b.tap(mb[0], mb[1]); await b.sleep(400); await b.shot('test/o4_pause.png');
  console.log(b.logs.slice(0, 5)); await b.close();
})().catch(e => { console.log('HATA', e.message); process.exit(1); });
