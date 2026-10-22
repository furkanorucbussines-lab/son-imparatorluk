const { launch } = require('./cdp.js'); const path = require('path');
(async () => {
  const b = await launch({ w: 844, h: 390 }); await b.phone(844, 390, 2, true);
  await b.go('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/')); await b.sleep(900);
  const pos = async sel => await b.ev(`(()=>{const q=document.querySelector('${sel}').getBoundingClientRect();return [q.x+q.width/2,q.y+q.height/2]})()`);
  let p = await pos('#mmGo'); await b.tap(p[0], p[1]); await b.sleep(1200);
  // ordu ekle: 8 piyade + 4 okçu TC yanına
  await b.ev("(()=>{const g=__game.g,S=__game.Sim;const tc=g.ents.find(e=>e.owner===0&&e.type==='tc');for(let i=0;i<8;i++)S.addUnit(g,0,'inf',tc.tx+4+i%4*0.9,tc.ty+4+Math.floor(i/4)*0.9);for(let i=0;i<4;i++)S.addUnit(g,0,'archer',tc.tx+4+i*0.9,tc.ty+6.5);__game.centerOn(tc.tx+5,tc.ty+4);})()"); await b.sleep(300);
  const a = await pos('#tbar [data-t=army]'); await b.tap(a[0], a[1]); console.log('1 ordu seçildi', await b.ev('__game.sel.length'));
  await b.tap(600, 120); await b.sleep(150);
  console.log('2 emir', await b.ev("(()=>{const m={};__game.sel.forEach(i=>{const u=__game.g.byId.get(i);if(u)m[u.order]=(m[u.order]||0)+1});return JSON.stringify(m)})()"));
  const sa = await pos('#tbar [data-t=amove]'); await b.tap(sa[0], sa[1]); await b.tap(650, 200); await b.sleep(150);
  console.log('3 saldır-ilerle', await b.ev("(()=>{const m={};__game.sel.forEach(i=>{const u=__game.g.byId.get(i);if(u)m[u.order]=(m[u.order]||0)+1});return JSON.stringify(m)})()"));
  await b.sleep(8000); // ilerlesinler
  // bir piyadenin ekran konumu
  const up = await b.ev("(()=>{const u=__game.g.ents.find(e=>e.owner===0&&e.type==='inf');const c=__game.cam,ts=__game.ts;__game.centerOn(u.x,u.y);const c2=__game.cam;return [(u.x-c2.x)*ts,(u.y-c2.y)*ts-14]})()"); await b.sleep(200);
  // basılı tut
  await b.touch('touchStart', [[up[0], up[1]]]); await b.sleep(700); await b.touch('touchEnd', []); await b.sleep(200);
  console.log('4 basılı tut → seçili', await b.ev('__game.sel.length'), '(aynı türden)');
  // boş yere dokun: seçimi kaldırıp? (askerler seçiliyken emir verir); inşaat/ordu paneli
  await b.shot('test/r1.png'); console.log(b.logs.slice(0, 5)); await b.close();
})().catch(e => { console.log('HATA', e.message); process.exit(1); });
