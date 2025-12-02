import express from "express";
import Property from "../models/Property.js";

const router = express.Router();

// Get all properties
router.get("/", async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

// Create a property
router.post("/", async (req, res) => {
  try {
    const newProperty = new Property(req.body);
    await newProperty.save();
    res.json({ message: "Property created successfully", property: newProperty });
  } catch (error) {
    res.status(500).json({ error: "Failed to create property" });
  }
});

export default router;
