const { createClient } = require('@supabase/supabase-js');

function getClient() {
  const url = process.env.SUPABASE_URL;
  // Server-side only: the service key bypasses RLS, so never send it to the browser.
  const key = process.env.SUPABASE_SERVICE_KEY;
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

  // Nothing editable was sent: return the row as it is instead of an empty update
  if (Object.keys(update).length === 0) {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
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

// Removes the account together with its trades and notification settings.
// Done by the delete_user_cascade() SQL function (supabase/schema.sql) so the
// three deletes run in ONE transaction: if any step fails nothing is removed,
// instead of wiping the trade history and then leaving the account behind.
async function deleteManagedUser(userId) {
  const supabase = getClient();
  const { error } = await supabase.rpc('delete_user_cascade', { p_user_id: userId });
  if (error) throw new Error(error.message);
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

const PROFILE_FIELDS = ['first_name', 'last_name', 'email', 'telegram_chat_id'];

async function updateUserProfile(userId, fields) {
  const supabase = getClient();
  const update = {};
  for (const key of PROFILE_FIELDS) {
    if (fields[key] !== undefined) update[key] = fields[key];
  }

  // Nothing editable was sent: return the row as it is instead of an empty update
  if (Object.keys(update).length === 0) {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
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
