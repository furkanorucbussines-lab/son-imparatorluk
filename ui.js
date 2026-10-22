/* Son İmparatorluk - Ayarlar ve Kayıtlar ekranları, "Devam Et" düğmesi */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), G = () => window.__game;
  const AGE = ['Kale', 'Barut', 'Sanayi', 'Modern'], CIV = { osmanli: 'Osmanlı', bizans: 'Bizans' }, DIFF = { kolay: 'Kolay', normal: 'Normal', zor: 'Zor' };
  const fmt = s => Math.floor(s / 60) + ' dk ' + String(Math.floor(s % 60)).padStart(2, '0') + ' sn';
  const ago = at => { const m = Math.round((Date.now() - at) / 60000); return m < 1 ? 'az önce' : m < 60 ? m + ' dk önce' : m < 1440 ? Math.round(m / 60) + ' saat önce' : new Date(at).toLocaleDateString('tr-TR'); };
  let from = null; // ayarlar/kayıtlar hangi ekrandan açıldı

  function open(name) { $(name).classList.remove('hide'); if (name === 'saves') renderSaves(); if (name === 'settings') syncSettings(); if (name === 'maps') renderMaps(); }
  function close(name) { $(name).classList.add('hide'); if (name === 'settings') G().applySettings(); refreshCont(); refreshMapName(); }

  /* ---------- kayıtlar ---------- */
  function renderSaves() {
    const inGame = !$('hud').classList.contains('hide') && G().g, list = G().listSaves();
    $('saveList').innerHTML = list.map(({ slot, meta }) => {
      const name = slot === 'auto' ? '⟳ Otomatik kayıt' : '💾 Kayıt ' + slot;
      const info = meta ? `<b>${CIV[meta.civ]}</b> · ${AGE[meta.age]} Çağı · ${DIFF[meta.diff] || ''} · ${fmt(meta.time)}<small>${ago(meta.at)}</small>` : '<em>Boş</em>';
      return `<div class="srow2" data-slot="${slot}"><div class="sname">${name}</div><div class="sinfo">${info}</div><div class="sbtn">` +
        (slot !== 'auto' ? `<button class="mghost" data-do="save" ${inGame ? '' : 'disabled'}>Kaydet</button>` : '') +
        `<button class="mghost" data-do="load" ${meta ? '' : 'disabled'}>Yükle</button>` + `<button class="mghost del" data-do="del" ${meta ? '' : 'disabled'} title="Sil">✕</button></div></div>`;
    }).join('') + (inGame ? '' : '<p class="snote">Kaydetmek için oyun içinde duraklatma ekranından açın.</p>');
  }
  $('saveList').addEventListener('click', e => {
    const b = e.target.closest('button[data-do]'); if (!b || b.disabled) return; const slot = b.closest('.srow2').dataset.slot, act = b.dataset.do;
    if (act === 'save') { if (G().save(slot)) { renderSaves(); } }
    else if (act === 'load') { if (G().load(slot)) { $('saves').classList.add('hide'); $('menu').classList.add('hide'); $('pausePanel').classList.add('hide'); } }
    else if (act === 'del') { G().deleteSave(slot); renderSaves(); refreshCont(); }
  });

  /* ---------- haritalar ---------- */
  const mapCache = {};
  function previewCanvas(id) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d'), k = 2;
    if (id === 'rastgele') { x.fillStyle = '#2a3a2a'; x.fillRect(0, 0, 128, 128); x.fillStyle = '#e8c24a'; x.font = '64px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('🎲', 64, 68); return cv; }
    const pv = (mapCache[id] = mapCache[id] || G().Sim.mapPreview(id));
    for (let y = 0; y < 64; y++) for (let xx = 0; xx < 64; xx++) { const i = y * 64 + xx; x.fillStyle = pv.ter[i] ? '#2f6ea8' : pv.ford[i] ? '#b8a266' : ((xx * 7 + y * 13) % 5 === 0 ? '#52853e' : '#4a7a38'); x.fillRect(xx * k, y * k, k, k); }
    pv.starts.forEach((s, i) => { x.fillStyle = i ? '#e04a3c' : '#3c8ce0'; x.strokeStyle = '#fff'; x.lineWidth = 2; x.beginPath(); x.arc((s.x + 1.5) * k, (s.y + 1.5) * k, 8, 0, 6.283); x.fill(); x.stroke(); });
    return cv;
  }
  function renderMaps() {
    const S = G().Sim, cur = G().settings.map || 'rastgele', ids = ['rastgele'].concat(S.MAP_ORDER); $('mapGrid').innerHTML = '';
    ids.forEach(id => {
      const info = id === 'rastgele' ? { name: 'Rastgele', desc: 'Her oyunda farklı bir harita ve başlangıç köşesi.' } : S.MAPS[id], card = document.createElement('div');
      card.className = 'mcard' + (id === cur ? ' on' : ''); card.dataset.map = id; card.appendChild(previewCanvas(id));
      card.insertAdjacentHTML('beforeend', `<h4>${info.name}</h4><p>${info.desc}</p><span class="sel">SEÇİLİ</span>`); $('mapGrid').appendChild(card);
    });
  }
  $('mapGrid').addEventListener('click', e => { const c = e.target.closest('.mcard'); if (!c) return; G().settings.map = c.dataset.map; G().applySettings(); renderMaps(); refreshMapName(); if (window.GameAudio) GameAudio.snd.click(); });
  function refreshMapName() { const id = G().settings.map || 'rastgele', el = $('mapName'); if (el) el.textContent = id === 'rastgele' ? 'Rastgele' : G().Sim.MAPS[id].name; }

  /* ---------- ayarlar ---------- */
  function syncSettings() {
    const s = G().settings;
    document.querySelectorAll('[data-set]').forEach(el => { const k = el.dataset.set; if (el.type === 'checkbox') el.checked = !!s[k]; else el.value = s[k]; const v = document.querySelector(`[data-val="${k}"]`); if (v) v.textContent = el.value + (k === 'camSpeed' ? '%' : '%'); });
  }
  document.querySelectorAll('[data-set]').forEach(el => el.addEventListener('input', () => {
    const k = el.dataset.set, s = G().settings; s[k] = el.type === 'checkbox' ? el.checked : (el.tagName === 'SELECT' ? el.value : +el.value);
    const v = document.querySelector(`[data-val="${k}"]`); if (v) v.textContent = el.value + '%'; G().applySettings();
    if (k === 'sfx' && window.GameAudio) GameAudio.snd.click();
  }));
  $('setReset').addEventListener('click', () => { G().settings = Object.assign({}, G().DEFSET); syncSettings(); G().applySettings(); });

  /* ---------- genel bağlama ---------- */
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]'); if (o) { e.preventDefault(); open(o.dataset.open); return; }
    const c = e.target.closest('[data-close]'); if (c) close(c.dataset.close);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') for (const n of ['saves', 'settings', 'maps']) if (!$(n).classList.contains('hide')) { close(n); e.stopImmediatePropagation(); e.preventDefault(); } }, true);

  /* ---------- Devam Et (menü) ---------- */
  function refreshCont() {
    const cont = $('contBtn'); if (!cont) return; const saves = G().listSaves().filter(s => s.meta).sort((a, b) => b.meta.at - a.meta.at);
    cont.style.display = saves.length ? '' : 'none'; if (saves.length) { cont.dataset.slot = saves[0].slot; cont.textContent = '⟳ Devam Et · ' + CIV[saves[0].meta.civ] + ', ' + AGE[saves[0].meta.age]; }
  }
  $('contBtn').addEventListener('click', () => { const s = $('contBtn').dataset.slot; if (s && G().load(s)) $('menu').classList.add('hide'); });
  new MutationObserver(() => { if (!$('menu').classList.contains('hide')) refreshCont(); }).observe($('menu'), { attributes: true, attributeFilter: ['class'] });
  refreshCont(); refreshMapName();
})();
