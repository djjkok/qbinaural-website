(()=>{
 'use strict';
 const canvas=document.getElementById('water-field');
 if(!canvas)return;
 const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});
 if(!ctx)return;
 const allowed=window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
 let width=0,height=0,dpr=1,particles=[],frame=0,running=false,last=0,lastTouch=0;
 let wakes=[],lastMove={x:-999,y:-999,t:0},lastPointer={x:-999,y:-999};
 const maxAge=1580;
 const maximum=9200;
 const rseed=n=>{let x=Math.sin(n*127.31+0.77)*43758.5453;return x-Math.floor(x)};
 function size(){
   if(!allowed.matches || document.hidden)return;
   const nextDpr=Math.min(window.devicePixelRatio||1,1.6);
   if(width===window.innerWidth && height===window.innerHeight && dpr===nextDpr)return;
   dpr=nextDpr;
   width=window.innerWidth;height=window.innerHeight;
   canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
   ctx.setTransform(dpr,0,0,dpr,0,0);
   const rough=width<=650?15.5:14.8;
   const scale=Math.max(1,Math.sqrt(width*height/(rough*rough*maximum)));
   const step=rough*scale;
   const cols=Math.ceil(width/step),rows=Math.ceil(height/step);
   particles=[];
   let i=0;
   for(let r=0;r<=rows;r++)for(let c=0;c<=cols;c++){
     const ox=(r%2)*step*.5, jitter=(rseed(i*3)-.5)*3.2;
     const x=c*step+ox+jitter, y=r*step+(rseed(i*3+1)-.5)*3.2;
     const kind=rseed(i*3+2);
     particles.push({x,y,r:.48+kind*.35,kind,phase:kind*6.28});i++;
   }
   draw(0);
 }
 function wakeAt(x,y,power=1){
   const now=performance.now();
   wakes.push({x,y,t:now,power});
   if(wakes.length>21)wakes.splice(0,wakes.length-21);
   run();
 }
 function move(e){
   if(!allowed.matches || e.pointerType==='touch')return;
   const now=performance.now();
   const x=e.clientX,y=e.clientY;
   if(now-lastMove.t<27||Math.hypot(x-lastMove.x,y-lastMove.y)<8)return;
   const distance=Math.hypot(x-lastPointer.x,y-lastPointer.y);
   lastMove={x,y,t:now};lastPointer={x,y};
   wakeAt(x,y,Math.min(1.2,.55+distance/95));
 }
 function pointerDown(e){
   if(!allowed.matches || e.pointerType==='touch')return;
   wakeAt(e.clientX,e.clientY,1.35);
 }
 function draw(time){
   ctx.clearRect(0,0,width,height);
   const now=time||performance.now();
   if(!allowed.matches){wakes=[]}
   else wakes=wakes.filter(w=>now-w.t<maxAge);
   const active=wakes.length>0;
   // Barely-visible dense field at rest. Warm highlights only emerge under input.
   for(const p of particles){
     let px=p.x,py=p.y,light=0;
     if(active){
       for(let i=wakes.length-1;i>=0;i--){
         const w=wakes[i],age=now-w.t;
         const dx=px-w.x,dy=py-w.y;
         if(Math.abs(dx)>175||Math.abs(dy)>175)continue;
         const distance=Math.sqrt(dx*dx+dy*dy)+.1;
         const radius=age*.13; // expanding circular water ripple
         const envelope=Math.exp(-Math.pow((distance-radius)/27,2))*Math.pow(1-age/maxAge,1.2)*w.power;
         const near=Math.exp(-Math.pow(distance/83,2))*Math.max(0,1-age/730)*w.power;
         const displacement=(Math.sin((distance-radius)*.13)*10*envelope)+(near*3.4);
         px+=(dx/distance)*displacement;
         py+=(dy/distance)*displacement;
         light+=envelope*.86+near*.34;
       }
     }
     const baseAlpha=.095+(p.kind*.055);
     const alpha=Math.min(.82,baseAlpha+light*.64);
     const rr=p.r+Math.min(.68,light*.48);
     const red=p.kind>.71?165:112;
     const green=p.kind>.71?135:175;
     const blue=p.kind>.71?246:236;
     ctx.fillStyle=`rgba(${red},${green},${blue},${alpha.toFixed(3)})`;
     ctx.fillRect(px-rr/2,py-rr/2,rr,rr);
   }
   if(active){
     // A restrained transparent liquid lens, not an always-on neon effect.
     let glow=wakes[wakes.length-1];const age=now-glow.t;
     const fade=Math.max(0,1-age/1050);
     const g=ctx.createRadialGradient(glow.x,glow.y,6,glow.x,glow.y,140);
     g.addColorStop(0,`rgba(145,177,241,${(.05*fade).toFixed(3)})`);
     g.addColorStop(1,'rgba(145,177,241,0)');
     ctx.fillStyle=g;ctx.fillRect(glow.x-140,glow.y-140,280,280);
   }
   return active;
 }
 function loop(time){
   if(document.hidden){running=false;frame=0;return}
   const interval=width<650?32:18;
   if(time-last<interval){frame=requestAnimationFrame(loop);return}
   last=time;
   const active=draw(time);
   if(active)frame=requestAnimationFrame(loop);
   else{running=false;frame=0;}
 }
 function run(){if(!running){running=true;frame=requestAnimationFrame(loop)}}
 window.addEventListener('pointermove',move,{passive:true});
 window.addEventListener('pointerdown',pointerDown,{passive:true});
 function reset(){
   cancelAnimationFrame(frame);
   frame=0; running=false; wakes=[]; width=0;
   if(allowed.matches && !document.hidden)size();
   else {canvas.width=0;canvas.height=0;particles=[]}
 }
 window.addEventListener('resize',size,{passive:true});
 allowed.addEventListener('change',reset);
 document.addEventListener('visibilitychange',reset);
 size();
})();
