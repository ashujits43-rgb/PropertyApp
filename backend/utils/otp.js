import twilio from "twilio";

const client = process.env.TWILIO_SID
  ? twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export async function sendOtpViaTwilio(phone, code) {
  // If Twilio keys not provided → only log OTP
  if (!client) {
    console.log(`[OTP] ${phone} → ${code}`);
    return;
  }

  return client.messages.create({
    body: `Your Rento verification code is ${code}`,
    from: process.env.TWILIO_FROM_NUMBER,
    to: phone,
  });
}
