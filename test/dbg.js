const Sim=require('../sim.js');const g=Sim.create({seed:3,difficulty:'normal'});g.owners[0].ai=true;
for(let i=0;i<20*600;i++)Sim.update(g,0.05);
const p=1,en=g.ents.filter(e=>!e.dead&&e.owner===p);
console.log('farms',en.filter(e=>e.type==='farm').map(f=>f.done+':'+f.gatherer).join(' '));
const v=en.filter(e=>e.type==='villager');const c={};v.forEach(u=>{const k=u.order+'/'+(u.gs||'')+'/'+(u.carryType||'');c[k]=(c[k]||0)+1});console.log(c);
console.log(en.filter(e=>e.k==='b').map(b=>b.type+(b.done?'':'..')+b.queue.length).join(','), JSON.stringify(g.owners[1].res));
