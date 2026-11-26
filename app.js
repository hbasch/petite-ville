{
const $ = id => document.getElementById(id);
const CFG = window.PV_CONFIG || {};
const SB = (CFG.url && CFG.key && window.supabase) ? window.supabase.createClient(CFG.url, CFG.key) : null;
const W = PV.WORDS, IDS = Object.keys(W), GOAL = 12;
const ymd = d => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
const today = () => ymd(new Date());
const dayNum = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 864e5);
const monthKey = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };
const store = { get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } }, del(k) { try { localStorage.removeItem(k); } catch (e) { /* */ } } };
const fill = (s, o) => s.replace(/\{(\w)\}/g, (m, k) => (o[k] ?? m));
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
const icon = (id) => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); const u = document.createElementNS('http://www.w3.org/2000/svg', 'use'); u.setAttribute('href', '#i-' + id); s.appendChild(u); return s; };

let ui = store.get('pv_ui') || ((navigator.language || '').toLowerCase().startsWith('pl') ? 'pl' : 'fr');
let T = 'en', U = PV.UI[ui], S, D, user = null, P = null, L = null, started = false, tab = 'town', place = 'town', town = null, bakeryBuilt = false;
const TOWN = new Set(PV.TOWN_IDS || []);
const tasks = { talk: false, order: false, pay: false };
let mistakes = 0, spokenSession = 0, xpSession = 0;

/* ---------- textes ---------- */
function applyUI() {
  U = PV.UI[ui]; document.documentElement.lang = ui;
  document.querySelectorAll('[data-i]').forEach(e => { const v = U[e.dataset.i]; if (typeof v === 'string') e.textContent = v; });
  document.querySelectorAll('.uiSwitch button').forEach(b => b.classList.toggle('on', b.dataset.ui === ui));
}
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.remove('hidden'); t.style.animation = 'none'; void t.offsetWidth; t.style.animation = ''; clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.add('hidden'), 2200); }

/* ---------- voix ---------- */
let voice = null, lastAct = Date.now();
function pickVoice() { try { const v = speechSynthesis.getVoices(), lang = S ? S.voice : 'en-GB'; voice = v.find(x => x.lang === lang && x.localService) || v.find(x => x.lang === lang) || v.find(x => x.lang.slice(0, 2) === lang.slice(0, 2)) || null; } catch (e) { /* none */ } }
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = pickVoice;
function say(t, o) {
  o = o || {}; lastAct = Date.now();
  try {
    if (!o.queue) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t); u.lang = S.voice; if (voice) u.voice = voice; u.rate = o.rate || .9; u.pitch = o.pitch || 1;
    if (o.onboundary) u.onboundary = o.onboundary;
    if (o.onend) { u.onend = o.onend; u.onerror = o.onend; }
    speechSynthesis.speak(u);
  } catch (e) { if (o.onend) o.onend(); }
}

/* ---------- reconnaissance vocale ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null;
function listen(onInterim, onFinal, onError, onEnd) {
  if (!SR) { onError('unsupported'); if (onEnd) onEnd(); return; }
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
  rec.onend = () => { if (!done) onError('no-speech'); if (onEnd) onEnd(); rec = null; };
  try { rec.start(); lastAct = Date.now(); } catch (e) { onError('busy'); if (onEnd) onEnd(); }
}
const NUM = { en: { 1: 'one', 2: 'two', 4: 'four', 5: 'five', 10: 'ten', 20: 'twenty', 50: 'fifty' }, pl: { 2: 'dwa', 4: 'cztery', 5: 'piec', 10: 'dziesiec', 15: 'pietnascie', 20: 'dwadziescia', 50: 'piecdziesiat' } };
const EXP = { heres: 'here is', thats: 'that is', its: 'it is', whats: 'what is', id: 'i would', ill: 'i will', im: 'i am' };
function norm(s) {
  return s.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[’']s\b/g, ' is').replace(/[’']ll\b/g, ' will').replace(/[’']d\b/g, ' would').replace(/[’']m\b/g, ' am').replace(/n[’']t\b/g, ' not')
    .replace(/£/g, ' ').replace(/(\d+)[.,](\d+)/g, '$1 $2').replace(/'/g, '').replace(/[^a-z0-9\s]/g, ' ')
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
  out.textContent = err === 'unsupported' ? U.noMic : (err === 'not-allowed' || err === 'service-not-allowed') ? fill(U.micDenied, { b: S.baker }) : U.notUnderstood;
}

/* ---------- progression ---------- */
const blankLang = () => ({ found: [], cards: {}, pron: {}, missions: 0, stories: {}, met: {} });
function normalizeP(d) {
  d = d || {};
  const p = Object.assign({ pseudo: '', ui, t: 'en', xp: 0, streak: 0, lastDay: '', dailyXp: 0, dailyDay: '', spoken: 0, goal: 15, secToday: 0, secDay: '', month: '', monthXp: 0, quizDay: '', quizRes: '', quizPick: '' }, d);
  p.L = { en: Object.assign(blankLang(), (d.L || {}).en), pl: Object.assign(blankLang(), (d.L || {}).pl) };
  return p;
}
const levelOf = xp => { let i = 0; PV.LEVELS.forEach((t, k) => { if (xp >= t) i = k; }); return i; };
let saveH = null;
function save(now) {
  clearTimeout(saveH);
  const run = async () => {
    store.set('pv_guest', P);
    if (SB && user) {
      const r1 = await SB.from('progress').upsert({ user_id: user.id, data: P, updated_at: new Date().toISOString() });
      if (r1.error) console.warn(r1.error);
      const r2 = await SB.from('scores').upsert({ user_id: user.id, pseudo: (P.pseudo || 'Anonyme').slice(0, 24), month: P.month, xp: P.monthXp, updated_at: new Date().toISOString() });
      if (r2.error) console.warn(r2.error);
    }
  };
  if (now) return run();
  saveH = setTimeout(run, 1200);
}
function touchDay() {
  const t = today(), yd = ymd(new Date(Date.now() - 864e5));
  if (P.lastDay !== t) { P.streak = P.lastDay === yd ? P.streak + 1 : 1; P.lastDay = t; }
  if (P.dailyDay !== t) { P.dailyXp = 0; P.dailyDay = t; }
  if (P.secDay !== t) { P.secToday = 0; P.secDay = t; }
  if (P.month !== monthKey()) { P.month = monthKey(); P.monthXp = 0; }
}
function addXP(n, msg) {
  const before = levelOf(P.xp);
  P.xp += n; P.dailyXp += n; P.monthXp += n; xpSession += n;
  const after = levelOf(P.xp);
  if (msg) toast(msg);
  if (after > before) setTimeout(() => toast(fill(U.levelUp, { l: U.levelNames[after] })), msg ? 1600 : 0);
  updHud(); if (tab === 'progress') renderProgress();
  save();
}
function updHud() {
  const lv = levelOf(P.xp), lo = PV.LEVELS[lv], hi = PV.LEVELS[lv + 1];
  $('ring').style.setProperty('--p', hi ? Math.round((P.xp - lo) / (hi - lo) * 100) : 100);
  $('av').textContent = ((P.pseudo || U.levelNames[lv])[0] || '?').toUpperCase();
  $('lvlTxt').textContent = U.level + ' ' + (lv + 1);
  $('stN').textContent = P.streak;
  const min = Math.floor(P.secToday / 60);
  $('goalTxt').textContent = Math.min(min, P.goal) + '/' + P.goal + ' ' + U.minUnit;
  $('goalRing').style.setProperty('--p', Math.min(100, Math.round(P.secToday / (P.goal * 60) * 100)));
  const due = dueCount(); $('dueBadge').textContent = due; $('dueBadge').classList.toggle('hidden', !due);
}
function updMission() {
  const n = L.found.length; $('fc').textContent = n + '/' + IDS.length; $('fb').style.width = Math.min(100, n / IDS.length * 100) + '%';
  const t = Object.assign({ town: L.found.filter(id => TOWN.has(id)).length >= 6 }, tasks);
  let done = 0;
  document.querySelectorAll('.tasks li').forEach(li => { const d = !!t[li.dataset.t]; li.classList.toggle('done', d); if (d) done++; });
  $('misN').textContent = done + '/4';
}
/* minutes actives, pour l'objectif du jour */
['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(ev => addEventListener(ev, () => { lastAct = Date.now(); }, { passive: true }));
setInterval(() => {
  if (!P || !started || document.hidden || Date.now() - lastAct > 90000) return;
  touchDay(); const before = P.secToday; P.secToday += 15;
  if (before < P.goal * 60 && P.secToday >= P.goal * 60) addXP(20, U.goalDone); else { updHud(); save(); }
  if (tab === 'progress' && $('bigRing')) renderProgress();
}, 15000);

/* ---------- accueil sans compte ---------- */
let onbT = 'en';
function renderOnb() {
  applyUI();
  if (ui === 'pl' && onbT === 'pl') onbT = 'en';
  document.querySelectorAll('.learnCard').forEach(b => {
    const t = b.dataset.t; b.querySelector('.ln').textContent = U.learnLangs[t]; b.querySelector('small').textContent = U.learnSub[t];
    b.disabled = (t === 'pl' && ui === 'pl'); b.classList.toggle('on', t === onbT);
  });
}
document.querySelectorAll('.uiSwitch button').forEach(b => b.onclick = () => { ui = b.dataset.ui; store.set('pv_ui', ui); renderOnb(); });
document.querySelectorAll('.learnCard').forEach(b => b.onclick = () => { onbT = b.dataset.t; renderOnb(); });
$('onbGo').onclick = () => { P = normalizeP({ ui, t: onbT }); save(true); start(); };
$('onbLogin').onclick = () => openAuth('login');

/* ---------- compte facultatif ---------- */
let mode = 'signup';
function openAuth(m) { mode = m; authMsg(''); renderAuth(); $('authOv').classList.remove('hidden'); }
function renderAuth() {
  document.querySelectorAll('#authForm .su').forEach(e => e.classList.toggle('hidden', mode === 'login'));
  $('authTitle').textContent = mode === 'login' ? U.loginTitle : U.signupTitle;
  $('authWhy').classList.toggle('hidden', mode === 'login');
  $('authBtn').textContent = mode === 'login' ? U.login : U.create;
  $('authSwitch').textContent = mode === 'login' ? U.noAcc : U.haveAcc;
  $('aPass').autocomplete = mode === 'login' ? 'current-password' : 'new-password';
  if (P && P.pseudo && !$('aPseudo').value) $('aPseudo').value = P.pseudo;
}
function authMsg(t, ok) { const m = $('authMsg'); m.textContent = t; m.classList.toggle('ok', !!ok); m.classList.toggle('hidden', !t); }
$('authClose').onclick = () => $('authOv').classList.add('hidden');
$('authSwitch').onclick = () => { mode = mode === 'login' ? 'signup' : 'login'; authMsg(''); renderAuth(); };
$('authForm').onsubmit = async e => {
  e.preventDefault(); authMsg('');
  if (!SB) { authMsg(U.errGeneric + 'offline'); return; }
  const email = $('aEmail').value.trim(), pass = $('aPass').value, pseudo = $('aPseudo').value.trim();
  if (!email || pass.length < 6 || (mode === 'signup' && !pseudo)) { authMsg(U.errFields); return; }
  const btn = $('authBtn'); btn.disabled = true;
  try {
    const before = P ? P.ui + P.t : '';
    if (mode === 'signup') {
      const { data, error } = await SB.auth.signUp({ email, password: pass, options: { data: { pseudo } } });
      if (error) throw error;
      if (!data.session) { authMsg(U.checkMail, true); mode = 'login'; renderAuth(); return; }
      user = data.user; if (!P) P = normalizeP({ ui, t: onbT }); P.pseudo = pseudo;
    } else {
      const { data, error } = await SB.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      user = data.user;
      const row = await SB.from('progress').select('data').eq('user_id', user.id).maybeSingle();
      if (row.data && row.data.data) P = normalizeP(row.data.data);
      else { if (!P) P = normalizeP({ ui, t: onbT }); if (!P.pseudo) P.pseudo = (user.user_metadata || {}).pseudo || ''; }
    }
    await save(true);
    $('authOv').classList.add('hidden');
    if (started && before && before !== P.ui + P.t) { location.reload(); return; }
    if (!started) start();
    else { toast(U.accSaved); updHud(); updMission(); renderDeck(); if (tab === 'progress') renderProgress(); }
  } catch (err) { authMsg(U.errGeneric + (err.message || err)); }
  finally { btn.disabled = false; }
};

async function boot() {
  applyUI();
  if (SB) {
    try {
      const { data } = await SB.auth.getSession();
      if (data.session) {
        user = data.session.user;
        const row = await SB.from('progress').select('data').eq('user_id', user.id).maybeSingle();
        P = normalizeP((row.data && row.data.data) || store.get('pv_guest'));
        return start();
      }
    } catch (e) { console.warn(e); }
  }
  const g = store.get('pv_guest');
  if (g) { P = normalizeP(g); return start(); }
  renderOnb(); $('onb').classList.remove('hidden');
}

/* ---------- démarrage ---------- */
function start() {
  ui = P.ui; T = (P.ui === 'pl' && P.t === 'pl') ? 'en' : P.t; P.t = T; store.set('pv_ui', ui);
  S = PV.SCENE[T]; D = PV.DLG[T]; L = P.L[T]; pickVoice();
  touchDay(); applyUI(); save();
  $('onb').classList.add('hidden');
  ['hud', 'nav'].forEach(id => $(id).classList.remove('hidden'));
  $('dWho').textContent = S.baker;
  setPlaceUI();
  if (!L.found.some(id => TOWN.has(id))) showIntro('town');
  if (!SR) $('dMic').disabled = true;
  updHud(); updMission(); renderDeck(); renderMap();
  if (!started && window.THREE && window.buildTown) {
    const H = { palette: palette(), country: country(), label: id => L.found.includes(id) ? W[id][T] : '?',
      pick: (id, obj) => { if (tab !== 'town' || place !== 'town') return; if (id === 'npc:passerby') greetPasserby(obj); else if (id.startsWith('npc:')) openNpc(id.slice(4)); else showWord(id); },
      active: () => place === 'town' && !document.hidden };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { town = window.buildTown(H); });
  }
  started = true;
}
function showIntro(kind) {
  const t = kind === 'town';
  $('introTitleTxt').textContent = t ? U.townIntroTitle : U.introTitle;
  $('shopName').textContent = t ? 'Petite Ville' : '';
  $('introText').textContent = fill(t ? U.townIntroText : U.introText, { l: PV.IN_LANG[ui][T], b: S.baker });
  $('step1').textContent = t ? U.tstep1 : U.step1; $('step2').textContent = t ? U.tstep2 : U.step2;
  $('step3').textContent = fill(t ? U.tstep3 : U.step3, { b: S.baker });
  $('intro').classList.remove('hidden');
}
$('enter').onclick = () => { $('intro').classList.add('hidden'); say(T === 'pl' ? 'Dzień dobry!' : 'Hello!'); };

/* ---------- la place et la boulangerie ---------- */
function setPlaceUI() {
  const inB = place === 'bakery';
  $('placeName').textContent = inB ? '← ' + U.backToSquare : U.placeSquare;
  $('ct').classList.toggle('hidden', inB); $('c').classList.toggle('hidden', !inB);
  $('photoBtn').classList.toggle('hidden', inB);
}
function enterBakery() {
  place = 'bakery'; show(null); setPlaceUI();
  if (!bakeryBuilt && window.THREE) {
    bakeryBuilt = true;
    const H = { board: S.board, open: S.open, flour: S.flour, pal: (PV.PALS || {})[palette()],
      label: id => L.found.includes(id) ? W[id][T] : '?',
      pick: id => { if (tab !== 'town' || place !== 'bakery') return; if (id === 'baker') openDlg(); else showWord(id); },
      bubble: () => !tasks.pay, active: () => place === 'bakery' && !document.hidden };
    window.buildScene(H);
  }
  if (!L.found.some(id => !TOWN.has(id))) showIntro('bakery');
  say(T === 'pl' ? 'Dzień dobry!' : 'Hello!');
}
function exitBakery() { place = 'town'; show(null); if (town) town.placeAtBakery(); setPlaceUI(); }

/* ---------- mode photo ---------- */
/* pays de la ville : celui de la langue apprise (anglais → Édimbourg, polonais → Wrocław) ; ?pays=fr|gb|pl pour tester */
function country() { const q = (location.search.match(/[?&]pays=(fr|gb|pl)\b/) || [])[1]; return q || ({ en: 'gb', pl: 'pl' })[T] || 'fr'; }
function palette() { const q = (location.search.match(/palette=([abcd])/) || [])[1]; if (q) store.set('pv_pal', q); return q || store.get('pv_pal') || 'a'; }
document.querySelectorAll('[data-pal]').forEach(b => { b.classList.toggle('on', b.dataset.pal === palette()); b.onclick = () => { store.set('pv_pal', b.dataset.pal); location.href = location.pathname + '?palette=' + b.dataset.pal; }; });
const fmtH = h => { const hh = Math.floor(h) % 24, mm = Math.round((h - Math.floor(h)) * 60); return String(hh).padStart(2, '0') + ':' + String(mm === 60 ? 0 : mm).padStart(2, '0'); };
$('photoBtn').onclick = () => {
  if (!town) return; show(null); document.body.classList.add('photo'); $('photoBar').classList.remove('hidden');
  town.setPhoto(true); const h = town.hour(); $('phSlider').value = h; $('phHour').textContent = fmtH(h);
};
$('phSlider').oninput = () => { const h = +$('phSlider').value; $('phHour').textContent = fmtH(h); town.setHour(h); };
$('phReal').onclick = () => { town.setHour(null); const h = town.hour(); $('phSlider').value = h; $('phHour').textContent = fmtH(h); };
$('phClose').onclick = () => { town.setPhoto(false); document.body.classList.remove('photo'); $('photoBar').classList.add('hidden'); };
$('phShoot').onclick = () => {
  const url = town.snapshot(); const a = document.createElement('a'); a.href = url; a.download = 'petite-ville-' + fmtH(town.hour()).replace(':', 'h') + '.jpg';
  document.body.appendChild(a); a.click(); a.remove();
  const fx = $('flashFx'); fx.classList.remove('hidden'); fx.style.animation = 'none'; void fx.offsetWidth; fx.style.animation = ''; setTimeout(() => fx.classList.add('hidden'), 500);
  toast(U.photoSaved);
};

/* ---------- onglets ---------- */
function showTab(t) {
  tab = t;
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
  $('pgStories').classList.toggle('hidden', t !== 'stories');
  $('pgWords').classList.toggle('hidden', t !== 'words');
  $('pgProgress').classList.toggle('hidden', t !== 'progress');
  $('hud').classList.toggle('hidden', t !== 'town');
  if (t !== 'town') show(null);
  if (t !== 'stories') stopStory();
  if (t === 'stories') renderStories();
  if (t === 'words') renderDeck();
  if (t === 'progress') renderProgress();
}
document.querySelectorAll('#nav button').forEach(b => b.onclick = () => showTab(b.dataset.tab));

/* ---------- feuilles ---------- */
const SHEETS = ['card', 'dlg', 'misSheet', 'mapSheet'];
function show(id) {
  SHEETS.forEach(p => $(p).classList.toggle('hidden', p !== id));
  document.body.classList.toggle('dlg-open', id === 'dlg');
  if (id !== 'dlg' && town && town.endTalk) town.endTalk();
  if (id !== 'dlg' && id !== 'card' && rec) try { rec.abort(); } catch (e) { /* none */ }
}
document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => show(null));
$('misBtn').onclick = () => { updMission(); show('misSheet'); };
$('placeBtn').onclick = () => { if (place === 'bakery') exitBakery(); else { renderMap(); show('mapSheet'); } };
$('meBtn').onclick = () => showTab('progress');
$('goalPill').onclick = () => showTab('progress');
addEventListener('keydown', e => { if (e.key === 'Escape') { show(null); $('authOv').classList.add('hidden'); } });

function discover(id) { if (!L.found.includes(id)) { L.found.push(id); addXP(5, U.xpWord); updMission(); } }

/* mot */
let curWord = null;
function stemOf(w) { const f = w.toLowerCase().split(' ')[0]; return f.length <= 5 ? f.slice(0, Math.max(3, f.length - 1)) : f.slice(0, 5); }
function markWord(p, sentence, word) {
  p.textContent = ''; const st = stemOf(word);
  sentence.split(/(\s+)/).forEach(tok => {
    const clean = tok.toLowerCase().replace(/[^\p{L}]/gu, '');
    if (clean && clean.startsWith(st)) p.appendChild(el('mark', null, tok)); else p.appendChild(document.createTextNode(tok));
  });
}
function showWord(id) {
  const w = W[id]; curWord = id; discover(id);
  $('wT').textContent = w[T]; $('wUi').textContent = w[ui];
  markWord($('wEx'), w.ex[T], w[T]); $('wExUi').textContent = w.ex[ui];
  const note = ((PV.NOTES[T] || {})[id] || {})[ui];
  $('wNoteTxt').textContent = note || ''; $('wNote').classList.toggle('hidden', !note);
  $('wPron').classList.add('hidden'); $('wRepeat').disabled = !SR;
  const canEnter = place === 'town' && (id === 'bakeryShop' || id === 'cafe');
  $('wEnter').classList.toggle('hidden', !canEnter);
  if (canEnter) $('wEnterTxt').textContent = id === 'cafe' ? U.enterBtn + ' · ' + U.plusTag : U.enterBtn + ' · ' + S.baker;
  updSave(); show('card'); say(w[T]);
}
function updSave() { $('wSaveTxt').textContent = L.cards[curWord] ? U.saved : U.save; }
$('wEnter').onclick = () => { if (curWord === 'bakeryShop') enterBakery(); else toast(U.plusTag + ' · ' + (ui === 'pl' ? '45 zł' : '10 €')); };
$('wListen').onclick = () => { const w = W[curWord]; say(w[T]); say(w.ex[T], { queue: true }); };
$('wSave').onclick = () => { if (L.cards[curWord]) delete L.cards[curWord]; else L.cards[curWord] = { box: 1, due: dayNum() }; save(); updSave(); updHud(); };
$('wRepeat').onclick = () => {
  const btn = $('wRepeat'), out = $('wPron'), target = norm(W[curWord][T]).join(' ');
  btn.classList.add('on'); out.className = 'pron'; out.textContent = U.listening;
  listen(t => { out.textContent = '« ' + t + ' »'; }, alts => {
    let best = 0, heard = alts[0] || '';
    alts.forEach(a => { const n = norm(a).join(' '); const s = n.includes(target) ? 1 : 1 - lev(n, target) / Math.max(n.length, target.length, 1); if (s > best) { best = s; heard = a; } });
    out.textContent = '';
    if (best >= .75) { out.append(icon('check'), document.createTextNode(U.pronGood)); if (!L.pron[curWord]) { L.pron[curWord] = 1; addXP(10, U.xpPron); } }
    else { out.className = 'pron bad'; out.textContent = fill(U.pronClose, { h: heard }); }
  }, err => { out.className = 'pron bad'; micError(err, out); }, () => btn.classList.remove('on'));
};

/* plan de la ville */
function renderMap() {
  const box = $('places'); box.innerHTML = '';
  PV.PLACES.forEach(pl => {
    const cur = (pl.id === 'square' && place === 'town') || (pl.id === 'bakery' && place === 'bakery'), open = pl.status === 'open' || pl.status === 'square';
    const b = el('button', 'place' + (cur ? ' cur' : '') + (!open ? ' locked' : '')); b.type = 'button';
    const roof = el('span', 'roof'); roof.style.background = pl.color; b.appendChild(roof);
    b.appendChild(el('span', 'tag ' + (open ? 'open' : pl.status), open ? U.open : pl.status === 'plus' ? U.plusTag : U.soon));
    b.appendChild(el('b', null, U[pl.key]));
    b.appendChild(el('small', null, cur ? U.here : pl.status === 'square' ? U.onSquare : ''));
    b.onclick = () => { if (pl.id === 'bakery') { if (place !== 'bakery') enterBakery(); else show(null); } else if (pl.id === 'square' || pl.status === 'square') { if (place === 'bakery') exitBakery(); else show(null); } else toast(pl.status === 'plus' ? U.plusTag + ' · ' + (ui === 'pl' ? '45 zł' : '10 €') : U.soon); };
    box.appendChild(b);
  });
  if (T === 'en') {
    const a = el('a', 'place wide'); a.href = 'rue/';
    a.append(el('b', null, U.placeStreet), el('small', null, U.placeStreetSub)); box.appendChild(a);
  }
}

/* ---------- dialogue ---------- */
let lastLine = '', curOpts = [], curNpc = null;
const DD = () => curNpc ? PV.NPCS[curNpc].dlg[T] : D;
const voiceP = () => curNpc ? PV.NPCS[curNpc].pitch : .95;
function render(line, tr, key) {
  lastLine = line; $('dLine').textContent = line; $('dTrTxt').textContent = (tr || {})[ui] || '';
  curOpts = key ? DD().opts[key] : [];
  const box = $('dOpts'); box.innerHTML = '';
  curOpts.forEach(o => {
    const b = el('button', 'opt'); b.type = 'button';
    b.append(el('span', null, o.t), el('div', 'fr', o.tr[ui] || ''));
    b.onclick = () => choose(o, false); box.appendChild(b);
  });
  $('dMic').disabled = !SR || !curOpts.length;
  $('dHeard').textContent = curOpts.length ? (SR ? U.speakNow : U.noMic) : '';
}
function go(id, line, queue) { const n = DD().nodes[id]; const l = line ? line[0] : n[0]; render(l, line ? line[1] : n[1], n[2]); say(l, { queue, pitch: voiceP() }); }
function choose(o, spoken) {
  $('dMe').textContent = U.you + ' : « ' + o.t + ' »';
  if (!spoken) say(o.t, { pitch: 1.25, rate: 1 });
  if (o.task) tasks[o.task] = true;
  if (o.tip) { mistakes++; $('dTip').textContent = o.tip[ui]; $('dTip').classList.remove('hidden'); } else $('dTip').classList.add('hidden');
  if (spoken) { spokenSession++; P.spoken++; if (!o.tip) addXP(5, U.xpSpoken); }
  updMission();
  if (o.to === 'END') {
    const e = o.reply || DD().nodes.end; render(e[0], e[1], null); say(e[0], { queue: true, pitch: voiceP() });
    if (curNpc) { const who = curNpc; setTimeout(() => { if (curNpc === who) { show(null); finishNpc(who); } }, 3200); return; }
    setTimeout(() => { if (tasks.order && tasks.pay) win(); else show(null); }, 2400); return;
  }
  go(o.to, o.reply, true);
}
function openDlg() { curNpc = null; $('dWho').textContent = S.baker; tasks.talk = true; discover('baker'); updMission(); $('dMe').textContent = ''; $('dTip').classList.add('hidden'); show('dlg'); go('start'); }
$('dReplay').onclick = () => say(lastLine);
$('dTr').onclick = () => $('dlg').classList.toggle('tr');
$('dMic').onclick = () => {
  const mic = $('dMic'), out = $('dHeard');
  if (rec) { try { rec.stop(); } catch (e) { /* none */ } return; }
  mic.classList.add('on'); out.textContent = U.listening;
  listen(t => { out.textContent = '« ' + t + ' »'; }, alts => {
    let best = null, bs = 0, second = 0, heard = alts[0] || '';
    alts.forEach(a => curOpts.forEach(o => { const s = score(a, o.t); if (s > bs) { if (best !== o) second = bs; bs = s; best = o; heard = a; } else if (o !== best && s > second) second = s; }));
    out.textContent = '« ' + heard + ' »'; out.appendChild(el('small', null, U.heard));
    if (best && bs >= .5 && bs - second >= .08) choose(best, true);
    else { $('dTip').textContent = U.notUnderstood; $('dTip').classList.remove('hidden'); say(DD().nodes.huh[0], { pitch: voiceP() }); }
  }, err => micError(err, out), () => mic.classList.remove('on'));
};

function openNpc(id) {
  const n = PV.NPCS[id]; if (!n) return;
  curNpc = id; $('dWho').textContent = n.name + ' · ' + (n.role[ui] || '');
  $('dMe').textContent = ''; $('dTip').classList.add('hidden');
  if (town && town.talkTo) town.talkTo(id);
  show('dlg'); go('start');
}
function finishNpc(id) { if (!L.met[id]) { L.met[id] = 1; addXP(15, fill(U.newFriend, { n: PV.NPCS[id].name })); } curNpc = null; }
function greetPasserby(obj) {
  const list = PV.GREET[T] || [], g = list[(Math.random() * list.length) | 0]; if (!g) return;
  if (town && town.greet) town.greet(obj);
  say(g[0], { pitch: .9 + Math.random() * .4 }); toast('« ' + g[0] + ' » — ' + (g[1][ui] || ''));
}
function win() {
  show(null); L.missions++; addXP(50, U.xpMission);
  $('winTitle').textContent = fill(U.winTitle, { l: PV.IN_LANG[ui][T] });
  $('winText').textContent = fill(U.winText, { b: S.baker });
  $('sW').textContent = L.found.length; $('sS').textContent = spokenSession; $('sX').textContent = '+' + xpSession;
  $('win').classList.remove('hidden'); save(true);
}
$('again').onclick = () => { $('win').classList.add('hidden'); tasks.order = tasks.pay = false; mistakes = 0; spokenSession = 0; xpSession = 0; updMission(); openDlg(); };
$('explore').onclick = () => $('win').classList.add('hidden');

/* ---------- histoires lues à voix haute ---------- */
let reading = null, playing = false, playTok = 0, slow = false, curSent = 0;
function stopStory() { playing = false; playTok++; try { speechSynthesis.cancel(); } catch (e) { /* none */ } }
function renderStories() {
  const box = $('storiesIn'); box.innerHTML = '';
  if (reading) { renderReader(); return; }
  box.append(el('h1', null, U.storiesTitle), el('p', 'lead', U.storiesSub));
  const grid = el('div', 'stories');
  PV.STORIES[T].forEach(st => {
    const b = el('button', 'story'); b.type = 'button';
    const cov = el('div', 'cover'); cov.style.background = st.bg; cov.appendChild(icon(st.icon));
    if (L.stories[st.id]) cov.appendChild(el('span', 'readTag', U.readDone + ' ✓'));
    const meta = el('div', 'meta'); meta.append(el('b', null, st.title), el('small', null, (st.tr[ui] || '') + ' · ' + U.beginner + ' · ' + fill(U.minRead, { n: st.min })));
    b.append(cov, meta); b.onclick = () => { reading = st; curSent = 0; renderStories(); };
    grid.appendChild(b);
  });
  box.appendChild(grid);
}
function renderReader() {
  const box = $('storiesIn'), st = reading; box.innerHTML = '';
  const top = el('div', 'rTop');
  const back = el('button', 'btn sm'); back.type = 'button'; back.append(icon('back'), document.createTextNode(U.back));
  back.onclick = () => { stopStory(); reading = null; renderStories(); };
  top.append(back, el('h2', null, st.title)); box.appendChild(top);
  box.appendChild(el('p', 'lead', (st.tr[ui] || '') + ' · ' + U.tapHint));
  const list = el('div', 'reader');
  st.s.forEach((s, i) => {
    const b = el('button', 'sent'); b.type = 'button'; b.dataset.i = i;
    let pos = 0;
    s[0].split(/(\s+)/).forEach(tok => {
      if (!tok || /^\s+$/.test(tok)) b.appendChild(document.createTextNode(tok));
      else { const w = el('span', 'w', tok); w.dataset.s = pos; b.appendChild(w); }
      pos += tok.length;
    });
    const tr = el('span', 'tr hidden', s[1][ui] || ''); b.appendChild(tr);
    b.onclick = () => { tr.classList.toggle('hidden'); if (!playing) { curSent = i; speakOne(i); } };
    list.appendChild(b);
  });
  box.appendChild(list);
  const ctl = el('div', 'rCtl');
  const pb = el('button', 'btn honey'); pb.type = 'button'; pb.id = 'pPlay';
  const sb = el('button', 'btn ghost', U.slow); sb.type = 'button'; sb.setAttribute('aria-pressed', String(slow)); if (slow) sb.style.borderColor = 'var(--honey)';
  sb.onclick = () => { slow = !slow; sb.setAttribute('aria-pressed', String(slow)); sb.style.borderColor = slow ? 'var(--honey)' : ''; };
  pb.onclick = () => { if (playing) { stopStory(); updPlay(); } else { playing = true; updPlay(); speakFrom(curSent); } };
  ctl.append(pb, sb); box.appendChild(ctl); updPlay();
}
function updPlay() { const pb = $('pPlay'); if (!pb) return; pb.textContent = ''; pb.append(icon(playing ? 'pause' : 'play'), document.createTextNode(playing ? U.pause : U.play)); }
function sentEl(i) { return document.querySelector('.sent[data-i="' + i + '"]'); }
function highlightSent(i) {
  document.querySelectorAll('.sent').forEach(s => s.classList.toggle('cur', +s.dataset.i === i));
  document.querySelectorAll('.w.hl').forEach(w => w.classList.remove('hl'));
  const s = sentEl(i); if (s) s.scrollIntoView({ block: 'center', behavior: 'smooth' });
}
function boundary(i) {
  return e => {
    if (e.name && e.name !== 'word') return;
    const s = sentEl(i); if (!s) return; let pick = null;
    s.querySelectorAll('.w').forEach(w => { if (+w.dataset.s <= e.charIndex) pick = w; });
    s.querySelectorAll('.w.hl').forEach(w => w.classList.remove('hl')); if (pick) pick.classList.add('hl');
  };
}
function speakOne(i) { highlightSent(i); say(reading.s[i][0], { rate: slow ? .7 : .9, onboundary: boundary(i) }); }
function speakFrom(i) {
  if (!reading) return;
  if (i >= reading.s.length) {
    playing = false; curSent = 0; updPlay(); highlightSent(-1);
    if (!L.stories[reading.id]) { L.stories[reading.id] = 1; addXP(20, U.storyDone); }
    return;
  }
  curSent = i; highlightSent(i); const tok = ++playTok;
  say(reading.s[i][0], { rate: slow ? .7 : .9, onboundary: boundary(i), onend: () => { if (tok !== playTok || !playing) return; setTimeout(() => { if (tok === playTok && playing) speakFrom(i + 1); }, 300); } });
}

/* ---------- mots : répétition espacée ---------- */
const GAP = [0, 1, 3, 7, 14, 30];
function dueCount() { if (!L) return 0; const d = dayNum(); return Object.values(L.cards).filter(c => c.due <= d).length; }
function renderDeck() {
  const ul = $('cards'); ul.innerHTML = ''; const ids = Object.keys(L.cards), d = dayNum();
  ids.sort((a, b) => L.cards[a].due - L.cards[b].due).forEach(id => {
    const w = W[id]; if (!w) return; const li = el('li');
    const box = el('div'); const b = el('b', null, w[T]);
    if (L.cards[id].due <= d) b.appendChild(el('span', 'due', U.due));
    box.append(b, el('div', 't', w[ui]));
    const p = el('button', 'ib'); p.type = 'button'; p.setAttribute('aria-label', U.listen); p.appendChild(icon('spk')); p.onclick = () => say(w[T]);
    const r = el('button', 'ib', '×'); r.type = 'button'; r.setAttribute('aria-label', U.close);
    r.onclick = () => { delete L.cards[id]; save(); renderDeck(); if (curWord === id) updSave(); };
    li.append(box, p, r); ul.appendChild(li);
  });
  const due = dueCount();
  $('emptyDeck').classList.toggle('hidden', ids.length > 0); $('revBtn').classList.toggle('hidden', !ids.length);
  $('revTxt').textContent = U.review + (due ? ' · ' + fill(U.dueN, { n: due }) : '');
  updHud();
}
let queue = [];
function flash() {
  if (!queue.length) { $('fQ').textContent = U.reviewDone; $('fA').classList.add('hidden'); ['fShow', 'fAgain', 'fKnew'].forEach(i => $(i).classList.add('hidden')); return; }
  const w = W[queue[0]]; $('fQ').textContent = w[ui]; $('fA').textContent = w[T]; $('fA').classList.add('hidden');
  $('fShow').classList.remove('hidden'); $('fAgain').classList.add('hidden'); $('fKnew').classList.add('hidden');
}
$('revBtn').onclick = () => { const d = dayNum(); queue = Object.keys(L.cards).filter(id => L.cards[id].due <= d); $('flash').classList.remove('hidden'); flash(); $('flash').scrollIntoView({ behavior: 'smooth' }); };
$('fShow').onclick = () => { $('fA').classList.remove('hidden'); $('fShow').classList.add('hidden'); $('fAgain').classList.remove('hidden'); $('fKnew').classList.remove('hidden'); say(W[queue[0]][T]); };
$('fKnew').onclick = () => { const id = queue.shift(), c = L.cards[id]; c.box = Math.min(5, c.box + 1); c.due = dayNum() + GAP[c.box]; addXP(2); renderDeck(); flash(); };
$('fAgain').onclick = () => { const id = queue.shift(), c = L.cards[id]; c.box = 1; c.due = dayNum(); queue.push(id); save(); renderDeck(); flash(); };

/* ---------- progrès ---------- */
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function quizOfDay() {
  const r = rng(dayNum() * 31 + (T === 'pl' ? 7 : 0)), pool = IDS.slice();
  const pick = pool.splice(Math.floor(r() * pool.length), 1)[0], opts = [pick];
  while (opts.length < 4) opts.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  return { id: pick, opts: opts.sort(() => r() - .5) };
}
function section(title) { const c = el('section', 'card'); if (title) c.appendChild(el('h3', null, title)); return c; }
function subP(txt, margin) { const p = el('p', 'sub', txt); p.style.margin = margin; return p; }
function renderProgress() {
  const box = $('progIn'); box.innerHTML = '';
  box.appendChild(el('h1', null, U.progTitle));
  const lv = levelOf(P.xp), lo = PV.LEVELS[lv], hi = PV.LEVELS[lv + 1];
  /* profil */
  const pc = section(null); const pr = el('div', 'profile');
  const av = el('div', 'bigAv', ((P.pseudo || U.levelNames[lv])[0] || '?').toUpperCase());
  const who = el('div'); who.append(el('b', null, P.pseudo || U.levelNames[lv]), el('span', 'lvl', U.level + ' ' + (lv + 1) + ' · ' + U.levelNames[lv] + ' · ' + P.xp + ' XP'));
  pr.append(av, who); pc.appendChild(pr);
  const bar = el('div', 'bar'); const bi = el('i'); bi.style.width = (hi ? (P.xp - lo) / (hi - lo) * 100 : 100) + '%'; bar.appendChild(bi); pc.appendChild(bar);
  pc.appendChild(subP(hi ? fill(U.nextLevel, { n: hi - P.xp, l: U.levelNames[lv + 1] }) : U.maxLevel, '8px 0 12px'));
  const s3 = el('div', 'stats3');
  [[L.found.length, U.wordsLearned], [Object.keys(L.met || {}).length, U.friends], [Object.keys(L.stories).length, U.storiesRead], [L.missions, U.missionsDone]].forEach(([n, t]) => { const d = el('div'); d.append(el('b', null, n), el('span', null, t)); s3.appendChild(d); });
  pc.appendChild(s3); box.appendChild(pc);
  /* objectif + série */
  const two = el('div', 'two');
  const gc = section(U.goalTitle); const gb = el('div', 'goalBox');
  const ring = el('div', 'bigRing'); ring.id = 'bigRing'; ring.style.setProperty('--p', Math.min(100, Math.round(P.secToday / (P.goal * 60) * 100)));
  const rin = el('div'); rin.append(document.createTextNode(Math.floor(P.secToday / 60)), el('small', null, '/ ' + P.goal + ' ' + U.minUnit)); ring.appendChild(rin);
  gb.appendChild(ring); gc.appendChild(gb);
  gc.appendChild(subP(U.goalPick, '10px 0 0'));
  const chips = el('div', 'chips');
  [5, 10, 15, 20].forEach(m => { const c = el('button', 'chip' + (P.goal === m ? ' on' : ''), m + ' ' + U.minUnit); c.type = 'button'; c.onclick = () => { P.goal = m; save(); updHud(); renderProgress(); }; chips.appendChild(c); });
  gc.appendChild(chips);
  const sc = section(null); const sb = el('div', 'streakBox'); sb.appendChild(icon('flame'));
  const sbt = el('div'); sbt.append(el('b', null, P.streak), el('div', 'sub', U.streakTitle)); sb.appendChild(sbt); sc.appendChild(sb);
  sc.appendChild(subP(U.streakHint, '10px 0 0'));
  two.append(gc, sc); box.appendChild(two);
  /* quiz du jour */
  const qc = section(U.quizTitle); const q = quizOfDay(), key = dayNum() + '-' + T, doneQ = P.quizDay === key;
  qc.appendChild(subP(fill(U.quizQ, { w: W[q.id][T] }), '0'));
  const qo = el('div', 'qOpts');
  q.opts.forEach(id => {
    const b = el('button', 'qOpt', W[id][ui]); b.type = 'button';
    if (doneQ) { b.disabled = true; if (id === q.id) b.classList.add('ok'); else if (id === P.quizPick) b.classList.add('no'); }
    b.onclick = () => {
      P.quizDay = key; P.quizPick = id; P.quizRes = id === q.id ? 'ok' : 'no'; say(W[q.id][T]);
      if (id === q.id) addXP(15, U.quizOk); else { toast(fill(U.quizNo, { a: W[q.id][ui] })); save(); }
      renderProgress();
    };
    qo.appendChild(b);
  });
  qc.appendChild(qo); if (doneQ) qc.appendChild(subP(U.quizDone, '10px 0 0'));
  box.appendChild(qc);
  /* classement */
  if (SB) {
    const bc = section(U.boardTitle); const ol = el('ol', 'board'); ol.id = 'boardList'; ol.appendChild(el('li', null, U.boardLoading));
    bc.appendChild(ol); if (!user) bc.appendChild(subP(U.boardGuest, '10px 0 0'));
    box.appendChild(bc); loadBoard();
  }
  /* compte */
  const ac = section(U.accTitle);
  if (user) {
    ac.appendChild(subP(fill(U.loggedAs, { e: user.email || '' }), '0 0 10px'));
    const out = el('button', 'btn line', U.logout); out.type = 'button';
    out.onclick = async () => { await SB.auth.signOut(); store.del('pv_guest'); location.reload(); };
    ac.appendChild(out);
  } else {
    ac.appendChild(subP(U.guestTxt, '0 0 10px'));
    const sv = el('button', 'btn honey wide', U.saveProg); sv.type = 'button'; sv.onclick = () => openAuth('signup');
    const li = el('button', 'link', U.haveAcc); li.type = 'button'; li.style.color = 'var(--coralD)'; li.onclick = () => openAuth('login');
    ac.append(sv, li);
  }
  box.appendChild(ac);
  /* langues */
  const lc = section(U.langTitle); const lt = el('div', 'two');
  const f1 = el('label', 'f'); f1.appendChild(el('span', null, U.speak)); const s1 = el('select'); ['fr', 'pl'].forEach(k => s1.add(new Option(U.langs[k], k, false, k === ui))); f1.appendChild(s1);
  const f2 = el('label', 'f'); f2.appendChild(el('span', null, U.learn)); const s2 = el('select'); f2.appendChild(s2);
  const fillT = () => { s2.innerHTML = ''; ['en', 'pl'].forEach(k => { const o = new Option(U.learnLangs[k], k, false, k === T); o.disabled = k === 'pl' && s1.value === 'pl'; s2.add(o); }); if (s1.value === 'pl') s2.value = 'en'; };
  fillT(); s1.onchange = fillT;
  lt.append(f1, f2); lc.appendChild(lt);
  const ch = el('button', 'btn line', U.saveLang); ch.type = 'button';
  ch.onclick = async () => { P.ui = s1.value; P.t = s2.value; await save(true); location.reload(); };
  lc.appendChild(ch); box.appendChild(lc);
}
async function loadBoard() {
  let res;
  try { res = await SB.from('scores').select('user_id,pseudo,xp').eq('month', monthKey()).order('xp', { ascending: false }).limit(20); } catch (e) { res = { error: e }; }
  const ol = $('boardList'); if (!ol) return; ol.innerHTML = '';
  if (res.error || !res.data || !res.data.length) { ol.appendChild(el('li', null, U.boardEmpty)); return; }
  res.data.forEach((r, i) => {
    const li = el('li', user && r.user_id === user.id ? 'me' : null);
    li.append(el('span', 'rk', i + 1), el('span', null, r.pseudo || '—'), el('span', 'xp', r.xp + ' XP'));
    ol.appendChild(li);
  });
}

boot().catch(err => { console.error(err); renderOnb(); $('onb').classList.remove('hidden'); });
}
