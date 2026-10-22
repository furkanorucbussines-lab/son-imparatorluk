const Sim=require('../sim.js');let fails=0;const ok=(c,m)=>{console.log(c?'✔':'✘',m);if(!c)fails++;};
const g=Sim.create({seed:5,difficulty:'normal'});const o=g.owners[0];
const tc=g.ents.find(e=>e.owner===0&&e.type==='tc');
const vil=g.ents.find(e=>e.owner===0&&e.type==='villager');
// kilitli birim/bina
const br=Sim.addBld(g,0,'barracks',tc.tx+5,tc.ty,true);
o.res.f=5000;o.res.w=5000;o.res.g=5000;o.res.i=1000;
ok(!Sim.cmdTrain(g,br.id,'musketeer'),'Tüfekçi Kale Çağı\'nda kilitli');
ok(!Sim.cmdBuild(g,0,[vil.id],'fortress',tc.tx,tc.ty+7),'Tabya Kale Çağı\'nda kilitli');
// çağ atlama
ok(Sim.cmdAgeUp(g,0),'Barut Çağı başladı (Kışla var)');
ok(!Sim.cmdAgeUp(g,0),'ikinci çağ atlama aynı anda reddedildi');
for(let i=0;i<20*45;i++)Sim.update(g,0.05);
ok(o.age===1,'çağ 1 oldu');
ok(Sim.cmdTrain(g,br.id,'musketeer'),'Tüfekçi artık üretilebilir');
ok(!Sim.cmdAgeUp(g,0),'Sanayi için Akademi gerekli');
// akademi + araştırma
const ac=Sim.addBld(g,0,'academy',tc.tx+9,tc.ty+4,true);
const u0=g.ents.find(e=>e.owner===0&&e.type==='villager');
ok(Sim.cmdResearch(g,ac.id,'armor1'),'Demir Zırh araştırması başladı');
ok(!Sim.cmdResearch(g,ac.id,'blades'),'aynı akademide ikinci araştırma yok');
const inf=Sim.addUnit(g,0,'inf',tc.tx+2,tc.ty+5);const a0=inf.st.armor;
for(let i=0;i<20*45;i++)Sim.update(g,0.05);
ok(o.techs.includes('armor1')&&inf.st.armor===a0+1,'zırh teknolojisi mevcut piyadeye uygulandı ('+a0+'→'+inf.st.armor+')');
const hp0=tc.maxhp;Sim.cmdResearch(g,ac.id,'masonry');for(let i=0;i<20*45;i++)Sim.update(g,0.05);
ok(tc.maxhp===Math.round(hp0*1.25),'Taş İşçiliği bina canını artırdı ('+hp0+'→'+tc.maxhp+')');
ok(!Sim.cmdResearch(g,ac.id,'mech'),'Motorlu Sanayi Sanayi Çağı\'nı bekliyor');
// sanayi
ok(Sim.cmdAgeUp(g,0),'Sanayi Çağı başladı');for(let i=0;i<20*61;i++)Sim.update(g,0.05);ok(o.age===2,'çağ 2');
const fd=Sim.addBld(g,0,'foundry',tc.tx+9,tc.ty-4,true);
ok(Sim.cmdTrain(g,fd.id,'armored'),'Zırhlı araç üretimi');ok(Sim.cmdTrain(g,br.id,'mgun'),'Makineli üretimi');
for(let i=0;i<20*40;i++)Sim.update(g,0.05);
ok(g.ents.some(e=>e.owner===0&&e.type==='armored')&&g.ents.some(e=>e.owner===0&&e.type==='mgun'),'yeni birimler sahada');
// demir toplama
const iron=g.ents.find(e=>e.type==='iron');ok(!!iron,'demir madeni haritada');
const iBefore=o.res.i;const v=g.ents.filter(e=>e.owner===0&&e.type==='villager').slice(0,3).map(e=>e.id);Sim.cmdGather(g,v,iron.id);
for(let i=0;i<20*90;i++)Sim.update(g,0.05);ok(o.res.i>iBefore,'köylüler demir topladı (+'+(o.res.i-iBefore|0)+')');
console.log(fails?'BAŞARISIZ '+fails:'hepsi tamam');
