(() => {
  const canvas = document.getElementById('scene'), status = document.getElementById('status'), button = document.getElementById('cameraButton'), video = document.getElementById('video');
  if (!window.THREE) { status.textContent = '星球加载失败，请检查网络后刷新页面。'; return; }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 200);
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  const planet = new THREE.Group(); scene.add(planet);
  const glowCanvas = document.createElement('canvas'); glowCanvas.width = glowCanvas.height = 64;
  const ctx = glowCanvas.getContext('2d'), g = ctx.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(.16,'rgba(255,255,255,.95)'); g.addColorStop(.45,'rgba(255,255,255,.3)'); g.addColorStop(1,'rgba(255,255,255,0)'); ctx.fillStyle=g;ctx.fillRect(0,0,64,64);
  const texture = new THREE.CanvasTexture(glowCanvas);
  function points(positions, colors, size, opacity=1) { const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));return new THREE.Points(geo,new THREE.PointsMaterial({size,map:texture,vertexColors:true,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true})); }
  // Dense, layered shell: cool oceans, violet clouds, and warm luminous highlights.
  const color=new THREE.Color(), surfaceCount=innerWidth<800?14000:24000;
  const surface=[{p:[],c:[]},{p:[],c:[]}];
  for(let i=0;i<surfaceCount;i++){
    const y=1-Math.random()*2, a=Math.random()*Math.PI*2, radial=Math.sqrt(1-y*y);
    const x=Math.cos(a)*radial,z=Math.sin(a)*radial;
    const r=1.45+(Math.random()-.5)*.085;
    const cloud=Math.sin(y*9+x*5+Math.sin(z*6))*Math.cos(z*5-y*4);
    const hue=cloud>.35 ? .79+Math.random()*.09 : cloud<-.4 ? .49+Math.random()*.055 : .58+Math.random()*.13;
    color.setHSL(hue,.82,.47+Math.random()*.24);
    const group=surface[Math.random()<.14?1:0];group.p.push(x*r,y*r,z*r);group.c.push(color.r,color.g,color.b);
  }
  planet.add(points(surface[0].p,surface[0].c,.052,.92));
  planet.add(points(surface[1].p,surface[1].c,.105,.9));
  const core=new THREE.Mesh(new THREE.SphereGeometry(1.4,48,32),new THREE.MeshBasicMaterial({color:0x090c22}));planet.add(core);
  const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(1.57,48,32),new THREE.ShaderMaterial({
    uniforms:{},vertexShader:'varying vec3 vNormal; varying vec3 vView; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); vNormal=normalize(normalMatrix*normal); vView=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }',
    fragmentShader:'varying vec3 vNormal; varying vec3 vView; void main(){ float rim=pow(1.0-abs(dot(normalize(vNormal),normalize(vView))),3.0); gl_FragColor=vec4(0.20,0.55,1.0,rim*0.3); }',
    transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.FrontSide
  }));planet.add(atmosphere);
  const rings=[];
  for(let layer=0;layer<2;layer++){
    const p=[],c=[],count=innerWidth<800?3000:4800;
    for(let i=0;i<count;i++){
      const a=Math.random()*Math.PI*2, radius=(layer===0?1.88:2.42)+Math.random()*(layer===0?.38:.34), h=(Math.random()-.5)*.045;
      p.push(Math.cos(a)*radius,h,Math.sin(a)*radius);let v=.55+Math.random()*.45;c.push(v*.92,v*.96,v);
    }
    const ring=points(p,c,layer===0?.055:.047,.9);ring.rotation.x=1.08;ring.rotation.z=layer===0?-.24:.19;planet.add(ring);rings.push(ring);
  }
  const stars=[],starColors=[];for(let i=0;i<900;i++){let a=Math.random()*Math.PI*2, y=Math.random()*2-1,r=25+Math.random()*35,s=Math.sqrt(1-y*y);stars.push(Math.cos(a)*s*r,y*r,Math.sin(a)*s*r);let v=.25+Math.random()*.65;starColors.push(v,v,v);}scene.add(points(stars,starColors,.11,.8));
  let yaw=.12,targetYaw=.12,pitch=.12,distance=8.5,targetDistance=8.5, dragging=false,lastX=0,lastY=0, lastHand=null, mode='';
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.setViewOffset(w,h,w<800?0:-w*.19,w<800?-h*.14:0,w,h);camera.updateProjectionMatrix();}window.addEventListener('resize',resize);resize();
  canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(!dragging)return;targetYaw-=(e.clientX-lastX)*.008;pitch=clamp(pitch+(e.clientY-lastY)*.005,-1.2,1.2);lastX=e.clientX;lastY=e.clientY});canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointercancel',()=>dragging=false);canvas.addEventListener('wheel',e=>{e.preventDefault();targetDistance=clamp(targetDistance+e.deltaY*.005,3.8,17)},{passive:false});
  function setStatus(message,active=false){status.classList.toggle('active',active);status.innerHTML='<span></span> '+message;}
  function handResults(results){
    const lm=results.multiHandLandmarks?.[0];
    if(!lm){lastHand=null;mode='';setStatus('请将一只手放入画面',true);return;}
    const dist=(a,b)=>Math.hypot(lm[a].x-lm[b].x,lm[a].y-lm[b].y);
    const palm=dist(0,9);
    const extended=[8,12,16,20].filter((tip,i)=>dist(tip,0)>dist([6,10,14,18][i],0)*1.12).length;
    const thumb=dist(4,17)>dist(3,17)*1.08;
    const current=extended>=4&&thumb?'open':extended<=1?'fist':'rotate';
    // Average the bases of three fingers to reduce landmark jitter. Rotation works
    // across pose changes, so moving between open hand and fist does not lose input.
    const mx=(lm[5].x+lm[9].x+lm[17].x)/3, my=(lm[5].y+lm[9].y+lm[17].y)/3;
    const angle=Math.atan2(mx-lm[0].x, -(my-lm[0].y));
    if(lastHand){
      let delta=angle-lastHand.angle;
      while(delta>Math.PI)delta-=Math.PI*2;
      while(delta< -Math.PI)delta+=Math.PI*2;
      if(Math.abs(delta)<.8) targetYaw+=delta*2.4;
      const change=(palm-lastHand.palm)/Math.max(lastHand.palm,.02);
      if(mode===current && current==='fist'&&change<-.002)targetDistance=clamp(targetDistance+Math.min(.45,Math.pow(-change*10,1.6)*.18),3.8,17);
      if(mode===current && current==='open'&&change>.002)targetDistance=clamp(targetDistance-Math.min(.5,Math.sqrt(change*10)*.25),3.8,17);
    }
    lastHand={angle,palm};mode=current;
    setStatus(current==='fist'?'已识别握拳 · 向后移动以远离':current==='open'?'已识别张开手掌 · 向前移动以靠近':'手势追踪中 · 旋转手掌来转动星球',true);
  }
  let stream=null, running=false;
  button.addEventListener('click',async()=>{if(running){running=false;stream?.getTracks().forEach(t=>t.stop());video.srcObject=null;document.querySelector('.camera-preview').classList.remove('visible');button.querySelector('span:nth-child(2)').textContent='开启手势控制';setStatus('摄像头未开启 · 也可以拖动探索');lastHand=null;return;}if(!window.Hands){setStatus('手势模型加载失败，请检查网络后刷新');return;}button.disabled=true;setStatus('正在启动摄像头与手势模型…');try{stream=await navigator.mediaDevices.getUserMedia({video:{width:640,height:480,facingMode:'user'},audio:false});video.srcObject=stream;await video.play();const hands=new Hands({locateFile:file=>'https://cdn.jsdelivr.net/npm/@mediapipe/hands/'+file});hands.setOptions({maxNumHands:1,modelComplexity:1,minDetectionConfidence:.7,minTrackingConfidence:.6});hands.onResults(handResults);running=true;document.querySelector('.camera-preview').classList.add('visible');button.querySelector('span:nth-child(2)').textContent='关闭手势控制';setStatus('请将一只手放入画面',true);const tick=async()=>{if(!running)return;try{await hands.send({image:video});requestAnimationFrame(tick)}catch(error){running=false;stream?.getTracks().forEach(t=>t.stop());document.querySelector('.camera-preview').classList.remove('visible');button.querySelector('span:nth-child(2)').textContent='开启手势控制';setStatus('手势识别中断，请重试');}};tick();}catch(error){stream?.getTracks().forEach(t=>t.stop());setStatus('无法开启摄像头，请检查权限或使用鼠标操作');}finally{button.disabled=false;}});
  function animate(){requestAnimationFrame(animate);yaw+=(targetYaw-yaw)*.25;distance+=(targetDistance-distance)*.08;camera.position.set(distance*Math.sin(yaw)*Math.cos(pitch),distance*Math.sin(pitch),distance*Math.cos(yaw)*Math.cos(pitch));camera.lookAt(0,0,0);planet.rotation.y+=.0006;const t=performance.now()*.001;atmosphere.material.opacity=1;rings[0].rotation.y=t*.012;rings[1].rotation.y=-t*.008;renderer.render(scene,camera);}animate();
})();
