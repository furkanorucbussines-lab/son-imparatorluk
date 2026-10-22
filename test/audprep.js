// ses hazırlığı: tabanca wav'larını kırp/mono 16-bit yap, tüm efektler için tepe/süre manifesti üret
const { launch } = require('./cdp.js'); const path = require('path'), fs = require('fs');
const root = path.join(__dirname, '..'), S = process.argv[2];
(async () => {
  const b = await launch({ w: 400, h: 300 }); await b.phone(400, 300, 1, false);
  fs.writeFileSync(path.join(__dirname, 'auto-prep.html'), '<!doctype html><body>prep</body>');
  await b.go('file:///' + path.join(__dirname, 'auto-prep.html').split(path.sep).join('/'));
  const guns = { gun_cz: 'cz.wav', gun_sks: 'sks.wav', gun_mosin: 'mosin.wav', gun_shotty: 'shotty.wav' };
  for (const [name, f] of Object.entries(guns)) {
    const src = 'file:///' + path.join(S, 'x_guns', 'sounds', f).split(path.sep).join('/');
    const b64 = await b.ev(`(async()=>{const ab=await (await fetch(${JSON.stringify(src)})).arrayBuffer();const ac=new OfflineAudioContext(1,44100,44100);const buf=await ac.decodeAudioData(ab);const sr=buf.sampleRate;const n=Math.min(buf.length,Math.floor(sr*1.5));const ch=[];for(let c=0;c<buf.numberOfChannels;c++)ch.push(buf.getChannelData(c));const out=new Int16Array(n);let pk=0;for(let i=0;i<n;i++){let s=0;for(const c of ch)s+=c[i];s/=ch.length;pk=Math.max(pk,Math.abs(s));}const fade=Math.floor(sr*0.12);for(let i=0;i<n;i++){let s=0;for(const c of ch)s+=c[i];s/=ch.length;s=s/ (pk||1)*0.9;if(i>n-fade)s*=(n-i)/fade;out[i]=Math.max(-32768,Math.min(32767,s*32767));}const hdr=new ArrayBuffer(44),v=new DataView(hdr);const w=(o,t)=>{for(let i=0;i<t.length;i++)v.setUint8(o+i,t.charCodeAt(i))};w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);const all=new Uint8Array(44+n*2);all.set(new Uint8Array(hdr),0);all.set(new Uint8Array(out.buffer),44);let s='';for(let i=0;i<all.length;i+=8192)s+=String.fromCharCode.apply(null,all.subarray(i,i+8192));return btoa(s);})()`);
    fs.writeFileSync(path.join(root, 'audio', 'sfx', name + '.wav'), Buffer.from(b64, 'base64')); console.log(name, fs.statSync(path.join(root, 'audio', 'sfx', name + '.wav')).size);
  }
  const files = fs.readdirSync(path.join(root, 'audio', 'sfx')).filter(f => /\.(ogg|wav)$/.test(f)), man = {};
  for (const f of files) {
    const src = 'file:///' + path.join(root, 'audio', 'sfx', f).split(path.sep).join('/');
    const r = await b.ev(`(async()=>{const ab=await (await fetch(${JSON.stringify(src)})).arrayBuffer();const ac=new OfflineAudioContext(1,44100,44100);const buf=await ac.decodeAudioData(ab);let pk=0,sum=0,n=0;for(let c=0;c<buf.numberOfChannels;c++){const d=buf.getChannelData(c);for(let i=0;i<d.length;i++){const a=Math.abs(d[i]);if(a>pk)pk=a;sum+=d[i]*d[i];n++}}return [pk,Math.sqrt(sum/n),buf.duration]})()`);
    man[f] = { peak: +r[0].toFixed(3), rms: +r[1].toFixed(4), dur: +r[2].toFixed(2) };
  }
  // müzik süreleri
  for (const f of fs.readdirSync(path.join(root, 'audio', 'music'))) {
    const src = 'file:///' + path.join(root, 'audio', 'music', f).split(path.sep).join('/');
    const r = await b.ev(`(async()=>{const ab=await (await fetch(${JSON.stringify(src)})).arrayBuffer();const ac=new OfflineAudioContext(2,44100,44100);const buf=await ac.decodeAudioData(ab);let pk=0,sum=0,n=0;const d=buf.getChannelData(0);for(let i=0;i<d.length;i+=7){const a=Math.abs(d[i]);if(a>pk)pk=a;sum+=d[i]*d[i];n++}return [pk,Math.sqrt(sum/n),buf.duration]})()`);
    console.log('müzik', f, 'tepe', r[0].toFixed(2), 'rms', r[1].toFixed(3), 'süre', r[2].toFixed(1)); man['music/' + f] = { peak: +r[0].toFixed(3), rms: +r[1].toFixed(4), dur: +r[2].toFixed(1) };
  }
  fs.writeFileSync(path.join(root, 'audio', 'manifest.json'), JSON.stringify(man));
  console.log('manifest', Object.keys(man).length, b.logs.slice(0, 3)); await b.close();
})().catch(e => { console.log('HATA', e.message); process.exit(1); });
