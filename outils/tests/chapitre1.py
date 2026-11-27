import os, time, mimetypes, sys, json
from playwright.sync_api import sync_playwright
exec(open('/tmp/t2/dlg.py').read().split('def run(')[0].split('from playwright.sync_api import sync_playwright')[1])
logs=[]
def run(b):
    ctx=b.new_context(viewport={'width':390,'height':760}, device_scale_factor=1, user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', has_touch=True)
    pg=ctx.new_page(); pg.add_init_script(FAKE); pg.route('**/*', route)
    pg.on('pageerror', lambda e: logs.append(f'PAGEERROR {e}'))
    pg.on('console', lambda m: logs.append(f'CONSOLE {m.text[:200]}') if m.type=='error' else None)
    pg.goto('http://pv.test/index.html?local&test&debug', wait_until='load'); time.sleep(1.5)
    pg.evaluate("localStorage.setItem('pv_help','1'); localStorage.setItem('pv_nomic','1')")
    if pg.is_visible('#onbGo'): pg.click('#onbGo')
    time.sleep(8)
    shot = lambda n: pg.screenshot(path=f'/tmp/t2/st_{n}.png')
    logs.append(f"carte départ visible={pg.is_visible('#stCard')}"); shot('1_start')
    pg.click('#stCard .btn >> nth=0'); time.sleep(1)
    def cap(n=None):
        for k in range(60):
            if pg.is_visible('#stCap'): break
            time.sleep(.5)
        if n: shot(n)
        txt = pg.inner_text('#stCapTxt') if pg.is_visible('#stCap') else '(pas de légende)'
        pg.click('#stCap') if pg.is_visible('#stCap') else None
        return txt[:60]
    def dialog(tag, picks=None, maxn=12):
        for k in range(120):
            if pg.evaluate('PVT.dlgOpen()'): break
            time.sleep(.5)
        who = pg.inner_text('#dWho') if pg.evaluate('PVT.dlgOpen()') else '(pas de dialogue)'
        n = 0
        while pg.evaluate('PVT.dlgOpen()') and n < maxn:
            opts = pg.query_selector_all('#dOpts .opt')
            if not opts: time.sleep(.5); n += .25; continue
            i = picks[min(int(n), len(picks)-1)] if picks else 0
            if n == 1 and tag: shot(tag)
            opts[min(i, len(opts)-1)].click(); n += 1; time.sleep(.7)
        time.sleep(3.8)
        return who
    logs.append('légende 1: ' + cap('2_arrive'))
    time.sleep(1); logs.append('objectif: ' + (pg.inner_text('#carnetTxt') if pg.is_visible('#carnet') else '(caché)')); shot('2b_carnet')
    pg.evaluate("PVDBG.go(0.6, 2.4, 0)"); time.sleep(3)
    logs.append('voleur: ' + dialog('3_thief', [0]))
    logs.append('légende 2: ' + cap('3b_stolen')); time.sleep(.6)
    logs.append('légende 3: ' + cap()); time.sleep(.5)
    logs.append('tom: ' + dialog('4_tom', [0,0,0]))
    time.sleep(1); logs.append('étape ' + json.dumps(pg.evaluate('PVT.story()'), ensure_ascii=False)); shot('5_work')
    pg.evaluate('PVT.enterBakery()'); time.sleep(2.5)
    for k in range(4):
        logs.append('boulangerie: ' + dialog(['6a','6b','6c','6d'][k]))
        time.sleep(4)
    logs.append('étape ' + json.dumps(pg.evaluate('PVT.story()'), ensure_ascii=False))
    logs.append(f"intro visible avant sortie={pg.is_visible('#intro')} titre={pg.inner_text('#introTitleTxt') if pg.is_visible('#intro') else ''}")
    pg.evaluate('PVT.exitBakery()'); time.sleep(2)
    logs.append(f"intro visible après sortie={pg.is_visible('#intro')}")
    time.sleep(2); shot('6e_markers')
    pg.evaluate("PVStory.obj('pharmacy')"); logs.append('pharmacie (étiquette): ' + dialog('7_pharma', [0,0]))
    pg.evaluate("PVT.openNpc('jones')"); logs.append('police: ' + dialog('8_police', [0,0,0,0,0,0]))
    time.sleep(1); logs.append('étape ' + json.dumps(pg.evaluate('PVT.story()'), ensure_ascii=False))
    pg.evaluate("PVStory.obj('phonebox')"); logs.append('cabine: ' + dialog(None, [0,0,0]))
    logs.append('maman: ' + cap('9_mum'))
    pg.evaluate("PVT.openNpc('maya')"); logs.append('maya: ' + dialog(None, [0,0]))
    pg.evaluate("PVT.openNpc('pemberton')"); logs.append('notaire: ' + dialog('10_lie', [0,0,0]))
    logs.append('fin: ' + cap('11_end')); time.sleep(.8)
    logs.append(f"carte fin visible={pg.is_visible('#stCard')} " + (pg.inner_text('#stCard h2') if pg.is_visible('#stCard') else '')); shot('12_card')
    logs.append('étape ' + json.dumps(pg.evaluate('PVT.story()'), ensure_ascii=False))
    pg.click('#stCard .btn'); time.sleep(.5)
    pg.click('#helpBtn'); time.sleep(.6); pg.click('#restartStory'); time.sleep(.6); shot('13_restart')
    pg.click('#stCard .btn >> nth=0'); time.sleep(9)
    logs.append(f"après recommencer : carte de départ={pg.is_visible('#stCard')} histoire={pg.evaluate('PVT.story()')}")
    ctx.close()
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True, args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    try:
        run(b)
    except Exception as e:
        logs.append('EXC ' + str(e)[:200])
    b.close()
print('\n'.join(logs))
