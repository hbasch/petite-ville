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
  window.PVClay = {
    U,
    apply(m, amt) {
      if (!amt) return m;
      m.userData.clayAmt = amt;
      m.extensions = Object.assign(m.extensions || {}, { derivatives: true });
      m.onBeforeCompile = patch;
      m.customProgramCacheKey = () => 'clay1';
      return m;
    }
  };
})();
