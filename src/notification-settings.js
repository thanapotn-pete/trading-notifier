// notification-settings.js — การตั้งค่าแจ้งเตือนรายผู้ใช้ (ตาราง notification_settings)
// เก็บ/อ่านสวิตช์ที่ผู้ใช้ตั้งในหน้า "การแจ้งเตือน" และมีฟังก์ชัน shouldNotifyTrade
// ที่ตัดสินว่า
// "เทรดนี้ควรส่ง Telegram ไหม" ตามการตั้งค่าเหล่านั้น
const { createClient } = require('@supabase/supabase-js');

// Server-side only: the service key bypasses RLS, so never send it to the browser.
// ตัวเชื่อมต่อฐานข้อมูล (service key — ใช้ฝั่งเซิร์ฟเวอร์เท่านั้น)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);


// =====================================================
// DEFAULT SETTINGS
// =====================================================

// ค่าเริ่มต้นของผู้ใช้ที่ยังไม่เคยตั้งค่า: เปิดแจ้งเตือนเกือบทั้งหมด (ยกเว้นสรุปรายสัปดาห์)
// ไม่จำกัดกำไรขั้นต่ำและคู่เงิน
const DEFAULT_SETTINGS = {
  enabled: true,  // สวิตช์หลัก: ปิด = ไม่แจ้งเตือนอะไรเลย

  notify_buy: true,  // แจ้งเมื่อเปิดออเดอร์ Buy
  notify_sell: true,  // แจ้งเมื่อเปิดออเดอร์ Sell
  notify_tp: true,  // แจ้งเมื่อถึง Take Profit
  notify_sl: true,  // แจ้งเมื่อชน Stop Loss
  notify_close: true,  // แจ้งเมื่อปิดออเดอร์

  notify_risk: true,  // แจ้งเตือนความเสี่ยง (Drawdown)
  notify_daily_summary: true,  // ส่งสรุปรายวัน
  notify_weekly_summary: false,  // ส่งสรุปรายสัปดาห์ (ปิดไว้เป็นค่าเริ่มต้น)

  min_pnl: null,  // กำไร/ขาดทุนขั้นต่ำที่จะแจ้งตอนปิดออเดอร์ (null = ไม่จำกัด)
  max_drawdown: null,  // เกณฑ์ Drawdown (%) ที่จะเตือน (null = ใช้ค่ามาตรฐาน 10)

  symbols: []  // เฉพาะคู่เงินที่เลือก (ว่าง = ทุกตัว)
};


// =====================================================
// GET SETTINGS
// =====================================================

// อ่านการตั้งค่าของผู้ใช้ — ถ้ายังไม่เคยมี จะสร้างแถวค่าเริ่มต้นให้ แล้วคืนค่านั้น
async function getNotificationSettings(userId) {
  const {
    data,
    error
  } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  // ถ้ายังไม่มี Settings ให้สร้างค่าเริ่มต้น
  if (!data) {
    const {
      data: created,
      error: createError
    } = await supabase
      .from('notification_settings')
      .insert({
        user_id: userId,
        ...DEFAULT_SETTINGS
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    return created;
  }

  return data;
}


// =====================================================
// UPDATE SETTINGS
// =====================================================

// บันทึกการตั้งค่า (upsert: ยังไม่มีก็สร้าง มีแล้วก็แก้) และบันทึกเวลาที่แก้ไขล่าสุด
async function updateNotificationSettings(
  userId,
  settings
) {
  // รายชื่อฟิลด์ที่อนุญาตให้แก้ — ฟิลด์อื่นที่ถูกส่งมาจะถูกเมิน (กันการแก้คอลัมน์ที่ไม่ควรแก้)
  const allowedFields = [
    'enabled',

    'notify_buy',
    'notify_sell',
    'notify_tp',
    'notify_sl',
    'notify_close',

    'notify_risk',
    'notify_daily_summary',
    'notify_weekly_summary',

    'min_pnl',
    'max_drawdown',

    'symbols'
  ];

  const updateData = {};

  for (const field of allowedFields) {
    if (settings[field] !== undefined) {
      updateData[field] = settings[field];
    }
  }

  updateData.updated_at =
    new Date().toISOString();

  const {
    data,
    error
  } = await supabase
    .from('notification_settings')
    .upsert(
      {
        user_id: userId,
        ...updateData
      },
      {
        onConflict: 'user_id'
      }
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}


// =====================================================
// NORMALIZE ACTION
// =====================================================

// แปลงชื่อ action หลายแบบ (open_buy, take_profit, closed ...) ให้เป็นชื่อมาตรฐาน buy / sell /
// tp / sl / close
function normalizeAction(action) {
  const value =
    String(action || '')
      .trim()
      .toLowerCase();

  switch (value) {
    case 'buy':
    case 'open_buy':
      return 'buy';

    case 'sell':
    case 'open_sell':
      return 'sell';

    case 'tp':
    case 'take_profit':
    case 'takeprofit':
      return 'tp';

    case 'sl':
    case 'stop_loss':
    case 'stoploss':
      return 'sl';

    case 'close':
    case 'closed':
      return 'close';

    default:
      return value;
  }
}


// =====================================================
// CHECK SYMBOL
// =====================================================

// คู่เงินนี้อยู่ในรายการที่ผู้ใช้เลือกไหม — ถ้ารายการว่างถือว่าอนุญาตทุกตัว
// เทียบแบบไม่สนตัวพิมพ์เล็กใหญ่
function isSymbolAllowed(
  symbol,
  symbols
) {
  // ถ้าไม่ได้กำหนด Symbol
  // ให้แจ้งเตือนทุก Symbol
  if (!Array.isArray(symbols) || symbols.length === 0) {
    return true;
  }

  const currentSymbol =
    String(symbol || '')
      .trim()
      .toUpperCase();

  return symbols.some(
    (item) =>
      String(item || '')
        .trim()
        .toUpperCase() === currentSymbol
  );
}


// =====================================================
// CHECK TRADE NOTIFICATION
// =====================================================

// [สรุป] ตัดสินว่า "เทรดนี้ควรแจ้ง Telegram ไหม" ตามการตั้งค่าของผู้ใช้ เรียงตามลำดับ:
// 1) สวิตช์หลัก  2) สวิตช์ของชนิด action (buy/sell/tp/sl/close)  3) คู่เงินที่เลือก
// 4) กำไรขั้นต่ำ (เฉพาะตอนปิดออเดอร์)  — คืน true = แจ้ง, false = ไม่แจ้ง
function shouldNotifyTrade(
  settings,
  trade
) {
  // ไม่มี Settings
  if (!settings) {
    return true;
  }

  // ระบบแจ้งเตือนถูกปิดทั้งหมด
  if (settings.enabled === false) {
    return false;
  }

  const action =
    normalizeAction(trade.action);

  // ---------------------------------------------------
  // Check Action
  // ---------------------------------------------------

  const actionSettings = {
    buy: settings.notify_buy,
    sell: settings.notify_sell,
    tp: settings.notify_tp,
    sl: settings.notify_sl,
    close: settings.notify_close
  };

  if (
    Object.prototype.hasOwnProperty.call(
      actionSettings,
      action
    )
  ) {
    if (actionSettings[action] === false) {
      return false;
    }
  }

  // ---------------------------------------------------
  // Check Symbol
  // ---------------------------------------------------

  if (
    !isSymbolAllowed(
      trade.symbol,
      settings.symbols
    )
  ) {
    return false;
  }

  // ---------------------------------------------------
  // Check Minimum P&L
  // ---------------------------------------------------

  const pnl =
    trade.pnl !== undefined &&
    trade.pnl !== null
      ? Number(trade.pnl)
      : null;

  // Only a closing trade has a real P&L — an opening trade always arrives
  // with pnl = 0, so applying the minimum there would block every open alert.
  const isClosing =
    action === 'close' ||
    action === 'tp' ||
    action === 'sl';

  if (
    isClosing &&
    settings.min_pnl !== null &&
    settings.min_pnl !== undefined &&
    pnl !== null &&
    Number.isFinite(pnl)
  ) {
    if (pnl < Number(settings.min_pnl)) {
      return false;
    }
  }

  // Risk Alert / Maximum Drawdown are NOT checked here: drawdown is an
  // account-level reading, not a property of one trade. It has its own
  // alert (src/risk-alert.js, POST /webhook/mt5/drawdown). Checking it here
  // would suppress normal trade alerts whenever drawdown is below the limit.

  return true;
}


// =====================================================
// EXPORT
// =====================================================

// ส่งออกให้ api.js, server.js และ scheduler.js ใช้
module.exports = {
  getNotificationSettings,
  updateNotificationSettings,
  shouldNotifyTrade,
  normalizeAction
};