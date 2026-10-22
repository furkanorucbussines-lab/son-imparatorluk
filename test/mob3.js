const { launch } = require('./cdp.js'); const path = require('path');
(async () => {
  const b = await launch({ w: 844, h: 390 }); await b.phone(844, 390, 3, true);
  await b.go('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/')); await b.sleep(1500);
  await b.ev("document.getElementById('start').scrollIntoView({block:'center'})"); await b.sleep(2000);
  const r2 = await b.ev("(()=>{const q=document.getElementById('start').getBoundingClientRect();const x=q.x+q.width/2,y=q.y+q.height/2;const el=document.elementFromPoint(x,y);return [x,y,el&&el.id,el&&el.className,el&&el.tagName,document.getElementById('menu').scrollTop]})()");
  console.log(r2); await b.shot('test/m_g3.png');
  await b.tap(r2[0], r2[1]); await b.sleep(1500);
  console.log('running', await b.ev("!!window.__game.g"), b.logs); await b.close();
})().catch(e => { console.log('HATA', e.message); process.exit(1); });
