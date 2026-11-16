# Frontend
Statik HTML/CSS/JavaScript, foydalanuvchi Mini App, admin panel va dizayn aktivlari `public/` katalogida. Hech qanday Telegram bot tokeni frontendda saqlanmaydi.

Eng sodda yo‘l: `../backend/server.mjs`ni ishga tushiring — backend frontend fayllarini bir domen orqali uzatadi.

Ikki jarayonli lokal test:

1. Boshqa terminalda `cd backend && node server.mjs`.
2. Shu papkada `npm run dev`.
3. `http://127.0.0.1:5173/?demo=user`.

Bu `dev-server.mjs` frontend statik fayllarini beradi, API va videolarni `http://127.0.0.1:8080` backendga proksi qiladi. Productionda backendning bitta portli variantini ishlating. Faqat frontendni webga joylash Coin tizimini mustaqil ishlatmaydi.
