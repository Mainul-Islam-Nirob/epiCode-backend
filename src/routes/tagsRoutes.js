import express from "express";
import {
  listTags,
  createTag,
  updateTag,
  deleteTag,
} from "../controllers/tagsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public: list all tags
router.get("/", listTags);

// Protected: admin-only (create, update, delete)
router.post("/", authMiddleware, requireRole("admin"), createTag);
router.put("/:id", authMiddleware, requireRole("admin"), updateTag);
router.delete("/:id", authMiddleware, requireRole("admin"), deleteTag);

export default router;
