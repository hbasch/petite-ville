/* Chatterville — chapitre 1 « Sans rien » : textes de l'histoire.
   Lignes : [anglais débutant, { fr }, clé des réponses, anglais confirmé (facultatif)].
   Réponses : t (débutant), tc (confirmé, facultatif), tr / trc (français), to, reply [débutant, { fr }, confirmé], tip, need, flag, pl (test : 1 = bonne réponse).
   {n} = ton prénom, {sp} = ton prénom épelé, {sw} = mal épelé. Aucune phrase en anglais n'est écrite dans le code du jeu. */
var PV = window.PV = window.PV || {};
PV.STORY1 = {
  title: 'Chapitre 1 · Sans rien',
  start: {
    title: 'Chatterville',
    text: "Ton grand-père Arthur, un Anglais, t'a laissé sa maison à Chatterville. Tu ne l'as presque pas connu, et tu ne parles pas sa langue. Aujourd'hui, tu arrives.",
    deb: 'Je débute en anglais', test: 'Je parle déjà un peu (petit test)', free: 'Jouer sans histoire (pratique libre)'
  },
  cap: {
    arrive: "Chatterville, enfin. La maison d'Arthur est quelque part là-haut, sur la colline. Tu as ta valise rouge, avec les clés, tes papiers, ton téléphone…",
    stolen: "Ma valise ! Les clés de la maison, mes papiers, mon téléphone… Tout était dedans. Et sans téléphone, pas de traducteur.",
    someone: "Quelqu'un arrive en courant de la boulangerie…",
    mum: "« Allô ? Mon cœur ! On t'a volé ta valise ?! … Bon. Je t'envoie un colis avec des vêtements et un peu d'argent. Il mettra quelques jours. Courage, tu vas y arriver. »",
    lied: "Il ment… Tu as une preuve dans ton carnet.",
    end: "Le ciré jaune ! Il file vers la sortie de la ville… Cette fois, je sais qui chercher.",
    noMoney: "Tu n'as pas d'argent. Il faut d'abord travailler chez Tom."
  },
  obj: {
    fountain: 'Avance jusqu\u2019à la fontaine, au milieu de la place.',
    work: "Va travailler à la boulangerie de Tom (passe devant, puis touche l'étiquette « bakery »).",
    errands: 'Déclare le vol au policier, devant la mairie · Achète une brosse à dents à la pharmacie',
    police: 'Déclare le vol au policier, devant la mairie.',
    brush: 'Achète une brosse à dents à la pharmacie.',
    phone: 'Appelle ta mère depuis la cabine rouge (touche son étiquette).',
    clue: 'Qui savait que tu arrivais aujourd’hui ? Parle à Maya.',
    lie: 'Parle à Mr Pemberton, le notaire, devant le café.',
    done: 'Chapitre 1 terminé. Explore la ville en attendant la suite !'
  },
  endCard: { title: 'Chapitre 1 terminé !', text: "Tu n'as plus rien, mais tu as un toit, un travail, un premier ami, et une piste : un ciré jaune. La suite arrive bientôt : « Les garants ».", ok: 'Continuer à explorer' },
  skip: 'Passer le test',
  level: { title: 'Ton niveau estimé : {c}', A0: 'Grand débutant : l’histoire commence en version débutant, avec l’aide en français.', A1: 'Tu connais les bases : l’histoire commence en version débutant.', A2: 'Tu te débrouilles : l’histoire passe en version confirmée.', B1: 'Tu parles déjà bien : version confirmée (B1 ou plus). Tu pourras couper l’aide en français.', note: 'Pour changer de version, recommence l’histoire depuis l’aide « ? ».' },
  who: { thief: 'Un jeune homme', tom: 'Tom · le boulanger', jack: 'Jack · un petit garçon', patel: 'Mrs Patel · une cliente', okafor: 'Mr Okafor · le pharmacien', jones: 'PC Jones · la police', operator: "L'opératrice", maya: 'Maya · l’étudiante', pemberton: 'Mr Pemberton · le notaire' },
  pitch: { thief: 1.0, tom: .9, jack: 1.35, patel: 1.1, okafor: .85, jones: .8, operator: 1.15, maya: 1.15, pemberton: .82 },
  /* allure des clients de la boulangerie */
  looks: {
    jack: { skin: '#eec2a2', hair: '#c2752e', style: 'short', shirt: '#4b8fd8', pants: '#2f3a5a', shoes: '#f4efe6', scale: .78 },
    patel: { skin: '#c38866', hair: '#d8d8d8', style: 'bun', outfit: 'cardigan', shirt: '#c94f7c', pants: '#5a4a3a', shoes: '#3a2a22' }
  },
  restart: { title: 'Recommencer ?', story: "L'histoire repart du prologue. Tes mots appris restent.", all: 'Tout est effacé : progression, mots, réglages. Tu repars comme un nouveau joueur.', yes: 'Recommencer', no: 'Annuler' },
  dlg: {
    /* le voleur : il te distrait en demandant l'heure */
    thief: { nodes: {
      start: ['Excuse me! What time is it?', { fr: 'Pardon ! Quelle heure est-il ?' }, 'a', 'Sorry to bother you, mate. Have you got the time?', { fr: 'Désolé de te déranger. Tu as l’heure ?' }],
      end: ['Never mind. Thanks!', { fr: 'Tant pis. Merci !' }], huh: ['Sorry?', { fr: 'Pardon ?' }] },
      opts: { a: [{ t: "Sorry, I don't know.", tc: "Sorry, I'm not sure.", tr: { fr: 'Désolé, je ne sais pas.' }, to: 'END', reply: ['Never mind. Thanks!', { fr: 'Tant pis. Merci !' }, 'No worries. Cheers!'] },
                  { t: "Um… it's twelve o'clock?", tr: { fr: 'Euh… il est midi ?' }, to: 'END', reply: ['Thanks!', { fr: 'Merci !' }, 'Cheers!'] }] } },
    /* le petit test : Tom te trouve sur la place. On s'arrête après deux réponses ratées. */
    /* le test de niveau : Tom te trouve sur la place. Deux questions par niveau (A1, A2, B1) ; un niveau n'est validé que si les deux réponses sont justes.
       Toutes les réponses sont en anglais correct : les mauvaises diffèrent par le sens, jamais par une faute (une phrase fausse peut être retenue comme vraie).
       Pas de traduction des réponses pendant le test. q5 est une question d'écoute : la phrase de Tom ne s'affiche pas. */
    test: { listen: ['q5'], nodes: {
      start: ["Hello! I'm Tom. What's your name?", { fr: '' }, 'q1'],
      q2: ['Nice to meet you, {n}. Where are you from?', { fr: '' }, 'q2'],
      q3: ['I saw a man running. What happened?', { fr: '' }, 'q3'],
      q4: ["That's terrible! Why are you in Chatterville?", { fr: '' }, 'q4'],
      q5: ['So what’s your plan now?', { fr: '' }, 'q5'],
      q6: ['Do you think the police will help?', { fr: '' }, 'q6'],
      end: ['Right. Come with me.', { fr: 'Bon. Viens avec moi.' }],
      huh: ['Sorry?', { fr: 'Pardon ?' }] },
      opts: {
        q1: [{ t: 'My name is {n}.', tr: { fr: '' }, to: 'q2', pl: 1, lv: 1 }, { t: "I'm fine, thanks.", tr: { fr: '' }, to: 'q2', pl: 0, lv: 1 }, { t: "I'm from France.", tr: { fr: '' }, to: 'q2', pl: 0, lv: 1 }, { t: "Sorry, I don't understand.", tr: { fr: 'Désolé, je ne comprends pas.' }, to: 'q2', pl: 0, dk: 1, lv: 1 }],
        q2: [{ t: "I'm from France.", tr: { fr: '' }, to: 'q3', pl: 1, lv: 1 }, { t: "I'm twenty.", tr: { fr: '' }, to: 'q3', pl: 0, lv: 1 }, { t: "I'm a student.", tr: { fr: '' }, to: 'q3', pl: 0, lv: 1 }, { t: "Sorry, I don't understand.", tr: { fr: 'Désolé, je ne comprends pas.' }, to: 'q3', pl: 0, dk: 1, lv: 1 }],
        q3: [{ t: 'He took my suitcase!', tr: { fr: '' }, to: 'q4', pl: 1, lv: 2 }, { t: 'He is bringing my suitcase.', tr: { fr: '' }, to: 'q4', pl: 0, lv: 2 }, { t: 'I took his suitcase.', tr: { fr: '' }, to: 'q4', pl: 0, lv: 2 }, { t: "Sorry, I don't understand.", tr: { fr: 'Désolé, je ne comprends pas.' }, to: 'q4', pl: 0, dk: 1, lv: 2 }],
        q4: [{ t: 'My grandfather lived here. He left me his house.', tr: { fr: '' }, to: 'q5', pl: 1, lv: 2 }, { t: 'My grandfather lives here. I visit him every summer.', tr: { fr: '' }, to: 'q5', pl: 0, lv: 2 }, { t: "I'm on holiday. I love English bread.", tr: { fr: '' }, to: 'q5', pl: 0, lv: 2 }, { t: "Sorry, I don't understand.", tr: { fr: 'Désolé, je ne comprends pas.' }, to: 'q5', pl: 0, dk: 1, lv: 2 }],
        q5: [{ t: "I'm going to find that thief.", tr: { fr: '' }, to: 'q6', pl: 1, lv: 3 }, { t: 'I found that thief yesterday.', tr: { fr: '' }, to: 'q6', pl: 0, lv: 3 }, { t: "I've already found that thief.", tr: { fr: '' }, to: 'q6', pl: 0, lv: 3 }, { t: "Sorry, I don't understand.", tr: { fr: 'Désolé, je ne comprends pas.' }, to: 'q6', pl: 0, dk: 1, lv: 3 }],
        q6: [{ t: "I hope so, but I'd rather look for him myself.", tr: { fr: '' }, to: 'END', pl: 1, lv: 3 }, { t: 'Yes, they were really helpful when I arrived yesterday.', tr: { fr: '' }, to: 'END', pl: 0, lv: 3 }, { t: "No, and I'd rather they didn't look for him at all.", tr: { fr: '' }, to: 'END', pl: 0, lv: 3 }, { t: "Sorry, I don't understand.", tr: { fr: 'Désolé, je ne comprends pas.' }, to: 'END', pl: 0, dk: 1, lv: 3 }]
      } },
    tomHelp: { nodes: {
      start: ["Oh no! Are you OK? I'm Tom, the baker.", { fr: 'Oh non ! Ça va ? Je suis Tom, le boulanger.' }, 'a', "Oh dear, are you all right? I'm Tom — I run the bakery over there.", { fr: 'Oh là là, ça va ? Je suis Tom, je tiens la boulangerie, là-bas.' }],
      j2: ['You have nothing? You can sleep above my bakery.', { fr: 'Tu n’as plus rien ? Tu peux dormir au-dessus de ma boulangerie.' }, 'b', "You've got nothing at all? Right — you can stay in the little room above my bakery.", { fr: 'Tu n’as plus rien du tout ? Bon : tu peux loger dans la petite chambre au-dessus de ma boulangerie.' }],
      j3: ['And you help me in the mornings. OK?', { fr: 'Et tu m’aides le matin. D’accord ?' }, 'c', 'In exchange, you give me a hand in the shop. Deal?', { fr: 'En échange, tu me donnes un coup de main à la boutique. Marché conclu ?' }],
      end: ['Great! Come to the bakery.', { fr: 'Super ! Viens à la boulangerie.' }],
      huh: ['Sorry?', { fr: 'Pardon ?' }] },
      opts: {
        a: [{ t: "Sorry, could you say that again?", tr: { fr: 'Pardon, vous pouvez répéter ?' }, to: 'start', again: 1 },
            { t: 'No! A man took my suitcase!', tc: 'Not really. Someone just stole my suitcase!', tr: { fr: 'Non ! Un homme a pris ma valise !' }, trc: { fr: 'Pas vraiment. Quelqu’un vient de voler ma valise !' }, to: 'j2' }],
        b: [{ t: 'Really? Thank you!', tc: "Really? That's so kind of you!", tr: { fr: 'C’est vrai ? Merci !' }, trc: { fr: 'C’est vrai ? C’est très gentil !' }, to: 'j3' }],
        c: [{ t: 'OK! Thank you, Tom.', tc: 'Deal! When do I start?', tr: { fr: 'D’accord ! Merci, Tom.' }, trc: { fr: 'Marché conclu ! Je commence quand ?' }, to: 'END', reply: ['Great! Come to the bakery.', { fr: 'Super ! Viens à la boulangerie.' }, 'Right now! Come on, the bakery is just there.', { fr: 'Tout de suite ! Allez, la boulangerie est juste là.' }] }]
      } },
    shop: { nodes: {
      start: ['You serve the customers. The prices are on the board.', { fr: 'Tu sers les clients. Les prix sont sur l’ardoise.' }, 'a', "Right, you're on the till. Prices are on the board — take your time.", { fr: 'Bon, tu tiens la caisse. Les prix sont sur l’ardoise, prends ton temps.' }],
      end: ['Here is a customer!', { fr: 'Voilà un client !' }], huh: ['Sorry?', { fr: 'Pardon ?' }] },
      opts: { a: [{ t: 'OK!', tc: 'Got it!', tr: { fr: 'D’accord !' }, trc: { fr: 'Compris !' }, to: 'END', reply: ['Here is a customer!', { fr: 'Voilà un client !' }, 'Here comes your first customer!', { fr: 'Voilà ton premier client !' }] }] } },
    jack: { nodes: {
      start: ['Hello! One croissant, please.', { fr: 'Bonjour ! Un croissant, s’il vous plaît.' }, 'a', 'Hiya! Can I have a croissant, please?', { fr: 'Salut ! Je peux avoir un croissant, s’il vous plaît ?' }],
      k2: ['Here you are. Thank you!', { fr: 'Voilà. Merci !' }, 'b'],
      end: ['Bye!', { fr: 'Au revoir !' }], huh: ['Sorry?', { fr: 'Pardon ?' }] },
      opts: {
        a: [{ t: 'Here you are. One pound twenty, please.', tr: { fr: 'Voilà. Une livre vingt, s’il te plaît.' }, to: 'k2' },
            { t: 'Here you are. Two pounds, please.', tr: { fr: 'Voilà. Deux livres, s’il te plaît.' }, to: 'start', reply: ["That's not the price on the board!", { fr: 'Ce n’est pas le prix sur l’ardoise !' }], tip: { fr: 'Regarde l’ardoise : un croissant coûte une livre vingt.' } }],
        b: [{ t: 'Thank you! Bye!', tr: { fr: 'Merci ! Au revoir !' }, to: 'END', reply: ['Bye!', { fr: 'Au revoir !' }] }]
      } },
    patel: { nodes: {
      start: ['Morning, dear. Two loaves, please. Not white bread!', { fr: 'Bonjour, mon petit. Deux pains, s’il vous plaît. Pas de pain blanc !' }, 'a', 'Morning, dear. The usual, please: two seeded loaves. No white bread, mind!', { fr: 'Bonjour, mon petit. Comme d’habitude : deux pains aux graines. Et surtout pas de pain blanc !' }],
      p2: ['Lovely. How much is that?', { fr: 'Parfait. Ça fait combien ?' }, 'b'],
      end: ['Thank you, dear!', { fr: 'Merci, mon petit !' }], huh: ['Sorry, dear?', { fr: 'Pardon ?' }] },
      opts: {
        a: [{ t: "Sorry, could you say that again?", tr: { fr: 'Pardon, vous pouvez répéter ?' }, to: 'start', again: 1 },
            { t: 'Two seeded loaves. Here you are.', tr: { fr: 'Deux pains aux graines. Voilà.' }, to: 'p2' },
            { t: 'Two white loaves. Here you are.', tr: { fr: 'Deux pains blancs. Voilà.' }, to: 'start', reply: ['No, no! Not white bread!', { fr: 'Non, non ! Pas de pain blanc !' }], tip: { fr: 'Elle a dit « Not white bread » : pas de pain blanc.' } }],
        b: [{ t: 'Five pounds sixty, please.', tc: "That's five pounds sixty, please.", tr: { fr: 'Cinq livres soixante, s’il vous plaît.' }, to: 'END', reply: ['Here you are. Thank you, dear!', { fr: 'Tenez. Merci, mon petit !' }] },
            { t: 'Two pounds eighty, please.', tr: { fr: 'Deux livres quatre-vingts, s’il vous plaît.' }, to: 'p2', reply: ['For two loaves?', { fr: 'Pour deux pains ?' }], tip: { fr: 'Deux pains : 2 × 2,80 = 5,60 livres.' } }]
      } },
    pay: { nodes: {
      start: ["Well done! Here's five pounds for you.", { fr: 'Bravo ! Voilà cinq livres pour toi.' }, 'a', "Brilliant, you're a natural! Here's a fiver for this morning.", { fr: 'Génial, tu es doué ! Voilà un billet de cinq livres pour ce matin.' }],
      end: ['Now go to the police!', { fr: 'Maintenant, va voir la police !' }], huh: ['Sorry?', { fr: 'Pardon ?' }] },
      opts: { a: [{ t: 'Thank you, Tom!', tc: 'Cheers, Tom!', tr: { fr: 'Merci, Tom !' }, to: 'END', flag: 'paid', reply: ['Now go to the police. And buy a toothbrush!', { fr: 'Maintenant, va voir la police. Et achète une brosse à dents !' }, 'Now go and report that theft. And get yourself a toothbrush!', { fr: 'Maintenant, va déclarer ce vol. Et achète-toi une brosse à dents !' }] }] } },
    okafor: { nodes: {
      start: ['Hello! Can I help you?', { fr: 'Bonjour ! Je peux vous aider ?' }, 'a', 'Hello there! What can I get you?', { fr: 'Bonjour ! Qu’est-ce qu’il vous faut ?' }],
      o1: ['Of course. Here you are.', { fr: 'Bien sûr. Voilà.' }, 'p', 'Of course. Here we are.'],
      o2: ['Two pounds, please.', { fr: 'Deux livres, s’il vous plaît.' }, 'b', "That's two pounds, please."],
      end: ['Goodbye!', { fr: 'Au revoir !' }], huh: ['Sorry?', { fr: 'Pardon ?' }] },
      opts: {
        a: [{ t: 'Excuse me. A toothbrush, please.', tc: 'Excuse me, have you got a toothbrush, please?', tr: { fr: 'Excusez-moi. Une brosse à dents, s’il vous plaît.' }, trc: { fr: 'Excusez-moi, vous avez une brosse à dents, s’il vous plaît ?' }, to: 'o1' },
            { t: 'A croissant, please.', tr: { fr: 'Un croissant, s’il vous plaît.' }, to: 'start', reply: ['Ha ha! This is a pharmacy!', { fr: 'Ha ha ! Ici, c’est une pharmacie !' }], tip: { fr: 'Une brosse à dents se dit « a toothbrush ».' } }],
        p: [{ t: 'How much is it?', tc: 'How much is that?', tr: { fr: 'C’est combien ?' }, to: 'o2' }, { t: 'How old is it?', tr: { fr: 'Elle a quel âge ?' }, to: 'o1', reply: ['Ha ha! It’s new! Do you mean: how much is it?', { fr: 'Ha ha ! Elle est neuve ! Tu veux dire : c’est combien ?' }], tip: { fr: 'Pour le prix : « How much is it? »' } }],
        b: [{ t: 'Here you are.', tr: { fr: 'Voilà.' }, need: 'coins2', flag: 'brush', to: 'END', reply: ['Thank you! Goodbye!', { fr: 'Merci ! Au revoir !' }] },
            { t: 'Sorry, I have no money.', tr: { fr: 'Désolé, je n’ai pas d’argent.' }, to: 'END', reply: ['No problem. Come back later!', { fr: 'Pas de souci. Revenez plus tard !' }] }]
      } },
    jones: { nodes: {
      start: ['Hello. What happened?', { fr: 'Bonjour. Qu’est-ce qui s’est passé ?' }, 'a', 'Hello there. Is everything all right?', { fr: 'Bonjour. Tout va bien ?' }],
      j2: ['What colour is it?', { fr: 'De quelle couleur est-elle ?' }, 'b', 'I see. Can you describe it? What colour is it?', { fr: 'Je vois. Vous pouvez la décrire ? De quelle couleur est-elle ?' }],
      j3: ['Is it big or small?', { fr: 'Elle est grande ou petite ?' }, 'c'],
      j4: ["What's your name?", { fr: 'Comment tu t’appelles ?' }, 'd', 'Right. And your name, please?', { fr: 'Bien. Et votre nom, s’il vous plaît ?' }],
      j5: ['Can you spell it, please?', { fr: 'Tu peux l’épeler, s’il te plaît ?' }, 'e'],
      j6: ['Thank you. Your number is two, four, seven.', { fr: 'Merci. Ton numéro de dossier est le 247.' }, 'f', "Thank you. Your crime number is two-four-seven. Don't lose it!", { fr: 'Merci. Votre numéro de plainte est le 247. Ne le perdez pas !' }],
      end: ['Good luck!', { fr: 'Bonne chance !' }], huh: ['Sorry?', { fr: 'Pardon ?' }] },
      opts: {
        a: [{ t: 'Excuse me. A man took my suitcase.', tc: 'Excuse me. Someone stole my suitcase by the fountain.', tr: { fr: 'Excusez-moi. Un homme a pris ma valise.' }, trc: { fr: 'Excusez-moi. Quelqu’un a volé ma valise près de la fontaine.' }, to: 'j2' },
            { t: "I'm hungry.", tr: { fr: 'J’ai faim.' }, to: 'start', reply: ['Sorry? What happened?', { fr: 'Pardon ? Qu’est-ce qui s’est passé ?' }] }],
        b: [{ t: "It's red.", tr: { fr: 'Elle est rouge.' }, to: 'j3' }, { t: "It's blue.", tr: { fr: 'Elle est bleue.' }, to: 'j2', reply: ['Blue? Are you sure?', { fr: 'Bleue ? Tu es sûr ?' }], tip: { fr: 'Ta valise est rouge : « It’s red ».' } }],
        c: [{ t: 'Big.', tc: "It's quite big.", tr: { fr: 'Grande.' }, to: 'j4' }, { t: 'Small.', tr: { fr: 'Petite.' }, to: 'j4' }],
        d: [{ t: 'My name is {n}.', tr: { fr: 'Je m’appelle {n}.' }, to: 'j5' }],
        e: [{ t: '{sp}', tr: { fr: '(ton prénom, lettre par lettre)' }, to: 'j6' }, { t: '{sw}', tr: { fr: '(lettres dans le désordre)' }, to: 'j5', reply: ['Sorry? Again, please.', { fr: 'Pardon ? Encore, s’il te plaît.' }], tip: { fr: 'Épelle ton prénom lettre par lettre, dans l’ordre.' } }],
        f: [{ t: 'Two, four, seven. Thank you!', tr: { fr: 'Deux, quatre, sept. Merci !' }, flag: 'police', to: 'END', reply: ['Good luck!', { fr: 'Bonne chance !' }] },
            { t: 'Two, seven, four?', tr: { fr: 'Deux, sept, quatre ?' }, to: 'j6', reply: ['No: two, four, seven.', { fr: 'Non : deux, quatre, sept.' }] }]
      } },
    operator: { nodes: {
      start: ['Hello. Operator. Do you want to call France?', { fr: 'Bonjour. Standard. Vous voulez appeler la France ?' }, 'a', 'Operator speaking. How can I help?', { fr: 'Ici l’opératrice. Que puis-je pour vous ?' }],
      o2: ['Your name, please?', { fr: 'Votre nom, s’il vous plaît ?' }, 'b'],
      o3: ['Thank you. Please wait.', { fr: 'Merci. Attendez, s’il vous plaît.' }, 'c', 'Thank you. Hold the line, please.', { fr: 'Merci. Ne quittez pas.' }],
      end: ['Connecting you now.', { fr: 'Je vous mets en relation.' }], huh: ['Sorry, caller?', { fr: 'Pardon ?' }] },
      opts: {
        a: [{ t: "Sorry, could you say that again?", tr: { fr: 'Pardon, vous pouvez répéter ?' }, to: 'start', again: 1 },
            { t: 'Yes, please. France.', tc: "I'd like to make a reverse-charge call to France, please.", tr: { fr: 'Oui, s’il vous plaît. La France.' }, trc: { fr: 'Je voudrais appeler la France en PCV, s’il vous plaît.' }, to: 'o2' }],
        b: [{ t: 'My name is {n}.', tr: { fr: 'Je m’appelle {n}.' }, to: 'o3' }],
        c: [{ t: 'OK. Thank you.', tr: { fr: 'D’accord. Merci.' }, to: 'END', flag: 'call', reply: ['Connecting you now.', { fr: 'Je vous mets en relation.' }] }]
      } },
    maya: { nodes: {
      start: ["Hi! You're Arthur's grandchild? Everybody knows!", { fr: 'Salut ! Tu es le petit-enfant d’Arthur ? Tout le monde le sait !' }, 'a', "Hi! You must be Arthur's grandchild. The whole town's talking about you!", { fr: 'Salut ! Tu dois être le petit-enfant d’Arthur. Toute la ville parle de toi !' }],
      m2: ['Mr Pemberton talked about you at the café yesterday. I have a photo!', { fr: 'Mr Pemberton a parlé de toi au café hier. J’ai une photo !' }, 'b', 'Mr Pemberton told the whole café yesterday. Look, I took a photo!', { fr: 'Mr Pemberton l’a raconté à tout le café hier. Regarde, j’ai pris une photo !' }],
      end: ['Bye!', { fr: 'Salut !' }], huh: ['Sorry?', { fr: 'Pardon ?' }] },
      opts: {
        a: [{ t: 'Everybody? How?', tc: 'Everybody? How come?', tr: { fr: 'Tout le monde ? Comment ?' }, to: 'm2' }],
        b: [{ t: 'Can I see the photo?', tc: 'Really? Can I have a look?', tr: { fr: 'Je peux voir la photo ?' }, trc: { fr: 'C’est vrai ? Je peux regarder ?' }, to: 'END', flag: 'photo', reply: ["Here! Look, he's talking to a man in a yellow coat.", { fr: 'Tiens ! Regarde, il parle à un homme en ciré jaune.' }, "Here. See? He's chatting to some lad in a yellow raincoat.", { fr: 'Tiens. Tu vois ? Il discute avec un jeune en ciré jaune.' }] }]
      } },
    pemberton: { nodes: {
      start: ["Hello! You're Arthur's grandchild. I'm the solicitor.", { fr: 'Bonjour ! Tu es le petit-enfant d’Arthur. Je suis le notaire.' }, 'a', "How do you do? You must be Arthur's grandchild. Pemberton, the family solicitor. Dreadful business, your suitcase.", { fr: 'Enchanté. Vous devez être le petit-enfant d’Arthur. Pemberton, le notaire de la famille. Quelle triste affaire, votre valise.' }],
      p2: ['Me? No! I never talk about my clients!', { fr: 'Moi ? Non ! Je ne parle jamais de mes clients !' }, 'b', 'Me? Certainly not! I never discuss my clients.', { fr: 'Moi ? Certainement pas ! Je ne parle jamais de mes clients.' }],
      p3: ['Oh… Well… Yes, I talked at the café. A young man in a yellow coat listened.', { fr: 'Oh… Eh bien… Oui, j’ai parlé au café. Un jeune homme en ciré jaune écoutait.' }, 'c', 'Ah. Well… I may have mentioned it at the café. There was a young man in a yellow raincoat, hanging on every word.', { fr: 'Ah. Eh bien… J’en ai peut-être parlé au café. Il y avait un jeune homme en ciré jaune, suspendu à mes lèvres.' }],
      end: ['Good day!', { fr: 'Bonne journée !' }], huh: ['I beg your pardon?', { fr: 'Pardon ?' }] },
      opts: {
        a: [{ t: "Sorry, could you say that again?", tr: { fr: 'Pardon, vous pouvez répéter ?' }, to: 'start', again: 1 },
            { t: 'Did you talk about me?', tc: 'Did you tell anyone I was arriving today?', tr: { fr: 'Vous avez parlé de moi ?' }, trc: { fr: 'Vous avez dit à quelqu’un que j’arrivais aujourd’hui ?' }, to: 'p2' }],
        b: [{ t: 'Look at this photo.', tc: 'Then how do you explain this photo?', tr: { fr: 'Regardez cette photo.' }, trc: { fr: 'Alors comment expliquez-vous cette photo ?' }, need: 'photo', to: 'p3' },
            { t: 'OK, sorry.', tr: { fr: 'D’accord, pardon.' }, to: 'END', flag: 'lied', reply: ['Good day!', { fr: 'Bonne journée !' }] }],
        c: [{ t: "A yellow coat? That's the thief!", tc: "A yellow raincoat? That's the man who stole my suitcase!", tr: { fr: 'Un ciré jaune ? C’est le voleur !' }, trc: { fr: 'Un ciré jaune ? C’est l’homme qui a volé ma valise !' }, to: 'END', flag: 'truth', reply: ["Oh dear! I'm so sorry!", { fr: 'Oh là là ! Je suis vraiment désolé !' }, "Good heavens… I'm terribly sorry.", { fr: 'Grands dieux… Je suis vraiment navré.' }] }]
      } }
  }
};
