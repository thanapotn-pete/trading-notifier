// tracker.js — บันทึกและคำนวณ "ผลการเทรด" (ตาราง trades ใน Supabase)
// • recordTrade  บันทึกเทรดที่ได้จาก webhook ของ MT5   • getPosition
// ดึงข้อมูลออเดอร์ที่เปิดไว้
// • listTrades  รายการเทรด   • getPeriodSummary / getDailySummary  สรุปรายวัน-รายสัปดาห์
// • getStatistics  สถิติรวม (Win Rate, Profit Factor ฯลฯ) ที่หน้า Statistics/Reports ใช้
const { createClient } = require('@supabase/supabase-js');

// สร้างตัวเชื่อมต่อ Supabase (service key, ฝั่งเซิร์ฟเวอร์เท่านั้น) ถ้า env ไม่ครบจะ throw
// error
function getClient() {
  const url = process.env.SUPABASE_URL;
  // Server-side only: the service key bypasses RLS, so never send it to the browser.
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_KEY must be set'
    );
  }

  return createClient(url, key);
}


// [สรุป] หา "เที่ยงคืนของวันนี้" ตามเขตเวลาของเทรดเดอร์ (เช่น ไทย) ในรูปเวลา UTC
// ใช้เป็นจุดเริ่มต้นของวันตอนนับสรุปรายวัน (เซิร์ฟเวอร์ Render ใช้เวลา UTC ถ้าไม่แปลง
// วันจะเริ่มผิดเวลา)
// Midnight of "today" in the given IANA timezone, as a UTC instant.
// (`new Date().setHours(0,0,0,0)` uses the server's own local time,
// which on Render is UTC — not the trader's timezone — so day boundaries were off.)
function startOfDayInTimezone(tz) {
  const now = new Date();

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
    .formatToParts(now)
    .reduce(
      (acc, p) => {
        acc[p.type] = p.value;
        return acc;
      },
      {}
    );

  // นำเวลาบนนาฬิกาของเขตเวลานั้นมาตีเป็น UTC เพื่อหาส่วนต่าง (offset) ระหว่างเวลาท้องถิ่นกับ
  // UTC
  const wallClockAsUTC = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  // `parts` is whole seconds, so compare against the whole-second instant
  // (otherwise the day boundary drifts by the current milliseconds)
  const offsetMs = wallClockAsUTC - Math.floor(now.getTime() / 1000) * 1000;  // ส่วนต่างเวลา (มิลลิวินาที)

  // เที่ยงคืนของวันนี้บนนาฬิกาท้องถิ่น (ตอนนี้ยังตีเป็น UTC อยู่)
  const midnightWallClockAsUTC = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    0,
    0,
    0
  );

  return new Date(midnightWallClockAsUTC - offsetMs);  // ลบส่วนต่างออก ได้เวลาจริงของเที่ยงคืนท้องถิ่น
}


// [สรุป] บันทึกเทรดจาก webhook โดย "1 ออเดอร์ (position) = 1 แถว"
// • ตอนเปิด (buy/sell) → เพิ่มแถวใหม่ status = open
// • ตอนปิด (close/tp/sl) → อัปเดตแถวเดิมที่ position_id เดียวกัน ใส่ราคาปิด กำไร/ขาดทุน และ
// status = closed
// ทำให้แสดงเปิด-ปิด-TP-SL ของออเดอร์เดียวรวมกันในตารางประวัติเทรดได้
// A position is one row, inserted on open and updated in place on close
// (matched by position_id) so open/close/TP/SL can be shown together.
async function recordTrade(trade) {
  const supabase = getClient();

  if (trade.action === 'buy' || trade.action === 'sell') {  // เปิดออเดอร์ → เพิ่มแถวใหม่
    const { error } = await supabase
      .from('trades')
      .insert({
        action: trade.action,
        symbol: trade.symbol,
        price: trade.price,
        lot: trade.lot,
        tp: trade.tp,
        sl: trade.sl,
        position_id: trade.position_id,
        status: 'open',  // สถานะ: ยังเปิดอยู่
        user_id: trade.user_id,
      });

    if (error) {
      throw error;
    }

    return;
  }

  // ปิดออเดอร์ → อัปเดตแถวของ position นี้ (ของผู้ใช้คนนี้) ที่ยังเปิดอยู่
  const { error } = await supabase
    .from('trades')
    .update({
      close_price: trade.price,
      pnl: trade.pnl,
      status: 'closed',
      closed_at: new Date().toISOString(),
    })
    .eq('position_id', trade.position_id)
    .eq('user_id', trade.user_id)
    .eq('status', 'open');  // เฉพาะแถวที่ยัง open เท่านั้น (กันปิดซ้ำ)

  if (error) {
    throw error;
  }
}


// [สรุป] ดึงแถวของออเดอร์หนึ่ง (ล่าสุดของ position_id นั้น) — ใช้สร้างข้อความตอนปิด เพราะ EA
// ไม่ได้ส่ง BUY/SELL และราคาเข้ามาซ้ำ
// The stored row for one position — the close message needs the original
// BUY/SELL and entry price, which the EA doesn't resend on close.
async function getPosition(userId, positionId) {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('trades')
    .select('action, symbol, price, lot, tp, sl, status')
    .eq('user_id', userId)
    .eq('position_id', positionId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}


// [สรุป] สรุปเทรดที่ "ปิดแล้ว" ย้อนหลัง N วันตามเขตเวลาของเทรดเดอร์ (1 = วันนี้, 7 = 7
// วันรวมวันนี้)
// คืนจำนวนเทรด ชนะ แพ้ และกำไรสุทธิ — ใช้ในสรุปรายวัน/รายสัปดาห์ที่ส่งทาง Telegram
// Closed-trade totals for the last `days` calendar days in the trader's
// timezone (days = 1 -> today only, 7 -> today and the 6 days before).
async function getPeriodSummary(userId, days = 1) {
  const supabase = getClient();
  const tz = process.env.TIMEZONE || 'Asia/Bangkok';

  const formatDay = (date) =>
    date.toLocaleDateString('en-GB', { timeZone: tz });

  const startOfToday = startOfDayInTimezone(tz);  // จุดเริ่มของวันนี้
  // จุดเริ่มของช่วงที่ต้องการ = เริ่มวันนี้ ลบย้อนหลัง (days − 1) วัน
  const startOfPeriod = new Date(
    startOfToday.getTime() - (days - 1) * 24 * 60 * 60 * 1000
  );

  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .gte('closed_at', startOfPeriod.toISOString())  // เฉพาะเทรดที่ปิดตั้งแต่ต้นช่วง
    .not('pnl', 'is', null);  // เฉพาะเทรดที่มีกำไร/ขาดทุนแล้ว (คือปิดแล้ว)

  if (error) {
    throw error;
  }

  const totalPnl = data.reduce(  // รวมกำไร/ขาดทุนทุกเทรดในช่วง
    (sum, t) => sum + (t.pnl || 0),
    0
  );

  const wins = data.filter((t) => t.pnl > 0).length;  // ชนะ = กำไรมากกว่า 0
  const losses = data.filter((t) => t.pnl < 0).length;  // แพ้ = ขาดทุน (น้อยกว่า 0)

  const today = formatDay(new Date());

  return {
    date: today,
    from: formatDay(startOfPeriod),
    days,
    totalTrades: data.length,
    wins,
    losses,
    totalPnl,
  };
}


// ทางลัด: สรุปของวันนี้ (= ย้อนหลัง 1 วัน)
async function getDailySummary(userId) {
  return getPeriodSummary(userId, 1);
}


// [สรุป] รายการเทรดล่าสุดของผู้ใช้ เรียงใหม่ → เก่า จำกัดจำนวนด้วย limit
// หน้า Dashboard / ประวัติเทรดเรียกผ่าน GET /api/trades
async function listTrades(userId, limit = 100) {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', {
      ascending: false,
    })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data;
}


/* =====================================================
   GET STATISTICS
===================================================== */

// [สรุป] คำนวณสถิติทั้งหมดของผู้ใช้จาก "เทรดที่ปิดแล้ว": จำนวนเทรด ชนะ/แพ้ กำไรรวม Win Rate
// Profit Factor กำไร-ขาดทุนเฉลี่ย เทรดที่ดี/แย่ที่สุด และสถิติแยกรายคู่เงิน
// หน้า Statistics / Reports เรียกผ่าน GET /api/statistics
async function getStatistics(userId) {
  const supabase = getClient();

  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .not('pnl', 'is', null);  // เฉพาะเทรดที่ปิดแล้ว (มีค่ากำไร/ขาดทุน)

  if (error) {
    throw error;
  }

  const trades = data || [];


  // ==========================================
  // Basic Statistics
  // ==========================================

  const totalTrades = trades.length;

  // แยกเทรดที่กำไร (pnl > 0) และเทรดที่ขาดทุน (pnl < 0)
  const winningTrades = trades.filter(
    (trade) =>
      Number(trade.pnl || 0) > 0
  );

  const losingTrades = trades.filter(
    (trade) =>
      Number(trade.pnl || 0) < 0
  );

  const wins = winningTrades.length;
  const losses = losingTrades.length;


  // ==========================================
  // Profit / Loss
  // ==========================================

  // กำไรรวมเฉพาะเทรดที่ชนะ
  const totalProfit = winningTrades.reduce(
    (sum, trade) =>
      sum + Number(trade.pnl || 0),
    0
  );

  // ขาดทุนรวมเฉพาะเทรดที่แพ้ (เป็นค่าติดลบ)
  const totalLoss = losingTrades.reduce(
    (sum, trade) =>
      sum + Number(trade.pnl || 0),
    0
  );

  // กำไรสุทธิ = กำไรรวม + ขาดทุนรวม (ทุกเทรด)
  const totalPnl = trades.reduce(
    (sum, trade) =>
      sum + Number(trade.pnl || 0),
    0
  );


  // ==========================================
  // Win Rate
  // ==========================================

  // Win Rate (%) = เทรดที่ชนะ ÷ เทรดทั้งหมด × 100 (ไม่มีเทรด = 0)
  const winRate =
    totalTrades > 0
      ? (wins / totalTrades) * 100
      : 0;


  // ==========================================
  // Profit Factor
  // ==========================================

  // Profit Factor = กำไรรวม ÷ |ขาดทุนรวม| (มากกว่า 1 = ได้มากกว่าเสีย)
  // ถ้าไม่มีขาดทุนเลยแต่มีกำไร ให้เป็น Infinity
  let profitFactor = 0;

  if (totalLoss < 0) {
    profitFactor =
      totalProfit / Math.abs(totalLoss);
  } else if (totalProfit > 0) {
    profitFactor = Infinity;
  }


  // ==========================================
  // Average Win / Average Loss
  // ==========================================

  // กำไรเฉลี่ยต่อเทรดที่ชนะ และขาดทุนเฉลี่ยต่อเทรดที่แพ้
  const avgWin =
    wins > 0
      ? totalProfit / wins
      : 0;

  const avgLoss =
    losses > 0
      ? totalLoss / losses
      : 0;


  // ==========================================
  // Best Trade / Worst Trade
  // ==========================================

  // เทรดที่ได้กำไรมากที่สุด และขาดทุนมากที่สุด (วนเทียบทีละเทรด เก็บตัวที่สูง/ต่ำสุด)
  let bestTrade = null;
  let worstTrade = null;

  if (trades.length > 0) {
    bestTrade = trades.reduce(
      (best, trade) => {
        return Number(trade.pnl || 0) >
          Number(best.pnl || 0)
          ? trade
          : best;
      }
    );

    worstTrade = trades.reduce(
      (worst, trade) => {
        return Number(trade.pnl || 0) <
          Number(worst.pnl || 0)
          ? trade
          : worst;
      }
    );
  }


  // ==========================================
  // Statistics By Symbol
  // ==========================================

  // รวมสถิติแยกรายคู่เงิน: นับจำนวนเทรด ชนะ แพ้ และกำไรรวมของแต่ละ symbol
  const symbolMap = {};

  for (const trade of trades) {
    const symbol =
      trade.symbol || 'Unknown';

    const pnl =
      Number(trade.pnl || 0);

    if (!symbolMap[symbol]) {
      symbolMap[symbol] = {
        symbol: symbol,
        trades: 0,
        wins: 0,
        losses: 0,
        totalPnl: 0,
      };
    }

    symbolMap[symbol].trades += 1;

    symbolMap[symbol].totalPnl += pnl;

    if (pnl > 0) {
      symbolMap[symbol].wins += 1;
    } else if (pnl < 0) {
      symbolMap[symbol].losses += 1;
    }
  }


  // แปลงเป็นรายการ พร้อมคำนวณ Win Rate ของแต่ละคู่เงิน
  const bySymbol =
    Object.values(symbolMap).map(
      (item) => {
        return {
          symbol: item.symbol,
          trades: item.trades,
          wins: item.wins,
          losses: item.losses,

          winRate:
            item.trades > 0
              ? (item.wins / item.trades) * 100
              : 0,

          totalPnl: item.totalPnl,
        };
      }
    );


  // ==========================================
  // Return
  // ==========================================

  // ส่งผลสถิติทั้งหมดกลับไปให้ API (แปลงเป็น JSON ให้หน้าเว็บ)
  return {
    totalTrades: totalTrades,

    wins: wins,
    losses: losses,

    winningTrades: wins,
    losingTrades: losses,

    totalProfit: totalProfit,
    totalLoss: totalLoss,
    totalPnl: totalPnl,

    winRate: winRate,
    profitFactor: profitFactor,

    avgWin: avgWin,
    avgLoss: avgLoss,

    bestTrade: bestTrade,
    worstTrade: worstTrade,

    bySymbol: bySymbol,
  };
}


/* =====================================================
   EXPORT
===================================================== */

// ส่งออกให้ server.js, api.js และ scheduler.js เรียกใช้
module.exports = {
  recordTrade,
  getPosition,
  getDailySummary,
  getPeriodSummary,
  listTrades,
  getStatistics,
};