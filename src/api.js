const express = require('express');
const crypto = require('crypto');
const { notify } = require('./notifications');

const {
  getNotificationSettings,
  updateNotificationSettings
} = require('./notification-settings');

const {
  findUserBySecret,
  findUserById,
  findUserByEmail,
  listManagedUsers,
  createManagedUser,
  updateManagedUser,
  deleteManagedUser,
  countActiveAdmins,
  setPassword,
  updateUserProfile
} = require('./users');

const {
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken
} = require('./auth');

const {
  listTrades,
  getDailySummary,
  getStatistics
} = require('./pnl/tracker');

const router = express.Router();


// Emails are stored lowercase and compared case-insensitively, so
// "A@x.com" and "a@x.com" can never become two different accounts.
// Returns the normalized email, or null when it is not a valid address.
function normalizeEmail(value) {
  const email = String(value ?? '').trim().toLowerCase();

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return null;
  }

  return email;
}

async function emailTakenByOther(email, userId) {
  const other = await findUserByEmail(email);
  return Boolean(other && other.id !== userId);
}


// =====================================================
// SETUP PASSWORD
// =====================================================

router.post('/setup-password', async (req, res) => {
  try {
    const {
      secret,
      email,
      password
    } = req.body || {};

    if (!secret || !email || !password) {
      return res.status(400).json({
        error: 'secret, email and password required'
      });
    }

    const user = await findUserBySecret(secret);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid secret'
      });
    }

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({
        error: 'Enter a valid email address'
      });
    }

    if (await emailTakenByOther(normalizedEmail, user.id)) {
      return res.status(409).json({
        error: 'An account with this email already exists'
      });
    }

    const passwordHash = await hashPassword(password);

    await setPassword(user.id, {
      email: normalizedEmail,
      passwordHash
    });

    res.json({
      ok: true
    });

  } catch (err) {
    console.error(
      '[API /setup-password] Error:',
      err.message
    );

    res.status(500).json({
      error: err.message
    });
  }
});


// =====================================================
// LOGIN
// =====================================================

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({
        error: 'email and password required'
      });
    }

    const user = await findUserByEmail(email);

    if (user && user.is_active === false) {
      return res.status(401).json({ error: 'This account is disabled. Contact an administrator.' });
    }

    const ok =
      user &&
      (await verifyPassword(
        password,
        user.password_hash
      ));

    if (!ok) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    console.log(
      `[API /login] Login success: ${user.email} (${user.id})`
    );

    res.json({
      token: createSessionToken(user),
      role: user.role || 'user'
    });

  } catch (err) {
    console.error(
      '[API /login] Error:',
      err.message
    );

    res.status(500).json({
      error: err.message
    });
  }
});


// =====================================================
// AUTHENTICATION
// =====================================================

async function requireSession(req, res, next) {
  try {
    const header =
      req.headers.authorization || '';

    const token =
      header.startsWith('Bearer ')
        ? header.slice(7)
        : null;

    const userId =
      token
        ? verifySessionToken(token)
        : null;

    const user =
      userId
        ? await findUserById(userId)
        : null;

    if (!user || user.is_active === false) {
      return res.status(401).json({
        error: 'Invalid or expired session'
      });
    }

    req.user = user;

    console.log(
      `[API Auth] User: ${user.email} | ID: ${user.id}`
    );

    next();

  } catch (err) {
    console.error(
      '[API Auth] Error:',
      err.message
    );

    res.status(500).json({
      error: err.message
    });
  }
}


router.use(requireSession);

async function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required' });
  }
  next();
}

router.get('/admin/users', requireAdmin, async (req, res) => {
  try {
    res.json({ users: await listManagedUsers() });
  } catch (err) {
    console.error('[API /admin/users GET] Error:', err.message);
    res.status(500).json({ error: 'Could not load user accounts' });
  }
});

router.post('/admin/users', requireAdmin, async (req, res) => {
  try {
    const firstName = String(req.body?.first_name || '').trim();
    const lastName = String(req.body?.last_name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const telegramChatId = String(req.body?.telegram_chat_id || '').trim();
    const password = String(req.body?.password || '');

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'First name, last name and email are required' });
    }
    if (firstName.length > 100 || lastName.length > 100) {
      return res.status(400).json({ error: 'Names must be 100 characters or fewer' });
    }
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Enter a valid email address' });
    }
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({ error: 'Initial password must be between 8 and 72 characters' });
    }
    if (telegramChatId && !/^-?\d+$/.test(telegramChatId)) {
      return res.status(400).json({ error: 'Telegram Chat ID must contain only numbers' });
    }
    if (await findUserByEmail(email)) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const webhookSecret = crypto.randomBytes(32).toString('hex');
    const user = await createManagedUser({
      firstName,
      lastName,
      email,
      telegramChatId,
      webhookSecret,
      passwordHash: await hashPassword(password)
    });
    res.status(201).json({ user, webhook_secret: webhookSecret });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    console.error('[API /admin/users POST] Error:', err.message);
    res.status(500).json({ error: 'Could not create the account' });
  }
});

router.patch('/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const current = await findUserById(req.params.id);
    if (!current) return res.status(404).json({ error: 'Account not found' });

    const patch = req.body || {};
    const fields = {};
    for (const key of ['first_name', 'last_name', 'email', 'telegram_chat_id', 'role', 'is_active']) {
      if (Object.prototype.hasOwnProperty.call(patch, key)) fields[key] = patch[key];
    }
    if (!Object.keys(fields).length) {
      return res.status(400).json({ error: 'No account fields supplied' });
    }

    for (const key of ['first_name', 'last_name']) {
      if (fields[key] !== undefined) {
        fields[key] = String(fields[key]).trim();
        if (!fields[key] || fields[key].length > 100) {
          return res.status(400).json({ error: 'Names are required and must be 100 characters or fewer' });
        }
      }
    }
    if (fields.email !== undefined) {
      fields.email = String(fields.email).trim().toLowerCase();
      if (fields.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
        return res.status(400).json({ error: 'Enter a valid email address' });
      }
    }
    if (fields.telegram_chat_id !== undefined) {
      fields.telegram_chat_id = String(fields.telegram_chat_id || '').trim() || null;
      if (fields.telegram_chat_id && !/^-?\d+$/.test(fields.telegram_chat_id)) {
        return res.status(400).json({ error: 'Telegram Chat ID must contain only numbers' });
      }
    }
    if (fields.role !== undefined && !['admin', 'user'].includes(fields.role)) {
      return res.status(400).json({ error: 'Role must be admin or user' });
    }
    if (fields.is_active !== undefined && typeof fields.is_active !== 'boolean') {
      return res.status(400).json({ error: 'is_active must be a boolean' });
    }
    if (
      (fields.email && fields.email.toLowerCase() !== String(current.email || '').toLowerCase() && await findUserByEmail(fields.email))
    ) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const becomesInactiveAdmin = current.role === 'admin' && current.is_active !== false && (
      fields.role === 'user' || fields.is_active === false
    );
    if (becomesInactiveAdmin) {
      if (current.id === req.user.id) {
        return res.status(400).json({ error: 'You cannot remove your own administrator access' });
      }
      if (await countActiveAdmins() <= 1) {
        return res.status(400).json({ error: 'At least one active administrator must remain' });
      }
    }

    const user = await updateManagedUser(req.params.id, fields);
    if (!user) return res.status(404).json({ error: 'Account not found' });
    res.json({ user });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    console.error('[API /admin/users PATCH] Error:', err.message);
    res.status(500).json({ error: 'Could not update the account' });
  }
});

router.delete('/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const target = await findUserById(req.params.id);
    if (!target) return res.status(404).json({ error: 'Account not found' });

    if (target.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }
    if (target.role === 'admin' && target.is_active !== false && await countActiveAdmins() <= 1) {
      return res.status(400).json({ error: 'At least one active administrator must remain' });
    }

    await deleteManagedUser(target.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('[API /admin/users DELETE] Error:', err.message);
    res.status(500).json({ error: `Could not delete the account: ${err.message}` });
  }
});

router.post('/admin/users/:id/reset-password', requireAdmin, async (req, res) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Account not found' });

    const password = String(req.body?.password || '');
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({ error: 'Password must be between 8 and 72 characters' });
    }
    await setPassword(user.id, {
      email: user.email,
      passwordHash: await hashPassword(password)
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('[API /admin/users/:id/reset-password] Error:', err.message);
    res.status(500).json({ error: 'Could not reset the password' });
  }
});

// =====================================================
// NOTIFICATION SETTINGS
// =====================================================

router.get('/notification-settings', async (req, res) => {
  try {
    const settings =
      await getNotificationSettings(
        req.user.id
      );

    res.json({
      settings
    });

  } catch (err) {
    console.error(
      '[API /notification-settings GET] Error:',
      err.message
    );

    res.status(500).json({
      error: err.message
    });
  }
});


router.patch('/notification-settings', async (req, res) => {
  try {
    const settings =
      await updateNotificationSettings(
        req.user.id,
        req.body || {}
      );

    console.log(
      `[API /notification-settings PATCH] Updated for user: ${req.user.id}`
    );

    res.json({
      ok: true,
      settings
    });

  } catch (err) {
    console.error(
      '[API /notification-settings PATCH] Error:',
      err.message
    );

    res.status(500).json({
      error: err.message
    });
  }
});

// =====================================================
// TRADES
// =====================================================

router.get('/trades', async (req, res) => {
  try {
    const limit = Math.min(
      parseInt(req.query.limit, 10) || 50,
      1000
    );

    console.log(
      `[API /trades] Loading trades for user: ${req.user.id}`
    );

    const trades =
      await listTrades(
        req.user.id,
        limit
      );

    console.log(
      `[API /trades] Found ${trades.length} trades`
    );

    res.json({
      trades
    });

  } catch (err) {
    console.error(
      '[API /trades] Error:',
      err.message
    );

    res.status(500).json({
      error: err.message
    });
  }
});


// =====================================================
// SUMMARY
// =====================================================

router.get('/summary', async (req, res) => {
  try {
    const summary =
      await getDailySummary(
        req.user.id
      );

    res.json(summary);

  } catch (err) {
    console.error(
      '[API /summary] Error:',
      err.message
    );

    res.status(500).json({
      error: err.message
    });
  }
});


// =====================================================
// STATISTICS
// =====================================================

router.get('/statistics', async (req, res) => {
  try {
    console.log(
      `[API /statistics] Loading statistics for user: ${req.user.id}`
    );

    const stats =
      await getStatistics(
        req.user.id
      );

    console.log(
      `[API /statistics] Total trades: ${stats.totalTrades}`
    );

    res.json(stats);

  } catch (err) {
    console.error(
      '[API /statistics] Error:',
      err.message
    );

    res.status(500).json({
      error: err.message
    });
  }
});


// =====================================================
// PROFILE
// =====================================================

function toProfile(user) {
  const {
    webhook_secret,
    password_hash,
    ...profile
  } = user;

  return profile;
}


router.get('/profile', (req, res) => {
  res.json(
    toProfile(req.user)
  );
});


// =====================================================
// UPDATE PROFILE
// =====================================================

router.patch('/profile', async (req, res) => {
  try {
    const {
      password,
      current_password,
      ...profileFields
    } = req.body || {};

    // Validate everything before changing anything, so a rejected email
    // can't leave the password already updated.
    for (const key of ['first_name', 'last_name']) {
      if (profileFields[key] !== undefined) {
        profileFields[key] = String(profileFields[key]).trim();

        if (profileFields[key].length > 100) {
          return res.status(400).json({
            error: 'Names must be 100 characters or fewer'
          });
        }
      }
    }

    if (profileFields.email !== undefined) {
      const email = normalizeEmail(profileFields.email);

      if (!email) {
        return res.status(400).json({
          error: 'Enter a valid email address'
        });
      }

      if (await emailTakenByOther(email, req.user.id)) {
        return res.status(409).json({
          error: 'An account with this email already exists'
        });
      }

      profileFields.email = email;
    }

    if (password) {
      const ok =
        await verifyPassword(
          current_password || '',
          req.user.password_hash
        );

      if (!ok) {
        return res.status(401).json({
          error: 'Invalid current password'
        });
      }

      await setPassword(
        req.user.id,
        {
          email: req.user.email,
          passwordHash:
            await hashPassword(password)
        }
      );
    }

    const updated =
      Object.keys(profileFields).length > 0
        ? await updateUserProfile(
            req.user.id,
            profileFields
          )
        : await findUserById(
            req.user.id
          );

    res.json(
      toProfile(updated)
    );

  } catch (err) {
    // Unique index on lower(email) — lost a race with another sign-up
    if (err.code === '23505') {
      return res.status(409).json({
        error: 'An account with this email already exists'
      });
    }

    console.error(
      '[API /profile] Error:',
      err.message
    );

    res.status(500).json({
      error: err.message
    });
  }
});


// =====================================================
// NOTIFICATION MESSAGE
// =====================================================

function notificationMessage(trade) {
    if (trade.status === 'closed') {
        const pnl =
            trade.pnl != null
                ? (trade.pnl >= 0 ? '+' : '') + `$${trade.pnl}`
                : '';

        return `🔔 Trade Closed

Action: ${trade.action.toUpperCase()}
Symbol: ${trade.symbol}
Close Price: ${trade.price}
P/L: ${pnl}
Status: CLOSED`;
    }

    return `🔔 Trade Opened

Action: ${trade.action.toUpperCase()}
Symbol: ${trade.symbol}
Price: ${trade.price}
Status: OPEN`;
}


// =====================================================
// NOTIFICATIONS
// =====================================================

router.get('/notifications', async (req, res) => {
  try {
    const limit = Math.min(
      parseInt(req.query.limit, 10) || 20,
      100
    );

    const trades =
      await listTrades(
        req.user.id,
        limit
      );

    const notifications =
      trades.map((t) => ({
        type: t.action,
        status: t.status,
        symbol: t.symbol,
        message: notificationMessage(t),
        timestamp:
          t.status === 'closed'
            ? t.closed_at
            : t.timestamp
      }));

    res.json({
      notifications
    });

  } catch (err) {
    console.error(
      '[API /notifications] Error:',
      err.message
    );

    res.status(500).json({
      error: err.message
    });
  }
});


// =====================================================
// TEST TELEGRAM
// =====================================================

router.post('/notifications/test', async (req, res) => {
  try {
    const chatId = req.user.telegram_chat_id;

    if (!chatId) {
      return res.status(400).json({
        error: 'Telegram Chat ID is not configured'
      });
    }

    const message = [
      '<b>TradeAnalytics Test</b>',
      '',
      'Telegram notification is working.',
      `User: ${req.user.name || req.user.email}`,
      `Time: ${new Date().toLocaleString('th-TH', {
        timeZone: process.env.TIMEZONE || 'Asia/Bangkok'
      })}`
    ].join('\n');

    await notify(message, chatId);

    console.log(
      `[API /notifications/test] Telegram sent to user: ${req.user.id}`
    );

    res.json({
      ok: true,
      message: 'Test Telegram message sent successfully'
    });

  } catch (err) {
    console.error(
      '[API /notifications/test] Error:',
      err.message
    );

    res.status(500).json({
      error: err.message
    });
  }
});


module.exports = router;
