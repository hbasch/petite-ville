/* Matière « pâte à modeler » commune à la ville et à la boulangerie.
   Pas de texture plaquée (donc rien ne peut s'étirer) : le relief est calculé en 3D, dans le repère de chaque objet,
   corrigé de son échelle. Ce sont de larges creux doux, comme des pressions de pouce, plus un grain très fin qui s'efface au loin.
   S'y ajoutent une légère variation de teinte, un reflet satiné sur les bords et un peu de lumière diffusée dans la matière
   (atténuée la nuit). */
(function () {
  const U = { day: { value: 1 } };
  const NOISE = `
varying vec3 vClayP;
uniform float clayAmt;
uniform float clayDay;
float cHash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float cNoise(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(cHash(i), cHash(i + vec3(1., 0., 0.)), f.x), mix(cHash(i + vec3(0., 1., 0.)), cHash(i + vec3(1., 1., 0.)), f.x), f.y),
             mix(mix(cHash(i + vec3(0., 0., 1.)), cHash(i + vec3(1., 0., 1.)), f.x), mix(cHash(i + vec3(0., 1., 1.)), cHash(i + vec3(1., 1., 1.)), f.x), f.y), f.z);
}
float clayHeight(vec3 p, float fine) {
  float d = cNoise(p * 2.3);
  d = 1.0 - sqrt((d * 2.0 - 1.0) * (d * 2.0 - 1.0) + 0.02);
  return d * d * 0.65 + cNoise(p * 7.0 + 3.1) * 0.25 + cNoise(p * 31.0) * 0.10 * fine;
}
`;
  function patch(sh) {
    sh.uniforms.clayAmt = { value: this.userData.clayAmt };
    sh.uniforms.clayDay = U.day;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vClayP;')
      .replace('#include <project_vertex>', `#include <project_vertex>
  vec4 clayC = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
    clayC = instanceMatrix * clayC;
  #endif
  vClayP = clayC.xyz * vec3(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz), length(modelMatrix[2].xyz));`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\n' + NOISE)
      .replace('#include <color_fragment>', `#include <color_fragment>
  diffuseColor.rgb *= 0.95 + 0.1 * cNoise(vClayP * 1.7 + 7.0);`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
  {
    float fine = 1.0 - smoothstep(3.0, 11.0, length(vViewPosition));
    float hh = clayHeight(vClayP, fine);
    vec3 sx = dFdx(-vViewPosition), sy = dFdy(-vViewPosition);
    vec3 r1 = cross(sy, normal), r2 = cross(normal, sx);
    float det = dot(sx, r1);
    vec3 grad = sign(det) * (dFdx(hh) * r1 + dFdy(hh) * r2) * clayAmt * (1.0 - smoothstep(25.0, 60.0, length(vViewPosition)));
    normal = normalize(abs(det) * normal - grad);
  }`)
      .replace('#include <tonemapping_fragment>', `{
    float clayRim = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 3.0);
    gl_FragColor.rgb += diffuseColor.rgb * (clayRim * 0.12 + 0.035) * clayDay;
  }
  #include <tonemapping_fragment>`);
  }
  /* amt : profondeur du relief (0 = lisse, pour les yeux, le verre, les ampoules) */
  function apply(m, amt) {
    if (!amt) return m;
    m.userData.clayAmt = amt;
    m.extensions = Object.assign(m.extensions || {}, { derivatives: true });
    m.onBeforeCompile = patch;
    m.customProgramCacheKey = () => 'clay1';
    return m;
  }

  /* ---------- regroupement des objets immobiles (gros gain sur téléphone) ----------
     Dans chaque groupe, les objets fixes qui ne diffèrent que par la couleur sont fusionnés en un seul :
     la couleur passe dans les sommets. Les matières « uniques » (vitres qui s'allument, eau…) restent
     partagées telles quelles. Un objet qui porte des userData (ex. keep: true) n'est jamais fusionné.
     skip(groupe) permet d'épargner des groupes entiers (ex. objets surlignés au survol dans la boulangerie). */
  const bakedMats = {};
  function bakedMat(m) {
    const amt = m.userData.clayAmt || 0;
    const key = [m.roughness, m.metalness, m.emissive.getHexString(), m.emissiveIntensity, amt, m.side, m.flatShading].join('|');
    if (!bakedMats[key]) bakedMats[key] = apply(new THREE.MeshStandardMaterial({ color: '#ffffff', vertexColors: true, roughness: m.roughness, metalness: m.metalness, emissive: m.emissive, emissiveIntensity: m.emissiveIntensity, side: m.side, flatShading: m.flatShading }), amt);
    return { key: 's' + key, mat: bakedMats[key], color: true };
  }
  function bakeable(c) {
    if (!c.isMesh || c.isInstancedMesh || c.isSkinnedMesh || Object.keys(c.userData).length || c.children.length || !c.visible) return false;
    const m = c.material, g = c.geometry;
    return !!(m && !Array.isArray(m) && m.isMeshStandardMaterial && !m.transparent && !m.map && g && g.attributes.position && g.attributes.normal);
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
      const m = c.material, b = m.userData.unique ? { key: 'u' + m.uuid, mat: m, color: false } : bakedMat(m);
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
