const { launch } = require('./cdp.js'); const path = require('path');
(async () => {
  const b = await launch({ w: 844, h: 390 }); await b.phone(844, 390, 3, true);
  await b.go('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/')); await b.sleep(1500);
  // menüde gerçek dokunma ile oyunu başlat: önce 'start' düğmesinin yeri
  const r = await b.ev("(()=>{const e=document.getElementById('start');const q=e.getBoundingClientRect();return [q.x,q.y,q.width,q.height,innerHeight, document.getElementById('menu').scrollHeight]})()");
  console.log('start btn rect', r);
  await b.ev("document.getElementById('start').scrollIntoView()"); await b.sleep(800);
  const r2 = await b.ev("(()=>{const q=document.getElementById('start').getBoundingClientRect();return [q.x+q.width/2,q.y+q.height/2]})()");
  await b.tap(r2[0], r2[1]); await b.sleep(1500);
  console.log('running', await b.ev("!!window.__game.g && !document.getElementById('hud').classList.contains('hide')"));
  const G = "window.__game";
  const vpos = await b.ev("(()=>{const g=__game.g;const v=g.ents.find(e=>e.owner===0&&e.type==='villager');__game.centerOn(v.x,v.y);return [v.id, innerWidth/2, innerHeight*0.35]})()"); await b.sleep(300);
  await b.tap(vpos[1], vpos[2]); console.log('sel after tap unit', await b.ev(G + '.sel.join()'), 'vil', vpos[0]);
  const e1 = await b.ev("(()=>{const g=__game.g;const u=g.byId.get(__game.sel[0]);return u?u.type:null})()"); console.log('selected type', e1);
  await b.tap(vpos[1] + 150, vpos[2] + 30); await b.sleep(200);
  console.log('order after ground tap', await b.ev("(()=>{const u=__game.g.byId.get(__game.sel[0]);return u&&[u.order,u.dest&&u.dest.x.toFixed(1)]})()"));
  const c0 = await b.ev(G + '.cam.x'); await b.drag(500, 150, 300, 150); console.log('pan dx', (await b.ev(G + '.cam.x')) - c0);
  const t0 = await b.ev(G + '.ts'); await b.pinch(420, 150, 100, 250); console.log('zoom', t0, '->', await b.ev(G + '.ts'));
  // komut paneli düğmesine dokun
  const cb = await b.ev("(()=>{const q=document.querySelector('#cmds .cb');if(!q)return null;const r=q.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2,q.textContent.slice(0,20)]})()"); console.log('first cmd btn', cb);
  await b.shot('test/m_g2.png'); console.log(b.logs); await b.close();
})().catch(e => { console.log('HATA', e.message); process.exit(1); });
