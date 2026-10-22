const Sim=require('../sim.js');let f=0;const ok=(c,m)=>{console.log(c?'✔':'✘',m);if(!c)f++;};
for(const seed of [1,5,9]){const g=Sim.create({seed,difficulty:'normal'});
 const tot=t=>g.ents.filter(e=>e.k==='r'&&e.type===t).reduce((s,e)=>s+e.amount,0),n=t=>g.ents.filter(e=>e.k==='r'&&e.type===t).length;
 console.log('seed',seed,'altın madeni',n('gold'),'toplam',tot('gold'),'| demir',n('iron'),'toplam',tot('iron'));
 ok(n('gold')>=14&&n('iron')>=10,'yeterli maden sayısı');}
const g=Sim.create({seed:5,difficulty:'normal'});const o=g.owners[0];o.res={f:99999,w:99999,g:99999,i:99999};
const tc=g.ents.find(e=>e.owner===0&&e.type==='tc');const br=Sim.addBld(g,0,'barracks',tc.tx+5,tc.ty,true);
o.popcap=o.pop; let n=0;for(let i=0;i<5;i++)if(Sim.cmdTrain(g,br.id,'inf'))n++;ok(n===5,'işçi nüfusu dolu iken asker kuyruğa girer');
ok(o.armycap===15,'TC ordu sınırı 15');o.army=15;ok(!Sim.cmdTrain(g,br.id,'inf'),'ordu sınırı dolunca asker reddedildi');o.army=0;
const hs=Sim.addBld(g,0,'house',tc.tx-6,tc.ty,true);ok(o.armycap===25,'Ev +10 ordu sınırı verdi ('+o.armycap+')');
o.popcap=o.pop;ok(!Sim.cmdTrain(g,tc.id,'villager'),'işçi nüfus sınırında reddedildi');
for(let i=0;i<20*70;i++)Sim.update(g,0.05);ok(g.ents.filter(e=>e.owner===0&&e.type==='inf').length>=3,'piyadeler çıktı ');
const h=g.ents.find(e=>e.k==='b'&&e.owner===0&&e.type==='tc').maxhp;o.res={f:9999,w:9999,g:9999,i:9999};
Sim.addBld(g,0,'barracks',tc.tx+9,tc.ty,true);Sim.cmdAgeUp(g,0);for(let i=0;i<20*50;i++)Sim.update(g,0.05);
ok(o.age===1&&g.byId.get(tc.id).maxhp>h,'çağ atlayınca bina canı arttı '+h+' → '+g.byId.get(tc.id).maxhp);
console.log(f?'BAŞARISIZ':'HEPSİ TAMAM');process.exit(f?1:0);
