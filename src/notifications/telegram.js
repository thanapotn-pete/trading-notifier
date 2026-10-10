// telegram.js — ส่งข้อความผ่าน Telegram Bot API
// ใช้ fetch ตรง ๆ ไม่พึ่งไลบรารีบอท (ตัดช่องโหว่ของไลบรารีเก่าออก) token ของบอทอยู่ใน env
// TELEGRAM_BOT_TOKEN
// Sends a message through the Telegram Bot API (https://core.telegram.org/bots/api#sendmessage).
// Plain fetch — Node 18+ has it built in, so no bot library is needed.

// รอ Telegram ตอบไม่เกิน 15 วินาที เกินแล้วยกเลิก ไม่ให้เซิร์ฟเวอร์ค้างรอ
const REQUEST_TIMEOUT_MS = 15000;

// ส่งข้อความ (HTML) ไปยัง chat id ที่ระบุ — ไม่สำเร็จจะ throw error ให้ผู้เรียกจัดการ
async function sendTelegram(message, chatId) {
  if (!chatId) throw new Error('chatId is required');  // ไม่มีผู้รับ ส่งไม่ได้

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN must be set');  // ไม่ได้ตั้ง token ของบอทใน env

  // เรียก API sendMessage ของ Telegram (token อยู่ใน URL)
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',  // ให้ใช้แท็ก <b> ตัวหนา ฯลฯ ในข้อความได้
      disable_web_page_preview: true  // ไม่แสดงตัวอย่างลิงก์ใต้ข้อความ
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)  // ตัดการเชื่อมต่อเมื่อเกินเวลา
  });

  let data = null;  // ผลตอบกลับของ Telegram เป็น JSON
  try { data = await response.json(); } catch { /* non-JSON error page */ }

  // Telegram ตอบว่าไม่สำเร็จ (เช่น ผู้ใช้บล็อกบอท, chat id ผิด) → throw error
  // ข้อความ error ไม่ใส่ token เพื่อไม่ให้ความลับหลุดลง log
  if (!response.ok || !data || data.ok !== true) {
    // The URL contains the token — never put it in the error
    const reason = data?.description || `HTTP ${response.status}`;
    throw new Error(`Telegram sendMessage failed: ${reason}`);
  }
}

// ส่งออกให้ notifications/index.js เรียกใช้
module.exports = { sendTelegram };
