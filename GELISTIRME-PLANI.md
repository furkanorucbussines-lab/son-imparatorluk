# Fetih — Geliştirme Planı (taslak v1)

**Ana fikir:** Osmanlı ve Bizans mirasçıları, Ortaçağ'dan modern çağa uzanan **tek bir maçta çağ atlayarak** savaşır.
AoE'nin ekonomi/çağ derinliği + RA2'nin tempo, özel güç ve teknoloji cümbüşü.

## Bizi "orijinal" yapacak imzalar (zaten var / eklenecek)
| İmza | Durum |
|---|---|
| İşçiler kaynağın içine girip çalışır, kasaya direkt yazılır, yer kaplamaz | ✅ var |
| Koku alan köpekler, gizli casus | ✅ var |
| Medeniyet özel güçleri (Topçu Ateşi / Grek Ateşi) | ✅ var |
| **İstihbarat savaşı:** casus binayı gözetler, sabote eder, teknoloji çalar, düşman işçi kılığına girer | planlı |
| **Mühendis + arazi:** köprü, hendek, duvar, mayın; nehir tek köprüden geçilir → savunma/baskın noktaları | planlı |
| **Çağ atlama:** Kale → Barut → Sanayi → Modern; her çağda birimler ve özel güçler değişir | planlı |
| **Hava + hava savunma:** uçak, helikopter, İHA/SİHA; SAM, radar, uçaksavar | planlı |

## Çağlar ve içerik
1. **Kale Çağı (şu an):** piyade, okçu, süvari, top, köpek, casus. + **Mimar/Mühendis**, sur, kule, köprü.
2. **Barut Çağı:** tüfekli (Yeniçeri/Varangian), tabya, ağır top, mayın, hendek, **Mühendis** (köprü, tamir, tuzak).
3. **Sanayi Çağı:** makineli tüfek, siper, zırhlı araç, ilk tank, çift kanatlı uçak, telgraf/radar öncesi gözcü kulesi.
4. **Modern Çağ:** ana muharebe tankı, APC, havan, savaş uçağı, bombardıman, saldırı helikopteri, **İHA** (keşif) ve **SİHA** (silahlı), **SAM/uçaksavar**, radar, bunker, özel güçler (hava harekâtı, elektronik harp, keşif uydusu).
- Yeni kaynak: **Demir** (Sanayi) ve **Petrol** (Modern); pazar ile takas.
- Araştırma binaları: Akademi / Üniversite → birim ve bina yükseltmeleri.
- Komutan birimi (Sultan / İmparator): çevresine moral ve hasar bonusu, ölürse zayıflama.

## Birim aileleri
- **Piyade:** mızraklı, kılıçlı, tüfekli, makineli, bazukacı, keskin nişancı, sağlıkçı.
- **Özel:** köpek, casus (kılık değiştirme, sabotaj, çalma), **mühendis** (köprü, duvar, tamir, mayın, ele geçirme), **mimar** (Kale Çağı'nda aynı rol).
- **Süvari ve zırhlı:** Sipahi/Katafrakt → hafif tank → ana muharebe tankı, APC, havan/obüs.
- **Hava:** savaş uçağı (hava savunması), bombardıman uçağı (bina avcısı), helikopter, İHA, SİHA. Hava birimleri yere çarpışmaz, kendi katmanında uçar; sadece uçaksavar ve havaya atan birimler vurur.
- **Savunma:** kule, sur + kapı, tabya, bunker, mayın tarlası, SAM, radar, bariyer.

## Harita ve arazi
- Nehir, göl, köprü, geçit; tepe (yüksek zemin görüş/menzil bonusu); orman ve kayalık.
- Rastgele harita türleri: Kara, Nehir Vadisi, Adalar (köprü/hava şart), Çöl.
- Sonra: gece/gündüz, hava durumu (sis, yağmur görüşü kısar).

## Oyun modları
Serbest maç (şu an) → Kampanya (Osmanlı ve Bizans, 8–10 görev) → Hayatta kalma → Harita editörü.

## Teknik yol haritası (gerekli altyapı)
1. **Veri odaklı yapı:** birim/bina/teknoloji tanımları tek tablo dosyasında; yeni birim eklemek kod yazmak değil tablo satırı olsun.
2. **Yetenek sistemi:** birimlere takılan yetenekler (köprü kur, sabote et, kılık değiştir, bombala).
3. **Katman sistemi:** yer/hava ayrı; araziye su ve köprü; yol bulmada köprü ve su.
4. **Çağ ve araştırma sistemi**, kaynak türleri.
5. **Performans:** 300+ birimde akıcılık (uzamsal tablo, WebGL/PixiJS geçişi gerekirse).
6. **Kayıt/yükle**, ayarlar, ses ve müzik.
7. **Görsel asset:** ücretsiz CC0 paketler (Kenney vb., önce `vet-third-party-tool` ile denetlenir) veya yapay zekâ görselleri; sonra animasyonlu sprite'lar.
8. **Otomatik testler:** her yeni içerikte AI-AI simülasyon çökme/denge testi.
9. **Yayın:** tarayıcıda çevrimdışı (GitHub Pages) + Capacitor ile Android/iOS; mağaza öncesi güvenlik denetimi.

## Aşamalar (öneri sırası)
| Aşama | İçerik | Sonuç |
|---|---|---|
| **A — Arazi ve mühendislik** ✅ (v2) | Nehir/göl, geçit, köprü, mimar-mühendis, sur ve kapı, mayın, onarım. Hendek sonraya kaldı | Haritada stratejik darboğazlar |
| **B — Çağ sistemi** ✅ (v3) | Akademi + 10 araştırma, 3 çağ (Kale/Barut/Sanayi), demir, Tüfekçi/Makineli/Zırhlı Araç, Tabya | Maç boyunca gelişim |
| **C — İstihbarat** ✅ (v5) | Casus: sabotaj, teknoloji çalma, hazine soyma, kılık değiştirme; köpek/mimar algılar; AI casus kullanır. Radar zaten var | Gizli savaş katmanı |
| **D — Zırhlı ve hava** ✅ (v4, petrolsüz) | Tank, uçak, helikopter, bombardıman, İHA/SİHA, uçaksavar, radar, Hava Üssü, Modern Çağ | RA2 hissi |
| **E — Derinlik** | Komutan, özel güçler 2. tur, dengeleme, zorluk | Tekrar oynanabilirlik |
| **F — Kampanya ve cila** | Görevler, hikâye, menü, müzik, asset | Yayına yakın sürüm |
| **G — Yayın** | Android/iOS, gizlilik, güvenlik denetimi | Mağaza |

## Riskler
- **Kapsam:** her şey aynı anda yapılırsa denge dağılır → aşama aşama, her aşama sonunda oynanabilir sürüm.
- **Görsel kalite:** sade çizimle tank/uçak ayırt edilebilir olmalı; asset paketi şart olacak.
- **Hava birimleri dengesi:** uçak aşırı güçlü olursa oyun bozulur → uçaksavar ve maliyet ayarı testle.
- **Yapay zekâ:** her yeni birim için AI'nın kullanması gerekir (testle doğrulanır).
