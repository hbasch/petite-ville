const fs = require('fs'); const src = fs.readFileSync(process.argv[2], 'utf8');
var T = 'en'; eval(src.slice(src.indexOf('const NUM = {'), src.indexOf('function micError')).replace(/^const /gm, 'var '));
const TRAP = { rosaB: [2], leoB: [2], mayaA: [2], order: [1, 2], samA: [2] };
let K = '';
const O = a => a.map((t, i) => ({ t, tip: (TRAP[K] || []).includes(i) ? { fr: 'x' } : undefined }));
const S = {
 rosaB: ['Yes, I love flowers!', 'Not really.', 'Yes, I like.'],
 leoB: ["Yes, it's beautiful today!", 'Yes, but a bit cold.', 'Weather is yes.'],
 mayaA: ["It's over there, next to the pharmacy.", "Sorry, I don't know.", "It's a bakery."],
 first: ['Hello!'], quest: ['Of course!'], bye: ['Thanks, you too! Goodbye!', 'Bye!'],
 order: ['Two croissants and a baguette, please.', 'I want bread. Give.', 'Good night!'],
 samA: ['Can I have four apples, please?', 'How much are the apples?', 'I want banana.'],
};
// [jeu, phrase dite, réponse attendue (-1 = pas sûr), commentaire]
const C = [
 ['rosaB', 'yes I like flowers', 0, 'phrase correcte, contient les mots du piège'],
 ['rosaB', 'yes I do', 0, 'réponse correcte suggérée par le conseil lui-même'],
 ['leoB', 'yes the weather is beautiful', 0, 'phrase correcte'],
 ['leoB', 'yes the weather is nice today', 0, 'phrase correcte'],
 ['mayaA', "it's next to the bakery", 0, 'indication correcte'],
 ['first', 'hello Rosa', 0, 'premier mot du joueur'],
 ['first', 'hello hello', 0, ''],
 ['quest', 'yes of course', 0, 'accepter la demande'],
 ['quest', 'sure', 0, ''],
 ['bye', 'bye bye', 1, ''],
 ['bye', 'goodbye Tom', 0, ''],
 ['order', 'I want two croissants and a baguette', 0, ''],
 ['order', 'good morning', -1, 'ne doit pas valider Good night'],
 ['samA', 'I would like four apples please', 0, ''],
];
let ok = 0;
for (const [k, said, want, why] of C) { K = k; const o = O(S[k]), r = bestOpt([said], o), got = r.sure ? o.indexOf(r.best) : -1; if (got === want) ok++;
  console.log((got === want ? 'ok   ' : 'FAUX ') + k.padEnd(6) + JSON.stringify(said).padEnd(36) + '-> ' + (got >= 0 ? JSON.stringify(S[k][got]) : 'pas sûr') + '  (attendu ' + (want >= 0 ? JSON.stringify(S[k][want]) : 'pas sûr') + ') ' + why); }
console.log(ok + '/' + C.length);
for (const [h, t] of [['still', 'till'], ['category', 'cat'], ['cupboard', 'cup'], ['street', 'tree'], ['carrot', 'car'], ['take', 'cake'], ['lake', 'cake'], ['camp', 'lamp'], ['public', 'pub'], ['tell', 'till']]) console.log('pron « ' + h + ' » pour « ' + t + ' » = ' + pronScore([h], t).best.toFixed(2) + (pronScore([h], t).best >= .75 ? '  -> « Bien prononcé ! »' : ''));
