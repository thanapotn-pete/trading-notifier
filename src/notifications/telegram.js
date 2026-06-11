const TelegramBot = require('node-telegram-bot-api');

let bot = null;

function getBot() {
  if (!bot) {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
  }
  return bot;
}

async function sendTelegram(message) {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) throw new Error('TELEGRAM_CHAT_ID not set');
  await getBot().sendMessage(chatId, message, { parse_mode: 'HTML' });
}

module.exports = { sendTelegram };
