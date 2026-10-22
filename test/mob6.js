const { launch } = require('./cdp.js'); const path = require('path');
const URL = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
(async () => {
  const b = await launch({ w: 844, h: 390 }); await b.phone(844, 390, 2, true);
  await b.go(URL); await b.sleep(1200);
  const pos = async sel => await b.ev(`(()=>{const q=document.querySelector('${sel}').getBoundingClientRect();return [q.x+q.width/2,q.y+q.height/2]})()`);
  // Kızıl Elma ekranı
  let p = await pos('#mmCamp'); await b.tap(p[0], p[1]); await b.sleep(500); await b.shot('test/p1_camp.png');
  p = await pos('.cmcard'); await b.tap(p[0], p[1]); await b.sleep(500); await b.shot('test/p2_brief.png');
  p = await pos('#bGo'); await b.tap(p[0], p[1]); await b.sleep(1800); await b.shot('test/p3_mission.png');
  console.log('camp', await b.ev('__game.g.camp&&__game.g.camp.id'));
  // seçim: boş yere basılı tut/kutu seç/ordu
  const kb = await pos('#tbar [data-t=box]'); await b.tap(kb[0], kb[1]);
  await b.drag(200, 120, 700, 320, 12); console.log('box sel', await b.ev('__game.sel.length')); await b.shot('test/p4_box.png');
  await b.tap(kb[0], kb[1]);
  // pause
  const mb = await pos('#menuBtn'); await b.tap(mb[0], mb[1]); await b.sleep(400); await b.shot('test/p5_pause.png');
  console.log(b.logs.slice(0, 5)); await b.close();
})().catch(e => { console.log('HATA', e.message); process.exit(1); });
