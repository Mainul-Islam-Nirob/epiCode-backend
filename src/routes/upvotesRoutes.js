import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { toggleUpvote, getUpvotes } from "../controllers/upvotesController.js";

const router = express.Router();

// Toggle upvote for a post
router.post("/:id/upvote", authMiddleware, toggleUpvote);

// Get upvote count + current user/anon status
router.get("/:id/upvotes", authMiddleware, getUpvotes);

export default router;
