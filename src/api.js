const express = require('express');
const { findUserBySecret, findUserById, findUserByEmail, setPassword, updateUserProfile } = require('./users');
const { hashPassword, verifyPassword, createSessionToken, verifySessionToken } = require('./auth');
const { listTrades, getDailySummary, getStatistics } = require('./pnl/tracker');

const router = express.Router();

// One-time setup: the admin-issued webhook_secret acts as an invite code
// to claim a website login (email + a password the user picks themselves).
router.post('/setup-password', async (req, res) => {
  try {
    const { secret, email, password } = req.body || {};
    if (!secret || !email || !password) {
      return res.status(400).json({ error: 'secret, email and password required' });
    }
    const user = await findUserBySecret(secret);
    if (!user) return res.status(401).json({ error: 'Invalid secret' });

    const passwordHash = await hashPassword(password);
    await setPassword(user.id, { email, passwordHash });
    res.json({ ok: true });
  } catch (err) {
    console.error('[API /setup-password] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const user = await findUserByEmail(email);
    const ok = user && (await verifyPassword(password, user.password_hash));
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    res.json({ token: createSessionToken(user) });
  } catch (err) {
    console.error('[API /login] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Everything below requires a session token from /login, sent as
// "Authorization: Bearer <token>" — keeps webhook_secret out of the browser.
async function requireSession(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    const userId = token ? verifySessionToken(token) : null;
    const user = userId ? await findUserById(userId) : null;
    if (!user) return res.status(401).json({ error: 'Invalid or expired session' });
    req.user = user;
    next();
  } catch (err) {
    console.error('[API Auth] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

router.use(requireSession);

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

// Never send credentials back to the browser.
function toProfile(user) {
  const { webhook_secret, password_hash, ...profile } = user;
  return profile;
}

router.get('/profile', (req, res) => {
  res.json(toProfile(req.user));
});

router.patch('/profile', async (req, res) => {
  try {
    const { password, current_password, ...profileFields } = req.body || {};

    if (password) {
      const ok = await verifyPassword(current_password || '', req.user.password_hash);
      if (!ok) return res.status(401).json({ error: 'Invalid current password' });
      await setPassword(req.user.id, { email: req.user.email, passwordHash: await hashPassword(password) });
    }

    const updated = Object.keys(profileFields).length > 0
      ? await updateUserProfile(req.user.id, profileFields)
      : await findUserById(req.user.id);
    res.json(toProfile(updated));
  } catch (err) {
    console.error('[API /profile] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

function notificationMessage(trade) {
  if (trade.status === 'closed') {
    const pnl = trade.pnl != null ? ` (${trade.pnl >= 0 ? '+' : ''}${trade.pnl})` : '';
    return `${trade.action.toUpperCase()} ${trade.symbol} closed${pnl}`;
  }
  return `${trade.action.toUpperCase()} ${trade.symbol} @ ${trade.price}`;
}

router.get('/notifications', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const trades = await listTrades(req.user.id, limit);
    const notifications = trades.map((t) => ({
      type: t.action,
      status: t.status,
      symbol: t.symbol,
      message: notificationMessage(t),
      timestamp: t.status === 'closed' ? t.closed_at : t.timestamp,
    }));
    res.json({ notifications });
  } catch (err) {
    console.error('[API /notifications] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
