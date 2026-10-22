/* Son İmparatorluk - telefon arayüzü: sade ana menü, yardım, "ana ekrana ekle", hedef paneli açma/kapama */
(function () {
  'use strict';
  const root = document.documentElement; if (!root.classList.contains('mobile')) return;
  const $ = id => document.getElementById(id), Q = (s, r) => (r || document).querySelector(s);
  const mm = document.createElement('div'); mm.id = 'mm';
  mm.innerHTML = `
    <div class="mm-sky"></div>
    <svg class="mm-city" viewBox="0 0 400 120" preserveAspectRatio="xMidYMax slice"><path fill="#07070f" d="M0 120V92h28l3-14 3 14h18V84l6-10 6 10v8h16l4-20c4-14 14-24 24-24s20 10 24 24l4 20h14V80h8V60l3-8 3 8v20h8v12h26V88l5-12 5 12v4h16l6-26c6-18 20-30 34-30s28 12 34 30l6 26h22V84h14l4-12 4 12h14v36z"/></svg>
    <div class="mm-wrap">
      <div class="mm-head"><small>1453 · çevrimdışı gerçek zamanlı strateji</small><h1>Son İmparatorluk</h1></div>
      <div class="mm-body">
        <div class="mm-col">
          <div class="mm-lab">İmparatorluk</div>
          <div class="mm-civs"><button class="mm-civ" data-c="osmanli"><img data-flag="osmanli" alt="">Osmanlı</button><button class="mm-civ" data-c="bizans"><img data-flag="bizans" alt="">Bizans</button></div>
          <div class="mm-lab">Zorluk</div>
          <div class="mm-diff"><button data-d="kolay">Kolay</button><button data-d="normal">Normal</button><button data-d="zor">Zor</button></div>
        </div>
        <div class="mm-col">
          <button class="mm-go" id="mmGo">▶ SAVAŞA BAŞLA</button>
          <button class="mm-camp" id="mmCamp" data-open="camp">⚔ KIZIL ELMA · 10 görev</button>
          <button class="mm-ghost" id="mmCont" style="display:none">⟳ Devam Et</button>
          <div class="mm-sec"><button data-open="maps" id="mmMap">🗺 Harita</button><button data-open="saves">💾 Kayıtlar</button><button data-open="settings">⚙ Ayarlar</button><button id="mmHelp">❓ Nasıl oynanır</button></div>
          <button class="mm-ghost" id="mmInstall" style="display:none">📲 Ana ekrana ekle (tam ekran)</button>
        </div>
      </div>
      <div class="mm-foot"><span>Furkan Oruç tarafından geliştirildi</span><a href="https://www.instagram.com/furkanoruuc/" target="_blank" rel="noopener noreferrer">@furkanoruuc</a></div>
    </div>`;
  document.body.appendChild(mm);
  mm.querySelectorAll('img[data-flag]').forEach(i => { if (window.Flags) i.src = Flags.uri[i.dataset.flag]; });

  const help = document.createElement('div'); help.id = 'mhelp';
  help.innerHTML = `<div class="card"><h2>Dokunmatik kontroller</h2><ul>
    <li><b>Dokun</b> bir birime/binaya: seçer. Seçili askerler varken <b>boş yere, düşmana veya kaynağa dokun</b>: gider, saldırır ya da toplar.</li>
    <li><b>Sürükle</b>: haritayı kaydırır. <b>İki parmak</b>: yakınlaştır/uzaklaştır.</li>
    <li><b>Basılı tut</b> bir askere: ekrandaki aynı türden hepsini seçer. <b>Çift dokun</b> da aynısını yapar.</li>
    <li>Sağdaki düğmeler: <b>⚔ Saldır</b> (saldırarak ilerle), <b>⏹ Dur</b>, <b>▭ Seç</b> (kutu çizerek seç), <b>🛡 Ordu</b> (tüm askerleri seç), <b>🏰 Şehir</b>.</li>
    <li>Bina kurmak için köylü seç, alttaki listeden bir bina seç, <b>parmağınla yerini ayarla</b> ve <b>✓ İnşa et</b>'e dokun. Sur için parmağını sürükle.</li>
    <li>Alttaki düğme sırasını <b>sağa-sola kaydırarak</b> tüm seçenekleri görürsün. Köşedeki mini haritaya dokunarak oraya gidersin.</li>
    <li>İpucu: oyunu <b>yatay</b> tut. Tarayıcı menüsünde "Ana ekrana ekle" dersen tam ekran ve çevrimdışı açılır.</li></ul>
    <button id="mhelpX">Tamam</button></div>`;
  document.body.appendChild(help);
  $('mmHelp').addEventListener('click', () => help.classList.add('on'));
  $('mhelpX').addEventListener('click', () => help.classList.remove('on'));

  // asıl düğmelere vekil: mevcut mantık (pickCiv/pickDiff/start/continue) aynen kullanılır
  const orig = (sel) => Q(sel);
  mm.querySelectorAll('.mm-civ').forEach(b => b.addEventListener('click', () => { orig('.civ[data-c="' + b.dataset.c + '"]').click(); sync(); }));
  mm.querySelectorAll('.mm-diff button').forEach(b => b.addEventListener('click', () => { orig('.diff[data-d="' + b.dataset.d + '"]').click(); sync(); }));
  $('mmGo').addEventListener('click', () => $('start').click());
  $('mmCont').addEventListener('click', () => $('contBtn').click());
  function sync() {
    mm.querySelectorAll('.mm-civ').forEach(b => b.classList.toggle('on', orig('.civ[data-c="' + b.dataset.c + '"]').classList.contains('on')));
    mm.querySelectorAll('.mm-diff button').forEach(b => b.classList.toggle('on', orig('.diff[data-d="' + b.dataset.d + '"]').classList.contains('on')));
    const c = $('contBtn'), show = c.style.display !== 'none'; $('mmCont').style.display = show ? '' : 'none'; if (show) $('mmCont').textContent = c.textContent;
    const mn = $('mapName'); if (mn) $('mmMap').innerHTML = '🗺 ' + mn.textContent;
  }
  setInterval(() => { if (document.body.classList.contains('in-menu')) sync(); }, 400); sync();

  // ana ekrana ekle
  let deferred = null; const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; if (!standalone) $('mmInstall').style.display = ''; });
  if (!standalone && /iphone|ipad|ipod/i.test(navigator.userAgent)) $('mmInstall').style.display = '';
  $('mmInstall').addEventListener('click', () => { if (deferred) { deferred.prompt(); deferred = null; $('mmInstall').style.display = 'none'; } else alert('Safari: Paylaş düğmesi → "Ana Ekrana Ekle". Sonra oyun tam ekran ve internetsiz açılır.'); });

  // hedef paneli: dokununca açılır/kapanır
  document.addEventListener('click', e => { const o = e.target.closest('#objs'); if (o) o.classList.toggle('open'); });

  // yerleştirme onay çubuğu
  const pb = document.createElement('div'); pb.id = 'pbar'; pb.innerHTML = '<button class="ok" data-p="ok">✓ İnşa et</button><button class="no" data-p="no">✕ Vazgeç</button>';
  $('hud').appendChild(pb);
  pb.addEventListener('click', e => { const b = e.target.closest('button'); if (b && window.__game && window.__game.placeConfirm) window.__game.placeConfirm(b.dataset.p === 'ok'); });
  window.MobileUI = { sync };

  // servis çalışanı: çevrimdışı ve "yükle" desteği
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { /* olmasa da oyun çalışır */ });
})();
