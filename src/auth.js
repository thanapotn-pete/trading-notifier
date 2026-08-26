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

async function verifyPassword(password, hash) {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
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

module.exports = { hashPassword, verifyPassword, createSessionToken, verifySessionToken };
