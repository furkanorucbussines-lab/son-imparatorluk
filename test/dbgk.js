const Sim=require('../sim.js');global.Sim=Sim;const C=require('../campaign.js');
const id=process.argv[2]||'karsi',n=+process.argv[3]||40;
const g=C.create(C.MISSIONS.findIndex(m=>m.id===id),{seed:15}),s=g.owners[0].start;
for(let i=0;i<n;i++)Sim.addUnit(g,0,'musketeer',s.x+4+(i%10)*.4,s.y+6+Math.floor(i/10)*.4);
let nx=0;for(let t=0;t<800&&g.winner<0;t+=0.05){Sim.update(g,0.05);C.tick(g);if(t>=nx){nx+=3;const tc=g.ents.find(e=>e.owner===0&&e.type==='tc');if(tc){const c=Sim.centerOf(tc);Sim.cmdMove(g,g.ents.filter(e=>!e.dead&&e.owner===0&&e.k==='u'&&e.type!=='villager').map(e=>e.id),c.x+3,c.y+3,true);}}g.events.length=0;if(Math.abs(t%30)<0.03){const tc=g.ents.find(e=>e.owner===0&&e.type==='tc');console.log(Math.round(t),'own',g.ents.filter(e=>!e.dead&&e.owner===0&&e.k==='u'&&e.type!=='villager').length,'foe',g.ents.filter(e=>!e.dead&&e.owner===1&&e.k==='u').length,'tc',tc?Math.round(tc.hp):0);}}
console.log('winner',g.winner,g.time);
