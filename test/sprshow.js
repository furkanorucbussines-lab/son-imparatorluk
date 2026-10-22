// Birim vitrin: node test/sprshow.js <tipler,virgül> <civ> <çıktı.png> [zoom]
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const [types = 'inf,archer', civ = 'osmanli', out = 'test/spr.png', zoom = '1'] = process.argv.slice(2);
const root = path.join(__dirname, '..');
const html = `<!doctype html><body style="margin:0;background:#4a7a38"><canvas id=c width=1300 height=780></canvas><pre id=o style="position:fixed;top:0;color:#0f0"></pre>
<script src="../sprite3d.js"></script><script>
try{
const c=document.getElementById('c').getContext('2d');const T='${types}'.split(',');const civ='${civ}';const Z=${zoom};
const V={ME:0};const dirs=8;
T.forEach((t,row)=>{ for(let d=0;d<dirs;d++){ const x=80+d*150, y=70+row*(Z>1?180:112);
 const face=d*Math.PI/4; const u={type:t,id:d+1,face,owner:d%2,disguised:false};
 const r=(['tank','htank','ltank','howitzer','flak','armored','scout','raider','siege'].includes(t)?0.5:0.3)*38*(['tank','htank','ltank','howitzer','flak','armored','scout','raider','siege'].includes(t)?1:1.22)*Z;
 c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(x+r*.2,y+r*.5,r*1.1,r*.4,0,0,6.3);c.fill();
 Spr.unit(c,V,u,{x,y,r,a:{ph:d*0.9+1,mv:d%2===0?1:0},col:d%2?'#d83a34':'#2f7de1',cd:d%2?'#8a1f1b':'#1b4a94',cl:'#fff',civ,swing:d===7?0.9:0,t:1.3,low:false});
 c.fillStyle='#fff';c.font='11px sans-serif';c.fillText(t+' '+(d*45)+'°',x-30,y+r*1.5+8);
}});
}catch(e){document.getElementById('o').textContent=e.stack}
</script></body>`;
const page = path.join(__dirname, 'auto-spr.html'); fs.writeFileSync(page, html);
const r = spawnSync('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--allow-file-access-from-files', '--window-size=1300,780', '--screenshot=' + path.resolve(root, out), 'file:///' + page.split(path.sep).join('/')], { timeout: 60000, encoding: 'utf8' });
console.log(r.error ? 'HATA ' + r.error.message : 'tamam', out);
