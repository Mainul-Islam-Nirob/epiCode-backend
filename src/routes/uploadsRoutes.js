import express from "express";
import upload from "../utils/multer.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { uploadImage } from "../controllers/uploadsController.js";

const router = express.Router();

// POST /api/uploads
router.post("/", authMiddleware, upload.single("image"), uploadImage);

export default router;
