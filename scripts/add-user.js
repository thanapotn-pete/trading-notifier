// scripts/add-user.js — สคริปต์บรรทัดคำสั่งสำหรับ "ผู้ดูแล" เพิ่มผู้ใช้ใหม่ลงฐานข้อมูลโดยตรง
// (อีกทางหนึ่งคือสร้างผ่านหน้าเว็บ "จัดการบัญชี") รันด้วย: node scripts/add-user.js "ชื่อ"
// "chat_id" ["อีเมล" "รหัสผ่าน"]
// สคริปต์จะสุ่ม webhook_secret ให้ — นำไปใส่ใน EA ของผู้ใช้
// Register a friend to share this server/database.
// Usage: node scripts/add-user.js "<name>" "<telegram_chat_id>" ["<email>" "<password>"]
// Email/password are optional — set them now so the user can log in to the
// website, or leave them out and have an administrator set the password on the
// account-management page.
require('dotenv').config();
const crypto = require('crypto');  // ใช้สุ่ม webhook secret
const { createClient } = require('@supabase/supabase-js');  // ไลบรารีเชื่อมต่อ Supabase
const { hashPassword } = require('../src/auth');  // ฟังก์ชันเข้ารหัสรหัสผ่านตัวเดียวกับที่ระบบ login ใช้

async function main() {
  const [name, chatId, email, password] = process.argv.slice(2);  // อ่านอาร์กิวเมนต์จากบรรทัดคำสั่ง (อีเมล/รหัสผ่านไม่บังคับ)
  // ถ้าข้อมูลไม่ครบ แสดงวิธีใช้แล้วออกจากโปรแกรม
  if (!name || !chatId) {
    console.error('Usage: node scripts/add-user.js "<name>" "<telegram_chat_id>" ["<email>" "<password>"]');
    process.exit(1);
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
  const supabase = createClient(url, key);  // ใช้ service key (ข้าม RLS ได้) เพราะสคริปต์นี้รันบนเครื่องผู้ดูแลเท่านั้น

  const webhookSecret = crypto.randomBytes(16).toString('hex');  // สุ่ม secret 32 ตัวอักษร (hex) — ใช้ระบุตัวผู้ใช้เวลา EA/TradingView ยิง webhook
  const row = { name, telegram_chat_id: chatId, webhook_secret: webhookSecret };
  if (email && password) {
    row.email = email;
    row.password_hash = await hashPassword(password);  // เก็บเป็น hash ไม่เก็บรหัสผ่านจริง
  }

  const { error } = await supabase.from('users').insert(row);  // เพิ่มแถวใหม่ในตาราง users
  if (error) throw error;

  console.log(`Registered "${name}"`);
  console.log(`webhook_secret: ${webhookSecret}`);
  if (email && password) {
    console.log(`Website login ready — email: ${email}, password: ${password}`);
  }
}

// รัน main() ถ้า error ให้แสดงข้อความแล้วออกด้วยรหัส 1
main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
