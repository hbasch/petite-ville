/* Matière « pâte à modeler » commune à la ville et à la boulangerie.
   Pas de texture plaquée (donc rien ne peut s'étirer) : le relief est calculé en 3D, dans le repère de chaque objet,
   corrigé de son échelle. Ce sont de larges creux doux, comme des pressions de pouce, plus un grain très fin qui s'efface au loin.
   S'y ajoutent une légère variation de teinte, une brillance grasse qui varie d'un endroit à l'autre, une lumière chaude
   qui « traverse » la pâte au bord des zones éclairées, un assombrissement au contact du sol (creux, pieds des murs)
   et un reflet doux sur les arêtes (atténués la nuit). */
(function () {
  const U = { day: { value: 1 }, ground: { value: 1 },
    /* ajourage : ce qui est entre la caméra (cutA) et ton personnage (cutB) s'efface en pointillé */
    cutA: { value: new THREE.Vector3() }, cutB: { value: new THREE.Vector3() }, cutOn: { value: 0 },
    /* horizon arrondi : le sol plonge en s'éloignant de ton personnage (x, z) le long du regard de la caméra (dx, dz) */
    bend: { value: new THREE.Vector4(0, 0, 0, -1) }, bendK: { value: 0 },
    /* vue d'intérieur : tout ce qui est au-delà du plan (façade côté caméra) s'efface */
    clip: { value: new THREE.Vector4(0, 0, 1, 1e9) }, clip2: { value: new THREE.Vector4(0, 1, 0, 1e9) }, clipOn: { value: 0 },
    /* reflets : couleurs du ciel en haut, à l'horizon et du sol (linéaires), données par la scène */
    envT: { value: new THREE.Color(.45, .62, .85) }, envH: { value: new THREE.Color(.75, .8, .85) }, envG: { value: new THREE.Color(.3, .22, .16) } };
  /* mode compatible : si la carte graphique refuse les nouveaux effets (horizon arrondi, ajourage, coupe d'intérieur),
     la ville se recharge sans eux (voir town.js). ?safe le force, ?unsafe le retire. */
  const SAFE = (() => { try { if (/[?&]unsafe\b/.test(location.search)) localStorage.removeItem('pv_safe'); return localStorage.getItem('pv_safe') === '1' || /[?&]safe\b/.test(location.search); } catch (e) { return /[?&]safe\b/.test(location.search); } })();
  const BEND_DECL = 'uniform vec4 clayBend;\nuniform float clayBendK;';
  const BEND_CODE = `
  if (clayBendK > 0.0) {
    vec4 bw = vec4(transformed, 1.0);
    #ifdef USE_INSTANCING
      bw = instanceMatrix * bw;
    #endif
    bw = modelMatrix * bw;
    float bd = dot(bw.xz - clayBend.xy, clayBend.zw);
    bw.y -= clayBendK * bd * bd;
    mvPosition = viewMatrix * bw; gl_Position = projectionMatrix * mvPosition;
  }`;
  /* le même arrondi pour les matières qui ne sont pas en pâte (vitres, lueurs, panneaux, points, sprites) */
  function bendPatch(sh) {
    sh.uniforms.clayBend = U.bend; sh.uniforms.clayBendK = U.bendK;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + BEND_DECL);
    if (sh.vertexShader.includes('#include <project_vertex>')) sh.vertexShader = sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>' + BEND_CODE);
    else sh.vertexShader = sh.vertexShader.replace('vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );', 'vec4 bwS = modelMatrix * vec4( 0.0, 0.0, 0.0, 1.0 ); float bdS = dot(bwS.xz - clayBend.xy, clayBend.zw); bwS.y -= clayBendK * bdS * bdS; vec4 mvPosition = viewMatrix * bwS;');
  }
  function bendify(m) {
    if (SAFE || !m || m.userData.clayAmt || m.userData.bent || m.isShaderMaterial) return;
    if (m.onBeforeCompile !== THREE.Material.prototype.onBeforeCompile) return;
    if (!(m.isMeshBasicMaterial || m.isMeshStandardMaterial || m.isMeshLambertMaterial || m.isMeshPhongMaterial || m.isPointsMaterial || m.isSpriteMaterial)) return;
    m.userData.bent = true; m.onBeforeCompile = bendPatch; m.customProgramCacheKey = () => 'bend1'; m.needsUpdate = true;
  }
  /* ton personnage : se tourne vers wantYaw, marche selon sa vitesse, respire, cligne des yeux */
  function walk(me, dt, t, spd, wantYaw) {
    let dy = wantYaw - me.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); me.yaw += dy * (1 - Math.exp(-dt * 12)); me.g.rotation.y = me.yaw;
    const P = me.P, w = Math.min(1, spd / 2.2); me.ph = (me.ph || 0) + dt * spd * 3.6; const s = Math.sin(me.ph);
    P.legs[0].rotation.x = s * .62 * w; P.legs[1].rotation.x = -s * .62 * w; P.arms[0].rotation.x = -s * .5 * w; P.arms[1].rotation.x = s * .5 * w;
    P.body.position.y = .42 + Math.abs(Math.cos(me.ph)) * .04 * w + (1 - w) * Math.sin(t * 2) * .006; P.body.rotation.z = s * .04 * w;
    me.blinkT = (me.blinkT == null ? 2 : me.blinkT) - dt; const closed = me.blinkT < .12; if (me.blinkT < 0) me.blinkT = 2 + Math.random() * 3;
    if (P.lids) P.lids.forEach(l => { l.rotation.x += ((closed ? 1.45 : -1.25) - l.rotation.x) * .6; });
  }
  const CUT_CODE = `  /* ajourage et coupe d'intérieur : en toute fin, après les dérivées (Direct3D sous Windows refuse un discard avant) */
  if (clayClipOn > 0.5 && (dot(vClayW, clayClip.xyz) > clayClip.w || dot(vClayW, clayClip2.xyz) > clayClip2.w)) discard;
  if (clayCutOn > 0.5 && vClayW.y > 0.3) {
    vec3 cab = clayCutB - clayCutA; float ctt = dot(vClayW - clayCutA, cab) / dot(cab, cab);
    if (ctt > 0.02 && ctt < 0.97) {
      float cdl = length(vClayW - (clayCutA + cab * ctt));
      float ca = (1.0 - smoothstep(1.2, 2.0, cdl)) * (1.0 - smoothstep(0.86, 0.96, ctt));
      float cth = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
      if (ca > cth) discard;
    }
  }
`;
  const NOISE = `
varying vec3 vClayP;
varying float vClayY;
varying vec3 vClayW;
uniform vec3 clayCutA;
uniform vec3 clayCutB;
uniform float clayCutOn;
uniform vec4 clayClip;
uniform vec4 clayClip2;
uniform float clayClipOn;
uniform float clayAmt;
uniform float clayDay;
uniform float clayGround;
uniform vec3 claySSS;
uniform float clayEnvK;
uniform float clayStone;
uniform vec3 clayEnvT, clayEnvH, clayEnvG;
float cHash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float cNoise(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(cHash(i), cHash(i + vec3(1., 0., 0.)), f.x), mix(cHash(i + vec3(0., 1., 0.)), cHash(i + vec3(1., 1., 0.)), f.x), f.y),
             mix(mix(cHash(i + vec3(0., 0., 1.)), cHash(i + vec3(1., 0., 1.)), f.x), mix(cHash(i + vec3(0., 1., 1.)), cHash(i + vec3(1., 1., 1.)), f.x), f.y), f.z);
}
/* empreintes de doigt : anneaux serrés dans des taches éparses, visibles seulement de près */
float clayPrint(vec3 p) {
  vec3 c = floor(p * 2.2), f = fract(p * 2.2) - 0.5;
  float on = step(0.8, cHash(c + 7.3));
  float r = length(f.xy * vec2(1.0, 1.4) + f.z * 0.3);
  /* arcs partiels (pas des cercles complets), comme une pulpe de doigt qui a glissé */
  return on * sin(r * 95.0 + cHash(c) * 6.28) * smoothstep(0.42, 0.12, r) * smoothstep(-0.15, 0.25, f.x + f.y * 0.6);
}
/* pierres de taille tracées à l'ébauchoir : assises un peu ondulées, joints verticaux décalés d'un rang à l'autre */
float clayJoint(vec3 p) {
  float wob = cNoise(p * 1.7 + 3.0) * 0.07;
  float y = (p.y + wob) / 0.36, row = floor(y), v = fract(y);
  float u = fract((p.x + p.z + row * 0.31 + wob) / 0.62 + cHash(vec3(row, 1.0, 2.0)) * 0.4);
  return max(1.0 - smoothstep(0.0, 0.075, min(v, 1.0 - v)), 1.0 - smoothstep(0.0, 0.04, min(u, 1.0 - u)));
}
float clayHeight(vec3 p, float fine) {
  float d = cNoise(p * 2.3);
  d = 1.0 - sqrt((d * 2.0 - 1.0) * (d * 2.0 - 1.0) + 0.02);
  float h = d * d * 0.65 + cNoise(p * 1.1 + 5.0) * 0.55 + cNoise(p * 7.0 + 3.1) * 0.25;
  /* grain fin et empreintes : seulement de près (on ne paie pas ce calcul pour le lointain) */
  if (fine > 0.0) h += cNoise(p * 31.0) * 0.07 * fine + clayPrint(p) * 0.018 * fine * fine * fine;
  return h;
}
`;
  function patch(sh) {
    sh.uniforms.clayAmt = { value: this.userData.clayAmt };
    sh.uniforms.clayDay = U.day;
    sh.uniforms.clayGround = U.ground;
    sh.uniforms.clayCutA = U.cutA; sh.uniforms.clayCutB = U.cutB; sh.uniforms.clayCutOn = U.cutOn;
    sh.uniforms.clayBend = U.bend; sh.uniforms.clayBendK = U.bendK; sh.uniforms.clayClip = U.clip; sh.uniforms.clayClip2 = U.clip2; sh.uniforms.clayClipOn = U.clipOn;
    sh.uniforms.claySSS = { value: this.userData.claySSS || SSS0 };
    sh.uniforms.clayEnvK = { value: this.envMapIntensity };
    sh.uniforms.clayStone = { value: this.userData.clayStone || 0 };
    sh.uniforms.clayEnvT = U.envT; sh.uniforms.clayEnvH = U.envH; sh.uniforms.clayEnvG = U.envG;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vClayP;\nvarying float vClayY;\nvarying vec3 vClayW;\n' + BEND_DECL)
      .replace('#include <project_vertex>', `#include <project_vertex>
  vec4 clayC = vec4(transformed, 1.0);
  #ifdef USE_SKINNING
    clayC = vec4(position, 1.0);
  #endif
  #ifdef USE_INSTANCING
    clayC = instanceMatrix * clayC;
  #endif
  vClayP = clayC.xyz * vec3(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz), length(modelMatrix[2].xyz));
  vClayY = (modelMatrix * clayC).y;
  vec4 clayWp = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
    clayWp = instanceMatrix * clayWp;
  #endif
  vClayW = (modelMatrix * clayWp).xyz;
` + (SAFE ? '' : BEND_CODE));
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\n' + NOISE)

      .replace('#include <color_fragment>', `#include <color_fragment>
  float clayN = cNoise(vClayP * 1.7 + 7.0);
  diffuseColor.rgb *= 0.95 + 0.1 * clayN;
  /* joints de pierre (murs d'Édimbourg), effacés au loin pour ne pas scintiller */
  float clayJ = clayStone > 0.0 ? clayJoint(vClayP) * clayStone * (1.0 - smoothstep(9.0, 24.0, length(vViewPosition))) : 0.0;
  diffuseColor.rgb *= 1.0 - 0.22 * clayJ;`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
  /* brillance grasse irrégulière : là où le doigt a lissé la pâte, elle brille un peu plus */
  roughnessFactor = clamp(roughnessFactor + (0.5 - clayN) * 0.34, 0.2, 1.0);`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
  {
    float fine = 1.0 - smoothstep(3.0, 11.0, length(vViewPosition));
    float hh = clayHeight(vClayP, fine) - clayJ * 0.5;
    vec3 sx = dFdx(-vViewPosition), sy = dFdy(-vViewPosition);
    vec3 r1 = cross(sy, normal), r2 = cross(normal, sx);
    float det = dot(sx, r1);
    vec3 grad = sign(det) * (dFdx(hh) * r1 + dFdy(hh) * r2) * clayAmt * (1.0 - smoothstep(25.0, 60.0, length(vViewPosition)));
    normal = normalize(abs(det) * normal - grad);
  }`)
      .replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
  vec3 clayWN = inverseTransformDirection(normal, viewMatrix);
  {
    /* contact du sol : ce qui n'est pas tourné vers le ciel s'assombrit dans les 35 premiers cm (pied des murs, creux entre les pavés) */
    float gk = (1.0 - smoothstep(0.0, 0.35, vClayY)) * smoothstep(-0.45, -0.02, vClayY) * (1.0 - smoothstep(0.5, 0.92, clayWN.y)) * clayGround;
    /* et le dessous des rebords reçoit moins de lumière renvoyée */
    float gao = (1.0 - 0.5 * gk) * (1.0 - 0.25 * max(0.0, -clayWN.y));
    reflectedLight.indirectDiffuse *= gao;
    reflectedLight.directDiffuse *= mix(1.0, gao, 0.4);
    reflectedLight.indirectDiffuse += diffuseColor.rgb * diffuseColor.rgb * 0.12 * clayDay * gao;
    #if NUM_DIR_LIGHTS > 0
      /* la lumière traverse un peu la pâte au bord de l'ombre : liseré chaud et saturé */
      float nl = dot(normal, directionalLights[0].direction);
      float term = smoothstep(-0.5, 0.0, nl) * (1.0 - smoothstep(0.0, 0.45, nl));
      reflectedLight.indirectDiffuse += term * directionalLights[0].color * diffuseColor.rgb * claySSS;
    #endif
    /* reflet du ciel calculé sans texture (dégradé ciel / horizon / sol), flou selon la rugosité :
       un léger brillant gras sur la pâte, le ciel dans les vitres */
    vec3 rv = inverseTransformDirection(reflect(-geometry.viewDir, geometry.normal), viewMatrix);
    float ry = mix(rv.y, clayWN.y, material.specularRoughness * material.specularRoughness);
    vec3 envC = ry > 0.0 ? mix(clayEnvH, clayEnvT, sqrt(ry)) : mix(clayEnvH, clayEnvG, smoothstep(0.0, 0.2, -ry));
    reflectedLight.indirectSpecular += envC * BRDF_Specular_GGX_Environment(geometry.viewDir, geometry.normal, material.specularColor, material.specularRoughness) * clayEnvK * gao;
  }`)
      .replace('#include <tonemapping_fragment>', `{
    /* arêtes qui accrochent la lumière du ciel */
    float clayRim = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 3.0);
    gl_FragColor.rgb += mix(diffuseColor.rgb, vec3(1.0, 0.93, 0.85), 0.4) * clayRim * (0.05 + 0.1 * max(0.0, clayWN.y)) * clayDay;
  }
` + (SAFE ? '' : CUT_CODE) + `
  #include <tonemapping_fragment>`);
  }
  /* lumière diffusée dans la pâte (rouge orangé), plus forte pour la peau */
  const SSS0 = new THREE.Vector3(.2, .11, .06);
  /* amt : profondeur du relief (0 = lisse, pour les yeux, le verre, les ampoules) ; sss : [r, v, b] facultatif ;
     stone : force des joints de pierre de taille (0 = enduit lisse) */
  function apply(m, amt, sss, stone) {
    if (!amt) return m;
    m.userData.clayAmt = amt;
    if (stone) m.userData.clayStone = stone;
    if (sss) m.userData.claySSS = new THREE.Vector3().fromArray(sss);
    m.extensions = Object.assign(m.extensions || {}, { derivatives: true });
    m.onBeforeCompile = patch;
    m.customProgramCacheKey = () => SAFE ? 'clay6s' : 'clay6';
    return m;
  }

  /* ---------- regroupement des objets immobiles (gros gain sur téléphone) ----------
     Dans chaque groupe, les objets fixes qui ne diffèrent que par la couleur sont fusionnés en un seul :
     la couleur passe dans les sommets. Les matières « uniques » (vitres qui s'allument, eau…) restent
     partagées telles quelles (de même que les matières simples non éclairées, ex. reflets des yeux). Un objet qui porte des userData (ex. keep: true) n'est jamais fusionné.
     skip(groupe) permet d'épargner des groupes entiers (ex. objets surlignés au survol dans la boulangerie). */
  const bakedMats = {};
  function bakedMat(m) {
    const amt = m.userData.clayAmt || 0;
    const sss = m.userData.claySSS ? m.userData.claySSS.toArray() : null, stone = m.userData.clayStone || 0;
    const key = [m.roughness, m.metalness, m.emissive.getHexString(), m.emissiveIntensity, amt, m.side, m.flatShading, m.envMapIntensity, sss, stone].join('|');
    if (!bakedMats[key]) bakedMats[key] = apply(new THREE.MeshStandardMaterial({ color: '#ffffff', vertexColors: true, roughness: m.roughness, metalness: m.metalness, emissive: m.emissive, emissiveIntensity: m.emissiveIntensity, side: m.side, flatShading: m.flatShading, envMapIntensity: m.envMapIntensity }), amt, sss, stone);
    return { key: 's' + key, mat: bakedMats[key], color: true };
  }
  function bakeable(c) {
    if (!c.isMesh || c.isInstancedMesh || c.isSkinnedMesh || Object.keys(c.userData).length || c.children.length || !c.visible) return false;
    const m = c.material, g = c.geometry;
    return !!(m && !Array.isArray(m) && (m.isMeshStandardMaterial || m.isMeshBasicMaterial) && !m.transparent && !m.map && g && g.attributes.position && g.attributes.normal);
  }
  const _m3 = new THREE.Matrix3(), _v = new THREE.Vector3();
  function mergeList(list, withColor) {
    let nv = 0, ni = 0;
    list.forEach(c => { const g = c.geometry; nv += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; });
    const P = new Float32Array(nv * 3), N = new Float32Array(nv * 3), UV = new Float32Array(nv * 2), CO = withColor ? new Float32Array(nv * 3) : null;
    const I = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
    let vo = 0, io = 0;
    list.forEach(c => {
      c.updateMatrix(); const M = c.matrix; _m3.getNormalMatrix(M); const flip = M.determinant() < 0;
      const g = c.geometry, p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv, cnt = p.count, col = c.material.color, gc = g.attributes.color;
      for (let i = 0; i < cnt; i++) {
        _v.fromBufferAttribute(p, i).applyMatrix4(M); P[(vo + i) * 3] = _v.x; P[(vo + i) * 3 + 1] = _v.y; P[(vo + i) * 3 + 2] = _v.z;
        _v.fromBufferAttribute(n, i).applyMatrix3(_m3).normalize(); N[(vo + i) * 3] = _v.x; N[(vo + i) * 3 + 1] = _v.y; N[(vo + i) * 3 + 2] = _v.z;
        if (uv) { UV[(vo + i) * 2] = uv.getX(i); UV[(vo + i) * 2 + 1] = uv.getY(i); }
        /* nuances peintes dans les sommets (plis, creux, joues) : elles multiplient la couleur de la matière */
        if (CO) { CO[(vo + i) * 3] = col.r * (gc ? gc.getX(i) : 1); CO[(vo + i) * 3 + 1] = col.g * (gc ? gc.getY(i) : 1); CO[(vo + i) * 3 + 2] = col.b * (gc ? gc.getZ(i) : 1); }
      }
      const src = g.index ? g.index.array : null, k = src ? src.length : cnt;
      for (let j = 0; j < k; j += 3) {
        const a = src ? src[j] : j, b = src ? src[j + 1] : j + 1, d = src ? src[j + 2] : j + 2;
        I[io++] = vo + a; I[io++] = vo + (flip ? d : b); I[io++] = vo + (flip ? b : d);
      }
      vo += cnt;
    });
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(P, 3)); out.setAttribute('normal', new THREE.BufferAttribute(N, 3)); out.setAttribute('uv', new THREE.BufferAttribute(UV, 2));
    if (CO) out.setAttribute('color', new THREE.BufferAttribute(CO, 3));
    out.setIndex(new THREE.BufferAttribute(I, 1));
    return out;
  }
  function mergeChildren(node) {
    const buckets = new Map();
    node.children.forEach(c => {
      if (!bakeable(c)) return;
      const m = c.material, b = m.userData.unique || !m.isMeshStandardMaterial ? { key: 'u' + m.uuid, mat: m, color: false } : bakedMat(m);
      if (!buckets.has(b.key)) buckets.set(b.key, Object.assign(b, { list: [] }));
      buckets.get(b.key).list.push(c);
    });
    let saved = 0;
    buckets.forEach(b => {
      /* un objet seul n'est converti que s'il porte des nuances dans ses sommets (sinon rien à gagner) */
      if (b.list.length < 2 && !(b.color && b.list[0].geometry.attributes.color)) return;
      const mesh = new THREE.Mesh(mergeList(b.list, b.color), b.mat);
      mesh.castShadow = b.list.some(c => c.castShadow); mesh.receiveShadow = b.list.some(c => c.receiveShadow);
      mesh.userData.baked = true;
      b.list.forEach(c => node.remove(c)); node.add(mesh); saved += b.list.length - 1;
    });
    return saved;
  }
  function bake(root, skip) {
    const nodes = [];
    root.traverse(n => { if (!n.isMesh && n.children.length && !(skip && skip(n))) nodes.push(n); });
    let saved = 0; nodes.forEach(n => { saved += mergeChildren(n); });
    return saved;
  }

  window.PVClay = { U, SAFE, apply, bake, bendify, walk, playerLook: { skin: '#eec2a2', hair: '#5a3a2a', style: 'short', fringe: true, eyes: '#3a2418', outfit: 'hoodie', shirt: '#ffb547', pants: '#3f5f9a', shoes: '#f4efe6' } };
})();

/* ---------- habitants en pâte : partagés par la place (town.js) et la boulangerie (scene.js) ----------
   Tout est modelé ici : boudins, coussins et formes tournées. Les nuances (fond des plis, creux sous le menton,
   joues rosées, sillons des mèches) sont peintes dans les sommets ; PVClay.bake les fusionne avec la couleur de la pièce.
   Les pièces fixes d'une même partie du corps partagent les mêmes réglages : une partie = un appel de dessin. */
(function () {
  const TAU = Math.PI * 2, mobile = Math.min(innerWidth, innerHeight) < 700;
  let DET = mobile ? .7 : 1;
  const geos = {}, mats = {};
  const G_ = (k, fn) => geos[k + '|' + DET] || (geos[k + '|' + DET] = fn());
  const seg = s => Math.max(6, Math.round((s || 18) * DET));
  const sph = (r, s) => new THREE.SphereGeometry(r, seg(s), Math.max(6, Math.round(seg(s) * .7)));
  const cyl = (a, b, h, s) => new THREE.CylinderGeometry(a, b, h, seg(s));
  const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function shade(hex, k) { const c = new THREE.Color(hex), h = {}; c.getHSL(h); c.setHSL(h.h, h.s, Math.min(1, Math.max(0, h.l + k))); return '#' + c.getHexString(); }
  const mixC = (a, b, t) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString();
  /* matière de pâte (mêmes réglages que la ville : brillance .5, relief .04) */
  function C(color, o) {
    const opts = Object.assign({}, o || {}), key = color + JSON.stringify(opts);
    if (mats[key]) return mats[key];
    const amt = opts.bumpScale === 0 ? 0 : (opts.bumpScale ? opts.bumpScale * 1.9 : .04), sss = opts.sss; delete opts.bumpScale; delete opts.sss;
    return (mats[key] = PVClay.apply(new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .5 }, opts)), amt, sss));
  }
  function mk(geo, mat, x, y, z, p) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); p.add(m); return m; }
  function rbox(w, h, d, r, sg) {
    sg = sg || 3; r = Math.min(r, w / 2 - .001, h / 2 - .001, d / 2 - .001);
    const g = new THREE.BoxGeometry(w, h, d, sg, sg, sg), p = g.attributes.position, v = new THREE.Vector3(), q = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); q.set(Math.max(-w / 2 + r, Math.min(w / 2 - r, v.x)), Math.max(-h / 2 + r, Math.min(h / 2 - r, v.y)), Math.max(-d / 2 + r, Math.min(d / 2 - r, v.z))); const dir = v.clone().sub(q); if (dir.lengthSq() > 0) { dir.normalize().multiplyScalar(r); v.copy(q).add(dir); } p.setXYZ(i, v.x, v.y, v.z); }
    return smoothN(g);
  }
  function lump(g, a, f) { f = f || 1.3; const p = g.attributes.position, s = Math.random() * 10; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = Math.sin(x * 2.1 * f + s) * Math.cos(z * 1.7 * f + y * 1.3 * f + s) + Math.sin(y * 2.7 * f + s) * .5; p.setXYZ(i, x + n * a, y + n * a * .5, z + n * a); } return smoothN(g); }
  /* courbe une forme plate autour de l'axe vertical (tablier qui épouse le ventre) */
  function bend(g, R, fl) { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), Ry = R + Math.max(0, -y) * (fl || 0), a = x / Ry, r = Ry + z; p.setXYZ(i, Math.sin(a) * r, y, Math.cos(a) * r); } return smoothN(g); }
  /* normales lissées, y compris sur les coutures des sphères et des formes tournées (sinon une arête se voit) */
  function smoothN(g) {
    g.computeVertexNormals();
    const p = g.attributes.position, n = g.attributes.normal, m = new Map(), v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { const k = Math.round(p.getX(i) * 1e4) + ',' + Math.round(p.getY(i) * 1e4) + ',' + Math.round(p.getZ(i) * 1e4); const a = m.get(k); if (a) a.push(i); else m.set(k, [i]); }
    m.forEach(a => { if (a.length < 2) return; v.set(0, 0, 0); a.forEach(i => { v.x += n.getX(i); v.y += n.getY(i); v.z += n.getZ(i); }); v.normalize(); a.forEach(i => n.setXYZ(i, v.x, v.y, v.z)); });
    return g;
  }
  /* nuances dans les sommets : fn(x, y, z) rend un facteur (gris) ou [r, v, b] */
  function paint(g, fn) {
    const p = g.attributes.position, o = g.attributes.color, c = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) { let f = fn(p.getX(i), p.getY(i), p.getZ(i)); if (typeof f === 'number') f = [f, f, f]; for (let k = 0; k < 3; k++) c[i * 3 + k] = f[k] * (o ? o.array[i * 3 + k] : 1); }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3)); return g;
  }
  /* colle plusieurs géométries (avec leurs nuances) en une seule */
  function merge(list) {
    const P = [], N = [], Co = [], I = []; let vo = 0; const anyC = list.some(g => g.attributes.color);
    list.forEach(g => { const p = g.attributes.position, n = g.attributes.normal, c = g.attributes.color; for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); if (anyC) Co.push(c ? c.getX(i) : 1, c ? c.getY(i) : 1, c ? c.getZ(i) : 1); } const ix = g.index ? g.index.array : [...Array(p.count).keys()]; for (let i = 0; i < ix.length; i++) I.push(ix[i] + vo); vo += p.count; });
    const o = new THREE.BufferGeometry(); o.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); o.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); if (anyC) o.setAttribute('color', new THREE.Float32BufferAttribute(Co, 3)); o.setIndex(I); return o;
  }
  const xf = (g, x, y, z, rx, ry, rz, sx, sy, sz) => { const o = new THREE.Object3D(); o.position.set(x || 0, y || 0, z || 0); o.rotation.set(rx || 0, ry || 0, rz || 0); o.scale.set(sx || 1, sy || sx || 1, sz || sx || 1); o.updateMatrix(); g.applyMatrix4(o.matrix); return g; };
  /* forme tournée au tour de potier : profil lissé (spline), puis fn(angle, y, rayon) peut creuser des plis */
  function turn(pts, n, rows, fn) {
    const pp = new THREE.SplineCurve(pts.map(q => new THREE.Vector2(q[0], q[1]))).getPoints(rows), g = new THREE.LatheGeometry(pp, n);
    if (fn) { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), r = Math.hypot(x, z); if (r < 1e-4) continue; const d = fn(Math.atan2(x, z), y, r); p.setXYZ(i, x * (r + d) / r, y, z * (r + d) / r); } }
    return smoothN(g);
  }
  /* boudin le long d'une courbe, rayon variable rf(t), bouts arrondis (ou anneau fermé) */
  function tube(pts, n, m, rf, closed) {
    const cv = new THREE.CatmullRomCurve3(pts.map(q => new THREE.Vector3(q[0], q[1], q[2])), !!closed), F = cv.computeFrenetFrames(n, !!closed);
    const P = [], I = [], R = typeof rf === 'function' ? rf : () => rf, nr = closed ? n : n + 1;
    for (let i = 0; i < nr; i++) { const c = cv.getPointAt(i / n), r = R(i / n), N = F.normals[i], B = F.binormals[i]; for (let j = 0; j < m; j++) { const a = j / m * TAU, ca = Math.cos(a) * r, sa = Math.sin(a) * r; P.push(c.x + N.x * ca + B.x * sa, c.y + N.y * ca + B.y * sa, c.z + N.z * ca + B.z * sa); } }
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { const i2 = (i + 1) % nr, a = i * m + j, b = i2 * m + j, c = i2 * m + (j + 1) % m, d = i * m + (j + 1) % m; I.push(a, d, b, b, d, c); }
    if (!closed) [0, n].forEach((i, e) => { const c = cv.getPointAt(i / n), t = F.tangents[i], r = R(i / n) * .9 * (e ? 1 : -1), k = P.length / 3; P.push(c.x + t.x * r, c.y + t.y * r, c.z + t.z * r); for (let j = 0; j < m; j++) { const a = i * m + j, b = i * m + (j + 1) % m; if (e) I.push(k, a, b); else I.push(k, b, a); } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setIndex(I); return smoothN(g);
  }
  /* profil arrondi d'un boudin : épais au milieu, bouts qui s'affinent */
  const plump = (r, k) => t => r * (k + (1 - k) * Math.sin(Math.PI * t));
  const BLOBT = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(30,20,30,.55)'); gr.addColorStop(.6, 'rgba(30,20,30,.25)'); gr.addColorStop(1, 'rgba(30,20,30,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); return t; })();

  /* ---------- tête : sphère un peu affinée vers le menton, pommettes gonflées et rosées, creux sous la mâchoire ---------- */
  const HR = .28, HS = [1, .98, .95];
  const headPt = (u, t) => { const R = HR + t, k = u.y < 0 ? 1 - (-u.y) * .14 : 1; return [u.x * R * k * HS[0], u.y * R * HS[1], u.z * R * k * HS[2]]; };
  const headGeo = () => G_('head4', () => {
    const w = DET < 1 ? 34 : 44, g = new THREE.SphereGeometry(1, w, Math.round(w * .72)), p = g.attributes.position, u = new THREE.Vector3();
    const cheek = (x, y, z, s) => { const dx = x - s * .155, dy = y + .075, dz = z - .2; return Math.exp(-(dx * dx + dy * dy + dz * dz) / (.075 * .075)); };
    for (let i = 0; i < p.count; i++) { u.fromBufferAttribute(p, i).normalize(); const q = headPt(u, 0), b = Math.max(cheek(q[0], q[1], q[2], 1), cheek(q[0], q[1], q[2], -1)); const h = headPt(u, .011 * b); p.setXYZ(i, h[0], h[1], h[2]); }
    smoothN(g);
    return paint(g, (x, y, z) => {
      const b = Math.max(cheek(x, y, z, 1), cheek(x, y, z, -1)), chin = 1 - .2 * sstep(-.17, -.27, y) * sstep(.05, -.1, z), back = 1 - .05 * sstep(0, -.25, z);
      return [chin * back * (1 - .01 * b), chin * back * (1 - .27 * b), chin * back * (1 - .25 * b)];
    });
  });
  /* ---------- cheveux : une coque posée sur le crâne, bord roulé et rentré sous la peau à la lisière ----------
     La lisière est tracée tout autour (haute sur le front pour dégager les sourcils, basse sur la nuque) ;
     la frange n'est qu'un festonnage de cette lisière : des mèches arrondies qui s'arrêtent au-dessus des sourcils. */
  const LIS = { bun: [.238, .15, .05, -.03, -.11], short: [.228, .165, .07, 0, -.09], bob: [.238, .11, -.1, -.15, -.16], curly: [.228, .165, .08, 0, -.07], hat: [.22, .12, .055, -.02, -.09], toque: [.22, .12, .045, -.03, -.1] };
  const KN = [0, .25, .45, .62, 1];
  function hairline(lk, phi) {
    const a = Math.abs(phi) / Math.PI, L = LIS[lk.style] || LIS.hat; let i = 0; while (i < 3 && a > KN[i + 1]) i++;
    const t = (a - KN[i]) / (KN[i + 1] - KN[i]), s = t * t * (3 - 2 * t); let h = L[i] + (L[i + 1] - L[i]) * s;
    if (lk.fringe) h -= .026 * Math.pow(.5 + .5 * Math.cos(phi * 14), 1.4) * (1 - sstep(.17, .3, a));
    return h;
  }
  function hairShell(lk) {
    const cols = DET < 1 ? 40 : 56, ribs = lk.style !== 'curly', P = [], Co = [], I = [];
    /* rangs du sommet (v = 0) à la lisière (v = 1) : épaisseur relative, puis le bord qui s'enroule et rentre sous la peau */
    const rows = [[0, 1], [.18, 1], [.36, 1], [.52, 1], [.66, 1], [.78, 1], [.87, 1], [.93, .97], [.97, .86], [.995, .62], [1.008, .3], [1.014, -.2], [1.012, -.9]];
    for (let r = 0; r < rows.length; r++) for (let c = 0; c <= cols; c++) {
      const phi = -Math.PI + c / cols * TAU, h = hairline(lk, phi), th = Math.acos(Math.max(-.98, Math.min(.98, h / (HR * HS[1])))) * rows[r][0];
      const rib = ribs ? (.5 + .5 * Math.cos(phi * 14)) * sstep(.12, .5, rows[r][0]) : .5;
      const T = .024 + (lk.fringe ? .008 : 0) * (1 - sstep(0, .3, Math.abs(phi) / Math.PI)) * sstep(.5, .9, rows[r][0]) + .009 * (rib - .5), f = rows[r][1];
      const u = new THREE.Vector3(Math.sin(th) * Math.sin(phi), Math.cos(th), Math.sin(th) * Math.cos(phi)), q = headPt(u, f > 0 ? T * f : .012 * f);
      P.push(q[0], q[1], q[2]); const k = (ribs ? .78 + .22 * rib : 1) * (f < .5 ? .78 + .22 * Math.max(0, f) : 1); Co.push(k, k, k);
    }
    for (let r = 0; r < rows.length - 1; r++) for (let c = 0; c < cols; c++) { const a = r * (cols + 1) + c, b = a + cols + 1; I.push(a, b, a + 1, b, b + 1, a + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(Co, 3)); g.setIndex(I);
    return smoothN(g);
  }
  /* un point posé sur la coque des cheveux (direction phi, hauteur y), pour y planter boucles et chignon */
  function onHair(lk, phi, v, out) { const h = hairline(lk, phi), th = Math.acos(Math.max(-.98, Math.min(.98, h / (HR * HS[1])))) * v, u = new THREE.Vector3(Math.sin(th) * Math.sin(phi), Math.cos(th), Math.sin(th) * Math.cos(phi)); return headPt(u, .024 + (out || 0)); }
  function hair(lk, head, m) {
    mk(G_('hairS_' + lk.style + (lk.fringe ? 'f' : ''), () => hairShell(lk)), m, 0, 0, 0, head);
    if (lk.style === 'bun') { mk(G_('bun3', () => paint(lump(sph(.13, 16), .008), (x, y) => .88 + .12 * sstep(-.1, .1, y))), m, 0, .25, -.17, head); const coil = mk(G_('coil2', () => tube(Array.from({ length: 13 }, (_, i) => { const a = i / 12 * TAU * .92; return [Math.cos(a) * .1, Math.sin(a) * .1, 0]; }), 30, 8, plump(.032, .5))), m, 0, .2, -.13, head); coil.rotation.x = Math.PI / 2 - .5; }
    if (lk.style === 'curly') {
      /* boucles serrées sur le sommet, l'arrière et les côtés ; aucune sur le visage (elles restent au-dessus de la lisière) */
      const cg = G_('curl3', () => paint(lump(sph(.085, 10), .006), (x, y) => .82 + .18 * sstep(-.06, .06, y))), n = mobile ? 18 : 24;
      for (let i = 0; i < n; i++) { const phi = (i * 2.39996) % TAU - Math.PI, v = (.35 + .6 * ((i * .618) % 1)) * (Math.abs(phi) < 1.1 ? .7 : 1), q = onHair(lk, phi, v, -.012); mk(cg, m, q[0], q[1], q[2], head).scale.setScalar(.85 + .3 * ((i * .37) % 1)); }
    }
    if (lk.style === 'bob') { [-1, 1].forEach(sg => mk(G_('bob3', () => paint(lump(sph(.16, 14), .006), (x, y) => .8 + .2 * sstep(-.2, .1, y))), m, sg * .225, -.07, -.06, head).scale.set(.62, 1.2, 1.05)); mk(G_('bobb2', () => paint(sph(.2, 14), (x, y) => .82 + .18 * sstep(-.2, .1, y))), m, 0, -.04, -.17, head).scale.set(1.22, 1.05, .7); }
    if (lk.style === 'short') mk(G_('side', () => sph(.12, 10)), m, .2, .1, .03, head).scale.set(.55, .7, 1.1);
    if (lk.style === 'beret' || lk.style === 'flatcap') [-1, 1].forEach(sg => mk(G_('tuft2', () => paint(lump(sph(.075, 10), .006), (x, y) => .85 + .15 * sstep(-.05, .05, y))), m, sg * .262, -.01, -.05, head));
    if (lk.style === 'beret') { const b = mk(G_('beret', () => lump(cyl(.26, .28, .08, 22), .004)), C(lk.hat), .03, .28, -.02, head); b.rotation.z = .22; mk(sph(.035, 8), C(lk.hat), .07, .34, -.02, head); }
    if (lk.style === 'flatcap') { const fc = mk(G_('fcap2', () => paint(lump(sph(.3, 18), .004), (x, y) => .85 + .15 * sstep(-.05, .1, y))), C(lk.hat), 0, .2, -.03, head); fc.scale.set(1.05, .42, 1.1); const v = mk(G_('fvis2', () => paint(cyl(.17, .17, .028, 16), (x, y) => y < 0 ? .75 : 1)), C(shade(lk.hat, -.06)), 0, .17, .21, head); v.scale.set(1, 1, .55); v.rotation.x = .16; }
    if (lk.style === 'cap') { mk(G_('capdome3', () => paint(new THREE.SphereGeometry(.315, 22, 10, 0, TAU, 0, Math.PI * .46), (x, y) => .82 + .18 * sstep(.04, .2, y))), C(lk.hat), 0, .11, 0, head); const v = mk(G_('visor2', () => paint(cyl(.2, .2, .03, 18), (x, y) => y < 0 ? .72 : 1)), C(shade(lk.hat, -.05)), 0, .145, .2, head); v.scale.set(1, 1, .7); v.rotation.x = .18; mk(sph(.03, 8), C(shade(lk.hat, .1)), 0, .425, 0, head); }
    if (lk.style === 'toque') {
      /* toque de boulanger : bandeau roulé et dessus bouffant fait de boules de pâte écrasées les unes contre les autres */
      const w = C('#fbf8f2');
      mk(G_('toqB', () => paint(turn([[.19, -.075], [.255, -.075], [.283, -.055], [.29, 0], [.287, .06], [.275, .085], [.001, .09]], 30, 14), (x, y) => .86 + .14 * sstep(-.06, .05, y))), w, 0, .24, -.01, head);
      mk(G_('toqT', () => { const parts = [paint(lump(sph(.24, 20), .012), (x, y) => .84 + .16 * sstep(-.1, .14, y))]; for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; parts.push(paint(xf(lump(sph(.13, 12), .006), Math.sin(a) * .19, .02 + (i % 2) * .03, Math.cos(a) * .19), (x, y) => .8 + .2 * sstep(-.08, .1, y))); } return merge(parts); }), w, 0, .4, -.02, head).scale.set(1, .78, 1);
    }
    if (lk.mustache === 'big') { [-1, 1].forEach(sg => mk(G_('mustB', () => tube([[.0, 0, 0], [.04, -.012, -.004], [.08, -.008, -.02], [.1, .022, -.035]], 18, 8, t => .026 * (1 - .65 * t) + .004)), m, 0, -.08, .262, head).scale.x = sg); }
    else if (lk.mustache) [-1, 1].forEach(sg => { const ms = mk(G_('must2', () => paint(lump(sph(.055, 10), .004), (x, y) => .85 + .15 * sstep(-.04, .03, y))), m, sg * .05, -.075, .255, head); ms.scale.set(1.3, .6, .6); ms.rotation.z = sg * .35; });
  }

  /* ---------- vêtements ---------- */
  /* buste : profil arrondi jusqu'au ventre, deux plis mous à la taille, aisselles et dessous un peu plus sombres */
  const TORSO = [[.001, -.055], [.13, -.05], [.205, -.02], [.247, .04], [.258, .12], [.256, .2], [.244, .32], [.224, .42], [.198, .5], [.145, .56], [.088, .585], [.001, .593]];
  const torsoR = y => { for (let i = 1; i < TORSO.length; i++) if (y <= TORSO[i][1]) { const a = TORSO[i - 1], b = TORSO[i], t = (y - a[1]) / (b[1] - a[1]); return a[0] + (b[0] - a[0]) * t; } return .001; };
  const crease = (y, y0, w) => Math.exp(-Math.pow((y - y0) / w, 2));
  const torsoGeo = () => G_('torso4', () => {
    const fold = (a, y) => crease(y, .1 + .012 * Math.sin(a * 3), .017) + .7 * crease(y, .17 - .01 * Math.cos(a * 2), .015);
    const drape = (a, y) => Math.pow(.5 + .5 * Math.cos(a * 5 + 1), 3) * sstep(.34, .06, y);
    const g = turn(TORSO, DET < 1 ? 26 : 36, DET < 1 ? 30 : 44, (a, y) => (-.01 * fold(a, y) - .007 * drape(a, y)) * (Math.abs(Math.sin(a)) < .9 ? 1 : .4));
    return paint(g, (x, y, z) => { const a = Math.atan2(x, z); return (1 - .22 * fold(a, y)) * (1 - .14 * drape(a, y)) * (1 - .25 * sstep(.04, -.05, y)) * (1 - .2 * sstep(.75, 1, Math.abs(Math.sin(a))) * crease(y, .44, .07)); });
  });
  /* jupe : godets qui ondulent vers le bas, fond des plis plus sombre, ourlet en boudin épais qui suit les vagues */
  const SKIRT = [[.372, -.135], [.345, -.07], [.3, .03], [.262, .11], [.24, .17]];
  function skirtGeo() {
    return G_('skirt3', () => {
      const amp = y => .03 * sstep(.11, -.13, y), wave = a => Math.cos(a * 8);
      const g = turn(SKIRT, 40, 18, (a, y) => amp(y) * wave(a));
      paint(g, (x, y, z) => { const a = Math.atan2(x, z); return 1 - .28 * (.5 - .5 * wave(a)) * amp(y) / .03 - .08 * sstep(.05, .14, y); });
      const yh = -.135, rh = .372, hem = [];
      for (let i = 0; i < 64; i++) { const a = i / 64 * TAU, r = rh + amp(yh) * wave(a) - .004; hem.push([Math.sin(a) * r, yh - .006 + .004 * wave(a), Math.cos(a) * r]); }
      const h = paint(tube(hem, 96, 7, .022, true), (x, y) => .9 + .1 * sstep(-.16, -.13, y));
      const bot = paint(xf(new THREE.CircleGeometry(.36, 32), 0, yh - .01, 0, Math.PI / 2), () => .55);
      return merge([g, h, bot]);
    });
  }
  /* manche : épaule arrondie qui se pose sur le buste, plis au coude, poignet évasé ; roulée au coude pour Sam et le boulanger */
  function sleeveGeo(type) {
    return G_('sleeve_' + type, () => {
      const prof = type === 'puff' ? [[.001, .085], [.06, .075], [.086, .035], [.088, -.02], [.072, -.1], [.064, -.17], [.068, -.24], [.08, -.29], [.085, -.305]]
        : type === 'rolled' ? [[.001, .08], [.052, .07], [.077, .036], [.079, 0], [.074, -.08], [.071, -.13], [.072, -.15]]
        : [[.001, .08], [.052, .07], [.077, .036], [.079, 0], [.071, -.08], [.066, -.17], [.068, -.25], [.074, -.295], [.077, -.305]];
      const yEnd = prof[prof.length - 1][1], rEnd = prof[prof.length - 1][0];
      const elbow = (a, y) => crease(y, -.135 + .014 * Math.sin(a), .013) + .6 * crease(y, -.175 - .012 * Math.sin(a + 1), .012);
      const g = turn(prof.concat([[rEnd * .75, yEnd - .012], [.045, yEnd - .02], [.001, yEnd - .022]]).reverse(), DET < 1 ? 16 : 22, 30, type === 'rolled' ? null : (a, y) => -.008 * elbow(a, y));
      paint(g, (x, y, z) => { const a = Math.atan2(x, z); return (type === 'rolled' ? 1 : 1 - .26 * elbow(a, y)) * (1 - .14 * sstep(.6, 1, -x / Math.hypot(x, z) || 0) * sstep(.02, -.04, y)); });
      /* ourlet : boudin épais au bout de la manche */
      const ring = []; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; ring.push([Math.sin(a) * (rEnd - .006), yEnd + .002, Math.cos(a) * (rEnd - .006)]); }
      return merge([g, paint(tube(ring, 32, 7, type === 'rolled' ? .028 : .019, true), (x, y) => .88 + .12 * sstep(yEnd - .02, yEnd + .01, y))]);
    });
  }
  /* main en pâte : paume, trois doigts en boudins un peu repliés et un pouce, poignet qui rentre dans la manche */
  const handGeo = (forearm) => G_('hand5' + (forearm ? 'f' : ''), () => {
    const parts = [paint(xf(sph(.056, 13), 0, -.012, 0, 0, 0, 0, 1, 1.08, .7), (x, y, z) => 1 - .1 * sstep(.0, -.04, z)), xf(new THREE.CylinderGeometry(.034, .038, .07, seg(11), 1, true), 0, .035, 0)];
    [-1, 0, 1].forEach(k => parts.push(paint(tube([[k * .029, -.05, .004], [k * .033, -.078 + Math.abs(k) * .008, -.006], [k * .035, -.096 + Math.abs(k) * .012, -.024]], 6, seg(8), plump(.0175, .78)), (x, y) => .95 + .05 * sstep(-.1, -.06, y))));
    parts.push(tube([[-.04, -.0, .018], [-.06, -.025, .03], [-.064, -.047, .038]], 6, seg(8), plump(.018, .75)));
    if (forearm) parts.push(turn([[.034, 0], [.037, .03], [.044, .1], [.047, .2], [.04, .225], [.001, .23]], 14, 14));
    return paint(merge(parts), (x, y, z) => 1 - .1 * crease(y, -.05, .012));
  });
  /* chaussure : bout rond qui se relève un peu, semelle en boudin dépassant tout autour, talon pour les souliers de ville */
  const shoeGeo = () => G_('shoe3', () => {
    const g = sph(.1, 16), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { let x = p.getX(i) * .9, y = p.getY(i) * .66, z = p.getZ(i); z *= z > 0 ? 1.5 : 1.1; if (y < -.03) y = -.03 + (y + .03) * .25; y += Math.max(0, z - .06) * .16; p.setXYZ(i, x, y, z); }
    return paint(lump(g, .004), (x, y, z) => .82 + .18 * sstep(-.04, .03, y) - .08 * sstep(.1, .14, z) * sstep(.0, .04, y));
  });
  const soleGeo = (heel) => G_('sole3' + (heel ? 'h' : ''), () => {
    const g = sph(.1, 14), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const z = p.getZ(i); p.setXYZ(i, p.getX(i) * .98, p.getY(i) * .19, z * (z > 0 ? 1.58 : 1.16)); }
    const parts = [smoothN(g)]; if (heel) parts.push(xf(rbox(.13, .035, .07, .015, 2), 0, -.012, -.07));
    return paint(merge(parts), (x, y) => .78 + .22 * sstep(-.02, .015, y));
  });
  /* bouton : disque bombé au centre creusé, deux trous */
  const btnGeo = () => G_('btn3', () => paint(xf(turn([[.001, -.004], [.016, -.003], [.017, .003], [.014, .006], [.008, .0045], [.001, .003]], 12, 8), 0, 0, 0, Math.PI / 2), (x, y, z) => { const d = Math.hypot(x, y); return d < .006 ? .55 : d < .011 ? .85 : 1; }));

  function makeChar(lk, kit) {
    kit = kit || {}; const pDET = DET; if (kit.det) DET = kit.det;
    const g = new THREE.Group(), P = {};
    const SSS_SKIN = [.55, .2, .1], skinO = { roughness: .46, emissive: lk.skin, emissiveIntensity: .035, sss: SSS_SKIN };
    const K = (c, o) => C(c, Object.assign({ roughness: .62 }, o)); /* tissu : un peu plus mat que la peau et les cheveux */
    const skinM = C(lk.skin, skinO), clothM = K(lk.shirt), pantM = K(lk.pants || '#3a3a4a'), hairM = C(lk.hair);
    const shoeCol = lk.shoes || '#4a3326', sneak = lk.outfit === 'hoodie', shoeM = K(shoeCol), soleM = K(sneak ? '#f4efe6' : shade(shoeCol, -.1));
    P.shadow = kit.blob ? kit.blob(0, 0, .42, g, .038) : new THREE.Object3D(); /* ombre douce au-dessus des pavés */
    const dress = lk.outfit === 'dress';
    P.legs = [-1, 1].map(sg => {
      const pv = new THREE.Group(); pv.position.set(sg * .1, .42, 0); g.add(pv);
      mk(G_('leg3', () => paint(rbox(.16, .34, .18, .075, 3), (x, y) => .85 + .15 * sstep(-.17, -.05, y))), pantM, 0, -.16, 0, pv);
      /* ourlet du pantalon (pas sous une robe : ce sont des collants) */
      if (!dress) mk(G_('legHem', () => paint(tube(Array.from({ length: 16 }, (_, i) => { const a = i / 16 * TAU; return [Math.sin(a) * .088, 0, Math.cos(a) * .098]; }), seg(22), 5, .02, true), () => .88)), pantM, 0, -.29, 0, pv);
      mk(shoeGeo(), shoeM, 0, -.33, .045, pv);
      mk(soleGeo(!sneak), soleM, 0, -.376, .045, pv);
      /* lacets en boudins (baskets, chaussures de ville) ou bride et bouton (souliers de fille) */
      if (dress) { const st = mk(G_('strap', () => tube(Array.from({ length: 9 }, (_, i) => { const a = Math.PI * (i / 8); return [Math.cos(a) * .088, Math.sin(a) * .045, 0]; }), 16, 6, .011)), soleM, 0, -.305, .035, pv); st.rotation.x = -.25; mk(btnGeo(), soleM, sg * .085, -.31, .045, pv).rotation.y = sg * 1.2; }
      else mk(G_('laces', () => merge([-1, 1].map(s => tube([[-.035, 0, s * .014 + .004], [0, .004, s * -.006], [.035, 0, s * .014 - .02]], 5, 5, .0075)).concat([xf(tube([[-.03, 0, 0], [0, .005, 0], [.03, 0, 0]], 5, 5, .0075), 0, -.004, .048)]))), sneak ? K(shade(shoeCol, -.3)) : soleM, 0, -.268, .1, pv).rotation.x = .3;
      return pv;
    });
    const body = new THREE.Group(); body.position.y = .42; g.add(body); P.body = body;
    mk(torsoGeo(), clothM, 0, 0, 0, body).scale.z = .8;
    const front = y => torsoR(y) * .8;
    if (dress) {
      mk(skirtGeo(), clothM, 0, 0, 0, body).scale.z = .86;
      /* couture de la taille en boudin */
      mk(G_('waist', () => paint(tube(Array.from({ length: 20 }, (_, i) => { const a = i / 20 * TAU; return [Math.sin(a) * .262, 0, Math.cos(a) * .262]; }), 30, 6, .016, true), () => .9)), K(lk.collar || shade(lk.shirt, .1)), 0, .1, 0, body).scale.z = .82;
      /* col Claudine : deux pétales arrondis posés sur la poitrine */
      [-1, 1].forEach(sg => { const c = mk(G_('claud', () => paint(lump(sph(.07, 14), .002), (x, y) => .82 + .18 * sstep(-.01, .015, y))), K(lk.collar || '#fff8ee'), sg * .062, .556, .088, body); c.scale.set(1.2, .26, .95); c.rotation.set(.62, sg * .25, -sg * .3); });
      /* boutons du corsage */
      [.44, .35].forEach(y => mk(btnGeo(), K(lk.collar || '#fff8ee'), 0, y, front(y) + .002, body));
    }
    if (lk.outfit === 'cardigan') {
      [-1, 1].forEach(sg => { const l = mk(G_('lapel2', () => paint(rbox(.07, .38, .04, .018, 3), (x, y) => .85 + .15 * sstep(-.19, .1, y))), K(shade(lk.shirt, -.08)), sg * .06, .3, .19, body); l.rotation.z = sg * .14; });
      mk(G_('pocket', () => paint(rbox(.11, .08, .035, .016, 2), (x, y) => y > .03 ? .8 : 1)), K(shade(lk.shirt, -.1)), .12, .12, .205, body).rotation.y = .4;
    }
    if (lk.outfit === 'hoodie') { mk(G_('hood2', () => paint(lump(sph(.2, 14), .008), (x, y, z) => .8 + .2 * sstep(-.05, .1, y) * sstep(.1, -.05, z))), clothM, 0, .55, -.14, body).scale.set(1.15, .65, .75); [-1, 1].forEach(sg => mk(G_('cord2', () => tube([[0, .08, 0], [0, 0, .006], [.004, -.07, .01]], 8, 6, .011)), K('#fff8ee'), sg * .055, .43, .19, body)); mk(G_('kpk', () => paint(bend(rbox(.24, .11, .04, .02, 3), .25), (x, y) => y > .04 ? .82 : 1)), K(shade(lk.shirt, -.08)), 0, .1, -.05, body).scale.z = .8; }
    if (lk.outfit === 'chef') {
      /* veste croisée de boulanger : col officier roulé, deux rangées de boutons */
      const fl = mk(G_('chefFlap', () => paint(bend(rbox(.26, .4, .02, .01, 3), .25), (x) => x > .115 ? .8 : 1)), clothM, 0, .3, 0, body); fl.scale.z = .8; fl.rotation.y = .1;
      [-1, 1].forEach(sg => [.44, .34, .24].forEach(y => mk(btnGeo(), K('#e8dcc8'), sg * .075 + .025, y, .8 * Math.sqrt(.262 * .262 - Math.pow(sg * .075 + .025, 2)) + .004, body).rotation.y = (sg * .075 + .025) * 3.5));
    }
    /* encolure en boudin (sous le col Claudine pour une robe) */
    mk(G_('collar2', () => paint(tube(Array.from({ length: 18 }, (_, i) => { const a = i / 18 * TAU; return [Math.sin(a) * .115, 0, Math.cos(a) * .115]; }), seg(26), 7, .032, true), (x, y) => .82 + .18 * sstep(-.02, .02, y))), K(lk.outfit === 'chef' ? lk.shirt : (lk.collar || shade(lk.shirt, .12))), 0, lk.outfit === 'chef' ? .565 : .55, 0, body);
    if (lk.apron) {
      /* tablier qui épouse le ventre, ourlet roulé, poche à bord épais, cordon de taille */
      mk(G_('apron3', () => { const a = paint(bend(rbox(.34, .42, .05, .024, 6), .262, .4), (x, y) => .92 + .08 * sstep(-.2, .1, y)), r = paint(bend(xf(tube([[-.165, 0, 0], [0, 0, .004], [.165, 0, 0]], 16, 6, .016), 0, -.205, .022), .262, .4), () => .9); return merge([a, r]); }), K(lk.apron), 0, .18, 0, body).scale.z = .8;
      mk(G_('apronPk2', () => paint(bend(rbox(.16, .09, .04, .018, 4), .333), (x, y) => y > .03 ? .78 : 1)), K(shade(lk.apron, -.06)), 0, .12, 0, body).scale.z = .8;
      mk(G_('apronTie2', () => tube(Array.from({ length: 20 }, (_, i) => { const a = i / 20 * TAU; return [Math.sin(a) * .222, 0, Math.cos(a) * .222]; }), 32, 6, .013, true)), K(lk.apron), 0, .3, 0, body).scale.z = .82;
    }
    if (lk.stripes) for (let i = 0; i < 3; i++) { const y = .16 + i * .12, r = torsoR(y + .05) + .004; const s = mk(G_('stripe' + i, () => tube(Array.from({ length: 20 }, (_, k) => { const a = k / 20 * TAU; return [Math.sin(a) * r, 0, Math.cos(a) * r]; }), 32, 6, .019, true)), K(lk.stripes), 0, y + .05, 0, body); s.scale.z = .8; }
    if (lk.buttons) for (let i = 0; i < 3; i++) { const y = .12 + i * .12; mk(btnGeo(), K(lk.buttons), 0, y, front(y) + .004, body); }
    if (lk.scarf) { const sc = mk(G_('scarf2', () => paint(lump(new THREE.TorusGeometry(.15, .065, 10, 20), .005), (x, y, z) => .85 + .15 * Math.abs(Math.sin(Math.atan2(y, x) * 5)))), K(lk.scarf), 0, .56, 0, body); sc.rotation.x = Math.PI / 2; const tail = mk(G_('scarfT', () => paint(rbox(.11, .28, .05, .024, 3), (x, y) => y < -.11 ? .82 : 1)), K(lk.scarf), .09, .4, .19, body); tail.rotation.z = .15; }
    if (lk.backpack) { mk(G_('bp', () => paint(rbox(.34, .38, .17, .08, 3), (x, y, z) => z > .05 && y > .1 ? .85 : 1)), K(lk.backpack), 0, .3, -.24, body); [-1, 1].forEach(sg => mk(G_('bpS', () => rbox(.045, .38, .03, .014, 2)), K(shade(lk.backpack, -.15)), sg * .12, .32, .19, body)); }
    P.hands = [];
    const sl = dress ? 'puff' : lk.rolled ? 'rolled' : 'std', handY = sl === 'puff' ? -.355 : -.36;
    P.arms = [-1, 1].map(sg => {
      const pv = new THREE.Group(); pv.position.set(sg * .27, .5, 0); body.add(pv);
      mk(sleeveGeo(sl), clothM, 0, 0, 0, pv).scale.z = .92;
      /* poignets assortis au col sur la robe */
      const h = new THREE.Group(); h.position.y = handY; h.rotation.y = -sg * .45; pv.add(h); P.hands.push(h);
      const hm = mk(handGeo(sl === 'rolled'), skinM, 0, 0, 0, h); hm.scale.x = sg;
      pv.rotation.z = sg * .1; return pv;
    });
    if (lk.hold === 'flower') { const f = new THREE.Group(); f.position.set(0, -.39, .04); f.rotation.x = -1.15; P.arms[1].add(f); mk(G_('stem', () => tube([[0, -.16, 0], [.01, 0, .005], [0, .16, 0]], 8, 5, .011)), K(lk.leaf || '#6a9a4a'), 0, .12, 0, f); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; mk(G_('pet2', () => paint(lump(sph(.04, 8), .002), (x, y) => .8 + .2 * sstep(-.03, .03, y))), K('#e2374f'), Math.cos(a) * .04, .3, Math.sin(a) * .04, f); } mk(sph(.03, 8), K('#ffd35a'), 0, .31, 0, f); }
    const head = new THREE.Group(); head.position.y = .91; head.scale.setScalar(1.08); body.add(head); P.head = head;
    /* le cou suit la tête (même objet) : il tourne sur son axe, ça ne se voit pas */
    mk(G_('neck3', () => paint(cyl(.074, .084, .16, 12), (x, y) => .78 + .22 * sstep(-.08, .06, y))), skinM, 0, -.29, 0, head);
    mk(headGeo(), skinM, 0, 0, 0, head);
    if (lk.style !== 'bob') [-1, 1].forEach(sg => { mk(G_('ear2', () => paint(sph(.06, 10), (x, y, z) => .9 + .1 * sstep(-.02, .03, z))), skinM, sg * .27, -.01, -.01, head).scale.set(.45, 1, .8); mk(G_('earIn', () => sph(.032, 8)), C(shade(lk.skin, -.1), skinO), sg * .29, -.012, .0, head).scale.set(.35, 1, .75); });
    /* yeux (fixes dans la tête : fusionnés avec elle) ; seules les paupières et les sourcils bougent */
    const EYE_W = C('#fbf7f0', { roughness: .2, bumpScale: 0 }), PUPIL = C('#120e18', { roughness: .2, bumpScale: 0 }), SHINE = kit.shine || (makeChar.SHINE = makeChar.SHINE || new THREE.MeshBasicMaterial({ color: '#ffffff' }));
    [-1, 1].forEach(sg => { const x = sg * .1, y = .03, z = .218;
      mk(G_('eyeW2', () => sph(.068, 16)), EYE_W, x, y, z, head).scale.z = .55;
      mk(G_('iris', () => sph(.043, 14)), C(lk.eyes || '#5a3a22', { roughness: .2, bumpScale: 0 }), x, y - .004, z + .026, head).scale.z = .5;
      mk(G_('pup2', () => sph(.026, 10)), PUPIL, x, y - .006, z + .036, head).scale.z = .5;
      mk(G_('shine2', () => sph(.014, 6)), SHINE, x + .016, y + .018, z + .045, head); mk(G_('shine3', () => sph(.007, 6)), SHINE, x - .012, y - .016, z + .044, head);
      if (lk.lashes) mk(G_('lash2', () => tube([[-.06, .03, -.004], [-.03, .062, .006], [.02, .066, .006], [.058, .046, -.002], [.078, .052, -.008]], 14, 5, t => .0058 * (.6 + .4 * Math.sin(Math.PI * t)))), PUPIL, x, y, z + .018, head).scale.x = sg;
    });
    /* paupières : les deux dans un seul objet, qui pivote autour de l'axe des yeux */
    const lw = new THREE.Group(); lw.position.set(0, .03, .218); lw.scale.z = .85; head.add(lw); const lid = new THREE.Group(); lw.add(lid); lid.rotation.x = -1.25; P.lids = [lid];
    [-1, 1].forEach(sg => mk(G_('lid2', () => paint(new THREE.SphereGeometry(.074, 16, 8, 0, TAU, 0, Math.PI / 2), (x, y) => .92 + .08 * sstep(.07, .02, y))), skinM, sg * .1, 0, 0, lid));
    /* sourcils : boudins effilés, posés sur la peau du front, bien sous la lisière des cheveux */
    P.browY = .115;
    const bg = new THREE.Group(); bg.position.set(0, P.browY, .229); head.add(bg); P.brows = [bg];
    [-1, 1].forEach(sg => { const b = mk(G_('brow5', () => tube([[-.042, -.006, .011], [-.012, .005, .003], [.022, .006, -.011], [.044, -.004, -.025]], 14, 7, t => .013 * (.55 + .45 * Math.sin(Math.PI * (.25 + .75 * t))))), C(shade(lk.hair, -.2)), sg * .1, 0, 0, bg); b.scale.x = sg; });
    mk(G_('nose2', () => paint(sph(.05, 12), (x, y) => .9 + .1 * sstep(-.04, .02, y))), C(shade(lk.skin, -.05), skinO), 0, -.035, .265, head).scale.set(1.05, .9, 1.1);
    const mouth = new THREE.Group(); mouth.position.set(0, -.115, .238); head.add(mouth); P.mouth = mouth;
    const sm = mk(G_('smile2', () => new THREE.TorusGeometry(.05, .013, 6, 14, Math.PI)), C('#7a2a2a', { bumpScale: 0 }), 0, .01, 0, mouth); sm.rotation.z = Math.PI; sm.userData.keep = true; P.smile = sm;
    P.open = new THREE.Group(); mouth.add(P.open); mk(G_('mopen2', () => sph(.045, 12)), C('#5a1a1a', { bumpScale: 0 }), 0, -.005, 0, P.open).scale.z = .4; mk(G_('teeth', () => rbox(.05, .014, .01, .004, 1)), C('#ffffff', { bumpScale: 0 }), 0, .03, .014, P.open); P.open.scale.set(1, .01, 1);
    hair(lk, head, hairM);
    if (lk.tote) {
      const t = new THREE.Group(); t.position.set(-.3, .08, -.1); t.rotation.z = .08; body.add(t);
      mk(G_('tote', () => paint(rbox(.22, .24, .07, .03, 3), (x, y) => .85 + .15 * sstep(-.12, .05, y))), C(lk.tote), 0, 0, 0, t);
      mk(G_('toteS', () => rbox(.03, .46, .02, .01, 1)), C(shade(lk.tote, -.1)), .06, .26, -.01, t).rotation.z = -.35;
      const bq = mk(G_('bag', () => paint(cyl(.022, .022, .46, 8), (x, y) => Math.abs(Math.sin(y * 40)) < .25 ? .75 : 1)), C('#d9a05a'), -.03, .2, .01, t); bq.rotation.z = .3; bq.scale.set(1.15, 1, 1.15);
    }
    if (lk.balloon) {
      const bl = new THREE.Group(); g.add(bl); P.balloon = bl;
      mk(cyl(.004, .004, 1.35, 4), C('#fff8ee', { bumpScale: 0 }), 0, .67, 0, bl);
      const ball = mk(sph(.17, 16), C(lk.balloon, { roughness: .25, bumpScale: 0, emissive: lk.balloon, emissiveIntensity: .12 }), 0, 1.53, 0, bl); ball.scale.set(1, 1.15, 1);
      mk(G_('knot', () => cyl(.02, .035, .04, 8)), C(lk.balloon, { bumpScale: 0 }), 0, 1.35, 0, bl);
    }
    DET = pDET;
    return { g, P };
  }
  PVClay.char = makeChar;
  PVClay.shade = shade;
})();
