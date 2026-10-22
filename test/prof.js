const { launch } = require('./cdp.js'); const path = require('path');
(async () => {
  const b = await launch({ w: 844, h: 390 }); await b.phone(844, 390, 2, true);
  await b.go('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/')); await b.sleep(800);
  await b.ev("document.getElementById('mmGo').click()"); await b.sleep(600);
  await b.ev("(()=>{const g=__game.g,S=__game.Sim;g.owners[0].ai=true;for(let i=0;i<20*480;i++){S.update(g,0.05);if(i%40===0)g.events.length=0;}g.events.length=0;const mil=g.ents.filter(e=>e.k==='u'&&e.type!=='villager');let c=mil[0]||{x:32,y:32};__game.centerOn(c.x,c.y)})()");
  await b.send('Profiler.enable'); await b.send('Profiler.start'); await b.sleep(4000); const r = await b.send('Profiler.stop');
  const nodes = new Map(r.profile.nodes.map(n => [n.id, n])), self = new Map(); const dt = r.profile.timeDeltas;
  r.profile.samples.forEach((id, i) => { const n = nodes.get(id), k = n.callFrame.functionName + ' ' + path.basename(n.callFrame.url) + ':' + n.callFrame.lineNumber; self.set(k, (self.get(k) || 0) + (dt[i] || 0)); });
  const tot = [...self.values()].reduce((a, v) => a + v, 0); console.log('toplam ms', (tot / 1000).toFixed(0));
  [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 18).forEach(([k, v]) => console.log((v / tot * 100).toFixed(1) + '%', k));
  await b.close();
})().catch(e => { console.log('HATA', e.message); process.exit(1); });
