/* Contenu : mots, dialogues et textes d'interface. t = langue apprise (en|pl), ui = langue de l'utilisateur (fr|pl). */
window.PV = {};

/* ---------- Mots : forme dans chaque langue + phrase d'exemple dans chaque langue ---------- */
PV.WORDS = {
 baguette:{en:'baguette',pl:'bagietka',fr:'baguette',ex:{en:"I'd like a baguette, please.",pl:'Poproszę bagietkę.',fr:"Je voudrais une baguette, s'il vous plaît."}},
 croissant:{en:'croissant',pl:'rogalik',fr:'croissant',ex:{en:'These croissants are still warm.',pl:'Te rogaliki są jeszcze ciepłe.',fr:'Ces croissants sont encore chauds.'}},
 loaf:{en:'loaf of bread',pl:'bochenek chleba',fr:'miche de pain',ex:{en:'Can I have a loaf of bread?',pl:'Poproszę bochenek chleba.',fr:'Je peux avoir une miche de pain ?'}},
 cake:{en:'cake',pl:'tort',fr:'gâteau',ex:{en:"It's a birthday cake.",pl:'To jest tort urodzinowy.',fr:"C'est un gâteau d'anniversaire."}},
 cupcake:{en:'cupcake',pl:'babeczka',fr:'petit gâteau',ex:{en:'This cupcake has a cherry on top.',pl:'Ta babeczka ma wisienkę na górze.',fr:'Ce petit gâteau a une cerise dessus.'}},
 doughnut:{en:'doughnut',pl:'pączek',fr:'beignet',ex:{en:"I'll have a doughnut, please.",pl:'Poproszę pączka.',fr:'Je vais prendre un beignet, s\'il vous plaît.'}},
 oven:{en:'oven',pl:'piec',fr:'four',ex:{en:'The bread is in the oven.',pl:'Chleb jest w piecu.',fr:'Le pain est dans le four.'}},
 till:{en:'till',pl:'kasa',fr:'caisse',ex:{en:'Please pay at the till.',pl:'Proszę zapłacić przy kasie.',fr:'Merci de payer à la caisse.'}},
 counter:{en:'counter',pl:'lada',fr:'comptoir',ex:{en:'The baker is behind the counter.',pl:'Piekarz stoi za ladą.',fr:'Le boulanger est derrière le comptoir.'}},
 case:{en:'display case',pl:'witryna',fr:'vitrine',ex:{en:'The pastries are in the display case.',pl:'Ciastka są w witrynie.',fr:'Les viennoiseries sont dans la vitrine.'}},
 shelf:{en:'shelf',pl:'półka',fr:'étagère',ex:{en:'The bread is on the shelf.',pl:'Chleb jest na półce.',fr:"Le pain est sur l'étagère."}},
 rollingpin:{en:'rolling pin',pl:'wałek do ciasta',fr:'rouleau à pâtisserie',ex:{en:'He uses a rolling pin for the dough.',pl:'Używa wałka do ciasta.',fr:'Il utilise un rouleau pour la pâte.'}},
 flour:{en:'flour',pl:'mąka',fr:'farine',ex:{en:'A big bag of flour.',pl:'Duży worek mąki.',fr:'Un gros sac de farine.'}},
 chalkboard:{en:'chalkboard',pl:'tablica',fr:'ardoise',ex:{en:'The prices are on the chalkboard.',pl:'Ceny są na tablicy.',fr:"Les prix sont sur l'ardoise."}},
 window:{en:'window',pl:'okno',fr:'fenêtre',ex:{en:'The sun comes through the window.',pl:'Słońce wpada przez okno.',fr:'Le soleil entre par la fenêtre.'}},
 door:{en:'door',pl:'drzwi',fr:'porte',ex:{en:'Can you close the door, please?',pl:'Czy możesz zamknąć drzwi?',fr:"Tu peux fermer la porte, s'il te plaît ?"}},
 lamp:{en:'lamp',pl:'lampa',fr:'lampe',ex:{en:'The lamps are on.',pl:'Lampy są włączone.',fr:'Les lampes sont allumées.'}},
 basket:{en:'basket',pl:'koszyk',fr:'panier',ex:{en:'The baguettes are in a basket.',pl:'Bagietki są w koszyku.',fr:'Les baguettes sont dans un panier.'}},
 table:{en:'table',pl:'stół',fr:'table',ex:{en:"Let's sit at the table.",pl:'Usiądźmy przy stole.',fr:'Asseyons-nous à la table.'}},
 chair:{en:'chair',pl:'krzesło',fr:'chaise',ex:{en:'Is this chair free?',pl:'Czy to krzesło jest wolne?',fr:'Cette chaise est libre ?'}},
 cup:{en:'cup',pl:'filiżanka',fr:'tasse',ex:{en:'A cup of tea, please.',pl:'Poproszę filiżankę herbaty.',fr:"Une tasse de thé, s'il vous plaît."}},
 baker:{en:'baker',pl:'piekarz',fr:'boulanger',ex:{en:'Tom is the baker.',pl:'Tom jest piekarzem.',fr:'Tom est le boulanger.'}}
};
/* petites notes par langue apprise, écrites dans la langue de l'utilisateur */
PV.NOTES = {
 en:{
  croissant:{fr:"Même mot qu'en français, mais prononcé à l'anglaise.",pl:'Po angielsku wymowa jest inna niż po polsku.'},
  flour:{fr:'Se prononce exactement comme « flower » (fleur).',pl:'Wymawia się tak samo jak „flower” (kwiat).'},
  till:{fr:'En anglais américain : cash register.',pl:'W amerykańskim angielskim: cash register.'},
  shelf:{fr:'Pluriel : shelves.',pl:'Liczba mnoga: shelves.'},
  loaf:{fr:'Pluriel : two loaves.',pl:'Liczba mnoga: two loaves.'}
 },
 pl:{
  door:{fr:'« Drzwi » est toujours au pluriel, même pour une seule porte.'},
  cake:{fr:'« Tort » = gâteau de fête. Un gâteau simple se dit « ciasto ».'},
  doughnut:{fr:'Le pączek est la star du « Tłusty Czwartek », le jeudi gras.'},
  croissant:{fr:'On dit aussi « croissant » en Pologne, mais « rogalik » est plus courant.'}
 }
};

/* ---------- Décor : le même pour toutes les langues (pictogrammes, prix en euros) ---------- */
PV.BOARD = { rows: [['croissant', '1,20 €'], ['baguette', '2,10 €'], ['loaf', '2,80 €'], ['doughnut', '1,50 €'], ['cupcake', '1,80 €']] };
PV.SCENE = {
 en: { board: { rows: [['croissant', '£1.20'], ['baguette', '£2.10'], ['loaf', '£2.80'], ['doughnut', '£1.50'], ['cupcake', '£1.80']] }, open: '', flour: '', voice: 'en-GB', baker: 'Tom', shop: '' },
 pl: { board: { rows: [['croissant', '3 zł'], ['baguette', '4 zł'], ['loaf', '6 zł'], ['doughnut', '3 zł'], ['cupcake', '5 zł']] }, open: '', flour: '', voice: 'pl-PL', baker: 'Tom', shop: '' }
};

/* ---------- Dialogues : [réplique, {fr, pl}] ---------- */
PV.DLG = {
 en:{
  nodes:{
   start:['Good morning! Welcome to my bakery. What can I get you?',{fr:"Bonjour ! Bienvenue dans ma boulangerie. Qu'est-ce que je vous sers ?",pl:'Dzień dobry! Witam w mojej piekarni. Co podać?'},'order'],
   start2:['So, what would you like?',{fr:"Alors, qu'est-ce qui vous ferait plaisir ?",pl:'To co podać?'},'order'],
   more:['Of course. Two croissants and a baguette. Anything else?',{fr:'Bien sûr. Deux croissants et une baguette. Autre chose ?',pl:'Oczywiście. Dwa rogaliki i bagietka. Coś jeszcze?'},'more'],
   more2:['Anything else?',{fr:'Autre chose ?',pl:'Coś jeszcze?'},'more'],
   price:["That's four pounds fifty, please.",{fr:"Ça fait quatre livres cinquante, s'il vous plaît.",pl:'Razem cztery funty pięćdziesiąt.'},'pay'],
   price2:["It's four pounds fifty, please.",{fr:"C'est quatre livres cinquante, s'il vous plaît.",pl:'Cztery funty pięćdziesiąt, proszę.'},'pay'],
   change:["Thank you! Here's your change: fifty pence. Have a lovely day!",{fr:'Merci ! Voici votre monnaie : cinquante pence. Bonne journée !',pl:'Dziękuję! Pięćdziesiąt pensów reszty. Miłego dnia!'},'bye'],
   end:['Bye! See you tomorrow!',{fr:'Au revoir ! À demain !',pl:'Do widzenia! Do jutra!'}],
   huh:['Sorry? I didn\'t catch that.',{fr:"Pardon ? Je n'ai pas compris.",pl:'Przepraszam? Nie zrozumiałem.'}]
  },
  opts:{
   order:[
    {t:'Two croissants and a baguette, please.',tr:{fr:"Deux croissants et une baguette, s'il vous plaît.",pl:'Poproszę dwa rogaliki i bagietkę.'},to:'more',task:'order'},
    {t:'I want bread. Give.',tr:{fr:'Je veux pain. Donne.',pl:'Chcę chleb. Daj.'},to:'start2',reply:['Sorry? Could you say that again, please?',{fr:"Pardon ? Vous pouvez répéter, s'il vous plaît ?",pl:'Przepraszam? Może pan powtórzyć?'}],tip:{fr:'Pour commander poliment : « … please » ou « Can I have … ? ».',pl:'Żeby grzecznie zamówić: „… please” albo „Can I have…?”.'}},
    {t:'Good night!',tr:{fr:'Bonne nuit !',pl:'Dobranoc!'},to:'start2',reply:["Ha ha! Good night? It's nine in the morning!",{fr:'Ha ha ! Bonne nuit ? Il est neuf heures du matin !',pl:'Ha ha! Dobranoc? Jest dziewiąta rano!'}],tip:{fr:'« Good night » se dit le soir pour se quitter. Le matin : « Good morning ».',pl:'„Good night” mówi się wieczorem na pożegnanie. Rano: „Good morning”.'}}
   ],
   more:[
    {t:"No, thank you. That's all.",tr:{fr:"Non merci, c'est tout.",pl:'Nie, dziękuję. To wszystko.'},to:'price'},
    {t:'How much is a doughnut?',tr:{fr:'Combien coûte un beignet ?',pl:'Ile kosztuje pączek?'},to:'more2',reply:['A doughnut is one pound fifty.',{fr:"Un beignet, c'est une livre cinquante.",pl:'Pączek kosztuje funta pięćdziesiąt.'}]},
    {t:'Can I have that cake, please?',tr:{fr:"Je peux avoir ce gâteau, s'il vous plaît ?",pl:'Czy mogę prosić ten tort?'},to:'more2',reply:['Sorry, that cake is for a birthday order.',{fr:"Désolé, ce gâteau est pour une commande d'anniversaire.",pl:'Przykro mi, ten tort jest na zamówienie urodzinowe.'}]}
   ],
   pay:[
    {t:"Here's four pounds.",tr:{fr:'Voici quatre livres.',pl:'Proszę, cztery funty.'},to:'price2',reply:["Hmm, that's only four pounds. It's four pounds fifty.",{fr:"Hmm, ça ne fait que quatre livres. C'est quatre livres cinquante.",pl:'Hmm, to tylko cztery funty. Razem cztery funty pięćdziesiąt.'}],tip:{fr:"Regarde l'ardoise : 2 × £1.20 + £2.10 = £4.50.",pl:'Spójrz na tablicę: 2 × £1.20 + £2.10 = £4.50.'}},
    {t:"Here's five pounds.",tr:{fr:'Voici cinq livres.',pl:'Proszę, pięć funtów.'},to:'change',task:'pay'},
    {t:'Sorry, how much?',tr:{fr:'Pardon, combien ?',pl:'Przepraszam, ile?'},to:'price2',reply:['Four pounds fifty.',{fr:'Quatre livres cinquante.',pl:'Cztery funty pięćdziesiąt.'}]}
   ],
   bye:[
    {t:'Thanks, you too! Goodbye!',tr:{fr:'Merci, vous aussi ! Au revoir !',pl:'Dzięki, nawzajem! Do widzenia!'},to:'END'},
    {t:'Bye!',tr:{fr:'Salut !',pl:'Cześć!'},to:'END'}
   ]
  }
 },
 pl:{
  nodes:{
   start:['Dzień dobry! Witam w mojej piekarni. Co podać?',{fr:"Bonjour ! Bienvenue dans ma boulangerie. Qu'est-ce que je vous sers ?"},'order'],
   start2:['To co podać?',{fr:"Alors, qu'est-ce que je vous sers ?"},'order'],
   more:['Oczywiście. Dwa rogaliki i bagietka. Coś jeszcze?',{fr:'Bien sûr. Deux croissants et une baguette. Autre chose ?'},'more'],
   more2:['Coś jeszcze?',{fr:'Autre chose ?'},'more'],
   price:['Razem dziesięć złotych.',{fr:'Ça fait dix złotys.'},'pay'],
   price2:['Dziesięć złotych, proszę.',{fr:"Dix złotys, s'il vous plaît."},'pay'],
   change:['Dziękuję! Dziesięć złotych reszty. Miłego dnia!',{fr:'Merci ! Dix złotys de monnaie. Bonne journée !'},'bye'],
   end:['Do widzenia! Do jutra!',{fr:'Au revoir ! À demain !'}],
   huh:['Przepraszam? Nie zrozumiałem.',{fr:"Pardon ? Je n'ai pas compris."}]
  },
  opts:{
   order:[
    {t:'Poproszę dwa rogaliki i bagietkę.',tr:{fr:"Deux croissants et une baguette, s'il vous plaît."},to:'more',task:'order'},
    {t:'Chcę chleb. Daj.',tr:{fr:'Je veux pain. Donne.'},to:'start2',reply:['Przepraszam? Może pan powtórzyć?',{fr:'Pardon ? Vous pouvez répéter ?'}],tip:{fr:'Pour commander poliment : « Poproszę… » (je voudrais…).'}},
    {t:'Dobranoc!',tr:{fr:'Bonne nuit !'},to:'start2',reply:['Ha ha! Dobranoc? Jest dziewiąta rano!',{fr:'Ha ha ! Bonne nuit ? Il est neuf heures du matin !'}],tip:{fr:'« Dobranoc » se dit le soir. Le matin : « Dzień dobry ».'}}
   ],
   more:[
    {t:'Nie, dziękuję. To wszystko.',tr:{fr:"Non merci, c'est tout."},to:'price'},
    {t:'Ile kosztuje pączek?',tr:{fr:'Combien coûte un beignet ?'},to:'more2',reply:['Pączek kosztuje trzy złote.',{fr:'Un beignet coûte trois złotys.'}]},
    {t:'Czy mogę prosić ten tort?',tr:{fr:'Je peux avoir ce gâteau ?'},to:'more2',reply:['Przykro mi, ten tort jest na zamówienie.',{fr:'Désolé, ce gâteau est une commande.'}]}
   ],
   pay:[
    {t:'Proszę, pięć złotych.',tr:{fr:'Voici cinq złotys.'},to:'price2',reply:['Hmm, to tylko pięć złotych. Razem dziesięć złotych.',{fr:"Hmm, ça ne fait que cinq złotys. C'est dix złotys."}],tip:{fr:"Regarde l'ardoise : 2 × 3 zł + 4 zł = 10 zł."}},
    {t:'Proszę, dwadzieścia złotych.',tr:{fr:'Voici vingt złotys.'},to:'change',task:'pay'},
    {t:'Przepraszam, ile?',tr:{fr:'Pardon, combien ?'},to:'price2',reply:['Dziesięć złotych.',{fr:'Dix złotys.'}]}
   ],
   bye:[
    {t:'Dziękuję, nawzajem! Do widzenia!',tr:{fr:'Merci, vous aussi ! Au revoir !'},to:'END'},
    {t:'Cześć!',tr:{fr:'Salut !'},to:'END',tip:{fr:'« Cześć » est familier. Avec un commerçant, dis plutôt « Do widzenia ».'}}
   ]
  }
 }
};

/* ---------- Histoires lues à voix haute (textes originaux) ---------- */
PV.STORIES = {
 en: [
  { id: 'morning', icon: 'sun', bg: '#f3b45a', title: "Tom's early morning", tr: { fr: 'Le petit matin de Tom', pl: 'Poranek Toma' }, min: 2, s: [
   ['It is five o\'clock in the morning.', { fr: 'Il est cinq heures du matin.', pl: 'Jest piąta rano.' }],
   ['The town is quiet and dark.', { fr: 'La ville est calme et sombre.', pl: 'Miasto jest ciche i ciemne.' }],
   ['Tom opens the door of his bakery.', { fr: 'Tom ouvre la porte de sa boulangerie.', pl: 'Tom otwiera drzwi swojej piekarni.' }],
   ['He turns on the lamps and the big oven.', { fr: 'Il allume les lampes et le grand four.', pl: 'Włącza lampy i duży piec.' }],
   ['Then he takes flour, water and salt.', { fr: "Ensuite, il prend de la farine, de l'eau et du sel.", pl: 'Potem bierze mąkę, wodę i sól.' }],
   ['He makes the dough with his hands.', { fr: 'Il fait la pâte avec ses mains.', pl: 'Robi ciasto rękami.' }],
   ['At seven o\'clock, the bread is ready.', { fr: 'À sept heures, le pain est prêt.', pl: 'O siódmej chleb jest gotowy.' }],
   ['The whole street smells of warm croissants.', { fr: 'Toute la rue sent les croissants chauds.', pl: 'Cała ulica pachnie ciepłymi rogalikami.' }],
   ['The first customer is a little girl.', { fr: 'La première cliente est une petite fille.', pl: 'Pierwszą klientką jest mała dziewczynka.' }],
   ['"One croissant, please!" she says with a big smile.', { fr: '« Un croissant, s\'il vous plaît ! » dit-elle avec un grand sourire.', pl: '„Poproszę rogalika!” – mówi z szerokim uśmiechem.' }]
  ] },
  { id: 'umbrella', icon: 'umbrella', bg: '#7fa7d9', title: 'The lost umbrella', tr: { fr: 'Le parapluie perdu', pl: 'Zgubiony parasol' }, min: 2, s: [
   ['It is raining in Petite Ville.', { fr: 'Il pleut à Petite Ville.', pl: 'W Petite Ville pada deszcz.' }],
   ['Anna runs into the bakery.', { fr: 'Anna entre en courant dans la boulangerie.', pl: 'Anna wbiega do piekarni.' }],
   ['Her hair is wet, and she is cold.', { fr: 'Ses cheveux sont mouillés et elle a froid.', pl: 'Ma mokre włosy i jest jej zimno.' }],
   ['"Oh no! Where is my umbrella?" she asks.', { fr: '« Oh non ! Où est mon parapluie ? » demande-t-elle.', pl: '„O nie! Gdzie jest mój parasol?” – pyta.' }],
   ['Tom looks under the table.', { fr: 'Tom regarde sous la table.', pl: 'Tom zagląda pod stół.' }],
   ['There is no umbrella under the table.', { fr: "Il n'y a pas de parapluie sous la table.", pl: 'Pod stołem nie ma parasola.' }],
   ['He looks behind the door. Nothing.', { fr: 'Il regarde derrière la porte. Rien.', pl: 'Zagląda za drzwi. Nic.' }],
   ['Then he laughs and points at the basket.', { fr: 'Puis il rit et montre le panier.', pl: 'Potem się śmieje i pokazuje koszyk.' }],
   ['The red umbrella is next to the baguettes!', { fr: 'Le parapluie rouge est à côté des baguettes !', pl: 'Czerwony parasol stoi obok bagietek!' }],
   ['"Thank you, Tom! Can I have a cup of tea, too?"', { fr: '« Merci, Tom ! Je peux aussi avoir une tasse de thé ? »', pl: '„Dziękuję, Tom! Czy mogę też prosić filiżankę herbaty?”' }]
  ] }
 ],
 pl: [
  { id: 'morning', icon: 'sun', bg: '#f3b45a', title: 'Poranek Toma', tr: { fr: 'Le petit matin de Tom' }, min: 2, s: [
   ['Jest piąta rano.', { fr: 'Il est cinq heures du matin.' }],
   ['Miasto jest ciche i ciemne.', { fr: 'La ville est calme et sombre.' }],
   ['Tom otwiera drzwi piekarni.', { fr: 'Tom ouvre la porte de la boulangerie.' }],
   ['Włącza lampy i duży piec.', { fr: 'Il allume les lampes et le grand four.' }],
   ['Potem bierze mąkę, wodę i sól.', { fr: "Ensuite, il prend de la farine, de l'eau et du sel." }],
   ['Robi ciasto rękami.', { fr: 'Il fait la pâte avec ses mains.' }],
   ['O siódmej chleb jest gotowy.', { fr: 'À sept heures, le pain est prêt.' }],
   ['Cała ulica pachnie ciepłymi pączkami.', { fr: 'Toute la rue sent les beignets chauds.' }],
   ['Pierwszą klientką jest mała dziewczynka.', { fr: 'La première cliente est une petite fille.' }],
   ['„Poproszę pączka!” – mówi z uśmiechem.', { fr: '« Un beignet, s\'il vous plaît ! » dit-elle en souriant.' }]
  ] },
  { id: 'umbrella', icon: 'umbrella', bg: '#7fa7d9', title: 'Zgubiony parasol', tr: { fr: 'Le parapluie perdu' }, min: 2, s: [
   ['W miasteczku pada deszcz.', { fr: 'Il pleut dans la petite ville.' }],
   ['Ania wbiega do piekarni.', { fr: 'Ania entre en courant dans la boulangerie.' }],
   ['Ma mokre włosy i jest jej zimno.', { fr: 'Ses cheveux sont mouillés et elle a froid.' }],
   ['„O nie! Gdzie jest mój parasol?” – pyta.', { fr: '« Oh non ! Où est mon parapluie ? » demande-t-elle.' }],
   ['Tom zagląda pod stół.', { fr: 'Tom regarde sous la table.' }],
   ['Pod stołem nie ma parasola.', { fr: "Il n'y a pas de parapluie sous la table." }],
   ['Zagląda za drzwi. Nic.', { fr: 'Il regarde derrière la porte. Rien.' }],
   ['Potem się śmieje i pokazuje koszyk.', { fr: 'Puis il rit et montre le panier.' }],
   ['Czerwony parasol stoi obok bagietek!', { fr: 'Le parapluie rouge est à côté des baguettes !' }],
   ['„Dziękuję! Czy mogę też prosić herbatę?”', { fr: '« Merci ! Je peux aussi avoir un thé ? »' }]
  ] }
 ]
};

/* ---------- Niveaux (seuils d'XP) et lieux de la ville ---------- */
PV.LEVELS = [0, 50, 150, 300, 500, 800, 1200, 1800];
PV.PLACES = [
 { id: 'bakery', key: 'placeBakery', status: 'open', color: '#f0a35e' },
 { id: 'cafe', key: 'placeCafe', status: 'plus', color: '#b07ad1' },
 { id: 'market', key: 'placeMarket', status: 'soon', color: '#6fbf8e' },
 { id: 'pharmacy', key: 'placePharmacy', status: 'soon', color: '#5fb3c9' },
 { id: 'post', key: 'placePost', status: 'soon', color: '#e8c24a' },
 { id: 'station', key: 'placeStation', status: 'soon', color: '#8a93c9' }
];

/* ---------- Interface ---------- */
PV.UI = {
 fr: {
  onbTitle: 'Bienvenue à Petite Ville', onbText: "Une petite ville où l'on apprend une langue en parlant à ses habitants.",
  learnQ: 'Je veux apprendre', learnSub: { en: 'La langue la plus demandée au monde', pl: 'Pour vivre ou voyager en Pologne' }, soonLangs: 'Bientôt : espagnol, français, allemand, italien…',
  enterTown: 'Entrer dans la ville', noAccNeeded: 'Pas besoin de compte pour essayer.',
  signupTitle: 'Sauvegarde ta progression', loginTitle: 'Content de te revoir',
  signupWhy: 'Retrouve tes mots et ta série sur tous tes appareils, et apparais au classement.',
  pseudo: 'Ton prénom ou pseudo', email: 'Email', password: 'Mot de passe (6 caractères min.)', speak: 'Je parle', learn: "J'apprends",
  create: 'Créer mon compte', login: 'Me connecter', haveAcc: "J'ai déjà un compte", noAcc: 'Créer un compte',
  checkMail: 'Compte créé. Confirme ton adresse avec le lien reçu par email, puis connecte-toi.',
  langs: { fr: 'Français', pl: 'Polski' }, learnLangs: { en: "L'anglais", pl: 'Le polonais' }, learnShort: { en: 'anglais', pl: 'polonais' },
  navTown: 'Ville', navStories: 'Histoires', navWords: 'Mots', navProgress: 'Progrès',
  mapTitle: 'Plan de la ville', mapSub: 'Chaque lieu a ses habitants, ses mots et ses missions.',
  placeBakery: 'La boulangerie', placeCafe: 'Le café de Rosie', placeMarket: 'Le marché', placePharmacy: 'La pharmacie', placePost: 'La poste', placeStation: 'La gare',
  placeStreet: 'Une ruelle de Londres', placeStreetSub: '3D photoréaliste · bêta',
  open: 'Ouvert', soon: 'Bientôt', plusTag: 'Petite Ville+', here: 'Tu es ici',
  mission: 'Mission', t_talk: 'Parle au boulanger', t_order: 'Commande 2 croissants et 1 baguette', t_pay: 'Paie le bon montant', t_words: 'Découvre 12 mots',
  found: 'Mots découverts', listen: 'Écouter', repeat: 'Répéter', save: 'Garder', saved: 'Gardé ✓',
  replay: 'Réécouter', translate: 'FR', you: 'Toi', listening: "Je t'écoute…", speakNow: 'Touche le micro et réponds à voix haute', orTap: 'Tu peux aussi toucher une réponse :',
  heard: 'Entendu', notUnderstood: "Je n'ai pas bien compris. Réessaie ou touche une réponse.",
  noMic: 'Le micro ne marche pas dans ce navigateur (essaie Chrome, Edge ou Safari). Touche une réponse.',
  micDenied: 'Autorise le micro pour parler à {b}.',
  pronGood: 'Bien prononcé !', pronClose: 'Presque. On a entendu : « {h} »',
  voiceNote: 'Voix générée par ton navigateur pour ce test.',
  wordsTitle: 'Mes mots', wordsSub: 'Les mots que tu as gardés reviennent au bon moment pour ne pas les oublier.',
  review: 'Réviser', reveal: 'Voir la réponse', knew: 'Je savais', again: 'À revoir', due: 'à revoir',
  noCards: "Aucun mot gardé pour l'instant. Dans la ville, touche un objet puis « Garder ».", howSay: 'Comment dit-on…', reviewDone: "Révision terminée pour aujourd'hui. Reviens demain !", dueN: '{n} à revoir aujourd\'hui',
  storiesTitle: 'Histoires', storiesSub: 'De courtes histoires lues à voix haute, mot à mot. Touche une phrase pour la traduire.',
  beginner: 'Débutant', minRead: '{n} min', readDone: 'Lu', play: 'Écouter', pause: 'Pause', slow: 'Plus lent', back: 'Retour',
  storyDone: 'Histoire terminée ! +20 XP', tapHint: 'Touche une phrase pour voir la traduction.',
  progTitle: 'Tes progrès', goalTitle: 'Objectif du jour', minUnit: 'min', goalPick: 'Mon objectif quotidien', goalDone: 'Objectif du jour atteint ! +20 XP',
  streakTitle: 'jours d\'affilée', streakHint: 'Reviens chaque jour pour garder ta flamme.',
  quizTitle: 'Quiz du jour', quizQ: 'Que veut dire « {w} » ?', quizOk: 'Bravo ! +15 XP', quizNo: 'Raté ! La bonne réponse : {a}', quizDone: 'Reviens demain pour un nouveau quiz.',
  boardTitle: 'Classement du mois', boardEmpty: 'Personne encore ce mois-ci. Sois le premier !', boardGuest: 'Crée un compte pour apparaître au classement.', boardLoading: 'Chargement…',
  accTitle: 'Ton compte', guestTxt: 'Tu joues en invité : ta progression reste sur cet appareil.', saveProg: 'Sauvegarder ma progression', loggedAs: 'Connecté : {e}', logout: 'Me déconnecter',
  langTitle: 'Langues', saveLang: 'Changer',
  levelNames: ['Visiteur', 'Promeneur', 'Voisin', 'Habitué', 'Ami du quartier', 'Figure locale', 'Pilier de la ville', "Maire d'honneur"],
  level: 'Niv.', nextLevel: 'Encore {n} XP pour devenir {l}', maxLevel: 'Niveau maximum atteint !',
  wordsLearned: 'mots découverts', storiesRead: 'histoires lues', missionsDone: 'missions réussies',
  introTitle: 'Bienvenue chez Tom, le boulanger', introText: 'Ici, tout se passe en {l}. Touche les objets pour apprendre leur nom, puis fais tes courses en parlant à {b}.',
  step1: 'Touche un objet pour entendre son nom', step2: 'Fais glisser pour regarder autour de toi', step3: 'Touche {b} et réponds-lui à voix haute', enter: "C'est parti",
  winTitle: "Tu l'as fait, en {l}.", winText: '{b} a souri. Demain, il se souviendra de toi.',
  wWords: 'mots découverts', wSpoken: 'phrases dites à voix haute', wXp: 'XP gagnés',
  palette: 'Couleurs', nextScene: 'La suite : le café de Rosie', plus: 'Avec Petite Ville+ · 10 € par an · toutes les scènes (maquette, aucun paiement)',
  againBtn: 'Rejouer', continueBtn: 'Continuer', close: 'Fermer',
  errGeneric: 'Une erreur est survenue : ', errFields: 'Remplis tous les champs.', accSaved: 'Compte créé, progression sauvegardée !',
  xpWord: '+5 XP · nouveau mot', xpMission: '+50 XP · mission réussie', xpPron: '+10 XP · bonne prononciation', xpSpoken: '+5 XP · phrase dite', levelUp: 'Nouveau niveau : {l} !'
 },
 pl: {
  onbTitle: 'Witaj w Petite Ville', onbText: 'Małe miasteczko, w którym uczysz się języka, rozmawiając z mieszkańcami.',
  learnQ: 'Chcę się uczyć', learnSub: { en: 'Najpopularniejszy język świata', pl: 'Do życia lub podróży w Polsce' }, soonLangs: 'Wkrótce: hiszpański, francuski, niemiecki, włoski…',
  enterTown: 'Wejdź do miasteczka', noAccNeeded: 'Nie potrzebujesz konta, żeby spróbować.',
  signupTitle: 'Zapisz swoje postępy', loginTitle: 'Miło cię znowu widzieć',
  signupWhy: 'Miej swoje słowa i serię na wszystkich urządzeniach i pojaw się w rankingu.',
  pseudo: 'Imię lub pseudonim', email: 'E-mail', password: 'Hasło (min. 6 znaków)', speak: 'Mówię po', learn: 'Uczę się',
  create: 'Załóż konto', login: 'Zaloguj się', haveAcc: 'Mam już konto', noAcc: 'Załóż konto',
  checkMail: 'Konto założone. Potwierdź adres e-mail linkiem z wiadomości, a potem się zaloguj.',
  langs: { fr: 'Français', pl: 'Polski' }, learnLangs: { en: 'Angielski', pl: 'Polski' }, learnShort: { en: 'angielski', pl: 'polski' },
  navTown: 'Miasto', navStories: 'Historie', navWords: 'Słowa', navProgress: 'Postępy',
  mapTitle: 'Plan miasteczka', mapSub: 'Każde miejsce ma swoich mieszkańców, słowa i misje.',
  placeBakery: 'Piekarnia', placeCafe: 'Kawiarnia Rosie', placeMarket: 'Targ', placePharmacy: 'Apteka', placePost: 'Poczta', placeStation: 'Dworzec',
  placeStreet: 'Uliczka w Londynie', placeStreetSub: 'Fotorealistyczne 3D · beta',
  open: 'Otwarte', soon: 'Wkrótce', plusTag: 'Petite Ville+', here: 'Jesteś tutaj',
  mission: 'Misja', t_talk: 'Porozmawiaj z piekarzem', t_order: 'Zamów 2 rogaliki i 1 bagietkę', t_pay: 'Zapłać właściwą kwotę', t_words: 'Odkryj 12 słów',
  found: 'Odkryte słowa', listen: 'Posłuchaj', repeat: 'Powtórz', save: 'Zachowaj', saved: 'Zachowane ✓',
  replay: 'Powtórz', translate: 'PL', you: 'Ty', listening: 'Słucham…', speakNow: 'Dotknij mikrofonu i odpowiedz na głos', orTap: 'Możesz też wybrać odpowiedź:',
  heard: 'Usłyszano', notUnderstood: 'Nie zrozumiałem. Spróbuj jeszcze raz albo wybierz odpowiedź.',
  noMic: 'Mikrofon nie działa w tej przeglądarce (spróbuj Chrome, Edge albo Safari). Wybierz odpowiedź.',
  micDenied: 'Zezwól na mikrofon, żeby rozmawiać z {b}.',
  pronGood: 'Świetna wymowa!', pronClose: 'Prawie. Usłyszano: „{h}”',
  voiceNote: 'Głos generuje przeglądarka (wersja testowa).',
  wordsTitle: 'Moje słowa', wordsSub: 'Zachowane słowa wracają we właściwym momencie, żebyś ich nie zapomniał.',
  review: 'Powtórka', reveal: 'Pokaż odpowiedź', knew: 'Wiedziałem', again: 'Jeszcze raz', due: 'do powtórki',
  noCards: 'Na razie brak słów. W miasteczku dotknij przedmiotu, a potem „Zachowaj”.', howSay: 'Jak powiedzieć…', reviewDone: 'Powtórka na dziś skończona. Wróć jutro!', dueN: '{n} do powtórki dzisiaj',
  storiesTitle: 'Historie', storiesSub: 'Krótkie historie czytane na głos, słowo po słowie. Dotknij zdania, żeby je przetłumaczyć.',
  beginner: 'Początkujący', minRead: '{n} min', readDone: 'Przeczytane', play: 'Słuchaj', pause: 'Pauza', slow: 'Wolniej', back: 'Wróć',
  storyDone: 'Historia skończona! +20 XP', tapHint: 'Dotknij zdania, żeby zobaczyć tłumaczenie.',
  progTitle: 'Twoje postępy', goalTitle: 'Cel dnia', minUnit: 'min', goalPick: 'Mój dzienny cel', goalDone: 'Cel dnia osiągnięty! +20 XP',
  streakTitle: 'dni z rzędu', streakHint: 'Wracaj codziennie, żeby nie zgasić płomyka.',
  quizTitle: 'Quiz dnia', quizQ: 'Co znaczy „{w}”?', quizOk: 'Brawo! +15 XP', quizNo: 'Niestety! Poprawna odpowiedź: {a}', quizDone: 'Wróć jutro po nowy quiz.',
  boardTitle: 'Ranking miesiąca', boardEmpty: 'W tym miesiącu jeszcze nikogo. Bądź pierwszy!', boardGuest: 'Załóż konto, żeby pojawić się w rankingu.', boardLoading: 'Ładowanie…',
  accTitle: 'Twoje konto', guestTxt: 'Grasz jako gość: postępy zostają na tym urządzeniu.', saveProg: 'Zapisz moje postępy', loggedAs: 'Zalogowano: {e}', logout: 'Wyloguj się',
  langTitle: 'Języki', saveLang: 'Zmień',
  levelNames: ['Gość', 'Spacerowicz', 'Sąsiad', 'Stały bywalec', 'Przyjaciel dzielnicy', 'Lokalna postać', 'Filar miasteczka', 'Honorowy burmistrz'],
  level: 'Poz.', nextLevel: 'Jeszcze {n} XP do poziomu: {l}', maxLevel: 'Najwyższy poziom!',
  wordsLearned: 'odkryte słowa', storiesRead: 'przeczytane historie', missionsDone: 'zaliczone misje',
  introTitle: 'Witaj w piekarni Toma', introText: 'Tutaj wszystko dzieje się po {l}. Dotykaj przedmiotów, żeby poznać ich nazwy, a potem zrób zakupy, rozmawiając z: {b}.',
  step1: 'Dotknij przedmiotu, żeby usłyszeć nazwę', step2: 'Przeciągnij, żeby się rozejrzeć', step3: 'Dotknij: {b} i odpowiadaj na głos', enter: 'Zaczynamy',
  winTitle: 'Udało się, po {l}!', winText: '{b} się uśmiechnął. Jutro będzie cię pamiętał.',
  wWords: 'odkryte słowa', wSpoken: 'zdania na głos', wXp: 'zdobyte XP',
  palette: 'Kolory', nextScene: 'Dalej: kawiarnia Rosie', plus: 'W Petite Ville+ · 45 zł rocznie · wszystkie sceny (makieta, bez płatności)',
  againBtn: 'Jeszcze raz', continueBtn: 'Dalej', close: 'Zamknij',
  errGeneric: 'Wystąpił błąd: ', errFields: 'Wypełnij wszystkie pola.', accSaved: 'Konto założone, postępy zapisane!',
  xpWord: '+5 XP · nowe słowo', xpMission: '+50 XP · misja zaliczona', xpPron: '+10 XP · dobra wymowa', xpSpoken: '+5 XP · zdanie na głos', levelUp: 'Nowy poziom: {l}!'
 }
};
/* « tout se passe en … » */
PV.IN_LANG = { fr: { en: 'anglais', pl: 'polonais' }, pl: { en: 'angielsku', pl: 'polsku' } };

/* ---------- La place : mots de la ville ---------- */
Object.assign(PV.WORDS, {
 square:{en:'town square',pl:'rynek',fr:'place',ex:{en:"Let's meet in the town square.",pl:'Spotkajmy się na rynku.',fr:'Retrouvons-nous sur la place.'}},
 fountain:{en:'fountain',pl:'fontanna',fr:'fontaine',ex:{en:'The children play by the fountain.',pl:'Dzieci bawią się przy fontannie.',fr:'Les enfants jouent près de la fontaine.'}},
 townhall:{en:'town hall',pl:'ratusz',fr:'mairie',ex:{en:'The town hall has a big clock.',pl:'Ratusz ma duży zegar.',fr:'La mairie a une grande horloge.'}},
 clock:{en:'clock',pl:'zegar',fr:'horloge',ex:{en:'Look at the clock. We are late!',pl:'Spójrz na zegar. Jesteśmy spóźnieni!',fr:"Regarde l'horloge. On est en retard !"}},
 bakeryShop:{en:'bakery',pl:'piekarnia',fr:'boulangerie',ex:{en:'The bakery opens at seven.',pl:'Piekarnia otwiera się o siódmej.',fr:'La boulangerie ouvre à sept heures.'}},
 cafe:{en:'café',pl:'kawiarnia',fr:'café',ex:{en:'Rosie works in the café.',pl:'Rosie pracuje w kawiarni.',fr:'Rosie travaille au café.'}},
 pharmacy:{en:'pharmacy',pl:'apteka',fr:'pharmacie',ex:{en:'The pharmacy has a green cross.',pl:'Apteka ma zielony krzyż.',fr:'La pharmacie a une croix verte.'}},
 post:{en:'post office',pl:'poczta',fr:'poste',ex:{en:'I send a letter at the post office.',pl:'Wysyłam list na poczcie.',fr:"J'envoie une lettre à la poste."}},
 bookshop:{en:'bookshop',pl:'księgarnia',fr:'librairie',ex:{en:'I buy a book at the bookshop.',pl:'Kupuję książkę w księgarni.',fr:"J'achète un livre à la librairie."}},
 florist:{en:'flower shop',pl:'kwiaciarnia',fr:'fleuriste',ex:{en:'The flower shop sells roses.',pl:'W kwiaciarni są róże.',fr:'Le fleuriste vend des roses.'}},
 house:{en:'house',pl:'dom',fr:'maison',ex:{en:'My friend lives in the blue house.',pl:'Mój przyjaciel mieszka w niebieskim domu.',fr:'Mon ami habite dans la maison bleue.'}},
 tree:{en:'tree',pl:'drzewo',fr:'arbre',ex:{en:'The tree is orange in autumn.',pl:'Jesienią drzewo jest pomarańczowe.',fr:"L'arbre est orange en automne."}},
 cat:{en:'cat',pl:'kot',fr:'chat',ex:{en:'The cat is sleeping in the sun.',pl:'Kot śpi na słońcu.',fr:'Le chat dort au soleil.'}},
 dog:{en:'dog',pl:'pies',fr:'chien',ex:{en:'The dog wants to play.',pl:'Pies chce się bawić.',fr:'Le chien veut jouer.'}},
 pub:{en:'pub',pl:'pub',fr:'pub',ex:{en:"Let's meet at the pub at six.",pl:'Spotkajmy się w pubie o szóstej.',fr:'On se retrouve au pub à six heures.'}},
 milkbar:{en:'milk bar',pl:'bar mleczny',fr:'bar mleczny (cantine)',ex:{en:'We eat pierogi at the milk bar.',pl:'Jemy pierogi w barze mlecznym.',fr:'On mange des pierogi au bar mleczny.'}},
 phonebox:{en:'phone box',pl:'budka telefoniczna',fr:'cabine téléphonique',ex:{en:'The red phone box is next to the post office.',pl:'Czerwona budka telefoniczna stoi obok poczty.',fr:'La cabine téléphonique rouge est à côté de la poste.'}},
 castle:{en:'castle',pl:'zamek',fr:'château',ex:{en:'The castle is on a big rock.',pl:'Zamek stoi na wielkiej skale.',fr:'Le château est sur un grand rocher.'}},
 statue:{en:'statue',pl:'pomnik',fr:'statue',ex:{en:'This statue is a little dog.',pl:'Ten pomnik to mały pies.',fr:"Cette statue, c'est un petit chien."}},
 unicorn:{en:'unicorn',pl:'jednorożec',fr:'licorne',ex:{en:'The unicorn is the national animal of Scotland.',pl:'Jednorożec to narodowe zwierzę Szkocji.',fr:"La licorne est l'animal national de l'Écosse."}},
 pillory:{en:'pillory',pl:'pręgierz',fr:'pilori',ex:{en:'The old pillory stands in the market square.',pl:'Stary pręgierz stoi na rynku.',fr:'Le vieux pilori se dresse sur la place du marché.'}},
 kiosk:{en:'kiosk',pl:'kiosk',fr:'kiosque',ex:{en:'I buy a newspaper at the kiosk.',pl:'Kupuję gazetę w kiosku.',fr:"J'achète le journal au kiosque."}},
 car:{en:'car',pl:'samochód',fr:'voiture',ex:{en:'This little car is very old.',pl:'Ten mały samochód jest bardzo stary.',fr:'Cette petite voiture est très vieille.'}},
 dwarf:{en:'dwarf',pl:'krasnal',fr:'nain',ex:{en:'There is a little bronze dwarf here!',pl:'Tu jest mały krasnal z brązu!',fr:'Il y a un petit nain en bronze ici !'}},
 bench:{en:'bench',pl:'ławka',fr:'banc',ex:{en:'An old man sits on the bench.',pl:'Starszy pan siedzi na ławce.',fr:'Un vieux monsieur est assis sur le banc.'}},
 streetlamp:{en:'street lamp',pl:'latarnia',fr:'réverbère',ex:{en:'The street lamps turn on at night.',pl:'Latarnie zapalają się w nocy.',fr:"Les réverbères s'allument la nuit."}},
 bicycle:{en:'bicycle',pl:'rower',fr:'vélo',ex:{en:'Her bicycle is red.',pl:'Jej rower jest czerwony.',fr:'Son vélo est rouge.'}},
 pigeon:{en:'pigeon',pl:'gołąb',fr:'pigeon',ex:{en:'A pigeon eats bread crumbs.',pl:'Gołąb je okruszki chleba.',fr:'Un pigeon mange des miettes de pain.'}},
 stall:{en:'market stall',pl:'stragan',fr:'étal',ex:{en:'This stall sells fruit.',pl:'Na tym straganie są owoce.',fr:'Cet étal vend des fruits.'}},
 apple:{en:'apple',pl:'jabłko',fr:'pomme',ex:{en:'This apple is sweet.',pl:'To jabłko jest słodkie.',fr:'Cette pomme est sucrée.'}},
 postbox:{en:'postbox',pl:'skrzynka pocztowa',fr:'boîte aux lettres',ex:{en:'Put the letter in the postbox.',pl:'Wrzuć list do skrzynki pocztowej.',fr:'Mets la lettre dans la boîte aux lettres.'}},
 cloud:{en:'cloud',pl:'chmura',fr:'nuage',ex:{en:'There is a little cloud in the sky.',pl:'Na niebie jest mała chmura.',fr:'Il y a un petit nuage dans le ciel.'}}
});
PV.TOWN_IDS = ['square','fountain','townhall','clock','bakeryShop','cafe','pharmacy','post','bookshop','florist','house','tree','bench','streetlamp','bicycle','pigeon','stall','apple','postbox','cloud','cat','dog','pub','milkbar','phonebox','castle','statue','unicorn','pillory','kiosk','car','dwarf'];
Object.assign(PV.NOTES.en, {
 square:{fr:'« Square » tout seul veut aussi dire « carré ».',pl:'Samo „square” znaczy też „kwadrat”.'},
 post:{fr:'En anglais américain : post office aussi, mais la boîte aux lettres se dit mailbox.',pl:'W USA skrzynka pocztowa to mailbox.'}
});
Object.assign(PV.NOTES.pl, {
 square:{fr:'Le « rynek » est la grande place au cœur des villes polonaises, comme à Cracovie.'},
 townhall:{fr:'Le ratusz se trouve souvent au milieu du rynek.'}
});
PV.SCENE.en.signs = { pub: 'THE THISTLE INN', bakeryShop: 'BAKERY', cafe: 'CAFÉ ROSIE', pharmacy: 'PHARMACY', post: 'POST OFFICE', bookshop: 'BOOKSHOP', florist: 'FLOWERS', townhall: 'TOWN HALL' };
PV.SCENE.pl.signs = { milkbar: 'BAR MLECZNY', bakeryShop: 'PIEKARNIA', cafe: 'KAWIARNIA ROSIE', pharmacy: 'APTEKA', post: 'POCZTA', bookshop: 'KSIĘGARNIA', florist: 'KWIACIARNIA', townhall: 'RATUSZ' };
PV.PLACES.unshift({ id: 'square', key: 'placeSquare', status: 'open', color: '#e7a06b' });
PV.PLACES.find(p => p.id === 'market').status = 'square';
Object.assign(PV.UI.fr, {
 placeSquare: 'La place du marché', backToSquare: 'Retour sur la place', enterBtn: 'Entrer', locked: 'Bientôt ouvert',
 helpTitle: 'Comment jouer', helpTap: 'Touche (ou clique) le sol : ton personnage y va.', helpDrag: 'Glisse le doigt ou la souris : il marche dans cette direction.', helpKeys: 'Clavier : ZQSD, WASD ou les flèches.', helpTalk: 'Touche un habitant pour lui parler, un objet pour apprendre son mot.', helpZoom: 'Zoom : pince avec deux doigts ou molette.', helpOk: "J'ai compris", photo: 'Photo', photoHint: "Choisis l'heure, puis prends ta photo.", shoot: 'Prendre la photo', photoSaved: 'Photo enregistrée !', hourLbl: 'Heure', realTime: 'Heure réelle',
 t_town: 'Découvre 6 mots sur la place',
 townIntroTitle: 'Bienvenue sur la place de', townIntroText: "Une petite ville où tout se passe en {l}. Promène-toi, touche les maisons et les objets pour apprendre leur nom, puis va faire tes courses.",
 tstep1: 'Fais glisser pour regarder, touche le sol pour marcher', tstep2: 'Touche une maison ou un objet pour apprendre son nom', tstep3: 'Trouve la boulangerie et entre chez {b}', onSquare: 'Sur la place'
});
Object.assign(PV.UI.pl, {
 placeSquare: 'Rynek', backToSquare: 'Wróć na rynek', enterBtn: 'Wejdź', locked: 'Wkrótce otwarte',
 helpTitle: 'Jak grać', helpTap: 'Dotknij (lub kliknij) ziemi: twoja postać tam pójdzie.', helpDrag: 'Przesuń palcem lub myszą: idzie w tym kierunku.', helpKeys: 'Klawiatura: WASD, ZQSD lub strzałki.', helpTalk: 'Dotknij mieszkańca, aby porozmawiać, a przedmiotu, aby poznać słowo.', helpZoom: 'Zoom: uszczypnij dwoma palcami lub kółko myszy.', helpOk: 'Rozumiem', photo: 'Zdjęcie', photoHint: 'Wybierz godzinę i zrób zdjęcie.', shoot: 'Zrób zdjęcie', photoSaved: 'Zdjęcie zapisane!', hourLbl: 'Godzina', realTime: 'Prawdziwa godzina',
 t_town: 'Odkryj 6 słów na rynku',
 townIntroTitle: 'Witaj na rynku', townIntroText: 'Małe miasteczko, gdzie wszystko dzieje się po {l}. Spaceruj, dotykaj domów i przedmiotów, żeby poznać ich nazwy, a potem idź na zakupy.',
 tstep1: 'Przeciągnij, żeby się rozejrzeć; dotknij ziemi, żeby iść', tstep2: 'Dotknij domu lub przedmiotu, żeby poznać nazwę', tstep3: 'Znajdź piekarnię i wejdź do: {b}', onSquare: 'Na rynku'
});

/* ---------- palettes pâte à modeler (choisies avec Claude Design) ---------- */
PV.PALS = {
  a: { walls: ['#d9774b', '#e3a84a', '#9db58a', '#efe3cf', '#d99b8c'], roofs: ['#a8492f', '#5b6577'], ground: '#e6cfa8', leaf: '#7a9a4a', accent: '#2f6f6b' },
  b: { walls: ['#d9a62e', '#8f3b3b', '#3f6b5a', '#9fb6c4', '#efe6d6'], roofs: ['#3a3f4a', '#6b4a3a'], ground: '#cfc6b8', leaf: '#4a7a4a', accent: '#c27a3e' },
  c: { walls: ['#f28c28', '#f2d03b', '#2f5fb3', '#8fd3b6', '#f6efe2'], roofs: ['#23305a', '#c4473a'], ground: '#d8cfc2', leaf: '#5fae4a', accent: '#e84a7a' },
  d: { walls: ['#f0a77a', '#b8cf8f', '#b7a3d6', '#f2d68a', '#eaa3a8'], roofs: ['#7a4a3a', '#6a4a6a'], ground: '#efe0c8', leaf: '#86b86a', accent: '#4a2f2a' }
};

/* ---------- Les habitants : chacun a un dialogue court (salutations, prénom, météo, directions, nombres) ---------- */
PV.NPCS = {
 rosa: { name: 'Rosa', role: { fr: 'la fleuriste', pl: 'kwiaciarka' }, pitch: 1.18,
  dlg: {
   en: { nodes: {
     start: ["Hi! I'm Rosa. What's your name?", { fr: "Salut ! Je suis Rosa. Comment tu t'appelles ?", pl: 'Cześć! Jestem Rosa. Jak masz na imię?' }, 'a'],
     q2: ['Welcome to {c}! Do you like flowers?', { fr: 'Bienvenue à {c} ! Tu aimes les fleurs ?', pl: 'Witaj {cl}! Lubisz kwiaty?' }, 'b'],
     end: ['See you soon!', { fr: 'À bientôt !', pl: 'Do zobaczenia!' }],
     huh: ['Sorry, can you say that again?', { fr: 'Pardon, tu peux répéter ?', pl: 'Przepraszam, możesz powtórzyć?' }] },
    opts: {
     a: [ { t: "Nice to meet you, Rosa! I'm new here.", tr: { fr: 'Enchanté, Rosa ! Je suis nouveau ici.', pl: 'Miło mi, Rosa! Jestem tu nowy.' }, to: 'q2' },
          { t: "Hello! I'm a friend of Tom the baker.", tr: { fr: 'Bonjour ! Je suis un ami de Tom le boulanger.', pl: 'Cześć! Jestem przyjacielem piekarza Toma.' }, to: 'q2', reply: ['Oh, Tom! His croissants are the best! Do you like flowers?', { fr: 'Oh, Tom ! Ses croissants sont les meilleurs ! Tu aimes les fleurs ?', pl: 'O, Tom! Jego rogaliki są najlepsze! Lubisz kwiaty?' }] },
          { t: "I'm fine, thank you.", tr: { fr: 'Je vais bien, merci.', pl: 'Dobrze, dziękuję.' }, to: 'start', reply: ["Ha ha, good! But what's your name?", { fr: "Ha ha, tant mieux ! Mais comment tu t'appelles ?", pl: 'Ha ha, to dobrze! Ale jak masz na imię?' }], tip: { fr: "On te demande ton prénom : réponds « My name is… » ou « I'm… ».", pl: 'Pyta o imię: odpowiedz „My name is…” albo „I’m…”.' } } ],
     b: [ { t: 'Yes, I love flowers!', tr: { fr: "Oui, j'adore les fleurs !", pl: 'Tak, uwielbiam kwiaty!' }, to: 'END', reply: ["Me too! Take this rose, it's a gift. See you soon!", { fr: "Moi aussi ! Prends cette rose, c'est un cadeau. À bientôt !", pl: 'Ja też! Weź tę różę, to prezent. Do zobaczenia!' }] },
          { t: 'Not really.', tr: { fr: 'Pas trop.', pl: 'Nie bardzo.' }, to: 'END', reply: ['Oh! Maybe a cake, then? The bakery is right there. Bye!', { fr: 'Oh ! Alors peut-être un gâteau ? La boulangerie est juste là. Salut !', pl: 'Och! To może ciasto? Piekarnia jest tuż obok. Pa!' }] },
          { t: 'Yes, I like.', tr: { fr: "Oui, j'aime.", pl: 'Tak, lubię.' }, to: 'q2', reply: ['Sorry? Do you like flowers?', { fr: 'Pardon ? Tu aimes les fleurs ?', pl: 'Słucham? Lubisz kwiaty?' }], tip: { fr: "Il manque un complément : « Yes, I do » ou « I like them ».", pl: 'Brakuje dopełnienia: „Yes, I do” albo „I like them”.' } } ] } },
   pl: { nodes: {
     start: ['Cześć! Jestem Rosa. Jak masz na imię?', { fr: "Salut ! Je suis Rosa. Comment tu t'appelles ?" }, 'a'],
     q2: ['Witaj {cl}! Lubisz kwiaty?', { fr: 'Bienvenue à {c} ! Tu aimes les fleurs ?' }, 'b'],
     end: ['Do zobaczenia!', { fr: 'À bientôt !' }],
     huh: ['Przepraszam, możesz powtórzyć?', { fr: 'Pardon, tu peux répéter ?' }] },
    opts: {
     a: [ { t: 'Miło mi, Rosa! Jestem tu nowy.', tr: { fr: 'Enchanté, Rosa ! Je suis nouveau ici.' }, to: 'q2' },
          { t: 'Cześć! Jestem przyjacielem piekarza Toma.', tr: { fr: 'Salut ! Je suis un ami de Tom le boulanger.' }, to: 'q2', reply: ['O, Tom! Jego rogaliki są najlepsze! Lubisz kwiaty?', { fr: 'Oh, Tom ! Ses croissants sont les meilleurs ! Tu aimes les fleurs ?' }] },
          { t: 'Dobrze, dziękuję.', tr: { fr: 'Bien, merci.' }, to: 'start', reply: ['Ha ha, to dobrze! Ale jak masz na imię?', { fr: "Ha ha, tant mieux ! Mais comment tu t'appelles ?" }], tip: { fr: "On te demande ton prénom : « Mam na imię… » ou « Jestem… »." } } ],
     b: [ { t: 'Tak, uwielbiam kwiaty!', tr: { fr: "Oui, j'adore les fleurs !" }, to: 'END', reply: ['Ja też! Weź tę różę, to prezent. Do zobaczenia!', { fr: "Moi aussi ! Prends cette rose, c'est un cadeau. À bientôt !" }] },
          { t: 'Nie bardzo.', tr: { fr: 'Pas trop.' }, to: 'END', reply: ['Och! To może ciasto? Piekarnia jest tuż obok. Pa!', { fr: 'Oh ! Alors peut-être un gâteau ? La boulangerie est juste là. Salut !' }] },
          { t: 'Ja lubić.', tr: { fr: 'Moi aimer.' }, to: 'q2', reply: ['Słucham? Lubisz kwiaty?', { fr: 'Pardon ? Tu aimes les fleurs ?' }], tip: { fr: "Conjugue le verbe : « Tak, lubię » (oui, j'aime)." } } ] } } } },
 leo: { name: 'Leo', role: { fr: 'le grand-père du banc', pl: 'dziadek z ławki' }, pitch: .78,
  dlg: {
   en: { nodes: {
     start: ['Good afternoon! How are you today?', { fr: "Bonjour ! Comment allez-vous aujourd'hui ?", pl: 'Dzień dobry! Jak się dziś masz?' }, 'a'],
     q2: ["Very well, thank you. Lovely weather, isn't it?", { fr: "Très bien, merci. Il fait beau, n'est-ce pas ?", pl: 'Bardzo dobrze, dziękuję. Piękna pogoda, prawda?' }, 'b'],
     end: ['Have a nice walk!', { fr: 'Bonne promenade !', pl: 'Miłego spaceru!' }],
     huh: ['Eh? My ears are old, say it again!', { fr: 'Hein ? Mes oreilles sont vieilles, répète !', pl: 'Co? Mam stare uszy, powtórz!' }] },
    opts: {
     a: [ { t: "I'm fine, thanks. And you?", tr: { fr: 'Je vais bien, merci. Et vous ?', pl: 'Dobrze, dziękuję. A pan?' }, to: 'q2' },
          { t: 'Not bad, thank you!', tr: { fr: 'Pas mal, merci !', pl: 'Nieźle, dziękuję!' }, to: 'q2' },
          { t: "I'm Leo.", tr: { fr: 'Je suis Leo.', pl: 'Jestem Leo.' }, to: 'start', reply: ["Ha ha! No, I'm Leo! How are you?", { fr: "Ha ha ! Non, c'est moi Leo ! Comment allez-vous ?", pl: 'Ha ha! Nie, to ja jestem Leo! Jak się masz?' }], tip: { fr: "« How are you? » = Comment allez-vous ? Réponds « I'm fine, thanks ».", pl: '„How are you?” = Jak się masz? Odpowiedz „I’m fine, thanks”.' } } ],
     b: [ { t: "Yes, it's beautiful today!", tr: { fr: "Oui, il fait très beau aujourd'hui !", pl: 'Tak, dzisiaj jest pięknie!' }, to: 'END', reply: ['It is. I come here every day to feed the pigeons. Have a nice walk!', { fr: 'Oui. Je viens ici tous les jours nourrir les pigeons. Bonne promenade !', pl: 'Prawda. Przychodzę tu codziennie karmić gołębie. Miłego spaceru!' }] },
          { t: 'Yes, but a bit cold.', tr: { fr: 'Oui, mais un peu froid.', pl: 'Tak, ale trochę zimno.' }, to: 'END', reply: ['Ha ha, put on a scarf, like me! Have a nice walk!', { fr: 'Ha ha, mets une écharpe, comme moi ! Bonne promenade !', pl: 'Ha ha, załóż szalik, jak ja! Miłego spaceru!' }] },
          { t: 'Weather is yes.', tr: { fr: 'Le temps est oui.', pl: 'Pogoda jest tak.' }, to: 'q2', reply: ['Eh? Is the weather nice, or not?', { fr: "Hein ? Il fait beau, ou pas ?", pl: 'Co? Pogoda jest ładna czy nie?' }], tip: { fr: "Réponds avec un adjectif : « Yes, it's beautiful ».", pl: 'Odpowiedz przymiotnikiem: „Yes, it’s beautiful”.' } } ] } },
   pl: { nodes: {
     start: ['Dzień dobry! Jak się dziś masz?', { fr: "Bonjour ! Comment ça va aujourd'hui ?" }, 'a'],
     q2: ['Bardzo dobrze, dziękuję. Piękna pogoda, prawda?', { fr: "Très bien, merci. Il fait beau, n'est-ce pas ?" }, 'b'],
     end: ['Miłego spaceru!', { fr: 'Bonne promenade !' }],
     huh: ['Co? Mam stare uszy, powtórz!', { fr: 'Hein ? Mes oreilles sont vieilles, répète !' }] },
    opts: {
     a: [ { t: 'Dobrze, dziękuję. A pan?', tr: { fr: 'Bien, merci. Et vous ?' }, to: 'q2' },
          { t: 'Nieźle, dziękuję!', tr: { fr: 'Pas mal, merci !' }, to: 'q2' },
          { t: 'Jestem Leo.', tr: { fr: 'Je suis Leo.' }, to: 'start', reply: ['Ha ha! Nie, to ja jestem Leo! Jak się masz?', { fr: "Ha ha ! Non, c'est moi Leo ! Comment ça va ?" }], tip: { fr: "« Jak się masz? » = Comment ça va ? Réponds « Dobrze, dziękuję »." } } ],
     b: [ { t: 'Tak, dzisiaj jest pięknie!', tr: { fr: "Oui, il fait très beau aujourd'hui !" }, to: 'END', reply: ['Prawda. Przychodzę tu codziennie karmić gołębie. Miłego spaceru!', { fr: 'Oui. Je viens ici tous les jours nourrir les pigeons. Bonne promenade !' }] },
          { t: 'Tak, ale trochę zimno.', tr: { fr: 'Oui, mais un peu froid.' }, to: 'END', reply: ['Ha ha, załóż szalik, jak ja! Miłego spaceru!', { fr: 'Ha ha, mets une écharpe, comme moi ! Bonne promenade !' }] },
          { t: 'Pogoda jest tak.', tr: { fr: 'Le temps est oui.' }, to: 'q2', reply: ['Co? Pogoda jest ładna czy nie?', { fr: 'Hein ? Il fait beau, ou pas ?' }], tip: { fr: "Réponds avec un adjectif : « Tak, jest pięknie »." } } ] } } } },
 maya: { name: 'Maya', role: { fr: "l'étudiante", pl: 'studentka' }, pitch: 1.3,
  dlg: {
   en: { nodes: {
     start: ['Excuse me, where is the post office?', { fr: 'Excuse-moi, où est la poste ?', pl: 'Przepraszam, gdzie jest poczta?' }, 'a'],
     q2: ['Thank you so much! I need to send a letter to my grandma.', { fr: 'Merci beaucoup ! Je dois envoyer une lettre à ma grand-mère.', pl: 'Dziękuję bardzo! Muszę wysłać list do babci.' }, 'b'],
     end: ['Bye! Have a good day!', { fr: 'Salut ! Bonne journée !', pl: 'Pa! Miłego dnia!' }],
     huh: ['Sorry, I didn’t understand.', { fr: "Pardon, je n'ai pas compris.", pl: 'Przepraszam, nie zrozumiałam.' }] },
    opts: {
     a: [ { t: "It's over there, next to the pharmacy.", tr: { fr: "C'est là-bas, à côté de la pharmacie.", pl: 'Tam, obok apteki.' }, to: 'q2' },
          { t: "Sorry, I don't know.", tr: { fr: 'Désolé, je ne sais pas.', pl: 'Przepraszam, nie wiem.' }, to: 'END', reply: ["No problem, I'll ask someone else! Bye!", { fr: 'Pas de souci, je vais demander à quelqu’un d’autre ! Salut !', pl: 'Nie szkodzi, zapytam kogoś innego! Pa!' }] },
          { t: "It's a bakery.", tr: { fr: "C'est une boulangerie.", pl: 'To jest piekarnia.' }, to: 'start', reply: ['Yes, but where is the post office?', { fr: 'Oui, mais où est la poste ?', pl: 'Tak, ale gdzie jest poczta?' }], tip: { fr: "On te demande où est la poste : « It's over there, next to… ».", pl: 'Pyta, gdzie jest poczta: „It’s over there, next to…”.' } } ],
     b: [ { t: 'Good luck!', tr: { fr: 'Bonne chance !', pl: 'Powodzenia!' }, to: 'END' },
          { t: "That's nice!", tr: { fr: "C'est gentil !", pl: 'To miłe!' }, to: 'END' } ] } },
   pl: { nodes: {
     start: ['Przepraszam, gdzie jest poczta?', { fr: 'Excuse-moi, où est la poste ?' }, 'a'],
     q2: ['Dziękuję bardzo! Muszę wysłać list do babci.', { fr: 'Merci beaucoup ! Je dois envoyer une lettre à ma grand-mère.' }, 'b'],
     end: ['Pa! Miłego dnia!', { fr: 'Salut ! Bonne journée !' }],
     huh: ['Przepraszam, nie zrozumiałam.', { fr: "Pardon, je n'ai pas compris." }] },
    opts: {
     a: [ { t: 'Tam, obok apteki.', tr: { fr: 'Là-bas, à côté de la pharmacie.' }, to: 'q2' },
          { t: 'Przepraszam, nie wiem.', tr: { fr: 'Désolé, je ne sais pas.' }, to: 'END', reply: ['Nie szkodzi, zapytam kogoś innego! Pa!', { fr: 'Pas de souci, je vais demander à quelqu’un d’autre ! Salut !' }] },
          { t: 'To jest piekarnia.', tr: { fr: "C'est une boulangerie." }, to: 'start', reply: ['Tak, ale gdzie jest poczta?', { fr: 'Oui, mais où est la poste ?' }], tip: { fr: "On te demande où est la poste : « Tam, obok… » (là-bas, à côté de…)." } } ],
     b: [ { t: 'Powodzenia!', tr: { fr: 'Bonne chance !' }, to: 'END' },
          { t: 'To miłe!', tr: { fr: "C'est gentil !" }, to: 'END' } ] } } } },
 sam: { name: 'Sam', role: { fr: 'le marchand de fruits', pl: 'sprzedawca owoców' }, pitch: .95,
  dlg: {
   en: { nodes: {
     start: ['Hello! Fresh apples, two for a pound!', { fr: 'Bonjour ! Pommes fraîches, deux pour une livre !', pl: 'Dzień dobry! Świeże jabłka, dwa za funta!' }, 'a'],
     q1b: ['Two for a pound! How many would you like?', { fr: 'Deux pour une livre ! Tu en veux combien ?', pl: 'Dwa za funta! Ile chcesz?' }, 'a'],
     q2: ["Here you are. That's two pounds.", { fr: 'Voilà. Ça fait deux livres.', pl: 'Proszę bardzo. Razem dwa funty.' }, 'b'],
     end: ['Enjoy your apples!', { fr: 'Bonne dégustation !', pl: 'Smacznego!' }],
     huh: ['Sorry? Apples, how many?', { fr: 'Pardon ? Des pommes, combien ?', pl: 'Słucham? Ile jabłek?' }] },
    opts: {
     a: [ { t: 'Can I have four apples, please?', tr: { fr: "Je peux avoir quatre pommes, s'il vous plaît ?", pl: 'Poproszę cztery jabłka.' }, to: 'q2' },
          { t: 'How much are the apples?', tr: { fr: 'Combien coûtent les pommes ?', pl: 'Ile kosztują jabłka?' }, to: 'q1b' },
          { t: 'I want banana.', tr: { fr: 'Je veux banane.', pl: 'Chcę banan.' }, to: 'start', reply: ['Sorry, only apples today! Two for a pound!', { fr: "Désolé, que des pommes aujourd'hui ! Deux pour une livre !", pl: 'Przykro mi, dziś tylko jabłka! Dwa za funta!' }], tip: { fr: "Sam vend des pommes (« apples »). Et on dit « a banana ».", pl: 'Sam sprzedaje jabłka („apples”). I mówi się „a banana”.' } } ],
     b: [ { t: 'Here you are. Thank you!', tr: { fr: 'Voilà. Merci !', pl: 'Proszę. Dziękuję!' }, to: 'END' },
          { t: 'Two pounds? OK, here.', tr: { fr: "Deux livres ? D'accord, voilà.", pl: 'Dwa funty? Dobrze, proszę.' }, to: 'END' } ] } },
   pl: { nodes: {
     start: ['Dzień dobry! Świeże jabłka, dwa za trzy złote!', { fr: 'Bonjour ! Pommes fraîches, deux pour trois złotys !' }, 'a'],
     q1b: ['Dwa za trzy złote! Ile chcesz?', { fr: 'Deux pour trois złotys ! Tu en veux combien ?' }, 'a'],
     q2: ['Proszę bardzo. Razem sześć złotych.', { fr: 'Voilà. Ça fait six złotys.' }, 'b'],
     end: ['Smacznego!', { fr: 'Bon appétit !' }],
     huh: ['Słucham? Ile jabłek?', { fr: 'Pardon ? Combien de pommes ?' }] },
    opts: {
     a: [ { t: 'Poproszę cztery jabłka.', tr: { fr: "Quatre pommes, s'il vous plaît." }, to: 'q2' },
          { t: 'Ile kosztują jabłka?', tr: { fr: 'Combien coûtent les pommes ?' }, to: 'q1b' },
          { t: 'Chcę banan.', tr: { fr: 'Je veux banane.' }, to: 'start', reply: ['Przykro mi, dziś tylko jabłka! Dwa za trzy złote!', { fr: "Désolé, que des pommes aujourd'hui ! Deux pour trois złotys !" }], tip: { fr: "Sam vend des pommes (« jabłka »)." } } ],
     b: [ { t: 'Proszę. Dziękuję!', tr: { fr: 'Voilà. Merci !' }, to: 'END' },
          { t: 'Sześć złotych? Dobrze, proszę.', tr: { fr: "Six złotys ? D'accord, voilà." }, to: 'END' } ] } } } }
};
PV.GREET = {
 en: [['Hi!', { fr: 'Salut !', pl: 'Cześć!' }], ['Hello there!', { fr: 'Bonjour !', pl: 'Dzień dobry!' }], ['Lovely day, isn’t it?', { fr: 'Belle journée, non ?', pl: 'Piękny dzień, prawda?' }], ['Have a nice day!', { fr: 'Bonne journée !', pl: 'Miłego dnia!' }]],
 pl: [['Cześć!', { fr: 'Salut !' }], ['Dzień dobry!', { fr: 'Bonjour !' }], ['Piękny dzień, prawda?', { fr: 'Belle journée, non ?' }], ['Miłego dnia!', { fr: 'Bonne journée !' }]]
};
Object.assign(PV.UI.fr, { newFriend: 'Nouvel ami : {n} ! +15 XP', friends: 'amis rencontrés' });
Object.assign(PV.UI.pl, { newFriend: 'Nowy przyjaciel: {n}! +15 XP', friends: 'poznani przyjaciele' });

/* ---------- v6 : première réussite orale, habitants qui s'intéressent à toi, demande du jour, collections ----------
   Répliques dans la langue apprise ([texte, {traductions}]) ; {c} = le nom de la ville (Edinburgh, Wrocław…). */
PV.CITY_NAME = { gb: 'Edinburgh', pl: 'Wrocław', fr: 'Petite Ville' };
/* {cl} : « à <ville> » en polonais (locatif) */
PV.CITY_LOC = { gb: 'w Edynburgu', pl: 'we Wrocławiu', fr: 'w Petite Ville' };
PV.FIRST = {
 en: { nodes: {
   start: ['Hi! I\'m Rosa. Welcome! Can you say "Hello"?', { fr: 'Salut ! Je suis Rosa. Bienvenue ! Tu peux dire « Hello » ?', pl: 'Cześć! Jestem Rosa. Witaj! Powiesz „Hello”?' }, 'a'],
   end: ['Wonderful! You just spoke English!', { fr: 'Génial ! Tu viens de parler anglais !', pl: 'Wspaniale! Właśnie mówisz po angielsku!' }],
   huh: ['Almost! Try again: "Hello!"', { fr: 'Presque ! Essaie encore : « Hello ! »', pl: 'Prawie! Spróbuj jeszcze raz: „Hello!”' }] },
  opts: { a: [ { t: 'Hello!', tr: { fr: 'Bonjour !', pl: 'Cześć!' }, to: 'END' } ] } },
 pl: { nodes: {
   start: ['Cześć! Jestem Rosa. Witaj! Powiesz „Dzień dobry”?', { fr: 'Salut ! Je suis Rosa. Bienvenue ! Tu peux dire « Dzień dobry » ?' }, 'a'],
   end: ['Wspaniale! Właśnie mówisz po polsku!', { fr: 'Génial ! Tu viens de parler polonais !' }],
   huh: ['Prawie! Spróbuj jeszcze raz: „Dzień dobry!”', { fr: 'Presque ! Essaie encore : « Dzień dobry ! »' }] },
  opts: { a: [ { t: 'Dzień dobry!', tr: { fr: 'Bonjour !' }, to: 'END' } ] } }
};
/* quand on connaît déjà un habitant : il prend de tes nouvelles */
PV.FOLLOW = {
 en: { nodes: {
   start: ["Oh, it's you again! How are you today?", { fr: "Oh, c'est encore toi ! Comment ça va aujourd'hui ?", pl: 'O, to znowu ty! Jak się dziś masz?' }, 'a'],
   q2: ['What are you up to today?', { fr: "Qu'est-ce que tu fais de beau aujourd'hui ?", pl: 'Co dziś porabiasz?' }, 'b'],
   q3: ['Do you like {c}?', { fr: 'Tu aimes {c} ?', pl: 'Podoba ci się {c}?' }, 'c'],
   end: ['See you soon!', { fr: 'À bientôt !', pl: 'Do zobaczenia!' }],
   huh: ['Sorry, can you say that again?', { fr: 'Pardon, tu peux répéter ?', pl: 'Przepraszam, możesz powtórzyć?' }] },
  opts: {
   a: [ { t: "I'm great, thanks!", tr: { fr: 'Super bien, merci !', pl: 'Świetnie, dzięki!' }, to: 'q2', reply: ['Great to hear! What are you up to today?', { fr: "Ça fait plaisir ! Qu'est-ce que tu fais de beau aujourd'hui ?", pl: 'Miło to słyszeć! Co dziś porabiasz?' }] },
        { t: 'Not bad, and you?', tr: { fr: 'Pas mal, et toi ?', pl: 'Nieźle, a ty?' }, to: 'q2', reply: ["I'm very well, thank you for asking! What are you up to today?", { fr: "Très bien, merci de demander ! Qu'est-ce que tu fais de beau aujourd'hui ?", pl: 'Bardzo dobrze, dzięki, że pytasz! Co dziś porabiasz?' }] } ],
   b: [ { t: 'I am learning new words.', tr: { fr: "J'apprends de nouveaux mots.", pl: 'Uczę się nowych słów.' }, to: 'q3', reply: ['Brilliant! You speak better every day. Do you like {c}?', { fr: 'Bravo ! Tu parles de mieux en mieux. Tu aimes {c} ?', pl: 'Brawo! Mówisz coraz lepiej. Podoba ci się {c}?' }] },
        { t: 'I am going to the bakery.', tr: { fr: 'Je vais à la boulangerie.', pl: 'Idę do piekarni.' }, to: 'q3', reply: ['Mmm, say hello to Tom for me! Do you like {c}?', { fr: 'Mmm, passe le bonjour à Tom ! Tu aimes {c} ?', pl: 'Mmm, pozdrów ode mnie Toma! Podoba ci się {c}?' }] },
        { t: 'I am walking around the square.', tr: { fr: 'Je me promène sur la place.', pl: 'Spaceruję po placu.' }, to: 'q3', reply: ['Lovely day for it! Do you like {c}?', { fr: 'Belle journée pour ça ! Tu aimes {c} ?', pl: 'Piękny dzień na spacer! Podoba ci się {c}?' }] } ],
   c: [ { t: 'Yes, I love it here!', tr: { fr: "Oui, j'adore cet endroit !", pl: 'Tak, uwielbiam to miejsce!' }, to: 'END', reply: ["Me too! I'm so glad you're here. See you soon!", { fr: 'Moi aussi ! Ça me fait plaisir que tu sois là. À bientôt !', pl: 'Ja też! Cieszę się, że tu jesteś. Do zobaczenia!' }] },
        { t: 'It is beautiful!', tr: { fr: "C'est magnifique !", pl: 'Jest tu pięknie!' }, to: 'END', reply: ['Isn\'t it? See you soon!', { fr: "N'est-ce pas ? À bientôt !", pl: 'Prawda? Do zobaczenia!' }] } ] } },
 pl: { nodes: {
   start: ['O, to znowu ty! Jak się dziś masz?', { fr: "Oh, c'est encore toi ! Comment ça va aujourd'hui ?" }, 'a'],
   q2: ['Co dziś porabiasz?', { fr: "Qu'est-ce que tu fais de beau aujourd'hui ?" }, 'b'],
   q3: ['Podoba ci się {c}?', { fr: 'Tu aimes {c} ?' }, 'c'],
   end: ['Do zobaczenia!', { fr: 'À bientôt !' }],
   huh: ['Przepraszam, możesz powtórzyć?', { fr: 'Pardon, tu peux répéter ?' }] },
  opts: {
   a: [ { t: 'Świetnie, dzięki!', tr: { fr: 'Super, merci !' }, to: 'q2', reply: ['Super! Co dziś porabiasz?', { fr: "Super ! Qu'est-ce que tu fais de beau aujourd'hui ?" }] },
        { t: 'Nieźle, a ty?', tr: { fr: 'Pas mal, et toi ?' }, to: 'q2', reply: ['Bardzo dobrze, dzięki, że pytasz! Co dziś porabiasz?', { fr: "Très bien, merci de demander ! Qu'est-ce que tu fais de beau aujourd'hui ?" }] } ],
   b: [ { t: 'Uczę się nowych słów.', tr: { fr: "J'apprends de nouveaux mots." }, to: 'q3', reply: ['Brawo! Mówisz coraz lepiej. Podoba ci się {c}?', { fr: 'Bravo ! Tu parles de mieux en mieux. Tu aimes {c} ?' }] },
        { t: 'Idę do piekarni.', tr: { fr: 'Je vais à la boulangerie.' }, to: 'q3', reply: ['Mmm, pozdrów ode mnie Toma! Podoba ci się {c}?', { fr: 'Mmm, passe le bonjour à Tom ! Tu aimes {c} ?' }] },
        { t: 'Spaceruję po rynku.', tr: { fr: 'Je me promène sur la place.' }, to: 'q3', reply: ['Piękny dzień na spacer! Podoba ci się {c}?', { fr: 'Belle journée pour se promener ! Tu aimes {c} ?' }] } ],
   c: [ { t: 'Tak, bardzo mi się podoba!', tr: { fr: 'Oui, ça me plaît beaucoup !' }, to: 'END', reply: ['Cieszę się! Do zobaczenia!', { fr: 'Ça me fait plaisir ! À bientôt !' }] },
        { t: 'Jest tu pięknie!', tr: { fr: "C'est magnifique ici !" }, to: 'END', reply: ['Prawda? Do zobaczenia!', { fr: "N'est-ce pas ? À bientôt !" }] } ] } }
};
/* demande du jour : un habitant a besoin de toi (c : pays concernés, '*' = tous) */
PV.QUESTS = [
 { id: 'cat', c: '*', giver: 'leo', type: 'find', target: 'cat', en: ["Have you seen my cat? I think he's sleeping on a bench.", { fr: "Tu as vu mon chat ? Je crois qu'il dort sur un banc.", pl: 'Widzisz gdzieś mojego kota? Chyba śpi na ławce.' }], pl: ['Widzisz gdzieś mojego kota? Chyba śpi na ławce.', { fr: "Tu vois mon chat quelque part ? Je crois qu'il dort sur un banc." }] },
 { id: 'dog', c: '*', giver: 'maya', type: 'find', target: 'dog', en: ['A little dog is walking around the square. Can you find him?', { fr: 'Un petit chien se promène sur la place. Tu peux le trouver ?', pl: 'Po placu spaceruje mały pies. Znajdziesz go?' }], pl: ['Po rynku spaceruje mały pies. Znajdziesz go?', { fr: 'Un petit chien se promène sur la place. Tu peux le trouver ?' }] },
 { id: 'talkRosa', c: '*', giver: 'sam', type: 'talk', target: 'rosa', en: ['Rosa the florist wants to meet you. Go and say hello!', { fr: 'Rosa la fleuriste veut te rencontrer. Va lui dire bonjour !', pl: 'Kwiaciarka Rosa chce cię poznać. Idź się przywitać!' }], pl: ['Kwiaciarka Rosa chce cię poznać. Idź się przywitać!', { fr: 'Rosa la fleuriste veut te rencontrer. Va lui dire bonjour !' }] },
 { id: 'speak5', c: '*', giver: 'rosa', type: 'say', n: 5, en: ["Let's practise! Say five sentences out loud today.", { fr: "On s'entraîne ! Dis cinq phrases à voix haute aujourd'hui.", pl: 'Poćwiczmy! Powiedz dziś na głos pięć zdań.' }], pl: ['Poćwiczmy! Powiedz dziś na głos pięć zdań.', { fr: "On s'entraîne ! Dis cinq phrases à voix haute aujourd'hui." }] },
 { id: 'bakery', c: '*', giver: 'maya', type: 'bakery', en: ["I'm hungry! Can you buy something at the bakery?", { fr: "J'ai faim ! Tu peux acheter quelque chose à la boulangerie ?", pl: 'Jestem głodna! Kupisz coś w piekarni?' }], pl: ['Jestem głodna! Kupisz coś w piekarni?', { fr: "J'ai faim ! Tu peux acheter quelque chose à la boulangerie ?" }] },
 { id: 'phone', c: 'gb', giver: 'rosa', type: 'find', target: 'phonebox', en: ['I need to call my mum. Where is the red phone box?', { fr: 'Je dois appeler ma mère. Où est la cabine téléphonique rouge ?', pl: 'Muszę zadzwonić do mamy. Gdzie jest czerwona budka telefoniczna?' }] },
 { id: 'unicorn', c: 'gb', giver: 'maya', type: 'find', target: 'unicorn', en: ['Little unicorns are hiding in town. Can you find one?', { fr: 'De petites licornes se cachent en ville. Tu peux en trouver une ?', pl: 'W mieście ukrywają się małe jednorożce. Znajdziesz jednego?' }] },
 { id: 'castle', c: 'gb', giver: 'sam', type: 'find', target: 'castle', en: ['Look up! Can you see the castle on the rock?', { fr: 'Lève les yeux ! Tu vois le château sur le rocher ?', pl: 'Spójrz w górę! Widzisz zamek na skale?' }] },
 { id: 'statue', c: 'gb', giver: 'leo', type: 'find', target: 'statue', en: ['There is a statue of a loyal little dog near the fountain. Can you find it?', { fr: "Il y a la statue d'un petit chien fidèle près de la fontaine. Tu la trouves ?", pl: 'Przy fontannie stoi pomnik wiernego pieska. Znajdziesz go?' }] },
 { id: 'dwarf', c: 'pl', giver: 'maya', type: 'find', target: 'dwarf', pl: ['W mieście ukrywają się krasnale. Znajdziesz jednego?', { fr: 'Des krasnale se cachent en ville. Tu peux en trouver un ?' }] },
 { id: 'kiosk', c: 'pl', giver: 'leo', type: 'find', target: 'kiosk', pl: ['Chcę kupić gazetę. Gdzie jest kiosk?', { fr: 'Je veux acheter le journal. Où est le kiosque ?' }] },
 { id: 'car', c: 'pl', giver: 'sam', type: 'find', target: 'car', pl: ['Mój stary maluch stoi przy rynku. Znajdziesz go?', { fr: 'Ma vieille Maluch est garée au bord de la place. Tu la trouves ?' }] },
 { id: 'pillory', c: 'pl', giver: 'leo', type: 'find', target: 'pillory', pl: ['Na rynku stoi stary pręgierz. Wiesz, gdzie?', { fr: 'Sur la place, il y a un vieux pilori. Tu sais où ?' }] }
];
PV.QUEST_OK = { en: { t: 'Of course!', tr: { fr: 'Bien sûr !', pl: 'Jasne!' }, reply: ['Thank you so much!', { fr: 'Merci beaucoup !', pl: 'Dziękuję bardzo!' }] }, pl: { t: 'Jasne!', tr: { fr: 'Bien sûr !' }, reply: ['Dziękuję bardzo!', { fr: 'Merci beaucoup !' }] } };
PV.COLLECT = { unicorn: 5, dwarf: 5 };
Object.assign(PV.WORDS, { christmastree: { en: 'Christmas tree', pl: 'choinka', fr: 'sapin de Noël', ex: { en: 'The Christmas tree has lots of lights.', pl: 'Choinka ma dużo światełek.', fr: 'Le sapin de Noël a plein de lumières.' } } });
PV.TOWN_IDS.push('christmastree');
/* le marché : un étal de fruits (Sam) et un étal de légumes, chaque cagette a son mot */
Object.assign(PV.WORDS, {
  orange: { en: 'orange', pl: 'pomarańcza', fr: 'orange', ex: { en: 'I would like an orange, please.', pl: 'Poproszę pomarańczę.', fr: 'Je voudrais une orange, s\'il vous plaît.' } },
  pear: { en: 'pear', pl: 'gruszka', fr: 'poire', ex: { en: 'This pear is very juicy.', pl: 'Ta gruszka jest bardzo soczysta.', fr: 'Cette poire est très juteuse.' } },
  tomato: { en: 'tomato', pl: 'pomidor', fr: 'tomate', ex: { en: 'The tomatoes are red and fresh.', pl: 'Pomidory są czerwone i świeże.', fr: 'Les tomates sont rouges et fraîches.' } },
  carrot: { en: 'carrot', pl: 'marchewka', fr: 'carotte', ex: { en: 'Rabbits love carrots.', pl: 'Króliki uwielbiają marchewki.', fr: 'Les lapins adorent les carottes.' } },
  lettuce: { en: 'lettuce', pl: 'sałata', fr: 'salade', ex: { en: 'Can I have a lettuce, please?', pl: 'Poproszę sałatę.', fr: 'Je peux avoir une salade, s\'il vous plaît ?' } }
});
PV.TOWN_IDS.push('orange', 'pear', 'tomato', 'carrot', 'lettuce');
Object.assign(PV.UI.fr, {
  firstWinTitle: 'Bravo !', firstWinText: 'Ta première phrase en {l} ! +10 XP',
  questTitle: 'Demande du jour', questFrom: '{n} a besoin de toi', questDone: 'Demande du jour réussie : {n} te remercie ! +30 XP', questOk: 'Fait !',
  questFind: 'Trouve : {w}', questTalk: 'Va parler à {w}', questSay: 'Dis des phrases à voix haute : {k}/{t}', questBakery: 'Achète quelque chose à la boulangerie',
  friendUp: '{n} t\'apprécie de plus en plus', collTitle: 'Collection', collFound: '{w} : {k}/{t}', collDone: 'Collection complète ! +50 XP'
});
Object.assign(PV.UI.pl, {
  firstWinTitle: 'Brawo!', firstWinText: 'Twoje pierwsze zdanie po {l}! +10 XP',
  questTitle: 'Prośba dnia', questFrom: '{n} potrzebuje twojej pomocy', questDone: 'Prośba dnia wykonana: {n} dziękuje! +30 XP', questOk: 'Zrobione!',
  questFind: 'Znajdź: {w}', questTalk: 'Porozmawiaj z: {w}', questSay: 'Powiedz zdania na głos: {k}/{t}', questBakery: 'Kup coś w piekarni',
  friendUp: '{n} coraz bardziej cię lubi', collTitle: 'Kolekcja', collFound: '{w}: {k}/{t}', collDone: 'Kolekcja kompletna! +50 XP'
});
Object.assign(PV.UI.fr, { exitShop: 'Sortir' }); Object.assign(PV.UI.pl, { exitShop: 'Wyjdź' });
/* autres conversations quand on se connaît déjà (une par jour et par habitant, en alternance) */
PV.FOLLOW2 = {
 en: [
  { nodes: {
    start: ['Hello again! Tell me, what do you like to eat?', { fr: "Re-bonjour ! Dis-moi, qu'est-ce que tu aimes manger ?", pl: 'Znowu cześć! Powiedz, co lubisz jeść?' }, 'a'],
    q2: ['Do you cook at home?', { fr: 'Tu cuisines chez toi ?', pl: 'Gotujesz w domu?' }, 'b'],
    end: ['See you soon!', { fr: 'À bientôt !', pl: 'Do zobaczenia!' }],
    huh: ['Sorry, can you say that again?', { fr: 'Pardon, tu peux répéter ?', pl: 'Przepraszam, możesz powtórzyć?' }] },
   opts: {
    a: [ { t: 'I love cakes!', tr: { fr: "J'adore les gâteaux !", pl: 'Uwielbiam ciasta!' }, to: 'q2', reply: ['Me too! The bakery has amazing cakes. Do you cook at home?', { fr: 'Moi aussi ! La boulangerie a des gâteaux incroyables. Tu cuisines chez toi ?', pl: 'Ja też! W piekarni są świetne ciasta. Gotujesz w domu?' }] },
         { t: 'I like fruit and vegetables.', tr: { fr: "J'aime les fruits et les légumes.", pl: 'Lubię owoce i warzywa.' }, to: 'q2', reply: ['Very healthy! Sam has fresh apples. Do you cook at home?', { fr: 'Très sain ! Sam a des pommes fraîches. Tu cuisines chez toi ?', pl: 'Bardzo zdrowo! Sam ma świeże jabłka. Gotujesz w domu?' }], self: { sam: ['Very healthy! My apples are the best. Do you cook at home?', { fr: 'Très sain ! Mes pommes sont les meilleures. Tu cuisines chez toi ?', pl: 'Bardzo zdrowo! Moje jabłka są najlepsze. Gotujesz w domu?' }] } },
         { t: 'I like pizza.', tr: { fr: "J'aime la pizza.", pl: 'Lubię pizzę.' }, to: 'q2', reply: ["Who doesn't? Do you cook at home?", { fr: "Qui n'aime pas ça ? Tu cuisines chez toi ?", pl: 'Kto nie lubi? Gotujesz w domu?' }] } ],
    b: [ { t: 'Yes, every day.', tr: { fr: 'Oui, tous les jours.', pl: 'Tak, codziennie.' }, to: 'END', reply: ['Lovely! Bring me something to try one day. See you soon!', { fr: 'Super ! Apporte-moi quelque chose à goûter un jour. À bientôt !', pl: 'Super! Przynieś mi kiedyś coś do spróbowania. Do zobaczenia!' }] },
         { t: 'No, not really.', tr: { fr: 'Non, pas vraiment.', pl: 'Nie, raczej nie.' }, to: 'END', reply: ["Me neither! That's why I love the bakery. See you soon!", { fr: "Moi non plus ! C'est pour ça que j'adore la boulangerie. À bientôt !", pl: 'Ja też nie! Dlatego uwielbiam piekarnię. Do zobaczenia!' }] } ] } },
  { nodes: {
    start: ["Hi! Tell me, what's your favourite place here?", { fr: 'Salut ! Dis-moi, quel est ton endroit préféré ici ?', pl: 'Cześć! Powiedz, jakie jest twoje ulubione miejsce tutaj?' }, 'a'],
    q2: ['Do you come here every day?', { fr: 'Tu viens ici tous les jours ?', pl: 'Przychodzisz tu codziennie?' }, 'b'],
    end: ['See you soon!', { fr: 'À bientôt !', pl: 'Do zobaczenia!' }],
    huh: ['Sorry, can you say that again?', { fr: 'Pardon, tu peux répéter ?', pl: 'Przepraszam, możesz powtórzyć?' }] },
   opts: {
    a: [ { t: 'The market square.', tr: { fr: 'La place du marché.', pl: 'Rynek.' }, to: 'q2', reply: ['Me too! I love watching people here. Do you come here every day?', { fr: "Moi aussi ! J'adore regarder les gens ici. Tu viens tous les jours ?", pl: 'Ja też! Uwielbiam tu patrzeć na ludzi. Przychodzisz tu codziennie?' }] },
         { t: 'The bakery.', tr: { fr: 'La boulangerie.', pl: 'Piekarnia.' }, to: 'q2', reply: ['Good choice! It smells so good. Do you come here every day?', { fr: 'Bon choix ! Ça sent si bon. Tu viens tous les jours ?', pl: 'Dobry wybór! Tak tam pięknie pachnie. Przychodzisz tu codziennie?' }] },
         { t: 'The fountain.', tr: { fr: 'La fontaine.', pl: 'Fontanna.' }, to: 'q2', reply: ["It's so peaceful there. Do you come here every day?", { fr: "C'est si paisible là-bas. Tu viens tous les jours ?", pl: 'Tam jest tak spokojnie. Przychodzisz tu codziennie?' }] } ],
    b: [ { t: 'Yes, I try!', tr: { fr: "Oui, j'essaie !", pl: 'Tak, staram się!' }, to: 'END', reply: ['Great! Then see you tomorrow!', { fr: 'Super ! Alors à demain !', pl: 'Super! To do jutra!' }] },
         { t: 'When I have time.', tr: { fr: "Quand j'ai le temps.", pl: 'Kiedy mam czas.' }, to: 'END', reply: ["That's fine. It's always nice to see you!", { fr: 'Pas de souci. Ça me fait toujours plaisir de te voir !', pl: 'W porządku. Zawsze miło cię widzieć!' }] } ] } } ],
 pl: [
  { nodes: {
    start: ['Znowu cześć! Powiedz, co lubisz jeść?', { fr: "Re-bonjour ! Dis-moi, qu'est-ce que tu aimes manger ?" }, 'a'],
    q2: ['Gotujesz w domu?', { fr: 'Tu cuisines chez toi ?' }, 'b'],
    end: ['Do zobaczenia!', { fr: 'À bientôt !' }],
    huh: ['Przepraszam, możesz powtórzyć?', { fr: 'Pardon, tu peux répéter ?' }] },
   opts: {
    a: [ { t: 'Uwielbiam ciasta!', tr: { fr: "J'adore les gâteaux !" }, to: 'q2', reply: ['Ja też! W piekarni są świetne ciasta. Gotujesz w domu?', { fr: 'Moi aussi ! La boulangerie a des gâteaux incroyables. Tu cuisines chez toi ?' }] },
         { t: 'Lubię pierogi.', tr: { fr: "J'aime les pierogi." }, to: 'q2', reply: ['Kto nie lubi pierogów? Najlepsze są w barze mlecznym. Gotujesz w domu?', { fr: "Qui n'aime pas les pierogi ? Les meilleurs sont au bar mleczny. Tu cuisines chez toi ?" }] },
         { t: 'Lubię owoce i warzywa.', tr: { fr: "J'aime les fruits et les légumes." }, to: 'q2', reply: ['Bardzo zdrowo! Sam ma świeże jabłka. Gotujesz w domu?', { fr: 'Très sain ! Sam a des pommes fraîches. Tu cuisines chez toi ?' }], self: { sam: ['Bardzo zdrowo! Moje jabłka są najlepsze. Gotujesz w domu?', { fr: 'Très sain ! Mes pommes sont les meilleures. Tu cuisines chez toi ?' }] } } ],
    b: [ { t: 'Tak, codziennie.', tr: { fr: 'Oui, tous les jours.' }, to: 'END', reply: ['Super! Przynieś mi kiedyś coś do spróbowania. Do zobaczenia!', { fr: 'Super ! Apporte-moi quelque chose à goûter un jour. À bientôt !' }] },
         { t: 'Nie, raczej nie.', tr: { fr: 'Non, pas vraiment.' }, to: 'END', reply: ['Ja też nie! Dlatego uwielbiam piekarnię. Do zobaczenia!', { fr: "Moi non plus ! C'est pour ça que j'adore la boulangerie. À bientôt !" }] } ] } },
  { nodes: {
    start: ['Cześć! Powiedz, jakie jest twoje ulubione miejsce tutaj?', { fr: 'Salut ! Dis-moi, quel est ton endroit préféré ici ?' }, 'a'],
    q2: ['Przychodzisz tu codziennie?', { fr: 'Tu viens ici tous les jours ?' }, 'b'],
    end: ['Do zobaczenia!', { fr: 'À bientôt !' }],
    huh: ['Przepraszam, możesz powtórzyć?', { fr: 'Pardon, tu peux répéter ?' }] },
   opts: {
    a: [ { t: 'Rynek.', tr: { fr: 'La place du marché.' }, to: 'q2', reply: ['Moje też! Uwielbiam tu patrzeć na ludzi. Przychodzisz tu codziennie?', { fr: "Le mien aussi ! J'adore regarder les gens ici. Tu viens tous les jours ?" }] },
         { t: 'Piekarnia.', tr: { fr: 'La boulangerie.' }, to: 'q2', reply: ['Dobry wybór! Tak tam pięknie pachnie. Przychodzisz tu codziennie?', { fr: 'Bon choix ! Ça sent si bon. Tu viens tous les jours ?' }] },
         { t: 'Fontanna.', tr: { fr: 'La fontaine.' }, to: 'q2', reply: ['Tam jest tak spokojnie. Przychodzisz tu codziennie?', { fr: "C'est si paisible là-bas. Tu viens tous les jours ?" }] } ],
    b: [ { t: 'Tak, staram się!', tr: { fr: "Oui, j'essaie !" }, to: 'END', reply: ['Super! To do jutra!', { fr: 'Super ! Alors à demain !' }] },
         { t: 'Kiedy mam czas.', tr: { fr: "Quand j'ai le temps." }, to: 'END', reply: ['W porządku. Zawsze miło cię widzieć!', { fr: 'Pas de souci. Ça me fait toujours plaisir de te voir !' }] } ] } } ]
};
Object.assign(PV.UI.fr, { friendsTitle: 'Tes amis', collLeft: 'Encore à trouver dans la ville : {n}', collAll: 'Tout est trouvé, bravo !' });
Object.assign(PV.UI.pl, { friendsTitle: 'Twoi przyjaciele', collLeft: 'Do znalezienia w mieście: {n}', collAll: 'Wszystko znalezione, brawo!' });
/* voix enregistrées : mention obligatoire tant qu'elles viennent de l'offre gratuite ElevenLabs */
Object.assign(PV.UI.fr, { voiceCredit: 'Voix des habitants : elevenlabs.io' });
Object.assign(PV.UI.pl, { voiceCredit: 'Głosy mieszkańców: elevenlabs.io' });
