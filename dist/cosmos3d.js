import * as THREE from './vendor/three.module.js';
const host=document.querySelector('.world');
let renderer;
try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});}catch(error){console.warn('WebGL unavailable; keeping the flat star map.',error);}
if(renderer) init();
function init(){
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(43,1,.1,100),universe=new THREE.Group();scene.add(universe);
 const viewport=document.createElement('div');viewport.className='cosmos3d';viewport.setAttribute('aria-label','二维灵体周围的三维浑天星环，可拖拽旋转');renderer.domElement.setAttribute('aria-hidden','true');viewport.append(renderer.domElement);host.prepend(viewport);
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x000000,0);host.classList.add('has-3d');
 const satelliteGroup=new THREE.Group();universe.add(satelliteGroup);let satellites=[],rings=[],yaw=0,pitch=.10,distance=12,zoom3d=1,orbitTime=0,orbitMotion=true,hovered=false,last=0,dragged=false,pointerDown=new Map();
 const ringDefs=[
  {kind:'stem',radius:2.15,orientation:new THREE.Euler(.95,.25,.20),speed:1,color:0xa9c29c},
  {kind:'hidden',radius:3.20,orientation:new THREE.Euler(-.65,.85,-.55),speed:-.72,color:0x75998c},
  {kind:'omen',radius:4.25,orientation:new THREE.Euler(.45,-.85,.65),speed:.5,color:0xa591c0}
 ];
 function coords(def,angle){return new THREE.Vector3(Math.cos(angle)*def.radius,Math.sin(angle)*def.radius,0).applyEuler(def.orientation);}
 function rebuild(){
  for(const r of rings){satelliteGroup.remove(r);r.geometry.dispose();r.material.dispose();}rings=[];
  document.querySelectorAll('.symbol-orbit').forEach(n=>n.remove());satellites=[];
  ringDefs.forEach(def=>{
   const visible=def.kind==='omen'?mode!=='gods':mode!=='omens';if(!visible)return;
   const entries=def.kind==='stem'?stemEntries:def.kind==='hidden'?hiddenEntries:omenEntries;
   const elements=[...document.querySelectorAll('.symbol.'+def.kind)];
   // Two noncoplanar omen tracks, balanced without merging or dropping any instance.
   const lanes=def.kind==='omen'?2:1;
   for(let lane=0;lane<lanes;lane++){
    const laneDef=def.kind==='omen'?{...def,radius:lane===0?4.25:4.60,orientation:lane===0?def.orientation:new THREE.Euler(-.85,-.30,-.45),speed:lane===0?.50:-.43,color:lane===0?def.color:0xb49dcb}:{...def};const pts=[];
    for(let i=0;i<=160;i++)pts.push(coords(laneDef,i/160*Math.PI*2));
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:laneDef.color,transparent:true,opacity:def.kind==='stem'?.24:.14}));satelliteGroup.add(line);rings.push(line);
    const laneEntries=entries.map((entry,index)=>({entry,index})).filter((_,index)=>index%lanes===lane);
    laneEntries.forEach(({entry,index},i)=>{const element=elements[index];if(element)satellites.push({element,def:laneDef,angle:i/laneEntries.length*Math.PI*2-Math.PI/2+lane*.19+(def.kind==='hidden'?.15:0)});});
   }

  });
 }
 // Keep the existing birthday, filter and click flows, adding depth after every render.
 const flatRender=renderSymbols;renderSymbols=function(){flatRender();rebuild()};rebuild();
 function reset(){yaw=0;pitch=.10;zoom3d=1;orbitTime=0;orbitMotion=true}
 const resetSolar=$('reset').onclick;$('reset').onclick=()=>{resetSolar();reset()};
 const oldPointerUp=host.onpointerup;
 host.onpointerdown=e=>{if(e.target.closest('button'))return;pointerDown.set(e.pointerId,{x:e.clientX,y:e.clientY});dragged=false;host.setPointerCapture(e.pointerId);host.classList.add('dragging')};
 host.onpointermove=e=>{
  const prev=pointerDown.get(e.pointerId);if(!prev)return;
  if(pointerDown.size===1){yaw+=(e.clientX-prev.x)*.007;pitch=Math.max(-1.05,Math.min(1.05,pitch+(e.clientY-prev.y)*.006));}
  else{const other=[...pointerDown.entries()].find(([id])=>id!==e.pointerId)?.[1];if(other){const before=Math.hypot(prev.x-other.x,prev.y-other.y),after=Math.hypot(e.clientX-other.x,e.clientY-other.y);if(before>0)zoom3d=Math.max(.65,Math.min(1.35,zoom3d*after/before));}}
  if(Math.abs(e.clientX-prev.x)+Math.abs(e.clientY-prev.y)>2)dragged=true;pointerDown.set(e.pointerId,{x:e.clientX,y:e.clientY});
 };
 host.onpointerup=e=>{pointerDown.delete(e.pointerId);host.classList.remove('dragging');if(!dragged&&!e.target.closest('button'))oldPointerUp?.(e)};
 host.onpointercancel=e=>{pointerDown.delete(e.pointerId);host.classList.remove('dragging')};
 host.onwheel=e=>{e.preventDefault();zoom3d=Math.max(.65,Math.min(1.35,zoom3d-e.deltaY*.001))};
 host.addEventListener('keydown',e=>{if(e.target!==viewport)return;const moves={ArrowLeft:[-.1,0],ArrowRight:[.1,0],ArrowUp:[0,-.1],ArrowDown:[0,.1]};if(moves[e.key]){e.preventDefault();yaw+=moves[e.key][0];pitch=Math.max(-1.05,Math.min(1.05,pitch+moves[e.key][1]));}if(e.key==='Home')reset()});viewport.tabIndex=0;viewport.setAttribute('role','application');viewport.setAttribute('aria-label','浑天星环：自动环绕，拖拽或方向键旋转星环，人形固定，滚轮或双指缩放，Home 恢复正面');
 function resizeScene(){const width=host.clientWidth,height=570;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();distance=5.5/(Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*Math.min(1,camera.aspect));}
 new ResizeObserver(resizeScene).observe(host);resizeScene();
 function frame(t){const dt=Math.min((t-last)/1000,.05);last=t;if(orbitMotion&&!hovered)orbitTime+=dt*.12;
  camera.position.set(Math.sin(yaw)*Math.cos(pitch)*distance/zoom3d,Math.sin(pitch)*distance/zoom3d,Math.cos(yaw)*Math.cos(pitch)*distance/zoom3d);camera.lookAt(0,0,0);camera.updateMatrixWorld();universe.updateMatrixWorld();
  satellites.forEach(s=>{const local=coords(s.def,s.angle+orbitTime*s.def.speed);const worldPosition=local.applyMatrix4(universe.matrixWorld);const view=worldPosition.clone().applyMatrix4(camera.matrixWorldInverse);const p=worldPosition.clone().project(camera);const depthScale=Math.max(.68,Math.min(1.25,distance/(-view.z)*zoom3d));s.element.style.left=(p.x*.5+.5)*host.clientWidth+'px';s.element.style.top=(-p.y*.5+.5)*570+'px';s.element.style.transform=`scale(${depthScale})`;s.element.style.zIndex=view.z>-distance/zoom3d?20:4;s.element.style.opacity=view.z>-distance/zoom3d?'1':'.55';s.element.style.visibility=p.z>1||p.z< -1?'hidden':'visible';});
  renderer.render(scene,camera);requestAnimationFrame(frame);
 }
 host.addEventListener('pointerover',e=>{if(e.target.closest('.symbol'))hovered=true});
 host.addEventListener('pointerout',e=>{if(e.target.closest('.symbol')&&!e.relatedTarget?.closest?.('.symbol'))hovered=false});
 host.addEventListener('focusin',e=>{if(e.target.closest('.symbol'))hovered=true});
 host.addEventListener('focusout',e=>{if(e.target.closest('.symbol'))hovered=false});
 requestAnimationFrame(frame);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();host.classList.remove('has-3d');renderSymbols=flatRender;flatRender()});
}
