// A single lazy-loaded, georeferenced image. No map SDK, tiles, or extra WebGL renderer.
export function createMapView({container,onSeek,getTime}) {
 const canvas=document.createElement('canvas');canvas.tabIndex=0;canvas.setAttribute('aria-label','Northmark October 11 orthomosaic. Drag to pan, scroll to zoom, click the recording path to seek the video.');container.append(canvas);
 const ctx=canvas.getContext('2d'),hint=document.createElement('span');hint.className='map-hint';hint.textContent='Drag to pan · scroll to zoom · click the path to seek';container.append(hint);
 const tip=document.createElement('div');tip.className='path-hover';tip.hidden=true;container.append(tip);
 let config,image,detail,contextPromise,detailPromise,loading,loaded=false,area='088',track=[],time=0,visible=false,lineVisible=true,zoom=1,cx=0,cy=0,w=1,h=1,dirty=false,fitted=false;
 const pointers=new Map();let gesture=null;
 const screen=p=>[w/2+(p[1]-cx)*zoom,h/2+(p[2]-cy)*zoom];
 const stamp=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
 function current() {if(!track.length)return null;let i=0;while(i<track.length-2&&track[i+1][0]<time)i++;const a=track[i],b=track[Math.min(i+1,track.length-1)],f=Math.max(0,Math.min(1,(time-a[0])/Math.max(.001,b[0]-a[0])));return [time,a[1]+f*(b[1]-a[1]),a[2]+f*(b[2]-a[2]),i]}
 function draw() {
  if(!visible||dirty)return;dirty=true;requestAnimationFrame(()=>{dirty=false;if(!visible)return;
   ctx.clearRect(0,0,w,h);ctx.fillStyle='#10191e';ctx.fillRect(0,0,w,h);
   if(!image&&!detail){ctx.fillStyle='#bcd0da';ctx.font='14px system-ui';ctx.fillText('Loading October 11 map…',20,35);return}
   if(image){const origin=screen([0,0,0]);ctx.drawImage(image,origin[0],origin[1],config.image_size[0]*zoom,config.image_size[1]*zoom)}
   if(detail&&area==='088'){const [x,y,dx,dy]=config.detail_088.window,origin=screen([0,x,y]);ctx.drawImage(detail,origin[0],origin[1],dx*zoom,dy*zoom)}
   if(lineVisible&&track.length){
    const path=(list,color,width)=>{ctx.beginPath();for(let i=0;i<list.length;i++){const p=screen(list[i]);i?ctx.lineTo(...p):ctx.moveTo(...p)}ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin=ctx.lineCap='round';ctx.stroke()};
    path(track,'#071d29',7);path(track,'#79ceff',3);const p=current();path([...track.slice(0,p[3]+1),p],'#f3fbff',3);
    const q=screen(p);ctx.beginPath();ctx.arc(...q,6,0,Math.PI*2);ctx.fillStyle='#ffc976';ctx.fill();ctx.strokeStyle='#17252c';ctx.lineWidth=2;ctx.stroke();
   }
   const metersPerPixel=config.geotransform[1]/zoom,span=90*metersPerPixel,step=10**Math.floor(Math.log10(span)),meters=Math.max(step,Math.floor(span/step)*step),px=meters/metersPerPixel;
   ctx.fillStyle='#0c151be6';ctx.fillRect(12,h-44,Math.max(px+18,65),31);ctx.strokeStyle='#edf5fa';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(20,h-24);ctx.lineTo(20,h-19);ctx.lineTo(20+px,h-19);ctx.lineTo(20+px,h-24);ctx.stroke();ctx.fillStyle='#edf5fa';ctx.font='11px system-ui';ctx.fillText(meters+' m',20,h-28);
  });
 }
 function resize(){const r=container.getBoundingClientRect();if(!r.width||!r.height)return;w=r.width;h=r.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(!fitted&&config)fit('route');draw()}
 function fit(kind='route'){if(!config)return;if(kind==='site'&&!image){ensureContext().then(()=>{if(visible)fit('site')}).catch(loadError);return;}const rows=kind==='route'&&track.length?track:[[0,0,0],[0,...config.image_size]];const xs=rows.map(p=>p[1]),ys=rows.map(p=>p[2]),xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);cx=(xmin+xmax)/2;cy=(ymin+ymax)/2;zoom=Math.min(w/Math.max(80,xmax-xmin),h/Math.max(80,ymax-ymin))*(kind==='route'?.7:.94);zoom=Math.max(.04,Math.min(zoom,8));fitted=true;tip.hidden=true;draw()}
 function loadError(){hint.textContent='Map could not load. Switch views to retry.'}
 async function readImage(url){const raster=new Image();raster.src=url;await raster.decode();return raster}
 function ensureContext(){return contextPromise??=(async()=>{image=await readImage(config.image);draw();return image})().catch(e=>{contextPromise=null;throw e})}
 function ensureDetail(){return detailPromise??=(async()=>{detail=await readImage(config.detail_088.image);draw();return detail})().catch(e=>{detailPromise=null;throw e})}
 async function load(){loading??=(async()=>{const r=await fetch('./map.json?v=detail-20261021b');if(!r.ok)throw Error('Map configuration unavailable');config=await r.json();return config})().catch(e=>{loading=null;throw e});await loading;try{await (area==='088'&&config.detail_088?ensureDetail():ensureContext());loaded=area==='088'&&config.detail_088?!!detail:!!image;track=config.tracks[area]??[];resize();if(!fitted)fit('route');return config}catch(e){loadError();throw e}}

 function pick(x,y){if(!lineVisible||!track.length)return null;let best=null;for(let i=0;i<track.length-1;i++){const a=screen(track[i]),b=screen(track[i+1]),dx=b[0]-a[0],dy=b[1]-a[1],f=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/Math.max(.0001,dx*dx+dy*dy))),dist=Math.hypot(x-a[0]-dx*f,y-a[1]-dy*f),t=track[i][0]+f*(track[i+1][0]-track[i][0]);if(dist<11&&(!best||dist<best.dist-1||(Math.abs(dist-best.dist)<=1&&Math.abs(t-getTime())<Math.abs(best.time-getTime()))))best={dist,time:t}}return best}
 const local=e=>{const r=canvas.getBoundingClientRect();return [e.clientX-r.x,e.clientY-r.y]};
 canvas.addEventListener('pointerdown',e=>{if(e.button>0)return;const [x,y]=local(e);pointers.set(e.pointerId,[x,y]);canvas.setPointerCapture(e.pointerId);gesture={x,y,cx,cy,moved:false,multi:pointers.size>1};tip.hidden=true});
 canvas.addEventListener('pointermove',e=>{const [x,y]=local(e);if(pointers.has(e.pointerId)&&gesture){const prev=pointers.get(e.pointerId);if(pointers.size>1){gesture.multi=true;const other=[...pointers.entries()].find(([id])=>id!==e.pointerId)?.[1];if(other){const before=Math.hypot(prev[0]-other[0],prev[1]-other[1]);if(before>2)zoomAt(Math.hypot(x-other[0],y-other[1])/before,(x+other[0])/2,(y+other[1])/2)}}else if(!gesture.multi){gesture.moved||=Math.hypot(x-gesture.x,y-gesture.y)>5;cx=gesture.cx-(x-gesture.x)/zoom;cy=gesture.cy-(y-gesture.y)/zoom;draw()}pointers.set(e.pointerId,[x,y]);return}const hit=pick(x,y);canvas.style.cursor=hit?'pointer':'grab';tip.hidden=!hit;if(hit){tip.textContent='Jump to '+stamp(hit.time);tip.style.left=Math.min(x+12,w-105)+'px';tip.style.top=Math.max(4,y-32)+'px'}});
 canvas.addEventListener('pointerup',e=>{const g=gesture;pointers.delete(e.pointerId);if(g&&!g.multi&&!g.moved&&visible){const hit=pick(...local(e));if(hit)onSeek(hit.time)}if(!pointers.size)gesture=null});
 for(const name of ['pointercancel','lostpointercapture'])canvas.addEventListener(name,e=>{pointers.delete(e.pointerId);if(gesture)gesture.multi=true;if(!pointers.size)gesture=null});
 canvas.addEventListener('pointerleave',()=>tip.hidden=true);
 function zoomAt(f,x,y){const old=zoom;zoom=Math.max(.04,Math.min(12,zoom*f));cx+=(x-w/2)*(1/old-1/zoom);cy+=(y-h/2)*(1/old-1/zoom);draw()}
 canvas.addEventListener('wheel',e=>{e.preventDefault();zoomAt(Math.exp(-e.deltaY*.0015),...local(e))},{passive:false});
 canvas.addEventListener('keydown',e=>{if(e.key==='+'||e.key==='='){e.preventDefault();zoomAt(1.3,w/2,h/2)}else if(e.key==='-'){e.preventDefault();zoomAt(1/1.3,w/2,h/2)}else if(e.key==='Home'){e.preventDefault();fit('route')}});
 new ResizeObserver(resize).observe(container);
 return {async show(on){visible=on;container.hidden=!on;if(on){resize();await load();resize();draw()}else{tip.hidden=true;pointers.clear();gesture=null}},setArea(id){area=id;track=config?.tracks[id]??[];fitted=false;loaded=area==='088'&&config?.detail_088?!!detail:!!image;if(visible)load().then(()=>fit('route')).catch(loadError)},setTime(t){time=t;draw()},setVisible(on){lineVisible=on;tip.hidden=true;draw()},fit,debug:()=>({loaded,visible,area,sourceDate:config?.flight_date,detailLoaded:!!detail,contextLoaded:!!image,detailSize:config?.detail_088?.image_size,points:track.length,time,zoom,screen:track.map(p=>[p[0],...screen(p)]),marker:current()?screen(current()):null})};
}
