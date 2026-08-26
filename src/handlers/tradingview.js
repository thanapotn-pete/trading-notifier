const { notify } = require('../notifications');

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

const ACTION_EMOJI = {
  buy:   '🟢 BUY',
  sell:  '🔴 SELL',
  tp:    '✅ TAKE PROFIT',
  sl:    '🛑 STOP LOSS',
  close: '⬛ CLOSE',
};

async function handleTradingViewAlert(payload, user) {
  const { action, symbol, price, tp, sl, pnl } = payload;

  const emoji = ACTION_EMOJI[action?.toLowerCase()] || '📊 ALERT';
  const lines = [
    `${emoji}`,
    `Symbol: <b>${symbol}</b>`,
    `Price: <b>${price}</b>`,
  ];

  if (tp)   lines.push(`TP: ${tp}`);
  if (sl)   lines.push(`SL: ${sl}`);
  if (pnl !== undefined) lines.push(`P&L: <b>${pnl > 0 ? '+' : ''}${pnl}</b>`);
  const time = new Date().toLocaleTimeString('th-TH', {
    timeZone: process.env.TIMEZONE || 'Asia/Bangkok',
    hour: '2-digit',
    minute: '2-digit',
  });
  lines.push(`Time: ${time}`);

  await notify(lines.join('\n'), user.telegram_chat_id);
}

module.exports = { handleTradingViewAlert };
