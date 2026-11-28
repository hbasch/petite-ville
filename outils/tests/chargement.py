# Mesure du chargement de la ville (Chrome sans écran, rendu logiciel : comparer avant/après, pas des valeurs absolues).
# Usage : python3 chargement.py tel|pc|both [racine du dépôt]   (N=5 pour 5 essais et la médiane ; QX='&meshy' pour ajouter à l'adresse ; RES=1 liste les fichiers téléchargés)
# Affiche : durée de buildTown (première image comprise), délai clic → première image, nombre de shaders,
#           et les étapes notées par town.js (PVDBG.times() avec ?debug : chaque partie de la construction, puis les 5 premières images).
# Le clic sur « Entrer » est fait en JavaScript : l'écran de chargement couvre encore l'accueil (voir FICHE-REPRISE / index.html).
import os, sys, time, json, mimetypes
from playwright.sync_api import sync_playwright
exec(open('/tmp/t2/dlg.py').read().split('def run(')[0].split('from playwright.sync_api import sync_playwright')[1])
ROOT = sys.argv[2] if len(sys.argv) > 2 else os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
which = sys.argv[1]; QX = os.environ.get('QX', '')
INIT = r"""
window.__T = { nav: performance.timeOrigin };
let _rd; Object.defineProperty(window, 'PVTownReady', { configurable: true, get(){ return _rd; }, set(v){ if (v && !_rd) window.__T.ready = performance.now(); _rd = v; } });
let _bt; Object.defineProperty(window, 'buildTown', { configurable: true, get(){ return _bt; }, set(f){ _bt = function(H){ const a = performance.now(); window.__T.buildStart = a; const r = f(H); window.__T.buildEnd = performance.now(); return r; }; } });
const _raf = window.requestAnimationFrame.bind(window); let n = 0; window.__F = [];
window.requestAnimationFrame = cb => _raf(ts => { const a = performance.now(); cb(ts); const d = performance.now() - a; if (window.__T.buildEnd && window.__F.length < 8 && d > 3) window.__F.push([Math.round(a), Math.round(d)]); });
"""
def run(b, name, vp, ua):
    ctx = b.new_context(viewport=vp, device_scale_factor=1, user_agent=ua, has_touch=vp['width'] < 700)
    pg = ctx.new_page(); pg.add_init_script(FAKE); pg.add_init_script(INIT); pg.route('**/*', route)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://pv.test/index.html?local&test&debug' + QX, wait_until='load', timeout=120000)
    t_load = pg.evaluate("performance.now()")
    pg.evaluate("localStorage.setItem('pv_help','1')")
    click = pg.evaluate("(() => { const t = performance.now(); document.getElementById('onbGo').click(); return t; })()")
    pg.wait_for_function("window.PVTownReady", timeout=120000); time.sleep(4)
    r = pg.evaluate("({T: window.__T, F: window.__F, times: window.PVDBG && PVDBG.times && PVDBG.times(), progs: PVDBG.R.info.programs.length, ready: performance.now(), res: performance.getEntriesByType('resource').map(e => [e.name.split('/').pop().split('?')[0], Math.round(e.transferSize || e.encodedBodySize || 0), Math.round(e.responseEnd)])})")
    T = r['T']; SUM.append((name, T['buildEnd']-T['buildStart'], T['ready']-click, T['ready']-T['buildEnd'], r['progs']))
    print(f"== {name}  load event {t_load:.0f} ms ; clic {click:.0f} ; buildTown {r['T']['buildStart']-click:.0f} ms après le clic, durée {r['T']['buildEnd']-r['T']['buildStart']:.0f} ms ; shaders {r['progs']}")
    print('   étapes (ms depuis le début de buildTown) :', r['times'])
    print('   images lentes après construction [début, durée] :', r['F'])
    if os.environ.get('RES'): [print('   ', x) for x in r['res']]
    if errs: print('   ERREURS', errs)
    ctx.close()
SUM = []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    for k in range(int(os.environ.get('N', '1'))):
        if which in ('tel', 'both'): run(b, 'tel', {'width': 390, 'height': 760}, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1')
        if which in ('pc', 'both'): run(b, 'pc', {'width': 1280, 'height': 760}, None)
    b.close()
import statistics as st
for nm in ('tel','pc'):
    L=[x for x in SUM if x[0]==nm]
    if L: print(f'MEDIANE {nm}: construction {st.median([x[1] for x in L]):.0f} ms ; clic -> 1re image {st.median([x[2] for x in L]):.0f} ms (dont 1re image {st.median([x[3] for x in L]):.0f} ms) ; shaders {L[-1][4]}  (n={len(L)})')
