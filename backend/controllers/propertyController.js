import Property from "../models/Property.js";

export const addProperty = async (req, res) => {
  try {
    const newProperty = await Property.create(req.body);
    res.json(newProperty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProperties = async (req, res) => {
  try {
    const list = await Property.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
