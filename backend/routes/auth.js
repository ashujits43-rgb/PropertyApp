import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendOtpViaTwilio } from "../utils/otp.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "verysecret";

// Store OTPs in memory (use Redis/DB in production)
const otps = {};

// Request OTP -> create user if not exists -> send OTP
router.post("/request-otp", async (req, res) => {
  try {
    const { phone, name } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "phone required" });
    }

    // Create user if not exists
    let user = await User.findOne({ phone });
    if (!user) user = await User.create({ phone, name });

    // Generate OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otps[phone] = { code, expires: Date.now() + 5 * 60 * 1000 };

    // Send OTP
    await sendOtpViaTwilio(phone, code);

    res.json({ ok: true, msg: "OTP sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: "phone & code required" });
    }

    const record = otps[phone];
    if (!record || record.code !== code || record.expires < Date.now()) {
      return res.status(400).json({ error: "invalid or expired otp" });
    }

    const user = await User.findOneAndUpdate(
      { phone },
      { isVerified: true },
      { new: true }
    );

    const token = jwt.sign(
      { id: user._id, phone: user.phone },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    delete otps[phone];

    res.json({
      ok: true,
      token,
      user: { id: user._id, phone: user.phone, name: user.name }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// Auth middleware
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "no token" });

  const token = header.split(" ")[1];
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  } catch (err) {
    return res.status(401).json({ error: "invalid token" });
  }
};

// Example protected route
router.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash");
  res.json({ user });
});

export default router;
