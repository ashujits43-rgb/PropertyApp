const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: String,
  email: String,
  passwordHash: String, // optional if password used
  isVerified: { type: Boolean, default: false }, // verified via OTP/KYC
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
