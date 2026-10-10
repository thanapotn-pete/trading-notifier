// server.js — จุดเริ่มต้นของเซิร์ฟเวอร์ (Express) ทำ 4 หน้าที่
// 1) รับ webhook จาก EA ใน MT5 (/webhook/mt5, /webhook/mt5/drawdown) และจาก TradingView
// 2) ให้บริการ REST API แก่หน้าเว็บ (ทุกอย่างใต้ /api → ไฟล์ api.js)
// 3) เสิร์ฟไฟล์หน้าเว็บในโฟลเดอร์ Frontend/  4) เริ่มงานตั้งเวลา (scheduler.js)
// ลำดับ webhook ของ MT5: ตรวจ secret → บันทึกเทรด → ตรวจการตั้งค่าผู้ใช้ → สร้างข้อความ → ส่ง
// Telegram
require('dotenv').config();

// [สรุป] ตรวจตัวแปรสภาพแวดล้อม (env) ที่จำเป็นตั้งแต่เริ่มโปรแกรม
// ถ้าขาดตัวไหนให้หยุดทันทีพร้อมบอกชื่อ
// ดีกว่าปล่อยให้พังทีหลังด้วย error 500 ที่ไม่รู้สาเหตุ
// Fail at start-up instead of failing on the first request: without these the
// server can't log anyone in or reach the database, and the error would only
// show up later as a confusing 500.
const REQUIRED_ENV = ['JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];  // ต้องมี: กุญแจเซ็น JWT, URL ของ Supabase, service key ของ Supabase
const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name]);

if (missingEnv.length > 0) {
  console.error(
    `[Server] Missing required environment variable(s): ${missingEnv.join(', ')}`
  );
  process.exit(1);  // หยุดโปรแกรมทันที
}

// token ของบอท Telegram ไม่บังคับตอนเริ่ม แต่ถ้าไม่ตั้ง การส่งแจ้งเตือนจะล้มเหลว (แค่เตือนใน
// log ไม่หยุดโปรแกรม)
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.warn(
    '[Server] TELEGRAM_BOT_TOKEN is not set — Telegram alerts will fail (the EA falls back to its own).'
  );
}

// นำเข้าไลบรารีและโมดูลของระบบ
const path = require('path');
const express = require('express');
const helmet = require('helmet');

const {
  handleTradingViewAlert  // แปลง alert ของ TradingView เป็นข้อความ Telegram
} = require('./handlers/tradingview');

const {
  recordTrade,  // บันทึกเทรดลงฐานข้อมูล
  getPosition  // ดึงข้อมูลออเดอร์ที่เปิดไว้ (ใช้ตอนปิด)
} = require('./pnl/tracker');

const {
  buildTradeMessage,  // สร้างข้อความเทรด
  buildDrawdownMessage  // สร้างข้อความเตือน Drawdown
} = require('./trade-message');

const {
  evaluateDrawdown,  // ตัดสินว่าควรเตือน Drawdown ไหม
  markAlerted  // จำว่าเตือนไปแล้ว
} = require('./risk-alert');

const {
  findUserBySecret  // หาผู้ใช้จาก webhook secret
} = require('./users');

const {
  startScheduler  // เริ่มงานตั้งเวลาสรุปรายวัน/สัปดาห์
} = require('./scheduler');

const {
  notify  // ส่งข้อความ Telegram
} = require('./notifications');

const {
  getNotificationSettings,  // อ่านการตั้งค่าแจ้งเตือนของผู้ใช้
  shouldNotifyTrade  // ตัดสินว่าเทรดนี้ควรแจ้งไหม
} = require('./notification-settings');

const apiRouter = require('./api');  // ชุดเส้นทาง REST API ของหน้าเว็บ


const app = express();  // สร้างแอป Express

// [สรุป] บอก Express ว่ามี proxy ของ Render อยู่ข้างหน้า 1 ชั้น เพื่อให้ได้ IP จริงของผู้ใช้
// (ใช้นับจำนวนครั้ง login ผิดต่อ IP — ถ้าไม่ตั้ง ทุกคนจะดูเป็น IP เดียวกัน)
// Render puts one proxy in front of the server. Trust it so req.ip is the real
// client address (from X-Forwarded-For) — otherwise every visitor looks like the
// proxy's IP and the login rate limit would be shared by the whole world.
app.set('trust proxy', 1);

// [สรุป] ตั้ง header ความปลอดภัยด้วย helmet โดยเฉพาะ CSP (Content-Security-Policy)
// คือการระบุว่าหน้าเว็บ "โหลดสคริปต์/สไตล์/ฟอนต์จากที่ไหนได้บ้าง" ช่วยกันโค้ดแปลกปลอม (XSS)
// Security headers (X-Frame-Options, nosniff, Referrer-Policy, no X-Powered-By...).
// The CSP lists exactly what the pages load: their own files, Bootstrap Icons /
// Chart.js from jsDelivr and Google Fonts. The pages have no inline scripts or
// event handlers, so script-src-attr is 'none'; only style="..." attributes
// remain, hence 'unsafe-inline' for styles.
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],  // ค่าเริ่มต้น: โหลดได้เฉพาะจากเซิร์ฟเวอร์เราเอง
      scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],  // สคริปต์: จากเราเอง + jsDelivr (ไลบรารี Chart.js)
      scriptSrcAttr: ["'none'"],  // ห้ามเขียน onclick="..." ฝังในแท็ก HTML
      styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://fonts.googleapis.com'],  // สไตล์: เราเอง + jsDelivr + Google Fonts (+ style="" ในแท็ก)
      fontSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://fonts.gstatic.com'],  // ฟอนต์: เราเอง + jsDelivr (ไอคอน) + Google Fonts
      imgSrc: ["'self'", 'data:'],  // รูปภาพ: เราเอง + data: (รูปฝังในโค้ด)
      connectSrc: ["'self'"],  // เรียก API/fetch ได้เฉพาะเซิร์ฟเวอร์เราเอง
      objectSrc: ["'none'"],  // ห้ามปลั๊กอิน/object
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"]  // ห้ามนำเว็บเราไปฝังใน iframe ของเว็บอื่น (กัน clickjacking)
    }
  }
}));

app.use(express.json());  // อ่าน body ที่เป็น JSON ให้อัตโนมัติ → ใช้ผ่าน req.body


// =====================================================
// CORS
// =====================================================

// [สรุป] CORS: หน้าเว็บอยู่ origin เดียวกับ API จึงไม่ต้องใช้ CORS
// เปิดให้เฉพาะ localhost / 127.0.0.1 (ไว้ตอนพัฒนาโดยเปิดหน้าเว็บจากอีกพอร์ต) เว็บอื่นเรียก API
// เราจากเบราว์เซอร์ไม่ได้
// The pages are served by this server, so they call the API on the same
// origin and need no CORS. Cross-origin access is only opened for a local dev
// page on another port (e.g. Live Server on :5500 calling localhost:3000).
const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;  // รูปแบบ origin ที่อนุญาต

// ตัวกลาง (middleware) ของ /api: ใส่ header CORS เฉพาะ origin ที่อนุญาต และตอบ preflight
// (OPTIONS) ทันที
app.use('/api', (req, res, next) => {

  const origin = req.headers.origin;

  if (origin && LOCAL_ORIGIN.test(origin)) {

    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');

    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PATCH, DELETE'
    );

    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );

  }

  if (req.method === 'OPTIONS') {  // preflight ของเบราว์เซอร์ → ตอบ 204 ไม่ต้องทำต่อ
    return res.sendStatus(204);
  }

  next();  // ส่งต่อให้ตัวจัดการถัดไป
});


// ทุกคำขอที่ขึ้นต้นด้วย /api ส่งต่อให้ api.js (login, โปรไฟล์, เทรด, สถิติ, ตั้งค่า,
// จัดการบัญชี)
app.use('/api', apiRouter);


// =====================================================
// WEBHOOK USER LOOKUP
// =====================================================

// [สรุป] middleware ตรวจ "webhook secret" ของคำขอที่มาจาก EA/TradingView
// อ่าน secret จากหัว x-webhook-secret (หรือ field secret ใน body) แล้วหาผู้ใช้เจ้าของ secret
// ไม่พบหรือบัญชีถูกระงับ → ตอบ 401, พบ → แนบผู้ใช้ไว้ที่ req.user แล้วไปต่อ
async function lookupUser(req, res, next) {

  try {

    // -------------------------------------------------
    // Read webhook secret
    // Priority:
    // 1. x-webhook-secret Header
    // 2. secret from JSON Body (backward compatible)
    // -------------------------------------------------

    const secret =
      req.headers['x-webhook-secret'] ||
      req.body?.secret;

    // หาผู้ใช้จาก secret (ถ้าไม่ได้ส่ง secret มาเลย ก็ไม่ต้องค้น)
    const user =
      secret
        ? await findUserBySecret(secret)
        : null;

    if (!user) {

      // secret ไม่ถูกต้อง → ปฏิเสธ (401 Unauthorized)
      return res.status(401).json({
        error: 'Invalid secret'
      });

    }

    req.user = user;  // แนบผู้ใช้ไปกับคำขอ ให้ตัวจัดการถัดไปใช้

    next();

  } catch (err) {

    console.error(
      '[Auth] Error:',
      err.message
    );

    res.status(500).json({
      error: err.message
    });

  }
}


// =====================================================
// TRADINGVIEW WEBHOOK
// =====================================================

// [สรุป] POST /webhook/tradingview — รับ alert จาก TradingView: ตรวจ secret แล้วส่งเป็นข้อความ
// Telegram
// (ไม่บันทึกเทรดลงฐานข้อมูล)
app.post(
  '/webhook/tradingview',
  lookupUser,
  async (req, res) => {

    try {

      await handleTradingViewAlert(
        req.body,
        req.user
      );

      // ตอบกลับ EA ว่า "บันทึกเทรดและส่ง Telegram แล้ว"
      res.json({
        ok: true
      });

    } catch (err) {

      console.error(
        '[Webhook] Error:',
        err.message
      );

      res.status(500).json({
        error: err.message
      });

    }

  }
);


// =====================================================
// MT5 WEBHOOK
// =====================================================

// [สรุป] POST /webhook/mt5 — EA ใน MT5 ยิงมาทุกครั้งที่เปิด/ปิดออเดอร์
// ขั้นตอน: 1) ตรวจ secret  2) ตรวจข้อมูลที่จำเป็น  3) บันทึกเทรดลงฐานข้อมูล
// 4) ถ้าผู้ใช้ยังไม่มี Telegram chat id → ตอบ EA ให้ส่งข้อความเอง  5)
// อ่านการตั้งค่าและตรวจว่าควรแจ้งไหม
// 6) สร้างข้อความ  7) ส่ง Telegram แล้วตอบผลกลับ EA
app.post(
  '/webhook/mt5',
  lookupUser,
  async (req, res) => {

    try {

      // แยกข้อมูลที่ EA ส่งมา: action (buy/sell/close/tp/sl), symbol, ราคา, กำไร, lot,
      // position_id ฯลฯ
      const {
        action,
        symbol,
        price,
        pnl,
        lot,
        position_id,
        tp,
        sl,
        drawdown,
        order_seq
      } = req.body;


      // -------------------------------------------------
      // Validate required fields
      // -------------------------------------------------

      if (
        !action ||
        !symbol ||
        !position_id
      ) {

        return res.status(400).json({
          error:
            'action, symbol and position_id required'
        });

      }


      // -------------------------------------------------
      // Save trade to Supabase
      // -------------------------------------------------

      // บันทึกลงตาราง trades: เปิดออเดอร์ → เพิ่มแถวใหม่, ปิดออเดอร์ → อัปเดตแถวเดิมของ
      // position นั้น (ดู tracker.js)
      await recordTrade({

        action,
        symbol,
        price,
        pnl,
        lot,
        position_id,
        tp,
        sl,

        user_id: req.user.id

      });


      console.log(
        `[MT5 Webhook] Trade saved for user: ${req.user.id}`
      );


      // -------------------------------------------------
      // Check Telegram Chat ID
      // -------------------------------------------------

      if (!req.user.telegram_chat_id) {  // ผู้ใช้ยังไม่ได้ตั้ง Telegram → เก็บเทรดแล้วแต่ไม่ส่งข้อความ

        console.log(
          `[MT5 Webhook] No Telegram Chat ID for user: ${req.user.id}`
        );

        return res.json({

          ok: true,

          notification_sent: false,

          // The EA reads this: with no Chat ID on the server it sends the
          // Telegram message itself instead of dropping it.
          reason: 'no_chat_id',  // รหัสเหตุผลที่ EA อ่านเพื่อตัดสินใจส่งข้อความเอง

          message:
            'MT5 trade recorded. Telegram Chat ID not configured.'

        });

      }


      // -------------------------------------------------
      // Load Notification Settings
      // -------------------------------------------------

      // อ่านการตั้งค่าแจ้งเตือนของผู้ใช้ (สวิตช์ที่ตั้งในหน้า "การแจ้งเตือน")
      const settings =
        await getNotificationSettings(
          req.user.id
        );


      // -------------------------------------------------
      // Check Notification Rules
      // -------------------------------------------------

      // ตัดสินว่าเทรดนี้ควรแจ้งไหม ตามการตั้งค่า (สวิตช์หลัก, ชนิด action, คู่เงิน,
      // กำไรขั้นต่ำ)
      const allowed =
        shouldNotifyTrade(
          settings,
          {
            action,
            symbol,
            price,
            pnl,
            lot,
            position_id,
            tp,
            sl,
            drawdown
          }
        );


      console.log(
        `[MT5 Webhook] Notification allowed: ${allowed}`
      );


      // -------------------------------------------------
      // Notification blocked
      // -------------------------------------------------

      if (!allowed) {  // ผู้ใช้ปิดการแจ้งเตือนแบบนี้ไว้ → ไม่ส่ง (แต่เทรดถูกบันทึกไปแล้ว)

        console.log(
          '[MT5 Webhook] Telegram notification blocked by settings'
        );

        return res.json({

          ok: true,

          notification_sent: false,

          // The user turned this alert off on the website — the EA must
          // not send it either.
          reason: 'blocked_by_settings',

          message:
            'MT5 trade recorded. Telegram notification blocked by settings.'

        });

      }


      // -------------------------------------------------
      // Build Telegram Message
      // -------------------------------------------------
      // On close the EA only sends action="close", so look up the stored
      // position to show whether it was a BUY or SELL and its entry price.

      let position = null;  // ข้อมูลออเดอร์เดิม (ใช้เฉพาะตอนปิดออเดอร์)

      if (['close', 'tp', 'sl'].includes(String(action).toLowerCase())) {

        try {

          position =
            await getPosition(
              req.user.id,
              position_id
            );

        } catch (err) {

          console.error(
            '[MT5 Webhook] Position lookup failed:',
            err.message
          );

        }

      }


      // สร้างข้อความ Telegram (รูปแบบ HTML) จากข้อมูลเทรด
      const message =
        buildTradeMessage(
          {
            action,
            symbol,
            price,
            pnl,
            lot,
            position_id,
            tp,
            sl,
            drawdown,
            order_seq
          },
          position
        );

      // -------------------------------------------------
      // Send Telegram
      // -------------------------------------------------

      // ส่งข้อความเข้า Telegram ของผู้ใช้คนนี้
      await notify(
        message,
        req.user.telegram_chat_id
      );


      console.log(
        `[MT5 Webhook] Telegram sent to user: ${req.user.id}`
      );


      // -------------------------------------------------
      // Response
      // -------------------------------------------------

      res.json({

        ok: true,

        notification_sent: true,

        message:
          'MT5 trade recorded and Telegram notification sent'

      });


    } catch (err) {

      console.error(
        '[MT5 Webhook] Error:',
        err.message
      );

      res.status(500).json({
        error: err.message
      });

    }

  }
);


// =====================================================
// MT5 DRAWDOWN (Risk Alert)
// =====================================================

// [สรุป] เส้นทางเตือนความเสี่ยง: EA ส่งค่า drawdown (% ที่ equity ตกจากจุดสูงสุด) มาเป็นระยะ
// เซิร์ฟเวอร์ดูสวิตช์ Risk Alert และเกณฑ์ที่ผู้ใช้ตั้ง แล้วให้ risk-alert.js
// ตัดสินว่าต้องเตือนตอนนี้ไหม
// The EA reports account drawdown (fall from peak equity) whenever it moves.
// The user's "Risk Alert" switch and "Maximum Drawdown" limit decide here
// whether it becomes a Telegram message — once per crossing (see risk-alert.js).

// เกณฑ์มาตรฐานเมื่อผู้ใช้ยังไม่ตั้งค่า
const DEFAULT_MAX_DRAWDOWN = 10; // what the website shows when no limit is saved

// [สรุป] POST /webhook/mt5/drawdown: ตรวจ secret → ตรวจค่า → ผู้ใช้เปิด Risk Alert ไหม →
// เทียบกับเกณฑ์
// → evaluateDrawdown ตัดสิน → ส่ง Telegram (เตือนครั้งเดียวต่อการข้ามเกณฑ์)
app.post(
  '/webhook/mt5/drawdown',
  lookupUser,
  async (req, res) => {

    try {

      const drawdown = Number(req.body?.drawdown);  // ค่า drawdown (%) ที่ EA ส่งมา

      if (!Number.isFinite(drawdown) || drawdown < 0) {

        return res.status(400).json({
          error: 'drawdown must be a non-negative number'
        });

      }

      if (!req.user.telegram_chat_id) {  // ไม่มี Telegram → ไม่มีที่ให้ส่ง

        return res.json({
          ok: true,
          notification_sent: false,
          reason: 'no_chat_id'
        });

      }

      // อ่านการตั้งค่า: ถ้าปิดแจ้งเตือนทั้งหมด หรือปิด Risk Alert → ไม่เตือน
      const settings =
        await getNotificationSettings(
          req.user.id
        );

      if (
        settings.enabled === false ||
        settings.notify_risk === false
      ) {

        return res.json({
          ok: true,
          notification_sent: false,
          reason: 'blocked_by_settings'
        });

      }

      // เกณฑ์ Drawdown ที่ผู้ใช้ตั้งไว้ (ถ้ายังไม่ตั้งใช้ค่ามาตรฐาน)
      const savedLimit = Number(settings.max_drawdown);

      const limit =
        settings.max_drawdown !== null &&
        settings.max_drawdown !== undefined &&
        Number.isFinite(savedLimit)
          ? savedLimit
          : DEFAULT_MAX_DRAWDOWN;

      // ให้ risk-alert.js ตัดสิน: "alert" = ควรเตือนตอนนี้ / "rearm" = ลดลงต่ำกว่าเกณฑ์แล้ว
      // พร้อมเตือนรอบใหม่ / "none" = ไม่ต้องทำอะไร
      const decision =
        evaluateDrawdown(
          req.user.id,
          drawdown,
          limit
        );

      if (decision !== 'alert') {  // ไม่ต้องเตือนตอนนี้ → ตอบกลับเฉย ๆ

        return res.json({
          ok: true,
          notification_sent: false,
          reason: decision === 'rearm' ? 'rearmed' : 'no_new_alert'
        });

      }

      // ส่งข้อความเตือน Drawdown (equity, จุดสูงสุด, balance) เข้า Telegram
      await notify(
        buildDrawdownMessage(
          {
            drawdown,
            equity: req.body.equity,
            peak: req.body.peak,
            balance: req.body.balance,
            currency: req.body.currency
          },
          limit
        ),
        req.user.telegram_chat_id
      );

      // Only after Telegram really accepted it, so a failed send is retried
      markAlerted(req.user.id);  // จำไว้ว่าเตือนแล้ว (ทำหลังส่งสำเร็จเท่านั้น)

      console.log(
        `[MT5 Drawdown] Risk alert sent to user: ${req.user.id} (${drawdown}% >= ${limit}%)`
      );

      res.json({
        ok: true,
        notification_sent: true,
        message: 'Drawdown alert sent'
      });

    } catch (err) {

      console.error(
        '[MT5 Drawdown] Error:',
        err.message
      );

      res.status(500).json({
        error: err.message
      });

    }

  }
);


// =====================================================
// FRONTEND (static pages)
// =====================================================

// [สรุป] เสิร์ฟหน้าเว็บ (HTML/CSS/JS ในโฟลเดอร์ Frontend) จากเซิร์ฟเวอร์ตัวเดียวกับ API
// จึงไม่ต้องมี web server แยก
// Same origin as the API, so the pages need no CORS and no API URL setting.
app.use(express.static(path.join(__dirname, '..', 'Frontend')));

// เปิดที่ / ให้เด้งไปหน้า login
app.get('/', (req, res) => {
  res.redirect('/login.html');
});


// =====================================================
// HEALTH CHECK
// =====================================================

// [สรุป] GET /health — เส้นทางตรวจสุขภาพ ให้ Render
// หรือผู้ดูแลเรียกเช็กว่าเซิร์ฟเวอร์ยังทำงานอยู่
app.get(
  '/health',
  (req, res) => {

    res.json({

      status: 'ok',

      time:
        new Date().toISOString()

    });

  }
);


// =====================================================
// START SERVER
// =====================================================

// พอร์ตที่เซิร์ฟเวอร์ฟัง: ใช้ค่า PORT จาก env (Render กำหนดให้) ถ้าไม่มีใช้ 3000
const PORT =
  process.env.PORT || 3000;


// เริ่มรับคำขอ และเมื่อพร้อมแล้วเริ่มงานตั้งเวลา
app.listen(
  PORT,
  () => {

    console.log(
      `[Server] Running on port ${PORT}`
    );

    startScheduler();  // เริ่ม cron สรุปรายวัน/รายสัปดาห์

  }
);