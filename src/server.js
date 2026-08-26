require('dotenv').config();
const express = require('express');
const { handleTradingViewAlert } = require('./handlers/tradingview');
const { recordTrade } = require('./pnl/tracker');
const { findUserBySecret } = require('./users');
const { startScheduler } = require('./scheduler');
const apiRouter = require('./api');

const app = express();
app.use(express.json());

// Dashboard API is read-only and called directly from the browser, so it
// needs CORS (webhook routes are server-to-server and don't).
app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
});
app.use('/api', apiRouter);

// Look up which registered user a webhook_secret belongs to
async function lookupUser(req, res, next) {
  try {
    const secret = req.body?.secret;
    const user = secret ? await findUserBySecret(secret) : null;
    if (!user) return res.status(401).json({ error: 'Invalid secret' });
    req.user = user;
    next();
  } catch (err) {
    console.error('[Auth] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

// TradingView webhook endpoint
app.post('/webhook/tradingview', lookupUser, async (req, res) => {
  try {
    await handleTradingViewAlert(req.body, req.user);
    res.json({ ok: true });
  } catch (err) {
    console.error('[Webhook] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// MT5 webhook — save to Supabase only (Telegram handled by MT5 directly)
app.post('/webhook/mt5', lookupUser, async (req, res) => {
  try {
    const { action, symbol, price, pnl, lot } = req.body;
    if (!action || !symbol) return res.status(400).json({ error: 'action and symbol required' });
    await recordTrade({ action, symbol, price, pnl, lot, user_id: req.user.id });
    res.json({ ok: true });
  } catch (err) {
    console.error('[MT5 Webhook] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
  startScheduler();
});
