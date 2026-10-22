const Sim=require('../sim.js');const g=Sim.create({seed:5,difficulty:'normal'});
const tc=g.ents.find(e=>e.owner===0&&e.type==='tc');
g.owners[0].res.w=500;
let vils=g.ents.filter(e=>e.owner===0&&e.type==='villager').map(e=>e.id);
const farm=Sim.cmdBuild(g,0,[vils[0]],'farm',tc.tx+4,tc.ty+4);
for(let i=0;i<20*20;i++)Sim.update(g,0.05);
Sim.cmdGather(g,vils,farm.id);              // 5 köylü çiftliğe
for(let i=0;i<20*40;i++)Sim.update(g,0.05);
console.log('çiftlik:',vils.map(id=>g.byId.get(id).order+'/'+g.byId.get(id).gs).join(' '),'f',g.owners[0].res.f|0);
const gold=g.ents.find(e=>e.type==='gold'&&Math.hypot(e.tx-8,e.ty-8)<12);
Sim.cmdGather(g,vils,gold.id);
for(let i=0;i<20*90;i++)Sim.update(g,0.05);
console.log('altın:',vils.map(id=>g.byId.get(id).order+'/'+g.byId.get(id).gs).join(' '),'g',g.owners[0].res.g|0);
