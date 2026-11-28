# Chatterville : rapport de test, chapitre 1 et mode sans histoire (28/11)

Comment j'ai testé : chapitre 1 joué en entier deux fois sur un écran de téléphone 390×760 (débutant, puis petit test réussi en version confirmée B1), le test de niveau en échec au palier A2, le mode sans histoire (tous les habitants), la touche Échap sur ordinateur, et la mise en page des dialogues les plus longs en 390×760 et 375×667. J'ai aussi relu `story-data.js`, `story.js`, `data.js` et la partie dialogue de `app.js`.
Ce qui marche : aucune erreur dans la console, le chapitre se termine dans les deux versions, aucun texte coupé ni débordant sur les deux tailles d'écran, et le test de niveau est court (6 questions au plus, arrêt après le premier palier raté).
Journaux et captures dans /tmp/t8 : `play_deb.log`, `play_test.log`, `free.log`, `niv_failA2.log`, `esc.py`, `planche_*.jpg`.

---

## A. Bloquant

**1. Touche Échap pendant une scène de l'histoire : le joueur reste bloqué** (ordinateur)
- Où : `app.js` l. 597 (`keydown Escape → show(null)`).
- Quoi : vérifié (`esc.py`). On appuie sur Échap pendant la question du voleur : le dialogue se ferme, mais `finishNpc` n'est jamais appelé. L'histoire attend donc la fin du dialogue (`busy=true`) et le joueur reste figé (`T.lock(true)`) : les flèches et les clics sur le sol ne font plus rien. Seul un rechargement de la page débloque. Même chose avec Tom, et pendant le travail à la boulangerie.
- Correction : `if (e.key === 'Escape' && !document.body.classList.contains('storyDlg')) show(null);` (le bouton × est déjà masqué en mode histoire, Échap doit suivre la même règle).

**2. Trois noms pour la même ville : Chatterville, Petite Ville et Edinburgh**
- Où : `data.js` `PV.CITY_NAME = { gb: 'Edinburgh' … }` et `townIntroTitle` ; `index.html` (titre, logo) ; `app.js` l. 484 (`shopName`) ; `town.js` l. 1546 et 1584 (carte postale « Greetings from Edinburgh »).
- Quoi : l'histoire dit « Chatterville ». L'écran d'accueil du mode libre dit « Bienvenue sur la place de Petite Ville ». Rosa dit « Welcome to Edinburgh! » (relevé dans `free.log`) et les suivis demandent « Do you like Edinburgh? ». Les demandes du jour parlent du « castle on the rock », de la statue du chien fidèle (Greyfriars Bobby) et des licornes, donc de l'Écosse, alors qu'Arthur est « un Anglais » et que le test parle d'« English bread ».
- Pourquoi : pour un débutant, c'est la plus grosse incohérence. Elle tombe dès le premier dialogue du mode libre.
- Correction : `PV.CITY_NAME.gb = 'Chatterville'`. Remplacer « Petite Ville » par « Chatterville » dans `townIntroTitle`, `index.html`, `shopName` et la carte postale. Pour les quêtes `castle` et `statue`, deux solutions : les retirer, ou les réécrire pour la ville, par exemple Sam : « Look up! Can you see the old castle on the hill? » (le château existe dans le décor).

## B. Important

### Objectifs flous et histoire

**3. Le « ! » doré de la demande du jour s'affiche pendant l'histoire**
- Où : `app.js` `refreshMarkers` et `announceQuest`.
- Quoi : vérifié. Dès la carte de départ du chapitre 1, Sam porte le même « ! » doré que les personnages de l'histoire. Si on le touche, il parle du château (« Can you see the castle on the rock? »), sans rapport avec la valise.
- Pourquoi : on a deux missions en même temps et rien ne dit laquelle est la vraie.
- Correction : dans `refreshMarkers` et `announceQuest`, ignorer la demande du jour tant que `PVStory.active()` est vrai.

**4. Pendant le chapitre, les autres habitants tiennent les répliques du mode libre**
- Où : `data.js` `PV.NPCS` (repli quand `PVStory.npc` renvoie false).
- Quoi : juste après le vol, Agent Jones dit « Good afternoon. All quiet today. ». Mr Okafor dit « Hello again! » alors qu'on ne l'a jamais vu. Maya demande où est la poste, alors que dans l'histoire c'est une habitante qui sait tout. Rosa rejoue sa présentation à chaque fois.
- Correction : en mode histoire, une réplique neutre par habitant (`dlgStory`). Exemples :
  - Jones (avant l'étape errands) : « Hello there. Are you all right? » / « Bonjour. Tout va bien ? »
  - Okafor : « Hello! Are you new in town? » / « Bonjour ! Vous êtes nouveau en ville ? »
  - Dans le mode libre aussi, Okafor : « Hello! Are you feeling well today? » (supprimer « again »).

**5. Avec le petit test, Tom se présente deux fois et pose les questions dans un ordre étrange**
- Où : `story.js` `afterApproach`.
- Quoi : test → « Hello! I'm Tom. What's your name? » … « Right. Come with me. » → carte du niveau → « Oh dear, are you all right? I'm Tom — I run the bakery… ». On vient de se faire voler, et Tom demande le prénom avant de demander si ça va.
- Correction :
  - Début du test : « Oh no! Are you OK? I'm Tom, the baker. What's your name? »
  - Après la carte du niveau, faire démarrer `tomHelp` directement au nœud `j2` (copie du dialogue avec `nodes.start = nodes.j2`).

**6. Avec le petit test, le voleur parle déjà en version confirmée**
- Où : `story.js` `begin('conf', true)`.
- Quoi : un vrai débutant qui a coché « Je parle déjà un peu » entend « Sorry to bother you, mate. Have you got the time? », sans traduction affichée.
- Correction : `begin(withTest ? 'deb' : reg, withTest)`. Le registre est de toute façon fixé après le test (`set('reg', r)`).

**7. La carte du niveau promet « Ton niveau se corrigera tout seul en jouant », mais rien ne le fait**
- Où : `story-data.js` `level.note`.
- Quoi : aucun code ne change `reg` ou `cefr` après le test, et aucun réglage ne permet de passer de débutant à confirmé. Un joueur mal classé reste bloqué dans sa version, sauf à tout recommencer.
- Correction minimale : `note: 'Tu pourras changer de version dans le menu « ? ».'`, plus deux boutons dans l'aide : « Version débutant » et « Version confirmée » (`L.story.reg`).
- Pour B1, remplacer « Tu pourras couper l'aide en français » par « L'aide en français est cachée : touche FR si besoin. » (elle est déjà cachée d'office).

**8. En version confirmée, la traduction française de la réplique est fausse**
- Où : `story.js` `prep()`. Les nœuds prennent toujours `v[1]`, la traduction de la version débutant, et les réponses des personnages prennent `reply[1]`.
- Quoi (relevé dans `play_test.log`) :
  - « Operator speaking. How can I help? » → « Vous voulez appeler la France ? »
  - « Hello there. Is everything all right? » → « Qu'est-ce qui s'est passé ? »
  - « In exchange, you give me a hand in the shop. Deal? » → « Et tu m'aides le matin. »
- Pourquoi : un joueur A2 qui touche FR pour vérifier lit un autre sens.
- Correction : ajouter `v[4] = { fr }` pour la version confirmée et `reply[3]`, puis les lire dans `prep()`. Traductions à poser :

| Personnage | Réplique (version confirmée) | Traduction à poser |
|---|---|---|
| Voleur | Sorry to bother you, mate. Have you got the time? | Désolé de te déranger. Tu as l'heure ? |
| Tom (start) | Oh dear, are you all right? I'm Tom — I run the bakery over there. | Oh là là, ça va ? Je suis Tom, je tiens la boulangerie, là-bas. |
| Tom (j2) | You've got nothing at all? Right — you can stay in the little room above my bakery. | Tu n'as plus rien du tout ? Bon : tu peux loger dans la petite chambre au-dessus de ma boulangerie. |
| Tom (j3) | In exchange, you give me a hand in the shop. Deal? | En échange, tu me donnes un coup de main à la boutique. Marché conclu ? |
| Tom (réponse) | Right now! Come on, the bakery is just there. | Tout de suite ! Allez, la boulangerie est juste là. |
| Tom (shop) | Right, you're on the till. Prices are on the board — take your time. | Bon, tu tiens la caisse. Les prix sont sur l'ardoise, prends ton temps. |
| Tom (réponse) | Here comes your first customer! | Voilà ton premier client ! |
| Jack | Hiya! Can I have a croissant, please? | Salut ! Je peux avoir un croissant, s'il vous plaît ? |
| Mrs Patel | Morning, dear. The usual, please: two seeded loaves. No white bread, mind! | Bonjour, mon petit. Comme d'habitude : deux pains aux graines. Et surtout pas de pain blanc ! |
| Tom (pay) | Brilliant, you're a natural! Here's a fiver for this morning. | Génial, tu es doué ! Voilà un billet de cinq livres pour ce matin. |
| Tom (réponse) | Now go and report that theft. And get yourself a toothbrush! | Maintenant, va déclarer ce vol. Et achète-toi une brosse à dents ! |
| Okafor | Hello there! What can I get you? | Bonjour ! Qu'est-ce qu'il vous faut ? |
| Jones (start) | Hello there. Is everything all right? | Bonjour. Tout va bien ? |
| Jones (j2) | I see. Can you describe it? What colour is it? | Je vois. Vous pouvez la décrire ? De quelle couleur est-elle ? |
| Jones (j4) | Right. And your name, please? | Bien. Et votre nom, s'il vous plaît ? |
| Jones (j6) | Your crime number is two-four-seven. Don't lose it! | Votre numéro de plainte est le 247. Ne le perdez pas ! |
| Opératrice (start) | Operator speaking. How can I help? | Ici l'opératrice. Que puis-je pour vous ? |
| Opératrice (o3) | Hold the line, please. | Ne quittez pas. |
| Maya (start) | Hi! You must be Arthur's grandchild. The whole town's talking about you! | Salut ! Tu dois être le petit-enfant d'Arthur. Toute la ville parle de toi ! |
| Maya (m2) | Mr Pemberton told the whole café yesterday. Look, I took a photo! | Mr Pemberton l'a raconté à tout le café hier. Regarde, j'ai pris une photo ! |
| Maya (réponse) | He's chatting to some lad in a yellow raincoat. | Il discute avec un jeune en ciré jaune. |
| Pemberton (start) | How do you do? You must be Arthur's grandchild. Pemberton, the family solicitor. Dreadful business, your suitcase. | Enchanté. Vous devez être le petit-enfant d'Arthur. Pemberton, le notaire de la famille. Quelle triste affaire, votre valise. |
| Pemberton (p2) | Me? Certainly not! I never discuss my clients. | Moi ? Certainement pas ! Je ne parle jamais de mes clients. |
| Pemberton (p3) | Ah. Well… I may have mentioned it at the café. There was a young man in a yellow raincoat, hanging on every word. | Ah. Eh bien… J'en ai peut-être parlé au café. Il y avait un jeune homme en ciré jaune, suspendu à mes lèvres. |
| Pemberton (réponse) | Good heavens… I'm terribly sorry. | Grands dieux… Je suis vraiment navré. |

**9. Il est midi, le matin et l'après-midi en même temps**
- Quoi : la barre du haut affiche l'heure réelle (15:15 pendant le test). Pourtant :
  - le voleur se voit répondre « it's twelve o'clock? » ;
  - Mrs Patel dit « Morning, dear » ;
  - Tom paie « for this morning » ;
  - Jones et Leo disent « Good afternoon » ;
  - au mode libre, Tom dit « Fresh bread this morning! » et la boulangerie répond « It's nine in the morning! ».
- Correction :
  - Voleur, réponse 2 : « Um… there's a clock on the town hall! » / « Euh… il y a une horloge sur la mairie ! »
  - Mrs Patel : « Hello, dear. »
  - Tom (version confirmée) : « Here's a fiver for today. »
  - Boulangerie : « Ha ha! Good night? We're open, it's daytime! »
  - Tom, Jones et Leo : salutations neutres (« Hello! »), ou bien calées sur l'heure réelle.

**10. La cabine rouge n'a aucun repère, et la consigne de la boulangerie renvoie à une étiquette introuvable**
- Où : `story-data.js` `obj.work` et `obj.phone` ; `app.js` `refreshMarkers` (`shopMarks`).
- Quoi : la consigne dit « touche l'étiquette « bakery » ». Or, tant que le mot n'est pas découvert, l'étiquette de proximité affiche « ? », pas « bakery ». Pour la cabine, aucun « ! » ne s'affiche (seule la boulangerie en reçoit un), et l'étiquette n'apparaît qu'en s'arrêtant à moins de 1,2 m.
- Correction :
  - `if (s.step === 'phone') ids.push('phonebox')`.
  - `obj.work` : « Va travailler chez Tom : touche le « ! » au-dessus de la boulangerie. »
  - `obj.phone` : « Appelle ta mère depuis la cabine rouge, près de la poste (touche le « ! »). »

**11. Rien n'explique pourquoi il faut aller voir Maya**
- Où : `obj.clue`.
- Quoi : « Qui savait que tu arrivais aujourd'hui ? Parle à Maya. » Personne ne nous a parlé de Maya.
- Correction :
  - Ajouter au monologue de maman : « … Demande autour de toi qui savait que tu arrivais aujourd'hui. »
  - `obj.clue` : « Maya, l'étudiante, sait tout ce qui se passe en ville : va lui parler (le « ! »). »

### Apprentissage

**12. Trop de bonnes réponses se devinent : choix uniques et leurres absurdes**
- Quoi : sur 26 choix de la version débutant, 12 n'ont qu'une seule option : Tom b et c, shop, pay, Jack b, opératrice b et c, Maya a et b, Pemberton c, Jones d. Quatre autres ont un leurre absurde qu'on écarte sans comprendre : Okafor « A croissant, please. » et « How old is it? », Jones « I'm hungry. ». La recherche est claire (Little & Bjork) : un leurre qu'on écarte facilement n'apprend rien. Au plus une option drôle par scène.
- Corrections exactes :
  - **Okafor (a)**, remplacer « A croissant, please. » par « Toothpaste, please. » / « Du dentifrice, s'il vous plaît. ». Réplique d'Okafor : « Toothpaste? Sorry, I've got none today. Anything else? » / « Du dentifrice ? Désolé, je n'en ai plus. Autre chose ? ». Astuce : « Tu cherches une brosse à dents : « a toothbrush ». Le dentifrice, c'est « toothpaste ». »
  - **Okafor (p)**, remplacer « How old is it? » par « What colour is it? » / « Elle est de quelle couleur ? ». Réplique : « It's blue! Anything else? » / « Elle est bleue ! Autre chose ? ». Astuce : « Pour le prix : « How much is it? » ». Bonus : on reprend la question de Jones.
  - **Jones (a)**, remplacer « I'm hungry. » par « I lost my suitcase. » / « J'ai perdu ma valise. ». Réplique : « You lost it? Or did a man take it? » / « Perdue ? Ou un homme l'a prise ? ».
  - **Maya (b)**, ajouter une deuxième bonne réponse qui mène aussi à la photo : « Who was with him? » / « Qui était avec lui ? ».
  - **Opératrice (a)** : voir le point 17.

**13. Mode « retrouver de mémoire » : la bonne réponse est celle qui s'affiche en français**
- Où : `app.js` `render()` (`hide` calculé option par option).
- Quoi : `L.recall` ne compte que les options sans astuce. Au bout de 3 réussites, la bonne réponse passe donc en français pendant que les leurres (avec astuce) restent en anglais. Il suffit de toucher deux fois l'option en français : on ne retrouve plus rien de mémoire.
- Correction : décider par nœud. Si une option principale passe en mode mémoire, toutes les options principales passent en français, leurres compris, avec leur `tr`.

**14. La révision du jour peut apprendre une mauvaise réponse comme bonne**
- Où : `app.js` `revLog`.
- Quoi : une réponse sans astuce est enregistrée comme « la bonne ». Or les mauvaises réponses du test de niveau n'ont pas d'astuce (`pl: 0`). Exemple : à « What happened? », le joueur répond « I took his suitcase. » ; le lendemain, la révision attend « I took his suitcase. ». Même chose pour « OK, sorry. » face à Pemberton.
- Il y a aussi un problème de leurres : ceux de la révision sont tirés au hasard dans d'autres scènes (« It's red. » pour « What's your name? »), donc évidents à écarter.
- Correction :
  - Dans `revLog`, ignorer les options avec `o.pl === 0`, ainsi que toutes les options du test.
  - Prendre les leurres de la révision dans le même personnage et parmi des phrases du même type (question ou affirmation).

**15. Le test de niveau se réussit en partie sans comprendre**
- Où : `story-data.js` `test`.
- Q1 : la bonne réponse est la seule qui contient le prénom du joueur (« My name is Alex. »).
  - Correction : ne pas la compter (échauffement) et ajouter une vraie question d'écoute A1, comme la recherche le propose. Tom, audio seulement : « Come with me. My bakery is just there. » Choix (exception assumée au tout-anglais, puisque c'est la compréhension qu'on mesure) : « Viens avec moi, ma boulangerie est juste là. » / « Attends-moi ici, je reviens. » / « Va voir la police, là-bas. »
- Q5 (écoute) : la question dit « going to » et la bonne réponse aussi ; les deux leurres sont impossibles dans l'histoire, puisque le vol vient d'avoir lieu.
  - Correction : « If the police don't find him, what will you do? » → « I'll look for him myself. » (juste) / « I looked for him myself. » / « I'd have looked for him myself. » Même longueur ; seul le sens du temps les sépare.
- Q6 : la bonne réponse est la plus longue et la seule plausible ; le leurre « No, I'd rather they didn't… » est d'un niveau B2, donc plus dur que la cible.
  - Correction : « I hope so, but I'm not sure they'll find him. » (juste) / « Yes, they were really helpful when I lost my bag. » / « Yes, they found it for me an hour ago. »

**16. Les phrases clés de la recherche ne reviennent presque pas**
- Quoi : en version débutant, « Can I have…? » n'apparaît jamais, « Where is…? » jamais, et « How much is it? » une seule fois en production.
- Corrections :
  - Jack (débutant) : « Hello! Can I have a croissant, please? » / « Bonjour ! Je peux avoir un croissant, s'il te plaît ? »
  - Okafor (a, débutant) : « Can I have a toothbrush, please? » / « Je peux avoir une brosse à dents, s'il vous plaît ? ». Le même cadre est ainsi entendu puis dit.
  - Tom, nœud pay : ajouter l'option « OK! Where is the pharmacy? » / « D'accord ! Où est la pharmacie ? », avec la réponse « It's next to the town hall. Bye! » / « Elle est à côté de la mairie. Salut ! » (c'est exact dans le décor).
  - Jones (a, débutant) : « A man took my suitcase! », mot pour mot comme chez Tom (supprimer « Excuse me », inutile quand on vient de vous adresser la parole). Version confirmée : « Someone's stolen my suitcase, by the fountain. »

**17. Phrases trop difficiles ou peu naturelles dans la version débutant**
- Pemberton (a), « Did you tell people I was coming? » : discours rapporté au passé continu, niveau B1.
  - Remplacer par « Did you talk about me at the café? » / « Vous avez parlé de moi au café ? ». La phrase reprend « talk about » entendu chez Maya, et sa réponse « I never talk about my clients ».
- Pemberton (p3), « Yes, I talked at the café. A young man in a yellow coat listened. » : peu naturel.
  - Remplacer par « Oh… Well… Yes, I talked about you at the café. A young man in a yellow coat was there. He listened to everything. » / « Oh… Eh bien… Oui, j'ai parlé de vous au café. Un jeune homme en ciré jaune était là. Il a tout écouté. »
- Pemberton (start) : il ne dit jamais son nom.
  - « Hello! You're Arthur's grandchild. I'm Mr Pemberton, the solicitor. »
- Maya (a), « Everybody? How? » : peu naturel.
  - « Everybody? Who told them? » / « Tout le monde ? Qui le leur a dit ? »
- Opératrice : « Do you want to call France? » suppose qu'elle devine.
  - « Hello, operator. Which country, please? » / « Bonjour, ici l'opératrice. Quel pays, s'il vous plaît ? »
  - Options : « France, please. » et « England, please. ». Réplique pour la seconde : « But you're in England! Which country? » / « Mais vous êtes en Angleterre ! Quel pays ? »
- Mrs Patel : « seeded » n'est jamais entendu en version débutant.
  - Mrs Patel : « Two loaves, please. Brown bread, not white! »
  - Option : « Two brown loaves. Here you are. » / « Deux pains complets. Voilà. »

**18. Leurres fautifs dans le mode libre, que l'icône haut-parleur fait prononcer**
- Où : `data.js`. Les options « I want bread. Give. », « Yes, I like. », « Weather is yes. » et « I want banana. » contredisent la règle écrite dans `story-data.js` et la recherche (Roediger & Marsh : une phrase fausse peut être retenue).
- Remplacements, tous en anglais correct :
  - **Boulangerie** : « Give me bread. » / « Donne-moi du pain. » (correct mais impoli). Réplique et astuce de politesse inchangées.
  - **Rosa** : « I'm from France. » / « Je viens de France. ». Réplique : « Ha ha, I know! But do you like flowers? » / « Ha ha, je sais ! Mais tu aimes les fleurs ? ». Astuce : « On te demande si tu aimes les fleurs : « Do you like…? » ».
  - **Leo** : « It's three o'clock. » / « Il est trois heures. ». Réplique : « Eh? I asked about the weather! » / « Hein ? Je parlais du temps qu'il fait ! »
  - **Sam** : « Can I have a banana, please? » / « Je peux avoir une banane ? ». Réplique inchangée (« Sorry, only apples today! »).

**19. Rosa demande « What's your name? », mais aucune option ne donne de prénom**
- Où : `data.js` rosa.
- Quoi : les deux réponses acceptées ne donnent pas de nom. L'astuce dit pourtant « réponds « My name is… » ».
- Correction :
  - Option 1 : « Hi Rosa! I'm {n}. I'm new here. » / « Salut Rosa ! Moi, c'est {n}. Je suis nouveau·elle ici. »
  - Option 2 : « My name is {n}. I'm a friend of Tom's. » / « Je m'appelle {n}. Je suis un·e ami·e de Tom. »
  - Pour cela, `fill()` doit aussi remplacer `{n}` dans le mode libre.
- À côté : juste après « Can you say Hello? », Rosa se représente (« Hi! I'm Rosa. »), et elle rejoue cette présentation à chaque nouvelle conversation le même jour.

**20. Prénom épelé faux pour les prénoms à accent**
- Où : `story.js` `prep()` (`toUpperCase().replace(/[^A-Z]/g,'')`).
- Quoi : « Léa » est épelé « L - A », « Chloé » « C - H - L - O ». Cela touche beaucoup de prénoms français. Un prénom qui commence par deux lettres identiques (Aaron) donne deux options identiques, dont une « fausse ».
- Correction :
  - `n.normalize('NFD').replace(/[̀-ͯ]/g,'')` avant de mettre en majuscules.
  - Pour le mauvais ordre, échanger la première paire de lettres différentes.
  - Mettre une majuscule au prénom (`hadrien` → `Hadrien`).

**21. Le joueur ne fait que toucher, sans rien produire**
- Quoi : en mode sans micro, tout le chapitre se joue au toucher. Même avec le micro, l'étape « retrouver de mémoire » ne se déclenche qu'après 3 réussites, ce qui n'arrive presque jamais dans le chapitre. Les nœuds à option unique (point 12) sont du pur clic.
- Correction : dans un nœud à option unique dont la phrase a déjà été entendue ou dite une fois, l'afficher d'emblée en mode mémoire (français + « Dis-le en anglais »). Cela concerne « My name is… » chez l'opératrice, « Thank you, Tom! » et « Here you are. ».

**22. Démasquer le mensonge de Pemberton ne demande aucune déduction**
- Quoi : l'option photo n'apparaît qu'une fois la photo obtenue, et sa traduction commence par « 📷 ». C'est donc forcément elle.
- Correction (format proposé par la recherche, deux affirmations crédibles) :
  - p2 débutant : « Me? No! Yesterday I was in London all day! » / « Moi ? Non ! Hier, j'étais à Londres toute la journée ! »
  - p2 confirmé : « Me? Certainly not! I was in London all day yesterday. »
  - Options :
    - « But you were at the café. Look at this photo! » / « Mais vous étiez au café. Regardez cette photo ! » (confirmé : « Really? Then how do you explain this photo of you at the café? »)
    - « Oh, London! Lovely. » / « Ah, Londres ! Super. » → mène à `lied`
  - Retirer le « 📷 » de la traduction.

**23. Tu et vous mélangés dans les traductions**
- Jones tutoie le joueur adulte (« Comment tu t'appelles ? », « Ton numéro de dossier »), alors qu'Okafor et l'opératrice le vouvoient. Le joueur tutoie le notaire (« Tu as dit aux gens… », « Regarde cette photo »), alors qu'il le vouvoie en version confirmée.
- Correction : vouvoiement pour Jones, Pemberton et l'opératrice dans les deux sens (« Comment vous appelez-vous ? », « Vous pouvez l'épeler ? », « Votre numéro de dossier est le 247. », « Vous êtes le petit-enfant d'Arthur. », « Regardez cette photo. »). Tutoiement pour Tom, Maya et Jack.

## C. Détails

**24. Titre du policier**
- « Agent Jones » est un calque du français. En anglais britannique, on dit « PC Jones » (Police Constable).
- Correction : `who.jones: 'PC Jones · la police'` et `name: 'PC Jones'`.

**25. Petites tournures à revoir dans la version confirmée (anglais britannique)**
- Tom, option : « Someone just stole my suitcase! » → « Someone's just stolen my suitcase! »
- Tom, j3 : « In exchange, you give me a hand » → « In return, you can give me a hand in the shop. Deal? »
- Mrs Patel : l'astuce cite « Not white bread », alors qu'en version confirmée elle dit « No white bread, mind! ». Il faut une astuce par version : « Elle a dit « No white bread » : pas de pain blanc. »

**26. Petites tournures de la version débutant**
- shop end : « Here is a customer! » → « Here's a customer! »
- Tom j2 : « You have nothing? » → « You've got nothing? You can sleep above my bakery. »

**27. Traductions fausses dans le mode libre**
- Maya, « That's nice! » → « C'est gentil ! » est faux : « C'est mignon ! » ou « C'est chouette ! ».
- Pemberton, « Ah, good day to you! » est une salutation : « Ah, bien le bonjour ! ». La réponse « Good day, Mr Pemberton. » est vieillie et mal traduite : « Hello, Mr Pemberton. » / « Bonjour, Mr Pemberton. »

**28. Formes trop raides ou elliptiques dans le mode libre**
- Leo : « Yes, but a bit cold. » / « Oui, mais un peu froid. » → « Yes, but it's a bit cold. » / « Oui, mais il fait un peu froid. »
- Sam : « Two pounds? OK, here. » → « Two pounds? OK, here you are. »
- Suivis : « I am learning new words. » → « I'm learning new words. » ; « I am going… » → « I'm going… » ; « It is beautiful! » → « It's beautiful! ». Les contractions sont la norme à l'oral, et le micro compare à la phrase écrite.

**29. Traductions qui supposent le joueur masculin**
- « Enchanté », « je suis nouveau », « un ami de Tom », « Bleue ? Tu es sûr ? ».
- Correction : « Ravi·e », « nouveau·elle », « Bleue ? Vraiment ? ».

**30. Boutons de réponse un peu petits**
- Quoi : en version confirmée, les options sur une seule ligne font 38 px de haut, sous les 44 px recommandés sur iPhone.
- Correction : `#dOpts .opt { min-height: 44px }`.

**31. Le carnet reste sur un objectif dépassé**
- Quoi : pendant le voleur, l'arrivée de Tom et le test, le carnet affiche toujours « Avance jusqu'à la fontaine ».
- Correction : vider ou masquer le carnet pendant `busy`, ou poser `obj: 'Parle à Tom.'`.

**32. Tom bute contre la fontaine en venant**
- Quoi : il reste bloqué contre la fontaine quelques secondes (environ 18 s en rendu sans écran, soit 4 à 5 s réelles) avant de contourner.
- Correction : point d'arrivée de Tom du côté du joueur, ou détour prévu autour de la fontaine.

**33. Le carnet ne permet pas de voir la photo**
- Quoi : la légende « Il ment… Tu as une preuve dans ton carnet. » renvoie au carnet, mais le carnet n'affiche qu'un petit « 📷 » et la photo ne s'ouvre pas.
- Correction : « Il ment… Reparle-lui et montre-lui la photo de Maya. »

**34. Moments plats et fin passive**
- Quoi : l'appel n'a que 3 répliques à option unique. Le chapitre se clôt sur une légende pendant que le voleur file, sans rien à faire.
- Proposition : faire monter l'enjeu par Pemberton, à la fin de p3 ou dans sa réponse.
  - Débutant : « Oh no… The keys to Arthur's house were in your suitcase! » / « Oh non… Les clés de la maison d'Arthur étaient dans votre valise ! »
  - Confirmé : « Good heavens… and Arthur's keys were in that suitcase. »
  - Cela comble aussi un trou : pourquoi le notaire de la famille n'a-t-il pas un double des clés ? Et cela prépare le chapitre 2.

**35. Le colis de maman n'a pas d'adresse**
- Quoi : elle envoie un colis, mais le joueur n'a ni maison accessible ni adresse.
- Correction : « Je t'envoie un colis chez ton boulanger, avec des vêtements et un peu d'argent. »

**36. Jones : deux réponses acceptées à « Is it big or small? »**
- Quoi : « Big » et « Small » sont toutes deux acceptées, alors que la taille de la valise n'est jamais donnée.
- Correction : préciser la taille dans la légende d'arrivée (« ta grosse valise rouge ») et rendre « Small » fausse. Réplique de Jones : « Small? Are you sure? »
