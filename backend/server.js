import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import propertyRoutes from "./routes/propertyRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// CONNECT MONGODB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("Mongo ERROR:", err));

// ROUTES
app.use("/api/property", propertyRoutes);

app.get("/", (req, res) => {
  res.send("Rento Backend Running...");
});

// SERVER START
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
