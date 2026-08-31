const cron = require('node-cron');
const { getDailySummary } = require('./pnl/tracker');
const { notify } = require('./notifications');
const { listUsers } = require('./users');

function buildSummaryMessage(summary) {
  const { date, totalTrades, wins, losses, totalPnl } = summary;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : '0.0';
  const pnlSign = totalPnl >= 0 ? '+' : '';
  const resultEmoji = totalPnl >= 0 ? '📈' : '📉';

  return [
    `${resultEmoji} <b>Daily Trading Summary</b>`,
    `Date: ${date}`,
    `Trades: ${totalTrades}`,
    `Wins: ${wins} | Losses: ${losses}`,
    `Win Rate: ${winRate}%`,
    `Total P&L: <b>${pnlSign}${totalPnl.toFixed(2)}</b>`,
  ].join('\n');
}

function startScheduler() {
  const cronExpr = process.env.DAILY_SUMMARY_CRON || '0 22 * * *';

  cron.schedule(cronExpr, async () => {
    console.log('[Scheduler] Sending daily P&L summary...');
    const users = await listUsers();
    for (const user of users) {
      const summary = await getDailySummary(user.id);
      if (summary.totalTrades === 0) {
        await notify('📊 No closed trades today', user.telegram_chat_id);
        continue;
      }
      await notify(buildSummaryMessage(summary), user.telegram_chat_id);
    }
  }, { timezone: process.env.TIMEZONE || 'Asia/Bangkok' });

  console.log(`[Scheduler] Daily summary scheduled: ${cronExpr}`);
}

module.exports = { startScheduler };
