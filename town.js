/* La place de Petite Ville, en pâte à modeler, visitée à la première personne.
   Tout est modelé ici dans le code (aucun modèle externe) : formes arrondies et un peu bosselées, traces de doigts,
   pavés posés un à un, enseignes en pictogrammes pour que la ville soit la même dans toutes les langues. */
window.buildTown = function (H) {
const $ = id => document.getElementById(id);
const canvas = $('ct');
const mobile = Math.min(innerWidth, innerHeight) < 700;
const R = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
R.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2)); R.setSize(innerWidth, innerHeight);
R.outputEncoding = THREE.sRGBEncoding; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = .9;
R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(mobile ? 74 : 66, innerWidth / innerHeight, .08, 500);
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
const PAL = ((window.PV && PV.PALS) || PALS)[H.palette] || PALS.a;
const TRIM = '#fff4e2', GLASS = '#2f3550', EARTH = '#9a6a46';

/* ---------- outils ---------- */
function tex(w, h, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; }
function shade(hex, k) { const c = new THREE.Color(hex); const hsl = {}; c.getHSL(hsl); c.setHSL(hsl.h, hsl.s, Math.min(1, Math.max(0, hsl.l + k))); return '#' + c.getHexString(); }
const clayBump = (() => { const t = tex(256, 256, (g, w, h) => { g.fillStyle = '#808080'; g.fillRect(0, 0, w, h); for (let i = 0; i < 220; i++) { g.strokeStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '0,0,0'},.16)`; g.lineWidth = rnd(1, 2.4); g.beginPath(); g.arc(Math.random() * w, Math.random() * h, rnd(4, 14), rnd(0, TAU), rnd(0, TAU) + 2.2); g.stroke(); } for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '0,0,0'},.06)`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, [1.5, 1.5]); t.encoding = THREE.LinearEncoding; return t; })();
const matCache = {};
function C(color, o) {
  const opts = Object.assign({}, o || {}), uniq = opts.unique; delete opts.unique;
  const key = color + JSON.stringify(opts);
  if (!uniq && matCache[key]) return matCache[key];
  const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .62, bumpMap: clayBump, bumpScale: .016 }, opts));
  if (!uniq) matCache[key] = m; return m;
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
const sph = (r, s) => new THREE.SphereGeometry(r, s || 18, Math.max(8, Math.round((s || 18) * .7)));
const cyl = (a, b, h, s) => new THREE.CylinderGeometry(a, b, h, s || 18);
function mk(geo, mat, x, y, z, p) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); (p || scene).add(m); return m; }
const hits = [];
function item(id, parent) { const g = new THREE.Group(); g.userData.id = id; hits.push(g); (parent || scene).add(g); return g; }
const glowT = tex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,220,150,1)'); gr.addColorStop(.35, 'rgba(255,190,110,.45)'); gr.addColorStop(1, 'rgba(255,170,90,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
const halos = [], winMats = [], lampMats = [], clockMats = [];
const litGlass = C(GLASS, { unique: true, emissive: '#ffc06a', emissiveIntensity: 0, roughness: .25 }); winMats.push(litGlass);
const darkGlass = C(GLASS, { roughness: .25 });
const shopGlass = C('#3a3550', { unique: true, emissive: '#ffcf85', emissiveIntensity: 0, roughness: .25 }); winMats.push(shopGlass);

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
Object.assign(sun.shadow.camera, { left: -17, right: 17, top: 17, bottom: -17, near: 1, far: 90 }); sun.shadow.bias = -.0006; sun.shadow.normalBias = .03; sun.shadow.radius = 3;
const lampLights = [];

/* ---------- l'île en argile ---------- */
const G = 0.7; /* direction de l'entrée */
const grass = mk(cyl(15, 15, .7, 72), [C(EARTH), C(shade(PAL.leaf, .12)), C(EARTH)], 0, -.35, 0); grass.receiveShadow = true;
mk(lump(cyl(15.1, 11.5, 2.6, 48, 6), .3), C(EARTH), 0, -1.95, 0);
mk(lump(cyl(11.5, 6, 3.2, 40, 6), .4), C(shade(EARTH, -.08)), 0, -4.8, 0);
const tipM = mk(lump(new THREE.ConeGeometry(6, 5, 32, 6), .45), C(shade(EARTH, -.15)), 0, -8.9, 0); tipM.rotation.x = Math.PI;
[[9, -3, 4], [-7, -4, 9], [3, -5.5, -10]].forEach(([x, y, z]) => mk(lump(sph(1.4, 16), .2), C(shade(EARTH, -.05)), x, y, z));
const square = item('square');
const base = mk(cyl(10.1, 10.1, .16, 72), C(shade(PAL.ground, -.22)), 0, .07, 0, square); base.receiveShadow = true;
/* pavés posés un à un */
{
  const cg = sph(1, mobile ? 7 : 9); const cm = C('#ffffff', { roughness: .7 });
  const pts = []; for (let z = -9.7; z <= 9.7; z += .3) for (let x = -9.7 + ((Math.round(z / .3) % 2) ? .17 : 0); x <= 9.7; x += .34) { const d = Math.hypot(x, z); if (d < 9.65 && d > 1.95) pts.push([x + rnd(-.03, .03), z + rnd(-.03, .03)]); }
  const im = new THREE.InstancedMesh(cg, cm, pts.length), o = new THREE.Object3D(), col = new THREE.Color();
  pts.forEach(([x, z], i) => { o.position.set(x, .15, z); o.rotation.set(0, rnd(0, TAU), 0); o.scale.set(rnd(.14, .17), rnd(.035, .05), rnd(.12, .145)); o.updateMatrix(); im.setMatrixAt(i, o.matrix); col.set(shade(PAL.ground, rnd(-.12, .0))); im.setColorAt(i, col); });
  im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; im.receiveShadow = true; square.add(im);
}
const path = mk(rbox(2.6, .14, 5.2, .06, 2), C(shade(PAL.ground, -.08)), Math.sin(G) * 12.5, .02, Math.cos(G) * 12.5, square); path.rotation.y = G; path.receiveShadow = true;
/* touffes d'herbe et fleurs */
{
  const tg = new THREE.ConeGeometry(.07, .26, 5), tm = C(shade(PAL.leaf, .02)), N = mobile ? 260 : 480;
  const im = new THREE.InstancedMesh(tg, tm, N), o = new THREE.Object3D();
  for (let i = 0; i < N; i++) { const a = rnd(0, TAU), r = rnd(10.4, 14.7); o.position.set(Math.sin(a) * r, .1, Math.cos(a) * r); o.rotation.set(rnd(-.2, .2), 0, rnd(-.2, .2)); o.scale.setScalar(rnd(.7, 1.3)); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }
  scene.add(im);
  const fg = sph(.07, 8), fm = C('#ffffff'), F = 90, fim = new THREE.InstancedMesh(fg, fm, F), col = new THREE.Color(), fc = ['#fff4e2', '#ffd35a', PAL.walls[4], PAL.accent];
  for (let i = 0; i < F; i++) { const a = rnd(0, TAU), r = rnd(10.6, 14.6); o.position.set(Math.sin(a) * r, .16, Math.cos(a) * r); o.rotation.set(0, 0, 0); o.scale.setScalar(rnd(.8, 1.3)); o.updateMatrix(); fim.setMatrixAt(i, o.matrix); col.set(fc[i % 4]); fim.setColorAt(i, col); }
  if (fim.instanceColor) fim.instanceColor.needsUpdate = true; scene.add(fim);
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
function windowAt(g, x, y, z, sp, lit) {
  mk(frameG, C(TRIM), x, y, z, g);
  mk(glassG, lit ? litGlass : darkGlass, x, y, z + .05, g);
  mk(rbox(.05, .76, .05, .02, 1), C(TRIM), x, y, z + .1, g);
  mk(sillG, C(shade(TRIM, -.08)), x, y - .58, z + .05, g);
  if (sp.shutters) [-1, 1].forEach(sg => mk(shutG, C(sp.shutters), x + sg * .58, y, z, g));
  if (sp.flowers && Math.random() < .55) { mk(boxG, C('#8a5a3a'), x, y - .66, z + .12, g); for (let j = 0; j < 5; j++) mk(G_('fl', () => sph(.07, 8)), C(['#ff6f91', '#ffd35a', '#fff4e2', PAL.walls[4], PAL.accent][j]), x - .3 + j * .15, y - .5, z + .14, g); }
}
function building(sp, ang, rad) {
  const g = item(sp.id); const d = 3.4, wall = C(sp.color);
  g.position.set(Math.sin(ang) * rad, 0, Math.cos(ang) * rad); g.rotation.y = ang + Math.PI;
  mk(lump(rbox(sp.w, sp.h, d, .32), .025, .7), wall, 0, sp.h / 2, 0, g);
  mk(rbox(sp.w + .25, .26, d + .25, .12, 3), C(TRIM), 0, sp.h + .05, 0, g);
  const rh = sp.flat ? 1.1 : 1.7, roofM = C(sp.roof), hw = sp.w / 2 + .25, a = Math.atan2(rh, hw), L = Math.hypot(hw, rh) + .1;
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
  const gfm = sp.shop ? 2.6 : 2.0, usable = sp.h - gfm - .35, floors = Math.max(1, Math.floor(usable / 1.4)), fh = usable / floors, n = sp.w >= 5.2 ? 3 : 2;
  for (let f = 0; f < floors; f++) {
    const y = gfm + fh * (f + .5) + .05;
    if (f > 0) mk(rbox(sp.w + .08, .1, .16, .05, 2), C(shade(sp.color, .07)), 0, gfm + fh * f, d / 2, g);
    for (let i = 0; i < n; i++) windowAt(g, sp.w * ((i + .5) / n - .5), y, d / 2, sp, Math.random() < .62);
    for (let i = 0; i < n; i++) { const x = sp.w * ((i + .5) / n - .5); mk(frameG, C(TRIM), x, y, -d / 2, g); mk(glassG, Math.random() < .5 ? litGlass : darkGlass, x, y, -d / 2 - .05, g); }
  }
  mk(rbox(sp.w + .06, .14, .22, .06, 2), C(TRIM), 0, gfm, d / 2, g);
  /* rez-de-chaussée */
  if (sp.shop) {
    const sw = sp.w * .48, sx = -sp.w * .17;
    mk(rbox(sw + .2, 1.75, .22, .1, 3), C(PAL.accent), sx, 1.02, d / 2, g);
    mk(rbox(sw - .12, 1.45, .14, .08, 3), shopGlass, sx, 1.05, d / 2 + .06, g);
    for (let j = 1; j < 3; j++) mk(rbox(.06, 1.45, .06, .02, 1), C(PAL.accent), sx - sw / 2 + sw * j / 3, 1.05, d / 2 + .12, g);
    mk(rbox(sw + .3, .22, .4, .08, 2), C(PAL.accent), sx, .2, d / 2 + .12, g);
    const dx = sp.w * .3; mk(rbox(1.02, 1.75, .2, .12, 3), C(PAL.accent), dx, .88, d / 2, g); mk(rbox(.78, 1.5, .14, .1, 3), C(shade(sp.color, -.25)), dx, .8, d / 2 + .06, g); mk(rbox(.5, .5, .1, .06, 2), shopGlass, dx, 1.15, d / 2 + .12, g);
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
  return g;
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
const RAD = 11.6, span = 250 * Math.PI / 180, a0 = G + Math.PI - span / 2;
const bld = {};
B.forEach((sp, i) => { const ang = a0 + span * i / (B.length - 1); const g = building(sp, ang, RAD + (sp.id === 'townhall' ? .3 : 0)); if (sp.id === 'bakeryShop') bld.bakery = { g, ang }; if (sp.id === 'townhall') bld.hall = { g, sp }; });

/* beffroi avec horloge qui donne l'heure */
const hall = bld.hall.g, hs = bld.hall.sp, tw = 2.6, th = 4.6, ty = hs.h + .2;
mk(lump(rbox(tw, th, tw, .3), .02), C(hs.color), 0, ty + th / 2, -.4, hall);
mk(rbox(tw + .35, .3, tw + .35, .14, 3), C(TRIM), 0, ty + th, -.4, hall);
[[0, tw / 2 + .02], [Math.PI / 2, tw / 2 + .02], [-Math.PI / 2, tw / 2 + .02]].forEach(([ry]) => { const f = new THREE.Group(); f.rotation.y = ry; f.position.set(0, ty + th * .22, -.4); hall.add(f); mk(rbox(.8, 1.1, .16, .3, 3), darkGlass, 0, 0, tw / 2, f); });
const spire = mk(lump(new THREE.ConeGeometry(tw * .8, 3.8, 24, 6), .05), C('#5f9483', { roughness: .45 }), 0, ty + th + 1.9, -.4, hall);
mk(sph(.24, 14), C('#e8c35a', { metalness: .6, roughness: .3 }), 0, ty + th + 3.9, -.4, hall);
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
const colliders = [{ x: 0, z: 0, r: 2.4 }];
const woodM = C('#b5794a'), iron = C('#3a3a48', { metalness: .25 });
[0, 1, 2, 3].forEach(i => {
  const a = G + Math.PI / 4 + i * Math.PI / 2, b = item('bench'); b.position.set(Math.sin(a) * 3.5, 0, Math.cos(a) * 3.5); b.rotation.y = a;
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
  if (light) { const p = new THREE.PointLight('#ffc77a', 0, 9, 2); p.position.set(x, 3.2, z); scene.add(p); lampLights.push(p); }
  colliders.push({ x, z, r: .38 });
}
for (let i = 0; i < 6; i++) { const a = G + .5 + i * (TAU - 1) / 5; lamp(Math.sin(a) * 8.7, Math.cos(a) * 8.7, i % 2 === 0); }

/* vélo près de la boulangerie */
{
  const ba = bld.bakery.ang + .19, bike = item('bicycle'); bike.position.set(Math.sin(ba) * 9.1, 0, Math.cos(ba) * 9.1); bike.rotation.y = ba + Math.PI / 2;
  const red = C(PAL.accent), tyre = C('#2a2a30');
  [-.55, .55].forEach(x => { mk(new THREE.TorusGeometry(.33, .05, 8, 24), tyre, x, .38, 0, bike); mk(sph(.06, 8), red, x, .38, 0, bike); });
  const bar = (x1, y1, x2, y2) => { const m = mk(cyl(.035, .035, Math.hypot(x2 - x1, y2 - y1), 8), red, (x1 + x2) / 2, (y1 + y2) / 2, 0, bike); m.rotation.z = Math.atan2(x1 - x2, y2 - y1); };
  bar(-.55, .38, -.05, .38); bar(-.05, .38, .35, .84); bar(-.55, .38, -.15, .82); bar(-.15, .82, .38, .84); bar(.55, .38, .38, .84); bar(-.05, .38, -.15, .82);
  mk(rbox(.26, .08, .14, .04, 2), C('#3a2a22'), -.17, .88, 0, bike); mk(rbox(.08, .08, .5, .04, 2), C('#3a2a22'), .38, .92, 0, bike);
  mk(rbox(.34, .2, .26, .06, 2), C('#a8763e'), .62, .8, 0, bike);
  colliders.push({ x: bike.position.x, z: bike.position.z, r: .7 });
}
/* boîte aux lettres, tables du café, seaux du fleuriste */
B.forEach((sp, i) => {
  const ang = a0 + span * i / (B.length - 1);
  if (sp.id === 'post') { const a = ang - .2, pb = item('postbox'); pb.position.set(Math.sin(a) * 9.3, 0, Math.cos(a) * 9.3); pb.rotation.y = a + Math.PI; mk(rbox(.55, 1.1, .45, .2, 4), C(R_[1] === '#3a3f4a' ? '#d23c3c' : '#d9a62e'), 0, .55, 0, pb); mk(sph(.29, 14), C(R_[1] === '#3a3f4a' ? '#d23c3c' : '#d9a62e'), 0, 1.1, 0, pb).scale.set(1, .5, .8); mk(rbox(.32, .06, .06, .02, 1), C('#2a2233'), 0, .85, .24, pb); colliders.push({ x: pb.position.x, z: pb.position.z, r: .5 }); }
  if (sp.id === 'cafe') [-.18, .18].forEach(o => { const a = ang + o, x = Math.sin(a) * 8.7, z = Math.cos(a) * 8.7, t = new THREE.Group(); t.position.set(x, 0, z); scene.add(t); mk(cyl(.42, .42, .08, 22), C(TRIM), 0, .76, 0, t); mk(cyl(.05, .05, .75, 8), iron, 0, .37, 0, t); mk(cyl(.07, .05, .1, 10), C('#fffaf0'), .1, .85, .05, t); [-.62, .62].forEach(cx => { mk(cyl(.22, .22, .08, 14), C(PAL.accent), cx, .46, 0, t); mk(cyl(.04, .04, .45, 6), iron, cx, .22, 0, t); }); colliders.push({ x, z, r: 1.05 }); });
  if (sp.id === 'florist') for (let j = 0; j < 4; j++) { const a = ang - .12 + j * .08, x = Math.sin(a) * 9.4, z = Math.cos(a) * 9.4; mk(cyl(.22, .17, .38, 14), C('#7a8fa8', { metalness: .3 }), x, .19, z); for (let f = 0; f < 6; f++) mk(G_('fl', () => sph(.07, 8)), C(['#ff6f91', '#ffd35a', PAL.walls[4], '#fff4e2'][j]), x + rnd(-.13, .13), .45 + rnd(0, .15), z + rnd(-.13, .13)); }
});

/* ---------- étals du marché ---------- */
function stall(a, r, cA, fruit) {
  const s = item('stall'); s.position.set(Math.sin(a) * r, 0, Math.cos(a) * r); s.rotation.y = a + Math.PI;
  mk(rbox(2.3, .95, .95, .12, 3), woodM, 0, .48, 0, s);
  [[-1.08, -.4], [1.08, -.4], [-1.08, .4], [1.08, .4]].forEach(([x, z]) => mk(cyl(.05, .05, 2.3, 8), woodM, x, 1.15, z, s));
  [-1, 1].forEach(sg => { for (let k = 0; k < 5; k++) { const c = mk(rbox(.5, .1, .82, .05, 2), C(k % 2 ? TRIM : cA), -1.0 + k * .5, 2.4, sg * .32, s); c.rotation.x = sg * .35; } });
  const ap = item('apple', s);
  for (let c = 0; c < 3; c++) { mk(rbox(.62, .22, .52, .06, 2), C('#c99a62'), -.72 + c * .72, 1.06, 0, ap); for (let f = 0; f < 7; f++) mk(G_('fruit', () => sph(.085, 12)), C(fruit[c], { roughness: .4 }), -.72 + c * .72 + rnd(-.2, .2), 1.22, rnd(-.16, .16), ap); }
  colliders.push({ x: s.position.x, z: s.position.z, r: 1.45 });
}
stall(G - .55, 5.6, PAL.accent, ['#d82e2e', '#ff9a2e', '#9cc84a']);
stall(G + .55, 5.6, R_[0], ['#e84a3a', '#f2d24a', '#7a2a5a']);

/* ---------- arbres ---------- */
function tree(x, z, s) {
  const t = item('tree'); t.position.set(x, 0, z); t.scale.setScalar(s);
  mk(lump(cyl(.14, .22, 1.7, 10), .03), C('#8a5a3a'), 0, .85, 0, t);
  const c = shade(PAL.leaf, rnd(-.05, .08));
  [[0, 2.15, 0, .95], [.48, 1.75, .2, .66], [-.42, 1.82, -.2, .7], [.08, 2.7, -.08, .58]].forEach(([a, b, cc, r]) => mk(lump(sph(r, 20), .05, 2), C(shade(c, rnd(-.04, .04))), a, b, cc, t));
  colliders.push({ x, z, r: .6 * s });
}
[[11.2, 2.4], [11.6, -2.5], [13.2, 3.4], [13.0, -3.6], [12.2, 4.7], [12.4, -4.8], [14.0, 2.2], [14.1, -2.3]].forEach(([r, s]) => tree(Math.sin(G) * r + Math.cos(G) * s, Math.cos(G) * r - Math.sin(G) * s, rnd(.9, 1.2)));
[G + 1.3, G - 1.3].forEach(a => tree(Math.sin(a) * 7.2, Math.cos(a) * 7.2, .85));
for (let i = 0; i < 30; i++) { const a = G + rnd(.15, TAU - .15), r = rnd(13.6, 14.6); mk(lump(sph(rnd(.35, .6), 12), .04, 2), C(shade(PAL.leaf, rnd(-.1, .04))), Math.sin(a) * r, .22, Math.cos(a) * r); }

/* ---------- pigeons ---------- */
const pigeons = [];
for (let i = 0; i < 6; i++) {
  const a = rnd(0, TAU), r = rnd(2.6, 3.0), p = item('pigeon'); p.position.set(Math.sin(a) * r, .14, Math.cos(a) * r); p.rotation.y = rnd(0, TAU);
  const body = mk(sph(.13, 14), C('#8a93a8'), 0, .14, 0, p); body.scale.set(1, .85, 1.4);
  const head = new THREE.Group(); head.position.set(0, .25, .13); p.add(head);
  mk(sph(.075, 12), C('#6f7890'), 0, 0, 0, head); mk(new THREE.ConeGeometry(.025, .07, 6), C('#e8a03a'), 0, -.01, .08, head).rotation.x = Math.PI / 2;
  [-1, 1].forEach(sg => mk(sph(.015, 6), C('#1a1a22'), sg * .04, .02, .055, head));
  pigeons.push({ p, head, ph: rnd(0, 10) });
}

/* ---------- passants en pâte ---------- */
const skin = ['#f1c7a5', '#c98e6a', '#8a5a3c', '#f5d3b8'], cloth = [PAL.accent, R_[0], W_[1], W_[2], R_[1], W_[0]];
const walkers = [];
for (let i = 0; i < 6; i++) {
  const w = new THREE.Group(); scene.add(w);
  const legs = []; [-.09, .09].forEach(x => { const lg = new THREE.Group(); lg.position.set(x, .6, 0); w.add(lg); mk(rbox(.13, .6, .15, .06, 2), C('#3a3a4a'), 0, -.3, 0, lg); mk(sph(.08, 8), C('#2a2a30'), 0, -.6, .04, lg).scale.set(1, .6, 1.4); legs.push(lg); });
  const c = cloth[i % cloth.length];
  mk(rbox(.42, .66, .32, .15, 4), C(c), 0, .95, 0, w);
  mk(sph(.17, 18), C(skin[i % 4]), 0, 1.45, 0, w);
  mk(sph(.18, 16), C(['#3a2418', '#e8c070', '#1a1a1a', '#8a3a1e'][i % 4]), 0, 1.5, -.03, w).scale.set(1, .75, 1);
  [-1, 1].forEach(sg => { mk(sph(.022, 6), C('#1a1a22'), sg * .06, 1.47, .15, w); mk(sph(.03, 6), C('#ff9a9a'), sg * .1, 1.41, .13, w).scale.z = .4; });
  if (i % 3 === 0) mk(rbox(.24, .28, .12, .05, 2), C('#a8763e'), .26, .9, 0, w);
  walkers.push({ w, legs, r: rnd(6.6, 8.0), a: rnd(0, TAU), sp: rnd(.05, .09) * (i % 2 ? 1 : -1), pause: 0 });
}

/* ---------- nuages et petites îles ---------- */
const clouds = [];
for (let i = 0; i < 6; i++) {
  const c = item('cloud'); const r = rnd(52, 72), a = rnd(0, TAU), y = rnd(8, 22); c.position.set(Math.sin(a) * r, y, Math.cos(a) * r); c.scale.setScalar(rnd(1.3, 1.9));
  const cm = C('#ffffff', { roughness: 1 });
  for (let j = 0; j < 5; j++) mk(lump(sph(rnd(1.2, 2.2), 16), .08, 1), cm, rnd(-2.5, 2.5), rnd(-.4, .6), rnd(-1, 1), c);
  clouds.push({ c, r, a, y, sp: rnd(.004, .009) });
}
[[38, 2, -20], [-34, -3, -26], [-30, 5, 24]].forEach(([x, y, z], i) => {
  const isl = new THREE.Group(); isl.position.set(x, y, z); scene.add(isl);
  mk(cyl(2.4, 2.4, .5, 22), [C(EARTH), C(shade(PAL.leaf, .1)), C(EARTH)], 0, 0, 0, isl);
  mk(lump(new THREE.ConeGeometry(2.3, 3, 16, 3), .15), C(shade(EARTH, -.08)), 0, -1.75, 0, isl).rotation.x = Math.PI;
  const t = new THREE.Group(); t.position.y = .25; isl.add(t); mk(cyl(.12, .16, 1.2, 8), C('#8a5a3a'), 0, .6, 0, t); mk(lump(sph(.8, 16), .05), C(shade(PAL.leaf, i * .05)), 0, 1.6, 0, t);
});

/* ombres */
scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh) && o !== sky && o.material && !Array.isArray(o.material) && !o.material.transparent) { o.castShadow = true; o.receiveShadow = true; } });
base.castShadow = false; grass.receiveShadow = true;

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
  lerpC(hemi.color, a[6], b[6], t); lerpC(hemi.groundColor, a[7], b[7], t); hemi.intensity = (a[8] + (b[8] - a[8]) * t) * .82;
  lerpC(scene.fog.color, a[9], b[9], t).convertSRGBToLinear();
  lightsOn = a[10] + (b[10] - a[10]) * t; starMat.opacity = a[11] + (b[11] - a[11]) * t;
  const day = h >= 6 && h <= 20, el = day ? Math.sin((h - 6) / 14 * Math.PI) : .55, az = (h / 24) * TAU + 1.2;
  const dir = day ? new THREE.Vector3(Math.cos(az) * Math.cos(el * 1.3), Math.max(.12, Math.sin(el * 1.25)), Math.sin(az) * Math.cos(el * 1.3)) : new THREE.Vector3(-Math.cos(az) * .6, .7, -Math.sin(az) * .6);
  dir.normalize(); skyU.sunDir.value.copy(dir); sun.position.copy(dir).multiplyScalar(45); sun.target.position.set(0, 0, 0);
  skyU.sunCol.value.copy(day ? sun.color : new THREE.Color('#dfe6ff')).convertSRGBToLinear().multiplyScalar(day ? 1 : .55);
  winMats.forEach(m => { m.emissiveIntensity = lightsOn * 1.15; }); shopGlass.emissiveIntensity = .22 + lightsOn * 1.05; clockMats.forEach(m => { m.emissiveIntensity = lightsOn * .28; });
  lampMats.forEach(m => { m.emissiveIntensity = .15 + lightsOn * 2.2; });
  halos.forEach(s => { s.material.opacity = lightsOn * .85; });
  lampLights.forEach(p => { p.intensity = lightsOn * 1.4; });
  R.toneMappingExposure = .9 + lightsOn * .12;
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
