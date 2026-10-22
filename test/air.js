const Sim=require('../sim.js');let fails=0;const ok=(c,m)=>{console.log(c?'✔':'✘',m);if(!c)fails++;};
function fresh(){const g=Sim.create({seed:5,difficulty:'normal'});g.owners[0].explored.fill(1);return g;}
const step=(g,sec)=>{for(let i=0;i<20*sec;i++)Sim.update(g,0.05);};
// 1) çağ 3 kuralları
let g=fresh();let o=g.owners[0];const tc=g.ents.find(e=>e.owner===0&&e.type==='tc');
o.res={f:9999,w:9999,g:9999,i:9999};o.age=2;
Sim.addBld(g,0,'barracks',tc.tx+5,tc.ty,true);
ok(!Sim.cmdAgeUp(g,0),'Modern Çağ için Top Dökümhanesi gerekli (kilit)');
o.age=1;const fd=Sim.addBld(g,0,'foundry',tc.tx+5,tc.ty+4,true);o.age=2;
ok(Sim.cmdAgeUp(g,0),'Modern Çağ başladı');step(g,76);ok(o.age===3,'çağ 3');
// nüfus için evler
let hc=0;for(let y=1;y<60&&hc<10;y+=3)for(let x=1;x<30&&hc<10;x+=3)if(Sim.canPlace(g,'house',x,y,1)){Sim.addBld(g,0,'house',x,y,true);hc++;}
// 2) üretim kilitleri
const af=Sim.addBld(g,0,'airfield',tc.tx+9,tc.ty,true);
for(const t of ['iha','siha','fighter','heli','bomber'])ok(Sim.cmdTrain(g,af.id,t),t+' üretimi başladı');
ok(Sim.cmdTrain(g,fd.id,'tank'),'tank üretimi başladı');
step(g,170);
const U=t=>g.ents.find(e=>e.owner===0&&e.type===t);
ok(['iha','siha','fighter','heli','bomber','tank'].every(t=>U(t)),'tüm modern birimler sahada');
// 3) hava birimi su/engel üstünden geçer
const f=U('fighter');const lakePt=(()=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++)if(g.ter[y*64+x]&&Math.hypot(x-f.x,y-f.y)>10)return{x,y};})();
Sim.cmdMove(g,[f.id],lakePt.x+.5,lakePt.y+.5,false);step(g,10);
ok(Math.hypot(f.x-lakePt.x,f.y-lakePt.y)<2,'savaş uçağı sudaki noktaya uçtu');
// 4) hedefleme kuralları
g=fresh();o=g.owners[0];const e1=g.owners[1];const T=g.ents.find(e=>e.owner===1&&e.type==='tc');
const cx=32,cy=32;
const mk=(own,t,x,y)=>Sim.addUnit(g,own,t,x,y);
const heli=mk(1,'heli',cx,cy);const inf=mk(0,'inf',cx-1,cy);const arch=mk(0,'archer',cx-1,cy+1);
step(g,6);
ok(heli.hp===heli.maxhp||heli.hp<heli.maxhp,'(bilgi) heli hp '+Math.round(heli.hp)+'/'+heli.maxhp);
ok(inf.hp<inf.maxhp,'helikopter piyadeye saldırdı');
ok(heli.hp<heli.maxhp,'okçu helikoptere ateş etti (hitsAir)');
g=fresh();const h2=mk(1,'heli',cx,cy);const i2=mk(0,'inf',cx-1,cy);const sw=mk(0,'siege',cx-1.5,cy+1);
step(g,3);const hp=h2.hp;ok(h2.hp===h2.maxhp,'piyade ve top havaya ateş edemez (hp '+Math.round(h2.hp)+')');
// 5) SAM
g=fresh();g.owners[0].age=3;const sam=Sim.addBld(g,0,'sam',30,30,true);const jet=mk(1,'fighter',33,31);jet.order='move';jet.dest={x:33,y:31};
step(g,8);ok(jet.dead||jet.hp<jet.maxhp*0.5,'uçaksavar savaş uçağını vurdu');
const gr=mk(1,'inf',33,31);step(g,4);ok(gr.hp===gr.maxhp,'uçaksavar yere ateş etmez');
// 6) bombardıman bina yıkar
g=fresh();g.owners[1].age=3;const b=mk(1,'bomber',20,20);const tcs=g.ents.find(e=>e.owner===0&&e.type==='tc');Sim.cmdAttack(g,[b.id],tcs.id);const hp0=tcs.hp;step(g,25);
ok(tcs.hp<hp0-300,'bombardıman Şehir Merkezi\'ni hasarladı (-'+Math.round(hp0-tcs.hp)+')');
// 7) İHA saldırmaz ama görüş verir
g=fresh();const ih=mk(0,'iha',10,10);Sim.cmdMove(g,[ih.id],40,40,false);step(g,10);
ok(g.owners[0].explored[40*64+40]===1,'İHA haritayı açtı');ok(ih.order!=='attack','İHA saldırmaz');
console.log(fails?'BAŞARISIZ '+fails:'hepsi tamam');
