import express from "express";
import { addProperty, getProperties } from "../controllers/propertyController.js";

const router = express.Router();

router.post("/add", addProperty);
router.get("/list", getProperties);

export default router;
