const fs = require('fs');
const path = require('path');

// RAILWAY_VOLUME_MOUNT_PATH is set automatically when a Volume is attached in Railway
const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'trades.json');

function loadTrades() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveTrades(trades) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(trades, null, 2));
}

function recordTrade(trade) {
  const trades = loadTrades();
  trades.push({
    ...trade,
    timestamp: new Date().toISOString(),
  });
  saveTrades(trades);
}

function getDailySummary() {
  const trades = loadTrades();
  const today = new Date().toLocaleDateString('th-TH', { timeZone: process.env.TIMEZONE || 'Asia/Bangkok' });

  const todayTrades = trades.filter((t) => {
    const tradeDate = new Date(t.timestamp).toLocaleDateString('th-TH', {
      timeZone: process.env.TIMEZONE || 'Asia/Bangkok',
    });
    return tradeDate === today;
  });

  const closedTrades = todayTrades.filter((t) => t.pnl !== undefined);
  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const wins = closedTrades.filter((t) => t.pnl > 0).length;
  const losses = closedTrades.filter((t) => t.pnl < 0).length;

  return { date: today, totalTrades: closedTrades.length, wins, losses, totalPnl };
}

module.exports = { recordTrade, getDailySummary, loadTrades };
