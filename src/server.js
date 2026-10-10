require('dotenv').config();

// Fail at start-up instead of failing on the first request: without these the
// server can't log anyone in or reach the database, and the error would only
// show up later as a confusing 500.
const REQUIRED_ENV = ['JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name]);

if (missingEnv.length > 0) {
  console.error(
    `[Server] Missing required environment variable(s): ${missingEnv.join(', ')}`
  );
  process.exit(1);
}

if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.warn(
    '[Server] TELEGRAM_BOT_TOKEN is not set — Telegram alerts will fail (the EA falls back to its own).'
  );
}

const path = require('path');
const express = require('express');
const helmet = require('helmet');

const {
  handleTradingViewAlert
} = require('./handlers/tradingview');

const {
  recordTrade,
  getPosition
} = require('./pnl/tracker');

const {
  buildTradeMessage,
  buildDrawdownMessage
} = require('./trade-message');

const {
  evaluateDrawdown,
  markAlerted
} = require('./risk-alert');

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

// Render puts one proxy in front of the server. Trust it so req.ip is the real
// client address (from X-Forwarded-For) — otherwise every visitor looks like the
// proxy's IP and the login rate limit would be shared by the whole world.
app.set('trust proxy', 1);

// Security headers (X-Frame-Options, nosniff, Referrer-Policy, no X-Powered-By...).
// The CSP lists exactly what the pages load: their own files, Bootstrap Icons /
// Chart.js from jsDelivr and Google Fonts. The pages have no inline scripts or
// event handlers, so script-src-attr is 'none'; only style="..." attributes
// remain, hence 'unsafe-inline' for styles.
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"]
    }
  }
}));

app.use(express.json());


// =====================================================
// CORS
// =====================================================

// The pages are served by this server, so they call the API on the same
// origin and need no CORS. Cross-origin access is only opened for a local dev
// page on another port (e.g. Live Server on :5500 calling localhost:3000).
const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use('/api', (req, res, next) => {

  const origin = req.headers.origin;

  if (origin && LOCAL_ORIGIN.test(origin)) {

    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');

    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PATCH, DELETE'
    );

    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );

  }

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
        drawdown,
        order_seq
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

          // The EA reads this: with no Chat ID on the server it sends the
          // Telegram message itself instead of dropping it.
          reason: 'no_chat_id',

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

          // The user turned this alert off on the website — the EA must
          // not send it either.
          reason: 'blocked_by_settings',

          message:
            'MT5 trade recorded. Telegram notification blocked by settings.'

        });

      }


      // -------------------------------------------------
      // Build Telegram Message
      // -------------------------------------------------
      // On close the EA only sends action="close", so look up the stored
      // position to show whether it was a BUY or SELL and its entry price.

      let position = null;

      if (['close', 'tp', 'sl'].includes(String(action).toLowerCase())) {

        try {

          position =
            await getPosition(
              req.user.id,
              position_id
            );

        } catch (err) {

          console.error(
            '[MT5 Webhook] Position lookup failed:',
            err.message
          );

        }

      }


      const message =
        buildTradeMessage(
          {
            action,
            symbol,
            price,
            pnl,
            lot,
            position_id,
            tp,
            sl,
            drawdown,
            order_seq
          },
          position
        );

      // -------------------------------------------------
      // Send Telegram
      // -------------------------------------------------

      await notify(
        message,
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
// MT5 DRAWDOWN (Risk Alert)
// =====================================================

// The EA reports account drawdown (fall from peak equity) whenever it moves.
// The user's "Risk Alert" switch and "Maximum Drawdown" limit decide here
// whether it becomes a Telegram message — once per crossing (see risk-alert.js).

const DEFAULT_MAX_DRAWDOWN = 10; // what the website shows when no limit is saved

app.post(
  '/webhook/mt5/drawdown',
  lookupUser,
  async (req, res) => {

    try {

      const drawdown = Number(req.body?.drawdown);

      if (!Number.isFinite(drawdown) || drawdown < 0) {

        return res.status(400).json({
          error: 'drawdown must be a non-negative number'
        });

      }

      if (!req.user.telegram_chat_id) {

        return res.json({
          ok: true,
          notification_sent: false,
          reason: 'no_chat_id'
        });

      }

      const settings =
        await getNotificationSettings(
          req.user.id
        );

      if (
        settings.enabled === false ||
        settings.notify_risk === false
      ) {

        return res.json({
          ok: true,
          notification_sent: false,
          reason: 'blocked_by_settings'
        });

      }

      const savedLimit = Number(settings.max_drawdown);

      const limit =
        settings.max_drawdown !== null &&
        settings.max_drawdown !== undefined &&
        Number.isFinite(savedLimit)
          ? savedLimit
          : DEFAULT_MAX_DRAWDOWN;

      const decision =
        evaluateDrawdown(
          req.user.id,
          drawdown,
          limit
        );

      if (decision !== 'alert') {

        return res.json({
          ok: true,
          notification_sent: false,
          reason: decision === 'rearm' ? 'rearmed' : 'no_new_alert'
        });

      }

      await notify(
        buildDrawdownMessage(
          {
            drawdown,
            equity: req.body.equity,
            peak: req.body.peak,
            balance: req.body.balance,
            currency: req.body.currency
          },
          limit
        ),
        req.user.telegram_chat_id
      );

      // Only after Telegram really accepted it, so a failed send is retried
      markAlerted(req.user.id);

      console.log(
        `[MT5 Drawdown] Risk alert sent to user: ${req.user.id} (${drawdown}% >= ${limit}%)`
      );

      res.json({
        ok: true,
        notification_sent: true,
        message: 'Drawdown alert sent'
      });

    } catch (err) {

      console.error(
        '[MT5 Drawdown] Error:',
        err.message
      );

      res.status(500).json({
        error: err.message
      });

    }

  }
);


// =====================================================
// FRONTEND (static pages)
// =====================================================

// Same origin as the API, so the pages need no CORS and no API URL setting.
app.use(express.static(path.join(__dirname, '..', 'Frontend')));

app.get('/', (req, res) => {
  res.redirect('/login.html');
});


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