import os, time, mimetypes, sys
from playwright.sync_api import sync_playwright
ROOT='/home/claude/petite-ville'; TP='/tmp/review/three/package'; logs=[]
FAKE = r"""
class FakeSR { constructor(){ this.phrases=[]; this._on=false; }
 start(){ if(this._on) throw new Error('InvalidStateError'); if(this._used){ window.__FROZE=(window.__FROZE||0)+1; return; } if((window.__HANG||0)>0){ window.__HANG--; this._used=true; return; } this._used=true; this._on=true; window.__STARTS=(window.__STARTS||0)+1; window.__PHR=(this.phrases||[]).length;
  const q=(window.__SAY||[]).shift();
  setTimeout(()=>this.onstart&&this.onstart(),50); setTimeout(()=>this.onaudiostart&&this.onaudiostart(),250);
  if(q==null){ setTimeout(()=>{ if(!this._on) return; this.onerror&&this.onerror({error:'no-speech'}); this._end(); },1500); return; }
  setTimeout(()=>{ if(!this._on) return; const r=[Object.assign([{transcript:q}],{isFinal:true})]; this.onresult&&this.onresult({results:r}); setTimeout(()=>this._end(),100); },700); }
 _end(){ if(!this._on) return; this._on=false; this.onend&&this.onend(); }
 stop(){ setTimeout(()=>this._end(),30); } abort(){ setTimeout(()=>{ if(!this._on) return; this.onerror&&this.onerror({error:'aborted'}); this._end(); },10); } }
window.webkitSpeechRecognition=FakeSR; window.SpeechRecognition=FakeSR; window.SpeechRecognitionPhrase=function(p,b){this.phrase=p;this.boost=b;};
navigator.mediaDevices && (navigator.mediaDevices.getUserMedia=()=>Promise.resolve({getAudioTracks:()=>[{readyState:'live',muted:false}],getTracks:()=>[]}));
"""
def route(r):
    u=r.request.url
    if 'cdn.jsdelivr.net/npm/three@0.128.0/' in u: return r.fulfill(path=TP+'/'+u.split('three@0.128.0/')[1].split('?')[0], content_type='application/javascript')
    if 'supabase' in u: return r.fulfill(body='', content_type='application/javascript')
    if 'fonts.g' in u: return r.fulfill(body='', content_type='text/css')
    if u.startswith('http://pv.test/'):
        rel=u[len('http://pv.test/'):].split('?')[0] or 'index.html'; p=os.path.join(ROOT,rel)
        if os.path.isfile(p): return r.fulfill(path=p, content_type=mimetypes.guess_type(p)[0] or 'application/octet-stream')
        return r.fulfill(status=404, body='nf')
    return r.abort()
def run(b, name, vp, ua):
    ctx=b.new_context(viewport=vp, device_scale_factor=1, user_agent=ua, has_touch=vp['width']<700)
    pg=ctx.new_page(); pg.add_init_script(FAKE); pg.route('**/*', route)
    pg.on('console', lambda m: logs.append(f'[{name} {m.type}] {m.text[:300]}') if m.type=='error' else None)
    pg.on('pageerror', lambda e: logs.append(f'[{name} pageerror] {e}'))
    pg.goto('http://pv.test/index.html?local&test', wait_until='load'); time.sleep(1.5)
    if pg.is_visible('#onbGo'): pg.click('#onbGo')
    time.sleep(7)
    if pg.is_visible('#enter'): pg.click('#enter')
    time.sleep(3)
    for sel in ['#intro .btn', '#introGo', '#helpOk']:
        try:
            if pg.is_visible(sel): pg.click(sel); time.sleep(.5)
        except Exception: pass
    pg.evaluate("PVT.openNpc('rosa')"); time.sleep(2.5)
    opts=pg.evaluate("PVT.opts().map(o=>o.t)"); logs.append(f'{name} opts={opts}')
    pg.screenshot(path=f'/tmp/t2/dlg_{name}.png')
    # phrase coupée en deux : le premier morceau ne suffit pas, on doit relancer
    words=opts[0].replace(',','').replace('!','').replace('.','').replace('?','').split()
    pg.evaluate("w=>{window.__SAY=w; window.__STARTS=0;}", [words[0], ' '.join(words[1:])])
    pg.evaluate("localStorage.setItem('pv_nomic','0'); document.body.classList.remove('askmic')"); pg.click('#dMic'); time.sleep(.15)
    logs.append(f"{name} avant prêt: cls={pg.evaluate('dMic.className')} txt={pg.inner_text('#dHeard')!r}")
    time.sleep(.5); logs.append(f"{name} prêt: cls={pg.evaluate('dMic.className')} txt={pg.inner_text('#dHeard')!r}")
    time.sleep(3.5)
    logs.append(f"{name} starts={pg.evaluate('window.__STARTS')} phrases={pg.evaluate('window.__PHR')} me={pg.inner_text('#dMe')!r}")
    time.sleep(4)
    opts2=pg.evaluate("PVT.opts().map(o=>o.t)"); logs.append(f'{name} opts2={opts2}')
    if opts2:
        pg.evaluate("t=>{window.__SAY=[t]; window.__STARTS=0; window.__HANG=1;}", opts2[0]); pg.click('#dMic'); time.sleep(5)
        logs.append(f"{name} 2e échange (1er démarrage figé): starts={pg.evaluate('window.__STARTS')} figés={pg.evaluate('window.__FROZE')} me={pg.inner_text('#dMe')!r} cls={pg.evaluate('dMic.className')}")
    logs.append(f"{name} log: " + ' || '.join(pg.evaluate('PVMIC.slice(-12)')))
    ctx.close()
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True, args=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    run(b,'tel',{'width':390,'height':760},'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1')
    b.close()
print('\n'.join(logs))
