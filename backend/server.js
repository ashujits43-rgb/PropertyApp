import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import propertyRoutes from "./routes/propertyRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Health check (Render uses this)
app.get("/healthz", (req, res) => res.send("OK"));

// Property API routes
app.use("/api/properties", propertyRoutes);

const PORT = process.env.PORT || 8080;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log("Server running on port " + PORT));
  })
  .catch((err) => console.log(err));
