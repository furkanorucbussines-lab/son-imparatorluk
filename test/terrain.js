const Sim=require('../sim.js');
// 1) bağlantı: her seed'de iki TC aynı bölgede mi
let bad=0;
for(let seed=1;seed<=40;seed++){
  const g=Sim.create({seed,difficulty:'normal'});
  const tcs=g.ents.filter(e=>e.type==='tc');
  const r=(e)=>{const rc=Sim.rectOf(e);const set=new Set();for(let y=Math.floor(rc.y0)-1;y<=Math.ceil(rc.y1);y++)for(let x=Math.floor(rc.x0)-1;x<=Math.ceil(rc.x1);x++)if(g.reg[y*64+x])set.add(g.reg[y*64+x]);return set;};
  const a=r(tcs[0]),b=r(tcs[1]);const ok=[...a].some(x=>b.has(x));
  if(!ok){bad++;console.log('bağlantı YOK seed',seed);}
}
console.log('bağlantısız harita:',bad,'/40');
// 2) köprü: nehri geçemeyen köylü, mimarla köprü
const g=Sim.create({seed:5,difficulty:'normal'});
const water=[];for(let y=0;y<64;y++)for(let x=0;x<64;x++)if(g.ter[y*64+x])water.push([x,y]);
console.log('su kare sayısı',water.length,'geçit kare',g.ford.reduce((a,b)=>a+b,0));
const tc=g.ents.find(e=>e.owner===0&&e.type==='tc');
g.owners[0].res.w=2000;g.owners[0].res.g=500;g.owners[0].res.f=500;
Sim.cmdTrain(g,tc.id,'engineer');
for(let i=0;i<20*20;i++)Sim.update(g,0.05);
const eng=g.ents.find(e=>e.owner===0&&e.type==='engineer');console.log('mühendis',!!eng);
// kıyıya en yakın su karesi (kendi tarafı): TC'den nehre doğru bak
let best=null,bd=1e9;for(const [x,y] of water){const d=Math.hypot(x-tc.tx,y-tc.ty);if(d<bd&&Sim.canPlace(g,'bridge',x,y)){bd=d;best=[x,y];}}
console.log('köprü yeri',best,'canPlace',Sim.canPlace(g,'bridge',best[0],best[1]));
const vil=g.ents.find(e=>e.owner===0&&e.type==='villager');
console.log('köylü köprü yapabilir mi (olmamalı):',!!Sim.cmdBuild(g,0,[vil.id],'bridge',best[0],best[1]));
g.owners[0].explored.fill(1);
const br=Sim.cmdBuild(g,0,[eng.id],'bridge',best[0],best[1]);
for(let i=0;i<20*40;i++)Sim.update(g,0.05);
console.log('köprü bitti',br&&br.done,'occ',g.occ[best[1]*64+best[0]]);
// sur+kapı: 5 sur, ortası kapı
const base={x:tc.tx+8,y:tc.ty};
const e2=g.ents.find(e=>e.owner===0&&e.type==='engineer');
let placed=0;for(let k=0;k<5;k++){const t=(k===2)?'gate':'wall';if(Sim.cmdBuild(g,0,[e2.id],t,base.x,base.y+k))placed++;}
for(let i=0;i<20*60;i++)Sim.update(g,0.05);
console.log('sur/kapı yerleşti',placed,'kapı gate dizisi',g.gate[(base.y+2)*64+base.x],'duvar occ',g.occ[base.y*64+base.x]>0);
// kapıdan kendi birim geçer, düşman geçmez
const own=Sim.blockedAt(g,base.x+.5,base.y+2.5,0),foe=Sim.blockedAt(g,base.x+.5,base.y+2.5,1);
console.log('kapı: bizim engelli?',own,' düşman engelli?',foe);
// mayın
const mine=Sim.cmdBuild(g,0,[e2.id],'mine',tc.tx+12,tc.ty+8);
for(let i=0;i<20*15;i++)Sim.update(g,0.05);
const ev=g.ents.find(e=>e.owner===1&&e.type==='villager');
console.log('mayın hazır',mine.done);
ev.hidden=false;ev.order='idle';ev.x=mine.tx+0.5;ev.y=mine.ty+0.5;ev.hp=999;
const hp0=ev.hp;Sim.update(g,0.05);console.log('mayın patladı',mine.dead,'hasar',hp0-ev.hp);
// onarım
const gt=g.ents.find(e=>e.owner===0&&e.type==='gate');gt.hp=100;
Sim.cmdRepair(g,[e2.id],gt.id);for(let i=0;i<20*20;i++)Sim.update(g,0.05);console.log('kapı onarım hp',Math.round(gt.hp),'/',gt.maxhp);
