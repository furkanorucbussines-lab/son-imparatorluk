const Sim = require('../sim.js');
const g = Sim.create({ difficulty: process.argv[3] || 'normal', seed: +process.argv[2] || 7 });
g.owners[0].ai = true;
const T = (+process.argv[4] || 900), dt = 0.05; let t0 = Date.now();
for (let i = 0; i < T / dt && g.winner < 0; i++) {
  Sim.update(g, dt);
  if (i % 1200 === 0) {
    const s = p => { const o = g.owners[p]; const en = g.ents.filter(e => !e.dead && e.owner === p); return `P${p} f${o.res.f|0} w${o.res.w|0} g${o.res.g|0} pop${o.pop}/${o.popcap} vil${en.filter(e=>e.type==='villager').length} mil${en.filter(e=>e.k==='u'&&e.type!=='villager').length} bld${en.filter(e=>e.k==='b').length}`; };
    console.log((g.time|0)+'s', s(0), '|', s(1));
  }
}
console.log('bitti', g.time|0, 'kazanan', g.winner, 'gerçek ms', Date.now()-t0);
