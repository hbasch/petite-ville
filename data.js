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

/* ---------- Interface ---------- */
PV.UI = {
 fr:{
  tagline:"Apprends une langue en vivant dans une petite ville.",
  signupTitle:'Crée ton compte',loginTitle:'Content de te revoir',
  signupWhy:'Ton compte garde ta progression, tes cartes et ta série de jours, sur tous tes appareils.',
  pseudo:'Pseudo',email:'Email',password:'Mot de passe (6 caractères min.)',speak:'Je parle',learn:"J'apprends",
  create:'Créer mon compte',login:'Me connecter',haveAcc:"J'ai déjà un compte",noAcc:'Créer un compte',
  checkMail:'Compte créé. Confirme ton adresse avec le lien reçu par email, puis connecte-toi.',
  localMode:'Mode local : ce compte reste sur cet appareil.',
  langs:{fr:'Français',pl:'Polski',en:'Anglais'},learnLangs:{en:'Anglais',pl:'Polonais'},
  scene:'Scène 1 · La boulangerie',free:'Gratuit',
  mission:'Mission',hide:'Réduire',show:'Afficher',
  t_talk:'Parle au boulanger',t_order:'Commande 2 croissants et 1 baguette',t_pay:'Paie le bon montant',t_words:'Découvre 12 mots',
  found:'Mots découverts',listen:'Écouter',repeat:'Répéter',save:'Ajouter à mes cartes',saved:'Dans mes cartes ✓',
  replay:'Réécouter',translate:'Traduction',you:'Toi',speakBtn:'Parler',listening:'Je t\'écoute…',
  heard:'Entendu',notUnderstood:"Je n'ai pas bien compris. Réessaie ou touche une réponse.",
  noMic:'La reconnaissance vocale ne marche pas dans ce navigateur. Essaie Chrome, Edge ou Safari. Tu peux toucher les réponses.',
  micDenied:"Autorise le micro pour parler à {b}.",
  pronGood:'Bien prononcé !',pronClose:'Presque. On a entendu : « {h} »',
  voiceNote:'Pour ce test, la voix est générée par ton navigateur. Dans la vraie version, ce seront des comédiens.',
  cards:'Mes cartes',cardsSub:'Les cartes à revoir aujourd\'hui passent en premier.',review:'Réviser',reveal:'Voir la réponse',knew:'Je savais',again:'À revoir',
  noCards:"Aucune carte pour l'instant. Touche un objet puis « Ajouter à mes cartes ».",howSay:'Comment dit-on…',due:'à revoir',reviewDone:'Révision terminée pour aujourd\'hui.',
  introTitle:'Bienvenue à la',introText:'Ici, tout se passe en {l}. Explore la boutique, apprends le nom des choses, puis fais tes courses en parlant à {b}.',
  step1:'Touche un objet pour entendre son nom',step2:'Fais glisser pour tourner, pince ou molette pour zoomer',step3:'Touche {b} et réponds-lui à voix haute',
  enter:'Entrer dans la boulangerie',
  winTitle:'Mission réussie',winText:'Tu as commandé et payé en {l}.',wWords:'mots découverts',wCards:'cartes gardées',wErr:'erreurs',wSpoken:'phrases dites à voix haute',
  nextScene:'Scène suivante : le café',plus:'Avec Petite Ville+ · 10 € par an · toutes les scènes et missions (maquette, aucun paiement)',
  againBtn:'Rejouer la mission',explore:'Continuer à explorer',
  level:'Niveau',streak:'Série',days:'j',daily:'Objectif du jour',
  menuLang:'Langues',menuStreet:'La rue de Londres (bêta, anglais)',logout:'Me déconnecter',saveLang:'Changer',
  errGeneric:'Une erreur est survenue : ',errFields:'Remplis tous les champs.',synced:'Progression sauvegardée',
  xpWord:'+5 XP · nouveau mot',xpMission:'+50 XP · mission',xpPron:'+10 XP · bonne prononciation',xpSpoken:'+5 XP · phrase dite'
 },
 pl:{
  tagline:'Ucz się języka, żyjąc w małym miasteczku.',
  signupTitle:'Załóż konto',loginTitle:'Miło cię znowu widzieć',
  signupWhy:'Konto zapisuje twoje postępy, fiszki i serię dni na wszystkich urządzeniach.',
  pseudo:'Pseudonim',email:'E-mail',password:'Hasło (min. 6 znaków)',speak:'Mówię po',learn:'Uczę się',
  create:'Załóż konto',login:'Zaloguj się',haveAcc:'Mam już konto',noAcc:'Załóż konto',
  checkMail:'Konto założone. Potwierdź adres e-mail linkiem z wiadomości, a potem się zaloguj.',
  localMode:'Tryb lokalny: konto zostaje na tym urządzeniu.',
  langs:{fr:'Français',pl:'Polski',en:'Angielski'},learnLangs:{en:'Angielski',pl:'Polski'},
  scene:'Scena 1 · Piekarnia',free:'Za darmo',
  mission:'Misja',hide:'Zwiń',show:'Pokaż',
  t_talk:'Porozmawiaj z piekarzem',t_order:'Zamów 2 rogaliki i 1 bagietkę',t_pay:'Zapłać właściwą kwotę',t_words:'Odkryj 12 słów',
  found:'Odkryte słowa',listen:'Posłuchaj',repeat:'Powtórz',save:'Dodaj do fiszek',saved:'W fiszkach ✓',
  replay:'Powtórz nagranie',translate:'Tłumaczenie',you:'Ty',speakBtn:'Mów',listening:'Słucham…',
  heard:'Usłyszano',notUnderstood:'Nie zrozumiałem. Spróbuj jeszcze raz albo wybierz odpowiedź.',
  noMic:'Rozpoznawanie mowy nie działa w tej przeglądarce. Spróbuj Chrome, Edge albo Safari. Możesz też klikać odpowiedzi.',
  micDenied:'Zezwól na mikrofon, żeby rozmawiać z {b}.',
  pronGood:'Świetna wymowa!',pronClose:'Prawie. Usłyszano: „{h}”',
  voiceNote:'W tym teście głos generuje przeglądarka. W prawdziwej wersji nagrają go aktorzy.',
  cards:'Moje fiszki',cardsSub:'Fiszki do powtórki na dziś są pierwsze.',review:'Powtórka',reveal:'Pokaż odpowiedź',knew:'Wiedziałem',again:'Jeszcze raz',
  noCards:'Na razie brak fiszek. Kliknij przedmiot, a potem „Dodaj do fiszek”.',howSay:'Jak powiedzieć…',due:'do powtórki',reviewDone:'Powtórka na dziś skończona.',
  introTitle:'Witaj w',introText:'Tutaj wszystko dzieje się po {l}. Zwiedź sklep, poznaj nazwy rzeczy, a potem zrób zakupy, rozmawiając z {b}.',
  step1:'Kliknij przedmiot, żeby usłyszeć jego nazwę',step2:'Przeciągnij, żeby się obrócić; kółko lub szczypanie, żeby przybliżyć',step3:'Kliknij {b} i odpowiadaj na głos',
  enter:'Wejdź do piekarni',
  winTitle:'Misja zaliczona',winText:'Zamówiłeś i zapłaciłeś po {l}.',wWords:'odkryte słowa',wCards:'zapisane fiszki',wErr:'błędy',wSpoken:'zdania powiedziane na głos',
  nextScene:'Następna scena: kawiarnia',plus:'W Petite Ville+ · 45 zł rocznie · wszystkie sceny i misje (makieta, bez płatności)',
  againBtn:'Zagraj jeszcze raz',explore:'Zwiedzaj dalej',
  level:'Poziom',streak:'Seria',days:'dni',daily:'Cel dnia',
  menuLang:'Języki',menuStreet:'Uliczka w Londynie (beta, angielski)',logout:'Wyloguj się',saveLang:'Zmień',
  errGeneric:'Wystąpił błąd: ',errFields:'Wypełnij wszystkie pola.',synced:'Postępy zapisane',
  xpWord:'+5 XP · nowe słowo',xpMission:'+50 XP · misja',xpPron:'+10 XP · dobra wymowa',xpSpoken:'+5 XP · zdanie na głos'
 }
};
/* nom de la langue apprise dans la phrase « tout se passe en … » */
PV.IN_LANG = {fr:{en:'anglais',pl:'polonais'},pl:{en:'angielsku',pl:'polsku'}};
