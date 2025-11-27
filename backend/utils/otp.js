const twilio = require('twilio');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendOtpViaTwilio(phone, code) {
  // For demo - log code in server console if Twilio not set
  if (!process.env.TWILIO_SID) {
    console.log(`[OTP] ${phone} -> ${code}`);
    return;
  }
  return client.messages.create({
    body: `Your Rento verification code is ${code}`,
    from: process.env.TWILIO_FROM_NUMBER,
    to: phone
  });
}

module.exports = { sendOtpViaTwilio };
      