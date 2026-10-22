const Sim=require('../sim.js');
let g=Sim.create({seed:5,difficulty:'normal'});
const vils=g.ents.filter(e=>e.owner===0&&e.type==='villager').map(e=>e.id);
const tree=g.ents.filter(e=>e.type==='tree').sort((a,b)=>Math.hypot(a.tx-8,a.ty-8)-Math.hypot(b.tx-8,b.ty-8))[0];
console.log('ağaç',tree.amount,'wood',g.owners[0].res.w);
// 1 işçi
Sim.cmdGather(g,[vils[0]],tree.id);
let t0=null,w0=g.owners[0].res.w;
for(let i=0;i<20*400;i++){Sim.update(g,0.05);const u=g.byId.get(vils[0]);if(u&&u.hidden&&t0===null){t0=g.time;w0=g.owners[0].res.w}if(tree.dead){console.log('1 işçi: ağaç bitti',(g.time-t0).toFixed(0),'sn çalışma, odun +',g.owners[0].res.w-w0);break}}
// 2 işçi
g=Sim.create({seed:5,difficulty:'normal'});
const v2=g.ents.filter(e=>e.owner===0&&e.type==='villager').map(e=>e.id);
const tr2=g.ents.filter(e=>e.type==='tree').sort((a,b)=>Math.hypot(a.tx-8,a.ty-8)-Math.hypot(b.tx-8,b.ty-8))[0];
Sim.cmdGather(g,[v2[0],v2[1]],tr2.id);t0=null;
for(let i=0;i<20*400;i++){Sim.update(g,0.05);const u=g.byId.get(v2[0]);if(u&&u.hidden&&t0===null){t0=g.time}if(tr2.dead){console.log('2 işçi: ağaç bitti',(g.time-t0).toFixed(0),'sn çalışma');break}}
// altın: 10 köylü gönder, kapasite 8
g=Sim.create({seed:5,difficulty:'normal'});
const gold=g.ents.find(e=>e.type==='gold'&&Math.hypot(e.tx-8,e.ty-8)<12);
const ids=g.ents.filter(e=>e.owner===0&&e.type==='villager').map(e=>e.id);
for(let k=0;k<4;k++)Sim.cmdTrain(g,g.ents.find(e=>e.owner===0&&e.type==='tc').id,'villager');
for(let i=0;i<20*70;i++)Sim.update(g,0.05);
const all=g.ents.filter(e=>e.owner===0&&e.type==='villager').map(e=>e.id);
Sim.cmdGather(g,all,gold.id);const gs=g.owners[0].res.g;
for(let i=0;i<20*60;i++)Sim.update(g,0.05);
const us=all.map(id=>g.byId.get(id));
console.log('altın: işçi',us.length,'içeride(gizli)',us.filter(u=>u.hidden).length,'altın +',g.owners[0].res.g-gs,'durumlar',us.map(u=>u.order+(u.hidden?'*':'')).join(' '));
// köpek koku + casus
g=Sim.create({seed:5,difficulty:'normal'});g.owners[0].res.f=999;g.owners[0].res.g=999;
const e1=Sim.addUnit?null:null;
const p0=g.owners[0], tc=g.ents.find(e=>e.owner===0&&e.type==='tc');
const b=Sim.cmdBuild(g,0,[ids[0],ids[1]],'barracks',tc.tx+5,tc.ty+5);
for(let i=0;i<20*40;i++)Sim.update(g,0.05);
console.log('kışla',b.done, 'üretim', Sim.cmdTrain(g,b.id,'dog'), Sim.cmdTrain(g,b.id,'spy'));
for(let i=0;i<20*30;i++)Sim.update(g,0.05);
const dog=g.ents.find(e=>e.owner===0&&e.type==='dog'), spy=g.ents.find(e=>e.owner===0&&e.type==='spy');
console.log('köpek',!!dog,'casus',!!spy);
const enemyVil=g.ents.find(e=>e.owner===1&&e.type==='villager');
// düşman köylüsünü köpeğe 12 kare mesafeye ışınla
enemyVil.x=dog.x+11;enemyVil.y=dog.y;enemyVil.path=[];enemyVil.hidden=false;enemyVil.order='idle';
for(let i=0;i<20*8;i++)Sim.update(g,0.05);
console.log('köpek kokuyu aldı mı:',dog.order,'hedef',dog.target===enemyVil.id,'mesafe',Math.hypot(dog.x-enemyVil.x,dog.y-enemyVil.y).toFixed(1),'düşman hp',enemyVil.hp);
Sim.cmdMove(g,[spy.id],54,54,false);
for(let i=0;i<20*20;i++)Sim.update(g,0.05);
console.log('casus konum',spy.x.toFixed(0),spy.y.toFixed(0),'hp',spy.hp,'sağ');
