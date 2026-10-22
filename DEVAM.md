# Son İmparatorluk — nereden devam? (Cumartesi için not, 2026-10-22)

**Yayında:** https://furkanorucbussines-lab.github.io/son-imparatorluk/ (repo furkanorucbussines-lab/son-imparatorluk; güncelleme = git push).
**Bu oturumda:** Kızıl Elma 10 görev · sprite3d birim/hava çizimi · mobil arayüz + alay sistemi (yalnız telefonda) · PWA (manifest, sw.js, ikon) · gerçek CC0 müzik/ses (audio/, CREDITS.md) · test/cdp.js ile telefon emülasyonu (mob*.js testleri).
**Cumartesi adayları:** gerçek telefonda geri bildirim (alay dağılması, sancak konumu, ses seviyeleri/eşleşmeleri) · alaylar arası asker taşıma · AI mimar/sur kullanımı · deniz savaşı · bina çizimleri sprite3d'ye · denge (Haliç/Surlar/Fetih).
**Sağlık testi:** `node test/camp.js` · `node test/phaseb.js` · `node test/mob11.js` (alay, Chrome gerekir).

# Son İmparatorluk — nereden devam? (güncel)

**v16 (2026-10-22): yeni birim çizimi — sprite3d.js** (kapsül/elipsoid/kutu/disk'ten 'ilkel 3B' çizici; her karede yöne göre canlı çizim). Asker, okçu, tüfekçi, makineli, nişancı, bazuka, C4, sağlıkçı, casus, köylü, mimar, 5 süvari/komutan (at+binici), top, tüm araçlar/tanklar, köpek (K9 çoban köpeği + Husky; id'ye göre) bununla çiziliyor; hava birimleri eski çizimde. render.js drawUnit içinde `Spr.handles(type)` ise Spr.unit çağrılır. Vitrin: `node test/sprshow.js inf,tank,dog osmanli out.png [zoom]`. Kampanya adı: Kızıl Elma (kampanya kelimesi arayüzden kalktı). Görev zorluğu artan: Edirne(kolay,pasif) < Rumeli(normal akın) < Haliç(normal AI+kuleler) < Surlar(zor AI, 3 çıkış) < Fetih(yeni 'usta' zorluk, 25 dk, 4 büyük akın). Sıradaki: hava birimlerini de sprite3d'ye geçir, bina çizimlerini iyileştir, görsel cila (Spr kalitesi).

**v15 — KIZIL ELMA kampanyası (1453) (2026-10-22):** 5 görev (Edirne'de Hazırlık · Rumeli Hisarı · Haliç Baskını · Surların Dibinde · 29 Mayıs Fetih). Dosyalar: campaign.js (görev tanımları+motor: obj/script/lose, Campaign.create/tick/status), camp-ui.js (görev seçimi, brifing, hedef paneli, hikâye kartı, ilerleme: localStorage 'si.camp'), camp.css. sim.js: g.camp varsa checkWin kapalı (zaferi görev belirler), serialize camp'i saklar. main.js: Campaign.tick, startCampaign, story/objdone olayları, endGame(win, ev). Testler: `node test/camp.js` (hepsi geçti), ekran: `node test/campshot.js select|brief|play|end <görev0-4> out.png [sn]`. Yedekler: test/*.bak6/bak2/bak5.
**Kampanya sıradaki:** görevleri oynayıp denge (Haliç/Surlar AI gücü), ara sahne/portre, görev 3'e deniz (deniz savaşı gelince), Bizans kampanyası.

# Son İmparatorluk — nereden devam? (kapanış notu 2026-10-22)

**Sıradaki adaylar:** kampanya (1453 görevleri) · deniz savaşı (Haliç/gemiler) · pazar-takas · 3. medeniyet · başarımlar/istatistik · Android (Capacitor) · AI'ın yeni birimleri/mühendisi daha akıllı kullanması · oyuncu geri bildirimiyle denge (Hızlı Saldırı Aracı, nişancı, komutan).
**Açmak:** index.html çift tık. **Tüm testler:** test/ klasöründe `node test/<ad>.js` (phaseb air ages terrain feat spy sell eco newunits fogradar hero_save_env maps audio_node).

# Eski not: Yarın nereden devam? (2026-10-22 akşamı)

**Durum:** Fetih v4 çalışıyor — Osmanlı vs Bizans, 4 çağ (Kale→Barut→Sanayi→Modern), nehir/köprü/sur/kapı/mayın,
Akademi + 10 araştırma, demir, hava birimleri (İHA/SİHA/uçak/helikopter/bombardıman), tank, uçaksavar, radar.
Açmak: `index.html` çift tık (internetsiz).

**Dosyalar:** sim.js (motor+AI) · render.js (çizim/efekt) · main.js (arayüz/ses/müzik) · index.html (menü/CSS) ·
GELISTIRME-PLANI.md (yol haritası) · test/ (headless.js, ages.js, phaseb.js, air.js, terrain.js, feat.js, shot.js, render_node.js)

**Hızlı sağlık testi:** `node test/phaseb.js` · `node test/air.js` · `node test/headless.js 7 normal 900`
**Ekran görüntüsü:** `node test/shot.js base|fight|tech|modern 60 test/x.png`

**v14:** 8 harita + Rastgele (Sim.MAPS/MAP_ORDER, genTerrain; başlangıç köşeleri farklı; harita seçici #maps, ui.js; test/maps.js) · Ahır artık 6 birim: Süvari, Atlı Okçu, Ağır Süvari (Kapıkulu/Katafrakt), Atlı Tüfekçi, Motorlu Keşif, Hızlı Saldırı Aracı · gece daha aydınlık + kandiller · Kışla ve diğer binalar yeniden (bldart2.js barracks2, bina tabanı gölgesi).
**v13:** bina çizimleri bldart2.js (Ahır, Dökümhane, Akademi, Kule, Tabya, Hava Üssü, SAM, Radar, Çiftlik; çağa göre) · üretim kuyruğu sınırı 60 (QUEUE_MAX; panelde gruplu ×N) · Çiftlik 1x1 (4 köylü) · bina etiketleri (ayarlardan kapatılır; render drawLabel).
**v12:** Komutan (Fatih/Konstantinos: aura +%20 saldırı/-%12 hasar, Savaş Narası N, ölünce moral çöker, 90sn bekleme) · Kaydet/Yükle (3 slot + otomatik 60sn, Sim.serialize/deserialize, test/hero_save_env.js) · Ayarlar (ses seviyeleri, kalite, gece/hava, kenar kaydırma, kamera hızı; ui.js) · Gece-gündüz (480sn döngü) + hava (yağmur/sis/fırtına, görüş çarpanı Sim.envAt, render drawDayNight/drawWeather). SES DÜZELTMESİ: saz Karplus-Strong döngüsü Kale/Barut temalarında patlayıp sesi bozuyordu → osilatör tabanlı pluck; efekt düzeyleri çevrimdışı ölçümle ayarlandı (test/audio_off_run.js, OfflineAudioContext ile RMS/tepe/NaN ölçer).
**v11 (bina + ses):** bldart.js: Şehir Merkezi/Ev/Kışla her çağda ayrı mimari (Kale taş kale → Barut bastion → Sanayi tuğla belediye+saat kulesi → Modern cam HQ); çağ atlayınca iskeleyle dönüşüm animasyonu (render.js drawBldAged). audio.js: yeni ses motoru (reverb, panlama, katmanlı efektler, Hicaz müzik: ney/saz/zurna/mehter davulu, çağa göre tema, savaşta yoğunluk katmanı, rüzgâr+kuş, menü müziği, duraklatınca kısılır). Test: test/audio_node.js, shot.js bld0..bld3.
**Künye:** Furkan Oruç + sultan sarığı simgesi (index.html SVG sprite #ico-turban) ve Instagram @furkanoruuc (https://www.instagram.com/furkanoruuc/) menüde nav/hero/footer + duraklatma/bitiş ekranında. Ses/Müzik düğmeleri duraklatmada durum gösterir; Sonraki düğmesi pseudo-element yüzünden tıklanmıyordu (düzeltildi).
**Duraklatma/bitiş ekranı:** opak tam ekran (pause.css, facts.js): canlı istatistik, ses/müzik, kısayollar, Biliyor muydunuz? (39 bilgi, 11 sn'de bir döner). Test: shot.js pause|endscr.
**İSİM: "Son İmparatorluk" (eski çalışma adı Fetih, kullanıcı seçti; iki taraf da oynanabildiği için nötr isim).** Menüde Ayasofya minaresiz (1453), 2 şehir + 1 ön plan bayrağı, üst menü z-index 40 sabit.
**Ana menü (v10):** sinematik açılış sayfası: menu.js (canlı çizilen İstanbul kuşatması, top atışı, parallax, sinematik giriş) + menu.css (site bölümleri: İmparatorluklar, Çağlar, Özellikler, Nasıl Oynanır, CTA). Test: node test/menushot.js <bölüm> 7 out.png (hash #t= ile sahneyi ilerletir). NOT: headless Chrome + --virtual-time-budget bu menüde takılır.
**v9:** sis gerçekçi: birim ayrılınca alan tekrar kapanır (keşfedilmiş ama karanlık), düşman binaları yalnız görünürken çizilir (görülenler "hayalet" olarak kalır) · 2 radar: Yerel Radar (Sanayi, ~13 kare aydınlatır) + Küresel Radar İstasyonu (Modern, tüm harita) · casus radara dokununca ikisi de patlar, harita yeniden sisle kaplanır (test/fogradar.js).
**v8:** son köylü ölümsüz (damage() + guard halesi) · casus görüşü 11→6, radar 14 karede casusu açığa çıkarır, gizli casus yalnız fark edilince görünür (e.seen) · sis v2 (yumuşak geçiş, bulut dokusu) · yeni birimler: Keskin Nişancı, Bazukacı, C4 Uzmanı (sağ tık bina), Sağlıkçı, Hafif/Ağır Tank, Obüs, Uçaksavar Aracı; Altay/T-90 vb. civ isimleri · kule atışı çağa göre (ateş oku→top→izli mermi→lazer). Test: test/newunits.js, shot.js arsenal.
**Bayraklar:** flags.js (kodla SVG: Osmanlı kırmızı+hilal+yıldız, Bizans altın+çift başlı kartal); menüde, üst çubukta, TC/bina sancaklarında (render.js flag()). Test araçları flags.js yükler.
**v7:** AI dengesi (köylü hedefi zamanla büyür, çağ atlamaya göre kaynak kaydırma, demir, ev/kışla/ahır/dökümhane artışı, çağ atlama erken; ölçüm: test/aibal.js, test/aiidle.js) · çizim: birimler 1.22x, Osmanlı börk/Bizans tüylü miğfer, Modern Çağ Şehir Merkezi (cam HQ + heliped).
**v6:** madenler bol (altın 3000-4000, demir 2500, harita başına ~16 altın + 16 demir, simetrik adil çiftler) · ordu sınırı: Ev başına +10 asker (sim.js ARMY_PER_HOUSE), TC 15, üst sınır 300; işçi sınırı Ev başına +5 · çağa göre bina görünümü (renk tonu, çerçeve, simge, baca, anten) + çağ atlayınca bina canı x1.2 · bina açıklaması yapı menüsünde üstüne gelince (BLD.desc). Test: test/eco.js
**Bina satma:** seçili binada "Sat" düğmesi (Del tuşu), 2 tık onay; bitmiş %60, bitmemiş %100 iade, kuyruk tam iade, TC satılmaz (test/sell.js).
**C bitti (v5):** casus yetenekleri (sabotaj, teknoloji çal, hazine soy, kılık) + test/spy.js.
**Sıradaki adaylar:** AI zekâsı/denge (AI Modern Çağ'a yetişemiyor) ·
kampanya · petrol kaynağı · gerçek oynayıştan gelen geri bildirimlerle denge · Android (Capacitor) · asset paketi (önce vet-third-party-tool).
**Bilinen küçük eksikler:** AI mühendis/sur kullanmıyor; Mimar seçince köylü toplama ipucu görünüyor; bombardıman biraz güçlü olabilir.
