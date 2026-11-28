/* Chatterville — l'histoire (chapitre 1 « Sans rien »).
   Un enchaînement d'étapes : carte de départ, prologue sans paroles, Tom et le petit test, la boulangerie,
   la pharmacie et la police, la cabine, l'indice de Maya, le notaire qui ment, la fin du chapitre.
   L'état est gardé dans la progression du joueur (L.story). Les textes sont dans story-data.js. */
(function () {
  const S1 = () => PV.STORY1;
  const A = () => window.PVA;                       /* accès au jeu (app.js) */
  const st = () => { const L = A().L(); if (!L.story) L.story = null; return L.story; };
  const set = (k, v) => { const s = st(); s[k] = v; A().save(); };
  const $ = id => document.getElementById(id);
  let busy = false;

  /* ---------- petits éléments d'interface : légende (pensées en français), carnet, cartes ---------- */
  function ui() {
    if ($('stCap')) return;
    const cap = document.createElement('div'); cap.id = 'stCap'; cap.className = 'hidden';
    cap.innerHTML = '<p id="stCapTxt"></p><button type="button" id="stCapGo">Continuer ›</button>';
    document.body.appendChild(cap);
    const nb = document.createElement('button'); nb.type = 'button'; nb.id = 'carnet'; nb.className = 'hidden';
    nb.innerHTML = '<b>Carnet</b><span id="carnetTxt"></span><i id="carnetCoins"></i>';
    nb.onclick = () => { if (st() && st().obj) caption(st().obj); };
    document.body.appendChild(nb);
    const card = document.createElement('div'); card.id = 'stCard'; card.className = 'hidden';
    document.body.appendChild(card);
  }
  let capCb = null;
  function caption(text, cb) {
    ui(); $('stCapTxt').textContent = text; $('stCap').classList.remove('hidden'); capCb = cb || null;
    $('stCap').onclick = () => { $('stCap').classList.add('hidden'); const f = capCb; capCb = null; if (f) f(); };
  }
  function carnet() {
    ui(); const s = st();
    if (!s || s.off || !s.obj || s.step === 'done') { $('carnet').classList.add('hidden'); return; }
    $('carnetTxt').textContent = s.obj;
    $('carnetCoins').textContent = '£' + (s.coins || 0) + (s.has && s.has.photo ? ' · 📷' : '');
    $('carnet').classList.remove('hidden');
  }
  function objective(key) { const s = st(); s.obj = S1().obj[key] || key; A().save(); carnet(); setTimeout(remark, 50); }
  function card(title, text, buttons) {
    ui(); const c = $('stCard'); c.innerHTML = '';
    const box = document.createElement('div'); box.className = 'stBox';
    const h = document.createElement('h2'); h.textContent = title; const p = document.createElement('p'); p.textContent = text;
    box.append(h, p);
    buttons.forEach(([label, fn, cls]) => { const b = document.createElement('button'); b.type = 'button'; b.className = cls || 'btn'; b.textContent = label; b.onclick = () => { c.classList.add('hidden'); fn(); }; box.appendChild(b); });
    c.appendChild(box); c.classList.remove('hidden');
  }

  /* ---------- dialogues : version débutant ou confirmé, prénom et épellation remplis ---------- */
  function prep(d) {
    const s = st(), conf = s.reg === 'conf', n = (A().P().pseudo || 'Alex').replace(/[^A-Za-zÀ-ÿ\- ]/g, '').trim() || 'Alex';
    const letters = n.toUpperCase().replace(/[^A-Z]/g, '').split('');
    const sp = letters.join(' - '), w = letters.slice(); if (w.length > 1) { const t = w[0]; w[0] = w[1]; w[1] = t; } else w.push('E');
    const fillS = x => typeof x === 'string' ? x.replace(/\{n\}/g, n).replace(/\{sp\}/g, sp).replace(/\{sw\}/g, w.join(' - ')) : x;
    const nodes = {}, opts = {};
    Object.keys(d.nodes).forEach(k => { const v = d.nodes[k]; nodes[k] = [fillS(conf && v[3] ? v[3] : v[0]), { fr: fillS(v[1].fr) }, v[2], (d.listen || []).includes(k) ? 'listen' : undefined]; });
    Object.keys(d.opts).forEach(k => {
      opts[k] = d.opts[k].map(o => {
        const r = Object.assign({}, o);
        r.t = fillS(conf && o.tc ? o.tc : o.t); r.tr = { fr: fillS(((conf && o.trc) || o.tr || {}).fr || '') };
        if (o.reply) r.reply = [fillS(conf && o.reply[2] ? o.reply[2] : o.reply[0]), { fr: fillS(o.reply[1].fr) }];
        return r;
      });
      /* ordre mélangé : la bonne réponse n'est pas toujours la première ; « répéter » et « je ne comprends pas » restent en dernier */
      const main = opts[k].filter(o => !o.again && !o.dk), tail = opts[k].filter(o => o.again || o.dk);
      if (!TESTMODE) for (let i = main.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = main[i]; main[i] = main[j]; main[j] = t; }
      opts[k] = main.concat(tail);
    });
    return { nodes, opts };
  }
  /* ?test (tests automatiques) : pas de mélange, pour des parties reproductibles */
  const TESTMODE = /[?&]test\b/.test(location.search);
  let after = null;
  function talk(who, key, cb) { after = cb || null; A().openStory(who, S1().who[who] || who, prep(S1().dlg[key]), S1().pitch[who] || 1); }

  /* ---------- le test de niveau : deux questions par niveau (1 = A1, 2 = A2, 3 = B1) ;
     un niveau n'est validé que si ses deux réponses sont justes ; on s'arrête gentiment après le premier niveau raté ---------- */
  let test = null;
  function choose(o) {
    if (o.flag) flag(o.flag);
    if (!test || o.pl == null) return null;
    const lv = o.lv || 1; test.ans[lv] = (test.ans[lv] || 0) + 1; if (o.pl) test.ok[lv] = (test.ok[lv] || 0) + 1; else test.fail[lv] = 1;
    if (test.fail[lv] && test.ans[lv] >= 2 && o.to !== 'END') return { to: 'END', reply: ["Don't worry. Let's talk later!", { fr: 'Pas de souci. On parlera plus tard !' }] };
    return null;
  }
  /* niveau du cadre européen : le plus haut niveau dont tous les niveaux en dessous sont validés */
  function cefr() { let L = 0; for (let k = 1; k <= 3; k++) { if ((test.ok[k] || 0) >= 2 && !test.fail[k]) L = k; else break; } return ['A0', 'A1', 'A2', 'B1'][L]; }
  function levelCard(c, cb) { const m = S1().level; card(m.title.replace('{c}', c === 'B1' ? 'B1 ou plus' : c), m[c] + ' ' + m.note, [['OK', cb]]); }
  function flag(f) {
    const s = st(); s.has = s.has || {}; s.has[f] = 1;
    if (f === 'brush') s.coins = Math.max(0, (s.coins || 0) - 2);
    if (f === 'paid') s.coins = (s.coins || 0) + 5;
    A().save(); carnet();
  }
  const has = k => { const s = st() || {}; if (k === 'coins2') return (s.coins || 0) >= 2; return !!(s.has && s.has[k]); };
  function skipBtn(on) {
    let b = $('stSkip');
    if (on && !b) { b = document.createElement('button'); b.type = 'button'; b.id = 'stSkip'; b.className = 'pillBtn'; b.textContent = S1().skip; const t = document.querySelector('#dlg .talk'); if (t) t.appendChild(b); b.onclick = () => { test.skip = true; test.bad = 9; A().closeDlg(); }; }
    if (!on && b) b.remove();
  }

  /* ---------- les étapes ---------- */
  const town = () => A().town();
  function startCard() {
    const t = S1().start;
    card(t.title, t.text, [[t.deb, () => begin('deb', false)], [t.test, () => begin('conf', true)], [t.free, () => { A().L().story = { off: 1 }; A().save(); A().freeStart(); }, 'btn ghost']]);
  }
  function begin(reg, withTest) { A().L().story = { ch: 1, step: 'prologue', reg, coins: 0, has: {}, test: withTest ? 1 : 0 }; A().save(); prologue(); }
  let fIv = 0;
  function prologue() {
    const T = town(); if (!T || !T.actor) { setTimeout(prologue, 400); return; }
    busy = true; T.lock(true); T.suitcase('me');
    caption(S1().cap.arrive, () => {
      busy = false; T.lock(false); objective('fountain');
      const t0 = Date.now(); clearInterval(fIv);
      fIv = setInterval(() => { const p = T.mePos(); if (Math.hypot(p.x, p.z) < 3.6 || Date.now() - t0 > 40000) { clearInterval(fIv); thiefScene(); } }, 300);
    });
  }
  function thiefScene() {
    const T = town(); busy = true; T.lock(true);
    const p = T.mePos(), ex = T.exitPt(13.5), L = Math.hypot(p.x - ex[0], p.z - ex[1]) || 1, ux = (ex[0] - p.x) / L, uz = (ex[1] - p.z) / L;
    T.actor('thief', { show: true, at: [p.x + ux * 6, p.z + uz * 6] });
    T.goTo('thief', [[p.x + ux * 1.1, p.z + uz * 1.1]], 1.3, () => talk('thief', 'thief', () => {
      T.suitcase('thief');
      T.goTo('thief', [[p.x + ux * 7, p.z + uz * 7], ex], 4.8, () => { T.actor('thief', { show: false }); T.suitcase(null); });
      setTimeout(() => caption(S1().cap.stolen, () => { set('step', 'tom'); tom(); }), 1600);
    }));
  }
  function tom() {
    const T = town(); busy = true; T.lock(true);
    caption(S1().cap.someone, () => {
      T.actor('tom', { show: true, home: true });
      const go = () => { if (!T.approach('tom', () => afterApproach())) setTimeout(go, 300); };
      go();
    });
    function afterApproach() {
      if (st().test) { test = { ok: {}, fail: {}, ans: {} }; talk('tom', 'test', () => { const c = test.skip ? 'A0' : cefr(), r = c === 'A2' || c === 'B1' ? 'conf' : 'deb'; test = null; skipBtn(false); set('reg', r); set('cefr', c); levelCard(c, () => talk('tom', 'tomHelp', toWork)); }); setTimeout(() => skipBtn(true), 600); }
      else talk('tom', 'tomHelp', toWork);
    }
  }
  function toWork() { const T = town(); busy = false; T.lock(false); T.actor('tom', { show: false, home: true }); set('step', 'work'); objective('work'); }
  function work() {
    busy = true;
    const B = window.PVBakery || {}, LK = S1().looks;
    if (B.jobStart) B.jobStart();
    const custom = (who, cb) => B.cust ? B.cust(LK[who], () => talk(who, who, () => B.custLeave(cb))) : talk(who, who, cb);
    talk('tom', 'shop', () => custom('jack', () => custom('patel', () => talk('tom', 'pay', () => { if (B.jobEnd) B.jobEnd(); busy = false; set('step', 'errands'); errands(); }))));
  }
  function errands() {
    const s = st(), T = town();
    if (s.has.police && s.has.brush) { T && T.actor('jones', { show: false }); T && T.actor('okafor', { show: false }); set('step', 'phone'); objective('phone'); return; }
    if (T) { T.actor('jones', { show: !s.has.police, home: true }); T.actor('okafor', { show: !s.has.brush, home: true }); }
    objective(s.has.police ? 'brush' : s.has.brush ? 'police' : 'errands');
  }
  function end() {
    const T = town(); busy = true; T.lock(true); T.actor('pemberton', { show: false });
    const ex = T.exitPt(9.8), ex2 = T.exitPt(14);
    T.actor('thief', { show: true, at: ex }); T.goTo('thief', [ex2], 4.5, () => T.actor('thief', { show: false }));
    caption(S1().cap.end, () => {
      busy = false; T.lock(false); set('step', 'done'); objective('done'); A().reward(40);
      const c = S1().endCard; card(c.title, c.text, [[c.ok, () => {}]]);
    });
  }

  function marks() {
    const s = st(); if (!s || s.off) return [];
    if (s.step === 'errands') return [!s.has.police && 'jones', !s.has.brush && 'okafor'].filter(Boolean);
    if (s.step === 'clue') return ['maya']; if (s.step === 'lie') return ['pemberton'];
    return [];
  }
  const remark = () => { try { A().refreshMarkers(); } catch (e) { /* */ } };
  /* recommencer : l'histoire seule, ou tout */
  function restart(all) {
    const R = S1().restart;
    card(R.title, all ? R.all : R.story, [[R.yes, () => { A().restart(all); }], [R.no, () => {}, 'btn ghost']]);
  }
  /* ---------- branchements : le jeu demande à l'histoire si elle veut prendre la main ---------- */
  window.PVStory = {
    /* au lancement de la ville : true si l'histoire s'en occupe (carte de départ ou reprise) */
    boot() {
      ui(); const s = st();
      if (s && s.off) return false;
      if (!s) { startCard(); return true; }
      const T = town();
      if (s.step === 'prologue') { prologue(); return true; }
      setTimeout(remark, 600);
      if (s.step === 'tom') { tom(); return true; }
      if (s.step === 'errands') errands();
      if (s.step === 'lie' && T) T.actor('pemberton', { show: true, home: true });
      carnet(); return s.step !== 'done';
    },
    active: () => { const s = st(); return !!(s && !s.off && s.step !== 'done'); },
    busy: () => busy,
    choose, has, marks, restart,
    /* fin d'un dialogue de l'histoire */
    dlgEnd() { const f = after; after = null; if (f) setTimeout(f, 250); },
    /* toucher un habitant : true si l'histoire répond à sa place */
    npc(id) {
      const s = st(); if (!s || s.off || busy) return false;
      if (s.step === 'errands' && id === 'okafor' && !s.has.brush) { talk('okafor', 'okafor', () => { if (!has('brush') && !has('coins2')) caption(S1().cap.noMoney); errands(); }); return true; }
      if (s.step === 'errands' && id === 'jones' && !s.has.police) { talk('jones', 'jones', errands); return true; }
      if (s.step === 'clue' && id === 'maya') { talk('maya', 'maya', () => { if (has('photo')) { set('step', 'lie'); objective('lie'); town().actor('pemberton', { show: true, home: true }); } }); return true; }
      if (s.step === 'lie' && id === 'pemberton') { talk('pemberton', 'pemberton', () => { if (has('truth')) end(); else caption(S1().cap.lied); }); return true; }
      if (s.step === 'work' && id === 'baker') { work(); return true; }
      return false;
    },
    /* toucher l'étiquette d'un objet : la cabine rouge */
    obj(id) {
      const s = st(); if (!s || s.off || busy) return false;
      if (s.step === 'errands' && id === 'pharmacy' && !s.has.brush) return this.npc('okafor');
      if (s.step === 'errands' && id === 'townhall' && !s.has.police) return this.npc('jones');
      if (s.step === 'phone' && id === 'phonebox') { talk('operator', 'operator', () => caption(S1().cap.mum, () => { set('step', 'clue'); objective('clue'); })); return true; }
      return false;
    },
    /* entrer dans un lieu */
    place(p) { const s = st(); if (!s || s.off) return false; if (p === 'bakery' && s.step === 'work') { setTimeout(work, 1200); return true; } return false; },
    carnet
  };
})();
