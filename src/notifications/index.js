const { sendTelegram } = require('./telegram');

async function notify(message, chatId) {
  await sendTelegram(message, chatId);
}

module.exports = { notify };
