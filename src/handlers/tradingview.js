// handlers/tradingview.js — รับ alert จาก TradingView (ผ่านเส้นทาง /webhook/tradingview ใน
// server.js)
// แล้วแปลงเป็นข้อความ Telegram ส่งให้เจ้าของ secret
// หมายเหตุ: เส้นทางนี้ "ไม่บันทึกเทรดลงฐานข้อมูล" และไม่ตรวจการตั้งค่าแจ้งเตือน (ต่างจากเส้นทาง
// MT5)
const { notify } = require('../notifications');

// [สรุป] รูปแบบ JSON ที่ TradingView ต้องส่งมา (ตั้งในช่อง Message ของ alert) —
// secret ใช้ระบุว่าเป็นผู้ใช้คนไหน
// TradingView alert payload format:
// {
//   "secret": "...",
//   "action": "buy" | "sell" | "tp" | "sl" | "close",
//   "symbol": "BTCUSDT",
//   "price": 65000,
//   "tp": 66000,
//   "sl": 64000,
//   "pnl": 150.5        // optional, for close/tp/sl
// }

// แปลงค่า action ที่ส่งมาเป็นหัวข้อข้อความพร้อมอีโมจิ
const ACTION_EMOJI = {
  buy:   '🟢 BUY',
  sell:  '🔴 SELL',
  tp:    '✅ TAKE PROFIT',
  sl:    '🛑 STOP LOSS',
  close: '⬛ CLOSE',
};

// สร้างข้อความจาก payload แล้วส่งให้ผู้ใช้ (user มาจาก server.js หลังตรวจ secret แล้ว)
async function handleTradingViewAlert(payload, user) {
  const { action, symbol, price, tp, sl, pnl } = payload;  // แยกค่าที่ต้องใช้ออกจาก payload

  const emoji = ACTION_EMOJI[action?.toLowerCase()] || '📊 ALERT';  // ถ้า action ไม่รู้จัก ใช้หัวข้อทั่วไป "ALERT"
  const lines = [
    `${emoji}`,
    `Symbol: <b>${symbol}</b>`,
    `Price: <b>${price}</b>`,
  ];

  if (tp)   lines.push(`TP: ${tp}`);  // แสดง TP/SL/P&L เฉพาะที่ TradingView ส่งมาให้
  if (sl)   lines.push(`SL: ${sl}`);
  if (pnl !== undefined) lines.push(`P&L: <b>${pnl > 0 ? '+' : ''}${pnl}</b>`);
  // เวลาที่ส่ง ตามเขตเวลาที่ตั้งไว้ใน env (ค่าเริ่มต้น Asia/Bangkok)
  const time = new Date().toLocaleTimeString('th-TH', {
    timeZone: process.env.TIMEZONE || 'Asia/Bangkok',
    hour: '2-digit',
    minute: '2-digit',
  });
  lines.push(`Time: ${time}`);

  await notify(lines.join('\n'), user.telegram_chat_id);  // ส่งเข้า Telegram ของผู้ใช้เจ้าของ secret
}

// ส่งออกให้ server.js เรียกใช้
module.exports = { handleTradingViewAlert };
