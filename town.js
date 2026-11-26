/* La place de Petite Ville : un diorama sur une petite île flottante, visité à la première personne.
   Tout est construit ici (aucun modèle externe) : façades peintes sur canvas, pignons découpés, lumière qui suit l'heure. */
window.buildTown = function (H) {
const $ = id => document.getElementById(id);
const canvas = $('ct');
const mobile = Math.min(innerWidth, innerHeight) < 700;
const R = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
R.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2)); R.setSize(innerWidth, innerHeight);
R.outputEncoding = THREE.sRGBEncoding; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(mobile ? 74 : 66, innerWidth / innerHeight, .08, 500);
const rnd = (a, b) => a + Math.random() * (b - a);
const TAU = Math.PI * 2;

/* ---------- outils ---------- */
function tex(w, h, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; }
const M = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .85 }, o || {}));
const F = (c, o) => M(c, Object.assign({ flatShading: true }, o || {}));
function mk(geo, mat, x, y, z, p) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); (p || scene).add(m); return m; }
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d), cyl = (a, b, h, s) => new THREE.CylinderGeometry(a, b, h, s || 16), ico = (r, d) => new THREE.IcosahedronGeometry(r, d || 0);
function shade(hex, k) { const c = new THREE.Color(hex); const hsl = {}; c.getHSL(hsl); c.setHSL(hsl.h, hsl.s, Math.min(1, Math.max(0, hsl.l + k))); return '#' + c.getHexString(); }
function jitter(geo, a) { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { p.setXYZ(i, p.getX(i) + rnd(-a, a), p.getY(i) + rnd(-a, a) * .6, p.getZ(i) + rnd(-a, a)); } geo.computeVertexNormals(); return geo; }
const hits = [];
function item(id, parent) { const g = new THREE.Group(); g.userData.id = id; hits.push(g); (parent || scene).add(g); return g; }
const glowT = tex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,220,150,1)'); gr.addColorStop(.35, 'rgba(255,190,110,.45)'); gr.addColorStop(1, 'rgba(255,170,90,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
const halos = [], winMats = [], lampMats = [], clockMats = [];

/* ---------- ciel : dôme dégradé + soleil/lune + étoiles ---------- */
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, bot: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Color() } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false,
  vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }',
  fragmentShader: 'uniform vec3 top; uniform vec3 hor; uniform vec3 bot; uniform vec3 sunDir; uniform vec3 sunCol; varying vec3 vW;\n' +
    'void main(){ vec3 d = normalize(vW - cameraPosition); float h = d.y; vec3 c = h > 0.0 ? mix(hor, top, pow(h, 0.55)) : mix(hor, bot, pow(-h, 0.7) * 0.75);\n' +
    ' float s = max(dot(d, normalize(sunDir)), 0.0); c += sunCol * (smoothstep(0.9985, 0.9993, s) * 1.6 + pow(s, 14.0) * 0.28);\n' +
    ' gl_FragColor = linearToOutputTexel(vec4(c, 1.0)); }'
}));
sky.renderOrder = -10; scene.add(sky);
const starGeo = new THREE.BufferGeometry(); const sp = [];
for (let i = 0; i < 700; i++) { const u = Math.random(), v = Math.random() * .9 + .08, th = u * TAU, ph = Math.acos(1 - v); sp.push(Math.sin(ph) * Math.cos(th) * 280, Math.cos(ph) * 280, Math.sin(ph) * Math.sin(th) * 280); }
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
const starMat = new THREE.PointsMaterial({ color: '#fff6e0', size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false });
const stars = new THREE.Points(starGeo, starMat); scene.add(stars);
scene.fog = new THREE.Fog('#d6ecfa', 45, 160);

/* ---------- lumières ---------- */
const hemi = new THREE.HemisphereLight('#cfe6ff', '#6b4a35', .6); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 1.2); scene.add(sun, sun.target);
sun.castShadow = true; sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -17, right: 17, top: 17, bottom: -17, near: 1, far: 90 }); sun.shadow.bias = -.0006; sun.shadow.normalBias = .03;
const lampLights = [];

/* ---------- l'île ---------- */
const grassT = tex(256, 256, (g, w, h) => { g.fillStyle = '#86b25f'; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { g.fillStyle = Math.random() < .5 ? 'rgba(60,110,40,.25)' : 'rgba(190,220,120,.25)'; g.fillRect(Math.random() * w, Math.random() * h, 3, 5); } const fl = ['#fff6d8', '#ffd35a', '#ff9db4', '#c9b3ff']; for (let i = 0; i < 60; i++) { g.fillStyle = fl[i % 4]; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 2.2, 0, TAU); g.fill(); } }, [8, 8]);
const top = mk(cyl(15, 15, .6, 72), [F('#9a6a46'), M('#ffffff', { map: grassT }), F('#7a5038')], 0, -.3, 0); top.receiveShadow = true;
const l1 = mk(jitter(cyl(15, 11.5, 2.4, 40, 3), .35), F('#9a6a46'), 0, -1.8, 0);
const l2 = mk(jitter(cyl(11.5, 6, 3.2, 32, 3), .45), F('#7d5139'), 0, -4.6, 0);
const l3 = mk(jitter(new THREE.ConeGeometry(6, 5, 24, 3), .5), F('#61402d'), 0, -8.7, 0); l3.rotation.x = Math.PI;
[[9, -3, 4], [-7, -4, 9], [3, -5.5, -10]].forEach(([x, y, z]) => mk(jitter(ico(1.4, 1), .25), F('#7a5038'), x, y, z));
const cobT = tex(512, 512, (g, w, h) => {
  g.fillStyle = '#a8957d'; g.fillRect(0, 0, w, h);
  const cols = ['#d8c6ad', '#cbb69a', '#e2d3bd', '#c2ab8f', '#d1bfa6', '#bfae96', '#cdb08f'];
  for (let y = 0; y < h + 18; y += 17) { let x = rnd(-8, 0); while (x < w + 10) { const sw = rnd(13, 22); g.fillStyle = cols[(Math.random() * cols.length) | 0]; g.beginPath(); g.ellipse(x + sw / 2, y + rnd(-1.5, 1.5), sw / 2 - 1.5, rnd(6, 7.5), rnd(-.15, .15), 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.08)'; g.beginPath(); g.ellipse(x + sw / 2 - 2, y - 2, sw / 4, 2.5, 0, 0, TAU); g.fill(); x += sw; } }
}, [10, 10]);
const square = item('square');
const pav = mk(new THREE.CircleGeometry(9.9, 72), M('#ffffff', { map: cobT, roughness: .95 }), 0, .015, 0, square); pav.rotation.x = -Math.PI / 2; pav.receiveShadow = true;
const ring = mk(new THREE.RingGeometry(9.9, 10.25, 72), M('#9c8a74'), 0, .02, 0, square); ring.rotation.x = -Math.PI / 2;
const G = 0.7; /* direction de l'entrée (là d'où l'on arrive) */
const pathT = tex(128, 256, (g, w, h) => { g.fillStyle = '#d9c09a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { g.fillStyle = 'rgba(140,105,70,.2)'; g.fillRect(Math.random() * w, Math.random() * h, 3, 3); } });
const path = mk(new THREE.PlaneGeometry(2.6, 5.2), M('#ffffff', { map: pathT }), Math.sin(G) * 12.5, .02, Math.cos(G) * 12.5, square); path.rotation.set(-Math.PI / 2, 0, G); path.receiveShadow = true;

/* ---------- façades peintes ---------- */
function facade(sp) {
  const k = 256 / sp.w, W = 256, Hh = Math.round(sp.h * k), gfm = sp.shop ? 2.5 : 1.9, gf = gfm * k;
  const lit = []; const map = document.createElement('canvas'), emi = document.createElement('canvas');
  map.width = emi.width = W; map.height = emi.height = Hh;
  const g = map.getContext('2d'), e = emi.getContext('2d');
  e.fillStyle = '#000'; e.fillRect(0, 0, W, Hh);
  g.fillStyle = sp.color; g.fillRect(0, 0, W, Hh);
  for (let i = 0; i < 1400; i++) { g.fillStyle = Math.random() < .5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.04)'; g.fillRect(Math.random() * W, Math.random() * Hh, 2, 2); }
  g.fillStyle = shade(sp.color, -.1); g.fillRect(0, Hh - gf, W, gf);
  const trim = sp.trim || '#f7f1e6';
  g.fillStyle = trim; g.fillRect(0, Hh - gf - 5, W, 6);
  const usable = sp.h - gfm - .35, floors = Math.max(1, Math.floor(usable / 1.35)), fh = usable / floors * k;
  const n = sp.w >= 5 ? 3 : 2, ww = .62 * k, wh = Math.min(.95 * k, fh * .62);
  for (let f = 0; f < floors; f++) {
    const yb = Hh - gf - 6 - f * fh, wy = yb - fh * .5 - wh / 2;
    if (f > 0) { g.fillStyle = shade(sp.color, .06); g.fillRect(0, yb - 3, W, 3); }
    for (let i = 0; i < n; i++) {
      const cx = W * (i + .5) / n + rnd(-1, 1), x = cx - ww / 2, y = wy + rnd(-1, 1);
      if (sp.shutters) { g.fillStyle = sp.shutters; g.fillRect(x - ww * .42, y, ww * .38, wh); g.fillRect(x + ww * 1.04, y, ww * .38, wh); }
      g.fillStyle = trim; g.fillRect(x - 4, y - 4, ww + 8, wh + 8);
      if (sp.arch) { g.beginPath(); g.ellipse(cx, y - 2, ww / 2 + 4, ww * .35, 0, Math.PI, 0); g.fill(); }
      g.fillStyle = '#2c3550'; g.fillRect(x, y, ww, wh);
      if (sp.arch) { g.beginPath(); g.ellipse(cx, y, ww / 2, ww * .3, 0, Math.PI, 0); g.fill(); }
      g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(x + 3, y + 3, ww * .35, wh * .45);
      g.fillStyle = trim; g.fillRect(cx - 2, y, 4, wh); g.fillRect(x, y + wh * .42, ww, 4);
      g.fillStyle = shade(trim, -.12); g.fillRect(x - 7, y + wh + 3, ww + 14, 5);
      if (sp.flowers && Math.random() < .5) { g.fillStyle = '#7a4a2a'; g.fillRect(x - 3, y + wh + 6, ww + 6, 7); for (let j = 0; j < 6; j++) { g.fillStyle = ['#ff7d9a', '#ffd35a', '#ff5a5a', '#c48bff'][j % 4]; g.beginPath(); g.arc(x + j * ww / 5, y + wh + 4, 3.5, 0, TAU); g.fill(); } }
      if (Math.random() < .62) { lit.push(1); e.fillStyle = Math.random() < .5 ? '#ffc76e' : '#ffdca0'; e.fillRect(x, y, ww, wh); if (sp.arch) { e.beginPath(); e.ellipse(cx, y, ww / 2, ww * .3, 0, Math.PI, 0); e.fill(); } e.fillStyle = '#000'; e.fillRect(cx - 2, y, 4, wh); e.fillRect(x, y + wh * .42, ww, 4); }
    }
  }
  /* rez-de-chaussée */
  const dw = .95 * k, dh = 1.55 * k, dy = Hh - dh;
  if (sp.shop) {
    const sx = W * .08, sw = W * .5, sy = Hh - 2.0 * k;
    g.fillStyle = sp.shopFrame || '#3d2a22'; g.fillRect(sx - 5, sy - 5, sw + 10, 1.9 * k);
    g.fillStyle = '#2b2a3a'; g.fillRect(sx, sy, sw, 1.9 * k - 16);
    e.fillStyle = '#ffcf85'; e.fillRect(sx, sy, sw, 1.9 * k - 16);
    g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(sx + 6, sy + 6, sw * .3, 1.9 * k * .5);
    g.fillStyle = sp.shopFrame || '#3d2a22'; for (let j = 1; j < 3; j++) g.fillRect(sx + sw * j / 3 - 2, sy, 4, 1.9 * k - 16);
    const dx = W * .72; g.fillStyle = sp.shopFrame || '#3d2a22'; g.fillRect(dx - 5, dy - 5, dw + 10, dh + 5);
    g.fillStyle = '#2b2a3a'; g.fillRect(dx, dy, dw, dh); e.fillStyle = '#ffcf85'; e.fillRect(dx + 6, dy + 6, dw - 12, dh * .55);
    g.fillStyle = '#d9b46a'; g.fillRect(dx + dw - 12, dy + dh * .55, 5, 5);
  } else {
    const dx = W / 2 - dw / 2; g.fillStyle = trim; g.fillRect(dx - 6, dy - 6, dw + 12, dh + 6);
    g.fillStyle = sp.door || '#6b3f2a'; g.fillRect(dx, dy, dw, dh); g.beginPath(); g.ellipse(W / 2, dy, dw / 2, dw * .32, 0, Math.PI, 0); g.fill();
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(W / 2 - 1, dy, 2, dh);
    e.fillStyle = '#ffcf85'; e.beginPath(); e.ellipse(W / 2, dy, dw / 2 - 6, dw * .25, 0, Math.PI, 0); e.fill();
    [W * .18, W * .82].forEach(cx => { const x = cx - ww / 2, y = Hh - 1.45 * k; g.fillStyle = trim; g.fillRect(x - 4, y - 4, ww + 8, .9 * k + 8); g.fillStyle = '#2c3550'; g.fillRect(x, y, ww, .9 * k); g.fillStyle = trim; g.fillRect(cx - 2, y, 4, .9 * k); if (Math.random() < .5) { e.fillStyle = '#ffd08a'; e.fillRect(x, y, ww, .9 * k); e.fillStyle = '#000'; e.fillRect(cx - 2, y, 4, .9 * k); } });
  }
  if (sp.portal) { const px = W / 2 - 1.1 * k, pw = 2.2 * k; g.fillStyle = shade(sp.color, -.25); g.fillRect(px - 8, Hh - 2.1 * k, pw + 16, 2.1 * k); g.beginPath(); g.ellipse(W / 2, Hh - 2.1 * k, pw / 2 + 8, pw * .45, 0, Math.PI, 0); g.fill(); g.fillStyle = '#4a2c1e'; g.fillRect(px, Hh - 2.0 * k, pw, 2.0 * k); g.beginPath(); g.ellipse(W / 2, Hh - 2.0 * k, pw / 2, pw * .4, 0, Math.PI, 0); g.fill(); e.fillStyle = '#ffbf6a'; e.beginPath(); e.ellipse(W / 2, Hh - 2.0 * k, pw / 2 - 8, pw * .32, 0, Math.PI, 0); e.fill(); }
  const t1 = new THREE.CanvasTexture(map), t2 = new THREE.CanvasTexture(emi); t1.encoding = t2.encoding = THREE.sRGBEncoding; t1.anisotropy = t2.anisotropy = 8;
  return { map: t1, emi: t2 };
}
const tileT = tex(128, 128, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) for (let x = (y / 16 % 2) * 8; x < w + 16; x += 16) { g.fillStyle = 'rgba(0,0,0,.16)'; g.beginPath(); g.arc(x, y + 16, 8, Math.PI, 0); g.lineTo(x + 8, y + 16); g.fill(); g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = 1.5; g.stroke(); } }, [3, 3]);
function signTex(text, bg, fg) { return tex(512, 96, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = fg; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = fg; let fs = 58; g.font = '800 ' + fs + 'px "Baloo 2",Nunito,sans-serif'; while (g.measureText(text).width > w - 50 && fs > 20) { fs -= 2; g.font = '800 ' + fs + 'px "Baloo 2",Nunito,sans-serif'; } g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 3); }); }
function stripeTex(a, b) { return tex(128, 32, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(i * 16, 0, 16, h); } }); }

function gableShape(type, w, rh) {
  const s = new THREE.Shape(), hw = w / 2;
  s.moveTo(-hw, 0); s.lineTo(hw, 0);
  if (type === 'step') { const st = [[hw, .55], [hw * .62, .55], [hw * .62, 1.1], [hw * .3, 1.1], [hw * .3, 1.65], [-hw * .3, 1.65], [-hw * .3, 1.1], [-hw * .62, 1.1], [-hw * .62, .55], [-hw, .55]]; st.forEach(p => s.lineTo(p[0], p[1])); }
  else if (type === 'curve') { s.lineTo(hw, .25); s.quadraticCurveTo(hw * .25, .35, hw * .32, 1.15); s.lineTo(hw * .22, 1.75); s.quadraticCurveTo(0, 2.25, -hw * .22, 1.75); s.lineTo(-hw * .32, 1.15); s.quadraticCurveTo(-hw * .25, .35, -hw, .25); }
  else { s.lineTo(0, rh + .25); }
  s.lineTo(-hw, 0); return s;
}
function building(sp, ang, rad) {
  const g = item(sp.id); const d = 3.4;
  g.position.set(Math.sin(ang) * rad, 0, Math.cos(ang) * rad); g.rotation.y = ang + Math.PI;
  const fa = facade(sp), wall = M(sp.color), front = M('#ffffff', { map: fa.map, emissive: '#ffffff', emissiveMap: fa.emi, emissiveIntensity: 0 });
  winMats.push(front);
  const body = mk(box(sp.w, sp.h, d), [wall, wall, wall, wall, front, front], 0, sp.h / 2, 0, g);
  const trim = M(sp.trim || '#f7f1e6');
  mk(box(sp.w + .22, .2, d + .2), trim, 0, sp.h + .1, 0, g);
  const rh = sp.flat ? 1.2 : 1.7, roofM = M(sp.roof || '#b5523b', { map: tileT, roughness: .8 });
  const hw = sp.w / 2 + .2, a = Math.atan2(rh, hw), L = Math.hypot(hw, rh);
  if (sp.flat) { mk(box(sp.w + .1, .55, .3), trim, 0, sp.h + .45, d / 2 - .15, g); const r = mk(box(sp.w, .12, d - .6), roofM, 0, sp.h + .9, -.3, g); r.rotation.x = -.18; }
  else {
    [-1, 1].forEach(sg => { const r = mk(box(L, .14, d + .3), roofM, sg * hw / 2, sp.h + .2 + rh / 2, 0, g); r.rotation.z = -sg * a; });
    const gs = gableShape(sp.gable, sp.w, rh), gm = mk(new THREE.ExtrudeGeometry(gs, { depth: .3, bevelEnabled: false }), M(sp.color), 0, sp.h + .2, d / 2 - .3, g);
    const back = mk(new THREE.ExtrudeGeometry(gableShape('tri', sp.w, rh - .25), { depth: .2, bevelEnabled: false }), wall, 0, sp.h + .2, -d / 2, g);
    const ocu = mk(new THREE.CircleGeometry(.26, 20), M('#2c3550', { emissive: '#ffcf85', emissiveIntensity: 0 }), 0, sp.h + .2 + .75, d / 2 + .01, g); winMats.push(ocu.material);
    const ring = mk(new THREE.TorusGeometry(.28, .05, 6, 20), trim, 0, sp.h + .2 + .75, d / 2 + .02, g);
    if (sp.gable !== 'tri') mk(new THREE.SphereGeometry(.13, 10, 8), M('#e8c35a', { metalness: .6, roughness: .35 }), 0, sp.h + .2 + (sp.gable === 'step' ? 1.75 : 2.3), d / 2 - .15, g);
  }
  if (sp.shop) {
    const sw = Math.min(sp.w * .72, 3.6);
    const sign = mk(box(sw, .42, .08), [trim, trim, trim, trim, M('#ffffff', { map: signTex(H.signs[sp.id] || '', sp.signBg || '#2a2233', sp.signFg || '#ffd98a'), emissive: '#ffffff', emissiveIntensity: 0 }), trim], 0, 2.28, d / 2 + .06, g);
    winMats.push(sign.material[4]);
    const stT = stripeTex(sp.awning[0], sp.awning[1]); stT.wrapS = THREE.RepeatWrapping; stT.repeat.set(sp.w / 1.2, 1);
    const aw = mk(box(sp.w * .82, .05, 1.1), M('#ffffff', { map: stT }), -sp.w * .08, 1.78, d / 2 + .5, g); aw.rotation.x = .42;
    mk(box(sp.w * .82, .24, .03), M('#ffffff', { map: stT }), -sp.w * .08, 1.78 - .55 * Math.sin(.42) - .1, d / 2 + .5 + .55 * Math.cos(.42), g);
  }
  mk(box(1.3, .12, .5), M('#cdbfa8'), sp.shop ? sp.w * .72 - sp.w / 2 + .48 : 0, .06, d / 2 + .25, g);
  return g;
}

/* ---------- les maisons du rynek ---------- */
const B = [
  { id: 'house', w: 5.0, h: 5.6, color: '#7fb4d6', roof: '#a9533e', gable: 'tri', shutters: '#2f5f7a', flowers: true },
  { id: 'bookshop', w: 5.2, h: 6.3, color: '#5f9f8a', roof: '#7a4a3a', gable: 'step', shop: true, awning: ['#1f4f44', '#f2e8d4'], signBg: '#1f3f36', signFg: '#f6e7c8', arch: true },
  { id: 'cafe', w: 5.0, h: 5.8, color: '#b996cf', roof: '#5a4a6e', gable: 'curve', shop: true, awning: ['#7a4a9a', '#fff3e2'], signBg: '#4a2f5e', signFg: '#ffe2a8', flowers: true },
  { id: 'bakeryShop', w: 5.4, h: 6.0, color: '#ec9a5b', roof: '#9c4632', gable: 'step', shop: true, awning: ['#d23c4f', '#fff3e2'], signBg: '#7a2a1e', signFg: '#ffe08a', shutters: '#7a3a22' },
  { id: 'townhall', w: 6.4, h: 6.6, color: '#efe2c8', roof: '#56607a', flat: true, portal: true, arch: true, trim: '#fffaf0' },
  { id: 'pharmacy', w: 5.0, h: 5.9, color: '#a8d8c0', roof: '#4f6a7a', gable: 'tri', shop: true, awning: ['#2f8f5f', '#f5fff8'], signBg: '#1f6b46', signFg: '#ffffff' },
  { id: 'post', w: 5.4, h: 6.2, color: '#f2cf5c', roof: '#5a5a6a', flat: true, shop: true, awning: ['#1f4f9a', '#fff7dc'], signBg: '#1f3f7a', signFg: '#ffd35a', arch: true },
  { id: 'florist', w: 4.8, h: 5.5, color: '#f2a7b6', roof: '#a9533e', gable: 'curve', shop: true, awning: ['#d95c7a', '#fff3f5'], signBg: '#8a2f4a', signFg: '#fff0f3', flowers: true },
  { id: 'house', w: 5.0, h: 6.1, color: '#b5c48a', roof: '#7a4a3a', gable: 'step', shutters: '#5a6a2f', flowers: true }
];
const RAD = 11.6, span = 250 * Math.PI / 180, a0 = G + Math.PI - span / 2;
const bld = {};
B.forEach((sp, i) => { const ang = a0 + span * i / (B.length - 1); bld[sp.id + i] = building(sp, ang, RAD + (sp.id === 'townhall' ? .3 : 0)); if (sp.id === 'bakeryShop') bld.bakery = { g: bld[sp.id + i], ang }; if (sp.id === 'townhall') bld.hall = { g: bld[sp.id + i], sp }; });

/* beffroi avec horloge qui donne l'heure */
const hall = bld.hall.g, hs = bld.hall.sp, tw = 2.6, th = 4.6, ty = hs.h + .2;
const towerT = tex(128, 256, (g, w, h) => { g.fillStyle = '#efe2c8'; g.fillRect(0, 0, w, h); g.fillStyle = '#fffaf0'; g.fillRect(0, h * .42, w, 6); g.fillStyle = '#2c3550'; g.beginPath(); g.ellipse(w / 2, h * .2, 22, 20, 0, Math.PI, 0); g.fill(); g.fillRect(w / 2 - 22, h * .2, 44, 40); g.strokeStyle = '#fffaf0'; g.lineWidth = 5; g.strokeRect(w / 2 - 22, h * .2, 44, 40); });
const towerM = M('#ffffff', { map: towerT });
mk(box(tw, th, tw), towerM, 0, ty + th / 2, -.4, hall);
mk(box(tw + .3, .25, tw + .3), M('#fffaf0'), 0, ty + th, -.4, hall);
const spire = mk(new THREE.ConeGeometry(tw * .78, 3.8, 4), F('#5f9483', { roughness: .5, metalness: .25 }), 0, ty + th + 1.9, -.4, hall); spire.rotation.y = Math.PI / 4;
mk(new THREE.SphereGeometry(.22, 12, 10), M('#e8c35a', { metalness: .7, roughness: .3 }), 0, ty + th + 3.9, -.4, hall);
const clockFaceT = tex(256, 256, (g, w) => { g.fillStyle = '#fffaf0'; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 4, 0, TAU); g.fill(); g.strokeStyle = '#2a2233'; g.lineWidth = 10; g.stroke(); g.fillStyle = '#2a2233'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.beginPath(); g.arc(w / 2 + Math.sin(a) * 96, w / 2 - Math.cos(a) * 96, i % 3 ? 5 : 9, 0, TAU); g.fill(); } });
const hands = [];
const clock = item('clock', hall);
[[0, 0], [Math.PI / 2, 1], [-Math.PI / 2, 1]].forEach(([ry]) => {
  const f = new THREE.Group(); f.rotation.y = ry; f.position.set(0, ty + th * .62, -.4); clock.add(f);
  mk(new THREE.CircleGeometry(.85, 32), M('#ffffff', { map: clockFaceT, emissive: '#fff4d6', emissiveIntensity: 0 }), 0, 0, tw / 2 + .02, f); clockMats.push(f.children[0].material);
  const hh = new THREE.Group(), mh = new THREE.Group(); hh.position.z = mh.position.z = tw / 2 + .05; f.add(hh, mh);
  mk(box(.09, .45, .03), M('#2a2233'), 0, .2, 0, hh); mk(box(.06, .68, .03), M('#2a2233'), 0, .32, .02, mh);
  hands.push([hh, mh]);
});

/* ---------- fontaine, bancs, réverbères ---------- */
const stone = M('#d6cbb8', { roughness: .9 });
const fountain = item('fountain');
mk(cyl(1.85, 1.95, .55, 40), stone, 0, .275, 0, fountain);
const water = mk(cyl(1.62, 1.62, .06, 40), M('#5fb0cf', { roughness: .1, metalness: .1, emissive: '#1f5f7a', emissiveIntensity: .25, transparent: true, opacity: .9 }), 0, .48, 0, fountain);
mk(cyl(.22, .32, 1.4, 16), stone, 0, .9, 0, fountain);
mk(cyl(.85, .35, .3, 24), stone, 0, 1.6, 0, fountain);
mk(cyl(.75, .75, .04, 24), water.material, 0, 1.72, 0, fountain);
mk(new THREE.SphereGeometry(.18, 12, 10), M('#e8c35a', { metalness: .6, roughness: .3 }), 0, 1.95, 0, fountain);
const streams = [];
for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; const s = mk(cyl(.03, .05, 1.2, 6), M('#bfe8f7', { transparent: true, opacity: .55, emissive: '#bfe8f7', emissiveIntensity: .2 }), Math.sin(a) * .62, 1.1, Math.cos(a) * .62, fountain); s.rotation.set(Math.cos(a) * .35, 0, -Math.sin(a) * .35); streams.push(s); }
const colliders = [{ x: 0, z: 0, r: 2.3 }];
const wood = M('#9a6a3e'), iron = M('#2f3a3a', { metalness: .4, roughness: .5 });
[0, 1, 2, 3].forEach(i => {
  const a = G + Math.PI / 4 + i * Math.PI / 2, b = item('bench'); b.position.set(Math.sin(a) * 3.4, 0, Math.cos(a) * 3.4); b.rotation.y = a;
  for (let s = 0; s < 3; s++) mk(box(1.7, .06, .14), wood, 0, .48, -.16 + s * .17, b);
  for (let s = 0; s < 2; s++) mk(box(1.7, .12, .05), wood, 0, .72 + s * .17, .28, b).rotation.x = -.2;
  [-.72, .72].forEach(x => { mk(box(.07, .48, .5), iron, x, .24, 0, b); mk(box(.07, .5, .07), iron, x, .72, .28, b); });
  colliders.push({ x: b.position.x, z: b.position.z, r: .9 });
});
function lamp(x, z, light) {
  const l = item('streetlamp'); l.position.set(x, 0, z);
  mk(cyl(.07, .1, 3.1, 8), M('#2f4a3f', { metalness: .3, roughness: .5 }), 0, 1.55, 0, l);
  mk(cyl(.18, .22, .2, 8), M('#2f4a3f'), 0, .1, 0, l);
  const gm = M('#fff3d0', { emissive: '#ffcf7a', emissiveIntensity: 0 }); lampMats.push(gm);
  mk(box(.32, .42, .32), gm, 0, 3.3, 0, l);
  mk(new THREE.ConeGeometry(.3, .28, 4), M('#2f4a3f'), 0, 3.65, 0, l).rotation.y = Math.PI / 4;
  const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); h.scale.set(1.9, 1.9, 1); h.position.set(0, 3.3, 0); l.add(h); halos.push(h);
  if (light) { const p = new THREE.PointLight('#ffc77a', 0, 9, 2); p.position.set(x, 3.2, z); scene.add(p); lampLights.push(p); }
  colliders.push({ x, z, r: .35 });
  return l;
}
for (let i = 0; i < 6; i++) { const a = G + .5 + i * (TAU - 1) / 5; lamp(Math.sin(a) * 8.7, Math.cos(a) * 8.7, i % 2 === 0); }

/* vélo appuyé près de la boulangerie */
{
  const ba = bld.bakery.ang + .19, bike = item('bicycle'); bike.position.set(Math.sin(ba) * 9.1, 0, Math.cos(ba) * 9.1); bike.rotation.y = ba + Math.PI / 2;
  const red = M('#d23c3c', { metalness: .3, roughness: .4 }), tyre = M('#222');
  [-.55, .55].forEach(x => { mk(new THREE.TorusGeometry(.34, .035, 8, 24), tyre, x, .36, 0, bike); });
  const bar = (x1, y1, x2, y2) => { const m = mk(cyl(.025, .025, Math.hypot(x2 - x1, y2 - y1), 6), red, (x1 + x2) / 2, (y1 + y2) / 2, 0, bike); m.rotation.z = Math.atan2(x1 - x2, y2 - y1); };
  bar(-.55, .36, -.05, .36); bar(-.05, .36, .35, .82); bar(-.55, .36, -.15, .8); bar(-.15, .8, .38, .82); bar(.55, .36, .38, .82); bar(-.05, .36, -.15, .8);
  mk(box(.22, .05, .1), M('#3a2a22'), -.17, .85, 0, bike); mk(box(.06, .05, .45), M('#3a2a22'), .38, .9, 0, bike);
  mk(box(.32, .18, .22), M('#a8763e'), .62, .78, 0, bike);
  colliders.push({ x: bike.position.x, z: bike.position.z, r: .7 });
}
/* boîte aux lettres devant la poste */
B.forEach((sp, i) => { if (sp.id !== 'post') return; const ang = a0 + span * i / (B.length - 1) - .2, pb = item('postbox'); pb.position.set(Math.sin(ang) * 9.3, 0, Math.cos(ang) * 9.3); pb.rotation.y = ang + Math.PI; mk(cyl(.28, .28, 1.1, 16), M('#d23c3c', { roughness: .5 }), 0, .55, 0, pb); mk(new THREE.SphereGeometry(.28, 16, 8, 0, TAU, 0, Math.PI / 2), M('#d23c3c', { roughness: .5 }), 0, 1.1, 0, pb); mk(box(.3, .05, .05), M('#2a2233'), 0, .85, .27, pb); colliders.push({ x: pb.position.x, z: pb.position.z, r: .5 }); });
/* tables du café, seaux du fleuriste */
B.forEach((sp, i) => {
  const ang = a0 + span * i / (B.length - 1);
  if (sp.id === 'cafe') [-.18, .18].forEach(o => { const a = ang + o, x = Math.sin(a) * 8.7, z = Math.cos(a) * 8.7, t = new THREE.Group(); t.position.set(x, 0, z); scene.add(t); mk(cyl(.4, .4, .05, 20), M('#fffaf0'), 0, .75, 0, t); mk(cyl(.04, .04, .75, 8), iron, 0, .375, 0, t); [-.6, .6].forEach(cx => { mk(cyl(.2, .2, .05, 12), M('#7a4a9a'), cx, .45, 0, t); mk(cyl(.03, .03, .45, 6), iron, cx, .22, 0, t); }); colliders.push({ x, z, r: 1 }); });
  if (sp.id === 'florist') for (let j = 0; j < 4; j++) { const a = ang - .12 + j * .08, x = Math.sin(a) * 9.4, z = Math.cos(a) * 9.4; mk(cyl(.2, .16, .35, 12), M('#6f8fa8', { metalness: .5, roughness: .4 }), x, .18, z); for (let f = 0; f < 6; f++) mk(ico(.08), F(['#ff5a7a', '#ffd35a', '#ff9db4', '#fff6e0'][j]), x + rnd(-.12, .12), .45 + rnd(0, .15), z + rnd(-.12, .12)); }
});

/* ---------- étals du marché ---------- */
function stall(a, r, cols, fruit) {
  const s = item('stall'); s.position.set(Math.sin(a) * r, 0, Math.cos(a) * r); s.rotation.y = a + Math.PI;
  mk(box(2.2, .9, .9), wood, 0, .45, 0, s);
  [[-1.05, -.4], [1.05, -.4], [-1.05, .4], [1.05, .4]].forEach(([x, z]) => mk(cyl(.04, .04, 2.3, 6), wood, x, 1.15, z, s));
  const st = stripeTex(cols[0], cols[1]); st.wrapS = THREE.RepeatWrapping; st.repeat.set(2, 1);
  [-1, 1].forEach(sg => { const c = mk(box(2.4, .04, .75), M('#ffffff', { map: st }), 0, 2.38, sg * .32, s); c.rotation.x = sg * .35; });
  const ap = item('apple', s);
  for (let c = 0; c < 3; c++) { mk(box(.6, .2, .5), M('#b98a52'), -.7 + c * .7, 1.0, 0, ap); for (let f = 0; f < 7; f++) mk(new THREE.SphereGeometry(.075, 10, 8), M(fruit[c], { roughness: .45 }), -.7 + c * .7 + rnd(-.2, .2), 1.15, rnd(-.16, .16), ap); }
  colliders.push({ x: s.position.x, z: s.position.z, r: 1.4 });
}
stall(G - .55, 5.6, ['#2f8f5f', '#fff7dc'], ['#d82e2e', '#ff9a2e', '#9cc84a']);
stall(G + .55, 5.6, ['#d9822b', '#fff7dc'], ['#e84a3a', '#f2d24a', '#7a2a5a']);

/* ---------- arbres d'automne ---------- */
const leafCols = ['#e8893a', '#f2b33a', '#c9562e', '#8fb05a', '#d97a2e'];
function tree(x, z, s, id) {
  const t = item(id || 'tree'); t.position.set(x, 0, z); t.scale.setScalar(s);
  mk(cyl(.12, .18, 1.6, 7), F('#6b4430'), 0, .8, 0, t);
  const c = leafCols[(Math.random() * leafCols.length) | 0];
  [[0, 2.1, 0, .95], [.45, 1.7, .2, .7], [-.4, 1.8, -.2, .72], [.1, 2.6, -.1, .6]].forEach(([a, b, cc, r]) => mk(jitter(ico(r, 1), .08), F(shade(c, rnd(-.06, .06))), a, b, cc, t));
  colliders.push({ x, z, r: .55 * s });
}
[[11.2, 2.4], [11.6, -2.5], [13.2, 3.4], [13.0, -3.6], [12.2, 4.7], [12.4, -4.8], [14.0, 2.2], [14.1, -2.3]].forEach(([r, s]) => tree(Math.sin(G) * r + Math.cos(G) * s, Math.cos(G) * r - Math.sin(G) * s, rnd(.9, 1.25)));
[G + 1.3, G - 1.3].forEach(a => tree(Math.sin(a) * 7.2, Math.cos(a) * 7.2, .85));
for (let i = 0; i < 46; i++) { const a = G + rnd(.12, TAU - .12), r = rnd(13.5, 14.6); mk(jitter(ico(rnd(.3, .55), 0), .05), F(['#6f9a4a', '#88b05a', '#a8763e'][i % 3]), Math.sin(a) * r, .2, Math.cos(a) * r); }

/* ---------- pigeons ---------- */
const pigeons = [];
for (let i = 0; i < 6; i++) {
  const a = rnd(0, TAU), r = rnd(2.5, 3.0), p = item('pigeon'); p.position.set(Math.sin(a) * r, 0, Math.cos(a) * r); p.rotation.y = rnd(0, TAU);
  const body = mk(new THREE.SphereGeometry(.12, 12, 10), M('#8a93a8'), 0, .14, 0, p); body.scale.set(1, .85, 1.4);
  const head = new THREE.Group(); head.position.set(0, .24, .12); p.add(head);
  mk(new THREE.SphereGeometry(.065, 10, 8), M('#6f7890'), 0, 0, 0, head); mk(new THREE.ConeGeometry(.02, .06, 6), M('#e8a03a'), 0, -.01, .07, head).rotation.x = Math.PI / 2;
  mk(new THREE.SphereGeometry(.05, 8, 6), M('#7fa88a', { metalness: .4 }), 0, .19, .07, p);
  pigeons.push({ p, head, ph: rnd(0, 10) });
}

/* ---------- passants ---------- */
const skin = ['#f1c7a5', '#c98e6a', '#8a5a3c', '#f5d3b8'], cloth = ['#d23c4f', '#2f5f9a', '#e8b33a', '#5f9a6a', '#7a4a9a', '#e8763a'];
const walkers = [];
for (let i = 0; i < 6; i++) {
  const w = new THREE.Group(); scene.add(w);
  const legs = []; [-.08, .08].forEach(x => { const lg = new THREE.Group(); lg.position.set(x, .62, 0); w.add(lg); mk(cyl(.055, .05, .6, 6), M('#2a2a3a'), 0, -.3, 0, lg); legs.push(lg); });
  const c = cloth[i % cloth.length];
  mk(cyl(.17, .22, .62, 10), M(c), 0, .95, 0, w);
  mk(new THREE.SphereGeometry(.15, 14, 12), M(skin[i % 4]), 0, 1.42, 0, w);
  mk(new THREE.SphereGeometry(.155, 14, 8, 0, TAU, 0, Math.PI / 2), M(['#3a2418', '#e8c070', '#1a1a1a', '#8a3a1e'][i % 4]), 0, 1.45, -.01, w);
  if (i % 3 === 0) mk(box(.22, .26, .1), M('#a8763e'), .2, .9, 0, w);
  walkers.push({ w, legs, r: rnd(6.6, 8.0), a: rnd(0, TAU), sp: rnd(.05, .09) * (i % 2 ? 1 : -1), pause: 0 });
}

/* ---------- nuages et petites îles au loin ---------- */
const clouds = [];
for (let i = 0; i < 6; i++) {
  const c = item('cloud'); const r = rnd(52, 72), a = rnd(0, TAU), y = rnd(8, 22); c.scale.setScalar(rnd(1.3, 1.9)); c.position.set(Math.sin(a) * r, y, Math.cos(a) * r);
  const cm = F('#ffffff', { roughness: 1 });
  for (let j = 0; j < 5; j++) mk(jitter(ico(rnd(1.2, 2.2), 1), .15), cm, rnd(-2.5, 2.5), rnd(-.4, .6), rnd(-1, 1), c);
  clouds.push({ c, r, a, y, sp: rnd(.004, .009) });
}
[[38, 2, -20], [-34, -3, -26], [-30, 5, 24]].forEach(([x, y, z], i) => {
  const isl = new THREE.Group(); isl.position.set(x, y, z); scene.add(isl);
  mk(cyl(2.4, 2.4, .4, 18), [F('#9a6a46'), F('#88b05a'), F('#7a5038')], 0, 0, 0, isl);
  mk(jitter(new THREE.ConeGeometry(2.3, 3, 12, 2), .2), F('#7d5139'), 0, -1.7, 0, isl).rotation.x = Math.PI;
  const t = new THREE.Group(); t.position.y = .2; isl.add(t); mk(cyl(.12, .16, 1.2, 6), F('#6b4430'), 0, .6, 0, t); mk(jitter(ico(.8, 1), .08), F(leafCols[i]), 0, 1.6, 0, t);
});

/* ombres */
scene.traverse(o => { if (o.isMesh && o !== sky && o.material && !o.material.transparent) { o.castShadow = true; o.receiveShadow = true; } });
pav.castShadow = false; top.castShadow = false;

/* ---------- lumière qui suit l'heure ---------- */
const KF = [
  [0, '#0b1033', '#1f2a5a', '#0e1228', '#9fb2ff', .28, '#3a4680', '#1a1630', .38, '#1a2350', 1, 1],
  [5, '#141a48', '#3d3f78', '#16163a', '#a0a8ff', .3, '#3d4680', '#1a1630', .4, '#2a2d5e', 1, .7],
  [6.5, '#4a5ea8', '#f2a37a', '#a08a9a', '#ffb48a', .8, '#a6a8d0', '#5a4038', .5, '#e8a58a', .55, .1],
  [8, '#6fa8e8', '#cfe6f5', '#9ab7c9', '#fff1d6', 1.25, '#cfe6ff', '#6b4a35', .62, '#cfe2ee', 0, 0],
  [13, '#4f92e2', '#d2eafa', '#a8c4d6', '#ffffff', 1.4, '#d6ecff', '#6b4a35', .68, '#d6ecfa', 0, 0],
  [16.5, '#6d8fd0', '#ffd7a8', '#e2c2aa', '#ffd08a', 1.2, '#d0d6f0', '#6b4a35', .6, '#f3d0aa', .15, 0],
  [18.3, '#4a5a9a', '#ff9f6a', '#c08a86', '#ff8f5a', .8, '#b0a0c8', '#5a3a3a', .5, '#eba07a', .65, .05],
  [19.6, '#252a68', '#7a5a9a', '#2a2448', '#a6aaff', .38, '#5a5a90', '#2a2030', .42, '#4a4278', 1, .5],
  [21, '#0e1438', '#26305e', '#10142e', '#9fb2ff', .3, '#3a4680', '#1a1630', .38, '#1d2654', 1, .9],
  [24, '#0b1033', '#1f2a5a', '#0e1228', '#9fb2ff', .28, '#3a4680', '#1a1630', .38, '#1a2350', 1, 1]
];
const cA = new THREE.Color(), cB = new THREE.Color();
const lerpC = (target, a, b, t) => { cA.set(a); cB.set(b); target.copy(cA.lerp(cB, t)); return target; };
let lightsOn = 0, hourNow = 12;
function applyHour(h) {
  hourNow = h; let i = 0; while (i < KF.length - 2 && KF[i + 1][0] <= h) i++;
  const a = KF[i], b = KF[i + 1], t = Math.min(1, Math.max(0, (h - a[0]) / (b[0] - a[0])));
  lerpC(skyU.top.value, a[1], b[1], t).convertSRGBToLinear(); lerpC(skyU.hor.value, a[2], b[2], t).convertSRGBToLinear(); lerpC(skyU.bot.value, a[3], b[3], t).convertSRGBToLinear();
  lerpC(sun.color, a[4], b[4], t); sun.intensity = a[5] + (b[5] - a[5]) * t;
  lerpC(hemi.color, a[6], b[6], t); lerpC(hemi.groundColor, a[7], b[7], t); hemi.intensity = a[8] + (b[8] - a[8]) * t;
  lerpC(scene.fog.color, a[9], b[9], t).convertSRGBToLinear();
  lightsOn = a[10] + (b[10] - a[10]) * t; starMat.opacity = a[11] + (b[11] - a[11]) * t;
  const day = h >= 6 && h <= 20, el = day ? Math.sin((h - 6) / 14 * Math.PI) : .55, az = (h / 24) * TAU + 1.2;
  const dir = day ? new THREE.Vector3(Math.cos(az) * Math.cos(el * 1.3), Math.max(.12, Math.sin(el * 1.25)), Math.sin(az) * Math.cos(el * 1.3)) : new THREE.Vector3(-Math.cos(az) * .6, .7, -Math.sin(az) * .6);
  dir.normalize(); skyU.sunDir.value.copy(dir); sun.position.copy(dir).multiplyScalar(45); sun.target.position.set(0, 0, 0);
  skyU.sunCol.value.copy(day ? sun.color : new THREE.Color('#dfe6ff')).convertSRGBToLinear().multiplyScalar(day ? 1 : .55);
  winMats.forEach(m => { m.emissiveIntensity = lightsOn * 1.15; }); clockMats.forEach(m => { m.emissiveIntensity = lightsOn * .28; });
  lampMats.forEach(m => { m.emissiveIntensity = .15 + lightsOn * 2.2; });
  halos.forEach(s => { s.material.opacity = lightsOn * .85; });
  lampLights.forEach(p => { p.intensity = lightsOn * 1.4; });
  R.toneMappingExposure = 1.0 + lightsOn * .15;
  const hm = h % 12, mm = (h * 60) % 60;
  hands.forEach(([hh, mh]) => { hh.rotation.z = -(hm / 12) * TAU; mh.rotation.z = -(mm / 60) * TAU; });
}
const realHour = () => { const d = new Date(); return d.getHours() + d.getMinutes() / 60; };
let hourOverride = null;
applyHour(realHour());

/* ---------- déplacement à la première personne ---------- */
const pos = new THREE.Vector3(Math.sin(G) * 9.2, 1.62, Math.cos(G) * 9.2);
let yaw = G, pitch = -.06, target = null, bob = 0;
const keys = {}, fwd = new THREE.Vector3(), right = new THREE.Vector3();
addEventListener('keydown', e => { if (!H.active() || /INPUT|SELECT|TEXTAREA/.test((e.target || {}).tagName || '')) return; keys[e.key.toLowerCase()] = true; });
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
function collide(p) {
  const dx = p.x, dz = p.z, d = Math.hypot(dx, dz);
  const ang = Math.atan2(dx, dz), onPath = Math.abs(Math.atan2(Math.sin(ang - G), Math.cos(ang - G))) < .09 || (d > 9 && Math.abs(Math.sin(ang - G) * d) < 1.1);
  const lim = onPath ? 14.2 : 9.3;
  if (d > lim) { p.x = dx / d * lim; p.z = dz / d * lim; }
  colliders.forEach(c => { const ex = p.x - c.x, ez = p.z - c.z, dd = Math.hypot(ex, ez), rr = c.r + .3; if (dd < rr && dd > 1e-4) { p.x = c.x + ex / dd * rr; p.z = c.z + ez / dd * rr; } });
}
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(), tip = $('hover');
let down = null, hov = null;
function pick(e) {
  const r = canvas.getBoundingClientRect(); ptr.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(ptr, cam);
  const hs = ray.intersectObjects(hits, true); if (!hs.length) return null;
  let o = hs[0].object; while (o && !o.userData.id) o = o.parent;
  return o ? { id: o.userData.id, point: hs[0].point, dist: hs[0].distance } : null;
}
canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, moved: 0, id: e.pointerId }; try { canvas.setPointerCapture(e.pointerId); } catch (er) { /* */ } });
canvas.addEventListener('pointermove', e => {
  if (photo) return;
  if (down && down.id === e.pointerId) {
    const dx = e.clientX - down.lx, dy = e.clientY - down.ly; down.lx = e.clientX; down.ly = e.clientY; down.moved += Math.abs(dx) + Math.abs(dy);
    if (down.moved > 6) { yaw -= dx * .0045; pitch = Math.max(-1.1, Math.min(1.0, pitch - dy * .0045)); }
    return;
  }
  if (e.pointerType !== 'mouse') return;
  const p = pick(e), id = p && p.id !== 'square' ? p.id : null;
  if (id !== hov) hov = id;
  canvas.style.cursor = id ? 'pointer' : 'grab';
  if (id) { tip.textContent = H.label(id); tip.style.left = e.clientX + 'px'; tip.style.top = e.clientY + 'px'; tip.classList.remove('hidden'); } else tip.classList.add('hidden');
});
canvas.addEventListener('pointerup', e => {
  if (photo || !down) { down = null; return; }
  const moved = down.moved; down = null; if (moved > 8) return;
  const p = pick(e); if (!p) return;
  if (p.id === 'square') { target = new THREE.Vector3(p.point.x, 1.62, p.point.z); return; }
  H.pick(p.id);
});
canvas.addEventListener('pointerleave', () => { tip.classList.add('hidden'); });

/* ---------- mode photo : vue aérienne en maquette ---------- */
let photo = false, ctl = null, composer = null, saved = null;
function makeComposer() {
  if (!THREE.EffectComposer || !THREE.HorizontalTiltShiftShader) return null;
  const c = new THREE.EffectComposer(R); c.addPass(new THREE.RenderPass(scene, cam));
  if (THREE.UnrealBloomPass) c.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), .5, .5, .8));
  const th = new THREE.ShaderPass(THREE.HorizontalTiltShiftShader); th.uniforms.h.value = 5 / innerWidth; th.uniforms.r.value = .5; c.addPass(th);
  const tv = new THREE.ShaderPass(THREE.VerticalTiltShiftShader); tv.uniforms.v.value = 5 / innerHeight; tv.uniforms.r.value = .5; c.addPass(tv);
  if (THREE.VignetteShader) { const vg = new THREE.ShaderPass(THREE.VignetteShader); vg.uniforms.offset.value = .95; vg.uniforms.darkness.value = 1.1; c.addPass(vg); }
  c.addPass(new THREE.ShaderPass(THREE.GammaCorrectionShader));
  return c;
}
function setPhoto(on) {
  if (on === photo) return; photo = on; tip.classList.add('hidden');
  if (on) {
    saved = { pos: pos.clone(), yaw, pitch, fov: cam.fov };
    cam.fov = 34; cam.updateProjectionMatrix();
    cam.position.set(Math.sin(G + .35) * 38, 24, Math.cos(G + .35) * 38);
    if (!ctl) { ctl = new THREE.OrbitControls(cam, canvas); ctl.enablePan = false; ctl.enableDamping = true; ctl.minDistance = 22; ctl.maxDistance = 70; ctl.maxPolarAngle = 1.35; ctl.minPolarAngle = .35; }
    ctl.target.set(0, 2, 0); ctl.enabled = true; ctl.autoRotate = true; ctl.autoRotateSpeed = .5; ctl.update();
    canvas.addEventListener('pointerdown', stopAuto, { once: true });
    if (!composer) composer = makeComposer();
  } else {
    if (ctl) ctl.enabled = false;
    pos.copy(saved.pos); yaw = saved.yaw; pitch = saved.pitch; cam.fov = saved.fov; cam.updateProjectionMatrix();
    hourOverride = null; applyHour(realHour());
  }
}
function stopAuto() { if (ctl) ctl.autoRotate = false; }
function snapshot() {
  if (composer) composer.render(); else R.render(scene, cam);
  const src = R.domElement, out = document.createElement('canvas'); out.width = src.width; out.height = src.height;
  const g = out.getContext('2d'); g.drawImage(src, 0, 0);
  const s = out.width / 1200; g.font = '800 ' + Math.round(34 * s) + 'px "Baloo 2",Nunito,sans-serif'; g.textAlign = 'right'; g.textBaseline = 'bottom';
  g.fillStyle = 'rgba(29,33,66,.55)'; g.fillText('Petite Ville', out.width - 26 * s, out.height - 22 * s);
  g.fillStyle = '#ffb547'; g.fillText('Petite Ville', out.width - 28 * s, out.height - 24 * s);
  return out.toDataURL('image/jpeg', .92);
}

/* ---------- boucle ---------- */
addEventListener('resize', () => { cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); R.setSize(innerWidth, innerHeight); if (composer) composer.setSize(innerWidth, innerHeight); });
const clockT = new THREE.Clock(); let lastHourCheck = 0;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clockT.getDelta(), .05), t = clockT.elapsedTime;
  if (!H.active()) return;
  if (t - lastHourCheck > 5) { lastHourCheck = t; if (hourOverride == null) applyHour(realHour()); }
  /* vie de la place */
  if (!reduce) {
    walkers.forEach(k => {
      if (k.pause > 0) { k.pause -= dt; k.legs.forEach(l => { l.rotation.x = 0; }); }
      else { k.a += k.sp * dt * 2; if (Math.random() < .002) k.pause = rnd(1.5, 4); const s = Math.sin(t * 7 + k.r) * .45; k.legs[0].rotation.x = s; k.legs[1].rotation.x = -s; }
      k.w.position.set(Math.sin(k.a) * k.r, Math.abs(Math.sin(t * 7 + k.r)) * .03, Math.cos(k.a) * k.r); k.w.rotation.y = k.a + (k.sp > 0 ? Math.PI / 2 : -Math.PI / 2);
    });
    pigeons.forEach(q => { const s = Math.sin(t * 3 + q.ph); q.head.rotation.x = s > .6 ? .9 : 0; if (Math.random() < .004) { q.p.rotation.y += rnd(-1.5, 1.5); } });
    clouds.forEach(c => { c.a += c.sp * dt; c.c.position.set(Math.sin(c.a) * c.r, c.y + Math.sin(t * .2 + c.r) * .3, Math.cos(c.a) * c.r); });
    streams.forEach((s, i) => { s.scale.y = 1 + Math.sin(t * 8 + i) * .05; });
    water.material.emissiveIntensity = .22 + Math.sin(t * 2) * .05;
  }
  if (photo) { ctl.update(); if (composer) composer.render(); else R.render(scene, cam); sky.position.copy(cam.position); stars.position.copy(cam.position); return; }
  /* marche */
  fwd.set(-Math.sin(yaw), 0, -Math.cos(yaw)); right.set(Math.cos(yaw), 0, -Math.sin(yaw));
  const mv = new THREE.Vector3();
  if (keys.w || keys.z || keys.arrowup) mv.add(fwd);
  if (keys.s || keys.arrowdown) mv.sub(fwd);
  if (keys.a || keys.q) mv.sub(right);
  if (keys.d) mv.add(right);
  if (keys.arrowleft) yaw += 1.8 * dt;
  if (keys.arrowright) yaw -= 1.8 * dt;
  let moving = false;
  if (mv.lengthSq() > 0) { target = null; mv.normalize().multiplyScalar(3.2 * dt); pos.add(mv); moving = true; }
  else if (target) { const d = new THREE.Vector3(target.x - pos.x, 0, target.z - pos.z), L = d.length(); if (L < .12) target = null; else { pos.add(d.multiplyScalar(Math.min(1, 3.2 * dt / L))); moving = true; } }
  collide(pos);
  bob = moving ? bob + dt * 9 : bob * .9;
  cam.position.set(pos.x, pos.y + Math.sin(bob) * .035, pos.z);
  cam.rotation.set(pitch, yaw, 0, 'YXZ');
  sky.position.copy(cam.position); stars.position.copy(cam.position);
  R.render(scene, cam);
}
loop();

/* sortir de la boulangerie : devant sa porte, face à la place */
function placeAtBakery() { const a = bld.bakery.ang; pos.set(Math.sin(a) * 8.0, 1.62, Math.cos(a) * 8.0); yaw = a; pitch = -.05; target = null; }

return {
  setPhoto, snapshot, placeAtBakery,
  setHour: h => { hourOverride = h; applyHour(h == null ? realHour() : h); },
  hour: () => hourNow,
  resize: () => { cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); R.setSize(innerWidth, innerHeight); }
};
};
