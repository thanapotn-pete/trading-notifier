const axios = require('axios');

// Uses LINE Messaging API (LINE Notify was discontinued March 2025)
// Setup: https://developers.line.biz/console → create Messaging API channel
// Required env vars: LINE_CHANNEL_ACCESS_TOKEN, LINE_USER_ID
async function sendLine(message) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const userId = process.env.LINE_USER_ID;
  if (!token) throw new Error('LINE_CHANNEL_ACCESS_TOKEN not set');
  if (!userId) throw new Error('LINE_USER_ID not set');

  await axios.post(
    'https://api.line.me/v2/bot/message/push',
    {
      to: userId,
      messages: [{ type: 'text', text: message }],
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

module.exports = { sendLine };
