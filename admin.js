'use strict';
const sariqApiUrl=path=>new URL(path,window.SARIQ_API_BASE||(location.hostname==='localhost'||location.hostname==='127.0.0.1'?location.origin:'https://sariqcoinbackend.onrender.com')).toString();
const $=s=>document.querySelector(s),escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>Number(n||0).toLocaleString('en-US')+' so‘m';
const num=n=>Number(n||0).toLocaleString('en-US');
const toast=msg=>{const el=$('#toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3500)};
let overview, videoAdmin;
async function api(path,data){const res=await fetch(sariqApiUrl(path),{method:data===undefined?'GET':'POST',credentials:'include',headers:{'Content-Type':'application/json','X-Sariq-Client':'1'},body:data===undefined?undefined:JSON.stringify(data)});const json=await res.json();if(!res.ok)throw Error(json.error||`HTTP ${res.status}`);return json;}
const rows=(data,make)=>data.length?data.map(make).join(''):'<tr><td colspan="8">Hozircha ma’lumot yo‘q</td></tr>';
function render(){const o=overview,s=o.stats;
  $('#admin').innerHTML=`<header class="admin-head"><div><h1>🛡 Sariq Coin — Admin</h1><p class="sub">Admin ID: ${escape(o.adminId)} • @${escape(o.adminUsername)} • Demo hisobot</p></div><div class="hero-actions"><a class="btn secondary" href="/?demo=admin" style="text-decoration:none">← Mini App</a><button class="btn" data-action="refresh">Yangilash</button></div></header>
  <div class="notice">❗ Bu demo ma’lumotlari. Buyurtmalar real restoran kassasi bilan bog‘lanmagan, hech qanday haqiqiy to‘lov olinmaydi.</div>
  <section class="admin-grid">${[
    ['👥 Foydalanuvchilar',num(s.users)],['👆 Jami bosishlar',num(s.totalTaps)],['🪙 Qolgan Coinlar',num(s.totalCoins)],['🎞️ Video ko‘rish (daqiqa)',num(Math.floor(s.totalVideoSeconds/60))],['🛒 Buyurtmalar',num(s.orders)],
    ['✅ Yakunlangan',num(s.completedOrders)],['💰 Sotuv (demo)',money(s.revenue)],['🤝 Sizning komissiya (demo)',money(s.commission)],['🎟 Ishlatilgan kuponlar',num(s.usedCoupons)]
  ].map(([name,val])=>`<div class="admin-stat"><small>${name}</small><strong>${val}</strong></div>`).join('')}</section>
  <section class="admin-panel"><h2>⚙️ O‘yin va biznes sozlamalari</h2><p class="sub">Qiymatlar o‘zgartirilganda yangi so‘rovlarga ta’sir qiladi. Haqiqiy byudjet va komissiya shartnomada belgilanadi.</p><form id="settings-form"><div class="admin-setting-grid">${[
   ['monthlyBudget','Oylik kupon byudjeti (so‘m)',o.settings.monthlyBudget],['commissionPercent','Komissiya (%)',o.settings.commissionPercent],
   ['energyMax','Maksimal energiya',o.settings.energyMax],['regenSeconds','1 energiya tiklanish vaqti (soniya)',o.settings.regenSeconds],['dailyTapLimit','Kunlik bosish limiti',o.settings.dailyTapLimit]
  ].map(([key,label,val])=>`<label><span class="formlabel">${label}</span><input name="${key}" class="field" type="number" step="${key==='commissionPercent'?'.5':'1'}" value="${val}" required/></label>`).join('')}</div><div class="hero-actions"><button class="btn" type="submit">Saqlash</button><p class="micro">Oylik band qilingan kupon zaxirasi: ${money(s.monthlyReserved)} / ${money(o.settings.monthlyBudget)}</p></div></form></section>
  <section class="admin-panel"><h2>🧾 Buyurtmalarni boshqarish</h2><p class="micro">Buyurtmani yakunlash komissiyani hisoblaydi, bekor qilish esa foydalanilmagan kuponni qaytaradi. Bu faqat demo.</p><div class="tablewrap"><table class="datatable"><thead><tr><th>ID</th><th>Mijoz</th><th>Manba</th><th>Jami</th><th>Chegirma</th><th>Komissiya</th><th>Holat</th><th>Amal</th></tr></thead><tbody>${rows(o.orders,x=>`<tr><td>${escape(x.id)}</td><td>${escape(x.userId)}</td><td>${escape(x.source)}</td><td>${money(x.total)}</td><td>${money(x.discount)}</td><td>${money(x.commission)}</td><td>${escape(x.status)}</td><td>${x.status==='placed'?`<div class="admin-actions"><button class="btn small" data-action="order" data-status="completed" data-id="${escape(x.id)}">Tasdiqlash</button><button class="btn small secondary" data-action="order" data-status="cancelled" data-id="${escape(x.id)}">Bekor</button></div>`:'—'}</td></tr>`)}</tbody></table></div></section>
  <section class="admin-panel"><h2>🏪 Filial kassasi uchun kupon sinovi</h2><p class="micro">Mijoz keltirgan bir martalik kupon kodini va mahsulot summasini kiriting. Bu restoran POS tizimi bilan haqiqiy integratsiya emas.</p><form id="pos-form" class="admin-setting-grid"><label><span class="formlabel">Kupon kodi</span><input name="code" class="field" required placeholder="SC-..."/></label><label><span class="formlabel">Buyurtma mahsulotlari summasi</span><input name="subtotal" type="number" min="0" class="field" required value="80000"/></label><label><span class="formlabel">Tekshirish</span><button class="btn full">Kuponni ishlatish (demo)</button></label></form></section>
  <section class="admin-panel"><h2>🎟 Kuponlar</h2><div class="tablewrap"><table class="datatable"><thead><tr><th>Kod</th><th>Mukofot</th><th>Foydalanuvchi</th><th>Holat</th><th>Zaxira qiymati</th></tr></thead><tbody>${rows(o.claims,c=>`<tr><td><b>${escape(c.code)}</b></td><td>${escape(c.name)}</td><td>${escape(c.owner)}</td><td>${escape(c.status)}</td><td>${money(c.reservedValue)}</td></tr>`)}</tbody></table></div></section>
  <section class="admin-panel"><h2>👥 Foydalanuvchilar</h2><div class="tablewrap"><table class="datatable"><thead><tr><th>Telegram ID</th><th>Ism</th><th>Username</th><th>Coin</th><th>Bosishlar</th><th>Takliflar</th></tr></thead><tbody>${rows(o.users,u=>`<tr><td>${escape(u.id)}</td><td>${escape(u.name)}</td><td>@${escape(u.username)}</td><td>${num(u.coins)}</td><td>${num(u.totalTaps)}</td><td>${num(u.referralCount)}</td></tr>`)}</tbody></table></div></section>`;
}
async function refresh(){[overview,videoAdmin]=await Promise.all([api('/api/admin/overview'),api('/api/admin/videos')]);render();renderVideoAdmin();}

function renderVideoAdmin(){
 if(!videoAdmin)return;
 const container=document.createElement('section');container.className='admin-panel';
 container.innerHTML=`<h2>🎞️ Video / Shorts boshqaruvi</h2>
   <p class="sub">Faqat administrator nashr qiladi. Kanal postlari avval tasdiqlash navbatiga tushadi. MP4 / WebM, ko‘pi bilan 40 MB; tavsiya 9:16, 5–120 soniya.</p>
   <div class="notice">Telegram kanalidan avtomatik olish: ${videoAdmin.channelImportEnabled?'YOQILGAN':'O‘CHIRILGAN'}. ${videoAdmin.channelConfigured?'Kanal ID sozlangan.':'VIDEO_CHANNEL_ID hali kiritilmagan.'} Kanal videolari 20 MB dan kichik bo‘lishi kerak.</div>
   <form id="video-upload-form" class="video-upload-form">
     <label>Video nomi <input class="field" type="text" name="title" maxlength="90" required placeholder="Masalan: Pepperoni aksiyasi"/></label>
     <label>Qisqa izoh <input class="field" type="text" name="description" maxlength="240" placeholder="Reklama tavsifi (ixtiyoriy)"/></label>
     <label>Davomiyligi (soniya) <input class="field" type="number" name="duration" min="5" max="120" value="12" required/></label>
     <label>Video fayl <input class="field" type="file" name="file" accept="video/mp4,video/webm,.mp4,.webm" required/></label>
     <p class="micro">Davomiylikni real video davomiyligiga mos kiriting. Fayl nashrdan oldin yashirin bo‘ladi.</p>
     <button class="btn" type="submit">Videoni admin panelga yuklash</button>
     <p class="micro" id="video-upload-status"></p>
   </form>
   <h3>Video katalogi (${videoAdmin.videos.length})</h3>
   <div class="tablewrap"><table class="datatable"><thead><tr><th>Nomi</th><th>Davom</th><th>Manba</th><th>Ko‘rish</th><th>Like</th><th>Holat</th><th>Amal</th></tr></thead><tbody>${rows(videoAdmin.videos,v=>`<tr>
       <td><b>${escape(v.title)}</b><br/><small>${escape(v.id)}</small></td>
       <td>${v.durationSeconds} s</td><td>${escape(v.source)}</td><td>${num(v.views)}</td><td>${num(v.likes)}</td>
       <td>${v.published?'<span class="success">Faol</span>':'Yashirin'}</td>
       <td><button class="btn small ${v.published?'secondary':''}" data-video-admin-action="${v.published?'hide':'publish'}" data-id="${v.id}">${v.published?'Yashirish':'Nashr etish'}</button></td>
     </tr>`)}</tbody></table></div>
   <h3>Kanal postlari: tasdiqlash navbati (${videoAdmin.pending.length})</h3>
   <div class="tablewrap"><table class="datatable"><thead><tr><th>Post</th><th>Nom</th><th>Hajm</th><th>Holat</th><th>Amallar</th></tr></thead><tbody>${rows(videoAdmin.pending,v=>`<tr>
     <td>${escape(v.messageId)}</td><td>${escape(v.title)}</td><td>${(v.fileSize/1024/1024).toFixed(2)} MB</td><td>${escape(v.status)}</td>
     <td class="admin-actions"><button class="btn small" data-video-admin-action="approve" data-id="${v.id}" ${v.status==='oversize'?'disabled':''}>Tasdiqlash</button>
     <button class="btn small secondary" data-video-admin-action="reject" data-id="${v.id}">Rad etish</button></td>
     </tr>`)}</tbody></table></div>
   <p class="micro">Video mukofoti: +25 Coin va +10 energiya. Foydalanuvchi boshiga kuniga 5 ta yangi video uchun mukofot; bir video kuniga bir marta hisoblanadi. Demo ko‘rish signallari tijoriy reklama tasdig‘i emas.</p>`;
 $('#admin').append(container);
}
async function uploadVideo(e){
 e.preventDefault();const form=e.target;const fd=new FormData(form),file=fd.get('file');
 if(!(file instanceof File)||!file.size){toast('Video tanlang.');return;}
 if(file.size>40*1024*1024){toast('Fayl hajmi 40 MB dan katta.');return;}
 const params=new URLSearchParams({title:fd.get('title'),description:fd.get('description'),duration:fd.get('duration')});
 const status=document.getElementById('video-upload-status');if(status)status.textContent='Video serverga yuklanyapti, kuting…';
 const submit=form.querySelector('button[type=submit]');submit.disabled=true;
 try{
   const response=await fetch(sariqApiUrl('/api/admin/videos/upload?'+params),{method:'POST',credentials:'include',headers:{'X-Sariq-Client':'1','Content-Type':file.type|| (file.name.toLowerCase().endsWith('.webm')?'video/webm':'video/mp4')},body:file});
   const data=await response.json();if(!response.ok)throw Error(data.error||'Video yuklashda xato.');
   toast('Video yuklandi. Endi Nashr etish tugmasini bosing.');await refresh();
 }catch(err){toast(err.message);if(status)status.textContent=err.message;}finally{submit.disabled=false;}
}

async function initialize(){try{await refresh()}catch(e){$('#admin').innerHTML=`<div class="login-error"><h2>🛡 Admin kirishi talab qilinadi</h2><p>${escape(e.message)}</p><a class="btn" href="/?demo=admin" style="text-decoration:none">Lokal demo admin sifatida kirish</a></div>`;}}
document.addEventListener('submit',async e=>{if(e.target.id==='video-upload-form')return uploadVideo(e);if(e.target.id==='settings-form'){e.preventDefault();const data=Object.fromEntries(new FormData(e.target));try{await api('/api/admin/settings',data);await refresh();toast('Sozlamalar saqlandi.')}catch(err){toast(err.message)}}if(e.target.id==='pos-form'){e.preventDefault();const data=Object.fromEntries(new FormData(e.target));if(!confirm('Kuponni demo kassada ishlatilgan deb belgilaymizmi?'))return;try{await api('/api/admin/coupons/use',data);await refresh();toast('Kupon demo kassada ishlatildi.')}catch(err){toast(err.message)}}});
document.addEventListener('click',async e=>{
 const videoBtn=e.target.closest('[data-video-admin-action]');
 if(videoBtn){const action=videoBtn.dataset.videoAdminAction, id=videoBtn.dataset.id;
  if(!confirm('Video holatini o‘zgartirasizmi?'))return;videoBtn.disabled=true;
  try{await api(`/api/admin/videos/${encodeURIComponent(id)}/${action}`,{});await refresh();toast('Video boshqaruvi yangilandi.');}
  catch(err){toast(err.message);videoBtn.disabled=false;}return;
 }
 const btn=e.target.closest('[data-action]');if(!btn)return;if(btn.dataset.action==='refresh'){try{await refresh()}catch(err){toast(err.message)}}if(btn.dataset.action==='order'){if(!confirm('Sinov buyurtmasi holatini o‘zgartiramizmi?'))return;try{await api(`/api/admin/orders/${encodeURIComponent(btn.dataset.id)}/status`,{status:btn.dataset.status});await refresh();toast('Buyurtma holati yangilandi.')}catch(err){toast(err.message)}}});
initialize();
