/* Sultan & Basileus - oyun motoru (çizimden bağımsız; tarayıcıda ve Node'da çalışır) */
(function (root) {
'use strict';
const W = 64, H = 64;

const UNIT = {
  villager: { name: 'Köylü', hp: 30, atk: 3, range: 0.45, rate: 1.2, speed: 2.3, cost: { f: 50 }, time: 10, pop: 1, sight: 6, r: 0.28, armor: 0 },
  inf:      { name: 'Piyade', hp: 70, atk: 8, range: 0.45, rate: 1.0, speed: 2.0, cost: { f: 50, w: 30 }, time: 14, pop: 1, sight: 6, r: 0.32, armor: 1 },
  archer:   { name: 'Okçu', hp: 40, atk: 7, range: 5.5, rate: 1.2, speed: 2.1, cost: { w: 45, g: 30 }, time: 14, pop: 1, sight: 8, r: 0.3, armor: 0, hitsAir: true, airMul: 0.6 },
  cav:      { name: 'Süvari', hp: 100, atk: 10, range: 0.45, rate: 1.0, speed: 3.4, cost: { f: 70, g: 50 }, time: 18, pop: 2, sight: 8, r: 0.4, armor: 2 },
  engineer: { name: 'Mimar', hp: 40, atk: 2, range: 0.45, rate: 1.2, speed: 2.3, cost: { f: 40, w: 40, g: 20 }, time: 14, pop: 1, sight: 6, r: 0.28, armor: 0, detect: 3 },
  dog:      { name: 'Köpek', hp: 45, atk: 7, range: 0.45, rate: 0.9, speed: 3.9, cost: { f: 45 }, time: 10, pop: 1, sight: 8, r: 0.28, armor: 0, smell: 14, detect: 3.5 },
  spy:      { name: 'Casus', hp: 25, atk: 0, range: 0, rate: 1, speed: 3.8, cost: { f: 40, g: 60 }, time: 14, pop: 1, sight: 6, r: 0.26, armor: 0, stealth: true, detect: 3 },
  musketeer: { name: 'Tüfekçi', hp: 55, atk: 17, range: 6.5, rate: 2.2, speed: 1.9, cost: { f: 60, g: 45 }, time: 16, pop: 1, sight: 8, r: 0.3, armor: 0, age: 1, pierce: 0.5, hitsAir: true, airMul: 0.8 },
  mgun:     { name: 'Makineli', hp: 60, atk: 4.5, range: 6, rate: 0.25, speed: 1.8, cost: { f: 60, g: 70, i: 40 }, time: 20, pop: 2, sight: 8, r: 0.32, armor: 0, age: 2, hitsAir: true, airMul: 1.4 },
  armored:  { name: 'Zırhlı Araç', hp: 240, atk: 13, range: 5, rate: 0.8, speed: 3.9, cost: { w: 100, g: 80, i: 80 }, time: 30, pop: 3, sight: 7, r: 0.5, armor: 4, age: 2, vehicle: true },
  tank:     { name: 'Tank', hp: 450, atk: 34, range: 7, rate: 2.0, speed: 3.0, cost: { w: 150, g: 200, i: 150 }, time: 36, pop: 4, sight: 8, r: 0.58, armor: 6, age: 3, vehicle: true },
  heli:     { name: 'Helikopter', hp: 170, atk: 8, range: 5.5, rate: 0.45, speed: 4.4, cost: { g: 200, i: 120 }, time: 30, pop: 3, sight: 9, r: 0.5, armor: 1, age: 3, air: true, alt: 0.9, hitsAir: true, airMul: 1.2 },
  fighter:  { name: 'Savaş Uçağı', hp: 130, atk: 15, range: 5.5, rate: 0.6, speed: 6.5, cost: { g: 260, i: 150 }, time: 34, pop: 3, sight: 10, r: 0.5, armor: 1, age: 3, air: true, alt: 1.2, hitsAir: true, airMul: 2.0 },
  bomber:   { name: 'Bombardıman', hp: 220, atk: 45, range: 1.5, rate: 3.2, speed: 5.0, cost: { g: 320, i: 220 }, time: 42, pop: 4, sight: 8, r: 0.6, armor: 2, age: 3, air: true, alt: 1.2, bomb: true },
  iha:      { name: 'İHA', hp: 45, atk: 0, range: 0, rate: 1, speed: 6.2, cost: { g: 80, i: 40 }, time: 16, pop: 1, sight: 13, r: 0.35, armor: 0, age: 3, air: true, alt: 1.0 },
  siha:     { name: 'SİHA', hp: 80, atk: 20, range: 6.5, rate: 2.4, speed: 4.6, cost: { g: 210, i: 140 }, time: 30, pop: 2, sight: 10, r: 0.42, armor: 0, age: 3, air: true, alt: 1.0, missile: true },
  sniper:   { name: 'Keskin Nişancı', hp: 45, atk: 48, range: 10.5, rate: 3.4, speed: 1.8, cost: { f: 70, g: 110, i: 30 }, time: 22, pop: 1, sight: 11, r: 0.3, armor: 0, age: 2, pierce: 0.8 },
  rpg:      { name: 'Bazukacı', hp: 60, atk: 30, range: 5.5, rate: 2.6, speed: 1.7, cost: { f: 60, g: 70, i: 50 }, time: 20, pop: 1, sight: 7, r: 0.3, armor: 0, age: 2, pierce: 0.7, hitsAir: true, airMul: 0.7 },
  demo:     { name: 'C4 Uzmanı', hp: 40, atk: 0, range: 0, rate: 1, speed: 2.6, cost: { f: 50, g: 80, i: 40 }, time: 18, pop: 1, sight: 6, r: 0.28, armor: 0, age: 2, c4: true },
  medic:    { name: 'Sağlıkçı', hp: 40, atk: 0, range: 0, rate: 1, speed: 2.2, cost: { f: 60, g: 50 }, time: 16, pop: 1, sight: 7, r: 0.28, armor: 0, age: 1, heal: 7, healR: 3.2 },
  ltank:    { name: 'Hafif Tank', hp: 300, atk: 20, range: 6, rate: 1.4, speed: 4.2, cost: { w: 100, g: 110, i: 90 }, time: 26, pop: 3, sight: 8, r: 0.52, armor: 4, age: 2, vehicle: true },
  htank:    { name: 'Ağır Tank', hp: 800, atk: 50, range: 7.5, rate: 2.6, speed: 2.2, cost: { w: 200, g: 320, i: 260 }, time: 50, pop: 6, sight: 8, r: 0.7, armor: 9, age: 3, vehicle: true },
  howitzer: { name: 'Obüs', hp: 150, atk: 55, range: 12, rate: 4.5, speed: 1.8, cost: { w: 150, g: 220, i: 140 }, time: 36, pop: 4, sight: 7, r: 0.5, armor: 1, age: 3, siege: true },
  flak:     { name: 'Uçaksavar Aracı', hp: 200, atk: 6, range: 7.5, rate: 0.22, speed: 3.5, cost: { w: 120, g: 140, i: 110 }, time: 28, pop: 3, sight: 8, r: 0.5, armor: 3, age: 3, vehicle: true, hitsAir: true, airMul: 3.0, airOnly: true },
  hcav:     { name: 'Ağır Süvari', hp: 190, atk: 15, range: 0.45, rate: 1.1, speed: 3.0, cost: { f: 100, g: 90 }, time: 24, pop: 3, sight: 8, r: 0.46, armor: 5 },
  harcher:  { name: 'Atlı Okçu', hp: 70, atk: 7, range: 5.2, rate: 1.1, speed: 4.0, cost: { w: 50, g: 60 }, time: 18, pop: 2, sight: 9, r: 0.38, armor: 1, hitsAir: true, airMul: 0.5 },
  dragoon:  { name: 'Atlı Tüfekçi', hp: 95, atk: 16, range: 5.8, rate: 2.0, speed: 3.5, cost: { f: 80, g: 100 }, time: 22, pop: 2, sight: 9, r: 0.4, armor: 1, age: 1, pierce: 0.4, hitsAir: true, airMul: 0.7 },
  scout:    { name: 'Motorlu Keşif', hp: 150, atk: 4.5, range: 5.5, rate: 0.25, speed: 5.4, cost: { w: 70, g: 80, i: 50 }, time: 20, pop: 2, sight: 11, r: 0.42, armor: 2, age: 2, vehicle: true, hitsAir: true, airMul: 1.2 },
  raider:   { name: 'Hızlı Saldırı Aracı', hp: 280, atk: 24, range: 6.2, rate: 1.0, speed: 5.0, cost: { w: 100, g: 150, i: 120 }, time: 28, pop: 3, sight: 9, r: 0.5, armor: 3, age: 3, vehicle: true, hitsAir: true, airMul: 0.8 },
  hero:     { name: 'Komutan', hp: 420, atk: 20, range: 0.6, rate: 0.9, speed: 2.9, cost: { f: 250, g: 250 }, time: 45, pop: 3, sight: 9, r: 0.42, armor: 4, hero: true, auraR: 6 },
  siege:    { name: 'Top', hp: 120, atk: 40, range: 8, rate: 3.5, speed: 1.2, cost: { w: 150, g: 120 }, time: 30, pop: 3, sight: 7, r: 0.45, armor: 0, siege: true, age: 1 }
};
const BONUS = { harcher: { inf: 1.3, villager: 1.4, archer: 1.2 }, hcav: { archer: 1.7, musketeer: 1.3, siege: 1.6, villager: 1.5, mgun: 1.2 }, dragoon: { inf: 1.2, archer: 1.3, villager: 1.5 }, scout: { villager: 1.5, dog: 1.2 }, raider: { armored: 1.4, ltank: 1.2, scout: 1.3 }, sniper: { villager: 1.5, inf: 1.2, musketeer: 1.3, archer: 1.3, mgun: 1.2, rpg: 1.3, medic: 1.5 }, rpg: { armored: 2.2, ltank: 2.2, tank: 2.0, htank: 1.7, siege: 1.5, howitzer: 1.5, flak: 1.8 }, ltank: { inf: 1.3, archer: 1.3, villager: 1.5 }, htank: { armored: 1.3, ltank: 1.3, tank: 1.2 }, flak: {}, inf: { cav: 1.8 }, cav: { archer: 1.8, villager: 1.5 }, archer: { inf: 1.4 }, dog: { villager: 1.6, archer: 1.3 }, musketeer: { cav: 1.4, armored: 1.3 }, siege: { armored: 2.2 }, tank: { armored: 1.3, ltank: 1.3, siege: 1.5, howitzer: 1.5 } };

const BLD = {
  tc:       { name: 'Şehir Merkezi', desc: 'Köylü ve Mimar üretir; kaynakların teslim noktası; çağ atlama buradan yapılır. Yıkılırsa oyunu kaybedersin.', s: 3, hp: 1500, cost: {}, time: 60, pop: 15, train: ['villager', 'engineer', 'hero'], drop: true, atk: { atk: 6, range: 6, rate: 2 }, sight: 9 },
  house:    { name: 'Ev', desc: 'İşçi (köylü/mimar) sınırını +5, ordu (asker) sınırını +10 artırır. Şehir Merkezi 15 işçi ve 15 asker sağlar.', s: 2, hp: 300, cost: { w: 30 }, time: 12, pop: 5, sight: 3 },
  farm:     { name: 'Çiftlik', desc: 'Küçük, tükenmeyen yiyecek kaynağı; aynı anda 4 köylü çalışır. Birkaç tane kur.', s: 1, hp: 90, cost: { w: 50 }, time: 10, farm: true, sight: 3 },
  barracks: { name: 'Kışla', desc: 'Piyade, okçu, köpek, casus, sağlıkçı; çağlara göre tüfekçi, makineli, keskin nişancı, bazukacı ve C4 uzmanı üretir. Barut Çağına geçmek için şart.', s: 3, hp: 900, cost: { w: 120 }, time: 30, train: ['inf', 'archer', 'dog', 'spy', 'medic', 'musketeer', 'mgun', 'sniper', 'rpg', 'demo'], sight: 5 },
  stable:   { name: 'Ahır', desc: 'Süvari, atlı okçu, ağır süvari, atlı tüfekçi, motorlu keşif ve hızlı saldırı aracı üretir. Hızlı baskın birlikleri.', s: 3, hp: 900, cost: { w: 100, g: 40 }, time: 30, train: ['cav', 'harcher', 'hcav', 'dragoon', 'scout', 'raider'], sight: 5 },
  foundry:  { name: 'Top Dökümhanesi', desc: 'Top, zırhlı araç, hafif/ana/ağır tank, obüs ve uçaksavar aracı üretir. Modern Çağa geçmek için şart. Barut Çağı gerekir.', s: 3, hp: 1000, cost: { w: 150, g: 100 }, time: 40, train: ['siege', 'armored', 'ltank', 'tank', 'htank', 'howitzer', 'flak'], sight: 5, age: 1 },
  academy:  { name: 'Akademi', desc: '10 araştırma yapar (saldırı, zırh, ekonomi…). Sanayi Çağına geçmek için şart.', s: 3, hp: 800, cost: { w: 150, g: 100 }, time: 35, research: true, sight: 5 },
  fortress: { name: 'Tabya', desc: 'Çok sağlam, uzaktan ateş eden savunma kalesi. Barut Çağı gerekir.', s: 3, hp: 2200, cost: { w: 250, g: 150, i: 60 }, time: 60, atk: { atk: 15, range: 9, rate: 1.6 }, sight: 10, age: 1 },
  airfield: { name: 'Hava Üssü', desc: 'İHA, SİHA, savaş uçağı, helikopter ve bombardıman üretir. Modern Çağ gerekir.', s: 3, hp: 1000, cost: { w: 200, g: 250, i: 150 }, time: 50, train: ['iha', 'siha', 'fighter', 'heli', 'bomber'], sight: 6, age: 3 },
  sam:      { name: 'Uçaksavar', desc: 'Yalnız hava birimlerini vurur. Modern Çağ gerekir.', s: 2, hp: 600, cost: { w: 120, g: 150, i: 100 }, time: 30, atk: { atk: 32, range: 11, rate: 1.3, airOnly: true }, sight: 11, age: 3 },
  radar:    { name: 'Yerel Radar', desc: 'Çevresindeki ~13 karelik bölgeyi sürekli aydınlatır, 12 kare içindeki casusları açığa çıkarır. Düşman casusu dokunursa patlar. Sanayi Çağı gerekir.', s: 2, hp: 400, cost: { w: 100, g: 120, i: 60 }, time: 28, sight: 13, age: 2, radarR: 12 },
  gradar:   { name: 'Küresel Radar İstasyonu', desc: 'Tüm haritayı aydınlatır. Düşman casusu içine girip patlatırsa harita yeniden sisle kaplanır; yenisini kurana kadar yalnız birimlerin ve binaların gördüğü yer açık kalır. Modern Çağ gerekir.', s: 3, hp: 700, cost: { w: 250, g: 400, i: 300 }, time: 60, sight: 6, age: 3, radarR: 18, global: true },
  bridge:   { name: 'Köprü', desc: 'Nehir/göl üstüne köprü kurar. Yalnız Mimar yapar.', s: 2, hp: 350, cost: { w: 40 }, time: 12, eng: true, sight: 2 },
  wall:     { name: 'Sur', desc: 'Sürükleyerek çekilen sur; düşmanı yavaşlatır. Yalnız Mimar yapar.', s: 1, hp: 350, cost: { w: 6 }, time: 5, eng: true, sight: 2 },
  gate:     { name: 'Kapı', desc: 'Surda kapı: yalnız senin birimlerin geçer. Yalnız Mimar yapar.', s: 1, hp: 500, cost: { w: 25 }, time: 8, eng: true, sight: 2 },
  mine:     { name: 'Mayın', desc: 'Düşmana görünmez mayın; basana büyük hasar. Köpek/mimar yakınından fark eder.', s: 1, hp: 20, cost: { g: 25 }, time: 4, eng: true, sight: 1 },
  tower:    { name: 'Gözetleme Kulesi', desc: 'Yakındaki düşmana ok atan gözetleme kulesi; görüş alanı da geniş.', s: 2, hp: 500, cost: { w: 80, g: 30 }, time: 25, atk: { atk: 9, range: 7, rate: 1.6 }, sight: 9 }
};

const RESDEF = {
  tree:  { name: 'Ağaç', res: 'w', amount: 100, s: 1, rate: 0.83, cap: 3 },
  berry: { name: 'Çalılık', res: 'f', amount: 150, s: 1, rate: 1.0, cap: 4 },
  iron:  { name: 'Demir Madeni', res: 'i', amount: 2500, s: 2, rate: 0.6, cap: 8 },
  gold:  { name: 'Altın Madeni', res: 'g', amount: 3000, s: 2, rate: 0.7, cap: 8 }
};

const CIVS = {
  osmanli: {
    name: 'Osmanlı', color: '#c8302b',
    names: { engineer: 'Mimar', musketeer: 'Tüfekli Yeniçeri', mgun: 'Makineli Tüfek', armored: 'Zırhlı Araç', inf: 'Yeniçeri', archer: 'Okçu', cav: 'Sipahi', hcav: 'Kapıkulu Süvarisi', harcher: 'Akıncı', dragoon: 'Sipahi Tüfekçi', scout: 'Motorlu Keşif', raider: 'Hızlı Saldırı Aracı', siege: 'Şahi Topu', hero: 'Fatih Sultan Mehmed', sniper: 'Keskin Nişancı', rpg: 'Bazukacı', demo: 'C4 Uzmanı', medic: 'Cerrah', ltank: 'Kaplan Hafif Tank', tank: 'Altay Tankı', htank: 'Yavuz Ağır Tank', howitzer: 'Fırtına Obüs', flak: 'Korkut Uçaksavar' },
    mods: { siege: { atk: 1.3 }, inf: { time: 0.85 }, harcher: { time: 0.85 } },
    bldHp: 1.0,
    power: { key: 'ferman', name: 'Topçu Ateşi', desc: 'Seçilen bölgeye ağır top bombardımanı (160 hasar, 3.5 kare).', kind: 'blast', radius: 3.5, dmg: 160, delay: 1.6, cd: 140 },
    tag: 'Güçlü kuşatma ve hızlı piyade üretimi.'
  },
  bizans: {
    name: 'Bizans', color: '#6a3fb0',
    names: { engineer: 'Mühendis', musketeer: 'Kastron Tüfekçisi', mgun: 'Makineli Tüfek', armored: 'Zırhlı Araç', inf: 'Skutatos', archer: 'Toksotes', cav: 'Hafif Süvari', hcav: 'Katafrakt', harcher: 'Atlı Toksotes', dragoon: 'Atlı Tüfekçi', scout: 'Motorlu Keşif', raider: 'Hızlı Saldırı Aracı', siege: 'Mancınık', hero: 'XI. Konstantinos', sniper: 'Keskin Nişancı', rpg: 'Bazukacı', demo: 'C4 Uzmanı', medic: 'İatros', ltank: 'T-72', tank: 'T-90', htank: 'T-14 Armata', howitzer: '2S19 Msta Obüs', flak: 'Tunguska' },
    mods: { cav: { hp: 1.3 }, hcav: { hp: 1.25 }, inf: { armor: 1 } },
    bldHp: 1.25,
    power: { key: 'grek', name: 'Grek Ateşi', desc: 'Seçilen bölgede 8 sn yanan ateş denizi (saniyede 25 hasar).', kind: 'zone', radius: 3, dps: 25, dur: 8, delay: 0.6, cd: 140 },
    tag: 'Dayanıklı binalar ve ağır zırhlı süvari.'
  }
};
const DIFF = {
  kolay:  { name: 'Kolay',  gather: 0.8,  train: 1.15, vil: 14, wave: 10, grow: 3, first: 420 },
  normal: { name: 'Normal', gather: 1.0,  train: 1.0,  vil: 18, wave: 8,  grow: 4, first: 330 },
  zor:    { name: 'Zor',    gather: 1.25, train: 0.85, vil: 22, wave: 7,  grow: 5, first: 260 },
  usta:   { name: 'Usta',   gather: 1.5,  train: 0.72, vil: 26, wave: 6,  grow: 6, first: 200 }
};

const AGES = [
  { name: 'Kale Çağı' },
  { name: 'Barut Çağı', cost: { f: 500, g: 250 }, time: 40, req: 'barracks', reqName: 'Kışla' },
  { name: 'Sanayi Çağı', cost: { f: 900, g: 600, i: 300 }, time: 60, req: 'academy', reqName: 'Akademi' },
  { name: 'Modern Çağ', cost: { f: 1500, g: 1000, i: 600 }, time: 75, req: 'foundry', reqName: 'Top Dökümhanesi' }
];
const TECH = {
  tools:     { name: 'Gelişmiş Aletler', age: 0, cost: { w: 150, g: 50 }, time: 30, desc: 'Toplama hızı +%20', gather: 1.2 },
  armor1:    { name: 'Demir Zırh', age: 0, cost: { f: 150, g: 100 }, time: 40, desc: 'Piyade, süvari ve köpek +1 zırh', mods: [{ types: ['inf', 'cav', 'dog'], add: { armor: 1 } }] },
  blades:    { name: 'Çelik Silahlar', age: 0, cost: { f: 120, g: 80 }, time: 35, desc: 'Piyade ve süvari +2 saldırı', mods: [{ types: ['inf', 'cav'], add: { atk: 2 } }] },
  sharp:     { name: 'Keskin Oklar', age: 0, cost: { w: 150, g: 100 }, time: 40, desc: 'Okçu +2 saldırı, +0.5 menzil', mods: [{ types: ['archer'], add: { atk: 2, range: 0.5 } }] },
  masonry:   { name: 'Taş İşçiliği', age: 0, cost: { w: 200, g: 50 }, time: 40, desc: 'Tüm binalar %25 daha dayanıklı', bldHp: 1.25 },
  horse:     { name: 'At Terbiyesi', age: 0, cost: { f: 200, g: 100 }, time: 40, desc: 'Süvari +%20 can, daha hızlı', mods: [{ types: ['cav', 'hcav', 'harcher', 'dragoon'], mul: { hp: 1.2 }, add: { speed: 0.3 } }] },
  siegeEng:  { name: 'Kuşatma Mühendisliği', age: 1, cost: { w: 200, g: 150, i: 50 }, time: 45, desc: 'Toplar +%25 saldırı ve +1 menzil; mimarlar %30 hızlı', mods: [{ types: ['siege'], mul: { atk: 1.25 }, add: { range: 1 } }], build: 1.3 },
  powder:    { name: 'Barut Kalitesi', age: 1, cost: { g: 200, i: 80 }, time: 45, desc: 'Tüfekçi +%25 saldırı; kule, tabya ve Şehir Merkezi +%20 atış', mods: [{ types: ['musketeer'], mul: { atk: 1.25 } }], defAtk: 1.2 },
  armor2:    { name: 'Çelik Zırh', age: 1, cost: { f: 250, g: 200, i: 100 }, time: 50, desc: 'Tüm askerler +1 zırh', mods: [{ types: ['inf', 'cav', 'musketeer', 'archer', 'dog'], add: { armor: 1 } }] },
  aero:      { name: 'Havacılık', age: 3, cost: { g: 300, i: 200 }, time: 55, desc: 'Hava araçları +%20 can, +%10 hız', mods: [{ types: ['heli', 'fighter', 'bomber', 'iha', 'siha'], mul: { hp: 1.2, speed: 1.1 } }] },
  guided:    { name: 'Güdümlü Mühimmat', age: 3, cost: { g: 350, i: 250 }, time: 55, desc: 'SİHA ve Tank +%20 saldırı; SİHA +1 menzil', mods: [{ types: ['siha'], mul: { atk: 1.2 }, add: { range: 1 } }, { types: ['tank', 'htank', 'ltank'], mul: { atk: 1.2 } }] },
  composite: { name: 'Kompozit Zırh', age: 3, cost: { g: 300, i: 300 }, time: 55, desc: 'Tank ve zırhlı araç +2 zırh', mods: [{ types: ['tank', 'armored', 'ltank', 'htank'], add: { armor: 2 } }] },
  mech:      { name: 'Motorlu Sanayi', age: 2, cost: { g: 300, i: 200 }, time: 55, desc: 'Zırhlı araç +%20 can ve +%15 hız; makineli +%20 saldırı', mods: [{ types: ['armored'], mul: { hp: 1.2, speed: 1.15 } }, { types: ['mgun'], mul: { atk: 1.2 } }] }
};
function mulberry(seed) {
  const f = function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  f.get = () => seed; f.set = v => { seed = v; };
  return f;
}
let GT = 0; // güncel oyun zamanı (calcDmg/follow gibi g almayan yerler için)

/* ---------- yardımcılar ---------- */
function inb(x, y) { return x >= 0 && y >= 0 && x < W && y < H; }
function blockedAt(g, x, y, owner) {
  const tx = Math.floor(x), ty = Math.floor(y);
  if (!inb(tx, ty)) return true;
  const i = ty * W + tx;
  if (g.occ[i] !== 0) return true;
  return owner !== undefined && g.gate[i] !== 0 && g.gate[i] - 1 !== owner;
}
function tileFree(g, i) { return g.occ[i] === 0 && g.ter[i] === 0 && g.gate[i] === 0; }
function regOf(g, x, y) { const tx = Math.floor(x), ty = Math.floor(y); return inb(tx, ty) ? g.reg[ty * W + tx] : 0; }
function computeRegions(g) {
  g.reg.fill(0); let id = 0; const stack = [];
  for (let i = 0; i < W * H; i++) {
    if (g.occ[i] !== 0 || g.reg[i]) continue;
    id++; g.reg[i] = id; stack.push(i);
    while (stack.length) {
      const c = stack.pop(), cx = c % W, cy = (c / W) | 0;
      for (const [dx, dy] of DIRS) {
        const nx = cx + dx, ny = cy + dy; if (!inb(nx, ny)) continue;
        const ni = ny * W + nx; if (g.occ[ni] !== 0 || g.reg[ni]) continue;
        if (dx && dy && (g.occ[cy * W + nx] !== 0 || g.occ[ny * W + cx] !== 0)) continue;
        g.reg[ni] = id; stack.push(ni);
      }
    }
  }
  g.regDirty = false;
}
function reachable(g, e, fx, fy) {
  const r = regOf(g, fx, fy); if (!r) return true;
  const rc = rectOf(e);
  for (let y = Math.floor(rc.y0) - 1; y <= Math.ceil(rc.y1); y++) for (let x = Math.floor(rc.x0) - 1; x <= Math.ceil(rc.x1); x++) if (inb(x, y) && g.reg[y * W + x] === r) return true;
  return false;
}
function rectOf(e) {
  if (e.k === 'u') return { x0: e.x - e.st.r, y0: e.y - e.st.r, x1: e.x + e.st.r, y1: e.y + e.st.r };
  const s = e.k === 'b' ? BLD[e.type].s : RESDEF[e.type].s;
  return { x0: e.tx, y0: e.ty, x1: e.tx + s, y1: e.ty + s };
}
function centerOf(e) {
  if (e.k === 'u') return { x: e.x, y: e.y };
  const s = e.k === 'b' ? BLD[e.type].s : RESDEF[e.type].s;
  return { x: e.tx + s / 2, y: e.ty + s / 2 };
}
function rectDist(a, b) {
  const dx = Math.max(0, a.x0 - b.x1, b.x0 - a.x1);
  const dy = Math.max(0, a.y0 - b.y1, b.y0 - a.y1);
  return Math.hypot(dx, dy);
}
function edist(a, b) { return rectDist(rectOf(a), rectOf(b)); }
function distPtRect(px, py, r) {
  const dx = Math.max(0, r.x0 - px, px - r.x1), dy = Math.max(0, r.y0 - py, py - r.y1);
  return Math.hypot(dx, dy);
}
function canAfford(o, cost) {
  return (o.res.f >= (cost.f || 0)) && (o.res.w >= (cost.w || 0)) && (o.res.g >= (cost.g || 0)) && (o.res.i >= (cost.i || 0));
}
function pay(o, cost, sign) {
  o.res.f -= sign * (cost.f || 0); o.res.w -= sign * (cost.w || 0); o.res.g -= sign * (cost.g || 0); o.res.i -= sign * (cost.i || 0);
}

/* ---------- yol bulma ---------- */
class Heap {
  constructor() { this.a = []; }
  push(f, i) {
    const a = this.a; a.push([f, i]); let c = a.length - 1;
    while (c > 0) { const p = (c - 1) >> 1; if (a[p][0] <= a[c][0]) break; [a[p], a[c]] = [a[c], a[p]]; c = p; }
  }
  pop() {
    const a = this.a; const top = a[0]; const last = a.pop();
    if (a.length) {
      a[0] = last; let i = 0;
      for (;;) {
        let l = i * 2 + 1, r = l + 1, m = i;
        if (l < a.length && a[l][0] < a[m][0]) m = l;
        if (r < a.length && a[r][0] < a[m][0]) m = r;
        if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m;
      }
    }
    return top;
  }
  get size() { return this.a.length; }
}
var DIRS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.4142], [1, -1, 1.4142], [-1, 1, 1.4142], [-1, -1, 1.4142]];

function nearestFree(g, x, y, maxR) {
  const cx = Math.floor(x), cy = Math.floor(y);
  for (let r = 0; r <= (maxR || 8); r++) {
    let best = null, bd = 1e9;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      const tx = cx + dx, ty = cy + dy;
      if (!inb(tx, ty) || g.occ[ty * W + tx] !== 0) continue;
      const d = Math.hypot(tx + 0.5 - x, ty + 0.5 - y);
      if (d < bd) { bd = d; best = { x: tx + 0.5, y: ty + 0.5 }; }
    }
    if (best) return best;
  }
  return null;
}

function los(g, x0, y0, x1, y1, owner) {
  const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy);
  if (d < 1e-6) return true;
  const n = Math.ceil(d / 0.2); const nx = -dy / d * 0.2, ny = dx / d * 0.2;
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = x0 + dx * t, y = y0 + dy * t;
    if (blockedAt(g, x, y, owner) || blockedAt(g, x + nx, y + ny, owner) || blockedAt(g, x - nx, y - ny, owner)) return false;
  }
  return true;
}

/* goal: {x,y} nokta  veya  {rect, reach} */
function makePath(g, sx, sy, goal, owner) {
  let rect, reach, pt = null;
  if (goal.rect) { rect = goal.rect; reach = goal.reach; }
  else {
    let gx = goal.x, gy = goal.y;
    if (blockedAt(g, gx, gy, owner)) { const f = nearestFree(g, gx, gy, 10); if (!f) return []; gx = f.x; gy = f.y; }
    pt = { x: gx, y: gy }; rect = { x0: gx, y0: gy, x1: gx, y1: gy }; reach = 0.45;
  }
  const stx = Math.max(0, Math.min(W - 1, Math.floor(sx))), sty = Math.max(0, Math.min(H - 1, Math.floor(sy)));
  const N = W * H, gc = new Float32Array(N).fill(1e9), from = new Int32Array(N).fill(-1), closed = new Uint8Array(N);
  const hf = (tx, ty) => Math.max(0, distPtRect(tx + 0.5, ty + 0.5, rect) - reach - 0.5);
  const isGoal = (tx, ty) => distPtRect(tx + 0.5, ty + 0.5, rect) <= reach + 0.5;
  const heap = new Heap(); const s = sty * W + stx;
  gc[s] = 0; heap.push(hf(stx, sty), s);
  let found = -1, best = s, bestH = hf(stx, sty), it = 0;
  while (heap.size && it++ < 6000) {
    const [, cur] = heap.pop();
    if (closed[cur]) continue; closed[cur] = 1;
    const cx = cur % W, cy = (cur / W) | 0;
    if (isGoal(cx, cy)) { found = cur; break; }
    const h = hf(cx, cy); if (h < bestH) { bestH = h; best = cur; }
    for (const [dx, dy, c] of DIRS) {
      const nx = cx + dx, ny = cy + dy;
      if (!inb(nx, ny) || blockedAt(g, nx, ny, owner)) continue;
      if (dx && dy && (blockedAt(g, nx, cy, owner) || blockedAt(g, cx, ny, owner))) continue;
      const ni = ny * W + nx; if (closed[ni]) continue;
      const ng = gc[cur] + c;
      if (ng < gc[ni]) { gc[ni] = ng; from[ni] = cur; heap.push(ng + hf(nx, ny), ni); }
    }
  }
  const end = found >= 0 ? found : best;
  const pts = []; for (let c = end; c !== -1 && c !== s; c = from[c]) pts.push({ x: (c % W) + 0.5, y: ((c / W) | 0) + 0.5 });
  pts.reverse();
  if (pt && found >= 0 && pts.length) pts[pts.length - 1] = { x: pt.x, y: pt.y };
  // düzeltme: doğrusal görüş ile kısalt
  const out = []; let cx = sx, cy = sy, i = 0;
  while (i < pts.length) {
    let j = pts.length - 1;
    while (j > i && !los(g, cx, cy, pts[j].x, pts[j].y, owner)) j--;
    out.push(pts[j]); cx = pts[j].x; cy = pts[j].y; i = j + 1;
  }
  return out;
}

/* ---------- oluşturma ---------- */
function unitStats(g, owner, type) {
  const o = g.owners[owner]; const base = UNIT[type];
  const st = Object.assign({}, base);
  const m = CIVS[o.civ].mods[type];
  if (m) {
    if (m.hp) st.hp = Math.round(st.hp * m.hp);
    if (m.atk) st.atk = st.atk * m.atk;
    if (m.armor) st.armor += m.armor;
    if (m.time) st.time = st.time * m.time;
  }
  for (const id of o.techs) {
    const t = TECH[id]; if (!t.mods) continue;
    for (const m of t.mods) {
      if (m.types.indexOf(type) < 0) continue;
      if (m.mul) for (const k in m.mul) st[k] *= m.mul[k];
      if (m.add) for (const k in m.add) st[k] += m.add[k];
    }
  }
  if (base.hero) { const ag = o.age || 0; st.hp *= 1 + 0.3 * ag; st.atk *= 1 + 0.25 * ag; st.armor += ag; }
  st.hp = Math.round(st.hp);
  return st;
}
function addUnit(g, owner, type, x, y) {
  const st = unitStats(g, owner, type);
  const u = { id: g.nextId++, k: 'u', type, owner, x, y, st, hp: st.hp, maxhp: st.hp, order: 'idle', path: [], cd: 0, stuck: 0,
    target: null, carry: 0, carryType: null, gs: null, acq: g.rnd() * 0.4, repath: 0, face: 0, leash: null, resume: null };
  g.ents.push(u); g.byId.set(u.id, u); return u;
}
function markOcc(g, e, val) {
  const s = e.k === 'b' ? BLD[e.type].s : RESDEF[e.type].s;
  for (let y = e.ty; y < e.ty + s; y++) for (let x = e.tx; x < e.tx + s; x++) if (inb(x, y)) { const i = y * W + x; g.occ[i] = (val === 0 && g.ter[i]) ? -1 : val; }
  g.regDirty = true;
}
function openBridge(g, b) {
  const s = BLD[b.type].s;
  for (let y = b.ty; y < b.ty + s; y++) for (let x = b.tx; x < b.tx + s; x++) if (inb(x, y)) g.occ[y * W + x] = 0;
  g.regDirty = true;
}
function addBld(g, owner, type, tx, ty, done) {
  const d = BLD[type]; const hp = Math.round(d.hp * CIVS[g.owners[owner].civ].bldHp * (g.owners[owner].bldHpMul || 1));
  const b = { id: g.nextId++, k: 'b', type, owner, tx, ty, hp: done ? hp : Math.round(hp * 0.1), maxhp: hp, done: !!done, progress: done ? 1 : 0,
    queue: [], rally: null, cd: 0, gatherer: 0, builders: 0, acq: 0 };
  g.ents.push(b); g.byId.set(b.id, b); markOcc(g, b, b.id);
  if (done) refreshPop(g);
  return b;
}
function addRes(g, type, tx, ty, amount) {
  const d = RESDEF[type];
  const r = { id: g.nextId++, k: 'r', type, owner: -1, tx, ty, amount: amount || d.amount, max: amount || d.amount };
  g.ents.push(r); g.byId.set(r.id, r); markOcc(g, r, r.id); return r;
}
const WORKER = { villager: 1, engineer: 1 }, ARMY_MAX = 300; // işçi sınırı: Ev başına 5; ordu sınırı: Ev başına ARMY_PER_HOUSE, Şehir Merkezi 15
const ARMY_PER_HOUSE = 10, QUEUE_MAX = 60;
function refreshPop(g) {
  g.owners.forEach(o => { o.pop = 0; o.popcap = 0; o.army = 0; o.armycap = 0; });
  for (const e of g.ents) {
    if (e.dead) continue;
    if (e.k === 'u') { if (WORKER[e.type]) g.owners[e.owner].pop += e.st.pop; else g.owners[e.owner].army = (g.owners[e.owner].army || 0) + 1; }
    else if (e.k === 'b' && e.done && BLD[e.type].pop) { g.owners[e.owner].popcap += BLD[e.type].pop; g.owners[e.owner].armycap += e.type === 'house' ? ARMY_PER_HOUSE : BLD[e.type].pop; }
  }
  for (const o of g.owners) { o.popcap = Math.min(o.popcap, 150); o.armycap = Math.min(o.armycap, ARMY_MAX); }
}
function canPlaceBridge(g, tx, ty) {
  let water = 0, anchor = false;
  for (let y = ty; y < ty + 2; y++) for (let x = tx; x < tx + 2; x++) {
    if (!inb(x, y)) return false;
    const i = y * W + x;
    if (g.ter[i] === 1) { if (g.occ[i] !== -1) return false; water++; }
    else { if (g.occ[i] !== 0 || g.gate[i]) return false; anchor = true; }
  }
  if (!water) return false;
  if (!anchor) {
    for (let k = 0; k < 2 && !anchor; k++) for (const [ax, ay] of [[tx + k, ty - 1], [tx + k, ty + 2], [tx - 1, ty + k], [tx + 2, ty + k]]) if (inb(ax, ay) && g.occ[ay * W + ax] === 0) { anchor = true; break; }
  }
  return anchor;
}
function canPlace(g, type, tx, ty, margin) {
  const s = BLD[type].s, m = margin || 0;
  if (!inb(tx, ty) || !inb(tx + s - 1, ty + s - 1)) return false;
  if (type === 'bridge') return canPlaceBridge(g, tx, ty);
  for (let y = ty - m; y < ty + s + m; y++) for (let x = tx - m; x < tx + s + m; x++) {
    if (!inb(x, y)) continue;
    const i = y * W + x, inside = x >= tx && x < tx + s && y >= ty && y < ty + s;
    if (inside ? !tileFree(g, i) : g.occ[i] !== 0) return false;
  }
  return true;
}
function freeSpotAround(g, e, towardX, towardY) {
  const r = rectOf(e); let best = null, bd = 1e9;
  for (let y = Math.floor(r.y0) - 2; y <= Math.ceil(r.y1) + 1; y++) for (let x = Math.floor(r.x0) - 2; x <= Math.ceil(r.x1) + 1; x++) {
    if (!inb(x, y) || g.occ[y * W + x] !== 0) continue;
    const d = Math.hypot(x + 0.5 - towardX, y + 0.5 - towardY);
    if (d < bd) { bd = d; best = { x: x + 0.5, y: y + 0.5 }; }
  }
  return best;
}

/* ---------- oyun kurulumu ---------- */

/* ---------- haritalar ---------- */
const MAPS = {
  klasik:    { name: 'Klasik Nehir', desc: 'Çapraz akan nehir, iki geçit ve göller. Kuzeybatı ↔ Güneydoğu.', s0: { x: 8, y: 8 } },
  tersnehir: { name: 'Ters Nehir', desc: 'Nehir ters yönde akar; kuzeydoğu ↔ güneybatı başlangıç.', s0: { x: W - 11, y: 8 } },
  bogaz:     { name: 'Boğaz', desc: 'Ortadan geçen geniş bir boğaz ve iki geçit. Kuzey ↔ Güney.', s0: { x: 30, y: 6 } },
  vadi:      { name: 'Nehir Vadisi', desc: 'Dikey akan nehir ve iki geçit. Batı ↔ Doğu.', s0: { x: 6, y: 30 } },
  goller:    { name: 'Göller Diyarı', desc: 'Birçok göl; kıyıları dolaşarak ilerlenir. Kuzeydoğu ↔ Güneybatı.', s0: { x: W - 11, y: 8 } },
  bozkir:    { name: 'Açık Bozkır', desc: 'Neredeyse hiç su yok; geniş açık arazi, hızlı çatışma.', s0: { x: 8, y: 8 } },
  adalar:    { name: 'Orta Göl', desc: 'Ortada kocaman bir göl; çevresinden dolaşılır. Kuzeybatı ↔ Güneydoğu.', s0: { x: 8, y: 8 } },
  capraz:    { name: 'Dört Bölge', desc: 'İki nehir çapraz kesişir, dört geçit var. Batı ↔ Doğu.', s0: { x: 6, y: 30 } }
};
const MAP_ORDER = ['klasik', 'tersnehir', 'bogaz', 'vadi', 'goller', 'bozkir', 'adalar', 'capraz'];
function startsOf(id) { const s0 = (MAPS[id] || MAPS.klasik).s0; return [{ x: s0.x, y: s0.y }, { x: W - 3 - s0.x, y: H - 3 - s0.y }]; }
function genTerrain(g, id, rnd, starts) {
  const near = (x, y, d) => starts.some(s => Math.hypot(x - (s.x + 1.5), y - (s.y + 1.5)) < d);
  const set = (x, y) => { if (inb(x, y) && !near(x, y, 12)) g.ter[y * W + x] = 1; };
  const lake = (cx, cy, rx, ry) => { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 < 1) set(x, y); };
  const fords = [];
  const ph = rnd() * 6.28, ph2 = rnd() * 6.28;
  if (id === 'klasik' || id === 'tersnehir') {
    const flip = id === 'tersnehir', fy = [16 + Math.floor(rnd() * 8), 38 + Math.floor(rnd() * 8)];
    for (let y = 0; y < H; y++) { let cx = (W - y) + Math.sin(y * 0.21 + ph) * 3.2 + Math.sin(y * 0.5 + ph2) * 1.1; if (flip) cx = W - cx; const half = 2.0 + Math.sin(y * 0.33 + ph2) * 0.6; for (let x = 0; x < W; x++) if (Math.abs(x + 0.5 - cx) <= half) set(x, y); }
    fy.forEach(f => fords.push((x, y) => y >= f - 1 && y <= f + 1));
    for (let k = 0; k < 4; k++) { const cx = 6 + rnd() * 52, cy = 6 + rnd() * 52, rx = 2 + rnd() * 2.5, ry = 2 + rnd() * 2.5; if (Math.abs((flip ? cx - cy : cx + cy - 64)) < 14 || starts.some(s => Math.hypot(cx - s.x, cy - s.y) < 17)) continue; lake(cx, cy, rx, ry); }
  } else if (id === 'bogaz') {
    for (let x = 0; x < W; x++) { const cy = 32 + Math.sin(x * 0.16 + ph) * 3, half = 3.3 + Math.sin(x * 0.3 + ph2) * 0.5; for (let y = 0; y < H; y++) if (Math.abs(y + 0.5 - cy) <= half) set(x, y); }
    [12 + Math.floor(rnd() * 8), 42 + Math.floor(rnd() * 8)].forEach(f => fords.push((x, y) => x >= f - 1 && x <= f + 1));
    for (let k = 0; k < 3; k++) { const cx = 6 + rnd() * 52, cy = rnd() < 0.5 ? 10 + rnd() * 8 : 46 + rnd() * 8; if (starts.some(s => Math.hypot(cx - s.x, cy - s.y) < 14)) continue; lake(cx, cy, 2 + rnd() * 2, 2 + rnd() * 2); }
  } else if (id === 'vadi') {
    for (let y = 0; y < H; y++) { const cx = 32 + Math.sin(y * 0.16 + ph) * 3, half = 2.6 + Math.sin(y * 0.3 + ph2) * 0.5; for (let x = 0; x < W; x++) if (Math.abs(x + 0.5 - cx) <= half) set(x, y); }
    [12 + Math.floor(rnd() * 8), 42 + Math.floor(rnd() * 8)].forEach(f => fords.push((x, y) => y >= f - 1 && y <= f + 1));
    for (let k = 0; k < 3; k++) { const cx = rnd() < 0.5 ? 10 + rnd() * 8 : 46 + rnd() * 8, cy = 6 + rnd() * 52; if (starts.some(s => Math.hypot(cx - s.x, cy - s.y) < 14)) continue; lake(cx, cy, 2 + rnd() * 2, 2 + rnd() * 2); }
  } else if (id === 'goller') {
    for (let k = 0; k < 9; k++) { const cx = 5 + rnd() * 54, cy = 5 + rnd() * 54, rx = 2.5 + rnd() * 3.5, ry = 2.5 + rnd() * 3.5; if (starts.some(s => Math.hypot(cx - (s.x + 1.5), cy - (s.y + 1.5)) < 17)) continue; lake(cx, cy, rx, ry); }
  } else if (id === 'bozkir') {
    for (let k = 0; k < 2; k++) { const cx = 16 + rnd() * 32, cy = 16 + rnd() * 32; if (starts.some(s => Math.hypot(cx - s.x, cy - s.y) < 20)) continue; lake(cx, cy, 2 + rnd() * 1.5, 2 + rnd() * 1.5); }
  } else if (id === 'adalar') {
    lake(32, 32, 11 + rnd() * 1.5, 11 + rnd() * 1.5);
    for (let k = 0; k < 3; k++) { const cx = 8 + rnd() * 48, cy = 8 + rnd() * 48; if (Math.hypot(cx - 32, cy - 32) < 18 || starts.some(s => Math.hypot(cx - s.x, cy - s.y) < 14)) continue; lake(cx, cy, 2 + rnd() * 2, 2 + rnd() * 2); }
  } else if (id === 'capraz') {
    const wd = 1.7 + rnd() * 0.4;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (Math.abs(x - y) <= wd || Math.abs(x + y - 63) <= wd) set(x, y);
    const jitter = Math.floor(rnd() * 4);
    for (const [fx, fy] of [[15 + jitter, 15 + jitter], [48 - jitter, 48 - jitter], [48 - jitter, 15 + jitter], [15 + jitter, 48 - jitter]]) fords.push((x, y) => Math.hypot(x - fx, y - fy) <= 3.2);
  }
  // iki oyuncuya adil olsun diye nokta simetri (arazi birleşimi)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x, j = (H - 1 - y) * W + (W - 1 - x); if (g.ter[i] || g.ter[j]) { g.ter[i] = 1; g.ter[j] = 1; } }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (!g.ter[i]) continue; if (fords.some(p => p(x, y) || p(W - 1 - x, H - 1 - y))) { g.ter[i] = 0; g.ford[i] = 1; } }
  // iki başlangıç arasında kara yolu olmalı: yoksa düz bir geçit aç
  const reach = () => { const seen = new Uint8Array(W * H), q = [], sx = Math.round(starts[0].x + 1.5), sy = Math.round(starts[0].y + 1.5); q.push(sy * W + sx); seen[sy * W + sx] = 1; while (q.length) { const i = q.pop(), x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (!inb(nx, ny)) continue; const k = ny * W + nx; if (seen[k] || g.ter[k]) continue; seen[k] = 1; q.push(k); } } return seen[Math.round(starts[1].y + 1.5) * W + Math.round(starts[1].x + 1.5)] === 1; };
  if (!reach()) { const a = starts[0], b = starts[1]; for (let k = 0; k <= 80; k++) { const x = Math.round(a.x + 1.5 + (b.x - a.x) * k / 80), y = Math.round(a.y + 1.5 + (b.y - a.y) * k / 80); for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) { const i = (y + oy) * W + x + ox; if (inb(x + ox, y + oy) && g.ter[i]) { g.ter[i] = 0; g.ford[i] = 1; } } } }
}
function mapPreview(id) { const g = { ter: new Uint8Array(W * H), ford: new Uint8Array(W * H) }, starts = startsOf(id); genTerrain(g, id, mulberry(12345), starts); return { ter: g.ter, ford: g.ford, starts }; }
function create(opts) {
  const seed = opts.seed || Math.floor(Math.random() * 1e9);
  const rnd = mulberry(seed);
  const mapId = opts.map === 'rastgele' ? MAP_ORDER[Math.floor(rnd() * MAP_ORDER.length)] : (MAPS[opts.map] ? opts.map : 'klasik');
  const g = { W, H, seed, mapId, diffKey: opts.difficulty || 'normal', opts: opts.env || { dayNight: false, weather: false }, env: null, ents: [], byId: new Map(), occ: new Int32Array(W * H), nextId: 1, time: 0, owners: [], fx: [], events: [],
    delayed: [], zones: [], winner: -1, rnd, visT: 0, diff: DIFF[opts.difficulty || 'normal'], sepT: 0,
    ter: new Uint8Array(W * H), ford: new Uint8Array(W * H), gate: new Uint8Array(W * H), reg: new Int32Array(W * H), regDirty: true };
  const civs = opts.civs || ['osmanli', 'bizans'];
  const starts = startsOf(mapId);
  for (let p = 0; p < 2; p++) {
    g.owners.push({ id: p, heroCd: 0, cryCd: 0, civ: civs[p], res: { f: 250, w: 300, g: 120, i: 0 }, age: 0, techs: [], ageUp: null, bldHpMul: 1, gatherMul: 1, buildMul: 1, defAtk: 1, pop: 0, popcap: 0, ai: p === 1, start: starts[p],
      explored: new Uint8Array(W * H), vis: new Uint8Array(W * H), powerCd: 60, aiState: { t: 0, wave: g.diff.wave, waves: 0, rr: 0 } });
  }
  // arazi: seçilen haritaya göre nehir/göl/geçit
  genTerrain(g, mapId, rnd, starts);
  for (let i = 0; i < W * H; i++) g.occ[i] = g.ter[i] ? -1 : 0;
  const free = (tx, ty, s) => { for (let y = ty; y < ty + s; y++) for (let x = tx; x < tx + s; x++) if (!inb(x, y) || g.occ[y * W + x]) return false; return true; };
  const farFromStarts = (x, y, d) => starts.every(s => Math.hypot(x - (s.x + 1.5), y - (s.y + 1.5)) > d);
  const cluster = (type, cx, cy, n, rad) => {
    const s = RESDEF[type].s; let tries = 0, placed = 0;
    while (placed < n && tries++ < n * 40) {
      const a = rnd() * 6.283, d = rnd() * rad;
      const x = Math.round(cx + Math.cos(a) * d), y = Math.round(cy + Math.sin(a) * d);
      if (free(x, y, s)) { addRes(g, type, x, y); placed++; }
    }
  };
  // başlangıç binaları ve kaynaklar
  starts.forEach((s, p) => {
    addBld(g, p, 'tc', s.x, s.y, true);
    const dx = s.x + 1.5 < W / 2 ? 1 : -1, dy = s.y + 1.5 < H / 2 ? 1 : -1;
    cluster('berry', s.x + 1.5 + dx * 2, s.y + 1.5 + dy * 7, 6, 2.5);
    addRes(g, 'gold', s.x + 1 + dx * 7, s.y + dy * 5 - (dy < 0 ? 1 : 0), 4000);
    cluster('tree', s.x + 1.5 - dx * 6, s.y + 1.5 + dy * 5, 14, 3.2);
    cluster('tree', s.x + 1.5 + dx * 8, s.y + 1.5 - dy * 4, 12, 3);
  });
  // harita geneli
  for (let i = 0; i < 14; i++) {
    const cx = 4 + rnd() * (W - 8), cy = 4 + rnd() * (H - 8);
    if (farFromStarts(cx, cy, 13)) cluster('tree', cx, cy, 8 + Math.floor(rnd() * 20), 3.5);
  }
  for (let i = 0; i < 5; i++) {
    const cx = 6 + rnd() * (W - 12), cy = 6 + rnd() * (H - 12);
    if (farFromStarts(cx, cy, 16)) cluster('berry', cx, cy, 4, 2);
  }
  [[14, 30], [30, 14], [24, 26], [49, 33], [33, 49], [39, 37]].forEach(([x, y]) => { x = Math.round(x); y = Math.round(y); if (free(x, y, 2)) addRes(g, 'gold', x, y, 3000); });
  // demir madenleri
  {
    const place = (cx, cy, amt) => { for (let r = 0; r < 7; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = Math.round(cx) + dx, y = Math.round(cy) + dy; if (free(x, y, 2) && free(x - 1, y - 1, 4)) { addRes(g, 'iron', x, y, amt); return true; } } return false; };
    starts.forEach(s => { const dx = s.x + 1.5 < W / 2 ? 1 : -1, dy = s.y + 1.5 < H / 2 ? 1 : -1; place(s.x + dx * 4, s.y + dy * 13, 3000); });
    [[26, 10], [10, 26], [38, 53], [53, 37], [20, 20], [44, 44]].forEach(([x, y]) => place(x, y, 2500));
    // ek maden yatakları: iki oyuncuya adil olsun diye nokta simetrik çiftler
    const pairs = (type, want, amt) => { let got = 0; for (let t = 0; t < 200 && got < want; t++) { const x = 6 + Math.floor(rnd() * (W - 14)), y = 6 + Math.floor(rnd() * (H - 14)), mx = W - 2 - x, my = H - 2 - y; if (!farFromStarts(x + 1, y + 1, 11) || !farFromStarts(mx + 1, my + 1, 11) || Math.hypot(x - mx, y - my) < 8) continue; if (free(x - 1, y - 1, 4) && free(mx - 1, my - 1, 4)) { addRes(g, type, x, y, amt); addRes(g, type, mx, my, amt); got++; } } };
    pairs('gold', 5, 3000); pairs('iron', 4, 2500);
  }
  // başlangıç birimleri
  starts.forEach((s, p) => {
    const dx = s.x + 1.5 < W / 2 ? 1 : -1, dy = s.y + 1.5 < H / 2 ? 1 : -1;
    for (let i = 0; i < 5; i++) addUnit(g, p, 'villager', s.x + 0.5 + i * 0.7, s.y + (dy > 0 ? 3.6 : -1));
    addUnit(g, p, 'cav', s.x + 1.5 + dx * 3, s.y + 1.5 + dy * 3);
  });
  refreshPop(g);
  computeRegions(g);
  updateVisibility(g);
  return g;
}

/* ---------- görüş ---------- */
/* ---------- gece-gündüz ve hava durumu (tamamen zamandan türetilir, kayda gerek yok) ---------- */
const DAY_LEN = 480, WSEG = 150;
function wHash(seed, k) { let h = (Math.imul(seed | 0, 374761393) + Math.imul(k, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function weatherKind(g, k) { if (k < 2 || !g.opts || g.opts.weather === false) return 'clear'; const r = wHash(g.seed, k); return r < 0.5 ? 'clear' : r < 0.74 ? 'rain' : r < 0.88 ? 'fog' : 'storm'; }
const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function envAt(g) {
  const o = g.opts || {};
  const tod = o.dayNight === false || !g.opts ? 0.5 : ((g.time + 120) / DAY_LEN) % 1;
  const L = Math.sin((tod - 0.25) * 6.2832), light = sstep(-0.25, 0.35, L);
  const phase = light < 0.22 ? 'night' : (tod > 0.2 && tod < 0.34) ? 'dawn' : (tod > 0.7 && tod < 0.84) ? 'dusk' : 'day';
  const k = Math.floor(g.time / WSEG), kind = weatherKind(g, k), within = g.time - k * WSEG; let ws = 0;
  if (kind !== 'clear') { ws = 1; if (weatherKind(g, k - 1) !== kind) ws = Math.min(ws, within / 14); if (weatherKind(g, k + 1) !== kind) ws = Math.min(ws, (WSEG - within) / 14); ws = Math.max(0, Math.min(1, ws)); }
  const wMul = kind === 'rain' ? 1 - 0.15 * ws : kind === 'fog' ? 1 - 0.3 * ws : kind === 'storm' ? 1 - 0.22 * ws : 1;
  return { tod, light, phase, weather: kind, ws, sightMul: (0.72 + 0.28 * light) * wMul };
}
function updateEnvEvents(g) {
  const e = g.env, p = g.envPrev || { phase: e.phase, weather: 'clear' };
  if (e.phase !== p.phase) g.events.push({ type: 'phase', phase: e.phase });
  if (e.weather !== p.weather && (e.ws > 0.35 || e.weather === 'clear')) { g.events.push({ type: 'weather', kind: e.weather }); p.weather = e.weather; }
  p.phase = e.phase; g.envPrev = p;
}
function updateVisibility(g) {
  g.owners.forEach(o => o.vis.fill(0));
  for (const e of g.ents) {
    if (e.dead || e.owner < 0) continue;
    const o = g.owners[e.owner];
    const sight = (e.k === 'u' ? e.st.sight : (BLD[e.type].sight || 4)) * ((e.k === 'b' && BLD[e.type].radarR) ? 1 : (g.env ? g.env.sightMul : 1));
    const c = centerOf(e), r = sight + (e.k === 'b' ? BLD[e.type].s / 2 : 0);
    const x0 = Math.max(0, Math.floor(c.x - r)), x1 = Math.min(W - 1, Math.ceil(c.x + r));
    const y0 = Math.max(0, Math.floor(c.y - r)), y1 = Math.min(H - 1, Math.ceil(c.y + r));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (Math.hypot(x + 0.5 - c.x, y + 0.5 - c.y) <= r) { o.vis[y * W + x] = 1; o.explored[y * W + x] = 1; }
    }
  }
  // Küresel Radar İstasyonu: tüm harita görünür
  for (const e of g.ents) if (!e.dead && e.k === 'b' && e.done && BLD[e.type].global) { const o = g.owners[e.owner]; o.vis.fill(1); o.explored.fill(1); }
}
function visibleTo(g, p, e) {
  const c = centerOf(e); const i = Math.floor(c.y) * W + Math.floor(c.x);
  return !!g.owners[p].vis[i];
}

/* ---------- hasar ---------- */
function calcDmg(a, t) {
  const s = a.st; let m = 1;
  if (t.k === 'b' || t.k === 'r') m = (s.siege || s.bomb) ? 2.5 : (a.type === 'villager' ? 0.2 : a.type === 'archer' ? 0.2 : a.type === 'sniper' ? 0.1 : a.type === 'rpg' ? 0.9 : a.type === 'ltank' ? 0.6 : a.type === 'htank' ? 0.8 : 0.5);
  else { m = (BONUS[a.type] && BONUS[a.type][t.type]) || 1; if (s.siege) m *= 0.6; if (t.st.air) m *= (s.airMul || 1); }
  const arm = t.k === 'u' ? (t.st.armor || 0) * (1 - (a.st.pierce || 0)) : (t.k === 'b' ? 1 : 0);
  const mm = (a.auraUntil > GT ? 1.2 : 1) * (a.cryUntil > GT ? 1.25 : 1) * (a.shakenUntil > GT ? 0.85 : 1);
  return Math.max(1, s.atk * m * mm - arm);
}
function damage(g, t, amt, byOwner) {
  if (t.dead) return;
  if (t.k === 'u' && t.auraUntil > GT) amt *= 0.88;
  // son kalan köylü ölümsüzdür: yoksa tamir/yeniden kuruluş mümkün olmaz
  if (t.k === 'u' && t.type === 'villager') {
    let n = 0; for (const e of g.ents) if (!e.dead && e.k === 'u' && e.owner === t.owner && e.type === 'villager') n++;
    if (n <= 1) { t.guard = true; const o = g.owners[t.owner]; if (!o.guardMsg || g.time - o.guardMsg > 40) { o.guardMsg = g.time; msg(g, t.owner, '🛡 Son köylü korumaya alındı — ölümsüz! Köyü yeniden kur.'); } return; }
  }
  t.hp -= amt;
  if (t.owner >= 0 && byOwner !== t.owner) {
    const o = g.owners[t.owner];
    if (o.lastAttack === undefined || g.time - o.lastAttack > 8) { g.events.push({ type: 'attacked', owner: t.owner, x: centerOf(t).x, y: centerOf(t).y }); }
    o.lastAttack = g.time;
  }
  if (t.hp <= 0) kill(g, t, byOwner);
}
function kill(g, e, by) {
  if (e.dead) return;
  e.dead = true;
  if (e.k === 'b') {
    markOcc(g, e, 0);
    if (e.type === 'gate') g.gate[e.ty * W + e.tx] = 0;
    if (e.type === 'bridge') for (const u of g.ents) if (u.k === 'u' && !u.dead && !u.st.air && blockedAt(g, u.x, u.y)) { const f = nearestFree(g, u.x, u.y, 8); if (f) { u.x = f.x; u.y = f.y; u.path = []; } }
    if (e.type !== 'mine') g.fx.push({ t: 'collapse', x: centerOf(e).x, y: centerOf(e).y, s: BLD[e.type].s, bt: e.type, life: 0.1, max: 0.1 });
    if (!e.sold) g.fx.push({ t: 'boom', x: centerOf(e).x, y: centerOf(e).y, life: e.type === 'mine' ? 0.4 : 0.8, max: e.type === 'mine' ? 0.4 : 0.8, big: e.type !== 'mine' });
    if (e.type === 'tc') { g.events.push({ type: 'tcdown', owner: e.owner }); checkWin(g); }
    if (BLD[e.type].global && !e.sold) msg(g, e.owner, '🌍 Küresel radar yok edildi — harita yeniden sisle kaplandı!');
    if (!e.done) { /* yarım bina: yarı iade */ }
  } else if (e.k === 'u') {
    if (e.type === 'hero') {
      const o = g.owners[e.owner]; o.heroCd = 90;
      for (const u of g.ents) if (!u.dead && u.k === 'u' && u.owner === e.owner && Math.hypot(u.x - e.x, u.y - e.y) < 12) u.shakenUntil = g.time + 15;
      msg(g, e.owner, '⚔ Komutanın düştü! Birlikler sarsıldı.'); msg(g, 1 - e.owner, '🏆 Düşman komutanı düştü!');
      g.fx.push({ t: 'blast', x: e.x, y: e.y, r: 1.6, life: 0.8, max: 0.8, delay: 0 });
    }
    g.fx.push({ t: 'death', x: e.x, y: e.y, ut: e.type, owner: e.owner, face: e.face, life: 0.1, max: 0.1 });
    g.fx.push({ t: 'boom', x: e.x, y: e.y, life: 0.35, max: 0.35 });
  }
  refreshPop(g);
}
function checkWin(g) {
  if (g.winner >= 0 || g.camp) return;
  for (let p = 0; p < 2; p++) {
    const has = g.ents.some(e => !e.dead && e.k === 'b' && e.owner === p && e.type === 'tc');
    if (!has) { g.winner = 1 - p; g.events.push({ type: 'gameover', winner: g.winner }); }
  }
}

/* ---------- komutlar ---------- */
function setPath(g, u, goal) { if (u.st.air) { u.path = [goal.rect ? { x: (goal.rect.x0 + goal.rect.x1) / 2, y: (goal.rect.y0 + goal.rect.y1) / 2 } : { x: goal.x, y: goal.y }]; u.stuck = 0; u.repath = 0.6; return; } u.path = makePath(g, u.x, u.y, goal, u.owner); u.stuck = 0; u.repath = 0.6; }
function clearOrder(u) { u.spyKind = null; u.hidden = false; u.order = 'idle'; u.path = []; u.target = null; u.gs = null; u.resume = null; }
function cmdMove(g, ids, x, y, amove) {
  const list = ids.map(i => g.byId.get(i)).filter(e => e && e.k === 'u' && !e.dead);
  list.forEach((u, i) => {
    const off = list.length > 1 ? { x: ((i % 5) - 2) * 0.55, y: (Math.floor(i / 5) - 1) * 0.55 } : { x: 0, y: 0 };
    let tx = Math.max(0.5, Math.min(W - 0.5, x + off.x)), ty = Math.max(0.5, Math.min(H - 0.5, y + off.y));
    clearOrder(u); u.order = amove ? 'amove' : 'move'; u.dest = { x: tx, y: ty }; u.leash = null;
    setPath(g, u, { x: tx, y: ty });
  });
}
function cmdStop(g, ids) { ids.forEach(i => { const u = g.byId.get(i); if (u && u.k === 'u') { clearOrder(u); u.leash = { x: u.x, y: u.y }; } }); }
function cmdAttack(g, ids, tid) {
  const t = g.byId.get(tid); if (!t || t.dead) return;
  ids.forEach(i => { const u = g.byId.get(i); if (u && u.k === 'u' && !u.dead && u.st.atk > 0) { clearOrder(u); u.order = 'attack'; u.target = tid; u.leash = null; } });
}
function cmdGather(g, ids, rid) {
  const r = g.byId.get(rid); if (!r || r.dead) return;
  ids.forEach(i => {
    const u = g.byId.get(i); if (!u || u.k !== 'u' || u.type !== 'villager' || u.dead) return;
    const rt = r.k === 'r' ? RESDEF[r.type].res : 'f';
    if (!reachable(g, r, u.x, u.y)) { if (u.owner === 0 && !g._noPath) { g._noPath = true; g.events.push({ type: 'msg', text: 'Oraya yol yok — nehir engel! Mimar köprü kurabilir.' }); } return; }
    clearOrder(u); u.order = 'gather'; u.target = rid; u.gs = 'go'; u.carryType = rt; u.rpos = centerOf(r);
  });
}
function cmdBuildHelp(g, ids, bid, repair) {
  ids.forEach(i => { const u = g.byId.get(i); if (u && (u.type === 'villager' || u.type === 'engineer') && !u.dead) { const was = u.order === 'gather' ? u.target : (u.order === 'build' ? u.prev : null); clearOrder(u); u.prev = was; u.repair = !!repair; u.order = 'build'; u.target = bid; u.gs = 'go'; } });
}
function cmdSpy(g, ids, bid, kind) {
  const b = g.byId.get(bid); if (!b || b.dead || b.k !== 'b' || !b.done || b.owner < 0) return false;
  if (kind === 'steal' && !BLD[b.type].research) return false;
  if (kind === 'loot' && b.type !== 'tc') return false;
  let n = 0;
  ids.forEach(i => { const u = g.byId.get(i); if (u && u.type === 'spy' && !u.dead && u.owner !== b.owner) { clearOrder(u); u.order = 'spy'; u.target = bid; u.spyKind = kind; u.gs = 'go'; n++; } });
  return n > 0;
}
function cmdDisguise(g, ids) {
  const sp = ids.map(i => g.byId.get(i)).filter(u => u && u.type === 'spy' && !u.dead);
  const on = sp.some(u => !u.disguised);
  sp.forEach(u => { u.disguised = on; });
  return sp.length > 0;
}
function cmdHeroCry(g, owner) {
  const o = g.owners[owner], h = g.ents.find(e => !e.dead && e.k === 'u' && e.owner === owner && e.type === 'hero');
  if (!h) return false;
  if (o.cryCd > 0) { msg(g, owner, 'Savaş narası ' + Math.ceil(o.cryCd) + ' sn sonra hazır.'); return false; }
  o.cryCd = 75; let n = 0;
  for (const u of g.ents) if (!u.dead && u.k === 'u' && u.owner === owner && Math.hypot(u.x - h.x, u.y - h.y) < 9) { u.cryUntil = g.time + 12; n++; }
  g.fx.push({ t: 'cry', x: h.x, y: h.y, r: 9, life: 0.9, max: 0.9 });
  msg(g, owner, '📯 Savaş narası! ' + n + ' birim 12 sn güçlendi.'); return true;
}
function cmdRepair(g, ids, bid) {
  const b = g.byId.get(bid); if (!b || b.dead || !b.done || b.hp >= b.maxhp) return;
  cmdBuildHelp(g, ids, bid, true);
}
function cmdReturn(g, ids) {
  ids.forEach(i => { const u = g.byId.get(i); if (u && u.type === 'villager' && u.carry > 0) { clearOrder(u); u.order = 'gather'; u.target = u.lastRes || null; u.gs = 'back'; } });
}
function cmdBuild(g, owner, ids, type, tx, ty) {
  const o = g.owners[owner], d = BLD[type];
  if (d && (d.age || 0) > o.age) { if (owner === 0) g.events.push({ type: 'msg', text: d.name + ' için ' + AGES[d.age].name + ' gerekli!' }); return null; }
  if (!d || !canPlace(g, type, tx, ty) || !canAfford(o, d.cost)) return null;
  if (owner === 0 && !g.owners[owner].explored[Math.min(H - 1, ty + 1) * W + Math.min(W - 1, tx + 1)] && d.s > 1) return null;
  const builders = ids.map(i => g.byId.get(i)).filter(u => u && !u.dead && (u.type === 'engineer' || (!d.eng && u.type === 'villager'))).map(u => u.id);
  if (d.eng && !builders.length) { if (owner === 0) g.events.push({ type: 'msg', text: d.name + ' sadece Mimar/Mühendis yapabilir!' }); return null; }
  pay(o, d.cost, 1);
  const b = addBld(g, owner, type, tx, ty, false);
  // üstteki birimleri kenara it
  for (const e of g.ents) if (e.k === 'u' && !e.dead && !e.st.air) {
    if (distPtRect(e.x, e.y, rectOf(b)) < 0.05 || (e.x >= tx && e.x <= tx + d.s && e.y >= ty && e.y <= ty + d.s)) {
      const f = freeSpotAround(g, b, e.x, e.y); if (f) { e.x = f.x; e.y = f.y; e.path = []; }
    }
  }
  cmdBuildHelp(g, builders, b.id);
  g.fx.push({ t: 'place', x: tx + d.s / 2, y: ty + d.s / 2, life: 0.5, max: 0.5 });
  return b;
}
function queuedPop(o, g) {
  let n = 0; for (const e of g.ents) if (!e.dead && e.k === 'b' && e.owner === o.id) for (const q of e.queue) if (WORKER[q.type]) n += UNIT[q.type].pop; return n;
}
function queuedArmy(g, o) { let n = 0; for (const e of g.ents) if (!e.dead && e.k === 'b' && e.owner === o.id) for (const q of e.queue) if (!WORKER[q.type]) n++; return n; }
function cmdTrain(g, bid, type) {
  const b = g.byId.get(bid); if (!b || b.dead || b.k !== 'b' || !b.done) return false;
  const d = BLD[b.type]; if (!d.train || d.train.indexOf(type) < 0) return false;
  const o = g.owners[b.owner], u = UNIT[type];
  if ((u.age || 0) > o.age) { if (b.owner === 0) g.events.push({ type: 'msg', text: u.name + ' için ' + AGES[u.age].name + ' gerekli!' }); return false; }
  if (type === 'hero') {
    if (g.ents.some(e => !e.dead && e.k === 'u' && e.owner === b.owner && e.type === 'hero') || g.ents.some(e => !e.dead && e.k === 'b' && e.owner === b.owner && e.queue.some(q => q.type === 'hero'))) { msg(g, b.owner, 'Zaten bir komutanın var.'); return false; }
    if (o.heroCd > 0) { msg(g, b.owner, 'Komutan ' + Math.ceil(o.heroCd) + ' sn sonra yeniden çağrılabilir.'); return false; }
  }
  if (b.queue.length >= QUEUE_MAX || !canAfford(o, u.cost)) return false;
  if (WORKER[type]) { if (o.pop + queuedPop(o, g) + u.pop > o.popcap) { if (b.owner === 0) g.events.push({ type: 'msg', text: 'İşçi sınırı doldu — Ev inşa et!' }); return false; } }
  else if (o.army + queuedArmy(g, o) >= o.armycap) { if (b.owner === 0) g.events.push({ type: 'msg', text: 'Ordu sınırı doldu — Ev inşa et! (Ev başına +' + ARMY_PER_HOUSE + ' asker)' }); return false; }
  pay(o, u.cost, 1); b.queue.push({ type, t: 0 }); return true;
}
function hasDone(g, owner, type) { return g.ents.some(e => !e.dead && e.k === 'b' && e.owner === owner && e.type === type && e.done); }
function msg(g, owner, text) { if (owner === 0) g.events.push({ type: 'msg', text }); }
function cmdAgeUp(g, owner) {
  const o = g.owners[owner], n = o.age + 1, a = AGES[n];
  if (!a || o.ageUp) return false;
  if (!hasDone(g, owner, a.req)) { msg(g, owner, a.name + ' için ' + a.reqName + ' gerekli!'); return false; }
  if (!canAfford(o, a.cost)) { msg(g, owner, 'Kaynak yetersiz!'); return false; }
  pay(o, a.cost, 1); o.ageUp = { to: n, t: 0, time: a.time };
  msg(g, owner, a.name + ' yolda…');
  return true;
}
function finishTech(g, owner, id) {
  const o = g.owners[owner], t = TECH[id];
  if (o.techs.indexOf(id) >= 0) return;
  o.techs.push(id);
  if (t.gather) o.gatherMul *= t.gather;
  if (t.build) o.buildMul *= t.build;
  if (t.defAtk) o.defAtk *= t.defAtk;
  if (t.bldHp) { o.bldHpMul *= t.bldHp; for (const e of g.ents) if (!e.dead && e.k === 'b' && e.owner === owner) { e.maxhp = Math.round(e.maxhp * t.bldHp); e.hp = Math.round(e.hp * t.bldHp); } }
  if (t.mods) for (const e of g.ents) if (!e.dead && e.k === 'u' && e.owner === owner) { const ns = unitStats(g, owner, e.type), ratio = e.hp / e.maxhp; e.st = ns; e.maxhp = ns.hp; e.hp = ns.hp * ratio; }
  g.events.push({ type: 'tech', owner, id });
}
function cmdResearch(g, bid, id) {
  const b = g.byId.get(bid), t = TECH[id];
  if (!b || b.dead || !b.done || !BLD[b.type].research || !t || b.research) return false;
  const o = g.owners[b.owner];
  if (o.techs.indexOf(id) >= 0) return false;
  if (g.ents.some(e => !e.dead && e.k === 'b' && e.owner === b.owner && e.research && e.research.id === id)) return false;
  if (t.age > o.age) { msg(g, b.owner, t.name + ' için ' + AGES[t.age].name + ' gerekli!'); return false; }
  if (!canAfford(o, t.cost)) { msg(g, b.owner, 'Kaynak yetersiz!'); return false; }
  pay(o, t.cost, 1); b.research = { id, t: 0 }; return true;
}
function cmdCancelResearch(g, bid) {
  const b = g.byId.get(bid); if (!b || !b.research) return;
  pay(g.owners[b.owner], TECH[b.research.id].cost, -1); b.research = null;
}
function cmdCancel(g, bid, idx) {
  const b = g.byId.get(bid); if (!b || !b.queue[idx]) return;
  const q = b.queue.splice(idx, 1)[0]; pay(g.owners[b.owner], UNIT[q.type].cost, -1);
}
// bina sat: bitmemişse tam, bitmişse %60 iade; kuyruktaki üretim/araştırma tam iade. Şehir Merkezi satılmaz.
const SELL_REFUND = 0.6;
function cmdSell(g, owner, bid) {
  const b = g.byId.get(bid); if (!b || b.dead || b.k !== 'b' || b.owner !== owner || b.type === 'tc') return false;
  const o = g.owners[owner], k = b.done ? SELL_REFUND : 1, cost = BLD[b.type].cost;
  for (const r of ['f', 'w', 'g', 'i']) if (cost[r]) o.res[r] += Math.floor(cost[r] * k);
  for (const q of b.queue || []) pay(o, UNIT[q.type].cost, -1);
  if (b.research) pay(o, TECH[b.research.id].cost, -1);
  b.queue = []; b.research = null; b.sold = true;
  for (const u of g.ents) if (!u.dead && u.k === 'u' && u.owner === owner && u.order === 'build' && u.target === b.id) clearOrder(u);
  kill(g, b, -1);
  msg(g, owner, BLD[b.type].name + ' satıldı');
  return true;
}
function cmdRally(g, bid, x, y, rid) {
  const b = g.byId.get(bid); if (!b || b.k !== 'b') return; b.rally = rid ? { rid } : { x, y };
}
function cmdPower(g, owner, x, y) {
  const o = g.owners[owner], p = CIVS[o.civ].power;
  if (o.powerCd > 0 || g.winner >= 0) return false;
  o.powerCd = p.cd;
  g.delayed.push({ t: p.delay, x, y, owner, kind: p.kind, p });
  g.fx.push({ t: 'warn', x, y, r: p.radius, life: p.delay, max: p.delay });
  return true;
}

/* ---------- birim yapay zekâsı ---------- */
function follow(g, u, dt) {
  let budget = Math.min(u.st.speed, u.cap || 99) * (u.disguised ? 0.7 : 1) * (u.cryUntil > GT ? 1.25 : 1) * dt;
  while (budget > 1e-6 && u.path.length) {
    const w = u.path[0], dx = w.x - u.x, dy = w.y - u.y, d = Math.hypot(dx, dy);
    if (d <= budget) { if (!tryMove(g, u, w.x, w.y)) { u.path.shift(); return u.path.length > 0; } budget -= d; u.path.shift(); }
    else { u.face = Math.atan2(dy, dx); tryMove(g, u, u.x + dx / d * budget, u.y + dy / d * budget); budget = 0; }
  }
  return u.path.length > 0;
}
function tryMove(g, u, nx, ny) {
  if (u.st.air) { u.x = Math.max(0.3, Math.min(W - 0.3, nx)); u.y = Math.max(0.3, Math.min(H - 0.3, ny)); u.stuck = 0; return true; }
  const o = u.owner;
  if (!blockedAt(g, nx, ny, o)) { u.x = nx; u.y = ny; u.stuck = Math.max(0, u.stuck - 1); return true; }
  if (!blockedAt(g, nx, u.y, o)) { u.x = nx; u.stuck++; return true; }
  if (!blockedAt(g, u.x, ny, o)) { u.y = ny; u.stuck++; return true; }
  u.stuck += 3; return false;
}
function directStep(g, u, px, py, dt) {
  const dx = px - u.x, dy = py - u.y, d = Math.hypot(dx, dy); if (d < 1e-6) return;
  const s = Math.min(d, Math.min(u.st.speed, u.cap || 99) * dt); u.face = Math.atan2(dy, dx);
  tryMove(g, u, u.x + dx / d * s, u.y + dy / d * s);
}
function inReach(u, t, reach) { return rectDist(rectOf(u), rectOf(t)) <= reach; }

function approach(g, u, t, reach, dt) {
  // hedefe yaklaş; menzile girdiyse true
  if (inReach(u, t, reach)) { u.path = []; return true; }
  if (u.st.air) { const c0 = centerOf(t); directStep(g, u, c0.x, c0.y, dt); return inReach(u, t, reach); }
  u.repath -= dt;
  const tr = rectOf(t); const tc = centerOf(t);
  if (t.k === 'u') {
    if (!u.pend || Math.hypot(tc.x - u.pend.x, tc.y - u.pend.y) > 1.2 || (u.repath <= 0 && !u.path.length)) {
      u.pend = { x: tc.x, y: tc.y }; u.path = makePath(g, u.x, u.y, { rect: tr, reach: reach * 0.9 }, u.owner); u.repath = 0.5;
    }
  } else if (!u.path.length && u.repath <= 0) {
    u.path = makePath(g, u.x, u.y, { rect: tr, reach: reach * 0.9 }, u.owner); u.repath = 0.6;
  }
  if (u.path.length) follow(g, u, dt);
  else { // yola çıkamadı, doğrudan yürü
    const px = Math.max(tr.x0, Math.min(u.x, tr.x1)), py = Math.max(tr.y0, Math.min(u.y, tr.y1));
    directStep(g, u, t.k === 'u' ? tc.x : px, t.k === 'u' ? tc.y : py, dt);
    u.repath -= dt * 0.5;
  }
  if (u.stuck > 12) { u.path = []; u.stuck = 0; u.repath = 0; }
  return inReach(u, t, reach);
}

function canTarget(a, t) {
  if (t.k !== 'u') return a.st.atk > 0;
  if (a.st.atk <= 0) return false;
  if (t.st.air) return !!a.st.hitsAir;
  if (a.st.airOnly) return false;
  return true;
}
// gizli birimi (casus) gözlemci fark edebilir mi? Kılıklı casus yalnız algılayıcıya (köpek/mimar) görünür
function spotted(obs, e, d) {
  if (!e.st || !e.st.stealth) return true;
  if (e.radar && e.radar[obs.owner]) return true;
  if (e.disguised) return d <= (obs.st && obs.st.detect ? obs.st.detect : 0.8);
  return d <= 2.5;
}
function findEnemy(g, u, radius) {
  let best = null, bd = 1e9, bestB = null, bbd = 1e9;
  for (const e of g.ents) {
    if (e.dead || e.owner < 0 || e.owner === u.owner || e.hidden) continue;
    if (e.k === 'b' && !e.done && e.progress < 0.01) continue;
    if (u.type === 'dog' && e.k !== 'u') continue;
    if (e.type === 'mine' || !canTarget(u, e)) continue;
    const d = edist(u, e);
    if (d > radius) continue;
    if (!spotted(u, e, d)) continue;
    if (e.k === 'u') { const pr = (e.type === 'villager' ? 3 : 0) + d; if (pr < bd) { bd = pr; best = e; } }
    else if (d < bbd) { bbd = d; bestB = e; }
  }
  return u.st.bomb ? (bestB || best) : (best || bestB);
}
function resKey(r) { return r.k === 'r' ? RESDEF[r.type].res : 'f'; }
function nodeCap(r) { return r.k === 'b' ? (BLD[r.type].farm ? 4 : 5) : RESDEF[r.type].cap; }
// "me" verilirse sıra numarasına göre ilk gelenler girer (herkes aynı anda reddedilmesin)
function nodeFull(g, r, me) {
  let n = 0;
  for (const u of g.ents) if (!u.dead && u.k === 'u' && u !== me && u.order === 'gather' && u.target === r.id && (!me || u.id < me.id)) n++;
  return n >= nodeCap(r);
}
function findDropoff(g, u) {
  let best = null, bd = 1e9;
  for (const e of g.ents) if (!e.dead && e.k === 'b' && e.owner === u.owner && e.done && BLD[e.type].drop) {
    const d = edist(u, e); if (d < bd) { bd = d; best = e; }
  }
  return best;
}
function findResNear(g, x, y, resKey, maxD, owner, me) {
  let best = null, bd = 1e9;
  for (const e of g.ents) {
    if (e.dead) continue;
    if (e.k === 'r' && RESDEF[e.type].res === resKey && e.amount > 0) {
      const d = Math.hypot(centerOf(e).x - x, centerOf(e).y - y); if (d < bd && d <= maxD && !nodeFull(g, e, me) && reachable(g, e, x, y)) { bd = d; best = e; }
    } else if (resKey === 'f' && e.k === 'b' && e.done && BLD[e.type].farm && e.owner === owner && !nodeFull(g, e, me) && reachable(g, e, x, y)) {
      const d = Math.hypot(centerOf(e).x - x, centerOf(e).y - y); if (d < bd && d <= maxD) { bd = d; best = e; }
    }
  }
  return best;
}

function updateUnit(g, u, dt) {
  u.cd = Math.max(0, u.cd - dt);
  if (u.st.heal) {
    u.healT = (u.healT || 0) - dt;
    if (u.healT <= 0) {
      u.healT = 0.5; let healed = false;
      for (const e of g.ents) if (!e.dead && e.k === 'u' && e.owner === u.owner && e !== u && e.hp < e.maxhp && !e.st.air && !e.st.vehicle && Math.hypot(e.x - u.x, e.y - u.y) <= u.st.healR) { e.hp = Math.min(e.maxhp, e.hp + u.st.heal * 0.5); healed = true; if (rndFx(g)) g.fx.push({ t: 'heal', x: e.x, y: e.y, life: 0.6, max: 0.6 }); }
      u.healing = healed;
    }
  }
  const gm = (g.owners[u.owner].ai ? g.diff.gather : 1) * (g.owners[u.owner].gatherMul || 1);
  switch (u.order) {
    case 'idle': {
      if (u.type !== 'villager' || u.st.atk > 0) {
        u.acq -= dt;
        if (u.acq <= 0 && u.type !== 'villager' && u.st.atk > 0) {
          u.acq = 0.4;
          const e = findEnemy(g, u, u.st.smell || u.st.sight * 0.8);
          if (e) { if (!u.leash) u.leash = { x: u.x, y: u.y }; u.order = 'attack'; u.target = e.id; u.auto = true; }
        }
      }
      break;
    }
    case 'move': {
      if (!follow(g, u, dt)) { u.order = 'idle'; u.leash = { x: u.x, y: u.y }; }
      else if (u.stuck > 12) { setPath(g, u, u.dest); }
      break;
    }
    case 'amove': {
      u.acq -= dt;
      if (u.acq <= 0 && u.type !== 'villager' && u.st.atk > 0) {
        u.acq = 0.35;
        const e = findEnemy(g, u, u.st.smell || u.st.sight * 0.9);
        if (e) { u.resume = u.dest; u.order = 'attack'; u.target = e.id; u.auto = true; break; }
      }
      if (!follow(g, u, dt)) { u.order = 'idle'; u.leash = { x: u.x, y: u.y }; }
      else if (u.stuck > 12) { setPath(g, u, u.dest); }
      break;
    }
    case 'attack': {
      const t = g.byId.get(u.target);
      if (!t || t.dead) {
        u.target = null;
        if (u.resume) { u.order = 'amove'; u.dest = u.resume; u.resume = null; setPath(g, u, u.dest); }
        else { u.order = 'idle'; u.path = []; }
        break;
      }
      if (u.auto && u.leash && Math.hypot(u.x - u.leash.x, u.y - u.leash.y) > (u.st.smell ? 22 : 13)) { clearOrder(u); u.order = 'move'; u.dest = u.leash; setPath(g, u, u.dest); break; }
      if (t.k === 'u' && t.owner !== u.owner && g.owners[u.owner].ai === false && !u.st.smell && !visibleTo(g, u.owner, t) && u.auto) { clearOrder(u); break; }
      if (t.k === 'u' && !canTarget(u, t)) { clearOrder(u); break; }
      const reach = u.st.range;
      if (approach(g, u, t, reach, dt)) {
        const c = centerOf(t); u.face = Math.atan2(c.y - u.y, c.x - u.x);
        if (u.cd <= 0) {
          u.cd = u.st.rate;
          const dmg = calcDmg(u, t);
          if (u.st.bomb) { g.fx.push({ t: 'bomb', x: c.x, y: c.y, x0: u.x, y0: u.y, life: 0.5, max: 0.5 }); g.fx.push({ t: 'blast', x: c.x, y: c.y, r: 1.5, life: 0.9, max: 0.9, delay: 0.4 }); }
          else if (u.st.range > 1) g.fx.push({ t: 'shot', x0: u.x, y0: u.y, x1: c.x, y1: c.y, life: u.st.siege ? 0.5 : 0.25, max: u.st.siege ? 0.5 : 0.25, siege: !!u.st.siege, ut: u.type });
          else g.fx.push({ t: 'hit', x: c.x, y: c.y, life: 0.15, max: 0.15, ut: u.type, big: t.k === 'b' });
          if (t.k === 'r') { /* kaynağa saldırı yok */ }
          else {
            damage(g, t, dmg, u.owner);
            if (u.st.bomb) for (const e of g.ents) if (!e.dead && e.k === 'u' && !e.hidden && !e.st.air && e !== t && e.owner !== u.owner && Math.hypot(e.x - c.x, e.y - c.y) < 1.7) damage(g, e, dmg * 0.6, u.owner);
            if (u.st.siege && t.k === 'u') for (const e of g.ents) if (!e.dead && e.k === 'u' && !e.hidden && !e.st.air && e !== t && e.owner !== u.owner && Math.hypot(e.x - t.x, e.y - t.y) < 1.4) damage(g, e, dmg * 0.5, u.owner);
          }
        }
      }
      break;
    }
    case 'gather': updateGather(g, u, dt, gm); break;
    case 'build': updateBuild(g, u, dt); break;
    case 'spy': updateSpy(g, u, dt); break;
  }
}

const RADAR_DETECT = 14, TOWER_DETECT = 4;
// gizli birimleri (casus) kimin fark ettiği: e.seen[owner] çizim/arayüz için, e.radar[owner] hedeflemeye yansır
function updateStealthSeen(g) {
  const vc = [0, 0]; for (const e of g.ents) if (!e.dead && e.k === 'u' && e.type === 'villager') vc[e.owner]++;
  for (const e of g.ents) if (!e.dead && e.k === 'u' && e.type === 'villager') e.guard = vc[e.owner] === 1;
  for (const e of g.ents) {
    if (e.dead || e.k !== 'u' || !e.st.stealth) continue;
    e.seen = [false, false]; e.radar = [false, false];
    for (const o of g.ents) {
      if (o.dead || o.owner < 0 || o.owner === e.owner) continue;
      const d = o.k === 'b' ? edist(o, e) : Math.hypot(o.x - e.x, o.y - e.y);
      if (o.k === 'b') {
        if (o.done && BLD[o.type].radarR && d <= BLD[o.type].radarR) { e.seen[o.owner] = true; e.radar[o.owner] = true; }
        else if (o.done && BLD[o.type].atk && d <= TOWER_DETECT) e.seen[o.owner] = true;
        else if (o.done && d <= 1.8) e.seen[o.owner] = true;
      } else if (spotted(o, e, d)) e.seen[o.owner] = true;
    }
    for (let p = 0; p < 2; p++) if (e.radar[p] && !(e.alerted && e.alerted[p])) { (e.alerted = e.alerted || [false, false])[p] = true; msg(g, p, '📡 Radar düşman casusu tespit etti!'); }
  }
}
function rndFx(g) { return g.rnd() < 0.5; }
function cmdC4(g, ids, bid) {
  const b = g.byId.get(bid); if (!b || b.dead || b.k !== 'b' || b.owner < 0) return false;
  let n = 0;
  ids.forEach(i => { const u = g.byId.get(i); if (u && u.type === 'demo' && !u.dead && u.owner !== b.owner) { clearOrder(u); u.order = 'spy'; u.target = bid; u.spyKind = 'c4'; u.gs = 'go'; n++; } });
  return n > 0;
}
function updateSpy(g, u, dt) {
  const b = g.byId.get(u.target);
  if (!b || b.dead || (!b.done && u.spyKind !== 'c4') || b.owner === u.owner) { clearOrder(u); return; }
  if (!approach(g, u, b, 0.6, dt)) return;
  const c = centerOf(b), o = g.owners[u.owner], v = g.owners[b.owner], kind = u.spyKind;
  g.fx.push({ t: 'place', x: c.x, y: c.y, life: 0.5, max: 0.5 });
  if (kind === 'c4') {
    g.fx.push({ t: 'boom', x: c.x, y: c.y, life: 0.8, max: 0.8, big: true }); g.fx.push({ t: 'blast', x: c.x, y: c.y, r: 2.2, life: 0.7, max: 0.7, delay: 0 });
    damage(g, b, 320, u.owner);
    for (const e of g.ents) if (!e.dead && e.k === 'u' && !e.st.air && e.owner !== u.owner && e.owner >= 0 && Math.hypot(e.x - c.x, e.y - c.y) < 2.2) damage(g, e, 60, u.owner);
    kill(g, u, -1); return;
  }
  if (kind === 'sabotage' && BLD[b.type].radarR) {
    g.fx.push({ t: 'blast', x: c.x, y: c.y, r: 2.4, life: 0.8, max: 0.8, delay: 0 });
    msg(g, u.owner, '🕵️ ' + BLD[b.type].name + ' patlatıldı!'); msg(g, b.owner, '⚠ Casus ' + BLD[b.type].name + ' binasını patlattı!');
    kill(g, u, -1); damage(g, b, 1e9, u.owner); return;
  }
  if (kind === 'sabotage') {
    b.sabo = 30; damage(g, b, 150, u.owner);
    msg(g, u.owner, BLD[b.type].name + ' sabote edildi! 30 sn çalışamaz.'); msg(g, b.owner, '⚠ Casus ' + BLD[b.type].name + ' binasını sabote etti!');
    g.fx.push({ t: 'boom', x: c.x, y: c.y, life: 0.6, max: 0.6 });
    kill(g, u, -1); return;
  }
  if (kind === 'steal') {
    const lack = v.techs.filter(id => o.techs.indexOf(id) < 0);
    if (!lack.length) { msg(g, u.owner, 'Çalınacak yeni teknoloji yok.'); clearOrder(u); return; }
    const id = lack[Math.floor(g.rnd() * lack.length)];
    finishTech(g, u.owner, id);
    msg(g, u.owner, '🕵️ Teknoloji çalındı: ' + TECH[id].name); msg(g, b.owner, '⚠ Casus teknoloji çaldı!');
    kill(g, u, -1); return;
  }
  if (kind === 'loot') {
    let got = 0;
    for (const k of ['f', 'w', 'g', 'i']) { const take = Math.min(Math.floor((v.res[k] || 0) * 0.2), 250); v.res[k] -= take; o.res[k] = (o.res[k] || 0) + take; got += take; }
    msg(g, u.owner, '🕵️ Hazine soyuldu: ' + got + ' kaynak'); msg(g, b.owner, '⚠ Casus hazineyi soydu!');
    u.disguised = false; clearOrder(u);
    const home = g.ents.find(e => !e.dead && e.k === 'b' && e.owner === u.owner && e.type === 'tc');
    if (home) { const hc = centerOf(home); u.order = 'move'; u.dest = { x: hc.x, y: hc.y + 2.5 }; setPath(g, u, u.dest); }
    return;
  }
  clearOrder(u);
}

function updateGather(g, u, dt, gm) {
  let r = g.byId.get(u.target);
  const key = u.carryType || 'w';
  if (!r || r.dead || (r.k === 'r' && r.amount <= 0)) {
    // kaynak bitti: yakındaki aynı türden boş kaynağa geç
    u.hidden = false; u.path = [];
    const c = r ? centerOf(r) : (u.rpos || u);
    const n = findResNear(g, c.x, c.y, key, 14, u.owner, u);
    if (n) { u.target = n.id; u.gs = 'go'; u.rpos = centerOf(n); } else clearOrder(u);
    return;
  }
  if (u.gs === 'go') {
    if (nodeFull(g, r, u)) {
      const c = centerOf(r); const n = findResNear(g, c.x, c.y, key, 14, u.owner, u);
      if (n && n !== r) { u.target = n.id; u.rpos = centerOf(n); u.path = []; } else if (!n) clearOrder(u);
      return;
    }
    if (approach(g, u, r, 0.5, dt)) { u.gs = 'work'; u.gt = 0; u.hidden = true; u.path = []; u.rpos = centerOf(r); }
  } else if (u.gs === 'work') {
    // düşman savaşçı yaklaşırsa içeridekiler kaçar (baskın bir işe yarasın)
    u.scan = (u.scan || 0) - dt;
    if (u.scan <= 0) {
      u.scan = 0.5;
      const rp = u.rpos || u;
      const foe = g.ents.find(e => !e.dead && e.k === 'u' && e.owner !== u.owner && e.owner >= 0 && !e.hidden && e.st.atk > 0 && Math.hypot(e.x - rp.x, e.y - rp.y) < 4);
      if (foe) {
        const home = g.ents.find(b => !b.dead && b.k === 'b' && b.owner === u.owner && b.type === 'tc');
        clearOrder(u);
        if (home) { const c = centerOf(home); u.order = 'move'; u.dest = { x: c.x, y: c.y + 2.5 }; setPath(g, u, u.dest); }
        if (u.owner === 0 && (g.owners[0].lastAttack === undefined || g.time - g.owners[0].lastAttack > 8)) { g.events.push({ type: 'attacked', owner: 0, x: rp.x, y: rp.y }); g.owners[0].lastAttack = g.time; }
        return;
      }
    }
    const rate = (r.k === 'r' ? RESDEF[r.type].rate : 0.6) * gm;
    u.gt += dt * rate;
    const o = g.owners[u.owner];
    while (u.gt >= 1) {
      u.gt -= 1; o.res[key]++;
      if (r.k === 'r') { r.amount--; if (r.amount <= 0) { r.dead = true; markOcc(g, r, 0); break; } }
    }
  } else clearOrder(u);
}

function updateBuild(g, u, dt) {
  const b = g.byId.get(u.target);
  const repairing = !!(b && !b.dead && b.done && u.repair && b.hp < b.maxhp);
  if (!b || b.dead || (b.done && !repairing)) {
    const was = b;
    u.repair = false;
    // bitti: çiftlikse orada çalış
    if (was && !was.dead && was.done && BLD[was.type].farm) { u.order = 'gather'; u.target = was.id; u.gs = 'go'; u.path = []; u.carryType = 'f'; u.rpos = centerOf(was); return; }
    // yakında aynı türden bitmemiş bina varsa (sur hattı gibi) ona geç
    if (was && !was.dead) {
      let nxt = null, nd = 7;
      for (const e of g.ents) if (!e.dead && e.k === 'b' && !e.done && e.owner === u.owner) { const d = edist(u, e) - (e.type === was.type ? 2 : 0); if (d < nd) { nd = d; nxt = e; } }
      if (nxt) { u.target = nxt.id; u.path = []; u.gs = 'go'; return; }
    }
    const back = u.prev && g.byId.get(u.prev); clearOrder(u);
    if (back && !back.dead && (back.k === 'b' || back.amount > 0)) cmdGather(g, [u.id], back.id);
    return;
  }
  if (approach(g, u, b, 0.5, dt)) {
    const c = centerOf(b); u.face = Math.atan2(c.y - u.y, c.x - u.x);
    if (repairing) { b.hp = Math.min(b.maxhp, b.hp + b.maxhp * 0.06 * dt); return; }
    const d = BLD[b.type], sp = (u.type === 'engineer' ? 1.6 : 1) * (g.owners[u.owner].buildMul || 1);
    b.progress = Math.min(1, b.progress + dt * sp / d.time);
    b.hp = Math.min(b.maxhp, b.hp + b.maxhp * 0.9 * dt * sp / d.time);
    if (b.progress >= 1) {
      b.done = true; b.hp = Math.max(b.hp, b.maxhp * 0.95);
      if (b.type === 'bridge') openBridge(g, b);
      else if (b.type === 'gate') { markOcc(g, b, 0); g.gate[b.ty * W + b.tx] = b.owner + 1; }
      else if (b.type === 'mine') markOcc(g, b, 0);
      refreshPop(g);
      g.events.push({ type: 'built', owner: b.owner, btype: b.type });
      g.fx.push({ t: 'place', x: c.x, y: c.y, life: 0.5, max: 0.5 });
    }
  }
}

/* ---------- bina güncelleme ---------- */
function updateBld(g, b, dt) {
  const d = BLD[b.type];
  if (!b.done) return;
  if (b.sabo > 0) { b.sabo -= dt; if (b.sabo <= 0) b.sabo = 0; else return; }
  const o = g.owners[b.owner];
  if (b.research) { const tc = TECH[b.research.id]; b.research.t += dt / (o.ai ? g.diff.train : 1); if (b.research.t >= tc.time) { finishTech(g, b.owner, b.research.id); b.research = null; } }
  if (b.queue.length) {
    const q = b.queue[0]; const st = unitStats(g, b.owner, q.type);
    if (WORKER[q.type] ? o.pop + UNIT[q.type].pop <= o.popcap : o.army <= o.armycap) {
      q.t += dt / (o.ai ? g.diff.train : 1);
      if (q.t >= st.time) {
        b.queue.shift();
        const p = freeSpotAround(g, b, b.rally && b.rally.x !== undefined ? b.rally.x : o.start.x + 20, b.rally && b.rally.y !== undefined ? b.rally.y : o.start.y + 20) || nearestFree(g, b.tx, b.ty + 4, 6);
        if (p) {
          const u = addUnit(g, b.owner, q.type, p.x, p.y); refreshPop(g);
          if (b.owner === 0) g.events.push({ type: 'trained', utype: q.type });
          if (b.rally) {
            if (b.rally.rid) { const r = g.byId.get(b.rally.rid); if (r && !r.dead && u.type === 'villager') cmdGather(g, [u.id], r.id); }
            else cmdMove(g, [u.id], b.rally.x, b.rally.y, false);
          }
        } else b.queue.unshift(q);
      }
    }
  }
  if (d.atk) {
    b.cd = Math.max(0, b.cd - dt); b.acq -= dt;
    if (b.cd <= 0 && b.acq <= 0) {
      b.acq = 0.3;
      let best = null, bd = 1e9;
      for (const e of g.ents) if (!e.dead && e.k === 'u' && !e.hidden && e.owner !== b.owner && e.owner >= 0 && spotted(b, e, edist(b, e)) && (!d.atk.airOnly || e.st.air)) {
        const dd = edist(b, e); if (dd <= d.atk.range && dd < bd) { bd = dd; best = e; }
      }
      if (best) {
        b.cd = d.atk.rate; const c = centerOf(b);
        g.fx.push({ t: 'shot', x0: c.x, y0: c.y, x1: best.x, y1: best.y, life: d.atk.airOnly ? 0.3 : 0.32, max: d.atk.airOnly ? 0.3 : 0.32, ut: d.atk.airOnly ? 'sam' : 'tower', tw: b.type, age: o.age });
        damage(g, best, d.atk.atk * (o.defAtk || 1), b.owner);
      }
    }
  }
}

/* ---------- ayrışma (birimler üst üste binmesin) ---------- */
function separate(g) {
  const cell = 2, cw = Math.ceil(W / cell), grid = new Map();
  const us = g.ents.filter(e => e.k === 'u' && !e.dead && !e.hidden && !e.st.air);
  for (const u of us) { const k = Math.floor(u.y / cell) * cw + Math.floor(u.x / cell); let a = grid.get(k); if (!a) grid.set(k, a = []); a.push(u); }
  for (const u of us) {
    const cx = Math.floor(u.x / cell), cy = Math.floor(u.y / cell);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const a = grid.get((cy + dy) * cw + cx + dx); if (!a) continue;
      for (const v of a) {
        if (v.id <= u.id) continue;
        const ddx = v.x - u.x, ddy = v.y - u.y, d = Math.hypot(ddx, ddy), min = (u.st.r + v.st.r) * 0.9;
        if (d < min) {
          const push = (min - d) * 0.5, nx = d > 1e-4 ? ddx / d : 1, ny = d > 1e-4 ? ddy / d : 0;
          const uMov = u.path.length > 0 || u.order === 'attack' || u.order === 'gather', vMov = v.path.length > 0 || v.order === 'attack' || v.order === 'gather';
          const fu = uMov && !vMov ? 0.2 : (!uMov && vMov ? 0.8 : 0.5), fv = 1 - fu;
          if (!blockedAt(g, u.x - nx * push * 2 * fu, u.y - ny * push * 2 * fu)) { u.x -= nx * push * 2 * fu; u.y -= ny * push * 2 * fu; }
          if (!blockedAt(g, v.x + nx * push * 2 * fv, v.y + ny * push * 2 * fv)) { v.x += nx * push * 2 * fv; v.y += ny * push * 2 * fv; }
        }
      }
    }
  }
}

/* ---------- ana güncelleme ---------- */
function update(g, dt) {
  if (g.winner >= 0) return;
  g.time += dt; GT = g.time;
  g.env = envAt(g); updateEnvEvents(g);
  for (const o of g.owners) {
    o.powerCd = Math.max(0, o.powerCd - dt); o.heroCd = Math.max(0, (o.heroCd || 0) - dt); o.cryCd = Math.max(0, (o.cryCd || 0) - dt);
    o.chk = (o.chk || 0) - dt;
    if (o.chk <= 0) { o.chk = 1; if (!g.ents.some(e => !e.dead && e.k === 'u' && e.owner === o.id && e.type === 'villager')) o.res.f = Math.min(100, o.res.f + 1); }
    if (o.ageUp) {
      o.ageUp.t += dt;
      if (o.ageUp.t >= o.ageUp.time) {
        o.age = o.ageUp.to; o.ageUp = null;
        o.bldHpMul *= 1.2; for (const e of g.ents) if (!e.dead && e.k === 'b' && e.owner === o.id) { e.maxhp = Math.round(e.maxhp * 1.2); e.hp = Math.round(e.hp * 1.2); }
        for (const hu of g.ents) if (!hu.dead && hu.k === 'u' && hu.owner === o.id && hu.type === 'hero') { const ns = unitStats(g, o.id, 'hero'), ratio = hu.hp / hu.maxhp; hu.st = ns; hu.maxhp = ns.hp; hu.hp = ns.hp * ratio; }
        const tc = g.ents.find(e => !e.dead && e.k === 'b' && e.owner === o.id && e.type === 'tc');
        if (tc) { const c = centerOf(tc); g.fx.push({ t: 'age', x: c.x, y: c.y, life: 1.2, max: 1.2, age: o.age }); }
        g.events.push({ type: 'age', owner: o.id, age: o.age });
      }
    }
  }
  g.stealthT = (g.stealthT || 0) - dt; if (g.stealthT <= 0) { g.stealthT = 0.3; updateStealthSeen(g); }
  g.auraT = (g.auraT || 0) - dt;
  if (g.auraT <= 0) { g.auraT = 0.5; for (const h of g.ents) if (!h.dead && h.k === 'u' && h.type === 'hero') for (const u of g.ents) if (!u.dead && u.k === 'u' && u.owner === h.owner && Math.hypot(u.x - h.x, u.y - h.y) <= h.st.auraR) u.auraUntil = g.time + 0.8; }
  for (const e of g.ents) { if (e.dead) continue; if (e.k === 'u') updateUnit(g, e, dt); else if (e.k === 'b') updateBld(g, e, dt); }
  // mayınlar
  for (const m of g.ents) {
    if (m.dead || m.k !== 'b' || m.type !== 'mine' || !m.done) continue;
    const c = centerOf(m);
    const trig = g.ents.find(u => !u.dead && u.k === 'u' && !u.hidden && !u.st.air && u.owner !== m.owner && Math.hypot(u.x - c.x, u.y - c.y) < 0.7);
    if (trig) {
      g.fx.push({ t: 'blast', x: c.x, y: c.y, r: 1.4, life: 0.5, max: 0.5 });
      for (const u of g.ents) if (!u.dead && u.k === 'u' && !u.hidden && !u.st.air && u.owner !== m.owner && Math.hypot(u.x - c.x, u.y - c.y) < 1.4) damage(g, u, 110, m.owner);
      kill(g, m, m.owner);
    }
  }
  if (g.regDirty) computeRegions(g);
  g.sepT += dt; if (g.sepT >= 0.05) { g.sepT = 0; separate(g); }
  // güçler
  for (let i = g.delayed.length - 1; i >= 0; i--) {
    const d = g.delayed[i]; d.t -= dt;
    if (d.t <= 0) {
      g.delayed.splice(i, 1);
      if (d.kind === 'blast') {
        g.fx.push({ t: 'blast', x: d.x, y: d.y, r: d.p.radius, life: 0.7, max: 0.7 });
        for (const e of g.ents) if (!e.dead && !e.hidden && !(e.k === 'u' && e.st.air) && e.owner >= 0 && e.owner !== d.owner) {
          const c = centerOf(e); if (Math.hypot(c.x - d.x, c.y - d.y) <= d.p.radius + (e.k === 'b' ? BLD[e.type].s / 2 : 0)) damage(g, e, d.p.dmg, d.owner);
        }
      } else g.zones.push({ x: d.x, y: d.y, r: d.p.radius, t: d.p.dur, dps: d.p.dps, owner: d.owner });
    }
  }
  for (let i = g.zones.length - 1; i >= 0; i--) {
    const z = g.zones[i]; z.t -= dt;
    if (z.t <= 0) { g.zones.splice(i, 1); continue; }
    for (const e of g.ents) if (!e.dead && !e.hidden && !(e.k === 'u' && e.st.air) && e.owner >= 0 && e.owner !== z.owner) {
      const c = centerOf(e); if (Math.hypot(c.x - z.x, c.y - z.y) <= z.r + (e.k === 'b' ? BLD[e.type].s / 2 : 0)) damage(g, e, z.dps * dt, z.owner);
    }
  }
  // yapay zekâ
  for (const o of g.owners) if (o.ai) { o.aiState.t -= dt; if (o.aiState.t <= 0) { o.aiState.t = 0.6; aiTick(g, o); } }
  // temizlik
  if (g.ents.some(e => e.dead)) {
    g.ents = g.ents.filter(e => { if (e.dead) { g.byId.delete(e.id); return false; } return true; });
    refreshPop(g);
  }
  for (let i = g.fx.length - 1; i >= 0; i--) { g.fx[i].life -= dt; if (g.fx[i].life <= 0) g.fx.splice(i, 1); }
  g.visT -= dt; if (g.visT <= 0) { g.visT = 0.25; updateVisibility(g); }
}

/* ---------- düşman yapay zekâsı ---------- */
function aiTick(g, o) {
  const p = o.id, S = o.aiState, diff = g.diff;
  const mine = g.ents.filter(e => !e.dead && e.owner === p);
  const units = mine.filter(e => e.k === 'u'), blds = mine.filter(e => e.k === 'b');
  const vils = units.filter(u => u.type === 'villager');
  const mil = units.filter(u => u.type !== 'villager');
  const tc = blds.find(b => b.type === 'tc'); if (!tc) return;
  const done = t => blds.filter(b => b.type === t && b.done);
  const all = t => blds.filter(b => b.type === t);
  const tcc = centerOf(tc);
  const enemyTc = g.ents.find(e => !e.dead && e.k === 'b' && e.owner !== p && e.type === 'tc');

  // inşaat
  const building = blds.filter(b => !b.done);
  const builders = vils.filter(v => v.order === 'build');
  const startBuild = (type) => {
    const d = BLD[type]; if (!canAfford(o, d.cost)) return false;
    const site = findSite(g, type, tcc.x, tcc.y, o, type === 'farm' ? 3 : 4);
    if (!site) return false;
    const cand = vils.filter(v => v.order !== 'build').sort((a, b) => Math.hypot(a.x - site.x, a.y - site.y) - Math.hypot(b.x - site.x, b.y - site.y));
    if (!cand.length) return false;
    const b = cmdBuild(g, p, [cand[0].id, cand[1] ? cand[1].id : cand[0].id], type, site.x, site.y);
    return !!b;
  };
  if (!building.length || building.length < 2) {
    const houses = all('house').length;
    if ((o.popcap - o.pop <= 4 || o.armycap - o.army <= 8) && houses < 28 && !building.some(b => b.type === 'house')) startBuild('house');
    else if (!all('barracks').length && vils.length >= 7) startBuild('barracks');
    else if (vils.length >= 9 && !findResNear(g, tcc.x, tcc.y, 'f', 16, p) && all('farm').length < 8 + Math.floor(vils.length / 3)) startBuild('farm');
    else if (all('farm').length < 4 && vils.length >= 11 && !building.length) startBuild('farm');
    else if (o.res.f < 120 && o.res.w > 120 && all('farm').length < 4 + Math.floor(vils.length / 3) && !building.some(b => b.type === 'farm')) startBuild('farm');
    else if (!all('stable').length && all('barracks').length && mil.length >= 3 && o.res.g >= 40) startBuild('stable');
    else if (!all('academy').length && g.time > 200 && vils.length >= 12 && o.res.w >= 150 && o.res.g >= 100) startBuild('academy');
    else if (o.age >= 1 && !all('foundry').length && o.res.g >= 100 && all('stable').length) startBuild('foundry');
    else if (o.age >= 3 && !all('airfield').length && o.res.w >= 200 && o.res.g >= 250 && o.res.i >= 150) startBuild('airfield');
    else if (o.age >= 3 && all('sam').length < 2 && o.res.w >= 120 && o.res.g >= 150 && o.res.i >= 100 && all('airfield').length) startBuild('sam');
    else if (o.age >= 1 && all('fortress').length < 1 && o.res.w >= 250 && o.res.g >= 150 && o.res.i >= 60 && g.time > 500) startBuild('fortress');
    else if (all('barracks').length < 2 + (o.age >= 2 ? 1 : 0) && g.time > 200 && vils.length >= 14) startBuild('barracks');
    else if (all('stable').length < 2 && o.age >= 1 && o.res.w >= 150 && o.res.g >= 100 && vils.length >= 18) startBuild('stable');
    else if (all('foundry').length < 2 && o.age >= 2 && o.res.w >= 150 && o.res.g >= 100 && o.res.i >= 80) startBuild('foundry');
    else if (all('tower').length < 2 && g.time > 300 && o.res.w > 260) startBuild('tower');
    else if (houses < 28 && o.res.w > 200 && (o.popcap - o.pop <= 12 || o.armycap - o.army <= 16) && !building.some(b => b.type === 'house')) startBuild('house');
  }
  // bitmemiş binaya boşta villager
  for (const b of building) if (!units.some(u => u.order === 'build' && u.target === b.id)) {
    const v = vils.find(v => v.order !== 'build'); if (v) cmdBuildHelp(g, [v.id], b.id);
  }

  // köylü görevlendirme
  const cnt = { f: 0, w: 0, g: 0, i: 0 };
  vils.forEach(v => { if (v.order === 'gather' && v.carryType) cnt[v.carryType]++; });
  const idle = vils.filter(v => v.order === 'idle');
  const ir = o.age >= 2 ? 0.24 : o.age >= 1 ? 0.18 : 0.06;
  let wf = o.res.w > 400 ? [0.2, 0.45, 0.3] : o.res.f > 400 ? [0.45, 0.2, 0.3] : [0.42, 0.3, 0.22], irr = ir;
  // çağ atlamaya yaklaşırken eksik kaynağa işçi kaydır
  const na = AGES[o.age + 1];
  if (na && !o.ageUp && g.time > 150 && hasDone(g, p, na.req)) {
    const df = Math.max(0, na.cost.f - o.res.f), dg = Math.max(0, na.cost.g - o.res.g), di = Math.max(0, (na.cost.i || 0) - o.res.i), tot = df + dg + di;
    if (tot > 150) { wf = [0.14, Math.max(0.1, 0.86 * df / tot), Math.max(0.1, 0.86 * dg / tot)]; irr = Math.max(ir, 0.86 * di / tot); }
  }
  const want = (n) => ({ w: Math.ceil(n * wf[0]), f: Math.ceil(n * wf[1]), g: Math.ceil(n * wf[2]), i: Math.ceil(n * irr) });
  const wnt = want(vils.length);
  for (const v of idle) {
    const order = ['w', 'f', 'g', 'i'].sort((a, b) => (cnt[b] - wnt[b] > 0 ? 1 : 0) - (cnt[a] - wnt[a] > 0 ? 1 : 0) || (wnt[b] - cnt[b]) - (wnt[a] - cnt[a]));
    let assigned = false;
    for (const key of order) {
      if ((key === 'g' || key === 'i') && cnt[key] >= 10) continue;
      const r = findResNear(g, tcc.x, tcc.y, key, 22, p);
      if (r) { cmdGather(g, [v.id], r.id); cnt[key]++; assigned = true; break; }
    }
    if (!assigned) { const r = findResNear(g, tcc.x, tcc.y, 'w', 60, p) || findResNear(g, tcc.x, tcc.y, 'g', 60, p); if (r) cmdGather(g, [v.id], r.id); }
  }

  // dengesizse köylü kaydır
  S.bal = (S.bal || 0) - 1;
  if (S.bal <= 0 && vils.length >= 8) {
    S.bal = 6;
    const short = ['f', 'g', 'i', 'w'].find(k => cnt[k] < wnt[k] - 1 && !((k === 'g' || k === 'i') && cnt[k] >= 10));
    const over = ['w', 'f', 'g', 'i'].find(k => cnt[k] > wnt[k] + 1);
    if (short && over && short !== over) {
      const v = vils.find(v => v.order === 'gather' && v.carryType === over);
      const r = v && findResNear(g, tcc.x, tcc.y, short, 24, p);
      if (r) cmdGather(g, [v.id], r.id);
    }
  }
  // üretim
  const tcs = done('tc');
  const vilTarget = Math.min(diff.vil + 5 * o.age + Math.floor(g.time / 180), diff.vil + 18);
  if (vils.length + tcs.reduce((s, b) => s + b.queue.length, 0) < vilTarget) tcs.forEach(b => { if (b.queue.length < 2) cmdTrain(g, b.id, 'villager'); });
  // çağ atlama için biriktir
  const nextAge = AGES[o.age + 1];
  const saving = !!(nextAge && !o.ageUp && hasDone(g, p, nextAge.req) && g.time > (o.age === 0 ? 240 : 420) && mil.length >= 8 && !canAfford(o, nextAge.cost));
  let mix = [['inf', 'barracks'], ['archer', 'barracks'], ['cav', 'stable'], ['dog', 'barracks'], ['inf', 'barracks'], ['archer', 'barracks'], ['hcav', 'stable']];
  mix = mix.concat([['harcher', 'stable']]);
  if (o.age >= 1) mix = mix.concat([['dragoon', 'stable']]);
  if (o.age >= 2) mix = mix.concat([['scout', 'stable']]);
  if (o.age >= 3) mix = mix.concat([['raider', 'stable'], ['raider', 'stable']]);
  if (o.age >= 1) mix = mix.concat([['musketeer', 'barracks'], ['siege', 'foundry'], ['musketeer', 'barracks']]);
  if (o.age >= 2) mix = mix.concat([['mgun', 'barracks'], ['armored', 'foundry'], ['armored', 'foundry']]);
  if (o.age >= 2) mix = mix.concat([['sniper', 'barracks'], ['rpg', 'barracks'], ['ltank', 'foundry'], ['medic', 'barracks']]);
  if (o.age >= 3) mix = mix.concat([['htank', 'foundry'], ['howitzer', 'foundry']]);
  if (o.age >= 3 && g.ents.filter(e => !e.dead && e.k === 'u' && e.owner !== p && e.owner >= 0 && e.st.air).length > 2) mix = mix.concat([['flak', 'foundry'], ['flak', 'foundry']]);
  if (o.age >= 3) mix = mix.concat([['tank', 'foundry'], ['fighter', 'airfield'], ['siha', 'airfield'], ['heli', 'airfield'], ['bomber', 'airfield'], ['tank', 'foundry']]);
  for (let tries = 0; tries < (saving ? 0 : 3); tries++) {
    const [ut, bt] = mix[S.rr % mix.length]; S.rr++;
    const prods = done(bt).filter(b => b.queue.length < 2);
    if (prods.length && vils.length >= 8) { const b = prods.sort((a, c) => a.queue.length - c.queue.length)[0]; if (cmdTrain(g, b.id, ut)) break; }
  }
  // çağ ve araştırma
  if (nextAge && !o.ageUp && canAfford(o, nextAge.cost) && hasDone(g, p, nextAge.req) && g.time > (o.age === 0 ? 200 : 360)) cmdAgeUp(g, p);
  for (const ac of done('academy')) if (!ac.research) {
    const order = ['tools', 'armor1', 'blades', 'sharp', 'masonry', 'horse', 'siegeEng', 'powder', 'armor2', 'mech', 'composite', 'guided', 'aero'];
    const id = order.find(k => o.techs.indexOf(k) < 0 && TECH[k].age <= o.age && canAfford(o, TECH[k].cost) && !all('academy').some(a2 => a2.research && a2.research.id === k));
    if (id && !saving) cmdResearch(g, ac.id, id);
  }
  // komutan: çağırır, savaşta narasını kullanır
  const hero = mil.find(u => u.type === 'hero');
  if (!hero && !(o.heroCd > 0) && o.age >= 1 && g.time > 200 && !saving && o.res.f >= 330 && o.res.g >= 330 && !tcs.some(b => b.queue.some(q => q.type === 'hero'))) { const tb = tcs.find(b => b.queue.length < 2); if (tb) cmdTrain(g, tb.id, 'hero'); }
  if (hero && !(o.cryCd > 0) && g.ents.some(e => !e.dead && e.k === 'u' && e.owner !== p && e.owner >= 0 && Math.hypot(e.x - hero.x, e.y - hero.y) < 8)) cmdHeroCry(g, p);
  // casusluk: arada bir casus üretip düşmanın önemli binasını sabote ettirir
  const spies = g.ents.filter(e => !e.dead && e.k === 'u' && e.owner === p && e.type === 'spy');
  if (!saving && g.time > 240 && !spies.length && g.time - (S.lastSpy || 0) > 150 && !done('barracks').some(b => b.queue.some(q => q.type === 'spy'))) {
    const bk = done('barracks').find(b => b.queue.length < 2);
    if (bk && cmdTrain(g, bk.id, 'spy')) S.lastSpy = g.time;
  }
  for (const sp of spies) if (sp.order === 'idle') {
    const foes = g.ents.filter(e => !e.dead && e.k === 'b' && e.done && e.owner >= 0 && e.owner !== p && e.type !== 'wall' && e.type !== 'bridge' && e.type !== 'mine');
    const pri = { gradar: 0, radar: 0, academy: 0, foundry: 1, barracks: 2, airfield: 1, stable: 3, tc: 4 };
    foes.sort((a, c) => (pri[a.type] === undefined ? 9 : pri[a.type]) - (pri[c.type] === undefined ? 9 : pri[c.type]));
    if (foes.length) { sp.disguised = true; cmdSpy(g, [sp.id], foes[Math.min(foes.length - 1, Math.floor(g.rnd() * 2))].id, 'sabotage'); }
  }
  // rally
  for (const b of done('barracks').concat(done('stable'), done('foundry'), done('airfield'))) if (!b.rally) b.rally = { x: tcc.x + (p ? -6 : 6), y: tcc.y + (p ? -6 : 6) };

  // savunma
  let threat = null;
  for (const e of g.ents) if (!e.dead && e.k === 'u' && e.owner !== p && e.owner >= 0 && Math.hypot(e.x - tcc.x, e.y - tcc.y) < 14) { threat = e; break; }
  if (threat) {
    mil.filter(u => u.order === 'idle' || u.order === 'move').forEach(u => cmdMove(g, [u.id], threat.x, threat.y, true));
    vils.filter(v => v.hp < v.maxhp * 0.5 && Math.hypot(v.x - threat.x, v.y - threat.y) < 6).forEach(v => cmdMove(g, [v.id], tcc.x, tcc.y, false));
  }
  // saldırı dalgası
  const army = mil.filter(u => u.order === 'idle' || u.order === 'move');
  if (!threat && enemyTc && g.time > diff.first - S.waves * 40 && army.length >= S.wave + 5 * o.age) {
    const ec = centerOf(enemyTc);
    army.forEach(u => cmdMove(g, [u.id], ec.x - 1, ec.y - 1, true));
    S.wave += diff.grow; S.waves++;
  }
  // gönderilmiş ama boşa çıkmış askerler
  mil.filter(u => u.order === 'idle' && S.waves > 0 && enemyTc && Math.hypot(u.x - centerOf(enemyTc).x, u.y - centerOf(enemyTc).y) < 8).forEach(u => cmdAttack(g, [u.id], enemyTc.id));
}
function findSite(g, type, cx, cy, o, margin) {
  const s = BLD[type].s; const dirx = o.id === 0 ? 1 : -1;
  const cands = [];
  for (let r = 4; r <= 16; r++) for (let a = 0; a < 16; a++) {
    const ang = a / 16 * 6.283;
    const tx = Math.round(cx + Math.cos(ang) * r - s / 2), ty = Math.round(cy + Math.sin(ang) * r - s / 2);
    const bias = (type === 'barracks' || type === 'stable' || type === 'foundry' || type === 'tower') ? -(Math.cos(ang) * dirx + Math.sin(ang) * dirx) * 2 : 0;
    cands.push({ tx, ty, score: r + bias + g.rnd() * 2 });
  }
  cands.sort((a, b) => a.score - b.score);
  for (const c of cands) if (canPlace(g, type, c.tx, c.ty, margin >= 1 ? 1 : 0)) return { x: c.tx, y: c.ty };
  return null;
}

function mineVisible(g, p, m) {
  if (m.owner === p) return true;
  const c = centerOf(m);
  return g.ents.some(u => !u.dead && u.k === 'u' && u.owner === p && u.st.detect && Math.hypot(u.x - c.x, u.y - c.y) <= u.st.detect);
}
/* ---------- kaydet / yükle ---------- */
function serialize(g) {
  const ents = g.ents.filter(e => !e.dead).map(e => JSON.parse(JSON.stringify(e)));
  const owners = g.owners.map(o => Object.assign(JSON.parse(JSON.stringify(Object.assign({}, o, { vis: null, explored: null }))), { explored: Array.from(o.explored) }));
  return { v: 1, seed: g.seed, mapId: g.mapId, rs: g.rnd.get(), time: g.time, nextId: g.nextId, winner: g.winner, diffKey: g.diffKey, opts: g.opts, visT: g.visT, sepT: g.sepT,
    camp: g.camp || null, ter: Array.from(g.ter), ford: Array.from(g.ford), gate: Array.from(g.gate), occ: Array.from(g.occ), delayed: g.delayed, zones: g.zones, ents, owners };
}
function deserialize(d) {
  const rnd = mulberry(d.seed); rnd.set(d.rs);
  const g = { W, H, seed: d.seed, mapId: d.mapId || 'klasik', diffKey: d.diffKey, opts: d.opts, env: null, ents: [], byId: new Map(), occ: Int32Array.from(d.occ), nextId: d.nextId, time: d.time, owners: [], fx: [], events: [],
    delayed: d.delayed || [], zones: d.zones || [], winner: d.winner, rnd, visT: 0, diff: DIFF[d.diffKey || 'normal'], sepT: 0,
    ter: Uint8Array.from(d.ter), ford: Uint8Array.from(d.ford), gate: Uint8Array.from(d.gate), reg: new Int32Array(W * H), regDirty: true };
  if (d.camp) g.camp = d.camp;
  for (const o of d.owners) g.owners.push(Object.assign({}, o, { explored: Uint8Array.from(o.explored), vis: new Uint8Array(W * H) }));
  for (const e of d.ents) { g.ents.push(e); g.byId.set(e.id, e); }
  GT = g.time; g.env = envAt(g); g.envPrev = { phase: g.env.phase, weather: g.env.weather };
  computeRegions(g); refreshPop(g); updateVisibility(g);
  return g;
}
const Sim = { MAPS, MAP_ORDER, mapPreview, serialize, deserialize, envAt, DAY_LEN, W, H, AGES, TECH, hasDone, cmdAgeUp, cmdResearch, cmdCancelResearch, addUnit, addBld, cmdRepair, mineVisible, tileFree, reachable, UNIT, BLD, RESDEF, CIVS, DIFF, BONUS, create, update, cmdMove, cmdStop, cmdAttack, cmdGather, cmdBuild, cmdBuildHelp, cmdReturn, cmdTrain,
  cmdCancel, cmdRally, cmdPower, cmdSell, cmdHeroCry, cmdC4, cmdSpy, cmdDisguise, canPlace, canAfford, rectOf, centerOf, visibleTo, unitStats, blockedAt, queuedPop, makePath, damage };
if (typeof module !== 'undefined' && module.exports) module.exports = Sim; else root.Sim = Sim;
})(typeof window !== 'undefined' ? window : globalThis);
