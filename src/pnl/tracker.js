const { createClient } = require('@supabase/supabase-js');

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set');
  return createClient(url, key);
}

async function recordTrade(trade) {
  const supabase = getClient();
  const { error } = await supabase.from('trades').insert({
    action: trade.action,
    symbol: trade.symbol,
    price: trade.price,
    pnl: trade.pnl,
    note: trade.note,
    raw: trade,
  });
  if (error) throw error;
}

async function getDailySummary() {
  const supabase = getClient();
  const tz = process.env.TIMEZONE || 'Asia/Bangkok';

  const today = new Date().toLocaleDateString('th-TH', { timeZone: tz });
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .gte('timestamp', startOfDay.toISOString())
    .not('pnl', 'is', null);

  if (error) throw error;

  const totalPnl = data.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const wins = data.filter((t) => t.pnl > 0).length;
  const losses = data.filter((t) => t.pnl < 0).length;

  return { date: today, totalTrades: data.length, wins, losses, totalPnl };
}

async function loadTrades() {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data;
}

module.exports = { recordTrade, getDailySummary, loadTrades };
