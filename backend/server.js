require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => {
    console.error("DB Error:", err.message);
    process.exit(1);
  });

const User = mongoose.model("User", new mongoose.Schema({
  phone: { type: String, unique: true, required: true },
  name: String,
  userType: { type: String, default: "owner" }
}));

const Property = mongoose.model("Property", new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  price: Number,
  location: String
}));

app.get("/", (req, res) => res.send("Rento Backend LIVE"));

app.post("/api/auth/profile", async (req, res) => {
  const { phone, name, userType = "owner" } = req.body;
  if (!phone || !name) return res.status(400).json({ msg: "Phone & name required" });

  try {
    let user = await User.findOne({ phone });
    if (!user) user = await new User({ phone, name, userType }).save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

app.get("/api/properties/my", async (req, res) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const properties = await Property.find({ owner: decoded.id });
    res.json(properties);
  } catch (e) {
    res.status(400).json({ msg: "Invalid token" });
  }
});

app.post("/api/properties", async (req, res) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).json({ msg: "No token" });

  const { title, price, location } = req.body;
  if (!title || !price || !location) return res.status(400).json({ msg: "Fill all" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const property = await new Property({ owner: decoded.id, title, price: Number(price), location }).save();
    res.json(property);
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
