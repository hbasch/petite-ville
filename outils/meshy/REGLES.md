# Personnages Meshy : règles pour qu'ils s'animent bien dans le jeu

Toujours tester **un seul** personnage dans le jeu avant d'en générer d'autres (principe de base, voir CLAUDE.md).

## 1. Règles communes (à mettre dans la demande Meshy)

- **Pose** : debout, de face, en « A » : bras écartés du corps d'environ 30 à 45°, mains ouvertes, doigts serrés (moufle), paumes vers les cuisses. Jambes légèrement écartées (un poing d'écart entre les pieds), pieds vers l'avant.
- **Proportions façon Animal Crossing** : grosse tête (environ 40 % de la hauteur), corps rond, jambes courtes permises **mais toujours séparées** : un vrai espace entre les deux jambes, de l'entrejambe au sol. Avec la méthode A (parties séparées), des jambes courtes marchent bien. Avec la méthode B (squelette Meshy), il faut des jambes sur au moins 25 % de la hauteur, sinon les genoux sont introuvables et les bottes s'écrasent (constaté sur Rosa le 28/11).
- **Vêtements** : pantalon, short ou jupe **au-dessus du genou**. Pas de robe longue, de tablier jusqu'aux chevilles ni de manteau long : ils soudent les jambes entre elles.
- **Rien ne relie deux parties qui bougent** : pas d'outils, de sac ou de poche qui pendent entre le bras et le corps ; cheveux qui ne touchent pas les épaules (chignon ou cheveux courts), pour que la tête puisse tourner.
- **Visage** : expression neutre, bouche fermée ou absente (le jeu ajoute la bouche qui parle).
- **Poids** : on peut générer en haute définition, on réduit nous-mêmes (gltf-transform) à 10 000 à 15 000 triangles au total, texture de 1 024 px au plus, export GLB. (Le LISEZ-MOI du 27/11 visait 5 000 : la fiche du 28/11, plus récente, retient 10 000 à 15 000, comme Rosa à 11 000.)
- **Réglages Meshy** : pose A activée, licence privée, export GLB. Pour la méthode A, activer l'option de découpe en parties (« Découper ») ; pour la méthode B, la laisser désactivée.

## 2. Méthode A (recommandée pour les petits personnages) : parties séparées

Le jeu les anime comme une marionnette, sans déformation : c'est robuste et proche d'Animal Crossing.

- 6 parties, en GLB, **chacune laissée exactement à sa place** (ne pas les recentrer ni les déplacer) : `head` (avec les cheveux), `body` (buste et bassin), `arm_l`, `arm_r`, `leg_l`, `leg_r`. Gauche et droite : du point de vue du personnage.
- Les jointures se recouvrent un peu (manche qui couvre l'épaule, short qui couvre le haut des cuisses), pour ne jamais voir de trou quand une partie tourne.
- Un seul fichier GLB avec 6 objets nommés comme ci-dessus, ou 6 fichiers `<nom>-head.glb`, etc.

## 3. Méthode B (personnages aux proportions plus « normales ») : squelette et animations Meshy

- Riguer en **humanoïde**, en plaçant soi-même les repères (menton, épaules, coudes, poignets, entrejambe, genoux, chevilles).
- Avant d'exporter, regarder la **marche** dans l'aperçu Meshy : les genoux plient, les pieds ne traversent pas le sol, rien ne s'étire.
- Exporter un GLB **avec les animations** : `idle` (attente), `walk` (marche), `wave` (salut), et si possible `talk` (gestes en parlant).

## 4. Dans le jeu

- Mettre le fichier dans `assets/`, puis ajouter une ligne dans `GLB_CHARS` (town.js), par exemple `maya: { url: 'assets/maya.glb?v=1', h: 1.4 }`.
- Le matériau doit avoir `noCut`, sinon le personnage devient transparent (c'est déjà fait dans le chargeur).
