const { notify } = require('../notifications');
const { recordTrade } = require('../pnl/tracker');

// TradingView alert payload format:
// {
//   "secret": "...",
//   "action": "buy" | "sell" | "tp" | "sl" | "close",
//   "symbol": "BTCUSDT",
//   "price": 65000,
//   "tp": 66000,
//   "sl": 64000,
//   "pnl": 150.5,        // optional, for close/tp/sl
//   "note": "..."        // optional
// }

const ACTION_EMOJI = {
  buy:   '🟢 BUY',
  sell:  '🔴 SELL',
  tp:    '✅ TAKE PROFIT',
  sl:    '🛑 STOP LOSS',
  close: '⬛ CLOSE',
};

async function handleTradingViewAlert(payload) {
  const { action, symbol, price, tp, sl, pnl, note } = payload;

  const emoji = ACTION_EMOJI[action?.toLowerCase()] || '📊 ALERT';
  const lines = [
    `${emoji}`,
    `Symbol: <b>${symbol}</b>`,
    `Price: <b>${price}</b>`,
  ];

  if (tp)   lines.push(`TP: ${tp}`);
  if (sl)   lines.push(`SL: ${sl}`);
  if (pnl !== undefined) lines.push(`P&L: <b>${pnl > 0 ? '+' : ''}${pnl}</b>`);
  if (note) lines.push(`Note: ${note}`);

  const time = new Date().toLocaleTimeString('th-TH', {
    timeZone: process.env.TIMEZONE || 'Asia/Bangkok',
    hour: '2-digit',
    minute: '2-digit',
  });
  lines.push(`Time: ${time}`);

  await notify(lines.join('\n'));

  if (['buy', 'sell'].includes(action?.toLowerCase())) {
    await recordTrade({ action, symbol, price, tp, sl });
  } else if (['tp', 'sl', 'close'].includes(action?.toLowerCase()) && pnl !== undefined) {
    await recordTrade({ action, symbol, price, pnl });
  }
}

module.exports = { handleTradingViewAlert };
