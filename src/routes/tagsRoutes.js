import express from "express";
import {
  listTags,
  createTag,
  updateTag,
  deleteTag,
} from "../controllers/tagsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: list all tags
router.get("/", listTags);

// Protected: admin-only (create, update, delete)
router.post("/", authMiddleware, createTag);
router.put("/:id", authMiddleware, updateTag);
router.delete("/:id", authMiddleware, deleteTag);

export default router;
