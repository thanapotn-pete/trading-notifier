// auth.js — ระบบยืนยันตัวตน
// • เข้ารหัส/ตรวจรหัสผ่านด้วย bcrypt  • ตรวจรูปแบบรหัสผ่านและอีเมล
// • สร้าง/ตรวจ JWT token ซึ่งเป็น "บัตรผ่าน" ที่หน้าเว็บเก็บไว้หลัง login
// ใช้โดย src/api.js (login, จัดการบัญชี) และ scripts/add-user.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SESSION_TTL = '30d';  // อายุของ session = 30 วัน หลังจากนั้นต้อง login ใหม่

// อ่านกุญแจลับที่ใช้เซ็น JWT จาก env (JWT_SECRET) ถ้าไม่ได้ตั้งค่าจะ throw error
// เพื่อไม่ให้ระบบทำงานโดยไม่มีกุญแจ (ใครรู้กุญแจนี้จะปลอม token ได้)
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET must be set');
  return secret;
}

// เข้ารหัสรหัสผ่านด้วย bcrypt (cost 10) ก่อนเก็บลงฐานข้อมูล
// ฐานข้อมูลไม่เคยเก็บรหัสผ่านจริง เก็บแต่ค่า hash ซึ่งย้อนกลับเป็นรหัสเดิมไม่ได้
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// [สรุป] hash หลอกสำหรับเทียบเวลา: ถ้าอีเมลไม่มีในระบบก็ยังคำนวณ bcrypt เท่ากัน
// ทำให้เวลาตอบของ login ไม่เปิดเผยว่าอีเมลไหนมีบัญชีอยู่
// Compared against when the account doesn't exist (or has no password), so a
// login for an unknown email costs the same bcrypt time as a real one and
// response timing doesn't reveal which emails have accounts.
const DUMMY_HASH = bcrypt.hashSync('timing-equalizer', 10);

// ตรวจรหัสผ่านที่ผู้ใช้กรอกกับ hash ในฐานข้อมูล → true/false
// ถ้าไม่มี hash (ไม่มีบัญชี/ยังไม่ตั้งรหัส) จะเทียบกับ hash หลอกแล้วคืน false
async function verifyPassword(password, hash) {
  if (!hash) {
    await bcrypt.compare(password, DUMMY_HASH);
    return false;
  }
  return bcrypt.compare(password, hash);
}

// [สรุป] กฎรหัสผ่าน: ยาว 8-72 ตัวอักษร ใช้ได้เฉพาะอังกฤษ/ตัวเลข/สัญลักษณ์ (ASCII)
// เหตุผล: bcrypt อ่านแค่ 72 "ไบต์" แรก ถ้าเป็นภาษาไทย 1 ตัวนับ 3 ไบต์จะถูกตัดเงียบ ๆ
// Passwords: printable ASCII only (English letters, digits, symbols, space),
// 8-72 characters. ASCII also keeps every character at 1 byte, which matters
// because bcrypt only reads the first 72 BYTES of a password.
// คืนข้อความ error (ภาษาอังกฤษ) ถ้ารหัสผ่านไม่ผ่านกฎ หรือ null ถ้าผ่าน
function passwordProblem(password) {
  if (typeof password !== 'string' || password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (password.length > 72) {
    return 'Password must be at most 72 characters';
  }
  if (!/^[ -~]+$/.test(password)) {
    return 'Password may only contain English letters, digits and symbols';
  }
  return null;
}

// [สรุป] กฎอีเมล: ASCII เท่านั้น มี @ ตัวเดียว และมีจุดในส่วนโดเมน (เช่น name@example.com)
// Emails: ASCII only, exactly one "@", a dot in the domain, no spaces.
const EMAIL_PATTERN = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;

// ตรวจอีเมล: ต้องเป็นข้อความ, ยาวไม่เกิน 254 ตัว (ตามมาตรฐาน) และตรงกับรูปแบบข้างบน
function isValidEmail(email) {
  return typeof email === 'string' && email.length <= 254 && EMAIL_PATTERN.test(email);
}

// สร้าง JWT ที่ใส่ id ผู้ใช้ไว้ (sub) เซ็นด้วยกุญแจลับ + กำหนดวันหมดอายุ
// หน้าเว็บเก็บ token นี้แล้วส่งไปทุกครั้งที่เรียก API (หัว Authorization: Bearer ...)
function createSessionToken(user) {
  return jwt.sign({ sub: user.id }, getJwtSecret(), { expiresIn: SESSION_TTL });
}

// [สรุป] ตรวจ token: ถูกต้องและยังไม่หมดอายุ → คืน id ผู้ใช้ / ไม่ผ่าน → null (ไม่ throw)
// Returns the user id from a valid Bearer token, or null if missing/invalid/expired.
function verifySessionToken(token) {
  try {
    const payload = jwt.verify(token, getJwtSecret());
    return payload.sub;
  } catch {
    return null;
  }
}

// ส่งออกฟังก์ชันให้ไฟล์อื่นเรียกใช้ผ่าน require('./auth')
module.exports = { hashPassword, verifyPassword, passwordProblem, isValidEmail, createSessionToken, verifySessionToken };
