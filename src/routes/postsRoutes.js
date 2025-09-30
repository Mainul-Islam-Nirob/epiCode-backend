import express from "express";
import {
  listPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  togglePublish,
} from "../controllers/postsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: list & view
router.get("/", listPosts);
router.get("/:id", getPostById);

// Protected: create, update, delete, publish toggle
router.post("/", authMiddleware, createPost);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);
router.patch("/:id/publish", authMiddleware, togglePublish);

export default router;
