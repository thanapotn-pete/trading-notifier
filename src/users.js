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

module.exports = { findUserBySecret, listUsers };
