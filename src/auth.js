const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SESSION_TTL = '30d';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET must be set');
  return secret;
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// Compared against when the account doesn't exist (or has no password), so a
// login for an unknown email costs the same bcrypt time as a real one and
// response timing doesn't reveal which emails have accounts.
const DUMMY_HASH = bcrypt.hashSync('timing-equalizer', 10);

async function verifyPassword(password, hash) {
  if (!hash) {
    await bcrypt.compare(password, DUMMY_HASH);
    return false;
  }
  return bcrypt.compare(password, hash);
}

// Passwords: printable ASCII only (English letters, digits, symbols, space),
// 8-72 characters. ASCII also keeps every character at 1 byte, which matters
// because bcrypt only reads the first 72 BYTES of a password.
function passwordProblem(password) {
  if (typeof password !== 'string' || password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (password.length > 72) {
    return 'Password must be at most 72 characters';
  }
  if (!/^[ -~]+$/.test(password)) {
    return 'Password may only contain English letters, digits and symbols';
  }
  return null;
}

// Emails: ASCII only, exactly one "@", a dot in the domain, no spaces.
const EMAIL_PATTERN = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;

function isValidEmail(email) {
  return typeof email === 'string' && email.length <= 254 && EMAIL_PATTERN.test(email);
}

function createSessionToken(user) {
  return jwt.sign({ sub: user.id }, getJwtSecret(), { expiresIn: SESSION_TTL });
}

// Returns the user id from a valid Bearer token, or null if missing/invalid/expired.
function verifySessionToken(token) {
  try {
    const payload = jwt.verify(token, getJwtSecret());
    return payload.sub;
  } catch {
    return null;
  }
}

module.exports = { hashPassword, verifyPassword, passwordProblem, isValidEmail, createSessionToken, verifySessionToken };
