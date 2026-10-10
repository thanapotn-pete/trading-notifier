// users.js — ชั้น "เข้าถึงข้อมูลผู้ใช้" (ตาราง users ใน Supabase)
// ทุกฟังก์ชันอ่าน/เขียนฐานข้อมูลที่นี่ที่เดียว ส่วนอื่น (api.js, server.js, scheduler.js)
// เรียกใช้แทนการ query เอง
// ใช้ service key ฝั่งเซิร์ฟเวอร์เท่านั้น (ข้าม RLS) — ไม่เคยส่ง key นี้ไปที่เบราว์เซอร์
const { createClient } = require('@supabase/supabase-js');

// สร้างตัวเชื่อมต่อ Supabase จากค่าใน env ถ้า env ไม่ครบจะ throw error ที่บอกชื่อตัวแปรที่ขาด
function getClient() {
  const url = process.env.SUPABASE_URL;
  // Server-side only: the service key bypasses RLS, so never send it to the browser.
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
  return createClient(url, key);
}

// หาผู้ใช้จาก webhook secret — ใช้ตอนรับ webhook จาก EA/TradingView เพื่อรู้ว่าเป็นของใคร
// เฉพาะบัญชีที่ active (บัญชีที่ถูกระงับยิง webhook ไม่ได้) ไม่พบ → null
async function findUserBySecret(secret) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('webhook_secret', secret)
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// รายชื่อผู้ใช้ที่ active และตั้ง Telegram chat id แล้ว — ใช้ตอนส่งสรุปรายวัน/รายสัปดาห์
async function listUsers() {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('is_active', true)
    .not('telegram_chat_id', 'is', null);
  if (error) throw error;
  return data;
}

// หาผู้ใช้จาก id — ใช้ทุก request ของ API เพื่อเช็กว่าเจ้าของ token ยังมีอยู่และไม่ถูกระงับ
async function findUserById(id) {
  const supabase = getClient();
  const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

// หาผู้ใช้จากอีเมล (ใช้ตอน login และตรวจอีเมลซ้ำ) เทียบแบบไม่สนตัวพิมพ์เล็กใหญ่
async function findUserByEmail(email) {
  const supabase = getClient();
  // Case-insensitive match (ilike); escape wildcard characters so the email is literal.
  const pattern = String(email).replace(/[\\%_]/g, '\\$&');  // escape ตัวอักษร \ % _ ไม่ให้ถูกตีความเป็น wildcard ของ ilike
  const { data, error } = await supabase.from('users').select('*').ilike('email', pattern).maybeSingle();
  if (error) throw error;
  return data;
}

// รายชื่อบัญชีทั้งหมดสำหรับหน้า admin — เลือกเฉพาะคอลัมน์ที่ปลอดภัย (ไม่รวม password_hash,
// webhook_secret)
// เรียงจากใหม่ไปเก่า
async function listManagedUsers() {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, name, first_name, last_name, email, telegram_chat_id, role, is_active, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// admin สร้างบัญชีใหม่ (role เป็น user เสมอ, เปิดใช้งานทันที)
// และคืนข้อมูลแถวที่สร้างโดยไม่รวมความลับ
async function createManagedUser({ firstName, lastName, email, telegramChatId, webhookSecret, passwordHash }) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('users')
    .insert({
      name: `${firstName} ${lastName}`,
      first_name: firstName,
      last_name: lastName,
      email,
      telegram_chat_id: telegramChatId || null,
      webhook_secret: webhookSecret,
      role: 'user',
      is_active: true,
      password_hash: passwordHash
    })
    .select('id, name, first_name, last_name, email, telegram_chat_id, role, is_active, created_at')
    .single();
  if (error) throw error;
  return data;
}

// admin แก้ข้อมูลบัญชี (ชื่อ, อีเมล, chat id, role, เปิด/ระงับ)
// ถ้าแก้ชื่อหรือนามสกุล จะประกอบฟิลด์ name ใหม่ให้อัตโนมัติ
async function updateManagedUser(userId, fields) {
  const supabase = getClient();
  const update = {};
  for (const key of ['first_name', 'last_name', 'email', 'telegram_chat_id', 'role', 'is_active']) {  // รับเฉพาะฟิลด์ที่อนุญาต ฟิลด์อื่นถูกเมิน
    if (fields[key] !== undefined) update[key] = fields[key];
  }

  // ถ้าไม่มีฟิลด์ที่แก้ได้ส่งมาเลย ให้คืนแถวเดิม (การ update ด้วยข้อมูลว่างจะ error)
  // Nothing editable was sent: return the row as it is instead of an empty update
  if (Object.keys(update).length === 0) {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  }
  // ประกอบชื่อเต็ม (name) ใหม่ จากชื่อ + นามสกุล (ค่าที่ไม่ได้ส่งมาใช้ค่าเดิมในฐานข้อมูล)
  if (update.first_name !== undefined || update.last_name !== undefined) {
    const current = await findUserById(userId);
    if (!current) return null;
    update.name = `${update.first_name ?? current.first_name ?? ''} ${update.last_name ?? current.last_name ?? ''}`.trim();
  }

  const { data, error } = await supabase
    .from('users')
    .update(update)
    .eq('id', userId)
    .select('id, name, first_name, last_name, email, telegram_chat_id, role, is_active, created_at')
    .maybeSingle();
  if (error) throw error;
  return data;
}

// [สรุป] ลบบัญชีพร้อมเทรดและการตั้งค่า ด้วยฟังก์ชัน SQL (delete_user_cascade) ที่ทำเป็น
// transaction เดียว
// คือ "ลบครบทั้งหมด หรือไม่ลบเลย" ไม่เกิดกรณีลบประวัติเทรดไปแล้วแต่บัญชียังอยู่
// Removes the account together with its trades and notification settings.
// Done by the delete_user_cascade() SQL function (supabase/schema.sql) so the
// three deletes run in ONE transaction: if any step fails nothing is removed,
// instead of wiping the trade history and then leaving the account behind.
async function deleteManagedUser(userId) {
  const supabase = getClient();
  const { error } = await supabase.rpc('delete_user_cascade', { p_user_id: userId });  // เรียกฟังก์ชันที่เขียนไว้ใน Supabase (supabase/schema.sql)
  if (error) throw new Error(error.message);
}

// นับ admin ที่ยังใช้งานอยู่ — ใช้กันไม่ให้ลบ/ลดสิทธิ์/ระงับ admin คนสุดท้าย
async function countActiveAdmins() {
  const supabase = getClient();
  const { count, error } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })  // ขอเฉพาะ "จำนวนแถว" ไม่ดึงข้อมูลมาจริง
    .eq('role', 'admin')
    .eq('is_active', true);
  if (error) throw error;
  return count || 0;
}

// ตั้ง/เปลี่ยนรหัสผ่าน (รับเป็น hash ที่เข้ารหัสแล้ว) — ใช้ตอนผู้ใช้เปลี่ยนรหัสเอง และตอน admin
// รีเซ็ตรหัสผ่าน
async function setPassword(userId, { email, passwordHash }) {
  const supabase = getClient();
  const { error } = await supabase
    .from('users')
    .update({ email, password_hash: passwordHash })
    .eq('id', userId);
  if (error) throw error;
}

// ฟิลด์ที่ "ผู้ใช้แก้ไขเองได้" ผ่านหน้าโปรไฟล์ — ไม่รวม role และ is_active ซึ่งแก้ได้เฉพาะ
// admin
const PROFILE_FIELDS = ['first_name', 'last_name', 'email', 'telegram_chat_id'];

// ผู้ใช้แก้ข้อมูลของตัวเอง: รับเฉพาะฟิลด์ใน PROFILE_FIELDS ที่ส่งมา
async function updateUserProfile(userId, fields) {
  const supabase = getClient();
  const update = {};
  for (const key of PROFILE_FIELDS) {
    if (fields[key] !== undefined) update[key] = fields[key];
  }

  // ถ้าไม่มีฟิลด์ที่เปลี่ยนส่งมา ให้คืนแถวเดิม
  // Nothing editable was sent: return the row as it is instead of an empty update
  if (Object.keys(update).length === 0) {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('users')
    .update(update)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ส่งออกฟังก์ชันทั้งหมดให้ไฟล์อื่นเรียกใช้
module.exports = {
  findUserBySecret,
  findUserById,
  findUserByEmail,
  listManagedUsers,
  createManagedUser,
  updateManagedUser,
  deleteManagedUser,
  countActiveAdmins,
  setPassword,
  listUsers,
  updateUserProfile,
};
