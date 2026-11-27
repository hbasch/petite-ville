# Tests automatiques (Playwright + Chrome headless)

Ils servent le dépôt sur http://pv.test/ en interceptant les requêtes : rien n'est mis en ligne.

Préparation (une fois) :
- `pip install playwright` et Chrome dans /usr/bin/google-chrome (ou `playwright install chromium`).
- three.js r128 en local : `mkdir -p /tmp/review/three && cd /tmp/review/three && npm pack three@0.128.0 && tar xzf three-0.128.0.tgz` (le test lit `/tmp/review/three/package`).
- Dans chaque script, `ROOT` = le dossier du dépôt.

Scripts :
- `dialogue_micro.py` : dialogue avec Rosa sur téléphone et ordinateur, micro simulé (relance, module figé).
- `chapitre1.py` : joue tout le chapitre 1 en version débutant et prend des captures (`/tmp/t2/st_*.png`). Il lit les réglages de `dialogue_micro.py` : le copier dans /tmp/t2/dlg.py, ou adapter le chemin.
- `rue.py` : captures de la rue de jour (centre, arrêt de bus, barrière du parc).
- `node comparaison.js ../../app.js` et `node comparaison_naturelles.js ../../app.js` : bancs de la comparaison des phrases dites (micro).

Attention : en headless, le jeu tourne à environ 5 images par seconde, donc le temps du jeu passe environ 4 fois plus lentement. Les attentes des scripts en tiennent compte.
