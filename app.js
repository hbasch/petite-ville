{
const $ = id => document.getElementById(id);
const CFG = window.PV_CONFIG || {};
const SB = (CFG.url && CFG.key && window.supabase) ? window.supabase.createClient(CFG.url, CFG.key) : null;
const W = PV.WORDS, IDS = Object.keys(W), GOAL = 12;
const today = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
const dayNum = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
const store = { get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } } };

let ui = store.get('pv_ui') || ((navigator.language || '').toLowerCase().startsWith('pl') ? 'pl' : 'fr');
let T = 'en', U = PV.UI[ui], S, D, user = null, P = null, L = null;
const tasks = { talk: false, order: false, pay: false };
let mistakes = 0, spokenSession = 0;

/* ---------- textes ---------- */
const fill = (s, o) => s.replace(/\{(\w)\}/g, (m, k) => o[k] ?? m);
function applyUI() {
  U = PV.UI[ui]; document.documentElement.lang = ui;
  document.querySelectorAll('[data-i]').forEach(el => { const v = U[el.dataset.i]; if (typeof v === 'string') el.textContent = v; });
  document.querySelectorAll('.uiSwitch button').forEach(b => b.classList.toggle('on', b.dataset.ui === ui));
}
function fillSelects(uiSel, tSel, uiVal, tVal) {
  uiSel.innerHTML = ''; tSel.innerHTML = '';
  ['fr', 'pl'].forEach(k => uiSel.add(new Option(U.langs[k], k, false, k === uiVal)));
  ['en', 'pl'].forEach(k => { const o = new Option(U.learnLangs[k], k, false, k === tVal); o.disabled = (k === 'pl' && uiVal === 'pl'); tSel.add(o); });
  if (uiVal === 'pl' && tVal === 'pl') tSel.value = 'en';
}
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.remove('hidden'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.add('hidden'), 1800); }

/* ---------- voix ---------- */
let voice = null;
function pickVoice() { try { const v = speechSynthesis.getVoices(), lang = S ? S.voice : 'en-GB'; voice = v.find(x => x.lang === lang) || v.find(x => x.lang.slice(0, 2) === lang.slice(0, 2)) || null; } catch (e) { /* none */ } }
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = pickVoice;
function say(t, o) { o = o || {}; try { if (!o.queue) speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = S.voice; if (voice) u.voice = voice; u.rate = o.rate || .9; u.pitch = o.pitch || 1; speechSynthesis.speak(u); } catch (e) { /* no speech */ } }

/* ---------- reconnaissance vocale ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null;
function listen(onInterim, onFinal, onError, onEnd) {
  if (!SR) { onError('unsupported'); return; }
  try { speechSynthesis.cancel(); } catch (e) { /* none */ }
  if (rec) try { rec.abort(); } catch (e) { /* none */ }
  rec = new SR(); rec.lang = S.voice; rec.interimResults = true; rec.maxAlternatives = 4; rec.continuous = false;
  let done = false;
  rec.onresult = e => {
    const r = e.results[e.results.length - 1];
    if (r.isFinal) { done = true; const alts = []; for (let i = 0; i < r.length; i++) alts.push(r[i].transcript); onFinal(alts); }
    else onInterim(r[0].transcript);
  };
  rec.onerror = e => { done = true; onError(e.error); };
  rec.onend = () => { if (!done) onError('no-speech'); onEnd && onEnd(); rec = null; };
  try { rec.start(); } catch (e) { onError('busy'); }
}
const NUM = { en: { 1: 'one', 2: 'two', 4: 'four', 5: 'five', 10: 'ten', 20: 'twenty', 50: 'fifty' }, pl: { 2: 'dwa', 5: 'piec', 10: 'dziesiec', 15: 'pietnascie', 20: 'dwadziescia', 50: 'piecdziesiat' } };
const EXP = { heres: 'here is', thats: 'that is', its: 'it is', whats: 'what is', id: 'i would', ill: 'i will', im: 'i am' };
function norm(s) {
  return s.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[’']s\b/g, ' is').replace(/[’']ll\b/g, ' will').replace(/[’']d\b/g, ' would').replace(/[’']m\b/g, ' am').replace(/n[’']t\b/g, ' not').replace(/£/g, ' ').replace(/(\d+)[.,](\d+)/g, '$1 $2').replace(/'/g, '').replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/).filter(Boolean).flatMap(w => (EXP[w] || w).split(' ')).map(w => NUM[T][w] || (w === 'zl' ? 'zlotych' : w));
}
const same = (a, b) => a === b || (a.length >= 5 && b.length >= 5 && a.slice(0, 5) === b.slice(0, 5));
function score(said, opt) {
  const a = norm(said), b = norm(opt); if (!a.length || !b.length) return 0;
  let m = 0; const used = new Set();
  b.forEach(w => { const i = a.findIndex((x, j) => !used.has(j) && same(x, w)); if (i >= 0) { used.add(i); m++; } });
  return m / b.length * .75 + m / a.length * .25;
}
function lev(a, b) { const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; }
function micError(err, out) {
  if (err === 'unsupported') out.textContent = U.noMic;
  else if (err === 'not-allowed' || err === 'service-not-allowed') out.textContent = fill(U.micDenied, { b: S.baker });
  else out.textContent = U.notUnderstood;
}

/* ---------- progression ---------- */
const blankLang = () => ({ found: [], cards: {}, pron: {}, missions: 0 });
function normalizeP(d, meta) {
  d = d || {};
  return { pseudo: d.pseudo || meta.pseudo || 'Moi', ui: d.ui || meta.ui || ui, t: d.t || meta.t || 'en', xp: d.xp || 0, streak: d.streak || 0, lastDay: d.lastDay || '', dailyXp: d.dailyXp || 0, dailyDay: d.dailyDay || '', spoken: d.spoken || 0,
    L: { en: Object.assign(blankLang(), (d.L || {}).en), pl: Object.assign(blankLang(), (d.L || {}).pl) } };
}
let saveH = null;
function save(now) {
  clearTimeout(saveH);
  const run = async () => {
    if (SB && user) { const { error } = await SB.from('progress').upsert({ user_id: user.id, data: P, updated_at: new Date().toISOString() }); if (error) console.warn(error); }
    else store.set('pv_local', P);
  };
  if (now) return run();
  saveH = setTimeout(run, 1200);
}
function touchStreak() {
  const t = today(), y = new Date(Date.now() - 864e5); const yd = y.getFullYear() + '-' + (y.getMonth() + 1) + '-' + y.getDate();
  if (P.lastDay !== t) { P.streak = P.lastDay === yd ? P.streak + 1 : 1; P.lastDay = t; }
  if (P.dailyDay !== t) { P.dailyXp = 0; P.dailyDay = t; }
}
function addXP(n, msg) { P.xp += n; P.dailyXp += n; if (msg) toast(msg); updMe(); save(); }
function updMe() {
  const lvl = Math.floor(P.xp / 100) + 1;
  $('meName').textContent = P.pseudo; $('av').textContent = (P.pseudo[0] || '?').toUpperCase();
  $('meLvl').textContent = U.level + ' ' + lvl + ' · ' + P.xp + ' XP · ' + U.learnLangs[T];
  $('xpBar').style.width = (P.xp % 100) + '%';
  $('stN').textContent = P.streak; $('streak').title = U.streak + ' : ' + P.streak + ' ' + U.days;
  $('dailyN').textContent = Math.min(P.dailyXp, 50) + '/50 XP';
}
function updMission() {
  const n = L.found.length; $('fc').textContent = n + '/' + IDS.length; $('fb').style.width = Math.min(100, n / GOAL * 100) + '%';
  const t = Object.assign({ words: n >= GOAL }, tasks);
  document.querySelectorAll('#mission li').forEach(li => li.classList.toggle('done', !!t[li.dataset.t]));
  $('deckN').textContent = Object.keys(L.cards).length;
}

/* ---------- compte ---------- */
let mode = 'signup';
function renderAuth() {
  applyUI();
  const f = $('authForm'); f.classList.toggle('login', mode === 'login');
  $('authTitle').textContent = mode === 'login' ? U.loginTitle : U.signupTitle;
  $('authWhy').classList.toggle('hidden', mode === 'login');
  $('authBtn').textContent = mode === 'login' ? U.login : U.create;
  $('authSwitch').textContent = mode === 'login' ? U.noAcc : U.haveAcc;
  $('aPass').autocomplete = mode === 'login' ? 'current-password' : 'new-password';
  $('localNote').textContent = SB ? '' : U.localMode;
  fillSelects($('aUi'), $('aT'), ui, $('aT').value || (ui === 'pl' ? 'en' : 'en'));
}
function authMsg(t, ok) { const m = $('authMsg'); m.textContent = t; m.classList.toggle('ok', !!ok); m.classList.toggle('hidden', !t); }
document.querySelectorAll('.uiSwitch button').forEach(b => b.onclick = () => { ui = b.dataset.ui; store.set('pv_ui', ui); renderAuth(); });
$('aUi').onchange = () => { ui = $('aUi').value; store.set('pv_ui', ui); renderAuth(); };
$('authSwitch').onclick = () => { mode = mode === 'login' ? 'signup' : 'login'; authMsg(''); renderAuth(); };
$('authForm').onsubmit = async e => {
  e.preventDefault(); authMsg('');
  const email = $('aEmail').value.trim(), pass = $('aPass').value, pseudo = $('aPseudo').value.trim();
  const meta = { pseudo, ui, t: $('aT').value };
  if (!email || pass.length < 6 || (mode === 'signup' && !pseudo)) { authMsg(U.errFields); return; }
  const btn = $('authBtn'); btn.disabled = true;
  try {
    if (!SB) { const old = store.get('pv_local'); P = normalizeP(old && mode === 'login' ? old : null, meta); user = { id: 'local', email }; save(true); return start(); }
    if (mode === 'signup') {
      const { data, error } = await SB.auth.signUp({ email, password: pass, options: { data: meta, emailRedirectTo: location.origin + location.pathname } });
      if (error) throw error;
      if (!data.session) { authMsg(U.checkMail, true); mode = 'login'; renderAuth(); return; }
      user = data.user; await loadP(meta);
    } else {
      const { data, error } = await SB.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      user = data.user; await loadP(meta);
    }
    start();
  } catch (err) { authMsg(U.errGeneric + (err.message || err)); }
  finally { btn.disabled = false; }
};
async function loadP(meta) {
  const { data, error } = await SB.from('progress').select('data').eq('user_id', user.id).maybeSingle();
  if (error) console.warn(error);
  P = normalizeP(data && data.data, Object.assign({}, user.user_metadata || {}, meta && data ? {} : meta || {}));
  if (!data) await save(true);
}
async function boot() {
  renderAuth();
  if (SB) {
    const { data } = await SB.auth.getSession();
    if (data.session) { user = data.session.user; await loadP(null); return start(); }
  } else {
    const loc = store.get('pv_local'); if (loc) { P = normalizeP(loc, {}); user = { id: 'local' }; return start(); }
  }
}

/* ---------- démarrage du jeu ---------- */
function start() {
  ui = P.ui; T = (P.ui === 'pl' && P.t === 'pl') ? 'en' : P.t; store.set('pv_ui', ui);
  S = PV.SCENE[T]; D = PV.DLG[T]; L = P.L[T]; pickVoice();
  touchStreak(); applyUI(); save();
  $('auth').classList.add('hidden');
  ['me', 'mission', 'deckBtn'].forEach(id => $(id).classList.remove('hidden'));
  fillSelects($('mUi'), $('mT'), ui, T);
  $('shopName').textContent = S.shop; $('dWho').textContent = S.baker;
  $('introText').textContent = fill(U.introText, { l: PV.IN_LANG[ui][T], b: S.baker });
  $('step3').textContent = fill(U.step3, { b: S.baker });
  $('intro').classList.remove('hidden');
  if (!SR) $('dMic').disabled = true;
  updMe(); updMission(); renderDeck();
  const H = { board: S.board, open: S.open, flour: S.flour,
    label: id => L.found.includes(id) ? W[id][T] : '?',
    pick: id => id === 'baker' ? openDlg() : showWord(id),
    bubble: () => !tasks.pay };
  if (window.THREE) (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => window.buildScene(H));
}
$('enter').onclick = () => { $('intro').classList.add('hidden'); say(T === 'pl' ? 'Dzień dobry!' : 'Welcome!'); };

/* menu profil */
$('meBtn').onclick = () => $('menu').classList.toggle('hidden');
$('mUi').onchange = () => fillSelects($('mUi'), $('mT'), $('mUi').value, $('mT').value);
$('mSave').onclick = async () => { P.ui = $('mUi').value; P.t = $('mT').value; await save(true); location.reload(); };
$('mOut').onclick = async () => { if (SB) await SB.auth.signOut(); else localStorage.removeItem('pv_local'); location.reload(); };

/* ---------- panneaux ---------- */
function show(id) { ['card', 'dlg'].forEach(p => $(p).classList.toggle('hidden', p !== id)); document.body.classList.toggle('panel-open', !!id); if (!id && rec) try { rec.abort(); } catch (e) { /* none */ } }
function discover(id) { if (!L.found.includes(id)) { L.found.push(id); addXP(5, U.xpWord); updMission(); } }

let curWord = null;
function showWord(id) {
  const w = W[id]; curWord = id; discover(id);
  $('wT').textContent = w[T]; $('wUi').textContent = w[ui]; $('wEx').textContent = w.ex[T]; $('wExUi').textContent = w.ex[ui];
  const note = ((PV.NOTES[T] || {})[id] || {})[ui];
  $('wNote').textContent = note || ''; $('wNote').classList.toggle('hidden', !note);
  $('wPron').classList.add('hidden'); $('wRepeat').classList.toggle('hidden', !SR);
  updSave(); show('card'); say(w[T]);
}
function updSave() { $('wSave').textContent = L.cards[curWord] ? U.saved : U.save; }
$('wListen').onclick = () => { const w = W[curWord]; say(w[T]); say(w.ex[T], { queue: true }); };
$('wSave').onclick = () => { if (L.cards[curWord]) delete L.cards[curWord]; else { L.cards[curWord] = { box: 1, due: dayNum() }; } save(); updSave(); updMission(); renderDeck(); };
$('wRepeat').onclick = () => {
  const btn = $('wRepeat'), out = $('wPron'), target = norm(W[curWord][T]).join(' ');
  btn.classList.add('on'); out.className = 'pron'; out.textContent = U.listening;
  listen(t => { out.textContent = t; }, alts => {
    let best = 0, heard = alts[0] || '';
    alts.forEach(a => { const n = norm(a).join(' '); const s = n.includes(target) ? 1 : 1 - lev(n, target) / Math.max(n.length, target.length, 1); if (s > best) { best = s; heard = a; } });
    if (best >= .75) { out.textContent = U.pronGood; if (!L.pron[curWord]) { L.pron[curWord] = 1; addXP(10, U.xpPron); } }
    else { out.className = 'pron bad'; out.textContent = fill(U.pronClose, { h: heard }); }
  }, err => { out.className = 'pron bad'; micError(err, out); }, () => btn.classList.remove('on'));
};

/* ---------- dialogue ---------- */
let lastLine = '', curOpts = [];
function render(line, tr, key) {
  lastLine = line; $('dLine').textContent = line; $('dTrTxt').textContent = (tr || {})[ui] || '';
  curOpts = key ? D.opts[key] : [];
  const box = $('dOpts'); box.innerHTML = '';
  curOpts.forEach(o => {
    const b = document.createElement('button'); b.className = 'opt'; b.type = 'button';
    const e = document.createElement('span'); e.textContent = o.t; const f = document.createElement('div'); f.className = 'fr'; f.textContent = o.tr[ui] || '';
    b.append(e, f); b.onclick = () => choose(o, false); box.appendChild(b);
  });
  $('dMic').disabled = !SR || !curOpts.length;
}
function go(id, line, queue) { const n = D.nodes[id]; const l = line ? line[0] : n[0]; render(l, line ? line[1] : n[1], n[2]); say(l, { queue }); }
function choose(o, spoken) {
  $('dMe').textContent = U.you + ' : « ' + o.t + ' »';
  if (!spoken) say(o.t, { pitch: 1.25, rate: 1 });
  if (o.task) tasks[o.task] = true;
  if (o.tip) { mistakes++; $('dTip').textContent = o.tip[ui]; $('dTip').classList.remove('hidden'); } else $('dTip').classList.add('hidden');
  if (spoken) { spokenSession++; P.spoken++; if (!o.tip) addXP(5, U.xpSpoken); }
  updMission();
  if (o.to === 'END') {
    const e = D.nodes.end; render(e[0], e[1], null); say(e[0], { queue: true });
    setTimeout(() => { if (tasks.order && tasks.pay) win(); else show(null); }, 2400); return;
  }
  go(o.to, o.reply, true);
}
function openDlg() { tasks.talk = true; discover('baker'); updMission(); $('dMe').textContent = ''; $('dHeard').textContent = ''; $('dTip').classList.add('hidden'); show('dlg'); go('start'); }
$('dReplay').onclick = () => say(lastLine);
$('dTr').onclick = () => $('dlg').classList.toggle('tr');
$('dMic').onclick = () => {
  const mic = $('dMic'), out = $('dHeard');
  if (rec) { try { rec.stop(); } catch (e) { /* none */ } return; }
  mic.classList.add('on'); out.textContent = U.listening;
  listen(t => { out.textContent = t; }, alts => {
    let best = null, bs = 0, second = 0, heard = alts[0] || '';
    alts.forEach(a => curOpts.forEach(o => { const s = score(a, o.t); if (s > bs) { if (best !== o) second = bs; bs = s; best = o; heard = a; } else if (o !== best && s > second) second = s; }));
    out.innerHTML = ''; const lb = document.createElement('span'); lb.textContent = U.heard + ' : '; const hb = document.createElement('b'); hb.textContent = '« ' + heard + ' »'; out.append(lb, hb);
    if (best && bs >= .5 && bs - second >= .08) choose(best, true);
    else { const h = D.nodes.huh; $('dTip').textContent = U.notUnderstood; $('dTip').classList.remove('hidden'); say(h[0]); }
  }, err => micError(err, out), () => mic.classList.remove('on'));
};

function win() {
  show(null); L.missions++; addXP(50, U.xpMission);
  $('winText').textContent = fill(U.winText, { l: PV.IN_LANG[ui][T] });
  $('sW').textContent = L.found.length; $('sS').textContent = spokenSession; $('sE').textContent = mistakes;
  $('win').classList.remove('hidden'); save(true);
}
$('again').onclick = () => { $('win').classList.add('hidden'); tasks.order = tasks.pay = false; mistakes = 0; spokenSession = 0; updMission(); openDlg(); };
$('explore').onclick = () => $('win').classList.add('hidden');

/* ---------- cartes (répétition espacée) ---------- */
const GAP = [0, 1, 3, 7, 14, 30];
const spk = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z"/></svg>';
function renderDeck() {
  const ul = $('cards'); ul.innerHTML = ''; const ids = Object.keys(L.cards), d = dayNum();
  ids.sort((a, b) => L.cards[a].due - L.cards[b].due).forEach(id => {
    const w = W[id]; if (!w) return; const li = document.createElement('li');
    const box = document.createElement('div'); const b = document.createElement('b'); b.textContent = w[T];
    if (L.cards[id].due <= d) { const s = document.createElement('span'); s.className = 'due'; s.textContent = U.due; b.appendChild(s); }
    const f = document.createElement('div'); f.className = 'fr'; f.textContent = w[ui]; box.append(b, f);
    const p = document.createElement('button'); p.className = 'ib'; p.type = 'button'; p.setAttribute('aria-label', U.listen); p.innerHTML = spk; p.onclick = () => say(w[T]);
    const r = document.createElement('button'); r.className = 'ib'; r.type = 'button'; r.setAttribute('aria-label', '×'); r.textContent = '×';
    r.onclick = () => { delete L.cards[id]; save(); renderDeck(); updMission(); if (curWord === id) updSave(); };
    li.append(box, p, r); ul.appendChild(li);
  });
  $('emptyDeck').classList.toggle('hidden', ids.length > 0); $('revBtn').classList.toggle('hidden', !ids.length);
}
let queue = [];
function flash() {
  if (!queue.length) { $('fQ').textContent = U.reviewDone; $('fA').classList.add('hidden'); ['fShow', 'fAgain', 'fKnew'].forEach(i => $(i).classList.add('hidden')); return; }
  const w = W[queue[0]]; $('fQ').textContent = w[ui]; $('fA').textContent = w[T]; $('fA').classList.add('hidden');
  $('fShow').classList.remove('hidden'); $('fAgain').classList.add('hidden'); $('fKnew').classList.add('hidden');
}
$('revBtn').onclick = () => { const d = dayNum(); queue = Object.keys(L.cards).filter(id => L.cards[id].due <= d); $('flash').classList.remove('hidden'); flash(); };
$('fShow').onclick = () => { $('fA').classList.remove('hidden'); $('fShow').classList.add('hidden'); $('fAgain').classList.remove('hidden'); $('fKnew').classList.remove('hidden'); say(W[queue[0]][T]); };
$('fKnew').onclick = () => { const id = queue.shift(), c = L.cards[id]; c.box = Math.min(5, c.box + 1); c.due = dayNum() + GAP[c.box]; addXP(2); renderDeck(); flash(); };
$('fAgain').onclick = () => { const id = queue.shift(), c = L.cards[id]; c.box = 1; c.due = dayNum(); queue.push(id); save(); renderDeck(); flash(); };
$('deckBtn').onclick = () => { renderDeck(); $('deck').classList.remove('hidden'); };
document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => { const t = b.dataset.close; if (t === 'deck') $('deck').classList.add('hidden'); else show(null); });
$('minBtn').onclick = () => { const m = $('mission').classList.toggle('min'); $('minBtn').textContent = m ? U.show : U.hide; };
addEventListener('keydown', e => { if (e.key === 'Escape') { show(null); $('deck').classList.add('hidden'); $('menu').classList.add('hidden'); } });

boot().catch(err => { console.error(err); authMsg(U.errGeneric + (err.message || err)); });
}
