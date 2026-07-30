require('dotenv').config();
const express = require('express');
const { handleTradingViewAlert } = require('./handlers/tradingview');
const { recordTrade } = require('./pnl/tracker');
const { startScheduler } = require('./scheduler');

const app = express();
app.use(express.json());

// Validate shared secret from TradingView alert payload
function validateSecret(req, res, next) {
  const secret = req.body?.secret;
  if (process.env.WEBHOOK_SECRET && secret !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Invalid secret' });
  }
  next();
}

// TradingView webhook endpoint
app.post('/webhook/tradingview', validateSecret, async (req, res) => {
  try {
    await handleTradingViewAlert(req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error('[Webhook] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// MT5 webhook — save to Supabase only (Telegram handled by MT5 directly)
app.post('/webhook/mt5', validateSecret, async (req, res) => {
  try {
    const { action, symbol, price, pnl, lot } = req.body;
    if (!action || !symbol) return res.status(400).json({ error: 'action and symbol required' });
    await recordTrade({ action, symbol, price, pnl, lot });
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
