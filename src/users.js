const { createClient } = require('@supabase/supabase-js');

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set');
  return createClient(url, key);
}

async function findUserBySecret(secret) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('webhook_secret', secret)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function listUsers() {
  const supabase = getClient();
  const { data, error } = await supabase.from('users').select('*');
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
  const { data, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
  if (error) throw error;
  return data;
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
  setPassword,
  listUsers,
  updateUserProfile,
};
