// trade-message.js — สร้าง "ข้อความ Telegram" ของเทรดจาก MT5
// รูปแบบเหมือนที่ EA (TradeAlert.mq5) เคยส่งเอง แต่ตอนนี้เซิร์ฟเวอร์เป็นคนสร้างและส่ง
// เพื่อตรวจการตั้งค่าของผู้ใช้ก่อน
// • buildTradeMessage → ข้อความเปิด/ปิดออเดอร์  • buildDrawdownMessage → ข้อความเตือนความเสี่ยง
// Telegram text for MT5 trades. Mirrors the format TradeAlert.mq5 used to send
// itself (HTML parse mode), so users see the same message now that the server
// sends it and applies their notification settings.

// ข้อความปฏิเสธความรับผิดชอบ ต่อท้ายทุกข้อความสัญญาณ
const DISCLAIMER =
  'This signal is for analytical and informational purposes only and ' +
  '<b>"does not constitute investment advice"</b>.\n' +
  'Please practice proper risk management to protect your own interests.';

const SEPARATOR = '─────────────';  // เส้นคั่นระหว่างส่วนของข้อความ

// แปลงอักขระ & < > ให้ปลอดภัย: Telegram อ่านข้อความเป็น HTML จึงต้องกันไม่ให้ข้อมูลจากภายนอก
// (เช่น ชื่อ symbol) ถูกตีความเป็นแท็ก
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// [สรุป] แสดงค่า TP/SL: ถ้า MT5 ส่ง 0 หรือไม่มีค่า (= ไม่ได้ตั้ง) ให้แสดงเป็น "-"
// MT5 sends 0 for "no TP/SL"; show "-" like the EA did
function level(value) {
  const n = Number(value);
  return value === undefined || value === null || !Number.isFinite(n) || n === 0
    ? '-'
    : String(value);
}

// [สรุป] บรรทัดเลขออเดอร์: ใช้ลำดับที่ EA นับ (order_seq) ถ้าไม่มีให้ใช้เลข position ของ MT5
// แทน
// The EA numbers its orders 1, 2, 3... and sends that as order_seq, so the
// message matches what the EA itself used to show. Falls back to the MT5
// position id when an older EA doesn't send it.
function orderLine(trade) {
  const seq = Number(trade.order_seq);

  return Number.isInteger(seq) && seq > 0
    ? `🧾 Order #${seq}`
    : `🧾 Position #${escapeHtml(trade.position_id)}`;
}

// แปลง action เป็นทิศทาง: buy → 🟢 BUY, sell → 🔴 SELL (อื่น ๆ ไม่มีทิศทาง)
function direction(action) {
  const a = String(action || '').toLowerCase();
  if (a === 'buy') return { icon: '🟢', text: 'BUY' };
  if (a === 'sell') return { icon: '🔴', text: 'SELL' };
  return null;
}

// บรรทัดหัวข้อ: ทิศทาง · สัญลักษณ์ (symbol) · ขนาด lot
function headline(dir, symbol, lot) {
  const parts = [];
  if (dir) parts.push(`${dir.icon} <b>${dir.text}</b>`);
  parts.push(escapeHtml(symbol));
  if (lot !== undefined && lot !== null) parts.push(`${escapeHtml(lot)} lot`);
  return parts.join('  ·  ');
}

// [สรุป] สร้างข้อความของเทรด 3 แบบ: เปิดออเดอร์ (NEW TRADE), ปิดออเดอร์/ถึง TP/ชน SL, และ
// action อื่น
// position = แถวที่เก็บไว้ในฐานข้อมูล ใช้ตอนปิด เพราะ EA ส่งแค่ "close" ไม่ได้บอกว่าเป็น BUY
// หรือ SELL
// trade:    the webhook payload (action, symbol, price, lot, pnl, tp, sl, drawdown,
//           position_id, order_seq)
// position: the stored row for this position_id (needed on close, because the EA
//           only sends action="close" — the row knows whether it was a BUY or SELL)
function buildTradeMessage(trade, position) {
  const action = String(trade.action || '').toLowerCase();
  const lines = [];

  if (action === 'buy' || action === 'sell') {  // เปิดออเดอร์ใหม่ → ข้อความ NEW TRADE (ราคาเข้า, TP, SL)
    lines.push('🆕 <b>NEW TRADE</b>');
    lines.push(headline(direction(action), trade.symbol, trade.lot));
    lines.push(orderLine(trade));
    lines.push(SEPARATOR);
    lines.push(`💵 Entry    <b>${escapeHtml(trade.price ?? '-')}</b>`);
    lines.push(`🎯 TP       ${escapeHtml(level(trade.tp))}`);
    lines.push(`🛑 SL       ${escapeHtml(level(trade.sl))}`);
  } else if (action === 'close' || action === 'tp' || action === 'sl') {  // ปิดออเดอร์ (ปิดเอง / ถึง TP / ชน SL) → แสดงราคาเข้า-ออก และกำไร
    const pnl = Number(trade.pnl);
    const hasPnl = trade.pnl !== undefined && trade.pnl !== null && Number.isFinite(pnl);
    const icon = !hasPnl || pnl === 0 ? '➖' : pnl > 0 ? '✅' : '❌';  // ➖ ไม่มีกำไรขาดทุน, ✅ กำไร, ❌ ขาดทุน

    // The EA reads MT5's close reason: tp / sl when the broker hit the level
    // (a stop-out is reported as sl), close for a manual close.
    lines.push(
      action === 'tp' ? '🎯 <b>TAKE PROFIT HIT</b>'
        : action === 'sl' ? '🛑 <b>STOP LOSS HIT</b>'
        : `${icon} <b>TRADE CLOSED</b>`
    );
    lines.push(headline(direction(position?.action), trade.symbol, trade.lot));
    lines.push(orderLine(trade));
    lines.push(SEPARATOR);
    if (position?.price !== undefined && position?.price !== null) {
      lines.push(`💵 Entry    ${escapeHtml(position.price)}`);
    }
    lines.push(`💵 Exit     ${escapeHtml(trade.price ?? '-')}`);
    if (hasPnl) {
      lines.push(`💰 Profit   <b>${pnl > 0 ? '+' : ''}${pnl.toFixed(2)}$</b>`);
    }
  } else {  // action ที่ไม่รู้จัก: ยังแจ้งผู้ใช้ว่ามีข้อมูลอะไรเข้ามา
    // Unknown action: still tell the user what arrived
    lines.push(`ℹ️ <b>${escapeHtml(String(trade.action || 'DEAL').toUpperCase())}</b>`);
    lines.push(headline(null, trade.symbol, trade.lot));
    lines.push(SEPARATOR);
    lines.push(`💵 Price    ${escapeHtml(trade.price ?? '-')}`);
  }

  // แนบค่า drawdown ถ้า EA ส่งมาด้วย
  if (trade.drawdown !== undefined && trade.drawdown !== null) {
    lines.push(`📉 Drawdown ${escapeHtml(trade.drawdown)}%`);
  }

  lines.push(SEPARATOR, DISCLAIMER);  // ต่อท้ายด้วยข้อความปฏิเสธความรับผิดชอบ
  return lines.join('\n');  // รวมทุกบรรทัดเป็นข้อความเดียว
}

// [สรุป] ข้อความเตือน Drawdown: บอก drawdown ปัจจุบัน, เกณฑ์ที่ผู้ใช้ตั้ง, equity, จุดสูงสุด
// และ balance
// Risk Alert text. reading: { drawdown, equity, peak, balance, currency } from the EA.
function buildDrawdownMessage(reading, limit) {
  // จัดรูปแบบเงิน เช่น 1,234.50 USD (ถ้าไม่ใช่ตัวเลขแสดง "-")
  const money = (value) => {
    const n = Number(value);
    return Number.isFinite(n)
      ? `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${reading.currency ? ' ' + escapeHtml(reading.currency) : ''}`
      : '-';
  };

  return [
    '⚠️ <b>RISK ALERT — DRAWDOWN</b>',
    `📉 Drawdown  <b>${Number(reading.drawdown).toFixed(2)}%</b>  (limit ${escapeHtml(limit)}%)`,
    SEPARATOR,
    `💰 Equity   ${money(reading.equity)}`,
    `🏔 Peak      ${money(reading.peak)}`,
    `🏦 Balance  ${money(reading.balance)}`,
    SEPARATOR,
    'Drawdown = fall from the highest equity reached. You will be alerted again only after it recovers below the limit and crosses it again.',
  ].join('\n');
}

// ส่งออกให้ server.js และส่วนอื่นใช้
module.exports = { buildTradeMessage, buildDrawdownMessage, escapeHtml };
