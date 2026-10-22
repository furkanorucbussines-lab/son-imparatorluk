// performans: telefon emülasyonu + CPU kısma, savaş sahnesi
const { launch } = require('./cdp.js'); const path = require('path');
const URL = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');
(async () => {
  const rate = +process.argv[2] || 4;
  const b = await launch({ w: 844, h: 390 }); await b.phone(844, 390, 2, true); await b.go(URL); await b.sleep(800);
  await b.ev("document.getElementById('mmGo').click()"); await b.sleep(800);
  // AI-AI ile ~8 dk ilerlet, savaş bölgesine git
  await b.ev("(()=>{const g=__game.g,S=__game.Sim;g.owners[0].ai=true;for(let i=0;i<20*480;i++){S.update(g,0.05);if(i%40===0)g.events.length=0;}g.events.length=0;const mil=g.ents.filter(e=>e.k==='u'&&e.type!=='villager');let c=mil[0]||{x:32,y:32};__game.centerOn(c.x,c.y);return mil.length})()").then(n => console.log('askeri birim', n));
  await b.cpu(rate); await b.sleep(500);
  const meas = async (label) => { const r = await b.ev("new Promise(r=>{let n=0,t0=performance.now(),mx=0,last=t0;function f(t){n++;mx=Math.max(mx,t-last);last=t;if(t-t0>3000)r([n/3,mx]);else requestAnimationFrame(f)}requestAnimationFrame(f)})"); console.log(label, 'fps', r[0].toFixed(1), 'en uzun kare ms', r[1].toFixed(0)); };
  await meas('auto'); await b.ev("Render.setLow(true)"); await meas('low');
  console.log('ent sayısı', await b.ev('__game.g.ents.length'), b.logs.slice(0, 3)); await b.close();
})().catch(e => { console.log('HATA', e.message); process.exit(1); });
