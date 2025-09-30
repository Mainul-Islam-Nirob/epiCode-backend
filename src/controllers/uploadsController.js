import { PrismaClient } from "@prisma/client";
import { uploadToCloudinary } from "../utils/cloudinary.js";
const prisma = new PrismaClient();

export const uploadImage = async (req, res) => {
  try {
    const { postId } = req.body; // optional: link image to a post

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    let imageUrl;

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      imageUrl = await uploadToCloudinary(req.file.path);
    } else {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Create Image record in DB and link to post if provided
    const imageData = {
      url: imageUrl,
      postId: postId || null,
    };

    const image = await prisma.image.create({ data: imageData });

    res.status(201).json({
      data: {
        id: image.id,
        url: image.url,
        postId: image.postId,
      },
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Image upload failed" });
  }
};
