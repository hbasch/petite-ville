const fs = require('fs');
const src = fs.readFileSync(process.argv[2], 'utf8');
const part = src.slice(src.indexOf('const NUM = {'), src.indexOf('function micError'));
const T = 'en';
eval(part.replace(/^const /gm, 'var ').replace(/^function /gm, 'function '));
const sets = {
  order: ['Two croissants and a baguette, please.', 'I want bread. Give.', 'Good night!'],
  more: ["No, thank you. That's all.", 'How much is a doughnut?', 'Can I have that cake, please?'],
  pay: ["Here's four pounds.", "Here's five pounds.", 'Sorry, how much?'],
  bye: ['Thanks, you too! Goodbye!', 'Bye!'],
  rosa: ['Yes, I love flowers!', 'Not really.', 'Yes, I like.'],
  weather: ['Not bad, thank you!', 'Yes, but a bit cold.', 'Weather is yes.'],
  fruit: ['Can I have four apples, please?', 'How much are the apples?', 'I want banana.'],
};
const cases = [
  ['order', 'to croissant and a bag it please', 0], ['order', 'two croissants', 0], ['order', 'croissant baguette', 0], ['order', 'I want bread', 1], ['order', 'good night', 2], ['order', 'goodnight', 2], ['order', 'the croissant end a baguette please', 0],
  ['more', 'no thank you', 0], ['more', 'no sank you that is all', 0], ['more', 'how much is a donut', 1], ['more', 'can I have the cake', 2], ['more', 'how much', 1], ['more', 'that all', 0],
  ['pay', 'here is for pounds', 0], ['pay', 'here is five pounds', 1], ['pay', 'hear is fife pound', 1], ['pay', 'here 5 pounds', 1], ['pay', 'sorry how much', 2], ['pay', 'four', 0], ['pay', 'five', 1],
  ['bye', 'thanks you too goodbye', 0], ['bye', 'bye', 1], ['bye', 'by', 1], ['bye', 'thank you to', 0],
  ['rosa', 'yes I love flowers', 0], ['rosa', 'yes I love flour', 0], ['rosa', 'not really', 1], ['rosa', 'yes I like', 2], ['rosa', 'yes', -1], ['rosa', 'I love the flower', 0],
  ['weather', 'not bad thank you', 0], ['weather', 'yes but a bit cold', 1], ['weather', 'weather is yes', 2], ['weather', 'not bad', 0], ['weather', 'a bit cold', 1], ['weather', 'yes', -1],
  ['fruit', 'can I have for apple please', 0], ['fruit', 'how much are the apple', 1], ['fruit', 'I want a banana', 2], ['fruit', 'four apples please', 0], ['fruit', 'can I have', -1], ['fruit', 'can I', -1],
  ['order', 'hello how are you', -1], ['pay', 'banana', -1], ['more', 'yes', -1],
];
let ok = 0;
for (const [k, said, want] of cases) {
  const opts = sets[k].map(t => ({ t }));
  const r = bestOpt([said], opts);
  const got = r.sure ? opts.indexOf(r.best) : -1;
  const pass = got === want;
  if (pass) ok++;
  console.log((pass ? 'ok  ' : 'FAIL') + ' ' + k.padEnd(8) + JSON.stringify(said).padEnd(40) + ' -> ' + got + ' (want ' + want + ') bs=' + r.bs.toFixed(2) + ' gap=' + r.gap.toFixed(2) + (r.ranked[0] ? ' d=' + r.ranked[0].d.toFixed(2) : ''));
}
console.log(ok + '/' + cases.length);
