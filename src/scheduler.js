const cron = require('node-cron');
const { getDailySummary } = require('./pnl/tracker');
const { notify } = require('./notifications');
const { listUsers } = require('./users');

function buildSummaryMessage(summary, label) {
  const { date, totalTrades, wins, losses, totalPnl } = summary;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : '0.0';
  const pnlSign = totalPnl >= 0 ? '+' : '';
  const resultEmoji = totalPnl >= 0 ? '📈' : '📉';
  const title = label ? `Daily Trading Summary — ${label}` : 'Daily Trading Summary';

  return [
    `${resultEmoji} <b>${title}</b>`,
    `Date: ${date}`,
    `Trades: ${totalTrades}`,
    `Wins: ${wins} | Losses: ${losses}`,
    `Win Rate: ${winRate}%`,
    `Total P&L: <b>${pnlSign}${totalPnl.toFixed(2)}</b>`,
  ].join('\n');
}

function startScheduler() {
  const cronExpr = process.env.DAILY_SUMMARY_CRON || '0 22 * * *';
  const groupChatId = process.env.TELEGRAM_GROUP_CHAT_ID;

  cron.schedule(cronExpr, async () => {
    console.log('[Scheduler] Sending daily P&L summary...');
    const users = await listUsers();
    for (const user of users) {
      const summary = await getDailySummary(user.id);
      const noTrades = summary.totalTrades === 0;

      await notify(noTrades ? '📊 No closed trades today' : buildSummaryMessage(summary), user.telegram_chat_id);

      // Same summary, labeled with the trader's name, also posted to the shared
      // group — skipped when the user's own chat_id already IS the group
      // (e.g. GoldSheep), to avoid posting it there twice.
      if (groupChatId && user.telegram_chat_id !== groupChatId) {
        const groupMessage = noTrades
          ? `📊 ${user.name}: No closed trades today`
          : buildSummaryMessage(summary, user.name);
        await notify(groupMessage, groupChatId);
      }
    }
  }, { timezone: process.env.TIMEZONE || 'Asia/Bangkok' });

  console.log(`[Scheduler] Daily summary scheduled: ${cronExpr}`);
}

module.exports = { startScheduler };
