'use strict';
// Separate video UI: the original game, coupon and cart code remain unchanged.
const shorts={active:false,feed:[],index:0,sessionId:'',timer:null,sessionReady:false,seen:0,earnedToday:0,
  dailyLimit:0,rewardCoins:0,totalWatchSeconds:0,completing:false,startY:0,wheelAt:0,loadVersion:0};
const videoEsc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const videoClock=s=>`${Math.floor(Number(s||0)/60).toString().padStart(2,'0')}:${Math.floor(Number(s||0)%60).toString().padStart(2,'0')}`;
const vApi=(route,data)=>request(route,data);
function videoShell(){
  const existing=document.getElementById('videoOverlay');if(existing)existing.remove();
  const wrap=document.createElement('section');wrap.id='videoOverlay';wrap.className='video-overlay';wrap.setAttribute('aria-label','Shorts videolar');
  wrap.innerHTML=`<div class="video-top"><div class="video-brand"><span class="video-logo">SARIQ<br>BOLA<br>PIZZA</span><div><strong>Sariq Coin</strong><small>Video bo‘limi • Demo</small></div></div><button class="video-close" data-video-action="close" aria-label="Yopish">✕</button></div>
  <div class="video-stream" id="videoStream"></div><div class="video-under"><span>⏱ Umumiy ko‘rish: <b id="videoTotalSeconds">00:00</b></span><span>Bugungi bonus: <b id="videoLimit">0/5</b></span></div>`;
  document.body.append(wrap);document.body.classList.add('video-open');
}
function videoEmpty(msg){
  document.querySelector('#videoStream').innerHTML=`<div class="video-empty"><div class="video-empty-emoji">🎞️</div><h2>Video bo‘limi</h2><p>${videoEsc(msg)}</p><button class="btn" data-video-action="close">O‘yinga qaytish</button></div>`;
}
async function videoEnter(preferredId=null){
  if(shorts.active)return;
  try{
    if(app.pendingTaps)await flushTaps();
    const f=await vApi('/api/videos/feed');
    Object.assign(shorts,{active:true,feed:f.videos,index:Math.max(0,f.videos.findIndex(v=>v.id===preferredId)),earnedToday:f.earnedToday,dailyLimit:f.dailyLimit,rewardCoins:f.rewardCoins,totalWatchSeconds:f.totalWatchSeconds});
    videoShell();videoFooter();
    if(!shorts.feed.length){videoEmpty('Hozircha tasdiqlangan videolar yo‘q. Administrator video yuklab, nashr etgach shu yerda chiqadi.');return;}
    await videoLoad(shorts.index);
  }catch(e){toast(e.message);videoExit();}
}
function videoFooter(){
  const t=document.querySelector('#videoTotalSeconds'),l=document.querySelector('#videoLimit');
  if(t)t.textContent=videoClock(shorts.totalWatchSeconds);
  if(l)l.textContent=`${shorts.earnedToday}/${shorts.dailyLimit}`;
}
function videoClear(){
  clearInterval(shorts.timer);shorts.timer=null;
  const v=document.getElementById('shortVideo');if(v){v.pause();v.removeAttribute('src');v.load();}
  shorts.sessionReady=false;shorts.sessionId='';shorts.seen=0;shorts.completing=false;
}
function videoExit(){
  ++shorts.loadVersion;videoClear();shorts.active=false;shorts.feed=[];
  document.getElementById('videoOverlay')?.remove();document.body.classList.remove('video-open');
  if(app.me){refresh().then(()=>{render();updateTop();}).catch(()=>{});}
}
async function videoLoad(index){
  const version=++shorts.loadVersion;videoClear();if(!shorts.active)return;
  shorts.index=(index+shorts.feed.length)%shorts.feed.length;
  const v=shorts.feed[shorts.index];
  const container=document.getElementById('videoStream');if(!container)return;
  const already=v.rewardedToday||shorts.earnedToday>=shorts.dailyLimit;
  container.innerHTML=`<div class="video-player">
     <video id="shortVideo" playsinline webkit-playsinline preload="metadata" muted src="${videoEsc(sariqApiUrl(v.url))}"></video>
     <div class="video-time"><b id="videoWatched">Ko‘rildi 0/${v.durationSeconds} s</b><div class="video-progress"><div id="videoProgress" style="width:0%"></div></div></div>
     <div class="video-play-pause" id="pauseGlyph" aria-hidden="true">▶</div>
     <button class="video-tap-catcher" data-video-action="play" aria-label="Videoni pauza qilish yoki davom ettirish"></button>
     <div class="video-caption"><span class="video-tag">${videoEsc(v.source==='demo'?'DEMO':'SARIQ COIN')}</span><h2>${videoEsc(v.title)}</h2><p>${videoEsc(v.description)}</p>
      <div class="video-reward">🪙 +${shorts.rewardCoins} Coin ${already?'• Bugungi limit/takror':''}</div>
      <p class="video-hint" id="videoHint">Video vaqtini to‘liq hisoblash uchun uzluksiz ko‘ring. ↑ Keyingi video</p></div>
   </div>`;
  try{
    const s=await vApi(`/api/videos/${v.id}/start`,{});if(!shorts.active||shorts.loadVersion!==version||shorts.feed[shorts.index]?.id!==v.id)return;
    shorts.sessionId=s.sessionId;shorts.sessionReady=true;
    const el=document.getElementById('shortVideo');if(!el)return;
    el.muted=true; // Silent autoplay is supported by Telegram webviews and browsers.
    el.addEventListener('ended',()=>void videoFinish());
    el.addEventListener('pause',()=>{document.getElementById('pauseGlyph')?.classList.add('paused');});
    el.addEventListener('play',()=>{document.getElementById('pauseGlyph')?.classList.remove('paused');});
    el.addEventListener('error',()=>{const h=document.getElementById('videoHint');if(h)h.textContent='Videoni ochishda xatolik. Admin video faylini tekshirsin.';});
    await el.play().catch(()=>{document.getElementById('pauseGlyph')?.classList.add('paused');});
    shorts.timer=setInterval(()=>void videoPing(),2000);
  }catch(e){toast(e.message);}
}
async function videoPing(){
  if(!shorts.active||!shorts.sessionReady||shorts.completing)return;
  const el=document.getElementById('shortVideo');if(!el||document.hidden)return;
  const v=shorts.feed[shorts.index],version=shorts.loadVersion;
  try{
    const r=await vApi(`/api/videos/${v.id}/progress`,{sessionId:shorts.sessionId,currentTime:el.currentTime,playing:!el.paused&&!el.ended,rate:el.playbackRate});
    if(!shorts.active||shorts.loadVersion!==version)return;
    shorts.seen=r.watchedSeconds;shorts.totalWatchSeconds=r.totalWatchSeconds;
    const h=document.getElementById('videoWatched'),p=document.getElementById('videoProgress');
    if(h)h.textContent=`Ko‘rildi ${Math.floor(shorts.seen)}/${v.durationSeconds} s`;
    if(p)p.style.width=`${Math.min(100,Math.max(0,shorts.seen/v.durationSeconds*100))}%`;
    videoFooter();
  }catch(e){console.warn('Video progress:',e.message);}
}
async function videoFinish(){
  if(!shorts.active||!shorts.sessionReady||shorts.completing)return;
  shorts.completing=true;clearInterval(shorts.timer);
  const v=shorts.feed[shorts.index],el=document.getElementById('shortVideo');
  try{
    // The final frame may arrive after the last 2-second heartbeat.
    await vApi(`/api/videos/${v.id}/progress`,{sessionId:shorts.sessionId,currentTime:v.durationSeconds,playing:true,rate:1});
    const r=await vApi(`/api/videos/${v.id}/complete`,{sessionId:shorts.sessionId,currentTime:v.durationSeconds});
    shorts.totalWatchSeconds=r.totalWatchSeconds;
    if(r.earned>0){shorts.earnedToday++;v.rewardedToday=true;app.me.user.coins=r.coins;app.me.user.energy=r.energy;toast(`+${r.earned} Coin va +${r.energyEarned} energiya!`);}
    else toast(r.reason||'Ko‘rish yakunlandi.');
    videoFooter();
    const h=document.getElementById('videoHint');if(h)h.textContent='Video yakunlandi. Yuqoriga surib keyingisiga o‘ting.';
    const progress=document.getElementById('videoProgress');if(progress)progress.style.width='100%';
    const watched=document.getElementById('videoWatched');if(watched)watched.textContent=`Ko‘rildi ${v.durationSeconds}/${v.durationSeconds} s`;
  }catch(e){const h=document.getElementById('videoHint');if(h)h.textContent=e.message+' Videoni boshidan ko‘rish uchun bosing.';toast(e.message);}
  finally{shorts.sessionReady=false;shorts.completing=false;}
}
function videoMove(delta){
  if(!shorts.active||shorts.feed.length<2||shorts.completing)return;
  void videoLoad(shorts.index+delta);
}
document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-video-action]');if(!b||!shorts.active)return;
  const action=b.dataset.videoAction,v=shorts.feed[shorts.index];
  try{
    if(action==='close'){videoExit();return;}
    if(!v)return;
    if(action==='play'){
      const el=document.getElementById('shortVideo');
      if(el.ended || !shorts.sessionReady){await videoLoad(shorts.index);return;}
      if(el.paused)await el.play();else el.pause();return;
    }
  }catch(err){toast(err.message);}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)document.getElementById('shortVideo')?.pause();});
document.addEventListener('touchstart',e=>{if(shorts.active)shorts.startY=e.touches[0]?.clientY||0;},{passive:true});
document.addEventListener('touchend',e=>{
  if(!shorts.active||!shorts.startY)return;
  const end=e.changedTouches[0]?.clientY||0,dy=end-shorts.startY;shorts.startY=0;
  if(Math.abs(dy)>=70)videoMove(dy<0?1:-1);
},{passive:true});
document.addEventListener('wheel',e=>{if(!shorts.active)return;if(Date.now()-shorts.wheelAt<1000)return;shorts.wheelAt=Date.now();if(Math.abs(e.deltaY)>15)videoMove(e.deltaY>0?1:-1);},{passive:true});
document.addEventListener('keydown',e=>{if(!shorts.active)return;if(e.key==='Escape')videoExit();else if(e.key==='ArrowUp')videoMove(1);else if(e.key==='ArrowDown')videoMove(-1);});
