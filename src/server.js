require('dotenv').config();
const express = require('express');
const { handleTradingViewAlert } = require('./handlers/tradingview');
const { recordTrade } = require('./pnl/tracker');
const { findUserBySecret } = require('./users');
const { startScheduler } = require('./scheduler');
const { notify } = require('./notifications');
const apiRouter = require('./api');

const app = express();
app.use(express.json());

// Dashboard API is called directly from the browser, so it needs CORS
// (webhook routes are server-to-server and don't). PATCH /profile with a
// JSON body triggers a preflight OPTIONS request — answer it directly.
app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
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
// MT5 webhook — save to Supabase and send Telegram notification
app.post('/webhook/mt5', lookupUser, async (req, res) => {
  try {
    const {
      action,
      symbol,
      price,
      pnl,
      lot,
      position_id,
      tp,
      sl
    } = req.body;

    if (!action || !symbol || !position_id) {
      return res.status(400).json({
        error: 'action, symbol and position_id required'
      });
    }

    // Save trade to Supabase
    await recordTrade({
      action,
      symbol,
      price,
      pnl,
      lot,
      position_id,
      tp,
      sl,
      user_id: req.user.id
    });

    // Send Telegram notification
    if (req.user.telegram_chat_id) {
      const actionText = String(action).toUpperCase();

      const lines = [
        '<b>MT5 Trade Alert</b>',
        '',
        `Action: <b>${actionText}</b>`,
        `Symbol: <b>${symbol}</b>`,
        `Price: <b>${price ?? '-'}</b>`
      ];

      if (lot !== undefined) {
        lines.push(`Lot: ${lot}`);
      }

      if (tp !== undefined && tp !== null) {
        lines.push(`TP: ${tp}`);
      }

      if (sl !== undefined && sl !== null) {
        lines.push(`SL: ${sl}`);
      }

      if (pnl !== undefined && pnl !== null) {
        const pnlText = Number(pnl) > 0
          ? `+${pnl}`
          : `${pnl}`;

        lines.push(`P&L: <b>${pnlText}</b>`);
      }

      const time = new Date().toLocaleString('th-TH', {
        timeZone: process.env.TIMEZONE || 'Asia/Bangkok'
      });

      lines.push(`Time: ${time}`);

      await notify(
        lines.join('\n'),
        req.user.telegram_chat_id
      );

      console.log(
        `[MT5 Webhook] Telegram sent to user: ${req.user.id}`
      );
    } else {
      console.log(
        `[MT5 Webhook] No Telegram Chat ID for user: ${req.user.id}`
      );
    }

    res.json({
      ok: true,
      message: 'MT5 trade recorded and Telegram notification sent'
    });

  } catch (err) {
    console.error('[MT5 Webhook] Error:', err.message);

    res.status(500).json({
      error: err.message
    });
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
