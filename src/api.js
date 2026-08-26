const express = require('express');
const { findUserBySecret } = require('./users');
const { listTrades, getDailySummary, getStatistics } = require('./pnl/tracker');

const router = express.Router();

// Auth for the read-only dashboard API: same webhook_secret used by
// TradingView/MT5, passed as a query param since these are GET requests
// called directly from the friend's frontend.
async function lookupUserFromQuery(req, res, next) {
  try {
    const secret = req.query.secret;
    const user = secret ? await findUserBySecret(secret) : null;
    if (!user) return res.status(401).json({ error: 'Invalid secret' });
    req.user = user;
    next();
  } catch (err) {
    console.error('[API Auth] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

router.use(lookupUserFromQuery);

router.get('/trades', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const trades = await listTrades(req.user.id, limit);
    res.json({ trades });
  } catch (err) {
    console.error('[API /trades] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const summary = await getDailySummary(req.user.id);
    res.json(summary);
  } catch (err) {
    console.error('[API /summary] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/statistics', async (req, res) => {
  try {
    const stats = await getStatistics(req.user.id);
    res.json(stats);
  } catch (err) {
    console.error('[API /statistics] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

function notificationMessage(trade) {
  if (trade.action === 'buy' || trade.action === 'sell') {
    return `${trade.action.toUpperCase()} ${trade.symbol} @ ${trade.price}`;
  }
  const pnl = trade.pnl != null ? ` (${trade.pnl >= 0 ? '+' : ''}${trade.pnl})` : '';
  return `${trade.symbol} closed${pnl}`;
}

router.get('/notifications', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const trades = await listTrades(req.user.id, limit);
    const notifications = trades.map((t) => ({
      type: t.action,
      symbol: t.symbol,
      message: notificationMessage(t),
      timestamp: t.timestamp,
    }));
    res.json({ notifications });
  } catch (err) {
    console.error('[API /notifications] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
