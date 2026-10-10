// risk-alert.js — ตรรกะ "เตือนความเสี่ยง (Drawdown)"
// Drawdown = ค่าที่ equity ลดลงจากจุดสูงสุด (%) EA ส่งค่านี้มาทุกครั้งที่เปลี่ยน
// ถ้าส่งต่อทุกครั้งผู้ใช้จะโดนเตือนถี่มาก
// ไฟล์นี้จึงทำให้ "เตือนครั้งเดียวตอนที่ถึงเกณฑ์"
// และจะเตือนอีกก็ต่อเมื่อค่าลดลงต่ำกว่าเกณฑ์แล้วกลับมาถึงใหม่
// Decides when a drawdown reading should raise a Risk Alert.
//
// The EA reports drawdown every time it moves by 0.5 points, so without this
// the user would get a message each time. Instead: ONE alert when drawdown
// reaches the limit, and no more until it has recovered below the limit and
// crosses it again.
//
// State is kept in memory. If the server restarts while an alert is active,
// the next reading above the limit alerts once more — acceptable for a
// single repeated message, and it avoids a database column for this.

// ระยะห่างที่ต้องลดต่ำกว่าเกณฑ์ ก่อนจะนับว่า "หายแล้ว" และพร้อมเตือนรอบใหม่
// (กันเตือนรัวเมื่อค่าแกว่งรอบเกณฑ์)
const REARM_MARGIN = 0.5; // points below the limit needed before the next alert

// เก็บ id ผู้ใช้ที่ "เตือนไปแล้ว" ในรอบที่ drawdown สูงอยู่ (เก็บในหน่วยความจำ
// รีสตาร์ทเซิร์ฟเวอร์แล้วหาย)
const active = new Set(); // userIds with an alert already sent for the current breach

// [สรุป] ตัดสินใจจากค่า drawdown ล่าสุด: ยังไม่เคยเตือนและถึงเกณฑ์ → 'alert',
// เคยเตือนแล้วแต่ลดลงต่ำกว่าเกณฑ์ → 'rearm', อื่น ๆ → 'none'
// Returns 'alert' | 'rearm' | 'none'.
// 'alert' does NOT mark the user as alerted — call markAlerted() once the
// message was really sent, so a failed Telegram call is retried on the next reading.
function evaluateDrawdown(userId, drawdown, limit) {
  const alerted = active.has(userId);

  if (!alerted && drawdown >= limit) return 'alert';

  if (alerted && drawdown < limit - REARM_MARGIN) {
    active.delete(userId);
    return 'rearm';
  }

  return 'none';
}

// บันทึกว่าเตือนผู้ใช้คนนี้แล้ว — เรียกหลังส่ง Telegram สำเร็จเท่านั้น (ถ้าส่งไม่สำเร็จ
// รอบหน้าจะลองเตือนใหม่)
function markAlerted(userId) {
  active.add(userId);
}

// ล้างสถานะทั้งหมด (ใช้ตอนทดสอบ)
function resetRiskState() {
  active.clear();
}

// ส่งออกให้ server.js ใช้ในเส้นทาง /webhook/mt5/drawdown
module.exports = { evaluateDrawdown, markAlerted, resetRiskState, REARM_MARGIN };
