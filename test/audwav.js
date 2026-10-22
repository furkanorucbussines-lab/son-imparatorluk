// ogg efektleri -> mono 16-bit WAV (Safari/iOS ogg çalmaz); sonra manifest yenilenir
const { launch } = require('./cdp.js'); const path = require('path'), fs = require('fs');
const root = path.join(__dirname, '..'), dir = path.join(root, 'audio', 'sfx');
(async () => {
  const b = await launch({ w: 400, h: 300 }); await b.phone(400, 300, 1, false);
  fs.writeFileSync(path.join(__dirname, 'auto-prep.html'), '<!doctype html><body>prep</body>');
  await b.go('file:///' + path.join(__dirname, 'auto-prep.html').split(path.sep).join('/'));
  let total = 0;
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.ogg'))) {
    const src = 'file:///' + path.join(dir, f).split(path.sep).join('/');
    const b64 = await b.ev(`(async()=>{const ab=await (await fetch(${JSON.stringify(src)})).arrayBuffer();const ac=new OfflineAudioContext(1,44100,44100);const buf=await ac.decodeAudioData(ab);const sr=buf.sampleRate,n=Math.min(buf.length,Math.floor(sr*2.5));const ch=[];for(let c=0;c<buf.numberOfChannels;c++)ch.push(buf.getChannelData(c));const out=new Int16Array(n);for(let i=0;i<n;i++){let s=0;for(const c of ch)s+=c[i];s/=ch.length;out[i]=Math.max(-32768,Math.min(32767,s*32767));}const hdr=new ArrayBuffer(44),v=new DataView(hdr);const w=(o,t)=>{for(let i=0;i<t.length;i++)v.setUint8(o+i,t.charCodeAt(i))};w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);const all=new Uint8Array(44+n*2);all.set(new Uint8Array(hdr),0);all.set(new Uint8Array(out.buffer),44);let s='';for(let i=0;i<all.length;i+=8192)s+=String.fromCharCode.apply(null,all.subarray(i,i+8192));return btoa(s);})()`);
    const out = path.join(dir, f.replace(/\.ogg$/, '.wav')); fs.writeFileSync(out, Buffer.from(b64, 'base64')); total += fs.statSync(out).size; fs.unlinkSync(path.join(dir, f));
  }
  console.log('wav toplam KB', (total / 1024).toFixed(0)); await b.close();
})().catch(e => { console.log('HATA', e.message); process.exit(1); });
