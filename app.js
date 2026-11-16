'use strict';
const $=s=>document.querySelector(s);
const htmlEscape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>Number(n||0).toLocaleString('en-US')+' so‘m';
const num=n=>Number(n||0).toLocaleString('en-US');
const boostLeft=until=>{const s=Math.max(0,Math.ceil((until-Date.now())/1000));return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;};
const app={config:null,me:null,tab:'game',category:'Barchasi',query:'',cart:{},couponCode:'',fulfillment:'delivery',orderNote:'',quote:null,quoteBusy:false,quoteError:'',quoteSerial:0,profileView:'overview',busy:false,pendingTaps:0,tapTimer:null};
const toast=msg=>{const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),3500);};
async function request(path,payload){
  const response=await fetch(sariqApiUrl(path),{method:payload===undefined?'GET':'POST',headers:{'Content-Type':'application/json','X-Sariq-Client':'1'},credentials:'include',body:payload===undefined?undefined:JSON.stringify(payload)});
  let data={};try{data=await response.json();}catch{}
  if(!response.ok)throw Error(data.error||`Server xatosi (${response.status})`);
  return data;
}
async function refresh(){app.me=await request('/api/me');return app.me;}
const icon=(key)=>{
  const paths={
    game:'<rect x="3" y="8" width="18" height="12" rx="5"/><path d="M8 12v5m-2.5-2.5h5M16 13h.01M18 16h.01M8 8 6.5 5.5M16 8l1.5-2.5"/>',
    pizza:'<path d="M3 3c7-1 13 2 18 9L9 21 3 3Z"/><path d="M3 3c8-1 14 3 18 9"/><circle cx="10" cy="11" r="1"/><circle cx="15" cy="13" r="1"/>',
    gift:'<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M12 9v12M3 13h18M12 9c-9 0-8-7-4-7 3 0 4 5 4 7Zm0 0c9 0 8-7 4-7-3 0-4 5-4 7Z"/>',
    user:'<circle cx="12" cy="7" r="4"/><path d="M4 22v-2a8 8 0 0 1 16 0v2Z"/>',
    info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7h.01"/>',
    cart:'<circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M2 3h3l2.5 12h11l3-9H6"/>',
    arrow:'<path d="m9 18 6-6-6-6"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.2 2.2m9.8 9.8 2.2 2.2m0-14.2-2.2 2.2m-9.8 9.8-2.2 2.2"/>',
    bag:'<path d="M4 8h16l1 14H3L4 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>',
    users:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2ZM17 5a3 3 0 0 1 0 6M17 14c2.5.2 4 2 4 5v1"/>',
    ticket:'<path d="M3 7h18v4a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4V7Z"/><path d="M12 7v11" stroke-dasharray="2 2"/>',
    help:'<circle cx="12" cy="12" r="10"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1.6 1-1.5 2-1.5 3M12 17h.01"/>',
    check:'<path d="m4 12 5 5L20 6"/>',
  };
  return `<svg class="ui-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[key]||paths.pizza}</svg>`;
};
const coinIcon=()=>'<span class="coin-medal" aria-hidden="true">♛</span>';
function summary(){const u=app.me.user,r=app.me.rules;
  return `<div class="summary"><div class="summary-balance">${coinIcon()}<strong data-coins>${num(u.coins)}</strong><b>Coin</b></div>
  <div class="energy-card"><div class="energy-title"><span class="energy-zap">⚡</span><strong>Energiya <span data-energy>${u.energy}</span><span class="energy-total">/${r.energyMax}</span></strong></div><div class="progress"><div data-energy-bar style="width:${Math.min(100,u.energy/r.energyMax*100)}%"></div></div></div></div>`;
}
function shell(content){
  const tabs=[['game','game','O‘yin'],['products','pizza','Mahsulotlar'],['cart','cart','Savatcha'],['rewards','gift','Mukofotlar'],['profile','user','Profil']];
  return `<div class="content"><header class="top"><div class="brand"><div class="brandmark" aria-label="Sariq Coin demo">SARIQ<br>BOLA<br>PIZZA</div><div class="brand-title"><h1>Sariq Coin</h1><p>Telegram Mini App <span class="demo-badge">DEMO</span></p></div></div><button class="iconbtn" data-action="info" aria-label="Ilova haqida ma'lumot">${icon('info')}</button></header>${summary()}${content}</div><nav class="nav" aria-label="Ilova bo‘limlari">${tabs.map(([id,ico,title])=>`<button data-action="tab" data-tab="${id}" class="${app.tab===id?'active':''}" aria-label="${title}" ${app.tab===id?'aria-current="page"':''}>${icon(ico)}${id==='cart'&&cartCount()?`<em class="nav-count">${cartCount()}</em>`:''}<span>${title}</span></button>`).join('')}</nav>`;
}
function game(){const u=app.me.user,r=app.me.rules;
  const p=app.config.products.find(x=>x.id===u.selectedProduct)||app.config.products[0];
  const boosted=u.boosterUntil>Date.now();
  return `<section class="tap-stage"><div class="tap-glow"></div><div class="float-coin float-a">${coinIcon()}</div><div class="float-coin float-b">${coinIcon()}</div>
    <div class="tap-stats"><span>👆 Bugun <b data-daily>${u.dailyTaps}</b>/${r.dailyTapLimit}</span><span>🏆 Jami <b data-total>${num(u.totalTaps||0)}</b></span></div>
    <button class="tap-target" data-action="tap" aria-label="Butun pitsani bosib Sariq Coin yig‘ing"><img src="/assets/pizza-main.png" alt="Butun aylana pitsa" draggable="false"></button>
    <div class="tap-hint">Bosib Coin yig‘ing</div>
    <p class="tap-sub">${htmlEscape(p.name)} tanlangan · <b data-tap-multiplier>${boosted?'🚀 x2: har bosishda +2 Coin':'Har bosishda +1 Coin'}</b></p>
    <div class="tap-limit">⚡ Har ${r.regenSeconds} soniyada +1 energiya</div></section>
    <section class="quick-actions">
      <button class="quick" data-action="boost" ${!app.me.canBoost?'disabled':''}><span class="quick-emoji">✖️2️⃣</span><strong>${boosted?'x2 FAOL':'x2 Boost'}</strong><small data-boost-remaining>${boosted?'Qoldi '+boostLeft(u.boosterUntil):app.me.canBoost?'30 daqiqa':'Bugun ishlatilgan'}</small></button>
      <button class="quick" data-action="video"><span class="quick-emoji">🎞️</span><strong>Video</strong><small>Coin yig‘ish</small></button>
      <button class="quick" data-action="daily" ${!app.me.canClaimDaily?'disabled':''}><span class="quick-emoji">🎁</span><strong>Kunlik bonus</strong><small>+50 Coin</small></button>
      <button class="quick" data-action="invite"><span class="quick-emoji">👥</span><strong>Do‘st taklif</strong><small>Bonusli taklif</small></button>
    </section>
    <button class="promo-banner" data-action="tab" data-tab="rewards"><span class="promo-symbol">${icon('ticket')}</span><span><strong>2 000 Coin = 5% chegirma</strong><small>Demo mukofotlar do‘koniga o‘tish</small></span>${icon('arrow')}</button>
    <div class="disclaimer">Sinov rejimi: Coinlar haqiqiy pul emas. Restoran chegirmalari va buyurtmalari ulanmagan.</div>`;
}
const productImages={pepperoni:'pepperoni.png',margarita:'margarita.png',chicken:'chicken.png',lavash:'lavash.png',fri:'fri.png',cola:'cola.png'};
function products(){const categories=['Barchasi','Pitsa','Burger','Lavash','Gazaklar','Ichimlik'];
  const filtered=app.config.products.filter(p=>(app.category==='Barchasi'||p.category===app.category)&&p.name.toLowerCase().includes(app.query.toLowerCase()));
  return `<section class="page-intro"><h2>Mahsulotlar <span class="sunrays">✳</span></h2><p>O‘yin uchun tanlang yoki savatchaga qo‘shing. Har bir buyurtma qilingan dona uchun +1 demo Coin.</p></section>
  <label class="search-wrap">${icon('search')}<input id="search" autocomplete="off" placeholder="Mahsulot qidirish..." value="${htmlEscape(app.query)}"/></label>
  <div class="category-tabs">${categories.map(c=>`<button data-action="category" data-category="${htmlEscape(c)}" class="${c===app.category?'active':''}">${htmlEscape(c)}</button>`).join('')}</div>
  <div class="products-grid">${filtered.map(p=>`<article class="product-card ${app.me.user.selectedProduct===p.id?'chosen':''}"><div class="product-photo"><img src="/assets/${productImages[p.id]||'pepperoni.png'}" alt="${htmlEscape(p.name)}" loading="lazy"></div><div class="product-info"><span class="product-cat">${htmlEscape(p.category)}</span><h3>${htmlEscape(p.name)}</h3><div class="product-price">${money(p.price)}</div><div class="product-coin" title="Buyurtma qilingan har bir dona mahsulot uchun +1 Coin">${coinIcon()} +1 Coin</div></div><button class="product-select" data-action="choose" data-id="${p.id}">${app.me.user.selectedProduct===p.id?`${icon('check')} Tanlangan`:`${icon('game')} O‘yinda tanlash`}</button><button class="product-cart" data-action="addcart" data-id="${p.id}">${icon('cart')} Savatchaga qo‘shish</button></article>`).join('')||'<p>Mahsulot topilmadi.</p>'}</div>
  <div class="products-bottom-hint">Mahsulot qo‘shdingizmi? Pastki <b>🛒 Savatcha</b> bo‘limiga o‘ting.</div>`;
}
function rewards(){const claims=app.me.coupons;
  return `<section class="page-intro"><h2>Mukofotlar <span class="sunrays">✳</span></h2><p>Coinlaringiz evaziga demo kuponlarni oling. Har bir xarid qilingan kupon kodi faqat bir marta ishlatiladi.</p></section>
  <div class="reward-list">${app.config.rewards.map((r,i)=>`<article class="reward-card"><div class="reward-art ${i%2?'cool':''}"><span>${r.emoji}</span></div><div class="reward-details"><h3>${htmlEscape(r.name)}</h3><p>${htmlEscape(r.description)}</p><div class="reward-price">${coinIcon()} ${num(r.cost)} Coin</div></div><button class="reward-get" data-action="redeem" data-id="${r.id}" ${app.me.user.coins<r.cost?'disabled':''}>${app.me.user.coins>=r.cost?'Olish':'Coin yetarli emas'}</button></article>`).join('')}</div>
  <h2 class="section-subtitle">Mening kuponlarim <span class="sunrays">✳</span></h2>
  <div class="coupon-grid">${claims.length?claims.map(c=>`<article class="coupon-ticket"><div class="coupon-top"><span class="coupon-art">${icon('ticket')}</span><span class="coupon-status">${htmlEscape(statusLabel(c.status))}</span></div><h3>${htmlEscape(c.name)}</h3><code>${htmlEscape(c.code)}</code><p>${new Date(c.expiresAt).toLocaleDateString('uz-UZ')} gacha · ${c.status==='used'?'✅ Bir marta ishlatilgan':c.status==='reserved'?'🔒 Buyurtmaga biriktirilgan':'🎟 Bir martalik kupon'}</p></article>`).join(''):'<div class="empty-state">🎟️ Hozircha kupon yo‘q. Mukofot tanlang va Coin evaziga oling.</div>'}</div>
  <div class="disclaimer">Kuponlar faqat demo. Sariq Bola Pizza tomonidan hali tasdiqlanmagan.</div>`;
}
function statusLabel(s){return ({active:'Faol',reserved:'Buyurtmada',used:'Ishlatilgan',placed:'Yuborilgan',completed:'Yakunlangan',cancelled:'Bekor qilingan',expired:'Muddati tugagan'})[s]||s;}
function profile(){const u=app.me.user;
  if(app.profileView==='orders')return `<section class="page-intro"><h2>Buyurtmalar tarixi</h2></section><button class="backlink" data-action="profileHome">← Profilga qaytish</button><section class="card block">${app.me.orders.length?app.me.orders.map(o=>`<div class="orderitem"><div class="space"><b>${htmlEscape(o.id)}</b><span class="status">${statusLabel(o.status)}</span></div><div class="space"><span class="micro">${new Date(o.createdAt).toLocaleString('uz-UZ')}</span><b>${money(o.total)}</b></div><div class="micro">${(o.purchaseCoinReward||0)?`Buyurtma bonusi: +${o.purchaseCoinReward} Coin${o.purchaseRewardGranted?' (balansga qo‘shilgan)':o.status==='cancelled'?' (bekor qilingan)':' (tasdiq kutilmoqda)'}`:'Buyurtma bonusi: —'}</div></div>`).join(''):'<p>Hali demo buyurtma yo‘q.</p>'}</section>`;
  if(app.profileView==='settings')return `<section class="page-intro"><h2>Sozlamalar</h2></section><button class="backlink" data-action="profileHome">← Profilga qaytish</button><section class="settings-card"><h3>Sinov sozlamalari</h3><p>Ilova Telegram oynasiga moslashadi. Hisobingizdagi Coin va kuponlar serverda saqlanadi.</p><label class="toggle-row">Animatsiyalar <input type="checkbox" id="motionToggle" ${app.motionEffects!==false?'checked':''}></label><div class="disclaimer">Bu sozlama faqat shu brauzerda qo‘llanadi.</div></section>`;
  if(app.profileView==='coupons'){app.tab='rewards';app.profileView='overview';return rewards();}
  return `<section class="page-intro"><h2>Profilim <span class="sunrays">✳</span></h2></section>
  <section class="profile-hero"><div class="profile-avatar">${icon('user')}</div><div class="profile-id"><h3>${htmlEscape(u.name)}</h3><p>@${htmlEscape(u.username||'telegram_user')} · ID: ${htmlEscape(u.id)}</p><span class="profile-rank">♛ Sariq Coin ishtirokchisi</span></div>${icon('arrow')}</section>
  <section class="profile-stats"><div class="profile-stat"><span>👆</span><div><small>Jami bosishlar</small><b data-total>${num(u.totalTaps||0)}</b></div></div><div class="profile-stat"><span>${coinIcon()}</span><div><small>Yig‘ilgan Coin</small><b data-coins>${num(u.coins)}</b></div></div><div class="profile-stat"><span>👥</span><div><small>Do‘stlar taklifi</small><b>${num(u.referralCount||0)}</b></div></div><div class="profile-stat"><span>🎟️</span><div><small>Kuponlar</small><b>${app.me.coupons.length}</b></div></div><div class="profile-stat"><span>🎞️</span><div><small>Video ko‘rish vaqti</small><b>${Math.floor((u.totalVideoSeconds||0)/60)} daqiqa</b></div></div><div class="profile-stat"><span>🪙</span><div><small>Videodan yig‘ilgan</small><b>${num(u.videoCoinsEarned||0)} Coin</b></div></div></section>
  <section class="profile-menu">${[['profileOrders','bag','Buyurtmalar tarixi'],['profileCoupons','ticket','Mening kuponlarim'],['invite','users','Do‘st taklif qilish'],['video','ticket','Video ko‘rish'],['profileSettings','settings','Sozlamalar'],['info','help','Yordam']].map(([action,ico,title])=>`<button data-action="${action}"><span class="menu-icon">${icon(ico)}</span><strong>${title}</strong>${icon('arrow')}</button>`).join('')}</section>
  <section class="invite-banner"><div class="gift-symbol">🎁</div><div><small>Taklif havolam</small><strong>${htmlEscape((app.me.referralLink||'Demo: havola yo‘q').replace('https://t.me/','t.me/'))}</strong></div><button data-action="invite">Ulashish</button></section>
  <div class="profile-footer">${app.me.isAdmin?'<button class="btn" data-action="admin">🛡 Admin panel</button>':''}<button class="btn secondary" data-action="logout">Chiqish</button></div>`;
}
function cartCount(){return Object.values(app.cart).reduce((s,n)=>s+n,0)}
function quoteItems(){return Object.entries(app.cart).filter(([,q])=>q>0).map(([productId,qty])=>({productId,qty}));}
function cart(){const entries=Object.entries(app.cart).filter(([,q])=>q>0).map(([id,qty])=>({product:app.config.products.find(p=>p.id===id),qty})).filter(x=>x.product);
  const subtotal=entries.reduce((sum,x)=>sum+x.qty*x.product.price,0);
  const coupons=app.me.coupons.filter(c=>c.status==='active'&&c.expiresAt>Date.now());
  if(app.couponCode&&!coupons.some(c=>c.code===app.couponCode))app.couponCode='';
  return `<section class="page-intro"><h2>🛒 Savatcha <span class="sunrays">✳</span></h2><p>Tanlangan mahsulotlar va kuponingiz bo‘yicha hisob.</p></section>
  <p class="sub">Bu faqat demo. Haqiqiy pul yechilmaydi va restoran buyurtma olmaydi.</p>
  <div class="card block">${entries.length?entries.map(({product:p,qty})=>`<div class="row cartitem"><div><b>${p.emoji} ${htmlEscape(p.name)}</b><div class="micro">${money(p.price)} × ${qty}</div></div><div class="qty"><button data-action="qty" data-id="${p.id}" data-step="-1" aria-label="${htmlEscape(p.name)} miqdorini kamaytirish">−</button><b>${qty}</b><button data-action="qty" data-id="${p.id}" data-step="1" aria-label="${htmlEscape(p.name)} miqdorini oshirish">+</button></div></div>`).join(''):'<p>Savatcha bo‘sh. Mahsulotlar bo‘limidan qo‘shing.</p>'}
    <div class="divider"></div><div class="row"><b>Mahsulotlar jami</b><b>${money(subtotal)}</b></div>
  </div>
  ${entries.length?`<div class="card block"><label class="formlabel" for="fulfill">Buyurtma turi</label><select class="field" id="fulfill"><option value="delivery" ${app.fulfillment==='delivery'?'selected':''}>🏠 Uyga yetkazish — demo</option><option value="pickup" ${app.fulfillment==='pickup'?'selected':''}>🏪 Filialdan olib ketish — demo</option></select>
    <label class="formlabel" for="coupon">Kupon (ixtiyoriy, har bir kod bir martalik)</label><select class="field" id="coupon"><option value="">Kuponsiz</option>${coupons.map(c=>`<option value="${htmlEscape(c.code)}" ${app.couponCode===c.code?'selected':''}>${htmlEscape(c.name)} — ${htmlEscape(c.code)}</option>`).join('')}</select>
    <div class="quote-summary" aria-live="polite" aria-atomic="true"><div class="row"><span>Kupon chegirmasi</span><strong class="quote-discount" id="quoteDiscount">Tekshirilmoqda...</strong></div><div class="row quote-total"><b>To‘lanadigan jami</b><b id="quoteTotal">${money(subtotal)}</b></div><div class="row order-coins-line"><span>Buyurtma bonusi</span><b id="quoteCoins">+${entries.reduce((t,x)=>t+x.qty,0)} Coin</b></div><p class="quote-hint" id="quoteHint"></p></div>
    <label class="formlabel" for="note">Izoh (demo — haqiqiy uy manzilingizni kiritmang)</label><input class="field" id="note" maxlength="300" placeholder="Masalan, test buyurtma" value="${htmlEscape(app.orderNote)}"/>
    <div class="hero-actions"><button class="btn full" data-action="order" id="submitOrder" disabled>✓ Sinov buyurtmasini yuborish</button></div>
  </div>`:''}
  <div class="hero-actions"><button class="btn secondary full" data-action="tab" data-tab="products">← Mahsulotlarga qaytish</button></div>`;
}
function render(){
  if(!app.me)return;
  // Ignore stale previews after switching tabs or changing the cart.
  app.quoteSerial++;
  const content=({game,products,rewards,profile,cart}[app.tab]||game)();
  $('#app').innerHTML=shell(content);
  if(app.tab==='cart' && quoteItems().length)void updateQuote();
}
async function updateQuote(){
  if(app.tab!=='cart'||!quoteItems().length)return;
  const serial=++app.quoteSerial;
  app.quoteBusy=true;app.quote=null;app.quoteError='';
  const discountNode=$('#quoteDiscount'),totalNode=$('#quoteTotal'),hintNode=$('#quoteHint'),submit=$('#submitOrder');
  if(discountNode)discountNode.textContent='Hisoblanmoqda...';
  if(hintNode)hintNode.textContent='';
  if(submit)submit.disabled=true;
  try{
    const quote=await request('/api/orders/quote',{items:quoteItems(),couponCode:app.couponCode,fulfillment:app.fulfillment});
    if(serial!==app.quoteSerial||app.tab!=='cart')return;
    app.quote=quote;app.quoteBusy=false;
    if(discountNode)discountNode.textContent=quote.discount?'-'+money(quote.discount):money(0);
    if(totalNode)totalNode.textContent=money(quote.total);
    if(hintNode)hintNode.textContent=quote.couponCode?'✅ Kupon hisoblandi. Bu kod faqat bitta buyurtmada ishlatiladi.':'Kupon tanlasangiz, chegirma shu yerda ko‘rinadi.';
    const rewardEl=$('#quoteCoins');if(rewardEl)rewardEl.textContent='+'+quote.purchaseCoinReward+' Coin';
    if(submit)submit.disabled=false;
  }catch(e){
    if(serial!==app.quoteSerial||app.tab!=='cart')return;
    app.quoteBusy=false;app.quoteError=e.message;
    if(discountNode)discountNode.textContent='Qo‘llanmadi';
    if(totalNode)totalNode.textContent='—';
    if(hintNode)hintNode.textContent=e.message;
    if(submit)submit.disabled=true;
  }
}
function updateTop(){if(!app.me)return;
  const u=app.me.user,r=app.me.rules,pending=app.pendingTaps||0,boost=u.boosterUntil>Date.now()?2:1;
  for(const n of document.querySelectorAll('[data-coins]'))n.textContent=num(u.coins+pending*boost);
  for(const n of document.querySelectorAll('[data-energy]'))n.textContent=Math.max(0,Math.floor(u.energy-pending));
  for(const n of document.querySelectorAll('[data-daily]'))n.textContent=u.dailyTaps+pending;
  for(const n of document.querySelectorAll('[data-total]'))n.textContent=num((u.totalTaps||0)+pending);
  for(const n of document.querySelectorAll('[data-energy-bar]'))n.style.width=Math.min(100,Math.max(0,(u.energy-pending)/r.energyMax*100))+'%';
  for(const n of document.querySelectorAll('[data-tap-multiplier]'))n.textContent=boost===2?'🚀 x2: har bosishda +2 Coin':'Har bosishda +1 Coin';
  for(const n of document.querySelectorAll('[data-boost-remaining]'))n.textContent=boost===2?'Qoldi '+boostLeft(u.boosterUntil):(app.me.canBoost?'30 daqiqa':'Bugun ishlatilgan');
}
async function flushTaps(){if(app.busy||app.pendingTaps===0)return;app.busy=true;const count=Math.min(10,app.pendingTaps);app.pendingTaps-=count;try{const a=await request('/api/game/tap',{count,productId:app.me.user.selectedProduct});app.me.user.coins=a.coins;app.me.user.energy=a.energy;app.me.user.dailyTaps=a.dailyTaps;app.me.user.totalTaps=(app.me.user.totalTaps||0)+a.accepted;updateTop();if(a.accepted<count)toast('Energiya yoki kunlik limit tugadi.');}catch(e){toast(e.message);await refresh().catch(()=>{});updateTop();}finally{app.busy=false;if(app.pendingTaps>0)setTimeout(flushTaps,90);}}
async function drainPendingTaps(){
  // Wait for outstanding flush requests and drain all taps at their previous multiplier.
  while(app.busy||app.pendingTaps){
    if(!app.busy && app.pendingTaps)await flushTaps();
    else await new Promise(resolve=>setTimeout(resolve,30));
  }
}
function triggerTap(button){if(app.me.user.dailyTaps+app.pendingTaps>=app.me.rules.dailyTapLimit||Math.floor(app.me.user.energy)-app.pendingTaps<=0){toast('Energiya yoki kunlik limit tugagan.');return;}app.pendingTaps++;updateTop();
  if(typeof navigator.vibrate==='function') navigator.vibrate(8);
  const f=document.createElement('span');f.className='tap-float';f.textContent=app.me.user.boosterUntil>Date.now()?'+2 Coin':'+1 Coin';button.parentNode.append(f);setTimeout(()=>f.remove(),700);
  clearTimeout(app.tapTimer);app.tapTimer=setTimeout(flushTaps,160);}
async function runAction(fn){try{await fn();}catch(e){toast(e.message);}}
async function initialize(){
  try{try{app.motionEffects=localStorage.getItem('sariq_motion')!=='false';document.body.classList.toggle('no-motion',!app.motionEffects);}catch{}
    app.config=await request('/api/config');
    const webapp=window.Telegram?.WebApp;
    if(webapp?.initData){webapp.ready();webapp.expand();try{webapp.setHeaderColor('#fffaf0');webapp.setBackgroundColor('#fffaf0');}catch{}await request('/api/auth/telegram',{initData:webapp.initData});}
    else if(app.config.demoAvailable){await request('/api/auth/demo',{asAdmin:new URLSearchParams(location.search).get('demo')==='admin'});}
    else {$('#app').innerHTML=`<div class="login-error"><div class="boot-emoji">🍕</div><h2>Telegram orqali oching</h2><p>Ushbu Mini App uchun Telegram botdagi «Sariq Coin o‘yinini ochish» tugmasini bosing.<br/>Kompyuterdagi sinov uchun DEMO_MODE=true va lokal server zarur.</p></div>`;return;}
    await refresh();render();
    const sharedVideo=new URLSearchParams(location.search).get('video');
    if(/^vid_[a-f0-9]{24}$/.test(sharedVideo||''))void videoEnter(sharedVideo);
    setInterval(()=>{if(app.me&&app.tab==='game')updateTop();},1000);
    setInterval(async()=>{if(app.me&&app.tab==='game'&&!app.busy&&!app.pendingTaps){await refresh().then(updateTop).catch(()=>{});}},30000);
  }catch(e){$('#app').innerHTML=`<div class="login-error"><div class="boot-emoji">⚠️</div><h2>Ilova ochilmadi</h2><p>${htmlEscape(e.message)}</p><button class="btn" id="retry">Qayta urinish</button></div>`;$('#retry')?.addEventListener('click',()=>location.reload());}
}
document.addEventListener('click',async e=>{
  const btn=e.target.closest('[data-action]');if(!btn||!app.me)return;
  const action=btn.dataset.action,id=btn.dataset.id;
  if(action==='tab'){if(app.pendingTaps)await flushTaps();app.tab=btn.dataset.tab;render();return;}
  if(action==='tap'){triggerTap(btn);return;}
  if(action==='video'){await videoEnter();return;}
  if(action==='category'){app.category=btn.dataset.category;render();return;}
  if(action==='choose')return runAction(async()=>{if(app.pendingTaps)await flushTaps();await request('/api/game/select',{productId:id});app.me.user.selectedProduct=id;app.tab='game';render();toast('O‘yin mahsuloti tanlandi!');});
  if(action==='addcart'){app.cart[id]=Math.min(10,(app.cart[id]||0)+1);render();toast('Savatchaga qo‘shildi.');return;}
  if(action==='cart'){app.tab='cart';render();return;}
  if(action==='qty'){app.cart[id]=Math.max(0,Math.min(10,(app.cart[id]||0)+Number(btn.dataset.step)));render();return;}
  if(action==='boost')return runAction(async()=>{
    // Do not retroactively double taps still queued before Boost activation.
    await drainPendingTaps();
    const r=await request('/api/game/boost',{});app.me.user.boosterUntil=r.boosterUntil;app.me.canBoost=false;render();toast('30 daqiqalik x2 faol: 1 bosish = 2 Coin!');
  });
  if(action==='daily')return runAction(async()=>{const r=await request('/api/game/daily',{});app.me.user.coins=r.coins;app.me.canClaimDaily=false;render();toast('+50 Coin qo‘shildi!');});
  if(action==='redeem')return runAction(async()=>{const reward=app.config.rewards.find(r=>r.id===id);if(!confirm(`${reward.name} uchun ${num(reward.cost)} Coin sarflansinmi? (DEMO)`))return;const result=await request('/api/coupons/redeem',{rewardId:id});await refresh();render();toast('Kupon yaratildi: '+result.code);});
  if(action==='order')return runAction(async()=>{
    const items=quoteItems();
    if(!items.length)return toast('Savatcha bo‘sh.');
    if(app.quoteBusy||!app.quote||app.quoteError)return toast('Avval yakuniy summani tekshiring.');
    app.fulfillment=$('#fulfill').value;app.couponCode=$('#coupon').value;app.orderNote=$('#note').value;
    if(!confirm(`Sinov buyurtmasi: ${money(app.quote.total)}. Haqiqiy buyurtma emas. Davom etamizmi?`))return;
    // Server independently recomputes and validates the discount before creating the order.
    const result=await request('/api/orders',{items,fulfillment:app.fulfillment,couponCode:app.couponCode,note:app.orderNote});
    app.cart={};app.couponCode='';app.orderNote='';await refresh();app.tab='cart';render();toast('Buyurtma yaratildi: '+result.order.id+(result.order.purchaseRewardGranted?' • +'+result.order.purchaseCoinReward+' Coin balansga qo‘shildi':' • +'+result.order.purchaseCoinReward+' Coin admin tasdig‘idan keyin qo‘shiladi'));
  });
  if(action==='invite')return runAction(async()=>{const link=app.me.referralLink;if(!link){toast('Bot tokenni ulang va serverni qayta ishga tushiring — havola paydo bo‘ladi.');return;}await navigator.clipboard.writeText(link);toast('Do‘stlarga taklif havolasi nusxalandi.');});
  if(action==='logout')return runAction(async()=>{await request('/api/auth/logout',{});location.href='/?demo=user';});
  if(action==='admin'){location.href='/admin';return;}
  if(action==='profileOrders'){app.profileView='orders';render();return;}
  if(action==='profileCoupons'){app.tab='rewards';app.profileView='overview';render();return;}
  if(action==='profileSettings'){app.profileView='settings';render();return;}
  if(action==='profileHome'){app.profileView='overview';render();return;}
  if(action==='info')return alert('Sariq Coin DEMO. Coinlar haqiqiy pul emas. Mahsulotlar va kuponlar sinov qiymatlarida. Restoran bilan hamkorlik hali ulanmagan.');
});
document.addEventListener('input',e=>{if(e.target.id==='note')app.orderNote=e.target.value;if(e.target.id==='search'){const v=e.target.value;app.query=v;const pos=e.target.selectionStart;render();const input=$('#search');input?.focus();input?.setSelectionRange(pos,pos);}});
document.addEventListener('change',e=>{if(e.target.id==='motionToggle'){app.motionEffects=e.target.checked;document.body.classList.toggle('no-motion',!app.motionEffects);try{localStorage.setItem('sariq_motion',String(app.motionEffects));}catch{}}if(e.target.id==='coupon'){app.couponCode=e.target.value;void updateQuote();}if(e.target.id==='fulfill'){app.fulfillment=e.target.value;void updateQuote();}});
initialize();
