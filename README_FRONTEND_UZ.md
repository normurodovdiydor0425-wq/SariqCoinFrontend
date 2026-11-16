# Sariq Coin — Vercel frontend va Render backend

Frontend `https://sariqcoinbackend.onrender.com` manzilidagi backend API bilan ishlaydi. `config.js` shu API manzilini belgilaydi; lokal `localhost` sinovida esa joriy manzildan foydalanadi. API chaqiruvlari, login cookie’lari va video oqimi backendga yo‘naltiriladi.

## Joylash

1. GitHub’dagi `SariqCoinFrontend` repozitoriysini Vercel’ga ulang. Root katalogida `index.html` bo‘lishi kerak; statik frontend uchun build buyrug‘i shart emas.
2. Render backend ilovasida quyidagi muhit o‘zgaruvchilarini belgilang:
   - `NODE_ENV=production`
   - `FRONTEND_ORIGINS=https://<vercel-loyiha-domeni>`
3. `FRONTEND_ORIGINS` qiymatiga Vercel’dagi aniq HTTPS originni yozing; yo‘l yoki oxirgi `/` qo‘shmang. Masalan, `https://sariq-coin-demo.vercel.app`. O‘z domeningiz bo‘lsa, uni ham shu yerga kiriting.
4. `FRONTEND_ORIGINS` sozlamasini qo‘llaydigan server kodini Render’ga qayta deploy qiling, so‘ng Vercel frontend’ni deploy qiling.

Backend kross-domen cookie’lari uchun `SameSite=None; Secure` yuboradi. Brauzerda uchinchi tomon cookie’lari taqiqlangan bo‘lsa, Vercel’da o‘z domeningizni ishlating yoki frontend va backend’ni bir site ostida joylashtiring.

`FRONTEND_ORIGINS` backend’da aniq Vercel domeniga teng bo‘lishi shart. `*` yoki butun `vercel.app` domeniga ruxsat berish tavsiya etilmaydi. Brauzerda CORS xatosi chiqsa, Render’dagi origin qiymatini va backend deploy holatini tekshiring.
