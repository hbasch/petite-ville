// Copie du banc d'essai pour l'amélioration 3D : lit les vrais appels/triangles du panneau ?debug,
// masque l'interface avant la capture. usage : node mesure.js <site> [mobile|desktop] [capture.png] [heure] [cmd]
const HN = '/home/claude/harness/node_modules';
const puppeteer = require(HN + '/puppeteer-core');
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2]);
const mode = process.argv[3] || 'mobile', shot = process.argv[4], hour = process.argv[5], cmd = process.argv[6] || '';
const types = { '.js': 'application/javascript', '.html': 'text/html', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };
const srv = http.createServer((q, s) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  const f = path.join(root, u === '/' ? 'index.html' : u);
  fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); s.end(d); });
}).listen(0, async () => {
  const port = srv.address().port;
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage();
  if (mode === 'mobile') await page.emulate({ viewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true }, userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Mobile Safari/537.36' });
  else await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  await page.setRequestInterception(true);
  page.on('request', r => {
    const u = r.url();
    const m = u.match(/cdn\.jsdelivr\.net\/npm\/(three|@supabase\/supabase-js)@[^/]+\/(.*)$/);
    if (m) { const f = path.join(HN, m[1], m[2]); if (fs.existsSync(f)) return r.respond({ status: 200, contentType: 'application/javascript', body: fs.readFileSync(f) }); }
    if (u.startsWith('http://127.0.0.1') || u.startsWith('http://localhost') || u.startsWith('data:')) return r.continue();
    r.abort();
  });
  const logs = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning' || /PERF|ERR/.test(m.text())) logs.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', e => logs.push('pageerror: ' + e.message));
  page.on('requestfailed', r => { if (process.env.URLS) logs.push('failed: ' + r.url().slice(0, 120)); });
  page.on('response', r => { if (process.env.URLS && r.status() >= 400) logs.push('http ' + r.status() + ': ' + r.url().slice(0, 120)); });
  await page.evaluateOnNewDocument(() => {
    localStorage.clear(); window.__fr = [];
    let last = performance.now();
    const tick = () => { const n = performance.now(); __fr.push(n - last); last = n; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  await page.goto(`http://127.0.0.1:${port}/?local&debug${process.env.PAYS ? '&pays=' + process.env.PAYS : ''}${process.env.EXTRA || ''}`, { waitUntil: 'load' });
  await page.waitForSelector('#onbGo', { visible: true, timeout: 20000 }).catch(() => {});
  await page.evaluate(() => { const b = document.getElementById('onbGo'); if (b) b.click(); });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => { const b = document.getElementById('enter'); if (b) b.click(); });
  await new Promise(r => setTimeout(r, 2500));
  if (hour) await page.evaluate(h => { if (window.PVDBG) PVDBG.setHour(+h); }, hour);
  if (cmd) await page.evaluate(cmd);
  await page.evaluate(() => { __fr = []; window.__dbg = []; window.__dbgIv = setInterval(() => { const d = [...document.querySelectorAll('div')].find(x => /appels/.test(x.textContent) && x.children.length === 0); if (d) __dbg.push(d.textContent); }, 520); });
  await new Promise(r => setTimeout(r, +(process.env.WAIT || 5000)));
  const st = await page.evaluate(() => {
    clearInterval(__dbgIv);
    const f = __fr.slice(2), ms = f.length ? Math.round(f.reduce((a, b) => a + b, 0) / f.length) : 0;
    const rows = __dbg.map(t => { const m = t.match(/(\d+) appels · (\d+)k tri/); return m ? [+m[1], +m[2]] : null; }).filter(Boolean);
    const av = k => rows.length ? Math.round(rows.reduce((a, r) => a + r[k], 0) / rows.length) : 0;
    const mx = k => rows.length ? Math.max(...rows.map(r => r[k])) : 0;
    const R = window.PVDBG && PVDBG.R;
    let meshes = 0; if (window.PVDBG) PVDBG.scene.traverse(o => { if (o.isMesh) meshes++; });
    return { frames: f.length, msPerFrame: ms, calls: av(0), callsMax: mx(0), ktris: av(1), ktrisMax: mx(1), programs: R ? R.info.programs.length : 0, geos: R ? R.info.memory.geometries : 0, meshes, last: __dbg[__dbg.length - 1] };
  });
  console.log(JSON.stringify(st));
  if (shot) {
    await page.evaluate(() => { document.querySelectorAll('body > *').forEach(e => { if (e.id !== 'ct' && e.id !== 'c') e.style.visibility = 'hidden'; }); });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: shot });
  }
  if (logs.length) console.log(logs.slice(0, 15).join('\n'));
  await browser.close(); srv.close();
});
