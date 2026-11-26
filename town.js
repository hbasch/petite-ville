/* La place de Petite Ville, en pâte à modeler, visitée à la première personne.
   Tout est modelé ici dans le code (aucun modèle externe) : formes arrondies et un peu bosselées, traces de doigts,
   pavés posés un à un, enseignes en pictogrammes pour que la ville soit la même dans toutes les langues. */
window.buildTown = function (H) {
const $ = id => document.getElementById(id);
const canvas = $('ct');
const mobile = Math.min(innerWidth, innerHeight) < 700;
const R = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
R.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.5)); R.setSize(innerWidth, innerHeight);
R.outputEncoding = THREE.sRGBEncoding; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = .9;
R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
/* plan proche à 0,2 : le tampon de profondeur intermédiaire n'a que 16 bits, il faut le ménager */
const cam = new THREE.PerspectiveCamera(mobile ? 70 : 62, innerWidth / innerHeight, .2, 420);
const rnd = (a, b) => a + Math.random() * (b - a);
const TAU = Math.PI * 2;
const SEG = mobile ? 4 : 6;

/* ---------- palettes (choisies avec Claude Design) ---------- */
const PALS = {
  a: { walls: ['#d9774b', '#e3a84a', '#9db58a', '#efe3cf', '#d99b8c'], roofs: ['#a8492f', '#5b6577'], ground: '#e6cfa8', leaf: '#7a9a4a', accent: '#2f6f6b' },
  b: { walls: ['#d9a62e', '#8f3b3b', '#3f6b5a', '#9fb6c4', '#efe6d6'], roofs: ['#3a3f4a', '#6b4a3a'], ground: '#cfc6b8', leaf: '#4a7a4a', accent: '#c27a3e' },
  c: { walls: ['#f28c28', '#f2d03b', '#2f5fb3', '#8fd3b6', '#f6efe2'], roofs: ['#23305a', '#c4473a'], ground: '#d8cfc2', leaf: '#5fae4a', accent: '#e84a7a' },
  d: { walls: ['#f0a77a', '#b8cf8f', '#b7a3d6', '#f2d68a', '#eaa3a8'], roofs: ['#7a4a3a', '#6a4a6a'], ground: '#efe0c8', leaf: '#86b86a', accent: '#4a2f2a' }
};
/* ---------- pays : la ville dépend de la langue apprise (anglais → Édimbourg, polonais → Wrocław) ---------- */
const COUNTRY = ['fr', 'gb', 'pl'].includes(H.country) ? H.country : 'fr';
const CITY_PALS = {
  gb: { walls: ['#cdbfa6', '#b3a99a', '#e9dfcc', '#c98a64', '#a9b6bc'], roofs: ['#4a505c', '#5e5550'], ground: '#9d978e', leaf: '#5f8a4a', accent: '#2f4f8a' },
  pl: { walls: ['#f0b8a8', '#a8d4b8', '#f2d27c', '#9cc4e0', '#e8a8c8'], roofs: ['#b5452f', '#8a3a2a'], ground: '#c2b29c', leaf: '#6a9a4a', accent: '#a8323c' }
};
const PAL = CITY_PALS[COUNTRY] || ((window.PV && PV.PALS) || PALS)[H.palette] || PALS.a;
const SCN = (window.PV && PV.SCENE) || {};
const CITY = {
  fr: { signs: { bakeryShop: 'BOULANGERIE', cafe: 'CAFÉ ROSIE', pharmacy: 'PHARMACIE', post: 'POSTE', bookshop: 'LIBRAIRIE', florist: 'FLEURISTE', townhall: 'MAIRIE' }, sign: { fg: '#fff8ee', font: '"Baloo 2",Nunito,sans-serif' }, bunting: null, postbox: '#f2c200', tower: null },
  gb: { signs: (SCN.en || {}).signs, sign: { fg: '#f2d27a', font: 'Georgia,"Times New Roman",serif', border: '#e8c35a' }, bunting: ['#2f5fa8', '#fff8ee', '#2f5fa8', '#e8c35a'], postbox: '#c8202a', tower: '#bfae90' },
  pl: { signs: (SCN.pl || {}).signs, sign: { bg: '#f6ecd8', fg: '#5a1e22', font: 'Georgia,"Times New Roman",serif', border: '#8a3a2a' }, bunting: ['#fff8ee', '#d8323c'], postbox: '#d8323c', tower: '#a8553f' }
}[COUNTRY];
const TRIM = '#fff4e2', GLASS = '#2f3550', EARTH = '#9a6a46';

/* ---------- outils ---------- */
function tex(w, h, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; }
function shade(hex, k) { const c = new THREE.Color(hex); const hsl = {}; c.getHSL(hsl); c.setHSL(hsl.h, hsl.s, Math.min(1, Math.max(0, hsl.l + k))); return '#' + c.getHexString(); }
const matCache = {};
function C(color, o) {
  const opts = Object.assign({}, o || {}), uniq = opts.unique; delete opts.unique;
  const key = color + JSON.stringify(opts);
  if (!uniq && matCache[key]) return matCache[key];
  const amt = opts.bumpScale === 0 ? 0 : (opts.bumpScale ? opts.bumpScale * 1.9 : .04); delete opts.bumpScale;
  const m = PVClay.apply(new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .5 }, opts)), amt);
  if (uniq) m.userData.unique = true; else matCache[key] = m; return m;
}
function rbox(w, h, d, r, seg) {
  seg = seg || SEG; r = Math.min(r, w / 2 - .001, h / 2 - .001, d / 2 - .001);
  const g = new THREE.BoxGeometry(w, h, d, seg, seg, seg); if (r <= 0) return g;
  const p = g.attributes.position, v = new THREE.Vector3(), inn = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); inn.set(Math.max(-w / 2 + r, Math.min(w / 2 - r, v.x)), Math.max(-h / 2 + r, Math.min(h / 2 - r, v.y)), Math.max(-d / 2 + r, Math.min(d / 2 - r, v.z))); const dir = v.clone().sub(inn); if (dir.lengthSq() > 0) { dir.normalize().multiplyScalar(r); v.copy(inn).add(dir); } p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals(); return g;
}
function lump(g, a, f) { f = f || 1.3; const p = g.attributes.position; const s = rnd(0, 10); for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = Math.sin(x * 2.1 * f + s) * Math.cos(z * 1.7 * f + y * 1.3 * f + s) + Math.sin(y * 2.7 * f + s) * .5; p.setXYZ(i, x + n * a, y + n * a * .5, z + n * a); } g.computeVertexNormals(); return g; }
const geoCache = {};
function G_(key, fn) { return geoCache[key] || (geoCache[key] = fn()); }
const DET = mobile ? .7 : 1, seg_ = s => Math.max(6, Math.round((s || 18) * DET));
const sph = (r, s) => new THREE.SphereGeometry(r, seg_(s), Math.max(6, Math.round(seg_(s) * .7)));
const cyl = (a, b, h, s) => new THREE.CylinderGeometry(a, b, h, seg_(s));
function mk(geo, mat, x, y, z, p) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); (p || scene).add(m); return m; }
const hits = [];
function item(id, parent) { const g = new THREE.Group(); g.userData.id = id; hits.push(g); (parent || scene).add(g); return g; }
const blobT = tex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(30,20,30,.55)'); gr.addColorStop(.6, 'rgba(30,20,30,.25)'); gr.addColorStop(1, 'rgba(30,20,30,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
const BLOB = new THREE.MeshBasicMaterial({ map: blobT, transparent: true, depthWrite: false });
function blob(x, z, r, parent, y) { const b = mk(G_('blobG', () => new THREE.CircleGeometry(1, 24)), BLOB, x, y || .025, z, parent); b.rotation.x = -Math.PI / 2; b.scale.setScalar(r); b.renderOrder = 1; return b; }
const glowT = tex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,220,150,1)'); gr.addColorStop(.35, 'rgba(255,190,110,.45)'); gr.addColorStop(1, 'rgba(255,170,90,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
const halos = [], winMats = [], lampMats = [], clockMats = [];
/* ombres douces au sol sous les objets fixes : toutes regroupées en une seule instance */
const sblobs = [];
function sblob(x, z, sx, sz, yaw) { sblobs.push([x, z, sx, sz == null ? sx : sz, yaw || 0]); }
function sblobAt(obj, lx, lz, sx, sz, yaw) { obj.updateMatrixWorld(true); const v = obj.localToWorld(new THREE.Vector3(lx, 0, lz)); sblob(v.x, v.z, sx, sz, (yaw || 0) + obj.rotation.y); }
const litGlass = C(GLASS, { unique: true, emissive: '#ffa548', emissiveIntensity: 0, roughness: .25 }); winMats.push(litGlass);
const darkGlass = C(GLASS, { roughness: .25 });
const shopGlass = C('#3a3550', { unique: true, emissive: '#ffbf6e', emissiveIntensity: 0, roughness: .25 }); winMats.push(shopGlass);

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

const GRADE = { uniforms: { tDiffuse: { value: null }, sat: { value: 1.24 }, con: { value: 1.11 }, tint: { value: new THREE.Vector3(1, 1, 1) }, vig: { value: 1.0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: 'uniform sampler2D tDiffuse; uniform float sat; uniform float con; uniform vec3 tint; uniform float vig; varying vec2 vUv;\n' +
    'void main(){ vec4 c = texture2D(tDiffuse, vUv); vec3 col = c.rgb; float l = dot(col, vec3(.2126,.7152,.0722)); col = mix(vec3(l), col, sat);\n' +
    ' col = max((col - 0.18) * con + 0.18, 0.0) * tint; vec2 d = vUv - .5; col *= mix(.8, 1.0, smoothstep(.95, .25, length(d) * vig * 1.25));\n' +
    ' gl_FragColor = LinearTosRGB(vec4(col, c.a)); }' };

/* ---------- lumières ---------- */
const hemi = new THREE.HemisphereLight('#cfe6ff', '#6b4a35', .6); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 1.2); scene.add(sun, sun.target);
sun.castShadow = true; sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -17, right: 17, top: 17, bottom: -17, near: 1, far: 90 }); sun.shadow.bias = -.0006; sun.shadow.normalBias = .03; sun.shadow.radius = 3;
const lampLights = [];
const poolM = new THREE.MeshBasicMaterial({ map: null, color: '#ffc77a', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });

/* ---------- l'île en argile ---------- */
const G = 0.7; /* direction de l'entrée */
const grass = mk(cyl(15, 15, .7, 72), [C(EARTH), C(shade(PAL.leaf, .12)), C(EARTH)], 0, -.35, 0); grass.receiveShadow = true;
mk(lump(cyl(15.1, 11.5, 2.6, 48, 6), .3), C(EARTH), 0, -1.95, 0);
mk(lump(cyl(11.5, 6, 3.2, 40, 6), .4), C(shade(EARTH, -.08)), 0, -4.8, 0);
const tipM = mk(lump(new THREE.ConeGeometry(6, 5, 32, 6), .45), C(shade(EARTH, -.15)), 0, -8.9, 0); tipM.rotation.x = Math.PI;
[[9, -3, 4], [-7, -4, 9], [3, -5.5, -10]].forEach(([x, y, z]) => mk(lump(sph(1.4, 16), .2), C(shade(EARTH, -.05)), x, y, z));
const square = item('square');
const base = mk(cyl(10.1, 10.1, .1, 72), C(shade(PAL.ground, -.3)), 0, -.03, 0, square); base.receiveShadow = true; base.userData.keep = true; base.userData.noCast = true;
/* pavés posés un à un */
{
  const cg = new THREE.SphereGeometry(1, mobile ? 7 : 9, mobile ? 3 : 4, 0, TAU, 0, Math.PI / 2); const cm = C('#ffffff', { roughness: .7 });
  const pts = []; for (let z = -9.7; z <= 9.7; z += .3) for (let x = -9.7 + ((Math.round(z / .3) % 2) ? .17 : 0); x <= 9.7; x += .34) { const d = Math.hypot(x, z); if (d < 9.65 && d > 1.95) pts.push([x + rnd(-.03, .03), z + rnd(-.03, .03)]); }
  const im = new THREE.InstancedMesh(cg, cm, pts.length), o = new THREE.Object3D(), col = new THREE.Color();
  pts.forEach(([x, z], i) => { o.position.set(x, .01, z); o.rotation.set(0, rnd(0, TAU), 0); o.scale.set(rnd(.14, .17), rnd(.03, .045), rnd(.12, .145)); o.updateMatrix(); im.setMatrixAt(i, o.matrix); col.set(shade(PAL.ground, rnd(-.16, .04))); col.offsetHSL(rnd(-.015, .015), rnd(-.04, .04), 0); im.setColorAt(i, col); });
  im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; im.receiveShadow = true; im.userData.noCast = true; square.add(im);
}
const path = mk(rbox(2.6, .1, 5.2, .05, 2), C(shade(PAL.ground, -.08)), Math.sin(G) * 12.5, -.02, Math.cos(G) * 12.5, square); path.rotation.y = G; path.receiveShadow = true;
/* touffes d'herbe et fleurs */
{
  const tg = new THREE.ConeGeometry(.07, .26, 5), tm = C(shade(PAL.leaf, .02)), N = mobile ? 260 : 480;
  const im = new THREE.InstancedMesh(tg, tm, N), o = new THREE.Object3D();
  for (let i = 0; i < N; i++) { let a = rnd(0, TAU), r = rnd(10.4, 14.7); while (Math.cos(a - G) > 0 && Math.abs(Math.sin(a - G) * r) < 1.5) a = rnd(0, TAU); o.position.set(Math.sin(a) * r, .1, Math.cos(a) * r); o.rotation.set(rnd(-.2, .2), 0, rnd(-.2, .2)); o.scale.setScalar(rnd(.7, 1.3)); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }
  scene.add(im);
  const fg = sph(.07, 8), fm = C('#ffffff'), F = 90, fim = new THREE.InstancedMesh(fg, fm, F), col = new THREE.Color(), fc = ['#fff4e2', '#ffd35a', PAL.walls[4], PAL.accent];
  for (let i = 0; i < F; i++) { let a = rnd(0, TAU), r = rnd(10.6, 14.6); while (Math.cos(a - G) > 0 && Math.abs(Math.sin(a - G) * r) < 1.5) a = rnd(0, TAU); o.position.set(Math.sin(a) * r, .16, Math.cos(a) * r); o.rotation.set(0, 0, 0); o.scale.setScalar(rnd(.8, 1.3)); o.updateMatrix(); fim.setMatrixAt(i, o.matrix); col.set(fc[i % 4]); fim.setColorAt(i, col); }
  if (fim.instanceColor) fim.instanceColor.needsUpdate = true; scene.add(fim);
}

/* ---------- au sol : marelle à la craie, plaque d'égout, herbes entre les pavés ---------- */
{
  /* craie : traits doublés et un peu tremblés, comme dessinés par un enfant */
  const T = tex(512, 768, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.lineCap = 'round'; g.lineJoin = 'round';
    const chalk = (col, lw, path) => { for (let k = 0; k < 3; k++) { g.strokeStyle = col; g.globalAlpha = .55 - k * .12; g.lineWidth = lw - k; g.beginPath(); path((Math.random() - .5) * 3, (Math.random() - .5) * 3); g.stroke(); } g.globalAlpha = 1; };
    const sq = (x, y, s2) => chalk('#fffaf0', 7, (jx, jy) => { g.rect(x + jx, y + jy, s2, s2); });
    const cx = 200, s2 = 104;
    sq(cx - s2 / 2, 640, s2); sq(cx - s2 / 2, 536, s2); sq(cx - s2, 432, s2); sq(cx, 432, s2); sq(cx - s2 / 2, 328, s2); sq(cx - s2, 224, s2); sq(cx, 224, s2);
    chalk('#fffaf0', 7, (jx, jy) => { g.moveTo(cx - s2 + jx, 224 + jy); g.arc(cx + jx, 224 + jy, s2, Math.PI, 0); });
    g.fillStyle = '#fffaf0'; g.globalAlpha = .7; g.font = '700 54px "Baloo 2",Nunito,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    [[cx, 692, '1'], [cx, 588, '2'], [cx - s2 / 2, 484, '3'], [cx + s2 / 2, 484, '4'], [cx, 380, '5'], [cx - s2 / 2, 276, '6'], [cx + s2 / 2, 276, '7'], [cx, 180, '8']].forEach(([x, y, t]) => g.fillText(t, x, y));
    g.globalAlpha = 1;
    /* un soleil et une fleur à la craie de couleur */
    chalk('#ffd35a', 6, (jx, jy) => { g.arc(410 + jx, 140 + jy, 38, 0, TAU); for (let i = 0; i < 8; i++) { const a2 = i / 8 * TAU; g.moveTo(410 + Math.cos(a2) * 52, 140 + Math.sin(a2) * 52); g.lineTo(410 + Math.cos(a2) * 76, 140 + Math.sin(a2) * 76); } });
    chalk('#ff8fb0', 6, (jx, jy) => { for (let i = 0; i < 5; i++) { const a2 = i / 5 * TAU; g.moveTo(420 + Math.cos(a2) * 26 + 18, 520 + Math.sin(a2) * 26); g.arc(420 + Math.cos(a2) * 26 + jx, 520 + Math.sin(a2) * 26 + jy, 18, 0, TAU); } });
    chalk('#9fd88a', 6, (jx, jy) => { g.moveTo(420 + jx, 546); g.lineTo(424 + jy, 650); g.moveTo(422, 600); g.quadraticCurveTo(450, 580, 462 + jx, 600); });
  });
  T.anisotropy = 8;
  const hm = new THREE.MeshStandardMaterial({ map: T, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 });
  const ha = G + Math.PI + .12, hop = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 3.0), hm);
  hop.position.set(Math.sin(ha) * 6.3, .066, Math.cos(ha) * 6.3); hop.rotation.set(-Math.PI / 2, 0, ha + Math.PI); hop.receiveShadow = true; hop.renderOrder = 1; scene.add(hop);
  /* plaque d'égout en fonte */
  const ma = G - 1.85, mx = Math.sin(ma) * 6.3, mz = Math.cos(ma) * 6.3, fonte = C('#55555f', { metalness: .45, roughness: .5 });
  mk(cyl(.44, .44, .03, 28), fonte, mx, .06, mz); mk(new THREE.TorusGeometry(.4, .025, 6, 28), C('#6a6a74', { metalness: .45, roughness: .45 }), mx, .075, mz).rotation.x = Math.PI / 2;
  for (let k = -3; k <= 3; k++) { const L2 = Math.sqrt(Math.max(0, .36 * .36 - (k * .09) * (k * .09))) * 2; if (L2 > .05) mk(rbox(L2, .015, .03, .007, 1), C('#6a6a74', { metalness: .45, roughness: .45 }), mx, .078, mz + k * .09); }
  /* herbes folles entre les pavés, le long des façades et au pied des réverbères */
  const wg = new THREE.ConeGeometry(.028, .1, 4), wm = C(shade(PAL.leaf, .05), { bumpScale: 0 }), WN = mobile ? 160 : 260, wi = new THREE.InstancedMesh(wg, wm, WN), o = new THREE.Object3D();
  for (let i = 0; i < WN; i++) {
    let x, z; if (i % 3) { const a2 = rnd(0, TAU), r = rnd(9.15, 9.6); x = Math.sin(a2) * r; z = Math.cos(a2) * r; } else { const a2 = G + .5 + ((i / 3 | 0) % 6) * (TAU - 1) / 5, r2 = rnd(.15, .35), b2 = rnd(0, TAU); x = Math.sin(a2) * 8.7 + Math.sin(b2) * r2; z = Math.cos(a2) * 8.7 + Math.cos(b2) * r2; }
    o.position.set(x, .06, z); o.rotation.set(rnd(-.35, .35), rnd(0, TAU), rnd(-.35, .35)); o.scale.setScalar(rnd(.6, 1.3)); o.updateMatrix(); wi.setMatrixAt(i, o.matrix);
  }
  wi.userData.noCast = true; scene.add(wi);
}

/* ---------- pictogrammes en pâte (enseignes universelles) ---------- */
function picto(type) {
  const g = new THREE.Group();
  if (type === 'bread') { const b = mk(sph(.22, 20), C('#c98a4a'), 0, 0, .06, g); b.scale.set(1.15, .55, .5); for (let i = -1; i <= 1; i++) { const s = mk(rbox(.05, .1, .04, .02, 2), C('#f2c98a'), i * .1, .05, .16, g); s.rotation.z = .5; } }
  if (type === 'cup') { mk(cyl(.13, .1, .2, 18), C('#fffaf0'), 0, .02, .06, g); const h = mk(new THREE.TorusGeometry(.065, .022, 8, 16), C('#fffaf0'), .15, .03, .06, g); mk(cyl(.19, .19, .03, 20), C(PAL.accent), 0, -.09, .06, g); mk(sph(.05, 8), C('#ffffff', { transparent: true, opacity: .6 }), -.02, .2, .06, g); }
  if (type === 'cross') { const m = C('#3fae5f', { unique: true, emissive: '#3fae5f', emissiveIntensity: 0 }); winMats.push(m); mk(rbox(.14, .42, .1, .04, 3), m, 0, 0, .06, g); mk(rbox(.42, .14, .1, .04, 3), m, 0, 0, .06, g); }
  if (type === 'mail') { mk(rbox(.44, .3, .06, .03, 3), C('#fffaf0'), 0, 0, .06, g); const s = new THREE.Shape(); s.moveTo(-.2, 0); s.lineTo(.2, 0); s.lineTo(0, -.15); s.lineTo(-.2, 0); const f = mk(new THREE.ExtrudeGeometry(s, { depth: .03, bevelEnabled: true, bevelSize: .01, bevelThickness: .01, bevelSegments: 2 }), C(PAL.accent), 0, .14, .09, g); }
  if (type === 'book') { [-1, 1].forEach(sg => { const p = mk(rbox(.2, .28, .04, .02, 2), C(sg < 0 ? PAL.accent : '#fffaf0'), sg * .1, 0, .06, g); p.rotation.y = -sg * .35; }); }
  if (type === 'flower') { mk(sph(.06, 10), C('#ffd35a'), 0, .06, .1, g); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; mk(sph(.07, 10), C(PAL.walls[4]), Math.cos(a) * .1, .06 + Math.sin(a) * .1, .07, g); } mk(cyl(.015, .015, .2, 6), C(PAL.leaf), 0, -.1, .06, g); }
  if (type === 'pint') { mk(cyl(.12, .1, .3, 14), C('#c8801e', { roughness: .25, emissive: '#c8801e', emissiveIntensity: .1 }), 0, -.02, .06, g); mk(cyl(.125, .125, .06, 14), C('#f6efe2'), 0, .16, .06, g); }
  if (type === 'pierogi') { [-1, 1].forEach(sg => { const pg = mk(new THREE.SphereGeometry(.13, 14, 8, 0, Math.PI), C('#f2e2c0'), sg * .1, 0, .06, g); pg.rotation.z = sg * .3; pg.scale.set(1, 1, .5); }); }
  return g;
}
function signPost(type, parent, x, y, z) {
  const s = new THREE.Group(); s.position.set(x, y, z); parent.add(s);
  mk(rbox(.08, .08, .95, .03, 2), C('#3a3a48', { metalness: .3 }), 0, .55, .42, s);
  const plate = new THREE.Group(); plate.position.set(0, 0, .72); s.add(plate);
  const disc = mk(cyl(.42, .42, .12, 28), C(TRIM), 0, 0, 0, plate); disc.rotation.z = Math.PI / 2;
  const rim = mk(new THREE.TorusGeometry(.42, .045, 8, 28), C(PAL.accent), 0, 0, 0, plate); rim.rotation.y = Math.PI / 2;
  [1, -1].forEach(sg => { const p = picto(type); p.position.x = sg * .02; p.rotation.y = sg * Math.PI / 2; plate.add(p); });
  [-.25, .25].forEach(oz => mk(cyl(.012, .012, .2, 4), C('#3a3a48'), 0, .42, oz, plate));
  return s;
}

/* ---------- maisons en pâte ---------- */
function gableShape(type, w, rh) {
  const s = new THREE.Shape(), hw = w / 2;
  s.moveTo(-hw, 0); s.lineTo(hw, 0);
  if (type === 'step') { [[hw, .55], [hw * .62, .55], [hw * .62, 1.1], [hw * .3, 1.1], [hw * .3, 1.65], [-hw * .3, 1.65], [-hw * .3, 1.1], [-hw * .62, 1.1], [-hw * .62, .55], [-hw, .55]].forEach(p => s.lineTo(p[0], p[1])); }
  else if (type === 'curve') { s.lineTo(hw, .25); s.quadraticCurveTo(hw * .25, .35, hw * .32, 1.15); s.lineTo(hw * .22, 1.75); s.quadraticCurveTo(0, 2.25, -hw * .22, 1.75); s.lineTo(-hw * .32, 1.15); s.quadraticCurveTo(-hw * .25, .35, -hw, .25); }
  else s.lineTo(0, rh + .2);
  s.lineTo(-hw, 0); return s;
}
const frameG = G_('frame', () => rbox(.8, 1.02, .2, .09, 3)), glassG = G_('glass', () => rbox(.56, .78, .12, .07, 3)), sillG = G_('sill', () => rbox(.98, .12, .3, .05, 2)), shutG = G_('shut', () => rbox(.3, .92, .1, .05, 2)), boxG = G_('fbox', () => rbox(.84, .2, .24, .06, 2));
/* vitrine en saillie : cadre, montants devant, étagère et marchandises selon le commerce
   (le fond lumineux derrière est l'ancienne vitre, qui s'éclaire le soir) */
function vitrine(g, sp, d, sx, sw) {
  const ac = C(sp.front || PAL.accent), z0 = d / 2 + .24, L0 = sx - sw / 2 + .16, W0 = sw - .32;
  [-1, 1].forEach(sg => mk(rbox(.08, 1.5, .26, .03, 2), ac, sx + sg * (sw / 2 + .02), 1.06, d / 2 + .22, g));
  mk(rbox(sw + .3, .14, .34, .05, 2), ac, sx, 1.84, d / 2 + .2, g);
  for (let j = 1; j < 3; j++) mk(G_('vmul', () => rbox(.05, 1.45, .05, .02, 1)), ac, sx - sw / 2 + sw * j / 3, 1.06, d / 2 + .34, g);
  mk(rbox(sw - .1, .04, .2, .015, 1), C('#e8d9bf'), sx, .98, z0, g);
  const at = (n, i) => L0 + W0 * (i + .5) / n, M = (c, o) => C(c, o);
  const row = (n, y, f) => { for (let i = 0; i < n; i++) f(at(n, i), y, i); };
  if (sp.shop === 'bread' && COUNTRY === 'gb') {
    /* shortbread en doigts, scones, tablet */
    row(4, .31, (x, y, i) => { mk(G_('tray', () => rbox(.24, .03, .16, .01, 1)), M('#e8dcc8'), x, y + .015, z0, g); if (i % 2) for (let k = 0; k < 4; k++) mk(G_('shortb', () => rbox(.05, .03, .14, .01, 1)), M('#efce8a'), x - .08 + k * .055, y + .05, z0, g); else [-.06, .06].forEach(o => { mk(G_('scone', () => lump(cyl(.05, .055, .06, 10), .006)), M('#d8a060'), x + o, y + .06, z0, g); }); });
    row(3, 1.0, (x, y) => { for (let k = 0; k < 6; k++) mk(G_('tablet', () => rbox(.05, .035, .05, .01, 1)), M(k % 2 ? '#f2e2b8' : '#e8d098'), x - .08 + (k % 3) * .08, y + .02 + (k > 2 ? .035 : 0), z0, g); });
  } else if (sp.shop === 'bread' && COUNTRY === 'pl') {
    /* chleb rond entaillé, pączki glacés, drożdżówki */
    row(3, .31, (x, y) => { mk(G_('bask', () => cyl(.11, .085, .08, 12)), M('#b07a3e'), x, y + .04, z0, g); const l = mk(G_('chleb', () => lump(sph(.1, 14), .006)), M('#a8662e'), x, y + .13, z0, g); l.scale.set(1.15, .7, 1.15); mk(G_('cut', () => rbox(.12, .012, .02, .005, 1)), M('#e8c088'), x, y + .2, z0, g); });
    row(5, 1.0, (x, y) => { mk(G_('paczek', () => sph(.055, 12)), M('#c98a4a'), x, y + .045, z0, g).scale.set(1, .75, 1); mk(G_('icing2', () => sph(.045, 10)), M('#fff8ee'), x, y + .07, z0, g).scale.set(1, .35, 1); });
  } else if (sp.shop === 'cup' && COUNTRY === 'gb') {
    row(3, 1.0, (x, y, i) => { mk(G_('tpot', () => lump(sph(.08, 12), .004)), M(['#2f5f9a', '#fffaf0', '#a8322e'][i]), x, y + .08, z0, g).scale.set(1, .85, 1); mk(G_('spout', () => cyl(.012, .02, .1, 6)), M(['#2f5f9a', '#fffaf0', '#a8322e'][i]), x + .09, y + .1, z0, g).rotation.z = -.8; mk(G_('tlid', () => sph(.03, 8)), M('#fffaf0'), x, y + .16, z0, g); });
    row(4, .31, (x, y) => { mk(G_('sauc', () => cyl(.06, .06, .012, 12)), M('#fffaf0'), x, y + .01, z0, g); mk(G_('scone', () => lump(cyl(.05, .055, .06, 10), .006)), M('#d8a060'), x, y + .05, z0, g); mk(G_('jam', () => cyl(.035, .035, .015, 10)), M('#c8323c'), x, y + .085, z0, g); });
  } else if (sp.shop === 'cup' && COUNTRY === 'pl') {
    row(3, 1.0, (x, y, i) => { mk(G_('stand', () => cyl(.11, .04, .03, 14)), M('#fffaf0'), x, y + .06, z0, g); if (i === 1) { mk(G_('mak', () => cyl(.06, .06, .2, 14)), M('#3a2a2a'), x, y + .13, z0, g).rotation.z = Math.PI / 2; } else { mk(G_('sernik', () => rbox(.18, .09, .12, .015, 1)), M('#f2e2b0'), x, y + .12, z0, g); mk(G_('serTop', () => rbox(.18, .02, .12, .008, 1)), M('#b8783a'), x, y + .175, z0, g); } });
    row(5, .31, (x, y, i) => { mk(G_('sauc', () => cyl(.06, .06, .012, 12)), M('#fffaf0'), x, y + .01, z0, g); mk(G_('vcup', () => cyl(.035, .028, .06, 10)), M(i % 2 ? '#a8323c' : '#fffaf0'), x, y + .045, z0, g); });
  } else if (sp.shop === 'pint') {
    /* pub : chopes de bière et bouteilles */
    row(5, .31, (x, y, i) => { mk(G_('pintg', () => cyl(.045, .038, .16, 10)), M(i % 2 ? '#b8701e' : '#2a1a14', { roughness: .25 }), x, y + .08, z0, g); mk(G_('foam', () => cyl(.047, .047, .03, 10)), M('#f6efe2'), x, y + .175, z0, g); });
    row(6, 1.0, (x, y, i) => { mk(G_('bott', () => cyl(.03, .035, .18, 8)), M(['#2f5a3a', '#6a3a1e', '#2f4a6a'][i % 3], { roughness: .2 }), x, y + .09, z0, g); mk(G_('bneck', () => cyl(.012, .02, .06, 6)), M(['#2f5a3a', '#6a3a1e', '#2f4a6a'][i % 3], { roughness: .2 }), x, y + .21, z0, g); });
  } else if (sp.shop === 'pierogi') {
    /* bar mleczny : assiettes de pierogi, bol de barszcz */
    row(3, .31, (x, y, i) => { mk(G_('plate', () => cyl(.11, .1, .02, 16)), M('#fffaf0'), x, y + .01, z0, g); if (i === 1) { mk(G_('bowl', () => cyl(.07, .05, .06, 12)), M('#fffaf0'), x, y + .05, z0, g); mk(G_('barszcz', () => cyl(.065, .065, .01, 12)), M('#a8202e'), x, y + .075, z0, g); } else [-.045, .045].forEach((o, k) => { const pg = mk(G_('pierog', () => new THREE.SphereGeometry(.05, 10, 6, 0, Math.PI)), M('#f2e2c0'), x + o, y + .03, z0 + (k ? .02 : -.02), g); pg.rotation.set(-Math.PI / 2, 0, (k - .5) * .5); pg.scale.set(1.2, 1, .7); }); });
    row(4, 1.0, (x, y, i) => { mk(G_('jar', () => cyl(.04, .04, .12, 10)), M(['#c8323c', '#e8a83a', '#6a9a4a', '#fffaf0'][i], { roughness: .3 }), x, y + .06, z0, g); mk(G_('jarlid', () => cyl(.042, .042, .02, 10)), M('#fffaf0'), x, y + .13, z0, g); });
  } else if (sp.shop === 'bread') {
    row(4, .31, (x, y, i) => { mk(G_('bask', () => cyl(.11, .085, .08, 12)), M('#b07a3e'), x, y + .04, z0, g); const l = mk(G_('loaf', () => lump(sph(.09, 12), .006)), M(i % 2 ? '#d8964f' : '#c47d3a'), x, y + .12, z0, g); l.scale.set(1.3, .7, .9); });
    row(3, 1.0, (x, y, i) => { if (i === 1) { mk(G_('bask2', () => cyl(.08, .07, .16, 12)), M('#b07a3e'), x, y + .08, z0, g); [-.25, 0, .25].forEach(r => { const b = mk(G_('bag', () => cyl(.022, .022, .46, 8)), M('#d9a05a'), x + r * .1, y + .26, z0, g); b.rotation.z = r; }); } else [-.08, .08].forEach(o => { const c = mk(G_('crois', () => new THREE.TorusGeometry(.05, .026, 6, 10, Math.PI * 1.2)), M('#e0a050'), x + o, y + .04, z0, g); c.rotation.x = -Math.PI / 2; }); });
  } else if (sp.shop === 'cup') {
    row(3, 1.0, (x, y, i) => { mk(G_('stand', () => cyl(.11, .04, .03, 14)), M('#fffaf0'), x, y + .06, z0, g); mk(G_('cake', () => cyl(.09, .09, .09, 16)), M(['#f2a0b0', '#8a5a3a', '#f6e3a8'][i]), x, y + .13, z0, g); mk(G_('icing', () => cyl(.092, .092, .025, 16)), M('#fff8ee'), x, y + .18, z0, g); mk(G_('cherry', () => sph(.022, 8)), M('#d8323c'), x, y + .21, z0, g); });
    row(5, .31, (x, y, i) => { mk(G_('sauc', () => cyl(.06, .06, .012, 12)), M('#fffaf0'), x, y + .01, z0, g); mk(G_('vcup', () => cyl(.035, .028, .06, 10)), M(i % 2 ? PAL.accent : '#fffaf0'), x, y + .045, z0, g); });
  } else if (sp.shop === 'book') {
    const BK = ['#c4473a', '#2f5fb3', '#e3a84a', '#3f6b5a', '#8f3b3b', '#efe3cf', '#6a4a6a'];
    [.31, 1.0].forEach(y => { let x = L0; while (x < L0 + W0 - .06) { const w = .045 + Math.random() * .035, h = .15 + Math.random() * .08; mk(rbox(w, h, .13, .01, 1), M(BK[(Math.random() * BK.length) | 0]), x + w / 2, y + h / 2, z0, g).rotation.z = Math.random() < .15 ? .2 : 0; x += w + .012; } });
  } else if (sp.shop === 'cross') {
    const BT = ['#c98a3a', '#5a8fc8', '#fffaf0', '#3fae5f'];
    [.31, 1.0].forEach((y, r) => row(6, y, (x, yy, i) => { const c = BT[(i + r) % 4], h = .1 + ((i * 7 + r) % 3) * .03; mk(cyl(.035, .04, h, 10), M(c, { roughness: .3 }), x, yy + h / 2, z0, g); mk(G_('cap', () => cyl(.022, .022, .03, 8)), M('#fffaf0'), x, yy + h + .015, z0, g); }));
  } else if (sp.shop === 'mail') {
    row(3, .31, (x, y, i) => { const h = .1 + i * .03; mk(rbox(.18, h, .14, .015, 1), M('#c9a06a'), x, y + h / 2, z0, g); mk(rbox(.02, h + .005, .145, .005, 1), M('#7a4a2a'), x, y + h / 2, z0, g); });
    row(4, 1.0, (x, y, i) => { for (let k = 0; k < 4; k++) mk(G_('env', () => rbox(.14, .012, .1, .004, 1)), M(k % 2 ? '#fffaf0' : (i % 2 ? '#f2d6a0' : '#cfe0f0')), x, y + .01 + k * .014, z0, g).rotation.y = (k - 1.5) * .12; });
  } else if (sp.shop === 'flower') {
    const FL = ['#ff6f91', '#ffd35a', '#fff4e2', PAL.walls[4], '#e84a3a', '#b7a3d6'];
    [.31, 1.0].forEach((y, r) => row(4, y, (x, yy, i) => { mk(G_('vbk', () => cyl(.07, .055, .13, 12)), M('#7a8fa8', { metalness: .3 }), x, yy + .065, z0, g); mk(G_('vleaf', () => lump(sph(.08, 10), .01)), M(PAL.leaf), x, yy + .2, z0, g); for (let k = 0; k < 5; k++) { const a2 = k / 5 * TAU; mk(G_('fl', () => sph(.07, 8)), M(FL[(i + r * 2 + k % 2) % FL.length]), x + Math.cos(a2) * .05, yy + .25 + (k % 2) * .03, z0 + Math.sin(a2) * .04, g).scale.setScalar(.6); } }));
  }
}
const CURT = ['#fff4e2', '#f2c6c2', '#cfe0d8', '#f6e3a8', '#d8cfe8', '#e8b9a0'];
function windowAt(g, x, y, z, sp, lit) {
  if (Math.random() < .6) { const cc = C(CURT[(Math.random() * CURT.length) | 0]); [-1, 1].forEach(sg => mk(G_('curt', () => lump(rbox(.15, .7, .03, .015, 2), .004)), cc, x + sg * .2, y + .02, z + .15, g)); mk(G_('valance', () => rbox(.58, .09, .035, .02, 1)), cc, x, y + .34, z + .15, g); }
  mk(frameG, C(TRIM), x, y, z, g);
  mk(glassG, lit ? litGlass : darkGlass, x, y, z + .085, g);
  if (sp.sash) { mk(G_('sashH', () => rbox(.58, .045, .04, .015, 1)), C(TRIM), x, y + .02, z + .155, g); [-1, 1].forEach(sg => mk(G_('sashV', () => rbox(.025, .76, .03, .01, 1)), C(TRIM), x + sg * .1, y, z + .155, g)); }
  else mk(rbox(.05, .76, .05, .02, 1), C(TRIM), x, y, z + .155, g);
  if (sp.pedi) { mk(G_('pedi', () => { const t = new THREE.Shape(); t.moveTo(-.5, 0); t.lineTo(.5, 0); t.lineTo(0, .26); t.lineTo(-.5, 0); return new THREE.ExtrudeGeometry(t, { depth: .14, bevelEnabled: true, bevelSize: .02, bevelThickness: .02, bevelSegments: 1 }); }), C(TRIM), x, y + .57, z - .03, g); mk(G_('keyst', () => rbox(.1, .14, .05, .02, 1)), C(TRIM), x, y + .5, z + .12, g); }
  mk(sillG, C(shade(TRIM, -.08)), x, y - .58, z + .05, g);
  if (sp.shutters) [-1, 1].forEach(sg => mk(shutG, C(sp.shutters), x + sg * .58, y, z, g));
  if (sp.flowers && Math.random() < .55) { mk(boxG, C('#8a5a3a'), x, y - .66, z + .12, g); for (let j = 0; j < 5; j++) mk(G_('fl', () => sph(.07, 8)), C(['#ff6f91', '#ffd35a', '#fff4e2', PAL.walls[4], PAL.accent][j]), x - .3 + j * .15, y - .5, z + .14, g); }
}
function building(sp, ang, rad) {
  const g = item(sp.id); const d = 3.4, wall = C(sp.color, { bumpScale: .032 });
  g.position.set(Math.sin(ang) * rad, 0, Math.cos(ang) * rad); g.rotation.y = ang + Math.PI;
  mk(lump(rbox(sp.w, sp.h, d, .38, mobile ? 5 : 7), .04, .75), wall, 0, sp.h / 2, 0, g);
  mk(rbox(sp.w + .25, .26, d + .25, .12, 3), C(TRIM), 0, sp.h + .05, 0, g);
  const rh = sp.flat ? 1.1 : 1.7, roofM = C(sp.roof), hw = sp.w / 2 + .25, a = Math.atan2(rh, hw), L = Math.hypot(hw, rh) + .1;
  if (sp.hall) signBoards.push({ id: sp.id, g, x: 0, y: sp.h + .45, z: d / 2 + .015, w: 3.2, h: .4, bg: CITY.sign.bg || '#5f9483' });
  if (sp.hall && COUNTRY === 'pl') {
    mk(new THREE.ExtrudeGeometry(gableShape('step', sp.w - .5, 2.2), { depth: .26, bevelEnabled: true, bevelSize: .06, bevelThickness: .06, bevelSegments: 2 }), C(shade(sp.color, .03)), 0, sp.h + .72, d / 2 - .42, g);
    const hw2 = (sp.w - .5) / 2; [[-hw2, .55], [hw2, .55], [-hw2 * .62, 1.1], [hw2 * .62, 1.1], [-hw2 * .3, 1.65], [hw2 * .3, 1.65]].forEach(([px, py]) => { mk(G_('pinn', () => new THREE.ConeGeometry(.09, .55, 6)), C(TRIM), px, sp.h + .72 + py + .27, d / 2 - .29, g); });
    for (let k = 0; k < 3; k++) mk(G_('hgw', () => rbox(.34, .7, .1, .15, 2)), darkGlass, (k - 1) * .75, sp.h + 1.35, d / 2 - .13, g);
  }
  if (sp.flat) { mk(rbox(sp.w + .1, .6, .36, .15, 3), C(TRIM), 0, sp.h + .45, d / 2 - .18, g); const r = mk(lump(rbox(sp.w - .1, .3, d - .5, .14, 3), .02), roofM, 0, sp.h + .55, -.25, g); r.rotation.x = -.16; }
  else {
    [-1, 1].forEach(sg => { const r = mk(lump(rbox(L, .34, d + .55, .15, 4), .02), roofM, sg * hw / 2, sp.h + .22 + rh / 2, 0, g); r.rotation.z = -sg * a; });
    mk(rbox(.42, .42, d + .65, .2, 3), C(shade(sp.roof, -.06)), 0, sp.h + .26 + rh, 0, g);
    mk(new THREE.ExtrudeGeometry(gableShape(sp.gable, sp.w - .15, rh), { depth: .22, bevelEnabled: true, bevelSize: .09, bevelThickness: .09, bevelSegments: 4, curveSegments: 10 }), C(shade(sp.color, .03)), 0, sp.h + .22, d / 2 - .32, g);
    mk(new THREE.ExtrudeGeometry(gableShape('tri', sp.w - .3, rh - .35), { depth: .2, bevelEnabled: false }), wall, 0, sp.h + .22, -d / 2 + .05, g);
    const oc = mk(cyl(.28, .28, .12, 20), litGlass, 0, sp.h + .22 + .78, d / 2 + .02, g); oc.rotation.x = Math.PI / 2;
    const ring = mk(new THREE.TorusGeometry(.3, .07, 8, 20), C(TRIM), 0, sp.h + .22 + .78, d / 2 + .05, g);
    if (sp.gable !== 'tri') mk(sph(.14, 12), C('#e8c35a', { metalness: .5, roughness: .35 }), 0, sp.h + .22 + (sp.gable === 'step' ? 1.8 : 2.35), d / 2 - .2, g);
  }
  /* étages */
  const gfm = sp.shop ? 3.0 : 2.0, usable = sp.h - gfm - .35, floors = Math.max(1, Math.floor(usable / 1.4)), fh = usable / floors, n = sp.w >= 5.2 ? 3 : 2;
  for (let f = 0; f < floors; f++) {
    const y = gfm + fh * (f + .5) + .05;
    if (f > 0) mk(rbox(sp.w + .08, .1, .16, .05, 2), C(shade(sp.color, .07)), 0, gfm + fh * f, d / 2, g);
    for (let i = 0; i < n; i++) windowAt(g, sp.w * ((i + .5) / n - .5), y, d / 2, sp, Math.random() < .62);
    for (let i = 0; i < n; i++) { const x = sp.w * ((i + .5) / n - .5); mk(frameG, C(TRIM), x, y, -d / 2, g); mk(glassG, Math.random() < .5 ? litGlass : darkGlass, x, y, -d / 2 - .085, g); }
  }
  mk(rbox(sp.w + .06, .14, .22, .06, 2), C(TRIM), 0, gfm, d / 2, g);
  /* rez-de-chaussée */
  if (sp.shop) {
    const sw = sp.w * .48, sx = -sp.w * .17, FR_ = sp.front || PAL.accent;
    mk(rbox(sw + .2, 1.75, .22, .1, 3), C(FR_), sx, 1.02, d / 2, g);
    signBoards.push({ id: sp.id, g, x: sx + .2, y: 2.72, z: d / 2 + .17, w: 3.36, h: .42, bg: (CITY.sign.bg) || FR_ });
    mk(rbox(3.5, .56, .14, .06, 2), C(shade((CITY.sign.bg) || FR_, -.12)), sx + .2, 2.72, d / 2 + .08, g);
    mk(rbox(sw - .12, 1.45, .14, .08, 3), shopGlass, sx, 1.05, d / 2 + .06, g);
    vitrine(g, sp, d, sx, sw);
    mk(rbox(sw + .3, .22, .4, .08, 2), C(FR_), sx, .2, d / 2 + .12, g);
    const dx = sp.w * .3; mk(rbox(1.02, 1.75, .2, .12, 3), C(FR_), dx, .88, d / 2, g); mk(rbox(.78, 1.5, .14, .1, 3), C(shade(sp.color, -.25)), dx, .8, d / 2 + .06, g); mk(rbox(.5, .5, .1, .06, 2), shopGlass, dx, 1.15, d / 2 + .12, g); mk(G_('dpan', () => rbox(.5, .38, .04, .02, 1)), C(shade(sp.color, -.32)), dx, .45, d / 2 + .14, g);
    mk(sph(.06, 8), C('#e8c35a', { metalness: .6, roughness: .3 }), dx + .25, .8, d / 2 + .16, g);
    /* auvent bombé */
    const aw = new THREE.Group(); aw.position.set(sx + .2, 2.12, d / 2 + .1); g.add(aw);
    const awW = sw + 1.0, nS = 6;
    for (let k = 0; k < nS; k++) { const seg = mk(rbox(awW / nS + .02, .14, 1.05, .06, 2), C(k % 2 ? TRIM : sp.awning), -awW / 2 + awW * (k + .5) / nS, 0, .5, aw); seg.rotation.x = .42; }
    for (let k = 0; k < nS; k++) mk(G_('scal', () => sph(.19, 12)), C(k % 2 ? TRIM : sp.awning), -awW / 2 + awW * (k + .5) / nS, -.4, .98, aw).scale.set(1.1, .6, .5);
    signPost(sp.shop, g, sp.w / 2 - .25, 3.0, d / 2);
  } else if (!sp.hall) {
    mk(rbox(1.08, 1.82, .2, .14, 3), C(TRIM), 0, .91, d / 2, g); mk(rbox(.84, 1.62, .14, .12, 3), C(sp.door || shade(sp.color, -.3)), 0, .82, d / 2 + .06, g);
    mk(sph(.06, 8), C('#e8c35a', { metalness: .6, roughness: .3 }), .28, .8, d / 2 + .15, g);
    const dpc = C(shade(sp.door || shade(sp.color, -.3), -.07));
    [-1, 1].forEach(sx2 => [.48, 1.18].forEach(py => mk(G_('hpan', () => rbox(.27, py > 1 ? .5 : .56, .035, .02, 1)), dpc, sx2 * .17, py, d / 2 + .14, g)));
    mk(G_('plq', () => rbox(.2, .15, .03, .03, 1)), C('#2f4a7a'), .78, 1.62, d / 2 + .11, g); mk(G_('plqn', () => rbox(.07, .09, .01, .005, 1)), C('#fff8ee'), .78, 1.62, d / 2 + .13, g);
    mk(G_('mat', () => rbox(.72, .025, .34, .01, 1)), C('#9a6a46', { roughness: .9 }), 0, .155, d / 2 + .34, g);
    [-1, 1].forEach(sg => windowAt(g, sg * sp.w * .32, 1.15, d / 2, sp, Math.random() < .5));
    mk(rbox(1.3, .14, .5, .06, 2), C(shade(PAL.ground, -.12)), 0, .07, d / 2 + .25, g);
  }
  if (sp.hall) {
    mk(rbox(2.5, 2.5, .26, .3, 4), C(shade(sp.color, -.12)), 0, 1.25, d / 2, g);
    mk(rbox(2.0, 2.2, .16, .28, 4), C('#5a3a2a'), 0, 1.1, d / 2 + .08, g);
    mk(rbox(1.6, .9, .1, .2, 3), shopGlass, 0, 1.9, d / 2 + .12, g);
    [-1, 1].forEach(sg => windowAt(g, sg * sp.w * .36, 1.25, d / 2, sp, true));
    mk(rbox(3.4, .2, .7, .08, 2), C(shade(PAL.ground, -.12)), 0, .1, d / 2 + .3, g);
  }
  mk(rbox(sp.w - .3, .42, .08, .03, 2), C(shade(sp.color, -.16)), 0, .21, d / 2 + .02, g);
  if (!sp.flat) [-1, 1].forEach(sg => {
    const th = -sg * a, cxr = sg * hw / 2, cyr = sp.h + .22 + rh / 2, N = Math.max(4, Math.round(L / .3)), tm = C(shade(sp.roof, -.07)), hh = .19;
    for (let k = 0; k < N; k++) { const u = -L / 2 + .2 + k * (L - .4) / (N - 1); mk(G_('tilerow', () => lump(rbox(.19, .07, d + .6, .035, 2), .006)), tm, cxr + u * Math.cos(th) - hh * Math.sin(th), cyr + u * Math.sin(th) + hh * Math.cos(th), 0, g).rotation.z = th; }
  });
  houseDetails(g, sp, d, rh, hw);
  if (sp.shop || sp.hall) shopBadge(g, sp, d);
  return g;
}
/* ---------- pastilles flottantes au-dessus des commerces : on sait où toucher ----------
   Pictogramme dessiné (même langage que les enseignes), « ? » tant que le mot n'est pas découvert,
   puis le mot appris écrit dessous. La boulangerie (où l'on peut entrer) a un anneau miel. */
const badges = [], INK = '#2a2233', signBoards = [];
const ICONS = {
  bread(g) { g.fillStyle = '#d8964f'; g.strokeStyle = '#8a5326'; g.lineWidth = 6; g.beginPath(); g.ellipse(128, 122, 64, 36, 0, 0, TAU); g.fill(); g.stroke(); g.strokeStyle = '#f6d29a'; g.lineWidth = 9; g.lineCap = 'round'; [-1, 0, 1].forEach(k => { g.beginPath(); g.moveTo(118 + k * 30, 102); g.lineTo(138 + k * 30, 142); g.stroke(); }); },
  cup(g) { g.strokeStyle = INK; g.lineWidth = 6; g.lineJoin = 'round'; g.fillStyle = PAL.accent; g.beginPath(); g.ellipse(128, 170, 60, 11, 0, 0, TAU); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(84, 100); g.lineTo(172, 100); g.lineTo(162, 154); g.quadraticCurveTo(158, 166, 146, 166); g.lineTo(110, 166); g.quadraticCurveTo(98, 166, 94, 154); g.closePath(); g.fill(); g.stroke(); g.lineWidth = 8; g.beginPath(); g.arc(172, 124, 17, -Math.PI / 2, Math.PI / 2); g.stroke(); g.strokeStyle = '#b8b0c8'; g.lineWidth = 6; g.lineCap = 'round'; [110, 142].forEach(x => { g.beginPath(); g.moveTo(x, 90); g.bezierCurveTo(x - 12, 78, x + 12, 70, x, 56); g.stroke(); }); },
  book(g) { g.strokeStyle = INK; g.lineWidth = 6; g.lineJoin = 'round'; [-1, 1].forEach(sg => { g.fillStyle = sg < 0 ? PAL.accent : '#ffffff'; g.beginPath(); g.moveTo(128, 98); g.quadraticCurveTo(128 + sg * 30, 84, 128 + sg * 62, 92); g.lineTo(128 + sg * 62, 160); g.quadraticCurveTo(128 + sg * 30, 152, 128, 166); g.closePath(); g.fill(); g.stroke(); }); },
  cross(g) { g.fillStyle = '#3fae5f'; const r = (x, y, w, h) => { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, 10) : g.rect(x, y, w, h); g.fill(); }; r(106, 66, 44, 108); r(74, 98, 108, 44); },
  mail(g) { g.strokeStyle = INK; g.lineWidth = 6; g.lineJoin = 'round'; g.fillStyle = '#ffffff'; g.beginPath(); g.rect(70, 86, 116, 76); g.fill(); g.stroke(); g.fillStyle = PAL.accent; g.beginPath(); g.moveTo(70, 88); g.lineTo(128, 130); g.lineTo(186, 88); g.closePath(); g.fill(); g.stroke(); },
  flower(g) { g.strokeStyle = PAL.leaf; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 176); g.stroke(); g.fillStyle = PAL.leaf; g.beginPath(); g.ellipse(146, 162, 16, 8, -.5, 0, TAU); g.fill(); g.fillStyle = '#ff6f91'; for (let i = 0; i < 5; i++) { const a = i / 5 * TAU - Math.PI / 2; g.beginPath(); g.arc(128 + Math.cos(a) * 26, 108 + Math.sin(a) * 26, 19, 0, TAU); g.fill(); } g.fillStyle = '#ffd35a'; g.beginPath(); g.arc(128, 108, 15, 0, TAU); g.fill(); },
  pint(g) { g.fillStyle = '#d8902a'; g.strokeStyle = INK; g.lineWidth = 6; g.lineJoin = 'round'; g.beginPath(); g.moveTo(92, 84); g.lineTo(156, 84); g.lineTo(150, 172); g.lineTo(98, 172); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#fff8ee'; g.beginPath(); g.arc(104, 82, 16, 0, TAU); g.arc(126, 76, 18, 0, TAU); g.arc(148, 82, 15, 0, TAU); g.fill(); g.lineWidth = 8; g.beginPath(); g.arc(158, 124, 18, -Math.PI / 2, Math.PI / 2); g.stroke(); },
  pierogi(g) { g.strokeStyle = INK; g.lineWidth = 5; g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(128, 150, 74, 20, 0, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#f2e2c0'; [[100, 128], [156, 128]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 30, Math.PI, 0); g.closePath(); g.fill(); g.stroke(); for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(x + k * 11, y - Math.sqrt(900 - k * k * 121)); g.lineTo(x + k * 12.5, y - Math.sqrt(900 - k * k * 121) - 7); g.stroke(); } }); },
  hall(g) { g.fillStyle = '#5f9483'; g.strokeStyle = INK; g.lineWidth = 5; g.lineJoin = 'round'; g.beginPath(); g.moveTo(74, 100); g.lineTo(128, 68); g.lineTo(182, 100); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#ffffff'; [86, 112, 138, 164].forEach(x => { g.fillRect(x - 2, 104, 12, 50); g.strokeRect(x - 2, 104, 12, 50); }); g.fillStyle = '#e3d6c2'; g.fillRect(70, 156, 116, 14); g.strokeRect(70, 156, 116, 14); }
};
function drawBadge(b) {
  const g = b.cv.getContext('2d'), lab = H.label(b.id); b.lab = lab;
  g.clearRect(0, 0, 256, 320);
  g.fillStyle = b.ring; g.beginPath(); g.moveTo(104, 212); g.lineTo(128, 246); g.lineTo(152, 212); g.closePath(); g.fill();
  g.beginPath(); g.arc(128, 118, 106, 0, TAU); g.fill();
  g.fillStyle = '#fff8ee'; g.beginPath(); g.arc(128, 118, 90, 0, TAU); g.fill();
  ICONS[b.icon](g);
  if (lab === '?') {
    g.fillStyle = '#ffb547'; g.strokeStyle = '#fff8ee'; g.lineWidth = 8; g.beginPath(); g.arc(212, 38, 32, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = INK; g.font = '800 44px "Baloo 2",Nunito,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', 212, 41);
  } else {
    let fs = 40; g.font = '800 ' + fs + 'px "Baloo 2",Nunito,sans-serif'; while (g.measureText(lab).width > 210 && fs > 22) { fs -= 2; g.font = '800 ' + fs + 'px "Baloo 2",Nunito,sans-serif'; }
    const w = Math.min(244, g.measureText(lab).width + 34); g.fillStyle = 'rgba(29,33,66,.92)'; g.beginPath(); g.roundRect ? g.roundRect(128 - w / 2, 258, w, 54, 27) : g.rect(128 - w / 2, 258, w, 54); g.fill();
    g.fillStyle = '#fff8ee'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(lab, 128, 287);
  }
  b.tex.needsUpdate = true;
}
function shopBadge(g, sp, d) {
  const icon = sp.hall ? 'hall' : { bread: 'bread', cup: 'cup', book: 'book', cross: 'cross', mail: 'mail', flower: 'flower', pint: 'pint', pierogi: 'pierogi' }[sp.shop];
  if (!icon) return;
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 320;
  const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthWrite: false, transparent: true, fog: false }));
  spr.scale.set(.95, 1.19, 1); spr.renderOrder = 3;
  const x = sp.hall ? 0 : -sp.w * .17 + .2, y = sp.hall ? 3.3 : 3.55;
  spr.position.set(x, y, d / 2 + (sp.hall ? 1.0 : 1.15)); g.add(spr);
  const b = { id: sp.id, icon, ring: sp.id === 'bakeryShop' ? '#ffb547' : sp.hall ? '#5f9483' : (sp.awning || PAL.accent), cv, tex, spr, y, lab: null };
  drawBadge(b); badges.push(b);
}
const wallLampM = C('#fff3d0', { unique: true, emissive: '#ffcf7a', emissiveIntensity: 0, bumpScale: 0 }); lampMats.push(wallLampM);
const ironD = C('#3a3a48', { metalness: .3 }), zinc = C('#8a8f99', { metalness: .35, roughness: .45 }), terra = C('#c4633f');
function wallLantern(g, x, y, z) {
  mk(G_('lbr', () => rbox(.05, .05, .32, .02, 1)), ironD, x, y + .32, z + .12, g);
  mk(G_('lcap', () => cyl(.13, .02, .1, 8)), ironD, x, y + .2, z + .28, g);
  mk(G_('lbody', () => rbox(.17, .24, .17, .05, 2)), wallLampM, x, y + .03, z + .28, g);
  mk(G_('lbot', () => cyl(.06, .1, .06, 8)), ironD, x, y - .11, z + .28, g);
}
function planter(g, x, z, big) {
  const s = big ? 1.3 : 1, p = new THREE.Group(); p.position.set(x, 0, z); p.scale.setScalar(s); g.add(p);
  mk(G_('pot', () => lump(cyl(.26, .19, .42, 14), .006)), terra, 0, .21, 0, p);
  mk(G_('potrim', () => new THREE.TorusGeometry(.26, .045, 6, 16)), C(shade('#c4633f', .06)), 0, .42, 0, p).rotation.x = Math.PI / 2;
  mk(G_('bush', () => lump(sph(.3, 14), .025, 3)), C(shade(PAL.leaf, rnd(-.06, .04))), 0, .62, 0, p).scale.set(1, .78, 1);
  const fc = ['#ff6f91', '#ffd35a', '#fff4e2', PAL.walls[4], PAL.accent];
  for (let j = 0; j < 6; j++) { const a = j / 6 * TAU + rnd(-.3, .3); mk(G_('fl', () => sph(.07, 8)), C(fc[(j + (x > 0 ? 2 : 0)) % 5]), Math.cos(a) * .2, .78 + rnd(-.04, .05), Math.sin(a) * .2, p); }
}
function houseDetails(g, sp, d, rh, hw) {
  /* gouttières : chéneau le long du toit et descente au coin de la façade */
  [-1, 1].forEach(sg => {
    const px = sg * (sp.w / 2 + .05), pz = d / 2 - .28, top = sp.h + .06;
    mk(cyl(.045, .045, top - .12, 8), zinc, px, (top + .12) / 2, pz, g);
    mk(G_('shoe', () => cyl(.05, .07, .16, 8)), zinc, px, .1, pz + .03, g).rotation.x = .5;
    mk(G_('elb', () => sph(.065, 8)), zinc, px, top, pz, g);
    if (!sp.flat) { const gu = mk(cyl(.065, .065, d + .45, 8), zinc, sg * (hw - .06), sp.h + .12, 0, g); gu.rotation.x = Math.PI / 2; mk(cyl(.04, .04, hw - .06 - Math.abs(px) + .04, 6), zinc, (px + sg * (hw - .06)) / 2, top + .02, pz, g).rotation.z = Math.PI / 2; }
    [.25, .5, .75].forEach(k => mk(G_('clip', () => cyl(.06, .06, .03, 8)), zinc, px, .12 + (top - .12) * k, pz, g));
  });
  /* cheminée (la boulangerie a déjà la sienne, qui fume) */
  if (sp.id !== 'bakeryShop' && !sp.hall) {
    const sg = (sp.w * 7 | 0) % 2 ? 1 : -1, cx = sg * sp.w * .2, cz = -d * .18;
    const ry = sp.flat ? sp.h + .55 : sp.h + .22 + rh * (1 - Math.abs(cx) / hw);
    const cc = C(shade(sp.color, -.14));
    mk(lump(rbox(.5, 1.25, .5, .1, 3), .012), cc, cx, ry + .25, cz, g);
    mk(G_('chcap', () => rbox(.66, .14, .66, .06, 2)), C(TRIM), cx, ry + .88, cz, g);
    [-.1, .1].forEach(o => mk(G_('chpot', () => cyl(.07, .085, .26, 10)), terra, cx + o, ry + 1.06, cz, g));
  }
  /* lanterne au-dessus de la porte, jardinières au pied de la façade */
  if (sp.hall) { [-1, 1].forEach(sg => { wallLantern(g, sg * 1.55, 2.2, d / 2); planter(g, sg * 2.25, d / 2 + .5, true); }); }
  else if (sp.shop) { wallLantern(g, sp.w * .3, 2.0, d / 2); planter(g, -sp.w / 2 + .38, d / 2 + .52); }
  else { wallLantern(g, 0, 2.02, d / 2); [-1, 1].forEach(sg => planter(g, sg * sp.w * .32, d / 2 + .36)); }
  /* ombre douce au pied de la façade */
  sblobAt(g, 0, d / 2 + .1, sp.w * .62, .55);
}
const W_ = PAL.walls, R_ = PAL.roofs;
const B = [
  { id: 'house', w: 5.0, h: 5.6, color: W_[2], roof: R_[0], gable: 'tri', shutters: shade(W_[2], -.25), flowers: true },
  { id: 'bookshop', w: 5.2, h: 6.3, color: W_[0], roof: R_[1], gable: 'step', shop: 'book', awning: R_[1] },
  { id: 'cafe', w: 5.0, h: 5.8, color: W_[4], roof: R_[0], gable: 'curve', shop: 'cup', awning: PAL.accent, flowers: true },
  { id: 'bakeryShop', w: 5.4, h: 6.0, color: W_[1], roof: R_[0], gable: 'step', shop: 'bread', awning: R_[0], shutters: shade(W_[1], -.28) },
  { id: 'townhall', w: 6.4, h: 6.6, color: W_[3], roof: R_[1], flat: true, hall: true },
  { id: 'pharmacy', w: 5.0, h: 5.9, color: W_[2], roof: R_[1], gable: 'tri', shop: 'cross', awning: '#3f8f5f' },
  { id: 'post', w: 5.4, h: 6.2, color: W_[1], roof: R_[1], flat: true, shop: 'mail', awning: R_[1] },
  { id: 'florist', w: 4.8, h: 5.5, color: W_[4], roof: R_[0], gable: 'curve', shop: 'flower', awning: PAL.accent, flowers: true },
  { id: 'house', w: 5.0, h: 6.1, color: W_[0], roof: R_[0], gable: 'step', shutters: shade(W_[0], -.25), flowers: true }
];
if (COUNTRY === 'gb') {
  /* Grassmarket : immeubles de pierre plus hauts, pignons à redents écossais, fenêtres à guillotine,
     devantures peintes chacune de sa couleur (comme Victoria Street) */
  const SF = ['#a8322e', '#2f5f9a', '#2f6b4a', '#d89a24', '#6a3a7a', '#a8322e', '#2f5f9a', '#2f6b4a', '#1f3a2e'];
  B.forEach((sp, i) => { sp.h += 1.3; if (!sp.flat) sp.gable = i % 3 === 2 ? 'tri' : 'step'; sp.shutters = null; sp.sash = true; sp.front = SF[i]; if (sp.awning) sp.awning = SF[i]; });
  Object.assign(B[8], { id: 'pub', shop: 'pint', awning: '#1f3a2e', front: '#1f3a2e', flowers: false });
  B[4].color = '#c9b896';
} else if (COUNTRY === 'pl') {
  /* Rynek : kamienice colorées, hauts pignons (à redents ou baroques), encadrements blancs à frontons */
  const PF = ['#6a4a3e', '#3f5a4a', '#5a4a6a', '#8a6a3a', '#3a4a5a', '#6a4a3e', '#3f5a4a', '#5a4a6a', '#7a2a2e'];
  B.forEach((sp, i) => { sp.h += 1.0; if (!sp.hall) { sp.flat = false; sp.gable = i % 2 ? 'curve' : 'step'; } sp.shutters = null; sp.pedi = true; sp.front = PF[i]; });
  Object.assign(B[8], { id: 'milkbar', shop: 'pierogi', awning: '#f4e6c8', front: '#7a2a2e', flowers: false });
  B[4].color = '#dccaa8';
}
const RAD = 11.6, span = 250 * Math.PI / 180, a0 = G + Math.PI - span / 2;
const bld = {};
B.forEach((sp, i) => { const ang = a0 + span * i / (B.length - 1); const g = building(sp, ang, RAD + (sp.id === 'townhall' ? .3 : 0)); if (sp.id === 'bakeryShop') bld.bakery = { g, ang }; if (sp.id === 'townhall') bld.hall = { g, sp }; });

/* enseignes peintes dans la langue du pays (toutes dans une texture, une seule géométrie) */
let signMat = null;
(function buildSigns() {
  const list = signBoards.filter(b => CITY.signs && CITY.signs[b.id]); if (!list.length) return;
  const RW = 1024, RH = 128, N = list.length, cv = document.createElement('canvas'); cv.width = RW; cv.height = RH * N;
  const g2 = cv.getContext('2d'), S = CITY.sign, P = [], Nn = [], U = [], I = []; let vo = 0;
  list.forEach((b, i) => {
    const y0 = i * RH, txt = CITY.signs[b.id];
    g2.fillStyle = b.bg; g2.beginPath(); g2.roundRect ? g2.roundRect(4, y0 + 4, RW - 8, RH - 8, 18) : g2.rect(4, y0 + 4, RW - 8, RH - 8); g2.fill();
    if (S.border) { g2.strokeStyle = S.border; g2.lineWidth = 5; g2.beginPath(); g2.roundRect ? g2.roundRect(16, y0 + 16, RW - 32, RH - 32, 10) : g2.rect(16, y0 + 16, RW - 32, RH - 32); g2.stroke(); }
    let fs = 78; const F = () => '700 ' + fs + 'px ' + S.font; g2.font = F(); while (g2.measureText(txt).width > RW - 110 && fs > 30) { fs -= 3; g2.font = F(); }
    g2.fillStyle = 'rgba(0,0,0,.25)'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.fillText(txt, RW / 2 + 2, y0 + RH / 2 + 5);
    g2.fillStyle = S.fg; g2.fillText(txt, RW / 2, y0 + RH / 2 + 3);
    const geo = new THREE.PlaneGeometry(b.w, b.h); b.g.updateMatrixWorld(true);
    geo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(b.g.matrixWorld, new THREE.Matrix4().makeTranslation(b.x, b.y, b.z)));
    const pa = geo.attributes.position, na = geo.attributes.normal, ua = geo.attributes.uv;
    for (let k = 0; k < pa.count; k++) { P.push(pa.getX(k), pa.getY(k), pa.getZ(k)); Nn.push(na.getX(k), na.getY(k), na.getZ(k)); U.push(ua.getX(k), 1 - (i + 1 - ua.getY(k)) / N); }
    for (let k = 0; k < geo.index.count; k++) I.push(vo + geo.index.getX(k)); vo += pa.count;
  });
  const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(Nn, 3)); out.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); out.setIndex(I);
  const tx = new THREE.CanvasTexture(cv); tx.encoding = THREE.sRGBEncoding; tx.anisotropy = 8;
  signMat = new THREE.MeshStandardMaterial({ map: tx, roughness: .65, emissive: '#ffffff', emissiveMap: tx, emissiveIntensity: .05 });
  const m = new THREE.Mesh(out, signMat); m.userData.keep = true; m.userData.noCast = true; m.receiveShadow = true; scene.add(m);
})();

/* beffroi avec horloge qui donne l'heure */
const hall = bld.hall.g, hs = bld.hall.sp, tw = 2.6, th = 4.6, ty = hs.h + .2;
mk(lump(rbox(tw, th, tw, .3), .02), C(CITY.tower || hs.color), 0, ty + th / 2, -.4, hall);
mk(rbox(tw + .35, .3, tw + .35, .14, 3), C(TRIM), 0, ty + th, -.4, hall);
[[0, tw / 2 + .02], [Math.PI / 2, tw / 2 + .02], [-Math.PI / 2, tw / 2 + .02]].forEach(([ry]) => { const f = new THREE.Group(); f.rotation.y = ry; f.position.set(0, ty + th * .22, -.4); hall.add(f); mk(rbox(.8, 1.1, .16, .3, 3), darkGlass, 0, 0, tw / 2, f); });
const gold = C('#e8c35a', { metalness: .6, roughness: .3 }), corners = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
if (COUNTRY === 'gb') {
  /* clocher de kirk : flèche octogonale fine en ardoise, quatre pinacles */
  mk(lump(new THREE.ConeGeometry(tw * .42, 5.4, 8, 6), .02), C('#5a5f66', { roughness: .5 }), 0, ty + th + 2.85, -.4, hall);
  corners.forEach(([cx, cz]) => mk(G_('gpin', () => new THREE.ConeGeometry(.16, 1.1, 6)), C(CITY.tower), cx * (tw / 2 - .1), ty + th + .7, -.4 + cz * (tw / 2 - .1), hall));
  mk(sph(.16, 12), gold, 0, ty + th + 5.65, -.4, hall);
} else if (COUNTRY === 'pl') {
  /* tour de ratusz : tambour, bulbe et lanterne en cuivre vert, pinacles d'angle */
  const cu = C('#6a9a86', { roughness: .45 });
  mk(cyl(tw * .38, tw * .45, 1.0, 8), C(TRIM), 0, ty + th + .65, -.4, hall);
  mk(lump(sph(tw * .42, 16), .01), cu, 0, ty + th + 1.4, -.4, hall).scale.set(1, .75, 1);
  mk(cyl(.32, .36, .7, 8), C(TRIM), 0, ty + th + 2.2, -.4, hall);
  mk(new THREE.ConeGeometry(.42, 2.2, 8), cu, 0, ty + th + 3.6, -.4, hall);
  corners.forEach(([cx, cz]) => mk(G_('ppin', () => new THREE.ConeGeometry(.18, 1.2, 6)), cu, cx * (tw / 2 - .1), ty + th + .75, -.4 + cz * (tw / 2 - .1), hall));
  mk(sph(.18, 12), gold, 0, ty + th + 4.8, -.4, hall);
} else {
  mk(lump(new THREE.ConeGeometry(tw * .8, 3.8, 24, 6), .05), C('#5f9483', { roughness: .45 }), 0, ty + th + 1.9, -.4, hall);
  mk(sph(.24, 14), gold, 0, ty + th + 3.9, -.4, hall);
}
const hands = [];
const clock = item('clock', hall);
[0, Math.PI / 2, -Math.PI / 2].forEach(ry => {
  const f = new THREE.Group(); f.rotation.y = ry; f.position.set(0, ty + th * .62, -.4); clock.add(f);
  const face = C('#fffaf0', { unique: true, emissive: '#fff4d6', emissiveIntensity: 0 }); clockMats.push(face);
  const fc = mk(cyl(.86, .86, .12, 32), face, 0, 0, tw / 2 + .04, f); fc.rotation.x = Math.PI / 2;
  mk(new THREE.TorusGeometry(.88, .09, 10, 32), C(PAL.accent), 0, 0, tw / 2 + .1, f);
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; mk(G_('tick', () => sph(.05, 6)), C('#2a2233'), Math.sin(a) * .66, Math.cos(a) * .66, tw / 2 + .12, f); }
  const hh = new THREE.Group(), mh = new THREE.Group(); hh.position.z = mh.position.z = tw / 2 + .14; f.add(hh, mh);
  mk(rbox(.1, .46, .05, .04, 2), C('#2a2233'), 0, .2, 0, hh); mk(rbox(.07, .66, .05, .03, 2), C('#2a2233'), 0, .3, .03, mh);
  mk(sph(.07, 8), C('#e8c35a'), 0, 0, tw / 2 + .2, f);
  hands.push([hh, mh]);
});

/* ---------- fontaine, bancs, réverbères ---------- */
const stone = C(shade(PAL.ground, -.05));
const fountain = item('fountain');
mk(new THREE.TorusGeometry(1.85, .3, 14, 40), stone, 0, .42, 0, fountain).rotation.x = Math.PI / 2;
mk(cyl(1.9, 1.95, .4, 40), stone, 0, .2, 0, fountain);
const water = mk(cyl(1.62, 1.62, .08, 40), C('#5fb0cf', { unique: true, roughness: .12, emissive: '#1f5f7a', emissiveIntensity: .25, bumpScale: .04 }), 0, .48, 0, fountain);
mk(lump(cyl(.26, .36, 1.4, 16), .02), stone, 0, .9, 0, fountain);
mk(sph(.78, 20), stone, 0, 1.6, 0, fountain).scale.set(1, .32, 1);
mk(cyl(.68, .68, .05, 24), water.material, 0, 1.78, 0, fountain);
mk(sph(.2, 14), C(PAL.accent), 0, 1.98, 0, fountain);
const streams = [];
for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; const s = mk(cyl(.035, .06, 1.25, 8), C('#bfe8f7', { unique: true, transparent: true, opacity: .6, roughness: .1, emissive: '#bfe8f7', emissiveIntensity: .15 }), Math.sin(a) * .62, 1.1, Math.cos(a) * .62, fountain); s.rotation.set(Math.cos(a) * .35, 0, -Math.sin(a) * .35); streams.push(s); }
const colliders = [{ x: 0, z: 0, r: 2.4 }]; sblob(0, 0, 2.75);
const woodM = C('#b5794a'), iron = C('#3a3a48', { metalness: .25 });
[0, 1, 2, 3].forEach(i => {
  const a = G + [1.2, -1.2, 2.4, -2.4][i], b = item('bench'); b.position.set(Math.sin(a) * 4.1, 0, Math.cos(a) * 4.1); b.rotation.y = a + Math.PI; blob(0, 0, 1.1, b, .06);
  mk(rbox(1.8, .16, .62, .07, 2), woodM, 0, .5, 0, b);
  const bk = mk(rbox(1.8, .5, .14, .07, 2), woodM, 0, .9, .3, b); bk.rotation.x = -.18;
  [-.75, .75].forEach(x => mk(rbox(.12, .5, .55, .05, 2), iron, x, .25, 0, b));
  colliders.push({ x: b.position.x, z: b.position.z, r: .95 });
});
function lamp(x, z, light) {
  const l = item('streetlamp'); l.position.set(x, 0, z);
  mk(cyl(.08, .11, 3.1, 10), iron, 0, 1.55, 0, l);
  mk(sph(.22, 12), iron, 0, .12, 0, l).scale.y = .6;
  const gm = C('#fff3d0', { unique: true, emissive: '#ffcf7a', emissiveIntensity: 0 }); lampMats.push(gm);
  mk(rbox(.38, .48, .38, .12, 3), gm, 0, 3.32, 0, l);
  mk(sph(.28, 12), iron, 0, 3.62, 0, l).scale.y = .5;
  const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); h.scale.set(1.9, 1.9, 1); h.position.set(0, 3.3, 0); l.add(h); halos.push(h);
  if (light && !mobile) { const p = new THREE.PointLight('#ffc77a', 0, 9, 2); p.position.set(x, 3.2, z); scene.add(p); lampLights.push(p); }
  if (mobile) { poolM.map = glowT; const pool = mk(G_('pool', () => new THREE.CircleGeometry(2.6, 24)), poolM, x, .06, z); pool.rotation.x = -Math.PI / 2; pool.renderOrder = 2; }
  colliders.push({ x, z, r: .38 }); sblob(x, z, .55);
}
for (let i = 0; i < 6; i++) { const a = G + .5 + i * (TAU - 1) / 5; lamp(Math.sin(a) * 8.7, Math.cos(a) * 8.7, i % 2 === 0); }

/* ---------- guirlandes : fanions le jour, ampoules la nuit ---------- */
const bulbM = C('#fff3d0', { unique: true, emissive: '#ffcf7a', emissiveIntensity: 0, bumpScale: 0 }); lampMats.push(bulbM);
const lampTops = hits.filter(h => h.userData.id === 'streetlamp').map(l => new THREE.Vector3(l.position.x, 3.55, l.position.z));
const strands = [];
lampTops.forEach((p, i) => { const q = lampTops[(i + 1) % lampTops.length]; if (p.distanceTo(q) < 14) strands.push([p, q]); });
const bulbPts = [], flagPts = [];
const wireM = C('#3a3a48', { bumpScale: 0 });
strands.forEach(([a, b]) => {
  const mid = a.clone().lerp(b, .5); mid.y -= a.distanceTo(b) * .07;
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  mk(new THREE.TubeGeometry(curve, 24, .012, 4, false), wireM, 0, 0, 0);
  const n = Math.max(6, Math.round(a.distanceTo(b) / .55));
  for (let k = 1; k < n; k++) { const t = k / n, pt = curve.getPoint(t), tg = curve.getTangent(t); (k % 2 ? bulbPts : flagPts).push([pt, tg]); }
});
const bulbIM = new THREE.InstancedMesh(G_('bulb', () => sph(.06, 8)), bulbM, bulbPts.length), bo = new THREE.Object3D();
bulbPts.forEach(([p], i) => { bo.position.copy(p); bo.position.y -= .07; bo.updateMatrix(); bulbIM.setMatrixAt(i, bo.matrix); }); scene.add(bulbIM);
const flagS = new THREE.Shape(); flagS.moveTo(-.13, 0); flagS.lineTo(.13, 0); flagS.lineTo(0, -.26); flagS.lineTo(-.13, 0);
const flagIM = new THREE.InstancedMesh(new THREE.ExtrudeGeometry(flagS, { depth: .015, bevelEnabled: false }), C('#ffffff', { bumpScale: 0, side: THREE.DoubleSide }), flagPts.length), fc2 = new THREE.Color();
flagPts.forEach(([p, tg], i) => { bo.position.copy(p); bo.rotation.set(0, Math.atan2(tg.x, tg.z) + Math.PI / 2, 0); bo.updateMatrix(); flagIM.setMatrixAt(i, bo.matrix); const BU = CITY.bunting || [PAL.accent, PAL.walls[0], PAL.walls[1], TRIM, PAL.roofs[0]]; fc2.set(BU[i % BU.length]); flagIM.setColorAt(i, fc2); });
if (flagIM.instanceColor) flagIM.instanceColor.needsUpdate = true; flagIM.castShadow = true; scene.add(flagIM);

/* vélo près de la boulangerie */
{
  const ba = bld.bakery.ang + .19, bike = item('bicycle'); bike.position.set(Math.sin(ba) * 9.1, 0, Math.cos(ba) * 9.1); bike.rotation.y = ba + Math.PI / 2;
  const red = C(PAL.accent), tyre = C('#2a2a30');
  [-.55, .55].forEach(x => { mk(new THREE.TorusGeometry(.33, .05, 8, 24), tyre, x, .38, 0, bike); mk(sph(.06, 8), red, x, .38, 0, bike); });
  const bar = (x1, y1, x2, y2) => { const m = mk(cyl(.035, .035, Math.hypot(x2 - x1, y2 - y1), 8), red, (x1 + x2) / 2, (y1 + y2) / 2, 0, bike); m.rotation.z = Math.atan2(x1 - x2, y2 - y1); };
  bar(-.55, .38, -.05, .38); bar(-.05, .38, .35, .84); bar(-.55, .38, -.15, .82); bar(-.15, .82, .38, .84); bar(.55, .38, .38, .84); bar(-.05, .38, -.15, .82);
  mk(rbox(.26, .08, .14, .04, 2), C('#3a2a22'), -.17, .88, 0, bike); mk(rbox(.08, .08, .5, .04, 2), C('#3a2a22'), .38, .92, 0, bike);
  mk(rbox(.34, .2, .26, .06, 2), C('#a8763e'), .62, .8, 0, bike);
  colliders.push({ x: bike.position.x, z: bike.position.z, r: .7 }); sblob(bike.position.x, bike.position.z, .95, .35, bike.rotation.y);
}
/* parasol de café : toile à côtes alternées, festons, mât */
function parasol(t, col) {
  mk(G_('pole', () => cyl(.03, .03, 2.05, 8)), C('#e8dcc8'), 0, 1.8, 0, t);
  const top = 2.62, n = 8;
  for (let k = 0; k < n; k++) {
    mk(new THREE.ConeGeometry(1.15, .42, 3, 1, true, k * TAU / n, TAU / n), C(k % 2 ? TRIM : col, { side: THREE.DoubleSide }), 0, top, 0, t);
    const a = (k + .5) * TAU / n; mk(G_('scal2', () => sph(.11, 8)), C(k % 2 ? TRIM : col), Math.sin(a) * 1.1, top - .25, Math.cos(a) * 1.1, t).scale.set(1.2, .6, 1.2);
  }
  mk(G_('fin', () => sph(.07, 8)), C('#e8c35a', { metalness: .5, roughness: .35 }), 0, top + .24, 0, t);
}
/* boîte aux lettres, tables du café, seaux du fleuriste */
B.forEach((sp, i) => {
  const ang = a0 + span * i / (B.length - 1);
  if (sp.id === 'post') {
    const a = ang - .2, pb = item('postbox'), pc = C(CITY.postbox); pb.position.set(Math.sin(a) * 9.3, 0, Math.cos(a) * 9.3); pb.rotation.y = a + Math.PI;
    if (COUNTRY === 'gb') { mk(cyl(.27, .29, 1.15, 18), pc, 0, .62, 0, pb); mk(cyl(.31, .31, .08, 18), pc, 0, 1.22, 0, pb); mk(sph(.29, 16), pc, 0, 1.26, 0, pb).scale.set(1, .45, 1); mk(cyl(.31, .33, .1, 18), C('#1a1a22'), 0, .05, 0, pb); mk(rbox(.26, .05, .06, .02, 1), C('#1a1a22'), 0, .98, .27, pb); mk(rbox(.18, .14, .03, .02, 1), C('#fff4e2'), 0, .72, .28, pb); }
    else { mk(rbox(.55, 1.1, .45, .2, 4), pc, 0, .55, 0, pb); mk(sph(.29, 14), pc, 0, 1.1, 0, pb).scale.set(1, .5, .8); mk(rbox(.32, .06, .06, .02, 1), C('#2a2233'), 0, .85, .24, pb); }
    colliders.push({ x: pb.position.x, z: pb.position.z, r: .5 }); sblob(pb.position.x, pb.position.z, .5);
  }
  if (sp.id === 'cafe') [-.18, .18].forEach(o => { const a = ang + o, x = Math.sin(a) * 8.7, z = Math.cos(a) * 8.7, t = new THREE.Group(); t.position.set(x, 0, z); scene.add(t); mk(cyl(.42, .42, .08, 22), C(TRIM), 0, .76, 0, t); mk(cyl(.05, .05, .75, 8), iron, 0, .37, 0, t); mk(cyl(.07, .05, .1, 10), C('#fffaf0'), .1, .85, .05, t); [-.62, .62].forEach(cx => { mk(cyl(.22, .22, .08, 14), C(PAL.accent), cx, .46, 0, t); mk(cyl(.04, .04, .45, 6), iron, cx, .22, 0, t); }); parasol(t, o < 0 ? PAL.accent : PAL.walls[1]); colliders.push({ x, z, r: 1.05 }); sblob(x, z, 1.1); });
  if (sp.id === 'florist') for (let j = 0; j < 4; j++) { const a = ang - .12 + j * .08, x = Math.sin(a) * 9.4, z = Math.cos(a) * 9.4; sblob(x, z, .32); mk(cyl(.22, .17, .38, 14), C('#7a8fa8', { metalness: .3 }), x, .19, z); for (let f = 0; f < 6; f++) mk(G_('fl', () => sph(.07, 8)), C(['#ff6f91', '#ffd35a', PAL.walls[4], '#fff4e2'][j]), x + rnd(-.13, .13), .45 + rnd(0, .15), z + rnd(-.13, .13)); }
});

/* ---------- étals du marché ---------- */
function stall(a, r, cA, fruit) {
  const s = item('stall'); s.position.set(Math.sin(a) * r, 0, Math.cos(a) * r); s.rotation.y = a;
  mk(rbox(2.3, .95, .95, .12, 3), woodM, 0, .48, 0, s);
  [[-1.08, -.4], [1.08, -.4], [-1.08, .4], [1.08, .4]].forEach(([x, z]) => mk(cyl(.05, .05, 2.3, 8), woodM, x, 1.15, z, s));
  [-1, 1].forEach(sg => { for (let k = 0; k < 5; k++) { const c = mk(rbox(.5, .1, .82, .05, 2), C(k % 2 ? TRIM : cA), -1.0 + k * .5, 2.4, sg * .32, s); c.rotation.x = sg * .35; } });
  const ap = item('apple', s);
  for (let c = 0; c < 3; c++) { mk(rbox(.62, .22, .52, .06, 2), C('#c99a62'), -.72 + c * .72, 1.06, 0, ap); for (let f = 0; f < 7; f++) mk(G_('fruit', () => sph(.085, 12)), C(fruit[c], { roughness: .4 }), -.72 + c * .72 + rnd(-.2, .2), 1.22, rnd(-.16, .16), ap); }
  colliders.push({ x: s.position.x, z: s.position.z, r: 1.45 }); sblob(s.position.x, s.position.z, 1.7, .85, a);
}
stall(G - .55, 5.6, PAL.accent, ['#d82e2e', '#ff9a2e', '#9cc84a']);
stall(G + .55, 5.6, R_[0], ['#e84a3a', '#f2d24a', '#7a2a5a']);

/* ---------- arbres ---------- */
function tree(x, z, s) {
  const t = item('tree'); t.position.set(x, 0, z); t.scale.setScalar(s);
  mk(lump(cyl(.14, .22, 1.7, 10), .03), C('#8a5a3a'), 0, .85, 0, t);
  const c = shade(PAL.leaf, rnd(-.05, .08));
  [[0, 2.15, 0, .95], [.48, 1.75, .2, .66], [-.42, 1.82, -.2, .7], [.08, 2.7, -.08, .58]].forEach(([a, b, cc, r]) => mk(lump(sph(r, 20), .05, 2), C(shade(c, rnd(-.04, .04))), a, b, cc, t));
  colliders.push({ x, z, r: .6 * s }); sblob(x, z, 1.25 * s);
}
[[11.2, 2.4], [11.6, -2.5], [13.2, 3.4], [13.0, -3.6], [12.2, 4.7], [12.4, -4.8], [14.0, 2.2], [14.1, -2.3]].forEach(([r, s]) => tree(Math.sin(G) * r + Math.cos(G) * s, Math.cos(G) * r - Math.sin(G) * s, rnd(.9, 1.2)));
[G + 1.3, G - 1.3].forEach(a => tree(Math.sin(a) * 7.2, Math.cos(a) * 7.2, .85));
for (let i = 0; i < 30; i++) { const a = G + rnd(.15, TAU - .15), r = rnd(13.6, 14.6); mk(lump(sph(rnd(.35, .6), 12), .04, 2), C(shade(PAL.leaf, rnd(-.1, .04))), Math.sin(a) * r, .22, Math.cos(a) * r); }

/* ---------- ce qui fait chaque ville ---------- */
const collectibles = [];
const at = (id, x, z, ry, y) => { const g = item(id); g.position.set(x, y || 0, z); g.rotation.y = ry || 0; return g; };
const polar = (a, r) => [Math.sin(a) * r, Math.cos(a) * r];
const postAng = a0 + span * 6 / (B.length - 1);
if (COUNTRY === 'gb') {
  /* le château sur son rocher, en île flottante au-dessus des toits (comme il domine le Grassmarket) */
  {
    const ca = 4.6, [cx, cz] = polar(ca, 46), c = at('castle', cx, cz, ca + Math.PI, 18);
    const rock = C('#6e665c'), stone = C('#a89c88'), slate = C('#4a505c'), win = C('#2f3550');
    mk(lump(new THREE.CylinderGeometry(6.5, 9, 9, 14, 4), .7, .5), rock, 0, 0, 0, c);
    mk(lump(new THREE.ConeGeometry(8.6, 9, 14, 4), .6), C('#5e574e'), 0, -9, 0, c).rotation.x = Math.PI;
    mk(cyl(6.6, 6.6, .5, 14), C(shade(PAL.leaf, -.05)), 0, 4.6, 0, c);
    const wall = (w, h, x, z, ry) => { const wg = new THREE.Group(); wg.position.set(x, 4.8, z); wg.rotation.y = ry; c.add(wg); mk(rbox(w, h, .7, .15, 2), stone, 0, h / 2, 0, wg); for (let k = 0; k < Math.floor(w / .7); k++) mk(G_('merlon', () => rbox(.38, .45, .7, .08, 1), ), stone, -w / 2 + .35 + k * .7, h + .2, 0, wg); };
    wall(10, 2.4, 0, 4.2, 0); wall(8, 2.4, -4.6, 0, Math.PI / 2); wall(8, 2.4, 4.6, 0, Math.PI / 2); wall(10, 2.4, 0, -4.2, 0);
    mk(rbox(5, 3.6, 3, .2, 2), stone, -1.2, 4.8 + 1.8, -1, c); mk(new THREE.ExtrudeGeometry((() => { const t = new THREE.Shape(); t.moveTo(-1.6, 0); t.lineTo(1.6, 0); t.lineTo(0, 1.5); t.lineTo(-1.6, 0); return t; })(), { depth: 5, bevelEnabled: false }), slate, -3.7, 4.8 + 3.6, -1, c).rotation.y = Math.PI / 2;
    for (let k = 0; k < 5; k++) mk(G_('cwin', () => rbox(.4, .8, .1, .1, 1)), win, -3.2 + k * 1, 6.6, .52, c);
    [[-4.6, 4.2], [4.6, 4.2], [4.6, -4.2], [-4.6, -4.2]].forEach(([x, z]) => { mk(cyl(.9, 1.0, 3.6, 12), stone, x, 4.8 + 1.8, z, c); for (let k = 0; k < 8; k++) { const a2 = k / 8 * TAU; mk(G_('tmerl', () => rbox(.3, .4, .3, .06, 1)), stone, x + Math.sin(a2) * .82, 4.8 + 3.8, z + Math.cos(a2) * .82, c); } });
    mk(cyl(2.2, 2.4, 2.6, 18), stone, 2.6, 4.8 + 1.3, 3.2, c);
    mk(cyl(.04, .04, 2.2, 6), C('#3a3a48'), -1.2, 4.8 + 4.7, -1, c); const fl = mk(rbox(.9, .55, .03, .01, 1), C('#2f5fa8', { bumpScale: 0 }), -.75, 4.8 + 5.5, -1, c);
    [-1, 1].forEach(sg => mk(G_('salt', () => rbox(1.05, .08, .035, .01, 1)), C('#fff8ee', { bumpScale: 0 }), -.75, 4.8 + 5.5, -1 + .01, c).rotation.z = sg * .55);
    c.userData.dyn = true; /* loin : pas d'ombre */
  }
  /* cabine téléphonique rouge */
  {
    const [x, z] = polar(postAng + .21, 9.25), b = at('phonebox', x, z, postAng + .21 + Math.PI), red = C('#c8202a'), gl = C('#d8e6ea', { roughness: .2 });
    mk(rbox(.92, .14, .92, .05, 2), red, 0, .07, 0, b); mk(rbox(.82, 2.25, .82, .06, 2), red, 0, 1.25, 0, b);
    [0, Math.PI / 2, -Math.PI / 2].forEach(ry => { const f = new THREE.Group(); f.rotation.y = ry; b.add(f); mk(G_('pbgl', () => rbox(.56, 1.5, .02, .01, 1)), gl, 0, 1.22, .42, f); for (let k = 1; k < 8; k++) mk(G_('pbh', () => rbox(.56, .03, .03, .005, 1)), red, 0, .47 + k * .19, .43, f); [-1, 1].forEach(sg => mk(G_('pbv', () => rbox(.03, 1.5, .03, .005, 1)), red, sg * .1, 1.22, .43, f)); mk(G_('pbsign', () => rbox(.6, .14, .02, .01, 1)), C('#f6efe2', { emissive: '#f6efe2', emissiveIntensity: .1 }), 0, 2.2, .42, f); });
    mk(rbox(.92, .12, .92, .05, 2), red, 0, 2.42, 0, b); const dome = mk(new THREE.CylinderGeometry(.44, .44, .9, 16, 1, false, 0, Math.PI), red, 0, 2.48, 0, b); dome.rotation.set(0, 0, Math.PI / 2); dome.scale.set(.35, 1, 1);
    mk(sph(.07, 8), C('#e8c35a', { metalness: .5, roughness: .35 }), 0, 2.68, 0, b);
    colliders.push({ x, z, r: .62 }); sblob(x, z, .7);
    collectibles.push(['unicorn', x, z, 2.7, postAng]);
  }
  /* statue d'un petit terrier fidèle, sur son piédestal de granit, près de la fontaine */
  {
    const [x, z] = polar(G + .34, 3.45), st = at('statue', x, z, G + .34 + Math.PI), granite = C('#8a8a90'), br = C('#6a5638', { metalness: .55, roughness: .4 });
    mk(rbox(.62, .18, .62, .05, 2), granite, 0, .09, 0, st); mk(rbox(.46, .85, .46, .06, 2), granite, 0, .6, 0, st); mk(rbox(.56, .1, .56, .04, 2), granite, 0, 1.07, 0, st);
    const dg = new THREE.Group(); dg.position.y = 1.12; st.add(dg);
    mk(lump(sph(.12, 12), .008), br, 0, .14, 0, dg).scale.set(.8, .75, 1.25); mk(lump(sph(.085, 12), .006), br, 0, .27, .13, dg); mk(sph(.04, 8), br, 0, .25, .21, dg).scale.set(1, .8, 1.2);
    [-1, 1].forEach(sg => { mk(G_('tear', () => new THREE.ConeGeometry(.03, .07, 5)), br, sg * .045, .35, .12, dg); [-1, 1].forEach(fz => mk(G_('tleg', () => cyl(.025, .022, .1, 6)), br, sg * .05, .05, fz * .09, dg)); });
    mk(G_('ttail', () => cyl(.015, .01, .09, 6)), br, 0, .22, -.15, dg).rotation.x = -.6;
    colliders.push({ x, z, r: .45 }); sblob(x, z, .5);
  }
  collectibles.push(['unicorn', 0, 0, 2.15, G], ['unicorn', ...polar(4.37 + .05, 9.15), 0, 4.37], ['unicorn', ...polar(G - 2.4, 4.1), .6, G - 2.4 + Math.PI], ['unicorn', ...polar(G + 1.3 + .1, 8.1), 0, G]);
} else if (COUNTRY === 'pl') {
  /* pręgierz : la colonne gothique de la place */
  {
    const [x, z] = polar(G + Math.PI - .55, 5.6), pr = at('pillory', x, z, 0), sand = C('#cbbd9e');
    mk(rbox(1.1, .2, 1.1, .05, 2), sand, 0, .1, 0, pr); mk(rbox(.8, .2, .8, .05, 2), sand, 0, .3, 0, pr);
    mk(lump(cyl(.2, .24, 2.6, 8), .01), sand, 0, 1.7, 0, pr); mk(cyl(.32, .26, .25, 8), sand, 0, 3.1, 0, pr);
    mk(new THREE.ConeGeometry(.24, 1.1, 8), sand, 0, 3.8, 0, pr); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a2, b2]) => mk(G_('ppin2', () => new THREE.ConeGeometry(.06, .4, 6)), sand, a2 * .22, 3.4, b2 * .22, pr));
    mk(sph(.08, 8), C('#e8c35a', { metalness: .5, roughness: .35 }), 0, 4.38, 0, pr);
    colliders.push({ x, z, r: .6 }); sblob(x, z, .75);
  }
  /* kiosque à journaux */
  {
    const [x, z] = polar(postAng + .21, 9.2), k = at('kiosk', x, z, postAng + .21 + Math.PI), cream = C('#efe6d6'), red = C('#c8323c');
    mk(rbox(1.3, 2.0, 1.1, .1, 2), cream, 0, 1.0, 0, k); mk(rbox(1.5, .14, 1.3, .06, 2), red, 0, 2.06, 0, k); mk(rbox(1.36, .28, 1.16, .05, 2), red, 0, 1.82, 0, k);
    mk(rbox(1.0, .8, .06, .04, 1), darkGlass, 0, 1.25, .54, k); mk(rbox(1.1, .06, .3, .02, 1), cream, 0, .82, .64, k);
    ['#fff8ee', '#f2d27c', '#9cc4e0', '#fff8ee', '#e8a8c8'].forEach((c2, i) => { const n = mk(G_('news', () => rbox(.16, .22, .02, .005, 1)), C(c2), -.4 + i * .2, .98, .62, k); n.rotation.x = -.3; });
    colliders.push({ x, z, r: .85 }); sblob(x, z, .9);
    collectibles.push(['dwarf', ...polar(postAng + .34, 9.0), 0, postAng + Math.PI]);
  }
  /* Fiat 126p « Maluch » garé au bord de la place */
  {
    const ca = G - .25, [x, z] = polar(ca, 9.95), car = at('car', x, z, ca + Math.PI / 2), body = C('#8fc4dc', { roughness: .4 }), chrome = C('#d8dce0', { metalness: .6, roughness: .3 });
    mk(lump(rbox(1.25, .5, 2.15, .22, 3), .006), body, 0, .48, 0, car); mk(rbox(1.08, .44, 1.1, .18, 3), body, 0, .92, -.08, car);
    mk(rbox(1.12, .34, 1.0, .12, 2), darkGlass, 0, .93, -.08, car);
    [[-1, .7], [1, .7], [-1, -.7], [1, -.7]].forEach(([sx, sz]) => { const w = mk(G_('wheel', () => cyl(.2, .2, .14, 14)), C('#1a1a22'), sx * .58, .2, sz, car); w.rotation.z = Math.PI / 2; mk(G_('hub', () => cyl(.08, .08, .16, 10)), chrome, sx * .6, .2, sz, car).rotation.z = Math.PI / 2; });
    [-1, 1].forEach(sz => mk(G_('bump', () => rbox(1.2, .07, .06, .03, 1)), chrome, 0, .32, sz * 1.08, car)); [-1, 1].forEach(sx => mk(G_('head', () => sph(.07, 8)), C('#fff8e0', { emissive: '#fff4c8', emissiveIntensity: .2 }), sx * .4, .58, 1.08, car));
    colliders.push({ x, z, r: 1.0 }); sblob(x, z, 1.3, .8, ca + Math.PI / 2);
  }
  collectibles.push(['dwarf', ...polar(G + .3, 1.86), .72, G + .3], ['dwarf', ...polar(3.31 + .04, 9.1), 0, 3.31 + Math.PI], ['dwarf', ...polar(G + Math.PI + .2, 9.2), 0, G], ['dwarf', ...polar(a0 + span + .09, 9.3), 0, a0 + span + Math.PI]);
}
/* figurines à collectionner : licornes (l'animal national écossais) ou krasnale en bronze (Wrocław) */
collectibles.forEach(([id, x, z, y, ry], n) => {
  const f = at(id, x, z, ry, y); f.userData.collect = id + n; f.userData.dyn = true;
  if (id === 'unicorn') {
    const w = C('#fffaf0', { roughness: .4 }), mane = C(['#f2b6d0', '#c8b6f0', '#a8d8f0'][n % 3], { roughness: .4 }), s2 = n === 1 ? 1.1 : .9; f.scale.setScalar(s2);
    mk(G_('ubody', () => lump(sph(.09, 12), .004)), w, 0, .19, 0, f).scale.set(.8, .75, 1.3);
    [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([a2, b2]) => mk(G_('uleg', () => cyl(.018, .015, .13, 6)), w, a2 * .04, .065, b2 * .07, f));
    mk(G_('uneck', () => cyl(.03, .04, .12, 8)), w, 0, .27, .09, f).rotation.x = .5; mk(G_('uhead', () => sph(.045, 10)), w, 0, .33, .13, f).scale.set(.9, .9, 1.3);
    mk(G_('uhorn', () => new THREE.ConeGeometry(.012, .08, 6)), C('#e8c35a', { roughness: .4 }), 0, .39, .16, f).rotation.x = .5;
    for (let k = 0; k < 3; k++) mk(G_('umane', () => sph(.025, 8)), mane, 0, .34 - k * .04, .08 - k * .02, f);
    mk(G_('utail', () => sph(.03, 8)), mane, 0, .2, -.13, f).scale.set(.8, 1.2, 1.2);
  } else {
    const br = C('#8a6a3a', { metalness: .55, roughness: .4 }), sit = y > .5; f.scale.setScalar(1.05);
    [-1, 1].forEach(sg => mk(G_('kboot', () => sph(.035, 8)), br, sg * .035, sit ? .02 : .02, sit ? .06 : .01, f).scale.set(1, .7, 1.4));
    mk(G_('kbody', () => cyl(.05, .07, .13, 10)), br, 0, sit ? .05 : .11, 0, f); mk(G_('kbelly', () => sph(.06, 10)), br, 0, sit ? .08 : .14, .02, f);
    mk(G_('khead', () => sph(.05, 10)), br, 0, sit ? .17 : .23, .01, f); mk(G_('kbeard', () => sph(.04, 8)), br, 0, sit ? .14 : .2, .04, f).scale.set(1, 1.1, .7);
    mk(G_('khat', () => new THREE.ConeGeometry(.05, .12, 8)), br, 0, sit ? .26 : .32, -.01, f).rotation.x = -.25;
    const prop = n % 4;
    if (prop === 0) mk(G_('kbook', () => rbox(.07, .05, .02, .005, 1)), br, 0, sit ? .1 : .16, .08, f);
    if (prop === 1) mk(G_('kring', () => new THREE.TorusGeometry(.04, .012, 6, 12)), br, .07, sit ? .1 : .16, .04, f);
    if (prop === 2) { const bm = mk(G_('kbroom', () => cyl(.006, .006, .3, 5)), br, .07, .15, .02, f); bm.rotation.z = .2; }
    if (prop === 3) mk(G_('klant', () => rbox(.04, .06, .04, .01, 1)), br, .07, sit ? .1 : .15, .04, f);
  }
});

/* ---------- pigeons ---------- */
const pigeons = [];
for (let i = 0; i < (COUNTRY === 'pl' ? 11 : 6); i++) {
  const a = rnd(0, TAU), r = rnd(2.6, 3.0), p = item('pigeon'); p.position.set(Math.sin(a) * r, .14, Math.cos(a) * r); p.rotation.y = rnd(0, TAU);
  const body = mk(sph(.13, 14), C('#8a93a8'), 0, .14, 0, p); body.scale.set(1, .85, 1.4);
  const head = new THREE.Group(); head.position.set(0, .25, .13); p.add(head);
  mk(sph(.075, 12), C('#6f7890'), 0, 0, 0, head); mk(new THREE.ConeGeometry(.025, .07, 6), C('#e8a03a'), 0, -.01, .08, head).rotation.x = Math.PI / 2;
  [-1, 1].forEach(sg => mk(sph(.015, 6), C('#1a1a22'), sg * .04, .02, .055, head));
  p.userData.dyn = true; pigeons.push({ p, head, ph: rnd(0, 10) });
}

/* ---------- habitants en pâte, version sculptée ---------- */
const EYE_W = C('#ffffff', { roughness: .25, bumpScale: 0 }), PUPIL = C('#120e18', { roughness: .1, bumpScale: 0 }), SHINE = new THREE.MeshBasicMaterial({ color: '#ffffff' });
function hair(lk, head, m) {
  const cap = mk(G_('hcap2', () => lump(new THREE.SphereGeometry(.305, 26, 16, 0, TAU, 0, Math.PI * .56), .006)), m, 0, .03, -.025, head); cap.rotation.x = -.3;
  if (lk.fringe) for (let i = 0; i < 5; i++) { const x = -.16 + i * .08, f = mk(G_('fr', () => lump(sph(.07, 10), .004)), m, x, .17 - Math.abs(x) * .3, .2 - Math.abs(x) * .25, head); f.scale.set(.9, .6, .7); f.rotation.z = -x * 1.5; }
  if (lk.style === 'bun') { mk(G_('bun2', () => lump(sph(.13, 16), .008)), m, 0, .27, -.15, head); const coil = mk(G_('coil', () => new THREE.TorusGeometry(.1, .03, 8, 18)), m, 0, .22, -.12, head); coil.rotation.x = Math.PI / 2 - .5; }
  if (lk.style === 'curly') for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, up = i % 2 ? .18 : .06; mk(G_('curl2', () => lump(sph(.105, 10), .006)), m, Math.cos(a) * .25, up + Math.sin(i * 1.3) * .03, Math.sin(a) * .23 - .05, head); }
  if (lk.style === 'bob') { [-1, 1].forEach(sg => mk(G_('bob2', () => lump(sph(.16, 14), .006)), m, sg * .22, -.06, -.05, head).scale.set(.7, 1.25, 1.05)); mk(G_('bobb', () => sph(.2, 14)), m, 0, -.02, -.16, head).scale.set(1.25, 1.1, .7); }
  if (lk.style === 'short') { mk(G_('side', () => sph(.12, 10)), m, .21, .1, .02, head).scale.set(.6, .8, 1.2); }
  if (lk.style === 'beret') { [-1, 1].forEach(sg => mk(G_('tuft', () => lump(sph(.08, 10), .006)), m, sg * .26, -.02, -.04, head)); const b = mk(G_('beret', () => lump(cyl(.26, .28, .08, 22), .004)), C(lk.hat), .03, .27, -.02, head); b.rotation.z = .22; mk(sph(.035, 8), C(lk.hat), .07, .33, -.02, head); }
  if (lk.style === 'flatcap') { [-1, 1].forEach(sg => mk(G_('tuft', () => lump(sph(.08, 10), .006)), m, sg * .26, -.02, -.04, head)); const fc = mk(G_('fcap', () => lump(sph(.3, 18), .004)), C(lk.hat), 0, .19, -.03, head); fc.scale.set(1.04, .4, 1.1); const v = mk(G_('fvis', () => cyl(.17, .17, .025, 16)), C(shade(lk.hat, -.06)), 0, .16, .2, head); v.scale.set(1, 1, .55); v.rotation.x = .14; }
  if (lk.style === 'cap') { mk(G_('capdome2', () => new THREE.SphereGeometry(.31, 22, 10, 0, TAU, 0, Math.PI * .45)), C(lk.hat), 0, .07, 0, head); const v = mk(G_('visor', () => cyl(.2, .2, .03, 18)), C(shade(lk.hat, -.05)), 0, .09, .2, head); v.scale.set(1, 1, .7); mk(sph(.03, 8), C(shade(lk.hat, .1)), 0, .37, 0, head); }
  if (lk.mustache) [-1, 1].forEach(sg => { const ms = mk(G_('must', () => lump(sph(.055, 10), .004)), m, sg * .05, -.075, .255, head); ms.scale.set(1.3, .6, .6); ms.rotation.z = sg * .35; });
}
function makeChar(lk) {
  const g = new THREE.Group(), P = {};
  const skinM = C(lk.skin, { roughness: .48, emissive: lk.skin, emissiveIntensity: .07 }), clothM = C(lk.shirt), pantM = C(lk.pants || '#3a3a4a'), hairM = C(lk.hair, { roughness: .5 });
  const shoeM = C(lk.shoes || '#4a3326'), soleM = C('#f4efe6');
  P.shadow = blob(0, 0, .42, g, .012);
  P.legs = [-1, 1].map(sg => { const pv = new THREE.Group(); pv.position.set(sg * .1, .42, 0); g.add(pv); mk(G_('leg2', () => rbox(.16, .32, .18, .075, 3)), pantM, 0, -.16, 0, pv); const s = new THREE.Group(); s.position.set(0, -.35, .045); pv.add(s); mk(G_('shoe2', () => lump(sph(.11, 14), .004)), shoeM, 0, .025, 0, s).scale.set(1, .62, 1.45); mk(G_('sole', () => cyl(.1, .1, .03, 14)), soleM, 0, -.03, .01, s).scale.set(1, 1, 1.45); return pv; });
  const body = new THREE.Group(); body.position.y = .42; g.add(body); P.body = body;
  mk(G_('torso2', () => lump(new THREE.CylinderGeometry(.19, .25, .5, 22, 4), .005)), clothM, 0, .3, 0, body).scale.z = .8;
  mk(G_('belly', () => sph(.25, 20)), clothM, 0, .07, 0, body).scale.set(1, .48, .8);
  if (lk.outfit === 'dress') mk(G_('skirt', () => lump(new THREE.CylinderGeometry(.24, .37, .32, 22, 2), .005)), clothM, 0, .0, 0, body).scale.z = .86;
  if (lk.outfit === 'cardigan') { [-1, 1].forEach(sg => { const l = mk(G_('lapel', () => rbox(.07, .38, .04, .02, 1)), C(shade(lk.shirt, -.08)), sg * .06, .3, .19, body); l.rotation.z = sg * .14; }); mk(rbox(.11, .08, .04, .02, 1), C(shade(lk.shirt, -.1)), .11, .12, .2, body); }
  if (lk.outfit === 'hoodie') { mk(G_('hood', () => lump(sph(.2, 14), .008)), clothM, 0, .55, -.14, body).scale.set(1.15, .65, .75); [-1, 1].forEach(sg => mk(G_('cord', () => cyl(.012, .012, .16, 6)), C('#fff8ee'), sg * .055, .43, .19, body)); mk(rbox(.24, .11, .04, .03, 2), C(shade(lk.shirt, -.08)), 0, .1, .2, body); }
  mk(G_('collar', () => new THREE.TorusGeometry(.12, .035, 8, 18)), C(lk.collar || shade(lk.shirt, .12)), 0, .55, 0, body).rotation.x = Math.PI / 2;
  if (lk.apron) { mk(rbox(.32, .4, .05, .05, 2), C(lk.apron), 0, .18, .2, body); mk(G_('apronTie', () => new THREE.TorusGeometry(.215, .012, 6, 24)), C(lk.apron), 0, .3, 0, body).rotation.x = Math.PI / 2; }
  if (lk.stripes) for (let i = 0; i < 3; i++) { const y = .16 + i * .12, r = .25 - (y / .5) * .06 + .005; const s = mk(new THREE.TorusGeometry(r, .02, 6, 24), C(lk.stripes), 0, y + .05, 0, body); s.rotation.x = Math.PI / 2; s.scale.y = .8; }
  if (lk.buttons) for (let i = 0; i < 3; i++) mk(G_('btn', () => sph(.022, 6)), C(lk.buttons), 0, .12 + i * .12, .2, body);
  if (lk.scarf) { const sc = mk(G_('scarf', () => lump(new THREE.TorusGeometry(.15, .065, 8, 18), .005)), C(lk.scarf), 0, .56, 0, body); sc.rotation.x = Math.PI / 2; mk(rbox(.11, .28, .05, .04, 2), C(lk.scarf), .09, .4, .19, body).rotation.z = .15; }
  if (lk.backpack) { mk(rbox(.34, .38, .17, .08, 3), C(lk.backpack), 0, .3, -.24, body); [-1, 1].forEach(sg => mk(rbox(.045, .38, .03, .02, 1), C(shade(lk.backpack, -.15)), sg * .12, .32, .19, body)); }
  P.hands = [];
  [-1, 1].forEach(sg => mk(G_('shoulder', () => sph(.085, 12)), clothM, sg * .24, .5, 0, body).scale.set(1, .85, .95));
  P.arms = [-1, 1].map(sg => { const pv = new THREE.Group(); pv.position.set(sg * .27, .5, 0); body.add(pv); mk(G_('arm2', () => rbox(.12, .34, .13, .055, 3)), clothM, 0, -.15, 0, pv); if (lk.rolled) mk(G_('cuff', () => cyl(.068, .068, .05, 10)), C(shade(lk.shirt, .08)), 0, -.3, 0, pv); const h = new THREE.Group(); h.position.y = -.37; pv.add(h); P.hands.push(h); mk(G_('palm', () => sph(.066, 12)), skinM, 0, 0, 0, h).scale.set(1, 1.1, .8); mk(G_('thumb', () => sph(.03, 8)), skinM, -sg * .045, .03, .03, h); pv.rotation.z = sg * .1; return pv; });
  if (lk.hold === 'flower') { const f = new THREE.Group(); f.position.set(0, -.4, .06); P.arms[1].add(f); mk(cyl(.012, .012, .32, 6), C(PAL.leaf), 0, .12, 0, f); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; mk(G_('pet', () => sph(.04, 8)), C('#e2374f'), Math.cos(a) * .04, .3, Math.sin(a) * .04, f); } mk(sph(.03, 8), C('#ffd35a'), 0, .31, 0, f); }
  mk(G_('neck', () => cyl(.07, .08, .1, 12)), skinM, 0, .61, 0, body);
  const head = new THREE.Group(); head.position.y = .9; body.add(head); P.head = head;
  mk(G_('head2', () => { const s = sph(.28, 30), p = s.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), k = y < 0 ? 1 - (-y / .28) * .14 : 1; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); } s.computeVertexNormals(); return s; }), skinM, 0, 0, 0, head).scale.set(1, .98, .95);
  [-1, 1].forEach(sg => mk(G_('ear', () => sph(.06, 10)), skinM, sg * .27, -.01, -.01, head).scale.set(.45, 1, .8));
  P.lids = [];
  P.eyes = [-1, 1].map(sg => { const e = new THREE.Group(); e.position.set(sg * .1, .03, .218); head.add(e);
    mk(G_('eyeW2', () => sph(.068, 16)), EYE_W, 0, 0, 0, e).scale.z = .55;
    mk(G_('iris', () => sph(.043, 14)), C(lk.eyes || '#5a3a22', { roughness: .15, bumpScale: 0 }), 0, -.004, .026, e).scale.z = .5;
    mk(G_('pup2', () => sph(.026, 10)), PUPIL, 0, -.006, .036, e).scale.z = .5;
    mk(G_('shine2', () => sph(.014, 6)), SHINE, .016, .018, .045, e); mk(G_('shine3', () => sph(.007, 6)), SHINE, -.012, -.016, .044, e);
    const lw = new THREE.Group(); lw.scale.z = .85; e.add(lw); const lid = new THREE.Group(); lw.add(lid); mk(G_('lid', () => new THREE.SphereGeometry(.074, 16, 8, 0, TAU, 0, Math.PI / 2)), skinM, 0, 0, 0, lid); lid.rotation.x = -1.25; P.lids.push(lid);
    if (lk.lashes) { const l = mk(G_('lash', () => new THREE.TorusGeometry(.066, .009, 4, 10, Math.PI * .8)), PUPIL, 0, .006, .02, e); l.rotation.z = Math.PI * .1 + (sg < 0 ? 0 : 0); }
    return e; });
  P.brows = [-1, 1].map(sg => { const bg = new THREE.Group(); bg.position.set(sg * .1, .125, .235); head.add(bg); mk(G_('brow2', () => rbox(.1, .028, .025, .012, 1)), C(shade(lk.hair, -.12)), 0, 0, 0, bg).rotation.z = -sg * .18; return bg; });
  mk(G_('nose2', () => sph(.045, 12)), C(shade(lk.skin, -.05), { roughness: .45, emissive: lk.skin, emissiveIntensity: .07 }), 0, -.035, .265, head).scale.set(1, .9, 1.05);
  [-1, 1].forEach(sg => mk(G_('cheek', () => sph(.052, 10)), C('#ff8f8f', { roughness: .5 }), sg * .16, -.07, .2, head).scale.set(1, .68, .4));
  const mouth = new THREE.Group(); mouth.position.set(0, -.115, .238); head.add(mouth); P.mouth = mouth;
  const sm = mk(G_('smile2', () => new THREE.TorusGeometry(.05, .013, 6, 14, Math.PI)), C('#7a2a2a', { bumpScale: 0 }), 0, .01, 0, mouth); sm.rotation.z = Math.PI; sm.userData.keep = true; P.smile = sm;
  P.open = new THREE.Group(); mouth.add(P.open); mk(G_('mopen2', () => sph(.045, 12)), C('#5a1a1a', { bumpScale: 0 }), 0, -.005, 0, P.open).scale.z = .4; mk(G_('teeth', () => rbox(.05, .014, .01, .004, 1)), C('#ffffff', { bumpScale: 0 }), 0, .03, .014, P.open); P.open.scale.set(1, .01, 1);
  hair(lk, head, hairM);
  if (lk.tote) {
    const t = new THREE.Group(); t.position.set(-.3, .08, -.1); t.rotation.z = .08; body.add(t);
    mk(rbox(.22, .24, .07, .03, 2), C(lk.tote), 0, 0, 0, t);
    mk(rbox(.03, .46, .02, .01, 1), C(shade(lk.tote, -.1)), .06, .26, -.01, t).rotation.z = -.35;
    const bq = mk(G_('bag', () => cyl(.022, .022, .46, 8)), C('#d9a05a'), -.03, .2, .01, t); bq.rotation.z = .3; bq.scale.set(1.15, 1, 1.15);
    [-.06, .06].forEach(o => mk(G_('bagcut', () => rbox(.03, .012, .03, .005, 1)), C('#f2d29a'), -.03 - o * .3, .2 + o, .035, t).rotation.z = .3);
  }
  if (lk.balloon) {
    const bl = new THREE.Group(); g.add(bl); P.balloon = bl;
    mk(cyl(.004, .004, 1.35, 4), C('#fff8ee', { bumpScale: 0 }), 0, .67, 0, bl);
    const ball = mk(sph(.17, 16), C(lk.balloon, { roughness: .25, bumpScale: 0, emissive: lk.balloon, emissiveIntensity: .12 }), 0, 1.53, 0, bl); ball.scale.set(1, 1.15, 1);
    mk(G_('knot', () => cyl(.02, .035, .04, 8)), C(lk.balloon, { bumpScale: 0 }), 0, 1.35, 0, bl);
  }
  return { g, P };
}
const bubbleT = tex(128, 128, (g) => { g.fillStyle = '#fff8ee'; g.beginPath(); g.arc(64, 56, 46, 0, TAU); g.fill(); g.beginPath(); g.moveTo(48, 92); g.lineTo(60, 122); g.lineTo(74, 94); g.fill(); g.fillStyle = '#2a2233'; [40, 64, 88].forEach(x => { g.beginPath(); g.arc(x, 56, 8, 0, TAU); g.fill(); }); });
const questT = tex(128, 128, (g) => { g.fillStyle = '#ffb547'; g.beginPath(); g.arc(64, 56, 48, 0, TAU); g.fill(); g.beginPath(); g.moveTo(48, 94); g.lineTo(60, 124); g.lineTo(76, 96); g.fill(); g.strokeStyle = '#fff8ee'; g.lineWidth = 6; g.beginPath(); g.arc(64, 56, 44, 0, TAU); g.stroke(); g.fillStyle = '#1d2142'; g.font = '800 64px "Baloo 2",Nunito,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('!', 64, 60); });
const heartT = tex(128, 128, (g) => { g.fillStyle = '#ff6f91'; g.strokeStyle = '#fff8ee'; g.lineWidth = 7; g.beginPath(); g.moveTo(64, 108); g.bezierCurveTo(10, 70, 18, 18, 64, 40); g.bezierCurveTo(110, 18, 118, 70, 64, 108); g.closePath(); g.fill(); g.stroke(); });
const people = [];
function person(id, lk, mode, x, z, rot, extra) {
  const c = makeChar(lk), grp = item(id === 'passerby' ? 'npc:passerby' : 'npc:' + id);
  grp.add(c.g); grp.position.set(x, 0, z); grp.rotation.y = rot;
  let bub = null;
  if (id !== 'passerby') { bub = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubbleT, depthWrite: false })); bub.scale.set(.42, .42, 1); bub.position.set(0, 1.78, 0); grp.add(bub); }
  grp.userData.dyn = true;
  const o = Object.assign({ id, grp, c, mode, base: rot, bub, t: rnd(0, 10), blink: rnd(1, 4), wave: 0, talk: false, waved: false }, extra || {});
  if (mode === 'sit') { c.P.legs.forEach(l => { l.rotation.x = -1.45; }); c.g.position.y = .12; c.P.shadow.visible = false; } else c.g.position.y = .03;
  people.push(o); return o;
}
const SK = ['#f6d3b5', '#e8b48e', '#c98e6a', '#8a5a3c'];
B.forEach((sp, i) => { if (sp.id !== 'florist') return; const a = a0 + span * i / (B.length - 1) + .1; person('rosa', { skin: SK[0], hair: '#c2452e', style: 'bun', fringe: true, lashes: true, eyes: '#3f7a4a', outfit: 'dress', shirt: PAL.walls[4], collar: '#fff8ee', apron: PAL.leaf, pants: '#f6d3b5', shoes: '#7a3a2a', hold: 'flower' }, 'idle', Math.sin(a) * 8.6, Math.cos(a) * 8.6, a + Math.PI); });
{ const a = G + 1.2, bx = Math.sin(a) * 4.15, bz = Math.cos(a) * 4.15; person('leo', { skin: SK[1], hair: '#ece8e0', style: COUNTRY === 'fr' ? 'beret' : 'flatcap', hat: COUNTRY === 'gb' ? '#6a5e48' : COUNTRY === 'pl' ? '#4a4a55' : '#3a4a6a', mustache: true, eyes: '#3a5a8a', outfit: 'cardigan', shirt: '#9a6a44', buttons: '#e8c35a', scarf: PAL.walls[0], pants: '#4a4a5a', shoes: '#3a2a22' }, 'sit', bx, bz, a); }
person('maya', { skin: SK[3], hair: '#1a1a22', style: 'curly', lashes: true, eyes: '#3a2418', outfit: 'hoodie', shirt: PAL.walls[1], backpack: PAL.accent, pants: '#2f3a5a', shoes: '#f4efe6' }, 'walk', 0, 7.2, 0, { r: 7.2, a: 1.2, sp: .055, pause: 0 });
{ const a = G - .55, r = 5.6 - .95; person('sam', { skin: SK[2], hair: '#3a2418', style: 'cap', hat: PAL.roofs[0], mustache: true, eyes: '#3a2418', shirt: '#f3efe6', stripes: PAL.roofs[0], rolled: true, apron: '#c99a62' }, 'idle', Math.sin(a) * r, Math.cos(a) * r, a); }
[[SK[0], '#e8c070', 'bob', PAL.walls[4], '#3a3a4a', 'dress'], [SK[2], '#2a1a12', 'short', PAL.roofs[1], '#5a4a3a', 'cardigan'], [SK[1], '#8a3a1e', 'bun', PAL.walls[2], '#3a3a5a', 'hoodie']].forEach(([s, h, st, sh, pa, of], i) => person('passerby', { skin: s, hair: h, style: st, fringe: i !== 1, shirt: sh, pants: pa, outfit: of, lashes: i !== 1, tote: i === 0 ? '#efe3cf' : null, balloon: i === 2 ? '#e8423a' : null }, 'walk', 0, 0, 0, { r: i === 1 ? 6.6 : rnd(6.5, 8.2), a: rnd(0, TAU), sp: (i === 1 ? .05 : rnd(.05, .085)) * (i % 2 ? 1 : -1), pause: 0, dog: i === 1 }));
const walkers = [];

/* ---------- un chien en laisse (avec un passant) et un chat qui dort sur un banc ---------- */
function makeDog() {
  const d = item('dog'), tan = C('#c98a4a'), dark = C('#8a5a32'), white = C('#f6efe2'), P = {};
  d.userData.dyn = true;
  const body = mk(G_('dbody', () => lump(sph(.16, 16), .006)), tan, 0, .3, 0, d); body.scale.set(.8, .72, 1.35);
  mk(G_('dchest', () => sph(.1, 12)), white, 0, .3, .14, d).scale.set(.9, .9, .8);
  const head = new THREE.Group(); head.position.set(0, .42, .25); d.add(head); P.head = head;
  mk(G_('dhead', () => lump(sph(.12, 16), .004)), tan, 0, 0, 0, head);
  mk(G_('dsnout', () => sph(.065, 12)), white, 0, -.035, .1, head).scale.set(1, .8, 1.15);
  mk(G_('dnose', () => sph(.026, 8)), C('#1a1418', { roughness: .2, bumpScale: 0 }), 0, -.015, .17, head);
  [-1, 1].forEach(sg => { mk(G_('deye', () => sph(.018, 8)), C('#1a1418', { roughness: .15, bumpScale: 0 }), sg * .05, .03, .1, head); const e = mk(G_('dear', () => lump(rbox(.06, .13, .03, .015, 2), .004)), dark, sg * .1, -.0, -.01, head); e.rotation.set(0, 0, sg * .35); });
  mk(G_('dcol', () => new THREE.TorusGeometry(.085, .02, 6, 16)), C('#d8323c'), 0, .38, .17, d).rotation.x = Math.PI / 2 - .5;
  P.legs = [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz]) => { const l = new THREE.Group(); l.position.set(sx * .075, .2, sz * .15); d.add(l); mk(G_('dleg', () => cyl(.035, .03, .2, 8)), tan, 0, -.1, 0, l); mk(G_('dpaw', () => sph(.04, 8)), white, 0, -.2, .015, l).scale.set(1, .6, 1.2); return l; });
  const tail = new THREE.Group(); tail.position.set(0, .36, -.2); d.add(tail); P.tail = tail;
  mk(G_('dtail', () => cyl(.022, .012, .17, 8)), tan, 0, .08, 0, tail); tail.rotation.x = -.7;
  blob(0, 0, .3, d, .012);
  return { d, P, t: 0, moving: false };
}
const dog = makeDog();
{ const o = people.find(p => p.dog); dog.d.position.set(Math.sin(o.a) * (o.r - .25), 0, Math.cos(o.a) * (o.r - .25)); }
const leash = mk(new THREE.CylinderGeometry(.008, .008, 1, 4, 1).translate(0, .5, 0), C('#d8323c', { bumpScale: 0 }), 0, 0, 0); leash.userData.keep = true; leash.userData.noCast = true;
{
  const a = G - 1.2, cat = item('cat'); cat.position.set(Math.sin(a) * 4.1, .58, Math.cos(a) * 4.1); cat.rotation.y = a + Math.PI + .25;
  const fur = C('#df7a2c'), stripe = C('#a8501f'), cream = C('#fbe6c8');
  /* roulé en boule, tête posée sur les pattes vers l'avant du banc, yeux fermés ; il respire */
  const breath = new THREE.Group(); cat.add(breath);
  mk(G_('cbody', () => lump(sph(.17, 16), .006)), fur, 0, .085, .02, breath).scale.set(1.3, .6, 1);
  [-.12, -.02, .08].forEach(x => { const st = mk(G_('cstr2', () => new THREE.TorusGeometry(.158, .012, 4, 14, Math.PI)), stripe, x, .085, .02, breath); st.rotation.y = Math.PI / 2; st.scale.set(1, .64, 1.05); });
  const tl = mk(G_('ctail', () => new THREE.TorusGeometry(.2, .036, 6, 18, Math.PI * 1.15)), fur, .02, .035, .02, cat); tl.rotation.set(Math.PI / 2, 0, -.2);
  [-1, 1].forEach(sg => mk(G_('cpaw', () => sph(.038, 8)), cream, -.1 + sg * .05, .025, -.15, cat).scale.set(1, .6, 1.3));
  const hd = new THREE.Group(); hd.position.set(-.1, .1, -.13); cat.add(hd);
  mk(G_('chead2', () => lump(sph(.088, 14), .004)), fur, 0, 0, 0, hd).scale.set(1.05, .88, .95);
  mk(G_('cmuz2', () => sph(.038, 8)), cream, 0, -.028, -.07, hd).scale.set(1.1, .75, .8);
  mk(G_('cnose', () => sph(.012, 6)), C('#d86a7a', { bumpScale: 0 }), 0, -.012, -.1, hd);
  [-1, 1].forEach(sg => {
    const e = mk(G_('cear2', () => new THREE.ConeGeometry(.034, .065, 4)), fur, sg * .048, .072, .005, hd); e.rotation.z = -sg * .28;
    const ey = mk(G_('ceye2', () => new THREE.TorusGeometry(.016, .005, 4, 8, Math.PI)), C('#3a2418', { bumpScale: 0 }), sg * .035, .012, -.078, hd); ey.rotation.z = Math.PI;
  });
  hd.rotation.set(.15, -.2, .25);
  cat.userData.breath = breath; cat.userData.head = hd;
  var catObj = cat;
}

/* ---------- nuages et petites îles ---------- */
const clouds = [];
for (let i = 0; i < 6; i++) {
  const c = item('cloud'); const r = rnd(52, 72), a = rnd(0, TAU), y = rnd(8, 22); c.position.set(Math.sin(a) * r, y, Math.cos(a) * r); c.scale.setScalar(rnd(1.3, 1.9));
  const cm = C('#ffffff', { roughness: 1 });
  for (let j = 0; j < 5; j++) mk(lump(sph(rnd(1.2, 2.2), 16), .08, 1), cm, rnd(-2.5, 2.5), rnd(-.4, .6), rnd(-1, 1), c);
  c.userData.dyn = true; clouds.push({ c, r, a, y, sp: rnd(.004, .009) });
}
[[38, 2, -20], [-34, -3, -26], [-30, 5, 24]].forEach(([x, y, z], i) => {
  const isl = new THREE.Group(); isl.position.set(x, y, z); scene.add(isl);
  mk(cyl(2.4, 2.4, .5, 22), [C(EARTH), C(shade(PAL.leaf, .1)), C(EARTH)], 0, 0, 0, isl);
  mk(lump(new THREE.ConeGeometry(2.3, 3, 16, 3), .15), C(shade(EARTH, -.08)), 0, -1.75, 0, isl).rotation.x = Math.PI;
  const t = new THREE.Group(); t.position.y = .25; isl.add(t); mk(cyl(.12, .16, 1.2, 8), C('#8a5a3a'), 0, .6, 0, t); mk(lump(sph(.8, 16), .05), C(shade(PAL.leaf, i * .05)), 0, 1.6, 0, t);
});

/* ---------- ambiance : pollen le jour, lucioles la nuit, feuilles, fumée, oiseaux, gouttes ---------- */
const dotT = tex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.4, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
const MOTES = mobile ? 90 : 170, moteP = new Float32Array(MOTES * 3), moteS = [];
for (let i = 0; i < MOTES; i++) { const a = rnd(0, TAU), r = Math.sqrt(Math.random()) * 11; moteP.set([Math.sin(a) * r, rnd(.3, 4.5), Math.cos(a) * r], i * 3); moteS.push(rnd(0, 10)); }
const moteGeo = new THREE.BufferGeometry(); moteGeo.setAttribute('position', new THREE.BufferAttribute(moteP, 3));
const moteMat = new THREE.PointsMaterial({ map: dotT, size: .09, transparent: true, opacity: .5, depthWrite: false, blending: THREE.AdditiveBlending, color: '#fff2c8' });
const motes = new THREE.Points(moteGeo, moteMat); scene.add(motes);
const leafG = rbox(.13, .012, .09, .005, 1), leafM = C('#ffffff', { roughness: .7, bumpScale: 0 }), LEAVES = mobile ? 18 : 34;
const leafIM = new THREE.InstancedMesh(leafG, leafM, LEAVES); leafIM.userData.dyn = true; scene.add(leafIM);
const trees = hits.filter(h => h.userData.id === 'tree'), leaves = [], lo = new THREE.Object3D(), lc = new THREE.Color();
function respawnLeaf(L) { const t = trees[(Math.random() * trees.length) | 0]; L.x = t.position.x + rnd(-.7, .7); L.z = t.position.z + rnd(-.7, .7); L.y = rnd(2, 3) * t.scale.x; L.vy = rnd(.25, .45); L.ph = rnd(0, TAU); L.ground = 0; }
for (let i = 0; i < LEAVES; i++) { const L = {}; respawnLeaf(L); L.y = rnd(0, 3); leaves.push(L); lc.set([shade(PAL.leaf, .05), '#e8893a', '#f2b33a', '#c9562e'][i % 4]); leafIM.setColorAt(i, lc); }
if (leafIM.instanceColor) leafIM.instanceColor.needsUpdate = true;
/* cheminée de la boulangerie et sa fumée */
const chimney = new THREE.Group(); bld.bakery.g.add(chimney); chimney.position.set(1.4, 7.2, -.6);
mk(rbox(.55, 1.4, .55, .12, 3), C(PAL.roofs[0]), 0, 0, 0, chimney); mk(rbox(.7, .18, .7, .08, 2), C(TRIM), 0, .72, 0, chimney);
const smokeM = [], puffs = [];
for (let i = 0; i < 7; i++) { const m = C('#f4f1ec', { unique: true, transparent: true, opacity: .0, roughness: 1, bumpScale: .02, depthWrite: false }); smokeM.push(m); const p = mk(G_('puff', () => lump(sph(.22, 12), .03)), m, 0, 0, 0, chimney); puffs.push({ p, t: i / 7 }); }
/* oiseaux */
const birds = [];
for (let i = 0; i < 5; i++) { const b = new THREE.Group(); scene.add(b); const body = mk(G_('bird', () => sph(.12, 10)), C('#3a3a48'), 0, 0, 0, b); body.scale.set(.8, .7, 1.6); const wings = [-1, 1].map(sg => { const w = new THREE.Group(); w.position.x = sg * .06; b.add(w); mk(G_('wing', () => rbox(.42, .03, .16, .015, 1)), C('#4a4a5a'), sg * .21, 0, 0, w); return w; }); b.userData.dyn = true; birds.push({ b, wings, a: rnd(0, TAU), r: rnd(15, 22), y: rnd(11, 16), sp: rnd(.12, .2), ph: rnd(0, 10) }); }
/* gouttes de la fontaine */
const DROPS = 50, dropP = new Float32Array(DROPS * 3), drops = [];
for (let i = 0; i < DROPS; i++) drops.push({ a: rnd(0, TAU), t: rnd(0, 1), v: rnd(.8, 1.2) });
const dropGeo = new THREE.BufferGeometry(); dropGeo.setAttribute('position', new THREE.BufferAttribute(dropP, 3));
const dropsPts = new THREE.Points(dropGeo, new THREE.PointsMaterial({ map: dotT, size: .07, transparent: true, opacity: .8, depthWrite: false, color: '#dff4ff' })); scene.add(dropsPts);
colliders.push(...people.filter(p => p.mode !== 'walk').map(p => ({ x: p.grp.position.x, z: p.grp.position.z, r: .45 })));

{ const im = new THREE.InstancedMesh(G_('blobG', () => new THREE.CircleGeometry(1, 24)), BLOB, sblobs.length), o = new THREE.Object3D();
  sblobs.forEach(([x, z, sx, sz, yw], i) => { o.position.set(x, .061, z); o.rotation.set(-Math.PI / 2, yw, 0, 'YXZ'); o.scale.set(sx, sz, 1); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
  im.renderOrder = 1; im.frustumCulled = false; scene.add(im); }

/* regroupement des objets immobiles : beaucoup moins d'appels de dessin */
PVClay.bake(scene);

/* ombres : sur téléphone, la carte d'ombre n'est recalculée que quand le soleil bouge (toutes les 5 s),
   et les personnages, oiseaux et feuilles n'en projettent pas (ils ont une ombre douce peinte au sol) */
const castOK = o => { if (o.userData.noCast) return false; if (mobile) for (let q = o; q; q = q.parent) if (q.userData.dyn) return false; return true; };
scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh) && o !== sky && o.material && !Array.isArray(o.material) && !o.material.transparent) { o.castShadow = castOK(o); o.receiveShadow = true; } });
/* les tout petits détails (yeux, boutons, dents…) ne projettent pas d'ombre */
scene.updateMatrixWorld(true);
{ const sc = new THREE.Vector3(); scene.traverse(o => { if (o.isMesh && !o.isInstancedMesh && o.castShadow && o.geometry) { if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); o.getWorldScale(sc); if (o.geometry.boundingSphere.radius * Math.max(sc.x, sc.y, sc.z) < .09) o.castShadow = false; } }); }
grass.receiveShadow = true;
if (mobile) { R.shadowMap.autoUpdate = false; R.shadowMap.needsUpdate = true; }

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
  lerpC(sun.color, a[4], b[4], t); sun.intensity = (a[5] + (b[5] - a[5]) * t) * 1.18;
  lerpC(hemi.color, a[6], b[6], t); lerpC(hemi.groundColor, a[7], b[7], t); hemi.intensity = (a[8] + (b[8] - a[8]) * t) * .64;
  lerpC(scene.fog.color, a[9], b[9], t).convertSRGBToLinear();
  lightsOn = a[10] + (b[10] - a[10]) * t; PVClay.U.day.value = 1 - lightsOn * .75; starMat.opacity = a[11] + (b[11] - a[11]) * t;
  const golden = Math.max(0, 1 - Math.abs(h - 18) / 2.2), dawn = Math.max(0, 1 - Math.abs(h - 7) / 1.5);
  GRADE.uniforms.tint.value.set(1 + golden * .06 + dawn * .03 - lightsOn * .06, 1 - lightsOn * .02, 1 - golden * .07 + lightsOn * .07);
  GRADE.uniforms.sat.value = 1.24 - lightsOn * .14;
  moteMat.color.set(lightsOn > .5 ? '#fff27a' : '#fff2c8'); moteMat.size = lightsOn > .5 ? .13 : .085;
  const day = h >= 6 && h <= 20, el = day ? Math.sin((h - 6) / 14 * Math.PI) : .55, az = (h / 24) * TAU + 1.2;
  const dir = day ? new THREE.Vector3(Math.cos(az) * Math.cos(el * 1.3), Math.max(.12, Math.sin(el * 1.25)), Math.sin(az) * Math.cos(el * 1.3)) : new THREE.Vector3(-Math.cos(az) * .6, .7, -Math.sin(az) * .6);
  dir.normalize(); skyU.sunDir.value.copy(dir); sun.position.copy(dir).multiplyScalar(45); sun.target.position.set(0, 0, 0);
  skyU.sunCol.value.copy(day ? sun.color : new THREE.Color('#dfe6ff')).convertSRGBToLinear().multiplyScalar(day ? 1 : .55);
  winMats.forEach(m => { m.emissiveIntensity = lightsOn * .95; }); shopGlass.emissiveIntensity = .22 + lightsOn * 1.05; clockMats.forEach(m => { m.emissiveIntensity = lightsOn * .28; });
  lampMats.forEach(m => { m.emissiveIntensity = .15 + lightsOn * 2.2; });
  halos.forEach(s => { s.material.opacity = lightsOn * .85; });
  lampLights.forEach(p => { p.intensity = lightsOn * 1.4; }); poolM.opacity = lightsOn * .5; if (signMat) signMat.emissiveIntensity = .05 + lightsOn * .3;
  R.shadowMap.needsUpdate = true;
  R.toneMappingExposure = .9 + lightsOn * .12;
  const hm = h % 12, mm = (h * 60) % 60;
  hands.forEach(([hh, mh]) => { hh.rotation.z = -(hm / 12) * TAU; mh.rotation.z = -(mm / 60) * TAU; });
}
const realHour = () => { const d = new Date(); return d.getHours() + d.getMinutes() / 60; };
let hourOverride = null;
applyHour(realHour());

/* ---------- déplacement à la première personne ---------- */
const pos = new THREE.Vector3(Math.sin(G) * 9.2, 1.45, Math.cos(G) * 9.2);
let yaw = G, pitch = -.06, tYaw = G, tPitch = -.06, target = null, bob = 0;
const vel = new THREE.Vector3(), wish = new THREE.Vector3();
let stuckT = 0;
const keys = {}, fwd = new THREE.Vector3(), right = new THREE.Vector3();
addEventListener('keydown', e => { if (!H.active() || /INPUT|SELECT|TEXTAREA/.test((e.target || {}).tagName || '')) return; keys[e.key.toLowerCase()] = true; });
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
function collide(p) {
  const dx = p.x, dz = p.z, d = Math.hypot(dx, dz);
  const ang = Math.atan2(dx, dz), onPath = Math.abs(Math.atan2(Math.sin(ang - G), Math.cos(ang - G))) < .09 || (d > 9 && Math.abs(Math.sin(ang - G) * d) < 1.1);
  const lim = onPath ? 14.2 : 9.3;
  if (d > lim) { p.x = dx / d * lim; p.z = dz / d * lim; }
  { const ex = p.x - dog.d.position.x, ez = p.z - dog.d.position.z, dd = Math.hypot(ex, ez); if (dd < .6 && dd > 1e-4) { p.x = dog.d.position.x + ex / dd * .6; p.z = dog.d.position.z + ez / dd * .6; } }
  people.forEach(o => { if (o.mode !== 'walk') return; const ex = p.x - o.grp.position.x, ez = p.z - o.grp.position.z, dd = Math.hypot(ex, ez), rr = .75; if (dd < rr && dd > 1e-4) { p.x = o.grp.position.x + ex / dd * rr; p.z = o.grp.position.z + ez / dd * rr; } });
  for (let it = 0; it < 4; it++) colliders.forEach(c => { const ex = p.x - c.x, ez = p.z - c.z, dd = Math.hypot(ex, ez), rr = c.r + .25; if (dd < rr && dd > 1e-4) { p.x = c.x + ex / dd * rr; p.z = c.z + ez / dd * rr; } });
}
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(), tip = $('hover');
let down = null, hov = null;
function pick(e) {
  const r = canvas.getBoundingClientRect(); ptr.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(ptr, cam);
  const hs = ray.intersectObjects(hits, true); if (!hs.length) return null;
  let o = hs[0].object; while (o && !o.userData.id) o = o.parent;
  return o ? { id: o.userData.id, point: hs[0].point, dist: hs[0].distance, obj: o } : null;
}
/* doigts et souris : un doigt = regarder (glisser) ou marcher / toucher (tap) ; deux doigts = zoom (pincer) ;
   molette = zoom. Pendant un geste à deux doigts, ni rotation ni clic parasite. */
const touches = new Map(); let pinch = null, multi = false, zoomT = 1, zoomV = 1;
const ZMIN = .5, ZMAX = 1.15, setZoom = z => { zoomT = Math.max(ZMIN, Math.min(ZMAX, z)); };
const spread = () => { const [a, b] = [...touches.values()]; return Math.hypot(a.x - b.x, a.y - b.y) || 1; };
canvas.addEventListener('pointerdown', e => {
  touches.set(e.pointerId, { x: e.clientX, y: e.clientY }); try { canvas.setPointerCapture(e.pointerId); } catch (er) { /* */ }
  if (touches.size === 1) { multi = false; down = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, moved: 0, id: e.pointerId }; }
  else { multi = true; down = null; if (touches.size === 2) pinch = { d: spread(), z: zoomT }; }
});
canvas.addEventListener('pointermove', e => {
  if (touches.has(e.pointerId)) touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (photo) return;
  if (pinch && touches.size >= 2) { setZoom(pinch.z * pinch.d / spread()); return; }
  if (down && down.id === e.pointerId) {
    const dx = e.clientX - down.lx, dy = e.clientY - down.ly; down.lx = e.clientX; down.ly = e.clientY; down.moved += Math.abs(dx) + Math.abs(dy);
    if (down.moved > 6) { const k = .0042 * zoomV; tYaw -= dx * k; tPitch = Math.max(-1.1, Math.min(1.0, tPitch - dy * k)); }
    return;
  }
  if (e.pointerType !== 'mouse') return;
  const p = pick(e), id = p && p.id !== 'square' ? p.id : null;
  if (id !== hov) hov = id;
  canvas.style.cursor = id ? 'pointer' : 'grab';
  if (id) { tip.textContent = H.label(id); tip.style.left = e.clientX + 'px'; tip.style.top = e.clientY + 'px'; tip.classList.remove('hidden'); } else tip.classList.add('hidden');
});
function lift(e) { touches.delete(e.pointerId); if (touches.size < 2) pinch = null; if (multi) { if (!touches.size) multi = false; down = null; return true; } return false; }
canvas.addEventListener('pointercancel', e => { lift(e); down = null; });
canvas.addEventListener('pointerup', e => {
  if (lift(e)) return;
  if (photo || !down || down.id !== e.pointerId) { down = null; return; }
  const moved = down.moved; down = null; if (moved > 8) return;
  const p = pick(e); if (!p) return;
  if (p.id === 'square') { target = new THREE.Vector3(p.point.x, 1.45, p.point.z); return; }
  H.pick(p.id, p.obj);
});
canvas.addEventListener('wheel', e => { if (photo) return; e.preventDefault(); setZoom(zoomT * (1 + Math.max(-.2, Math.min(.2, e.deltaY * .0012)))); }, { passive: false });
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
  if (on === photo) return; photo = on; tip.classList.add('hidden'); badges.forEach(b => { b.spr.visible = !on; });
  if (on) {
    saved = { pos: pos.clone(), yaw, pitch, fov: cam.fov };
    cam.fov = 34; cam.near = 6; cam.far = 600; cam.updateProjectionMatrix();
    cam.position.set(Math.sin(G + .35) * 38, 24, Math.cos(G + .35) * 38);
    if (!ctl) { ctl = new THREE.OrbitControls(cam, canvas); ctl.enablePan = false; ctl.enableDamping = true; ctl.minDistance = 22; ctl.maxDistance = 70; ctl.maxPolarAngle = 1.35; ctl.minPolarAngle = .35; }
    ctl.target.set(0, 2, 0); ctl.enabled = true; ctl.autoRotate = true; ctl.autoRotateSpeed = .5; ctl.update();
    canvas.addEventListener('pointerdown', stopAuto, { once: true });
    if (!composer) composer = makeComposer();
  } else {
    if (ctl) ctl.enabled = false;
    pos.copy(saved.pos); yaw = tYaw = saved.yaw; pitch = tPitch = saved.pitch; vel.set(0, 0, 0); target = null; cam.fov = saved.fov; cam.near = .2; cam.far = 420; cam.updateProjectionMatrix();
    hourOverride = null; applyHour(realHour());
  }
}
function stopAuto() { if (ctl) ctl.autoRotate = false; }
/* carte postale : cadre papier, titre rétro, timbre dessiné, cachet de la poste à la date du jour */
const POSTCARD = { gb: ['Greetings from', 'Edinburgh'], pl: ['Pozdrowienia z', 'Wrocławia'], fr: ['Bons baisers de', 'Petite Ville'] }[COUNTRY];
function stampArt(g, x, y, w, h) {
  g.save(); g.translate(x + w / 2, y + h / 2); const k = w / 100;
  if (COUNTRY === 'gb') { /* chardon */ g.strokeStyle = '#3f7a4a'; g.lineWidth = 6 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 40 * k); g.lineTo(0, -2 * k); g.moveTo(0, 22 * k); g.quadraticCurveTo(-26 * k, 14 * k, -30 * k, 26 * k); g.moveTo(0, 16 * k); g.quadraticCurveTo(24 * k, 6 * k, 30 * k, 18 * k); g.stroke(); g.fillStyle = '#6aa05a'; g.beginPath(); g.ellipse(0, -8 * k, 16 * k, 13 * k, 0, 0, TAU); g.fill(); g.fillStyle = '#8a4aa8'; for (let i = -3; i <= 3; i++) { g.beginPath(); g.ellipse(i * 5 * k, -28 * k, 5 * k, 15 * k, i * .18, 0, TAU); g.fill(); } }
  else if (COUNTRY === 'pl') { /* bonnet et barbe de krasnal */ g.fillStyle = '#d8323c'; g.beginPath(); g.moveTo(-24 * k, -4 * k); g.lineTo(4 * k, -44 * k); g.lineTo(24 * k, -4 * k); g.closePath(); g.fill(); g.fillStyle = '#f2c8a8'; g.beginPath(); g.arc(0, 6 * k, 18 * k, 0, TAU); g.fill(); g.fillStyle = '#fff8ee'; g.beginPath(); g.moveTo(-18 * k, 10 * k); g.quadraticCurveTo(0, 52 * k, 18 * k, 10 * k); g.closePath(); g.fill(); g.fillStyle = '#2a2233'; [-7, 7].forEach(e => { g.beginPath(); g.arc(e * k, 2 * k, 2.6 * k, 0, TAU); g.fill(); }); }
  else { /* croissant */ g.fillStyle = '#e0a050'; g.strokeStyle = '#a86a2a'; g.lineWidth = 3 * k; for (let i = -2; i <= 2; i++) { g.beginPath(); g.ellipse(i * 13 * k, Math.abs(i) * 7 * k, 11 * k, (18 - Math.abs(i) * 3) * k, i * .5, 0, TAU); g.fill(); g.stroke(); } }
  g.restore();
}
function snapshot() {
  if (composer) composer.render(); else R.render(scene, cam);
  const src = R.domElement, W = src.width, Hh = src.height, m = Math.round(Math.min(W, Hh) * .045);
  const out = document.createElement('canvas'); out.width = W + m * 2; out.height = Hh + m * 2; const g = out.getContext('2d');
  g.fillStyle = '#fbf3e4'; g.fillRect(0, 0, out.width, out.height); g.drawImage(src, m, m);
  g.strokeStyle = 'rgba(42,34,51,.18)'; g.lineWidth = 2; g.strokeRect(m, m, W, Hh);
  const u = Math.min(W, Hh) / 1000, disp = '"Baloo 2",Nunito,sans-serif';
  /* titre rétro en deux lignes, ombre portée */
  const f1 = Math.round(46 * u), f2 = Math.round(118 * u), tx = m + 40 * u, ty = m + 40 * u;
  g.textAlign = 'left'; g.textBaseline = 'top';
  g.font = 'italic 700 ' + f1 + 'px Georgia,serif'; g.fillStyle = 'rgba(29,33,66,.55)'; g.fillText(POSTCARD[0], tx + 3 * u, ty + 3 * u); g.fillStyle = '#fff8ee'; g.fillText(POSTCARD[0], tx, ty);
  g.font = '800 ' + f2 + 'px ' + disp; const y2 = ty + f1 * 1.05;
  g.lineJoin = 'round'; g.lineWidth = 14 * u; g.strokeStyle = '#1d2142'; g.strokeText(POSTCARD[1], tx, y2);
  g.fillStyle = '#ffb547'; g.fillText(POSTCARD[1], tx, y2);
  /* timbre dentelé */
  const sw = 150 * u, sh = 180 * u, sx = out.width - m - sw - 34 * u, sy = m + 30 * u;
  g.save(); g.shadowColor = 'rgba(0,0,0,.25)'; g.shadowBlur = 12 * u; g.fillStyle = '#fffaf0'; g.fillRect(sx, sy, sw, sh); g.restore();
  g.fillStyle = '#fbf3e4'; const r = 7 * u; for (let x = sx; x <= sx + sw; x += r * 2.4) { g.beginPath(); g.arc(x, sy, r, 0, TAU); g.arc(x, sy + sh, r, 0, TAU); g.fill(); } for (let y = sy; y <= sy + sh; y += r * 2.4) { g.beginPath(); g.arc(sx, y, r, 0, TAU); g.arc(sx + sw, y, r, 0, TAU); g.fill(); }
  g.fillStyle = COUNTRY === 'gb' ? '#dfe8f0' : COUNTRY === 'pl' ? '#f6e0dc' : '#f6ead2'; g.fillRect(sx + 14 * u, sy + 14 * u, sw - 28 * u, sh - 28 * u);
  stampArt(g, sx + 14 * u, sy + 10 * u, sw - 28 * u, sh - 40 * u);
  g.fillStyle = '#2a2233'; g.font = '700 ' + Math.round(20 * u) + 'px ' + disp; g.textAlign = 'center'; g.fillText({ gb: '£1.70', pl: '6,20 zł', fr: '1,39 €' }[COUNTRY], sx + sw / 2, sy + sh - 40 * u);
  /* cachet de la poste */
  const pcx = sx - 26 * u, pcy = sy + sh * .62, pr = 74 * u, d = new Date();
  g.save(); g.globalAlpha = .55; g.strokeStyle = '#2f3550'; g.lineWidth = 4 * u; g.beginPath(); g.arc(pcx, pcy, pr, 0, TAU); g.stroke(); g.beginPath(); g.arc(pcx, pcy, pr * .72, 0, TAU); g.stroke();
  g.fillStyle = '#2f3550'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 ' + Math.round(17 * u) + 'px ' + disp; g.fillText(String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear(), pcx, pcy);
  g.font = '800 ' + Math.round(15 * u) + 'px ' + disp; g.fillText(POSTCARD[1].toUpperCase(), pcx, pcy - pr * .86);
  for (let k = 0; k < 4; k++) { g.beginPath(); for (let x = 0; x <= 150 * u; x += 4 * u) { const yy = pcy - 30 * u + k * 20 * u + Math.sin(x / (9 * u)) * 5 * u; x ? g.lineTo(pcx - pr * 3.2 + x, yy) : g.moveTo(pcx - pr * 3.2 + x, yy); } g.stroke(); }
  g.restore();
  /* signature discrète du jeu */
  const s2 = Math.round(28 * u); g.font = '800 ' + s2 + 'px ' + disp; g.textAlign = 'right'; g.textBaseline = 'bottom';
  g.fillStyle = 'rgba(29,33,66,.55)'; g.fillText('Petite Ville', out.width - m - 18 * u, out.height - m - 14 * u);
  g.fillStyle = '#ffb547'; g.fillText('Petite Ville', out.width - m - 20 * u, out.height - m - 16 * u);
  return out.toDataURL('image/jpeg', .92);
}

/* ---------- rendu à la première personne : anticrénelage, halo doux, étalonnage selon l'heure, vignette ---------- */
let fp = null, fpFailed = false, fxaa = null, perfT = 0, perfN = 0, pr = R.getPixelRatio(), slowN = 0;
function makeFP() {
  if (!THREE.EffectComposer || !THREE.ShaderPass || !THREE.GammaCorrectionShader) return null;
  const size = R.getDrawingBufferSize(new THREE.Vector2());
  const ms = R.capabilities.isWebGL2 && THREE.WebGLMultisampleRenderTarget;
  const rt = ms ? new THREE.WebGLMultisampleRenderTarget(size.x, size.y, { format: THREE.RGBAFormat }) : undefined;
  const c = new THREE.EffectComposer(R, rt);
  c.addPass(new THREE.RenderPass(scene, cam));
  if (!mobile && THREE.UnrealBloomPass) c.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), .3, .55, .84));
  /* étalonnage et conversion sRGB dans une seule passe plein écran */
  const gp = new THREE.ShaderPass(GRADE); GRADE.uniforms = gp.uniforms; c.addPass(gp);
  if (!ms && THREE.FXAAShader) { fxaa = new THREE.ShaderPass(THREE.FXAAShader); fxaa.uniforms.resolution.value.set(1 / size.x, 1 / size.y); c.addPass(fxaa); }
  return c;
}
addEventListener('resize', () => { if (fp) { fp.setSize(innerWidth, innerHeight); if (fxaa) { const s = R.getDrawingBufferSize(new THREE.Vector2()); fxaa.uniforms.resolution.value.set(1 / s.x, 1 / s.y); } } });

/* ---------- vie des habitants ---------- */
let talking = null;
const camV = new THREE.Vector3();
function faceTo(o, x, z, k) { const want = Math.atan2(x - o.grp.position.x, z - o.grp.position.z); let d = want - o.grp.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); o.grp.rotation.y += d * k; }
const _hv = new THREE.Vector3(), _hv2 = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
/* le chien marche à côté de son maître (côté intérieur, un peu en retrait) ; laisse tendue de la main au collier */
function updateDog(o, dt, t) {
  const D = dog.d, Pd = dog.P, dir = o.sp > 0 ? 1 : -1;
  const ta = o.a - dir * .1, tr = o.r - .25, tx = Math.sin(ta) * tr, tz = Math.cos(ta) * tr;
  const dx = tx - D.position.x, dz = tz - D.position.z, L = Math.hypot(dx, dz), moving = o.pause <= 0 || L > .15;
  if (L > .01) { const k = Math.min(1, dt * 4); D.position.x += dx * k; D.position.z += dz * k; }
  dog.t += dt;
  if (moving) { D.rotation.y = o.a + (dir > 0 ? Math.PI / 2 : -Math.PI / 2); const s = Math.sin(dog.t * 11); Pd.legs.forEach((l, i) => { l.rotation.x = (i === 0 || i === 3 ? s : -s) * .6; }); Pd.head.rotation.x = Math.sin(dog.t * 11) * .04; }
  else { Pd.legs.forEach(l => { l.rotation.x *= .85; }); Pd.head.rotation.x = .25 + Math.sin(dog.t * 3) * .1; }
  Pd.tail.rotation.z = Math.sin(dog.t * (moving ? 14 : 9)) * .6;
  /* laisse */
  o.c.P.hands[0].getWorldPosition(_hv); D.localToWorld(_hv2.set(0, .4, .2));
  const v = _hv2.clone().sub(_hv); leash.position.copy(_hv); leash.scale.set(1, v.length(), 1); leash.quaternion.setFromUnitVectors(_up, v.normalize());
}
function approachStep(o, P, dt) {
  const A = o.appr, g = o.grp.position; A.t += dt;
  const walkTo = (tx, tz, spd) => {
    const dx = tx - g.x, dz = tz - g.z, L = Math.hypot(dx, dz); if (L < .15) return true;
    const st = Math.min(L, spd * dt); g.x += dx / L * st; g.z += dz / L * st;
    colliders.forEach(c => { if (Math.hypot(c.x - A.hx, c.z - A.hz) < .3) return; const ex = g.x - c.x, ez = g.z - c.z, dd = Math.hypot(ex, ez), rr = c.r + .3; if (dd < rr && dd > 1e-4) { g.x = c.x + ex / dd * rr; g.z = c.z + ez / dd * rr; } });
    let dr = Math.atan2(dx, dz) - o.grp.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); o.grp.rotation.y += dr * Math.min(1, dt * 8);
    const s2 = Math.sin(o.t * 8); P.legs[0].rotation.x = s2 * .55; P.legs[1].rotation.x = -s2 * .55; P.arms[0].rotation.x = -s2 * .5; P.arms[1].rotation.x = s2 * .5; P.body.position.y = .42 + Math.abs(Math.cos(o.t * 8)) * .035;
    return false;
  };
  if (A.state === 'go') {
    const dx = g.x - pos.x, dz = g.z - pos.z, d = Math.hypot(dx, dz) || 1;
    if (o.mode === 'sit' || walkTo(pos.x + dx / d * 1.8, pos.z + dz / d * 1.8, 1.5) || A.t > 12) { A.state = 'wait'; A.t = 0; o.wave = 1.6; }
  } else if (A.state === 'wait') {
    if (o.mode !== 'sit') { faceTo(o, pos.x, pos.z, .15); P.legs.forEach(l => { l.rotation.x *= .8; }); P.body.position.y = .42; }
    if (A.t > .8 && A.cb) { const cb = A.cb; A.cb = null; cb(); }
    if (!A.cb && talking !== o && A.t > 1.6) { A.state = 'back'; A.t = 0; }
  } else if (o.mode === 'sit' || walkTo(A.hx, A.hz, 1.2) || A.t > 15) {
    if (o.mode !== 'sit') { g.x = A.hx; g.z = A.hz; if (o.mode === 'idle') o.grp.rotation.y = o.base; }
    o.appr = null;
  }
}
/* attente debout : le poids passe d'une jambe à l'autre (hanche qui glisse, buste qui compense, genou relâché) */
function weightShift(o, P, dt) {
  if (o.ws == null) { o.ws = rnd(0, 10); o.wsp = rnd(.32, .5); }
  const s = Math.sin(o.t * o.wsp + o.ws), sh = Math.sign(s) * Math.pow(Math.abs(s), .45), k = 1 - Math.exp(-dt * 6);
  P.body.position.x += (sh * .028 - P.body.position.x) * k;
  P.body.rotation.z += (-sh * .045 - P.body.rotation.z) * k;
  P.head.rotation.z += (sh * .06 - P.head.rotation.z) * k;
  const free = sh > 0 ? 0 : 1, a = Math.abs(sh);
  P.legs.forEach((l, i) => { const bent = i === free ? -.16 * a : 0; l.rotation.x += (bent - l.rotation.x) * k; l.rotation.z += ((i === free ? (i ? .06 : -.06) * a : 0) - l.rotation.z) * k; });
}
/* fin de conversation joyeuse : petit saut, bras levés, yeux rieurs, grand sourire (assis : grand coucou et hochement) */
function happyPose(o, P, dt) {
  o.happy -= dt; const u = 1 - Math.max(0, o.happy) / 1.5, env = Math.sin(Math.min(1, u) * Math.PI), sit = o.mode === 'sit';
  if (!sit) { const hop = Math.abs(Math.sin(u * Math.PI * 3)) * .09 * env; o.c.g.position.y = .03 + hop; P.shadow.position.y = .012 - hop; P.shadow.scale.setScalar(.42 * (1 - hop * 2.5)); }
  const up = 2.5 * env, wig = Math.sin(o.t * 16) * .18 * env;
  P.arms[1].rotation.z = .12 + up + wig; P.arms[1].rotation.x = -.15 * env;
  if (!sit) { P.arms[0].rotation.z = -.12 - up + wig; P.arms[0].rotation.x = -.15 * env; }
  P.head.rotation.z = Math.sin(u * Math.PI * 2) * .14 * env; if (sit) P.head.rotation.x = -.1 + Math.sin(u * Math.PI * 4) * .12 * env;
  P.lids.forEach(l => { l.rotation.x = -1.25 + 1.05 * env; });
  P.open.scale.y = Math.max(P.open.scale.y, .75 * env); P.smile.visible = P.open.scale.y < .3;
  if (o.happy <= 0) { o.happy = 0; if (!sit) { o.c.g.position.y = .03; P.shadow.position.y = .012; P.shadow.scale.setScalar(.42); } }
}
function updatePeople(dt, t) {
  let speaking = false; try { speaking = speechSynthesis.speaking; } catch (e) { /* none */ }
  people.forEach(o => {
    const P = o.c.P; o.t += dt;
    const dx = pos.x - o.grp.position.x, dz = pos.z - o.grp.position.z, dist = Math.hypot(dx, dz);
    const isTalk = talking === o;
    /* marche */
    if (o.appr) approachStep(o, P, dt);
    else if (o.mode === 'walk' && !isTalk) {
      /* on ne traverse pas le joueur : si on est sur son chemin, il s'arrête et attend */
      if (dist < 1.7) { const ahead = Math.sin(o.grp.rotation.y) * dx + Math.cos(o.grp.rotation.y) * dz; if (ahead > -.2 || dist < 1) o.pause = Math.max(o.pause, .6); }
      if (o.pause > 0) o.pause -= dt; else { o.a += o.sp * dt * 2; if (Math.random() < .0015) o.pause = rnd(1.5, 4); }
      const moving = o.pause <= 0;
      o.grp.position.set(Math.sin(o.a) * o.r, 0, Math.cos(o.a) * o.r);
      if (moving) { o.grp.rotation.y = o.a + (o.sp > 0 ? Math.PI / 2 : -Math.PI / 2); const s = Math.sin(o.t * 8); P.legs[0].rotation.x = s * .55; P.legs[1].rotation.x = -s * .55; P.arms[0].rotation.x = -s * .5; P.arms[1].rotation.x = s * .5; P.body.position.y = .42 + Math.abs(Math.cos(o.t * 8)) * .035; P.body.rotation.z = Math.sin(o.t * 8) * .03; }
      else { P.arms.forEach(a => { a.rotation.x *= .85; }); P.body.position.y = .42; weightShift(o, P, dt); }
      if (moving) { P.body.position.x *= .85; P.head.rotation.z *= .85; P.legs.forEach(l => { l.rotation.z *= .85; }); }
    } else if (o.mode !== 'sit' && !(o.appr && o.appr.state !== 'wait')) { P.body.position.y = .42 + Math.sin(o.t * 2) * .006; weightShift(o, P, dt); }
    /* respiration, regard */
    P.body.scale.set(1, 1 + Math.sin(o.t * 2.2) * .015, 1);
    if (isTalk && o.mode !== 'sit') { faceTo(o, pos.x, pos.z, .12); P.head.rotation.y *= .8; P.head.rotation.x = -.12 + Math.sin(o.t * 3) * .04; }
    else if (isTalk) { const want = Math.atan2(dx, dz) - o.grp.rotation.y; const d = Math.atan2(Math.sin(want), Math.cos(want)); P.head.rotation.y += (Math.max(-.9, Math.min(.9, d)) - P.head.rotation.y) * .1; P.head.rotation.x = -.08 + Math.sin(o.t * 3) * .04; }
    else if (dist < 4.5) { const want = Math.atan2(dx, dz) - o.grp.rotation.y; const d = Math.atan2(Math.sin(want), Math.cos(want)); P.head.rotation.y += (Math.max(-1, Math.min(1, d)) - P.head.rotation.y) * .1; P.head.rotation.x += (-.1 - P.head.rotation.x) * .1; }
    else { P.head.rotation.y += (Math.sin(o.t * .4) * .35 - P.head.rotation.y) * .03; P.head.rotation.x += (Math.sin(o.t * .7) * .05 - P.head.rotation.x) * .05; }
    if (o.mode === 'idle' && !isTalk && !o.appr) faceTo(o, o.grp.position.x + Math.sin(o.base) * 10, o.grp.position.z + Math.cos(o.base) * 10, .04);
    /* coucou quand on s'approche */
    if (dist < 3.2 && !o.waved && !isTalk) { o.waved = true; o.wave = 1.6; }
    if (dist > 6) o.waved = false;
    const wave = o.wave > 0; if (wave) o.wave -= dt;
    const armR = P.arms[1];
    if (isTalk && speaking) P.arms[0].rotation.x = Math.sin(o.t * 3.1) * .3 - .2; else if (o.mode !== 'walk' || o.pause > 0) P.arms[0].rotation.x *= .9;
    if (wave || (isTalk && speaking)) { armR.rotation.z += ((isTalk ? 1.2 : 2.6) - armR.rotation.z) * .2; armR.rotation.x = Math.sin(o.t * (isTalk ? 4 : 12)) * (isTalk ? .25 : .35); }
    else if (o.mode !== 'walk' || o.pause > 0 || isTalk) { armR.rotation.z += (.12 - armR.rotation.z) * .15; if (o.id === 'leo') armR.rotation.x = -.6 + Math.max(0, Math.sin(o.t * 1.3)) * -.6; }
    /* clignement des yeux, bouche */
    o.blink -= dt; const closed = o.blink < 0; if (o.blink < -.12) o.blink = rnd(2, 5);
    P.lids.forEach(l => { l.rotation.x += ((closed ? 1.45 : -1.25) - l.rotation.x) * .6; });
    const mouthOpen = isTalk && speaking ? (.4 + Math.abs(Math.sin(o.t * 14)) * .9) : .01;
    P.open.scale.y += (mouthOpen - P.open.scale.y) * .4; P.smile.visible = P.open.scale.y < .3;
    if (o.bub) {
      const heart = o.heartUntil > t, mp = heart ? heartT : o.quest ? questT : bubbleT;
      if (o.bub.material.map !== mp) { o.bub.material.map = mp; o.bub.material.needsUpdate = true; }
      o.bub.visible = !isTalk && (heart || o.quest || dist < 9); const sc = o.quest && !heart ? .58 : .42; o.bub.scale.set(sc, sc, 1);
      o.bub.position.y = 1.78 + Math.sin(o.t * (o.quest ? 4 : 2.5)) * (o.quest ? .08 : .04);
    }
    if (o.happy > 0) happyPose(o, P, dt);
    /* sourcils : se lèvent quand on parle ou qu'on est content */
    const brow = (o.happy > 0 ? 1 : 0) + (isTalk && speaking ? .5 + .5 * Math.sin(o.t * 5) : isTalk ? .3 : 0);
    P.brows.forEach(b => { b.position.y += (.125 + Math.min(1, brow) * .03 - b.position.y) * .2; });
    /* ballon : suit la main, se balance */
    if (P.balloon) { P.hands[1].getWorldPosition(_hv); o.c.g.worldToLocal(_hv); P.balloon.position.copy(_hv); P.balloon.rotation.set(Math.sin(o.t * 1.3) * .12 - (o.mode === 'walk' && o.pause <= 0 ? .15 : 0), 0, Math.sin(o.t * 1.7) * .1); }
    if (o.dog) updateDog(o, dt, t);
  });
  catObj.userData.breath.scale.y = 1 + Math.sin(t * 1.6) * .05; catObj.userData.head.rotation.x = Math.sin(t * .3) > .97 ? .15 : 0;
  if (talking) { const want = Math.atan2(-(talking.grp.position.x - pos.x), -(talking.grp.position.z - pos.z)); let d = want - tYaw; d = Math.atan2(Math.sin(d), Math.cos(d)); tYaw += d * .08; tPitch += (-.3 - tPitch) * .08; }
}
function talkTo(id) {
  const o = people.find(p => p.id === id); if (!o) return; talking = o; o.pause = 999;
  if (o.mode === 'sit') { const f = o.grp.rotation.y; target = new THREE.Vector3(o.grp.position.x + Math.sin(f) * 2.3, 1.45, o.grp.position.z + Math.cos(f) * 2.3); return; }
  const dx = pos.x - o.grp.position.x, dz = pos.z - o.grp.position.z, d = Math.hypot(dx, dz);
  if (d > 3.2 || d < 1.8) target = new THREE.Vector3(o.grp.position.x + dx / d * 2.5, 1.45, o.grp.position.z + dz / d * 2.5);
}
function endTalk() { if (talking) { talking.pause = rnd(2, 3); talking.waved = true; talking.happy = 1.5; } talking = null; }
function greet(hitObj) { const o = people.find(p => p.grp === hitObj) || people.find(p => p.id === 'passerby'); if (o) { o.wave = 1.6; o.pause = 2.5; } }

/* ---------- effets ---------- */
function updateFx(dt, t) {
  const mp = moteGeo.attributes.position;
  for (let i = 0; i < MOTES; i++) { let x = mp.getX(i), y = mp.getY(i), z = mp.getZ(i); const s = moteS[i]; x += Math.sin(t * .3 + s) * dt * .25; z += Math.cos(t * .25 + s * 1.3) * dt * .25; y += (lightsOn > .5 ? Math.sin(t * 1.5 + s) * .3 : .12) * dt; if (y > 4.8) y = .3; const dx = x - pos.x, dz = z - pos.z; if (dx * dx + dz * dz > 140) { const a = rnd(0, TAU), r = rnd(2, 11); x = pos.x + Math.sin(a) * r; z = pos.z + Math.cos(a) * r; } mp.setXYZ(i, x, y, z); }
  mp.needsUpdate = true; moteMat.opacity = lightsOn > .5 ? .55 + Math.sin(t * 3) * .25 : .38;
  leaves.forEach((L, i) => { if (L.ground > 0) { L.ground -= dt; if (L.ground <= 0) respawnLeaf(L); } else { L.y -= L.vy * dt; L.x += Math.sin(t * 1.3 + L.ph) * dt * .5; L.z += Math.cos(t * 1.1 + L.ph) * dt * .35; if (L.y <= .17) { L.y = .17; L.ground = rnd(4, 9); } } lo.position.set(L.x, L.y, L.z); lo.rotation.set(L.ground > 0 ? 0 : Math.sin(t * 3 + L.ph) * .8, L.ph + t * (L.ground > 0 ? 0 : 1.2), L.ground > 0 ? 0 : Math.cos(t * 2.5 + L.ph) * .6); lo.updateMatrix(); leafIM.setMatrixAt(i, lo.matrix); });
  leafIM.instanceMatrix.needsUpdate = true;
  puffs.forEach((q, i) => { q.t = (q.t + dt * .12) % 1; const k = q.t; q.p.position.set(Math.sin(k * 6 + i) * .25, .9 + k * 3.2, Math.cos(k * 5 + i) * .2); q.p.scale.setScalar(.6 + k * 2.2); smokeM[i].opacity = Math.sin(k * Math.PI) * .55; });
  birds.forEach(b => { b.a += b.sp * dt; b.b.position.set(Math.sin(b.a) * b.r, b.y + Math.sin(t * .8 + b.ph) * .6, Math.cos(b.a) * b.r); b.b.rotation.y = b.a + Math.PI / 2; const f = Math.sin(t * 9 + b.ph) * .7; b.wings[0].rotation.z = f; b.wings[1].rotation.z = -f; });
  const dp = dropGeo.attributes.position;
  drops.forEach((d, i) => { d.t += dt * .9 * d.v; if (d.t > 1) { d.t = 0; d.a = rnd(0, TAU); } const r = .65 + d.t * .95, y = 1.75 + d.t * .5 - d.t * d.t * 1.75; dp.setXYZ(i, Math.sin(d.a) * r, y, Math.cos(d.a) * r); });
  dp.needsUpdate = true;
}

/* ---------- boucle ---------- */
addEventListener('resize', () => { cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); R.setSize(innerWidth, innerHeight); if (composer) composer.setSize(innerWidth, innerHeight); });
const clockT = new THREE.Clock(); let lastHourCheck = 0, lastBadgeCheck = 0;
/* ?debug : panneau de mesures à l'écran (images par seconde, résolution, appels de dessin, triangles, qualité) */
const DBG = /[?&]debug\b/.test(location.search) ? document.createElement('div') : null, dbgS = { t: 0, n: 0 };
if (DBG) { DBG.style.cssText = 'position:fixed;z-index:30;left:8px;bottom:calc(var(--nav) + 8px);background:rgba(20,22,44,.85);color:#9dffb0;font:11px/1.35 monospace;padding:6px 8px;border-radius:8px;pointer-events:none;white-space:pre'; document.body.appendChild(DBG); R.info.autoReset = false; }
function dbgFrame() {
  const now = performance.now(); if (dbgS.last) dbgS.t += (now - dbgS.last) / 1000; dbgS.last = now; dbgS.n++; if (dbgS.t < .5) return;
  const sz = R.getDrawingBufferSize(new THREE.Vector2()), fps = dbgS.n / dbgS.t;
  DBG.textContent = Math.round(fps) + ' img/s (' + (1000 / fps).toFixed(0) + ' ms)\n' + sz.x + '×' + sz.y + ' · ratio ' + R.getPixelRatio().toFixed(2) + '\n' +
    Math.round(R.info.render.calls / dbgS.n) + ' appels · ' + Math.round(R.info.render.triangles / dbgS.n / 1000) + 'k tri\n' +
    'qualité ' + (fp ? 'complète' : 'allégée') + (mobile ? ' · mobile' : '') + ' · zoom ' + zoomV.toFixed(2);
  dbgS.t = 0; dbgS.n = 0; R.info.reset();
}
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clockT.getDelta(), .05), t = clockT.elapsedTime;
  if (!H.active()) return;
  if (t - lastHourCheck > 5) { lastHourCheck = t; if (hourOverride == null) applyHour(realHour()); }
  /* vie de la place */
  if (!reduce) {
    updatePeople(dt, t);
    pigeons.forEach(q => { const s = Math.sin(t * 3 + q.ph); q.head.rotation.x = s > .6 ? .9 : 0; if (Math.random() < .004) { q.p.rotation.y += rnd(-1.5, 1.5); } });
    clouds.forEach(c => { c.a += c.sp * dt; c.c.position.set(Math.sin(c.a) * c.r, c.y + Math.sin(t * .2 + c.r) * .3, Math.cos(c.a) * c.r); });
    streams.forEach((s, i) => { s.scale.y = 1 + Math.sin(t * 8 + i) * .05; });
    water.material.emissiveIntensity = .22 + Math.sin(t * 2) * .05;
  }
  updateFx(dt, t);
  badges.forEach((b, i) => { b.spr.position.y = b.y + Math.sin(t * 1.8 + i * 1.3) * .06; });
  if (t - lastBadgeCheck > .7) { lastBadgeCheck = t; badges.forEach(b => { if (H.label(b.id) !== b.lab) drawBadge(b); }); }
  if (photo) { ctl.update(); if (composer) composer.render(); else R.render(scene, cam); sky.position.copy(cam.position); stars.position.copy(cam.position); return; }
  /* marche */
  fwd.set(-Math.sin(yaw), 0, -Math.cos(yaw)); right.set(Math.cos(yaw), 0, -Math.sin(yaw));
  wish.set(0, 0, 0);
  if (keys.w || keys.z || keys.arrowup) wish.add(fwd);
  if (keys.s || keys.arrowdown) wish.sub(fwd);
  if (keys.a || keys.q) wish.sub(right);
  if (keys.d) wish.add(right);
  if (keys.arrowleft) tYaw += 1.6 * dt;
  if (keys.arrowright) tYaw -= 1.6 * dt;
  const SPEED = 2.6;
  if (wish.lengthSq() > 0) { target = null; wish.normalize().multiplyScalar(SPEED); }
  else if (target) { const ddx = target.x - pos.x, ddz = target.z - pos.z, L = Math.hypot(ddx, ddz); if (L < .08) target = null; else { const sp = Math.min(SPEED, L * 2.2); wish.set(ddx / L * sp, 0, ddz / L * sp); } }
  vel.lerp(wish, 1 - Math.exp(-dt * (wish.lengthSq() > 0 ? 7 : 9)));
  const px = pos.x, pz = pos.z;
  pos.addScaledVector(vel, dt); collide(pos);
  if (dt > 0) { vel.x = (pos.x - px) / dt; vel.z = (pos.z - pz) / dt; }
  const spd = Math.hypot(vel.x, vel.z);
  if (target && wish.lengthSq() > .25 && spd < .2) { if ((stuckT += dt) > .7) { target = null; stuckT = 0; } } else stuckT = 0;
  yaw += (tYaw - yaw) * (1 - Math.exp(-dt * 16)); pitch += (tPitch - pitch) * (1 - Math.exp(-dt * 16));
  bob += dt * spd * 3.4;
  cam.position.set(pos.x, pos.y + Math.sin(bob) * .018 * Math.min(1, spd / SPEED), pos.z);
  cam.rotation.set(pitch, yaw, 0, 'YXZ');
  zoomV += (zoomT - zoomV) * (1 - Math.exp(-dt * 12)); { const f = (mobile ? 70 : 62) * zoomV; if (Math.abs(cam.fov - f) > .01) { cam.fov = f; cam.updateProjectionMatrix(); } }
  sky.position.copy(cam.position); stars.position.copy(cam.position);
  if (!fp && !fpFailed) { try { fp = makeFP(); } catch (e) { fpFailed = true; console.warn(e); } }
  perfT += dt; perfN++;
  /* qualité adaptative : on baisse la résolution si l'image rame ; en dernier recours (téléphone faible),
     on rend directement, sans étalonnage ni anticrénelage */
  if (perfT > 2 && fp && pr <= 1) { if (perfT / perfN > 1 / 28) { if (++slowN > 1 && !/[?&]debug\b/.test(location.search)) { fp = null; fpFailed = true; } } else slowN = 0; }
  if (perfT > 2) { if (perfT / perfN > 1 / 40 && pr > 1) { pr = Math.max(1, pr - .25); R.setPixelRatio(pr); R.setSize(innerWidth, innerHeight); if (fp) { fp.setPixelRatio(pr); if (fxaa) { const s = R.getDrawingBufferSize(new THREE.Vector2()); fxaa.uniforms.resolution.value.set(1 / s.x, 1 / s.y); } } } perfT = 0; perfN = 0; }
  if (fp) fp.render(); else R.render(scene, cam);
  if (DBG) dbgFrame();
}
loop();

/* sortir de la boulangerie : devant sa porte, face à la place */
/* outil de test : ?debug dans l'adresse donne window.PVDBG pour placer la caméra (captures de vérification) */
if (/[?&]debug\b/.test(location.search)) window.PVDBG = { R, scene, cam, snapshot, photo: on => setPhoto(on), setHour: h => { hourOverride = h; applyHour(h); }, go(x, z, yw, pt, y) { pos.set(x, y || 1.45, z); yaw = tYaw = yw; pitch = tPitch = pt || 0; target = null; vel.set(0, 0, 0); }, people, bld, badges };
function placeAtBakery() { const a = bld.bakery.ang; pos.set(Math.sin(a) * 8.0, 1.45, Math.cos(a) * 8.0); yaw = tYaw = a; pitch = tPitch = -.05; target = null; vel.set(0, 0, 0); }

return {
  setPhoto, snapshot, placeAtBakery, talkTo, endTalk, greet,
  cheer: id => { const o = people.find(p => p.id === id); if (o) o.happy = 1.5; },
  marker: (id, kind, secs) => { const o = people.find(p => p.id === id); if (!o) return; if (kind === 'heart') o.heartUntil = clockT.elapsedTime + (secs || 3); else o.quest = kind === 'quest'; },
  approach: (id, cb) => { const o = people.find(p => p.id === id); if (!o || o.appr || talking || photo) return false; o.appr = { state: 'go', t: 0, cb, hx: o.grp.position.x, hz: o.grp.position.z }; o.pause = 0; return true; },
  approaching: () => people.some(p => p.appr && p.appr.state !== 'back'),
  setHour: h => { hourOverride = h; applyHour(h == null ? realHour() : h); },
  hour: () => hourNow,
  resize: () => { cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); R.setSize(innerWidth, innerHeight); }
};
};
