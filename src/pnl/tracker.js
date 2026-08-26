const { createClient } = require('@supabase/supabase-js');

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set');
  return createClient(url, key);
}

// Midnight of "today" in the given IANA timezone, as a UTC instant.
// (`new Date().setHours(0,0,0,0)` uses the server's own local time, which
// on Render is UTC — not the trader's timezone — so day boundaries were off.)
function startOfDayInTimezone(tz) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(now).reduce((acc, p) => ((acc[p.type] = p.value), acc), {});

  const wallClockAsUTC = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  const offsetMs = wallClockAsUTC - now.getTime();
  const midnightWallClockAsUTC = Date.UTC(parts.year, parts.month - 1, parts.day, 0, 0, 0);
  return new Date(midnightWallClockAsUTC - offsetMs);
}

async function recordTrade(trade) {
  const supabase = getClient();
  const { error } = await supabase.from('trades').insert({
    action: trade.action,
    symbol: trade.symbol,
    price: trade.price,
    pnl: trade.pnl,
    lot: trade.lot,
    user_id: trade.user_id,
  });
  if (error) throw error;
}

async function getDailySummary(userId) {
  const supabase = getClient();
  const tz = process.env.TIMEZONE || 'Asia/Bangkok';

  const today = new Date().toLocaleDateString('th-TH', { timeZone: tz });
  const startOfDay = startOfDayInTimezone(tz);

  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', startOfDay.toISOString())
    .not('pnl', 'is', null);

  if (error) throw error;

  const totalPnl = data.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const wins = data.filter((t) => t.pnl > 0).length;
  const losses = data.filter((t) => t.pnl < 0).length;

  return { date: today, totalTrades: data.length, wins, losses, totalPnl };
}

async function listTrades(userId, limit = 100) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

async function getStatistics(userId) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .not('pnl', 'is', null);
  if (error) throw error;

  const totalTrades = data.length;
  const wins = data.filter((t) => t.pnl > 0);
  const losses = data.filter((t) => t.pnl < 0);
  const totalPnl = data.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length : 0;

  return {
    totalTrades,
    wins: wins.length,
    losses: losses.length,
    winRate: totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0,
    totalPnl,
    avgWin,
    avgLoss,
  };
}

module.exports = { recordTrade, getDailySummary, listTrades, getStatistics };
