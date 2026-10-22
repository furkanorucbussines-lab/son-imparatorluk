/* Son İmparatorluk - Kızıl Elma görev arayüzü: görev seçimi, brifing, hedef paneli, hikâye kartı, ilerleme kaydı */
(function () {
  'use strict';
  const $ = id => document.getElementById(id), G = () => window.__game, C = () => window.Campaign;
  const KEY = 'si.camp';
  const load = () => { try { const d = JSON.parse(localStorage.getItem(KEY) || 'null'); return d && Array.isArray(d.done) ? d : { done: [] }; } catch (e) { return { done: [] }; } };
  const save = d => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* yok */ } };
  const unlocked = (i, d) => i === 0 || d.done.includes(C().MISSIONS[i - 1].id) || d.done.includes(C().MISSIONS[i].id);
  let cur = 0, storyQ = [], storyBusy = false;
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  function renderSelect() {
    const d = load(), M = C().MISSIONS; $('cmSub').textContent = 'İstanbul Kuşatması · 1453 · ' + d.done.filter(id => M.some(m => m.id === id)).length + '/' + M.length + ' görev tamam';
    $('cmGrid').innerHTML = M.map((m, i) => {
      const ok = unlocked(i, d), done = d.done.includes(m.id);
      return `<div class="cmcard${ok ? '' : ' lock'}" data-i="${i}">${done ? '<span class="tick">✔</span>' : ''}<div class="n">GÖREV ${i + 1}</div><h3>${esc(m.name)}</h3><div class="d">${esc(m.date)}</div><p>${esc(m.brief[0].slice(0, 120))}…</p><div class="st">${done ? 'Tamamlandı' : ok ? 'Oynanabilir' : '🔒 Önceki görevi bitir'}</div></div>`;
    }).join('');
  }
  function openBrief(i) {
    const m = C().MISSIONS[i]; cur = i;
    $('bDate').textContent = 'Görev ' + (i + 1) + ' · ' + m.date; $('bName').textContent = m.name;
    $('bText').innerHTML = m.brief.map(p => '<p>' + esc(p) + '</p>').join('');
    $('bObj').innerHTML = m.objs.filter(o => !o.info).map(o => '<li>' + esc(o.text) + '</li>').join('');
    $('camp').classList.add('hide'); $('brief').classList.remove('hide');
  }
  function begin(i) {
    $('brief').classList.add('hide'); $('camp').classList.add('hide'); $('menu').classList.add('hide'); $('end').classList.add('hide'); $('pausePanel').classList.add('hide');
    cur = i; G().startCampaign(i); $('story').classList.add('hide'); storyQ = []; storyBusy = false;
  }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-open="camp"]')) renderSelect();
    const card = e.target.closest('.cmcard');
    if (card && !card.classList.contains('lock')) openBrief(+card.dataset.i);
  });
  $('bGo').addEventListener('click', () => begin(cur));
  $('bBack').addEventListener('click', () => { $('brief').classList.add('hide'); renderSelect(); $('camp').classList.remove('hide'); });
  $('cmReset').addEventListener('click', () => { save({ done: [] }); renderSelect(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') for (const n of ['brief', 'camp']) if (!$(n).classList.contains('hide')) { $(n).classList.add('hide'); if (n === 'brief') { renderSelect(); $('camp').classList.remove('hide'); } e.stopImmediatePropagation(); e.preventDefault(); return; } }, true);

  /* ---------- hikâye kartı ---------- */
  function showNext() {
    const ev = storyQ.shift(); if (!ev) { storyBusy = false; $('story').classList.add('hide'); return; }
    storyBusy = true; const s = $('story'); s.querySelector('b').textContent = ev.title; s.querySelector('span').textContent = '“' + ev.text + '”'; s.classList.remove('hide');
    setTimeout(showNext, Math.max(5500, ev.text.length * 70));
  }
  function story(ev) { storyQ.push(ev); if (!storyBusy) showNext(); }

  /* ---------- hedef paneli ---------- */
  function refresh() {
    const g = G() && G().g, p = $('objs'), hudOn = !$('hud').classList.contains('hide');
    if (!g || !g.camp || !hudOn) { p.classList.add('hide'); return; }
    const m = C().missionOf(g), st = C().status(g);
    p.classList.remove('hide');
    p.innerHTML = '<h4>' + esc(m.name) + '</h4>' + st.map(o => `<div class="o${o.done ? ' ok' : ''}"><i>${o.done ? '✔' : o.info ? '◆' : '○'}</i><span>${esc(o.text)}</span>${!o.done && !o.info && o.max > 1 && !o.time ? '<em>' + o.cur + '/' + o.max + '</em>' : ''}</div>`).join('');
  }
  setInterval(refresh, 400);

  /* ---------- bitiş ---------- */
  function end(g, win, ev) {
    const m = C().missionOf(g), d = load(), last = g.camp.idx === C().MISSIONS.length - 1;
    if (win && !d.done.includes(m.id)) { d.done.push(m.id); save(d); }
    $('endTitle').textContent = win ? (last ? 'İSTANBUL FETHEDİLDİ!' : 'GÖREV TAMAM!') : 'GÖREV BAŞARISIZ';
    $('endTitle').className = win ? 'win' : 'lose';
    $('endText').textContent = win ? m.outro : ((ev && ev.reason) || 'Görev başarısız oldu.') + ' Yeniden dene.';
    $('again').textContent = win ? (last ? 'ANA MENÜ' : 'SONRAKİ GÖREV ›') : 'TEKRAR DENE';
    $('objs').classList.add('hide');
  }
  function again() {
    const g = G().g, i = g.camp.idx, won = g.winner === 0, last = i === C().MISSIONS.length - 1;
    $('again').textContent = 'TEKRAR OYNA';
    if (won && last) { $('toMenu').click(); return; }
    if (won) openBrief(i + 1); else begin(i);
  }
  window.CampUI = { story, end, again, refresh };
})();
