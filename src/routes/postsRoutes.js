import express from "express";
import {
  listPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  togglePublish,
} from "../controllers/postsController.js";
import upload from "../utils/multer.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public: list & view
router.get("/", listPosts);
router.get("/:id", getPostById);

// Protected: create, update, delete, publish toggle
router.post("/", authMiddleware, upload.single("image"), createPost);
router.put("/:id", authMiddleware, upload.single("image"), updatePost);
router.delete("/:id", authMiddleware, deletePost);
router.patch("/:id/publish", authMiddleware, togglePublish);

export default router;
