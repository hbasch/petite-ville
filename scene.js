window.buildScene=function(H){
const $=id=>document.getElementById(id);
const canvas=$('c');
const R=new THREE.WebGLRenderer({canvas,antialias:true});
R.setPixelRatio(Math.min(devicePixelRatio,2));R.setSize(innerWidth,innerHeight);
R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color('#1d2142');scene.fog=new THREE.Fog('#1d2142',10,20);
const cam=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.05,60);cam.position.set(.9,1.8,4.3);
const ctl=new THREE.OrbitControls(cam,canvas);ctl.target.set(-.2,1.15,-1.6);ctl.enableDamping=true;ctl.enablePan=false;
ctl.minDistance=2.4;ctl.maxDistance=6.4;ctl.minPolarAngle=.95;ctl.maxPolarAngle=1.6;ctl.minAzimuthAngle=-.75;ctl.maxAzimuthAngle=.75;ctl.update();

function tex(w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1])}return t}
const clayB=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#808080';g.fillRect(0,0,256,256);for(let i=0;i<200;i++){g.strokeStyle=`rgba(${Math.random()<.5?'255,255,255':'0,0,0'},.16)`;g.lineWidth=1+Math.random()*1.5;g.beginPath();g.arc(Math.random()*256,Math.random()*256,4+Math.random()*10,Math.random()*6,Math.random()*6+2);g.stroke()}for(let i=0;i<2400;i++){g.fillStyle=`rgba(${Math.random()<.5?'255,255,255':'0,0,0'},.06)`;g.fillRect(Math.random()*256,Math.random()*256,2,2)}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1.5,1.5);return t})();
const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.62,bumpMap:clayB,bumpScale:.014},o||{}));
function rbox(w,h,d,r,seg){seg=seg||3;r=Math.min(r,w/2-.001,h/2-.001,d/2-.001);const g=new THREE.BoxGeometry(w,h,d,seg,seg,seg);if(r<=0.004)return new THREE.BoxGeometry(w,h,d);const p=g.attributes.position,v=new THREE.Vector3(),n=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);n.set(Math.max(-w/2+r,Math.min(w/2-r,v.x)),Math.max(-h/2+r,Math.min(h/2-r,v.y)),Math.max(-d/2+r,Math.min(d/2-r,v.z)));const dd=v.clone().sub(n);if(dd.lengthSq()>0){dd.normalize().multiplyScalar(r);v.copy(n).add(dd)}p.setXYZ(i,v.x,v.y,v.z)}g.computeVertexNormals();return g}
const B=(c)=>new THREE.MeshBasicMaterial({color:c});
function mk(geo,mat,x,y,z,p){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);(p||scene).add(m);return m}
const box=(w,h,d)=>rbox(w,h,d,Math.min(w,h,d)*.22,3),cyl=(a,b,h,s)=>new THREE.CylinderGeometry(a,b,h,s||20),sph=(r,s)=>new THREE.SphereGeometry(r,s||20,Math.round((s||20)*.75));
const hits=[];
function item(id){const g=new THREE.Group();g.userData.id=id;hits.push(g);scene.add(g);return g}

const woodTex=tex(256,256,(g,w,h)=>{g.fillStyle='#9a6a3e';g.fillRect(0,0,w,h);for(let i=0;i<60;i++){g.strokeStyle=`rgba(${70+Math.random()*40|0},${40+Math.random()*20|0},20,${.15+Math.random()*.2})`;g.lineWidth=1+Math.random()*2;const y=Math.random()*h;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(w*.3,y+Math.random()*8-4,w*.7,y+Math.random()*8-4,w,y);g.stroke()}},[1,1]);
const wood=(c)=>M(c||'#c9935d',{map:woodTex,roughness:.6});

/* room */
const floorT=tex(256,256,(g,w,h)=>{g.fillStyle='#efe7da';g.fillRect(0,0,w,h);g.fillStyle='#3a312d';g.fillRect(0,0,w/2,h/2);g.fillRect(w/2,h/2,w/2,h/2);g.strokeStyle='rgba(140,120,100,.6)';g.lineWidth=3;g.strokeRect(0,0,w,h);g.beginPath();g.moveTo(w/2,0);g.lineTo(w/2,h);g.moveTo(0,h/2);g.lineTo(w,h/2);g.stroke()},[10,10]);
const floor=mk(new THREE.PlaneGeometry(10,10),M('#fff',{map:floorT,roughness:.3}),0,0,1);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;
const wallT=tex(512,512,(g,w,h)=>{g.fillStyle='#f0c96e';g.fillRect(0,0,w,h);for(let i=0;i<2500;i++){g.fillStyle=`rgba(255,255,255,${Math.random()*.06})`;g.fillRect(Math.random()*w,Math.random()*h,2,2)}
 const p=h*(1-1.05/3.5);g.fillStyle='#fbf4e6';g.fillRect(0,p,w,h-p);g.strokeStyle='rgba(150,120,90,.35)';g.lineWidth=2;for(let x=20;x<w;x+=64){g.strokeRect(x,p+26,44,h-p-46)}g.fillStyle='#c73e5d';g.fillRect(0,p,w,12);g.fillStyle='#e6d8c2';g.fillRect(0,h-14,w,14)},[10/3.5,1]);
const wallM=()=>M('#fff',{map:wallT,roughness:.9});
const back=mk(new THREE.PlaneGeometry(10,3.5),wallM(),0,1.75,-4);back.receiveShadow=true;
const lw=mk(new THREE.PlaneGeometry(10,3.5),wallM(),-5,1.75,1);lw.rotation.y=Math.PI/2;lw.receiveShadow=true;
const rw=mk(new THREE.PlaneGeometry(10,3.5),wallM(),5,1.75,1);rw.rotation.y=-Math.PI/2;rw.receiveShadow=true;
const ceil=mk(new THREE.PlaneGeometry(10,10),M('#f6ead4'),0,3.5,1);ceil.rotation.x=Math.PI/2;
for(let i=0;i<4;i++)mk(box(10,.16,.2),wood('#6e4a2c'),0,3.42,-3+i*2.2);

/* counter */
const counter=item('counter');
mk(box(5,.98,.7),M('#b8334f',{roughness:.45}),-.5,.49,-1.2,counter);
mk(box(5.16,.06,.84),wood('#d9a46d'),-.5,1.01,-1.2,counter);
mk(box(5,.08,.66),M('#4a1726'),-.5,.04,-1.18,counter);
for(let i=0;i<7;i++)mk(box(.6,.62,.02),M('#c94462',{roughness:.4}),-2.65+i*.72,.52,-.85,counter);

/* display case */
const dcase=item('case');
mk(box(2,.04,.56),M('#fbf4ea',{roughness:.4}),-1.9,1.06,-1.2,dcase);
[[-2.88,-.94],[-2.88,-1.46],[-.92,-.94],[-.92,-1.46]].forEach(p=>mk(box(.03,.46,.03),M('#d9b46a',{metalness:.7,roughness:.3}),p[0],1.3,p[1],dcase));
mk(box(2,.03,.56),M('#d9b46a',{metalness:.7,roughness:.3}),-1.9,1.53,-1.2,dcase);
const glass=mk(box(1.95,.44,.52),new THREE.MeshStandardMaterial({color:'#dff3ff',transparent:true,opacity:.14,roughness:.05,metalness:.2,depthWrite:false}),-1.9,1.3,-1.2,dcase);glass.userData.glass=true;glass.userData.noShadow=true;
const croiss=item('croissant');
for(let i=0;i<3;i++){const m=mk(new THREE.TorusGeometry(.055,.032,10,22,Math.PI*1.25),M('#d9962f',{roughness:.5}),-2.68+i*.17,1.11,-1.2+(i%2?.09:-.04),croiss);m.rotation.set(-Math.PI/2,0,.6+i);m.scale.z=.85}
const dough=item('doughnut');
const spr=['#ffffff','#ffd84a','#5ec8f2','#ff5a5a'];
for(let i=0;i<3;i++){const x=-2.08+i*.17,z=-1.2+(i%2?.09:-.04);const d=mk(new THREE.TorusGeometry(.05,.027,12,26),M('#c98b4a'),x,1.105,z,dough);d.rotation.x=-Math.PI/2;
 const ic=mk(new THREE.TorusGeometry(.05,.024,12,26),M('#ff8fb1',{roughness:.35}),x,1.118,z,dough);ic.rotation.x=-Math.PI/2;ic.scale.z=.7;
 for(let k=0;k<8;k++){const a=k/8*Math.PI*2+i;const s=mk(box(.012,.004,.004),M(spr[k%4]),x+Math.cos(a)*.05,1.137,z+Math.sin(a)*.05,dough);s.rotation.y=a*3}}
const cup=item('cupcake');
for(let i=0;i<3;i++){const x=-1.48+i*.17,z=-1.2+(i%2?.09:-.04);mk(cyl(.045,.034,.065,18),M('#f3b9cf'),x,1.115,z,cup);const f=mk(sph(.05),M('#fff4ea',{roughness:.5}),x,1.165,z,cup);f.scale.y=.8;mk(sph(.014,10),M('#d81e3a',{roughness:.3}),x,1.215,z,cup)}

/* cake on stand */
const cake=item('cake');
mk(cyl(.05,.08,.02),M('#ffffff',{roughness:.2}),-.35,1.05,-1.15,cake);mk(cyl(.015,.015,.12),M('#ffffff',{roughness:.2}),-.35,1.12,-1.15,cake);mk(cyl(.2,.2,.012,32),M('#ffffff',{roughness:.2}),-.35,1.18,-1.15,cake);
mk(cyl(.15,.15,.13,32),M('#6b3b22'),-.35,1.25,-1.15,cake);mk(cyl(.155,.155,.03,32),M('#fff0f3',{roughness:.4}),-.35,1.325,-1.15,cake);
for(let k=0;k<7;k++){const a=k/7*Math.PI*2;mk(sph(.022,12),M('#e0283f',{roughness:.3}),-.35+Math.cos(a)*.11,1.35,-1.15+Math.sin(a)*.11,cake)}

/* rolling pin */
const rp=item('rollingpin');rp.position.set(.6,1.07,-.98);rp.rotation.y=.35;
const rpm=mk(cyl(.035,.035,.3),wood('#e3b783'),0,0,0,rp);rpm.rotation.z=Math.PI/2;
[-.2,.2].forEach(x=>{const h=mk(cyl(.016,.016,.1,12),wood('#b57c48'),x,0,0,rp);h.rotation.z=Math.PI/2});
const dust=mk(new THREE.CircleGeometry(.2,24),new THREE.MeshStandardMaterial({color:'#ffffff',transparent:true,opacity:.6,roughness:1}),.6,1.042,-1.0);dust.rotation.x=-Math.PI/2;

/* till */
const till=item('till');
mk(box(.44,.12,.36),M('#c9a24a',{metalness:.6,roughness:.35}),1.45,1.1,-1.2,till);
const tb=mk(box(.38,.16,.24),M('#b38a37',{metalness:.6,roughness:.35}),1.45,1.24,-1.27,till);tb.rotation.x=-.25;
for(let r=0;r<3;r++)for(let c=0;c<4;c++){const k=mk(box(.05,.02,.035),M('#fbf4ea'),1.34+c*.075,1.335-r*.012,-1.33+r*.05,till);k.rotation.x=-.25}
const scr=mk(box(.2,.07,.02),B('#ffb347'),1.45,1.4,-1.4,till);scr.userData.glow=true;

/* baker */
const baker=item('baker');baker.position.set(.25,0,-2.05);
const skin='#f1c7a5';
mk(cyl(.26,.33,.95,28),M('#f8f6f2'),0,1.05,0,baker);
const apron=mk(new THREE.CylinderGeometry(.268,.338,.72,28,1,true,-.95,1.9),M('#e85a7a',{side:THREE.DoubleSide}),0,.97,0,baker);
mk(new THREE.TorusGeometry(.16,.03,8,24),M('#f8f6f2'),0,1.53,0,baker).rotation.x=Math.PI/2;
[-1,1].forEach(s=>{const a=mk(cyl(.065,.055,.5,14),M('#f8f6f2'),s*.31,1.3,.05,baker);a.rotation.z=s*.22;a.rotation.x=-.35;mk(sph(.055,14),M(skin),s*.36,1.07,.17,baker)});
const head=new THREE.Group();head.position.set(0,1.74,0);baker.add(head);
mk(sph(.2,28),M(skin,{roughness:.6}),0,0,0,head);
mk(sph(.035,14),M('#eaa883'),0,-.01,.2,head);
[-1,1].forEach(s=>{mk(sph(.022,12),B('#1d1410'),s*.07,.045,.175,head);mk(sph(.006,8),B('#ffffff'),s*.07+.007,.053,.195,head);
 const ch=mk(sph(.035,12),M('#f39a9a'),s*.115,-.03,.15,head);ch.scale.z=.4;
 const br=mk(box(.06,.012,.012),M('#5a3a22'),s*.07,.09,.18,head);br.rotation.z=-s*.15});
const mus=mk(sph(.05,16),M('#5a3a22'),0,-.055,.18,head);mus.scale.set(1.8,.5,.6);
mk(cyl(.17,.17,.13,28),M('#ffffff'),0,.21,0,head);const puff=mk(sph(.2,24),M('#ffffff'),0,.34,0,head);puff.scale.y=.7;
const bubT=tex(128,128,(g)=>{g.fillStyle='#ffc845';g.beginPath();g.arc(64,58,50,0,Math.PI*2);g.fill();g.beginPath();g.moveTo(50,100);g.lineTo(64,124);g.lineTo(78,100);g.fill();g.fillStyle='#2a1a12';g.font='700 66px Fredoka,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('Hi!',64,60)});
const bubble=new THREE.Sprite(new THREE.SpriteMaterial({map:bubT,depthTest:false}));bubble.scale.set(.36,.36,1);bubble.position.set(0,2.5,0);baker.add(bubble);

/* oven */
const oven=item('oven');
const brickT=tex(256,256,(g,w,h)=>{g.fillStyle='#dcc6a6';g.fillRect(0,0,w,h);const cols=['#a8492f','#b5553a','#94402a','#bd6244'];for(let r=0;r<8;r++)for(let c=-1;c<4;c++){g.fillStyle=cols[(r*3+c+4)%4];g.fillRect(c*64+(r%2)*32+3,r*32+3,58,26)}},[2,2]);
mk(box(1.5,1.7,1),M('#fff',{map:brickT,roughness:.9}),2.7,.85,-3.45,oven);
mk(box(1.6,.1,1.1),M('#5b3a2a'),2.7,1.74,-3.45,oven);
mk(box(.8,.55,.04),M('#1f1612',{metalness:.6,roughness:.4}),2.7,.85,-2.94,oven);
const fire=mk(new THREE.PlaneGeometry(.66,.42),B('#ff7a1a'),2.7,.83,-2.915,oven);fire.userData.glow=true;
const fire2=mk(new THREE.PlaneGeometry(.5,.22),B('#ffd36b'),2.7,.76,-2.91,oven);fire2.userData.glow=true;
mk(cyl(.12,.12,1.8,16),M('#2a2522',{metalness:.6,roughness:.4}),2.7,2.6,-3.6,oven);
const ovenL=new THREE.PointLight('#ff8a2a',1.2,3.5,2);ovenL.position.set(2.7,.85,-2.6);scene.add(ovenL);

/* shelves + loaves */
const shelf=item('shelf');
[.5,1.05,1.6,2.15].forEach(y=>mk(box(2.4,.04,.42),wood('#8a5a33'),-2.6,y,-3.76,shelf));
[-3.8,-1.4].forEach(x=>mk(box(.05,2.2,.42),wood('#7a4e2c'),x,1.1,-3.76,shelf));
const loaf=item('loaf');
[.5,1.05,1.6,2.15].forEach((y,k)=>{for(let i=0;i<3;i++){const x=-3.3+i*.7+(Math.random()-.5)*.1;
 if(k===3){const b=mk(sph(1,24),M('#b8692e',{roughness:.8}),x,y+.09,-3.74,loaf);b.scale.set(.12,.08,.12)}
 else{const l=mk(sph(1,24),M('#b8692e',{roughness:.8}),x,y+.1,-3.74,loaf);l.scale.set(.17,.085,.1);l.rotation.y=(Math.random()-.5)*.3;
  for(let s=-1;s<=1;s++){const c=mk(sph(1,12),M('#e7ad62'),x+s*.07,y+.18,-3.74+.01,loaf);c.scale.set(.025,.008,.05);c.rotation.y=.5}}}});

/* basket + baguettes */
const basket=item('basket');
mk(new THREE.CylinderGeometry(.24,.19,.5,24,1,true),M('#a5733d',{side:THREE.DoubleSide,roughness:.95}),-.7,.25,-3.55,basket);
mk(cyl(.19,.19,.02,24),M('#8a5f31'),-.7,.01,-3.55,basket);
mk(new THREE.TorusGeometry(.24,.025,8,30),M('#8a5f31'),-.7,.5,-3.55,basket).rotation.x=Math.PI/2;
for(let i=0;i<5;i++)mk(new THREE.TorusGeometry(.215-i*.008,.006,6,30),M('#7d532a'),-.7,.1+i*.09,-3.55,basket).rotation.x=Math.PI/2;
const bag=item('baguette');
for(let i=0;i<6;i++){const a=i/6*Math.PI*2;const b=mk(sph(1,18),M('#c9803a',{roughness:.75}),-.7+Math.cos(a)*.1,.62,-3.55+Math.sin(a)*.1,bag);b.scale.set(.045,.42,.045);b.rotation.set(Math.sin(a)*.18,0,-Math.cos(a)*.18)}

/* chalkboard */
const chalk=item('chalkboard');
const chT=tex(512,320,(g,w,h)=>{g.fillStyle='#2b3330';g.fillRect(0,0,w,h);for(let i=0;i<500;i++){g.fillStyle=`rgba(255,255,255,${Math.random()*.04})`;g.fillRect(Math.random()*w,Math.random()*h,6,2)}
 g.strokeStyle='#ffe08a';g.lineWidth=4;g.lineCap='round';g.beginPath();g.moveTo(170,40);g.lineTo(342,40);g.stroke();g.beginPath();g.arc(256,40,12,0,Math.PI*2);g.stroke();
 const L=H.board.rows;g.font='600 32px "Baloo 2",Fredoka,sans-serif';
 L.forEach((l,i)=>{const y=96+i*46;g.save();g.translate(80,y);g.strokeStyle='#f5f1e8';g.lineWidth=4;drawIcon(g,l[0]);g.restore();g.setLineDash([2,10]);g.strokeStyle='rgba(245,241,232,.35)';g.lineWidth=3;g.beginPath();g.moveTo(140,y);g.lineTo(w-160,y);g.stroke();g.setLineDash([]);g.textAlign='right';g.textBaseline='middle';g.fillStyle='#ffd0dc';g.fillText(l[1],w-46,y+2)})});
function drawIcon(g,t){g.beginPath();if(t==='croissant'){g.arc(0,8,22,Math.PI*1.05,Math.PI*1.95);g.moveTo(-14,-6);g.lineTo(-10,6);g.moveTo(0,-12);g.lineTo(0,2);g.moveTo(14,-6);g.lineTo(10,6)}else if(t==='baguette'){g.ellipse(0,0,34,8,-.25,0,Math.PI*2);for(let k=-1;k<=1;k++){g.moveTo(k*14-4,-2+k*3.5);g.lineTo(k*14+4,-6+k*3.5)}}else if(t==='loaf'){g.ellipse(0,4,24,14,0,Math.PI,0);g.lineTo(-24,4);g.moveTo(-10,-4);g.lineTo(-6,-10);g.moveTo(4,-4);g.lineTo(8,-10)}else if(t==='doughnut'){g.arc(0,0,16,0,Math.PI*2);g.moveTo(6,0);g.arc(0,0,6,0,Math.PI*2)}else if(t==='cupcake'){g.moveTo(-14,0);g.lineTo(-10,16);g.lineTo(10,16);g.lineTo(14,0);g.moveTo(-16,0);g.quadraticCurveTo(0,-26,16,0);g.closePath()}g.stroke()}
mk(box(1.72,1.12,.05),wood('#6e4a2c'),.45,2.2,-3.97,chalk);
mk(new THREE.PlaneGeometry(1.6,1),M('#fff',{map:chT,roughness:.95}),.45,2.2,-3.94,chalk);

/* window */
const win3=item('window');win3.position.set(-4.97,1.8,-.6);win3.rotation.y=Math.PI/2;
const skyT=tex(256,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#8fd0ff');gr.addColorStop(1,'#fff1d0');g.fillStyle=gr;g.fillRect(0,0,w,h);g.fillStyle='rgba(255,255,255,.85)';[[60,70,30],[90,62,24],[180,110,26],[205,104,20]].forEach(c=>{g.beginPath();g.arc(c[0],c[1],c[2],0,7);g.fill()});
 g.fillStyle='#c98f6a';g.fillRect(0,h*.72,w*.4,h);g.fillStyle='#e3b48a';g.fillRect(w*.55,h*.62,w*.45,h);g.fillStyle='#7aa0b8';for(let i=0;i<3;i++)g.fillRect(w*.6+i*30,h*.7,16,20)});
const sky=mk(new THREE.PlaneGeometry(1.6,1.5),new THREE.MeshBasicMaterial({map:skyT}),0,0,0,win3);sky.userData.glow=true;
const fr=()=>M('#fbf6ee',{roughness:.4});
mk(box(1.76,.08,.06),fr(),0,.79,.02,win3);mk(box(1.9,.08,.2),fr(),0,-.79,.08,win3);mk(box(.08,1.6,.06),fr(),-.84,0,.02,win3);mk(box(.08,1.6,.06),fr(),.84,0,.02,win3);
mk(box(.04,1.5,.04),fr(),0,0,.02,win3);mk(box(1.6,.04,.04),fr(),0,0,.02,win3);

/* door */
const door=item('door');door.position.set(4.96,0,1.5);door.rotation.y=-Math.PI/2;
mk(box(1.05,2.15,.06),M('#2d5a7b',{roughness:.5}),0,1.075,0,door);
const dg=mk(new THREE.PlaneGeometry(.75,.8),new THREE.MeshBasicMaterial({map:skyT}),0,1.55,.035,door);dg.userData.glow=true;
mk(box(1.25,.1,.1),fr(),0,2.2,0,door);mk(box(.1,2.2,.1),fr(),-.58,1.1,0,door);mk(box(.1,2.2,.1),fr(),.58,1.1,0,door);
mk(sph(.04,14),M('#d9b46a',{metalness:.8,roughness:.25}),-.38,1.05,.07,door);
const openT=tex(256,96,(g,w,h)=>{g.fillStyle='#fbf4e6';g.fillRect(0,0,w,h);g.fillStyle='#c73e5d';g.beginPath();g.moveTo(w/2,h*.78);g.bezierCurveTo(w/2-60,h*.42,w/2-26,h*.08,w/2,h*.34);g.bezierCurveTo(w/2+26,h*.08,w/2+60,h*.42,w/2,h*.78);g.fill()});
mk(new THREE.PlaneGeometry(.4,.15),new THREE.MeshStandardMaterial({map:openT}),0,1.4,.045,door);

/* lamps */
const lamp=item('lamp');const lampL=[];
[-1.9,.3,2.2].forEach((x,i)=>{mk(cyl(.006,.006,.9,6),M('#222'),x,3.05,-1.2,lamp);mk(new THREE.CylinderGeometry(.05,.26,.22,28,1,true),M('#2f4a3f',{side:THREE.DoubleSide,roughness:.4,metalness:.3}),x,2.5,-1.2,lamp);
 const bulb=mk(sph(.055,14),B('#fff1c4'),x,2.42,-1.2,lamp);bulb.userData.glow=true;
 if(i<2){const L=new THREE.PointLight('#ffd9a0',.55,6,2);L.position.set(x,2.3,-1.2);scene.add(L);lampL.push(L)}});

/* flour sacks */
const flour=item('flour');flour.position.set(3.95,0,-2.4);flour.rotation.y=-.6;
[[0,0,1],[.45,-.4,.85]].forEach(p=>{const s=mk(sph(1,24),M('#e8dcc2',{roughness:1}),p[0],.38*p[2],p[1],flour);s.scale.set(.3*p[2],.4*p[2],.25*p[2]);
 mk(cyl(.07,.13,.13*p[2],16),M('#e0d2b4',{roughness:1}),p[0],.8*p[2],p[1],flour);mk(new THREE.TorusGeometry(.08,.015,8,20),M('#8a5f31'),p[0],.76*p[2],p[1],flour).rotation.x=Math.PI/2});
const flT=tex(256,128,(g,w,h)=>{g.fillStyle='#f6efdf';g.fillRect(0,0,w,h);g.strokeStyle='#c73e5d';g.lineWidth=6;g.strokeRect(8,8,w-16,h-16);g.strokeStyle='#2a1a12';g.fillStyle='#2a1a12';g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(w/2,h*.88);g.lineTo(w/2,h*.2);g.stroke();for(let k=0;k<4;k++){const y=h*.3+k*h*.14;[-1,1].forEach(sg=>{g.beginPath();g.ellipse(w/2+sg*14,y,12,6,sg*.6,0,Math.PI*2);g.fill()})}g.beginPath();g.ellipse(w/2,h*.18,6,11,0,0,Math.PI*2);g.fill()});
mk(new THREE.PlaneGeometry(.3,.15),new THREE.MeshStandardMaterial({map:flT,roughness:1}),0,.42,.252,flour);

/* table, chair, cup */
const table=item('table');
mk(cyl(.45,.45,.04,36),M('#f3efe9',{roughness:.25}),-3.6,.76,1.5,table);mk(cyl(.03,.03,.72,12),M('#2a2522',{metalness:.6,roughness:.4}),-3.6,.38,1.5,table);mk(cyl(.22,.25,.03,24),M('#2a2522',{metalness:.6,roughness:.4}),-3.6,.015,1.5,table);
const chair=item('chair');chair.position.set(-3.5,0,2.35);chair.rotation.y=Math.PI+.25;
mk(cyl(.21,.21,.04,24),wood('#7a4e2c'),0,.47,0,chair);
[[.14,.14],[-.14,.14],[.14,-.14],[-.14,-.14]].forEach(p=>{const l=mk(cyl(.012,.012,.47,8),M('#2a2522',{metalness:.6,roughness:.4}),p[0],.235,p[1],chair);l.rotation.set(p[1]*.4,0,-p[0]*.4)});
const backR=mk(new THREE.TorusGeometry(.18,.014,8,24,Math.PI),M('#2a2522',{metalness:.6,roughness:.4}),0,.72,-.19,chair);
mk(cyl(.012,.012,.26,8),M('#2a2522',{metalness:.6,roughness:.4}),.18,.6,-.19,chair);mk(cyl(.012,.012,.26,8),M('#2a2522',{metalness:.6,roughness:.4}),-.18,.6,-.19,chair);
const cupI=item('cup');
mk(cyl(.075,.075,.008,24),M('#ffffff',{roughness:.2}),-3.45,.785,1.4,cupI);mk(cyl(.042,.034,.07,20),M('#ffffff',{roughness:.2}),-3.45,.825,1.4,cupI);
mk(cyl(.038,.038,.004,20),M('#7a4a22',{roughness:.2}),-3.45,.858,1.4,cupI);const h2=mk(new THREE.TorusGeometry(.02,.006,8,16),M('#ffffff',{roughness:.2}),-3.4,.83,1.4,cupI);

/* lights */
scene.add(new THREE.HemisphereLight('#fff1dc','#6b4a35',.55));
const sun=new THREE.DirectionalLight('#ffe2b8',1.15);sun.position.set(-9,5.5,-.2);sun.target.position.set(0,0,-1);scene.add(sun,sun.target);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-6,right:6,top:5,bottom:-5,near:1,far:20});sun.shadow.bias=-.0005;sun.shadow.normalBias=.02;
const fill=new THREE.DirectionalLight('#ffd7c2',.25);fill.position.set(3,3,6);scene.add(fill);

scene.traverse(o=>{if(o.isMesh&&!o.userData.noShadow&&!o.userData.glow&&o!==back&&o!==lw&&o!==rw&&o!==floor&&o!==ceil){o.castShadow=true;o.receiveShadow=true}});

/* picking */
const ray=new THREE.Raycaster(),ptr=new THREE.Vector2();let hov=null,down=null;const tip=$('hover');
function pick(e){const r=canvas.getBoundingClientRect();ptr.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ptr,cam);
 const hs=ray.intersectObjects(hits,true).filter(h=>!h.object.userData.glass);if(!hs.length)return null;let o=hs[0].object;while(o&&!o.userData.id)o=o.parent;return o}
function hl(g,on){if(!g)return;g.traverse(o=>{if(o.isMesh&&o.material.emissive&&!o.userData.glow){if(on){if(o.userData.e===undefined)o.userData.e=o.material.emissive.getHex();o.material.emissive.setHex(0x3a2410)}else if(o.userData.e!==undefined)o.material.emissive.setHex(o.userData.e)}})}
canvas.addEventListener('pointermove',e=>{const g=e.pointerType==='mouse'?pick(e):null;if(g!==hov){hl(hov,false);hov=g;hl(hov,true)}
 canvas.style.cursor=hov?'pointer':'grab';
 if(hov){const id=hov.userData.id;tip.textContent=H.label(id);tip.style.left=e.clientX+'px';tip.style.top=e.clientY+'px';tip.classList.remove('hidden')}else tip.classList.add('hidden')});
canvas.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]});
canvas.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;down=null;const g=pick(e);if(!g)return;
 const id=g.userData.id;H.pick(id);
 g.scale.setScalar(1.06);setTimeout(()=>g.scale.setScalar(1),140)});
canvas.addEventListener('pointerleave',()=>{hl(hov,false);hov=null;tip.classList.add('hidden')});

addEventListener('resize',()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();R.setSize(innerWidth,innerHeight)});
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clock=new THREE.Clock();const tmp=new THREE.Vector3();
function loop(){requestAnimationFrame(loop);if(H.active&&!H.active())return;const t=clock.getElapsedTime();
 let talking=false;try{talking=speechSynthesis.speaking}catch(e){}
 if(!reduce){baker.position.y=Math.sin(t*(talking?7:1.6))*(talking?.012:.008);bubble.position.y=2.5+Math.sin(t*2.4)*.04;
  ovenL.intensity=1.1+Math.sin(t*9)*.12+Math.sin(t*23)*.08}
 bubble.visible=H.bubble();
 cam.getWorldPosition(tmp);const dx=tmp.x-baker.position.x,dz=tmp.z-baker.position.z;head.rotation.y+=(Math.max(-.6,Math.min(.6,Math.atan2(dx,dz)))-head.rotation.y)*.08;
 ctl.update();R.render(scene,cam)}
loop();
};
