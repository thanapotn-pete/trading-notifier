// Telegram text for MT5 trades. Mirrors the format TradeAlert.mq5 used to send
// itself (HTML parse mode), so users see the same message now that the server
// sends it and applies their notification settings.

const DISCLAIMER =
  'This signal is for analytical and informational purposes only and ' +
  '<b>"does not constitute investment advice"</b>.\n' +
  'Please practice proper risk management to protect your own interests.';

const SEPARATOR = '─────────────';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// MT5 sends 0 for "no TP/SL"; show "-" like the EA did
function level(value) {
  const n = Number(value);
  return value === undefined || value === null || !Number.isFinite(n) || n === 0
    ? '-'
    : String(value);
}

// The EA numbers its orders 1, 2, 3... and sends that as order_seq, so the
// message matches what the EA itself used to show. Falls back to the MT5
// position id when an older EA doesn't send it.
function orderLine(trade) {
  const seq = Number(trade.order_seq);

  return Number.isInteger(seq) && seq > 0
    ? `🧾 Order #${seq}`
    : `🧾 Position #${escapeHtml(trade.position_id)}`;
}

function direction(action) {
  const a = String(action || '').toLowerCase();
  if (a === 'buy') return { icon: '🟢', text: 'BUY' };
  if (a === 'sell') return { icon: '🔴', text: 'SELL' };
  return null;
}

function headline(dir, symbol, lot) {
  const parts = [];
  if (dir) parts.push(`${dir.icon} <b>${dir.text}</b>`);
  parts.push(escapeHtml(symbol));
  if (lot !== undefined && lot !== null) parts.push(`${escapeHtml(lot)} lot`);
  return parts.join('  ·  ');
}

// trade:    the webhook payload (action, symbol, price, lot, pnl, tp, sl, drawdown,
//           position_id, order_seq)
// position: the stored row for this position_id (needed on close, because the EA
//           only sends action="close" — the row knows whether it was a BUY or SELL)
function buildTradeMessage(trade, position) {
  const action = String(trade.action || '').toLowerCase();
  const lines = [];

  if (action === 'buy' || action === 'sell') {
    lines.push('🆕 <b>NEW TRADE</b>');
    lines.push(headline(direction(action), trade.symbol, trade.lot));
    lines.push(orderLine(trade));
    lines.push(SEPARATOR);
    lines.push(`💵 Entry    <b>${escapeHtml(trade.price ?? '-')}</b>`);
    lines.push(`🎯 TP       ${escapeHtml(level(trade.tp))}`);
    lines.push(`🛑 SL       ${escapeHtml(level(trade.sl))}`);
  } else if (action === 'close' || action === 'tp' || action === 'sl') {
    const pnl = Number(trade.pnl);
    const hasPnl = trade.pnl !== undefined && trade.pnl !== null && Number.isFinite(pnl);
    const icon = !hasPnl || pnl === 0 ? '➖' : pnl > 0 ? '✅' : '❌';

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
  } else {
    // Unknown action: still tell the user what arrived
    lines.push(`ℹ️ <b>${escapeHtml(String(trade.action || 'DEAL').toUpperCase())}</b>`);
    lines.push(headline(null, trade.symbol, trade.lot));
    lines.push(SEPARATOR);
    lines.push(`💵 Price    ${escapeHtml(trade.price ?? '-')}`);
  }

  if (trade.drawdown !== undefined && trade.drawdown !== null) {
    lines.push(`📉 Drawdown ${escapeHtml(trade.drawdown)}%`);
  }

  lines.push(SEPARATOR, DISCLAIMER);
  return lines.join('\n');
}

// Risk Alert text. reading: { drawdown, equity, peak, balance, currency } from the EA.
function buildDrawdownMessage(reading, limit) {
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

module.exports = { buildTradeMessage, buildDrawdownMessage, escapeHtml };
