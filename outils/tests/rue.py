import os, time, mimetypes, sys
from playwright.sync_api import sync_playwright
exec(open('/tmp/t2/dlg.py').read().split('def run(')[0].split('from playwright.sync_api import sync_playwright')[1])
logs=[]
def run(b, name, vp, ua):
    ctx=b.new_context(viewport=vp, device_scale_factor=1, user_agent=ua, has_touch=vp['width']<700)
    pg=ctx.new_page(); pg.add_init_script(FAKE); pg.route('**/*', route)
    pg.on('pageerror', lambda e: logs.append(f'[{name} pageerror] {e}'))
    pg.goto('http://pv.test/index.html?local&test&debug', wait_until='load'); time.sleep(1.2)
    pg.evaluate("localStorage.setItem('pv_help','1')")
    if pg.is_visible('#onbGo'): pg.click('#onbGo')
    time.sleep(8)
    if pg.is_visible('#stCard'): pg.click('#stCard .btn.ghost'); time.sleep(1)
    if pg.is_visible('#intro'): pg.evaluate("document.getElementById('intro').classList.add('hidden')")
    pg.evaluate("PVDBG.setHour(11)"); time.sleep(1.5)
    for nm, js in [('centre', "PVDBG.go(0.5, 1.0, 0)"), ('bus', "(()=>{const G=0.7,a=G+Math.PI,RT=[Math.cos(a),-Math.sin(a)],BK=[Math.sin(a),Math.cos(a)],u=-17,v=1;PVDBG.go(RT[0]*u+BK[0]*v, RT[1]*u+BK[1]*v, 0)})()"), ('parc', "(()=>{const G=0.7,a=G+Math.PI,RT=[Math.cos(a),-Math.sin(a)],BK=[Math.sin(a),Math.cos(a)],u=19,v=1;PVDBG.go(RT[0]*u+BK[0]*v, RT[1]*u+BK[1]*v, 0)})()")]:
        pg.evaluate(js); time.sleep(3.5); pg.screenshot(path=f'/tmp/t2/rue_{name}_{nm}.png')
    ctx.close()
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True, args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    run(b,'tel',{'width':390,'height':760},'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1')
    run(b,'pc',{'width':1280,'height':760},None)
    b.close()
print('\n'.join(logs))
