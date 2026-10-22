/* Son İmparatorluk - "Biliyor muydunuz?" köşesi + duraklatma/bitiş ekranı bilgileri */
(function (root) {
  'use strict';
  const FACTS = [
    ['TARİH', "1453 kuşatması 53 gün sürdü: 6 Nisan'da başladı, 29 Mayıs'ta İstanbul'un fethiyle sona erdi."],
    ['TARİH', 'Fatih Sultan Mehmed, İstanbul’u fethettiğinde henüz 21 yaşındaydı.'],
    ['TARİH', 'Teodosius surları 5. yüzyılda yapıldı. Hendek ve üç sıra duvardan oluşan bu hat, şehri yaklaşık bin yıl boyunca birçok kuşatmaya karşı korudu.'],
    ['TARİH', "Macar mühendis Urban'ın döktüğü dev top, kuşatmada yüzlerce kilo ağırlığındaki taş gülleler fırlattı."],
    ['TARİH', 'Haliç’in girişi zincirle kapatılmıştı. Osmanlı donanması bu engeli aşmak için gemilerini Galata tepelerinden karadan yürüttü.'],
    ['TARİH', 'Grek ateşi 7. yüzyılda Bizans’ta kullanılmaya başlandı. Formülü o kadar sır tutuldu ki bugün tam olarak bilinmiyor.'],
    ['TARİH', 'Bizanslılar kendilerine “Romalı” derdi. Doğu Roma, Batı Roma’nın çöküşünden sonra yaklaşık bin yıl daha ayakta kaldı.'],
    ['TARİH', 'Ayasofya 537’de tamamlandı ve yaklaşık bin yıl boyunca dünyanın en büyük kilisesi olarak kaldı.'],
    ['TARİH', 'Yeniçeriler, Avrupa’nın ilk düzenli (daimi) ordularından biriydi ve barutlu silahları erkenden kullanmaya başladılar.'],
    ['TARİH', 'Mehter takımı, dünyanın en eski askeri müzik topluluklarından biri sayılır. Müzik hem moral verir hem düşmanı yıldırırdı.'],
    ['TARİH', 'Çift başlı kartal Bizans’ın sembolüdür: bir baş doğuya, bir baş batıya bakar.'],
    ['TARİH', 'Son Bizans imparatoru XI. Konstantinos, şehrin surlarında savaşırken düştü.'],
    ['TARİH', 'Birçok tarihçi 1453’ü Orta Çağ’ın sonu olarak kabul eder.'],
    ['TEKNOLOJİ', 'İlk tanklar 1916’da Somme Muharebesi’nde savaşa girdi.'],
    ['TEKNOLOJİ', '“Radar”, İngilizce “Radio Detection And Ranging” (radyo ile algılama ve mesafe ölçme) ifadesinin kısaltmasıdır.'],
    ['TEKNOLOJİ', '“Sniper” sözcüğü, avlanması çok zor olan “snipe” kuşunu avlayabilen nişancılardan gelir.'],
    ['TEKNOLOJİ', 'Altay tankı, Kurtuluş Savaşı komutanlarından Fahrettin Altay’ın adını taşır.'],
    ['TEKNOLOJİ', 'Savaş uçakları, havada ilk kez I. Dünya Savaşı’nda birbirleriyle çarpıştı.'],
    ['TEKNOLOJİ', 'Obüsler yüksek açıyla ateş eder; böylece surların ve siperlerin arkasındaki hedefleri vurabilir.'],
    ['İPUCU', 'Son köylün ölümsüzdür. Her şeyini kaybetsen bile köyünü yeniden kurabilirsin.'],
    ['İPUCU', 'Bir binayı seçip Del tuşuna iki kez basarak satabilirsin: bitmiş binadan %60, bitmemiş binadan tam iade alırsın.'],
    ['İPUCU', 'Casus düşman radarına dokunursa radar patlar. Küresel radarı yok edilen taraf haritayı yeniden sisle kaplanmış görür.'],
    ['İPUCU', 'Üretirken Shift tuşuna basılı tutarsan aynı anda 5 birim kuyruğa girer.'],
    ['İPUCU', 'Her Ev işçi sınırını +5, ordu sınırını +10 artırır. Ordun büyüyecekse evleri ihmal etme.'],
    ['İPUCU', 'C4 uzmanını düşman binasına sağ tıkla gönder: bina 320 hasar alır, ama uzman da feda olur.'],
    ['İPUCU', 'Sağlıkçıları ordunla birlikte gönder; yakındaki yaralı birimleri iyileştirirler.'],
    ['İPUCU', 'Piyade süvariye, süvari okçuya, okçu piyadeye üstündür. Tankların başına bela olan birim ise bazukacı.'],
    ['İPUCU', 'Boşta kalan köylüleri bulmak için “.” tuşuna bas. Ctrl+1-9 ile grup kaydet, 1-9 ile hemen seç.'],
    ['İPUCU', 'Mimar nehre köprü kurarsa düşmana yol açar; sur ve kapılarla kendi darboğazını da yaratabilirsin.'],
    ['İPUCU', 'Kulelerin çağınla gelişir: Kale’de alevli ok, Barut’ta top, Sanayi’de izli mermi, Modern’de lazer.'],
    ['İPUCU', 'Uçaksavar aracı yalnız hava birimlerine ateş eder; yanında yer birliği olmadan bırakma.'],
    ['İPUCU', 'Yerel radar çevresini ve casusları görür, Küresel Radar tüm haritayı açar ama çok pahalıdır. Düşman casusu için etrafını gözetle.'],
    ['İPUCU', 'Mayınlar düşmana görünmez; ama köpek ve mimarlar yakında fark eder.'],
    ['İPUCU', 'Bir bölgeden ayrılınca orası yeniden sisle kaplanır. Önemli noktalara gözcü bırak.'],
    ['İPUCU', 'Çağ atlamak için sırasıyla Kışla, Akademi ve Top Dökümhanesi gerekir.'],
    ['İPUCU', 'Hava birimleri nehir ve engellerden etkilenmez; onları yalnızca okçu, tüfekçi, makineli, uçaksavar ve uçaklar vurabilir.']
  ];
  const CAT = { 'TARİH': '#e8c24a', 'TEKNOLOJİ': '#58b4ff', 'İPUCU': '#7ddc8a' };
  let order = [], pos = 0, last = -1;
  function reshuffle() { order = FACTS.map((_, i) => i); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; } if (order[0] === last) order.push(order.shift()); pos = 0; }
  function next() { if (pos >= order.length) reshuffle(); last = order[pos++]; return FACTS[last]; }
  reshuffle();
  root.Facts = { FACTS, next };

  const $ = id => document.getElementById(id);
  const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  function show(box, animate) {
    const f = next(), k = box.querySelector('.fk'), t = box.querySelector('.ft');
    const apply = () => { k.textContent = f[0]; k.style.color = CAT[f[0]] || '#e8c24a'; k.style.borderColor = (CAT[f[0]] || '#e8c24a') + '88'; t.textContent = f[1]; box.classList.remove('swap'); };
    if (animate) { box.classList.add('swap'); setTimeout(apply, 220); } else apply();
  }
  function stats() {
    const el = $('pStats'), G = root.__game; if (!el || !G || !G.g) return;
    const g = G.g, me = g.owners[0], Sim = G.Sim, mine = g.ents.filter(e => !e.dead && e.owner === 0);
    const b = mine.filter(e => e.k === 'b').length;
    const chips = [['⏱', 'Süre', fmt(g.time)], ['🏛', 'Çağ', Sim.AGES[me.age].name.replace(' Çağı', '')], ['🧑‍🌾', 'İşçi', me.pop + '/' + me.popcap], ['⚔', 'Ordu', me.army + '/' + me.armycap], ['🏰', 'Yapı', b], ['🪙', 'Altın', Math.floor(me.res.g)]];
    el.innerHTML = chips.map(c => '<div><i>' + c[0] + '</i><b>' + c[2] + '</b><span>' + c[1] + '</span></div>').join('');
    const fl = $('pauseFlag'); if (fl && root.Flags) fl.src = Flags.uri[me.civ];
  }
  // paneller açılınca yeni bilgi göster, açıkken 11 sn'de bir değiştir
  for (const id of ['pausePanel', 'end']) {
    const panel = $(id); if (!panel) continue; const box = panel.querySelector('.factbox'); if (!box) continue;
    let timer = 0;
    const open = () => { show(box, false); if (id === 'pausePanel') stats(); clearInterval(timer); timer = setInterval(() => show(box, true), 11000); };
    const close = () => clearInterval(timer);
    new MutationObserver(() => { panel.classList.contains('hide') ? close() : open(); }).observe(panel, { attributes: true, attributeFilter: ['class'] });
    const btn = box.querySelector('.fnext'); if (btn) btn.addEventListener('click', () => { show(box, true); clearInterval(timer); timer = setInterval(() => show(box, true), 11000); });
  }
  // duraklatma ekranındaki ses/müzik kısayolları
  function syncAudio() {
    const sn = $('pSnd'), mu = $('pMus'); if (!sn || !mu) return;
    const soundOn = $('mute').textContent.trim() !== '🔇', musicOn = parseFloat($('music').style.opacity || '1') > 0.5;
    sn.textContent = soundOn ? '🔊 Ses: Açık' : '🔇 Ses: Kapalı'; sn.classList.toggle('on', soundOn); sn.classList.toggle('off', !soundOn);
    mu.textContent = musicOn ? '🎵 Müzik: Açık' : '🎵 Müzik: Kapalı'; mu.classList.toggle('on', musicOn); mu.classList.toggle('off', !musicOn);
  }
  [['pSnd', 'mute'], ['pMus', 'music']].forEach(([a, b]) => { const x = $(a), y = $(b); if (x && y) x.addEventListener('click', () => { y.click(); syncAudio(); }); });
  const pp = $('pausePanel'); if (pp) new MutationObserver(() => { if (!pp.classList.contains('hide')) syncAudio(); }).observe(pp, { attributes: true, attributeFilter: ['class'] });
  syncAudio();
})(window);
