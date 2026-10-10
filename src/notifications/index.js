// notifications/index.js — จุดเดียวที่ส่วนอื่นเรียกเพื่อ "ส่งข้อความแจ้งเตือน" (notify)
// ตอนนี้ส่งผ่าน Telegram เท่านั้น ถ้าจะเพิ่มช่องทางอื่น (เช่น LINE, อีเมล)
// ให้เพิ่มที่ฟังก์ชันนี้
const { sendTelegram } = require('./telegram');

// message = ข้อความ (HTML), chatId = Telegram chat id ของผู้รับ
async function notify(message, chatId) {
  await sendTelegram(message, chatId);
}

module.exports = { notify };
