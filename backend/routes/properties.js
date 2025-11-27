import express from "express";
import auth from "../middleware/auth.js";
import Property from "../models/Property.js";

const router = express.Router();

// CREATE PROPERTY
router.post("/", auth, async (req, res) => {
  try {
    const { title, price, location, image } = req.body;

    if (!title || !price || !location) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const property = new Property({
      title,
      price,
      location,
      image,            // <–– CLOUDINARY URL COMES HERE
      owner: req.user.id,
    });

    await property.save();
    res.json(property);
  } catch (err) {
    console.error("Create Property Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET PROPERTIES BY OWNER
router.get("/my", auth, async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user.id });
    res.json(properties);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
