const Sim=require('../sim.js');
for(const seed of [3,7,11,21]){
  const g=Sim.create({seed,difficulty:process.argv[2]||'normal'});g.owners[0].ai=true;
  const log=[];
  for(let i=0;i<20*1500&&g.winner<0;i++){Sim.update(g,0.05);for(const e of g.events){if(e.type==='age')log.push(`${g.time|0}s P${e.owner} → ${Sim.AGES[e.age].name}`);if(e.type==='tech')log.push(`${g.time|0}s P${e.owner} ${e.id}`);}g.events.length=0;}
  const st=p=>{const o=g.owners[p];const en=g.ents.filter(e=>!e.dead&&e.owner===p&&e.k==='u');const t={};en.forEach(u=>t[u.type]=(t[u.type]||0)+1);return `P${p} çağ${o.age} tekn${o.techs.length} iron${o.res.i|0} ${JSON.stringify(t)}`;};
  console.log('seed',seed,'sonuç',g.winner,(g.time|0)+'s |',st(0),'|',st(1));
  console.log('  ',log.slice(0,14).join(' ; '));
}
