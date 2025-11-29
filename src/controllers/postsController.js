import { PrismaClient } from "@prisma/client";
import slugify from "slugify";
import { uploadBufferToCloudinary } from "../utils/cloudinary.js";


const prisma = new PrismaClient();


/**
 * Helper: compute read time in minutes from content (words / 200)
 * Accepts a string (markdown/html/text)
 */
const computeReadTime = (content = "") => {
  const words = content
    .replace(/(<([^>]+)>)/gi, " ") // remove html tags if present
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

/**
 * Helper: ensure tags exist and return their ids
 * Accepts array of tag names (strings)
 */
const getOrCreateTags = async (tagNames = []) => {
  if (!tagNames || tagNames.length === 0) return [];

  const tagIds = [];
  for (const raw of tagNames) {
    const name = String(raw).trim().toLowerCase();
    if (!name) continue;

    let tag = await prisma.tag.findUnique({ where: { name } });
    if (!tag) {
      tag = await prisma.tag.create({ data: { name } });
    }
    tagIds.push(tag.id);
  }
  return tagIds;
};

/**
 * GET /api/posts
 * Query params:
 * - q (search in title/content)
 * - tags (comma separated tag names)
 * - published=true|false
 * - latest=true (sort by createdAt desc)
 * - page, limit
 */
export const listPosts = async (req, res) => {
  try {
    const {
      q,
      tags, // comma separated names
      published,
      latest,
      page = 1,
      limit = 10,
    } = req.query;

    const take = Math.min(parseInt(limit, 10) || 10, 50);
    const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

    const where = {};

    if (published !== undefined) {
      where.published = published === "true";
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ];
    }

    // If tags provided, filter posts that have ANY of these tags
    let postIdsWithTags = null;
    if (tags) {
      const tagNames = tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
      if (tagNames.length) {
        const foundTags = await prisma.tag.findMany({
          where: { name: { in: tagNames } },
          select: { id: true },
        });
        if (foundTags.length) {
          const postTags = await prisma.postTag.findMany({
            where: { tagId: { in: foundTags.map((t) => t.id) } },
            select: { postId: true },
          });
          postIdsWithTags = postTags.map((pt) => pt.postId);
          // If none match, return empty
          if (!postIdsWithTags.length) {
            return res.json({ data: [], meta: { page, limit, total: 0 } });
          }
          where.id = { in: postIdsWithTags };
        } else {
          return res.json({ data: [], meta: { page, limit, total: 0 } });
        }
      }
    }

    const orderBy = latest === "true" ? { createdAt: "desc" } : { createdAt: "desc" };

    const [total, posts] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        orderBy,
        take,
        skip,
        include: {
          author: { select: { id: true, name: true, email: true } },
          // include tag relations via PostTag -> Tag
          tags: {
            include: { tag: true },
          },
          _count: { select: { upvotes: true, comments: true } },
        },
      }),
    ]);

    // normalize tags array to names and get upvote/comment counts
    const data = posts.map((p) => ({
      id: p.id,
      title: p.title,
      excerpt: p.excerpt || (p.content ? p.content.slice(0, 300) : ""),
      image: p.image,
      published: p.published,
      readTime: p.readTime,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      author: p.author,
      tags: p.tags.map((pt) => pt.tag.name),
      counts: {
        upvotes: p._count?.upvotes || 0,
        comments: p._count?.comments || 0,
      },
    }));

    res.json({ data, meta: { page: Number(page), limit: take, total } });
  } catch (err) {
    console.error("listPosts err:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * GET /api/posts/:id
 * include tags, author, comments, upvote count
 */
export const getPostById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "Invalid post id" });

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        tags: { include: { tag: true } },
        comments: {
          include: { user: true },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { upvotes: true, comments: true } },
      },
    });

    if (!post) return res.status(404).json({ error: "Post not found" });

    const result = {
      id: post.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      image: post.image,
      published: post.published,
      readTime: post.readTime,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
      tags: post.tags.map((pt) => pt.tag.name),
      counts: {
        upvotes: post._count?.upvotes || 0,
        comments: post._count?.comments || 0,
      },
      comments: post.comments.map((c) => ({
        id: c.id,
        content: c.content,
        author: c.user
          ? { id: c.user.id, name: c.user.name, email: c.user.email }
          : c.name
          ? { name: c.name, email: c.email || null }
          : null, // handle anonymous comments too
        createdAt: c.createdAt,
      })),
    };

    res.json({ data: result });
  } catch (err) {
    console.error("getPostById err:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// export const getPostById = async (req, res) => {
//   try {
//     const id = req.params.id;
//     if (!id) return res.status(400).json({ error: "Invalid post id" });

//     const post = await prisma.post.findUnique({
//       where: { id },
//       include: {
//         author: { select: { id: true, name: true, email: true } },
//         tags: { include: { tag: true } },
//         comments: {
//           include: { user: true },
//           orderBy: { createdAt: "asc" },
//         },
//         _count: { select: { upvotes: true, comments: true } },
//       },
//     });

//     if (!post) return res.status(404).json({ error: "Post not found" });

//     const result = {
//       id: post.id,
//       title: post.title,
//       content: post.content,
//       excerpt: post.excerpt,
//       image: post.image,
//       published: post.published,
//       readTime: post.readTime,
//       createdAt: post.createdAt,
//       updatedAt: post.updatedAt,
//       author: post.author,
//       tags: post.tags.map((pt) => pt.tag.name),
//       counts: {
//         upvotes: post._count?.upvotes || 0,
//         comments: post._count?.comments || 0,
//       },
//       comments: post.comments.map((c) => ({
//         id: c.id,
//         content: c.content,
//         author: c.author ? { id: c.author.id, name: c.author.name, email: c.author.email } : null,
//         createdAt: c.createdAt,
//       })),
//     };

//     res.json({ data: result });
//   } catch (err) {
//     console.error("getPostById err:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

/**
 * POST /api/posts
 * Protected: any authenticated user becomes the author
 * Body: { title, content, tags: [names], image, published, excerpt, readTime (optional) }
 */
export const createPost = async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ error: "Unauthorized" });

    const { title, content, tags = [], published = false, excerpt, readTime } = req.body;

    if (!title || !content) return res.status(400).json({ error: "title and content required" });

    const computedReadTime = readTime || computeReadTime(content);
    
    let imageUrl = null;
    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    // create post
    const post = await prisma.post.create({
      data: {
        title,
        content,
        image: imageUrl,
        published,
        excerpt,
        readTime: computedReadTime,
        authorId: req.user.id,
      },
    });

    // handle tags
    const tagIds = await getOrCreateTags(tags);
    if (tagIds.length) {
      const postTagCreates = tagIds.map((tagId) => prisma.postTag.create({ data: { postId: post.id, tagId } }));
      await Promise.all(postTagCreates);
    }

    res.status(201).json({ data: { id: post.id } });
  } catch (err) {
    console.error("createPost err:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * PUT /api/posts/:id
 * Edit post - only author can edit
 */
export const updatePost = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });

    const id = req.params.id;
    const existing = await prisma.post.findUnique({ where: { id }, include: { tags: true } });
    if (!existing) return res.status(404).json({ error: "Post not found" });
    if (existing.authorId !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    const { title, content, tags = [], published, excerpt, readTime } = req.body;
    const newReadTime = readTime || (content ? computeReadTime(content) : existing.readTime);

    let imageUrl = existing.image;
    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        content: content ?? existing.content,
        image: imageUrl,
        published: published ?? existing.published,
        readTime: newReadTime,
        excerpt: excerpt ?? existing.excerpt,
      },
    });

    if (Array.isArray(tags)) {
      await prisma.postTag.deleteMany({ where: { postId: id } });
      const tagIds = await getOrCreateTags(tags);
      await Promise.all(tagIds.map((tagId) =>
        prisma.postTag.create({ data: { postId: id, tagId } })
      ));
    }

    res.json({ data: { id: updated.id } });
  } catch (err) {
    console.error("updatePost err:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * DELETE /api/posts/:id
 * Only author can delete
 */
export const deletePost = async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ error: "Unauthorized" });

    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "Invalid post id" });

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Post not found" });

    if (existing.authorId !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    // delete postTag, comments, upvotes, then post (transaction)
    await prisma.$transaction([
      prisma.postTag.deleteMany({ where: { postId: id } }),
      prisma.comment.deleteMany({ where: { postId: id } }),
      prisma.upvote.deleteMany({ where: { postId: id } }),
      prisma.post.delete({ where: { id } }),
    ]);

    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("deletePost err:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * PATCH /api/posts/:id/publish
 * Toggle or set published state. Only author can publish/unpublish.
 * Body: { published: true/false } optional: toggle if not provided.
 */
export const togglePublish = async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ error: "Unauthorized" });

    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "Invalid post id" });

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Post not found" });

    if (existing.authorId !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    const { published } = req.body;
    const newPublished = typeof published === "boolean" ? published : !existing.published;

    const updated = await prisma.post.update({
      where: { id },
      data: { published: newPublished },
    });

    res.json({ data: { id: updated.id, published: updated.published } });
  } catch (err) {
    console.error("togglePublish err:", err);
    res.status(500).json({ error: "Server error" });
  }
};
