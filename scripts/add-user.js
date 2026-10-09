// Register a friend to share this server/database.
// Usage: node scripts/add-user.js "<name>" "<telegram_chat_id>" ["<email>" "<password>"]
// Email/password are optional — set them now to skip a separate
// /api/setup-password call, or leave them out and run that later.
require('dotenv').config();
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const { hashPassword } = require('../src/auth');

async function main() {
  const [name, chatId, email, password] = process.argv.slice(2);
  if (!name || !chatId) {
    console.error('Usage: node scripts/add-user.js "<name>" "<telegram_chat_id>" ["<email>" "<password>"]');
    process.exit(1);
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set');
  const supabase = createClient(url, key);

  const webhookSecret = crypto.randomBytes(16).toString('hex');
  const row = { name, telegram_chat_id: chatId, webhook_secret: webhookSecret };
  if (email && password) {
    row.email = email;
    row.password_hash = await hashPassword(password);
  }

  const { error } = await supabase.from('users').insert(row);
  if (error) throw error;

  console.log(`Registered "${name}"`);
  console.log(`webhook_secret: ${webhookSecret}`);
  if (email && password) {
    console.log(`Website login ready — email: ${email}, password: ${password}`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
