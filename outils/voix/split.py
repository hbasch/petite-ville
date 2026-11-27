#!/usr/bin/env python3
"""Découpe une prise ElevenLabs (toutes les répliques d'un personnage, séparées par une ligne vide)
en un fichier par réplique, et complète audio/<langue>/index.json.

usage : split.py <langue> <qui> <prise.mp3> <lignes.txt> <dossier audio du dépôt>
Les répliques sont repérées par les silences : on choisit, parmi tous les silences, les N-1 coupures
qui donnent des durées les plus proches de celles attendues (proportionnelles au nombre de lettres),
en préférant les silences longs (ceux des lignes vides)."""
import json, math, os, re, subprocess, sys
import numpy as np

L, WHO, SRC, LINES, OUT = sys.argv[1:6]
SR = 16000
lines = [l for l in open(LINES, encoding='utf8').read().split('\n\n') if l.strip()]
N = len(lines)

def pcm(path):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768

x = pcm(SRC)
hop = SR // 100  # 10 ms
fr = np.sqrt(np.convolve(x * x, np.ones(hop * 2) / (hop * 2), mode='same')[::hop] + 1e-12)
db = 20 * np.log10(fr)
thr = max(np.percentile(db, 5) + 12, np.percentile(db, 95) - 40)
quiet = db < thr
# silences : suites de trames calmes d'au moins 120 ms
sil = []
i = 0
while i < len(quiet):
    if quiet[i]:
        j = i
        while j < len(quiet) and quiet[j]: j += 1
        if (j - i) >= 12: sil.append((i, j))
        i = j
    else: i += 1
start = sil[0][1] if sil and sil[0][0] == 0 else 0
end = sil[-1][0] if sil and sil[-1][1] >= len(quiet) - 1 else len(quiet)
cands = [(a, b) for a, b in sil if a > start and b < end]

def weight(t):
    t = re.sub(r'\[[^\]]*\]', '', t)
    return len(t) + 6 * len(re.findall(r'[.!?…]\s+\S', t))
w = np.array([weight(t) for t in lines], dtype=float)

# DP sur les coupures : état = (réplique k terminée au silence c)
C = len(cands)
pos_end = [c[0] for c in cands]   # fin de parole avant le silence
pos_beg = [c[1] for c in cands]   # reprise après le silence
silen = [(b - a) / 100 for a, b in cands]

def speech(a, b):  # durée de parole entre deux bornes (s), sans les silences internes
    seg = quiet[a:b]
    return max(.05, (len(seg) - seg.sum()) / 100)

total = speech(start, end)
rate = total / w.sum()
MU = 2.5
INF = 1e18
best = np.full((N, C + 1), INF); back = np.zeros((N, C + 1), dtype=int)
# colonne C = fin de fichier
begs = [start] + pos_beg
for k in range(N):
    for c in range(C + 1):
        if k == N - 1 and c != C: continue
        if k < N - 1 and c == C: continue
        e = end if c == C else pos_end[c]
        gain = 0 if c == C else -MU * min(silen[c], 1.2)
        if k == 0:
            d = speech(start, e)
            best[k, c] = math.log(d / (rate * w[k])) ** 2 + gain
            continue
        for p in range(c if c < C else C):
            if best[k - 1, p] >= INF: continue
            d = speech(pos_beg[p], e)
            v = best[k - 1, p] + math.log(d / (rate * w[k])) ** 2 + gain
            if v < best[k, c]: best[k, c] = v; back[k, c] = p
cuts = []
c = C
for k in range(N - 1, 0, -1):
    c = back[k, c]; cuts.append(c)
cuts.reverse()
bounds = []
b0 = start
for k in range(N):
    if k < N - 1:
        cc = cuts[k]; e = pos_end[cc]; nb = pos_beg[cc]
    else: e = end; nb = None
    bounds.append((b0, e))
    b0 = nb

# gain commun pour une voix à -18 LUFS environ (mesure ebur128 sur toute la prise)
m = subprocess.run(['ffmpeg', '-hide_banner', '-i', SRC, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
lufs = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', m)[-1])
gain = -18 - lufs

os.makedirs(os.path.join(OUT, L), exist_ok=True)
idx_path = os.path.join(OUT, L, 'index.json')
idx = json.load(open(idx_path, encoding='utf8')) if os.path.exists(idx_path) else {}
idx = {k: v for k, v in idx.items() if not k.startswith(WHO + '|')}
report = []
for k, ((a, b), t) in enumerate(zip(bounds, lines)):
    t0 = max(0, a / 100 - .06); t1 = b / 100 + .12
    name = f'{WHO}-{k + 1:02d}.mp3'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', f'{t0:.3f}', '-to', f'{t1:.3f}', '-i', SRC,
                    '-af', f'volume={gain:.2f}dB,afade=t=in:d=0.02,areverse,afade=t=in:d=0.06,areverse',
                    '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '64k', os.path.join(OUT, L, name)], check=True)
    clean = re.sub(r'\[[^\]]*\]\s*', '', t).strip()
    idx[WHO + '|' + clean] = name
    report.append(f'{k + 1:02d} {t1 - t0:5.2f}s (att. {rate * w[k]:4.1f}) {clean[:60]}')
json.dump(dict(sorted(idx.items())), open(idx_path, 'w', encoding='utf8'), ensure_ascii=False, indent=0)
top = sorted(range(C), key=lambda i: -silen[i])[:N - 1]
odd = [k + 1 for k, cc in enumerate(cuts) if cc not in top]
shortest_cut = min(silen[cc] for cc in cuts) if cuts else 0
longest_skip = max([silen[i] for i in range(C) if i not in cuts] or [0])
print(f'{WHO}: {N} répliques, {len(cands)} silences, gain {gain:+.1f} dB, coupure la plus courte {shortest_cut:.2f}s, silence interne le plus long {longest_skip:.2f}s, coupures hors top: {odd}')
print('\n'.join(report))
