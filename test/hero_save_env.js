const Sim = require('../sim.js'); let f = 0; const ok = (c, m) => { console.log(c ? '✔' : '✘', m); if (!c) f++; };
const step = (g, sec) => { for (let i = 0; i < 20 * sec; i++) Sim.update(g, 0.05); };
// 1) komutan
let g = Sim.create({ seed: 5, difficulty: 'normal' }); const o = g.owners[0]; o.res = { f: 9999, w: 9999, g: 9999, i: 0 };
const tc = g.ents.find(e => e.owner === 0 && e.type === 'tc');
ok(Sim.cmdTrain(g, tc.id, 'hero'), 'komutan üretimi başladı'); ok(!Sim.cmdTrain(g, tc.id, 'hero'), 'ikinci komutan reddedildi');
step(g, 50); const h = g.ents.find(e => e.owner === 0 && e.type === 'hero'); ok(!!h, 'komutan sahada (hp ' + (h && h.hp) + ')');
const inf = Sim.addUnit(g, 0, 'inf', h.x + 2, h.y), far = Sim.addUnit(g, 0, 'inf', h.x + 20, h.y); step(g, 1);
ok(inf.auraUntil > g.time && !(far.auraUntil > g.time), 'aura yakındakini güçlendirdi, uzaktakini değil');
ok(Sim.cmdHeroCry(g, 0) && inf.cryUntil > g.time, 'savaş narası çalıştı'); ok(!Sim.cmdHeroCry(g, 0), 'nara bekleme süresinde');
o.age = 1; g.owners[0].age = 1; const hp0 = h.maxhp; Sim.damage(g, h, 99999, 1); ok(h.dead && o.heroCd > 80, 'komutan öldü, yeniden çağırma beklemesi ' + Math.round(o.heroCd));
ok(inf.shakenUntil > g.time, 'yakın birimler sarsıldı'); ok(!Sim.cmdTrain(g, tc.id, 'hero'), 'beklemede komutan çağrılamaz');
// 2) kaydet / yükle
g = Sim.create({ seed: 11, difficulty: 'normal', env: { dayNight: true, weather: true } }); g.owners[0].ai = true; step(g, 240);
const snap = JSON.stringify(Sim.serialize(g)); console.log('  kayıt boyutu', (snap.length / 1024).toFixed(0), 'KB');
const g2 = Sim.deserialize(JSON.parse(snap)); g2.owners[0].ai = true;
ok(g2.ents.length === g.ents.filter(e => !e.dead).length, 'varlık sayısı aynı (' + g2.ents.length + ')');
ok(g2.owners[0].res.f === g.owners[0].res.f && g2.time === g.time, 'kaynak ve zaman aynı');
step(g, 30); step(g2, 30);
const sig = x => x.owners.map(o => ['f', 'w', 'g', 'i'].map(k => Math.floor(o.res[k])).join('/') + ':' + o.age + ':' + o.pop).join(' | ') + ' #' + x.ents.filter(e => !e.dead).length;
console.log('  orijinal', sig(g)); console.log('  yüklenen', sig(g2));
ok(sig(g) === sig(g2), 'yüklenen oyun aynı şekilde devam etti (deterministik)');
step(g2, 200); ok(g2.winner === -1 || g2.winner >= 0, 'yüklenen oyun 200 sn daha çökmeden çalıştı');
// 3) gece-gündüz ve hava
g = Sim.create({ seed: 3, difficulty: 'normal', env: { dayNight: true, weather: true } });
const kinds = new Set(), phases = new Set(); let minMul = 9, maxMul = 0;
for (let t = 0; t < 3600; t += 5) { g.time = t; const e = Sim.envAt(g); kinds.add(e.weather); phases.add(e.phase); minMul = Math.min(minMul, e.sightMul); maxMul = Math.max(maxMul, e.sightMul); }
ok(phases.has('night') && phases.has('day') && phases.has('dawn') && phases.has('dusk'), 'dört evre: ' + [...phases]);
ok(kinds.size >= 3, 'hava çeşitleri: ' + [...kinds]); ok(minMul < 0.7 && maxMul === 1, 'görüş çarpanı ' + minMul.toFixed(2) + '..' + maxMul);
g.time = 0; ok(Sim.envAt(g).weather === 'clear' && Sim.envAt(g).phase !== 'night', 'oyun açık ve gündüz başlar');
const g3 = Sim.create({ seed: 3, difficulty: 'normal' }); g3.time = 400; ok(Sim.envAt(g3).sightMul === 1, 'ortam kapalıyken (testler) görüş değişmez');
console.log(f ? 'BAŞARISIZ' : 'HEPSİ TAMAM'); process.exit(f ? 1 : 0);
