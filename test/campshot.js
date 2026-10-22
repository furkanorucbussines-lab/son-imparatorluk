// Kullanım: node test/campshot.js <select|brief|play|end> <görev0-4> <çıktı.png> [sn]
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const [mode = 'select', idx = '0', out = 'test/camp.png', secs = '20'] = process.argv.slice(2);
const root = path.join(__dirname, '..');
let h = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const f of ['flags.js', 'sim.js', 'campaign.js', 'sprite3d.js', 'render.js', 'bldart.js', 'bldart2.js', 'audio.js', 'main.js', 'ui.js', 'camp-ui.js', 'facts.js', 'menu.js']) h = h.replace(`src="${f}"`, `src="../${f}"`);
for (const f of ['pause.css', 'menu.css', 'camp.css']) h = h.replace(`href="${f}"`, `href="../${f}"`);
const setup = `
const L=m=>document.getElementById("o").textContent+=m+" | ";window.onerror=(m,s,l)=>L("ERR "+m+" @"+l);
try{
  const I=${+idx};
  if("${mode}"==="menu"){}
  else if("${mode}"==="select"){localStorage.setItem("si.camp",JSON.stringify({done:["edirne","rumeli"]}));document.getElementById("campBtn").click();}
  else if("${mode}"==="brief"){document.getElementById("campBtn").click();document.querySelector(".cmcard").click();}
  else{
    document.getElementById("campBtn").click();document.querySelector(".cmcard").click();
    // doğrudan başlat
    document.getElementById("brief").classList.add("hide");document.getElementById("camp").classList.add("hide");document.getElementById("menu").classList.add("hide");
    window.__game.startCampaign(I);
    const g=window.__game.g,S=window.__game.Sim;
    for(let i=0;i<20*${secs};i++){S.update(g,0.05);if(i%10===0)window.Campaign.tick(g);}
    g.owners[0].explored.fill(1);
    const tc=g.ents.find(e=>e.owner===0&&e.type==="tc");window.__game.centerOn(tc.tx+3,tc.ty+5);
    if("${mode}"==="end"){g.winner=0;g.events.push({type:"gameover",winner:0,camp:true});}
    L("t="+g.time.toFixed(0)+" evs="+g.events.map(e=>e.type).join(","));
  }
}catch(e){L("CATCH "+e.message+" "+(e.stack||"").split(String.fromCharCode(10))[1]);}`;
h = h.replace('</body>', `<pre id="o" style="position:fixed;top:40px;right:0;color:#0f0;background:#000a;font-size:12px;z-index:99"></pre><script>${setup}</script></body>`);
const page = path.join(__dirname, `auto-camp-${mode}.html`);
fs.writeFileSync(page, h);
const r = spawnSync('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--allow-file-access-from-files', '--window-size=1300,780', '--virtual-time-budget=4000', '--screenshot=' + path.resolve(root, out), 'file:///' + page.split(path.sep).join('/')], { timeout: 60000, encoding: 'utf8' });
console.log(r.error ? 'HATA ' + r.error.message : 'tamam', fs.existsSync(path.resolve(root, out)) ? out : '(dosya yok)');
