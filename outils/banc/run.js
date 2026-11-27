// Banc d'essai : charge l'appli en local (three.js servi depuis node_modules), passe l'accueil,
// mesure appels de dessin / triangles / temps de frame, et peut faire une capture.
// usage : node run.js <dossier_site> [mobile|desktop] [capture.png] [heure] [cmd]
const puppeteer = require('puppeteer-core');
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || '../petite-ville');
const mode = process.argv[3] || 'mobile';
const shot = process.argv[4];
const hour = process.argv[5];
const cmd = process.argv[6] || '';
const NM = path.join(__dirname, 'node_modules');
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
    if (m) { const f = path.join(NM, m[1], m[2]); if (fs.existsSync(f)) return r.respond({ status: 200, contentType: 'application/javascript', body: fs.readFileSync(f) }); }
    if (u.startsWith('http://127.0.0.1') || u.startsWith('http://localhost') || u.startsWith('data:')) return r.continue();
    r.abort();
  });
  const logs = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning' || /PERF|ERR/.test(m.text())) logs.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', e => logs.push('pageerror: ' + e.message));
  await page.evaluateOnNewDocument(() => {
    localStorage.clear();
    window.__stats = { calls: 0, tris: 0, frames: [] };
    const hook = () => {
      if (!window.THREE || !THREE.WebGLRenderer || THREE.WebGLRenderer.__hooked) return !!(window.THREE && THREE.WebGLRenderer && THREE.WebGLRenderer.__hooked);
      const Orig = THREE.WebGLRenderer;
      THREE.WebGLRenderer = function (p) { const r = new Orig(p); window.__R = r; const rr = r.render.bind(r); r.render = (s, c) => { if (s.isScene && s.children.length > 20) { window.__S = s; window.__Ss = window.__Ss || new Set(); __Ss.add(s); } window.__C = c; rr(s, c); __stats.calls += r.info.render.calls; __stats.tris += r.info.render.triangles; }; return r; };
      THREE.WebGLRenderer.__hooked = true; return true;
    };
    const iv = setInterval(() => { if (hook()) clearInterval(iv); }, 1);
    let last = performance.now();
    const tick = () => { const n = performance.now(); __stats.frames.push({ dt: n - last, calls: __stats.calls, tris: __stats.tris }); last = n; __stats.calls = 0; __stats.tris = 0; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  await page.goto(`http://127.0.0.1:${port}/?local&debug${process.env.PAYS ? '&pays=' + process.env.PAYS : ''}${process.env.EXTRA || ''}${process.env.PAL ? '&palette=' + process.env.PAL : ''}`, { waitUntil: 'load' });
  await page.waitForSelector('#onbGo', { visible: true, timeout: 20000 }).catch(() => {});
  await page.evaluate(() => { const b = document.getElementById('onbGo'); if (b) b.click(); });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => { const b = document.getElementById('enter'); if (b) b.click(); });
  if (hour) await page.evaluate(h => { const iv = setInterval(() => { if (window.__town) { window.__town.setHour(+h); clearInterval(iv); } }, 50); }, hour);
  await new Promise(r => setTimeout(r, 2500));
  if (cmd) await page.evaluate(cmd);
  await page.evaluate(() => { __stats.frames = []; });
  await new Promise(r => setTimeout(r, +(process.env.WAIT || 4000)));
  const st = await page.evaluate(() => {
    const f = __stats.frames.filter(x => x.calls > 0);
    const avg = k => f.length ? Math.round(f.reduce((a, x) => a + x[k], 0) / f.length) : 0;
    const R = window.__R; const i = R ? R.info : null;
    return { frames: f.length, msPerFrame: avg('dt'), calls: avg('calls'), tris: avg('tris'), programs: i ? i.programs.length : 0, geometries: i ? i.memory.geometries : 0, textures: i ? i.memory.textures : 0,
      pr: R ? R.getPixelRatio() : 0, size: R ? (() => { const v = R.getDrawingBufferSize(new THREE.Vector2()); return v.x + 'x' + v.y; })() : '' };
  });
  console.log(JSON.stringify(st));
  if (shot) await page.screenshot({ path: shot });
  if (logs.length) console.log(logs.slice(0, 15).join('\n'));
  await browser.close(); srv.close();
});
