# Chatterville : fiche de reprise (à jour au 28 novembre 2026, 20 h 15)

À lire au début de chaque conversation, avec `CLAUDE.md` (règles de travail) et `CHANTIERS.md` (le chantier en cours).
Claude est garant de cette fiche : il la met à jour à la fin de chaque séance, dans le dépôt **et** dans `Documents\Chatterville - reprise\FICHE-REPRISE.md`.
Règle : tout ce qui doit survivre va dans le dépôt GitHub ou dans les Docs, jamais seulement dans l'espace de travail d'une session.

Nom de code dans l'appli : « Petite Ville ». Nom recommandé : **Chatterville** (pas encore validé, à changer partout ensuite).

## Où est tout

- **Code (source de vérité)** : https://github.com/hbasch/petite-ville, branche `main`, publié par GitHub Pages sur https://hbasch.github.io/petite-ville/ (`?local` sans compte, `?debug` compteurs, `?test` expose `window.PVT`).
  - La copie dans `Documents\Chatterville - reprise\sources` est ancienne.
- **Vue d'ensemble (tableau blanc)** : « Carte de Chatterville » https://claude.ai/artifact/9FS4Z8vL2jR8aTfANnF1iB (chantiers, tableau de bord, histoire, personnages, décisions).
- **Histoire et missions** : Doc « Chatterville — les scènes des missions » https://claude.ai/artifact/TwXzEiacf8UC5SQWs4ogH6 (l'arc complet, les règles des missions, les niveaux).
- **Concept, décisions, modèle économique** : `Documents\Chatterville - reprise\LISEZ-MOI-REPRISE.md` (sections 5 et suivantes). Les anciens `claude/concept.md` et `claude/missions.md` n'existent plus (ils étaient dans l'espace d'une ancienne session).
- **Règles des personnages Meshy** : `outils/meshy/REGLES.md`.
- **Fichiers principaux** : `town.js` (ville, caméra, lumière), `scene.js` (boulangerie), `clay.js` (matière, horizon arrondi), `app.js` (interface, dialogues, micro), `data.js` (contenu, langues), `story.js` + `story-data.js` (chapitre 1), `assets/*.glb` (Meshy), `audio/` (voix), `outils/` (voix, tests).
- **Supabase** : projet `pafnoukayvgibwixqsgl`, clé publique dans `config.js`, confirmation des e-mails désactivée.

## Décisions en vigueur

- **Vue façon Animal Crossing** (troisième personne) ; la première personne est abandonnée (`?cam=fp` reste pour comparer).
- **Une seule ville, Chatterville**, place en rue courbe face à la caméra.
- **Personnages** : Gemini (image stylisée) puis Meshy. Méthode A (parties séparées, animées par le jeu) pour les petits personnages ronds ; méthode B (squelette Meshy) seulement pour des proportions plus classiques. Tester un personnage avant les autres.
- **Voix ElevenLabs** (offre payante à 5 €/mois) : Tom = Pete, Rosa = Anna, Leo = Sinclair, Maya = Piper Monroe, Sam = Kev, passants = Jenny, mots = John, joueur = Steven. Ce qui a été généré en offre gratuite ne peut pas servir commercialement : tout régénérer avant de vendre. Les voix se font **en dernier**, quand l'histoire est figée.
- **Modèle économique** : freemium, abonnement annuel autour de 10 €.

## État au 28 novembre (10 h 30)

- Chapitre 1 « Sans rien » jouable de bout en bout (test automatique `outils/tests/chapitre1.py`, sans erreur).
- Corrections de texte du 28/11 : « by the fountain », Pemberton « solicitor » en anglais, Tom « And you help me in the mornings », salutations neutres (« Hello there », « How do you do? »).
- Place corrigée par un agent et en ligne (sol jusqu'aux boutiques, herbe, chemin, arrêt de bus, parc). Restent : ombres trop dures, Pemberton dans les tables du café, une seule guirlande, château coupé.
- Écarts entre le Doc et le chapitre 1 à trancher : la fin (maison vue de près, Marmalade), Pemberton au pub ou au café, la cassette d'Arthur absente.
- Caméra façon Animal Crossing en ligne : angle et distance fixes, plus d'évitement des façades, suivi doux ; joueur immobile pendant les dialogues (`?camold` pour comparer). À valider.
- Pousser sur GitHub fonctionne depuis la session (dépôt rattaché le 28/11) ; si c'est refusé, le redemander explicitement.

- Après-midi du 28/11 : test de niveau A1/A2/B1 (niveau annoncé), choix toujours en anglais correct, « Sorry, could you say that again? », retrouver de mémoire, cabine guidée (voir `docs/recherche-apprentissage.md`) ; boulangerie : service à la 1re personne, enseigne sur la porte, lumière adoucie ; signes « ! » mission et « ? » mot ; Firefox prévenu avant son téléchargement de 140 Mo.
- Penser à recharger la page (Ctrl+F5) après une mise en ligne : GitHub Pages garde l'ancienne version jusqu'à 10 minutes.

- Fin d'après-midi du 28/11 (en autonomie, avec agents) : boulangerie refaite (plus petite, parquet, étagères, tables) ; herbe détaillée ; chargement plus rapide et écran « Chargement… » qui restait 20 s de trop corrigé ; révision du jour « Hier à Chatterville… » ; traduction affichée d'office en A0/A1 ; corrections du testeur (Échap, traductions de la version confirmée, test moins devinable…). Rapport du testeur : `docs/rapport-test-2026-11-28.md` (points restants à traiter).
- Boulangerie Meshy optimisée (323 Ko) visible avec `?meshy`. Avis de l'agent : jolie mais pas dans le style des autres bâtiments (plus beige, pierres, socle) ; à garder seulement si toute la rue passe à Meshy avec une palette pastel lisse.

- Soir du 28/11 : objets non touchables (`?objets` pour réactiver) ; ardoise avec le nom des produits ; on ne sort plus pendant le service ; Tom a une réplique courte après le travail et propose de rejouer le service ; herbe d'avant rétablie (`?herbe2` pour la détaillée) ; écran de chargement avec barre et astuces ; onglet « Histoires » retiré ; bouton « Entrer · Bakery » devant la porte (l'entrée était cassée par le filtre des objets) ; qualité réduite plus vite sur téléphone ; nouvelle Rosa Meshy (137 Ko) en ligne, qui marche avec ses jambes (squelette automatique étendu : jambes, bras opposés, buste qui respire ; bouche calée).
- Micro : la reconnaissance du navigateur ne marche pas sur Brave (coupée exprès), mal sur Safari, Firefox télécharge 140 Mo. **Décision : essayer la reconnaissance via ElevenLabs** (enregistrer la voix dans le navigateur, l'envoyer par une fonction Supabase qui garde la clé). Pas d'appli pour l'instant (les gens téléchargent moins).

## À trancher par l'utilisateur
- Le nom de la ville : l'histoire dit Chatterville, le mode libre dit « Petite Ville » et Rosa « Welcome to Edinburgh! » (les demandes du jour parlent du château et du chien d'Édimbourg).
- Les 3 écarts avec le Doc : la fin (maison vue de près, Marmalade), Pemberton au pub ou au café, la cassette d'Arthur.
- Garder ou non la boulangerie Meshy (`?meshy`), et la suite pour les bâtiments.
- Proposition du testeur pour la fin : Pemberton révèle que les clés de la maison étaient dans la valise (relance le chapitre 2).

## Prochaines étapes

Voir `CHANTIERS.md` : 1. sensations (caméra, marche, joueur fixe en dialogue), 2. place, 3. personnages Meshy, 4. histoire, 5. voix.

## Leçons apprises

- Ne jamais appliquer l'horizon arrondi aux sprites ni aux points (Windows Direct3D : écran beige).
- En test sans écran, le jeu tourne à environ 5 images/s : attentes longues.
- Décor fusionné : les objets « à mot » gardent `userData.box` pour l'étiquette de proximité.
- Regarder une vidéo : en extraire une planche d'images (ffmpeg), environ 1 500 tokens par planche.

## Façon de travailler

- Répondre en français. Un chantier par conversation.
- Économiser les tokens : peu de captures, vérifications par le code et par rendus sans écran.
- Pousser souvent, par petites étapes ; l'utilisateur teste en ligne (iPhone pas toujours disponible).
- Valider l'angle avant toute dépense (crédits, longues générations).
- Ne rien publier sur les réseaux sociaux sans accord.
