const TelegramBot = require('node-telegram-bot-api');

let bot = null;

function getBot() {
  if (!bot) {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
  }
  return bot;
}

async function sendTelegram(message, chatId) {
  if (!chatId) throw new Error('chatId is required');
  await getBot().sendMessage(chatId, message, { parse_mode: 'HTML' });
}

module.exports = { sendTelegram };
