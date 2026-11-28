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
  who: { thief: 'Un jeune homme', tom: 'Tom · le boulanger', jack: 'Jack · un petit garçon', patel: 'Mrs Patel · une cliente', okafor: 'Mr Okafor · le pharmacien', jones: 'Agent Jones · la police', operator: "L'opératrice", maya: 'Maya · l’étudiante', pemberton: 'Mr Pemberton · le notaire' },
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
      start: ['Excuse me! What time is it?', { fr: 'Pardon ! Quelle heure est-il ?' }, 'a', 'Sorry to bother you, mate. Have you got the time?'],
      end: ['Never mind. Thanks!', { fr: 'Tant pis. Merci !' }], huh: ['Sorry?', { fr: 'Pardon ?' }] },
      opts: { a: [{ t: "Sorry, I don't know.", tc: "Sorry, I'm not sure.", tr: { fr: 'Désolé, je ne sais pas.' }, to: 'END', reply: ['Never mind. Thanks!', { fr: 'Tant pis. Merci !' }, 'No worries. Cheers!'] },
                  { t: "Um… it's twelve o'clock?", tr: { fr: 'Euh… il est midi ?' }, to: 'END', reply: ['Thanks!', { fr: 'Merci !' }, 'Cheers!'] }] } },
    /* le petit test : Tom te trouve sur la place. On s'arrête après deux réponses ratées. */
    test: { nodes: {
      start: ["Hello! I'm Tom. What's your name?", { fr: 'Bonjour ! Je suis Tom. Comment tu t’appelles ?' }, 'q1'],
      q2: ['Nice to meet you, {n}. Where are you from?', { fr: 'Enchanté, {n}. Tu viens d’où ?' }, 'q2'],
      q3: ['I saw a man running. What happened?', { fr: 'J’ai vu un homme courir. Qu’est-ce qui s’est passé ?' }, 'q3'],
      q4: ["That's terrible! Why are you in Chatterville?", { fr: 'C’est terrible ! Pourquoi tu es à Chatterville ?' }, 'q4'],
      q5: ['And what are you going to do now?', { fr: 'Et qu’est-ce que tu vas faire maintenant ?' }, 'q5'],
      q6: ['Do you think the police will help?', { fr: 'Tu crois que la police va t’aider ?' }, 'q6'],
      end: ['Right. Come with me.', { fr: 'Bon. Viens avec moi.' }],
      huh: ['Sorry?', { fr: 'Pardon ?' }] },
      opts: {
        q1: [{ t: 'My name is {n}.', tr: { fr: 'Je m’appelle {n}.' }, to: 'q2', pl: 1 }, { t: "I'm fine, thanks.", tr: { fr: 'Ça va, merci.' }, to: 'q2', pl: 0 }, { t: 'Yes, please.', tr: { fr: 'Oui, s’il te plaît.' }, to: 'q2', pl: 0 }],
        q2: [{ t: "I'm from France.", tr: { fr: 'Je viens de France.' }, to: 'q3', pl: 1 }, { t: "I'm France from.", tr: { fr: '(phrase incorrecte)' }, to: 'q3', pl: 0 }, { t: "It's ten o'clock.", tr: { fr: 'Il est dix heures.' }, to: 'q3', pl: 0 }],
        q3: [{ t: 'He took my suitcase!', tr: { fr: 'Il a pris ma valise !' }, to: 'q4', pl: 1 }, { t: 'He takes my suitcase tomorrow.', tr: { fr: '(temps incorrect)' }, to: 'q4', pl: 0 }, { t: 'I took his suitcase.', tr: { fr: 'J’ai pris sa valise.' }, to: 'q4', pl: 0 }],
        q4: [{ t: 'My grandfather lived here. He left me his house.', tr: { fr: 'Mon grand-père vivait ici. Il m’a laissé sa maison.' }, to: 'q5', pl: 1 }, { t: 'My grandfather live here. He leave me house.', tr: { fr: '(phrase incorrecte)' }, to: 'q5', pl: 0 }, { t: 'Because the bread is cheap.', tr: { fr: 'Parce que le pain n’est pas cher.' }, to: 'q5', pl: 0 }],
        q5: [{ t: "I'm going to find that thief.", tr: { fr: 'Je vais retrouver ce voleur.' }, to: 'q6', pl: 1 }, { t: 'I went to find that thief yesterday.', tr: { fr: '(temps incorrect)' }, to: 'q6', pl: 0 }, { t: "I'm going to buy a thief.", tr: { fr: 'Je vais acheter un voleur.' }, to: 'q6', pl: 0 }],
        q6: [{ t: "I hope so, but I'd rather look for him myself.", tr: { fr: 'J’espère, mais je préfère le chercher moi-même.' }, to: 'END', pl: 1 }, { t: 'I hope, but I rather look him myself.', tr: { fr: '(phrase incorrecte)' }, to: 'END', pl: 0 }, { t: 'The police is a good bread.', tr: { fr: 'La police est un bon pain.' }, to: 'END', pl: 0 }]
      } },
    tomHelp: { nodes: {
      start: ["Oh no! Are you OK? I'm Tom, the baker.", { fr: 'Oh non ! Ça va ? Je suis Tom, le boulanger.' }, 'a', "Oh dear, are you all right? I'm Tom — I run the bakery over there."],
      j2: ['You have nothing? You can sleep above my bakery.', { fr: 'Tu n’as plus rien ? Tu peux dormir au-dessus de ma boulangerie.' }, 'b', "You've got nothing at all? Right — you can stay in the little room above my bakery."],
      j3: ['And you help me in the mornings. OK?', { fr: 'Et tu m’aides le matin. D’accord ?' }, 'c', 'In exchange, you give me a hand in the shop. Deal?'],
      end: ['Great! Come to the bakery.', { fr: 'Super ! Viens à la boulangerie.' }],
      huh: ['Sorry?', { fr: 'Pardon ?' }] },
      opts: {
        a: [{ t: 'No! A man took my suitcase!', tc: 'Not really. Someone just stole my suitcase!', tr: { fr: 'Non ! Un homme a pris ma valise !' }, trc: { fr: 'Pas vraiment. Quelqu’un vient de voler ma valise !' }, to: 'j2' }],
        b: [{ t: 'Really? Thank you!', tc: "Really? That's so kind of you!", tr: { fr: 'C’est vrai ? Merci !' }, trc: { fr: 'C’est vrai ? C’est très gentil !' }, to: 'j3' }],
        c: [{ t: 'OK! Thank you, Tom.', tc: 'Deal! When do I start?', tr: { fr: 'D’accord ! Merci, Tom.' }, trc: { fr: 'Marché conclu ! Je commence quand ?' }, to: 'END', reply: ['Great! Come to the bakery.', { fr: 'Super ! Viens à la boulangerie.' }, 'Right now! Come on, the bakery is just there.'] }]
      } },
    shop: { nodes: {
      start: ['You serve the customers. The prices are on the board.', { fr: 'Tu sers les clients. Les prix sont sur l’ardoise.' }, 'a', "Right, you're on the till. Prices are on the board — take your time."],
      end: ['Here is a customer!', { fr: 'Voilà un client !' }], huh: ['Sorry?', { fr: 'Pardon ?' }] },
      opts: { a: [{ t: 'OK!', tc: 'Got it!', tr: { fr: 'D’accord !' }, trc: { fr: 'Compris !' }, to: 'END', reply: ['Here is a customer!', { fr: 'Voilà un client !' }, 'Here comes your first customer!'] }] } },
    jack: { nodes: {
      start: ['Hello! One croissant, please.', { fr: 'Bonjour ! Un croissant, s’il vous plaît.' }, 'a', 'Hiya! Can I have a croissant, please?'],
      k2: ['Here you are. Thank you!', { fr: 'Voilà. Merci !' }, 'b'],
      end: ['Bye!', { fr: 'Au revoir !' }], huh: ['Sorry?', { fr: 'Pardon ?' }] },
      opts: {
        a: [{ t: 'Here you are. One pound twenty, please.', tr: { fr: 'Voilà. Une livre vingt, s’il te plaît.' }, to: 'k2' },
            { t: 'Here you are. Two pounds, please.', tr: { fr: 'Voilà. Deux livres, s’il te plaît.' }, to: 'start', reply: ["That's not the price on the board!", { fr: 'Ce n’est pas le prix sur l’ardoise !' }], tip: { fr: 'Regarde l’ardoise : un croissant coûte une livre vingt.' } }],
        b: [{ t: 'Thank you! Bye!', tr: { fr: 'Merci ! Au revoir !' }, to: 'END', reply: ['Bye!', { fr: 'Au revoir !' }] }]
      } },
    patel: { nodes: {
      start: ['Morning, dear. Two loaves, please. Not white bread!', { fr: 'Bonjour, mon petit. Deux pains, s’il vous plaît. Pas de pain blanc !' }, 'a', 'Morning, dear. The usual, please: two seeded loaves. No white bread, mind!'],
      p2: ['Lovely. How much is that?', { fr: 'Parfait. Ça fait combien ?' }, 'b'],
      end: ['Thank you, dear!', { fr: 'Merci, mon petit !' }], huh: ['Sorry, dear?', { fr: 'Pardon ?' }] },
      opts: {
        a: [{ t: 'Two seeded loaves. Here you are.', tr: { fr: 'Deux pains aux graines. Voilà.' }, to: 'p2' },
            { t: 'Two white loaves. Here you are.', tr: { fr: 'Deux pains blancs. Voilà.' }, to: 'start', reply: ['No, no! Not white bread!', { fr: 'Non, non ! Pas de pain blanc !' }], tip: { fr: 'Elle a dit « Not white bread » : pas de pain blanc.' } }],
        b: [{ t: 'Five pounds sixty, please.', tc: "That's five pounds sixty, please.", tr: { fr: 'Cinq livres soixante, s’il vous plaît.' }, to: 'END', reply: ['Here you are. Thank you, dear!', { fr: 'Tenez. Merci, mon petit !' }] },
            { t: 'Two pounds eighty, please.', tr: { fr: 'Deux livres quatre-vingts, s’il vous plaît.' }, to: 'p2', reply: ['For two loaves?', { fr: 'Pour deux pains ?' }], tip: { fr: 'Deux pains : 2 × 2,80 = 5,60 livres.' } }]
      } },
    pay: { nodes: {
      start: ["Well done! Here's five pounds for you.", { fr: 'Bravo ! Voilà cinq livres pour toi.' }, 'a', "Brilliant, you're a natural! Here's a fiver for this morning."],
      end: ['Now go to the police!', { fr: 'Maintenant, va voir la police !' }], huh: ['Sorry?', { fr: 'Pardon ?' }] },
      opts: { a: [{ t: 'Thank you, Tom!', tc: 'Cheers, Tom!', tr: { fr: 'Merci, Tom !' }, to: 'END', flag: 'paid', reply: ['Now go to the police. And buy a toothbrush!', { fr: 'Maintenant, va voir la police. Et achète une brosse à dents !' }, 'Now go and report that theft. And get yourself a toothbrush!'] }] } },
    okafor: { nodes: {
      start: ['Hello! Can I help you?', { fr: 'Bonjour ! Je peux vous aider ?' }, 'a', 'Hello there! What can I get you?'],
      o2: ['Here you are. Two pounds, please.', { fr: 'Voilà. Deux livres, s’il vous plaît.' }, 'b', "Here we are. That's two pounds, please."],
      end: ['Goodbye!', { fr: 'Au revoir !' }], huh: ['Sorry?', { fr: 'Pardon ?' }] },
      opts: {
        a: [{ t: 'A toothbrush, please.', tc: 'Have you got a toothbrush, please?', tr: { fr: 'Une brosse à dents, s’il vous plaît.' }, trc: { fr: 'Vous avez une brosse à dents, s’il vous plaît ?' }, to: 'o2' },
            { t: 'A croissant, please.', tr: { fr: 'Un croissant, s’il vous plaît.' }, to: 'start', reply: ['Ha ha! This is a pharmacy!', { fr: 'Ha ha ! Ici, c’est une pharmacie !' }], tip: { fr: 'Une brosse à dents se dit « a toothbrush ».' } }],
        b: [{ t: 'Here you are.', tr: { fr: 'Voilà.' }, need: 'coins2', flag: 'brush', to: 'END', reply: ['Thank you! Goodbye!', { fr: 'Merci ! Au revoir !' }] },
            { t: 'Sorry, I have no money.', tr: { fr: 'Désolé, je n’ai pas d’argent.' }, to: 'END', reply: ['No problem. Come back later!', { fr: 'Pas de souci. Revenez plus tard !' }] }]
      } },
    jones: { nodes: {
      start: ['Hello. What happened?', { fr: 'Bonjour. Qu’est-ce qui s’est passé ?' }, 'a', 'Hello there. Is everything all right?'],
      j2: ['What colour is it?', { fr: 'De quelle couleur est-elle ?' }, 'b', 'I see. Can you describe it? What colour is it?'],
      j3: ['Is it big or small?', { fr: 'Elle est grande ou petite ?' }, 'c'],
      j4: ["What's your name?", { fr: 'Comment tu t’appelles ?' }, 'd', 'Right. And your name, please?'],
      j5: ['Can you spell it, please?', { fr: 'Tu peux l’épeler, s’il te plaît ?' }, 'e'],
      j6: ['Thank you. Your number is two, four, seven.', { fr: 'Merci. Ton numéro de dossier est le 247.' }, 'f', "Thank you. Your crime number is two-four-seven. Don't lose it!"],
      end: ['Good luck!', { fr: 'Bonne chance !' }], huh: ['Sorry?', { fr: 'Pardon ?' }] },
      opts: {
        a: [{ t: 'A man took my suitcase.', tc: 'Someone stole my suitcase by the fountain.', tr: { fr: 'Un homme a pris ma valise.' }, trc: { fr: 'Quelqu’un a volé ma valise près de la fontaine.' }, to: 'j2' },
            { t: "I'm hungry.", tr: { fr: 'J’ai faim.' }, to: 'start', reply: ['Sorry? What happened?', { fr: 'Pardon ? Qu’est-ce qui s’est passé ?' }] }],
        b: [{ t: "It's red.", tr: { fr: 'Elle est rouge.' }, to: 'j3' }, { t: "It's blue.", tr: { fr: 'Elle est bleue.' }, to: 'j2', reply: ['Blue? Are you sure?', { fr: 'Bleue ? Tu es sûr ?' }], tip: { fr: 'Ta valise est rouge : « It’s red ».' } }],
        c: [{ t: 'Big.', tc: "It's quite big.", tr: { fr: 'Grande.' }, to: 'j4' }, { t: 'Small.', tr: { fr: 'Petite.' }, to: 'j4' }],
        d: [{ t: 'My name is {n}.', tr: { fr: 'Je m’appelle {n}.' }, to: 'j5' }],
        e: [{ t: '{sp}', tr: { fr: '(ton prénom, lettre par lettre)' }, to: 'j6' }, { t: '{sw}', tr: { fr: '(lettres dans le désordre)' }, to: 'j5', reply: ['Sorry? Again, please.', { fr: 'Pardon ? Encore, s’il te plaît.' }], tip: { fr: 'Épelle ton prénom lettre par lettre, dans l’ordre.' } }],
        f: [{ t: 'Two, four, seven. Thank you!', tr: { fr: 'Deux, quatre, sept. Merci !' }, flag: 'police', to: 'END', reply: ['Good luck!', { fr: 'Bonne chance !' }] },
            { t: 'Two, seven, four?', tr: { fr: 'Deux, sept, quatre ?' }, to: 'j6', reply: ['No: two, four, seven.', { fr: 'Non : deux, quatre, sept.' }] }]
      } },
    operator: { nodes: {
      start: ['Operator. Can I help you?', { fr: 'Standard. Je peux vous aider ?' }, 'a', 'Operator speaking. How can I help?'],
      o2: ['Your name, please?', { fr: 'Votre nom, s’il vous plaît ?' }, 'b'],
      o3: ['Thank you. Hold the line, please.', { fr: 'Merci. Ne quittez pas.' }, 'c'],
      end: ['Connecting you now.', { fr: 'Je vous mets en relation.' }], huh: ['Sorry, caller?', { fr: 'Pardon ?' }] },
      opts: {
        a: [{ t: 'I want to call France, please.', tc: "I'd like to make a reverse-charge call to France, please.", tr: { fr: 'Je veux appeler la France, s’il vous plaît.' }, trc: { fr: 'Je voudrais appeler la France en PCV, s’il vous plaît.' }, to: 'o2' }],
        b: [{ t: 'My name is {n}.', tr: { fr: 'Je m’appelle {n}.' }, to: 'o3' }],
        c: [{ t: 'OK. Thank you.', tr: { fr: 'D’accord. Merci.' }, to: 'END', flag: 'call', reply: ['Connecting you now.', { fr: 'Je vous mets en relation.' }] }]
      } },
    maya: { nodes: {
      start: ["Hi! You're Arthur's grandchild? Everybody knows!", { fr: 'Salut ! Tu es le petit-enfant d’Arthur ? Tout le monde le sait !' }, 'a', "Hi! You must be Arthur's grandchild. The whole town's talking about you!"],
      m2: ['Mr Pemberton talked about you at the café yesterday. I have a photo!', { fr: 'Mr Pemberton a parlé de toi au café hier. J’ai une photo !' }, 'b', 'Mr Pemberton told the whole café yesterday. Look, I took a photo!'],
      end: ['Bye!', { fr: 'Salut !' }], huh: ['Sorry?', { fr: 'Pardon ?' }] },
      opts: {
        a: [{ t: 'Everybody? How?', tc: 'Everybody? How come?', tr: { fr: 'Tout le monde ? Comment ?' }, to: 'm2' }],
        b: [{ t: 'Can I see the photo?', tc: 'Really? Can I have a look?', tr: { fr: 'Je peux voir la photo ?' }, trc: { fr: 'C’est vrai ? Je peux regarder ?' }, to: 'END', flag: 'photo', reply: ["Here! Look, he's talking to a man in a yellow coat.", { fr: 'Tiens ! Regarde, il parle à un homme en ciré jaune.' }, "Here. See? He's chatting to some lad in a yellow raincoat."] }]
      } },
    pemberton: { nodes: {
      start: ["Hello! You're Arthur's grandchild. I'm the solicitor.", { fr: 'Bonjour ! Tu es le petit-enfant d’Arthur. Je suis le notaire.' }, 'a', "How do you do? You must be Arthur's grandchild. Pemberton, the family solicitor. Dreadful business, your suitcase."],
      p2: ['Me? No! I never talk about my clients!', { fr: 'Moi ? Non ! Je ne parle jamais de mes clients !' }, 'b', 'Me? Certainly not! I never discuss my clients.'],
      p3: ['Oh… Well… Yes, I talked at the café. A young man in a yellow coat listened.', { fr: 'Oh… Eh bien… Oui, j’ai parlé au café. Un jeune homme en ciré jaune écoutait.' }, 'c', 'Ah. Well… I may have mentioned it at the café. There was a young man in a yellow raincoat, hanging on every word.'],
      end: ['Good day!', { fr: 'Bonne journée !' }], huh: ['I beg your pardon?', { fr: 'Pardon ?' }] },
      opts: {
        a: [{ t: 'Did you tell people I was coming?', tc: 'Did you tell anyone I was arriving today?', tr: { fr: 'Tu as dit aux gens que j’arrivais ?' }, trc: { fr: 'Vous avez dit à quelqu’un que j’arrivais aujourd’hui ?' }, to: 'p2' }],
        b: [{ t: 'Look at this photo.', tc: 'Then how do you explain this photo?', tr: { fr: '📷 Regarde cette photo.' }, trc: { fr: '📷 Alors comment expliquez-vous cette photo ?' }, need: 'photo', to: 'p3' },
            { t: 'OK, sorry.', tr: { fr: 'D’accord, pardon.' }, to: 'END', flag: 'lied', reply: ['Good day!', { fr: 'Bonne journée !' }] }],
        c: [{ t: "A yellow coat? That's the thief!", tc: "A yellow raincoat? That's the man who stole my suitcase!", tr: { fr: 'Un ciré jaune ? C’est le voleur !' }, trc: { fr: 'Un ciré jaune ? C’est l’homme qui a volé ma valise !' }, to: 'END', flag: 'truth', reply: ["Oh dear! I'm so sorry!", { fr: 'Oh là là ! Je suis vraiment désolé !' }, "Good heavens… I'm terribly sorry."] }]
      } }
  }
};
