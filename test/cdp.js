// Chrome'u DevTools protokolüyle sür: telefon emülasyonu, dokunma, ekran görüntüsü. Ek paket yok (Node 22+ WebSocket).
const { spawn } = require('child_process'), fs = require('fs'), path = require('path'), os = require('os');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
async function launch(opt = {}) {
  const port = 9300 + Math.floor(Math.random() * 500), dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-'));
  const proc = spawn(CHROME, ['--headless=new', '--disable-gpu', '--allow-file-access-from-files', '--remote-debugging-port=' + port, '--user-data-dir=' + dir, '--no-first-run', '--window-size=' + (opt.w || 844) + ',' + (opt.h || 390), 'about:blank'], { stdio: 'ignore' });
  let list; for (let i = 0; i < 60; i++) { try { list = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json(); if (list.find(t => t.type === 'page')) break; } catch (e) { /* bekle */ } await new Promise(r => setTimeout(r, 250)); }
  const ws = new WebSocket(list.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise(r => ws.addEventListener('open', r));
  let id = 0; const pend = new Map(), logs = [];
  ws.addEventListener('message', m => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { const p = pend.get(d.id); pend.delete(d.id); d.error ? p.rej(new Error(d.error.message)) : p.res(d.result); } else if (d.method === 'Runtime.exceptionThrown') logs.push('EXC ' + (d.params.exceptionDetails.exception && d.params.exceptionDetails.exception.description || d.params.exceptionDetails.text)); else if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') logs.push('ERR ' + d.params.args.map(a => a.value || a.description).join(' ')); });
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Runtime.enable'); await send('Page.enable');
  const api = {
    send, logs,
    async phone(w = 844, h = 390, dpr = 3, mobile = true) { await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: dpr, mobile, screenWidth: w, screenHeight: h }); await send('Emulation.setTouchEmulationEnabled', { enabled: mobile, maxTouchPoints: 5 }); if (mobile) await send('Emulation.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36' }); },
    async cpu(rate) { await send('Emulation.setCPUThrottlingRate', { rate }); },
    async go(url) { const l = new Promise(r => { const f = m => { if (JSON.parse(m.data).method === 'Page.loadEventFired') { ws.removeEventListener('message', f); r(); } }; ws.addEventListener('message', f); }); await send('Page.navigate', { url }); await l; },
    async ev(expr) { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception ? r.exceptionDetails.exception.description : r.exceptionDetails.text); return r.result.value; },
    async shot(file) { const r = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(file, Buffer.from(r.data, 'base64')); },
    sleep: ms => new Promise(r => setTimeout(r, ms)),
    async touch(type, pts) { await send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((p, i) => ({ x: p[0], y: p[1], id: i + 1 })) }); },
    async tap(x, y) { await api.touch('touchStart', [[x, y]]); await api.sleep(40); await api.touch('touchEnd', []); await api.sleep(80); },
    async drag(x0, y0, x1, y1, steps = 8) { await api.touch('touchStart', [[x0, y0]]); for (let i = 1; i <= steps; i++) { await api.touch('touchMove', [[x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps]]); await api.sleep(16); } await api.touch('touchEnd', []); await api.sleep(80); },
    async pinch(cx, cy, d0, d1, steps = 8) { await api.touch('touchStart', [[cx - d0 / 2, cy], [cx + d0 / 2, cy]]); for (let i = 1; i <= steps; i++) { const d = d0 + (d1 - d0) * i / steps; await api.touch('touchMove', [[cx - d / 2, cy], [cx + d / 2, cy]]); await api.sleep(16); } await api.touch('touchEnd', []); await api.sleep(80); },
    async close() { try { await send('Browser.close'); } catch (e) { /* kapandı */ } try { proc.kill(); } catch (e) { /* yok */ } }
  };
  return api;
}
module.exports = { launch };
