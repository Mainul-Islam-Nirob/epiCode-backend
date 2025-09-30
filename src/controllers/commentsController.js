import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// GET /api/posts/:postId/comments
export const listComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { postId, parentId: null },
      include: {
        replies: {
          include: { replies: true }, // nested threading
        },
        reactions: true,
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({ data: comments });
  } catch (err) {
    console.error("listComments err:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// POST /api/posts/:postId/comments
export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentId, name, email } = req.body;

    if (!content) return res.status(400).json({ error: "Content required" });

    // Build data object
    const data = {
      content,
      post: { connect: { id: postId } }, // connect to post
      parent: parentId ? { connect: { id: parentId } } : undefined, // <-- use 'parent' now
    };

    if (req.user) {
      data.user = { connect: { id: req.user.id } }; // logged-in user
    } else {
      if (!name || !email) {
        return res.status(400).json({ error: "Name and email required for anonymous comment" });
      }
      data.name = name;
      data.email = email;
    }

    const comment = await prisma.comment.create({ data });

    res.status(201).json({
      data: {
        id: comment.id,
        createdAt: comment.createdAt,
      },
    });
  } catch (err) {
    console.error("createComment err:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// PUT /api/comments/:id
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) return res.status(404).json({ error: "Comment not found" });

const post = await prisma.post.findUnique({ where: { id: comment.postId } });

const isAuthorOfPost = post?.authorId === req.user.id;
const isAdmin = req.user.role === "admin";
const isCommentOwner = comment.userId === req.user.id;

if (!isAdmin && !isCommentOwner && !(req.user.role === "author" && isAuthorOfPost)) {
  return res.status(403).json({ error: "Forbidden" });
}
    const updated = await prisma.comment.update({
      where: { id },
      data: { content },
    });

    res.json({ data: updated });
  } catch (err) {
    console.error("updateComment err:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE /api/comments/:id
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) return res.status(404).json({ error: "Comment not found" });

const post = await prisma.post.findUnique({ where: { id: comment.postId } });

const isAuthorOfPost = post?.authorId === req.user.id;
const isAdmin = req.user.role === "admin";
const isCommentOwner = comment.userId === req.user.id;

if (!isAdmin && !isCommentOwner && !(req.user.role === "author" && isAuthorOfPost)) {
  return res.status(403).json({ error: "Forbidden" });
}

    await prisma.comment.delete({ where: { id } });
    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error("deleteComment err:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// POST /api/comments/:id/react
export const reactToComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, anonId } = req.body;

    if (!type) return res.status(400).json({ error: "Reaction type required" });

    let data = {
      type,
      commentId: id,
    };

    if (req.user) {
      data.userId = req.user.id;
    } else if (anonId) {
      data.anonId = anonId;
    } else {
      return res.status(400).json({ error: "Must provide userId or anonId" });
    }

    const reaction = await prisma.commentReaction.upsert({
      where: {
        // unique constraint ensures one reaction per user/anon
        commentId_userId: data.userId ? { commentId: id, userId: data.userId } : undefined,
        commentId_anonId: data.anonId ? { commentId: id, anonId: data.anonId } : undefined,
      },
      update: { type },
      create: data,
    });

    res.status(201).json({ data: reaction });
  } catch (err) {
    console.error("reactToComment err:", err);
    res.status(500).json({ error: "Server error" });
  }
};
