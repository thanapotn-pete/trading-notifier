// api.js — REST API ของหน้าเว็บ (ทุกเส้นทางอยู่ใต้ /api — server.js ส่งต่อคำขอมาที่ไฟล์นี้)
// • POST /login  ไม่ต้องมี token (เป็นเส้นทางเดียวที่เปิดให้ทุกคน)
// • หลังบรรทัด router.use(requireSession) ทุกเส้นทางต้องมี token ที่ถูกต้อง:
//     /profile (ดู/แก้โปรไฟล์ เปลี่ยนรหัสผ่าน)  /trades  /summary  /statistics
//     /notification-settings  /notifications  /notifications/test
// • เฉพาะ admin (requireAdmin): /admin/users — ดู/สร้าง/แก้/ลบบัญชี และรีเซ็ตรหัสผ่าน
const express = require('express');  // เฟรมเวิร์กเว็บ
const crypto = require('crypto');  // ใช้สุ่ม webhook secret
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');  // จำกัดจำนวนครั้งที่เรียก (กันการเดารหัสผ่าน)
const { notify } = require('./notifications');  // ส่ง Telegram (ใช้ตอนทดสอบการแจ้งเตือน)

const {
  getNotificationSettings,
  updateNotificationSettings
} = require('./notification-settings');

const {
  findUserById,
  findUserByEmail,
  listManagedUsers,
  createManagedUser,
  updateManagedUser,
  deleteManagedUser,
  countActiveAdmins,
  setPassword,
  updateUserProfile
} = require('./users');

const {
  hashPassword,
  verifyPassword,
  passwordProblem,
  isValidEmail,
  createSessionToken,
  verifySessionToken
} = require('./auth');

const {
  listTrades,
  getDailySummary,
  getStatistics
} = require('./pnl/tracker');

const router = express.Router();  // ตัวรวมเส้นทางของ API (server.js เอาไปติดที่ /api)


// [สรุป] ทำอีเมลให้เป็นตัวพิมพ์เล็กและตรวจรูปแบบ กัน "A@x.com" กับ "a@x.com" กลายเป็นสองบัญชี
// คืนอีเมลที่ใช้ได้ หรือ null ถ้ารูปแบบไม่ถูกต้อง
// Emails are stored lowercase and compared case-insensitively, so
// "A@x.com" and "a@x.com" can never become two different accounts.
// Returns the normalized email, or null when it is not a valid address.
function normalizeEmail(value) {
  const email = String(value ?? '').trim().toLowerCase();

  if (!isValidEmail(email)) {
    return null;
  }

  return email;
}

// อีเมลนี้ถูกบัญชีอื่น (ที่ไม่ใช่ตัวเอง) ใช้อยู่แล้วหรือไม่
async function emailTakenByOther(email, userId) {
  const other = await findUserByEmail(email);
  return Boolean(other && other.id !== userId);
}


// =====================================================
// LOGIN RATE LIMITS
// =====================================================
// [สรุป] จำกัดจำนวนครั้งที่ login "ผิด": ต่อ IP ไม่เกิน 10 ครั้ง และต่ออีเมลไม่เกิน 20 ครั้ง ใน
// 15 นาที
// เกินแล้วตอบ 429 — กันการเดารหัสผ่าน (ครั้งที่ login สำเร็จไม่นับ)
// Only FAILED attempts count (skipSuccessfulRequests): someone who mistypes
// a few times is fine, a script guessing passwords gets cut off.
// Counters live in memory, so they reset when the server restarts — fine for
// a single server instance.

const LOGIN_WINDOW_MS = 15 * 60 * 1000;  // ช่วงเวลานับ = 15 นาที (หน่วยมิลลิวินาที)

// ข้อความตอบเมื่อโดนจำกัด (429) พร้อมบอกว่าต้องรอกี่นาที
function tooManyAttempts(req, res) {
  const seconds =
    Number(res.getHeader('Retry-After')) ||
    Math.ceil(LOGIN_WINDOW_MS / 1000);

  const minutes = Math.max(1, Math.ceil(seconds / 60));

  res.status(429).json({
    error:
      `Too many failed login attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`
  });
}

// [สรุป] ตัวจำกัดตาม IP: กันเครื่องเดียวสุ่มรหัสผ่านต่อเนื่อง
// Per IP: stops one machine from guessing.
// (server.js sets "trust proxy" so this is the real client IP, not Render's proxy.)
const loginIpLimiter = rateLimit({
  windowMs: LOGIN_WINDOW_MS,
  limit: 10,  // ผิดได้ไม่เกิน 10 ครั้ง
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: tooManyAttempts
});

// [สรุป] ตัวจำกัดตามอีเมล: กันการเดารหัสผ่านของบัญชีเดียวจากหลาย IP
// Per email: stops one account being guessed from many IPs. The limit is
// higher than the IP one so that hammering a victim's email can only lock
// them out briefly, never for long.
const loginEmailLimiter = rateLimit({
  windowMs: LOGIN_WINDOW_MS,
  limit: 20,  // ผิดได้ไม่เกิน 20 ครั้ง
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    return email ? `email:${email}` : ipKeyGenerator(req.ip);
  },
  handler: tooManyAttempts
});


// =====================================================
// LOGIN
// =====================================================

// [สรุป] POST /login: รับอีเมล + รหัสผ่าน → ค้นผู้ใช้ → ตรวจรหัสผ่านด้วย bcrypt
// ถูกต้องและบัญชีไม่ถูกระงับ → ส่ง JWT token + role (user/admin) กลับไป
// ผิด → 401 "Invalid email or password" (ข้อความเดียวกันทุกกรณี ไม่บอกว่าอีเมลมีอยู่หรือไม่)
router.post('/login', loginIpLimiter, loginEmailLimiter, async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({
        error: 'email and password required'
      });
    }

    const user = await findUserByEmail(email);  // ค้นผู้ใช้จากอีเมล (ไม่สนตัวพิมพ์เล็กใหญ่)

    // Always run the bcrypt comparison, even for an unknown email
    // (verifyPassword burns the same time against a dummy hash), so the
    // response time doesn't tell which emails have accounts.
    const ok =
      await verifyPassword(
        password,
        user ? user.password_hash : null
      ) && !!user;

    if (!ok) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Only someone who knows the password learns the account is suspended —
    // checking earlier would let anyone probe which emails exist.
    if (user.is_active === false) {  // รหัสถูกแต่บัญชีถูกระงับ → แจ้งให้ติดต่อ admin
      return res.status(401).json({ error: 'This account is disabled. Contact an administrator.' });
    }

    console.log(
      `[API /login] Login success: ${user.email} (${user.id})`
    );

    res.json({
      token: createSessionToken(user),  // สร้าง JWT ให้หน้าเว็บเก็บไว้ใช้เรียก API ครั้งต่อไป
      role: user.role || 'user'
    });

  } catch (err) {
    console.error(
      '[API /login] Error:',
      err.message
    );

    res.status(500).json({
      error: err.message
    });
  }
});


// =====================================================
// AUTHENTICATION
// =====================================================

// [สรุป] middleware "ตรวจบัตรผ่าน": อ่าน token จากหัว Authorization: Bearer ... →
// ตรวจลายเซ็นและวันหมดอายุ
// → โหลดผู้ใช้จากฐานข้อมูล → ถ้าไม่พบหรือถูกระงับ ตอบ 401 ถ้าผ่านแนบผู้ใช้ไว้ที่ req.user
// (เช็กกับฐานข้อมูลทุกครั้ง ทำให้การระงับบัญชี/เปลี่ยน role มีผลทันที ไม่ต้องรอ token หมดอายุ)
async function requireSession(req, res, next) {
  try {
    const header =
      req.headers.authorization || '';

    const token =
      header.startsWith('Bearer ')
        ? header.slice(7)
        : null;

    const userId =
      token
        ? verifySessionToken(token)
        : null;

    const user =
      userId
        ? await findUserById(userId)
        : null;

    if (!user || user.is_active === false) {
      return res.status(401).json({
        error: 'Invalid or expired session'
      });
    }

    req.user = user;

    console.log(
      `[API Auth] User: ${user.email} | ID: ${user.id}`
    );

    next();

  } catch (err) {
    console.error(
      '[API Auth] Error:',
      err.message
    );

    res.status(500).json({
      error: err.message
    });
  }
}


// ตั้งแต่บรรทัดนี้ลงไป ทุกเส้นทางต้องมี token ที่ถูกต้อง (/login อยู่ด้านบนจึงไม่ต้องใช้)
router.use(requireSession);

// middleware เช็กสิทธิ์: ต้องเป็น admin เท่านั้น ไม่ใช่ → 403
// ตรวจที่เซิร์ฟเวอร์ทุกครั้ง (ไม่ได้พึ่งแค่การซ่อนปุ่มในหน้าเว็บ)
async function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required' });
  }
  next();
}

// GET /admin/users — รายชื่อบัญชีทั้งหมด (เฉพาะ admin)
router.get('/admin/users', requireAdmin, async (req, res) => {
  try {
    res.json({ users: await listManagedUsers() });
  } catch (err) {
    console.error('[API /admin/users GET] Error:', err.message);
    res.status(500).json({ error: 'Could not load user accounts' });
  }
});

// [สรุป] POST /admin/users — admin สร้างบัญชีใหม่: ตรวจชื่อ อีเมล รหัสผ่าน (กฎใน auth.js) Chat
// ID และอีเมลซ้ำ
// → เข้ารหัสรหัสผ่าน → สุ่ม webhook_secret ให้ → คืนบัญชีที่สร้าง พร้อม secret (แสดงครั้งเดียว
// ไว้ใส่ใน EA)
router.post('/admin/users', requireAdmin, async (req, res) => {
  try {
    const firstName = String(req.body?.first_name || '').trim();
    const lastName = String(req.body?.last_name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const telegramChatId = String(req.body?.telegram_chat_id || '').trim();
    const password = String(req.body?.password || '');

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'First name, last name and email are required' });
    }
    if (firstName.length > 100 || lastName.length > 100) {
      return res.status(400).json({ error: 'Names must be 100 characters or fewer' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Enter a valid email address' });
    }
    const initialPasswordError = passwordProblem(password);
    if (initialPasswordError) {
      return res.status(400).json({ error: initialPasswordError });
    }
    if (telegramChatId && !/^-?\d+$/.test(telegramChatId)) {
      return res.status(400).json({ error: 'Telegram Chat ID must contain only numbers' });
    }
    if (await findUserByEmail(email)) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const webhookSecret = crypto.randomBytes(32).toString('hex');  // สุ่ม secret 64 ตัวอักษร (hex) ไว้ระบุตัวผู้ใช้ตอนยิง webhook
    const user = await createManagedUser({
      firstName,
      lastName,
      email,
      telegramChatId,
      webhookSecret,
      passwordHash: await hashPassword(password)
    });
    res.status(201).json({ user, webhook_secret: webhookSecret });
  } catch (err) {
    if (err.code === '23505') {  // รหัส 23505 = ชน unique index (อีเมลซ้ำ จากการแข่งกันสร้างพร้อมกัน)
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    console.error('[API /admin/users POST] Error:', err.message);
    res.status(500).json({ error: 'Could not create the account' });
  }
});

// [สรุป] PATCH /admin/users/:id — admin แก้บัญชี (ชื่อ อีเมล chat id role เปิด/ระงับ)
// ตรวจข้อมูลทุกฟิลด์ก่อนบันทึก และมีกฎกัน admin ล็อกตัวเอง: ห้ามลดสิทธิ์/ระงับตัวเอง
// และต้องเหลือ admin ที่ใช้งานอยู่อย่างน้อย 1 คนเสมอ
router.patch('/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const current = await findUserById(req.params.id);
    if (!current) return res.status(404).json({ error: 'Account not found' });

    const patch = req.body || {};
    const fields = {};
    for (const key of ['first_name', 'last_name', 'email', 'telegram_chat_id', 'role', 'is_active']) {  // คัดเฉพาะฟิลด์ที่อนุญาตให้แก้
      if (Object.prototype.hasOwnProperty.call(patch, key)) fields[key] = patch[key];
    }
    if (!Object.keys(fields).length) {
      return res.status(400).json({ error: 'No account fields supplied' });
    }

    for (const key of ['first_name', 'last_name']) {
      if (fields[key] !== undefined) {
        fields[key] = String(fields[key]).trim();
        if (!fields[key] || fields[key].length > 100) {
          return res.status(400).json({ error: 'Names are required and must be 100 characters or fewer' });
        }
      }
    }
    if (fields.email !== undefined) {
      fields.email = String(fields.email).trim().toLowerCase();
      if (!isValidEmail(fields.email)) {
        return res.status(400).json({ error: 'Enter a valid email address' });
      }
    }
    if (fields.telegram_chat_id !== undefined) {
      fields.telegram_chat_id = String(fields.telegram_chat_id || '').trim() || null;
      if (fields.telegram_chat_id && !/^-?\d+$/.test(fields.telegram_chat_id)) {
        return res.status(400).json({ error: 'Telegram Chat ID must contain only numbers' });
      }
    }
    if (fields.role !== undefined && !['admin', 'user'].includes(fields.role)) {
      return res.status(400).json({ error: 'Role must be admin or user' });
    }
    if (fields.is_active !== undefined && typeof fields.is_active !== 'boolean') {
      return res.status(400).json({ error: 'is_active must be a boolean' });
    }
    if (
      (fields.email && fields.email.toLowerCase() !== String(current.email || '').toLowerCase() && await findUserByEmail(fields.email))
    ) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // ถ้าการแก้นี้ทำให้ admin หมดสิทธิ์ (เปลี่ยนเป็น user หรือถูกระงับ) ต้องผ่านกฎกัน admin
    // ล็อกตัวเอง
    const becomesInactiveAdmin = current.role === 'admin' && current.is_active !== false && (
      fields.role === 'user' || fields.is_active === false
    );
    if (becomesInactiveAdmin) {
      if (current.id === req.user.id) {
        return res.status(400).json({ error: 'You cannot remove your own administrator access' });
      }
      if (await countActiveAdmins() <= 1) {
        return res.status(400).json({ error: 'At least one active administrator must remain' });
      }
    }

    const user = await updateManagedUser(req.params.id, fields);
    if (!user) return res.status(404).json({ error: 'Account not found' });
    res.json({ user });
  } catch (err) {
    if (err.code === '23505') {  // อีเมลซ้ำ (ชน unique index)
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    console.error('[API /admin/users PATCH] Error:', err.message);
    res.status(500).json({ error: 'Could not update the account' });
  }
});

// [สรุป] DELETE /admin/users/:id — ลบบัญชีถาวร (พร้อมประวัติเทรดและการตั้งค่า)
// ห้ามลบตัวเอง และห้ามลบ admin คนสุดท้ายที่ยังใช้งานอยู่
router.delete('/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const target = await findUserById(req.params.id);
    if (!target) return res.status(404).json({ error: 'Account not found' });

    if (target.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }
    if (target.role === 'admin' && target.is_active !== false && await countActiveAdmins() <= 1) {
      return res.status(400).json({ error: 'At least one active administrator must remain' });
    }

    await deleteManagedUser(target.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('[API /admin/users DELETE] Error:', err.message);
    res.status(500).json({ error: `Could not delete the account: ${err.message}` });
  }
});

// POST /admin/users/:id/reset-password — admin ตั้งรหัสผ่านใหม่ให้บัญชี (ตรวจกฎรหัสผ่านก่อน
// แล้วเก็บเป็น hash)
router.post('/admin/users/:id/reset-password', requireAdmin, async (req, res) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Account not found' });

    const password = String(req.body?.password || '');
    const resetPasswordError = passwordProblem(password);
    if (resetPasswordError) {
      return res.status(400).json({ error: resetPasswordError });
    }
    await setPassword(user.id, {
      email: user.email,
      passwordHash: await hashPassword(password)
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('[API /admin/users/:id/reset-password] Error:', err.message);
    res.status(500).json({ error: 'Could not reset the password' });
  }
});

// =====================================================
// NOTIFICATION SETTINGS
// =====================================================

// GET /notification-settings — การตั้งค่าแจ้งเตือนของผู้ใช้ที่ login อยู่ (หน้า "การแจ้งเตือน"
// และ Dashboard ใช้)
router.get('/notification-settings', async (req, res) => {
  try {
    const settings =
      await getNotificationSettings(
        req.user.id
      );

    res.json({
      settings
    });

  } catch (err) {
    console.error(
      '[API /notification-settings GET] Error:',
      err.message
    );

    res.status(500).json({
      error: err.message
    });
  }
});


// PATCH /notification-settings — บันทึกการตั้งค่า (รับเฉพาะฟิลด์ที่ notification-settings.js
// อนุญาต)
router.patch('/notification-settings', async (req, res) => {
  try {
    const settings =
      await updateNotificationSettings(
        req.user.id,
        req.body || {}
      );

    console.log(
      `[API /notification-settings PATCH] Updated for user: ${req.user.id}`
    );

    res.json({
      ok: true,
      settings
    });

  } catch (err) {
    console.error(
      '[API /notification-settings PATCH] Error:',
      err.message
    );

    res.status(500).json({
      error: err.message
    });
  }
});

// =====================================================
// TRADES
// =====================================================

// GET /trades?limit=N — รายการเทรดของผู้ใช้ เรียงใหม่ → เก่า (หน้า Dashboard / ประวัติเทรด /
// รายงานใช้)
router.get('/trades', async (req, res) => {
  try {
    // อ่านจำนวนที่ขอจาก query string (ค่าเริ่มต้น 50, สูงสุด 1000) กันการขอข้อมูลมากเกินไป
    const limit = Math.min(
      parseInt(req.query.limit, 10) || 50,
      1000
    );

    console.log(
      `[API /trades] Loading trades for user: ${req.user.id}`
    );

    const trades =
      await listTrades(
        req.user.id,
        limit
      );

    console.log(
      `[API /trades] Found ${trades.length} trades`
    );

    res.json({
      trades
    });

  } catch (err) {
    console.error(
      '[API /trades] Error:',
      err.message
    );

    res.status(500).json({
      error: err.message
    });
  }
});


// =====================================================
// SUMMARY
// =====================================================

// GET /summary — สรุปผลเทรดของวันนี้ (จำนวนเทรด ชนะ แพ้ กำไรสุทธิ)
router.get('/summary', async (req, res) => {
  try {
    const summary =
      await getDailySummary(
        req.user.id
      );

    res.json(summary);

  } catch (err) {
    console.error(
      '[API /summary] Error:',
      err.message
    );

    res.status(500).json({
      error: err.message
    });
  }
});


// =====================================================
// STATISTICS
// =====================================================

// GET /statistics — สถิติรวมจากเทรดที่ปิดแล้ว (Win Rate, Profit Factor ฯลฯ) หน้า Statistics /
// Reports ใช้
router.get('/statistics', async (req, res) => {
  try {
    console.log(
      `[API /statistics] Loading statistics for user: ${req.user.id}`
    );

    const stats =
      await getStatistics(
        req.user.id
      );

    console.log(
      `[API /statistics] Total trades: ${stats.totalTrades}`
    );

    res.json(stats);

  } catch (err) {
    console.error(
      '[API /statistics] Error:',
      err.message
    );

    res.status(500).json({
      error: err.message
    });
  }
});


// =====================================================
// PROFILE
// =====================================================

// ตัดฟิลด์ลับ (webhook_secret, password_hash) ออกก่อนส่งข้อมูลผู้ใช้ให้หน้าเว็บ —
// ห้ามส่งสองตัวนี้ออกไปเด็ดขาด
function toProfile(user) {
  const {
    webhook_secret,
    password_hash,
    ...profile
  } = user;

  return profile;
}


// GET /profile — ข้อมูลของผู้ใช้ที่ login อยู่ (ทุกหน้าเรียกเพื่อรู้ชื่อ, role, Chat ID)
router.get('/profile', (req, res) => {
  res.json(
    toProfile(req.user)
  );
});


// =====================================================
// UPDATE PROFILE
// =====================================================

// [สรุป] PATCH /profile — ผู้ใช้แก้ข้อมูลของตัวเอง: ชื่อ นามสกุล อีเมล Telegram Chat ID
// และเปลี่ยนรหัสผ่าน
// (เปลี่ยนรหัสต้องส่งรหัสผ่านปัจจุบันมาด้วย) ตรวจข้อมูลทุกอย่างให้ผ่านก่อน แล้วค่อยบันทึก
// จะได้ไม่เกิดกรณีเปลี่ยนรหัสผ่านไปแล้วแต่แก้อีเมลไม่ผ่าน
router.patch('/profile', async (req, res) => {
  try {
    // แยกรหัสผ่านออกจากฟิลด์ข้อมูลทั่วไป (profileFields = ฟิลด์ที่เหลือ)
    const {
      password,
      current_password,
      ...profileFields
    } = req.body || {};

    // Validate everything before changing anything, so a rejected email
    // can't leave the password already updated.
    for (const key of ['first_name', 'last_name']) {
      if (profileFields[key] !== undefined) {
        profileFields[key] = String(profileFields[key]).trim();

        if (profileFields[key].length > 100) {
          return res.status(400).json({
            error: 'Names must be 100 characters or fewer'
          });
        }
      }
    }

    if (profileFields.email !== undefined) {
      const email = normalizeEmail(profileFields.email);

      if (!email) {
        return res.status(400).json({
          error: 'Enter a valid email address'
        });
      }

      if (await emailTakenByOther(email, req.user.id)) {
        return res.status(409).json({
          error: 'An account with this email already exists'
        });
      }

      profileFields.email = email;
    }

    if (password !== undefined && password !== null && password !== '') {
      const passwordError = passwordProblem(password);
      if (passwordError) {
        return res.status(400).json({ error: passwordError });
      }
    }

    if (profileFields.telegram_chat_id !== undefined) {
      const chatId = String(profileFields.telegram_chat_id || '').trim();

      if (chatId && !/^-?\d+$/.test(chatId)) {
        return res.status(400).json({
          error: 'Telegram Chat ID must be a number'
        });
      }

      profileFields.telegram_chat_id = chatId || null;
    }

    // เปลี่ยนรหัสผ่าน: ต้องเทียบ "รหัสผ่านปัจจุบัน" ถูกต้องก่อน
    // แล้วจึงเข้ารหัสรหัสใหม่และบันทึก
    if (password) {
      const ok =
        await verifyPassword(
          current_password || '',
          req.user.password_hash
        );

      if (!ok) {
        return res.status(400).json({
          error: 'Invalid current password'
        });
      }

      await setPassword(
        req.user.id,
        {
          email: req.user.email,
          passwordHash:
            await hashPassword(password)
        }
      );
    }

    // บันทึกฟิลด์ที่แก้ (ถ้ามี) แล้วคืนโปรไฟล์ล่าสุด (ไม่รวมความลับ)
    const updated =
      Object.keys(profileFields).length > 0
        ? await updateUserProfile(
            req.user.id,
            profileFields
          )
        : await findUserById(
            req.user.id
          );

    res.json(
      toProfile(updated)
    );

  } catch (err) {
    // Unique index on lower(email) — lost a race with another sign-up
    if (err.code === '23505') {  // อีเมลซ้ำ (ชน unique index)
      return res.status(409).json({
        error: 'An account with this email already exists'
      });
    }

    console.error(
      '[API /profile] Error:',
      err.message
    );

    res.status(500).json({
      error: err.message
    });
  }
});


// =====================================================
// NOTIFICATION MESSAGE
// =====================================================

// สร้างข้อความสั้น ๆ ของแต่ละเทรด เพื่อแสดงในรายการ "การแจ้งเตือนล่าสุด" บนหน้าเว็บ
// (ไม่ได้ส่ง Telegram — ข้อความที่ส่งจริงสร้างใน trade-message.js)
function notificationMessage(trade) {
    if (trade.status === 'closed') {
        const pnl =
            trade.pnl != null
                ? (trade.pnl >= 0 ? '+' : '') + `$${trade.pnl}`
                : '';

        return `🔔 Trade Closed

Action: ${trade.action.toUpperCase()}
Symbol: ${trade.symbol}
Close Price: ${trade.price}
P/L: ${pnl}
Status: CLOSED`;
    }

    return `🔔 Trade Opened

Action: ${trade.action.toUpperCase()}
Symbol: ${trade.symbol}
Price: ${trade.price}
Status: OPEN`;
}


// =====================================================
// NOTIFICATIONS
// =====================================================

// GET /notifications — รายการแจ้งเตือนล่าสุดของผู้ใช้ (สร้างจากเทรดล่าสุด) สูงสุด 100 รายการ
router.get('/notifications', async (req, res) => {
  try {
    const limit = Math.min(
      parseInt(req.query.limit, 10) || 20,
      100
    );

    const trades =
      await listTrades(
        req.user.id,
        limit
      );

    const notifications =
      trades.map((t) => ({
        type: t.action,
        status: t.status,
        symbol: t.symbol,
        message: notificationMessage(t),
        timestamp:
          t.status === 'closed'
            ? t.closed_at
            : t.timestamp
      }));

    res.json({
      notifications
    });

  } catch (err) {
    console.error(
      '[API /notifications] Error:',
      err.message
    );

    res.status(500).json({
      error: err.message
    });
  }
});


// =====================================================
// TEST TELEGRAM
// =====================================================

// POST /notifications/test — ส่งข้อความทดสอบเข้า Telegram ของผู้ใช้ เพื่อเช็กว่า Chat ID
// ถูกและบอทส่งข้อความได้
router.post('/notifications/test', async (req, res) => {
  try {
    const chatId = req.user.telegram_chat_id;

    if (!chatId) {
      return res.status(400).json({
        error: 'Telegram Chat ID is not configured'
      });
    }

    const message = [
      '<b>TradeAnalytics Test</b>',
      '',
      'Telegram notification is working.',
      `User: ${req.user.name || req.user.email}`,
      `Time: ${new Date().toLocaleString('th-TH', {
        timeZone: process.env.TIMEZONE || 'Asia/Bangkok'
      })}`
    ].join('\n');

    await notify(message, chatId);

    console.log(
      `[API /notifications/test] Telegram sent to user: ${req.user.id}`
    );

    res.json({
      ok: true,
      message: 'Test Telegram message sent successfully'
    });

  } catch (err) {
    console.error(
      '[API /notifications/test] Error:',
      err.message
    );

    res.status(500).json({
      error: err.message
    });
  }
});


// ส่งออก router ให้ server.js ติดที่ /api
module.exports = router;
