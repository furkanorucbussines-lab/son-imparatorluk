// Kampanya testi: node test/camp.js
const Sim = require('../sim.js'); global.Sim = Sim; const C = require('../campaign.js');
let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } else console.log('ok  ', m); };
const I = id => C.MISSIONS.findIndex(m => m.id === id);
const run = (g, sec) => { for (let t = 0; t < sec; t += 0.05) { Sim.update(g, 0.05); C.tick(g); g.events.length = 0; if (g.winner >= 0) break; } };
C.MISSIONS.forEach((m, i) => {
  const g = C.create(i, { seed: 100 + i });
  ok(g.camp && g.owners[0].civ === 'osmanli', m.id + ' oluştu');
  run(g, 60);
  ok(g.winner < 0, m.id + ' 60sn çökmeden sürüyor, st=' + JSON.stringify(C.status(g).map(s => s.cur + '/' + s.max)));
  // kayıt/yükle
  const g2 = Sim.deserialize(JSON.parse(JSON.stringify(Sim.serialize(g))));
  ok(g2.camp && g2.camp.id === m.id, m.id + ' kayıt camp korur');
});
// Görev 1: hileyle tamamla
{
  const g = C.create(I('edirne'), { seed: 5 }), s = g.owners[0].start;
  for (let i = 0; i < 8; i++) Sim.addUnit(g, 0, 'villager', s.x + 5 + i * .3, s.y + 5);
  Sim.addBld(g, 0, 'house', s.x + 5, s.y + 10, true); Sim.addBld(g, 0, 'house', s.x + 8, s.y + 10, true); Sim.addBld(g, 0, 'barracks', s.x + 12, s.y + 4, true);
  for (let i = 0; i < 10; i++) Sim.addUnit(g, 0, 'inf', s.x + 5 + i * .3, s.y + 7);
  g.owners[0].age = 1; g.owners[0].res = { f: 5000, w: 5000, g: 5000, i: 5000 };
  run(g, 3); ok(g.winner === 0, 'görev1 zafer');
}
// Görev 2: 8 dk dayanma (kuleler + ordu hileli)
{
  const g = C.create(I('rumeli'), { seed: 6 }), s = g.owners[0].start;
  for (let i = 0; i < 3; i++) Sim.addBld(g, 0, 'tower', s.x + 6 + i * 3, s.y + 8, true);
  for (let i = 0; i < 30; i++) Sim.addUnit(g, 0, 'hcav', s.x + 3 + i * .3, s.y + 5);
  run(g, 500); ok(g.winner === 0, 'görev2 zafer (kule+ordu+8dk) t=' + Math.floor(g.time));
}
// Görev 3: kışlaları yok et
{
  const g = C.create(I('halic'), { seed: 7 });
  ok(C.tagAlive(g, 'yards').length === 3, 'görev3: 3 tersane yerleşti');
  C.tagAlive(g, 'yards').forEach(id => { g.byId.get(id).hp = 0; Sim.damage(g, g.byId.get(id), 99999, 0); });
  run(g, 3); ok(g.winner === 0, 'görev3 zafer');
}
// Görev 4: kuleler
{
  const g = C.create(I('sur'), { seed: 8 });
  const n = C.tagAlive(g, 'towers').length; ok(n >= 3, 'görev4: ' + n + ' kule');
  C.tagAlive(g, 'towers').forEach(id => Sim.damage(g, g.byId.get(id), 99999, 0));
  run(g, 3); ok(g.winner === 0, 'görev4 zafer');
}
// Görev 5: süre ve TC
{
  const g = C.create(I('fetih'), { seed: 9 }); run(g, 2);
  g.ents.filter(e => e.k === 'b' && e.owner === 1 && e.type === 'tc').forEach(e => Sim.damage(g, e, 999999, 0));
  run(g, 3); ok(g.winner === 0, 'görev5 zafer');
  const h = C.create(I('fetih'), { seed: 9 }); h.time = 1499.8; run(h, 2); ok(h.winner === 1, 'görev5 süre dolunca yenilgi');
}
// yenilgi: TC yıkılırsa
{ const g = C.create(I('rumeli'), { seed: 3 }); g.ents.filter(e => e.k === 'b' && e.owner === 0 && e.type === 'tc').forEach(e => Sim.damage(g, e, 999999, 1)); run(g, 2); ok(g.winner === 1, 'TC yıkılınca yenilgi'); }
// Görev: Top Dökümü
{ const g = C.create(I('dokum'), { seed: 11 }), s = g.owners[0].start; g.owners[0].age = 1; Sim.addBld(g, 0, 'foundry', s.x + 6, s.y + 8, true); g.owners[0].res.g = 900; for (let i = 0; i < 4; i++) Sim.addUnit(g, 0, 'siege', s.x + 5 + i * .4, s.y + 6); run(g, 3); ok(g.winner === 0, 'dokum zafer'); }
// Görev: Gizli Keşif
{ const g = C.create(I('kesif'), { seed: 12 }); ok(g.camp.marks.length === 3 && C.tagAlive(g, 'scouts').length === 9, 'kesif: 3 nokta, 9 izci');
  const u = g.ents.find(e => e.owner === 0 && e.type === 'cav'); g.camp.marks.forEach(m => { u.x = m.x; u.y = m.y; run(g, 1); }); ok(g.winner === 0, 'kesif zafer');
  const h = C.create(I('kesif'), { seed: 12 }); C.tagAlive(h, 'scouts').slice(1).forEach(id => Sim.damage(h, h.byId.get(id), 99999, 1)); run(h, 2); ok(h.winner === 1, 'kesif izciler ölünce yenilgi'); }
// Görev: Kızaklar
{ const g = C.create(I('kizak'), { seed: 13 }); const m = g.camp.marks[0]; C.tagAlive(g, 'convoy').forEach(id => { const e = g.byId.get(id); e.x = m.x; e.y = m.y; }); run(g, 1); ok(g.winner === 0, 'kizak zafer');
  const h = C.create(I('kizak'), { seed: 13 }); C.tagAlive(h, 'convoy').slice(0, 2).forEach(id => Sim.damage(h, h.byId.get(id), 99999, 1)); run(h, 2); ok(h.winner === 1, 'kizak konvoy ölünce yenilgi'); }
// Görev: Galata
{ const g = C.create(I('galata'), { seed: 14 }); ok(C.tagAlive(g, 'galata').length === 3, 'galata: 3 yapı'); C.tagAlive(g, 'galata').forEach(id => Sim.damage(g, g.byId.get(id), 99999, 0)); run(g, 2); ok(g.winner === 0, 'galata zafer'); }
// Görev: Karşı Saldırı (savunma: 12 dk; ordu hileli)
{ const g = C.create(I('karsi'), { seed: 15 }), s = g.owners[0].start; for (let i = 0; i < 40; i++) Sim.addUnit(g, 0, 'musketeer', s.x + 4 + (i % 10) * .4, s.y + 6 + Math.floor(i / 10) * .4); for (let k = 0; k < 240 && g.winner < 0; k++) { const tc = g.ents.find(e => e.owner === 0 && e.type === 'tc'); if (tc) { let c = Sim.centerOf(tc); const foe = g.ents.filter(e => !e.dead && e.owner === 1 && e.k === 'u').sort((a, b) => Math.hypot(a.x - c.x, a.y - c.y) - Math.hypot(b.x - c.x, b.y - c.y))[0]; if (foe && Math.hypot(foe.x - c.x, foe.y - c.y) < 16) c = { x: foe.x - 3, y: foe.y - 3 }; Sim.cmdMove(g, g.ents.filter(e => !e.dead && e.owner === 0 && e.k === 'u' && e.type !== 'villager').map(e => e.id), c.x + 3, c.y + 3, true); } run(g, 3); } ok(g.winner === 0, 'karsi zafer (12dk) t=' + Math.floor(g.time) + ' tc=' + C.hasTc(g, 0)); }
console.log(fail ? fail + ' HATA' : 'TAMAM'); process.exit(fail ? 1 : 0);
