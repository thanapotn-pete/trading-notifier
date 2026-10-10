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

// bcrypt only reads the first 72 BYTES (a Thai character is 3 bytes), so the
// limit is checked in bytes — otherwise a long Thai password is silently cut
// and a much shorter one would log in.
function passwordLengthError(password) {
  if (typeof password !== 'string' || password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (Buffer.byteLength(password, 'utf8') > 72) {
    return 'Password is too long: at most 72 bytes (a Thai character counts as 3, so about 24 characters)';
  }
  return null;
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

module.exports = { hashPassword, verifyPassword, passwordLengthError, createSessionToken, verifySessionToken };
