const cron = require('node-cron');
const { getDailySummary } = require('./pnl/tracker');
const { notify } = require('./notifications');

function buildSummaryMessage(summary) {
  const { date, totalTrades, wins, losses, totalPnl } = summary;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : '0.0';
  const pnlSign = totalPnl >= 0 ? '+' : '';
  const resultEmoji = totalPnl >= 0 ? '📈' : '📉';

  return [
    `${resultEmoji} <b>สรุปผลการเทรดวันนี้</b>`,
    `วันที่: ${date}`,
    `จำนวน Trade: ${totalTrades}`,
    `ชนะ: ${wins} | แพ้: ${losses}`,
    `Win Rate: ${winRate}%`,
    `P&L รวม: <b>${pnlSign}${totalPnl.toFixed(2)}</b>`,
  ].join('\n');
}

function startScheduler() {
  const cronExpr = process.env.DAILY_SUMMARY_CRON || '0 22 * * *';

  cron.schedule(cronExpr, async () => {
    console.log('[Scheduler] Sending daily P&L summary...');
    const summary = await getDailySummary();
    if (summary.totalTrades === 0) {
      await notify('📊 วันนี้ไม่มี Trade ที่ปิดแล้ว');
      return;
    }
    await notify(buildSummaryMessage(summary));
  }, { timezone: process.env.TIMEZONE || 'Asia/Bangkok' });

  console.log(`[Scheduler] Daily summary scheduled: ${cronExpr}`);
}

module.exports = { startScheduler };
