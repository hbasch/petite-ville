# Petite Ville (prototype)

Apprendre l'anglais en explorant une petite ville en 3D.

- `index.html` + `app.js` : l'app (compte Supabase, interface FR/PL, anglais ou polonais, on parle au boulanger au micro, XP, série, cartes à répétition espacée)
- `data.js` : tout le contenu (mots, dialogues, textes d'interface)
- `prototype-v1.html` : premier prototype
- `rue/` : test Gaussian splat d'une vraie rue de Londres avec étiquettes de vocabulaire

Scan « Artillery Passage » : David Fletcher (https://superspl.at/user/artfletch), licence CC BY 4.0.
Rendu splat : PlayCanvas.

## Ajouter une langue

La ville est la même pour toutes les langues (pictogrammes, prix en euros, Tom le boulanger).
Pour ajouter une langue apprise (ex. `es`) :
1. `data.js` → ajouter la clé `es` à chaque mot de `PV.WORDS` (mot + phrase d'exemple).
2. `data.js` → ajouter `PV.DLG.es` (dialogue du boulanger) et `PV.STORIES.es`.
3. `data.js` → ajouter `es: { ..., voice: 'es-ES' }` dans `PV.SCENE`.
4. Faire relire par une personne de langue maternelle.

Palettes de couleurs : `?palette=a|b|c|d` dans l'adresse, ou le choix dans le mode photo.

## Tester sur téléphone

- Ouvrir https://hbasch.github.io/petite-ville/?debug : un panneau vert affiche images/s, résolution,
  appels de dessin et qualité ; les erreurs JavaScript s'affichent en rouge (toucher pour fermer).
- Android branché en USB : `chrome://inspect` dans Chrome sur le PC pour voir la console du téléphone.
- Sans téléphone : outils de développement de Chrome (F12 puis Ctrl+Maj+M), choisir un modèle de téléphone ;
  Maj + glisser simule le pincement. Les performances ne sont pas représentatives.
