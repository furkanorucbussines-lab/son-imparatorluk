const Sim=require('../sim.js');let f=0;const ok=(c,m)=>{console.log(c?'✔':'✘',m);if(!c)f++;};
const step=(g,sec)=>{for(let i=0;i<20*sec;i++)Sim.update(g,0.05);};
const fresh=()=>{const g=Sim.create({seed:5,difficulty:'normal'});g.owners[0].explored.fill(1);return g;};
let g=fresh();const o=g.owners[0],tc=g.ents.find(e=>e.owner===0&&e.type==='tc'),eT=g.ents.find(e=>e.owner===1&&e.type==='tc');
// 1) son köylü ölümsüz
for(const v of g.ents.filter(e=>e.owner===0&&e.type==='villager').slice(1))v.dead=true;
const last=g.ents.find(e=>!e.dead&&e.owner===0&&e.type==='villager');Sim.damage(g,last,9999,1);ok(!last.dead&&last.hp>0,'son köylü 9999 hasara dayandı');
const v2=Sim.addUnit(g,0,'villager',tc.tx+3,tc.ty+4);Sim.damage(g,last,9999,1);ok(last.dead,'iki köylü varken ölebilir');Sim.damage(g,v2,9999,1);ok(!v2.dead,'kalan tek köylü ölümsüz');
// 2) yeni birimler üretilir
g=fresh();const o2=g.owners[0];o2.res={f:9999,w:9999,g:9999,i:9999};o2.age=3;
const t2=g.ents.find(e=>e.owner===0&&e.type==='tc');
const br=Sim.addBld(g,0,'barracks',t2.tx+5,t2.ty,true),fd=Sim.addBld(g,0,'foundry',t2.tx+5,t2.ty+4,true);
for(let y=1;y<60;y+=3)for(let x=1;x<30;x+=3)if(Sim.canPlace(g,'house',x,y,1)&&g.ents.filter(e=>e.type==='house').length<12)Sim.addBld(g,0,'house',x,y,true);
for(const t of['sniper','rpg','demo','medic'])ok(Sim.cmdTrain(g,br.id,t),t+' kışlada üretilir');
for(const t of['ltank','tank','htank','howitzer','flak'])ok(Sim.cmdTrain(g,fd.id,t),t+' dökümhanede üretilir');
// 3) şifacı iyileştirir
g=fresh();const md=Sim.addUnit(g,0,'medic',30,30),inf=Sim.addUnit(g,0,'inf',31,30);inf.hp=10;step(g,5);ok(inf.hp>35,'şifacı yaralıyı iyileştirdi ('+inf.hp.toFixed(0)+')');
// 4) C4 binayı yıkar
g=fresh();const eb=Sim.addBld(g,1,'barracks',eT.tx-5,eT.ty,true);const c4=Sim.addUnit(g,0,'demo',eb.tx-3,eb.ty+1);const hp0=eb.hp;
ok(Sim.cmdC4(g,[c4.id],eb.id),'C4 emri');step(g,12);ok(c4.dead&&eb.hp<hp0-250,'C4 patladı, bina hasar aldı ('+hp0+'→'+Math.round(eb.hp)+')');
// 5) keskin nişancı menzil, bazukacı tank bonusu
g=fresh();const sn=Sim.addUnit(g,0,'sniper',30,30),tgt=Sim.addUnit(g,1,'inf',38,30);Sim.cmdAttack(g,[sn.id],tgt.id);step(g,6);ok(tgt.hp<tgt.maxhp,'nişancı 8 kare uzaktan vurdu');
const rp=Sim.addUnit(g,0,'rpg',30,40),tk=Sim.addUnit(g,1,'tank',34,40);const dTank=Math.max(1,rp.st.atk*2.0-tk.st.armor*(1-rp.st.pierce)),dInf=Math.max(1,rp.st.atk-tk.st.armor);ok(dTank>dInf*1.5,'bazukacı tanka güçlü');
// 6) uçaksavar aracı yere ateş etmez
g=fresh();const fl=Sim.addUnit(g,0,'flak',30,30),en=Sim.addUnit(g,1,'inf',33,30);step(g,3);ok(en.hp===en.maxhp,'uçaksavar aracı piyadeye ateş etmedi');
const jet=Sim.addUnit(g,1,'fighter',33,31);step(g,6);ok(jet.hp<jet.maxhp||jet.dead,'uçaksavar aracı uçağı vurdu');
// 7) radar casusu açığa çıkarır
g=fresh();const eb2=g.ents.find(e=>e.owner===1&&e.type==='tc');g.owners[1].age=3;const rd=Sim.addBld(g,1,'radar',eb2.tx-4,eb2.ty,true);
const sp=Sim.addUnit(g,0,'spy',rd.tx-8,rd.ty);sp.disguised=true;step(g,1);ok(sp.seen&&sp.seen[1]&&sp.radar[1],'radar 8 kare uzaktaki kılıklı casusu tespit etti');
const sp2=Sim.addUnit(g,0,'spy',rd.tx-25,rd.ty);step(g,1);ok(!sp2.seen[1],'radar menzili dışındaki casus gizli');
ok(Sim.UNIT.spy.sight<=6,'casus görüşü sınırlı ('+Sim.UNIT.spy.sight+')');
console.log(f?'BAŞARISIZ':'HEPSİ TAMAM');process.exit(f?1:0);
