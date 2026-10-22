// çizim kodunu sahte canvas ile Node'da çalıştırır (takılma/hata avı)
const mk=()=>{const h={get(t,k){if(k==='createImageData')return (w,hh)=>({data:new Uint8ClampedArray(w*hh*4),width:w,height:hh});if(k==='createLinearGradient'||k==='createRadialGradient')return ()=>({addColorStop(){}});if(k==='measureText')return ()=>({width:30});if(k in t)return t[k];return ()=>{};},set(t,k,v){t[k]=v;return true;}};return new Proxy({},h);};
global.window=global;
global.document={createElement:()=>({width:0,height:0,getContext:()=>mk()})};
global.performance=performance;
const Sim=require('../sim.js');global.Sim=Sim;
require('../render.js');require('../bldart.js');require('../bldart2.js');
const g=Sim.create({seed:+process.argv[2]||5,difficulty:'normal'});g.owners[0].ai=true;
let t=Date.now();Render.init(g);console.log('init ms',Date.now()-t);
const c=mk();const V=()=>({g,ME:0,cam:{x:5,y:5},ts:38,vw:1280,vh:700,dpr:1,sel:g.ents.filter(e=>e.owner===0&&e.k==='u').slice(0,5).map(e=>e.id),mode:null,mouse:{in:false,x:0,y:0,wx:0,wy:0},wallTiles:null,drag:null,pings:[],time:performance.now()/1000,power:Sim.CIVS.osmanli.power});
let worst=0;
for(let i=0;i<20*(+process.argv[3]||420);i++){Sim.update(g,0.05);if(i%3===0){const t0=Date.now();Render.draw(c,V(),0.05*3);worst=Math.max(worst,Date.now()-t0);}}
g.owners[0].explored.fill(1);
console.log('ok t=',g.time|0,'worst draw ms',worst,'winner',g.winner);
