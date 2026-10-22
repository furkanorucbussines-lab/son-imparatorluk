// Dokunmatik test: node test/touchshot.js <çıktı.png>   (844x390 telefon penceresi, sahte PointerEvent)
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const out = process.argv[2] || 'test/touch.png'; const root = path.join(__dirname, '..');
let h = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const f of ['flags.js', 'sim.js', 'campaign.js', 'sprite3d.js', 'render.js', 'bldart.js', 'bldart2.js', 'audio.js', 'main.js', 'ui.js', 'camp-ui.js', 'facts.js', 'menu.js']) h = h.replace(`src="${f}"`, `src="../${f}"`);
for (const f of ['pause.css', 'menu.css', 'camp.css']) h = h.replace(`href="${f}"`, `href="../${f}"`);
const setup = `
const L=m=>document.getElementById("o").textContent+=m+" | ";window.onerror=(m,s,l)=>L("ERR "+m+" @"+l);
const P=(t,id,x,y)=>document.getElementById("map").dispatchEvent(new PointerEvent(t,{pointerId:id,pointerType:"touch",clientX:x,clientY:y,bubbles:true,isPrimary:id===1}));
const tap=(x,y)=>{P("pointerdown",1,x,y);P("pointerup",1,x,y)};
try{
  document.body.classList.add("touch");
  document.getElementById("start").click();
  const G=window.__game,g=G.g,S=G.Sim;
  const v=g.ents.find(e=>e.owner===0&&e.type==="villager");
  const sx=(x)=>(x-0)*1, W=window.innerWidth;
  // kamerayı köylüye ortala
  G.centerOn(v.x,v.y);
  const ts=38; const cx=innerWidth/2, cy=innerHeight/2;
  // 1) köylüye dokun → seçilir
  tap(cx+0,cy+0); L("1 secim="+G.sel.join(",")+" villager="+v.id);
  // 2) boş yere dokun → hareket emri
  tap(cx+120,cy+40); L("2 order="+v.order+" dest="+(v.dest?v.dest.x.toFixed(1):"-"));
  // 3) sürükle → kamera kayar
  const c0=G.cam.x; P("pointerdown",1,300,200);P("pointermove",1,360,200);P("pointermove",1,420,200);P("pointerup",1,420,200); L("3 cam dx="+(G.cam.x-c0).toFixed(2));
  // 4) pinch zoom
  const t0=G.ts; P("pointerdown",1,300,200);P("pointerdown",2,400,200);P("pointermove",2,500,200);P("pointerup",2,500,200);P("pointerup",1,300,200); L("4 zoom "+t0+" -> "+G.ts.toFixed(1));
  // 5) kutu seç modu
  document.querySelector('#tbar [data-t=box]').click();
  G.centerOn(v.x,v.y); G.sel=[];
  P("pointerdown",1,cx-60,cy-60);P("pointermove",1,cx+20,cy+20);P("pointermove",1,cx+40,cy+40);P("pointerup",1,cx+40,cy+40); L("5 kutu secim="+G.sel.length);
  document.querySelector('#tbar [data-t=box]').click();
  G.select([v.id]);
}catch(e){L("CATCH "+e.message+" "+(e.stack||"").split(String.fromCharCode(10))[1]);}`;
h = h.replace('</body>', `<pre id="o" style="position:fixed;top:40px;left:160px;color:#0f0;background:#000a;font-size:11px;z-index:99;margin:0"></pre><script>${setup}</script></body>`);
const page = path.join(__dirname, 'auto-touch.html'); fs.writeFileSync(page, h);
const r = spawnSync('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--allow-file-access-from-files', '--window-size=844,390', '--virtual-time-budget=3000', '--screenshot=' + path.resolve(root, out), 'file:///' + page.split(path.sep).join('/')], { timeout: 60000, encoding: 'utf8' });
console.log(r.error ? 'HATA ' + r.error.message : 'tamam', out);
