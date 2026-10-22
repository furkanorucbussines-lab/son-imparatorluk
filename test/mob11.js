const { launch } = require('./cdp.js'); const path = require('path');
(async () => {
  const b = await launch({ w: 844, h: 390 }); await b.phone(844, 390, 2, true);
  await b.go('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/')); await b.sleep(900);
  let p = await b.ev("(()=>{const q=document.querySelector('#mmGo').getBoundingClientRect();return [q.x+q.width/2,q.y+q.height/2]})()"); await b.tap(p[0], p[1]); await b.sleep(1000);
  await b.ev("(()=>{const g=__game.g,S=__game.Sim;const tc=g.ents.find(e=>e.owner===0&&e.type==='tc');for(let i=0;i<30;i++)S.addUnit(g,0,i%3?'inf':'archer',tc.tx+5+(i%6)*0.8,tc.ty+4+Math.floor(i/6)*0.8);for(let i=0;i<10;i++)S.addUnit(g,0,'cav',tc.tx+9+(i%5)*0.8,tc.ty+4+Math.floor(i/5)*0.8);for(let i=0;i<20;i++)S.addUnit(g,0,'musketeer',tc.tx+5+(i%5)*0.8,tc.ty+8+Math.floor(i/5)*0.8);__game.centerOn(tc.tx+7,tc.ty+5);})()"); await b.sleep(1200);
  console.log('alaylar', await b.ev("JSON.stringify(Object.entries(__game.g.ents.filter(e=>e.squad).reduce((m,e)=>{m[e.squad]=(m[e.squad]||0)+1;return m},{})))"));
  console.log('chips', await b.ev("document.getElementById('sq').children.length"));
  await b.shot('test/sq1.png');
  // alay 1'i seç, haritaya dokun
  const c1 = await b.ev("(()=>{const q=document.querySelector('#sq [data-sq=\"1\"]').getBoundingClientRect();return [q.x+q.width/2,q.y+q.height/2]})()"); await b.tap(c1[0], c1[1]); await b.sleep(200);
  console.log('seçili', await b.ev('__game.sel.length')); const tgt = await b.ev("(()=>{const g=__game.g,tc=g.ents.find(e=>e.owner===0&&e.type==='tc');let wx=tc.tx+(tc.tx<32?14:-14),wy=tc.ty+(tc.ty<32?8:-8);const S=__game.Sim;outer:for(let r=0;r<8;r++)for(let dx=-r;dx<=r;dx++)for(let dy=-r;dy<=r;dy++){const x=Math.round(wx)+dx,y=Math.round(wy)+dy;if(x>1&&y>1&&x<62&&y<62&&S.tileFree(g,y*64+x)&&S.tileFree(g,y*64+x+1)&&S.tileFree(g,(y+1)*64+x)){wx=x+0.5;wy=y+0.5;break outer}}__game.centerOn(wx-2,wy+1.5);const c=__game.cam,ts=__game.ts;return [(wx-c.x)*ts,(wy-c.y)*ts,wx,wy]})()"); await b.sleep(200);
  await b.ev("(()=>{const S=__game.Sim;window.__log=[];for(const k of ['cmdMove','cmdAttack','cmdGather','cmdBuildHelp','cmdRepair','cmdReturn']){const f=S[k];S[k]=function(){window.__log.push(k+':'+(Array.isArray(arguments[1])?arguments[1].length:'?')+':'+arguments[4]);return f.apply(this,arguments)}}})()");
  await b.tap(tgt[0], tgt[1]); console.log('log', await b.ev('JSON.stringify(window.__log)')); await b.sleep(400);
  console.log('detay', await b.ev("JSON.stringify(__game.sel.slice(0,4).map(i=>{const u=__game.g.byId.get(i);return {t:u.type,o:u.order,d:u.dest,p:u.path&&u.path.length,x:+u.x.toFixed(1),y:+u.y.toFixed(1),sq:u.squad}}))"), 'tgt', tgt);
  console.log('emirler', await b.ev("(()=>{const m={};__game.sel.forEach(i=>{const u=__game.g.byId.get(i);const k=u.type+':'+u.order+(u.cap?'/cap'+u.cap:'');m[k]=(m[k]||0)+1});return JSON.stringify(m)})()"));
  await b.sleep(5000); await b.shot('test/sq2.png'); console.log(b.logs.slice(0, 5)); await b.close();
})().catch(e => { console.log('HATA', e.message); process.exit(1); });
