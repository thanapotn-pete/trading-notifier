// Register a friend to share this server/database.
// Usage: node scripts/add-user.js "<name>" "<telegram_chat_id>"
require('dotenv').config();
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const [name, chatId] = process.argv.slice(2);
  if (!name || !chatId) {
    console.error('Usage: node scripts/add-user.js "<name>" "<telegram_chat_id>"');
    process.exit(1);
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set');
  const supabase = createClient(url, key);

  const webhookSecret = crypto.randomBytes(16).toString('hex');

  const { error } = await supabase.from('users').insert({
    name,
    telegram_chat_id: chatId,
    webhook_secret: webhookSecret,
  });
  if (error) throw error;

  console.log(`Registered "${name}"`);
  console.log(`webhook_secret: ${webhookSecret}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
