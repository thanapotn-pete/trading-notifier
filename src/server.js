require('dotenv').config();

const express = require('express');

const {
  handleTradingViewAlert
} = require('./handlers/tradingview');

const {
  recordTrade
} = require('./pnl/tracker');

const {
  findUserBySecret
} = require('./users');

const {
  startScheduler
} = require('./scheduler');

const {
  notify
} = require('./notifications');

const {
  getNotificationSettings,
  shouldNotifyTrade
} = require('./notification-settings');

const apiRouter = require('./api');


const app = express();

app.use(express.json());


// =====================================================
// CORS
// =====================================================

// Dashboard API is called directly from the browser
app.use('/api', (req, res, next) => {

  res.header(
    'Access-Control-Allow-Origin',
    '*'
  );

  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH'
  );

  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});


app.use('/api', apiRouter);


// =====================================================
// WEBHOOK USER LOOKUP
// =====================================================

async function lookupUser(req, res, next) {

  try {

    // -------------------------------------------------
    // Read webhook secret
    // Priority:
    // 1. x-webhook-secret Header
    // 2. secret from JSON Body (backward compatible)
    // -------------------------------------------------

    const secret =
      req.headers['x-webhook-secret'] ||
      req.body?.secret;

    const user =
      secret
        ? await findUserBySecret(secret)
        : null;

    if (!user) {

      return res.status(401).json({
        error: 'Invalid secret'
      });

    }

    req.user = user;

    next();

  } catch (err) {

    console.error(
      '[Auth] Error:',
      err.message
    );

    res.status(500).json({
      error: err.message
    });

  }
}


// =====================================================
// TRADINGVIEW WEBHOOK
// =====================================================

app.post(
  '/webhook/tradingview',
  lookupUser,
  async (req, res) => {

    try {

      await handleTradingViewAlert(
        req.body,
        req.user
      );

      res.json({
        ok: true
      });

    } catch (err) {

      console.error(
        '[Webhook] Error:',
        err.message
      );

      res.status(500).json({
        error: err.message
      });

    }

  }
);


// =====================================================
// MT5 WEBHOOK
// =====================================================

app.post(
  '/webhook/mt5',
  lookupUser,
  async (req, res) => {

    try {

      const {
        action,
        symbol,
        price,
        pnl,
        lot,
        position_id,
        tp,
        sl,
        drawdown
      } = req.body;


      // -------------------------------------------------
      // Validate required fields
      // -------------------------------------------------

      if (
        !action ||
        !symbol ||
        !position_id
      ) {

        return res.status(400).json({
          error:
            'action, symbol and position_id required'
        });

      }


      // -------------------------------------------------
      // Save trade to Supabase
      // -------------------------------------------------

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


      console.log(
        `[MT5 Webhook] Trade saved for user: ${req.user.id}`
      );


      // -------------------------------------------------
      // Check Telegram Chat ID
      // -------------------------------------------------

      if (!req.user.telegram_chat_id) {

        console.log(
          `[MT5 Webhook] No Telegram Chat ID for user: ${req.user.id}`
        );

        return res.json({

          ok: true,

          notification_sent: false,

          message:
            'MT5 trade recorded. Telegram Chat ID not configured.'

        });

      }


      // -------------------------------------------------
      // Load Notification Settings
      // -------------------------------------------------

      const settings =
        await getNotificationSettings(
          req.user.id
        );


      // -------------------------------------------------
      // Check Notification Rules
      // -------------------------------------------------

      const allowed =
        shouldNotifyTrade(
          settings,
          {
            action,
            symbol,
            price,
            pnl,
            lot,
            position_id,
            tp,
            sl,
            drawdown
          }
        );


      console.log(
        `[MT5 Webhook] Notification allowed: ${allowed}`
      );


      // -------------------------------------------------
      // Notification blocked
      // -------------------------------------------------

      if (!allowed) {

        console.log(
          '[MT5 Webhook] Telegram notification blocked by settings'
        );

        return res.json({

          ok: true,

          notification_sent: false,

          message:
            'MT5 trade recorded. Telegram notification blocked by settings.'

        });

      }


      // -------------------------------------------------
      // Build Telegram Message
      // -------------------------------------------------

      const actionText =
        String(action).toUpperCase();


      const lines = [

        '<b>MT5 Trade Alert</b>',

        '',

        `Action: <b>${actionText}</b>`,

        `Symbol: <b>${symbol}</b>`,

        `Price: <b>${price ?? '-'}</b>`

      ];


      // -------------------------------------------------
      // Lot
      // -------------------------------------------------

      if (
        lot !== undefined &&
        lot !== null
      ) {

        lines.push(
          `Lot: ${lot}`
        );

      }


      // -------------------------------------------------
      // TP
      // -------------------------------------------------

      if (
        tp !== undefined &&
        tp !== null
      ) {

        lines.push(
          `TP: ${tp}`
        );

      }


      // -------------------------------------------------
      // SL
      // -------------------------------------------------

      if (
        sl !== undefined &&
        sl !== null
      ) {

        lines.push(
          `SL: ${sl}`
        );

      }


      // -------------------------------------------------
      // P&L
      // -------------------------------------------------

      if (
        pnl !== undefined &&
        pnl !== null
      ) {

        const pnlNumber =
          Number(pnl);

        const pnlText =
          Number.isFinite(pnlNumber)

            ? pnlNumber > 0
              ? `+${pnlNumber}`
              : `${pnlNumber}`

            : `${pnl}`;


        lines.push(
          `P&L: <b>${pnlText}</b>`
        );

      }


      // -------------------------------------------------
      // Drawdown
      // -------------------------------------------------

      if (
        drawdown !== undefined &&
        drawdown !== null
      ) {

        lines.push(
          `Drawdown: ${drawdown}%`
        );

      }


      // -------------------------------------------------
      // Time
      // -------------------------------------------------

      const time =
        new Date().toLocaleString(
          'th-TH',
          {
            timeZone:
              process.env.TIMEZONE ||
              'Asia/Bangkok'
          }
        );


      lines.push(
        `Time: ${time}`
      );


      // -------------------------------------------------
      // Send Telegram
      // -------------------------------------------------

      await notify(
        lines.join('\n'),
        req.user.telegram_chat_id
      );


      console.log(
        `[MT5 Webhook] Telegram sent to user: ${req.user.id}`
      );


      // -------------------------------------------------
      // Response
      // -------------------------------------------------

      res.json({

        ok: true,

        notification_sent: true,

        message:
          'MT5 trade recorded and Telegram notification sent'

      });


    } catch (err) {

      console.error(
        '[MT5 Webhook] Error:',
        err.message
      );

      res.status(500).json({
        error: err.message
      });

    }

  }
);


// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
  '/health',
  (req, res) => {

    res.json({

      status: 'ok',

      time:
        new Date().toISOString()

    });

  }
);


// =====================================================
// START SERVER
// =====================================================

const PORT =
  process.env.PORT || 3000;


app.listen(
  PORT,
  () => {

    console.log(
      `[Server] Running on port ${PORT}`
    );

    startScheduler();

  }
);