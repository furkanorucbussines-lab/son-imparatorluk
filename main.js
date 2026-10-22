/* Son İmparatorluk - çizim, giriş ve arayüz */
(function () {
'use strict';
const { W, H, UNIT, BLD, RESDEF, CIVS, DIFF } = Sim;
const $ = id => document.getElementById(id);
const cv = $('map'), ctx = cv.getContext('2d');
const mini = $('mini'), mctx = mini.getContext('2d');
const TEAM = ['#2f7de1', '#d83a34'];
const ME = 0;
let g = null, running = false, paused = false, speed = 1, acc = 0, last = 0;
let ts = 38, cam = { x: 0, y: 0 }, vw = 0, vh = 0, dpr = 1;
let sel = [], groups = {}, mode = null; // mode: {k:'place',type} | {k:'amove'} | {k:'power'}
let mouse = { x: 0, y: 0, wx: 0, wy: 0, in: false }, drag = null, keys = {};
let muted = false, pings = [], lastAlert = null, toasts = [];
let menuCiv = 'osmanli', menuDiff = 'normal', stats = null;

/* ---------- ses (audio.js) ---------- */
let musicOn = true, sfxBudget = 0, combat = 0, hammerT = 0;
const sfx = GameAudio.sfx, snd = GameAudio.snd;
const DEFSET = { sfx: 100, music: 80, amb: 60, quality: 'auto', map: 'rastgele', labels: true, dayNight: true, weather: true, edge: true, camSpeed: 100 };
let settings = Object.assign({}, DEFSET); try { Object.assign(settings, JSON.parse(localStorage.getItem('si.settings') || '{}')); } catch (e) { /* ayar okunamadı */ }
function applySettings() { try { localStorage.setItem('si.settings', JSON.stringify(settings)); } catch (e) { /* kayıt kapalı */ } GameAudio.setVolumes({ sfx: settings.sfx / 100, music: settings.music / 100, amb: settings.amb / 100 }); if (settings.quality === 'low') Render.setLow(true); else if (settings.quality === 'high') Render.setLow(false); }
let lastAuto = 0, lastWx = 0;
function startMusic() { GameAudio.startMusic(g ? g.owners[ME].age : 0); }
function stopMusic() { GameAudio.stopMusic(); }
const SHOT_SFX = { siege: 'cannon', tank: 'cannon', ltank: 'cannon', htank: 'cannon', howitzer: 'howitzer', sniper: 'sniper', musketeer: 'rifle', rpg: 'rpg', sam: 'missile', siha: 'missile', raider: 'rpg', scout: 'mg', dragoon: 'rifle', harcher: 'twang', mgun: 'mg', heli: 'mg', fighter: 'mg', armored: 'mg', flak: 'mg' };
function fxSounds(dt) {
  sfxBudget = 5;
  const cx = cam.x + vw / ts / 2, cy = cam.y + vh / ts / 2, me = g.owners[ME];
  let hits = 0;
  for (const f of g.fx) {
    if (f._a) continue; f._a = true;
    const x = f.x !== undefined ? f.x : f.x0, y = f.y !== undefined ? f.y : f.y0;
    const i = Math.floor(y) * W + Math.floor(x); if (!(i >= 0 && i < W * H && me.vis[i])) continue;
    if (f.t === 'shot' || f.t === 'hit' || f.t === 'blast' || f.t === 'collapse') hits++;
    const dist = Math.hypot(x - cx, y - cy), v = Math.max(0, 1 - dist / 26); if (v < 0.05 || sfxBudget <= 0) continue;
    let k = null;
    if (f.t === 'shot') k = f.siege ? 'cannon' : f.ut === 'tower' ? (f.age >= 3 ? 'laser' : f.age >= 2 ? 'mg' : f.age === 1 ? 'cannon' : 'twang') : (SHOT_SFX[f.ut] || 'twang');
    else if (f.t === 'hit') k = f.big ? 'thud' : 'clang';
    else if (f.t === 'collapse') k = 'crash'; else if (f.t === 'blast') k = f.r > 2 ? 'boom' : 'crash';
    else if (f.t === 'death') k = 'thud';
    if (k) { sfxBudget--; sfx[k](v, Math.max(-0.85, Math.min(0.85, (x - cx) / (vw / ts / 2)))); }
  }
  // inşaat çekiç sesi
  hammerT -= dt || 0.016;
  if (hammerT <= 0) {
    hammerT = 0.55; let n = 0;
    for (const u of g.ents) {
      if (n >= 2) break; if (u.dead || u.k !== 'u') continue;
      if (u.order === 'build' && !u.dead && u.owner === ME) { const b = g.byId.get(u.target); if (b && !b.dead && Math.hypot(u.x - cx, u.y - cy) < 22) { sfx.hammer(Math.max(0.2, 1 - Math.hypot(u.x - cx, u.y - cy) / 22), Math.max(-0.8, Math.min(0.8, (u.x - cx) / (vw / ts / 2)))); n++; } }
    }
  }
  // savaş yoğunluğu: müziğe katman ekler
  combat = Math.min(1, combat + hits * 0.07); combat *= Math.pow(0.5, (dt || 0.016) / 6);
  GameAudio.setIntensity(combat);
}
document.addEventListener('pointerdown', () => GameAudio.unlock(), { once: true });
document.addEventListener('keydown', () => GameAudio.unlock(), { once: true });

/* ---------- görünüm ---------- */
function resize() {
  dpr = window.devicePixelRatio || 1; vw = window.innerWidth; vh = window.innerHeight;
  cv.width = vw * dpr; cv.height = vh * dpr; cv.style.width = vw + 'px'; cv.style.height = vh + 'px';
  clampCam();
}
function clampCam() {
  const pw = vw / ts, ph = vh / ts;
  cam.x = Math.max(-1, Math.min(W - pw + 1, cam.x)); cam.y = Math.max(-1, Math.min(H - ph + 1.5, cam.y));
}
function centerOn(x, y) { cam.x = x - vw / ts / 2; cam.y = y - vh / ts / 2; clampCam(); }
const sx = x => (x - cam.x) * ts, sy = y => (y - cam.y) * ts;
function toWorld(px, py) { return { x: px / ts + cam.x, y: py / ts + cam.y }; }

/* ---------- çizim ---------- */
const UICON = { hcav: '🐴', harcher: '🏹', dragoon: '🐎', scout: '🏍️', raider: '🚙', hero: '👑', sniper: '🎯', rpg: '🚀', demo: '🧨', medic: '⚕️', ltank: '🛻', htank: '🛡️', howitzer: '🎆', flak: '📡', villager: '🧑‍🌾', inf: '🛡️', archer: '🏹', cav: '🐎', siege: '💣', dog: '🐕', spy: '🕵️', engineer: '📐', musketeer: '🔫', mgun: '🔫', armored: '🚙', tank: '🔰', heli: '🚁', fighter: '✈️', bomber: '🛩️', iha: '🛰️', siha: '🚀' };
const ICON = { gradar: '🌐', airfield: '🛫', sam: '🎯', radar: '📡', academy: '🎓', fortress: '🏯', tc: '🏰', house: '🏠', farm: '🌾', barracks: '⚔️', stable: '🐎', foundry: '💣', tower: '🗼', bridge: '🌉', wall: '🧱', gate: '🚪', mine: '💥' };

/* ---------- mini harita ---------- */
function drawMini() {
  if (!g) return;
  const S = mini.width, k = S / W, me = g.owners[ME];
  mctx.fillStyle = '#05080a'; mctx.fillRect(0, 0, S, S);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; if (!me.explored[i]) continue;
    mctx.fillStyle = g.ter[i] ? (me.vis[i] ? '#2f6ea8' : '#1f4a73') : (me.vis[i] ? '#3f6b2c' : '#27401c'); mctx.fillRect(x * k, y * k, k + 0.5, k + 0.5);
  }
  for (const e of g.ents) {
    if (e.dead) continue;
    const c = Sim.centerOf(e), i = Math.floor(c.y) * W + Math.floor(c.x);
    if (e.k === 'r') { if (!me.explored[i]) continue; mctx.fillStyle = e.type === 'gold' ? '#f2c230' : e.type === 'iron' ? '#8fb4d8' : e.type === 'tree' ? '#1d4d22' : '#d6264a'; mctx.fillRect(c.x * k - 1, c.y * k - 1, (e.type === 'gold' || e.type === 'iron') ? 4 : 2, (e.type === 'gold' || e.type === 'iron') ? 4 : 2); }
    else if (e.k === 'b') { if (e.owner !== ME && !me.explored[i]) continue; mctx.fillStyle = TEAM[e.owner]; const s = BLD[e.type].s * k; mctx.fillRect(e.tx * k, e.ty * k, s + 1, s + 1); }
    else { if (e.owner !== ME && (!me.vis[i] || (e.st.stealth && !(e.seen && e.seen[ME])))) continue; mctx.fillStyle = TEAM[e.owner]; mctx.fillRect(e.x * k - 1, e.y * k - 1, 3, 3); }
  }
  mctx.strokeStyle = '#fff'; mctx.lineWidth = 1; mctx.strokeRect(cam.x * k, cam.y * k, vw / ts * k, vh / ts * k);
  if (g.camp && g.camp.marks) for (const m of g.camp.marks) if (!m.done) { mctx.strokeStyle = '#ffd86a'; mctx.lineWidth = 2; mctx.beginPath(); mctx.arc(m.x * k, m.y * k, Math.max(4, m.r * k), 0, 6.283); mctx.stroke(); mctx.fillStyle = '#ffd86a'; mctx.fillRect(m.x * k - 2, m.y * k - 2, 4, 4); }
  const now = performance.now(); for (const p of pings) { mctx.strokeStyle = '#ff4a3c'; mctx.beginPath(); mctx.arc(p.x * k, p.y * k, 4 + ((now - p.t) / 3000) * 14, 0, 6.283); mctx.stroke(); }
}

/* ---------- seçim ve emirler ---------- */
function entityAt(wx, wy, preferOwn) {
  let best = null, bd = 1e9;
  const me = g.owners[ME];
  for (const e of g.ents) {
    if (e.dead) continue;
    const c = Sim.centerOf(e);
    if (e.owner !== ME && !me.explored[Math.floor(c.y) * W + Math.floor(c.x)]) continue;
    if (e.type === 'mine' && !Sim.mineVisible(g, ME, e)) continue;
    if (e.k === 'u') {
      if (e.hidden) continue;
      if (e.owner !== ME && (!me.vis[Math.floor(e.y) * W + Math.floor(e.x)] || (e.st.stealth && !(e.seen && e.seen[ME])))) continue;
      const ey = e.y - (e.st.air ? e.st.alt : 0), d = Math.hypot(e.x - wx, ey - wy); if (d <= e.st.r + 0.25 && d < bd) { bd = d; best = e; }
    } else {
      const r = Sim.rectOf(e); if (wx >= r.x0 && wx <= r.x1 && wy >= r.y0 && wy <= r.y1 && bd > 0.5) { bd = 0.5; best = e; }
    }
  }
  return best;
}
function selected() { return sel.map(i => g.byId.get(i)).filter(e => e && !e.dead); }
function setSel(ids) { sel = ids; if (ids.length) snd.click(); }
function myUnits(list) { return list.filter(e => e.k === 'u' && e.owner === ME); }

function doSelectBox(x0, y0, x1, y1, add) {
  const a = toWorld(Math.min(x0, x1), Math.min(y0, y1)), b = toWorld(Math.max(x0, x1), Math.max(y0, y1));
  const ids = g.ents.filter(e => !e.dead && e.k === 'u' && e.owner === ME && e.x >= a.x && e.x <= b.x && (e.y - (e.st.air ? e.st.alt : 0)) >= a.y && (e.y - (e.st.air ? e.st.alt : 0)) <= b.y).map(e => e.id);
  if (ids.length) setSel(add ? Array.from(new Set(sel.concat(ids))) : ids);
  else if (!add) sel = [];
}
function doClickSelect(add, dbl) {
  const e = entityAt(mouse.wx, mouse.wy, true);
  if (!e) { if (!add) sel = []; return; }
  if (dbl && e.k === 'u' && e.owner === ME) {
    const x0 = cam.x, y0 = cam.y, x1 = cam.x + vw / ts, y1 = cam.y + vh / ts;
    setSel(g.ents.filter(o => !o.dead && o.k === 'u' && o.owner === ME && o.type === e.type && o.x >= x0 && o.x <= x1 && o.y >= y0 && o.y <= y1).map(o => o.id)); return;
  }
  if (add && e.k === 'u' && e.owner === ME && myUnits(selected()).length === selected().length) setSel(Array.from(new Set(sel.concat([e.id]))));
  else setSel([e.id]);
}
function rightClick() {
  const s = selected(); if (!s.length) return;
  const e = entityAt(mouse.wx, mouse.wy);
  const units = myUnits(s);
  if (!units.length) { // bina: toplanma noktası
    const b = s[0]; if (b.k === 'b' && b.owner === ME && BLD[b.type].train) {
      if (e && e.k === 'r') Sim.cmdRally(g, b.id, 0, 0, e.id); else Sim.cmdRally(g, b.id, mouse.wx, mouse.wy);
      g.fx.push({ t: 'place', x: mouse.wx, y: mouse.wy, life: 0.4, max: 0.4 }); snd.cmd();
    }
    return;
  }
  const ids = units.map(u => u.id), vil = units.filter(u => u.type === 'villager').map(u => u.id), builders = units.filter(u => u.type === 'villager' || u.type === 'engineer').map(u => u.id);
  const spies = units.filter(u => u.type === 'spy').map(u => u.id);
  const demos = units.filter(u => u.type === 'demo').map(u => u.id);
  if (e && e.k === 'b' && e.owner >= 0 && e.owner !== ME && demos.length) { Sim.cmdC4(g, demos, e.id); const rest = ids.filter(i => demos.indexOf(i) < 0 && spies.indexOf(i) < 0); if (rest.length) Sim.cmdAttack(g, rest, e.id); if (spies.length) Sim.cmdSpy(g, spies, e.id, 'sabotage'); }
  else if (e && e.k === 'b' && e.owner >= 0 && e.owner !== ME && spies.length) { Sim.cmdSpy(g, spies, e.id, 'sabotage'); const rest = ids.filter(i => spies.indexOf(i) < 0); if (rest.length) Sim.cmdAttack(g, rest, e.id); }
  else if (e && e.owner >= 0 && e.owner !== ME) { Sim.cmdAttack(g, ids, e.id); }
  else if (e && e.k === 'r') { if (vil.length) Sim.cmdGather(g, vil, e.id); const rest = units.filter(u => u.type !== 'villager').map(u => u.id); if (rest.length) Sim.cmdMove(g, rest, mouse.wx, mouse.wy, false); }
  else if (e && e.k === 'b' && e.owner === ME && !e.done && builders.length) Sim.cmdBuildHelp(g, builders, e.id);
  else if (e && e.k === 'b' && e.owner === ME && e.done && e.hp < e.maxhp && !BLD[e.type].farm && builders.length) Sim.cmdRepair(g, builders, e.id);
  else if (e && e.k === 'b' && e.owner === ME && BLD[e.type].farm && vil.length) Sim.cmdGather(g, vil, e.id);
  else if (e && e.k === 'b' && e.owner === ME && BLD[e.type].drop && vil.some(v => g.byId.get(v).carry > 0)) Sim.cmdReturn(g, vil);
  else Sim.cmdMove(g, ids, mouse.wx, mouse.wy, false);
  g.fx.push({ t: e && e.owner >= 0 && e.owner !== ME ? 'hit' : 'place', x: mouse.wx, y: mouse.wy, life: 0.35, max: 0.35 }); snd.cmd();
}
let wallDrag = null;
function wallTiles() {
  if (!wallDrag) return [];
  const x1 = Math.floor(mouse.wx), y1 = Math.floor(mouse.wy), x0 = wallDrag.x, y0 = wallDrag.y, out = [];
  if (Math.abs(x1 - x0) >= Math.abs(y1 - y0)) { for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) out.push([x, y0]); }
  else { for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) out.push([x0, y]); }
  return out;
}
function finishWall() {
  const ids = myUnits(selected()).filter(u => u.type === 'engineer').map(u => u.id);
  let n = 0, fail = 0;
  for (const [x, y] of wallTiles()) { if (ids.length && Sim.cmdBuild(g, ME, ids, 'wall', x, y)) n++; else fail++; }
  wallDrag = null;
  if (n) { snd.cmd(); if (!keys.Shift) mode = null; } else { snd.err(); toast(ids.length ? 'Sur buraya kurulamaz veya odun yetmiyor.' : 'Sur sadece Mimar/Mühendis yapar.', 1600); }
  if (n && fail) toast(fail + ' kare atlandı (engel/odun).', 1600);
}
function tryPlace() {
  const s = BLD[mode.type].s, tx = Math.round(mouse.wx - s / 2), ty = Math.round(mouse.wy - s / 2);
  const vil = myUnits(selected()).filter(u => u.type === 'villager' || u.type === 'engineer').map(u => u.id);
  const b = vil.length ? Sim.cmdBuild(g, ME, vil, mode.type, tx, ty) : null;
  if (b) { snd.cmd(); if (!keys.Shift) mode = null; }
  else { snd.err(); toast(Sim.canAfford(g.owners[ME], BLD[mode.type].cost) ? 'Buraya inşa edilemez.' : 'Kaynak yetersiz!', 1500); }
}

/* ---------- panel ---------- */
let lastSig = '';
let sellArm = null;
function trySell() {
  const e = selected()[0]; if (!e || e.k !== 'b' || e.owner !== ME || e.type === 'tc') return;
  if (sellArm && sellArm.id === e.id && performance.now() - sellArm.t < 4000) { if (Sim.cmdSell(g, ME, e.id)) { snd.cmd(); sel = []; } else snd.err(); sellArm = null; }
  else { sellArm = { id: e.id, t: performance.now() }; snd.click(); setTimeout(() => { lastSig = ''; }, 4100); }
  lastSig = '';
}
const KEYS = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Z', 'X', 'C', 'V'];
function costStr(c) { return [c.f ? '🌾' + c.f : '', c.w ? '🪵' + c.w : '', c.g ? '🪙' + c.g : '', c.i ? '⛏' + c.i : ''].filter(Boolean).join(' '); }
let progInfo = null;
function lockTxt(age) { return '🔒 ' + Sim.AGES[age].name; }
function uname(owner, type) { return CIVS[g.owners[owner].civ].names[type] || UNIT[type].name; }
function updatePanel() {
  const s = selected(), me = g.owners[ME];
  const units = myUnits(s);
  let info = '', cmds = '';
  const aff = c => Sim.canAfford(me, c);
  progInfo = null;
  if (!s.length) { info = '<div class="hint">Birim seçmek için tıkla veya kutu çiz.<br>Sağ tık: hareket / saldırı / topla.</div>'; }
  else if (units.length) {
    const cnt = {}; units.forEach(u => cnt[u.type] = (cnt[u.type] || 0) + 1);
    if (units.length === 1) {
      const u = units[0];
      info = `<div class="nm">${uname(ME, u.type)}</div><div class="st">❤ ${Math.ceil(u.hp)}/${u.maxhp} &nbsp; ⚔ ${u.st.atk.toFixed(0)} &nbsp; 🛡 ${u.st.armor}${u.type === 'villager' && u.carry ? ' &nbsp; 📦 ' + u.carry : ''}</div><div class="hint">${u.order === 'gather' ? 'Topluyor' : u.order === 'build' ? 'İnşa ediyor' : u.order === 'attack' ? 'Saldırıyor' : u.order === 'idle' ? 'Beklemede' : 'Hareket ediyor'}</div>`;
    } else info = `<div class="nm">${units.length} birim</div><div class="chips">${Object.keys(cnt).map(t => `<span>${uname(ME, t)} ×${cnt[t]}</span>`).join('')}</div>`;
    if (units.some(u => u.type === 'engineer')) info += '<div class="hint">📐 Köprü (su üstüne), Sur (sürükle), Kapı, Mayın kurar. Hasarlı binaya sağ tık → onarır. İnşaatı 1.6x hızlı yapar.</div>';
    if (units.some(u => u.type === 'villager' || u.type === 'engineer')) {
      if (!units.some(u => u.type === 'villager')) info += '';
      info += '<div class="hint">Sağ tık: altın 🪙 / ağaç 🪵 / çalı-çiftlik 🌾 üstüne → içeri girip çalışır, kazanç direkt kasana yazılır. Kapasite: ağaç 3, çalı 4, altın 8, çiftlik 4.</div>';
      const hasEng = units.some(u => u.type === 'engineer');
      cmds += Object.keys(BLD).filter(t => t !== 'tc' && (hasEng || !BLD[t].eng)).map((t, i) => { const lk = (BLD[t].age || 0) > me.age; return `<button class="cb ${lk ? 'lock' : aff(BLD[t].cost) ? '' : 'dis'}" data-act="place" data-t="${t}" data-desc="${(BLD[t].desc || '').replace(/"/g, '&quot;')}"><i>${KEYS[i] || ''}</i><b>${ICON[t]}</b><span>${BLD[t].name}</span><em>${lk ? lockTxt(BLD[t].age) : costStr(BLD[t].cost)}</em></button>`; }).join('');
    }
    if (units.some(u => u.type !== 'villager' && u.st.atk > 0)) cmds += `<button class="cb" data-act="amove"><i>A</i><b>🎯</b><span>Saldırarak ilerle</span></button>`;
    if (units.some(u => u.type === 'hero')) { const cd = me.cryCd > 0; info += '<div class="hint">👑 Çevresindeki dost birimlere +%20 saldırı ve %12 daha az hasar verir (aura). Düşerse birlikler sarsılır.</div>'; cmds += `<button class="cb ${cd ? 'dis' : 'age'}" data-act="herocry"><i>N</i><b>📯</b><span>Savaş Narası</span><em>${cd ? Math.ceil(me.cryCd) + ' sn' : '12 sn: +%25 hız ve saldırı'}</em></button>`; }
    if (units.some(u => u.type === 'demo')) info += '<div class="hint">🧨 Düşman binasına sağ tık → C4 yerleştirir ve patlar (320 hasar, kendi de ölür).</div>';
    if (units.some(u => u.type === 'medic')) info += '<div class="hint">⚕️ Yakındaki dost birimleri iyileştirir. Orduyla birlikte gönder.</div>';
    if (units.some(u => u.type === 'spy')) {
      info += '<div class="hint">🕵️ Düşman binasına sağ tık → sabotaj. Kılıkta düşman yalnız köpek/mimar yakınındayken fark eder.</div>';
      const dis = units.some(u => u.type === 'spy' && u.disguised);
      cmds += `<button class="cb ${dis ? 'done' : ''}" data-act="disguise"><b>🎭</b><span>${dis ? 'Kılığı bırak' : 'Kılık değiştir'}</span><em>yavaşlar</em></button>`
        + `<button class="cb" data-act="spymode" data-k="sabotage"><b>💣</b><span>Sabotaj</span><em>bina 30sn durur</em></button>`
        + `<button class="cb" data-act="spymode" data-k="steal"><b>📜</b><span>Teknoloji çal</span><em>Akademi</em></button>`
        + `<button class="cb" data-act="spymode" data-k="loot"><b>💰</b><span>Hazine soy</span><em>Şehir Merkezi</em></button>`;
    }
    cmds += `<button class="cb" data-act="stop"><i>S</i><b>✋</b><span>Dur</span></button>`;
  } else {
    const e = s[0];
    if (e.k === 'b') {
      const d = BLD[e.type];
      info = `<div class="nm">${d.name}${e.owner === ME ? '' : ' (düşman)'}</div><div class="st">❤ ${Math.ceil(e.hp)}/${e.maxhp}${e.done ? '' : ' &nbsp; 🔨 %' + Math.floor(e.progress * 100)}${d.pop && e.done ? ' &nbsp; 👥 +' + d.pop : ''}</div>`;
      progInfo = null;
      if (e.owner === ME && e.done && d.train) {
        cmds += d.train.map((t, i) => { const st = Sim.unitStats(g, ME, t), lk = (UNIT[t].age || 0) > me.age; return `<button class="cb ${lk ? 'lock' : aff(UNIT[t].cost) ? '' : 'dis'}" data-act="train" data-t="${t}"><i>${KEYS[i]}</i><b>${UICON[t]}</b><span>${uname(ME, t)}</span><em>${lk ? lockTxt(UNIT[t].age) : costStr(UNIT[t].cost) + ' · ' + Math.round(st.time) + 'sn'}</em></button>`; }).join('');
        if (e.type === 'tc') {
          const a = Sim.AGES[me.age + 1];
          if (me.ageUp) { info += '<div class="prog"><div id="progBar"></div><span id="progTxt"></span></div>'; progInfo = 'age'; }
          else if (a) { const okReq = Sim.hasDone(g, ME, a.req); cmds += `<button class="cb age ${okReq && aff(a.cost) ? '' : 'dis'}" data-act="ageup"><i>${KEYS[d.train.length]}</i><b>🏛️</b><span>${a.name}</span><em>${costStr(a.cost)} · ${a.time}sn${okReq ? '' : ' · ' + a.reqName + ' gerekli'}</em></button>`; }
          else info += '<div class="hint">En yüksek çağdasın.</div>';
        }
        if (!d.research) { const gr = []; e.queue.forEach((q, i) => { const L = gr[gr.length - 1]; if (L && L.type === q.type) { L.n++; L.last = i; } else gr.push({ type: q.type, n: 1, last: i }); }); info += `<div class="queue">${gr.map(x => `<button data-act="cancel" data-i="${x.last}" title="Sonuncuyu iptal et">${UICON[x.type]}${x.n > 1 ? '<sup>×' + x.n + '</sup>' : ''}</button>`).join('') || '<span class="hint">Üretim kuyruğu boş · Sağ tık: toplanma noktası</span>'}${e.queue.length > 1 ? '<span class="hint"> · toplam ' + e.queue.length + '</span>' : ''}</div>`; }
      }
      if (e.owner === ME && e.done && d.research) {
        const busyIds = g.ents.filter(x => !x.dead && x.k === 'b' && x.owner === ME && x.research).map(x => x.research.id);
        cmds += Object.keys(Sim.TECH).map((id, i) => { const t = Sim.TECH[id], own = me.techs.indexOf(id) >= 0, bz = busyIds.indexOf(id) >= 0, lk = t.age > me.age;
          return `<button class="cb ${own ? 'done' : bz ? 'busy' : lk ? 'lock' : aff(t.cost) ? '' : 'dis'}" data-act="research" data-t="${id}" title="${t.desc}"><i>${KEYS[i] || ''}</i><b>${own ? '✔' : '🔬'}</b><span>${t.name}</span><em>${own ? 'Tamam' : lk ? lockTxt(t.age) : costStr(t.cost) + ' · ' + t.time + 'sn'}</em></button>`; }).join('');
        if (e.research) { info += `<div class="hint">🔬 ${Sim.TECH[e.research.id].name}</div><div class="prog"><div id="progBar"></div><span id="progTxt"></span></div><button class="cb" style="width:auto;height:26px;margin-top:6px" data-act="cancelres">İptal</button>`; progInfo = 'res'; }
        else info += '<div class="hint">Araştırma seç: üstüne gel → açıklama. Bitince tüm birimler/binalar etkilenir.</div>';
      }
      if (e.owner === ME && d.cost && e.type !== 'tc') {
        const k = e.done ? 0.6 : 1, back = costStr({ f: Math.floor((d.cost.f || 0) * k), w: Math.floor((d.cost.w || 0) * k), g: Math.floor((d.cost.g || 0) * k), i: Math.floor((d.cost.i || 0) * k) });
        const arm = sellArm && sellArm.id === e.id && performance.now() - sellArm.t < 4000;
        cmds += `<button class="cb ${arm ? 'age' : ''}" data-act="sell"><i>Del</i><b>💸</b><span>${arm ? 'Emin misin? Tekrar bas' : 'Sat'}</span><em>iade: ${back || '-'}</em></button>`;
      }
    } else if (e.k === 'r') {
      const d = RESDEF[e.type], wk = g.ents.filter(u => !u.dead && u.k === 'u' && u.order === 'gather' && u.target === e.id && u.owner === ME).length;
      info = `<div class="nm">${d.name}</div><div class="st">Kalan: ${e.amount} &nbsp; 👷 ${wk}/${d.cap}</div>`;
      if (wk) cmds += `<button class="cb" data-act="selworkers"><b>👷</b><span>Çalışanları seç</span></button>`;
    } else if (e.k === 'u') {
      info = `<div class="nm">${uname(e.owner, e.type)} (düşman)</div><div class="st">❤ ${Math.ceil(e.hp)}/${e.maxhp}</div>`;
    }
  }
  const sig = info + '|' + cmds;
  if (sig !== lastSig) { lastSig = sig; $('info').innerHTML = info; $('cmds').innerHTML = cmds; }
  { const bar = $('progBar'), txt = $('progTxt');
    if (bar && progInfo) {
      let pct = 0, tx = '';
      if (progInfo === 'age' && me.ageUp) { pct = me.ageUp.t / me.ageUp.time; tx = Sim.AGES[me.ageUp.to].name + ' · ' + Math.ceil(me.ageUp.time - me.ageUp.t) + ' sn'; }
      else if (progInfo === 'res' && s[0] && s[0].research) { const t = Sim.TECH[s[0].research.id]; pct = s[0].research.t / t.time; tx = Math.ceil(t.time - s[0].research.t) + ' sn'; }
      bar.style.width = Math.min(100, pct * 100) + '%'; if (txt) txt.textContent = tx;
    } }
}
$('panel').addEventListener('click', ev => {
  const b = ev.target.closest('[data-act]'); if (!b || !g) return;
  const act = b.dataset.act, s = selected();
  if (act === 'place') { if ((BLD[b.dataset.t].age || 0) > g.owners[ME].age) { snd.err(); toast(BLD[b.dataset.t].name + ' için ' + Sim.AGES[BLD[b.dataset.t].age].name + ' gerekli!', 1800); } else if (Sim.canAfford(g.owners[ME], BLD[b.dataset.t].cost)) { mode = { k: 'place', type: b.dataset.t }; snd.click(); } else { snd.err(); toast('Kaynak yetersiz!', 1200); } }
  else if (act === 'amove') { mode = { k: 'amove' }; snd.click(); }
  else if (act === 'herocry') { if (Sim.cmdHeroCry(g, ME)) snd.cry(); else snd.err(); }
  else if (act === 'disguise') { if (Sim.cmdDisguise(g, sel)) snd.click(); }
  else if (act === 'spymode') { mode = { k: 'spy', kind: b.dataset.k }; snd.click(); }
  else if (act === 'sell') trySell();
  else if (act === 'stop') { Sim.cmdStop(g, sel); snd.click(); }
  else if (act === 'train') { const bs = s.filter(x => x.k === 'b' && x.owner === ME); let ok = false; const n = ev.shiftKey ? 5 : 1; for (let i = 0; i < n; i++) ok = Sim.cmdTrain(g, bs[0].id, b.dataset.t) || ok; if (ok) snd.click(); else snd.err(); }
  else if (act === 'selworkers') { const ids = g.ents.filter(u => !u.dead && u.k === 'u' && u.order === 'gather' && u.target === s[0].id && u.owner === ME).map(u => u.id); if (ids.length) setSel(ids); }
  else if (act === 'ageup') { if (Sim.cmdAgeUp(g, ME)) snd.click(); else snd.err(); }
  else if (act === 'research') { if (Sim.cmdResearch(g, s[0].id, b.dataset.t)) snd.click(); else snd.err(); }
  else if (act === 'cancelres') { Sim.cmdCancelResearch(g, s[0].id); snd.click(); }
  else if (act === 'cancel') { Sim.cmdCancel(g, s[0].id, +b.dataset.i); snd.click(); }
  lastSig = '';
});
function hotkeyBtn(i) { const els = $('cmds').querySelectorAll('.cb'); if (els[i]) els[i].click(); }

function banner(t, sub) { const b = $('banner'); b.classList.add('hide'); void b.offsetWidth; b.querySelector('b').textContent = t; b.querySelector('span').textContent = sub || ''; b.classList.remove('hide'); clearTimeout(banner._t); banner._t = setTimeout(() => b.classList.add('hide'), 3700); }
function toast(text, ms) {
  const d = document.createElement('div'); d.className = 'toast'; d.textContent = text; $('toasts').appendChild(d);
  setTimeout(() => d.remove(), ms || 3000);
}

/* ---------- üst çubuk ---------- */
function updateHud() {
  const me = g.owners[ME], t = Math.floor(g.time);
  $('rf').textContent = Math.floor(me.res.f); $('rw').textContent = Math.floor(me.res.w); $('rg').textContent = Math.floor(me.res.g); $('ri').textContent = Math.floor(me.res.i);
  $('age').textContent = me.ageUp ? Sim.AGES[me.age].name.replace(' Çağı', '') + ' → ' + Sim.AGES[me.ageUp.to].name.replace(' Çağı', '') + ' %' + Math.floor(me.ageUp.t / me.ageUp.time * 100) : Sim.AGES[me.age].name;
  $('rp').textContent = me.pop + '/' + me.popcap + ' · ⚔' + me.army + '/' + me.armycap; $('rp').parentElement.title = 'İşçi: sayı/sınır (Ev başına +5) · Ordu: sayı/sınır (Ev başına +10)'; $('rp').parentElement.classList.toggle('warn', me.pop >= me.popcap || me.army >= me.armycap);
  $('rt').textContent = Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
  if (g.env && $('env')) { const e = g.env, PH = { dawn: '🌅 Şafak', day: '☀️ Gündüz', dusk: '🌇 Akşam', night: '🌙 Gece' }, WX = { rain: '🌧 Yağmur', storm: '⛈ Fırtına', fog: '🌫 Sis' }; const txt = PH[e.phase] + (e.weather !== 'clear' && e.ws > 0.3 ? ' · ' + WX[e.weather] : ''); if ($('env').textContent !== txt) $('env').textContent = txt; $('envbox').title = 'Görüş çarpanı: %' + Math.round(e.sightMul * 100); if (performance.now() - lastWx > 600) { lastWx = performance.now(); GameAudio.setWeather(e.weather, e.ws); } }
  const p = CIVS[me.civ].power, btn = $('power');
  btn.querySelector('b').textContent = p.name;
  const cd = Math.ceil(me.powerCd);
  btn.classList.toggle('ready', cd <= 0); btn.classList.toggle('active', !!(mode && mode.k === 'power'));
  btn.querySelector('em').textContent = cd > 0 ? cd + ' sn' : 'HAZIR';
  const idle = g.ents.filter(e => !e.dead && e.k === 'u' && e.owner === ME && e.type === 'villager' && e.order === 'idle').length;
  $('idle').textContent = '🧑‍🌾 Boşta: ' + idle; $('idle').classList.toggle('on', idle > 0);
}
$('power').addEventListener('click', () => {
  const me = g.owners[ME]; if (me.powerCd > 0) { snd.err(); return; }
  mode = mode && mode.k === 'power' ? null : { k: 'power' }; snd.click();
});
$('idle').addEventListener('click', selectIdle);
function selectIdle() {
  const l = g.ents.filter(e => !e.dead && e.k === 'u' && e.owner === ME && e.type === 'villager' && e.order === 'idle'); if (!l.length) return;
  const cur = sel.length === 1 ? l.findIndex(u => u.id === sel[0]) : -1; const u = l[(cur + 1) % l.length]; setSel([u.id]); centerOn(u.x, u.y);
}
$('spd').addEventListener('click', () => { speed = speed === 1 ? 2 : speed === 2 ? 3 : 1; $('spd').textContent = '⏩ ' + speed + 'x'; });
$('pause').addEventListener('click', () => togglePause());
$('mute').addEventListener('click', () => { muted = !muted; GameAudio.setMuted(muted); $('mute').textContent = muted ? '🔇' : '🔊'; });
$('music').addEventListener('click', () => { musicOn = !musicOn; $('music').style.opacity = musicOn ? 1 : 0.45; GameAudio.setMusicOn(musicOn, running && g ? g.owners[ME].age : -1); });
$('menuBtn').addEventListener('click', () => { paused = true; GameAudio.duck(true); $('pausePanel').classList.remove('hide'); });
$('resume').addEventListener('click', () => { paused = false; GameAudio.duck(false); $('pausePanel').classList.add('hide'); });
$('quit').addEventListener('click', () => { running = false; paused = false; GameAudio.duck(false); $('pausePanel').classList.add('hide'); showMenu(); });
function togglePause() { paused = !paused; GameAudio.duck(paused); $('pausePanel').classList.toggle('hide', !paused); }

/* ---------- olaylar ---------- */
function handleEvents() {
  for (const ev of g.events) {
    if (ev.type === 'attacked' && ev.owner === ME) { snd.alert(); toast('⚠ Saldırı altındasınız!', 2500); pings.push({ x: ev.x, y: ev.y, t: performance.now() }); lastAlert = { x: ev.x, y: ev.y }; }
    else if (ev.type === 'built' && ev.owner === ME) { snd.built(); toast(BLD[ev.btype].name + ' tamamlandı.', 1800); }
    else if (ev.type === 'trained') snd.trained();
    else if (ev.type === 'phase' && settings.dayNight) toast({ dawn: '🌅 Şafak söktü.', day: '☀️ Gün ağardı.', dusk: '🌇 Akşam oluyor: görüş azalacak.', night: '🌙 Gece bastı: görüş kısıtlı, binalar aydınlandı.' }[ev.phase], 3200);
    else if (ev.type === 'weather' && settings.weather) toast({ rain: '🌧 Yağmur başladı: görüş azaldı.', storm: '⛈ Fırtına çıktı! Görüş azaldı.', fog: '🌫 Sis çöktü: görüş çok azaldı.', clear: '🌤 Hava açıldı.' }[ev.kind], 3200);
    else if (ev.type === 'age') { if (ev.owner === ME) { snd.age(); GameAudio.setAge(ev.age); banner(Sim.AGES[ev.age].name.toUpperCase(), 'Yeni birimler ve binalar açıldı!'); } else toast('⚠ Düşman ' + Sim.AGES[ev.age].name + '\'na geçti!', 3500); }
    else if (ev.type === 'tech' && ev.owner === ME) { snd.built(); toast('🔬 ' + Sim.TECH[ev.id].name + ' tamamlandı.', 2500); }
    else if (ev.type === 'msg') { toast(ev.text, 2200); snd.err(); }
    else if (ev.type === 'story' && window.CampUI) { snd.built(); CampUI.story(ev); }
    else if (ev.type === 'objdone' && window.CampUI) { snd.trained(); toast('✔ Hedef tamamlandı: ' + ev.text, 3500); }
    else if (ev.type === 'gameover') endGame(ev.winner === ME, ev);
  }
  g.events.length = 0;
}
function endGame(win, ev) {
  running = false; mode = null;
  const me = g.owners[ME], t = Math.floor(g.time);
  const mine = g.ents.filter(e => e.owner === ME);
  $('endTitle').textContent = win ? 'ZAFER!' : 'YENİLGİ';
  $('endTitle').className = win ? 'win' : 'lose';
  $('endText').textContent = win ? `Düşmanın Şehir Merkezi yıkıldı. Süre: ${Math.floor(t / 60)} dk ${t % 60} sn.` : `Şehir Merkezin yıkıldı. ${Math.floor(t / 60)} dk ${t % 60} sn dayandın.`;
  $('again').textContent = 'TEKRAR OYNA';
  if (g.camp && window.CampUI) CampUI.end(g, win, ev);
  $('end').classList.remove('hide'); GameAudio.stopMusic(); win ? snd.win() : snd.lose();
}
$('again').addEventListener('click', () => { $('end').classList.add('hide'); if (g && g.camp && window.CampUI) CampUI.again(); else startGame(); });
$('toMenu').addEventListener('click', () => { $('end').classList.add('hide'); showMenu(); });

/* ---------- fare ve klavye ---------- */
function overUi(ev) { return ev.target !== cv; }
cv.addEventListener('mousedown', ev => {
  if (!g) return;
  mouse.x = ev.clientX; mouse.y = ev.clientY; const w = toWorld(ev.clientX, ev.clientY); mouse.wx = w.x; mouse.wy = w.y;
  if (ev.button === 0) {
    if (mode && mode.k === 'place') { if (mode.type === 'wall') wallDrag = { x: Math.floor(mouse.wx), y: Math.floor(mouse.wy) }; else tryPlace(); return; }
    if (mode && mode.k === 'amove') { const u = myUnits(selected()).map(x => x.id); Sim.cmdMove(g, u, mouse.wx, mouse.wy, true); mode = null; snd.cmd(); g.fx.push({ t: 'place', x: mouse.wx, y: mouse.wy, life: 0.35, max: 0.35 }); return; }
    if (mode && mode.k === 'spy') { const e = entityAt(mouse.wx, mouse.wy), sp = myUnits(selected()).filter(u => u.type === 'spy').map(u => u.id); if (e && e.k === 'b' && e.owner >= 0 && e.owner !== ME && Sim.cmdSpy(g, sp, e.id, mode.kind)) { snd.cmd(); mode = null; } else { snd.err(); toast(mode.kind === 'steal' ? 'Teknoloji çalmak için düşman Akademi seç.' : mode.kind === 'loot' ? 'Soygun için düşman Şehir Merkezi seç.' : 'Düşman binası seç.', 1600); } return; }
    if (mode && mode.k === 'power') { if (Sim.cmdPower(g, ME, mouse.wx, mouse.wy)) { snd.power(); mode = null; } return; }
    drag = { x0: ev.clientX, y0: ev.clientY, moved: false, t: performance.now() };
  } else if (ev.button === 2) {
    if (mode) { mode = null; return; }
    rightClick();
  }
});
window.addEventListener('mousemove', ev => {
  mouse.x = ev.clientX; mouse.y = ev.clientY; mouse.in = ev.target === cv;
  if (g) { const w = toWorld(ev.clientX, ev.clientY); mouse.wx = w.x; mouse.wy = w.y; }
  if (drag && Math.hypot(ev.clientX - drag.x0, ev.clientY - drag.y0) > 5) drag.moved = true;
});
window.addEventListener('mouseup', ev => {
  if (wallDrag && ev.button === 0) { finishWall(); return; }
  if (!drag || ev.button !== 0) return;
  const add = ev.shiftKey;
  if (drag.moved) doSelectBox(drag.x0, drag.y0, ev.clientX, ev.clientY, add);
  else { doClickSelect(add, performance.now() - lastClickT < 350); lastClickT = performance.now(); }
  drag = null;
});
let lastClickT = 0;
cv.addEventListener('contextmenu', e => e.preventDefault());
cv.addEventListener('wheel', ev => {
  ev.preventDefault(); const before = toWorld(ev.clientX, ev.clientY);
  ts = Math.max(20, Math.min(64, ts * (ev.deltaY < 0 ? 1.1 : 0.9)));
  cam.x = before.x - ev.clientX / ts; cam.y = before.y - ev.clientY / ts; clampCam();
}, { passive: false });
window.addEventListener('keydown', ev => {
  if (!g || !running) return;
  const k = ev.key; keys[k] = true;
  if (k === 'Escape') { if (wallDrag) wallDrag = null; else if (mode) mode = null; else if (sel.length) sel = []; else togglePause(); return; }
  if (k === 'p' || k === 'P') { togglePause(); return; }
  if (k === 'Delete') { trySell(); return; }
  if (/^[1-9]$/.test(k)) {
    if (ev.ctrlKey) { groups[k] = sel.slice(); toast('Grup ' + k + ' kaydedildi', 900); ev.preventDefault(); }
    else if (groups[k]) { const l = groups[k].filter(i => g.byId.get(i) && !g.byId.get(i).dead); if (l.length) { if (sel.join() === l.join()) { const e = g.byId.get(l[0]); const c = Sim.centerOf(e); centerOn(c.x, c.y); } setSel(l); } }
    return;
  }
  const K = k.toUpperCase();
  const ki = KEYS.indexOf(K);
  const s = selected();
  if (K === 'A' && myUnits(s).some(u => u.type !== 'villager')) { mode = { k: 'amove' }; return; }
  if (K === 'S' && myUnits(s).length) { Sim.cmdStop(g, sel); return; }
  if (K === 'N' && myUnits(s).some(u => u.type === 'hero')) { if (Sim.cmdHeroCry(g, ME)) snd.cry(); else snd.err(); return; }
  if (ki >= 0 && s.length) { hotkeyBtn(ki); return; }
  if (K === 'H') { const tc = g.ents.find(e => !e.dead && e.owner === ME && e.type === 'tc'); if (tc) { const c = Sim.centerOf(tc); centerOn(c.x, c.y); sel = [tc.id]; } }
  if (K === '.' || K === ',') selectIdle();
  if (K === ' ') { ev.preventDefault(); if (lastAlert) centerOn(lastAlert.x, lastAlert.y); }
  if (K === 'F') { const e = g.ents.find(e => !e.dead && e.owner === ME && e.type === 'tc'); }
  if (k.startsWith('Arrow')) ev.preventDefault();
});
window.addEventListener('keyup', ev => { delete keys[ev.key]; });
window.addEventListener('blur', () => { keys = {}; });

/* ---------- dokunmatik (telefon/tablet) ---------- */
const IS_TOUCH = (window.matchMedia && matchMedia('(pointer:coarse)').matches) || 'ontouchstart' in window;
if (IS_TOUCH) document.body.classList.add('touch');
let boxMode = false; const tpts = new Map(); let tg = null, pinch = null;
function tSetMouse(x, y) { mouse.x = x; mouse.y = y; const w = toWorld(x, y); mouse.wx = w.x; mouse.wy = w.y; }
function synthClick(x, y) { // modlar ve seçim için fare tıklamasını taklit et
  cv.dispatchEvent(new MouseEvent('mousedown', { clientX: x, clientY: y, button: 0, bubbles: true }));
  window.dispatchEvent(new MouseEvent('mouseup', { clientX: x, clientY: y, button: 0, bubbles: true }));
}
function tapAt(x, y) {
  tSetMouse(x, y);
  if (mode) { synthClick(x, y); return; }
  const e = entityAt(mouse.wx, mouse.wy, true), mine = myUnits(selected());
  if (e && e.k === 'u' && e.owner === ME) { synthClick(x, y); return; }
  if (mine.length && !boxMode) {
    if (e && e.k === 'b' && e.owner === ME && !mine.some(u => u.type === 'villager' || u.type === 'engineer')) { synthClick(x, y); return; }
    if (e && e.k === 'b' && e.owner === ME && e.done && e.hp >= e.maxhp && !BLD[e.type].farm && !BLD[e.type].drop) { synthClick(x, y); return; }
    rightClick(); return;
  }
  synthClick(x, y);
}
cv.addEventListener('pointerdown', ev => {
  if (ev.pointerType === 'mouse' || !g) return;
  ev.preventDefault(); try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* yok */ }
  GameAudio.unlock(); tpts.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
  if (tpts.size === 2) {
    clearTimeout(tg && tg.lp); tg = null; if (drag) drag = null; if (wallDrag) wallDrag = null;
    const [a, b] = [...tpts.values()]; pinch = { d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, ts0: ts };
    return;
  }
  if (tpts.size > 2) return;
  tSetMouse(ev.clientX, ev.clientY);
  tg = { x0: ev.clientX, y0: ev.clientY, cx0: cam.x, cy0: cam.y, moved: false, long: false };
  if (mode && mode.k === 'place' && mode.type === 'wall') wallDrag = { x: Math.floor(mouse.wx), y: Math.floor(mouse.wy) };
  tg.lp = setTimeout(() => { // basılı tut: aynı türden hepsini seç
    if (!tg || tg.moved || mode) return; const e = entityAt(mouse.wx, mouse.wy, true);
    if (e && e.k === 'u' && e.owner === ME) { tg.long = true; doClickSelect(false, true); if (navigator.vibrate) navigator.vibrate(15); }
  }, 520);
}, { passive: false });
cv.addEventListener('pointermove', ev => {
  if (ev.pointerType === 'mouse' || !tpts.has(ev.pointerId)) return;
  ev.preventDefault(); tpts.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
  if (pinch && tpts.size === 2) {
    const [a, b] = [...tpts.values()], cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2, d = Math.hypot(a.x - b.x, a.y - b.y), before = toWorld(cx, cy);
    ts = Math.max(20, Math.min(64, pinch.ts0 * d / pinch.d0)); cam.x = before.x - cx / ts; cam.y = before.y - cy / ts; clampCam(); return;
  }
  if (!tg) return;
  const dx = ev.clientX - tg.x0, dy = ev.clientY - tg.y0;
  if (!tg.moved && Math.hypot(dx, dy) > 9) { tg.moved = true; clearTimeout(tg.lp); }
  tSetMouse(ev.clientX, ev.clientY);
  if (!tg.moved) return;
  if (mode) return;                      // yerleştirme/güç modunda parmak nişan alır
  if (boxMode) { drag = { x0: tg.x0, y0: tg.y0, moved: true, t: performance.now() }; return; }
  cam.x = tg.cx0 - dx / ts; cam.y = tg.cy0 - dy / ts; clampCam();
}, { passive: false });
function tEnd(ev) {
  if (ev.pointerType === 'mouse' || !tpts.has(ev.pointerId)) return;
  tpts.delete(ev.pointerId); if (tpts.size < 2) pinch = null;
  if (!tg || tpts.size) { if (!tpts.size) tg = null; return; }
  clearTimeout(tg.lp); const t = tg; tg = null;
  if (ev.type === 'pointercancel') { drag = null; wallDrag = null; return; }
  tSetMouse(ev.clientX, ev.clientY);
  if (wallDrag) { finishWall(); return; }
  if (t.long) return;
  if (drag) { doSelectBox(drag.x0, drag.y0, ev.clientX, ev.clientY, false); drag = null; return; }
  if (mode && mode.k === 'place') { tryPlace(); return; }
  if (mode) { if (t.moved) { synthClick(ev.clientX, ev.clientY); } else synthClick(ev.clientX, ev.clientY); return; }
  if (!t.moved) tapAt(ev.clientX, ev.clientY);
}
cv.addEventListener('pointerup', tEnd); cv.addEventListener('pointercancel', tEnd);
mini.addEventListener('pointerdown', ev => { if (ev.pointerType === 'mouse' || !g) return; ev.preventDefault(); const r = mini.getBoundingClientRect(); centerOn((ev.clientX - r.left) / r.width * W, (ev.clientY - r.top) / r.height * H); mini._tdrag = true; try { mini.setPointerCapture(ev.pointerId); } catch (e) { /* yok */ } }, { passive: false });
mini.addEventListener('pointermove', ev => { if (ev.pointerType === 'mouse' || !mini._tdrag) return; const r = mini.getBoundingClientRect(); centerOn((ev.clientX - r.left) / r.width * W, (ev.clientY - r.top) / r.height * H); });
mini.addEventListener('pointerup', () => { mini._tdrag = false; });
// mobil araç çubuğu
const tb = $('tbar');
if (tb) tb.addEventListener('click', ev => {
  const b = ev.target.closest('button'); if (!b || !g || !running) return; const s = selected(), a = b.dataset.t;
  if (a === 'amove') { if (myUnits(s).some(u => u.type !== 'villager')) { mode = { k: 'amove' }; toast('Saldırarak gidilecek yere dokun', 1600); } else snd.err(); }
  else if (a === 'stop') { if (myUnits(s).length) Sim.cmdStop(g, sel); }
  else if (a === 'box') { boxMode = !boxMode; b.classList.toggle('on', boxMode); toast(boxMode ? 'Kutu seçim: parmağını sürükle' : 'Kutu seçim kapalı: sürükleyince harita kayar', 1600); }
  else if (a === 'home') { const tc = g.ents.find(e => !e.dead && e.owner === ME && e.type === 'tc'); if (tc) { const c = Sim.centerOf(tc); centerOn(c.x, c.y); sel = [tc.id]; } }
  else if (a === 'cancel') { mode = null; wallDrag = null; sel = []; }
  else if (a === 'full') { const d = document, el = d.documentElement; if (d.fullscreenElement) d.exitFullscreen(); else if (el.requestFullscreen) el.requestFullscreen().then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) { /* yok */ } }).catch(() => {}); }
});

mini.addEventListener('mousedown', ev => {
  ev.preventDefault(); if (!g) return;
  const r = mini.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * W, y = (ev.clientY - r.top) / r.height * H;
  if (ev.button === 0) { centerOn(x, y); mini._drag = true; }
  else if (ev.button === 2) { const u = myUnits(selected()).map(e => e.id); if (u.length) { Sim.cmdMove(g, u, x, y, false); snd.cmd(); } }
});
window.addEventListener('mousemove', ev => {
  if (mini._drag) { const r = mini.getBoundingClientRect(); centerOn((ev.clientX - r.left) / r.width * W, (ev.clientY - r.top) / r.height * H); }
});
window.addEventListener('mouseup', () => { mini._drag = false; });
mini.addEventListener('contextmenu', e => e.preventDefault());

function scrollCam(dt) {
  const sp = 16 * dt * (38 / ts + 0.4) * (settings.camSpeed / 100); let dx = 0, dy = 0;
  if (keys.ArrowLeft) dx -= 1; if (keys.ArrowRight) dx += 1; if (keys.ArrowUp) dy -= 1; if (keys.ArrowDown) dy += 1;
  if (mouse.in && !drag && settings.edge) {
    if (mouse.x < 6) dx -= 1; if (mouse.x > vw - 6) dx += 1; if (mouse.y < 6) dy -= 1; if (mouse.y > vh - 3) dy += 1;
  }
  if (dx || dy) { cam.x += dx * sp; cam.y += dy * sp; clampCam(); }
}

/* ---------- ana döngü ---------- */
let slowN = 0, fastN = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (running && !paused) { if (dt > 0.045) { slowN++; fastN = 0; } else { fastN++; slowN = Math.max(0, slowN - 1); } if (slowN > 120 && !Render.isLow() && settings.quality === 'auto') { Render.setLow(true); toast('Akıcılık için efektler sadeleştirildi.', 2500); } }
  if (g && running) {
    if (!paused) {
      acc += dt * speed;
      let n = 0; while (acc >= 0.05 && n++ < 12) { Sim.update(g, 0.05); acc -= 0.05; }
      if (n >= 12) acc = 0;
      if (g.camp && window.Campaign) Campaign.tick(g);
      handleEvents();
    }
    if (g.time - lastAuto >= 60 && g.winner < 0 && !paused) { lastAuto = g.time; if (saveGame('auto')) { const a = $('autoDot'); if (a) { a.classList.add('on'); setTimeout(() => a.classList.remove('on'), 1500); } } }
    fxSounds(dt);
    scrollCam(dt);
    updateHud(); updatePanel();
  }
  if (g) {
    const nowp = performance.now(); pings = pings.filter(p => nowp - p.t < 3000);
    Render.draw(ctx, { g, ME, cam, ts, vw, vh, dpr, labels: settings.labels, sel, mode, mouse, wallTiles: wallDrag ? wallTiles() : null, drag, pings, time: nowp / 1000, power: CIVS[g.owners[ME].civ].power }, running && !paused ? dt : 0);
    drawMini();
  }
  cv.style.cursor = mode && mode.k === 'amove' ? 'crosshair' : mode && (mode.k === 'power' || mode.k === 'spy') ? 'crosshair' : 'default';
}

/* ---------- menü ---------- */
function showMenu() {
  running = false; $('menu').classList.remove('hide'); $('hud').classList.add('hide'); GameAudio.menuMusic(true);
}
document.querySelectorAll('img[data-flag]').forEach(i => { i.src = Flags.uri[i.dataset.flag]; });
function pickCiv(c) { menuCiv = c; document.querySelectorAll('.civ').forEach(e => e.classList.toggle('on', e.dataset.c === c)); }
function pickDiff(d) { menuDiff = d; document.querySelectorAll('.diff').forEach(e => e.classList.toggle('on', e.dataset.d === d)); }
document.querySelectorAll('.civ').forEach(e => e.addEventListener('click', () => pickCiv(e.dataset.c)));
document.querySelectorAll('.diff').forEach(e => e.addEventListener('click', () => pickDiff(e.dataset.d)));
$('start').addEventListener('click', () => { snd.click(); startGame(); });

function saveGame(slot) {
  if (!g) return false;
  try { localStorage.setItem('si.save.' + slot, JSON.stringify(Sim.serialize(g))); localStorage.setItem('si.meta.' + slot, JSON.stringify({ time: g.time, civ: g.owners[ME].civ, age: g.owners[ME].age, diff: g.diffKey, at: Date.now() })); return true; } catch (e) { return false; }
}
function listSaves() { return ['auto', '1', '2', '3'].map(slot => { let meta = null; try { meta = JSON.parse(localStorage.getItem('si.meta.' + slot) || 'null'); } catch (e) { meta = null; } return { slot, meta }; }); }
function deleteSave(slot) { try { localStorage.removeItem('si.save.' + slot); localStorage.removeItem('si.meta.' + slot); } catch (e) { /* yok */ } }
function loadGame(slot) {
  let snap = null; try { snap = JSON.parse(localStorage.getItem('si.save.' + slot) || 'null'); } catch (e) { snap = null; }
  if (!snap) return false;
  try { g = Sim.deserialize(snap); } catch (e) { toast('Kayıt okunamadı.', 2500); return false; }
  menuCiv = g.owners[ME].civ; enterGame(); toast('Oyun yüklendi.', 2200); return true;
}
function startGame() {
  const other = menuCiv === 'osmanli' ? 'bizans' : 'osmanli';
  g = Sim.create({ civs: [menuCiv, other], difficulty: menuDiff, map: settings.map || 'rastgele', env: { dayNight: settings.dayNight, weather: settings.weather } });
  enterGame(); toast('Hedef: düşmanın Şehir Merkezini yık. Köylülerle odun, yiyecek ve altın topla!', 5000);
}
function startCampaign(idx) {
  g = Campaign.create(idx); menuCiv = Campaign.MISSIONS[idx].civ; enterGame();
}
function enterGame() {
  $('myflag').src = Flags.uri[menuCiv]; lastAuto = g.time;
  Render.init(g); sel = []; mode = null; groups = {}; pings = []; lastAlert = null; speed = 1; paused = false;
  $('spd').textContent = '⏩ 1x'; $('toasts').innerHTML = '';
  const tc = g.ents.find(e => e.owner === ME && e.type === 'tc'); const c = Sim.centerOf(tc);
  ts = 38; resize(); centerOn(c.x + 1, c.y + 2); sel = [tc.id];
  $('menu').classList.add('hide'); $('hud').classList.remove('hide'); $('pausePanel').classList.add('hide');
  running = true; lastSig = ''; startMusic(); GameAudio.duck(false);
  if (IS_TOUCH) { try { const el = document.documentElement; if (!document.fullscreenElement && el.requestFullscreen) el.requestFullscreen().then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) { /* yok */ } }).catch(() => {}); } catch (e) { /* yok */ } }
  for (const id of ['saves', 'settings']) $(id).classList.add('hide');
}

window.addEventListener('resize', resize);
resize(); applySettings(); pickCiv('osmanli'); pickDiff('normal'); showMenu();
requestAnimationFrame(t => { last = t; frame(t); });
window.__game = { startCampaign, get sel() { return sel; }, set sel(v) { sel = v; }, get cam() { return cam; }, get ts() { return ts; }, get g() { return g; }, get settings() { return settings; }, set settings(v) { settings = v; }, DEFSET, applySettings, save: saveGame, load: loadGame, listSaves, deleteSave, Sim, centerOn, setZoom: z => { ts = z; resize(); }, select: ids => { sel = ids; lastSig = ""; } };
})();

/* ---------- bina açıklaması (üstüne gelince) ---------- */
{
  const tip = document.createElement('div');
  tip.style.cssText = 'position:fixed;z-index:50;max-width:260px;padding:8px 11px;background:linear-gradient(#1a1f10f5,#0a0d06f5);border:1px solid #8a6d24;border-radius:9px;color:#eee;font:13px/1.35 system-ui,sans-serif;pointer-events:none;box-shadow:0 4px 16px #000a;display:none';
  document.body.appendChild(tip);
  const cm = document.getElementById('cmds');
  cm.addEventListener('mouseover', ev => {
    const b = ev.target.closest('[data-desc]');
    if (!b || !b.dataset.desc) { tip.style.display = 'none'; return; }
    const r = b.getBoundingClientRect();
    tip.innerHTML = '<b style="color:#ffd86a">' + b.querySelector('span').textContent + '</b><br>' + b.dataset.desc;
    tip.style.display = 'block';
    tip.style.left = Math.max(6, Math.min(innerWidth - 270, r.left)) + 'px';
    tip.style.top = Math.max(6, r.top - tip.offsetHeight - 8) + 'px';
  });
  cm.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
}
