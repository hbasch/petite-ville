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
 baker:{en:'baker',pl:'piekarz',fr:'boulanger',ex:{en:'Tom is the baker.',pl:'Tomek jest piekarzem.',fr:'Tom est le boulanger.'}}
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

/* ---------- Décor selon la langue apprise ---------- */
PV.SCENE = {
 en:{board:{title:'Prices',rows:[['Croissant','£1.20'],['Baguette','£2.10'],['Loaf of bread','£2.80'],['Doughnut','£1.50'],['Cupcake','£1.80']]},open:'OPEN',flour:'FLOUR',voice:'en-GB',baker:'Tom',shop:'Rolling Pin Bakery'},
 pl:{board:{title:'Cennik',rows:[['Rogalik','4,50 zł'],['Bagietka','6,00 zł'],['Chleb','7,00 zł'],['Pączek','3,50 zł'],['Babeczka','5,00 zł']]},open:'OTWARTE',flour:'MĄKA',voice:'pl-PL',baker:'Pan Tomek',shop:'Piekarnia pod Wałkiem'}
};

/* ---------- Dialogues : [réplique, {fr, pl}] ---------- */
PV.DLG = {
 en:{
  nodes:{
   start:['Good morning! Welcome to the Rolling Pin. What can I get you?',{fr:"Bonjour ! Bienvenue au Rolling Pin. Qu'est-ce que je vous sers ?",pl:'Dzień dobry! Witamy w Rolling Pin. Co podać?'},'order'],
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
    {t:'How much is a doughnut?',tr:{fr:'Combien coûte un beignet ?',pl:'Ile kosztuje pączek?'},to:'more2',reply:['A doughnut is one pound fifty.',{fr:"Un beignet, c'est une livre cinquante.",pl:'Pączek kosztuje funt pięćdziesiąt.'}]},
    {t:'Can I have that cake, please?',tr:{fr:"Je peux avoir ce gâteau, s'il vous plaît ?",pl:'Czy mogę prosić ten tort?'},to:'more2',reply:['Sorry, that cake is for a birthday order.',{fr:"Désolé, ce gâteau est pour une commande d'anniversaire.",pl:'Przykro mi, ten tort jest na zamówienie urodzinowe.'}]}
   ],
   pay:[
    {t:"Here's four pounds.",tr:{fr:'Voici quatre livres.',pl:'Proszę, cztery funty.'},to:'price2',reply:["Hmm, that's only four pounds. It's four pounds fifty.",{fr:"Hmm, ça ne fait que quatre livres. C'est quatre livres cinquante.",pl:'Hmm, to tylko cztery funty. Razem cztery funty pięćdziesiąt.'}],tip:{fr:"Regarde l'ardoise : 2 × 1,20 + 2,10 = 4,50.",pl:'Spójrz na tablicę: 2 × 1,20 + 2,10 = 4,50.'}},
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
   start:['Dzień dobry! Witamy w piekarni. Co podać?',{fr:"Bonjour ! Bienvenue à la boulangerie. Qu'est-ce que je vous sers ?"},'order'],
   start2:['To co podać?',{fr:"Alors, qu'est-ce que je vous sers ?"},'order'],
   more:['Oczywiście. Dwa rogaliki i bagietka. Coś jeszcze?',{fr:'Bien sûr. Deux croissants et une baguette. Autre chose ?'},'more'],
   more2:['Coś jeszcze?',{fr:'Autre chose ?'},'more'],
   price:['Razem piętnaście złotych.',{fr:'Ça fait quinze zlotys au total.'},'pay'],
   price2:['Piętnaście złotych, proszę.',{fr:"Quinze zlotys, s'il vous plaît."},'pay'],
   change:['Dziękuję! Pięć złotych reszty. Miłego dnia!',{fr:'Merci ! Cinq zlotys de monnaie. Bonne journée !'},'bye'],
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
    {t:'Ile kosztuje pączek?',tr:{fr:'Combien coûte un beignet ?'},to:'more2',reply:['Pączek kosztuje trzy pięćdziesiąt.',{fr:'Un beignet coûte trois zlotys cinquante.'}]},
    {t:'Czy mogę prosić ten tort?',tr:{fr:'Je peux avoir ce gâteau ?'},to:'more2',reply:['Przykro mi, ten tort jest na zamówienie.',{fr:'Désolé, ce gâteau est une commande.'}]}
   ],
   pay:[
    {t:'Proszę, dziesięć złotych.',tr:{fr:'Voici dix zlotys.'},to:'price2',reply:['Hmm, to tylko dziesięć. Razem piętnaście złotych.',{fr:'Hmm, ça ne fait que dix. Quinze zlotys au total.'}],tip:{fr:"Regarde l'ardoise : 2 × 4,50 + 6,00 = 15 zł."}},
    {t:'Proszę, dwadzieścia złotych.',tr:{fr:'Voici vingt zlotys.'},to:'change',task:'pay'},
    {t:'Przepraszam, ile?',tr:{fr:'Pardon, combien ?'},to:'price2',reply:['Piętnaście złotych.',{fr:'Quinze zlotys.'}]}
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
  { id: 'morning', icon: 'sun', bg: '#f3b45a', title: 'Poranek Pana Tomka', tr: { fr: 'Le petit matin de Pan Tomek' }, min: 2, s: [
   ['Jest piąta rano.', { fr: 'Il est cinq heures du matin.' }],
   ['Miasto jest ciche i ciemne.', { fr: 'La ville est calme et sombre.' }],
   ['Pan Tomek otwiera drzwi piekarni.', { fr: 'Pan Tomek ouvre la porte de la boulangerie.' }],
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
   ['Pan Tomek zagląda pod stół.', { fr: 'Pan Tomek regarde sous la table.' }],
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
  learnQ: 'Je veux apprendre', learnSub: { en: 'Avec Tom, le boulanger de Londres', pl: 'Avec Pan Tomek, à Cracovie' },
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
  introTitle: 'Bienvenue à la', introText: 'Ici, tout se passe en {l}. Touche les objets pour apprendre leur nom, puis fais tes courses en parlant à {b}.',
  step1: 'Touche un objet pour entendre son nom', step2: 'Fais glisser pour regarder autour de toi', step3: 'Touche {b} et réponds-lui à voix haute', enter: "C'est parti",
  winTitle: "Tu l'as fait, en {l}.", winText: '{b} a souri. Demain, il se souviendra de toi.',
  wWords: 'mots découverts', wSpoken: 'phrases dites à voix haute', wXp: 'XP gagnés',
  nextScene: 'La suite : le café de Rosie', plus: 'Avec Petite Ville+ · 10 € par an · toutes les scènes (maquette, aucun paiement)',
  againBtn: 'Rejouer', continueBtn: 'Continuer', close: 'Fermer',
  errGeneric: 'Une erreur est survenue : ', errFields: 'Remplis tous les champs.', accSaved: 'Compte créé, progression sauvegardée !',
  xpWord: '+5 XP · nouveau mot', xpMission: '+50 XP · mission réussie', xpPron: '+10 XP · bonne prononciation', xpSpoken: '+5 XP · phrase dite', levelUp: 'Nouveau niveau : {l} !'
 },
 pl: {
  onbTitle: 'Witaj w Petite Ville', onbText: 'Małe miasteczko, w którym uczysz się języka, rozmawiając z mieszkańcami.',
  learnQ: 'Chcę się uczyć', learnSub: { en: 'Z Tomem, piekarzem z Londynu', pl: 'Z Panem Tomkiem w Krakowie' },
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
  introTitle: 'Witaj w', introText: 'Tutaj wszystko dzieje się po {l}. Dotykaj przedmiotów, żeby poznać ich nazwy, a potem zrób zakupy, rozmawiając z: {b}.',
  step1: 'Dotknij przedmiotu, żeby usłyszeć nazwę', step2: 'Przeciągnij, żeby się rozejrzeć', step3: 'Dotknij: {b} i odpowiadaj na głos', enter: 'Zaczynamy',
  winTitle: 'Udało się, po {l}!', winText: '{b} się uśmiechnął. Jutro będzie cię pamiętał.',
  wWords: 'odkryte słowa', wSpoken: 'zdania na głos', wXp: 'zdobyte XP',
  nextScene: 'Dalej: kawiarnia Rosie', plus: 'W Petite Ville+ · 45 zł rocznie · wszystkie sceny (makieta, bez płatności)',
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
 bench:{en:'bench',pl:'ławka',fr:'banc',ex:{en:'An old man sits on the bench.',pl:'Starszy pan siedzi na ławce.',fr:'Un vieux monsieur est assis sur le banc.'}},
 streetlamp:{en:'street lamp',pl:'latarnia',fr:'réverbère',ex:{en:'The street lamps turn on at night.',pl:'Latarnie zapalają się w nocy.',fr:"Les réverbères s'allument la nuit."}},
 bicycle:{en:'bicycle',pl:'rower',fr:'vélo',ex:{en:'Her bicycle is red.',pl:'Jej rower jest czerwony.',fr:'Son vélo est rouge.'}},
 pigeon:{en:'pigeon',pl:'gołąb',fr:'pigeon',ex:{en:'A pigeon eats bread crumbs.',pl:'Gołąb je okruszki chleba.',fr:'Un pigeon mange des miettes de pain.'}},
 stall:{en:'market stall',pl:'stragan',fr:'étal',ex:{en:'This stall sells fruit.',pl:'Na tym straganie są owoce.',fr:'Cet étal vend des fruits.'}},
 apple:{en:'apple',pl:'jabłko',fr:'pomme',ex:{en:'This apple is sweet.',pl:'To jabłko jest słodkie.',fr:'Cette pomme est sucrée.'}},
 postbox:{en:'postbox',pl:'skrzynka pocztowa',fr:'boîte aux lettres',ex:{en:'Put the letter in the postbox.',pl:'Wrzuć list do skrzynki pocztowej.',fr:'Mets la lettre dans la boîte aux lettres.'}},
 cloud:{en:'cloud',pl:'chmura',fr:'nuage',ex:{en:'There is a little cloud in the sky.',pl:'Na niebie jest mała chmura.',fr:'Il y a un petit nuage dans le ciel.'}}
});
PV.TOWN_IDS = ['square','fountain','townhall','clock','bakeryShop','cafe','pharmacy','post','bookshop','florist','house','tree','bench','streetlamp','bicycle','pigeon','stall','apple','postbox','cloud'];
Object.assign(PV.NOTES.en, {
 square:{fr:'« Square » tout seul veut aussi dire « carré ».',pl:'Samo „square” znaczy też „kwadrat”.'},
 post:{fr:'En anglais américain : post office aussi, mais la boîte aux lettres se dit mailbox.',pl:'W USA skrzynka pocztowa to mailbox.'}
});
Object.assign(PV.NOTES.pl, {
 square:{fr:'Le « rynek » est la grande place au cœur des villes polonaises, comme à Cracovie.'},
 townhall:{fr:'Le ratusz se trouve souvent au milieu du rynek.'}
});
PV.SCENE.en.signs = { bakeryShop: 'BAKERY', cafe: 'CAFÉ ROSIE', pharmacy: 'PHARMACY', post: 'POST OFFICE', bookshop: 'BOOKSHOP', florist: 'FLOWERS', townhall: 'TOWN HALL' };
PV.SCENE.pl.signs = { bakeryShop: 'PIEKARNIA', cafe: 'KAWIARNIA ROSIE', pharmacy: 'APTEKA', post: 'POCZTA', bookshop: 'KSIĘGARNIA', florist: 'KWIACIARNIA', townhall: 'RATUSZ' };
PV.PLACES.unshift({ id: 'square', key: 'placeSquare', status: 'open', color: '#e7a06b' });
PV.PLACES.find(p => p.id === 'market').status = 'square';
Object.assign(PV.UI.fr, {
 placeSquare: 'La place du marché', backToSquare: 'Retour sur la place', enterBtn: 'Entrer', locked: 'Bientôt ouvert',
 photo: 'Photo', photoHint: "Choisis l'heure, puis prends ta photo.", shoot: 'Prendre la photo', photoSaved: 'Photo enregistrée !', hourLbl: 'Heure', realTime: 'Heure réelle',
 t_town: 'Découvre 6 mots sur la place',
 townIntroTitle: 'Bienvenue sur la place de', townIntroText: "Une petite ville où tout se passe en {l}. Promène-toi, touche les maisons et les objets pour apprendre leur nom, puis va faire tes courses.",
 tstep1: 'Fais glisser pour regarder, touche le sol pour marcher', tstep2: 'Touche une maison ou un objet pour apprendre son nom', tstep3: 'Trouve la boulangerie et entre chez {b}', onSquare: 'Sur la place'
});
Object.assign(PV.UI.pl, {
 placeSquare: 'Rynek', backToSquare: 'Wróć na rynek', enterBtn: 'Wejdź', locked: 'Wkrótce otwarte',
 photo: 'Zdjęcie', photoHint: 'Wybierz godzinę i zrób zdjęcie.', shoot: 'Zrób zdjęcie', photoSaved: 'Zdjęcie zapisane!', hourLbl: 'Godzina', realTime: 'Prawdziwa godzina',
 t_town: 'Odkryj 6 słów na rynku',
 townIntroTitle: 'Witaj na rynku', townIntroText: 'Małe miasteczko, gdzie wszystko dzieje się po {l}. Spaceruj, dotykaj domów i przedmiotów, żeby poznać ich nazwy, a potem idź na zakupy.',
 tstep1: 'Przeciągnij, żeby się rozejrzeć; dotknij ziemi, żeby iść', tstep2: 'Dotknij domu lub przedmiotu, żeby poznać nazwę', tstep3: 'Znajdź piekarnię i wejdź do: {b}', onSquare: 'Na rynku'
});
