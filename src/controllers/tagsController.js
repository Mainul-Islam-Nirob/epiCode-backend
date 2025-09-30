import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


// GET /api/tags
export const listTags = async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
    });
    res.json({ data: tags });
  } catch (err) {
    console.error("listTags err:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// POST /api/tags (protected)
export const createTag = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Tag name is required" });

    const existing = await prisma.tag.findUnique({ where: { name } });
    if (existing) return res.status(400).json({ error: "Tag already exists" });

    const tag = await prisma.tag.create({ data: { name } });
    res.status(201).json({ data: tag });
  } catch (err) {
    console.error("createTag err:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// PUT /api/tags/:id (protected)
export const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: "Tag name is required" });

    const tag = await prisma.tag.update({
      where: { id },
      data: { name },
    });

    res.json({ data: tag });
  } catch (err) {
    console.error("updateTag err:", err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Tag not found" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE /api/tags/:id (protected)
export const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.tag.delete({ where: { id } });

    res.json({ message: "Tag deleted" });
  } catch (err) {
    console.error("deleteTag err:", err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Tag not found" });
    }
    res.status(500).json({ error: "Server error" });
  }
};
