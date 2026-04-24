const axios = require('axios');

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendAdminOtp(chatId, otp) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) {
    console.warn(`Admin OTP generated but Telegram is not configured. OTP: ${otp}`);
    return;
  }

  await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
    chat_id: chatId,
    text: `Academic Repository admin OTP: ${otp}. It expires in 5 minutes.`
  });
}

module.exports = { generateOtp, sendAdminOtp };
