# Trading Notifier

ระบบแจ้งเตือนการเทรดผ่าน Telegram: EA บน MetaTrader 5 ส่งข้อมูลเทรดมาที่เซิร์ฟเวอร์ → เซิร์ฟเวอร์บันทึกลง Supabase, ตรวจการตั้งค่าของผู้ใช้ แล้วส่งข้อความ Telegram พร้อมเว็บ Dashboard ดูประวัติและสถิติ

```
MT5 (TradeAlert.mq5) ──webhook──▶ Node/Express (Render) ──▶ Supabase
                                        │  └─▶ Telegram Bot
                                        └─▶ เว็บ Dashboard (Frontend/)
```

## โครงสร้าง

| โฟลเดอร์/ไฟล์ | หน้าที่ |
|---|---|
| `src/server.js` | Express: webhook (`/webhook/mt5`, `/webhook/mt5/drawdown`, `/webhook/tradingview`), เสิร์ฟหน้าเว็บ, security headers |
| `src/api.js` | REST API ของเว็บ (`/api/*`): login, โปรไฟล์, เทรด, สถิติ, การแจ้งเตือน, จัดการบัญชี (admin) |
| `src/trade-message.js`, `src/risk-alert.js` | ข้อความ Telegram และตรรกะ Risk Alert (drawdown) |
| `Frontend/` | หน้าเว็บ (HTML + `css/pages/` + `js/pages/`) เสิร์ฟโดย Express ที่ origin เดียวกับ API |
| `supabase/schema.sql` | SQL สำหรับสร้าง/อัปเดตตาราง, RLS, ฟังก์ชันลบบัญชี |
| `TradeAlert.example.mq5` | แม่แบบ EA — คัดลอกเป็น `TradeAlert.mq5` แล้วใส่ค่าจริง (ไฟล์จริงถูก ignore) |
| `scripts/add-user.js` | สร้างผู้ใช้จากบรรทัดคำสั่ง |

## รันในเครื่อง

ต้องใช้ Node 20 ขึ้นไป

```bash
npm install
cp .env.example .env      # แล้วกรอกค่าใน .env
npm run dev               # http://localhost:3000
```

ตัวแปรสำคัญใน `.env`: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (ใช้ **service_role** key เท่านั้น เพราะเปิด RLS ไว้), `JWT_SECRET`, `TELEGRAM_BOT_TOKEN`

## ตั้งค่า Supabase

รัน `supabase/schema.sql` ใน SQL editor (มีทั้งสร้างตารางและ migration ตามลำดับ ตรวจแต่ละส่วนก่อนรัน)
แล้วตั้งแอดมินคนแรกตามคอมเมนต์ท้ายส่วน role ในไฟล์เดียวกัน

## Deploy (Render)

`render.yaml` ตั้งค่า web service ไว้แล้ว ใส่ env ที่ `sync: false` ในหน้า Render (`JWT_SECRET`, `TELEGRAM_BOT_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`)
push ขึ้น `main` แล้ว Render จะ deploy ให้เอง

## เพิ่มผู้ใช้

ไม่มีหน้าสมัครสมาชิก แอดมินสร้างบัญชีที่หน้า "จัดการบัญชี" ในเว็บ (หรือ `node scripts/add-user.js`)
แต่ละบัญชีมี `webhook_secret` ของตัวเอง — นำไปใส่ใน EA และต้องตั้ง Telegram Chat ID ที่หน้าการแจ้งเตือน

## ตั้งค่า EA (MetaTrader 5)

1. คัดลอก `TradeAlert.example.mq5` เป็น `TradeAlert.mq5` ใส่ `webhook_url` และ `webhook_secret`
   (`bot_token`/`chat_id` ใน EA เป็นตัวสำรอง ใช้เมื่อเซิร์ฟเวอร์ส่งไม่ได้ เว้นว่างได้ถ้าไม่ต้องการ)
2. MT5 → Tools → Options → Expert Advisors → เพิ่ม URL ของเซิร์ฟเวอร์ใน "Allow WebRequest"
3. คอมไพล์ (F7) แล้วลากลงกราฟ ดูผลที่แท็บ Experts

> `TradeAlert.mq5` ตัวจริงมีรหัสลับ ห้าม commit (อยู่ใน `.gitignore`)

## ความปลอดภัย

- เปิด RLS ทุกตารางและไม่มี policy: เฉพาะเซิร์ฟเวอร์ (service_role) เข้าถึงข้อมูลได้
- Login จำกัดความถี่ (IP และอีเมล), รหัสผ่าน bcrypt, session เป็น JWT
- Express ใช้ helmet (CSP, X-Frame-Options ฯลฯ) — ถ้าเพิ่มสคริปต์/ฟอนต์จากโดเมนใหม่ ต้องเพิ่มใน CSP ที่ `src/server.js`
- Chart.js ปักเวอร์ชันและมี SRI (`integrity`) ถ้าอัปเวอร์ชัน ต้องคำนวณ hash ใหม่
- CORS เปิดเฉพาะ `localhost`/`127.0.0.1` (ไว้ทดสอบหน้าเว็บคนละพอร์ต) หน้าเว็บจริงอยู่ origin เดียวกับ API
- รหัสผ่านจำกัด 72 **ไบต์** (bcrypt) — อักษรไทย 1 ตัวนับ 3 ไบต์ ใส่ได้ราว 24 ตัว
- ส่ง Telegram ด้วย `fetch` ตรง ๆ (ไม่มีไลบรารีบอท)
