import express from "express";
import {
  listComments,
  createComment,
  updateComment,
  deleteComment,
  reactToComment,
} from "../controllers/commentsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// List comments for a post (threaded)
router.get("/posts/:postId/comments", listComments);

// Create comment (allow anon or logged-in user)
router.post("/posts/:postId/comments", createComment);

// Edit comment (only author or admin)
router.put("/comments/:id", authMiddleware, updateComment);

// Delete comment (only author or admin)
router.delete("/comments/:id", authMiddleware, deleteComment);

// React to comment (like/love/upvote)
router.post("/comments/:id/react", reactToComment);

export default router;
