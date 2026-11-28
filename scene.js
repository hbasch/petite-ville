window.buildScene=function(H){
const PAL=H.pal||{walls:['#d9774b','#e3a84a','#9db58a','#efe3cf','#d99b8c'],roofs:['#a8492f','#5b6577'],ground:'#e6cfa8',leaf:'#7a9a4a',accent:'#2f6f6b'};
const $=id=>document.getElementById(id);
const canvas=$('c');
const R=new THREE.WebGLRenderer({canvas,antialias:true});
const mobile=Math.min(innerWidth,innerHeight)<700;
R.setPixelRatio(Math.min(devicePixelRatio,mobile?1.5:2));R.setSize(innerWidth,innerHeight);
R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=.92;
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color('#1d2142');scene.fog=new THREE.Fog('#1d2142',14,34);
/* pièce fermée : murs x = ±RX, fond z = RZ0, façade (porte d'entrée) z = FZ ; DX = milieu de la porte */
/* pièce resserrée (7,6 × 7 m, environ 56 % de l'ancienne 10 × 9,5) : comptoir à 4 m de la porte, tout tient dans la vue.
   Repères : CZ = milieu du comptoir (z), le service (SV, ardoise suspendue, client) en dépend ; zone du fond (four, étagères) contre RZ0 */
const RX=3.8,RZ0=-3,FZ=4,DX=1.5,CZ=-.5,RZC=(RZ0+FZ)/2,RD=FZ-RZ0;
/* vue d'en haut : tout ce qui dépasse CLIPZ (façade, rebord de la vitrine) est effacé */
const CLIPZ=FZ-.24;
/* vue d'intérieur façon jeu de village : caméra haute et fixe, plafond et façade effacés (?cam=fp : ancienne vue) */
const ACI=!/[?&]cam=fp\b/.test(location.search);
/* champ de vision comme sur la place (plus large sur téléphone) ; le zoom le multiplie */
const FOV=mobile?70:62;
/* réglages de la caméra libre : champ, distance, élévation (rad), suivi en x/z (part du déplacement), décalages ; ?debug permet de les changer (PVBAK.cam*) */
const CAMT={fov:54,d:12.4,el:1.0,fx:.3,ox:-.3,fz:.3,oz:-.4,ty:.5},CAMP={fov:40,d:10.4,el:.72,fx:.3,ox:-.2,fz:.4,oz:-.8,ty:.7};
const cam=new THREE.PerspectiveCamera(FOV,innerWidth/innerHeight,.05,60);

function tex(w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1])}return t}
const M=(c,o)=>{o=Object.assign({},o||{});const a=o.bumpScale===0?0:(o.bumpScale?o.bumpScale*1.9:.028);delete o.bumpScale;return PVClay.apply(new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.6},o)),a);};
function rbox(w,h,d,r,seg){seg=seg||3;r=Math.min(r,w/2-.001,h/2-.001,d/2-.001);const g=new THREE.BoxGeometry(w,h,d,seg,seg,seg);if(r<=0.004)return new THREE.BoxGeometry(w,h,d);const p=g.attributes.position,v=new THREE.Vector3(),n=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);n.set(Math.max(-w/2+r,Math.min(w/2-r,v.x)),Math.max(-h/2+r,Math.min(h/2-r,v.y)),Math.max(-d/2+r,Math.min(d/2-r,v.z)));const dd=v.clone().sub(n);if(dd.lengthSq()>0){dd.normalize().multiplyScalar(r);v.copy(n).add(dd)}p.setXYZ(i,v.x,v.y,v.z)}g.computeVertexNormals();return g}
function rboxS(w,h,d,r,sx,sy,sz){const g=new THREE.BoxGeometry(w,h,d,sx,sy,sz),p=g.attributes.position,v=new THREE.Vector3(),n=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);n.set(Math.max(-w/2+r,Math.min(w/2-r,v.x)),Math.max(-h/2+r,Math.min(h/2-r,v.y)),Math.max(-d/2+r,Math.min(d/2-r,v.z)));const dd=v.clone().sub(n);if(dd.lengthSq()>0){dd.normalize().multiplyScalar(r);v.copy(n).add(dd)}p.setXYZ(i,v.x,v.y,v.z)}g.computeVertexNormals();return g}
const B=(c)=>new THREE.MeshBasicMaterial({color:c});
function mk(geo,mat,x,y,z,p){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);(p||scene).add(m);return m}
const box=(w,h,d)=>rbox(w,h,d,Math.min(w,h,d)*.22,3),cyl=(a,b,h,s)=>new THREE.CylinderGeometry(a,b,h,s||20),sph=(r,s)=>new THREE.SphereGeometry(r,s||20,Math.round((s||20)*.75));
const hits=[];
function item(id){const g=new THREE.Group();g.userData.id=id;hits.push(g);scene.add(g);return g}

/* ---------- outils de pâte : nuances (creux, coins, croûte) peintes dans les sommets, comme pour les habitants ---------- */
const sstep=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
/* matière qui lit les nuances des sommets (sur ordinateur, les objets cliquables ne sont pas regroupés) */
const MV=(c,o)=>M(c,Object.assign({vertexColors:true},o));
function paint(g,fn){const p=g.attributes.position,c=new Float32Array(p.count*3);for(let i=0;i<p.count;i++){const f=fn(p.getX(i),p.getY(i),p.getZ(i));if(typeof f==='number'){c[i*3]=c[i*3+1]=c[i*3+2]=f}else{c[i*3]=f.r;c[i*3+1]=f.g;c[i*3+2]=f.b}}g.setAttribute('color',new THREE.BufferAttribute(c,3));return g}
/* bas d'un meuble plus sombre (lumière qui n'y arrive pas) */
const footAO=(h,k)=>(x,y)=>1-(k||.35)*sstep(h*.35,-h/2,y);
const wood=(c)=>M(c||'#c9935d',{roughness:.55});
/* fusionne des formes lumineuses (matière simple) en un seul objet : [géométrie, x, y, z, rotX, échelleY, couleur] */
function glowMerge(parts){const P=[],C=[],I=[];let vo=0;const o=new THREE.Object3D(),v=new THREE.Vector3(),c=new THREE.Color();
 parts.forEach(([g,x,y,z,rx,sy,col])=>{o.position.set(x,y,z);o.rotation.set(rx||0,0,0);o.scale.set(1,sy||1,1);o.updateMatrix();c.set(col||'#ffffff');const p=g.attributes.position;
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(o.matrix);P.push(v.x,v.y,v.z);C.push(c.r,c.g,c.b)}const ix=g.index?g.index.array:[...Array(p.count).keys()];ix.forEach(i=>I.push(i+vo));vo+=p.count});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);return g}

/* ---------- la pièce : murs, plafond, sol en pâte ; coins, pied des murs et dessous des meubles plus sombres ---------- */
const HT=3.5,WAIN=1.05,cWall=new THREE.Color(PAL.walls[3]),cWain=new THREE.Color(PAL.walls[2]);
/* un mur = grille (repère du mur, face +z) avec trous éventuels [x0,x1,y0,y1] ; dark(x,y) assombrit derrière les meubles */
function wallGeo(w,holes,dark){
 const xs=new Set([-w/2,w/2]),ys=new Set([WAIN]);for(let i=0;i<=w/.25;i++)xs.add(+(-w/2+i*.25).toFixed(4));for(let i=0;i<=HT/.25;i++)ys.add(+(i*.25).toFixed(4));
 holes.forEach(o=>{xs.add(o[0]);xs.add(o[1]);ys.add(o[2]);ys.add(o[3])});
 const X=[...xs].sort((a,b)=>a-b),Y=[...ys].sort((a,b)=>a-b),P=[],C=[],I=[],col=new THREE.Color(),nx=X.length;
 Y.forEach(y=>X.forEach(x=>{P.push(x,y,0);const k=(1-.3*Math.exp(-Math.min(x+w/2,w/2-x)/.45))*(1-.22*Math.exp(-y/.3))*(1-.25*Math.exp(-(HT-y)/.4))*(dark?dark(x,y):1);col.copy(y<WAIN-1e-3?cWain:cWall).multiplyScalar(k);C.push(col.r,col.g,col.b)}));
 for(let j=0;j<Y.length-1;j++)for(let i=0;i<nx-1;i++){const cx=(X[i]+X[i+1])/2,cy=(Y[j]+Y[j+1])/2;if(holes.some(o=>cx>o[0]&&cx<o[1]&&cy>o[2]&&cy<o[3]))continue;const a=j*nx+i;I.push(a,a+1,a+nx,a+1,a+nx+1,a+nx)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);g.computeVertexNormals();return g}
const place3=(g,x,z,ry)=>{const o=new THREE.Object3D();o.position.set(x,0,z);o.rotation.y=ry;o.updateMatrix();return g.applyMatrix4(o.matrix)};
const boxDark=(x,y,b)=>x>b[0]&&x<b[1]&&y<b[2]?1-b[3]:1-b[3]*Math.exp(-Math.max(b[0]-x,x-b[1],y-b[2],0)/.18);
/* fenêtre de gauche : vrai trou dans le mur, le soleil passe par là et dessine son carreau sur le sol et le comptoir */
/* mur de gauche : repère du mur x = RZC - z (fenêtre centrée sur LWZ) ; mur de droite : x = z - RZC */
const LWZ=-.2,LWIN=[RZC-LWZ-.8,RZC-LWZ+.8,1.05,2.55];
const wallsG=(()=>{const parts=[
 place3(wallGeo(2*RX,[],(x,y)=>boxDark(x,y,[-3.75,-1.45,2.2,.3])*boxDark(x,y,[1.95,3.45,1.75,.35])),0,RZ0,0),
 place3(wallGeo(RD,[LWIN],(x,y)=>boxDark(x,y,[RZC-2.1,RZC-1.5,1.1,.22])),-RX,RZC,Math.PI/2),place3(wallGeo(RD,[],(x,y)=>boxDark(x,y,[-2.1-RZC,-.8-RZC,.9,.25])*boxDark(x,y,[1.1-RZC,1.7-RZC,.8,.22])),RX,RZC,-Math.PI/2),place3(wallGeo(2*RX,[]),0,FZ,Math.PI)];
 const P=[],N=[],C=[],I=[];let vo=0;parts.forEach(g=>{P.push(...g.attributes.position.array);N.push(...g.attributes.normal.array);C.push(...g.attributes.color.array);g.index.array.forEach(i=>I.push(i+vo));vo+=g.attributes.position.count});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);return g})();
const wallsM=mk(wallsG,MV('#ffffff',{roughness:.85}),0,0,0);wallsM.receiveShadow=true;wallsM.castShadow=true;wallsM.userData.cast=true;
/* plafond : plus sombre dans les coins et contre les murs */
const ceilG=paint(new THREE.PlaneGeometry(2*RX,RD,16,14),(x,y)=>(1-.35*Math.exp(-Math.min(x+RX,RX-x)/.6))*(1-.35*Math.exp(-Math.min(y+RD/2,RD/2-y)/.6)));
const ceil=mk(ceilG,MV('#e9d9bd',{roughness:.95,bumpScale:.006}),0,HT,RZC);ceil.rotation.x=Math.PI/2;ceil.castShadow=true;ceil.userData.cast=true;
for(let i=0;i<4;i++)mk(paint(box(2*RX,.16,.2),(x,y)=>y<0?.8:1),MV('#6e4a2c'),0,3.42,RZ0+1+i*1.7);
/* soubassement : plinthe et cimaise en boudins, panneaux en relief arrondis (vrais volumes, plus de dessin plaqué) */
{const rail=M(PAL.accent,{roughness:.5}),skirt=M('#e6d8c2',{roughness:.6}),panel=M(new THREE.Color(PAL.walls[2]).offsetHSL(0,0,.035).getStyle(),{roughness:.7});
 /* segments de mur : [x0,z0,x1,z1,nx,nz] (normale vers la pièce) ; la façade s'interrompt à la porte */
 const segs=[[-RX,RZ0,RX,RZ0,0,1],[-RX,RZ0,-RX,FZ,1,0],[RX,RZ0,RX,FZ,-1,0],[-RX,FZ,DX-.62,FZ,0,-1],[DX+.62,FZ,RX,FZ,0,-1]];
 const skipPanel=(x,z)=>(z<RZ0+.1&&((x>-3.85&&x<-1.35)||(x>1.85&&x<3.55)))||(x>RX-.1&&((z>-2.15&&z<-.75)||(z>1.05&&z<1.75)))||(x<-RX+.1&&z>1.45&&z<2.15);
 segs.forEach(([x0,z0,x1,z1,nx,nz])=>{const L=Math.hypot(x1-x0,z1-z0),cx=(x0+x1)/2,cz=(z0+z1)/2,ry=Math.atan2(nx,nz);
  const r1=mk(paint(new THREE.CylinderGeometry(.032,.032,L,10),(x,y,z)=>z>0?1:.85),rail,cx+nx*.03,WAIN,cz+nz*.03);r1.rotation.set(0,ry,Math.PI/2);
  mk(rbox(L,.13,.04,.018,2),skirt,cx+nx*.02,.065,cz+nz*.02).rotation.y=ry;
  for(let s=.45;s<L-.3;s+=.72){const x=x0+(x1-x0)*s/L,z=z0+(z1-z0)*s/L;if(skipPanel(x,z))continue;mk(rbox(.54,.6,.035,.02,2),panel,x+nx*.012,.58,z+nz*.012).rotation.y=ry}});}
/* emplacements du mobilier de la salle (repris par l'ombre au sol et les collisions) :
   deux petites tables rondes devant la vitrine, chacune avec deux chaises [table, angle autour d'elle] */
const TBL=[[-2.8,2.85],[-1.0,3.0]],CHR=[[0,-1.75],[0,2.6],[1,-2.5],[1,1.6]].map(([t,a])=>[TBL[t][0]+Math.sin(a)*.58,TBL[t][1]+Math.cos(a)*.58,a+Math.PI]);
const FLR=[3.35,-1.0],CRATE=[3.42,1.4],PLANTS=[[3.2,3.5,1],[-3.38,1.8,.8]],BSK=[-.7,RZ0+.45];
/* sol : parquet miel en lattes de pâte (dans la profondeur, joints sombres), plus sombre au pied des murs et des meubles */
const floor=mk(new THREE.PlaneGeometry(2*RX,RD),M('#4a3020',{roughness:.9,bumpScale:0}),0,-.005,RZC);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;
const FOOT=[[-3.1,2.1,CZ-.42,CZ+.42,.5],[-3.75,-1.4,RZ0,RZ0+.5,.45],[1.9,3.5,RZ0,RZ0+1.12,.5],[BSK[0]-.25,BSK[0]+.25,BSK[1]-.25,BSK[1]+.25,.35],[FLR[0]-.4,RX,FLR[1]-.85,FLR[1]+.35,.35],[-.1,.6,-1.6,-1,.25],
 [CRATE[0]-.3,CRATE[0]+.3,CRATE[1]-.55,CRATE[1]+.55,.35]].concat(TBL.map(t=>[t[0]-.15,t[0]+.15,t[1]-.15,t[1]+.15,.25]),PLANTS.map(p=>[p[0]-.2,p[0]+.2,p[1]-.2,p[1]+.2,.3]));
const floorAO=(x,z)=>{let k=1-.38*Math.exp(-Math.min(x+RX,RX-x,z-RZ0,FZ-z)/.45);FOOT.forEach(b=>{const d=Math.max(b[0]-x,x-b[1],b[2]-z,z-b[3],0);k*=1-b[4]*Math.exp(-d/.28)});return k};
{const PW=.2,tg=rboxS(PW-.014,.05,1,.016,2,1,6),p=tg.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);if(y>0)p.setY(i,y+.008*(1-Math.pow(x/(PW/2),2)))}tg.computeVertexNormals();
 const WD=['#c98f55','#d49c62','#be844d','#dba86e','#c7915a','#b97f4a'],L=[];
 for(let i=0,n=Math.round(2*RX/PW);i<n;i++){const x=-RX+PW/2+i*PW;let z=RZ0-Math.random()*1.1;while(z<FZ){const len=.9+Math.random()*.6,z0=Math.max(z,RZ0),z1=Math.min(z+len,FZ);if(z1-z0>.08)L.push([x,(z0+z1)/2,z1-z0-.012]);z+=len}}
 const im=new THREE.InstancedMesh(tg,M('#ffffff',{roughness:.5}),L.length),o=new THREE.Object3D(),cc=new THREE.Color();
 L.forEach(([x,z,len],k)=>{o.position.set(x+(Math.random()-.5)*.006,0,z);o.rotation.set(0,(Math.random()-.5)*.012,(Math.random()-.5)*.01);o.scale.set(1,.85+Math.random()*.3,len);o.updateMatrix();im.setMatrixAt(k,o.matrix);
  cc.set(WD[Math.floor(Math.random()*WD.length)]);cc.offsetHSL((Math.random()-.5)*.012,0,(Math.random()-.5)*.04);cc.multiplyScalar(floorAO(x,z));im.setColorAt(k,cc)});
 if(im.instanceColor)im.instanceColor.needsUpdate=true;im.receiveShadow=true;im.userData.noShadow=true;scene.add(im)}

/* ---------- pains et viennoiseries en pâte : croûte dorée peinte dans les sommets (foncée dessus, pâle dessous), grignes creusées ---------- */
const CR=['#6e2e10','#a85a22','#d9994a','#f3d59c'].map(c=>new THREE.Color(c)),_c=new THREE.Color();
/* t : 0 = croûte bien cuite, 1 = pâle ; m = 1 dans une grigne (mie dorée claire) */
const crust=(t,m)=>{t=Math.max(0,Math.min(1,t));const i=Math.min(1,Math.floor(t*2));_c.copy(CR[i]).lerp(CR[i+1],t*2-i);return _c.lerp(CR[3],m||0).clone()};
/* pain : sphère aplatie dessous ; cuts = grignes [cx, cz, angle, demi-longueur] (repère unitaire) ; flour = farine sur le dessus */
function bread(L,Hh,W,cuts,flour,seg){
 const g=new THREE.SphereGeometry(1,seg||(mobile?22:28),Math.round((seg||(mobile?22:28))*.66)),p=g.attributes.position,G=[];
 for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(y<-.3)y=-.3+(y+.3)*.22;let gr=0;
  cuts.forEach(c=>{const ca=Math.cos(c[2]),sa=Math.sin(c[2]),dx=x-c[0],dz=z-c[1],u=dx*ca+dz*sa,v=-dx*sa+dz*ca,t=Math.max(0,1-Math.pow(u/c[3],2));gr=Math.max(gr,Math.exp(-Math.pow(v/.1,2))*t*sstep(.15,.6,y))});
  y-=gr*.13;y+=.04*Math.sin(x*5.1+z*3.3)*Math.max(0,y);p.setXYZ(i,x*L,y*Hh,z*W);G.push(gr)}
 g.computeVertexNormals();const c=new Float32Array(p.count*3);
 for(let i=0;i<p.count;i++){const y=p.getY(i)/Hh,x=p.getX(i)/L,z=p.getZ(i)/W;let col=crust(.95-1.05*sstep(-.3,.7,y)+.12*Math.sin(x*7+z*5),Math.min(1,G[i]*1.4));if(flour&&y>.35&&Math.sin(x*23)*Math.sin(z*19+x*7)>.35)col.lerp(new THREE.Color('#f6efe0'),.6);c[i*3]=col.r;c[i*3+1]=col.g;c[i*3+2]=col.b}
 g.setAttribute('color',new THREE.BufferAttribute(c,3));return g}
/* croissant : lobes de pâte roulée le long d'un croissant de lune, pointes fines, plis plus clairs entre les lobes */
function croissantGeo(){const parts=[],n=7;for(let i=0;i<n;i++){const t=i/(n-1),a=(t-.5)*2.5,R=.062,s=.034*(1-.62*Math.pow(Math.abs(2*t-1),1.4));
  const g=new THREE.SphereGeometry(1,12,9),p=g.attributes.position,c=new Float32Array(p.count*3);
  for(let k=0;k<p.count;k++){const y=p.getY(k),x=p.getX(k);const col=crust(.75-.85*sstep(-.4,.8,y)+.25*Math.pow(Math.abs(x),3),0);c[k*3]=col.r;c[k*3+1]=col.g;c[k*3+2]=col.b}
  g.setAttribute('color',new THREE.BufferAttribute(c,3));const o=new THREE.Object3D();o.position.set(Math.sin(a)*R,0,Math.cos(a)*R-R);o.rotation.y=a+Math.PI/2;o.scale.set(s*.9,s*.8,s*1.25);o.updateMatrix();g.applyMatrix4(o.matrix);parts.push(g)}
 const P=[],N=[],C=[],I=[];let vo=0;parts.forEach(g=>{P.push(...g.attributes.position.array);N.push(...g.attributes.normal.array);C.push(...g.attributes.color.array);g.index.array.forEach(i=>I.push(i+vo));vo+=g.attributes.position.count});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);return g}

/* ---------- comptoir (modelé autour de z = -1,2 comme avant, puis avancé jusqu'à CZ avec tout ce qu'il porte : voir DZC plus bas) ---------- */
const counter=item('counter');
mk(paint(rbox(5,.98,.7,.07,3),footAO(.98,.45)),MV(PAL.walls[0]),-.5,.49,-1.2,counter);
mk(paint(rbox(5.16,.07,.84,.03,3),(x,y)=>y<0?.75:1),MV('#d9a46d'),-.5,1.01,-1.2,counter);
mk(rbox(5,.09,.66,.035,2),M(PAL.roofs[0]),-.5,.045,-1.18,counter);
for(let i=0;i<7;i++)mk(paint(rbox(.6,.62,.05,.024,3),(x,y)=>1-.18*sstep(.22,.3,Math.abs(y))-.1*sstep(.24,.3,Math.abs(x))),MV(PAL.walls[4]),-2.65+i*.72,.52,-.84,counter);

/* ---------- vitrine réfrigérée ---------- */
const dcase=item('case');
mk(rbox(2,.04,.56,.015,2),M('#fbf4ea',{roughness:.4}),-1.9,1.06,-1.2,dcase);
[[-2.88,-.94],[-2.88,-1.46],[-.92,-.94],[-.92,-1.46]].forEach(p=>mk(rbox(.035,.46,.035,.015,2),M('#d9b46a',{metalness:.7,roughness:.3}),p[0],1.3,p[1],dcase));
mk(rbox(2,.035,.56,.015,2),M('#d9b46a',{metalness:.7,roughness:.3}),-1.9,1.53,-1.2,dcase);
const glass=mk(box(1.95,.44,.52),new THREE.MeshStandardMaterial({color:'#dff3ff',transparent:true,opacity:.12,roughness:.05,metalness:.2,depthWrite:false}),-1.9,1.3,-1.2,dcase);glass.userData.glass=true;glass.userData.noShadow=true;
const croiss=item('croissant'),crG=croissantGeo(),crM=MV('#ffffff',{roughness:.32});
/* vitrine bien garnie : cinq pièces par sorte, sur deux rangs décalés */
const SLOT=x0=>[[x0,-1.32],[x0+.2,-1.32],[x0+.4,-1.32],[x0+.1,-1.08],[x0+.3,-1.08]];
SLOT(-2.74).forEach(([x,z],i)=>{const m=mk(crG,crM,x,1.105,z,croiss);m.rotation.y=.6+i*1.3})
const dough=item('doughnut');
const spr=['#ffffff','#ffd84a','#5ec8f2','#ff5a5a'];
const dgG=paint(new THREE.TorusGeometry(.05,.027,12,26),(x,y,z)=>crust(.55-.7*sstep(-.02,.03,z),0)),icG=paint(new THREE.TorusGeometry(.05,.024,12,26),(x,y,z)=>.85+.15*sstep(-.01,.02,z));
SLOT(-2.08).forEach(([x,z],i)=>{const d=mk(dgG,MV('#ffffff'),x,1.105,z,dough);d.rotation.x=-Math.PI/2;
 const ic=mk(icG,MV('#ff8fb1',{roughness:.3}),x,1.118,z,dough);ic.rotation.x=-Math.PI/2;ic.scale.z=.7;
 for(let k=0;k<8;k++){const a=k/8*Math.PI*2+i;const s=mk(rbox(.013,.005,.005,.002,1),M(spr[k%4]),x+Math.cos(a)*.05,1.137,z+Math.sin(a)*.05,dough);s.rotation.y=a*3}})
/* petits gâteaux : caissette plissée, crème en tourbillon, cerise */
const cup=item('cupcake');
const wrapG=(()=>{const g=new THREE.CylinderGeometry(.045,.034,.065,36,2),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),a=Math.atan2(x,z),k=1+.06*Math.cos(a*14);p.setX(i,x*k);p.setZ(i,z*k)}g.computeVertexNormals();return paint(g,(x,y,z)=>.82+.18*(.5+.5*Math.cos(Math.atan2(x,z)*14)))})();
const swirlG=(()=>{const parts=[[.044,.016,0],[.033,.015,.022],[.02,.013,.041]].map(([r,t,y])=>{const g=new THREE.TorusGeometry(r,t,8,20);g.rotateX(Math.PI/2);g.translate(0,y,0);return g});parts.push(new THREE.SphereGeometry(.014,8,6).translate(0,.054,0));
 const P=[],N=[],I=[];let vo=0;parts.forEach(g=>{P.push(...g.attributes.position.array);N.push(...g.attributes.normal.array);g.index.array.forEach(i=>I.push(i+vo));vo+=g.attributes.position.count});const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setIndex(I);return paint(g,(x,y)=>.85+.15*sstep(0,.05,y))})();
SLOT(-1.48).forEach(([x,z],i)=>{mk(wrapG,MV('#f3b9cf',{roughness:.45}),x,1.115,z,cup);mk(swirlG,MV('#fff4ea',{roughness:.45}),x,1.155,z,cup).rotation.y=i;mk(sph(.014,10),M('#d81e3a',{roughness:.45}),x,1.222,z,cup)})

/* gâteau sur son présentoir (un seul réglage de brillance : un seul objet une fois regroupé) */
const cake=item('cake');
mk(cyl(.05,.08,.02),M('#ffffff',{roughness:.3}),-.35,1.05,-1.15,cake);mk(cyl(.015,.015,.12),M('#ffffff',{roughness:.3}),-.35,1.12,-1.15,cake);mk(cyl(.2,.2,.012,32),M('#ffffff',{roughness:.3}),-.35,1.18,-1.15,cake);
mk(paint(cyl(.15,.15,.13,32),(x,y)=>Math.abs(y)<.012?1.6:1),MV('#6b3b22',{roughness:.3}),-.35,1.25,-1.15,cake);mk(cyl(.155,.155,.03,32),M('#fff0f3',{roughness:.3}),-.35,1.325,-1.15,cake);
for(let k=0;k<12;k++){const a=k/12*Math.PI*2;mk(sph(.017,10),M('#fff0f3',{roughness:.3}),-.35+Math.cos(a)*.15,1.335,-1.15+Math.sin(a)*.15,cake)}
for(let k=0;k<7;k++){const a=k/7*Math.PI*2;mk(sph(.022,12),M('#e0283f',{roughness:.3}),-.35+Math.cos(a)*.1,1.36,-1.15+Math.sin(a)*.1,cake)}

/* rouleau à pâtisserie et farine */
const rp=item('rollingpin');rp.position.set(.6,1.08,-.98);rp.rotation.y=.35;
const rpm=mk(cyl(.035,.035,.3),wood('#e3b783'),0,0,0,rp);rpm.rotation.z=Math.PI/2;
[-.2,.2].forEach(x=>{const h=mk(sph(1,12),wood('#b57c48'),x,0,0,rp);h.scale.set(.06,.018,.018)});
const dust=mk(new THREE.CircleGeometry(.2,24),new THREE.MeshStandardMaterial({color:'#ffffff',transparent:true,opacity:.55,roughness:1}),.6,1.047,-1.0);dust.rotation.x=-Math.PI/2;dust.userData.noShadow=true;

/* caisse enregistreuse */
const till=item('till');
mk(rbox(.44,.12,.36,.03,2),M('#c9a24a',{metalness:.6,roughness:.35}),1.45,1.1,-1.2,till);
const tb=mk(rbox(.38,.16,.24,.03,2),M('#b38a37',{metalness:.6,roughness:.35}),1.45,1.24,-1.27,till);tb.rotation.x=-.25;
for(let r=0;r<3;r++)for(let c=0;c<4;c++){const k=mk(rbox(.05,.02,.035,.008,1),M('#fbf4ea'),1.34+c*.075,1.335-r*.012,-1.33+r*.05,till);k.rotation.x=-.25}
const scr=mk(rbox(.2,.07,.02,.008,1),B('#ffb347'),1.45,1.4,-1.4,till);scr.userData.glow=true;
/* le comptoir et tout ce qu'il porte avancent de DZC (ancien z = -1,2 → CZ) */
const DZC=CZ+1.2;[counter,dcase,croiss,dough,cup,cake,rp,till].forEach(g=>g.position.z+=DZC);dust.position.z+=DZC;

/* ---------- le boulanger : même pâte que les habitants de la place (clay.js), toque, grosse moustache, manches roulées ----------
   accoudé au comptoir ; ses parties fixes sont regroupées pour peu d'appels de dessin */
const baker=item('baker');baker.position.set(.25,0,CZ-.78);
const BK=PVClay.char({skin:'#f1c7a5',hair:'#6a4026',style:'toque',mustache:'big',eyes:'#4a3020',outfit:'chef',shirt:'#f8f6f2',apron:'#d9566f',rolled:true,pants:'#3a3a4a',shoes:'#3a2a22'},{det:1});
BK.g.scale.setScalar(1.12);BK.g.position.y=.12;baker.add(BK.g);const BP=BK.P;/* sur une marche derrière le comptoir */
/* jambes gardées : pendant le service on le voit de côté, depuis la caisse */
BP.arms.forEach((a,i)=>{a.rotation.x=-1.42;a.rotation.z=(i?1:-1)*.3});
baker.updateMatrixWorld(true);
/* bras et mains immobiles : rattachés au buste (en gardant leur place) pour être regroupés avec lui */
BP.arms.forEach(a=>{[...a.children].forEach(c=>{if(c.isMesh)BP.body.attach(c);else[...c.children].forEach(m=>BP.body.attach(m))})});
PVClay.bake(baker);
const head=BP.head;
const bubT=tex(128,128,(g)=>{g.fillStyle='#ffc845';g.beginPath();g.arc(64,58,50,0,Math.PI*2);g.fill();g.beginPath();g.moveTo(50,100);g.lineTo(64,124);g.lineTo(78,100);g.fill();g.fillStyle='#2a1a12';g.font='700 66px Fredoka,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('Hi!',64,60)});
const bubble=new THREE.Sprite(new THREE.SpriteMaterial({map:bubT,depthTest:false}));bubble.scale.set(.36,.36,1);bubble.position.set(0,2.62,0);baker.add(bubble);

/* ---------- four à pain : briques en coussins de pâte posées une à une, voûte autour de la gueule, braises ---------- */
const oven=item('oven');
mk(paint(rbox(1.5,1.7,1,.1,3),footAO(1.7,.3)),MV('#d9c3a2',{roughness:.9}),2.7,.85,-3.45,oven);
{const bg=rbox(.23,.088,.06,.022,2),BC=['#a8492f','#b5553a','#94402a','#bd6244','#a24a33'].map(c=>new THREE.Color(c)),L=[];
 for(let r=0;r<16;r++){const y=.07+r*.1;for(let c=0;c<7;c++){const x=1.97+.115*(r%2)+c*.245;if(x>3.43)continue;if(Math.abs(x-2.7)<.5&&y>.44&&(y<.82||Math.hypot(x-2.7,y-.82)<.49))continue;L.push([x,y,-2.94,0])}
  for(let c=0;c<4;c++){const z=-3.82+.115*(r%2)+c*.245;if(z>-3.0)continue;L.push([1.94,y,z,Math.PI/2])}}
 const im=new THREE.InstancedMesh(bg,M('#ffffff',{roughness:.8}),L.length),o=new THREE.Object3D(),cc=new THREE.Color();
 L.forEach(([x,y,z,ry],i)=>{o.position.set(x+(Math.random()-.5)*.01,y,z);o.rotation.set((Math.random()-.5)*.03,ry+(Math.random()-.5)*.04,(Math.random()-.5)*.04);o.updateMatrix();im.setMatrixAt(i,o.matrix);cc.copy(BC[i%5]).offsetHSL(0,0,(Math.random()-.5)*.06).multiplyScalar(1-.3*sstep(.4,0,y));im.setColorAt(i,cc)});
 if(im.instanceColor)im.instanceColor.needsUpdate=true;im.castShadow=im.receiveShadow=true;oven.add(im)}
{const arch=mk(new THREE.TorusGeometry(.4,.055,10,28,Math.PI),M('#8a3a26',{roughness:.8}),2.7,.82,-2.92,oven);arch.scale.y=1.05;
 mk(rbox(.86,.08,.12,.03,2),M('#8a3a26',{roughness:.8}),2.7,.47,-2.9,oven);}
mk(rbox(1.62,.1,1.12,.04,2),M('#5b3a2a'),2.7,1.75,-3.45,oven);
/* gueule du four : arche sombre (rectangle + demi-cercle) */
{const sh=new THREE.Shape();sh.moveTo(-.4,-.33);sh.lineTo(.4,-.33);sh.lineTo(.4,0);sh.absarc(0,0,.4,0,Math.PI,false);sh.lineTo(-.4,-.33);mk(new THREE.ShapeGeometry(sh,16),B('#0e0705'),2.7,.82,-2.935,oven)}
/* flammes et braises : un seul objet */
const flame=new THREE.PlaneGeometry(.66,.42,1,2);
const fire=mk(glowMerge([[flame,0,.7,.004,0,1,'#ffffff']].concat([0,1,2,3,4].map(k=>[sph(.05,8),-.22+k*.11,.54,-.025,0,.5,k%2?'#ff7a1a':'#ffb63a']))),new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false}),2.7,0,-2.935,oven);fire.userData.glow=true;
{const c=fire.geometry.attributes.color,p=fire.geometry.attributes.position,lo=new THREE.Color('#ffa63a'),mid=new THREE.Color('#c8400e'),hi=new THREE.Color('#0e0705');for(let i=0;i<6;i++){const y=p.getY(i);const k=(y-.49)/.42;const col=k<.5?lo.clone().lerp(mid,k*2):mid.clone().lerp(hi,(k-.5)*2);c.setXYZ(i,col.r,col.g,col.b)}}
mk(paint(cyl(.12,.13,1.8,16),(x,y)=>1-.3*sstep(.3,.9,y)),MV('#3a302a',{roughness:.6}),2.7,2.6,-3.6,oven);
/* le four est modelé contre l'ancien mur du fond (z = -4) puis recule avec lui : DZB */
const DZB=RZ0+4;oven.position.z=DZB;
const ovenL=new THREE.PointLight('#ff8a2a',1.2,3.5,2);ovenL.position.set(2.7,.75,-2.55+DZB);scene.add(ovenL);

/* ---------- étagères à pains : planches épaisses aux bords arrondis, fond sombre, pains qui ont du relief ---------- */
const shelf=item('shelf'),SX=-2.55,SZ=RZ0+.24;
mk(paint(rbox(2.3,2.25,.05,.02,2),(x,y)=>.75+.15*sstep(-1.1,1,y)),MV('#6a4228'),SX,1.12,RZ0+.05,shelf);
[.5,1.05,1.6,2.15].forEach(y=>mk(paint(rbox(2.2,.06,.42,.025,3),(x,yy)=>yy<0?.7:1),MV('#8a5a33'),SX,y,SZ,shelf));
[-1.12,1.12].forEach(x=>mk(rbox(.07,2.25,.42,.028,3),wood('#7a4e2c'),SX+x,1.12,SZ,shelf));
/* étagères bien chargées : cinq pains par planche (pains longs, boules en haut, mélange au milieu) */
const loaf=item('loaf');
const batG=[bread(.17,.085,.1,[[-.42,0,.6,.32],[0,0,.6,.32],[.42,0,.6,.32]]),bread(.17,.09,.1,[[0,0,0,.75]],true)];
const bouleG=[bread(.12,.085,.12,[[0,0,0,.6],[0,0,Math.PI/2,.6]],true),bread(.12,.08,.12,[[-.25,0,Math.PI/2,.5],[.25,0,Math.PI/2,.5]])];
[.53,1.08,1.63,2.18].forEach((y,k)=>{for(let i=0;i<5;i++){const x=SX-.88+i*.44+(Math.random()-.5)*.05,z=SZ+.02+(i%2?.05:-.04);
 if(k===3||(k===1&&i%2)){const b=mk(bouleG[i%2],MV('#ffffff',{roughness:.6}),x,y+.06,z,loaf);b.rotation.y=Math.random()*3;if(k===1)b.scale.setScalar(.9)}
 else{const l=mk(batG[(i+k)%2],MV('#ffffff',{roughness:.6}),x,y+.075,z,loaf);l.rotation.y=(Math.random()-.5)*.3;l.scale.setScalar(.92)}}});

/* plateau de pains sur le comptoir, devant la caisse : premier plan pendant le service */
const tray=item('loaf');tray.position.set(.86,1.045,CZ-.02);tray.rotation.y=.06;
mk(paint(rbox(.5,.035,.3,.015,2),(x,y)=>y<0?.75:1),MV('#a8743f'),0,.018,0,tray);
mk(bouleG[0],MV('#ffffff',{roughness:.6}),-.13,.072,0,tray).scale.setScalar(.75);
{const b=mk(batG[0],MV('#ffffff',{roughness:.6}),.1,.074,.01,tray);b.scale.setScalar(.72);b.rotation.y=1.2}

/* ---------- panier en osier et baguettes ---------- */
const basket=item('basket');
mk(paint(new THREE.CylinderGeometry(.24,.19,.5,32,12,true),(x,y,z)=>{const a=Math.atan2(x,z);return .78+.22*(.5+.5*Math.sin(a*16+(Math.floor((y+.25)*24)%2)*Math.PI))}),MV('#b07a42',{side:THREE.DoubleSide,roughness:.9}),-.7,.25,-3.55,basket);
mk(cyl(.19,.19,.02,24),M('#8a5f31'),-.7,.01,-3.55,basket);
mk(new THREE.TorusGeometry(.24,.028,8,30),M('#8a5f31'),-.7,.5,-3.55,basket).rotation.x=Math.PI/2;
const bag=item('baguette'),bagG=bread(.045,.4,.045,[],false,mobile?14:18);
/* grignes en diagonale : le long du pain (axe y) */
{const p=bagG.attributes.position,c=bagG.attributes.color;for(let i=0;i<p.count;i++){const x=p.getX(i)/.045,y=p.getY(i)/.4,z=p.getZ(i)/.045;const ph=(y*4.2+x*1.1)%1,cut=z>.25&&Math.abs(y)<.8?Math.exp(-Math.pow((ph<0?ph+1:ph)-.5,2)/.012):0;if(cut>.05){p.setZ(i,p.getZ(i)-cut*.006);const col=crust(.1,cut*.8);c.setXYZ(i,col.r,col.g,col.b)}else{const col=crust(.2-.5*sstep(.2,1,z)+.3*sstep(.6,1,Math.abs(y)),0);c.setXYZ(i,col.r,col.g,col.b)}}bagG.computeVertexNormals()}
for(let i=0;i<6;i++){const a=i/6*Math.PI*2;const b=mk(bagG,MV('#ffffff',{roughness:.65}),-.7+Math.cos(a)*.1,.62,-3.55+Math.sin(a)*.1,bag);b.rotation.set(Math.sin(a)*.18,a,-Math.cos(a)*.18)}
basket.position.z=bag.position.z=DZB;/* recule avec le mur du fond */

/* ---------- ardoise ---------- */
const chalk=item('chalkboard');
const chT=tex(512,320,(g,w,h)=>{g.fillStyle='#2b3330';g.fillRect(0,0,w,h);for(let i=0;i<500;i++){g.fillStyle=`rgba(255,255,255,${Math.random()*.04})`;g.fillRect(Math.random()*w,Math.random()*h,6,2)}
 g.strokeStyle='#ffe08a';g.lineWidth=4;g.lineCap='round';g.beginPath();g.moveTo(170,40);g.lineTo(342,40);g.stroke();g.beginPath();g.arc(256,40,12,0,Math.PI*2);g.stroke();
 const L=H.board.rows;g.font='600 32px "Baloo 2",Fredoka,sans-serif';
 L.forEach((l,i)=>{const y=96+i*46;g.save();g.translate(58,y);g.scale(.8,.8);g.strokeStyle='#f5f1e8';g.lineWidth=4;drawIcon(g,l[0]);g.restore();g.textAlign='left';g.textBaseline='middle';g.fillStyle='#f5f1e8';g.font='600 30px "Baloo 2",Fredoka,sans-serif';g.fillText(l[0],100,y+2);const tw=g.measureText(l[0]).width;g.font='600 32px "Baloo 2",Fredoka,sans-serif';g.setLineDash([2,10]);g.strokeStyle='rgba(245,241,232,.35)';g.lineWidth=3;g.beginPath();g.moveTo(112+tw,y);g.lineTo(w-150,y);g.stroke();g.setLineDash([]);g.textAlign='right';g.textBaseline='middle';g.fillStyle='#ffd0dc';g.fillText(l[1],w-46,y+2)})});
function drawIcon(g,t){g.beginPath();if(t==='croissant'){g.arc(0,8,22,Math.PI*1.05,Math.PI*1.95);g.moveTo(-14,-6);g.lineTo(-10,6);g.moveTo(0,-12);g.lineTo(0,2);g.moveTo(14,-6);g.lineTo(10,6)}else if(t==='baguette'){g.ellipse(0,0,34,8,-.25,0,Math.PI*2);for(let k=-1;k<=1;k++){g.moveTo(k*14-4,-2+k*3.5);g.lineTo(k*14+4,-6+k*3.5)}}else if(t==='loaf'){g.ellipse(0,4,24,14,0,Math.PI,0);g.lineTo(-24,4);g.moveTo(-10,-4);g.lineTo(-6,-10);g.moveTo(4,-4);g.lineTo(8,-10)}else if(t==='doughnut'){g.arc(0,0,16,0,Math.PI*2);g.moveTo(6,0);g.arc(0,0,6,0,Math.PI*2)}else if(t==='cupcake'){g.moveTo(-14,0);g.lineTo(-10,16);g.lineTo(10,16);g.lineTo(14,0);g.moveTo(-16,0);g.quadraticCurveTo(0,-26,16,0);g.closePath()}g.stroke()}
/* au mur du fond, entre les étagères et le boulanger, au-dessus des baguettes : ni la bulle « Hi! » ni les pastilles du haut de l'écran ne la cachent */
mk(rbox(1.32,.87,.06,.028,3),wood('#6e4a2c'),-.62,2.3,-3.96,chalk);
mk(new THREE.PlaneGeometry(1.2,.75),M('#fff',{map:chT,roughness:.95,bumpScale:.006}),-.62,2.3,-3.925,chalk);chalk.position.z=DZB;
/* ardoise suspendue au plafond, au-dessus du comptoir côté clients (deux faces, mêmes prix) : elle n'apparaît que pendant le service,
   vu à la première personne depuis la caisse (l'ardoise du mur est alors dans notre dos) */
const chalk2=item('chalkboard');chalk2.position.set(.85,2.08,CZ+1.4);chalk2.visible=false;
mk(rbox(1.2,.76,.05,.026,3),wood('#6e4a2c'),0,0,0,chalk2);
[1,-1].forEach(s=>{const f=mk(new THREE.PlaneGeometry(1.1,.68),M('#fff',{map:chT,roughness:.95,bumpScale:0}),0,0,-s*.03,chalk2);if(s>0)f.rotation.y=Math.PI});
[-.5,.5].forEach(x=>mk(cyl(.008,.008,HT-2.46,6),M('#3a302a',{metalness:.6,roughness:.4}),x,.38+(HT-2.46)/2,0,chalk2));

/* ---------- fenêtres : côté gauche (celle du soleil), côté droit, vitrine de la façade ---------- */
const skyT=tex(256,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#8fd0ff');gr.addColorStop(1,'#fff1d0');g.fillStyle=gr;g.fillRect(0,0,w,h);g.fillStyle='rgba(255,255,255,.85)';[[60,70,30],[90,62,24],[180,110,26],[205,104,20]].forEach(c=>{g.beginPath();g.arc(c[0],c[1],c[2],0,7);g.fill()});
 g.fillStyle='#c98f6a';g.fillRect(0,h*.72,w*.4,h);g.fillStyle='#e3b48a';g.fillRect(w*.55,h*.62,w*.45,h);g.fillStyle='#7aa0b8';for(let i=0;i<3;i++)g.fillRect(w*.6+i*30,h*.7,16,20)});
const SKY=new THREE.MeshBasicMaterial({map:skyT});
const fr=()=>M('#fbf6ee',{roughness:.45});
function fenetre(x,y,z,ry,w,h){const g=item('window');g.position.set(x,y,z);g.rotation.y=ry;
 const s=mk(new THREE.PlaneGeometry(w-.16,h-.1),SKY,0,0,0,g);s.userData.glow=true;
 mk(rbox(w,.09,.08,.03,2),fr(),0,h/2-.01,.02,g);mk(paint(rbox(w+.14,.08,.22,.03,2),(x,y)=>y<0?.75:1),MV('#fbf6ee',{roughness:.45}),0,-h/2+.01,.08,g);mk(rbox(.09,h,.08,.03,2),fr(),-w/2+.04,0,.02,g);mk(rbox(.09,h,.08,.03,2),fr(),w/2-.04,0,.02,g);
 mk(rbox(.045,h-.1,.045,.018,2),fr(),0,0,.02,g);mk(rbox(w-.16,.045,.045,.018,2),fr(),0,0,.02,g);return g}
fenetre(-RX+.03,1.8,LWZ,Math.PI/2,1.76,1.6);fenetre(RX-.03,1.8,CRATE[1],-Math.PI/2,1.5,1.4);fenetre(-1.9,1.8,FZ-.03,Math.PI,2.6,1.5);

/* ---------- porte d'entrée dans la façade, côté départ ; la toucher ou marcher jusqu'à elle ramène sur la place ---------- */
const door=item('door');door.position.set(DX,0,FZ-.04);door.rotation.y=Math.PI;
mk(paint(rbox(1.05,2.15,.06,.025,3),footAO(2.15,.3)),MV('#2d5a7b',{roughness:.5}),0,1.075,0,door);
const dg=mk(new THREE.PlaneGeometry(.75,.8),SKY,0,1.55,.035,door);dg.userData.glow=true;
mk(rbox(1.25,.1,.1,.04,2),fr(),0,2.2,0,door);mk(rbox(.1,2.2,.1,.04,2),fr(),-.58,1.1,0,door);mk(rbox(.1,2.2,.1,.04,2),fr(),.58,1.1,0,door);
mk(sph(.04,14),M('#d9b46a',{metalness:.8,roughness:.25}),-.38,1.05,.07,door);
const openT=tex(256,96,(g,w,h)=>{g.fillStyle='#fbf4e6';g.fillRect(0,0,w,h);g.fillStyle='#c73e5d';g.beginPath();g.moveTo(w/2,h*.78);g.bezierCurveTo(w/2-60,h*.42,w/2-26,h*.08,w/2,h*.34);g.bezierCurveTo(w/2+26,h*.08,w/2+60,h*.42,w/2,h*.78);g.fill()});
mk(new THREE.PlaneGeometry(.4,.15),new THREE.MeshStandardMaterial({map:openT}),0,1.4,.045,door);
/* pancarte « sortie » au-dessus de la porte : flèche, bonhomme qui court, porte (pictogramme, sans texte) */
const exitT=tex(320,128,(g,w,h)=>{g.fillStyle='#2f9e5b';g.fillRect(0,0,w,h);g.strokeStyle=g.fillStyle='#fbf6ee';g.lineWidth=10;g.lineCap=g.lineJoin='round';
 const ln=(...p)=>{g.beginPath();g.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)g.lineTo(p[i],p[i+1]);g.stroke()};
 ln(24,64,84,64);ln(66,46,86,64,66,82);g.beginPath();g.arc(152,30,12,0,7);g.fill();
 ln(148,46,136,76);ln(146,52,162,62,174,54);ln(146,52,130,58,120,50);ln(136,76,154,90,152,110);ln(136,76,126,96,106,100);
 g.lineWidth=8;g.strokeRect(206,18,62,94);g.beginPath();g.arc(258,66,5,0,7);g.fill()});

/* paillasson devant la porte */
mk(paint(rbox(1.1,.035,.6,.015,3),(x,y,z)=>.85+.15*Math.abs(Math.sin(x*40))),MV('#9a6b3a',{roughness:1}),DX,.045,FZ-.5);

/* ---------- suspensions : abat-jour dont l'intérieur s'illumine, ampoule, halo doux autour ---------- */
const lamp=item('lamp'),LAMPIN=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide});
/* deux au-dessus du comptoir (une troisième au-dessus des tables cachait la salle en vue d'en haut) */
const LP=[[-1.7,CZ],[1.25,CZ]];
{const inner=mk(glowMerge(LP.map(([x,z])=>[new THREE.CylinderGeometry(.045,.25,.21,28,1,true),x,2.5,z,0,1,'#ffcf8a'])),LAMPIN,0,0,0,lamp);inner.userData.glow=true;
 const bulb=mk(glowMerge(LP.map(([x,z])=>[sph(.055,14),x,2.42,z,0,1,'#fff1c4'])),new THREE.MeshBasicMaterial({vertexColors:true}),0,0,0,lamp);bulb.userData.glow=true}
LP.forEach(([x,z],i)=>{mk(cyl(.006,.006,.9,6),M('#222'),x,3.05,z,lamp);mk(new THREE.CylinderGeometry(.05,.26,.22,28,1,true),M('#2f4a3f',{roughness:.4,metalness:.3}),x,2.5,z,lamp);
 if(i<2){const L=new THREE.PointLight('#ffbf73',.85,5.2,2);L.position.set(x,2.3,z);scene.add(L)}});
/* halos des ampoules : un seul objet (points) */
{const hT=tex(64,64,(g)=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,220,160,.9)');gr.addColorStop(.3,'rgba(255,200,130,.35)');gr.addColorStop(1,'rgba(255,190,120,0)');g.fillStyle=gr;g.fillRect(0,0,64,64)});
 const hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.Float32BufferAttribute(LP.flatMap(([x,z])=>[x,2.4,z]),3));
 const halo=new THREE.Points(hg,new THREE.PointsMaterial({map:hT,size:.9,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,color:'#ffd9a0'}));halo.userData.glow=true;scene.add(halo)}

/* ---------- sacs de farine ---------- */
const flour=item('flour');flour.position.set(FLR[0],0,FLR[1]);flour.rotation.y=.6;
[[0,0,1],[.45,-.4,.85]].forEach(p=>{const s=mk(paint(sph(1,24),(x,y)=>.8+.2*sstep(-.9,.2,y)),MV('#e8dcc2',{roughness:1}),p[0],.38*p[2],p[1],flour);s.scale.set(.3*p[2],.4*p[2],.25*p[2]);
 mk(cyl(.07,.13,.13*p[2],16),M('#e0d2b4',{roughness:1}),p[0],.8*p[2],p[1],flour);mk(new THREE.TorusGeometry(.08,.017,8,20),M('#8a5f31'),p[0],.76*p[2],p[1],flour).rotation.x=Math.PI/2});
const flT=tex(256,128,(g,w,h)=>{g.fillStyle='#f6efdf';g.fillRect(0,0,w,h);g.strokeStyle='#c73e5d';g.lineWidth=6;g.strokeRect(8,8,w-16,h-16);g.strokeStyle='#2a1a12';g.fillStyle='#2a1a12';g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(w/2,h*.88);g.lineTo(w/2,h*.2);g.stroke();for(let k=0;k<4;k++){const y=h*.3+k*h*.14;[-1,1].forEach(sg=>{g.beginPath();g.ellipse(w/2+sg*14,y,12,6,sg*.6,0,Math.PI*2);g.fill()})}g.beginPath();g.ellipse(w/2,h*.18,6,11,0,0,Math.PI*2);g.fill()});
mk(new THREE.PlaneGeometry(.3,.15),new THREE.MeshStandardMaterial({map:flT,roughness:1}),0,.42,.252,flour);

/* ---------- deux petites tables rondes devant la vitrine, leurs chaises (coussin rose), une tasse et une assiette avec un croissant ---------- */
/* pieds en fer peint (mat, mêmes réglages que le bois : chaque table, chaque chaise = un seul appel de dessin une fois regroupée) */
const MET=()=>M('#2a2522',{roughness:.45});
TBL.forEach(([tx,tz])=>{const t=item('table');t.position.set(tx,0,tz);
 mk(paint(cyl(.36,.36,.045,32),(x,y)=>y<0?.75:1),MV('#f3efe9',{roughness:.45}),0,.74,0,t);mk(cyl(.026,.026,.7,10),MET(),0,.37,0,t);mk(cyl(.19,.22,.03,20),MET(),0,.015,0,t)});
CHR.forEach(([x,z,ry])=>{const chair=item('chair');chair.position.set(x,0,z);chair.rotation.y=ry;
 mk(paint(cyl(.2,.2,.045,24),(x,y)=>y<0?.7:1),MV('#7a4e2c',{roughness:.45}),0,.47,0,chair);
 {const cu=mk(paint(sph(1,16),(x,y)=>.85+.15*sstep(-.5,.6,y)),MV(PAL.walls[4],{roughness:.45}),0,.51,.01,chair);cu.scale.set(.17,.035,.16)}
 [[.13,.13],[-.13,.13],[.13,-.13],[-.13,-.13]].forEach(p=>{const l=mk(cyl(.012,.012,.47,8),MET(),p[0],.235,p[1],chair);l.rotation.set(p[1]*.4,0,-p[0]*.4)});
 mk(new THREE.TorusGeometry(.17,.014,8,24,Math.PI),MET(),0,.72,-.18,chair);
 mk(cyl(.012,.012,.26,8),MET(),.17,.6,-.18,chair);mk(cyl(.012,.012,.26,8),MET(),-.17,.6,-.18,chair)});
const cupI=item('cup');cupI.position.set(TBL[0][0]+.1,-.02,TBL[0][1]-.08);
mk(cyl(.075,.075,.008,24),M('#ffffff',{roughness:.2}),0,.785,0,cupI);mk(cyl(.042,.034,.07,20),M('#ffffff',{roughness:.2}),0,.825,0,cupI);
mk(cyl(.038,.038,.004,20),M('#7a4a22',{roughness:.2}),0,.858,0,cupI);mk(new THREE.TorusGeometry(.02,.006,8,16),M('#ffffff',{roughness:.2}),.05,.83,0,cupI);
{const pl=item('croissant');pl.position.set(TBL[1][0]-.05,.765,TBL[1][1]-.06);mk(cyl(.11,.09,.014,24),M('#ffffff',{roughness:.32}),0,.007,0,pl);mk(crG,crM,0,.03,.02,pl).rotation.y=2.2}

/* ---------- présentoir en caisse de bois sous la fenêtre de droite : deux corbeilles de petits pains ---------- */
/* osier et pains d'une corbeille : mêmes réglages, donc fusionnés en un seul objet */
const WK=c=>MV(c||'#c08a4e',{side:THREE.DoubleSide,roughness:.65});
{const cr=new THREE.Group();cr.position.set(CRATE[0],0,CRATE[1]);scene.add(cr);
 mk(paint(rbox(.5,.62,1.05,.04,3),footAO(.62,.35)),MV('#a8743f',{roughness:.7}),0,.31,0,cr);
 [.16,.36].forEach(y=>mk(rbox(.52,.035,1.07,.015,2),M('#8a5a33',{roughness:.7}),0,y,0,cr));
 [-.25,.25].forEach((z,i)=>{const b=item('basket');b.position.set(CRATE[0]-.02,.62,CRATE[1]+z);
  mk(paint(new THREE.CylinderGeometry(.2,.16,.14,28,4,true),(x,y,z)=>{const a=Math.atan2(x,z);return .78+.22*(.5+.5*Math.sin(a*14+(Math.floor((y+.07)*30)%2)*Math.PI))}),WK(),0,.07,0,b);
  mk(cyl(.16,.16,.02,20),WK('#8a5f31'),0,.01,0,b);mk(new THREE.TorusGeometry(.2,.022,8,28),WK('#8a5f31'),0,.14,0,b).rotation.x=Math.PI/2;
  [[-.07,-.05],[.08,-.04],[0,.08]].forEach(([x,z],k)=>{const r=mk(bouleG[(k+i)%2],WK('#ffffff'),x,.11,z,b);r.scale.setScalar(.62);r.rotation.y=k*2})})}

/* ---------- plantes en pot : feuillage en boules de pâte (plus sombre dessous), pot en terre cuite ---------- */
PLANTS.forEach(([x,z,s])=>{const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(s);scene.add(g);
 mk(paint(cyl(.2,.15,.36,24),(x,y)=>.8+.2*sstep(-.18,.18,y)),MV('#c96a42',{roughness:.8}),0,.18,0,g);
 mk(new THREE.TorusGeometry(.2,.035,8,24),M('#b85d38',{roughness:.8}),0,.36,0,g).rotation.x=Math.PI/2;
 const LF=['#6f9a48','#5f8a3e','#83ad55','#77a24c'];
 [[0,.72,0,.24],[-.14,.6,.08,.18],[.15,.62,-.04,.19],[.03,.58,.16,.17],[-.06,.9,-.05,.17],[.1,.84,.08,.15],[-.1,.66,-.14,.16]].forEach(([lx,ly,lz,r],k)=>{
  const f=mk(paint(sph(1,14),(x,y)=>.72+.28*sstep(-.8,.7,y)),MV(LF[k%4],{roughness:.8}),lx,ly,lz,g);f.scale.set(r,r*.85,r)})});

/* ---------- tapis tressé rond devant le comptoir (anneaux de couleurs), là où l'on attend son tour ---------- */
{const rT=tex(256,256,(g,w,h)=>{const C=['#c96a42','#f1e2c6','#8fae7a','#e2b04a','#f1e2c6','#c96a42','#d99b8c','#f1e2c6','#8fae7a'];for(let i=0;i<C.length;i++){g.fillStyle=C[i];g.beginPath();g.arc(w/2,h/2,w/2*(1-i/C.length),0,7);g.fill()}
  g.strokeStyle='rgba(60,30,10,.18)';g.lineWidth=2;for(let r=8;r<w/2;r+=7){g.beginPath();g.arc(w/2,h/2,r,0,7);g.stroke()}});
 const rug=mk(new THREE.CylinderGeometry(1,1,.02,48),M('#ffffff',{map:rT,roughness:1,bumpScale:.01}),.6,.012,1.6);rug.scale.set(1.15,1,.82);rug.userData.noShadow=true;rug.receiveShadow=true}

/* ---------- lumière : soleil rasant par la fenêtre de gauche (seul endroit où il entre : son carreau tombe devant le comptoir), suspensions chaudes,
   lumière douce de la vitrine derrière soi, et le reflet chaud du carreau de soleil sur le sol ---------- */
/* lumière douce et chaude partout (avant : soleil très fort et pièce presque noire, contraste dur) */
scene.add(new THREE.HemisphereLight('#fff0dc','#7a5a40',.5));
const sun=new THREE.DirectionalLight("#ffd9a8",2.3);sun.position.set(-9,4.6,-3.2);sun.target.position.set(0,0,-.3);scene.add(sun,sun.target);
sun.castShadow=true;sun.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);Object.assign(sun.shadow.camera,{left:-7,right:7,top:5,bottom:-5,near:1,far:20});sun.shadow.bias=-.0005;sun.shadow.normalBias=.02;
const fill=new THREE.DirectionalLight('#ffe7d0',.45);fill.position.set(1.5,2.6,7);scene.add(fill);
const bounce=new THREE.PointLight('#ffb36b',.55,4.5,2);bounce.position.set(-1.3,.3,.8);scene.add(bounce);

/* poussière de farine qui danse dans le rayon de soleil (un seul objet, quelques dizaines de points) */
const SD=new THREE.Vector3(9,-4.6,2.2).normalize(),MOTES=mobile?40:70,moteP=new Float32Array(MOTES*3),moteS=[];
function mote(i){const y0=1.1+Math.random()*1.4,t=Math.random()*(y0-.15)/-SD.y;moteP[i*3]=-RX+.1+SD.x*t;moteP[i*3+1]=y0+SD.y*t;moteP[i*3+2]=LWZ-.75+Math.random()*1.5+SD.z*t;moteS[i]=Math.random()*10}
for(let i=0;i<MOTES;i++)mote(i);
const moteG=new THREE.BufferGeometry();moteG.setAttribute('position',new THREE.BufferAttribute(moteP,3));
const dotT=tex(32,32,(g)=>{const gr=g.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'rgba(255,240,210,1)');gr.addColorStop(1,'rgba(255,230,190,0)');g.fillStyle=gr;g.fillRect(0,0,32,32)});
const motes=new THREE.Points(moteG,new THREE.PointsMaterial({map:dotT,color:'#ffe2b0',size:.03,transparent:true,opacity:.75,depthWrite:false,blending:THREE.AdditiveBlending}));motes.userData.glow=true;motes.frustumCulled=false;scene.add(motes);

const walls=[wallsM];
[...walls,floor,ceil].forEach(o=>{o.userData.keep=true});
/* regroupement des objets fixes, sur ordinateur aussi (avant : objets cliquables épargnés, deux fois plus d'appels de dessin).
   Pour que le survol n'éclaire qu'un objet, chaque objet cliquable reçoit ensuite ses propres matières (même programme, rien à recompiler) */
PVClay.bake(scene);
if(!mobile)hits.forEach(g=>{if(g.userData.id==='baker')return;const own=new Map();g.traverse(o=>{if(!o.isMesh||!o.userData.baked)return;const m=o.material;if(m.userData.claySSS||m.userData.clayStone)return;
 if(!own.has(m)){const c=PVClay.apply(new THREE.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:m.roughness,metalness:m.metalness,side:m.side,flatShading:m.flatShading}),m.userData.clayAmt||0);if(m.userData.noCut)c.userData.noCut=true;own.set(m,c)}
 o.material=own.get(m);o.userData.own=true})});
scene.traverse(o=>{if(o.isMesh&&!o.userData.noShadow&&!o.userData.glow&&!o.userData.keep){o.castShadow=true;o.receiveShadow=true}});
/* les murs et le plafond projettent leur ombre : le soleil n'entre que par la fenêtre */
wallsM.castShadow=ceil.castShadow=true;ceil.receiveShadow=true;
chalk2.traverse(o=>{if(o.isMesh)o.castShadow=false});
if(ACI){ceil.material=ceil.material.clone();ceil.material.colorWrite=false;ceil.material.depthWrite=false;scene.fog.near=22;scene.fog.far=52}
/* tout est immobile (sauf la tête du boulanger) : la carte d'ombre n'est calculée qu'une fois */
R.shadowMap.autoUpdate=false;R.shadowMap.needsUpdate=true;

/* ---------- marche à la première personne (mêmes gestes que sur la place) ---------- */
const EYE=1.5,PR=.25,SPEED=2.2,START={x:DX-.3,z:FZ-1.05,yaw:.13,pitch:-.04};
const pos=new THREE.Vector3(),vel=new THREE.Vector3(),wish=new THREE.Vector3(),fwd=new THREE.Vector3(),right=new THREE.Vector3();
let yaw=0,pitch=0,tYaw=0,tPitch=0,target=null,bob=0,stuckT=0,gone=false,off=false,camInit=false;
const keys={};
addEventListener('keydown',e=>{if((H.active&&!H.active())||/INPUT|SELECT|TEXTAREA/.test((e.target||{}).tagName||''))return;keys[e.key.toLowerCase()]=true});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});
/* obstacles : boîtes [x0,x1,z0,z1] (comptoir, étagères, four, présentoir) et cercles [x,z,r] (boulanger, panier, sacs de farine, tables, chaises, plantes) */
const boxes=[[-3.08,2.08,CZ-.42,CZ+.42],[SX-1.17,SX+1.17,RZ0,RZ0+.5],[1.9,3.5,RZ0,RZ0+1.12],[CRATE[0]-.3,RX,CRATE[1]-.55,CRATE[1]+.55]];
const circles=[[.25,CZ-.85,.38],[BSK[0],BSK[1],.27],[FLR[0]+.08,FLR[1]-.3,.52]].concat(TBL.map(t=>[t[0],t[1],.38]),CHR.map(c=>[c[0],c[1],.22]),PLANTS.map(p=>[p[0],p[1],.26*p[2]]));
const clampX=x=>Math.max(-RX+PR,Math.min(RX-PR,x)),clampZ=z=>Math.max(RZ0+PR,Math.min(FZ-PR,z));
function collide(p){for(let it=0;it<3;it++){
 circles.forEach(c=>{const ex=p.x-c[0],ez=p.z-c[1],d=Math.hypot(ex,ez),rr=c[2]+PR;if(d<rr&&d>1e-4){p.x=c[0]+ex/d*rr;p.z=c[1]+ez/d*rr}});
 boxes.forEach(b=>{const x0=b[0]-PR,x1=b[1]+PR,z0=b[2]-PR,z1=b[3]+PR;if(p.x>x0&&p.x<x1&&p.z>z0&&p.z<z1){const m=Math.min(p.x-x0,x1-p.x,p.z-z0,z1-p.z);if(m===p.x-x0)p.x=x0;else if(m===x1-p.x)p.x=x1;else if(m===p.z-z0)p.z=z0;else p.z=z1}});
 p.x=clampX(p.x);p.z=clampZ(p.z)}}
function place(){cam.position.set(pos.x,pos.y+Math.sin(bob)*.018*Math.min(1,Math.hypot(vel.x,vel.z)/SPEED),pos.z);cam.rotation.set(pitch,yaw,0,'YXZ')}

/* picking : objets (mots), sol et murs (marcher) */
const ray=new THREE.Raycaster(),ptr=new THREE.Vector2(),pickables=hits.concat(floor,walls);let hov=null,down=null;const tip=$('hover');canvas.style.cursor=PVClay.cursor.hand;
function pick(e){const r=canvas.getBoundingClientRect();ptr.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ptr,cam);
 const shown=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true};
 const hs=ray.intersectObjects(pickables,true).filter(h=>!h.object.userData.glass&&!(ACI&&!job&&h.point.z>CLIPZ)&&shown(h.object));if(!hs.length)return null;
 let o=hs[0].object;if(o.userData.keep)return{walk:true,point:hs[0].point};while(o&&!o.userData.id)o=o.parent;return o?{obj:o}:null}
function hl(g,on){if(!g)return;g.traverse(o=>{if(o.isMesh&&o.material.emissive&&!o.userData.glow&&(!o.userData.baked||o.userData.own)){if(on){if(o.userData.e===undefined)o.userData.e=o.material.emissive.getHex();o.material.emissive.setHex(0x3a2410)}else if(o.userData.e!==undefined)o.material.emissive.setHex(o.userData.e)}})}
const exitLab=()=>{const b=$('exitBtn');return '← '+(b?b.textContent.trim():'')};
function leave(){if(gone)return;gone=true;target=null;vel.set(0,0,0);for(const k in keys)keys[k]=false;hl(hov,false);hov=null;tip.classList.add('hidden');H.exit&&H.exit()}
/* doigts et souris : un doigt = regarder (glisser) ou marcher / toucher (tap) ; deux doigts = zoom (pincer) ; molette = zoom */
const touches=new Map();let pinch=null,multi=false,zoomT=1,zoomV=1;
const setZoom=z=>{zoomT=Math.max(.5,Math.min(1.15,z))},spread=()=>{const [a,b]=[...touches.values()];return Math.hypot(a.x-b.x,a.y-b.y)||1};
canvas.addEventListener('pointerdown',e=>{touches.set(e.pointerId,{x:e.clientX,y:e.clientY});try{canvas.setPointerCapture(e.pointerId)}catch(er){}
 if(touches.size===1){multi=false;down={lx:e.clientX,ly:e.clientY,moved:0,id:e.pointerId}}else{multi=true;down=null;if(touches.size===2)pinch={d:spread(),z:zoomT}}});
canvas.addEventListener('pointermove',e=>{if(touches.has(e.pointerId))touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pinch&&touches.size>=2){setZoom(pinch.z*pinch.d/spread());return}
 if(down&&down.id===e.pointerId){const dx=e.clientX-down.lx,dy=e.clientY-down.ly;down.lx=e.clientX;down.ly=e.clientY;down.moved+=Math.abs(dx)+Math.abs(dy);
  if(down.moved>6&&!ACI){const k=.0042*zoomV;tYaw-=dx*k;tPitch=Math.max(-1.1,Math.min(1,tPitch-dy*k))}return}
 if(e.pointerType!=='mouse')return;
 /* survol à la souris : l'objet s'éclaire et son nom s'affiche */
 const p=pick(e),g=p&&p.obj||null;if(g!==hov){hl(hov,false);hov=g;hl(hov,true)}
 canvas.style.cursor=hov?PVClay.cursor.hover:PVClay.cursor.hand;
 if(hov){const id=hov.userData.id;tip.textContent=id==='door'?exitLab():H.label(id);tip.style.left=e.clientX+'px';tip.style.top=e.clientY+'px';tip.classList.remove('hidden')}else tip.classList.add('hidden')});
function lift(e){touches.delete(e.pointerId);if(touches.size<2)pinch=null;if(multi){if(!touches.size)multi=false;down=null;return true}return false}
canvas.addEventListener('pointercancel',e=>{lift(e);down=null});
canvas.addEventListener('pointerup',e=>{if(lift(e))return;if(!down||down.id!==e.pointerId){down=null;return}const mv=down.moved;down=null;if(mv>8)return;
 const p=pick(e);if(!p)return;
 /* tap au sol ou sur un mur : on marche jusque-là (tout près de la porte : on va jusqu'à elle, donc on sort) */
 if(p.walk){const x=p.point.x,z=p.point.z;target=Math.abs(x-DX)<.7&&z>FZ-1.1?new THREE.Vector3(DX,0,FZ):new THREE.Vector3(clampX(x),0,clampZ(z));return}
 const g=p.obj,id=g.userData.id;
 /* porte : la 1re fois on apprend le mot « door », ensuite elle fait sortir (le tapis et le bouton aussi) */
 if(id==='door'){if(!job)leave();else H.busy&&H.busy();return}
 H.pick(id);g.scale.setScalar(1.06);setTimeout(()=>g.scale.setScalar(1),140)});
canvas.addEventListener('wheel',e=>{e.preventDefault();setZoom(zoomT*(1+Math.max(-.2,Math.min(.2,e.deltaY*.0012))))},{passive:false});
canvas.addEventListener('pointerleave',()=>{hl(hov,false);hov=null;tip.classList.add('hidden')});

/* retour au départ : juste à l'intérieur, près de la porte, face au comptoir et au boulanger */
function reset(){camInit=false;pos.set(START.x,EYE,START.z);yaw=tYaw=START.yaw;pitch=tPitch=START.pitch;vel.set(0,0,0);target=null;stuckT=0;bob=0;zoomT=zoomV=1;gone=false;
 down=null;pinch=null;multi=false;touches.clear();for(const k in keys)keys[k]=false;hl(hov,false);hov=null;tip.classList.add('hidden');place()}
reset();
/* histoire : tu tiens le comptoir. Toi derrière la caisse (vue à la première personne), Tom à ta droite,
   les clients entrent par la porte, viennent au comptoir puis repartent. SV = ta place, CU = celle du client */
let job=null;const SV={x:.82,z:CZ-.85},CU=[.7,CZ+.9];
function jobStart(){job={cust:null};baker.position.x=-1;pos.x=SV.x;pos.z=SV.z;vel.set(0,0,0);target=null;if(me)me.yaw=0;chalk2.visible=true;fpInit=false}
function jobEnd(){if(job&&job.cust)scene.remove(job.cust.c.g);job=null;baker.position.x=.25;baker.rotation.y=0;chalk2.visible=false;reset()}
function cust(look,cb){if(!job)return;const c=PVClay.char(look,{});PVClay.bake(c.g);if(look.scale)c.g.scale.setScalar(look.scale);scene.add(c.g);c.yaw=Math.PI;c.ph=0;c.g.position.set(DX,0,FZ-.7);job.cust={c,to:CU.slice(),cb}}
function custLeave(cb){if(!job||!job.cust){if(cb)cb();return}const J=job.cust;J.to=[DX,FZ-.5];J.cb=()=>{scene.remove(J.c.g);if(job)job.cust=null;if(cb)cb()}}
window.PVBakery={reset,jobStart,jobEnd,cust,custLeave,inJob:()=>!!job};
if(/[?&]debug\b/.test(location.search))window.PVBAK={cam,R,scene,CAMT,CAMP,job:()=>job,go(x,z,yw,pt){pos.set(x,EYE,z);yaw=tYaw=yw||0;pitch=tPitch=pt||0;target=null;vel.set(0,0,0);place()}};

addEventListener('resize',()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();R.setSize(innerWidth,innerHeight)});
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clock=new THREE.Clock();const tmp=new THREE.Vector3();let bkBlink=2;
/* ton personnage, et la caméra d'intérieur : haute (environ 50°), elle montre toute la pièce et suit doucement tes pas ;
   pendant une conversation, elle se rapproche du boulanger, cadré dans le haut de l'écran */
const me=ACI?PVClay.char(PVClay.playerLook,{}):null;
if(me){PVClay.bake(me.g);scene.add(me.g);me.yaw=Math.PI;const sh=new THREE.Mesh(new THREE.CircleGeometry(.36,24),new THREE.MeshBasicMaterial({color:'#3a2418',transparent:true,opacity:.22,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=.012;me.g.add(sh)}
const camP=new THREE.Vector3(),camL=new THREE.Vector3(),_cw=new THREE.Vector3(),_cl=new THREE.Vector3(),_bk=new THREE.Vector3();
/* service au comptoir : vue à la première personne, debout derrière la caisse, à hauteur d'yeux.
   On regarde la porte et la salle (l'ardoise suspendue en haut, le comptoir et ses pains en bas) ; quand Tom parle, on se tourne vers lui.
   Sur téléphone, pendant une conversation, le bas de l'écran est caché : on relève un peu le regard pour garder client et ardoise au-dessus */
let fpY=Math.PI,fpP=0,fpInit=false;
function placeFP(dt){const port=innerWidth/innerHeight<1,dlg=document.body.classList.contains('dlg-open');
 /* sur ordinateur, la bulle de dialogue couvre le bas de l'écran : champ un peu plus large et regard plus bas pour voir ardoise et client */
 let yw=Math.PI,pt,fov=port?78:(dlg?66:60);
 if(dlg&&!job.cust){baker.getWorldPosition(_bk);yw=Math.atan2(-(_bk.x-SV.x),-(_bk.z-SV.z))+(port?0:.25);pt=port?-.15:-.02}
 else pt=port?-.2:(dlg?-.16:-.1);
 const k=fpInit?1-Math.exp(-dt*3.2):1;fpInit=true;let d=yw-fpY;d=Math.atan2(Math.sin(d),Math.cos(d));fpY+=d*k;fpP+=(pt-fpP)*k;
 cam.position.set(SV.x,EYE,SV.z);cam.rotation.set(fpP,fpY,0,'YXZ');
 if(Math.abs(cam.fov-fov)>.05){cam.fov+=(fov-cam.fov)*k;cam.updateProjectionMatrix()}
 /* plafond et façade visibles (en vue d'en haut, ils sont effacés) */
 ceil.material.colorWrite=ceil.material.depthWrite=true;const E=PVClay.U;E.clipOn.value=0;E.cutOn.value=0;E.bendK.value=0}
function placeAC(dt){if(job){placeFP(dt);return}ceil.material.colorWrite=ceil.material.depthWrite=false;const asp=innerWidth/innerHeight,port=asp<1,dlg=document.body.classList.contains('dlg-open');let fov;
 if(dlg){fov=port?44:32;baker.getWorldPosition(_bk);const Hv=port?3.6:2.9,back=Hv/(2*Math.tan(fov*Math.PI/360));_cw.set(_bk.x+.6,1.0+back*.36,_bk.z+back);_cl.set(_bk.x,port?.2:.62,_bk.z)}
 else{/* pièce resserrée : la caméra ne suit plus que doucement ton personnage, toute la boutique reste à l'écran (comptoir, étagères, four, tables).
   Téléphone (portrait) : plus haute et plus plongeante, pour remplir la hauteur de l'écran ; ordinateur : plus basse, on voit le mur du fond et l'ardoise */
  const C=port?CAMT:CAMP;fov=C.fov;_cl.set(pos.x*C.fx+C.ox,C.ty,RZC+(pos.z-RZC)*C.fz+C.oz);const dist=C.d*zoomV;_cw.set(_cl.x,_cl.y+dist*Math.sin(C.el),_cl.z+dist*Math.cos(C.el))}
 const k=camInit?1-Math.exp(-dt*(dlg?4:6)):1;camInit=true;camP.lerp(_cw,k);camL.lerp(_cl,k);cam.position.copy(camP);cam.lookAt(camL);
 if(Math.abs(cam.fov-fov)>.05){cam.fov+=(fov-cam.fov)*k;cam.updateProjectionMatrix()}
 const E=PVClay.U;E.clipOn.value=1;E.clip.value.set(0,0,1,CLIPZ);E.clip2.value.set(0,1,0,HT-.45);E.cutOn.value=0;E.bendK.value=0}
/* reflets de la pâte : intérieur chaud (crème au plafond, bois au sol) au lieu du ciel de la place */
const envT=new THREE.Color('#f6ead4').convertSRGBToLinear().multiplyScalar(.8),envH=new THREE.Color('#efe0c8').convertSRGBToLinear().multiplyScalar(.75),envG=new THREE.Color('#8a5a3a').convertSRGBToLinear().multiplyScalar(.6);
function clayEnv(){const E=PVClay.U;E.envT.value.copy(envT);E.envH.value.copy(envH);E.envG.value.copy(envG)}
function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;
 if(H.active&&!H.active()){off=true;return}
 /* revenu après être sorti par la porte : on repart du seuil */
 if(off){off=false;if(gone)reset()}
 let talking=false;try{talking=window.PVSpeaking?window.PVSpeaking():speechSynthesis.speaking}catch(e){}
 if(!reduce){baker.position.y=Math.sin(t*(talking?7:1.6))*(talking?.012:.008);bubble.position.y=2.62+Math.sin(t*2.4)*.04;
  ovenL.intensity=1.1+Math.sin(t*9)*.12+Math.sin(t*23)*.08}
 bubble.visible=H.bubble()&&!job;
 if(!reduce){for(let i=0;i<MOTES;i++){const k=moteS[i];moteP[i*3]+=Math.sin(t*.4+k)*dt*.03;moteP[i*3+1]+=(Math.sin(t*.3+k*1.7)*.04-.012)*dt;moteP[i*3+2]+=Math.cos(t*.35+k)*dt*.03;if(moteP[i*3+1]<.15)mote(i)}moteG.attributes.position.needsUpdate=true}
 /* le boulanger respire, cligne des yeux ; quand il parle, la bouche s'ouvre et les sourcils montent */
 bkBlink-=dt;const shut=bkBlink<0;if(bkBlink<-.12)bkBlink=1.5+Math.random()*3.5;BP.lids[0].rotation.x+=((shut?1.45:-1.25)-BP.lids[0].rotation.x)*.6;
 const mo=talking?.4+Math.abs(Math.sin(t*14))*.9:.01;BP.open.scale.y+=(mo-BP.open.scale.y)*.4;BP.smile.visible=BP.open.scale.y<.3;
 BP.brows[0].position.y+=(BP.browY+(talking?.015+.015*Math.sin(t*5):0)-BP.brows[0].position.y)*.2;
 if(!reduce)BP.body.scale.y=1+Math.sin(t*2.2)*.012;
 /* marche : clavier (ZQSD / WASD / flèches) ou point visé par un tap, avec élan et freinage */
 if(ACI)yaw=0;else PVClay.U.clipOn.value=0;
 fwd.set(-Math.sin(yaw),0,-Math.cos(yaw));right.set(Math.cos(yaw),0,-Math.sin(yaw));wish.set(0,0,0);
 if(keys.w||keys.z||keys.arrowup)wish.add(fwd);if(keys.s||keys.arrowdown)wish.sub(fwd);if(keys.a||keys.q)wish.sub(right);if(keys.d)wish.add(right);
 if(keys.arrowleft)tYaw+=1.6*dt;if(keys.arrowright)tYaw-=1.6*dt;
 if(wish.lengthSq()>0){target=null;wish.normalize().multiplyScalar(SPEED)}
 else if(target){const ddx=target.x-pos.x,ddz=target.z-pos.z,L=Math.hypot(ddx,ddz);if(L<.08)target=null;else{const sp=Math.min(SPEED,L*2.2);wish.set(ddx/L*sp,0,ddz/L*sp)}}
 if(job){wish.set(0,0,0);target=null}
 vel.lerp(wish,1-Math.exp(-dt*(wish.lengthSq()>0?7:9)));
 const px=pos.x,pz=pos.z;pos.addScaledVector(vel,dt);collide(pos);
 if(job){pos.x=SV.x;pos.z=SV.z}
 if(dt>0){vel.x=(pos.x-px)/dt;vel.z=(pos.z-pz)/dt}
 const spd=Math.hypot(vel.x,vel.z);
 if(target&&wish.lengthSq()>.25&&spd<.2){if((stuckT+=dt)>.7){target=null;stuckT=0}}else stuckT=0;
 /* sur le paillasson en avançant vers la porte : on sort */
 if(!gone&&Math.abs(pos.x-DX)<.5&&pos.z>FZ-.5&&wish.z>.1){leave();return}
 yaw+=(tYaw-yaw)*(1-Math.exp(-dt*16));pitch+=(tPitch-pitch)*(1-Math.exp(-dt*16));bob+=dt*spd*3.4;zoomV+=(zoomT-zoomV)*(1-Math.exp(-dt*12));
 if(ACI){placeAC(dt);if(job){const dl=document.body.classList.contains('dlg-open')&&!job.cust,w=dl?Math.atan2(SV.x-baker.position.x,SV.z-baker.position.z)*.75:0;baker.rotation.y+=(w-baker.rotation.y)*(1-Math.exp(-dt*4))}
  if(me){me.g.visible=!job;me.g.position.set(pos.x,0,pos.z);const dlg=document.body.classList.contains('dlg-open');let want=me.yaw;if(job)want=0;else if(dlg){baker.getWorldPosition(_bk);want=Math.atan2(_bk.x-pos.x,_bk.z-pos.z)}else if(spd>.2)want=Math.atan2(vel.x,vel.z);PVClay.walk(me,dt,t,spd,want)}
  if(job&&job.cust){const J=job.cust,g=J.c.g.position,dx=J.to[0]-g.x,dz=J.to[1]-g.z,L=Math.hypot(dx,dz);let sp=0;if(L>.05){const st=Math.min(L,1.3*dt);g.x+=dx/L*st;g.z+=dz/L*st;sp=1.3}else if(J.cb){const f=J.cb;J.cb=null;f()}PVClay.walk(J.c,dt,t,sp,L>.05?Math.atan2(dx,dz):Math.PI)}}
 else{place();{const f=FOV*zoomV;if(Math.abs(cam.fov-f)>.01){cam.fov=f;cam.updateProjectionMatrix()}}}
 /* le boulanger tourne la tête vers nous */
 cam.getWorldPosition(tmp);const dx=tmp.x-baker.position.x,dz=tmp.z-baker.position.z;head.rotation.y+=(Math.max(-.6,Math.min(.6,Math.atan2(dx,dz)-baker.rotation.y))-head.rotation.y)*.08;
 clayEnv();R.render(scene,cam)}
loop();
};
