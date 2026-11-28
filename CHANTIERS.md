# Chantiers (un seul à la fois)

Vue d'ensemble : tableau blanc « Carte de Chatterville » https://claude.ai/artifact/9FS4Z8vL2jR8aTfANnF1iB (à tenir à jour avec ce fichier).

Règle : on ne passe au chantier suivant que quand l'utilisateur a validé le précédent dans le jeu.
Chaque chantier : ce qu'on veut obtenir, comment on vérifie, son état. À mettre à jour à la fin de chaque séance.

| # | Chantier | Objectif | Vérification | État |
|---|----------|----------|--------------|------|
| 1 | Sensations | Caméra qui suit le joueur comme dans Animal Crossing, marche douce et lisible, joueur immobile pendant les dialogues | Vidéo de référence comparée à une capture du jeu ; essai sur téléphone | Caméra fixe et joueur immobile en dialogue en ligne le 28/11 : à valider sur téléphone |
| 2 | Place | Sol continu jusqu'aux boutiques, herbe chaleureuse, décors propres, bouts de rue vivants | Rendus sans écran (outils/tests/rue.py) + essai | Corrigée et en ligne le 28/11 : à valider. Boulangerie refaite (plus petite, meublée), herbe détaillée, chargement accéléré : à valider. Boulangerie Meshy en essai (`?meshy`) |
| 3 | Personnages | Règles Meshy (outils/meshy/REGLES.md), test de Rosa animée, puis 5 ou 6 personnages | Rosa testée dans le jeu, validée | Règles écrites. Rosa régénérée dans Meshy le 28/11 (basse définition 3 550 faces, découpée en parties) : GLB à envoyer pour le test |
| 4 | Histoire | Chapitre 1 cohérent, anglais juste | Relecture + test automatique chapitre1.py | Recherche faite (docs/recherche-apprentissage.md). Appliqué le 28/11 : test de niveau A1/A2/B1, choix toujours en anglais correct, « Sorry, could you say that again? », phrases clés réutilisées, cabine guidée, retrouver de mémoire. Révision du jour et français dosé faits ; corrections du testeur faites (voir docs/rapport-test-2026-11-28.md pour le reste). Reste : nom de la ville, 3 écarts avec le Doc, choix à une seule option, Maya peu motivée |
| 5 | Voix | Voix ElevenLabs du chapitre 1, une prise par personnage | Seulement quand 3 et 4 sont validés | En attente. À prévoir : cri « Oh no!! » du joueur au vol et bruit de fuite du voleur ; répliques nouvelles du 28/11 |
| 6 | Révision du jour, vocabulaire Cambridge, chapitre 2 | Voir la fiche de reprise | | Plus tard |
