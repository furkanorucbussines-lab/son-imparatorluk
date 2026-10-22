const Sim=require('../sim.js');let fails=0;const ok=(c,m)=>{console.log(c?'✔':'✘',m);if(!c)fails++;};
const fresh=()=>{const g=Sim.create({seed:5,difficulty:'normal'});g.owners[0].explored.fill(1);return g;};
const step=(g,sec)=>{for(let i=0;i<20*sec;i++)Sim.update(g,0.05);};
function near(g,b){const c=Sim.centerOf(b);return Sim.addUnit(g,0,'spy',c.x+3.5,c.y+3.5);}
// sabotaj
let g=fresh();const eT=g.ents.find(e=>e.owner===1&&e.type==='tc');
let ba=Sim.addBld(g,1,'barracks',eT.tx+5,eT.ty,true);ba.queue.push({type:'inf',t:0});
let sp=near(g,ba);ok(Sim.cmdSpy(g,[sp.id],ba.id,'sabotage'),'sabotaj emri verildi');
step(g,20);ok(sp.dead,'casus sabotajda feda oldu');ok(ba.sabo>0,'bina durdu (sabo '+ba.sabo.toFixed(1)+')');
const q0=ba.queue[0]&&ba.queue[0].t;step(g,5);ok(ba.queue[0]&&ba.queue[0].t===q0,'üretim ilerlemedi');
step(g,30);ok(ba.sabo===0,'sabotaj bitti');
// teknoloji çalma
g=fresh();g.owners[1].techs.push('tools','blades');const ac=Sim.addBld(g,1,'academy',eT.tx-6,eT.ty,true);
sp=near(g,ac);ok(!Sim.cmdSpy(g,[sp.id],eT.id,'steal'),'TC üzerinde çalma reddedildi');
ok(Sim.cmdSpy(g,[sp.id],ac.id,'steal'),'çalma emri');step(g,25);
ok(g.owners[0].techs.length===1&&g.owners[1].techs.indexOf(g.owners[0].techs[0])>=0,'teknoloji çalındı: '+g.owners[0].techs);
// yağma
g=fresh();g.owners[1].res.g=1000;const g0=g.owners[0].res.g;sp=near(g,g.ents.find(e=>e.owner===1&&e.type==='tc'));
const t1=g.ents.find(e=>e.owner===1&&e.type==='tc');ok(Sim.cmdSpy(g,[sp.id],t1.id,'loot'),'yağma emri');step(g,25);
ok(g.owners[0].res.g>g0+100&&g.owners[1].res.g<900,'hazine soyuldu +'+(g.owners[0].res.g-g0));
// kılık / algılama
g=fresh();const guard=Sim.addUnit(g,1,'inf',40,40),dog=Sim.addUnit(g,1,'dog',40,40);
const s2=Sim.addUnit(g,0,'spy',41.8,40);
const hit=()=>{g.owners[1].fog;return 0};
sp=Sim.addUnit(g,0,'spy',41.8,40);sp.disguised=false;
step(g,0.5);ok(guard.order==='attack'&&guard.target!==undefined,'kılıksız casus 1.8 karede fark edilir');
// kılıklı
g=fresh();const gd=Sim.addUnit(g,1,'inf',40,40);const ds=Sim.addUnit(g,0,'spy',41.8,40);Sim.cmdDisguise(g,[ds.id]);
step(g,0.5);ok(ds.disguised&&gd.target!==ds.id,'kılıklı casus piyadeye görünmez');
const d2=Sim.addUnit(g,1,'dog',41,40);step(g,1);ok(d2.target===ds.id||d2.order==='attack','köpek kılıklı casusu fark eder');
console.log(fails?'BAŞARISIZ '+fails:'HEPSİ TAMAM');process.exit(fails?1:0);
