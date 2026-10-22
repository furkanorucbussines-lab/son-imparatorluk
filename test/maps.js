const Sim = require('../sim.js'); let f = 0; const ok = (c, m) => { if (!c) { f++; console.log('✘', m); } };
for (const id of Sim.MAP_ORDER) for (const seed of [1, 2, 3]) {
  const g = Sim.create({ seed, map: id, difficulty: 'normal' }); g.owners[0].ai = true;
  const tcs = g.ents.filter(e => e.type === 'tc'); ok(tcs.length === 2, id + ' TC sayısı');
  let water = 0; for (let i = 0; i < 4096; i++) if (g.ter[i]) water++;
  const a = tcs[0], b = tcs[1], c = Sim.centerOf(b), v = g.ents.find(e => e.type === 'villager' && e.owner === 0);
  const path = Sim.makePath(g, v.x, v.y, { x: c.x, y: c.y + 2 }, 0); ok(path && path.length > 0, id + ' seed ' + seed + ': iki başlangıç arası yol yok');
  const gold = g.ents.filter(e => e.type === 'gold').length, vils0 = g.ents.filter(e => e.owner === 0 && e.type === 'villager').length; ok(gold >= 6, id + ' altın ' + gold); ok(vils0 === 5, id + ' köylü');
  const near = g.ents.filter(e => e.k === 'r' && Math.hypot(e.tx - a.tx, e.ty - a.ty) < 16).length; ok(near >= 10, id + ' başlangıç kaynakları ' + near);
  for (let i = 0; i < 20 * 120; i++) Sim.update(g, 0.05);
  if (seed === 1) console.log(id.padEnd(10), 'su %' + Math.round(water / 40.96), 'P0', a.tx + ',' + a.ty, 'P1', b.tx + ',' + b.ty, 'altın', gold);
}
const r = Sim.create({ seed: 4, map: 'rastgele' }); ok(Sim.MAPS[r.mapId], 'rastgele harita seçildi: ' + r.mapId);
const p = Sim.mapPreview('bogaz'); ok(p.ter.length === 4096 && p.starts.length === 2, 'önizleme');
console.log(f ? 'BAŞARISIZ ' + f : 'HEPSİ TAMAM'); process.exit(f ? 1 : 0);
