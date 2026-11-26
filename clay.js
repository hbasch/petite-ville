/* Matière « pâte à modeler » commune à la ville et à la boulangerie.
   Pas de texture plaquée (donc rien ne peut s'étirer) : le relief est calculé en 3D, dans le repère de chaque objet,
   corrigé de son échelle. Ce sont de larges creux doux, comme des pressions de pouce, plus un grain très fin qui s'efface au loin.
   S'y ajoutent une légère variation de teinte, une brillance grasse qui varie d'un endroit à l'autre, une lumière chaude
   qui « traverse » la pâte au bord des zones éclairées, un assombrissement au contact du sol (creux, pieds des murs)
   et un reflet doux sur les arêtes (atténués la nuit). */
(function () {
  const U = { day: { value: 1 }, ground: { value: 1 },
    /* reflets : couleurs du ciel en haut, à l'horizon et du sol (linéaires), données par la scène */
    envT: { value: new THREE.Color(.45, .62, .85) }, envH: { value: new THREE.Color(.75, .8, .85) }, envG: { value: new THREE.Color(.3, .22, .16) } };
  const NOISE = `
varying vec3 vClayP;
varying float vClayY;
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
    sh.uniforms.claySSS = { value: this.userData.claySSS || SSS0 };
    sh.uniforms.clayEnvK = { value: this.envMapIntensity };
    sh.uniforms.clayStone = { value: this.userData.clayStone || 0 };
    sh.uniforms.clayEnvT = U.envT; sh.uniforms.clayEnvH = U.envH; sh.uniforms.clayEnvG = U.envG;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vClayP;\nvarying float vClayY;')
      .replace('#include <project_vertex>', `#include <project_vertex>
  vec4 clayC = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
    clayC = instanceMatrix * clayC;
  #endif
  vClayP = clayC.xyz * vec3(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz), length(modelMatrix[2].xyz));
  vClayY = (modelMatrix * clayC).y;`);
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
    m.customProgramCacheKey = () => 'clay3';
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
      const g = c.geometry, p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv, cnt = p.count, col = c.material.color;
      for (let i = 0; i < cnt; i++) {
        _v.fromBufferAttribute(p, i).applyMatrix4(M); P[(vo + i) * 3] = _v.x; P[(vo + i) * 3 + 1] = _v.y; P[(vo + i) * 3 + 2] = _v.z;
        _v.fromBufferAttribute(n, i).applyMatrix3(_m3).normalize(); N[(vo + i) * 3] = _v.x; N[(vo + i) * 3 + 1] = _v.y; N[(vo + i) * 3 + 2] = _v.z;
        if (uv) { UV[(vo + i) * 2] = uv.getX(i); UV[(vo + i) * 2 + 1] = uv.getY(i); }
        if (CO) { CO[(vo + i) * 3] = col.r; CO[(vo + i) * 3 + 1] = col.g; CO[(vo + i) * 3 + 2] = col.b; }
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
      if (b.list.length < 2) return;
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

  window.PVClay = { U, apply, bake };
})();
