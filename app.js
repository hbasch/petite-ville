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
const fill = (s, o) => s.replace(/\{(\w+)\}/g, (m, k) => (o[k] ?? m));
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
/* voix enregistrées (ElevenLabs) : audio/<langue>/index.json = { "qui|réplique": "fichier.mp3" }.
   Une réplique sans fichier passe par la voix du navigateur, comme avant. File d'attente commune aux deux. */
let VOX = {}, voxLang = null, voxQ = [], voxBusy = false, voxGen = 0;
const vox = new Audio(); vox.preload = 'auto';
const SILENT = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjYwLjE2LjEwMAAAAAAAAAAAAAAA//NwwAAAAAAAAAAAAEluZm8AAAAPAAAABAAAAlgAenp6enp6enp6enp6enp6enp6enp6enp6pqampqampqampqampqampqampqampqamptPT09PT09PT09PT09PT09PT09PT09PT09P/////////////////////////////////AAAAAExhdmM2MC4zMQAAAAAAAAAAAAAAACQCcQAAAAAAAAJY+/rsqgAAAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxKMAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
function loadVox() { if (voxLang === T) return; const l = voxLang = T; VOX = {}; fetch('audio/' + l + '/index.json?v=3').then(r => r.ok ? r.json() : {}).then(j => { if (voxLang === l) VOX = j || {}; }).catch(() => { /* pas de voix enregistrées */ }); }
/* iPhone : un lecteur audio « débloqué » par un premier toucher peut ensuite parler tout seul (habitants qui viennent te voir) */
document.addEventListener('pointerdown', () => { try { vox.src = SILENT; const p = vox.play(); if (p) p.catch(() => { /* none */ }); } catch (e) { /* none */ } }, { once: true, capture: true });
function tts(t, o, after) {
  const end = () => { if (o.onend) o.onend(); if (after) after(); };
  try {
    const u = new SpeechSynthesisUtterance(t); u.lang = S.voice; if (voice) u.voice = voice; u.rate = o.rate || .9; u.pitch = o.pitch || 1;
    if (o.onboundary) u.onboundary = o.onboundary;
    u.onend = end; u.onerror = end;
    speechSynthesis.speak(u);
  } catch (e) { end(); }
}
function runVox(it) {
  const g = voxGen; voxBusy = true; let done = false, h = 0;
  const next = () => { if (done || g !== voxGen) return; done = true; clearTimeout(h); voxBusy = false; const n = voxQ.shift(); if (n) runVox(n); };
  const viaTts = () => { h = setTimeout(next, 1500 + it.t.length * 110 / (it.o.rate || .9)); tts(it.t, it.o, next); };
  const f = VOX[(it.o.who || '') + '|' + String(it.t).trim()];
  if (!f) { viaTts(); return; }
  vox.onended = () => { if (g === voxGen && it.o.onend) it.o.onend(); next(); };
  vox.onerror = () => { if (g === voxGen && !done) viaTts(); };
  vox.src = 'audio/' + T + '/' + f; vox.playbackRate = 1;
  const p = vox.play(); if (p) p.catch(() => { if (g === voxGen && !done) viaTts(); });
}
function say(t, o) {
  o = o || {}; lastAct = Date.now();
  if (!o.queue) { voxGen++; voxQ = []; voxBusy = false; try { vox.pause(); } catch (e) { /* none */ } try { speechSynthesis.cancel(); } catch (e) { /* none */ } }
  const it = { t, o };
  if (voxBusy) voxQ.push(it); else runVox(it);
}
window.PVSpeaking = () => (!vox.paused && !vox.ended && vox.src.indexOf('data:') !== 0) || speechSynthesis.speaking;
function shush() { voxGen++; voxQ = []; voxBusy = false; try { vox.pause(); } catch (e) { /* none */ } try { speechSynthesis.cancel(); } catch (e) { /* none */ } }

/* ---------- reconnaissance vocale ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null;
/* iPhone : tant qu'un flux micro reste ouvert dans la page, Safari ne redemande plus l'autorisation */
let micStream = null, micAsked = false, sess = null;
/* sans écho ni réduction de bruit : sur iPhone (iOS 26–27), un micro « avec annulation d'écho » ouvert fait grésiller le son
   des voix, et ce traitement abîme aussi ce que la reconnaissance entend */
function holdMic() {
  if (micAsked || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.resolve(); micAsked = true;
  return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }).then(st => { micStream = st; mlog0('micro ouvert'); }).catch(e => { mlog0('micro refusé ' + (e && e.name)); });
}
/* page cachée (autre appli, écran éteint) : on rend le micro, on le reprendra au prochain appui */
document.addEventListener('visibilitychange', () => { if (document.hidden && micStream) { try { micStream.getTracks().forEach(t => t.stop()); } catch (e) { /* */ } micStream = null; micAsked = false; } });
/* journal des dernières écoutes, joint au rapport de bug (ce que le navigateur a fait, ce qu'il a entendu, ce qu'on a compris) */
const MICLOG = []; window.PVMIC = MICLOG;
function mlog0(m) { MICLOG.push(new Date().toTimeString().slice(0, 8) + ' ' + m); if (MICLOG.length > 60) MICLOG.splice(0, MICLOG.length - 60); }
let mT0 = 0; const mlog = m => mlog0('+' + ((Date.now() - mT0) / 1000).toFixed(1) + 's ' + m);
/* micro : demandé une seule fois, AVANT la reconnaissance vocale, puis gardé ouvert pour toute la visite.
   Avant, Safari posait deux questions (micro puis reconnaissance) et les reposait. La première fois, une petite explication. */
function micReady(go) {
  if (micStream || micAsked) { go(); return; }
  if (!store.get('pv_micInfo')) { store.set('pv_micInfo', 1); toast(IOS ? U.micInfoIOS : U.micInfo); }
  holdMic().then(go);
}
/* jouer sans micro : on répond seulement en touchant, et le navigateur ne demande jamais l'autorisation */
const noMic = () => !!store.get('pv_nomic');
function setNoMic(on) { store.set('pv_nomic', on ? 1 : 0); document.body.classList.remove('askmic'); document.body.classList.toggle('nomic', on); if (on) { try { if (micStream) micStream.getTracks().forEach(t => t.stop()); } catch (e) { /* */ } micStream = null; micAsked = false; } }
document.body.classList.toggle('nomic', noMic());
/* le micro est facultatif : à la première conversation, on demande comment tu veux répondre (rien n'est demandé au navigateur avant) */
if (store.get('pv_nomic') === null) document.body.classList.add('askmic');
/* écoute : on laisse le temps de finir sa phrase (les débutants hésitent), on s'arrête après un court silence,
   et on valide tout de suite dès que la réponse est sûre (early). iPhone : mode continu peu fiable, on garde le simple. */
const IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
/* Android : le mode continu y répète les morceaux déjà entendus, on garde aussi le mode simple */
const CONT = !IOS && !/Android/i.test(navigator.userAgent);
/* o.ready : appelé quand le micro écoute vraiment (avant, les premiers mots se perdaient : on parlait trop tôt)
   o.phrases : réponses attendues, pour aider la reconnaissance (Chrome récent)
   o.good : la réponse est-elle déjà claire ? Sinon, quand le navigateur s'arrête au premier silence (iPhone, Android),
   on relance l'écoute pour laisser finir la phrase (les débutants hésitent : « Can I… have… »).
   Un module d'écoute NEUF à chaque fois : sur iPhone, un module réutilisé après que l'habitant a parlé se fige sans rien dire
   (ni résultat, ni erreur, ni fin) : « ça marche la première fois, plus la deuxième ». Et des garde-fous : si rien ne démarre,
   on recrée et on réessaie une fois ; si la fin n'arrive jamais, on la force. Le bouton ne reste plus jamais bloqué. */
let noPhr = false;
function detachRec(r) { if (r) r.onstart = r.onaudiostart = r.onspeechstart = r.onresult = r.onerror = r.onend = null; }
function stopListen() { if (sess) sess.stop(); }
function listen(onInterim, onFinal, onError, onEnd, early, o) {
  o = o || {};
  if (!SR) { onError('unsupported'); if (onEnd) onEnd(); return; }
  shush();
  if (sess) sess.cancel();
  let done = false, ended = false, alts = [], acc = '', restarts = 0, retried = false, ready = false, quiet = 0, hard = 0, rdyT = 0, dog = 0, cur = null;
  const me = {};
  sess = me;
  mT0 = Date.now();
  const clr = () => { clearTimeout(quiet); clearTimeout(hard); clearTimeout(rdyT); clearTimeout(dog); };
  const endUp = () => { if (ended) return; ended = true; clr(); if (rec === cur) rec = null; if (sess === me) sess = null; if (onEnd) onEnd(); };
  const isReady = why => { if (ready) return; ready = true; clearTimeout(rdyT); mlog(why); if (o.ready) o.ready(); };
  const finish = () => {
    if (done) return; done = true; clearTimeout(quiet); clearTimeout(hard); clearTimeout(rdyT);
    try { if (cur) cur.stop(); } catch (e) { /* none */ }
    /* la fin doit arriver vite ; sinon on la force */
    dog = setTimeout(() => { mlog('fin forcée'); detachRec(cur); try { cur.abort(); } catch (e) { /* none */ } endUp(); }, 1500);
    mlog(alts.length ? 'fini « ' + alts.slice(0, 3).join(' | ') + ' »' : 'fini, rien entendu');
    if (alts.length) onFinal(alts); else onError('no-speech');
  };
  /* appui sur le micro pendant l'écoute : on termine (et si c'est figé, on coupe tout de suite) */
  me.stop = () => { if (!ready) { mlog('annulé'); me.cancel(); return; } if (!done) finish(); else { detachRec(cur); try { cur.abort(); } catch (e) { /* none */ } endUp(); } };
  /* une nouvelle écoute remplace celle-ci : plus aucun de ses événements ni minuteurs */
  me.cancel = () => { done = true; clr(); detachRec(cur); try { if (cur) cur.abort(); } catch (e) { /* none */ } if (rec === cur) rec = null; if (sess === me) sess = null; if (!ended) { ended = true; if (onEnd) onEnd(); } };
  const seg = () => {
    const r = new SR(); cur = r; rec = r;
    r.lang = S.voice; r.interimResults = true; r.maxAlternatives = 5; r.continuous = CONT;
    const usePhr = !noPhr && o.phrases && o.phrases.length && 'phrases' in r && typeof window.SpeechRecognitionPhrase === 'function';
    try { if (usePhr) r.phrases = o.phrases.map(p => new window.SpeechRecognitionPhrase(p, 3)); } catch (e) { /* none */ }
    const tr = micStream && micStream.getAudioTracks()[0];
    mlog0('écoute ' + r.lang + (CONT ? ' continu' : ' simple') + (usePhr ? ' +phrases' : '') + (restarts ? ' (relance ' + restarts + ')' : '') + (retried ? ' (nouvel essai)' : '') + (tr ? ' · micro ' + tr.readyState + (tr.muted ? ' muet' : '') : ' · sans flux'));
    let started = false, segFinal = false, again = false;
    r.onstart = () => { started = true; rdyT = setTimeout(() => isReady('prêt (start)'), 700); };
    r.onaudiostart = () => { started = true; isReady('prêt (audio)'); };
    r.onspeechstart = () => { started = true; isReady('voix'); };
    r.onresult = e => {
      started = true; isReady('résultat');
      /* phrase entière = ce qu'on avait avant une relance + tous les morceaux déjà entendus + chaque variante du dernier morceau */
      const res = e.results, last = res[res.length - 1];
      let pre = ''; for (let i = 0; i < res.length - 1; i++) { const t = res[i][0].transcript.trim(), nx = res[i + 1][0].transcript.trim().toLowerCase(); if (!nx.startsWith(t.toLowerCase())) pre += t + ' '; }
      const a = []; for (let k = 0; k < last.length; k++) { const t = ((acc ? acc + ' ' : '') + pre + last[k].transcript).replace(/\s+/g, ' ').trim(); if (t && !a.includes(t)) a.push(t); }
      if (!a.length || done) return;
      alts = a; onInterim(a[0]);
      if (early && early(a)) { mlog('sûr tout de suite'); finish(); return; }
      clearTimeout(quiet); quiet = setTimeout(finish, last.isFinal ? 1300 : 1900);
      if (!CONT && last.isFinal) { segFinal = true; if (!o.good || o.good(a) || restarts >= 2) finish(); }
    };
    r.onerror = e => {
      mlog('erreur ' + e.error);
      if (done) return;
      if (e.error === 'phrases-not-supported' && usePhr) { noPhr = true; again = true; return; }
      if (e.error === 'aborted') return;
      if (e.error === 'no-speech') { finish(); return; }
      done = true; clearTimeout(quiet); clearTimeout(hard); clearTimeout(rdyT); onError(e.error);
    };
    r.onend = () => {
      if (again && !done) { seg(); return; }
      /* phrase pas finie : on réécoute aussitôt (module neuf), ce qu'on a entendu reste */
      if (!done && alts.length && (segFinal || CONT) && o.good && !o.good(alts) && restarts < 2 && Date.now() - mT0 < 8500) {
        restarts++; acc = alts[0]; mlog('relance (phrase pas finie)'); clearTimeout(quiet); quiet = setTimeout(finish, 2600);
        setTimeout(() => { if (!done && sess === me) seg(); }, 40); return;
      }
      mlog('fin'); finish(); endUp();
    };
    try { r.start(); lastAct = Date.now(); } catch (e) { mlog('démarrage refusé ' + (e && e.name)); }
    /* rien du tout au bout de 2,5 s : module figé, on en recrée un et on réessaie une fois */
    setTimeout(() => {
      if (r !== cur || started || done || sess !== me) return;
      mlog('ne démarre pas'); detachRec(r); try { r.abort(); } catch (e) { /* none */ }
      if (!retried) { retried = true; seg(); } else { done = true; clr(); onError('busy'); endUp(); }
    }, 2500);
  };
  hard = setTimeout(finish, 10000);
  seg();
}
const NUM = {
  en: { 0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven', 12: 'twelve', 15: 'fifteen', 20: 'twenty', 30: 'thirty', 40: 'forty', 50: 'fifty', 100: 'hundred' },
  pl: { 1: 'jeden', 2: 'dwa', 3: 'trzy', 4: 'cztery', 5: 'piec', 6: 'szesc', 7: 'siedem', 8: 'osiem', 9: 'dziewiec', 10: 'dziesiec', 15: 'pietnascie', 20: 'dwadziescia', 30: 'trzydziesci', 50: 'piecdziesiat', 100: 'sto' } };
const EXP = { heres: 'here is', thats: 'that is', its: 'it is', whats: 'what is', id: 'i would', ill: 'i will', im: 'i am', wanna: 'want to', gonna: 'going to', thanx: 'thanks', ok: 'okay', o: 'oh' };
function norm(s) {
  return s.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[’']s\b/g, ' is').replace(/[’']ll\b/g, ' will').replace(/[’']d\b/g, ' would').replace(/[’']m\b/g, ' am').replace(/n[’']t\b/g, ' not')
    .replace(/£\s?(\d+)(?:[.,](\d+))?/g, (m, a, b) => ' ' + a + ' pounds ' + (b || '')).replace(/£/g, ' ').replace(/(\d+)[.,](\d+)/g, '$1 $2').replace(/'/g, '').replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/).filter(Boolean).flatMap(w => (EXP[w] || w).split(' ')).map(w => NUM[T][w] || (w === 'zl' ? 'zlotych' : w));
}
function lev(a, b) { const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; }
/* deux mots « pareils » : identiques, même début (pluriels, déclinaisons polonaises), ou une à deux lettres de différence (accent, mauvaise reconnaissance) */
const stem = w => T === 'en' ? w.replace(/(es|s)$/, '') : w;
/* homophones fréquents de la reconnaissance (« to croissants ») */
const HOMO = { en: { to: 'two', too: 'two', for: 'four', fore: 'four', won: 'one', ate: 'eight', there: 'their', theyre: 'their', no: 'know', right: 'write', by: 'bye', buy: 'bye', hear: 'here', pair: 'pear', pare: 'pear', flour: 'flower', whether: 'weather', sea: 'see', meat: 'meet', sun: 'son', wood: 'would', ya: 'you', yeah: 'yes', yep: 'yes', nope: 'no' }, pl: {} };
/* son approximatif d'un mot anglais : rattrape l'accent et les erreurs de reconnaissance (« for »/« four », « sink »/« think »).
   On garde la première lettre, on enlève les voyelles et les h, on rapproche les consonnes qui sonnent pareil. */
function snd(w) {
  if (T !== 'en' || w.length < 3) return w;
  const s = w.replace(/^kn/, 'n').replace(/^wr/, 'r').replace(/ph/g, 'f').replace(/th/g, 't').replace(/ck/g, 'k').replace(/c(?=[eiy])/g, 's').replace(/[cq]/g, 'k')
    .replace(/x/g, 'ks').replace(/z/g, 's').replace(/dg/g, 'j').replace(/gh/g, '').replace(/h/g, '').replace(/(.)\1+/g, '$1');
  return s[0] + s.slice(1).replace(/[aeiouyw]+/g, '');
}
let strictPron = false;
function same(a, b, loose) {
  const h = HOMO[T] || {};
  if (a === b || stem(a) === stem(b) || h[a] === b || h[b] === a || (h[a] && h[a] === h[b])) return true;
  if (strictPron) { const L = Math.max(a.length, b.length); return L >= 6 && lev(a, b) <= 1; }
  const n = Math.min(a.length, b.length);
  if (n >= 5 && a.slice(0, 5) === b.slice(0, 5)) return true;
  if (n >= 4 && T === 'pl' && a.slice(0, 4) === b.slice(0, 4) && Math.abs(a.length - b.length) <= 3) return true;
  const L = Math.max(a.length, b.length);
  if (L >= 4 && lev(a, b) <= (L >= 8 ? 2 : 1)) return true;
  /* en conversation, on est plus indulgent : même son à peu près */
  if (loose && T === 'en' && n >= 3) { const x = snd(stem(a)), y = snd(stem(b)); if (x.length >= 2 && (x === y || (x.length >= 3 && lev(x, y) <= 1 && x[0] === y[0]))) return true; }
  return false;
}
/* petits mots qui comptent peu : on peut les avaler sans rater sa réponse */
const LIGHT = { en: new Set('a an the is am are to of and i you it please oh so well um uh can could have want would may do does did get got'.split(' ')), pl: new Set('i w z na to jest sie a no prosze'.split(' ')) };
/* les prénoms des habitants (« hello Rosa ») ne sont jamais des mots « en trop » */
if (typeof PV !== 'undefined' && PV.NPCS) Object.values(PV.NPCS).forEach(n => { const w = (n.name || '').toLowerCase(); if (w) { LIGHT.en.add(w); LIGHT.pl.add(w); } });
['tom', 'rosa', 'leo', 'maya', 'sam'].forEach(w => LIGHT.en.add(w));
/* un mot attendu est-il dans ce qui a été entendu ? (aussi coupé en deux : « bag it » pour « baguette ») */
function findW(a, w, used, loose) {
  let i = a.findIndex((x, j) => !used.has(j) && same(x, w, loose));
  if (i < 0 && w.length >= 5) { i = a.findIndex((x, j) => j + 1 < a.length && !used.has(j) && !used.has(j + 1) && same(x + a[j + 1], w, loose)); if (i >= 0) used.add(i + 1); }
  if (i >= 0) used.add(i);
  return i >= 0;
}
function score(said, opt, loose, det) {
  const a = Array.isArray(said) ? said : norm(said), b = norm(opt); if (!a.length || !b.length) return 0;
  const lt = w => LIGHT[T] && LIGHT[T].has(w), wt = w => lt(w) ? .35 : 1;
  let got = 0, all = 0, mc = 0; const used = new Set();
  b.forEach(w => { all += wt(w); if (findW(a, w, used, loose)) { got += wt(w); if (!lt(w)) mc++; } });
  const rest = a.filter((x, j) => !used.has(j)), extra = rest.reduce((s, w) => s + wt(w), 0);
  /* mots importants entendus en trop (« good MORNING » n'est pas « good night ») */
  if (det) { det.mc = mc; det.ex = rest.filter(w => !lt(w) && !b.some(x => same(w, x, loose))).length; det.nc = b.filter(w => !lt(w)).length; }
  return got / all * .8 + got / (got + extra || 1) * .2;
}
/* meilleure réponse parmi les variantes entendues.
   Les mots propres à chaque réponse (« five » contre « four », « yes » contre « not ») comptent presque autant que la phrase entière :
   un débutant qui avale la moitié de la phrase mais dit le bon mot est compris. */
function bestOpt(alts, opts) {
  const content = o => [...new Set(norm(o.t).filter(w => !(LIGHT[T] && LIGHT[T].has(w))))];
  const W = opts.map(content);
  const uniq = W.map((ws, i) => ws.filter(w => !W.some((o, j) => j !== i && o.some(x => same(x, w)))));
  const R = opts.map(o => ({ o, s: 0, base: 0, d: 0, heard: '' }));
  /* mots collés par la reconnaissance (« goodnight » pour « good night ») : on les recoupe */
  const pairs = {}; opts.forEach(o => { const b = norm(o.t); for (let k = 0; k + 1 < b.length; k++) pairs[b[k] + b[k + 1]] = [b[k], b[k + 1]]; });
  alts.forEach(t => {
    const a = norm(t).flatMap(w => pairs[w] || [w]); if (!a.length) return;
    opts.forEach((o, i) => {
      const det = {}, base = score(a, o.t, true, det), u = uniq[i];
      const d = u.length ? u.filter(w => findW(a, w, new Set(), true)).length / u.length : base;
      const s = base * .55 + d * .45;
      if (s > R[i].s) Object.assign(R[i], { s, base, d, heard: t, mc: det.mc, ex: det.ex, nc: det.nc });
    });
  });
  const rk = R.slice().sort((x, y) => y.s - x.s);
  let b = rk[0] || { s: 0 }, sec = rk[1] || { s: 0, d: 0 };
  const out = (x, sure) => ({ best: x.o || null, bs: x.s, gap: x.s - ((rk.find(y => y !== x) || { s: 0 }).s), heard: x.heard || alts[0] || '', sure: !!(sure && x.o), ranked: rk });
  /* une seule réponse possible (« Hello! ») : sûr dès que ses mots importants sont tous là, quels que soient les mots en plus */
  if (opts.length === 1) return out(b, b.nc > 0 && b.mc >= b.nc);
  /* réponse « piège » (avec conseil) : seulement si elle est dite presque exactement ; sinon on prend la meilleure réponse correcte
     si ses mots importants sont là (« yes I like flowers » = « Yes, I love flowers! », pas le piège « Yes, I like. ») */
  if (b.o && b.o.tip && !(b.ex === 0 && b.base >= .9)) {
    const g = rk.find(x => x.o && !x.o.tip);
    return out(g || b, !!g && g.mc >= 2 && g.d > 0 && g.mc >= g.ex);
  }
  /* sûr : nettement devant, ou ses mots à elle entendus et aucun mot propre aux autres */
  const sure = !!b.o && b.mc > b.ex && ((b.s >= .5 && b.s - sec.s >= .12) || (b.d > 0 && sec.d === 0 && b.base >= .35 && b.s - sec.s >= .1));
  return out(b, sure);
}
/* prononciation d'un mot ou d'une phrase seule */
function pronScore(alts, target) {
  strictPron = true; try { return pronScore0(alts, target); } finally { strictPron = false; }
}
function pronScore0(alts, target) {
  let best = 0, heard = alts[0] || '';
  const tw = target.split(' ');
  alts.forEach(a => {
    const nw = norm(a), n = nw.join(' ');
    let s = (' ' + n + ' ').includes(' ' + target + ' ') ? 1 : 1 - lev(n, target) / Math.max(n.length, target.length, 1);
    /* un mot seul : juste s'il est entendu tel quel (ou presque, pour les mots longs) ; un mot voisin (« take » pour « cake ») reste « presque » */
    if (tw.length === 1) s = Math.max(...nw.map(w => same(w, target) ? 1 : (1 - lev(w, target) / Math.max(w.length, target.length)) * .7), 0);
    /* le mot attendu dit au milieu d'autres mots (« a croissant please ») */
    s = Math.max(s, score(a, target));
    if (s > best) { best = s; heard = a; }
  });
  return { best, heard };
}
function micError(err, out) {
  out.textContent = err === 'unsupported' ? U.noMic : (err === 'service-not-allowed' && IOS) ? U.micSiri : (err === 'not-allowed' || err === 'service-not-allowed') ? fill(U.micDenied, { b: S.baker })
    : err === 'audio-capture' ? U.micBusy : err === 'network' ? U.micNet : U.notUnderstood;
}

/* ---------- progression ---------- */
const blankLang = () => ({ found: [], cards: {}, pron: {}, missions: 0, stories: {}, met: {}, firstWin: 0, friend: {}, coll: {}, quest: null, talked: {} });
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
  const q = questToday(), qb = $('questBox');
  if (qb) { qb.classList.toggle('hidden', !q); if (q) { qb.classList.toggle('done', !!L.quest.done); $('questWho').textContent = U.questTitle + ' · ' + PV.NPCS[q.giver].name; $('questTxt').textContent = L.quest.told || L.quest.done ? questHint() : fill(U.questFrom, { n: PV.NPCS[q.giver].name }); $('questOk').textContent = L.quest.done ? U.questOk : ''; } }
  const cId = { gb: 'unicorn', pl: 'dwarf' }[country()], cr = $('collRow');
  if (cr) { cr.classList.toggle('hidden', !cId); if (cId) { $('collName').textContent = U.collTitle + ' · ' + W[cId][T]; $('collN').textContent = Object.keys(L.coll).filter(c => c.startsWith(cId)).length + '/' + (PV.COLLECT[cId] || 5); } }
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
  S = PV.SCENE[T]; D = PV.DLG[T]; L = P.L[T]; pickVoice(); loadVox();
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
      pick: (id, obj) => { if (tab !== 'town' || place !== 'town') return; if (id === 'npc:passerby') greetPasserby(obj); else if (id.startsWith('npc:')) openNpc(id.slice(4)); else { showWord(id); const cid = obj && obj.userData && obj.userData.collect; if (cid) setTimeout(() => collect(id, cid), 900); setTimeout(() => questProgress('find', id), cid ? 2200 : 1100); } },
      active: () => place === 'town' && !document.hidden };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { town = window.buildTown(H); refreshMarkers(); updTime(); if (!store.get('pv_help')) setTimeout(() => helpShow(true), 1200); if (L.firstWin || L.found.length) { L.firstWin = 1; setTimeout(announceQuest, 2500); } });
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
$('enter').onclick = () => { $('intro').classList.add('hidden'); if (place === 'town' && !L.firstWin) firstWin(); else say(T === 'pl' ? 'Dzień dobry!' : 'Hello!', { who: 'passerby' }); };

/* ---------- la place et la boulangerie ---------- */
function setPlaceUI() {
  const inB = place === 'bakery';
  $('timeBtn').classList.toggle('hidden', inB); if (inB) timePop(false);
  $('placeName').textContent = inB ? '← ' + U.backToSquare : U.placeSquare;
  $('ct').classList.toggle('hidden', inB); $('c').classList.toggle('hidden', !inB);
  $('photoBtn').classList.toggle('hidden', inB); $('exitBtn').classList.toggle('hidden', !inB);
}
function enterBakery() {
  place = 'bakery'; show(null); setPlaceUI();
  if (!bakeryBuilt && window.THREE) {
    bakeryBuilt = true;
    const H = { board: S.board, open: S.open, flour: S.flour, pal: (PV.PALS || {})[palette()],
      label: id => L.found.includes(id) ? W[id][T] : '?', found: id => L.found.includes(id),
      pick: id => { if (tab !== 'town' || place !== 'bakery') return; if (id === 'baker') openDlg(); else showWord(id); },
      bubble: () => !tasks.pay, active: () => place === 'bakery' && !document.hidden, exit: () => { if (place === 'bakery') exitBakery(); } };
    window.buildScene(H);
  }
  if (window.PVBakery && PVBakery.reset) PVBakery.reset();
  if (!L.found.some(id => !TOWN.has(id))) showIntro('bakery');
  say(T === 'pl' ? 'Dzień dobry!' : 'Hello!', { who: 'passerby' });
}
function exitBakery() { place = 'town'; show(null); if (town) town.placeAtBakery(); setPlaceUI(); }

/* ---------- mode photo ---------- */
/* pays de la ville : celui de la langue apprise (anglais → Édimbourg, polonais → Wrocław) ; ?pays=fr|gb|pl pour tester */
function country() { const q = (location.search.match(/[?&]pays=(fr|gb|pl)\b/) || [])[1]; return q || ({ en: 'gb', pl: 'pl' })[T] || 'fr'; }
function palette() { const q = (location.search.match(/palette=([abcd])/) || [])[1]; if (q) store.set('pv_pal', q); return q || store.get('pv_pal') || 'a'; }
document.querySelectorAll('[data-pal]').forEach(b => { b.classList.toggle('on', b.dataset.pal === palette()); b.onclick = () => { store.set('pv_pal', b.dataset.pal); location.href = location.pathname + '?palette=' + b.dataset.pal; }; });
const fmtH = h => { const hh = Math.floor(h) % 24, mm = Math.round((h - Math.floor(h)) * 60); return String(hh).padStart(2, '0') + ':' + String(mm === 60 ? 0 : mm).padStart(2, '0'); };
$('photoBtn').onclick = () => {
  if (!town) return; timePop(false); show(null); document.body.classList.add('photo'); $('photoBar').classList.remove('hidden');
  town.setPhoto(true); const h = town.hour(); $('phSlider').value = h; $('phHour').textContent = fmtH(h);
};
$('phSlider').oninput = () => { const h = +$('phSlider').value; $('phHour').textContent = fmtH(h); town.setHour(h); updTime(); };
$('phReal').onclick = () => { town.setHour(null); const h = town.hour(); $('phSlider').value = h; $('phHour').textContent = fmtH(h); };
$('phClose').onclick = () => { town.setPhoto(false); document.body.classList.remove('photo'); $('photoBar').classList.add('hidden'); updTime(); };
/* aide aux commandes : s'affiche la première fois que la ville apparaît, puis avec le bouton « ? » */
function helpShow(on) { $('ctrlHelp').classList.toggle('hidden', !on); if (!on) store.set('pv_help', '1'); }
$('helpBtn').onclick = e => { e.stopPropagation(); helpShow($('ctrlHelp').classList.contains('hidden')); };
$('helpOk').onclick = () => helpShow(false);
/* rapport de bug : appareil, écran, carte graphique, dernières erreurs ; copié pour être collé dans la conversation */
$('bugBtn').onclick = () => {
  let gpu = '?'; try { const g = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl'); const x = g && g.getExtension('WEBGL_debug_renderer_info'); gpu = x ? g.getParameter(x.UNMASKED_RENDERER_WEBGL) : '?'; } catch (e) { /* */ }
  const lines = ['Rapport Chatterville ' + new Date().toISOString(), location.href, navigator.userAgent, 'écran ' + innerWidth + 'x' + innerHeight + ' @' + devicePixelRatio, 'GPU ' + gpu, 'lieu ' + place + ' · mode compatible ' + (window.PVClay && PVClay.SAFE ? 'oui' : 'non'), 'reconnaissance vocale ' + (SR ? (window.SpeechRecognition ? 'oui' : 'webkit') : 'non') + (noMic() ? ' · mode sans micro' : ''), 'erreurs :'].concat((window.PVLOG || []).slice(-15), ['micro :'], MICLOG.slice(-40));
  const txt = lines.join('\n');
  const done = () => toast(U.bugCopied);
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, () => { prompt('Copie ce texte :', txt); });
  else prompt('Copie ce texte :', txt);
};
/* heure de la ville sans passer par le mode photo : une pastille dans le haut de l'écran, un curseur, et « Heure réelle » pour revenir au temps vrai */
function updTime() {
  if (!town || !town.hour) return; const h = town.hour(), man = !!(town.manual && town.manual());
  $('timeTxt').textContent = fmtH(h); $('timeIco').setAttribute('href', h >= 6.5 && h < 19.5 ? '#i-sun' : '#i-moon');
  $('timeBtn').classList.toggle('manual', man); $('tpHour').textContent = fmtH(h); $('tpReal').disabled = !man;
}
function timePop(open) {
  $('timePop').classList.toggle('hidden', !open); $('timeBtn').setAttribute('aria-expanded', open ? 'true' : 'false');
  if (open) { const r = $('timeBtn').getBoundingClientRect(), p = $('timePop'), w = p.offsetWidth; p.style.top = (r.bottom + 8) + 'px'; p.style.left = Math.max(12, Math.min(r.left, innerWidth - w - 12)) + 'px'; p.style.right = 'auto'; }
  if (open && town) $('tpSlider').value = town.hour(); updTime();
}
$('timeBtn').onclick = e => { e.stopPropagation(); timePop($('timePop').classList.contains('hidden')); };
$('tpSlider').oninput = () => { if (town) { town.setHour(+$('tpSlider').value); updTime(); } };
$('tpReal').onclick = () => { if (town) { town.setHour(null); $('tpSlider').value = town.hour(); updTime(); } };
document.addEventListener('pointerdown', e => { if (!$('timePop').classList.contains('hidden') && !e.target.closest('#timePop,#timeBtn')) timePop(false); });
setInterval(updTime, 20000);
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
  if (id !== 'dlg' && id !== 'card' && sess) sess.cancel();
}
document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => show(null));
$('misBtn').onclick = () => { updMission(); show('misSheet'); };
$('exitBtn').onclick = () => { if (place === 'bakery') exitBakery(); };
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
  if (canEnter) $('wEnterTxt').textContent = id === 'cafe' ? U.soon : U.enterBtn + ' · ' + S.baker;
  updSave(); show('card'); say(w[T], { who: 'word' });
}
function updSave() { $('wSaveTxt').textContent = L.cards[curWord] ? U.saved : U.save; }
$('wEnter').onclick = () => { if (curWord === 'bakeryShop') enterBakery(); else toast(U.soon); }; /* pas de paiement pour l'instant : le café arrive bientôt, gratuit */
$('wListen').onclick = () => { const w = W[curWord]; say(w[T], { who: 'word' }); say(w.ex[T], { queue: true, who: 'word' }); };
$('wSave').onclick = () => { if (L.cards[curWord]) delete L.cards[curWord]; else L.cards[curWord] = { box: 1, due: dayNum() }; save(); updSave(); updHud(); };
$('wRepeat').onclick = () => { if (sess) { stopListen(); return; } micReady(wRepeatGo); };
function wRepeatGo() {
  const btn = $('wRepeat'), out = $('wPron'), target = norm(W[curWord][T]).join(' ');
  btn.classList.add('on'); out.className = 'pron'; out.textContent = U.micWait;
  listen(t => { out.textContent = '« ' + t + ' »'; }, alts => {
    const { best, heard } = pronScore(alts, target);
    out.textContent = '';
    if (best >= .75) { out.append(icon('check'), document.createTextNode(U.pronGood)); praise(true, true); if (!L.pron[curWord]) { L.pron[curWord] = 1; addXP(10); } }
    else { out.className = 'pron bad'; out.textContent = fill(U.pronClose, { h: heard }); }
  }, err => { out.className = 'pron bad'; micError(err, out); }, () => btn.classList.remove('on'), alts => pronScore(alts, target).best >= .92,
  { ready: () => { out.textContent = U.listening; }, good: alts => pronScore(alts, target).best >= .75 });
}

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
let lastLine = '', lastWho = '', curOpts = [], curNpc = null;
const whoNow = () => curNpc || 'baker';
let curDlg = null, dlgMode = null;
const CV = () => ({ c: PV.CITY_NAME[country()] || 'Petite Ville', cl: PV.CITY_LOC[country()] || 'w Petite Ville' });
const DD = () => curDlg || (curNpc ? PV.NPCS[curNpc].dlg[T] : D);
const voiceP = () => curNpc ? PV.NPCS[curNpc].pitch : .95;
/* réponses « peut-être » : le micro a hésité entre elles ; les toucher compte comme une réponse parlée */
let maybe = new Set();
function markMaybe(list) { maybe = new Set(list); document.querySelectorAll('#dOpts .opt').forEach((b, i) => b.classList.toggle('maybe', maybe.has(curOpts[i]))); }
function render(line, tr, key) {
  line = fill(line, CV()); lastLine = line; $('dLine').textContent = line; $('dTrTxt').textContent = fill((tr || {})[ui] || '', CV());
  curOpts = key ? DD().opts[key] : [];
  const box = $('dOpts'); box.innerHTML = '';
  curOpts.forEach(o => {
    const b = el('button', 'opt'); b.type = 'button';
    /* petite icône pour entendre comment se dit la réponse (rien ne se lit tout seul) */
    const sp = el('span', 'optSpk'); sp.setAttribute('role', 'button'); sp.setAttribute('aria-label', U.listen); sp.appendChild(icon('spk'));
    sp.onclick = e => { e.stopPropagation(); say(o.t, { who: 'you', rate: 1 }); };
    b.append(el('span', null, o.t), el('div', 'fr', o.tr[ui] || ''), sp);
    b.onclick = () => choose(o, maybe.has(o)); box.appendChild(b);
  });
  maybe = new Set();
  $('dMic').disabled = !SR || !curOpts.length;
  $('dHeard').textContent = curOpts.length ? (SR ? U.speakNow : U.noMic) : '';
}
function go(id, line, queue) { const n = DD().nodes[id]; const l = fill(line ? line[0] : n[0], CV()); render(l, line ? line[1] : n[1], n[2]); lastWho = whoNow(); say(l, { queue, pitch: voiceP(), who: lastWho }); }
function choose(o, spoken) {
  /* une réponse touchée pendant que le micro écoute : on arrête l'écoute (sinon elle répondrait à la question suivante) */
  if (sess) sess.cancel();
  document.querySelectorAll('#dOpts .opt').forEach(b => b.classList.toggle('picked', b.firstChild && b.firstChild.textContent === o.t));
  $('dMe').textContent = U.you + ' : « ' + o.t + ' »';
  if (o.task) tasks[o.task] = true;
  if (o.task === 'order') setTimeout(() => questProgress('bakery'), 2600);
  if (o.tip) { mistakes++; $('dTip').textContent = o.tip[ui]; $('dTip').classList.remove('hidden'); } else $('dTip').classList.add('hidden');
  if (spoken) { spokenSession++; P.spoken++; if (!o.tip) { addXP(5); praise(true); } setTimeout(() => questProgress('say'), 1500); }
  else if (!o.tip) praise(false);
  updMission();
  if (o.to === 'END') {
    const e = (o.self && o.self[curNpc]) || o.reply || DD().nodes.end; render(e[0], e[1], null); lastWho = whoNow(); say(fill(e[0], CV()), { queue: true, pitch: voiceP(), who: lastWho });
    if (dlgMode === 'first') celebrateFirst();
    if (curNpc) { const who = curNpc; setTimeout(() => { if (curNpc === who) { show(null); finishNpc(who); } }, 3200); return; }
    setTimeout(() => { if (tasks.order && tasks.pay) win(); else show(null); }, 2400); return;
  }
  go(o.to, (o.self && o.self[curNpc]) || o.reply, true);
}
function openDlg() { curNpc = null; curDlg = null; dlgMode = null; $('dWho').textContent = S.baker; tasks.talk = true; discover('baker'); updMission(); $('dMe').textContent = ''; $('dTip').classList.add('hidden'); show('dlg'); go('start'); }
$('dReplay').onclick = () => say(lastLine, { pitch: voiceP(), who: lastWho });
$('dTr').onclick = () => $('dlg').classList.toggle('tr');
$('dMic').onclick = () => { if (sess) { stopListen(); return; } micReady(dMicGo); };
$('dNoMic').onclick = () => { setNoMic(true); toast(U.noMicOn); };
$('dUseMic').onclick = () => { setNoMic(false); toast(U.noMicOff); };
$('micNo').onclick = () => { setNoMic(true); toast(U.noMicOn); };
$('micYes').onclick = () => { setNoMic(false); micReady(dMicGo); };
function dMicGo() {
  const mic = $('dMic'), out = $('dHeard');
  markMaybe([]); $('dTip').classList.add('hidden');
  /* « une seconde… » tant que le navigateur n'écoute pas encore, puis « à toi » : sinon les premiers mots se perdent */
  mic.classList.add('wait'); out.textContent = U.micWait;
  listen(t => { out.textContent = '« ' + t + ' »'; }, alts => {
    const r = bestOpt(alts, curOpts);
    mlog('compris : ' + (r.sure ? '« ' + r.best.t + ' »' : 'pas sûr') + ' (' + r.ranked.slice(0, 3).map(x => x.s.toFixed(2)).join(' / ') + ')');
    out.textContent = '« ' + r.heard + ' »'; out.appendChild(el('small', null, U.heard));
    if (r.sure) { choose(r.best, true); return; }
    /* pas sûr : on montre les réponses possibles au lieu d'un simple « pas compris » */
    const cand = r.ranked.filter(x => x.s >= .3 && x.s >= r.bs - .15).slice(0, 2);
    if (cand.length) { markMaybe(cand.map(x => x.o)); $('dTip').textContent = fill(U.maybe, { h: r.heard }); $('dTip').classList.remove('hidden'); }
    else { $('dTip').textContent = U.notUnderstood; $('dTip').classList.remove('hidden'); say(fill(DD().nodes.huh[0], CV()), { pitch: voiceP(), who: whoNow() }); }
  }, err => micError(err, out), () => mic.classList.remove('on', 'wait'), alts => { const r = bestOpt(alts, curOpts); return r.sure && r.bs >= .85 && r.gap >= .25; },
  { ready: () => { mic.classList.remove('wait'); mic.classList.add('on'); out.textContent = U.listening; }, phrases: curOpts.map(o => o.t), good: alts => bestOpt(alts, curOpts).sure });
}

function openNpc(id) {
  const n = PV.NPCS[id]; if (!n) return;
  curNpc = id; curDlg = null; dlgMode = 'npc';
  const q = questToday();
  if (q && q.giver === id && !L.quest.told && !L.quest.done) { curDlg = questDlg(q); dlgMode = 'quest'; }
  else if ((L.friend[id] || 0) >= 1 && L.talked[id] !== today()) { const vs = [PV.FOLLOW[T]].concat((PV.FOLLOW2 || {})[T] || []); curDlg = vs[(dayNum() + Object.keys(PV.NPCS).indexOf(id)) % vs.length]; dlgMode = 'follow'; }
  $('dWho').textContent = n.name + ' · ' + (n.role[ui] || '') + '  ' + hearts(id);
  $('dMe').textContent = ''; $('dTip').classList.add('hidden');
  if (town && town.talkTo) town.talkTo(id);
  show('dlg'); go('start');
}
function finishNpc(id) {
  const mode = dlgMode; curNpc = null; curDlg = null; dlgMode = null;
  if (mode === 'quest') { L.quest.told = true; refreshMarkers(); toast(U.questTitle + ' · ' + questHint()); save(); return; }
  if (mode === 'first') { if (town && town.marker) town.marker('rosa', 'heart', 4); setTimeout(announceQuest, 3500); return; }
  const first = !L.met[id];
  if (first) { L.met[id] = 1; addXP(15, fill(U.newFriend, { n: PV.NPCS[id].name })); }
  L.talked[id] = today(); friendUp(id, !first);
  setTimeout(() => questProgress('talk', id), 1400);
}
/* ---------- les habitants viennent te voir ---------- */
let idleT = 0, lastVisit = 0, visits = 0;
const busyUI = () => SHEETS.some(p => !$(p).classList.contains('hidden')) || ['intro', 'win', 'onb', 'authOv'].some(p => $(p) && !$(p).classList.contains('hidden')) || document.body.classList.contains('photo');
setInterval(() => {
  if (!started || !town || !town.approach || place !== 'town' || tab !== 'town' || document.hidden || busyUI() || town.approaching()) { idleT = 0; return; }
  idleT++;
  const q = questToday(), pending = q && L.firstWin && !L.quest.told && !L.quest.done;
  if (pending && idleT >= (visits ? 45 : 8)) { if (town.approach(q.giver, () => { if (!busyUI()) openNpc(q.giver); })) { visits++; idleT = 0; } return; }
  if (!pending && idleT >= 35 && Date.now() - lastVisit > 150000) {
    const friends = Object.keys(PV.NPCS).filter(id => (L.friend[id] || 0) >= 1 && L.talked[id] !== today());
    const id = friends[(Math.random() * friends.length) | 0];
    if (id && town.approach(id, () => { if (!busyUI()) openNpc(id); })) { lastVisit = Date.now(); idleT = 0; }
  }
}, 1000);
/* ---------- amitié, demande du jour, collection, petite fête ---------- */
const hearts = id => { const f = (L && L.friend[id]) || 0; return '♥'.repeat(f) + '♡'.repeat(5 - f); };
function friendUp(id, tell) {
  const f = L.friend[id] || 0; if (f >= 5) return; L.friend[id] = f + 1; save();
  if (town && town.marker) town.marker(id, 'heart', 4);
  if (tell && f >= 1) setTimeout(() => toast(fill(U.friendUp, { n: PV.NPCS[id].name }) + ' ' + hearts(id)), 1800);
}
function questToday() {
  if (!L) return null;
  const d = dayNum(), c = country();
  if (!L.quest || L.quest.day !== d || !PV.QUESTS.some(q => q.id === L.quest.id && q[T])) {
    const pool = PV.QUESTS.filter(q => (q.c === '*' || q.c === c) && q[T]); if (!pool.length) return null;
    const q = pool[Math.floor(rng(d * 7 + (T === 'pl' ? 3 : 1))() * pool.length)];
    L.quest = { day: d, id: q.id, told: false, done: false, n: 0 };
  }
  return PV.QUESTS.find(q => q.id === L.quest.id);
}
function questDlg(q) { const ok = PV.QUEST_OK[T]; return { nodes: { start: [q[T][0], q[T][1], 'a'], end: ok.reply, huh: PV.FOLLOW[T].nodes.huh }, opts: { a: [{ t: ok.t, tr: ok.tr, to: 'END' }] } }; }
function questHint() {
  const q = questToday(); if (!q) return '';
  const w = id => W[id] ? W[id][T] + ' (' + W[id][ui] + ')' : (PV.NPCS[id] ? PV.NPCS[id].name : id);
  return q.type === 'find' ? fill(U.questFind, { w: w(q.target) }) : q.type === 'talk' ? fill(U.questTalk, { w: w(q.target) }) : q.type === 'say' ? fill(U.questSay, { k: Math.min(L.quest.n || 0, q.n), t: q.n }) : U.questBakery;
}
function announceQuest() { const q = questToday(); if (!q || L.quest.told || L.quest.done || place !== 'town') return; refreshMarkers(); toast(fill(U.questFrom, { n: PV.NPCS[q.giver].name })); }
function refreshMarkers() { if (!town || !town.marker) return; const q = questToday(); Object.keys(PV.NPCS).forEach(id => town.marker(id, q && q.giver === id && !L.quest.told && !L.quest.done ? 'quest' : null)); }
function questProgress(type, id) {
  const q = questToday(); if (!q || !L.quest.told || L.quest.done || q.type !== type) return;
  let ok = false;
  if (type === 'find' || type === 'talk') ok = q.target === id;
  else if (type === 'say') { L.quest.n = (L.quest.n || 0) + 1; ok = L.quest.n >= q.n; if (!ok) { save(); updMission(); return; } }
  else ok = true;
  if (!ok) return;
  L.quest.done = true; const g = PV.NPCS[q.giver];
  addXP(30, fill(U.questDone, { n: g.name })); friendUp(q.giver, false); confetti();
  if (town && town.cheer) { town.cheer(q.giver); town.marker(q.giver, 'heart', 5); }
  say(T === 'pl' ? 'Dziękuję!' : 'Thank you!', { pitch: g.pitch, who: q.giver }); updMission();
}
function collect(id, cid) {
  if (L.coll[cid]) return; L.coll[cid] = 1;
  const k = Object.keys(L.coll).filter(c => c.startsWith(id)).length, t = PV.COLLECT[id] || 5;
  if (k >= t) { addXP(50, U.collDone); confetti(); } else addXP(10, fill(U.collFound, { w: W[id][T], k, t }));
  updMission();
}
/* bravo ! grand mot qui rebondit, +XP qui s'envole, option en vert, petite pluie de confettis, l'habitant saute de joie */
const PRAISE = { fr: ['Parfait !', 'Super !', 'Excellent !', 'Bien dit !', 'Bravo !'], pl: ['Świetnie!', 'Super!', 'Doskonale!', 'Brawo!', 'Pięknie!'] };
function praise(spoken, word) {
  const words = PRAISE[ui] || PRAISE.fr, w = words[(Math.random() * words.length) | 0];
  const box = el('div', 'praise' + (spoken ? ' big' : '')); box.append(el('b', null, '✓ ' + w)); if (spoken) box.append(el('small', null, '+' + (word ? 10 : 5) + ' XP'));
  document.body.appendChild(box); setTimeout(() => box.remove(), 1600);
  const sel = document.querySelector('#dOpts .opt.picked'); if (sel) sel.classList.add('good');
  if (spoken) { burst(); if (curNpc && town && town.cheer) town.cheer(curNpc); if (navigator.vibrate) try { navigator.vibrate([18, 40, 18]); } catch (e) { /* none */ } }
}
function burst() {
  const box = el('div', 'burst'), C = ['#ffb547', '#7fd99a', '#ff7d6b', '#8ec5ff', '#fff8ee'];
  for (let i = 0; i < 26; i++) { const c = el('i'), a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 110; c.style.setProperty('--dx', Math.cos(a) * d + 'px'); c.style.setProperty('--dy', Math.sin(a) * d - 40 + 'px'); c.style.background = C[i % C.length]; box.appendChild(c); }
  document.body.appendChild(box); setTimeout(() => box.remove(), 1200);
}
function confetti(title) {
  const box = el('div', 'confetti'); const C = ['#ffb547', '#ff7d6b', '#7fd99a', '#8ec5ff', '#fff8ee', '#c8b6f0'];
  for (let i = 0; i < 70; i++) { const c = el('i'); c.style.left = (Math.random() * 100) + '%'; c.style.background = C[i % C.length]; c.style.animationDelay = (Math.random() * .5) + 's'; c.style.animationDuration = (1.6 + Math.random() * 1.4) + 's'; c.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)'; box.appendChild(c); }
  if (title) { const b = el('b', 'confTitle', title); box.appendChild(b); }
  document.body.appendChild(box); setTimeout(() => box.remove(), 3400);
}
function firstWin() {
  if (!town) { setTimeout(firstWin, 300); return; }
  curNpc = 'rosa'; curDlg = PV.FIRST[T]; dlgMode = 'first';
  $('dWho').textContent = PV.NPCS.rosa.name + ' · ' + (PV.NPCS.rosa.role[ui] || '');
  $('dMe').textContent = ''; $('dTip').classList.add('hidden');
  if (town.talkTo) town.talkTo('rosa');
  setTimeout(() => { show('dlg'); go('start'); }, 900);
}
function celebrateFirst() {
  L.firstWin = 1; L.met.rosa = 1; L.talked.rosa = today(); friendUp('rosa', false);
  confetti(U.firstWinTitle);
  if (town && town.cheer) town.cheer('rosa');
  addXP(10, fill(U.firstWinText, { l: PV.IN_LANG[ui][T] }));
}
function greetPasserby(obj) {
  const list = PV.GREET[T] || [], g = list[(Math.random() * list.length) | 0]; if (!g) return;
  if (town && town.greet) town.greet(obj);
  say(g[0], { pitch: .9 + Math.random() * .4, who: 'passerby' }); toast('« ' + g[0] + ' » — ' + (g[1][ui] || ''));
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
    const p = el('button', 'ib'); p.type = 'button'; p.setAttribute('aria-label', U.listen); p.appendChild(icon('spk')); p.onclick = () => say(w[T], { who: 'word' });
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
$('fShow').onclick = () => { $('fA').classList.remove('hidden'); $('fShow').classList.add('hidden'); $('fAgain').classList.remove('hidden'); $('fKnew').classList.remove('hidden'); say(W[queue[0]][T], { who: 'word' }); };
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
  /* amis et collection */
  const fcs = section(U.friendsTitle), flist = el('div', 'friendList');
  Object.keys(PV.NPCS).forEach(id => { const known = (L.friend[id] || 0) > 0 || L.met[id]; const row = el('div', 'friendRow' + (known ? '' : ' unknown')); row.append(el('b', null, known ? PV.NPCS[id].name : '?'), el('span', 'sub', PV.NPCS[id].role[ui] || ''), el('span', 'hearts', hearts(id))); flist.appendChild(row); });
  fcs.appendChild(flist);
  const cId = { gb: 'unicorn', pl: 'dwarf' }[country()];
  if (cId) {
    const tot = PV.COLLECT[cId] || 5, got = Object.keys(L.coll).filter(c => c.startsWith(cId)).length;
    fcs.appendChild(el('h3', 'collH', U.collTitle + ' · ' + W[cId][T] + ' ' + got + '/' + tot));
    const slots = el('div', 'collSlots'); for (let i = 0; i < tot; i++) { const on = !!L.coll[cId + i]; slots.appendChild(el('span', 'slot ' + cId + (on ? ' on' : ''), on ? '' : '?')); }
    fcs.appendChild(slots); fcs.appendChild(subP(got >= tot ? U.collAll : fill(U.collLeft, { n: tot - got }), '8px 0 0'));
  }
  box.appendChild(fcs);
  /* quiz du jour */
  const qc = section(U.quizTitle); const q = quizOfDay(), key = dayNum() + '-' + T, doneQ = P.quizDay === key;
  qc.appendChild(subP(fill(U.quizQ, { w: W[q.id][T] }), '0'));
  const qo = el('div', 'qOpts');
  q.opts.forEach(id => {
    const b = el('button', 'qOpt', W[id][ui]); b.type = 'button';
    if (doneQ) { b.disabled = true; if (id === q.id) b.classList.add('ok'); else if (id === P.quizPick) b.classList.add('no'); }
    b.onclick = () => {
      P.quizDay = key; P.quizPick = id; P.quizRes = id === q.id ? 'ok' : 'no'; say(W[q.id][T], { who: 'word' });
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
  box.appendChild(el('p', 'credit', U.voiceCredit));
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
/* tests automatiques seulement (?test) */
if (/[?&]test\b/.test(location.search)) window.PVT = { openNpc, opts: () => curOpts, markMaybe };
}
