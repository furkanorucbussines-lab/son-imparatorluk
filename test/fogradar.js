const Sim=require('../sim.js');let f=0;const ok=(c,m)=>{console.log(c?'✔':'✘',m);if(!c)f++;};
const step=(g,sec)=>{for(let i=0;i<20*sec;i++)Sim.update(g,0.05);};
const fresh=()=>{const g=Sim.create({seed:5,difficulty:'normal'});return g;};
const cnt=o=>{let n=0;for(let i=0;i<o.vis.length;i++)n+=o.vis[i];return n;};
// 1) birim ayrılınca görüş kapanır
let g=fresh();let o=g.owners[0];const sc=Sim.addUnit(g,0,'cav',40,30);step(g,1);const idx=30*64+40;ok(o.vis[idx]===1,'birimin olduğu yer açık');
Sim.cmdMove(g,[sc.id],10,50,false);step(g,25);ok(o.vis[idx]===0&&o.explored[idx]===1,'birim gidince orası tekrar sisli (keşfedilmiş ama görünmez)');
// 2) yerel radar belli bölgeyi sürekli aydınlatır
g=fresh();o=g.owners[0];o.age=2;const tc=g.ents.find(e=>e.owner===0&&e.type==='tc');const before=cnt(o);
const rd=Sim.addBld(g,0,'radar',tc.tx+10,tc.ty+10,true);step(g,1);const after=cnt(o);ok(after>before+300,'yerel radar bölge açtı (+'+(after-before)+' kare)');ok(after<64*64*0.6,'yerel radar tüm haritayı açmaz');
// 3) küresel radar tüm haritayı açar
const gr=Sim.addBld(g,0,'gradar',tc.tx+14,tc.ty,true);step(g,1);ok(cnt(o)===64*64,'küresel radar tüm haritayı aydınlattı');
// 4) casus küresel radarı patlatır, harita yeniden sisle kaplanır
g=fresh();o=g.owners[0];const e=g.owners[1];const eTc=g.ents.find(x=>x.owner===1&&x.type==='tc');
const g2=Sim.addBld(g,1,'gradar',eTc.tx-5,eTc.ty,true);step(g,1);ok(cnt(e)===64*64,'düşman küresel radarı harita açık');
const sp=Sim.addUnit(g,0,'spy',g2.tx-3,g2.ty+2);Sim.cmdSpy(g,[sp.id],g2.id,'sabotage');step(g,20);
ok(g2.dead&&sp.dead,'casus radara girince ikisi de yok oldu');step(g,1);ok(cnt(e)<64*64*0.5,'harita yeniden sisle kaplandı ('+cnt(e)+' kare açık)');
const myUnit=g.ents.find(x=>x.owner===1&&x.type==='villager');const i2=Math.floor(myUnit.y)*64+Math.floor(myUnit.x);ok(e.vis[i2]===1,'birimlerin olduğu yer hâlâ açık');
// 5) yerel radar da patlar
g=fresh();g.owners[1].age=2;const eTc2=g.ents.find(x=>x.owner===1&&x.type==='tc');const lr=Sim.addBld(g,1,'radar',eTc2.tx-5,eTc2.ty,true);
const sp2=Sim.addUnit(g,0,'spy',lr.tx-3,lr.ty+2);Sim.cmdSpy(g,[sp2.id],lr.id,'sabotage');step(g,20);ok(lr.dead,'yerel radar casus tarafından patlatıldı');
// 6) Yeni radar kurulunca geri gelir
g=fresh();o=g.owners[0];o.res={f:9999,w:9999,g:9999,i:9999};o.age=3;const t3=g.ents.find(x=>x.owner===0&&x.type==='tc');
const vil=g.ents.filter(x=>x.owner===0&&x.type==='villager').map(x=>x.id);ok(!!Sim.cmdBuild(g,0,vil,'gradar',t3.tx+8,t3.ty+8),'küresel radar inşa edilebilir');step(g,70);ok(cnt(o)===64*64,'yeni istasyon bitince harita açıldı');
console.log(f?'BAŞARISIZ':'HEPSİ TAMAM');process.exit(f?1:0);
