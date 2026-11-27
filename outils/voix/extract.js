// Liste toutes les phrases prononcées en jeu, par langue et par locuteur
const fs = require('fs'), vm = require('vm');
const ctx = { window: {}, console }; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('' + require('path').join(__dirname, '../../data.js') + '', 'utf8'), ctx);
const PV = ctx.PV || ctx.window.PV;
const CITY = { en: 'Edinburgh', pl: 'Wrocław' }, LOC = { en: 'w Edynburgu', pl: 'we Wrocławiu' };
const fill = (s, L) => String(s).replace(/\{c\}/g, CITY[L]).replace(/\{cl\}/g, LOC[L]);
const out = { en: [], pl: [] };
function add(L, who, t) { if (!t) return; t = fill(t, L); if (!out[L].some(x => x.who === who && x.t === t)) out[L].push({ who, t }); }
function walk(L, who, dlg, player) {
  Object.values(dlg.nodes || {}).forEach(n => n && add(L, who, n[0]));
  Object.values(dlg.opts || {}).forEach(arr => arr.forEach(o => { if (o.reply) add(L, who, o.reply[0]); if (player) add(L, 'you', o.t); }));
}
const NPC = Object.keys(PV.NPCS);
for (const L of ['en', 'pl']) {
  walk(L, 'baker', PV.DLG[L], true);
  NPC.forEach(id => walk(L, id, PV.NPCS[id].dlg[L], true));
  walk(L, 'rosa', PV.FIRST[L], true);
  const fol = [PV.FOLLOW[L]].concat((PV.FOLLOW2 || {})[L] || []);
  fol.forEach(d => NPC.forEach(id => walk(L, id, d, true)));
  PV.QUESTS.filter(q => q[L]).forEach(q => { add(L, q.giver, q[L][0]); add(L, q.giver, PV.QUEST_OK[L].reply[0]); add(L, 'you', PV.QUEST_OK[L].t); });
  NPC.forEach(id => add(L, id, L === 'pl' ? 'Dziękuję!' : 'Thank you!'));
  add(L, 'baker', L === 'pl' ? 'Dziękuję!' : 'Thank you!');
  (PV.GREET[L] || []).forEach(g => add(L, 'passerby', g[0]));
  add(L, 'passerby', L === 'pl' ? 'Dzień dobry!' : 'Hello!');
  Object.entries(PV.WORDS).forEach(([id, w]) => { if (w[L]) add(L, 'word', w[L]); if (w.ex && w.ex[L]) add(L, 'word', w.ex[L]); });
}
const sum = {};
for (const L of ['en', 'pl']) out[L].forEach(x => { const k = L + ':' + x.who; sum[k] = sum[k] || { n: 0, c: 0 }; sum[k].n++; sum[k].c += x.t.length; });
console.log(sum);
const tot = L => out[L].reduce((a, x) => a + x.t.length, 0);
console.log('total en', tot('en'), 'pl', tot('pl'));
fs.writeFileSync('/home/claude/voices/lines.json', JSON.stringify(out, null, 1));
console.log('NPCS', NPC.map(id => id + ' ' + PV.NPCS[id].name + ' ' + PV.NPCS[id].role.fr));
