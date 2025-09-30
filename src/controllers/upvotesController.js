import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Toggle Upvote
 * - If user has already upvoted, remove it
 * - Otherwise, create a new upvote
 */
export const toggleUpvote = async (req, res) => {
  try {
    const { postId, userId, anonId } = req.body;

    if (!postId || (!userId && !anonId)) {
      return res.status(400).json({ error: "postId and either userId or anonId are required" });
    }

    let existingUpvote;

    if (userId) {
      // Search using composite key postId+userId
      existingUpvote = await prisma.upvote.findUnique({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });
    } else {
      // Search using composite key postId+anonId
      existingUpvote = await prisma.upvote.findUnique({
        where: {
          postId_anonId: {
            postId,
            anonId,
          },
        },
      });
    }

    if (existingUpvote) {
      // Remove upvote
      await prisma.upvote.delete({
        where: { id: existingUpvote.id },
      });
      return res.json({ message: "Upvote removed" });
    }

    // Create new upvote
    const newUpvote = await prisma.upvote.create({
      data: {
        postId,
        userId: userId || null,
        anonId: anonId || null,
      },
    });

    return res.json({ message: "Upvote added", upvote: newUpvote });
  } catch (err) {
    console.error("toggleUpvote err:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUpvotes = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, anonId } = req.query; // pass ?userId= or ?anonId= in URL

    if (!postId) {
      return res.status(400).json({ error: "postId is required" });
    }

    // Count total upvotes for this post
    const totalUpvotes = await prisma.upvote.count({
      where: { postId },
    });

    let hasUpvoted = false;

    if (userId) {
      const existing = await prisma.upvote.findUnique({
        where: {
          postId_userId: { postId, userId },
        },
      });
      hasUpvoted = !!existing;
    } else if (anonId) {
      const existing = await prisma.upvote.findUnique({
        where: {
          postId_anonId: { postId, anonId },
        },
      });
      hasUpvoted = !!existing;
    }

    return res.json({ postId, totalUpvotes, hasUpvoted });
  } catch (err) {
    console.error("getUpvotes err:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};