const Sim=require('../sim.js');const g=Sim.create({seed:5,difficulty:'normal'});
const vils=g.ents.filter(e=>e.owner===0&&e.type==='villager').map(e=>e.id);
const gold=g.ents.find(e=>e.type==='gold'&&Math.hypot(e.tx-8,e.ty-8)<12);
console.log('gold',gold.tx,gold.ty);
Sim.cmdGather(g,vils.slice(0,3),gold.id);
const tc=g.ents.find(e=>e.owner===0&&e.type==='tc');
const fb=Sim.cmdBuild(g,0,[vils[3]],'farm',tc.tx+4,tc.ty+4);
console.log('farm placed',!!fb);
for(let i=0;i<20*90;i++){Sim.update(g,0.05);if(i%400===0)console.log((g.time|0),'g',g.owners[0].res.g,'f',g.owners[0].res.f,vils.slice(0,4).map(id=>{const u=g.byId.get(id);return u.order+'/'+u.gs+'/'+u.carry+'@'+u.x.toFixed(1)+','+u.y.toFixed(1)}).join(' | '))}
console.log('--- who deposits gold?');
const g2=Sim.create({seed:5,difficulty:'normal'});let prev=g2.owners[0].res.g;
const v2=g2.ents.filter(e=>e.owner===0&&e.type==='villager').map(e=>e.id);
const gd=g2.ents.find(e=>e.type==='gold'&&Math.hypot(e.tx-8,e.ty-8)<12);
Sim.cmdGather(g2,v2.slice(0,3),gd.id);
for(let i=0;i<20*30;i++){Sim.update(g2,0.05);const n=g2.owners[0].res.g;if(n!==prev){console.log('t',g2.time.toFixed(1),'g',prev,'->',n);prev=n;}}
