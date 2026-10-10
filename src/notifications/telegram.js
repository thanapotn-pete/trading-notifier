// Sends a message through the Telegram Bot API (https://core.telegram.org/bots/api#sendmessage).
// Plain fetch — Node 18+ has it built in, so no bot library is needed.

const REQUEST_TIMEOUT_MS = 15000;

async function sendTelegram(message, chatId) {
  if (!chatId) throw new Error('chatId is required');

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN must be set');

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });

  let data = null;
  try { data = await response.json(); } catch { /* non-JSON error page */ }

  if (!response.ok || !data || data.ok !== true) {
    // The URL contains the token — never put it in the error
    const reason = data?.description || `HTTP ${response.status}`;
    throw new Error(`Telegram sendMessage failed: ${reason}`);
  }
}

module.exports = { sendTelegram };
