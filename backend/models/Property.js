import mongoose from "mongoose";

const PropertySchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    price: Number,
    location: String,
    images: [String],
  },
  { timestamps: true }
);

export default mongoose.model("Property", PropertySchema);
