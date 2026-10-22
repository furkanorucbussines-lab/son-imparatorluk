// AI, hiç hamle yapmayan oyuncuya karşı ne kadar sürede kazanıyor?
const Sim = require('../sim.js');
for (const diff of ['kolay', 'normal', 'zor']) { const r = [];
  for (const seed of [1, 2, 3, 4]) { const g = Sim.create({ difficulty: diff, seed }); for (let i = 0; i < 20 * 1500 && g.winner < 0; i++) Sim.update(g, 0.05); r.push(g.winner === 1 ? (g.time / 60).toFixed(1) + 'dk' : 'kazanamadı'); }
  console.log(diff, r.join(' ')); }
