# Outils (hors jeu)

## voix/ : voix ElevenLabs
1. `node voix/extract.js` : liste toutes les répliques par langue et par personnage (lines.json, compte de caractères).
2. Une prise par personnage sur ElevenLabs : toutes ses répliques séparées par une ligne vide (eleven_v4 pour les habitants, eleven_flash_v2_5 pour les mots).
3. Transcription Scribe de chaque prise (gratuite) : donne l'heure de chaque mot.
4. `python3 voix/align.py <langue> <qui> <prise.mp3> <lignes.txt> <mots.json> ../audio` : coupe chaque réplique (coupures recalées sur les silences), normalise le volume, écrit audio/<langue>/<qui>-NN.mp3 et index.json (clé « qui|réplique »).
   `split.py` : ancienne méthode par silences seuls, à n'utiliser que pour de toutes petites prises.
Le jeu lit audio/<langue>/index.json ; une réplique sans fichier passe par la voix du navigateur.

## banc/ : banc d'essai (puppeteer + Chrome headless)
`run.js` : banc d'origine (npm i puppeteer-core three@0.128 dans son dossier). `mesure.js` : version qui lit les vrais compteurs du panneau ?debug et masque l'interface pour les captures. `vues.sh` : caméras types (A place, B Rosa, C boulangerie).
