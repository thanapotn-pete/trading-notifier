const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);


// =====================================================
// DEFAULT SETTINGS
// =====================================================

const DEFAULT_SETTINGS = {
  enabled: true,

  notify_buy: true,
  notify_sell: true,
  notify_tp: true,
  notify_sl: true,
  notify_close: true,

  notify_risk: true,
  notify_daily_summary: true,
  notify_weekly_summary: false,

  min_pnl: null,
  max_drawdown: null,

  symbols: []
};


// =====================================================
// GET SETTINGS
// =====================================================

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

async function updateNotificationSettings(
  userId,
  settings
) {
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

  if (
    settings.min_pnl !== null &&
    settings.min_pnl !== undefined &&
    pnl !== null &&
    Number.isFinite(pnl)
  ) {
    if (pnl < Number(settings.min_pnl)) {
      return false;
    }
  }

  // ---------------------------------------------------
  // Check Risk / Maximum Drawdown
  // ---------------------------------------------------

  const drawdown =
    trade.drawdown !== undefined &&
    trade.drawdown !== null
      ? Number(trade.drawdown)
      : null;

  // ถ้าเป็น Trade ที่มี Drawdown
  // และ Risk Alert ถูกปิด → ไม่ต้องแจ้ง
  if (
    drawdown !== null &&
    settings.notify_risk === false
  ) {
    return false;
  }

  // ถ้ากำหนด Maximum Drawdown ไว้
  if (
    settings.max_drawdown !== null &&
    settings.max_drawdown !== undefined &&
    drawdown !== null &&
    Number.isFinite(drawdown)
  ) {
    // แจ้งเตือนเมื่อ Drawdown
    // มากกว่าหรือเท่ากับค่าที่กำหนด
    if (
      drawdown <
      Number(settings.max_drawdown)
    ) {
      return false;
    }
  }

  return true;
}


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getNotificationSettings,
  updateNotificationSettings,
  shouldNotifyTrade,
  normalizeAction
};