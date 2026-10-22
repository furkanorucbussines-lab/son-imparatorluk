const { launch } = require('./cdp.js'); const path = require('path');
(async () => {
  const b = await launch({ w: 844, h: 390 }); await b.phone(844, 390, 2, true);
  await b.go('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/')); await b.sleep(900);
  let p = await b.ev("(()=>{const q=document.querySelector('#mmGo').getBoundingClientRect();return [q.x+q.width/2,q.y+q.height/2]})()"); await b.tap(p[0], p[1]); await b.sleep(1000);
  await b.ev("(()=>{const g=__game.g,S=__game.Sim;const tc=g.ents.find(e=>e.owner===0&&e.type==='tc');const k=S.addBld(g,0,'barracks',tc.tx+6,tc.ty+1,true);__game.centerOn(tc.tx+6,tc.ty+3);__game.sel=[k.id];window.__k=k})()"); await b.sleep(400);
  const r = await b.ev("(()=>{const q=document.querySelector('#cmds .cb[data-act=rally]');if(!q)return null;const r=q.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]})()");
  console.log('rally btn', r); await b.tap(r[0], r[1]); await b.sleep(150); await b.tap(500, 120); await b.sleep(200);
  console.log('rally', await b.ev('JSON.stringify(window.__k.rally)')); await b.shot('test/r2.png'); console.log(b.logs.slice(0, 3)); await b.close();
})().catch(e => { console.log('HATA', e.message); process.exit(1); });
