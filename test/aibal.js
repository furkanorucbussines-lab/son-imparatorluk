// AI dengesi ölçümü: node test/aibal.js [zorluk] [saniye] [seed,seed...]
const Sim = require('../sim.js');
const diff = process.argv[2] || 'normal', T = +process.argv[3] || 1500, seeds = (process.argv[4] || '1,2,3,4,5,6').split(',').map(Number);
let wins = [0, 0, 0];
for (const seed of seeds) {
  const g = Sim.create({ difficulty: diff, seed }); g.owners[0].ai = true;
  const ageT = [[0], [0]]; const seen = [0, 0], peak = [0, 0], tc = [0, 0];
  for (let i = 0; i < T / 0.05 && g.winner < 0; i++) {
    Sim.update(g, 0.05);
    for (let p = 0; p < 2; p++) { const o = g.owners[p]; if (o.age > seen[p]) { seen[p] = o.age; ageT[p][o.age] = g.time | 0; } }
    if (i % 100 === 0) for (let p = 0; p < 2; p++) peak[p] = Math.max(peak[p], g.owners[p].army);
  }
  wins[g.winner < 0 ? 2 : g.winner]++;
  const f = p => `çağ[${ageT[p].map(x => x === undefined ? '-' : x).join(',')}] zirveOrdu ${peak[p]} vil ${g.ents.filter(e => !e.dead && e.owner === p && e.type === 'villager').length}`;
  console.log(`seed ${seed}: bitti ${g.time | 0}s kazanan ${g.winner} | P0 ${f(0)} | P1 ${f(1)}`);
}
console.log('P0', wins[0], 'P1', wins[1], 'bitmedi', wins[2]);
