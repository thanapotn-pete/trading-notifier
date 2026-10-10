const cron = require('node-cron');
const { getPeriodSummary } = require('./pnl/tracker');
const { notify } = require('./notifications');
const { listUsers } = require('./users');
const { getNotificationSettings } = require('./notification-settings');

function buildSummaryMessage(summary, { title, rangeLabel }) {
  const { totalTrades, wins, losses, totalPnl } = summary;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : '0.0';
  const pnlSign = totalPnl >= 0 ? '+' : '';
  const resultEmoji = totalPnl >= 0 ? '📈' : '📉';

  return [
    `${resultEmoji} <b>${title}</b>`,
    rangeLabel,
    `Trades: ${totalTrades}`,
    `Wins: ${wins} | Losses: ${losses}`,
    `Win Rate: ${winRate}%`,
    `Total P&L: <b>${pnlSign}${totalPnl.toFixed(2)}</b>`,
  ].join('\n');
}

// The two summaries differ only in the period, the user's switch and the wording
const SUMMARIES = {
  daily: {
    days: 1,
    switchKey: 'notify_daily_summary',
    title: 'Daily Trading Summary',
    empty: '📊 No closed trades today',
    range: (s) => `Date: ${s.date}`,
  },
  weekly: {
    days: 7,
    switchKey: 'notify_weekly_summary',
    title: 'Weekly Trading Summary',
    empty: '📊 No closed trades in the last 7 days',
    range: (s) => `Period: ${s.from} - ${s.date}`,
  },
};

// One user's failure (blocked the bot, Supabase hiccup...) must not stop the
// summaries of everyone after them, so each user is handled on its own.
async function sendSummaries(kind) {
  const config = SUMMARIES[kind];
  const result = { sent: 0, skipped: 0, failed: 0 };

  let users;
  try {
    users = await listUsers();
  } catch (err) {
    console.error(`[Scheduler] Could not load users for ${kind} summary:`, err.message);
    return result;
  }

  for (const user of users) {
    try {
      const settings = await getNotificationSettings(user.id);

      // Master switch off, or this summary switched off on the website
      if (settings.enabled === false || settings[config.switchKey] !== true) {
        result.skipped++;
        continue;
      }

      const summary = await getPeriodSummary(user.id, config.days);

      const message = summary.totalTrades === 0
        ? config.empty
        : buildSummaryMessage(summary, {
            title: config.title,
            rangeLabel: config.range(summary),
          });

      await notify(message, user.telegram_chat_id);
      result.sent++;
    } catch (err) {
      result.failed++;
      console.error(`[Scheduler] ${kind} summary failed for user ${user.id}:`, err.message);
    }
  }

  console.log(
    `[Scheduler] ${kind} summary done: sent=${result.sent} skipped=${result.skipped} failed=${result.failed}`
  );

  return result;
}

function startScheduler() {
  const timezone = process.env.TIMEZONE || 'Asia/Bangkok';
  const dailyCron = process.env.DAILY_SUMMARY_CRON || '0 22 * * *';
  const weeklyCron = process.env.WEEKLY_SUMMARY_CRON || '0 23 * * 0'; // Sunday 23:00

  cron.schedule(dailyCron, () => {
    console.log('[Scheduler] Sending daily P&L summary...');
    return sendSummaries('daily');
  }, { timezone });

  cron.schedule(weeklyCron, () => {
    console.log('[Scheduler] Sending weekly P&L summary...');
    return sendSummaries('weekly');
  }, { timezone });

  console.log(`[Scheduler] Daily summary scheduled: ${dailyCron}`);
  console.log(`[Scheduler] Weekly summary scheduled: ${weeklyCron}`);
}

module.exports = { startScheduler, sendSummaries, buildSummaryMessage };
