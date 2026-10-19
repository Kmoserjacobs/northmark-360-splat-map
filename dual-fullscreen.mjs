// Both live views stay in place, inside one fullscreen ancestor. No extra
// renderer, video decoder, iframe navigation, or model load is needed to swap.
export function setupDualFullscreen({root,modelPanel,videoPanel,onLayout=()=>{}}) {
 const panels={model:modelPanel,video:videoPanel};
 const buttons={model:document.getElementById('modelFullscreen'),video:document.getElementById('videoFullscreen')};
 const expand='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg>';
 const contract='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8h5V3m13 5h-5V3M8 21v-5H3m13 5v-5h5"/></svg>';
 let primary=null,fallback=false,previousOverflow='',previousFocus=null,requesting=false;
 const nativeElement=()=>document.fullscreenElement||document.webkitFullscreenElement;
 function update() {
  root.classList.toggle('views-expanded',!!primary);
  root.classList.toggle('views-fallback',fallback);
  if(primary)root.dataset.primary=primary;else delete root.dataset.primary;
  for(const kind of ['model','video']) {
   const main=primary===kind,inset=!!primary&&!main,name=kind==='model'?'splat':'360 video';
   panels[kind].classList.toggle('view-primary',main);
   panels[kind].classList.toggle('view-inset',inset);
   buttons[kind].setAttribute('aria-pressed',String(main));
   buttons[kind].setAttribute('aria-label',main?'Exit fullscreen '+name:inset?'Expand '+name:'Fullscreen '+name);
   buttons[kind].title=buttons[kind].getAttribute('aria-label');
   buttons[kind].innerHTML=main?contract:expand;
  }
  onLayout(primary);
 }
 function restore() {
  primary=null;fallback=false;document.body.style.overflow=previousOverflow;update();
  previousFocus?.focus?.({preventScroll:true});previousFocus=null;
 }
 async function exit() {
  if(!primary)return;
  try {
   if(nativeElement()===root) {
    if(document.exitFullscreen)await document.exitFullscreen();
    else document.webkitExitFullscreen?.();
   }
  } finally {if(primary)restore()}
 }
 async function toggle(kind) {
  if(requesting)return;
  if(primary===kind){await exit();return}
  if(primary){primary=kind;update();buttons[kind].focus({preventScroll:true});return}
  previousOverflow=document.body.style.overflow;previousFocus=document.activeElement;
  document.body.style.overflow='hidden';primary=kind;update();requesting=true;
  try {
   if(root.requestFullscreen)await root.requestFullscreen();
   else if(root.webkitRequestFullscreen)root.webkitRequestFullscreen();
   else fallback=true;
  } catch {fallback=true}
  finally {requesting=false;update();if(primary)buttons[kind].focus({preventScroll:true})}
 }
 for(const kind of ['model','video'])buttons[kind].onclick=()=>toggle(kind);
 for(const event of ['fullscreenchange','webkitfullscreenchange'])document.addEventListener(event,()=>{
  if(primary&&!fallback&&!requesting&&nativeElement()!==root)restore();
 });
 root.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&primary&&fallback){e.preventDefault();exit()}
  else if(e.key.toLowerCase()==='f'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)){
   e.preventDefault();toggle(modelPanel.contains(e.target)?'model':'video');
  }
 });
 document.getElementById('videoStage').addEventListener('dblclick',e=>{e.preventDefault();toggle('video')});
 update();
 return {toggle,exit,getState:()=>({primary,fallback,native:nativeElement()===root})};
}
