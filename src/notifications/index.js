const { sendTelegram } = require('./telegram');
const { sendLine } = require('./line');

async function notify(message) {
  const results = await Promise.allSettled([
    sendTelegram(message),
    sendLine(message),
  ]);

  results.forEach((r, i) => {
    const channel = i === 0 ? 'Telegram' : 'LINE';
    if (r.status === 'rejected') {
      console.error(`[${channel}] Failed:`, r.reason.message);
    }
  });
}

module.exports = { notify };
