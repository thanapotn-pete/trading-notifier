const { sendTelegram } = require('./telegram');

async function notify(message) {
  await sendTelegram(message);
}

module.exports = { notify };
