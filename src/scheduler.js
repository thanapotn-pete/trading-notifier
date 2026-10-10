// scheduler.js — งานตั้งเวลา (cron)
// ส่ง "สรุปผลเทรด" รายวัน (ทุกวัน) และรายสัปดาห์ (ทุกวันอาทิตย์) ให้ผู้ใช้ทาง Telegram
// ข้ามผู้ใช้ที่ปิดสวิตช์สรุปไว้ในหน้า "การแจ้งเตือน" ถูกเรียกครั้งเดียวตอนเซิร์ฟเวอร์เริ่มทำงาน
// (server.js)
const cron = require('node-cron');  // ไลบรารีตั้งเวลารันงานตามรูปแบบ cron
const { getPeriodSummary } = require('./pnl/tracker');  // คำนวณสรุปกำไร/ขาดทุนในช่วงวันที่กำหนด (จากตาราง trades)
const { notify } = require('./notifications');  // ส่งข้อความ Telegram
const { listUsers } = require('./users');  // รายชื่อผู้ใช้ที่ active และมี Telegram chat id
const { getNotificationSettings } = require('./notification-settings');  // การตั้งค่าแจ้งเตือนของผู้ใช้ (สวิตช์ต่าง ๆ)

// สร้างข้อความสรุป (รูปแบบ HTML ของ Telegram) จากตัวเลข: จำนวนเทรด, ชนะ/แพ้, Win Rate,
// กำไรสุทธิ
function buildSummaryMessage(summary, { title, rangeLabel }) {
  const { totalTrades, wins, losses, totalPnl } = summary;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : '0.0';  // Win Rate = เทรดที่ชนะ ÷ ทั้งหมด × 100 (ถ้าไม่มีเทรดให้เป็น 0 กันหารด้วยศูนย์)
  const pnlSign = totalPnl >= 0 ? '+' : '';
  const resultEmoji = totalPnl >= 0 ? '📈' : '📉';  // กำไร = 📈  ขาดทุน = 📉

  return [
    `${resultEmoji} <b>${title}</b>`,
    rangeLabel,
    `Trades: ${totalTrades}`,
    `Wins: ${wins} | Losses: ${losses}`,
    `Win Rate: ${winRate}%`,
    `Total P&L: <b>${pnlSign}${totalPnl.toFixed(2)}</b>`,
  ].join('\n');
}

// [สรุป] ตั้งค่าของสรุปแต่ละชนิด: daily = ย้อนหลัง 1 วัน, weekly = 7 วัน
// ต่างกันแค่ช่วงเวลา สวิตช์ที่ผู้ใช้เปิด/ปิด และข้อความ จึงใช้ฟังก์ชันส่งตัวเดียวกัน
// The two summaries differ only in the period, the user's switch and the wording
const SUMMARIES = {
  daily: {
    days: 1,
    switchKey: 'notify_daily_summary',  // ชื่อคอลัมน์สวิตช์ในตาราง notification_settings
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

// [สรุป] ส่งสรุปให้ผู้ใช้ทุกคน "ทีละคน" แยกกัน: คนที่ปิดสวิตช์ → ข้าม, คนที่เปิด → ส่ง
// ถ้าคนใดล้มเหลว (เช่น บล็อกบอท) จะไม่กระทบคนถัดไป
// คืนค่าสถิติ { sent, skipped, failed } ไว้ดู log
// One user's failure (blocked the bot, Supabase hiccup...) must not stop the
// summaries of everyone after them, so each user is handled on its own.
async function sendSummaries(kind) {
  const config = SUMMARIES[kind];
  const result = { sent: 0, skipped: 0, failed: 0 };

  let users;
  try {
    users = await listUsers();  // โหลดรายชื่อผู้ใช้ (ถ้าโหลดไม่ได้ จบงานรอบนี้ ไม่ให้ทั้งระบบล้ม)
  } catch (err) {
    console.error(`[Scheduler] Could not load users for ${kind} summary:`, err.message);
    return result;
  }

  // วนทีละคน และแต่ละคนมี try/catch ของตัวเอง
  for (const user of users) {
    try {
      const settings = await getNotificationSettings(user.id);  // อ่านการตั้งค่าแจ้งเตือนของผู้ใช้คนนี้

      // Master switch off, or this summary switched off on the website
      if (settings.enabled === false || settings[config.switchKey] !== true) {
        result.skipped++;  // นับว่า "ข้าม" (ผู้ใช้ปิดแจ้งเตือนอยู่)
        continue;
      }

      const summary = await getPeriodSummary(user.id, config.days);  // คำนวณผลเทรดของผู้ใช้คนนี้ในช่วงที่กำหนด

      // ถ้าไม่มีเทรดที่ปิดในช่วงนี้ ส่งข้อความสั้น ๆ แทนตัวเลขสรุป
      const message = summary.totalTrades === 0
        ? config.empty
        : buildSummaryMessage(summary, {
            title: config.title,
            rangeLabel: config.range(summary),
          });

      await notify(message, user.telegram_chat_id);  // ส่งเข้า Telegram ของผู้ใช้คนนั้นเท่านั้น (ไม่ส่งรวมกลุ่ม)
      result.sent++;
    } catch (err) {
      result.failed++;  // นับว่า "ล้มเหลว" แล้ว log สาเหตุ แต่วนต่อไปคนถัดไป
      console.error(`[Scheduler] ${kind} summary failed for user ${user.id}:`, err.message);
    }
  }

  console.log(
    `[Scheduler] ${kind} summary done: sent=${result.sent} skipped=${result.skipped} failed=${result.failed}`
  );

  return result;
}

// ตั้งเวลางานทั้งสอง: cron expression อ่านจาก env เช่น "0 23 * * *" = ทุกวัน 23:00
// คำนวณตามเขตเวลา TIMEZONE (ค่าเริ่มต้น Asia/Bangkok)
function startScheduler() {
  const timezone = process.env.TIMEZONE || 'Asia/Bangkok';
  const dailyCron = process.env.DAILY_SUMMARY_CRON || '0 22 * * *';
  const weeklyCron = process.env.WEEKLY_SUMMARY_CRON || '0 23 * * 0'; // Sunday 23:00

  // งานรายวัน
  cron.schedule(dailyCron, () => {
    console.log('[Scheduler] Sending daily P&L summary...');
    return sendSummaries('daily');
  }, { timezone });

  // งานรายสัปดาห์
  cron.schedule(weeklyCron, () => {
    console.log('[Scheduler] Sending weekly P&L summary...');
    return sendSummaries('weekly');
  }, { timezone });

  console.log(`[Scheduler] Daily summary scheduled: ${dailyCron}`);
  console.log(`[Scheduler] Weekly summary scheduled: ${weeklyCron}`);
}

// ส่งออกให้ server.js เรียก startScheduler() และให้ส่วนอื่น/การทดสอบเรียกใช้ฟังก์ชันส่งสรุปได้
module.exports = { startScheduler, sendSummaries, buildSummaryMessage };
