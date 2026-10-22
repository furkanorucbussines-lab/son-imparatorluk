const { launch } = require('./cdp.js'); const path = require('path');
(async () => {
  const b = await launch({ w: 844, h: 390 }); await b.phone(844, 390, 2, true);
  await b.go('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/')); await b.sleep(1000);
  const pos = async sel => await b.ev(`(()=>{const q=document.querySelector('${sel}').getBoundingClientRect();return [q.x+q.width/2,q.y+q.height/2]})()`);
  let p;
  for (const [sel, name, close] of [['#mmMap', 'maps', '#maps [data-close]'], ['.mm-sec button:nth-child(2)', 'saves', '#saves [data-close]'], ['.mm-sec button:nth-child(3)', 'settings', '#settings [data-close]'], ['#mmHelp', 'help', '#mhelpX']]) {
    p = await pos(sel); await b.tap(p[0], p[1]); await b.sleep(500); await b.shot(`test/q_${name}.png`);
    p = await pos(close); await b.tap(p[0], p[1]); await b.sleep(300);
  }
  p = await pos('#mmCamp'); await b.tap(p[0], p[1]); await b.sleep(400);
  p = await pos('.cmcard'); await b.tap(p[0], p[1]); await b.sleep(300); p = await pos('#bGo'); await b.tap(p[0], p[1]); await b.sleep(2500);
  await b.shot('test/q_mission.png');
  const o = await pos('#objs'); await b.tap(o[0], o[1]); await b.sleep(300); await b.shot('test/q_objs_open.png');
  await b.ev("__game.g.winner=0;__game.g.events.push({type:'gameover',winner:0,camp:true});"); await b.sleep(1200); await b.shot('test/q_end.png');
  console.log(b.logs.slice(0, 5)); await b.close();
})().catch(e => { console.log('HATA', e.message); process.exit(1); });
