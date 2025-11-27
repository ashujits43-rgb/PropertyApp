const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOtpViaTwilio } = require('../utils/otp');

const JWT_SECRET = process.env.JWT_SECRET || 'verysecret';

// Request OTP -> create user if not exist and send OTP code (store code in memory or DB)
const otps = {}; // in-memory store for demo (use Redis/DB in prod)

router.post('/request-otp', async (req, res) => {
  try {
    const { phone, name } = req.body;
    if (!phone) return res.status(400).json({ error: 'phone required' });
    // create user if not exists
    let user = await User.findOne({ phone });
    if (!user) user = await User.create({ phone, name });

    // generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otps[phone] = { code, expires: Date.now() + 5*60*1000 };
    // send via Twilio (or mock)
    await sendOtpViaTwilio(phone, code);
    return res.json({ ok: true, msg: 'OTP sent' });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'server error' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ error: 'phone & code required' });
    const record = otps[phone];
    if (!record || record.code !== code || record.expires < Date.now()) {
      return res.status(400).json({ error: 'invalid or expired otp' });
    }
    // mark user verified
    const user = await User.findOneAndUpdate({ phone }, { isVerified: true }, { new: true });
    const token = jwt.sign({ id: user._id, phone: user.phone }, JWT_SECRET, { expiresIn: '30d' });
    delete otps[phone];
    res.json({ ok: true, token, user: { id: user._id, phone: user.phone, name: user.name } });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'server error' });
  }
});

// optional: protected route example
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'no token' });
  const token = header.split(' ')[1];
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
};

router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  res.json({ user });
});

module.exports = router;
