const { createClient } = require('@supabase/supabase-js');

function getClient() {
  const url = process.env.SUPABASE_URL;
  // Server-side only: the service key bypasses RLS, so never send it to the browser.
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
  return createClient(url, key);
}

async function findUserBySecret(secret) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('webhook_secret', secret)
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function listUsers() {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('is_active', true)
    .not('telegram_chat_id', 'is', null);
  if (error) throw error;
  return data;
}

async function findUserById(id) {
  const supabase = getClient();
  const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

async function findUserByEmail(email) {
  const supabase = getClient();
  // Case-insensitive match (ilike); escape wildcard characters so the email is literal.
  const pattern = String(email).replace(/[\\%_]/g, '\\$&');
  const { data, error } = await supabase.from('users').select('*').ilike('email', pattern).maybeSingle();
  if (error) throw error;
  return data;
}

async function listManagedUsers() {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, name, first_name, last_name, email, telegram_chat_id, role, is_active, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function createManagedUser({ firstName, lastName, email, telegramChatId, webhookSecret, passwordHash }) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('users')
    .insert({
      name: `${firstName} ${lastName}`,
      first_name: firstName,
      last_name: lastName,
      email,
      telegram_chat_id: telegramChatId || null,
      webhook_secret: webhookSecret,
      role: 'user',
      is_active: true,
      password_hash: passwordHash
    })
    .select('id, name, first_name, last_name, email, telegram_chat_id, role, is_active, created_at')
    .single();
  if (error) throw error;
  return data;
}

async function updateManagedUser(userId, fields) {
  const supabase = getClient();
  const update = {};
  for (const key of ['first_name', 'last_name', 'email', 'telegram_chat_id', 'role', 'is_active']) {
    if (fields[key] !== undefined) update[key] = fields[key];
  }
  if (update.first_name !== undefined || update.last_name !== undefined) {
    const current = await findUserById(userId);
    if (!current) return null;
    update.name = `${update.first_name ?? current.first_name ?? ''} ${update.last_name ?? current.last_name ?? ''}`.trim();
  }

  const { data, error } = await supabase
    .from('users')
    .update(update)
    .eq('id', userId)
    .select('id, name, first_name, last_name, email, telegram_chat_id, role, is_active, created_at')
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Removes the account and its dependent rows (trades / notification settings
// reference users.id without ON DELETE CASCADE, so they go first).
async function deleteManagedUser(userId) {
  const supabase = getClient();
  for (const table of ['trades', 'notification_settings']) {
    const { error } = await supabase.from(table).delete().eq('user_id', userId);
    if (error) throw new Error(`${table}: ${error.message}`);
  }
  const { data, error } = await supabase.from('users').delete().eq('id', userId).select('id');
  if (error) throw new Error(`users: ${error.message}`);
  if (!data || data.length === 0) {
    throw new Error('users: no row deleted (Supabase RLS policy is probably blocking DELETE)');
  }
}

async function countActiveAdmins() {
  const supabase = getClient();
  const { count, error } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'admin')
    .eq('is_active', true);
  if (error) throw error;
  return count || 0;
}

async function setPassword(userId, { email, passwordHash }) {
  const supabase = getClient();
  const { error } = await supabase
    .from('users')
    .update({ email, password_hash: passwordHash })
    .eq('id', userId);
  if (error) throw error;
}

const PROFILE_FIELDS = ['first_name', 'last_name', 'email'];

async function updateUserProfile(userId, fields) {
  const supabase = getClient();
  const update = {};
  for (const key of PROFILE_FIELDS) {
    if (fields[key] !== undefined) update[key] = fields[key];
  }

  const { data, error } = await supabase
    .from('users')
    .update(update)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

module.exports = {
  findUserBySecret,
  findUserById,
  findUserByEmail,
  listManagedUsers,
  createManagedUser,
  updateManagedUser,
  deleteManagedUser,
  countActiveAdmins,
  setPassword,
  listUsers,
  updateUserProfile,
};
