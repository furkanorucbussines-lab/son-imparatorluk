/* Son İmparatorluk - Kızıl Elma: görev tanımları ve görev motoru (çizimsiz; sim.js üstüne kurulu) */
(function (root) {
'use strict';
const Sim = root.Sim || (typeof require !== 'undefined' ? require('./sim.js') : null);
const W = 64, H = 64;

/* ---------- yardımcılar ---------- */
const alive = (g, f) => g.ents.filter(e => !e.dead && f(e));
const count = (g, o, f) => alive(g, e => e.owner === o && f(e)).length;
const isArmy = e => e.k === 'u' && e.type !== 'villager' && e.type !== 'engineer' && e.type !== 'spy' && e.type !== 'dog' && e.type !== 'medic' && e.type !== 'iha';
const hasTc = (g, o) => alive(g, e => e.k === 'b' && e.owner === o && e.type === 'tc').length > 0;
const dirOf = (g, o) => { const s = g.owners[o].start; return { dx: s.x + 1.5 < W / 2 ? 1 : -1, dy: s.y + 1.5 < H / 2 ? 1 : -1 }; };
const freeAt = (g, x, y) => x >= 0 && y >= 0 && x < W && y < H && Sim.tileFree(g, y * W + x);
function findFree(g, cx, cy, size) { // cx,cy çevresinde size×size boş alan (sol-üst köşe)
  for (let r = 0; r < 14; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
    const x = Math.round(cx) + dx, y = Math.round(cy) + dy; let ok = true;
    for (let a = 0; a < size && ok; a++) for (let b = 0; b < size; b++) if (!freeAt(g, x + a, y + b)) { ok = false; break; }
    if (ok) return { x, y };
  }
  return null;
}
function spawn(g, owner, type, n, cx, cy) { // n birim, merkezin çevresine
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = i * 2.4, r = 0.6 + (i % 5) * 0.35;
    let x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    x = Math.max(0.6, Math.min(W - 0.6, x)); y = Math.max(0.6, Math.min(H - 0.6, y));
    if (!freeAt(g, Math.floor(x), Math.floor(y))) { const f = findFree(g, x, y, 1); if (f) { x = f.x + 0.5; y = f.y + 0.5; } }
    out.push(Sim.addUnit(g, owner, type, x, y));
  }
  return out;
}
function say(g, title, text) { g.events.push({ type: 'story', title, text }); }
function tagAdd(g, tag, e) { (g.camp.tags[tag] = g.camp.tags[tag] || []).push(e.id); }
const tagAlive = (g, tag) => (g.camp.tags[tag] || []).filter(id => { const e = g.byId.get(id); return e && !e.dead; });
function raid(g, owner, comp, targetOwner) { // düşman akını: birlikler kendi başlangıcında belirir, hedef şehre saldırarak yürür
  const me = g.owners[owner].start, tg = g.ents.find(e => !e.dead && e.k === 'b' && e.owner === targetOwner && e.type === 'tc');
  if (!tg) return [];
  const c = Sim.centerOf(tg), d = dirOf(g, owner), ids = [];
  for (const [type, n] of comp) ids.push(...spawn(g, owner, type, n, me.x + 1.5 + d.dx * 4, me.y + 1.5 + d.dy * 4).map(u => u.id));
  Sim.cmdMove(g, ids, c.x, c.y, true);
  return ids;
}
const give = (g, o, r) => { for (const k in r) g.owners[o].res[k] += r[k]; };
function visit(g, i) { // işaretli noktaya herhangi bir birimimiz ulaştı mı (kalıcı)
  const m = g.camp.marks[i]; if (m.done) return true;
  if (g.ents.some(e => !e.dead && e.k === 'u' && e.owner === 0 && Math.hypot(e.x - m.x, e.y - m.y) <= m.r)) { m.done = true; return true; }
  return false;
}
function reachCount(g, tag, i) { const m = g.camp.marks[i], n = tagAlive(g, tag).filter(id => { const e = g.byId.get(id); return Math.hypot(e.x - m.x, e.y - m.y) <= m.r; }).length; if (n >= 3) m.done = true; return n; }
const mm = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');

/* ---------- görevler ----------
   obj: { id, text, prog(g)->[şu an, hedef], done(g)->bool }  (done yoksa prog tamamlanınca biter)
   script: { at: saniye, do(g) }   — her biri bir kez çalışır
   lose(g) -> metin|null  (varsayılan: Şehir Merkezin yıkılırsa)  */
const MISSIONS = [
  {
    id: 'edirne', name: 'Edirne\'de Hazırlık', date: 'Kış 1451', civ: 'osmanli', map: 'bozkir', diff: 'kolay', ai: false,
    brief: [
      'Genç Sultan II. Mehmed tahta ikinci kez çıktı ve gözünü bir şehre dikti: İstanbul. Bin yıllık surlar, Roma\'dan kalma bir miras… Ona ulaşmak için önce güçlü bir ordu ve sağlam bir ekonomi gerek.',
      'Komutanım, Edirne\'deki çiftlikleri ve ocakları büyütün. Köylü yetiştirin, evler kurun, bir Kışla açın ve Barut Çağı\'na geçin; top döküm işi başlasın.'
    ],
    outro: 'Edirne\'nin ocakları dumanını tüttürüyor. Topçubaşı yeni dökümü haber verdi: şimdi Boğaz\'a, Rumeli Hisarı\'na!',
    setup(g) { give(g, 0, { f: 150, w: 200, g: 100 }); },
    objs: [
      { id: 'v', text: 'Köylü sayısını 12\'ye çıkar', prog: g => [count(g, 0, e => e.k === 'u' && e.type === 'villager'), 12] },
      { id: 'h', text: '2 Ev kur (nüfus sınırı)', prog: g => [count(g, 0, e => e.k === 'b' && e.type === 'house' && e.done), 2] },
      { id: 'k', text: 'Kışla kur', prog: g => [count(g, 0, e => e.k === 'b' && e.type === 'barracks' && e.done), 1] },
      { id: 'a', text: '10 asker yetiştir', prog: g => [count(g, 0, isArmy), 10] },
      { id: 'age', text: 'Barut Çağı\'na geç (Şehir Merkezi → Çağ atla)', prog: g => [g.owners[0].age, 1] }
    ],
    script: [
      { at: 3, do: g => say(g, 'Edirne Sarayı', 'Köylüleri ağaca, çalıya ve altına gönder. Şehir Merkezi\'nden yeni köylü üret.') },
      { at: 120, do: g => say(g, 'Divan', 'Ev kurmadan nüfus sınırını aşamazsın. Kışla ise ordunun beşiği; Barut Çağı için de şart.') },
      { at: 260, do: g => { say(g, 'Haber', 'Bizans keşif süvarileri sınırda görüldü! Birkaç asker hazır tut.'); raid(g, 1, [['cav', 3]], 0); } }
    ]
  },
  {
    id: 'rumeli', name: 'Rumeli Hisarı', date: 'Bahar 1452', civ: 'osmanli', map: 'bogaz', diff: 'normal', ai: false,
    brief: [
      'Boğaz\'ın en dar yerine, Bizans\'ın göbeğine bir hisar dikilecek: Rumeli Hisarı. Kurulursa İstanbul\'a Karadeniz\'den gelen yardım kesilir. Mehmed, işin dört ay içinde bitmesini emretti.',
      'Bizans buna sessiz kalmayacak. Gözetleme kuleleri kurun, ordunuzu toplayın; işçileri koruyun ve düşman akınlarına dayanın. Hisar tamamlanana dek sekiz dakika dirençle bekleyin.'
    ],
    outro: 'Rumeli Hisarı üç ayda bitti! Boğaz\'dan geçen gemiler artık top ateşi altında. Bizans\'ın nefesi kesildi.',
    setup(g) { give(g, 0, { f: 300, w: 500, g: 300 }); g.camp.state.wave = 0; },
    objs: [
      { id: 't', text: '3 Gözetleme Kulesi kur (hisarın temelleri)', prog: g => [count(g, 0, e => e.k === 'b' && e.type === 'tower' && e.done), 3] },
      { id: 'a', text: 'En az 15 askerlik ordu kur', prog: g => [count(g, 0, isArmy), 15] },
      { id: 's', text: 'Hisarın bitmesini bekle: 8:00', prog: g => [Math.min(480, Math.floor(g.time)), 480], time: true, text2: g => 'Hisarın bitmesine kalan: ' + mm(Math.max(0, 480 - g.time)) }
    ],
    script: [
      { at: 3, do: g => say(g, 'Boğaz', 'Bizans kuvvetleri kuzeye, hisar alanına doğru toplanıyor. Önce ekonomini hızla büyüt!') },
      { at: 100, do: g => { say(g, 'Gözcü', 'Bizans öncü birlikleri yaklaşıyor!'); raid(g, 1, [['inf', 4], ['archer', 3]], 0); } },
      { at: 200, do: g => { say(g, 'Gözcü', 'Ağır bir süvari akını geliyor!'); raid(g, 1, [['cav', 4], ['inf', 4], ['archer', 3]], 0); } },
      { at: 300, do: g => { say(g, 'Gözcü', 'Büyük bir Bizans ordusu hisar alanına yürüyor! Dayanın!'); raid(g, 1, [['hcav', 3], ['inf', 6], ['archer', 5]], 0); } },
      { at: 400, do: g => { say(g, 'Gözcü', 'Son akın! Bu geçerse hisar bizim.'); raid(g, 1, [['hcav', 4], ['inf', 8], ['archer', 6], ['cav', 4]], 0); } }
    ]
  },
  {
    id: 'halic', name: 'Haliç Baskını', date: 'Nisan 1453', civ: 'osmanli', map: 'adalar', diff: 'normal', ai: true,
    brief: [
      'Bizans, Haliç\'in ağzına dev bir zincir gerdi: donanmamız içeri giremiyor. Fakat zincirin gerisinde Bizans\'ın askeri tesisleri var; kıyıdaki üç kışlayı yakarsak Haliç savunması çöker.',
      'Süvarilerle hızlı bir baskın yapın. Üç düşman kışlasını yıkın. Dikkat: Bizans savunma yapacak ve ordu üretecek; her tersanenin başında nöbetçiler ve bir kule var.'
    ],
    outro: 'Haliç\'teki tesisler kül oldu! Mehmed gemileri karadan yağlı kızaklarla yürütüp Haliç\'e indirmeye karar verdi. Bu bir efsane olacak!',
    setup(g) {
      give(g, 0, { f: 400, w: 400, g: 300 });
      const me = g.owners[0].start, d = dirOf(g, 0), e = g.owners[1].start, de = dirOf(g, 1);
      const raiders = [['cav', 8], ['harcher', 6], ['inf', 6], ['archer', 4]];
      for (const [t, n] of raiders) spawn(g, 0, t, n, me.x + 1.5 + d.dx * 6, me.y + 1.5 + d.dy * 6);
      const spots = [[-9, 4], [-3, 9], [5, 7]];
      for (const [ox, oy] of spots) {
        const f = findFree(g, e.x + 1.5 + de.dx * ox * -1, e.y + 1.5 + de.dy * oy * -1, 3);
        if (f) { const b = Sim.addBld(g, 1, 'barracks', f.x, f.y, true); tagAdd(g, 'yards', b); spawn(g, 1, 'inf', 4, f.x + 1.5, f.y + 4); spawn(g, 1, 'archer', 3, f.x + 2, f.y + 3); const tf = findFree(g, f.x + 3, f.y - 1, 2); if (tf) Sim.addBld(g, 1, 'tower', tf.x, tf.y, true); }
      }
      g.owners[0].res.g += 100;
    },
    objs: [
      { id: 'y', text: 'Haliç Tersanesi\'ni yık: 3 düşman Kışlası', prog: g => [3 - tagAlive(g, 'yards').length, 3] },
      { id: 'k', text: 'Şehir Merkezini koru', prog: g => [hasTc(g, 0) ? 1 : 0, 1], info: true }
    ],
    script: [
      { at: 3, do: g => say(g, 'Haliç', 'Kıyıdaki üç Bizans Kışlası hedefin. Süvarilerle hızlı vur, kaçanları okçularla topla.') }
    ]
  },
  {
    id: 'sur', name: 'Surların Dibinde', date: 'Nisan 1453', civ: 'osmanli', map: 'klasik', diff: 'zor', ai: true,
    brief: [
      'Theodosius surları. Yedi yüzyıl boyunca Avarları, Arapları, Bulgarları geri çeviren üç sıra duvar. Bu surlara Mehmed Han\'ın yeni dökülen devasa topları ilk kez dönecek.',
      'Top\'larınız var, ama kule ve duvar arkasında Bizans okçuları sizi bekliyor. Topları öne sürün, piyadelerle koruyun. Şehir Merkezinin etrafındaki dört kuleyi yıkın.'
    ],
    outro: 'Duvarlar sarsıldı! Kulelerin yıkılışıyla surlarda ilk gedik açıldı. Hazırlık tamam: şimdi son hücum!',
    setup(g) {
      const o = g.owners[0]; o.age = 1; give(g, 0, { f: 500, w: 600, g: 500, i: 100 });
      const me = o.start, d = dirOf(g, 0), e = g.owners[1].start;
      spawn(g, 0, 'siege', 6, me.x + 1.5 + d.dx * 6, me.y + 1.5 + d.dy * 6);
      spawn(g, 0, 'inf', 14, me.x + 1.5 + d.dx * 8, me.y + 1.5 + d.dy * 4);
      spawn(g, 0, 'archer', 8, me.x + 1.5 + d.dx * 4, me.y + 1.5 + d.dy * 8);
      spawn(g, 0, 'cav', 6, me.x + 1.5 + d.dx * 9, me.y + 1.5 + d.dy * 9);
      // Bizans: TC çevresinde sur halkası (kapılı) ve 4 köşe kulesi
      const cx = e.x + 1, cy = e.y + 1, R = 5, ring = [];
      for (let k = -R; k <= R; k++) { ring.push([cx + k, cy - R], [cx + k, cy + R], [cx - R, cy + k], [cx + R, cy + k]); }
      const seen = new Set();
      for (const [x, y] of ring) {
        const key = x + ',' + y; if (seen.has(key)) continue; seen.add(key);
        if (!freeAt(g, x, y)) continue;
        const gateSpot = (x === cx && y === cy - R * (e.y + 1.5 < H / 2 ? -1 : 1)); // TC'ye bakan karşı yüze kapı
        const wb = Sim.addBld(g, 1, gateSpot ? 'gate' : 'wall', x, y, true);
        if (gateSpot) { g.occ[y * W + x] = 0; g.gate[y * W + x] = 2; g.regDirty = true; }
      }
      for (const [sx, sy] of [[-R - 1, -R - 1], [R, -R - 1], [-R - 1, R], [R, R]]) {
        const f = findFree(g, cx + sx, cy + sy, 2);
        if (f) { const b = Sim.addBld(g, 1, 'tower', f.x, f.y, true); tagAdd(g, 'towers', b); }
      }
      spawn(g, 1, 'archer', 10, cx, cy + 3); spawn(g, 1, 'inf', 10, cx + 2, cy + 2); spawn(g, 1, 'hcav', 4, cx - 2, cy + 3); g.owners[1].age = 1; give(g, 1, { f: 400, w: 400, g: 400 });
    },
    objs: [
      { id: 't', text: 'Surlardaki 4 Kuleyi yık', prog: g => [(g.camp.tags.towers || []).length - tagAlive(g, 'towers').length, Math.max(1, (g.camp.tags.towers || []).length)] },
      { id: 's', text: 'En az 3 Top\'u hayatta tut', prog: g => [count(g, 0, e => e.k === 'u' && e.type === 'siege') >= 3 ? 1 : 0, 1], info: true }
    ],
    script: [
      { at: 3, do: g => say(g, 'Zağanos Paşa', 'Toplar burada, komutanım. Menzilleri uzun ama hareketleri yavaş. Piyadeleri önüne koy.') },
      { at: 150, do: g => { say(g, 'Gözcü', 'Bizans surlardan bir çıkış yapıyor!'); raid(g, 1, [['inf', 6], ['cav', 4]], 0); } },
      { at: 320, do: g => { say(g, 'Gözcü', 'Ağır bir çıkış! Toplarınızı koruyun!'); raid(g, 1, [['hcav', 4], ['inf', 8], ['archer', 6]], 0); } },
      { at: 520, do: g => { say(g, 'Gözcü', 'Tüfekliler surlardan iniyor!'); raid(g, 1, [['musketeer', 8], ['hcav', 4], ['inf', 6]], 0); } }
    ],
    lose(g) { if (!hasTc(g, 0)) return 'Şehir Merkezin yıkıldı.'; if (count(g, 0, e => e.k === 'u' && e.type === 'siege') < 3 && g.time > 10) return 'Toplar kayboldu; surlar yıkılamaz.'; return null; }
  },
  {
    id: 'fetih', name: '29 Mayıs 1453 — Fetih', date: '29 Mayıs 1453', civ: 'osmanli', map: 'klasik', diff: 'usta', ai: true,
    brief: [
      'Elli üç gün sürdü. Toplar duvarları yardı, gemiler karadan Haliç\'e yürüdü, askerler yılmadı. Şimdi son gece. Sabah ezanında büyük hücum başlayacak.',
      'Şehir Merkezini yıkın ve İstanbul\'u fethedin! Ama zaman kısıtlı: Macar ve Venedik yardım donanmaları yoldadır. 25 dakika içinde bitirin; Bizans bu kez ölümüne savaşıyor.'
    ],
    outro: '29 Mayıs 1453. Sultan II. Mehmed, atının üstünde Ayasofya\'ya girdi. Bin yıllık imparatorluk son buldu; yeni bir çağ başladı. İstanbul artık Fatih\'in şehridir.',
    setup(g) {
      const o = g.owners[0]; o.age = 1; give(g, 0, { f: 700, w: 900, g: 700, i: 200 });
      const me = o.start, d = dirOf(g, 0);
      spawn(g, 0, 'siege', 3, me.x + 1.5 + d.dx * 6, me.y + 1.5 + d.dy * 6); spawn(g, 0, 'inf', 8, me.x + 1.5 + d.dx * 8, me.y + 1.5 + d.dy * 4);
      g.owners[1].age = 1; give(g, 1, { f: 600, w: 600, g: 600, i: 100 });
    },
    objs: [
      { id: 'tc', text: 'Bizans Şehir Merkezini yık', prog: g => [hasTc(g, 1) ? 0 : 1, 1] },
      { id: 'time', text: 'Süre: 25:00', prog: g => [Math.min(1500, Math.floor(g.time)), 1500], info: true, time: true, text2: g => 'Kalan süre: ' + mm(Math.max(0, 1500 - g.time)) }
    ],
    script: [
      { at: 3, do: g => say(g, 'Sultan Mehmed', 'Bugün tarihin gününü yazacağız. Ordu hazır olsun!') },
      { at: 420, do: g => { say(g, 'Gözcü', 'Bizans büyük bir karşı saldırıya geçti!'); raid(g, 1, [['hcav', 5], ['musketeer', 8], ['inf', 8]], 0); } },
      { at: 750, do: g => say(g, 'Gözcü', 'Yarısı geçti. Surlar direniyor; kuşatmayı sıkılaştırın.') },
      { at: 900, do: g => { say(g, 'Gözcü', 'Bizans son yedeklerini sürüyor!'); raid(g, 1, [['hcav', 6], ['musketeer', 10], ['siege', 3], ['inf', 8]], 0); } },
      { at: 1200, do: g => say(g, 'Gözcü', 'Son beş dakika! Yardım donanması geliyor — acele edin!') },
      { at: 1250, do: g => raid(g, 1, [['hcav', 8], ['musketeer', 12], ['siege', 4]], 0) }
    ],
    lose(g) { if (!hasTc(g, 0)) return 'Şehir Merkezin yıkıldı.'; if (g.time >= 1500) return 'Süre doldu; yardım donanması geldi.'; return null; }
  }
,
  {
    id: 'dokum', name: 'Top Dökümü', date: 'Kış 1452', civ: 'osmanli', map: 'vadi', diff: 'kolay', ai: false,
    brief: [
      'Macar usta Urban, Bizans\'ın parasızlığından bıkıp Edirne\'ye geldi. Sultan\'a bir vaatte bulundu: "Kuşatmak istediğiniz surları, ben yerle bir ederim." Dünyanın en büyük topu dökülecek.',
      'Barut Çağı\'na geçin, bir Top Dökümhanesi kurun ve ilk dört topu üretin. Altın biriktirin: döküm pahalı bir iştir. Bizans casusları Edirne\'yi gözlüyor; ocakları koruyun.'
    ],
    outro: 'Dev top hazır! Yirmi sekiz öküzün çektiği bu canavar, İstanbul\'a yürüyecek. Ordu Rumeli\'ye hareket ediyor.',
    setup(g) { give(g, 0, { f: 400, w: 700, g: 500, i: 150 }); },
    objs: [
      { id: 'age', text: 'Barut Çağı\'na geç', prog: g => [g.owners[0].age, 1] },
      { id: 'f', text: 'Top Dökümhanesi kur', prog: g => [count(g, 0, e => e.k === 'b' && e.type === 'foundry' && e.done), 1] },
      { id: 'g', text: '800 altın biriktir', prog: g => [Math.floor(g.owners[0].res.g), 800] },
      { id: 's', text: '4 Top üret', prog: g => [count(g, 0, e => e.k === 'u' && e.type === 'siege'), 4] }
    ],
    script: [
      { at: 3, do: g => say(g, 'Urban Usta', 'Önce Barut Çağı, sonra Dökümhane. Demirsiz top olmaz: demir madenine köylü gönder.') },
      { at: 280, do: g => { say(g, 'Gözcü', 'Bizans süvarileri dökümhaneyi gözlüyor!'); raid(g, 1, [['cav', 4], ['inf', 3]], 0); } },
      { at: 520, do: g => { say(g, 'Gözcü', 'Bir akın daha geliyor!'); raid(g, 1, [['cav', 5], ['harcher', 3], ['inf', 4]], 0); } }
    ]
  },
  {
    id: 'kesif', name: 'Gizli Keşif', date: 'Mart 1453', civ: 'osmanli', map: 'bozkir', diff: 'normal', ai: true,
    brief: [
      'Sultan, surların zayıf noktalarını bilmek istiyor. Hangi kapı nöbetsiz, hangi kule çatlak? Bunu ancak gözleri ve ayakları sessiz olan biri öğrenebilir.',
      'Üç casus, dört süvari ve iki köpekle düşman topraklarına sızın. Haritadaki sarı bayraklı üç noktaya ulaşın. Casuslar kılık değiştirip gizlenebilir; köpekler ve mimarlar onları açığa çıkarır. Bizans ordusuna yakalanmayın.'
    ],
    outro: 'Casuslar haritayı getirdi: Kerkoporta kapısı sürekli açık, Lykos vadisi zayıf! Sultan bu bilgiyi hazırlıklarında kullanacak.',
    setup(g) {
      const me = g.owners[0].start, d = dirOf(g, 0), e = g.owners[1].start, de = dirOf(g, 1);
      const bx = me.x + 1.5 + d.dx * 7, by = me.y + 1.5 + d.dy * 7;
      ['spy', 'spy', 'spy'].forEach(t => spawn(g, 0, t, 1, bx, by).forEach(u => tagAdd(g, 'scouts', u)));
      spawn(g, 0, 'cav', 4, bx + 1, by + 1).forEach(u => tagAdd(g, 'scouts', u)); spawn(g, 0, 'dog', 2, bx - 1, by).forEach(u => tagAdd(g, 'scouts', u));
      const ex = e.x + 1.5, ey = e.y + 1.5;
      g.camp.marks = [{ x: (me.x + ex) / 2, y: (me.y + ey) / 2, r: 3, label: 'Gözetleme tepesi' }, { x: ex + de.dx * -9, y: ey + de.dy * 2, r: 3, label: 'Kuzey kapısı' }, { x: ex + de.dx * 3, y: ey + de.dy * 9, r: 3, label: 'Gizli geçit' }];
      for (const m of g.camp.marks) { const f = findFree(g, m.x, m.y, 1); if (f) { m.x = f.x + 0.5; m.y = f.y + 0.5; } }
      spawn(g, 1, 'inf', 4, ex + de.dx * -9, ey + de.dy * 6); spawn(g, 1, 'archer', 3, ex + de.dx * 3, ey + de.dy * 6);
    },
    objs: [
      { id: 'm0', text: 'Gözetleme tepesine ulaş', prog: g => [visit(g, 0) ? 1 : 0, 1] },
      { id: 'm1', text: 'Kuzey kapısını keşfet', prog: g => [visit(g, 1) ? 1 : 0, 1] },
      { id: 'm2', text: 'Gizli geçidi bul', prog: g => [visit(g, 2) ? 1 : 0, 1] },
      { id: 'sc', text: 'En az 2 casus/süvari hayatta kalsın', prog: g => [tagAlive(g, 'scouts').length >= 2 ? 1 : 0, 1], info: true }
    ],
    script: [{ at: 3, do: g => say(g, 'Sultan', 'Sessiz ol, gölge gibi ol. Haritadaki sarı bayrakları gör ve dön.') }],
    lose(g) { if (!hasTc(g, 0)) return 'Şehir Merkezin yıkıldı.'; if (tagAlive(g, 'scouts').length < 2) return 'Keşif birliği yakalandı.'; return null; }
  },
  {
    id: 'kizak', name: 'Kızaklar', date: '22 Nisan 1453', civ: 'osmanli', map: 'klasik', diff: 'normal', ai: true,
    brief: [
      'Zincir Haliç\'i kapatmış, donanma giremiyor. Mehmed bir delilik düşündü: Gemileri Galata tepelerinden, karadan yürütecek. Yağlanmış kızaklar, öküzler ve bin işçi…',
      'Siz bu görevde top konvoyunu hedefe ulaştıracaksınız. Dört topu sarı bayrağa götürün; en az üçü varmalı. Bizans keşif akınları yolu kesmeye çalışacak. Konvoyu koruyun.'
    ],
    outro: 'Yetmiş gemi bir gecede Haliç\'e indi! Bizans uyandığında karşılarında Osmanlı donanmasını gördü. Kuşatmanın seyri değişti.',
    setup(g) {
      give(g, 0, { f: 400, w: 500, g: 300 }); g.owners[0].age = 1;
      const me = g.owners[0].start, d = dirOf(g, 0), e = g.owners[1].start;
      const bx = me.x + 1.5 + d.dx * 5, by = me.y + 1.5 + d.dy * 5;
      spawn(g, 0, 'siege', 4, bx, by).forEach(u => tagAdd(g, 'convoy', u));
      spawn(g, 0, 'inf', 10, bx + 2, by + 1); spawn(g, 0, 'archer', 6, bx - 1, by + 2); spawn(g, 0, 'cav', 4, bx + 3, by - 1);
      const tx = me.x + 1.5 + (e.x - me.x) * 0.62, ty = me.y + 1.5 + (e.y - me.y) * 0.62, f = findFree(g, tx, ty, 1);
      g.camp.marks = [{ x: f ? f.x + 0.5 : tx, y: f ? f.y + 0.5 : ty, r: 3.5, label: 'Haliç kızağı' }];
    },
    objs: [
      { id: 'c', text: '3 Top\'u sarı bayrağa ulaştır', prog: g => [reachCount(g, 'convoy', 0), 3] },
      { id: 'a', text: 'Konvoyu koru (en az 3 Top hayatta)', prog: g => [tagAlive(g, 'convoy').length >= 3 ? 1 : 0, 1], info: true }
    ],
    script: [
      { at: 3, do: g => say(g, 'Sultan Mehmed', 'Toplar yavaş yürür. Piyadeleri önüne, okçuları yanına al; akın geliyor.') },
      { at: 100, do: g => { say(g, 'Gözcü', 'Bizans süvarileri konvoyu görmüş!'); raid(g, 1, [['cav', 5], ['harcher', 3]], 0); } },
      { at: 220, do: g => { say(g, 'Gözcü', 'Ağır birlikler yolda!'); raid(g, 1, [['hcav', 3], ['inf', 6], ['archer', 4]], 0); } },
      { at: 360, do: g => { say(g, 'Gözcü', 'Tüfekliler yolu kesiyor!'); raid(g, 1, [['musketeer', 6], ['hcav', 3], ['inf', 6]], 0); } }
    ],
    lose(g) { if (!hasTc(g, 0)) return 'Şehir Merkezin yıkıldı.'; if (tagAlive(g, 'convoy').length < 3 && !g.camp.done.c) return 'Konvoy dağıldı: yeterli top kalmadı.'; return null; }
  },
  {
    id: 'galata', name: 'Galata Hattı', date: 'Nisan 1453', civ: 'osmanli', map: 'goller', diff: 'zor', ai: true,
    brief: [
      'Haliç\'in kuzeyinde, Cenevizlilerin Galata kolonisi: tarafsız görünür, ama zincirin ucu ve topların bir kısmı onlarda. Bizans\'a yardım ulaştırıyorlar.',
      'Galata\'nın savunma hattını yıkın: bir Tabya ve iki kule. Göller diyarında yol dar; topları ve süvarileri doğru kullanın.'
    ],
    outro: 'Galata hattı çöktü! Zincirin ucu artık Osmanlı\'nın elinde. Haliç\'e giden yol açık.',
    setup(g) {
      const o = g.owners[0]; o.age = 1; give(g, 0, { f: 600, w: 700, g: 600, i: 150 });
      const me = o.start, d = dirOf(g, 0), e = g.owners[1].start, de = dirOf(g, 1);
      spawn(g, 0, 'siege', 4, me.x + 1.5 + d.dx * 6, me.y + 1.5 + d.dy * 6); spawn(g, 0, 'inf', 12, me.x + 1.5 + d.dx * 8, me.y + 1.5 + d.dy * 4); spawn(g, 0, 'musketeer', 8, me.x + 1.5 + d.dx * 4, me.y + 1.5 + d.dy * 8); spawn(g, 0, 'cav', 6, me.x + 1.5 + d.dx * 9, me.y + 1.5 + d.dy * 9);
      g.owners[1].age = 1; give(g, 1, { f: 500, w: 500, g: 500, i: 80 });
      const ex = e.x + 1.5, ey = e.y + 1.5;
      const f1 = findFree(g, ex + de.dx * 8, ey + de.dy * 2, 3); if (f1) tagAdd(g, 'galata', Sim.addBld(g, 1, 'fortress', f1.x, f1.y, true));
      for (const [ox, oy] of [[6, 8], [10, -2]]) { const f = findFree(g, ex + de.dx * ox, ey + de.dy * oy, 2); if (f) tagAdd(g, 'galata', Sim.addBld(g, 1, 'tower', f.x, f.y, true)); }
      spawn(g, 1, 'musketeer', 6, ex + de.dx * 7, ey + de.dy * 5); spawn(g, 1, 'inf', 8, ex + de.dx * 8, ey + de.dy * 3); spawn(g, 1, 'archer', 6, ex + de.dx * 6, ey + de.dy * 6);
    },
    objs: [{ id: 'g', text: 'Galata hattını yık: Tabya ve 2 kule', prog: g => [(g.camp.tags.galata || []).length - tagAlive(g, 'galata').length, Math.max(1, (g.camp.tags.galata || []).length)] }],
    script: [
      { at: 3, do: g => say(g, 'Zağanos Paşa', 'Tabya sağlam ama toplarımız menzilde onu döver. Tüfekliler topları korusun.') },
      { at: 180, do: g => { say(g, 'Gözcü', 'Cenevizli paralı askerler saldırıda!'); raid(g, 1, [['musketeer', 6], ['hcav', 3], ['inf', 5]], 0); } },
      { at: 380, do: g => { say(g, 'Gözcü', 'Bir dalga daha!'); raid(g, 1, [['musketeer', 8], ['hcav', 4], ['siege', 2]], 0); } }
    ]
  },
  {
    id: 'karsi', name: 'Karşı Saldırı', date: '18 Mayıs 1453', civ: 'osmanli', map: 'vadi', diff: 'zor', ai: false,
    brief: [
      'Elli gün geçti, surlar henüz düşmedi. Bizans son umudunu bir karşı saldırıya bağladı: Gece karanlığında kuşatma hatlarına vurup topları yok etmek.',
      'Kampınız hazır: Şehir Merkezi, kışla, kuleler, bir Tabya ve küçük bir ordu. On iki dakika boyunca dayanın. Dalgalar giderek büyüyecek; ekonominizi büyütüp savunmanızı güçlendirin.'
    ],
    outro: 'Karşı saldırı kırıldı! Bizans\'ın son yedekleri de eridi. Artık yalnız son hücum kaldı.',
    setup(g) {
      const o = g.owners[0]; o.age = 1; give(g, 0, { f: 500, w: 700, g: 500, i: 100 });
      const me = o.start, d = dirOf(g, 0), cx = me.x + 1.5, cy = me.y + 1.5;
      const put = (type, ox, oy, sz) => { const f = findFree(g, cx + d.dx * ox, cy + d.dy * oy, sz); if (f) Sim.addBld(g, 0, type, f.x, f.y, true); };
      put('house', 5, -2, 2); put('house', 8, 1, 2); put('barracks', 7, 6, 3); put('tower', 10, 8, 2); put('tower', 12, 4, 2); put('fortress', 12, 9, 3); put('stable', 3, 9, 3);
      spawn(g, 0, 'inf', 10, cx + d.dx * 9, cy + d.dy * 6); spawn(g, 0, 'musketeer', 6, cx + d.dx * 8, cy + d.dy * 8); spawn(g, 0, 'archer', 6, cx + d.dx * 6, cy + d.dy * 7);
    },
    objs: [{ id: 's', text: 'Karşı saldırıya dayan: 12:00', prog: g => [Math.min(720, Math.floor(g.time)), 720], time: true, text2: g => 'Karşı saldırıya dayan: ' + mm(Math.max(0, 720 - g.time)) }],
    script: [
      { at: 3, do: g => say(g, 'Sultan Mehmed', 'Gece saldırısı gelecek. Kuleleri ve Tabyayı koruyun, askerleri bir arada tutun.') },
      { at: 90, do: g => raid(g, 1, [['inf', 6], ['archer', 4]], 0) },
      { at: 190, do: g => { say(g, 'Gözcü', 'Meşaleler görünüyor, süvari geliyor!'); raid(g, 1, [['cav', 5], ['hcav', 2], ['inf', 6]], 0); } },
      { at: 300, do: g => raid(g, 1, [['hcav', 4], ['musketeer', 6], ['inf', 6]], 0) },
      { at: 420, do: g => { say(g, 'Gözcü', 'Bizans toplarla geliyor!'); raid(g, 1, [['siege', 2], ['hcav', 4], ['musketeer', 8], ['inf', 6]], 0); } },
      { at: 540, do: g => raid(g, 1, [['hcav', 6], ['musketeer', 10], ['inf', 8], ['archer', 6]], 0) },
      { at: 640, do: g => { say(g, 'Gözcü', 'Son yedekler! Dayanın!'); raid(g, 1, [['hcav', 8], ['musketeer', 12], ['siege', 3], ['inf', 10]], 0); } }
    ]
  }
];

const ORDER = ['edirne', 'dokum', 'rumeli', 'kesif', 'halic', 'kizak', 'galata', 'sur', 'karsi', 'fetih'];
MISSIONS.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));

/* ---------- motor ---------- */
function create(idx, opts) {
  opts = opts || {};
  const m = MISSIONS[idx];
  const g = Sim.create({ civs: [m.civ, m.civ === 'osmanli' ? 'bizans' : 'osmanli'], difficulty: m.diff, map: m.map, seed: opts.seed, env: { dayNight: false, weather: false } });
  g.camp = { id: m.id, idx, fired: {}, done: {}, tags: {}, state: {}, acc: 0 };
  g.owners[1].ai = !!m.ai;
  m.setup(g);
  return g;
}
function status(g) {
  const m = MISSIONS[g.camp.idx];
  return m.objs.map(o => { const p = o.prog(g), done = !!g.camp.done[o.id]; return { id: o.id, text: o.text2 ? o.text2(g) : o.text, done, cur: Math.min(p[0], p[1]), max: p[1], info: !!o.info, time: !!o.time }; });
}
function tick(g) {
  const C = g.camp; if (!C || g.winner >= 0) return;
  C.acc = g.time - (C.last || 0); if (C.acc < 0.5) return; C.last = g.time;
  const m = MISSIONS[C.idx];
  m.script.forEach((s, i) => { if (!C.fired[i] && g.time >= s.at) { C.fired[i] = 1; s.do(g); } });
  for (const o of m.objs) {
    const p = o.prog(g), ok = p[0] >= p[1];
    if (o.info) continue;
    if (ok && !C.done[o.id]) { C.done[o.id] = 1; g.events.push({ type: 'objdone', id: o.id, text: o.text }); }
  }
  const reasons = m.lose ? m.lose(g) : (!hasTc(g, 0) ? 'Şehir Merkezin yıkıldı.' : null);
  if (reasons) { g.winner = 1; g.events.push({ type: 'gameover', winner: 1, camp: true, reason: reasons }); return; }
  // zafer: bilgi amaçlı olmayan tüm hedefler bitti
  if (m.objs.every(o => o.info || C.done[o.id])) { g.winner = 0; g.events.push({ type: 'gameover', winner: 0, camp: true }); }
}
function missionOf(g) { return g.camp ? MISSIONS[g.camp.idx] : null; }
const Campaign = { MISSIONS, create, tick, status, missionOf, hasTc, tagAlive };
if (typeof module !== 'undefined' && module.exports) module.exports = Campaign; else root.Campaign = Campaign;
})(typeof window !== 'undefined' ? window : globalThis);
