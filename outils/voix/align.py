#!/usr/bin/env python3
"""Découpe une prise en répliques : la transcription horodatée (Scribe) dit à peu près où finit chaque
réplique, puis on recale chaque coupure sur le vrai creux de silence le plus proche dans le son.

usage : align.py <langue> <qui> <prise.mp3> <lignes.txt> <mots.json> <dossier audio du dépôt>"""
import difflib, json, os, re, subprocess, sys
import numpy as np

L, WHO, SRC, LINES, WORDS, OUT = sys.argv[1:7]
SR = 16000
lines = [l for l in open(LINES, encoding='utf8').read().split('\n\n') if l.strip()]
raw = json.load(open(WORDS, encoding='utf8'))
norm = lambda w: re.sub(r"[^\w']", '', w.lower().replace('’', "'"))
heard = [(norm(w['text']), float(w['start']), float(w['end'])) for w in raw if w.get('type', 'word') == 'word' and norm(w['text'])]
exp, owner = [], []
for k, l in enumerate(lines):
    for w in re.sub(r'\[[^\]]*\]', '', l).split():
        if norm(w): exp.append(norm(w)); owner.append(k)
sm = difflib.SequenceMatcher(a=exp, b=[h[0] for h in heard], autojunk=False)
first, last = {}, {}
for a, b, n in sm.get_matching_blocks():
    for i in range(n):
        k = owner[a + i]; _, s, e = heard[b + i]
        first.setdefault(k, s); last[k] = max(last.get(k, 0), e)
ok = [k for k in range(len(lines)) if k in first]
if len(ok) < len(lines): print('répliques non retrouvées :', [k + 1 for k in range(len(lines)) if k not in first])

# énergie par trames de 10 ms
pcm = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', SRC, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True).stdout
x = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768
hop = SR // 100
db = 20 * np.log10(np.sqrt(np.convolve(x * x, np.ones(hop * 3) / (hop * 3), mode='same')[::hop] + 1e-12))
floor, loud = np.percentile(db, 5), np.percentile(db, 95)
quiet = db < max(floor + 12, loud - 40)
dur = len(x) / SR

def snap(t, lo, hi):
    """meilleur point de coupure près de t : milieu du silence le plus proche, sinon trame la plus calme"""
    a, b = max(int(lo * 100), 0), min(int(hi * 100), len(db) - 1)
    best, bs = None, 1e9
    i = a
    while i <= b:
        if quiet[i]:
            j = i
            while j <= b and quiet[j]: j += 1
            c = (i + j) / 200; score = abs(c - t) - min((j - i) / 100, .5) * .8
            if score < bs: bs, best = score, c
            i = j
        else: i += 1
    if best is None: best = (a + int(np.argmin(db[a:b + 1]))) / 100
    return best

def place(off, win):
    cs, sh = [], []
    for j in range(len(ok) - 1):
        e, s = last[ok[j]], first[ok[j + 1]]
        t = (e + s) / 2 + off
        c = snap(t, max(t - win, first[ok[j]] + .2 + off), min(t + win, last[ok[j + 1]] - .2 + off))
        cs.append(c); sh.append(c - t)
    return cs, sh
# 1er passage large pour mesurer le décalage moyen des horodatages, 2e passage serré une fois corrigé
_, sh0 = place(0, .6)
off = float(np.median(sh0)) if sh0 else 0
cuts, shifts = place(off, .3)
bounds = [0] + cuts + [dur]

def trim(t0, t1):
    """resserre sur la parole en gardant un peu d'air"""
    a, b = int(t0 * 100), min(int(t1 * 100), len(db))
    loudf = np.where(~quiet[a:b])[0]
    if not len(loudf): return t0, t1
    return max(t0, (a + loudf[0]) / 100 - .07), min(t1, (a + loudf[-1]) / 100 + .16)

m = subprocess.run(['ffmpeg', '-hide_banner', '-i', SRC, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
gain = -18 - float(re.findall(r'I:\s+(-?[\d.]+) LUFS', m)[-1])
os.makedirs(os.path.join(OUT, L), exist_ok=True)
idx_path = os.path.join(OUT, L, 'index.json')
idx = json.load(open(idx_path, encoding='utf8')) if os.path.exists(idx_path) else {}
idx = {k: v for k, v in idx.items() if not k.startswith(WHO + '|')}
for j, k in enumerate(ok):
    t0, t1 = trim(bounds[j], bounds[j + 1])
    name = f'{WHO}-{k + 1:02d}.mp3'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', f'{t0:.3f}', '-to', f'{t1:.3f}', '-i', SRC,
                    '-af', f'volume={gain:.2f}dB,afade=t=in:d=0.015,areverse,afade=t=in:d=0.06,areverse',
                    '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '64k', os.path.join(OUT, L, name)], check=True)
    idx[WHO + '|' + re.sub(r'\[[^\]]*\]\s*', '', lines[k]).strip()] = name
lvl = [float(db[int(c * 100)] - loud) for c in cuts]
drop = set()
for j, v in enumerate(lvl):
    if v > -20: drop |= {ok[j], ok[j + 1]}
    if v > -30: print(f'  coupure bruyante {v:.0f} dB entre {ok[j]+1} et {ok[j+1]+1} : « {lines[ok[j]][-30:]} » | « {lines[ok[j+1]][:30]} » (recalage {shifts[j]:+.2f})')
print(f'{WHO}: {len(ok)}/{len(lines)} répliques, horodatage corrigé de {off:+.2f}s, reste {np.mean(shifts) if shifts else 0:+.2f}s ± {np.std(shifts) if shifts else 0:.2f} (min {min(shifts) if shifts else 0:+.2f} max {max(shifts) if shifts else 0:+.2f}), '
      f'coupure la plus bruyante {max(lvl) if lvl else 0:.0f} dB sous la voix, gain {gain:+.1f} dB')
for k in drop: idx.pop(WHO + '|' + re.sub(r'\[[^\]]*\]\s*', '', lines[k]).strip(), None)
if drop: print('  écartées (voix du navigateur) :', sorted(k + 1 for k in drop))
json.dump(dict(sorted(idx.items())), open(idx_path, 'w', encoding='utf8'), ensure_ascii=False, indent=0)
