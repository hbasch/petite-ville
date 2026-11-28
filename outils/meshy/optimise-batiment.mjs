// Prépare un bâtiment Meshy (.glb texturé) pour le jeu : léger, lisible par three.js r128 sans décodeur en plus.
//  - garde seulement la texture de couleur (la matière pâte à modeler du jeu, clay.js, fait le relief et la brillance) :
//    carte de normales, de rugosité/métal, d'occlusion et d'émission supprimées, tangentes aussi ;
//  - soude les sommets, recode la couleur en WebP (EXT_texture_webp, lu par le GLTFLoader de r128), 1024 px ;
//  - quantifie la géométrie (KHR_mesh_quantization, lu par r128) : positions 14 bits, normales 8 bits, UV 12 bits.
//  Pas de meshopt ni de draco : il faudrait charger un décodeur en plus (meshopt marche avec r128, voir plus bas).
//  Pas de simplification par défaut : à 12 000 triangles, la simplifier efface les tuiles et les pierres d'angle.
//
// Installation (une fois, dans un dossier de travail hors du dépôt) :
//   npm i @gltf-transform/core@4 @gltf-transform/extensions@4 @gltf-transform/functions@4 meshoptimizer sharp
// Usage :
//   node optimise-batiment.mjs entree.glb sortie.glb [ratio_simplification=1] [taille_texture=1024] [qualite_webp=80] [meshopt]
// Exemple (boulangerie du 28/11 : 8,2 Mo → 323 Ko, 12 228 triangles) :
//   node optimise-batiment.mjs tex.glb ../petite-ville/assets/bakery.glb
// Avec « meshopt » en dernier argument : ~245 Ko, mais il faut alors charger
//   https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/meshopt_decoder.js et appeler loader.setMeshoptDecoder(MeshoptDecoder).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, simplify, quantize, textureCompress, prune, dedup, reorder, meshopt } from '@gltf-transform/functions';
import { MeshoptSimplifier, MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';

const [inp, out, ratio = '1', tsize = '1024', q = '80', mode = 'quantize'] = process.argv.slice(2);
if (!inp || !out) { console.log('usage : node optimise-batiment.mjs entree.glb sortie.glb [ratio] [taille] [qualite] [meshopt]'); process.exit(1); }
await MeshoptSimplifier.ready; await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read(inp);
for (const m of doc.getRoot().listMaterials()) {
  m.setNormalTexture(null); m.setMetallicRoughnessTexture(null); m.setOcclusionTexture(null); m.setEmissiveTexture(null);
  m.setMetallicFactor(0); m.setRoughnessFactor(0.6); m.setDoubleSided(false);
}
for (const mesh of doc.getRoot().listMeshes()) for (const p of mesh.listPrimitives()) if (p.getAttribute('TANGENT')) p.setAttribute('TANGENT', null);
await doc.transform(prune(), dedup(), weld());
if (+ratio < 1) await doc.transform(simplify({ simplifier: MeshoptSimplifier, ratio: +ratio, error: 0.004 }));
await doc.transform(prune(), textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [+tsize, +tsize], quality: +q }));
if (mode === 'meshopt') await doc.transform(reorder({ encoder: MeshoptEncoder }), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
else await doc.transform(reorder({ encoder: MeshoptEncoder }), quantize({ quantizePosition: 14, quantizeNormal: 8, quantizeTexcoord: 12 }));
await io.write(out, doc);
console.log('écrit :', out);
